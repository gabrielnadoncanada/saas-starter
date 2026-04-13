import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { routes } from "@/constants/routes";
import { buildCallbackURL } from "@/lib/auth/callback-url";

type VerifyEmailSentPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function VerifyEmailSentPage({
  searchParams,
}: VerifyEmailSentPageProps) {
  const { callbackUrl } = await searchParams;
  const signInHref = buildCallbackURL(routes.auth.login, callbackUrl);

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-lg tracking-tight">
          Check your email
        </CardTitle>
        <CardDescription>
          We sent you a verification link. Open it to activate your account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground">
          After verification,
          <Link href={signInHref} className="underline underline-offset-4">
            return to sign in
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}
