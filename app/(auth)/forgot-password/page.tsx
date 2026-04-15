import Link from "next/link";

import { routes } from "@/constants/routes";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ForgotPasswordForm } from "@/features/auth/components/password/forgot-password-form";

export default async function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Recovery · Password"
      title="Forgot your password?"
      description="Enter the email tied to your account and we'll send you a reset link."
      footer={
        <p className="text-center text-xs text-muted-foreground">
          Remembered it?{" "}
          <Link
            href={routes.auth.login}
            className="font-medium text-foreground underline underline-offset-4 decoration-brand/50 hover:decoration-brand"
          >
            Back to sign in
          </Link>
          .
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
