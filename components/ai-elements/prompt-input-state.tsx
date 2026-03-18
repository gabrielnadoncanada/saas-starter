"use client";

import type { FileUIPart } from "ai";
import { nanoid } from "nanoid";
import type { PropsWithChildren, RefObject } from "react";
import { createContext, useContext, useMemo, useRef, useState } from "react";

export type PromptAttachment = FileUIPart & { id: string };

type PromptInputState = {
  addAttachments: (files: PromptAttachment[]) => void;
  attachments: PromptAttachment[];
  clearAttachments: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  openFileDialog: () => void;
  removeAttachment: (id: string) => void;
  setFileInputRef: (node: HTMLInputElement | null) => void;
  setInput: (value: string) => void;
  text: string;
};

const PromptInputContext = createContext<PromptInputState | null>(null);

export function PromptInputProvider({
  children,
}: PropsWithChildren) {
  const [attachments, setAttachments] = useState<PromptAttachment[]>([]);
  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const value = useMemo<PromptInputState>(
    () => ({
      addAttachments: (files) =>
        setAttachments((current) => [...current, ...files]),
      attachments,
      clearAttachments: () => {
        setAttachments((current) => {
          current.forEach((file) => URL.revokeObjectURL(file.url));
          return [];
        });
      },
      fileInputRef,
      openFileDialog: () => fileInputRef.current?.click(),
      removeAttachment: (id: string) =>
        setAttachments((current) => {
          const found = current.find((file) => file.id === id);
          if (found) {
            URL.revokeObjectURL(found.url);
          }
          return current.filter((file) => file.id !== id);
        }),
      setFileInputRef: (node) => {
        fileInputRef.current = node;
      },
      setInput: setText,
      text,
    }),
    [attachments, text]
  );

  return (
    <PromptInputContext.Provider value={value}>
      {children}
    </PromptInputContext.Provider>
  );
}

export function usePromptInputState() {
  const context = useContext(PromptInputContext);
  if (!context) {
    throw new Error("PromptInput components must be used inside PromptInputProvider.");
  }

  return context;
}

export function filesToAttachments(files: FileList | File[]) {
  return [...files].map(
    (file): PromptAttachment => ({
      filename: file.name,
      id: nanoid(),
      mediaType: file.type,
      type: "file",
      url: URL.createObjectURL(file),
    })
  );
}
