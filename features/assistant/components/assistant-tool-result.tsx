"use client";

import type {
  AssistantToolFailure,
  CreateTaskToolResult,
} from "@/features/assistant/types";
import { MessageResponse } from "@/shared/components/ai-elements/message";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolOutput,
} from "@/shared/components/ai-elements/tool";

type AssistantToolResultProps = {
  toolName: string;
  done: boolean;
  output?: unknown;
};

const toolTitles: Record<string, string> = {
  createTask: "Create task",
};

function getToolState(done: boolean, failed: boolean) {
  if (!done) {
    return "input-available" as const;
  }

  return failed ? "output-error" : "output-available";
}

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

  return {
    errorText: isFailureResult(output) ? output.error.message : undefined,
    response:
      typeof output === "string" ? output : JSON.stringify(output, null, 2),
  };
}

export function AssistantToolResult({
  toolName,
  done,
  output,
}: AssistantToolResultProps) {
  const { errorText, response } = getToolContent(toolName, output);
  const state = getToolState(done, Boolean(errorText));
  const renderedResponse =
    typeof response === "string" ? (
      <MessageResponse>{response}</MessageResponse>
    ) : (
      response
    );

  return (
    <div className="space-y-3">
      <Tool className="mb-0" defaultOpen={done}>
        <ToolHeader
          state={state}
          title={toolTitles[toolName] ?? toolName}
          type={`tool-${toolName}`}
        />
        {(response || errorText) && (
          <ToolContent>
            <ToolOutput errorText={errorText} output={renderedResponse} />
          </ToolContent>
        )}
      </Tool>
    </div>
  );
}
