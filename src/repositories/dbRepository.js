export default {
    open() {
        var req = indexedDB.open('weekToDo', 4);
        req.onupgradeneeded = function (event) {
            var db = event.target.result;
            if (!db.objectStoreNames.contains("todo_lists")) {
                db.createObjectStore('todo_lists', {autoIncrement: false});
            }

            if (!db.objectStoreNames.contains("repeating_events")) {
                db.createObjectStore('repeating_events', {autoIncrement: false});
            }

            if (!db.objectStoreNames.contains("repeating_events_by_date")) {
                db.createObjectStore('repeating_events_by_date', {autoIncrement: false});
            }
        }
        req.onerror = function () {};
        return req;
    },
    get(db, table, id) {
        let tx = db.transaction([table], 'readonly');
        let store = tx.objectStore(table);
        let req = store.get(id);
        return req;
    },
    add(db, table, id, obj) {
        let tx = db.transaction([table], 'readwrite');
        let store = tx.objectStore(table);
        let req = store.add(obj, id);
        return req;
    },
    update(db, table, id, obj) {
        let tx = db.transaction([table], 'readwrite');
        let store = tx.objectStore(table);
        let new_obj = JSON.parse(JSON.stringify(obj));
        let req = store.put(new_obj,id);
        return req;
    },
    delete(db, table, id) {
        let tx = db.transaction([table], 'readwrite');
        let store = tx.objectStore(table);
        let req = store.delete(id);
        return req;
    },
    selectAll(db, table){
        let tx = db.transaction([table], 'readwrite');
        let store = tx.objectStore(table);
        let req = store.openCursor();
        return req;
    },
    clear(db, table){
        let tx = db.transaction([table], 'readwrite');
        let store = tx.objectStore(table);
        let req = store.clear();
        return req;
    },
    replaceAll(db, recordsByTable) {
        const tables = ["todo_lists", "repeating_events", "repeating_events_by_date"];

        return new Promise((resolve, reject) => {
            const tx = db.transaction(tables, "readwrite");
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error || new Error("Unable to restore backup data"));
            tx.onabort = () => reject(tx.error || new Error("Backup restore was aborted"));

            tables.forEach((table) => {
                const store = tx.objectStore(table);
                store.clear();
                Object.entries(recordsByTable[table]).forEach(([key, value]) => store.put(value, key));
            });
        });
    },
    clearAll(db) {
        return this.replaceAll(db, {
            todo_lists: {},
            repeating_events: {},
            repeating_events_by_date: {},
        });
    }
};
