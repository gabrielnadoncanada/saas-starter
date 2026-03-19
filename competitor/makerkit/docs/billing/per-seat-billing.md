# Per-Seat Billing

> Dynamic per-seat billing with automatic quantity sync in Next.js Prisma

> Source: https://makerkit.dev/docs/nextjs-prisma/billing/per-seat-billing

---

Automatically update subscription quantities as team members join or leave organizations. Unlike seat limits (which cap membership), per-seat billing charges based on actual member count with automatic proration.

This page is part of the [Billing & Subscriptions](./overview) documentation. Available since **version 1.1.0**.

## Overview

By default, the kit supports **seat limits** (`limits.seats`) which cap the number of members but don't bill dynamically. This guide shows how to implement **usage-based seats** where your billing provider charges based on actual member count.

**Supported providers:**
- **Stripe**: Auto-syncs via `seatPriceId` (recommended) or manual updates via `subscriptionItems.update`
- **Polar**: Updates subscription seats via `subscriptions.update`

## Automatic Seat Sync (Recommended)

Since **version 1.3.0**, Better Auth's Stripe plugin handles seat syncing automatically when you set `seatPriceId` on your plan. No custom hooks, services, or policies required.

```
Member Joins Org → Better Auth hook → Stripe quantity updated → Prorated charge
Member Leaves Org → Better Auth hook → Stripe quantity updated → Prorated credit
```

### How It Works

When `seatPriceId` is set on a `StripePlan`:

1. **At checkout**: Better Auth creates two line items — the base plan (quantity 1) and a seat line item (`seatPriceId`, quantity = current member count)
2. **On member add**: Better Auth counts org members and updates the Stripe subscription seat item quantity
3. **On member remove**: Same — quantity decreases automatically
4. **Proration**: Uses `create_prorations` by default

### Step 1: Create Per-Seat Prices in Stripe

In Stripe Dashboard, for **each billing interval**:

1. Create a product (e.g., "Team Seat")
2. Add a **recurring per-unit price** for monthly (e.g., `price_seat_monthly`)
3. Add a **recurring per-unit price** for yearly (e.g., `price_seat_yearly`)

{% callout type="warning" title="Separate prices per interval" %}
Stripe rejects mixed-interval checkout sessions. You need a separate seat price for each billing interval (monthly seat price for monthly plans, yearly seat price for yearly plans).
{% /callout %}

### Step 2: Configure `seatPriceId` in Billing Config

Add `seatPriceId` to each plan that uses per-seat billing:

```typescript {% title="packages/billing/config/src/config.ts" %}
{
  id: 'pro',
  name: 'Pro',
  description: 'For growing teams',
  currency: 'USD',
  features: ['Per-seat billing', 'Priority support'],
  plans: [
    {
      name: 'pro-monthly',
      planId: process.env.STRIPE_PRICE_PRO_MONTHLY!,
      seatPriceId: process.env.STRIPE_SEAT_PRICE_PRO_MONTHLY,
      displayName: 'Pro Monthly',
      interval: 'month',
      cost: 19.99, // base price
      limits: { seats: 10 },
    },
    {
      name: 'pro-yearly',
      planId: process.env.STRIPE_PRICE_PRO_YEARLY!,
      seatPriceId: process.env.STRIPE_SEAT_PRICE_PRO_YEARLY,
      displayName: 'Pro Yearly',
      interval: 'year',
      cost: 199.99,
      limits: { seats: 10 },
    },
  ],
}
```

**That's it.** No services, hooks, or policies to write. Better Auth handles everything internally.

### Environment Variables

```bash
# Base plan prices
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...

# Per-seat prices (one per interval)
STRIPE_SEAT_PRICE_PRO_MONTHLY=price_...
STRIPE_SEAT_PRICE_PRO_YEARLY=price_...
```

### Seat-Only Plans

If your plan is **entirely** per-seat (no base fee), set `seatPriceId` equal to `planId`:

```typescript
{
  name: 'team-monthly',
  planId: process.env.STRIPE_SEAT_PRICE_MONTHLY!,
  seatPriceId: process.env.STRIPE_SEAT_PRICE_MONTHLY,
  interval: 'month',
  cost: 10, // per seat
}
```

This creates a single line item at checkout instead of base + seat.

### Requirements

- Better Auth Stripe plugin with `organization: { enabled: true }` (already configured in the kit)
- `seatPriceId` is Stripe-only; Polar does not support this field (use manual approach below)

### What About `limits.seats`?

`limits.seats` and `seatPriceId` serve different purposes:

| Feature | `limits.seats` | `seatPriceId` |
|---------|---------------|---------------|
| Purpose | Cap member count | Auto-sync billing quantity |
| Enforcement | `SeatEnforcementService` | Stripe subscription |
| Billing effect | None | Charges per seat |

You can use both together: `limits.seats` prevents inviting beyond a threshold, while `seatPriceId` ensures Stripe charges for actual members.

---

## Manual Seat Sync (Alternative)

For Polar, or when you need custom seat logic (free included seats, custom proration, etc.), use the manual approach.

### Architecture

```
Invitation Accepted → Policy → Update Subscription Quantity → Prorated Charge
Admin Removes Member → Policy → Update Subscription Quantity → Prorated Credit
User Leaves Org → Policy → Update Subscription Quantity → Prorated Credit
```

### Quick Start

```typescript
import { auth } from '@kit/better-auth';
import { getBilling } from '@kit/billing-api';

// Get active subscription and update seats
const billing = await getBilling(auth);
const { subscriptions } = await billing.listSubscriptions({ referenceId: orgId });
const sub = subscriptions.find(s => s.status === 'active');

await billing.updateSubscriptionQuantity({
  subscriptionId: sub.providerSubscriptionId,
  quantity: memberCount,
  priceId: process.env.STRIPE_SEAT_PRICE_ID, // Stripe only
});
```

### Prerequisites

1. Billing provider with a **per-seat price** configured (recurring, quantity-based)
2. Understanding of Better Auth hooks and organization policies
3. Provider must support subscription updates (`supportsSubscriptionUpdates: true`)

### Step 1: Create Per-Seat Price

#### Stripe

In Stripe Dashboard:
1. Create a product (e.g., "Team Seats")
2. Add a recurring price with **per unit** pricing
3. Copy the price ID (e.g., `price_xxx`)

#### Polar

In Polar Dashboard:
1. Create a product with per-seat pricing
2. Configure the seats option for the subscription

### Step 2: Create Seat Update Service

```typescript {% title="apps/web/lib/billing/seat-billing.service.ts" %}
import 'server-only';

import { auth } from '@kit/better-auth';
import { getBilling } from '@kit/billing-api';
import { db } from '@kit/database';
import { getLogger } from '@kit/shared/logger';

// Your per-seat price ID (required for Stripe, optional for Polar)
const SEAT_PRICE_ID = process.env.STRIPE_SEAT_PRICE_ID;

export async function updateSubscriptionSeats(organizationId: string) {
  const logger = await getLogger();

  // 1. Get current member count
  const memberCount = await db.member.count({
    where: { organizationId },
  });

  const seatCount = Math.max(1, memberCount);

  // 2. Get billing client (provider-agnostic)
  const billing = await getBilling(auth);

  // Check if provider supports subscription updates
  if (!billing.capabilities.supportsSubscriptionUpdates) {
    logger.warn('Provider does not support subscription updates');
    return;
  }

  // 3. Get active subscription via billing client
  const { subscriptions } = await billing.listSubscriptions({
    referenceId: organizationId,
  });

  const activeSub = subscriptions.find((sub) =>
    ['active', 'trialing'].includes(sub.status),
  );

  if (!activeSub?.providerSubscriptionId) {
    logger.info({ organizationId }, 'No active subscription found for org');
    return;
  }

  // 4. Update quantity using provider-agnostic billing client
  try {
    await billing.updateSubscriptionQuantity({
      subscriptionId: activeSub.providerSubscriptionId,
      quantity: seatCount,
      priceId: SEAT_PRICE_ID, // Required for Stripe, ignored for Polar
      prorationBehavior: 'create_prorations',
    });

    logger.info(
      { organizationId, seatCount },
      'Updated subscription seats',
    );
  } catch (error) {
    logger.error(
      { organizationId, error },
      'Failed to update subscription seats',
    );
    throw error;
  }
}
```

**Notes:**
- The `db` import is the Prisma client from your database package (`@kit/database`).
- Uses `billing.listSubscriptions()` to fetch subscriptions (works for both Stripe and Polar)
- Stripe stores subscriptions locally; Polar fetches from API - the billing client handles both
- For Stripe multi-item subscriptions, `priceId` is required to identify which item to update
- For Polar, `priceId` is ignored (seats are at subscription level)

### Step 3: Hook into Member Events

Register policies in the organization policies registry to update seats on member changes.

#### Create the Seat Billing Policy

```typescript {% title="packages/organization/policies/src/policies/seat-billing.ts" %}
import { definePolicy } from '@kit/policies';

import type {
  AfterInvitationAcceptContext,
  AfterMemberRemoveContext,
} from '../types';

import { updateSubscriptionSeats } from '~/lib/billing/seat-billing.service';

/**
 * Policy: Update seat count when invitation is accepted
 */
export const seatBillingOnAcceptPolicy = definePolicy<AfterInvitationAcceptContext>({
  name: 'seat-billing-on-accept',
  description: 'Updates subscription seat quantity when member joins',
  evaluate: async (ctx) => {
    await updateSubscriptionSeats(ctx.organizationId);
    return { allowed: true };
  },
});

/**
 * Policy: Update seat count when member is removed
 */
export const seatBillingOnRemovePolicy = definePolicy<AfterMemberRemoveContext>({
  name: 'seat-billing-on-remove',
  description: 'Updates subscription seat quantity when member leaves',
  evaluate: async (ctx) => {
    await updateSubscriptionSeats(ctx.organizationId);
    return { allowed: true };
  },
});
```

#### Register the Policies

```typescript {% title="packages/organization/policies/src/registry.ts" %}
import {
  seatBillingOnAcceptPolicy,
  seatBillingOnRemovePolicy,
} from './policies/seat-billing';

// Register seat billing policies
afterInvitationAcceptRegistry.registerPolicy(seatBillingOnAcceptPolicy);
afterMemberRemoveRegistry.registerPolicy(seatBillingOnRemovePolicy);
```

The `afterMemberRemove` hook fires for both:
- Admin removing a member
- User voluntarily leaving the organization

### Step 4: Initial Seats at Checkout

Pass the current member count as `seats` at checkout time:

```typescript
const memberCount = await getOrganizationMemberCount(organizationId);

await billing.checkout({
  userId,
  planId: 'pro-monthly',
  referenceId: organizationId,
  seats: memberCount, // Set initial quantity
  successUrl: '/billing/success',
  cancelUrl: '/billing/cancel',
});
```

This sets the subscription's initial quantity. After checkout, the seat update service handles adjustments when members join/leave.

## Proration Options

Control how billing providers handle mid-cycle changes:

```typescript
await billing.updateSubscriptionQuantity({
  subscriptionId: activeSub.providerSubscriptionId,
  quantity: seatCount,
  priceId: SEAT_PRICE_ID,
  prorationBehavior: 'create_prorations', // default
});
```

| Behavior | Description |
|----------|-------------|
| `create_prorations` | Charge/credit prorated amount (default) |
| `always_invoice` | Invoice immediately |
| `none` | No proration (Stripe only, Polar falls back to prorate) |

## Edge Cases

### Pending Invitations

Decide whether pending invitations should count toward seats:
- **Yes**: Update seats when invitation is sent
- **No**: Update seats only when invitation is accepted (recommended)

### Free Tier / Included Seats

If your plan includes N free seats:

```typescript
const FREE_SEATS_INCLUDED = 3;
const billableSeats = Math.max(0, memberCount - FREE_SEATS_INCLUDED);
```

### Minimum Seats

Both Stripe and Polar require quantity >= 1. The service already handles this:

```typescript
const seatCount = Math.max(1, memberCount);
```

## Testing

1. Create a test organization with a per-seat subscription
2. Add a member - verify subscription quantity increases in your billing provider
3. Remove a member - verify quantity decreases
4. Check your billing provider dashboard for proration invoices

## Webhook Considerations

If seats are modified outside your application (e.g., admin changes quantity in provider dashboard), the billing client's `listSubscriptions()` will return the updated count automatically since it queries the provider directly.

For Stripe (which stores subscriptions locally), Better Auth's webhook handlers sync data to the database automatically. No additional webhook handling is needed for seat syncing.

## Common Pitfalls

- **Using seat limits instead of usage-based**: This guide implements dynamic billing. If you just want to cap members, use `limits.seats` in your billing config instead.
- **Forgetting minimum seat requirement**: Both Stripe and Polar require quantity >= 1. Always use `Math.max(1, count)`.
- **Missing `priceId` for Stripe multi-item**: When a subscription has multiple prices, you must specify which price to update.
- **Not handling policy errors**: The policy should log errors but return `{ allowed: true }` to avoid blocking member operations.
- **Counting pending invitations**: Recommended to only count accepted members to avoid billing for users who never join.
- **Mixed-interval seat prices**: When using `seatPriceId`, use a separate seat price per interval (monthly/yearly). Stripe rejects mixed-interval checkout sessions.

{% faq
   title="Frequently Asked Questions"
   items=[
     {"question": "What's the difference between seat limits and usage-based seats?", "answer": "Seat limits (limits.seats) cap member count but don't affect billing. Usage-based seats dynamically update the subscription quantity and billing amount."},
     {"question": "Do I need to handle both add and remove?", "answer": "With seatPriceId (automatic sync), no — Better Auth handles both directions. With the manual approach, yes — register policies for both afterInvitationAccept and afterMemberRemove."},
     {"question": "Can I combine this with seat enforcement?", "answer": "Yes, with seatPriceId you can use both. SeatEnforcementService caps invites at purchased seats (defense-in-depth), while seatPriceId ensures Stripe charges for actual members."},
     {"question": "Should I use seatPriceId or manual hooks?", "answer": "Use seatPriceId for Stripe — it's simpler and handled by Better Auth automatically. Use manual hooks for Polar, or when you need custom logic (free included seats, custom proration, etc.)."},
   ]
/%}

---

**Related docs:**

- [Billing Configuration](./billing-configuration) - Plan and product setup
- [Advanced Pricing](./advanced-pricing) - Multi-line item checkout with per-seat pricing
- [Seat Enforcement](./seat-enforcement) - Cap members at purchased seat limit
- [Customization](./customization) - Customize seat computation at checkout
- [Providers](./providers) - Provider capabilities comparison
- [Organization Lifecycle Hooks](/help/organizations/lifecycle-hooks) - Complete guide to after hooks for organization events

---
*This content was exported from Makerkit Documentation.*