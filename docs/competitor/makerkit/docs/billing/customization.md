# Billing Customization

> Tailor seat computation, checkout, and billing UI in your Next.js Prisma app

> Source: https://makerkit.dev/docs/nextjs-prisma/billing/customization

---

Tailor the billing system to match your product. Adjust seat calculations at checkout, modify Stripe session parameters, extend webhook handling, and customize UI components. This page covers extension points and patterns for common customizations.

This page is part of the [Billing & Subscriptions](./overview) documentation.

## Customization Overview

| What to Customize | Where | Use Case |
|-------------------|-------|----------|
| Seat computation | `billing-actions.service.ts` | Different definition of "billable seats" |
| Checkout params | `stripe-plugin.ts` | Tax, metadata, address collection |
| Customer creation | `stripe-plugin.ts` | Custom metadata on customers |
| Webhook handling | `stripe-plugin.ts` / `polar-plugin.ts` | Additional event handling |
| UI components | `packages/billing/ui/src/components/` | Pricing table, subscription cards |
| Lifecycle hooks | `packages/billing/stripe/src/hooks/` | Post-event actions |

## Seat-Based (Quantity) Billing

For organization billing, MakerKit charges based on **seat count** (subscription quantity). The default behavior:

- Seats are computed from **organization member count** at checkout time
- Seats have a **minimum of 1**
- If member count can't be determined, checkout fails to prevent underbilling

### Default Seat Computation

The seat computation happens in the billing actions service:

```typescript {% title="packages/billing/ui/src/services/billing-actions.service.ts" %}
/**
 * Get the number of organization members
 * @param organizationId - The ID of the organization
 * @returns The number of organization members
 */
private async getOrganizationMemberCount(organizationId: string) {
  const members = await auth.api.listMembers({
    headers: await headers(),
    query: {
      organizationId,
    },
  });

  // Ensure minimum 1 seat to prevent billing edge cases
  return Math.max(1, members.members.length);
}
```

### Custom Seat Computation

To customize what counts as a "billable seat", modify the `getOrganizationMemberCount` method:

```typescript {% title="packages/billing/ui/src/services/billing-actions.service.ts" %}
private async getOrganizationMemberCount(organizationId: string) {
  const members = await auth.api.listMembers({
    headers: await headers(),
    query: {
      organizationId,
    },
  });

  // Example: Count only active users, exclude guests
  const billableMembers = members.members.filter(
    (member) =>
      member.role !== 'guest' &&
      member.user?.emailVerified
  );

  // Enforce minimum of 2 for team plans
  return Math.max(2, billableMembers.length);
}
```

### Provider Notes

| Provider | Seat Support |
|----------|--------------|
| **Stripe** | Seats passed as `quantity` to subscription |
| **Polar** | Seats not supported (user-centric billing) |

## Customizing Stripe Checkout

Modify checkout session parameters in the Stripe plugin.

### Location

```
packages/billing/stripe/src/stripe-plugin.ts
```

### Common Customizations

#### Tax Collection

The kit supports automatic tax via environment variables:

```bash {% title=".env" %}
ENABLE_AUTOMATIC_TAX_CALCULATION=true
ENABLE_TAX_ID_COLLECTION=true
```

Or customize directly in the plugin:

```typescript {% title="packages/billing/stripe/src/stripe-plugin.ts" %}
// In getCheckoutSessionParams
getCheckoutSessionParams: async (_data) => {
  const params: Stripe.Checkout.SessionCreateParams = {
    // Enable automatic tax calculation (requires Stripe Tax setup)
    automatic_tax: {
      enabled: true,
    },
    // Collect tax IDs from customers
    tax_id_collection: {
      enabled: true,
    },
    // Billing address collection
    billing_address_collection: 'required',
  };

  return { params };
},
```

#### Custom Metadata

Pass metadata to track checkouts:

```typescript {% title="packages/billing/stripe/src/stripe-plugin.ts" %}
getCheckoutSessionParams: async (data) => {
  const params: Stripe.Checkout.SessionCreateParams = {
    metadata: {
      source: 'billing-page',
      referenceId: data.referenceId,
    },
  };

  return { params };
},
```

#### Trial Without Credit Card

Enable trials without requiring payment method:

```bash {% title=".env" %}
STRIPE_ENABLE_TRIAL_WITHOUT_CC=true
```

This sets `payment_method_collection: 'if_required'` on the checkout session.

#### Locale

The kit automatically detects the user's locale:

```typescript {% title="packages/billing/stripe/src/stripe-plugin.ts" %}
getCheckoutSessionParams: async (_data) => {
  const locale = await getCheckoutLocale();

  return {
    params: {
      locale,
    },
  };
},
```

## Customizing Customer Creation

Customize metadata when Stripe creates customers.

### User Customer Metadata

```typescript {% title="packages/billing/stripe/src/stripe-plugin.ts" %}
// Customize user customer creation
getCustomerCreateParams: async (user) => {
  return {
    metadata: {
      userId: user.id,
      createdAt: new Date().toISOString(),
    },
  };
},

// Callback after customer is created
onCustomerCreate: async ({ stripeCustomer, user }) => {
  const logger = await getLogger();

  logger.info(
    { customerId: stripeCustomer.id, userId: user.id },
    'Stripe customer created'
  );

  // Sync to CRM, analytics, etc.
},
```

### Organization Customer Metadata

```typescript {% title="packages/billing/stripe/src/stripe-plugin.ts" %}
organization: {
  enabled: true,
  getCustomerCreateParams: async (organization) => {
    return {
      metadata: {
        organizationId: organization.id,
        organizationSlug: organization.slug,
      },
    };
  },
  onCustomerCreate: async ({ stripeCustomer, organization }) => {
    const logger = await getLogger();

    logger.info(
      { customerId: stripeCustomer.id, organizationId: organization.id },
      'Stripe customer created for organization'
    );
  },
},
```

## Customizing the Billing Portal

Portal behavior is configured in Stripe Dashboard, not in code:

1. Go to **Stripe Dashboard** → **Settings** → **Billing** → **Customer portal**
2. Configure:
   - **Invoices**: Show/hide invoice history
   - **Payment methods**: Allow adding/removing cards
   - **Subscriptions**: Allow cancel, pause, or plan changes
   - **Subscription cancellation**: Proration, immediate vs end of period

### Portal Limitations

The Customer Portal has restrictions for complex subscriptions. When using [Advanced Pricing](./advanced-pricing) with multiple line items, customers can **only cancel** subscriptions through the portal. Plan switching, quantity changes, and other modifications require custom UI.

See [Advanced Pricing Limitations](./advanced-pricing#limitations) for details and workarounds.

### Portal Return URL

The return URL is set in the billing actions service:

```typescript {% title="packages/billing/ui/src/actions/billing-server-actions.ts" %}
const siteUrl = z.url().parse(process.env.NEXT_PUBLIC_SITE_URL);
const basePath = '/settings/billing';
const portalReturnUrl = new URL(basePath, siteUrl).href;
```

## Customizing UI Components

### Billing UI Package Structure

```
packages/billing/ui/src/
├── actions/
│   └── billing-server-actions.ts
├── components/
│   ├── billing-portal-button.tsx
│   ├── billing-portal-card.tsx
│   ├── cancel-checkout-card.tsx
│   ├── cancel-subscription-dialog.tsx
│   ├── checkout-button.tsx
│   ├── plan-picker.tsx
│   ├── pricing-table.tsx
│   ├── restore-subscription-dialog.tsx
│   ├── subscription-card.tsx
│   ├── success-checkout-card.tsx
│   └── switch-plan-dialog.tsx
├── loaders/
│   └── billing-page.loader.ts
├── schemas/
│   └── billing.schema.ts
└── services/
    └── billing-actions.service.ts
```

### Custom Pricing Table

Modify the pricing table layout or styling:

```tsx {% title="packages/billing/ui/src/components/pricing-table.tsx" %}
export function PricingTable({
  products,
  selectedInterval,
  onIntervalChange,
  onSelectPlan,
}: PricingTableProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {products.map((product) => (
        <div
          key={product.id}
          className={cn(
            'rounded-xl border p-6',
            product.highlighted && 'border-primary shadow-lg'
          )}
        >
          {/* Badge */}
          {product.badge && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {product.badge}
            </span>
          )}

          {/* Product info */}
          <h3 className="mt-4 text-xl font-semibold">{product.name}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {product.description}
          </p>

          {/* Pricing */}
          <div className="mt-4">
            <span className="text-3xl font-bold">
              ${getActivePlan(product, selectedInterval).cost}
            </span>
            <span className="text-muted-foreground">
              /{selectedInterval}
            </span>
          </div>

          {/* Features */}
          <ul className="mt-6 space-y-3">
            {product.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-primary" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <CheckoutButton
            className="mt-6 w-full"
            planId={getActivePlan(product, selectedInterval).planId}
          >
            {product.ctaLabel ?? 'Get Started'}
          </CheckoutButton>
        </div>
      ))}
    </div>
  );
}
```

### Custom Subscription Card

```tsx {% title="packages/billing/ui/src/components/subscription-card.tsx" %}
export function SubscriptionCard({
  subscription,
}: {
  subscription: Subscription;
}) {
  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    trialing: 'bg-blue-100 text-blue-800',
    past_due: 'bg-red-100 text-red-800',
    canceled: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{subscription.plan}</h3>
          <p className="text-sm text-muted-foreground">
            {subscription.seats && `${subscription.seats} seats • `}
            Renews {formatDate(subscription.periodEnd)}
          </p>
        </div>

        <span
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium',
            statusColors[subscription.status]
          )}
        >
          {subscription.status}
        </span>
      </div>

      {subscription.cancelAtPeriodEnd && (
        <div className="mt-4 rounded-md bg-yellow-50 p-3">
          <p className="text-sm text-yellow-800">
            Subscription will cancel on {formatDate(subscription.periodEnd)}
          </p>
        </div>
      )}
    </div>
  );
}
```

## Extending Webhook Handling

Add custom webhook event handling beyond lifecycle hooks.

### Stripe: Additional Events

The `onEvent` callback in the Stripe plugin handles events not covered by Better Auth:

```typescript {% title="packages/billing/stripe/src/stripe-plugin.ts" %}
subscription: {
  // ... other config
  onEvent: async (event: Stripe.Event) => {
    // Payment failure handling
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;

      // Extract subscription ID from the invoice
      const subscriptionRef =
        invoice.parent?.subscription_details?.subscription;

      const subscriptionId =
        typeof subscriptionRef === 'string'
          ? subscriptionRef
          : subscriptionRef?.id;

      if (subscriptionId) {
        await onPaymentFailed({
          subscriptionId,
          customerId: typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id ?? '',
          invoiceId: invoice.id,
          amount: invoice.amount_due,
          currency: invoice.currency,
          attemptCount: invoice.attempt_count ?? 0,
          nextPaymentAttempt: invoice.next_payment_attempt
            ? new Date(invoice.next_payment_attempt * 1000)
            : null,
        });
      }
    }

    // Add more event handlers as needed
    if (event.type === 'invoice.paid') {
      // Handle successful payment
    }
  },
}
```

### Polar: Custom Event Handling

Polar webhooks are handled in the Polar plugin:

```typescript {% title="packages/billing/polar/src/polar-plugin.ts" %}
// See packages/billing/polar/src/hooks/ for available hooks:
// - on-subscription-created.ts
// - on-subscription-updated.ts
// - on-subscription-canceled.ts
// - on-order-paid.ts
// - on-customer-created.ts
// - on-customer-state-changed.ts
```

## Custom Billing Page Location

The default billing page is at `/settings/billing`. To customize the URLs:

```typescript {% title="packages/billing/ui/src/actions/billing-server-actions.ts" %}
const siteUrl = z.url().parse(process.env.NEXT_PUBLIC_SITE_URL);

// Customize these paths
const basePath = '/settings/billing';
const cancelReturnUrl = new URL(`${basePath}?canceled=true`, siteUrl).href;
const checkoutSuccessUrl = new URL(`${basePath}/success`, siteUrl).href;
const checkoutCancelUrl = new URL(`${basePath}/cancel`, siteUrl).href;
const portalReturnUrl = new URL(basePath, siteUrl).href;
```

## Decision Rules

**Customize seat computation when:**
- Billable seats differ from org members (exclude guests, count active only)
- You need minimum seat requirements beyond 1
- You have per-user licensing vs per-member

**Customize checkout when:**
- You need tax collection or address validation
- You want custom metadata for tracking
- You need specific trial behavior

**Customize the UI when:**
- Your pricing structure doesn't fit the default layout
- You need custom styling or branding
- You want different subscription card actions

**If unsure:** Start with defaults. Add customizations incrementally as your billing model evolves.

## Common Pitfalls

- **Seat computation returning 0**: Always ensure minimum 1 seat. Zero seats cause checkout failures.
- **Missing NEXT_PUBLIC_SITE_URL**: Server-side return URLs fail without this env var.
- **Modifying types without updating consumers**: Billing type changes can break multiple packages. Test thoroughly.
- **Forgetting Polar limitations**: Seat computation and many customizations only apply to Stripe.
- **Overriding webhook handlers**: Don't replace existing handlers; extend them. Missing handler = missed events.
- **Hardcoding URLs**: Use environment variables for URLs to separate test/prod environments.

{% faq
   title="Frequently Asked Questions"
   items=[
     {"question": "How do I change what counts as a 'seat'?", "answer": "Modify getOrganizationMemberCount() in packages/billing/ui/src/services/billing-actions.service.ts. Filter members by your criteria."},
     {"question": "Can I add a free plan?", "answer": "Yes. Add a product with hidden: true and cost: 0, or just don't require a subscription. Use defaultLimits in billing config for free tier limits."},
     {"question": "Where do I customize the pricing table?", "answer": "Modify packages/billing/ui/src/components/pricing-table.tsx for layout changes, or override styles via Tailwind."},
     {"question": "How do I add custom checkout fields?", "answer": "Configure custom_fields in Stripe Dashboard or pass them via getCheckoutSessionParams. Access collected data via webhooks."},
     {"question": "Can I use different billing for personal vs org?", "answer": "Yes. The customerType parameter ('user' vs 'organization') controls which billing context is used."}
   ]
/%}

---

**Next:** [Seat Enforcement →](./seat-enforcement)

---
*This content was exported from Makerkit Documentation.*