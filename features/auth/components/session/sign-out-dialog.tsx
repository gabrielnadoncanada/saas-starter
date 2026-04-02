"use client";

import { useRouter } from "@/shared/i18n/navigation";
import { useState } from "react";

import { ConfirmDialog } from "@/shared/components/dialogs/confirm-dialog";
import { routes } from "@/shared/constants/routes";
import { authClient } from "@/shared/lib/auth/auth-client";

interface SignOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  function buildSignInRedirectHref(currentPath: string) {
    const query = new URLSearchParams({
      redirect: currentPath,
    });

    return `${routes.auth.login}?${query.toString()}`;
  }

  async function handleSignOut() {
    setIsLoading(true);

    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    try {
      await authClient.signOut();
      router.push(buildSignInRedirectHref(currentPath));
      router.refresh();
    } finally {
      setIsLoading(false);
      onOpenChange(false);
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Sign out"
      desc="Are you sure you want to sign out? You will need to sign in again to access your account."
      confirmText="Sign out"
      destructive
      handleConfirm={() => {
        void handleSignOut();
      }}
      isLoading={isLoading}
      className="sm:max-w-sm"
    />
  );
}

