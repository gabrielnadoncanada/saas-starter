"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

type ToastKind = "error" | "success" | "info" | "warning";

type UseToastMessageOptions = {
  kind?: ToastKind;
  skip?: boolean;
  trigger?: unknown;
};

const TOAST_HANDLERS = {
  error: toast.error,
  success: toast.success,
  info: toast.info,
  warning: toast.warning,
} as const;

export function useToastMessage(
  message: string | null | undefined,
  options: UseToastMessageOptions = {},
) {
  const { kind = "info", skip = false, trigger } = options;
  const previousMessageRef = useRef<string | null | undefined>(null);
  const previousTriggerRef = useRef<unknown>(undefined);

  useEffect(() => {
    if (skip || !message) {
      previousMessageRef.current = message;
      previousTriggerRef.current = trigger;
      return;
    }

    const triggerChanged = !Object.is(previousTriggerRef.current, trigger);
    const messageChanged = previousMessageRef.current !== message;

    if (triggerChanged || messageChanged) {
      TOAST_HANDLERS[kind](message);
      previousMessageRef.current = message;
      previousTriggerRef.current = trigger;
    }
  }, [kind, message, skip, trigger]);
}
