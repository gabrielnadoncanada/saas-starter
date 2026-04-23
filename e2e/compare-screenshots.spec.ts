import { Page, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

type Theme = "light" | "dark";

const WIDTH = 1440;
const HEIGHT = 900;

test.use({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,
});

const OUT_DIR = path.join(process.cwd(), ".playwright-cli", "compare");

async function setTheme(page: Page, theme: Theme) {
  await page.evaluate((value) => {
    try {
      localStorage.setItem("theme", value);
    } catch {}
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(value);
    root.style.colorScheme = value;
  }, theme);
  await page.waitForTimeout(200);
}

async function settle(page: Page) {
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(400);
}

async function shoot(page: Page, slug: string, theme: Theme) {
  const dir = path.join(OUT_DIR, theme);
  await fs.mkdir(dir, { recursive: true });
  await setTheme(page, theme);
  await settle(page);
  await page.screenshot({
    path: path.join(dir, `${slug}.png`),
    fullPage: true,
  });
}

const PAGES: Array<{ slug: string; url: string }> = [
  { slug: "index", url: "/compare" },
  { slug: "makerkit", url: "/compare/tenviq-vs-makerkit" },
  { slug: "shipfast", url: "/compare/tenviq-vs-shipfast" },
];

for (const theme of ["dark", "light"] as const) {
  test.describe(`compare ${theme}`, () => {
    for (const { slug, url } of PAGES) {
      test(`${slug} (${theme})`, async ({ page }) => {
        await page.goto(url, { waitUntil: "domcontentloaded" });
        await shoot(page, slug, theme);
      });
    }
  });
}
