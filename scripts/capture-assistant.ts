import { resolve } from "node:path";
import { unlinkSync, existsSync } from "node:fs";

import { chromium } from "playwright";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const OUT = resolve(process.cwd(), "public/marketing/screenshots/assistant.png");

async function main() {
  if (existsSync(OUT)) unlinkSync(OUT);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 2,
    colorScheme: "light",
  });

  await context.addInitScript(() => {
    const style = document.createElement("style");
    style.textContent =
      "*::-webkit-scrollbar{display:none!important}html{scrollbar-width:none!important}*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important}";
    document.documentElement.appendChild(style);
  });

  const page = await context.newPage();
  console.log("signing in");
  await page.goto(`${BASE_URL}/sign-in`, { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', "admin@admin.com");
  await page.fill('input[name="password"]', "admin123");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  console.log("url after signin:", page.url());

  await page.goto(`${BASE_URL}/assistant`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // Click "New Conversation" to ensure empty state
  const newConv = page.getByText("New Conversation").first();
  if (await newConv.count()) {
    await newConv.click();
    await page.waitForTimeout(1200);
    console.log("clicked New Conversation");
  }

  // Check if empty state is visible
  const emptyHeader = page.getByText("What should we ship next?");
  const visible = await emptyHeader.isVisible().catch(() => false);
  console.log("empty state visible:", visible);

  if (visible) {
    // Capture the empty state — clean marketing shot
    await page.screenshot({ path: OUT, type: "png" });
    console.log("Captured empty state →", OUT);
  } else {
    // Fallback: just screenshot whatever is there
    await page.screenshot({ path: OUT, type: "png" });
    console.log("Fallback screenshot →", OUT);
  }

  await browser.close();
}

main().catch((e) => {
  console.error("ERROR", e);
  process.exit(1);
});
