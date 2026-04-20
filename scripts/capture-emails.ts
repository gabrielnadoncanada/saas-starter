import { render } from "@react-email/render";
import { copyFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

import { chromium } from "playwright";

import { ContactMessageEmail } from "@/lib/email/templates/contact-message";
import { MagicLinkEmail } from "@/lib/email/templates/magic-link";
import { PasswordChangedTemplate } from "@/lib/email/templates/password-changed";
import { ResetPasswordTemplate } from "@/lib/email/templates/reset-password";
import { TeamInvitationEmail } from "@/lib/email/templates/team-invitation";
import { VerifyEmailTemplate } from "@/lib/email/templates/verify-email";

type EmailShot = {
  name: string;
  element: React.ReactElement;
};

const SHOTS: EmailShot[] = [
  {
    name: "email-magic-link",
    element: MagicLinkEmail({
      url: "https://tenviq.com/api/auth/callback?token=xxxxxxxxxxxx",
    }),
  },
  {
    name: "email-team-invitation",
    element: TeamInvitationEmail({
      inviterName: "Jordan",
      organizationName: "Acme",
      role: "member",
      invitationUrl: "https://tenviq.com/accept-invitation/1",
    }),
  },
  {
    name: "email-reset-password",
    element: ResetPasswordTemplate({
      url: "https://tenviq.com/reset-password?token=xxxxxxxxxxxx",
    }),
  },
  {
    name: "email-verify-email",
    element: VerifyEmailTemplate({
      url: "https://tenviq.com/verify-email?token=xxxxxxxxxxxx",
    }),
  },
  {
    name: "email-password-changed",
    element: PasswordChangedTemplate(),
  },
  {
    name: "email-contact-message",
    element: ContactMessageEmail({
      name: "Sarah Chen",
      email: "sarah@acme.com",
      message:
        "Hi! We are evaluating Tenviq for a multi-tenant AI assistant and would love to see a live demo of the public chat widget. Could we schedule a call this week?",
    }),
  },
];

const WIDTH = 900;
const HEIGHT = 1200;

const DARK_DIR = resolve(process.cwd(), "public/marketing/screenshots/dark");
const LIGHT_DIR = resolve(process.cwd(), "public/marketing/screenshots/light");

async function main() {
  mkdirSync(DARK_DIR, { recursive: true });
  mkdirSync(LIGHT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  for (const shot of SHOTS) {
    const html = await render(shot.element);
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);

    const lightPath = resolve(LIGHT_DIR, `${shot.name}.png`);
    await page.screenshot({
      path: lightPath,
      fullPage: false,
      animations: "disabled",
    });
    const darkPath = resolve(DARK_DIR, `${shot.name}.png`);
    copyFileSync(lightPath, darkPath);
    console.log(`captured ${shot.name}`);
  }

  await ctx.close();
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
