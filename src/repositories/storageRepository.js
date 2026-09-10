const STORAGE_KEYS = ["config", "customTodoListIds"];

export default {
    get(key) {
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch (_error) {
            return null;
        }
    },
    set(key, obj) {
        localStorage.setItem(key, JSON.stringify(obj));
    },
    remove(key) {
        localStorage.removeItem(key);
    },
    clean(){
        STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    },
    as_json(){
        const values = {};
        STORAGE_KEYS.forEach((key) => {
            const value = localStorage.getItem(key);
            if (value !== null) values[key] = value;
        });
        return values;
    },
    load_json(data){
        localStorage.setItem('config', data.config);
        localStorage.setItem('customTodoListIds', data.customTodoListIds);
    },
};
