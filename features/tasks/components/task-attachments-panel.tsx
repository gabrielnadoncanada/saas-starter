"use client";

import { Download, Loader2, Paperclip, Trash2 } from "lucide-react";
import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";

type TaskAttachment = {
  id: string;
  createdAt: string;
  storedFile: {
    id: string;
    fileName: string;
    contentType: string;
    sizeBytes: number;
    createdAt: string;
  };
};

type TaskAttachmentsPanelProps = {
  taskId: number;
};

const acceptedFileTypes = [
  ".csv",
  ".gif",
  ".jpeg",
  ".jpg",
  ".json",
  ".md",
  ".pdf",
  ".png",
  ".pptx",
  ".txt",
  ".webp",
  ".xlsx",
  ".zip",
  ".docx",
].join(",");

function formatBytes(sizeBytes: number) {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  const units = ["KB", "MB", "GB"];
  let value = sizeBytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

export function TaskAttachmentsPanel({
  taskId,
}: TaskAttachmentsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadAttachments() {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/tasks/${taskId}/attachments`, {
        cache: "no-store",
      });
      const result = (await response.json()) as {
        attachments?: TaskAttachment[];
        error?: string;
      };

      if (!response.ok || !result.attachments) {
        throw new Error(result.error ?? "Unable to load attachments.");
      }

      setAttachments(result.attachments);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load attachments.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadAttachments();
  }, [taskId]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    setIsUploading(true);

    try {
      const response = await fetch(`/api/tasks/${taskId}/attachments`, {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to upload attachment.");
      }

      toast.success("Attachment uploaded.");
      await loadAttachments();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to upload attachment.",
      );
    } finally {
      event.target.value = "";
      setIsUploading(false);
    }
  }

  async function handleDeleteAttachment(attachmentId: string) {
    setDeletingId(attachmentId);

    try {
      const response = await fetch(`/api/tasks/attachments/${attachmentId}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to remove attachment.");
      }

      toast.success("Attachment removed.");
      await loadAttachments();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to remove attachment.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="font-medium text-sm">Attachments</h3>
          <p className="text-muted-foreground text-xs">
            Upload task files up to 10 MB. Storage usage counts against your plan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={acceptedFileTypes}
            onChange={(event) => void handleFileChange(event)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Paperclip className="mr-2 size-4" />
            )}
            Add file
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="size-4 animate-spin" />
          Loading attachments...
        </div>
      ) : attachments.length === 0 ? (
        <div className="rounded-md border border-dashed px-3 py-4 text-muted-foreground text-sm">
          No attachments yet.
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-sm">
                  {attachment.storedFile.fileName}
                </p>
                <p className="text-muted-foreground text-xs">
                  {formatBytes(attachment.storedFile.sizeBytes)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button asChild type="button" variant="ghost" size="icon">
                  <a href={`/api/files/${attachment.storedFile.id}`}>
                    <Download className="size-4" />
                    <span className="sr-only">Download attachment</span>
                  </a>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={deletingId === attachment.id}
                  onClick={() => void handleDeleteAttachment(attachment.id)}
                >
                  {deletingId === attachment.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                  <span className="sr-only">Delete attachment</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
