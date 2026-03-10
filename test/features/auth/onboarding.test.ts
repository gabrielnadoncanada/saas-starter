import { ensureUserWorkspace } from '@/features/auth/server/onboarding';

function createDbDouble() {
  const teamMemberCreateCalls: unknown[] = [];
  const activityLogCalls: unknown[] = [];
  let findFirstResult: unknown = null;

  const db = {
    teamMember: {
      findFirst: async () => findFirstResult
    },
    $transaction: async (
      callback: (tx: Record<string, any>) => Promise<{ id: number }>
    ) =>
      callback({
        team: {
          create: async (args: { data: { name: string } }) => ({ id: 99 })
        },
        teamMember: {
          create: async (args: unknown) => {
            teamMemberCreateCalls.push(args);
          }
        },
        user: {
          update: async () => undefined
        },
        activityLog: {
          createMany: async (args: unknown) => {
            activityLogCalls.push(args);
          }
        }
      })
  };

  return {
    db,
    teamMemberCreateCalls,
    activityLogCalls,
    setFindFirstResult: (val: unknown) => {
      findFirstResult = val;
    }
  };
}

it('returns existing teamId when user already has a team', async () => {
  const { db, teamMemberCreateCalls, setFindFirstResult } = createDbDouble();
  setFindFirstResult({ teamId: 42 });

  const result = await ensureUserWorkspace(1, 'user@example.com', {
    db: db as never
  });

  expect(result).toBe(42);
  expect(teamMemberCreateCalls).toHaveLength(0);
});

it('creates team, membership, and activity logs for new user', async () => {
  const { db, teamMemberCreateCalls, activityLogCalls } = createDbDouble();

  const result = await ensureUserWorkspace(1, 'user@example.com', {
    db: db as never
  });

  expect(result).toBe(99);
  expect(teamMemberCreateCalls).toHaveLength(1);
  expect(activityLogCalls).toHaveLength(1);
});
