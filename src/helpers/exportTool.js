import storageRepository from "../repositories/storageRepository";
import dbRepository from "../repositories/dbRepository";
import { Toast, Modal } from "bootstrap";
import migrations from "../migrations/migrations";

const MAX_IMPORT_SIZE_BYTES = 25 * 1024 * 1024;
const DB_TABLES = ["todo_lists", "repeating_events", "repeating_events_by_date"];

export default {
  export() {
    const filename = "WeekToDoOnlineBackup.wtdb";
    createBackupData().then((data) => createExportLink(filename, JSON.stringify(data)));
  },
  import(event) {
    const file = event.target.files && event.target.files[0];
    const toast = new Toast(document.getElementById("invalidFile"));

    if (!file || file.size > MAX_IMPORT_SIZE_BYTES) {
      toast.show();
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => toast.show();
    reader.onload = async () => {
      try {
        const data = validateBackup(JSON.parse(reader.result));
        await restoreBackupData(data);
        migrations.migrate();
        location.reload();
      } catch (_error) {
        toast.show();
      }
    };
    reader.readAsText(file);
  },
  clear() {
    const dbRequest = dbRepository.open();
    dbRequest.onsuccess = async (event) => {
      try {
        await dbRepository.clearAll(event.target.result);
        storageRepository.clean();
        location.reload();
      } catch (_error) {
        new Toast(document.getElementById("invalidFile")).show();
      }
    };
  },
};

function createExportLink(filename, fileBody) {
  const element = document.createElement("a");
  element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(fileBody));
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  setTimeout(() => {
    Modal.getInstance(document.getElementById("exportingModal")).hide();
  }, 1000);
}

export function validateBackup(data) {
  if (!isRecord(data) || typeof data.config !== "string") throw new Error("Invalid backup");

  const config = JSON.parse(data.config);
  if (!isRecord(config)) throw new Error("Invalid configuration");

  const customTodoListIds = data.customTodoListIds ?? "[]";
  if (typeof customTodoListIds !== "string" || !Array.isArray(JSON.parse(customTodoListIds))) {
    throw new Error("Invalid custom lists");
  }

  const backup = {
    config: JSON.stringify({ ...config, importing: true }),
    customTodoListIds,
  };
  DB_TABLES.forEach((table) => {
    const records = data[table] ?? {};
    if (!isRecord(records)) throw new Error(`Invalid ${table}`);
    backup[table] = records;
  });
  return backup;
}

export async function createBackupData() {
  const data = storageRepository.as_json();
  DB_TABLES.forEach((table) => { data[table] = {}; });
  const db = await new Promise((resolve, reject) => {
    const request = dbRepository.open();
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = () => reject(request.error);
  });
  for (let index = 0; index < DB_TABLES.length; index += 1) {
    await new Promise((resolve, reject) => {
      const request = dbRepository.selectAll(db, DB_TABLES[index]);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          data[DB_TABLES[index]][cursor.key] = cursor.value;
          cursor.continue();
        } else resolve();
      };
    });
  }
  return data;
}

export async function restoreBackupData(data) {
  const previousStorage = storageRepository.as_json();
  storageRepository.clean();
  storageRepository.load_json(data);

  const dbRequest = dbRepository.open();
  await new Promise((resolve, reject) => {
    dbRequest.onsuccess = (event) => resolve(event.target.result);
    dbRequest.onerror = () => reject(dbRequest.error);
  })
    .then((db) => dbRepository.replaceAll(db, data))
    .catch((error) => {
      storageRepository.clean();
      storageRepository.load_json({
        config: previousStorage.config ?? "{}",
        customTodoListIds: previousStorage.customTodoListIds ?? "[]",
      });
      throw error;
    });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
