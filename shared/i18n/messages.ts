import type { AppLocale } from "@/shared/i18n/locales";

const enMessages = {
  common: {
    cancel: "Cancel",
    save: "Save",
    close: "Close",
    backToHome: "Back to home",
    back: "Go back",
  },
  notFound: {
    title: "Oops! Page not found.",
    description:
      "The page you're looking for does not exist or may have been removed.",
  },
  auth: {
    signIn: "Sign in",
    signUp: "Create account",
    forgotPassword: "Forgot password?",
  },
  settings: {
    title: "Account settings",
  },
  dashboard: {
    title: "Dashboard",
  },
} as const;

const frMessages = {
  common: {
    cancel: "Annuler",
    save: "Enregistrer",
    close: "Fermer",
    backToHome: "Retour a l'accueil",
    back: "Retour",
  },
  notFound: {
    title: "Oups, page introuvable.",
    description:
      "La page que vous cherchez n'existe pas ou n'est plus disponible.",
  },
  auth: {
    signIn: "Connexion",
    signUp: "Creer un compte",
    forgotPassword: "Mot de passe oublie ?",
  },
  settings: {
    title: "Parametres du compte",
  },
  dashboard: {
    title: "Tableau de bord",
  },
} as const;

export function getMessagesForLocale(locale: AppLocale) {
  return locale === "fr" ? frMessages : enMessages;
}
