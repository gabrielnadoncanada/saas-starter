"use client";

import type { ChatStatus } from "ai";
import {
  CornerDownLeftIcon,
  ImageIcon,
  Monitor,
  PlusIcon,
  SquareIcon,
  XIcon,
} from "lucide-react";
import type { FormEvent, HTMLAttributes, KeyboardEventHandler } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/shared/components/ui/input-group";
import { Spinner } from "@/shared/components/ui/spinner";
import { cn } from "@/shared/lib/utils";

import {
  filesToAttachments,
  PromptInputProvider,
  usePromptInputState,
} from "./prompt-input-state";

export { PromptInputProvider };
export type { PromptAttachment } from "./prompt-input-state";

export interface PromptInputMessage {
  files: ReturnType<typeof filesToAttachments>;
  text: string;
}

type PromptInputProps = Omit<HTMLAttributes<HTMLFormElement>, "onSubmit"> & {
  globalDrop?: boolean;
  multiple?: boolean;
  onSubmit: (
    message: PromptInputMessage,
    event: FormEvent<HTMLFormElement>,
  ) => void | Promise<void>;
};

export function PromptInput({
  className,
  children,
  globalDrop,
  multiple,
  onSubmit,
  ...props
}: PromptInputProps) {
  const state = usePromptInputState();

  return (
    <form
      className={cn("w-full", className)}
      onDragOver={(event) => {
        if (globalDrop || event.dataTransfer.types.includes("Files")) {
          event.preventDefault();
        }
      }}
      onDrop={(event) => {
        if (event.dataTransfer.files.length === 0) {
          return;
        }
        event.preventDefault();
        state.addAttachments(filesToAttachments(event.dataTransfer.files));
      }}
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit(
          { files: state.attachments, text: state.text.trim() },
          event,
        );
        state.clearAttachments();
        state.setInput("");
      }}
      {...props}
    >
      <input
        className="hidden"
        multiple={multiple}
        onChange={(event) => {
          const files = event.currentTarget.files;
          if (!files?.length) {
            return;
          }
          state.addAttachments(filesToAttachments(files));
          event.currentTarget.value = "";
        }}
        ref={(node) => {
          state.setFileInputRef(node);
        }}
        type="file"
      />
      <InputGroup className="overflow-hidden">{children}</InputGroup>
    </form>
  );
}

export const usePromptInputAttachments = () => {
  const state = usePromptInputState();
  return {
    files: state.attachments,
    openFileDialog: state.openFileDialog,
    remove: state.removeAttachment,
  };
};

export const PromptInputBody = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("contents", className)} {...props} />
);

export const PromptInputFooter = ({
  className,
  ...props
}: Omit<React.ComponentProps<typeof InputGroupAddon>, "align">) => (
  <InputGroupAddon
    align="block-end"
    className={cn("justify-between gap-1", className)}
    {...props}
  />
);

export const PromptInputTools = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex min-w-0 items-center gap-1", className)}
    {...props}
  />
);

export function PromptInputTextarea({
  className,
  onChange,
  onKeyDown,
  placeholder = "What would you like to know?",
  ...props
}: React.ComponentProps<typeof InputGroupTextarea>) {
  const state = usePromptInputState();
  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    onKeyDown?.(event);
    if (
      !event.defaultPrevented &&
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <InputGroupTextarea
      className={cn("field-sizing-content max-h-48 min-h-16", className)}
      name="message"
      onChange={(event) => {
        state.setInput(event.currentTarget.value);
        onChange?.(event);
      }}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      value={state.text}
      {...props}
    />
  );
}

export function PromptInputButton({
  className,
  size,
  variant = "ghost",
  ...props
}: React.ComponentProps<typeof InputGroupButton>) {
  return (
    <InputGroupButton
      className={cn(className)}
      size={size ?? "icon-sm"}
      variant={variant}
      {...props}
    />
  );
}

export const PromptInputActionMenu = (
  props: React.ComponentProps<typeof DropdownMenu>,
) => <DropdownMenu {...props} />;
export const PromptInputActionMenuTrigger = (
  props: React.ComponentProps<typeof InputGroupButton>,
) => (
  <DropdownMenuTrigger asChild>
    <PromptInputButton {...props}>
      {props.children ?? <PlusIcon className="size-4" />}
    </PromptInputButton>
  </DropdownMenuTrigger>
);
export const PromptInputActionMenuContent = (
  props: React.ComponentProps<typeof DropdownMenuContent>,
) => <DropdownMenuContent align="start" {...props} />;
export const PromptInputActionAddAttachments = ({
  label = "Add files",
}: {
  label?: string;
}) => {
  const state = usePromptInputState();
  return (
    <DropdownMenuItem
      onSelect={(event) => {
        event.preventDefault();
        state.openFileDialog();
      }}
    >
      <ImageIcon className="mr-2 size-4" />
      {label}
    </DropdownMenuItem>
  );
};
export const PromptInputActionAddScreenshot = ({
  label = "Take screenshot",
}: {
  label?: string;
}) => (
  <DropdownMenuItem disabled>
    <Monitor className="mr-2 size-4" />
    {label}
  </DropdownMenuItem>
);

export function PromptInputSubmit({
  className,
  status,
  onStop,
  ...props
}: React.ComponentProps<typeof InputGroupButton> & {
  onStop?: () => void;
  status?: ChatStatus;
}) {
  const isGenerating = status === "submitted" || status === "streaming";
  const icon =
    status === "submitted" ? (
      <Spinner />
    ) : status === "streaming" ? (
      <SquareIcon className="size-4" />
    ) : status === "error" ? (
      <XIcon className="size-4" />
    ) : (
      <CornerDownLeftIcon className="size-4" />
    );

  return (
    <InputGroupButton
      aria-label={isGenerating ? "Stop" : "Submit"}
      className={cn(className)}
      onClick={(event) => {
        if (isGenerating && onStop) {
          event.preventDefault();
          onStop();
        }
      }}
      size="icon-sm"
      type={isGenerating && onStop ? "button" : "submit"}
      {...props}
    >
      {icon}
    </InputGroupButton>
  );
}
