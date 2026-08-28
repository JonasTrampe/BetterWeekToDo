export const TASK_STATUS = Object.freeze({
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  DONE: "done",
});

const validStatuses = new Set(Object.values(TASK_STATUS));

// Older backups only have `checked`.  Keep accepting them so opening a backup
// does not silently change its meaning.
export function taskStatus(task) {
  if (validStatuses.has(task?.status)) return task.status;
  return task?.checked ? TASK_STATUS.DONE : TASK_STATUS.TODO;
}

export function isTaskDone(task) {
  return taskStatus(task) === TASK_STATUS.DONE;
}

export function nextTaskStatus(task) {
  const status = taskStatus(task);
  if (status === TASK_STATUS.TODO) return TASK_STATUS.IN_PROGRESS;
  if (status === TASK_STATUS.IN_PROGRESS) return TASK_STATUS.DONE;
  return TASK_STATUS.TODO;
}

export function applyTaskStatus(task, status) {
  if (!validStatuses.has(status)) throw new Error(`Unsupported task status: ${status}`);
  task.status = status;
  // `checked` remains for backwards-compatible exports and existing views.
  task.checked = status === TASK_STATUS.DONE;
  return task;
}
