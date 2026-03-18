import Link from "next/link";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { verifyEmailAddress } from "@/features/auth/server/verify-email";
import { buildAuthHref, getAuthFlowParams } from "@/features/auth/utils/auth-flow";
import { routes } from "@/shared/constants/routes";

type VerifyEmailPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const resolvedSearchParams = await searchParams;
  const token = getSingleValue(resolvedSearchParams.token)?.trim();
  const signInHref = buildAuthHref(routes.auth.login, getAuthFlowParams(resolvedSearchParams));

  if (!token) {
    return (
      <AuthCard title="Verify email" description="This verification link is invalid or incomplete.">
        <Link href={routes.auth.signup} className="text-sm underline underline-offset-4">
          Back to sign up
        </Link>
      </AuthCard>
    );
  }

  const result = await verifyEmailAddress(token);

  return (
    <AuthCard
      title={result.status === "verified" ? "Email verified" : "Verification failed"}
      description={
        result.status === "verified"
          ? "Your email address is now confirmed. You can sign in with your password."
          : "This verification link is invalid or has expired."
      }
    >
      <Link href={signInHref} className="text-sm underline underline-offset-4">
        Go to sign in
      </Link>
    </AuthCard>
  );
}
