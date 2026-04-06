import "server-only";

import { tool } from "ai";

import type { CreateTaskToolResult } from "@/features/assistant/types";
import { createTask } from "@/features/tasks/server/task-mutations";
import {
  createTaskSchema,
  type CreateTaskValues,
} from "@/features/tasks/task-form.schema";

import { toAssistantToolFailure } from "./tool-result";

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
};
