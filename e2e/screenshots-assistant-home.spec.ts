import { expect, Page, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

type Theme = "light" | "dark";

const WIDTH = 1920;
const HEIGHT = 1080;
const OUT_DIR = path.join(process.cwd(), "public", "marketing", "screenshots");

test.use({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 2,
  colorScheme: "dark",
});

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

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
  await page.waitForTimeout(240);
}

async function settle(page: Page, extra = 500) {
  await page
    .waitForLoadState("networkidle", { timeout: 15_000 })
    .catch(() => {});
  await page.waitForTimeout(extra);
}

test("capture assistant empty state with suggested prompts", async ({
  browser,
  request,
}) => {
  test.setTimeout(120_000);

  await request
    .post("/api/demo/reset", { headers: { authorization: "Bearer dev" } })
    .catch(() => {});

  const ctx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  await page.goto("/sign-in");
  await page.locator('input[name="email"]').fill("demo@starter.local");
  await page.locator('input[name="password"]').fill("demo123");
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await page.waitForURL(/\/(dashboard|organization|app)/, { timeout: 30_000 });
  await settle(page, 500);

  for (const theme of ["dark", "light"] as Theme[]) {
    await page.goto("/assistant");
    await settle(page, 700);
    await setTheme(page, theme);
    await settle(page, 500);

    await expect(page.getByText(/assistant · ready/i)).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByText(/create a follow-up task/i).first(),
    ).toBeVisible({ timeout: 5_000 });

    const dir = path.join(OUT_DIR, theme);
    await ensureDir(dir);
    await page.mouse.move(WIDTH + 100, HEIGHT + 100);
    await page.waitForTimeout(250);
    await page.screenshot({
      path: path.join(dir, "assistant-home.png"),
      fullPage: false,
      animations: "disabled",
    });
  }

  await ctx.close();
});
