import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";

export const priorities = [
  {
    label: "Low",
    value: "LOW" as const,
    icon: ArrowDown,
  },
  {
    label: "Medium",
    value: "MEDIUM" as const,
    icon: ArrowRight,
  },
  {
    label: "High",
    value: "HIGH" as const,
    icon: ArrowUp,
  },
];
