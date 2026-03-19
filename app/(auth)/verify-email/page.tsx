import Link from "next/link";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { routes } from "@/shared/constants/routes";

type VerifyEmailPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const resolvedSearchParams = await searchParams;
  const error = getSingleValue(resolvedSearchParams.error);

  // Better Auth handles verification at /api/auth/verify-email and redirects here.
  // If there's an error parameter, verification failed.
  if (error) {
    return (
      <AuthCard
        title="Verification failed"
        description="This verification link is invalid or has expired."
      >
        <Link href={routes.auth.signup} className="text-sm underline underline-offset-4">
          Back to sign up
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Email verified"
      description="Your email address is now confirmed. You can sign in."
    >
      <Link href={routes.auth.login} className="text-sm underline underline-offset-4">
        Go to sign in
      </Link>
    </AuthCard>
  );
}
