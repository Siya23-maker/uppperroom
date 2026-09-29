const PREFIX = 'upperroom:';

export const storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch { /* storage unavailable — UI keeps working in memory */ }
  },
  remove(key) {
    try { localStorage.removeItem(PREFIX + key); } catch { /* ignore */ }
  },
  clearAll() {
    try {
      Object.keys(localStorage).filter((k) => k.startsWith(PREFIX)).forEach((k) => localStorage.removeItem(k));
    } catch { /* ignore */ }
  },
};
