"use client";

import { Plus } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

type TasksPrimaryButtonsProps = {
  onCreateClick: () => void;
};

export function TasksPrimaryButtons({ onCreateClick }: TasksPrimaryButtonsProps) {
  return (
    <Button className='space-x-1' onClick={onCreateClick}>
      <span>Create</span>
      <Plus size={18} />
    </Button>
  );
}
