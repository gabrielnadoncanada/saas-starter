import fs from "node:fs";
import path from "node:path";

const docsRoot = path.join(process.cwd(), "content", "docs");

function langFromFilePath(filePath) {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".tsx")) return "tsx";
  if (lower.endsWith(".ts")) return "ts";
  if (lower.endsWith(".css")) return "css";
  if (lower.endsWith(".mjs")) return "js";
  if (lower.endsWith(".json")) return "json";
  if (lower.endsWith(".env.example") || lower === ".env.example") return "env";
  return "txt";
}

function transform(content) {
  return content.replace(
    /^```(\d+):(\d+):(.+)$/gm,
    (_, _start, _end, filePath) => {
      const lang = langFromFilePath(filePath);
      return `\`\`\`${lang} title="${filePath}"`;
    },
  );
}

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) walk(full, out);
    else if (name.name.endsWith(".mdx")) out.push(full);
  }
  return out;
}

let changed = 0;
for (const file of walk(docsRoot)) {
  const before = fs.readFileSync(file, "utf8");
  const after = transform(before);
  if (after !== before) {
    fs.writeFileSync(file, after, "utf8");
    changed++;
  }
}
console.log(`Updated ${changed} MDX files.`);
