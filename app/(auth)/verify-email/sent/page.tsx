import Link from "next/link";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { buildAuthHref, getAuthFlowParams } from "@/features/auth/utils/auth-flow";
import { routes } from "@/shared/constants/routes";

type VerifyEmailSentPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function VerifyEmailSentPage({
  searchParams,
}: VerifyEmailSentPageProps) {
  const signInHref = buildAuthHref(routes.auth.login, getAuthFlowParams(await searchParams));

  return (
    <AuthCard
      title="Check your email"
      description="We sent you a verification link. Open it to activate your account."
    >
      <p className="text-sm text-muted-foreground">
        After verification,{" "}
        <Link href={signInHref} className="underline underline-offset-4">
          return to sign in
        </Link>
        .
      </p>
    </AuthCard>
  );
}
