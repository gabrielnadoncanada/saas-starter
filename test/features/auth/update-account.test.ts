vi.mock("@/auth", () => ({ auth: vi.fn() }));

import { updateAccount } from "@/features/auth/server/update-account";

function createDeps(teamId: number | null = 10) {
  const userUpdateCalls: unknown[] = [];
  const activityLogCalls: Array<{
    teamId: unknown;
    userId: number;
    action: string;
  }> = [];

  const deps = {
    getUserWithTeam: async () => (teamId !== null ? { teamId } : null),
    logAuthActivity: async (tid: unknown, userId: number, action: string) => {
      activityLogCalls.push({ teamId: tid, userId, action });
    },
    db: {
      user: {
        update: async (args: unknown) => {
          userUpdateCalls.push(args);
        },
      },
    },
  };

  return { deps: deps as never, userUpdateCalls, activityLogCalls };
}

it("updates user and logs activity with team", async () => {
  const { deps, userUpdateCalls, activityLogCalls } = createDeps(10);

  const result = await updateAccount(
    { userId: 1, name: "New Name", email: "new@example.com" },
    deps,
  );

  expect(result).toEqual({
    name: "New Name",
    success: "Account updated successfully.",
  });
  expect(userUpdateCalls).toHaveLength(1);
  expect(userUpdateCalls[0]).toEqual({
    where: { id: 1 },
    data: { name: "New Name", email: "new@example.com" },
  });
  expect(activityLogCalls).toHaveLength(1);
  expect(activityLogCalls[0].teamId).toBe(10);
});

it("updates user and passes null teamId when user has no team", async () => {
  const { deps, userUpdateCalls, activityLogCalls } = createDeps(null);

  const result = await updateAccount(
    { userId: 2, name: "Solo User", email: "solo@example.com" },
    deps,
  );

  expect(result).toEqual({
    name: "Solo User",
    success: "Account updated successfully.",
  });
  expect(userUpdateCalls).toHaveLength(1);
  expect(activityLogCalls).toHaveLength(1);
  expect(activityLogCalls[0].teamId).toBeUndefined();
});
