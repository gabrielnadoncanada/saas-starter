"use client";

import { CircleAlertIcon, UserIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  type FileWithPreview,
  formatBytes,
  useFileUpload,
} from "@/hooks/use-file-upload";
import { cn } from "@/lib/utils";
interface AvatarUploadProps {
  maxSize?: number;
  className?: string;
  inputName?: string;
  onFileChange?: (file: FileWithPreview | null) => void;
  /** Shown when the user already has a saved avatar (URL). */
  defaultAvatar?: string;
  /** Called when the user removes the existing saved avatar (no new file selected yet). */
  onExistingAvatarClear?: () => void;
}

export function CFileUpload({
  maxSize = 2 * 1024 * 1024, // 2MB
  className,
  inputName,
  onFileChange,
  defaultAvatar,
  onExistingAvatarClear,
}: AvatarUploadProps) {
  const [clearedDefaultAvatar, setClearedDefaultAvatar] = useState(false);

  const [
    { files, isDragging, errors },
    {
      removeFile,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ] = useFileUpload({
    maxFiles: 1,
    maxSize,
    accept: "image/png,image/jpeg,image/webp",
    multiple: false,
  });

  const currentFile = files[0];
  const previewUrl =
    currentFile?.preview || (clearedDefaultAvatar ? undefined : defaultAvatar);

  useEffect(() => {
    setClearedDefaultAvatar(false);
  }, [defaultAvatar]);

  useEffect(() => {
    onFileChange?.(currentFile ?? null);
  }, [currentFile, onFileChange]);

  const showRemove =
    Boolean(currentFile) || (Boolean(defaultAvatar) && !clearedDefaultAvatar);

  const handleRemove = () => {
    if (currentFile) {
      removeFile(currentFile.id);
      return;
    }
    if (defaultAvatar) {
      setClearedDefaultAvatar(true);
      onExistingAvatarClear?.();
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Avatar Preview */}
      <div className="relative">
        <div
          className={cn(
            "group/avatar relative h-24 w-24 cursor-pointer overflow-hidden rounded-full border border-dashed transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/20",
            previewUrl && "border-solid",
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input {...getInputProps({ name: inputName })} className="sr-only" />

          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <UserIcon className="text-muted-foreground size-6" />
            </div>
          )}
        </div>

        {showRemove && (
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleRemove();
            }}
            className="absolute end-0.5 top-0.5 z-10 size-6 rounded-full dark:bg-zinc-800 hover:dark:bg-zinc-700"
            aria-label="Remove avatar"
          >
            <XIcon className="size-3.5" />
          </Button>
        )}
      </div>

      {/* Upload Instructions */}
      <div className="space-y-0.5 text-left">
        <p className="text-sm font-medium">
          {currentFile
            ? "Avatar uploaded"
            : previewUrl
              ? "Profile image"
              : "Upload avatar"}
        </p>
        <p className="text-muted-foreground text-xs">
          PNG, JPG, or WebP up to {formatBytes(maxSize)}
        </p>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert variant="destructive" className="mt-5">
          <CircleAlertIcon />
          <AlertTitle>File upload error(s)</AlertTitle>
          <AlertDescription>
            {errors.map((error, index) => (
              <p key={index} className="last:mb-0">
                {error}
              </p>
            ))}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
