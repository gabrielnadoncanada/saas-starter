import { MailCheck } from "lucide-react";
import Link from "next/link";

import { routes } from "@/constants/routes";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { buildCallbackURL } from "@/lib/auth/callback-url";

type VerifyEmailSentPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function VerifyEmailSentPage({
  searchParams,
}: VerifyEmailSentPageProps) {
  const { callbackUrl } = await searchParams;
  const signInHref = buildCallbackURL(routes.auth.login, callbackUrl);

  return (
    <AuthShell
      eyebrow="Verification · Check your inbox"
      title="Confirm your email"
      description="We sent a verification link. Open it to activate your account."
      footer={
        <p className="text-center text-xs text-muted-foreground">
          Already verified?{" "}
          <Link
            href={signInHref}
            className="font-medium text-foreground underline underline-offset-4 decoration-brand/50 hover:decoration-brand"
          >
            Return to sign in
          </Link>
          .
        </p>
      }
    >
      <div className="flex items-start gap-3 border border-border bg-muted/40 px-4 py-3">
        <MailCheck
          className="mt-0.5 size-4 shrink-0 text-brand"
          strokeWidth={1.75}
        />
        <div className="space-y-1 text-sm">
          <p className="font-medium">Next step</p>
          <p className="text-muted-foreground">
            Open the message we just sent and click the confirmation link.
            Nothing will happen in this tab until you do.
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
