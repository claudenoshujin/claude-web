import { saveRestoredTheme } from './theme-restore.js?v=2.0.133';

// SHA-256 of sorted complete preset JSON from ST 1.18's default/content/themes.
// TT 2.2 mobile's settings repository changes only chat_width to 100.
// The third fingerprint covers that exact official transformation, only in TT.
// A familiar name alone is insufficient: users can replace a bundled preset.
const bundledThemes = [
  ['Dark Lite', 'e688ccf16589eb7dd3088b29e47334827c10a01318907b09daef9952574e5560', '6bd2d080f3b9a3a8ede00dcf203a2592364d79fce25c4213106b0014f18fb7b1'],
  ['Azure', '694630d974fd61a86c7cbe4a4fe343dd8b5e4b2f4cc74df3dacb97e527415787', 'fc769b3c220e7ecd3698cd3f87ee7613f0e502bada9474dbdd96f18fe567fa7f'],
  ['Cappuccino', 'c22cba74fefe815054eb94b8d3a8a393601d417c472a6d629283ce80ba239350', 'db88abb41f0c1cc436da3542b7d99b77f39fc2b6e52c3ca2ab80f99f42b9ac92'],
  ['Celestial Macaron', 'c8782c5daf260c3d6405268ceebab06c136377e0569a33c8dbebf56d0d7221f6', '9c9caa47795f80ace01881fee4459cb3e7885fd571951b3c126d57133c4612d4'],
  ['Dark V 1.0', 'f5afaa26b7cb7a1f0d5a66f7f212efe4ae5177c0b9250520c33421ae4fd9cf1d', 'd2eba469b154644d6a4cd1045d71a1cd62ac14392119cbcd6ec33a096b5a58d0'],
];
const warningKey = 'claude-web:native-theme-warning:v1';
const missingMessage = 'CW 没找到可确认的酒馆原生 UI 主题，暂未启动。请在「用户设置 → UI 主题」手动选择原生主题，或恢复酒馆自带的主题预设，再点「重新启用 CW」。其他美化和预设不会被删除。';

export async function prepareNativeTheme(hostWindow = window, {allowManual = false, restoreFields = []} = {}) {
  const native = await import(new URL('/script.js', hostWindow.document.baseURI).href);
  for (let attempt = 0; native.settingsReady === false && attempt < 200; attempt++) await new Promise(resolve => hostWindow.setTimeout(resolve,100));
  if (native.settingsReady === false) throw new Error('酒馆主题设置尚未就绪，请稍后重新启用 CW');
  const context = hostWindow.SillyTavern?.getContext?.();
  const select = hostWindow.document.querySelector('#themes');
  if (!context?.powerUserSettings || !select) throw new Error('酒馆主题设置尚未就绪，请稍后重新启用 CW');
  const controller = new hostWindow.AbortController();
  const timer = hostWindow.setTimeout(() => controller.abort(), 8000);
  let data;
  try {
    const response = await hostWindow.fetch('/api/settings/get', {method:'POST', headers:context.getRequestHeaders(), body:'{}', signal:controller.signal});
    if (!response.ok) throw new Error('无法读取酒馆主题清单');
    data = await response.json();
  } finally { hostWindow.clearTimeout(timer); }
  let chosen;
  for (const [name, expected, ttMobileExpected] of bundledThemes) {
    const theme = data.themes?.find(theme => theme.name === name);
    if (!theme || ![...select.options].some(option => option.value === name && !option.disabled)) continue;
    const canonical = JSON.stringify(Object.fromEntries(Object.keys(theme).sort().map(key => [key, theme[key]])));
    const bytes = await hostWindow.crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical));
    const hash = [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2,'0')).join('');
    if (hash === expected || (typeof hostWindow.__TAURI__?.core?.invoke === 'function' && hash === ttMobileExpected)) { chosen = theme; break; }
  }
  let manual = false;
  if (!chosen && allowManual) {
    const current = data.themes?.find(theme => theme.name === select.value && !/^Claude Web/.test(theme.name));
    if (current) {
      const popup = await import(new URL('/scripts/popup.js', hostWindow.document.baseURI).href);
      // Popup.show.confirm builds HTML from a string (an element would print as
      // "[object HTMLDivElement]"), so pass text and escape the user's theme name.
      const name = String(current.name).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
      const text = '当前 UI 主题：' + name + '。CW 无法自动确认它是否为原生主题。你是否已在酒馆设置中手动换成原生主题，并确认继续启用 CW？';
      if (await popup.Popup.show.confirm('确认已手动更换主题', text)) { chosen = current; manual = true; }
    }
  }
  if (!chosen) {
    let warned = false;
    try { warned = hostWindow.localStorage.getItem(warningKey) === '1'; hostWindow.localStorage.setItem(warningKey,'1'); } catch {}
    if (!warned) {
      const popup = await import(new URL('/scripts/popup.js', hostWindow.document.baseURI).href);
      // Do not hold the extension loader or host startup until dismissal.
      void popup.callGenericPopup(missingMessage, popup.POPUP_TYPE.TEXT).catch(console.warn);
    }
    return {ready:false, message:missingMessage};
  }
  select.value = chosen.name;
  select.dispatchEvent(new hostWindow.Event('change', {bubbles:true}));
  const expected = {theme:chosen.name, ...Object.fromEntries(Object.entries(chosen).filter(([key]) => key !== 'name'))};
  if (Object.keys(expected).some(key => JSON.stringify(context.powerUserSettings[key]) !== JSON.stringify(expected[key]))) throw new Error('酒馆原生主题尚未完整应用');
  if (!restoreFields.length) throw new Error('Missing native restore field whitelist');
  const restore = JSON.parse(JSON.stringify(Object.fromEntries(restoreFields.map(key => [key, context.powerUserSettings[key]]))));
  await saveRestoredTheme(hostWindow, context, restore);
  try { hostWindow.localStorage.removeItem(warningKey); } catch {}
  return {ready:true, theme:chosen.name, manual, restore};
}
