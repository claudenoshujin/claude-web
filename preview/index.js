import { installIOSKeyboardScroll } from './ios-keyboard-scroll.js?v=2.0.173';
import { installIOSComposerFocus } from './ios-composer-focus.js?v=2.0.173';
import { parseRecentTime } from './recent-time.js?v=2.0.173';
import { officialIcons as recentBadgeIcons } from './official-icons.js?v=2.0.173';
import { installChatTools } from './chat-tools.js?v=2.0.173';
import { preferencesFor, RELOAD_STORAGE_HINT } from './preferences.js?v=2.0.173';
import { tr } from './official-i18n.js?v=2.0.173';
/* Claude Web 2.0 —— SillyTavern 扩展形态入口。
 *
 * 【2026-08-10 更正】这个文件现在就是源码，直接改它。
 * 上面那句「由 tools/build-extension.js 生成、真正的源码在 src/」已经作废：
 * src/clawd-interaction.js 停在 2026-08-08，整个兼容框架（frameworkCompatibilityMode、
 * 区域制生成器、手机端接管）都只写在这里。跑一次 build-extension.js 会把它们全冲掉。
 * 要么先把 src/ 补齐再恢复那套流程，要么把 tools/build-extension.js 删掉。
 *
 * 设置在酒馆的「扩展」面板里，标题 Claude Web。
 * 底层存的是 localStorage，因为这个文件在模块求值时就要读出 variant/layout
 * 来决定挂哪份样式表，那一刻酒馆自己的设置还没加载完。
 *   localStorage['claude-web:variant'] = 'day' | 'night'            默认 day
 *   localStorage['claude-web:layout']  = 'auto' | 'pc' | 'mobile'   默认 auto
 */

import { installStreamFollow } from "./stream-follow.js?v=2.0.173";
import { installOfficialLayout } from "./official-layout.js?v=2.0.173";
import { installHalloween } from "./halloween.js?v=2.0.173";
import { buildClawdRig } from "./clawd-rig.js?v=2.0.173";
import { installClawdRhythm } from "./clawd-rhythm.js?v=2.0.173";
import { createClawdPile } from "./clawd-pile.js?v=2.0.173";

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
    const raw = (key === 'enabled' ? window.localStorage.getItem('claude-web:' + key) : preferencesFor(window).getItem('claude-web:' + key));
    return allowed.includes(raw) ? raw : fallback;
  } catch {
    return fallback;
  }
}

/* ---- 网址逃生口 ----
 * 设置面板是长在扩展自己的界面里的。只要外壳出问题（手机兼容模式丢导航就是
 * 现成的例子），用户就再也点不到那个面板，等于被锁在门外，只能去清 localStorage。
 * 这几个查询参数在读设置之前先写进 localStorage，所以打开一次就永久生效：
 *   ?claudemode=full     切回完整模式
 *   ?claudemode=compat   切到框架兼容
 *   ?claudelayout=pc|mobile|auto
 *   ?claude=off          整个扩展关掉（?claude=on 开回来）
 * 写完照常启动，不影响任何正常路径。 */
try {
  const escapeQuery = new URLSearchParams(location.search);
  const wanted = [
    ['claudemode', 'mode', ['full', 'compat']],
    ['claudelayout', 'layout', ['auto', 'pc', 'mobile']],
    ['claude', 'enabled', ['on', 'off']],
  ];
  for (const [param, key, allowed] of wanted) {
    const value = escapeQuery.get(param);
    if (value && allowed.includes(value)) window.localStorage.setItem('claude-web:' + key, value);
  }
} catch { /* 无痕或被禁用：逃生口本来就只是个方便，不是必须 */ }

/* 总开关。默认开；只有明确写过 'off' 才算关，
   读不到 localStorage（无痕、被云端宿主禁用）时不能把整个扩展关掉。 */
let CLAUDE_ENABLED = window.__claudeSafety?.state?.enabled ?? (claudeReadSetting('enabled', ['on', 'off'], 'on') !== 'off');
/* 框架兼容模式保留 Claude Web 的桌面外壳：左侧栏、内容区让位和输入框。
   外部主题继续负责配色、字体、背景、欢迎页和消息内容。 */
const CLAUDE_COMPAT_REQUESTED = claudeReadSetting('mode', ['full', 'compat'], 'full') === 'compat';
// 前瞻版（正式仓 preview/）一律用新版界面；用户保存的选择不改，关掉前瞻后照旧生效。
const CLAUDE_UI_STYLE = globalThis.__cwPreview ? 'web' : claudeReadSetting('ui-style', ['web', 'classic'], 'web');
document.documentElement.dataset.claudeUi = CLAUDE_UI_STYLE;
const CLAUDE_MOTION_ENABLED = claudeReadSetting('motion', ['on', 'off'], 'on') !== 'off';
const CLAUDE_DECORATIONS_ENABLED = claudeReadSetting('decorations', ['on', 'off'], 'on') !== 'off';
/* 生成计时器默认关（2.0.33 起改的，原来默认开）。
   原因是性能：这个徽标是 position:fixed + z-index:10015 + 18px 扩散阴影，
   而且计时循环只在生成期间跑，正好压在流式出字的绘制通道上。真机实测，
   开着它的时候不但掉帧，连正文出字的节奏都跟关掉时不一样。已经把每帧 rAF
   换成 100ms 定时器，但收益还没验够，暂时默认关掉，想要的人自己去设置里开。
   背景透传、毛玻璃默认关——都是外观改动，不该在没人要求的情况下
   突然把原本的白底/黑底换成透明。
   （侧栏图标开关已废弃移除：实测在真机上不生效，留着只会误导用户。） */
const CLAUDE_GEN_TIMER_ENABLED = claudeReadSetting('genTimer', ['on', 'off'], 'off') !== 'off';
const CLAUDE_BG_TRANSPARENT_ENABLED = claudeReadSetting('bgTransparent', ['on', 'off'], 'off') === 'on';
const CLAUDE_BG_BLUR_ENABLED = claudeReadSetting('bgBlur', ['on', 'off'], 'off') === 'on';
const CLAUDE_QUOTE_BODY_COLOR_ENABLED = claudeReadSetting('quoteBodyColor', ['on', 'off'], 'off') !== 'off';
/* 毛玻璃浓度：8~60 之间的整数，表示 color-mix 里 --cw-surface-page 的占比。
   数字越大越"糊"（底色更浓、越不透）；越小越接近纯透明。允许字符串是
   开区间，这里手动做数值校验和夹取，claudeReadSetting 那套白名单机制
   不适合连续数值。抽屉/弹层固定用同一个值上磨砂——它们不受
   bgBlur/bgTransparent 开关控制，用户要的是"不管开不开，抽屉始终是磨砂"。 */
const CLAUDE_BG_BLUR_OPACITY = (() => {
  let raw = null;
  try { raw = preferencesFor(window).getItem('claude-web:bgBlurOpacity'); } catch { /* 无痕/被禁用时用默认值 */ }
  const num = Number(raw);
  if (!Number.isFinite(num)) return 22;
  return Math.min(60, Math.max(8, Math.round(num)));
})();
/* 之前这里给到 68%，是想靠"颜色"硬压住底下的图案——反馈是"看着不像磨砂
   玻璃，像涂了层灰漆"。真机测过：抽屉现在自己带了 backdrop-filter 模糊
   （见下面 CSS），单靠模糊本身就能把底下的图案/色块糊成一片，可读性不
   靠色调堆出来。这里把下限降下来，颜色只留一点点存在感（让磨砂面板跟
   纯透明区分得出来），主要观感交给模糊，不是靠色调"糊脸"。 */
const CLAUDE_DRAWER_TINT_OPACITY = Math.max(18, CLAUDE_BG_BLUR_OPACITY);
/* 中性灰这条路走过一轮，反馈是"显脏"——纯中灰不亮不暗，跟大多数背景
   混在一起都是浑浊感，不管日夜用同一个色号反而两头不讨好。改回跟主题走
   （日间纸白、夜间近黑），但把浓度压得很低（18%起，比最早 68% 那版淡
   得多）再配模糊，是常见磨砂玻璃的标准做法——玻璃本身只留一点点存在感，
   主要靠底下的颜色透出来，不会再糊成一片白/一片黑。 */
const CLAUDE_GLASS_BASE = 'var(--cw-surface-page)';
/* 手机侧边栏（#top-settings-holder，导航列表那个抽屉）反馈"看着比别处
   淡"——它挂的是主区域那根滑条（--claude-bg-blur-opacity，最低能到
   8%），侧边栏一开还带着系统那层黑色遮罩（.clawd-mobile-scrim，见 CSS
   文件那边），淡玻璃 + 黑遮罩叠在一起就是发暗发灰的根源。侧边栏是导航
   主入口，不该跟着主区域那根"用户可能调得很低"的滑条走——单独给它一个
   更高的浓度下限，其他抽屉/弹层不受影响。 */
const CLAUDE_NAV_TINT_OPACITY = Math.max(58, CLAUDE_BG_BLUR_OPACITY);

/* FR-1 背景图模糊。跟「背景透传」「毛玻璃」是三个独立开关，别合并：
   - 透传：把我们自己的不透明底色清掉，让酒馆的背景图露出来
   - 毛玻璃：给前景面板上 backdrop-filter
   - 这个：只糊背景图那一层，前景一律不碰
   合并的话就没法「背景糊、文字清楚」——而那正是它存在的理由。

   实现上不新建图层：酒馆自己的 #bg1 / #bg_custom 已经是铺满视口的固定层，
   直接对它上 filter 就行。自己再糊一层意味着要跟着酒馆同步背景图地址、
   淡入淡出、切换动画，多一份必然要坏的复制品。

   默认关。开着才有意义的功能不该在没人要求时改变别人的界面。 */
const CLAUDE_BG_IMAGE_BLUR_ENABLED = claudeReadSetting('bgImageBlur', ['on', 'off'], 'off') !== 'off';
function claudeReadNumberSetting(key, fallback, min, max) {
  let raw = null;
  try { raw = preferencesFor(window).getItem('claude-web:' + key); } catch { /* 无痕或被禁用 */ }
  const num = Number(raw);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, Math.round(num)));
}
const CLAUDE_BG_IMAGE_BLUR = claudeReadNumberSetting('bgImageBlurRadius', 12, 0, 32);
const CLAUDE_BG_IMAGE_DIM = claudeReadNumberSetting('bgImageDim', 28, 0, 70);

document.documentElement.dataset.claudeMotion = CLAUDE_MOTION_ENABLED ? 'on' : 'off';
document.documentElement.dataset.claudeMode = CLAUDE_COMPAT_REQUESTED ? 'compat' : 'full';
document.documentElement.dataset.claudeDecorations = CLAUDE_DECORATIONS_ENABLED ? 'on' : 'off';
document.documentElement.dataset.claudeGenTimer = CLAUDE_GEN_TIMER_ENABLED ? 'on' : 'off';
document.documentElement.dataset.claudeBgTransparent = CLAUDE_BG_TRANSPARENT_ENABLED ? 'on' : 'off';
document.documentElement.dataset.claudeBgBlur = CLAUDE_BG_BLUR_ENABLED ? 'on' : 'off';
document.documentElement.dataset.claudeQuoteBodyColor = CLAUDE_QUOTE_BODY_COLOR_ENABLED ? 'on' : 'off';
document.documentElement.style.setProperty('--claude-bg-blur-opacity', `${CLAUDE_BG_BLUR_OPACITY}%`);
document.documentElement.style.setProperty('--claude-drawer-tint-opacity', `${CLAUDE_DRAWER_TINT_OPACITY}%`);
document.documentElement.style.setProperty('--claude-glass-base', CLAUDE_GLASS_BASE);
document.documentElement.style.setProperty('--claude-nav-tint-opacity', `${CLAUDE_NAV_TINT_OPACITY}%`);
/* 字体必须在这里就套上 —— 等设置面板挂载太晚，中间会闪一帧默认字。 */
const CLAUDE_FONT = claudeReadSetting('font', ['follow','songti','heiti','system','device','custom','native'], 'follow');
document.documentElement.dataset.claudeFont = CLAUDE_FONT;
document.documentElement.dataset.claudeStructure = claudeReadSetting('structure', ['rail'], 'rail');
document.documentElement.dataset.claudeClawd = claudeReadSetting('clawd', ['on','off'], 'on');
document.documentElement.dataset.claudeClawdPile=claudeReadSetting('clawd-pile',['on','off'],'on');
document.documentElement.dataset.claudeAvatars = claudeReadSetting('avatars', ['on','off'], 'on');
/* 侧栏「最近」大小（design-flavor-v8，Lulu 2026-10-06）：s 紧凑 / m 标准 / l 大 / xl 特大（默认，Lulu 2026-10-06 定）。CSS 在 official-layout.css「53」块。 */
document.documentElement.dataset.claudeRecents = claudeReadSetting('recents-size', ['s','m','l','xl'], 'xl');
/* 最新回复两侧的左右切换 / 重新生成箭头（扩展自己加的，不是酒馆原生按钮）。手机上容易误触，可以关掉；
   回复下方操作栏里的 ‹ › 不受影响。 */
document.documentElement.dataset.claudeSideSwipe = claudeReadSetting('side-swipe', ['on','off'], 'on');
document.documentElement.dataset.claudeSkin = claudeReadSetting('skin', ['classic'], 'classic');
try {
  const cf = preferencesFor(window).getItem('claude-web:fontCustom');
  if (cf) document.documentElement.style.setProperty('--cw-font-custom', cf);
} catch { /* 无痕或被禁用 */ }
// Apply saved weight offsets before styles and settings mount.
try { const value=Number(preferencesFor(window).getItem('claude-web:font-weight-offset')||0);const offset=[-100,-50,0,50,100,150,200].includes(value)?value:0;const all=preferencesFor(window).getItem('claude-web:font-weight-scope')==='all';document.documentElement.style.setProperty('--cw-weight-offset',String(offset));document.documentElement.style.setProperty('--cw-ui-weight-offset',String(all?offset:0));document.documentElement.dataset.cwWeightScope=all?'all':'chat';}catch{}

document.documentElement.dataset.claudeBgImageBlur = CLAUDE_BG_IMAGE_BLUR_ENABLED ? 'on' : 'off';
document.documentElement.style.setProperty('--claude-bg-image-blur', `${CLAUDE_BG_IMAGE_BLUR}px`);
document.documentElement.style.setProperty('--claude-bg-image-dim', String(CLAUDE_BG_IMAGE_DIM / 100));

function claudeReadClockSetting(key, fallback) {
  try {
    const value = preferencesFor(window).getItem('claude-web:' + key);
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(value || '') ? value : fallback;
  } catch {
    return fallback;
  }
}

function claudeClockMinutes(value) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function claudeResolveThemeVariant() {
  const manual = claudeReadSetting('variant', ['day', 'night'], 'day');
  const mode = claudeReadSetting('theme-auto', ['manual', 'system', 'time'], 'manual');
  if (mode === 'system') {
    try { return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day'; }
    catch { return manual; }
  }
  if (mode === 'time') {
    const dayStart = claudeClockMinutes(claudeReadClockSetting('theme-day-start', '07:00'));
    const nightStart = claudeClockMinutes(claudeReadClockSetting('theme-night-start', '19:00'));
    if (dayStart === nightStart) return manual;
    const now = new Date();
    const minute = now.getHours() * 60 + now.getMinutes();
    const isDay = dayStart < nightStart
      ? minute >= dayStart && minute < nightStart
      : minute >= dayStart || minute < nightStart;
    return isDay ? 'day' : 'night';
  }
  return manual;
}

const CLAUDE_THEME_VARIANT = claudeResolveThemeVariant();
/* Preset families still read the effective scheme from localStorage. Keep the
   resolved automatic value there too, so startup cannot pair night CSS with
   the day palette (or vice versa) before the settings panel mounts. */
if (claudeReadSetting('theme-auto', ['manual', 'system', 'time'], 'manual') !== 'manual') {
  try { preferencesFor(window).setItem('claude-web:variant', CLAUDE_THEME_VARIANT); } catch { /* storage may be blocked */ }
}

const CLAUDE_LAYOUT_CHOICE = claudeReadSetting('layout', ['auto', 'pc', 'mobile'], 'auto');

/* 自动布局：手机按设备判断，固定用手机版，横屏（宽度超过 700px）也不换、不刷新。
   电脑仍按窗口宽度：700px 以下用手机版，跨过断点时刷新一次——桌面样式表没有为
   700px 以下设计，半屏窗口（1366 屏约 683px）必须换到手机版。想强制某一版，用设置里的「布局」。 */
function claudeDetectPhone() {
  const ua = window.navigator?.userAgent || '';
  if (/iPhone|iPod|Android.+Mobile|Windows Phone/i.test(ua)) return true;
  const shortSide = Math.min(window.screen?.width || 0, window.screen?.height || 0);
  /* 部分 Android WebView（如 Via）的 UA 不带 Mobile；按屏幕短边补判，读不到尺寸时按手机算。 */
  if (/Android/i.test(ua)) return shortSide === 0 || shortSide <= 700;
  try {
    const touchFirst = window.matchMedia('(pointer:coarse)').matches && !window.matchMedia('(hover:hover)').matches;
    return touchFirst && shortSide > 0 && shortSide <= 700;
  } catch {
    return false;
  }
}

const CLAUDE_IS_PHONE = claudeDetectPhone();
function claudeNarrowWindow() {
  try { return window.matchMedia('(max-width:700px)').matches; } catch { return false; }
}
const CLAUDE_LAYOUT = CLAUDE_LAYOUT_CHOICE !== 'auto'
  ? CLAUDE_LAYOUT_CHOICE
  : (CLAUDE_IS_PHONE || claudeNarrowWindow() ? 'mobile' : 'pc');
document.documentElement.dataset.claudeLayout = CLAUDE_LAYOUT;

/* 2.0.98 之前这里写的是 `CLAUDE_COMPAT_REQUESTED && CLAUDE_LAYOUT === 'pc'`，
   也就是窄屏一律回退到完整手机版 —— 兼容模式在手机上根本没生效过。
   2.0.98 让手机也进兼容模式，但只接管输入区和欢迎页，结果是顶栏和抽屉两边都没人管。
   2.0.99 起手机和桌面用同一套边界：外壳（侧栏 / 抽屉 / 输入区 / 欢迎页）的结构
   全部归框架，美化只保留换皮通道和对话区。两个断点的差别只剩源文件不同
   （day-pc.css vs day-mobile.css），由 _dev/build-compat-css.js 生成。 */
const CLAUDE_COMPAT_MODE = CLAUDE_COMPAT_REQUESTED;
document.documentElement.dataset.claudeMode = CLAUDE_COMPAT_MODE ? 'compat' : 'full';

/* 手机版的样式表里有大量 (max-width:700px) / (min-width:701px) 分支。布局既然按设备
   定了，手机横屏超过 700px 时这些分支也必须仍按手机走：把扩展自己样式表里的这两个
   条件改写成恒真 / 恒假。只改本扩展的样式（链接在扩展目录下、或 id 以 claude / clawd
   开头的 <style>），酒馆和其他扩展的样式不动。电脑版不改写，窄窗口照常按宽度排版。 */
if (CLAUDE_ENABLED && CLAUDE_LAYOUT === 'mobile' && (CLAUDE_IS_PHONE || CLAUDE_LAYOUT_CHOICE === 'mobile')) {
  const PHONE_WIDTH = /\(\s*max-width\s*:\s*700px\s*\)/g;
  const WIDE_WIDTH = /\(\s*min-width\s*:\s*701px\s*\)/g;
  const pinned = new WeakSet();
  const ours = sheet => {
    const node = sheet.ownerNode;
    if (!node) return false;
    if (node.tagName === 'LINK') return String(node.href || '').startsWith(CLAUDE_EXTENSION_BASE);
    return /^(claude|clawd)/i.test(node.id || '');
  };
  const pinRules = list => {
    for (const rule of list) {
      const media = rule.media;
      if (media && /70[01]px/.test(media.mediaText)) {
        const next = media.mediaText.replace(PHONE_WIDTH, '(min-width: 0px)').replace(WIDE_WIDTH, '(min-width: 99999px)');
        if (next !== media.mediaText) media.mediaText = next;
      }
      if (rule.cssRules) pinRules(rule.cssRules);
    }
  };
  const pinPhoneMedia = () => {
    for (const sheet of document.styleSheets) {
      if (pinned.has(sheet) || !ours(sheet)) continue;
      let rules;
      try { rules = sheet.cssRules; } catch { continue; }
      pinRules(rules);
      pinned.add(sheet);
    }
  };
  pinPhoneMedia();
  // Linked sheets arrive on load; <style> text may be rewritten later (new sheet object).
  document.addEventListener('load', event => { if (event.target?.tagName === 'LINK') pinPhoneMedia(); }, true);
  new MutationObserver(pinPhoneMedia).observe(document.head, { childList: true, subtree: true, characterData: true });
  if (document.body) new MutationObserver(pinPhoneMedia).observe(document.body, { childList: true });
  else document.addEventListener('DOMContentLoaded', () => new MutationObserver(pinPhoneMedia).observe(document.body, { childList: true }), { once: true });
}

/* 电脑自动布局：跨过 700px 断点时刷新一次，让 JS 功能分支和 PC / 手机样式表一起切换。
   手机不走这里（见上）。 */
if (CLAUDE_ENABLED && CLAUDE_LAYOUT_CHOICE === 'auto' && !CLAUDE_IS_PHONE && window.matchMedia) {
  const layoutMedia = window.matchMedia('(max-width:700px)');
  let layoutReloadTimer = 0;
  const syncAutoLayout = () => {
    window.clearTimeout(layoutReloadTimer);
    layoutReloadTimer = window.setTimeout(() => {
      const nextLayout = layoutMedia.matches ? 'mobile' : 'pc';
      if (nextLayout !== CLAUDE_LAYOUT) window.location.reload();
    }, 180);
  };
  if (typeof layoutMedia.addEventListener === 'function') layoutMedia.addEventListener('change', syncAutoLayout);
  else if (typeof layoutMedia.addListener === 'function') layoutMedia.addListener(syncAutoLayout);
}

/* 2.0.99：手机端的接管范围跟桌面对齐。
   2.0.98 里这两条是 `rail: !COMPAT || layout==='pc'` 和 `mobile: !COMPAT && layout==='mobile'`，
   两条在「兼容 + 手机」这一格同时为 false —— 框架既不建 Claude 的手机外壳，
   也不建侧栏，而顶栏和抽屉又已经交还给酒馆和美化。真机结果是酒馆原生顶栏被挤成
   一条 8px 竖排小字，欢迎页连输入框都没有。
   现在：外壳（侧栏 / 抽屉 / 输入区 / 欢迎页）的结构一律归框架，手机和桌面同一套边界；
   放行给美化的只有换皮通道（图标图案、字体）和对话区内部。 */
const CLAUDE_FEATURES = {
  rail: true,
  welcome: true,
  mobile: CLAUDE_LAYOUT === 'mobile',
};

const CLAUDE_KEYBOARD_BUILD = {
  /* 这个 id 是 CSS 的缓存破坏 key（见下面 CLAUDE_STYLE_URL 的 ?v=）。
     只改 CSS 内容、不改这个字符串，用户端（尤其 TauriTavern 这类会长期
     缓存磁盘资源的原生壳）拉到的还是旧样式表，看起来像"更新了但没修复"。
     以后只要改了 styles/*.css，这里必须跟着换一个新值。 */
  id: '2.0.173-official-layout-' + (CLAUDE_COMPAT_MODE ? 'compat' : 'full')
    + '-' + CLAUDE_THEME_VARIANT + '-' + CLAUDE_LAYOUT + '-ext-local-fonts',
  mode: 'full',
};

/* 设置面板的「重新安装」要按地址重装，地址不能在面板里另写一份 ——
   写两处就有一天会对不上。这里从构建脚本的 REPO_URL 注入。 */
const CLAUDE_EXTENSION_REPO = 'https://github.com/claudenoshujin/claude-web';


const CLAUDE_THEME = CLAUDE_THEMES[CLAUDE_THEME_VARIANT];

/* 兼容模式从 2.0.86 起也分明暗：外壳整块用 Claude 自己的皮肤，
   那就必须跟着明暗开关走，否则深色美化配一条亮白侧栏。 */
const CLAUDE_STYLE_URL = new URL(
  CLAUDE_COMPAT_MODE
    ? 'styles/compat-' + (CLAUDE_LAYOUT === 'mobile' ? 'mobile-' : '') + CLAUDE_THEME_VARIANT + '.css'
    : 'styles/' + CLAUDE_THEME_VARIANT + '-' + CLAUDE_LAYOUT + '.css',
  CLAUDE_EXTENSION_BASE,
);
CLAUDE_STYLE_URL.searchParams.set('v', CLAUDE_KEYBOARD_BUILD.id);
const CLAUDE_STYLE_HREF = CLAUDE_STYLE_URL.href;

const officialStyle = document.createElement('link');
officialStyle.rel = 'stylesheet';
officialStyle.href = new URL('styles/official-layout.css?v=2.0.173-local-fonts', import.meta.url).href;
const localFontStyle = document.createElement('link');
localFontStyle.rel = 'stylesheet';
localFontStyle.href = new URL('styles/local-fonts.css?v=2.0.173', import.meta.url).href;
let optionalFontStyle;
let optionalFontTimeout;

function loadOptionalChineseFonts() {
  if (!CLAUDE_ENABLED || optionalFontStyle) return;

  const css = new URL('https://fonts.googleapis.com/css2');
  if (CLAUDE_LAYOUT === 'pc') css.searchParams.append('family', 'Noto Sans SC:wght@400;500;700');
  css.searchParams.append('family', 'Noto Serif SC:wght@300;400');
  css.searchParams.set('display', 'swap');

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.media = 'print';
  link.href = css.href;
  link.addEventListener('load', () => {
    window.clearTimeout(optionalFontTimeout);
    link.media = 'all';
  }, { once: true });
  link.addEventListener('error', removeOptionalChineseFonts, { once: true });
  optionalFontStyle = link;
  optionalFontTimeout = window.setTimeout(removeOptionalChineseFonts, 8000);
  document.head.append(link);
}

function removeOptionalChineseFonts() {
  window.clearTimeout(optionalFontTimeout);
  optionalFontStyle?.remove();
  optionalFontStyle = undefined;
}
document.documentElement.dataset.claudeEnabled = CLAUDE_ENABLED ? 'on' : 'off';
const refinementStyle=document.createElement('link');refinementStyle.rel='stylesheet';refinementStyle.href=new URL('styles/interface-refinements.css?v=2.0.173',import.meta.url).href;if(CLAUDE_ENABLED)document.head.append(refinementStyle);
if (CLAUDE_ENABLED) {
  document.head.append(localFontStyle);
  if (CLAUDE_UI_STYLE === 'web') document.head.append(officialStyle);
}
const startOfficialLayout = () => {
  if (!CLAUDE_ENABLED) return;
  window.__claudeOfficialLayout?.destroy();
  delete window.__claudeOfficialLayout;
  if (CLAUDE_UI_STYLE === 'web') {
    document.head.append(officialStyle);
    window.__claudeOfficialLayout = installOfficialLayout(window, { defaultChatWidth: CLAUDE_THEME.chat_width });
  }
  // Fetch optional CJK faces after the initial page load, outside the layout stylesheets.
  loadOptionalChineseFonts();
};
if (document.readyState === 'complete') window.setTimeout(startOfficialLayout, 0);
else window.addEventListener('load', startOfficialLayout, { once: true });

console.info(
  '[Claude Web] 扩展形态启动：' + (CLAUDE_COMPAT_MODE ? '兼容框架' : CLAUDE_THEME_VARIANT)
  + ' / ' + CLAUDE_LAYOUT
  + '（在酒馆「扩展」面板的 Claude Web 里可切换）',
);

/* ---- 外壳自检：`?shellcheck=1` ----
 * 手机端（尤其 Via / WebView）没有控制台，截图又只能看见「有没有」，
 * 看不见「为什么没有」。带上这个查询参数会在页面顶上盖一层纯文本，
 * 把外壳关键节点的存在性和实测几何直接打出来，可以直接截图读。
 * 它不改任何样式，也不参与正常渲染路径；不带参数时一行都不跑。 */
if (new URLSearchParams(location.search).has('shellcheck')) {
  const dumpShell = () => {
    const rows = [];
    const root = document.documentElement;
    rows.push('mode=' + (root.dataset.claudeMode || '-')
      + ' layout=' + (typeof CLAUDE_LAYOUT === 'string' ? CLAUDE_LAYOUT : '-')
      + ' skin=' + (root.dataset.claudeSkin || '-')
      + ' build=' + CLAUDE_KEYBOARD_BUILD.id);
    rows.push('features rail=' + CLAUDE_FEATURES.rail + ' mobile=' + CLAUDE_FEATURES.mobile
      + ' welcome=' + CLAUDE_FEATURES.welcome);
    rows.push('vw=' + window.innerWidth + 'x' + window.innerHeight
      + ' mm700=' + window.matchMedia('(max-width:700px)').matches);
    rows.push('body.class=' + (document.body?.className || '(空)'));
    rows.push('--- 节点 ---');
    for (const sel of [
      '.clawd-mobile-chrome', '.clawd-mobile-menu-button', '.clawd-mobile-clawd-button',
      '.clawd-mobile-new-chat', '#top-settings-holder', '#top-settings-holder>.clawd-rail-brand',
      '#sheld', '#chat', '#form_sheld', '#send_form', '#send_textarea',
    ]) {
      const el = document.querySelector(sel);
      if (!el) { rows.push(sel + '  ✗ 不在 DOM 里'); continue; }
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const round = n => Math.round(n);
      rows.push(sel + '  ' + cs.display + '/' + cs.visibility + '/op' + cs.opacity
        + ' ' + cs.position + ' z' + cs.zIndex
        + ' [' + round(r.left) + ',' + round(r.top) + ' ' + round(r.width) + 'x' + round(r.height) + ']'
        + (cs.transform !== 'none' ? ' tf=' + cs.transform : '')
        + (cs.overflow !== 'visible' ? ' ov=' + cs.overflow : ''));
      /* 隐形时把链路上第一个「把它藏起来」的祖先找出来。 */
      if (r.width === 0 || r.height === 0 || cs.display === 'none' || cs.visibility === 'hidden') {
        for (let p = el.parentElement; p && p !== root; p = p.parentElement) {
          const ps = getComputedStyle(p);
          if (ps.display === 'none' || ps.visibility === 'hidden' || ps.opacity === '0') {
            rows.push('    ↑ 被祖先藏了: ' + (p.id ? '#' + p.id : p.tagName.toLowerCase()
              + '.' + String(p.className).trim().split(/\s+/).join('.'))
              + ' ' + ps.display + '/' + ps.visibility + '/op' + ps.opacity);
            break;
          }
        }
      }
    }
    /* #sheld 被藏的时候，光知道「第一个藏它的祖先」不够 —— 那个祖先是谁、
       谁把它插进来的才是关键。把整条链打出来。 */
    const describe = el => {
      const cs = getComputedStyle(el);
      const cls = String(el.className || '').trim().split(/\s+/).filter(Boolean).slice(0, 4).join('.');
      return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (cls ? '.' + cls : '')
        + ' ' + cs.display + '/' + cs.visibility + '/op' + cs.opacity + '/' + cs.position;
    };
    for (const sel of ['#sheld', '#form_sheld']) {
      const el = document.querySelector(sel);
      if (!el) continue;
      rows.push('--- ' + sel + ' 的祖先链 ---');
      let depth = 0;
      for (let p = el.parentElement; p && depth < 8; p = p.parentElement, depth += 1) {
        rows.push('  ' + '  '.repeat(depth) + describe(p));
      }
    }

    const pre = document.createElement('pre');
    pre.id = 'claude-shellcheck';
    pre.style.cssText = 'position:fixed;inset:0 0 auto 0;z-index:2147483647;margin:0;'
      + 'max-height:86vh;overflow:auto;padding:8px;background:#000;color:#0f0;'
      + 'font:11px/1.45 monospace;white-space:pre-wrap;word-break:break-all';
    pre.textContent = rows.join('\n');
    pre.addEventListener('click', () => pre.remove());
    document.getElementById('claude-shellcheck')?.remove();
    document.body.appendChild(pre);
  };
  /* 不能用 window.addEventListener('load')：酒馆的扩展是 load 之后才 import 进来的，
     那个事件早就过去了，监听器永远不会触发 —— 第一版就是这么空跑的。
     这里直接排定时器，并且量两次：2.5 秒看首屏，7 秒看外壳建完之后。 */
  const schedule = () => {
    setTimeout(dumpShell, 2500);
    setTimeout(dumpShell, 7000);
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule, { once: true });
  } else {
    schedule();
  }
}

/* 总开关。关掉之后除了设置面板什么都不跑 ——
   面板必须留着，不然没有地方把它开回来。 */
if (CLAUDE_ENABLED) {

/* 2.0.162：弹层状态标记。主题里原先用 html:has(#completion_prompt_manager_popup.openDrawer)、
   body:has(#top-settings-holder > .drawer > .drawer-content.openDrawer) 判断弹层是否打开，
   根节点 :has() 让聊天区每次追加内容都要重新判断整页（见 diagnostics/手机卡顿排查-20260928.md，
   桌面 4× 降速模拟里样式重算约 6 s → 0.05 s）。改成这里在 <html> 上挂两个标记（2.0.217 起是 data 属性，不是 class）：
     claude-pm-open          Prompt 编辑弹层打开
     claude-top-drawer-open  顶栏任一抽屉打开
   只监听这两处元素自己的 class 变化，不看聊天区；状态真的变了 classList.toggle 才会改根节点。 */
(() => {
  'use strict';
  const root = document.documentElement;
  const sync = () => {
    const pm = document.getElementById('completion_prompt_manager_popup');
    const holder = document.getElementById('top-settings-holder');
    // 2.0.217：改挂 data 属性，不再改 <html> 的 class——主题里有 [class*="spreset" i] 这类按 class 子串匹配的选择器，
    // 根节点 class 一变整页都要重新匹配（提示词编辑页一开一关各约 12ms，手机 4× 降速约 100ms）。
    root.toggleAttribute('data-claude-pm-open', !!pm?.classList.contains('openDrawer'));
    root.toggleAttribute('data-claude-top-drawer-open',
      !!holder?.querySelector(':scope > .drawer > .drawer-content.openDrawer'));
    /* 菜单精简器这类脚本会给侧栏各项写行内 order 来重排。重排后「偏好设置」上方那段分组留白
       会跟着它跑到别处，显得突兀，所以只要检测到有人重排就去掉这段留白（样式见 official-layout.css）。 */
    root.toggleAttribute('data-claude-rail-reordered',
      !!holder?.querySelector(':scope > [style*="order"]'));
  };
  const install = () => {
    /* 打开旧聊天性能修复（20261001 手机 LoAF/观察器计时）：subtree 观察会把抽屉里面板内容的
       class/style 变化（表情列表、提示词管理器重建等）也送进来，每批都跑一次 sync。
       只认三类目标：提示词编辑弹层本身、holder 的直接子项（行内 order）、抽屉本身（holder > .drawer > .drawer-content）。 */
    const observer = new MutationObserver(records => {
      const pm = document.getElementById('completion_prompt_manager_popup');
      const holder = document.getElementById('top-settings-holder');
      if (records.some(r => r.target === pm
        || r.target.parentElement === holder
        || r.target.parentElement?.parentElement === holder)) sync();
    });
    const pm = document.getElementById('completion_prompt_manager_popup');
    const holder = document.getElementById('top-settings-holder');
    if (pm) observer.observe(pm, { attributes: true, attributeFilter: ['class'] });
    /* 抽屉是 holder 的孙辈，后来插进来的抽屉也要算，所以用 subtree；只收 class / style 属性
       （style 用来发现重排侧栏的行内 order），抽屉里面板内容的增删不会触发。 */
    if (holder) observer.observe(holder, { attributes: true, attributeFilter: ['class', 'style'], subtree: true });
    sync();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();

/* 配色预设。只在扩展形态里打包。
 *
 * 见 方案-令牌层与预设系统-20260727.md。
 *
 * 预设的形状：
 *   core   9 个色 + scheme 标记。**社区作者只需要填这 9 个。**
 *   extra  可选的精确覆盖。「官网」用它钉死官方给了精确值、而 derive() 推
 *          不准的那几条。社区预设不用管这个字段。
 *
 * 应用方式只有一种：往 documentElement 的 inline style 上设 CSS 变量。
 * **绝不换 stylesheet** —— Moonlit 的 README 自己写了手机上切主题会卡几秒，
 * 那是重载整份样式表的代价。设变量只触发一次重绘。
 */
(() => {
  'use strict';

  const STORAGE_PRESET = 'claude-web:preset';
  /* 自定义配色。**不是**叠在预设之上的补丁层，而是一套独立的方案，
     和内置家族在「风格」下拉里并列。
     形状：{ light: {令牌表}, dark: {令牌表} }。
     必须分明暗两半 —— 只存一套的话，切到夜间时 paper-0 还是浅色，明暗开关等于废掉。
     1.x 存的是扁平令牌表，读的时候迁移到当前明暗那一半。 */
  const STORAGE_CUSTOM = 'claude-web:custom';
  /* 自定义的取值起点。用户从哪个家族点进调色，就从那套色开始改，
     而不是从空白或者写死的某一套开始。 */
  const STORAGE_BASE = 'claude-web:custom-base';
  const CUSTOM_ID = 'custom';
  const CUSTOM_NAME = '我的配色';

  /* 社区预设允许出现的键。导入时白名单校验 —— 不校验的话，
     一个预设文件可以往 :root 上塞任意 CSS 变量。 */
  const CORE_KEYS = [
    '--cw-paper-0', '--cw-paper-1', '--cw-paper-2', '--cw-paper-3',
    '--cw-ink-0', '--cw-ink-1', '--cw-ink-2', '--cw-ink-3',
    '--cw-clay',
  ];

  /* extra 里允许的键。都是能从 core 推导、但某些预设需要精确值的那些
     （比如「官网」的边框透明度和 clay hover，推导值跟官方取值对不上）。 */
  const EXTRA_KEYS = [
    '--cw-line', '--cw-line-strong', '--cw-hero', '--cw-icon',
    '--cw-clay-soft', '--cw-clay-strong', '--cw-code-surface', '--cw-code-ink',
    '--cw-em', '--cw-selection', '--cw-scrollbar', '--cw-scrollbar-hover',
    '--cw-shadow-dialog', '--cw-shadow-composer', '--cw-shadow-floating',
    '--cw-topbar-surface', '--cw-body-weight', '--cw-color-scheme',
    '--cw-grid-opacity', '--cw-grid-step',
    /* 形状（2.0.47）。只开倍率和圆形两个键，不开 --cw-radius-8 那一串档位 ——
       放开档位等于让配色预设去改设计比例，那是版式层的事，不是配色的事。 */
    '--cw-radius-scale', '--cw-radius-circle',
    /* 皮肤字体（2.0.47）。只在「字体 = 跟风格」时生效，
       见 styles 里 html[data-claude-font="follow"] 那段。 */
    '--cw-skin-serif', '--cw-skin-sans', '--cw-font-custom',
  ];

  const ALLOWED = new Set([...CORE_KEYS, ...EXTRA_KEYS]);

  /* ---------- 内置预设 ---------- */

  /* 暖纸 = 标本册那版设计的取色。只填 9 个核心色，其余靠推导 ——
     这也是给社区看的样板：一个预设长这么大就够了。 */
  const WARM_PAPER = {
    id: 'warm-paper',
    name: '暖纸',
    scheme: 'light',
    core: {
      '--cw-paper-0': '#f4f0e6',
      '--cw-paper-1': '#efeadf',
      '--cw-paper-2': '#e9e3d5',
      '--cw-paper-3': '#e4ddcc',
      '--cw-ink-0': '#232219',
      '--cw-ink-1': '#6e6857',
      '--cw-ink-2': '#9b9280',
      '--cw-ink-3': '#d8cfbb',
      '--cw-clay': '#c8623c',
    },
  };

  const INK = {
    id: 'ink',
    name: '墨',
    scheme: 'dark',
    core: {
      '--cw-paper-0': '#1c1b19',
      '--cw-paper-1': '#232220',
      '--cw-paper-2': '#2a2825',
      '--cw-paper-3': '#333029',
      '--cw-ink-0': '#ede9df',
      '--cw-ink-1': '#a8a192',
      '--cw-ink-2': '#8a8375',
      '--cw-ink-3': '#3b372f',
      '--cw-clay': '#d97757',
    },
  };

  /* 官网配色（FR-2）。色值不是从需求文档抄的近似值，是 2026-08-03 从
     www.anthropic.com 的 --swatch--* / --_color-theme---* 直接读出来的官方
     brand token，下面每一行都标了它在官网叫什么名字。

     跟需求文档对不上的两处，以官网为准：
     - 文档的 Coral hover 写 #C96645，官网 --swatch--accent 实际是 #c6613f。
     - 文档把 Canvas 写成 #F0EEE6，但官网自己的 background 是 #faf9f5，
       #f0eee6 是 background-secondary。2.0.43 曾按文档取，整个日间偏黄；
       2.0.44 改回官网的层级：页面底 ivory-light、卡片 white、输入框
       ivory-medium、悬停 ivory-dark。四层依然全部是官网 swatch，只是整体
       白了一档。oat(#e3dacc) 退出 —— 它在官网是卡片底色，当悬停太重。

     只有深色那半的 paper-1/2/3 是推的 —— 官网基本是浅色站，深色区块只给了
     背景 #141413 和边框透明度，没有完整的表面阶梯。推的那三个都标了「推」。 */
  const ANTHROPIC_LIGHT = {
    id: 'anthropic-light',
    name: '官网 · 日间',
    scheme: 'light',
    core: {
      '--cw-paper-0': '#faf9f5',  /* swatch--ivory-light   页面底 */
      '--cw-paper-1': '#ffffff',  /* swatch--white         卡片 / 抽屉 / 弹窗 */
      '--cw-paper-2': '#f0eee6',  /* swatch--ivory-medium  输入框 */
      '--cw-paper-3': '#e8e6dc',  /* swatch--ivory-dark    悬停 */
      '--cw-ink-0': '#141413',    /* swatch--slate-dark    正文 */
      '--cw-ink-1': '#5e5d59',    /* swatch--slate-light   次文字 */
      '--cw-ink-2': '#87867f',    /* swatch--cloud-dark    弱文字 */
      '--cw-ink-3': '#d1cfc5',    /* swatch--cloud-light   极弱 / 分隔线 */
      '--cw-clay': '#d97757',     /* swatch--clay          强调 */
    },
    /* 这三条 derive() 推得出来但推不准，官网有精确值就用精确值：
       边框官网是 10% / 20%（slate-faded-10/20），derive 一律 15% / 25%；
       clay-strong 官网是另调的一个更红的橙，derive 只会把 clay 压暗，发浑。 */
    extra: {
      '--cw-line': 'rgba(20,20,19,.10)',        /* swatch--slate-faded-10 #1414131a */
      '--cw-line-strong': 'rgba(20,20,19,.20)', /* swatch--slate-faded-20 #14141333 */
      '--cw-clay-strong': '#c6613f',            /* swatch--accent */
    },
  };

  const ANTHROPIC_DARK = {
    id: 'anthropic-dark',
    name: '官网 · 夜间',
    scheme: 'dark',
    core: {
      '--cw-paper-0': '#141413',  /* swatch--slate-dark    页面底（官网深色区块底色） */
      '--cw-paper-1': '#1f1f1e',  /* 推：官网没给深色表面阶梯 */
      '--cw-paper-2': '#262625',  /* 推 */
      '--cw-paper-3': '#333230',  /* 推 */
      '--cw-ink-0': '#faf9f5',    /* swatch--ivory-light   正文（官网深底上的字） */
      '--cw-ink-1': '#d1cfc5',    /* swatch--cloud-light   次文字 */
      '--cw-ink-2': '#b0aea5',    /* swatch--cloud-medium  弱文字（官网 text-agate 就是它） */
      '--cw-ink-3': '#3d3d3a',    /* swatch--slate-medium  极弱 / 分隔线 */
      '--cw-clay': '#d97757',     /* swatch--clay */
    },
    extra: {
      '--cw-line': 'rgba(250,249,245,.10)',        /* swatch--ivory-faded-10 #faf9f51a */
      '--cw-line-strong': 'rgba(250,249,245,.20)', /* swatch--ivory-faded-20 #faf9f533 */
      '--cw-clay-strong': '#c6613f',               /* swatch--accent */
    },
  };

  /* 按「家族 × 明暗」组织，而不是把四套平铺成一个下拉。
     平铺的问题：样式表的明暗（CLAUDE_THEME_VARIANT）和预设自带的明暗是两个
     独立选择，用户可以选出「浅色配色 + 深色样式表」这种半新半旧的组合。
     拆成两个维度之后，明暗只有一个来源，打不起来。 */
  /* 「官网」放第一位不是排版顺手 —— defaultPresetId() 取的就是 FAMILIES[0]，
     所以第一项即默认配色。2.0.43 删掉「经典」之后由它接任。

     「暖纸」和「墨」本来就是配对写的（暖纸是浅色半、墨是深色半），合成一个
     家族而不是各占一格 —— 各占一格的话每套都缺另一半，切明暗会掉回默认。 */
  const FAMILIES = [
    { id: 'anthropic', name: '官网', light: ANTHROPIC_LIGHT, dark: ANTHROPIC_DARK },
    { id: 'paper', name: '暖纸', light: WARM_PAPER, dark: INK },
  ];

  const BUILT_IN = [ANTHROPIC_LIGHT, ANTHROPIC_DARK, WARM_PAPER, INK];

  function familyOf(presetId) {
    return FAMILIES.find(f => f.light.id === presetId || f.dark.id === presetId) ?? FAMILIES[0];
  }

  /* 下拉里要显示的全部选项：内置家族 + 我的配色。 */
  function allFamilies() {
    return [
      ...FAMILIES.map(({ id, name }) => ({ id, name })),
      { id: CUSTOM_ID, name: CUSTOM_NAME },
    ];
  }

  /* 明暗的唯一来源是「明暗」那个下拉，也就是 localStorage 里的 variant。
     预设自己的 scheme 字段只用来推导字重和阴影，不参与选择。

     必须现读 localStorage，不能读 CLAUDE_THEME_VARIANT —— 那是模块加载时
     求值一次的 const，用户改完设置它还是旧值。踩过：选「日间」之后样式表
     换成了 day，但令牌还是 dark 的，而令牌经由兼容层压过一切，
     结果界面看起来还是夜间。 */
  function currentScheme() {
    let variant = null;
    try {
      variant = preferencesFor(window).getItem('claude-web:variant');
    } catch {
      variant = null;
    }
    if (variant !== 'day' && variant !== 'night') {
      variant = typeof CLAUDE_THEME_VARIANT !== 'undefined' ? CLAUDE_THEME_VARIANT : 'day';
    }
    return variant === 'night' ? 'dark' : 'light';
  }

  /* ---------- 推导：只填了 9 个核心色时补齐其余 ---------- */

  function derive(preset) {
    const core = preset.core;
    const dark = preset.scheme === 'dark';
    const ink = core['--cw-ink-0'];
    const clay = core['--cw-clay'];

    /* 深字在浅底上显细，要补一点重量；浅字在深底上显肥，收一点。
       这是排版规律，不是随便定的，所以从 scheme 推导而不是让预设填。 */
    return {
      '--cw-color-scheme': dark ? 'dark' : 'light',
      '--cw-body-weight': dark ? '400' : '430',
      '--cw-line': `color-mix(in srgb, ${ink} 15%, transparent)`,
      '--cw-line-strong': `color-mix(in srgb, ${ink} 25%, transparent)`,
      '--cw-hero': `color-mix(in srgb, ${ink} 84%, ${core['--cw-paper-0']})`,
      '--cw-icon': ink,
      '--cw-clay-soft': `color-mix(in srgb, ${clay} ${dark ? '22%' : '18%'}, ${core['--cw-paper-0']})`,
      '--cw-clay-strong': `color-mix(in srgb, ${clay} 82%, #000)`,
      '--cw-code-surface': core['--cw-paper-2'],
      '--cw-code-ink': `color-mix(in srgb, ${clay} 70%, ${ink})`,
      '--cw-em': core['--cw-ink-1'],
      '--cw-selection': `color-mix(in srgb, ${clay} 34%, ${core['--cw-paper-0']})`,
      '--cw-scrollbar': core['--cw-ink-3'],
      '--cw-scrollbar-hover': core['--cw-ink-2'],
      '--cw-shadow-dialog': dark
        ? '0 12px 36px rgba(0,0,0,.55)' : '0 12px 36px rgba(50,45,35,.12)',
      '--cw-shadow-composer': dark
        ? '0 12px 34px rgba(0,0,0,.38)' : '0 10px 30px rgba(43,40,34,.10)',
      '--cw-shadow-floating': dark
        ? '0 16px 42px rgba(0,0,0,.44)' : '0 14px 38px rgba(43,40,34,.11)',
      '--cw-topbar-surface': core['--cw-paper-0'],
      /* 字符网格在深底上容易糊，压密一点、淡一点。 */
      '--cw-grid-opacity': dark ? '.05' : '.075',
      '--cw-grid-step': dark ? '38px' : '34px',
    };
  }

  function resolve(preset) {
    return { ...derive(preset), ...preset.core, ...(preset.extra ?? {}) };
  }

  /* ---------- 存取 ---------- */

  function readJson(key) {
    try {
      const raw = preferencesFor(window).getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function currentPresetId() {
    try {
      return preferencesFor(window).getItem(STORAGE_PRESET) || '';
    } catch {
      return '';
    }
  }

  /* 没选过预设时回落到 FAMILIES[0]，也就是「官网」。 */
  function defaultPresetId() {
    return FAMILIES[0][currentScheme()].id;
  }

  /* 存的是家族 id，不是具体预设 id —— 这样切换明暗时配色家族保持不变。

     要校验存的 id 现在还存不存在：2.0.43 删掉了「经典」，之前选过它的人
     localStorage 里还是 'classic'。不校验的话下拉会空选（找不到匹配项），
     而 activateFamily 那边有 ?? FAMILIES[0] 兜底、实际用的是默认配色 ——
     于是「显示的」和「生效的」对不上。 */
  function currentFamilyId() {
    let stored = null;
    try { stored = preferencesFor(window).getItem('claude-web:family'); } catch { /* 无痕 */ }
    if (stored === CUSTOM_ID) return stored;
    return FAMILIES.some(f => f.id === stored) ? stored : FAMILIES[0].id;
  }

  /* ---------- 自定义配色 ---------- */

  function writeJson(key, value) {
    try { preferencesFor(window).setItem(key, JSON.stringify(value)); } catch { /* 无痕 */ }
  }

  /* 读出 {light, dark}。旧的扁平格式迁移到当前明暗那一半 —— 当初就是一套值，
     无从判断它是给日间还是夜间的，只能按用户当下看到的那一半算。 */
  function customStore() {
    const raw = readJson(STORAGE_CUSTOM);
    if (!raw || typeof raw !== 'object') return { light: {}, dark: {} };
    if (raw.light || raw.dark) {
      return {
        light: (raw.light && typeof raw.light === 'object') ? raw.light : {},
        dark: (raw.dark && typeof raw.dark === 'object') ? raw.dark : {},
      };
    }
    const legacy = {};
    for (const [key, value] of Object.entries(raw)) {
      if (ALLOWED.has(key) && typeof value === 'string') legacy[key] = value;
    }
    const migrated = { light: {}, dark: {} };
    migrated[currentScheme()] = legacy;
    return migrated;
  }

  /* 自定义的取值起点：用户最后看过的内置家族。 */
  function baseFamily() {
    let id = null;
    try { id = preferencesFor(window).getItem(STORAGE_BASE); } catch { id = null; }
    return FAMILIES.find(item => item.id === id) ?? FAMILIES[0];
  }

  /* 把 {light,dark} 里的一半组装成一个正常预设，缺的核心色从起点家族补齐。
     补齐这一步是为了取色器永远有 9 个真实的初值可显示，不会出现空色块。 */
  function customPreset(scheme) {
    const half = customStore()[scheme] ?? {};
    const base = baseFamily()[scheme === 'dark' ? 'dark' : 'light'];
    const core = {};
    for (const key of CORE_KEYS) core[key] = half[key] ?? base.core[key];
    const extra = {};
    for (const [key, value] of Object.entries(half)) {
      if (EXTRA_KEYS.includes(key)) extra[key] = value;
    }
    return { id: CUSTOM_ID, name: CUSTOM_NAME, scheme, core, extra };
  }

  /* 取色器要显示的当前 9 色。 */
  function customCore() {
    return { ...customPreset(currentScheme()).core };
  }

  /* 改一个色。第一次改时把当前 9 色整体落盘 —— 这样这套方案从此自给自足，
     以后换起点家族也不会牵动已经调好的颜色。 */
  function setCustomColor(key, value) {
    if (!ALLOWED.has(key) || typeof value !== 'string') return null;
    const scheme = currentScheme();
    const store = customStore();
    store[scheme] = {
      ...customPreset(scheme).core,
      ...(store[scheme] ?? {}),
      [key]: value,
    };
    writeJson(STORAGE_CUSTOM, store);
    /* 不在自定义方案上时先切过去，否则拖了半天取色器界面纹丝不动。 */
    if (currentFamilyId() !== CUSTOM_ID) return activateFamily(CUSTOM_ID);
    apply(resolve(customPreset(scheme)));
    return customPreset(scheme);
  }

  function activateFamily(familyId, { persist = true } = {}) {
    const scheme = currentScheme();
    if (familyId === CUSTOM_ID) {
      if (persist) {
        try { preferencesFor(window).setItem('claude-web:family', CUSTOM_ID); } catch { /* 无痕 */ }
      }
      const preset = customPreset(scheme);
      apply(resolve(preset));
      return preset;
    }
    const family = FAMILIES.find(item => item.id === familyId) ?? FAMILIES[0];
    if (persist) {
      try {
        preferencesFor(window).setItem('claude-web:family', family.id);
        /* 同时记成自定义的起点：下次点进调色就是从这套色开始改。 */
        preferencesFor(window).setItem(STORAGE_BASE, family.id);
      } catch { /* 无痕 */ }
    }
    return activate(family[scheme].id, { persist: false });
  }

  function findPreset(id) {
    return BUILT_IN.find(preset => preset.id === id) ?? null;
  }

  /* data-claude-palette 记下当前是哪套预设（自定义记 custom），CSS 按预设做少量手机端微调。 */
  function apply(tokens, id = CUSTOM_ID) {
    const root = document.documentElement;
    root.dataset.claudePalette = id;
    for (const [key, value] of Object.entries(tokens)) {
      if (!ALLOWED.has(key)) continue;
      root.style.setProperty(key, String(value));
    }
  }

  function activate(id, { persist = true } = {}) {
    if (id === CUSTOM_ID) return activateFamily(CUSTOM_ID, { persist });
    const preset = findPreset(id) ?? findPreset(defaultPresetId());
    if (!preset) return null;
    /* 只套这个预设。自定义不再叠在这上面 —— 它是「风格」下拉里并列的一项，
       否则调过一次色之后切风格就几乎看不出变化。 */
    apply(resolve(preset), preset.id);
    if (persist) {
      try { preferencesFor(window).setItem(STORAGE_PRESET, preset.id); } catch { /* 无痕模式 */ }
    }
    return preset;
  }

  /* ---------- 导入导出 ---------- */

  /* 导出的是当前正在看的那一套色，自定义和内置一视同仁。 */
  function exportCurrent() {
    const scheme = currentScheme();
    const preset = currentFamilyId() === CUSTOM_ID
      ? customPreset(scheme)
      : (findPreset(familyOf(currentPresetId())[scheme].id) ?? findPreset(defaultPresetId()));
    return {
      id: `${preset.id}-export`,
      name: preset.name,
      scheme: preset.scheme,
      core: Object.fromEntries(
        CORE_KEYS.map(key => [key, preset.core[key]]).filter(([, value]) => value),
      ),
      extra: { ...(preset.extra ?? {}) },
    };
  }

  /* 导入一律走白名单。不校验的话，一个预设文件能往 :root 上塞任意变量。 */
  function importPreset(raw) {
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!data || typeof data !== 'object') throw new Error('预设文件不是一个对象。');
    const source = { ...(data.core ?? {}), ...(data.extra ?? {}) };
    const clean = {};
    const rejected = [];
    for (const [key, value] of Object.entries(source)) {
      if (ALLOWED.has(key) && typeof value === 'string') clean[key] = value;
      else rejected.push(key);
    }
    if (!Object.keys(clean).length) throw new Error('预设里没有一个可用的令牌。');
    /* 导入的东西装进「我的配色」，装进哪一半由文件自己的 scheme 决定；
       没写 scheme 就按用户当下看到的那一半算。 */
    const scheme = data.scheme === 'dark' || data.scheme === 'light'
      ? data.scheme
      : currentScheme();
    const store = customStore();
    store[scheme] = { ...customPreset(scheme).core, ...clean };
    writeJson(STORAGE_CUSTOM, store);
    activateFamily(CUSTOM_ID);
    return { applied: Object.keys(clean).length, rejected, scheme };
  }

  /* 清掉自定义，回到起点家族。两半一起清 —— 只清一半会留下日夜不成套的方案。 */
  function clearCustom() {
    try { preferencesFor(window).removeItem(STORAGE_CUSTOM); } catch { /* 无痕模式 */ }
    return activateFamily(baseFamily().id);
  }

  /* 启动时立刻套一次。放在这里而不是等 DOM ready ——
     晚一帧就会看见默认色闪一下。 */
  if (!CLAUDE_COMPAT_MODE) activateFamily(currentFamilyId(), { persist: false });

  window.__claudeWebPresets = {
    families: allFamilies,
    currentFamily: currentFamilyId,
    activateFamily,
    list: () => BUILT_IN.map(({ id, name, scheme }) => ({ id, name, scheme })),
    current: () => currentPresetId() || defaultPresetId(),
    activate,
    exportCurrent,
    importPreset,
    clearCustom,
    coreKeys: () => [...CORE_KEYS],
    customId: () => CUSTOM_ID,
    customCore,
    setCustomColor,
  };
})();

(() => {
  'use strict';

  /* 两种形态共用这一份源码：
       · 酒馆助手脚本 —— 跑在 runner 的 iframe 里，宿主是 window.parent
       · SillyTavern 扩展 —— 跑在宿主页自己身上，宿主就是 window
     构建器给扩展包注入 CLAUDE_EXTENSION_MODE=true，脚本包不注入。
     typeof 判断对未声明的标识符是安全的，脚本形态下不会抛。 */
  const extensionMode = typeof CLAUDE_EXTENSION_MODE !== 'undefined' && CLAUDE_EXTENSION_MODE;
  const compatibilityMode = typeof CLAUDE_COMPAT_MODE !== 'undefined' && CLAUDE_COMPAT_MODE;
  const hostWindow = extensionMode ? window : window.parent;
  const hostDocument = hostWindow.document;
  const INSTANCE_KEY = '__claudeIntegratedTheme';
  const STYLE_ID = 'claude-integrated-theme-live-style';
  const LAYER_ORDER_ID = 'claude-layer-order';
  const OPTION_CLASS = 'claude-integrated-theme-option';
  const THEME_NAME = CLAUDE_THEME.name;
  const LIVE_CSS = typeof CLAUDE_LIVE_CSS !== 'undefined' ? CLAUDE_LIVE_CSS : CLAUDE_THEME.custom_css;
  const THEME_VALUES = Object.fromEntries(
    Object.entries(CLAUDE_THEME).filter(([key]) => key !== 'name'),
  );
  const RESTORE_KEY = 'claude-integrated-theme-restore:v2';
  const FOREIGN_CSS_KEY = 'claude-web:foreign-theme-css:v1';
  /* 用户在 CW 下用「颜色」组的原生取色器改过的颜色，按日 / 夜分开存：
     { day: { main_text_color: 'rgba(…)' }, night: { … } }。
     只记用户亲手改的（取色器上刚有指针或键盘操作），程序写取色器属性、
     别的主题套色、CW 自己切日夜都会触发同一个 change，不能算。 */
  const USER_COLORS_KEY = 'claude-web:user-colors:v1';
  const USER_COLOR_PICKERS = {
    'main-text-color-picker': 'main_text_color',
    'italics-color-picker': 'italics_text_color',
    'underline-color-picker': 'underline_text_color',
    'quote-color-picker': 'quote_text_color',
    'shadow-color-picker': 'shadow_color',
    'chat-tint-color-picker': 'chat_tint_color',
    'blur-tint-color-picker': 'blur_tint_color',
    'border-color-picker': 'border_color',
    'user-mes-blur-tint-color-picker': 'user_mes_blur_tint_color',
    'bot-mes-blur-tint-color-picker': 'bot_mes_blur_tint_color',
  };
  const USER_COLOR_KEYS = new Set(Object.values(USER_COLOR_PICKERS));
  const pickerGestures = new Map();
  let writingPickers = false;
  let themeChoiceTimer = 0, nativeThemeChosen = false;
  let foreignCss = [];
  try { const saved = JSON.parse(hostWindow.localStorage.getItem(FOREIGN_CSS_KEY) || '[]'); if (Array.isArray(saved)) foreignCss = saved.filter(x => typeof x === 'string').slice(-24); } catch { /* private storage */ }
  const WATCHDOG_KEY = '__claudeIntegratedThemeWatchdog';
  /* 要中和的 ST 核心高开销规则。每项：来源文件怎么认、选择器靠哪些稳定标记认，
     以及（可选）删掉后换上的等价写法。replacement 放在 CW 自己的 <style> 里，
     紧跟原样式表之后，CW 销毁时和原规则的恢复一起撤掉。 */
  const HOST_REPLACEMENT_STYLE_ID = 'claude-host-rule-replacements';
  const HOST_NEUTRALIZED_RULE_SPECS = [
    {
      /* css/toggle-dependent.css 的删除模式选择器，见 isHostNeutralizedRule 上方说明。 */
      id: 'delete-mode',
      matchesSource: pathname => pathname.endsWith('/css/toggle-dependent.css'),
      marks: [
        'body.documentstyle',
        '#chat',
        '.last_mes:has(',
        '.del_checkbox[style',
        '.mes_text',
      ],
    },
    {
      /* ST 核心 public/style.css（1.14 :502、1.18 :504）：
           #chat:not([data-show-hidden-reasoning="true"]):not(:has(.reasoning_edit_textarea))
             .mes:has(.mes_reasoning:empty) .mes_reasoning_details { display: none; }
         以 #chat 为 :has 锚点，聊天区里任何增删（每段流式字）都让整个聊天区重算样式，
         CW 每条消息元素多、每个元素匹配贵，被放大（iOS出字卡顿-20261117 测量：
         Chromium 4× 30 楼每段约 47% 的主线程成本）。
         只认 ST 核心那一份 style.css：扩展目录里也常有叫 style.css 的文件，不能碰。
         换成只看当前这条消息的写法；和原规则唯一的差别是「聊天里别处在编辑推理时，
         其他空推理不再跟着显示」，已接受。特异性同为 (1,6,0)。 */
      id: 'chat-reasoning-has',
      matchesSource: pathname => {
        if (!pathname.endsWith('/style.css')) return false;
        try { return pathname === new URL('style.css', hostDocument.baseURI).pathname; } catch { return false; }
      },
      marks: ['#chat', 'reasoning_edit_textarea', 'mes_reasoning_details', ':has('],
      /* ST 1.19 上游已改成 #chat:not([…]) .mes_reasoning_details:not([data-has-content])
         :not(:has(.reasoning_edit_textarea))，:has 挂在每条推理自己身上，四个标记它也全含，
         但不贵，不能删。所以还要求 :has( 落在 #chat 自己那一段（第一个后代空格之前）。 */
      test: selector => {
        const text = selector.trim();
        if (!text.startsWith('#chat')) return false;
        let depth = 0;
        for (let index = 0; index < text.length; index += 1) {
          const char = text[index];
          if (char === '(' || char === '[') depth += 1;
          else if (char === ')' || char === ']') depth -= 1;
          else if (depth === 0 && /[\s>+~,]/.test(char)) return text.slice(0, index).includes(':has(');
        }
        return false;
      },
      replacement: '#chat:not([data-show-hidden-reasoning="true"]) .mes:not(:has(.reasoning_edit_textarea)):has(.mes_reasoning:empty) .mes_reasoning_details { display: none; }',
    },
  ];
  const INSTANCE_TOKEN = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  let destroyed = false;
  let hostPageUnloading = false;
  let retryTimer = 0;
  let disableCheckTimer = 0;
  let runnerRemovalTimer = 0;
  let runnerPresenceObserver = null;
  let compatibilityStyleOrderObserver = null;
  let compatibilityCustomStyleObserver = null;
  let observedCompatibilityCustomStyle = null;
  const compatibilityWrappedStyles = new Set();
  let neutralizedHostRules = [];
  const runnerFrame = window.frameElement;

  // Formal 2.0.147: a previous instance removes its options during destroy. Remember which controls
  // were affected before the browser auto-selects a different native option.
  const selectedMisplacedAtStart = new WeakSet([...hostDocument.querySelectorAll('select')].filter(select => select !== findThemeSelect() && [...select.selectedOptions].some(option => option.classList.contains(OPTION_CLASS))));
  hostWindow[INSTANCE_KEY]?.destroy?.({ restore: false });

  function getContext() {
    const host = typeof SillyTavern !== 'undefined' ? SillyTavern : hostWindow.SillyTavern;
    return host?.getContext?.() ?? host ?? null;
  }

  function isClaudeThemeName(value) {
    return typeof value === 'string' && (value === THEME_NAME || value.startsWith('Claude Web ·') || Object.values(CLAUDE_THEMES).some(theme => theme.name === value));
  }

  function cssFingerprint(css) {
    const text = String(css ?? ''); let a = 2166136261, b = 2246822519;
    for (let i = 0; i < text.length; i++) { const c = text.charCodeAt(i); a = Math.imul(a ^ c, 16777619); b = Math.imul(b ^ c, 3266489917); }
    return `${text.length}:${a >>> 0}:${b >>> 0}`;
  }
  function rememberForeignCss(css) {
    if (!String(css ?? '').trim()) return;
    const fingerprint = cssFingerprint(css);
    foreignCss = [...foreignCss.filter(x => x !== fingerprint), fingerprint].slice(-24);
    try { hostWindow.localStorage.setItem(FOREIGN_CSS_KEY, JSON.stringify(foreignCss)); } catch { /* retain this session */ }
  }
  function onNativeThemeChange(event) {
    const select = event.target;
    if (!(select instanceof hostWindow.HTMLSelectElement) || select !== findThemeSelect(getContext()?.powerUserSettings?.theme)) return;
    const settings = getContext()?.powerUserSettings, choice = select.value;
    if (!settings) return;
    if (isClaudeThemeName(choice) && !isClaudeThemeName(settings.theme)) rememberForeignCss(settings.custom_css);
    nativeThemeChosen = !isClaudeThemeName(choice);
    hostWindow.clearTimeout(themeChoiceTimer);
    // Run after the native direct change handler has applied its theme.
    themeChoiceTimer = hostWindow.setTimeout(() => {
      themeChoiceTimer = 0;
      if (destroyed || select.value !== choice) return;
      if (!isClaudeThemeName(choice)) { rememberForeignCss(getContext()?.powerUserSettings?.custom_css); return; }
      const variant = Object.keys(CLAUDE_THEMES).find(key => CLAUDE_THEMES[key].name === choice);
      if (variant) {
        const control = hostDocument.getElementById('claude-web-variant');
        if (control && control.value !== variant) { control.value = variant; control.dispatchEvent(new hostWindow.Event('change', { bubbles: true })); }
        applyThemeValuesFor(variant, true);
      } else persistFullTheme({ resetTheme: true });
    }, 0);
  }

  function readUserColorStore() {
    try {
      const saved = JSON.parse(hostWindow.localStorage.getItem(USER_COLORS_KEY) || '{}');
      return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
    } catch {
      return {};
    }
  }

  function userColorsFor(variant, store = readUserColorStore()) {
    const set = store[variant];
    if (!set || typeof set !== 'object') return {};
    return Object.fromEntries(Object.entries(set).filter(([key, value]) => USER_COLOR_KEYS.has(key) && typeof value === 'string' && value));
  }

  function writeUserColors(variant, colors) {
    const store = readUserColorStore();
    if (Object.keys(colors).length) store[variant] = colors; else delete store[variant];
    try { hostWindow.localStorage.setItem(USER_COLORS_KEY, JSON.stringify(store)); } catch { /* private storage */ }
  }

  function liveVariant() {
    const variant = hostDocument.documentElement.dataset.claudeIntegratedTheme;
    return CLAUDE_THEMES[variant] ? variant : CLAUDE_THEME_VARIANT;
  }

  function colorPickerIn(event) {
    for (const node of event.composedPath?.() ?? []) {
      if (node instanceof hostWindow.Element && node.localName === 'toolcool-color-picker' && USER_COLOR_PICKERS[node.id]) return node;
    }
    return null;
  }

  function onPickerGesture(event) {
    if (event.type === 'pointermove' && !event.buttons) return;
    const picker = colorPickerIn(event);
    if (picker) pickerGestures.set(picker.id, Date.now());
  }

  function onPickerChange(event) {
    const picker = event.target, key = USER_COLOR_PICKERS[picker?.id];
    if (!key || writingPickers || picker.localName !== 'toolcool-color-picker') return;
    if (Date.now() - (pickerGestures.get(picker.id) || 0) > 2000) return;
    const settings = getContext()?.powerUserSettings, value = event.detail?.rgba;
    if (!settings || !isClaudeThemeName(settings.theme) || typeof value !== 'string' || !value) return;
    const variant = liveVariant();
    writeUserColors(variant, { ...userColorsFor(variant), [key]: value });
  }

  // 取色器的色块要跟实际套上的颜色一致（切日夜、恢复默认后），否则用户看到的是上一套。
  function syncColorPickers(settings) {
    writingPickers = true;
    try {
      for (const [id, key] of Object.entries(USER_COLOR_PICKERS)) {
        // 用户在弹层里改色不会改 color 属性，要按取色器当前实际颜色比。
        const picker = hostDocument.getElementById(id), value = settings[key];
        if (!picker || typeof value !== 'string' || !value) continue;
        let shown = '';
        try { shown = picker.rgba || picker.getAttribute('color') || ''; } catch { shown = picker.getAttribute('color') || ''; }
        if (String(shown).replace(/\s+/g, '') !== value.replace(/\s+/g, '')) picker.setAttribute('color', value);
      }
    } finally {
      writingPickers = false;
    }
  }

  // 「恢复默认颜色」：只清当前日或夜那一套，立刻按主题默认重套。
  function resetUserColors(variant = liveVariant()) {
    writeUserColors(variant, {});
    const settings = getContext()?.powerUserSettings, theme = CLAUDE_THEMES[variant];
    if (!settings || !theme || !isClaudeThemeName(settings.theme)) return false;
    for (const key of USER_COLOR_KEYS) if (Object.hasOwn(theme, key)) settings[key] = theme[key];
    return applyThemeValuesFor(variant);
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

  function wrapImportsForThemeLayer(css) {
    const imports = [];
    const body = String(css || '').replace(
      /@import\s+(url\(\s*(?:"[^"]*"|'[^']*'|[^)]*)\s*\)|"[^"]*"|'[^']*')\s*([^;]*);/gi,
      (_statement, source, qualifiers = '') => {
        const tail = String(qualifiers).replace(/\blayer(?:\([^)]*\))?/gi, '').trim();
        imports.push(`@import ${source} layer(st-theme)${tail ? ` ${tail}` : ''};`);
        return '';
      },
    );
    return `${imports.length ? `${imports.join('\n')}\n` : ''}@layer st-theme {\n${body}\n}`;
  }

  function wrapCompatibilityCustomStyle(customStyle) {
    if (!compatibilityMode || destroyed || !customStyle) return;
    const current = customStyle.textContent || '';
    if (current === customStyle.__claudeCompatWrappedCss) return;
    const raw = current;
    const wrapped = wrapImportsForThemeLayer(raw);
    customStyle.__claudeCompatRawCss = raw;
    customStyle.__claudeCompatWrappedCss = wrapped;
    compatibilityWrappedStyles.add(customStyle);
    if (current !== wrapped) customStyle.textContent = wrapped;
  }

  function observeCompatibilityCustomStyle(customStyle) {
    if (observedCompatibilityCustomStyle === customStyle) return;
    compatibilityCustomStyleObserver?.disconnect();
    compatibilityCustomStyleObserver = null;
    observedCompatibilityCustomStyle = customStyle || null;
    if (!customStyle) return;
    compatibilityCustomStyleObserver = new hostWindow.MutationObserver(() => {
      hostWindow.queueMicrotask(() => wrapCompatibilityCustomStyle(customStyle));
    });
    compatibilityCustomStyleObserver.observe(customStyle, { childList: true, characterData: true, subtree: true });
  }

  function ensureCompatibilityLayers() {
    if (!compatibilityMode || destroyed || !hostDocument.head) return;
    let layerOrder = hostDocument.getElementById(LAYER_ORDER_ID);
    if (!layerOrder) {
      layerOrder = hostDocument.createElement('style');
      layerOrder.id = LAYER_ORDER_ID;
    }
    /* 2.0.92：不再把外部美化包进 st-theme 层。
       层叠里有一条反直觉的规则：**未分层的作者样式在普通声明上胜过任何命名层**。
       酒馆自己的 style.css 就是未分层的，而美化 JSON 的 custom_css 本来也是未分层、
       且排在 style.css 之后，所以它能正常盖过酒馆默认值。一旦我们把它包进 st-theme，
       它就掉到 style.css 下面 —— 主题里所有没写 !important 的规则集体失效。
       雨中曲的 `.mes{padding-top:300px}` 和 `.mes::before{顶部装饰图}` 就是这么没的：
       实测 .mes 的 padding 是酒馆默认的 14px 12px，::before 的 content 是 normal。

       框架自己留在 cw-frame 层就够用：对 !important 声明，层的优先级是倒过来的，
       命名层的 !important 胜过未分层的 !important，所以框架照样压得住主题，
       而主题和酒馆之间的关系回到它本来的样子。 */
    if (layerOrder.textContent !== '@layer cw-frame;') {
      layerOrder.textContent = '@layer cw-frame;';
    }
    if (hostDocument.head.firstChild !== layerOrder) hostDocument.head.prepend(layerOrder);
    /* 把旧版本（≤2.0.91）包过的 #custom-style 还原回去。 */
    unwrapCompatibilityCustomStyle(hostDocument.getElementById('custom-style'));
  }

  /* 只做还原，不再包装。留着是为了从 2.0.91 及更早版本升上来时，
     页面里那份已经被包进 st-theme 的 custom_css 能立刻恢复。 */
  function unwrapCompatibilityCustomStyle(customStyle) {
    if (!customStyle) return;
    const text = customStyle.textContent || '';
    if (!/@layer\s+st-theme\s*\{/.test(text)) return;
    const raw = typeof customStyle.__claudeCompatRawCss === 'string'
      ? customStyle.__claudeCompatRawCss
      : text
        .replace(/@import\s+([^;]*?)\s+layer\(st-theme\)([^;]*);/gi, (_m, source, tail) => `@import ${source}${tail};`)
        .replace(/@layer\s+st-theme\s*\{([\s\S]*)\}\s*$/i, '$1');
    delete customStyle.__claudeCompatRawCss;
    delete customStyle.__claudeCompatWrappedCss;
    compatibilityWrappedStyles.delete(customStyle);
    if (raw !== text) customStyle.textContent = raw;
  }

  function restoreCompatibilityLayers() {
    compatibilityCustomStyleObserver?.disconnect();
    compatibilityCustomStyleObserver = null;
    observedCompatibilityCustomStyle = null;
    for (const customStyle of compatibilityWrappedStyles) {
      if (customStyle?.isConnected && typeof customStyle.__claudeCompatRawCss === 'string'
        && customStyle.textContent === customStyle.__claudeCompatWrappedCss) {
        customStyle.textContent = customStyle.__claudeCompatRawCss;
      }
      if (customStyle) {
        delete customStyle.__claudeCompatRawCss;
        delete customStyle.__claudeCompatWrappedCss;
      }
    }
    compatibilityWrappedStyles.clear();
    hostDocument.getElementById(LAYER_ORDER_ID)?.remove();
  }

  function watchCompatibilityLayers() {
    if (!compatibilityMode || compatibilityStyleOrderObserver) return;
    ensureCompatibilityLayers();
    compatibilityStyleOrderObserver = new hostWindow.MutationObserver(() => {
      hostWindow.queueMicrotask(ensureCompatibilityLayers);
    });
    compatibilityStyleOrderObserver.observe(hostDocument.head, { childList: true });
  }

  /* SillyTavern's delete-mode stylesheet contains a selector shaped like:
       .last_mes:has(> .del_checkbox[style*="display: block"]) .mes_text

     The checkbox's inline display state makes every unrelated inline-style
     write enter expensive :has() invalidation. A reversible same-page A/B on
     a long chat measured roughly 70ms before removal and 2ms after it.

     2.0.59-2.0.119 used a global "[style" scan. That also deleted legitimate
     third-party selectors such as .del_checkbox[style="display: block"] from
     extension user.css files, breaking plugins that lock or stack messages.

     Keep the performance workaround, but only for SillyTavern's own
     css/toggle-dependent.css and only for the known delete-mode selector.
     CSSOM serialization may change quotes/spacing, so match stable structural
     marks instead of the attribute value while still requiring the core URL.

     测试线 345 之后（2026-11-17）判定扩成 HOST_NEUTRALIZED_RULE_SPECS 一张表（删除模式这一项行为不变），
     删除、日志、恢复共用下面这一套。 */
  function hostNeutralizedRuleSpec(rule, source) {
    let pathname = '';
    try { pathname = new URL(source, hostDocument.baseURI).pathname; } catch { return null; }
    const selector = typeof rule?.selectorText === 'string'
      ? rule.selectorText
      : (rule?.cssText || '').split('{')[0];
    if (!selector) return null;
    return HOST_NEUTRALIZED_RULE_SPECS.find(spec => spec.matchesSource(pathname)
      && spec.marks.every(mark => selector.includes(mark))
      && (!spec.test || spec.test(selector))) || null;
  }

  function collectStyleAttributeRules(parent, source, removed, sheet = parent) {
    let rules;
    try { rules = parent.cssRules; } catch { return; }
    if (!rules) return;
    for (let index = rules.length - 1; index >= 0; index -= 1) {
      const rule = rules[index];
      /* Chromium now exposes an empty cssRules list on ordinary CSSStyleRule
         objects as part of CSS nesting support. Checking only for the
         property's existence therefore misclassified every normal selector
         as a grouping rule and skipped it in 2.0.59/2.0.60. Test the selector
         before descending, and recurse only when child rules actually exist. */
      const spec = hostNeutralizedRuleSpec(rule, source);
      if (spec) {
        const cssText = rule.cssText;
        try {
          parent.deleteRule(index);
          removed.push({ parent, index, cssText, source, spec, sheet });
        } catch {
          // A read-only sheet is harmless; leave it intact and continue.
        }
        continue;
      }
      let childRules = null;
      try { childRules = rule.cssRules; } catch { childRules = null; }
      if (childRules?.length) {
        collectStyleAttributeRules(rule, source, removed, sheet);
      }
    }
  }

  /* 替代写法单独放一个 CW 的 <style>，插在原样式表节点后面，层叠位置和原规则基本一致
     （之后的主题 / 扩展 / 自定义 CSS 仍然能覆盖它）。按 id 复用，反复中和不会重复插。 */
  function syncHostRuleReplacements() {
    const entries = neutralizedHostRules.filter(entry => entry.spec?.replacement);
    let node = hostDocument.getElementById(HOST_REPLACEMENT_STYLE_ID);
    if (!entries.length) { node?.remove(); return; }
    const text = [...new Set(entries.map(entry => entry.spec.replacement))].join('\n');
    if (!node) {
      node = hostDocument.createElement('style');
      node.id = HOST_REPLACEMENT_STYLE_ID;
    }
    if (node.textContent !== text) node.textContent = text;
    const anchor = entries[0].sheet?.ownerNode;
    if (anchor?.isConnected && anchor.parentNode) {
      if (anchor.nextSibling !== node) anchor.after(node);
    } else if (!node.isConnected) {
      hostDocument.head.append(node);
    }
  }

  function neutralizeStyleAttributeRules() {
    const removed = [];
    for (const sheet of hostDocument.styleSheets) {
      collectStyleAttributeRules(sheet, sheet.href || '<style>', removed);
    }
    if (!removed.length) return 0;
    neutralizedHostRules.push(...removed);
    syncHostRuleReplacements();
    /* 聊天消息数一并记下：Chromium 对 #chat 的「受 :has 影响」标记是粘着的，
       聊天渲染过之后再删 chat-reasoning-has 那条，同一页里不生效，要刷新。 */
    console.info(
      '[Claude Web] 已中和 ' + removed.length + ' 条 ST 核心高开销选择器：',
      removed.map(entry => ({ id: entry.spec.id, source: entry.source, rule: entry.cssText })),
      { chatMessages: hostDocument.querySelectorAll('#chat > .mes').length },
    );
    return removed.length;
  }

  function restoreStyleAttributeRules() {
    for (const entry of [...neutralizedHostRules].reverse()) {
      try { entry.parent.insertRule(entry.cssText, entry.index); } catch { /* detached/read-only sheet */ }
    }
    neutralizedHostRules = [];
    hostDocument.getElementById(HOST_REPLACEMENT_STYLE_ID)?.remove();
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
    else {
      element.value = String(value);
      if (element.matches('input[type="range"]')) {
        for (const counter of hostDocument.querySelectorAll('input[data-for="' + element.id + '"]')) counter.value = element.value;
      }
    }
  }

  function findThemeSelect() {
    // Theme names also occur in provider lists. Never discover a theme by option text.
    return [...hostDocument.querySelectorAll('#themes,#theme_select,#theme-select,#ui_theme,#ui-theme')]
      .find(select => select instanceof hostWindow.HTMLSelectElement && !select.multiple) ?? null;
  }
  const warnedMisplacedThemeSelects = new WeakSet();
  function cleanupMisplacedThemeOptions() {
    const themeSelect = findThemeSelect(), context = getContext();
    const ccs = context?.chatCompletionSettings, text = context?.textCompletionSettings;
    const saved = {
      chat_completion_source: ccs?.chat_completion_source,
      openrouter_providers_chat: ccs?.openrouter_providers,
      openrouter_providers_text: text?.openrouter_providers,
      nanogpt_provider: ccs?.nanogpt_provider,
      tts_provider: context?.extensionSettings?.tts?.currentProvider
    };
    const ownName = value => isClaudeThemeName(value) || Object.values(CLAUDE_THEMES).some(theme => theme.name === value);
    const needsReselect = [];
    for (const select of hostDocument.querySelectorAll('select')) {
      if (select === themeSelect) continue;
      const owned = [...select.options].filter(option => option.classList.contains(OPTION_CLASS));
      const wasSelected = selectedMisplacedAtStart.has(select) || owned.some(option => option.selected) || Object.hasOwn(saved, select.id) && [...select.selectedOptions].some(option => ownName(option.value));
      const value = saved[select.id], values = Array.isArray(value) ? value : value == null ? null : [value];
      const corrupt = values?.some(ownName);
      selectedMisplacedAtStart.delete(select);
      owned.forEach(option => option.remove());
      if (wasSelected || corrupt) {
        const known = values && !corrupt && values.every(v => [...select.options].some(option => option.value === String(v)));
        if (known && (select.multiple || values.length === 1)) {
          for (const option of select.options) option.selected = values.some(v => String(v) === option.value);
        } else {
          // Removing a selected option otherwise silently picks the first native source.
          for (const option of select.options) option.selected = false;
          select.selectedIndex = -1;
        }
        if ((!known || corrupt) && !warnedMisplacedThemeSelects.has(select)) {
          warnedMisplacedThemeSelects.add(select);
          needsReselect.push(select.id);
        }
      }
    }
    if (needsReselect.length) {
      const labels = {chat_completion_source:'对话补全来源',openrouter_providers_chat:'OpenRouter（对话补全）',openrouter_providers_text:'OpenRouter（文本补全）',nanogpt_provider:'NanoGPT 服务商',tts_provider:'TTS 服务商'};
      const names = needsReselect.map(id => labels[id] || '其他下拉框').join('、');
      const message = '旧版 CW 的主题选项影响了以下设置：' + names + '。已清除错误选项，请重新选择正确的来源或服务商。';
      if (hostWindow.toastr?.warning) hostWindow.toastr.warning(message, '请重新选择受影响的设置');
      else hostWindow.__claudeSafety?.notify?.(message);
    }
  }

  function syncControls(settings, previousName, installThemeOption = true) {
    cleanupMisplacedThemeOptions();
    const controls = {
      '#blur_strength': settings.blur_strength,
      '#shadow_width': settings.shadow_width,
      '#font_scale': settings.font_scale,
      '#chat_width': settings.chat_width,
      '#chat_width_slider': settings.chat_width,
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
    if (customCss && customCss.value !== String(settings.custom_css ?? '')) {
      customCss.value = String(settings.custom_css ?? '');
      customCss.dispatchEvent(new hostWindow.Event('input', { bubbles: true }));
    }

    const themeSelect = findThemeSelect(previousName);
    if (themeSelect) {
      const ownName = isClaudeThemeName(settings.theme) ? settings.theme : THEME_NAME;
      let option = [...themeSelect.options].find(item => item.value === ownName);
      if (!option && installThemeOption) {
        option = hostDocument.createElement('option');
        option.className = OPTION_CLASS;
        option.value = ownName;
        option.textContent = ownName;
        themeSelect.append(option);
      }
      const targetTheme = installThemeOption ? ownName : String(settings.theme ?? '');
      if ([...themeSelect.options].some(item => item.value === targetTheme)) themeSelect.value = targetTheme;
    }
  }

  function valuesWithPreservedQuote(settings, values, resetTheme = false, variant = CLAUDE_THEME_VARIANT) {
    const next = { ...values };
    /* 用户颜色按日 / 夜各自的存档套上；选回 CW 主题（resetTheme）也照样套，
       它们独立存在 CW 自己的设置里，不会是别的主题带来的。 */
    const colorStore = readUserColorStore(), userColors = userColorsFor(variant, colorStore);
    for (const [key, value] of Object.entries(userColors)) if (Object.hasOwn(next, key)) next[key] = value;
    if (!resetTheme && isClaudeThemeName(settings?.theme)) {
      // Keep the established non-color user overrides; colors come from the per-variant store above.
      for (const key of ['font_scale', 'chat_width', 'timer_enabled', 'timestamps_enabled', 'timestamp_model_icon', 'mesIDDisplay_enabled', 'message_token_count_enabled', 'hideChatAvatars_enabled', 'expand_message_actions', 'show_swipe_num_all_messages', 'click_to_edit', 'reasoning_auto_expand', 'compact_input_area', 'hotswap_enabled', 'enableZenSliders', 'enableLabMode', 'reduced_motion', 'media_display', 'toastr_position']) {
        if (Object.hasOwn(settings, key) && Object.hasOwn(next, key)) next[key] = settings[key];
      }
      const css = String(settings.custom_css ?? ''), snapshot = readRestorePoint();
      const fromNativeSnapshot = snapshot && !isClaudeThemeName(snapshot.theme) && css.trim() && css === snapshot.custom_css;
      if (!fromNativeSnapshot && !foreignCss.includes(cssFingerprint(css))) {
        const base = Object.values(CLAUDE_THEMES).find(theme => css.startsWith(theme.custom_css));
        next.custom_css = base ? String(values.custom_css ?? '') + css.slice(base.custom_css.length) : css;
      }
    }
    /* 引号颜色的先后：「引号用正文颜色」开着时这条规则优先（跟随正文，含用户改的正文色）；
       关着时用户在这一套里存的引号色优先；都没有时沿用旧规则——保留当前不是 CW 默认的引号色，
       但另一套（日 / 夜）存的用户引号色不跨过来。 */
    if (hostDocument.documentElement.dataset.claudeQuoteBodyColor !== 'off') {
      next.quote_text_color = next.main_text_color ?? values.quote_text_color;
      return next;
    }
    if (userColors.quote_text_color) return next;
    const current = settings?.quote_text_color;
    const defaults = typeof CLAUDE_THEMES !== 'undefined'
      ? Object.values(CLAUDE_THEMES).map(theme => theme?.quote_text_color).filter(Boolean)
      : [values.quote_text_color].filter(Boolean);
    const isClaudeDefault = defaults.some(value => valuesMatch(current, value));
    const fromOtherSet = Object.values(colorStore).some(set => set && valuesMatch(set.quote_text_color, current));
    if (current != null && current !== '' && !isClaudeDefault && !fromOtherSet) next.quote_text_color = current;
    return next;
  }

  function persistFullTheme({ resetTheme = false } = {}) {
    const context = getContext();
    const settings = context?.powerUserSettings;
    if (!settings) return null;

    const previousName = settings.theme;
    rememberRestorePoint(settings);
    const values = valuesWithPreservedQuote(settings, THEME_VALUES, resetTheme);
    const changed = settings.theme !== THEME_NAME
      || Object.entries(values).some(([key, value]) => !valuesMatch(settings[key], value));
    Object.assign(settings, values);
    settings.theme = THEME_NAME;
    applyCssVariables(settings);
    applyUiState(settings);
    syncControls(settings, previousName);
    syncColorPickers(settings);
    context.saveSettingsDebounced?.();
    return changed;
  }

  /* Bug 2：运行时（跟随系统/按时间自动切换）换明暗只走了设置面板那边的
     applyVariantLive()——换了 <link href> 和 dataset.claudeIntegratedTheme，
     就完了。没人告诉这里（主题运行时模块）"该换的其实是 night 那一套值"。
     这个模块自己的 THEME_VALUES/THEME_NAME 是脚本刚加载那一刻，按当时的
     variant 算出来的 const，之后不会自己变——于是 powerUserSettings.theme、
     custom_css、主题下拉框全部继续停在启动时那个明暗，跟已经切换过去的
     样式表对不上：界面已经是夜间，下拉框和酒馆自己的主题记录还留着日间。
     这里补一个能接受"目标 variant"的入口，从 CLAUDE_THEMES 里现查一份新值
     再走一遍 persistFullTheme 同一套流程（写 powerUserSettings、CSS 变量、
     UI 状态、下拉框、保存），暴露成 api.applyVariant，供设置面板在切换
     明暗后调用，两边真正共用同一个真相来源。 */
  function applyThemeValuesFor(variant, resetTheme = false) {
    const theme = typeof CLAUDE_THEMES !== 'undefined' ? CLAUDE_THEMES?.[variant] : null;
    if (!theme) return false;
    const context = getContext();
    const settings = context?.powerUserSettings;
    if (!settings) return false;
    const previousName = settings.theme;
    rememberRestorePoint(settings);
    const values = valuesWithPreservedQuote(
      settings,
      Object.fromEntries(Object.entries(theme).filter(([key]) => key !== 'name')),
      resetTheme,
      variant,
    );
    Object.assign(settings, values);
    settings.theme = theme.name;
    applyCssVariables(settings);
    applyUiState(settings);
    syncControls(settings, previousName);
    syncColorPickers(settings);
    context.saveSettingsDebounced?.();
    return true;
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

  /* 从完整模式切到兼容模式时，只在当前确实还是 Claude 主题且存在启用前快照时
     恢复一次。不能复用 restorePreviousTheme() 的无快照兜底：那个兜底会清空
     custom_css，而兼容模式恰恰要保住用户刚导入的外部美化。 */
  function releaseClaudeThemeForCompatibility() {
    const context = getContext();
    const settings = context?.powerUserSettings;
    const snapshot = readRestorePoint();
    if (!settings || !snapshot || !isClaudeThemeName(settings.theme)) return false;
    const previousName = settings.theme;
    Object.assign(settings, snapshot);
    applyCssVariables(settings);
    applyUiState(settings);
    syncControls(settings, previousName, false);
    const themeSelect = findThemeSelect(previousName);
    const target = String(snapshot.theme ?? '');
    if (themeSelect instanceof hostWindow.HTMLSelectElement
      && [...themeSelect.options].some(option => option.value === target)) {
      themeSelect.value = target;
      themeSelect.dispatchEvent(new hostWindow.Event('change', { bubbles: true }));
    }
    try { hostWindow.localStorage.removeItem(RESTORE_KEY); } catch { /* no-op */ }
    context.saveSettingsDebounced?.();
    return true;
  }

  function removeRuntimeArtifacts() {
    try { hostWindow.__claudeClawdInteraction?.destroy?.(); } catch { /* iframe may already be detaching */ }
    hostDocument.getElementById('form_sheld')?.style.removeProperty('--cl-mobile-composer-translate-y');
    hostDocument.getElementById(STYLE_ID)?.remove();
    hostDocument.getElementById(LAYER_ORDER_ID)?.remove();
    hostDocument.getElementById('claude-clawd-interaction-style')?.remove();
    hostDocument.querySelectorAll(`option.${OPTION_CLASS}`).forEach(option => option.remove());
    hostDocument.querySelectorAll([
      '.clawd-mobile-chrome',
      '.clawd-mobile-scrim',
      '.clawd-mobile-new-chat',
      '.clawd-android-keyboard-pan-anchor',
      '.clawd-character-menu',
      '.clawd-character-switcher',
      '.clawd-rail-brand',
      '.clawd-rail-grip',
      '.claude-user-message-actions',
      '.claude-swipe-left-proxy',
      '.claude-swipe-right-proxy',
      '.cw-cl-swipes',
      '.claude-reroll-button',
      '.clawd-signoff-button',
    ].join(',')).forEach(element => element.remove());
    hostDocument.body?.classList.remove(
      'clawd-interactive-ready',
      'claude-generation-active',
      'clawd-mobile-layout',
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
            var ids = [styleId, 'claude-layer-order', 'claude-clawd-interaction-style'];
            ids.forEach(function (id) { var node = doc.getElementById(id); if (node) node.remove(); });
            var customStyle = doc.getElementById('custom-style');
            if (customStyle && typeof customStyle.__claudeCompatRawCss === 'string') {
              customStyle.textContent = customStyle.__claudeCompatRawCss;
              try { delete customStyle.__claudeCompatRawCss; delete customStyle.__claudeCompatWrappedCss; } catch (_) {}
            }
            doc.querySelectorAll('option.' + optionClass).forEach(function (node) { node.remove(); });
            doc.querySelectorAll('.clawd-mobile-chrome,.clawd-mobile-scrim,.clawd-mobile-new-chat,.clawd-android-keyboard-pan-anchor,.clawd-character-menu,.clawd-character-switcher,.clawd-rail-brand,.clawd-rail-grip,.claude-user-message-actions,.claude-swipe-left-proxy,.claude-swipe-right-proxy,.claude-reroll-button,.clawd-signoff-button').forEach(function (node) { node.remove(); });
            if (body) body.classList.remove('clawd-interactive-ready','claude-generation-active','clawd-mobile-layout','clawd-tauritavern-host','clawd-welcome','clawd-has-recents');
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
    if (compatibilityMode) ensureCompatibilityLayers();
    installLiveStyle();
    neutralizeStyleAttributeRules();
    if (compatibilityMode) {
      releaseClaudeThemeForCompatibility();
      watchCompatibilityLayers();
      return;
    }
    const changed = persistFullTheme();
    if (changed === null && attempt < 12) {
      retryTimer = hostWindow.setTimeout(() => start(attempt + 1), 250);
      return;
    }
    hostWindow.setTimeout(() => {
      if (!destroyed && !nativeThemeChosen) {
        neutralizeStyleAttributeRules();
        persistFullTheme();
      }
    }, 800);
  }

  function destroy({ restore = false } = {}) {
    if (destroyed) return;
    hostWindow.clearTimeout(themeChoiceTimer);
    hostDocument.removeEventListener('change', onNativeThemeChange, true);
    hostDocument.removeEventListener('change', onPickerChange, true);
    for (const type of PICKER_GESTURES) hostDocument.removeEventListener(type, onPickerGesture, true);
    compatibilityStyleOrderObserver?.disconnect();
    compatibilityStyleOrderObserver = null;
    restoreCompatibilityLayers();
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
    window.removeEventListener('pageshow', handleRunnerPageShow);
    restoreStyleAttributeRules();
    removeRuntimeArtifacts();
    if (hostWindow[INSTANCE_KEY] === api) delete hostWindow[INSTANCE_KEY];
    if (restore && !compatibilityMode) restorePreviousTheme();
  }

  function markHostPageUnloading() {
    hostPageUnloading = true;
  }

  function handleRunnerPageHide(event) {
    if (extensionMode && (event?.persisted || event?.originalEvent?.persisted)) return;
    if (hostPageUnloading && !extensionMode) {
      destroy({ restore: false });
      return;
    }
    /* pagehide is TavernHelper's documented script-disable hook. Cleanup must be
       synchronous: delaying it means Via can destroy this realm before it runs. */
    destroy({ restore: true });
  }

  function handleRunnerPageShow(event) {
    if (!extensionMode || !event?.persisted || destroyed) return;
    hostPageUnloading = false;
    /* once 监听器在进入 bfcache 时也会被消费；页面恢复后重新装一份，保证之后
       真正刷新或关闭扩展仍会同步恢复进入前主题。 */
    window.addEventListener('pagehide', handleRunnerPageHide, { once: true });
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

  const api = {
    token: INSTANCE_TOKEN,
    destroy,
    apply: compatibilityMode ? () => false : persistFullTheme,
    applyVariant: compatibilityMode ? () => false : applyThemeValuesFor,
    resetUserColors: compatibilityMode ? () => false : resetUserColors,
  };
  hostWindow[INSTANCE_KEY] = api;
  const PICKER_GESTURES = ['pointerdown', 'pointermove', 'pointerup', 'keydown', 'wheel'];
  if (!compatibilityMode) {
    hostDocument.addEventListener('change', onNativeThemeChange, true);
    hostDocument.addEventListener('change', onPickerChange, true);
    for (const type of PICKER_GESTURES) hostDocument.addEventListener(type, onPickerGesture, { capture: true, passive: true });
  }
  hostWindow.addEventListener('beforeunload', markHostPageUnloading, true);
  hostWindow.addEventListener('pagehide', markHostPageUnloading, true);
  watchRunnerPresence();
  installHostWatchdog();
  $(start);
  window.addEventListener('pagehide', handleRunnerPageHide, { once: true });
  window.addEventListener('pageshow', handleRunnerPageShow);
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
  const frameworkCompatibilityMode = typeof CLAUDE_COMPAT_MODE !== 'undefined' && CLAUDE_COMPAT_MODE;
  const EMPTY_CLASS = 'claude-empty-assistant';
  const GENERATING_CLASS = 'claude-generation-active';
  const BUTTON_CLASS = 'clawd-signoff-button';
  const COMPOSER_CLAWD_CLASS = 'clawd-composer-clawd';
  const SIGNOFF_CLAWD_CLASS = 'clawd-message-signoff-clawd';
  const LEFT_SWIPE_PROXY_CLASS = 'claude-swipe-left-proxy';
  const SWIPE_PROXY_CLASS = 'claude-swipe-right-proxy';
  const REROLL_CLASS = 'claude-reroll-button';
  const CLASSIC_BAR_SWIPES_CLASS = 'cw-cl-swipes';
  let generationStartSeq = 0;
  const PRESET_REASONING_CLASS = 'claude-has-preset-reasoning';
  const SWIPE_VIEW_CLASS = 'claude-swipe-in-viewport';
  const USER_ACTIONS_CLASS = 'claude-user-message-actions';
  const PROMPT_DRAG_HANDLE_CLASS = 'clawd-prompt-drag-handle';
  const PROMPT_DRAG_GLYPH_CLASS = 'clawd-prompt-drag-glyph';
  /* R3「表面自持」在 2.0.86 拆掉了。它存在的理由是属性过滤器把外壳的背景色筛掉了，
     于是要靠注入一个背板子元素把面板重新填成不透明。生成器改成区域制之后，
     真正的 background 直接从 day-pc.css 搬过来，背板没有用了。
     这两个类名保留是为了 destroy() 能清掉旧版本残留在页面上的节点。 */
  const SURFACE_BACKING_CLASS = 'clawd-surface-backing';
  const SURFACE_HOST_CLASS = 'clawd-surface-host';
  const USER_EDIT_CLASS = 'claude-user-message-edit';
  const USER_DELETE_CLASS = 'claude-user-message-delete';
  const WELCOME_ASSISTANT_CLASS = 'claude-welcome-clawd-assistant';
  const WELCOME_PROMPT_CLASS = 'claude-welcome-prompt';
  const CHARACTER_SWITCHER_CLASS = 'clawd-character-switcher';
  const CHARACTER_MENU_CLASS = 'clawd-character-menu';
  const FAKE_MIC_CLASS = 'clawd-fake-mic';
  const LAST_CHARACTER_KEY = 'clawd-last-character-name';
  const LAST_HERO_KEY = 'clawd-last-hero-line';
  /* 2.0.173：侧栏开关状态挂在 body 的 data-clawd-menu 属性上，不再用 class。酒馆原生 keyboard.js 监听 body 及其
     后代的 class 变化，每变一次就在该元素子树里重新找全部可交互控件；body 的 class 一变就是全页约一万个元素。
     它只看 class，换成 data-* 属性就不会触发。CSS 里对应写 body[data-clawd-menu]（优先级和 .class 相同）。 */
  const MOBILE_MENU_ATTRIBUTE = 'data-clawd-menu';
  /* 同一原因：classList.toggle / add 即使结果不变也会重写 class 属性、产生一条变动记录，照样触发酒馆那次全页扫描。
     每次刷新都会调用的 body class 写入一律先比较，只在真的要变时才写。 */
  const setBodyClass = (name, on) => {
    const list = hostDocument.body?.classList;
    if (list && list.contains(name) !== Boolean(on)) list.toggle(name, Boolean(on));
  };
  const isMobileMenuOpen = () => hostDocument.body.hasAttribute(MOBILE_MENU_ATTRIBUTE);
  /* 「新页画好再收侧栏」的任务号（showPanelFromRail）。每次打开侧栏都换号，
     等待途中重新开关过侧栏时，旧任务看到号不对就作废。 */
  let mobileMenuCloseToken = 0;
  let mobileNavPanelCleanup = null;
  let mobileNavActivating = false;
  /* 2.0.204 推开式侧栏的合成层开关（见 official-layout.css 推开式那段）：打开前在 html 上挂 data-cw-push，让各层先停在
     translate:0 0 并强制算一次样式，滑动才从同类型的值起步、由合成器跑；收起滑完（300ms）再摘掉，各层回到 none。
     用 data 属性不用 class：改 html 的 class 属性会让页面里所有 [class*=…] 属性选择器重新匹配，一开一收各重算三千多个元素。 */
  const PUSH_LIVE_ATTRIBUTE = 'data-cw-push';
  let pushLiveTimer = 0;
  const setMobileMenuOpen = open => {
    cancelMobileMenuOpenWait();
    mobileNavPanelCleanup?.();
    if (open) mobileMenuCloseToken += 1;
    if (open === isMobileMenuOpen()) return;
    const root = hostDocument.documentElement;
    hostWindow.clearTimeout(pushLiveTimer);
    if (open) {
      if (!root.hasAttribute(PUSH_LIVE_ATTRIBUTE)) {
        root.setAttribute(PUSH_LIVE_ATTRIBUTE, '');
        void hostWindow.getComputedStyle(hostDocument.body).translate;
      }
      hostDocument.body.setAttribute(MOBILE_MENU_ATTRIBUTE, 'open');
    } else {
      hostDocument.body.removeAttribute(MOBILE_MENU_ATTRIBUTE);
      pushLiveTimer = hostWindow.setTimeout(() => {
        if (!isMobileMenuOpen()) root.removeAttribute(PUSH_LIVE_ATTRIBUTE);
      }, 320);
    }
  };
  const MOBILE_LAYOUT_CLASS = 'clawd-mobile-layout';
  const VIRTUAL_KEYBOARD_OVERLAY_CLASS = 'clawd-virtual-keyboard-overlay';
  const ANDROID_KEYBOARD_PAN_ANCHOR_CLASS = 'clawd-android-keyboard-pan-anchor';
  const TAURITAVERN_HOST_CLASS = 'clawd-tauritavern-host';
  const MOBILE_COMPOSER_HEIGHT_PROPERTY = '--cl-mobile-composer-height';
  const MOBILE_COMPOSER_TRANSLATE_PROPERTY = '--cl-mobile-composer-translate-y';
  const MOBILE_VIEWPORT_HEIGHT_PROPERTY = '--cl-mobile-viewport-height';
  const MOBILE_VIEWPORT_TOP_PROPERTY = '--cl-mobile-viewport-top';
  const MOBILE_POPUP_HEIGHT_PROPERTY = '--cl-mobile-popup-height';
  const STYLE_ID = 'claude-clawd-interaction-style';
  const THEME_LIVE_STYLE_ID = 'claude-integrated-theme-live-style';
  const CHARACTER_MANAGER_SELECTOR = '#charManagerModal';
  const EXTERNAL_MODAL_OPEN_CLASS = 'clawd-external-modal-open';
  const EXTERNAL_MODAL_SELECTOR = [
    '[role="dialog"]',
    '[aria-modal="true"]',
    'dialog[open]',
    '[class*="modal-backdrop" i]',
    '[class*="modal_backdrop" i]',
    '[class*="modal-overlay" i]',
    '[class*="modal_overlay" i]',
    '[class*="popup-backdrop" i]',
    '[class*="popup_backdrop" i]',
  ].join(',');
  const EMBED_STYLE_ID = 'claude-embedded-surface-style';
  const EMBED_ATTRIBUTE = 'data-claude-transparent-surface';
  const EMBED_SRCDOC_MARKER = '<!-- claude-transparent-surface -->';
  const REGEX_SURFACE_CLASS = 'claude-transparent-regex-surface';
  const TYPING_MOTION_CLASSES = [
    'clawd-cheer',
    'clawd-wobble-sway',
    'clawd-wobble-tilt',
    'clawd-typing-click',
  ];

  const CLAWD_IMAGE =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAABf0lEQVR4nO3cwUkDURRG4enHEtzEvfshHQgWcLcpJfbhIl3crZ1EAoIgeTEBzfzR78DZ5TF33plFmJA3TQAAAAAAAAAAAAAAAAAAAAAAAAAAALg9uuZV17zhfI6rawQ5XGjP+Rw3glSUgnSWgnSWgnSWgnSWgnSWgnSWgnSWgnSWgnSWgnSWmUGmaTrqy/ph6Q3bf/Uw02heQUoQQdaCRPkiyPIRWhBBfgxBZkFaEEEmQTIUJCBCCyLIokGe7++O+vr0uHiA/uJhptG8fybIP3YjSEUpSGcpSGcpSN96kI+/F1ziNuBG9zfi9tL9nQKGZn0qSGUpSGUpSGUpSGUpSGUpSGUpSGUpSGUpSGUpSGUpSGXp5WKFvVz0+n3+Tf0e0lkK0lkK0lkK0v8wyOhEuVPfvkYnrr0NPr+7wmlvu8G1306sGd3fdrET5b4JdXTgE2t2Sz1ZPd7g3Yk1oyDLbfwIQcIQJAxBwhAkDEHCECQMQcIQJAxBwhAkDEGmH+EdPR0/XvA9afUAAAAASUVORK5CYII=';

  let observer = null;
  let chatAttributeObserver = null;
  let externalModalObserver = null;
  let surfaceThemeObserver = null;
  let surfaceScheme = "";
  let externalModalRailState = [];
  let observedAttributeChat = null;
  let scrollHost = null;
  let lastManualScrollAt = 0;
  let frameId = 0;
  let destroyed = false;
  /* 2.0.223：输入框右上角三只叠着睡觉的 Clawd（clawd-pile.js），替换原来的装饰图 #send_form::after。 */
  /* 2.0.300：大小 Clawd 互相叠。小 Clawd 那边要知道大 Clawd 站没站在输入框上、在不在走路，
     还要能叫大 Clawd 降回地上（它坐着的那只小 Clawd 被拿走时）。A2 在后面才定义，这里只是闭包，用的时候已经有了。 */
  const clawdEnabled = () => !destroyed && hostDocument.documentElement.dataset.claudeClawd !== 'off';
  const clawdPileEnabled=()=>clawdEnabled()&&hostDocument.documentElement.dataset.claudeClawdPile!=='off';
  let clawdPileInstance = null;
  const makeClawdPile = () => createClawdPile({ doc: hostDocument, win: hostWindow, big: {
    state: () => ({ grounded: !A2.held && Math.abs(A2.fy - A2.floor) < .5, walking: /^rig:walkLoop/.test(String(clawdTracks.B || '')) }),
    lower: () => clawdBigLower(),
  } });
  const clawdPile = Object.fromEntries(['setCostume','ensure','left','destroy','hush','peek','seats','trackSeats','seatLive','bigSat','blocks','riderCount','unloadBig','follow','followEnd','restack'].map(key => [key, (...args) => {
    if (key === 'destroy') { clawdPileInstance?.destroy(); clawdPileInstance = null; return; }
    if (clawdPileEnabled() && key === 'ensure' && !clawdPileInstance) clawdPileInstance = makeClawdPile();
    if (clawdPileEnabled() && clawdPileInstance) { if(key === 'ensure')clawdPileInstance.setCostume(CLAWD_RIG.pileCells || null); return clawdPileInstance[key](...args); }
    if (key === 'trackSeats') return () => [];
    return ['seats','blocks'].includes(key) ? [] : key === 'riderCount' ? 0 : null;
  }]));
  const clawdFrames = new Set(), clawdTimers = new Set();
  function requestClawdFrame(fn) {
    if (!clawdEnabled()) return 0;
    const id = hostWindow.requestAnimationFrame(now => { clawdFrames.delete(id); if (clawdEnabled()) fn(now); });
    clawdFrames.add(id); return id;
  }
  function clawdLater(fn, ms) {
    if (!clawdEnabled()) return 0;
    const id = hostWindow.setTimeout(() => { clawdTimers.delete(id); if (clawdEnabled()) fn(); }, ms);
    clawdTimers.add(id); return id;
  }
  function cancelClawdLater(id) { clawdTimers.delete(id); hostWindow.clearTimeout(id); }
  function cancelClawdFrame(id) { clawdFrames.delete(id); hostWindow.cancelAnimationFrame(id); }
  let clawdWasEnabled = null;
  function syncClawdRuntime() {
    const on = clawdEnabled();
      if (!clawdPileEnabled()) clawdPile.destroy();
      else if (on === clawdWasEnabled) clawdPile.ensure();
    if (on === clawdWasEnabled) return;
    clawdWasEnabled = on;
    if (on) {
      clawdLastIdleTickAt = Date.now();
      clawdRuntimeTimer = hostWindow.setInterval(clawdRuntimeTick, 200);
      ensureComposerClawd();
      return;
    }
    hostWindow.clearInterval(clawdRuntimeTimer); clawdRuntimeTimer = 0;
    for (const id of clawdFrames) hostWindow.cancelAnimationFrame(id);
    for (const id of clawdTimers) hostWindow.clearTimeout(id);
    clawdFrames.clear(); clawdTimers.clear();
    clawdPile.destroy(); cleanupClawdRigEffects();
    A2.flying++; A2.seqRun++; A2.lockUntil = 0; A2.lockName = '';
    const button = composerClawd();
    if (A2.pointerId != null) try { button?.releasePointerCapture(A2.pointerId); } catch {}
    A2.held = A2.dragging = A2.petting = false; A2.pointerId = null;
    A2.x = A2.fy = A2.floor = A2.homeX = A2.rot = 0; A2.sqx = A2.sqy = 1;
    A2.bndRaf = A2.petTimer = A2.squashTimer = 0; A2.bndReady = false;
    lookRaf = dozeTimer = clawdScrollRestTimer = clawdPileRestTimer = 0;
    clawdWalkNudge = null; clawdScrollHolding = false;
    clawdTracks.B = 'idle'; clawdTracks.C = null; clawdTracks.bUntil = clawdTracks.cUntil = 0;
    clawdReadingGate.reset(true); clawdComposerReaction.reset();
    clawdFormRO?.disconnect(); clawdFormRO = null; clawdFormObserved = null;
    hostDocument.querySelectorAll('button.' + BUTTON_CLASS).forEach(node => { node.getAnimations?.({subtree:true}).forEach(animation => animation.cancel()); node.remove(); });
  }
  let streamFollow = null;
  let deleteAnchor = null;
  let previousTypingActive = false;
  let generationEventActive = false;
  const generationSubscriptions = [];
                                                 
                                                      
  const clawdTracks = {
    A: null,
    B: 'idle',
    C: null,
    aStartedAt: 0,
    aUntil: 0,
    bUntil: 0,
    cUntil: 0,
    round: 0,
    activeRound: 0,
    settledRound: 0,
    genStartedAt: 0,
  };

  /* ===== C1b 分件骨架 =====
     输入框上那只 Clawd 里挂一套 9 层的骨架（clawd-rig.js 由 diagnostics 原型源码生成）。
     2026-09-24 起骨架接管这只 Clawd 的全部画面：三条轨道的每个状态都对应一个骨架动作（见 CLAWD_RIG_A/B/C），
     旧 ::before 整帧精灵只留给消息末尾的小 Clawd。新旧两套轮流画会接不上（Lulu 真机反馈），所以不再混用。
     动作的 CSS 按需生成：第一次要播哪个动作才生成哪个（全部约 440KB）。 */
  const NORMAL_CLAWD_RIG = buildClawdRig();
  let CLAWD_RIG = NORMAL_CLAWD_RIG, halloween = null, halloweenAirborne = false;
  const halloweenBlinkClocks = new Map();
  let halloweenErrorPending=false,halloweenSendClip='',halloweenSendPending=false;
  function switchHalloweenRig(next) {
    const rig = next || NORMAL_CLAWD_RIG;
    if (CLAWD_RIG === rig || destroyed) return;
    cleanupClawdRigEffects();
    for (const clock of halloweenBlinkClocks.values()) clock.destroy();
    halloweenBlinkClocks.clear();
      CLAWD_RIG = rig;
      if(rig===NORMAL_CLAWD_RIG&&['recover','errorSlump'].includes(clawdTracks.A)){clawdTracks.A=null;clawdTracks.aUntil=0;}
    clawdPile.setCostume(rig.pileCells || null);
    for (const button of hostDocument.querySelectorAll(".clawd-composer-clawd")) {
      button.querySelector(":scope > .clawd-rig")?.remove();
      button.removeAttribute("data-clawd-clip");
    }
    installClawdRigStyle();
    renderClawdTracks();
  }
  const CLAWD_RIG_STYLE_ID = 'claude-clawd-rig-style';
  /* 闲置随机池里的长动作：权重、冷却按 docs/Clawd动作分配-生态场-20260924.md §3 */
  const CLAWD_RIG_POOL = Object.freeze([
    { id: 'polish', weight: 3, cool: 240000 },
    { id: 'walk', weight: 3, cool: 120000 },
    { id: 'butterfly', weight: 1, cool: 600000 },
    { id: 'plant', weight: 1, cool: 600000 },
    { id: 'eat', weight: 0.3, mealWeight: 3, cool: 1800000 },
    /* 2026-09-29 新增（docs/Clawd新增动作-五项-设计-20260929.md） */
    { id: 'onFire', weight: 0.5, cool: 900000 },
    { id: 'glowstick', weight: 0.5, cool: 600000 },
    { id: 'glowstick2', weight: 0.5, cool: 600000 },
    { id: 'rickroll', weight: 0.3, cool: 300000 },   // Lulu：冷却 5 分钟
    { id: 'siren', weight: 0.25, cool: 900000 },
    { id: 'sirenBlue', weight: 0.25, cool: 900000 },
  ]);
  const clawdRigLastPlayed = {};
  /* 闲置池抽中以后再随机换成哪一种形态（冷却按池里的 id 算）。和原型 clips.js 的 STICK_FORMS 一致 */
  const CLAWD_RIG_FORMS = Object.freeze({
    glowstick: ['glowstick', 'glowstickPump'],
    glowstick2: ['glowstick2', 'glowstick2Pump', 'glowstick2Alt'],
  });
                                                                   
  const CLAWD_RIG_A = Object.freeze({ think: 'write', stream: 'write', sit: 'sitWrite', done: 'done', stopped: 'stopped', error: 'error' });
  /* 2.0.310（稿 Claude outputs/design-clawd-write-held-v1.html，Lulu 2026-10-06 认可）：坐在小 Clawd 头上时脚下没有输入框铺纸，
     改成左钳举着便签、右钳在上面写；结尾三种也换成举着的版本。不坐下（坐下是坐在输入框上的样子）。 */
  const CLAWD_RIG_A_HELD = Object.freeze({ think: 'writeHeld', stream: 'writeHeld', sit: 'writeHeld', done: 'doneHeld', stopped: 'stoppedHeld', error: 'errorHeld' });
  const CLAWD_RIG_B = Object.freeze({
    compose: 'compose', tilt: 'tilt', wow: 'wow', wake: 'wake', drowsy: 'drowsy', sleep: 'sleep', neglected: 'neglected',
    around: 'around', spin: 'spin', lean: 'lean', hide: 'hide', tramp: 'tramp',
    scratch: 'scratch', crouch: 'crouch', heart: 'heart', point: 'point', facepalm: 'facepalm',
    peek: 'peek',
  });
  /* 戳第 5 档是 turn → t5 → face 三步序列，三步都对着同一段「转身生气」，中间不重播 */
  const CLAWD_RIG_C = Object.freeze({
    press: 'press', grab: 'grab', drag: 'drag', fly: 'fly', land: 'land', stomp: 'stomp', pet: 'pet',
    t2: 'poke2', t3: 'poke3', t4: 'poke4', turn: 'sulk', t5: 'sulk', face: 'sulk', rage: 'rage',
  });
  let clawdRigPokeT1 = 'poke1';        // 第 1 档：蹦一下 / 害羞捂眼，每次戳随机一个
  /* 被拎着、被丢烦了跺脚：新版和旧版各一半，每次拎起 / 每次跺脚抽一次（Lulu 2026-09-25：旧版的也可爱，拿回来随机）
     旧版吊着 = 钟摆似的晃 + 四条腿轮流岔开；旧版跺脚 = 跳起来落地时低头、一只钳子往地上一拍 */
  const CLAWD_RIG_VARIANTS = Object.freeze({ drag: ['drag', 'dragSwing'], stomp: ['stomp', 'stompSlap'], sulk: ['sulk', 'rage'] });
  const clawdRigVariant = { drag: 'drag', stomp: 'stomp', sulk: 'sulk' };
  function clawdRigPickVariant(key) {
    const pool = CLAWD_RIG_VARIANTS[key].filter(id => CLAWD_RIG.clips[id]);
    clawdRigVariant[key] = pool[Math.floor(Math.random() * pool.length)] || key;
    return clawdRigVariant[key];
  }
  let clawdRigUntiltUntil = 0;         // 歪头结束时先回正，这段时间内不切别的
  const clawdRigInjected = new Set();  // 已经生成过 CSS 的动作
  let clawdLetterPending = false;

  /* ===== A2 的状态量 =====
     放在这里而不是跟 A2 的函数放一起：setClawdC / setClawdA / clawdRuntimeTick
     这三个定义更早的函数都要读它，而 const 有暂时性死区，声明必须先于任何一次
     调用执行。 */
  const A2_TIER = ['t1', 't2', 't3', 't4', 't5'];
  const A2_TMS = [600, 700, 700, 1100, 0];        // 跟骨架动作「戳 1–4」的时长一致；t5 的 0 表示时长交给序列管
  /* 第 1 档仍然走 A1 那套丰富反应（连点彩蛋、上下文台词、随机反应动画）。
     只有被连着戳、烦躁爬上去之后才换成 A2 的短台词。
     改成 0 就是全程用 A2 的台词，改成 2 就是前两档都留给 A1。 */
  const A2_RICH_TIER = 1;
  const A2_DRAG_THRESHOLD = 5;   // 位移超过这么多像素才算拖，否则算戳
  const A2_EDGE = 6;             // 离边界留的空隙
  const A2_DECOR_RESERVE = 12;   // 靠近归位线时，跟右上角装饰 Clawd 之间的空隙
  const A2_FORM_INSET = 8;       // 2.0.296：站在地上时离输入框左右两头至少这么远
  /* 兜底上限：量不到容器时才用。正常路径按真实可视区算，不再有硬编码高度。 */
  const A2_FALLBACK_CEILING = 240;
  /* 预热过的边界能用多久。
     预热只在挂载时和输入框「尺寸」变化时跑，但聊天内容加载完之后输入框是
     「位置」变了、尺寸没变，ResizeObserver 根本不触发——于是页面还没铺开时
     量到的那份错误边界会一直留着（实测上边界因此跑到窗口外 116px）。
     超过这个时间就在 pointerdown 里重量一次。一次手势最多读一次布局，
     这正是原始设计允许的那一次；真正禁止的是 pointermove 和 rAF 里读。 */
  const A2_BOUNDS_TTL = 800;

  const A2 = {
    petTimer: 0,        // 按住不动计时：到点算轻抚
    petting: false,     // 这一次按住已经变成轻抚了，松手不算戳
    x: 0, fy: 0, homeX: 0,
    floor: 0,           // 2.0.300：站的地方离输入框上沿多高（负数往上）。坐在小 Clawd 头上时不是 0
    feel: 0.64,                  // 手感总调，0~1，喂给 a2Phys()
    irr: 0, throws: 0, lastThrow: 0, lastDec: 0,
    lockUntil: 0, lockName: '', seqRun: 0, seqOwned: false,
    flying: 0, dragging: false, moved: false, held: false, pointerId: null,
    bndReady: false, bndRaf: 0,
    sx: 0, sy: 0, ox: 0, oy: 0, vx: 0, vy: 0, lx: 0, ly: 0, lt: 0,
    rot: 0, sqx: 1, sqy: 1,
    bnd: { minx: -9e9, maxx: 9e9, maxxHome: 9e9, minxHome: -9e9, miny: -A2_FALLBACK_CEILING, maxy: 0 },
    bndAt: 0,
    tookPointer: false,
    squashTimer: 0,
  };

  let clawdRuntimeTimer = 0;
  let clawdLastIdleTickAt = 0;
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
  let mobileNavPrepareHandler = null;
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
  /* 2.0.171：根视口变量只在视口真的变了之后才重读。读 visualViewport / innerHeight 会强制当场做完积压的
     样式重算和排版；它原来挂在每次 refreshClawd 上，打开设置页这种会让整页重算的操作时，重算被提前、
     还被拆成好几次（4× 降速模拟：点侧栏入口到出画面 1.5 s，其中 1.47 s 记在这个函数头上）。 */
  let mobileViewportMetricsDirty = true;
  let mobileViewportMetricsRaf = 0;
  let virtualKeyboardOverlayActive = false;
  let virtualKeyboardOverlayOriginal = false;
  let virtualKeyboardOverlayCaptured = false;
  let mobileStableLayoutHeight = Math.max(
    1,
    Math.round(hostWindow.innerHeight || hostDocument.documentElement.clientHeight || 1),
  );
  let mobileKeyboardRecoveryActive = false;
  let mobileKeyboardPollTimer = 0;
  let mobileKeyboardPollSignature = '';
  let suspendedThemeStyle = null;
  let suspendedThemeMedia = null;
  const AUTOCOMPLETE_RESIZE_GUARD_KEY = '__claudeClawdAutoCompleteResizeGuard';
  const AUTOCOMPLETE_GUARDED_METHODS = [
    'updatePosition',
    'updateFloatingPosition',
    'updateDetailsPosition',
  ];
  let autoCompleteResizeGuard = null;
  let autoCompleteResizeGuardToken = null;

  hostWindow[INSTANCE_KEY]?.destroy?.();

  /* 运行时注入的这份交互样式表是兼容模式的第三条越界通道。
     它不走 _dev/build-compat-css.js，所以生成期那套区域过滤和断言完全管不到它，
     里面有四十来条 #chat > .mes ... 规则。它们的前提是「完整模式会把酒馆自己的
     消息控件换成 Claude 的」，可兼容模式按边界不注入任何 Claude 消息控件，
     于是这些规则只剩下破坏力：2.0.92 的用户消息编辑键消失就是其中一条。

     这里不逐条加守卫，而是在注入前统一改写：凡是选择器能选到消息的，
     一律加上 html:not([data-claude-mode="compat"])。以后往这份样式表里加规则
     不需要记得这件事，新规则会自动被挡在兼容模式之外。 */
  const MESSAGE_SCOPED_SELECTOR = /#chat\s*>|\.mes(?:_|\b)|\.last_mes\b/;
  const COMPAT_GUARD = 'html:not([data-claude-mode="compat"])';

  function guardMessageRulesForCompatibility(css) {
    if (!frameworkCompatibilityMode) return String(css);
    return String(css).replace(/([^{}]+)\{/g, (match, prelude) => {
      const text = prelude.trim();
      if (!text || text.startsWith('@')) return match;
      if (!MESSAGE_SCOPED_SELECTOR.test(text)) return match;
      const leading = prelude.slice(0, prelude.length - prelude.trimStart().length);
      const guarded = text.split(',')
        .map(part => part.trim())
        .filter(Boolean)
        .map(part => (MESSAGE_SCOPED_SELECTOR.test(part) && !part.startsWith(COMPAT_GUARD)
          ? `${COMPAT_GUARD} ${part}`
          : part))
        .join(',\n');
      return `${leading}${guarded}{`;
    });
  }

  function installStyle() {
    hostDocument.getElementById(STYLE_ID)?.remove();
    const style = hostDocument.createElement('style');
    style.id = STYLE_ID;
    style.textContent = guardMessageRulesForCompatibility(`
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

      #chat > .mes .mes_text :is(iframe, object, embed) {
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        outline: 0 !important;
        box-shadow: none !important;
        background: transparent !important;
        background-color: transparent !important;
      }

      html[data-claude-integrated-theme="night"] body
        #chat > .mes .mes_text .${REGEX_SURFACE_CLASS} {
        background: transparent !important;
        background-color: transparent !important;
      }

      /* 2.0.246：原来这里在第三方全屏弹窗出现时把 #top-settings-holder 降到 1，侧栏（和设置）会沉到欢迎页下面看不见。
         改由 liftExternalModals 把弹窗抬到侧栏上面，这条规则删掉。 */

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

      /* A1：大 Clawd 是 #send_form 的真实子元素。位置完全由 CSS 锚定，
         跟随 #form_sheld 的键盘补偿；原本的消息落款小 Clawd 独立保留，
         手机顶栏与 typing indicator 不再创建第三个替身。 */
      html body #form_sheld,
      html body #form_sheld :is(#send_form, form) {
        position: relative !important;
        overflow: visible !important;
      }

      /* 输入框右上角原有的装饰 Clawd（#send_form::after，36x24 的
         icons/clawd.png，见 styles/*.css）保留不动。2.0.139 在这里注入
         content:none/display:none 把它杀掉了，那是把两只 Clawd 的身份认反
         的结果 —— 要搬家的是对话尾部那只，不是它。 */

      /* 迁入的可交互 Clawd 站输入框**左**上角。右上角 18px 是装饰 Clawd 的
         位置（36x24），两只并排会完全重叠，所以这只走左边。
         尺寸不在这里写死：交给上面 button.${BUTTON_CLASS} 的 2.0.135 原始规则
         （桌面 42x34、手机 38x31）。2.0.139 在这里强制 44x36，等于把角色搬过来
         的同时把它的身材改了。 */
      html body #send_form > button.${BUTTON_CLASS}.${COMPOSER_CLAWD_CLASS} {
        position: absolute !important;
        /* 底边用 calc(100% - 1px)，和装饰 Clawd 的 bottom:100%+margin-bottom:-1px
           完全等价 —— 两只并排必须站同一条线。2.0.139 用的是 -5px，跟装饰那只差 4px，
           两只并排时会一高一低。 */
        inset: auto auto calc(100% - 1px) max(18px, calc(env(safe-area-inset-left, 0px) + 12px)) !important;
        z-index: 4 !important;
        display: block !important;
        margin: 0 !important;
        /* 可拖物体必须在手指落下前拒绝页面平移；pointerdown 里再切已经太晚。 */
        touch-action: none !important;
      }

      html body button.clawd-mobile-clawd-button {
        display: none !important;
      }

      html body #chat .typing_indicator::before,
      html body #chat .typing_indicator::after {
        content: none !important;
        display: none !important;
        animation: none !important;
      }

      html[data-claude-clawd="off"] body button.${BUTTON_CLASS} {
        display: none !important;
      }

      button.${BUTTON_CLASS}:hover {
        filter: saturate(1.08);
      }

      /* 生成计时器：固定在输入区上方的小徽标，跟 clawd-cc-toast 同一套
         视觉语言（surface-raised 背景 + hairline 边框），生成时数字跳动，
         结束后定格几秒再淡出。html[data-claude-gen-timer="off"] 关闭时
         直接不显示——JS 那边也不会建元素，这里是双保险。 */
      .clawd-gen-timer {
        position: fixed;
        right: 16px;
        bottom: 84px;
        z-index: 10015;
        padding: 4px 10px;
        border-radius: 10px;
        font-family: var(--cl-sans);
        font-size: 12px;
        font-variant-numeric: tabular-nums;
        color: var(--cw-text-body);
        background: var(--cw-surface-raised);
        border: 1px solid var(--cw-rule-hairline);
        box-shadow: 0 6px 18px rgba(0,0,0,.18);
        opacity: 0;
        transform: translateY(4px);
        transition: opacity 200ms ease, transform 200ms ease;
        pointer-events: none;
      }
      .clawd-gen-timer.clawd-gen-timer-visible { opacity: .92; transform: translateY(0); }
      .clawd-gen-timer.clawd-gen-timer-done { color: var(--cw-mark); }
      html[data-claude-gen-timer="off"] .clawd-gen-timer { display: none !important; }

      /* 欢迎内容的兜底遮挡。
         酒馆的欢迎面板（#chat > .welcomePanel）和欢迎助手那条消息本来应该由酒馆
         自己在切换对话时清掉；PC 上实测四次都清得干净，手机上却会留在 #chat 里，
         跟真实的角色消息排成一列——用户看到的是"上面三条是欢迎页，往下划才是对话"。
         这里不去删别人的节点（删了可能打断酒馆自己的重建逻辑），只在「已经不是
         欢迎态」时把它们藏起来。body.clawd-welcome 由 refreshWelcomeMode 维护，
         实测在 PC 上四次进对话都被正确 toggle(false)，可以作为判据。
         纯 CSS 兜底，不管酒馆那边清不清、清得及不及时，都不会露出来。 */
      body:not(.clawd-welcome) #chat > .welcomePanel,
      body:not(.clawd-welcome) #chat > .mes.claude-welcome-clawd-assistant,
      body:not(.clawd-welcome) #chat > .mes.claude-welcome-prompt {
        display: none !important;
      }
      @media (prefers-reduced-motion: reduce) {
        .clawd-gen-timer { transition: none !important; }
      }

      /* 背景透传：主题原本给 body/侧栏（#top-bar、#top-settings-holder）/
         正文（#sheld、#chat，含 #chat::before 顶部遮罩条）/输入区整片刷了
         不透明的 --cw-surface-page（也就是现在的白底/黑底），把酒馆自己的
         背景图盖住了；欢迎语页面用的是同一批容器，一起覆盖到就不用再单独
         处理。这里只清空这几层的背景色，不碰 background-image——酒馆的
         背景图挂在更底层的元素上，本来就没被这几层挡住内容，挡住的只是
         "看不看得见"。
         注意 #foo#foo 的重复写法不是笔误：主题原样式里同名选择器很多是
         "html body #foo" 这种三段式，优先级比这边挂在 html 属性选择器上的
         单个 id 选择器更高，重复一次 id 才能确保稳赢，不必依赖样式表谁先
         加载谁后加载。（上一版只覆盖了 body/#sheld/#chat/#send_form/
         #form_sheld，漏了侧栏和 #chat::before，真机测出侧栏、正文区域、
         欢迎语区域都还是不透的，就是因为这个。） */
      html[data-claude-bg-transparent="on"],
      html[data-claude-bg-transparent="on"] body,
      html[data-claude-bg-transparent="on"] #top-bar#top-bar,
      html[data-claude-bg-transparent="on"] #top-settings-holder#top-settings-holder,
      html[data-claude-bg-transparent="on"] #sheld#sheld,
      html[data-claude-bg-transparent="on"] #chat#chat,
      html[data-claude-bg-transparent="on"] #form_sheld#form_sheld {
        background: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
      }
      html[data-claude-bg-transparent="on"] #chat#chat::before {
        background: transparent !important;
      }

      /* FR-1 背景图模糊。只作用在酒馆自己的背景层上，前景一个都不碰 ——
         需求文档特别强调「不要对聊天内容容器用 filter」，理由不只是观感：
         给元素上 filter 会让它变成后代 position:fixed 的包含块，抽屉、
         弹层、浮动菜单会被摁进那个盒子里。这个坑毛玻璃那边已经踩过一次
         （见下面 #top-settings-holder 那段注释）。

         scale(1.08) 是必须的，不是保险：blur 会让边缘像素向外采样到透明，
         不放大的话四周会露出一圈渐隐的缝。放大比例要够覆盖模糊半径，
         32px 的上限对应约 8% 的外扩。

         压暗用 inset box-shadow 铺满，不另加元素 —— 加元素就要考虑它的
         层级、指针事件、以及卸载时的清理。 */
      html[data-claude-bg-image-blur="on"] :is(#bg1, #bg_custom, #bg_animation) {
        filter: blur(var(--claude-bg-image-blur, 12px)) !important;
        transform: scale(1.08) !important;
        transform-origin: center center !important;
        box-shadow: inset 0 0 0 100vmax rgb(20 20 19 / var(--claude-bg-image-dim, .28)) !important;
      }
      html[data-claude-bg-image-blur="on"][data-claude-motion="off"] :is(#bg1, #bg_custom, #bg_animation) {
        transition: none !important;
      }
      /* 上一版把 #form_sheld 也单独打了层色调，本意是想解决"PC 端输入框
         看着不透"的问题，结果打歪了：真机调试查了 #sheld 的实际渲染盒子
         （position:absolute，铺满整个 #sheld 区域），发现它的模糊背景其实
         已经完整盖到 #form_sheld 那块地方了，PC 端"不透"的锅根本不在
         #sheld 有没有漏——是 #send_form 自己在 day-pc.css 里原本就有一份
         不透明的 --cw-surface-raised 背景（做成"浮起的输入控件"故意跟
         正文区分开），跟透传开关没关系。
         #form_sheld 单独叠一层色调，等于在"#sheld 已经模糊过一次"的底子上
         又摞了一层不同浓度的色调，跟旁边同样透出 #sheld 底色、但没有额外
         色调的 #chat 交界处，亮度/浓度对不上，就刷出了聊天区和输入条之间
         那道硬边——就是这次反馈的新 bug。
         #form_sheld 退回去跟 #chat 一样纯透传，边界就消失了。真正需要
         "看得见但要跟正文区分开"的其实只有 #send_form 那个圆角输入条本身
         ——这本来就是原设计里唯一带独立底色的控件，边界是有意的（一个
         圆角药丸形状的控件轮廓，不是贯穿整行的硬切线），不算视觉割裂。 */
      html[data-claude-bg-transparent="on"] #send_form#send_form {
        background: color-mix(in srgb, var(--claude-glass-base, #96968f) var(--claude-drawer-tint-opacity, 18%), transparent) !important;
        background-color: color-mix(in srgb, var(--claude-glass-base, #96968f) var(--claude-drawer-tint-opacity, 18%), transparent) !important;
        background-image: none !important;
      }

      /* 毛玻璃：在透传的基础上，给内容区（不含 html/body 这两层最外层）
         补一层很浅的同色调半透明底 + 模糊，读起来是"隔着磨砂玻璃看背景"，
         不是完全透明导致文字糊在背景图上看不清。设置面板里这个开关依赖
         背景透传先开，两个都关掉时都不生效，不会出现"糊了但看不出透明"
         的死角状态。

         #top-bar / #top-settings-holder 单独拆出来、只给半透明底色、
         不上 backdrop-filter —— 世界书/角色管理/扩展这些抽屉的
         .drawer-content 就挂在 #top-settings-holder 底下。CSS 规则是
         "给元素加 filter/backdrop-filter，这个元素就变成它内部
         fixed/absolute 子元素的新参照系"，抽屉本来是要铺满整个视口的
         fixed 面板，一旦祖先带上 backdrop-filter 就被摁进侧栏那个又窄
         又裁切的盒子里，表现是点了打不开、开着的关不掉。之前那版侧栏
         也叠了 blur，线上直接把抽屉全部糊死，是我漏测的坑。

         模糊只上在 #sheld 这一层——#chat、#form_sheld（连带里面的
         #send_form）都是 #sheld 的子元素，之前四个都各自叠了一层
         color-mix + blur，子元素的盒子比父元素小一圈（欢迎页尤其明显，
         问候语和输入框那块是居中的窄盒子），两层模糊叠在一起、且子盒子
         边缘只有单层父级模糊，就在子盒子的四条边上刷出一圈实打实的
         "描边"——用户反馈的欢迎语外框就是这个。#chat/#form_sheld/
         #send_form 这里不再单独给背景和滤镜，留空之后background-transparent
         那条规则已经把它们设成透明了，会自然透出 #sheld 这一层模糊后的
         底色，不会再有二次模糊/二次描边。 */
      /* #top-settings-holder 还是不能上 backdrop-filter——它是里面那些
         fixed 抽屉的祖先，加了模糊就会变成抽屉的定位参照系，重蹈"抽屉挤扁
         关不掉"的覆辙（这条坑之前踩过，见下面抽屉那段的说明）。
         #top-bar 不一样：查过 DOM，它跟 #top-settings-holder 是平级，
         底下也没有任何 fixed 定位的子元素，加模糊不会影响别的东西的定位，
         真机点关各种抽屉都正常。之前图省事把两个写在一条规则里、都不加
         模糊，代价是顶栏标题、图标全都直接铺在没模糊过的原图上——背景图
         细节一多，图标和文字的对比度就没保障，这也是反馈"字看不清"的
         一部分原因。这里把 #top-bar 拆出来单独给模糊，并且改用抽屉同一根
         "浓度下限"变量（不再用主区域那根可能被拖到 8% 的滑条），保证顶栏
         这种常驻功能区不会因为用户把主区域调得很透就跟着一起看不清。 */
      html[data-claude-bg-blur="on"] #top-settings-holder#top-settings-holder {
        background: color-mix(in srgb, var(--claude-glass-base, #96968f) var(--claude-nav-tint-opacity, 58%), transparent) !important;
      }
      html[data-claude-bg-blur="on"] #top-bar#top-bar {
        background: color-mix(in srgb, var(--claude-glass-base, #96968f) var(--claude-drawer-tint-opacity, 18%), transparent) !important;
        backdrop-filter: blur(16px) saturate(1.4) !important;
        -webkit-backdrop-filter: blur(16px) saturate(1.4) !important;
      }
      html[data-claude-bg-blur="on"] #sheld#sheld {
        background: color-mix(in srgb, var(--claude-glass-base, #96968f) var(--claude-bg-blur-opacity, 22%), transparent) !important;
        backdrop-filter: blur(16px) saturate(1.4) !important;
        -webkit-backdrop-filter: blur(16px) saturate(1.4) !important;
      }
      /* 消息区的次要文字（时间戳、"思考了一会"这类提示、操作图标）原来的
         灰色是按"底下永远是纯色纸白/纸黑"校准的对比度，换成半透明background
         露出背景图之后，这层灰经常卡在跟天空、云、浅色区域差不多的亮度，
         看着就会"发灰看不清"——不是不透明度算错了，是文字颜色本身的对比度
         保障没了。开了背景透传之后，把这个次要文字色朝主文字色（对比度
         最高、每个主题下都验证过可读）拉近一截，不管日夜、不管背景图什么
         内容，都能保住一个最低对比度。 */
      /* 这里不能写成 var(--cw-text-muted) 55% 混自己——--cw-text-muted
         自己就是这条规则要重新定义的目标，同一个变量在自己的定义里引用
         自己，CSS 会判定为循环引用，直接判无效（invalid at computed-value
         time），实测 getComputedStyle 读出来是空字符串，规则等于白写。
         改成引用 --cw-ink-2——这是 --cw-text-muted 在主题里真正指向的
         底层色号，跟目标变量不是同一个名字，就不会自我循环了。 */
      html[data-claude-bg-transparent="on"] {
        --cw-text-muted: color-mix(in srgb, var(--cw-ink-2) 55%, var(--cw-text-body) 45%) !important;
      }

      /* 抽屉/弹层磨砂：世界书、扩展、角色管理、User Settings 这些
         .drawer-content/.popup 面板。这里原来是不受 bgBlur/bgTransparent
         两个开关控制、常驻磨砂的——当时的顾虑是"背景透传关掉时它们又变回
         纯色，跟旁边区域对不上"。但反馈是背景透传本来就关着（没人要透传）
         的"常态"下，抽屉却硬带了一层磨砂感，不必要——用户没开这个功能，
         抽屉就该是主题原本的纯色，不该有任何磨砂痕迹。这里改成跟主区域
         一样受 data-claude-bg-transparent 控制，关闭时完全回退到主题
         原生样式。
         下面这两条规则现在都挂在 data-claude-bg-transparent="on" 底下，
         关掉背景透传就完全不生效，抽屉/弹窗自动回到主题原生的纯色。
         Prompt 管理二级弹层（#completion_prompt_manager_popup.openDrawer）
         有自己专门的不透明规则、选择器带 id，优先级比这条高，不会被这里
         的半透明覆盖掉——之前特意做成不透明就是防止列表和固定输入框从
         底下透出来，这里不用重复处理。

         这条规则第一版上线后实测完全没生效（真机截图侧栏抽屉还是纯白/纯
         黑），backdrop plugin这里排查了很久：day-pc.css 里还有一条更具体的
         "#top-settings-holder > .drawer > .drawer-content { background:
         var(--cw-surface-page) !important; ... }"，选择器带一个 id 两个类，
         优先级 (1,2,0)，比这条 :is(...) 单类选择器的 (0,1,1) 高得多，
         哪怕后加载、哪怕 !important，也照样是它赢——具体到 CSS 里就是
         "id 数量相同时比类的数量，类数量相同时比标签数量"这条比较规则，
         我最早只对比了 :is(...) 那一条基础规则，漏看了这条专门给
         "挂在侧栏rail 下的抽屉"加的更具体规则。下面单独给这条更具体的
         选择器也补一份同样的半透明色，才能真正盖过去。

         手机布局（day-mobile.css / night-mobile.css）比 PC 布局那条又多
         叠了一个 ".openDrawer" 状态类——"html body #top-settings-holder >
         .drawer > .drawer-content.openDrawer"，比上面这条 PC 端够用的
         选择器又高一级（多一个类），手机窄屏下实测抽屉还是纯色，就是被
         这条压过去了。这里把 .openDrawer 变体也一起列出来，两个布局
         都能盖住，不用再赌“加载顺序刚好在后面”那种运气。 */
      /* 光调浓度治标不治本：抽屉之前只有色调、没有模糊，浓度调到 68% 还是
         能看出背后角色卡缩略图/聊天气泡的轮廓，本质是"给一层有色玻璃纸"，
         不是"磨砂玻璃"。真机反馈"日间的字看不清、头像也糊没了"，根子在
         这——背后内容细节越多（图片、卡片），同样浓度下能看清的东西越多，
         纯调浓度只能靠堆到接近不透明才压得住，代价是完全看不见背景，跟
         "透传"这个功能本身的诉求（看得见背景）矛盾。
         这里给抽屉/弹窗自己直接加 backdrop-filter：这些面板本身就是
         position:fixed 定位的元素，模糊算在它们自己身上，不影响它们自己
         的定位（filter 影响的是"内部子元素"的定位基准，不影响元素自己）。
         之前踩过的坑是把模糊加在 #top-settings-holder 这个"祖先容器"上，
         把它变成了里面 fixed 抽屉的定位基准，导致抽屉挤扁/关不掉——这次
         是直接加在抽屉本身，不是加在抽屉的祖先上，两者不是一回事，真机
         测试开关各个抽屉正常。 */
      html[data-claude-bg-transparent="on"] body #top-settings-holder > .drawer > .drawer-content,
      html[data-claude-bg-transparent="on"] body #top-settings-holder > .drawer > .drawer-content.openDrawer {
        background: color-mix(in srgb, var(--claude-glass-base, #96968f) var(--claude-drawer-tint-opacity, 18%), transparent) !important;
        background-color: color-mix(in srgb, var(--claude-glass-base, #96968f) var(--claude-drawer-tint-opacity, 18%), transparent) !important;
        backdrop-filter: blur(20px) saturate(1.25) !important;
        -webkit-backdrop-filter: blur(20px) saturate(1.25) !important;
      }
      html[data-claude-bg-transparent="on"] :is(.drawer-content, .popup, .popup-content) {
        background: color-mix(in srgb, var(--claude-glass-base, #96968f) var(--claude-drawer-tint-opacity, 18%), transparent) !important;
        background-color: color-mix(in srgb, var(--claude-glass-base, #96968f) var(--claude-drawer-tint-opacity, 18%), transparent) !important;
        backdrop-filter: blur(20px) saturate(1.25) !important;
        -webkit-backdrop-filter: blur(20px) saturate(1.25) !important;
      }
      /* --SmartThemeBlurTintColor 是酒馆自己给"磨砂面板"准备的原生变量，
         语义就是"配合模糊用的半透明底色"——不少第三方扩展（背景管理面板
         自己的顶栏 #bg-header-fixed、酒馆助手的脚本列表行……）都直接拿
         这个变量当背景，不吃我们主题的 --cw-surface-page。我们的主题没
         重新定义过它，酒馆原生给的默认值偏深、还不透明，跟这些扩展自己
         "半透明磨砂"的设计初衷本来就对不上，遇上我们的日间浅色主题更是
         直接糊出一块黑条/黑块，跟旁边区域完全脱节。
         这里不是挨个元素去堵，是从根上把这个变量重新定义成跟我们抽屉
         同一色调、同一浓度的半透明色——凡是照着酒馆官方约定使用这个变量
         的扩展（不只是背景面板和酒馆助手，任何遵循这个约定的三方扩展都
         受益），背景会自动跟着我们的日夜色调和毛玻璃浓度滑条走，不用每
         冒出一个新扩展就单独打一次补丁。 */
      /* Bug 5：上面这条重定义之前是挂在裸 html 选择器上的，不受
         data-claude-bg-transparent / data-claude-bg-blur 任何一个开关控制——
         两个都关掉之后，这条半透明 color-mix 仍然原样生效。角色卡
         Advanced Definitions 这类弹窗走的正是酒馆原生
         --SmartThemeBlurTintColor 这条约定（不吃我们主题给 .popup 写的
         那份不透明 --cw-surface-page，日间/夜间 CSS 里那份规则管不到它），
         于是就算用户把透传和毛玻璃都关了，这些弹窗背后仍然是当初写死的
         18% 浓度玻璃色，跟设置语义（都关闭 = 实体不透明背景）对不上。
         这里拆成两条：默认（两个开关都关）时把这个变量还原成主题本身的
         不透明 --cw-surface-page；只有背景透传打开时才切回半透明
         color-mix。毛玻璃单独开、透传没开的组合不会走到这条规则——它依赖
         透传先开这条既有约束在设置面板里已经保证（见 bgBlur 的 change
         处理器，勾选毛玻璃会连带勾上透传）。 */
      /* 2.0.90：兼容模式必须排除在外。--SmartThemeBlurTintColor 是酒馆自己的
         变量，外部美化拿它当页面底色用。在 :root 上把它改成 Claude 的
         --cw-surface-page，等于把整页底色换成 Claude 纸色 —— 雨中曲的正文
         于是变成「黄色卡片浮在白底上」，中间一条条白带。兼容模式下这个变量
         归主题。 */
      html:not([data-claude-mode="compat"]) {
        --SmartThemeBlurTintColor: var(--cw-surface-page) !important;
      }
      html[data-claude-bg-transparent="on"]:not([data-claude-mode="compat"]) {
        --SmartThemeBlurTintColor: color-mix(in srgb, var(--claude-glass-base, #96968f) var(--claude-drawer-tint-opacity, 18%), transparent) !important;
      }

      /* 真正在真实聊天页（非欢迎页）里把 #send_form 顶掉、让接缝 bug 复现的
         另有其人：day-pc.css/day-mobile.css 里还定义了一条只在聊天页生效
         的选择器 html body:not(.clawd-welcome) #form_sheld :is(#send_form,
         form)，专门给输入条上了 --cl-composer-chat 这个变量（88% 正文底色
         + 5% 文字色，接近不透明），本意是"聊天区里输入条要比正文更醒目"。
         这条规则比我们上面给 #send_form#send_form 写的那条选择器还多两层
         元素（html body），优先级压过我们，欢迎页不受影响（有 .clawd-welcome
         挡着），一进真实聊天就现形——这才是"新bug"截图里那条硬边的真身，
         不是简单的双层色调叠加。
         用跟 --SmartThemeBlurTintColor 一样的思路根治：不跟它比优先级，
         直接把它读的这个变量本身重新定义掉，开了背景透传之后聊天页输入条
         也统一吃我们这根浓度滑条。 */
      /* 光在 html 上重定义这个变量不够——day-pc.css 里 --cl-composer-chat
         的原始定义写在 ":root, html body" 上，body 那份是直接扎在 body
         元素自己身上的（哪怕没有 !important），CSS 自定义属性的继承规则
         是"元素自己身上只要有声明就不再看祖先的继承值"，跟那份声明是不是
         important 无关——important 只在同一个元素上争夺胜负时才起作用。
         所以我们挂在 html 上的 !important 版本永远赢不过 body 自己那份，
         必须直接把 body 也纳入选择器，声明才会落在 body 自己头上，盖掉
         day-pc.css 那份。 */
      html[data-claude-bg-transparent="on"],
      html[data-claude-bg-transparent="on"] body {
        --cl-composer-chat: color-mix(in srgb, var(--claude-glass-base, #96968f) var(--claude-drawer-tint-opacity, 18%), transparent) !important;
      }

      html[data-claude-motion="off"] button.${BUTTON_CLASS},
      html[data-claude-motion="off"] #chat .typing_indicator::before,
      html[data-claude-motion="off"] .clawd-typing-exit-ghost::before {
        animation: none !important;
        transition: none !important;
        translate: 0 0 !important;
      }

      #chat > .mes[is_user="false"] {
        position: relative !important;
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
        color: var(--cw-text-muted, #8b8780) !important;
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
        color: var(--cw-text-body, #ece9e2) !important;
        background: var(--cw-surface-hover, rgba(128,128,128,.12)) !important;
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

      /* 真实动作仍全部保留，但默认折叠必须交还酒馆。2.0.117 把
         .extraMesButtons 和它的每个孩子都强制 display:flex，等于绕过了
         extraMesButtonsHint 的原生开关，P2/P5 才会整排常驻。 */
      html:not([data-claude-mode="compat"]) body.${READY_CLASS} #chat > .mes .mes_buttons {
        display: flex !important;
        align-items: center !important;
        gap: 4px !important;
        max-width: 100% !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
        flex-wrap: nowrap !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
      }

      html:not([data-claude-mode="compat"]) body.${READY_CLASS} #chat > .mes .extraMesButtons {
        display: none !important;
        align-items: center !important;
        gap: 4px !important;
        max-width: 100% !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
        flex-wrap: nowrap !important;
      }

      /* 主题源 CSS 会先把角色消息下的每个 .mes_button 全部隐藏。
         省略号和编辑键属于原生主操作，必须明确恢复；额外动作仍由
         .visible / expandMessageActions 控制，不能跟着一起常驻。 */
      html:not([data-claude-mode="compat"]) body.${READY_CLASS}:not(.expandMessageActions)
        #chat > .mes .mes_buttons:not(:has(> .extraMesButtons.visible))
        > .extraMesButtonsHint,
      html:not([data-claude-mode="compat"]) body.${READY_CLASS}
        #chat > .mes[is_user="false"] .mes_buttons > .mes_edit {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
      }

      /* 用户消息的原生编辑键挂在 .ch_name 里。TT 的气泡布局会把整段标题栏
         压成零高，按钮即使 display:flex 也在画面外。下方的编辑代理负责转发
         给同一枚原生 .mes_edit；这里收起原节点，避免 ST 出现双铅笔。 */
      html:not([data-claude-mode="compat"]) body.${READY_CLASS}
        #chat > .mes[is_user="true"] .mes_buttons > .mes_edit {
        display: none !important;
      }

      html:not([data-claude-mode="compat"]) body.${READY_CLASS}.expandMessageActions
        #chat > .mes .mes_buttons > .extraMesButtonsHint,
      html:not([data-claude-mode="compat"]):not([data-cw-v4]) body.${READY_CLASS}
        #chat > .mes .mes_buttons:has(> .extraMesButtons.visible)
        > .extraMesButtonsHint {
        display: none !important;
      }

      html:not([data-claude-mode="compat"]) body.${READY_CLASS}.expandMessageActions
        #chat > .mes .extraMesButtons,
      html:not([data-claude-mode="compat"]) body.${READY_CLASS}
        #chat > .mes .extraMesButtons.visible {
        display: flex !important;
      }

      /* 主题源曾只白名单显示复制和朗读，所以点省略号后看起来只有两个功能。
         展开区改成独立浮层：只恢复酒馆没有显式隐藏的真实按钮，并允许换行，
         不再把十几个动作硬塞进消息底部的一条 26px 横线。
         v4（classic + rail）不用这张卡片：styles/official-layout.css 里是 design-v4 的单行灰条，
         position:fixed 定位，不用改消息的 overflow（2026-09-29），所以下面几条都排除 v4。 */
      html:not([data-claude-mode="compat"]):not([data-cw-v4]) body.${READY_CLASS}
        #chat > .mes[is_user="false"]:has(.extraMesButtons.visible),
      html:not([data-claude-mode="compat"]):not([data-cw-v4]) body.${READY_CLASS}
        #chat > .mes[is_user="false"]:has(.extraMesButtons.visible) .mes_block,
      html:not([data-claude-mode="compat"]):not([data-cw-v4]) body.${READY_CLASS}
        #chat > .mes[is_user="false"] .mes_buttons:has(> .extraMesButtons.visible) {
        overflow: visible !important;
      }

      html:not([data-claude-mode="compat"]):not([data-cw-v4]) body.${READY_CLASS}
        #chat > .mes[is_user="false"] .mes_buttons > .extraMesButtons.visible {
        position: absolute !important;
        inset: auto auto 32px 0 !important;
        z-index: 32 !important;
        display: flex !important;
        align-items: center !important;
        align-content: flex-start !important;
        flex-direction: row !important;
        flex-wrap: wrap !important;
        gap: 4px !important;
        box-sizing: border-box !important;
        width: min(248px, calc(100vw - 32px)) !important;
        max-width: calc(100vw - 32px) !important;
        height: auto !important;
        min-height: 38px !important;
        max-height: min(44dvh, 220px) !important;
        margin: 0 !important;
        padding: 6px !important;
        overflow-x: hidden !important;
        overflow-y: auto !important;
        color: var(--cw-text-body, #ece9e2) !important;
        background: var(--cw-surface-raised, #242422) !important;
        border: 1px solid var(--cw-rule-hairline, rgba(128,128,128,.24)) !important;
        border-radius: 10px !important;
        box-shadow: 0 10px 30px rgba(0,0,0,.18) !important;
        scrollbar-width: thin !important;
      }

      html:not([data-claude-mode="compat"]):not([data-cw-v4]) body.${READY_CLASS}
        #chat > .mes[is_user="false"] .extraMesButtons.visible
        > .mes_button:not(.displayNone):not([hidden]):not([style*="display: none"]):not([style*="display:none"]) {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        flex: 0 0 30px !important;
        width: 30px !important;
        min-width: 30px !important;
        max-width: 30px !important;
        height: 30px !important;
        min-height: 30px !important;
        max-height: 30px !important;
        margin: 0 !important;
        padding: 0 !important;
        visibility: visible !important;
        opacity: .82 !important;
        pointer-events: auto !important;
      }

      html:not([data-claude-mode="compat"]) body.${READY_CLASS}
        #chat > .mes .mes_buttons > :not(script):not(style) {
        visibility: visible !important;
        opacity: .72 !important;
        pointer-events: auto !important;
        cursor: pointer !important;
        flex: 0 0 auto !important;
      }

      html:not([data-claude-mode="compat"]) body.${READY_CLASS} #chat > .mes :is(.mes_create_bookmark,.mes_create_branch) {
        pointer-events: auto !important;
        cursor: pointer !important;
      }

      html:not([data-claude-mode="compat"]) body.${READY_CLASS} #chat > .mes:has(.edit_textarea) .mes_buttons {
        display: none !important;
      }

      html:not([data-claude-mode="compat"]) body.${READY_CLASS} #chat > .mes .mes_buttons > :is(.displayNone,[hidden]),
      html:not([data-claude-mode="compat"]) body.${READY_CLASS} #chat > .mes .extraMesButtons > :is(.displayNone,[hidden]) {
        display: none !important;
      }

      html[data-claude-quote-body-color="on"] body.${READY_CLASS} #chat :is(.mes_text,.mes_reasoning) :is(q,.quote) {
        color: var(--cw-text-body, var(--SmartThemeBodyColor)) !important;
      }

      body.${READY_CLASS}.${GENERATING_CLASS} #chat #typing_indicator.typing_indicator {
        display: flex !important;
        visibility: visible !important;
        opacity: 1 !important;
      }

      :is(#completion_prompt_manager,#completion_prompt_manager_popup)
        .prompt_manager_prompt_controls > :is(
          .prompt-manager-detach-action,
          .prompt-manager-edit-action,
          .prompt-manager-delete-action,
          .prompt-manager-toggle-action,
          [data-action*="delete" i]
        ) {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-width: 28px !important;
        min-height: 28px !important;
        color: var(--cw-text-secondary, var(--cw-text-muted)) !important;
        opacity: .88 !important;
        visibility: visible !important;
        pointer-events: auto !important;
      }

      :is(#completion_prompt_manager,#completion_prompt_manager_popup)
        .prompt_manager_prompt_controls > :is(.prompt-manager-delete-action,[data-action*="delete" i]) {
        color: var(--cw-mark, currentColor) !important;
      }

      #completion_prompt_manager :is(.completion_prompt_manager_footer,[class$="prompt_manager_footer"]) {
        position: sticky !important;
        bottom: 0 !important;
        z-index: 4 !important;
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
        box-sizing: border-box !important;
        width: 100% !important;
        padding: 8px 4px !important;
        background: var(--cw-surface-page) !important;
      }

      #completion_prompt_manager :is(.completion_prompt_manager_footer,[class$="prompt_manager_footer"]) > select {
        flex: 1 1 140px !important;
        min-width: 100px !important;
      }

      #completion_prompt_manager :is(.completion_prompt_manager_footer,[class$="prompt_manager_footer"]) > .menu_button {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        flex: 0 0 32px !important;
        width: 32px !important;
        min-width: 32px !important;
        height: 32px !important;
        margin: 0 !important;
        padding: 0 !important;
        opacity: .9 !important;
        visibility: visible !important;
      }

      #completion_prompt_manager :is(.completion_prompt_manager_footer,[class$="prompt_manager_footer"])
        > .caution[title*="delete" i] {
        color: #c15f50 !important;
        border-color: color-mix(in srgb, #c15f50 55%, transparent) !important;
        opacity: 1 !important;
      }

      @media (max-width:700px) {
        /* 移动抽屉自己从屏幕顶端铺开，但内容必须从 56px 顶栏下方开始。
           这同时避免设置标题和右上角 Clawd 叠在一起。 */
        html body.${MOBILE_LAYOUT_CLASS} #top-settings-holder
          > .drawer > .drawer-content.openDrawer,
        html body.${MOBILE_LAYOUT_CLASS} #top-settings-holder
          > #rightNavHolder > .drawer-content.openDrawer {
          top: 0 !important;
          bottom: auto !important;
          height: 100dvh !important;
          min-height: 100dvh !important;
          max-height: 100dvh !important;
          margin: 0 !important;
          padding-top: calc(env(safe-area-inset-top, 0px) + 58px) !important;
          scroll-padding-top: calc(env(safe-area-inset-top, 0px) + 58px) !important;
        }

        html body.${MOBILE_LAYOUT_CLASS} #rightNavHolder
          > .drawer-content.openDrawer > :is(#right-nav-panelheader,#CharListButtonAndHotSwaps,#rm_PinAndTabs,.scrollableInner),
        html body.${MOBILE_LAYOUT_CLASS} #rightNavHolder
          > .drawer-content.openDrawer #rm_characters_block,
        html body.${MOBILE_LAYOUT_CLASS} #rightNavHolder
          > .drawer-content.openDrawer #charListFixedTop {
          inset: auto !important;
          margin-top: 0 !important;
          translate: none !important;
        }

        html body.${MOBILE_LAYOUT_CLASS} #user-settings-block
          > .flex-container.flexFlowColumn:first-child {
          gap: 8px !important;
        }

        html body.${MOBILE_LAYOUT_CLASS} #user-settings-block [name="userSettingsRowOne"] {
          display: grid !important;
          grid-template-columns: minmax(0,1fr) minmax(132px,1fr) !important;
          align-items: start !important;
          gap: 7px 10px !important;
          width: 100% !important;
          min-height: 0 !important;
        }

        html body.${MOBILE_LAYOUT_CLASS} #user-settings-block [name="userSettingsRowOne"]
          > :first-child {
          grid-column: 1 / 2 !important;
          min-width: 0 !important;
        }

        html body.${MOBILE_LAYOUT_CLASS} #user-settings-block #UI-language-block {
          grid-column: 2 / 3 !important;
          display: grid !important;
          grid-template-columns: 1fr !important;
          gap: 4px !important;
          min-width: 0 !important;
        }

        html body.${MOBILE_LAYOUT_CLASS} #user-settings-block #version_display {
          grid-column: 1 / -1 !important;
          display: block !important;
          min-width: 0 !important;
          overflow-wrap: anywhere !important;
        }

        html body.${MOBILE_LAYOUT_CLASS} #user-settings-block [name="UserSettingsRowTwo"] {
          display: grid !important;
          grid-template-columns: minmax(0,auto) minmax(120px,1fr) !important;
          align-items: center !important;
          gap: 8px !important;
        }

        /* TT 的 WebView 在全屏抽屉 transform 动画期间会重绘整个长设置页。
           静态切换比持续卡顿更可用，ST/Via 仍保留原动画。 */
        html body.${MOBILE_LAYOUT_CLASS}.${TAURITAVERN_HOST_CLASS}
          #top-settings-holder > .drawer > .drawer-content {
          transition: none !important;
          animation: none !important;
          will-change: auto !important;
        }

        #completion_prompt_manager #completion_prompt_manager_list
          > li.completion_prompt_manager_prompt > span:has(> .prompt_manager_prompt_controls),
        #completion_prompt_manager #completion_prompt_manager_list .prompt_manager_prompt_controls {
          min-width: 104px !important;
        }

        /* TT 偶尔保留 drag-handle 节点却不画它的 ☰ 文本。把字形放进伪元素，
           触摸事件仍由原节点接收，拖拽排序行为与 ST 原生实现一致。 */
        html body.${MOBILE_LAYOUT_CLASS}
          :is(#completion_prompt_manager,#completion_prompt_manager_popup) #completion_prompt_manager_list
          > li.completion_prompt_manager_prompt:has(> .${PROMPT_DRAG_HANDLE_CLASS}) {
          display: grid !important;
          grid-template-columns: 28px minmax(0,1fr) auto auto !important;
          align-items: center !important;
          column-gap: 4px !important;
          padding-left: 4px !important;
        }

        html body.${MOBILE_LAYOUT_CLASS}
          :is(#completion_prompt_manager,#completion_prompt_manager_popup) #completion_prompt_manager_list
          > li.completion_prompt_manager_prompt:has(> .${PROMPT_DRAG_HANDLE_CLASS})
          > .drag-handle {
          position: static !important;
          inset: auto !important;
          grid-column: 1 !important;
          grid-row: 1 !important;
          z-index: 3 !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-sizing: border-box !important;
          width: 28px !important;
          min-width: 28px !important;
          height: 28px !important;
          margin: 0 !important;
          padding: 0 !important;
          color: var(--cw-text-secondary, var(--cw-text-muted, #777)) !important;
          background-color: transparent !important;
          background-image: none !important;
          box-shadow: none !important;
          filter: none !important;
          text-shadow: none !important;
          font-size: 0 !important;
          line-height: 1 !important;
          visibility: visible !important;
          opacity: .9 !important;
          pointer-events: auto !important;
          cursor: grab !important;
          touch-action: none !important;
          user-select: none !important;
          -webkit-user-select: none !important;
        }

        html body.${MOBILE_LAYOUT_CLASS}
          :is(#completion_prompt_manager,#completion_prompt_manager_popup) #completion_prompt_manager_list
          > li.completion_prompt_manager_prompt:has(> .${PROMPT_DRAG_HANDLE_CLASS})
          > .drag-handle::before {
          content: none !important;
          display: none !important;
        }

        html body.${MOBILE_LAYOUT_CLASS}
          :is(#completion_prompt_manager,#completion_prompt_manager_popup) #completion_prompt_manager_list
          > li.completion_prompt_manager_prompt:has(> .${PROMPT_DRAG_HANDLE_CLASS})
          > .drag-handle > .${PROMPT_DRAG_GLYPH_CLASS} {
          display: inline-flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 3px !important;
          width: 16px !important;
          height: 16px !important;
          color: var(--cw-text-secondary, var(--cw-text-muted, #777)) !important;
          box-shadow: none !important;
          filter: none !important;
          text-shadow: none !important;
          visibility: visible !important;
          opacity: 1 !important;
        }

        html body.${MOBILE_LAYOUT_CLASS}
          :is(#completion_prompt_manager,#completion_prompt_manager_popup) #completion_prompt_manager_list
          > li.completion_prompt_manager_prompt:has(> .${PROMPT_DRAG_HANDLE_CLASS})
          > .drag-handle > .${PROMPT_DRAG_GLYPH_CLASS} > span {
          display: block !important;
          box-sizing: border-box !important;
          width: 16px !important;
          min-width: 16px !important;
          height: 2px !important;
          min-height: 2px !important;
          margin: 0 !important;
          padding: 0 !important;
          background: currentColor !important;
          border: 0 !important;
          border-radius: 1px !important;
          box-shadow: none !important;
          filter: none !important;
          text-shadow: none !important;
          visibility: visible !important;
          opacity: 1 !important;
        }

        html body.${MOBILE_LAYOUT_CLASS}
          :is(#completion_prompt_manager,#completion_prompt_manager_popup) #completion_prompt_manager_list
          > li.completion_prompt_manager_prompt:has(> .${PROMPT_DRAG_HANDLE_CLASS})
          > .completion_prompt_manager_prompt_name {
          grid-column: 2 !important;
          grid-row: 1 !important;
          display: grid !important;
          grid-template-columns: 26px minmax(0,1fr) !important;
          align-items: center !important;
          column-gap: 8px !important;
          min-width: 0 !important;
        }

        #completion_prompt_manager_list
          .completion_prompt_manager_prompt_name > :is(.fa-fw,.fa-solid,.fa-regular):first-child {
          position: static !important;
          inset: auto !important;
          grid-column: 1 !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-sizing: border-box !important;
          width: 26px !important;
          min-width: 26px !important;
          max-width: 26px !important;
          margin: 0 !important;
          transform: none !important;
        }

        #completion_prompt_manager_list
          .completion_prompt_manager_prompt_name > :is(a,span):not(.fa-fw):not(.fa-solid):not(.fa-regular) {
          grid-column: 2 !important;
          min-width: 0 !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }

        #completion_prompt_manager :is(.completion_prompt_manager_footer,[class$="prompt_manager_footer"]) {
          flex-wrap: wrap !important;
          justify-content: flex-end !important;
          padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px)) !important;
        }

        #completion_prompt_manager :is(.completion_prompt_manager_footer,[class$="prompt_manager_footer"]) > select {
          flex: 1 0 100% !important;
          width: 100% !important;
        }

        html body.${MOBILE_LAYOUT_CLASS} #qr--bar #input_helper_toolbar,
        html body.${MOBILE_LAYOUT_CLASS} #qr--bar .qrq-wrapper-visible #input_helper_toolbar {
          position: static !important;
          inset: auto !important;
          transform: none !important;
          float: none !important;
          max-width: 100% !important;
        }

        html body.${MOBILE_LAYOUT_CLASS} #completion_prompt_manager_popup.openDrawer {
          inset: 0 0 auto 0 !important;
          height: var(${MOBILE_POPUP_HEIGHT_PROPERTY}, var(${MOBILE_VIEWPORT_HEIGHT_PROPERTY}, 100vh)) !important;
          min-height: var(${MOBILE_POPUP_HEIGHT_PROPERTY}, var(${MOBILE_VIEWPORT_HEIGHT_PROPERTY}, 100vh)) !important;
          max-height: var(${MOBILE_POPUP_HEIGHT_PROPERTY}, var(${MOBILE_VIEWPORT_HEIGHT_PROPERTY}, 100vh)) !important;
        }

        html body.${MOBILE_LAYOUT_CLASS} #completion_prompt_manager_popup.openDrawer::after {
          flex-basis: max(0px, calc(var(${MOBILE_POPUP_HEIGHT_PROPERTY}, var(${MOBILE_VIEWPORT_HEIGHT_PROPERTY}, 100vh)) - 100dvh + 16px)) !important;
          height: max(0px, calc(var(${MOBILE_POPUP_HEIGHT_PROPERTY}, var(${MOBILE_VIEWPORT_HEIGHT_PROPERTY}, 100vh)) - 100dvh + 16px)) !important;
          min-height: max(0px, calc(var(${MOBILE_POPUP_HEIGHT_PROPERTY}, var(${MOBILE_VIEWPORT_HEIGHT_PROPERTY}, 100vh)) - 100dvh + 16px)) !important;
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
        color: var(--cw-text-muted, #8b8780) !important;
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

      /* 设置里关掉「回复两侧的左右切换箭头」：只是不显示，按钮还在，操作栏的 ‹ › 仍靠它们切换。 */
      html[data-cw-v4][data-claude-side-swipe="off"] body button.${LEFT_SWIPE_PROXY_CLASS},
      html[data-cw-v4][data-claude-side-swipe="off"] body button.${SWIPE_PROXY_CLASS} { display: none !important; }

      /* 11-26 旧版也生效：两侧箭头不显示，改由操作栏最前面的 ‹ n/m › 切换（syncClassicBarSwipes）。
         手机上「禁用时也显示」那条规则更重（.clawd-mobile-layout … :disabled），这里用 #chat#chat 和 :is(*,:disabled) 压过去。 */
      html[data-claude-ui="classic"][data-claude-side-swipe="off"] body #chat#chat > .mes > button:is(.${LEFT_SWIPE_PROXY_CLASS},.${SWIPE_PROXY_CLASS}):is(*,:disabled) { display: none !important; }
      .${CLASSIC_BAR_SWIPES_CLASS} { display: none !important; }
      html[data-claude-ui="classic"][data-claude-side-swipe="off"] body:not(.${GENERATING_CLASS}) #chat > .mes[is_user="false"] .mes_buttons > .${CLASSIC_BAR_SWIPES_CLASS} {
        display: flex !important;
        align-items: center;
        flex: none;
        order: -1;
        height: 26px;
        margin: 0 6px 0 0;
      }
      .${CLASSIC_BAR_SWIPES_CLASS} > button {
        appearance: none;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 26px;
        margin: 0;
        padding: 0;
        border: 0;
        border-radius: var(--cw-radius-8, 8px);
        background: transparent;
        color: var(--cw-text-muted);
        opacity: .58;
        cursor: pointer;
        font: 900 11px/1 "Font Awesome 6 Free";
        transition: opacity 130ms ease, background 130ms ease;
      }
      .${CLASSIC_BAR_SWIPES_CLASS} > button:hover { opacity: 1; background: var(--cw-surface-hover); }
      .${CLASSIC_BAR_SWIPES_CLASS} > button:disabled { opacity: .22; cursor: default; background: transparent; }
      .${CLASSIC_BAR_SWIPES_CLASS} > button:first-child::before { content: "\\f053"; }
      .${CLASSIC_BAR_SWIPES_CLASS} > button:last-child::before { content: "\\f054"; }
      .${CLASSIC_BAR_SWIPES_CLASS} > span {
        min-width: 28px;
        text-align: center;
        font: 500 11.5px/1 var(--cl-sans, system-ui);
        color: var(--cw-text-muted);
        opacity: .75;
        font-variant-numeric: tabular-nums;
      }

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
        color: var(--cw-text-body, #ece9e2) !important;
        background: var(--cw-surface-hover, rgba(128,128,128,.12)) !important;
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
        color: var(--cw-text-muted, #8b8780) !important;
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
        color: var(--cw-text-body, #ece9e2) !important;
        background: var(--cw-surface-hover, rgba(128,128,128,.12)) !important;
        opacity: 1 !important;
        transform: rotate(-16deg) !important;
      }

      button.${REROLL_CLASS}:active {
        transform: rotate(-24deg) scale(.88) !important;
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
          color: var(--cw-text-body, #ece9e2) !important;
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

        body.${MOBILE_LAYOUT_CLASS}:not(.clawd-welcome) #chat > .mes[is_user="false"]:not(.${SWIPE_VIEW_CLASS}) > button.${LEFT_SWIPE_PROXY_CLASS},
        body.${MOBILE_LAYOUT_CLASS}:not(.clawd-welcome) #chat > .mes[is_user="false"]:not(.${SWIPE_VIEW_CLASS}) > button.${SWIPE_PROXY_CLASS} {
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      }

      /* 以前这里还有 transform: none !important——那是给旧画法按钮整体弹跳用的，
         现在按钮的 transform 是 A2 写的位置（拖动、走路、落点），一并清掉会让 Clawd 在「减少动态」下拖不动。 */
      @media (prefers-reduced-motion: reduce) {
        button.${BUTTON_CLASS} {
          animation: none !important;
          transition: none !important;
        }
      }
    `);
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

  function composerClawd() {
    return hostDocument.querySelector(
      `#send_form > button.${BUTTON_CLASS}.${COMPOSER_CLAWD_CLASS}`,
    );
  }

  function clawdVisualNodes() {
    return hostDocument.querySelectorAll(`button.${BUTTON_CLASS}`);
  }

  function clawdVisibleState() {
    return clawdTracks.C || clawdTracks.A || clawdTracks.B || 'idle';
  }

  function renderClawdTracks() {
    if (!clawdEnabled()) return;
    const visible = clawdVisibleState();
    const owner = clawdTracks.C ? 'C' : clawdTracks.A ? 'A' : 'B';
    const showClawd = clawdEnabled();
    const generationInFlight = clawdTracks.A === 'think'
      || clawdTracks.A === 'stream'
      || clawdTracks.A === 'sit';

    clawdVisualNodes().forEach(button => {
      const isComposer = button.classList.contains(COMPOSER_CLAWD_CLASS);
                                            
                                                  
                                                 
      const state = { clawdA: clawdTracks.A || '', clawdB: clawdTracks.B || '',
        clawdC: clawdTracks.C || '', clawdState: visible, clawdOwner: owner,
        clawdRole: isComposer ? 'composer' : 'signoff' };
      for (const [key, value] of Object.entries(state)) {
        if (button.dataset[key] !== value) button.dataset[key] = value;
      }

      /* 旧主题的 Clawd 开关和 welcome 规则都带 !important。最终显隐由真实
         开关和节点职责写在节点上，避免样式加载顺序误杀大 Clawd；粒子/气泡
         开关不参与本体显隐。 */
      const display = showClawd && (isComposer || !generationInFlight) ? 'block' : 'none';
      if (button.style.getPropertyValue('display') !== display
        || button.style.getPropertyPriority('display') !== 'important') {
        button.style.setProperty('display', display, 'important');
      }

      /* 画面全部由骨架（clawd-rig.js）画；以前这里还给按钮挂 clawd-state-* / clawd-cheer /
         clawd-sleeping / clawd-idle-drowsy / clawd-neglected 这些 class，驱动旧的 ::before 精灵，已随旧画法一起删掉 */
      if (isComposer) syncClawdRig(button, owner);
    });
  }

  function installClawdRigStyle() {
    hostDocument.getElementById(CLAWD_RIG_STYLE_ID)?.remove();
    const RB = `#send_form > button.${BUTTON_CLASS}.${COMPOSER_CLAWD_CLASS}`;
    const style = hostDocument.createElement('style');
    style.id = CLAWD_RIG_STYLE_ID;
    /* 骨架的位置、缩放原点和现网 ::before 一样（left:-4px; top:-14px; 原点 24px 48px = 脚底中点），
       A2 的抓起 / 抛出挪的是按钮本身，骨架跟着一起走。
       2.0.298（Lulu：大 Clawd 有点糊，小 Clawd 清楚很多；选了一格 3px）：原来整体 scale(.85)，一格 2.55px，
       格子边永远落在半个屏幕像素上，怎么画都糊。去掉缩放，一格正好 3px（比原来大 18%，脚底位置不变）；
       停稳时再用 translate 把骨架对齐到整屏幕像素（clawdRigPixelSnap）。 */
    style.textContent = `
      ${RB} > .clawd-rig { display: none; position: absolute; left: -4px; top: -14px; width: 3px; height: 3px;
        transform-origin: 24px 48px; pointer-events: none; }
      ${RB}[data-clawd-rig="on"] > .clawd-rig { display: block; }
      ${RB} .clr-root { position: absolute; left: 0; top: 0; }
      ${RB} .clr-p { position: absolute; left: 0; top: 0; width: 3px; height: 3px; }
      /* 待机时眼睛照旧跟着鼠标看（沿用现网的 clawd-look-* 四个方向），播动作时由动作自己管眼睛 */
      ${RB}[data-clawd-rig="on"]:not([data-clawd-clip]).clawd-look-l .clr-p-eyes { translate: -3px 0; }
      ${RB}[data-clawd-rig="on"]:not([data-clawd-clip]).clawd-look-r .clr-p-eyes { translate: 3px 0; }
      ${RB}[data-clawd-rig="on"]:not([data-clawd-clip]).clawd-look-u .clr-p-eyes { translate: 0 -3px; }
      ${RB}[data-clawd-rig="on"]:not([data-clawd-clip]).clawd-look-d .clr-p-eyes { translate: 0 3px; }
      @media (prefers-reduced-motion: reduce) {
        ${RB} .clawd-rig, ${RB} .clawd-rig * { animation: none !important; }
      }
    ` + CLAWD_RIG.css;
    clawdRigInjected.clear();
    hostDocument.head.append(style);
    clawdRigSchedulePrewarm();
  }

  /* 摸、戳、拎、丢这几段的 CSS 提前在空闲时一次备好（左右两版）。
     按需生成时，每往样式表里追加一段，酒馆那一万多个节点都要重算一遍样式（真机约 60ms 一次），
     按下 → 拎起 → 吊着连着三段就是两百来毫秒卡在手指落下那一刻，
     打断收场的道具也跟着卡住不动（Lulu 2026-09-25：拿起来时杯子过一会儿才掉）。 */
  const CLAWD_RIG_PREWARM = ['press', 'grab', 'drag', 'dragSwing', 'fly', 'land', 'stomp', 'stompSlap', 'pet', 'poke1', 'poke1Shy', 'poke2', 'poke3', 'poke4', 'rage'];
  let clawdRigPrewarmTimer = 0;
  let clawdRigPrewarmIsIdle = false;
  function clawdRigSchedulePrewarm() {
    if (!clawdEnabled()) return;
    if (clawdRigPrewarmTimer) return;
    const run = () => {
      clawdRigPrewarmTimer = 0;
      if (!clawdEnabled()) return;
      const style = hostDocument.getElementById(CLAWD_RIG_STYLE_ID);
      if (!style) return;
      // 打断收场用的常驻容器也在这时建好：第一次按下时再建，要往 body 里插节点、读祖先层级，又是一次整页重算
      const composer = hostDocument.querySelector(`#send_form > button.${BUTTON_CLASS}.${COMPOSER_CLAWD_CLASS}`);
      if (composer) clawdRigGhostHostFor(composer);
      const ids = CLAWD_RIG_PREWARM.filter(id => CLAWD_RIG.clips[id])
        .flatMap(id => [id, id + '-m']).filter(id => !clawdRigInjected.has(id));
      if (!ids.length) return;
      style.append(hostDocument.createTextNode(ids.map(id => CLAWD_RIG.cssFor(id)).join('\n')));
      ids.forEach(id => clawdRigInjected.add(id));
    };
    clawdRigPrewarmIsIdle = typeof hostWindow.requestIdleCallback === 'function';
    clawdRigPrewarmTimer = clawdRigPrewarmIsIdle
      ? hostWindow.requestIdleCallback(run, { timeout: 4000 })
      : clawdLater(run, 1500);
  }

  /* 某个动作第一次要播时，把它的 CSS 追加进骨架样式表 */
  function ensureClawdRigClipCss(id) {
    if (clawdRigInjected.has(id)) return;
    const style = hostDocument.getElementById(CLAWD_RIG_STYLE_ID);
    if (!style) return;
    style.append(hostDocument.createTextNode(CLAWD_RIG.cssFor(id)));
    clawdRigInjected.add(id);
  }

  function ensureClawdRig(button) {
    if(halloween?.enabled&&CLAWD_RIG.createBlinkClock){if(!halloweenBlinkClocks.has(button)){const clock=CLAWD_RIG.createBlinkClock(button,{enabled:()=>!destroyed&&clawdEnabled()});halloweenBlinkClocks.set(button,clock);hostWindow.queueMicrotask(()=>clock.sync());}else halloweenBlinkClocks.get(button).sync();}
    if (button.querySelector(':scope > .clawd-rig')) return;
    const rig = hostDocument.createElement('span');
    rig.className = 'clawd-rig';
    rig.setAttribute('aria-hidden', 'true');
    const root = hostDocument.createElement('span');
    root.className = 'clr-root';
    const flex = hostDocument.createElement('span');
    flex.className = 'clr-flex';
    /* 影子挂在 root 上、不进弹性层：弹性层会整体旋转（歪头、钟摆晃），影子是地上的，不该跟着歪
       （Lulu 2026-09-25 真机：歪头时脚下影子也歪了）。弹性层 z-index:2 自成一层压在影子上面（见 clawd-rig.js） */
    CLAWD_RIG.parts.forEach(part => {
      const node = hostDocument.createElement('i');
      node.className = `clr-p clr-p-${part}`;
      (part === 'shadow' ? root : flex).append(node);
    });
    root.append(flex);
    rig.append(root);
    button.append(rig);
  }

  /* 决定骨架此刻演什么：C > A > B 里当前占画面的那条轨道，按 CLAWD_RIG_A/B/C 查表。
     B 轨 rig:<动作> 是闲置池 / 读信 / 调试菜单直接点名的动作；idle 或查不到 → 骨架待机（呼吸）。 */
  function clawdRigClipFor(owner) {
    if (owner === 'C') {
      if (clawdTracks.C === 't1') return clawdRigPokeT1;
      if (clawdTracks.C in clawdRigVariant) return clawdRigVariant[clawdTracks.C];
      return CLAWD_RIG_C[clawdTracks.C] || '';
    }
    if (owner === 'A') {
      if(halloween?.enabled){if(clawdTracks.A==='error'&&!A2.floor)return 'errorFall';if(['recover','errorSlump'].includes(clawdTracks.A))return clawdTracks.A;if(!A2.floor&&['think','stream'].includes(clawdTracks.A)){if(halloweenSendPending)return 'compose';if(halloweenSendClip)return halloweenSendClip;}}
      return (A2.floor ? CLAWD_RIG_A_HELD : CLAWD_RIG_A)[clawdTracks.A] || '';
    }
    const b = clawdTracks.B || 'idle';
    if (b.startsWith('rig:')) {
      const id = b.slice(4);
      return CLAWD_RIG.clips[id.replace(/-m$/, '')] ? id : '';
    }
    return CLAWD_RIG_B[b] || '';
  }

  /* 两个动作是不是「接着演」的关系（写字 → 完成、歪头 → 回正、扒着 → 出来、抓起 → 吊着）：
     接着演的时候朝向保持和上一个一样，手上的道具也不用掉 */
  function clawdRigContinues(base, curBase) {
    const meta = CLAWD_RIG.clips[base], cur = CLAWD_RIG.clips[curBase];
    if (!meta || !cur) return false;
    if(halloween?.enabled&&/^writeSend(?:Quiet)?$/.test(curBase)&&meta.from==='write')return true;
    return meta.from === curBase || meta.after === curBase || cur.next === base
      || cur.from === base || Boolean(meta.from && meta.from === cur.from);
  }

  /* 靠边时换镜像版（分配方案 §1）：动作朝右伸出去的部分放不下、朝左放得下，就用左右翻过来的版本 */
  const CLAWD_RIG_CELL = 3;                    // 一格美术像素在屏幕上多宽（2.0.298 起骨架不再缩放）
  function clawdRigShouldMirror(button, base) {
    const ext = CLAWD_RIG.extentFor(base);
    if (!ext.l && !ext.r) return false;
    const now = Date.now();
    if (!A2.bndReady || now - A2.bndAt > A2_BOUNDS_TTL) {
      A2.bnd = a2Walls(button);
      A2.bndAt = now;
      A2.bndReady = true;
    }
    const left = A2.x - Math.max(A2.bnd.minx, A2.bnd.minxHome), right = A2.bnd.maxxHome - A2.x;
    const over = (l, r) => Math.max(0, r * CLAWD_RIG_CELL - right) + Math.max(0, l * CLAWD_RIG_CELL - left);
    return over(ext.r, ext.l) < over(ext.l, ext.r);
  }

  /* 被打断时手上的东西怎么收场（分配方案 §4 第 1 条）：把正在显示的道具按当前样子复制一份，再按道具种类演：
     - 种节点的树 / 种子：原地枯萎（褪色、往下缩、淡掉），不飞走
     - 追蝴蝶的蝴蝶：往外侧斜上方飞走
     - 其余（杯子、碗、信、笔、纸……）：先往上一弹，再往 Clawd 外侧翻着掉下去
     第三版（Lulu 2026-09-24）：掉落的幅度和距离加大；树和蝴蝶不再跟着别的道具一起「掉」 */
  /* 着火、警笛被打断：火和警笛直接淡掉（fade），不往下掉（2026-09-29） */
  const CLAWD_RIG_INTERRUPT = Object.freeze({ plant: 'wither', plantWilt: 'wither', butterfly: 'fly', onFire: 'fade', siren: 'fade', sirenBlue: 'fade' });
  /* 收场的复制品不能挂在 Clawd 身上：被拎起来的时候它会跟着一起飞上去（Lulu 2026-09-24：种子跟着 Clawd 一起起来了）。
     挂在 body 下一个常驻的 position:fixed 容器里，按打断那一刻骨架在屏幕上的位置和缩放摆好。
     （第一版挂在 #send_form 里，欢迎页那条「#send_form > 除 #nonQRFormItems 外全部隐藏」把它一起藏了。）
     层级取按钮最外层带 z-index 的祖先（酒馆里是 #sheld），同值、后插入，所以压在输入框那一层上面。

     性能（Lulu 2026-09-25：拿起来时杯子过一会儿才掉）：酒馆页面一万多个节点，每次「改了 DOM 再读样式」都要整页重算一遍，
     约 50ms。以前每个道具「读样式 → 往 body 里插一层 → 再读下一个道具 → animate」，按下那一下要重算三四遍、卡 150ms 左右。
     现在先把要读的一次读完，再一次性插进常驻容器（容器早就在 body 里，往它里面加东西不牵动整页），最后才开始动画。 */
  let clawdRigGhostHost = null;
  const clawdRigGhostJobs = new Map();
  function removeClawdRigGhost(layer) {
    const job = clawdRigGhostJobs.get(layer);
    if (job) {
      cancelClawdLater(job.timer);
      job.animations.forEach(animation => animation.cancel());
      clawdRigGhostJobs.delete(layer);
    }
    layer.remove();
  }

  function cleanupClawdRigEffects() {
    halloweenErrorPending=false;halloweenSendClip='';halloweenSendPending=false;
    for(const clock of halloweenBlinkClocks.values())clock.destroy();halloweenBlinkClocks.clear();
    if (clawdRigPrewarmTimer) {
      if (clawdRigPrewarmIsIdle) hostWindow.cancelIdleCallback?.(clawdRigPrewarmTimer);
      else cancelClawdLater(clawdRigPrewarmTimer);
      clawdRigPrewarmTimer = 0;
    }
    for (const layer of clawdRigGhostJobs.keys()) removeClawdRigGhost(layer);
    clawdRigGhostHost?.remove();
    clawdRigGhostHost = null;
    clawdRigSnap = null;
  }
  function clawdRigGhostHostFor(button) {
    if (!clawdRigGhostHost || !clawdRigGhostHost.isConnected) {
      clawdRigGhostHost = hostDocument.createElement('span');
      clawdRigGhostHost.className = 'clr-ghost-host';
      clawdRigGhostHost.setAttribute('aria-hidden', 'true');
      let z = 1;
      for (let el = button.parentElement; el && el !== hostDocument.body; el = el.parentElement) {
        const zi = hostWindow.getComputedStyle(el).zIndex;
        if (zi !== 'auto') z = Number(zi) || z;
      }
      clawdRigGhostHost.style.cssText = `position:fixed;display:block;left:0;top:0;width:0;height:0;margin:0;padding:0;`
        + `pointer-events:none;overflow:visible;contain:layout style;z-index:${z}`;
      hostDocument.body.append(clawdRigGhostHost);
    }
    return clawdRigGhostHost;
  }
  /* ① 读：道具现在的样子和骨架在屏幕上的位置。
     这一步要在「改 DOM / 改样式」之前做才便宜：按钮上改一个内联样式，再读就得整页重算（约 60ms）。
     所以按下那一刻先拍一张（clawdRigSnapshotProps，a2Down 一进来就拍），打断收场时直接用；
     别的地方打断（生成开始、闲置换动作……）没有预先拍的，就当场读 */
  function clawdRigReadProps(button) {
    const rig = button.querySelector(':scope > .clawd-rig');
    const flex = rig && rig.querySelector('.clr-flex');
    if (!flex || !button.dataset.clawdClip) return null;
    const props = [];
    for (const node of flex.querySelectorAll('.clr-p-propA, .clr-p-propB')) {
      const cs = hostWindow.getComputedStyle(node);
      const o = Number(cs.opacity);
      if (!cs.boxShadow || cs.boxShadow === 'none' || o === 0) continue;
      props.push({ shadow: cs.boxShadow, left: cs.left, top: cs.top, z: cs.zIndex, o });
    }
    if (!props.length) return null;
    const rcs = hostWindow.getComputedStyle(rig);
    const root = rig.querySelector('.clr-root');
    const rootCs = root ? hostWindow.getComputedStyle(root) : null;
    const rect = rig.getBoundingClientRect();
    return {
      props, rect,
      rootT: rootCs ? rootCs.transform : 'none',
      rootL: rootCs ? rootCs.left : '0px', rootT2: rootCs ? rootCs.top : '0px',
      origin: rcs.transformOrigin.split(' ').map(v => parseFloat(v) || 0),
    };
  }
  let clawdRigSnap = null;
  function clawdRigSnapshotProps(button) {
    clawdRigSnap = null;
    if (!button.dataset.clawdClip || clawdPrefersReducedMotion()) return;
    clawdRigSnap = { clip: button.dataset.clawdClip, at: Date.now(), data: clawdRigReadProps(button) };
  }
  function clawdRigDropProps(button, clipBase) {
    if (clawdPrefersReducedMotion()) { clawdRigSnap = null; return; }
    const cur = button.dataset.clawdClip || '';
    const snap = clawdRigSnap && clawdRigSnap.clip === cur && Date.now() - clawdRigSnap.at < 150 ? clawdRigSnap : null;
    clawdRigSnap = null;
    const data = snap ? snap.data : clawdRigReadProps(button);
    if (!data) return;
    const { props, rect, rootT, rootL, rootT2 } = data;
    const [ox, oy] = data.origin;
    const kind = CLAWD_RIG_INTERRUPT[clipBase] || 'drop';
    const mid = 8 * 3;                           // Clawd 框中线（骨架坐标，未缩放）
    const scale = rect.width / 3 || 1;            // .clawd-rig 本身 3×3px，量出来的宽 / 3 = 屏幕上实际缩放
    const host = clawdRigGhostHostFor(button);
    // ② 再写：整组一次插进去
    const layer = hostDocument.createElement('span');
    // 缩放绕 (ox, oy) 做：缩放后的左上角 = 原左上角 + 原点 × (1 − 缩放)，倒推回原左上角
    layer.style.cssText = `position:absolute;display:block;width:3px;height:3px;`
      + `left:${rect.left - ox * (1 - scale)}px;top:${rect.top - oy * (1 - scale)}px;`
      + `transform:scale(${scale});transform-origin:${ox}px ${oy}px`;
    const inner = hostDocument.createElement('span');
    inner.style.cssText = `position:absolute;display:block;left:${rootL};top:${rootT2};transform:${rootT}`;
    layer.append(inner);
    const UP = 'cubic-bezier(.2,.7,.4,1)', DOWN = 'cubic-bezier(.55,0,.85,.5)';
    const jobs = props.map(p => {
      const pts = [...p.shadow.matchAll(/(-?[\d.]+)px (-?[\d.]+)px 0px/g)].map(m => [Number(m[1]), Number(m[2])]);
      const ax = pts.length ? pts.reduce((sum, pt) => sum + pt[0], 0) / pts.length : mid;
      const ay = pts.length ? pts.reduce((sum, pt) => sum + pt[1], 0) / pts.length : 0;
      const by = pts.length ? Math.max(...pts.map(pt => pt[1])) : 0;
      const dir = ax + (parseFloat(p.left) || 0) < mid ? -1 : 1;
      const o = p.o;
      const ghost = hostDocument.createElement('i');
      ghost.className = 'clr-ghost';
      ghost.style.cssText = `position:absolute;display:block;width:3px;height:3px;box-shadow:${p.shadow};left:${p.left};top:${p.top};`
        + `z-index:${p.z};opacity:${o};transform-origin:${ax}px ${kind === 'wither' ? by : ay}px`;
      inner.append(ghost);
      /* 缓动写在每一段上，整体 linear。以前整体 ease-in：前 30% 的时间几乎不动，
         杯子、信在原地僵半秒才往下掉。现在一打断就动：掉落先快速往上一弹（减速），再加速掉下去；枯萎一开始就往下缩 */
      const frames = kind === 'fade' ? [
        { opacity: o, easing: 'ease-out' },
        { opacity: 0 },
      ] : kind === 'wither' ? [
        { scale: '1 1', filter: 'none', opacity: o, easing: 'ease-out' },
        { scale: '1 .7', filter: 'grayscale(1)', opacity: o * .7, offset: .35, easing: 'ease-in' },
        { scale: '1 .15', filter: 'grayscale(1)', opacity: 0 },
      ] : kind === 'fly' ? [
        { translate: '0 0', opacity: o, easing: 'ease-out' },
        { translate: `${dir * 15}px -15px`, opacity: o, offset: .35 },
        { translate: `${dir * 36}px -42px`, opacity: 0 },
      ] : [
        { translate: '0 0', rotate: '0deg', opacity: o, easing: UP },
        { translate: `${dir * 15}px -12px`, rotate: `${dir * 30}deg`, opacity: o, offset: .25, easing: DOWN },
        { translate: `${dir * 36}px 24px`, rotate: `${dir * 110}deg`, opacity: 0 },
      ];
      return [ghost, frames];
    });
    host.append(layer);
    const job = { timer: clawdLater(() => removeClawdRigGhost(layer), 1200), animations: [] };
    clawdRigGhostJobs.set(layer, job);
    // ③ 最后开始动
    for (const [ghost, frames] of jobs) {
      try {
        job.animations.push(ghost.animate(frames, { duration: kind === 'drop' ? 800 : 900, easing: 'linear', fill: 'forwards' }));
      } catch (error) { ghost.remove(); }
    }
  }

  function syncClawdRig(button, owner) {
    ensureClawdRig(button);
    if (button.dataset.clawdRig !== 'on') button.dataset.clawdRig = 'on';
    const current = button.dataset.clawdClip || '';
    const curBase = current.replace(/-m$/, '');
    if (owner === 'C' && clawdTracks.C === 't1' && curBase !== 'poke1' && curBase !== 'poke1Shy') {
      clawdRigPokeT1 = Math.random() < .34 ? 'poke1Shy' : 'poke1';
    }
    let clip = clawdRigClipFor(owner);
    /* 歪头结束（问号删掉、或者被别的状态接走）：先播 0.4 秒回正，播完再切过去 */
    if (clip.replace(/-m$/, '') !== 'tilt') {
      const now = Date.now();
      if (curBase === 'tilt') {
        clawdRigUntiltUntil = now + CLAWD_RIG.clips.untilt.dur;
        clawdLater(() => { if (!destroyed) renderClawdTracks(); }, CLAWD_RIG.clips.untilt.dur + 20);
        clip = 'untilt';
      } else if (curBase === 'untilt' && now < clawdRigUntiltUntil) {
        clip = 'untilt';
      }
    }
    const base = clip.replace(/-m$/, '');
    const continues = Boolean(base && curBase && clawdRigContinues(base, curBase));
    /* 朝向：点名要镜像版的（rig:xxx-m）和走路（方向由走路自己定）照办；同一个动作接着播不换朝向；
       接着上一个动作演的，朝向跟上一个一样；其余看两边的空间够不够 */
    if (base && !clip.endsWith('-m') && base !== 'walkLoop') {
      if (base === curBase) return;
      const mirror = continues ? current.endsWith('-m') : clawdRigShouldMirror(button, base);
      clip = mirror ? base + '-m' : base;
    }
    if (clip === current) return;
    const brewingTransition = halloween?.enabled && /^(write|sitWrite|writeHeld|writeSend|writeSendQuiet|done|stopped|error|doneHeld|stoppedHeld|errorHeld|errorFall|recover)$/.test(curBase);
    if (current && !continues && !brewingTransition) clawdRigDropProps(button, curBase);
    button.removeAttribute('data-clawd-clip');
    if (clip) {
      if (base.startsWith('glowstick')) clawdRigPickStickColors(button);
      ensureClawdRigClipCss(clip);
      /* 以前这里无条件 void button.offsetWidth 强制重排，想让同一个动作连播时从头开始。
         但走到这里时 clip 一定和 current 不同（相同的上面已经 return 了），属性值一变动画本来就会重播；
         在酒馆这么大的页面上这一下要 90ms 左右，按下拎起时全卡在这里（Lulu 2026-09-25） */
      button.dataset.clawdClip = clip;
    }
  }

  /* 彩棒颜色：每次播随机（Lulu 2026-09-29），双手版两根各抽一个、不重复。
     骨架里彩棒的颜色走 CSS 变量 --stick-a（右手）/ --stick-b（双手版左手），设在按钮上，骨架各层继承 */
  const CLAWD_STICK_COLORS = Object.freeze(['#7dff9b', '#ff6bd6', '#6be4ff', '#fff36b', '#ff9b4a', '#b18cff', '#ff5c6c']);
  function clawdRigPickStickColors(button) {
    const n = CLAWD_STICK_COLORS.length;
    const a = Math.floor(Math.random() * n);
    const b = (a + 1 + Math.floor(Math.random() * (n - 1))) % n;
    button.style.setProperty('--stick-a', CLAWD_STICK_COLORS[a]);
    button.style.setProperty('--stick-b', CLAWD_STICK_COLORS[b]);
  }

  function clawdMealTime(now = new Date()) {
    const m = now.getHours() * 60 + now.getMinutes();
    return (m >= 690 && m <= 780) || (m >= 1050 && m <= 1170);   // 11:30–13:00、17:30–19:30
  }

  /* 从长动作池里抽一个；抽不到（都在冷却）返回 null */
  /* 2.0.309（Lulu）：要把东西放在 / 种在输入框上的动作（Rickroll 的话筒架、种节点），只在大 Clawd 站在输入框上方时抽：
     坐在小 Clawd 头上、或者人在输入框左右两边外面（输入框变窄了还没走回来）时不抽。 */
  const CLAWD_RIG_ON_COMPOSER_ONLY = new Set(['rickroll', 'plant']);
  function clawdOverComposer() {
    if (A2.floor || A2.held || Math.abs(A2.fy) > .5) return false;
    if (!A2.bndReady) return true;
    return A2.x >= A2.bnd.minxHome - 1 && A2.x <= A2.bnd.maxxHome + 1;
  }
  function pickClawdRigClip(now) {
    const meal = clawdMealTime();
    const overComposer = clawdOverComposer();
    const ok = CLAWD_RIG_POOL
      .filter(item => overComposer || !CLAWD_RIG_ON_COMPOSER_ONLY.has(item.id))
      .filter(item => !(clawdRigLastPlayed[item.id] && now - clawdRigLastPlayed[item.id] < item.cool))
      .map(item => ({ ...item, w: meal && item.mealWeight ? item.mealWeight : item.weight }));
    const total = ok.reduce((sum, item) => sum + item.w, 0);
    if (!total) return null;
    let roll = Math.random() * total;
    for (const item of ok) { if ((roll -= item.w) <= 0) return item.id; }
    return ok[ok.length - 1].id;
  }

  /* 打断：B 轨上有时限的动作（闲置小动作、复合动作、走路、读信……）被 A / C 盖过去以后就作废。
     以前 B 轨还挂着，等 A / C 结束又从头播一遍（Lulu 2026-09-24：被打断的动作过一会又自己播起来）。
     打字、睡觉这些没有时限的 B 状态不动，它们本来就该在 A / C 结束后回来。 */
  function clawdCancelTransientB() {
    if (!clawdTracks.bUntil) return;
    clawdTracks.B = 'idle';
    clawdTracks.bUntil = 0;
  }

  /* 2.0.300：大 Clawd 头上坐着小 Clawd 时，只做安静的（眨眼、走路、东张西望、指、挠、扶额，滚动时扒边）。
     要做别的动作、开始写字、被戳——头上的先跳开。被拎起来走 a2Move 那条（降下来）。
     2.0.302（Lulu：小 Clawd 放不上大 Clawd）：待机状态每 200ms 刷新一次（syncClawdBState），被冷落 / 犯困 / 睡着 / 看你打字
     都不在名单里，刚放上去下一次刷新就把它抖下来了。这四个身子基本不动，也算安静的；而且只在换成新动作的那一刻判断，同一个状态的刷新不算。 */
  /* 2.0.311（Lulu：它写的时候会把上面的挤掉，不用挤掉）：写字（think / stream / sit）身子不动、纸笔在身前，头上的接着坐；
     停止、出错两种结尾也只是钳子耷拉一下。完成要举钳蹦一下，那个照旧让头上的先跳开。 */
  const CLAWD_QUIET_WITH_RIDERS = new Set(['idle', 'peek', 'peekOut', 'walkLoop', 'around', 'point', 'scratch', 'facepalm', 'press', 'neglected', 'drowsy', 'sleep', 'compose',
    'think', 'stream', 'sit', 'stopped', 'error']);
  function clawdShakeRiders(value) {
    if (!value) return;
    const base = String(value).replace(/^rig:/, '').replace(/-m$/, '');
    if (CLAWD_QUIET_WITH_RIDERS.has(base)) return;
    clawdPile.unloadBig('hop');
  }
  /* 它坐着的那只小 Clawd 被拿走：平滑地降下来。2.0.312：正下方还有别的小 Clawd 就坐到它头上（挪正），没有才降回输入框上。
     返回坐到了谁头上（给 clawd-pile.js），降到输入框上返回 null。 */
  function clawdBigLower() {
    const button = composerClawd();
    A2.floor = 0;
    let seat = null, cx = 0;
    const rig = button?.querySelector(':scope > .clawd-rig')?.getBoundingClientRect();
    if (rig?.width && !A2.held) {
      cx = rig.left + 24;
      seat = clawdPile.seats().filter(st => Math.abs(cx - st.cx) < Math.max(48, st.w) * .5).sort((a, b) => b.h - a.h)[0] || null;
    }
    if (seat) A2.floor = -seat.h;
    if (clawdTracks.A) renderClawdTracks();   // 2.0.310：写字时坐着 / 不坐着换不同的写法
    if (!button) return null;
    if (A2.held) {
      // 支撑撤走时还被手指按着：位置仍交给手势，松手必须走无支撑回落，不能停在旧座位上。
      A2.petting = false;
      cancelClawdLater(A2.petTimer);
      return null;
    }
    button.style.setProperty('transition', 'transform .4s cubic-bezier(.4,0,.2,1)', 'important');
    A2.fy = A2.floor;
    if (seat) { A2.x += seat.cx - cx; A2.homeX = A2.x; }
    a2Place(button);
    clawdLater(() => { if (!A2.held) { button.style.removeProperty('transition'); scheduleA2BoundsWarm(button); } }, 420);
    return seat ? seat.name : null;
  }

  function setClawdA(value, duration = 0) {
    if (value) clawdComposerReaction.reset();
    /* 生成永远优先：它能取消 A2 的生气序列。反过来不行——序列锁只挡 C 轨。 */
    a2CancelSeq();
    if (value !== clawdTracks.A) clawdShakeRiders(value);
    if (value) clawdCancelTransientB();
    const now = Date.now();
    clawdTracks.A = value || null;
    clawdTracks.aStartedAt = value ? now : 0;
    if (value === 'think' && !duration) duration = 16000;
    if (value === 'stream' && !duration) duration = 20000;
    clawdTracks.aUntil = value && duration ? now + duration : 0;
    renderClawdTracks();
    if (!value && clawdTracks.B === 'idle') syncClawdBState();
  }

  function setClawdB(value, duration = 0) {
    if ((value || 'idle') !== clawdTracks.B) clawdShakeRiders(value);
    clawdTracks.B = value || 'idle';
    clawdTracks.bUntil = value && duration ? Date.now() + duration : 0;
    renderClawdTracks();
  }

  /* A2 的序列锁只允许放进这个入口，避免 pointer/落地回调各写一份守卫。
     散到各处的后果是真踩过的：抛掷的落地回调曾经绕过全部守卫，把生气序列砸穿。 */
  function setClawdC(value, duration = 0) {
    if (value) clawdComposerReaction.reset();
    if (a2Locked() && !A2.seqOwned) return;
    if (value) clawdCancelTransientB();
    if (value !== 'grab' && value !== 'drag' && value !== clawdTracks.C) clawdShakeRiders(value);   // 拎起来那条已经让头上的降下来了
    clawdTracks.C = value || null;
    clawdTracks.cUntil = value && duration ? Date.now() + duration : 0;
    renderClawdTracks();
    if (!value && clawdTracks.B === 'idle') syncClawdBState();
  }

  let clawdRhythm = null;
  function clawdOnMessageSent(){
    clawdRhythm?.freezeCompose();
    if(!halloween?.enabled||!clawdEnabled()||hostDocument.documentElement.dataset.claudeMotion==='off'||clawdPrefersReducedMotion()||A2.floor||halloweenSendClip)return;
    if(!halloweenSendPending&&!/^compose(-m)?$/.test(composerClawd()?.dataset.clawdClip||''))return;
    halloweenSendPending=false;halloweenSendClip=clawdPile.riderCount()?'writeSendQuiet':'writeSend';setClawdA('think');
  }
  function beginClawdGeneration(type='normal') {
    clawdTracks.round += 1;
    clawdTracks.activeRound = clawdTracks.round;
    clawdTracks.genStartedAt = Date.now();
    if(halloween?.enabled&&!halloweenSendClip&&type==='normal'&&clawdEnabled()&&hostDocument.documentElement.dataset.claudeMotion!=='off'&&!clawdPrefersReducedMotion()&&/^compose(-m)?$/.test(composerClawd()?.dataset.clawdClip||''))halloweenSendPending=true;
    setClawdA('think');
  }

  function settleClawdGeneration(outcome = 'done', replyArrived = false) {
    const round = clawdTracks.activeRound;
    if (!round || clawdTracks.settledRound === round) return;
    clawdTracks.settledRound = round;
    if(halloween?.enabled){
      halloweenSendPending=false;halloweenSendClip='';
      if(!clawdEnabled()||hostDocument.documentElement.dataset.claudeMotion==='off'||clawdPrefersReducedMotion()){halloweenErrorPending=false;return;}
      if(outcome==='error')halloweenErrorPending=true;
      if(outcome==='done'&&replyArrived&&halloweenErrorPending){halloweenErrorPending=false;setClawdA('recover',CLAWD_RIG.clips.recover.dur);}
      else {const clip=outcome==='error'&&!A2.floor?'errorFall':(A2.floor?CLAWD_RIG_A_HELD:CLAWD_RIG_A)[outcome];setClawdA(outcome,CLAWD_RIG.clips[clip]?.dur||1400);}
      return;
    }
    /* 复合动作的「完成」是 1.8 秒（丢笔丢纸 + 蹦两下），比旧的欢呼长一点 */
    setClawdA(outcome, CLAWD_RIG.clips[outcome]?.dur || 1400);
  }

  function createClawdComposerReaction(duration, blocked, now = Date.now) {
    let before = null, composition = null, reaction = null, serial = 0;
    const snapshot = box => ({ box, value: box.value, start: box.selectionStart, end: box.selectionEnd });
    const reset = () => { before = null; composition = null; reaction = null; };
    const inserted = (old, box) => {
      if (!old || old.box !== box || old.value === box.value) return '';
      const prefix = old.value.slice(0, old.start), suffix = old.value.slice(old.end);
      if (!box.value.startsWith(prefix) || !box.value.endsWith(suffix) || box.value.length < prefix.length + suffix.length) return '';
      return box.value.slice(prefix.length, box.value.length - suffix.length);
    };
    const commit = (old, box, expected) => {
      const addition = inserted(old, box);
      if (expected != null && addition !== expected) return false;
      const mark = (addition.match(/[?？!！](?=[^?？!！]*$)/) || [''])[0];
      if (mark && !blocked()) { const state = /[!！]/.test(mark) ? 'wow' : 'tilt'; reaction = { state, until: now() + duration(state), serial: ++serial }; }
      return true;
    };
    const handle = event => {
      const box = event.target;
      if (box?.id !== 'send_textarea') return;
      if (!event.isTrusted) { before = null; composition = null; return; }
      if (event.type === 'compositionstart') { composition = { ...snapshot(box), ended: false }; before = null; return; }
      if (event.type === 'beforeinput') {
        before = /^(insertText|insertFromPaste|insertFromDrop|insertCompositionText|insertFromComposition)$/.test(event.inputType || '') ? snapshot(box) : null;
        return;
      }
      if (event.type === 'compositionend') {
        if (!composition) return;
        composition.ended = true; composition.expected = event.data;
        if (commit(composition, box, event.data)) { composition = null; before = null; }
        return;
      }
      if (event.type !== 'input' || event.isComposing || (composition && !composition.ended)) return;
      if (composition) { commit(composition, box, composition.expected); composition = null; }
      else if (/^(insertText|insertFromPaste|insertFromDrop|insertCompositionText|insertFromComposition)$/.test(event.inputType || '')) commit(before, box);
      before = null;
    };
    const current = () => { if (reaction && (blocked() || now() >= reaction.until)) reaction = null; return reaction; };
    return { handle, current, reset };
  }

  const clawdComposerReaction = createClawdComposerReaction(state => CLAWD_RIG.clips[state].dur,
    () => destroyed || !!(clawdTracks.A || clawdTracks.C || a2Locked() || idleAsleep || ccSleeping || ccDrowsy));
  let clawdComposerReactionSerial = 0;
  const handleClawdComposerEdit = event => {
    if (!clawdEnabled()) return;
    clawdReadingGate.reset();
    clawdComposerReaction.handle(event);
    if (event.type === 'compositionend') syncClawdBState();
  };

  function syncClawdBState() {
    if (!clawdEnabled()) return;
    const box = hostDocument.querySelector('#send_textarea');
    const focused = Boolean(box && hostDocument.activeElement === box);
    const text = box?.value?.trim() || '';
    const reaction = focused ? clawdComposerReaction.current() : null;
    if (!focused) clawdComposerReaction.reset();
    const next = (idleAsleep || ccSleeping) ? 'sleep' : ccDrowsy ? 'drowsy'
      : reaction ? reaction.state : focused && text ? 'compose' : neglected ? 'neglected' : 'idle';
    if (reaction) {
      const replay = reaction.serial !== clawdComposerReactionSerial && clawdTracks.B === next;
      clawdComposerReactionSerial = reaction.serial;
      setClawdB(next, Math.max(1, reaction.until - Date.now()));
      if (replay) for (const animation of composerClawd()?.querySelector('.clawd-rig')?.getAnimations?.({ subtree: true }) || []) animation.currentTime = 0;
      return;
    }
    if (clawdTracks.bUntil > Date.now()
      && (next === 'idle' || next === 'neglected' || next === 'drowsy' || next === 'sleep')) {
      renderClawdTracks(); return;
    }
    setClawdB(next);
  }

  /* 原型里不需要新帧的低频在场动作。复用现有 200ms runtime tick，不新增
     高频监听，也不读布局。每次演完才安排下一次，避免空闲页上一直闹腾。 */
  const CLAWD_B_AMBIENT_POSES = Object.freeze([
    /* 2026-09-24 Lulu 定：双跳（像「完成」）、扒边（和滚动时扒住输入框重复）、甩身子 移出闲置池。
       它们的样式先留着，等第 4 批按新骨架重做短闲置时一起清。 */
    { state: 'around', duration: CLAWD_RIG.clips.around.dur },
    { state: 'spin', duration: CLAWD_RIG.clips.spin.dur },
    { state: 'lean', duration: CLAWD_RIG.clips.lean.dur },
    { state: 'hide', duration: CLAWD_RIG.clips.hide.dur },
    { state: 'tramp', duration: CLAWD_RIG.clips.tramp.dur },
    /* 第二批（2026-09-24）：旧原型里的挠一下、蹲起、比爱心、指向、扶额。
       推发送按钮不放进来：Clawd 只在输入框上沿活动，碰不到发送按钮（Lulu 2026-09-24） */
    { state: 'scratch', duration: CLAWD_RIG.clips.scratch.dur },
    { state: 'crouch', duration: CLAWD_RIG.clips.crouch.dur },
    { state: 'heart', duration: CLAWD_RIG.clips.heart.dur },
    { state: 'point', duration: CLAWD_RIG.clips.point.dur },
    { state: 'facepalm', duration: CLAWD_RIG.clips.facepalm.dur },
  ]);
  let clawdBAmbientNextAt = Date.now() + 18000;
  /* C1a：系统开了「减少动态」就不播闲置小动作。每次现查，用户中途改设置也能跟上。 */
  function clawdPrefersReducedMotion() {
    try { return Boolean(hostWindow.matchMedia?.('(prefers-reduced-motion: reduce)').matches); }
    catch (error) { return false; }
  }
  let clawdBLastAmbient = '';

  function scheduleClawdBAmbient(now = Date.now(), retry = false) {
    clawdBAmbientNextAt = now + (retry ? 5000 : 22000 + Math.round(Math.random() * 14000));
  }

  function maybePlayClawdBAmbient(now) {
    if (now < clawdBAmbientNextAt) return;
    const box = hostDocument.querySelector('#send_textarea');
    const blocked = hostDocument.hidden
      || clawdPrefersReducedMotion()
      || !composerClawd()
      || clawdTracks.A
      || clawdTracks.C
      || clawdTracks.B !== 'idle'
      || clawdTracks.bUntil
      || Boolean(box && hostDocument.activeElement === box)
      || Boolean(box?.value?.trim())
      || isTypingActive();
    if (blocked) {
      scheduleClawdBAmbient(now, true);
      return;
    }

    /* 2.0.300：头上坐着小 Clawd：只走路或做安静的小动作 */
    if (clawdPile.riderCount()) {
      if (Math.random() < .35 && clawdWalk(now)) { clawdBLastAmbient = 'rig:walk'; scheduleClawdBAmbient(now + 6000); return; }
      const quiet = CLAWD_B_AMBIENT_POSES.filter(pose => ['around', 'point', 'scratch', 'facepalm'].includes(pose.state) && pose.state !== clawdBLastAmbient);
      const pose = quiet[Math.floor(Math.random() * quiet.length)];
      if (pose) { clawdBLastAmbient = pose.state; setClawdB(pose.state, pose.duration); }
      scheduleClawdBAmbient(now);
      return;
    }
    /* C1b：约三成的轮次抽长的复合动作（带冷却），其余照旧抽短的填空小动作 */
    if (Math.random() < 0.3) {
      const id = pickClawdRigClip(now);
      if (id === 'walk') {
        /* 踱步 = 真的走到输入框上沿别处，走到哪就待在哪（分配方案 §0）；这次走不了（两边都没地方）就改抽短动作 */
        clawdRigLastPlayed.walk = now;
        const ms = clawdWalk(now);
        if (ms) {
          clawdBLastAmbient = 'rig:walk';
          scheduleClawdBAmbient(now + ms);
          return;
        }
      } else if (id) {
        clawdRigLastPlayed[id] = now;
        /* 种节点有两种结尾，随机一个：节点散成点飘走 / 原地枯萎（Lulu 2026-09-24） */
        /* 彩棒每次随机一种应援形态：左右甩 / 一起上下 / 一上一下（Lulu 2026-09-29），冷却记在池里的 id 上 */
        const forms = CLAWD_RIG_FORMS[id];
        const play = forms ? forms[Math.floor(Math.random() * forms.length)]
          : id === 'plant' && Math.random() < .5 ? 'plantWilt' : id;
        clawdBLastAmbient = 'rig:' + play;
        setClawdB('rig:' + play, CLAWD_RIG.clips[play].dur);
        scheduleClawdBAmbient(now + CLAWD_RIG.clips[play].dur);
        return;
      }
    }
    const choices = CLAWD_B_AMBIENT_POSES.filter(pose => pose.state !== clawdBLastAmbient);
    const pose = choices[Math.floor(Math.random() * choices.length)] || CLAWD_B_AMBIENT_POSES[0];
    clawdBLastAmbient = pose.state;
    setClawdB(pose.state, pose.duration);
    scheduleClawdBAmbient(now);
  }

  /* 走路：整只按钮沿输入框上沿平移过去，腿在骨架里原地迈步（walkLoop；往右走用镜像版）。
     一步 300ms 走 1 格，和原型里的踱步同速。走整条范围的 20%–40%，往空间大的那边走。
     半路被抓 / 被戳 / 开始生成：就停在当时的位置。返回这次走多久（毫秒），走不了返回 0。 */
  let clawdWalkRun = 0;
  let clawdWalkNudge = null;   // 2.0.306：走到一半输入框变宽变窄，整段路跟着挪（watchClawdFormWidth）
  function clawdWalk(now = Date.now()) {
    const button = composerClawd();
    if (!button || A2.held || A2.fy !== 0 || A2.floor !== 0) return 0;   // 坐在小 Clawd 头上时不走（走就掉下去了）
    if (!A2.bndReady || now - A2.bndAt > A2_BOUNDS_TTL) {
      A2.bnd = a2Walls(button);
      A2.bndAt = now;
      A2.bndReady = true;
    }
    const lo = Math.max(A2.bnd.minx, A2.bnd.minxHome), hi = A2.bnd.maxxHome;
    if (!(hi - lo > 40 && hi - lo < 1e5)) return 0;
    const roomL = A2.x - lo, roomR = hi - A2.x;
    const want = (hi - lo) * (.2 + Math.random() * .2);
    let dir = roomR > roomL + 20 ? 1 : roomL > roomR + 20 ? -1 : (Math.random() < .5 ? -1 : 1);
    let dist = Math.min(want, dir > 0 ? roomR : roomL);
    if (dist < 24) { dir = -dir; dist = Math.min(want, dir > 0 ? roomR : roomL); }
    /* 2.0.296：人在输入框外面（输入框变窄了之类）：这一趟就往输入框上走，走进去再多走一点 */
    if (roomL < 0) { dir = 1; dist = Math.min(hi - A2.x, -roomL + want / 2); }
    else if (roomR < 0) { dir = -1; dist = Math.min(A2.x - lo, -roomR + want / 2); }
    /* 2.0.300：走过去碰到站在输入框上的小 Clawd 就停在它前面（大 Clawd 不再给它们让位，也不推它们） */
    const rigR = button.querySelector(':scope > .clawd-rig')?.getBoundingClientRect();
    if (rigR?.width) {
      const bl = rigR.left, br = rigR.left + 48;
      for (const b of clawdPile.blocks()) {
        if (dir > 0 && b.l >= br - 1) dist = Math.min(dist, b.l - br - 4);
        if (dir < 0 && b.r <= bl + 1) dist = Math.min(dist, bl - b.r - 4);
      }
    }
    if (dist < 24) return 0;
    const steps = Math.max(2, Math.floor(dist / CLAWD_RIG_CELL));
    const walkMs = steps * 300;
    const intro = CLAWD_RIG.clips.walkLoop.intro || 0;
    let from = A2.x, to = from + dir * steps * CLAWD_RIG_CELL;
    const state = dir > 0 ? 'rig:walkLoop-m' : 'rig:walkLoop';
    const run = ++clawdWalkRun;
    setClawdB(state, intro + walkMs + 50);
    button.style.setProperty('transition', 'none', 'important');
    const t0 = Date.now() + intro;
    const end = () => { clawdWalkNudge = null; A2.homeX = A2.x; button.style.removeProperty('transition'); clawdPile.followEnd(); scheduleA2BoundsWarm(button); };
    clawdWalkNudge = d => { from += d; to += d; };
    const step = () => {
      if (run !== clawdWalkRun || destroyed) return;
      if (clawdTracks.B !== state || clawdTracks.A || clawdTracks.C || A2.held || A2.fy !== 0) { end(); return; }
      clawdPile.follow(A2.x - from);   // 头上的小 Clawd 跟着挪
      const k = Math.min(1, Math.max(0, (Date.now() - t0) / walkMs));
      A2.x = from + (to - from) * k;
      a2Place(button);
      if (k < 1) requestClawdFrame(step);
      else end();
    };
    requestClawdFrame(step);
    return intro + walkMs + 50;
  }

  /* 2.0.306（Lulu：大 Clawd 放在小 Clawd 中间，换页面以后还是会错开）：大 Clawd 的按钮挂在输入框左边，
     以前输入框变宽变窄（欢迎页 706 ↔ 对话页 847、窗口缩放）时它跟着左边走，小 Clawd 按中线走（2.0.292），叠着的就错开了。
     现在大 Clawd 也按中线：宽度每变一次，A2.x 挪半个差值，屏幕上原地不动；还在默认位置、没动过的照旧待在左边。
     挪完让小 Clawd 按它的新位置重新摆头上那几只（两个 ResizeObserver 谁先到都对得上）。 */
  let clawdFormRO = null, clawdFormObserved = null, clawdFormW = 0;
  function watchClawdFormWidth(form) {
    if (clawdFormObserved === form || !hostWindow.ResizeObserver) return;
    clawdFormRO?.disconnect();
    clawdFormObserved = form; clawdFormW = 0;
    clawdFormRO = new hostWindow.ResizeObserver(() => {
      const w = form.clientWidth; if (!w) return;
      const old = clawdFormW; clawdFormW = w;
      if (old && w !== old) clawdShiftWithForm((w - old) / 2);
    });
    clawdFormRO.observe(form);
  }
  function clawdShiftWithForm(d) {
    const button = composerClawd();
    if (!button || (!A2.x && !A2.floor && !A2.held)) return;   // 还在默认位置：不挪
    A2.x += d; A2.homeX += d;
    if (A2.held) A2.ox += d;   // 拎着：按住的地方不变
    clawdWalkNudge?.(d);
    /* 按钮自己有 .15s 的 transform 过渡：这一下要瞬间到位（屏幕上本来就该不动），不然小 Clawd 量到的还是半路的位置 */
    const walking = !!clawdWalkNudge;
    if (!walking) button.style.setProperty('transition', 'none', 'important');
    a2Place(button);
    clawdPile.restack();
    if (!walking) requestClawdFrame(() => { if (!clawdWalkNudge && !A2.held) button.style.removeProperty('transition'); });
    scheduleA2BoundsWarm(button);
  }

  function ensureComposerClawd() {
    if (!clawdEnabled()) return null;
    const form = hostDocument.querySelector('#send_form');
    if (!form) return null;
    let button = composerClawd();
    if (!button) {
      button = createButton('composer');
      form.append(button);
      scheduleA2BoundsWarm(button);
    }
    watchClawdFormWidth(form);
    clawdPile.ensure();
    syncClawdBState();
    return button;
  }

  /* 先做离散疲劳态：流式生成持续 12 秒后坐下。下一阶段的 applyTired 会把
     这段改成连续量（跳高、周期、下沉一起渐变），这里先确保 sit 真正有触发。 */
  const CLAWD_TIRED_SIT_MS = 12000;
  /* 生成事件丢失时的最后兜底：一轮生成最长认 5 分钟。 */
  const CLAWD_GEN_MAX_MS = 300000;

  function clawdRuntimeTick() {
    if (!clawdEnabled()) return;
    const now = Date.now();
    const inGeneration = clawdTracks.A === 'think' || clawdTracks.A === 'stream' || clawdTracks.A === 'sit';
    if (inGeneration && generationEventActive && now - clawdTracks.genStartedAt >= CLAWD_GEN_MAX_MS) {
      /* C1a：结束事件一直没来（事件丢失）的最后兜底，按「停止」收场，不庆祝。 */
      settleClawdGeneration('stopped');
    } else if (clawdTracks.A === 'think'
      && generationEventActive
      && now - clawdTracks.aStartedAt >= 900) {
      setClawdA('stream');
    } else if (clawdTracks.A === 'stream'
      && generationEventActive
      && now - clawdTracks.aStartedAt >= CLAWD_TIRED_SIT_MS) {
      /* 不走 setClawdA：aStartedAt / aUntil 继续代表这一轮生成，不能在坐下时
         重置，否则超时围栏和结束事件会把它当成一轮新生成。 */
      clawdTracks.A = 'sit';
      renderClawdTracks();
    } else if (clawdTracks.aUntil && now >= clawdTracks.aUntil) {
      if (clawdTracks.A === 'think' || clawdTracks.A === 'stream' || clawdTracks.A === 'sit') {
        /* C1a：think / stream 的时长只是兜底。酒馆的生成事件还说「在生成」时，
           到点也不结算——以前 stream 的 20 秒一到就会在长回复中途提前庆祝，
           而且会把这一轮标成已结算，真正的结束 / 失败事件来了反而被挡掉。
           事件一直不来的情况由本函数开头的 CLAWD_GEN_MAX_MS 兜底处理。 */
        if (!generationEventActive) settleClawdGeneration('done');
      } else {
        if(halloween?.enabled&&clawdTracks.A==='recover')setClawdA('done',CLAWD_RIG.clips.done.dur);
        else setClawdA(halloween?.enabled&&halloweenErrorPending?'errorSlump':null);
      }
    }
    if (clawdTracks.bUntil && now >= clawdTracks.bUntil) {
      clawdTracks.bUntil = 0;
      syncClawdBState();
    }
    if (clawdTracks.cUntil && now >= clawdTracks.cUntil) setClawdC(null);
    /* A2 的三条衰减挂在这个唯一的 200ms tick 上，不另开定时器。
       烦躁的衰减从「最后一次互动」算起，不是按挂钟固定掉档——按挂钟的话
       连戳间隔 760ms 时净增长只有 0.3 档/秒，永远爬不到第 4 档。 */
    if (A2.irr > 0 && now - A2.lastDec > 1000 && !a2Locked()) {
      A2.lastDec = now;
      A2.irr = Math.max(0, A2.irr - 1);
    }
    if (A2.lockUntil && !a2Locked()) { A2.lockUntil = 0; A2.lockName = ''; }
    if (A2.throws > 0 && now - A2.lastThrow > 15000) A2.throws = 0;
    if (now - clawdLastIdleTickAt >= 5000) {
      clawdLastIdleTickAt = now;
      refreshIdleSleep();
    }
    maybePlayClawdBAmbient(now);
  }

  /* D2 生成计时器：measures how long the current streaming reply has been
     running. 用同一套 GENERATION_STARTED/ENDED/STOPPED 事件驱动，跟原生
     的 typing indicator 进出场是同一个事实来源，不用自己猜生成有没有
     结束。可开关（html[data-claude-gen-timer]），关掉时直接不建元素，
     不占任何一帧。 */
  let genTimerEl = null;
  let genTimerStartedAt = 0;
  let genTimerTickTimer = 0;
  let genTimerLingerTimer = 0;
  const GEN_TIMER_LINGER_MS = 4000;

  function genTimerEnabled() {
    return hostDocument.documentElement.dataset.claudeGenTimer !== 'off';
  }

  function ensureGenTimerEl() {
    if (genTimerEl && genTimerEl.isConnected) return genTimerEl;
    genTimerEl = hostDocument.createElement('div');
    genTimerEl.className = 'clawd-gen-timer';
    genTimerEl.setAttribute('aria-hidden', 'true');
    hostDocument.body.append(genTimerEl);
    return genTimerEl;
  }

  function tickGenTimer() {
    if (!genTimerEl || !genTimerStartedAt) return;
    const elapsed = (hostWindow.performance.now() - genTimerStartedAt) / 1000;
    const nextText = elapsed.toFixed(1) + 's';
    if (genTimerEl.textContent !== nextText) genTimerEl.textContent = nextText;
  }

  function startGenTimer() {
    if (!genTimerEnabled()) return;
    const el = ensureGenTimerEl();
    if (genTimerLingerTimer) {
      hostWindow.clearTimeout(genTimerLingerTimer);
      genTimerLingerTimer = 0;
    }
    genTimerStartedAt = hostWindow.performance.now();
    el.classList.remove('clawd-gen-timer-done');
    el.classList.add('clawd-gen-timer-visible');
    tickGenTimer();
    if (!genTimerTickTimer) genTimerTickTimer = hostWindow.setInterval(tickGenTimer, 200);
  }

  function stopGenTimer() {
    hostWindow.clearInterval(genTimerTickTimer); genTimerTickTimer = 0;
    if (!genTimerStartedAt || !genTimerEl) return; // 没真的开始过（比如开关关闭时收到结束事件）
    const elapsed = (hostWindow.performance.now() - genTimerStartedAt) / 1000;
    genTimerEl.textContent = (ccPrefersChinese() ? '用时 ' : 'took ') + elapsed.toFixed(1) + 's';
    genTimerEl.classList.add('clawd-gen-timer-done');
    genTimerStartedAt = 0;
    if (genTimerLingerTimer) hostWindow.clearTimeout(genTimerLingerTimer);
    genTimerLingerTimer = hostWindow.setTimeout(() => {
      genTimerEl?.classList.remove('clawd-gen-timer-visible');
      genTimerLingerTimer = 0;
    }, GEN_TIMER_LINGER_MS);
  }

  /* 生成开始时记下聊天的样子，结束时对比，判断这一轮有没有真的收到回复。
     impersonate（替你写）和 quiet（后台生成）不往聊天里写东西，不做这个判断。 */
  let clawdGenSnapshot = null;
  function snapshotChatForClawd(type) {
    const chat = getContext()?.chat;
    if (!Array.isArray(chat)) return null;
    const last = chat[chat.length - 1];
    return {
      type: String(type || 'normal'),
      len: chat.length,
      lastMes: last?.mes ?? null,
      lastSwipes: Array.isArray(last?.swipes) ? last.swipes.length : 0,
    };
  }
  function clawdReplyArrived(snap) {
    if (/^(impersonate|quiet)$/.test(snap.type)) return true;
    const chat = getContext()?.chat;
    if (!Array.isArray(chat)) return true;       // 读不到聊天就别冤枉它，照常庆祝
    const last = chat[chat.length - 1];
    if (!last || last.is_user || !String(last.mes ?? '').trim()) return false;
    if (chat.length > snap.len) return true;     // 多了一条新回复
    const swipes = Array.isArray(last.swipes) ? last.swipes.length : 0;
    return last.mes !== snap.lastMes || swipes !== snap.lastSwipes;   // 重新生成 / 继续写
  }

  function setGeneratingFlag(on) {
    const root = hostDocument.documentElement;
    if (on) root.dataset.cwGenerating = '1'; else delete root.dataset.cwGenerating;
  }

  let nativeGenerationSeen = false;
  let nativeStartTimer = 0;
  let delayedGeneration = null;

  function clearNativeStartTimer() {
    hostWindow.clearTimeout(nativeStartTimer);
    nativeStartTimer = 0;
  }

  function finishClawdGeneration(outcome) {
    clearNativeStartTimer();
    delayedGeneration = null;
    generationEventActive = false;
    nativeGenerationSeen = false;
    setGeneratingFlag(false);
    setBodyClass(GENERATING_CLASS, false);
    stopGenTimer();
    const replied = !!clawdGenSnapshot && clawdReplyArrived(clawdGenSnapshot);
    settleClawdGeneration(outcome === "done" && clawdGenSnapshot && !replied ? "error" : outcome, outcome === "done" && replied);
    clawdGenSnapshot = null;
    scheduleRefresh();
  }

  function startClawdGeneration(type, snapshot = snapshotChatForClawd(type)) {
    const wasActive = generationEventActive;
    generationEventActive = true;
    setGeneratingFlag(type !== 'quiet');
    startGenTimer();
    if (!wasActive || clawdTracks.settledRound === clawdTracks.activeRound) {
      beginClawdGeneration(type);
      clawdGenSnapshot = snapshot;
    }
    scheduleRefresh();
  }

  function syncNativeGeneration() {
    if (!generationEventActive && !delayedGeneration) return;
    // Theme CSS overrides stop-button visibility. Read the native markers.
    const stop = hostDocument.getElementById('mes_stop');
    const active = hostDocument.body?.dataset.generating === 'true' || stop?.style.display === 'flex';
    if (active) {
      clearNativeStartTimer();
      nativeGenerationSeen = true;
      if (delayedGeneration) {
        const { type, snapshot } = delayedGeneration;
        delayedGeneration = null;
        startClawdGeneration(type, snapshot);
      }
    } else if (nativeGenerationSeen) {
      finishClawdGeneration('done');
    }
  }
  function watchGenerationEvents() {
    if (generationSubscriptions.length || destroyed) return;
    const context = getContext();
    const source = context?.eventSource;
    const types = context?.eventTypes || context?.event_types || {};
    if (!source?.on) return;
    streamFollow ??= installStreamFollow({ win: hostWindow, doc: hostDocument, getContext, enabled: () => isMobileLayout() && !frameworkCompatibilityMode });

    if (isTauriTavernHost()) deleteAnchor ??= installDeleteAnchor({win: hostWindow, doc: hostDocument, getContext});
    const seen = new Set();
    const subscribe = (key, fallback, outcome) => {
      const type = types[key] || fallback;
      if (!type || seen.has(type)) return;
      seen.add(type);
      const handler = (...args) => {
        /* SillyTavern may emit a dry-run generation while only assembling a
           prompt. It must not turn the visible send control into Stop. */
        const active = outcome === 'start';
        if (active && args[2] === true) return;
        if (!active) { finishClawdGeneration(outcome); return; }
        clearNativeStartTimer();
        nativeGenerationSeen = false;
        delayedGeneration = null;
        const type = String(args[0] ?? 'normal');
        startClawdGeneration(type);
        syncNativeGeneration();
        if (!nativeGenerationSeen) nativeStartTimer = hostWindow.setTimeout(() => {
          syncNativeGeneration();
          if (!generationEventActive || nativeGenerationSeen) return;
          // ST may return early or still be awaiting a planning extension.
          const snapshot = clawdGenSnapshot;
          finishClawdGeneration('stopped');
          delayedGeneration = { type, snapshot };
        }, 1000);
      };
      source.on(type, handler);
      generationSubscriptions.push({ source, type, handler });
    };

    /* C1b：你不在页面上时来了回复，等你回来 Clawd 读一封信 */
    const sentType=types.MESSAGE_SENT||'message_sent';source.on(sentType,clawdOnMessageSent);generationSubscriptions.push({source,type:sentType,handler:clawdOnMessageSent});
    const receivedType = types.MESSAGE_RECEIVED || 'message_received';
    const onReceived = () => { if (hostDocument.hidden) clawdLetterPending = true; };
    source.on(receivedType, onReceived);
    generationSubscriptions.push({ source, type: receivedType, handler: onReceived });

    /* 2.0.250：重 Roll 用这个判断「酒馆是不是真的开始生成过」（见 runSwipeProxy）。试运行（dryRun，只算 token）不算。 */
    const startCountType = types.GENERATION_STARTED || 'generation_started';
    const onStartCount = (_type, _options, dryRun) => { if (!dryRun) generationStartSeq += 1; };
    source.on(startCountType, onStartCount);
    generationSubscriptions.push({ source, type: startCountType, handler: onStartCount });
    subscribe('GENERATION_STARTED', 'generation_started', 'start');
    subscribe('GENERATION_ENDED', 'generation_ended', 'done');
    subscribe('GENERATION_STOPPED', 'generation_stopped', 'stopped');
    subscribe('GENERATION_FAILED', 'generation_failed', 'error');
  }

    // 2026-11-04（蛋糕，iOS TT）：删除消息后跳回好多条之前。只在 TauriTavern 里装（isTauriTavernHost）。
    // TT 的 ChatSurface 删除第 k 条时会把 k 之后的消息全部换成新元素，TT 的 style.css 又给 .mes 设了
    // content-visibility:auto + 200px 占位；新元素第一次排版按占位算，聊天高度临时变小，浏览器把 scrollTop
    // 压到新的最大值，内容长回来后位置不恢复（CW 移除也一样跳；原生 ST 不重建元素，不跳，所以不装）。
    // 两层：① MESSAGE_DELETED 里同步给新换上的消息临时加 content-visibility:visible（1 秒后撤），让第一次排版
    // 就用真实高度；② 记住可视区最上面那条消息（存数据对象，编号和元素都会变）和偏移，删除后约 700ms 内逐帧
    // 放回原偏移，作最后一道保险。用户 wheel / touchstart / keydown / pointerdown 任何一下就停。
    // 末条删除在底部时保持底部1.5秒；非底部回退到前一条锚点。多选删除仍跳过。
    // iOS录屏还显示进入原生删除选择模式就跳动，因此另守住模式进入前的位置。
    function installDeleteAnchor({ win, doc, getContext }) {
      const chat = doc.getElementById("chat");
      const context = getContext();
      const source = context?.eventSource;
      const types = context?.eventTypes || context?.event_types || {};
      if (!chat || !source?.on) return null;
      const RELEASE_MS = 1e3, HOLD_MS = 700, LAST_HOLD_MS = 1500, BOTTOM_PX = 80, PIN_TAIL = 20;
      let anchor = null, known = null, holding = !1, holdKind = '', userMoved = !1, stopAt = 0, captureFrame = 0, holdFrame = 0, releaseTimer = 0, destroyed = !1;
      let pinned = [];
      let frameObserver = null, frameCleanups = [];
      const messages = () => chat.querySelectorAll(":scope > .mes");
      const capture = () => {
        if (destroyed || holding || doc.querySelector("dialog[open]")) return;
        const list = getContext()?.chat;
        if (!Array.isArray(list)) return;
        const top = chat.getBoundingClientRect().top;
        for (const message of messages()) {
          const rect = message.getBoundingClientRect();
          if (rect.bottom <= top + 1) continue;
          const id = Number(message.getAttribute("mesid"));
          const data = list[id];
          const before = list.slice(Math.max(0, id - 3), id).map((data, index) => {
            const prior = chat.querySelector(`:scope > .mes[mesid="${Math.max(0, id - 3) + index}"]`);
            return { data, offset: prior ? prior.getBoundingClientRect().top - top : 0 };
          }).reverse();
          anchor = data ? { data, before, after: list.slice(id + 1, id + 4), offset: rect.top - top, count: list.length, last: list[list.length - 1], beforeLast: list[list.length - 2], atBottom: chat.scrollHeight - chat.clientHeight - chat.scrollTop <= BOTTOM_PX } : null;
          return;
        }
        anchor = null;
      };
      const scheduleCapture = () => {
        captureFrame || (captureFrame = win.requestAnimationFrame(() => { captureFrame = 0; capture(); }));
      };
      const release = () => {
        win.clearTimeout(releaseTimer);
        releaseTimer = 0;
        for (const {message, value, priority} of pinned) {
          if (value) message.style.setProperty("content-visibility", value, priority);
          else message.style.removeProperty("content-visibility");
        }
        pinned = [];
      };
      const stopHolding = () => {
        win.cancelAnimationFrame(holdFrame);
        holdFrame = 0;
        holding = !1;
        holdKind = '';
        frameObserver?.disconnect(); frameObserver = null;
        for (const cleanup of frameCleanups.splice(0)) cleanup();
      };
      const watchFrameInput = () => {
        const seen = new WeakSet(), options = {capture:true, passive:true};
        const scan = root => { if (root.matches?.('iframe')) watch(root); for (const frame of root.querySelectorAll?.('iframe') || []) watch(frame); };
        const watch = frame => {
          if (seen.has(frame)) return; seen.add(frame);
          let unbind = () => {};
          const bind = () => {
            unbind();
            try {
              const child = frame.contentDocument; if (!child) return;
              for (const type of ['pointerdown','touchstart','wheel','keydown']) child.addEventListener(type, moved, options);
              unbind = () => { for (const type of ['pointerdown','touchstart','wheel','keydown']) child.removeEventListener(type, moved, options); };
              frameObserver?.observe(child, {childList:true, subtree:true}); scan(child);
            } catch { /* Cross-origin frames yield through host focus below. */ }
          };
          frame.addEventListener('load', bind); frameCleanups.push(() => { unbind(); frame.removeEventListener('load', bind); }); bind();
        };
        frameObserver = new win.MutationObserver(records => { if (!holding) return; for (const record of records) for (const node of record.addedNodes) if (node.nodeType === 1) scan(node); });
        frameObserver.observe(chat, {childList:true, subtree:true}); scan(chat);
      };
      const pinTail = (before, all, duration) => {
        release();
        for (const message of [...messages()].slice(-PIN_TAIL)) {
          const value = message.style.getPropertyValue('content-visibility');
          if (value === 'visible' || !all && (before?.has(message) || value)) continue;
          pinned.push({message, value, priority: message.style.getPropertyPriority('content-visibility')});
          message.style.setProperty('content-visibility', 'visible');
        }
        if (pinned.length) releaseTimer = win.setTimeout(release, Math.max(RELEASE_MS, duration + 100));
      };
      const startHold = (apply, duration, kind) => {
        stopHolding(); holding = !0; holdKind = kind; userMoved = !1;
        watchFrameInput();
        stopAt = win.performance.now() + duration;
        apply();
        const tick = () => {
          holdFrame = 0;
          if (destroyed) return;
          if (userMoved || win.performance.now() > stopAt) { stopHolding(); release(); capture(); return; }
          apply(); holdFrame = win.requestAnimationFrame(tick);
        };
        holdFrame = win.requestAnimationFrame(tick);
      };
      const restore = () => {
        const saved = anchor, list = getContext()?.chat, before = known;
        known = null;
        if (destroyed || !saved || !Array.isArray(list)) return;
        // Identity checks distinguish a single last deletion from a replaced chat.
        if (list.length !== saved.count - 1) return;
        const lastDeleted = !list.includes(saved.last) && list[list.length - 1] === saved.beforeLast;
        if (!lastDeleted && list[list.length - 1] !== saved.last) return;
        if (lastDeleted && saved.atBottom) {
          pinTail(before, true, LAST_HOLD_MS);
          startHold(() => { chat.scrollTop = chat.scrollHeight; }, LAST_HOLD_MS, 'delete');
          return;
        }
        let id = list.indexOf(saved.data), offset = saved.offset;
        if (id < 0) {
          id = saved.after.map(data => list.indexOf(data)).find(index => index >= 0) ?? -1;
          offset = Math.max(0, offset);
        }
        if (id < 0 && lastDeleted) {
          const prior = saved.before.find(item => list.includes(item.data));
          if (prior) { id = list.indexOf(prior.data); offset = prior.offset; }
        }
        if (id < 0) return;
        // ① TT 刚换上的元素（点删除前不在的）先按真实高度排版。被压只发生在靠近底部的时候，
        //    所以只看最后 PIN_TAIL 条，长聊天里删很早的消息也不会一下子渲染几百条。这里不能读布局。
        const duration = lastDeleted ? LAST_HOLD_MS : HOLD_MS;
        if (before) pinTail(before, false, duration);
        // ② 把原来最上面那条放回原偏移。
        const apply = () => {
          const message = chat.querySelector(`:scope > .mes[mesid="${id}"]`);
          if (!message) return;
          const drift = message.getBoundingClientRect().top - chat.getBoundingClientRect().top - offset;
          Math.abs(drift) > 1 && (chat.scrollTop += drift);
        };
        startHold(apply, duration, 'delete');
      };
      const reset = () => { anchor = null; known = null; stopHolding(); release(); win.setTimeout(capture, 300); };
      const onPointerDown = () => {
        // 点删除、点确认框都会先经过这里：记下此刻在页的消息元素，删除后据此认出 TT 新换上的元素。
        userMoved = !0;
        stopHolding(); release();
        known = new WeakSet(messages());
        capture();
      };
      const moved = () => { userMoved = !0; stopHolding(); release(); };
      const onHostBlur = event => {
        if (!holding || event.target !== win) return;
        const frame = doc.activeElement;
        if (frame?.tagName !== 'IFRAME' || !chat.contains(frame)) { moved(); return; }
        try { if (!frame.contentDocument) moved(); } catch { moved(); }
      };
      const onScroll = event => { event.target === chat && scheduleCapture(); };
      const listeners = [
        [doc, "scroll", onScroll, { capture: !0, passive: !0 }],
        [doc, "pointerdown", onPointerDown, { capture: !0, passive: !0 }],
        [win, "blur", onHostBlur, {passive:true}],
        ...["wheel", "touchstart", "keydown"].map(type => [doc, type, moved, { capture: !0, passive: !0 }])
      ];
      for (const [target, type, fn, options] of listeners) target.addEventListener(type, fn, options);
      const deleteMode = doc.getElementById('dialogue_del_mes');
      // CW mirrors this bar and hides its paint; the native inline toggle is the state.
      const deleteModeActive = () => !!deleteMode && !deleteMode.hidden && (deleteMode.style.display ? deleteMode.style.display !== 'none' : win.getComputedStyle(deleteMode).display !== 'none');
      let modeOpen = deleteModeActive();
      const modeObserver = deleteMode ? new win.MutationObserver(() => {
        const open = deleteModeActive();
        if (open === modeOpen) return;
        modeOpen = open;
        if (!open) { if (holdKind === 'mode') { stopHolding(); release(); } return; }
        const saved = anchor, list = getContext()?.chat;
        if (!saved || !Array.isArray(list) || list.length !== saved.count) return;
        const id = list.indexOf(saved.data); if (id < 0) return;
        pinTail(known, saved.atBottom, LAST_HOLD_MS);
        startHold(() => {
          if (saved.atBottom) { chat.scrollTop = chat.scrollHeight; return; }
          const message = chat.querySelector(`:scope > .mes[mesid="${id}"]`);
          if (message) chat.scrollTop += message.getBoundingClientRect().top - chat.getBoundingClientRect().top - saved.offset;
        }, LAST_HOLD_MS, 'mode');
      }) : null;
      modeObserver?.observe(deleteMode, {attributes:true, attributeFilter:['style','hidden']});
      const subscriptions = [];
      const subscribe = (key, fallback, fn) => {
        const type = types[key] || fallback;
        source.on(type, fn);
        subscriptions.push({ type, fn });
      };
      subscribe("MESSAGE_DELETED", "message_deleted", restore);
      subscribe("CHAT_CHANGED", "chat_id_changed", reset);
      subscribe("MORE_MESSAGES_LOADED", "more_messages_loaded", reset);
      capture();
      return {
        destroy() {
          if (destroyed) return;
          destroyed = !0;
          modeObserver?.disconnect();
          win.cancelAnimationFrame(captureFrame);
          stopHolding();
          release();
          for (const [target, type, fn, options] of listeners) target.removeEventListener(type, fn, options);
          for (const { type, fn } of subscriptions) {
            source.removeListener?.(type, fn);
            source.off?.(type, fn);
          }
          subscriptions.length = 0;
          anchor = null;
          known = null;
        }
      };
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

    function embeddedSurfaceScheme() {
      const rootScheme = hostWindow.getComputedStyle(hostDocument.documentElement).colorScheme || "";
      return /dark/.test(rootScheme) ? "dark" : /light/.test(rootScheme) || hostDocument.documentElement.dataset.claudeIntegratedTheme === "day" ? "light" : "dark";
    }
    // 2026-11-02：切换日夜时，已经渲染好的前端卡还留着旧的 color-scheme，跟页面对不上，浏览器就给 iframe 垫一层白底，
    // 要刷新才好（LingerCola 的 MVU 栏）。主题属性变了、或者新主题样式表加载完时，配色真的变了才重新上色一次；不轮询。
    // 只看属性不够：属性先变，新样式表后到，那一刻根元素的 color-scheme 还是旧的。
    function repaintSurfacesIfSchemeChanged() {
      if (destroyed) return;
      const next = embeddedSurfaceScheme();
      if (next === surfaceScheme) return;
      surfaceScheme = next;
      refreshEmbeddedSurfaces();
    }
    function onThemeStylesheetLoad(event) {
      event.target?.id === "claude-integrated-theme-live-style" && repaintSurfacesIfSchemeChanged();
    }
  function paintEmbeddedFrame(frame) {
    frame.setAttribute(EMBED_ATTRIBUTE, 'true');
    frame.style.setProperty('background', 'transparent', 'important');
    frame.style.setProperty('background-color', 'transparent', 'important');
    /* iframe 里文档的 color-scheme 和 <iframe> 元素自己的 color-scheme 不一致时，浏览器会把
       iframe 画布画成不透明（浅色方案就是一整块白），里面 body 再透明也没用——数据库美化正则
       的白边就是这个。配色预设可以让页面是深色方案、而日夜变体仍是 day，所以方案取页面实际的
       color-scheme，并把同一个值同时写到 iframe 元素和注入的样式上，两边永远一致。 */
    const scheme = embeddedSurfaceScheme();
    frame.style.setProperty('color-scheme', scheme, 'important');
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
      const styles = [...frameDocument.querySelectorAll(`style#${EMBED_STYLE_ID}`)];
      if (!styles.length) {
        const style = frameDocument.createElement('style');
        style.id = EMBED_STYLE_ID;
        (frameDocument.head ?? frameDocument.documentElement).append(style);
        styles.push(style);
      }
      styles.forEach(style => style.textContent !== injectedCss && (style.textContent = injectedCss));
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
      `#chat > .mes .mes_text :is(div, section, article, main, figure):not(.${REGEX_SURFACE_CLASS})`,
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
    const frames = [...hostDocument.querySelectorAll('#chat > .mes .mes_text iframe')];
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
    const halloweenDelete = halloween?.captureDelete(message);
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
      try { await context.deleteMessage(id, canDeleteSwipe ? selectedSwipe : undefined, true); } finally { halloween?.finishDelete(halloweenDelete); }
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

  function createUserEditAction(message) {
    const actions = hostDocument.createElement('div');
    actions.className = USER_ACTIONS_CLASS;
    actions.dataset.claudeUserActionVersion = 'edit-delete';
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
      else hostWindow.toastr?.warning('没有找到酒馆原生编辑入口。', '无法编辑');
    });

    const del = hostDocument.createElement('button');
    del.type = 'button';
    del.className = USER_DELETE_CLASS;
    del.title = '删除消息';
    del.setAttribute('aria-label', '删除消息');
    del.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      safelyDeleteMessage(message).catch(error => {
        console.error('[Claude Clawd] Failed to delete message safely.', error);
        hostWindow.toastr?.error('删除消息时发生错误，原消息已保留。', '删除失败');
      });
    });

    actions.append(edit, del);
    return actions;
  }

  function refreshUserActions() {
    /* TT 会把用户消息的 .ch_name 压成零高，里面的原生铅笔因此不可见。
       这里做可见的编辑 / 删除入口：编辑转发给原生 .mes_edit；删除走
       safelyDeleteMessage（酒馆 deleteMessage 自带确认弹窗）。 */
    const messages = [...hostDocument.querySelectorAll('#chat > .mes[is_user="true"]')];
    const liveMessages = new Set(messages);
    hostDocument.querySelectorAll(`.${USER_ACTIONS_CLASS}`).forEach(actions => {
      const message = actions.closest('#chat > .mes');
      if (!liveMessages.has(message)) actions.remove();
    });
    messages.forEach(message => {
      const block = message.querySelector(':scope > .mes_block');
      if (!block) return;
      let actions = block.querySelector(`:scope > .${USER_ACTIONS_CLASS}`);
      if (actions?.dataset.claudeUserActionVersion !== 'edit-delete') {
        actions?.remove();
        actions = null;
      }
      if (!actions) block.append(createUserEditAction(message));
    });
  }

  /* ST 会为每个提示词行生成真实的 .drag-handle，TT 2.2.0 则会把这个
     节点整个省掉，只留下类型图标和名称。Sortable 的 handle 选择器在
     pointerdown 时按 class 匹配，所以补回同名真实节点即可恢复拖拽；
     已有手柄的 ST 行不动，避免重复显示或改变它的原生事件链。 */
  function refreshPromptManagerDragHandles() {
    hostDocument
      .querySelectorAll('#completion_prompt_manager_list li.completion_prompt_manager_prompt:not([data-preset-favorite-mirror])')
      .forEach(row => {
        if (row.closest('.bai-bai-preset-vue-list-host')) return;
        const existingHandle = row.querySelector(':scope > .drag-handle');
        if (existingHandle && !existingHandle.classList.contains(PROMPT_DRAG_HANDLE_CLASS) && !isTauriTavernHost()) return;
        let handle = existingHandle;
        if (!handle) {
          handle = hostDocument.createElement('span');
          handle.className = 'drag-handle';
          handle.setAttribute('aria-hidden', 'true');
          row.prepend(handle);
        }
        handle.classList.add(PROMPT_DRAG_HANDLE_CLASS);
        const presetList = row.closest('.cw-pm-list');
        Object.entries({
          position: 'static',
          display: presetList?.classList.contains('cw-pm-multi') ? 'none' : 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          minWidth: '28px',
          height: '28px',
          margin: '0',
          padding: '0',
          color: '#73736f',
          visibility: 'visible',
          opacity: '0.9',
          pointerEvents: 'auto',
          boxShadow: 'none',
          filter: 'none',
          textShadow: 'none',
        }).forEach(([property, value]) => handle.style.setProperty(property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`), value, 'important'));
        if (presetList) {
          for (const [property, value] of [['grid-column','1'],['grid-row','1'],['align-self','center'],['justify-self','center']]) {
            if (handle.style.getPropertyValue(property) !== value) handle.style.setProperty(property, value, 'important');
          }
        }
        if (handle.querySelector(':scope > .' + PROMPT_DRAG_GLYPH_CLASS)) return;
        handle.textContent = '';
        const glyph = hostDocument.createElement('span');
        glyph.className = PROMPT_DRAG_GLYPH_CLASS;
        glyph.setAttribute('aria-hidden', 'true');
        Object.entries({
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          width: '16px',
          height: '16px',
          visibility: 'visible',
          opacity: '1',
          boxShadow: 'none',
          filter: 'none',
          textShadow: 'none',
        }).forEach(([property, value]) => glyph.style.setProperty(property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`), value, 'important'));
        for (let index = 0; index < 3; index += 1) {
          const bar = hostDocument.createElement('span');
          Object.entries({
            display: 'block',
            boxSizing: 'border-box',
            width: '16px',
            minWidth: '16px',
            height: '2px',
            minHeight: '2px',
            margin: '0',
            padding: '0',
            background: '#73736f',
            border: '0',
            borderRadius: '1px',
            boxShadow: 'none',
            filter: 'none',
            textShadow: 'none',
            visibility: 'visible',
            opacity: '1',
          }).forEach(([property, value]) => bar.style.setProperty(property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`), value, 'important'));
          glyph.append(bar);
        }
        handle.append(glyph);
      });
  }

  function removeStaleButtons() {
    /* A1 之后消息里不再保留任何一只 Clawd —— 角色整体搬到了输入框上方。
       这里无条件清掉所有非 composer 实例：历史消息里的、上一轮遗留的、
       以及任何路径重新创建出来的，都在这一处收口。 */
    hostDocument.querySelectorAll(`.${BUTTON_CLASS}`).forEach(button => {
      if (button.classList.contains(COMPOSER_CLAWD_CLASS)) return;
      button.remove();
    });
    hostDocument.querySelectorAll('button.clawd-mobile-clawd-button').forEach(button => button.remove());
  }

  /* ===== A2：抓起 / 拖动 / 抛掷 / 戳的 5 档 / 生气序列 =====
     参考实现是 diagnostics/clawd-合并原型.html 里的 walls / mv / up / ballistic /
     phys / poke / playSeq / cancelSeq / locked / sulkSeq / place。原型是独立页面，
     扩展不是，移植时改了这几处：

     1) 节点分工。原型的 Clawd 是 .body/.shadow/.sym 三个节点，靠 7 个 @property
        注册过的自定义属性合成 transform。扩展只有 button 本体加一个 3x3 的
        ::before。这里改成：位置/旋转/压扁由 JS 写在 button 上（一条完整的
        transform 字符串），姿势换帧由 CSS 写在 ::before 上。两者在不同节点，
        transform 天然叠加，用不着 @property。

     2) 布局读取。空气墙在按钮挂载或输入框尺寸变化后的空闲帧预热；正常的
        pointerdown / pointermove 都只写不读。只有页面刚启动、预热尚未完成时，
        pointerdown 才回退读一次。

     3) touch-action。可拖 Clawd 静止时就固定为 none，因为 Android 在 pointerdown
        监听执行前已经决定当前手势能否滚动；等按下后再切对这次手势无效。
        button 上原有的 transition:transform 240ms !important 会把拖拽拉成橡皮筋，
        仍在 A2 接管期间用内联 important 盖掉。

     4) 判定归 pointerup：拖过就是抛，没拖过才是戳。click 监听保留，但会跳过
        指针路径已经处理过的那一次——留着它是为了键盘 Enter 激活，那条路径
        不产生 pointer 事件。 */

  function a2Locked() { return Date.now() < A2.lockUntil; }

  /* 只写，不读。旋转和压扁必须跟位移写进同一条 transform——transform 是单一
     属性，分两次写的话后一次会把前一次整条覆盖掉。
     回到原位时把内联样式整个撤掉，让 A1 的动画恢复原样。 */
  function a2Place(button, ballistic = false) {
    halloweenAirborne = ballistic || A2.held || A2.dragging || Math.abs(A2.fy - A2.floor) > .5;
    const move = `translate3d(${A2.x.toFixed(1)}px, ${A2.fy.toFixed(1)}px, 0)`;
    const home = !A2.x && !A2.fy;
    if (home && !A2.rot && A2.sqx === 1 && A2.sqy === 1) {
      button.style.removeProperty("transform");
      if (halloween?.enabled) halloween.positionClawd({ airborne: ballistic || A2.held || A2.dragging || Math.abs(A2.fy - A2.floor) > .5, x: A2.x, y: A2.fy });
      return;
    }
    let value = move;
    A2.rot && (value += ` rotate(${A2.rot.toFixed(1)}deg)`);
    A2.sqx === 1 && A2.sqy === 1 || (value += ` scale(${A2.sqx.toFixed(3)}, ${A2.sqy.toFixed(3)})`);
    button.style.setProperty("transform", value, "important");
    if (halloween?.enabled) halloween.positionClawd({ airborne: ballistic || A2.held || A2.dragging || Math.abs(A2.fy - A2.floor) > .5, x: A2.x, y: A2.fy });
  }

  /* ===== 原子序列与锁 =====
     多步动作（转身生气）必须整段播完，中途不能被同级事件掐断。
     用嵌套 setTimeout 串多步是踩过的坑：被打断之后旧链继续烧，动画被吞、
     还会重复触发。所以要序列运行器 + 代次令牌 + 上锁，锁只放 setClawdC 一个入口。 */
  function a2CancelSeq() {
    if (!A2.lockUntil) { A2.seqRun += 1; return; }
    A2.seqRun += 1;
    A2.lockUntil = 0;
    A2.lockName = '';
    /* 取消时把 C 轨一起清掉，别留半截姿势 */
    A2.seqOwned = true;
    setClawdC(null);
    A2.seqOwned = false;
  }

  function a2PlaySeq(steps, name) {
    const my = (A2.seqRun += 1);
    const total = steps.reduce((sum, item) => sum + item[1], 0);
    A2.lockUntil = Date.now() + total;
    A2.lockName = name || '序列';
    const run = index => {
      if (my !== A2.seqRun) return;            // 代次令牌
      if (index >= steps.length) {
        A2.lockUntil = 0;
        A2.lockName = '';
        A2.irr = 0;                            // 气撒完了，否则手一直按着会立刻二次触发
        A2.seqOwned = true;
        setClawdC(null);
        A2.seqOwned = false;
        return;
      }
      A2.seqOwned = true;
      setClawdC(steps[index][0], 0);
      A2.seqOwned = false;
      clawdLater(() => run(index + 1), steps[index][1]);
    };
    run(0);
  }

  function a2SulkSeq() {
    A2.throws = 0;
    /* 第 5 档：转身生气（三步序列）和愤怒颤抖（一段）各一半（Lulu 2026-09-29） */
    if (clawdRigPickVariant('sulk') === 'rage') a2PlaySeq([['rage', CLAWD_RIG.clips.rage.dur]], '生气');
    else a2PlaySeq([['turn', 400], ['t5', 2600], ['face', 400]], '生气');
  }

  /* 空气墙。
     2.0.143 之前这里拿 #form_sheld 当容器、上边界写死 140px，两个都是错的：

     - 桌面实测 #sheld / #chat / #form_sheld 三个容器都是 0 → 窗口宽，
       整个铺在左侧栏底下。拿它们的 left 当左边界，等于允许 Clawd 钻进侧栏。
       真正的左边界是侧栏（#top-bar，position:fixed，占满高度）的右边。
     - 140px 让 Clawd 最多只能比归位线高 140，够不到聊天区。

     现在的规则是：可活动范围 = 聊天容器减掉侧栏 / 顶栏之后剩下的那块，
     下边界仍然卡在归位线（fy 不许为正，否则会沉进输入框）。
     侧栏是竖的还是横的用它自己的形状判断，不写死布局假设。 */
  function a2Walls(button) {
    const container = hostDocument.querySelector('#sheld')
      || hostDocument.querySelector('#chat')
      || hostDocument.querySelector('#form_sheld');
    const fallback = { minx: -9e9, maxx: 9e9, maxxHome: 9e9, minxHome: -9e9, miny: -A2_FALLBACK_CEILING, maxy: 0 };
    if (!container) return fallback;
    const pr = button.getBoundingClientRect();
    const fr = container.getBoundingClientRect();
    if (!pr.width || !fr.width) return fallback;

    const viewport = hostWindow.visualViewport;
    const viewportLeft = Math.max(0, viewport?.offsetLeft || 0);
    const viewportTop = Math.max(0, viewport?.offsetTop || 0);
    const viewportRight = viewportLeft + Math.max(
      1,
      viewport?.width || hostWindow.innerWidth || fr.right,
    );
    let limitLeft = Math.max(fr.left, viewportLeft);
    /* 欢迎页里 #sheld 的布局顶边会跟着居中的内容塌到输入框附近；拿它当天花板，
       miny 就会变成 0，Android 上只能横着拖。竖向活动区属于当前可见页面，
       顶栏若横跨页面，下面的几何判断还会把天花板推进到顶栏底边。 */
    let limitTop = viewportTop;
    const limitRight = Math.min(fr.right, viewportRight);

    /* 酒馆的 #top-bar 在这套主题里是左侧栏，在别的形态下可能是顶栏。
       按它自己的比例判断，别按布局名字猜。 */
    const rail = hostDocument.querySelector('#top-bar');
    const rr = rail && rail.offsetParent !== null ? rail.getBoundingClientRect() : null;
    if (rr && rr.width > 0 && rr.height > 0) {
      const tall = rr.height >= fr.height * 0.6;
      const wide = rr.width >= fr.width * 0.6;
      if (tall && !wide && rr.left <= fr.left + 1) limitLeft = Math.max(limitLeft, rr.right);
      else if (wide && !tall && rr.top <= fr.top + 1) limitTop = Math.max(limitTop, rr.bottom);
    }

    /* 归位线附近要给 #send_form::after 那只装饰 Clawd 让开（right:18px，36 宽）。
       飞高了就不用让——那时候两者根本不在一条线上。 */
    const form = hostDocument.querySelector('#send_form');
    let decorLeft = limitRight;
    /* 2.0.296（Lulu：大 Clawd 会走出输入框）：站在地上时只在输入框上面——左右各收 A2_FORM_INSET，脚别踩在圆角上。
       飞着、拖着、抛着都不拦（拦了手感像撞墙），只管走路的范围和落地以后滑回来。 */
    let formLeft = limitLeft, formRight = limitRight;
    if (form) {
      const sf = form.getBoundingClientRect();
      if (sf.width > pr.width + 2 * A2_FORM_INSET) { formLeft = Math.max(limitLeft, sf.left + A2_FORM_INSET); formRight = Math.min(limitRight, sf.right - A2_FORM_INSET); }
      /* 2.0.300（Lulu：大 Clawd 被小 Clawd 挤走不好，手机上很容易被挤）：不再给小 Clawd 让位，改成能互相叠。 */
    }

    const maxx = A2.x + (limitRight - A2_EDGE - pr.right);
    return {
      minx: A2.x + (limitLeft + A2_EDGE - pr.left),
      maxx,
      /* maxxHome 只用来判断「停稳之后有没有盖住装饰 Clawd」，不参与拖拽和抛掷的
         夹取——拿它当墙的话手感上就是拖到一半推不动，读起来像卡了。 */
      maxxHome: Math.min(maxx, A2.x + (decorLeft - pr.right), A2.x + (formRight - pr.right)),
      minxHome: Math.max(A2.x + (limitLeft + A2_EDGE - pr.left), A2.x + (formLeft - pr.left)),
      miny: A2.fy + (limitTop + A2_EDGE - pr.top),
      maxy: 0,
    };
  }

  /* 右边界。
     原来贴着归位线时会提前挡住，为的是不压到右上角那只装饰 Clawd，
     但手感上那是一堵看不见的墙——拖到一半推不动，读起来像卡了。
     现在整条右边都放开，允许它停在装饰上面。 */
  function a2ClampX(x) {
    return Math.max(A2.bnd.minx, Math.min(A2.bnd.maxx, x));
  }

  function scheduleA2BoundsWarm(button = composerClawd()) {
    A2.bndReady = false;
    if (A2.bndRaf || !button) return;
    A2.bndRaf = requestClawdFrame(() => {
      A2.bndRaf = 0;
      if (destroyed || A2.held || !button.isConnected) return;
      A2.bnd = a2Walls(button);
      A2.bndAt = Date.now();
      A2.bndReady = true;
      clawdRigPixelSnap(button);
    });
  }

  /* 2.0.298：骨架左上角对齐到整屏幕像素。输入框居中时按钮常落在半个像素上，一格 3px 的格子边就全落在半像素上、发糊。
     只在停稳的时候量（建好、落地、走完、输入框变大小——都走 scheduleA2BoundsWarm），走路 / 拖着的时候不量，不逐帧读布局。
     对齐量写在骨架的 translate 上（动作的 CSS 不碰骨架外框的 translate；躲进输入框的 clip-path 跟着一起挪，差不到 1px）。 */
  function clawdRigPixelSnap(button = composerClawd()) {
    const rig = button?.querySelector(':scope > .clawd-rig');
    if (!rig || A2.held || Math.abs(A2.fy - A2.floor) > .5) return;
    const r = rig.getBoundingClientRect();
    if (!r.width) return;
    const dpr = hostWindow.devicePixelRatio || 1;
    const fx = r.left * dpr - Math.round(r.left * dpr), fy = r.top * dpr - Math.round(r.top * dpr);
    if (Math.abs(fx) < .02 && Math.abs(fy) < .02) return;
    const cur = rig._cwSnap || [0, 0];
    const nx = cur[0] - fx / dpr, ny = cur[1] - fy / dpr;
    rig._cwSnap = [nx, ny];
    rig.style.setProperty('translate', `${nx.toFixed(3)}px ${ny.toFixed(3)}px`);
  }

  /* 抓、拖、丢、戳都算「人还在」。
     不记的话，只跟 Clawd 玩、不碰键盘的这段时间里 lastActivityAt 一直不动，
     IDLE_SLEEP_MS（3 分钟）一到，它就会在你手里睡着——跺完脚立刻打呼就是这么来的。
     冷落计时（lastPokeAt）同理。 */
  function a2NoteInteraction() {
    lastPokeAt = Date.now();
    if (neglected) setNeglected(false);
    noteActivity();
  }

  function a2Down(button, event) {
    /* C1a：已经被一根手指抓着时，第二根手指按下不算新的一次抓取（多指触控）。 */
    if (A2.held && event.pointerId !== A2.pointerId) { event.preventDefault(); return; }
    A2.pointerId = event.pointerId;
    A2.tookPointer = false;
    /* 2.0.229（Lulu：点睡着的 Clawd，直接播被戳，没有伸懒腰）：按下这一下就会把它叫醒（a2NoteInteraction → wake），
       等松手走到 a2Poke 时已经不算睡着了。先记下「按下时在睡」，松手没拖就只醒来伸懒腰，不戳、不加烦躁。 */
    A2.wokeOnDown = idleAsleep;
    a2NoteInteraction();
    if (a2Locked()) {
      /* 生气期间抓不起来 */
      event.preventDefault();
      A2.tookPointer = true;
      return;
    }
    event.preventDefault();
    A2.held = true;
    /* 必须递增，不能清零。清零会让代次令牌被复用：抓一次之后计数归 0，
       下一次抛掷又拿到 my=1，于是上一轮那个还在排队的 840ms 回调（my 也是 1）
       会认领这一次飞行——生气和跺脚因此会在半空中触发。 */
    A2.flying += 1;
    A2.vx = 0;
    A2.vy = 0;
    A2.moved = false;
    A2.sx = event.clientX;
    A2.sy = event.clientY;
    A2.ox = A2.x;
    A2.oy = A2.fy;
    A2.lx = event.clientX;
    A2.ly = event.clientY;
    A2.lt = Date.now();
    if (!A2.bndReady || Date.now() - A2.bndAt > A2_BOUNDS_TTL) {
      /* 预热是快路径；过期就在这里重量一次。
         只在 pointerdown 读，一次手势最多一次，pointermove 和 rAF 里仍然零读取。 */
      A2.bnd = a2Walls(button);
      A2.bndAt = Date.now();
      A2.bndReady = true;
    }
    clawdRigSnapshotProps(button);             // 改样式之前先拍下手上的道具（打断收场用，见 clawdRigReadProps）
    button.style.setProperty('transition', 'none', 'important');
    try { button.setPointerCapture(event.pointerId); } catch (error) { /* 老 WebView 没有就算了 */ }
    /* 手指落下立刻给反馈（2.0.143 定的：不能等第一次大位移才有反应），
       但在地上时只是「被按住」（压扁一点、影子还在），挪动超过 5px 才拎起来——
       以前一按下就摆被拎起来的姿势，按住想轻抚时会先吊起来再切轻抚（Lulu 2026-09-24）。
       在半空中被接住的，直接就是拎着。 */
    /* 2.0.229：睡着时按下不放「被按住」——它会把刚开始的醒来（B 轨短动作）取消掉，松手后直接回待机。
       睡着时这一下只叫醒它；真拖起来（挪动超过 5px）照常拎起。 */
    if (!A2.wokeOnDown) setClawdC(A2.fy < A2.floor - .5 ? 'grab' : 'press', 0);
    /* 轻抚（Lulu 2026-09-24）：按住不动 0.6 秒。手机没有悬停，只能靠这个；电脑上按住也一样算。
       挪动超过 5px 就是拖，0.6 秒内松手还是戳，三者分得开。 */
    cancelClawdLater(A2.petTimer);
    A2.petting = false;
    A2.petTimer = clawdLater(() => {
      A2.petTimer = 0;
      if (!A2.held || A2.moved || A2.fy < A2.floor - .5) return;
      A2.petting = clawdPet(button);
    }, CLAWD_PET_HOLD_MS);
  }

  function a2Move(button, event) {
    if (!A2.held || event.pointerId !== A2.pointerId) return;
    const dx = event.clientX - A2.sx;
    const dy = event.clientY - A2.sy;
    let dragStarted = false;
    if (!A2.moved && Math.abs(dx) + Math.abs(dy) > A2_DRAG_THRESHOLD) {
      A2.moved = true;
      A2.dragging = true;
      dragStarted = true;
      cancelClawdLater(A2.petTimer);
      A2.petting = false;
      clawdPile.unloadBig('lower');            // 2.0.300：头上的小 Clawd 平滑地降下来
      if (A2.floor) { A2.floor = 0; clawdPile.bigSat(null); }
      setClawdC('grab', 0);                    // 挪动超过阈值才真的拎起来（按住 / 摸着摸着拖动都一样）
      clawdLater(() => { if (A2.dragging) { clawdRigPickVariant('drag'); setClawdC('drag', 0); } }, 350);
    }
    if (!A2.moved) return;
    A2.fy = Math.max(A2.bnd.miny, Math.min(A2.bnd.maxy, A2.oy + dy));
    A2.x = a2ClampX(A2.ox + dx);
    const now = Date.now();
    const dt = Math.max(12, now - A2.lt);
    /* 指数平滑，不用瞬时速度——瞬时速度在慢速拖动时会抖 */
    A2.vx = A2.vx * .45 + ((event.clientX - A2.lx) / dt * 16) * .55;
    A2.vy = A2.vy * .45 + ((event.clientY - A2.ly) / dt * 16) * .55;
    A2.lx = event.clientX;
    A2.ly = event.clientY;
    A2.lt = now;
    A2.rot = Math.max(-14, Math.min(14, -A2.vx * 0.7 / A2.feel));
    a2Place(button);
  }

  function a2Up(button, event) {
    if (!A2.held || (event && event.pointerId !== A2.pointerId)) return;
    A2.held = false;
    A2.tookPointer = true;
    cancelClawdLater(A2.petTimer);
    if (A2.petting && !A2.moved) {
      /* 轻抚之后松手：不算戳，轻抚那段自己播完 */
      A2.petting = false;
      A2.rot = 0;
      button.style.removeProperty('transition');
      a2Place(button);
      return;
    }
    A2.petting = false;
    if (A2.moved || A2.fy < A2.floor - .5) A2.wokeOnDown = false;   // 拖了 / 半空接住：不是戳，醒来标记作废
    if (A2.moved) {
      a2Ballistic(button);                     // 拖过就是抛
    } else if (A2.fy < A2.floor - .5) {
      /* 在半空中把它抓住、又原地松手：让它自己掉下去，别悬在空中。
         这既不算抛掷（不加烦躁、不计次数），也不算戳。 */
      A2.rot = 0;
      a2Ballistic(button, true);
    } else {
      A2.rot = 0;
      button.style.removeProperty('transition');
      a2Place(button);
      a2Poke(button);                          // 没拖过才是戳
    }
  }

  function a2Phys() {
    const t = (A2.feel - .55) / .95;
    return {
      g: .26 + t * .40,          // 重力
      rest: .50 - t * .42,       // 弹性
      drag: .985 + t * .010,     // 空气阻力
      thr: .78 - t * .12,        // 初速度系数
      fric: .86 - t * .20,       // 地面摩擦
      spin: .55 - t * .38,       // 旋转量
      maxRot: 16 - t * 8,        // 最大旋转角
      sq: .10 - t * .03,         // 落地压扁量
    };
  }

  /* drop = true 表示这不是一次抛掷，只是让它自己掉回去（在空中被松手）。
     不计次数、不加烦躁、落地也不接跺脚或生气。 */
  function a2Ballistic(button, drop = false) {
    const P = a2Phys();
    const cap = value => Math.max(-24, Math.min(24, value));
    let bx = drop ? 0 : cap(A2.vx) * P.thr;
    let by = drop ? 0 : cap(A2.vy) * P.thr;
    let bounces = 0;
    const my = (A2.flying += 1);               // 代次令牌：新的抓取直接作废旧的飞行
    if (!drop) {
      A2.throws += 1;
      A2.lastThrow = Date.now();
      A2.lastDec = Date.now();
      A2.irr = Math.min(5, A2.irr + (A2.throws >= 3 ? 2 : 1));
    }
    A2.dragging = false;
    a2NoteInteraction();
    setClawdC('fly', 0);
    /* 2.0.300：地面不一定是输入框上沿——正好落在某只小 Clawd 头顶上方，就坐在它头上。
       这里只量一次坐标原点，飞行中按当前支撑图选座位、按 A2.x 换算大 Clawd 身子中心，逐帧不读布局。 */
    if (A2.floor) { A2.floor = 0; clawdPile.bigSat(null); }
    const rig0 = button.querySelector(':scope > .clawd-rig')?.getBoundingClientRect();
    const liveSeats = rig0?.width ? clawdPile.trackSeats() : () => [];
    const x0 = A2.x, centerAt = x => rig0.left + (x - x0) + 24;   // 丢出去那一刻的位置做基准
    /* 每帧读取三个小 Clawd 的当前逻辑位置/支撑关系，不读布局。
       旧版只验证旧候选的高度：支撑在两帧之间被拖走又放下，仍会使用它原来的横坐标；只刷新一次也会漏掉第二次抽走。 */
    const seatUnder = x => liveSeats().filter(st => Math.abs(centerAt(x) - st.cx) < Math.max(48, st.w) * .5)
      .sort((a, b) => b.h - a.h)[0] || null;

    /* 逐帧推进改成按真实经过时间推进。
       原来每帧固定 vy += g、v *= drag，等于把「一帧」当成时间单位：
       60fps 下 1 秒走 60 步，30fps 下只走 30 步，同一次抛掷在掉帧的机器上
       墙钟时间直接翻倍。Android Via 上「回落很慢」的主因就是这个。
       k = 这一帧相当于几个 16.7ms。夹在 [0.5, 3]，避免切后台再回来时
       一帧跳出去几百像素、直接穿墙。 */
    const FRAME = 1000 / 60;
    let last = 0;
    const step = now => {
      if (my !== A2.flying) return;
      const stamp = typeof now === 'number' ? now : (hostWindow.performance?.now?.() || 0);
      const k = last ? Math.max(0.5, Math.min(3, (stamp - last) / FRAME)) : 1;
      last = stamp;
      by += P.g * k;
      bx *= Math.pow(P.drag, k);
      by *= Math.pow(P.drag, k);
      A2.x += bx * k;
      A2.fy += by * k;
      /* 左右墙。右边界随高度变，贴着归位线时要避开右上角的装饰 Clawd。 */
      const clamped = a2ClampX(A2.x);
      if (clamped !== A2.x) { A2.x = clamped; bx = -bx * .45; }
      /* 天花板。原来只夹了左右和地面，用力往上一甩就飞出屏幕了。 */
      if (A2.fy < A2.bnd.miny) { A2.fy = A2.bnd.miny; by = -by * .45; }
      const seat = by > 0 ? seatUnder(A2.x) : null;   // 往下掉的时候才认头顶（往上飞时穿过去）
      const ground = seat ? -seat.h : 0;
      if (A2.fy >= ground) {
        A2.fy = ground;
        /* 第一次砸到地面就演落地，不等它弹完——等弹完看着像落地之后又落了一次 */
        if (bounces === 0) setClawdC('land', 0);
        if (Math.abs(by) > .7 && bounces < 6) {
          by = -by * P.rest;
          bx *= P.fric;
          bounces += 1;
          const q = P.sq * Math.min(1, Math.abs(by) / 7);
          A2.sqx = 1 + q;
          A2.sqy = 1 - q;
          if (A2.squashTimer) cancelClawdLater(A2.squashTimer);
          A2.squashTimer = clawdLater(() => {
            A2.squashTimer = 0;
            if (my !== A2.flying) return;
            A2.sqx = 1;
            A2.sqy = 1;
            a2Place(button);
          }, 110);
        } else {
          bx = 0;
          by = 0;
          A2.rot = 0;
          A2.sqx = 1;
          A2.sqy = 1;
          A2.floor = ground;
          clawdPile.bigSat(seat ? seat.name : null);
          a2Place(button);
          A2.homeX = A2.x;
          button.style.removeProperty('transition');
          /* 2.0.301：坐到小 Clawd 头上：滑到它正上方坐正（落下时允许左右偏一点，不挪正看着像浮在旁边） */
          if (seat && rig0?.width) A2.x += seat.cx - centerAt(A2.x);
          /* 2.0.300：落在输入框上、但跟站着的小 Clawd 重叠：大 Clawd 自己挪开一点（谁被放下谁挪，不推小的） */
          if (!seat && rig0?.width) {
            const bl = centerAt(A2.x) - 24;
            for (const b of clawdPile.blocks()) {
              if (bl < b.r + 4 && b.l < bl + 48 + 4) { A2.x += (bl + 24 < (b.l + b.r) / 2) ? b.l - 4 - (bl + 48) : b.r + 4 - bl; break; }
            }
          }
          /* 停稳之后如果正好盖住右上角那只装饰 Clawd，就让它轻轻滑开一点。
             拖和抛全程都不拦，只在这里收一下。上一行刚把 transition 还回去
             （样式表里那条是 transform 240ms），所以下一帧改 x 会自己走缓动，
             不用另写动画。 */
          /* 2.0.296：落在输入框外面（左边那块空地上）也一样滑回输入框上。 */
          if (seat ? A2.x !== A2.homeX : (A2.x > A2.bnd.maxxHome || A2.x < A2.bnd.minxHome || A2.x !== A2.homeX)) {
            requestClawdFrame(() => {
              if (my !== A2.flying) return;
              A2.x = Math.max(A2.bnd.minxHome, Math.min(A2.bnd.maxxHome, A2.x));
              A2.homeX = A2.x;
              a2Place(button);
              clawdLater(() => clawdRigPixelSnap(button), 300);
            });
          }
          /* 落定之后顺手重量一次，下一次抓取大概率还能走快路径。 */
          scheduleA2BoundsWarm(button);
          if (drop) return;                    // 只是掉回去，不接后续
          clawdLater(() => {
            /* 原型这里没有代次令牌：840ms 内又被抓起来的话，旧的这条回调照样
               会烧到底，把跺脚或生气序列砸到新的一次互动上。 */
            if (my !== A2.flying) return;
            if (A2.throws >= 5) {
              a2SulkSeq();
            } else if (A2.throws >= 3) {
              setClawdC('stomp', CLAWD_RIG.clips[clawdRigPickVariant('stomp')].dur);
            } else {
              setClawdC(null);
            }
          }, 840);
          return;
        }
      }
      A2.rot = Math.max(-P.maxRot, Math.min(P.maxRot, -bx * P.spin));
      a2Place(button, true);
      requestClawdFrame(step);
    };
    requestClawdFrame(step);
  }

  /* 轻抚：C 轨播「轻抚」（眯眼往手上蹭、冒心）。摸也算搭理它（不再被冷落），摸一摸就不烦了（烦躁清零）。
     生气序列期间摸不了；一次没播完之前不重复触发。返回这次有没有真的触发。 */
  const CLAWD_PET_HOLD_MS = 600;
  let clawdPetUntil = 0;
  function clawdPet(button) {
    if (a2Locked()) return false;
    const now = Date.now();
    if (now < clawdPetUntil) return false;
    clawdPetUntil = now + CLAWD_RIG.clips.pet.dur;
    lastPokeAt = now;
    if (neglected) setNeglected(false);
    A2.irr = 0;
    setClawdC('pet', CLAWD_RIG.clips.pet.dur);
    return true;
  }

  function a2Poke(button) {
    if (a2Locked()) {
      return;                                  // 生气期间戳它没用
    }
    if (A2.wokeOnDown) {
      A2.wokeOnDown = false;
      setClawdC(null);                         // 收掉按下时的「被按住」，露出 B 轨的醒来 + 伸懒腰
      clawdPokeReaction();
      return;
    }
    A2.lastDec = Date.now();
    a2NoteInteraction();
    if (clawdTracks.A) {
      /* 生成中不加烦躁，只随机播一个戳的动作 */
      a2RandomPoke(1);
      clawdPokeReaction();
      return;
    }
    A2.irr = Math.min(5, A2.irr + 1);
    const tier = A2.irr;
    if (tier <= A2_RICH_TIER) {
      a2RandomPoke(tier);
      clawdPokeReaction();
      return;
    }
    if (tier >= 5) a2SulkSeq();
    else a2RandomPoke(tier);
  }

  /* 戳的动作随机挑（Lulu 2026-09-24：原来按连戳次数依次播 1、2、3、4，看着像固定套路）。
     「不耐烦」仍然看烦躁值：台词和粒子按烦躁值变，烦躁到 5 转身生气；
     烦躁 3 以上不再抽开心的那档（蹦一下 / 害羞），免得嘴上说「够了啊」脸上在笑。连着两次不抽同一个。 */
  let a2LastPoke = '';
  function a2RandomPoke(irr) {
    const pool = (irr >= 3 ? ['t2', 't3', 't4'] : ['t1', 't2', 't3', 't4']).filter(t => t !== a2LastPoke);
    const t = pool[Math.random() * pool.length | 0];
    a2LastPoke = t;
    setClawdC(t, A2_TMS[A2_TIER.indexOf(t)]);
  }

  function a2Bind(button) {
    /* setPointerCapture 之后 move/up 都会打到这个按钮上，不用往 document 上挂。 */
    button.addEventListener('pointerdown', event => a2Down(button, event));
    button.addEventListener('pointermove', event => a2Move(button, event));
    button.addEventListener('pointerup', event => a2Up(button, event));
    /* C1a：pointercancel（浏览器把手势收走去滚动、来电、多指缩放）和意外丢失捕获，
       以前都直接走松手路径——拖过就按最后的速度抛出去，没拖过就算一次戳。
       现在单独收尾：不抛、不戳、不加烦躁，在空中就原地掉下来。 */
    button.addEventListener('pointercancel', event => a2Cancel(button, event));
    button.addEventListener('lostpointercapture', event => a2Cancel(button, event));
    /* 轻抚（电脑）：光标在它身上左右来回划，1 秒内换向 3 次。只认没按键的鼠标悬停。 */
    let petX = null, petDir = 0, petFlips = [];
    button.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || event.buttons || A2.held) return;
      if (petX !== null) {
        const dx = event.clientX - petX;
        if (Math.abs(dx) >= 2) {
          const dir = Math.sign(dx);
          if (petDir && dir !== petDir) {
            const now = Date.now();
            petFlips = petFlips.filter(t => now - t < 1000).concat(now);
            if (petFlips.length >= 3) { petFlips = []; clawdPet(button); }
          }
          petDir = dir;
        }
      }
      petX = event.clientX;
    });
    button.addEventListener('pointerleave', () => { petX = null; petDir = 0; petFlips = []; });
  }

  function a2Cancel(button, event) {
    if (!A2.held || (event && event.pointerId !== A2.pointerId)) return;
    cancelClawdLater(A2.petTimer);
    A2.petting = false;
    A2.held = false;
    A2.tookPointer = true;
    A2.dragging = false;
    A2.rot = 0;
    if (A2.moved || A2.fy < A2.floor - .5) {
      a2Ballistic(button, true);               // drop：不计抛掷次数、不加烦躁
    } else {
      button.style.removeProperty('transition');
      a2Place(button);
      setClawdC(null);
    }
  }

  /* 戳一下：算有人在搭理 Clawd（被冷落立刻解除）。画面由骨架的戳 1–4 表现（a2RandomPoke）；
     以前这里还有连点彩蛋的台词气泡、按钮整体弹跳、文字粒子和 ::before 姿势脉冲，都是旧画法，已删。 */
  function clawdPokeReaction() {
    lastPokeAt = Date.now();
    if (neglected) setNeglected(false);
  }

  /* role 默认给 composer：A1 之后只剩输入框上方这一只会被创建。
     留着参数是为了让 SIGNOFF_CLAWD_CLASS 这条路径显式可查，不是还在用。 */
  function createButton(role = 'composer') {
    const button = hostDocument.createElement('button');
    button.type = 'button';
    button.className = BUTTON_CLASS;
    button.classList.add(role === 'composer' ? COMPOSER_CLAWD_CLASS : SIGNOFF_CLAWD_CLASS);
    button.setAttribute('aria-label', 'Clawd');
    button.title = 'Clawd';
    a2Bind(button);
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      /* 迁入输入框的这只就是原来的角色本体，所以 2.0.135 的整套点击反馈
         （连点彩蛋、随机反应、气泡、粒子、视线、姿势）原样跑在它身上。
         A2 之后判定归 pointerup（拖过就是抛，没拖过才是戳），所以指针路径
         已经处理过的那一次点击在这里跳过，否则拖完松手会再触发一次点击反应。
         监听留着是为了键盘 Enter 激活——那条路径不产生 pointer 事件。 */
      if (A2.tookPointer) { A2.tookPointer = false; return; }
      a2Poke(button);
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
  let ccSleeping = false;
  function noteCcVisibility() {
    if (hostDocument.visibilityState !== 'visible') return;
    /* C1b：离开期间来了回复 → 回来后读信（只在 B 轨空闲、没在生成、没被碰时） */
    if (clawdLetterPending) {
      clawdLetterPending = false;
      clawdLater(() => {
        if (destroyed || clawdTracks.A || clawdTracks.C || clawdTracks.B !== 'idle') return;
        setClawdB('rig:letter', CLAWD_RIG.clips.letter.dur);
      }, 800);
    }
  }

  /* ===== v1.7 ===== */

  /* 4. 姿势跟内容走：超长回复蜷起来，含代码块眯眼 */
  // 曾经有个「回复超长就蜷缩」的姿势，去掉了。
  // 阈值 1800 字，而酒馆的回复基本都超 —— 蜷缩变成了常态，
  // 还把左右看的规则盖住、跟上下看打架。
  // 跟之前那个「含代码块就眯眼」是同一类错误：内容驱动的姿势在酒馆里必然长期误触发。
  /* 打盹：3 分钟没输入就睡，敲键盘就醒。
     只认键盘，不认鼠标移动和滚动 —— 读长回复的时候鼠标和滚轮一直在动，
     但人其实没在「操作」，把那些算进来它就永远睡不着。
     （曾经有个「连点 8 下睡 6 秒」的彩蛋，早已移除；ccSleeping 现在恒为
     false，留着只是当哨兵。）
     阈值原来是 1 分钟，跟被冷落的窗口几乎重叠——冷落刚冒出来一小会儿
     就被入睡盖过去，等于白做。改成 3 分钟，给冷落留出 1~2:15 的
     显示窗口（drowsy 门槛是本值的 75%，会跟着一起挪，不用单独调）。 */
  const IDLE_SLEEP_MS = 180000;
  let lastActivityAt = Date.now();
  let idleAsleep = false;
  /* 2.0.227（Lulu：大 Clawd 不理它也不睡了，被闲置动作顶替）：原来要先在对话里打过字计时才开始，
     而欢迎页上每次刷新都把这个标记清掉（本意是「回到欢迎页时重新计时」，但写成了「在欢迎页上就一直清」），
     于是欢迎页上永远睡不着，空档全被闲置动作填满。阈值早已从 1 分钟改成 3 分钟，打开酒馆挂着 3 分钟睡着是对的：
     现在从加载起就计时；回到欢迎页只在「刚切回来」那一下重新计时。hasChatActivity 留着当开关，恒为 true。 */
  let hasChatActivity = true;
  let wasWelcome = null;

  /* D2 被冷落：跟打盹是两条独立轴线。打盹看的是「页面有没有键盘活动」
     （lastActivityAt），冷落看的是「有没有人戳过 Clawd 本体」
     （lastPokeAt）——两者不共用同一个计时器，否则会互相打架。
     判定要求「人还在活跃聊天」但「一直没搭理 Clawd」，跟打盹/入睡那种
     「人也不在了」是相反的场景，所以额外要求 elapsed 没到 drowsy 的门槛。
     阈值 1 分钟，比入睡短，保证冷落会先冒出来，不会被入睡直接盖掉。 */
  const NEGLECT_POKE_MS = 60000;
  let lastPokeAt = Date.now();
  let neglected = false;
  let ccDrowsy = false;
  const CLAWD_NEGLECT_SHOW_MS = 2 * 3400;       // 被冷落那段循环两遍
  const CLAWD_NEGLECT_REPEAT_MS = 240000;
  let clawdNeglectShownAt = -Infinity;

  function setSleeping(on) {
    if (!on && idleAsleep) idleAsleep = false;
    syncClawdBState();
  }

  function setDrowsy(on) {
    ccDrowsy = on;
    syncClawdBState();
  }

  function setNeglected(on) {
    if (neglected === on) return;
    neglected = on;
    syncClawdBState();
  }

  // 打一次瞌睡多久就睡着：犯困那段第 1.9 秒是点头点到最低、还没「猛地惊醒」（clawd-rig.js 的 drowsy，2000ms 惊醒）。
  const DOZE_OFF_MS = 1900;
  let dozeTimer = 0;

  function refreshIdleSleep() {
    if (!clawdEnabled()) return;
    if (ccSleeping || !hasChatActivity) {
      if (neglected) setNeglected(false);
      return;
    }
    const elapsed = Date.now() - lastActivityAt;
    const idle = elapsed > IDLE_SLEEP_MS;

    /* 冷落只在「人还在活跃聊天」（elapsed 没到 drowsy 门槛）时判定——
       快睡着 / 已经在打盹入睡的场景交给 drowsy/sleeping 表达，两者不重叠。
       还要求生成不在进行中，且没有正处于害羞（环境触发）：害羞和冷落的
       触发条件互斥，害羞优先，冷落让位。 */
    const shouldBeNeglected = elapsed < IDLE_SLEEP_MS * .75
      && !isTypingActive()
      && Date.now() - lastPokeAt > NEGLECT_POKE_MS;
    /* 被冷落只演一段（两个来回，约 7 秒）就回待机，之后 4 分钟内不再演，除非又被戳过。
       以前一进冷落就一直循环，直到你戳它或者快睡着——正常聊天时每过一分钟就蔫在那里，
       闲置动作也全被挡掉（Lulu 2026-09-25：一直重复被冷落） */
    const nowN = Date.now();
    if (!shouldBeNeglected) setNeglected(false);
    else if (neglected) { if (nowN - clawdNeglectShownAt > CLAWD_NEGLECT_SHOW_MS) setNeglected(false); }
    else if (nowN - clawdNeglectShownAt > CLAWD_NEGLECT_REPEAT_MS && clawdTracks.B === 'idle' && !clawdTracks.bUntil) {
      clawdNeglectShownAt = nowN;
      setNeglected(true);
    }

    /* 2.0.228（Lulu：一直在重复打瞌睡）：犯困那段是循环的（点头、更低、猛地惊醒，2.8 秒一圈），
       原来从 2 分 15 秒一直放到 3 分钟，要连着打十几次瞌睡、惊醒十几次才睡着。
       现在 3 分钟到了才打一次瞌睡：点两下头、在最低那一下（1.9 秒，惊醒之前）直接接睡着（打哈欠、坐下、冒 Z）。
       这 1.9 秒里有键盘 / 点输入框 / 抓戳，就算醒着，不睡。 */
    if (!idle) {
      if (dozeTimer) { cancelClawdLater(dozeTimer); dozeTimer = 0; }
      if (ccDrowsy) setDrowsy(false);
      if (idleAsleep) { idleAsleep = false; setSleeping(false); }
      return;
    }
    if (idleAsleep) { setSleeping(true); return; }
    if (dozeTimer) return;
    setNeglected(false);
    setDrowsy(true);
    dozeTimer = clawdLater(() => {
      dozeTimer = 0;
      if (Date.now() - lastActivityAt <= IDLE_SLEEP_MS) return;
      ccDrowsy = false;
      idleAsleep = true;
      setSleeping(true);
    }, DOZE_OFF_MS);
  }

  function noteActivity() {
    if (!clawdEnabled()) return;
    hasChatActivity = true;
    lastActivityAt = Date.now();
    if (dozeTimer) { cancelClawdLater(dozeTimer); dozeTimer = 0; }
    setDrowsy(false);
    if (!idleAsleep) return;
    idleAsleep = false;
    /* 只有真的从 idleAsleep 醒来才播 wake；普通 focus/input 不要每次都弹一下。
       wake 留在 B 轨，若用户是通过抓 Clawd 叫醒它，C 轨会先显示抓取动作，
       这段短 wake 在后台自然结束，不会抢画面。 */
    if (!ccSleeping) setClawdB('wake', CLAWD_RIG.clips.wake.dur);   // 醒来并进了伸懒腰的开头
  }

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
    /* 生成期间整个暂停跟随。
       下面那些 getBoundingClientRect() 会强制浏览器立刻重算整页布局；平时不贵，
       但生成时正文每帧都在长，DOM 一直是脏的，于是每一次读取都摊上一次完整重排。
       真机实测：生成期间这个函数吃掉 3823ms，是该时段第二大的阻塞源；
       而整体 88% 的卡顿都发生在生成期间（生成中掉帧 72961ms vs 平时 9794ms）。
       生成中用户也不会去点左右翻页，箭头停在原地没有代价，
       生成一结束由 generationJustEnded 那轮补排一次，立刻归位。 */
    if (isTypingActive()) return;
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
      ? [...visibleSwipeMessages] : [...observedSwipeMessages];
    // Read every candidate before updating any arrow: interleaving these reads
    // and top writes forces another layout for each visible message on scroll.
    const updates = [];
    for (const message of candidates) {
      if (!message?.isConnected) continue;
      const box = message.getBoundingClientRect();
      if (box.bottom <= viewportTop + 8 || box.top >= viewportBottom - 8) continue;
      let next;
      if (box.height <= (viewportBottom - viewportTop) * .9) next = '50%';
      else {
        const target = viewportMid - box.top;
        next = Math.min(Math.max(target, 40), box.height - 40) + 'px';
      }
      updates.push({message, next});
    }
    for (const {message, next} of updates) {
      message.querySelectorAll(`:scope > button.${LEFT_SWIPE_PROXY_CLASS}, :scope > button.${SWIPE_PROXY_CLASS}`).forEach(button => {
          const top=!hostDocument.documentElement.hasAttribute('data-cw-v4')&&button.classList.contains(LEFT_SWIPE_PROXY_CLASS)?`max(${next}, 84px)`:next;
          if (button.style.getPropertyValue('top') === top) return;
          button.style.setProperty('top', top, 'important');
      });
    }
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
    clawdPile.hush();   // 2.0.304：小 Clawd 只在对话区滚动时暂停走路 / 飘 Z（以前整页任何东西滚都算）
    clawdScrollTilt();
    if (!isMobileLayout()) scheduleSwipeTrack();
  }

  /* 主动阅读跨至少三楼、两屏才扒边；停止900ms清累计，触发后冷却8秒。 */
  function createClawdReadingGate(read, now = Date.now) {
    const limits = { messages: 3, screens: 2, gapMs: 900, cooldownMs: 8000, gestureGapMs: 250, continuousMs: 1500 };
    let origin = null, until = 0, lastScroll = 0, fired = false, coolUntil = 0, pointer = null, gestures = 0, lastActivity = null, continuousSince = 0;
    const reset = (clearCooldown = false) => { origin = null; until = 0; lastScroll = 0; fired = false; pointer = null; gestures = 0; lastActivity = null; continuousSince = 0; if (clearCooldown) coolUntil = 0; };
    // Scroll events extend the active gesture; only a quiet gap admits a new one.
    const activity = t => { lastActivity = t; };
    const begin = () => {
      const t = now();
      if (!origin || t - lastScroll > limits.gapMs) { reset(); origin = read(); }
      if (origin && (lastActivity === null || t - lastActivity >= limits.gestureGapMs)) { gestures++; continuousSince = t; }
      if (origin) activity(t);
      if (origin) { until = t + limits.gapMs; lastScroll = t; }
    };
    const intent = event => {
      if (!event.isTrusted || event.defaultPrevented) return;
      if (event.type === 'pointerup' || event.type === 'pointercancel') { pointer = null; return; }
      if (event.type === 'pointermove') {
        if (pointer?.id === event.pointerId && Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) >= 4) begin();
        return;
      }
      const host = event.currentHost;
      const inside = !!host?.contains(event.target);
      if (event.target?.closest?.('textarea,input,select,button,[contenteditable="true"],dialog')) { reset(); return; }
      if (event.type === 'pointerdown') {
        if (!inside) { reset(); return; }
        // Capture the reading position before native touch/scrollbar movement.
        if (!origin || now() - lastScroll > limits.gapMs) { reset(); origin = read(); }
        lastScroll = now(); pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
        const r = host.getBoundingClientRect();
        if (event.clientX >= r.right - Math.max(12, host.offsetWidth - host.clientWidth)) begin();
      } else if (event.type === 'wheel' && inside && Math.abs(event.deltaY) > 0) begin();
      else if (event.type === 'keydown' && (inside || event.target?.tagName === 'BODY' || event.target?.tagName === 'HTML')
        && !event.ctrlKey && !event.metaKey && !event.altKey && ['PageUp','PageDown','ArrowUp','ArrowDown','Home','End',' '].includes(event.key)) begin();
    };
    const check = () => {
      const t = now();
      if (!origin || t > until || t - lastScroll > limits.gapMs) { reset(); return 'none'; }
      const current = read();
      if (!current || !origin.node.isConnected || current.host !== origin.host || current.height !== origin.height || current.extent !== origin.extent) { reset(); return 'none'; }
      // Do not count delayed scroll delivery after a quiet gap as continuous reading.
      if (lastActivity !== null && t - lastActivity >= limits.gestureGapMs) continuousSince = t;
      activity(t); lastScroll = t; until = t + limits.gapMs;
      if (fired) return 'hold';
      if (t < coolUntil || (gestures < 2 && t - continuousSince < limits.continuousMs) || Math.abs(current.id - origin.id) < limits.messages
        || Math.abs(current.top - origin.top) < limits.screens * origin.height) return 'none';
      fired = true; coolUntil = t + limits.cooldownMs; return 'trigger';
    };
    return { intent, check, reset, limits };
  }

  function readClawdReadingPosition() {
    const host = scrollHost;
    if (!host || !host.clientHeight) return null;
    const r = host.getBoundingClientRect();
    const headerBottom = hostDocument.querySelector('.cw-v4-chat-head')?.getBoundingClientRect().bottom || 0;
    const y = Math.max(0, r.top, headerBottom) + 16;
    // A bounded local hit test, never a scan of the message history.
    // Probe just below a message gap without scanning the history.
    for (const offset of [0, 12, 24]) for (const fraction of [.5, .25, .75]) {
      const node = hostDocument.elementFromPoint(r.left + r.width * fraction, Math.min(r.bottom - 1, y + offset))?.closest?.('#chat > .mes');
      const value = node?.getAttribute('mesid');
      if (node?.parentElement === host && /^\d+$/.test(value || '')) return { host, node, id: Number(value), top: host.scrollTop, height: host.clientHeight, extent: host.scrollHeight };
    }
    return null;
  }

  const clawdReadingGate = createClawdReadingGate(readClawdReadingPosition);
  const handleClawdReadingIntent = event => {
    if (!clawdEnabled()) return;
    if (destroyed) return;
    clawdReadingGate.intent({ isTrusted: event.isTrusted, defaultPrevented: event.defaultPrevented, type: event.type, target: event.target,
      currentHost: scrollHost, pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY,
      deltaY: event.deltaY, key: event.key, ctrlKey: event.ctrlKey, metaKey: event.metaKey, altKey: event.altKey });
  };
  const CLAWD_SCROLL_REST_MS = 700;
  let clawdScrollHolding = false;
  let clawdScrollRestTimer = 0;
  let clawdPileRestTimer = 0;

  /* 松手：骨架播「从输入框里出来」。以前还给按钮挂 clawd-scroll-hold / -release 两个 class 驱动旧的 ::before 精灵，已删 */
  function clawdScrollRelease() {
    clawdScrollHolding = false;
    composerClawd()?.style.removeProperty('translate');
    if (clawdTracks.B === 'peek') setClawdB('rig:peekOut', CLAWD_RIG.clips.peekOut.dur);
  }

  function clawdScrollTilt() {
    if (!clawdEnabled()) return;
    if (destroyed || isTypingActive() || clawdTracks.A || Date.now() < suppressManualScrollUntil) { clawdReadingGate.reset(); return; }
    const admission = clawdReadingGate.check();
    if (admission === 'none') return;
    if (admission === 'hold') {
      if (clawdPileRestTimer) armClawdScrollRest();
      return;
    }
    const bBase = String(clawdTracks.B || '').replace(/^rig:/, '').replace(/-m$/, '');
    const button = composerClawd();
    const bigPeeks = !!button && !(clawdTracks.C || a2Locked() || A2.held || Math.abs(A2.fy - A2.floor) > .5)
      && !(idleAsleep || ccSleeping || ccDrowsy || bBase === 'sleep' || bBase === 'drowsy');
    clawdPile.peek(true, bigPeeks && !A2.floor ? 12 : 0, !!A2.floor);
    if (bigPeeks && !A2.floor) { clawdScrollHolding = true; setClawdB('peek', 60000); scheduleClawdBAmbient(Date.now()); }
    armClawdScrollRest();
  }

  function armClawdScrollRest() {
    if (!clawdEnabled()) return;
    if (clawdPileRestTimer) cancelClawdLater(clawdPileRestTimer);
    clawdPileRestTimer = clawdLater(() => { clawdPileRestTimer = 0; clawdPile.peek(false); }, CLAWD_SCROLL_REST_MS);
    if (!clawdScrollHolding) return;
    if (clawdScrollRestTimer) cancelClawdLater(clawdScrollRestTimer);
    clawdScrollRestTimer = clawdLater(() => { clawdScrollRestTimer = 0; clawdScrollRelease(); }, CLAWD_SCROLL_REST_MS);
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
    heroPick = -1;
    scheduleRefresh();
    // 建档窗口到期时也重新判断一次（没有别的变动时没人叫醒它，会一直停在空页面）
    hostWindow.setTimeout(scheduleRefresh, 15100);
    hostWindow.setTimeout(scheduleRefresh, 1300);
  }

  /* 监听绑在 document 上，不绑 #send_form —— 这个改版部署会重建表单，
     绑在它身上的监听会跟着没。入口也不只认一个 id。
     酒馆自己的事件只作辅助，且不写死事件名。 */
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
      // 换 persona：欢迎语里的名字跟着换（只换名字，不重抽句子）。单纯改名酒馆不发事件，
      // 由 refreshWelcomeMode 每次刷新比较当前名字兜底
      if (key === 'PERSONA_CHANGED') source?.on?.(value, () => scheduleRefresh());
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
    return Boolean(mobileEnabled); // layout is chosen per device, not per width
  }

  function usesNativeAndroidKeyboardLayout() {
    return isMobileLayout() && /Android/i.test(hostWindow.navigator?.userAgent || '');
  }

  /* Via/WebView 在普通页面上会保持 innerHeight / visualViewport 完全不变，
     然后由 Android adjustPan 整张 WebView；fixed 输入框因此被抬高两次。
     顶部存在一个约诊断栏高度的 fixed box 时，Via 会改用正确的可见区域，
     输入框自然落在键盘上沿。这个空节点不绘制、不收事件，只影响 IME 的 pan
     判定；1px 高度不足以触发，真机隔离结果是 64px 稳定。 */
  function ensureAndroidKeyboardPanAnchor(refresh = false) {
    let anchor = hostDocument.querySelector('.' + ANDROID_KEYBOARD_PAN_ANCHOR_CLASS);
    if (!usesNativeAndroidKeyboardLayout() || keyboardBaselineMode) {
      anchor?.remove();
      return;
    }
    if (anchor && !refresh) return;
    /* Via 会在 WebView 首次排版时缓存 adjustPan 的参照集合；启动阶段已经存在的
       fixed 节点可能不会参与本次 IME 决策。focusin 同一任务里重挂一次，让节点
       进入即将开始的键盘 pan 计算。热更新之所以正常、冷启动失败，差异就在这里。 */
    anchor?.remove();
    anchor = hostDocument.createElement('i');
    anchor.className = ANDROID_KEYBOARD_PAN_ANCHOR_CLASS;
    anchor.setAttribute('aria-hidden', 'true');
    anchor.style.cssText = [
      'position:fixed', 'left:0', 'top:0', 'width:100vw', 'height:64px',
      'opacity:.001', 'pointer-events:none', 'z-index:2147483646',
    ].join(';');
    hostDocument.body?.append(anchor);
  }

  /* VirtualKeyboard overlay gives us the real keyboard inset and prevents WebView's
     adjustPan from centering the fixed composer far above the IME. Modern Android
     WebViews support it; older Android builds fall back to the pan anchor. */
  function installVirtualKeyboardOverlay() {
    if (!isMobileLayout() || keyboardBaselineMode) return;
    const keyboard = /Android/i.test(hostWindow.navigator?.userAgent||'') ? null : hostWindow.navigator?.virtualKeyboard;
    if (keyboard && 'overlaysContent' in keyboard) {
      try {
        virtualKeyboardOverlayOriginal = Boolean(keyboard.overlaysContent);
        virtualKeyboardOverlayCaptured = true;
        keyboard.overlaysContent = true;
        virtualKeyboardOverlayActive = Boolean(keyboard.overlaysContent);
      } catch {
        virtualKeyboardOverlayActive = false;
      }
    }
    setBodyClass(VIRTUAL_KEYBOARD_OVERLAY_CLASS, virtualKeyboardOverlayActive);
    if (usesNativeAndroidKeyboardLayout()) {
      if (virtualKeyboardOverlayActive) {
        hostDocument.querySelector('.' + ANDROID_KEYBOARD_PAN_ANCHOR_CLASS)?.remove();
      } else {
        ensureAndroidKeyboardPanAnchor();
      }
    }
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

  /* 这个元素获得焦点时，安卓/iOS 会弹软键盘吗？
     `<input>` 里只有文本类会弹；button / checkbox / radio / range / color / file
     / submit / reset / image 都不弹。type 缺省视作 text（HTML 规范如此）。 */
  const NON_TYPING_INPUT_TYPES = new Set([
    'button', 'submit', 'reset', 'checkbox', 'radio', 'range',
    'color', 'file', 'image', 'hidden',
  ]);

  function isSoftKeyboardTarget(element) {
    if (!element || element.nodeType !== 1) return false;
    if (element.isContentEditable) return true;
    const tag = element.tagName;
    if (tag === 'TEXTAREA') return true;
    if (tag !== 'INPUT') return false;
    return !NON_TYPING_INPUT_TYPES.has(String(element.type || 'text').toLowerCase());
  }

  function scheduleMobileViewportMetrics() {
    if (mobileViewportMetricsRaf || destroyed) return;
    mobileViewportMetricsRaf = hostWindow.requestAnimationFrame(() => {
      mobileViewportMetricsRaf = 0;
      if (!destroyed && mobileViewportMetricsDirty) applyMobileViewportMetrics();
    });
  }

  /* 可视高度比冻结值矮这么多，就当键盘还没收完（普通地址栏伸缩在 60px 以内）。 */
  const MOBILE_KEYBOARD_SHRINK_PX = 80;
  let mobileViewportRecheckTimer = 0;
  let mobileViewportRecheckCount = 0;
  /* 缩小之前的高度；复查时跟它比，而不是跟刚写进去的小值比。 */
  let mobileViewportShrinkFrom = 0;

  function mobileViewportStillShrunk() {
    const frozen = parseFloat(hostDocument.documentElement.style.getPropertyValue(MOBILE_VIEWPORT_HEIGHT_PROPERTY)) || 0;
    const current = Math.round(hostWindow.visualViewport?.height || hostWindow.innerHeight || 0);
    return frozen > 0 && current > 0 && current < frozen - MOBILE_KEYBOARD_SHRINK_PX;
  }

  function clearMobileViewportRecheck() {
    if (mobileViewportRecheckTimer) hostWindow.clearTimeout(mobileViewportRecheckTimer);
    mobileViewportRecheckTimer = 0;
    mobileViewportRecheckCount = 0;
    mobileViewportShrinkFrom = 0;
  }

  /* 复查链只在 mobileViewportShrinkFrom 有值时存在。apply 因为焦点/收尾窗口提前返回
     不算一次读取，也不断链：这里接着排下一次。真正读到的次数由 apply 计。 */
  function scheduleMobileViewportRecheck() {
    if (mobileViewportRecheckTimer || destroyed) return;
    mobileViewportRecheckTimer = hostWindow.setTimeout(() => {
      mobileViewportRecheckTimer = 0;
      if (destroyed || !mobileViewportShrinkFrom) return;
      applyMobileViewportMetrics();
      if (mobileViewportShrinkFrom) scheduleMobileViewportRecheck();
    }, 1500);
  }

  // Formal 2.0.145: iOS keyboard viewport handling for the phone layout (visual-viewport coordinates,
  // first-tap focus without scroll, keyboard-time scroll guard, bounded root reset).
  let iosKeyboardScroll = null;
  let stopIOSComposerFocus = null;
  let iosRootResetBudget = 1;
  let iosKeyboardClosing = false;
  function resetIOSRoot(afterGesture = false) {
    if (!afterGesture && iosKeyboardScroll?.active()) { iosKeyboardScroll.scheduleRecovery(); return; }
    if (iosKeyboardScroll?.isTouching()) return;
    if (!iosRootResetBudget || (!hostWindow.scrollX && !hostWindow.scrollY && !(Math.abs(hostWindow.visualViewport?.offsetTop || 0) > 1))) return;
    iosRootResetBudget -= 1;
    hostWindow.scrollTo({left:0, top:0, behavior:'instant'});
  }
  function handleIOSRootScroll() {
    if (!destroyed && usesIOSVisualViewport()) resetIOSRoot();
  }
  function mobileVisibleHeight(viewport) {
    const visible = Math.max(1, viewport?.height || hostWindow.innerHeight || 1);
    const client = hostDocument.documentElement.clientHeight;
    return Math.abs(client - visible) <= 2 ? Math.max(Math.ceil(visible), client) : Math.ceil(visible);
  }
  function usesIOSVisualViewport() {
    const nav = hostWindow.navigator;
    return isMobileLayout() && !!hostWindow.visualViewport && (/iP(?:hone|ad|od)/.test(nav?.userAgent || '') || nav?.platform === 'MacIntel' && nav?.maxTouchPoints > 1);
  }
  function applyMobileViewportMetrics() {
    const root = hostDocument.documentElement;
    if (!isMobileLayout()) {
      root.removeAttribute('data-cw-ios-viewport');
      root.removeAttribute('data-cw-ios-viewport-mode');
      root.style.removeProperty(MOBILE_VIEWPORT_HEIGHT_PROPERTY);
      root.style.removeProperty(MOBILE_VIEWPORT_TOP_PROPERTY);
      root.style.removeProperty(MOBILE_POPUP_HEIGHT_PROPERTY);
      return;
    }
    if (usesIOSVisualViewport()) {
      const viewport = hostWindow.visualViewport;
      root.setAttribute('data-cw-ios-viewport', '');
      root.dataset.cwIosViewportMode = 'reset';
      mobileViewportMetricsDirty = !1;
      clearMobileViewportRecheck();
      if (Math.abs(root.clientHeight - viewport.height) <= 2) iosKeyboardClosing = false;
      // Safari can report the old visual height until its close animation ends.
      // Once focus leaves the keyboard, fill the already-restored layout viewport.
      const height = iosKeyboardClosing ? Math.max(mobileVisibleHeight(viewport), Math.ceil(hostWindow.innerHeight || 1)) : mobileVisibleHeight(viewport);
      root.style.setProperty('--cl-mobile-viewport-height', height + 'px');
      root.style.setProperty('--cl-mobile-viewport-top', '0px');
      root.style.setProperty('--cl-mobile-popup-height', height + 'px');
      resetIOSRoot();
      return;
    }
    root.removeAttribute('data-cw-ios-viewport');
    root.removeAttribute('data-cw-ios-viewport-mode');
    /* baseline 诊断包：根视口变量保持 CSS 兜底值，JS 一个字也不写。 */
    if (keyboardBaselineMode) return;
    // 键盘开合时根节点指标保持在键盘出现前的稳定值；输入框另走 transform。
    // 否则一次普通 DOM refresh 也会把整棵重卡拖进根变量的样式失效范围。
    //
    // 2.0.107：这条守卫原来只认 `#send_textarea`，也就是只把「聊天输入框」当成
    // 会唤起软键盘的东西。但酒馆自己的面板里到处是输入框 —— 用户点开预设条目的
    // 编辑弹窗、光标落进里面的 textarea，activeElement 不是 #send_textarea，
    // 守卫不触发，于是 --cl-mobile-viewport-height 被写成「键盘占掉一半之后」的
    // 可视视口高度。而这条变量喂给了 .drawer-content.openDrawer 的 height，
    // 弹窗就当场被压成一小块，后面的预设列表从下面露出来（社区报的那个 bug）。
    // 酒馆原版不受影响，因为它根本不用这个变量，键盘一起来页面正常滚动。
    //
    // 判据换成「当前焦点是不是一个会唤起软键盘的可输入元素」。不含 button /
    // checkbox / range 这类：它们不弹键盘，焦点落上去时冻结指标反而会让
    // 真实的旋转、分屏之类的视口变化更新不及时。
    //
    // 例外：变量之前被写小了（mobileViewportShrinkFrom），现在可视高度已经回到缩小前，
    // 说明键盘并没有盖着（Via 按返回键收键盘时焦点还留在输入框里），此时把高度改回来是安全的。
    const keyboardClearedWhileFocused = mobileViewportShrinkFrom > 0
      && Math.round(hostWindow.visualViewport?.height || hostWindow.innerHeight || 0)
        >= mobileViewportShrinkFrom - MOBILE_KEYBOARD_SHRINK_PX;
    if (isSoftKeyboardTarget(hostDocument.activeElement) && !keyboardClearedWhileFocused) return;
    /* 收键盘的收尾窗口内同样一个字也不写。根节点自定义属性继承到整篇 DOM，
       写一次就是一次全文档 style 失效重算；兜底定时器（300/900/2000/5000ms）
       若在键盘动画中途写入中间值，重卡上每次全文档 recalc 都是数百毫秒起，
       主线程被堵住的这几秒屏幕只能显示旧合成帧 —— 这正是“输入框悬空数秒”
       最可疑的主题侧来源。窗口随几何稳定提前结束（applyMobileComposerTranslate
       清零 mobileKeyboardSettlingUntil），或 8000ms 兜底到期；之后由最后一个
       定时器或下一轮刷新一次性写入最终值，消费方（抽屉/面板高度）在过渡期间
       用稳定旧值没有视觉影响。 */
    if (Date.now() < mobileKeyboardSettlingUntil) return;
    mobileViewportMetricsDirty = false;
    const viewport = hostWindow.visualViewport;
    const height = Math.max(1, Math.round(viewport?.height || hostWindow.innerHeight || 1));
    /* 2.0.195：Via 收键盘后可视高度可能还要几秒才恢复，而且会漏掉恢复时那次 resize。
       这时写进来的是「键盘还占着」的小值，#chat 和侧栏都跟着变矮，聊天和输入框之间
       空出一大截，而且没有事件能把它改回来。所以变量一次缩了一个键盘量级时，
       保持 dirty 并隔一会儿自己再读一次，直到高度回来或确实就是这么高。 */
    const previousHeight = parseFloat(root.style.getPropertyValue(MOBILE_VIEWPORT_HEIGHT_PROPERTY)) || 0;
    if (previousHeight && height < previousHeight - MOBILE_KEYBOARD_SHRINK_PX) {
      mobileViewportShrinkFrom = Math.max(mobileViewportShrinkFrom, previousHeight);
      mobileViewportRecheckCount = 0;
    }
    /* 最多读 8 次（约 12 秒）。之后仍然矮就认定是真实高度（分屏等）：整条复查链收掉，
       dirty 也清掉，不再让每次普通刷新都重读视口（2.0.171 的性能约束）。 */
    if (mobileViewportShrinkFrom && height < mobileViewportShrinkFrom - MOBILE_KEYBOARD_SHRINK_PX
      && mobileViewportRecheckCount < 8) {
      mobileViewportRecheckCount += 1;
      mobileViewportMetricsDirty = true;
      scheduleMobileViewportRecheck();
    } else if (mobileViewportShrinkFrom) {
      clearMobileViewportRecheck();
    }
    const popupHeight = Math.max(
      height,
      Math.round(hostWindow.innerHeight || hostDocument.documentElement.clientHeight || height),
    );
    const top = Math.max(0, Math.round(viewport?.offsetTop || 0));
    const heightValue = `${height}px`;
    const topValue = `${top}px`;
    if (root.style.getPropertyValue(MOBILE_VIEWPORT_HEIGHT_PROPERTY) !== heightValue) {
      root.style.setProperty(MOBILE_VIEWPORT_HEIGHT_PROPERTY, heightValue);
    }
    if (root.style.getPropertyValue(MOBILE_VIEWPORT_TOP_PROPERTY) !== topValue) {
      root.style.setProperty(MOBILE_VIEWPORT_TOP_PROPERTY, topValue);
    }
    const popupHeightValue = `${popupHeight}px`;
    if (root.style.getPropertyValue(MOBILE_POPUP_HEIGHT_PROPERTY) !== popupHeightValue) {
      root.style.setProperty(MOBILE_POPUP_HEIGHT_PROPERTY, popupHeightValue);
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
    if (usesIOSVisualViewport()) {
      mobileKeyboardRecoveryActive = false;
      shell.style.removeProperty(MOBILE_COMPOSER_TRANSLATE_PROPERTY);
      return;
    }
    if (usesNativeAndroidKeyboardLayout()) {
      mobileKeyboardRecoveryActive = false;
      mobileStableLayoutHeight = Math.max(
        1,
        Math.round(hostWindow.innerHeight || hostDocument.documentElement.clientHeight || 1),
      );
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
    /* Android 仍要进入 applyMobileComposerTranslate：它虽然不计算第二份键盘位移，
       但必须主动清掉旧版本或热更新留下的负 translate。以前这里提前 return，
       下方 native 分支的 removeProperty 永远跑不到，输入框就会在键盘上方
       留出一整段旧偏移。 */
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

  function handleViewportScroll() {
    if (!usesIOSVisualViewport()) { handleViewportChange(); return; }
    if (destroyed) return;
    mobileViewportMetricsDirty = true;
    scheduleMobileViewportMetrics();
    scheduleMobileComposerTranslate();
  }
  function handleViewportChange() {
    if (destroyed) return;
    clawdReadingGate.reset();
    mobileViewportMetricsDirty = true;
    if (usesIOSVisualViewport()) applyMobileViewportMetrics(); else scheduleMobileViewportMetrics();
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

  /* Via 按系统返回键收起软键盘时，textarea 仍然保持 focus，而且部分版本会漏掉
     visualViewport 的最后一次 resize/scroll 事件。事件漏掉后，输入框就会永久
     保留上一次的负 translate，正是“键盘关了但输入框悬在页面中段”的现场。

     只在手机输入框保持焦点时低频读取四个纯数值；几何没变化时不排 rAF、不写
     DOM。这样即使 Via 漏事件，也能在视口数值恢复后撤销旧位移。不能在检测到
     键盘关闭后停掉：Android 返回键不会 blur，用户再次点同一个已聚焦输入框时
     也可能没有新的 focusin。 */
  function stopMobileKeyboardPoll() {
    if (mobileKeyboardPollTimer) hostWindow.clearInterval(mobileKeyboardPollTimer);
    mobileKeyboardPollTimer = 0;
    mobileKeyboardPollSignature = '';
  }

  function pollMobileKeyboardGeometry() {
    if (destroyed || !isMobileLayout()
      || hostDocument.activeElement?.id !== 'send_textarea') {
      stopMobileKeyboardPoll();
      return;
    }
    const signature = mobileViewportSignature();
    if (signature === mobileKeyboardPollSignature) return;
    mobileKeyboardPollSignature = signature;
    scheduleMobileComposerTranslate();
  }

  function startMobileKeyboardPoll() {
    if (keyboardBaselineMode || virtualKeyboardOverlayActive || !isMobileLayout()
      || hostDocument.activeElement?.id !== 'send_textarea') return;
    mobileKeyboardPollSignature = mobileViewportSignature();
    if (!mobileKeyboardPollTimer) {
      mobileKeyboardPollTimer = hostWindow.setInterval(pollMobileKeyboardGeometry, 300);
    }
    scheduleMobileComposerTranslate();
  }

  function endMobileKeyboardSettling() {
    mobileKeyboardSettlingUntil = 0;
    clearMobileViewportSettleTimers();
    scheduleMobileComposerTranslate();
    if (hostDocument.activeElement?.id !== 'send_textarea') applyMobileViewportMetrics();
  }

  function scheduleMobileViewportSettle() {
    if (usesIOSVisualViewport()) {
      mobileKeyboardSettlingUntil = 0;
      clearMobileViewportSettleTimers();
      mobileViewportMetricsDirty = true;
      scheduleMobileViewportMetrics();
      return;
    }
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
      /* 几何「两次读数一样」不等于键盘收好了：Via 收键盘时可视高度会停在小值几秒。
         焦点已经离开输入框、可视高度却还矮一个键盘量级，就继续等，由后面的定时器或 8000ms 兜底收尾。 */
      if (signature === mobileSettleSignature && !mobileKeyboardRecoveryActive
        && (isSoftKeyboardTarget(hostDocument.activeElement) || !mobileViewportStillShrunk())) {
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

  /* 抽的是「第几句」，不是写死名字的整句（2026-09-29 反馈：换了 User 名字标题还是旧名字）。
     显示时再按当前名字、当前语言拼出来：换人 / 改名 / 换语言只换字，不重抽。
     sessionStorage 里记上次那句的序号，下次回首页不抽同一句。 */
  function takeHeroPick() {
    const count = heroCandidates('', false).length;
    let last = -1;
    try { last = Number(hostWindow.sessionStorage?.getItem(LAST_HERO_KEY) ?? -1); } catch {}
    const pool = [...Array(count).keys()].filter(i => i !== last);
    const pick = pool[Math.floor(Math.random() * pool.length)] ?? 0;
    try { hostWindow.sessionStorage?.setItem(LAST_HERO_KEY, String(pick)); } catch {}
    return pick;
  }

  function heroText() {
    if (halloween?.enabled) {
      const name = (getContext()?.name1 || "").trim();
      const lines = ccPrefersChinese() ? [`不给糖就捣蛋${name ? "，" + name : ""}？`, `${name ? name + "，" : ""}今晚想变点什么戏法？`, `万圣夜好${name ? "，" + name : ""}`, "今晚有点闹鬼，一起查查？", `南瓜灯点好了${name ? "，" + name : ""}，进来坐？`, "今晚 Claude 能帮你变点什么？"] : [`Trick or treat${name ? ", " + name : ""}?`, "What magic shall we make tonight?", `Happy Halloween${name ? ", " + name : ""}.`];
      return lines[Math.max(0,heroPick) % lines.length];
    }
    const list = heroCandidates((getContext()?.name1 || "").trim(), ccPrefersChinese());
    return list[heroPick] ?? list[0];
  }

  let heroPick = -1;

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

  /* Streaming reasoning is inserted after the generation-start refresh. Mark
     those live details as initialized without closing them; otherwise the
     generation-end refresh can close a box the user just opened. Only the
     latest assistant message is inspected. */
  function preserveStreamingReasoning(typingActive) {
    if (!typingActive) return;
    const latest = [...hostDocument.querySelectorAll('#chat > .mes[is_user="false"]')].at(-1);
    latest?.querySelectorAll('.mes_reasoning_details').forEach(box => {
      box.dataset.clawdCollapsed = '1';
    });
  }

  /* 酒馆编辑思维链时，会把 <textarea> 插进当前仍是 closed 的 <details>，
     不会顺手把它翻成 open。真机反复验证过：只靠 CSS 强开
     ::details-content（display/height/overflow 都改成看得见的值）算不出
     视觉效果——getBoundingClientRect 和 value 都对，画面还是一片空白。
     浏览器对 closed <details> 的非 summary 内容有一层 CSS 覆盖不到的
     内部"不渲染"状态，唯一可靠的解法是把 `open` 这个真实属性也设成 true。
     编辑结束（textarea 消失）后，如果是我们逼开的、且没被手动重新展开过，
     就收回去，不然会把用户原本就收起的思维链意外留在展开状态。 */
  function expandReasoningWhileEditing() {
    for (const box of hostDocument.querySelectorAll(
      '#chat .mes_reasoning_details:has(.reasoning_edit_textarea)')) {
      if (!box.open) {
        box.dataset.clawdForceOpenForEdit = '1';
        box.open = true;
      }
    }
    for (const box of hostDocument.querySelectorAll(
      '#chat .mes_reasoning_details[data-clawd-force-open-for-edit]')) {
      if (!box.querySelector('.reasoning_edit_textarea')) {
        box.removeAttribute('open');
        delete box.dataset.clawdForceOpenForEdit;
      }
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
    /* 2.0.282（Lulu：欢迎页发空白消息再按暂停，卡在既不是对话也不是欢迎页的空页面）：
       生成已经停了 / 结束了，对话却没建起来，也没有消息 → 直接回欢迎页，不等 15 秒。 */
    else if (welcomeStage === 'leaving' && !generationEventActive && Date.now() - leavingSince > 1200) {
      welcomeStage = 'welcome';
    }
    else if (welcomeStage === 'leaving' && Date.now() - leavingSince <= 15000) {
      // 首次发送到角色/临时聊天的短暂建档窗口：保持退出欢迎页，等上下文接上。
    } else {
      welcomeStage = 'welcome';
    }
    const isWelcome = welcomeStage === 'welcome';
    setBodyClass(WELCOME_CLASS, isWelcome);
    // 回到欢迎页 = 换对话了，打盹计时重新来过（只在刚切回来的那一下）
    if (isWelcome && wasWelcome === false) {
      lastActivityAt = Date.now();
      idleAsleep = false;
      setSleeping(false);
      setNeglected(false);
      lastPokeAt = Date.now();
    }
    wasWelcome = isWelcome;

    const chat = hostDocument.querySelector('#chat');
    // 全文档找，不只找 #chat 下面 —— 酒馆重建聊天区时旧的可能被挪到别处，
    // 只在 #chat 里判重就会漏掉，然后又新建一个。
    const strays = [...hostDocument.querySelectorAll('.' + HERO_CLASS)];

    if (!isWelcome || !chat) {
      for (const el of strays) el.remove();
      heroPick = -1;
      return;
    }
    // 每次进入欢迎态才重抽一句，刷新循环里不重抽，否则会一直闪
    if (heroPick < 0) heroPick = takeHeroPick();
    const line = heroText();
    /* 正好一个、位置对、而且问候语文字还在（不是只剩图标），才算没事不用动。
       之前只检查"数量对不对 + 挂对地方"：如果那句文字在别处被清空过
       （怀疑跟 1.18.0 欢迎页改版有关——目前没能在那个版本上复现，只能先按
       "文字丢了就重建"这条防线兜底），图标会一直立在那儿，问候语永远补不回来，
       因为这条判断一直觉得"数量对、位置对，没必要动"。 */
    if (strays.length === 1 && strays[0].parentElement === chat && strays[0].textContent.trim()) {
      // 名字 / 语言变了：只换那段文字（同一句、同一个节点），不重建整块
      if (strays[0].textContent !== line) {
        const text = [...strays[0].childNodes].find(n => n.nodeType === 3);
        if (text) { text.data = line; return; }
      } else return;
    }
    for (const el of strays) el.remove();

    const hero = hostDocument.createElement('div');
    hero.className = HERO_CLASS;
    hero.innerHTML = '<span class="asterisk"></span>';
    hero.append(hostDocument.createTextNode(line));
    chat.prepend(hero);
    /* 欢迎态下 #chat 是 flex:0 1 auto + overflow-y:auto，而酒馆载入时会把
       聊天区滚到底。容器被压得比问候语矮时，滚到底的结果就是「顶部被切掉一截」。
       扩展形态尤其容易撞上：样式表走 <link> 是异步加载的，酒馆有可能在我们的
       CSS 生效之前就完成了那次滚动。插完问候语主动拉回顶部。 */
    chat.scrollTop = 0;
    hostWindow.requestAnimationFrame(() => {
      if (!destroyed && chat.isConnected && hostDocument.body.classList.contains(WELCOME_CLASS)) {
        chat.scrollTop = 0;
      }
    });
  }

  /* 侧栏品牌区 + Recents。只在完整版包里跑。 */
  const RAIL_BRAND_CLASS = 'clawd-rail-brand';
  const RAIL_RECENTS_CLASS = 'clawd-rail-recents';
  const PC_TOP_ACTIONS_CLASS = 'clawd-pc-top-actions';
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

  function refreshPcTopActions() {
    if (!railEnabled) return;
    const holder = hostDocument.querySelector('#top-settings-holder');
    if (!holder) return;
    let existing = hostDocument.querySelector('.' + PC_TOP_ACTIONS_CLASS);
    if (mobileEnabled) {
      existing?.remove();
      return;
    }
    if (existing && existing.parentElement !== holder) {
      existing.remove();
      existing = null;
    }
    if (existing?.isConnected) return;
    const actions = hostDocument.createElement('div');
    actions.className = PC_TOP_ACTIONS_CLASS;
    actions.setAttribute('aria-hidden', 'true');
    actions.innerHTML =
      '<span><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4 4"></path></svg></span>' +
      '<span><svg viewBox="0 0 24 24"><rect x="3.5" y="4" width="17" height="16" rx="2.5"></rect><path d="M9 4v16"></path></svg></span>';
    holder.append(actions);
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
  let chatTools=null;
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

  function writeAccountStorage(key, value) {
    const store = getContext()?.accountStorage;
    const raw = JSON.stringify(value);
    if (typeof store?.setItem === 'function') store.setItem(key, raw);
    else hostWindow.localStorage.setItem(key, raw);
  }

  /* ===== 近期对话「⋯」操作条：置顶 / 重命名 / 删除（v4，Lulu 2026-09-29）=====
     一条只有图标的横条（第二轮改：不要下拉的一整列、不要文字），挂在 body 上，position:fixed 放在「⋯」左边同一行。
     三个动作都走酒馆自己的数据：置顶写同一个 accountStorage 键（key 拼法同 PinnedChatsManager），
     重命名用酒馆的输入弹窗和 renameGroupOrCharacterChat / updateRemoteChatName，删除沿用下面的删除链路。
     注意：酒馆的 PinnedChatsManager 有内存缓存，它自己的欢迎页要刷新后才看得到这里改的置顶。 */
  let recentMenu = null;               // { el, row, cleanup }
  let recentLongPressUntil = 0;

  function closeRecentMenu() {
    if (!recentMenu) return;
    recentMenu.cleanup();
    recentMenu.el.remove();
    recentMenu.row.classList.remove('cw-recent-menu-open');
    recentMenu = null;
  }

  function openRecentMenu(entry, row, anchor) {
    closeRecentMenu();
    const cn = ccPrefersChinese();
    const pinned = Object.prototype.hasOwnProperty.call(readPinnedChats(), pinnedKeyFor(entry.record));
    /* 2.0.287（design-flavor-v4，Lulu）：v4 外观下改成和「+」「≡」、消息「…」同一套菜单（.cw-menu，字 + 图标、删除红色），
       电脑和手机都改；挂在「⋯」下面（手机右对齐、电脑左对齐）。非 v4 外观仍是原来的图标横条。 */
    const cwLook = hostDocument.documentElement.hasAttribute('data-cw-v4');
    const menu = hostDocument.createElement('div');
    menu.className = cwLook ? 'cw-menu-wrap cw-recent-menu-wrap' : 'cw-recent-menu';
    const box = cwLook ? hostDocument.createElement('div') : menu;
    if (cwLook) { box.className = 'cw-menu cw-recent-menu-list'; menu.append(box); }
    box.setAttribute('role', 'menu');
    const item = (icon, label, run, danger = false) => {
      const b = hostDocument.createElement('button');
      b.type = 'button';
      b.className = 'cw-recent-menu-item' + (danger ? ' danger' : '');
      b.setAttribute('role', 'menuitem');
      b.dataset.icon = icon;
      if (cwLook) {
        b.className = 'cw-menu-item' + (danger ? ' cw-danger' : '');
        const ic = hostDocument.createElement('span'); ic.className = 'cw-recent-ic'; ic.dataset.icon = icon;
        const lb = hostDocument.createElement('span'); lb.className = 'cw-menu-label'; lb.textContent = label;
        b.append(ic, lb);
      }
      // 只放图标（Lulu 2026-09-29：不要拉下来一整列，做成一条、不要文字）；名字进 title / aria-label
      b.title = label;
      b.setAttribute('aria-label', label);
      b.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        closeRecentMenu();
        void run().catch(error => {
          console.error('[Claude-Clawd] 近期对话操作失败：', error);
          hostWindow.toastr?.error?.(String(error?.message || error || '').slice(0, 180));
        });
      });
      return b;
    };
    if(chatTools?.isEnabled())box.append(item('star',chatTools.isFavorite(entry.record)?(cn?'取消收藏':'Unstar'):(cn?'收藏':'Star'),async()=>{chatTools.toggleFavorite(entry.record);}));
    box.append(
      item('pin', pinned ? (cn ? '取消置顶' : 'Unpin') : (cn ? '置顶' : 'Pin'), () => toggleRecentPin(entry)),
      item('pencil', cn ? '重命名' : 'Rename', () => renameRecent(entry)),
    );
    /* 2.0.289：照 Claude Code 侧栏菜单（Lulu P4），删除前面隔一条线 */
    if (cwLook) { const sep = hostDocument.createElement('div'); sep.className = 'cw-menu-sep'; box.append(sep); }
    box.append(item('trash', cn ? '删除' : 'Delete', async () => deleteRecentRow(row), true));
    hostDocument.body.append(menu);
    row.classList.add('cw-recent-menu-open');
    /* 一条横的操作条，放在「⋯」左边、和它同一行居中，不盖住下面几行；左边放不下才放到「⋯」下方 */
    const a = anchor.getBoundingClientRect(), m = box.getBoundingClientRect();
    let left = a.left - m.width - 4;
    let top = a.top + (a.height - m.height) / 2;
    if (cwLook) {
      const phone = hostWindow.matchMedia('(max-width:700px)').matches;
      left = phone ? a.right - m.width + 6 : a.left - 6;
      left = Math.max(8, Math.min(left, hostWindow.innerWidth - m.width - 8));
      top = a.bottom + 6;
      if (top + m.height > hostWindow.innerHeight - 8) top = Math.max(8, a.top - m.height - 6);
    } else if (left < 8) {
      left = Math.max(8, Math.min(a.right - m.width, hostWindow.innerWidth - m.width - 8));
      top = a.bottom + 4;
      if (top + m.height > hostWindow.innerHeight - 8) top = Math.max(8, a.top - m.height - 4);
    }
    box.style.left = Math.round(left) + 'px';
    box.style.top = Math.round(top) + 'px';
    const outside = event => { if (!menu.contains(event.target) && !anchor.contains(event.target)) closeRecentMenu(); };
    const key = event => { if (event.key === 'Escape') { closeRecentMenu(); event.stopPropagation(); } };
    const away = () => closeRecentMenu();
    hostDocument.addEventListener('pointerdown', outside, true);
    hostDocument.addEventListener('keydown', key, true);
    hostWindow.addEventListener('resize', away);
    const list = row.closest('.recentChatList');
    list?.addEventListener('scroll', away, { passive: true });
    recentMenu = {
      el: menu, row,
      cleanup() {
        hostDocument.removeEventListener('pointerdown', outside, true);
        hostDocument.removeEventListener('keydown', key, true);
        hostWindow.removeEventListener('resize', away);
        list?.removeEventListener('scroll', away);
      },
    };
  }

  async function toggleRecentPin(entry) {
    const state = { ...readPinnedChats() };
    const key = pinnedKeyFor(entry.record);
    if (Object.prototype.hasOwnProperty.call(state, key)) delete state[key];
    else state[key] = { group: entry.record?.group, avatar: entry.record?.avatar, file_name: entry.record?.file_name };
    writeAccountStorage(PINNED_CHATS_KEY, state);
    recentDataVersion += 1;
    refreshRailRecents({ force: true });
  }

  async function renameRecent(entry) {
    const { main, popup } = await loadDeleteModules();
    const cn = ccPrefersChinese();
    const oldName = entry.fileName;
    const title = cn ? '新的对话名' : 'New chat name';
    const answer = typeof popup?.callGenericPopup === 'function' && popup?.POPUP_TYPE?.INPUT !== undefined
      ? await popup.callGenericPopup(title, popup.POPUP_TYPE.INPUT, oldName)
      : hostWindow.prompt(title, oldName);
    const newName = typeof answer === 'string' ? answer.trim() : '';
    if (!newName || newName === oldName) return;
    if (typeof main?.renameGroupOrCharacterChat !== 'function') {
      throw new Error(cn ? '拿不到酒馆的重命名接口' : 'SillyTavern rename API unavailable');
    }
    if (entry.isGroup) {
      await main.renameGroupOrCharacterChat({ groupId: entry.group, oldFileName: oldName, newFileName: newName, loader: false });
    } else {
      const { index } = resolveCharacterIndex(main, entry.avatar);
      if (index < 0) throw new Error((cn ? '找不到角色：' : 'Character not found: ') + entry.avatar);
      await main.renameGroupOrCharacterChat({ characterId: String(index), oldFileName: oldName, newFileName: newName, loader: false });
      if (typeof main.updateRemoteChatName === 'function') await main.updateRemoteChatName(index, newName);
    }
    // 置顶跟着改名走（同 PinnedChatsManager.rename）
    const state = { ...readPinnedChats() };
    const oldKey = pinnedKeyFor(entry.record);
    if (Object.prototype.hasOwnProperty.call(state, oldKey)) {
      const ext = /\.jsonl$/i.test(String(entry.record?.file_name ?? '')) ? '.jsonl' : '';
      const renamed = { ...entry.record, file_name: newName + ext };
      delete state[oldKey];
      state[pinnedKeyFor(renamed)] = { group: renamed.group, avatar: renamed.avatar, file_name: renamed.file_name };
      writeAccountStorage(PINNED_CHATS_KEY, state);
    }
    hostWindow.toastr?.success?.(cn ? '已重命名' : 'Chat renamed');
    recentDataVersion += 1;
    refreshRailRecents({ force: true });
  }

  function deleteRecentRow(row) {
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
  }

  /* 当前对话那一行挂 cw-current：手机上「⋯」只在这一行常显（其余行长按） */
  function markCurrentRecent() {
    const context = getContext();
    const chatId = String(context?.getCurrentChatId?.() ?? '');
    /* 2.0.340：不同角色可以有同名存档（比如从别的角色拷来的聊天），只比文件名会把两行都标成当前——
       生成中的橙点就亮了两个。再比一次是哪个角色 / 群组；拿不到角色时退回只比文件名。 */
    const groupId = String(context?.groupId ?? '').trim();
    const avatar = groupId ? '' : String(context?.characters?.[context?.characterId]?.avatar ?? '').trim();
    for (const row of hostDocument.querySelectorAll('.clawd-rail-recents .recentChat')) {
      const owner = groupId ? String(row.dataset.group ?? '').trim() === groupId
        : (!avatar || String(row.dataset.avatar ?? '').trim() === avatar);
      const on = Boolean(chatId) && owner && normalizeChatKey(row.dataset.file) === normalizeChatKey(chatId);
      if (row.classList.contains('cw-current') !== on) row.classList.toggle('cw-current', on);
    }
  }

  /* 拉取 + 补齐 + 排序。补齐和排序规则照抄 1.18 getRecentChats 的尾巴，
     否则侧栏顺序会和欢迎页对不上。 */
  async function buildRecentEntries() {
    /* 不 await loadDeleteModules()。
       渲染列表其实只需要两样东西：一次带 CSRF 头的 fetch，和 getContext() 里的
       characters / groups —— 宿主模块一个都用不上。第一版在这里等模块注入完成，
       而注入要塞 <script type="module"> 再等它跑完，真机上表现成
       「进页面后侧栏空着，过一会儿才冒出来」。
       hostRequestHeaders 在拿不到 main.getRequestHeaders 时会自己去取
       csrf-token，所以传一个空快照也能正常工作。 */
    const main = hostModulesSnapshot?.main ?? {};
    const settings = readRecentChatsSettings();
    const pinned = readPinnedChats();
    const favoriteRecords=chatTools?.favoriteRecords()||[];
    const records = await fetchRecentChatRecords(main, settings.maxDisplayed, [...Object.values(pinned),...favoriteRecords]);
    if(records)chatTools?.reconcileFavorites(records,favoriteRecords);
    if (!records) return null;

    const context = getContext();
    const characters = Array.isArray(context?.characters) ? context.characters : [];
    const groups = Array.isArray(context?.groups) ? context.groups : [];

    /* 角色列表还没加载完的时候，下面那句「认不出实体的记录过滤掉」会把
       所有记录都滤没，然后这一轮被标记成「已加载」，不再重试 ——
       真机表现是侧栏空着，要点一下角色卡触发 CHAT_CHANGED 才补上。
       返回 null 表示「还没就绪」，调用方不会标记已加载，会再试。 */
    if (records.length && !characters.length && !groups.length) return null;

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
        /* 正文预览。服务端的 recent-chats 记录里本来就带最后一条消息，
           酒馆自己的欢迎页也是拿它显示的 —— 之前这一行没被渲染出来，
           不是数据没有。去掉标签、把空白压成一个空格，截断交给 CSS。 */
        preview: String(record?.mes ?? record?.preview_message ?? '')
          .replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160),
        pinned: Object.prototype.hasOwnProperty.call(pinned, pinnedKeyFor(record)),
      });
    }

    /* 置顶的排前面，组内按最后一条消息倒序。 */
    /* dateText 是服务端 last_mes 原样带过来的人类可读串，形如
       "August 2, 2026 11:36am"。原来这里直接 localeCompare，等于按字母顺序排：
       "August" 排在 "July" 前面纯属字母巧合，跨月直接乱；同一天里
       "11:36am" 因为首字符 '1' < '6'，被排到 "6:08am" 后面。
       真机实测，服务端返回的第一条（也就是最新的那条）在侧栏被排到了列表末尾，
       表现出来就是"发了消息侧栏完全没反应"——其实数据是新的，只是排错了位置。
       解析成时间戳再比。"11:36am" 中间没空格，Date.parse 认不出来，先补一个。
       解析不出来的记 0 排到最后，并退回字符串比较做兜底，保证顺序稳定。 */
    // Formal 2.0.155: one timestamp policy (recent-time.js) also reads numeric last_mes; unparsable dates sort last.
    const timeOf = parseRecentTime;
    const compareAge = (a, b) => {
      const left = timeOf(a.dateText), right = timeOf(b.dateText);
      if (left === null || right === null) return left === right ? 0 : left === null ? 1 : -1;
      return right - left;
    };
    const starred = new Set(entries.filter(entry => chatTools?.isFavorite(entry.record)));
    entries.sort((a, b) => {
      if (starred.has(a) !== starred.has(b)) return starred.has(a) ? -1 : 1;
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      const diff = compareAge(a, b);
      if (diff) return diff;
        return String(b.dateText).localeCompare(String(a.dateText));
      });
      return chatTools?.isEnabled() && preferencesFor(hostWindow).getItem('claude-web:recents-filter') === 'starred' ? entries.filter(entry=>chatTools.isFavorite(entry.record)) : entries;
    }
    function ensureRecentsSlot(holder) {
      const slots = [ ...hostDocument.querySelectorAll("." + RAIL_RECENTS_CLASS) ];
    for (const extra of slots.slice(1)) extra.remove();
    let slot = slots[0] || null;
    if (slot && slot.parentElement !== holder) {
      slot.remove(); slot = null;
    }
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

  /* 会话行右上角那个时间的短标签。
     解析用的正规化和 collectRecentEntries 里的 timeOf 是同一套：服务端可能给
     ISO，也可能给 "August 2, 2026 11:36am" 这种人类可读串，后者中间没空格，
     Date.parse 认不出来，先补一个。
     解析不出来就原样返回 —— 宁可显示得难看，也不编一个看起来很像的时间出来。 */
  function recentDateLabel(value) {
    const parsed = parseRecentTime(value);
    if (parsed === null) return '';
    const d = new Date(parsed);
    const now = new Date();
    const sameDay = d.getFullYear() === now.getFullYear()
      && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    if (sameDay) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (d.getFullYear() === now.getFullYear()) {
      return d.toLocaleDateString([], { month: 'numeric', day: 'numeric' });
    }
    return d.toLocaleDateString([], { year: 'numeric', month: 'numeric', day: 'numeric' });
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
    date.title = entry.dateText;
    date.textContent = recentDateLabel(entry.dateText);

    /* 预览行。没有内容就不建节点 —— 建一个空的会在行里占出一条空白，
       列表看起来忽高忽低。 */
    let preview = null;
    if (entry.preview) {
      preview = hostDocument.createElement('div');
      preview.className = 'chatPreview';
      preview.textContent = entry.preview;
    }

    const actions = hostDocument.createElement('div');
    actions.className = 'chatActions';
    const del = hostDocument.createElement('button');
    del.type = 'button';
    del.className = 'menu_button menu_button_icon deleteChat';
    del.title = ccPrefersChinese() ? '删除对话' : 'Delete chat';
    del.innerHTML = '<i class="fa-solid fa-trash fa-fw"></i>';
    /* v4（classic + rail）：「⋯」打开一个小菜单：置顶 / 重命名 / 删除（Lulu 2026-09-29，照 claude.ai）。
       垃圾桶留给其他结构 / 皮肤；v4 里藏掉垃圾桶、显示「⋯」，别处反过来（official-layout.css）。 */
    const more = hostDocument.createElement('button');
    more.type = 'button';
    more.className = 'cw-recent-more';
    more.title = ccPrefersChinese() ? '更多' : 'More';
    more.setAttribute('aria-label', more.title);
    more.setAttribute('aria-haspopup', 'menu');
    actions.append(del, more);

    const badges=hostDocument.createElement('span');badges.className='cw-recent-badges';
    for(const [key,on,label]of [['star',chatTools?.isEnabled()&&chatTools.isFavorite(entry.record),ccPrefersChinese()?'已收藏':'Starred'],['pin',entry.pinned,ccPrefersChinese()?'已置顶':'Pinned']])if(on){const badge=hostDocument.createElement('span');badge.className='cw-recent-badge';badge.dataset.icon=key;badge.title=label;badge.setAttribute('aria-label',label);badge.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+recentBadgeIcons[key]+'</svg>';badges.append(badge);}
    if(badges.childElementCount)strong.after(badges);
    nameContainer.append(nameLine, date, actions);
    if (preview) nameContainer.append(preview);
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
      entry.fileName, entry.avatar, entry.group, entry.name, entry.pinned ? 1 : 0, chatTools?.isEnabled()&&chatTools.isFavorite(entry.record)?1:0,
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
      if (chatTools?.isFavorite(entry.record)) row.dataset.cwFavorite = '1';
      /* 监听器绑在自己造的节点上，不依赖酒馆的任何绑定时机。
         行整体点击 = 打开；删除键单独处理并阻止冒泡，免得删完顺手把它打开。 */
      row.addEventListener('click', event => {
        if (event.target instanceof hostWindow.Element
          && event.target.closest('.chatActions')) return;
        // 长按刚打开了菜单：抬手时浏览器补发的这次 click 不算「打开这条对话」
        if (Date.now() < recentLongPressUntil) return;
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
        deleteRecentRow(row);
      });
      row.querySelector('.cw-recent-more')?.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        if (recentMenu?.row === row) closeRecentMenu();
        else openRecentMenu(entry, row, event.currentTarget);
      });
      /* 手机没有悬停：长按一行直接打开它的菜单（0.5 秒，手指挪开 8px 以上算滚动，不算长按） */
      row.addEventListener('pointerdown', event => {
        if (event.pointerType !== 'touch') return;
        const x = event.clientX, y = event.clientY;
        const timer = hostWindow.setTimeout(() => {
          recentLongPressUntil = Date.now() + 700;
          openRecentMenu(entry, row, row.querySelector('.cw-recent-more') || row);
        }, 500);
        const stop = () => { hostWindow.clearTimeout(timer); row.removeEventListener('pointermove', move); };
        const move = e => { if (Math.hypot(e.clientX - x, e.clientY - y) > 8) stop(); };
        row.addEventListener('pointermove', move);
        row.addEventListener('pointerup', stop, { once: true });
        row.addEventListener('pointercancel', stop, { once: true });
      });
      row.addEventListener('contextmenu', event => { if (Date.now() < recentLongPressUntil) event.preventDefault(); });
      list.append(row);
    }
    if (recentMenu && !recentMenu.row.isConnected) closeRecentMenu();   // 列表重建了，菜单指着的那行已经不在
    markCurrentRecent();
    setBodyClass('clawd-has-recents', entries.length > 0);
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
    /* 原来这里写的是「不是欢迎页就不刷」，理由是"侧栏在聊天页是收着的，
       刷了也没人看"。这个前提不成立：侧栏在聊天页照样可以是展开的，
       用户实测就是"聊天时左边历史列表明明在眼前，却一直不更新"。
       改成直接问列表本身可不可见。getClientRects().length 对 display:none、
       祖先隐藏、position:fixed 都判得准，比 offsetParent 可靠。 */
    /* 2.0.171：先比时间再问可见性。getClientRects 会强制当场做完积压的样式重算和排版，
       它挂在每次 refreshClawd 上，打开设置页时就把整页重算提前拆了出来。TTL 内根本不会拉取，不用问。 */
    if (now - recentFetchedAt <= RECENT_FETCH_TTL) return false;
    const slot = hostDocument.querySelector('.' + RAIL_RECENTS_CLASS);
    return !!slot && slot.getClientRects().length > 0;
  }

  function refreshRailRecents({ force = false } = {}) {
    if (!railEnabled || destroyed) return;
    const holder = hostDocument.querySelector('#top-settings-holder');
    if (!holder) return;
    ensureRecentsSlot(holder);
    markCurrentRecent();
    if (recentRenderPending) return;

    const now = Date.now();
    if (!shouldFetchRecents(force, now)) return;
    recentFetchedAt = now;
    recentRenderPending = true;
    const token = ++recentRenderToken;
    const versionAtFetch = recentDataVersion;

    void buildRecentEntries()
      .then(entries => {
        /* 期间又发起过新的一轮，或者脚本已经拆了，就丢弃这次结果。 */
        if (destroyed || token !== recentRenderToken) return;
        /* null = 还没就绪（多半是酒馆的角色列表还没加载完）。
           不标记「已加载」，让下一轮刷新再试一次。
           以前在发起请求前就标记，结果首屏那次拉空之后再也不重试。 */
        if (!entries) {
          hostWindow.setTimeout(() => refreshRailRecents({ force: true }), 600);
          return;
        }
        recentLoadedOnce = true;
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
      clawdReadingGate.reset(true); clawdComposerReaction.reset();
      guardMobileChatAutofocus();
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
    /* getContext() 一开始就有，不用等宿主模块注入完 —— 侧栏首屏能不能立刻
       拉到近期对话，就差这一步。拿不到再退回去取 csrf-token。 */
    const context = getContext();
    if (typeof context?.getRequestHeaders === 'function') return context.getRequestHeaders();
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
    chatTools?.removeChat({avatar:avatarId,group:groupId,file_name:fileName});
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
      const name = context?.name1 || "";
      const selected = hostDocument.querySelector('#user_avatar_block .avatar-container.selected, #user_avatar_block .avatar.selected');
      const avatar = selected?.matches('.avatar') ? selected : selected?.querySelector('.avatar');
      const img = selected?.querySelector('img');
      const id = selected?.getAttribute('data-avatar-id') || avatar?.getAttribute('data-avatar-id') || avatar?.getAttribute('imgfile');
      let src = id ? '/thumbnail?type=persona&file=' + encodeURIComponent(id) : "";
      if (!src) {
        const fallback = hostDocument.querySelector('#chat .mes[is_user="true"] .avatar img');
        src = [img?.getAttribute('data-bai-bai-toolkit-lazy-avatar-src'), img?.getAttribute('src'), fallback?.getAttribute('src')]
          .map(value => String(value || "").trim()).find(value => value && !/^data:/i.test(value)) || "";
      }
      return {
        name: name,
        src: src
      };
    }

  function refreshRailUser(retryBad = false) {
      if (destroyed || !railEnabled) return;
      const holder = hostDocument.querySelector("#top-settings-holder");
      if (!holder) return;
      const row = holder.querySelector("#persona-management-button > .drawer-toggle");
      if (!row) return;
      for (const extra of [ ...row.querySelectorAll(".clawd-user-face") ].slice(1)) extra.parentElement === row && extra.remove();
      row.querySelector(".clawd-user-face") || row.insertAdjacentHTML("beforeend", '<span class="clawd-user-face"></span><span class="clawd-user-meta"><span class="clawd-user-name"></span><span class="clawd-user-plan">Max plan</span></span><span class="clawd-user-more">▾</span>');
      const persona = currentPersona();
      const name = row.querySelector(".clawd-user-name");
      name && name.textContent !== persona.name && (name.textContent = persona.name || "User");
      const face = row.querySelector(".clawd-user-face");
      if (!face) return;
      const previous = refreshRailUser.avatar;
      if (previous && previous.img !== face.querySelector("img")) {
        previous.cleanup();
        refreshRailUser.avatar = null;
      }
      if (persona.src) {
        let img = face.querySelector("img");
        let created = false;
        if (!img) {
          img = hostDocument.createElement("img");
          img.dataset.cwWant = persona.src;
          created = true;
          face.textContent = "";
          face.append(img);
        }
        let state = refreshRailUser.avatar;
        if (!state) {
          state = {img, timer: 0, retries: 0, lastImmediate: 0, initials: null, name: ""};
          const cancel = () => {
            hostWindow.clearTimeout(state.timer);
            state.timer = 0;
          };
          const valid = () => !destroyed && img.isConnected && img.parentElement === face;
          const showInitials = () => {
            img.hidden = true;
            img.style.setProperty("display", "none", "important");
            state.initials ??= hostDocument.createTextNode("");
            state.initials.textContent = state.name;
            if (state.initials.parentNode !== face) face.append(state.initials);
          };
          const request = () => {
            if (!valid() || !img.dataset.cwWant) return;
            const url = new hostWindow.URL(img.dataset.cwWant, hostDocument.baseURI);
            url.searchParams.set("cw-retry", String(Date.now()));
            img.src = url.href;
          };
          const loaded = () => {
            cancel();
            state.retries = 0;
            if (img.hidden) img.hidden = false;
            if (img.style.getPropertyValue("display")) img.style.removeProperty("display");
            state.initials?.remove();
          };
          const failed = () => {
            if (!valid() || state.timer) return;
            if (state.retries >= 3) return showInitials();
            const wanted = img.dataset.cwWant, delay = [1000, 3000, 10000][state.retries++];
            state.timer = hostWindow.setTimeout(() => {
              state.timer = 0;
              if (valid() && img.dataset.cwWant === wanted) request();
            }, delay);
          };
          // Passive refreshes must not restart an exhausted retry budget.
          const recover = event => {
            if (!img.complete || img.naturalWidth > 0 || state.timer) return;
            if (!event.target?.closest?.('.clawd-mobile-menu-button, #persona-management-button, .recentChat, .cw-v4-newchat-top, #option_start_new_chat, .clawd-mobile-new-chat')) return;
            hostWindow.queueMicrotask(() => !destroyed && refreshRailUser(true));
          };
          const removal = new hostWindow.MutationObserver(() => {
            if (!valid()) state.cleanup();
          });
          removal.observe(face, {childList: true});
          removal.observe(row, {childList: true});
          removal.observe(row.parentElement, {childList: true});
          removal.observe(holder, {childList: true});
          state.cleanup = () => {
            cancel();
            removal.disconnect();
            img.removeEventListener("error", failed);
            img.removeEventListener("load", loaded);
            hostDocument.removeEventListener("click", recover, true);
            if (refreshRailUser.avatar === state) refreshRailUser.avatar = null;
          };
          state.request = request;
          state.cancel = cancel;
          img.addEventListener("error", failed);
          img.addEventListener("load", loaded);
          hostDocument.addEventListener("click", recover, true);
          refreshRailUser.avatar = state;
        }
        state.name = (persona.name || "U").trim().slice(0, 2);
        if (state.initials?.isConnected && state.initials.textContent !== state.name) state.initials.textContent = state.name;
        if (created || img.dataset.cwWant !== persona.src) {
          state.cancel();
          state.retries = 0;
          state.lastImmediate = 0;
          if (img.dataset.cwWant !== persona.src) img.dataset.cwWant = persona.src;
          if (img.hidden) img.hidden = false;
          if (img.style.getPropertyValue("display")) img.style.removeProperty("display");
          state.initials?.remove();
          img.src = persona.src;
        } else if (img.complete && img.naturalWidth === 0 && !state.timer &&
          (state.retries < 3 || retryBad) && Date.now() - state.lastImmediate >= 5000) {
          state.lastImmediate = Date.now();
          state.request();
        }
      } else {
        refreshRailUser.avatar?.cleanup();
        face.querySelector("img")?.remove();
        const initial = (persona.name || "U").trim().slice(0, 2);
        face.textContent !== initial && (face.textContent = initial);
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
    try { preferencesFor(hostWindow).setItem(LAST_CHARACTER_KEY, value); } catch (error) { /* 隐私模式 */ }
  }

  function rememberedCharacterName(characters) {
    /* 第一次安装还没有本地记忆时，从 Recents 第一条的 avatar 反查角色名；
       以后每次真实选择都会覆盖 localStorage。 */
    try {
      const saved = preferencesFor(hostWindow).getItem(LAST_CHARACTER_KEY) || '';
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
    /* 2.0.248：聊天页的按钮在输入框下面、贴着屏幕底，往下展开会掉出视口；下面放不下而上面更宽时改成往上展开。 */
    const below = lowerBoundary - (rect.bottom + 8);
    const above = rect.top - 8 - (viewportTop + 12);
    if (!compactMobile && below < 240 && above > below) {
      /* 用 top 不用 bottom：某些宽度下 body 成了 fixed 的包含块（高度不是视口），bottom 会算到屏幕外。先定最大高度，量出实际高度再放。 */
      const upHeight = Math.min(420, above);
      menu.style.setProperty('bottom', 'auto', 'important');
      menu.style.setProperty('max-height', `${upHeight}px`, 'important');
      list.style.maxHeight = `${Math.max(48, Math.min(352, upHeight - 60))}px`;
      menu.style.setProperty('top', `${Math.max(viewportTop + 12, rect.top - 8 - menu.offsetHeight)}px`, 'important');
      return;
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
    /* 2.0.249：聊天页（2.0.248 起也有这个按钮）里选角色 = 直接打开那个角色的聊天，不回欢迎页、不挂 pending。 */
    if (!hostDocument.body.classList.contains(WELCOME_CLASS)) {
      try {
        const context = getContext();
        const select = typeof context?.selectCharacterById === 'function'
          ? context.selectCharacterById
          : (await loadDeleteModules()).main?.selectCharacterById;
        if (typeof select !== 'function') throw new Error('当前酒馆版本没有提供角色切换接口。');
        await select(String(index), { switchMenu: false });
        scheduleRefresh();
      } catch (error) {
        console.error('[Claude Clawd] 角色切换失败:', error);
        hostWindow.toastr?.error?.(
          ccPrefersChinese()
            ? `角色切换失败：${String(error?.message || error).slice(0, 160)}`
            : `Character switch failed: ${String(error?.message || error).slice(0, 160)}`,
        );
      }
      return;
    }
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
    const head = hostDocument.createElement('div');
    head.className = 'clawd-character-head';
    head.textContent = ccPrefersChinese() ? '快速切换角色卡' : 'Quick switch';
    menu.append(head, search);

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
        /* 2.0.268（design-small-menus-v1，照 Mode 菜单）：名字下面一行灰字「上次聊天 几月几日」。 */
        const last = Number(character?.date_last_chat) || 0;
        if (last) {
          const sub = hostDocument.createElement('small');
          sub.className = 'clawd-character-sub';
          const d = new Date(last);
          sub.textContent = ccPrefersChinese() ? `上次聊天 ${d.getMonth() + 1}月${d.getDate()}日` : `Last chat ${d.toLocaleDateString()}`;
          label.append(sub);
        }
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
    /* 2.0.248：电脑聊天页也显示（照 Claude 的「Opus 5.5 Medium」放在输入框下面右边，CSS ㉘）；手机仍不显示。 */
    const showSwitcher = !mobileEnabled;
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
    setMobileMenuOpen(false);
    mobileChrome?.menu?.setAttribute('aria-expanded', 'false');
  }

  /* 2.0.203（Lulu 定：照 Claude 手机版的推开式）：侧栏固定在左边，页面往右推开露出侧栏（见 official-layout.css 末尾）。
     侧栏里点设置入口：新页先在右边露出的那条里原地换上（official-layout 的 activate 先关旧页再开新页，
     酒馆就不会在两页之间空等 animation_duration、露出首页），等新页画出一帧，再收侧栏，新页往左滑回盖住侧栏。 */
  function showPanelFromRail(panel) {
    // Formal 2.0.148: a third-party drawer CW has no page for opens through its own native toggle.
    const layout = hostWindow.__claudeOfficialLayout;
    if (!layout?.has?.(panel.id)) {
      panel.parentElement?.querySelector(':scope > .drawer-toggle')?.click();
      hostWindow.setTimeout(closeMobileMenu, 0);
      return;
    }
    const token = mobileMenuCloseToken;
    let raf = 0, shownFrames = 0, frames = 0;
    const cleanup = () => {
      if (raf) hostWindow.cancelAnimationFrame(raf);
      raf = 0;
      if (mobileNavPanelCleanup === cleanup) mobileNavPanelCleanup = null;
    };
    const wait = () => {
      raf = 0;
      // 等待途中重新开关了侧栏（任务号变了 / 侧栏已收）就作废。
      if (destroyed || token !== mobileMenuCloseToken || !isMobileMenuOpen()) { cleanup(); return; }
      const shell = hostDocument.querySelector('.cw-v4-shell');
      const shown = panel.classList.contains('openDrawer') && shell && !shell.hidden && shell.dataset.panel === panel.id;
      // 新页在上一帧已经画出来（shownFrames 至少 1），这一帧再收；酒馆一直没打开它时，约 5 秒后照样收起，不把侧栏卡住。
      if ((shown && shownFrames++ >= 1) || ++frames > 300) { cleanup(); closeMobileMenu(); return; }
      raf = hostWindow.requestAnimationFrame(wait);
    };
    mobileNavPanelCleanup?.();
    mobileNavPanelCleanup = cleanup;
    // activate 用酒馆自己的开关按钮关旧页、开新页；这两次程序点击不能被当成「点了入口要收侧栏」。
    mobileNavActivating = true;
    try { hostWindow.__claudeOfficialLayout?.activate(panel.id); } finally { mobileNavActivating = false; }
    raf = hostWindow.requestAnimationFrame(wait);
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
    if (!mobileEnabled || !welcomeEnabled) return;
    const holder = hostDocument.querySelector('#top-settings-holder');
    if (!holder || holder.querySelector(':scope > .clawd-mobile-new-chat')) return;
    const button = hostDocument.createElement('button');
    button.type = 'button';
    button.className = 'clawd-mobile-new-chat';
    button.textContent = ccPrefersChinese() ? '+ 新对话' : '+ New chat';
    button.addEventListener('click', () => void startMobileNewChat());
    holder.append(button);
  }

  /* 2.0.248.2：键盘开着时点 ≡，Via 的 WebView 要等键盘收完才把页面放回全高，中间约 150ms 页面还按键盘高度排版。
     这时推开侧栏，就会先看到一截矮侧栏、下面露着键盘和空白，再跳成全高，肉眼是“闪一下”。
     所以这种情况先让键盘收起，等视口回到全高、那一帧画出来（resize 后再隔两个 rAF）再推开；最多等 700ms。
     收键盘这段和平时按返回键一样，侧栏一出现就是全高。键盘没开时照旧立即打开。 */
  let mobileMenuOpenWait = null;
  function cancelMobileMenuOpenWait() {
    mobileMenuOpenWait?.();
    mobileMenuOpenWait = null;
  }
  function openMobileMenuAfterKeyboard() {
    cancelMobileMenuOpenWait();
    if (!mobileViewportStillShrunk()) {
      setMobileMenuOpen(true);
      return;
    }
    const active = hostDocument.activeElement;
    if (isSoftKeyboardTarget(active)) active.blur();
    let settled = false;
    let timer = 0;
    const viewport = hostWindow.visualViewport;
    const cleanup = () => {
      settled = true;
      hostWindow.clearTimeout(timer);
      hostWindow.removeEventListener('resize', onResize);
      viewport?.removeEventListener('resize', onResize);
    };
    const open = () => {
      if (settled) return;
      cleanup();
      mobileMenuOpenWait = null;
      if (!destroyed && !isMobileMenuOpen()) setMobileMenuOpen(true);
    };
    function onResize() {
      if (!mobileViewportStillShrunk()) open();
    }
    hostWindow.addEventListener('resize', onResize);
    viewport?.addEventListener('resize', onResize);
    timer = hostWindow.setTimeout(open, 700);
    mobileMenuOpenWait = cleanup;
  }

  function refreshMobileChrome() {
    if (!mobileEnabled || !welcomeEnabled) return;
    const narrow = mobileEnabled;
    if (!narrow) {
      closeMobileMenu();
      mobileChrome?.root?.remove();
      mobileChrome = null;
      return;
    }
    if (mobileChrome?.root?.isConnected) return;

    const root = hostDocument.createElement('div');
    root.className = 'clawd-mobile-chrome';
    // 11-26 「悬浮窗收纳」会把 ≡、新对话这些小按钮当悬浮球收走（手机上 ≡ 是打开侧栏的唯一入口）；打上它认得的浮层标记，整块跳过。
    root.setAttribute('data-popper-placement', 'bottom');
    const menu = hostDocument.createElement('button');
    menu.type = 'button';
    menu.className = 'clawd-mobile-menu-button';
    menu.setAttribute('aria-label', ccPrefersChinese() ? '打开导航' : 'Open navigation');
    menu.setAttribute('aria-expanded', 'false');
    menu.innerHTML = '<span></span><span></span><span></span>';
    menu.addEventListener('click', () => {
      const open = !isMobileMenuOpen();
      menu.setAttribute('aria-expanded', String(open));
      if (open) openMobileMenuAfterKeyboard();
      else setMobileMenuOpen(false);
    });

    const scrim = hostDocument.createElement('button');
    scrim.type = 'button';
    scrim.className = 'clawd-mobile-scrim';
    scrim.setAttribute('aria-label', ccPrefersChinese() ? '关闭导航' : 'Close navigation');
    scrim.addEventListener('click', closeMobileMenu);
    /* 酒馆在 html 上监听 touchstart / mousedown：点在任何打开的抽屉外面就关掉所有抽屉。
       侧栏盖在设置页上时点外面只该收起侧栏、设置页原样保留，所以这两个事件不从 scrim 往上传。 */
    // Formal 2.0.148: with an external drawer open, the menu tap must not reach ST's outside-close handler.
    const keepExternalDrawer = event => {
      if (!hostDocument.documentElement.hasAttribute('data-cw-v4')) return;
      const external = [...hostDocument.querySelectorAll('#top-settings-holder > .drawer > .drawer-content.openDrawer')].some(panel => !hostWindow.__claudeOfficialLayout?.has?.(panel.id));
      if (external) event.stopPropagation();
    };
    menu.addEventListener('touchstart', keepExternalDrawer, { passive: true });
    menu.addEventListener('mousedown', keepExternalDrawer);
    const keepDrawers = event => event.stopPropagation();
    scrim.addEventListener('touchstart', keepDrawers, { passive: true });
    scrim.addEventListener('mousedown', keepDrawers);

    root.append(menu, scrim);
    hostDocument.body.append(root);
    mobileChrome = { root, menu, scrim };

    /* 手机抽屉里的入口打开全屏设置页后，普通 SillyTavern 的导航应立即滑走。
       TauriTavern 会把多数设置页停放在 #top-settings-holder 内：如果捕获阶段
       先移走整个 holder，面板会刚打开就一起消失，表现为“点了闪回”。 */
    const holder = hostDocument.querySelector('#top-settings-holder');
    if (holder) {
      mobileNavHolder = holder;
      mobileNavPrepareHandler = event => {
        if (!isMobileMenuOpen() || event.button > 0) return;
        const toggle = event.target?.closest?.('.drawer-toggle');
        if (!toggle || isTauriTavernHost() || !hostDocument.documentElement.hasAttribute('data-cw-v4')) return;
        const panel = toggle.parentElement?.querySelector(':scope > .drawer-content');
        if (!hostWindow.__claudeOfficialLayout?.has?.(panel?.id) && !panel?.classList.contains('openDrawer')) return;
        // Keep ST's outside-pointer handler from closing the old page before click.
        event.stopPropagation();
      };
      holder.addEventListener('touchstart', mobileNavPrepareHandler, { capture: true, passive: true });
      holder.addEventListener('mousedown', mobileNavPrepareHandler, true);
      mobileNavCloseHandler = event => {
        const target = event.target instanceof hostWindow.Element ? event.target : null;
        // 近期对话的操作区（「⋯」和它的操作条）、长按刚打开操作条后补发的那次 click：都不收侧栏（Lulu 2026-09-29：点「⋯」侧栏就收回了）
        if (mobileNavActivating || !target || target.closest('.deleteChat, .deleteChatButton, .chatActions')) return;
        if (Date.now() < recentLongPressUntil) return;
        const drawerToggle = target.closest('.drawer-toggle');
        if (drawerToggle && isTauriTavernHost()) return;
        if (!drawerToggle && !target.closest('.recentChat, .clawd-mobile-new-chat, .character_select')) return;
        const panel = drawerToggle?.parentElement?.querySelector(':scope > .drawer-content');
        if (panel && hostDocument.documentElement.hasAttribute('data-cw-v4')) {
          if (!hostWindow.__claudeOfficialLayout?.has?.(panel.id)) {
            // Let the native drawer handler finish before hiding the rail.
            if (isMobileMenuOpen()) hostWindow.setTimeout(closeMobileMenu, 0);
            return;
          }
          // Synthetic clicks also implement native Close/Escape. Let those close
          // an open drawer; only a real tap on the current entry means "show this page".
          if (!event.isTrusted && panel.classList.contains('openDrawer')) return;
          if (event.isTrusted && isMobileMenuOpen()) {
            // 当前页：只收侧栏，页面滑回。别的页：原地换上新页，画好后再滑回（showPanelFromRail）。
            event.stopImmediatePropagation();
            if (panel.classList.contains('openDrawer')) closeMobileMenu();
            else showPanelFromRail(panel);
            return;
          }
        }
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
    // 空聊天和欢迎页不补滚；历史加载后的定位交给原生。
    const keepAtBottom = bottomDistance <= 72 && !recentlyScrolledManually
      && !hostDocument.body.classList.contains('clawd-welcome') && Boolean(chat?.querySelector(':scope > .mes'));
    lastComposerHeight = height;
    const value = `${height}px`;
    if (root.style.getPropertyValue(MOBILE_COMPOSER_HEIGHT_PROPERTY) !== value) {
      root.style.setProperty(MOBILE_COMPOSER_HEIGHT_PROPERTY, value);
    }
    if (keepAtBottom && chat) {
      if (composerBottomRaf) hostWindow.cancelAnimationFrame(composerBottomRaf);
      composerBottomRaf = hostWindow.requestAnimationFrame(() => {
        composerBottomRaf = 0;
        if (destroyed || !chat.isConnected || hostDocument.body.classList.contains('clawd-welcome') || !chat.querySelector(':scope > .mes')) return;
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
        composerResizeObserver = new hostWindow.ResizeObserver(() => {
          scheduleMobileComposerInset();
          scheduleA2BoundsWarm();
        });
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
      try { preferencesFor(hostWindow).setItem(RAIL_KEY, now); } catch (error) { /* 隐私模式下会抛，忽略 */ }
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
      const saved = preferencesFor(hostWindow).getItem(RAIL_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10) || RAIL_MIN;
        /* 288px 是旧版默认值而非用户刻意调出的常见宽度；迁移到官网复标后的 280px。
           其他保存值继续尊重，用户手动拖过的宽度不会被强制重置。 */
        applyRailWidth(parsed === 288 ? 280 : parsed);
      }
    } catch (error) { /* 忽略 */ }
  }

  /* 欢迎页那三个快捷按钮（API 连接 / 角色管理 / 扩展）。
     酒馆把它们放在「SillyTavern System」那条系统消息里当消息正文。

     2.0.149 起锚点改成「就跟在那条系统消息下面」，不再钉到输入框底下。
     原来钉在 #form_sheld 后面，实测落在 y=964、视口高 1000 —— 三个入口
     贴着屏幕最下沿，和输入框挤在一起，读起来像页脚而不是入口。
     现在它们回到正文流里，紧跟在那条系统消息之后。
     按钮文字认不出来就不动，宁可位置不对也别把用户的入口弄丢。 */
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

    /* 锚点：那条系统消息。它不在就退回老位置（输入框下面）——
       消息没渲染出来的时候，入口宁可位置不对也不能消失。 */
    const anchor = hostDocument.querySelector('#chat > .mes.' + WELCOME_PROMPT_CLASS)
      || hostDocument.querySelector('#chat > .mes[type="welcome_prompt"]')
      || form;

    // 已经搬好而且还挨着正确的锚点，就什么都不做
    if (wraps.length === 1
      && wraps[0].previousElementSibling === anchor
      && wraps[0].querySelector('button, .menu_button')) return;

    /* 先找按钮，再清旧壳。反过来的话，清掉的壳会把三个按钮一起带出文档，
       下一行就再也找不到它们了 —— 入口静默消失，而且刷新前回不来。

       两个地方都找：酒馆刚渲染完时按钮在 #chat 的系统消息里，
       上一轮已经搬过的话在我们自己的壳里。只找 #chat 的话，
       升级后第一次运行会因为「壳还在旧位置」而误判成按钮不存在。 */
    const buttons = [...hostDocument.querySelectorAll('#chat, .clawd-welcome-shortcuts')]
      .flatMap(pool => [...pool.querySelectorAll('button, .menu_button, a.menu_button')])
      .filter(b => /API|Character|Extension|角色|扩展|连接/i.test(b.textContent || ''));
    if (buttons.length < 2) return;

    const holder = buttons[0].parentElement;
    if (!holder || holder.children.length > 6) return;

    // 幂等靠「先清后建」，不靠猜之前建过没有 —— 酒馆随时会重建聊天区，
    // 一旦重建，之前那些「有没有建过」的判断全都会失准。
    // holder 已经拿在手里，壳被移除也不会把它弄丢。
    for (const w of wraps) w.remove();

    const wrap = hostDocument.createElement('div');
    wrap.className = 'clawd-welcome-shortcuts';
    anchor.parentElement.insertBefore(wrap, anchor.nextSibling);
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
      const icon = toggle.querySelector('.drawer-icon') ?? toggle;
      if (frameworkCompatibilityMode && icon instanceof hostWindow.HTMLElement) {
        const style = hostWindow.getComputedStyle(icon);
        const before = hostWindow.getComputedStyle(icon, '::before');
        const imageValues = [style, before].flatMap(layer => [
          layer.backgroundImage,
          layer.maskImage,
          layer.getPropertyValue('-webkit-mask-image'),
        ]);
        const hasExternalPaint = imageValues.some(value => value && value !== 'none');
        icon.classList.toggle('clawd-external-icon', hasExternalPaint);
      }
      if (toggle.querySelector(':scope > .clawd-rail-label')) return;
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
    /* 2.0.217：设置页开着时 Clawd 在设置页后面看不见，不跟鼠标——每次读位置都会强制整页排版，
       正赶上弹出页升起时（窄窗口用鼠标点）实测多出约 22ms。 */
    if (hostDocument.documentElement.hasAttribute('data-cw-v4-settings')) return;
    hostDocument.querySelectorAll('button.' + BUTTON_CLASS).forEach(button => {
      // 睡着的时候不跟随
      if (clawdTracks.B === 'sleep') return;
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
      // 真实鼠标接管了：清掉「这份朝向是环境张望设的」标记，
      // 这样左右观察那边的收尾定时器就不会在鼠标已经改了朝向之后
      // 把眼神错误地扳回中间。
      delete button.dataset.clawdAmbientLook;
      for (const dir of ['l', 'r', 'u', 'd']) {
        button.classList.toggle('clawd-look-' + dir, next === dir);
      }
    });
  }
  let lastMouseMoveAt = Date.now();
  function handleLook(event) {
    if (!clawdEnabled()) return;
    /* A pressed mouse button means the pointer is dragging or resizing. Eye
       tracking used to read every Clawd button's layout on every drag frame,
       competing directly with third-party movable panels. */
    if (event.buttons) return;
    lookX = event.clientX;
    lookY = event.clientY;
    lastMouseMoveAt = Date.now();
    if (lookRaf) return;
    lookRaf = requestClawdFrame(applyLook);
  }

  /* D2 左右观察：没有真实 mousemove 一段时间后，偶尔自主看一眼再收回。
     复用鼠标跟随那套 clawd-look-l/r 帧，
     不用新画像素帧。用 dataset.clawdAmbientLook 标记「这份朝向是环境
     张望设的」，收尾定时器到点时只在朝向没被真实鼠标顶替过才收回去，
     避免收尾定时器把真实鼠标刚设好的朝向错误地扳回中间。 */
  const SCAN_IDLE_MS = 8000;
  const SCAN_HOLD_MS = 900;
  function playAmbientGlance(button) {
    if (!button || button.dataset.look) return; // 已经在看某个方向（真实或环境），不叠加
    const dir = Math.random() < 0.5 ? 'l' : 'r';
    button.dataset.look = dir;
    button.dataset.clawdAmbientLook = dir;
    button.classList.add('clawd-look-' + dir);
    clawdLater(() => {
      // 期间没被真实鼠标顶替，才收回去；顶替过的话真实鼠标系统自己会管。
      if (button.dataset.clawdAmbientLook !== dir) return;
      delete button.dataset.clawdAmbientLook;
      button.dataset.look = '';
      button.classList.remove('clawd-look-l', 'clawd-look-r');
    }, SCAN_HOLD_MS);
  }

  function ccMaybeScan() {
    if (destroyed) return;
    if (Date.now() - lastMouseMoveAt < SCAN_IDLE_MS) return;
    if (isTypingActive() || ccSleeping) return;
    if (Math.random() > 0.18) return;
    hostDocument.querySelectorAll('button.' + BUTTON_CLASS).forEach(button => {
      if (clawdTracks.B === 'sleep' || clawdTracks.B === 'neglected') return;
      playAmbientGlance(button);
    });
  }
  function syncCcComposerState(focusedOverride) {
    syncClawdBState();
  }

  const handleComposerInput = event => {
    if (event.target?.id !== 'send_textarea') return;
    clawdComposerReaction.handle(event);
    noteActivity();
    syncCcComposerState(true);
  };

  // Mobile chat loading must not summon the IME. readonly blocks it before
  // focusin; a real touch releases the guard before the browser focuses the field.
  // Own only our readonly change, leaving native/other-extension locks intact.
  let mobileChatAutofocusTarget = null;
  function releaseMobileChatAutofocus() {
    if (mobileChatAutofocusTarget) mobileChatAutofocusTarget.readOnly = false;
    mobileChatAutofocusTarget = null;
  }
  function guardMobileChatAutofocus() {
    if (destroyed || !isMobileLayout()) return;
    const input = hostDocument.getElementById('send_textarea');
    if (!input || input === hostDocument.activeElement || input.readOnly) return;
    releaseMobileChatAutofocus();
    mobileChatAutofocusTarget = input;
    input.readOnly = true;
  }
  const handleComposerFocusGesture = event => {
    if (!event.isTrusted || !isMobileLayout()) return;
    if (event.target?.closest?.('#send_textarea')) releaseMobileChatAutofocus();
  };
  const handleFocusIn = event => {
    if (usesIOSVisualViewport() && isSoftKeyboardTarget(event.target)) {
      iosRootResetBudget = 3;
      iosKeyboardClosing = false;
      applyMobileViewportMetrics();
    }
    if (event.target === mobileChatAutofocusTarget) {
      event.target.blur();
      return;
    }
    if (isMobileLayout() && isSoftKeyboardTarget(event.target)) {
      if (!virtualKeyboardOverlayActive) ensureAndroidKeyboardPanAnchor(true);
      /* TT 的部分 WebView 会在 focusin 后立刻缩 layout viewport。先在同一任务里
         单独锁住编辑弹窗高度；它不再依赖之后可能已经变矮的 visualViewport。 */
      const root = hostDocument.documentElement;
      const current = parseFloat(root.style.getPropertyValue(MOBILE_POPUP_HEIGHT_PROPERTY)) || 0;
      const height = Math.max(
        1,
        current,
        Math.round(hostWindow.innerHeight || hostDocument.documentElement.clientHeight || 1),
        Math.round(hostWindow.visualViewport?.height || 0),
      );
      root.style.setProperty(MOBILE_POPUP_HEIGHT_PROPERTY, `${height}px`);
      scheduleMobileViewportSettle();
    }
    if (event.target?.id !== 'send_textarea') return;
    /* 聚焦输入框本身就是「人在」的信号，得跟敲键盘一样刷新打盹计时——
       不然 syncCcComposerState 只是切了一个视觉用的 class，用户光盯着
       输入框想措辞、没按键，一分钟计时器照样把 Clawd 睡倒在人眼皮底下。 */
    noteActivity();
    if (isMobileLayout()) {
      /* focusin 通常早于系统键盘真正缩放视口；在这里锁定关闭键盘后应回到的底边。 */
      mobileStableLayoutHeight = Math.max(
        mobileStableLayoutHeight,
        Math.round(hostWindow.innerHeight || hostDocument.documentElement.clientHeight || 1),
      );
      mobileKeyboardRecoveryActive = false;
    }
    scheduleMobileViewportSettle();
    startMobileKeyboardPoll();
    syncCcComposerState(true);
    /* 手机上聚焦输入框时不要触碰历史消息里的 Clawd 按钮。旧逻辑会给每一层
       按钮改 class，并逐个读取 offsetWidth 强制同步排版；重角色卡/长聊天因此
       正好在键盘弹出的关键帧冻结数秒。键盘避让不依赖这段装饰动画。 */
  };
  const handleFocusOut = event => {
    if (usesIOSVisualViewport() && isSoftKeyboardTarget(event.target)) {
      iosRootResetBudget = 1;
      iosKeyboardClosing = !isSoftKeyboardTarget(event.relatedTarget);
      applyMobileViewportMetrics();
    }
    if (event.target === mobileChatAutofocusTarget) return;
    if (isMobileLayout() && isSoftKeyboardTarget(event.target)) scheduleMobileViewportSettle();
    if (event.target?.id !== 'send_textarea') return;
    /* 不等下一帧：WebView 随后若开始重排长聊天，rAF/定时器都会被主线程堵住。
       在 focusout 的同一任务内先把旧键盘偏移清零，避免输入框沿用抬高位置。 */
    scheduleMobileViewportSettle();
    syncCcComposerState(false);
    if (isMobileLayout()) {
      /* schedule 先打开恢复窗口，reset 再同步计算正向高度补偿；顺序不能反。
         用户停留在输入框超过 840ms 时，反过来会把矮视口误记成新的稳定高度。 */
      mobileKeyboardRecoveryActive = !virtualKeyboardOverlayActive && !keyboardBaselineMode;
      stopMobileKeyboardPoll();
      resetMobileComposerTranslate();
      return;
    }
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
    const box = hostDocument.querySelector("#send_textarea");
    if (!box) return;
    if (active) {
      const hwPhrase = halloween?.enabled === true;
      if (box.dataset.ccPh === void 0 || hwPhrase !== (box.dataset.cwHalloweenPhrase === "on")) {
        if(box.dataset.ccPh === void 0)box.dataset.ccPh = box.getAttribute("placeholder") ?? "";
        const phrase = hwPhrase ? {cn:"熬魔药…",en:"brewing a potion…"} : ccPickPhrase();
        if(hwPhrase)box.dataset.cwHalloweenPhrase = "on"; else delete box.dataset.cwHalloweenPhrase;
        box.setAttribute("placeholder", ccPrefersChinese() ? "Clawd 正在" + phrase.cn : "Clawd is " + phrase.en);
      }
      return;
    }
    if (box.dataset.ccPh !== void 0) {
      box.setAttribute("placeholder", box.dataset.ccPh);
      delete box.dataset.ccPh;
      delete box.dataset.cwHalloweenPhrase;
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

    /* 2.0.250（Lulu：生成中点停止，会再重 Roll 一次）：swipe.to 会等这次生成结束。中途停止后酒馆可能把没写完的新回复撤掉、
       swipe_id 退回原样，下面的「没变化 → 点原生 →」兜底就又在最后一条上点了一次 → = 再生成一次。
       只要这次调用里真的开始过生成（被停掉也算），就当处理完了，不兜底。 */
    const startSeqBefore = generationStartSeq;
    const generationRan = () => generationStartSeq !== startSeqBefore;
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
      if (swipeChanged || generationRan()) return true;
      console.warn('[Claude Clawd] Swipe API returned without changing swipe_id; falling back to the native control.');
      return fallbackToNativeControl();
    } catch (error) {
      if (generationRan()) return true;
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
    button.style.touchAction = 'pan-y';
    let pointerStart = null;
    let dragged = false;
    button.addEventListener('pointerdown', event => {
      pointerStart = { x: event.clientX, y: event.clientY };
      dragged = false;
    });
    button.addEventListener('pointermove', event => {
      if (!pointerStart) return;
      if (Math.abs(event.clientX - pointerStart.x) > 8
        || Math.abs(event.clientY - pointerStart.y) > 8) dragged = true;
    });
    button.addEventListener('pointercancel', () => {
      pointerStart = null;
      dragged = true;
    });
    button.addEventListener('click', async event => {
      event.preventDefault();
      event.stopPropagation();
      const blockedByScroll = isMobileLayout()
        && (dragged || Date.now() - lastManualScrollAt < 350);
      pointerStart = null;
      dragged = false;
      if (blockedByScroll) return;
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

  /* 11-26 旧版界面（神秘滑铲男：手机上回复两侧的切换箭头太大、关不掉）：旧版操作栏原来只有 ⋯ ✎ ↻，两侧箭头是唯一的
     切换入口，所以「回复两侧的左右切换箭头」开关以前只在新版生效。现在旧版在最新回复的操作栏最前面放一组 ‹ n/m ›，
     开关关掉时才显示（CSS），点了转给两侧按钮（它们还在，只是不显示）；开关开着时和以前一样。
     新版的操作栏有 official-layout.js 建的 .cw-v4-swipes，这里不建。 */
  function syncClassicBarSwipes(message, leftProxy, rightProxy, data) {
    const bar = message.querySelector('.mes_buttons');
    let group = bar?.querySelector(`:scope > .${CLASSIC_BAR_SWIPES_CLASS}`);
    if (!bar || hostDocument.documentElement.dataset.claudeUi !== 'classic') {
      group?.remove();
      return;
    }
    if (!group) {
      group = hostDocument.createElement('div');
      group.className = CLASSIC_BAR_SWIPES_CLASS;
      for (const [direction, label] of [['left', '上一条回复'], ['right', '下一条回复（到末端重新生成）']]) {
        const arrow = hostDocument.createElement('button');
        arrow.type = 'button';
        arrow.className = `${CLASSIC_BAR_SWIPES_CLASS}-${direction}`;
        arrow.setAttribute('aria-label', label);
        arrow.title = label;
        arrow.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
          message.querySelector(`:scope > .${direction === 'left' ? LEFT_SWIPE_PROXY_CLASS : SWIPE_PROXY_CLASS}`)?.click();
        });
        group.append(arrow);
        if (direction === 'left') group.append(hostDocument.createElement('span'));
      }
      bar.prepend(group);
    }
    const total = Array.isArray(data?.swipes) ? data.swipes.length : 0;
    const text = total
      ? `${Math.min(total, Math.max(1, Number(data.swipe_id ?? 0) + 1))}/${total}`
      : (message.querySelector('.swipes-counter')?.textContent || '1/1').replace(/[\u200b\s]/g, '');
    const count = group.querySelector(':scope > span');
    if (count.textContent !== text) count.textContent = text;
    const [left, right] = group.querySelectorAll(':scope > button');
    if (left.disabled !== leftProxy.disabled) left.disabled = leftProxy.disabled;
    if (right.disabled !== rightProxy.disabled) right.disabled = rightProxy.disabled;
  }

  function refreshSwipeProxies(messages, typingActive) {
    const liveMessages = new Set(messages);
    hostDocument.querySelectorAll(`.${LEFT_SWIPE_PROXY_CLASS}, .${SWIPE_PROXY_CLASS}`).forEach(button => {
      if (!liveMessages.has(button.parentElement)) button.remove();
    });
    hostDocument.querySelectorAll(`.${CLASSIC_BAR_SWIPES_CLASS}`).forEach(group => {
      if (!liveMessages.has(group.closest('#chat > .mes'))) group.remove();
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
        message.querySelector(`.mes_buttons > .${CLASSIC_BAR_SWIPES_CLASS}`)?.remove();
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
      syncClassicBarSwipes(message, nextLeftProxy, nextRightProxy, data);
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

  /* Structural changes can occur anywhere, but high-frequency class/style
     changes outside #chat must never enter the attribute observer. Filtering
     after delivery is too late for panels that write position styles more than
     one thousand times per second. */
  const BODY_OBSERVER_INIT = {
    subtree: true,
    childList: true,
  };
  const ROOT_ATTRIBUTE_OBSERVER_INIT = {
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ['class', 'style'],
  };
  const CHAT_ATTRIBUTE_OBSERVER_INIT = {
    ...ROOT_ATTRIBUTE_OBSERVER_INIT,
    subtree: true,
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
    TAURITAVERN_HOST_CLASS,
    'clawd-welcome',
    'clawd-has-recents',
    'clawd-wobble-sway',
    'clawd-wobble-tilt',
    'clawd-typing-enter',
    'clawd-typing-ready',
    'clawd-typing-native-suppressed',
    'clawd-typing-click',
    'clawd-typing-press',
  ]);

  const OWNED_MUTATION_SELECTOR = [
    "[data-cw-halloween-owned]",
    `button.${BUTTON_CLASS}`,
    `button.${LEFT_SWIPE_PROXY_CLASS}`,
    `button.${SWIPE_PROXY_CLASS}`,
    `.${CLASSIC_BAR_SWIPES_CLASS}`,
    `button.${REROLL_CLASS}`,
    `.${USER_ACTIONS_CLASS}`,
    '.clawd-typing-hit',
    '.clawd-typing-exit-ghost',
    '.clawd-mobile-chrome',
    '.clawd-mobile-scrim',
    '.clawd-mobile-new-chat',
    '.clawd-android-keyboard-pan-anchor',
    '.clawd-character-menu',
    '.clawd-character-switcher',
    '.clawd-rail-brand',
    '.clawd-rail-label',
    '.clawd-rail-grip',
    '.clawd-welcome-hero',
    '.clawd-welcome-shortcuts',
    `.${SURFACE_BACKING_CLASS}`,
    /* 生成计时器是扩展自己创建、自己每 100ms 改一次文本的元素，
       但它一直漏在这份"我的元素"名单外面。后果：每跳一秒，它自己写出来的
       childList 记录都被当成"酒馆那边的外部改动"，换来一整轮全量刷新。
       真机实测 426 秒里，.clawd-gen-timer 产生 1440 条记录，是所有记录里
       最多的一类；同期全量刷新 836 次、平均 64.7ms，refreshClawd 独占
       31.5 秒主线程，等于掉帧总量的四成。生成中计时器一直在跳，所以表现
       就是"AI 回复时一顿一顿"，而且从 2.0.17 加进这个计时器那版开始出现。
       3.0 那条源码线上这个元素已经改叫 clawd-stream-timer 并进了名单，
       2.0 这条线漏掉了，补上。 */
    '.clawd-gen-timer',
    '.clr-ghost-host',
  ].join(',');

  function classMutationIsCosmetic(record, target) {
    if (record.attributeName !== 'class') return false;
    const before = new Set(String(record.oldValue || '').split(/\s+/).filter(Boolean));
    const after = new Set(String(target.getAttribute('class') || '').split(/\s+/).filter(Boolean));
    const changed = new Set([...before, ...after].filter(name => before.has(name) !== after.has(name)));
    /* Bug 7 真根因：欢迎消息头像那条 (#chat > .mes.claude-welcome-clawd-assistant)
       每次 refreshClawdInner() 都会被重新写一次 class 属性——不是用
       classList.add/toggle（值不变时浏览器会自己判定 no-op、根本不产生
       MutationObserver 记录），而是某处整串重新赋值，哪怕新值和旧值
       完全相同也照样触发一条 class 属性变更记录。
       这种"值没变但属性被重写"的记录，before/after 集合完全一样，
       changed.size 是 0。改之前的逻辑在 changed.size === 0 时直接判定
       "不算 cosmetic"（因为 `changed.size > 0 && ...` 这个前提不成立），
       于是 mutationNeedsFullRefresh 把这种真正意义上"什么都没变"的记录
       当成"需要整轮刷新"处理——refresh 又把这同一个元素的 class 原样重写
       一遍，自己生成的记录又被判定成"需要刷新"，刷新完再重写……在真机上
       实测是持续 ~15 次/秒的自循环，占了 8%+ 的 CPU，跟用户是否在操作
       抽屉动画完全无关，是这套刷新过滤逻辑本身的一个洞。
       语义上很清楚：class 属性被重新赋值但实际包含的 token 集合一个都
       没变，就是彻头彻尾的空写，任何情况下都不该触发刷新——不需要判断
       改动的是不是"认识的装饰类"，压根没有改动。 */
    if (changed.size === 0) return true;
    return [...changed].every(name => (
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
      if ((record.type === 'childList' && record.target === scrollHost && [...record.addedNodes, ...record.removedNodes].some(n => n.nodeType === 1 && n.matches?.('.mes')))
        || (record.type === 'attributes' && record.attributeName === 'mesid')) clawdReadingGate.reset();
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

  function externalStyleMutationIsIrrelevant(record, target) {
    return record.type === 'attributes'
      && record.attributeName === 'style'
      && !target.closest('#chat');
  }

  function restoreExternalThemeStyle() {
    if (!suspendedThemeStyle) return;
    if (suspendedThemeMedia == null) suspendedThemeStyle.removeAttribute('media');
    else suspendedThemeStyle.setAttribute('media', suspendedThemeMedia);
    suspendedThemeStyle = null;
    suspendedThemeMedia = null;
    delete hostDocument.documentElement.dataset.claudeExternalSurface;
  }

  let watchedExternalManager=null,externalManagerWatch=null;
  function watchExternalManager(manager){if(watchedExternalManager===manager)return;externalManagerWatch?.disconnect();watchedExternalManager=manager;externalManagerWatch=manager?new hostWindow.MutationObserver(scheduleExternalSurfaceIsolation):null;externalManagerWatch?.observe(manager,{attributes:true,attributeFilter:['style','class','hidden']});}
  function syncExternalSurfaceIsolation() {
    const manager = hostDocument.querySelector(CHARACTER_MANAGER_SELECTOR);
    watchExternalManager(manager);
    const visible = manager && !manager.hidden && (() => {
      const style = hostWindow.getComputedStyle(manager);
      return style.display !== 'none' && style.visibility !== 'hidden';
    })();
    if (!visible) {
      restoreExternalThemeStyle();
      return;
    }
    const style = hostDocument.getElementById(THEME_LIVE_STYLE_ID);
    if (!style) return;
    if (suspendedThemeStyle && suspendedThemeStyle !== style) restoreExternalThemeStyle();
    if (!suspendedThemeStyle) {
      suspendedThemeStyle = style;
      suspendedThemeMedia = style.getAttribute('media');
    }
    style.setAttribute('media', 'not all');
    hostDocument.documentElement.dataset.claudeExternalSurface = 'character-manager';
  }

  const extraExternalModalCandidates = new Set();
  const externalModalSources = new Map();
  const externalNotificationSelector = '#toast-container,[class^="toast"],[class*=" toast"],[role="status"],[role="alert"]';
  function externalModalHost(element) {
    if (!(element instanceof hostWindow.HTMLElement) || element.closest('dialog,[data-cw-lifted],.cw-v4-shell,.cw-pm-host,#top-settings-holder,#sheld')) return null;
    if (element.closest(externalNotificationSelector)) return null;
    if (element.matches('#bg1,#bg_custom,#bg_animation,#top-bar,[class*="clawd-"],[class*="cw-"]')) return null;
    const semantic = element.matches('[role="dialog"],[aria-modal="true"]');
    // Some extensions put the modal role inside a positioned Teleport wrapper.
    for (let node = element; node && node !== hostDocument.body; node = node.parentElement) {
      const position = hostWindow.getComputedStyle(node).position;
      if (position === 'fixed' || (semantic && position === 'absolute')) return node;
    }
    return null;
  }
  function observeExternalModalCandidates() {
    if (!externalModalObserver) return [];
    externalModalSources.clear();
    for (const candidate of extraExternalModalCandidates) if (!candidate.isConnected) extraExternalModalCandidates.delete(candidate);
    const sources = [...hostDocument.querySelectorAll(EXTERNAL_MODAL_SELECTOR), ...extraExternalModalCandidates];
    const candidates = new Set();
    for (const source of sources) {
      const host = externalModalHost(source);
      if (!host) continue;
      candidates.add(host);
      if (!externalModalSources.has(host)) externalModalSources.set(host, []);
      externalModalSources.get(host).push(source);
      // Visibility may be controlled by a Teleport wrapper, not the role node.
      for (let node = source; node && node !== hostDocument.body; node = node.parentElement) externalModalObserver.observe(node, {
        attributes: true, attributeOldValue: true, attributeFilter: ['class', 'style', 'hidden', 'open'],
      });
    }
    return [...candidates];
  }

  function isVisibleExternalModal(element) {
    if (!(element instanceof hostWindow.HTMLElement)) return false;
    // Our settings frame shares the native drawer layer; it is not an external modal.
    if (element.id === 'cw-v4-settings') return false;
    /* 2.0.211：showModal() 打开的 <dialog> 在顶层，本来就盖在所有东西上面，不用把侧栏降下去。
       手机上酒馆的宽 / 大弹窗改成铺满的弹出页后会被当成「外部全屏弹窗」，侧栏容器降到 1，
       连带里面打开的设置页沉到聊天页下面——弹窗收起时露出欢迎页，再跳回设置页。 */
    try { if (element.matches('dialog:modal')) return false; } catch {}
    /* 2.0.218：手机弹出页改用 show() + showPopover() 进最上层（不是 :modal），也不算。 */
    try { if (element.matches(':popover-open,[data-cw-lifted]')) return false; } catch {}
    const rail = hostDocument.querySelector('#top-settings-holder');
    if (rail && (rail === element || rail.contains(element) || element.contains(rail))) return false;
    const style = hostWindow.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || style.pointerEvents === 'none' || Number(style.opacity) === 0) return false;
    if (!['fixed', 'absolute'].includes(style.position)) return false;
    if (element.checkVisibility && !element.checkVisibility({checkOpacity:true, checkVisibilityCSS:true})) return false;
    const rect = element.getBoundingClientRect();
    const width = hostWindow.innerWidth, height = hostWindow.innerHeight;
    const visibleWidth = Math.max(0, Math.min(rect.right, width) - Math.max(rect.left, 0));
    const visibleHeight = Math.max(0, Math.min(rect.bottom, height) - Math.max(rect.top, 0));
    if (!visibleWidth || !visibleHeight) return false;
    // A small dialog is valid when explicitly marked; a bare fixed float is not.
    const semantic = (externalModalSources.get(element) || []).some(source => {
      if (!source.matches(EXTERNAL_MODAL_SELECTOR) || source.closest(externalNotificationSelector)) return false;
      const css = hostWindow.getComputedStyle(source), box = source.getBoundingClientRect();
      return css.display !== 'none' && css.visibility !== 'hidden' && css.pointerEvents !== 'none'
        && Number(css.opacity) !== 0 && box.width > 0 && box.height > 0
        && (!source.checkVisibility || source.checkVisibility({checkOpacity:true, checkVisibilityCSS:true}));
    });
    // Host layout surfaces can cover the viewport without being an editor.
    // Unmarked fixed overlays must contain a control; explicit dialog/backdrop
    // semantics still allow read-only modals and their separate overlay layers.
    const interactive = element.matches('button,input,textarea,select,a[href],iframe,canvas,[role="button"],[tabindex],[contenteditable="true"]')
      || Boolean(element.querySelector('button,input,textarea,select,a[href],iframe,canvas,[role="button"],[tabindex],[contenteditable="true"]'));
    return semantic || (interactive && style.position === 'fixed' && (visibleWidth * visibleHeight >= width * height * .5
      || (visibleWidth >= width * .7 && visibleHeight >= height * .7)));
  }

  /* 2.0.244（Lulu：选了 Kemini 预设，它的「首次使用配置」全屏窗口一出来，设置就沉到主页下面，透出主页、白底）：
     设置页（v4）装在 #top-settings-holder 里，把侧栏降到 1 就是把整个设置也降下去。2.0.246 起任何时候都不降侧栏，
     改成把比侧栏 / 设置低的外部全屏窗口抬到 4100（窗口关掉时还原）。 */
  const liftedExternalModals = new Map();
  function liftExternalModals(modals) {
    for (const modal of modals) {
      if (liftedExternalModals.has(modal)) continue;
      const z = Number.parseInt(hostWindow.getComputedStyle(modal).zIndex, 10);
      if (Number.isFinite(z) && z >= 4100) continue;
      liftedExternalModals.set(modal, { value: modal.style.getPropertyValue('z-index'), priority: modal.style.getPropertyPriority('z-index') });
      modal.style.setProperty('z-index', '4100', 'important');
    }
    for (const [modal, state] of liftedExternalModals) {
      if (modals.includes(modal)) continue;
      liftedExternalModals.delete(modal);
      if (state.value) modal.style.setProperty('z-index', state.value, state.priority);
      else modal.style.removeProperty('z-index');
    }
  }

  function syncExternalModalRailLayer() {
    const modals = observeExternalModalCandidates().filter(isVisibleExternalModal);
    const modalOpen = modals.length > 0;
    setBodyClass(EXTERNAL_MODAL_OPEN_CLASS, modalOpen);
    /* 2.0.246（Lulu：欢迎页弹出 Kemini 的配置窗口时，整个侧栏不见了）：原来把 #top-settings-holder / #top-bar 降到 1
       让外部弹窗能点到，可侧栏就沉到欢迎页下面看不见了（设置开着时连设置也沉下去，2.0.244）。
       现在一律不降侧栏，只把比侧栏低的外部全屏窗口抬到 4100（liftExternalModals），关掉时还原。 */
    restoreExternalModalRailLayer();
    liftExternalModals(modalOpen ? modals : []);
    hostWindow.__claudeOfficialLayout?.setExternalModals(modals);
  }
  function onExternalModalAnimationEnd(event) {
    if (externalModalHost(event.target)) scheduleExternalSurfaceIsolation();
  }

  function restoreExternalModalRailLayer() {
    const states = externalModalRailState;
    externalModalRailState = [];
    for (const state of states) {
      if (!state?.element) continue;
      if (state.value) state.element.style.setProperty('z-index', state.value, state.priority);
      else state.element.style.removeProperty('z-index');
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

    /* 提示词管理器的条目列表：87 个 li 躺在一个「关着的」左侧设置抽屉里
       (#completion_prompt_manager → #openai_settings → #left-nav-panel)，
       每次组装 prompt 都会被整体重写一遍 class。它跟聊天界面长什么样毫无关系，
       这个扩展也从不给它套样式，但每条记录都换来一轮全量刷新。
       真机实测：生成期间它产生 1566 条记录，是全场最多的一类，比第二名还多 57%。
       整个 #completion_prompt_manager 子树直接不参与刷新判断。 */
    if (target.closest('#completion_prompt_manager')) return false;
    if (insideClosedDrawer(record)) return false;
    if (target.closest(CHARACTER_MANAGER_SELECTOR)) return false;

    /* Third-party floating panels update inline position styles on every pointer
       move. Outside #chat those writes cannot affect message decoration, so do
       not trade a compositor-only drag for another whole-chat refresh. */
    if (externalStyleMutationIsIrrelevant(record, target)) {
      refreshStats.externalStyleRecordsIgnored += 1;
      return false;
    }

    if (target.matches(OWNED_MUTATION_SELECTOR) || target.closest(OWNED_MUTATION_SELECTOR)) return false;
    if (record.type === 'attributes' && classMutationIsCosmetic(record, target)) return false;

    if (record.type === 'childList') {
      const nodes = [...record.addedNodes, ...record.removedNodes];
      if (!target.closest('#chat') && nodes.length && nodes.every(node => node.nodeType === 3)) return false;
      if (isThirdPartyInterior(target)) return false;
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

  function ensureChatAttributeObserver() {
    if (!chatAttributeObserver) return;
    const chat = hostDocument.querySelector('#chat');
    if (chat === observedAttributeChat) return;
    chatAttributeObserver.disconnect();
    observedAttributeChat = chat;
    chatAttributeObserver.observe(hostDocument.documentElement, ROOT_ATTRIBUTE_OBSERVER_INIT);
    chatAttributeObserver.observe(hostDocument.body, {...ROOT_ATTRIBUTE_OBSERVER_INIT, attributeFilter: ['class', 'style', 'data-generating']});
    const stop = hostDocument.getElementById('mes_stop');
    if (stop) chatAttributeObserver.observe(stop, ROOT_ATTRIBUTE_OBSERVER_INIT);
    if (chat) chatAttributeObserver.observe(chat, CHAT_ATTRIBUTE_OBSERVER_INIT);
  }

  let externalSurfaceIsolationRaf = 0;

  function scheduleExternalSurfaceIsolation() {
    if (destroyed || externalSurfaceIsolationRaf) return;
    externalSurfaceIsolationRaf = hostWindow.requestAnimationFrame(() => {
      externalSurfaceIsolationRaf = 0;
      if (!destroyed) {
        syncExternalSurfaceIsolation();
        syncExternalModalRailLayer();
      }
    });
  }

  /* 2.0.225（Lulu：三只 Clawd 点起来卡卡的）：那一堆自己每 1.1 秒加删一个 Z、点巫师加删闪光。这些增删也进了这里，
     每次都触发下面「有没有外部全屏弹窗」的整页 querySelectorAll（实测点巫师一次约 96ms）。它们只在那一堆里面，直接滤掉。 */
  const inClawdPile = record => { const t = record.target; return !!(t?.nodeType === 1 ? t : t?.parentElement)?.closest?.('.clawd-pile'); };
  /* 打开旧聊天性能修复（20261001 根部减法对照）：打开旧聊天后，原生会在关着的设置抽屉里重建表情列表、Quick Reply、
     酒馆助手面板和提示词管理器，并给各抽屉扫一遍 tabindex。抽屉关着时这些节点看不见，
     这里也不读它们；以前每批变动都换来一轮外部浮层检查和全量刷新，手机上打开旧聊天后
     主线程被这些后续工作占到 2.5 秒（关掉 CW 时约 0.2 秒）。
     只跳过「关着的抽屉里面」的变动：抽屉自己开合的 class 变化仍照常触发刷新。 */
  function insideClosedDrawer(record) {
    const node = record.target?.nodeType === 1 ? record.target : record.target?.parentElement;
    const drawer = node?.closest?.('.closedDrawer');
    return !!drawer && drawer !== node;
  }

  // Formal 2.0.151: changes inside a third-party floating widget under <body> (智绘姬 and similar) neither
  // open an external modal nor affect CW's decorated surfaces; do not rescan or refresh for them.
  const HOST_TOP_LEVEL_SELECTOR='#sheld,#top-settings-holder,#top-bar,#movingDivs,#bg1,#bg_custom,#bg_animation,#character_popup,#preloader,#extensionsMenu,#options,#export_format_popup,#dialogue_popup,dialog,.popup,.drawer-content,.clawd-mobile-chrome,.cw-v4-shell,.cw-pm-host,[id^="claude-"],[class*="cw-"],[class*="clawd-"]';
  function isThirdPartyInterior(target){
    let top=target;while(top.parentElement&&top.parentElement!==hostDocument.body)top=top.parentElement;
    return top.parentElement===hostDocument.body&&target!==top&&!top.matches(HOST_TOP_LEVEL_SELECTOR)&&!nodeBelongsToClawd(top);
  }
  function mutationTouchesExternalModal(record){
    if(record.type!=='childList'||insideClosedDrawer(record))return false;
    for(const node of [...record.addedNodes,...record.removedNodes]){
      if(!(node instanceof hostWindow.Element))continue;
      if(node.matches(EXTERNAL_MODAL_SELECTOR)||node.querySelector(EXTERNAL_MODAL_SELECTOR)||extraExternalModalCandidates.has(node))return true;
      for(const registered of externalModalSources.keys())if(node===registered||node.contains(registered))return true;
      for(const registered of extraExternalModalCandidates)if(node.contains(registered))return true;
    }
    return false;
  }

  function handleObservedMutations(records) {
    syncNativeGeneration();
    if (hostDocument.documentElement.hasAttribute('data-cw-sheet') || hostDocument.querySelector('dialog.cw-v4-editor[open]')) for (const record of records) {
      if (record.type === 'childList' && record.target === hostDocument.body) for (const node of record.addedNodes) {
        if (node instanceof hostWindow.HTMLElement) extraExternalModalCandidates.add(node);
      }
    }
    if (records.some(inClawdPile)) { records = records.filter(r => !inClawdPile(r)); if (!records.length) return; }
    /* Character Manager 的可见性只需每帧检查一次。TT 一批 DOM 变动里可能送来
       数百条记录，旧代码会为每批同步 querySelector + getComputedStyle。
       2.0.161：只在有元素增删时检查。候选弹窗自身的 class / style / open 变化由
       externalModalObserver 负责；纯属性变动（Clawd 动作、body 状态类）不会让弹窗出现或消失，
       以前每批都要强制一次样式和布局，点输入框弹键盘时就是这里在抢主线程。 */
    if (records.some(mutationTouchesExternalModal)) scheduleExternalSurfaceIsolation();
    refreshStats.recordsSeen += records.length;
    trackDirtyMessages(records);
    ensureChatAttributeObserver();
    preserveStreamingReasoning(isTypingActive());
    /* Prompt Manager 的海量变动仍不进入全量聊天刷新；但 TT 会在打开面板时
       重新生成列表，而且省略 drag-handle 节点。这里单独跑一次 O(当前行数)
       的缺口修补，已有手柄立即跳过，不触发布局测量。 */
    if (records.some(record => {
      const target = record.target instanceof hostWindow.Element
        ? record.target
        : record.target?.parentElement;
      return target?.closest?.('#completion_prompt_manager_list');
    })) refreshPromptManagerDragHandles();
    if (!records.some(mutationNeedsFullRefresh)) return;
    refreshStats.recordsPassedFilter += records.length;
    if (refreshing) { dirtyWhileRefreshing = true; return; }
    scheduleRefresh();
  }

  let refreshing = false;
  let dirtyWhileRefreshing = false;

  /* 只负责清扫：把 2.0.85 及更早版本留在页面上的背板节点摘掉。
     不再注入任何新的背板 —— 外壳的不透明由 compat-*.css 里真实的 background 负责。
     3.2「抽屉面板底部透明」就是背板 position:absolute 装在滚动容器里的产物，
     背板拆掉之后那条自然消失。 */
  function refreshCompatibilitySurfaceBackings() {
    const staleHosts = hostDocument.querySelectorAll(`.${SURFACE_HOST_CLASS}`);
    if (!staleHosts.length) return;
    staleHosts.forEach(host => {
      host.classList.remove(SURFACE_HOST_CLASS);
      host.querySelector(`:scope > .${SURFACE_BACKING_CLASS}`)?.remove();
    });
  }

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
    externalStyleRecordsIgnored: 0,
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
      const pending = [
        ...(observer?.takeRecords?.() ?? []),
        ...(chatAttributeObserver?.takeRecords?.() ?? []),
      ];
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
    halloween?.sync();
    frameId = 0;
    lastRefreshAt = Date.now();
    if (destroyed) return;
    syncClawdRuntime();
    watchGenerationEvents();
    syncNativeGeneration();
    setBodyClass(READY_CLASS, true);
    const typingActive = isTypingActive();
    const continuingGeneration = previousTypingActive && typingActive;
    const generationJustEnded = previousTypingActive && !typingActive;
    if (!generationSubscriptions.length) generationEventActive = typingActive;
    if (!previousTypingActive && typingActive) {
      typingRunId += 1;
      if (!clawdTracks.A) beginClawdGeneration();
    }
    if (generationJustEnded) {
      settleClawdGeneration('done');
    }
    previousTypingActive = typingActive;
    setBodyClass(GENERATING_CLASS, typingActive);
    ensureComposerClawd();
    if (composerClawd()) {
      clawdRhythm ??= installClawdRhythm({
        doc: hostDocument, win: hostWindow, button: composerClawd,
        enabled: clawdEnabled, reducedMotion: clawdPrefersReducedMotion,
      });
      clawdRhythm.sync();
    }
    refreshCompatibilitySurfaceBackings();
    /* A1：typing indicator 只保留酒馆自己的生成提示，不再承载第二只 Clawd。 */
    if (mobileViewportMetricsDirty) applyMobileViewportMetrics();
    refreshMobileComposerInset();
    if (!frameworkCompatibilityMode) preserveStreamingReasoning(typingActive);
    if (continuingGeneration) {
      refreshComposerPhrase(true);
      return;
    }
    refreshComposerPhrase(typingActive);
    /* 框架兼容模式不能装饰消息 DOM。外部美化常用 .mes/.mes_block/.mes_text
       的定位和伪元素拼整张卡片；插入落款、操作键或 reasoning class 会把
       坐标系拆开。欢迎态本身仍归 Claude Web，所以只读取现有消息来判断
       welcome/chat，不调用会给消息加 class 的 refreshMessageStates()。 */
    if (frameworkCompatibilityMode) {
      /* 兼容模式不装饰消息 DOM；只保留输入框大 Clawd。 */
      removeStaleButtons();
      const welcomeMessages = [...hostDocument.querySelectorAll('#chat > .mes[is_user="false"]')];
      refreshWelcomeMode(welcomeMessages);
      refreshCompatibilitySurfaceBackings();
      if (generationJustEnded) {
        recentSignature = null;
        refreshRailRecents({ force: true });
      }
      refreshRailBrand();
      refreshPcTopActions();
      refreshRailLabels();
      watchChatDeleted();
      chatTools?.sync();
    refreshRailRecents();
      refreshWelcomeShortcuts();
      refreshCharacterSwitcher();
      /* 2.0.101：这两行以前只写在下面的完整模式路径里，被上面那个 return 挡住。
         2.0.98 之前兼容模式只在桌面成立（CLAUDE_COMPAT_MODE 里带着 layout==='pc'），
         这条分支不用管手机；2.0.99 让手机进了兼容模式，却只改了 CLAUDE_FEATURES，
         没回头补这里。结果是兼容样式表照着「手机外壳归框架」把顶栏清空、抽屉滑出
         屏幕，而开抽屉的汉堡从来没被建出来 —— 整个界面没有任何导航入口。
         两个函数自带 mobileEnabled / narrow 守卫，桌面兼容模式下会自己返回。 */
      refreshMobileChrome();
      refreshMobileNewChat();
      refreshRailUser();
      refreshRailGrip();
      return;
    }
    refreshEmbeddedSurfaces();
    refreshWelcomeAssistants();
    refreshCodeBars();
    collapseReasoning();
    expandReasoningWhileEditing();
    /* 先确定 welcome/chat，再移动快捷按钮和刷新输入框控件。
       旧顺序会让退出对话后的第一帧仍按聊天态摆放输入框，随后才补 hero，
       页面就会出现“标题消失、输入框沉底”或整体跳位。 */
    const messages = refreshMessageStates(typingActive);
    if (generationJustEnded) {
      /* 生成期间 trackSwipeArrows 是整个跳过的（见那里的注释），
         这里补排一次，让翻页箭头在回复落地的同一轮里归位。 */
      if (!isMobileLayout()) scheduleSwipeTrack();
      /* 侧栏近期对话只订阅了「切换对话」和「删除对话」两个事件，唯独漏了
         「在当前对话里发了新消息」—— 而这恰恰是最常发生的一件事。
         后果：在同一个对话里聊多久，左边那条记录的时间戳都不会动，
         列表顺序也不会重排，只能干等 60 秒 TTL 碰巧被某轮全量刷新撞上。
         用户实测就是「发了条消息，侧栏完全没反应」。
         一次生成结束 = 一次完整往返，在这里补一刀最准，也不会过度拉取。
         指纹要一起作废，否则重拉回来的内容会被「和上次一样」判定跳过。 */
      recentSignature = null;
      refreshRailRecents({ force: true });
    }
    // 这一轮该读的都读完了，脏标记清空；下一批 mutation 记录会重新标记
    dirtyMessages.clear();
    refreshWelcomeMode(messages);
    refreshRailBrand();
    refreshPcTopActions();
    refreshRailLabels();
    watchChatDeleted();   // 上下文晚于脚本就绪，所以每轮试一次，接上就不再重复
    watchUserSend();
    refreshRailRecents();
    refreshWelcomeShortcuts();
    refreshCharacterSwitcher();
    refreshMobileChrome();
    refreshMobileNewChat();
    refreshRailUser();
    refreshRailGrip();
    refreshIdleSleep();
    refreshPromptManagerDragHandles();
    refreshUserActions();
    refreshSwipeProxies(messages, typingActive);
    trackSwipeArrows();
    const message = messages.slice().reverse().find(candidate => !isWelcomeSurfaceMessage(candidate)) ?? null;
    refreshReroll(message, typingActive);
    /* A1：消息末尾不再创建 Clawd，整个角色都在 #send_form 上方那只 composer 实例上，这里只清场。 */
    removeStaleButtons();
    renderClawdTracks();
    if (generationJustEnded) streamFollow?.afterDecoration();
  }

  let lastRefreshAt = 0;
  let throttleTimer = 0;
  const REFRESH_MIN_GAP = 50;
  const MOBILE_REFRESH_MIN_GAP = 110;
  const MOBILE_GENERATION_REFRESH_MIN_GAP = 180;

  function scheduleRefresh() {

    if (destroyed || frameId || throttleTimer) return;
    const minGap = isMobileLayout()
      ? (previousTypingActive ? MOBILE_GENERATION_REFRESH_MIN_GAP : MOBILE_REFRESH_MIN_GAP)
      : REFRESH_MIN_GAP;
    const wait = minGap - (Date.now() - lastRefreshAt);
    if (wait > 0) {
      throttleTimer = hostWindow.setTimeout(() => {
        throttleTimer = 0;
        scheduleRefresh();
      }, wait);
      return;
    }
    if (hostDocument.hidden) {
      throttleTimer = hostWindow.setTimeout(() => {
        throttleTimer = 0;
        refreshClawd();
      }, minGap);
      return;
    }
    frameId = hostWindow.requestAnimationFrame(refreshClawd);
  }

  function recoverStalledFrame() {
    if (destroyed || hostDocument.hidden || !frameId) return;
    hostWindow.cancelAnimationFrame(frameId);
    frameId = 0;
    scheduleRefresh();
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
     在 document 的捕获阶段拦截，只让原生侧栏按钮的点击路径改状态。 */
  function blockDrawerAutoClose(event) {
    if (!railEnabled || isMobileLayout() || destroyed) return;
    if (!railToggleOf(event.target)) return;
    event.stopPropagation();
    drawerStats.blocked += 1;
  }

  /* Bug 4：角色卡 Advanced Definitions 弹窗里点 Prompt Overrides 的展开按钮，
     会连带把外层角色卡抽屉一起收回。

     根因和上面 blockDrawerAutoClose 是同一类问题：酒馆在更外层（html /
     document）绑了"点击处理不到内部折叠项的区域就当成点了外面，关掉当前
     开着的抽屉"这条自动关闭逻辑。Prompt Overrides 是酒馆原生的
     .inline-drawer，它本身只负责展开/收起自己，但它常被渲染在弹窗
     （.popup / .popup-content）里，而弹窗多半是挂在 body 下、不在角色卡
     抽屉的 DOM 子树里——于是点它在外层监听眼里就是"点了抽屉外面"，
     顺手把角色卡抽屉也关了。

     不改酒馆自己的 inline-drawer 折叠逻辑（原生代码，跟着升级会失效），
     只在 document 捕获阶段先一步拦截：只要这一下点在任意
     .inline-drawer-toggle / .inline-drawer-header 上，就不让事件继续往上
     冒泡到外层的"点击别处即关闭"监听器。内部折叠项该展开/收起还是正常
     展开/收起（原生逻辑在这层监听器执行完才轮到，不受影响），只是不再
     被误判成一次"点击外部"。 */
  function blockInlineDrawerAutoClose(event) {
    if (destroyed) return;
    if (!event.target?.closest?.('.inline-drawer-toggle, .inline-drawer-header')) return;
    event.stopPropagation();
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

  // Formal 2.0.139: a welcome message re-rendered as an ordinary message keeps its drawer
  // buttons, but ST prefixes their classes (custom-drawer-opener) and no longer handles them.
  function openWelcomeDrawer(event) {
    if (destroyed || event.button > 0) return;
    const button = event.target?.closest?.('#chat :is(.mes,.clawd-welcome-shortcuts) .custom-drawer-opener[data-target], #chat :is(.mes,.clawd-welcome-shortcuts) .drawer-opener[data-target]');
    if (!button) return;
    const mobileV4 = isMobileLayout() && hostDocument.documentElement.hasAttribute('data-cw-v4');
    if (!mobileV4 && !button.classList.contains('custom-drawer-opener')) return;
    const id = button.dataset.target;
    if (!['sys-settings-button', 'rightNavHolder', 'extensions-settings-button'].includes(id)) return;
    const drawer = hostDocument.getElementById(id);
    const panel = drawer?.querySelector(':scope > .drawer-content');
    const toggle = drawer?.querySelector(':scope > .drawer-toggle');
    if (!panel || !toggle || drawer.classList.contains('resizing')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (mobileV4) {
      const shell = hostDocument.querySelector('.cw-v4-shell');
      if (!panel.classList.contains('openDrawer') || !shell || shell.hidden || shell.dataset.panel !== panel.id) showPanelFromRail(panel);
    } else if (!panel.classList.contains('openDrawer')) toggle.click();
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

  function restoreAutoCompleteResizeGuard() {
    autoCompleteResizeGuardToken = null;
    const guard = autoCompleteResizeGuard;
    autoCompleteResizeGuard = null;
    try {
      guard?.restore?.();
    } catch (error) {
      hostWindow.console?.warn?.('[Claude-Clawd] AutoComplete resize guard restore failed.', error);
    }
    if (hostWindow[AUTOCOMPLETE_RESIZE_GUARD_KEY] === guard) {
      delete hostWindow[AUTOCOMPLETE_RESIZE_GUARD_KEY];
    }
  }

  async function installAutoCompleteResizeGuard() {
    if (!isMobileLayout() || !/Android/i.test(hostWindow.navigator?.userAgent || '')) return;

    const token = {};
    autoCompleteResizeGuardToken = token;
    const moduleUrl = resolveHostModule('scripts/autocomplete/AutoComplete.js');

    try {
      const previous = hostWindow[AUTOCOMPLETE_RESIZE_GUARD_KEY];
      previous?.restore?.();
      if (hostWindow[AUTOCOMPLETE_RESIZE_GUARD_KEY] === previous) {
        delete hostWindow[AUTOCOMPLETE_RESIZE_GUARD_KEY];
      }

      const module = await import(moduleUrl);
      if (destroyed || autoCompleteResizeGuardToken !== token) return;

      const AutoComplete = module?.AutoComplete;
      const prototype = AutoComplete?.prototype;
      if (!prototype || typeof prototype.getCursorPosition !== 'function') {
        throw new Error('Unsupported AutoComplete module shape.');
      }

      const descriptors = AUTOCOMPLETE_GUARDED_METHODS.map(name => ({
        name,
        descriptor: Object.getOwnPropertyDescriptor(prototype, name),
      }));
      if (descriptors.some(({ descriptor }) => typeof descriptor?.value !== 'function')) {
        throw new Error('Required AutoComplete positioning methods are unavailable.');
      }

      /* 新版 SillyTavern 如果已经在本体加了同等保护，不重复包一层。 */
      const updatePositionSource = Function.prototype.toString.call(
        descriptors.find(({ name }) => name === 'updatePosition').descriptor.value,
      );
      if (/if\s*\(\s*!this\.isActive\s*\)\s*return/.test(updatePositionSource)) {
        const state = {
          installed: false,
          reason: 'upstream-guard',
          moduleUrl,
          restore() {},
        };
        autoCompleteResizeGuard = state;
        hostWindow[AUTOCOMPLETE_RESIZE_GUARD_KEY] = state;
        return;
      }

      const records = [];
      try {
        for (const { name, descriptor } of descriptors) {
          const original = descriptor.value;
          const wrapped = function claudeClawdActiveAutoCompletePositionGuard(...args) {
            if (!this?.isActive) return undefined;
            return original.apply(this, args);
          };
          Object.defineProperty(prototype, name, { ...descriptor, value: wrapped });
          records.push({ name, descriptor, wrapped });
        }
      } catch (error) {
        for (const { name, descriptor, wrapped } of records.reverse()) {
          if (prototype[name] === wrapped) Object.defineProperty(prototype, name, descriptor);
        }
        throw error;
      }

      const state = {
        installed: true,
        reason: 'android-mobile-compat',
        moduleUrl,
        restore() {
          for (const { name, descriptor, wrapped } of records) {
            if (prototype[name] === wrapped) Object.defineProperty(prototype, name, descriptor);
          }
        },
      };
      autoCompleteResizeGuard = state;
      hostWindow[AUTOCOMPLETE_RESIZE_GUARD_KEY] = state;
      hostWindow.console?.info?.('[Claude-Clawd] AutoComplete resize guard installed.');
    } catch (error) {
      if (!destroyed && autoCompleteResizeGuardToken === token) {
        hostWindow.console?.warn?.('[Claude-Clawd] AutoComplete resize guard skipped.', error);
      }
    }
  }

  function start() {
    if (destroyed) return;
    void installAutoCompleteResizeGuard();
    installStyle();
    installClawdRigStyle();
    chatTools = installChatTools({
      win: hostWindow, doc: hostDocument, getContext,
      enabled: () => !destroyed && hostDocument.documentElement.dataset.claudeEnabled !== 'off',
      follow: () => streamFollow, openChat: openRecentChat,
      onFavoritesChange: () => { recentSignature = null; recentDataVersion++; refreshRailRecents({force:true}); },
    });
    halloween = installHalloween({win:hostWindow, getContext, setRig:switchHalloweenRig, refresh:scheduleRefresh, getClawdState:()=>({x:A2.x,y:A2.fy,held:A2.held,dragging:A2.dragging,airborne:halloweenAirborne})});
    halloween.sync();
    hostWindow.console?.info?.('[Claude-Clawd] build:', KEYBOARD_BUILD.id);
    setBodyClass(READY_CLASS, true);
    hostDocument.body.classList.toggle(MOBILE_LAYOUT_CLASS, mobileEnabled);
    hostDocument.body.classList.toggle(TAURITAVERN_HOST_CLASS, isTauriTavernHost());
    externalModalObserver = new hostWindow.MutationObserver(records => {
      // Some hosts rewrite an unchanged style/class attribute. Do not feed
      // those no-op writes back into another layout and sheet-yield pass.
      if (records.some(record => record.oldValue !== record.target.getAttribute(record.attributeName))) scheduleExternalSurfaceIsolation();
    });
    hostDocument.addEventListener('transitionend', onExternalModalAnimationEnd);
    hostDocument.addEventListener('animationend', onExternalModalAnimationEnd);
    // 2.0.244：设置开 / 关也要重算侧栏层级（见 liftExternalModals）。
    externalModalObserver.observe(hostDocument.documentElement, { attributes: true, attributeOldValue: true, attributeFilter: ['data-cw-v4-settings'] });
    syncExternalSurfaceIsolation();
    syncExternalModalRailLayer();
    surfaceScheme = embeddedSurfaceScheme();
    surfaceThemeObserver = new hostWindow.MutationObserver(repaintSurfacesIfSchemeChanged);
    surfaceThemeObserver.observe(hostDocument.documentElement, {attributes: true, attributeFilter: ['data-claude-integrated-theme']});
    hostDocument.addEventListener('load', onThemeStylesheetLoad, true);
    installVirtualKeyboardOverlay();
    watchGenerationEvents();
    syncClawdRuntime();
    observer = new hostWindow.MutationObserver(handleObservedMutations);
    chatAttributeObserver = new hostWindow.MutationObserver(handleObservedMutations);
    // characterData 会让流式输出的每个 token 都触发一次全量刷新，去掉；
    // 结构变化用 childList + attributes 已经够。
    observer.observe(hostDocument.body, BODY_OBSERVER_INIT);
    ensureChatAttributeObserver();
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
    hostDocument.addEventListener('click', openWelcomeDrawer, true);
    hostDocument.addEventListener('click', guardDrawerClick, true);
    hostDocument.addEventListener('mousedown', blockDrawerAutoClose, true);
    hostDocument.addEventListener('touchstart', blockDrawerAutoClose, true);
    hostDocument.addEventListener('mousedown', blockInlineDrawerAutoClose, true);
    hostDocument.addEventListener('touchstart', blockInlineDrawerAutoClose, true);
    hostDocument.addEventListener('pointerdown', releaseDrawerGuard, true);
    hostDocument.addEventListener('keydown', releaseDrawerGuard, true);
    hostDocument.addEventListener('pointerdown', dismissCharacterMenu, true);
    hostDocument.addEventListener('keydown', dismissCharacterMenu, true);
    hostWindow.addEventListener('resize', handleViewportChange, { passive: true });
    hostDocument.addEventListener('mousemove', handleLook, { passive: true });
    hostDocument.addEventListener('keydown', noteActivity, { passive: true });
    for (const type of ['wheel','pointerdown','pointermove','pointerup','pointercancel','keydown']) hostDocument.addEventListener(type, handleClawdReadingIntent, { capture: true, passive: true });
    for (const type of ['beforeinput','compositionstart','compositionend']) hostDocument.addEventListener(type, handleClawdComposerEdit, true);
    hostDocument.addEventListener('input', handleComposerInput, true);
    hostDocument.addEventListener('visibilitychange', noteCcVisibility, { passive: true });
    hostDocument.addEventListener('visibilitychange', recoverStalledFrame, { passive: true });
    hostDocument.addEventListener('pointerdown', handleComposerFocusGesture, true);
    hostDocument.addEventListener('touchstart', handleComposerFocusGesture, { capture: true, passive: true });
    hostDocument.addEventListener('focusin', handleFocusIn, true);
    hostDocument.addEventListener('focusout', handleFocusOut, true);
    hostWindow.visualViewport?.addEventListener('resize', handleViewportChange, { passive: true });
    hostWindow.visualViewport?.addEventListener('scroll', handleViewportScroll, { passive: true });
    if (usesIOSVisualViewport()) {
      hostWindow.addEventListener('scroll', handleIOSRootScroll, { passive: true });
      iosKeyboardScroll = installIOSKeyboardScroll({ win: hostWindow, enabled: () => !destroyed && usesIOSVisualViewport(), keyboardTarget: isSoftKeyboardTarget, reset: () => resetIOSRoot(true) });
      stopIOSComposerFocus = installIOSComposerFocus({ win: hostWindow, enabled: () => !destroyed && usesIOSVisualViewport(), prepare: releaseMobileChatAutofocus });
    }
    startMobileKeyboardPoll();
    scheduleRefresh();

  }

  function destroy() {
    hostWindow.clearInterval(genTimerTickTimer); genTimerTickTimer = 0;
    if (clawdRuntimeTimer) hostWindow.clearInterval(clawdRuntimeTimer);
    clawdRuntimeTimer = 0;
    if (genTimerLingerTimer) hostWindow.clearTimeout(genTimerLingerTimer);
    genTimerEl?.remove();
    genTimerEl = null;
    if (reconcileTimer) hostWindow.clearTimeout(reconcileTimer);
    reconcileTimer = 0;
    if (destroyed) return;
    destroyed = true;
    clawdRhythm?.destroy();
    clawdRhythm = null;
    refreshRailUser.avatar?.cleanup();
    chatTools?.destroy();chatTools=null;
    halloween?.destroy(); halloween = null;
    syncClawdRuntime();
    clawdPile.destroy();
    hostWindow.clearTimeout(pushLiveTimer);
    hostDocument.documentElement.removeAttribute(PUSH_LIVE_ATTRIBUTE);
    cleanupClawdRigEffects();
    surfaceThemeObserver?.disconnect();
    surfaceThemeObserver = null;
    hostDocument.removeEventListener("load", onThemeStylesheetLoad, true);
    externalModalObserver?.disconnect();
    externalModalObserver = null;
    hostDocument.removeEventListener('transitionend', onExternalModalAnimationEnd);
    hostDocument.removeEventListener('animationend', onExternalModalAnimationEnd);
    extraExternalModalCandidates.clear();
    externalModalSources.clear();
    hostDocument.body.classList.remove(EXTERNAL_MODAL_OPEN_CLASS);
    restoreExternalModalRailLayer();
    liftExternalModals([]);
    externalManagerWatch?.disconnect();externalManagerWatch=null;watchedExternalManager=null;
    if (externalSurfaceIsolationRaf) hostWindow.cancelAnimationFrame(externalSurfaceIsolationRaf);
    externalSurfaceIsolationRaf = 0;
    restoreExternalThemeStyle();
    hostDocument.querySelectorAll(`.${SURFACE_HOST_CLASS}`).forEach(host => host.classList.remove(SURFACE_HOST_CLASS));
    hostDocument.querySelectorAll(`.${SURFACE_BACKING_CLASS}`).forEach(backing => backing.remove());
    restoreAutoCompleteResizeGuard();
    observer?.disconnect();
    chatAttributeObserver?.disconnect();
    chatAttributeObserver = null;
    observedAttributeChat = null;
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
    streamFollow?.destroy();
    streamFollow = null;
    deleteAnchor?.destroy();
    deleteAnchor = null;
    generationSubscriptions.length = 0;
    clearNativeStartTimer();
    delayedGeneration = null;
    generationEventActive = false;
    nativeGenerationSeen = false;
    setGeneratingFlag(false);
    scrollHost?.removeEventListener('scroll', handleChatScroll);
    if (swipeTrackRaf) hostWindow.cancelAnimationFrame(swipeTrackRaf);
    swipeObserver?.disconnect();
    swipeObserver = null;
    observedSwipeMessages.clear();
    visibleSwipeMessages.clear();
    hostDocument.removeEventListener('click', interceptNativeDelete, true);
    hostDocument.removeEventListener('click', openWelcomeDrawer, true);
    hostDocument.removeEventListener('click', guardDrawerClick, true);
    hostDocument.removeEventListener('mousedown', blockDrawerAutoClose, true);
    hostDocument.removeEventListener('touchstart', blockDrawerAutoClose, true);
    hostDocument.removeEventListener('mousedown', blockInlineDrawerAutoClose, true);
    hostDocument.removeEventListener('touchstart', blockInlineDrawerAutoClose, true);
    hostDocument.removeEventListener('pointerdown', releaseDrawerGuard, true);
    hostDocument.removeEventListener('keydown', releaseDrawerGuard, true);
    hostDocument.removeEventListener('pointerdown', dismissCharacterMenu, true);
    hostDocument.removeEventListener('keydown', dismissCharacterMenu, true);
    clearDrawerGuard();
    closeCharacterMenu();
    closeMobileMenu();
    if (mobileNavHolder && mobileNavCloseHandler) {
      mobileNavHolder.removeEventListener('click', mobileNavCloseHandler, true);
      mobileNavHolder.removeEventListener('touchstart', mobileNavPrepareHandler, true);
      mobileNavHolder.removeEventListener('mousedown', mobileNavPrepareHandler, true);
    }
    mobileNavHolder = null;
    mobileNavCloseHandler = null;
    mobileNavPrepareHandler = null;
    mobileChrome?.root?.remove();
    mobileChrome = null;
    hostDocument.querySelectorAll('.' + ANDROID_KEYBOARD_PAN_ANCHOR_CLASS).forEach(node => node.remove());
    if (A2.bndRaf) hostWindow.cancelAnimationFrame(A2.bndRaf);
    A2.bndRaf = 0;
    if (clawdScrollRestTimer) hostWindow.clearTimeout(clawdScrollRestTimer);
    clawdScrollRestTimer = 0;
    if (clawdPileRestTimer) hostWindow.clearTimeout(clawdPileRestTimer);
    clawdPileRestTimer = 0;
    clawdScrollHolding = false;
    A2.bndReady = false;
    composerResizeObserver?.disconnect();
    composerResizeObserver = null;
    clawdFormRO?.disconnect(); clawdFormRO = null; clawdFormObserved = null;
    observedComposerShell?.style.removeProperty(MOBILE_COMPOSER_TRANSLATE_PROPERTY);
    observedComposerShell = null;
    lastComposerHeight = 0;
    if (composerInsetRaf) hostWindow.cancelAnimationFrame(composerInsetRaf);
    composerInsetRaf = 0;
    if (composerBottomRaf) hostWindow.cancelAnimationFrame(composerBottomRaf);
    composerBottomRaf = 0;
    clearMobileViewportSettleTimers();
    clearMobileViewportRecheck();
    mobileKeyboardSettlingUntil = 0;
    mobileKeyboardRecoveryActive = false;
    stopMobileKeyboardPoll();
    stopKeyboardTrace();
    restoreVirtualKeyboardOverlay();
    hostDocument.querySelectorAll('.' + RAIL_BRAND_CLASS).forEach(brand => brand.remove());
    hostDocument.querySelectorAll('.' + PC_TOP_ACTIONS_CLASS).forEach(actions => actions.remove());
    hostDocument.querySelectorAll('.' + CHARACTER_SWITCHER_CLASS).forEach(button => button.remove());
    hostDocument.querySelectorAll('.' + FAKE_MIC_CLASS).forEach(mic => mic.remove());
    hostDocument.querySelectorAll('.clawd-mobile-new-chat').forEach(button => button.remove());
    hostWindow.removeEventListener('resize', handleViewportChange);
    hostDocument.removeEventListener('mousemove', handleLook);
    hostDocument.removeEventListener('keydown', noteActivity);
    clawdReadingGate.reset(true); clawdComposerReaction.reset();
    for (const type of ['wheel','pointerdown','pointermove','pointerup','pointercancel','keydown']) hostDocument.removeEventListener(type, handleClawdReadingIntent, true);
    for (const type of ['beforeinput','compositionstart','compositionend']) hostDocument.removeEventListener(type, handleClawdComposerEdit, true);
    hostDocument.removeEventListener('input', handleComposerInput, true);
    hostDocument.removeEventListener('visibilitychange', noteCcVisibility);
    hostDocument.removeEventListener('visibilitychange', recoverStalledFrame);
    releaseMobileChatAutofocus();
    hostDocument.removeEventListener('pointerdown', handleComposerFocusGesture, true);
    hostDocument.removeEventListener('touchstart', handleComposerFocusGesture, true);
    hostDocument.removeEventListener('focusin', handleFocusIn, true);
    hostDocument.removeEventListener('focusout', handleFocusOut, true);
    if (throttleTimer) {
      hostWindow.clearTimeout(throttleTimer);
      throttleTimer = 0;
    }
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
    hostWindow.visualViewport?.removeEventListener('scroll', handleViewportScroll);
    hostWindow.removeEventListener('scroll', handleIOSRootScroll);
    stopIOSComposerFocus?.(); stopIOSComposerFocus = null;
    iosKeyboardScroll?.destroy(); iosKeyboardScroll = null;
    hostDocument.documentElement.removeAttribute('data-cw-ios-viewport');
    hostDocument.documentElement.removeAttribute('data-cw-ios-viewport-mode');
    if (mobileComposerTranslateRaf) hostWindow.cancelAnimationFrame(mobileComposerTranslateRaf);
    mobileComposerTranslateRaf = 0;
    if (viewportSettleTimer) hostWindow.clearTimeout(viewportSettleTimer);
    viewportSettleTimer = 0;
    scrollHost = null;
    if (frameId) {
      hostWindow.cancelAnimationFrame(frameId);
      frameId = 0;
    }
    emptyTimers.forEach(timer => hostWindow.clearTimeout(timer));
    emptyTimers.clear();
    dirtyMessages.clear();
    previousTypingActive = false;
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
      .querySelectorAll(`.${BUTTON_CLASS}, .${LEFT_SWIPE_PROXY_CLASS}, .${SWIPE_PROXY_CLASS}, .${CLASSIC_BAR_SWIPES_CLASS}, .${REROLL_CLASS}, .${USER_ACTIONS_CLASS}, .${PROMPT_DRAG_HANDLE_CLASS}, .clawd-typing-hit, .clawd-typing-exit-ghost`)
      .forEach(element => element.remove());
    hostDocument.querySelectorAll('#chat .typing_indicator').forEach(indicator => {
      indicator.classList.remove('clawd-typing-enter', 'clawd-typing-ready', 'clawd-typing-native-suppressed', 'clawd-typing-click', 'clawd-typing-press', 'clawd-cheer', 'clawd-wobble-sway', 'clawd-wobble-tilt');
      delete indicator.dataset.clawdTypingRun;
    });
    hostDocument.getElementById(STYLE_ID)?.remove();
    hostDocument.getElementById(CLAWD_RIG_STYLE_ID)?.remove();
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
    hostDocument
      .querySelectorAll('.mes_reasoning_details[data-clawd-collapsed]')
      .forEach(box => box.removeAttribute('data-clawd-collapsed'));
    hostDocument.querySelectorAll(`.${REGEX_SURFACE_CLASS}`).forEach(element => element.classList.remove(REGEX_SURFACE_CLASS));
    hostDocument.documentElement.style.removeProperty('--clawd-signoff-image');
    hostDocument.documentElement.style.removeProperty(MOBILE_COMPOSER_HEIGHT_PROPERTY);
    hostDocument.documentElement.style.removeProperty(MOBILE_VIEWPORT_HEIGHT_PROPERTY);
    hostDocument.documentElement.style.removeProperty(MOBILE_VIEWPORT_TOP_PROPERTY);
    hostDocument.documentElement.style.removeProperty(MOBILE_POPUP_HEIGHT_PROPERTY);
    if (hostWindow[INSTANCE_KEY] === api) delete hostWindow[INSTANCE_KEY];
  }

  // 控制台里跑 __claudeClawdInteraction.drawerStats() 看抽屉这块的实况：
  //   blocked      拦掉了几次酒馆的 mousedown 自动关闭（应该 = 点击次数）
  //   corrections  守卫真的动手改回状态几次（理想是 0 —— 说明根因断干净了）
  const api = {
    halloween: () => halloween,
    destroy,
    refresh: () => { syncClawdRuntime(); scheduleRefresh(); },
    clawdRuntimeStats: () => ({enabled:clawdEnabled(),frames:clawdFrames.size,timers:clawdTimers.size,pile:!!clawdPileInstance,tick:!!clawdRuntimeTimer}),
    clawdState: () => ({
      A: clawdTracks.A,
      B: clawdTracks.B,
      C: clawdTracks.C,
      owner: clawdTracks.C ? 'C' : clawdTracks.A ? 'A' : 'B',
      visible: clawdVisibleState(),
      round: clawdTracks.activeRound,
      settledRound: clawdTracks.settledRound,
      irr: A2.irr,
    }),
    recentsFilter:value=>{const prefs=preferencesFor(hostWindow);if(chatTools?.isEnabled()&&['all','starred'].includes(value)){prefs.setItem('claude-web:recents-filter',value);recentSignature=null;recentDataVersion++;refreshRailRecents({force:true});}return {enabled:!!chatTools?.isEnabled(),value:prefs.getItem('claude-web:recents-filter')==='starred'?'starred':'all'};},
    streamFollowStats: () => streamFollow?.stats(),
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
        外部样式记录忽略数: refreshStats.externalStyleRecordsIgnored,
        消息条数: hostDocument.querySelectorAll('#chat > .mes').length,
        消息总字数: [...hostDocument.querySelectorAll('#chat > .mes .mes_text')]
          .reduce((sum, node) => sum + node.textContent.length, 0),
      };
      if (reset) {
        Object.assign(refreshStats, {
          refreshes: 0, totalMs: 0, maxMs: 0, lastMs: 0,
          recordsSeen: 0, recordsPassedFilter: 0, selfRecordsDropped: 0,
          externalStyleRecordsIgnored: 0,
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
      polling: Boolean(mobileKeyboardPollTimer),
    }),
    autoCompleteGuardStats: () => ({
      installed: Boolean(autoCompleteResizeGuard?.installed),
      reason: autoCompleteResizeGuard?.reason || 'not-installed',
      moduleUrl: autoCompleteResizeGuard?.moduleUrl || null,
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

} else {
  console.info('[Claude Web] 已在设置面板里关闭，只加载设置面板本身。');
}

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
  const AUTO_THEME_MODES = [
    { value: 'manual', label: '关闭（手动）' },
    { value: 'system', label: '跟随手机系统' },
    { value: 'time', label: '按时间自动切换' },
  ];
                                          
                                            
  const FONTS = [
    { value: 'follow', label: '跟风格（默认）' },
    { value: 'songti', label: '思源宋（正文衬线）' },
    { value: 'heiti',  label: '思源黑（全站黑体）' },
    { value: 'system', label: '系统无衬线（不加载网络字体）' },
    { value: 'device', label: '跟随设备/系统' },
    { value: 'custom', label: '自定义（下方填写）' },
    { value: 'native', label: '关掉（用酒馆原生字体）' },
  ];
  const FONT_VALUES = FONTS.map(f => f.value);

  const LAYOUTS = [
    { value: 'auto', label: '自动（跨 700px 自动切换）' },
    { value: 'pc', label: '桌面' },
    { value: 'mobile', label: '手机' },
  ];

  function read(key, allowed, fallback) {
    try {
      const raw = (key === 'enabled' ? window.localStorage.getItem(KEY_PREFIX + key) : preferencesFor(window).getItem(KEY_PREFIX + key));
      return allowed.includes(raw) ? raw : fallback;
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      if (key === 'enabled') window.localStorage.setItem(KEY_PREFIX + key, value); else preferencesFor(window).setItem(KEY_PREFIX + key, value);
      return true;
    } catch (error) {
      console.warn('[Claude Web] 设置写入失败：', error);
      return false;
    }
  }

  function readClock(key, fallback) {
    try {
      const value = preferencesFor(window).getItem(KEY_PREFIX + key);
      return /^([01]\d|2[0-3]):[0-5]\d$/.test(value || '') ? value : fallback;
    } catch {
      return fallback;
    }
  }

  /* Bug 3：毛玻璃透明度初始化之前是不带 try/catch 直接读 localStorage，
     隐私模式 / 禁第三方存储的 WebView / 部分云端宿主里 localStorage.getItem
     本身就会抛异常，读取一炸就中断了 mount()，设置面板后面一截（预设、
     版本号、更新按钮）全部不会挂载。这里补一个和 read()/readClock() 同风格
     的安全读取函数，读不到就退回默认值，不让存储受限变成整个面板挂不上。 */
  function readNumber(key, fallback, min, max) {
    try {
      const value = Number(preferencesFor(window).getItem(KEY_PREFIX + key));
      if (!Number.isFinite(value)) return fallback;
      return Math.min(max, Math.max(min, value));
    } catch {
      return fallback;
    }
  }

  function clockMinutes(value) {
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
  }

  function resolveAutomaticVariant(mode, dayClock, nightClock, manual) {
    if (mode === 'system') {
      try { return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day'; }
      catch { return manual; }
    }
    if (mode === 'time') {
      const dayStart = clockMinutes(dayClock);
      const nightStart = clockMinutes(nightClock);
      if (dayStart === nightStart) return manual;
      const now = new Date();
      const minute = now.getHours() * 60 + now.getMinutes();
      const isDay = dayStart < nightStart
        ? minute >= dayStart && minute < nightStart
        : minute >= dayStart || minute < nightStart;
      return isDay ? 'day' : 'night';
    }
    return manual;
  }

  /* 2.0.1 撤下未完成的档案版式。升级用户可能还留着旧 localStorage，
     启动时主动清掉，不能让已经从面板移除的功能继续暗中生效。 */
  const enabled = typeof CLAUDE_ENABLED === 'undefined' ? true : CLAUDE_ENABLED;
  (function retireArchiveStyle() {
    const root = document.documentElement;
    delete root.dataset.claudeArchive;
    delete root.dataset.claudeArchiveGhost;
    try {
      if (preferencesFor(window).getItem(KEY_PREFIX + 'family') === 'archive') {
        preferencesFor(window).setItem(KEY_PREFIX + 'family', 'anthropic');
      }
      preferencesFor(window).removeItem(KEY_PREFIX + 'style');
      preferencesFor(window).removeItem(KEY_PREFIX + 'ghost');
    } catch {
      /* 无痕模式或受限宿主里清不掉也不影响：CSS 已经不再包含档案版式。 */
    }
  })();

  function resolveLayout(choice) {
    if (choice !== 'auto') return choice;
    return claudeDetectPhone() || window.matchMedia?.('(max-width:700px)').matches ? 'mobile' : 'pc';
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
    /* 兼容模式的样式表是 compat-<明暗>.css，不分 pc/mobile。
       2.0.87 漏了这条：面板里切明暗会去请求 styles/night-pc.css，
       等于把完整模式的样式表塞进兼容模式，所以看起来"切了没反应"。 */
    const compatNow = read('mode', ['full', 'compat'], 'full') === 'compat';
    const styleUrl = new URL(
      compatNow
        ? `styles/compat-${layout === 'mobile' ? 'mobile-' : ''}${variant}.css`
        : `styles/${variant}-${layout}.css`,
      base,
    );
    styleUrl.searchParams.set(
      'v',
      typeof CLAUDE_KEYBOARD_BUILD !== 'undefined' ? CLAUDE_KEYBOARD_BUILD.id : 'live',
    );

    /* Bug 2 修复：这里以前只换了 <link href> 和 dataset，
       酒馆自己的 powerUserSettings.theme / custom_css / SmartTheme 变量 /
       主题下拉框全都没跟着换，出现"界面已经是夜间，酒馆自己的主题记录
       还是日间"的状态混合。
       统一入口现在做两件事：
       1. 立刻调用主题运行时暴露的 applyVariant(variant)——它会现查
          CLAUDE_THEMES[variant]，重新走一遍写 powerUserSettings + CSS 变量
          + 下拉框同步的完整流程，不用等样式表网络请求完成（这部分是纯
          JS/DOM 操作，跟 <link> 是否加载成功无关）。
       2. 不再假定 setAttribute('href', ...) 就等于切换成功——监听这个
          <link> 自己的 load / error：加载失败就把 href 和 dataset 都退回
          旧值，同时把 powerUserSettings 也退回旧 variant，向用户提示切换
          失败，不留一个"样式表 404 但主题记录已经跳到新明暗"的坏状态。 */
    const previousHref = link.getAttribute('href');
    const previousVariant = document.documentElement.dataset.claudeIntegratedTheme;
    const revertOnFailure = () => {
      if (previousHref) link.setAttribute('href', previousHref);
      document.documentElement.dataset.claudeIntegratedTheme = previousVariant;
      if (previousVariant) window.__claudeIntegratedTheme?.applyVariant?.(previousVariant);
      hostToast?.('主题切换失败，已保留原主题。');
    };
    link.addEventListener('error', revertOnFailure, { once: true });
    link.addEventListener('load', () => link.removeEventListener('error', revertOnFailure), { once: true });

    link.setAttribute('href', styleUrl.href);
    document.documentElement.dataset.claudeIntegratedTheme = variant;
    window.__claudeIntegratedTheme?.applyVariant?.(variant);
    return true;
  }

  function hostToast(message) {
    try {
      window.toastr?.info?.(message, 'Claude Web');
    } catch { /* toastr 不可用时静默，不阻断切换流程 */ }
  }

  function buildPanel() {
    const wrapper = document.createElement('div');
    wrapper.id = PANEL_ID;
    /* 沿用酒馆的 inline-drawer 结构，折叠交给酒馆自己的委托监听处理，
       我们不另外绑，免得点一下切两次。 */
    wrapper.innerHTML = `
      <style>
        /* 主题自己那 2400 多处 !important 会把按钮压成窄条，文字于是竖着排。
           这里用 id 提高特异性把它抢回来。 */
        #${PANEL_ID}, #${PANEL_ID} * { box-sizing:border-box; }
        #${PANEL_ID} .menu_button {
          display:inline-flex !important;
          align-items:center !important;
          justify-content:center !important;
          width:auto !important;
          min-width:0 !important;
          max-width:none !important;
          flex:0 0 auto !important;
          white-space:nowrap !important;
          writing-mode:horizontal-tb !important;
          padding:5px 12px !important;
          line-height:1.4 !important;
        }
        #${PANEL_ID} select.text_pole {
          display:block !important;
          width:100% !important;
        }
        #${PANEL_ID} label { display:block; margin-bottom:3px; }
        #${PANEL_ID} .claude-web-auto-theme {
          margin:0 0 10px; padding:9px; border:1px solid color-mix(in srgb,currentColor 16%,transparent);
          border-radius:10px;
        }
        #${PANEL_ID} .claude-web-auto-times {
          display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:7px;
        }
        #${PANEL_ID} .claude-web-auto-times input[type="time"] {
          display:block !important; width:100% !important; min-width:0 !important;
        }
        /* 取色器一行两个。酒馆的设置栏很窄，三个一行色块会小到点不准。 */
        #${PANEL_ID} .claude-web-swatches {
          display:grid; grid-template-columns:1fr 1fr; gap:5px 8px; margin-top:8px;
        }
        #${PANEL_ID} .claude-web-swatch {
          display:flex !important; align-items:center; gap:6px;
          margin:0 !important; font-size:0.9em; min-width:0;
        }
        /* 酒馆给 input 的通用样式会把颜色块拉成一条细线，这里全量覆盖。 */
        #${PANEL_ID} .claude-web-swatch input[type="color"] {
          width:30px !important; height:22px !important;
          flex:0 0 auto !important; padding:0 !important; border:none !important;
          background:none !important; cursor:pointer;
        }
        #${PANEL_ID} .claude-web-swatch span {
          overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
        }
        #${PANEL_ID} .claude-web-master {
          display:flex !important; align-items:center; gap:7px;
          margin:0 !important; padding:10px 11px;
          border:1px solid color-mix(in srgb,currentColor 16%,transparent);
          border-radius:10px;
        }
        #${PANEL_ID} .claude-web-master input { flex:0 0 auto; }
        #${PANEL_ID} .claude-web-sections {
          display:grid; gap:7px; margin-top:10px;
        }
        #${PANEL_ID} .claude-web-section {
          margin:0; border:1px solid color-mix(in srgb,currentColor 14%,transparent);
          border-radius:10px; overflow:hidden;
          background:color-mix(in srgb,currentColor 2.5%,transparent);
        }
        #${PANEL_ID} .claude-web-section > summary {
          display:flex; align-items:center; gap:8px;
          min-height:38px; padding:8px 10px; cursor:pointer; user-select:none;
          list-style:none; font-weight:600;
        }
        #${PANEL_ID} .claude-web-section > summary::-webkit-details-marker { display:none; }
        #${PANEL_ID} .claude-web-section > summary::after {
          content:"\\f078"; flex:0 0 auto; margin-left:2px;
          font-family:"Font Awesome 6 Free","Font Awesome 5 Free" !important;
          font-weight:900; font-size:.72em; opacity:.55;
          transition:transform .16s ease;
        }
        #${PANEL_ID} .claude-web-section[open] > summary::after { transform:rotate(180deg); }
        #${PANEL_ID} .claude-web-section-summary {
          flex:1 1 auto; min-width:0; overflow:hidden;
          color:inherit; font-size:.84em; font-weight:400; opacity:.62;
          text-align:right; text-overflow:ellipsis; white-space:nowrap;
        }
        #${PANEL_ID} .claude-web-section-body {
          padding:10px; border-top:1px solid color-mix(in srgb,currentColor 11%,transparent);
        }
        #${PANEL_ID} .claude-web-field + .claude-web-field { margin-top:9px; }
        #${PANEL_ID} .claude-web-check {
          display:flex !important; align-items:center; gap:7px; margin:0 !important;
          min-height:28px;
        }
        #${PANEL_ID} .claude-web-check + .claude-web-check { margin-top:3px !important; }
        #${PANEL_ID} .claude-web-suboptions {
          margin:6px 0 0 22px; padding-left:9px;
          border-left:2px solid color-mix(in srgb,currentColor 13%,transparent);
        }
        #${PANEL_ID} .claude-web-range {
          display:grid; grid-template-columns:auto minmax(70px,1fr) 3em;
          align-items:center; gap:8px; margin-top:7px;
        }
        #${PANEL_ID} .claude-web-range > span:first-child {
          font-size:.9em; opacity:.75; white-space:nowrap;
        }
        #${PANEL_ID} .claude-web-range > span:last-child {
          width:3em; font-size:.9em; opacity:.75; text-align:right;
        }
        #${PANEL_ID} .claude-web-help {
          margin-top:5px; font-size:.85em; opacity:.62; line-height:1.5;
        }
        #${PANEL_ID} .claude-web-actions {
          display:flex; gap:6px; flex-wrap:wrap; margin-top:7px;
        }
        #${PANEL_ID} [hidden] { display:none !important; }
      </style>
      <div class="inline-drawer">
        <div class="inline-drawer-toggle inline-drawer-header">
          <b>Claude Web</b>
          <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
        </div>
        <div class="inline-drawer-content">
          <label class="checkbox_label claude-web-master">
            <input id="claude-web-enabled" type="checkbox">
            <span><b>启用 Claude Web</b></span>
          </label>
          <div id="claude-web-enabled-hint"
               style="margin:6px 2px 0;font-size:0.9em;opacity:.75;line-height:1.5"></div>

          <div class="claude-web-sections">
            <details class="claude-web-section" id="claude-web-section-appearance" open>
              <summary>
                <span>外观</span>
                <span class="claude-web-section-summary" id="claude-web-summary-appearance"></span>
              </summary>
              <div class="claude-web-section-body">
                <div class="claude-web-field">
                  <label for="claude-web-mode"><b>运行模式</b></label>
                  <select id="claude-web-mode" class="text_pole">
                    <option value="full">完整美化（Claude Web 接管界面）</option>
                    <option value="compat">框架兼容（Claude 外壳 + 当前美化内容）</option>
                  </select>
                  <div id="claude-web-mode-hint" class="claude-web-help"></div>
                </div>

                <div id="claude-web-full-appearance" class="claude-web-field">
                <div class="claude-web-field">
                  <label for="claude-web-preset">Claude 风格预设</label>
                  <select id="claude-web-preset" class="text_pole"></select>
                </div>

                <div class="claude-web-field" id="claude-web-ui-style-field">
                  <label for="claude-web-ui-style">界面样式</label>
                  <select id="claude-web-ui-style" class="text_pole"></select>
                  <div id="claude-web-ui-style-pending" class="claude-web-help" hidden><span></span> <button id="claude-web-ui-style-reload" type="button" class="menu_button"></button></div>
                </div>

                <div class="claude-web-field" id="claude-web-preview-field">
                  <label class="checkbox_label claude-web-check" id="claude-web-preview-row"><input id="claude-web-preview" type="checkbox"><span></span></label>
                  <div id="claude-web-preview-help" class="claude-web-help"></div>
                  <div id="claude-web-preview-pending" class="claude-web-help" hidden><span></span> <button id="claude-web-preview-reload" type="button" class="menu_button"></button></div>
                </div>

                <div class="claude-web-field claude-web-auto-theme">
                  <label for="claude-web-theme-auto"><b>主题切换</b></label>
                  <select id="claude-web-theme-auto" class="text_pole"></select>
                  <div id="claude-web-auto-times" class="claude-web-auto-times" hidden>
                    <label>日间开始<input id="claude-web-day-start" type="time" class="text_pole" value="07:00"></label>
                    <label>夜间开始<input id="claude-web-night-start" type="time" class="text_pole" value="19:00"></label>
                  </div>
                  <div id="claude-web-auto-hint" class="claude-web-help"></div>
                </div>

                <div class="claude-web-field">
                  <label for="claude-web-variant">当前明暗</label>
                  <select id="claude-web-variant" class="text_pole"></select>
                </div>

                <div class="claude-web-field">
                  <label for="claude-web-font">字体</label>
                  <select id="claude-web-font" class="text_pole"></select>
                  <input id="claude-web-font-custom" class="text_pole" style="margin-top:6px;display:none"
                         placeholder='自定义 font-family，例如："LXGW WenKai", serif'>
                </div>

                <label class="checkbox_label claude-web-check claude-web-field">
                  <input id="claude-web-quote-body-color" type="checkbox">
                  <span>引号内文字变色</span>
                </label>
                <div class="claude-web-help">开启时使用主题引号色，关闭时跟随正文颜色。</div>

                <details id="claude-web-colors" class="claude-web-field">
                  <summary style="cursor:pointer;user-select:none;opacity:.85">自定义配色</summary>
                  <div id="claude-web-swatches" class="claude-web-swatches"></div>
                  <div class="claude-web-help">改动存进「我的配色」，日间和夜间各存一套，其余颜色自动推导。</div>
                </details>

                <div class="claude-web-actions">
                  <button id="claude-web-export" class="menu_button">导出</button>
                  <button id="claude-web-import" class="menu_button">导入</button>
                  <button id="claude-web-reset" class="menu_button">清除自定义</button>
                </div>
                <input id="claude-web-import-file" type="file" accept="application/json,.json" style="display:none">
                <div id="claude-web-preset-hint" class="claude-web-help"></div>
                </div>
              </div>
            </details>

            <details class="claude-web-section" id="claude-web-section-layout">
              <summary>
                <span>布局</span>
                <span class="claude-web-section-summary" id="claude-web-summary-layout"></span>
              </summary>
              <div class="claude-web-section-body">
                <div class="claude-web-field">
                  <label for="claude-web-layout">设备布局</label>
                  <select id="claude-web-layout" class="text_pole"></select>
                </div>
                <div class="claude-web-field">
                  <label for="claude-web-recents-size">侧栏「最近」大小</label>
                  <select id="claude-web-recents-size" class="text_pole">
                    <option value="s">紧凑</option>
                    <option value="m">标准</option>
                    <option value="l">大</option>
                    <option value="xl">特大</option>
                  </select>
                  <div class="claude-web-help">头像、名字和行高一起变，电脑和手机都生效。</div>
                </div>
                <label class="checkbox_label claude-web-check claude-web-field">
                  <input type="checkbox" id="claude-web-avatars">
                  <span>显示头像</span>
                </label>
                <label class="checkbox_label claude-web-check claude-web-field" title="关掉后，回复下方操作栏里的 ‹ › 仍然可以切换回复">
                  <input type="checkbox" id="claude-web-side-swipe">
                  <span>回复两侧的左右切换箭头</span>
                </label>
                <div id="claude-web-hint" class="claude-web-help"></div>
              </div>
            </details>

            <details class="claude-web-section" id="claude-web-section-clawd">
              <summary>
                <span>Clawd</span>
                <span class="claude-web-section-summary" id="claude-web-summary-clawd"></span>
              </summary>
              <div class="claude-web-section-body">
                <label class="checkbox_label claude-web-check">
                  <input type="checkbox" id="claude-web-clawd">
                  <span>显示 Clawd</span>
                </label>
                <label class="checkbox_label claude-web-check"><input type="checkbox" id="claude-web-clawd-pile"><span>输入框上方的小 Clawd</span></label>
                <div id="claude-web-clawd-options" class="claude-web-suboptions">
                  <label class="checkbox_label claude-web-check">
                    <input id="claude-web-motion" type="checkbox">
                    <span>启用状态动画</span>
                  </label>
                  <label class="checkbox_label claude-web-check">
                    <input id="claude-web-decorations" type="checkbox">
                    <span>启用粒子与提示气泡</span>
                  </label>
                  <label class="checkbox_label claude-web-check">
                    <input id="claude-web-gen-timer" type="checkbox">
                    <span>显示生成计时器</span>
                  </label>
                </div>
              </div>
            </details>

            <details class="claude-web-section" id="claude-web-section-components">
              <summary><span>组件开关</span></summary>
              <div class="claude-web-section-body">
                <label class="checkbox_label claude-web-check">
                  <input id="claude-web-ai-disclaimer" type="checkbox">
                  <span>显示 AI 可能出错的提示</span>
                </label>
              </div>
            </details>

            <details class="claude-web-section" id="claude-web-section-background">
              <summary>
                <span>背景</span>
                <span class="claude-web-section-summary" id="claude-web-summary-background"></span>
              </summary>
              <div class="claude-web-section-body">
                <label class="checkbox_label claude-web-check">
                  <input id="claude-web-bg-transparent" type="checkbox">
                  <span>背景透传</span>
                </label>
                <div class="claude-web-help">显示酒馆背景，而不是 Claude 的白底或黑底。</div>

                <label class="checkbox_label claude-web-check" style="margin-top:8px !important">
                  <input id="claude-web-bg-blur" type="checkbox">
                  <span>背景毛玻璃</span>
                </label>
                <div id="claude-web-bg-blur-options" class="claude-web-suboptions">
                  <div class="claude-web-range">
                    <span>浓度</span>
                    <input id="claude-web-bg-blur-opacity" type="range" min="8" max="60" step="1">
                    <span id="claude-web-bg-blur-opacity-value"></span>
                  </div>
                </div>

                <label class="checkbox_label claude-web-check" style="margin-top:10px !important">
                  <input id="claude-web-bg-image-blur" type="checkbox">
                  <span>背景图模糊</span>
                </label>
                <div id="claude-web-bg-image-options" class="claude-web-suboptions">
                  <div class="claude-web-range">
                    <span>模糊半径</span>
                    <input id="claude-web-bg-image-blur-radius" type="range" min="0" max="32" step="1">
                    <span id="claude-web-bg-image-blur-radius-value"></span>
                  </div>
                  <div class="claude-web-range">
                    <span>背景压暗</span>
                    <input id="claude-web-bg-image-dim" type="range" min="0" max="70" step="1">
                    <span id="claude-web-bg-image-dim-value"></span>
                  </div>
                </div>
              </div>
            </details>

            <details class="claude-web-section" id="claude-web-section-about">
              <summary>
                <span>关于与更新</span>
                <span class="claude-web-section-summary">版本与维护</span>
              </summary>
              <div class="claude-web-section-body">
                <div class="claude-web-actions" style="margin-top:0">
                  <button id="claude-web-update" class="menu_button">检查更新</button>
                  <button id="claude-web-reinstall" class="menu_button">重新安装</button>
                </div>
                <div id="claude-web-update-hint" class="claude-web-help"></div>
                <div id="claude-web-build" class="claude-web-help" style="opacity:.55;word-break:break-all"></div>
              </div>
            </details>
          </div>
        </div>
      </div>
    `;
    return wrapper;
  }

  /* 酒馆自带的更新入口藏在「管理扩展」里，而且要勾上 Notify on extension updates
     才会主动提示，很容易以为没更新。这里直接调它的更新接口：
       POST /api/extensions/update  { extensionName }
     extensionName 用的是文件夹名，不带 third-party/ 前缀 —— 服务端的 basePath
     本来就是第三方扩展目录（1.18 的 src/endpoints/extensions.js 已核实），
     而且它会 sanitize 掉斜杠，带前缀反而找不到。 */
  /* 构建脚本注入的仓库地址（tools/build-extension.js 的 REPO_URL）。
     兜底值只在源码直接跑的时候用得上。 */
  const REPO_URL = typeof CLAUDE_EXTENSION_REPO !== 'undefined'
    ? CLAUDE_EXTENSION_REPO
    : 'https://github.com/claudenoshujin/claude-web';

  function folderName() {
    try {
      // 作为正式仓 preview/ 里的前瞻版运行时，检查更新、重装都针对根目录这个扩展。
      const base = globalThis.__cwPreview?.root || (typeof CLAUDE_EXTENSION_BASE !== 'undefined'
        ? CLAUDE_EXTENSION_BASE
        : new URL('.', import.meta.url).href);
      return decodeURIComponent(new URL(base).pathname.replace(/\/+$/, '').split('/').pop() || '');
    } catch {
      return 'claude-web';
    }
  }

  function requestHeaders() {
    const context = window.SillyTavern?.getContext?.();
    return typeof context?.getRequestHeaders === 'function'
      ? context.getRequestHeaders()
      : { 'Content-Type': 'application/json' };
  }

  function post(url, body) {
    return fetch(url, { method: 'POST', headers: requestHeaders(), body: JSON.stringify(body) });
  }

  /* 扩展可能落在两个地方，服务端按 global 标记决定去哪找：
       false → data/<user>/extensions/        （按地址装的默认位置）
       true  → public/scripts/extensions/third-party/（手动拷文件夹会落这里）
     我们不知道用户当初怎么装的，两个都试。只试一个就会出现
     「明明装着却报 404」——之前就是这么踩的。

     判断依据只用 404：其余状态码（包括 500）都说明目录**在**，
     只是服务端处理时出了别的错。 */
  async function locate(folder) {
    for (const global of [false, true]) {
      const response = await post('/api/extensions/version', { extensionName: folder, global });
      if (response.status !== 404) return { global, response };
    }
    return { global: null, response: null };
  }

  /* 酒馆自带的更新入口藏在「管理扩展」里，而且要勾上 Notify on extension updates
     才会主动提示，很容易以为没更新。这里直接调它的更新接口：
       POST /api/extensions/update  { extensionName }
     extensionName 用的是文件夹名，不带 third-party/ 前缀 —— 服务端的 basePath
     本来就是第三方扩展目录（1.18 的 src/endpoints/extensions.js 已核实），
     而且它会 sanitize 掉斜杠，带前缀反而找不到。 */
  async function runUpdate(button, hint) {
    const folder = folderName();

    button.disabled = true;
    hint.textContent = `正在检查 ${folder}…`;
    try {
      const found = await locate(folder);
      if (found.global === null) {
        hint.textContent = `两个扩展目录里都没找到 ${folder}。`
          + '用「Install extension」按地址装一次就好了。';
        return;
      }

      const response = await post('/api/extensions/update', {
        extensionName: folder,
        global: found.global,
      });
      if (!response.ok) {
        /* 服务端只回一句 Internal Server Error，真正的原因在酒馆的黑窗口里。
           但 1.18 的 /update 有个固定坑值得直接说出来：它用的是 simple-git，
           要调系统装的 git 命令；而 /install 用的是 createGitClient，能走
           内置实现。于是「按地址装得上、更新按钮报 500」是完全正常的现象 ——
           这台机器上没装 git。
           另一个已知原因：装的时候是 depth:1 浅克隆，git pull 在浅仓库上
           经常直接失败。两种情况都不是我们能在前端修好的，所以给出口。 */
        hint.innerHTML = `更新接口返回 HTTP ${response.status}。`
          + '<br>1.18 的更新接口要调系统装的 <code>git</code> 命令（安装接口不用），'
          + '所以「装得上但更新报 500」通常是这台机器没装 git；'
          + '浅克隆的仓库 pull 失败也会是同一个码。'
          + '<br>用下面的「重新安装」绕过去 —— 它走的是安装接口，不需要 git 命令。';
        return;
      }
      const data = await response.json();
      if (data?.isUpToDate) {
        hint.textContent = `已经是最新的（${data.shortCommitHash ?? ''}）。`;
        return;
      }
      hint.innerHTML = `已更新到 ${data?.shortCommitHash ?? '新版本'}。`
        + ' <button id="claude-web-update-reload" class="menu_button" style="margin-left:6px">刷新生效</button>';
      hint.querySelector('#claude-web-update-reload')
        ?.addEventListener('click', () => window.location.reload(), { once: true });
    } catch (error) {
      hint.textContent = `更新失败：${error && error.message}`;
    } finally {
      button.disabled = false;
    }
  }

  /* 删掉再按地址装一次。之所以能当「更新」用：/install 走 createGitClient，
     不依赖系统 git，所以 /update 报 500 的机器上它照样能跑。

     顺序只能是先删后装 —— 目录已存在时 /install 直接回 409。
     万一装的那步失败，扩展就真没了，所以失败时把地址原样贴出来让人手动装。
     设置本身存在 localStorage 里，不在扩展目录，删了不丢。 */
  async function runReinstall(button, hint) {
    const folder = folderName();
    /* 2.0.272：用酒馆自己的确认弹窗（已照 Claude 排），浏览器原生 confirm 框没法美化；拿不到时才退回原生框。 */
    const ctx = window.SillyTavern?.getContext?.();
    const ok = typeof ctx?.callGenericPopup === 'function' && ctx.POPUP_TYPE
      ? await ctx.callGenericPopup(
        `<h3>重新安装扩展？</h3><p>将删除扩展目录 ${folder} 后重新从 GitHub 安装。配色和明暗设置存在浏览器里，不会丢失。</p>`,
        ctx.POPUP_TYPE.CONFIRM, '', { okButton: '重新安装', cancelButton: '取消' })
      : window.confirm(
        `将删除扩展目录 ${folder} 后重新从 GitHub 安装。\n`
        + '配色和明暗设置存在浏览器里，不会丢失。\n\n继续？',
      );
    if (!ok) return;

    button.disabled = true;
    hint.textContent = '正在定位扩展目录…';
    try {
      const found = await locate(folder);
      if (found.global === null) {
        hint.textContent = `两个扩展目录里都没找到 ${folder}，无需删除，直接装即可。`;
      } else {
        hint.textContent = '正在删除旧版本…';
        const removed = await post('/api/extensions/delete', {
          extensionName: folder,
          global: found.global,
        });
        if (!removed.ok) {
          hint.textContent = `删除失败：HTTP ${removed.status}。没有改动任何东西。`;
          return;
        }
      }

      hint.textContent = '正在安装最新版本…';
      const installed = await post('/api/extensions/install', {
        url: REPO_URL,
        global: found.global === true,
      });
      if (!installed.ok) {
        hint.innerHTML = `安装失败：HTTP ${installed.status}。`
          + '<br>旧版本已经删掉了，请在「管理扩展 → Install extension」里手动装一次：'
          + `<br><code>${REPO_URL}</code>`;
        return;
      }
      const data = await installed.json().catch(() => null);
      hint.innerHTML = `已装上 ${data?.version ?? '最新版本'}。`
        + ' <button id="claude-web-update-reload" class="menu_button" style="margin-left:6px">刷新生效</button>';
      hint.querySelector('#claude-web-update-reload')
        ?.addEventListener('click', () => window.location.reload(), { once: true });
    } catch (error) {
      hint.textContent = `重装失败：${error && error.message}`;
    } finally {
      button.disabled = false;
    }
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

  /* 明暗那个下拉的 handler 和取色器不在同一个函数里，用这个引用搭桥。 */
  let syncSwatchesRef = () => {};
  /* 面板分区标题和条件显示由 mount() 统一维护。预设切换在 mountPresets()
     里，所以同样用一个延迟绑定的引用搭桥，避免两边各写一份状态判断。 */
  let syncPanelPresentationRef = () => {};

  /* 九个核心色的人话名字。用户看到的是「正文」不是 --cw-ink-0。 */
  const SWATCH_LABELS = {
    '--cw-paper-0': '背景',
    '--cw-paper-1': '卡片',
    '--cw-paper-2': '次级面',
    '--cw-paper-3': '分区块',
    '--cw-ink-0': '正文',
    '--cw-ink-1': '次要字',
    '--cw-ink-2': '弱化字',
    '--cw-ink-3': '最淡线',
    '--cw-clay': '强调色',
  };

  /* input[type=color] 只吃 #rrggbb。预设里的核心色都是这个形状，
     但导入的文件不一定，遇到别的写法就不往取色器里塞，免得被静默改成 #000000。 */
  const HEX = /^#[0-9a-fA-F]{6}$/;

  /* 配色预设那一段。切换只设 CSS 变量，不换样式表，所以当场生效不用刷新。 */
  function mountPresets(panel) {
    const api = window.__claudeWebPresets;
    const select = panel.querySelector('#claude-web-preset');
    const hint = panel.querySelector('#claude-web-preset-hint');
    const fileInput = panel.querySelector('#claude-web-import-file');
    const swatchBox = panel.querySelector('#claude-web-swatches');
    if (!api) {
      select.disabled = true;
      hint.textContent = '预设模块没加载上。';
      return;
    }

    /* ---- 九个取色器 ---- */
    const swatches = new Map();

    function syncSwatches() {
      if (!api.customCore) return;
      const core = api.customCore();
      for (const [key, input] of swatches) {
        const value = core[key];
        if (typeof value === 'string' && HEX.test(value)) input.value = value;
      }
    }

    if (api.customCore && api.setCustomColor && swatchBox) {
      for (const key of api.coreKeys()) {
        const row = document.createElement('label');
        row.className = 'claude-web-swatch';
        const input = document.createElement('input');
        input.type = 'color';
        const text = document.createElement('span');
        text.textContent = SWATCH_LABELS[key] ?? key;
        row.append(input, text);
        swatchBox.append(row);
        swatches.set(key, input);

        /* input 而不是 change：拖着取色器就能看见界面跟着变。 */
        input.addEventListener('input', () => {
          api.setCustomColor(key, input.value);
          /* 第一次改动会自动切到「我的配色」，下拉要跟上，
             否则下拉显示「经典」而界面已经是自定义的了。 */
          if (select.value !== api.customId()) select.value = api.customId();
          hint.textContent = '已存进「我的配色」。';
        });
      }
      syncSwatches();
    } else if (swatchBox) {
      swatchBox.textContent = '当前版本不支持自定义配色。';
    }

    /* 下拉里放的是「家族」，明暗由上面的「主题」决定。
       两个维度分开之后，选不出「浅色配色 + 深色样式表」这种半新半旧的组合。 */
    fillSelect(
      select,
      api.families().map(item => ({ value: item.id, label: item.name })),
      api.currentFamily(),
    );

    select.addEventListener('change', () => {
      const preset = api.activateFamily(select.value);
      /* 换风格会换掉自定义的取值起点，取色器要跟着显示新起点的颜色。 */
      syncSwatches();
      hint.textContent = preset ? `已切到「${preset.name}」。` : '切换失败。';
    });

    /* 明暗切换在另一个 handler 里，那边换完样式表要回来刷取色器 ——
       自定义存了日夜两套，切明暗等于换了一整组值。 */
    syncSwatchesRef = syncSwatches;

    panel.querySelector('#claude-web-export').addEventListener('click', () => {
      try {
        const data = api.exportCurrent();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `[ClaudeWeb] ${data.name}.json`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        hint.textContent = '已导出。';
      } catch (error) {
        hint.textContent = `导出失败：${error && error.message}`;
      }
    });

    panel.querySelector('#claude-web-import').addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      try {
        const result = api.importPreset(await file.text());
        /* 导入落进「我的配色」，下拉和取色器都要跟上。 */
        select.value = api.customId();
        syncSwatches();
        hint.textContent = result.rejected.length
          ? `已装进「我的配色」${result.applied} 项，忽略了 ${result.rejected.length} 个不在白名单里的键。`
          : `已装进「我的配色」${result.applied} 项。`;
      } catch (error) {
        hint.textContent = `导入失败：${error && error.message}`;
      } finally {
        fileInput.value = '';
      }
    });

    panel.querySelector('#claude-web-reset').addEventListener('click', () => {
      const preset = api.clearCustom();
      if (preset) select.value = api.currentFamily();
      syncSwatches();
      hint.textContent = preset
        ? `自定义已清除，回到「${preset.name}」。`
        : '自定义已清除。';
    });
  }

  /* 关掉时尽量当场把外观还原，不必等刷新：
     停用样式表 + 抹掉我们设的属性和 CSS 变量。
     JS 那部分（侧栏、欢迎页、Clawd）已经挂在 DOM 上了，撤不干净，所以仍要刷新。 */
  function teardownLive() {
    try {
      CLAUDE_ENABLED = false;
      document.documentElement.dataset.claudeEnabled = 'off';
      window.removeEventListener('load', startOfficialLayout);
      window.__claudeOfficialLayout?.destroy();
      delete window.__claudeOfficialLayout;
      officialStyle.remove();
      localFontStyle.remove();
      removeOptionalChineseFonts();
      refinementStyle.remove();
      const sheet = document.getElementById('claude-integrated-theme-live-style');
      if (sheet) sheet.disabled = true;
      const root = document.documentElement;
      delete root.dataset.claudeArchive;
      delete root.dataset.claudeArchiveGhost;
      delete root.dataset.claudeIntegratedTheme;
      /* 预设是往 documentElement 的 inline style 上设变量的，一并清掉。 */
      const api = window.__claudeWebPresets;
      if (api && api.coreKeys) {
        for (const key of api.coreKeys()) root.style.removeProperty(key);
      }
      return true;
    } catch (error) {
      console.warn('[Claude Web] 停用时清理失败：', error);
      return false;
    }
  }

  function mountEnabled(panel) {
    const box = panel.querySelector('#claude-web-enabled');
    const hint = panel.querySelector('#claude-web-enabled-hint');
    if (!box) return;
    box.checked = enabled;

    const describe = () => {
      hint.textContent = box.checked
        ? ''
        : '已关闭。酒馆恢复原生界面，下面的设置暂时不起作用。';
    };
    describe();

    box.addEventListener('change', async () => {
      const safety = window.__claudeSafety;
      if (safety) {
        if (safety.busy) {
          box.checked = safety.state?.enabled ?? enabled;
          hint.textContent = '安全操作正在进行，请等待当前操作结束。';
          return;
        }
        try { await (box.checked ? safety.enable() : safety.disable()); }
        catch (error) {
          hint.textContent = '操作尚未完成：' + error.message;
          safety.notify(hint.textContent);
        }
        box.checked = safety.state?.enabled ?? enabled;
        return;
      }
      if (!write('enabled', box.checked ? 'on' : 'off')) {
        hint.textContent = '写入失败，设置没保存。';
        box.checked = enabled;
        return;
      }
      /* 直接刷新，不给「刷新生效」按钮。
         总开关和别的设置不一样：开关之间的中间态（样式撤了但 JS 还挂着，
         或者反过来）本身就是坏界面，让用户停在那里没有意义。 */
      if (!box.checked) {
        /* Bug 1：之前这里只做了 teardownLive()（撤运行时样式表 + 清 dataset/CSS
           变量），没有触发 integrated-theme-runtime 里已经存在的
           restorePreviousTheme()。结果是 powerUserSettings、custom_css、主题
           下拉框都还停在 Claude Web 覆盖后的值，刷新完得到「原生主题 +
           Claude Web 设置」的混合状态，得用户手动重新选一次原主题才能恢复
           干净。__claudeIntegratedTheme 是主题运行时暴露到 window 上的实例
           API，destroy({ restore: true }) 会同步：清运行时产物 → 从快照恢复
           powerUserSettings/custom_css/主题下拉框 → 保存 → 才轮到这里刷新。
           它内部有 destroyed 状态保护，重复调用（比如刷新时的 pagehide）
           是安全的。 */
        window.__claudeIntegratedTheme?.destroy?.({ restore: true });
        teardownLive();
      }
      hint.textContent = box.checked ? '正在启用，刷新中…' : '正在关闭，刷新中…';
      if (!box.checked) {
        // A fixed reload delay can expire before the native debounced save.
        // Complete the native save before navigating away from the restored theme.
        try {
          const context = window.SillyTavern?.getContext?.();
          const expected = { theme: context?.powerUserSettings?.theme, css: context?.powerUserSettings?.custom_css };
          const native = await import(new URL('script.js', window.document.baseURI).href);
          if (typeof native.saveSettings !== 'function') throw new Error('Native settings save unavailable');
          await native.saveSettings();
          // Native saveSettings may consume HTTP failures. Verify the saved theme.
          const response = await window.fetch(new URL('api/settings/get', window.document.baseURI).href, {
            method: 'POST', headers: context?.getRequestHeaders?.() ?? { 'Content-Type': 'application/json' }, body: '{}', cache: 'no-store',
          });
          if (!response.ok) throw new Error('Native settings read-back failed');
          const payload = await response.json();
          const saved = typeof payload.settings === 'string' ? JSON.parse(payload.settings) : payload.settings;
          if (typeof expected.theme !== 'string' || saved?.power_user?.theme !== expected.theme || saved?.power_user?.custom_css !== expected.css) throw new Error('Native theme save not confirmed');
        } catch (error) {
          hint.textContent = '主题已恢复，但保存未完成，请稍后刷新。';
          window.toastr?.error?.(hint.textContent);
          console.warn('[Claude Web] Theme restore save failed', error);
          return;
        }
      }
      window.setTimeout(() => window.location.reload(), box.checked ? 150 : 0);
    });
  }

  function mount(host) {
    if (document.getElementById(PANEL_ID)) return;
    const panel = buildPanel();
    host.append(panel);

    document.dispatchEvent(new Event('cw-settings-mounted'));
    mountEnabled(panel);

    const modeSelect = panel.querySelector('#claude-web-mode');
    const modeHint = panel.querySelector('#claude-web-mode-hint');
    const compatibilityMode = read('mode', ['full', 'compat'], 'full') === 'compat';
    modeSelect.value = compatibilityMode ? 'compat' : 'full';
    modeHint.textContent = compatibilityMode
      ? 'Claude Web 保留左侧栏、内容区框架和输入框；当前酒馆美化负责欢迎页、消息、图标、配色与背景。'
      : '使用 Claude Web 的完整界面、结构和配色。';
    modeSelect.addEventListener('change', () => {
      if (!write('mode', modeSelect.value)) {
        modeHint.textContent = '写入失败，运行模式没有改变。';
        modeSelect.value = compatibilityMode ? 'compat' : 'full';
        return;
      }
      modeHint.textContent = '正在切换运行模式…';
      window.setTimeout(() => window.location.reload(), 180);
    });

    const variantSelect = panel.querySelector('#claude-web-variant');
    const layoutSelect = panel.querySelector('#claude-web-layout');
    const hint = panel.querySelector('#claude-web-hint');
    const autoSelect = panel.querySelector('#claude-web-theme-auto');
    const autoTimes = panel.querySelector('#claude-web-auto-times');
    const autoHint = panel.querySelector('#claude-web-auto-hint');
    const dayStartInput = panel.querySelector('#claude-web-day-start');
    const nightStartInput = panel.querySelector('#claude-web-night-start');

    const variant = read('variant', ['day', 'night'], 'day');
    const layout = read('layout', ['auto', 'pc', 'mobile'], 'auto');
    const autoMode = read('theme-auto', ['manual', 'system', 'time'], 'manual');
    fillSelect(variantSelect, VARIANTS, variant);
    fillSelect(layoutSelect, LAYOUTS, layout);
    fillSelect(autoSelect, AUTO_THEME_MODES, autoMode);
    dayStartInput.value = readClock('theme-day-start', '07:00');
    nightStartInput.value = readClock('theme-night-start', '19:00');

    const describe = () => {
      const effective = resolveLayout(layoutSelect.value);
      hint.textContent = `当前生效：${layoutSelect.value === 'auto' ? `自动 → ${effective === 'mobile' ? '手机' : '桌面'}` : (effective === 'mobile' ? '手机' : '桌面')}`;
    };
    describe();

    const applyVariant = nextVariant => {
      variantSelect.value = nextVariant;
      if (!write('variant', nextVariant)) return;
      const ok = applyVariantLive(nextVariant);
      /* 明暗变了，配色也得跟着换到同家族的另一半 —— 否则会出现
         浅色配色配深色样式表。这一步必须和样式表换在同一次操作里。 */
      const api = window.__claudeWebPresets;
      if (api) {
        /* variant 已经写进 localStorage，而 currentScheme() 是现读 localStorage 的，
           所以这里拿到的是新值。（早先它读的是启动时求值的 const，
           导致选了日间界面还是夜间。） */
        api.activateFamily(api.currentFamily());
      }
      /* 「我的配色」日夜各存一套，切明暗等于换了一整组值，取色器要重读。 */
      syncSwatchesRef();
      hint.textContent = ok ? '' : '主题已保存，刷新后生效。';
      if (ok) describe();
      syncPanelPresentationRef();
    };

    variantSelect.addEventListener('change', () => applyVariant(variantSelect.value));

    const systemTheme = window.matchMedia?.('(prefers-color-scheme: dark)');
    const syncAutomaticTheme = () => {
      if (compatibilityMode) {
        /* 明暗在兼容模式下是有意义的：外壳整块是 Claude 的皮肤，
           深色美化配一条亮白侧栏很难看。它只换 compat-<明暗>.css，
           不碰外部美化自己的明暗。按时间自动切仍然关着（那条要动酒馆的主题记录）。 */
        variantSelect.disabled = false;
        autoSelect.disabled = true;
        autoTimes.hidden = true;
        autoHint.textContent = '明暗只切换 Claude 外壳，外部美化的配色不受影响。';
        return;
      }
      const mode = autoSelect.value;
      const automatic = mode !== 'manual';
      variantSelect.disabled = automatic;
      autoTimes.hidden = mode !== 'time';
      if (!automatic) {
        autoHint.textContent = '自动切换已关闭。';
        return;
      }
      const next = resolveAutomaticVariant(
        mode,
        dayStartInput.value || '07:00',
        nightStartInput.value || '19:00',
        variantSelect.value,
      );
      if (next !== variantSelect.value) applyVariant(next);
      autoHint.textContent = mode === 'system'
        ? `跟随系统 · 当前${next === 'night' ? '夜间' : '日间'}`
        : `${dayStartInput.value} 日间 / ${nightStartInput.value} 夜间 · 当前${next === 'night' ? '夜间' : '日间'}`;
      syncPanelPresentationRef();
    };

    autoSelect.addEventListener('change', () => {
      if (!write('theme-auto', autoSelect.value)) return;
      syncAutomaticTheme();
    });
    for (const [input, key] of [
      [dayStartInput, 'theme-day-start'],
      [nightStartInput, 'theme-night-start'],
    ]) {
      input.addEventListener('change', () => {
        if (!write(key, input.value)) return;
        syncAutomaticTheme();
      });
    }
    const onSystemThemeChange = () => {
      if (autoSelect.value === 'system') syncAutomaticTheme();
    };
    if (typeof systemTheme?.addEventListener === 'function') systemTheme.addEventListener('change', onSystemThemeChange);
    else if (typeof systemTheme?.addListener === 'function') systemTheme.addListener(onSystemThemeChange);
    window.setInterval(() => {
      if (autoSelect.value === 'time') syncAutomaticTheme();
    }, 30000);
    syncAutomaticTheme();

    const clawdBox = panel.querySelector('#claude-web-clawd');
    clawdBox.checked = read('clawd', ['on', 'off'], 'on') !== 'off';
    clawdBox.addEventListener('change', () => {
      if (!write('clawd', clawdBox.checked ? 'on' : 'off')) return;
      document.documentElement.dataset.claudeClawd = clawdBox.checked ? 'on' : 'off';
      window.__claudeClawdInteraction?.refresh?.();
      syncPanelPresentationRef();
    });
    const clawdPileBox = panel.querySelector("#claude-web-clawd-pile");
    clawdPileBox.checked = read("clawd-pile", [ "on", "off" ], "on") !== "off";
    clawdPileBox.addEventListener("change", () => {
      if (!write("clawd-pile", clawdPileBox.checked ? "on" : "off")) return;
      document.documentElement.dataset.claudeClawdPile = clawdPileBox.checked ? "on" : "off";
      window.__claudeClawdInteraction?.refresh?.();
    });
    const composerField=document.createElement('div');composerField.className='claude-web-field';
    composerField.innerHTML='<label for="claude-web-composer-lines">输入框高度</label><div class="claude-web-range"><span>行数</span><input id="claude-web-composer-lines" type="range" min="1" step="1"><span id="claude-web-composer-lines-value"></span></div>';
    panel.querySelector('#claude-web-layout').closest('.claude-web-field').after(composerField);
    const composerSlider=composerField.querySelector('input'),composerValue=composerField.querySelector('#claude-web-composer-lines-value');
    const composerMobile=()=>document.documentElement.dataset.claudeLayout==='mobile'||window.innerWidth<=700;
    // resize 很频繁：值没变就不写，免得每次都改属性、换文本节点，带出一轮样式重算。
    const syncComposerSlider=()=>{const phone=composerMobile(),max=phone?6:8;if(composerSlider.max!==String(max))composerSlider.max=String(max);const lines=read('composer-lines-'+(phone?'mobile':'pc'),Array.from({length:max},(_,i)=>String(i+1)),phone?'2':'1');if(composerSlider.value!==lines)composerSlider.value=lines;const label=composerSlider.value+' 行';if(composerValue.textContent!==label)composerValue.textContent=label;};
    composerSlider.addEventListener('input',()=>{const key='composer-lines-'+(composerMobile()?'mobile':'pc');if(!write(key,composerSlider.value))return;composerValue.textContent=composerSlider.value+' 行';window.__claudeOfficialLayout?.refresh?.();});
    window.addEventListener('resize',syncComposerSlider);
    const composerLayoutWatch=new MutationObserver(syncComposerSlider);composerLayoutWatch.observe(document.documentElement,{attributes:true,attributeFilter:['data-claude-layout']});
    syncComposerSlider();
    const sidebarSection=document.createElement('details');sidebarSection.className='claude-web-section';sidebarSection.id='claude-web-section-sidebar';
    sidebarSection.innerHTML='<summary><span>侧栏</span></summary><div class="claude-web-section-body"><button type="button" id="claude-web-edit-sidebar" class="menu_button">编辑侧栏…</button><div class="claude-web-help">新界面的侧栏和扩展页请用这里排序。</div></div>';
    panel.querySelector('#claude-web-section-about').before(sidebarSection);sidebarSection.querySelector('button').addEventListener('click',()=>window.__claudeOfficialLayout?.editLayout?.('rail'));
    const recentsSel = panel.querySelector("#claude-web-recents-size");
    recentsSel.value = read("recents-size", [ "s", "m", "l", "xl" ], "xl");
    recentsSel.addEventListener("change", () => {
      if (!write('recents-size', recentsSel.value)) return;
      document.documentElement.dataset.claudeRecents = recentsSel.value;
    });

    const avatarsBox = panel.querySelector('#claude-web-avatars');
    avatarsBox.checked = read('avatars', ['on', 'off'], 'on') !== 'off';
    avatarsBox.addEventListener('change', () => {
      if (!write('avatars', avatarsBox.checked ? 'on' : 'off')) return;
      document.documentElement.dataset.claudeAvatars = avatarsBox.checked ? 'on' : 'off';
      syncPanelPresentationRef();
    });

    const sideSwipeBox = panel.querySelector('#claude-web-side-swipe');
    sideSwipeBox.checked = read('side-swipe', ['on', 'off'], 'on') !== 'off';
    sideSwipeBox.addEventListener('change', () => {
      if (!write('side-swipe', sideSwipeBox.checked ? 'on' : 'off')) return;
      document.documentElement.dataset.claudeSideSwipe = sideSwipeBox.checked ? 'on' : 'off';
    });

    const fontSelect = panel.querySelector('#claude-web-font');
    const fontCustom = panel.querySelector('#claude-web-font-custom');
    const syncCustomBox = () => { fontCustom.style.display = fontSelect.value === 'custom' ? '' : 'none'; };
    fillSelect(fontSelect, FONTS, read('font', FONT_VALUES, 'follow'));
    try { fontCustom.value = preferencesFor(window).getItem('claude-web:fontCustom') || ''; } catch { /* 无痕 */ }
    syncCustomBox();
    fontSelect.addEventListener('change', () => {
      if (!write('font', fontSelect.value)) return;
      /* 只改一个属性，五个字体变量跟着重算 —— 不用重载页面。 */
      document.documentElement.dataset.claudeFont = fontSelect.value;
      syncCustomBox();
      const hit = FONTS.find(f => f.value === fontSelect.value);
      hint.textContent = '字体已切到「' + (hit ? hit.label : fontSelect.value) + '」。';
    });
    fontCustom.addEventListener('input', () => {
      const v = fontCustom.value.trim();
      try { preferencesFor(window).setItem('claude-web:fontCustom', v); } catch { /* 无痕 */ }
      if (v) document.documentElement.style.setProperty('--cw-font-custom', v);
      else document.documentElement.style.removeProperty('--cw-font-custom');
    });

    const quoteBodyColorBox = panel.querySelector('#claude-web-quote-body-color');
    quoteBodyColorBox.checked = read('quoteBodyColor', ['on', 'off'], 'off') === 'off';
    quoteBodyColorBox.addEventListener('change', () => {
      if (!write('quoteBodyColor', quoteBodyColorBox.checked ? 'off' : 'on')) return;
      document.documentElement.dataset.claudeQuoteBodyColor = quoteBodyColorBox.checked ? 'off' : 'on';
      const variant = document.documentElement.dataset.claudeIntegratedTheme;
      if (variant) window.__claudeIntegratedTheme?.applyVariant?.(variant);
      hint.textContent = quoteBodyColorBox.checked
        ? '引号文字已恢复主题强调色。'
        : '引号文字已固定为正文颜色。';
    });

    layoutSelect.addEventListener('change', () => {
      if (!write('layout', layoutSelect.value)) return;
      hint.textContent = '正在切换布局…';
      syncPanelPresentationRef();
      window.setTimeout(() => window.location.reload(), 120);
    });

    const disclaimerBox = panel.querySelector('#claude-web-ai-disclaimer');
    disclaimerBox.checked = read('ai-disclaimer', ['on', 'off'], 'on') === 'on';
    disclaimerBox.addEventListener('change', () => {
      write('ai-disclaimer', disclaimerBox.checked ? 'on' : 'off');
      window.__claudeOfficialLayout?.refresh();
    });
    const uiStyleSelect = panel.querySelector('#claude-web-ui-style');
    const uiPending = panel.querySelector('#claude-web-ui-style-pending');
    const syncUiPending = () => { const saved = preferencesFor(window).isSaved('claude-web:ui-style'); uiPending.hidden = saved && uiStyleSelect.value === document.documentElement.dataset.claudeUi; uiPending.querySelector('span').textContent = saved ? tr((document.querySelector('#ui_language_select')?.value || navigator.language || 'en').startsWith('zh'), '已保存，刷新页面后生效。请先保存正在编辑的内容。') : RELOAD_STORAGE_HINT; uiPending.querySelector('button').disabled = !saved; };
    panel.querySelector('#claude-web-ui-style-reload').addEventListener('click', () => window.location.reload());
    const syncUiStyleLabels = () => {
      const zh = (document.querySelector('#ui_language_select')?.value || window.localStorage.getItem('language') || navigator.language || 'en').startsWith('zh');
      panel.querySelector('label[for="claude-web-ui-style"]').textContent = tr(zh, '界面样式');
      uiPending.querySelector('span').textContent = tr(zh, '已保存，刷新页面后生效。请先保存正在编辑的内容。');
      uiPending.querySelector('button').textContent = tr(zh, '刷新页面');
      fillSelect(uiStyleSelect, [{value:'web',label:tr(zh,'新版（当前）')},{value:'classic',label:tr(zh,'旧版')}], read('ui-style',['web','classic'],'web'));
      syncUiPending();
    };
    syncUiStyleLabels();
    document.addEventListener('change', e => { if (e.target.id === 'ui_language_select') syncUiStyleLabels(); });
    uiStyleSelect.addEventListener('change', () => {
      if (!write('ui-style', uiStyleSelect.value)) { syncUiStyleLabels(); return; }
      syncUiPending();
    });
    // 前瞻版开关：扩展根目录是正式版，preview/ 是前瞻版；启动时 emergency.js 按 claude-web:preview 分流。
    // __cwPreview 由根目录的 emergency.js 在加载前瞻版之前设好。
    const previewBox = panel.querySelector('#claude-web-preview');
    const previewPending = panel.querySelector('#claude-web-preview-pending');
    const previewRunning = !!globalThis.__cwPreview;
    const syncPreview = () => {
      if (!previewBox.isConnected) return;
      const zh = (document.querySelector('#ui_language_select')?.value || window.localStorage.getItem('language') || navigator.language || 'en').startsWith('zh');
      panel.querySelector('#claude-web-preview-row span').textContent = tr(zh, '前瞻版');
      panel.querySelector('#claude-web-preview-help').textContent = tr(zh, '试用下一版的界面和修复。打开后一律使用新版界面，关掉后回到原来的设置。');
      const saved = preferencesFor(window).isSaved('claude-web:preview');
      previewPending.hidden = saved && previewBox.checked === previewRunning;
      previewPending.querySelector('span').textContent = saved ? tr(zh, '已保存，刷新页面后生效。请先保存正在编辑的内容。') : RELOAD_STORAGE_HINT;
      previewPending.querySelector('button').textContent = tr(zh, '刷新页面');
      previewPending.querySelector('button').disabled = !saved;
      // 前瞻版一律用新版界面；旧版选项留着给关掉前瞻后用，这里只读。
      if (previewRunning) {
        uiStyleSelect.value = 'web'; uiStyleSelect.disabled = true; uiPending.hidden = true;
        const help = panel.querySelector('#claude-web-ui-style-preview') || Object.assign(document.createElement('div'), {id: 'claude-web-ui-style-preview', className: 'claude-web-help'});
        help.textContent = tr(zh, '前瞻版只有新版界面。');
        if (!help.isConnected) uiPending.after(help);
      }
    };
    previewBox.checked = previewRunning || read('preview', ['on', 'off'], 'off') === 'on';
    previewBox.addEventListener('change', () => { write('preview', previewBox.checked ? 'on' : 'off'); syncPreview(); });
    panel.querySelector('#claude-web-preview-reload').addEventListener('click', () => window.location.reload());
    syncPreview();
    document.addEventListener('change', e => { if (e.target.id === 'ui_language_select') syncPreview(); });
    // 测试仓单独安装时没有正式版可切，整栏去掉（外观一节会把子元素重设为可见，hidden 留不住）。
    if (!previewRunning) panel.querySelector('#claude-web-preview-field').remove();
    const motionBox = panel.querySelector('#claude-web-motion');
    const decorationsBox = panel.querySelector('#claude-web-decorations');
    motionBox.checked = read('motion', ['on', 'off'], 'on') !== 'off';
    decorationsBox.checked = read('decorations', ['on', 'off'], 'on') !== 'off';
    motionBox.addEventListener('change', () => {
      if (!write('motion', motionBox.checked ? 'on' : 'off')) return;
      document.documentElement.dataset.claudeMotion = motionBox.checked ? 'on' : 'off';
      syncPanelPresentationRef();
    });
    decorationsBox.addEventListener('change', () => {
      if (!write('decorations', decorationsBox.checked ? 'on' : 'off')) return;
      document.documentElement.dataset.claudeDecorations = decorationsBox.checked ? 'on' : 'off';
      syncPanelPresentationRef();
    });

    const genTimerBox = panel.querySelector('#claude-web-gen-timer');
    genTimerBox.checked = read('genTimer', ['on', 'off'], 'on') !== 'off';
    genTimerBox.addEventListener('change', () => {
      if (!write('genTimer', genTimerBox.checked ? 'on' : 'off')) return;
      document.documentElement.dataset.claudeGenTimer = genTimerBox.checked ? 'on' : 'off';
      syncPanelPresentationRef();
    });

    const bgTransparentBox = panel.querySelector('#claude-web-bg-transparent');
    const bgBlurBox = panel.querySelector('#claude-web-bg-blur');
    bgTransparentBox.checked = read('bgTransparent', ['on', 'off'], 'off') === 'on';
    bgBlurBox.checked = read('bgBlur', ['on', 'off'], 'off') === 'on';
    bgTransparentBox.addEventListener('change', () => {
      if (!write('bgTransparent', bgTransparentBox.checked ? 'on' : 'off')) return;
      document.documentElement.dataset.claudeBgTransparent = bgTransparentBox.checked ? 'on' : 'off';
      // 关掉透传时毛玻璃没有意义（没有可透的背景），一起关掉，
      // 避免出现「毛玻璃开着但背景是纯色」这种看不出效果的死角状态。
      if (!bgTransparentBox.checked && bgBlurBox.checked) {
        bgBlurBox.checked = false;
        write('bgBlur', 'off');
        document.documentElement.dataset.claudeBgBlur = 'off';
      }
      syncPanelPresentationRef();
    });
    bgBlurBox.addEventListener('change', () => {
      if (!write('bgBlur', bgBlurBox.checked ? 'on' : 'off')) return;
      document.documentElement.dataset.claudeBgBlur = bgBlurBox.checked ? 'on' : 'off';
      // 反过来也要联动：单开毛玻璃、不开透传，背景其实还是不透明的纯色，
      // 毛玻璃在纯色上完全看不出效果，等于白开。开毛玻璃时顺手把透传也点上。
      if (bgBlurBox.checked && !bgTransparentBox.checked) {
        bgTransparentBox.checked = true;
        write('bgTransparent', 'on');
        document.documentElement.dataset.claudeBgTransparent = 'on';
      }
      syncPanelPresentationRef();
    });

    const bgBlurOpacitySlider = panel.querySelector('#claude-web-bg-blur-opacity');
    const bgBlurOpacityValue = panel.querySelector('#claude-web-bg-blur-opacity-value');
    const applyBgBlurOpacity = (n) => {
      const clamped = Math.min(60, Math.max(8, Math.round(n)));
      document.documentElement.style.setProperty('--claude-bg-blur-opacity', `${clamped}%`);
      document.documentElement.style.setProperty('--claude-drawer-tint-opacity', `${Math.max(18, clamped)}%`);
      bgBlurOpacityValue.textContent = `${clamped}%`;
      return clamped;
    };
    {
      const initial = readNumber('bgBlurOpacity', 22, 8, 60);
      bgBlurOpacitySlider.value = String(Math.round(initial));
      applyBgBlurOpacity(Number(bgBlurOpacitySlider.value));
    }
    bgBlurOpacitySlider.addEventListener('input', () => {
      const clamped = applyBgBlurOpacity(Number(bgBlurOpacitySlider.value));
      write('bgBlurOpacity', String(clamped));
    });

    /* FR-1 背景图模糊。两根滑杆即使在开关关着的时候也照常写值和写 CSS 变量：
       变量本身不产生任何效果（选择器上有 [data-claude-bg-image-blur="on"] 把着），
       但这样用户可以先调好再打开，而不是开了之后对着默认值现调。 */
    const bgImageBlurBox = panel.querySelector('#claude-web-bg-image-blur');
    bgImageBlurBox.checked = read('bgImageBlur', ['on', 'off'], 'off') !== 'off';
    document.documentElement.dataset.claudeBgImageBlur = bgImageBlurBox.checked ? 'on' : 'off';
    bgImageBlurBox.addEventListener('change', () => {
      if (!write('bgImageBlur', bgImageBlurBox.checked ? 'on' : 'off')) return;
      document.documentElement.dataset.claudeBgImageBlur = bgImageBlurBox.checked ? 'on' : 'off';
      syncPanelPresentationRef();
    });

    const bgImageRadius = panel.querySelector('#claude-web-bg-image-blur-radius');
    const bgImageRadiusValue = panel.querySelector('#claude-web-bg-image-blur-radius-value');
    const applyBgImageRadius = (n) => {
      const clamped = Math.min(32, Math.max(0, Math.round(n)));
      document.documentElement.style.setProperty('--claude-bg-image-blur', `${clamped}px`);
      bgImageRadiusValue.textContent = `${clamped}px`;
      return clamped;
    };
    bgImageRadius.value = String(readNumber('bgImageBlurRadius', 12, 0, 32));
    applyBgImageRadius(Number(bgImageRadius.value));
    bgImageRadius.addEventListener('input', () => {
      write('bgImageBlurRadius', String(applyBgImageRadius(Number(bgImageRadius.value))));
    });

    const bgImageDim = panel.querySelector('#claude-web-bg-image-dim');
    const bgImageDimValue = panel.querySelector('#claude-web-bg-image-dim-value');
    const applyBgImageDim = (n) => {
      const clamped = Math.min(70, Math.max(0, Math.round(n)));
      document.documentElement.style.setProperty('--claude-bg-image-dim', String(clamped / 100));
      bgImageDimValue.textContent = `${clamped}%`;
      return clamped;
    };
    bgImageDim.value = String(readNumber('bgImageDim', 28, 0, 70));
    applyBgImageDim(Number(bgImageDim.value));
    bgImageDim.addEventListener('input', () => {
      write('bgImageDim', String(applyBgImageDim(Number(bgImageDim.value))));
    });

    /* 折叠标题只显示当前状态，不另存一份数据；所有文字都从真实控件现读。
       子项也在这里统一收放，避免 Clawd 和背景区域各养一套
       hidden 判断，后面加框架模式时只需要扩展这一处。 */
    const selectedLabel = select => select?.selectedOptions?.[0]?.textContent?.trim() || '';
    const appearanceSummary = panel.querySelector('#claude-web-summary-appearance');
    const layoutSummary = panel.querySelector('#claude-web-summary-layout');
    const clawdSummary = panel.querySelector('#claude-web-summary-clawd');
    const backgroundSummary = panel.querySelector('#claude-web-summary-background');
    const fullAppearance = panel.querySelector('#claude-web-full-appearance');
    const layoutSection = panel.querySelector('#claude-web-section-layout');
    const backgroundSection = panel.querySelector('#claude-web-section-background');
    const clawdOptions = panel.querySelector('#claude-web-clawd-options');
    const bgBlurOptions = panel.querySelector('#claude-web-bg-blur-options');
    const bgImageOptions = panel.querySelector('#claude-web-bg-image-options');

    function syncPanelPresentation() {
      const presetName = selectedLabel(panel.querySelector('#claude-web-preset')) || 'Claude';
      const variantName = selectedLabel(variantSelect) || (variantSelect.value === 'night' ? '夜间' : '日间');
      appearanceSummary.textContent = compatibilityMode
        ? 'Claude 框架 / 外部内容'
        : `${presetName} / ${variantName}`;

      const layoutName = selectedLabel(layoutSelect) || layoutSelect.value;
      layoutSummary.textContent = `${layoutName}${avatarsBox.checked ? '' : ' / 头像关'}`;

      clawdSummary.textContent = clawdBox.checked
        ? `显示${motionBox.checked ? ' / 动画开' : ' / 动画关'}`
        : '隐藏';

      const backgroundStates = [];
      if (bgTransparentBox.checked) backgroundStates.push('透传');
      if (bgBlurBox.checked) backgroundStates.push('毛玻璃');
      if (bgImageBlurBox.checked) backgroundStates.push('背景图模糊');
      backgroundSummary.textContent = backgroundStates.length ? backgroundStates.join(' + ') : '关闭';

      clawdOptions.hidden = !clawdBox.checked;
      clawdPileBox.disabled=!clawdBox.checked;clawdPileBox.closest("label").style.opacity=clawdBox.checked?"":".45";
      bgBlurOptions.hidden = !bgBlurBox.checked;
      bgImageOptions.hidden = !bgImageBlurBox.checked;
      /* 兼容模式下配色预设和字体都不生效，但「当前明暗」要留着 ——
         它决定加载 compat-day 还是 compat-night。所以不整块隐藏 fullAppearance，
         只隐藏它除明暗以外的子项。 */
      const variantField = variantSelect.closest('.claude-web-field');
      fullAppearance.hidden = false;
      for (const child of fullAppearance.children) {
        child.hidden = compatibilityMode && child !== variantField && child.id !== 'claude-web-ui-style-field';
      }
      layoutSection.hidden = compatibilityMode;
      backgroundSection.hidden = compatibilityMode;
      panel.querySelector('#claude-web-section-components').hidden = compatibilityMode;
    }

    syncPanelPresentationRef = syncPanelPresentation;
    mountPresets(panel);
    syncPanelPresentation();

    /* 构建号写在面板上。ST 加载 index.js 的 <script> 标签不带版本参数，
       浏览器可能给出缓存的旧模块 —— 出现过「推了新版但面板还是旧的」，
       当时没法一眼确认跑的是哪一版。有这行就不用猜了。 */
    const build = panel.querySelector('#claude-web-build');
    build.textContent = typeof CLAUDE_KEYBOARD_BUILD !== 'undefined'
      ? `构建 ${CLAUDE_KEYBOARD_BUILD.id}`
      : '构建号未知';

    const updateButton = panel.querySelector('#claude-web-update');
    const updateHint = panel.querySelector('#claude-web-update-hint');
    updateButton.addEventListener('click', () => {
      void runUpdate(updateButton, updateHint);
    });

    const reinstallButton = panel.querySelector('#claude-web-reinstall');
    reinstallButton.addEventListener('click', () => {
      void runReinstall(reinstallButton, updateHint);
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
