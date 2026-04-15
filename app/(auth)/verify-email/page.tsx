import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

import { routes } from "@/constants/routes";
import { AuthShell } from "@/features/auth/components/auth-shell";

type VerifyEmailPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { error } = await searchParams;

  if (error) {
    return (
      <AuthShell
        eyebrow="Verification · Failed"
        title="Link invalid or expired"
        description="This verification link can't be used. Create a new account or request a fresh email."
        footer={
          <p className="text-center text-xs text-muted-foreground">
            Need help?{" "}
            <Link
              href={routes.auth.signup}
              className="font-medium text-foreground underline underline-offset-4 decoration-brand/50 hover:decoration-brand"
            >
              Back to sign up
            </Link>
            .
          </p>
        }
      >
        <div className="flex items-start gap-3 border border-destructive/40 bg-destructive/5 px-4 py-3">
          <XCircle
            className="mt-0.5 size-4 shrink-0 text-destructive"
            strokeWidth={1.75}
          />
          <p className="text-sm">
            The link has been used or has expired. Request a new verification
            email from the sign-up page.
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Verification · Complete"
      title="Email verified"
      description="Your email is confirmed. You're clear to sign in and continue setup."
      footer={
        <p className="text-center text-xs text-muted-foreground">
          Ready to go?{" "}
          <Link
            href={routes.auth.login}
            className="font-medium text-foreground underline underline-offset-4 decoration-brand/50 hover:decoration-brand"
          >
            Go to sign in
          </Link>
          .
        </p>
      }
    >
      <div className="flex items-start gap-3 border border-brand/30 bg-brand/5 px-4 py-3">
        <CheckCircle2
          className="mt-0.5 size-4 shrink-0 text-brand"
          strokeWidth={1.75}
        />
        <p className="text-sm">
          Great — your account is active. Keep the momentum going and sign in.
        </p>
      </div>
    </AuthShell>
  );
}
