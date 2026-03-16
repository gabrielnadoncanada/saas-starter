import { Button } from '@/shared/components/ui/button';
import {
  getOAuthProviderConfig,
  type OAuthProviderId
} from '@/shared/lib/auth/providers';
import { OAuthProviderIcon } from '@/features/auth/components/OAuthProviderIcon';

type OAuthButtonsProps = {
  providers: OAuthProviderId[];
  pendingProvider: OAuthProviderId | null;
  onProviderClick: (provider: OAuthProviderId) => void;
};

export function OAuthButtons({
  providers,
  pendingProvider,
  onProviderClick
}: OAuthButtonsProps) {
  if (providers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>

        <div className="relative flex justify-center text-sm">
          <span className="bg-background px-2 text-muted-foreground text-uppercase">Or continue with</span>
        </div>
      </div>

      {providers.map((provider) => {
        const isPending = pendingProvider === provider;
        const providerConfig = getOAuthProviderConfig(provider);

        return (
          <Button
            key={provider}
            type="button"
            variant="outline"
            className="w-full "
            disabled={pendingProvider !== null}
            onClick={() => onProviderClick(provider)}
          >
            <OAuthProviderIcon provider={provider} className="mr-2 h-4 w-4 shrink-0" />
            {isPending ? 'Please wait...' : providerConfig.authButtonLabel}
          </Button>
        );
      })}
    </div>
  );
}
