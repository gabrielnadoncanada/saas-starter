# Plan Limits & Entitlements

> Feature gating with plan limits and Stripe Entitlements in Next.js Prisma

> Source: https://makerkit.dev/docs/nextjs-prisma/billing/entitlements

---

Gate features with numeric quotas (`checkPlanLimit`) or boolean flags (`checkEntitlement`). Define plan limits in your billing config and enforce them in code. Stripe Entitlements offer external feature gating managed through your Stripe dashboard.

This page is part of the [Billing & Subscriptions](./overview) documentation.

## Two Approaches to Feature Gating

| Approach | Use Case | Source | Provider Support |
|----------|----------|--------|------------------|
| **Plan Limits** | Numeric quotas (seats, projects, storage) | Billing config | All providers |
| **Stripe Entitlements** | Boolean feature flags (advanced-analytics, api-access) | Stripe Dashboard | Stripe only |

**When to use which:**

- **Plan Limits**: Countable resources that grow with usage (team members, API calls, storage)
- **Stripe Entitlements**: Features that are either on or off (premium support, advanced analytics, white-labeling)

## Plan Limits (Config-Based)

Plan limits are defined in your billing configuration and enforced by calling `billing.checkPlanLimit()` in your application code.

### Defining Limits

Add `limits` to each plan in your billing config:

```typescript {% title="packages/billing/config/src/config.ts" %}
import { BillingConfig } from '@kit/billing';

export const billingConfig: BillingConfig = {
  // Default limits for users without a subscription (free tier)
  defaultLimits: {
    projects: 1,
    aiTokens: 10_000,
  },
  products: [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for individuals',
      currency: 'USD',
      features: ['Up to 3 team members', 'Core features'],
      plans: [
        {
          name: 'starter-monthly',
          planId: process.env.NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PLAN_ID!,
          displayName: 'Starter Monthly',
          interval: 'month',
          cost: 9.99,
          limits: {
            seats: 3,
            projects: 10,
            aiTokens: 50_000,
          },
        },
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Best for growing teams',
      currency: 'USD',
      features: ['Up to 10 team members', 'Priority support'],
      plans: [
        {
          name: 'pro-monthly',
          planId: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID!,
          displayName: 'Pro Monthly',
          interval: 'month',
          cost: 29.99,
          limits: {
            seats: 10,
            projects: 100,
            aiTokens: 500_000,
          },
        },
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations',
      currency: 'USD',
      features: ['Unlimited team members', 'Dedicated support'],
      plans: [
        {
          name: 'enterprise-monthly',
          planId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PLAN_ID!,
          displayName: 'Enterprise Monthly',
          interval: 'month',
          cost: 99.99,
          limits: {
            seats: null,      // null = unlimited
            projects: null,
            aiTokens: null,
          },
        },
      ],
    },
  ],
};
```

### Default Limits (Free Tier)

The `defaultLimits` config applies when a user has no active subscription:

```typescript
export const billingConfig: BillingConfig = {
  defaultLimits: {
    projects: 1,        // Free users can create 1 project
    aiTokens: 10_000,   // Free users get 10K tokens/month
    seats: 1,           // Free users can have 1 team member
  },
  products: [/* ... */],
};
```

### Checking Limits with `checkPlanLimit()`

Use `billing.checkPlanLimit()` to validate before allowing an action:

```typescript {% title="packages/billing/ui/src/services/example.service.ts" %}
import { auth } from '@kit/better-auth';
import { getBilling } from '@kit/billing-api';

export async function checkProjectLimit(organizationId: string) {
  const billing = await getBilling(auth);

  // Get current project count from your database
  const currentProjectCount = await getProjectCount(organizationId);

  // Check if limit allows creating another project
  const { allowed, limit, remaining, hasSubscription } =
    await billing.checkPlanLimit({
      referenceId: organizationId,
      limitKey: 'projects',
      currentUsage: currentProjectCount,
    });

  if (!allowed) {
    throw new Error(
      `Project limit reached (${limit}). Upgrade your plan to create more projects.`
    );
  }

  return { allowed, remaining };
}
```

### Return Type

`checkPlanLimit()` returns a `CheckPlanLimitResult` object:

```typescript
interface CheckPlanLimitResult {
  /** Whether the action is allowed based on the limit */
  allowed: boolean;

  /** The limit value (null = unlimited) */
  limit: number | null;

  /** Current usage count (passed in) */
  current: number;

  /** Remaining capacity (null = unlimited) */
  remaining: number | null;

  /** Whether the referenceId has an active subscription */
  hasSubscription: boolean;
}
```

**Important:** `allowed` is `true` when `currentUsage < limit` (not `<=`), allowing the user to add one more item up to the limit.

### Getting All Limits

To display limits in the UI or check multiple limits at once:

```typescript
import { auth } from '@kit/better-auth';
import { getBilling } from '@kit/billing-api';

const billing = await getBilling(auth);

const { limits, hasSubscription } = await billing.getPlanLimits(organizationId);

// limits is Record<string, number | null>
console.log(limits);
// { seats: 10, projects: 100, aiTokens: 500_000 }
```

## Stripe Entitlements (Boolean Feature Flags)

Stripe Entitlements provide external feature gating managed entirely in your Stripe dashboard. Use them for features that are on/off rather than countable.

### Setting Up Entitlements in Stripe

1. Go to **Stripe Dashboard** → **Product catalog** → **Entitlements**
2. Create features with lookup keys (e.g., `advanced-analytics`, `api-access`, `white-label`)
3. Attach features to your products
4. When customers subscribe, they automatically get the entitlements

### Checking Entitlements

```typescript {% title="packages/billing/ui/src/services/entitlements.service.ts" %}
import { auth } from '@kit/better-auth';
import { getBilling } from '@kit/billing-api';

export async function checkFeatureAccess(customerId: string) {
  const billing = await getBilling(auth);

  const { entitled, source } = await billing.checkEntitlement(
    customerId,
    'advanced-analytics'
  );

  if (!entitled) {
    throw new Error('Advanced analytics requires a Pro plan or higher.');
  }

  // Feature is available
  return { entitled };
}
```

### Return Type

`checkEntitlement()` returns a `CheckEntitlementResult` object:

```typescript
interface CheckEntitlementResult {
  /** Whether the customer has the entitlement */
  entitled: boolean;

  /** Source of the check: 'provider' or 'unsupported' */
  source: 'provider' | 'unsupported';
}
```

When `source` is `'unsupported'`, the provider doesn't support entitlements (e.g., Polar) and `entitled` defaults to `false`.

### Listing All Entitlements

```typescript
import { auth } from '@kit/better-auth';
import { getBilling } from '@kit/billing-api';

const billing = await getBilling(auth);

const entitlements = await billing.listEntitlements(customerId);

// entitlements is Entitlement[]
// [{ id: 'ent_xxx', featureId: 'feat_xxx', lookupKey: 'advanced-analytics' }]

const hasApiAccess = entitlements.some(e => e.lookupKey === 'api-access');
```

### Getting the Customer ID

Entitlement methods require the provider's customer ID (e.g., `cus_xxx` for Stripe):

```typescript
import { auth } from '@kit/better-auth';
import { getBilling } from '@kit/billing-api';

const billing = await getBilling(auth);

// For personal billing (user object from session)
const customerId = billing.getCustomerId(user);

// For organization billing (user and organization from session/context)
const customerId = billing.getCustomerId(user, organization, 'organization');
```

## Implementation Patterns

### Server Action with Plan Limits

```typescript {% title="apps/web/app/[locale]/(internal)/projects/_lib/projects-server-actions.ts" %}
'use server';

import { revalidatePath } from 'next/cache';

import { z } from 'zod';

import { authenticatedActionClient } from '@kit/action-middleware';
import { auth } from '@kit/better-auth';
import { requireActiveOrganizationId } from '@kit/better-auth/context';
import { getBilling } from '@kit/billing-api';

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
});

export const createProjectAction = authenticatedActionClient
  .inputSchema(createProjectSchema)
  .action(async ({ parsedInput }) => {
    const organizationId = await requireActiveOrganizationId();
    const billing = await getBilling(auth);

    // Get current count from your database
    const currentCount = await getProjectCount(organizationId);

    // Check limit
    const { allowed } = await billing.checkPlanLimit({
      referenceId: organizationId,
      limitKey: 'projects',
      currentUsage: currentCount,
    });

    if (!allowed) {
      throw new Error('Project limit reached. Please upgrade your plan.');
    }

    // Create the project
    const project = await createProject({
      organizationId,
      name: parsedInput.name,
    });

    revalidatePath('/projects');

    return { success: true, data: project };
  });
```

### Lifecycle Hook Integration

Combine entitlements with lifecycle hooks for provisioning:

```typescript {% title="packages/billing/stripe/src/hooks/on-subscription-created.ts" %}
import billingConfig from '@kit/web-billing-config';
import { getLogger } from '@kit/shared/logger';

/**
 * Hook called when a new subscription is created.
 * Extend this to provision resources, send emails, etc.
 */
export async function onSubscriptionCreated(subscription: {
  id: string;
  plan: string;
  referenceId: string;
  status: string | null;
  providerCustomerId?: string | null;
  providerSubscriptionId?: string | null;
}): Promise<void> {
  const logger = await getLogger();

  logger.info(
    {
      subscriptionId: subscription.id,
      plan: subscription.plan,
      referenceId: subscription.referenceId,
      status: subscription.status,
    },
    'Subscription created successfully'
  );

  // Entitlements are automatically granted by Stripe
  // based on the product's attached features.
  //
  // Use this hook to provision resources based on plan limits:

  const planConfig = billingConfig.products
    .flatMap(p => p.plans)
    .find(p => p.name === subscription.plan);

  if (planConfig?.limits) {
    // Example: provision resources for the new subscription
    await provisionResources({
      referenceId: subscription.referenceId,
      limits: planConfig.limits,
    });
  }
}
```

### UI Component for Limit Display

```tsx {% title="apps/web/app/[locale]/(internal)/settings/billing/_components/usage-card.tsx" %}
'use client';

interface UsageCardProps {
  label: string;
  current: number;
  limit: number | null;
}

export function UsageCard({ label, current, limit }: UsageCardProps) {
  const isUnlimited = limit === null;
  const percentage = isUnlimited ? 0 : (current / limit) * 100;
  const isNearLimit = !isUnlimited && percentage >= 80;

  return (
    <div className="rounded-lg border p-4">
      <div className="flex justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={isNearLimit ? 'text-destructive' : ''}>
          {current} / {isUnlimited ? 'Unlimited' : limit}
        </span>
      </div>
      {!isUnlimited && (
        <div className="mt-2 h-2 rounded-full bg-muted">
          <div
            className={`h-full rounded-full ${
              isNearLimit ? 'bg-destructive' : 'bg-primary'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
```

## Provider Support Matrix

| Feature | Stripe | Polar |
|---------|--------|-------|
| Plan Limits (`checkPlanLimit`) | Supported | Supported |
| Default Limits (free tier) | Supported | Supported |
| Entitlements (`checkEntitlement`) | Supported | Not supported |
| List Entitlements | Supported | Returns empty array |

When using Polar, `checkEntitlement()` returns `{ entitled: false, source: 'unsupported' }`. Use plan limits or custom logic instead.

## Limits vs Entitlements Decision Guide

**Use Plan Limits when:**
- The feature is countable (seats, projects, storage, API calls)
- You need to track current usage
- The limit varies by plan tier
- You want free tier limits

**Use Stripe Entitlements when:**
- The feature is boolean (on/off)
- You want Stripe to manage feature access
- You need real-time entitlement updates
- You're building complex product bundles in Stripe

## Common Pitfalls

- **Forgetting to check limits in code**: Limits are declarative only. If you don't call `checkPlanLimit()`, nothing is enforced.
- **Using `<=` instead of `<` comparison**: The `allowed` check uses `currentUsage < limit` so users can add up to (not including) the limit. One more item is allowed when at `limit - 1`.
- **Not handling the `hasSubscription` field**: When `hasSubscription` is `false`, default limits apply. You may want different UX for free users vs subscribers.
- **Expecting entitlements on Polar**: Polar doesn't support entitlements. Use plan limits or custom feature flags instead.
- **Caching stale limits**: Plan limits can change when users upgrade. Always check at action time, not page load.
- **Missing `defaultLimits` config**: Without `defaultLimits`, users without subscriptions get no limits (everything undefined = unlimited by default).

{% faq
   title="Frequently Asked Questions"
   items=[
     {"question": "How do I show remaining usage in the UI?", "answer": "Call getPlanLimits() to get all limits, then calculate remaining = limit - currentUsage for each. Display in a usage card component."},
     {"question": "Can I combine limits and entitlements?", "answer": "Yes. Use limits for quotas (max projects) and entitlements for feature flags (has advanced analytics). They serve different purposes."},
     {"question": "What happens if a user downgrades?", "answer": "Existing resources remain but new ones are blocked. You may want a lifecycle hook to handle over-limit situations gracefully."},
     {"question": "How do I test entitlements locally?", "answer": "Create test products in Stripe test mode with entitlements attached. Subscribe via test checkout and verify with checkEntitlement()."},
     {"question": "Can I have different limits for monthly vs yearly plans?", "answer": "Yes. Each plan object has its own limits property. Set different values per interval if needed."},
     {"question": "How do I handle the null (unlimited) case in UI?", "answer": "Check for null explicitly: limit === null means unlimited. Display 'Unlimited' or hide the progress bar."}
   ]
/%}

---

**Next:** [Metered Usage →](./metered-usage)

---
*This content was exported from Makerkit Documentation.*