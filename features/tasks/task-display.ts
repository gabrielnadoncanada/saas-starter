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

import { TaskLabel, TaskPriority, TaskStatus } from "@/shared/lib/db/enums";

export const taskLabels: { value: TaskLabel; label: string }[] = [
  { value: TaskLabel.BUG, label: "Bug" },
  { value: TaskLabel.FEATURE, label: "Feature" },
  { value: TaskLabel.DOCUMENTATION, label: "Documentation" },
];

export const taskPriorities: {
  value: TaskPriority;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: TaskPriority.LOW, label: "Low", icon: ArrowDown },
  { value: TaskPriority.MEDIUM, label: "Medium", icon: ArrowRight },
  { value: TaskPriority.HIGH, label: "High", icon: ArrowUp },
];

export const taskStatuses: {
  value: TaskStatus;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: TaskStatus.BACKLOG, label: "Backlog", icon: HelpCircle },
  { value: TaskStatus.TODO, label: "Todo", icon: Circle },
  { value: TaskStatus.IN_PROGRESS, label: "In Progress", icon: Timer },
  { value: TaskStatus.DONE, label: "Done", icon: CheckCircle },
  { value: TaskStatus.CANCELED, label: "Canceled", icon: CircleOff },
];
