import { ListTodo, Sparkles, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type DashboardWorkspacePulseCardProps = {
  planName: string;
  workspaceName: string;
  memberCount: number;
  taskCount: number;
  completedChecklistCount: number;
  checklistCount: number;
  canUseAI: boolean;
  assistantConversationCount: number;
  tasksUsage: number;
  aiCreditsUsage: number;
};

export function DashboardWorkspacePulseCard({
  planName,
  workspaceName,
  memberCount,
  taskCount,
  completedChecklistCount,
  checklistCount,
  canUseAI,
  assistantConversationCount,
  tasksUsage,
  aiCreditsUsage,
}: DashboardWorkspacePulseCardProps) {
  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <CardDescription>Workspace pulse</CardDescription>
        <CardAction className="hidden sm:block">
          <Badge variant="secondary">{planName}</Badge>
        </CardAction>
        <CardTitle className="text-2xl">{workspaceName}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2 sm:hidden">
          <Badge variant="secondary">{planName}</Badge>
        </div>

        <p className="max-w-2xl text-sm text-muted-foreground">
          Keep the team moving with a clean view of plan health, usage, and the
          work landing in your workspace.
        </p>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{`${memberCount} member${memberCount === 1 ? "" : "s"}`}</Badge>
          <Badge variant="outline">{`${taskCount} task${taskCount === 1 ? "" : "s"}`}</Badge>
          <Badge variant="outline">{`${completedChecklistCount}/${checklistCount} onboarding done`}</Badge>
          {canUseAI ? (
            <Badge variant="outline">
              {assistantConversationCount > 0
                ? `${assistantConversationCount} AI conversation${assistantConversationCount === 1 ? "" : "s"}`
                : "AI ready"}
            </Badge>
          ) : null}
        </div>

        <Separator />

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">Members</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-semibold">
              <Users className="size-5 text-primary" />
              {memberCount}
            </p>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">Tasks this month</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-semibold">
              <ListTodo className="size-5 text-primary" />
              {tasksUsage}
            </p>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">AI credits used</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-semibold">
              <Sparkles className="size-5 text-primary" />
              {aiCreditsUsage}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
