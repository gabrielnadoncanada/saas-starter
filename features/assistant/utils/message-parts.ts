import type { UIMessage } from "ai";

import type { ToolPart } from "@/components/ai-elements/tool";

export function isToolPart(part: UIMessage["parts"][number]): part is ToolPart {
  return part.type === "dynamic-tool" || part.type.startsWith("tool-");
}

export function getToolName(part: ToolPart) {
  return part.type === "dynamic-tool"
    ? part.toolName
    : part.type.replace("tool-", "");
}
