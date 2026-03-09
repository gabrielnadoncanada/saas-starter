# Server actions and server folder boundaries

## Goal

Keep server actions tiny.
Keep Prisma and feature server logic easy to test.

Default split:
- `actions/` = the Next.js mutation boundary
- `server/` = feature-specific server logic and database access

This should be the default in App Router SaaS starters.

---

## What a server action should contain at maximum

A server action should contain only these responsibilities:

1. accept `FormData` or serializable input from the UI
2. resolve the current user or session if needed
3. validate input with Zod or a validation helper
4. call one feature server function from `server/`
5. call `revalidatePath`, `revalidateTag`, `refresh`, or `redirect` if needed
6. return a small serializable result or action state

That is the default ceiling.

If an action starts doing more than this, move the extra logic into `server/`.

---

## What should not stay inside a server action

Do not keep these in `actions/` by default:
- Prisma queries
- Prisma transactions
- multi-step business workflows
- heavy branching based on domain rules
- reusable permission logic tied to domain data
- large data mapping and normalization logic
- non-trivial error translation logic
- cross-file reusable logic needed by multiple actions or routes

The action should remain a boundary file, not the main place where the feature works.

---

## What belongs in `server/`

Use `features/<feature>/server/` for feature-specific server-only logic such as:
- Prisma read queries
- Prisma write operations
- Prisma transactions
- feature-specific current-user lookups
- account, billing, invitation, or membership checks tied to domain data
- reusable server flows used by actions or server components
- assembling derived server data for sections, pages, or dashboards
- feature-level permission checks that need database access

Examples:
- `current-user.ts`
- `create-invoice.ts`
- `linked-accounts.ts`
- `billing-usage.ts`
- `complete-post-sign-in.ts`

If a file imports Prisma or touches the database, it usually belongs in `server/`.

---

## What stays in global `lib/` instead of feature `server/`

Use global `lib/` only for shared infrastructure.

Examples:
- `lib/db/prisma.ts`
- auth provider setup
- Stripe client setup
- generic framework integrations

Do not move feature queries into global `lib/` just because they talk to the database.

Keep domain-owned database logic inside the owning feature.

---

## Testability rules for `server/`

Keep `server/` files easy to test:
- accept plain typed inputs
- return plain data or result objects
- avoid `FormData` in `server/`
- avoid `redirect`, `revalidatePath`, `revalidateTag`, and `refresh` in `server/` by default
- avoid `cookies`, `headers`, and other Next request APIs unless truly necessary
- keep Next-specific APIs in `actions/` or route files
- keep files focused by responsibility

This makes it easy to:
- unit test pure server helpers
- integration test Prisma-backed functions
- keep E2E focused on the real user flows

---

## Good default split

```txt
features/
  invoices/
    actions/
      create-invoice.action.ts
    server/
      create-invoice.ts
    schemas/
      invoice.schema.ts
```

Example:

```ts
// actions/create-invoice.action.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createInvoice } from '../server/create-invoice';
import { createInvoiceSchema } from '../schemas/invoice.schema';

export async function createInvoiceAction(formData: FormData) {
  const input = createInvoiceSchema.parse({
    customerId: formData.get('customerId'),
    total: Number(formData.get('total'))
  });

  await createInvoice(input);
  revalidatePath('/dashboard/invoices');

  return { success: true };
}
```

```ts
// server/create-invoice.ts
import { prisma } from '@/lib/db/prisma';

export async function createInvoice(input: {
  customerId: string;
  total: number;
}) {
  return prisma.invoice.create({
    data: {
      customerId: input.customerId,
      total: input.total
    }
  });
}
```

This split is usually enough.

---

## Better pattern when there is auth or business logic

```ts
// actions/update-account.action.ts
'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '../server/current-user';
import { updateAccount } from '../server/update-account';
import { updateAccountSchema } from '../schemas/account.schema';

export async function updateAccountAction(formData: FormData) {
  const user = await getCurrentUser();

  const input = updateAccountSchema.parse({
    name: formData.get('name')
  });

  await updateAccount({ userId: user.id, input });
  revalidatePath('/dashboard/settings');

  return { success: true };
}
```

```ts
// server/update-account.ts
import { prisma } from '@/lib/db/prisma';

export async function updateAccount(params: {
  userId: number;
  input: { name: string };
}) {
  return prisma.user.update({
    where: { id: params.userId },
    data: { name: params.input.name }
  });
}
```

Benefits:
- the action stays framework-thin
- database logic is reusable
- `server/update-account.ts` is easier to unit or integration test

---

## When to split `server/` further

Keep a flat `server/` folder until there is real friction.

Split only when needed, for example:
- too many unrelated files in one feature
- clear read/write separation is useful
- a sub-domain inside the feature has grown large

Examples:

```txt
features/
  billing/
    server/
      checkout/
        create-checkout-session.ts
      portal/
        open-customer-portal.ts
      usage/
        billing-usage.ts
```

Do not create nested folders too early.

---

## Testing guidance

Default testing split:
- test `server/` with unit and integration tests
- test `actions/` lightly through integration or E2E
- test full user flows with Playwright or equivalent

Good rule:
- if it contains Prisma or domain logic, prefer testing the `server/` function directly
- if it contains `revalidatePath`, `redirect`, or action state wiring, test the boundary with higher-level tests

---

## Decision rule

Ask this question:

"Is this logic part of the Next.js mutation boundary, or is it part of the feature's server behavior?"

- Next.js boundary -> `actions/`
- feature server behavior or database access -> `server/`

When in doubt, keep the action smaller and move the rest into `server/`.
