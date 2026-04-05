/**
 * Replaces next-intl single-arg string calls like t("key") with English literals
 * from merged `shared/i18n/messages/en` messages.
 *
 * Skips: t.rich, t.has, multi-arg (interpolation), non-literal first args.
 *
 * Usage: pnpm exec tsx scripts/inline-en-translations.ts [--dry-run] [--unwrap-jsx]
 *
 * --unwrap-jsx: replace {"literal"} children with plain text (no braces). Skips
 * JSX attributes (placeholder={"..."} stays valid).
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

import { messages } from "../shared/i18n/messages/en/index";

const ROOT = join(import.meta.dirname, "..");
const DRY = process.argv.includes("--dry-run");
const UNWRAP_JSX = process.argv.includes("--unwrap-jsx");

function isJsxChildrenTextSlot(jsxExpr: ts.JsxExpression): boolean {
  const p = jsxExpr.parent;
  return ts.isJsxElement(p) || ts.isJsxFragment(p);
}

function canUsePlainJsxText(value: string): boolean {
  return !/[<{]/.test(value);
}

function getNested(obj: unknown, path: string): unknown {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur === null || typeof cur !== "object" || !(p in cur)) return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function isTranslationCallee(
  expr: ts.Expression,
  sourceFile: ts.SourceFile,
): boolean {
  const text = expr.getText(sourceFile);
  return text === "useTranslations" || text === "getTranslations";
}

function isPromiseAllCallee(expr: ts.Expression, sourceFile: ts.SourceFile): boolean {
  return expr.getText(sourceFile) === "Promise.all";
}

function namespaceFromInitializer(
  init: ts.Expression,
  sourceFile: ts.SourceFile,
): string | undefined {
  let inner = init;
  if (ts.isAwaitExpression(inner)) inner = inner.expression;
  if (!ts.isCallExpression(inner) || !isTranslationCallee(inner.expression, sourceFile)) {
    return undefined;
  }
  const arg0 = inner.arguments[0];
  return arg0 && ts.isStringLiteral(arg0) ? arg0.text : undefined;
}

function namespaceFromBindingElement(
  binding: ts.BindingElement,
  sourceFile: ts.SourceFile,
): string | undefined {
  const pattern = binding.parent;
  if (!ts.isArrayBindingPattern(pattern)) return undefined;
  const varDecl = pattern.parent;
  if (!ts.isVariableDeclaration(varDecl) || !varDecl.initializer) return undefined;
  let init = varDecl.initializer;
  if (!ts.isAwaitExpression(init)) return undefined;
  const expr = init.expression;
  if (!ts.isCallExpression(expr) || !isPromiseAllCallee(expr.expression, sourceFile)) {
    return undefined;
  }
  const arr = expr.arguments[0];
  if (!arr || !ts.isArrayLiteralExpression(arr)) return undefined;
  const idx = pattern.elements.indexOf(binding);
  if (idx < 0) return undefined;
  const elem = arr.elements[idx];
  if (!elem || !ts.isCallExpression(elem) || !isTranslationCallee(elem.expression, sourceFile)) {
    return undefined;
  }
  const arg0 = elem.arguments[0];
  return arg0 && ts.isStringLiteral(arg0) ? arg0.text : undefined;
}

function namespaceForTranslationCall(
  checker: ts.TypeChecker,
  call: ts.CallExpression,
  sourceFile: ts.SourceFile,
): string | undefined {
  if (!ts.isIdentifier(call.expression)) return undefined;
  const sym = checker.getSymbolAtLocation(call.expression);
  if (!sym) return undefined;
  const decl = sym.getDeclarations()?.[0];
  if (!decl) return undefined;

  if (ts.isVariableDeclaration(decl) && decl.initializer) {
    return namespaceFromInitializer(decl.initializer, sourceFile);
  }
  if (ts.isBindingElement(decl)) {
    return namespaceFromBindingElement(decl, sourceFile);
  }
  return undefined;
}

function collectReplacements(
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile,
): { start: number; end: number; text: string }[] {
  const edits: { start: number; end: number; text: string }[] = [];

  function visit(node: ts.Node) {
    if (!ts.isCallExpression(node)) {
      ts.forEachChild(node, visit);
      return;
    }

    if (node.arguments.length !== 1) {
      ts.forEachChild(node, visit);
      return;
    }

    const arg0 = node.arguments[0];
    if (!ts.isStringLiteral(arg0)) {
      ts.forEachChild(node, visit);
      return;
    }

    const callee = node.expression;
    if (ts.isPropertyAccessExpression(callee)) {
      ts.forEachChild(node, visit);
      return;
    }

    const ns = namespaceForTranslationCall(checker, node, sourceFile);
    if (!ns) {
      ts.forEachChild(node, visit);
      return;
    }

    const fullKey = `${ns}.${arg0.text}`;
    const value = getNested(messages, fullKey);
    if (typeof value !== "string") {
      ts.forEachChild(node, visit);
      return;
    }

    const jsx = node.parent;
    if (
      ts.isJsxExpression(jsx) &&
      jsx.expression === node &&
      isJsxChildrenTextSlot(jsx) &&
      canUsePlainJsxText(value)
    ) {
      edits.push({
        start: jsx.getStart(sourceFile),
        end: jsx.getEnd(),
        text: value,
      });
    } else {
      edits.push({
        start: node.getStart(sourceFile),
        end: node.getEnd(),
        text: JSON.stringify(value),
      });
    }
  }

  visit(sourceFile);
  return edits;
}

function collectJsxStringUnwrapReplacements(sourceFile: ts.SourceFile): {
  start: number;
  end: number;
  text: string;
}[] {
  const edits: { start: number; end: number; text: string }[] = [];

  function visit(node: ts.Node) {
    if (!ts.isJsxExpression(node) || !node.expression) {
      ts.forEachChild(node, visit);
      return;
    }
    const expr = node.expression;
    const text =
      ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)
        ? expr.text
        : undefined;
    if (text === undefined || !isJsxChildrenTextSlot(node) || !canUsePlainJsxText(text)) {
      ts.forEachChild(node, visit);
      return;
    }
    edits.push({
      start: node.getStart(sourceFile),
      end: node.getEnd(),
      text,
    });
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return edits;
}

function walkTsFilesSync(dir: string, out: string[]): void {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkTsFilesSync(p, out);
    else if (name.endsWith(".ts") || name.endsWith(".tsx")) out.push(p);
  }
}

const compilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ESNext,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  jsx: ts.JsxEmit.ReactJSX,
  strict: true,
  skipLibCheck: true,
  esModuleInterop: true,
  resolveJsonModule: true,
};

let totalFiles = 0;
let totalReplacements = 0;

const dirs = [join(ROOT, "app"), join(ROOT, "features")];
const files: string[] = [];
for (const d of dirs) walkTsFilesSync(d, files);

const sortedFiles = files.sort();
const program = ts.createProgram(sortedFiles, compilerOptions);
const checker = program.getTypeChecker();

for (const filePath of sortedFiles) {
  const sourceText = readFileSync(filePath, "utf8");
  const sourceFile = program.getSourceFile(filePath);
  if (!sourceFile) continue;

  const edits = UNWRAP_JSX
    ? collectJsxStringUnwrapReplacements(sourceFile)
    : collectReplacements(checker, sourceFile);
  if (edits.length === 0) continue;

  edits.sort((a, b) => b.start - a.start);
  let next = sourceText;
  for (const e of edits) {
    next = next.slice(0, e.start) + e.text + next.slice(e.end);
  }

  totalFiles++;
  totalReplacements += edits.length;
  if (!DRY) writeFileSync(filePath, next, "utf8");
  console.log(`${DRY ? "[dry-run] " : ""}${filePath.replace(ROOT + "\\", "").replace(ROOT + "/", "")}: ${edits.length} replacement(s)`);
}

console.log(`\nDone. ${totalFiles} file(s), ${totalReplacements} replacement(s).${DRY ? " (no files written)" : ""}`);
