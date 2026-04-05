/**
 * Removes `getTranslations` imports from "next-intl/server" and declarations
 * like `const t = await getTranslations("namespace")`, including Promise.all
 * pairs when the translation binding is unused.
 *
 * Default: only removes when the binding has no references (safe).
 * Use --force to remove declarations even if still referenced (will break build).
 *
 * Usage: pnpm exec tsx scripts/remove-get-translations.ts [--dry-run] [--force]
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import ts from "typescript";

const ROOT = join(import.meta.dirname, "..");
const DRY = process.argv.includes("--dry-run");
const FORCE = process.argv.includes("--force");

function walkTsFilesSync(dir: string, out: string[]): void {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkTsFilesSync(p, out);
    else if (name.endsWith(".ts") || name.endsWith(".tsx")) out.push(p);
  }
}

function isGetTranslationsCall(
  expr: ts.Expression,
  sourceFile: ts.SourceFile,
): expr is ts.CallExpression {
  if (!ts.isCallExpression(expr)) return false;
  return expr.expression.getText(sourceFile) === "getTranslations";
}

function isPromiseAllCall(expr: ts.Expression, sourceFile: ts.SourceFile): boolean {
  return expr.getText(sourceFile) === "Promise.all";
}

function getStringArg(call: ts.CallExpression): string | undefined {
  const a0 = call.arguments[0];
  return a0 && ts.isStringLiteral(a0) ? a0.text : undefined;
}

function declarationRefCount(
  checker: ts.TypeChecker,
  decl: ts.VariableDeclaration | ts.BindingElement,
  sourceFile: ts.SourceFile,
): number {
  let n = 0;
  function visit(node: ts.Node) {
    if (ts.isIdentifier(node)) {
      const s = checker.getSymbolAtLocation(node);
      if (s?.declarations?.includes(decl)) n++;
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return n;
}

function bindingIdentifier(
  el: ts.ArrayBindingElement,
): ts.Identifier | undefined {
  if (!ts.isBindingElement(el)) return undefined;
  if (ts.isIdentifier(el.name)) return el.name;
  return undefined;
}

function removeGetTranslationsImport(source: string): string {
  return source.replace(
    /import\s*\{([^}]*)\}\s*from\s*["']next-intl\/server["']\s*;?/g,
    (_full, inner: string) => {
      const parts = inner
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .filter((p) => !/^getTranslations(\s+as\s+\w+)?$/.test(p));
      if (parts.length === 0) return "";
      return `import { ${parts.join(", ")} } from "next-intl/server";`;
    },
  );
}

function finalizeImports(source: string): string {
  if (/\bgetTranslations\s*\(/.test(source)) return source;
  return removeGetTranslationsImport(source);
}

function processFile(
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile,
): { out: string; changed: boolean } {
  const edits: { start: number; end: number; text: string }[] = [];

  function shouldRemoveDecl(decl: ts.VariableDeclaration | ts.BindingElement): boolean {
    if (FORCE) return true;
    return declarationRefCount(checker, decl, sourceFile) <= 1;
  }

  function processVariableStatement(stmt: ts.VariableStatement) {
    for (const decl of stmt.declarationList.declarations) {
      if (!decl.initializer) continue;

      const rawInit = decl.initializer;
      let inner = rawInit;
      if (ts.isAwaitExpression(rawInit)) inner = rawInit.expression;

      if (ts.isCallExpression(inner) && isGetTranslationsCall(inner, sourceFile)) {
        if (!getStringArg(inner)) continue;
        if (!ts.isIdentifier(decl.name)) continue;
        if (!shouldRemoveDecl(decl)) continue;
        edits.push({ start: stmt.getStart(sourceFile), end: stmt.getEnd(), text: "" });
        return;
      }

      if (!ts.isAwaitExpression(rawInit) || !ts.isCallExpression(inner)) continue;
      if (!isPromiseAllCall(inner.expression, sourceFile)) continue;

      const promiseAll = inner;
      const arrArg = promiseAll.arguments[0];
      if (!arrArg || !ts.isArrayLiteralExpression(arrArg)) continue;
      if (!ts.isArrayBindingPattern(decl.name)) continue;

      const elems = arrArg.elements;
      const binds = decl.name.elements;
      if (elems.length !== binds.length) continue;

      const removeIdx: number[] = [];
      for (let i = 0; i < elems.length; i++) {
        const el = elems[i];
        const be = binds[i];
        if (!el || !ts.isBindingElement(be)) continue;
        if (!ts.isCallExpression(el) || !isGetTranslationsCall(el, sourceFile)) continue;
        if (!getStringArg(el)) continue;
        if (!shouldRemoveDecl(be)) continue;
        removeIdx.push(i);
      }

      if (removeIdx.length === 0) continue;

      const kept = elems
        .map((e, i) => ({ e, i }))
        .filter(({ i }) => !removeIdx.includes(i));
      const keptBindings = binds
        .map((b, i) => ({ b, i }))
        .filter(({ i }) => !removeIdx.includes(i));

      if (kept.length === 0) {
        edits.push({ start: stmt.getStart(sourceFile), end: stmt.getEnd(), text: "" });
        return;
      }

      if (kept.length === 1 && keptBindings.length === 1) {
        const expr = kept[0].e;
        const bid = bindingIdentifier(keptBindings[0].b);
        if (expr && bid) {
          edits.push({
            start: stmt.getStart(sourceFile),
            end: stmt.getEnd(),
            text: `const ${bid.text} = await ${expr.getText(sourceFile)};\n`,
          });
          return;
        }
      }

      const newArr = `[${kept.map(({ e }) => e.getText(sourceFile)).join(", ")}]`;
      const newPat = `[${keptBindings.map(({ b }) => b.getText(sourceFile)).join(", ")}]`;
      edits.push({
        start: stmt.getStart(sourceFile),
        end: stmt.getEnd(),
        text: `const ${newPat} = await Promise.all(${newArr});\n`,
      });
      return;
    }
  }

  function visit(node: ts.Node) {
    if (ts.isVariableStatement(node)) processVariableStatement(node);
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  const sourceText = sourceFile.getFullText();
  if (edits.length === 0) {
    const finalized = finalizeImports(sourceText);
    return { out: finalized, changed: finalized !== sourceText };
  }

  edits.sort((a, b) => b.start - a.start);
  let out = sourceText;
  for (const e of edits) {
    out = out.slice(0, e.start) + e.text + out.slice(e.end);
  }
  out = finalizeImports(out);
  return { out, changed: true };
}

const scanDirs = [join(ROOT, "app"), join(ROOT, "features"), join(ROOT, "shared")];
const files: string[] = [];
for (const d of scanDirs) walkTsFilesSync(d, files);

const configPath = ts.findConfigFile(ROOT, ts.sys.fileExists, "tsconfig.json");
if (!configPath) throw new Error("tsconfig.json not found");
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  dirname(configPath),
);
const program = ts.createProgram({
  rootNames: parsed.fileNames,
  options: parsed.options,
});
const checker = program.getTypeChecker();
const sortedFiles = files.sort();

let fileCount = 0;

for (const filePath of sortedFiles) {
  const sourceFile = program.getSourceFile(filePath);
  if (!sourceFile) continue;

  const { out, changed } = processFile(checker, sourceFile);
  if (!changed) continue;

  fileCount++;
  if (!DRY) writeFileSync(filePath, out, "utf8");
  console.log(
    `${DRY ? "[dry-run] " : ""}${filePath.replace(ROOT + "\\", "").replace(ROOT + "/", "")}`,
  );
}

console.log(`\nDone. ${fileCount} file(s) updated.${DRY ? " (no files written)" : ""}`);
