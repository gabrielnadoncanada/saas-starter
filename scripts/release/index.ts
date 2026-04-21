import { execSync } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { manifest } from "./manifest";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, "..", "..");
const TEMPLATE_DIR = join(SCRIPT_DIR, "templates");

type Args = {
  target: string;
  dryRun: boolean;
};

function parseArgs(argv: string[]): Args {
  let target = resolve(REPO_ROOT, "..", "tenviq-starter");
  let dryRun = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--target" || arg === "-t") {
      target = resolve(argv[++i] ?? target);
    } else if (arg === "--dry-run") {
      dryRun = true;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return { target, dryRun };
}

function printHelp() {
  console.log(`Usage: pnpm release:starter [--target <dir>] [--dry-run]

Generates a clean snapshot of the starter at <dir> (default: ../tenviq-starter)
by copying tracked files from this repo, removing Tenviq-specific paths
(see scripts/release/manifest.ts), and overlaying generic templates.

Options:
  --target, -t <dir>   Output directory (default: ../tenviq-starter)
  --dry-run            Report the plan without writing anything
  --help, -h           Show this message
`);
}

function log(prefix: string, message: string) {
  console.log(`[release] ${prefix.padEnd(8)} ${message}`);
}

function listTrackedFiles(): string[] {
  const out = execSync("git ls-files", {
    cwd: REPO_ROOT,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  return out
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function isUnderRemovedPath(file: string, removed: string[]): boolean {
  return removed.some(
    (rm) => file === rm || file.startsWith(`${rm}/`) || file.startsWith(`${rm}\\`),
  );
}

function normalizeSlashes(p: string): string {
  return p.replace(/\\/g, "/");
}

function applyStringReplace(
  content: string,
  replacements: ReadonlyArray<{ from: string; to: string }>,
): string {
  let out = content;
  for (const { from, to } of replacements) {
    out = out.split(from).join(to);
  }
  return out;
}

function copyWithReplace(
  source: string,
  dest: string,
  replacements: ReadonlyArray<{ from: string; to: string }>,
): void {
  const raw = readFileSync(source);
  // Binary files: copy as-is, no replacement.
  if (looksBinary(raw)) {
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(source, dest);
    return;
  }
  const text = raw.toString("utf8");
  const replaced = applyStringReplace(text, replacements);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, replaced, "utf8");
}

function looksBinary(buf: Buffer): boolean {
  const sample = buf.subarray(0, Math.min(512, buf.length));
  for (const byte of sample) {
    if (byte === 0) return true;
  }
  return false;
}

function walkTemplates(templateRoot: string): string[] {
  const out: string[] = [];
  function visit(dir: string) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        visit(full);
      } else if (stat.isFile()) {
        out.push(full);
      }
    }
  }
  if (existsSync(templateRoot)) visit(templateRoot);
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  log("info", `repo:   ${REPO_ROOT}`);
  log("info", `target: ${args.target}`);
  log("info", args.dryRun ? "dry-run mode (no writes)" : "writing snapshot");

  const tracked = listTrackedFiles();
  log("info", `tracked files: ${tracked.length}`);

  const kept = tracked.filter(
    (f) => !isUnderRemovedPath(f, manifest.remove),
  );
  const removedCount = tracked.length - kept.length;
  log("info", `after strip:   ${kept.length} (removed ${removedCount})`);

  const overrideSet = new Set(manifest.overrideFrom.map(normalizeSlashes));

  // Validate each override has a matching template file.
  const templateFiles = new Set(
    walkTemplates(TEMPLATE_DIR).map((f) =>
      normalizeSlashes(relative(TEMPLATE_DIR, f)),
    ),
  );
  const missingTemplates = manifest.overrideFrom.filter(
    (p) => !templateFiles.has(normalizeSlashes(p)),
  );
  if (missingTemplates.length > 0) {
    console.error(`[release] ERROR: missing template files:`);
    for (const p of missingTemplates) console.error(`  - ${p}`);
    process.exit(1);
  }

  // Templates that are pure additions (not listed in overrideFrom) — add as-is.
  const pureAdditions = [...templateFiles].filter(
    (p) => !overrideSet.has(p),
  );

  if (args.dryRun) {
    log("plan", "would copy the following:");
    for (const f of kept.slice(0, 10)) log("plan", `  + ${f}`);
    if (kept.length > 10) log("plan", `  … (+${kept.length - 10} more)`);
    log("plan", `templates to overlay: ${manifest.overrideFrom.length}`);
    for (const p of manifest.overrideFrom) log("plan", `  ~ ${p}`);
    if (pureAdditions.length > 0) {
      log("plan", `templates added fresh: ${pureAdditions.length}`);
      for (const p of pureAdditions) log("plan", `  + ${p}`);
    }
    log("done", "dry-run complete");
    return;
  }

  // Wipe target (only if it looks like a previous snapshot).
  if (existsSync(args.target)) {
    const targetGit = join(args.target, ".git");
    if (existsSync(targetGit) && !isSnapshotMarker(args.target)) {
      console.error(
        `[release] ERROR: target ${args.target} contains a .git dir without the snapshot marker.`,
      );
      console.error(
        `          Refusing to overwrite in case it's a real repo with uncommitted work.`,
      );
      console.error(
        `          Delete the directory manually or point --target elsewhere.`,
      );
      process.exit(1);
    }
    log("info", `cleaning existing target dir`);
    rmSync(args.target, { recursive: true, force: true });
  }
  mkdirSync(args.target, { recursive: true });

  log("copy", "copying tracked files…");
  let copied = 0;
  let skipped = 0;
  for (const file of kept) {
    if (overrideSet.has(normalizeSlashes(file))) continue; // handled below
    const src = join(REPO_ROOT, file);
    if (!existsSync(src)) {
      log("skip", `  missing on disk: ${file}`);
      skipped += 1;
      continue;
    }
    const dst = join(args.target, file);
    copyWithReplace(src, dst, manifest.stringReplace);
    copied += 1;
  }
  log("copy", `  ${copied} tracked files copied${skipped > 0 ? ` (${skipped} skipped — deleted locally)` : ""}`);

  log("tmpl", "overlaying template files…");
  for (const p of manifest.overrideFrom) {
    const src = join(TEMPLATE_DIR, p);
    const dst = join(args.target, p);
    copyWithReplace(src, dst, manifest.stringReplace);
  }
  log("tmpl", `  ${manifest.overrideFrom.length} templates overlaid`);

  if (pureAdditions.length > 0) {
    log("tmpl", `adding ${pureAdditions.length} fresh template files…`);
    for (const p of pureAdditions) {
      const src = join(TEMPLATE_DIR, p);
      const dst = join(args.target, p);
      copyWithReplace(src, dst, manifest.stringReplace);
    }
  }

  writeSnapshotMarker(args.target);
  log("done", `snapshot written to ${args.target}`);
  log("next", "cd into it, run `pnpm install && pnpm build` to verify.");
}

const SNAPSHOT_MARKER = ".release-starter-snapshot";

function writeSnapshotMarker(target: string) {
  writeFileSync(
    join(target, SNAPSHOT_MARKER),
    `Generated by scripts/release on ${new Date().toISOString()}\n`,
    "utf8",
  );
}

function isSnapshotMarker(target: string): boolean {
  return existsSync(join(target, SNAPSHOT_MARKER));
}

main();
