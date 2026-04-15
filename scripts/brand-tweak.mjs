import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const OUT = resolve("scripts/.screenshots/brand-tweak");
mkdirSync(OUT, { recursive: true });

const variants = [
  {
    name: "A-current",
    label: "Current hsl(14 82% 48%)",
    light: { main: "14 82% 48%", soft: "14 82% 96%" },
    dark: { main: "14 82% 56%", soft: "14 40% 14%" },
  },
  {
    name: "B-refined",
    label: "Refined hsl(12 85% 52%)",
    light: { main: "12 85% 52%", soft: "12 85% 96%" },
    dark: { main: "12 88% 60%", soft: "12 45% 15%" },
  },
  {
    name: "C-deeper",
    label: "Deeper hsl(10 82% 50%)",
    light: { main: "10 82% 50%", soft: "10 82% 96%" },
    dark: { main: "10 82% 58%", soft: "10 40% 14%" },
  },
];

async function capture(browser, opt, theme) {
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
  await page.addStyleTag({
    content: `
      :root, .light, .dark {
        --brand: hsl(${opt[theme].main}) !important;
        --brand-soft: hsl(${opt[theme].soft}) !important;
      }
    `,
  });
  await page.waitForTimeout(300);

  await page.screenshot({
    path: resolve(OUT, `${opt.name}-${theme}-hero.png`),
    fullPage: false,
  });

  const pricing = await page.$("#pricing");
  if (pricing) {
    await pricing.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await pricing.screenshot({
      path: resolve(OUT, `${opt.name}-${theme}-pricing.png`),
    });
  }

  await ctx.close();
}

const browser = await chromium.launch();
try {
  for (const opt of variants) {
    for (const theme of ["dark", "light"]) {
      await capture(browser, opt, theme);
      console.log(`→ ${opt.name} / ${theme}`);
    }
  }
} finally {
  await browser.close();
}
