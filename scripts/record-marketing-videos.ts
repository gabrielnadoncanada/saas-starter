/**
 * Records demo videos of the SaaS app interacting with the UI.
 * Requires `pnpm dev` at BASE_URL (default http://localhost:3000).
 * Output: public/marketing/videos/
 */
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium, type BrowserContext, type Page } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "public/marketing/videos");
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

const ADMIN_EMAIL = "admin@admin.com";
const ADMIN_PASSWORD = "admin123";

async function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function createRecordingContext(browser: Awaited<ReturnType<typeof chromium.launch>>, videoName: string) {
  return browser.newContext({
    viewport: { width: 1280, height: 800 },
    colorScheme: "dark",
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUT,
      size: { width: 1280, height: 800 },
    },
  });
}

async function saveVideo(context: BrowserContext, page: Page, name: string) {
  await page.close();
  const video = page.video();
  if (video) {
    const path = await video.path();
    const dest = join(OUT, `${name}.webm`);
    await video.saveAs(dest);
    console.log(`wrote ${name}.webm`);
  }
  await context.close();
}

// ─── Scenario: Login flow ───
async function recordLogin(browser: Awaited<ReturnType<typeof chromium.launch>>) {
  const context = await createRecordingContext(browser, "login");
  const page = await context.newPage();

  await page.goto(`${BASE}/sign-in`, { waitUntil: "networkidle" });
  await wait(800);

  // Type email slowly
  await page.locator('input[type="email"], input[name="email"]').click();
  await page.keyboard.type(ADMIN_EMAIL, { delay: 60 });
  await wait(400);
  await page.locator('button[type="submit"]').click();

  // Type password
  await page.waitForSelector('input[type="password"]', { timeout: 10_000 });
  await wait(400);
  await page.locator('input[type="password"]').click();
  await page.keyboard.type(ADMIN_PASSWORD, { delay: 60 });
  await wait(400);
  await page.locator('button[type="submit"]').click();

  // Wait for dashboard
  await page.waitForURL((url) => !url.pathname.includes("/sign-in"), { timeout: 30_000 });
  await page.waitForLoadState("networkidle");
  await wait(1500);

  await saveVideo(context, page, "login");
}

// ─── Scenario: Dashboard navigation ───
async function recordNavigation(browser: Awaited<ReturnType<typeof chromium.launch>>) {
  const context = await createRecordingContext(browser, "navigation");
  const page = await context.newPage();

  // Sign in quickly
  await signInFast(page);
  await wait(1000);

  // Navigate to Tasks
  await page.locator('a:has-text("Tasks")').first().click();
  await page.waitForLoadState("networkidle");
  await wait(1500);

  // Navigate to Settings
  await page.goto(`${BASE}/settings`, { waitUntil: "networkidle" });
  await wait(1200);

  // Navigate to Members
  await page.locator('a:has-text("Members")').first().click();
  await page.waitForLoadState("networkidle");
  await wait(1200);

  // Navigate to Billing
  await page.locator('a:has-text("Billing")').first().click();
  await page.waitForLoadState("networkidle");
  await wait(1200);

  // Back to dashboard
  await page.locator('a:has-text("Back to dashboard")').first().click();
  await page.waitForLoadState("networkidle");
  await wait(1000);

  await saveVideo(context, page, "navigation");
}

// ─── Scenario: Create a task ───
async function recordCreateTask(browser: Awaited<ReturnType<typeof chromium.launch>>) {
  const context = await createRecordingContext(browser, "create-task");
  const page = await context.newPage();

  await signInFast(page);

  // Go to tasks
  await page.locator('a:has-text("Tasks")').first().click();
  await page.waitForLoadState("networkidle");
  await wait(800);

  // Click "Create" button
  await page.locator('button:has-text("Create")').first().click();

  // Wait for sheet to open and be interactive
  const sheet = page.locator('[data-slot="sheet-content"]');
  await sheet.waitFor({ state: "visible", timeout: 10_000 });
  await wait(600);

  // Fill title inside sheet
  const titleInput = sheet.locator('#task-title');
  await titleInput.click();
  await page.keyboard.type("Ship the new onboarding flow", { delay: 50 });
  await wait(400);

  // Fill description
  const descInput = sheet.locator('#task-description');
  await descInput.click();
  await page.keyboard.type("Final polish before launch — tooltips, empty states, mobile checks.", { delay: 35 });
  await wait(400);

  // Change label select
  await sheet.locator('#task-label').click();
  await wait(300);
  await page.locator('[role="option"]:has-text("Feature")').click();
  await wait(400);

  // Change priority select
  await sheet.locator('#task-priority').click();
  await wait(300);
  await page.locator('[role="option"]:has-text("High")').click();
  await wait(400);

  // Submit
  await sheet.locator('button[type="submit"]:has-text("Create Task")').click();
  await wait(2000);

  await saveVideo(context, page, "create-task");
}

// ─── Scenario: Billing toggle ───
async function recordBilling(browser: Awaited<ReturnType<typeof chromium.launch>>) {
  const context = await createRecordingContext(browser, "billing");
  const page = await context.newPage();

  await signInFast(page);

  await page.goto(`${BASE}/settings/billing`, { waitUntil: "networkidle" });
  await wait(1200);

  // Toggle to yearly
  const yearlyRadio = page.locator('#billing-interval-year');
  if (await yearlyRadio.isVisible({ timeout: 3000 }).catch(() => false)) {
    await yearlyRadio.click();
    await wait(1000);

    // Toggle back to monthly
    await page.locator('#billing-interval-month').click();
    await wait(1000);
  }

  // Select Team plan
  const teamRadio = page.locator('#billing-plan-team');
  if (await teamRadio.isVisible({ timeout: 3000 }).catch(() => false)) {
    await teamRadio.click();
    await wait(1200);

    // Back to Pro
    await page.locator('#billing-plan-pro').click();
    await wait(1000);
  }

  await saveVideo(context, page, "billing");
}

// ─── Helper: fast sign in ───
async function signInFast(page: Page) {
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

  console.log("Recording login flow...");
  await recordLogin(browser);

  console.log("Recording dashboard navigation...");
  await recordNavigation(browser);

  console.log("Recording task creation...");
  await recordCreateTask(browser);

  console.log("Recording billing page...");
  await recordBilling(browser);

  await browser.close();
  console.log("\nAll videos saved to public/marketing/videos/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
