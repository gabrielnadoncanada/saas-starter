import { TwoFactorVerificationForm } from "@/features/auth/components/two-factor/two-factor-verification-form";

export default async function VerifyTwoFactorPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return <TwoFactorVerificationForm callbackUrl={callbackUrl} />;
}
