import type { OAuthProviderId } from "@/shared/lib/auth/providers";
import type { FormActionState } from "@/shared/types/form-action-state";
import type { DeleteAccountInput } from "@/features/account/schemas/account.schema";

export type DeleteAccountValues = DeleteAccountInput;

export type DeleteAccountActionState = FormActionState<DeleteAccountValues>;

export type UpdateAccountValues = {
  name: string;
  phoneNumber: string | null;
};

export type UpdateAccountActionState = FormActionState<UpdateAccountValues>;

export type LinkedAccountsValues = {
  provider: OAuthProviderId;
};

export type LinkedAccountsActionState = FormActionState<LinkedAccountsValues>;

export type SecuritySettingsFeedback = {
  error?: string;
  success?: string;
};

export type LinkedProviderOverview = {
  provider: OAuthProviderId;
  linkedAt: string | null;
  isLinked: boolean;
  canUnlink: boolean;
};

export type SecuritySettingsActionState = FormActionState;

export type GeneralSettingsInitialValues = {
  name: string;
  email: string;
  phoneNumber: string | null;
  image: string | null;
};
