import configRepository from "../repositories/configRepository";
import moment from "moment";

export default {
  migrate() {
    configCalendarZoomColumnsCalendarHeight();
    configNotifications();
    configMoveOldTasks();
    mainDividerPosition();
    configTaskBehavior();
    v2_1_0();
    v2_2_0();
    webOnlySettings();
    removeLegacySettings();
  },
};

function configCalendarZoomColumnsCalendarHeight() {
  let config = configRepository.load();
  if (!("calendar" in config)) {
    config["calendar"] = true;
    config["zoom"] = 100;
    config["columns"] = 5;
    config["calendarHeight"] = "calc(50% - 50px)";
    configRepository.update(config);
  }
}

function configNotifications() {
  let config = configRepository.load();
  if (!("notificationSound" in config)) {
    config["notificationSound"] = "pop";
    configRepository.update(config);
  }
}

function configMoveOldTasks() {
  let config = configRepository.load();
  if (!("moveOldTasks" in config)) {
    config["moveOldTasks"] = true;
    configRepository.update(config);
  }
}

function mainDividerPosition() {
  let config = configRepository.load();
  if (!("mainDividerPosition" in config)) {
    config["mainDividerPosition"] = 1;
    configRepository.update(config);
  }
}

function configTaskBehavior() {
  let config = configRepository.load();
  if (!("compactView" in config)) {
    config["customColumns"] = config["columns"];
    config["compactView"] = true;
    config["startCalendarYesterday"] = true;
    config["notificationIndicator"] = true;
    config["autoReorderTasks"] = false;
    config["moveCompletedTaskToBottom"] = true;
    configRepository.update(config);
  }
}

function v2_1_0() {
  let config = configRepository.load();
  if (!("fullscreenToDoModal" in config)) {
    config["fullscreenToDoModal"] = false;
    config["moveCompletedSubTaskToBottom"] = true;
    config["weekStartOnMonday"] = true;
    configRepository.update(config);
  }
}

function v2_2_0() {
  let config = configRepository.load();
  if (!("lastDayOpened" in config)) {
    config["lastDayOpened"] = moment().format("YYYY-MM-DD");
    configRepository.update(config);
  }
}

function webOnlySettings() {
  let config = configRepository.load();
  if (!("themeMode" in config)) config.themeMode = config.darkTheme ? "dark" : "light";
  if (!("workweekOnly" in config)) config.workweekOnly = false;
  configRepository.update(config);
}

function removeLegacySettings() {
  const config = configRepository.load();
  const legacyKeys = [
    "checkUpdates",
    "darkTrayIcon",
    "dateToShowInitialDonateModal",
    "firstTimeOpen",
    "InitialDonateModalShown",
    "notificationOnStartup",
    "openOnStartup",
    "reportErrors",
    "runInBackground",
  ];
  let changed = false;
  for (const key of legacyKeys) {
    if (key in config) {
      delete config[key];
      changed = true;
    }
  }
  if (changed) {
    configRepository.update(config);
  }
}
