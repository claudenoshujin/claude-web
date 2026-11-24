// Ordinary CW preferences only. Safety/restore records keep their own confirmed
// persistence path; an in-memory value must never stand in for that confirmation.
const sessions = new WeakMap();
export const RELOAD_STORAGE_HINT = '浏览器本地存储已满或不可用，设置未保存；这次刷新后会恢复原样。';
export function preferencesFor(win = window) {
  if (sessions.has(win)) return sessions.get(win);
  const memory = new Map(), saved = new Map();
  let failed = false, notified = false;
  const notify = () => {
    if (!failed || notified || typeof win.toastr?.warning !== 'function') return;
    try {
      win.toastr.warning('浏览器本地存储已满，Claude Web 的设置暂时无法保存；本次使用中仍然有效。可以清理占用最多的插件数据，或者换浏览器。', 'Claude Web');
      notified = true;
    } catch {}
  };
  const failure = () => { failed = true; notify(); };
  const api = {
    getItem(key) {
      notify();
      if (memory.has(key)) return memory.get(key);
      try { return win.localStorage.getItem(key); } catch { return null; }
    },
    setItem(key, value) {
      value = String(value); memory.set(key, value);
      try { win.localStorage.setItem(key, value); saved.set(key, true); }
      catch { saved.set(key, false); failure(); }
      return true; // Accepted for this page, not a durability acknowledgement.
    },
    removeItem(key) {
      memory.set(key, null);
      try { win.localStorage.removeItem(key); saved.set(key, true); }
      catch { saved.set(key, false); failure(); }
    },
    isSaved(key) { return saved.get(key) !== false; },
  };
  sessions.set(win, api);
  // Early writes may precede toastr. Later reads/writes also retry notification.
  win.document?.addEventListener('DOMContentLoaded', notify, {once: true});
  return api;
}
