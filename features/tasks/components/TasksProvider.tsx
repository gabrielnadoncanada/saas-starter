"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { Task } from '../types/task.types';

type TasksDialogType = 'create' | 'update' | 'delete';

type TasksContextType = {
  currentTask: Task | null;
  dialog: TasksDialogType | null;
  tasks: Task[];
  createTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: number) => void;
  bulkDeleteTasks: (taskIds: number[]) => void;
  bulkUpdateTaskStatus: (taskIds: number[], status: Task['status']) => void;
  closeDialog: () => void;
  openCreateDialog: () => void;
  openDeleteDialog: (task: Task) => void;
  openUpdateDialog: (task: Task) => void;
};

const TasksContext = React.createContext<TasksContextType | null>(null);

type TasksProviderProps = {
  children: React.ReactNode;
  initialTasks: Task[];
};

export function TasksProvider({ children, initialTasks }: TasksProviderProps) {
  const [dialog, setDialog] = useState<TasksDialogType | null>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const clearTaskTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (clearTaskTimeoutRef.current) {
        clearTimeout(clearTaskTimeoutRef.current);
      }
    };
  }, []);

  const closeDialog = useCallback(() => {
    setDialog(null);

    if (clearTaskTimeoutRef.current) {
      clearTimeout(clearTaskTimeoutRef.current);
    }

    clearTaskTimeoutRef.current = setTimeout(() => {
      setCurrentTask(null);
      clearTaskTimeoutRef.current = null;
    }, 300);
  }, []);

  const openCreateDialog = useCallback(() => {
    if (clearTaskTimeoutRef.current) {
      clearTimeout(clearTaskTimeoutRef.current);
      clearTaskTimeoutRef.current = null;
    }

    setCurrentTask(null);
    setDialog('create');
  }, []);

  const openUpdateDialog = useCallback((task: Task) => {
    if (clearTaskTimeoutRef.current) {
      clearTimeout(clearTaskTimeoutRef.current);
      clearTaskTimeoutRef.current = null;
    }

    setCurrentTask(task);
    setDialog('update');
  }, []);

  const openDeleteDialog = useCallback((task: Task) => {
    if (clearTaskTimeoutRef.current) {
      clearTimeout(clearTaskTimeoutRef.current);
      clearTaskTimeoutRef.current = null;
    }

    setCurrentTask(task);
    setDialog('delete');
  }, []);

  const createTask = useCallback((task: Task) => {
    setTasks((current) => [task, ...current]);
  }, []);

  const updateTask = useCallback((task: Task) => {
    setTasks((current) =>
      current.map((currentTask) => (currentTask.id === task.id ? task : currentTask))
    );
    setCurrentTask((currentTask) => (currentTask?.id === task.id ? task : currentTask));
  }, []);

  const deleteTask = useCallback((taskId: number) => {
    setTasks((current) => current.filter((task) => task.id !== taskId));
    setCurrentTask((currentTask) => (currentTask?.id === taskId ? null : currentTask));
  }, []);

  const bulkDeleteTasks = useCallback((taskIds: number[]) => {
    const deletedTaskIds = new Set(taskIds);

    setTasks((current) => current.filter((task) => !deletedTaskIds.has(task.id)));
    setCurrentTask((currentTask) =>
      currentTask && deletedTaskIds.has(currentTask.id) ? null : currentTask
    );
  }, []);

  const bulkUpdateTaskStatus = useCallback((taskIds: number[], status: Task['status']) => {
    const updatedTaskIds = new Set(taskIds);

    setTasks((current) =>
      current.map((task) =>
        updatedTaskIds.has(task.id)
          ? {
              ...task,
              status,
            }
          : task
      )
    );
    setCurrentTask((currentTask) =>
      currentTask && updatedTaskIds.has(currentTask.id)
        ? {
            ...currentTask,
            status,
          }
        : currentTask
    );
  }, []);

  const value = useMemo(
    () => ({
      currentTask,
      dialog,
      tasks,
      createTask,
      updateTask,
      deleteTask,
      bulkDeleteTasks,
      bulkUpdateTaskStatus,
      closeDialog,
      openCreateDialog,
      openDeleteDialog,
      openUpdateDialog,
    }),
    [
      bulkDeleteTasks,
      bulkUpdateTaskStatus,
      closeDialog,
      createTask,
      currentTask,
      deleteTask,
      dialog,
      openCreateDialog,
      openDeleteDialog,
      openUpdateDialog,
      tasks,
      updateTask,
    ]
  );

  return (
    <TasksContext.Provider value={value}>
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
