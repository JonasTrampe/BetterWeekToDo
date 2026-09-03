<template>
  <input class="hidden-input-for-focus" type="text" />
  <div v-show="compatible" id="app-container" class="app-container" :class="{ 'dark-theme': darkTheme }">
    <div class="hidden-mobile app-body" :style="{ zoom: `${zoom}%` }">
      <side-bar @change-date="setSelectedDate" @open-account="showAccountModal"></side-bar>

      <div class="h-100 d-flex flex-column">
        <week-summary v-if="showCalendar" :dates="viewMode === 'day' ? [selected_date] : weekDates" :view-mode="viewMode" @change-view="viewMode = $event"></week-summary>
        <div
          v-show="showCalendar"
          class="todo-lists-container"
          :style="resizableStyle"
          ref="calendarContainer"
          :class="{
            'full-screen': !showCustomList,
            'hidden-lists-container': hideTopListContainer,
            'full-screen-divider': hideBottomListContainer,
          }"
        >
          <i class="bi-chevron-left slider-btn" ref="weekLeft" @click="weekMoveLeft"></i>
          <div class="todo-slider weekdays" ref="weekListContainer">
            <to-do-list
              v-for="date in visibleDates"
              :key="date"
              :id="date"
              :showCustomList="showCustomList"
              :singleDay="viewMode === 'day'"
              @todo-list-mounted="todoListMounted"
            >
            </to-do-list>
          </div>
          <i class="bi-chevron-right slider-btn" ref="weekRight" @click="weekMoveRight"></i>
        </div>

        <div
          v-show="showCustomList && showCalendar"
          class="main-horizontal-divider"
          id="resizer"
          :class="mainDividerPositionClass"
          @mousedown="resizerMouseDownHandler"
          @dblclick="resizerDblClick"
        >
          <div class="inner-main-horizontal-divider"></div>
          <div class="divider-icons-container">
            <i
              class="bi-chevron-up move-to-center-up divider-icons"
              @click="setDividerPosition(1)"
              :title="$t('ui.restorePanel')"
            ></i>
            <i
              class="bi-chevron-up move-to-corner-up divider-icons"
              @click="setDividerPosition(2)"
              :title="$t('ui.maximizeListPanel')"
            ></i>
            <i
              class="bi-chevron-down move-to-center-down divider-icons"
              @click="setDividerPosition(1)"
              :title="$t('ui.restorePanel')"
            ></i>
            <i
              class="bi-chevron-down move-to-corner-down divider-icons"
              @click="setDividerPosition(0)"
              :title="$t('ui.maximizeCalendarPanel')"
            ></i>
          </div>
        </div>

        <div
          v-show="showCustomList"
          class="todo-lists-container"
          :class="{
            'full-screen': !showCalendar,
            'flex-grow-1': showCalendar,
            'hidden-lists-container': hideBottomListContainer,
          }"
        >
          <i
            class="bi-chevron-left slider-btn"
            @click="customMoveLeft"
            :style="{
              visibility: cTodoList.length > customColumns ? 'visible' : 'hidden',
            }"
          ></i>
          <div class="todo-slider slides" ref="customListContainer">
            <to-do-list
              v-for="(cTodoList, index) in cTodoList"
              :key="cTodoList.listId"
              :id="cTodoList.listId"
              :customTodoList="true"
              :cTodoListIndex="index"
              :showCustomList="showCustomList"
              @todo-list-mounted="todoListMounted"
            ></to-do-list>
          </div>
          <i
            class="bi-chevron-right slider-btn"
            @click="customMoveRight"
            :style="{
              visibility: cTodoList.length > customColumns ? 'visible' : 'hidden',
            }"
          ></i>
        </div>

        <div v-show="!showCustomList && !showCalendar" style="margin: auto">
          <img v-if="darkTheme" src="/img/WeekToDoDarkLogo.webp" />
          <img v-else src="/img/WeekToDoLightLogo.webp" />
        </div>
      </div>

      <remove-custom-list></remove-custom-list>
      <config-modal @change-columns="weekResetScroll" :configProp="$store.getters.config"></config-modal>
      <clear-data-modal></clear-data-modal>
      <clear-list-modal></clear-list-modal>
      <about-modal></about-modal>
      <month-overview-modal :selected-date="selected_date" @change-date="setSelectedDate"></month-overview-modal>
      <account-modal ref="accountModal"></account-modal>
      <tips-modal></tips-modal>
      <to-do-modal :selectedTodo="selectedTodo"></to-do-modal>
      <active-to-do :activeTodo="activeTodo"> </active-to-do>
      <recurrent-events-modal></recurrent-events-modal>
      <importing-modal :id="'importingModal'" :text="$t('settings.importing')"></importing-modal>
      <importing-modal :id="'exportingModal'" :text="$t('settings.exporting')"></importing-modal>

      <reorder-custom-lists-modal @reset-custom-list="resetCustomList"></reorder-custom-lists-modal>
    </div>
    <div class="mobile d-flex flex-column justify-content-center align-items-center">
      <i class="bi-exclamation-diamond mb-4" style="font-size: 100px"></i>
      <h3 style="text-align: center">{{ $t("ui.mobileWarning") }}</h3>
    </div>

    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 1056">
    </div>
  </div>
  <div v-if="!compatible" class="compatible d-flex flex-column justify-content-center align-items-center p-5">
    <i class="bi-exclamation-diamond mb-4" style="font-size: 100px"></i>
    <h3 style="text-align: center">{{ $t("ui.compatible") }}</h3>
  </div>
</template>

<script>
import toDoList from "./components/toDoList";
import dateTime from "./helpers/dateTime";
import sideBar from "./components/layout/sideBar";
import customToDoListIdsRepository from "./repositories/customToDoListIdsRepository";
import removeCustomList from "./components/comfirmModals/removeCustomList";
import configModal from "./views/configModal";
import configRepository from "./repositories/configRepository";
import aboutModal from "./views/aboutModal";
import accountModal from "./views/accountModal";
import monthOverviewModal from "./views/monthOverviewModal";
import weekSummary from "./components/weekSummary";
import toDoModal from "./views/toDoModal/toDoModal";
import tipsModal from "./views/tipsModal";
import migrations from "./migrations/migrations";
import version_json from "../public/version.json";
import notifications from "./helpers/notifications";
import clearDataModal from "./components/comfirmModals/clearDataModal.vue";
import clearListModal from "./components/comfirmModals/clearListModal.vue";
import importingModal from "./views/importingModal.vue";
import RecurrentEventsModal from "./views/RecurrentEventsModal.vue";
import repeatingEventRepository from "./repositories/repeatingEventRepository";
import toDoListRepository from "./repositories/toDoListRepository";
import ReorderCustomListsModal from "./views/ReorderCustomListsModal.vue";
import activeToDo from "./components/activeToDo.vue";
import tasksHelper from "./helpers/tasksHelper";

export default {
  name: "App",
  components: {
    configModal,
    toDoList,
    sideBar,
    removeCustomList,
    aboutModal,
    accountModal,
    monthOverviewModal,
    weekSummary,
    tipsModal,
    toDoModal,
    clearDataModal,
    RecurrentEventsModal,
    importingModal,
    ReorderCustomListsModal,
    clearListModal,
    activeToDo,
  },
  data() {
    return {
      selected_date: null,
      cTodoList: this.$store.getters.cTodoListIds,
      calendarHeight: "calc(50% - 50px)",
      initialLoadCompleted: false,
      initialListToLoad: 0,
      initialListLoaded: 0,
      systemPrefersDark: false,
      systemThemeQuery: null,
      viewMode: "week",
    };
  },
  beforeCreate() {
    let config = configRepository.load();
    if (version_json.version != config.version) {
      migrations.migrate();
    }

    this.$store.commit("loadCustomTodoListsIds", customToDoListIdsRepository.load());
    this.$store.commit("loadConfig", configRepository.load());
    this.$i18n.locale = this.$store.getters.config.language;

    this.$store.dispatch("loadAllRepeatingEvent").then(
      function () {
        let totalDaysCount = parseInt(this.$store.getters.config.columns) + 2;
        let totalCustomListCount = this.$store.getters.cTodoListIds.length;
        this.initialListToLoad = totalDaysCount + totalCustomListCount;
        this.deleteOldRepeatingEvents();
        this.selected_date = dateTime().format("YYYYMMDD");
        this.$nextTick(() => {
          this.weekResetScroll();
        });
        this.$store.commit("loadRepeatingEventDateCache", this.$store.getters.repeatingEventList);
      }.bind(this)
    );
  },
  mounted() {
    this.checksOnLoadApp();
    this.$refs.weekListContainer.scrollLeft = this.todoListWidth();
    this.calendarHeight = this.$store.getters.config.calendarHeight;
    window.addEventListener("resize", this.weekResetScroll);
    this.systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    this.systemThemeQuery.addEventListener("change", this.updateSystemTheme);
    this.systemPrefersDark = this.systemThemeQuery.matches;
    const resetToken = new URLSearchParams(window.location.hash.slice(1)).get("reset-password");
    if (resetToken) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
      this.$nextTick(() => this.$refs.accountModal.openPasswordReset(resetToken));
    }
    if (this.$store.getters.config.importing) {
      this.$store.commit("updateConfig", { val: false, key: "importing" });
      configRepository.update(this.$store.getters.config);
    }

    this.resetAppOnDayChange();
  },
  methods: {
    updateSystemTheme: function (event) {
      this.systemPrefersDark = event.matches;
    },
    weekMoveLeft: function () {
      this.selected_date = dateTime(this.selected_date).subtract(1, "d").format("YYYYMMDD");
      this.$refs.weekListContainer.scrollLeft = this.todoListWidth() * 2;
      this.$refs.weekListContainer.scroll({
        left: this.$refs.weekListContainer.scrollLeft - this.todoListWidth(),
        top: 0,
        behavior: "smooth",
      });
    },
    weekMoveRight: function () {
      this.selected_date = dateTime(this.selected_date).add(1, "d").format("YYYYMMDD");
      this.$refs.weekListContainer.scrollLeft = 0;
      this.$refs.weekListContainer.scroll({
        left: this.$refs.weekListContainer.scrollLeft + this.todoListWidth(),
        top: 0,
        behavior: "smooth",
      });
    },
    deleteOldRepeatingEvents: function () {
      for (const event of Object.entries(this.$store.getters.repeatingEventList)) {
        if (dateTime(event[1].end_date).isBefore(dateTime())) {
          repeatingEventRepository.remove(event[0]);
          this.$store.commit("removeRepeatingEvent", event[0]);
        }
      }
    },
    weekResetScroll: function () {
      if (this.$refs.weekListContainer) this.$refs.weekListContainer.scrollLeft = this.viewMode === "day" ? 0 : this.todoListWidth();
    },
    customMoveRight: function () {
      this.$refs.customListContainer.scrollLeft =
        this.$refs.customListContainer.scrollLeft + this.customTodoListWidth() - 13;
    },
    customMoveLeft: function () {
      this.$refs.customListContainer.scrollLeft = this.$refs.customListContainer.scrollLeft - this.customTodoListWidth();
    },
    resetCustomList: function () {
      this.$nextTick(function () {
        this.$refs.customListContainer.scrollLeft = 0;
      });
    },
    todoListWidth: function () {
      return this.$refs.weekListContainer.clientWidth / this.columns;
    },
    customTodoListWidth: function () {
      return this.$refs.customListContainer.clientWidth / this.customColumns;
    },
    setSelectedDate: function (date) {
      this.selected_date = date;
      this.$nextTick(function () {
        document
          .getElementById("list" + date)
          .getElementsByClassName("new-todo-input")[0]
          .focus();
      });
    },
    showAccountModal: function () {
      this.$refs.accountModal.open();
    },
    compatible: function () {
      return window.IndexedDB;
    },
    resizerDblClick: function () {
      if (this.$store.getters.config.mainDividerPosition != 1) return;

      this.calendarHeight = "calc(50% - 50px)";
      this.$store.commit("updateConfig", {
        val: this.calendarHeight,
        key: "calendarHeight",
      });
      configRepository.update(this.$store.getters.config);
    },
    resizerMouseDownHandler: function (e) {
      if (this.$store.getters.config.mainDividerPosition != 1) return;

      this.resizerY = e.clientY - 50;
      document.addEventListener("mousemove", this.resizerMouseMoveHandler);
      document.addEventListener("mouseup", this.resizerMouseUpHandler);
    },
    resizerMouseMoveHandler: function (e) {
      this.calendarHeight = `${((e.clientY - 50) * 100) / this.zoom}px`;
    },
    resizerMouseUpHandler: function () {
      document.removeEventListener("mousemove", this.resizerMouseMoveHandler);
      document.removeEventListener("mouseup", this.resizerMouseUpHandler);
      this.$store.commit("updateConfig", {
        val: this.calendarHeight,
        key: "calendarHeight",
      });
      configRepository.update(this.$store.getters.config);
    },
    refreshTodayNotifications: function () {
      notifications.refreshDayNotifications(this, dateTime().format("YYYYMMDD"));
    },
    todoListMounted: function () {
      this.methodsAfterInitialLoad();
    },
    methodsAfterInitialLoad: function () {
      if (!this.initialLoadCompleted) {
        this.initialListLoaded++;
        if (this.initialListLoaded == this.initialListToLoad) {
          this.initialLoadCompleted = true;
          if (this.$store.getters.config.moveOldTasks) {
            this.moveOldTasksToToday().then(() => {
              this.refreshTodayNotifications();
              this.$store.commit("updateConfig", { val: dateTime().format("YYYYMMDD"), key: "lastDayOpened" });
              configRepository.update(this.$store.getters.config);
            });
          } else {
            this.refreshTodayNotifications();
            this.$store.commit("updateConfig", { val: dateTime().format("YYYYMMDD"), key: "lastDayOpened" });
            configRepository.update(this.$store.getters.config);
          }
        }
      }
    },
    resetAppOnDayChange: function () {
      var x = new dateTime();
      var y = new dateTime().add(1, "d").startOf("date");
      var duration = dateTime.duration(y.diff(x)).asMilliseconds();

      setTimeout(
        function () {
          this.refreshTodayNotifications();
          this.resetAppOnDayChange();
        }.bind(this),
        duration
      );
    },
    moveOldTasksToToday: async function () {
      var promise = new Promise((resolve) => {
        var todayListId = dateTime().format("YYYYMMDD");
        let daysBefore = dateTime().diff(dateTime(this.$store.getters.config.lastDayOpened), "days");
        if (daysBefore == 0) daysBefore = 7;
        for (let i = 1; i <= daysBefore; i++) {
          let listId = dateTime().subtract(i, "d").format("YYYYMMDD");
          this.$store.dispatch("loadTodoLists", listId).then(() => {
            this.$store.commit("moveUndoneItems", { origenId: listId, destinyId: todayListId });
            toDoListRepository.update(listId, this.$store.getters.todoLists[listId]);
            if (this.$store.getters.config.autoReorderTasks) {
              toDoListRepository.update(
                todayListId,
                tasksHelper.reorderTasksList(this.$store.getters.todoLists[todayListId])
              );
            } else {
              toDoListRepository.update(todayListId, this.$store.getters.todoLists[todayListId]);
            }
            if (i == daysBefore) {
              resolve("done!");
            }
          });
        }
      });
      return promise;
    },
    setDividerPosition: function (position) {
      this.$nextTick(function () {
        document.getElementById("app-container").classList.add("scrolling");
        setTimeout(() => {
          document.getElementById("app-container").classList.remove("scrolling");
        }, 400);
        this.$store.commit("updateConfig", { val: position, key: "mainDividerPosition" });
        configRepository.update(this.$store.getters.config);
      });
    },
    checkVersion: function () {
      if (version_json.version != this.$store.getters.config.version) {
        this.$store.commit("updateConfig", { val: version_json.version, key: "version" });
        configRepository.update(this.$store.getters.config);
      }
    },
    checksOnLoadApp: function () {
      this.checkVersion();
    },
  },
  computed: {
    dates_array: function () {
      if (!this.selected_date) return [];
      if (this.workweekOnly) {
        const dates = [];
        let date = dateTime(this.selected_date);
        while (date.day() === 0 || date.day() === 6) date = date.add(1, "d");
        dates.push(date.clone().subtract(1, "weekday").format("YYYYMMDD"));
        for (let i = 0; i < this.columns; i++) {
          dates.push(date.clone().add(i, "weekday").format("YYYYMMDD"));
        }
        dates.push(date.clone().add(this.columns, "weekday").format("YYYYMMDD"));
        this.$store.commit("updateSelectedDates", dates);
        return dates;
      }
      var dates_array = [dateTime(this.selected_date).subtract(1, "d").format("YYYYMMDD"), this.selected_date];

      for (let i = 1; i < this.columns; i++) {
        dates_array.push(dateTime(this.selected_date).add(i, "d").format("YYYYMMDD"));
      }

      if (this.$store.getters.config.startCalendarYesterday) {
        dates_array.unshift(dateTime(this.selected_date).subtract(2, "d").format("YYYYMMDD"));
      } else {
        dates_array.push(dateTime(this.selected_date).add(this.columns, "d").format("YYYYMMDD"));
      }

      this.$store.commit("updateSelectedDates", dates_array);
      return dates_array;
    },
    weekDates: function () {
      // The outer adjacent days are present solely for the slider animation.
      return this.dates_array.slice(1, -1);
    },
    visibleDates: function () {
      return this.viewMode === "day" ? [this.selected_date] : this.dates_array;
    },
    showCustomList: function () {
      return this.$store.getters.config.customList;
    },
    showCalendar: function () {
      return this.$store.getters.config.calendar;
    },
    columns: function () {
      return this.$store.getters.config.columns;
    },
    customColumns: function () {
      return this.$store.getters.config.customColumns;
    },
    zoom: function () {
      return this.$store.getters.config.zoom;
    },
    darkTheme: function () {
      const mode = this.$store.getters.config.themeMode;
      if (mode === "system") return this.systemPrefersDark;
      return mode ? mode === "dark" : this.$store.getters.config.darkTheme;
    },
    workweekOnly: function () {
      return this.$store.getters.config.workweekOnly;
    },
    resizableStyle: function () {
      if (this.showCalendar && this.showCustomList) {
        return { height: this.calendarHeight };
      } else {
        return {};
      }
    },
    selectedTodo: function () {
      if (this.$store.getters.actions.selectedTodo) {
        return this.$store.getters.actions.selectedTodo;
      }
      return null;
    },
    activeTodo: function () {
      if (this.$store.getters.activeTodo) {
        return this.$store.getters.activeTodo;
      }
      return null;
    },
    mainDividerPositionClass: function () {
      if (this.$store.getters.config.mainDividerPosition == 0) {
        return "on-bottom";
      } else if (this.$store.getters.config.mainDividerPosition == 1) {
        return "on-center";
      } else {
        return "on-top";
      }
    },
    hideTopListContainer: function () {
      if (!this.$store.getters.config.customList || !this.$store.getters.config.calendar) return false;

      return this.$store.getters.config.mainDividerPosition == 2 ? true : false;
    },
    hideBottomListContainer: function () {
      if (!this.$store.getters.config.customList || !this.$store.getters.config.calendar) return false;

      return this.$store.getters.config.mainDividerPosition == 0 ? true : false;
    },
  },
};
</script>

<style lang="scss">
@use "/src/assets/style/globalVars.scss" as *;

body {
  line-height: unset !important;
}

.todo-lists-container {
  display: flex;
  overflow: auto;
  min-height: 5px;
  height: 5px;
  /* Height is user-controlled by the divider; avoid animating layout on drag. */
  margin-top: 20px;
  margin-bottom: 25px;
  // margin-bottom: 5px;
}

.slider-btn {
  padding: 3px;
  font-size: 2rem;
  align-self: center;
  flex-grow: 0;
  margin-left: 6px;
  margin-right: 6px;
  cursor: pointer;
  transition: 0.4s cubic-bezier(0.2, 1, 0.1, 1);
}

.slider-btn:hover {
  border-radius: 6px;
  background-color: #eaecef;
}

.slider-btn:active {
  background-color: #dddfe2;
}

.v3dp__popout {
  border-radius: 7px !important;
}

.side-bar .v3dp__popout {
  margin-left: 72px;
  margin-top: 0px;
}

.todo-slider {
  flex-grow: 1;
  display: flex;
  overflow-x: hidden;
  min-height: -webkit-fill-available;
  min-height: -moz-available;
  height: fit-content;
}

@-moz-document url-prefix() {
  .todo-slider {
    min-height: -moz-available;
    height: unset;
  }
}

.slides {
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
}

.dark-theme *::-webkit-scrollbar-thumb {
  background: #333940;
  border-radius: 5px;
}

.dark-theme *::-webkit-scrollbar-thumb:hover {
  background: #39484f;
}

.dark-theme *::-webkit-scrollbar-thumb:active {
  background: #51656f;
}

.full-screen {
  height: 100%;
  resize: unset;
}

.full-screen .todo-slider {
  margin-top: 20px;
}

/*----------------Dark Theme------------------*/
.dark-theme {
  background-color: #13171d;
  color: #c9d1d9;
}

.dark-theme input {
  background-color: #13171d;
  color: #c9d1d9;
}

.dark-theme input.form-range {
  background-color: unset;
}

.dark-theme .slider-btn:hover {
  border-radius: 6px;
  background-color: #21262d;
}

.dark-theme .slider-btn:active {
  background-color: #2a2e36;
}

.mobile {
  width: 100%;
  height: 100%;
  z-index: 999;
  position: absolute;
  padding: 20%;
}

.dark-theme .mobile {
  background-color: #13171d;
}

.compatible {
  width: 100%;
  height: 100%;
  z-index: 999;
  /*position: absolute;*/
}

.hidden-input-for-focus {
  position: absolute;
  top: -100px;
}

.main-horizontal-divider {
  z-index: 5;

  &.on-top {
    cursor: unset;

    .inner-main-horizontal-divider {
      display: none;
    }

    .divider-icons-container {
      margin-top: 5px;
      visibility: visible;
      opacity: 0.3;
    }

    .move-to-corner-down,
    .move-to-corner-up,
    .move-to-center-up {
      display: none;
    }
  }

  &.on-bottom {
    cursor: unset;

    .inner-main-horizontal-divider {
      display: none;
    }

    .divider-icons-container {
      margin-top: -25px;
      visibility: visible;
      opacity: 0.3;
    }

    .move-to-corner-up,
    .move-to-corner-down,
    .move-to-center-down {
      display: none;
    }
  }

  &.on-center {
    .move-to-center-down,
    .move-to-center-up {
      display: none;
    }
  }

  &:hover {
    .divider-icons-container {
      visibility: visible;
      opacity: 1;
    }
  }
}

.divider-icons-container {
  visibility: hidden;
  opacity: 0;
  transition: 0.4s cubic-bezier(0.2, 1, 0.1, 1);
  z-index: 6;
  position: absolute;
  right: 70px;
  margin-top: -8px;
}

.divider-icons {
  @include btn-icon;
  padding: 6px;
  background-color: white;

  &:hover {
    opacity: 1;
  }

  .dark-theme & {
    background-color: #13171d;
  }
}

.hidden-lists-container {
  height: 0px !important;
  margin: 0px;
  min-height: 0px;
}

.full-screen-divider {
  height: 100% !important;
}
</style>
