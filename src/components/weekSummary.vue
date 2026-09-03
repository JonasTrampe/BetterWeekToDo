<template>
  <section class="week-summary" aria-label="Weekly task summary">
    <div class="summary-heading">
      <span class="summary-title">{{ viewMode === "day" ? "Today" : "This week" }}</span>
      <span class="summary-counts">{{ summary.todo }} to do · {{ summary.inProgress }} in progress · {{ summary.done }} done</span>
    </div>
    <div class="view-switch" role="group" aria-label="Calendar view">
      <button type="button" :class="{ active: viewMode === 'day' }" :aria-pressed="viewMode === 'day'" @click="$emit('change-view', 'day')">Day</button>
      <button type="button" :class="{ active: viewMode === 'week' }" :aria-pressed="viewMode === 'week'" @click="$emit('change-view', 'week')">Week</button>
    </div>
  </section>
</template>

<script>
import { summarizeWeek } from "../helpers/weekSummary";

export default {
  props: { dates: { type: Array, required: true }, viewMode: { type: String, default: "week" } },
  computed: {
    summary() {
      return summarizeWeek(this.$store.getters.todoLists, this.dates);
    },
  },
};
</script>

<style scoped>
.week-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.4rem 1.25rem;
  font-size: 0.8rem;
  color: #606770;
  border-bottom: 1px solid #eaecef;
}
.summary-heading { display: flex; align-items: baseline; gap: 1rem; }
.summary-counts { color: inherit; }
.view-switch { display: inline-flex; gap: 0.25rem; }
.view-switch button { border: 1px solid currentColor; border-radius: 999px; background: transparent; color: inherit; padding: 0.25rem 0.7rem; font: inherit; cursor: pointer; }
.view-switch button.active { background: #243b3a; color: #fff; }
.view-switch button:focus-visible { outline: 3px solid #c86b4a; outline-offset: 2px; }
.summary-title { font-weight: 600; color: inherit; }
.dark-theme .week-summary { border-color: #3d4d43; color: #c9d8cc; }
</style>
