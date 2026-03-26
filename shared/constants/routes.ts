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
  },
  settings: {
    profile: "/settings/",
    preferences: "/settings/preferences",
    billing: "/settings/billing",
    organization: "/settings/organization",
    authentication: "/settings/authentication",
  },
} as const;
