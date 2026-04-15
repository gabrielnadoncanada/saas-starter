import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const OUTPUT_DIR = resolve(process.cwd(), "scripts/.screenshots/responsive");

const viewports = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1100 },
];

const pages = [
  { name: "home", path: "/" },
  { name: "terms", path: "/terms" },
  { name: "privacy", path: "/privacy" },
  { name: "signin", path: "/sign-in" },
];

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const browser = await chromium.launch();

  const reports = [];

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

    for (const p of pages) {
      const url = `${BASE_URL}${p.path}`;
      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 });
        await page.waitForTimeout(500);

        // Check horizontal overflow
        const overflow = await page.evaluate(() => {
          const docWidth = document.documentElement.scrollWidth;
          const viewportWidth = document.documentElement.clientWidth;
          if (docWidth <= viewportWidth) return null;
          const offenders = [];
          document.querySelectorAll("body *").forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.right > viewportWidth + 1 || r.left < -1) {
              offenders.push({
                tag: el.tagName.toLowerCase(),
                cls:
                  typeof el.className === "string"
                    ? el.className.slice(0, 80)
                    : "",
                right: Math.round(r.right),
                width: Math.round(r.width),
              });
            }
          });
          return {
            docWidth,
            viewportWidth,
            offenders: offenders.slice(0, 10),
          };
        });

        const file = resolve(OUTPUT_DIR, `${vp.name}-${p.name}.png`);
        await page.screenshot({ path: file, fullPage: true });

        reports.push({
          viewport: vp.name,
          page: p.name,
          overflow,
          shot: file,
        });
        console.log(
          `✓ ${vp.name.padEnd(6)} ${p.name.padEnd(8)} ${overflow ? "⚠ OVERFLOW" : "OK"}`,
        );
      } catch (err) {
        console.error(`✗ ${vp.name} ${p.name}: ${err.message}`);
      }
    }

    await context.close();
  }

  await browser.close();

  console.log("\n--- Overflow report ---");
  for (const r of reports) {
    if (r.overflow) {
      console.log(`\n${r.viewport} · ${r.page}`);
      console.log(
        `  doc=${r.overflow.docWidth}px vp=${r.overflow.viewportWidth}px`,
      );
      r.overflow.offenders.forEach((o) => {
        console.log(
          `  <${o.tag}> w=${o.width} right=${o.right} · ${o.cls}`,
        );
      });
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
