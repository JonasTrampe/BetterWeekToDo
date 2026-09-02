<template>
  <div class="modal fade" id="monthOverviewModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <button class="btn btn-sm" type="button" @click="changeMonth(-1)" aria-label="Previous month"><i class="bi-chevron-left"></i></button>
          <h5 class="modal-title">{{ month.format("MMMM YYYY") }}</h5>
          <button class="btn btn-sm" type="button" @click="changeMonth(1)" aria-label="Next month"><i class="bi-chevron-right"></i></button>
        </div>
        <div class="modal-body">
          <div class="month-grid month-weekdays">
            <span v-for="day in weekdayNames" :key="day">{{ day }}</span>
          </div>
          <div class="month-grid">
            <span v-for="blank in leadingDays" :key="`blank-${blank}`"></span>
            <button v-for="date in days" :key="date" type="button" class="month-day" :class="{ today: isToday(date) }"
              @click="selectDate(date)">{{ dateTime(date).date() }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dateTime from "../helpers/dateTime";
import { Modal } from "bootstrap";

export default {
  name: "monthOverviewModal",
  props: { selectedDate: { required: true, type: String } },
  emits: ["changeDate"],
  data() { return { month: dateTime() }; },
  computed: {
    weekdayNames() { return dateTime.weekdaysShort(true); },
    leadingDays() { return (this.month.clone().startOf("month").day() + 6) % 7; },
    days() {
      return Array.from({ length: this.month.daysInMonth() }, (_, index) =>
        this.month.clone().date(index + 1).format("YYYYMMDD")
      );
    },
  },
  watch: {
    selectedDate(value) { if (value) this.month = dateTime(value, "YYYYMMDD"); },
  },
  methods: {
    dateTime,
    changeMonth(amount) { this.month = this.month.clone().add(amount, "month"); },
    isToday(date) { return date === dateTime().format("YYYYMMDD"); },
    selectDate(date) {
      this.$emit("changeDate", date);
      Modal.getInstance(document.getElementById("monthOverviewModal")).hide();
    },
  },
};
</script>

<style scoped>
.modal-dialog { max-width: 360px; }
.month-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center; }
.month-weekdays { font-size: .75rem; opacity: .7; margin-bottom: 8px; }
.month-day { border: 0; border-radius: 50%; background: transparent; aspect-ratio: 1; }
.month-day:hover { background: #eaecef; }
.month-day.today { background: #6f42c1; color: white; }
.dark-theme .month-day:hover { background: #30363d; }
</style>
