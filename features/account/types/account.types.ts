import type { DeleteAccountInput } from "@/features/account/schemas/account.schema";
import type { OAuthProviderId } from "@/shared/lib/auth/oauth-config";
import type { FormActionState } from "@/shared/types/form-action-state";

export type DeleteAccountActionState = FormActionState<DeleteAccountInput>;

export type UpdateAccountValues = {
  name: string;
  phoneNumber: string | null;
};

export type UpdateAccountActionState = FormActionState<UpdateAccountValues>;

export type LinkedAccountsActionState = FormActionState<{
  provider: OAuthProviderId;
}>;

export type LinkedProviderOverview = {
  provider: OAuthProviderId;
  linkedAt: Date | null;
  isLinked: boolean;
  canUnlink: boolean;
};

export type SecuritySettingsFeedback = {
  error?: string;
  success?: string;
};

export type SecuritySettingsActionState = FormActionState;

export type GeneralSettingsInitialValues = {
  name: string;
  email: string;
  phoneNumber: string | null;
  image: string | null;
};