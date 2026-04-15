import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const OUT = resolve("scripts/.screenshots/color-ab");
mkdirSync(OUT, { recursive: true });

// Each option: { name, h, s, l (light / dark variants), soft l (light / dark) }
const options = [
  {
    name: "01-brand-current",
    label: "Brand (current)",
    light: { main: "14 82% 48%", soft: "14 82% 96%" },
    dark: { main: "14 82% 56%", soft: "14 40% 14%" },
  },
  {
    name: "02-cobalt",
    label: "Electric cobalt (safe tech)",
    light: { main: "220 90% 52%", soft: "220 90% 96%" },
    dark: { main: "217 95% 62%", soft: "220 50% 15%" },
  },
  {
    name: "03-crimson",
    label: "Editorial crimson (Stripe-like)",
    light: { main: "355 78% 45%", soft: "355 78% 96%" },
    dark: { main: "352 85% 58%", soft: "352 40% 14%" },
  },
  {
    name: "04-zinc-mono",
    label: "Pure monochrome (Vercel-like)",
    light: { main: "0 0% 10%", soft: "0 0% 96%" },
    dark: { main: "0 0% 95%", soft: "0 0% 14%" },
  },
];

function overrideCss({ main, soft }, mainAlpha = main) {
  // Replace the --brand vars + override any hardcoded hsl(14 82% 48% ...) in shadows/gradients
  // by attaching a high-specificity style block that sets the var AND matches the tailwind arbitrary-value class selectors.
  return `
    :root, .light {
      --brand: hsl(${main}) !important;
      --brand-soft: hsl(${soft}) !important;
    }
    .dark {
      --brand: hsl(${main}) !important;
      --brand-soft: hsl(${soft}) !important;
    }
    /* Override the hardcoded brand shadows on hero/CTA/pricing buttons */
    [class*="hsl(14_82%_48%"], [class*="hsl(14,82%,48%"] {
      --_brand-override: hsl(${mainAlpha});
    }
  `;
}

// Simpler: inject a stylesheet that overrides shadows by direct class targeting
// Tailwind v4 arbitrary values compile to inline rules we can't easily override
// without class targeting. We'll just override the CSS vars and accept that
// some bloom/shadow halos keep their hardcoded orange tint.

async function captureTheme(browser, opt, theme) {
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

  // Hero viewport
  await page.screenshot({
    path: resolve(OUT, `${opt.name}-${theme}-hero.png`),
    fullPage: false,
  });

  // Pricing
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
  for (const opt of options) {
    for (const theme of ["dark", "light"]) {
      await captureTheme(browser, opt, theme);
      console.log(`→ ${opt.name} / ${theme}`);
    }
  }
} finally {
  await browser.close();
}
