"use client";

import { AssistantInvoiceArtifact } from "@/features/assistant/components/assistant-invoice-artifact";
import { MessageResponse } from "@/shared/components/ai-elements/message";
import { Tool, ToolContent, ToolHeader, ToolOutput } from "@/shared/components/ai-elements/tool";
import type {
  AssistantToolFailure,
  CreateInvoiceDraftToolResult,
  CreateTaskToolResult,
  ReviewInboxToolResult,
} from "@/features/assistant/types";

type AssistantToolResultProps = {
  toolName: string;
  done: boolean;
  output?: unknown;
};

const toolTitles: Record<string, string> = {
  createInvoiceDraft: "Create invoice draft",
  createTask: "Create task",
  reviewInbox: "Review inbox",
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

function formatReviewInbox(result: ReviewInboxToolResult) {
  if (!result.success) {
    return null;
  }

  const emails = result.result.messages
    .map((email) => `- **${email.subject}** from ${email.from}`)
    .join("\n");

  return `Found **${result.result.count}** emails from **${result.result.provider}**.\n\n${emails}`;
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

  if (toolName === "reviewInbox") {
    const result = output as ReviewInboxToolResult;
    return {
      errorText: result.success ? undefined : result.error.message,
      response: formatReviewInbox(result),
    };
  }

  if (toolName === "createTask") {
    const result = output as CreateTaskToolResult;
    return {
      errorText: result.success ? undefined : result.error.message,
      response: formatTask(result),
    };
  }

  if (toolName === "createInvoiceDraft") {
    const result = output as CreateInvoiceDraftToolResult;
    return {
      errorText: result.success ? undefined : result.error.message,
      response: result.success ? (
        <AssistantInvoiceArtifact invoice={result.result} />
      ) : undefined,
    };
  }

  return {
    errorText: isFailureResult(output) ? output.error.message : undefined,
    response: typeof output === "string" ? output : JSON.stringify(output, null, 2),
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
    typeof response === "string"
      ? <MessageResponse>{response}</MessageResponse>
      : response;
  const isStandaloneInvoiceArtifact =
    toolName === "createInvoiceDraft" && !errorText && renderedResponse;

  return (
    <div className="space-y-3">
      <Tool className="mb-0" defaultOpen={done && !isStandaloneInvoiceArtifact}>
        <ToolHeader
          state={state}
          title={toolTitles[toolName] ?? toolName}
          type={`tool-${toolName}`}
        />
        {!isStandaloneInvoiceArtifact && (response || errorText) && (
          <ToolContent>
            <ToolOutput
              errorText={errorText}
              output={renderedResponse}
            />
          </ToolContent>
        )}
      </Tool>
      {isStandaloneInvoiceArtifact ? renderedResponse : null}
    </div>
  );
}
