import { createAuthClient } from "better-auth/react";
import { adminClient, magicLinkClient, organizationClient } from "better-auth/client/plugins";
import { stripeClient } from "@better-auth/stripe/client";

export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    magicLinkClient(),
    organizationClient(),
    stripeClient({ subscription: true }),
  ],
});
