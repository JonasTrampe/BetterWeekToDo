<template>
  <header class="plot-header">
    <div class="plot-header-title">
      <i v-if="icon" class="plot-header-icon" :class="icon" aria-hidden="true"></i>
      <h3 class="plot-header-label" @dblclick="$emit('label-dblclick')">
        <slot name="label">{{ label }}</slot>
      </h3>
    </div>
    <p v-if="meta || reserveMeta" class="plot-header-meta" :class="{ 'plot-header-meta-placeholder': !meta }">{{ meta || "\u00a0" }}</p>
    <div v-if="$slots.actions" class="plot-header-actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script>
export default {
  name: "GardenPlotHeader",
  props: {
    icon: { type: String, default: null },
    label: { type: String, default: "" },
    meta: { type: String, default: null },
    reserveMeta: { type: Boolean, default: false },
  },
  emits: ["label-dblclick"],
};
</script>

<style scoped>
.plot-header {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.15rem;
}

.plot-header-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 1.3em;
}

.plot-header-icon {
  font-size: 1.05rem;
  color: #c86d3e;
  flex: 0 0 auto;
}

.plot-header-label {
  margin: 0;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 0.78rem;
  font-weight: 400;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #263a2d;
  line-height: 1.2;
}

.dark-theme .plot-header-label { color: #e3ebe0; }

.plot-header-meta {
  margin: 0;
  font-size: 0.72rem;
  color: #657466;
}

.dark-theme .plot-header-meta { color: #b5c5b4; }

.plot-header-actions {
  position: absolute;
  top: -0.15rem;
  right: -0.15rem;
  display: flex;
  align-items: center;
}
</style>
