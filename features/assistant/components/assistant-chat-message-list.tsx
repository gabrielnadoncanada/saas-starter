"use client";

import type { UIMessage } from "ai";

import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { AssistantChatEmptyState } from "@/features/assistant/components/assistant-chat-empty-state";
import { AssistantToolResult } from "@/features/assistant/components/assistant-tool-result";
import { AssistantChartArtifact } from "@/features/assistant/components/chart-artifact";
import type { GenerateChartToolResult } from "@/features/assistant/types";
import {
  getToolName,
  isToolPart,
} from "@/features/assistant/utils/message-parts";

function getChartArtifact(part: UIMessage["parts"][number]) {
  if (!isToolPart(part) || !("output" in part)) {
    return null;
  }

  if (getToolName(part) !== "generateChart") {
    return null;
  }

  const output = part.output as GenerateChartToolResult | undefined;
  if (!output?.success) {
    return null;
  }

  return output.chart;
}

function renderInlinePart(
  messageId: string,
  part: UIMessage["parts"][number],
  index: number,
) {
  if (part.type === "text" && part.text) {
    return (
      <MessageResponse key={`${messageId}-${index}`}>
        {part.text}
      </MessageResponse>
    );
  }

  if (isToolPart(part)) {
    return <AssistantToolResult key={`${messageId}-${index}`} part={part} />;
  }

  return null;
}

export function AssistantChatMessageList({
  error,
  isLoading,
  messages,
  onPromptClick,
}: {
  error: Error | undefined;
  isLoading: boolean;
  messages: UIMessage[];
  onPromptClick: (text: string) => void;
}) {
  if (messages.length === 0 && !error) {
    return <AssistantChatEmptyState onPromptClick={onPromptClick} />;
  }

  return (
    <>
      {messages.map((message) => {
        const artifactParts = message.parts
          .map((part, index) => ({
            chart: getChartArtifact(part),
            key: `${message.id}-artifact-${index}`,
          }))
          .filter((item) => item.chart !== null);
        const inlineParts = message.parts
          .map((part, index) => renderInlinePart(message.id, part, index))
          .filter(Boolean);

        return (
          <Message from={message.role} key={message.id}>
            {inlineParts.length > 0 ? (
              <MessageContent>{inlineParts}</MessageContent>
            ) : null}
            {artifactParts.map((item) =>
              item.chart ? (
                <AssistantChartArtifact chart={item.chart} key={item.key} />
              ) : null,
            )}
          </Message>
        );
      })}

      {isLoading && messages[messages.length - 1]?.role !== "assistant" ? (
        <Message from="assistant">
          <MessageContent>
            <MessageResponse>Working...</MessageResponse>
          </MessageContent>
        </Message>
      ) : null}
    </>
  );
}
