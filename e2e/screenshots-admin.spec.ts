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

async function signInAdmin(page: Page) {
  await page.goto("/sign-in");
  await page.locator('input[name="email"]').fill("admin@admin.com");
  await page.locator('input[name="password"]').fill("admin123");
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await page.waitForURL(/\/(dashboard|organization|app|admin)/, {
    timeout: 30_000,
  });
  await settle(page, 600);
}

async function shoot(page: Page, name: string, theme: Theme) {
  const dir = path.join(OUT_DIR, theme);
  await ensureDir(dir);
  await setTheme(page, theme);
  await page.mouse.move(WIDTH + 100, HEIGHT + 100);
  await page.waitForTimeout(260);
  await page.screenshot({
    path: path.join(dir, `${name}.png`),
    fullPage: false,
    animations: "disabled",
  });
}

test("capture admin surfaces as admin user", async ({ browser }) => {
  test.setTimeout(600_000);

  const ctx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await signInAdmin(page);

  for (const theme of ["dark", "light"] as Theme[]) {
    // Admin dashboard (overview with KPIs + signup chart + plan breakdown)
    await page.goto("/admin");
    await settle(page, 800);
    await setTheme(page, theme);
    await settle(page, 500);
    await shoot(page, "admin", theme);

    // Users table
    await page.goto("/admin/users");
    await settle(page, 700);
    await setTheme(page, theme);
    await settle(page, 500);
    await shoot(page, "admin-users", theme);

    // Users table with detail drawer open
    const firstUserRow = page
      .locator("tbody tr")
      .filter({ hasText: /@/ })
      .first();
    await firstUserRow.click();
    await expect(
      page.getByRole("dialog").or(page.locator('[role="dialog"]')).first(),
    ).toBeVisible({ timeout: 8000 });
    await settle(page, 700);
    await shoot(page, "admin-user-detail", theme);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);

    // Organizations table
    await page.goto("/admin/organizations");
    await settle(page, 700);
    await setTheme(page, theme);
    await settle(page, 500);
    await shoot(page, "admin-organizations", theme);

    // Organizations table with detail drawer open
    const firstOrgRow = page.locator("tbody tr").first();
    await firstOrgRow.click();
    await expect(
      page.getByRole("dialog").or(page.locator('[role="dialog"]')).first(),
    ).toBeVisible({ timeout: 8000 });
    await settle(page, 800);
    await shoot(page, "admin-organization-detail", theme);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
  }

  await ctx.close();
});
