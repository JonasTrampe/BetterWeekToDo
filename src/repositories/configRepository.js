import storageRepository from "./storageRepository";
import version_json from "../../public/version.json";
import dateTime from "../helpers/dateTime";

const DEFAULT_TIME_BLOCKS = [
  { key: "morning", label: "Morning", start: "06:00", end: "10:00", range: "6am – 10am", icon: "bi-sunrise" },
  { key: "midday", label: "Midday", start: "10:00", end: "13:00", range: "10am – 1pm", icon: "bi-sun" },
  { key: "afternoon", label: "Afternoon", start: "13:00", end: "17:00", range: "1pm – 5pm", icon: "bi-cloud-sun" },
  { key: "evening", label: "Evening", start: "17:00", end: "20:00", range: "5pm – 8pm", icon: "bi-sunset" },
  { key: "night", label: "Night", start: "20:00", end: "23:00", range: "8pm – 11pm", icon: "bi-moon-stars" },
];

const defaultTimeBlocks = () => DEFAULT_TIME_BLOCKS.map((block) => ({ ...block }));
const normalizeTimeBlocks = (blocks) => blocks.map((block) => ({
  ...DEFAULT_TIME_BLOCKS.find((candidate) => candidate.key === block.key),
  ...block,
}));

export default {
  load() {
    let config = storageRepository.get("config");
    if (config) {
      if (!Array.isArray(config.timeBlocks) || config.timeBlocks.length === 0) {
        config.timeBlocks = defaultTimeBlocks();
        storageRepository.set("config", config);
      } else {
        const normalizedBlocks = normalizeTimeBlocks(config.timeBlocks);
        if (JSON.stringify(normalizedBlocks) !== JSON.stringify(config.timeBlocks)) {
          config.timeBlocks = normalizedBlocks;
          storageRepository.set("config", config);
        }
      }
      return config;
    } else {
      let default_config = {
        darkTheme: false,
        themeMode: "light",
        customList: false,
        calendar: true,
        language: "en",
        version: version_json.version,
        columns: 7,
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
        timeBlocks: defaultTimeBlocks(),
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
