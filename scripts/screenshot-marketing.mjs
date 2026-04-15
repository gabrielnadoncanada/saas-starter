import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const OUT = resolve("scripts/.screenshots");
mkdirSync(OUT, { recursive: true });

const URL = process.env.URL ?? "http://localhost:3000/";

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

async function shoot({ name, viewport, theme }) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  await ctx.addCookies([
    {
      name: "theme",
      value: theme,
      url: URL,
    },
  ]);
  const page = await ctx.newPage();

  page.on("pageerror", (e) => console.error("PAGE ERROR:", e.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") console.error("CONSOLE ERROR:", msg.text());
  });

  await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
  await page.evaluate((t) => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(t);
  }, theme);
  await page.waitForTimeout(300);

  // Full page shot
  const full = resolve(OUT, `${theme}-${name}-full.png`);
  await page.screenshot({ path: full, fullPage: true });
  console.log(`→ ${full}`);

  // Hero viewport shot
  const hero = resolve(OUT, `${theme}-${name}-hero.png`);
  await page.screenshot({ path: hero, fullPage: false });
  console.log(`→ ${hero}`);

  // Section shots
  for (const sel of sections) {
    try {
      const el = await page.$(sel);
      if (!el) continue;
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      const f = resolve(OUT, `${theme}-${name}-section-${sel.replace("#", "")}.png`);
      await el.screenshot({ path: f });
      console.log(`→ ${f}`);
    } catch (e) {
      console.warn(`skip ${sel}: ${e.message}`);
    }
  }

  await ctx.close();
}

const browser = await chromium.launch();
try {
  await shoot({ name: "desktop", viewport: { width: 1440, height: 900 }, theme: "dark" });
  await shoot({ name: "desktop", viewport: { width: 1440, height: 900 }, theme: "light" });
  await shoot({ name: "mobile", viewport: { width: 390, height: 844 }, theme: "dark" });
} finally {
  await browser.close();
}
