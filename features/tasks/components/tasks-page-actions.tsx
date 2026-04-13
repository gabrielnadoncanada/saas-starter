"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { TaskFormSheet } from "@/features/tasks/components/task-form-sheet";

export function TasksPageActions() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button className="space-x-1" onClick={() => setOpen(true)}>
        <span>Create</span>
        <Plus size={18} />
      </Button>

      <TaskFormSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
