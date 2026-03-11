export const taskStatusOptions = [
  'BACKLOG',
  'TODO',
  'IN_PROGRESS',
  'DONE',
  'CANCELED'
] as const;

export const taskLabelOptions = ['FEATURE', 'BUG', 'DOCUMENTATION'] as const;

export const taskPriorityOptions = ['LOW', 'MEDIUM', 'HIGH'] as const;

export function formatTaskValue(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}
