import Link from "next/link";

import { buildAuthHref, getAuthFlowParams } from "@/features/auth/utils/auth-flow";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { routes } from "@/shared/constants/routes";

type VerifyEmailSentPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function VerifyEmailSentPage({
  searchParams,
}: VerifyEmailSentPageProps) {
  const signInHref = buildAuthHref(routes.auth.login, getAuthFlowParams(await searchParams));

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-lg tracking-tight">Check your email</CardTitle>
        <CardDescription>
          We sent you a verification link. Open it to activate your account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground">
          After verification,{" "}
          <Link href={signInHref} className="underline underline-offset-4">
            return to sign in
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}