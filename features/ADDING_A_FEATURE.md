# Adding a Feature

Use the minimal CRUD flow below as the default path for simple features. Reach for `features/tasks/` only when you also need the heavier production pattern with audit trail, notifications, attachments, bulk actions, and table behavior.

## Default Build Order

1. Create a feature folder such as `features/invoices/`.
2. Add the schema first so form validation and server validation share one contract.
3. Add server functions for reads and writes inside the feature.
4. Add server actions only for user-triggered mutations.
5. Add components that render the feature UI.
6. Add a thin route in `app/` that fetches data and renders the feature.

## Quick Start (Minimal CRUD)

Start here for most new features. This path gives you a working CRUD flow without audit logging or notifications. Add those only when the feature genuinely needs them.

1. `features/invoices/invoice-form.schema.ts` — Zod schema shared by client and server.
2. `features/invoices/server/invoice-mutations.ts` — Prisma reads and writes, org-scoped.
3. `features/invoices/server/invoice-server-actions.ts` — `"use server"` actions using `validatedAuthenticatedAction`. Return `{ success }` or `{ error }` directly.
4. `features/invoices/components/invoice-form.tsx` — Form UI.
5. `features/invoices/components/invoices-page.tsx` — Page component.
6. `app/(app)/dashboard/invoices/page.tsx` — Thin route.

A minimal server action without audit or notifications looks like this:

```ts
export const createInvoiceAction = validatedAuthenticatedAction(
  createInvoiceSchema,
  async (data) => {
    const invoice = await createInvoice(data);
    revalidatePath(routes.app.invoices);
    return { success: "Invoice created" };
  },
);
```

When the feature is ready for production and needs cross-cutting product events, add audit logging and notifications by following the full pattern below.

## Full Pattern (with Audit + Notifications)

For CRUD work with audit trail and in-app notifications, copy the task flow in this order:

1. `features/tasks/task-form.schema.ts`
2. `features/tasks/server/task-mutations.ts`
3. `features/tasks/server/task-server-actions.ts`
4. `features/tasks/components/task-form.tsx`
5. `features/tasks/components/tasks-page.tsx`
6. `app/(app)/dashboard/tasks/page.tsx`

The task server actions show the full pattern: mutation, then `recordAuditLog()` and `createNotification()` in parallel. This is the right choice for features where you need an audit trail or want users to see activity in their notification feed.

## Billing and Limits

If the feature is monetized:

1. Add the new capability or limit key in `shared/config/billing.config.ts`.
2. Assign it to plans in the same file.
3. Guard writes with `assertCapability(planId, "your.capability")`.
4. Track monthly usage with `consumeMonthlyUsage(orgId, "yourLimit", planId)` when needed.

## Organization Scope

Use these two rules:

1. Read the hydrated organization with `getCurrentOrganization()` when the UI needs members, plan, or subscription state.
2. Use `requireActiveOrganizationMembership()` or `requireActiveOrganizationRole()` when a mutation only needs a guard.

## Route Pattern

Keep the route thin:

```tsx
import { FeaturePage } from "@/features/invoices/components/feature-page";
import { getInvoicesPage } from "@/features/invoices/server/get-invoices-page";

export default async function InvoicesRoute() {
  const page = await getInvoicesPage();
  return <FeaturePage page={page} />;
}
```

## Test Pattern

Add at least one feature-local test file under `test/` for:

1. the guard or permission path
2. the main success path
3. one failure path that buyers are likely to hit

Use `test/organizations/organization-membership.test.ts` and `test/assistant/assistant-tools.test.ts` as simple mock-first examples.
