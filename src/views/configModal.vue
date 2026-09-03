<template>
  <div class="modal fade" id="configModal" tabindex="-1"
    aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header settings-header">
          <h5 class="modal-title">{{ $t("settings.settings") }}</h5>
          <button class="bi-x close-modal" type="button" data-bs-dismiss="modal" :aria-label="$t('ui.close')"></button>
        </div>
        <div class="modal-body px-0 settings-body">
          <ul class="nav nav-tabs" id="confTab" role="tablist" style="display: none">
            <li class="nav-item" role="presentation">
              <button class="nav-link active" id="config-general-tab" data-bs-toggle="tab" data-bs-target="#config-general"
                role="tab">
                General
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="config-display-tab" data-bs-toggle="tab" data-bs-target="#config-display"
                role="tab">
                Display
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="config-notifications-tab" data-bs-toggle="tab"
                data-bs-target="#config-notifications" role="tab">
                Notifications
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="config-data-tab" data-bs-toggle="tab" data-bs-target="#config-data" role="tab">
                Data
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="config-language-tab" data-bs-toggle="tab" data-bs-target="#config-language"
                role="tab">
                Language
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="config-behavior-tab" data-bs-toggle="tab" data-bs-target="#config-behavior"
                role="tab">
                Behavior
              </button>
            </li>
          </ul>

          <div id="config-links-menu" class="tab-pane fade show settings-links">
            <link-list :linkList="configLinks"></link-list>
          </div>

          <div class="tab-content px-4 settings-content" id="confTab-content">
            <div class="tab-pane fade active show" id="config-general">
              <div class="d-flex flex-column mt-2 h-100">
                <div class="form-check form-switch d-flex px-1 mb-3 justify-content-between">
                  <label class="form-check-label flex-fill" for="calendarSetting">{{ $t("settings.calendar") }}</label>
                  <input class="form-check-input" type="checkbox" id="calendarSetting" v-model="configData.calendar"
                    @change="changeConfig('calendar', configData.calendar)" />
                </div>
                <div class="form-check form-switch d-flex px-1 mb-3 justify-content-between">
                  <label class="form-check-label flex-fill" for="workweekOnly">Workweek only</label>
                  <input class="form-check-input" type="checkbox" id="workweekOnly" v-model="configData.workweekOnly"
                    @change="changeConfig('workweekOnly', configData.workweekOnly)" />
                </div>

                <div class="form-check form-switch d-flex px-1 mb-3 justify-content-between">
                  <label class="form-check-label flex-fill" for="customListsSetting">{{ $t("settings.customLists")
                  }}</label>
                  <input class="form-check-input" type="checkbox" id="customListsSetting" v-model="configData.customList"
                    @change="changeConfig('customList', configData.customList)" />
                </div>

                <fieldset class="time-block-settings">
                  <legend>Plan your day</legend>
                  <p>Choose the parts of the day you want to use. At least one block stays enabled.</p>
                  <div v-for="block in timeBlockOptions" :key="block.key" class="time-block-option">
                    <label class="time-block-toggle">
                      <input type="checkbox" :checked="isTimeBlockEnabled(block.key)" :disabled="isTimeBlockEnabled(block.key) && configData.timeBlocks.length === 1" @change="toggleTimeBlock(block)" />
                      <i :class="timeBlock(block.key).icon" aria-hidden="true"></i>
                      <span>{{ timeBlock(block.key).label }}</span>
                    </label>
                    <div v-if="isTimeBlockEnabled(block.key)" class="time-block-editor">
                      <label><span>Name</span><input type="text" :value="timeBlock(block.key).label" maxlength="24" @input="updateTimeBlock(block.key, 'label', $event.target.value)" /></label>
                      <label><span>From</span><input type="time" :value="timeBlock(block.key).start" @change="updateTimeBlock(block.key, 'start', $event.target.value)" /></label>
                      <label><span>To</span><input type="time" :value="timeBlock(block.key).end" @change="updateTimeBlock(block.key, 'end', $event.target.value)" /></label>
                      <label><span>Icon</span><select :value="timeBlock(block.key).icon" @change="updateTimeBlock(block.key, 'icon', $event.target.value)"><option v-for="icon in timeBlockIcons" :key="icon.value" :value="icon.value">{{ icon.label }}</option></select></label>
                    </div>
                  </div>
                </fieldset>


              </div>
            </div>
            <div class="tab-pane fade" id="config-behavior">
              <div class="d-flex flex-column mt-2 h-100">
                <div class="form-check form-switch d-flex px-1 mb-3 justify-content-between">
                  <label class="form-check-label flex-fill" for="moveOldTasks">{{ $t("settings.moveOldTasks")
                  }}</label>
                  <input class="form-check-input" type="checkbox" id="moveOldTasks" v-model="configData.moveOldTasks"
                    @change="changeConfig('moveOldTasks', configData.moveOldTasks)" />
                </div>
                <div class="form-check form-switch d-flex px-1 mb-3 justify-content-between">
                  <label class="form-check-label flex-fill" for="weekStartOnMonday">{{ $t("settings.weekStartOnMonday")
                  }}</label>
                  <input class="form-check-input" type="checkbox" id="weekStartOnMonday" v-model="configData.weekStartOnMonday"
                    @change="changeConfig('weekStartOnMonday', configData.weekStartOnMonday)" />
                </div>
                <div class="form-check form-switch d-flex px-1 mb-3 justify-content-between">
                  <label class="form-check-label flex-fill" for="startCalendarYesterday">{{ $t("settings.startCalendarYesterday")
                  }}</label>
                  <input class="form-check-input" type="checkbox" id="startCalendarYesterday"
                    v-model="configData.startCalendarYesterday"
                    @change="changeConfig('startCalendarYesterday', configData.startCalendarYesterday)" />
                </div>
                <div class="form-check form-switch d-flex px-1 mb-3 justify-content-between">
                  <label class="form-check-label flex-fill" for="autoReorderTasks">{{ $t("settings.autoReorderTasks")
                  }}</label>
                  <input class="form-check-input" type="checkbox" id="autoReorderTasks"
                    v-model="configData.autoReorderTasks"
                    @change="changeConfig('autoReorderTasks', configData.autoReorderTasks)" />
                </div>
                <div class="form-check form-switch d-flex px-1 mb-3 justify-content-between">
                  <label class="form-check-label flex-fill" for="moveCompletedTaskToBottom">{{
                    $t("settings.moveCompletedTaskToBottom")
                  }}</label>
                  <input class="form-check-input" type="checkbox" id="moveCompletedTaskToBottom"
                    v-model="configData.moveCompletedTaskToBottom"
                    @change="changeConfig('moveCompletedTaskToBottom', configData.moveCompletedTaskToBottom)" />
                </div>
                <div class="form-check form-switch d-flex px-1 mb-3 justify-content-between">
                  <label class="form-check-label flex-fill" for="moveCompletedSubTaskToBottom">{{
                    $t("settings.moveCompletedSubTaskToBottom")
                  }}</label>
                  <input class="form-check-input" type="checkbox" id="moveCompletedSubTaskToBottom"
                    v-model="configData.moveCompletedSubTaskToBottom"
                    @change="changeConfig('moveCompletedSubTaskToBottom', configData.moveCompletedSubTaskToBottom)" />
                </div>
              </div>
            </div>
            <div class="tab-pane fade" id="config-display">
              <div class="d-flex flex-column mt-2 h-100">


                <div class="px-1 mb-3">
                  <label class="form-check-label" for="themeMode">Theme</label>
                  <select id="themeMode" class="form-select" v-model="configData.themeMode"
                    @change="changeConfig('themeMode', configData.themeMode)">
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                <div class="horizontal-divider mb-3"></div>
                <div class="px-1 mb-3">
                  <label for="columnsConfig" class="form-check-label">{{ $t("settings.columns") }}: {{
                    configData.columns
                  }}</label>
                  <input type="range" class="form-range mt-2 px-2" min="1" max="12" id="columnsConfig"
                    v-model="configData.columns" @change="changeConfig('columns', configData.columns)" />
                </div>

                <div class="px-1 mb-3">
                  <label for="columnsConfig" class="form-check-label">{{ $t("settings.lists_columns") }}: {{
                    configData.customColumns
                  }}</label>
                  <input type="range" class="form-range mt-2 px-2" min="1" max="12" id="columnsConfig"
                    v-model="configData.customColumns"
                    @change="changeConfig('customColumns', configData.customColumns)" />
                </div>

                <div class="px-1 mb-3 zoom-config">
                  <label for="zoomConfig" class="form-check-label">{{ $t("settings.zoom") }}: {{ configData.zoom
                  }}%</label>
                  <input type="range" class="form-range mt-2 px-2" min="50" max="200" id="zoomConfig" step="5"
                    v-model="configData.zoom" @change="changeConfig('zoom', configData.zoom)" />
                </div>

                <div class="form-check form-switch d-flex px-1 mb-3 justify-content-between">
                  <label class="form-check-label" for="compactViewSetting">{{
                    $t("settings.compactView")
                  }}</label>
                  <input class="form-check-input" type="checkbox" id="compactViewSetting" v-model="configData.compactView"
                    @change="changeConfig('compactView', configData.compactView)" />
                </div>
                <div class="form-check form-switch d-flex px-1 mb-3 justify-content-between">
                  <label class="form-check-label" for="fullscreenToDoModal">{{
                    $t("settings.fullscreenToDoModal")
                  }}</label>
                  <input class="form-check-input" type="checkbox" id="fullscreenToDoModal"
                    v-model="configData.fullscreenToDoModal"
                    @change="changeConfig('fullscreenToDoModal', configData.fullscreenToDoModal)" />
                </div>
              </div>
            </div>
            <div class="tab-pane fade" id="config-notifications">
              <div class="d-flex flex-column mt-3 h-100">

                <div class="form-check form-switch d-flex px-0 mb-3  justify-content-between">
                  <label class="form-check-label" style="margin-left: 0px" for="notificationIndicator">{{
                    $t("settings.notificationIndicator")
                  }}</label>
                  <input class="form-check-input" type="checkbox" id="notificationIndicator"
                    v-model="configData.notificationIndicator"
                    @change="changeConfig('notificationIndicator', configData.notificationIndicator)" />
                </div>

                <div class="horizontal-divider mb-3"></div>

                <label for="notificationSound" class="form-label">{{ $t("settings.notificationSound") }}:</label>
                <div class="d-flex">
                  <select id="notificationSound" class="col-sm-9 form-select flex-fill"
                    aria-label="Default select example" v-model="configData.notificationSound" @change="
                      changeConfig('notificationSound', configData.notificationSound)
                      ">
                    <option value="none">None</option>
                    <option value="pop">Pop</option>
                    <option value="bell">Bell</option>
                    <option value="soft-bell">Soft Bell</option>
                    <option value="soft">Soft</option>
                    <option value="tiny">Tiny</option>
                    <option value="piano">Piano</option>
                    <option value="positive">Positive</option>
                    <option value="metal">Metal</option>
                  </select>
                  <button class="btn" style="margin-left: 8px" type="button" @click="playSound">
                    <i class="bi-play-circle a"></i>
                  </button>
                </div>
              </div>


            </div>
            <div class="tab-pane fade" id="config-data">
              <div class="d-flex flex-column mt-2 h-100">
                <div>
                  <div>
                    <div class="form-check form-switch d-flex px-1 mb-3 justify-content-between align-items-center">
                      <label class="form-check-label" for="export-data-btn">{{ $t("settings.exportData") }}</label>
                      <button id="export-data-btn" type="button" class="btn py-1 px-2 border" style="width: 140px;"
                        @click="exportData">
                        <i class="icons bi-cloud-arrow-down mx-2"></i>
                        {{ $t("settings.export") }}
                      </button>
                    </div>

                    <div class="form-check form-switch d-flex px-1 mb-3 justify-content-between align-items-center">
                      <label class="form-check-label" for="import-data-btn">{{ $t("settings.importData") }}</label>
                      <button id="import-data-btn" type="button" class="btn py-1 px-2 border" style="width: 140px;"
                        @click="$refs.loadData.click">
                        <i class="icons bi-cloud-arrow-up mx-2"></i>
                        {{ $t("settings.import") }}
                      </button>
                    </div>

                    <div class="form-check form-switch d-flex px-1 mb-3 justify-content-between align-items-center">
                      <label class="form-check-label" for="clear-data-btn">{{ $t("settings.clearData") }}</label>
                      <button id="clear-data-btn" type="button" class="btn py-1 px-2 border" style="width: 140px;"
                        data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#clearDataModal">
                        <i class="icons bi-x-circle mx-2"></i>
                        {{ $t("settings.clear") }}
                      </button>
                    </div>
                  </div>
                  <input type="file" id="file-selector" class="d-none" accept=".wtdb" ref="loadData"
                    @change="importData($event)" />
                </div>
              </div>
            </div>
            <div class="tab-pane fade" id="config-language">
              <div class="d-flex flex-column mt-2 h-100">
                <label for="language" class="form-label">{{ $t("settings.language") }}:</label>
                <select id="language" class="col-sm-9 form-select" aria-label="Default select example"
                  v-model="configData.language" @change="setLanguage">
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="it">Italiano</option>
                  <option value="pt">Português</option>
                  <option value="ru">русский</option>
                  <option value="hi">हिंदी</option>
                  <option value="ja">日本</option>
                  <option value="pl">Polski</option>
                  <option value="ar">عرب</option>
                  <option value="ko">한국어</option>
                  <option value="zh_cn">简体中文</option>
                  <option value="zh_tw">繁體中文</option>
                  <option value="uk">український</option>
                  <option value="tr">Türk</option>
                  <option value="vi">Tiếng Việt</option>
                  <option value="he">עִברִית</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 1056">
      <toast-message ref="invalidFile" id="invalidFile" text="$t('settings.invalidFile')"></toast-message>
    </div>
  </div>
</template>

<script>
import configRepository from "../repositories/configRepository";
import toastMessage from "../components/toastMessage";
import exportTool from "../helpers/exportTool";
import linkList from "../components/linkList";
import configList from "./configList";
import notifications from "../helpers/notifications";
import { Modal } from "bootstrap";

export default {
  name: "configModal",
  components: { toastMessage, linkList },
  props: {
    configProp: { required: true },
  },
  data() {
    return {
      configData: this.$store.getters.config,
      timeBlockOptions: [
        { key: "morning", label: "Morning", start: "06:00", end: "10:00", range: "6am – 10am", icon: "bi-sunrise" },
        { key: "midday", label: "Midday", start: "10:00", end: "13:00", range: "10am – 1pm", icon: "bi-sun" },
        { key: "afternoon", label: "Afternoon", start: "13:00", end: "17:00", range: "1pm – 5pm", icon: "bi-cloud-sun" },
        { key: "evening", label: "Evening", start: "17:00", end: "20:00", range: "5pm – 8pm", icon: "bi-sunset" },
        { key: "night", label: "Night", start: "20:00", end: "23:00", range: "8pm – 11pm", icon: "bi-moon-stars" },
      ],
      timeBlockIcons: [
        { value: "bi-sunrise", label: "Sunrise" }, { value: "bi-sun", label: "Sun" }, { value: "bi-cloud-sun", label: "Cloud sun" },
        { value: "bi-sunset", label: "Sunset" }, { value: "bi-moon-stars", label: "Moon" }, { value: "bi-cup-hot", label: "Cup" },
        { value: "bi-flower1", label: "Flower" }, { value: "bi-pencil", label: "Pencil" }, { value: "bi-heart", label: "Heart" },
      ],
    };
  },
  methods: {
    changeConfig: function (key, val) {
      this.$nextTick(function () {
        this.$store.commit("updateConfig", { val: val, key: key });
        configRepository.update(this.$store.getters.config);
        if (key === "language") this.$i18n.locale = this.configData.language;
        if (key === "columns") {
          setTimeout(
            function () {
              this.$emit("changeColumns");
            }.bind(this),
            50
          );
        }
      });
    },
    exportData: function () {
      let configModal = Modal.getInstance(document.getElementById("configModal"));
      configModal.hide();
      let exportingModal = new Modal(document.getElementById("exportingModal"), { backdrop: "static" });
      exportingModal.show();
      exportTool.export();
    },
    importData: function (event) {
      let configModal = Modal.getInstance(document.getElementById("configModal"));
      configModal.hide();
      let importingModal = new Modal(document.getElementById("importingModal"), { backdrop: "static" });
      importingModal.show();
      exportTool.import(event);
    },
    setLanguage: function () {
      this.changeConfig('language', this.configData.language);
    },
    playSound: function () {
      notifications.playNotificationSound(
        this.$store.getters.config.notificationSound
      );
    },
    isTimeBlockEnabled: function (key) {
      return this.configData.timeBlocks.some((block) => block.key === key);
    },
    timeBlock: function (key) {
      return this.configData.timeBlocks.find((block) => block.key === key) || this.timeBlockOptions.find((block) => block.key === key);
    },
    updateTimeBlock: function (key, field, value) {
      const blocks = this.configData.timeBlocks.map((block) => block.key === key ? { ...block, [field]: value } : block);
      const changed = blocks.find((block) => block.key === key);
      if (field === "start" || field === "end") changed.range = this.formatRange(changed.start, changed.end);
      this.configData.timeBlocks = blocks;
      this.changeConfig("timeBlocks", blocks);
    },
    formatRange: function (start, end) {
      const formatTime = (value) => {
        const [hour, minute] = value.split(":").map(Number);
        const suffix = hour >= 12 ? "pm" : "am";
        const twelveHour = hour % 12 || 12;
        return minute ? `${twelveHour}:${String(minute).padStart(2, "0")}${suffix}` : `${twelveHour}${suffix}`;
      };
      return `${formatTime(start)} – ${formatTime(end)}`;
    },
    toggleTimeBlock: function (block) {
      const blocks = this.configData.timeBlocks.slice();
      const index = blocks.findIndex((candidate) => candidate.key === block.key);
      if (index >= 0) {
        if (blocks.length === 1) return;
        blocks.splice(index, 1);
      } else {
        blocks.push(block);
        blocks.sort((left, right) => this.timeBlockOptions.findIndex((candidate) => candidate.key === left.key) - this.timeBlockOptions.findIndex((candidate) => candidate.key === right.key));
      }
      this.configData.timeBlocks = blocks;
      this.changeConfig("timeBlocks", blocks);
    },
  },
  computed: {
    configLinks: function () {
      return configList.configList(this);
    },
  },
  watch: {
    configProp: function (newVal) {
      this.configData = newVal;
    }
  },
};
</script>

<style scoped lang="scss">
@use "../assets/style/globalVars" as *;

.form-check-input {
  width: 2.8em !important;
  height: 1.4em !important;
}

.time-block-settings {
  margin: .25rem 0 0;
  padding: 1rem 0 0;
  border: 0;
  border-top: 1px solid #d8ddd0;
}

.time-block-settings legend { margin: 0; color: #334235; font: 500 1rem "Garden Serif", serif; }
.time-block-settings > p { margin: .35rem 0 .75rem; color: #657466; font-size: .78rem; line-height: 1.4; }
.time-block-option { padding: .4rem 0; border-bottom: 1px solid rgba(216, 221, 208, .75); color: #334235; }
.time-block-option:last-child { border-bottom: 0; }
.time-block-toggle { display: grid; grid-template-columns: 1.25rem 1.25rem 1fr; align-items: center; gap: .5rem; min-height: 2rem; cursor: pointer; }
.time-block-toggle input { width: 1rem; height: 1rem; accent-color: #829582; }
.time-block-toggle i { color: #c86d3e; }
.time-block-editor { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1.3fr; gap: .4rem; padding: .45rem 0 .15rem 2.75rem; }
.time-block-editor label { display: grid; gap: .15rem; color: #657466; font-size: .65rem; }
.time-block-editor input,.time-block-editor select { width: 100%; min-height: 2rem; border: 1px solid #c5d6c1; border-radius: 5px; background: #fffdf8; color: #334235; font-size: .72rem; }

.dark-theme .time-block-settings { border-top-color: #71816b; }
.dark-theme .time-block-settings legend { color: #f1ead9; }
.dark-theme .time-block-settings > p { color: #d3d9c8; }
.dark-theme .time-block-option { border-bottom-color: rgba(241, 234, 217, .18); color: #f1ead9; }
.dark-theme .time-block-editor label { color: #d3d9c8; }
.dark-theme .time-block-editor input,.dark-theme .time-block-editor select { background: #354235; border-color: #71816b; color: #f1ead9; }

@media (max-width: 640px) {
  .settings-body { display: block; min-height: 0; }
  .settings-links { width: 100%; flex-basis: auto; }
  .settings-content { height: auto; min-height: 24rem; }
  .time-block-editor { grid-template-columns: 1fr 1fr; padding-left: 0; }
}

.modal-content {
  background-color: #fbf8ef;
  color: #334235;
  border: 1px solid #c5d6c1;
}

.settings-header {
  border-bottom: 1px solid #d8ddd0;
  align-items: center;
}

.close-modal {
  border: 0;
  background: transparent;
  line-height: 1;
  padding: 0.35rem;
}

.settings-body { display: flex; min-height: 400px; }
.settings-links { width: 340px; flex: 0 0 340px; }
.settings-content { width: 100%; height: 400px; overflow-y: auto; }

.settings-content .form-check,
.settings-content .px-1 {
  border-radius: 8px;
  transition: background-color .2s ease;
}

.settings-content .form-check:hover,
.settings-content .px-1:hover { background: rgba(197, 214, 193, .22); }

.settings-content :is(button, input, select):focus-visible {
  outline: 3px solid #c96b3d;
  outline-offset: 2px;
}

.dark-theme .modal-content {
  background-color: #465845;
  color: #f1ead9;
  border-color: #71816b;
}

#config-links-menu {
  border-right: 1px solid rgba(0, 0, 0, 0.06);

.dark-theme & {
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}
}


.icons {
  font-size: 18px;
  margin-right: 5px;
}

.form-check-label {
  margin-left: 10px;
  padding-top: 5px;
}

.dark-theme .form-select {
  background-color: #15161e;
  border: 1px solid #30363d;
  color: #c9d1d9;
}

.form-select:focus {
  box-shadow: none;
}

.modal-dialog {
  max-width: 800px;
  max-height: 500px;
}

.form-range::-webkit-slider-thumb {
  background: $check-color;

  .dark-theme & {
    background: $dt-check-color;
  }
}

.form-range::-webkit-slider-thumb {
  background: $check-color;

  .dark-theme & {
    background: $dt-check-color;
  }
}

.form-range::-ms-thumb {
  background: $check-color;

  .dark-theme & {
    background: $dt-check-color;
  }
}


@-moz-document url-prefix() {
  .zoom-config {
    display: none;
  }
}
</style>
