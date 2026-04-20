import { expect, Locator, Page, test } from "@playwright/test";

test.use({
  video: {
    mode: "on",
    size: { width: 1920, height: 1080 },
  },
  viewport: { width: 1920, height: 1080 },
});

const CURSOR_INIT = `
(() => {
  if (window.__demoCursorInstalled) return;
  window.__demoCursorInstalled = true;

  const cursor = document.createElement('div');
  cursor.id = '__demo_cursor__';
  cursor.style.cssText = [
    'position: fixed',
    'top: 0',
    'left: 0',
    'width: 22px',
    'height: 22px',
    'pointer-events: none',
    'z-index: 2147483647',
    'transform: translate3d(-100px, -100px, 0)',
    'transition: transform 60ms linear, width 120ms ease, height 120ms ease, background 120ms ease',
    'background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(255,255,255,0.55) 45%, rgba(0,0,0,0.25) 75%, rgba(0,0,0,0.55))',
    'border-radius: 50%',
    'box-shadow: 0 0 0 1px rgba(0,0,0,0.35), 0 8px 18px rgba(0,0,0,0.35)',
    'mix-blend-mode: normal',
  ].join(';');
  document.documentElement.appendChild(cursor);

  const ring = document.createElement('div');
  ring.id = '__demo_cursor_ring__';
  ring.style.cssText = [
    'position: fixed',
    'top: 0',
    'left: 0',
    'width: 44px',
    'height: 44px',
    'pointer-events: none',
    'z-index: 2147483646',
    'transform: translate3d(-100px, -100px, 0) scale(1)',
    'transition: transform 260ms cubic-bezier(0.16, 1, 0.3, 1), opacity 260ms ease',
    'border: 2px solid rgba(255,255,255,0.9)',
    'border-radius: 50%',
    'opacity: 0',
    'box-shadow: 0 0 0 1px rgba(0,0,0,0.25)',
  ].join(';');
  document.documentElement.appendChild(ring);

  const move = (x, y) => {
    cursor.style.transform = 'translate3d(' + (x - 11) + 'px, ' + (y - 11) + 'px, 0)';
    ring.style.transform = 'translate3d(' + (x - 22) + 'px, ' + (y - 22) + 'px, 0) scale(1)';
  };

  document.addEventListener('mousemove', (e) => move(e.clientX, e.clientY), true);
  document.addEventListener('mousedown', (e) => {
    ring.style.opacity = '1';
    ring.style.transform = 'translate3d(' + (e.clientX - 22) + 'px, ' + (e.clientY - 22) + 'px, 0) scale(0.55)';
  }, true);
  document.addEventListener('mouseup', (e) => {
    ring.style.transform = 'translate3d(' + (e.clientX - 22) + 'px, ' + (e.clientY - 22) + 'px, 0) scale(1.35)';
    setTimeout(() => { ring.style.opacity = '0'; }, 220);
  }, true);

  const style = document.createElement('style');
  style.textContent = [
    '* { cursor: none !important; }',
    '#__next-build-watcher, nextjs-portal, [data-nextjs-toast] { display: none !important; }',
  ].join('\\n');
  document.documentElement.appendChild(style);
})();
`;

async function installCursor(page: Page) {
  await page.addInitScript(CURSOR_INIT);
}

async function glideTo(page: Page, locator: Locator, steps = 28) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error("No bounding box for locator");
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y, { steps });
}

async function humanType(page: Page, locator: Locator, text: string, delay = 28) {
  await glideTo(page, locator);
  await page.waitForTimeout(180);
  await page.mouse.down();
  await page.waitForTimeout(80);
  await page.mouse.up();
  await page.waitForTimeout(160);
  await page.keyboard.type(text, { delay });
}

async function humanClick(page: Page, locator: Locator, pauseMs = 220) {
  await glideTo(page, locator);
  await page.waitForTimeout(pauseMs);
  await page.mouse.down();
  await page.waitForTimeout(70);
  await page.mouse.up();
}

async function beat(page: Page, ms = 700) {
  await page.waitForTimeout(ms);
}

async function sendPrompt(page: Page, text: string) {
  const textarea = page.getByPlaceholder(
    "Ask me to create a task or summarize what you need...",
  );
  await humanType(page, textarea, text, 18);
  await beat(page, 420);
  await humanClick(page, page.getByRole("button", { name: "Submit" }));
}

async function waitForAssistantIdle(page: Page) {
  await page.waitForTimeout(500);
  await expect(
    page.getByRole("button", { name: "Submit" }),
  ).toBeVisible({ timeout: 90_000 });
  await page.waitForTimeout(300);
}

test("tenviq marketing video", async ({ page, request }) => {
  test.setTimeout(300_000);

  await installCursor(page);

  await request
    .post("/api/demo/reset", { headers: { authorization: "Bearer dev" } })
    .catch(() => {});

  // Scene 1 — Sign in -------------------------------------------------------
  await page.goto("/sign-in");
  await page.mouse.move(200, 200);
  await beat(page, 900);

  await humanType(page, page.locator('input[name="email"]'), "demo@starter.local", 22);
  await beat(page, 240);
  await humanType(page, page.locator('input[name="password"]'), "demo123", 22);
  await beat(page, 380);

  await humanClick(page, page.getByRole("button", { name: /^sign in$/i }));

  await page.waitForURL(/\/(dashboard|organization|app)/, { timeout: 30_000 });
  await beat(page, 1100);

  // Scene 2 — Open assistant ------------------------------------------------
  await page.goto("/assistant");
  const composer = page.getByPlaceholder(
    "Ask me to create a task or summarize what you need...",
  );
  await expect(composer).toBeVisible({ timeout: 15_000 });
  await page.mouse.move(400, 400, { steps: 20 });
  await beat(page, 800);

  // Scene 3 — Create tasks one-by-one until the plan gate trips -------------
  await sendPrompt(
    page,
    "Add a single task titled 'Auth migration' with label FEATURE and priority HIGH.",
  );
  await waitForAssistantIdle(page);
  await beat(page, 600);

  await sendPrompt(
    page,
    "Now add one titled 'Billing dashboard' with label FEATURE and priority MEDIUM.",
  );
  await waitForAssistantIdle(page);
  await beat(page, 600);

  await sendPrompt(
    page,
    "Add another titled 'Onboarding tour' with label FEATURE and priority MEDIUM.",
  );
  await waitForAssistantIdle(page);
  await beat(page, 600);

  // This one should trip the Pro-plan limit.
  await sendPrompt(
    page,
    "One more: 'Pricing experiments' with label FEATURE and priority LOW.",
  );

  // Scene 4 — Plan-limit dialog --------------------------------------------
  const dialogTitle = page.getByRole("heading", {
    name: /plan limit reached/i,
  });
  await expect(dialogTitle).toBeVisible({ timeout: 90_000 });
  await beat(page, 2000);

  const upgradeBtn = page.getByRole("button", { name: /upgrade to team/i });
  await glideTo(page, upgradeBtn);
  await beat(page, 600);
  await page.mouse.down();
  await page.waitForTimeout(70);
  await page.mouse.up();

  // Scene 5 — Upgrade success -----------------------------------------------
  await page.waitForURL(/\/settings\/billing/, { timeout: 30_000 });
  await expect(page.getByText(/upgraded to team/i).first()).toBeVisible({
    timeout: 10_000,
  });
  await page.mouse.move(960, 400, { steps: 20 });
  await beat(page, 2800);

  // Scene 6 — Chart artifact ------------------------------------------------
  await page.goto("/assistant");
  await expect(composer).toBeVisible({ timeout: 15_000 });
  await page.mouse.move(500, 500, { steps: 20 });
  await beat(page, 700);

  await sendPrompt(
    page,
    "Give me a bar chart of my tasks grouped by status.",
  );

  await expect(
    page
      .locator("svg")
      .filter({ has: page.locator(".recharts-bar, .recharts-bar-rectangle") })
      .first(),
  ).toBeVisible({ timeout: 90_000 });
  await beat(page, 4200);
});
