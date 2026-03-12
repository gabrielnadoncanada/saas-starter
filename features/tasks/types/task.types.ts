export type TaskListItem = {
  id: number;
  code: string;
  title: string;
  description: string | null;
  label: 'FEATURE' | 'BUG' | 'DOCUMENTATION';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELED';
  updatedAt: string;
};
