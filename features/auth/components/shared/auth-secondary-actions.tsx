"use client";

import { Loader2, Mail } from "lucide-react";
import { OAuthButtons } from "@/features/auth/components/oauth/OAuthButtons";
import { Button } from "@/shared/components/ui/button";
import type { OAuthProviderId } from "@/shared/lib/auth/oauth-config";

type AuthSecondaryActionsProps = {
  allowMagicLink: boolean;
  isSendingMagicLink: boolean;
  providers: OAuthProviderId[];
  pendingProvider: OAuthProviderId | null;
  onMagicLink: () => void;
  onProviderClick: (provider: OAuthProviderId) => void;
};

export function AuthSecondaryActions({
  allowMagicLink,
  isSendingMagicLink,
  providers,
  pendingProvider,
  onMagicLink,
  onProviderClick,
}: AuthSecondaryActionsProps) {
  if (!allowMagicLink && providers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      {allowMagicLink ? (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onMagicLink}
          disabled={isSendingMagicLink}
        >
          {isSendingMagicLink ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending link...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Continue with Email Link
            </>
          )}
        </Button>
      ) : null}

      {providers.length > 0 ? (
        <OAuthButtons
          providers={providers}
          pendingProvider={pendingProvider}
          onProviderClick={onProviderClick}
        />
      ) : null}
    </div>
  );
}
