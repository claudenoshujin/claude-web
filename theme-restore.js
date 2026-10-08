// Native saveSettings catches HTTP errors, so its resolved promise alone is not
// a persistence acknowledgement. Read back the saved theme before reloading.
const activeSaves = new WeakMap();
const SAVE_CONFIRM_TIMEOUT_MS = 15000;

export async function saveRestoredTheme(hostWindow, context, expected) {
  if (activeSaves.has(hostWindow)) {
    const error = new Error('原生保存请求仍在进行，请等待后重试');
    error.code = 'CW_SAVE_PENDING';
    throw error;
  }
  let expired = false;
  let timer;
  const controller = new hostWindow.AbortController();
  const checkDeadline = () => {
    if (expired) throw new Error('主题保存确认已超时');
  };
  const work = Promise.resolve().then(async () => {
  const base = hostWindow.document.baseURI;
  const [native, utils] = await Promise.all([
    import(new URL('/script.js', base).href),
    import(new URL('/scripts/utils.js', base).href),
  ]);
  checkDeadline();
  if (typeof native.saveSettings !== 'function') throw new Error('原生保存接口不可用');
  utils.cancelDebounce?.(context.saveSettingsDebounced);
  const saveResult = await native.saveSettings();
  checkDeadline();
  if (saveResult === false) throw new Error('原生主题保存失败');
  const response = await hostWindow.fetch(new URL('/api/settings/get', base), {
    method: 'POST',
    headers: native.getRequestHeaders(),
    body: '{}',
    signal: controller.signal,
  });
  if (!response.ok) throw new Error('无法确认主题保存结果');
  const result = await response.json();
  checkDeadline();
  const saved = typeof result.settings === 'string' ? JSON.parse(result.settings) : result.settings;
  const actual = saved?.power_user;
  if (!actual || Object.keys(expected).some(key => JSON.stringify(actual[key]) !== JSON.stringify(expected[key]))) {
    throw new Error('恢复后的主题尚未保存');
  }
  });
  activeSaves.set(hostWindow, work);
  hostWindow.__claudeThemeSavePending = true;
  // Native saves do not accept our AbortSignal. After a timeout keep their
  // in-flight guard until settlement, but never let late completion clear a
  // restore record or reload. Only the bounded waiter may report success.
  const release = () => {
    if (activeSaves.get(hostWindow) === work) {
      activeSaves.delete(hostWindow);
      hostWindow.__claudeThemeSavePending = false;
    }
  };
  work.then(release, release);
  const timeout = new Promise((_, reject) => {
    timer = hostWindow.setTimeout(() => {
      expired = true;
      controller.abort();
      const error = new Error('主题保存确认等待超过15秒；已停止等待，不能取消原生保存请求');
      error.code = 'CW_SAVE_TIMEOUT';
      reject(error);
    }, SAVE_CONFIRM_TIMEOUT_MS);
  });
  try {
    await Promise.race([work, timeout]);
  } finally {
    hostWindow.clearTimeout(timer);
  }
}

export async function recoverPendingThemeRestore(hostWindow) {
  if (activeSaves.has(hostWindow)) {
    const error = new Error('原生保存请求仍在进行，请等待后重试');
    error.code = 'CW_SAVE_PENDING';
    throw error;
  }
  const key = 'claude-integrated-theme-restore:v2';
  const raw = hostWindow.localStorage.getItem(key);
  const safetyId = hostWindow.__claudeSafety?.state?.id;
  if (!raw) return false;
  const snapshot = JSON.parse(raw);
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) throw new Error('恢复快照格式错误');
  let context;
  for (let attempt = 0; attempt < 100; attempt++) {
    const bridge = hostWindow.SillyTavern;
    context = typeof bridge?.getContext === 'function' ? bridge.getContext() : bridge;
    if (context?.powerUserSettings) break;
    await new Promise(resolve => hostWindow.setTimeout(resolve, 100));
  }
  if (!context?.powerUserSettings) throw new Error('原生主题上下文不可用');
  await new Promise(resolve => {
    const source = context.eventSource, types = context.eventTypes;
    const events = [types?.SETTINGS_LOADED, types?.APP_READY].filter(Boolean);
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      hostWindow.clearTimeout(timer);
      for (const event of events) source?.removeListener?.(event, finish);
      resolve();
    };
    const timer = hostWindow.setTimeout(finish, 20000);
    for (const event of events) source?.once?.(event, finish);
    const loader = hostWindow.document.getElementById('preloader');
    if (hostWindow.document.readyState === 'complete' && (!loader || hostWindow.getComputedStyle(loader).display === 'none')) finish();
  });
  // A previous failed save can leave the stored CW theme active after a manual
  // reload. Recover only the captured theme fields, then reload after readback.
  for (let attempt = 0; attempt < 3; attempt++) {
    const settings = context.powerUserSettings;
    const select = hostWindow.document.querySelector('#themes, #theme_select');
    if (select && [...select.options].some(option => option.value === snapshot.theme)) {
      select.value = snapshot.theme;
      select.dispatchEvent(new hostWindow.Event('change', {bubbles: true}));
    }
    Object.assign(settings, snapshot);
    const customCss = hostWindow.document.querySelector('#customCSS, #custom_css');
    if (customCss) {
      customCss.value = settings.custom_css || '';
      hostWindow.jQuery?.(customCss).trigger('input');
    }
    try {
      await saveRestoredTheme(hostWindow, context, snapshot);
      if (hostWindow.localStorage.getItem(key) !== raw || hostWindow.localStorage.getItem('claude-web:enabled') !== 'off') return false;
      await hostWindow.__claudeSafety?.confirmRestore(raw, safetyId);
      hostWindow.localStorage.removeItem(key);
      return true;
    } catch (error) {
      if (error.code === 'CW_SAVE_TIMEOUT' || error.code === 'CW_SAVE_PENDING') throw error;
      if (attempt === 2) throw error;
      await new Promise(resolve => hostWindow.setTimeout(resolve, 750));
    }
  }
}
