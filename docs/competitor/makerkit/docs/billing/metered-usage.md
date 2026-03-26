# Metered Usage Billing

> Usage-based billing with Stripe Billing Meters in Next.js Prisma

> Source: https://makerkit.dev/docs/nextjs-prisma/billing/metered-usage

---

Bill customers for actual usage using Stripe Billing Meters. Record usage events (`recordUsage`), query aggregated data (`getUsage`), and let Stripe calculate charges at period end. Ideal for AI tokens, API calls, storage, and other metered resources.

This page is part of the [Billing & Subscriptions](./overview) documentation.

## Overview

Usage-based billing charges customers for what they actually use rather than a flat subscription fee. Stripe Billing Meters aggregate usage events and calculate charges at the end of each billing period.

| Component | Description |
|-----------|-------------|
| **Meter** | Defines what you're tracking (API calls, tokens, storage) |
| **Events** | Individual usage records sent to Stripe |
| **Aggregation** | How events are combined (sum, count, max) |

## Setting Up Stripe Billing Meters

### 1. Create a Meter in Stripe Dashboard

1. Go to **Stripe Dashboard** → **Billing** → **Meters**
2. Click **Create meter**
3. Configure the meter:
   - **Display name**: "AI Tokens" (shown on invoices)
   - **Event name**: `ai_tokens` (used in code)
   - **Aggregation**: Sum (total tokens used)
   - **Value key**: `value` (default)

### 2. Attach Meter to a Price

1. Go to **Products** → Your product → **Add price**
2. Select **Usage-based** pricing model
3. Choose your meter
4. Set the per-unit price (e.g., $0.001 per token)

### 3. Note Your Meter ID

Copy the meter ID (`mtr_xxx`) for querying usage later.

## Recording Usage

Use `billing.recordUsage()` to send usage events to Stripe:

```typescript {% title="packages/billing/ui/src/services/usage.service.ts" %}
import { auth } from '@kit/better-auth';
import { getBilling } from '@kit/billing-api';

export async function recordAiTokenUsage(
  customerId: string,
  tokenCount: number
) {
  const billing = await getBilling(auth);

  // Record AI token usage
  const result = await billing.recordUsage(
    'ai_tokens',      // Event name (matches Stripe meter)
    customerId,       // Stripe customer ID (cus_xxx)
    tokenCount,       // Usage value (e.g., 1500)
    new Date()        // Optional timestamp (defaults to now)
  );

  if (!result.recorded) {
    console.error('Failed to record usage:', result.error);
  }

  return result;
}
```

### Return Type

```typescript
interface RecordUsageResult {
  /** Whether the usage was recorded successfully */
  recorded: boolean;

  /** Error message if recording failed or unsupported */
  error?: string;
}
```

### Getting the Customer ID

Usage is recorded against the Stripe customer ID, not your internal user/org ID:

```typescript {% title="packages/billing/ui/src/services/usage.service.ts" %}
import { auth } from '@kit/better-auth';
import { getSession } from '@kit/better-auth/context';
import { getBilling } from '@kit/billing-api';

export async function recordUsageForCurrentUser(tokenCount: number) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('No session found');
  }

  const billing = await getBilling(auth);

  // For personal billing
  const customerId = billing.getCustomerId(session.user);

  // For organization billing (if in org context)
  // const customerId = billing.getCustomerId(
  //   session.user,
  //   organization,
  //   'organization'
  // );

  if (!customerId) {
    // User doesn't have a Stripe customer yet
    // This happens before their first checkout
    return { recorded: false, error: 'No customer ID' };
  }

  return await billing.recordUsage('ai_tokens', customerId, tokenCount);
}
```

## Querying Usage

Retrieve aggregated usage for display or validation:

```typescript {% title="packages/billing/ui/src/services/usage.service.ts" %}
import { auth } from '@kit/better-auth';
import { getBilling } from '@kit/billing-api';

export async function getCurrentMonthUsage(
  meterId: string,
  customerId: string
) {
  const billing = await getBilling(auth);

  // Get usage for current billing period
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const usage = await billing.getUsage(
    meterId,          // Meter ID from Stripe (mtr_xxx)
    customerId,       // Stripe customer ID
    startOfMonth,     // Period start
    new Date()        // Period end (now)
  );

  // usage is MeterUsageSummary[]
  if (usage.length > 0) {
    console.log(`Used ${usage[0].aggregatedValue} tokens this period`);
  }

  return usage;
}
```

### Return Type

```typescript
interface MeterUsageSummary {
  /** Meter ID */
  meterId: string;

  /** Customer ID */
  customerId: string;

  /** Aggregated value for the period */
  aggregatedValue: number;

  /** Start of the billing period */
  startTime: Date | null;

  /** End of the billing period */
  endTime: Date | null;
}
```

## Implementation Patterns

### AI Token Usage in Server Actions

```typescript {% title="apps/web/app/[locale]/(internal)/ai/_lib/ai-generate-action.ts" %}
'use server';

import { z } from 'zod';

import { authenticatedActionClient } from '@kit/action-middleware';
import { auth } from '@kit/better-auth';
import { getSession, requireActiveOrganizationId } from '@kit/better-auth/context';
import { getBilling } from '@kit/billing-api';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const generateSchema = z.object({
  prompt: z.string().min(1).max(4000),
});

export const generateAction = authenticatedActionClient
  .inputSchema(generateSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const organizationId = await requireActiveOrganizationId();
    const billing = await getBilling(auth);

    // Get Stripe customer ID for organization billing
    const customerId = billing.getCustomerId(
      session?.user,
      { id: organizationId },
      'organization'
    );

    if (!customerId) {
      throw new Error('No billing account found. Please subscribe first.');
    }

    // Generate AI response
    const result = await generateText({
      model: openai('gpt-4'),
      prompt: parsedInput.prompt,
    });

    // Record token usage (fire-and-forget for performance)
    const tokenCount =
      (result.usage?.promptTokens ?? 0) +
      (result.usage?.completionTokens ?? 0);

    await billing.recordUsage('ai_tokens', customerId, tokenCount).catch((err) => {
      console.error('Failed to record usage:', err);
    });

    return { success: true, data: result.text };
  });
```

### Combined Limits and Metered Billing

Use plan limits to cap usage, then bill for what's used:

```typescript {% title="packages/billing/ui/src/services/ai-usage.service.ts" %}
import { auth } from '@kit/better-auth';
import { getBilling } from '@kit/billing-api';

export async function checkAndRecordUsage(
  organizationId: string,
  customerId: string,
  tokenCount: number,
  currentMonthUsage: number
) {
  const billing = await getBilling(auth);

  // Check if within plan limit
  const { allowed, remaining } = await billing.checkPlanLimit({
    referenceId: organizationId,
    limitKey: 'aiTokens',
    currentUsage: currentMonthUsage,
  });

  if (!allowed) {
    return {
      success: false,
      error: `Token limit reached. ${remaining} remaining this month.`,
    };
  }

  // Record usage for billing
  await billing.recordUsage('ai_tokens', customerId, tokenCount);

  return { success: true };
}
```

## Displaying Usage to Users

### Usage Dashboard Component

```tsx {% title="apps/web/components/usage-dashboard.tsx" %}
'use client';

interface UsageDashboardProps {
  currentUsage: number;
  limit: number | null;
  meterDisplayName: string;
}

export function UsageDashboard({
  currentUsage,
  limit,
  meterDisplayName,
}: UsageDashboardProps) {
  const isUnlimited = limit === null;
  const percentage = isUnlimited ? 0 : (currentUsage / limit) * 100;

  return (
    <div className="rounded-lg border p-6">
      <h3 className="text-lg font-semibold">{meterDisplayName}</h3>

      <div className="mt-4">
        <div className="flex justify-between text-sm">
          <span>Current Period</span>
          <span>
            {currentUsage.toLocaleString()} /{' '}
            {isUnlimited ? 'Unlimited' : limit.toLocaleString()}
          </span>
        </div>

        {!isUnlimited && (
          <div className="mt-2 h-3 rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${
                percentage >= 90
                  ? 'bg-destructive'
                  : percentage >= 75
                    ? 'bg-warning'
                    : 'bg-primary'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        )}

        {!isUnlimited && percentage >= 75 && (
          <p className="mt-2 text-sm text-muted-foreground">
            {percentage >= 90
              ? 'Usage limit almost reached. Consider upgrading.'
              : 'Approaching usage limit.'}
          </p>
        )}
      </div>
    </div>
  );
}
```

### Server-Side Usage Loader

```typescript {% title="apps/web/app/[locale]/(internal)/settings/billing/page.tsx" %}
import { redirect } from 'next/navigation';

import { auth } from '@kit/better-auth';
import { getSession, requireActiveOrganizationId } from '@kit/better-auth/context';
import { getBilling } from '@kit/billing-api';

import { UsageDashboard } from './_components/usage-dashboard';

export default async function BillingPage() {
  const session = await getSession();
  const organizationId = await requireActiveOrganizationId();
  const billing = await getBilling(auth);

  const customerId = billing.getCustomerId(
    session?.user,
    { id: organizationId },
    'organization'
  );

  const { limits } = await billing.getPlanLimits(organizationId);

  // Get current usage from Stripe meter
  const meterId = process.env.STRIPE_AI_TOKENS_METER_ID!;
  const usage = customerId
    ? await billing.getUsage(meterId, customerId)
    : [];

  const currentUsage = usage[0]?.aggregatedValue ?? 0;

  return (
    <UsageDashboard
      currentUsage={currentUsage}
      limit={limits.aiTokens ?? null}
      meterDisplayName="AI Token Usage"
    />
  );
}
```

## Testing Metered Billing Locally

### 1. Create Test Meter

In Stripe test mode, create a meter with event name `ai_tokens_test`.

### 2. Use Test Customer

```typescript
// Use a test customer ID from your Stripe test dashboard
const testCustomerId = 'cus_test_xxx';

await billing.recordUsage('ai_tokens_test', testCustomerId, 100);
```

### 3. Verify in Stripe Dashboard

Check **Billing** → **Meters** → **Events** to see recorded usage.

### 4. Forward Webhooks Locally

Run the Stripe CLI to forward webhooks:

```bash
pnpm stripe:listen
```

## Provider Support

| Feature | Stripe | Polar |
|---------|--------|-------|
| Record Usage (`recordUsage`) | Full support | Supported |
| Query Usage (`getUsage`) | Time-range filtering | All-time only |
| Usage Aggregation | Sum, Count, Max | Sum |
| Real-time Events | Yes | Yes |

**Polar limitation:** The `getUsage()` method returns all-time aggregated usage regardless of the `startTime`/`endTime` parameters. The `startTime` and `endTime` in the response will be `null` to indicate this limitation. For billing-period usage tracking with Polar, you'll need to store usage snapshots in your own database at period boundaries.

## Error Handling

### Graceful Degradation

Both Stripe and Polar support usage meters, but handle time ranges differently. Always check the response:

```typescript
import { auth } from '@kit/better-auth';
import { getBilling } from '@kit/billing-api';

export async function recordUsageSafely(
  eventName: string,
  customerId: string,
  value: number
) {
  const billing = await getBilling(auth);

  const result = await billing.recordUsage(eventName, customerId, value);

  if (!result.recorded) {
    // Log but don't block the user action
    console.error('Usage recording failed:', result.error);
  }

  return result;
}

// When querying usage, handle the Polar limitation
export async function getUsageSafely(
  meterId: string,
  customerId: string,
  startTime?: Date,
  endTime?: Date
) {
  const billing = await getBilling(auth);

  const usage = await billing.getUsage(meterId, customerId, startTime, endTime);

  if (usage.length > 0 && usage[0].startTime === null) {
    // Polar provider - returns all-time usage
    console.warn('Provider does not support time-range filtering');
  }

  return usage;
}
```

## Common Pitfalls

- **Recording against wrong customer ID**: Use `billing.getCustomerId()` to get the Stripe customer ID. Don't use your internal user/org ID.
- **Forgetting to handle no-customer case**: New users don't have a Stripe customer until first checkout. Check for `undefined` customer ID.
- **Using wrong event name**: The event name must match exactly what you configured in Stripe. Case-sensitive.
- **Assuming time-range filtering works everywhere**: Polar returns all-time usage, ignoring `startTime`/`endTime` parameters. Check `startTime === null` in results.
- **Querying with wrong meter ID**: `getUsage()` requires the meter ID (`mtr_xxx`), not the event name.

{% faq
   title="Frequently Asked Questions"
   items=[
     {"question": "How quickly do usage events appear in Stripe?", "answer": "Events are processed in near real-time (seconds). However, aggregated usage summaries may have a slight delay."},
     {"question": "Can I update or delete usage events?", "answer": "No. Stripe meters are append-only. For corrections, record a negative event (if aggregation is 'sum') or contact Stripe support."},
     {"question": "What happens if usage recording fails?", "answer": "The user action should still succeed. Log the failure and consider a retry queue for reconciliation."},
     {"question": "Can I have multiple meters per subscription?", "answer": "Yes. Each meter tracks a different resource (tokens, storage, API calls). Attach multiple metered prices to your product."},
     {"question": "How do I test without affecting real billing?", "answer": "Use Stripe test mode. All meters, customers, and events in test mode are separate from production."}
   ]
/%}

---

**Related docs:**

- [Plan Limits & Entitlements](./entitlements) - Config-based quotas
- [Lifecycle Hooks](./lifecycle-hooks) - React to billing events
- [Billing Configuration](./billing-configuration) - Plan setup

---
*This content was exported from Makerkit Documentation.*