/**
 * Records a demo video of the AI Assistant feature.
 * Requires `pnpm dev` running and AI provider keys configured.
 * Output: public/marketing/videos/assistant.webm
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

async function signIn(page: Page) {
  await page.goto(`${BASE}/sign-in`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"], input[name="email"]', ADMIN_EMAIL);
  await page.locator('button[type="submit"]').click();
  await page.waitForSelector('input[type="password"]', { timeout: 10_000 });
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((url) => !url.pathname.includes("/sign-in"), {
    timeout: 30_000,
  });
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

  // Sign in
  console.log("Signing in...");
  await signIn(page);
  await wait(800);

  // Navigate to assistant
  console.log("Opening AI Assistant...");
  await page.locator('a:has-text("New Conversation")').first().click();
  await page.waitForLoadState("networkidle");
  await wait(1500);

  // Show the empty state for a moment
  console.log("Showing empty state...");
  await wait(1200);

  // Click the first suggested prompt ("Create a follow-up task")
  console.log("Clicking suggested prompt...");
  const suggestedButton = page.locator('button:has-text("Create a follow-up task")').first();
  if (await suggestedButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await suggestedButton.click();
    console.log("Waiting for AI response...");
    // Wait for streaming response — look for assistant message or error
    await wait(8000);
  } else {
    // Fallback: type in the prompt input manually
    console.log("Suggested prompt not visible, typing manually...");
    const textarea = page.locator('textarea[placeholder*="Ask me"]').first();
    await textarea.click();
    await page.keyboard.type(
      "Create a high-priority task titled Follow up with Acme about the proposal.",
      { delay: 40 },
    );
    await wait(500);

    // Submit with Enter or click submit button
    const submitBtn = page.locator('[data-slot="prompt-input"] button[type="submit"], [data-slot="prompt-input-submit"]').first();
    if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submitBtn.click();
    } else {
      await page.keyboard.press("Enter");
    }

    console.log("Waiting for AI response...");
    await wait(8000);
  }

  // Type a second message
  console.log("Typing second message...");
  const textarea = page.locator('textarea').first();
  if (await textarea.isVisible({ timeout: 3000 }).catch(() => false)) {
    await textarea.click();
    await page.keyboard.type(
      "Now create a documentation task to update the API reference",
      { delay: 45 },
    );
    await wait(600);

    // Submit
    await page.keyboard.press("Enter");
    console.log("Waiting for second response...");
    await wait(8000);
  }

  // Final pause to show the conversation
  await wait(1500);

  // Save video
  await page.close();
  const video = page.video();
  if (video) {
    const dest = join(OUT, "assistant.webm");
    await video.saveAs(dest);
    console.log("wrote assistant.webm");
  }
  await context.close();
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
