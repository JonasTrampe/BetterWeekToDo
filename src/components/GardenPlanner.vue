<template>
  <main class="garden-planner" :class="{ 'compact-view': compactView }" :style="{ '--garden-day-count': dates.length, '--garden-period-columns': periodColumns, '--garden-period-count': periods.length }">
    <header class="garden-week-header">
      <button class="garden-arrow" type="button" aria-label="Previous week" @click="$emit('move-week', -7)">
        <i class="bi-chevron-left" aria-hidden="true"></i>
      </button>
      <h1>{{ weekRange }}</h1>
      <button class="garden-arrow" type="button" aria-label="Next week" @click="$emit('move-week', 7)">
        <i class="bi-chevron-right" aria-hidden="true"></i>
      </button>
    </header>

    <nav class="garden-date-strip" aria-label="Days in this week">
      <button
        v-for="date in dates"
        :key="date"
        type="button"
        class="garden-date"
        :class="{ active: date === selectedDate }"
        :aria-current="date === selectedDate ? 'date' : undefined"
        @click="$emit('select-date', date)"
      >
        <span>{{ formatDate(date, 'EEE') }}</span>
        <strong>{{ formatDate(date, 'd') }}</strong>
      </button>
    </nav>

    <section class="garden-day-heading">
      <div>
        <h2>{{ headerTitle }}</h2>
      </div>
      <div class="garden-heading-actions">
        <div v-if="plannerView === 'day'" class="garden-focus-copy">
          <span>Focus for today<br /><strong>Progress over perfect.</strong></span>
        </div>
        <div v-if="plannerView === 'day'" class="garden-list-actions" aria-label="List actions">
          <button type="button" title="Complete all tasks" aria-label="Complete all tasks" @click="completeAll"><i class="bi-check2-all" aria-hidden="true"></i></button>
          <button type="button" title="Move unfinished tasks to tomorrow" aria-label="Move unfinished tasks to tomorrow" @click="snoozeUnfinished"><i class="bi-arrow-right-circle" aria-hidden="true"></i></button>
        </div>
        <div class="garden-view-toggle" role="group" aria-label="Planner view">
          <button type="button" :class="{ active: plannerView === 'day' }" :aria-pressed="plannerView === 'day'" @click="plannerView = 'day'">Day</button>
          <button type="button" :class="{ active: plannerView === 'week' }" :aria-pressed="plannerView === 'week'" @click="plannerView = 'week'">Week</button>
          <button v-if="customListsEnabled" type="button" :class="{ active: plannerView === 'lists' }" :aria-pressed="plannerView === 'lists'" @click="plannerView = 'lists'">Lists</button>
        </div>
      </div>
    </section>

    <template v-if="plannerView === 'day'">
      <section class="garden-periods" aria-label="Tasks by time of day">
        <garden-plot
          v-for="period in periods"
          :key="period.key"
          class="garden-period"
          :icon="period.icon"
          :label="period.label"
          :meta="period.range"
          :tasks="tasksFor(period)"
          :source-id="selectedDate"
          :add-placeholder="`Add ${period.label.toLowerCase()} task…`"
          @add="(text) => addTask(period, text)"
          @drop="dropTask($event, period)"
          @task-dragstart="(event, entry) => startTaskDrag(event, entry)"
        />
      </section>

      <section class="garden-completed" aria-labelledby="completed-heading">
        <div class="completed-title">
          <h3 id="completed-heading">Completed today</h3>
        </div>
        <div v-if="completedTasks.length" class="completed-list">
          <button v-for="entry in completedTasks" :key="entry.index" type="button" @click="advanceTask(entry.index)">
            <i class="bi-check" aria-hidden="true"></i><span>{{ entry.task.text }}</span>
          </button>
        </div>
        <p v-else class="completed-empty">Finished tasks will gather here—quiet evidence of progress.</p>
      </section>
    </template>

    <section v-else-if="plannerView === 'week'" class="garden-week-grid" aria-label="Week tasks">
      <article
        v-for="date in dates"
        :key="date"
        class="garden-week-day"
        :class="{ active: date === selectedDate }"
        @dblclick="openDayUnlessInteractive($event, date)"
      >
        <garden-plot-header
          class="garden-week-day-header"
          icon="bi-calendar3"
          :label="formatDate(date, 'EEEE')"
          :meta="formatDate(date, 'd MMM')"
          @click="openDay(date)"
        />
        <div class="garden-week-list">
          <div class="garden-week-sections">
            <garden-plot-section
              v-for="period in periods"
              :key="period.key"
              :icon="period.icon"
              :label="period.label"
              :tasks="tasksForDatePeriod(date, period)"
              :source-id="date"
              :add-enabled="false"
              @drop="dropTaskOnPeriod($event, date, period)"
              @task-dragstart="(event, entry) => startTaskDragForDate(event, date, entry)"
            />
          </div>
          <form class="garden-week-add" @submit.prevent="addTaskForDate(date, periods[0], weekDrafts[date])">
            <label :for="`week-add-${date}`" class="visually-hidden">Add a task to {{ formatDate(date, 'EEEE') }}</label>
            <input :id="`week-add-${date}`" v-model="weekDrafts[date]" type="text" placeholder="Add task…" />
            <button type="submit" :disabled="!String(weekDrafts[date] || '').trim()" aria-label="Add task"><i class="bi-plus" aria-hidden="true"></i></button>
          </form>
        </div>
      </article>
    </section>

    <section v-else class="garden-custom-lists" aria-label="Custom lists">
      <garden-plot
        v-for="list in customLists"
        :key="list.listId"
        class="garden-custom-list"
        icon="bi-bookmark"
        :label="list.listName || 'Untitled list'"
        :reserve-meta="true"
        :tasks="tasksForList(list.listId)"
        :source-id="list.listId"
        add-placeholder="Add task…"
        @label-dblclick="beginListNameEdit(list)"
        @add="(text) => addTaskToList(list.listId, text)"
        @drop="dropTaskOnList($event, list.listId)"
        @task-dragstart="(event, entry) => startTaskDragForList(event, list.listId, entry)"
      >
        <template #label>
          <input
            v-if="editingListId === list.listId"
            :id="`custom-list-name-${list.listId}`"
            v-model="customListNameDraft"
            class="custom-list-name-input"
            type="text"
            aria-label="Custom list name"
            @click.stop
            @blur="saveListNameEdit(list)"
            @keyup.enter="saveListNameEdit(list)"
            @keyup.esc="cancelListNameEdit"
          />
          <span v-else class="custom-list-name">{{ list.listName || 'Untitled list' }}</span>
        </template>
        <template #actions>
          <button
            class="garden-remove-list"
            type="button"
            aria-label="Remove custom list"
            title="Remove custom list"
            data-bs-toggle="modal"
            data-bs-target="#customListRemoveModal"
            @click.stop="requestListRemoval(list)"
          ><i class="bi-trash3" aria-hidden="true"></i></button>
        </template>
      </garden-plot>
      <button type="button" class="garden-new-list" @click="$emit('create-custom-list')"><i class="bi-plus" aria-hidden="true"></i> New list</button>
    </section>

  </main>
</template>

<script>
import { addDays, format, parse } from "date-fns";
import { Modal } from "bootstrap";
import toDoListRepository from "../repositories/toDoListRepository";
import customToDoListIdsRepository from "../repositories/customToDoListIdsRepository";
import repeatingEventHelper from "../helpers/repeatingEvents.js";
import gardenPlot from "./GardenPlot";
import gardenPlotSection from "./GardenPlotSection";
import gardenPlotHeader from "./GardenPlotHeader";

export default {
  name: "GardenPlanner",
  props: {
    dates: { type: Array, required: true },
    selectedDate: { type: String, required: true },
    periodColumns: { type: Number, default: 5 },
    periods: { type: Array, required: true },
    customLists: { type: Array, default: () => [] },
    customListsEnabled: { type: Boolean, default: false },
    initialView: { type: String, default: "day" },
  },
  emits: ["select-date", "move-week", "create-custom-list"],
  components: { gardenPlot, gardenPlotSection, gardenPlotHeader },
  data() {
    return {
      plannerView: this.initialView,
      draggedTask: null,
      weekDrafts: {},
      editingListId: null,
      customListNameDraft: "",
    };
  },
  computed: {
    dayTasks() { return this.$store.getters.todoLists[this.selectedDate] || []; },
    activeTasks() {
      return this.dayTasks.map((task, index) => ({ task, index })).filter(({ task }) => !task.checked && task.status !== "done");
    },
    completedTasks() {
      return this.dayTasks.map((task, index) => ({ task, index })).filter(({ task }) => task.checked || task.status === "done");
    },
    weekStats() {
      const tasks = this.dates.flatMap((date) => this.tasksForDate(date));
      return {
        total: tasks.length,
        done: tasks.filter(({ task }) => task.checked || task.status === "done").length,
      };
    },
    weekRange() {
      if (!this.dates.length) return "";
      const first = this.toDate(this.dates[0]);
      const last = this.toDate(this.dates[this.dates.length - 1]);
      return `${format(first, "MMM d")} – ${format(last, "MMM d, yyyy")}`;
    },
    headerTitle() {
      if (this.plannerView === "day") return this.formatDate(this.selectedDate, "MMMM d, yyyy");
      return this.plannerView === "week" ? "Week overview" : "Custom lists";
    },
    compactView() { return this.$store.getters.config.compactView; },
    notificationIndicator() { return this.$store.getters.config.notificationIndicator; },
    autoReorderTasks() { return this.$store.getters.config.autoReorderTasks; },
    moveCompletedTaskToBottom() { return this.$store.getters.config.moveCompletedTaskToBottom; },
  },
  watch: {
    customLists: { immediate: true, handler(value) { (value || []).forEach((list) => this.loadList(list.listId)); } },
    dates: { immediate: true, handler(value) { value.forEach((date) => this.loadDate(date)); } },
    selectedDate: { immediate: true, handler(value) { if (value) this.loadDate(value); } },
    initialView(value) { this.plannerView = value; },
  },
  methods: {
    toDate(value) { return parse(value, "yyyyMMdd", new Date()); },
    formatDate(value, pattern) { return value ? format(this.toDate(value), pattern) : ""; },
    async loadDate(date) {
      await this.$store.dispatch("loadTodoLists", date);
      await this.$store.dispatch("loadRepeatingEventGeneratedByDate", date);
      repeatingEventHelper.generateRepeatingEventsIntances(date, this);
      repeatingEventHelper.removeGeneratedRepeatingEvents(date, this);
    },
    async loadList(listId) {
      if (listId) await this.$store.dispatch("loadTodoLists", listId);
    },
    periodForTime(time) {
      if (!time) return "morning";
      const hour = Number(String(time).slice(0, 2));
      if (!Number.isFinite(hour) || hour < 10) return "morning";
      if (hour < 13) return "midday";
      if (hour < 17) return "afternoon";
      if (hour < 20) return "evening";
      return "night";
    },
    tasksFor(period) {
      return this.activeTasks.filter(({ task }) => this.blockForTask(task) === period.key);
    },
    tasksForDate(date) {
      return (this.$store.getters.todoLists[date] || []).map((task, index) => ({ task, index }));
    },
    tasksForDatePeriod(date, period) {
      return this.tasksForDate(date).filter(({ task }) => this.blockForTask(task) === period.key);
    },
    blockForTask(task) {
      const configured = this.periods.some((period) => period.key === task.timeBlock);
      if (configured) return task.timeBlock;
      const inferred = this.periodForTime(task.time);
      return this.periods.some((period) => period.key === inferred) ? inferred : this.periods[0]?.key;
    },
    openDay(date) {
      this.$emit("select-date", date);
      this.plannerView = "day";
    },
    openDayUnlessInteractive(event, date) {
      if (event.target.closest("button, input, select, a")) return;
      this.openDay(date);
    },
    openDetails(entry) {
      this.openDetailsFor(this.selectedDate, entry);
    },
    openDetailsFor(date, entry) {
      this.$store.commit("actionsSelectedTodoIdUpdate", { toDo: entry.task, index: entry.index });
      new Modal(document.getElementById("toDoModal"), { keyboard: false }).show();
    },
    completeAll() {
      if (!this.dayTasks.length) return;
      this.$store.commit("checkAllItems", this.selectedDate);
      this.persist();
    },
    async snoozeUnfinished() {
      const targetDate = format(addDays(this.toDate(this.selectedDate), 1), "yyyyMMdd");
      await this.loadDate(targetDate);
      this.$store.commit("moveUndoneItems", { origenId: this.selectedDate, destinyId: targetDate });
      this.persist(this.selectedDate);
      this.persist(targetDate);
    },
    startTaskDrag(event, entry) {
      this.draggedTask = { date: this.selectedDate, index: entry.index };
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", entry.task.text);
      event.dataTransfer.setData("item", JSON.stringify(entry.task));
      event.dataTransfer.setData("index", String(entry.index));
    },
    startTaskDragForDate(event, date, entry) {
      this.draggedTask = { date, index: entry.index };
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", entry.task.text);
      event.dataTransfer.setData("item", JSON.stringify(entry.task));
      event.dataTransfer.setData("index", String(entry.index));
    },
    startTaskDragForList(event, listId, entry) {
      this.draggedTask = { date: listId, index: entry.index };
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", entry.task.text);
      event.dataTransfer.setData("item", JSON.stringify(entry.task));
      event.dataTransfer.setData("index", String(entry.index));
    },
    dropTask(event, period) {
      const source = this.draggedTask || this.dragSource(event);
      if (!source || source.date === this.selectedDate && !this.draggedTask) return;
      const sourceTasks = this.$store.getters.todoLists[source.date];
      const [task] = sourceTasks.splice(source.index, 1);
      task.time = null;
      task.timeBlock = period.key;
      task.listId = this.selectedDate;
      this.dayTasks.push(task);
      this.persist(source.date);
      this.persist();
      this.draggedTask = null;
    },
    async dropTaskOnDate(event, targetDate) {
      const source = this.draggedTask || this.dragSource(event);
      if (!source || source.date === targetDate) return;
      const sourceDate = source.date;
      const sourceTasks = this.$store.getters.todoLists[sourceDate];
      const [task] = sourceTasks.splice(source.index, 1);
      await this.loadDate(targetDate);
      task.listId = targetDate;
      this.$store.getters.todoLists[targetDate].push(task);
      this.persist(sourceDate);
      this.persist(targetDate);
      this.draggedTask = null;
    },
    async dropTaskOnPeriod(event, targetDate, period) {
      const source = this.draggedTask || this.dragSource(event);
      if (!source) return;
      const sourceDate = source.date;
      const sourceTasks = this.$store.getters.todoLists[sourceDate];
      const [task] = sourceTasks.splice(source.index, 1);
      if (sourceDate !== targetDate) await this.loadDate(targetDate);
      task.listId = targetDate;
      task.timeBlock = period.key;
      task.time = null;
      this.$store.getters.todoLists[targetDate].push(task);
      this.persist(sourceDate);
      this.persist(targetDate);
      this.draggedTask = null;
    },
    tasksForList(listId) {
      return (this.$store.getters.todoLists[listId] || []).map((task, index) => ({ task, index }));
    },
    beginListNameEdit(list) {
      this.editingListId = list.listId;
      this.customListNameDraft = list.listName || "";
      this.$nextTick(() => document.getElementById(`custom-list-name-${list.listId}`)?.focus());
    },
    saveListNameEdit(list) {
      if (this.editingListId !== list.listId) return;
      const index = this.customLists.findIndex((item) => item.listId === list.listId);
      if (index >= 0) {
        this.$store.commit("updateCustomTodoList", { index, name: this.customListNameDraft.trim() });
        customToDoListIdsRepository.update(this.$store.getters.cTodoListIds);
      }
      this.cancelListNameEdit();
    },
    cancelListNameEdit() {
      this.editingListId = null;
      this.customListNameDraft = "";
    },
    requestListRemoval(list) {
      const index = this.customLists.findIndex((item) => item.listId === list.listId);
      if (index < 0) return;
      this.$store.commit("actionsCListToRmvUpdate", {
        id: list.listId,
        index,
        name: list.listName || "Untitled list",
      });
    },
    addTaskToList(listId, text) {
      if (!text) return;
      this.$store.commit("addTodo", { text, checked: false, status: "todo", listId, desc: "", subTaskList: [], color: "none", priority: 0, tags: [], time: null, timeBlock: null, alarm: false, repeatingEvent: null });
      this.persist(listId);
    },
    async dropTaskOnList(event, targetList) {
      const source = this.draggedTask || this.dragSource(event);
      if (!source || source.date === targetList) return;
      const sourceTasks = this.$store.getters.todoLists[source.date] || [];
      const [task] = sourceTasks.splice(source.index, 1);
      if (!task) return;
      await this.loadList(targetList);
      task.listId = targetList;
      task.time = null;
      task.timeBlock = null;
      this.$store.getters.todoLists[targetList].push(task);
      this.persist(source.date);
      this.persist(targetList);
      this.draggedTask = null;
    },
    dragSource(event) {
      try {
        const task = JSON.parse(event.dataTransfer.getData("item"));
        const index = Number(event.dataTransfer.getData("index"));
        return task && Number.isInteger(index) ? { date: task.listId, index } : null;
      } catch { return null; }
    },
    addTask(period, text) {
      if (!text) return;
      this.$store.commit("addTodo", {
        text, checked: false, status: "todo", listId: this.selectedDate, desc: "", subTaskList: [],
        color: "none", priority: 0, tags: [], time: null, timeBlock: period.key, alarm: false, repeatingEvent: null,
      });
      this.persist();
    },
    async addTaskForDate(date, period, text) {
      const taskText = String(text || "").trim();
      if (!taskText || !period) return;
      await this.loadDate(date);
      this.$store.commit("addTodo", {
        text: taskText, checked: false, status: "todo", listId: date, desc: "", subTaskList: [],
        color: "none", priority: 0, tags: [], time: null, timeBlock: period.key, alarm: false, repeatingEvent: null,
      });
      this.persist(date);
      this.weekDrafts[date] = "";
    },
    advanceTask(index) {
      this.advanceTaskFor(this.selectedDate, index);
    },
    advanceTaskFor(date, index) {
      this.$store.commit("advanceTodoStatus", { toDoListId: date, index });
      const task = this.$store.getters.todoLists[date][index];
      if (this.moveCompletedTaskToBottom && (task.checked || task.status === "done")) {
        this.$store.commit("moveTodoToEnd", { toDoListId: date, index });
      }
      this.persist(date);
    },
    persist(date = this.selectedDate) {
      const tasks = this.$store.getters.todoLists[date];
      if (this.autoReorderTasks) tasks.sort((a, b) => {
        const aDone = a.checked || a.status === "done";
        const bDone = b.checked || b.status === "done";
        if (aDone !== bDone) return aDone ? 1 : -1;
        return String(a.timeBlock || a.time || "").localeCompare(String(b.timeBlock || b.time || ""));
      });
      toDoListRepository.update(date, tasks);
    },
  },
};
</script>

<style scoped lang="scss">
.garden-planner { position: relative; z-index: 1; height: 100%; overflow: auto; display: flex; flex-direction: column; padding: 1.2rem 2rem 1.5rem; color: #263a2d; background: transparent; scrollbar-width: none; }
.garden-planner::-webkit-scrollbar,.garden-date-strip::-webkit-scrollbar { display: none; }
.garden-week-header { display: grid; grid-template-columns: 3rem 1fr 3rem; align-items: center; margin-bottom: .55rem; }
.garden-week-header h1 { margin: 0; font: 500 clamp(1.3rem,2vw,1.8rem)/1.1 "Garden Serif",serif; text-align: center; }
.garden-arrow { width: 2.75rem; height: 2.75rem; border: 0; border-radius: 50%; background: #fcfaf5; color: #263a2d; font-size: 1.5rem; }
.garden-date-strip { display: grid; grid-template-columns: repeat(var(--garden-day-count),1fr); flex: 0 0 auto; border-block: 1px solid #d8d5ca; }
.garden-date { min-height: 5rem; border: 0; border-right: 1px solid #ddd9cf; background: #fcfaf5; color: #263a2d; display: grid; place-content: center; gap: .2rem; text-transform: uppercase; }
.garden-date:last-child { border-right: 0; }
.garden-date span { font-size: .76rem; letter-spacing: .06em; }
.garden-date strong { font: 400 1.65rem "Garden Serif",serif; }
.garden-date.active { position: relative; margin: -.45rem .25rem; min-height: 5.9rem; border-radius: 10px; background: #879987; color: #fff; box-shadow: 0 8px 22px rgba(55,74,57,.13); animation: garden-settle .45s cubic-bezier(.16,1,.3,1); }
.garden-date.active::after { content: ""; position: absolute; left: 32%; right: 32%; bottom: .65rem; height: 3px; border-radius: 3px; background: #c86d3e; }
.garden-date:focus-visible,.garden-arrow:focus-visible,.garden-check:focus-visible,.garden-add input:focus-visible,.garden-add button:focus-visible { outline: 3px solid #c86d3e; outline-offset: 2px; }
.garden-day-heading { display: flex; justify-content: space-between; align-items: end; gap: 2rem; padding: 1.2rem .7rem .7rem; border-bottom: 1px solid #d8d5ca; }
.garden-day-heading p { margin: 0 0 .15rem; text-transform: uppercase; font-size: .72rem; letter-spacing: .08em; color: #657466; }
.garden-day-heading h2 { margin: 0; font: 500 clamp(1.2rem,1.6vw,1.6rem) "Garden Serif",serif; }
.garden-heading-actions { display: flex; align-items: center; justify-content: flex-end; gap: 1rem; }
.garden-focus-copy { display: flex; align-items: center; gap: .7rem; font-size: .8rem; line-height: 1.4; }
.garden-focus-copy strong { font: 500 1rem "Garden Serif",serif; }
.garden-list-actions { display: inline-flex; gap: .25rem; }
.garden-list-actions button { display: inline-grid; place-items: center; width: 2.35rem; min-height: 2.35rem; padding: 0; border: 0; border-radius: 6px; background: transparent; color: #536753; }
.garden-list-actions button:hover { background: #eef2e9; color: #263a2d; }
.garden-view-toggle { display: inline-flex; padding: 3px; border: 1px solid #b7c1b4; border-radius: 9px; background: #fcfaf5; }
.garden-view-toggle button { min-width: 3.2rem; min-height: 2.35rem; padding: .35rem .65rem; border: 0; border-radius: 6px; background: transparent; color: #425243; font-size: .76rem; }
.garden-view-toggle button.active { background: #829582; color: #fff; }
.garden-view-toggle button:focus-visible { outline: 3px solid #c86d3e; outline-offset: 2px; }
.garden-periods { display: grid; grid-template-columns: repeat(var(--garden-period-columns),minmax(0,1fr)); flex: 1 1 auto; min-height: 28rem; }
.garden-period { min-width: 0; border-right: 1px solid #d8d5ca; }
.garden-period:last-child { border-right: 0; }
.garden-week-grid { display: grid; grid-template-columns: repeat(var(--garden-day-count), minmax(12rem, 1fr)); flex: 1 1 auto; min-height: 28rem; overflow-x: auto; }
.garden-week-day { display: flex; flex-direction: column; min-width: 0; padding: 1.05rem .65rem 0; border-right: 1px solid #d8d5ca; }
.garden-week-day:last-child { border-right: 0; }
.garden-week-day.active .garden-week-list { border-color: #9baa98; box-shadow: 0 0 0 2px rgba(130,149,130,.12); }
.garden-week-day-header { cursor: pointer; }
.garden-week-list { display: flex; flex: 1 1 auto; flex-direction: column; min-height: 0; border: 1px solid #dedbd1; border-radius: 9px; background: rgba(255,255,255,.47); overflow: hidden; }
.garden-week-sections { display: flex; flex: 1 1 auto; flex-direction: column; }
.garden-week-sections :deep(.plot-section) { display: flex; flex: 1 1 0; flex-direction: column; padding: .65rem .6rem; }
.garden-week-sections :deep(.plot-section-list) { flex: 1 1 auto; min-height: 1.45rem; }
.garden-week-sections :deep(.plot-section-list li) { padding-block: .28rem; }
.garden-week-sections :deep(.plot-section-empty) { display: none; }
.garden-week-add { display: flex; flex: 0 0 auto; border-top: 1px solid #dedbd1; background: rgba(255,255,255,.68); }
.garden-week-add input { flex: 1 1 auto; min-width: 0; border: 0; background: transparent; padding: .55rem .35rem; color: #263a2d; font-size: .78rem; }
.garden-week-add input::placeholder { color: #8a998a; }
.garden-week-add button { width: 2.2rem; border: 0; background: transparent; color: #536753; }
.garden-custom-lists { display: grid; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); align-items: stretch; gap: .8rem; flex: 1 1 auto; overflow: auto; }
.garden-custom-list { position: relative; min-height: 21rem; }
.garden-custom-list::after { content: ""; position: absolute; top: 0; right: -.4rem; bottom: 0; width: 1px; background: #d8d5ca; pointer-events: none; }
.custom-list-name { cursor: text; }
.custom-list-name-input { width: 100%; min-width: 0; border: 0; border-bottom: 1px solid #9aa996; background: transparent; color: inherit; font: inherit; letter-spacing: inherit; text-align: center; text-transform: none; }
.custom-list-name-input:focus-visible { outline: 2px solid #c86d3e; outline-offset: 2px; }
.garden-remove-list { display: inline-grid; place-items: center; width: 1.7rem; min-height: 1.7rem; padding: 0; border: 0; border-radius: 6px; background: transparent; color: #7a8a78; font-size: .85rem; }
.garden-remove-list:hover { background: #f5e6df; color: #a8442d; }
.garden-remove-list:focus-visible { outline: 3px solid #c86d3e; outline-offset: 2px; }
.garden-new-list { display: inline-flex; align-items: center; justify-content: center; align-self: start; gap: .45rem; min-height: 3rem; border: 1px dashed #9aa996; border-radius: 9px; background: transparent; color: #536753; font-size: .82rem; }
.garden-new-list:hover { border-style: solid; background: #eef2e9; color: #263a2d; }
.garden-completed { margin-top: .4rem; padding: 1rem 1.2rem; border: 1px solid #d8d5ca; border-radius: 9px; background: #fcfaf5; }
.completed-title { display: flex; align-items: center; gap: .6rem; }
.completed-title h3 { margin: 0; font: 500 1rem "Garden Serif",serif; }
.completed-title span { color: #759076; font-size: 1.4rem; }
.completed-list { display: flex; flex-wrap: wrap; gap: .5rem 1.6rem; margin-top: .8rem; }
.completed-list button { border: 0; background: transparent; color: #677567; font-size: .78rem; }
.completed-list i { display: inline-grid; place-items: center; width: 1.2rem; height: 1.2rem; margin-right: .4rem; border-radius: 3px; background: #829582; color: #fff; }
.completed-empty { margin: .6rem 0 0; color: #697869; font-size: .78rem; }
.garden-planner.compact-view .garden-period li { padding-block: .4rem; }
.garden-planner.compact-view .garden-period ul { min-height: 6rem; }

:global(.dark-theme) .garden-planner { color: #e2eadf; }
:global(.dark-theme) .garden-arrow,:global(.dark-theme) .garden-date,:global(.dark-theme) .garden-view-toggle,:global(.dark-theme) .garden-completed { background: #1c2a21; color: #e2eadf; border-color: #435747; }
:global(.dark-theme) .garden-date { background: #1b291f; }
:global(.dark-theme) .garden-date.active,:global(.dark-theme) .garden-view-toggle button.active { background: #6f866f; color: #fff; }
:global(.dark-theme) .garden-period,:global(.dark-theme) .garden-day-heading,:global(.dark-theme) .garden-date-strip { border-color: #435747; }
:global(.dark-theme) .garden-week-day,:global(.dark-theme) .garden-week-list,:global(.dark-theme) .garden-week-add { border-color: #435747; }
:global(.dark-theme) .garden-custom-list::after { background: #435747; }
:global(.dark-theme) .custom-list-name-input { border-color: #718670; color: #e3ebe0; }
:global(.dark-theme) .garden-remove-list { color: #b5c5b4; }
:global(.dark-theme) .garden-remove-list:hover { background: #492d26; color: #ffc6b4; }
:global(.dark-theme) .garden-week-list,:global(.dark-theme) .garden-week-add { background: #1c2a21; }
:global(.dark-theme) .garden-week-day.active .garden-week-list { border-color: #718670; box-shadow: 0 0 0 2px rgba(111,134,111,.22); }
:global(.dark-theme) .garden-week-day-header span,:global(.dark-theme) .garden-week-add input::placeholder { color: #9fb19d; }
:global(.dark-theme) .garden-week-add input { color: #e3ebe0; }
:global(.dark-theme) .garden-new-list { border-color: #718670; color: #c5d4c4; }
:global(.dark-theme) .garden-new-list:hover { background: #2a3c2e; color: #fff; }
:global(.dark-theme) .garden-day-heading p { color: #b2c1b1; }
:global(.dark-theme) .garden-list-actions button { color: #c5d4c4; }
:global(.dark-theme) .garden-list-actions button:hover { background: #2a3c2e; color: #fff; }


@media (max-width: 900px) {
  .garden-planner { padding: 1rem; overflow-x: hidden; }
  .garden-periods { grid-template-columns: 1fr; gap: .75rem; flex: none; min-height: 0; margin-top: .8rem; }
  .garden-period { border: 1px solid #d8d5ca; border-radius: 12px; }
  .garden-week-grid { grid-template-columns: 1fr; overflow: visible; gap: .75rem; padding: .8rem 0 0; }
  .garden-week-day { padding: 0; border: 0; }
  .garden-custom-lists { grid-template-columns: 1fr; overflow: visible; }
  .garden-custom-list::after { display: none; }
}

@media (min-width: 901px) and (max-width: 1200px) {
  .garden-planner { padding-inline: 1rem; }
}

@media (min-width: 901px) and (max-height: 800px) {
  .garden-planner { padding: .55rem 1.25rem .75rem; }
  .garden-arrow { width: 2.5rem; height: 2.5rem; }
  .garden-date { min-height: 3.8rem; }
  .garden-date.active { min-height: 4.6rem; margin: -.3rem .2rem; }
  .garden-date.active::after { bottom: .35rem; }
  .garden-day-heading { padding: .65rem .55rem .45rem; }
  .garden-day-heading p { font-size: .64rem; }
  .garden-periods { min-height: 0; }
  .garden-completed { padding: .65rem 1rem; }
  .completed-list { margin-top: .45rem; }
  .completed-empty { margin-top: .35rem; }
}

@media (max-width: 600px) {
  .garden-planner { padding: .75rem .7rem 5.5rem; }
  .garden-week-header h1 { font-size: 1.2rem; }
  .garden-date-strip { overflow-x: auto; grid-template-columns: repeat(var(--garden-day-count),minmax(4.2rem,1fr)); padding-block: .45rem; }
  .garden-date { min-height: 4.2rem; }
  .garden-date.active { margin: 0; min-height: 4.2rem; }
  .garden-date.active::after { bottom: .2rem; }
  .garden-day-heading { align-items: start; padding: 1.25rem .2rem .8rem; }
  .garden-heading-actions { gap: .5rem; }
  .garden-focus-copy { display: none; }
  .garden-view-toggle button { min-width: 2.8rem; }
  .garden-completed { margin-top: .8rem; }
}

@keyframes garden-settle {
  from { transform: translateY(-.45rem); box-shadow: 0 16px 28px rgba(55,74,57,.18); }
  to { transform: translateY(0); box-shadow: 0 8px 22px rgba(55,74,57,.13); }
}

@media (prefers-reduced-motion: reduce) {
  .garden-date.active { animation: none; }
}
</style>
