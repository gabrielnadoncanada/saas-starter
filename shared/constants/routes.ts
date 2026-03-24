export const routes = {
  marketing: {
    home: "/",
    pricing: "/pricing",
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
  },
  app: {
    dashboard: "/dashboard",
    tasks: "/dashboard/tasks",
    assistant: "/dashboard/assistant",
    account: "/dashboard/account",
    team: "/dashboard/team",
    billing: "/dashboard/billing",
    settings: "/dashboard/settings",
    settingsAuthentication: "/dashboard/settings/authentication",
  },
} as const;
