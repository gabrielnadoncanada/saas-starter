import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const OUT = resolve("scripts/.screenshots");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
try {
  for (const theme of ["dark", "light"]) {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await ctx.newPage();
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
    await page.evaluate((t) => {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(t);
    }, theme);
    await page.waitForTimeout(300);

    // Final CTA: navigate to it
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight - 1200);
    });
    await page.waitForTimeout(300);
    await page.screenshot({
      path: resolve(OUT, `${theme}-cta-viewport.png`),
      fullPage: false,
    });

    // Footer bottom
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(300);
    await page.screenshot({
      path: resolve(OUT, `${theme}-footer-viewport.png`),
      fullPage: false,
    });

    await ctx.close();
  }
} finally {
  await browser.close();
}
