# Billing & Subscriptions

> Implement subscription billing with Stripe or Polar in your Next.js Prisma application

> Source: https://makerkit.dev/docs/nextjs-prisma/billing/overview

---

Add subscription billing to your Next.js Prisma application with built-in support for Stripe and Polar. Define your pricing tiers once, swap providers through an environment variable, and manage the complete subscription lifecycle without writing provider-specific code.

MakerKit's billing layer sits on top of Better Auth and provides a unified `BillingClient` API. This abstraction handles checkout sessions, customer portals, plan limits, feature entitlements, and metered usage across both Stripe and Polar.

**Access raw SDKs when needed:** For features beyond the unified API, call `billing.getProviderClient()` to work directly with Stripe or Polar.

## What You Get

The billing system includes:

- **Provider Flexibility** - Toggle between Stripe and Polar with a single env var
- **Full Subscription Lifecycle** - Handle creation, upgrades, downgrades, cancellations, and reactivations
- **Multi-Tenant Ready** - Bill both individual users and team accounts
- **Configurable Pricing** - Define products with multiple plans and billing intervals
- **Seat-Based Pricing** - Charge based on team size with quantity billing
- **Trial Support** - Offer free trials that convert automatically
- **Self-Service Portal** - Let customers manage billing through provider-hosted portals
- **Event Hooks** - Run custom code when subscription events occur
- **Role-Based Access** - Control who can manage billing with permissions

### Provider Selection

Switch billing providers via environment variable:

```bash
# Use Stripe (default)
NEXT_PUBLIC_BILLING_PROVIDER=stripe

# Use Polar
NEXT_PUBLIC_BILLING_PROVIDER=polar
```

The same application code works with either provider - only configuration changes.

## Core Concepts

Billing operations are **context-aware**: identical code paths serve both **personal accounts** and **team organizations**. Grasping these identifiers will help you debug issues and extend the system confidently.

### Billing Context: `referenceId` + `customerType`

- **`referenceId`**: Identifies the subscription owner:
  - For personal billing: the **user ID**
  - For team billing: the **organization ID**
- **`customerType`**: Specifies the billing entity type:
  - `'user'` for individual accounts
  - `'organization'` for team accounts (note: not all providers support true org customers)

The billing page automatically determines context from the active session:

- **Individual accounts**: `referenceId = session.user.id`, `customerType = 'user'`
- **Team accounts**: `referenceId = session.session.activeOrganizationId`, `customerType = 'organization'`

### Key Identifiers

| Identifier | Purpose | Examples | Details |
|------------|---------|----------|---------|
| `customerId` | Provider's customer reference | Stripe: `cus_…` | Powers portal access, entitlements, and usage meters. Stripe maintains separate customer records for users and organizations. |
| `subscriptionId` | ID used in cancel/restore/upgrade calls | Varies by provider | **Note:** The active provider determines this value. The kit UI pulls it from `subscription.providerSubscriptionId`. |
| `providerSubscriptionId` | Raw subscription ID from provider | Stripe: `sub_…` | Available on the `Subscription` object returned by `billing.listSubscriptions`. |

### Permission Model

- **Personal accounts**: Users manage their own billing directly.
- **Team accounts**: Better Auth org permissions on the `billing` resource control access.

Standard permission mapping:

| Permission | Allows |
|-----------|--------|
| `billing:read` | Access billing page, view subscriptions |
| `billing:create` | Initiate checkout, upgrade plans |
| `billing:update` | Access customer portal, restore subscriptions |
| `billing:delete` | Cancel active subscriptions |

### Essential Environment Variables

- **`NEXT_PUBLIC_BILLING_PROVIDER`**: Set to `stripe` (default) or `polar`
- **`NEXT_PUBLIC_SITE_URL`**: Absolute URL for server-side redirects (e.g., `https://yourdomain.com`)

Provider-specific configuration is covered in [Stripe Setup](./stripe-setup) and [Polar Setup](./polar-setup).

## Package Structure

The billing system spans multiple packages in the monorepo:

```
packages/
├── billing/
│   ├── api/             # @kit/billing-api - Unified BillingClient
│   ├── core/            # @kit/billing - Core types and registry
│   ├── config/          # @kit/web-billing-config - App config
│   ├── stripe/          # @kit/billing-stripe - Stripe provider
│   ├── polar/           # @kit/billing-polar - Polar provider
│   └── ui/              # @kit/billing-ui - UI components
├── better-auth/
│   └── src/plugins/
│       └── billing.ts   # Better Auth billing plugin (provider factory)
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              UI LAYER                                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │ pricing-table   │  │ checkout-button │  │ subscription-   │              │
│  │                 │  │                 │  │ card            │              │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘              │
│           │                    │                    │                        │
│  ┌────────┴────────┐  ┌────────┴────────┐  ┌────────┴────────┐              │
│  │ plan-picker     │  │ billing-portal- │  │ cancel-dialog   │              │
│  │                 │  │ button          │  │                 │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
│                              @kit/billing-ui                                 │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVER ACTIONS                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  billing-server-actions.ts                                          │    │
│  │  • createCheckoutSessionAction                                      │    │
│  │  • createBillingPortalSessionAction                                 │    │
│  │  • cancelSubscriptionAction                                         │    │
│  │  • restoreSubscriptionAction                                        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BILLING CLIENT                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  getBilling(auth) → BillingClient                                   │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │  Methods:                  │  Utilities:                    │    │    │
│  │  │  • checkout()              │  • checkPlanLimit()            │    │    │
│  │  │  • portal()                │  • checkEntitlement()          │    │    │
│  │  │  • listSubscriptions()     │  • recordUsage()               │    │    │
│  │  │  • cancelSubscription()    │  • capabilities                │    │    │
│  │  │  • restoreSubscription()   │  • getProvider()               │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                              @kit/billing-api                                │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PROVIDER REGISTRY                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  NEXT_PUBLIC_BILLING_PROVIDER env var → Provider Factory (lazy)    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│         STRIPE PROVIDER          │  │         POLAR PROVIDER           │
│  ┌────────────────────────────┐  │  │  ┌────────────────────────────┐  │
│  │  Capabilities:             │  │  │  │  Capabilities:             │  │
│  │  ✓ checkout                │  │  │  │  ✓ checkout                │  │
│  │  ✓ portal                  │  │  │  │  ✓ portal                  │  │
│  │  ✓ cancel                  │  │  │  │  ✗ cancel (via portal)     │  │
│  │  ✓ restore                 │  │  │  │  ✗ restore (via portal)    │  │
│  │  ✓ entitlements            │  │  │  │  ✗ entitlements            │  │
│  │  ✓ usage meters            │  │  │  │  ✓ usage meters            │  │
│  └────────────────────────────┘  │  │  └────────────────────────────┘  │
│       @kit/billing-stripe        │  │       @kit/billing-polar         │
└──────────────────────────────────┘  └──────────────────────────────────┘
```

### Checkout Flow

```
  User                   UI                   Server Action              Provider
   │                     │                         │                        │
   │  Click Checkout     │                         │                        │
   │────────────────────>│                         │                        │
   │                     │  createCheckoutSession  │                        │
   │                     │────────────────────────>│                        │
   │                     │                         │  billing.checkout()    │
   │                     │                         │───────────────────────>│
   │                     │                         │                        │
   │                     │                         │   Checkout URL         │
   │                     │                         │<───────────────────────│
   │                     │   redirect(url)         │                        │
   │                     │<────────────────────────│                        │
   │  Redirect to        │                         │                        │
   │  Provider Checkout  │                         │                        │
   │<────────────────────│                         │                        │
   │                     │                         │                        │
   │  Complete Payment   │                         │                        │
   │─────────────────────────────────────────────────────────────────────── >│
   │                     │                         │  Webhook: subscription │
   │                     │                         │<───────────────────────│
   │                     │                         │  Update DB via         │
   │                     │                         │  Better Auth Plugin    │
   │                     │                         │  Execute lifecycle     │
   │                     │                         │  hooks                 │
   │  Redirect to        │                         │                        │
   │  Success Page       │                         │                        │
   │<──────────────────────────────────────────────────────────────────────-│
```

### The BillingClient API

Import `BillingClient` from `@kit/billing-api` to access:

- **Subscription operations**: checkout, portal, list, cancel, restore
- **Quota enforcement**: validate limits on seats, projects, storage
- **Feature gating**: check boolean entitlements (graceful fallback when unsupported)
- **Usage tracking**: record and query metered usage (provider-dependent)

```typescript
import { getBilling } from '@kit/billing-api';

const billing = await getBilling(auth);

// All methods available on single object
await billing.checkout({ ... });
await billing.checkPlanLimit({ referenceId, limitKey, currentUsage });
await billing.checkEntitlement(customerId, 'feature-key');
```

## Features

### Complete Subscription Lifecycle

The system manages subscriptions from start to finish:

1. **Checkout** - Create Stripe Checkout sessions for new subscriptions
2. **Trials** - Automatic trial management with conversion tracking
3. **Active Management** - Monitor ongoing subscription status
4. **Plan Changes** - Handle upgrades and downgrades with proration
5. **Cancellations** - Support cancel-at-period-end with restore option
6. **Payment Recovery** - Automatic retry logic and failure notifications

### Multi-Tenant Architecture

The same billing code works for both account types:

```typescript
// Individual user billing
const referenceId = user.id;

// Team account billing
const referenceId = organizationId;
```

Better Auth's polymorphic subscription model enables this flexibility without conditional logic.

## Getting Started

### 1. Select a Provider

Configure your billing provider in your local env file, for example `./.env.local`:

```bash {title="./.env.local"}
# For Stripe (default)
NEXT_PUBLIC_BILLING_PROVIDER=stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# For Polar
NEXT_PUBLIC_BILLING_PROVIDER=polar
POLAR_ACCESS_TOKEN=polar_at_...
POLAR_WEBHOOK_SECRET=whsec_...
POLAR_ENVIRONMENT=sandbox
```

Detailed setup instructions are in [Stripe Setup](./stripe-setup) and [Polar Setup](./polar-setup).

### 2. Define Your Plans

After creating products in your provider dashboard, map them in the config:

```typescript {title="packages/billing/config/src/config.ts"}
import { BillingConfig } from '@kit/billing';

export const billingConfig: BillingConfig = {
  products: [
    {
      id: 'starter',
      name: 'Starter',
      description: 'For individuals and small teams',
      currency: 'USD',
      features: ['Core features', 'Email support'],
      plans: [
        {
          name: 'starter-monthly',
          // Configure provider-specific IDs
          planId: process.env.STRIPE_PRICE_STARTER_MONTHLY!,
          displayName: 'Starter Monthly',
          interval: 'month',
          cost: 9.99,
        },
      ],
    },
  ],
};
```

Store IDs in environment variables to simplify switching between test and production. At runtime, only the active provider's configuration applies.

### 3. Verify the Integration

1. Start development: `pnpm dev`
2. Open `/settings/billing`
3. Choose a plan and start checkout
4. Stripe: Complete with test card `4242 4242 4242 4242`
5. Polar: Test in sandbox mode

## Watch Out For

- **Price ID vs Product ID confusion**: Stripe expects Price IDs (`price_...`), Polar expects Product IDs (`prod_...`). Using the wrong type breaks checkout.
- **Missing `NEXT_PUBLIC_SITE_URL`**: Server actions rely on this for redirect URLs. Omitting it causes silent redirect failures.
- **No webhook secret in production**: Signature verification fails without `STRIPE_WEBHOOK_SECRET` or `POLAR_WEBHOOK_SECRET`, preventing subscription sync.
- **Assuming Polar has org customers**: Polar is user-centric with no separate organization customer records. Choose Stripe for strict B2B billing needs.
- **Skipping local webhook testing**: Run `pnpm --filter web run stripe:listen` for Stripe or use ngrok for Polar. Without webhooks, subscription state stalls.
- **Mixing up `referenceId` and `customerId`**: `referenceId` is your app's user/org ID; `customerId` is the provider's ID (e.g., `cus_...` for Stripe).
- **Expecting automatic limit enforcement**: Plan limits are advisory. Call `billing.checkPlanLimit()` explicitly to enforce restrictions.

{% faq
   title="Frequently Asked Questions"
   items=[
     {"question": "Can I use both Stripe and Polar simultaneously?", "answer": "No. Only one provider is active at a time, controlled by NEXT_PUBLIC_BILLING_PROVIDER. You can switch providers, but not run both for different customers."},
     {"question": "How do I test billing without real payments?", "answer": "Use Stripe test mode (sk_test_ keys) or Polar sandbox environment (POLAR_ENVIRONMENT=sandbox). Both provide test cards and sandboxed transactions."},
     {"question": "Do subscriptions survive provider switches?", "answer": "No. Subscription data is provider-specific and stored via Better Auth. Switching providers means existing subscriptions won't transfer."},
     {"question": "How do I handle failed payments?", "answer": "Implement the onPaymentFailed lifecycle hook in packages/billing/stripe/src/hooks/. Stripe automatically retries, but you can send notifications or restrict access."},
     {"question": "Can I offer lifetime deals?", "answer": "Yes, but configure them as one-time payments in the provider dashboard. The billing config supports any plan structure the provider allows."},
     {"question": "How do I upgrade/downgrade plans?", "answer": "Use the customer portal (billing.portal()) which handles proration automatically. Or call the provider SDK directly for programmatic changes."}
   ]
/%}

---

**Next:** [Billing Configuration →](./billing-configuration)

---
*This content was exported from Makerkit Documentation.*