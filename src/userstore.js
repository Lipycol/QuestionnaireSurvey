const STORAGE_KEY = 'user';

export default {
  get(key=STORAGE_KEY) {
    return JSON.parse(window.localStorage.getItem(key));
  },
  save(items, key=STORAGE_KEY) {
    window.localStorage.setItem(key, JSON.stringify(items));
  },
  delete(key=STORAGE_KEY) {
    window.localStorage.removeItem(key);
  }
}