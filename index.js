/* Claude Web 2.0 —— SillyTavern 扩展形态入口。
 *
 * 这个文件由 tools/build-extension.js 生成，不要手改。
 * 真正的源码在仓库的 src/ 下，改完跑 node tools/build-extension.js 重出。
 *
 * 设置在酒馆的「扩展」面板里，标题 Claude Web。
 * 底层存的是 localStorage，因为这个文件在模块求值时就要读出 variant/layout
 * 来决定挂哪份样式表，那一刻酒馆自己的设置还没加载完。
 *   localStorage['claude-web:variant'] = 'day' | 'night'            默认 day
 *   localStorage['claude-web:layout']  = 'auto' | 'pc' | 'mobile'   默认 auto
 */

const CLAUDE_EXTENSION_MODE = true;

/* 样式文件的地址从自身模块地址推导，这样用户把扩展文件夹叫什么都无所谓
   —— 酒馆按 git 仓库名建目录，写死路径迟早出错。 */
const CLAUDE_EXTENSION_BASE = new URL('.', import.meta.url).href;

const CLAUDE_THEMES = {
  "day": {
    "name": "Claude Web - Day 2.0 - Extension",
    "blur_strength": 0,
    "shadow_color": "rgba(0, 0, 0, 0)",
    "shadow_width": 0,
    "font_scale": 1,
    "fast_ui_mode": true,
    "waifuMode": false,
    "avatar_style": 3,
    "chat_display": 0,
    "toastr_position": "toast-top-center",
    "noShadows": true,
    "chat_width": 55,
    "timer_enabled": false,
    "timestamps_enabled": true,
    "timestamp_model_icon": false,
    "mesIDDisplay_enabled": false,
    "hideChatAvatars_enabled": false,
    "message_token_count_enabled": false,
    "expand_message_actions": false,
    "enableZenSliders": "",
    "enableLabMode": "",
    "hotswap_enabled": false,
    "bogus_folders": true,
    "zoomed_avatar_magnification": false,
    "reduced_motion": false,
    "compact_input_area": false,
    "show_swipe_num_all_messages": false,
    "click_to_edit": false,
    "media_display": "list",
    "reasoning_auto_expand": false,
    "main_text_color": "rgba(18,18,18,1)",
    "italics_text_color": "rgba(123,121,116,1)",
    "underline_text_color": "rgba(198,97,63,1)",
    "quote_text_color": "rgba(18,18,18,1)",
    "blur_tint_color": "rgba(248,248,246,1)",
    "chat_tint_color": "rgba(248,248,246,1)",
    "user_mes_blur_tint_color": "rgba(255,255,255,1)",
    "bot_mes_blur_tint_color": "rgba(248,248,246,1)",
    "border_color": "rgba(31,31,30,0.15)",
    "custom_css": ":root {\n  --cl-color-scheme:light;\n  --cl-canvas:#f8f8f6;\n  --cl-surface:#ffffff;\n  --cl-soft:#f4f4f1;\n  --cl-soft-hover:#efeeeb;\n  --cl-line:rgba(31,31,30,.15);\n  --cl-line-strong:rgba(31,31,30,.25);\n  --cl-hero:#373734;\n  --cl-ink:#121212;\n  --cl-muted:#7b7974;\n  --cl-control-muted:#686660;\n  --cl-icon:#0b0b0b;\n  --cl-rail-ink:#0b0b0b;\n  --cl-accent:#d97757;\n  --cl-accent-soft:#f3e0d8;\n  --cl-code:#f0eee6;\n  --cl-em-color:#6c6b66;\n  --cl-code-ink:#633a2e;\n  --cl-send-hover:#c6613f;\n  --cl-selection:#efcfc2;\n  --cl-scrollbar:#c9c5bc;\n  --cl-scrollbar-hover:#aaa59b;\n  --cl-dialog-shadow:0 12px 36px rgba(50,45,35,.12);\n  --cl-composer-shadow:0 10px 30px rgba(43,40,34,.10);\n  --cl-floating-shadow:0 14px 38px rgba(43,40,34,.11);\n  --cl-topbar-surface:rgba(248,248,246,.98);\n  --cl-body-weight:430;\n  --cl-clawd-eye:#000000;\n  --cl-clawd-eye-row-a:#000000;\n  --cl-clawd-eye-row-b:#d97757;\n  --cl-greeting-particle-shadow:39px 0 0 var(--cl-ink),42px 0 0 var(--cl-ink),45px 0 0 var(--cl-ink),45px 3px 0 var(--cl-ink),42px 6px 0 var(--cl-ink),21px 12px 0 var(--cl-ink),27px 12px 0 var(--cl-ink),33px 12px 0 var(--cl-ink),42px 12px 0 var(--cl-ink);\n  --cl-typing-float-animation:clawd-question-float 2.36s cubic-bezier(.37,0,.22,1) infinite;\n  --cl-greeting-particle-animation:clawd-question-float 2.83s cubic-bezier(.37,0,.22,1) .41s infinite;\n}"
  },
  "night": {
    "name": "Claude Web - Night 2.0 - Extension",
    "blur_strength": 0,
    "shadow_color": "rgba(0, 0, 0, 0)",
    "shadow_width": 0,
    "font_scale": 1,
    "fast_ui_mode": true,
    "waifuMode": false,
    "avatar_style": 3,
    "chat_display": 0,
    "toastr_position": "toast-top-center",
    "noShadows": true,
    "chat_width": 55,
    "timer_enabled": false,
    "timestamps_enabled": true,
    "timestamp_model_icon": false,
    "mesIDDisplay_enabled": false,
    "hideChatAvatars_enabled": false,
    "message_token_count_enabled": false,
    "expand_message_actions": false,
    "enableZenSliders": "",
    "enableLabMode": "",
    "hotswap_enabled": false,
    "bogus_folders": true,
    "zoomed_avatar_magnification": false,
    "reduced_motion": false,
    "compact_input_area": false,
    "show_swipe_num_all_messages": false,
    "click_to_edit": false,
    "media_display": "list",
    "reasoning_auto_expand": false,
    "main_text_color": "rgba(248,248,246,1)",
    "italics_text_color": "rgba(151,149,140,1)",
    "underline_text_color": "rgba(217,119,87,1)",
    "quote_text_color": "rgba(248,248,246,1)",
    "blur_tint_color": "rgba(31,31,30,1)",
    "chat_tint_color": "rgba(31,31,30,1)",
    "user_mes_blur_tint_color": "rgba(44,44,42,1)",
    "bot_mes_blur_tint_color": "rgba(31,31,30,1)",
    "border_color": "rgba(226,225,218,0.15)",
    "custom_css": ":root {\n  --cl-color-scheme:dark;\n  --cl-canvas:#1f1f1e;\n  --cl-surface:#2c2c2a;\n  --cl-soft:#2c2c2a;\n  --cl-soft-hover:#373734;\n  --cl-line:rgba(226,225,218,.15);\n  --cl-line-strong:rgba(226,225,218,.25);\n  --cl-hero:#c3c2b7;\n  --cl-ink:#f8f8f6;\n  --cl-muted:#97958c;\n  --cl-control-muted:#b8b6ae;\n  --cl-icon:#ffffff;\n  --cl-rail-ink:#ffffff;\n  --cl-accent:#d97757;\n  --cl-accent-soft:#3a2a22;\n  --cl-code:#131211;\n  --cl-em-color:#c3c2b7;\n  --cl-code-ink:#e6a58c;\n  --cl-send-hover:#c6613f;\n  --cl-selection:#5a3a2c;\n  --cl-scrollbar:#44423d;\n  --cl-scrollbar-hover:#55534c;\n  --cl-dialog-shadow:0 12px 36px rgba(0,0,0,.55);\n  --cl-composer-shadow:0 12px 34px rgba(0,0,0,.38);\n  --cl-floating-shadow:0 16px 42px rgba(0,0,0,.44);\n  --cl-topbar-surface:rgba(31,31,30,.98);\n  --cl-body-weight:400;\n  --cl-clawd-eye:#000000;\n  --cl-clawd-eye-row-a:#d97757;\n  --cl-clawd-eye-row-b:#000000;\n  --cl-greeting-particle-shadow:18px 0 0 #ef6a73,24px 0 0 #ef6a73,36px 0 0 #ef6a73,42px 0 0 #ef6a73,21px 3px 0 #ef6a73,33px 3px 0 #ef6a73,36px 3px 0 #ef6a73,39px 3px 0 #ef6a73,42px 3px 0 #ef6a73,45px 3px 0 #ef6a73,36px 6px 0 #ef6a73,39px 6px 0 #ef6a73,42px 6px 0 #ef6a73,39px 9px 0 #ef6a73,27px 12px 0 #ef6a73;\n  --cl-typing-float-animation:clawd-heart-float 2.36s cubic-bezier(.37,0,.22,1) infinite;\n  --cl-greeting-particle-animation:clawd-heart-float 2.57s cubic-bezier(.37,0,.22,1) .33s infinite;\n}"
  }
};

function claudeReadSetting(key, allowed, fallback) {
  try {
    const raw = window.localStorage.getItem('claude-web:' + key);
    return allowed.includes(raw) ? raw : fallback;
  } catch {
    return fallback;
  }
}

const CLAUDE_THEME_VARIANT = claudeReadSetting('variant', ['day', 'night'], 'day');

const CLAUDE_LAYOUT = (() => {
  const choice = claudeReadSetting('layout', ['auto', 'pc', 'mobile'], 'auto');
  if (choice !== 'auto') return choice;
  /* 和 CSS 里的主断点保持一致：700px 以下算手机。 */
  try {
    return window.matchMedia('(max-width:700px)').matches ? 'mobile' : 'pc';
  } catch {
    return 'pc';
  }
})();

const CLAUDE_FEATURES = {
  rail: true,
  welcome: true,
  mobile: CLAUDE_LAYOUT === 'mobile',
};

const CLAUDE_KEYBOARD_BUILD = {
  id: '2026-07-24-r22-nested-modal-chain-fix-' + CLAUDE_THEME_VARIANT + '-' + CLAUDE_LAYOUT + '-ext',
  mode: 'full',
};

const CLAUDE_THEME = CLAUDE_THEMES[CLAUDE_THEME_VARIANT];

const CLAUDE_STYLE_HREF = new URL(
  'styles/' + CLAUDE_THEME_VARIANT + '-' + CLAUDE_LAYOUT + '.css',
  CLAUDE_EXTENSION_BASE,
).href;

console.info(
  '[Claude Web] 扩展形态启动：' + CLAUDE_THEME_VARIANT + ' / ' + CLAUDE_LAYOUT
  + '（在酒馆「扩展」面板的 Claude Web 里可切换）',
);

(() => {
  'use strict';

  /* 两种形态共用这一份源码：
       · 酒馆助手脚本 —— 跑在 runner 的 iframe 里，宿主是 window.parent
       · SillyTavern 扩展 —— 跑在宿主页自己身上，宿主就是 window
     构建器给扩展包注入 CLAUDE_EXTENSION_MODE=true，脚本包不注入。
     typeof 判断对未声明的标识符是安全的，脚本形态下不会抛。 */
  const extensionMode = typeof CLAUDE_EXTENSION_MODE !== 'undefined' && CLAUDE_EXTENSION_MODE;
  const hostWindow = extensionMode ? window : window.parent;
  const hostDocument = hostWindow.document;
  const INSTANCE_KEY = '__claudeIntegratedTheme';
  const STYLE_ID = 'claude-integrated-theme-live-style';
  const OPTION_CLASS = 'claude-integrated-theme-option';
  const THEME_NAME = CLAUDE_THEME.name;
  const LIVE_CSS = typeof CLAUDE_LIVE_CSS !== 'undefined' ? CLAUDE_LIVE_CSS : CLAUDE_THEME.custom_css;
  const THEME_VALUES = Object.fromEntries(
    Object.entries(CLAUDE_THEME).filter(([key]) => key !== 'name'),
  );
  const RESTORE_KEY = 'claude-integrated-theme-restore:v2';
  const WATCHDOG_KEY = '__claudeIntegratedThemeWatchdog';
  const INSTANCE_TOKEN = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  let destroyed = false;
  let hostPageUnloading = false;
  let retryTimer = 0;
  let disableCheckTimer = 0;
  let runnerRemovalTimer = 0;
  let runnerPresenceObserver = null;
  const runnerFrame = window.frameElement;

  hostWindow[INSTANCE_KEY]?.destroy?.({ restore: false });

  function getContext() {
    if (typeof SillyTavern !== 'undefined') return SillyTavern;
    return hostWindow.SillyTavern ?? null;
  }

  function isClaudeThemeName(value) {
    return typeof value === 'string' && (value === THEME_NAME || value.startsWith('Claude Web ·'));
  }

  function readRestorePoint() {
    try {
      const raw = hostWindow.localStorage.getItem(RESTORE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function rememberRestorePoint(settings) {
    const existing = readRestorePoint();
    if (existing || isClaudeThemeName(settings.theme)) return;
    const snapshot = { theme: settings.theme ?? '' };
    for (const key of Object.keys(THEME_VALUES)) snapshot[key] = settings[key];
    try {
      hostWindow.localStorage.setItem(RESTORE_KEY, JSON.stringify(snapshot));
    } catch {
      // Storage can be blocked by a cloud host; native-theme fallback still works.
    }
  }

  function installLiveStyle() {
    /* 完整界面布局只在脚本存活时注入，不能写死进酒馆 custom_css。
       否则关闭脚本后原生顶栏仍被手机布局隐藏，会得到一个无法导航的空白页。

       扩展形态有真正的文件可以引用，走 <link> —— 浏览器能缓存它，
       样式重算也走正常路径，不必每次把 21 万字符的文本重新解析一遍。
       脚本形态没有可托管的文件，只能继续注入 <style> 文本。
       两条路用同一个 id，destroy 时的清理逻辑不用分叉。 */
    const href = typeof CLAUDE_STYLE_HREF !== 'undefined' ? CLAUDE_STYLE_HREF : '';
    const wanted = href ? 'LINK' : 'STYLE';
    let node = hostDocument.getElementById(STYLE_ID);
    if (node && node.tagName !== wanted) { node.remove(); node = null; }
    if (!node) {
      node = hostDocument.createElement(href ? 'link' : 'style');
      node.id = STYLE_ID;
      if (href) node.rel = 'stylesheet';
      hostDocument.head.append(node);
    }
    if (href) {
      if (node.getAttribute('href') !== href) node.setAttribute('href', href);
    } else {
      node.textContent = LIVE_CSS;
    }
    hostDocument.documentElement.dataset.claudeIntegratedTheme = CLAUDE_THEME_VARIANT;
  }

  function valuesMatch(left, right) {
    return JSON.stringify(left) === JSON.stringify(right);
  }

  function applyCssVariables(settings) {
    const root = hostDocument.documentElement.style;
    const variables = {
      main_text_color: '--SmartThemeBodyColor',
      italics_text_color: '--SmartThemeEmColor',
      underline_text_color: '--SmartThemeUnderlineColor',
      quote_text_color: '--SmartThemeQuoteColor',
      blur_tint_color: '--SmartThemeBlurTintColor',
      chat_tint_color: '--SmartThemeChatTintColor',
      user_mes_blur_tint_color: '--SmartThemeUserMesBlurTintColor',
      bot_mes_blur_tint_color: '--SmartThemeBotMesBlurTintColor',
      shadow_color: '--SmartThemeShadowColor',
      border_color: '--SmartThemeBorderColor',
    };
    Object.entries(variables).forEach(([property, variable]) => {
      if (settings[property] !== undefined) root.setProperty(variable, settings[property]);
    });
    root.setProperty('--blurStrength', `${Number(settings.blur_strength) || 0}px`);
    root.setProperty('--shadowWidth', `${Number(settings.shadow_width) || 0}px`);
    root.setProperty('--fontScale', String(Number(settings.font_scale) || 1));
    const chatWidth = `${Number(settings.chat_width) || 50}vw`;
    root.setProperty('--chatWidth', chatWidth);
    root.setProperty('--sheldWidth', chatWidth);
  }

  function applyUiState(settings) {
    const body = hostDocument.body;
    const classes = {
      'no-blur': settings.fast_ui_mode,
      waifuMode: settings.waifuMode,
      noShadows: settings.noShadows,
      'no-timer': !settings.timer_enabled,
      'no-timestamps': !settings.timestamps_enabled,
      'no-modelIcons': !settings.timestamp_model_icon,
      'no-mesIDDisplay': !settings.mesIDDisplay_enabled,
      hideChatAvatars: settings.hideChatAvatars_enabled,
      'no-tokenCount': !settings.message_token_count_enabled,
      expandMessageActions: settings.expand_message_actions,
      enableZenSliders: settings.enableZenSliders,
      enableLabMode: settings.enableLabMode,
      'no-hotswap': !settings.hotswap_enabled,
      'reduced-motion': settings.reduced_motion,
      swipeAllMessages: settings.show_swipe_num_all_messages,
    };
    Object.entries(classes).forEach(([className, enabled]) => {
      body.classList.toggle(className, Boolean(enabled));
    });
    const avatarStyle = Number(settings.avatar_style);
    body.classList.toggle('big-avatars', avatarStyle === 1);
    body.classList.toggle('square-avatars', avatarStyle === 2);
    body.classList.toggle('rounded-avatars', avatarStyle === 3);
    body.classList.remove('bubblechat', 'documentstyle');
    if (Number(settings.chat_display) === 1) body.classList.add('bubblechat');
    if (Number(settings.chat_display) === 2) body.classList.add('documentstyle');
    hostDocument.querySelector('#send_form')?.classList.toggle('compact', Boolean(settings.compact_input_area));
  }

  function setControl(selector, value, checked = false) {
    const element = hostDocument.querySelector(selector);
    if (!element) return;
    if (checked) element.checked = Boolean(value);
    else element.value = String(value);
  }

  function findThemeSelect(previousName) {
    const direct = hostDocument.querySelector('#themes, #theme_select, #theme-select, #ui_theme, #ui-theme');
    if (direct instanceof hostWindow.HTMLSelectElement) return direct;
    return [...hostDocument.querySelectorAll('select')].find(select => {
      const options = [...select.options];
      return options.some(option => option.value === previousName || /Azure/i.test(option.textContent ?? ''));
    }) ?? null;
  }

  function syncControls(settings, previousName, installThemeOption = true) {
    const controls = {
      '#blur_strength': settings.blur_strength,
      '#shadow_width': settings.shadow_width,
      '#font_scale': settings.font_scale,
      '#chat_width': settings.chat_width,
      '#avatar_style': settings.avatar_style,
      '#chat_display': settings.chat_display,
      '#toastr_position': settings.toastr_position,
      '#media_display': settings.media_display,
    };
    Object.entries(controls).forEach(([selector, value]) => setControl(selector, value));
    const checks = {
      '#fast_ui_mode': settings.fast_ui_mode,
      '#waifuMode': settings.waifuMode,
      '#noShadows': settings.noShadows,
      '#messageTimerEnabled': settings.timer_enabled,
      '#messageTimestampsEnabled': settings.timestamps_enabled,
      '#messageModelIconEnabled': settings.timestamp_model_icon,
      '#mesIDDisplayEnabled': settings.mesIDDisplay_enabled,
      '#hideChatAvatarsEnabled': settings.hideChatAvatars_enabled,
      '#messageTokensEnabled': settings.message_token_count_enabled,
      '#expandMessageActions': settings.expand_message_actions,
      '#enableZenSliders': settings.enableZenSliders,
      '#enableLabMode': settings.enableLabMode,
      '#hotswapEnabled': settings.hotswap_enabled,
      '#reduced_motion': settings.reduced_motion,
      '#compact_input_area': settings.compact_input_area,
      '#show_swipe_num_all_messages': settings.show_swipe_num_all_messages,
      '#click_to_edit': settings.click_to_edit,
      // 思维链默认折叠。这个开关不在酒馆的主题设置里，是「回复设置」下的独立项，
      // 但同样能靠勾选框写进去，所以一并带上。
      '#reasoning_auto_expand': settings.reasoning_auto_expand,
    };
    Object.entries(checks).forEach(([selector, value]) => setControl(selector, value, true));

    const customCss = hostDocument.querySelector('#customCSS, #custom_css');
    if (customCss) customCss.value = settings.custom_css;

    const themeSelect = findThemeSelect(previousName);
    if (themeSelect) {
      let option = [...themeSelect.options].find(item => item.value === THEME_NAME);
      if (!option && installThemeOption) {
        option = hostDocument.createElement('option');
        option.className = OPTION_CLASS;
        option.value = THEME_NAME;
        option.textContent = THEME_NAME;
        themeSelect.append(option);
      }
      const targetTheme = installThemeOption ? THEME_NAME : String(settings.theme ?? '');
      if ([...themeSelect.options].some(item => item.value === targetTheme)) themeSelect.value = targetTheme;
    }
  }

  function persistFullTheme() {
    const context = getContext();
    const settings = context?.powerUserSettings;
    if (!settings) return null;

    const previousName = settings.theme;
    rememberRestorePoint(settings);
    const changed = settings.theme !== THEME_NAME
      || Object.entries(THEME_VALUES).some(([key, value]) => !valuesMatch(settings[key], value));
    Object.assign(settings, THEME_VALUES);
    settings.theme = THEME_NAME;
    applyCssVariables(settings);
    applyUiState(settings);
    syncControls(settings, previousName);
    context.saveSettingsDebounced?.();
    return changed;
  }

  function nativeThemeFallback(themeSelect) {
    if (!(themeSelect instanceof hostWindow.HTMLSelectElement)) return false;
    const candidates = [...themeSelect.options].filter(option => (
      !option.disabled
      && !option.classList.contains(OPTION_CLASS)
      && option.value !== THEME_NAME
      && !isClaudeThemeName(option.value)
    ));
    const option = candidates.find(item => item.value && !/select|choose|选择|请选择/i.test(item.textContent ?? ''))
      ?? candidates[0];
    if (!option) return false;
    themeSelect.value = option.value;
    themeSelect.dispatchEvent(new hostWindow.Event('change', { bubbles: true }));
    return true;
  }

  function restorePreviousTheme() {
    const context = getContext();
    const settings = context?.powerUserSettings;
    const snapshot = readRestorePoint();
    const themeSelect = findThemeSelect(THEME_NAME);
    let restored = false;

    if (settings && snapshot && typeof snapshot === 'object') {
      Object.assign(settings, snapshot);
      applyCssVariables(settings);
      applyUiState(settings);
      syncControls(settings, THEME_NAME, false);
      const nativeOption = themeSelect instanceof hostWindow.HTMLSelectElement
        && [...themeSelect.options].some(option => option.value === String(snapshot.theme ?? ''));
      if (nativeOption) {
        themeSelect.value = String(snapshot.theme ?? '');
        themeSelect.dispatchEvent(new hostWindow.Event('change', { bubbles: true }));
      }
      restored = true;
    } else {
      /* 从旧版升级时可能没有启用前快照。至少先清掉旧版永久写入的整套
         Claude CSS，再尝试切换到一个酒馆原生主题，保证导航一定能回来。 */
      if (settings) {
        settings.custom_css = '';
        const customCss = hostDocument.querySelector('#customCSS, #custom_css');
        if (customCss) customCss.value = '';
        restored = true;
      }
      restored = nativeThemeFallback(themeSelect);
      if (!restored && settings) restored = true;
    }

    if (!restored) return;
    try {
      hostWindow.localStorage.removeItem(RESTORE_KEY);
    } catch { /* no-op */ }
    context?.saveSettingsDebounced?.();
    /* Disabling must not reload the host page. TavernHelper saves the toggle
       asynchronously; reloading here could race that save and resurrect the
       package's imported `enabled: true` value. The settings and runtime CSS
       are already restored synchronously, so a resize is enough to let the
       native layout settle in place. */
    hostWindow.requestAnimationFrame?.(() => {
      hostWindow.dispatchEvent(new hostWindow.Event('resize'));
    });
  }

  function removeRuntimeArtifacts() {
    try { hostWindow.__claudeClawdInteraction?.destroy?.(); } catch { /* iframe may already be detaching */ }
    hostDocument.getElementById('form_sheld')?.style.removeProperty('--cl-mobile-composer-translate-y');
    hostDocument.getElementById(STYLE_ID)?.remove();
    hostDocument.getElementById('claude-clawd-interaction-style')?.remove();
    hostDocument.querySelectorAll(`option.${OPTION_CLASS}`).forEach(option => option.remove());
    hostDocument.querySelectorAll([
      '.clawd-mobile-chrome',
      '.clawd-mobile-scrim',
      '.clawd-mobile-new-chat',
      '.clawd-character-menu',
      '.clawd-character-switcher',
      '.clawd-rail-brand',
      '.clawd-rail-grip',
      '.claude-user-message-actions',
      '.claude-swipe-left-proxy',
      '.claude-swipe-right-proxy',
      '.claude-reroll-button',
      '.clawd-signoff-button',
    ].join(',')).forEach(element => element.remove());
    hostDocument.body?.classList.remove(
      'clawd-interactive-ready',
      'claude-generation-active',
      'clawd-mobile-layout',
      'clawd-mobile-menu-open',
      'clawd-tauritavern-host',
      'clawd-welcome',
      'clawd-has-recents',
    );
    delete hostDocument.documentElement.dataset.claudeIntegratedTheme;
    for (const property of [
      '--cl-mobile-composer-height',
      '--cl-mobile-viewport-height',
      '--cl-mobile-viewport-top',
      '--clawd-signoff-image',
    ]) hostDocument.documentElement.style.removeProperty(property);
  }

  /* Parent-realm fallback. TavernHelper 4.8.19 documents pagehide as the normal
     unload hook, but its own "fallback cleanup" exists because some browsers do
     not complete iframe cleanup reliably. This observer and its timers are created
     in the SillyTavern realm, so they outlive the script iframe. */
  function installHostWatchdog() {
    if (!(runnerFrame instanceof hostWindow.HTMLIFrameElement)) return;
    try {
      const install = hostWindow.Function(
        'frame', 'instanceKey', 'instanceToken', 'restoreKey', 'styleId', 'optionClass', 'watchdogKey',
        `
          if (window[watchdogKey] && typeof window[watchdogKey].stop === 'function') {
            window[watchdogKey].stop();
          }
          var timer = 0;
          var stopped = false;
          var observer = null;
          function stop() {
            stopped = true;
            if (timer) window.clearTimeout(timer);
            timer = 0;
            if (observer) observer.disconnect();
            observer = null;
          }
          function restoreAndCleanup() {
            if (stopped) return;
            var replacement = window[instanceKey];
            if (replacement && replacement.token && replacement.token !== instanceToken) {
              stop();
              return;
            }
            var doc = window.document;
            var body = doc.body;
            var root = doc.documentElement;
            try { window.__claudeClawdInteraction && window.__claudeClawdInteraction.destroy && window.__claudeClawdInteraction.destroy(); } catch (_) {}
            var composer = doc.getElementById('form_sheld');
            if (composer) composer.style.removeProperty('--cl-mobile-composer-translate-y');
            var ids = [styleId, 'claude-clawd-interaction-style'];
            ids.forEach(function (id) { var node = doc.getElementById(id); if (node) node.remove(); });
            doc.querySelectorAll('option.' + optionClass).forEach(function (node) { node.remove(); });
            doc.querySelectorAll('.clawd-mobile-chrome,.clawd-mobile-scrim,.clawd-mobile-new-chat,.clawd-character-menu,.clawd-character-switcher,.clawd-rail-brand,.clawd-rail-grip,.claude-user-message-actions,.claude-swipe-left-proxy,.claude-swipe-right-proxy,.claude-reroll-button,.clawd-signoff-button').forEach(function (node) { node.remove(); });
            if (body) body.classList.remove('clawd-interactive-ready','claude-generation-active','clawd-mobile-layout','clawd-mobile-menu-open','clawd-tauritavern-host','clawd-welcome','clawd-has-recents');
            if (root) {
              delete root.dataset.claudeIntegratedTheme;
              ['--cl-mobile-composer-height','--cl-mobile-viewport-height','--cl-mobile-viewport-top','--clawd-signoff-image'].forEach(function (name) { root.style.removeProperty(name); });
            }
            var snapshot = null;
            try { snapshot = JSON.parse(window.localStorage.getItem(restoreKey) || 'null'); } catch (_) {}
            var context = window.SillyTavern && typeof window.SillyTavern.getContext === 'function'
              ? window.SillyTavern.getContext()
              : window.SillyTavern;
            var settings = context && context.powerUserSettings;
            if (settings && snapshot && typeof snapshot === 'object') Object.assign(settings, snapshot);
            else if (settings) settings.custom_css = '';
            if (settings && snapshot) {
              var select = doc.querySelector('#themes,#theme_select,#theme-select,#ui_theme,#ui-theme');
              if (select && Array.from(select.options || []).some(function (option) { return option.value === String(snapshot.theme || ''); })) {
                select.value = String(snapshot.theme || '');
                select.dispatchEvent(new window.Event('change', { bubbles: true }));
              }
            }
            try { window.localStorage.removeItem(restoreKey); } catch (_) {}
            if (context && typeof context.saveSettingsDebounced === 'function') context.saveSettingsDebounced();
            window.requestAnimationFrame(function () {
              window.dispatchEvent(new window.Event('resize'));
            });
          }
          function check() {
            if (stopped || frame.isConnected) return;
            if (observer) observer.disconnect();
            observer = null;
            if (timer) window.clearTimeout(timer);
            timer = window.setTimeout(restoreAndCleanup, 220);
          }
          observer = new window.MutationObserver(check);
          observer.observe(window.document.body, { childList: true, subtree: true });
          window[watchdogKey] = { token: instanceToken, stop: stop, cleanup: restoreAndCleanup };
        `,
      );
      install(runnerFrame, INSTANCE_KEY, INSTANCE_TOKEN, RESTORE_KEY, STYLE_ID, OPTION_CLASS, WATCHDOG_KEY);
    } catch (error) {
      console.warn('[Claude Theme] Could not install parent cleanup watchdog.', error);
    }
  }

  /* 5.x 版本这里曾经在首次套用主题后自动 location.reload() 一次，
     用来确保只靠运行时 DOM 补丁盖不到的原生初始化逻辑也能生效。
     按要求去掉：不再自动刷新页面，套用即时生效的部分立刻可见，
     剩下依赖页面初始化的部分交给用户自己手动刷新一次。 */
  function start(attempt = 0) {
    if (destroyed) return;
    installLiveStyle();
    const changed = persistFullTheme();
    if (changed === null && attempt < 12) {
      retryTimer = hostWindow.setTimeout(() => start(attempt + 1), 250);
      return;
    }
    hostWindow.setTimeout(() => {
      if (!destroyed) persistFullTheme();
    }, 800);
  }

  function destroy({ restore = false } = {}) {
    if (destroyed) return;
    destroyed = true;
    if (retryTimer) hostWindow.clearTimeout(retryTimer);
    if (disableCheckTimer) hostWindow.clearTimeout(disableCheckTimer);
    if (runnerRemovalTimer) hostWindow.clearTimeout(runnerRemovalTimer);
    runnerPresenceObserver?.disconnect();
    runnerPresenceObserver = null;
    const watchdog = hostWindow[WATCHDOG_KEY];
    if (watchdog?.token === INSTANCE_TOKEN) {
      watchdog.stop?.();
      delete hostWindow[WATCHDOG_KEY];
    }
    hostWindow.removeEventListener('beforeunload', markHostPageUnloading, true);
    hostWindow.removeEventListener('pagehide', markHostPageUnloading, true);
    removeRuntimeArtifacts();
    if (hostWindow[INSTANCE_KEY] === api) delete hostWindow[INSTANCE_KEY];
    if (restore) restorePreviousTheme();
  }

  function markHostPageUnloading() {
    hostPageUnloading = true;
  }

  function handleRunnerPageHide() {
    if (hostPageUnloading) {
      destroy({ restore: false });
      return;
    }
    /* pagehide is TavernHelper's documented script-disable hook. Cleanup must be
       synchronous: delaying it means Via can destroy this realm before it runs. */
    destroy({ restore: true });
  }

  function watchRunnerPresence() {
    if (!(runnerFrame instanceof hostWindow.HTMLIFrameElement) || !hostWindow.MutationObserver) return;
    runnerPresenceObserver = new hostWindow.MutationObserver(() => {
      if (runnerFrame.isConnected || hostPageUnloading) return;
      runnerPresenceObserver?.disconnect();
      runnerPresenceObserver = null;
      runnerRemovalTimer = hostWindow.setTimeout(() => {
        const replacement = hostWindow[INSTANCE_KEY];
        if (hostPageUnloading || (replacement && replacement !== api)) return;
        destroy({ restore: true });
      }, 180);
    });
    runnerPresenceObserver.observe(hostDocument.body, { childList: true, subtree: true });
  }

  const api = { token: INSTANCE_TOKEN, destroy, apply: persistFullTheme };
  hostWindow[INSTANCE_KEY] = api;
  hostWindow.addEventListener('beforeunload', markHostPageUnloading, true);
  hostWindow.addEventListener('pagehide', markHostPageUnloading, true);
  watchRunnerPresence();
  installHostWatchdog();
  $(start);
  window.addEventListener('pagehide', handleRunnerPageHide, { once: true });
  window.addEventListener('unload', handleRunnerPageHide, { once: true });
  $(window).on('pagehide', handleRunnerPageHide);
})();


(() => {
  'use strict';

  /* 见 integrated-theme-runtime.js 顶部的说明：同一份源码同时服务
     酒馆助手脚本（宿主是 window.parent）和 SillyTavern 扩展（宿主就是 window）。 */
  const hostWindow = (typeof CLAUDE_EXTENSION_MODE !== 'undefined' && CLAUDE_EXTENSION_MODE)
    ? window
    : window.parent;
  const hostDocument = hostWindow.document;
  const INSTANCE_KEY = '__claudeClawdInteraction';
  /* 打包时由 tools/pack.js 注入 { id, mode }。
     mode 'full'     正常包 / B 诊断包：键盘避让全套逻辑；
     mode 'baseline' A 诊断包：输入框只做原生 position:fixed;bottom:0，
                   全部键盘 JS（translate、settle、根视口变量写入、
                   VirtualKeyboard overlay）一律旁路，用来判定主题键盘 JS
                   本身是不是悬空/顿挫的来源。 */
  const KEYBOARD_BUILD = typeof CLAUDE_KEYBOARD_BUILD !== 'undefined'
    ? CLAUDE_KEYBOARD_BUILD
    : { id: 'dev', mode: 'full' };
  const keyboardBaselineMode = KEYBOARD_BUILD.mode === 'baseline';
  const READY_CLASS = 'clawd-interactive-ready';
  const EMPTY_CLASS = 'claude-empty-assistant';
  const GENERATING_CLASS = 'claude-generation-active';
  const BUTTON_CLASS = 'clawd-signoff-button';
  const LEFT_SWIPE_PROXY_CLASS = 'claude-swipe-left-proxy';
  const SWIPE_PROXY_CLASS = 'claude-swipe-right-proxy';
  const REROLL_CLASS = 'claude-reroll-button';
  const PRESET_REASONING_CLASS = 'claude-has-preset-reasoning';
  const SWIPE_VIEW_CLASS = 'claude-swipe-in-viewport';
  const USER_ACTIONS_CLASS = 'claude-user-message-actions';
  const USER_EDIT_CLASS = 'claude-user-message-edit';
  const USER_DELETE_CLASS = 'claude-user-message-delete';
  const WELCOME_ASSISTANT_CLASS = 'claude-welcome-clawd-assistant';
  const WELCOME_PROMPT_CLASS = 'claude-welcome-prompt';
  const CHARACTER_SWITCHER_CLASS = 'clawd-character-switcher';
  const CHARACTER_MENU_CLASS = 'clawd-character-menu';
  const FAKE_MIC_CLASS = 'clawd-fake-mic';
  const LAST_CHARACTER_KEY = 'clawd-last-character-name';
  const LAST_HERO_KEY = 'clawd-last-hero-line';
  const MOBILE_MENU_OPEN_CLASS = 'clawd-mobile-menu-open';
  const MOBILE_LAYOUT_CLASS = 'clawd-mobile-layout';
  const VIRTUAL_KEYBOARD_OVERLAY_CLASS = 'clawd-virtual-keyboard-overlay';
  const TAURITAVERN_HOST_CLASS = 'clawd-tauritavern-host';
  const MOBILE_COMPOSER_HEIGHT_PROPERTY = '--cl-mobile-composer-height';
  const MOBILE_COMPOSER_TRANSLATE_PROPERTY = '--cl-mobile-composer-translate-y';
  const MOBILE_VIEWPORT_HEIGHT_PROPERTY = '--cl-mobile-viewport-height';
  const MOBILE_VIEWPORT_TOP_PROPERTY = '--cl-mobile-viewport-top';
  const STYLE_ID = 'claude-clawd-interaction-style';
  const EMBED_STYLE_ID = 'claude-embedded-surface-style';
  const EMBED_ATTRIBUTE = 'data-claude-transparent-surface';
  const EMBED_SRCDOC_MARKER = '<!-- claude-transparent-surface -->';
  const REGEX_SURFACE_CLASS = 'claude-transparent-regex-surface';
  const PARTICLES = [
    { text: '\u2726', className: 'clawd-particle-star' },
    { text: '\u2727', className: 'clawd-particle-star' },
    { text: '?', className: 'clawd-particle-question' },
    { text: '\u2665', className: 'clawd-particle-heart' },
    { text: '\u00b7', className: 'clawd-particle-dot' },
  ];
  const BUTTON_REACTIONS = [
    'clawd-react-hop',
    'clawd-react-wiggle',
    'clawd-react-nod',
    'clawd-react-peek',
    'clawd-react-shy',
    'clawd-react-nudge',
  ];
  const TYPING_MOTION_CLASSES = [
    'clawd-cheer',
    'clawd-wobble-sway',
    'clawd-wobble-tilt',
    'clawd-typing-click',
  ];

  const CLAWD_IMAGE =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAABf0lEQVR4nO3cwUkDURRG4enHEtzEvfshHQgWcLcpJfbhIl3crZ1EAoIgeTEBzfzR78DZ5TF33plFmJA3TQAAAAAAAAAAAAAAAAAAAAAAAAAAALg9uuZV17zhfI6rawQ5XGjP+Rw3glSUgnSWgnSWgnSWgnSWgnSWgnSWgnSWgnSWgnSWgnSWmUGmaTrqy/ph6Q3bf/Uw02heQUoQQdaCRPkiyPIRWhBBfgxBZkFaEEEmQTIUJCBCCyLIokGe7++O+vr0uHiA/uJhptG8fybIP3YjSEUpSGcpSGcpSN96kI+/F1ziNuBG9zfi9tL9nQKGZn0qSGUpSGUpSGUpSGUpSGUpSGUpSGUpSGUpSGUpSGUpSGXp5WKFvVz0+n3+Tf0e0lkK0lkK0lkK0v8wyOhEuVPfvkYnrr0NPr+7wmlvu8G1306sGd3fdrET5b4JdXTgE2t2Sz1ZPd7g3Yk1oyDLbfwIQcIQJAxBwhAkDEHCECQMQcIQJAxBwhAkDEGmH+EdPR0/XvA9afUAAAAASUVORK5CYII=';

  let observer = null;
  let scrollHost = null;
  let lastManualScrollAt = 0;
  let frameId = 0;
  let destroyed = false;
  let previousTypingActive = false;
  let generationEventActive = false;
  const generationSubscriptions = [];
  let lastGenerationDoneAt = 0;
  let settlePending = false;
  let typingRunId = 0;
  const typingMotionTimers = new Map();
  const typingEntryTimers = new Map();
  /* 退场 ghost：indicator -> { ghost, timer }。原生节点只负责被压制，
     向下收回的动画在脱离酒馆 DOM 的 fixed 副本上播放，酒馆的任何
     同步位移都追不到它。 */
  const typingExitGhosts = new Map();
  /* 生成中最后一个稳定位置/姿势的快照。结束时再读坐标不可靠：
     GENERATION_ENDED 触发时酒馆可能已经把 typing 节点向右挪了一帧。 */
  const typingStableSnapshots = new WeakMap();
  const emptyTimers = new Map();
  /* hasMessageContent 的结果缓存。楼层一多，每轮刷新都把所有历史消息的
     textContent 抓出来跑一遍正则，代价随聊天总文本量线性增长——这是
     "没楼层时正常，一有楼层就卡，发送/生成后尤其明显" 的主因：
     generationJustEnded 那次全量刷新，本来只有最新一条消息的内容是新的，
     却要把所有历史消息重新读一遍文本。
     现在只有真的被 MutationObserver 记录到变化（见 dirtyMessages）的消息
     才重新计算，没变过的历史消息直接用缓存，开销从 O(全部楼层文本) 降到
     O(这一轮真正变化的部分)。用 WeakMap 是因为消息 DOM 节点被删除/替换后
     不需要手动清理，垃圾回收会自动带走对应缓存项。 */
  const messageContentCache = new WeakMap();
  const dirtyMessages = new Set();
  const embeddedFrameHandlers = new Map();
  const embeddedFrameOriginalSrcdoc = new Map();
  const welcomeAvatarOriginals = new Map();
  const nativeDeleteBypass = new WeakSet();
  let characterMenu = null;
  let mobileChrome = null;
  let mobileNavHolder = null;
  let mobileNavCloseHandler = null;
  let composerResizeObserver = null;
  let observedComposerShell = null;
  let composerInsetRaf = 0;
  let composerBottomRaf = 0;
  let lastComposerHeight = 0;
  let mobileComposerTranslateRaf = 0;
  let viewportSettleTimer = 0;
  let lastViewportWidth = Math.round(hostWindow.visualViewport?.width || hostWindow.innerWidth || 0);
  let mobileViewportSettleTimers = [];
  let mobileKeyboardSettlingUntil = 0;
  let virtualKeyboardOverlayActive = false;
  let virtualKeyboardOverlayOriginal = false;
  let virtualKeyboardOverlayCaptured = false;
  let mobileStableLayoutHeight = Math.max(
    1,
    Math.round(hostWindow.innerHeight || hostDocument.documentElement.clientHeight || 1),
  );
  let mobileKeyboardRecoveryActive = false;

  hostWindow[INSTANCE_KEY]?.destroy?.();

  function installStyle() {
    hostDocument.getElementById(STYLE_ID)?.remove();
    const style = hostDocument.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      body.${READY_CLASS} #chat > .mes.last_mes[is_user="false"] .mes_text::before,
      body.${READY_CLASS} #chat > .mes[is_user="false"]:last-child .mes_text::before,
      body.${READY_CLASS} #chat > .mes.last_mes[is_user="false"] .mes_text::after,
      body.${READY_CLASS} #chat > .mes[is_user="false"]:last-child .mes_text::after {
        display: none !important;
        content: none !important;
      }

      #chat > .mes.${EMPTY_CLASS}[is_user="false"] {
        display: none !important;
      }

      #chat > .mes[is_user="false"] .mes_text :is(iframe, object, embed) {
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        outline: 0 !important;
        box-shadow: none !important;
        background: transparent !important;
        background-color: transparent !important;
      }

      html[data-claude-integrated-theme="night"] body
        #chat > .mes[is_user="false"] .mes_text .${REGEX_SURFACE_CLASS} {
        background: transparent !important;
        background-color: transparent !important;
      }

      body.${READY_CLASS} #chat > .mes[is_user="false"] > .swipe_left,
      body.${READY_CLASS} #chat > .mes[is_user="false"] > .swipeRightBlock,
      body.${GENERATING_CLASS} #chat > .mes[is_user="false"] > button.${LEFT_SWIPE_PROXY_CLASS},
      body.${GENERATING_CLASS} #chat > .mes[is_user="false"] > button.${SWIPE_PROXY_CLASS} {
        display: none !important;
      }

      #chat > .mes.${PRESET_REASONING_CLASS}[is_user="false"] .mes_reasoning_details {
        display: none !important;
      }

      #chat > .mes.${PRESET_REASONING_CLASS}[is_user="false"] :is(.mes_text, .mes_text > :not(.${BUTTON_CLASS})) {
        box-sizing: border-box !important;
        max-width: 100% !important;
      }

      #chat > .mes.${PRESET_REASONING_CLASS}[is_user="false"] .mes_text > :not(.${BUTTON_CLASS}) {
        width: 100% !important;
        min-width: 0 !important;
      }

      button.${BUTTON_CLASS} {
        appearance: none !important;
        -webkit-appearance: none !important;
        -webkit-tap-highlight-color: transparent !important;
        position: relative !important;
        isolation: isolate !important;
        display: block !important;
        box-sizing: border-box !important;
        width: 42px !important;
        min-width: 42px !important;
        max-width: 42px !important;
        height: 34px !important;
        min-height: 34px !important;
        max-height: 34px !important;
        margin: 14px 0 1px !important;
        padding: 0 !important;
        overflow: visible !important;
        color: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
        background-repeat: no-repeat !important;
        background-position: left bottom !important;
        background-size: 42px 42px !important;
        border: 0 !important;
        border-radius: 0 !important;
        outline: 0 !important;
        box-shadow: none !important;
        filter: none;
        cursor: pointer !important;
        image-rendering: pixelated;
        line-height: 0 !important;
        transform: translateY(0) scale(1) rotate(0);
        transform-origin: center bottom;
        transition: transform 150ms cubic-bezier(.2,.8,.25,1.25), filter 150ms ease !important;
      }

      button.${BUTTON_CLASS}:hover {
        filter: saturate(1.08);
        transform: translateY(-1px);
      }

      /* 触屏上 :active 容易粘住不清，还会跟点击后 JS 加的反应 class
         抢同一个 transform 属性，把 clawd-react-* 那几个动画盖掉，
         看起来像"只有压扁"。换成 JS 用 pointerdown/up 控制的
         .clawd-button-press，这份样式和 theme-shared.css 里另一份
         squash 规则统一用同一个触发方式，两处都不再依赖 :active。 */
      button.${BUTTON_CLASS}.clawd-button-press {
        transform: translateY(2px) scaleX(1.1) scaleY(.76) rotate(-2deg);
        transition-duration: 55ms !important;
      }

      button.${BUTTON_CLASS}.clawd-button-pop {
        animation: clawd-button-pop 480ms cubic-bezier(.2,.82,.22,1) both !important;
      }

      button.${BUTTON_CLASS}.clawd-button-settle {
        animation: clawd-button-settle 520ms cubic-bezier(.2,.78,.18,1) both !important;
      }

      button.${BUTTON_CLASS}.clawd-react-hop {
        animation: clawd-react-hop 560ms cubic-bezier(.2,.82,.22,1) both !important;
      }

      button.${BUTTON_CLASS}.clawd-react-wiggle {
        animation: clawd-react-wiggle 620ms cubic-bezier(.2,.8,.25,1.15) both !important;
      }

      button.${BUTTON_CLASS}.clawd-react-nod {
        animation: clawd-react-nod 520ms cubic-bezier(.2,.8,.25,1.15) both !important;
      }

      button.${BUTTON_CLASS}.clawd-react-peek {
        animation: clawd-react-peek 680ms cubic-bezier(.2,.82,.22,1) both !important;
      }

      button.${BUTTON_CLASS}.clawd-react-shy {
        animation: clawd-react-shy 720ms cubic-bezier(.2,.76,.22,1) both !important;
      }

      button.${BUTTON_CLASS}.clawd-react-nudge {
        animation: clawd-react-nudge 480ms cubic-bezier(.3,.7,.3,1.2) both !important;
      }

      button.${BUTTON_CLASS}.clawd-poke-blink::before {
        animation: none !important;
        box-shadow: var(--clawd-f-blink) !important;
      }

      button.${BUTTON_CLASS}.clawd-poke-look::before {
        animation: none !important;
        box-shadow: var(--clawd-f-look-l) !important;
      }

      button.${BUTTON_CLASS}.clawd-poke-tucked::before {
        animation: none !important;
        box-shadow: var(--clawd-f-tucked) !important;
      }

      .clawd-click-particle {
        position: fixed !important;
        z-index: 10020 !important;
        display: block !important;
        width: max-content !important;
        color: var(--cl-accent, #d97757) !important;
        font-family: var(--cl-sans, ui-sans-serif, sans-serif) !important;
        font-size: 12px !important;
        font-weight: 700 !important;
        font-style: normal !important;
        line-height: 1 !important;
        text-shadow: none !important;
        pointer-events: none !important;
        animation: clawd-particle-out 680ms cubic-bezier(.16,.76,.2,1) both !important;
      }

      .clawd-click-particle.clawd-particle-question { color: var(--cl-muted, #8b8780) !important; }
      .clawd-click-particle.clawd-particle-heart { color: var(--cl-accent, #d97757) !important; }
      .clawd-click-particle.clawd-particle-star { color: #d9a45f !important; }
      .clawd-click-particle.clawd-particle-dot { color: var(--cl-muted, #8b8780) !important; }

      #chat > .mes[is_user="false"] {
        position: relative !important;
      }

      body.${READY_CLASS} #chat > .mes[is_user="true"] .mes_buttons {
        display: none !important;
      }

      #chat > .mes[is_user="true"] .mes_block {
        overflow: visible !important;
      }

      #chat > .mes[is_user="true"] .${USER_ACTIONS_CLASS} {
        display: flex !important;
        align-items: center !important;
        justify-content: flex-end !important;
        gap: 3px !important;
        box-sizing: border-box !important;
        width: 100% !important;
        min-height: 28px !important;
        margin: 3px 0 0 !important;
        padding: 0 2px !important;
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
        transform: translateY(0) !important;
        transition: opacity 150ms ease, visibility 150ms ease, transform 150ms ease !important;
      }

      #chat > .mes[is_user="true"] .mes_block:has(.edit_textarea) > .${USER_ACTIONS_CLASS} {
        display: none !important;
      }

      #chat > .mes[is_user="true"] .${USER_ACTIONS_CLASS} > button {
        appearance: none !important;
        -webkit-appearance: none !important;
        -webkit-tap-highlight-color: transparent !important;
        position: relative !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        flex: 0 0 28px !important;
        box-sizing: border-box !important;
        width: 28px !important;
        min-width: 28px !important;
        height: 28px !important;
        min-height: 28px !important;
        margin: 0 !important;
        padding: 0 !important;
        color: var(--cl-muted, #8b8780) !important;
        background: transparent !important;
        border: 0 !important;
        border-radius: 8px !important;
        box-shadow: none !important;
        opacity: .62 !important;
        cursor: pointer !important;
        transition: color 140ms ease, opacity 140ms ease, background 140ms ease, transform 140ms ease !important;
      }

      #chat > .mes[is_user="true"] .${USER_ACTIONS_CLASS} > button::before {
        font-family: "Font Awesome 6 Free", "Font Awesome 5 Free" !important;
        font-size: 12px !important;
        font-weight: 900 !important;
        line-height: 1 !important;
      }

      #chat > .mes[is_user="true"] button.${USER_EDIT_CLASS}::before { content: "\\f304" !important; }
      #chat > .mes[is_user="true"] button.${USER_DELETE_CLASS}::before { content: "\\f2ed" !important; }

      #chat > .mes[is_user="true"] .${USER_ACTIONS_CLASS} > button:hover,
      #chat > .mes[is_user="true"] .${USER_ACTIONS_CLASS} > button:focus-visible {
        color: var(--cl-ink, #ece9e2) !important;
        background: var(--cl-soft-hover, rgba(128,128,128,.12)) !important;
        opacity: 1 !important;
      }

      #chat > .mes[is_user="true"] .${USER_ACTIONS_CLASS} > button:active {
        transform: scale(.88) !important;
      }

      #chat > .mes.${WELCOME_ASSISTANT_CLASS}[is_user="false"] .mesAvatarWrapper .avatar,
      #chat > .mes.${WELCOME_ASSISTANT_CLASS}[is_user="false"] .mesAvatarWrapper .avatar img {
        background: transparent !important;
        border: 0 !important;
        box-shadow: none !important;
      }

      #chat > .mes.${WELCOME_ASSISTANT_CLASS}[is_user="false"] .mesAvatarWrapper .avatar img {
        box-sizing: border-box !important;
        padding: 2px !important;
        object-fit: contain !important;
        image-rendering: pixelated !important;
        filter: none !important;
      }

      @media (hover:hover) and (pointer:fine) {
        #chat > .mes[is_user="true"] .${USER_ACTIONS_CLASS} {
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          transform: translateY(-2px) !important;
        }

        #chat > .mes[is_user="true"]:hover .${USER_ACTIONS_CLASS},
        #chat > .mes[is_user="true"]:focus-within .${USER_ACTIONS_CLASS} {
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          transform: translateY(0) !important;
        }
      }

      button.${LEFT_SWIPE_PROXY_CLASS},
      button.${SWIPE_PROXY_CLASS} {
        appearance: none !important;
        -webkit-appearance: none !important;
        position: absolute !important;
        top: 50% !important;
        z-index: 12 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 34px !important;
        min-width: 34px !important;
        height: 48px !important;
        min-height: 48px !important;
        margin: 0 !important;
        padding: 0 !important;
        color: var(--cl-muted, #8b8780) !important;
        background: transparent !important;
        border: 0 !important;
        border-radius: 10px !important;
        outline: 0 !important;
        box-shadow: none !important;
        opacity: var(--cl-swipe-opacity, .48) !important;
        pointer-events: auto !important;
        cursor: pointer !important;
        transform: translateY(-50%) !important;
        transition: opacity 140ms ease, color 140ms ease, background 140ms ease !important;
      }

      button.${LEFT_SWIPE_PROXY_CLASS} { left: 0 !important; }
      button.${SWIPE_PROXY_CLASS} { right: 0 !important; }

      button.${LEFT_SWIPE_PROXY_CLASS}::before,
      button.${SWIPE_PROXY_CLASS}::before {
        font-family: "Font Awesome 6 Free" !important;
        font-size: 18px !important;
        font-weight: 900 !important;
        line-height: 1 !important;
      }

      button.${LEFT_SWIPE_PROXY_CLASS}::before { content: "\\f053" !important; }
      button.${SWIPE_PROXY_CLASS}::before { content: "\\f054" !important; }

      #chat > .mes[is_user="false"]:hover > button.${LEFT_SWIPE_PROXY_CLASS},
      #chat > .mes[is_user="false"]:hover > button.${SWIPE_PROXY_CLASS},
      #chat > .mes[is_user="false"]:focus-within > button.${LEFT_SWIPE_PROXY_CLASS},
      #chat > .mes[is_user="false"]:focus-within > button.${SWIPE_PROXY_CLASS} {
        opacity: .72 !important;
        pointer-events: auto !important;
      }

      #chat > .mes[is_user="false"] > button.${LEFT_SWIPE_PROXY_CLASS}:hover,
      #chat > .mes[is_user="false"] > button.${SWIPE_PROXY_CLASS}:hover {
        color: var(--cl-ink, #ece9e2) !important;
        background: var(--cl-soft-hover, rgba(128,128,128,.12)) !important;
        opacity: 1 !important;
      }

      #chat > .mes[is_user="false"] .mes_buttons > button.${REROLL_CLASS} {
        appearance: none !important;
        -webkit-appearance: none !important;
        order: 20 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        flex: 0 0 26px !important;
        width: 26px !important;
        min-width: 26px !important;
        max-width: 26px !important;
        height: 26px !important;
        min-height: 26px !important;
        max-height: 26px !important;
        margin: 0 !important;
        padding: 0 !important;
        color: var(--cl-muted, #8b8780) !important;
        background: transparent !important;
        border: 0 !important;
        border-radius: 8px !important;
        outline: 0 !important;
        box-shadow: none !important;
        opacity: .62 !important;
        cursor: pointer !important;
        line-height: 1 !important;
        transform: none !important;
        transition: color 130ms ease, background 130ms ease, opacity 130ms ease, transform 130ms ease !important;
      }

      button.${REROLL_CLASS}::before {
        content: "\\f2f9" !important;
        font-family: "Font Awesome 6 Free" !important;
        font-size: 12px !important;
        font-weight: 900 !important;
        line-height: 1 !important;
      }

      button.${REROLL_CLASS}:hover {
        color: var(--cl-ink, #ece9e2) !important;
        background: var(--cl-soft-hover, rgba(128,128,128,.12)) !important;
        opacity: 1 !important;
        transform: rotate(-16deg) !important;
      }

      button.${REROLL_CLASS}:active {
        transform: rotate(-24deg) scale(.88) !important;
      }

      @keyframes clawd-button-pop {
        0% { transform: translate3d(0,0,0) scale(1) rotate(0); }
        10% { transform: translate3d(0,calc(2px * var(--cl-clawd-motion-strength,1)),0) scaleX(1.07) scaleY(.82) rotate(-1deg); }
        22% { transform: translate3d(0,calc(1px * var(--cl-clawd-motion-strength,1)),0) scaleX(1.04) scaleY(.9) rotate(-1deg); }
        36% { transform: translate3d(0,calc(-3px * var(--cl-clawd-motion-strength,1)),0) scaleX(.99) scaleY(1.03) rotate(1deg); }
        48% { transform: translate3d(0,calc(-5px * var(--cl-clawd-motion-strength,1)),0) scaleX(.98) scaleY(1.04) rotate(2deg); }
        60% { transform: translate3d(0,calc(-3px * var(--cl-clawd-motion-strength,1)),0) scale(1.01) rotate(1deg); }
        72% { transform: translate3d(0,calc(1px * var(--cl-clawd-motion-strength,1)),0) scaleX(1.035) scaleY(.94) rotate(-1deg); }
        84% { transform: translate3d(0,calc(-1px * var(--cl-clawd-motion-strength,1)),0) scaleX(.995) scaleY(1.015) rotate(0); }
        93% { transform: translate3d(0,0,0) scale(1.005) rotate(0); }
        100% { transform: translateY(0) scale(1) rotate(0); }
      }

      @keyframes clawd-button-settle {
        0% { opacity:0; transform:translate3d(calc(-4px * var(--cl-clawd-motion-strength,1)),calc(-9px * var(--cl-clawd-motion-strength,1)),0) scale(.88); }
        48% { opacity:1; transform:translate3d(calc(1px * var(--cl-clawd-motion-strength,1)),calc(1px * var(--cl-clawd-motion-strength,1)),0) scale(1.025); }
        72% { transform:translate3d(0,calc(-1px * var(--cl-clawd-motion-strength,1)),0) scale(.995); }
        100% { opacity:1; transform:translate3d(0,0,0) scale(1); }
      }

      @keyframes clawd-react-hop {
        0%,100% { transform:translateY(0) scale(1) rotate(0); }
        18% { transform:translateY(2px) scale(1.08,.82) rotate(-1deg); }
        42% { transform:translateY(-8px) scale(.96,1.08) rotate(2deg); }
        67% { transform:translateY(0) scale(1.06,.9) rotate(-1deg); }
        84% { transform:translateY(-2px) scale(.99,1.02); }
      }

      @keyframes clawd-react-wiggle {
        0%,100% { transform:translateX(0) rotate(0); }
        18% { transform:translateX(-4px) rotate(-7deg); }
        36% { transform:translateX(4px) rotate(7deg); }
        54% { transform:translateX(-3px) rotate(-5deg); }
        72% { transform:translateX(2px) rotate(3deg); }
        88% { transform:translateX(-1px) rotate(-1deg); }
      }

      @keyframes clawd-react-nod {
        0%,100% { transform:translateY(0) scale(1); }
        26% { transform:translateY(3px) scale(1.03,.9); }
        48% { transform:translateY(-2px) scale(.99,1.04); }
        68% { transform:translateY(2px) scale(1.02,.94); }
        84% { transform:translateY(-1px) scale(1,1.02); }
      }

      @keyframes clawd-react-peek {
        0%,100% { transform:translateX(0) translateY(0) rotate(0); }
        22% { transform:translateX(4px) translateY(-2px) rotate(5deg); }
        56% { transform:translateX(5px) translateY(-3px) rotate(6deg); }
        78% { transform:translateX(-1px) translateY(1px) rotate(-2deg); }
      }

      @keyframes clawd-react-shy {
        0%,100% { transform:translateY(0) scale(1) rotate(0); }
        22% { transform:translateY(2px) scale(1.06,.82) rotate(-4deg); }
        52% { transform:translateY(3px) scale(1.08,.78) rotate(3deg); }
        76% { transform:translateY(-1px) scale(.98,1.04) rotate(-1deg); }
      }

      /* 蹭一下：不缩壳、不跳，整只小幅往一侧蹭再弹回，比 shy 俏皮、比 wiggle 沉一点 */
      @keyframes clawd-react-nudge {
        0%,100% { transform:translateX(0) translateY(0) rotate(0); }
        30% { transform:translateX(-5px) translateY(1px) rotate(-3deg); }
        62% { transform:translateX(3px) translateY(0) rotate(2deg); }
        84% { transform:translateX(-1px) translateY(0) rotate(-1deg); }
      }

      @keyframes clawd-particle-out {
        0% { opacity: 0; transform: translate(-50%, 3px) scale(.38) rotate(0); }
        18% { opacity: 1; transform: translate(-50%, -2px) scale(1.08) rotate(0); }
        100% {
          opacity: 0;
          transform: translate(calc(-50% + var(--clawd-dx)), var(--clawd-dy)) scale(.78) rotate(var(--clawd-rotate));
        }
      }

      @media (max-width: 700px) {
        button.${BUTTON_CLASS} {
          width: 38px !important;
          min-width: 38px !important;
          max-width: 38px !important;
          height: 31px !important;
          min-height: 31px !important;
          max-height: 31px !important;
          background-size: 38px 38px !important;
        }

        body.${MOBILE_LAYOUT_CLASS}:not(.clawd-welcome) #chat > .mes[is_user="false"] > button.${LEFT_SWIPE_PROXY_CLASS},
        body.${MOBILE_LAYOUT_CLASS}:not(.clawd-welcome) #chat > .mes[is_user="false"] > button.${SWIPE_PROXY_CLASS} {
          position: fixed !important;
          top: 50% !important;
          z-index: 118 !important;
          width: 38px !important;
          min-width: 38px !important;
          height: 54px !important;
          min-height: 54px !important;
          color: var(--cl-ink, #ece9e2) !important;
          background: color-mix(in srgb, var(--cl-canvas, #191918) 82%, transparent) !important;
          border: 1px solid var(--cl-line, rgba(128,128,128,.24)) !important;
          opacity: .74 !important;
          transform: translateY(-50%) !important;
          backdrop-filter: none !important;
        }

        #chat > .mes[is_user="false"] { position: relative !important; }

        body.${MOBILE_LAYOUT_CLASS}:not(.clawd-welcome) #chat > .mes[is_user="false"] > button.${LEFT_SWIPE_PROXY_CLASS} { left: 5px !important; }
        body.${MOBILE_LAYOUT_CLASS}:not(.clawd-welcome) #chat > .mes[is_user="false"] > button.${SWIPE_PROXY_CLASS} { right: 5px !important; }

        body.${MOBILE_LAYOUT_CLASS}:not(.clawd-welcome) #chat > .mes[is_user="false"] > button.${LEFT_SWIPE_PROXY_CLASS}:disabled,
        body.${MOBILE_LAYOUT_CLASS}:not(.clawd-welcome) #chat > .mes[is_user="false"] > button.${SWIPE_PROXY_CLASS}:disabled {
          display:flex !important;
          opacity:.22 !important;
          pointer-events:none !important;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        button.${BUTTON_CLASS}.clawd-react-hop,
        button.${BUTTON_CLASS}.clawd-react-wiggle,
        button.${BUTTON_CLASS}.clawd-react-nod,
        button.${BUTTON_CLASS}.clawd-react-peek,
        button.${BUTTON_CLASS}.clawd-react-shy,
        button.${BUTTON_CLASS}.clawd-react-nudge { animation: none !important; }
      }

      @media (prefers-reduced-motion: reduce) {
        button.${BUTTON_CLASS},
        button.${BUTTON_CLASS}:hover,
        button.${BUTTON_CLASS}.clawd-button-press {
          animation: none !important;
          transition: none !important;
          transform: none !important;
        }
        .clawd-click-particle { animation-duration: 1ms !important; }
      }
    `;
    hostDocument.head.append(style);
    hostDocument.documentElement.style.setProperty('--clawd-signoff-image', `url("${CLAWD_IMAGE}")`);
  }

  function isElementVisible(element) {
    if (!(element instanceof hostWindow.HTMLElement)) return false;
    const style = hostWindow.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0 && rect.height > 0;
  }

  function isTypingActive() {
    /* Once the native generation events are wired, they are authoritative.
       Older ST builds can leave a hidden typing-indicator node in the DOM;
       theme CSS may make that stale node measurable and otherwise keep the UI
       stuck in a phantom generation loop. */
    if (generationSubscriptions.length) return generationEventActive;
    return [...hostDocument.querySelectorAll('.typing_indicator')].some(isElementVisible);
  }

  function getContext() {
    const bridge = typeof SillyTavern !== 'undefined' ? SillyTavern : hostWindow.SillyTavern;
    if (typeof bridge?.getContext === 'function') return bridge.getContext();
    return bridge ?? null;
  }

  function watchGenerationEvents() {
    if (generationSubscriptions.length || destroyed) return;
    const context = getContext();
    const source = context?.eventSource;
    const types = context?.eventTypes || context?.event_types || {};
    if (!source?.on) return;

    const seen = new Set();
    const subscribe = (key, fallback, active) => {
      const type = types[key] || fallback;
      if (!type || seen.has(type)) return;
      seen.add(type);
      const handler = (...args) => {
        /* SillyTavern may emit a dry-run generation while only assembling a
           prompt. It must not turn the visible send control into Stop. */
        if (active && args[2] === true) return;
        if (!active) {
          /* 退场是竞态重灾区：GENERATION_ENDED/STOPPED 不保证早于酒馆自己的
             DOM/class 更新，等 scheduleRefresh 就可能已经被向右挪了一帧。
             在事件回调的同一任务里同步压掉原生精灵并创建 ghost。 */
          hostDocument
            .querySelectorAll('#chat .typing_indicator')
            .forEach(createTypingExitGhost);
        }
        generationEventActive = active;
        primeTypingTransition(active);
        scheduleRefresh();
      };
      source.on(type, handler);
      generationSubscriptions.push({ source, type, handler });
    };

    subscribe('GENERATION_STARTED', 'generation_started', true);
    subscribe('GENERATION_ENDED', 'generation_ended', false);
    subscribe('GENERATION_STOPPED', 'generation_stopped', false);
  }

  function getMessageData(message) {
    const id = Number(message.getAttribute('mesid'));
    if (!Number.isInteger(id) || id < 0) return null;
    return getContext()?.chat?.[id] ?? null;
  }

  function isWelcomeAssistant(message) {
    const data = getMessageData(message);
    return message.getAttribute('type') === 'assistant_message' || data?.extra?.type === 'assistant_message';
  }

  function isWelcomePrompt(message) {
    const data = getMessageData(message);
    return message.getAttribute('type') === 'welcome_prompt' || data?.extra?.type === 'welcome_prompt';
  }

  function isWelcomeSurfaceMessage(message) {
    return isWelcomeAssistant(message) || isWelcomePrompt(message);
  }

  function restoreWelcomeAvatar(message) {
    const record = welcomeAvatarOriginals.get(message);
    if (!record) return;
    const { image, src, srcset, alt } = record;
    if (image?.isConnected) {
      if (src === null) image.removeAttribute('src');
      else image.setAttribute('src', src);
      if (srcset === null) image.removeAttribute('srcset');
      else image.setAttribute('srcset', srcset);
      if (alt === null) image.removeAttribute('alt');
      else image.setAttribute('alt', alt);
    }
    welcomeAvatarOriginals.delete(message);
    message.classList.remove(WELCOME_ASSISTANT_CLASS);
  }

  function refreshWelcomeAssistants() {
    const messages = [...hostDocument.querySelectorAll('#chat > .mes[is_user="false"]')];
    const liveMessages = new Set(messages);
    welcomeAvatarOriginals.forEach((record, message) => {
      if (!liveMessages.has(message) || !isWelcomeAssistant(message)) restoreWelcomeAvatar(message);
    });
    messages.forEach(message => {
      const welcomePrompt = isWelcomePrompt(message);
      message.classList.toggle(WELCOME_PROMPT_CLASS, welcomePrompt);
      if (!isWelcomeAssistant(message)) {
        restoreWelcomeAvatar(message);
        if (welcomePrompt) {
          message.querySelector(`.${BUTTON_CLASS}`)?.remove();
          message.querySelector(`:scope > .${LEFT_SWIPE_PROXY_CLASS}`)?.remove();
          message.querySelector(`:scope > .${SWIPE_PROXY_CLASS}`)?.remove();
          message.querySelector(`.${REROLL_CLASS}`)?.remove();
        }
        return;
      }
      // The welcome assistant is a launcher, not a swipeable chat reply. Clear
      // any controls left behind by an earlier refresh before styling it.
      message.querySelector(`.${BUTTON_CLASS}`)?.remove();
      message.querySelector(`:scope > .${LEFT_SWIPE_PROXY_CLASS}`)?.remove();
      message.querySelector(`:scope > .${SWIPE_PROXY_CLASS}`)?.remove();
      message.querySelector(`.${REROLL_CLASS}`)?.remove();
      const image = message.querySelector(':scope > .mesAvatarWrapper .avatar img');
      if (!(image instanceof hostWindow.HTMLImageElement)) return;
      const previous = welcomeAvatarOriginals.get(message);
      if (!previous || previous.image !== image) {
        if (previous) restoreWelcomeAvatar(message);
        welcomeAvatarOriginals.set(message, {
          image,
          src: image.getAttribute('src'),
          srcset: image.getAttribute('srcset'),
          alt: image.getAttribute('alt'),
        });
      }
      message.classList.add(WELCOME_ASSISTANT_CLASS);
      if (image.getAttribute('src') !== CLAWD_IMAGE) image.setAttribute('src', CLAWD_IMAGE);
      image.removeAttribute('srcset');
      image.alt = 'Clawd';
    });
  }

  function prepareSwipeProxyMessage(message) {
    const data = getMessageData(message);
    const context = getContext();
    const id = Number(message.getAttribute('mesid'));
    const isLatest = Array.isArray(context?.chat)
      ? id === context.chat.length - 1
      : message.classList.contains('last_mes');
    if (!data || data.is_user || !isLatest || isWelcomeSurfaceMessage(message)) return false;
    /* Older theme builds forced every reply to loop at the right edge. That
       overrides SillyTavern's native assistant-message behavior, where another
       right swipe generates a new candidate. Remove the stale theme override
       and leave all future overswipe decisions to the host. */
    if (data.extra?.overswipe_behavior === 'loop') delete data.extra.overswipe_behavior;
    return true;
  }

  function hasPresetReasoning(message) {
    const text = message.querySelector('.mes_text')?.textContent ?? '';
    return /T\s*G\s*D\s*\u601d\u7ef4\u94fe|draft[_\s-]*notes/i.test(text);
  }

  function paintEmbeddedFrame(frame) {
    frame.setAttribute(EMBED_ATTRIBUTE, 'true');
    frame.style.setProperty('background', 'transparent', 'important');
    frame.style.setProperty('background-color', 'transparent', 'important');
    const variant = hostDocument.documentElement.dataset.claudeIntegratedTheme;
    const scheme = variant === 'day' ? 'light' : 'dark';
    const injectedCss = `
      :root { color-scheme: ${scheme}; }
      html, body {
        box-sizing: border-box !important;
        width: 100% !important;
        min-width: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        outline: 0 !important;
        box-shadow: none !important;
        background: transparent !important;
        background-color: transparent !important;
      }
    `;
    const srcdoc = frame.getAttribute('srcdoc');
    if (srcdoc && !srcdoc.includes(EMBED_SRCDOC_MARKER)) {
      embeddedFrameOriginalSrcdoc.set(frame, srcdoc);
      const styleTag = `${EMBED_SRCDOC_MARKER}<style id="${EMBED_STYLE_ID}">${injectedCss}</style>`;
      const patchedSrcdoc = /<\/head>/i.test(srcdoc)
        ? srcdoc.replace(/<\/head>/i, `${styleTag}</head>`)
        : /<\/body>/i.test(srcdoc)
          ? srcdoc.replace(/<\/body>/i, `${styleTag}</body>`)
          : `${srcdoc}${styleTag}`;
      frame.setAttribute('srcdoc', patchedSrcdoc);
      return;
    }
    try {
      const frameDocument = frame.contentDocument;
      if (!frameDocument?.documentElement) return;
      let style = frameDocument.getElementById(EMBED_STYLE_ID);
      if (!style) {
        style = frameDocument.createElement('style');
        style.id = EMBED_STYLE_ID;
        (frameDocument.head ?? frameDocument.documentElement).append(style);
      }
      style.textContent = injectedCss;
    } catch {
      // Cross-origin embeds cannot be styled internally; the outer surface still becomes transparent.
    }
  }

  function refreshRegexSurfaceShells() {
    const night = hostDocument.documentElement.dataset.claudeIntegratedTheme === 'night';
    if (!night) {
      hostDocument.querySelectorAll(`.${REGEX_SURFACE_CLASS}`).forEach(element => element.classList.remove(REGEX_SURFACE_CLASS));
      return;
    }
    const candidates = hostDocument.querySelectorAll(
      `#chat > .mes[is_user="false"] .mes_text :is(div, section, article, main, figure):not(.${REGEX_SURFACE_CLASS})`,
    );
    candidates.forEach(element => {
      const color = hostWindow.getComputedStyle(element).backgroundColor;
      const channels = color.match(/[\d.]+/g)?.map(Number) ?? [];
      if (channels.length < 3 || channels[0] < 242 || channels[1] < 242 || channels[2] < 242) return;
      if (channels.length > 3 && channels[3] < .72) return;
      const rect = element.getBoundingClientRect();
      const hostWidth = element.closest('.mes_text')?.getBoundingClientRect().width ?? 0;
      if (rect.height < 80 || rect.width < Math.min(240, hostWidth * .62)) return;
      element.classList.add(REGEX_SURFACE_CLASS);
    });
  }

  function refreshEmbeddedSurfaces() {
    const frames = [...hostDocument.querySelectorAll('#chat > .mes[is_user="false"] .mes_text iframe')];
    const liveFrames = new Set(frames);
    embeddedFrameHandlers.forEach((handler, frame) => {
      if (liveFrames.has(frame)) return;
      frame.removeEventListener('load', handler);
      embeddedFrameHandlers.delete(frame);
      embeddedFrameOriginalSrcdoc.delete(frame);
    });
    frames.forEach(frame => {
      if (!embeddedFrameHandlers.has(frame)) {
        const handler = () => paintEmbeddedFrame(frame);
        embeddedFrameHandlers.set(frame, handler);
        frame.addEventListener('load', handler);
      }
      paintEmbeddedFrame(frame);
    });
    refreshRegexSurfaceShells();
  }

  function computeMessageContent(message) {
    if (message.querySelector('.edit_textarea, .mes_edit_buttons, .mes_text textarea')) return true;
    const textHosts = [...message.querySelectorAll('.mes_text, .mes_reasoning')];
    const text = textHosts
      .map(element => element.textContent ?? '')
      .join('')
      .replace(/[\s\u200B-\u200D\u2060\uFEFF]/g, '');
    if (text) return true;
    return Boolean(message.querySelector(
      '.mes_text :is(img,video,audio,iframe,canvas,svg,table,pre), '
      + '.mes_reasoning :is(img,video,audio,iframe,canvas,svg,table,pre)',
    ));
  }

  function hasMessageContent(message) {
    if (!dirtyMessages.has(message) && messageContentCache.has(message)) {
      return messageContentCache.get(message);
    }
    const result = computeMessageContent(message);
    messageContentCache.set(message, result);
    return result;
  }

  function refreshMessageStates(typingActive) {
    const messages = [...hostDocument.querySelectorAll('#chat > .mes[is_user="false"]')];
    const contentByMessage = new Map();
    messages.forEach(message => {
      message.classList.toggle(PRESET_REASONING_CLASS, hasPresetReasoning(message));
      const contentful = hasMessageContent(message);
      contentByMessage.set(message, contentful);
      const empty = !contentful;
      if (!empty || typingActive) {
        const timer = emptyTimers.get(message);
        if (timer) hostWindow.clearTimeout(timer);
        emptyTimers.delete(message);
        message.classList.remove(EMPTY_CLASS);
      } else if (!emptyTimers.has(message) && !message.classList.contains(EMPTY_CLASS)) {
        const timer = hostWindow.setTimeout(() => {
          emptyTimers.delete(message);
          if (
            !destroyed
            && message.isConnected
            && !hasMessageContent(message)
            && !isTypingActive()
            && !hostDocument.body.dataset.swiping
          ) {
            message.classList.add(EMPTY_CLASS);
            scheduleRefresh();
          }
        }, 140);
        emptyTimers.set(message, timer);
      }
      if (empty || typingActive) {
        message.querySelector(`.${BUTTON_CLASS}`)?.remove();
        message.querySelector(`:scope > .${LEFT_SWIPE_PROXY_CLASS}`)?.remove();
        message.querySelector(`:scope > .${SWIPE_PROXY_CLASS}`)?.remove();
        message.querySelector(`.${REROLL_CLASS}`)?.remove();
      }
    });
    return messages.filter(message => !message.classList.contains(EMPTY_CLASS) && contentByMessage.get(message));
  }

  function getMessageId(message) {
    const id = Number(message?.getAttribute('mesid'));
    return Number.isInteger(id) && id >= 0 ? id : null;
  }

  async function safelyDeleteMessage(message) {
    const id = getMessageId(message);
    if (id === null) return;
    const context = getContext();
    const data = context?.chat?.[id];
    if (typeof context?.deleteMessage === 'function') {
      const selectedSwipe = data?.swipe_id ?? undefined;
      const canDeleteSwipe = !data?.is_user
        && Array.isArray(data?.swipes)
        && data.swipes.length > 1
        && id === context.chat.length - 1
        && selectedSwipe !== undefined;
      await context.deleteMessage(id, canDeleteSwipe ? selectedSwipe : undefined, true);
      return;
    }

    const confirmed = hostWindow.confirm('确定删除这条消息吗？此操作无法撤销。');
    if (!confirmed) return;
    const nativeEdit = message.querySelector('.mes_edit');
    const nativeDelete = message.querySelector('.mes_edit_delete');
    if (!nativeDelete && nativeEdit instanceof hostWindow.HTMLElement) nativeEdit.click();
    const readyDelete = message.querySelector('.mes_edit_delete');
    if (readyDelete instanceof hostWindow.HTMLElement) {
      nativeDeleteBypass.add(readyDelete);
      readyDelete.click();
      return;
    }
    hostWindow.toastr?.warning('当前酒馆没有提供可用的原生删除入口。', '删除不可用');
  }

  function interceptNativeDelete(event) {
    const target = event.target instanceof hostWindow.Element
      ? event.target.closest('.mes_edit_delete')
      : null;
    if (!(target instanceof hostWindow.HTMLElement)) return;
    if (nativeDeleteBypass.has(target)) {
      nativeDeleteBypass.delete(target);
      return;
    }
    if (event.isTrusted === false) return;
    const message = target.closest('#chat > .mes');
    if (!(message instanceof hostWindow.HTMLElement)) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    safelyDeleteMessage(message).catch(error => {
      console.error('[Claude Clawd] Failed to delete message safely.', error);
      hostWindow.toastr?.error('删除消息时发生错误，原消息已保留。', '删除失败');
    });
  }

  function createUserActions(message) {
    const actions = hostDocument.createElement('div');
    actions.className = USER_ACTIONS_CLASS;
    actions.setAttribute('aria-label', '用户消息操作');

    const edit = hostDocument.createElement('button');
    edit.type = 'button';
    edit.className = USER_EDIT_CLASS;
    edit.title = '编辑消息';
    edit.setAttribute('aria-label', '编辑消息');
    edit.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      const nativeEdit = message.querySelector('.mes_edit');
      if (nativeEdit instanceof hostWindow.HTMLElement) nativeEdit.click();
      else hostWindow.toastr?.warning('当前酒馆没有提供可用的原生编辑入口。', '编辑不可用');
    });

    const remove = hostDocument.createElement('button');
    remove.type = 'button';
    remove.className = USER_DELETE_CLASS;
    remove.title = '删除消息（需要确认）';
    remove.setAttribute('aria-label', '删除消息（需要确认）');
    remove.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      safelyDeleteMessage(message).catch(error => {
        console.error('[Claude Clawd] Failed to delete user message safely.', error);
        hostWindow.toastr?.error('删除消息时发生错误，原消息已保留。', '删除失败');
      });
    });

    actions.append(edit, remove);
    return actions;
  }

  function refreshUserActions() {
    const messages = [...hostDocument.querySelectorAll('#chat > .mes[is_user="true"]')];
    const liveMessages = new Set(messages);
    hostDocument.querySelectorAll(`.${USER_ACTIONS_CLASS}`).forEach(actions => {
      if (!liveMessages.has(actions.closest('#chat > .mes'))) actions.remove();
    });
    messages.forEach(message => {
      const block = message.querySelector(':scope > .mes_block');
      if (!block || block.querySelector(`:scope > .${USER_ACTIONS_CLASS}`)) return;
      block.append(createUserActions(message));
    });
  }

  function removeStaleButtons(currentMessage) {
    hostDocument.querySelectorAll(`.${BUTTON_CLASS}`).forEach(button => {
      if (!currentMessage || !currentMessage.contains(button)) button.remove();
    });
  }

  function createParticle(button, preferredClass = '') {
    const choices = preferredClass
      ? PARTICLES.filter(item => item.className === preferredClass)
      : PARTICLES;
    const picked = choices[Math.floor(Math.random() * choices.length)] || PARTICLES[0];
    const particle = hostDocument.createElement('span');
    particle.className = `clawd-click-particle ${picked.className}`;
    particle.textContent = picked.text;
    const rect = button.getBoundingClientRect();
    const configuredStrength = Number.parseFloat(
      hostWindow.getComputedStyle(hostDocument.documentElement)
        .getPropertyValue('--cl-clawd-motion-strength'),
    );
    const motionStrength = Number.isFinite(configuredStrength)
      ? Math.min(2, Math.max(0, configuredStrength))
      : 1;
    const dx = (-9 + Math.random() * 24) * motionStrength;
    const dy = (-28 - Math.random() * 16) * motionStrength;
    const rotate = (-24 + Math.random() * 48) * motionStrength;
    particle.style.left = `${Math.round(rect.left + rect.width / 2)}px`;
    particle.style.top = `${Math.round(rect.top + 4)}px`;
    particle.style.setProperty('--clawd-dx', `${Math.round(dx)}px`);
    particle.style.setProperty('--clawd-dy', `${Math.round(dy)}px`);
    particle.style.setProperty('--clawd-rotate', `${Math.round(rotate)}deg`);
    particle.addEventListener('animationend', () => particle.remove(), { once: true });
    hostDocument.body.append(particle);
  }

  let buttonReactionBag = [];
  function takeButtonReaction() {
    if (!buttonReactionBag.length) {
      buttonReactionBag = [...BUTTON_REACTIONS];
      for (let i = buttonReactionBag.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [buttonReactionBag[i], buttonReactionBag[j]] = [buttonReactionBag[j], buttonReactionBag[i]];
      }
    }
    return buttonReactionBag.pop();
  }

  function animateButton(button) {
    const reaction = takeButtonReaction();
    button.classList.remove('clawd-button-pop', ...BUTTON_REACTIONS);
    void button.offsetWidth;
    button.classList.add(reaction);
    button.addEventListener('animationend', () => button.classList.remove(reaction), { once: true });
    return reaction;
  }

  /* 手机上按下时的挤压效果原来靠 CSS :active。触屏上 :active 有名的会「粘住」——
     松手之后不清干净，也可能跟随后 JS 加的反应 class 抢同一个 transform，
     后加的反应播不出来，看起来就是「只有压扁」。
     改成 pointerdown/pointerup/pointercancel/pointerleave 手动控制一个 class，
     不依赖浏览器自己何时清 :active；桌面鼠标走同一套事件，效果不变。 */
  function bindPressState(button) {
    const press = () => button.classList.add('clawd-button-press');
    const release = () => button.classList.remove('clawd-button-press');
    button.addEventListener('pointerdown', press);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('pointerleave', release);
  }

  function createButton(settle = false) {
    const button = hostDocument.createElement('button');
    button.type = 'button';
    button.className = BUTTON_CLASS;
    button.setAttribute('aria-label', 'Clawd');
    button.title = 'Clawd';
    if (settle) {
      button.classList.add('clawd-button-settle');
      button.addEventListener('animationend', () => button.classList.remove('clawd-button-settle'), { once: true });
    }
    bindPressState(button);
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      const reaction = animateButton(button);
      createParticle(button, reaction === 'clawd-react-shy' ? 'clawd-particle-heart' : '');
      if (reaction === 'clawd-react-hop' && Math.random() < .42) {
        hostWindow.setTimeout(() => createParticle(button, 'clawd-particle-star'), 90);
      }
      if (reaction === 'clawd-react-peek') pulseCcPose(button, 'clawd-poke-look', 680);
      else if (reaction === 'clawd-react-shy') pulseCcPose(button, 'clawd-poke-tucked', 720);
      else if (reaction === 'clawd-react-nod') pulseCcPose(button, 'clawd-poke-blink', 360);
      handleCcCombo(button);
    });
    return button;
  }


  /* ===== v1.3 CC easter eggs ===== */
  const CC_VERBS_EN = {
    morning: ['brewing', 'stretching', 'warming up'],
    afternoon: ['pondering', 'noodling', 'simmering'],
    evening: ['musing', 'marinating', 'stargazing'],
  };
  const CC_VERBS_CN = {
    morning: ['煮咖啡', '伸懒腰', '热身'],
    afternoon: ['琢磨', '炖着', '思索'],
    evening: ['冥想', '放空', '看星星'],
  };
  /* 戳一下的短反应。只读界面状态，不读取任何聊天内容。 */
  const CC_LINES_EN = {
    first: ['oh, hi', 'mm, here', 'there you are', 'hello, you', 'found me', 'tiny crab online'],
    generating: ['busy', 'hold on', 'writing', 'one sec', 'Clawdifying…', 'stirring the tokens', 'almost', 'thinking very small thoughts'],
    justDone: ['done', 'there', "how's that", 'phew', '⎿  ok', 'ta-da', 'delivered', 'I made this'],
    idle: ['still there?', 'awake', '…you there?', 'hey', 'I can wait', 'quiet in here', 'tap tap'],
    returned: ['back?', "where'd you go", 'oh, hi again', 'welcome back', 'you returned', 'I kept your spot'],
    late: ['still up', 'what time is it', 'tomorrow?', 'go to bed', 'context left: 3%', 'night owl', 'one last thing?'],
    default: ['yes?', 'mm?', 'here', 'listening', 'hm', 'what', '…?', 'Thinking…', '/compact', 'need a claw?', 'at your service', 'you rang?', 'small but capable'],
    sleeping: ['zzz…', 'five more minutes', 'mmnh…', 'not now…', '…', 'shhh', 'mm, tomorrow…', 'dreaming in tokens', 'crab is offline'],
    third: ['again?', 'still poking?', 'that tickles', 'persistent, huh?'],
    fourth: ['stop', 'hands off', 'my shell!', 'personal space'],
  };
  const CC_LINES_CN = {
    first: ['哦，你来了', '嗯，在', '早', '来了', '你好呀', '找到我了', '小螃蟹上线'],
    generating: ['忙着', '等等', '在写了', '别催', '手上有活', '稍等', 'Clawdifying…', '正在搅拌 token', '快了', '小脑袋在转'],
    justDone: ['好了', '写完了', '怎么样', '看看？', '呼', '⎿  ok', '锵锵', '送达', '我做的'],
    idle: ['还在？', '醒着呢', '你还在吗', '…睡着了？', '喂', '我可以等', '好安静', '敲敲'],
    returned: ['回来了', '去哪了', '哦，回来了', '欢迎回来', '你回来啦', '位置给你留着'],
    late: ['还不睡', '几点了', '明天再说吧', '熬着呢', '早点睡', 'context left: 3%', '夜猫子', '最后一件事？'],
    default: ['在的', '嗯？', '听着呢', '干嘛', '在', '？', '…嗯', '唔', '欸', '咔', 'Thinking…', '/compact', '要搭把钳吗', '随叫随到', '你叫我？', '小但能干'],
    sleeping: ['zzz…', '再睡五分钟', '唔…', '别吵…', '…', '嘘', '明天…', '梦见 token 了', '螃蟹离线'],
    third: ['又？', '还来', '痒', '很执着嘛'],
    fourth: ['别戳了', '停', '我的壳！', '保持距离'],
  };

  const CC_HI_EN = {
    morning: ['Coffee and Claude time?', 'Morning. Where do we start?', 'Fresh page. What goes on it?'],
    afternoon: ['What&#39;s on your mind?', 'Back at it?', 'Ready when you are.'],
    evening: ['Winding down, or just starting?', 'Evening. What are we making?', 'One more round?'],
    late: ['Still up?', 'Late night session?'],
  };
  const CC_HI_CN = {
    morning: ['喝杯咖啡，聊会儿？', '早。今天从哪儿开始？', '新的一页，写点什么？'],
    afternoon: ['在想什么？', '接着来？', '随时可以开始。'],
    evening: ['是收工，还是刚开始？', '晚上好。今天做点什么？', '再来一轮？'],
    late: ['还没睡？', '又是通宵？'],
  };

  let ccComboCount = 0;
  let ccComboTimer = null;
  let ccSleeping = false;
  let ccHasBeenPoked = false;
  let ccReturnedAt = 0;
  let ccHiddenAt = 0;
  let ccPoseTimer = 0;
  const ccBags = new Map();
  const CC_SILENT_RATE = 0.10;

  function ccLines() {
    return ccPrefersChinese() ? CC_LINES_CN : CC_LINES_EN;
  }

  function takeCcLine(slot) {
    const language = ccPrefersChinese() ? 'cn' : 'en';
    const key = `${language}:${slot}`;
    let bag = ccBags.get(key);
    if (!bag?.length) {
      bag = [...(ccLines()[slot] || ccLines().default)];
      for (let i = bag.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      ccBags.set(key, bag);
    }
    return bag.pop();
  }

  function pulseCcPose(button, className, duration = 520) {
    if (!button) return;
    if (ccPoseTimer) hostWindow.clearTimeout(ccPoseTimer);
    button.classList.remove('clawd-poke-blink', 'clawd-poke-look', 'clawd-poke-tucked');
    void button.offsetWidth;
    button.classList.add(className);
    ccPoseTimer = hostWindow.setTimeout(() => {
      button.classList.remove(className);
      ccPoseTimer = 0;
    }, duration);
  }

  function ccContextSlot() {
    const now = Date.now();
    if (!ccHasBeenPoked) return 'first';
    if (isTypingActive()) return 'generating';
    if (now - ccReturnedAt < 12000) return 'returned';
    if (now - lastGenerationDoneAt < 12000) return 'justDone';
    /* 现有打盹是 60 秒；idle 只占入睡前的短窗口，避免与 sleeping 自相矛盾。 */
    if (hasChatActivity && now - lastActivityAt > IDLE_SLEEP_MS * .75) return 'idle';
    const hour = new Date().getHours();
    if (hour < 5) return 'late';
    return 'default';
  }

  function noteCcVisibility() {
    if (hostDocument.visibilityState !== 'visible') {
      ccHiddenAt = Date.now();
      return;
    }
    ccReturnedAt = Date.now();
    if (ccHiddenAt && ccReturnedAt - ccHiddenAt > 2000) {
      const button = hostDocument.querySelector('button.' + BUTTON_CLASS);
      if (button && !button.classList.contains('clawd-sleeping')) {
        button.classList.remove(...BUTTON_REACTIONS);
        void button.offsetWidth;
        button.classList.add('clawd-react-peek');
        pulseCcPose(button, 'clawd-poke-look', 680);
        hostWindow.setTimeout(() => button.classList.remove('clawd-react-peek'), 700);
      }
    }
    ccHiddenAt = 0;
  }

  function showCcToast(button, html, variant) {
    const host = button.parentElement;
    if (!host) return;
    // 挂在 clawd 的父节点上，这样按钮自己的挤压 transform 不会带着气泡一起变形
    hostDocument.querySelectorAll('.clawd-cc-toast, .clawd-hi-toast').forEach(el => el.remove());
    const toast = hostDocument.createElement('span');
    toast.className = variant === 'hi' ? 'clawd-hi-toast' : 'clawd-cc-toast';
    toast.innerHTML = html;
    host.appendChild(toast);
    const hostBox = host.getBoundingClientRect();
    const crabBox = button.getBoundingClientRect();
    toast.style.left = (crabBox.right - hostBox.left + 10) + 'px';
    toast.style.top = (crabBox.top + crabBox.height / 2 - hostBox.top) + 'px';
    hostWindow.setTimeout(() => toast.remove(), variant === 'hi' ? 3200 : 2600);
  }

  function ccEscapeHtml(text) {
    return text.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  function handleCcCombo(button) {
    // 睡着的时候戳它，回一句梦话就好，不进连点彩蛋的计数
    if (!button) return;
    if (button.classList.contains('clawd-sleeping') || ccSleeping) {
      pulseCcPose(button, 'clawd-poke-blink', 620);
      showCcToast(button, ccEscapeHtml(takeCcLine('sleeping')), 'hi');
      return;
    }
    ccComboCount += 1;
    if (ccComboTimer) hostWindow.clearTimeout(ccComboTimer);
    ccComboTimer = hostWindow.setTimeout(() => { ccComboCount = 0; }, 1400);
    if (ccComboCount <= 2) {
      const slot = ccContextSlot();
      ccHasBeenPoked = true;
      if (Math.random() < CC_SILENT_RATE) {
        hostDocument.querySelectorAll('.clawd-cc-toast, .clawd-hi-toast').forEach(el => el.remove());
        pulseCcPose(button, 'clawd-poke-blink');
      } else {
        showCcToast(button, ccEscapeHtml(takeCcLine(slot)), 'hi');
      }
    } else if (ccComboCount === 3) {
      pulseCcPose(button, 'clawd-poke-look', 760);
      showCcToast(button, ccEscapeHtml(takeCcLine('third')), 'hi');
    } else if (ccComboCount === 4) {
      pulseCcPose(button, 'clawd-poke-tucked', 900);
      showCcToast(button, ccEscapeHtml(takeCcLine('fourth')), 'hi');
    } else if (ccComboCount === 5) {
      showCcToast(button, '<span class="asterisk">✳</span> Compacting conversation… (esc to interrupt)');
    } else if (ccComboCount === 6) {
      pulseCcPose(button, 'clawd-poke-tucked', 850);
      showCcToast(button, 'Bash(poke clawd)&nbsp; ⎿&nbsp; permission denied');
    } else if (ccComboCount === 7) {
      showCcToast(button, 'context left: 3%');
    } else if (ccComboCount >= 8) {
      ccComboCount = 0;
      ccSleeping = true;
      button.classList.add('clawd-sleeping');
      showCcToast(button, 'usage limit reached · resets 3am');
      hostWindow.setTimeout(() => {
        button.classList.remove('clawd-sleeping');
        ccSleeping = false;
      }, 6000);
    }
  }

  /* ===== v1.7 ===== */


  /* 4. 姿势跟内容走：超长回复蜷起来，含代码块眯眼 */
  // 曾经有个「回复超长就蜷缩」的姿势，去掉了。
  // 阈值 1800 字，而酒馆的回复基本都超 —— 蜷缩变成了常态，
  // 还把左右看的规则盖住、跟上下看打架。
  // 跟之前那个「含代码块就眯眼」是同一类错误：内容驱动的姿势在酒馆里必然长期误触发。
  /* 打盹：1 分钟没输入就睡，敲键盘就醒。
     只认键盘，不认鼠标移动和滚动 —— 读长回复的时候鼠标和滚轮一直在动，
     但人其实没在「操作」，把那些算进来它就永远睡不着。
     连点 8 下的彩蛋走同一套 clawd-sleeping 类，两边不冲突：
     彩蛋睡固定 6 秒，打盹睡到你回来为止。 */
  const IDLE_SLEEP_MS = 60000;
  let lastActivityAt = Date.now();
  let idleAsleep = false;
  // 打开酒馆挂在那儿不算「你在这段对话里停了一分钟」。
  // 要先在这个对话里有过一次输入，计时才开始 —— 否则一进来干等一分钟它就睡了。
  let hasChatActivity = false;

  function setSleeping(on) {
    hostDocument.querySelectorAll('button.' + BUTTON_CLASS)
      .forEach(button => button.classList.toggle('clawd-sleeping', on));
  }

  function setDrowsy(on) {
    hostDocument.querySelectorAll('button.' + BUTTON_CLASS)
      .forEach(button => button.classList.toggle('clawd-idle-drowsy', on));
  }

  /* 入睡前哈欠一下，呼吸动画晚 900ms 才接上——不然哈欠和呼吸两段 transform
     叠在一起抢镜。900ms 内如果又有活动打断（noteActivity 把 idleAsleep 设回
     false），这个 setTimeout 到点时靠 idleAsleep 的最新值挡住，不会替一次
     已经取消的入睡把睡觉样式硬套上去。 */
  const SLEEP_TRANSITION_MS = 900;

  function playSleepTransition() {
    hostDocument.querySelectorAll('button.' + BUTTON_CLASS).forEach(button => {
      button.classList.add('clawd-sleep-transition');
      button.addEventListener('animationend', () => button.classList.remove('clawd-sleep-transition'), { once: true });
    });
  }

  function refreshIdleSleep() {
    if (ccSleeping || !hasChatActivity) return;
    const elapsed = Date.now() - lastActivityAt;
    const idle = elapsed > IDLE_SLEEP_MS;
    // 呼吸/睡觉两档中间原来是空的：入睡前最后 25% 的等待时间加一档
    // 「醒着但没人理」的东张西望，不再从静止直接跳到闭眼。
    setDrowsy(!idle && elapsed > IDLE_SLEEP_MS * .75);
    if (idle === idleAsleep) {
      if (idle) setSleeping(true);
      return;
    }
    idleAsleep = idle;
    if (!idle) {
      setSleeping(false);
      return;
    }
    setDrowsy(false);
    playSleepTransition();
    hostWindow.setTimeout(() => {
      if (idleAsleep) setSleeping(true);
    }, SLEEP_TRANSITION_MS);
  }

  function noteActivity() {
    hasChatActivity = true;
    lastActivityAt = Date.now();
    setDrowsy(false);
    if (!idleAsleep) return;
    idleAsleep = false;
    if (!ccSleeping) setSleeping(false);
  }

  const idleTimer = hostWindow.setInterval(refreshIdleSleep, 5000);

  /* 滑动箭头跟随滚动。
     注意要用 setProperty(...,'important')：installStyle 里那条 top:50% 带 !important，
     普通的 inline style 压不过它。 */
  let swipeTrackRaf = 0;
  let swipeObserver = null;
  const observedSwipeMessages = new Set();
  const visibleSwipeMessages = new Set();

  function trackSwipeArrows() {
    swipeTrackRaf = 0;
    if (destroyed) return;
    if (isMobileLayout()) {
      observedSwipeMessages.forEach(message => {
        message.querySelectorAll(`:scope > button.${LEFT_SWIPE_PROXY_CLASS}, :scope > button.${SWIPE_PROXY_CLASS}`)
          .forEach(button => {
            if (button.style.getPropertyValue('top') === '50%') return;
            button.style.setProperty('top', '50%', 'important');
          });
      });
      return;
    }
    const chatBox = scrollHost?.getBoundingClientRect();
    const viewportTop = Math.max(0, chatBox?.top || 0);
    const viewportBottom = Math.min(hostWindow.innerHeight, chatBox?.bottom || hostWindow.innerHeight);
    const viewportMid = (viewportTop + viewportBottom) / 2;
    /* 以前每个 scroll 帧都会 querySelectorAll 全部左右按钮；长上下文里是 O(全部消息)。
       现在 IntersectionObserver 只把屏幕内的 1～2 条消息放进集合。初次 observer
       回调尚未到达时，用一次小范围几何兜底，避免按钮闪一下。 */
    const candidates = visibleSwipeMessages.size
      ? [...visibleSwipeMessages]
      : [...observedSwipeMessages].filter(message => {
        const box = message.getBoundingClientRect();
        return box.bottom > viewportTop + 8 && box.top < viewportBottom - 8;
      });
    candidates.forEach(message => {
      if (!message?.isConnected) return;
      const box = message.getBoundingClientRect();
      if (box.bottom <= viewportTop + 8 || box.top >= viewportBottom - 8) return;
      // setProperty 每次都会重写 style 属性，哪怕值没变。
      // 观察器盯着 style，于是「刷新 → 写 style → 观察器触发 → 再刷新」
      // 会自己转起来，20Hz 全量扫描停不下来。值没变就别写。
      let next;
      if (box.height <= (viewportBottom - viewportTop) * 0.9) {
        // 没比视口高就不用跟，居中本来就够得着
        next = '50%';
      } else {
        const edge = 40;
        const target = viewportMid - box.top;
        const clamped = Math.min(Math.max(target, edge), box.height - edge);
        next = clamped + 'px';
      }
      message.querySelectorAll(`:scope > button.${LEFT_SWIPE_PROXY_CLASS}, :scope > button.${SWIPE_PROXY_CLASS}`)
        .forEach(button => {
          if (button.style.getPropertyValue('top') === next) return;
          button.style.setProperty('top', next, 'important');
        });
    });
  }

  function scheduleSwipeTrack() {
    if (destroyed || swipeTrackRaf) return;
    swipeTrackRaf = hostWindow.requestAnimationFrame(trackSwipeArrows);
  }

  /* 上翻卡顿的一个来源：composer 高度/位置一变（键盘弹收、Quick Reply 行数变化）
     就会检查"离底部够不够近，够近就吸回底部"。这个检查分不清是用户自己在往上翻，
     还是别的原因引起的重排——用户刚往上翻一点，正好还在 72px 判定范围内，
     下一次 resize 事件一来就被直接吸回底部，翻页跟被按了回去似的一顿一顿。
     用一个"最近是不是刚手动滚动过"的时间戳挡一下：程序自己触发的滚动
     （吸底那一下）不算手动，用 suppressManualScrollUntil 短暂遮住。 */
  let suppressManualScrollUntil = 0;

  function noteManualScroll() {
    if (Date.now() < suppressManualScrollUntil) return;
    lastManualScrollAt = Date.now();
  }

  /* 手机上翻页卡顿的真正来源：trackSwipeArrows 的手机分支不看可见区域，
     直接 observedSwipeMessages.forEach 整段历史——这正是最早那个"有楼层就卡"
     的同一种 O(全部楼层) 写法，只是长在了翻页箭头这里，没被第一轮修到。
     手机上箭头位置固定是 50%，不跟着滚动位置变，压根不需要每个滚动帧重算；
     新增/刷新时 refreshSwipeControls 末尾已经调过一次 scheduleSwipeTrack 来定位，
     滚动本身不用再重复触发。PC 分支要跟着视口位置走，仍然需要。 */
  function handleChatScroll() {
    noteManualScroll();
    if (!isMobileLayout()) scheduleSwipeTrack();
  }

  /* 欢迎态：聊天里没有真实消息时，复刻官网那个「问候语 + 输入框居中」的形态。
     只在完整版包里生效 —— pack.js 注入的 CLAUDE_FEATURES 决定。 */
  const WELCOME_CLASS = 'clawd-welcome';

  /* 欢迎态是三态状态机，不是布尔值。
     上一版用布尔量，被我自己写的两处重置提前清掉了：
       1. refreshWelcomeMode 里那句「聊天区空 → 归零」。消息还没插进 DOM 的空窗期，
          它每 50ms 就把标记抹一次 —— 发送标记刚置上，下一轮刷新就没了。
       2. CHAT_CHANGED 无条件归零，而首次发送创建新对话时正好会触发它。
     现在分三档，只有明确「关闭 / 换对话」才回到 welcome：
       welcome  真正的欢迎页
       leaving  已按发送，等消息渲染（此时就该退出欢迎布局）
       chat     真实消息已上屏 */
  let welcomeStage = 'welcome';
  let leavingSince = 0;
  let sendWatchBound = false;
  let fadeAnimationWatchBound = false;
  /* 快速角色菜单是欢迎页上的“发送目标”选择器，不是导航入口。
     酒馆内部仍需先选中角色，才能让随后发送的消息进入正确角色上下文；
     但 pending 存在时视觉上继续停留在欢迎页，直到用户真正发送。 */
  let pendingWelcomeCharacter = null;

  function enterLeaving() {
    const hadPendingCharacter = pendingWelcomeCharacter !== null;
    pendingWelcomeCharacter = null;
    if (welcomeStage === 'chat' && !hadPendingCharacter) return;
    welcomeStage = 'leaving';
    leavingSince = Date.now();
    hostDocument.body.classList.remove(WELCOME_CLASS);
    hostDocument.querySelectorAll('.' + HERO_CLASS).forEach(el => el.remove());
    heroLine = null;
    scheduleRefresh();
  }

  /* 监听绑在 document 上，不绑 #send_form —— 这个改版部署会重建表单，
     绑在它身上的监听会跟着没。入口也不只认一个 id。
     酒馆自己的事件只作辅助，且不写死事件名。 */
  function watchMessageFadeAnimation() {
    if (fadeAnimationWatchBound) return;
    fadeAnimationWatchBound = true;
    hostDocument.addEventListener('animationend', event => {
      if (event.animationName === 'claude-fade-rise' && event.target instanceof hostWindow.HTMLElement) {
        event.target.style.animation = 'none';
      }
    }, true);
  }

  function watchUserSend() {
    if (!welcomeEnabled || sendWatchBound) return;
    sendWatchBound = true;

    hostDocument.addEventListener('submit', event => {
      if (event.target instanceof hostWindow.Element && event.target.closest('form')) enterLeaving();
    }, true);
    hostDocument.addEventListener('click', event => {
      /* 预选后若用户改为点击 Recents、角色卡或群组，尊重这个明确导航动作，
         不再用 pending 强行把新页面盖回欢迎态。 */
      if (pendingWelcomeCharacter !== null
        && event.target instanceof hostWindow.Element
        && event.target.closest('.recentChat, .select_chat_block, .character_select, .group_select')) {
        pendingWelcomeCharacter = null;
      }
      if (event.target instanceof hostWindow.Element
        && event.target.closest('#send_but, [id*="send_but"], #send_form [type="submit"]')) enterLeaving();
    }, true);
    hostDocument.addEventListener('keydown', event => {
      if (event.key !== 'Enter' || event.shiftKey || event.ctrlKey || event.altKey) return;
      if (event.target instanceof hostWindow.Element
        && event.target.closest('#send_textarea, #send_form textarea, #send_form [contenteditable]')) enterLeaving();
    }, true);

    const source = getContext()?.eventSource;
    const types = getContext()?.eventTypes || getContext()?.event_types || {};
    for (const [key, value] of Object.entries(types)) {
      if (key === 'MESSAGE_SENT' || key === 'USER_MESSAGE_RENDERED') source?.on?.(value, enterLeaving);
      // 首次发送会创建新对话，也走 CHAT_CHANGED —— 那时不能退回欢迎页
      if (key === 'CHAT_CHANGED') source?.on?.(value, () => {
        /* CHAT_CHANGED 同时表示“选中角色”和“关闭对话”，不能一律当成回首页。
           现场复现中，角色已经被酒馆选中、头像和编辑字段也已更新，但这里又把
           stage 写回 welcome；没有开场白的角色永远不会有消息来纠正这个状态。 */
        if (pendingWelcomeCharacter !== null) welcomeStage = 'welcome';
        else if (hasSelectedConversation()) welcomeStage = 'chat';
        else if (welcomeStage !== 'leaving') welcomeStage = 'welcome';
        scheduleRefresh();
      });
    }
  }
  const HERO_CLASS = 'clawd-welcome-hero';
  const welcomeEnabled = typeof CLAUDE_FEATURES !== 'undefined' && CLAUDE_FEATURES.welcome;
  /* 手机版是独立构建。桌面完整版即使窗口很窄，也不再注入手机抽屉，
     避免桌面 rail / welcome 规则和手机控件同时接管同一批节点。 */
  const mobileEnabled = typeof CLAUDE_FEATURES !== 'undefined' && CLAUDE_FEATURES.mobile;

  function isMobileLayout() {
    return Boolean(mobileEnabled && hostWindow.matchMedia?.('(max-width:700px)').matches);
  }

  /* Chrome/Android 支持 VirtualKeyboard API 时，直接让软键盘覆盖页面，而不是
     缩放 layout viewport。这样键盘开合只改变 keyboard-inset 环境变量，重角色卡
     和整段聊天历史都不用重新布局。Via 等 WebView 可能不暴露这个 API，所以这里
     只做能力检测；老内核的降级靠冻结根视口变量（applyMobileViewportMetrics）
     和 transform 位移，不再依赖任何形式的屏外 containment。 */
  function installVirtualKeyboardOverlay() {
    if (!isMobileLayout() || keyboardBaselineMode) return;
    const keyboard = hostWindow.navigator?.virtualKeyboard;
    if (!keyboard || !('overlaysContent' in keyboard)) return;
    try {
      virtualKeyboardOverlayOriginal = Boolean(keyboard.overlaysContent);
      virtualKeyboardOverlayCaptured = true;
      keyboard.overlaysContent = true;
      virtualKeyboardOverlayActive = Boolean(keyboard.overlaysContent);
    } catch {
      virtualKeyboardOverlayActive = false;
    }
    hostDocument.body?.classList.toggle(VIRTUAL_KEYBOARD_OVERLAY_CLASS, virtualKeyboardOverlayActive);
  }

  function restoreVirtualKeyboardOverlay() {
    hostDocument.body?.classList.remove(VIRTUAL_KEYBOARD_OVERLAY_CLASS);
    if (virtualKeyboardOverlayCaptured) {
      try {
        hostWindow.navigator.virtualKeyboard.overlaysContent = virtualKeyboardOverlayOriginal;
      } catch { /* secure/top-level context restrictions: nothing else to restore */ }
    }
    virtualKeyboardOverlayActive = false;
    virtualKeyboardOverlayCaptured = false;
  }

  function applyMobileViewportMetrics() {
    const root = hostDocument.documentElement;
    if (!isMobileLayout()) {
      root.style.removeProperty(MOBILE_VIEWPORT_HEIGHT_PROPERTY);
      root.style.removeProperty(MOBILE_VIEWPORT_TOP_PROPERTY);
      return;
    }
    /* baseline 诊断包：根视口变量保持 CSS 兜底值，JS 一个字也不写。 */
    if (keyboardBaselineMode) return;
    // 键盘开合时根节点指标保持在键盘出现前的稳定值；输入框另走 transform。
    // 否则一次普通 DOM refresh 也会把整棵重卡拖进根变量的样式失效范围。
    if (hostDocument.activeElement?.id === 'send_textarea') return;
    /* 收键盘的收尾窗口内同样一个字也不写。根节点自定义属性继承到整篇 DOM，
       写一次就是一次全文档 style 失效重算；兜底定时器（300/900/2000/5000ms）
       若在键盘动画中途写入中间值，重卡上每次全文档 recalc 都是数百毫秒起，
       主线程被堵住的这几秒屏幕只能显示旧合成帧 —— 这正是“输入框悬空数秒”
       最可疑的主题侧来源。窗口随几何稳定提前结束（applyMobileComposerTranslate
       清零 mobileKeyboardSettlingUntil），或 8000ms 兜底到期；之后由最后一个
       定时器或下一轮刷新一次性写入最终值，消费方（抽屉/面板高度）在过渡期间
       用稳定旧值没有视觉影响。 */
    if (Date.now() < mobileKeyboardSettlingUntil) return;
    const viewport = hostWindow.visualViewport;
    const height = Math.max(1, Math.round(viewport?.height || hostWindow.innerHeight || 1));
    const top = Math.max(0, Math.round(viewport?.offsetTop || 0));
    const heightValue = `${height}px`;
    const topValue = `${top}px`;
    if (root.style.getPropertyValue(MOBILE_VIEWPORT_HEIGHT_PROPERTY) !== heightValue) {
      root.style.setProperty(MOBILE_VIEWPORT_HEIGHT_PROPERTY, heightValue);
    }
    if (root.style.getPropertyValue(MOBILE_VIEWPORT_TOP_PROPERTY) !== topValue) {
      root.style.setProperty(MOBILE_VIEWPORT_TOP_PROPERTY, topValue);
    }
  }

  /* 键盘动画只移动输入框自己。旧实现把 visualViewport 指标写到 html 根节点，
     再用 bottom:calc(...) 定位；根变量被抽屉、面板等多处引用，每一帧都可能让
     重卡的大量 DOM 重新排版。后来加的尾部去抖又会一直等事件停止，直接制造了
     “输入框卡在中间，几秒后才落下”的视觉延迟。

     这里把键盘遮挡量写到 #form_sheld 自己，并由 CSS transform 消费。transform
     走合成层，不改变页面占位；requestAnimationFrame 只负责把同一帧的多次
     resize/scroll 合并。innerHeight 是 fixed 元素使用的布局视口高度；如果某个
     WebView 已经随键盘缩小布局视口，它会和 visualViewport 一样高，偏移自然为 0，
     不会重复补偿。输入框没有焦点时强制归零，focusout 不再等浏览器补发事件。 */
  function applyMobileComposerTranslate() {
    mobileComposerTranslateRaf = 0;
    const shell = observedComposerShell?.isConnected
      ? observedComposerShell
      : hostDocument.querySelector('#form_sheld');
    if (!shell) return;
    if (!isMobileLayout()) {
      shell.style.removeProperty(MOBILE_COMPOSER_TRANSLATE_PROPERTY);
      return;
    }
    /* overlay 模式由 CSS env(keyboard-inset-height) 直接驱动 transform；不要再
       同时根据 visualViewport 算第二份偏移。 */
    if (virtualKeyboardOverlayActive) {
      mobileKeyboardRecoveryActive = false;
      shell.style.removeProperty(MOBILE_COMPOSER_TRANSLATE_PROPERTY);
      return;
    }
    const inputFocused = hostDocument.activeElement?.id === 'send_textarea';
    const viewport = hostWindow.visualViewport;
    const layoutHeight = Math.max(
      1,
      Math.round(hostWindow.innerHeight || hostDocument.documentElement.clientHeight || viewport?.height || 1),
    );
    const visibleBottom = Math.round((viewport?.offsetTop || 0) + (viewport?.height || layoutHeight));
    /* 两种 Android 行为都要兼容：
       1) 只缩 visual viewport：fixed 仍贴着旧 layout 底部，需要向上移；
       2) WebView 同时缩 layout viewport：fixed 会自然上移，打开时无需补偿；但收键盘
          时 visual viewport 往往先恢复，layout viewport 仍矮几秒，需要按稳定高度差
          临时向下移。旧实现失焦后一律归零，正好留下了“悬空几秒再落下”。 */
    let translateY = 0;
    if (inputFocused) {
      translateY = -Math.max(0, layoutHeight - visibleBottom);
    } else if (mobileKeyboardRecoveryActive) {
      translateY = Math.max(0, mobileStableLayoutHeight - layoutHeight);
      if (translateY <= 1) {
        /* 只结束位移补偿，【不】清 mobileKeyboardSettlingUntil。
           两者是两回事：layout 差值归零只说明输入框不需要再补偿，
           不能证明键盘动画和整页重排已经结束 —— visual-viewport-only
           的浏览器里 layoutHeight 全程不变，focusout 同一任务就会走到
           这里，若连带清掉 settling，根变量写入保护当场失效（第 11 轮
           返工根因之二）。settling 由 scheduleMobileViewportSettle 的
           几何稳定判定或 8000ms 兜底独立结束。 */
        mobileKeyboardRecoveryActive = false;
        mobileStableLayoutHeight = layoutHeight;
        translateY = 0;
      }
    } else {
      mobileStableLayoutHeight = layoutHeight;
    }
    const value = `${translateY}px`;
    if (shell.style.getPropertyValue(MOBILE_COMPOSER_TRANSLATE_PROPERTY) !== value) {
      shell.style.setProperty(MOBILE_COMPOSER_TRANSLATE_PROPERTY, value);
    }
  }

  function scheduleMobileComposerTranslate() {
    if (destroyed || keyboardBaselineMode || mobileComposerTranslateRaf) return;
    mobileComposerTranslateRaf = hostWindow.requestAnimationFrame(applyMobileComposerTranslate);
  }

  function resetMobileComposerTranslate() {
    if (mobileComposerTranslateRaf) hostWindow.cancelAnimationFrame(mobileComposerTranslateRaf);
    mobileComposerTranslateRaf = 0;
    if (keyboardBaselineMode) return;
    /* 同步执行完整计算，而不是硬写 0。WebView 的 layout viewport 还没恢复时，
       这里会先写入正向补偿；主线程随后即使被长聊天布局堵住，旧悬空位置也已撤销。 */
    applyMobileComposerTranslate();
  }

  function handleViewportChange() {
    if (destroyed) return;
    scheduleMobileComposerTranslate();

    /* Android 键盘动画有时连 visualViewport.width 也会抖 1~数 px。旧逻辑把它
       当横竖屏变化，180ms 后全量刷新整段聊天；失焦后的收键盘阶段也会中招。
       聚焦及其 760ms 收尾窗口内只移动输入框，禁止任何历史扫描。 */
    if (hostDocument.activeElement?.id === 'send_textarea'
      || Date.now() < mobileKeyboardSettlingUntil) return;

    const width = Math.round(hostWindow.visualViewport?.width || hostWindow.innerWidth || 0);
    if (Math.abs(width - lastViewportWidth) <= 2) return;
    lastViewportWidth = width;
    if (viewportSettleTimer) hostWindow.clearTimeout(viewportSettleTimer);
    viewportSettleTimer = hostWindow.setTimeout(() => {
      viewportSettleTimer = 0;
      scheduleRefresh();
    }, 180);
  }

  /* Via 偶尔漏掉 visualViewport 的最后一个事件。focusin/focusout 先立即排一帧，
     再在键盘动画常见的几个结束点补测；失焦后的第一帧会直接把偏移清零。 */
  function clearMobileViewportSettleTimers() {
    mobileViewportSettleTimers.forEach(id => hostWindow.clearTimeout(id));
    mobileViewportSettleTimers = [];
  }

  /* settling 窗口的结束条件与位移补偿完全分开：视口几何连续两次采样一致
     且 recovery 已结束 → 判定键盘动画真正收尾，提前关窗并做【一次】最终的
     根变量写入；否则一直到 8000ms 兜底到期。中间各档定时器只做 translate
     重测，绝不写根变量 —— 中间值写入引发的整篇 style 失效就是悬空主嫌疑。 */
  let mobileSettleSignature = '';

  function mobileViewportSignature() {
    const viewport = hostWindow.visualViewport;
    return [
      Math.round(hostWindow.innerHeight || 0),
      Math.round(hostDocument.documentElement.clientHeight || 0),
      Math.round(viewport?.height || 0),
      Math.round(viewport?.offsetTop || 0),
    ].join('|');
  }

  function endMobileKeyboardSettling() {
    mobileKeyboardSettlingUntil = 0;
    clearMobileViewportSettleTimers();
    scheduleMobileComposerTranslate();
    if (hostDocument.activeElement?.id !== 'send_textarea') applyMobileViewportMetrics();
  }

  function scheduleMobileViewportSettle() {
    if (!isMobileLayout() || keyboardBaselineMode) return;
    clearMobileViewportSettleTimers();
    /* 现场最慢约 5～6 秒才恢复 Layout Viewport，因此兜底窗口不能再按普通键盘
       动画的 700ms 猜。几何一稳定 endMobileKeyboardSettling 会提前关窗，
       不会真的等满 8 秒。 */
    mobileKeyboardSettlingUntil = Date.now() + 8000;
    mobileSettleSignature = '';
    scheduleMobileComposerTranslate();
    mobileViewportSettleTimers = [300, 900, 2000, 5000, 8000].map(delay => hostWindow.setTimeout(() => {
      if (destroyed) return;
      if (Date.now() >= mobileKeyboardSettlingUntil) { endMobileKeyboardSettling(); return; }
      const signature = mobileViewportSignature();
      if (signature === mobileSettleSignature && !mobileKeyboardRecoveryActive) {
        endMobileKeyboardSettling();
        return;
      }
      mobileSettleSignature = signature;
      scheduleMobileComposerTranslate();
    }, delay));
  }

  /* ===== 键盘悬空真机取证（手动模式） =====
     悬空到底是「DOM 几何还错着」还是「DOM 已正确、屏幕在放旧合成帧」，
     只能靠收键盘后连续几秒的几何采样判定，录像和推理都替代不了。
     但自动采样的 getBoundingClientRect 会强制同步布局，本身就是主线程
     负担，会污染 A/B 复测 —— 所以默认【完全关闭】，只在控制台显式启动：

       __claudeClawdInteraction.keyboardTraceStart({ duration: 9000, interval: 250 })
       （然后复现一次键盘开合，结束后）
       copy(JSON.stringify(__claudeClawdInteraction.keyboardTrace()))

     每次 start 都开新会话：样本数组清空、sessionId 自增、时间戳用绝对
     Date.now()（dt 为相对会话起点的毫秒），不再把多次键盘开合混进
     同一条时间线。late 是定时器实际延迟 —— 主线程被长任务堵住时样本
     成簇迟到，这本身就是“主线程被占”的证据。
     判读：
       · shellBottom 在 focusout 后很快回到 innerHeight 附近、但屏幕仍悬空
         → DOM 几何已正确，是旧帧未提交/主线程被堵（看 late 是否成簇放大）；
       · shellBottom 持续偏离数秒 → 几何本身没恢复，沿 innerHeight/vvHeight/
         vvTop 哪一格没回来继续排查。 */
  const KEYBOARD_TRACE_MAX = 240;
  let keyboardTraceSamples = [];
  let keyboardTraceTimer = 0;
  let keyboardTraceSession = 0;
  let keyboardTraceStartedAt = 0;
  let keyboardTraceDeadline = 0;
  let keyboardTraceInterval = 250;
  let keyboardTraceExpectedAt = 0;

  function snapshotKeyboardGeometry(phase, late) {
    const shell = observedComposerShell?.isConnected
      ? observedComposerShell
      : hostDocument.querySelector('#form_sheld');
    const viewport = hostWindow.visualViewport;
    const rect = shell?.getBoundingClientRect?.();
    const now = Date.now();
    return {
      session: keyboardTraceSession,
      phase,
      t: now,
      dt: now - keyboardTraceStartedAt,
      innerHeight: hostWindow.innerHeight,
      clientHeight: hostDocument.documentElement.clientHeight,
      vvHeight: viewport ? Math.round(viewport.height) : null,
      vvTop: viewport ? Math.round(viewport.offsetTop) : null,
      vvScale: viewport ? Number(viewport.scale?.toFixed?.(3) ?? 1) : null,
      shellBottom: rect ? Math.round(rect.bottom) : null,
      shellHeight: rect ? Math.round(rect.height) : null,
      translate: shell?.style.getPropertyValue(MOBILE_COMPOSER_TRANSLATE_PROPERTY) || '',
      focused: hostDocument.activeElement?.id === 'send_textarea',
      recovering: mobileKeyboardRecoveryActive,
      settling: now < mobileKeyboardSettlingUntil,
      late,
    };
  }

  function pushKeyboardTraceSample(phase, late) {
    if (keyboardTraceSamples.length >= KEYBOARD_TRACE_MAX) keyboardTraceSamples.shift();
    keyboardTraceSamples.push(snapshotKeyboardGeometry(phase, late));
  }

  function stopKeyboardTrace() {
    if (keyboardTraceTimer) hostWindow.clearTimeout(keyboardTraceTimer);
    keyboardTraceTimer = 0;
  }

  function keyboardTraceTick() {
    keyboardTraceTimer = 0;
    if (destroyed) return;
    const now = Date.now();
    if (now > keyboardTraceDeadline) return;
    pushKeyboardTraceSample('tick', now - keyboardTraceExpectedAt);
    keyboardTraceExpectedAt = now + keyboardTraceInterval;
    keyboardTraceTimer = hostWindow.setTimeout(keyboardTraceTick, keyboardTraceInterval);
  }

  function startKeyboardTrace(options = {}) {
    if (!isMobileLayout() || destroyed) return false;
    stopKeyboardTrace();
    keyboardTraceSamples.length = 0;
    keyboardTraceSession += 1;
    keyboardTraceStartedAt = Date.now();
    const duration = Math.min(Math.max(Number(options.duration) || 9000, 500), 30000);
    keyboardTraceInterval = Math.min(Math.max(Number(options.interval) || 250, 50), 2000);
    keyboardTraceDeadline = keyboardTraceStartedAt + duration;
    pushKeyboardTraceSample('start', 0);
    keyboardTraceExpectedAt = keyboardTraceStartedAt + keyboardTraceInterval;
    keyboardTraceTimer = hostWindow.setTimeout(keyboardTraceTick, keyboardTraceInterval);
    return true;
  }

  function isTauriTavernHost() {
    return Boolean(
      hostWindow.__TAURITAVERN__
      || hostWindow.__TAURI_INTERNALS__
      || window.__TAURITAVERN__
      || window.__TAURI_INTERNALS__
    );
  }

  function hasSelectedConversation() {
    const context = getContext();
    const characterId = context?.characterId ?? context?.character_id;
    const groupId = context?.groupId ?? context?.group_id;
    return (characterId !== undefined && characterId !== null && characterId !== '')
      || (groupId !== undefined && groupId !== null && groupId !== '');
  }

  /* 官网会在首页轮换一组短问候；截图已确认 Good morning / What's cooking，
     其余沿用同一套简短、轻微个性化的语气。每次真正回到首页才抽一次，
     refresh 的 DOM 循环不会让文案闪来闪去。 */
  function heroCandidates(who, cn) {
    const hour = new Date().getHours();
    if (cn) {
      const timeLine = hour < 5
        ? (who ? `${who}，还没睡？` : '还没睡？')
        : `${hour < 12 ? '早安' : hour < 18 ? '下午好' : '晚上好'}${who ? `，${who}` : ''}`;
      return [
        timeLine,
        who ? `${who}，今天想做点什么？` : '今天想做点什么？',
        who ? `在忙什么呢，${who}？` : '在忙什么呢？',
        '今天 Claude 能帮你做什么？',
        who ? `${who}，最近怎么样？` : '最近怎么样？',
        who ? `从哪里开始，${who}？` : '从哪里开始？',
        who ? `${who}，在想什么？` : '在想什么？',
        who ? `准备好了就开始吧，${who}` : '准备好了就开始吧',
        who ? `今天一起做点什么，${who}？` : '今天一起做点什么？',
        '新的一页。写点什么？',
      ];
    }
    const timeLine = hour < 5
      ? (who ? `Still up, ${who}?` : 'Still up?')
      : `${hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'}${who ? `, ${who}` : ''}`;
    return [
      timeLine,
      who ? `What's cooking, ${who}?` : "What's cooking?",
      who ? `What are we working on, ${who}?` : 'What are we working on?',
      'How can Claude help you today?',
      who ? `How was your day, ${who}?` : 'How was your day?',
      who ? `Where should we start, ${who}?` : 'Where should we start?',
      who ? `What's on your mind, ${who}?` : "What's on your mind?",
      who ? `Ready when you are, ${who}` : 'Ready when you are',
      who ? `What shall we make, ${who}?` : 'What shall we make?',
      'A fresh page. What goes on it?',
    ];
  }

  function takeHeroLine(who, cn) {
    const candidates = heroCandidates(who, cn);
    let last = '';
    try { last = hostWindow.sessionStorage?.getItem(LAST_HERO_KEY) || ''; } catch {}
    const available = candidates.filter(line => line !== last);
    const pool = available.length ? available : candidates;
    const line = pool[Math.floor(Math.random() * pool.length)];
    try { hostWindow.sessionStorage?.setItem(LAST_HERO_KEY, line); } catch {}
    return line;
  }

  let heroLine = null;

  /* 思维链默认折叠。
     关掉酒馆的 reasoning_auto_expand 只管新渲染的，已经展开的那些还得自己收。
     每条只收一次（打个标记），否则用户手动展开会被下一轮刷新又合上。 */
  function collapseReasoning() {
    for (const box of hostDocument.querySelectorAll(
      '#chat .mes_reasoning_details[open]:not([data-clawd-collapsed])')) {
      box.dataset.clawdCollapsed = '1';
      box.removeAttribute('open');
    }
  }

  function refreshWelcomeMode(messages) {
    if (!welcomeEnabled) return;
    const real = messages.filter(m => !isWelcomeSurfaceMessage(m));
    // 只看「聊天区里有没有真实消息」的话，退出欢迎态要等角色回复渲染出来才发生 ——
    // 用户自己那条发出去之后有一段空窗，人还停在欢迎页上，官网不是这样：
    // 一按发送就进对话了。所以再加一条：发过就不再是欢迎态，不等回复。
    /* 角色/群组选择才是“正在对话”的权威状态，消息数量不是。
       无开场白角色的 chat 合法地是空数组；旧逻辑把它误判成欢迎页。
       real 仍作为欢迎页直接发送临时聊天时的辅助信号。 */
    if (pendingWelcomeCharacter !== null) welcomeStage = 'welcome';
    else if (hasSelectedConversation() || real.length > 0) welcomeStage = 'chat';
    else if (welcomeStage === 'leaving' && Date.now() - leavingSince <= 15000) {
      // 首次发送到角色/临时聊天的短暂建档窗口：保持退出欢迎页，等上下文接上。
    } else {
      welcomeStage = 'welcome';
    }
    const isWelcome = welcomeStage === 'welcome';
    hostDocument.body.classList.toggle(WELCOME_CLASS, isWelcome);
    // 回到欢迎页 = 换对话了，打盹计时重新来过
    if (isWelcome && hasChatActivity) {
      hasChatActivity = false;
      idleAsleep = false;
      setSleeping(false);
    }

    const chat = hostDocument.querySelector('#chat');
    // 全文档找，不只找 #chat 下面 —— 酒馆重建聊天区时旧的可能被挪到别处，
    // 只在 #chat 里判重就会漏掉，然后又新建一个。
    const strays = [...hostDocument.querySelectorAll('.' + HERO_CLASS)];

    if (!isWelcome || !chat) {
      for (const el of strays) el.remove();
      heroLine = null;
      return;
    }
    /* 正好一个、位置对、而且问候语文字还在（不是只剩图标），才算没事不用动。
       之前只检查"数量对不对 + 挂对地方"：如果那句文字在别处被清空过
       （怀疑跟 1.18.0 欢迎页改版有关——目前没能在那个版本上复现，只能先按
       "文字丢了就重建"这条防线兜底），图标会一直立在那儿，问候语永远补不回来，
       因为这条判断一直觉得"数量对、位置对，没必要动"。 */
    if (strays.length === 1 && strays[0].parentElement === chat && strays[0].textContent.trim()) return;
    for (const el of strays) el.remove();

    // 每次进入欢迎态才重抽一句，刷新循环里不重抽，否则会一直闪
    if (heroLine === null) {
      const who = (getContext()?.name1 || '').trim();
      const cn = ccPrefersChinese();
      heroLine = takeHeroLine(who, cn);
    }
    const hero = hostDocument.createElement('div');
    hero.className = HERO_CLASS;
    hero.innerHTML = '<span class="asterisk"></span>';
    hero.append(hostDocument.createTextNode(heroLine));
    chat.prepend(hero);
  }

  /* 侧栏品牌区 + Recents。只在完整版包里跑。 */
  const RAIL_BRAND_CLASS = 'clawd-rail-brand';
  const RAIL_RECENTS_CLASS = 'clawd-rail-recents';
  // 侧栏的东西看 rail 开关，不是 welcome。写错的时候侧栏版（rail 开、welcome 关）
  // 会一条聊天记录都不显示，而完整版看着是好的 —— 很难注意到。
  const railEnabled = typeof CLAUDE_FEATURES !== 'undefined' && CLAUDE_FEATURES.rail;

  function refreshRailBrand() {
    if (!railEnabled) return;
    const holder = hostDocument.querySelector('#top-settings-holder');
    if (!holder) return;
    const brands = [...hostDocument.querySelectorAll('.' + RAIL_BRAND_CLASS)];
    for (const extra of brands.slice(1)) extra.remove();
    let brand = brands[0] || null;
    if (brand && brand.parentElement !== holder) { brand.remove(); brand = null; }
    if (!brand) {
      brand = hostDocument.createElement('div');
      brand.className = RAIL_BRAND_CLASS;
      brand.textContent = 'Claude';
      holder.prepend(brand);
    }
  }

  /* ===== 侧栏 Recents：自己渲染，不再搬酒馆的 DOM =====

     旧做法是把欢迎页那块 Recent Chats 整个节点搬进侧栏。它有三个死穴：

     1. 欢迎面板只在没有打开的聊天时才渲染（1.18 的 openWelcomeScreen 开头
        就是 `if (getCurrentChatId() !== undefined) return;`）。直达聊天地址
        或在聊天页刷新时，面板从未存在，搬无可搬 —— 侧栏空白。这就是 A4。
     2. 搬的是 #chat 的子节点，等于从聊天容器里偷东西，A1 排查时多一个变量。
     3. 行上的 data-avatar / data-file 是渲染那一刻的快照，且经过 HTML 属性
        这一道，真机上出现过前导空格被吃掉，导致删除/打开全部静默失败。

     改成直接打 /api/chats/recent 自己渲染。DOM 结构保持
     .clawd-rail-recents > .recentChatList > .recentChat，
     沿用酒馆的类名 —— module-rail.css 里那批 `> * > *` 的规则就不用动。
     （方案文档里我原本写的是"用自己的类名"，改主意了：自渲染和 CSS 重写
     一起做的话，出了回归没法归因。类名留到以后单独一轮再换。） */

  const RECENT_SETTINGS_KEY = 'recentChatsSettings';
  const PINNED_CHATS_KEY = 'pinnedChats';
  const RECENT_DEFAULT_MAX = 15;
  let recentRenderToken = 0;
  let recentRenderPending = false;
  /* 上一次渲染出来的内容指纹。内容没变就一个 DOM 都不动。
     不做这件事的后果（2026-07-26 真机）：主刷新循环每轮都重建整个列表，
     鼠标悬停触发一次 DOM 变动就闪一下，而且 mousedown 和 mouseup 之间
     节点被换掉，浏览器压根不派发 click —— 表现为"点了没反应"。 */
  let recentSignature = null;
  /* 拉取策略：事件驱动，不轮询。

     第一版写成「3 秒冷却」，等于每 3 秒往服务器打一次 /api/chats/recent。
     本地酒馆看不出来，云酒馆上每次都是真的网络往返，真机反馈是输入框
     打字要等一秒才出字。冷却时间调长治标不治本 —— 列表本来就只在
     几个明确的时刻会变，按时间轮询是错的。

     现在只有这些情况会真的去拉：
       · 第一次（还没有任何数据）
       · 调用方明确 force（删除完成、收到 CHAT_DELETED / CHAT_CHANGED）
       · 超过 TTL 且当前停在欢迎页（用户正看着这个列表）
     其余时候 refreshRailRecents 只保证槽位存在，一个请求都不发。 */
  const RECENT_FETCH_TTL = 60000;
  let recentFetchedAt = 0;
  let recentLoadedOnce = false;
  /* 数据版本号。删除之类会改变列表的动作要把它 +1。
     在飞的那次拉取如果是在版本变化之前发出的，结果就作废 ——
     否则「删除前发起、删除后返回」的那次会把已经删掉的行又画回去，
     表现就是"删完的记录莫名又冒出来"。 */
  let recentDataVersion = 0;

  function readAccountStorage(key) {
    const store = getContext()?.accountStorage;
    try {
      const raw = typeof store?.getItem === 'function'
        ? store.getItem(key)
        : hostWindow.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function readRecentChatsSettings() {
    const parsed = readAccountStorage(RECENT_SETTINGS_KEY);
    const max = Math.max(1, parseInt(parsed?.maxDisplayed, 10) || RECENT_DEFAULT_MAX);
    return { maxDisplayed: max };
  }

  /* 置顶状态的 key 拼法照抄 1.18 的 PinnedChatsManager.getKey：
     `${group?'group_'+group:''}${avatar?'char_'+avatar:''}_${file_name}` */
  function readPinnedChats() {
    const state = readAccountStorage(PINNED_CHATS_KEY);
    return state && typeof state === 'object' ? state : {};
  }

  function pinnedKeyFor(record) {
    const group = record?.group ? `group_${record.group}` : '';
    const avatar = record?.avatar ? `char_${record.avatar}` : '';
    return `${group}${avatar}_${record?.file_name ?? ''}`;
  }

  /* 拉取 + 补齐 + 排序。补齐和排序规则照抄 1.18 getRecentChats 的尾巴，
     否则侧栏顺序会和欢迎页对不上。 */
  async function buildRecentEntries() {
    const { main } = await loadDeleteModules();
    const settings = readRecentChatsSettings();
    const pinned = readPinnedChats();
    const records = await fetchRecentChatRecords(main, settings.maxDisplayed, Object.values(pinned));
    if (!records) return null;

    const context = getContext();
    const characters = Array.isArray(context?.characters) ? context.characters : [];
    const groups = Array.isArray(context?.groups) ? context.groups : [];

    const entries = [];
    for (const record of records) {
      const character = characters.find(item => item?.avatar === record?.avatar) ?? null;
      const group = groups.find(item => item?.id === record?.group) ?? null;
      /* 酒馆自己也会把认不出实体的记录过滤掉，我们跟着做，
         免得渲染出一行点了什么都不会发生的死记录。 */
      if (!character && !group) continue;
      entries.push({
        record,
        fileName: String(record?.file_name ?? '').replace(/\.jsonl$/i, ''),
        avatar: String(record?.avatar ?? ''),
        group: String(record?.group ?? ''),
        isGroup: Boolean(group),
        name: character?.name || group?.name || '',
        thumbnail: character && typeof context?.getThumbnailUrl === 'function'
          ? context.getThumbnailUrl('avatar', character.avatar)
          : '',
        dateText: String(record?.last_mes ?? ''),
        pinned: Object.prototype.hasOwnProperty.call(pinned, pinnedKeyFor(record)),
      });
    }

    /* 置顶的排前面，组内按最后一条消息倒序。 */
    entries.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return String(b.dateText).localeCompare(String(a.dateText));
    });
    return entries;
  }

  function ensureRecentsSlot(holder) {
    const slots = [...hostDocument.querySelectorAll('.' + RAIL_RECENTS_CLASS)];
    for (const extra of slots.slice(1)) extra.remove();
    let slot = slots[0] || null;
    if (slot && slot.parentElement !== holder) { slot.remove(); slot = null; }
    if (slot) return slot;

    slot = hostDocument.createElement('div');
    slot.className = RAIL_RECENTS_CLASS;
    const label = hostDocument.createElement('div');
    label.className = 'clawd-rail-recents-label';
    label.textContent = ccPrefersChinese() ? '最近' : 'Recents';
    slot.append(label);
    const pinnedDrawer = holder.querySelector(':scope > .drawer#persona-management-button');
    if (pinnedDrawer) holder.insertBefore(slot, pinnedDrawer);
    else holder.append(slot);
    return slot;
  }

  function buildRecentRow(entry) {
    const row = hostDocument.createElement('div');
    row.className = 'recentChat' + (entry.isGroup ? ' group' : '');
    /* data-* 沿用酒馆的命名，删除链路和 dropRecentRow 都按这几个属性找行。
       注意：这里写进去的是服务端原始值，读回来可能被改写（前导空格），
       所以下游一律走 normalizeChatKey 松匹配，不做严格相等。 */
    row.dataset.file = entry.fileName;
    row.dataset.avatar = entry.avatar;
    row.dataset.group = entry.group;

    const avatar = hostDocument.createElement('div');
    avatar.className = 'avatar';
    if (entry.thumbnail) {
      const img = hostDocument.createElement('img');
      img.src = entry.thumbnail;
      img.alt = entry.name;
      avatar.append(img);
    }

    /* 内部结构必须和 1.18 的 welcomePanel.html 一模一样，连
       .chatNameContainer 这层包装和 .chatName 里的两个 <span> 都不能省。
       module-rail.css / module-mobile.css 是照着那套结构写的：
         · 手机端 .recentChatInfo > .chatNameContainer 负责限高 34px
         · 手机端 .chatName > span { display:none } 只留角色名，省掉时间戳
         · 手机端 .chatActions { display:none } 故意不给删除键
       第一版我图省事把 .chatName 直接塞进 .recentChatInfo，还用文本节点
       代替 <span>，结果这几条规则全部落空 —— PC 上看不出来，手机上必炸。 */
    const info = hostDocument.createElement('div');
    info.className = 'recentChatInfo';

    const nameContainer = hostDocument.createElement('div');
    nameContainer.className = 'chatNameContainer';

    const nameLine = hostDocument.createElement('div');
    nameLine.className = 'chatName';
    nameLine.title = entry.fileName;
    const strong = hostDocument.createElement('strong');
    strong.className = 'characterName';
    strong.textContent = entry.name;
    const dash = hostDocument.createElement('span');
    dash.textContent = '–';
    const chatLabel = hostDocument.createElement('span');
    chatLabel.textContent = entry.fileName;
    nameLine.append(strong, dash, chatLabel);

    const date = hostDocument.createElement('small');
    date.className = 'chatDate';
    date.textContent = entry.dateText;

    const actions = hostDocument.createElement('div');
    actions.className = 'chatActions';
    const del = hostDocument.createElement('button');
    del.type = 'button';
    del.className = 'menu_button menu_button_icon deleteChat';
    del.title = ccPrefersChinese() ? '删除对话' : 'Delete chat';
    del.innerHTML = '<i class="fa-solid fa-trash fa-fw"></i>';
    actions.append(del);

    nameContainer.append(nameLine, date, actions);
    info.append(nameContainer);
    row.append(avatar, info);
    return row;
  }

  /* 打开一条近期对话。顺序照抄 1.18 welcome-screen.js 的
     openRecentCharacterChat / openRecentGroupChat。

     setActiveCharacter / setActiveGroup 这一步不能省：它写的是「最后活跃的
     角色」，酒馆下次启动靠它恢复。getContext() 没导出这两个函数，只能从
     宿主模块拿 —— 漏掉的话就会表现成「返回首页后最新对话指向错误」，
     也就是规划文档里的 A2。 */
  async function openRecentChat(entry) {
    const { main, groups } = await loadDeleteModules();
    const context = getContext();

    if (entry.isGroup) {
      if (typeof groups?.openGroupById === 'function') await groups.openGroupById(entry.group);
      if (typeof main?.setActiveGroup === 'function') main.setActiveGroup(entry.group);
      else console.warn('[Claude-Clawd] 拿不到 setActiveGroup，最后活跃群组不会更新。');
      context?.saveSettingsDebounced?.();
      if (context?.getCurrentChatId?.() === entry.fileName) return;
      await context?.openGroupChat?.(entry.group, entry.fileName);
      return;
    }

    const characters = Array.isArray(context?.characters) ? context.characters : [];
    /* 和删除那边同一个理由：DOM/服务端两侧的头像文件名可能差首尾空白，
       严格 findIndex 会 -1，然后什么都不会发生。 */
    const { index } = resolveCharacterIndex({ characters }, entry.avatar);
    if (index < 0) {
      console.warn(`[Claude-Clawd] 找不到头像为 ${JSON.stringify(entry.avatar)} 的角色，打不开。`);
      hostWindow.toastr?.warning?.(ccPrefersChinese() ? '找不到对应的角色卡。' : 'Character not found.');
      return;
    }

    await context?.selectCharacterById?.(index);
    if (typeof main?.setActiveCharacter === 'function') main.setActiveCharacter(characters[index]?.avatar);
    else console.warn('[Claude-Clawd] 拿不到 setActiveCharacter，最后活跃角色不会更新（A2 的成因）。');
    context?.saveSettingsDebounced?.();
    if (context?.getCurrentChatId?.() === entry.fileName) {
      scheduleChatReconcile();
      return;
    }
    await context?.openCharacterChat?.(entry.fileName);
    /* selectCharacterById 和 openCharacterChat 之间那个「聊天 id 未定」的窗口，
       正是欢迎页问候语挤进来的时机。这里主动排一次对账。 */
    scheduleChatReconcile();
  }

  function signatureOf(entries) {
    return JSON.stringify(entries.map(entry => [
      entry.fileName, entry.avatar, entry.group, entry.name, entry.pinned ? 1 : 0,
    ]));
  }

  function renderRecentRows(slot, entries) {
    const existing = slot.querySelector('.recentChatList');
    const list = existing ?? hostDocument.createElement('div');
    if (!existing) {
      list.className = 'recentChatList';
      /* 标记成我们自己的，destroy 时才知道这份可以直接删、
         不用当成借来的节点还回欢迎页。 */
      list.dataset.clawdOwned = '1';
      slot.append(list);
    }
    list.dataset.clawdOwned = '1';
    list.textContent = '';
    for (const entry of entries) {
      const row = buildRecentRow(entry);
      /* 监听器绑在自己造的节点上，不依赖酒馆的任何绑定时机。
         行整体点击 = 打开；删除键单独处理并阻止冒泡，免得删完顺手把它打开。 */
      row.addEventListener('click', event => {
        if (event.target instanceof hostWindow.Element
          && event.target.closest('.deleteChat')) return;
        void openRecentChat(entry).catch(error => {
          console.error('[Claude-Clawd] 打开近期对话失败：', error);
        });
      });
      /* 删除键直接绑在自己的按钮上。
         以前是在 window capture 阶段拦酒馆的按钮 —— 那是因为行是借来的，
         没有别的下手处。现在行是我们自己造的，不需要再抢在任何人前面，
         整套拦截和版本分流因此都删掉了。 */
      row.querySelector('.deleteChat')?.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        if (recentDeleteBusy) return;
        recentDeleteBusy = true;
        void deleteRecentWithoutOpening(row).catch(error => {
          console.error('[Claude-Clawd] 删除近期对话失败：', error);
          const detail = String(error?.message || error || '').slice(0, 180);
          hostWindow.toastr?.error?.(
            ccPrefersChinese() ? `删除失败：${detail}` : `Chat deletion failed: ${detail}`,
          );
        }).finally(() => {
          recentDeleteBusy = false;
          refreshRailRecents({ force: true });
        });
      });
      list.append(row);
    }
    hostDocument.body.classList.toggle('clawd-has-recents', entries.length > 0);
  }

  /* 对外仍然叫 refreshRailRecents，因为每轮 refresh 都在调它。
     真正的拉取是异步的，这里只做去重调度：一轮在飞就不再发第二轮。 */
  /* ===== 切换聊天后的对账：DOM 条数必须等于数据条数 =====

     2026-07-26 真机抓到的时序（从首页点进对话）：

       37908ms  ✂ #chat 移除 4 → 剩 0      clearChat 正常执行
       38287ms  + #chat 新增 2 → 共 2      ← 清空之后又冒出来 2 条
       40235ms  + #chat 新增 13 → 共 15    真正的聊天内容追加在后面

     结果 DOM 15 条 / 数据 13 条，最前面多出 mesid=0 和 mesid=1 两条，
     而且 mesid=0 那条内容被写了两遍（268 字 = 134 字 × 2）。

     那 2 条是欢迎页的问候语和提示语 —— 1.18 的 openWelcomeScreen 里
     sendAssistantMessage() + sendWelcomePrompt() 正好两条。它订阅了
     CHAT_CHANGED，守卫是 `if (getCurrentChatId() !== undefined) return;`，
     而 selectCharacterById → openCharacterChat 两步之间存在一个
     「当前聊天 id 尚未确定」的窗口，欢迎页就在那一瞬间挤了进来，
     插在 clearChat 之后、真正渲染之前，于是留了下来。

     我们改不了酒馆的事件顺序，但可以在尘埃落定之后对一次账：
     DOM 比数据多出来的、且 mesid 在后面重复出现过的，就是这种残留，摘掉。
     只按「mesid 重复」这一个判据动手，绝不按位置或条数硬删 ——
     宁可漏掉一条，也不能误删真实消息。 */
  /* 重试而不是等一个固定的长延迟。
     第一版只在 400ms 后查一次：那一刻酒馆往往还没渲染完，条数对不上，
     按保守规则不动手，然后要等下一次 CHAT_CHANGED 才会再查。
     真机实测残留节点亮了 4.4 秒才消失（36086ms 渲染完，40510ms 才摘掉）。
     改成短间隔多次重试，正常情况下半秒内收工；一直对不上就放弃并留一条日志。 */
  const RECONCILE_INTERVAL = 200;
  const RECONCILE_MAX_ATTEMPTS = 12;   // 200ms × 12 ≈ 2.4 秒
  let reconcileTimer = 0;
  let reconcileAttempts = 0;

  function retryReconcile() {
    if (destroyed || reconcileAttempts >= RECONCILE_MAX_ATTEMPTS) return false;
    reconcileAttempts += 1;
    reconcileTimer = hostWindow.setTimeout(reconcileChatDom, RECONCILE_INTERVAL);
    return true;
  }

  function reconcileChatDom() {
    reconcileTimer = 0;
    if (destroyed) return;
    const chatNode = hostDocument.querySelector('#chat');
    const data = getContext()?.chat;
    if (!chatNode || !Array.isArray(data)) { retryReconcile(); return; }

    const nodes = [...chatNode.querySelectorAll(':scope > .mes')];
    /* 条数已经对上（或者 DOM 更少，说明还在渲染中途），收工不再重试。
       少于数据条数是正常的中间态，多等一轮也没意义 —— 下一次渲染完成
       会再触发一次 CHAT_CHANGED。 */
    if (nodes.length <= data.length) return;

    /* 从后往前记录每个 mesid 最后出现的位置；出现在它之前的同号节点就是残留。 */
    const lastIndexOf = new Map();
    nodes.forEach((node, index) => lastIndexOf.set(node.getAttribute('mesid'), index));
    const stale = nodes.filter((node, index) => lastIndexOf.get(node.getAttribute('mesid')) !== index);

    /* 摘掉之后条数还是对不上的话，多半是还没渲染完 —— 再等一轮。
       等满还是对不上，说明多出来的不是这种残留，一个都不动。 */
    if (!stale.length || nodes.length - stale.length !== data.length) {
      if (retryReconcile()) return;
      console.warn(
        `[Claude-Clawd] #chat 有 ${nodes.length} 条、数据有 ${data.length} 条，`
        + `但按 mesid 重复只能解释 ${stale.length} 条，保守起见不动。`,
      );
      return;
    }

    for (const node of stale) node.remove();
    console.info(
      `[Claude-Clawd] 切换聊天后清掉 ${stale.length} 条残留节点`
      + `（欢迎页问候语挤在 clearChat 和正式渲染之间），用了 ${reconcileAttempts} 次重试。`,
    );
  }

  function scheduleChatReconcile() {
    if (destroyed) return;
    /* 新的一轮切换，重试次数从头算，别被上一轮耗光了配额。 */
    reconcileAttempts = 0;
    if (reconcileTimer) hostWindow.clearTimeout(reconcileTimer);
    reconcileTimer = hostWindow.setTimeout(reconcileChatDom, RECONCILE_INTERVAL);
  }

  function shouldFetchRecents(force, now) {
    if (force) return true;
    if (!recentLoadedOnce) return true;
    /* 用户没在看这个列表的时候不刷 —— 侧栏在聊天页是收着的，
       刷了也没人看，纯粹是白花一次往返。 */
    if (!hostDocument.body.classList.contains(WELCOME_CLASS)) return false;
    return now - recentFetchedAt > RECENT_FETCH_TTL;
  }

  function refreshRailRecents({ force = false } = {}) {
    if (!railEnabled || destroyed) return;
    const holder = hostDocument.querySelector('#top-settings-holder');
    if (!holder) return;
    ensureRecentsSlot(holder);
    if (recentRenderPending) return;

    const now = Date.now();
    if (!shouldFetchRecents(force, now)) return;
    recentFetchedAt = now;
    recentLoadedOnce = true;
    recentRenderPending = true;
    const token = ++recentRenderToken;
    const versionAtFetch = recentDataVersion;

    void buildRecentEntries()
      .then(entries => {
        /* 期间又发起过新的一轮，或者脚本已经拆了，就丢弃这次结果。 */
        if (destroyed || token !== recentRenderToken || !entries) return;
        /* 拉取期间数据被改过（多半是删除），这批结果已经过期，丢掉重来。 */
        if (versionAtFetch !== recentDataVersion) {
          hostWindow.setTimeout(() => refreshRailRecents({ force: true }), 0);
          return;
        }
        const slotNow = hostDocument.querySelector('.' + RAIL_RECENTS_CLASS);
        if (!slotNow) return;
        /* 内容没变就什么都不做 —— 保住现有节点，鼠标交互才不会被打断。 */
        const signature = signatureOf(entries);
        if (signature === recentSignature && slotNow.querySelector('.recentChatList')) return;
        recentSignature = signature;
        renderRecentRows(slotNow, entries);
      })
      .catch(error => {
        console.warn('[Claude-Clawd] 侧栏近期对话渲染失败：', error);
      })
      .finally(() => {
        recentRenderPending = false;
      });
  }

  /* 删掉一条对话之后，酒馆只有在重画欢迎页时才会重建列表。
     如果删除是在对话里触发的，欢迎页根本没重画，侧栏那份就留着一条死记录。
     直接听 CHAT_DELETED 把对应的行摘掉。
     行上有 data-file，事件给的是不带 .jsonl 的文件名，能直接对上。 */
  /* 改成自渲染之后，侧栏里的行全是我们自己造的，没有任何借来的节点，
     拆的时候直接整块删掉就行 —— 不再需要「还回欢迎页原位」那套逻辑，
     也就不会再出现还错地方导致的「历史记录消失，刷新又回来」。

     只留一条兼容处理：万一装的是旧版本搬过节点，槽位里可能还躺着酒馆的
     真实列表，那份不能删，得放回 #chat，否则关掉脚本后欢迎页会是空的。 */
  function restoreRecents() {
    const slot = hostDocument.querySelector('.' + RAIL_RECENTS_CLASS);
    if (slot) {
      const borrowed = [...slot.querySelectorAll('.recentChatList')]
        .filter(list => !list.dataset.clawdOwned);
      for (const list of borrowed) {
        if (list.querySelector('.recentChat')) hostDocument.querySelector('#chat')?.append(list);
      }
      slot.remove();
    }
    hostDocument.body.classList.remove('clawd-has-recents');
  }

  const CHAT_DELETED_EVENT = 'chatDeleted';
  const GROUP_CHAT_DELETED_EVENT = 'groupChatDeleted';
  const chatDeletedSubscriptions = [];

  function watchChatDeleted() {
    if (!railEnabled || chatDeletedSubscriptions.length) return;
    const context = getContext();
    const source = context?.eventSource;
    const types = context?.eventTypes || context?.event_types || {};
    if (!source?.on) return;
    const eventTypes = new Set([
      types.CHAT_DELETED || CHAT_DELETED_EVENT,
      types.GROUP_CHAT_DELETED || GROUP_CHAT_DELETED_EVENT,
    ]);
    for (const type of eventTypes) {
      /* 摘掉那一行只是让界面立刻有反馈，真正的对齐还是靠重新拉一次。
         指纹要作废，否则重拉回来的内容和上次一样就被跳过了。 */
      const handler = name => {
        dropRecentRow(name);
        recentSignature = null;
        recentDataVersion += 1;
        refreshRailRecents({ force: true });
      };
      source.on(type, handler);
      chatDeletedSubscriptions.push({ source, type, handler });
    }

    /* 切换聊天时列表顺序会变（刚聊过的要冒到最前面）。
       订阅这个事件，就不需要靠定时轮询来发现变化了。 */
    const changedType = types.CHAT_CHANGED || 'chatLoaded';
    const changedHandler = () => {
      recentSignature = null;
      refreshRailRecents({ force: true });
      scheduleChatReconcile();
    };
    source.on(changedType, changedHandler);
    chatDeletedSubscriptions.push({ source, type: changedType, handler: changedHandler });
  }

  /* 欢迎页的 recentChat 删除键在部分酒馆版本里会先 selectChat()，再弹确认框。
     在 window capture 阶段截住这一次 click，早于 document、按钮和行上的 handler；
     然后直接调用酒馆自己“按文件名删除”的模块函数；
     原按钮 handler 和行点击 handler 都不会执行，因此根本不需要遮罩或“删完再退回主页”。 */
  let recentDeleteBusy = false;
  let deleteModulesPromise = null;

  function hostModuleRoot() {
    const mainScript = [...hostDocument.scripts].find(script => /(?:^|\/)script\.js(?:[?#].*)?$/.test(script.src));
    return {
      main: mainScript?.src || new hostWindow.URL('script.js', hostDocument.baseURI).href,
      root: new hostWindow.URL('.', mainScript?.src || hostDocument.baseURI),
    };
  }

  function resolveHostModule(relativePath) {
    const urls = hostModuleRoot();
    /* 主模块必须保留页面实际使用的 ?v=... 等查询参数。
       去掉它再 import 会被浏览器当成另一份模块，可能把 SillyTavern 主程序重复执行一次。 */
    if (relativePath === 'script.js') return urls.main;
    return new hostWindow.URL(relativePath, urls.root).href;
  }

  /* 这里曾经直接在本 realm 里 import()。那是错的，而且一直是坏的。
     脚本跑在酒馆助手的 iframe 里，ES module 注册表按 realm 隔离：iframe realm 里
     没有酒馆的模块缓存，import 会从头实例化整张模块图，而从 script.js 这个
     非入口点进去必然撞上 slash-commands.js 的循环依赖：

       ReferenceError: Cannot access 'SlashCommandParser' before initialization

     2026-07-26 在 SillyTavern 1.18.0 上实测：宿主 realm import 正常，
     两个 srcdoc iframe 全部抛这个错。外面包着 allSettled，所以不崩，
     而是静默降级成三个空对象——删除确认框掉到 hostWindow.confirm()（浏览器原生框），
     删除本身掉到手搓 fetch 的兜底路径。

     正确做法：让 import 发生在宿主 realm。往宿主文档塞一段 module script，
     它命中宿主已有的模块缓存，拿到的是活实例。 */
  const HOST_MODULES_KEY = '__clawdHostModules';
  const HOST_MODULES_EVENT = 'clawd-host-modules-ready';
  const HOST_MODULES_TIMEOUT = 8000;

  function injectHostModuleLoader() {
    const urls = {
      main: resolveHostModule('script.js'),
      groups: resolveHostModule('scripts/group-chats.js'),
      popup: resolveHostModule('scripts/popup.js'),
    };
    /* 模块说明符写成绝对地址：blob 兜底那条路的 baseURI 是 blob:，
       相对路径在那里解析不出来。 */
    const source = [
      `import * as main from ${JSON.stringify(urls.main)};`,
      `import * as groups from ${JSON.stringify(urls.groups)};`,
      `import * as popup from ${JSON.stringify(urls.popup)};`,
      `window[${JSON.stringify(HOST_MODULES_KEY)}] = { main, groups, popup };`,
      `window.dispatchEvent(new CustomEvent(${JSON.stringify(HOST_MODULES_EVENT)}));`,
    ].join('\n');

    return new Promise((resolve, reject) => {
      if (hostWindow[HOST_MODULES_KEY]) {
        resolve(hostWindow[HOST_MODULES_KEY]);
        return;
      }
      const timer = hostWindow.setTimeout(
        () => reject(new Error('宿主模块注入超时，可能被 CSP 拦掉了。')),
        HOST_MODULES_TIMEOUT,
      );
      hostWindow.addEventListener(HOST_MODULES_EVENT, () => {
        hostWindow.clearTimeout(timer);
        resolve(hostWindow[HOST_MODULES_KEY]);
      }, { once: true });

      let blobTried = false;
      const tryBlob = () => {
        if (blobTried || hostWindow[HOST_MODULES_KEY]) return;
        blobTried = true;
        appendBlobLoader(source);
      };

      const inline = hostDocument.createElement('script');
      inline.type = 'module';
      inline.textContent = source;
      /* 内联 module script 被 CSP 挡掉时不会抛异常，只会静默不执行，
         所以不能只靠 error 事件，还得留一条按时间兜底的路。
         两条路写的是同一个 key，谁先到算谁的。
         2000ms 是留给模块图加载的余量——太短会在正常但慢的机器上白插一次。 */
      inline.addEventListener('error', tryBlob, { once: true });
      hostDocument.head.append(inline);
      hostWindow.setTimeout(tryBlob, 2000);
    });
  }

  function appendBlobLoader(source) {
    /* jsdom 之类的环境没有 createObjectURL。这不是错误，只是这条兜底路走不通，
       外层 8 秒超时会照常兜住，不需要在这里刷警告。 */
    if (typeof hostWindow.URL?.createObjectURL !== 'function' || typeof hostWindow.Blob !== 'function') {
      return;
    }
    try {
      const blob = new hostWindow.Blob([source], { type: 'text/javascript' });
      const tag = hostDocument.createElement('script');
      tag.type = 'module';
      tag.src = hostWindow.URL.createObjectURL(blob);
      hostDocument.head.append(tag);
    } catch (error) {
      console.warn('[Claude-Clawd] blob 兜底也失败了：', error);
    }
  }

  /* 宿主模块的同步快照。click 处理必须同步决定拦不拦，等不了 promise。 */
  let hostModulesSnapshot = null;

  function loadDeleteModules() {
    if (!deleteModulesPromise) {
      deleteModulesPromise = injectHostModuleLoader()
        .then(modules => {
          const resolved = {
            main: modules?.main ?? {},
            groups: modules?.groups ?? {},
            popup: modules?.popup ?? {},
            errors: [],
          };
          hostModulesSnapshot = resolved;
          return resolved;
        })
        .catch(error => {
          console.warn('[Claude-Clawd] 拿不到宿主模块，删除会走降级路径：', error);
          const resolved = { main: {}, groups: {}, popup: {}, errors: [error] };
          hostModulesSnapshot = resolved;
          return resolved;
        });
    }
    return deleteModulesPromise;
  }

  /* 在酒馆的 characters 数组里找这个头像文件名。
     先精确匹配；匹配不上再退一步做去空白比较。
     真机上遇到过角色 avatar 是 " C laude.png"（前导空格），而
     .recentChat[data-avatar] 读出来没有那个空格，酒馆自己的
     deleteRecentCharacterChat 就卡在 findIndex === -1 上，
     控制台只留一行 "Character not found for avatar ID: ..." 然后 return，
     表现出来就是"删除键点了没反应"。 */
  function resolveCharacterIndex(main, avatarId) {
    const list = Array.isArray(main?.characters) ? main.characters : [];
    const exact = list.findIndex(character => character?.avatar === avatarId);
    if (exact >= 0) return { index: exact, loose: false };

    const wanted = String(avatarId ?? '').trim();
    if (!wanted) return { index: -1, loose: false };
    const loose = list.findIndex(character => String(character?.avatar ?? '').trim() === wanted);
    if (loose >= 0) {
      console.warn(
        `[Claude-Clawd] 头像文件名首尾空白对不上：DOM 里是 ${JSON.stringify(avatarId)}，`
        + `角色卡里是 ${JSON.stringify(list[loose]?.avatar)}。已按去空白匹配处理。`,
      );
    }
    return { index: loose, loose: loose >= 0 };
  }


  async function confirmRecentDelete(popup) {
    const title = ccPrefersChinese() ? '删除这个对话文件？' : 'Delete the Chat File?';
    if (typeof popup?.callGenericPopup === 'function' && popup?.POPUP_TYPE?.CONFIRM !== undefined) {
      return Boolean(await popup.callGenericPopup(title, popup.POPUP_TYPE.CONFIRM));
    }
    if (typeof popup?.Popup?.show?.confirm === 'function') {
      return Boolean(await popup.Popup.show.confirm(title, ''));
    }
    return hostWindow.confirm(title);
  }

  async function hostRequestHeaders(main) {
    if (typeof main?.getRequestHeaders === 'function') return main.getRequestHeaders();
    const response = await hostWindow.fetch(new hostWindow.URL('csrf-token', hostModuleRoot().root));
    if (!response.ok) throw new Error(`无法取得 CSRF token（HTTP ${response.status}）。`);
    const data = await response.json();
    if (!data?.token) throw new Error('CSRF token 响应无效。');
    return { 'Content-Type': 'application/json', 'X-CSRF-Token': data.token };
  }

  async function emitChatDeleted(eventKey, fileName) {
    const context = getContext();
    const source = context?.eventSource;
    const types = context?.eventTypes || context?.event_types || {};
    const fallback = eventKey === 'GROUP_CHAT_DELETED' ? GROUP_CHAT_DELETED_EVENT : CHAT_DELETED_EVENT;
    await source?.emit?.(types[eventKey] || fallback, fileName);
  }

  async function deleteCharacterChatDirect(main, avatarId, fileName) {
    const response = await hostWindow.fetch(new hostWindow.URL('api/chats/delete', hostModuleRoot().root), {
      method: 'POST',
      headers: await hostRequestHeaders(main),
      body: JSON.stringify({ chatfile: `${fileName}.jsonl`, avatar_url: avatarId }),
    });
    if (!response.ok) throw new Error(`角色对话删除接口返回 HTTP ${response.status}。`);
    await emitChatDeleted('CHAT_DELETED', fileName);
  }

  async function deleteGroupChatDirect(main, groups, groupId, fileName) {
    const group = Array.isArray(groups?.groups) ? groups.groups.find(item => item?.id === groupId) : null;
    if (!group || !Array.isArray(group.chats) || typeof groups.editGroup !== 'function') {
      throw new Error('当前酒馆版本未提供安全更新群聊索引所需的接口。');
    }
    const response = await hostWindow.fetch(new hostWindow.URL('api/chats/group/delete', hostModuleRoot().root), {
      method: 'POST',
      headers: await hostRequestHeaders(main),
      body: JSON.stringify({ id: fileName }),
    });
    if (!response.ok) throw new Error(`群聊删除接口返回 HTTP ${response.status}。`);
    const index = group.chats.indexOf(fileName);
    if (index >= 0) group.chats.splice(index, 1);
    if (group.chat_id === fileName) group.chat_id = group.chats.at(-1) || '';
    await groups.editGroup(groupId, true, true);
    await emitChatDeleted('GROUP_CHAT_DELETED', fileName);
  }

  /* ===== 近期对话：一律以服务端记录为准，不信 DOM 属性 =====

     2026-07-26 真机踩到的坑：角色的 avatar 是 " C laude.png"（前导空格），
     对应的聊天文件是 " C laude - 2026-07-26@....jsonl"，但
     .recentChat[data-avatar] / [data-file] 读出来都没有那个前导空格。
     于是每一次字符串比较都是错的：
       · 酒馆原生 deleteRecentCharacterChat 的 findIndex 直接 -1，静默 return
       · 我们按 DOM 的 fileName 去删，删的是一个不存在的文件，服务端不报错
       · 我们再按 DOM 的 fileName 去二次确认，同样对不上，误判成「已删除」

     给每个比较点单独加 trim 是补不完的。正确做法是：拿 DOM 属性只用来
     「定位是哪一条」（松匹配足够），真正要传给删除接口的文件名和头像
     一律用服务端返回的原始值。 */
  function normalizeChatKey(value) {
    return String(value ?? '').trim().replace(/\.jsonl$/i, '');
  }

  async function fetchRecentChatRecords(main, max = 500, pinned = []) {
    try {
      const response = await hostWindow.fetch(
        new hostWindow.URL('api/chats/recent', hostModuleRoot().root),
        {
          method: 'POST',
          headers: await hostRequestHeaders(main),
          /* 认领和二次确认的场合 max 给大一点，免得目标本来就排在
             默认可见条数之外，造成「查不到 = 已删除」的误判。 */
          body: JSON.stringify({ max, pinned }),
          cache: 'no-cache',
        },
      );
      if (!response.ok) return null;
      const data = await response.json();
      return Array.isArray(data) ? data : null;
    } catch (error) {
      console.warn('[Claude-Clawd] 读取近期对话列表失败：', error);
      return null;
    }
  }

  /* 用 DOM 上那几个（可能已经被改写过的）值去服务端列表里认领对应记录。
     认领用松匹配，返回的是服务端的原始字段。认不出来返回 null。 */
  async function resolveRecentChatRecord(main, { fileName, avatarId, groupId }) {
    const list = await fetchRecentChatRecords(main);
    if (!list) return null;

    const wantFile = normalizeChatKey(fileName);
    const wantAvatar = String(avatarId ?? '').trim();
    const wantGroup = String(groupId ?? '').trim();

    const hit = list.find(item => {
      if (normalizeChatKey(item?.file_name) !== wantFile) return false;
      if (wantGroup) return String(item?.group ?? '').trim() === wantGroup;
      return String(item?.avatar ?? '').trim() === wantAvatar;
    });
    return hit ?? null;
  }

  /* 回服务端确认这个对话文件还在不在。
     返回 true = 还在（删除确实失败），false = 没了（删成功了），
     null = 查不了，调用方自己决定怎么办 —— 不要把 null 当成 false 之外的任何意思。

     用的是 /api/chats/recent（POST {max, pinned} → RecentChat[]），
     和欢迎页 Recent Chats 同一个接口，1.18 上已核对过字段。 */
  async function recentChatStillExists(main, fileName) {
    try {
      const response = await hostWindow.fetch(
        new hostWindow.URL('api/chats/recent', hostModuleRoot().root),
        {
          method: 'POST',
          headers: await hostRequestHeaders(main),
          /* max 给大一点，免得刚删的那条本来就排在可见条数之外，
             造成「查不到 = 已删除」的误判。 */
          body: JSON.stringify({ max: 500, pinned: [] }),
          cache: 'no-cache',
        },
      );
      if (!response.ok) return null;
      const data = await response.json();
      if (!Array.isArray(data)) return null;
      const bare = normalizeChatKey(fileName);
      return data.some(item => normalizeChatKey(item?.file_name) === bare);
    } catch (error) {
      console.warn('[Claude-Clawd] 二次确认删除结果失败：', error);
      return null;
    }
  }

  /* 600ms，而不是原来的 5000ms。
     事件要来的话，在 delete 调用 resolve 之后立刻就来了；等不到就说明这条路径
     根本不发（酒馆原生的 deleteCharacterChatByName 就不发），那就尽快转去
     二次确认。这个等待期内行还留在侧栏上，等太久用户会以为没删掉。 */
  function waitForChatDeleted(fileName, eventKey, timeout = 600) {
    const context = getContext();
    const source = context?.eventSource;
    const types = context?.eventTypes || context?.event_types || {};
    const fallback = eventKey === 'GROUP_CHAT_DELETED' ? GROUP_CHAT_DELETED_EVENT : CHAT_DELETED_EVENT;
    const type = types[eventKey] || fallback;
    if (!source?.on) return null;

    let timer = 0;
    let handler = null;
    const promise = new Promise(resolve => {
      const finish = value => {
        if (!handler) return;
        source.removeListener?.(type, handler);
        source.off?.(type, handler);
        handler = null;
        if (timer) hostWindow.clearTimeout(timer);
        resolve(value);
      };
      handler = name => {
        const deleted = String(name ?? '').replace(/\.jsonl$/i, '');
        if (deleted === fileName) finish(true);
      };
      source.on(type, handler);
      timer = hostWindow.setTimeout(() => finish(false), timeout);
    });
    return promise;
  }

  async function deleteRecentWithoutOpening(row) {
    const domFileName = (row.getAttribute('data-file') || '').replace(/\.jsonl$/i, '');
    const domAvatarId = row.getAttribute('data-avatar') || '';
    const groupId = row.getAttribute('data-group') || '';
    if (!domFileName || (!domAvatarId && !groupId)) {
      throw new Error('近期对话缺少文件名或角色/群组标识。');
    }

    const { main, groups, popup, errors } = await loadDeleteModules();
    if (!await confirmRecentDelete(popup)) return;

    /* DOM 上的值只用来认领是哪一条；真正发给删除接口的，用服务端的原始字段。
       两边不一致时打一条对照日志——这是排查这类字符串被改写问题的唯一线索。 */
    const record = await resolveRecentChatRecord(main, {
      fileName: domFileName,
      avatarId: domAvatarId,
      groupId,
    });
    let fileName = domFileName;
    let avatarId = domAvatarId;
    if (record) {
      const serverFile = String(record.file_name ?? '').replace(/\.jsonl$/i, '');
      const serverAvatar = String(record.avatar ?? '');
      if (serverFile && serverFile !== domFileName) {
        console.warn(
          `[Claude-Clawd] 对话文件名和服务端对不上：DOM ${JSON.stringify(domFileName)}，`
          + `服务端 ${JSON.stringify(serverFile)}。以服务端为准。`,
        );
        fileName = serverFile;
      }
      if (serverAvatar && serverAvatar !== domAvatarId) {
        console.warn(
          `[Claude-Clawd] 头像文件名和服务端对不上：DOM ${JSON.stringify(domAvatarId)}，`
          + `服务端 ${JSON.stringify(serverAvatar)}。以服务端为准。`,
        );
        avatarId = serverAvatar;
      }
    } else {
      console.warn(
        `[Claude-Clawd] 在 /api/chats/recent 里没认领到 ${JSON.stringify(domFileName)}，`
        + '只能拿 DOM 上的值去删，可能删不掉。',
      );
    }

    const eventKey = groupId ? 'GROUP_CHAT_DELETED' : 'CHAT_DELETED';
    const deleted = waitForChatDeleted(fileName, eventKey);
    if (groupId) {
      if (typeof groups.deleteGroupChatByName === 'function') {
        await groups.deleteGroupChatByName(groupId, fileName);
      } else {
        await deleteGroupChatDirect(main, groups, groupId, fileName);
      }
    } else {
      const { index: characterId } = resolveCharacterIndex(main, avatarId);
      if (characterId >= 0 && typeof main.deleteCharacterChatByName === 'function') {
        await main.deleteCharacterChatByName(String(characterId), fileName);
      } else {
        /* 角色不在内存数组里也要能删 —— 这条按 avatarId 直接发请求的兜底，
           正是原生路径缺的那份宽容度。 */
        await deleteCharacterChatDirect(main, avatarId, fileName);
      }
    }

    /* 「完成事件」只能当加分项，不能当判据。
       我们自己那两条 direct 路径会主动 emit，所以事件必到；
       但酒馆自己的 deleteCharacterChatByName 并不保证发 CHAT_DELETED
       （1.18 的 welcome-screen.js 调完它就直接 refreshWelcomeScreen()，
       压根不等事件）。之前把这里当判据，结果文件其实删掉了，
       却弹「删除接口没有发出完成事件」的红色报错。

       所以事件没来时改为回服务端二次确认，以文件还在不在为准。 */
    if (deleted && !await deleted) {
      const stillThere = await recentChatStillExists(main, fileName);
      if (stillThere === true) {
        const moduleError = errors?.[0]?.message ? ` 模块错误：${errors[0].message}` : '';
        throw new Error(`删除没有生效，对话文件仍然存在。${moduleError}`);
      }
      if (stillThere === null) {
        console.warn('[Claude-Clawd] 删除完成事件没来，且二次确认接口也查不了，按成功处理。');
      } else {
        console.info('[Claude-Clawd] 删除完成事件没来，但二次确认文件已消失，按成功处理。');
      }
      /* 事件没发出来的话，侧栏和其他订阅者收不到通知，这里替酒馆补一发。 */
      await emitChatDeleted(eventKey, fileName).catch(() => {});
    }
    dropRecentRow(fileName);
    recentSignature = null;   // 列表变了，下一次刷新必须真的重画
    recentDataVersion += 1;   // 在飞的那次拉取作废，别把删掉的行画回来
    hostWindow.toastr?.success?.(ccPrefersChinese() ? '对话已删除。' : 'Chat deleted.');
  }

  function dropRecentRow(fileName) {
    if (!fileName) return;
    /* 走 normalizeChatKey 而不是只去后缀：调用方给进来的可能是服务端的原始
       文件名（含首尾空白），而 DOM 属性里的那份空白已经没了，
       严格比较会一条都对不上，行就删不掉。 */
    const bare = normalizeChatKey(fileName);
    const slot = hostDocument.querySelector('.' + RAIL_RECENTS_CLASS);
    if (!slot) return;
    for (const row of slot.querySelectorAll('[data-file]')) {
      if (normalizeChatKey(row.dataset.file) === bare) row.remove();
    }
  }

  /* 底部用户行：仿官网的账号区。
     头像和名字取当前玩家角色 —— 用户可能有好几个角色，
     显示当前选中的那个才有意义。点整行或右边的按钮都能打开角色列表。 */
  const RAIL_USER_CLASS = 'clawd-rail-user';

  function currentPersona() {
    const context = getContext();
    const name = context?.name1 || '';
    // 头像先找角色管理里选中的那张，退而求其次用聊天里自己的头像
    const img =
      hostDocument.querySelector('#user_avatar_block .avatar.selected img, #user_avatar_block [class*="selected"] img')
      || hostDocument.querySelector('#chat .mes[is_user="true"] .avatar img');
    return { name, src: img?.src || '' };
  }

  function refreshRailUser() {
    if (!railEnabled) return;
    const holder = hostDocument.querySelector('#top-settings-holder');
    if (!holder) return;

    // 直接改造玩家角色抽屉自己的 toggle —— 它本来就是个按钮，
    // 点它走酒馆原生逻辑。之前另造一个 div 再转发点击，
    // 结果是把本来开着的抽屉给关上了。
    const row = holder.querySelector('#persona-management-button > .drawer-toggle');
    if (!row) return;
    // 多余的注入清掉，只留一份
    for (const extra of [...row.querySelectorAll('.clawd-user-face')].slice(1)) {
      extra.parentElement === row ? extra.remove() : null;
    }
    if (!row.querySelector('.clawd-user-face')) {
      row.insertAdjacentHTML('beforeend',
        '<span class="clawd-user-face"></span>' +
        '<span class="clawd-user-meta"><span class="clawd-user-name"></span>' +
        '<span class="clawd-user-plan">Max plan</span></span>' +
        '<span class="clawd-user-more">\u25be</span>');
    }

    const persona = currentPersona();
    const name = row.querySelector('.clawd-user-name');
    if (name && name.textContent !== persona.name) name.textContent = persona.name || 'User';

    const face = row.querySelector('.clawd-user-face');
    if (!face) return;
    if (persona.src) {
      let img = face.querySelector('img');
      if (!img) { img = hostDocument.createElement('img'); face.textContent = ''; face.append(img); }
      if (img.src !== persona.src) img.src = persona.src;
    } else {
      face.querySelector('img')?.remove();
      const initial = (persona.name || 'U').trim().slice(0, 2);
      if (face.textContent !== initial) face.textContent = initial;
    }
  }

  function currentCharacter() {
    const context = getContext();
    const characters = Array.isArray(context?.characters) ? context.characters : [];
    const index = Number(context?.characterId ?? context?.character_id);
    return Number.isInteger(index) && index >= 0 ? { character: characters[index], index } : null;
  }

  function rememberCharacterName(name) {
    const value = String(name || '').trim();
    if (!value) return;
    try { hostWindow.localStorage.setItem(LAST_CHARACTER_KEY, value); } catch (error) { /* 隐私模式 */ }
  }

  function rememberedCharacterName(characters) {
    /* 第一次安装还没有本地记忆时，从 Recents 第一条的 avatar 反查角色名；
       以后每次真实选择都会覆盖 localStorage。 */
    try {
      const saved = hostWindow.localStorage.getItem(LAST_CHARACTER_KEY) || '';
      if (saved) return saved;
    } catch (error) { /* 隐私模式 */ }
    const recent = hostDocument.querySelector('.' + RAIL_RECENTS_CLASS + ' .recentChat[data-avatar]');
    const avatar = recent?.getAttribute('data-avatar') || '';
    const fromRecent = avatar && characters.find(character => character?.avatar === avatar)?.name;
    if (fromRecent) {
      rememberCharacterName(fromRecent);
      return String(fromRecent);
    }
    return '';
  }

  function closeCharacterMenu() {
    characterMenu?.remove();
    characterMenu = null;
    hostDocument.querySelectorAll('.' + CHARACTER_SWITCHER_CLASS)
      .forEach(button => button.setAttribute('aria-expanded', 'false'));
  }

  function positionCharacterMenu(menu, button) {
    if (!menu?.isConnected || !button?.isConnected) return;
    const list = menu.querySelector('.clawd-character-list');
    if (!list) return;
    const rect = button.getBoundingClientRect();
    const compactMobile = isMobileLayout();
    const viewport = hostWindow.visualViewport;
    const viewportTop = Math.max(0, viewport?.offsetTop || 0);
    const viewportHeight = Math.max(1, viewport?.height || hostWindow.innerHeight || 1);
    const viewportBottom = viewportTop + viewportHeight;
    const menuWidth = Math.min(320, Math.max(248, hostWindow.innerWidth - 24));
    menu.style.width = `${menuWidth}px`;
    menu.style.left = `${Math.min(Math.max(12, rect.right - menuWidth), hostWindow.innerWidth - menuWidth - 12)}px`;

    let top = Math.max(viewportTop + 12, rect.bottom + 8);
    let lowerBoundary = viewportBottom - 12;
    if (compactMobile) {
      top = viewportTop + 64;
      const composerRect = hostDocument.querySelector('#form_sheld')?.getBoundingClientRect?.();
      if (composerRect?.top > top) lowerBoundary = Math.min(lowerBoundary, composerRect.top - 10);
      menu.style.setProperty('right', '12px', 'important');
      menu.style.setProperty('left', '12px', 'important');
      menu.style.setProperty('width', 'auto', 'important');
    }
    const available = Math.max(96, lowerBoundary - top);
    const maxHeight = Math.min(420, available);
    menu.style.setProperty('top', `${top}px`, 'important');
    menu.style.setProperty('bottom', 'auto', 'important');
    menu.style.setProperty('max-height', `${maxHeight}px`, 'important');
    list.style.maxHeight = `${Math.max(48, Math.min(352, maxHeight - 60))}px`;
  }

  function characterAvatarUrl(character) {
    const avatar = character?.avatar;
    if (!avatar) return '';
    try {
      const fromContext = getContext()?.getThumbnailUrl?.('avatar', avatar);
      if (fromContext) return String(fromContext);
    } catch (error) { /* 旧版没有这个桥接，退回原图路径 */ }
    return new hostWindow.URL(`characters/${encodeURIComponent(avatar)}`, hostDocument.baseURI).href;
  }

  async function selectCharacter(index) {
    const picked = getContext()?.characters?.[index];
    rememberCharacterName(picked?.name);
    closeCharacterMenu();
    clearDrawerGuard();
    const previousPending = pendingWelcomeCharacter;
    pendingWelcomeCharacter = { index, name: String(picked?.name || '') };
    welcomeStage = 'welcome';
    hostDocument.body.classList.add(WELCOME_CLASS);
    try {
      const context = getContext();
      if (typeof context?.selectCharacterById === 'function') {
        await context.selectCharacterById(String(index), { switchMenu: false });
      } else {
        const { main } = await loadDeleteModules();
        if (typeof main?.selectCharacterById !== 'function') {
          throw new Error('当前酒馆版本没有提供角色切换接口。');
        }
        await main.selectCharacterById(String(index), { switchMenu: false });
      }
      /* selectCharacterById 会载入该角色最近的聊天并触发 CHAT_CHANGED。
         这些内容先藏在欢迎页后面；按发送时 enterLeaving() 才解除 pending。 */
      welcomeStage = 'welcome';
      hostDocument.body.classList.add(WELCOME_CLASS);
      scheduleRefresh();
    } catch (error) {
      pendingWelcomeCharacter = previousPending;
      welcomeStage = 'welcome';
      scheduleRefresh();
      console.error('[Claude Clawd] 角色切换失败:', error);
      hostWindow.toastr?.error?.(
        ccPrefersChinese()
          ? `角色切换失败：${String(error?.message || error).slice(0, 160)}`
          : `Character switch failed: ${String(error?.message || error).slice(0, 160)}`,
      );
    }
  }

  function openCharacterMenu(button) {
    if (characterMenu?.isConnected) {
      closeCharacterMenu();
      return;
    }
    const characters = Array.isArray(getContext()?.characters) ? getContext().characters : [];
    if (!characters.length) {
      hostWindow.toastr?.info?.(ccPrefersChinese() ? '还没有可切换的角色卡。' : 'No character cards available.');
      return;
    }

    const menu = hostDocument.createElement('div');
    menu.className = CHARACTER_MENU_CLASS;
    menu.setAttribute('role', 'dialog');
    menu.setAttribute('aria-label', ccPrefersChinese() ? '快速切换角色卡' : 'Quick character switcher');

    const search = hostDocument.createElement('input');
    search.type = 'search';
    search.className = 'clawd-character-search';
    search.placeholder = ccPrefersChinese() ? '搜索角色卡' : 'Search characters';
    menu.append(search);

    const list = hostDocument.createElement('div');
    list.className = 'clawd-character-list';
    menu.append(list);
    const active = currentCharacter()?.index;

    const render = () => {
      const query = search.value.trim().toLocaleLowerCase();
      list.replaceChildren();
      characters.forEach((character, index) => {
        const name = String(character?.name || (ccPrefersChinese() ? `角色 ${index + 1}` : `Character ${index + 1}`));
        if (query && !name.toLocaleLowerCase().includes(query)) return;
        const item = hostDocument.createElement('button');
        item.type = 'button';
        item.className = 'clawd-character-option';
        item.classList.toggle('is-active', index === active);
        item.dataset.characterId = String(index);
        const avatar = hostDocument.createElement('span');
        avatar.className = 'clawd-character-avatar';
        const src = characterAvatarUrl(character);
        if (src) {
          const image = hostDocument.createElement('img');
          image.src = src;
          image.alt = '';
          avatar.append(image);
        } else {
          avatar.textContent = name.slice(0, 1);
        }
        const label = hostDocument.createElement('span');
        label.className = 'clawd-character-name';
        label.textContent = name;
        item.append(avatar, label);
        if (index === active) {
          const check = hostDocument.createElement('span');
          check.className = 'clawd-character-check';
          check.textContent = '\u2713';
          item.append(check);
        }
        item.addEventListener('click', () => void selectCharacter(index));
        list.append(item);
      });
      if (!list.children.length) {
        const empty = hostDocument.createElement('div');
        empty.className = 'clawd-character-empty';
        empty.textContent = ccPrefersChinese() ? '没有匹配的角色卡' : 'No matching characters';
        list.append(empty);
      }
    };
    search.addEventListener('input', render);
    render();

    hostDocument.body.append(menu);
    characterMenu = menu;
    button.setAttribute('aria-expanded', 'true');
    /* 官网菜单从模型/角色名下方向下展开。空间不足时缩短列表并在菜单内滚动，
       不再翻到标题上方遮住问候语。important 用来盖过手机断点的定位兜底。 */
    /* 手机欢迎页的输入框固定在底部，菜单若照桌面从按钮正下方展开，必然掉出视口。
       手机版改成顶栏下方的独立 sheet；桌面仍保持官网式向下展开。 */
    positionCharacterMenu(menu, button);
    hostWindow.requestAnimationFrame(() => search.focus({ preventScroll: true }));
  }

  function refreshCharacterSwitcher() {
    if (!welcomeEnabled) return;
    const form = hostDocument.querySelector('#send_form') || hostDocument.querySelector('#form_sheld form');
    if (!form) return;
    /* SillyTavern 的真实操作行是 #nonQRFormItems；#rightSendForm 并不是
       #send_form 的直接子元素。旧版没找到它便把按钮 append 到表单末尾，
       于是角色名被 flex 换到发送按钮下面，白白撑高整个输入框。 */
    const row = form.querySelector('#nonQRFormItems') || form;
    const stale = [...hostDocument.querySelectorAll('.' + CHARACTER_SWITCHER_CLASS)]
      .filter(button => button.parentElement !== row);
    stale.forEach(button => button.remove());
    const staleMics = [...hostDocument.querySelectorAll('.' + FAKE_MIC_CLASS)]
      .filter(mic => mic.parentElement !== row);
    staleMics.forEach(mic => mic.remove());

    let button = row.querySelector(':scope > .' + CHARACTER_SWITCHER_CLASS);
    const showSwitcher = hostDocument.body.classList.contains(WELCOME_CLASS);
    if (!showSwitcher) {
      closeCharacterMenu();
      button?.remove();
      button = null;
    }
    /* 主题热更新时旧实例不会自动带上新增的 High/宽箭头结构；重建一次也顺便
       摘掉旧实例留在按钮上的事件监听，避免导入新版后仍执行上一版菜单定位。 */
    if (showSwitcher && button && !button.querySelector('.clawd-character-effort')) {
      button.remove();
      button = null;
    }
    if (showSwitcher && !button) {
      button = hostDocument.createElement('button');
      button.type = 'button';
      button.className = CHARACTER_SWITCHER_CLASS;
      button.setAttribute('aria-haspopup', 'dialog');
      button.setAttribute('aria-expanded', 'false');
      button.innerHTML = '<span class="clawd-character-current"></span><span class="clawd-character-effort">High</span><span class="clawd-character-chevron" aria-hidden="true"></span>';
      let openedByPointer = false;
      let pointerResetTimer = 0;
      button.addEventListener('pointerdown', event => {
        if (event.button !== 0 || event.isPrimary === false) return;
        event.preventDefault();
        event.stopPropagation();
        openedByPointer = true;
        if (pointerResetTimer) hostWindow.clearTimeout(pointerResetTimer);
        pointerResetTimer = hostWindow.setTimeout(() => { openedByPointer = false; }, 800);
        openCharacterMenu(button);
      });
      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        /* 鼠标/触屏已经在 pointerdown 打开，不让随后合成的 click 再关一次。
           键盘 Enter/Space 没有 pointerdown，仍由这里打开。 */
        if (openedByPointer) {
          openedByPointer = false;
          if (pointerResetTimer) hostWindow.clearTimeout(pointerResetTimer);
          pointerResetTimer = 0;
          return;
        }
        openCharacterMenu(button);
      });
      const right = row.querySelector(':scope > #rightSendForm');
      if (right) row.insertBefore(button, right);
      else row.append(button);
    }
    let mic = row.querySelector(':scope > .' + FAKE_MIC_CLASS);
    /* 手机端按实机反馈精简为两项左侧入口 + 圆形发送键，不再注入装饰麦克风。
       桌面完整版仍保留官网式麦克风。 */
    if (mobileEnabled) {
      mic?.remove();
      mic = null;
    } else if (!mic) {
      mic = hostDocument.createElement('button');
      mic.type = 'button';
      mic.className = FAKE_MIC_CLASS;
      mic.setAttribute('aria-label', ccPrefersChinese() ? '麦克风（装饰）' : 'Microphone (visual only)');
      mic.title = ccPrefersChinese() ? '麦克风（界面装饰）' : 'Microphone (visual only)';
      const right = row.querySelector(':scope > #rightSendForm');
      if (right) row.insertBefore(mic, right);
      else row.append(mic);
    }
    if (!button) return;
    const characters = Array.isArray(getContext()?.characters) ? getContext().characters : [];
    const active = currentCharacter()?.character;
    if (active?.name) rememberCharacterName(active.name);
    const name = String(active?.name || rememberedCharacterName(characters)
      || (ccPrefersChinese() ? '角色卡' : 'Character'));
    const label = button.querySelector('.clawd-character-current');
    if (label && label.textContent !== name) label.textContent = name;
    button.title = ccPrefersChinese() ? `快速切换角色卡：${name}` : `Quick switch character: ${name}`;
    if (characterMenu?.isConnected) positionCharacterMenu(characterMenu, button);
  }

  function dismissCharacterMenu(event) {
    if (!characterMenu) return;
    if (event.type === 'keydown') {
      if (event.key === 'Escape') closeCharacterMenu();
      return;
    }
    if (event.target?.closest?.(`.${CHARACTER_MENU_CLASS}, .${CHARACTER_SWITCHER_CLASS}`)) return;
    closeCharacterMenu();
  }

  function closeMobileMenu() {
    hostDocument.body.classList.remove(MOBILE_MENU_OPEN_CLASS);
    mobileChrome?.menu?.setAttribute('aria-expanded', 'false');
  }

  async function startMobileNewChat() {
    closeMobileMenu();
    const native = hostDocument.querySelector(
      '#option_start_new_chat, #new_chat, #newChat, [data-i18n="New Chat"], [data-i18n="Start new chat"]',
    );
    if (native instanceof hostWindow.HTMLElement) {
      native.click();
      return;
    }
    const context = getContext();
    try {
      if (typeof context?.executeSlashCommands === 'function') {
        await context.executeSlashCommands('/newchat');
        return;
      }
      const active = currentCharacter()?.index;
      if (active !== undefined) await selectCharacter(active);
    } catch (error) {
      console.error('[Claude Clawd] 新建对话失败:', error);
      hostWindow.toastr?.error?.(ccPrefersChinese() ? '无法新建对话。' : 'Could not start a new chat.');
    }
  }

  function refreshMobileNewChat() {
    if (!mobileEnabled || !welcomeEnabled || !hostWindow.matchMedia?.('(max-width:700px)').matches) return;
    const holder = hostDocument.querySelector('#top-settings-holder');
    if (!holder || holder.querySelector(':scope > .clawd-mobile-new-chat')) return;
    const button = hostDocument.createElement('button');
    button.type = 'button';
    button.className = 'clawd-mobile-new-chat';
    button.textContent = ccPrefersChinese() ? '+ 新对话' : '+ New chat';
    button.addEventListener('click', () => void startMobileNewChat());
    holder.append(button);
  }

  function refreshMobileChrome() {
    if (!mobileEnabled || !welcomeEnabled) return;
    const narrow = hostWindow.matchMedia?.('(max-width:700px)').matches;
    if (!narrow) {
      closeMobileMenu();
      mobileChrome?.root?.remove();
      mobileChrome = null;
      return;
    }
    if (mobileChrome?.root?.isConnected) return;

    const root = hostDocument.createElement('div');
    root.className = 'clawd-mobile-chrome';
    const menu = hostDocument.createElement('button');
    menu.type = 'button';
    menu.className = 'clawd-mobile-menu-button';
    menu.setAttribute('aria-label', ccPrefersChinese() ? '打开导航' : 'Open navigation');
    menu.setAttribute('aria-expanded', 'false');
    menu.innerHTML = '<span></span><span></span><span></span>';
    menu.addEventListener('click', () => {
      const open = !hostDocument.body.classList.contains(MOBILE_MENU_OPEN_CLASS);
      hostDocument.body.classList.toggle(MOBILE_MENU_OPEN_CLASS, open);
      menu.setAttribute('aria-expanded', String(open));
    });

    const clawd = hostDocument.createElement('button');
    clawd.type = 'button';
    clawd.className = 'clawd-mobile-clawd-button';
    clawd.setAttribute('aria-label', 'Clawd');
    clawd.addEventListener('click', event => {
      animateButton(clawd, 'clawd-hop');
      createParticle(clawd, event);
      handleCcCombo(clawd);
    });

    const scrim = hostDocument.createElement('button');
    scrim.type = 'button';
    scrim.className = 'clawd-mobile-scrim';
    scrim.setAttribute('aria-label', ccPrefersChinese() ? '关闭导航' : 'Close navigation');
    scrim.addEventListener('click', closeMobileMenu);

    root.append(menu, clawd, scrim);
    hostDocument.body.append(root);
    mobileChrome = { root, menu, clawd, scrim };

    /* 手机抽屉里的入口打开全屏设置页后，普通 SillyTavern 的导航应立即滑走。
       TauriTavern 会把多数设置页停放在 #top-settings-holder 内：如果捕获阶段
       先移走整个 holder，面板会刚打开就一起消失，表现为“点了闪回”。 */
    const holder = hostDocument.querySelector('#top-settings-holder');
    if (holder) {
      mobileNavHolder = holder;
      mobileNavCloseHandler = event => {
        const target = event.target instanceof hostWindow.Element ? event.target : null;
        if (!target || target.closest('.deleteChat, .deleteChatButton')) return;
        const drawerToggle = target.closest('.drawer-toggle');
        if (drawerToggle && isTauriTavernHost()) return;
        if (!drawerToggle && !target.closest('.recentChat, .clawd-mobile-new-chat, .character_select')) return;
        closeMobileMenu();
      };
      holder.addEventListener('click', mobileNavCloseHandler, true);
    }
  }

  /* 手机输入区会被 Quick Reply、状态栏和扩展按钮动态撑高。
     不再按固定的 108/132px 猜高度：直接读取整个 #form_sheld 的真实占位，
     让聊天底部留白和生成中的 Clawd 始终锚在输入区上方。 */
  function applyMobileComposerInset() {
    composerInsetRaf = 0;
    const root = hostDocument.documentElement;
    if (!isMobileLayout()) {
      lastComposerHeight = 0;
      root.style.removeProperty(MOBILE_COMPOSER_HEIGHT_PROPERTY);
      return;
    }
    const shell = observedComposerShell?.isConnected
      ? observedComposerShell
      : hostDocument.querySelector('#form_sheld');
    const height = Math.ceil(shell?.getBoundingClientRect?.().height || 0);
    if (!height || height === lastComposerHeight) return;
    const chat = scrollHost?.isConnected ? scrollHost : hostDocument.querySelector('#chat');
    const bottomDistance = chat
      ? Math.max(0, chat.scrollHeight - chat.clientHeight - chat.scrollTop)
      : Number.POSITIVE_INFINITY;
    // 刚手动上翻的这一小段时间内，即使离底部还在阈值内，也别把它吸回去——
    // 不然翻页跟被按住弹簧一样一顿一顿。
    const recentlyScrolledManually = Date.now() - lastManualScrollAt < 500;
    const keepAtBottom = bottomDistance <= 72 && !recentlyScrolledManually;
    lastComposerHeight = height;
    const value = `${height}px`;
    if (root.style.getPropertyValue(MOBILE_COMPOSER_HEIGHT_PROPERTY) !== value) {
      root.style.setProperty(MOBILE_COMPOSER_HEIGHT_PROPERTY, value);
    }
    if (keepAtBottom && chat) {
      if (composerBottomRaf) hostWindow.cancelAnimationFrame(composerBottomRaf);
      composerBottomRaf = hostWindow.requestAnimationFrame(() => {
        composerBottomRaf = 0;
        if (destroyed || !chat.isConnected) return;
        // 接下来这一下是程序自己滚的，短暂遮住，别被当成"用户又手动滚了一次"
        suppressManualScrollUntil = Date.now() + 250;
        chat.scrollTop = chat.scrollHeight;
      });
    }
  }

  function scheduleMobileComposerInset() {
    if (composerInsetRaf || destroyed) return;
    composerInsetRaf = hostWindow.requestAnimationFrame(applyMobileComposerInset);
  }

  function refreshMobileComposerInset() {
    if (!isMobileLayout()) {
      composerResizeObserver?.disconnect();
      observedComposerShell?.style.removeProperty(MOBILE_COMPOSER_TRANSLATE_PROPERTY);
      observedComposerShell = null;
      lastComposerHeight = 0;
      hostDocument.documentElement.style.removeProperty(MOBILE_COMPOSER_HEIGHT_PROPERTY);
      return;
    }
    const shell = hostDocument.querySelector('#form_sheld');
    if (!shell) return;
    if (shell !== observedComposerShell) {
      composerResizeObserver?.disconnect();
      observedComposerShell?.style.removeProperty(MOBILE_COMPOSER_TRANSLATE_PROPERTY);
      observedComposerShell = shell;
      lastComposerHeight = 0;
      if (hostWindow.ResizeObserver) {
        composerResizeObserver = new hostWindow.ResizeObserver(scheduleMobileComposerInset);
        composerResizeObserver.observe(shell);
      }
      scheduleMobileComposerInset();
      scheduleMobileComposerTranslate();
    } else if (!composerResizeObserver) {
      scheduleMobileComposerInset();
      scheduleMobileComposerTranslate();
    }
  }

  /* 侧栏拖拽调宽。宽度写进 localStorage，下次进来还是这个宽度。 */
  const RAIL_MIN = 190;
  const RAIL_MAX = 420;
  const RAIL_KEY = 'clawd-rail-width';
  let gripEl = null;

  function applyRailWidth(px) {
    const clamped = Math.min(Math.max(px, RAIL_MIN), RAIL_MAX);
    hostDocument.documentElement.style.setProperty('--cl-rail', clamped + 'px');
    hostDocument.body.style.setProperty('--cl-rail', clamped + 'px');
    return clamped;
  }

  function refreshRailGrip() {
    if (!railEnabled || gripEl?.isConnected) return;
    gripEl = hostDocument.createElement('div');
    gripEl.className = 'clawd-rail-grip';
    hostDocument.body.append(gripEl);

    let dragging = false;
    const move = event => {
      if (!dragging) return;
      applyRailWidth(event.clientX);
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      hostDocument.body.classList.remove('clawd-rail-resizing');
      const now = hostDocument.documentElement.style.getPropertyValue('--cl-rail');
      try { hostWindow.localStorage.setItem(RAIL_KEY, now); } catch (error) { /* 隐私模式下会抛，忽略 */ }
      hostDocument.removeEventListener('mousemove', move);
      hostDocument.removeEventListener('mouseup', up);
    };
    gripEl.addEventListener('mousedown', event => {
      event.preventDefault();
      dragging = true;
      hostDocument.body.classList.add('clawd-rail-resizing');
      hostDocument.addEventListener('mousemove', move);
      hostDocument.addEventListener('mouseup', up);
    });

    try {
      const saved = hostWindow.localStorage.getItem(RAIL_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10) || RAIL_MIN;
        /* 288px 是旧版默认值而非用户刻意调出的常见宽度；迁移到官网复标后的 280px。
           其他保存值继续尊重，用户手动拖过的宽度不会被强制重置。 */
        applyRailWidth(parsed === 288 ? 280 : parsed);
      }
    } catch (error) { /* 忽略 */ }
  }

  /* 欢迎页那三个快捷按钮，官网的版式是在输入框下面。
     酒馆把它们放在聊天区里，所以得搬。按钮文字认不出来就不动，
     宁可位置不对也别把用户的入口弄丢。 */
  function refreshWelcomeShortcuts() {
    if (!welcomeEnabled) return;
    const form = hostDocument.querySelector('#form_sheld');
    if (!form || !form.parentElement) return;

    const wraps = [...hostDocument.querySelectorAll('.clawd-welcome-shortcuts')];

    if (!hostDocument.body.classList.contains(WELCOME_CLASS)) {
      // 离开欢迎态就把搬过来的东西还回去，别留在页面上
      for (const w of wraps) w.remove();
      return;
    }

    // 已经搬好而且还在正确位置，就什么都不做
    if (wraps.length === 1
      && wraps[0].parentElement === form.parentElement
      && wraps[0].querySelector('button, .menu_button')) return;

    // 否则：先把以前造的全清掉，再重来一次。
    // 幂等靠「先清后建」，不靠猜之前建过没有 —— 酒馆随时会重建聊天区，
    // 一旦重建，之前那些「有没有建过」的判断全都会失准。
    for (const w of wraps) w.remove();

    const buttons = [...hostDocument.querySelectorAll('#chat button, #chat .menu_button, #chat a.menu_button')]
      .filter(b => /API|Character|Extension|角色|扩展|连接/i.test(b.textContent || ''));
    if (buttons.length < 2) return;

    const holder = buttons[0].parentElement;
    if (!holder || holder.children.length > 6) return;

    const wrap = hostDocument.createElement('div');
    wrap.className = 'clawd-welcome-shortcuts';
    form.parentElement.insertBefore(wrap, form.nextSibling);
    wrap.append(holder);
  }

  /* 这里曾经有个「把行内点击转发到图标」的函数，删了。
     诊断录到的事件序列证明它是帮倒忙：
       点文字 → 我伪造一次 icon.click()（isTrusted=false）→ 酒馆开
              → 原始事件继续冒泡 → 酒馆再处理一次 → 关
     一次点击被处理两遍，两次互相抵消。
     而酒馆【本来就能正确处理点文字】—— 根本不需要转发。
     当初的推断「点图标正常说明酒馆只认图标」是错的：
     点图标之所以正常，只是因为转发对图标点击直接跳过了，只处理一次。 */

  /* 侧栏：把图标原本的 title 变成行内文字标签。
     顺带移除 title —— 那个蓝框原生提示跟整套设计完全不搭，
     文字标签出来之后也不需要它了。 */
  function refreshRailLabels() {
    const holder = hostDocument.querySelector('#top-settings-holder');
    if (!holder) return;
    holder.querySelectorAll(':scope > .drawer > .drawer-toggle').forEach(toggle => {
      if (toggle.querySelector(':scope > .clawd-rail-label')) return;
      const icon = toggle.querySelector('.drawer-icon') ?? toggle;
      const raw = (icon.getAttribute('title') || toggle.getAttribute('title') || '').trim();
      if (!raw) return;
      // 酒馆给的标题是整句，200px 的侧栏装不下，只能省略号。
      // 按图标类名换成短名 —— 类名比标题文字稳，中英文界面都吃。
      // 映射不到就保留原文，最多截断，不会出空白。
      const short = {
        'fa-sliders': '预设', 'fa-sliders-h': '预设',
        'fa-plug': 'API',
        'fa-font': '格式化',
        'fa-globe': '世界书', 'fa-book-atlas': '世界书',
        'fa-user-cog': '偏好设置', 'fa-user-gear': '偏好设置',
        'fa-panorama': '背景', 'fa-image': '背景', 'fa-images': '背景',
        'fa-cubes': '扩展',
        'fa-face-smile': '玩家角色', 'fa-user-tie': '玩家角色',
        'fa-address-card': '角色卡', 'fa-users': '角色卡',
      };
      const hit = [...icon.classList].find(c => short[c]);
      const text = hit ? short[hit] : raw;
      for (const node of [icon, toggle]) {
        const own = node.getAttribute('title');
        if (own) {
          node.setAttribute('data-tip', own);
          node.removeAttribute('title');
        }
      }
      const label = hostDocument.createElement('span');
      label.className = 'clawd-rail-label';
      label.textContent = text;
      toggle.append(label);
    });
  }

  /* 2. 眼睛跟鼠标：只分左中右三档，像素画不需要连续插值 */
  let lookRaf = 0;
  let lookX = 0;
  let lookY = 0;
  function applyLook() {
    lookRaf = 0;
    hostDocument.querySelectorAll('button.' + BUTTON_CLASS).forEach(button => {
      // 睡着的时候不跟随 —— 否则鼠标一动就会闪一帧站立姿势，
      // 因为跟随用的四个方向精灵都是从「站立」派生的
      if (button.classList.contains('clawd-sleeping')) return;
      const box = button.getBoundingClientRect();
      if (!box.width) return;
      const dx = lookX - (box.left + box.width / 2);
      const dy = lookY - (box.top + box.height / 2);
      // 取主导轴，不做斜向 —— 像素画只有四个方向，斜着看没有对应的帧
      const horizontal = Math.abs(dx) >= Math.abs(dy);
      // 迟滞：进入某个方向要 70px，退出只要低于 45px。
      // 阈值只有一个的话，鼠标在边界上晃一下眼睛就来回抽。
      const had = button.dataset.look || '';
      const enter = 70;
      const leave = 45;
      const reach = Math.max(Math.abs(dx), Math.abs(dy));
      let next = '';
      if (reach > (had ? leave : enter)) {
        next = horizontal ? (dx < 0 ? 'l' : 'r') : (dy < 0 ? 'u' : 'd');
      }
      if (next === had) return;

      button.dataset.look = next;
      // 像素画没有半格，眼珠只能整格跳，加不出中间帧。
      // 改用动画里的老办法：跳之前先眨一下，用眨眼盖住这一跳 ——
      // 人眼扫视时本来就会眨，所以这个遮掩读起来是自然的。
      button.classList.add('clawd-saccade');
      hostWindow.setTimeout(() => {
        button.classList.remove('clawd-saccade');
        for (const dir of ['l', 'r', 'u', 'd']) {
          button.classList.toggle('clawd-look-' + dir, next === dir);
        }
      }, 70);
    });
  }
  function handleLook(event) {
    lookX = event.clientX;
    lookY = event.clientY;
    if (lookRaf) return;
    lookRaf = hostWindow.requestAnimationFrame(applyLook);
  }

  /* 3. 输入框聚焦时抬头 */
  function setPerk(on) {
    hostDocument.querySelectorAll('button.' + BUTTON_CLASS)
      .forEach(button => button.classList.toggle('clawd-perk', on));
  }
  let lastFocusReactionAt = 0;
  const handleFocusIn = event => {
    if (event.target?.id !== 'send_textarea') return;
    if (isMobileLayout()) {
      /* focusin 通常早于系统键盘真正缩放视口；在这里锁定关闭键盘后应回到的底边。 */
      mobileStableLayoutHeight = Math.max(
        mobileStableLayoutHeight,
        Math.round(hostWindow.innerHeight || hostDocument.documentElement.clientHeight || 1),
      );
      mobileKeyboardRecoveryActive = false;
    }
    scheduleMobileViewportSettle();
    /* 手机上聚焦输入框时不要触碰历史消息里的 Clawd 按钮。旧逻辑会给每一层
       按钮改 class，并逐个读取 offsetWidth 强制同步排版；重角色卡/长聊天因此
       正好在键盘弹出的关键帧冻结数秒。键盘避让不依赖这段装饰动画。 */
    if (isMobileLayout()) return;
    setPerk(true);
    if (Date.now() - lastFocusReactionAt < 1800) return;
    lastFocusReactionAt = Date.now();
    hostDocument.querySelectorAll('button.' + BUTTON_CLASS).forEach(button => {
      if (button.classList.contains('clawd-sleeping')) return;
      button.classList.remove(...BUTTON_REACTIONS);
      void button.offsetWidth;
      button.classList.add('clawd-react-nod');
      pulseCcPose(button, 'clawd-poke-blink', 320);
      hostWindow.setTimeout(() => button.classList.remove('clawd-react-nod'), 540);
    });
  };
  const handleFocusOut = event => {
    if (event.target?.id !== 'send_textarea') return;
    /* 不等下一帧：WebView 随后若开始重排长聊天，rAF/定时器都会被主线程堵住。
       在 focusout 的同一任务内先把旧键盘偏移清零，避免输入框沿用抬高位置。 */
    scheduleMobileViewportSettle();
    if (isMobileLayout()) {
      /* schedule 先打开恢复窗口，reset 再同步计算正向高度补偿；顺序不能反。
         用户停留在输入框超过 840ms 时，反过来会把矮视口误记成新的稳定高度。 */
      mobileKeyboardRecoveryActive = !virtualKeyboardOverlayActive && !keyboardBaselineMode;
      resetMobileComposerTranslate();
      return;
    }
    setPerk(false);
  };


  /* 9. 代码块顶栏 */
  function refreshCodeBars() {
    hostDocument.querySelectorAll('#chat .mes_text pre').forEach(pre => {
      if (pre.querySelector(':scope > .clawd-code-bar')) return;
      const code = pre.querySelector('code');
      const match = code?.className.match(/language-([\w+-]+)/);
      const bar = hostDocument.createElement('div');
      bar.className = 'clawd-code-bar';
      const label = hostDocument.createElement('span');
      label.textContent = match ? match[1] : 'text';
      const copy = hostDocument.createElement('button');
      copy.type = 'button';
      copy.className = 'clawd-code-copy';
      copy.textContent = 'copy';
      copy.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        const text = code?.textContent ?? pre.textContent ?? '';
        hostWindow.navigator.clipboard?.writeText(text).then(() => {
          copy.textContent = 'copied';
          hostWindow.setTimeout(() => { copy.textContent = 'copy'; }, 1400);
        }, () => {
          copy.textContent = 'failed';
          hostWindow.setTimeout(() => { copy.textContent = 'copy'; }, 1400);
        });
      });
      bar.append(label, copy);
      pre.prepend(bar);
    });
  }


  function clearTypingMotion(indicator) {
    const timer = typingMotionTimers.get(indicator);
    if (timer) hostWindow.clearTimeout(timer);
    typingMotionTimers.delete(indicator);
    indicator.classList.remove(...TYPING_MOTION_CLASSES, 'clawd-typing-press');
  }

  function playTypingMotion(indicator, className, duration, interrupt = false) {
    if (!indicator || (!interrupt && typingMotionTimers.has(indicator))) return false;
    clearTypingMotion(indicator);
    indicator.classList.add(className);
    const timer = hostWindow.setTimeout(() => {
      indicator.classList.remove(className);
      if (typingMotionTimers.get(indicator) === timer) typingMotionTimers.delete(indicator);
    }, duration);
    typingMotionTimers.set(indicator, timer);
    return true;
  }

  function px(value, fallback = 0) {
    const number = Number.parseFloat(value);
    return Number.isFinite(number) ? number : fallback;
  }

  /* Clawd 本体是 ::before 里 3px 的锚点，像素画由 box-shadow 向外扩展。
     退场瞬间再读坐标不可靠（酒馆可能已经把节点挪走），所以稳定时缓存：
     boxShadow 用 resolved computed value，退出时的当前姿势和配色一起带走，
     不必复制整套 --clawd-f-*。 */
  function captureTypingSnapshot(indicator) {
    if (!(indicator instanceof hostWindow.HTMLElement) || !indicator.isConnected) return null;
    const rect = indicator.getBoundingClientRect();
    /* 节点这一刻可能已经被酒馆先一步隐藏/移走（宽高塌成 0），这时候的坐标
       是垃圾数据：用它生成的 ghost 会落在错误位置（常见是被立即
       裁没），视觉上就是「退场直接消失，没有下沉」。这种情况
       下宁可不刷新缓存，让调用方去用上一次仍然有效的稳定快照。 */
    if (rect.width <= 0 || rect.height <= 0) return null;
    const pseudo = hostWindow.getComputedStyle(indicator, '::before');
    const anchorHeight = px(pseudo.height, 3);
    /* 退场裁剪窗口：从 typing 区域顶边一直到输入框顶边。ghost 在窗口里下沉，
       一碰到输入框顶边就被裁掉 —— 视觉上是被对话框挡住，而不是飘进对话/
       输入框上面。窗口底取不到输入框时退回 indicator 自己的底边。 */
    const composerTop = hostDocument.querySelector('#form_sheld')?.getBoundingClientRect?.().top;
    const windowBottom = Math.max(rect.bottom, Number.isFinite(composerTop) ? composerTop : rect.bottom);
    const snapshot = {
      /* ::before 锚点的 left/bottom 是相对 indicator 的（computed），合成视口坐标。
         top 取锚点的顶边：indicator 底边 − bottom 偏移 − 锚点自身高度。 */
      left: rect.left + px(pseudo.left),
      top: rect.bottom - px(pseudo.bottom, 52) - anchorHeight,
      boxShadow: pseudo.boxShadow,
      transform: pseudo.transform === 'none' ? '' : pseudo.transform,
      transformOrigin: pseudo.transformOrigin || '24px 48px',
      rectLeft: rect.left,
      rectTop: rect.top,
      rectWidth: rect.width,
      windowHeight: Math.max(0, windowBottom - rect.top),
    };
    typingStableSnapshots.set(indicator, snapshot);
    return snapshot;
  }

  function cancelTypingExitGhost(indicator) {
    const record = typingExitGhosts.get(indicator);
    if (!record) return;
    hostWindow.clearTimeout(record.timer);
    record.viewport.remove();
    typingExitGhosts.delete(indicator);
    indicator.classList.remove('clawd-typing-native-suppressed');
  }

  /* 生成结束/手动停止：同步压掉原生精灵，用缓存的稳定坐标生成 fixed ghost，
     由 ghost 原地向下淡出。原生节点此时可能正被酒馆向右挪 —— ghost 挂在
     document.body 上，chat/composer/typing 节点和祖先 transform 都追不到它。 */
  function createTypingExitGhost(indicator) {
    if (!(indicator instanceof hostWindow.HTMLElement) || !indicator.isConnected) return;
    if (typingExitGhosts.has(indicator)) return;
    /* 没参与过本轮回合的隐藏常驻节点不能放 ghost：隐藏节点 rect 是 0，
       会在屏幕左上角闪一只 Clawd。 */
    const engaged = typingStableSnapshots.has(indicator)
      || indicator.classList.contains('clawd-typing-ready')
      || indicator.classList.contains('clawd-typing-enter')
      || isElementVisible(indicator);
    if (!engaged) return;
    const snapshot = typingStableSnapshots.get(indicator) || captureTypingSnapshot(indicator);
    if (!snapshot) return;

    /* 入场定时器可能还没跑完：先停掉，免得 720ms 后 ready class 盖回压制态。 */
    const entryTimer = typingEntryTimers.get(indicator);
    if (entryTimer) hostWindow.clearTimeout(entryTimer);
    typingEntryTimers.delete(indicator);
    clearTypingMotion(indicator);

    const ghost = hostDocument.createElement('span');
    ghost.className = 'clawd-typing-exit-ghost';
    ghost.setAttribute('aria-hidden', 'true');
    ghost.style.left = `${snapshot.left - snapshot.rectLeft}px`;
    ghost.style.top = `${snapshot.top - snapshot.rectTop}px`;
    ghost.style.boxShadow = snapshot.boxShadow;
    ghost.style.transform = snapshot.transform;
    ghost.style.transformOrigin = snapshot.transformOrigin;

    /* 裁剪窗口：从 typing 区域顶边到输入框顶边，overflow:hidden。
       ghost 在其中下沉，碰到输入框顶边即被裁掉 = 被对话框挡住。
       窗口本身无背景、不接收事件。 */
    const viewport = hostDocument.createElement('div');
    viewport.className = 'clawd-typing-exit-viewport';
    viewport.setAttribute('aria-hidden', 'true');
    viewport.style.left = `${snapshot.rectLeft}px`;
    viewport.style.top = `${snapshot.rectTop}px`;
    viewport.style.width = `${snapshot.rectWidth}px`;
    viewport.style.height = `${snapshot.windowHeight}px`;
    viewport.append(ghost);

    /* 必须先压掉原生 pseudo，再 append 窗口。两个操作在同一任务完成。 */
    indicator.classList.add('clawd-typing-native-suppressed');
    indicator.classList.remove('clawd-typing-enter', 'clawd-typing-ready');
    hostDocument.body.append(viewport);

    const timer = hostWindow.setTimeout(() => {
      viewport.remove();
      typingExitGhosts.delete(indicator);
      indicator.classList.remove('clawd-typing-native-suppressed');
      delete indicator.dataset.clawdTypingRun;
      indicator.querySelector(':scope > .clawd-typing-hit')?.remove();
    }, 540);
    typingExitGhosts.set(indicator, { ghost, viewport, timer });
  }

  /* 非 ghost 路径的清场（换对话、无事件的轮询兜底等）。 */
  function clearTypingState(indicator) {
    const entryTimer = typingEntryTimers.get(indicator);
    if (entryTimer) hostWindow.clearTimeout(entryTimer);
    typingEntryTimers.delete(indicator);
    clearTypingMotion(indicator);
    cancelTypingExitGhost(indicator);
    indicator.classList.remove('clawd-typing-enter', 'clawd-typing-ready', 'clawd-typing-native-suppressed');
    delete indicator.dataset.clawdTypingRun;
    indicator.querySelector(':scope > .clawd-typing-hit')?.remove();
  }

  /* 原生 generation 事件发生在浏览器下一次绘制之前：在 handler 里同步处理，
     不能只等 rAF 刷新，否则原生进入/离开 transition 会漏出一帧。
     退场动画【不】在这里对原生节点播放 —— 那是 ghost 的事，见事件 handler。 */
  function primeTypingTransition(active) {
    hostDocument.querySelectorAll('#chat .typing_indicator').forEach(indicator => {
      if (!active) return;
      /* 刚停止又立刻重试：先收掉旧 ghost、解除压制，再正常向上入场，
         防止屏幕上同时残留两只 Clawd。 */
      cancelTypingExitGhost(indicator);
      const entryTimer = typingEntryTimers.get(indicator);
      if (entryTimer) hostWindow.clearTimeout(entryTimer);
      typingEntryTimers.delete(indicator);
      indicator.classList.remove('clawd-typing-ready');
      indicator.classList.add('clawd-typing-enter');
    });
  }

  function bindTypingClick(indicator) {
    let hit = indicator.querySelector(':scope > .clawd-typing-hit');
    if (hit) return hit;
    hit = hostDocument.createElement('button');
    hit.type = 'button';
    hit.className = 'clawd-typing-hit';
    hit.setAttribute('aria-label', 'Poke Clawd');
    hit.title = 'Poke Clawd';
    const press = event => {
      event.preventDefault();
      event.stopPropagation();
      indicator.classList.add('clawd-typing-press');
    };
    const release = () => indicator.classList.remove('clawd-typing-press');
    hit.addEventListener('pointerdown', press);
    hit.addEventListener('pointerup', release);
    hit.addEventListener('pointercancel', release);
    hit.addEventListener('pointerleave', release);
    hit.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      release();
      if (!isTypingActive()) return;
      const entryTimer = typingEntryTimers.get(indicator);
      if (entryTimer) hostWindow.clearTimeout(entryTimer);
      typingEntryTimers.delete(indicator);
      indicator.classList.remove('clawd-typing-enter');
      indicator.classList.add('clawd-typing-ready');
      captureTypingSnapshot(indicator);
      playTypingMotion(indicator, 'clawd-typing-click', 560, true);
      createParticle(hit, Math.random() < .34 ? 'clawd-particle-heart' : 'clawd-particle-star');
    });
    indicator.append(hit);
    return hit;
  }

  /* 生成节点可能先以 display:none 常驻、再由酒馆显示。用每轮 generation id
     标记真正可见的第一次，避免入场动画在隐藏阶段提前播完。 */
  function refreshTypingInteractions(active, generationJustEnded = false) {
    hostDocument.querySelectorAll('#chat .typing_indicator').forEach(indicator => {
      if (!active) {
        if (generationJustEnded) {
          /* 事件订阅路径下 ghost 已在事件回调里同步创建；这里兜底覆盖
             没有原生事件的老版本（靠可见性轮询发现生成结束）。
             createTypingExitGhost 内部幂等，不会重复创建。 */
          createTypingExitGhost(indicator);
          return;
        }
        if (typingExitGhosts.has(indicator)) return; // 退出动画收尾由 ghost 定时器完成
        clearTypingState(indicator);
        return;
      }
      if (!isElementVisible(indicator)) return;
      cancelTypingExitGhost(indicator);
      bindTypingClick(indicator);
      const run = String(typingRunId);
      /* “同轮已处理”的提前返回必须校验状态自洽：stop→立刻重试时，ended 的
         刷新还没跑、run id 没递增，dataset 仍等于 run，但 prime 已经把
         入场定时器清掉了 —— 若这时提前返回，节点会永远停在 enter 没有
         定时器，卡死在中途。只有 ready（在跳）或 enter（定时器在跑）才算
         真的已处理；其余一律走完整重入，状态机自愈。 */
      const entryPending = typingEntryTimers.has(indicator);
      if (indicator.dataset.clawdTypingRun === run
        && (indicator.classList.contains('clawd-typing-ready') || entryPending)) {
        /* 生成中每轮都刷新稳定坐标：PC 上 typing 节点会随流式文本增长下移，
           退出时要用最后一个稳定位置，不是 ready 那一刻的旧位置。
           enter 阶段（还在下方钻）绝不覆盖快照。 */
        if (indicator.classList.contains('clawd-typing-ready')) captureTypingSnapshot(indicator);
        return;
      }
      indicator.dataset.clawdTypingRun = run;
      indicator.classList.remove('clawd-typing-enter');
      void indicator.offsetWidth;
      indicator.classList.add('clawd-typing-enter');
      const oldTimer = typingEntryTimers.get(indicator);
      if (oldTimer) hostWindow.clearTimeout(oldTimer);
      const timer = hostWindow.setTimeout(() => {
        indicator.classList.remove('clawd-typing-enter');
        indicator.classList.add('clawd-typing-ready');
        /* 入场落定 = 第一个稳定位置，缓存下来供退场 ghost 使用。 */
        captureTypingSnapshot(indicator);
        if (typingEntryTimers.get(indicator) === timer) typingEntryTimers.delete(indicator);
      }, 720);
      typingEntryTimers.set(indicator, timer);
    });
  }

  /* 举钳只在生成中触发，不再随机。
     随机举钳和打盹是两个独立定时器，迟早会撞上 —— 睡着了还举手。
     挂到生成状态上就天然互斥：在生成 = 有人在用 = 不可能在打盹。 */
  // 频率：平均 30 秒左右一次。之前是 3.2 秒 45% 概率（约 7 秒一次），
  // 而动作本身只有 0.9 秒 —— 密到不像偶尔的小动作，像在抽搐。
  function ccMaybeCheer() {
    if (destroyed || !isTypingActive()) return;
    if (Math.random() > 0.16) return;
    hostDocument.querySelectorAll('#chat .typing_indicator').forEach(el => {
      playTypingMotion(el, 'clawd-cheer', 900);
    });
  }
  const ccCheerTimer = hostWindow.setInterval(ccMaybeCheer, 5000);

  /* 生成过程里持续小跳之外的两种偶发变化：摇头晃脑（sway）、歪头暂停一下
     （tilt，短暂盖掉小跳，回味一下再接上）。跟举钳走同一个「只在生成中触发」
     的互斥原则，且不跟举钳撞在一起——已经在举钳就跳过这一轮，别一堆动作叠着播。
     频率跟举钳一个量级（平均每种 20+ 秒一次），不追求密。 */
  function ccMaybeWobble() {
    if (destroyed || !isTypingActive()) return;
    if (Math.random() > 0.14) return;
    const variant = Math.random() < 0.5 ? 'clawd-wobble-sway' : 'clawd-wobble-tilt';
    const duration = variant === 'clawd-wobble-tilt' ? 1080 : 820;
    hostDocument.querySelectorAll('#chat .typing_indicator').forEach(el => {
      playTypingMotion(el, variant, duration);
    });
  }
  const ccWobbleTimer = hostWindow.setInterval(ccMaybeWobble, 4200);

  function ccPickPhrase() {
    const hour = new Date().getHours();
    const bucket = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    const pick = list => list[Math.floor(Math.random() * list.length)];
    const deep = hour < 5;
    return {
      en: deep ? 'thinking… (ultrathink)' : pick(CC_VERBS_EN[bucket]) + '…',
      cn: deep ? '思考… (ultrathink)' : pick(CC_VERBS_CN[bucket]) + '…',
    };
  }

  function ccPrefersChinese() {
    const lang = hostDocument.documentElement.getAttribute('lang') || hostWindow.navigator.language || '';
    return /^zh/i.test(lang);
  }


  function refreshComposerPhrase(active) {
    const box = hostDocument.querySelector('#send_textarea');
    if (!box) return;
    if (active) {
      if (box.dataset.ccPh === undefined) {
        box.dataset.ccPh = box.getAttribute('placeholder') ?? '';
        const phrase = ccPickPhrase();
        box.setAttribute('placeholder', ccPrefersChinese() ? 'Clawd 正在' + phrase.cn : 'Clawd is ' + phrase.en);
      }
      return;
    }
    if (box.dataset.ccPh !== undefined) {
      box.setAttribute('placeholder', box.dataset.ccPh);
      delete box.dataset.ccPh;
    }
  }

  async function runSwipeProxy(message, direction, event) {
    const isLeft = direction === 'left';
    const selector = isLeft
      ? ':scope > .swipe_left'
      : ':scope > .swipeRightBlock .swipe_right';
    const fallbackToNativeControl = () => {
      const nativeControl = message.querySelector(selector);
      if (!(nativeControl instanceof hostWindow.HTMLElement)) return false;
      nativeControl.dispatchEvent(new hostWindow.MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: hostWindow,
      }));
      return true;
    };

    const context = getContext();
    const id = Number(message.getAttribute('mesid'));
    const data = Number.isInteger(id) && id >= 0 ? context?.chat?.[id] : null;
    const swipeApi = context?.swipe;
    const swipes = Array.isArray(data?.swipes) ? data.swipes : [];
    if (!data || data.is_user || id !== context.chat.length - 1 || swipes.length === 0) return false;
    if (isLeft && swipes.length <= 1) return false;

    /* swipe.to() silently returns when SillyTavern's native swipe UI is hidden,
       while our proxy can still be visible. The proxy is itself a swipe picker,
       so call the official API with that source after reproducing its safety
       guards locally. This keeps the custom arrows usable without allowing a
       second swipe during generation or an in-flight swipe. */
    if (isTypingActive()) return false;
    if (typeof swipeApi?.state === 'function' && swipeApi.state() !== 'none') return false;

    const currentSwipeId = Math.min(
      swipes.length - 1,
      Math.max(0, Number.isFinite(Number(data.swipe_id)) ? Number(data.swipe_id) : 0),
    );
    const regenerateOnRightEdge = !isLeft && currentSwipeId === swipes.length - 1;
    const targetSwipeId = regenerateOnRightEdge
      ? currentSwipeId + 1
      : (currentSwipeId + (isLeft ? -1 : 1) + swipes.length) % swipes.length;

    try {
      if (typeof swipeApi?.to === 'function') {
        /* forceMesId avoids depending on .last_mes timing. Existing candidates
           use an exact target, but the right edge deliberately omits
           forceSwipeId so ST enters its native overswipe/regenerate branch. */
        const options = {
          source: 'swipe_picker',
          message: data,
          forceMesId: id,
          forceDuration: 0,
        };
        if (!regenerateOnRightEdge) options.forceSwipeId = targetSwipeId;
        await swipeApi.to.call(swipeApi, event, direction, options);
      } else if (typeof swipeApi?.[direction] === 'function') {
        /* ST builds before swipe.to was exposed still accept the picker source
           through the deprecated directional wrappers. */
        await swipeApi[direction].call(swipeApi, event, {
          source: 'swipe_picker',
          message: data,
        });
      } else {
        return fallbackToNativeControl();
      }

      const updated = getContext()?.chat?.[id];
      const swipeChanged = regenerateOnRightEdge
        ? Number(updated?.swipe_id ?? 0) !== currentSwipeId
          || (Array.isArray(updated?.swipes) && updated.swipes.length > swipes.length)
        : Number(updated?.swipe_id ?? 0) === targetSwipeId;
      if (swipeChanged) return true;
      console.warn('[Claude Clawd] Swipe API returned without changing swipe_id; falling back to the native control.');
      return fallbackToNativeControl();
    } catch (error) {
      console.warn('[Claude Clawd] Swipe API failed; falling back to the native control.', error);
      return fallbackToNativeControl();
    }
  }

  function createSwipeProxy(message, direction) {
    const button = hostDocument.createElement('button');
    button.type = 'button';
    const isLeft = direction === 'left';
    button.className = isLeft ? LEFT_SWIPE_PROXY_CLASS : SWIPE_PROXY_CLASS;
    button.setAttribute('aria-label', isLeft ? '上一条回复' : '下一条回复');
    button.title = isLeft ? '上一条回复' : '下一条回复（到末端重新生成）';
    button.addEventListener('click', async event => {
      event.preventDefault();
      event.stopPropagation();
      if (button.getAttribute('aria-busy') === 'true') return;
      button.setAttribute('aria-busy', 'true');
      try {
        await runSwipeProxy(message, direction, event);
      } finally {
        button.removeAttribute('aria-busy');
        scheduleRefresh();
      }
    });
    return button;
  }

  function createRerollButton() {
    const button = hostDocument.createElement('button');
    button.type = 'button';
    button.className = REROLL_CLASS;
    button.setAttribute('aria-label', '重新生成回复');
    button.title = '重新生成 / 重 Roll';
    button.addEventListener('click', async event => {
      event.preventDefault();
      event.stopPropagation();
      const message = button.closest('#chat > .mes');
      if (!(message instanceof hostWindow.HTMLElement)) {
        hostWindow.toastr?.warning('当前酒馆没有可用的原生重新生成入口。', '重 Roll 不可用');
        return;
      }
      button.setAttribute('aria-busy', 'true');
      try {
        await runSwipeProxy(message, 'right', event);
      } finally {
        button.removeAttribute('aria-busy');
        scheduleRefresh();
      }
    });
    return button;
  }

  function refreshSwipeProxies(messages, typingActive) {
    const liveMessages = new Set(messages);
    hostDocument.querySelectorAll(`.${LEFT_SWIPE_PROXY_CLASS}, .${SWIPE_PROXY_CLASS}`).forEach(button => {
      if (!liveMessages.has(button.parentElement)) button.remove();
    });
    for (const message of [...observedSwipeMessages]) {
      if (liveMessages.has(message) && message.isConnected) continue;
      swipeObserver?.unobserve(message);
      observedSwipeMessages.delete(message);
      visibleSwipeMessages.delete(message);
    }
    if (typingActive) return;
    messages.forEach(message => {
      const leftSource = message.querySelector(':scope > .swipe_left');
      const rightSource = message.querySelector(':scope > .swipeRightBlock .swipe_right');
      const leftProxy = message.querySelector(`:scope > .${LEFT_SWIPE_PROXY_CLASS}`);
      const rightProxy = message.querySelector(`:scope > .${SWIPE_PROXY_CLASS}`);
      const swipeable = prepareSwipeProxyMessage(message);
      const alwaysShow = isMobileLayout();
      if ((!leftSource && !rightSource && !alwaysShow) || !swipeable) {
        leftProxy?.remove();
        rightProxy?.remove();
        swipeObserver?.unobserve(message);
        observedSwipeMessages.delete(message);
        visibleSwipeMessages.delete(message);
        message.classList.remove(SWIPE_VIEW_CLASS);
        return;
      }
      const nextLeftProxy = leftProxy || createSwipeProxy(message, 'left');
      const nextRightProxy = rightProxy || createSwipeProxy(message, 'right');
      if (!leftProxy) message.append(nextLeftProxy);
      if (!rightProxy) message.append(nextRightProxy);
      const data = getMessageData(message);
      const swipeCount = Array.isArray(data?.swipes) ? data.swipes.length : 0;
      const hasAlternatives = swipeCount > 1 || (!swipeCount && Boolean(leftSource || rightSource));
      const canRegenerate = swipeCount > 0 || Boolean(rightSource);
      const swipeApi = getContext()?.swipe;
      const hasGenericSwipeApi = typeof swipeApi?.to === 'function';
      nextLeftProxy.disabled = !hasAlternatives
        || (!leftSource && !hasGenericSwipeApi && typeof swipeApi?.left !== 'function');
      nextRightProxy.disabled = !canRegenerate
        || (!rightSource && !hasGenericSwipeApi && typeof swipeApi?.right !== 'function');
      nextLeftProxy.setAttribute('aria-disabled', String(nextLeftProxy.disabled));
      nextRightProxy.setAttribute('aria-disabled', String(nextRightProxy.disabled));
      if (!observedSwipeMessages.has(message)) {
        observedSwipeMessages.add(message);
        if (swipeObserver) swipeObserver.observe(message);
        else {
          const box = message.getBoundingClientRect();
          const chatBox = scrollHost?.getBoundingClientRect();
          const visible = !chatBox || (box.bottom > chatBox.top + 8 && box.top < chatBox.bottom - 8);
          message.classList.toggle(SWIPE_VIEW_CLASS, visible);
          if (visible) visibleSwipeMessages.add(message);
        }
      }
    });
    scheduleSwipeTrack();
  }

  function refreshReroll(message, typingActive) {
    hostDocument.querySelectorAll(`.${REROLL_CLASS}`).forEach(button => {
      if (!message || !message.contains(button)) button.remove();
    });
    if (!message || typingActive || isWelcomeSurfaceMessage(message)) {
      message?.querySelector(`.${REROLL_CLASS}`)?.remove();
      return;
    }
    const actions = message.querySelector('.mes_buttons');
    if (actions && !actions.querySelector(`:scope > .${REROLL_CLASS}`)) {
      actions.append(createRerollButton());
    }
  }

  /* 刷新自己会改 DOM，而观察器盯着整个 body 的 class / style。
     不掐断的话每次刷新都会把自己再排进下一轮，空闲时也在 20Hz 空转。
     刷新期间断开，结束前把这段时间攒下的记录丢掉再接回去。 */
  const OBSERVER_INIT = {
    subtree: true,
    childList: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ['class', 'style'],
  };

  const OBSERVER_COSMETIC_CLASSES = new Set([
    READY_CLASS,
    EMPTY_CLASS,
    GENERATING_CLASS,
    PRESET_REASONING_CLASS,
    SWIPE_VIEW_CLASS,
    WELCOME_ASSISTANT_CLASS,
    WELCOME_PROMPT_CLASS,
    MOBILE_LAYOUT_CLASS,
    MOBILE_MENU_OPEN_CLASS,
    TAURITAVERN_HOST_CLASS,
    'clawd-welcome',
    'clawd-has-recents',
    'clawd-sleeping',
    'clawd-cheer',
    'clawd-button-settle',
    'clawd-button-press',
    'clawd-idle-drowsy',
    'clawd-sleep-transition',
    'clawd-wobble-sway',
    'clawd-wobble-tilt',
    'clawd-typing-enter',
    'clawd-typing-ready',
    'clawd-typing-native-suppressed',
    'clawd-typing-click',
    'clawd-typing-press',
    ...BUTTON_REACTIONS,
  ]);

  const OWNED_MUTATION_SELECTOR = [
    `button.${BUTTON_CLASS}`,
    `button.${LEFT_SWIPE_PROXY_CLASS}`,
    `button.${SWIPE_PROXY_CLASS}`,
    `button.${REROLL_CLASS}`,
    `.${USER_ACTIONS_CLASS}`,
    '.clawd-click-particle',
    '.clawd-typing-hit',
    '.clawd-typing-exit-ghost',
    '.clawd-mobile-chrome',
    '.clawd-mobile-scrim',
    '.clawd-mobile-new-chat',
    '.clawd-character-menu',
    '.clawd-character-switcher',
    '.clawd-rail-brand',
    '.clawd-rail-label',
    '.clawd-rail-grip',
    '.clawd-welcome-hero',
    '.clawd-welcome-shortcuts',
  ].join(',');

  function classMutationIsCosmetic(record, target) {
    if (record.attributeName !== 'class') return false;
    const before = new Set(String(record.oldValue || '').split(/\s+/).filter(Boolean));
    const after = new Set(String(target.getAttribute('class') || '').split(/\s+/).filter(Boolean));
    const changed = new Set([...before, ...after].filter(name => before.has(name) !== after.has(name)));
    return changed.size > 0 && [...changed].every(name => (
      OBSERVER_COSMETIC_CLASSES.has(name)
      || name.startsWith('clawd-react-')
      || name.startsWith('clawd-poke-')
    ));
  }

  function nodeBelongsToClawd(node) {
    if (!(node instanceof hostWindow.Element)) return false;
    return node.matches(OWNED_MUTATION_SELECTOR) || Boolean(node.closest(OWNED_MUTATION_SELECTOR));
  }

  /* 记下这一批 MutationObserver 记录动到了哪些楼层，供 hasMessageContent
     的缓存失效判断用。要在 mutationNeedsFullRefresh 的"要不要触发整轮刷新"
     判断之外单独跑一遍：生成过程中，AI 那条消息内部的逐字流式更新会被
     mutationNeedsFullRefresh 过滤掉（不触发整轮刷新，这是刻意的性能优化），
     但那条消息的内容确实在变，等生成结束触发的那一轮全量刷新跑到它时，
     缓存必须知道它是脏的，不能继续返回生成开始前"还是空的"那个旧结果。
     这里只做 closest() 之类的轻量 DOM 定位，不读取任何文本，代价很低。 */
  function trackDirtyMessages(records) {
    for (const record of records) {
      const target = record.target instanceof hostWindow.Element
        ? record.target
        : record.target.parentElement;
      if (target instanceof hostWindow.Element) {
        const owner = target.closest('#chat > .mes');
        if (owner) dirtyMessages.add(owner);
      }
      if (record.type === 'childList') {
        record.addedNodes.forEach(node => {
          if (node instanceof hostWindow.Element && node.matches('#chat > .mes')) dirtyMessages.add(node);
        });
      }
    }
  }

  function mutationNeedsFullRefresh(record) {
    const target = record.target instanceof hostWindow.Element ? record.target : record.target.parentElement;
    if (!(target instanceof hostWindow.Element)) return true;

    /* ResizeObserver already owns composer sizing. In particular, the keyboard
       translate custom property changes #form_sheld's style attribute every frame
       without changing its box size. Measuring getBoundingClientRect/scrollHeight
       again here would turn a compositor-only update back into forced layout.
       Only old engines without ResizeObserver need the mutation fallback. */
    if (target.closest('#form_sheld, #send_form')) {
      if (!hostWindow.ResizeObserver) scheduleMobileComposerInset();
      return false;
    }

    if (target.matches(OWNED_MUTATION_SELECTOR) || target.closest(OWNED_MUTATION_SELECTOR)) return false;
    if (record.type === 'attributes' && classMutationIsCosmetic(record, target)) return false;

    if (record.type === 'childList') {
      const nodes = [...record.addedNodes, ...record.removedNodes];
      if (nodes.length && nodes.every(nodeBelongsToClawd)) return false;
      /* Native generation events schedule one complete refresh at start/end.
         Token-by-token DOM replacement inside the active answer must stay on
         the lightweight browser rendering path. */
      if (isTypingActive() && target.closest('#chat > .mes[is_user="false"] :is(.mes_text,.mes_reasoning)')) {
        return false;
      }
    }
    return true;
  }

  let refreshing = false;
  let dirtyWhileRefreshing = false;

  /* 5.11 第一版在这里 disconnect / observe，那是错的：
     disconnect 会清空记录队列，断开期间酒馆自己的改动一条都收不到。
     如果你正好在一次刷新进行中按了发送，那条消息的插入就被漏掉，
     没人再排下一轮 —— 欢迎态永远退不出去，消息卡在原地。
     （5.10 之所以没暴露，是因为那时循环在 20Hz 空转，下一轮总会把它兜回来。
       把空转修掉，这个漏洞才露出来。）
     现在改成：观察器一直连着，刷新期间来的记录只记一个脏标记，
     刷完如果脏了就补排一轮。自己写的东西都做了「值没变就不写」，
     不产生记录，所以不会转起来；酒馆的真实改动一次也不会丢。 */
  /* 刷新计量。2026-07-26 真机反馈：手机端只有几轮对话就明显卡、机身发热，
     而每条消息渲染后有两万多字。外部探针测到的是「闲置 0 次/秒，
     一有活动就每秒几百到两千次 DOM 变动，持续好几秒」。
     那是受激放大而不是稳态死循环，但到底贵在哪一步，靠读代码猜了两轮都没准。
     所以这里直接记账，在控制台跑 __claudeClawdInteraction.perfStats() 就能看。 */
  const refreshStats = {
    refreshes: 0,
    totalMs: 0,
    maxMs: 0,
    lastMs: 0,
    recordsSeen: 0,
    recordsPassedFilter: 0,
    selfRecordsDropped: 0,
    since: Date.now(),
  };

  function refreshClawd() {
    refreshing = true;
    const startedAt = (hostWindow.performance ?? Date).now();
    try {
      refreshClawdInner();
    } finally {
      const elapsed = (hostWindow.performance ?? Date).now() - startedAt;
      refreshStats.refreshes += 1;
      refreshStats.totalMs += elapsed;
      refreshStats.lastMs = elapsed;
      if (elapsed > refreshStats.maxMs) refreshStats.maxMs = elapsed;

      /* 我们自己刚写进去的那批记录直接丢掉，别让它再绕回来触发下一轮。
         takeRecords 就是干这个用的：把队列里已经攒下的记录取走并清空。
         取出来的仍然过一遍过滤 —— 万一里面混着酒馆的真实改动，
         不能连那个也一起丢了。 */
      const pending = observer?.takeRecords?.() ?? [];
      if (pending.length) {
        refreshStats.selfRecordsDropped += pending.length;
        if (pending.some(mutationNeedsFullRefresh)) dirtyWhileRefreshing = true;
      }

      refreshing = false;
      if (dirtyWhileRefreshing) {
        dirtyWhileRefreshing = false;
        if (!destroyed) scheduleRefresh();
      }
    }
  }

  function refreshClawdInner() {
    frameId = 0;
    lastRefreshAt = Date.now();
    if (destroyed) return;
    watchGenerationEvents();
    hostDocument.body.classList.add(READY_CLASS);
    const typingActive = isTypingActive();
    const continuingGeneration = previousTypingActive && typingActive;
    const generationJustEnded = previousTypingActive && !typingActive;
    if (!previousTypingActive && typingActive) typingRunId += 1;
    if (generationJustEnded) {
      settlePending = true;
      lastGenerationDoneAt = Date.now();
    }
    previousTypingActive = typingActive;
    hostDocument.body.classList.toggle(GENERATING_CLASS, typingActive);
    refreshTypingInteractions(typingActive, generationJustEnded);
    applyMobileViewportMetrics();
    refreshMobileComposerInset();
    if (continuingGeneration) {
      refreshComposerPhrase(true);
      return;
    }
    refreshEmbeddedSurfaces();
    refreshWelcomeAssistants();
    refreshComposerPhrase(typingActive);
    refreshCodeBars();
    collapseReasoning();
    /* 先确定 welcome/chat，再移动快捷按钮和刷新输入框控件。
       旧顺序会让退出对话后的第一帧仍按聊天态摆放输入框，随后才补 hero，
       页面就会出现“标题消失、输入框沉底”或整体跳位。 */
    const messages = refreshMessageStates(typingActive);
    if (generationJustEnded) {
      const assistants = [...hostDocument.querySelectorAll('#chat > .mes[is_user="false"]')];
      const latestAssistant = assistants.at(-1);
      /* An empty provider response is not a successful Clawd arrival. Avoid
         replaying the settle/pop animation on the previous real answer; that
         was the visible one-frame "tremble" reported for blank replies. */
      if (!latestAssistant || !hasMessageContent(latestAssistant)) settlePending = false;
    }
    // 这一轮该读的都读完了，脏标记清空；下一批 mutation 记录会重新标记
    dirtyMessages.clear();
    refreshWelcomeMode(messages);
    refreshRailBrand();
    refreshRailLabels();
    watchChatDeleted();   // 上下文晚于脚本就绪，所以每轮试一次，接上就不再重复
    watchUserSend();
    watchMessageFadeAnimation();
    refreshRailRecents();
    refreshWelcomeShortcuts();
    refreshCharacterSwitcher();
    refreshMobileChrome();
    refreshMobileNewChat();
    refreshRailUser();
    refreshRailGrip();
    refreshIdleSleep();
    refreshUserActions();
    refreshSwipeProxies(messages, typingActive);
    trackSwipeArrows();
    const message = messages.slice().reverse().find(candidate => !isWelcomeSurfaceMessage(candidate)) ?? null;
    refreshReroll(message, typingActive);
    removeStaleButtons(message);
    if (!message || typingActive) {
      message?.querySelector(`.${BUTTON_CLASS}`)?.remove();
      return;
    }
    const host = message.querySelector('.mes_text');
    const existing = host?.querySelector(`:scope > .${BUTTON_CLASS}`);
    if (existing) {
      // 姿势要跟着内容走，不能只在创建时套一次
      return;
    }
    if (!host) return;
    const created = createButton(settlePending);
    host.append(created);
    settlePending = false;
  }

  let lastRefreshAt = 0;
  let throttleTimer = 0;
  const REFRESH_MIN_GAP = 50;
  const MOBILE_GENERATION_REFRESH_MIN_GAP = 140;

  function scheduleRefresh() {
    if (destroyed || frameId || throttleTimer) return;
    const minGap = isMobileLayout() && previousTypingActive
      ? MOBILE_GENERATION_REFRESH_MIN_GAP
      : REFRESH_MIN_GAP;
    const wait = minGap - (Date.now() - lastRefreshAt);
    if (wait > 0) {
      throttleTimer = hostWindow.setTimeout(() => {
        throttleTimer = 0;
        scheduleRefresh();
      }, wait);
      return;
    }
    frameId = hostWindow.requestAnimationFrame(refreshClawd);
  }

  /* ===== 抽屉状态守卫 =====
     解决「点侧栏一项，面板闪一下就没了」。

     酒馆 1.15 打开一个抽屉分三步：
       1. 先把当前开着的抽屉标成关
       2. 如果第 1 步真的关掉了东西，就等一段动画时间（默认 125 毫秒）
       3. 等完，用 toggleClass 切换目标抽屉

     坑在第 3 步：toggleClass 是「反转」，不是「设为打开」。
     等待那 125 毫秒里目标抽屉如果已经被另一条路径打开了，
     反转就把刚打开的又关回去。酒馆在 html 上还绑了 mousedown 的自动关闭，
     它比 click 早触发，两条路径正好能错开成这个时序 ——
     于是一次点击的效果是：同步开，事件结束后异步关。
     侧栏改造让「开着一个面板时直接点另一项」变成常规操作，所以撞得特别频繁。

     不去改酒馆的开关逻辑（那是它的核心代码，改了跟着升级就废）。
     这里只记住「用户这一下想要的结果」，在随后的一小段时间内，
     谁把状态改成别的，就改回来。 */
  const DRAWER_GUARD_PAD = 400;
  let drawerGuardObserver = null;
  let drawerGuardTimer = 0;
  // 给自己看的计数：守卫真的动手了几次。0 说明根因已经断干净，守卫只是在待命。
  const drawerStats = { clicks: 0, corrections: 0, blocked: 0 };

  function railToggleOf(target) {
    const drawer = target?.closest?.('#top-settings-holder > .drawer');
    if (!drawer) return null;
    const toggle = drawer.querySelector(':scope > .drawer-toggle');
    return toggle?.contains(target) ? drawer : null;
  }

  /* 断掉第二条路径。
     酒馆在 html 上绑了 mousedown / touchstart 的「关掉所有开着的抽屉」。
     它比 click 早一步跑，于是同一次点击有两段代码在改同一份状态，
     而 click 那段中间还有个 await，两边一交错就互相踩。

     点侧栏按钮时根本不需要这条自动关闭 —— click 的处理器第一步本来就是
     「关掉当前开着的抽屉」，功能是重复的。
     在 document 的捕获阶段掐断，事件到不了 html 上的冒泡处理器，
     一次点击就只剩一条改状态的路径。点侧栏以外的地方不拦，自动关闭照常。 */
  function blockDrawerAutoClose(event) {
    if (!railEnabled || isMobileLayout() || destroyed) return;
    if (!railToggleOf(event.target)) return;
    event.stopPropagation();
    drawerStats.blocked += 1;
  }

  function drawerAnimationMs() {
    const raw = Number(hostWindow.SillyTavern?.getContext?.()?.powerUserSettings?.animation_duration);
    return Number.isFinite(raw) ? Math.min(Math.max(raw, 0), 350) : 125;
  }

  function clearDrawerGuard() {
    drawerGuardObserver?.disconnect();
    drawerGuardObserver = null;
    if (drawerGuardTimer) hostWindow.clearTimeout(drawerGuardTimer);
    drawerGuardTimer = 0;
  }

  function guardDrawerClick(event) {
    if (!railEnabled || isMobileLayout() || destroyed) return;
    const drawer = railToggleOf(event.target);
    if (!drawer) return;
    const content = drawer.querySelector(':scope > .drawer-content');
    if (!content) return;

    clearDrawerGuard();
    drawerStats.clicks += 1;
    const icon = drawer.querySelector(':scope > .drawer-toggle .drawer-icon');
    // 在捕获阶段读，此时酒馆还没动手，读到的就是点击前的状态
    const want = !content.classList.contains('openDrawer');

    drawerGuardObserver = new hostWindow.MutationObserver(() => {
      if (content.classList.contains('openDrawer') === want) return;
      drawerStats.corrections += 1;
      // 改回去会再次触发本回调，但那一次上面这行就 return 了，不会来回震荡
      content.classList.toggle('openDrawer', want);
      content.classList.toggle('closedDrawer', !want);
      icon?.classList.toggle('openIcon', want);
      icon?.classList.toggle('closedIcon', !want);
    });
    drawerGuardObserver.observe(content, { attributes: true, attributeFilter: ['class'] });
    drawerGuardTimer = hostWindow.setTimeout(clearDrawerGuard, drawerAnimationMs() + DRAWER_GUARD_PAD);
  }

  // 守卫只该拦「异步回来的那一下」，不该拦用户主动关。
  // 点侧栏以外的地方、按 Esc，都是主动关，直接撤掉守卫。
  function releaseDrawerGuard(event) {
    if (!drawerGuardObserver) return;
    if (event.type === 'keydown' && event.key !== 'Escape') return;
    /* 只在用户再次按同一个侧栏 toggle 时保留守卫。
       旧判断把整个 #top-settings-holder（连同已经打开的角色卡面板）都当成
       “仍在点 toggle”。于是用户紧接着点角色卡时，酒馆为了进入对话而关闭
       面板，守卫却把它强制重新打开，看起来就是角色怎么点都进不了聊天。
       面板内部的任何真实操作都代表用户已经开始下一步，应立即交还状态控制。 */
    if (event.type !== 'keydown' && railToggleOf(event.target)) return;
    clearDrawerGuard();
  }

  function start() {
    if (destroyed) return;
    installStyle();
    hostWindow.console?.info?.('[Claude-Clawd] build:', KEYBOARD_BUILD.id);
    hostDocument.body.classList.add(READY_CLASS);
    hostDocument.body.classList.toggle(MOBILE_LAYOUT_CLASS, mobileEnabled);
    hostDocument.body.classList.toggle(TAURITAVERN_HOST_CLASS, isTauriTavernHost());
    installVirtualKeyboardOverlay();
    watchGenerationEvents();
    observer = new hostWindow.MutationObserver(records => {
      refreshStats.recordsSeen += records.length;
      trackDirtyMessages(records);
      if (!records.some(mutationNeedsFullRefresh)) return;
      refreshStats.recordsPassedFilter += records.length;
      if (refreshing) { dirtyWhileRefreshing = true; return; }
      scheduleRefresh();
    });
    // characterData 会让流式输出的每个 token 都触发一次全量刷新，去掉；
    // 结构变化用 childList + attributes 已经够。
    observer.observe(hostDocument.body, OBSERVER_INIT);
    scrollHost = hostDocument.querySelector('#chat');
    if (hostWindow.IntersectionObserver && scrollHost) {
      swipeObserver = new hostWindow.IntersectionObserver(entries => {
        for (const entry of entries) {
          const message = entry.target;
          const visible = entry.isIntersecting && entry.intersectionRect.height > 8;
          message.classList.toggle(SWIPE_VIEW_CLASS, visible);
          if (visible) visibleSwipeMessages.add(message);
          else visibleSwipeMessages.delete(message);
        }
        scheduleSwipeTrack();
      }, { root: scrollHost, rootMargin: '-8px 0px -8px 0px', threshold: 0 });
    }
    /* 这里曾经有过一个给屏外楼层批量挂 content-visibility 的
       IntersectionObserver：滚动时按 320px 区段成批启停 containment，
       真机上呈“翻书式顿挫”，已按交接文档的隔离实验整体撤除。
       不要再以 JS 批量开关 class 的形式恢复；真要压屏外成本，
       用静态、全楼层、无 JS 开关的 content-visibility:auto。 */
    scrollHost?.addEventListener('scroll', handleChatScroll, { passive: true });
    hostDocument.addEventListener('click', interceptNativeDelete, true);
    hostDocument.addEventListener('click', guardDrawerClick, true);
    hostDocument.addEventListener('mousedown', blockDrawerAutoClose, true);
    hostDocument.addEventListener('touchstart', blockDrawerAutoClose, true);
    hostDocument.addEventListener('pointerdown', releaseDrawerGuard, true);
    hostDocument.addEventListener('keydown', releaseDrawerGuard, true);
    hostDocument.addEventListener('pointerdown', dismissCharacterMenu, true);
    hostDocument.addEventListener('keydown', dismissCharacterMenu, true);
    hostWindow.addEventListener('resize', handleViewportChange, { passive: true });
    hostDocument.addEventListener('mousemove', handleLook, { passive: true });
    hostDocument.addEventListener('keydown', noteActivity, { passive: true });
    hostDocument.addEventListener('visibilitychange', noteCcVisibility, { passive: true });
    hostDocument.addEventListener('focusin', handleFocusIn, true);
    hostDocument.addEventListener('focusout', handleFocusOut, true);
    hostWindow.visualViewport?.addEventListener('resize', handleViewportChange, { passive: true });
    hostWindow.visualViewport?.addEventListener('scroll', handleViewportChange, { passive: true });
    scheduleRefresh();
  }

  function destroy() {
    hostWindow.clearInterval(ccCheerTimer);
    hostWindow.clearInterval(ccWobbleTimer);
    hostWindow.clearInterval(idleTimer);
    if (reconcileTimer) hostWindow.clearTimeout(reconcileTimer);
    reconcileTimer = 0;
    if (destroyed) return;
    destroyed = true;
    observer?.disconnect();
    // 借来的列表还回去，再摘掉事件监听
    restoreRecents();
    for (const { source, type, handler } of chatDeletedSubscriptions) {
      try {
        source?.removeListener?.(type, handler);
        source?.off?.(type, handler);
      } catch { /* 无所谓 */ }
    }
    chatDeletedSubscriptions.length = 0;
    for (const { source, type, handler } of generationSubscriptions) {
      try {
        source?.removeListener?.(type, handler);
        source?.off?.(type, handler);
      } catch { /* no-op */ }
    }
    generationSubscriptions.length = 0;
    generationEventActive = false;
    scrollHost?.removeEventListener('scroll', handleChatScroll);
    if (swipeTrackRaf) hostWindow.cancelAnimationFrame(swipeTrackRaf);
    swipeObserver?.disconnect();
    swipeObserver = null;
    observedSwipeMessages.clear();
    visibleSwipeMessages.clear();
    hostDocument.removeEventListener('click', interceptNativeDelete, true);
    hostDocument.removeEventListener('click', guardDrawerClick, true);
    hostDocument.removeEventListener('mousedown', blockDrawerAutoClose, true);
    hostDocument.removeEventListener('touchstart', blockDrawerAutoClose, true);
    hostDocument.removeEventListener('pointerdown', releaseDrawerGuard, true);
    hostDocument.removeEventListener('keydown', releaseDrawerGuard, true);
    hostDocument.removeEventListener('pointerdown', dismissCharacterMenu, true);
    hostDocument.removeEventListener('keydown', dismissCharacterMenu, true);
    clearDrawerGuard();
    closeCharacterMenu();
    closeMobileMenu();
    if (mobileNavHolder && mobileNavCloseHandler) {
      mobileNavHolder.removeEventListener('click', mobileNavCloseHandler, true);
    }
    mobileNavHolder = null;
    mobileNavCloseHandler = null;
    mobileChrome?.root?.remove();
    mobileChrome = null;
    composerResizeObserver?.disconnect();
    composerResizeObserver = null;
    observedComposerShell?.style.removeProperty(MOBILE_COMPOSER_TRANSLATE_PROPERTY);
    observedComposerShell = null;
    lastComposerHeight = 0;
    if (composerInsetRaf) hostWindow.cancelAnimationFrame(composerInsetRaf);
    composerInsetRaf = 0;
    if (composerBottomRaf) hostWindow.cancelAnimationFrame(composerBottomRaf);
    composerBottomRaf = 0;
    clearMobileViewportSettleTimers();
    mobileKeyboardSettlingUntil = 0;
    mobileKeyboardRecoveryActive = false;
    stopKeyboardTrace();
    restoreVirtualKeyboardOverlay();
    hostDocument.querySelectorAll('.' + RAIL_BRAND_CLASS).forEach(brand => brand.remove());
    hostDocument.querySelectorAll('.' + CHARACTER_SWITCHER_CLASS).forEach(button => button.remove());
    hostDocument.querySelectorAll('.' + FAKE_MIC_CLASS).forEach(mic => mic.remove());
    hostDocument.querySelectorAll('.clawd-mobile-new-chat').forEach(button => button.remove());
    hostWindow.removeEventListener('resize', handleViewportChange);
    hostDocument.removeEventListener('mousemove', handleLook);
    hostDocument.removeEventListener('keydown', noteActivity);
    hostDocument.removeEventListener('visibilitychange', noteCcVisibility);
    hostDocument.removeEventListener('focusin', handleFocusIn, true);
    hostDocument.removeEventListener('focusout', handleFocusOut, true);
    if (throttleTimer) hostWindow.clearTimeout(throttleTimer);
    if (ccComboTimer) hostWindow.clearTimeout(ccComboTimer);
    if (ccPoseTimer) hostWindow.clearTimeout(ccPoseTimer);
    typingMotionTimers.forEach(timer => hostWindow.clearTimeout(timer));
    typingMotionTimers.clear();
    typingEntryTimers.forEach(timer => hostWindow.clearTimeout(timer));
    typingEntryTimers.clear();
    typingExitGhosts.forEach(({ ghost, timer }, indicator) => {
      hostWindow.clearTimeout(timer);
      ghost.remove();
      indicator.classList.remove('clawd-typing-native-suppressed');
    });
    typingExitGhosts.clear();
    if (lookRaf) hostWindow.cancelAnimationFrame(lookRaf);
    hostWindow.visualViewport?.removeEventListener('resize', handleViewportChange);
    hostWindow.visualViewport?.removeEventListener('scroll', handleViewportChange);
    if (mobileComposerTranslateRaf) hostWindow.cancelAnimationFrame(mobileComposerTranslateRaf);
    mobileComposerTranslateRaf = 0;
    if (viewportSettleTimer) hostWindow.clearTimeout(viewportSettleTimer);
    viewportSettleTimer = 0;
    scrollHost = null;
    if (frameId) hostWindow.cancelAnimationFrame(frameId);
    emptyTimers.forEach(timer => hostWindow.clearTimeout(timer));
    emptyTimers.clear();
    dirtyMessages.clear();
    previousTypingActive = false;
    lastGenerationDoneAt = 0;
    settlePending = false;
    embeddedFrameHandlers.forEach((handler, frame) => {
      frame.removeEventListener('load', handler);
      frame.removeAttribute(EMBED_ATTRIBUTE);
      frame.style.removeProperty('background');
      frame.style.removeProperty('background-color');
      try {
        frame.contentDocument?.getElementById(EMBED_STYLE_ID)?.remove();
      } catch {
        // Ignore cross-origin frames during cleanup.
      }
      const originalSrcdoc = embeddedFrameOriginalSrcdoc.get(frame);
      if (originalSrcdoc !== undefined) frame.setAttribute('srcdoc', originalSrcdoc);
    });
    embeddedFrameHandlers.clear();
    embeddedFrameOriginalSrcdoc.clear();
    [...welcomeAvatarOriginals.keys()].forEach(restoreWelcomeAvatar);
    hostDocument.querySelectorAll(`.${WELCOME_PROMPT_CLASS}`).forEach(message => message.classList.remove(WELCOME_PROMPT_CLASS));
    hostDocument
      .querySelectorAll(`.${BUTTON_CLASS}, .${LEFT_SWIPE_PROXY_CLASS}, .${SWIPE_PROXY_CLASS}, .${REROLL_CLASS}, .${USER_ACTIONS_CLASS}, .clawd-click-particle, .clawd-typing-hit, .clawd-typing-exit-ghost`)
      .forEach(element => element.remove());
    hostDocument.querySelectorAll('#chat .typing_indicator').forEach(indicator => {
      indicator.classList.remove('clawd-typing-enter', 'clawd-typing-ready', 'clawd-typing-native-suppressed', 'clawd-typing-click', 'clawd-typing-press', 'clawd-cheer', 'clawd-wobble-sway', 'clawd-wobble-tilt');
      delete indicator.dataset.clawdTypingRun;
    });
    hostDocument.getElementById(STYLE_ID)?.remove();
    hostDocument.body?.classList.remove(
      READY_CLASS,
      GENERATING_CLASS,
      MOBILE_LAYOUT_CLASS,
      TAURITAVERN_HOST_CLASS,
      VIRTUAL_KEYBOARD_OVERLAY_CLASS,
    );
    hostDocument.querySelectorAll(`.${EMPTY_CLASS}`).forEach(message => message.classList.remove(EMPTY_CLASS));
    hostDocument.querySelectorAll(`.${PRESET_REASONING_CLASS}`).forEach(message => message.classList.remove(PRESET_REASONING_CLASS));
    hostDocument.querySelectorAll(`.${SWIPE_VIEW_CLASS}`).forEach(message => message.classList.remove(SWIPE_VIEW_CLASS));
    hostDocument.querySelectorAll(`.${REGEX_SURFACE_CLASS}`).forEach(element => element.classList.remove(REGEX_SURFACE_CLASS));
    hostDocument.documentElement.style.removeProperty('--clawd-signoff-image');
    hostDocument.documentElement.style.removeProperty(MOBILE_COMPOSER_HEIGHT_PROPERTY);
    hostDocument.documentElement.style.removeProperty(MOBILE_VIEWPORT_HEIGHT_PROPERTY);
    hostDocument.documentElement.style.removeProperty(MOBILE_VIEWPORT_TOP_PROPERTY);
    if (hostWindow[INSTANCE_KEY] === api) delete hostWindow[INSTANCE_KEY];
  }

  // 控制台里跑 __claudeClawdInteraction.drawerStats() 看抽屉这块的实况：
  //   blocked      拦掉了几次酒馆的 mousedown 自动关闭（应该 = 点击次数）
  //   corrections  守卫真的动手改回状态几次（理想是 0 —— 说明根因断干净了）
  const api = {
    destroy,
    refresh: scheduleRefresh,
    drawerStats: () => ({ ...drawerStats }),
    buildId: KEYBOARD_BUILD.id,
    /* 刷新开销记账。用法：__claudeClawdInteraction.perfStats()
       重置：__claudeClawdInteraction.perfStats(true) */
    perfStats: (reset = false) => {
      const seconds = Math.max(1, (Date.now() - refreshStats.since) / 1000);
      const snapshot = {
        统计时长秒: Math.round(seconds),
        刷新次数: refreshStats.refreshes,
        每秒刷新: +(refreshStats.refreshes / seconds).toFixed(2),
        平均耗时ms: refreshStats.refreshes
          ? +(refreshStats.totalMs / refreshStats.refreshes).toFixed(1) : 0,
        最慢一次ms: +refreshStats.maxMs.toFixed(1),
        最近一次ms: +refreshStats.lastMs.toFixed(1),
        累计占用ms: Math.round(refreshStats.totalMs),
        占CPU比例: `${((refreshStats.totalMs / (seconds * 1000)) * 100).toFixed(1)}%`,
        收到记录数: refreshStats.recordsSeen,
        通过过滤数: refreshStats.recordsPassedFilter,
        自身记录丢弃数: refreshStats.selfRecordsDropped,
        消息条数: hostDocument.querySelectorAll('#chat > .mes').length,
        消息总字数: [...hostDocument.querySelectorAll('#chat > .mes .mes_text')]
          .reduce((sum, node) => sum + node.textContent.length, 0),
      };
      if (reset) {
        Object.assign(refreshStats, {
          refreshes: 0, totalMs: 0, maxMs: 0, lastMs: 0,
          recordsSeen: 0, recordsPassedFilter: 0, selfRecordsDropped: 0,
          since: Date.now(),
        });
      }
      return snapshot;
    },
    keyboardStats: () => ({
      focused: hostDocument.activeElement?.id === 'send_textarea',
      overlay: virtualKeyboardOverlayActive,
      recovering: mobileKeyboardRecoveryActive,
      settling: Date.now() < mobileKeyboardSettlingUntil,
      baseline: keyboardBaselineMode,
      stableLayoutHeight: mobileStableLayoutHeight,
      innerHeight: hostWindow.innerHeight,
      clientHeight: hostDocument.documentElement.clientHeight,
      visualHeight: hostWindow.visualViewport?.height ?? null,
      visualTop: hostWindow.visualViewport?.offsetTop ?? null,
      translate: hostDocument.querySelector('#form_sheld')?.style
        .getPropertyValue(MOBILE_COMPOSER_TRANSLATE_PROPERTY) || '',
    }),
    /* 键盘几何采样默认关闭，显式 start 后才开始（自动采样本身会强制同步
       布局、污染复测）。判读方法见 startKeyboardTrace 上方的注释。 */
    keyboardTraceStart: startKeyboardTrace,
    keyboardTraceStop: stopKeyboardTrace,
    keyboardTraceClear: () => { keyboardTraceSamples.length = 0; },
    keyboardTrace: () => ({
      session: keyboardTraceSession,
      startedAt: keyboardTraceStartedAt,
      samples: keyboardTraceSamples.slice(),
    }),
  };
  hostWindow[INSTANCE_KEY] = api;
  $(start);
  $(window).on('pagehide', destroy);
})();


/* 扩展设置面板 —— 只在扩展形态里出现，脚本形态不打包这个文件。
 *
 * 为什么提前到阶段 1：原计划放阶段 4，但没有面板就意味着换日夜只能改
 * localStorage，手机上根本没有控制台，PC 上也得开 F12。一个换肤扩展
 * 没有换肤入口，那是缺功能，不是缺润色。
 *
 * 设置仍然以 localStorage 为准，不用 extension_settings。理由：
 * index.js 在模块求值时就要读出 variant/layout 来决定挂哪份样式表，
 * 而那一刻酒馆的设置还没加载完。localStorage 是同步的、启动即可用，
 * 不存在这个时序问题。面板只是给它一个界面。
 */
(() => {
  'use strict';

  const KEY_PREFIX = 'claude-web:';
  const PANEL_ID = 'claude-web-settings';

  const VARIANTS = [
    { value: 'day', label: '日间' },
    { value: 'night', label: '夜间' },
  ];
  const LAYOUTS = [
    { value: 'auto', label: '自动（按 700px 断点）' },
    { value: 'pc', label: '桌面' },
    { value: 'mobile', label: '手机' },
  ];

  function read(key, allowed, fallback) {
    try {
      const raw = window.localStorage.getItem(KEY_PREFIX + key);
      return allowed.includes(raw) ? raw : fallback;
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(KEY_PREFIX + key, value);
      return true;
    } catch (error) {
      console.warn('[Claude Web] 设置写入失败：', error);
      return false;
    }
  }

  function resolveLayout(choice) {
    if (choice !== 'auto') return choice;
    try {
      return window.matchMedia('(max-width:700px)').matches ? 'mobile' : 'pc';
    } catch {
      return 'pc';
    }
  }

  /* 换日夜只是换一份样式表，能当场生效，不用刷新。
     换端型不行 —— CLAUDE_FEATURES.mobile 是启动时读一次的，
     一堆布局逻辑按它分叉，中途改会留下半新半旧的状态。 */
  function applyVariantLive(variant) {
    const link = document.getElementById('claude-integrated-theme-live-style');
    if (!(link instanceof HTMLLinkElement)) return false;
    const layout = resolveLayout(read('layout', ['auto', 'pc', 'mobile'], 'auto'));
    const base = typeof CLAUDE_EXTENSION_BASE !== 'undefined'
      ? CLAUDE_EXTENSION_BASE
      : new URL('.', import.meta.url).href;
    link.setAttribute('href', new URL(`styles/${variant}-${layout}.css`, base).href);
    document.documentElement.dataset.claudeIntegratedTheme = variant;
    return true;
  }

  function buildPanel() {
    const wrapper = document.createElement('div');
    wrapper.id = PANEL_ID;
    /* 沿用酒馆的 inline-drawer 结构，折叠交给酒馆自己的委托监听处理，
       我们不另外绑，免得点一下切两次。 */
    wrapper.innerHTML = `
      <div class="inline-drawer">
        <div class="inline-drawer-toggle inline-drawer-header">
          <b>Claude Web</b>
          <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
        </div>
        <div class="inline-drawer-content">
          <label for="claude-web-variant">主题</label>
          <select id="claude-web-variant" class="text_pole"></select>

          <label for="claude-web-layout" style="margin-top:8px">布局</label>
          <select id="claude-web-layout" class="text_pole"></select>

          <div id="claude-web-hint"
               style="margin-top:8px;font-size:0.9em;opacity:.75;line-height:1.5"></div>
        </div>
      </div>
    `;
    return wrapper;
  }

  function fillSelect(select, options, current) {
    select.textContent = '';
    for (const option of options) {
      const node = document.createElement('option');
      node.value = option.value;
      node.textContent = option.label;
      if (option.value === current) node.selected = true;
      select.append(node);
    }
  }

  function mount(host) {
    if (document.getElementById(PANEL_ID)) return;
    const panel = buildPanel();
    host.append(panel);

    const variantSelect = panel.querySelector('#claude-web-variant');
    const layoutSelect = panel.querySelector('#claude-web-layout');
    const hint = panel.querySelector('#claude-web-hint');

    const variant = read('variant', ['day', 'night'], 'day');
    const layout = read('layout', ['auto', 'pc', 'mobile'], 'auto');
    fillSelect(variantSelect, VARIANTS, variant);
    fillSelect(layoutSelect, LAYOUTS, layout);

    const describe = () => {
      const effective = resolveLayout(layoutSelect.value);
      hint.textContent = `当前生效：${layoutSelect.value === 'auto' ? `自动 → ${effective === 'mobile' ? '手机' : '桌面'}` : (effective === 'mobile' ? '手机' : '桌面')}`;
    };
    describe();

    variantSelect.addEventListener('change', () => {
      if (!write('variant', variantSelect.value)) return;
      if (!applyVariantLive(variantSelect.value)) {
        hint.textContent = '主题已保存，刷新后生效。';
      } else {
        describe();
      }
    });

    layoutSelect.addEventListener('change', () => {
      if (!write('layout', layoutSelect.value)) return;
      describe();
      /* 端型是启动时读的，必须刷新。与其让用户自己猜，不如直接给个按钮。 */
      hint.insertAdjacentHTML(
        'beforeend',
        ' <button id="claude-web-reload" class="menu_button" style="margin-left:6px">刷新生效</button>',
      );
      panel.querySelector('#claude-web-reload')
        ?.addEventListener('click', () => window.location.reload(), { once: true });
    });
  }

  /* 酒馆的设置容器不是一开始就有的，轮询等它出现。
     两个容器都可能存在，优先第二列（第三方扩展习惯放那边）。 */
  const deadline = Date.now() + 60000;
  const timer = window.setInterval(() => {
    const host = document.getElementById('extensions_settings2')
      || document.getElementById('extensions_settings');
    if (host) {
      window.clearInterval(timer);
      try {
        mount(host);
        console.info('[Claude Web] 设置面板已挂载。');
      } catch (error) {
        console.warn('[Claude Web] 设置面板挂载失败：', error);
      }
      return;
    }
    if (Date.now() > deadline) {
      window.clearInterval(timer);
      console.warn('[Claude Web] 一分钟内没等到扩展设置容器，面板没挂上。');
    }
  }, 500);
})();

