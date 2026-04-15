import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const OUTPUT_DIR = resolve(process.cwd(), "scripts/.screenshots/slices");

const viewports = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1100 },
];

const targets = [
  { name: "home-hero", path: "/", scrollY: 0 },
  { name: "home-features", path: "/", scrollY: 2200 },
  { name: "home-pricing", path: "/", scrollY: 4400 },
  { name: "home-footer", path: "/", scrollY: 8000 },
  { name: "terms-hero", path: "/terms", scrollY: 0 },
  { name: "privacy-hero", path: "/privacy", scrollY: 0 },
  { name: "signin", path: "/sign-in", scrollY: 0 },
];

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const browser = await chromium.launch();

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
      colorScheme: "light",
    });
    await context.addInitScript(() => {
      const style = document.createElement("style");
      style.textContent = `
        *::-webkit-scrollbar { display: none !important; }
        html { scrollbar-width: none !important; }
        *, *::before, *::after {
          animation-duration: 0s !important;
          transition-duration: 0s !important;
        }
      `;
      document.documentElement.appendChild(style);
    });

    const page = await context.newPage();
    let currentPath = null;

    for (const t of targets) {
      try {
        if (currentPath !== t.path) {
          await page.goto(`${BASE_URL}${t.path}`, {
            waitUntil: "networkidle",
            timeout: 45_000,
          });
          currentPath = t.path;
          await page.waitForTimeout(400);
        }

        await page.evaluate((y) => window.scrollTo(0, y), t.scrollY);
        await page.waitForTimeout(200);

        const file = resolve(OUTPUT_DIR, `${vp.name}-${t.name}.png`);
        await page.screenshot({ path: file, fullPage: false });
        console.log(`✓ ${vp.name.padEnd(6)} ${t.name}`);
      } catch (err) {
        console.error(`✗ ${vp.name} ${t.name}: ${err.message}`);
      }
    }

    await context.close();
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
