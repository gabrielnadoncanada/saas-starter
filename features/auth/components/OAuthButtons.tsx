import { Button } from '@/shared/components/ui/button';
import {
  OAUTH_PROVIDER_LABELS,
  type OAuthProviderId
} from '@/shared/lib/auth/providers';

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
          <div className="w-full border-t border-gray-300" />
        </div>

        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
        </div>
      </div>

      {providers.map((provider) => {
        const isPending = pendingProvider === provider;

        return (
          <Button
            key={provider}
            type="button"
            variant="outline"
            className="w-full rounded-full"
            disabled={pendingProvider !== null}
            onClick={() => onProviderClick(provider)}
          >
            {isPending ? 'Please wait...' : `Continue with ${OAUTH_PROVIDER_LABELS[provider]}`}
          </Button>
        );
      })}
    </div>
  );
}
