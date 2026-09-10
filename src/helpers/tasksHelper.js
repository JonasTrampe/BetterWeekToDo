import { isTaskDone } from "./taskStatus";

export default {
  pendingTasksCount(todoList) {
    if (todoList == null || typeof(todoList) === "undefined") return 0;
    return todoList.filter((todo) => !isTaskDone(todo)).length;
  },
  reorderTasksList(toDoList) {
    var array = toDoList;
    array.sort(function (a, b) {
      if (isTaskDone(b) != isTaskDone(a)) {
        if (isTaskDone(b)) return -1;
        if (isTaskDone(a)) return 1;
      }
      if (b.time != a.time) {
        if (b.time == null) return -1;
        if (a.time == null) return 1;
      }
      if (b.time < a.time) return 1;
      if (b.time > a.time) return -1;
    });
    return array;
  },
};
