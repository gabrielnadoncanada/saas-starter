/**
 * Records a demo video of the chart artifact feature.
 * Output: public/marketing/videos/chart-artifact.webm
 */
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium, type Page } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "public/marketing/videos");
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

const ADMIN_EMAIL = "admin@admin.com";
const ADMIN_PASSWORD = "admin123";

async function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function signIn(page: Page) {
  await page.goto(`${BASE}/sign-in`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"], input[name="email"]', ADMIN_EMAIL);
  await page.locator('button[type="submit"]').click();
  await page.waitForSelector('input[type="password"]', { timeout: 10_000 });
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((url) => !url.pathname.includes("/sign-in"), { timeout: 30_000 });
  await page.waitForLoadState("networkidle");
}

async function main() {
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    colorScheme: "dark",
    deviceScaleFactor: 1,
    recordVideo: { dir: OUT, size: { width: 1280, height: 800 } },
  });

  const page = await context.newPage();

  console.log("Signing in...");
  await signIn(page);
  await wait(500);

  console.log("Opening AI Assistant...");
  await page.locator('a:has-text("New Conversation")').first().click();
  await page.waitForLoadState("networkidle");
  await wait(1000);

  // Ask for a chart
  console.log("Requesting a chart...");
  const textarea = page.locator('textarea').first();
  await textarea.click();
  await page.keyboard.type(
    "Show me a bar chart comparing monthly revenue for Q1: January $12k, February $18k, March $24k, April $31k",
    { delay: 35 },
  );
  await wait(400);
  await page.keyboard.press("Enter");

  console.log("Waiting for chart response...");
  // Wait for the chart artifact to appear
  const chartSelector = '[data-slot="chart"]';
  try {
    await page.waitForSelector(chartSelector, { timeout: 30_000 });
    console.log("Chart rendered!");
    await wait(2000);
  } catch {
    console.log("Chart not rendered within timeout, continuing...");
    await wait(5000);
  }

  // Ask for a second chart type
  console.log("Requesting a line chart...");
  const textarea2 = page.locator('textarea').first();
  await textarea2.click();
  await page.keyboard.type(
    "Now show me the same data as a line chart with a trend",
    { delay: 40 },
  );
  await wait(400);
  await page.keyboard.press("Enter");

  console.log("Waiting for second chart...");
  try {
    await page.waitForFunction(
      (sel) => document.querySelectorAll(sel).length >= 2,
      chartSelector,
      { timeout: 30_000 },
    );
    console.log("Second chart rendered!");
    await wait(2000);
  } catch {
    console.log("Second chart timeout, continuing...");
    await wait(5000);
  }

  // Scroll to see both charts
  await page.evaluate(() => {
    const container = document.querySelector('[data-slot="conversation-content"]');
    if (container) container.scrollTop = container.scrollHeight;
  });
  await wait(1500);

  // Save
  await page.close();
  const video = page.video();
  if (video) {
    await video.saveAs(join(OUT, "chart-artifact.webm"));
    console.log("wrote chart-artifact.webm");
  }
  await context.close();
  await browser.close();

  // Cleanup temp files
  const { readdir, unlink } = await import("node:fs/promises");
  const files = await readdir(OUT);
  for (const f of files) {
    if (f.startsWith("page@")) await unlink(join(OUT, f));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
