import type { OAuthProviderId } from "@/lib/auth/providers";

export type ActionFeedback = {
  error?: string;
  success?: string;
};

export type DeleteAccountActionState = ActionFeedback;

export type UpdateAccountActionState = {
  name?: string;
  error?: string;
  success?: string;
};

export type LinkedAccountsActionState = {
  provider?: OAuthProviderId;
  error?: string;
  success?: string;
};

export type LinkedProviderOverview = {
  provider: OAuthProviderId;
  linkedAt: string | null;
  linkedAtLabel: string | null;
  isLinked: boolean;
  canUnlink: boolean;
};

export type SecuritySettingsFeedback = ActionFeedback;

export type GeneralSettingsInitialValues = {
  name: string;
  email: string;
  image: string | null;
};
