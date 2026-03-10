vi.mock('@/lib/stripe/client', () => ({ stripe: {} }));

import {
  getStripePrices,
  getStripeProducts
} from '@/features/billing/server/stripe-catalog';

function createStripeDouble(overrides: {
  prices?: unknown[];
  products?: unknown[];
} = {}) {
  const stripe = {
    prices: {
      list: async () => ({
        data: overrides.prices ?? []
      })
    },
    products: {
      list: async () => ({
        data: overrides.products ?? []
      })
    }
  };

  return { stripe };
}

it('maps prices with expanded product objects', async () => {
  const { stripe } = createStripeDouble({
    prices: [
      {
        id: 'price_1',
        product: { id: 'prod_1' },
        unit_amount: 800,
        currency: 'usd',
        recurring: { interval: 'month', trial_period_days: 14 }
      }
    ]
  });

  const result = await getStripePrices({ stripe: stripe as never });

  expect(result).toEqual([
    {
      id: 'price_1',
      productId: 'prod_1',
      unitAmount: 800,
      currency: 'usd',
      interval: 'month',
      trialPeriodDays: 14
    }
  ]);
});

it('maps prices with string product IDs', async () => {
  const { stripe } = createStripeDouble({
    prices: [
      {
        id: 'price_2',
        product: 'prod_string',
        unit_amount: 1200,
        currency: 'eur',
        recurring: { interval: 'year', trial_period_days: null }
      }
    ]
  });

  const result = await getStripePrices({ stripe: stripe as never });

  expect(result[0].productId).toBe('prod_string');
  expect(result[0].trialPeriodDays).toBeNull();
});

it('returns empty array when no prices', async () => {
  const { stripe } = createStripeDouble();

  const result = await getStripePrices({ stripe: stripe as never });

  expect(result).toEqual([]);
});

it('maps products with expanded default_price objects', async () => {
  const { stripe } = createStripeDouble({
    products: [
      {
        id: 'prod_1',
        name: 'Pro Plan',
        description: 'All features',
        default_price: { id: 'price_default' }
      }
    ]
  });

  const result = await getStripeProducts({ stripe: stripe as never });

  expect(result).toEqual([
    {
      id: 'prod_1',
      name: 'Pro Plan',
      description: 'All features',
      defaultPriceId: 'price_default'
    }
  ]);
});

it('maps products with string default_price', async () => {
  const { stripe } = createStripeDouble({
    products: [
      {
        id: 'prod_2',
        name: 'Basic',
        description: null,
        default_price: 'price_string'
      }
    ]
  });

  const result = await getStripeProducts({ stripe: stripe as never });

  expect(result[0].defaultPriceId).toBe('price_string');
});

it('returns empty array when no products', async () => {
  const { stripe } = createStripeDouble();

  const result = await getStripeProducts({ stripe: stripe as never });

  expect(result).toEqual([]);
});
