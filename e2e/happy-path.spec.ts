import { expect, test } from "@playwright/test";

/**
 * Happy-path smoke: marketing → sign up → dashboard.
 *
 * This is a template. Before it will pass against a real environment you need:
 *   1. A clean test database — run `POSTGRES_URL=... pnpm exec prisma migrate reset --force`.
 *   2. Email verification disabled (or mock Resend) — the default flow waits for the
 *      user to click a link in their inbox, which Playwright can't do unattended.
 *   3. `PLAYWRIGHT_BASE_URL` pointing at your running app (defaults to localhost:3000).
 *
 * Run with: `pnpm exec playwright test`
 */

const uniqueEmail = () =>
  `e2e+${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

test.describe("happy path", () => {
  test("landing page renders the primary CTA", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1 }).first(),
    ).toBeVisible();
  });

  test("user can sign up and reach the verification screen", async ({
    page,
  }) => {
    const email = uniqueEmail();

    await page.goto("/sign-up");
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/^password/i).fill("Password123!");
    await page.getByLabel(/confirm password/i).fill("Password123!");

    await page.getByRole("button", { name: /sign up/i }).click();

    await expect(page).toHaveURL(/verify-email/);
    await expect(
      page.getByText(/check your (inbox|email)/i).first(),
    ).toBeVisible();
  });

  test("existing user can sign in and see the dashboard", async ({ page }) => {
    // Replace with a seeded test account. The easiest path is to insert one in
    // a global setup file and reuse the same credentials here.
    const email = process.env.E2E_USER_EMAIL ?? "test@example.com";
    const password = process.env.E2E_USER_PASSWORD ?? "Password123!";

    await page.goto("/sign-in");
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByRole("navigation")).toBeVisible();
  });
});
