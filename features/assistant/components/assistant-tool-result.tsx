"use client";

import { AssistantChartArtifact } from "@/features/assistant/components/artifacts/chart-artifact";
import type {
  AssistantToolFailure,
  CreateTaskToolResult,
  GenerateChartToolResult,
  GetTasksToolResult,
  UpdateTaskToolResult,
} from "@/features/assistant/types";
import { MessageResponse } from "@/shared/components/ai-elements/message";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
  type ToolPart,
} from "@/shared/components/ai-elements/tool";

type AssistantToolResultProps = {
  part: ToolPart;
};

const toolTitles: Record<string, string> = {
  createTask: "Create task",
  generateChart: "Generate chart",
  getTasks: "Query tasks",
  updateTask: "Update task",
};

function isFailureResult(result: unknown): result is AssistantToolFailure {
  return (
    typeof result === "object" &&
    result !== null &&
    "success" in result &&
    result.success === false
  );
}

function isCreateTaskToolResult(result: unknown): result is CreateTaskToolResult {
  if (typeof result !== "object" || result === null || !("success" in result)) {
    return false;
  }

  if ((result as { success: boolean }).success === false) {
    return isFailureResult(result);
  }

  const r = result as { success: true; result?: { taskCode?: unknown } };
  return (
    typeof r.result === "object" &&
    r.result !== null &&
    typeof r.result.taskCode === "string"
  );
}

function formatTask(result: CreateTaskToolResult) {
  if (!result.success) {
    return null;
  }

  return `Created task **${result.result.taskCode}**.\n\n${result.result.title}`;
}

function isGenerateChartToolResult(
  result: unknown,
): result is GenerateChartToolResult {
  if (typeof result !== "object" || result === null || !("success" in result)) {
    return false;
  }

  if ((result as { success: boolean }).success === false) {
    return isFailureResult(result);
  }

  const r = result as { success: true; chart?: { type?: unknown } };
  return (
    typeof r.chart === "object" &&
    r.chart !== null &&
    typeof r.chart.type === "string"
  );
}

function isGetTasksToolResult(
  result: unknown,
): result is GetTasksToolResult {
  if (typeof result !== "object" || result === null || !("success" in result)) {
    return false;
  }

  if ((result as { success: boolean }).success === false) {
    return isFailureResult(result);
  }

  return "tasks" in result && Array.isArray((result as { tasks: unknown }).tasks);
}

function formatGetTasks(result: GetTasksToolResult) {
  if (!result.success) {
    return null;
  }

  if (result.tasks.length === 0) {
    return "No tasks found matching the criteria.";
  }

  const header = `Found **${result.totalCount}** task${result.totalCount === 1 ? "" : "s"}${result.tasks.length < result.totalCount ? ` (showing ${result.tasks.length})` : ""}:\n\n`;
  const rows = result.tasks
    .map(
      (t) =>
        `- **${t.code}** — ${t.title} \`${t.status}\` \`${t.priority}\` \`${t.label}\``,
    )
    .join("\n");

  return header + rows;
}

function isUpdateTaskToolResult(
  result: unknown,
): result is UpdateTaskToolResult {
  if (typeof result !== "object" || result === null || !("success" in result)) {
    return false;
  }

  if ((result as { success: boolean }).success === false) {
    return isFailureResult(result);
  }

  const r = result as { success: true; result?: { code?: unknown } };
  return (
    typeof r.result === "object" &&
    r.result !== null &&
    typeof r.result.code === "string"
  );
}

function formatUpdateTask(result: UpdateTaskToolResult) {
  if (!result.success) {
    return null;
  }

  return `Updated **${result.result.code}** — ${result.result.title} \`${result.result.status}\` \`${result.result.priority}\` \`${result.result.label}\``;
}

function getToolContent(toolName: string, output?: unknown) {
  if (!output) {
    return { errorText: undefined, response: undefined };
  }

  if (toolName === "createTask" && isCreateTaskToolResult(output)) {
    return {
      errorText: output.success ? undefined : output.error.message,
      response: formatTask(output),
    };
  }

  if (toolName === "generateChart" && isGenerateChartToolResult(output)) {
    return {
      errorText: output.success ? undefined : output.error.message,
      response: output.success ? (
        <AssistantChartArtifact chart={output.chart} />
      ) : null,
    };
  }

  if (toolName === "getTasks" && isGetTasksToolResult(output)) {
    return {
      errorText: output.success ? undefined : output.error.message,
      response: formatGetTasks(output),
    };
  }

  if (toolName === "updateTask" && isUpdateTaskToolResult(output)) {
    return {
      errorText: output.success ? undefined : output.error.message,
      response: formatUpdateTask(output),
    };
  }

  return {
    errorText: isFailureResult(output) ? output.error.message : undefined,
    response:
      typeof output === "string" ? output : JSON.stringify(output, null, 2),
  };
}

function getToolName(part: ToolPart) {
  return part.type === "dynamic-tool" ? part.toolName : part.type.replace("tool-", "");
}

function getDisplayState(part: ToolPart, hasBusinessError: boolean) {
  if (part.state === "output-available" && hasBusinessError) {
    return "output-error" as const;
  }
  return part.state;
}

export function AssistantToolResult({ part }: AssistantToolResultProps) {
  const toolName = getToolName(part);
  const output = "output" in part ? part.output : undefined;
  const { errorText, response } = getToolContent(toolName, output);
  const state = getDisplayState(part, Boolean(errorText));
  const header =
    part.type === "dynamic-tool" ? (
      <ToolHeader
        state={state}
        title={toolTitles[toolName] ?? toolName}
        toolName={part.toolName}
        type={part.type}
      />
    ) : (
      <ToolHeader
        state={state}
        title={toolTitles[toolName] ?? toolName}
        type={part.type}
      />
    );

  // Chart artifacts render outside the collapsible for maximum visibility
  const isChartArtifact =
    toolName === "generateChart" &&
    state === "output-available" &&
    !errorText &&
    isGenerateChartToolResult(output) &&
    output.success;

  const renderedResponse =
    typeof response === "string" ? (
      <MessageResponse>{response}</MessageResponse>
    ) : (
      response
    );

  return (
    <div className="space-y-3">
      <Tool
        className="mb-0"
        defaultOpen={state === "output-available" && !isChartArtifact}
      >
        {header}
        {!isChartArtifact && ("input" in part || response || errorText) && (
          <ToolContent>
            {"input" in part ? <ToolInput input={part.input} /> : null}
            <ToolOutput errorText={errorText} output={renderedResponse} />
          </ToolContent>
        )}
      </Tool>
      {isChartArtifact && renderedResponse}
    </div>
  );
}
