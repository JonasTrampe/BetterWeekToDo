<template>
  <div class="side-bar">
    <img class="sidebar-vine" src="/assets/plates/botanical-left-vine.png" alt="" aria-hidden="true" />
    <img class="sidebar-garden" src="/assets/plates/botanical-left-garden.png" alt="" aria-hidden="true" />
    <button class="logo-button" type="button" data-bs-toggle="modal" data-bs-target="#aboutModal" :title="$t('about.about')">
    <img
      class="logo"
      src="/img/logo-color.svg"
      width="42"
      height="42"
      alt="BetterWeekToDo logo"
    />
    <img
      class="logo logo-white"
      src="/img/logo-white.svg"
      width="42"
      height="42"
      alt="BetterWeekToDo logo"
    />
    </button>
    <div class="sidebar-intro">
      <p class="sidebar-kicker">A calm week</p>
      <p class="sidebar-lede">grows a focused life.</p>
      <p class="sidebar-note">One step. One task.<br />One moment at a time.</p>
    </div>
    <button v-if="showCalendar" class="sidebar-action bi-calendar-check" type="button" @click="setTodayDate" :aria-label="$t('ui.today')" :title="$t('ui.today')"></button>
    <button v-if="showCalendar" class="sidebar-action bi-calendar-event" type="button" data-bs-toggle="modal" data-bs-target="#monthOverviewModal" :aria-label="$t('ui.calendar')" :title="$t('ui.calendar')"></button>
    <button
      v-if="showCalendar"
      class="sidebar-action bi-arrow-repeat"
      type="button"
      :aria-label="$t('ui.recurringTasks')"
      :title="$t('ui.recurringTasks')"
      data-bs-toggle="modal"
      data-bs-target="#RecurrentEventsModal"
    ></button>
    <button
      v-if="showCustomList"
      class="sidebar-action bi bi-arrow-left-right"
      type="button"
      data-bs-target="#ReorderCustomListsModal"
      data-bs-toggle="modal"
      :aria-label="$t('ui.reorderCustomLists')"
      :title="$t('ui.reorderCustomLists')"
    ></button>
    <span class="sidebar-spacer"></span>
    <button class="sidebar-action bi-info-square" type="button" data-bs-toggle="modal" data-bs-target="#tipsModal" :aria-label="$t('tips.tips')" :title="$t('tips.tips')"></button>
    <div class="dropend sidebar-extra-menu">
      <button class="bi-three-dots sidebar-icon sidebar-action align-self-center" type="button" aria-label="More options" title="More options" data-bs-toggle="dropdown"></button>
      <ul class="dropdown-menu mx-3" aria-labelledby="btnTaskOptionMenu">
        <li v-if="showCustomList">
          <button class="dropdown-item" type="button" @click="newCustomTodoList">
            <i class="bi-clipboard-plus"></i> <span>{{ $t("ui.newCustomList") }}</span>
          </button>
        </li>
        <li>
          <button class="dropdown-item" type="button" @click="print">
            <i class="bi-printer"></i> <span>{{ $t("ui.print") }} </span>
          </button>
        </li>
        <li>
          <button class="dropdown-item" type="button" @click="$emit('openAccount')">
            <i class="bi-person-circle"></i> <span>Account</span>
          </button>
        </li>
        <li>
          <button class="dropdown-item" type="button" data-bs-toggle="modal" data-bs-target="#configModal" @click="openConfigModal">
            <i class="bi-gear"></i> <span>{{ $t('settings.settings') }}</span>
          </button>
        </li>
        <li><hr class="dropdown-divider" /></li>
        <li>
          <button class="dropdown-item" type="button" data-bs-toggle="modal" data-bs-target="#aboutModal">
            <i class="bi-info-circle"></i> <span>{{ $t("about.about") }}</span>
          </button>
        </li>
      </ul>
    </div>

  </div>
</template>

<script>
import dateTime from "../../helpers/dateTime";
import customToDoListIdsRepository from "../../repositories/customToDoListIdsRepository";
import toDoListRepository from "../../repositories/toDoListRepository";

export default {
  name: "sideBar",
  emits: ["changeDate", "openAccount"],
  mounted() {
    window.addEventListener("beforeprint", () => {
      document.getElementById("app-container").classList.add("ready-to-print");
      if (JSON.parse(localStorage.getItem("config")).darkTheme)
        document.getElementById("app-container").classList.remove("dark-theme");
    });

    window.addEventListener("afterprint", () => {
      document.getElementById("app-container").classList.remove("ready-to-print");
      if (JSON.parse(localStorage.getItem("config")).darkTheme)
        document.getElementById("app-container").classList.add("dark-theme");
    });
  },
  methods: {
    setTodayDate: function () {
      this.$emit("changeDate", dateTime().format("YYYYMMDD"));
    },
    newCustomTodoList: function () {
      const customTodoListId = { listId: dateTime().format("YYYYMMDDTHHmmssS"), listName: "" };
      this.$store.commit("actionsCListCreatedUpdate", true);
      this.$store.commit("newCustomTodoList", customTodoListId);
      customToDoListIdsRepository.update(this.$store.getters.cTodoListIds);
      toDoListRepository.update(customTodoListId.listId, this.$store.getters.todoLists[customTodoListId.listId]);
    },
    openConfigModal: function () {
      document.getElementById("config-general-tab").click();
    },
    print: function () {
      window.print();
    },
  },
  computed: {
    showCustomList: function () {
      return this.$store.getters.config.customList;
    },
    showCalendar: function () {
      return this.$store.getters.config.calendar;
    },
  },
};
</script>

<style scoped lang="scss">
.side-bar {
  width: 21rem;
  flex: 0 0 21rem;
  height: 100%;
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  float: left;
  background-color: #faf7f0;
  background-image: none;
  border-right: 1px solid #c5d6c1;
  padding-bottom: clamp(15rem, 38vh, 24rem);
}

.sidebar-vine,
.sidebar-garden {
  position: absolute;
  z-index: 0;
  pointer-events: none;
  user-select: none;
}

.sidebar-vine { top: 0; left: 0; width: 78%; height: auto; transform: scaleY(.66); transform-origin: top left; }
.sidebar-garden { left: 0; bottom: -2rem; width: 100%; height: auto; }

.side-bar > * { position: relative; z-index: 1; }
.side-bar > .sidebar-vine,
.side-bar > .sidebar-garden { position: absolute; z-index: 0; }

.sidebar-intro { padding: 8.4rem 1.75rem 1.2rem 6.25rem; border-bottom: 1px solid #c5d6c1; }
.sidebar-kicker, .sidebar-lede { margin: 0; font-family: "Garden Serif", serif; color: #334235; }
.sidebar-kicker { font-size: 1.5rem; }
.sidebar-lede { font-size: 1.35rem; }
.sidebar-note { margin: 1rem 0 0; color: #5c6d5b; line-height: 1.45; }

.logo-button {
  display: none;
  border: 0;
  background: transparent;
  padding: 0;
  align-self: center;
  cursor: pointer;
}

.sidebar-spacer { flex-grow: 0; height: 0; }

.side-bar > i:first-child {
  margin-bottom: 14px;
  margin-top: 8px;
}

.side-bar > i:first-child:hover {
  border-radius: unset;
  background-color: unset;
}

.side-bar > button:not(.logo-button),
.sidebar-icon {
  font-size: 1.25rem;
  padding: 10px;
  margin-bottom: 9px;
  align-self: center;
  cursor: pointer;
  border: 0;
  background: #faf7f0;
  color: inherit;
  align-self: stretch;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding-left: 1.75rem;
  transition: 0.4s cubic-bezier(0.2, 1, 0.1, 1);
}

.sidebar-action::after {
  content: attr(aria-label);
  font-family: system-ui, sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0;
}

.sidebar-primary {
  margin-inline: 1.25rem;
  border-radius: 8px !important;
  background: #aebba7 !important;
}

.side-bar > button:not(.logo-button):hover,
.sidebar-icon:hover {
  border-radius: 6px;
  background-color: #c9ddc5;
  color: black;
}

.side-bar > button:not(.logo-button):active,
.sidebar-icon:active {
  background-color: #dddfe2;
}

.side-bar .logo {
  margin-bottom: 6px;
  margin-top: 10px;
  align-self: center;
  cursor: pointer;
}

.side-bar .logo-white {
  display: none;
}

.dark-theme {
  .side-bar {
    background: #152118;
    border-color: #3e5342;
  }
  .sidebar-intro { border-color: #3e5342; }
  .sidebar-kicker, .sidebar-lede { color: #e2eadf; }
  .sidebar-note { color: #b2c1b1; }
  .side-bar > button:not(.logo-button), .sidebar-icon { background: transparent; color: #d7e2d5; }
  .side-bar > button:not(.logo-button):hover, .sidebar-icon:hover { background: #2b3c2e; color: #fff; }
  .side-bar .logo {
    display: none;
  }
  .side-bar .logo-white {
    display: block;
    opacity: 0.95;
  }
}

.dropdown-menu {
  font-size: 0.865rem;
  min-width: unset;
  border-radius: 8px;
  box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.2);
  border: none;
  color: #3c3c3c;

  .dropdown-item {
    padding: 0.4rem 1.9rem 0.4rem 0.65rem;
  }

  .dropdown-divider {
    margin: 0.3rem;
  }

  i {
    font-size: 0.99rem;
    margin-right: 11px;
    display: inline-block;
  }
}

.sidebar-extra-menu .dropdown-menu {
  z-index: 1060;
  min-width: 12.5rem;
  overflow: visible;
  background: #fcfaf5;
}

.sidebar-extra-menu .dropdown-item {
  display: flex;
  align-items: center;
  color: #263a2d;
  white-space: nowrap;
}

.sidebar-extra-menu {
  align-self: stretch;
}

.sidebar-extra-menu .sidebar-icon {
  width: 100%;
  margin-bottom: 0;
}

.dropdown-toggle-split {
  padding: 0px;
}

/*------------------------Dark Theme*------------------*/

.dark-theme .side-bar {
  background-color: #faf7f0;
  color: #334235;
  border-right-color: #c5d6c1;
}

.dark-theme .side-bar .logo { display: block; }
.dark-theme .side-bar .logo-white { display: none; }

.dark-theme .side-bar i:hover {
  border-radius: 6px;
  background-color: #21262d;
  color: #dedede;
}

.dark-theme .side-bar i:active {
  background-color: #2e353d;
}

@media only screen and (min-width: 901px) and (max-width: 1200px) and (min-height: 761px) {
  .side-bar { width: 18rem; flex-basis: 18rem; }
  .sidebar-intro { padding-left: 5.25rem; }
  .sidebar-kicker { font-size: 1.3rem; }
  .sidebar-lede { font-size: 1.2rem; }
  .side-bar > button:not(.logo-button),
  .sidebar-icon { padding-left: 1.25rem; }
}

@media only screen and (max-width: 900px), only screen and (max-height: 760px) {
  .side-bar {
    position: fixed;
    inset: auto 0 0 0;
    z-index: 1040;
    width: 100vw;
    height: calc(4rem + env(safe-area-inset-bottom));
    padding: .35rem .4rem env(safe-area-inset-bottom);
    flex: 0 0 auto;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    border: 0;
    border-top: 1px solid #c5d6c1;
  }

  .side-bar::before,
  .side-bar::after,
  .sidebar-vine,
  .sidebar-garden,
  .sidebar-intro,
  .logo-button,
  .sidebar-spacer { display: none; }

  .side-bar > button:not(.logo-button) {
    display: block;
    flex: 0 1 3.25rem;
    min-width: 44px;
    min-height: 44px;
    margin: 0;
    padding: .7rem;
    text-align: center;
  }

  .sidebar-extra-menu {
    display: flex;
    flex: 0 1 3.25rem;
    min-width: 44px;
    min-height: 44px;
    align-items: center;
  }

  .sidebar-extra-menu .sidebar-icon {
    display: block;
    min-width: 44px;
    min-height: 44px;
    margin: 0;
    padding: .7rem;
    text-align: center;
  }

  .sidebar-action::after { display: none; }
}
</style>
