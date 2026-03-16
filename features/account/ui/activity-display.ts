import {
  AlertCircle,
  CheckCircle,
  Link2,
  Mail,
  Settings,
  Unlink2,
  UserCog,
  UserMinus,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

export const activityIconMap: Record<string, LucideIcon> = {
  SIGN_UP: UserPlus,
  SIGN_IN: UserCog,
  DELETE_ACCOUNT: UserMinus,
  UPDATE_ACCOUNT: Settings,
  CREATE_TEAM: UserPlus,
  REMOVE_TEAM_MEMBER: UserMinus,
  INVITE_TEAM_MEMBER: Mail,
  ACCEPT_INVITATION: CheckCircle,
  LINK_AUTH_PROVIDER: Link2,
  UNLINK_AUTH_PROVIDER: Unlink2,
};

export const emptyActivityIcon = AlertCircle;

export function formatActivityAction(action: string) {
  switch (action) {
    case "SIGN_UP":
      return "You signed up";
    case "SIGN_IN":
      return "You signed in";
    case "DELETE_ACCOUNT":
      return "You deleted your account";
    case "UPDATE_ACCOUNT":
      return "You updated your account";
    case "CREATE_TEAM":
      return "You created a new team";
    case "REMOVE_TEAM_MEMBER":
      return "You removed a team member";
    case "INVITE_TEAM_MEMBER":
      return "You invited a team member";
    case "ACCEPT_INVITATION":
      return "You accepted an invitation";
    case "LINK_AUTH_PROVIDER":
      return "You linked a sign-in provider";
    case "UNLINK_AUTH_PROVIDER":
      return "You unlinked a sign-in provider";
    default:
      return "Unknown action occurred";
  }
}
