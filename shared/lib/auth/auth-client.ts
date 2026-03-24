import { createAuthClient } from "better-auth/react";
import { magicLinkClient, organizationClient } from "better-auth/client/plugins";
import { stripeClient } from "@better-auth/stripe/client";

export const authClient = createAuthClient({
  plugins: [
    magicLinkClient(),
    organizationClient(),
    stripeClient({ subscription: true }),
  ],
});
