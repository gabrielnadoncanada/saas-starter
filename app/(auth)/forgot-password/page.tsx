import Link from "next/link";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { routes } from "@/shared/constants/routes";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot password"
      description="Enter your email address and we will send you a reset link."
    >
      <div className="space-y-4">
        <ForgotPasswordForm />
        <p className="text-sm text-muted-foreground">
          Remembered your password?{" "}
          <Link href={routes.auth.login} className="underline underline-offset-4">
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
