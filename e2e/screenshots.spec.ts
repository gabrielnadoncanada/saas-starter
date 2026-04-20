import { expect, Page, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

type Theme = "light" | "dark";

const WIDTH = 1920;
const HEIGHT = 1080;

test.use({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 2,
  colorScheme: "dark",
});

const AUTH_STATE_FILE = path.join(
  process.cwd(),
  "test-results",
  "screenshots-auth.json",
);

const OUT_DIR = path.join(process.cwd(), "public", "marketing", "screenshots");

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
  await page.waitForTimeout(220);
}

async function settle(page: Page, extra = 400) {
  await page
    .waitForLoadState("networkidle", { timeout: 15_000 })
    .catch(() => {});
  await page.waitForTimeout(extra);
}

async function signIn(page: Page) {
  await page.goto("/sign-in");
  await page.locator('input[name="email"]').fill("demo@starter.local");
  await page.locator('input[name="password"]').fill("demo123");
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await page.waitForURL(/\/(dashboard|organization|app)/, { timeout: 30_000 });
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

type Shot = {
  name: string;
  url: string;
  before?: (page: Page) => Promise<void>;
};

const APP_SHOTS: Shot[] = [
  { name: "dashboard", url: "/dashboard" },
  { name: "tasks", url: "/dashboard/tasks" },
  {
    name: "assistant",
    url: "/assistant",
    before: async (page) => {
      const composer = page.getByPlaceholder(
        "Ask me to create a task or summarize what you need...",
      );
      await expect(composer).toBeVisible({ timeout: 15_000 });
      await composer.fill(
        "Summarize what my team shipped this week across tasks.",
      );
      await page.getByRole("button", { name: "Submit" }).click();
      await expect(
        page.getByRole("button", { name: "Submit" }),
      ).toBeVisible({ timeout: 90_000 });
      await page.waitForTimeout(600);
    },
  },
  {
    name: "assistant-chart",
    url: "/assistant",
    before: async (page) => {
      const composer = page.getByPlaceholder(
        "Ask me to create a task or summarize what you need...",
      );
      await expect(composer).toBeVisible({ timeout: 15_000 });
      await composer.fill("Give me a bar chart of my tasks grouped by status.");
      await page.getByRole("button", { name: "Submit" }).click();
      await expect(
        page
          .locator("svg")
          .filter({ has: page.locator(".recharts-bar, .recharts-bar-rectangle") })
          .first(),
      ).toBeVisible({ timeout: 90_000 });
      await page.waitForTimeout(1200);
    },
  },
  { name: "admin-organizations", url: "/admin/organizations" },
  { name: "admin-users", url: "/admin/users" },
  { name: "admin", url: "/admin" },
  { name: "settings", url: "/settings" },
  { name: "settings-billing", url: "/settings/billing" },
  { name: "settings-members", url: "/settings/members" },
  { name: "settings-organization", url: "/settings/organization" },
  { name: "settings-preferences", url: "/settings/preferences" },
  { name: "settings-security", url: "/settings/security" },
  { name: "settings-activity", url: "/settings/activity" },
];

const PUBLIC_SHOTS: Shot[] = [
  { name: "marketing-home", url: "/" },
  { name: "pricing", url: "/pricing" },
  { name: "contact", url: "/contact" },
  { name: "blog", url: "/blog" },
  { name: "sign-in", url: "/sign-in" },
  { name: "sign-up", url: "/sign-up" },
  { name: "forgot-password", url: "/forgot-password" },
];

test.describe.serial("screenshots", () => {
  test("capture authenticated app pages", async ({ browser, request }) => {
    test.setTimeout(600_000);

    await request
      .post("/api/demo/reset", { headers: { authorization: "Bearer dev" } })
      .catch(() => {});

    const ctx = await browser.newContext({
      viewport: { width: WIDTH, height: HEIGHT },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    await signIn(page);
    await ctx.storageState({ path: AUTH_STATE_FILE });

    for (const shot of APP_SHOTS) {
      for (const theme of ["dark", "light"] as Theme[]) {
        await page.goto(shot.url);
        await settle(page, 600);
        await setTheme(page, theme);
        await settle(page, 400);
        if (shot.before) {
          await shot.before(page);
          await settle(page, 300);
        }
        await shoot(page, shot.name, theme);
      }
    }

    await ctx.close();
  });

  test("capture public pages", async ({ browser }) => {
    test.setTimeout(300_000);

    const ctx = await browser.newContext({
      viewport: { width: WIDTH, height: HEIGHT },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();

    for (const shot of PUBLIC_SHOTS) {
      for (const theme of ["dark", "light"] as Theme[]) {
        await page.goto(shot.url);
        await settle(page, 600);
        await setTheme(page, theme);
        await settle(page, 400);
        await shoot(page, shot.name, theme);
      }
    }

    await ctx.close();
  });
});
