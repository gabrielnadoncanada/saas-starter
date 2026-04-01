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

export const taskLabels = [
  {
    value: "BUG",
    label: "Bug",
  },
  {
    value: "FEATURE",
    label: "Feature",
  },
  {
    value: "DOCUMENTATION",
    label: "Documentation",
  },
] as const;

export const taskPriorities = [
  {
    value: "LOW",
    label: "Low",
    icon: ArrowDown,
  },
  {
    value: "MEDIUM",
    label: "Medium",
    icon: ArrowRight,
  },
  {
    value: "HIGH",
    label: "High",
    icon: ArrowUp,
  },
] as const;

export const taskStatuses = [
  {
    value: "BACKLOG",
    label: "Backlog",
    icon: HelpCircle,
  },
  {
    value: "TODO",
    label: "Todo",
    icon: Circle,
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
    icon: Timer,
  },
  {
    value: "DONE",
    label: "Done",
    icon: CheckCircle,
  },
  {
    value: "CANCELED",
    label: "Canceled",
    icon: CircleOff,
  },
] as const;