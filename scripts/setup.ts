import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();

function run(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      shell: true,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

async function hasFile(relativePath: string) {
  try {
    await fs.access(path.join(projectRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

function banner(title: string) {
  const bar = "=".repeat(Math.max(40, title.length + 4));
  console.log(`\n${bar}\n  ${title}\n${bar}`);
}

async function main() {
  banner("SaaS Starter — one-command setup");

  const hasEnv = await hasFile(".env");
  if (!hasEnv) {
    banner("Step 1/3  Configure environment (.env)");
    await run("pnpm", ["db:setup"]);
  } else {
    console.log("\n.env already exists — skipping interactive setup.");
    console.log(
      "Delete .env first if you want to re-run the interactive configuration.",
    );
  }

  banner("Step 2/3  Run database migrations");
  await run("pnpm", ["db:migrate"]);

  banner("Step 3/3  Seed the database");
  await run("pnpm", ["db:seed"]);

  banner("Setup complete");
  console.log(
    [
      "",
      "You're ready to go. Next steps:",
      "  1. pnpm dev              → start the Next.js dev server",
      "  2. pnpm email:dev        → preview transactional email templates",
      "  3. pnpm test             → run the test suite",
      "",
      "Docs: content/docs/  (or run pnpm dev and visit /docs)",
      "",
    ].join("\n"),
  );
}

main().catch((error: unknown) => {
  console.error("\nSetup failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
