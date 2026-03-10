vi.mock('@/lib/stripe/client', () => ({ stripe: {} }));

import { createCustomerPortalSession } from '@/features/billing/server/customer-portal';

const PARAMS = { stripeCustomerId: 'cus_123', stripeProductId: 'prod_123' };

function createStripeDouble(overrides: {
  configurations?: unknown[];
  product?: { id: string; active: boolean };
  prices?: { id: string }[];
} = {}) {
  const portalCreateCalls: unknown[] = [];
  const configCreateCalls: unknown[] = [];

  const stripe = {
    billingPortal: {
      configurations: {
        list: async () => ({
          data: overrides.configurations ?? []
        }),
        create: async (args: unknown) => {
          configCreateCalls.push(args);
          return { id: 'bpc_new' };
        }
      },
      sessions: {
        create: async (args: unknown) => {
          portalCreateCalls.push(args);
          return { url: 'https://billing.stripe.com/portal' };
        }
      }
    },
    products: {
      retrieve: async () =>
        overrides.product ?? { id: 'prod_123', active: true }
    },
    prices: {
      list: async () => ({
        data: overrides.prices ?? [{ id: 'price_1' }, { id: 'price_2' }]
      })
    }
  };

  return { stripe, portalCreateCalls, configCreateCalls };
}

beforeEach(() => {
  process.env.BASE_URL = 'https://app.example.com';
});

it('returns the portal session URL', async () => {
  const { stripe } = createStripeDouble({
    configurations: [{ id: 'bpc_existing' }]
  });

  const url = await createCustomerPortalSession(PARAMS, {
    stripe: stripe as never
  });

  expect(url).toBe('https://billing.stripe.com/portal');
});

it('uses existing configuration when available', async () => {
  const { stripe, portalCreateCalls, configCreateCalls } = createStripeDouble({
    configurations: [{ id: 'bpc_existing' }]
  });

  await createCustomerPortalSession(PARAMS, { stripe: stripe as never });

  expect(configCreateCalls).toHaveLength(0);
  const args = portalCreateCalls[0] as Record<string, unknown>;
  expect(args.configuration).toBe('bpc_existing');
});

it('creates new configuration when none exists', async () => {
  const { stripe, configCreateCalls, portalCreateCalls } = createStripeDouble();

  await createCustomerPortalSession(PARAMS, { stripe: stripe as never });

  expect(configCreateCalls).toHaveLength(1);
  const args = portalCreateCalls[0] as Record<string, unknown>;
  expect(args.configuration).toBe('bpc_new');
});

it('throws when product is inactive', async () => {
  const { stripe } = createStripeDouble({
    product: { id: 'prod_123', active: false }
  });

  await expect(
    createCustomerPortalSession(PARAMS, { stripe: stripe as never })
  ).rejects.toThrow("Team's product is not active in Stripe");
});

it('throws when no active prices found', async () => {
  const { stripe } = createStripeDouble({ prices: [] });

  await expect(
    createCustomerPortalSession(PARAMS, { stripe: stripe as never })
  ).rejects.toThrow("No active prices found for the team's product");
});

it('passes customer and return_url to portal session', async () => {
  const { stripe, portalCreateCalls } = createStripeDouble({
    configurations: [{ id: 'bpc_1' }]
  });

  await createCustomerPortalSession(PARAMS, { stripe: stripe as never });

  const args = portalCreateCalls[0] as Record<string, unknown>;
  expect(args.customer).toBe('cus_123');
  expect(args.return_url).toBe('https://app.example.com/dashboard');
});
