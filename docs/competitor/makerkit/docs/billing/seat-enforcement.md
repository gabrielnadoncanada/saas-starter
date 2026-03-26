# Seat enforcement for organization invites

> Enforce seat limits on team invitations in Next.js Prisma applications

> Source: https://makerkit.dev/docs/nextjs-prisma/billing/seat-enforcement

---

Block organizations from exceeding purchased seats when inviting members. The `SeatEnforcementService` validates `members + pending invites` against `subscription.seats`, throwing `SeatLimitReachedError` at the limit. Enforcement triggers automatically before invite, resend, and accept operations.

This page is part of the [Billing & Subscriptions](./overview) documentation.

Seat enforcement validates organization member count plus pending invitations against purchased seat quantity (`subscription.seats`) before permitting invite operations.

## Definitions

| Term | Description |
|------|-------------|
| **Purchased seats** | `subscription.seats` on the active subscription record (Stripe quantity) |
| **Used seats** | Current organization member count |
| **Reserved seats** | Pending, unexpired invitations |

### Seat value interpretation

- `number`: finite seat quantity (enforced)
- `null`: unlimited seats (not enforced)
- `undefined`: seats not provided / provider doesn't surface it (not enforced)

## When enforcement applies

Seat enforcement is only enabled when:

1. The action is in **organization context**
2. The organization has an **active or trialing** subscription
3. That subscription has `subscription.seats` as a **number**

## Implementation

Seat enforcement is implemented via `SeatEnforcementService` in `@kit/organization-core/services`. This service is called by `InvitationsService` before each invitation operation.

### Service location

```
packages/organization/core/src/services/seat-enforcement.service.ts
```

### Service methods

```typescript
import { createSeatEnforcementService } from '@kit/organization-core/services';

const seatService = createSeatEnforcementService(db);

// Before creating a new invitation
await seatService.assertCanInviteMember({ organizationId });

// Before resending an invitation (handles already-reserved case)
await seatService.assertCanResendInvitation({ organizationId, invitationId });

// Before accepting an invitation (final gate)
await seatService.assertCanAcceptInvitation({ organizationId });
```

### Usage in InvitationsService

The `InvitationsService` calls these methods automatically:

```typescript
// packages/organization/core/src/services/invitations.service.ts

class InvitationsService {
  async inviteMember({ organizationId, ... }) {
    await this.seatEnforcement.assertCanInviteMember({ organizationId });
    // ... create invitation via Better Auth
  }

  async resendInvitation({ organizationId, invitationId, ... }) {
    await this.seatEnforcement.assertCanResendInvitation({
      organizationId,
      invitationId
    });
    // ... resend invitation via Better Auth
  }

  async acceptInvitation({ invitationId, ... }) {
    await this.seatEnforcement.assertCanAcceptInvitation({ organizationId });
    // ... accept invitation via Better Auth
  }
}
```

## Enforcement points

### Invite member (create invitation)

Before creating a new invitation:

- Compute `membersCount + pendingInvitesCount`
- Reject if `membersCount + pendingInvitesCount + 1 > purchasedSeats`

### Resend invitation

Special handling for resends:

- If invitation is **pending + unexpired** (already reserved): resending does **not** consume another seat
- If invitation is **expired**: resending creates a new pending invite and follows the invite rule (`+1`)

### Accept invitation

Final gate before adding a member:

- Reject if `membersCount + 1 > purchasedSeats`

## Error handling

When seat limit is reached, the service throws `SeatLimitReachedError`:

```typescript
import { SeatLimitReachedError } from '@kit/organization-core/services';

try {
  await seatService.assertCanInviteMember({ organizationId });
} catch (error) {
  if (error instanceof SeatLimitReachedError) {
    // error.code === 'SEAT_LIMIT_REACHED'
    // error.details contains: organizationId, purchasedSeats, membersCount, etc.
  }
}
```

## UX guidance

When an invite is blocked:

- Show a clear message: "Seat limit reached. Upgrade seats to invite more members."
- Provide a CTA: "Manage billing" → `/settings/billing`

## Error code

Server actions surface the stable error code: `SEAT_LIMIT_REACHED`

## Provider support

| Provider | Seat enforcement |
|----------|------------------|
| **Stripe** | Supported (seat quantity maps to Stripe subscription quantity) |
| **Polar** | Not implemented (no `seats` quantity), enforcement does not run |

## Requiring a subscription

By default, MakerKit does **not** block invites when an organization has no subscription (seat enforcement only applies when a subscription with numeric seats exists).

If your product requires billing before teams can invite members, you can add a custom policy to the invitation registries in `packages/organization/policies/src/registry.ts`.

## Common Pitfalls

- **Assuming enforcement applies without a subscription**: Enforcement only runs when an organization has an active/trialing subscription with numeric seats. No subscription = no enforcement.
- **Forgetting expired invitations count differently**: Resending an expired invitation counts as a new invite (+1 seat), but resending a pending one doesn't.
- **Not handling `SeatLimitReachedError` in UI**: Catch this error and show a clear message with upgrade CTA. Silent failures confuse users.
- **Expecting Polar to enforce seats**: Polar doesn't have quantity billing. Seat enforcement is Stripe-only.
- **Unlimited seats confusion**: When `seats` is `null`, enforcement doesn't run - but `undefined` (no seats field) also skips enforcement. Be explicit about your intent.
- **Race conditions with concurrent invites**: Two admins inviting simultaneously could exceed limits. The service checks at invite time, not commit time.

{% faq
   title="Frequently Asked Questions"
   items=[
     {"question": "How do I require billing before any invites?", "answer": "Add a custom policy in packages/organization/policies/src/registry.ts that checks for an active subscription before allowing invites, regardless of seat count."},
     {"question": "Why can users still accept invites after seats are full?", "answer": "The accept check only validates members + 1 vs seats. If invites were sent when seats were available, they remain valid. Consider adding stricter accept-time validation."},
     {"question": "How do I show remaining seats in the UI?", "answer": "Calculate: purchasedSeats - (membersCount + pendingInvitesCount). Use this to show 'X seats remaining' or disable the invite button at 0."},
     {"question": "Can I customize the error message?", "answer": "Catch SeatLimitReachedError in your server action and return a custom error. The error's details include purchasedSeats, membersCount, and pendingInvitesCount for context."},
     {"question": "Does removing a member free up a seat?", "answer": "Yes, for new invites. The enforcement check runs at invite/accept time using current member count."}
   ]
/%}

---

**Related docs:**

- [Customization](./customization) (seat computation at checkout time)
- [Providers](./providers) (provider differences)
- [Billing Configuration](./billing-configuration) (setting plan limits)

---
*This content was exported from Makerkit Documentation.*