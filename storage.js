// Drop-in replacement for the Claude-artifact window.storage API,
// backed by IndexedDB so it works as a real standalone app.
window.storage = (function () {
  const dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open("garageDB", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("kv");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  return {
    async get(key, shared = false) {
      const db = await dbPromise;
      return new Promise((resolve, reject) => {
        const tx = db.transaction("kv", "readonly");
        const req = tx.objectStore("kv").get(key);
        req.onsuccess = () => resolve(req.result === undefined ? null : { key, value: req.result, shared });
        req.onerror = () => reject(req.error);
      });
    },
    async set(key, value, shared = false) {
      const db = await dbPromise;
      return new Promise((resolve, reject) => {
        const tx = db.transaction("kv", "readwrite");
        tx.objectStore("kv").put(value, key);
        tx.oncomplete = () => resolve({ key, value, shared });
        tx.onerror = () => reject(tx.error);
      });
    },
    async delete(key, shared = false) {
      const db = await dbPromise;
      return new Promise((resolve, reject) => {
        const tx = db.transaction("kv", "readwrite");
        tx.objectStore("kv").delete(key);
        tx.oncomplete = () => resolve({ key, deleted: true, shared });
        tx.onerror = () => reject(tx.error);
      });
    },
    async list(prefix = "", shared = false) {
      const db = await dbPromise;
      return new Promise((resolve, reject) => {
        const tx = db.transaction("kv", "readonly");
        const req = tx.objectStore("kv").getAllKeys();
        req.onsuccess = () => resolve({ keys: req.result.filter((k) => String(k).startsWith(prefix)), prefix, shared });
        req.onerror = () => reject(req.error);
      });
    },
  };
})();
