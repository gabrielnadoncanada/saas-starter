vi.mock('@/lib/stripe/client', () => ({ stripe: {} }));

import { finalizeCheckoutSession } from '@/features/billing/server/finalize-checkout';

const VALID_SESSION = {
  customer: { id: 'cus_123' },
  subscription: { id: 'sub_123' },
  client_reference_id: '1'
};

const VALID_SUBSCRIPTION = {
  status: 'active',
  items: {
    data: [
      {
        price: {
          product: { id: 'prod_123', name: 'Pro Plan' }
        }
      }
    ]
  }
};

function createDeps(overrides: {
  session?: unknown;
  subscription?: unknown;
  user?: unknown;
  userTeam?: unknown;
} = {}) {
  const teamUpdateCalls: unknown[] = [];

  const deps = {
    stripe: {
      checkout: {
        sessions: {
          retrieve: async () => ('session' in overrides ? overrides.session : VALID_SESSION)
        }
      },
      subscriptions: {
        retrieve: async () => ('subscription' in overrides ? overrides.subscription : VALID_SUBSCRIPTION)
      }
    },
    db: {
      user: {
        findUnique: async () => ('user' in overrides ? overrides.user : { id: 1 })
      },
      teamMember: {
        findFirst: async () => ('userTeam' in overrides ? overrides.userTeam : { teamId: 10 })
      },
      team: {
        update: async (args: unknown) => {
          teamUpdateCalls.push(args);
        }
      }
    }
  };

  return { deps: deps as never, teamUpdateCalls };
}

it('throws when customer data is a string', async () => {
  const { deps } = createDeps({ session: { customer: 'cus_123' } });
  await expect(finalizeCheckoutSession('sess_1', deps)).rejects.toThrow(
    'Invalid customer data from Stripe.'
  );
});

it('throws when customer is null', async () => {
  const { deps } = createDeps({ session: { customer: null } });
  await expect(finalizeCheckoutSession('sess_1', deps)).rejects.toThrow(
    'Invalid customer data from Stripe.'
  );
});

it('throws when no subscription found', async () => {
  const { deps } = createDeps({
    session: { customer: { id: 'cus_1' }, subscription: null, client_reference_id: '1' }
  });
  await expect(finalizeCheckoutSession('sess_1', deps)).rejects.toThrow(
    'No subscription found for this session.'
  );
});

it('throws when no plan found on subscription', async () => {
  const { deps } = createDeps({
    subscription: { items: { data: [] } }
  });
  await expect(finalizeCheckoutSession('sess_1', deps)).rejects.toThrow(
    'No plan found for this subscription.'
  );
});

it('throws when no client_reference_id', async () => {
  const { deps } = createDeps({
    session: { ...VALID_SESSION, client_reference_id: null }
  });
  await expect(finalizeCheckoutSession('sess_1', deps)).rejects.toThrow(
    "No user ID found in session's client_reference_id."
  );
});

it('throws when user not found in database', async () => {
  const { deps } = createDeps({ user: null });
  await expect(finalizeCheckoutSession('sess_1', deps)).rejects.toThrow(
    'User not found in database.'
  );
});

it('throws when user has no team', async () => {
  const { deps } = createDeps({ userTeam: null });
  await expect(finalizeCheckoutSession('sess_1', deps)).rejects.toThrow(
    'User is not associated with any team.'
  );
});

it('updates team with full subscription data on success', async () => {
  const { deps, teamUpdateCalls } = createDeps();

  await finalizeCheckoutSession('sess_1', deps);

  expect(teamUpdateCalls).toHaveLength(1);
  const call = teamUpdateCalls[0] as {
    where: { id: number };
    data: Record<string, unknown>;
  };
  expect(call.where).toEqual({ id: 10 });
  expect(call.data).toEqual({
    stripeCustomerId: 'cus_123',
    stripeSubscriptionId: 'sub_123',
    stripeProductId: 'prod_123',
    planName: 'Pro Plan',
    subscriptionStatus: 'active'
  });
});

it('handles string subscription ID in session', async () => {
  const { deps, teamUpdateCalls } = createDeps({
    session: {
      customer: { id: 'cus_123' },
      subscription: 'sub_string_id',
      client_reference_id: '1'
    }
  });

  await finalizeCheckoutSession('sess_1', deps);

  const call = teamUpdateCalls[0] as { data: Record<string, unknown> };
  expect(call.data.stripeSubscriptionId).toBe('sub_string_id');
});
