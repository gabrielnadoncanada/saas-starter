import {
  adminClient,
  magicLinkClient,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { routes } from "@/shared/constants/routes";

export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    magicLinkClient(),
    organizationClient(),
    twoFactorClient({
      onTwoFactorRedirect: async () => {
        window.location.assign(routes.auth.twoFactor);
      },
    }),
  ],
});
