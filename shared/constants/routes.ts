export const routes = {
  marketing: {
    home: "/",
    pricing: "/pricing",
    privacy: "/privacy",
    terms: "/terms",
  },
  auth: {
    login: "/sign-in",
    signup: "/sign-up",
    checkEmail: "/check-email",
    forgotPassword: "/forgot-password",
    postSignIn: "/post-sign-in",
    resetPassword: "/reset-password",
    verifyEmail: "/verify-email",
    verifyEmailSent: "/verify-email/sent",
    twoFactor: "/verify-2fa",
  },
  app: {
    dashboard: "/dashboard",
    tasks: "/dashboard/tasks",
    assistant: "/dashboard/assistant",
  },
  admin: {
    dashboard: "/admin",
    users: "/admin/users",
    organizations: "/admin/organizations",
  },
  settings: {
    profile: "/settings",
    preferences: "/settings/preferences",
    security: "/settings/security",
    billing: "/settings/billing",
    organization: "/settings/organization",
    members: "/settings/members",
  },
} as const;
