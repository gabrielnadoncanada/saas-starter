export const routes = {
  marketing: {
    home: "/",
    pricing: "/pricing",
  },
  auth: {
    login: "/sign-in",
    signup: "/sign-up",
    checkEmail: "/check-email",
    postSignIn: "/post-sign-in",
  },
  app: {
    dashboard: "/dashboard",
    tasks: "/dashboard/tasks",
    assistant: "/dashboard/assistant",
    settings: "/dashboard/settings",
    settingsAccount: "/dashboard/settings/account",
    settingsAuthentication: "/dashboard/settings/authentication",
    settingsActivityLog: "/dashboard/settings/activity",
    settingsTeam: "/dashboard/settings/team",
  },
} as const;
