<template>
  <section class="week-summary" aria-label="Weekly task summary">
    <span class="summary-title">This week</span>
    <span>{{ summary.todo }} to do</span>
    <span>{{ summary.inProgress }} in progress</span>
    <span>{{ summary.done }} done</span>
  </section>
</template>

<script>
import { summarizeWeek } from "../helpers/weekSummary";

export default {
  props: { dates: { type: Array, required: true } },
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
  gap: 1rem;
  padding: 0.4rem 1.25rem;
  font-size: 0.8rem;
  color: #606770;
  border-bottom: 1px solid #eaecef;
}
.summary-title { font-weight: 600; color: inherit; }
.dark-theme .week-summary { border-color: #30363d; color: #b1bac4; }
</style>
