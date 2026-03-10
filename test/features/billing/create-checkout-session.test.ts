vi.mock('@/lib/stripe/client', () => ({ stripe: {} }));

import { createCheckoutSession } from '@/features/billing/server/create-checkout-session';

function createStripeDouble() {
  const createCalls: unknown[] = [];

  const stripe = {
    checkout: {
      sessions: {
        create: async (args: unknown) => {
          createCalls.push(args);
          return { url: 'https://checkout.stripe.com/session_abc' };
        }
      }
    }
  };

  return { stripe, createCalls };
}

beforeEach(() => {
  process.env.BASE_URL = 'https://app.example.com';
});

it('returns the checkout session URL', async () => {
  const { stripe } = createStripeDouble();

  const url = await createCheckoutSession(
    {
      priceId: 'price_123',
      stripeCustomerId: null,
      userEmail: 'user@example.com',
      userId: 1
    },
    { stripe: stripe as never }
  );

  expect(url).toBe('https://checkout.stripe.com/session_abc');
});

it('uses customer ID when stripeCustomerId exists', async () => {
  const { stripe, createCalls } = createStripeDouble();

  await createCheckoutSession(
    {
      priceId: 'price_123',
      stripeCustomerId: 'cus_existing',
      userEmail: 'user@example.com',
      userId: 1
    },
    { stripe: stripe as never }
  );

  const args = createCalls[0] as Record<string, unknown>;
  expect(args.customer).toBe('cus_existing');
  expect(args.customer_email).toBeUndefined();
});

it('uses email when no stripeCustomerId', async () => {
  const { stripe, createCalls } = createStripeDouble();

  await createCheckoutSession(
    {
      priceId: 'price_123',
      stripeCustomerId: null,
      userEmail: 'user@example.com',
      userId: 1
    },
    { stripe: stripe as never }
  );

  const args = createCalls[0] as Record<string, unknown>;
  expect(args.customer).toBeUndefined();
  expect(args.customer_email).toBe('user@example.com');
});

it('sets client_reference_id to stringified userId', async () => {
  const { stripe, createCalls } = createStripeDouble();

  await createCheckoutSession(
    {
      priceId: 'price_123',
      stripeCustomerId: null,
      userEmail: 'user@example.com',
      userId: 42
    },
    { stripe: stripe as never }
  );

  const args = createCalls[0] as Record<string, unknown>;
  expect(args.client_reference_id).toBe('42');
});

it('builds correct success and cancel URLs from BASE_URL', async () => {
  const { stripe, createCalls } = createStripeDouble();

  await createCheckoutSession(
    {
      priceId: 'price_123',
      stripeCustomerId: null,
      userEmail: 'user@example.com',
      userId: 1
    },
    { stripe: stripe as never }
  );

  const args = createCalls[0] as Record<string, unknown>;
  expect(args.success_url).toBe(
    'https://app.example.com/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}'
  );
  expect(args.cancel_url).toBe('https://app.example.com/pricing');
});
