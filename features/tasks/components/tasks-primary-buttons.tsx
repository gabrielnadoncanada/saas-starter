"use client";

import { Plus } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

import { useTasks } from '@/features/tasks/state/tasks-provider';

export function TasksPrimaryButtons() {
  const { openCreateDialog } = useTasks();

  return (
    <Button className='space-x-1' onClick={openCreateDialog}>
      <span>Create</span>
      <Plus size={18} />
    </Button>
  );
}
