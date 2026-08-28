import { describe, expect, it } from "vitest";
import { applyTaskStatus, isTaskDone, nextTaskStatus, TASK_STATUS, taskStatus } from "../src/helpers/taskStatus";

describe("task status compatibility", () => {
  it("treats checked-only tasks from existing backups as done", () => {
    expect(taskStatus({ checked: true })).toBe(TASK_STATUS.DONE);
    expect(taskStatus({ checked: false })).toBe(TASK_STATUS.TODO);
    expect(isTaskDone({ checked: true })).toBe(true);
  });

  it("cycles todo, in-progress, and done without losing checked compatibility", () => {
    const task = { checked: false };
    applyTaskStatus(task, nextTaskStatus(task));
    expect(task).toMatchObject({ status: TASK_STATUS.IN_PROGRESS, checked: false });
    applyTaskStatus(task, nextTaskStatus(task));
    expect(task).toMatchObject({ status: TASK_STATUS.DONE, checked: true });
    applyTaskStatus(task, nextTaskStatus(task));
    expect(task).toMatchObject({ status: TASK_STATUS.TODO, checked: false });
  });
});
