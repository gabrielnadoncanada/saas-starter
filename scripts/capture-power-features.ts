import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

import { chromium, type Page } from "playwright";

const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@admin.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

const VIEWPORT = { width: 1600, height: 1000 };
const OUTPUT_DIR = resolve(process.cwd(), "public/marketing/screenshots");
const VIDEO_DIR = resolve(process.cwd(), "public/marketing/videos");

async function signIn(page: Page) {
  await page.goto(`${BASE_URL}/sign-in`, { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', ADMIN_EMAIL);
  await page.fill('input[name="password"]', ADMIN_PASSWORD);
  await Promise.all([
    page.waitForURL(/\/(dashboard|post-sign-in|admin)/, { timeout: 30_000 }),
    page.click('button[type="submit"]'),
  ]);
}

async function shoot(page: Page, name: string, fullPage = false) {
  const file = resolve(OUTPUT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage, type: "png" });
  console.log(`✓ ${name} → ${file}`);
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  mkdirSync(VIDEO_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    colorScheme: "light",
    recordVideo: { dir: VIDEO_DIR, size: VIEWPORT },
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

  console.log(`→ Signing in as ${ADMIN_EMAIL}`);
  await signIn(page);
  await page.waitForTimeout(800);

  // --- AI Assistant ---
  try {
    await page.goto(`${BASE_URL}/assistant`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);

    const composer = page.locator(
      'textarea, [contenteditable="true"]',
    ).first();
    if (await composer.count()) {
      await composer.click();
      await composer.fill(
        "Draw a bar chart titled 'Weekly active users' with this exact data: Week 1 = 120, Week 2 = 145, Week 3 = 168, Week 4 = 201, Week 5 = 234, Week 6 = 289.",
      );
      await page.waitForTimeout(300);
      await composer.press("Enter");
      await page.waitForTimeout(12000);
    }
    await shoot(page, "assistant");
  } catch (error) {
    console.error("assistant failed:", (error as Error).message);
    await shoot(page, "assistant");
  }

  // --- Admin users ---
  try {
    await page.goto(`${BASE_URL}/admin/users`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await shoot(page, "admin-users", true);
  } catch (error) {
    console.error("admin-users failed:", (error as Error).message);
  }

  // --- Admin organizations (bonus) ---
  try {
    await page.goto(`${BASE_URL}/admin/organizations`, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(1000);
    await shoot(page, "admin-organizations", true);
  } catch (error) {
    console.error("admin-organizations failed:", (error as Error).message);
  }

  // --- Admin dashboard (signups chart + plan breakdown) ---
  try {
    await page.goto(`${BASE_URL}/admin`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await shoot(page, "admin-dashboard", true);
  } catch (error) {
    console.error("admin-dashboard failed:", (error as Error).message);
  }

  // --- Activity log ---
  try {
    await page.goto(`${BASE_URL}/settings/activity`, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(1000);
    await shoot(page, "activity", true);
  } catch (error) {
    console.error("activity failed:", (error as Error).message);
  }

  await page.close();
  await context.close();
  await browser.close();

  console.log(`\nDone. Screenshots in ${OUTPUT_DIR}`);
  console.log(`Video(s) in ${VIDEO_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
