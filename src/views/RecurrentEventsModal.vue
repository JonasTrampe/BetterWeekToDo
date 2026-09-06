<template>
  <div class="modal fade" id="RecurrentEventsModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <div class="d-flex">
            <h5 class="modal-title">{{ $t("ui.recurringTasks") }}</h5>

            <select
              class="form-select re-input w-auto mx-3"
              aria-label="Default select example"
              v-model="repeatingType"
            >
              <option value="all">{{ $t("ui.showAll") }}</option>
              <option value="3">{{ $t("todoDetails.daily") }}</option>
              <option value="2">{{ $t("todoDetails.weekly") }}</option>
              <option value="4">{{ $t("todoDetails.weekdays") }}</option>
              <option value="5">{{ $t("todoDetails.customWeekdays") }}</option>
              <option value="1">{{ $t("todoDetails.monthly") }}</option>
              <option value="6">{{ $t("todoDetails.daysOfMonth") }}</option>
              <option value="0">{{ $t("todoDetails.yearly") }}</option>
            </select>
          </div>
          <i class="bi-x close-modal" data-bs-dismiss="modal"></i>
        </div>
        <div class="modal-body">
          <button v-if="!showAddForm" type="button" class="btn add-recurring-toggle" @click="startAdd">
            <i class="bi-plus-lg"></i> <span>{{ $t("ui.newRecurringTask") }}</span>
          </button>

          <form v-else class="add-recurring" @submit.prevent="addRecurringTask">
            <div class="add-recurring-row">
              <input v-model="newText" type="text" class="form-control" :placeholder="$t('ui.newTask')" required />
              <button type="button" class="btn add-recurring-cancel" @click="cancelForm" :aria-label="$t('todoDetails.cancel')" :title="$t('todoDetails.cancel')">
                <i class="bi-x"></i>
              </button>
              <button type="submit" class="btn add-recurring-submit" :aria-label="$t('todoDetails.done')" :title="$t('todoDetails.done')">
                <i :class="editingId ? 'bi-check-lg' : 'bi-plus-lg'"></i>
              </button>
            </div>

            <div class="add-recurring-row add-recurring-row--secondary">
              <label class="opacity-50">{{ $t("ui.startDate") }}</label>
              <input type="date" class="form-control" v-model="newStartDate" required />
              <label class="opacity-50">{{ $t("ui.repeat") }}</label>
              <select class="form-select re-input" v-model="newType">
                <option value="3">{{ $t("todoDetails.daily") }}</option>
                <option value="2">{{ $t("todoDetails.weekly") }}</option>
                <option value="1">{{ $t("todoDetails.monthly") }}</option>
                <option value="0">{{ $t("todoDetails.yearly") }}</option>
              </select>
            </div>

            <!-- Daily -->
            <div v-if="newType == '3'" class="recurrence-pattern">
              <label class="radio-row">
                <input type="radio" value="every" v-model="dailyMode" />
                <span>{{ $t("ui.every") }}</span>
                <input type="number" min="1" class="form-control counter" v-model="newInterval" :disabled="dailyMode != 'every'" />
                <span>{{ $t("ui.days") }}</span>
              </label>
              <label class="radio-row">
                <input type="radio" value="weekday" v-model="dailyMode" />
                <span>{{ $t("ui.everyWeekday") }}</span>
              </label>
            </div>

            <!-- Weekly -->
            <div v-if="newType == '2'" class="recurrence-pattern">
              <div class="radio-row">
                <span>{{ $t("ui.every") }}</span>
                <input type="number" min="1" class="form-control counter" v-model="newInterval" />
                <span>{{ $t("ui.weeks") }}</span>
              </div>
              <div class="weekDays-selector weekDays-selector--buttons">
                <button type="button" v-for="(d, key) in newWeekdays" :key="key" class="weekday-btn" :class="{ active: d }" @click="newWeekdays[key] = !newWeekdays[key]">
                  {{ weekdayLabel(key) }}
                </button>
              </div>
            </div>

            <!-- Monthly -->
            <div v-if="newType == '1'" class="recurrence-pattern">
              <div class="radio-row">
                <span>{{ $t("ui.every") }}</span>
                <input type="number" min="1" class="form-control counter" v-model="newInterval" />
                <span>{{ $t("ui.months") }}</span>
              </div>
              <label class="radio-row">
                <input type="radio" value="weekday" v-model="monthlyMode" />
                <span>{{ $t("ui.the") }}</span>
                <select class="form-select re-input" v-model="monthlyNth" :disabled="monthlyMode != 'weekday'">
                  <option v-for="opt in nthOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </select>
                <select class="form-select re-input" v-model="monthlyWeekday" :disabled="monthlyMode != 'weekday'">
                  <option v-for="w in weekdayOptions" :key="w.value" :value="w.value">{{ w.label }}</option>
                </select>
              </label>
              <label class="radio-row">
                <input type="radio" value="day" v-model="monthlyMode" />
                <span>{{ $t("ui.recurOnDays") }}</span>
              </label>
              <div v-show="monthlyMode == 'day'" class="month-day-grid">
                <button
                  type="button"
                  v-for="day in 31"
                  :key="day"
                  class="month-day-btn"
                  :class="{ active: newMonthlyDays.includes(day) }"
                  @click="toggleMonthlyDay(day)"
                >{{ day }}</button>
                <button type="button" class="month-day-btn month-day-btn--last" :class="{ active: newMonthlyDays.includes(-1) }" @click="toggleMonthlyDay(-1)">
                  {{ $t("ui.lastDay") }}
                </button>
              </div>
            </div>

            <!-- Yearly -->
            <div v-if="newType == '0'" class="recurrence-pattern">
              <div class="radio-row">
                <span>{{ $t("ui.every") }}</span>
                <input type="number" min="1" class="form-control counter" v-model="newInterval" />
                <span>{{ $t("ui.years") }}</span>
              </div>
              <label class="radio-row">
                <input type="radio" value="date" v-model="yearlyMode" />
                <span>{{ $t("ui.onDate") }}</span>
              </label>
              <label class="radio-row">
                <input type="radio" value="weekday" v-model="yearlyMode" />
                <span>{{ $t("ui.the") }}</span>
                <select class="form-select re-input" v-model="yearlyNth" :disabled="yearlyMode != 'weekday'">
                  <option v-for="opt in nthOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </select>
                <select class="form-select re-input" v-model="yearlyWeekday" :disabled="yearlyMode != 'weekday'">
                  <option v-for="w in weekdayOptions" :key="w.value" :value="w.value">{{ w.label }}</option>
                </select>
                <span>{{ $t("ui.of") }}</span>
                <select class="form-select re-input" v-model="yearlyMonth" :disabled="yearlyMode != 'weekday'">
                  <option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
                </select>
              </label>
            </div>

            <div class="add-recurring-row add-recurring-row--secondary">
              <select class="form-select re-input" v-model="newOcurrencesType">
                <option value="">{{ $t("todoDetails.indefinitely") }}</option>
                <option value="ocurrences">{{ $t("todoDetails.occurrences") }}</option>
                <option value="untilDate">{{ $t("todoDetails.untilDate") }}</option>
              </select>
              <input v-if="newOcurrencesType == 'ocurrences'" type="number" min="1" class="form-control" v-model="newOcurrences" />
              <input v-if="newOcurrencesType == 'untilDate'" type="date" class="form-control" v-model="newUntilDate" />
            </div>
          </form>

          <table class="table table-hover">
            <thead>
              <tr>
                <th  class="recurrent-heading" scope="col">{{ $t("ui.task") }}</th>
                <th  class="recurrent-heading" scope="col">{{ $t("ui.Frecuency") }}</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="task in recurringTasks" :key="task.id">
                <td class="reccurent-items">{{ task.data.text }}</td>
                <td class="recurring-freq">{{ frecuency(task) }}</td>
                <td>
                  <i
                    class="bi-pencil mx-2"
                    :title="$t('ui.edit')"
                    @click="startEdit(task)"
                  ></i>
                  <i
                    class="bi-trash mx-2"
                    :title="$t('ui.remove')"
                    @click="removeRecurringTask(task.id)"
                    data-bs-dismiss="modal"
                  ></i>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <comfirm-modal
    :id="'removeReModal'"
    :title="$t('ui.removeRepeatingTask')"
    :text="$t('ui.repeatingTaskRemoveConfirm')"
    :ico="'bi-x-circle'"
    :okText="$t('ui.remove')"
    @on-ok="removeRepeatingTaskComfirmed"
    @on-cancel="removeRepeatingTaskCanceled"
  ></comfirm-modal>
</template>

<script>
import { Toast, Modal } from "bootstrap";
import { RRule, rrulestr } from "rrule";
import repeatingEventHelper from "../helpers/repeatingEvents.js";
import repeatingEventRepository from "../repositories/repeatingEventRepository";
import comfirmModal from "../components/comfirmModal.vue";
import dateTime from "../helpers/dateTime";

export default {
  name: "RecurrentEventsModal",
  components: {
    comfirmModal,
  },
  data() {
    return {
      index: 0,
      idToRemove: null,
      repeatingType: "all",
      showAddForm: false,
      editingId: null,
      newText: "",
      newType: "3",
      newStartDate: dateTime().format("YYYY-MM-DD"),
      newInterval: 1,
      newOcurrencesType: "",
      newOcurrences: 1,
      newUntilDate: null,
      newMonthlyDays: [],
      newWeekdays: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false },
      dailyMode: "every",
      monthlyMode: "day",
      monthlyNth: "1",
      monthlyWeekday: "0",
      yearlyMode: "date",
      yearlyNth: "1",
      yearlyWeekday: "0",
      yearlyMonth: "1",
    };
  },
  computed: {
    nthOptions() {
      return [
        { value: "1", label: this.$t("ui.first") },
        { value: "2", label: this.$t("ui.second") },
        { value: "3", label: this.$t("ui.third") },
        { value: "4", label: this.$t("ui.fourth") },
        { value: "-1", label: this.$t("ui.last") },
      ];
    },
    weekdayOptions() {
      return [0, 1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: this.moments().isoWeekday(n + 1).locale(this.language).format("dddd") }));
    },
    monthOptions() {
      return Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: this.moments().month(i).locale(this.language).format("MMMM") }));
    },
    recurringTasks() {
      return Object.values(this.$store.getters.repeatingEventList).filter((task) => this.repeatingType === "all" || this.repeatingType === task.type);
    },
    language() { return this.$store.getters.config.language; },
  },
  watch: {
    newStartDate(value) {
      if (this.editingId) return; // don't clobber values loaded for editing
      const startWeekday = dateTime(value, "YYYY-MM-DD").isoWeekday(); // 1=Mon..7=Sun
      const keys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
      this.newWeekdays = Object.fromEntries(keys.map((k, i) => [k, i + 1 === startWeekday]));
      this.newMonthlyDays = [dateTime(value, "YYYY-MM-DD").date()];
      this.yearlyMonth = String(dateTime(value, "YYYY-MM-DD").month() + 1);
    },
  },
  methods: {
    moments: function (date) {
      return dateTime(date);
    },
    weekdayLabel: function (key) {
      const order = { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 7 };
      return this.moments().isoWeekday(order[key]).locale(this.language).format("dd")[0];
    },
    toggleMonthlyDay: function (day) {
      const index = this.newMonthlyDays.indexOf(day);
      if (index === -1) this.newMonthlyDays.push(day);
      else this.newMonthlyDays.splice(index, 1);
    },
    weekdayRuleFromKey: function (key) {
      return { mon: RRule.MO, tue: RRule.TU, wed: RRule.WE, thu: RRule.TH, fri: RRule.FR, sat: RRule.SA, sun: RRule.SU }[key];
    },
    nthWeekdayRule: function (nth, weekday) {
      // weekday is ISO order: 0=Mon..6=Sun, matching weekdayOptions
      const byweekdayConst = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU][Number(weekday)];
      return byweekdayConst.nth(Number(nth));
    },
    startAdd: function () {
      this.resetForm();
      this.showAddForm = true;
    },
    startEdit: function (task) {
      this.editingId = task.id;
      this.newText = task.data.text;
      this.newType = String(task.type);
      this.newOcurrencesType = task.ocurrencesType || "";
      this.newMonthlyDays = [];
      this.newWeekdays = { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false };
      this.dailyMode = task.pattern == "weekday" ? "weekday" : "every";
      this.monthlyMode = task.pattern == "weekday" ? "weekday" : "day";
      this.yearlyMode = task.pattern == "weekday" ? "weekday" : "date";
      this.monthlyNth = task.patternNth ? String(task.patternNth) : "1";
      this.monthlyWeekday = task.patternWeekday != null ? String(task.patternWeekday) : "0";
      this.yearlyNth = task.patternNth ? String(task.patternNth) : "1";
      this.yearlyWeekday = task.patternWeekday != null ? String(task.patternWeekday) : "0";

      const rule = rrulestr(task.repeating_rule);
      this.newInterval = rule.options.interval || 1;
      if (rule.options.count) {
        this.newOcurrencesType = "ocurrences";
        this.newOcurrences = rule.options.count;
      } else if (rule.options.until) {
        this.newOcurrencesType = "untilDate";
        this.newUntilDate = dateTime(rule.options.until).format("YYYY-MM-DD");
      }
      if (task.type == 2 && rule.options.byweekday) {
        const keys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
        const active = rule.options.byweekday.map((w) => (typeof w === "number" ? w : w.weekday));
        this.newWeekdays = Object.fromEntries(keys.map((k, i) => [k, active.includes(i)]));
      }
      if (task.type == 1 && task.pattern != "weekday" && rule.options.bymonthday) {
        this.newMonthlyDays = [...rule.options.bymonthday];
      }
      if (task.type == 0) {
        this.yearlyMonth = rule.options.bymonth ? String(rule.options.bymonth[0]) : "1";
      }

      this.newStartDate = dateTime(task.start_date).format("YYYY-MM-DD");
      this.showAddForm = true;
    },
    cancelForm: function () {
      this.resetForm();
      this.showAddForm = false;
    },
    resetForm: function () {
      this.editingId = null;
      this.newText = "";
      this.newType = "3";
      this.newStartDate = dateTime().format("YYYY-MM-DD");
      this.newInterval = 1;
      this.newOcurrencesType = "";
      this.newOcurrences = 1;
      this.newUntilDate = null;
      this.newMonthlyDays = [];
      this.newWeekdays = { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false };
      this.dailyMode = "every";
      this.monthlyMode = "day";
      this.yearlyMode = "date";
    },
    addRecurringTask: function () {
      const text = this.newText.trim();
      if (!text) return;

      const ruleOptions = {
        freq: Number(this.newType),
        interval: this.newInterval,
        dtstart: dateTime.utc(this.newStartDate, "YYYY-MM-DD").toDate(),
      };

      if (this.newType == 3 && this.dailyMode == "weekday") {
        ruleOptions.freq = 2;
        ruleOptions.interval = 1;
        ruleOptions.byweekday = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR];
      }

      if (this.newType == 2) {
        ruleOptions.byweekday = Object.keys(this.newWeekdays)
          .filter((key) => this.newWeekdays[key])
          .map((key) => this.weekdayRuleFromKey(key));
        if (!ruleOptions.byweekday.length) delete ruleOptions.byweekday;
      }

      if (this.newType == 1) {
        if (this.monthlyMode == "weekday") {
          ruleOptions.byweekday = [this.nthWeekdayRule(this.monthlyNth, this.monthlyWeekday)];
        } else {
          ruleOptions.bymonthday = this.newMonthlyDays.length ? this.newMonthlyDays : [dateTime(this.newStartDate, "YYYY-MM-DD").date()];
        }
      }

      if (this.newType == 0) {
        if (this.yearlyMode == "weekday") {
          ruleOptions.byweekday = [this.nthWeekdayRule(this.yearlyNth, this.yearlyWeekday)];
          ruleOptions.bymonth = [Number(this.yearlyMonth)];
        } else {
          ruleOptions.bymonth = [dateTime(this.newStartDate, "YYYY-MM-DD").month() + 1];
          ruleOptions.bymonthday = [dateTime(this.newStartDate, "YYYY-MM-DD").date()];
        }
      }

      if (this.newOcurrencesType == "ocurrences") {
        ruleOptions.count = this.newOcurrences;
      } else if (this.newOcurrencesType == "untilDate") {
        ruleOptions.until = dateTime(this.newUntilDate).toDate();
      }

      const rule = new RRule(ruleOptions);
      const repeatingEventId = this.editingId || dateTime().format("x");
      const startDate = dateTime(this.newStartDate, "YYYY-MM-DD").format("YYYYMMDD");

      const todo_data = {
        text,
        checked: false,
        status: "todo",
        listId: startDate,
        desc: "",
        subTaskList: [],
        color: "none",
        priority: 0,
        tags: [],
        time: null,
        alarm: false,
        repeatingEvent: repeatingEventId,
      };

      const rule2 = rrulestr(rule.toString()); // Cloning the rule; original doesn't work with the library here
      const re_event = {
        start_date: rule.options.dtstart,
        repeating_rule: rule.toString(),
        type: this.newType,
        ocurrencesType: this.newOcurrencesType,
        data: todo_data,
        id: repeatingEventId,
        pattern:
          this.newType == 1
            ? this.monthlyMode
            : this.newType == 0
            ? this.yearlyMode
            : this.newType == 3
            ? this.dailyMode
            : null,
        patternNth: this.newType == 1 ? this.monthlyNth : this.newType == 0 ? this.yearlyNth : null,
        patternWeekday: this.newType == 1 ? this.monthlyWeekday : this.newType == 0 ? this.yearlyWeekday : null,
      };

      if (this.newOcurrencesType == "ocurrences") {
        re_event.end_date = dateTime(rule2.all().slice(-1)[0]).toDate();
      } else if (this.newOcurrencesType == "untilDate") {
        re_event.end_date = dateTime(rule.options.until).toDate();
      } else {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 15);
        re_event.end_date = date;
      }

      repeatingEventRepository.update(repeatingEventId, re_event);
      this.$store.commit("updateRepeatingEvent", { key: repeatingEventId, val: re_event });

      if (this.editingId) {
        // Rebuild the whole date cache so the edited rule's future occurrences are correct.
        this.$store.commit("resetRepeatingEventDateCache");
        this.$store.commit("loadRepeatingEventDateCache", this.$store.getters.repeatingEventList);
      } else {
        this.$store.commit("addRepeatingEventToDateCache", re_event);
      }
      Object.keys(this.$store.getters.todoLists).forEach((date) => {
        repeatingEventHelper.generateRepeatingEventsIntances(date, this);
      });

      this.resetForm();
      this.showAddForm = false;
    },
    nthLabel: function (nth) {
      return { "1": this.$t("ui.first"), "2": this.$t("ui.second"), "3": this.$t("ui.third"), "4": this.$t("ui.fourth"), "-1": this.$t("ui.last") }[String(nth)];
    },
    weekdayFullLabel: function (weekday) {
      // weekday is ISO order: 0=Mon..6=Sun, matching weekdayOptions
      return this.moments().isoWeekday(Number(weekday) + 1).locale(this.language).format("dddd");
    },
    frecuency: function (task) {
      switch (task.type) {
        case "0":
          if (task.pattern == "weekday") {
            return this.$t("todoDetails.yearly") + " / " + this.nthLabel(task.patternNth) + " " + this.weekdayFullLabel(task.patternWeekday) + " " + this.$t("ui.of") + " " + dateTime(task.start_date).locale(this.language).format("MMMM");
          }
          return this.$t("todoDetails.yearly") + " / " + dateTime(task.start_date).locale(this.language).format("MMM Do");
        case "1":
          if (task.pattern == "weekday") {
            return this.$t("todoDetails.monthly") + " / " + this.nthLabel(task.patternNth) + " " + this.weekdayFullLabel(task.patternWeekday);
          }
          return this.$t("todoDetails.monthly") + " / " + dateTime(task.start_date).locale(this.language).format("Do");
        case "2":
          return this.$t("todoDetails.weekly") + " / " + dateTime(task.start_date).locale(this.language).format("dddd");
        case "3":
          return task.pattern == "weekday" ? this.$t("todoDetails.weekdays") : this.$t("todoDetails.daily");
        case "4":
          return this.$t("todoDetails.weekdays");
        case "5":
          return this.$t("todoDetails.customWeekdays");
        case "6":
          return this.$t("todoDetails.daysOfMonth") + " / " + task.repeating_rule.split("BYMONTHDAY=")[1];
      }
    },
    removeRecurringTask: function (id) {
      this.idToRemove = id;
      let modal = new Modal(document.getElementById("removeReModal"), { backdrop: "static" });
      modal.show();
    },
    removeRepeatingTaskComfirmed: function () {
      repeatingEventRepository.remove(this.idToRemove);
      this.$store.commit("removeRepeatingEvent", this.idToRemove);
      Object.keys(this.$store.getters.todoLists).forEach((date) => {
        repeatingEventHelper.removeGeneratedRepeatingEvents(date, this);
      });
      this.$store.commit("resetRepeatingEventDateCache");
      this.$store.commit("loadRepeatingEventDateCache", this.$store.getters.repeatingEventList);
      let modal = new Modal(document.getElementById("RecurrentEventsModal"));
      modal.show();
      let toast = new Toast(document.getElementById("recurrentTaskRemoved"));
      toast.show();
    },
    removeRepeatingTaskCanceled: function () {
      let modal = new Modal(document.getElementById("RecurrentEventsModal"));
      modal.show();
    },
  },
};
</script>

<style scoped lang="scss">
.modal-dialog {
  max-width: 800px;
}

.modal-body {
  height: 400px;
  overflow: auto;
  margin-bottom: 20px;
}

.add-recurring {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #d8ddd0;
}

.dark-theme .add-recurring {
  border-bottom-color: #405443;
}

.add-recurring-row {
  display: flex;
  align-items: center;
  gap: .5rem;
  margin-bottom: .5rem;
}

.add-recurring-row--secondary {
  font-size: .85rem;
}

.add-recurring-row .form-control,
.add-recurring-row .form-select {
  flex: 1 1 auto;
  min-width: 0;
}

.add-recurring-submit {
  flex: 0 0 auto;
  display: inline-grid;
  place-items: center;
  width: 2.35rem;
  min-height: 2.35rem;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: #829582;
  color: #fff;
}

.add-recurring-submit:hover { background: #718670; }
.dark-theme .add-recurring-submit { background: #6f866f; }
.dark-theme .add-recurring-submit:hover { background: #7f947e; }

.add-recurring-cancel {
  flex: 0 0 auto;
  display: inline-grid;
  place-items: center;
  width: 2.35rem;
  min-height: 2.35rem;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #697869;
  font-size: 1.2rem;
}

.add-recurring-cancel:hover { background: rgba(197, 214, 193, .3); }
.dark-theme .add-recurring-cancel { color: #b5c5b4; }
.dark-theme .add-recurring-cancel:hover { background: rgba(64, 84, 67, .35); }

.add-recurring-toggle {
  display: flex;
  align-items: center;
  gap: .5rem;
  width: 100%;
  margin-bottom: 1rem;
  padding: .6rem .75rem;
  border: 1px dashed #c5d6c1;
  border-radius: 8px;
  background: transparent;
  color: #536753;
  font-size: .85rem;
}

.add-recurring-toggle:hover { background: rgba(197, 214, 193, .22); }
.dark-theme .add-recurring-toggle { border-color: #405443; color: #b5c5b4; }
.dark-theme .add-recurring-toggle:hover { background: rgba(64, 84, 67, .25); }

.bi-pencil {
  cursor: pointer;

  &:hover {
    color: black;
  }

  .dark-theme & {
    color: #babbbe;

    &:hover {
      color: white;
    }
  }
}

.counter {
  width: 4.5rem;
  flex: 0 0 auto;
}

.dark-theme .add-recurring .form-control,
.dark-theme .add-recurring .form-select {
  background-color: #1c2a20;
  border-color: #405443;
  color: #e3ebe0;
}

.recurrence-pattern {
  margin-bottom: .75rem;
  padding: .6rem .75rem;
  border-radius: 8px;
  background: rgba(197, 214, 193, .18);
}

.dark-theme .recurrence-pattern {
  background: rgba(64, 84, 67, .25);
}

.radio-row {
  display: flex;
  align-items: center;
  gap: .5rem;
  margin-bottom: .5rem;
  font-size: .85rem;
  cursor: pointer;
}

.radio-row:last-child {
  margin-bottom: 0;
}

.radio-row input[type="radio"] {
  flex: 0 0 auto;
  accent-color: #829582;
}

.radio-row .form-select {
  flex: 1 1 auto;
  min-width: 0;
  width: auto;
}

.weekDays-selector {
  display: flex;
  justify-content: center;
  gap: .3rem;
  margin-bottom: 0;
}

.weekday-btn {
  border: 0;
  border-radius: 3px;
  background: #eaecef;
  height: 28px;
  min-width: 28px;
  padding: 0 .3rem;
  text-align: center;
  cursor: pointer;
  font-size: 12px;
  text-transform: uppercase;
  color: #334235;
}

.dark-theme .weekday-btn {
  background: #1c2a20;
  color: #e3ebe0;
}

.weekday-btn.active {
  background: #829582;
  color: #ffffff;
}

.dark-theme .weekday-btn.active {
  background: #6f866f;
}

.month-day-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: .3rem;
  margin-top: .4rem;
}

.month-day-btn {
  border: 0;
  border-radius: 3px;
  background: #eaecef;
  height: 28px;
  text-align: center;
  cursor: pointer;
  font-size: 12px;
  color: #334235;
}

.dark-theme .month-day-btn {
  background: #1c2a20;
  color: #e3ebe0;
}

.month-day-btn.active {
  background: #829582;
  color: #ffffff;
}

.dark-theme .month-day-btn.active {
  background: #6f866f;
}

.month-day-btn--last {
  grid-column: span 3;
}

.table {
  --bs-table-hover-bg: #f4f4f4;
  color: #212529;
}

.dark-theme .table {
  --bs-table-bg: #21262d;
  --bs-table-striped-bg: #2c3034;
  --bs-table-striped-color: #fff;
  --bs-table-active-bg: #373b3e;
  --bs-table-active-color: #fff;
  --bs-table-hover-bg: #323539;
  --bs-table-hover-color: #fff;
  color: #fff;
  border-color: #373b3e;
}

.bi-trash {
  cursor: pointer;

  &:hover {
    color: black;
  }

  .dark-theme & {
    color: #babbbe;

    &:hover {
      color: white;
    }
  }
}
.recurrent-heading{
  .dark-theme & {
       color:rgb(222, 222, 222);
  }
 
}

.reccurent-items , .recurring-freq{
    .dark-theme & {
    color: #babbbe;
  }
}

</style>
