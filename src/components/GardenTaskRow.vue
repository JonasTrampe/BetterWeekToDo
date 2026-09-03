<template>
  <button type="button" class="garden-check" :class="{ done: isDone }" :aria-label="checkLabel" @click="advance">
    <i class="bi-check" aria-hidden="true"></i>
  </button>
  <input
    v-if="editing"
    ref="editInput"
    v-model="editingText"
    class="garden-task-edit"
    type="text"
    @blur="saveEdit"
    @keyup.enter="saveEdit"
    @keyup.esc="cancelEdit"
  />
  <span v-else class="garden-task-text" :class="{ done: isDone }" @dblclick="beginEdit">{{ task.text }}</span>
  <time v-if="task.time">{{ task.time }}</time>
  <i v-if="notificationIndicator && task.alarm" class="garden-alarm bi-bell-fill" aria-label="Reminder enabled"></i>
  <div class="garden-task-actions">
    <div class="garden-move" @click.stop>
      <button type="button" class="garden-task-more" aria-label="Move task" title="Move task" @click="toggleMove">
        <i class="bi-arrow-right-circle" aria-hidden="true"></i>
      </button>
      <select v-if="moveOpen" class="garden-move-select" aria-label="Move task to" @change="onMoveSelect" @click.stop>
        <option value="" disabled selected>Move to…</option>
        <option v-for="dest in moveDestinations" :key="dest.id" :value="dest.id">{{ dest.label }}</option>
      </select>
    </div>
    <button class="garden-task-more" type="button" aria-label="Open task details" title="Open task details" @click="openDetails">
      <i class="bi-three-dots" aria-hidden="true"></i>
    </button>
  </div>
</template>

<script>
import { Modal } from "bootstrap";
import dateTime from "../helpers/dateTime";
import notifications from "../helpers/notifications";
import toDoListRepository from "../repositories/toDoListRepository";

export default {
  name: "GardenTaskRow",
  props: {
    task: { required: true, type: Object },
    index: { required: true, type: Number },
    sourceId: { required: true, type: String },
  },
  data() {
    return {
      editing: false,
      editingText: "",
      moveOpen: false,
    };
  },
  computed: {
    isDone() {
      return this.task.checked || this.task.status === "done";
    },
    checkLabel() {
      return this.isDone ? "Mark task active" : "Advance task status";
    },
    notificationIndicator() {
      return this.$store.getters.config.notificationIndicator;
    },
    moveDestinations() {
      const opts = [];
      const today = dateTime().format("YYYYMMDD");
      const tomorrow = dateTime().add(1, "day").format("YYYYMMDD");
      if (this.sourceId !== today) opts.push({ id: today, label: "Today" });
      if (this.sourceId !== tomorrow) opts.push({ id: tomorrow, label: "Tomorrow" });
      (this.$store.getters.cTodoListIds || []).forEach((list) => {
        if (list.listId !== this.sourceId) opts.push({ id: list.listId, label: list.listName || "Custom list" });
      });
      return opts;
    },
  },
  methods: {
    advance() {
      this.$store.commit("advanceTodoStatus", { toDoListId: this.sourceId, index: this.index });
      const list = this.$store.getters.todoLists[this.sourceId];
      if (this.$store.getters.config.moveCompletedTaskToBottom && (list[this.index].checked || list[this.index].status === "done")) {
        this.$store.commit("moveTodoToEnd", { toDoListId: this.sourceId, index: this.index });
      }
      this.persistList(this.sourceId);
    },
    beginEdit() {
      this.editing = true;
      this.editingText = this.task.text;
      this.$nextTick(() => this.$refs.editInput?.focus());
    },
    saveEdit() {
      const text = this.editingText.trim();
      if (text) {
        this.$store.commit("updateTodo", { toDoListId: this.sourceId, index: this.index, text });
        this.persistList(this.sourceId);
      }
      this.cancelEdit();
    },
    cancelEdit() {
      this.editing = false;
      this.editingText = "";
    },
    openDetails() {
      this.$store.commit("actionsSelectedTodoIdUpdate", { toDo: this.task, index: this.index });
      new Modal(document.getElementById("toDoModal"), { keyboard: false }).show();
    },
    toggleMove() {
      this.moveOpen = !this.moveOpen;
    },
    async onMoveSelect(event) {
      const destination = event.target.value;
      event.target.value = "";
      this.moveOpen = false;
      if (!destination || destination === this.sourceId) return;
      await this.$store.dispatch("loadTodoLists", destination);
      const sourceTasks = this.$store.getters.todoLists[this.sourceId];
      const [task] = sourceTasks.splice(this.index, 1);
      task.listId = destination;
      this.$store.getters.todoLists[destination].unshift(task);
      this.persistList(this.sourceId);
      this.persistList(destination);
    },
    persistList(id) {
      notifications.refreshDayNotifications(this, id);
      toDoListRepository.update(id, this.$store.getters.todoLists[id]);
    },
  },
};
</script>

<style scoped>
.garden-check { width: 1.2rem; height: 1.2rem; padding: 0; border: 1px solid #9ba79a; border-radius: 3px; background: #fff; color: transparent; }
.garden-check.done { color: #fff; background: #829582; }
.dark-theme .garden-check { background: transparent; border-color: #718670; }

.garden-task-text { color: #263a2d; font-family: system-ui, sans-serif; font-size: 0.82rem; }
.garden-task-text.done { text-decoration: line-through; color: #778277; }
.dark-theme .garden-task-text { color: #e3ebe0; }
.dark-theme .garden-task-text.done { color: #7c8d7a; }

.garden-task-edit { grid-column: 2; width: 100%; border: 1px solid #b7c1b4; border-radius: 4px; background: #fff; color: #263a2d; font: inherit; }
.dark-theme .garden-task-edit { color: #e2eadf; background: transparent; }

.garden-check:focus-visible, .garden-task-more:focus-visible, .garden-task-edit:focus-visible, .garden-move-select:focus-visible {
  outline: 3px solid #c86d3e;
  outline-offset: 2px;
}

time { grid-column: 2; color: #b85c35; font-size: .7rem; }
.garden-alarm { grid-column: 2; color: #b85c35; font-size: .68rem; }

.garden-task-actions { grid-column: 3; grid-row: 1 / span 2; display: flex; align-items: start; justify-content: end; gap: .1rem; max-width: 3.4rem; }
.garden-move { position: relative; }
.garden-task-more { display: inline-grid; place-items: center; width: 1.7rem; min-height: 1.7rem; padding: 0; border: 0; border-radius: 6px; background: transparent; color: #536753; opacity: .6; font-size: .95rem; }
.garden-task-more:hover { background: #eef2e9; color: #263a2d; opacity: 1; }
.dark-theme .garden-task-more { color: #c5d4c4; }
.dark-theme .garden-task-more:hover { background: #2a3c2e; color: #fff; }

.garden-move-select {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 2;
  margin-top: 4px;
  min-width: 8rem;
  border: 1px solid #b7c1b4;
  border-radius: 6px;
  background: #fcfaf5;
  color: #263a2d;
  font-size: .78rem;
  padding: .3rem .4rem;
}
.dark-theme .garden-move-select { background: #1c2a20; border-color: #405443; color: #e3ebe0; }
</style>
