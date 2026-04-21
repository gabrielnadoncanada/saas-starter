import type {
  GalleryCategory,
  GalleryShot,
} from "@/features/marketing/components/screenshot-gallery";

const SHOT_BASE = "/marketing/screenshots";

function shot(
  id: string,
  caption: string,
  alt: string,
  filename: string,
): GalleryShot {
  return {
    id,
    caption,
    alt,
    src: `${SHOT_BASE}/dark/${filename}.png`,
    srcLight: `${SHOT_BASE}/light/${filename}.png`,
  };
}

export const galleryCategories: GalleryCategory[] = [
  {
    id: "organization",
    label: "Organization",
    note: "Multi-tenant workspace with the AI surfaces you will actually ship.",
    shots: [
      shot("org-dashboard", "Organization / Dashboard", "Organization dashboard with KPIs", "dashboard"),
      shot("org-tasks", "Organization / Tasks", "Tasks table with labels, priorities and statuses", "tasks"),
      shot("org-assistant-home", "Assistant / Home", "AI assistant empty state with suggested prompts", "assistant-home"),
      shot("org-assistant-chat", "Assistant / Conversation", "AI assistant mid-conversation with tool calls", "assistant"),
      shot("org-assistant-chart", "Assistant / Chart artifact", "AI assistant rendering a bar chart artifact", "assistant-chart"),
      shot("org-members", "Organization / Members", "Team members and invitations", "settings-members"),
      shot("org-settings", "Organization / Settings", "Rename or delete the current organization", "settings-organization"),
      shot("org-activity", "Organization / Activity", "Per-tenant audit log of user actions", "settings-activity"),
    ],
  },
  {
    id: "account",
    label: "Personal account",
    shots: [
      shot("account-profile", "Account / Profile", "Profile settings", "settings"),
      shot("account-billing", "Account / Billing", "Subscription and plan controls", "settings-billing"),
      shot("account-security", "Account / Security", "Sessions, password, and two-factor authentication", "settings-security"),
      shot("account-preferences", "Account / Preferences", "Notification and UI preferences", "settings-preferences"),
    ],
  },
  {
    id: "admin",
    label: "Admin panel",
    note: "Role-gated operations dashboard for the platform owner.",
    shots: [
      shot("admin-dashboard", "Admin / Dashboard", "Admin overview with KPIs, signups chart and plan breakdown", "admin"),
      shot("admin-users", "Admin / Users", "Admin users directory with ban and impersonate", "admin-users"),
      shot("admin-user-detail", "Admin / User detail", "User detail drawer with sessions and role controls", "admin-user-detail"),
      shot("admin-organizations", "Admin / Organizations", "Organizations directory with plan and seat info", "admin-organizations"),
      shot("admin-organization-detail", "Admin / Organization detail", "Organization detail drawer with members and subscription", "admin-organization-detail"),
    ],
  },
  {
    id: "auth",
    label: "Auth",
    shots: [
      shot("auth-sign-in", "Auth / Sign in", "Sign-in page with email, password and OAuth", "sign-in"),
      shot("auth-sign-up", "Auth / Sign up", "Sign-up page", "sign-up"),
      shot("auth-forgot", "Auth / Forgot password", "Forgot password request screen", "forgot-password"),
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    shots: [
      shot("marketing-home", "Marketing / Home", "Marketing homepage", "marketing-home"),
      shot("marketing-pricing", "Marketing / Pricing", "Pricing page with plan comparison", "pricing"),
      shot("marketing-blog", "Marketing / Blog", "Blog index", "blog"),
      shot("marketing-contact", "Marketing / Contact", "Contact form", "contact"),
    ],
  },
  {
    id: "emails",
    label: "Emails",
    shots: [
      shot("email-magic-link", "Email / Magic link", "Magic link sign-in email", "email-magic-link"),
      shot("email-team-invitation", "Email / Team invite", "Team invitation email", "email-team-invitation"),
      shot("email-reset-password", "Email / Reset password", "Reset password email", "email-reset-password"),
      shot("email-verify-email", "Email / Verify email", "Email verification template", "email-verify-email"),
      shot("email-password-changed", "Email / Password changed", "Password changed notification", "email-password-changed"),
      shot("email-contact-message", "Email / Contact message", "Contact form message email", "email-contact-message"),
    ],
  },
];
