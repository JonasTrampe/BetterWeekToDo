<template>
  <article class="garden-plot">
    <garden-plot-header :icon="icon" :label="label" :meta="meta" :reserve-meta="reserveMeta" @label-dblclick="$emit('label-dblclick')">
      <template v-if="$slots.label" #label><slot name="label" /></template>
      <template v-if="$slots.actions" #actions><slot name="actions" /></template>
    </garden-plot-header>

    <ul class="garden-task-list" @click="$emit('list-click', $event)" @dragover.prevent @drop="$emit('drop', $event)">
      <li v-for="entry in tasks" :key="entry.index" draggable="true" @dragstart="$emit('task-dragstart', $event, entry)">
        <garden-task-row :task="entry.task" :index="entry.index" :source-id="sourceId" />
      </li>
    </ul>

    <form class="garden-add" @submit.prevent="submitAdd">
      <label :for="inputId" class="visually-hidden">{{ addPlaceholder }}</label>
      <input :id="inputId" ref="addInput" v-model="draft" type="text" :placeholder="addPlaceholder" />
      <button type="submit" :disabled="!draft.trim()" aria-label="Add task"><i class="bi-plus" aria-hidden="true"></i></button>
    </form>
  </article>
</template>

<script>
import gardenPlotHeader from "./GardenPlotHeader";
import gardenTaskRow from "./GardenTaskRow";

export default {
  name: "GardenPlot",
  components: { gardenPlotHeader, gardenTaskRow },
  props: {
    icon: { type: String, default: null },
    label: { type: String, required: true },
    meta: { type: String, default: null },
    reserveMeta: { type: Boolean, default: false },
    tasks: { type: Array, default: () => [] },
    sourceId: { type: String, required: true },
    addPlaceholder: { type: String, default: "Add a task…" },
  },
  emits: ["add", "label-dblclick", "list-click", "drop", "task-dragstart"],
  data() {
    return {
      draft: "",
      inputId: `garden-plot-add-${Math.random().toString(36).slice(2)}`,
    };
  },
  methods: {
    submitAdd() {
      const text = this.draft.trim();
      if (!text) return;
      this.$emit("add", text);
      this.draft = "";
    },
    focusInput() {
      this.$refs.addInput?.focus();
    },
  },
};
</script>

<style scoped>
.garden-plot {
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.05rem 0.65rem 0.8rem;
}

.garden-task-list {
  list-style: none;
  margin: 0;
  padding: 0.25rem 0.7rem;
  min-height: 10rem;
  flex: 1 1 auto;
  border: 1px solid #dedbd1;
  border-radius: 9px 9px 0 0;
  background: rgba(255, 255, 255, 0.47);
  cursor: text;
}

.dark-theme .garden-task-list {
  background: #1c2a21;
  border-color: #435747;
}

.garden-task-list li {
  display: grid;
  grid-template-columns: 1.2rem minmax(0, 1fr) 3.4rem;
  gap: 0.45rem;
  align-items: start;
  padding: 0.65rem 0;
  border-bottom: 1px solid #e4e0d7;
  font-size: 0.82rem;
  cursor: grab;
}

.garden-task-list li:last-child {
  border-bottom: 0;
}

.garden-task-list li:active {
  cursor: grabbing;
}

.dark-theme .garden-task-list li {
  border-bottom-color: #384c3d;
}

.garden-add {
  display: flex;
  border: 1px solid #dedbd1;
  border-top: 0;
  border-radius: 0 0 9px 9px;
  background: rgba(255, 255, 255, 0.68);
}

.dark-theme .garden-add {
  background: #1c2a21;
  border-color: #435747;
}

.garden-add input {
  flex: 1 1 auto;
  min-width: 0;
  border: 0;
  background: transparent;
  padding: 0.7rem 0.4rem 0.7rem 0.7rem;
  font-size: 0.82rem;
  color: #263a2d;
}

.dark-theme .garden-add input {
  color: #e3ebe0;
}

.garden-add input::placeholder {
  color: #697869;
}

.dark-theme .garden-add input::placeholder {
  color: #8fa38d;
}

.garden-add button {
  width: 2.75rem;
  min-height: 44px;
  border: 0;
  background: transparent;
  color: #536753;
  font-size: 1.15rem;
}

.dark-theme .garden-add button {
  color: #b5c5b4;
}

.garden-add input:focus-visible,
.garden-add button:focus-visible {
  outline: 3px solid #c86d3e;
  outline-offset: 2px;
}
</style>
