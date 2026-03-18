import type { FormActionState } from "@/shared/types/form-action-state";
import type {
  ForgotPasswordInput,
  ResendVerificationEmailInput,
  ResetPasswordInput,
  SignInWithPasswordInput,
  SignUpWithPasswordInput,
  UpdatePasswordInput,
} from "@/features/auth/schemas/credentials-auth.schema";

export type SignUpWithPasswordActionState = FormActionState<SignUpWithPasswordInput>;

export type SignInWithPasswordActionState = FormActionState<SignInWithPasswordInput> & {
  code?: "EMAIL_NOT_VERIFIED";
};

export type ResendVerificationEmailActionState =
  FormActionState<ResendVerificationEmailInput>;

export type ForgotPasswordActionState = FormActionState<ForgotPasswordInput>;
export type ResetPasswordActionState = FormActionState<ResetPasswordInput>;
export type UpdatePasswordActionState = FormActionState<UpdatePasswordInput>;
