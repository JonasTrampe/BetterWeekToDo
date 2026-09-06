<template>
  <div class="plot-section">
    <div
      class="plot-section-drop-header"
      :class="{ 'is-drag-over': headerDragOver }"
      @dragenter.prevent="headerDragOver = true"
      @dragleave="headerDragOver = false"
      @dragover.prevent
      @drop="dropOnHeader"
    >
      <garden-plot-header class="plot-section-header" :icon="icon" :label="label" />
    </div>
    <ul class="plot-section-list" @dragover.prevent @drop="$emit('drop', $event)">
      <li v-for="entry in tasks" :key="entry.index" draggable="true" @dragstart="$emit('task-dragstart', $event, entry)">
        <garden-task-row :task="entry.task" :index="entry.index" :source-id="sourceId" />
      </li>
      <li v-if="!tasks.length" class="plot-section-empty" aria-hidden="true">—</li>
    </ul>
    <form v-if="addEnabled" class="plot-section-add" @submit.prevent="submitAdd">
      <label :for="inputId" class="visually-hidden">{{ addPlaceholder }}</label>
      <input :id="inputId" ref="addInput" v-model="draft" type="text" :placeholder="addPlaceholder" />
      <button type="submit" :disabled="!draft.trim()" aria-label="Add task"><i class="bi-plus" aria-hidden="true"></i></button>
    </form>
  </div>
</template>

<script>
import gardenPlotHeader from "./GardenPlotHeader";
import gardenTaskRow from "./GardenTaskRow";

export default {
  name: "GardenPlotSection",
  components: { gardenPlotHeader, gardenTaskRow },
  props: {
    icon: { type: String, default: null },
    label: { type: String, required: true },
    tasks: { type: Array, default: () => [] },
    sourceId: { type: String, required: true },
    addPlaceholder: { type: String, default: "Add a task…" },
    addEnabled: { type: Boolean, default: true },
  },
  emits: ["add", "drop", "task-dragstart"],
  data() {
    return {
      draft: "",
      inputId: `plot-section-add-${Math.random().toString(36).slice(2)}`,
      headerDragOver: false,
    };
  },
  methods: {
    submitAdd() {
      const text = this.draft.trim();
      if (!text) return;
      this.$emit("add", text);
      this.draft = "";
    },
    dropOnHeader(event) {
      this.headerDragOver = false;
      this.$emit("drop", event);
    },
    focusInput() {
      this.$refs.addInput?.focus();
    },
  },
};
</script>

<style scoped>
.plot-section {
  padding: 0.6rem 0.6rem 0.5rem;
  border-bottom: 1px solid #e4e0d7;
}

.plot-section:last-child {
  border-bottom: 0;
}

.dark-theme .plot-section {
  border-bottom-color: #384c3d;
}

.plot-section-header {
  margin-bottom: 0.3rem;
}

.plot-section-drop-header {
  border-radius: 5px;
}

.plot-section-drop-header.is-drag-over {
  background: rgba(130, 149, 130, 0.14);
  outline: 1px dashed #829582;
}

.dark-theme .plot-section-drop-header.is-drag-over {
  background: rgba(111, 134, 111, 0.25);
  outline-color: #9fb39d;
}

.plot-section-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.plot-section-list li {
  display: grid;
  grid-template-columns: 1.1rem minmax(0, 1fr) 3.2rem;
  gap: 0.35rem;
  align-items: start;
  padding-block: 0.35rem;
  font-size: 0.78rem;
  cursor: grab;
}

.plot-section-list li:active {
  cursor: grabbing;
}

.plot-section-empty {
  display: block;
  padding-block: 0.3rem;
  color: #a5aea3;
  font-size: 0.74rem;
  text-align: center;
  cursor: default;
}

.plot-section-add {
  display: flex;
  margin-top: 0.15rem;
}

.plot-section-add input {
  flex: 1 1 auto;
  min-width: 0;
  border: 0;
  background: transparent;
  padding: 0.3rem 0.3rem 0.3rem 1.55rem;
  font-size: 0.76rem;
  color: #263a2d;
}

.dark-theme .plot-section-add input {
  color: #e3ebe0;
}

.plot-section-add input::placeholder {
  color: #8a998a;
}

.dark-theme .plot-section-add input::placeholder {
  color: #7f947e;
}

.plot-section-add button {
  flex: 0 0 auto;
  width: 1.8rem;
  min-height: 1.8rem;
  border: 0;
  background: transparent;
  color: #536753;
  font-size: 0.9rem;
}

.dark-theme .plot-section-add button {
  color: #b5c5b4;
}

.plot-section-add input:focus-visible,
.plot-section-add button:focus-visible {
  outline: 3px solid #c86d3e;
  outline-offset: 1px;
}
</style>
