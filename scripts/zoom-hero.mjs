import { chromium } from "playwright";
import { resolve } from "node:path";

const browser = await chromium.launch();
try {
  for (const theme of ["dark", "light"]) {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 1600 },
    });
    const page = await ctx.newPage();
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
    await page.evaluate((t) => {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(t);
    }, theme);
    await page.waitForTimeout(400);
    await page.screenshot({
      path: resolve("scripts/.screenshots", `${theme}-hero-tall.png`),
      fullPage: false,
      clip: { x: 0, y: 0, width: 1440, height: 1600 },
    });
    await ctx.close();
  }
} finally {
  await browser.close();
}
