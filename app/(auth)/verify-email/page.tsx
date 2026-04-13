import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { routes } from "@/constants/routes";

type VerifyEmailPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { error } = await searchParams;

  if (error) {
    return (
      <Card className="gap-4">
        <CardHeader>
          <CardTitle className="text-lg tracking-tight">
            Verification failed
          </CardTitle>
          <CardDescription>
            This verification link is invalid or has expired.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Link
            href={routes.auth.signup}
            className="text-sm underline underline-offset-4"
          >
            Back to sign up
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-lg tracking-tight">Email verified</CardTitle>
        <CardDescription>
          Your email address is now confirmed. You can sign in.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Link
          href={routes.auth.login}
          className="text-sm underline underline-offset-4"
        >
          Go to sign in
        </Link>
      </CardContent>
    </Card>
  );
}
