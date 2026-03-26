# Billing Configuration

> Set up pricing plans, products, and billing options for your Next.js Prisma app

> Source: https://makerkit.dev/docs/nextjs-prisma/billing/billing-configuration

---

All pricing configuration lives in one TypeScript file: `packages/billing/config/src/config.ts`. Map your products to provider dashboard entries, link plans to Price IDs (Stripe) or Product IDs (Polar), and define limits that your application code enforces.

This page is part of the [Billing & Subscriptions](./overview) documentation.

The `BillingConfig` object declares your products, plans, billing intervals, feature limits, and trial configuration. The UI reads this for plan display while the billing client uses it for limit checks.

You can read more about how to configure the billing provider in 
- the [Stripe Setup](./stripe-setup) page
- and the [Polar Setup](./polar-setup) page

## Config Location

Find the billing configuration at `packages/billing/config/src/config.ts`.

The default file includes placeholder products and plans as examples. **Replace these with your actual pricing tiers.**

Once your billing provider is configured with the right environment variables, you can set up your pricing structure.

The config is an object containing a `products` array. Each product includes `name`, `description`, `currency`, `features`, and a `plans` array:

```typescript {% title="packages/billing/config/src/config.ts" %}
import { BillingConfig } from '@kit/billing';

export const billingConfig: BillingConfig = {
  products: [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for individuals and small teams',
      currency: 'USD',
      badge: 'Value',
      features: [
        'Up to 3 team members',
        'Core features',
        'Email support',
      ],
      plans: [
        {
          name: 'starter-monthly',
          planId: process.env.STRIPE_PRICE_STARTER_MONTHLY!,
          displayName: 'Starter Monthly',
          interval: 'month',
          cost: 9.99,
          limits: { seats: 3 },
        },
      ],
    },
  ],
};
```

## Product Setup

Products represent your pricing tiers, each supporting multiple billing intervals.

### Available Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique product identifier |
| `name` | string | Yes | Display name |
| `description` | string | Yes | Short description |
| `currency` | string | Yes | Currency code (USD, EUR, etc.) |
| `features` | string[] | Yes | List of features included |
| `badge` | string | No | Badge text (e.g., "Popular") |
| `highlighted` | boolean | No | Highlight this product in UI |

### Sample Product

Here's a product configuration example:

```typescript
{
  id: 'pro',
  name: 'Pro',
  badge: 'Popular',
  highlighted: true,
  description: 'Best for growing teams and professionals',
  currency: 'USD',
  features: [
    'Up to 10 team members',
    'All Starter features',
    'Priority support',
    'Advanced analytics',
  ],
  plans: [
    // ... plan configuration
  ],
}
```

## Plan Setup

Products support multiple plans with varying billing intervals.

### Flexible Plan Naming

The `name` field serves as Better Auth's plan identifier. **Use any string you want.** The UI relies on `displayName` and `interval` for rendering, not the plan name.

Name your plans however makes sense:

```typescript
{
  name: 'founder-yearly',        // Better Auth identifier (can be anything)
  displayName: 'Founder',         // UI displays "Founder"
  interval: 'year',               // UI shows "(Annual)"
  cost: 99.99,
  // Result: UI displays "Founder (Annual)"
}

// Other valid naming examples:
name: 'vip-annual'       // Works perfectly
name: 'custom-plan-1'    // Works perfectly
name: 'lifetime-deal'    // Works perfectly
```

**Bottom line:** Rename plans anytime without UI breakage. The system reads your metadata (`displayName` and `interval`), not naming patterns.

### Plan Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Unique plan identifier (Better Auth ID - can be any string) |
| `planId` | string | Yes | Provider plan identifier (Stripe **Price ID** like `price_…`, or Polar **Product ID** like `prod_…`) |
| `displayName` | string | Recommended | Display name in UI (if omitted, falls back to capitalized name) |
| `interval` | string | Yes | `month` or `year` - controls UI display |
| `cost` | number | Yes | Price amount for display purposes |
| `limits` | object | No | Plan limits (seats, storage, etc.) - enforced in your app |
| `seatPriceId` | string | No | Stripe per-seat price ID — auto-syncs org member count to subscription quantity. See [Per-Seat Billing](./per-seat-billing) |
| `freeTrial` | object | No | Free trial configuration (e.g. `{ days: 14 }`) |

### Plan Examples

```typescript
plans: [
  {
    name: 'pro-monthly',
    planId: process.env.STRIPE_PRICE_PRO_MONTHLY!,
    displayName: 'Pro Monthly',
    interval: 'month',
    cost: 19.99,
    limits: { seats: 10 },
  },
  {
    name: 'pro-yearly',
    planId: process.env.STRIPE_PRICE_PRO_YEARLY!,
    displayName: 'Pro Yearly',
    interval: 'year',
    cost: 199.99,
    limits: { seats: 10 },
  },
]
```


**Keep in mind:**

- Runtime uses only the active provider's config (controlled by `NEXT_PUBLIC_BILLING_PROVIDER`)
- Environment variables make test/production switching painless

## Provider-Specific Plan IDs

The `planId` field has different meanings per provider:

- **Stripe**: expects a **Price ID** (`price_…`)
- **Polar**: expects a **Product ID** (`prod_…`)

Environment variable names are up to you. What matters is that `planId` contains the correct identifier for your active provider.

### Stripe (Price IDs)

Environment variables let you swap between test and production:

```bash
STRIPE_PRICE_STARTER_MONTHLY=price_...
STRIPE_PRICE_STARTER_YEARLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
```

Then reference them in your config:

```typescript
planId: process.env.STRIPE_PRICE_STARTER_MONTHLY!,
```

### Polar (Product IDs)

Same approach with Polar, using product IDs:

```bash
POLAR_PRODUCT_STARTER_MONTHLY=prod_...
POLAR_PRODUCT_STARTER_YEARLY=prod_...
```

Then reference them in your config:

```typescript
planId: process.env.POLAR_PRODUCT_STARTER_MONTHLY!,
```

## Trial Periods

Enable free trials on any plan with `freeTrial`:

```typescript
{
  name: 'pro-monthly',
  planId: process.env.STRIPE_PRICE_PRO_MONTHLY!,
  interval: 'month',
  cost: 19.99,
  freeTrial: { days: 14 },
}
```

Important:
- Better Auth manages trials and prevents multiple trial abuse.
- During trials, subscription status shows as `trialing`.
- For Polar, configure trials in the product dashboard instead

## Usage Limits

Set quotas for each plan:

```typescript
limits: {
  seats: 10,           // Maximum team members
  projects: 50,        // Maximum projects
  storage: 100,        // Storage in GB
  apiCalls: 10000,     // API calls per month
}
```

## Full Example

A complete three-tier pricing setup:

```typescript
import { BillingConfig } from '@kit/billing';

export const billingConfig: BillingConfig = {
  products: [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for individuals and small teams',
      currency: 'USD',
      badge: 'Value',
      features: [
        'Up to 3 team members',
        'Core features',
        'Email support',
        '14-day free trial',
      ],
      plans: [
        {
          name: 'starter-monthly',
          planId: process.env.STRIPE_PRICE_STARTER_MONTHLY!,
          displayName: 'Starter Monthly',
          interval: 'month',
          cost: 9.99,
          limits: { seats: 3 },
        },
        {
          name: 'starter-yearly',
          planId: process.env.STRIPE_PRICE_STARTER_YEARLY!,
          displayName: 'Starter Yearly',
          interval: 'year',
          cost: 99.99,
          limits: { seats: 3 },
        },
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      badge: 'Popular',
      highlighted: true,
      description: 'Best for growing teams',
      currency: 'USD',
      features: [
        'Up to 10 team members',
        'All Starter features',
        'Priority support',
        'Advanced analytics',
      ],
      plans: [
        {
          name: 'pro-monthly',
          planId: process.env.STRIPE_PRICE_PRO_MONTHLY!,
          displayName: 'Pro Monthly',
          interval: 'month',
          cost: 19.99,
          limits: { seats: 10 },
        },
        {
          name: 'pro-yearly',
          planId: process.env.STRIPE_PRICE_PRO_YEARLY!,
          displayName: 'Pro Yearly',
          interval: 'year',
          cost: 199.99,
          limits: { seats: 10 },
        },
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations',
      currency: 'USD',
      features: [
        'Unlimited team members',
        'All Pro features',
        'Dedicated support',
        'Custom integrations',
      ],
      plans: [
        {
          name: 'enterprise-monthly',
          planId: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY!,
          displayName: 'Enterprise Monthly',
          interval: 'month',
          cost: 49.99,
          limits: { seats: null }, // Unlimited
        },
      ],
    },
  ],
};
```

## Field Reference

Here's what the TypeScript types support:

### Active Fields

- `name` - Plan identifier
- `planId` - Provider ID (Stripe price ID or Polar product ID)
- `displayName` - UI label
- `interval` - Billing frequency (`month` or `year`)
- `cost` - Display price
- `limits` - Quotas (seats, storage, etc.)
- `hidden` - Exclude from plan picker (for legacy plans)

## Legacy Plans (Hidden Products)

Keep products active for existing subscribers while hiding them from new signups:

```typescript
{
  id: 'legacy-pro',
  name: 'Legacy Pro',
  description: 'Original Pro plan for early customers',
  currency: 'USD',
  hidden: true,  // Hides from plan picker UI
  features: [
    'All Pro features',
    'Grandfathered pricing',
  ],
  plans: [
    {
      name: 'legacy-pro-monthly',
      planId: process.env.STRIPE_PRICE_LEGACY_PRO_MONTHLY!,
      displayName: 'Legacy Pro',
      interval: 'month',
      cost: 9.99,  // Old pricing
    },
  ],
}
```

**When to use:**
- Early adopter pricing you want to honor
- Deprecated tiers with active subscribers
- Custom enterprise deals
- Time-limited promotions

Hidden products function normally for current subscribers but don't appear in the plan picker.

## Avoid These Mistakes

- **Product ID instead of Price ID for Stripe**: Stripe needs Price IDs (`price_...`), not Product IDs (`prod_...`). Verify in your Stripe dashboard.
- **Hardcoded Price IDs**: Always use `process.env.STRIPE_PRICE_...` to switch environments without code changes.
- **Missing `!` assertion**: TypeScript sees env vars as `string | undefined`. Add `!` to avoid type errors.
- **Limit/provider mismatch**: Setting `limits: { seats: 10 }` without quantity billing in Stripe means UI shows limits but checkout ignores them.
- **`freeTrial` with Polar**: Polar trials live in the product dashboard. The config's `freeTrial` is Stripe-only.
- **Duplicate plan names**: Plan `name` must be unique across all products since Better Auth uses it as the identifier.

{% faq
   title="Frequently Asked Questions"
   items=[
     {"question": "Where do I find Stripe Price IDs?", "answer": "In Stripe Dashboard → Products → click your product → copy the Price ID (starts with price_). Don't use the Product ID (starts with prod_)."},
     {"question": "How do limits actually get enforced?", "answer": "Limits are declarative only. Your code must call billing.checkPlanLimit() to enforce them. The UI uses limits for display, but blocking is up to your application logic."},
     {"question": "Can I have different limits for monthly vs yearly plans?", "answer": "Yes. Each plan object has its own limits property. Set different values for each interval if needed."},
     {"question": "What happens if I change a plan's name?", "answer": "Existing subscriptions reference the old name and won't match the new plan. Create a new plan and hide the old one instead."},
     {"question": "How do I offer unlimited seats?", "answer": "Set limits: { seats: null }. Null means unlimited. Your checkPlanLimit() call will return allowed: true for unlimited resources."}
   ]
/%}

## Complex Pricing

The examples above use `planId` for single-price subscriptions. For more complex scenarios, use `lineItems`:

| Method | Field | Best For |
|--------|-------|----------|
| **SimplePlan** | `planId` | One price per plan |
| **AdvancedPlan** | `lineItems` | Multiple prices, tiered billing |

### When `lineItems` Makes Sense

- Base subscription + per-seat charges
- Metered components (AI tokens, API calls)
- Volume-based discounts
- Optional add-ons at checkout

```typescript
// SimplePlan - single price
{
  name: 'starter-monthly',
  planId: process.env.STRIPE_PRICE_STARTER!,
  // ...
}

// AdvancedPlan - multiple prices
{
  name: 'pro-monthly',
  primaryPriceId: process.env.STRIPE_PRICE_PRO_BASE!,
  lineItems: [
    { id: 'base', type: 'flat', priceId: process.env.STRIPE_PRICE_PRO_BASE!, ... },
    { id: 'seats', type: 'usage', priceId: process.env.STRIPE_PRICE_SEATS!, ... },
  ],
  // ...
}
```

Full details on multi-line checkout, tiered pricing, and add-ons are in [Advanced Pricing](./advanced-pricing).

---

**Next:** [Advanced Pricing →](./advanced-pricing)

---
*This content was exported from Makerkit Documentation.*