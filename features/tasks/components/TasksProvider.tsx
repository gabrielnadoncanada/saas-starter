"use client";

import React, { useState } from 'react';

import type { Task } from '../types/task.types';

type TasksDialogType = 'create' | 'update' | 'delete';

type TasksContextType = {
  currentTask: Task | null;
  dialog: TasksDialogType | null;
  closeDialog: () => void;
  openCreateDialog: () => void;
  openDeleteDialog: (task: Task) => void;
  openUpdateDialog: (task: Task) => void;
};

const TasksContext = React.createContext<TasksContextType | null>(null);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<TasksDialogType | null>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  const closeDialog = () => {
    setDialog(null);
    setCurrentTask(null);
  };

  const openCreateDialog = () => {
    setCurrentTask(null);
    setDialog('create');
  };

  const openUpdateDialog = (task: Task) => {
    setCurrentTask(task);
    setDialog('update');
  };

  const openDeleteDialog = (task: Task) => {
    setCurrentTask(task);
    setDialog('delete');
  };

  return (
    <TasksContext.Provider
      value={{
        currentTask,
        dialog,
        closeDialog,
        openCreateDialog,
        openDeleteDialog,
        openUpdateDialog,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const tasksContext = React.useContext(TasksContext);

  if (!tasksContext) {
    throw new Error('useTasks must be used within <TasksProvider>.');
  }

  return tasksContext;
}
