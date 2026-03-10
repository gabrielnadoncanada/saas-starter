import type Stripe from 'stripe';

import { handleSubscriptionChange } from '@/features/billing/server/handle-subscription-change';

function makeSubscription(
  overrides: Partial<{
    id: string;
    customer: string;
    status: string;
    productId: string;
    productName: string;
  }> = {}
) {
  return {
    id: overrides.id ?? 'sub_123',
    customer: overrides.customer ?? 'cus_123',
    status: overrides.status ?? 'active',
    items: {
      data: [
        {
          plan: {
            product: {
              id: overrides.productId ?? 'prod_123',
              name: overrides.productName ?? 'Pro Plan'
            }
          }
        }
      ]
    }
  } as unknown as Stripe.Subscription;
}

function createDbDouble(team: { id: number } | null = { id: 1 }) {
  const updateCalls: unknown[] = [];

  const db = {
    team: {
      findFirst: async () => team,
      update: async (args: unknown) => {
        updateCalls.push(args);
      }
    }
  };

  return { db, updateCalls };
}

it('logs error and returns when team not found', async () => {
  const { db, updateCalls } = createDbDouble(null);
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  await handleSubscriptionChange(makeSubscription(), { db: db as never });

  expect(consoleSpy).toHaveBeenCalledWith(
    'Team not found for Stripe customer:',
    'cus_123'
  );
  expect(updateCalls).toHaveLength(0);
  consoleSpy.mockRestore();
});

it('updates team with subscription data for active status', async () => {
  const { db, updateCalls } = createDbDouble();

  await handleSubscriptionChange(
    makeSubscription({ status: 'active', productName: 'Pro Plan' }),
    { db: db as never }
  );

  expect(updateCalls).toHaveLength(1);
  const args = updateCalls[0] as { data: Record<string, unknown> };
  expect(args.data.stripeSubscriptionId).toBe('sub_123');
  expect(args.data.planName).toBe('Pro Plan');
  expect(args.data.subscriptionStatus).toBe('active');
});

it('updates team with subscription data for trialing status', async () => {
  const { db, updateCalls } = createDbDouble();

  await handleSubscriptionChange(
    makeSubscription({ status: 'trialing' }),
    { db: db as never }
  );

  expect(updateCalls).toHaveLength(1);
  const args = updateCalls[0] as { data: Record<string, unknown> };
  expect(args.data.subscriptionStatus).toBe('trialing');
});

it('clears subscription data for canceled status', async () => {
  const { db, updateCalls } = createDbDouble();

  await handleSubscriptionChange(
    makeSubscription({ status: 'canceled' }),
    { db: db as never }
  );

  expect(updateCalls).toHaveLength(1);
  const args = updateCalls[0] as { data: Record<string, unknown> };
  expect(args.data.stripeSubscriptionId).toBeNull();
  expect(args.data.stripeProductId).toBeNull();
  expect(args.data.planName).toBeNull();
  expect(args.data.subscriptionStatus).toBe('canceled');
});

it('clears subscription data for unpaid status', async () => {
  const { db, updateCalls } = createDbDouble();

  await handleSubscriptionChange(
    makeSubscription({ status: 'unpaid' }),
    { db: db as never }
  );

  expect(updateCalls).toHaveLength(1);
  const args = updateCalls[0] as { data: Record<string, unknown> };
  expect(args.data.subscriptionStatus).toBe('unpaid');
});

it('does nothing for unhandled statuses', async () => {
  const { db, updateCalls } = createDbDouble();

  await handleSubscriptionChange(
    makeSubscription({ status: 'incomplete' }),
    { db: db as never }
  );

  expect(updateCalls).toHaveLength(0);
});
