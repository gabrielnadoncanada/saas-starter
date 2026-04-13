"use client";

import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
  type ToolPart,
} from "@/components/ai-elements/tool";
import type { AssistantToolFailure } from "@/features/assistant/types";

type AssistantToolResultProps = {
  part: ToolPart;
};

function getToolName(part: ToolPart) {
  return part.type === "dynamic-tool" ? part.toolName : part.type.replace("tool-", "");
}

function getErrorText(output: unknown) {
  if (
    typeof output === "object" &&
    output !== null &&
    "success" in output &&
    output.success === false
  ) {
    return (output as AssistantToolFailure).error.message;
  }

  return undefined;
}

export function AssistantToolResult({ part }: AssistantToolResultProps) {
  const output = "output" in part ? part.output : undefined;
  const errorText = getErrorText(output);
  const state =
    part.state === "output-available" && errorText ? "output-error" : part.state;
  const header =
    part.type === "dynamic-tool" ? (
      <ToolHeader state={state} toolName={part.toolName} type={part.type} />
    ) : (
      <ToolHeader state={state} type={part.type} />
    );

  return (
    <Tool className="mb-0" defaultOpen={state === "output-available"}>
      {header}
      {"input" in part || output !== undefined || errorText ? (
        <ToolContent>
          {"input" in part ? <ToolInput input={part.input} /> : null}
          <ToolOutput errorText={errorText} output={errorText ? undefined : output} />
        </ToolContent>
      ) : null}
    </Tool>
  );
}
