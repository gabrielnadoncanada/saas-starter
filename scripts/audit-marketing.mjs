import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const OUT = resolve("scripts/.screenshots/audit");
mkdirSync(OUT, { recursive: true });

const sections = [
  "#positioning",
  "#showcase",
  "#features",
  "#proof",
  "#comparison",
  "#use-cases",
  "#pricing",
  "#faq",
];

const browser = await chromium.launch();
try {
  for (const theme of ["dark", "light"]) {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle", timeout: 60000 });
    await page.evaluate((t) => {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(t);
    }, theme);
    await page.waitForTimeout(400);

    await page.screenshot({ path: resolve(OUT, `${theme}-full.png`), fullPage: true });
    await page.screenshot({ path: resolve(OUT, `${theme}-hero.png`), fullPage: false });

    for (const sel of sections) {
      const el = await page.$(sel);
      if (!el) continue;
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      await el.screenshot({ path: resolve(OUT, `${theme}-${sel.replace("#", "")}.png`) });
    }

    await ctx.close();
  }
} finally {
  await browser.close();
}
console.log("done");
