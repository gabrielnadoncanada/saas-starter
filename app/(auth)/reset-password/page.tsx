import Link from "next/link";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { routes } from "@/shared/constants/routes";

type ResetPasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const token = getSingleValue((await searchParams).token)?.trim();

  if (!token) {
    return (
      <AuthCard title="Reset password" description="This reset link is invalid or incomplete.">
        <p className="text-sm text-muted-foreground">
          <Link href={routes.auth.forgotPassword} className="underline underline-offset-4">
            Request a new reset link
          </Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Reset password" description="Choose a new password for your account.">
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
