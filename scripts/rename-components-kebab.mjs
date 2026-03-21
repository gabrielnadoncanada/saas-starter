/**
 * One-off: rename PascalCase component .tsx files under features/ and shared/components/ to kebab-case.
 * Run: node scripts/rename-components-kebab.mjs
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

function toKebabBase(name) {
  const base = name.replace(/\.tsx$/i, "");
  return base
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function collectTsxFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) collectTsxFiles(p, out);
    else if (ent.name.endsWith(".tsx")) out.push(p);
  }
  return out;
}

function needsRename(filePath) {
  const base = path.basename(filePath);
  if (!/^[A-Z]/.test(base) && !/[a-z][A-Z]/.test(base.replace(".tsx", ""))) return false;
  const kebab = toKebabBase(base) + ".tsx";
  return base !== kebab;
}

function gitMv(from, to) {
  const relFrom = path.relative(ROOT, from).replace(/\\/g, "/");
  const relTo = path.relative(ROOT, to).replace(/\\/g, "/");
  const fromLower = from.toLowerCase();
  const toLower = to.toLowerCase();
  if (fromLower === toLower && from !== to) {
    const tmp = from.replace(/\.tsx$/i, ".__tmp_rename__.tsx");
    execSync(`git mv "${relFrom}" "${path.relative(ROOT, tmp).replace(/\\/g, "/")}"`, {
      cwd: ROOT,
      stdio: "inherit",
    });
    execSync(`git mv "${path.relative(ROOT, tmp).replace(/\\/g, "/")}" "${relTo}"`, {
      cwd: ROOT,
      stdio: "inherit",
    });
  } else {
    execSync(`git mv "${relFrom}" "${relTo}"`, { cwd: ROOT, stdio: "inherit" });
  }
}

const dirs = [path.join(ROOT, "features"), path.join(ROOT, "shared", "components")];
const files = dirs.flatMap((d) => collectTsxFiles(d));
const pairs = files
  .filter(needsRename)
  .map((abs) => {
    const dir = path.dirname(abs);
    const kebab = toKebabBase(path.basename(abs)) + ".tsx";
    return { from: abs, to: path.join(dir, kebab) };
  })
  .filter((p) => p.from !== p.to);

for (const { from, to } of pairs) {
  console.log("rename:", path.relative(ROOT, from), "->", path.relative(ROOT, to));
  gitMv(from, to);
}

console.log("done", pairs.length, "renames");
