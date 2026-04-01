import Link from "next/link";

import { ResetPasswordForm } from "@/features/auth/components/password/reset-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { routes } from "@/shared/constants/routes";

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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>
          {token
            ? "Choose a new password for your account."
            : "This reset link is invalid or incomplete."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <p className="text-sm text-muted-foreground">
            <Link
              href={routes.auth.forgotPassword}
              className="underline underline-offset-4"
            >
              Request a new reset link
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
