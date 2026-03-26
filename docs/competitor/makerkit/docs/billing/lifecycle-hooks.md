# Lifecycle Hooks

> Execute custom code on billing events in your Next.js Prisma application

> Source: https://makerkit.dev/docs/nextjs-prisma/billing/lifecycle-hooks

---

Execute custom code on billing events by editing hook files in `packages/billing/stripe/src/hooks/` or `packages/billing/polar/src/hooks/`. Hooks receive event data and run your logic: send emails, sync CRMs, provision resources, or track analytics.

This page is part of the [Billing & Subscriptions](./overview) documentation.

Lifecycle hooks are async functions triggered by billing provider webhooks (subscription created, canceled, payment failed, etc.), letting you extend billing behavior without touching core code.

## Provider-Specific Hooks

Hooks are now organized per-provider for better separation and flexibility:

- **Stripe hooks**: `packages/billing/stripe/src/hooks/`
- **Polar hooks**: `packages/billing/polar/src/hooks/`

Each provider has its own set of hooks based on the events it supports.

## Stripe Hooks

| Hook | When it's called |
|------|------------------|
| `onSubscriptionCreated` | New subscription is created |
| `onSubscriptionUpdated` | Subscription plan or status changes |
| `onSubscriptionCanceled` | Subscription is canceled |
| `onSubscriptionDeleted` | Subscription is permanently deleted |
| `onTrialStarted` | Trial period begins |
| `onTrialEnding` | Trial is about to end |
| `onTrialExpired` | Trial ends without conversion |
| `onPaymentFailed` | Payment attempt fails |

## Polar Hooks

| Hook | When it's called |
|------|------------------|
| `onSubscriptionCreated` | New subscription is created |
| `onSubscriptionUpdated` | Subscription status changes |
| `onSubscriptionCanceled` | Subscription is canceled |
| `onOrderPaid` | Order payment completed |
| `onCustomerCreated` | New customer record created |
| `onCustomerStateChanged` | Customer state changes |

## How Hooks Are Triggered

- **Stripe**:
    - Subscription create/update/cancel/delete are triggered by Better Auth’s Stripe integration.
    - Trial start/expiry are wired from your billing config (`freeTrial`) via `packages/billing/stripe/src/stripe-plugin.ts`.
    - Payment failure is handled via Stripe events (see `onPaymentFailed`).
    - Trial ending reminders (`onTrialEnding`) are not guaranteed unless you wire `customer.subscription.trial_will_end` to the hook.
- **Polar**:
    - Hook execution depends on Polar webhooks being configured (`POLAR_WEBHOOK_SECRET`).
    - Without webhooks, checkout/portal can still work, but lifecycle hooks will not run automatically.

## Important: Idempotency and Error Handling

- Webhooks can be retried and events can be delivered more than once. Make hooks **idempotent** (e.g., use unique keys like subscription id + event type).
- Prefer logging + continuing over throwing. A hook should not prevent billing state from being updated.

## Adding Your Logic

Edit the hook files in your provider's hooks directory. Each hook receives relevant event data.

### On Subscription Created

If you want to perform any actions when a user subscribes to a plan, you can use the `onSubscriptionCreated` hook:

```typescript {title="packages/billing/stripe/src/hooks/on-subscription-created.ts"}
export async function onSubscriptionCreated(subscription: {
  id: string;
  plan: string;
  status: string;
  referenceId: string;
}) {
  // Send welcome email
  await sendWelcomeEmail({
    referenceId: subscription.referenceId,
    plan: subscription.plan,
  });

  // Track conversion in analytics
  await trackEvent('subscription_created', {
    plan: subscription.plan,
    referenceId: subscription.referenceId,
  });

  // Store plan limits in database
  await db.insert(subscriptionLimits).values({
    referenceId: subscription.referenceId,
    maxSeats: getPlanSeats(subscription.plan),
    maxProjects: getPlanProjects(subscription.plan),
  });
}
```

### On Payment Failed

If you want to perform any actions when a payment fails, you can use the `onPaymentFailed` hook:

```typescript {title="packages/billing/stripe/src/hooks/on-payment-failed.ts"}
export async function onPaymentFailed(payment: {
  subscriptionId: string;
  customerId: string | Stripe.Customer | Stripe.DeletedCustomer | null;
  invoiceId: string;
  amount: number;
  currency: string;
  attemptCount: number;
  nextPaymentAttempt: Date | null;
}) {
  // Email the customer
  await sendEmail({
    template: 'payment-failed',
    data: {
      amount: payment.amount,
      currency: payment.currency,
      nextAttempt: payment.nextPaymentAttempt,
    },
  });

  // Alert your team after multiple failures
  if (payment.attemptCount >= 3) {
    await notifySlack({
      channel: '#billing-alerts',
      message: `Payment failed ${payment.attemptCount} times`,
    });
  }
}
```

### On Trial Ending (Reminder)

If you want to perform actions shortly **before** a trial ends (e.g. reminder emails), use the `onTrialEnding` hook.

In Stripe, this typically corresponds to the `customer.subscription.trial_will_end` webhook event (commonly sent ~3 days before the trial ends). If you need this behavior, wire the event to your hook in `packages/billing/stripe/src/stripe-plugin.ts`.

```typescript
export async function onTrialEnding(trial: {
  id: string;
  plan: string;
  referenceId: string;
  trialEnd: Date | null;
}) {
  if (!trial.trialEnd) {
    return;
  }

  await sendEmail({
    template: 'trial-ending-reminder',
    data: {
      plan: trial.plan,
      trialEnd: trial.trialEnd,
      daysRemaining: Math.ceil(
        (trial.trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      ),
    },
  });
}
```

### On Trial Expired (No Conversion)

Use `onTrialExpired` for when a trial ends **without converting** to a paid subscription (cleanup, follow-ups, etc.).

### On Subscription Canceled

If you want to perform any actions when a subscription is canceled, you can use the `onSubscriptionCanceled` hook:

```typescript
export async function onSubscriptionCanceled(subscription: {
  id: string;
  plan: string;
  status: string;
  referenceId: string;
}) {
  // Send cancellation survey
  await sendEmail({
    template: 'cancellation-survey',
    data: { plan: subscription.plan },
  });

  // Track churn
  await trackEvent('subscription_canceled', {
    plan: subscription.plan,
    referenceId: subscription.referenceId,
  });
}
```

## Common use cases

### Sync to External Services

```typescript
// on-subscription-created.ts
export async function onSubscriptionCreated(subscription) {
  // Update CRM
  await updateHubspotDeal({
    referenceId: subscription.referenceId,
    plan: subscription.plan,
    status: 'won',
  });

  // Track in analytics
  await posthog.capture({
    distinctId: subscription.referenceId,
    event: 'subscription_started',
    properties: { plan: subscription.plan },
  });
}
```

## Error Handling

Hooks should handle errors gracefully - don't let a failed email prevent the subscription from completing:

```typescript {title="packages/billing/stripe/src/hooks/on-subscription-created.ts"}
export async function onSubscriptionCreated(subscription) {
  const logger = await getLogger();

  try {
    await sendWelcomeEmail(subscription);
  } catch (error) {
    // Log but don't throw - the subscription should still succeed
    logger.error('Failed to send welcome email', {
      error: error.message,
      subscriptionId: subscription.id,
    });
  }

  // Continue with other logic
  await trackEvent('subscription_created', subscription);
}
```

## Polar Hook Examples

### On Order Paid

Polar fires this when an order payment completes:

```typescript {title="packages/billing/polar/src/hooks/on-order-paid.ts"}
export async function onOrderPaid(order: {
  id: string;
  customerId: string;
}) {
  const logger = await getLogger();

  logger.info('Order paid', {
    orderId: order.id,
    customerId: order.customerId,
  });

  // Your custom logic here
  await trackEvent('order_paid', {
    orderId: order.id,
    customerId: order.customerId,
  });
}
```

### On Customer Created

Polar fires this when a new customer is created:

```typescript {title="packages/billing/polar/src/hooks/on-customer-created.ts"}
export async function onCustomerCreated(customer: {
  id: string;
  email: string;
}) {
  const logger = await getLogger();

  logger.info('Customer created in Polar', {
    customerId: customer.id,
    email: customer.email,
  });

  // Sync to CRM, analytics, etc.
  await syncToCRM({
    externalId: customer.id,
    email: customer.email,
  });
}
```

## Decision Rules

**Implement a hook when:**
- You need to sync billing events to external services (CRM, analytics, email)
- You want to provision resources when subscriptions start
- You need to notify users about payment failures or trial endings
- You want audit logging for subscription changes

**Keep hooks lightweight when:**
- The operation is blocking (prefer async queues for slow operations)
- You're doing database writes that could fail
- The external service has high latency

**If unsure:** Start with logging. Add functionality incrementally and always wrap external calls in try/catch.

## Common Pitfalls

- **Throwing errors that block subscription updates**: Wrap all external calls in try/catch. A failed email shouldn't prevent subscription state from updating.
- **Non-idempotent hooks**: Webhooks can be delivered multiple times. Use unique keys (subscription ID + event type) to detect duplicates.
- **Forgetting to configure webhooks**: Hooks only run when webhook events arrive. For Polar, this requires explicit webhook setup. For Stripe local dev, run `stripe:listen`.
- **Heavy synchronous operations**: Long-running tasks (video processing, large file operations) should be queued, not run inline.
- **Missing logger initialization**: Always `await getLogger()` before logging. The logger may need async initialization.
- **Assuming `onTrialEnding` fires automatically**: For Stripe, you need to wire `customer.subscription.trial_will_end` to the hook manually in the plugin.

{% faq
   title="Frequently Asked Questions"
   items=[
     {"question": "How do I test hooks locally?", "answer": "Run pnpm --filter web run stripe:listen for Stripe, or use ngrok with Polar. Complete a test checkout and watch your server logs for hook execution."},
     {"question": "Can I add new hooks beyond the predefined ones?", "answer": "Yes. Edit the provider's plugin file (e.g., stripe-plugin.ts) to handle additional webhook events and call your custom hook functions."},
     {"question": "Why isn't my hook running?", "answer": "Check: 1) Webhooks are configured, 2) The event type is subscribed, 3) Your hook file is exported correctly, 4) No errors are silently caught before your code."},
     {"question": "Should I use hooks for feature provisioning?", "answer": "Yes, but keep it simple. For complex provisioning, use hooks to enqueue a job rather than doing the work inline."},
     {"question": "How do I handle retried webhook events?", "answer": "Make hooks idempotent. Check if the action was already performed (e.g., email already sent) before executing."}
   ]
/%}

---

**Next:** [Customization →](./customization)

---
*This content was exported from Makerkit Documentation.*