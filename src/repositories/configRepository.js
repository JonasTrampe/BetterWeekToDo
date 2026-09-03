import storageRepository from "./storageRepository";
import version_json from "../../public/version.json";
import dateTime from "../helpers/dateTime";

export default {
  load() {
    let config = storageRepository.get("config");
    if (config) {
      return config;
    } else {
      let default_config = {
        darkTheme: false,
        themeMode: "light",
        customList: true,
        calendar: true,
        language: "en",
        version: version_json.version,
        columns: 5,
        customColumns: 5,
        zoom: 100,
        calendarHeight: "calc(50% - 50px)",
        notificationSound: "pop",
        moveOldTasks: true,
        mainDividerPosition: 1,
        importing: false,
        compactView: true,
        startCalendarYesterday: false,
        notificationIndicator: true,
        autoReorderTasks: false,
        moveCompletedTaskToBottom: true,
        moveCompletedSubTaskToBottom: true,
        fullscreenToDoModal: false,
        weekStartOnMonday: true,
        workweekOnly: false,
        lastDayOpened: dateTime().format("YYYY-MM-DD")
      };
      storageRepository.set("config", default_config);
      return default_config;
    }
  },
  update(config) {
    storageRepository.set("config", config);
  },
};
