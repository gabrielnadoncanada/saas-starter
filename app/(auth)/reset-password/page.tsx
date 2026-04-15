import Link from "next/link";

import { routes } from "@/constants/routes";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ResetPasswordForm } from "@/features/auth/components/password/reset-password-form";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token: rawToken } = await searchParams;
  const token = rawToken?.trim();

  return (
    <AuthShell
      eyebrow="Recovery · New password"
      title={token ? "Choose a new password" : "Link expired"}
      description={
        token
          ? "Pick something strong. You'll sign in with this next time."
          : "This reset link is invalid or has already been used."
      }
      footer={
        <p className="text-center text-xs text-muted-foreground">
          Need a new link?{" "}
          <Link
            href={routes.auth.forgotPassword}
            className="font-medium text-foreground underline underline-offset-4 decoration-brand/50 hover:decoration-brand"
          >
            Request another reset
          </Link>
          .
        </p>
      }
    >
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Head back to the{" "}
          <Link
            href={routes.auth.forgotPassword}
            className="font-medium text-foreground underline underline-offset-4 decoration-brand/50 hover:decoration-brand"
          >
            password reset page
          </Link>{" "}
          to start over.
        </p>
      )}
    </AuthShell>
  );
}
