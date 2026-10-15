import { saveRestoredTheme, hostScriptLoads } from './theme-restore.js?v=2.0.140';

// Candidate (not published): CW no longer locks onto a fingerprint-verified
// native preset. It applies its own bundled copy of the stock "Dark Lite"
// values (ST 1.18 default/content/themes/Dark Lite.json, identical to the file
// bundled with TauriTavern 2.3.0) as the base, so a modified or deleted preset
// can no longer keep CW switched off.
export const BUILTIN_DARK_LITE = Object.freeze({
  theme: 'Dark Lite',
  blur_strength: 10,
  main_text_color: 'rgba(220, 220, 210, 1)',
  italics_text_color: 'rgba(145, 145, 145, 1)',
  underline_text_color: 'rgba(188, 231, 207, 1)',
  quote_text_color: 'rgba(225, 138, 36, 1)',
  blur_tint_color: 'rgba(23, 23, 23, 1)',
  chat_tint_color: 'rgba(23, 23, 23, 1)',
  user_mes_blur_tint_color: 'rgba(30, 30, 30, 0.9)',
  bot_mes_blur_tint_color: 'rgba(30, 30, 30, 0.9)',
  shadow_color: 'rgba(0, 0, 0, 1)',
  shadow_width: 2,
  border_color: 'rgba(0, 0, 0, 1)',
  font_scale: 1,
  fast_ui_mode: true,
  waifuMode: false,
  avatar_style: 0,
  chat_display: 0,
  noShadows: true,
  chat_width: 50,
  timer_enabled: false,
  timestamps_enabled: true,
  timestamp_model_icon: true,
  mesIDDisplay_enabled: false,
  hideChatAvatars_enabled: false,
  message_token_count_enabled: false,
  expand_message_actions: false,
  enableZenSliders: '',
  enableLabMode: '',
  hotswap_enabled: true,
  custom_css: '',
  bogus_folders: true,
  reduced_motion: false,
  compact_input_area: true,
});

const notReady = '酒馆主题设置尚未就绪，请稍后重新启用 CW';
const isClaudeTheme = name => typeof name === 'string' && /^Claude Web/.test(name);
const clone = value => JSON.parse(JSON.stringify(value));

// Readiness never relies on `/script.js` alone: if the host loaded its app
// under another URL (TT retries with `script.js?tt_retry=…`), that import is a
// second, never-initialised instance whose flag stays false. It is imported only
// when resource timing shows a plain `/script.js` load (see hostScriptLoads);
// otherwise the live context and APP_READY / SETTINGS_LOADED decide.
// On failure the message names each check so a screenshot is enough to triage.
export async function waitHostSettings(hostWindow, timeoutMs = 60000, contextWaitMs = 20000) {
  const started = Date.now();
  const loads = hostScriptLoads(hostWindow);
  const facts = {instance: loads.urls.length ? (loads.safe ? '未比对' : '未导入（加载地址带参数）') : '未导入（无加载记录）', settingsReady: '未读', wait: '未开始'};
  const fail = context => {
    const list = loads.urls.join(' , ') || '无';
    const short = list.length > 240 ? list.slice(0, 240) + '…' : list;
    const parts = [
      'powerUserSettings ' + (context?.powerUserSettings ? '有' : '缺失'),
      'eventSource ' + (context?.eventSource ? '有' : '缺失'),
      '与 /script.js 同一实例：' + facts.instance,
      'settingsReady：' + facts.settingsReady,
      'APP_READY：' + facts.wait,
      '#themes ' + (hostWindow.document.querySelector('#themes') ? '有' : '无'),
    ];
    return new Error(notReady + '（' + parts.join('；') + '）script.js：' + short);
  };
  let context;
  while (Date.now() - started < contextWaitMs) {
    context = hostWindow.SillyTavern?.getContext?.();
    if (context?.powerUserSettings && context.eventSource) break;
    await new Promise(resolve => hostWindow.setTimeout(resolve, 100));
  }
  if (!context?.powerUserSettings || !context.eventSource) throw fail(context);
  if (loads.safe) {
    try {
      const native = await import(new URL('/script.js', hostWindow.document.baseURI).href);
      const same = native.eventSource === context.eventSource;
      facts.instance = same ? '是' : '否';
      facts.settingsReady = String(native.settingsReady);
      // A module export only counts when it is the very instance behind the context.
      if (same && native.settingsReady === true) return context;
    } catch (error) { facts.instance = '导入失败'; }
  }
  // APP_READY auto-fires for late listeners in ST 1.14, ST 1.18 and TT 2.3.0,
  // and is always emitted after settings were applied.
  const types = context.eventTypes || {};
  const events = [types.APP_READY, types.SETTINGS_LOADED].filter(Boolean);
  const waitMs = Math.max(1000, timeoutMs - (Date.now() - started));
  facts.wait = events.length ? '等待中' : '无事件类型';
  const ready = events.length && await new Promise(resolve => {
    let settled = false;
    const finish = value => {
      if (settled) return;
      settled = true;
      hostWindow.clearTimeout(timer);
      for (const event of events) context.eventSource.removeListener?.(event, onEvent);
      resolve(value);
    };
    const onEvent = () => finish(true);
    const timer = hostWindow.setTimeout(() => finish(false), waitMs);
    for (const event of events) context.eventSource.on(event, onEvent);
  });
  if (!ready) {
    if (events.length) facts.wait = '等待 ' + Math.round(waitMs / 1000) + ' 秒超时';
    throw fail(context);
  }
  return hostWindow.SillyTavern.getContext();
}

export async function prepareNativeTheme(hostWindow = window, {restoreFields = []} = {}) {
  if (!restoreFields.length) throw new Error('Missing native restore field whitelist');
  const context = await waitHostSettings(hostWindow);
  const settings = context.powerUserSettings;
  // Restore target: the user's own theme fields. Fall back to the bundled
  // Dark Lite only when the current theme already belongs to CW or is unknown.
  const original = clone(Object.fromEntries(restoreFields.map(key => [key, settings[key]])));
  const usable = typeof original.theme === 'string' && original.theme && !isClaudeTheme(original.theme);
  const restore = usable ? original : clone(BUILTIN_DARK_LITE);
  // Base CW runs on: bundled Dark Lite values; no preset lookup, no fingerprint.
  Object.assign(settings, clone(BUILTIN_DARK_LITE));
  const select = hostWindow.document.querySelector('#themes');
  if (select && [...select.options].some(option => option.value === BUILTIN_DARK_LITE.theme)) select.value = BUILTIN_DARK_LITE.theme;
  const customCss = hostWindow.document.querySelector('#customCSS');
  if (customCss) { customCss.value = ''; hostWindow.jQuery?.(customCss).trigger('input'); }
  await saveRestoredTheme(hostWindow, context, clone(BUILTIN_DARK_LITE));
  return {ready:true, theme:BUILTIN_DARK_LITE.theme, manual:false, restore, restoreSource: usable ? 'original' : 'builtin'};
}
