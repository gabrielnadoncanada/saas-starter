import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { routes } from "@/constants/routes";
import { ForgotPasswordForm } from "@/features/auth/components/password/forgot-password-form";

export default async function ForgotPasswordPage() {
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-lg tracking-tight">
          Forgot password
        </CardTitle>
        <CardDescription>
          Enter your email address and we will send you a reset link.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <ForgotPasswordForm />
          <p className="text-sm text-muted-foreground">
            Remembered your password?
            <Link
              href={routes.auth.login}
              className="underline underline-offset-4"
            >
              Back to sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
