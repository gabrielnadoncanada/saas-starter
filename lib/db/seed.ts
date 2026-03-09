import { db } from './prisma';
import { stripe } from '@/lib/stripe/client';

async function createStripeProducts() {
  console.log('Creating Stripe products and prices...');

  const baseProduct = await stripe.products.create({
    name: 'Base',
    description: 'Base subscription plan'
  });

  await stripe.prices.create({
    product: baseProduct.id,
    unit_amount: 800,
    currency: 'usd',
    recurring: {
      interval: 'month',
      trial_period_days: 7
    }
  });

  const plusProduct = await stripe.products.create({
    name: 'Plus',
    description: 'Plus subscription plan'
  });

  await stripe.prices.create({
    product: plusProduct.id,
    unit_amount: 1200,
    currency: 'usd',
    recurring: {
      interval: 'month',
      trial_period_days: 7
    }
  });

  console.log('Stripe products and prices created successfully.');
}

async function seed() {
  const email = 'test@test.com';

  await db.user.upsert({
    where: { email },
    update: {
      role: 'owner'
    },
    create: {
      email,
      role: 'owner'
    }
  });

  console.log('Initial user ready.');

  let team = await db.team.findFirst({
    where: { name: 'Test Team' }
  });

  if (!team) {
    team = await db.team.create({
      data: {
        name: 'Test Team'
      }
    });
  }

  const user = await db.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error('Seed user not found');
  }

  const existingTeamMember = await db.teamMember.findFirst({
    where: {
      teamId: team.id,
      userId: user.id
    }
  });

  if (!existingTeamMember) {
    await db.teamMember.create({
      data: {
        teamId: team.id,
        userId: user.id,
        role: 'owner'
      }
    });
  }

  await createStripeProducts();
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
