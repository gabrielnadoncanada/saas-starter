import type { TaskLabel, TaskPriority, TaskStatus } from "@/shared/lib/db/enums";

/** DB filter for ai conversations; single surface in this app. */
export const assistantConversationSurface = "assistant";

export type AssistantToolErrorCode =
  | "UPGRADE_REQUIRED"
  | "LIMIT_REACHED"
  | "UNKNOWN";

export type AssistantToolFailure = {
  success: false;
  error: {
    code: AssistantToolErrorCode;
    message: string;
  };
};

export type CreateTaskToolResult =
  | {
      success: true;
      result: {
        taskCode: string;
        title: string;
        status: TaskStatus;
      };
    }
  | AssistantToolFailure;

export type ChartType = "bar" | "line" | "area" | "pie" | "radar";

export type ChartSeries = {
  dataKey: string;
  label: string;
  color?: string;
};

export type ChartSpec = {
  type: ChartType;
  title: string;
  description?: string;
  xAxisKey: string;
  series: ChartSeries[];
  data: Record<string, string | number>[];
};

export type GenerateChartToolResult =
  | { success: true; chart: ChartSpec }
  | AssistantToolFailure;

export type TaskSummary = {
  code: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  label: TaskLabel;
  description: string | null;
};

export type GetTasksToolResult =
  | { success: true; tasks: TaskSummary[]; totalCount: number }
  | AssistantToolFailure;

export type UpdateTaskToolResult =
  | {
      success: true;
      result: {
        code: string;
        title: string;
        status: TaskStatus;
        priority: TaskPriority;
        label: TaskLabel;
      };
    }
  | AssistantToolFailure;
