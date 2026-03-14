"use client";

import React, { useEffect, useRef, useState } from 'react';

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
  const clearTaskTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (clearTaskTimeoutRef.current) {
        clearTimeout(clearTaskTimeoutRef.current);
      }
    };
  }, []);

  const closeDialog = () => {
    setDialog(null);

    if (clearTaskTimeoutRef.current) {
      clearTimeout(clearTaskTimeoutRef.current);
    }

    clearTaskTimeoutRef.current = setTimeout(() => {
      setCurrentTask(null);
      clearTaskTimeoutRef.current = null;
    }, 300);
  };

  const openCreateDialog = () => {
    if (clearTaskTimeoutRef.current) {
      clearTimeout(clearTaskTimeoutRef.current);
      clearTaskTimeoutRef.current = null;
    }

    setCurrentTask(null);
    setDialog('create');
  };

  const openUpdateDialog = (task: Task) => {
    if (clearTaskTimeoutRef.current) {
      clearTimeout(clearTaskTimeoutRef.current);
      clearTaskTimeoutRef.current = null;
    }

    setCurrentTask(task);
    setDialog('update');
  };

  const openDeleteDialog = (task: Task) => {
    if (clearTaskTimeoutRef.current) {
      clearTimeout(clearTaskTimeoutRef.current);
      clearTaskTimeoutRef.current = null;
    }

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
