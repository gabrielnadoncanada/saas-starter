import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

import { chromium, type Page } from "playwright";

const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

const DEMO_EMAIL = process.env.DEMO_EMAIL ?? "demo@starter.local";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "demo123";

const VIEWPORT = { width: 1600, height: 1000 };
const OUTPUT_DIR = resolve(process.cwd(), "public/marketing/screenshots");

type Shot = {
  name: string;
  path: string;
  fullPage?: boolean;
  auth: boolean;
  prepare?: (page: Page) => Promise<void>;
};

const shots: Shot[] = [
  { name: "dashboard", path: "/dashboard", auth: true },
  { name: "login", path: "/sign-in", auth: false },
  { name: "billing", path: "/settings/billing", auth: true, fullPage: true },
  { name: "team", path: "/settings/members", auth: true, fullPage: true },
  { name: "settings", path: "/settings", auth: true, fullPage: true },
  { name: "tasks", path: "/dashboard/tasks", auth: true, fullPage: true },
  { name: "docs", path: "/docs", auth: false, fullPage: true },
];

async function signIn(page: Page) {
  await page.goto(`${BASE_URL}/sign-in`, { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', DEMO_EMAIL);
  await page.fill('input[name="password"]', DEMO_PASSWORD);
  await Promise.all([
    page.waitForURL(/\/(dashboard|post-sign-in)/, { timeout: 30_000 }),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
}

async function capture(page: Page, shot: Shot) {
  await page.goto(`${BASE_URL}${shot.path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  if (shot.prepare) await shot.prepare(page);

  const file = resolve(OUTPUT_DIR, `${shot.name}.png`);
  await page.screenshot({
    path: file,
    fullPage: Boolean(shot.fullPage),
    type: "png",
  });

  console.log(`✓ ${shot.name.padEnd(10)} → ${shot.path}`);
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    colorScheme: "light",
  });

  await context.addInitScript(() => {
    const style = document.createElement("style");
    style.textContent = `
      *::-webkit-scrollbar { display: none !important; }
      html { scrollbar-width: none !important; }
      *, *::before, *::after {
        animation-duration: 0s !important;
        transition-duration: 0s !important;
      }
    `;
    document.documentElement.appendChild(style);
  });

  const page = await context.newPage();

  const publicShots = shots.filter((s) => !s.auth);
  const authShots = shots.filter((s) => s.auth);

  for (const shot of publicShots) {
    try {
      await capture(page, shot);
    } catch (error) {
      console.error(`✗ ${shot.name} failed:`, (error as Error).message);
    }
  }

  console.log(`→ Signing in as ${DEMO_EMAIL}`);
  await signIn(page);

  for (const shot of authShots) {
    try {
      await capture(page, shot);
    } catch (error) {
      console.error(`✗ ${shot.name} failed:`, (error as Error).message);
    }
  }

  await browser.close();
  console.log(`\nDone. Screenshots in ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
