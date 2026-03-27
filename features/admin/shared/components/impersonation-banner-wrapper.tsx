import { getAuthSession } from "@/shared/lib/auth/get-session";
import { ImpersonationBanner } from "./impersonation-banner";

export async function ImpersonationBannerWrapper() {
  const session = await getAuthSession();
  const isImpersonating = !!session?.session?.impersonatedBy;

  if (!isImpersonating) {
    return null;
  }

  return <ImpersonationBanner />;
}
