# Examples

## Example 1: good default

```ts
"use server";

import { validatedActionWithUser } from "@/lib/auth/middleware";
import { updateProfileSchema } from "@/features/account/schemas/account.schema";
import { updateProfile } from "@/features/account/server/update-profile";

export const updateProfileAction = validatedActionWithUser(
  updateProfileSchema,
  async (data, _, user) => updateProfile(user.id, data),
);
```

```ts
import { db } from "@/lib/db/prisma";

export async function updateProfile(userId: number, data: UpdateProfileInput) {
  await db.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      companyName: data.companyName,
    },
  });

  return { success: "Profile updated successfully." };
}
```

Judgment:
- strong fit
- obvious flow
- thin boundary
- no unnecessary ceremony

## Example 2: structurally valid, commercially borderline

```ts
type UpdateProfileDeps = {
  db: Pick<typeof db, "user">;
  now: () => Date;
};

const defaultDeps: UpdateProfileDeps = {
  db,
  now: () => new Date(),
};

export async function updateProfile(
  userId: number,
  data: UpdateProfileInput,
  deps = defaultDeps,
) {
  await deps.db.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      updatedAt: deps.now(),
    },
  });

  return { success: "Profile updated successfully." };
}
```

Judgment:
- technically fine
- borderline for this buyer
- adds scaffolding whose payoff is not obvious
- better for a codebase selling advanced testability than for an indie starter

Better move:
- keep the function
- keep the thin action
- remove the default dependency object unless complexity clearly grows

## Example 3: too much for the target buyer

```ts
export class UpdateProfileUseCase {
  constructor(
    private readonly repository: UserRepository,
    private readonly clock: Clock,
  ) {}

  async execute(command: UpdateProfileCommand): Promise<Result<void>> {
    const user = await this.repository.findById(command.userId);

    if (!user) {
      return Result.fail("User not found");
    }

    user.updateProfile({
      name: command.name,
      updatedAt: this.clock.now(),
    });

    await this.repository.save(user);

    return Result.ok();
  }
}
```

Judgment:
- possible fit for an internal enterprise app
- too much for a ShipFast-style starter
- too many concepts before a buyer can make a normal edit
- lowers time-to-modify for the target audience

## Example 4: complexity justifies more structure

```ts
export async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      return syncSubscriptionState(event);
    case "checkout.session.completed":
      return handleCheckoutCompleted(event);
    default:
      return;
  }
}
```

```ts
export async function syncSubscriptionState(event: Stripe.Event) {
  // fetch customer, normalize subscription payload,
  // update billing records, guard idempotency, log audit event
}
```

Judgment:
- extra structure is justified
- billing is naturally high-risk and multi-step
- still keep the flow understandable
- do not let this level of structure leak into simple feature work
