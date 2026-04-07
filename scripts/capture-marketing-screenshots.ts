/**
 * Captures PNGs for public/marketing/screenshots/ in dark mode.
 * Requires `pnpm dev` at BASE_URL (default http://localhost:3000).
 * Authenticates automatically with the seeded admin account.
 */
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium, type Page } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "public/marketing/screenshots");
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

const ADMIN_EMAIL = "admin@admin.com";
const ADMIN_PASSWORD = "admin123";

type Shot = { url: string; file: string; scrollTo?: string };

const publicShots: Shot[] = [
  { url: `${BASE}/sign-in`, file: "login.png" },
  { url: `${BASE}/`, file: "plan-gate.png", scrollTo: "#pricing" },
];

const authShots: Shot[] = [
  { url: `${BASE}/dashboard`, file: "dashboard.png" },
  { url: `${BASE}/dashboard/tasks`, file: "tasks.png" },
  { url: `${BASE}/settings/members`, file: "team.png" },
  { url: `${BASE}/settings`, file: "settings.png" },
  { url: `${BASE}/settings/billing`, file: "billing.png" },
];

async function signIn(page: Page) {
  console.log("Signing in as", ADMIN_EMAIL, "...");
  await page.goto(`${BASE}/sign-in`, { waitUntil: "networkidle", timeout: 60_000 });

  // Step 1: email
  await page.fill('input[type="email"], input[name="email"]', ADMIN_EMAIL);
  await page.locator('button[type="submit"]').click();

  // Step 2: password
  await page.waitForSelector('input[type="password"]', { timeout: 10_000 });
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').click();

  // Wait for redirect to authenticated area
  await page.waitForURL((url) => !url.pathname.includes("/sign-in"), { timeout: 30_000 });
  console.log("Signed in successfully, redirected to", page.url());
}

async function captureShots(page: Page, shots: Shot[]) {
  for (const shot of shots) {
    await page.goto(shot.url, { waitUntil: "networkidle", timeout: 60_000 });
    await page
      .waitForSelector("html.dark", { timeout: 15_000 })
      .catch(() => console.warn(`warn: html.dark missing for ${shot.file}`));
    if (shot.scrollTo) {
      await page.locator(shot.scrollTo).scrollIntoViewIfNeeded();
    }
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({
      path: join(OUT, shot.file),
      fullPage: false,
      type: "png",
    });
    console.log("wrote", shot.file);
  }
}

async function main() {
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    colorScheme: "dark",
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  // Capture public pages first (no auth needed)
  await captureShots(page, publicShots);

  // Sign in, then capture authenticated pages
  await signIn(page);
  await captureShots(page, authShots);

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
