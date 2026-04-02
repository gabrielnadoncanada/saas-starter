import { ResendMagicLinkButton } from "@/features/auth/components/oauth/resend-magic-link-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { routes } from "@/shared/constants/routes";
import { buildCallbackURL } from "@/shared/lib/auth/callback-url";
import { Link } from "@/shared/i18n/navigation";

type CheckEmailPageProps = {
  searchParams: Promise<{
    email?: string;
    callbackUrl?: string;
  }>;
};

export default async function CheckEmailPage({
  searchParams,
}: CheckEmailPageProps) {
  const { email: rawEmail, callbackUrl } = await searchParams;
  const email = rawEmail?.trim() || null;
  const signInHref = buildCallbackURL(routes.auth.login, callbackUrl);

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-lg tracking-tight">
          Check your email
        </CardTitle>
        <CardDescription>
          We sent a magic sign-in link to your email address.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Open the email and click the link to complete sign-in.
        </p>

        <p className="text-sm text-muted-foreground">
          {email ? (
            <>
              Haven&apos;t received it?{" "}
              <ResendMagicLinkButton email={email} callbackUrl={callbackUrl} />
            </>
          ) : (
            <>
              Missing the email address?{" "}
              <Link
                href={signInHref}
                className="font-medium underline underline-offset-4 hover:text-primary"
              >
                Go back to sign in
              </Link>
            </>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
