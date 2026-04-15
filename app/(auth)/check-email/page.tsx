import { Mail } from "lucide-react";
import Link from "next/link";

import { routes } from "@/constants/routes";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ResendMagicLinkButton } from "@/features/auth/components/oauth/resend-magic-link-button";
import { buildCallbackURL } from "@/lib/auth/callback-url";

type CheckEmailPageProps = {
  searchParams: Promise<{
    email?: string;
    callbackUrl?: string;
  }>;
};

export default async function CheckEmailPage({
  searchParams,
}: CheckEmailPageProps) {
  const { email: rawEmail, callbackUrl } = await searchParams;
  const email = rawEmail?.trim() || null;
  const signInHref = buildCallbackURL(routes.auth.login, callbackUrl);

  return (
    <AuthShell
      eyebrow="Magic link · Sent"
      title="Check your inbox"
      description="We sent a one-time sign-in link. Open it to continue to your workspace."
      footer={
        <p className="text-center text-xs text-muted-foreground">
          Wrong address?{" "}
          <Link
            href={signInHref}
            className="font-medium text-foreground underline underline-offset-4 decoration-brand/50 hover:decoration-brand"
          >
            Back to sign in
          </Link>
          .
        </p>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 border border-border bg-muted/40 px-4 py-3">
          <Mail
            className="mt-0.5 size-4 shrink-0 text-brand"
            strokeWidth={1.75}
          />
          <div className="min-w-0 space-y-1 text-sm">
            <p className="label-mono">Sent to</p>
            <p className="truncate font-mono text-sm text-foreground">
              {email ?? "your inbox"}
            </p>
          </div>
        </div>

        {email ? (
          <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              Didn't receive it? Check spam or resend below.
            </p>
            <ResendMagicLinkButton email={email} callbackUrl={callbackUrl} />
          </div>
        ) : null}
      </div>
    </AuthShell>
  );
}
