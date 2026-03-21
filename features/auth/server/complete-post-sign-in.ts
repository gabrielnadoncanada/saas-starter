import { ensureUserWorkspace } from "@/features/auth/server/onboarding";

type CompletePostSignInParams = {
  email: string;
};

export function completePostSignIn({ email }: CompletePostSignInParams) {
  return ensureUserWorkspace(email);
}
