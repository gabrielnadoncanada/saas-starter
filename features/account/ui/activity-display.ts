import {
  AlertCircle,
  CheckCircle,
  Crown,
  Link2,
  Mail,
  Settings,
  Unlink2,
  UserCog,
  UserMinus,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

import { terminology } from "@/shared/constants/terminology";

export const activityIconMap: Record<string, LucideIcon> = {
  user_created: UserPlus,
  user_signed_in: UserCog,
  user_deleted: UserMinus,
  profile_updated: Settings,
  organization_created: UserPlus,
  organization_member_removed: UserMinus,
  organization_member_invited: Mail,
  organization_member_invite_accepted: CheckCircle,
  organization_member_role_updated: Crown,
  account_linked: Link2,
  account_unlinked: Unlink2,
};

export const emptyActivityIcon = AlertCircle;

function getStringValue(
  metadata: Record<string, unknown>,
  key: string,
) {
  const value = metadata[key];
  return typeof value === "string" ? value : null;
}

function formatProviderLabel(providerId: string | null) {
  if (!providerId) {
    return "a sign-in provider";
  }

  return providerId.charAt(0).toUpperCase() + providerId.slice(1);
}

export function formatActivityAction(
  action: string,
  metadata: Record<string, unknown>,
) {
  switch (action) {
    case "user_created":
      return "You signed up";
    case "user_signed_in": {
      const loginMethod = getStringValue(metadata, "loginMethod");
      return loginMethod
        ? `You signed in via ${formatProviderLabel(loginMethod)}`
        : "You signed in";
    }
    case "user_deleted":
      return "You deleted your account";
    case "profile_updated":
      return "You updated your account";
    case "organization_created":
      return `You created a new ${terminology.singular}`;
    case "organization_member_removed": {
      const memberEmail = getStringValue(metadata, "memberEmail");
      return memberEmail
        ? `You removed ${memberEmail}`
        : `You removed a ${terminology.singular} member`;
    }
    case "organization_member_invited": {
      const inviteeEmail = getStringValue(metadata, "inviteeEmail");
      return inviteeEmail
        ? `You invited ${inviteeEmail}`
        : `You invited a ${terminology.singular} member`;
    }
    case "organization_member_invite_accepted":
      return "You accepted an invitation";
    case "organization_member_role_updated":
      return `You updated a ${terminology.singular} member role`;
    case "account_linked":
      return `You linked ${formatProviderLabel(getStringValue(metadata, "providerId"))}`;
    case "account_unlinked":
      return `You unlinked ${formatProviderLabel(getStringValue(metadata, "providerId"))}`;
    default:
      return "Account activity recorded";
  }
}
