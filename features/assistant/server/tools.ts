import "server-only";

import { tool } from "ai";
import { z } from "zod";

import type {
  AssistantToolFailure,
  ChartSpec,
  CreateTaskToolResult,
  GenerateChartToolResult,
  GetTasksToolResult,
  UpdateTaskToolResult,
} from "@/features/assistant/types";
import {
  LimitReachedError,
  UpgradeRequiredError,
} from "@/features/billing/entitlements";
import { requireActiveOrganizationMembership } from "@/features/organizations/server/organizations";
import {
  createTask,
  updateTask,
} from "@/features/tasks/server/task-mutations";
import {
  createTaskSchema,
  type CreateTaskValues,
} from "@/features/tasks/task.schema";
import { TaskLabel, TaskPriority, TaskStatus } from "@/lib/db/enums";
import { db } from "@/lib/db/prisma";

function toAssistantToolFailure(error: unknown): AssistantToolFailure {
  if (error instanceof UpgradeRequiredError) {
    return {
      success: false,
      error: { code: "UPGRADE_REQUIRED", message: error.message },
    };
  }
  if (error instanceof LimitReachedError) {
    return {
      success: false,
      error: { code: "LIMIT_REACHED", message: error.message },
    };
  }
  return {
    success: false,
    error: {
      code: "UNKNOWN",
      message: error instanceof Error ? error.message : "Something went wrong",
    },
  };
}

const chartSeriesSchema = z.object({
  dataKey: z.string().describe("Key in each data row for this series' values"),
  label: z.string().describe("Human-readable label for this series"),
  color: z
    .string()
    .optional()
    .describe("CSS color (hex, hsl, oklch). Omit for auto-assigned palette"),
});

const generateChartSchema = z.object({
  type: z
    .enum(["bar", "line", "area", "pie", "radar"])
    .describe("Chart type"),
  title: z.string().describe("Chart title displayed above the chart"),
  description: z
    .string()
    .optional()
    .describe("Short subtitle or context for the chart"),
  xAxisKey: z
    .string()
    .describe(
      "Key in each data row used for x-axis labels (or pie slice names)",
    ),
  series: z
    .array(chartSeriesSchema)
    .min(1)
    .describe("One or more data series to plot"),
  data: z
    .array(z.record(z.union([z.string(), z.number()])))
    .min(1)
    .describe("Array of data rows. Each row is an object with keys matching xAxisKey and series dataKeys. Add an optional 'color' key (hex string) per row to color individual bars or pie slices differently"),
});

export const assistantTools = {
  createTask: tool({
    description:
      "Create a task in the task management system. Use this when the user asks to create a task, add a to-do, or track follow-ups.",
    inputSchema: createTaskSchema,
    execute: async (input: CreateTaskValues): Promise<CreateTaskToolResult> => {
      try {
        const task = await createTask(input);

        return {
          success: true,
          result: {
            taskCode: task.code,
            title: task.title,
            status: task.status,
          },
        };
      } catch (error) {
        return toAssistantToolFailure(error);
      }
    },
  }),

  generateChart: tool({
    description:
      "Generate an interactive chart artifact. Use this when the user asks for a graph, chart, report, visualization, or data summary. Supports bar, line, area, pie, and radar charts. Provide the data inline — do not reference external sources.",
    inputSchema: generateChartSchema,
    execute: async (input: ChartSpec): Promise<GenerateChartToolResult> => {
      return { success: true, chart: input };
    },
  }),

  getTasks: tool({
    description:
      "Query tasks from the task management system. Use this when the user asks to list, find, search, or summarize tasks. Supports filtering by status, priority, label, and text search. Returns up to 50 tasks.",
    inputSchema: z.object({
      q: z.string().optional().describe("Search text to match against task title or code"),
      status: z
        .array(z.nativeEnum(TaskStatus))
        .optional()
        .describe("Filter by status: BACKLOG, TODO, IN_PROGRESS, DONE, CANCELED"),
      priority: z
        .array(z.nativeEnum(TaskPriority))
        .optional()
        .describe("Filter by priority: LOW, MEDIUM, HIGH"),
      label: z
        .array(z.nativeEnum(TaskLabel))
        .optional()
        .describe("Filter by label: BUG, FEATURE, DOCUMENTATION"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(50)
        .optional()
        .describe("Max number of tasks to return (default 20)"),
    }),
    execute: async (input): Promise<GetTasksToolResult> => {
      try {
        const membership = await requireActiveOrganizationMembership();
        const organizationId = membership.organizationId;
        const limit = input.limit ?? 20;

        const where: Record<string, unknown> = { organizationId };

        if (input.q) {
          where.OR = [
            { code: { contains: input.q, mode: "insensitive" } },
            { title: { contains: input.q, mode: "insensitive" } },
          ];
        }
        if (input.status?.length) {
          where.status = { in: input.status };
        }
        if (input.priority?.length) {
          where.priority = { in: input.priority };
        }
        if (input.label?.length) {
          where.label = { in: input.label };
        }

        const [tasks, totalCount] = await Promise.all([
          db.task.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: limit,
            select: {
              code: true,
              title: true,
              status: true,
              priority: true,
              label: true,
              description: true,
            },
          }),
          db.task.count({ where }),
        ]);

        return { success: true, tasks, totalCount };
      } catch (error) {
        return toAssistantToolFailure(error);
      }
    },
  }),

  updateTask: tool({
    description:
      "Update an existing task. Use this when the user asks to change a task's status, priority, label, title, or description. Identify the task by its code (e.g. TASK-42).",
    inputSchema: z.object({
      code: z.string().describe("Task code, e.g. TASK-42"),
      title: z.string().optional().describe("New title"),
      description: z.string().optional().describe("New description"),
      status: z
        .nativeEnum(TaskStatus)
        .optional()
        .describe("New status: BACKLOG, TODO, IN_PROGRESS, DONE, CANCELED"),
      priority: z
        .nativeEnum(TaskPriority)
        .optional()
        .describe("New priority: LOW, MEDIUM, HIGH"),
      label: z
        .nativeEnum(TaskLabel)
        .optional()
        .describe("New label: BUG, FEATURE, DOCUMENTATION"),
    }),
    execute: async (input): Promise<UpdateTaskToolResult> => {
      try {
        const membership = await requireActiveOrganizationMembership();
        const organizationId = membership.organizationId;

        const task = await db.task.findFirst({
          where: { code: input.code, organizationId },
        });

        if (!task) {
          return toAssistantToolFailure(new Error(`Task ${input.code} not found`));
        }

        await updateTask({
          taskId: task.id,
          title: input.title ?? task.title,
          description: input.description ?? task.description ?? undefined,
          status: input.status ?? task.status,
          priority: input.priority ?? task.priority,
          label: input.label ?? task.label,
        });

        return {
          success: true,
          result: {
            code: task.code,
            title: input.title ?? task.title,
            status: input.status ?? task.status,
            priority: input.priority ?? task.priority,
            label: input.label ?? task.label,
          },
        };
      } catch (error) {
        return toAssistantToolFailure(error);
      }
    },
  }),
};
