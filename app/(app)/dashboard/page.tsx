import Link from 'next/link';
import { ArrowRight, CheckCircle2, Users } from 'lucide-react';
import { getCurrentTeam } from '@/features/teams/server/current-team';
import { listCurrentTeamTasks } from '@/features/tasks/server/tasks';
import { Main } from '@/shared/components/layout/shell/Main';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { routes } from '@/shared/constants/routes';
import { resolvePlanFromStripeName, getPlan } from '@/features/billing/plans';
import { hasCapability, checkLimit } from '@/features/billing/guards';
import { getMonthlyUsage } from '@/features/billing/usage';
import { UsageMeter } from '@/features/billing/components/UsageMeter';
import { PlanBadge } from '@/features/billing/components/PlanBadge';
import { UpgradeCard } from '@/features/billing/components/UpgradeCard';

export default async function DashboardPage() {
  const [team, tasks] = await Promise.all([
    getCurrentTeam(),
    listCurrentTeamTasks(),
  ]);

  const planId = resolvePlanFromStripeName(team?.planName);
  const plan = getPlan(planId);
  const memberCount = team?.teamMembers?.length ?? 0;
  const taskCount = tasks.length;

  const tasksUsage = team
    ? await getMonthlyUsage(team.id, "tasksPerMonth")
    : 0;
  const taskLimit = checkLimit(planId, "tasksPerMonth", tasksUsage);

  return (
    <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back{team?.name ? ` to ${team.name}` : ''}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Current Plan</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              {plan.name}
              <PlanBadge plan={planId} />
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Tasks</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-orange-500" />
              {taskCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UsageMeter
              label="Monthly usage"
              current={tasksUsage}
              limit={taskLimit.limit}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Team Members</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-500" />
              {memberCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {!hasCapability(planId, "team.analytics") && (
        <UpgradeCard
          feature="Team Analytics"
          description="Upgrade to the Team plan to access advanced analytics for your team."
        />
      )}

      <div className="flex flex-wrap gap-4">
        <Link href={routes.app.tasks}>
          <Button variant="outline">
            View Tasks
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <Link href={routes.app.settingsTeam}>
          <Button variant="outline">
            Team Settings
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </Main>
  );
}
