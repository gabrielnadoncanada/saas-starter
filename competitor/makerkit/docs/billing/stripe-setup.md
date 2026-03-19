# Stripe Setup

> Connect Stripe to your Next.js Prisma application for subscription billing

> Source: https://makerkit.dev/docs/nextjs-prisma/billing/stripe-setup

---

Connecting Stripe involves four steps: obtain API keys from your Stripe Dashboard, create products with Price IDs, set up webhooks for subscription sync, and verify with test cards.

This page is part of the [Billing & Subscriptions](./overview) documentation.

The Stripe integration leverages Better Auth's Stripe plugin for checkout sessions, customer records, subscription lifecycle, and webhook processing, all accessible through the unified `BillingClient` API.

## Before You Start

- A Stripe account ([stripe.com](https://stripe.com))
- Access to your `.env` file

Use Stripe test mode keys during development. Production verification can wait until launch.

## Step 1: Obtain API Keys

### Development Keys (Test Mode)

1. Sign in to Stripe Dashboard
2. Switch to **Test mode** or use the **Sandbox**
3. Copy the **Secret key** (prefix: `sk_test_`)

{% img src="/assets/images/docs/stripe-sandbox.webp" alt="Stripe Sandbox" width="1000" height="1000" /%}

Add to your `.env.local` file:

```bash
STRIPE_SECRET_KEY=sk_test_51O...your_test_key_here
```

This key is for testing only.

## Step 2: Set Up Products and Prices

### Via Stripe Dashboard

{% img src="/assets/images/docs/stripe-add-product.webp" alt="Stripe Add Product" width="1000" height="1000" /%}

Create products and prices directly in the Stripe Dashboard. We'll set up Starter and Pro tiers.

Both products need monthly and yearly prices. Starter at $9.99/$99.99, Pro at $19.99/$199.99.

Steps:

1. Navigate to **Products** → **Add product**
2. Create a product for each tier (e.g., "Starter", "Pro", "Enterprise")
3. For each product, add prices:
   - Set billing period (monthly/yearly)
   - Set amount
   - Enable "Recurring" billing
4. Copy each Price ID (starts with `price_`)

### Sample Product Configuration

Example pricing for Starter and Pro:

**Starter Product**
- Monthly Price ($9.99/month)
- Yearly Price ($99.99/year)

**Pro Product**
- Monthly Price ($19.99/month)
- Yearly Price ($199.99/year)

{% img src="/assets/images/docs/stripe-dashboard-products.webp" alt="Stripe Products" width="1000" height="1000" /%}

### Store Price IDs

After creating products, copy each Price ID.

Add them to `.env.development` or `.env.local`:

```bash
STRIPE_PRICE_STARTER_MONTHLY=price_...
STRIPE_PRICE_STARTER_YEARLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
```

**Note**: Variable names are flexible. What matters is using the correct Price ID (prefix `price_`), not Product ID (prefix `prod_`). This is a frequent configuration error.

## Step 3: Map Plans in Config

Update your billing configuration with product details:

```typescript {title="packages/billing/config/src/config.ts"}
export const billingConfig: BillingConfig = {
  products: [
    {
      id: 'starter',
      name: 'Starter',
      description: 'For individuals and small teams',
      currency: 'USD',
      features: ['Core features', 'Email support'],
      plans: [
        {
          name: 'starter-monthly',
          planId: process.env.STRIPE_PRICE_STARTER_MONTHLY!,
          displayName: 'Starter Monthly',
          interval: 'month',
          cost: 9.99,
        },
        {
          name: 'starter-yearly',
          planId: process.env.STRIPE_PRICE_STARTER_YEARLY!,
          displayName: 'Starter Yearly',
          interval: 'year',
          cost: 99.99,
        },
      ],
    },
  ],
};
```

## Enable Plan Switching in Portal

Stripe's Customer Portal can allow plan changes. Configure this in the Stripe Dashboard.

See [Stripe Billing Portal docs](https://docs.stripe.com/customer-management/configure-portal#configure-subscription-management) for details.

## Organization Billing (B2B)

With **Stripe**, MakerKit supports dedicated organization billing:

- Users have `users.stripeCustomerId` (individual billing)
- Organizations have `organizations.stripeCustomerId` (team billing)

Better Auth's Stripe plugin handles customer creation automatically:

- Org Stripe customers are created during first checkout/upgrade
- Organization name updates sync to Stripe's customer record
- Orgs with active subscriptions can't be deleted

Customize customer creation in `packages/billing/stripe/src/stripe-plugin.ts`.

## Step 4: Set Up Webhooks

Webhooks enable real-time subscription event handling from Stripe.

### Local Development

A Docker command starts the Stripe CLI and forwards webhooks locally.

Run:

```bash
pnpm --filter web run stripe:listen
```

**Without Docker**: Install Stripe CLI globally and run:

```bash
stripe listen --forward-to http://localhost:3000/api/auth/stripe/webhook
```

First run prompts for **Stripe login**. Follow the on-screen instructions.

{% img src="/assets/images/docs/stripe-cli-login.webp" alt="Stripe CLI Login" width="1000" height="1000" /%}

After logging in, run again:

```bash
pnpm --filter web run stripe:listen
```

Copy the webhook signing secret (prefix `whsec_`) from the output:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

This secret is required for both development and production. Without it, signature verification fails and events won't process.

For remote server testing, configure the webhook destination URL in Stripe Sandbox, similar to production setup.

### Production Webhooks

For production, configure the webhook endpoint in Stripe Dashboard:

1. In Stripe Dashboard, navigate to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL: `https://yourdomain.com/api/auth/stripe/webhook`
4. Select events to listen for at least the following:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. More webhooks events may be required depending on your needs (eg. if you need to handle othr events)
6. Copy the webhook signing secret
7. Add to production environment variables (always prefer using the hosting provider's environment variables editor)

```bash
STRIPE_WEBHOOK_SECRET=whsec_...production_secret
```

## Step 5: Verify Integration

### Test Checkout Flow

Stripe provides test cards:

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0025 0000 3155` | Requires 3D Secure authentication |
| `4000 0000 0000 9995` | Payment declined |

### Verify Trial Functionality

1. Start a subscription with trial enabled
2. Confirm trial end date in Stripe Dashboard
3. Verify `status: 'trialing'` shows in your app

## Environment Variables

Full Stripe configuration:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_... # or sk_live_... for production

# Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional Stripe behavior toggles (defaults shown)
CREATE_CUSTOMER_ON_SIGN_UP=true
STRIPE_ENABLE_TRIAL_WITHOUT_CC=false
ENABLE_AUTOMATIC_TAX_CALCULATION=false
ENABLE_TAX_ID_COLLECTION=false

# Price IDs (from Stripe Dashboard) (names are up to you)
STRIPE_PRICE_STARTER_MONTHLY=price_...
STRIPE_PRICE_STARTER_YEARLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_...
STRIPE_PRICE_ENTERPRISE_YEARLY=price_...

# Application URL (for redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000 # or your production domain
```

## Security Guidelines

### API Key Safety

- Keep API keys out of version control
- Separate test and production keys
- Rotate keys regularly
- Limit permissions in Stripe Dashboard

### Webhook Verification

The plugin verifies webhook signatures automatically:

```typescript
stripe({
  stripeClient,
  stripeWebhookSecret: STRIPE_WEBHOOK_SECRET,
  // Webhooks are verified before processing
});
```

### Launch Checklist

Before going live:

- [ ] Swap test keys for live keys
- [ ] Set up production webhook endpoint
- [ ] Verify webhook events in production
- [ ] Enable billing email notifications
- [ ] Configure Customer Portal in Stripe Dashboard
- [ ] Review Stripe Radar fraud rules

## Watch Out For

- **Product ID instead of Price ID**: Billing config needs Price IDs (`price_...`), not Product IDs (`prod_...`). Most common mistake.
- **Webhook secret mismatch**: Development and production secrets differ. CLI-generated secrets won't work in production.
- **Skipping `stripe:listen` locally**: Without the forwarder, subscription state doesn't sync after checkout.
- **Wrong webhook URL**: The endpoint is `/api/auth/stripe/webhook`, not `/api/stripe/webhook` or `/webhooks/stripe`.
- **Missing webhook events**: At minimum: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`.
- **Test keys in production**: `sk_test_...` keys fail in production. Switch to `sk_live_...` before launch.

{% faq
   title="Frequently Asked Questions"
   items=[
     {"question": "Where do I find my webhook signing secret?", "answer": "For local dev, run pnpm --filter web run stripe:listen and copy the whsec_... output. For production, go to Stripe Dashboard → Developers → Webhooks → your endpoint → Signing secret."},
     {"question": "Why aren't subscriptions syncing after checkout?", "answer": "Webhooks aren't reaching your app. Check that stripe:listen is running locally, or verify your production webhook URL is correct and the secret matches."},
     {"question": "Can I use the same products for test and production?", "answer": "No. Test mode and live mode have separate product catalogs. You'll need to recreate products and prices in live mode with new Price IDs."},
     {"question": "How do I enable plan switching in the customer portal?", "answer": "In Stripe Dashboard → Settings → Billing → Customer portal → Configure. Enable 'Switch plans' under Subscriptions."},
     {"question": "What's the difference between test mode and sandbox?", "answer": "Stripe Sandbox is newer and provides isolated test environments. Test mode is the classic approach. Both work with sk_test_ keys."}
   ]
/%}

---

**Next:** [Polar Setup →](./polar-setup)

---
*This content was exported from Makerkit Documentation.*