import { TASK_STATUS, taskStatus } from "./taskStatus";

export function summarizeWeek(todoLists, dates) {
  const summary = { total: 0, todo: 0, inProgress: 0, done: 0 };
  dates.forEach((date) => {
    (todoLists[date] || []).forEach((task) => {
      summary.total += 1;
      const status = taskStatus(task);
      if (status === TASK_STATUS.DONE) summary.done += 1;
      else if (status === TASK_STATUS.IN_PROGRESS) summary.inProgress += 1;
      else summary.todo += 1;
    });
  });
  return summary;
}
