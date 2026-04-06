import type { LucideIcon } from "lucide-react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle,
  Circle,
  CircleOff,
  HelpCircle,
  Timer,
} from "lucide-react";

import {
  TaskLabel,
  TaskPriority,
  TaskStatus,
} from "@/shared/lib/db/enums";

const TASK_LABEL_ORDER = [
  TaskLabel.BUG,
  TaskLabel.FEATURE,
  TaskLabel.DOCUMENTATION,
] as const satisfies readonly TaskLabel[];

const TASK_LABEL_META: Record<TaskLabel, { label: string }> = {
  [TaskLabel.BUG]: { label: "Bug" },
  [TaskLabel.FEATURE]: { label: "Feature" },
  [TaskLabel.DOCUMENTATION]: { label: "Documentation" },
};

export const taskLabels = TASK_LABEL_ORDER.map((value) => ({
  value,
  label: TASK_LABEL_META[value].label,
}));

const TASK_PRIORITY_ORDER = [
  TaskPriority.LOW,
  TaskPriority.MEDIUM,
  TaskPriority.HIGH,
] as const satisfies readonly TaskPriority[];

const TASK_PRIORITY_META: Record<
  TaskPriority,
  { label: string; icon: LucideIcon }
> = {
  [TaskPriority.LOW]: { label: "Low", icon: ArrowDown },
  [TaskPriority.MEDIUM]: { label: "Medium", icon: ArrowRight },
  [TaskPriority.HIGH]: { label: "High", icon: ArrowUp },
};

export const taskPriorities = TASK_PRIORITY_ORDER.map((value) => ({
  value,
  label: TASK_PRIORITY_META[value].label,
  icon: TASK_PRIORITY_META[value].icon,
}));

const TASK_STATUS_ORDER = [
  TaskStatus.BACKLOG,
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.DONE,
  TaskStatus.CANCELED,
] as const satisfies readonly TaskStatus[];

const TASK_STATUS_META: Record<TaskStatus, { label: string; icon: LucideIcon }> =
  {
    [TaskStatus.BACKLOG]: { label: "Backlog", icon: HelpCircle },
    [TaskStatus.TODO]: { label: "Todo", icon: Circle },
    [TaskStatus.IN_PROGRESS]: { label: "In Progress", icon: Timer },
    [TaskStatus.DONE]: { label: "Done", icon: CheckCircle },
    [TaskStatus.CANCELED]: { label: "Canceled", icon: CircleOff },
  };

export const taskStatuses = TASK_STATUS_ORDER.map((value) => ({
  value,
  label: TASK_STATUS_META[value].label,
  icon: TASK_STATUS_META[value].icon,
}));
