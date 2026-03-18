import type { SignInWithPasswordInput } from "@/features/auth/schemas/credentials-auth.schema";
import type { SignInWithPasswordActionState } from "@/features/auth/types/credentials-auth.types";
import { authenticatePasswordCredentials } from "@/features/auth/server/credentials-user";
import { signInRateLimiter } from "@/features/auth/server/auth-rate-limit";
import { normalizeEmail } from "@/features/auth/server/passwords";

export async function signInWithPassword(
  input: SignInWithPasswordInput,
): Promise<SignInWithPasswordActionState> {
  const email = normalizeEmail(input.email);
  const rateLimit = signInRateLimiter.check(`signin:${email}`);

  if (!rateLimit.allowed) {
    return {
      error: "Too many sign-in attempts. Please try again later.",
      values: { ...input, email, password: "" },
    };
  }

  const result = await authenticatePasswordCredentials({
    email,
    password: input.password,
  });

  if (result.status === "email-not-verified") {
    return {
      error: "Verify your email before signing in.",
      code: "EMAIL_NOT_VERIFIED",
      values: { ...input, email, password: "" },
    };
  }

  if (result.status === "invalid") {
    return {
      error: "Invalid email or password.",
      values: { ...input, email, password: "" },
    };
  }

  return {};
}
