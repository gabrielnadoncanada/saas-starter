import {
  Circle,
  CheckCircle,
  Timer,
  HelpCircle,
  CircleOff,
} from "lucide-react";

export const statuses = [
  {
    label: "Backlog",
    value: "BACKLOG" as const,
    icon: HelpCircle,
  },
  {
    label: "Todo",
    value: "TODO" as const,
    icon: Circle,
  },
  {
    label: "In Progress",
    value: "IN_PROGRESS" as const,
    icon: Timer,
  },
  {
    label: "Done",
    value: "DONE" as const,
    icon: CheckCircle,
  },
  {
    label: "Canceled",
    value: "CANCELED" as const,
    icon: CircleOff,
  },
];
