/* Claude Web public 2.0.129. Allowed runtime transplant; exclusions removed before generation. */
(function() {
  try {
    for (const [k, v] of [ [ "mode", "full" ], [ "structure", "rail" ], [ "skin", "classic" ] ]) localStorage.setItem("claude-web:" + k, v);
    for (const k of [ "kbdDiag", "pbImage", "pbImageFit", "pbImagePos" ]) localStorage.removeItem("claude-web:" + k);
  } catch {}
  try {
    const url = new URL(location.href);
    if (url.searchParams.has("claudemode")) {
      url.searchParams.delete("claudemode");
      history.replaceState(history.state, "", url);
    }
  } catch {}
})();

import { installStreamFollow } from "./stream-follow.js?v=2.0.129";

import { installOfficialLayout } from "./official-layout.js?v=2.0.129";

import { buildClawdRig } from "./clawd-rig.js?v=2.0.129";

import { createClawdPile } from "./clawd-pile.js?v=2.0.129";

const CLAUDE_EXTENSION_BASE = new URL(".", import.meta.url).href;

const CLAUDE_THEMES = {
  day: {
    name: "Claude Web - Day 2.0 - Extension",
    blur_strength: 0,
    shadow_color: "rgba(0, 0, 0, 0)",
    shadow_width: 0,
    font_scale: 1,
    fast_ui_mode: !0,
    waifuMode: !1,
    avatar_style: 3,
    chat_display: 0,
    toastr_position: "toast-top-center",
    noShadows: !0,
    chat_width: 55,
    timer_enabled: !1,
    timestamps_enabled: !0,
    timestamp_model_icon: !1,
    mesIDDisplay_enabled: !1,
    hideChatAvatars_enabled: !1,
    message_token_count_enabled: !1,
    expand_message_actions: !1,
    enableZenSliders: "",
    enableLabMode: "",
    hotswap_enabled: !1,
    bogus_folders: !0,
    zoomed_avatar_magnification: !1,
    reduced_motion: !1,
    compact_input_area: !1,
    show_swipe_num_all_messages: !1,
    click_to_edit: !1,
    media_display: "list",
    reasoning_auto_expand: !1,
    main_text_color: "rgba(18,18,18,1)",
    italics_text_color: "rgba(123,121,116,1)",
    underline_text_color: "rgba(198,97,63,1)",
    quote_text_color: "rgba(18,18,18,1)",
    blur_tint_color: "rgba(248,248,246,1)",
    chat_tint_color: "rgba(248,248,246,1)",
    user_mes_blur_tint_color: "rgba(255,255,255,1)",
    bot_mes_blur_tint_color: "rgba(248,248,246,1)",
    border_color: "rgba(31,31,30,0.15)",
    custom_css: ":root {\n  --cl-color-scheme:light;\n  --cl-canvas:#f8f8f6;\n  --cl-surface:#ffffff;\n  --cl-soft:#f4f4f1;\n  --cl-soft-hover:#efeeeb;\n  --cl-line:rgba(31,31,30,.15);\n  --cl-line-strong:rgba(31,31,30,.25);\n  --cl-hero:#373734;\n  --cl-ink:#121212;\n  --cl-muted:#7b7974;\n  --cl-control-muted:#686660;\n  --cl-icon:#0b0b0b;\n  --cl-rail-ink:#0b0b0b;\n  --cl-accent:#d97757;\n  --cl-accent-soft:#f3e0d8;\n  --cl-code:#f0eee6;\n  --cl-em-color:#6c6b66;\n  --cl-code-ink:#633a2e;\n  --cl-send-hover:#c6613f;\n  --cl-selection:#efcfc2;\n  --cl-scrollbar:#c9c5bc;\n  --cl-scrollbar-hover:#aaa59b;\n  --cl-dialog-shadow:0 12px 36px rgba(50,45,35,.12);\n  --cl-composer-shadow:0 10px 30px rgba(43,40,34,.10);\n  --cl-floating-shadow:0 14px 38px rgba(43,40,34,.11);\n  --cl-topbar-surface:rgba(248,248,246,.98);\n  --cl-body-weight:430;\n  --cl-clawd-eye:#000000;\n  --cl-clawd-eye-row-a:#000000;\n  --cl-clawd-eye-row-b:#d97757;\n  --cl-greeting-particle-shadow:39px 0 0 var(--cl-ink),42px 0 0 var(--cl-ink),45px 0 0 var(--cl-ink),45px 3px 0 var(--cl-ink),42px 6px 0 var(--cl-ink),21px 12px 0 var(--cl-ink),27px 12px 0 var(--cl-ink),33px 12px 0 var(--cl-ink),42px 12px 0 var(--cl-ink);\n  --cl-typing-float-animation:clawd-question-float 2.36s cubic-bezier(.37,0,.22,1) infinite;\n  --cl-greeting-particle-animation:clawd-question-float 2.83s cubic-bezier(.37,0,.22,1) .41s infinite;\n}"
  },
  night: {
    name: "Claude Web - Night 2.0 - Extension",
    blur_strength: 0,
    shadow_color: "rgba(0, 0, 0, 0)",
    shadow_width: 0,
    font_scale: 1,
    fast_ui_mode: !0,
    waifuMode: !1,
    avatar_style: 3,
    chat_display: 0,
    toastr_position: "toast-top-center",
    noShadows: !0,
    chat_width: 55,
    timer_enabled: !1,
    timestamps_enabled: !0,
    timestamp_model_icon: !1,
    mesIDDisplay_enabled: !1,
    hideChatAvatars_enabled: !1,
    message_token_count_enabled: !1,
    expand_message_actions: !1,
    enableZenSliders: "",
    enableLabMode: "",
    hotswap_enabled: !1,
    bogus_folders: !0,
    zoomed_avatar_magnification: !1,
    reduced_motion: !1,
    compact_input_area: !1,
    show_swipe_num_all_messages: !1,
    click_to_edit: !1,
    media_display: "list",
    reasoning_auto_expand: !1,
    main_text_color: "rgba(248,248,246,1)",
    italics_text_color: "rgba(151,149,140,1)",
    underline_text_color: "rgba(217,119,87,1)",
    quote_text_color: "rgba(248,248,246,1)",
    blur_tint_color: "rgba(31,31,30,1)",
    chat_tint_color: "rgba(31,31,30,1)",
    user_mes_blur_tint_color: "rgba(44,44,42,1)",
    bot_mes_blur_tint_color: "rgba(31,31,30,1)",
    border_color: "rgba(226,225,218,0.15)",
    custom_css: ":root {\n  --cl-color-scheme:dark;\n  --cl-canvas:#1f1f1e;\n  --cl-surface:#2c2c2a;\n  --cl-soft:#2c2c2a;\n  --cl-soft-hover:#373734;\n  --cl-line:rgba(226,225,218,.15);\n  --cl-line-strong:rgba(226,225,218,.25);\n  --cl-hero:#c3c2b7;\n  --cl-ink:#f8f8f6;\n  --cl-muted:#97958c;\n  --cl-control-muted:#b8b6ae;\n  --cl-icon:#ffffff;\n  --cl-rail-ink:#ffffff;\n  --cl-accent:#d97757;\n  --cl-accent-soft:#3a2a22;\n  --cl-code:#131211;\n  --cl-em-color:#c3c2b7;\n  --cl-code-ink:#e6a58c;\n  --cl-send-hover:#c6613f;\n  --cl-selection:#5a3a2c;\n  --cl-scrollbar:#44423d;\n  --cl-scrollbar-hover:#55534c;\n  --cl-dialog-shadow:0 12px 36px rgba(0,0,0,.55);\n  --cl-composer-shadow:0 12px 34px rgba(0,0,0,.38);\n  --cl-floating-shadow:0 16px 42px rgba(0,0,0,.44);\n  --cl-topbar-surface:rgba(31,31,30,.98);\n  --cl-body-weight:400;\n  --cl-clawd-eye:#000000;\n  --cl-clawd-eye-row-a:#d97757;\n  --cl-clawd-eye-row-b:#000000;\n  --cl-greeting-particle-shadow:18px 0 0 #ef6a73,24px 0 0 #ef6a73,36px 0 0 #ef6a73,42px 0 0 #ef6a73,21px 3px 0 #ef6a73,33px 3px 0 #ef6a73,36px 3px 0 #ef6a73,39px 3px 0 #ef6a73,42px 3px 0 #ef6a73,45px 3px 0 #ef6a73,36px 6px 0 #ef6a73,39px 6px 0 #ef6a73,42px 6px 0 #ef6a73,39px 9px 0 #ef6a73,27px 12px 0 #ef6a73;\n  --cl-typing-float-animation:clawd-heart-float 2.36s cubic-bezier(.37,0,.22,1) infinite;\n  --cl-greeting-particle-animation:clawd-heart-float 2.57s cubic-bezier(.37,0,.22,1) .33s infinite;\n}"
  }
};

function claudeReadSetting(key, allowed, fallback) {
  try {
    const raw = window.localStorage.getItem("claude-web:" + key);
    return allowed.includes(raw) ? raw : fallback;
  } catch {
    return fallback;
  }
}

try {
  const escapeUrl = new URL(location.href);
  const escapeQuery = escapeUrl.searchParams;
  let consumedEscape = false;
  const wanted = [ [ "claudelayout", "layout", [ "auto", "pc", "mobile" ] ], [ "claude", "enabled", [ "on", "off" ] ] ];
  for (const [param, key, allowed] of wanted) {
    const value = escapeQuery.get(param);
    if (value && allowed.includes(value)) {
      window.localStorage.setItem("claude-web:" + key, value);
      escapeQuery.delete(param);
      consumedEscape = true;
    }
  }
  if (consumedEscape) history.replaceState(history.state, "", escapeUrl.pathname + escapeUrl.search + escapeUrl.hash);
} catch {}

let CLAUDE_ENABLED = claudeReadSetting("enabled", [ "on", "off" ], "on") !== "off";
// The independent safety loader owns recovery before the main module.


const CLAUDE_MOTION_ENABLED = claudeReadSetting("motion", [ "on", "off" ], "on") !== "off";

claudeReadSetting("kbdDiag", [ "on", "off" ], "off");

const CLAUDE_DECORATIONS_ENABLED = claudeReadSetting("decorations", [ "on", "off" ], "on") !== "off";

const CLAUDE_GEN_TIMER_ENABLED = claudeReadSetting("genTimer", [ "on", "off" ], "off") !== "off";

const CLAUDE_BG_TRANSPARENT_ENABLED = claudeReadSetting("bgTransparent", [ "on", "off" ], "off") === "on";

const CLAUDE_BG_BLUR_ENABLED = claudeReadSetting("bgBlur", [ "on", "off" ], "off") === "on";

const CLAUDE_QUOTE_BODY_COLOR_ENABLED = claudeReadSetting("quoteBodyColor", [ "on", "off" ], "off") !== "off";

const CLAUDE_BG_BLUR_OPACITY = (() => {
  let raw = null;
  try {
    raw = window.localStorage.getItem("claude-web:bgBlurOpacity");
  } catch {}
  const num = Number(raw);
  if (!Number.isFinite(num)) return 22;
  return Math.min(60, Math.max(8, Math.round(num)));
})();

const CLAUDE_DRAWER_TINT_OPACITY = Math.max(18, CLAUDE_BG_BLUR_OPACITY);

const CLAUDE_NAV_TINT_OPACITY = Math.max(58, CLAUDE_BG_BLUR_OPACITY);

const CLAUDE_BG_IMAGE_BLUR_ENABLED = claudeReadSetting("bgImageBlur", [ "on", "off" ], "off") !== "off";

function claudeReadNumberSetting(key, fallback, min, max) {
  let raw = null;
  try {
    raw = window.localStorage.getItem("claude-web:" + key);
  } catch {}
  const num = Number(raw);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, Math.round(num)));
}

const CLAUDE_BG_IMAGE_BLUR = claudeReadNumberSetting("bgImageBlurRadius", 12, 0, 32);

const CLAUDE_BG_IMAGE_DIM = claudeReadNumberSetting("bgImageDim", 28, 0, 70);

document.documentElement.dataset.claudeMotion = CLAUDE_MOTION_ENABLED ? "on" : "off";

document.documentElement.dataset.claudeMode = "full";

document.documentElement.dataset.claudeDecorations = CLAUDE_DECORATIONS_ENABLED ? "on" : "off";

document.documentElement.dataset.claudeGenTimer = CLAUDE_GEN_TIMER_ENABLED ? "on" : "off";

document.documentElement.dataset.claudeBgTransparent = CLAUDE_BG_TRANSPARENT_ENABLED ? "on" : "off";

document.documentElement.dataset.claudeBgBlur = CLAUDE_BG_BLUR_ENABLED ? "on" : "off";

document.documentElement.dataset.claudeQuoteBodyColor = CLAUDE_QUOTE_BODY_COLOR_ENABLED ? "on" : "off";

document.documentElement.style.setProperty("--claude-bg-blur-opacity", `${CLAUDE_BG_BLUR_OPACITY}%`);

document.documentElement.style.setProperty("--claude-drawer-tint-opacity", `${CLAUDE_DRAWER_TINT_OPACITY}%`);

document.documentElement.style.setProperty("--claude-glass-base", "var(--cw-surface-page)");

document.documentElement.style.setProperty("--claude-nav-tint-opacity", `${CLAUDE_NAV_TINT_OPACITY}%`);

const CLAUDE_FONT = claudeReadSetting("font", [ "follow", "songti", "heiti", "system", "device", "custom", "native" ], "follow");

document.documentElement.dataset.claudeFont = CLAUDE_FONT;

document.documentElement.dataset.claudeStructure = "rail";

document.documentElement.dataset.claudeClawd = claudeReadSetting("clawd", [ "on", "off" ], "on");

document.documentElement.dataset.claudeAvatars = claudeReadSetting("avatars", [ "on", "off" ], "on");

document.documentElement.dataset.claudeRecents = claudeReadSetting("recents-size", [ "s", "m", "l", "xl" ], "xl");

document.documentElement.dataset.claudeSideSwipe = claudeReadSetting("side-swipe", [ "on", "off" ], "on");

document.documentElement.dataset.claudeSkin = "classic";

try {
  const cf = window.localStorage.getItem("claude-web:fontCustom");
  cf && document.documentElement.style.setProperty("--cw-font-custom", cf);
} catch {}

document.documentElement.dataset.claudeBgImageBlur = CLAUDE_BG_IMAGE_BLUR_ENABLED ? "on" : "off";

document.documentElement.style.setProperty("--claude-bg-image-blur", `${CLAUDE_BG_IMAGE_BLUR}px`);

document.documentElement.style.setProperty("--claude-bg-image-dim", String(CLAUDE_BG_IMAGE_DIM / 100));

function claudeReadClockSetting(key, fallback) {
  try {
    const value = window.localStorage.getItem("claude-web:" + key);
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(value || "") ? value : fallback;
  } catch {
    return fallback;
  }
}

function claudeClockMinutes(value) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

const CLAUDE_THEME_VARIANT = function() {
  const manual = claudeReadSetting("variant", [ "day", "night" ], "day");
  const mode = claudeReadSetting("theme-auto", [ "manual", "system", "time" ], "manual");
  if (mode === "system") try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "day";
  } catch {
    return manual;
  }
  if (mode === "time") {
    const dayStart = claudeClockMinutes(claudeReadClockSetting("theme-day-start", "07:00"));
    const nightStart = claudeClockMinutes(claudeReadClockSetting("theme-night-start", "19:00"));
    if (dayStart === nightStart) return manual;
    const now = new Date;
    const minute = now.getHours() * 60 + now.getMinutes();
    const isDay = dayStart < nightStart ? minute >= dayStart && minute < nightStart : minute >= dayStart || minute < nightStart;
    return isDay ? "day" : "night";
  }
  return manual;
}();

if (claudeReadSetting("theme-auto", [ "manual", "system", "time" ], "manual") !== "manual") try {
  window.localStorage.setItem("claude-web:variant", CLAUDE_THEME_VARIANT);
} catch {}

const CLAUDE_LAYOUT_CHOICE = claudeReadSetting("layout", [ "auto", "pc", "mobile" ], "auto");

function claudeDetectPhone() {
  const ua = window.navigator?.userAgent || "";
  if (/iPhone|iPod|Android.+Mobile|Windows Phone/i.test(ua)) return !0;
  const shortSide = Math.min(window.screen?.width || 0, window.screen?.height || 0);
  if (/Android/i.test(ua)) return shortSide === 0 || shortSide <= 700;
  try {
    const touchFirst = window.matchMedia("(pointer:coarse)").matches && !window.matchMedia("(hover:hover)").matches;
    return touchFirst && shortSide > 0 && shortSide <= 700;
  } catch {
    return !1;
  }
}

const CLAUDE_IS_PHONE = claudeDetectPhone();

const CLAUDE_LAYOUT = CLAUDE_LAYOUT_CHOICE !== "auto" ? CLAUDE_LAYOUT_CHOICE : CLAUDE_IS_PHONE || function() {
  try {
    return window.matchMedia("(max-width:700px)").matches;
  } catch {
    return !1;
  }
}() ? "mobile" : "pc";

document.documentElement.dataset.claudeLayout = CLAUDE_LAYOUT;

document.documentElement.dataset.claudeMode = "full";

if (CLAUDE_ENABLED && CLAUDE_LAYOUT === "mobile" && (CLAUDE_IS_PHONE || CLAUDE_LAYOUT_CHOICE === "mobile")) {
  const PHONE_WIDTH = /\(\s*max-width\s*:\s*700px\s*\)/g;
  const WIDE_WIDTH = /\(\s*min-width\s*:\s*701px\s*\)/g;
  const pinned = new WeakSet;
  const ours = sheet => {
    const node = sheet.ownerNode;
    if (!node) return !1;
    if (node.tagName === "LINK") return String(node.href || "").startsWith(CLAUDE_EXTENSION_BASE);
    return /^(claude|clawd)/i.test(node.id || "");
  };
  const pinRules = list => {
    for (const rule of list) {
      const media = rule.media;
      if (media && /70[01]px/.test(media.mediaText)) {
        const next = media.mediaText.replace(PHONE_WIDTH, "(min-width: 0px)").replace(WIDE_WIDTH, "(min-width: 99999px)");
        next !== media.mediaText && (media.mediaText = next);
      }
      rule.cssRules && pinRules(rule.cssRules);
    }
  };
  const pinPhoneMedia = () => {
    for (const sheet of document.styleSheets) {
      if (pinned.has(sheet) || !ours(sheet)) continue;
      let rules;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      pinRules(rules);
      pinned.add(sheet);
    }
  };
  pinPhoneMedia();
  document.addEventListener("load", event => {
    event.target?.tagName === "LINK" && pinPhoneMedia();
  }, !0);
  new MutationObserver(pinPhoneMedia).observe(document.head, {
    childList: !0,
    subtree: !0,
    characterData: !0
  });
  document.body ? new MutationObserver(pinPhoneMedia).observe(document.body, {
    childList: !0
  }) : document.addEventListener("DOMContentLoaded", () => new MutationObserver(pinPhoneMedia).observe(document.body, {
    childList: !0
  }), {
    once: !0
  });
}

if (CLAUDE_ENABLED && CLAUDE_LAYOUT_CHOICE === "auto" && !CLAUDE_IS_PHONE && window.matchMedia) {
  const layoutMedia = window.matchMedia("(max-width:700px)");
  let layoutReloadTimer = 0;
  const syncAutoLayout = () => {
    window.clearTimeout(layoutReloadTimer);
    layoutReloadTimer = window.setTimeout(() => {
      const nextLayout = layoutMedia.matches ? "mobile" : "pc";
      nextLayout !== CLAUDE_LAYOUT && window.location.reload();
    }, 180);
  };
  typeof layoutMedia.addEventListener === "function" ? layoutMedia.addEventListener("change", syncAutoLayout) : typeof layoutMedia.addListener === "function" && layoutMedia.addListener(syncAutoLayout);
}

const CLAUDE_FEATURES = {
  rail: !0,
  welcome: !0,
  mobile: CLAUDE_LAYOUT === "mobile"
};

const CLAUDE_KEYBOARD_BUILD = {
  id: "2.0.129-public-full-" + CLAUDE_THEME_VARIANT + "-" + CLAUDE_LAYOUT + "-ext",
  mode: "full"
};

const CLAUDE_THEME = CLAUDE_THEMES[CLAUDE_THEME_VARIANT];

const CLAUDE_STYLE_URL = new URL("styles/" + CLAUDE_THEME_VARIANT + "-" + CLAUDE_LAYOUT + ".css", CLAUDE_EXTENSION_BASE);

CLAUDE_STYLE_URL.searchParams.set("v", CLAUDE_KEYBOARD_BUILD.id);

const CLAUDE_STYLE_HREF = CLAUDE_STYLE_URL.href;

const officialStyle = document.createElement("link");

officialStyle.rel = "stylesheet";

officialStyle.href = new URL("styles/official-layout.css?v=2.0.129", import.meta.url).href;

document.documentElement.dataset.claudeEnabled = CLAUDE_ENABLED ? 'on' : 'off';
if (CLAUDE_ENABLED) document.head.append(officialStyle);
const startOfficialLayout = () => {
  if (!CLAUDE_ENABLED) return;
  document.head.append(officialStyle);
  window.__claudeOfficialLayout?.destroy();
  window.__claudeOfficialLayout = installOfficialLayout(window);
};
if (document.readyState === 'complete') window.setTimeout(startOfficialLayout, 0);
else window.addEventListener('load', startOfficialLayout, { once: true });

console.info("[Claude Web] 扩展形态启动：" + CLAUDE_THEME_VARIANT + " / " + CLAUDE_LAYOUT + "（在酒馆「扩展」面板的 Claude Web 里可切换）");

if (CLAUDE_ENABLED) {
  (() => {
    "use strict";
    const root = document.documentElement;
    const sync = () => {
      const pm = document.getElementById("completion_prompt_manager_popup");
      const holder = document.getElementById("top-settings-holder");
      root.toggleAttribute("data-claude-pm-open", !!pm?.classList.contains("openDrawer"));
      root.toggleAttribute("data-claude-top-drawer-open", !!holder?.querySelector(":scope > .drawer > .drawer-content.openDrawer"));
      root.toggleAttribute("data-claude-rail-reordered", !!holder?.querySelector(':scope > [style*="order"]'));
    };
    const install = () => {
      const observer = new MutationObserver(records => {
        const pm = document.getElementById("completion_prompt_manager_popup");
        const holder = document.getElementById("top-settings-holder");
        records.some(r => r.target === pm || r.target.parentElement === holder || r.target.parentElement?.parentElement === holder) && sync();
      });
      const pm = document.getElementById("completion_prompt_manager_popup");
      const holder = document.getElementById("top-settings-holder");
      pm && observer.observe(pm, {
        attributes: !0,
        attributeFilter: [ "class" ]
      });
      holder && observer.observe(holder, {
        attributes: !0,
        attributeFilter: [ "class", "style" ],
        subtree: !0
      });
      sync();
    };
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", install, {
      once: !0
    }) : install();
  })();
  (() => {
    "use strict";
    const CORE_KEYS = [ "--cw-paper-0", "--cw-paper-1", "--cw-paper-2", "--cw-paper-3", "--cw-ink-0", "--cw-ink-1", "--cw-ink-2", "--cw-ink-3", "--cw-clay" ];
    const EXTRA_KEYS = [ "--cw-line", "--cw-line-strong", "--cw-hero", "--cw-icon", "--cw-clay-soft", "--cw-clay-strong", "--cw-code-surface", "--cw-code-ink", "--cw-em", "--cw-selection", "--cw-scrollbar", "--cw-scrollbar-hover", "--cw-shadow-dialog", "--cw-shadow-composer", "--cw-shadow-floating", "--cw-topbar-surface", "--cw-body-weight", "--cw-color-scheme", "--cw-grid-opacity", "--cw-grid-step", "--cw-radius-scale", "--cw-radius-circle", "--cw-skin-serif", "--cw-skin-sans", "--cw-font-custom" ];
    const ALLOWED = new Set([ ...CORE_KEYS, ...EXTRA_KEYS ]);
    const WARM_PAPER = {
      id: "warm-paper",
      name: "暖纸",
      scheme: "light",
      core: {
        "--cw-paper-0": "#f4f0e6",
        "--cw-paper-1": "#efeadf",
        "--cw-paper-2": "#e9e3d5",
        "--cw-paper-3": "#e4ddcc",
        "--cw-ink-0": "#232219",
        "--cw-ink-1": "#6e6857",
        "--cw-ink-2": "#9b9280",
        "--cw-ink-3": "#d8cfbb",
        "--cw-clay": "#c8623c"
      }
    };
    const INK = {
      id: "ink",
      name: "墨",
      scheme: "dark",
      core: {
        "--cw-paper-0": "#1c1b19",
        "--cw-paper-1": "#232220",
        "--cw-paper-2": "#2a2825",
        "--cw-paper-3": "#333029",
        "--cw-ink-0": "#ede9df",
        "--cw-ink-1": "#a8a192",
        "--cw-ink-2": "#8a8375",
        "--cw-ink-3": "#3b372f",
        "--cw-clay": "#d97757"
      }
    };
    const ANTHROPIC_LIGHT = {
      id: "anthropic-light",
      name: "官网 · 日间",
      scheme: "light",
      core: {
        "--cw-paper-0": "#faf9f5",
        "--cw-paper-1": "#ffffff",
        "--cw-paper-2": "#f0eee6",
        "--cw-paper-3": "#e8e6dc",
        "--cw-ink-0": "#141413",
        "--cw-ink-1": "#5e5d59",
        "--cw-ink-2": "#87867f",
        "--cw-ink-3": "#d1cfc5",
        "--cw-clay": "#d97757"
      },
      extra: {
        "--cw-line": "rgba(20,20,19,.10)",
        "--cw-line-strong": "rgba(20,20,19,.20)",
        "--cw-clay-strong": "#c6613f"
      }
    };
    const ANTHROPIC_DARK = {
      id: "anthropic-dark",
      name: "官网 · 夜间",
      scheme: "dark",
      core: {
        "--cw-paper-0": "#141413",
        "--cw-paper-1": "#1f1f1e",
        "--cw-paper-2": "#262625",
        "--cw-paper-3": "#333230",
        "--cw-ink-0": "#faf9f5",
        "--cw-ink-1": "#d1cfc5",
        "--cw-ink-2": "#b0aea5",
        "--cw-ink-3": "#3d3d3a",
        "--cw-clay": "#d97757"
      },
      extra: {
        "--cw-line": "rgba(250,249,245,.10)",
        "--cw-line-strong": "rgba(250,249,245,.20)",
        "--cw-clay-strong": "#c6613f"
      }
    };
    const FAMILIES = [ {
      id: "anthropic",
      name: "官网",
      light: ANTHROPIC_LIGHT,
      dark: ANTHROPIC_DARK
    }, {
      id: "paper",
      name: "暖纸",
      light: WARM_PAPER,
      dark: INK
    } ];
    const BUILT_IN = [ ANTHROPIC_LIGHT, ANTHROPIC_DARK, WARM_PAPER, INK ];
    function familyOf(presetId) {
      return FAMILIES.find(f => f.light.id === presetId || f.dark.id === presetId) ?? FAMILIES[0];
    }
    function currentScheme() {
      let variant = null;
      try {
        variant = window.localStorage.getItem("claude-web:variant");
      } catch {
        variant = null;
      }
      variant !== "day" && variant !== "night" && (variant = CLAUDE_THEME_VARIANT);
      return variant === "night" ? "dark" : "light";
    }
    function derive(preset) {
      const core = preset.core;
      const dark = preset.scheme === "dark";
      const ink = core["--cw-ink-0"];
      const clay = core["--cw-clay"];
      return {
        "--cw-color-scheme": dark ? "dark" : "light",
        "--cw-body-weight": dark ? "400" : "430",
        "--cw-line": `color-mix(in srgb, ${ink} 15%, transparent)`,
        "--cw-line-strong": `color-mix(in srgb, ${ink} 25%, transparent)`,
        "--cw-hero": `color-mix(in srgb, ${ink} 84%, ${core["--cw-paper-0"]})`,
        "--cw-icon": ink,
        "--cw-clay-soft": `color-mix(in srgb, ${clay} ${dark ? "22%" : "18%"}, ${core["--cw-paper-0"]})`,
        "--cw-clay-strong": `color-mix(in srgb, ${clay} 82%, #000)`,
        "--cw-code-surface": core["--cw-paper-2"],
        "--cw-code-ink": `color-mix(in srgb, ${clay} 70%, ${ink})`,
        "--cw-em": core["--cw-ink-1"],
        "--cw-selection": `color-mix(in srgb, ${clay} 34%, ${core["--cw-paper-0"]})`,
        "--cw-scrollbar": core["--cw-ink-3"],
        "--cw-scrollbar-hover": core["--cw-ink-2"],
        "--cw-shadow-dialog": dark ? "0 12px 36px rgba(0,0,0,.55)" : "0 12px 36px rgba(50,45,35,.12)",
        "--cw-shadow-composer": dark ? "0 12px 34px rgba(0,0,0,.38)" : "0 10px 30px rgba(43,40,34,.10)",
        "--cw-shadow-floating": dark ? "0 16px 42px rgba(0,0,0,.44)" : "0 14px 38px rgba(43,40,34,.11)",
        "--cw-topbar-surface": core["--cw-paper-0"],
        "--cw-grid-opacity": dark ? ".05" : ".075",
        "--cw-grid-step": dark ? "38px" : "34px"
      };
    }
    function resolve(preset) {
      return {
        ...derive(preset),
        ...preset.core,
        ...preset.extra ?? {}
      };
    }
    function readJson(key) {
      try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    }
    function currentPresetId() {
      try {
        return window.localStorage.getItem("claude-web:preset") || "";
      } catch {
        return "";
      }
    }
    function defaultPresetId() {
      return FAMILIES[0][currentScheme()].id;
    }
    function currentFamilyId() {
      let stored = null;
      try {
        stored = window.localStorage.getItem("claude-web:family");
      } catch {}
      if (stored === "custom") return stored;
      return FAMILIES.some(f => f.id === stored) ? stored : FAMILIES[0].id;
    }
    function writeJson(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {}
    }
    function customStore() {
      const raw = readJson("claude-web:custom");
      if (!raw || typeof raw !== "object") return {
        light: {},
        dark: {}
      };
      if (raw.light || raw.dark) return {
        light: raw.light && typeof raw.light === "object" ? raw.light : {},
        dark: raw.dark && typeof raw.dark === "object" ? raw.dark : {}
      };
      const legacy = {};
      for (const [key, value] of Object.entries(raw)) ALLOWED.has(key) && typeof value === "string" && (legacy[key] = value);
      const migrated = {
        light: {},
        dark: {}
      };
      migrated[currentScheme()] = legacy;
      return migrated;
    }
    function baseFamily() {
      let id = null;
      try {
        id = window.localStorage.getItem("claude-web:custom-base");
      } catch {
        id = null;
      }
      return FAMILIES.find(item => item.id === id) ?? FAMILIES[0];
    }
    function customPreset(scheme) {
      const half = customStore()[scheme] ?? {};
      const base = baseFamily()[scheme === "dark" ? "dark" : "light"];
      const core = {};
      for (const key of CORE_KEYS) core[key] = half[key] ?? base.core[key];
      const extra = {};
      for (const [key, value] of Object.entries(half)) EXTRA_KEYS.includes(key) && (extra[key] = value);
      return {
        id: "custom",
        name: "我的配色",
        scheme: scheme,
        core: core,
        extra: extra
      };
    }
    function activateFamily(familyId, {persist: persist = !0} = {}) {
      const scheme = currentScheme();
      if (familyId === "custom") {
        if (persist) try {
          window.localStorage.setItem("claude-web:family", "custom");
        } catch {}
        const preset = customPreset(scheme);
        apply(resolve(preset));
        return preset;
      }
      const family = FAMILIES.find(item => item.id === familyId) ?? FAMILIES[0];
      if (persist) try {
        window.localStorage.setItem("claude-web:family", family.id);
        window.localStorage.setItem("claude-web:custom-base", family.id);
      } catch {}
      return activate(family[scheme].id, {
        persist: !1
      });
    }
    function findPreset(id) {
      return BUILT_IN.find(preset => preset.id === id) ?? null;
    }
    function apply(tokens, id = "custom") {
      const root = document.documentElement;
      root.dataset.claudePalette = id;
      for (const [key, value] of Object.entries(tokens)) {
        if (!ALLOWED.has(key)) continue;
        root.style.setProperty(key, String(value));
      }
    }
    function activate(id, {persist: persist = !0} = {}) {
      if (id === "custom") return activateFamily("custom", {
        persist: persist
      });
      const preset = findPreset(id) ?? findPreset(defaultPresetId());
      if (!preset) return null;
      apply(resolve(preset), preset.id);
      if (persist) try {
        window.localStorage.setItem("claude-web:preset", preset.id);
      } catch {}
      return preset;
    }
    activateFamily(currentFamilyId(), {
      persist: !1
    });
    window.__claudeWebPresets = {
      families: function() {
        return [ ...FAMILIES.map(({id: id, name: name}) => ({
          id: id,
          name: name
        })), {
          id: "custom",
          name: "我的配色"
        } ];
      },
      currentFamily: currentFamilyId,
      activateFamily: activateFamily,
      list: () => BUILT_IN.map(({id: id, name: name, scheme: scheme}) => ({
        id: id,
        name: name,
        scheme: scheme
      })),
      current: () => currentPresetId() || defaultPresetId(),
      activate: activate,
      exportCurrent: function() {
        const scheme = currentScheme();
        const preset = currentFamilyId() === "custom" ? customPreset(scheme) : findPreset(familyOf(currentPresetId())[scheme].id) ?? findPreset(defaultPresetId());
        return {
          id: `${preset.id}-export`,
          name: preset.name,
          scheme: preset.scheme,
          core: Object.fromEntries(CORE_KEYS.map(key => [ key, preset.core[key] ]).filter(([, value]) => value)),
          extra: {
            ...preset.extra ?? {}
          }
        };
      },
      importPreset: function(raw) {
        const data = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (!data || typeof data !== "object") throw new Error("预设文件不是一个对象。");
        const source = {
          ...data.core ?? {},
          ...data.extra ?? {}
        };
        const clean = {};
        const rejected = [];
        for (const [key, value] of Object.entries(source)) ALLOWED.has(key) && typeof value === "string" ? clean[key] = value : rejected.push(key);
        if (!Object.keys(clean).length) throw new Error("预设里没有一个可用的令牌。");
        const scheme = data.scheme === "dark" || data.scheme === "light" ? data.scheme : currentScheme();
        const store = customStore();
        store[scheme] = {
          ...customPreset(scheme).core,
          ...clean
        };
        writeJson("claude-web:custom", store);
        activateFamily("custom");
        return {
          applied: Object.keys(clean).length,
          rejected: rejected,
          scheme: scheme
        };
      },
      clearCustom: function() {
        try {
          window.localStorage.removeItem("claude-web:custom");
        } catch {}
        return activateFamily(baseFamily().id);
      },
      coreKeys: () => [ ...CORE_KEYS ],
      customId: () => "custom",
      customCore: function() {
        return {
          ...customPreset(currentScheme()).core
        };
      },
      setCustomColor: function(key, value) {
        if (!ALLOWED.has(key) || typeof value !== "string") return null;
        const scheme = currentScheme();
        const store = customStore();
        store[scheme] = {
          ...customPreset(scheme).core,
          ...store[scheme] ?? {},
          [key]: value
        };
        writeJson("claude-web:custom", store);
        if (currentFamilyId() !== "custom") return activateFamily("custom");
        apply(resolve(customPreset(scheme)));
        return customPreset(scheme);
      }
    };
  })();
  (() => {
    "use strict";
    const hostWindow = window;
    const hostDocument = hostWindow.document;
    const INSTANCE_KEY = "__claudeIntegratedTheme";
    const STYLE_ID = "claude-integrated-theme-live-style";
    const OPTION_CLASS = "claude-integrated-theme-option";
    const THEME_NAME = CLAUDE_THEME.name;
    const LIVE_CSS = typeof CLAUDE_LIVE_CSS !== "undefined" ? CLAUDE_LIVE_CSS : CLAUDE_THEME.custom_css;
    const THEME_VALUES = Object.fromEntries(Object.entries(CLAUDE_THEME).filter(([key]) => key !== "name"));
    const RESTORE_KEY = "claude-integrated-theme-restore:v2";
    const WATCHDOG_KEY = "__claudeIntegratedThemeWatchdog";
    const HOST_DELETE_MODE_SELECTOR_MARKS = [ "body.documentstyle", "#chat", ".last_mes:has(", ".del_checkbox[style", ".mes_text" ];
    const INSTANCE_TOKEN = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    let destroyed = !1;
    let restoreResult = null;
    let hostPageUnloading = !1;
    let hostPageHideConfirmed = !1, hostUnloadResetTimer = 0;
    let retryTimer = 0;
    let runnerRemovalTimer = 0;
    let runnerPresenceObserver = null;
    let neutralizedHostRules = [];
    const runnerFrame = window.frameElement;
    hostWindow[INSTANCE_KEY]?.destroy?.({
      restore: !1
    });
    function getContext() {
      const bridge = hostWindow.SillyTavern ?? (typeof SillyTavern !== "undefined" ? SillyTavern : null);
      return typeof bridge?.getContext === "function" ? bridge.getContext() : bridge;
    }
    function isClaudeThemeName(value) {
      return typeof value === "string" && (value === THEME_NAME || value.startsWith("Claude Web ·"));
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
      const snapshot = {
        theme: settings.theme ?? ""
      };
      for (const key of Object.keys(THEME_VALUES)) snapshot[key] = settings[key];
      try {
        hostWindow.localStorage.setItem(RESTORE_KEY, JSON.stringify(snapshot));
      } catch {}
    }
    function installLiveStyle() {
      const href = CLAUDE_STYLE_HREF;
      const wanted = href ? "LINK" : "STYLE";
      let node = hostDocument.getElementById(STYLE_ID);
      if (node && node.tagName !== wanted) {
        node.remove();
        node = null;
      }
      if (!node) {
        node = hostDocument.createElement(href ? "link" : "style");
        node.id = STYLE_ID;
        href && (node.rel = "stylesheet");
        hostDocument.head.append(node);
      }
      href ? node.getAttribute("href") !== href && node.setAttribute("href", href) : node.textContent = LIVE_CSS;
      hostDocument.documentElement.dataset.claudeIntegratedTheme = CLAUDE_THEME_VARIANT;
    }
    function isHostDeleteModeRule(rule, source) {
      let pathname = "";
      try {
        pathname = new URL(source, hostDocument.baseURI).pathname;
      } catch {
        return !1;
      }
      if (!pathname.endsWith("/css/toggle-dependent.css")) return !1;
      const selector = typeof rule?.selectorText === "string" ? rule.selectorText : (rule?.cssText || "").split("{")[0];
      return HOST_DELETE_MODE_SELECTOR_MARKS.every(mark => selector.includes(mark));
    }
    function collectStyleAttributeRules(parent, source, removed) {
      let rules;
      try {
        rules = parent.cssRules;
      } catch {
        return;
      }
      if (!rules) return;
      for (let index = rules.length - 1; index >= 0; index -= 1) {
        const rule = rules[index];
        if (isHostDeleteModeRule(rule, source)) {
          const cssText = rule.cssText;
          try {
            parent.deleteRule(index);
            removed.push({
              parent: parent,
              index: index,
              cssText: cssText,
              source: source
            });
          } catch {}
          continue;
        }
        let childRules = null;
        try {
          childRules = rule.cssRules;
        } catch {
          childRules = null;
        }
        childRules?.length && collectStyleAttributeRules(rule, source, removed);
      }
    }
    function neutralizeStyleAttributeRules() {
      const removed = [];
      for (const sheet of hostDocument.styleSheets) collectStyleAttributeRules(sheet, sheet.href || "<style>", removed);
      if (!removed.length) return 0;
      neutralizedHostRules.push(...removed);
      console.info("[Claude Web] 已中和 " + removed.length + " 条 ST 核心删除模式高开销选择器：", removed.map(entry => ({
        source: entry.source,
        rule: entry.cssText
      })));
      return removed.length;
    }
    function restoreStyleAttributeRules() {
      for (const entry of [ ...neutralizedHostRules ].reverse()) try {
        entry.parent.insertRule(entry.cssText, entry.index);
      } catch {}
      neutralizedHostRules = [];
    }
    function valuesMatch(left, right) {
      return JSON.stringify(left) === JSON.stringify(right);
    }
    function applyCssVariables(settings) {
      const root = hostDocument.documentElement.style;
      Object.entries({
        main_text_color: "--SmartThemeBodyColor",
        italics_text_color: "--SmartThemeEmColor",
        underline_text_color: "--SmartThemeUnderlineColor",
        quote_text_color: "--SmartThemeQuoteColor",
        blur_tint_color: "--SmartThemeBlurTintColor",
        chat_tint_color: "--SmartThemeChatTintColor",
        user_mes_blur_tint_color: "--SmartThemeUserMesBlurTintColor",
        bot_mes_blur_tint_color: "--SmartThemeBotMesBlurTintColor",
        shadow_color: "--SmartThemeShadowColor",
        border_color: "--SmartThemeBorderColor"
      }).forEach(([property, variable]) => {
        settings[property] !== void 0 && root.setProperty(variable, settings[property]);
      });
      root.setProperty("--blurStrength", `${Number(settings.blur_strength) || 0}px`);
      root.setProperty("--shadowWidth", `${Number(settings.shadow_width) || 0}px`);
      root.setProperty("--fontScale", String(Number(settings.font_scale) || 1));
      const chatWidth = `${Number(settings.chat_width) || 50}vw`;
      root.setProperty("--chatWidth", chatWidth);
      root.setProperty("--sheldWidth", chatWidth);
    }
    function applyUiState(settings) {
      const body = hostDocument.body;
      const classes = {
        "no-blur": settings.fast_ui_mode,
        waifuMode: settings.waifuMode,
        noShadows: settings.noShadows,
        "no-timer": !settings.timer_enabled,
        "no-timestamps": !settings.timestamps_enabled,
        "no-modelIcons": !settings.timestamp_model_icon,
        "no-mesIDDisplay": !settings.mesIDDisplay_enabled,
        hideChatAvatars: settings.hideChatAvatars_enabled,
        "no-tokenCount": !settings.message_token_count_enabled,
        expandMessageActions: settings.expand_message_actions,
        enableZenSliders: settings.enableZenSliders,
        enableLabMode: settings.enableLabMode,
        "no-hotswap": !settings.hotswap_enabled,
        "reduced-motion": settings.reduced_motion,
        swipeAllMessages: settings.show_swipe_num_all_messages
      };
      Object.entries(classes).forEach(([className, enabled]) => {
        body.classList.toggle(className, Boolean(enabled));
      });
      const avatarStyle = Number(settings.avatar_style);
      body.classList.toggle("big-avatars", avatarStyle === 1);
      body.classList.toggle("square-avatars", avatarStyle === 2);
      body.classList.toggle("rounded-avatars", avatarStyle === 3);
      body.classList.remove("bubblechat", "documentstyle");
      Number(settings.chat_display) === 1 && body.classList.add("bubblechat");
      Number(settings.chat_display) === 2 && body.classList.add("documentstyle");
      hostDocument.querySelector("#send_form")?.classList.toggle("compact", Boolean(settings.compact_input_area));
    }
    function setControl(selector, value, checked = !1) {
      const element = hostDocument.querySelector(selector);
      if (!element) return;
      checked ? element.checked = Boolean(value) : element.value = String(value);
    }
    function findThemeSelect(previousName) {
      const direct = hostDocument.querySelector("#themes, #theme_select, #theme-select, #ui_theme, #ui-theme");
      if (direct instanceof hostWindow.HTMLSelectElement) return direct;
      return [ ...hostDocument.querySelectorAll("select") ].find(select => {
        const options = [ ...select.options ];
        return options.some(option => option.value === previousName || /Azure/i.test(option.textContent ?? ""));
      }) ?? null;
    }
    function syncControls(settings, previousName, installThemeOption = !0) {
      const controls = {
        "#blur_strength": settings.blur_strength,
        "#shadow_width": settings.shadow_width,
        "#font_scale": settings.font_scale,
        "#chat_width": settings.chat_width,
        "#avatar_style": settings.avatar_style,
        "#chat_display": settings.chat_display,
        "#toastr_position": settings.toastr_position,
        "#media_display": settings.media_display
      };
      Object.entries(controls).forEach(([selector, value]) => setControl(selector, value));
      const checks = {
        "#fast_ui_mode": settings.fast_ui_mode,
        "#waifuMode": settings.waifuMode,
        "#noShadows": settings.noShadows,
        "#messageTimerEnabled": settings.timer_enabled,
        "#messageTimestampsEnabled": settings.timestamps_enabled,
        "#messageModelIconEnabled": settings.timestamp_model_icon,
        "#mesIDDisplayEnabled": settings.mesIDDisplay_enabled,
        "#hideChatAvatarsEnabled": settings.hideChatAvatars_enabled,
        "#messageTokensEnabled": settings.message_token_count_enabled,
        "#expandMessageActions": settings.expand_message_actions,
        "#enableZenSliders": settings.enableZenSliders,
        "#enableLabMode": settings.enableLabMode,
        "#hotswapEnabled": settings.hotswap_enabled,
        "#reduced_motion": settings.reduced_motion,
        "#compact_input_area": settings.compact_input_area,
        "#show_swipe_num_all_messages": settings.show_swipe_num_all_messages,
        "#click_to_edit": settings.click_to_edit,
        "#reasoning_auto_expand": settings.reasoning_auto_expand
      };
      Object.entries(checks).forEach(([selector, value]) => setControl(selector, value, !0));
      const customCss = hostDocument.querySelector("#customCSS, #custom_css");
      customCss && (customCss.value = settings.custom_css);
      const themeSelect = findThemeSelect(previousName);
      if (themeSelect) {
        let option = [ ...themeSelect.options ].find(item => item.value === THEME_NAME);
        if (!option && installThemeOption) {
          option = hostDocument.createElement("option");
          option.className = OPTION_CLASS;
          option.value = THEME_NAME;
          option.textContent = THEME_NAME;
          themeSelect.append(option);
        }
        const targetTheme = installThemeOption ? THEME_NAME : String(settings.theme ?? "");
        [ ...themeSelect.options ].some(item => item.value === targetTheme) && (themeSelect.value = targetTheme);
      }
    }
    function valuesWithPreservedQuote(settings, values) {
      const next = {
        ...values
      };
      if (hostDocument.documentElement.dataset.claudeQuoteBodyColor !== "off") {
        next.quote_text_color = next.main_text_color ?? values.quote_text_color;
        return next;
      }
      const current = settings?.quote_text_color;
      const defaults = Object.values(CLAUDE_THEMES).map(theme => theme?.quote_text_color).filter(Boolean);
      const isClaudeDefault = defaults.some(value => valuesMatch(current, value));
      current == null || current === "" || isClaudeDefault || (next.quote_text_color = current);
      return next;
    }
    function persistFullTheme() {
      const context = getContext();
      const settings = context?.powerUserSettings;
      if (!settings) return null;
      const previousName = settings.theme;
      rememberRestorePoint(settings);
      const values = valuesWithPreservedQuote(settings, THEME_VALUES);
      const changed = settings.theme !== THEME_NAME || Object.entries(values).some(([key, value]) => !valuesMatch(settings[key], value));
      Object.assign(settings, values);
      settings.theme = THEME_NAME;
      applyCssVariables(settings);
      applyUiState(settings);
      syncControls(settings, previousName);
      context.saveSettingsDebounced?.();
      return changed;
    }
    function nativeThemeFallback(themeSelect) {
      if (!(themeSelect instanceof hostWindow.HTMLSelectElement)) return !1;
      const candidates = [ ...themeSelect.options ].filter(option => !option.disabled && !option.classList.contains(OPTION_CLASS) && option.value !== THEME_NAME && !isClaudeThemeName(option.value));
      const option = candidates.find(item => item.value && !/select|choose|选择|请选择/i.test(item.textContent ?? "")) ?? candidates[0];
      if (!option) return !1;
      themeSelect.value = option.value;
      themeSelect.dispatchEvent(new hostWindow.Event("change", {
        bubbles: !0
      }));
      return !0;
    }
    async function restorePreviousTheme() {
      const context = getContext();
      const settings = context?.powerUserSettings;
      const snapshot = readRestorePoint();
      const themeSelect = findThemeSelect(THEME_NAME);
      let restored = !1;
      if (settings && snapshot && typeof snapshot === "object") {
        Object.assign(settings, snapshot);
        applyCssVariables(settings);
        applyUiState(settings);
        syncControls(settings, THEME_NAME, !1);
        const nativeOption = themeSelect instanceof hostWindow.HTMLSelectElement && [ ...themeSelect.options ].some(option => option.value === String(snapshot.theme ?? ""));
        if (nativeOption) {
          themeSelect.value = String(snapshot.theme ?? "");
          themeSelect.dispatchEvent(new hostWindow.Event("change", {
            bubbles: !0
          }));
        }
        // Native theme selection may overwrite custom snapshot values.
        Object.assign(settings, snapshot);
        applyCssVariables(settings);
        applyUiState(settings);
        syncControls(settings, THEME_NAME, !1);
        const restoredCss = hostDocument.querySelector("#customCSS, #custom_css");
        restoredCss && hostWindow.jQuery?.(restoredCss).trigger("input");
        restored = !0;
      } else {
        if (settings) {
          const previousCss = settings.custom_css || "";
          const ownedCss = Object.values(CLAUDE_THEMES).some(theme => theme.custom_css === previousCss);
          settings.custom_css = ownedCss ? "" : previousCss;
          const customCss = hostDocument.querySelector("#customCSS, #custom_css");
          customCss && (customCss.value = settings.custom_css);
          restored = !0;
        }
        const preservedCss = settings?.custom_css;
        restored = nativeThemeFallback(themeSelect);
        if (settings && preservedCss !== undefined) {
          settings.custom_css = preservedCss;
          const customCss = hostDocument.querySelector("#customCSS, #custom_css");
          if (customCss) { customCss.value = preservedCss; hostWindow.jQuery?.(customCss).trigger("input"); }
        }
        !restored && settings && (restored = !0);
      }
      if (!restored || !settings) throw new Error("无法恢复原生主题");
      const target = snapshot || Object.fromEntries(["theme", ...Object.keys(THEME_VALUES)].map(key => [key, settings[key]]));
      const expected = JSON.parse(JSON.stringify(target));
      const record = JSON.stringify(expected);
      // Missing old snapshots cannot reconstruct the original theme. Persist
      // the explicit native fallback before saving so failures remain retryable.
      if (hostWindow.__claudeSafety) await hostWindow.__claudeSafety.persist(false, expected);
      else hostWindow.localStorage.setItem(RESTORE_KEY, record);
      if (hostWindow.localStorage.getItem(RESTORE_KEY) !== record) throw new Error("无法保留主题恢复记录");
      const safetyId = hostWindow.__claudeSafety?.state?.id;
      const {saveRestoredTheme} = await import(new URL("theme-restore.js?v=2.0.129", CLAUDE_EXTENSION_BASE).href);
      await saveRestoredTheme(hostWindow, context, expected);
      if (hostWindow.localStorage.getItem(RESTORE_KEY) !== record || hostWindow.localStorage.getItem("claude-web:enabled") !== "off") throw new Error("恢复状态已改变，请重新确认");
      await hostWindow.__claudeSafety?.confirmRestore(record, safetyId);
      hostWindow.localStorage.removeItem(RESTORE_KEY);
      hostWindow.requestAnimationFrame?.(() => {
        hostWindow.dispatchEvent(new hostWindow.Event("resize"));
      });
    }
    function removeRuntimeArtifacts() {
      try {
        hostWindow.__claudeClawdInteraction?.destroy?.();
      } catch {}
      hostDocument.getElementById("form_sheld")?.style.removeProperty("--cl-mobile-composer-translate-y");
      hostDocument.getElementById(STYLE_ID)?.remove();
      hostDocument.getElementById("claude-layer-order")?.remove();
      hostDocument.getElementById("claude-clawd-interaction-style")?.remove();
      hostDocument.querySelectorAll(`option.${OPTION_CLASS}`).forEach(option => option.remove());
      hostDocument.querySelectorAll([ ".clawd-mobile-chrome", ".clawd-mobile-scrim", ".clawd-mobile-new-chat", ".clawd-android-keyboard-pan-anchor", ".clawd-character-menu", ".clawd-character-switcher", ".clawd-rail-brand", ".clawd-rail-grip", ".claude-user-message-actions", ".claude-swipe-left-proxy", ".claude-swipe-right-proxy", ".claude-reroll-button", ".clawd-signoff-button" ].join(",")).forEach(element => element.remove());
      hostDocument.body?.classList.remove("clawd-interactive-ready", "claude-generation-active", "clawd-mobile-layout", "clawd-tauritavern-host", "clawd-welcome", "clawd-has-recents");
      delete hostDocument.documentElement.dataset.claudeIntegratedTheme;
      for (const property of [ "--cl-mobile-composer-height", "--cl-mobile-viewport-height", "--cl-mobile-viewport-top", "--clawd-signoff-image" ]) hostDocument.documentElement.style.removeProperty(property);
    }
    function destroy({restore: restore = !1} = {}) {
      if (destroyed) return restoreResult;
      destroyed = !0;
      retryTimer && hostWindow.clearTimeout(retryTimer);
      runnerRemovalTimer && hostWindow.clearTimeout(runnerRemovalTimer);
      hostUnloadResetTimer && hostWindow.clearTimeout(hostUnloadResetTimer);
      runnerPresenceObserver?.disconnect();
      runnerPresenceObserver = null;
      const watchdog = hostWindow[WATCHDOG_KEY];
      if (watchdog?.token === INSTANCE_TOKEN) {
        watchdog.stop?.();
        delete hostWindow[WATCHDOG_KEY];
      }
      hostWindow.removeEventListener("beforeunload", markHostPageUnloading, !0);
      hostWindow.removeEventListener("pagehide", markHostPageUnloading, !0);
      window.removeEventListener("pageshow", handleRunnerPageShow);
      restoreStyleAttributeRules();
      removeRuntimeArtifacts();
      hostWindow[INSTANCE_KEY] === api && delete hostWindow[INSTANCE_KEY];
      if (restore) restoreResult = restorePreviousTheme().then(() => true, error => {
        hostWindow.__claudeThemeRestoreError = error.message;
        console.warn("[Claude Web] 原生主题恢复尚未保存：", error);
        return false;
      });
      return restoreResult;
    }
    function markHostPageUnloading(event) {
      hostPageUnloading = !0;
      hostUnloadResetTimer && hostWindow.clearTimeout(hostUnloadResetTimer);
      if (event?.type === "pagehide") {
        hostPageHideConfirmed = !0;
        hostUnloadResetTimer = 0;
      } else {
        // beforeunload can be cancelled. A surviving page must not retain the
        // navigation guard and suppress a later runner-removal recovery.
        hostUnloadResetTimer = hostWindow.setTimeout(() => {
          hostUnloadResetTimer = 0;
          if (!hostPageHideConfirmed) hostPageUnloading = !1;
        }, 0);
      }
    }
    function handleRunnerPageHide(event) {
      if (event?.persisted || event?.originalEvent?.persisted) return;
      // Host navigation keeps the user's enable preference. Only removal of a
      // separate runner may restore the host's previous theme.
      destroy({
        restore: !hostPageUnloading
      });
    }
    function handleRunnerPageShow(event) {
      if (!event?.persisted || destroyed) return;
      hostPageUnloading = !1;
      hostPageHideConfirmed = !1;
      window.addEventListener("pagehide", handleRunnerPageHide, {
        once: !0
      });
    }
    const api = {
      token: INSTANCE_TOKEN,
      destroy: destroy,
      apply: persistFullTheme,
      applyVariant: function(variant) {
        const theme = CLAUDE_THEMES?.[variant];
        if (!theme) return !1;
        const context = getContext();
        const settings = context?.powerUserSettings;
        if (!settings) return !1;
        const previousName = settings.theme;
        rememberRestorePoint(settings);
        const values = valuesWithPreservedQuote(settings, Object.fromEntries(Object.entries(theme).filter(([key]) => key !== "name")));
        Object.assign(settings, values);
        settings.theme = theme.name;
        applyCssVariables(settings);
        applyUiState(settings);
        syncControls(settings, previousName);
        context.saveSettingsDebounced?.();
        return !0;
      }
    };
    hostWindow[INSTANCE_KEY] = api;
    hostWindow.addEventListener("beforeunload", markHostPageUnloading, !0);
    hostWindow.addEventListener("pagehide", markHostPageUnloading, !0);
    (function() {
      if (!(runnerFrame instanceof hostWindow.HTMLIFrameElement) || !hostWindow.MutationObserver) return;
      runnerPresenceObserver = new hostWindow.MutationObserver(() => {
        if (runnerFrame.isConnected || hostPageUnloading) return;
        runnerPresenceObserver?.disconnect();
        runnerPresenceObserver = null;
        runnerRemovalTimer = hostWindow.setTimeout(() => {
          const replacement = hostWindow[INSTANCE_KEY];
          if (hostPageUnloading || replacement && replacement !== api) return;
          destroy({
            restore: !0
          });
        }, 180);
      });
      runnerPresenceObserver.observe(hostDocument.body, {
        childList: !0,
        subtree: !0
      });
    })();
    (function() {
      if (!(runnerFrame instanceof hostWindow.HTMLIFrameElement)) return;
      try {
        const install = hostWindow.Function("frame", "instanceKey", "instanceToken", "restoreKey", "styleId", "optionClass", "watchdogKey", "\n          if (window[watchdogKey] && typeof window[watchdogKey].stop === 'function') {\n            window[watchdogKey].stop();\n          }\n          var timer = 0;\n          var stopped = false;\n          var observer = null;\n          function stop() {\n            stopped = true;\n            if (timer) window.clearTimeout(timer);\n            timer = 0;\n            if (observer) observer.disconnect();\n            observer = null;\n          }\n          function restoreAndCleanup() {\n            if (stopped) return;\n            var replacement = window[instanceKey];\n            if (replacement && replacement.token && replacement.token !== instanceToken) {\n              stop();\n              return;\n            }\n            var doc = window.document;\n            var body = doc.body;\n            var root = doc.documentElement;\n            try { window.__claudeClawdInteraction && window.__claudeClawdInteraction.destroy && window.__claudeClawdInteraction.destroy(); } catch (_) {}\n            var composer = doc.getElementById('form_sheld');\n            if (composer) composer.style.removeProperty('--cl-mobile-composer-translate-y');\n            var ids = [styleId, 'claude-layer-order', 'claude-clawd-interaction-style'];\n            ids.forEach(function (id) { var node = doc.getElementById(id); if (node) node.remove(); });\n            var customStyle = doc.getElementById('custom-style');\n            if (customStyle && typeof customStyle.__claudeCompatRawCss === 'string') {\n              customStyle.textContent = customStyle.__claudeCompatRawCss;\n              try { delete customStyle.__claudeCompatRawCss; delete customStyle.__claudeCompatWrappedCss; } catch (_) {}\n            }\n            doc.querySelectorAll('option.' + optionClass).forEach(function (node) { node.remove(); });\n            doc.querySelectorAll('.clawd-mobile-chrome,.clawd-mobile-scrim,.clawd-mobile-new-chat,.clawd-android-keyboard-pan-anchor,.clawd-character-menu,.clawd-character-switcher,.clawd-rail-brand,.clawd-rail-grip,.claude-user-message-actions,.claude-swipe-left-proxy,.claude-swipe-right-proxy,.claude-reroll-button,.clawd-signoff-button').forEach(function (node) { node.remove(); });\n            if (body) body.classList.remove('clawd-interactive-ready','claude-generation-active','clawd-mobile-layout','clawd-tauritavern-host','clawd-welcome','clawd-has-recents');\n            if (root) {\n              delete root.dataset.claudeIntegratedTheme;\n              ['--cl-mobile-composer-height','--cl-mobile-viewport-height','--cl-mobile-viewport-top','--clawd-signoff-image'].forEach(function (name) { root.style.removeProperty(name); });\n            }\n            var snapshot = null;\n            try { snapshot = JSON.parse(window.localStorage.getItem(restoreKey) || 'null'); } catch (_) {}\n            var context = window.SillyTavern && typeof window.SillyTavern.getContext === 'function'\n              ? window.SillyTavern.getContext()\n              : window.SillyTavern;\n            var settings = context && context.powerUserSettings;\n            if (settings && snapshot && typeof snapshot === 'object') Object.assign(settings, snapshot);\n            else if (settings) settings.custom_css = '';\n            if (settings && snapshot) {\n              var select = doc.querySelector('#themes,#theme_select,#theme-select,#ui_theme,#ui-theme');\n              if (select && Array.from(select.options || []).some(function (option) { return option.value === String(snapshot.theme || ''); })) {\n                select.value = String(snapshot.theme || '');\n                select.dispatchEvent(new window.Event('change', { bubbles: true }));\n              }\n            }\n            try { window.localStorage.removeItem(restoreKey); } catch (_) {}\n            if (context && typeof context.saveSettingsDebounced === 'function') context.saveSettingsDebounced();\n            window.requestAnimationFrame(function () {\n              window.dispatchEvent(new window.Event('resize'));\n            });\n          }\n          function check() {\n            if (stopped || frame.isConnected) return;\n            if (observer) observer.disconnect();\n            observer = null;\n            if (timer) window.clearTimeout(timer);\n            timer = window.setTimeout(restoreAndCleanup, 220);\n          }\n          observer = new window.MutationObserver(check);\n          observer.observe(window.document.body, { childList: true, subtree: true });\n          window[watchdogKey] = { token: instanceToken, stop: stop, cleanup: restoreAndCleanup };\n        ");
        install(runnerFrame, INSTANCE_KEY, INSTANCE_TOKEN, RESTORE_KEY, STYLE_ID, OPTION_CLASS, WATCHDOG_KEY);
      } catch (error) {
        console.warn("[Claude Theme] Could not install parent cleanup watchdog.", error);
      }
    })();
    $(function start(attempt = 0) {
      if (destroyed) return;
      installLiveStyle();
      neutralizeStyleAttributeRules();
      const changed = persistFullTheme();
      if (changed === null && attempt < 12) {
        retryTimer = hostWindow.setTimeout(() => start(attempt + 1), 250);
        return;
      }
      hostWindow.setTimeout(() => {
        if (!destroyed) {
          neutralizeStyleAttributeRules();
          persistFullTheme();
        }
      }, 800);
    });
    window.addEventListener("pagehide", handleRunnerPageHide, {
      once: !0
    });
    window.addEventListener("pageshow", handleRunnerPageShow);
    window.addEventListener("unload", handleRunnerPageHide, {
      once: !0
    });
    $(window).on("pagehide", handleRunnerPageHide);
  })();
  (() => {
    "use strict";
    const hostWindow = window;
    const hostDocument = hostWindow.document;
    const INSTANCE_KEY = "__claudeClawdInteraction";
    const KEYBOARD_BUILD = CLAUDE_KEYBOARD_BUILD;
    const keyboardBaselineMode = KEYBOARD_BUILD.mode === "baseline";
    const READY_CLASS = "clawd-interactive-ready";
    const EMPTY_CLASS = "claude-empty-assistant";
    const GENERATING_CLASS = "claude-generation-active";
    const BUTTON_CLASS = "clawd-signoff-button";
    const LEFT_SWIPE_PROXY_CLASS = "claude-swipe-left-proxy";
    const SWIPE_PROXY_CLASS = "claude-swipe-right-proxy";
    const REROLL_CLASS = "claude-reroll-button";
    let generationStartSeq = 0;
    const SWIPE_VIEW_CLASS = "claude-swipe-in-viewport";
    const USER_ACTIONS_CLASS = "claude-user-message-actions";
    const setBodyClass = (name, on) => {
      const list = hostDocument.body?.classList;
      list && list.contains(name) !== Boolean(on) && list.toggle(name, Boolean(on));
    };
    const isMobileMenuOpen = () => hostDocument.body.hasAttribute("data-clawd-menu");
    let mobileMenuCloseToken = 0;
    let mobileNavPanelCleanup = null;
    let mobileNavActivating = !1;
    let pushLiveTimer = 0;
    const setMobileMenuOpen = open => {
      cancelMobileMenuOpenWait();
      mobileNavPanelCleanup?.();
      open && (mobileMenuCloseToken += 1);
      if (open === isMobileMenuOpen()) return;
      const root = hostDocument.documentElement;
      hostWindow.clearTimeout(pushLiveTimer);
      if (open) {
        if (!root.hasAttribute("data-cw-push")) {
          root.setAttribute("data-cw-push", "");
          hostWindow.getComputedStyle(hostDocument.body).translate;
        }
        hostDocument.body.setAttribute("data-clawd-menu", "open");
      } else {
        hostDocument.body.removeAttribute("data-clawd-menu");
        pushLiveTimer = hostWindow.setTimeout(() => {
          isMobileMenuOpen() || root.removeAttribute("data-cw-push");
        }, 320);
      }
    };
    const MOBILE_LAYOUT_CLASS = "clawd-mobile-layout";
    const STYLE_ID = "claude-clawd-interaction-style";
    const EXTERNAL_MODAL_SELECTOR = [ '[role="dialog"]', '[aria-modal="true"]', "dialog[open]", '[class*="modal-backdrop" i]', '[class*="modal_backdrop" i]', '[class*="modal-overlay" i]', '[class*="modal_overlay" i]', '[class*="popup-backdrop" i]', '[class*="popup_backdrop" i]' ].join(",");
    const EMBED_STYLE_ID = "claude-embedded-surface-style";
    const REGEX_SURFACE_CLASS = "claude-transparent-regex-surface";
    const CLAWD_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAABf0lEQVR4nO3cwUkDURRG4enHEtzEvfshHQgWcLcpJfbhIl3crZ1EAoIgeTEBzfzR78DZ5TF33plFmJA3TQAAAAAAAAAAAAAAAAAAAAAAAAAAALg9uuZV17zhfI6rawQ5XGjP+Rw3glSUgnSWgnSWgnSWgnSWgnSWgnSWgnSWgnSWgnSWgnSWmUGmaTrqy/ph6Q3bf/Uw02heQUoQQdaCRPkiyPIRWhBBfgxBZkFaEEEmQTIUJCBCCyLIokGe7++O+vr0uHiA/uJhptG8fybIP3YjSEUpSGcpSGcpSN96kI+/F1ziNuBG9zfi9tL9nQKGZn0qSGUpSGUpSGUpSGUpSGUpSGUpSGUpSGUpSGUpSGUpSGXp5WKFvVz0+n3+Tf0e0lkK0lkK0lkK0v8wyOhEuVPfvkYnrr0NPr+7wmlvu8G1306sGd3fdrET5b4JdXTgE2t2Sz1ZPd7g3Yk1oyDLbfwIQcIQJAxBwhAkDEHCECQMQcIQJAxBwhAkDEGmH+EdPR0/XvA9afUAAAAASUVORK5CYII=";
    let observer = null;
    let chatAttributeObserver = null;
    let externalModalObserver = null;
    let externalModalRailState = [];
    let observedAttributeChat = null;
    let scrollHost = null;
    let lastManualScrollAt = 0;
    let frameId = 0;
    let destroyed = !1;
    const clawdEnabled = () => !destroyed && hostDocument.documentElement.dataset.claudeClawd !== "off";
    let clawdPileInstance = null;
    const makeClawdPile = () => createClawdPile({
      doc: hostDocument,
      win: hostWindow,
      big: {
        state: () => ({
          grounded: !A2.held && Math.abs(A2.fy - A2.floor) < .5,
          walking: /^rig:walkLoop/.test(String(clawdTracks.B || ""))
        }),
        lower: () => clawdBigLower()
      }
    });
    const clawdPile = Object.fromEntries([ "ensure", "left", "destroy", "hush", "peek", "seats", "trackSeats", "seatLive", "bigSat", "blocks", "riderCount", "unloadBig", "follow", "followEnd", "restack" ].map(key => [ key, (...args) => {
      if (key === "destroy") {
        clawdPileInstance?.destroy();
        clawdPileInstance = null;
        return;
      }
      clawdEnabled() && key === "ensure" && !clawdPileInstance && (clawdPileInstance = makeClawdPile());
      if (clawdEnabled() && clawdPileInstance) return clawdPileInstance[key](...args);
      if (key === "trackSeats") return () => [];
      return [ "seats", "blocks" ].includes(key) ? [] : key === "riderCount" ? 0 : null;
    } ]));
    const clawdFrames = new Set, clawdTimers = new Set;
    function requestClawdFrame(fn) {
      if (!clawdEnabled()) return 0;
      const id = hostWindow.requestAnimationFrame(now => {
        clawdFrames.delete(id);
        clawdEnabled() && fn(now);
      });
      clawdFrames.add(id);
      return id;
    }
    function clawdLater(fn, ms) {
      if (!clawdEnabled()) return 0;
      const id = hostWindow.setTimeout(() => {
        clawdTimers.delete(id);
        clawdEnabled() && fn();
      }, ms);
      clawdTimers.add(id);
      return id;
    }
    function cancelClawdLater(id) {
      clawdTimers.delete(id);
      hostWindow.clearTimeout(id);
    }
    let clawdWasEnabled = null;
    function syncClawdRuntime() {
      const on = clawdEnabled();
      if (on === clawdWasEnabled) return;
      clawdWasEnabled = on;
      if (on) {
        clawdLastIdleTickAt = Date.now();
        clawdRuntimeTimer = hostWindow.setInterval(clawdRuntimeTick, 200);
        ensureComposerClawd();
        return;
      }
      hostWindow.clearInterval(clawdRuntimeTimer);
      clawdRuntimeTimer = 0;
      for (const id of clawdFrames) hostWindow.cancelAnimationFrame(id);
      for (const id of clawdTimers) hostWindow.clearTimeout(id);
      clawdFrames.clear();
      clawdTimers.clear();
      clawdPile.destroy();
      cleanupClawdRigEffects();
      A2.flying++;
      A2.seqRun++;
      A2.lockUntil = 0;
      A2.lockName = "";
      const button = composerClawd();
      if (A2.pointerId != null) try {
        button?.releasePointerCapture(A2.pointerId);
      } catch {}
      A2.held = A2.dragging = A2.petting = !1;
      A2.pointerId = null;
      A2.x = A2.fy = A2.floor = A2.homeX = A2.rot = 0;
      A2.sqx = A2.sqy = 1;
      A2.bndRaf = A2.petTimer = A2.squashTimer = 0;
      A2.bndReady = !1;
      lookRaf = dozeTimer = clawdScrollRestTimer = clawdPileRestTimer = 0;
      clawdWalkNudge = null;
      clawdScrollHolding = !1;
      clawdTracks.B = "idle";
      clawdTracks.C = null;
      clawdTracks.bUntil = clawdTracks.cUntil = 0;
      if (typeof clawdReadingGate !== 'undefined') clawdReadingGate.reset(true);
      if (typeof clawdComposerReaction !== 'undefined') clawdComposerReaction.reset();
      clawdFormRO?.disconnect();
      clawdFormRO = null;
      clawdFormObserved = null;
      hostDocument.querySelectorAll("button." + BUTTON_CLASS).forEach(node => {
        node.getAnimations?.({
          subtree: !0
        }).forEach(animation => animation.cancel());
        node.remove();
      });
    }
    let streamFollow = null;
    let previousTypingActive = !1;
    let generationEventActive = !1;
    const generationSubscriptions = [];
    const clawdTracks = {
      A: null,
      B: "idle",
      C: null,
      aStartedAt: 0,
      aUntil: 0,
      bUntil: 0,
      cUntil: 0,
      round: 0,
      activeRound: 0,
      settledRound: 0,
      genStartedAt: 0
    };
    const CLAWD_RIG = buildClawdRig();
    const CLAWD_RIG_STYLE_ID = "claude-clawd-rig-style";
    const CLAWD_RIG_POOL = Object.freeze([ {
      id: "polish",
      weight: 3,
      cool: 24e4
    }, {
      id: "walk",
      weight: 3,
      cool: 12e4
    }, {
      id: "butterfly",
      weight: 1,
      cool: 6e5
    }, {
      id: "plant",
      weight: 1,
      cool: 6e5
    }, {
      id: "eat",
      weight: .3,
      mealWeight: 3,
      cool: 18e5
    }, {
      id: "onFire",
      weight: .5,
      cool: 9e5
    }, {
      id: "glowstick",
      weight: .5,
      cool: 6e5
    }, {
      id: "glowstick2",
      weight: .5,
      cool: 6e5
    }, {
      id: "rickroll",
      weight: .3,
      cool: 3e5
    }, {
      id: "siren",
      weight: .25,
      cool: 9e5
    }, {
      id: "sirenBlue",
      weight: .25,
      cool: 9e5
    } ]);
    const clawdRigLastPlayed = {};
    const CLAWD_RIG_FORMS = Object.freeze({
      glowstick: [ "glowstick", "glowstickPump" ],
      glowstick2: [ "glowstick2", "glowstick2Pump", "glowstick2Alt" ]
    });
    const CLAWD_RIG_A = Object.freeze({
      think: "write",
      stream: "write",
      sit: "sitWrite",
      done: "done",
      stopped: "stopped",
      error: "error"
    });
    const CLAWD_RIG_A_HELD = Object.freeze({
      think: "writeHeld",
      stream: "writeHeld",
      sit: "writeHeld",
      done: "doneHeld",
      stopped: "stoppedHeld",
      error: "errorHeld"
    });
    const CLAWD_RIG_B = Object.freeze({
      compose: "compose",
      tilt: "tilt",
      wow: "wow",
      wake: "wake",
      drowsy: "drowsy",
      sleep: "sleep",
      neglected: "neglected",
      around: "around",
      spin: "spin",
      lean: "lean",
      hide: "hide",
      tramp: "tramp",
      scratch: "scratch",
      crouch: "crouch",
      heart: "heart",
      point: "point",
      facepalm: "facepalm",
      peek: "peek"
    });
    const CLAWD_RIG_C = Object.freeze({
      press: "press",
      grab: "grab",
      drag: "drag",
      fly: "fly",
      land: "land",
      stomp: "stomp",
      pet: "pet",
      t2: "poke2",
      t3: "poke3",
      t4: "poke4",
      turn: "sulk",
      t5: "sulk",
      face: "sulk",
      rage: "rage"
    });
    let clawdRigPokeT1 = "poke1";
    const CLAWD_RIG_VARIANTS = Object.freeze({
      drag: [ "drag", "dragSwing" ],
      stomp: [ "stomp", "stompSlap" ],
      sulk: [ "sulk", "rage" ]
    });
    const clawdRigVariant = {
      drag: "drag",
      stomp: "stomp",
      sulk: "sulk"
    };
    function clawdRigPickVariant(key) {
      const pool = CLAWD_RIG_VARIANTS[key].filter(id => CLAWD_RIG.clips[id]);
      clawdRigVariant[key] = pool[Math.floor(Math.random() * pool.length)] || key;
      return clawdRigVariant[key];
    }
    let clawdRigUntiltUntil = 0;
    const clawdRigInjected = new Set;
    let clawdLetterPending = !1;
    const A2_TIER = [ "t1", "t2", "t3", "t4", "t5" ];
    const A2_TMS = [ 600, 700, 700, 1100, 0 ];
    const A2_RICH_TIER = 1;
    const A2_DRAG_THRESHOLD = 5;
    const A2_EDGE = 6;
    const A2_FORM_INSET = 8;
    const A2_FALLBACK_CEILING = 240;
    const A2_BOUNDS_TTL = 800;
    const A2 = {
      petTimer: 0,
      petting: !1,
      x: 0,
      fy: 0,
      homeX: 0,
      floor: 0,
      feel: .64,
      irr: 0,
      throws: 0,
      lastThrow: 0,
      lastDec: 0,
      lockUntil: 0,
      lockName: "",
      seqRun: 0,
      seqOwned: !1,
      flying: 0,
      dragging: !1,
      moved: !1,
      held: !1,
      pointerId: null,
      bndReady: !1,
      bndRaf: 0,
      sx: 0,
      sy: 0,
      ox: 0,
      oy: 0,
      vx: 0,
      vy: 0,
      lx: 0,
      ly: 0,
      lt: 0,
      rot: 0,
      sqx: 1,
      sqy: 1,
      bnd: {
        minx: -9e9,
        maxx: 9e9,
        maxxHome: 9e9,
        minxHome: -9e9,
        miny: -A2_FALLBACK_CEILING,
        maxy: 0
      },
      bndAt: 0,
      tookPointer: !1,
      squashTimer: 0
    };
    let clawdRuntimeTimer = 0;
    let clawdLastIdleTickAt = 0;
    let typingRunId = 0;
    const typingMotionTimers = new Map;
    const typingEntryTimers = new Map;
    const typingExitGhosts = new Map;
    new WeakMap;
    const emptyTimers = new Map;
    const messageContentCache = new WeakMap;
    const dirtyMessages = new Set;
    const embeddedFrameHandlers = new Map;
    const embeddedFrameOriginalSrcdoc = new Map;
    const welcomeAvatarOriginals = new Map;
    const nativeDeleteBypass = new WeakSet;
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
    let mobileViewportMetricsDirty = !0;
    let mobileViewportMetricsRaf = 0;
    let virtualKeyboardOverlayActive = !1;
    let virtualKeyboardOverlayOriginal = !1;
    let virtualKeyboardOverlayCaptured = !1;
    let mobileStableLayoutHeight = Math.max(1, Math.round(hostWindow.innerHeight || hostDocument.documentElement.clientHeight || 1));
    let mobileKeyboardRecoveryActive = !1;
    let mobileKeyboardPollTimer = 0;
    let mobileKeyboardPollSignature = "";
    let suspendedThemeStyle = null;
    let suspendedThemeMedia = null;
    const AUTOCOMPLETE_GUARDED_METHODS = [ "updatePosition", "updateFloatingPosition", "updateDetailsPosition" ];
    let autoCompleteResizeGuard = null;
    let autoCompleteResizeGuardToken = null;
    hostWindow[INSTANCE_KEY]?.destroy?.();
    function installStyle() {
      hostDocument.getElementById(STYLE_ID)?.remove();
      const style = hostDocument.createElement("style");
      style.id = STYLE_ID;
      style.textContent = String(`\n      body.${READY_CLASS} #chat > .mes.last_mes[is_user="false"] .mes_text::before,\n      body.${READY_CLASS} #chat > .mes[is_user="false"]:last-child .mes_text::before,\n      body.${READY_CLASS} #chat > .mes.last_mes[is_user="false"] .mes_text::after,\n      body.${READY_CLASS} #chat > .mes[is_user="false"]:last-child .mes_text::after {\n        display: none !important;\n        content: none !important;\n      }\n\n      #chat > .mes.${EMPTY_CLASS}[is_user="false"] {\n        display: none !important;\n      }\n\n      #chat > .mes[is_user="false"] .mes_text :is(iframe, object, embed) {\n        margin: 0 !important;\n        padding: 0 !important;\n        border: 0 !important;\n        outline: 0 !important;\n        box-shadow: none !important;\n        background: transparent !important;\n        background-color: transparent !important;\n      }\n\n      html[data-claude-integrated-theme="night"] body\n        #chat > .mes[is_user="false"] .mes_text .${REGEX_SURFACE_CLASS} {\n        background: transparent !important;\n        background-color: transparent !important;\n      }\n\n      /* 2.0.246：原来这里在第三方全屏弹窗出现时把 #top-settings-holder 降到 1，侧栏（和设置）会沉到欢迎页下面看不见。\n         改由 liftExternalModals 把弹窗抬到侧栏上面，这条规则删掉。 */\n\n      body.${READY_CLASS} #chat > .mes[is_user="false"] > .swipe_left,\n      body.${READY_CLASS} #chat > .mes[is_user="false"] > .swipeRightBlock,\n      body.${GENERATING_CLASS} #chat > .mes[is_user="false"] > button.${LEFT_SWIPE_PROXY_CLASS},\n      body.${GENERATING_CLASS} #chat > .mes[is_user="false"] > button.${SWIPE_PROXY_CLASS} {\n        display: none !important;\n      }\n\n      #chat > .mes.claude-has-preset-reasoning[is_user="false"] .mes_reasoning_details {\n        display: none !important;\n      }\n\n      #chat > .mes.claude-has-preset-reasoning[is_user="false"] :is(.mes_text, .mes_text > :not(.${BUTTON_CLASS})) {\n        box-sizing: border-box !important;\n        max-width: 100% !important;\n      }\n\n      #chat > .mes.claude-has-preset-reasoning[is_user="false"] .mes_text > :not(.${BUTTON_CLASS}) {\n        width: 100% !important;\n        min-width: 0 !important;\n      }\n\n      button.${BUTTON_CLASS} {\n        appearance: none !important;\n        -webkit-appearance: none !important;\n        -webkit-tap-highlight-color: transparent !important;\n        position: relative !important;\n        isolation: isolate !important;\n        display: block !important;\n        box-sizing: border-box !important;\n        width: 42px !important;\n        min-width: 42px !important;\n        max-width: 42px !important;\n        height: 34px !important;\n        min-height: 34px !important;\n        max-height: 34px !important;\n        margin: 14px 0 1px !important;\n        padding: 0 !important;\n        overflow: visible !important;\n        color: transparent !important;\n        background-color: transparent !important;\n        background-image: none !important;\n        background-repeat: no-repeat !important;\n        background-position: left bottom !important;\n        background-size: 42px 42px !important;\n        border: 0 !important;\n        border-radius: 0 !important;\n        outline: 0 !important;\n        box-shadow: none !important;\n        filter: none;\n        cursor: pointer !important;\n        image-rendering: pixelated;\n        line-height: 0 !important;\n        transform: translateY(0) scale(1) rotate(0);\n        transform-origin: center bottom;\n        transition: transform 150ms cubic-bezier(.2,.8,.25,1.25), filter 150ms ease !important;\n      }\n\n      /* A1：大 Clawd 是 #send_form 的真实子元素。位置完全由 CSS 锚定，\n         跟随 #form_sheld 的键盘补偿；原本的消息落款小 Clawd 独立保留，\n         手机顶栏与 typing indicator 不再创建第三个替身。 */\n      html body #form_sheld,\n      html body #form_sheld :is(#send_form, form) {\n        position: relative !important;\n        overflow: visible !important;\n      }\n\n      /* 输入框右上角原有的装饰 Clawd（#send_form::after，36x24 的\n         icons/clawd.png，见 styles/*.css）保留不动。2.0.139 在这里注入\n         content:none/display:none 把它杀掉了，那是把两只 Clawd 的身份认反\n         的结果 —— 要搬家的是对话尾部那只，不是它。 */\n\n      /* 迁入的可交互 Clawd 站输入框**左**上角。右上角 18px 是装饰 Clawd 的\n         位置（36x24），两只并排会完全重叠，所以这只走左边。\n         尺寸不在这里写死：交给上面 button.${BUTTON_CLASS} 的 2.0.135 原始规则\n         （桌面 42x34、手机 38x31）。2.0.139 在这里强制 44x36，等于把角色搬过来\n         的同时把它的身材改了。 */\n      html body #send_form > button.${BUTTON_CLASS}.clawd-composer-clawd {\n        position: absolute !important;\n        /* 底边用 calc(100% - 1px)，和装饰 Clawd 的 bottom:100%+margin-bottom:-1px\n           完全等价 —— 两只并排必须站同一条线。2.0.139 用的是 -5px，跟装饰那只差 4px，\n           两只并排时会一高一低。 */\n        inset: auto auto calc(100% - 1px) max(18px, calc(env(safe-area-inset-left, 0px) + 12px)) !important;\n        z-index: 4 !important;\n        display: block !important;\n        margin: 0 !important;\n        /* 可拖物体必须在手指落下前拒绝页面平移；pointerdown 里再切已经太晚。 */\n        touch-action: none !important;\n      }\n\n      html body button.clawd-mobile-clawd-button {\n        display: none !important;\n      }\n\n      html body #chat .typing_indicator::before,\n      html body #chat .typing_indicator::after {\n        content: none !important;\n        display: none !important;\n        animation: none !important;\n      }\n\n      html[data-claude-clawd="off"] body button.${BUTTON_CLASS} {\n        display: none !important;\n      }\n\n      button.${BUTTON_CLASS}:hover {\n        filter: saturate(1.08);\n      }\n\n      /* 生成计时器：固定在输入区上方的小徽标，跟 clawd-cc-toast 同一套\n         视觉语言（surface-raised 背景 + hairline 边框），生成时数字跳动，\n         结束后定格几秒再淡出。html[data-claude-gen-timer="off"] 关闭时\n         直接不显示——JS 那边也不会建元素，这里是双保险。 */\n      .clawd-gen-timer {\n        position: fixed;\n        right: 16px;\n        bottom: 84px;\n        z-index: 10015;\n        padding: 4px 10px;\n        border-radius: 10px;\n        font-family: var(--cl-sans);\n        font-size: 12px;\n        font-variant-numeric: tabular-nums;\n        color: var(--cw-text-body);\n        background: var(--cw-surface-raised);\n        border: 1px solid var(--cw-rule-hairline);\n        box-shadow: 0 6px 18px rgba(0,0,0,.18);\n        opacity: 0;\n        transform: translateY(4px);\n        transition: opacity 200ms ease, transform 200ms ease;\n        pointer-events: none;\n      }\n      .clawd-gen-timer.clawd-gen-timer-visible { opacity: .92; transform: translateY(0); }\n      .clawd-gen-timer.clawd-gen-timer-done { color: var(--cw-mark); }\n      html[data-claude-gen-timer="off"] .clawd-gen-timer { display: none !important; }\n\n      /* 欢迎内容的兜底遮挡。\n         酒馆的欢迎面板（#chat > .welcomePanel）和欢迎助手那条消息本来应该由酒馆\n         自己在切换对话时清掉；PC 上实测四次都清得干净，手机上却会留在 #chat 里，\n         跟真实的角色消息排成一列——用户看到的是"上面三条是欢迎页，往下划才是对话"。\n         这里不去删别人的节点（删了可能打断酒馆自己的重建逻辑），只在「已经不是\n         欢迎态」时把它们藏起来。body.clawd-welcome 由 refreshWelcomeMode 维护，\n         实测在 PC 上四次进对话都被正确 toggle(false)，可以作为判据。\n         纯 CSS 兜底，不管酒馆那边清不清、清得及不及时，都不会露出来。 */\n      body:not(.clawd-welcome) #chat > .welcomePanel,\n      body:not(.clawd-welcome) #chat > .mes.claude-welcome-clawd-assistant,\n      body:not(.clawd-welcome) #chat > .mes.claude-welcome-prompt {\n        display: none !important;\n      }\n      @media (prefers-reduced-motion: reduce) {\n        .clawd-gen-timer { transition: none !important; }\n      }\n\n      /* 背景透传：主题原本给 body/侧栏（#top-bar、#top-settings-holder）/\n         正文（#sheld、#chat，含 #chat::before 顶部遮罩条）/输入区整片刷了\n         不透明的 --cw-surface-page（也就是现在的白底/黑底），把酒馆自己的\n         背景图盖住了；欢迎语页面用的是同一批容器，一起覆盖到就不用再单独\n         处理。这里只清空这几层的背景色，不碰 background-image——酒馆的\n         背景图挂在更底层的元素上，本来就没被这几层挡住内容，挡住的只是\n         "看不看得见"。\n         注意 #foo#foo 的重复写法不是笔误：主题原样式里同名选择器很多是\n         "html body #foo" 这种三段式，优先级比这边挂在 html 属性选择器上的\n         单个 id 选择器更高，重复一次 id 才能确保稳赢，不必依赖样式表谁先\n         加载谁后加载。（上一版只覆盖了 body/#sheld/#chat/#send_form/\n         #form_sheld，漏了侧栏和 #chat::before，真机测出侧栏、正文区域、\n         欢迎语区域都还是不透的，就是因为这个。） */\n      html[data-claude-bg-transparent="on"],\n      html[data-claude-bg-transparent="on"] body,\n      html[data-claude-bg-transparent="on"] #top-bar#top-bar,\n      html[data-claude-bg-transparent="on"] #top-settings-holder#top-settings-holder,\n      html[data-claude-bg-transparent="on"] #sheld#sheld,\n      html[data-claude-bg-transparent="on"] #chat#chat,\n      html[data-claude-bg-transparent="on"] #form_sheld#form_sheld {\n        background: transparent !important;\n        background-color: transparent !important;\n        background-image: none !important;\n      }\n      html[data-claude-bg-transparent="on"] #chat#chat::before {\n        background: transparent !important;\n      }\n\n      /* FR-1 背景图模糊。只作用在酒馆自己的背景层上，前景一个都不碰 ——\n         需求文档特别强调「不要对聊天内容容器用 filter」，理由不只是观感：\n         给元素上 filter 会让它变成后代 position:fixed 的包含块，抽屉、\n         弹层、浮动菜单会被摁进那个盒子里。这个坑毛玻璃那边已经踩过一次\n         （见下面 #top-settings-holder 那段注释）。\n\n         scale(1.08) 是必须的，不是保险：blur 会让边缘像素向外采样到透明，\n         不放大的话四周会露出一圈渐隐的缝。放大比例要够覆盖模糊半径，\n         32px 的上限对应约 8% 的外扩。\n\n         压暗用 inset box-shadow 铺满，不另加元素 —— 加元素就要考虑它的\n         层级、指针事件、以及卸载时的清理。 */\n      html[data-claude-bg-image-blur="on"] :is(#bg1, #bg_custom, #bg_animation) {\n        filter: blur(var(--claude-bg-image-blur, 12px)) !important;\n        transform: scale(1.08) !important;\n        transform-origin: center center !important;\n        box-shadow: inset 0 0 0 100vmax rgb(20 20 19 / var(--claude-bg-image-dim, .28)) !important;\n      }\n      html[data-claude-bg-image-blur="on"][data-claude-motion="off"] :is(#bg1, #bg_custom, #bg_animation) {\n        transition: none !important;\n      }\n      /* 上一版把 #form_sheld 也单独打了层色调，本意是想解决"PC 端输入框\n         看着不透"的问题，结果打歪了：真机调试查了 #sheld 的实际渲染盒子\n         （position:absolute，铺满整个 #sheld 区域），发现它的模糊背景其实\n         已经完整盖到 #form_sheld 那块地方了，PC 端"不透"的锅根本不在\n         #sheld 有没有漏——是 #send_form 自己在 day-pc.css 里原本就有一份\n         不透明的 --cw-surface-raised 背景（做成"浮起的输入控件"故意跟\n         正文区分开），跟透传开关没关系。\n         #form_sheld 单独叠一层色调，等于在"#sheld 已经模糊过一次"的底子上\n         又摞了一层不同浓度的色调，跟旁边同样透出 #sheld 底色、但没有额外\n         色调的 #chat 交界处，亮度/浓度对不上，就刷出了聊天区和输入条之间\n         那道硬边——就是这次反馈的新 bug。\n         #form_sheld 退回去跟 #chat 一样纯透传，边界就消失了。真正需要\n         "看得见但要跟正文区分开"的其实只有 #send_form 那个圆角输入条本身\n         ——这本来就是原设计里唯一带独立底色的控件，边界是有意的（一个\n         圆角药丸形状的控件轮廓，不是贯穿整行的硬切线），不算视觉割裂。 */\n      html[data-claude-bg-transparent="on"] #send_form#send_form {\n        background: color-mix(in srgb, var(--claude-glass-base, #96968f) var(--claude-drawer-tint-opacity, 18%), transparent) !important;\n        background-color: color-mix(in srgb, var(--claude-glass-base, #96968f) var(--claude-drawer-tint-opacity, 18%), transparent) !important;\n        background-image: none !important;\n      }\n\n      /* 毛玻璃：在透传的基础上，给内容区（不含 html/body 这两层最外层）\n         补一层很浅的同色调半透明底 + 模糊，读起来是"隔着磨砂玻璃看背景"，\n         不是完全透明导致文字糊在背景图上看不清。设置面板里这个开关依赖\n         背景透传先开，两个都关掉时都不生效，不会出现"糊了但看不出透明"\n         的死角状态。\n\n         #top-bar / #top-settings-holder 单独拆出来、只给半透明底色、\n         不上 backdrop-filter —— 世界书/角色管理/扩展这些抽屉的\n         .drawer-content 就挂在 #top-settings-holder 底下。CSS 规则是\n         "给元素加 filter/backdrop-filter，这个元素就变成它内部\n         fixed/absolute 子元素的新参照系"，抽屉本来是要铺满整个视口的\n         fixed 面板，一旦祖先带上 backdrop-filter 就被摁进侧栏那个又窄\n         又裁切的盒子里，表现是点了打不开、开着的关不掉。之前那版侧栏\n         也叠了 blur，线上直接把抽屉全部糊死，是我漏测的坑。\n\n         模糊只上在 #sheld 这一层——#chat、#form_sheld（连带里面的\n         #send_form）都是 #sheld 的子元素，之前四个都各自叠了一层\n         color-mix + blur，子元素的盒子比父元素小一圈（欢迎页尤其明显，\n         问候语和输入框那块是居中的窄盒子），两层模糊叠在一起、且子盒子\n         边缘只有单层父级模糊，就在子盒子的四条边上刷出一圈实打实的\n         "描边"——用户反馈的欢迎语外框就是这个。#chat/#form_sheld/\n         #send_form 这里不再单独给背景和滤镜，留空之后background-transparent\n         那条规则已经把它们设成透明了，会自然透出 #sheld 这一层模糊后的\n         底色，不会再有二次模糊/二次描边。 */\n      /* #top-settings-holder 还是不能上 backdrop-filter——它是里面那些\n         fixed 抽屉的祖先，加了模糊就会变成抽屉的定位参照系，重蹈"抽屉挤扁\n         关不掉"的覆辙（这条坑之前踩过，见下面抽屉那段的说明）。\n         #top-bar 不一样：查过 DOM，它跟 #top-settings-holder 是平级，\n         底下也没有任何 fixed 定位的子元素，加模糊不会影响别的东西的定位，\n         真机点关各种抽屉都正常。之前图省事把两个写在一条规则里、都不加\n         模糊，代价是顶栏标题、图标全都直接铺在没模糊过的原图上——背景图\n         细节一多，图标和文字的对比度就没保障，这也是反馈"字看不清"的\n         一部分原因。这里把 #top-bar 拆出来单独给模糊，并且改用抽屉同一根\n         "浓度下限"变量（不再用主区域那根可能被拖到 8% 的滑条），保证顶栏\n         这种常驻功能区不会因为用户把主区域调得很透就跟着一起看不清。 */\n      html[data-claude-bg-blur="on"] #top-settings-holder#top-settings-holder {\n        background: color-mix(in srgb, var(--claude-glass-base, #96968f) var(--claude-nav-tint-opacity, 58%), transparent) !important;\n      }\n      html[data-claude-bg-blur="on"] #top-bar#top-bar {\n        background: color-mix(in srgb, var(--claude-glass-base, #96968f) var(--claude-drawer-tint-opacity, 18%), transparent) !important;\n        backdrop-filter: blur(16px) saturate(1.4) !important;\n        -webkit-backdrop-filter: blur(16px) saturate(1.4) !important;\n      }\n      html[data-claude-bg-blur="on"] #sheld#sheld {\n        background: color-mix(in srgb, var(--claude-glass-base, #96968f) var(--claude-bg-blur-opacity, 22%), transparent) !important;\n        backdrop-filter: blur(16px) saturate(1.4) !important;\n        -webkit-backdrop-filter: blur(16px) saturate(1.4) !important;\n      }\n      /* 消息区的次要文字（时间戳、"思考了一会"这类提示、操作图标）原来的\n         灰色是按"底下永远是纯色纸白/纸黑"校准的对比度，换成半透明background\n         露出背景图之后，这层灰经常卡在跟天空、云、浅色区域差不多的亮度，\n         看着就会"发灰看不清"——不是不透明度算错了，是文字颜色本身的对比度\n         保障没了。开了背景透传之后，把这个次要文字色朝主文字色（对比度\n         最高、每个主题下都验证过可读）拉近一截，不管日夜、不管背景图什么\n         内容，都能保住一个最低对比度。 */\n      /* 这里不能写成 var(--cw-text-muted) 55% 混自己——--cw-text-muted\n         自己就是这条规则要重新定义的目标，同一个变量在自己的定义里引用\n         自己，CSS 会判定为循环引用，直接判无效（invalid at computed-value\n         time），实测 getComputedStyle 读出来是空字符串，规则等于白写。\n         改成引用 --cw-ink-2——这是 --cw-text-muted 在主题里真正指向的\n         底层色号，跟目标变量不是同一个名字，就不会自我循环了。 */\n      html[data-claude-bg-transparent="on"] {\n        --cw-text-muted: color-mix(in srgb, var(--cw-ink-2) 55%, var(--cw-text-body) 45%) !important;\n      }\n\n      /* 抽屉/弹层磨砂：世界书、扩展、角色管理、User Settings 这些\n         .drawer-content/.popup 面板。这里原来是不受 bgBlur/bgTransparent\n         两个开关控制、常驻磨砂的——当时的顾虑是"背景透传关掉时它们又变回\n         纯色，跟旁边区域对不上"。但反馈是背景透传本来就关着（没人要透传）\n         的"常态"下，抽屉却硬带了一层磨砂感，不必要——用户没开这个功能，\n         抽屉就该是主题原本的纯色，不该有任何磨砂痕迹。这里改成跟主区域\n         一样受 data-claude-bg-transparent 控制，关闭时完全回退到主题\n         原生样式。\n         下面这两条规则现在都挂在 data-claude-bg-transparent="on" 底下，\n         关掉背景透传就完全不生效，抽屉/弹窗自动回到主题原生的纯色。\n         Prompt 管理二级弹层（#completion_prompt_manager_popup.openDrawer）\n         有自己专门的不透明规则、选择器带 id，优先级比这条高，不会被这里\n         的半透明覆盖掉——之前特意做成不透明就是防止列表和固定输入框从\n         底下透出来，这里不用重复处理。\n\n         这条规则第一版上线后实测完全没生效（真机截图侧栏抽屉还是纯白/纯\n         黑），backdrop plugin这里排查了很久：day-pc.css 里还有一条更具体的\n         "#top-settings-holder > .drawer > .drawer-content { background:\n         var(--cw-surface-page) !important; ... }"，选择器带一个 id 两个类，\n         优先级 (1,2,0)，比这条 :is(...) 单类选择器的 (0,1,1) 高得多，\n         哪怕后加载、哪怕 !important，也照样是它赢——具体到 CSS 里就是\n         "id 数量相同时比类的数量，类数量相同时比标签数量"这条比较规则，\n         我最早只对比了 :is(...) 那一条基础规则，漏看了这条专门给\n         "挂在侧栏rail 下的抽屉"加的更具体规则。下面单独给这条更具体的\n         选择器也补一份同样的半透明色，才能真正盖过去。\n\n         手机布局（day-mobile.css / night-mobile.css）比 PC 布局那条又多\n         叠了一个 ".openDrawer" 状态类——"html body #top-settings-holder >\n         .drawer > .drawer-content.openDrawer"，比上面这条 PC 端够用的\n         选择器又高一级（多一个类），手机窄屏下实测抽屉还是纯色，就是被\n         这条压过去了。这里把 .openDrawer 变体也一起列出来，两个布局\n         都能盖住，不用再赌“加载顺序刚好在后面”那种运气。 */\n      /* 光调浓度治标不治本：抽屉之前只有色调、没有模糊，浓度调到 68% 还是\n         能看出背后角色卡缩略图/聊天气泡的轮廓，本质是"给一层有色玻璃纸"，\n         不是"磨砂玻璃"。真机反馈"日间的字看不清、头像也糊没了"，根子在\n         这——背后内容细节越多（图片、卡片），同样浓度下能看清的东西越多，\n         纯调浓度只能靠堆到接近不透明才压得住，代价是完全看不见背景，跟\n         "透传"这个功能本身的诉求（看得见背景）矛盾。\n         这里给抽屉/弹窗自己直接加 backdrop-filter：这些面板本身就是\n         position:fixed 定位的元素，模糊算在它们自己身上，不影响它们自己\n         的定位（filter 影响的是"内部子元素"的定位基准，不影响元素自己）。\n         之前踩过的坑是把模糊加在 #top-settings-holder 这个"祖先容器"上，\n         把它变成了里面 fixed 抽屉的定位基准，导致抽屉挤扁/关不掉——这次\n         是直接加在抽屉本身，不是加在抽屉的祖先上，两者不是一回事，真机\n         测试开关各个抽屉正常。 */\n      html[data-claude-bg-transparent="on"] body #top-settings-holder > .drawer > .drawer-content,\n      html[data-claude-bg-transparent="on"] body #top-settings-holder > .drawer > .drawer-content.openDrawer {\n        background: color-mix(in srgb, var(--claude-glass-base, #96968f) var(--claude-drawer-tint-opacity, 18%), transparent) !important;\n        background-color: color-mix(in srgb, var(--claude-glass-base, #96968f) var(--claude-drawer-tint-opacity, 18%), transparent) !important;\n        backdrop-filter: blur(20px) saturate(1.25) !important;\n        -webkit-backdrop-filter: blur(20px) saturate(1.25) !important;\n      }\n      html[data-claude-bg-transparent="on"] :is(.drawer-content, .popup, .popup-content) {\n        background: color-mix(in srgb, var(--claude-glass-base, #96968f) var(--claude-drawer-tint-opacity, 18%), transparent) !important;\n        background-color: color-mix(in srgb, var(--claude-glass-base, #96968f) var(--claude-drawer-tint-opacity, 18%), transparent) !important;\n        backdrop-filter: blur(20px) saturate(1.25) !important;\n        -webkit-backdrop-filter: blur(20px) saturate(1.25) !important;\n      }\n      /* --SmartThemeBlurTintColor 是酒馆自己给"磨砂面板"准备的原生变量，\n         语义就是"配合模糊用的半透明底色"——不少第三方扩展（背景管理面板\n         自己的顶栏 #bg-header-fixed、酒馆助手的脚本列表行……）都直接拿\n         这个变量当背景，不吃我们主题的 --cw-surface-page。我们的主题没\n         重新定义过它，酒馆原生给的默认值偏深、还不透明，跟这些扩展自己\n         "半透明磨砂"的设计初衷本来就对不上，遇上我们的日间浅色主题更是\n         直接糊出一块黑条/黑块，跟旁边区域完全脱节。\n         这里不是挨个元素去堵，是从根上把这个变量重新定义成跟我们抽屉\n         同一色调、同一浓度的半透明色——凡是照着酒馆官方约定使用这个变量\n         的扩展（不只是背景面板和酒馆助手，任何遵循这个约定的三方扩展都\n         受益），背景会自动跟着我们的日夜色调和毛玻璃浓度滑条走，不用每\n         冒出一个新扩展就单独打一次补丁。 */\n      /* Bug 5：上面这条重定义之前是挂在裸 html 选择器上的，不受\n         data-claude-bg-transparent / data-claude-bg-blur 任何一个开关控制——\n         两个都关掉之后，这条半透明 color-mix 仍然原样生效。角色卡\n         Advanced Definitions 这类弹窗走的正是酒馆原生\n         --SmartThemeBlurTintColor 这条约定（不吃我们主题给 .popup 写的\n         那份不透明 --cw-surface-page，日间/夜间 CSS 里那份规则管不到它），\n         于是就算用户把透传和毛玻璃都关了，这些弹窗背后仍然是当初写死的\n         18% 浓度玻璃色，跟设置语义（都关闭 = 实体不透明背景）对不上。\n         这里拆成两条：默认（两个开关都关）时把这个变量还原成主题本身的\n         不透明 --cw-surface-page；只有背景透传打开时才切回半透明\n         color-mix。毛玻璃单独开、透传没开的组合不会走到这条规则——它依赖\n         透传先开这条既有约束在设置面板里已经保证（见 bgBlur 的 change\n         处理器，勾选毛玻璃会连带勾上透传）。 */\n      /* 2.0.90：兼容模式必须排除在外。--SmartThemeBlurTintColor 是酒馆自己的\n         变量，外部美化拿它当页面底色用。在 :root 上把它改成 Claude 的\n         --cw-surface-page，等于把整页底色换成 Claude 纸色 —— 雨中曲的正文\n         于是变成「黄色卡片浮在白底上」，中间一条条白带。兼容模式下这个变量\n         归主题。 */\n      html {\n        --SmartThemeBlurTintColor: var(--cw-surface-page) !important;\n      }\n      html[data-claude-bg-transparent="on"] {\n        --SmartThemeBlurTintColor: color-mix(in srgb, var(--claude-glass-base, #96968f) var(--claude-drawer-tint-opacity, 18%), transparent) !important;\n      }\n\n      /* 真正在真实聊天页（非欢迎页）里把 #send_form 顶掉、让接缝 bug 复现的\n         另有其人：day-pc.css/day-mobile.css 里还定义了一条只在聊天页生效\n         的选择器 html body:not(.clawd-welcome) #form_sheld :is(#send_form,\n         form)，专门给输入条上了 --cl-composer-chat 这个变量（88% 正文底色\n         + 5% 文字色，接近不透明），本意是"聊天区里输入条要比正文更醒目"。\n         这条规则比我们上面给 #send_form#send_form 写的那条选择器还多两层\n         元素（html body），优先级压过我们，欢迎页不受影响（有 .clawd-welcome\n         挡着），一进真实聊天就现形——这才是"新bug"截图里那条硬边的真身，\n         不是简单的双层色调叠加。\n         用跟 --SmartThemeBlurTintColor 一样的思路根治：不跟它比优先级，\n         直接把它读的这个变量本身重新定义掉，开了背景透传之后聊天页输入条\n         也统一吃我们这根浓度滑条。 */\n      /* 光在 html 上重定义这个变量不够——day-pc.css 里 --cl-composer-chat\n         的原始定义写在 ":root, html body" 上，body 那份是直接扎在 body\n         元素自己身上的（哪怕没有 !important），CSS 自定义属性的继承规则\n         是"元素自己身上只要有声明就不再看祖先的继承值"，跟那份声明是不是\n         important 无关——important 只在同一个元素上争夺胜负时才起作用。\n         所以我们挂在 html 上的 !important 版本永远赢不过 body 自己那份，\n         必须直接把 body 也纳入选择器，声明才会落在 body 自己头上，盖掉\n         day-pc.css 那份。 */\n      html[data-claude-bg-transparent="on"],\n      html[data-claude-bg-transparent="on"] body {\n        --cl-composer-chat: color-mix(in srgb, var(--claude-glass-base, #96968f) var(--claude-drawer-tint-opacity, 18%), transparent) !important;\n      }\n\n      html[data-claude-motion="off"] button.${BUTTON_CLASS},\n      html[data-claude-motion="off"] #chat .typing_indicator::before,\n      html[data-claude-motion="off"] .clawd-typing-exit-ghost::before {\n        animation: none !important;\n        transition: none !important;\n        translate: 0 0 !important;\n      }\n\n      #chat > .mes[is_user="false"] {\n        position: relative !important;\n      }\n\n      #chat > .mes[is_user="true"] .mes_block {\n        overflow: visible !important;\n      }\n\n      #chat > .mes[is_user="true"] .${USER_ACTIONS_CLASS} {\n        display: flex !important;\n        align-items: center !important;\n        justify-content: flex-end !important;\n        gap: 3px !important;\n        box-sizing: border-box !important;\n        width: 100% !important;\n        min-height: 28px !important;\n        margin: 3px 0 0 !important;\n        padding: 0 2px !important;\n        opacity: 1 !important;\n        visibility: visible !important;\n        pointer-events: auto !important;\n        transform: translateY(0) !important;\n        transition: opacity 150ms ease, visibility 150ms ease, transform 150ms ease !important;\n      }\n\n      #chat > .mes[is_user="true"] .mes_block:has(.edit_textarea) > .${USER_ACTIONS_CLASS} {\n        display: none !important;\n      }\n\n      #chat > .mes[is_user="true"] .${USER_ACTIONS_CLASS} > button {\n        appearance: none !important;\n        -webkit-appearance: none !important;\n        -webkit-tap-highlight-color: transparent !important;\n        position: relative !important;\n        display: inline-flex !important;\n        align-items: center !important;\n        justify-content: center !important;\n        flex: 0 0 28px !important;\n        box-sizing: border-box !important;\n        width: 28px !important;\n        min-width: 28px !important;\n        height: 28px !important;\n        min-height: 28px !important;\n        margin: 0 !important;\n        padding: 0 !important;\n        color: var(--cw-text-muted, #8b8780) !important;\n        background: transparent !important;\n        border: 0 !important;\n        border-radius: 8px !important;\n        box-shadow: none !important;\n        opacity: .62 !important;\n        cursor: pointer !important;\n        transition: color 140ms ease, opacity 140ms ease, background 140ms ease, transform 140ms ease !important;\n      }\n\n      #chat > .mes[is_user="true"] .${USER_ACTIONS_CLASS} > button::before {\n        font-family: "Font Awesome 6 Free", "Font Awesome 5 Free" !important;\n        font-size: 12px !important;\n        font-weight: 900 !important;\n        line-height: 1 !important;\n      }\n\n      #chat > .mes[is_user="true"] button.claude-user-message-edit::before { content: "\\f304" !important; }\n      #chat > .mes[is_user="true"] button.claude-user-message-delete::before { content: "\\f2ed" !important; }\n\n      #chat > .mes[is_user="true"] .${USER_ACTIONS_CLASS} > button:hover,\n      #chat > .mes[is_user="true"] .${USER_ACTIONS_CLASS} > button:focus-visible {\n        color: var(--cw-text-body, #ece9e2) !important;\n        background: var(--cw-surface-hover, rgba(128,128,128,.12)) !important;\n        opacity: 1 !important;\n      }\n\n      #chat > .mes[is_user="true"] .${USER_ACTIONS_CLASS} > button:active {\n        transform: scale(.88) !important;\n      }\n\n      #chat > .mes.claude-welcome-clawd-assistant[is_user="false"] .mesAvatarWrapper .avatar,\n      #chat > .mes.claude-welcome-clawd-assistant[is_user="false"] .mesAvatarWrapper .avatar img {\n        background: transparent !important;\n        border: 0 !important;\n        box-shadow: none !important;\n      }\n\n      #chat > .mes.claude-welcome-clawd-assistant[is_user="false"] .mesAvatarWrapper .avatar img {\n        box-sizing: border-box !important;\n        padding: 2px !important;\n        object-fit: contain !important;\n        image-rendering: pixelated !important;\n        filter: none !important;\n      }\n\n      @media (hover:hover) and (pointer:fine) {\n        #chat > .mes[is_user="true"] .${USER_ACTIONS_CLASS} {\n          opacity: 0 !important;\n          visibility: hidden !important;\n          pointer-events: none !important;\n          transform: translateY(-2px) !important;\n        }\n\n        #chat > .mes[is_user="true"]:hover .${USER_ACTIONS_CLASS},\n        #chat > .mes[is_user="true"]:focus-within .${USER_ACTIONS_CLASS} {\n          opacity: 1 !important;\n          visibility: visible !important;\n          pointer-events: auto !important;\n          transform: translateY(0) !important;\n        }\n      }\n\n      /* 真实动作仍全部保留，但默认折叠必须交还酒馆。2.0.117 把\n         .extraMesButtons 和它的每个孩子都强制 display:flex，等于绕过了\n         extraMesButtonsHint 的原生开关，P2/P5 才会整排常驻。 */\n      html body.${READY_CLASS} #chat > .mes .mes_buttons {\n        display: flex !important;\n        align-items: center !important;\n        gap: 4px !important;\n        max-width: 100% !important;\n        overflow-x: auto !important;\n        overflow-y: hidden !important;\n        flex-wrap: nowrap !important;\n        visibility: visible !important;\n        opacity: 1 !important;\n        pointer-events: auto !important;\n      }\n\n      html body.${READY_CLASS} #chat > .mes .extraMesButtons {\n        display: none !important;\n        align-items: center !important;\n        gap: 4px !important;\n        max-width: 100% !important;\n        overflow-x: auto !important;\n        overflow-y: hidden !important;\n        flex-wrap: nowrap !important;\n      }\n\n      /* 主题源 CSS 会先把角色消息下的每个 .mes_button 全部隐藏。\n         省略号和编辑键属于原生主操作，必须明确恢复；额外动作仍由\n         .visible / expandMessageActions 控制，不能跟着一起常驻。 */\n      html body.${READY_CLASS}:not(.expandMessageActions)\n        #chat > .mes .mes_buttons:not(:has(> .extraMesButtons.visible))\n        > .extraMesButtonsHint,\n      html body.${READY_CLASS}\n        #chat > .mes[is_user="false"] .mes_buttons > .mes_edit {\n        display: inline-flex !important;\n        align-items: center !important;\n        justify-content: center !important;\n      }\n\n      /* 用户消息的原生编辑键挂在 .ch_name 里。TT 的气泡布局会把整段标题栏\n         压成零高，按钮即使 display:flex 也在画面外。下方的编辑代理负责转发\n         给同一枚原生 .mes_edit；这里收起原节点，避免 ST 出现双铅笔。 */\n      html body.${READY_CLASS}\n        #chat > .mes[is_user="true"] .mes_buttons > .mes_edit {\n        display: none !important;\n      }\n\n      html body.${READY_CLASS}.expandMessageActions\n        #chat > .mes .mes_buttons > .extraMesButtonsHint,\n      html:not([data-cw-v4]) body.${READY_CLASS}\n        #chat > .mes .mes_buttons:has(> .extraMesButtons.visible)\n        > .extraMesButtonsHint {\n        display: none !important;\n      }\n\n      html body.${READY_CLASS}.expandMessageActions\n        #chat > .mes .extraMesButtons,\n      html body.${READY_CLASS}\n        #chat > .mes .extraMesButtons.visible {\n        display: flex !important;\n      }\n\n      /* 主题源曾只白名单显示复制和朗读，所以点省略号后看起来只有两个功能。\n         展开区改成独立浮层：只恢复酒馆没有显式隐藏的真实按钮，并允许换行，\n         不再把十几个动作硬塞进消息底部的一条 26px 横线。\n         v4（classic + rail）不用这张卡片：styles/official-layout.css 里是 design-v4 的单行灰条，\n         position:fixed 定位，不用改消息的 overflow（2026-09-29），所以下面几条都排除 v4。 */\n      html:not([data-cw-v4]) body.${READY_CLASS}\n        #chat > .mes[is_user="false"]:has(.extraMesButtons.visible),\n      html:not([data-cw-v4]) body.${READY_CLASS}\n        #chat > .mes[is_user="false"]:has(.extraMesButtons.visible) .mes_block,\n      html:not([data-cw-v4]) body.${READY_CLASS}\n        #chat > .mes[is_user="false"] .mes_buttons:has(> .extraMesButtons.visible) {\n        overflow: visible !important;\n      }\n\n      html:not([data-cw-v4]) body.${READY_CLASS}\n        #chat > .mes[is_user="false"] .mes_buttons > .extraMesButtons.visible {\n        position: absolute !important;\n        inset: auto auto 32px 0 !important;\n        z-index: 32 !important;\n        display: flex !important;\n        align-items: center !important;\n        align-content: flex-start !important;\n        flex-direction: row !important;\n        flex-wrap: wrap !important;\n        gap: 4px !important;\n        box-sizing: border-box !important;\n        width: min(248px, calc(100vw - 32px)) !important;\n        max-width: calc(100vw - 32px) !important;\n        height: auto !important;\n        min-height: 38px !important;\n        max-height: min(44dvh, 220px) !important;\n        margin: 0 !important;\n        padding: 6px !important;\n        overflow-x: hidden !important;\n        overflow-y: auto !important;\n        color: var(--cw-text-body, #ece9e2) !important;\n        background: var(--cw-surface-raised, #242422) !important;\n        border: 1px solid var(--cw-rule-hairline, rgba(128,128,128,.24)) !important;\n        border-radius: 10px !important;\n        box-shadow: 0 10px 30px rgba(0,0,0,.18) !important;\n        scrollbar-width: thin !important;\n      }\n\n      html:not([data-cw-v4]) body.${READY_CLASS}\n        #chat > .mes[is_user="false"] .extraMesButtons.visible\n        > .mes_button:not(.displayNone):not([hidden]):not([style*="display: none"]):not([style*="display:none"]) {\n        display: inline-flex !important;\n        align-items: center !important;\n        justify-content: center !important;\n        flex: 0 0 30px !important;\n        width: 30px !important;\n        min-width: 30px !important;\n        max-width: 30px !important;\n        height: 30px !important;\n        min-height: 30px !important;\n        max-height: 30px !important;\n        margin: 0 !important;\n        padding: 0 !important;\n        visibility: visible !important;\n        opacity: .82 !important;\n        pointer-events: auto !important;\n      }\n\n      html body.${READY_CLASS}\n        #chat > .mes .mes_buttons > :not(script):not(style) {\n        visibility: visible !important;\n        opacity: .72 !important;\n        pointer-events: auto !important;\n        cursor: pointer !important;\n        flex: 0 0 auto !important;\n      }\n\n      html body.${READY_CLASS} #chat > .mes :is(.mes_create_bookmark,.mes_create_branch) {\n        pointer-events: auto !important;\n        cursor: pointer !important;\n      }\n\n      html body.${READY_CLASS} #chat > .mes:has(.edit_textarea) .mes_buttons {\n        display: none !important;\n      }\n\n      html body.${READY_CLASS} #chat > .mes .mes_buttons > :is(.displayNone,[hidden]),\n      html body.${READY_CLASS} #chat > .mes .extraMesButtons > :is(.displayNone,[hidden]) {\n        display: none !important;\n      }\n\n      html[data-claude-quote-body-color="on"] body.${READY_CLASS} #chat :is(.mes_text,.mes_reasoning) :is(q,.quote) {\n        color: var(--cw-text-body, var(--SmartThemeBodyColor)) !important;\n      }\n\n      body.${READY_CLASS}.${GENERATING_CLASS} #chat #typing_indicator.typing_indicator {\n        display: flex !important;\n        visibility: visible !important;\n        opacity: 1 !important;\n      }\n\n      :is(#completion_prompt_manager,#completion_prompt_manager_popup)\n        .prompt_manager_prompt_controls > :is(\n          .prompt-manager-detach-action,\n          .prompt-manager-edit-action,\n          .prompt-manager-delete-action,\n          .prompt-manager-toggle-action,\n          [data-action*="delete" i]\n        ) {\n        display: inline-flex !important;\n        align-items: center !important;\n        justify-content: center !important;\n        min-width: 28px !important;\n        min-height: 28px !important;\n        color: var(--cw-text-secondary, var(--cw-text-muted)) !important;\n        opacity: .88 !important;\n        visibility: visible !important;\n        pointer-events: auto !important;\n      }\n\n      :is(#completion_prompt_manager,#completion_prompt_manager_popup)\n        .prompt_manager_prompt_controls > :is(.prompt-manager-delete-action,[data-action*="delete" i]) {\n        color: var(--cw-mark, currentColor) !important;\n      }\n\n      #completion_prompt_manager :is(.completion_prompt_manager_footer,[class$="prompt_manager_footer"]) {\n        position: sticky !important;\n        bottom: 0 !important;\n        z-index: 4 !important;\n        display: flex !important;\n        align-items: center !important;\n        gap: 6px !important;\n        box-sizing: border-box !important;\n        width: 100% !important;\n        padding: 8px 4px !important;\n        background: var(--cw-surface-page) !important;\n      }\n\n      #completion_prompt_manager :is(.completion_prompt_manager_footer,[class$="prompt_manager_footer"]) > select {\n        flex: 1 1 140px !important;\n        min-width: 100px !important;\n      }\n\n      #completion_prompt_manager :is(.completion_prompt_manager_footer,[class$="prompt_manager_footer"]) > .menu_button {\n        display: inline-flex !important;\n        align-items: center !important;\n        justify-content: center !important;\n        flex: 0 0 32px !important;\n        width: 32px !important;\n        min-width: 32px !important;\n        height: 32px !important;\n        margin: 0 !important;\n        padding: 0 !important;\n        opacity: .9 !important;\n        visibility: visible !important;\n      }\n\n      #completion_prompt_manager :is(.completion_prompt_manager_footer,[class$="prompt_manager_footer"])\n        > .caution[title*="delete" i] {\n        color: #c15f50 !important;\n        border-color: color-mix(in srgb, #c15f50 55%, transparent) !important;\n        opacity: 1 !important;\n      }\n\n      @media (max-width:700px) {\n        /* 移动抽屉自己从屏幕顶端铺开，但内容必须从 56px 顶栏下方开始。\n           这同时避免设置标题和右上角 Clawd 叠在一起。 */\n        html body.${MOBILE_LAYOUT_CLASS} #top-settings-holder\n          > .drawer > .drawer-content.openDrawer,\n        html body.${MOBILE_LAYOUT_CLASS} #top-settings-holder\n          > #rightNavHolder > .drawer-content.openDrawer {\n          top: 0 !important;\n          bottom: auto !important;\n          height: 100dvh !important;\n          min-height: 100dvh !important;\n          max-height: 100dvh !important;\n          margin: 0 !important;\n          padding-top: calc(env(safe-area-inset-top, 0px) + 58px) !important;\n          scroll-padding-top: calc(env(safe-area-inset-top, 0px) + 58px) !important;\n        }\n\n        html body.${MOBILE_LAYOUT_CLASS} #rightNavHolder\n          > .drawer-content.openDrawer > :is(#right-nav-panelheader,#CharListButtonAndHotSwaps,#rm_PinAndTabs,.scrollableInner),\n        html body.${MOBILE_LAYOUT_CLASS} #rightNavHolder\n          > .drawer-content.openDrawer #rm_characters_block,\n        html body.${MOBILE_LAYOUT_CLASS} #rightNavHolder\n          > .drawer-content.openDrawer #charListFixedTop {\n          inset: auto !important;\n          margin-top: 0 !important;\n          translate: none !important;\n        }\n\n        html body.${MOBILE_LAYOUT_CLASS} #user-settings-block\n          > .flex-container.flexFlowColumn:first-child {\n          gap: 8px !important;\n        }\n\n        html body.${MOBILE_LAYOUT_CLASS} #user-settings-block [name="userSettingsRowOne"] {\n          display: grid !important;\n          grid-template-columns: minmax(0,1fr) minmax(132px,1fr) !important;\n          align-items: start !important;\n          gap: 7px 10px !important;\n          width: 100% !important;\n          min-height: 0 !important;\n        }\n\n        html body.${MOBILE_LAYOUT_CLASS} #user-settings-block [name="userSettingsRowOne"]\n          > :first-child {\n          grid-column: 1 / 2 !important;\n          min-width: 0 !important;\n        }\n\n        html body.${MOBILE_LAYOUT_CLASS} #user-settings-block #UI-language-block {\n          grid-column: 2 / 3 !important;\n          display: grid !important;\n          grid-template-columns: 1fr !important;\n          gap: 4px !important;\n          min-width: 0 !important;\n        }\n\n        html body.${MOBILE_LAYOUT_CLASS} #user-settings-block #version_display {\n          grid-column: 1 / -1 !important;\n          display: block !important;\n          min-width: 0 !important;\n          overflow-wrap: anywhere !important;\n        }\n\n        html body.${MOBILE_LAYOUT_CLASS} #user-settings-block [name="UserSettingsRowTwo"] {\n          display: grid !important;\n          grid-template-columns: minmax(0,auto) minmax(120px,1fr) !important;\n          align-items: center !important;\n          gap: 8px !important;\n        }\n\n        /* TT 的 WebView 在全屏抽屉 transform 动画期间会重绘整个长设置页。\n           静态切换比持续卡顿更可用，ST/Via 仍保留原动画。 */\n        html body.${MOBILE_LAYOUT_CLASS}.clawd-tauritavern-host\n          #top-settings-holder > .drawer > .drawer-content {\n          transition: none !important;\n          animation: none !important;\n          will-change: auto !important;\n        }\n\n        #completion_prompt_manager #completion_prompt_manager_list\n          > li.completion_prompt_manager_prompt > span:has(> .prompt_manager_prompt_controls),\n        #completion_prompt_manager #completion_prompt_manager_list .prompt_manager_prompt_controls {\n          min-width: 104px !important;\n        }\n\n        /* TT 偶尔保留 drag-handle 节点却不画它的 ☰ 文本。把字形放进伪元素，\n           触摸事件仍由原节点接收，拖拽排序行为与 ST 原生实现一致。 */\n        html body.${MOBILE_LAYOUT_CLASS}\n          :is(#completion_prompt_manager,#completion_prompt_manager_popup) #completion_prompt_manager_list\n          > li.completion_prompt_manager_prompt:has(> .clawd-prompt-drag-handle) {\n          display: grid !important;\n          grid-template-columns: 28px minmax(0,1fr) auto auto !important;\n          align-items: center !important;\n          column-gap: 4px !important;\n          padding-left: 4px !important;\n        }\n\n        html body.${MOBILE_LAYOUT_CLASS}\n          :is(#completion_prompt_manager,#completion_prompt_manager_popup) #completion_prompt_manager_list\n          > li.completion_prompt_manager_prompt:has(> .clawd-prompt-drag-handle)\n          > .drag-handle {\n          position: static !important;\n          inset: auto !important;\n          grid-column: 1 !important;\n          grid-row: 1 !important;\n          z-index: 3 !important;\n          display: inline-flex !important;\n          align-items: center !important;\n          justify-content: center !important;\n          box-sizing: border-box !important;\n          width: 28px !important;\n          min-width: 28px !important;\n          height: 28px !important;\n          margin: 0 !important;\n          padding: 0 !important;\n          color: var(--cw-text-secondary, var(--cw-text-muted, #777)) !important;\n          background-color: transparent !important;\n          background-image: none !important;\n          box-shadow: none !important;\n          filter: none !important;\n          text-shadow: none !important;\n          font-size: 0 !important;\n          line-height: 1 !important;\n          visibility: visible !important;\n          opacity: .9 !important;\n          pointer-events: auto !important;\n          cursor: grab !important;\n          touch-action: none !important;\n          user-select: none !important;\n          -webkit-user-select: none !important;\n        }\n\n        html body.${MOBILE_LAYOUT_CLASS}\n          :is(#completion_prompt_manager,#completion_prompt_manager_popup) #completion_prompt_manager_list\n          > li.completion_prompt_manager_prompt:has(> .clawd-prompt-drag-handle)\n          > .drag-handle::before {\n          content: none !important;\n          display: none !important;\n        }\n\n        html body.${MOBILE_LAYOUT_CLASS}\n          :is(#completion_prompt_manager,#completion_prompt_manager_popup) #completion_prompt_manager_list\n          > li.completion_prompt_manager_prompt:has(> .clawd-prompt-drag-handle)\n          > .drag-handle > .clawd-prompt-drag-glyph {\n          display: inline-flex !important;\n          flex-direction: column !important;\n          align-items: center !important;\n          justify-content: center !important;\n          gap: 3px !important;\n          width: 16px !important;\n          height: 16px !important;\n          color: var(--cw-text-secondary, var(--cw-text-muted, #777)) !important;\n          box-shadow: none !important;\n          filter: none !important;\n          text-shadow: none !important;\n          visibility: visible !important;\n          opacity: 1 !important;\n        }\n\n        html body.${MOBILE_LAYOUT_CLASS}\n          :is(#completion_prompt_manager,#completion_prompt_manager_popup) #completion_prompt_manager_list\n          > li.completion_prompt_manager_prompt:has(> .clawd-prompt-drag-handle)\n          > .drag-handle > .clawd-prompt-drag-glyph > span {\n          display: block !important;\n          box-sizing: border-box !important;\n          width: 16px !important;\n          min-width: 16px !important;\n          height: 2px !important;\n          min-height: 2px !important;\n          margin: 0 !important;\n          padding: 0 !important;\n          background: currentColor !important;\n          border: 0 !important;\n          border-radius: 1px !important;\n          box-shadow: none !important;\n          filter: none !important;\n          text-shadow: none !important;\n          visibility: visible !important;\n          opacity: 1 !important;\n        }\n\n        html body.${MOBILE_LAYOUT_CLASS}\n          :is(#completion_prompt_manager,#completion_prompt_manager_popup) #completion_prompt_manager_list\n          > li.completion_prompt_manager_prompt:has(> .clawd-prompt-drag-handle)\n          > .completion_prompt_manager_prompt_name {\n          grid-column: 2 !important;\n          grid-row: 1 !important;\n          display: grid !important;\n          grid-template-columns: 26px minmax(0,1fr) !important;\n          align-items: center !important;\n          column-gap: 8px !important;\n          min-width: 0 !important;\n        }\n\n        #completion_prompt_manager_list\n          .completion_prompt_manager_prompt_name > :is(.fa-fw,.fa-solid,.fa-regular):first-child {\n          position: static !important;\n          inset: auto !important;\n          grid-column: 1 !important;\n          display: inline-flex !important;\n          align-items: center !important;\n          justify-content: center !important;\n          box-sizing: border-box !important;\n          width: 26px !important;\n          min-width: 26px !important;\n          max-width: 26px !important;\n          margin: 0 !important;\n          transform: none !important;\n        }\n\n        #completion_prompt_manager_list\n          .completion_prompt_manager_prompt_name > :is(a,span):not(.fa-fw):not(.fa-solid):not(.fa-regular) {\n          grid-column: 2 !important;\n          min-width: 0 !important;\n          overflow: hidden !important;\n          text-overflow: ellipsis !important;\n          white-space: nowrap !important;\n        }\n\n        #completion_prompt_manager :is(.completion_prompt_manager_footer,[class$="prompt_manager_footer"]) {\n          flex-wrap: wrap !important;\n          justify-content: flex-end !important;\n          padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px)) !important;\n        }\n\n        #completion_prompt_manager :is(.completion_prompt_manager_footer,[class$="prompt_manager_footer"]) > select {\n          flex: 1 0 100% !important;\n          width: 100% !important;\n        }\n\n        html body.${MOBILE_LAYOUT_CLASS} #qr--bar #input_helper_toolbar,\n        html body.${MOBILE_LAYOUT_CLASS} #qr--bar .qrq-wrapper-visible #input_helper_toolbar {\n          position: static !important;\n          inset: auto !important;\n          transform: none !important;\n          float: none !important;\n          max-width: 100% !important;\n        }\n\n        html body.${MOBILE_LAYOUT_CLASS} #completion_prompt_manager_popup.openDrawer {\n          inset: 0 0 auto 0 !important;\n          height: var(--cl-mobile-popup-height, var(--cl-mobile-viewport-height, 100vh)) !important;\n          min-height: var(--cl-mobile-popup-height, var(--cl-mobile-viewport-height, 100vh)) !important;\n          max-height: var(--cl-mobile-popup-height, var(--cl-mobile-viewport-height, 100vh)) !important;\n        }\n\n        html body.${MOBILE_LAYOUT_CLASS} #completion_prompt_manager_popup.openDrawer::after {\n          flex-basis: max(0px, calc(var(--cl-mobile-popup-height, var(--cl-mobile-viewport-height, 100vh)) - 100dvh + 16px)) !important;\n          height: max(0px, calc(var(--cl-mobile-popup-height, var(--cl-mobile-viewport-height, 100vh)) - 100dvh + 16px)) !important;\n          min-height: max(0px, calc(var(--cl-mobile-popup-height, var(--cl-mobile-viewport-height, 100vh)) - 100dvh + 16px)) !important;\n        }\n      }\n\n      button.${LEFT_SWIPE_PROXY_CLASS},\n      button.${SWIPE_PROXY_CLASS} {\n        appearance: none !important;\n        -webkit-appearance: none !important;\n        position: absolute !important;\n        top: 50% !important;\n        z-index: 12 !important;\n        display: flex !important;\n        align-items: center !important;\n        justify-content: center !important;\n        width: 34px !important;\n        min-width: 34px !important;\n        height: 48px !important;\n        min-height: 48px !important;\n        margin: 0 !important;\n        padding: 0 !important;\n        color: var(--cw-text-muted, #8b8780) !important;\n        background: transparent !important;\n        border: 0 !important;\n        border-radius: 10px !important;\n        outline: 0 !important;\n        box-shadow: none !important;\n        opacity: var(--cl-swipe-opacity, .48) !important;\n        pointer-events: auto !important;\n        cursor: pointer !important;\n        transform: translateY(-50%) !important;\n        transition: opacity 140ms ease, color 140ms ease, background 140ms ease !important;\n      }\n\n      button.${LEFT_SWIPE_PROXY_CLASS} { left: 0 !important; }\n      button.${SWIPE_PROXY_CLASS} { right: 0 !important; }\n\n      /* 设置里关掉「回复两侧的左右切换箭头」：只是不显示，按钮还在，操作栏的 ‹ › 仍靠它们切换。 */\n      html[data-claude-side-swipe="off"] body button.${LEFT_SWIPE_PROXY_CLASS},\n      html[data-claude-side-swipe="off"] body button.${SWIPE_PROXY_CLASS} { display: none !important; }\n\n      button.${LEFT_SWIPE_PROXY_CLASS}::before,\n      button.${SWIPE_PROXY_CLASS}::before {\n        font-family: "Font Awesome 6 Free" !important;\n        font-size: 18px !important;\n        font-weight: 900 !important;\n        line-height: 1 !important;\n      }\n\n      button.${LEFT_SWIPE_PROXY_CLASS}::before { content: "\\f053" !important; }\n      button.${SWIPE_PROXY_CLASS}::before { content: "\\f054" !important; }\n\n      #chat > .mes[is_user="false"]:hover > button.${LEFT_SWIPE_PROXY_CLASS},\n      #chat > .mes[is_user="false"]:hover > button.${SWIPE_PROXY_CLASS},\n      #chat > .mes[is_user="false"]:focus-within > button.${LEFT_SWIPE_PROXY_CLASS},\n      #chat > .mes[is_user="false"]:focus-within > button.${SWIPE_PROXY_CLASS} {\n        opacity: .72 !important;\n        pointer-events: auto !important;\n      }\n\n      #chat > .mes[is_user="false"] > button.${LEFT_SWIPE_PROXY_CLASS}:hover,\n      #chat > .mes[is_user="false"] > button.${SWIPE_PROXY_CLASS}:hover {\n        color: var(--cw-text-body, #ece9e2) !important;\n        background: var(--cw-surface-hover, rgba(128,128,128,.12)) !important;\n        opacity: 1 !important;\n      }\n\n      #chat > .mes[is_user="false"] .mes_buttons > button.${REROLL_CLASS} {\n        appearance: none !important;\n        -webkit-appearance: none !important;\n        order: 20 !important;\n        display: flex !important;\n        align-items: center !important;\n        justify-content: center !important;\n        flex: 0 0 26px !important;\n        width: 26px !important;\n        min-width: 26px !important;\n        max-width: 26px !important;\n        height: 26px !important;\n        min-height: 26px !important;\n        max-height: 26px !important;\n        margin: 0 !important;\n        padding: 0 !important;\n        color: var(--cw-text-muted, #8b8780) !important;\n        background: transparent !important;\n        border: 0 !important;\n        border-radius: 8px !important;\n        outline: 0 !important;\n        box-shadow: none !important;\n        opacity: .62 !important;\n        cursor: pointer !important;\n        line-height: 1 !important;\n        transform: none !important;\n        transition: color 130ms ease, background 130ms ease, opacity 130ms ease, transform 130ms ease !important;\n      }\n\n      button.${REROLL_CLASS}::before {\n        content: "\\f2f9" !important;\n        font-family: "Font Awesome 6 Free" !important;\n        font-size: 12px !important;\n        font-weight: 900 !important;\n        line-height: 1 !important;\n      }\n\n      button.${REROLL_CLASS}:hover {\n        color: var(--cw-text-body, #ece9e2) !important;\n        background: var(--cw-surface-hover, rgba(128,128,128,.12)) !important;\n        opacity: 1 !important;\n        transform: rotate(-16deg) !important;\n      }\n\n      button.${REROLL_CLASS}:active {\n        transform: rotate(-24deg) scale(.88) !important;\n      }\n\n      @media (max-width: 700px) {\n        button.${BUTTON_CLASS} {\n          width: 38px !important;\n          min-width: 38px !important;\n          max-width: 38px !important;\n          height: 31px !important;\n          min-height: 31px !important;\n          max-height: 31px !important;\n          background-size: 38px 38px !important;\n        }\n\n        body.${MOBILE_LAYOUT_CLASS}:not(.clawd-welcome) #chat > .mes[is_user="false"] > button.${LEFT_SWIPE_PROXY_CLASS},\n        body.${MOBILE_LAYOUT_CLASS}:not(.clawd-welcome) #chat > .mes[is_user="false"] > button.${SWIPE_PROXY_CLASS} {\n          position: fixed !important;\n          top: 50% !important;\n          z-index: 118 !important;\n          width: 38px !important;\n          min-width: 38px !important;\n          height: 54px !important;\n          min-height: 54px !important;\n          color: var(--cw-text-body, #ece9e2) !important;\n          background: color-mix(in srgb, var(--cl-canvas, #191918) 82%, transparent) !important;\n          border: 1px solid var(--cl-line, rgba(128,128,128,.24)) !important;\n          opacity: .74 !important;\n          transform: translateY(-50%) !important;\n          backdrop-filter: none !important;\n        }\n\n        #chat > .mes[is_user="false"] { position: relative !important; }\n\n        body.${MOBILE_LAYOUT_CLASS}:not(.clawd-welcome) #chat > .mes[is_user="false"] > button.${LEFT_SWIPE_PROXY_CLASS} { left: 5px !important; }\n        body.${MOBILE_LAYOUT_CLASS}:not(.clawd-welcome) #chat > .mes[is_user="false"] > button.${SWIPE_PROXY_CLASS} { right: 5px !important; }\n\n        body.${MOBILE_LAYOUT_CLASS}:not(.clawd-welcome) #chat > .mes[is_user="false"] > button.${LEFT_SWIPE_PROXY_CLASS}:disabled,\n        body.${MOBILE_LAYOUT_CLASS}:not(.clawd-welcome) #chat > .mes[is_user="false"] > button.${SWIPE_PROXY_CLASS}:disabled {\n          display:flex !important;\n          opacity:.22 !important;\n          pointer-events:none !important;\n        }\n\n        body.${MOBILE_LAYOUT_CLASS}:not(.clawd-welcome) #chat > .mes[is_user="false"]:not(.${SWIPE_VIEW_CLASS}) > button.${LEFT_SWIPE_PROXY_CLASS},\n        body.${MOBILE_LAYOUT_CLASS}:not(.clawd-welcome) #chat > .mes[is_user="false"]:not(.${SWIPE_VIEW_CLASS}) > button.${SWIPE_PROXY_CLASS} {\n          visibility: hidden !important;\n          opacity: 0 !important;\n          pointer-events: none !important;\n        }\n      }\n\n      /* 以前这里还有 transform: none !important——那是给旧画法按钮整体弹跳用的，\n         现在按钮的 transform 是 A2 写的位置（拖动、走路、落点），一并清掉会让 Clawd 在「减少动态」下拖不动。 */\n      @media (prefers-reduced-motion: reduce) {\n        button.${BUTTON_CLASS} {\n          animation: none !important;\n          transition: none !important;\n        }\n      }\n    `);
      hostDocument.head.append(style);
      hostDocument.documentElement.style.setProperty("--clawd-signoff-image", `url("${CLAWD_IMAGE}")`);
    }
    function isElementVisible(element) {
      if (!(element instanceof hostWindow.HTMLElement)) return !1;
      const style = hostWindow.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) !== 0 && rect.height > 0;
    }
    function isTypingActive() {
      if (generationSubscriptions.length) return generationEventActive;
      return [ ...hostDocument.querySelectorAll(".typing_indicator") ].some(isElementVisible);
    }
    function getContext() {
      const bridge = typeof SillyTavern !== "undefined" ? SillyTavern : hostWindow.SillyTavern;
      if (typeof bridge?.getContext === "function") return bridge.getContext();
      return bridge ?? null;
    }
    function composerClawd() {
      return hostDocument.querySelector(`#send_form > button.${BUTTON_CLASS}.clawd-composer-clawd`);
    }
    function clawdVisualNodes() {
      return hostDocument.querySelectorAll(`button.${BUTTON_CLASS}`);
    }
    function clawdVisibleState() {
      return clawdTracks.C || clawdTracks.A || clawdTracks.B || "idle";
    }
    function renderClawdTracks() {
      if (!clawdEnabled()) return;
      const visible = clawdVisibleState();
      const owner = clawdTracks.C ? "C" : clawdTracks.A ? "A" : "B";
      const showClawd = clawdEnabled();
      const generationInFlight = clawdTracks.A === "think" || clawdTracks.A === "stream" || clawdTracks.A === "sit";
      clawdVisualNodes().forEach(button => {
        const isComposer = button.classList.contains("clawd-composer-clawd");
        const state = {
          clawdA: clawdTracks.A || "",
          clawdB: clawdTracks.B || "",
          clawdC: clawdTracks.C || "",
          clawdState: visible,
          clawdOwner: owner,
          clawdRole: isComposer ? "composer" : "signoff"
        };
        for (const [key, value] of Object.entries(state)) button.dataset[key] !== value && (button.dataset[key] = value);
        const display = !showClawd || !isComposer && generationInFlight ? "none" : "block";
        button.style.getPropertyValue("display") === display && button.style.getPropertyPriority("display") === "important" || button.style.setProperty("display", display, "important");
        isComposer && syncClawdRig(button, owner);
      });
    }
    function installClawdRigStyle() {
      hostDocument.getElementById(CLAWD_RIG_STYLE_ID)?.remove();
      const RB = `#send_form > button.${BUTTON_CLASS}.clawd-composer-clawd`;
      const style = hostDocument.createElement("style");
      style.id = CLAWD_RIG_STYLE_ID;
      style.textContent = `\n      ${RB} > .clawd-rig { display: none; position: absolute; left: -4px; top: -14px; width: 3px; height: 3px;\n        transform-origin: 24px 48px; pointer-events: none; }\n      ${RB}[data-clawd-rig="on"] > .clawd-rig { display: block; }\n      ${RB} .clr-root { position: absolute; left: 0; top: 0; }\n      ${RB} .clr-p { position: absolute; left: 0; top: 0; width: 3px; height: 3px; }\n      /* 待机时眼睛照旧跟着鼠标看（沿用现网的 clawd-look-* 四个方向），播动作时由动作自己管眼睛 */\n      ${RB}[data-clawd-rig="on"]:not([data-clawd-clip]).clawd-look-l .clr-p-eyes { translate: -3px 0; }\n      ${RB}[data-clawd-rig="on"]:not([data-clawd-clip]).clawd-look-r .clr-p-eyes { translate: 3px 0; }\n      ${RB}[data-clawd-rig="on"]:not([data-clawd-clip]).clawd-look-u .clr-p-eyes { translate: 0 -3px; }\n      ${RB}[data-clawd-rig="on"]:not([data-clawd-clip]).clawd-look-d .clr-p-eyes { translate: 0 3px; }\n      @media (prefers-reduced-motion: reduce) {\n        ${RB} .clawd-rig, ${RB} .clawd-rig * { animation: none !important; }\n      }\n    ` + CLAWD_RIG.css;
      clawdRigInjected.clear();
      hostDocument.head.append(style);
      clawdRigSchedulePrewarm();
    }
    const CLAWD_RIG_PREWARM = [ "press", "grab", "drag", "dragSwing", "fly", "land", "stomp", "stompSlap", "pet", "poke1", "poke1Shy", "poke2", "poke3", "poke4", "rage" ];
    let clawdRigPrewarmTimer = 0;
    let clawdRigPrewarmIsIdle = !1;
    function clawdRigSchedulePrewarm() {
      if (!clawdEnabled()) return;
      if (clawdRigPrewarmTimer) return;
      const run = () => {
        clawdRigPrewarmTimer = 0;
        if (!clawdEnabled()) return;
        const style = hostDocument.getElementById(CLAWD_RIG_STYLE_ID);
        if (!style) return;
        const composer = hostDocument.querySelector(`#send_form > button.${BUTTON_CLASS}.clawd-composer-clawd`);
        composer && clawdRigGhostHostFor(composer);
        const ids = CLAWD_RIG_PREWARM.filter(id => CLAWD_RIG.clips[id]).flatMap(id => [ id, id + "-m" ]).filter(id => !clawdRigInjected.has(id));
        if (!ids.length) return;
        style.append(hostDocument.createTextNode(ids.map(id => CLAWD_RIG.cssFor(id)).join("\n")));
        ids.forEach(id => clawdRigInjected.add(id));
      };
      clawdRigPrewarmIsIdle = typeof hostWindow.requestIdleCallback === "function";
      clawdRigPrewarmTimer = clawdRigPrewarmIsIdle ? hostWindow.requestIdleCallback(run, {
        timeout: 4e3
      }) : clawdLater(run, 1500);
    }
    function ensureClawdRigClipCss(id) {
      if (clawdRigInjected.has(id)) return;
      const style = hostDocument.getElementById(CLAWD_RIG_STYLE_ID);
      if (!style) return;
      style.append(hostDocument.createTextNode(CLAWD_RIG.cssFor(id)));
      clawdRigInjected.add(id);
    }
    function ensureClawdRig(button) {
      if (button.querySelector(":scope > .clawd-rig")) return;
      const rig = hostDocument.createElement("span");
      rig.className = "clawd-rig";
      rig.setAttribute("aria-hidden", "true");
      const root = hostDocument.createElement("span");
      root.className = "clr-root";
      const flex = hostDocument.createElement("span");
      flex.className = "clr-flex";
      CLAWD_RIG.parts.forEach(part => {
        const node = hostDocument.createElement("i");
        node.className = `clr-p clr-p-${part}`;
        (part === "shadow" ? root : flex).append(node);
      });
      root.append(flex);
      rig.append(root);
      button.append(rig);
    }
    function clawdRigClipFor(owner) {
      if (owner === "C") {
        if (clawdTracks.C === "t1") return clawdRigPokeT1;
        if (clawdTracks.C in clawdRigVariant) return clawdRigVariant[clawdTracks.C];
        return CLAWD_RIG_C[clawdTracks.C] || "";
      }
      if (owner === "A") return (A2.floor ? CLAWD_RIG_A_HELD : CLAWD_RIG_A)[clawdTracks.A] || "";
      const b = clawdTracks.B || "idle";
      if (b.startsWith("rig:")) {
        const id = b.slice(4);
        return CLAWD_RIG.clips[id.replace(/-m$/, "")] ? id : "";
      }
      return CLAWD_RIG_B[b] || "";
    }
    function clawdRigContinues(base, curBase) {
      const meta = CLAWD_RIG.clips[base], cur = CLAWD_RIG.clips[curBase];
      if (!meta || !cur) return !1;
      return meta.from === curBase || meta.after === curBase || cur.next === base || cur.from === base || Boolean(meta.from && meta.from === cur.from);
    }
    const CLAWD_RIG_CELL = 3;
    function clawdRigShouldMirror(button, base) {
      const ext = CLAWD_RIG.extentFor(base);
      if (!ext.l && !ext.r) return !1;
      const now = Date.now();
      if (!A2.bndReady || now - A2.bndAt > A2_BOUNDS_TTL) {
        A2.bnd = a2Walls(button);
        A2.bndAt = now;
        A2.bndReady = !0;
      }
      const left = A2.x - Math.max(A2.bnd.minx, A2.bnd.minxHome), right = A2.bnd.maxxHome - A2.x;
      const over = (l, r) => Math.max(0, r * CLAWD_RIG_CELL - right) + Math.max(0, l * CLAWD_RIG_CELL - left);
      return over(ext.r, ext.l) < over(ext.l, ext.r);
    }
    const CLAWD_RIG_INTERRUPT = Object.freeze({
      plant: "wither",
      plantWilt: "wither",
      butterfly: "fly",
      onFire: "fade",
      siren: "fade",
      sirenBlue: "fade"
    });
    let clawdRigGhostHost = null;
    const clawdRigGhostJobs = new Map;
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
      if (clawdRigPrewarmTimer) {
        clawdRigPrewarmIsIdle ? hostWindow.cancelIdleCallback?.(clawdRigPrewarmTimer) : cancelClawdLater(clawdRigPrewarmTimer);
        clawdRigPrewarmTimer = 0;
      }
      for (const layer of clawdRigGhostJobs.keys()) removeClawdRigGhost(layer);
      clawdRigGhostHost?.remove();
      clawdRigGhostHost = null;
      clawdRigSnap = null;
    }
    function clawdRigGhostHostFor(button) {
      if (!clawdRigGhostHost || !clawdRigGhostHost.isConnected) {
        clawdRigGhostHost = hostDocument.createElement("span");
        clawdRigGhostHost.className = "clr-ghost-host";
        clawdRigGhostHost.setAttribute("aria-hidden", "true");
        let z = 1;
        for (let el = button.parentElement; el && el !== hostDocument.body; el = el.parentElement) {
          const zi = hostWindow.getComputedStyle(el).zIndex;
          zi !== "auto" && (z = Number(zi) || z);
        }
        clawdRigGhostHost.style.cssText = `position:fixed;display:block;left:0;top:0;width:0;height:0;margin:0;padding:0;pointer-events:none;overflow:visible;contain:layout style;z-index:${z}`;
        hostDocument.body.append(clawdRigGhostHost);
      }
      return clawdRigGhostHost;
    }
    function clawdRigReadProps(button) {
      const rig = button.querySelector(":scope > .clawd-rig");
      const flex = rig && rig.querySelector(".clr-flex");
      if (!flex || !button.dataset.clawdClip) return null;
      const props = [];
      for (const node of flex.querySelectorAll(".clr-p-propA, .clr-p-propB")) {
        const cs = hostWindow.getComputedStyle(node);
        const o = Number(cs.opacity);
        if (!cs.boxShadow || cs.boxShadow === "none" || o === 0) continue;
        props.push({
          shadow: cs.boxShadow,
          left: cs.left,
          top: cs.top,
          z: cs.zIndex,
          o: o
        });
      }
      if (!props.length) return null;
      const rcs = hostWindow.getComputedStyle(rig);
      const root = rig.querySelector(".clr-root");
      const rootCs = root ? hostWindow.getComputedStyle(root) : null;
      const rect = rig.getBoundingClientRect();
      return {
        props: props,
        rect: rect,
        rootT: rootCs ? rootCs.transform : "none",
        rootL: rootCs ? rootCs.left : "0px",
        rootT2: rootCs ? rootCs.top : "0px",
        origin: rcs.transformOrigin.split(" ").map(v => parseFloat(v) || 0)
      };
    }
    let clawdRigSnap = null;
    function clawdRigSnapshotProps(button) {
      clawdRigSnap = null;
      if (!button.dataset.clawdClip || clawdPrefersReducedMotion()) return;
      clawdRigSnap = {
        clip: button.dataset.clawdClip,
        at: Date.now(),
        data: clawdRigReadProps(button)
      };
    }
    function clawdRigDropProps(button, clipBase) {
      if (clawdPrefersReducedMotion()) {
        clawdRigSnap = null;
        return;
      }
      const cur = button.dataset.clawdClip || "";
      const snap = clawdRigSnap && clawdRigSnap.clip === cur && Date.now() - clawdRigSnap.at < 150 ? clawdRigSnap : null;
      clawdRigSnap = null;
      const data = snap ? snap.data : clawdRigReadProps(button);
      if (!data) return;
      const {props: props, rect: rect, rootT: rootT, rootL: rootL, rootT2: rootT2} = data;
      const [ox, oy] = data.origin;
      const kind = CLAWD_RIG_INTERRUPT[clipBase] || "drop";
      const scale = rect.width / 3 || 1;
      const host = clawdRigGhostHostFor(button);
      const layer = hostDocument.createElement("span");
      layer.style.cssText = `position:absolute;display:block;width:3px;height:3px;left:${rect.left - ox * (1 - scale)}px;top:${rect.top - oy * (1 - scale)}px;transform:scale(${scale});transform-origin:${ox}px ${oy}px`;
      const inner = hostDocument.createElement("span");
      inner.style.cssText = `position:absolute;display:block;left:${rootL};top:${rootT2};transform:${rootT}`;
      layer.append(inner);
      const jobs = props.map(p => {
        const pts = [ ...p.shadow.matchAll(/(-?[\d.]+)px (-?[\d.]+)px 0px/g) ].map(m => [ Number(m[1]), Number(m[2]) ]);
        const ax = pts.length ? pts.reduce((sum, pt) => sum + pt[0], 0) / pts.length : 24;
        const ay = pts.length ? pts.reduce((sum, pt) => sum + pt[1], 0) / pts.length : 0;
        const by = pts.length ? Math.max(...pts.map(pt => pt[1])) : 0;
        const dir = ax + (parseFloat(p.left) || 0) < 24 ? -1 : 1;
        const o = p.o;
        const ghost = hostDocument.createElement("i");
        ghost.className = "clr-ghost";
        ghost.style.cssText = `position:absolute;display:block;width:3px;height:3px;box-shadow:${p.shadow};left:${p.left};top:${p.top};z-index:${p.z};opacity:${o};transform-origin:${ax}px ${kind === "wither" ? by : ay}px`;
        inner.append(ghost);
        const frames = kind === "fade" ? [ {
          opacity: o,
          easing: "ease-out"
        }, {
          opacity: 0
        } ] : kind === "wither" ? [ {
          scale: "1 1",
          filter: "none",
          opacity: o,
          easing: "ease-out"
        }, {
          scale: "1 .7",
          filter: "grayscale(1)",
          opacity: o * .7,
          offset: .35,
          easing: "ease-in"
        }, {
          scale: "1 .15",
          filter: "grayscale(1)",
          opacity: 0
        } ] : kind === "fly" ? [ {
          translate: "0 0",
          opacity: o,
          easing: "ease-out"
        }, {
          translate: dir * 15 + "px -15px",
          opacity: o,
          offset: .35
        }, {
          translate: dir * 36 + "px -42px",
          opacity: 0
        } ] : [ {
          translate: "0 0",
          rotate: "0deg",
          opacity: o,
          easing: "cubic-bezier(.2,.7,.4,1)"
        }, {
          translate: dir * 15 + "px -12px",
          rotate: dir * 30 + "deg",
          opacity: o,
          offset: .25,
          easing: "cubic-bezier(.55,0,.85,.5)"
        }, {
          translate: dir * 36 + "px 24px",
          rotate: dir * 110 + "deg",
          opacity: 0
        } ];
        return [ ghost, frames ];
      });
      host.append(layer);
      const job = {
        timer: clawdLater(() => removeClawdRigGhost(layer), 1200),
        animations: []
      };
      clawdRigGhostJobs.set(layer, job);
      for (const [ghost, frames] of jobs) try {
        job.animations.push(ghost.animate(frames, {
          duration: kind === "drop" ? 800 : 900,
          easing: "linear",
          fill: "forwards"
        }));
      } catch (error) {
        ghost.remove();
      }
    }
    function syncClawdRig(button, owner) {
      ensureClawdRig(button);
      button.dataset.clawdRig !== "on" && (button.dataset.clawdRig = "on");
      const current = button.dataset.clawdClip || "";
      const curBase = current.replace(/-m$/, "");
      owner === "C" && clawdTracks.C === "t1" && curBase !== "poke1" && curBase !== "poke1Shy" && (clawdRigPokeT1 = Math.random() < .34 ? "poke1Shy" : "poke1");
      let clip = clawdRigClipFor(owner);
      if (clip.replace(/-m$/, "") !== "tilt") {
        const now = Date.now();
        if (curBase === "tilt") {
          clawdRigUntiltUntil = now + CLAWD_RIG.clips.untilt.dur;
          clawdLater(() => {
            destroyed || renderClawdTracks();
          }, CLAWD_RIG.clips.untilt.dur + 20);
          clip = "untilt";
        } else curBase === "untilt" && now < clawdRigUntiltUntil && (clip = "untilt");
      }
      const base = clip.replace(/-m$/, "");
      const continues = Boolean(base && curBase && clawdRigContinues(base, curBase));
      if (base && !clip.endsWith("-m") && base !== "walkLoop") {
        if (base === curBase) return;
        const mirror = continues ? current.endsWith("-m") : clawdRigShouldMirror(button, base);
        clip = mirror ? base + "-m" : base;
      }
      if (clip === current) return;
      current && !continues && clawdRigDropProps(button, curBase);
      button.removeAttribute("data-clawd-clip");
      if (clip) {
        base.startsWith("glowstick") && clawdRigPickStickColors(button);
        ensureClawdRigClipCss(clip);
        button.dataset.clawdClip = clip;
      }
    }
    const CLAWD_STICK_COLORS = Object.freeze([ "#7dff9b", "#ff6bd6", "#6be4ff", "#fff36b", "#ff9b4a", "#b18cff", "#ff5c6c" ]);
    function clawdRigPickStickColors(button) {
      const n = CLAWD_STICK_COLORS.length;
      const a = Math.floor(Math.random() * n);
      const b = (a + 1 + Math.floor(Math.random() * (n - 1))) % n;
      button.style.setProperty("--stick-a", CLAWD_STICK_COLORS[a]);
      button.style.setProperty("--stick-b", CLAWD_STICK_COLORS[b]);
    }
    function clawdMealTime(now = new Date) {
      const m = now.getHours() * 60 + now.getMinutes();
      return m >= 690 && m <= 780 || m >= 1050 && m <= 1170;
    }
    const CLAWD_RIG_ON_COMPOSER_ONLY = new Set([ "rickroll", "plant" ]);
    function clawdOverComposer() {
      if (A2.floor || A2.held || Math.abs(A2.fy) > .5) return !1;
      if (!A2.bndReady) return !0;
      return A2.x >= A2.bnd.minxHome - 1 && A2.x <= A2.bnd.maxxHome + 1;
    }
    function pickClawdRigClip(now) {
      const meal = clawdMealTime();
      const overComposer = clawdOverComposer();
      const ok = CLAWD_RIG_POOL.filter(item => overComposer || !CLAWD_RIG_ON_COMPOSER_ONLY.has(item.id)).filter(item => !(clawdRigLastPlayed[item.id] && now - clawdRigLastPlayed[item.id] < item.cool)).map(item => ({
        ...item,
        w: meal && item.mealWeight ? item.mealWeight : item.weight
      }));
      const total = ok.reduce((sum, item) => sum + item.w, 0);
      if (!total) return null;
      let roll = Math.random() * total;
      for (const item of ok) if ((roll -= item.w) <= 0) return item.id;
      return ok[ok.length - 1].id;
    }
    function clawdCancelTransientB() {
      if (!clawdTracks.bUntil) return;
      clawdTracks.B = "idle";
      clawdTracks.bUntil = 0;
    }
    const CLAWD_QUIET_WITH_RIDERS = new Set([ "idle", "peek", "peekOut", "walkLoop", "around", "point", "scratch", "facepalm", "press", "neglected", "drowsy", "sleep", "compose", "think", "stream", "sit", "stopped", "error" ]);
    function clawdShakeRiders(value) {
      if (!value) return;
      const base = String(value).replace(/^rig:/, "").replace(/-m$/, "");
      if (CLAWD_QUIET_WITH_RIDERS.has(base)) return;
      clawdPile.unloadBig("hop");
    }
    function clawdBigLower() {
      const button = composerClawd();
      A2.floor = 0;
      let seat = null, cx = 0;
      const rig = button?.querySelector(":scope > .clawd-rig")?.getBoundingClientRect();
      if (rig?.width && !A2.held) {
        cx = rig.left + 24;
        seat = clawdPile.seats().filter(st => Math.abs(cx - st.cx) < Math.max(48, st.w) * .5).sort((a, b) => b.h - a.h)[0] || null;
      }
      seat && (A2.floor = -seat.h);
      clawdTracks.A && renderClawdTracks();
      if (!button) return null;
      if (A2.held) {
        A2.petting = !1;
        cancelClawdLater(A2.petTimer);
        return null;
      }
      button.style.setProperty("transition", "transform .4s cubic-bezier(.4,0,.2,1)", "important");
      A2.fy = A2.floor;
      if (seat) {
        A2.x += seat.cx - cx;
        A2.homeX = A2.x;
      }
      a2Place(button);
      clawdLater(() => {
        if (!A2.held) {
          button.style.removeProperty("transition");
          scheduleA2BoundsWarm(button);
        }
      }, 420);
      return seat ? seat.name : null;
    }
    function setClawdA(value, duration = 0) {
      if (value) clawdComposerReaction.reset();
      a2CancelSeq();
      value !== clawdTracks.A && clawdShakeRiders(value);
      value && clawdCancelTransientB();
      const now = Date.now();
      clawdTracks.A = value || null;
      clawdTracks.aStartedAt = value ? now : 0;
      value !== "think" || duration || (duration = 16e3);
      value !== "stream" || duration || (duration = 2e4);
      clawdTracks.aUntil = value && duration ? now + duration : 0;
      renderClawdTracks();
      if (!value && clawdTracks.B === 'idle') syncClawdBState();
    }
    function setClawdB(value, duration = 0) {
      (value || "idle") !== clawdTracks.B && clawdShakeRiders(value);
      clawdTracks.B = value || "idle";
      clawdTracks.bUntil = value && duration ? Date.now() + duration : 0;
      renderClawdTracks();
    }
    function setClawdC(value, duration = 0) {
      if (value) clawdComposerReaction.reset();
      if (a2Locked() && !A2.seqOwned) return;
      value && clawdCancelTransientB();
      value !== "grab" && value !== "drag" && value !== clawdTracks.C && clawdShakeRiders(value);
      clawdTracks.C = value || null;
      clawdTracks.cUntil = value && duration ? Date.now() + duration : 0;
      renderClawdTracks();
      if (!value && clawdTracks.B === 'idle') syncClawdBState();
    }
    function beginClawdGeneration() {
      clawdTracks.round += 1;
      clawdTracks.activeRound = clawdTracks.round;
      clawdTracks.genStartedAt = Date.now();
      setClawdA("think");
    }
    function settleClawdGeneration(outcome = "done") {
      const round = clawdTracks.activeRound;
      if (!round || clawdTracks.settledRound === round) return;
      clawdTracks.settledRound = round;
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
    const CLAWD_B_AMBIENT_POSES = Object.freeze([ {
      state: "around",
      duration: CLAWD_RIG.clips.around.dur
    }, {
      state: "spin",
      duration: CLAWD_RIG.clips.spin.dur
    }, {
      state: "lean",
      duration: CLAWD_RIG.clips.lean.dur
    }, {
      state: "hide",
      duration: CLAWD_RIG.clips.hide.dur
    }, {
      state: "tramp",
      duration: CLAWD_RIG.clips.tramp.dur
    }, {
      state: "scratch",
      duration: CLAWD_RIG.clips.scratch.dur
    }, {
      state: "crouch",
      duration: CLAWD_RIG.clips.crouch.dur
    }, {
      state: "heart",
      duration: CLAWD_RIG.clips.heart.dur
    }, {
      state: "point",
      duration: CLAWD_RIG.clips.point.dur
    }, {
      state: "facepalm",
      duration: CLAWD_RIG.clips.facepalm.dur
    } ]);
    let clawdBAmbientNextAt = Date.now() + 18e3;
    function clawdPrefersReducedMotion() {
      try {
        return Boolean(hostWindow.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
      } catch (error) {
        return !1;
      }
    }
    let clawdBLastAmbient = "";
    function scheduleClawdBAmbient(now = Date.now(), retry = !1) {
      clawdBAmbientNextAt = now + (retry ? 5e3 : 22e3 + Math.round(Math.random() * 14e3));
    }
    function maybePlayClawdBAmbient(now) {
      if (now < clawdBAmbientNextAt) return;
      const box = hostDocument.querySelector("#send_textarea");
      const blocked = hostDocument.hidden || clawdPrefersReducedMotion() || !composerClawd() || clawdTracks.A || clawdTracks.C || clawdTracks.B !== "idle" || clawdTracks.bUntil || Boolean(box && hostDocument.activeElement === box) || Boolean(box?.value?.trim()) || isTypingActive() || now < 0;
      if (blocked) {
        scheduleClawdBAmbient(now, !0);
        return;
      }
      if (clawdPile.riderCount()) {
        if (Math.random() < .35 && clawdWalk(now)) {
          clawdBLastAmbient = "rig:walk";
          scheduleClawdBAmbient(now + 6e3);
          return;
        }
        const quiet = CLAWD_B_AMBIENT_POSES.filter(pose => [ "around", "point", "scratch", "facepalm" ].includes(pose.state) && pose.state !== clawdBLastAmbient);
        const pose = quiet[Math.floor(Math.random() * quiet.length)];
        if (pose) {
          clawdBLastAmbient = pose.state;
          setClawdB(pose.state, pose.duration);
        }
        scheduleClawdBAmbient(now);
        return;
      }
      if (Math.random() < .3) {
        const id = pickClawdRigClip(now);
        if (id === "walk") {
          clawdRigLastPlayed.walk = now;
          const ms = clawdWalk(now);
          if (ms) {
            clawdBLastAmbient = "rig:walk";
            scheduleClawdBAmbient(now + ms);
            return;
          }
        } else if (id) {
          clawdRigLastPlayed[id] = now;
          const forms = CLAWD_RIG_FORMS[id];
          const play = forms ? forms[Math.floor(Math.random() * forms.length)] : id === "plant" && Math.random() < .5 ? "plantWilt" : id;
          clawdBLastAmbient = "rig:" + play;
          setClawdB("rig:" + play, CLAWD_RIG.clips[play].dur);
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
    let clawdWalkRun = 0;
    let clawdWalkNudge = null;
    function clawdWalk(now = Date.now()) {
      const button = composerClawd();
      if (!button || A2.held || A2.fy !== 0 || A2.floor !== 0) return 0;
      if (!A2.bndReady || now - A2.bndAt > A2_BOUNDS_TTL) {
        A2.bnd = a2Walls(button);
        A2.bndAt = now;
        A2.bndReady = !0;
      }
      const lo = Math.max(A2.bnd.minx, A2.bnd.minxHome), hi = A2.bnd.maxxHome;
      if (!(hi - lo > 40 && hi - lo < 1e5)) return 0;
      const roomL = A2.x - lo, roomR = hi - A2.x;
      const want = (hi - lo) * (.2 + Math.random() * .2);
      let dir = roomR > roomL + 20 ? 1 : roomL > roomR + 20 || Math.random() < .5 ? -1 : 1;
      let dist = Math.min(want, dir > 0 ? roomR : roomL);
      if (dist < 24) {
        dir = -dir;
        dist = Math.min(want, dir > 0 ? roomR : roomL);
      }
      if (roomL < 0) {
        dir = 1;
        dist = Math.min(hi - A2.x, want / 2 - roomL);
      } else if (roomR < 0) {
        dir = -1;
        dist = Math.min(A2.x - lo, want / 2 - roomR);
      }
      const rigR = button.querySelector(":scope > .clawd-rig")?.getBoundingClientRect();
      if (rigR?.width) {
        const bl = rigR.left, br = rigR.left + 48;
        for (const b of clawdPile.blocks()) {
          dir > 0 && b.l >= br - 1 && (dist = Math.min(dist, b.l - br - 4));
          dir < 0 && b.r <= bl + 1 && (dist = Math.min(dist, bl - b.r - 4));
        }
      }
      if (dist < 24) return 0;
      const steps = Math.max(2, Math.floor(dist / CLAWD_RIG_CELL));
      const walkMs = steps * 300;
      const intro = CLAWD_RIG.clips.walkLoop.intro || 0;
      let from = A2.x, to = from + dir * steps * CLAWD_RIG_CELL;
      const state = dir > 0 ? "rig:walkLoop-m" : "rig:walkLoop";
      const run = ++clawdWalkRun;
      setClawdB(state, intro + walkMs + 50);
      button.style.setProperty("transition", "none", "important");
      const t0 = Date.now() + intro;
      const end = () => {
        clawdWalkNudge = null;
        A2.homeX = A2.x;
        button.style.removeProperty("transition");
        clawdPile.followEnd();
        scheduleA2BoundsWarm(button);
      };
      clawdWalkNudge = d => {
        from += d;
        to += d;
      };
      const step = () => {
        if (run !== clawdWalkRun || destroyed) return;
        if (clawdTracks.B !== state || clawdTracks.A || clawdTracks.C || A2.held || A2.fy !== 0) {
          end();
          return;
        }
        clawdPile.follow(A2.x - from);
        const k = Math.min(1, Math.max(0, (Date.now() - t0) / walkMs));
        A2.x = from + (to - from) * k;
        a2Place(button);
        k < 1 ? requestClawdFrame(step) : end();
      };
      requestClawdFrame(step);
      return intro + walkMs + 50;
    }
    let clawdFormRO = null, clawdFormObserved = null, clawdFormW = 0;
    function watchClawdFormWidth(form) {
      if (clawdFormObserved === form || !hostWindow.ResizeObserver) return;
      clawdFormRO?.disconnect();
      clawdFormObserved = form;
      clawdFormW = 0;
      clawdFormRO = new hostWindow.ResizeObserver(() => {
        const w = form.clientWidth;
        if (!w) return;
        const old = clawdFormW;
        clawdFormW = w;
        old && w !== old && clawdShiftWithForm((w - old) / 2);
      });
      clawdFormRO.observe(form);
    }
    function clawdShiftWithForm(d) {
      const button = composerClawd();
      if (!button || !A2.x && !A2.floor && !A2.held) return;
      A2.x += d;
      A2.homeX += d;
      A2.held && (A2.ox += d);
      clawdWalkNudge?.(d);
      const walking = !!clawdWalkNudge;
      walking || button.style.setProperty("transition", "none", "important");
      a2Place(button);
      clawdPile.restack();
      walking || requestClawdFrame(() => {
        clawdWalkNudge || A2.held || button.style.removeProperty("transition");
      });
      scheduleA2BoundsWarm(button);
    }
    function ensureComposerClawd() {
      if (!clawdEnabled()) return null;
      const form = hostDocument.querySelector("#send_form");
      if (!form) return null;
      let button = composerClawd();
      if (!button) {
        button = createButton("composer");
        form.append(button);
        scheduleA2BoundsWarm(button);
      }
      watchClawdFormWidth(form);
      clawdPile.ensure();
      syncClawdBState();
      return button;
    }
    const CLAWD_TIRED_SIT_MS = 12e3;
    const CLAWD_GEN_MAX_MS = 3e5;
    function clawdRuntimeTick() {
      if (!clawdEnabled()) return;
      const now = Date.now();
      const inGeneration = clawdTracks.A === "think" || clawdTracks.A === "stream" || clawdTracks.A === "sit";
      if (inGeneration && generationEventActive && now - clawdTracks.genStartedAt >= CLAWD_GEN_MAX_MS) settleClawdGeneration("stopped"); else if (clawdTracks.A === "think" && generationEventActive && now - clawdTracks.aStartedAt >= 900) setClawdA("stream"); else if (clawdTracks.A === "stream" && generationEventActive && now - clawdTracks.aStartedAt >= CLAWD_TIRED_SIT_MS) {
        clawdTracks.A = "sit";
        renderClawdTracks();
      } else clawdTracks.aUntil && now >= clawdTracks.aUntil && (clawdTracks.A === "think" || clawdTracks.A === "stream" || clawdTracks.A === "sit" ? generationEventActive || settleClawdGeneration("done") : setClawdA(null));
      if (clawdTracks.bUntil && now >= clawdTracks.bUntil) {
        clawdTracks.bUntil = 0;
        syncClawdBState();
      }
      clawdTracks.cUntil && now >= clawdTracks.cUntil && setClawdC(null);
      if (A2.irr > 0 && now - A2.lastDec > 1e3 && !a2Locked()) {
        A2.lastDec = now;
        A2.irr = Math.max(0, A2.irr - 1);
      }
      if (A2.lockUntil && !a2Locked()) {
        A2.lockUntil = 0;
        A2.lockName = "";
      }
      A2.throws > 0 && now - A2.lastThrow > 15e3 && (A2.throws = 0);
      if (now - clawdLastIdleTickAt >= 5e3 && now >= 0) {
        clawdLastIdleTickAt = now;
        refreshIdleSleep();
      }
      maybePlayClawdBAmbient(now);
    }
    let genTimerEl = null;
    let genTimerStartedAt = 0;
    let genTimerTickTimer = 0;
    let genTimerLingerTimer = 0;
    function genTimerEnabled() {
      return hostDocument.documentElement.dataset.claudeGenTimer !== "off";
    }
    function ensureGenTimerEl() {
      if (genTimerEl && genTimerEl.isConnected) return genTimerEl;
      genTimerEl = hostDocument.createElement("div");
      genTimerEl.className = "clawd-gen-timer";
      genTimerEl.setAttribute("aria-hidden", "true");
      hostDocument.body.append(genTimerEl);
      return genTimerEl;
    }
    function tickGenTimer() {
      if (!genTimerEl || !genTimerStartedAt) return;
      const elapsed = (hostWindow.performance.now() - genTimerStartedAt) / 1e3;
      const nextText = elapsed.toFixed(1) + "s";
      genTimerEl.textContent !== nextText && (genTimerEl.textContent = nextText);
    }
    function startGenTimer() {
      if (!genTimerEnabled()) return;
      const el = ensureGenTimerEl();
      if (genTimerLingerTimer) {
        hostWindow.clearTimeout(genTimerLingerTimer);
        genTimerLingerTimer = 0;
      }
      genTimerStartedAt = hostWindow.performance.now();
      el.classList.remove("clawd-gen-timer-done");
      el.classList.add("clawd-gen-timer-visible");
      tickGenTimer();
      genTimerTickTimer || (genTimerTickTimer = hostWindow.setInterval(tickGenTimer, 200));
    }
    function stopGenTimer() {
      hostWindow.clearInterval(genTimerTickTimer);
      genTimerTickTimer = 0;
      if (!genTimerStartedAt || !genTimerEl) return;
      const elapsed = (hostWindow.performance.now() - genTimerStartedAt) / 1e3;
      genTimerEl.textContent = (ccPrefersChinese() ? "用时 " : "took ") + elapsed.toFixed(1) + "s";
      genTimerEl.classList.add("clawd-gen-timer-done");
      genTimerStartedAt = 0;
      genTimerLingerTimer && hostWindow.clearTimeout(genTimerLingerTimer);
      genTimerLingerTimer = hostWindow.setTimeout(() => {
        genTimerEl?.classList.remove("clawd-gen-timer-visible");
        genTimerLingerTimer = 0;
      }, 4e3);
    }
    let clawdGenSnapshot = null;
    function snapshotChatForClawd(type) {
      const chat = getContext()?.chat;
      if (!Array.isArray(chat)) return null;
      const last = chat[chat.length - 1];
      return {
        type: String(type || "normal"),
        len: chat.length,
        lastMes: last?.mes ?? null,
        lastSwipes: Array.isArray(last?.swipes) ? last.swipes.length : 0
      };
    }
    function clawdReplyArrived(snap) {
      if (/^(impersonate|quiet)$/.test(snap.type)) return !0;
      const chat = getContext()?.chat;
      if (!Array.isArray(chat)) return !0;
      const last = chat[chat.length - 1];
      if (!last || last.is_user || !String(last.mes ?? "").trim()) return !1;
      if (chat.length > snap.len) return !0;
      const swipes = Array.isArray(last.swipes) ? last.swipes.length : 0;
      return last.mes !== snap.lastMes || swipes !== snap.lastSwipes;
    }
    function watchGenerationEvents() {
      if (generationSubscriptions.length || destroyed) return;
      const context = getContext();
      const source = context?.eventSource;
      const types = context?.eventTypes || context?.event_types || {};
      if (!source?.on) return;
      streamFollow ??= installStreamFollow({
        win: hostWindow,
        doc: hostDocument,
        getContext: getContext,
        enabled: () => isMobileLayout() && !0
      });
      const seen = new Set;
      const subscribe = (key, fallback, outcome) => {
        const type = types[key] || fallback;
        if (!type || seen.has(type)) return;
        seen.add(type);
        const handler = (...args) => {
          const active = outcome === "start";
          if (active && args[2] === !0) return;
          const wasActive = generationEventActive;
          generationEventActive = active;
          active ? startGenTimer() : stopGenTimer();
          if (!active || wasActive && clawdTracks.settledRound !== clawdTracks.activeRound) {
            if (!active) {
              const final = outcome === "done" && clawdGenSnapshot && !clawdReplyArrived(clawdGenSnapshot) ? "error" : outcome;
              settleClawdGeneration(final);
              clawdGenSnapshot = null;
            }
          } else {
            beginClawdGeneration();
            clawdGenSnapshot = snapshotChatForClawd(args[0]);
          }
          scheduleRefresh();
        };
        source.on(type, handler);
        generationSubscriptions.push({
          source: source,
          type: type,
          handler: handler
        });
      };
      const receivedType = types.MESSAGE_RECEIVED || "message_received";
      const onReceived = () => {
        hostDocument.hidden && (clawdLetterPending = !0);
      };
      source.on(receivedType, onReceived);
      generationSubscriptions.push({
        source: source,
        type: receivedType,
        handler: onReceived
      });
      const startCountType = types.GENERATION_STARTED || "generation_started";
      const onStartCount = (_type, _options, dryRun) => {
        dryRun || (generationStartSeq += 1);
      };
      source.on(startCountType, onStartCount);
      generationSubscriptions.push({
        source: source,
        type: startCountType,
        handler: onStartCount
      });
      subscribe("GENERATION_STARTED", "generation_started", "start");
      subscribe("GENERATION_ENDED", "generation_ended", "done");
      subscribe("GENERATION_STOPPED", "generation_stopped", "stopped");
      subscribe("GENERATION_FAILED", "generation_failed", "error");
    }
    function getMessageData(message) {
      const id = Number(message.getAttribute("mesid"));
      if (!Number.isInteger(id) || id < 0) return null;
      return getContext()?.chat?.[id] ?? null;
    }
    function isWelcomeAssistant(message) {
      const data = getMessageData(message);
      return message.getAttribute("type") === "assistant_message" || data?.extra?.type === "assistant_message";
    }
    function isWelcomePrompt(message) {
      const data = getMessageData(message);
      return message.getAttribute("type") === "welcome_prompt" || data?.extra?.type === "welcome_prompt";
    }
    function isWelcomeSurfaceMessage(message) {
      return isWelcomeAssistant(message) || isWelcomePrompt(message);
    }
    function restoreWelcomeAvatar(message) {
      const record = welcomeAvatarOriginals.get(message);
      if (!record) return;
      const {image: image, src: src, srcset: srcset, alt: alt} = record;
      if (image?.isConnected) {
        src === null ? image.removeAttribute("src") : image.setAttribute("src", src);
        srcset === null ? image.removeAttribute("srcset") : image.setAttribute("srcset", srcset);
        alt === null ? image.removeAttribute("alt") : image.setAttribute("alt", alt);
      }
      welcomeAvatarOriginals.delete(message);
      message.classList.remove("claude-welcome-clawd-assistant");
    }
    function refreshWelcomeAssistants() {
      const messages = [ ...hostDocument.querySelectorAll('#chat > .mes[is_user="false"]') ];
      const liveMessages = new Set(messages);
      welcomeAvatarOriginals.forEach((record, message) => {
        liveMessages.has(message) && isWelcomeAssistant(message) || restoreWelcomeAvatar(message);
      });
      messages.forEach(message => {
        const welcomePrompt = isWelcomePrompt(message);
        message.classList.toggle("claude-welcome-prompt", welcomePrompt);
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
        message.querySelector(`.${BUTTON_CLASS}`)?.remove();
        message.querySelector(`:scope > .${LEFT_SWIPE_PROXY_CLASS}`)?.remove();
        message.querySelector(`:scope > .${SWIPE_PROXY_CLASS}`)?.remove();
        message.querySelector(`.${REROLL_CLASS}`)?.remove();
        const image = message.querySelector(":scope > .mesAvatarWrapper .avatar img");
        if (!(image instanceof hostWindow.HTMLImageElement)) return;
        const previous = welcomeAvatarOriginals.get(message);
        if (!previous || previous.image !== image) {
          previous && restoreWelcomeAvatar(message);
          welcomeAvatarOriginals.set(message, {
            image: image,
            src: image.getAttribute("src"),
            srcset: image.getAttribute("srcset"),
            alt: image.getAttribute("alt")
          });
        }
        message.classList.add("claude-welcome-clawd-assistant");
        image.getAttribute("src") !== CLAWD_IMAGE && image.setAttribute("src", CLAWD_IMAGE);
        image.removeAttribute("srcset");
        image.alt = "Clawd";
      });
    }
    function prepareSwipeProxyMessage(message) {
      const data = getMessageData(message);
      const context = getContext();
      const id = Number(message.getAttribute("mesid"));
      const isLatest = Array.isArray(context?.chat) ? id === context.chat.length - 1 : message.classList.contains("last_mes");
      if (!data || data.is_user || !isLatest || isWelcomeSurfaceMessage(message)) return !1;
      data.extra?.overswipe_behavior === "loop" && delete data.extra.overswipe_behavior;
      return !0;
    }
    function hasPresetReasoning(message) {
      const text = message.querySelector(".mes_text")?.textContent ?? "";
      return /T\s*G\s*D\s*\u601d\u7ef4\u94fe|draft[_\s-]*notes/i.test(text);
    }
    function paintEmbeddedFrame(frame) {
      frame.setAttribute("data-claude-transparent-surface", "true");
      frame.style.setProperty("background", "transparent", "important");
      frame.style.setProperty("background-color", "transparent", "important");
      const rootScheme = hostWindow.getComputedStyle(hostDocument.documentElement).colorScheme || "";
      const scheme = /dark/.test(rootScheme) ? "dark" : /light/.test(rootScheme) || hostDocument.documentElement.dataset.claudeIntegratedTheme === "day" ? "light" : "dark";
      frame.style.setProperty("color-scheme", scheme, "important");
      const injectedCss = `\n      :root { color-scheme: ${scheme}; }\n      html, body {\n        box-sizing: border-box !important;\n        width: 100% !important;\n        min-width: 0 !important;\n        margin: 0 !important;\n        padding: 0 !important;\n        border: 0 !important;\n        outline: 0 !important;\n        box-shadow: none !important;\n        background: transparent !important;\n        background-color: transparent !important;\n      }\n    `;
      const srcdoc = frame.getAttribute("srcdoc");
      if (srcdoc && !srcdoc.includes("\x3c!-- claude-transparent-surface --\x3e")) {
        embeddedFrameOriginalSrcdoc.set(frame, srcdoc);
        const styleTag = `\x3c!-- claude-transparent-surface --\x3e<style id="${EMBED_STYLE_ID}">${injectedCss}</style>`;
        const patchedSrcdoc = /<\/head>/i.test(srcdoc) ? srcdoc.replace(/<\/head>/i, `${styleTag}</head>`) : /<\/body>/i.test(srcdoc) ? srcdoc.replace(/<\/body>/i, `${styleTag}</body>`) : `${srcdoc}${styleTag}`;
        frame.setAttribute("srcdoc", patchedSrcdoc);
        return;
      }
      try {
        const frameDocument = frame.contentDocument;
        if (!frameDocument?.documentElement) return;
        let style = frameDocument.getElementById(EMBED_STYLE_ID);
        if (!style) {
          style = frameDocument.createElement("style");
          style.id = EMBED_STYLE_ID;
          (frameDocument.head ?? frameDocument.documentElement).append(style);
        }
        style.textContent = injectedCss;
      } catch {}
    }
    function refreshRegexSurfaceShells() {
      const night = hostDocument.documentElement.dataset.claudeIntegratedTheme === "night";
      if (!night) {
        hostDocument.querySelectorAll(`.${REGEX_SURFACE_CLASS}`).forEach(element => element.classList.remove(REGEX_SURFACE_CLASS));
        return;
      }
      const candidates = hostDocument.querySelectorAll(`#chat > .mes[is_user="false"] .mes_text :is(div, section, article, main, figure):not(.${REGEX_SURFACE_CLASS})`);
      candidates.forEach(element => {
        const color = hostWindow.getComputedStyle(element).backgroundColor;
        const channels = color.match(/[\d.]+/g)?.map(Number) ?? [];
        if (channels.length < 3 || channels[0] < 242 || channels[1] < 242 || channels[2] < 242) return;
        if (channels.length > 3 && channels[3] < .72) return;
        const rect = element.getBoundingClientRect();
        const hostWidth = element.closest(".mes_text")?.getBoundingClientRect().width ?? 0;
        if (rect.height < 80 || rect.width < Math.min(240, hostWidth * .62)) return;
        element.classList.add(REGEX_SURFACE_CLASS);
      });
    }
    function refreshEmbeddedSurfaces() {
      const frames = [ ...hostDocument.querySelectorAll('#chat > .mes[is_user="false"] .mes_text iframe') ];
      const liveFrames = new Set(frames);
      embeddedFrameHandlers.forEach((handler, frame) => {
        if (liveFrames.has(frame)) return;
        frame.removeEventListener("load", handler);
        embeddedFrameHandlers.delete(frame);
        embeddedFrameOriginalSrcdoc.delete(frame);
      });
      frames.forEach(frame => {
        if (!embeddedFrameHandlers.has(frame)) {
          const handler = () => paintEmbeddedFrame(frame);
          embeddedFrameHandlers.set(frame, handler);
          frame.addEventListener("load", handler);
        }
        paintEmbeddedFrame(frame);
      });
      refreshRegexSurfaceShells();
    }
    function computeMessageContent(message) {
      if (message.querySelector(".edit_textarea, .mes_edit_buttons, .mes_text textarea")) return !0;
      const textHosts = [ ...message.querySelectorAll(".mes_text, .mes_reasoning") ];
      const text = textHosts.map(element => element.textContent ?? "").join("").replace(/[\s\u200B-\u200D\u2060\uFEFF]/g, "");
      if (text) return !0;
      return Boolean(message.querySelector(".mes_text :is(img,video,audio,iframe,canvas,svg,table,pre), .mes_reasoning :is(img,video,audio,iframe,canvas,svg,table,pre)"));
    }
    function hasMessageContent(message) {
      if (!dirtyMessages.has(message) && messageContentCache.has(message)) return messageContentCache.get(message);
      const result = computeMessageContent(message);
      messageContentCache.set(message, result);
      return result;
    }
    function refreshMessageStates(typingActive) {
      const messages = [ ...hostDocument.querySelectorAll('#chat > .mes[is_user="false"]') ];
      const contentByMessage = new Map;
      messages.forEach(message => {
        message.classList.toggle("claude-has-preset-reasoning", hasPresetReasoning(message));
        const contentful = hasMessageContent(message);
        contentByMessage.set(message, contentful);
        const empty = !contentful;
        if (!empty || typingActive) {
          const timer = emptyTimers.get(message);
          timer && hostWindow.clearTimeout(timer);
          emptyTimers.delete(message);
          message.classList.remove(EMPTY_CLASS);
        } else if (!emptyTimers.has(message) && !message.classList.contains(EMPTY_CLASS)) {
          const timer = hostWindow.setTimeout(() => {
            emptyTimers.delete(message);
            if (!destroyed && message.isConnected && !hasMessageContent(message) && !isTypingActive() && !hostDocument.body.dataset.swiping) {
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
      const id = Number(message?.getAttribute("mesid"));
      return Number.isInteger(id) && id >= 0 ? id : null;
    }
    async function safelyDeleteMessage(message) {
      const id = getMessageId(message);
      if (id === null) return;
      const context = getContext();
      const data = context?.chat?.[id];
      if (typeof context?.deleteMessage === "function") {
        const selectedSwipe = data?.swipe_id ?? void 0;
        const canDeleteSwipe = !data?.is_user && Array.isArray(data?.swipes) && data.swipes.length > 1 && id === context.chat.length - 1 && selectedSwipe !== void 0;
        await context.deleteMessage(id, canDeleteSwipe ? selectedSwipe : void 0, !0);
        return;
      }
      const confirmed = hostWindow.confirm("确定删除这条消息吗？此操作无法撤销。");
      if (!confirmed) return;
      const nativeEdit = message.querySelector(".mes_edit");
      const nativeDelete = message.querySelector(".mes_edit_delete");
      !nativeDelete && nativeEdit instanceof hostWindow.HTMLElement && nativeEdit.click();
      const readyDelete = message.querySelector(".mes_edit_delete");
      if (readyDelete instanceof hostWindow.HTMLElement) {
        nativeDeleteBypass.add(readyDelete);
        readyDelete.click();
        return;
      }
      hostWindow.toastr?.warning("当前酒馆没有提供可用的原生删除入口。", "删除不可用");
    }
    function interceptNativeDelete(event) {
      const target = event.target instanceof hostWindow.Element ? event.target.closest(".mes_edit_delete") : null;
      if (!(target instanceof hostWindow.HTMLElement)) return;
      if (nativeDeleteBypass.has(target)) {
        nativeDeleteBypass.delete(target);
        return;
      }
      if (event.isTrusted === !1) return;
      const message = target.closest("#chat > .mes");
      if (!(message instanceof hostWindow.HTMLElement)) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      safelyDeleteMessage(message).catch(error => {
        console.error("[Claude Clawd] Failed to delete message safely.", error);
        hostWindow.toastr?.error("删除消息时发生错误，原消息已保留。", "删除失败");
      });
    }
    function createUserEditAction(message) {
      const actions = hostDocument.createElement("div");
      actions.className = USER_ACTIONS_CLASS;
      actions.dataset.claudeUserActionVersion = "edit-delete";
      actions.setAttribute("aria-label", "用户消息操作");
      const edit = hostDocument.createElement("button");
      edit.type = "button";
      edit.className = "claude-user-message-edit";
      edit.title = "编辑消息";
      edit.setAttribute("aria-label", "编辑消息");
      edit.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        const nativeEdit = message.querySelector(".mes_edit");
        nativeEdit instanceof hostWindow.HTMLElement ? nativeEdit.click() : hostWindow.toastr?.warning("没有找到酒馆原生编辑入口。", "无法编辑");
      });
      const del = hostDocument.createElement("button");
      del.type = "button";
      del.className = "claude-user-message-delete";
      del.title = "删除消息";
      del.setAttribute("aria-label", "删除消息");
      del.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        safelyDeleteMessage(message).catch(error => {
          console.error("[Claude Clawd] Failed to delete message safely.", error);
          hostWindow.toastr?.error("删除消息时发生错误，原消息已保留。", "删除失败");
        });
      });
      actions.append(edit, del);
      return actions;
    }
    function refreshUserActions() {
      const messages = [ ...hostDocument.querySelectorAll('#chat > .mes[is_user="true"]') ];
      const liveMessages = new Set(messages);
      hostDocument.querySelectorAll(`.${USER_ACTIONS_CLASS}`).forEach(actions => {
        const message = actions.closest("#chat > .mes");
        liveMessages.has(message) || actions.remove();
      });
      messages.forEach(message => {
        const block = message.querySelector(":scope > .mes_block");
        if (!block) return;
        let actions = block.querySelector(`:scope > .${USER_ACTIONS_CLASS}`);
        if (actions?.dataset.claudeUserActionVersion !== "edit-delete") {
          actions?.remove();
          actions = null;
        }
        actions || block.append(createUserEditAction(message));
      });
    }
    function refreshPromptManagerDragHandles() {
      hostDocument.querySelectorAll("#completion_prompt_manager_list > li.completion_prompt_manager_prompt").forEach(row => {
        const existingHandle = row.querySelector(":scope > .drag-handle");
        if (existingHandle && !existingHandle.classList.contains("clawd-prompt-drag-handle") && !isTauriTavernHost()) return;
        let handle = existingHandle;
        if (!handle) {
          handle = hostDocument.createElement("span");
          handle.className = "drag-handle";
          handle.setAttribute("aria-hidden", "true");
          row.prepend(handle);
        }
        handle.classList.add("clawd-prompt-drag-handle");
        Object.entries({
          position: "static",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "28px",
          minWidth: "28px",
          height: "28px",
          margin: "0",
          padding: "0",
          color: "#73736f",
          visibility: "visible",
          opacity: "0.9",
          pointerEvents: "auto",
          boxShadow: "none",
          filter: "none",
          textShadow: "none"
        }).forEach(([property, value]) => handle.style.setProperty(property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`), value, "important"));
        if (handle.querySelector(":scope > .clawd-prompt-drag-glyph")) return;
        handle.textContent = "";
        const glyph = hostDocument.createElement("span");
        glyph.className = "clawd-prompt-drag-glyph";
        glyph.setAttribute("aria-hidden", "true");
        Object.entries({
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "3px",
          width: "16px",
          height: "16px",
          visibility: "visible",
          opacity: "1",
          boxShadow: "none",
          filter: "none",
          textShadow: "none"
        }).forEach(([property, value]) => glyph.style.setProperty(property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`), value, "important"));
        for (let index = 0; index < 3; index += 1) {
          const bar = hostDocument.createElement("span");
          Object.entries({
            display: "block",
            boxSizing: "border-box",
            width: "16px",
            minWidth: "16px",
            height: "2px",
            minHeight: "2px",
            margin: "0",
            padding: "0",
            background: "#73736f",
            border: "0",
            borderRadius: "1px",
            boxShadow: "none",
            filter: "none",
            textShadow: "none",
            visibility: "visible",
            opacity: "1"
          }).forEach(([property, value]) => bar.style.setProperty(property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`), value, "important"));
          glyph.append(bar);
        }
        handle.append(glyph);
      });
    }
    function removeStaleButtons() {
      hostDocument.querySelectorAll(`.${BUTTON_CLASS}`).forEach(button => {
        if (button.classList.contains("clawd-composer-clawd")) return;
        button.remove();
      });
      hostDocument.querySelectorAll("button.clawd-mobile-clawd-button").forEach(button => button.remove());
    }
    function a2Locked() {
      return Date.now() < A2.lockUntil;
    }
    function a2Place(button) {
      const move = `translate3d(${A2.x.toFixed(1)}px, ${A2.fy.toFixed(1)}px, 0)`;
      const home = !A2.x && !A2.fy;
      if (home && !A2.rot && A2.sqx === 1 && A2.sqy === 1) {
        button.style.removeProperty("transform");
        return;
      }
      let value = move;
      A2.rot && (value += ` rotate(${A2.rot.toFixed(1)}deg)`);
      A2.sqx === 1 && A2.sqy === 1 || (value += ` scale(${A2.sqx.toFixed(3)}, ${A2.sqy.toFixed(3)})`);
      button.style.setProperty("transform", value, "important");
    }
    function a2CancelSeq() {
      if (!A2.lockUntil) {
        A2.seqRun += 1;
        return;
      }
      A2.seqRun += 1;
      A2.lockUntil = 0;
      A2.lockName = "";
      A2.seqOwned = !0;
      setClawdC(null);
      A2.seqOwned = !1;
    }
    function a2PlaySeq(steps, name) {
      const my = A2.seqRun += 1;
      const total = steps.reduce((sum, item) => sum + item[1], 0);
      A2.lockUntil = Date.now() + total;
      A2.lockName = name || "序列";
      const run = index => {
        if (my !== A2.seqRun) return;
        if (index >= steps.length) {
          A2.lockUntil = 0;
          A2.lockName = "";
          A2.irr = 0;
          A2.seqOwned = !0;
          setClawdC(null);
          A2.seqOwned = !1;
          return;
        }
        A2.seqOwned = !0;
        setClawdC(steps[index][0], 0);
        A2.seqOwned = !1;
        clawdLater(() => run(index + 1), steps[index][1]);
      };
      run(0);
    }
    function a2SulkSeq() {
      A2.throws = 0;
      clawdRigPickVariant("sulk") === "rage" ? a2PlaySeq([ [ "rage", CLAWD_RIG.clips.rage.dur ] ], "生气") : a2PlaySeq([ [ "turn", 400 ], [ "t5", 2600 ], [ "face", 400 ] ], "生气");
    }
    function a2Walls(button) {
      const container = hostDocument.querySelector("#sheld") || hostDocument.querySelector("#chat") || hostDocument.querySelector("#form_sheld");
      const fallback = {
        minx: -9e9,
        maxx: 9e9,
        maxxHome: 9e9,
        minxHome: -9e9,
        miny: -A2_FALLBACK_CEILING,
        maxy: 0
      };
      if (!container) return fallback;
      const pr = button.getBoundingClientRect();
      const fr = container.getBoundingClientRect();
      if (!pr.width || !fr.width) return fallback;
      const viewport = hostWindow.visualViewport;
      const viewportLeft = Math.max(0, viewport?.offsetLeft || 0);
      const viewportTop = Math.max(0, viewport?.offsetTop || 0);
      const viewportRight = viewportLeft + Math.max(1, viewport?.width || hostWindow.innerWidth || fr.right);
      let limitLeft = Math.max(fr.left, viewportLeft);
      let limitTop = viewportTop;
      const limitRight = Math.min(fr.right, viewportRight);
      const rail = hostDocument.querySelector("#top-bar");
      const rr = rail && rail.offsetParent !== null ? rail.getBoundingClientRect() : null;
      if (rr && rr.width > 0 && rr.height > 0) {
        const tall = rr.height >= fr.height * .6;
        const wide = rr.width >= fr.width * .6;
        tall && !wide && rr.left <= fr.left + 1 ? limitLeft = Math.max(limitLeft, rr.right) : wide && !tall && rr.top <= fr.top + 1 && (limitTop = Math.max(limitTop, rr.bottom));
      }
      const topbar = hostDocument.querySelector(".cw-topbar");
      const tr = topbar && topbar.offsetParent !== null ? topbar.getBoundingClientRect() : null;
      tr && tr.width > 0 && tr.height > 0 && tr.width >= fr.width * .6 && tr.height < fr.height * .6 && tr.top <= fr.top + 1 && (limitTop = Math.max(limitTop, tr.bottom));
      const form = hostDocument.querySelector("#send_form");
      let decorLeft = limitRight;
      let formLeft = limitLeft, formRight = limitRight;
      if (form) {
        const sf = form.getBoundingClientRect();
        if (sf.width > pr.width + 2 * A2_FORM_INSET) {
          formLeft = Math.max(limitLeft, sf.left + A2_FORM_INSET);
          formRight = Math.min(limitRight, sf.right - A2_FORM_INSET);
        }
      }
      const maxx = A2.x + (limitRight - A2_EDGE - pr.right);
      return {
        minx: A2.x + (limitLeft + A2_EDGE - pr.left),
        maxx: maxx,
        maxxHome: Math.min(maxx, A2.x + (decorLeft - pr.right), A2.x + (formRight - pr.right)),
        minxHome: Math.max(A2.x + (limitLeft + A2_EDGE - pr.left), A2.x + (formLeft - pr.left)),
        miny: A2.fy + (limitTop + A2_EDGE - pr.top),
        maxy: 0
      };
    }
    function a2ClampX(x) {
      return Math.max(A2.bnd.minx, Math.min(A2.bnd.maxx, x));
    }
    function scheduleA2BoundsWarm(button = composerClawd()) {
      A2.bndReady = !1;
      if (A2.bndRaf || !button) return;
      A2.bndRaf = requestClawdFrame(() => {
        A2.bndRaf = 0;
        if (destroyed || A2.held || !button.isConnected) return;
        A2.bnd = a2Walls(button);
        A2.bndAt = Date.now();
        A2.bndReady = !0;
        clawdRigPixelSnap(button);
      });
    }
    function clawdRigPixelSnap(button = composerClawd()) {
      const rig = button?.querySelector(":scope > .clawd-rig");
      if (!rig || A2.held || Math.abs(A2.fy - A2.floor) > .5) return;
      const r = rig.getBoundingClientRect();
      if (!r.width) return;
      const dpr = hostWindow.devicePixelRatio || 1;
      const fx = r.left * dpr - Math.round(r.left * dpr), fy = r.top * dpr - Math.round(r.top * dpr);
      if (Math.abs(fx) < .02 && Math.abs(fy) < .02) return;
      const cur = rig._cwSnap || [ 0, 0 ];
      const nx = cur[0] - fx / dpr, ny = cur[1] - fy / dpr;
      rig._cwSnap = [ nx, ny ];
      rig.style.setProperty("translate", `${nx.toFixed(3)}px ${ny.toFixed(3)}px`);
    }
    function a2NoteInteraction() {
      lastPokeAt = Date.now();
      neglected && setNeglected(!1);
      noteActivity();
    }
    function a2Down(button, event) {
      if (A2.held && event.pointerId !== A2.pointerId) {
        event.preventDefault();
        return;
      }
      A2.pointerId = event.pointerId;
      A2.tookPointer = !1;
      A2.wokeOnDown = idleAsleep;
      a2NoteInteraction();
      if (a2Locked()) {
        event.preventDefault();
        A2.tookPointer = !0;
        return;
      }
      event.preventDefault();
      A2.held = !0;
      A2.flying += 1;
      A2.vx = 0;
      A2.vy = 0;
      A2.moved = !1;
      A2.sx = event.clientX;
      A2.sy = event.clientY;
      A2.ox = A2.x;
      A2.oy = A2.fy;
      A2.lx = event.clientX;
      A2.ly = event.clientY;
      A2.lt = Date.now();
      if (!A2.bndReady || Date.now() - A2.bndAt > A2_BOUNDS_TTL) {
        A2.bnd = a2Walls(button);
        A2.bndAt = Date.now();
        A2.bndReady = !0;
      }
      clawdRigSnapshotProps(button);
      button.style.setProperty("transition", "none", "important");
      try {
        button.setPointerCapture(event.pointerId);
      } catch (error) {}
      A2.wokeOnDown || setClawdC(A2.fy < A2.floor - .5 ? "grab" : "press", 0);
      cancelClawdLater(A2.petTimer);
      A2.petting = !1;
      A2.petTimer = clawdLater(() => {
        A2.petTimer = 0;
        if (!A2.held || A2.moved || A2.fy < A2.floor - .5) return;
        A2.petting = clawdPet();
      }, CLAWD_PET_HOLD_MS);
    }
    function a2Move(button, event) {
      if (!A2.held || event.pointerId !== A2.pointerId) return;
      const dx = event.clientX - A2.sx;
      const dy = event.clientY - A2.sy;
      let dragStarted = !1;
      if (!A2.moved && Math.abs(dx) + Math.abs(dy) > A2_DRAG_THRESHOLD) {
        A2.moved = !0;
        A2.dragging = !0;
        dragStarted = !0;
        cancelClawdLater(A2.petTimer);
        A2.petting = !1;
        clawdPile.unloadBig("lower");
        if (A2.floor) {
          A2.floor = 0;
          clawdPile.bigSat(null);
        }
        setClawdC("grab", 0);
        clawdLater(() => {
          if (A2.dragging) {
            clawdRigPickVariant("drag");
            setClawdC("drag", 0);
          }
        }, 350);
      }
      if (!A2.moved) return;
      A2.fy = Math.max(A2.bnd.miny, Math.min(A2.bnd.maxy, A2.oy + dy));
      A2.x = a2ClampX(A2.ox + dx);
      const now = Date.now();
      const dt = Math.max(12, now - A2.lt);
      A2.vx = A2.vx * .45 + (event.clientX - A2.lx) / dt * 16 * .55;
      A2.vy = A2.vy * .45 + (event.clientY - A2.ly) / dt * 16 * .55;
      A2.lx = event.clientX;
      A2.ly = event.clientY;
      A2.lt = now;
      A2.rot = Math.max(-14, Math.min(14, .7 * -A2.vx / A2.feel));
      a2Place(button);
    }
    function a2Up(button, event) {
      if (!A2.held || event && event.pointerId !== A2.pointerId) return;
      A2.held = !1;
      A2.tookPointer = !0;
      cancelClawdLater(A2.petTimer);
      if (A2.petting && !A2.moved) {
        A2.petting = !1;
        A2.rot = 0;
        button.style.removeProperty("transition");
        a2Place(button);
        return;
      }
      A2.petting = !1;
      (A2.moved || A2.fy < A2.floor - .5) && (A2.wokeOnDown = !1);
      if (A2.moved) a2Ballistic(button); else if (A2.fy < A2.floor - .5) {
        A2.rot = 0;
        a2Ballistic(button, !0);
      } else {
        A2.rot = 0;
        button.style.removeProperty("transition");
        a2Place(button);
        a2Poke();
      }
    }
    function a2Phys() {
      const t = (A2.feel - .55) / .95;
      return {
        g: .26 + t * .4,
        rest: .5 - t * .42,
        drag: .985 + t * .01,
        thr: .78 - t * .12,
        fric: .86 - t * .2,
        spin: .55 - t * .38,
        maxRot: 16 - t * 8,
        sq: .1 - t * .03
      };
    }
    function a2Ballistic(button, drop = !1) {
      const P = a2Phys();
      const cap = value => Math.max(-24, Math.min(24, value));
      let bx = drop ? 0 : cap(A2.vx) * P.thr;
      let by = drop ? 0 : cap(A2.vy) * P.thr;
      let bounces = 0;
      const my = A2.flying += 1;
      if (!drop) {
        A2.throws += 1;
        A2.lastThrow = Date.now();
        A2.lastDec = Date.now();
        A2.irr = Math.min(5, A2.irr + (A2.throws >= 3 ? 2 : 1));
      }
      A2.dragging = !1;
      a2NoteInteraction();
      setClawdC("fly", 0);
      if (A2.floor) {
        A2.floor = 0;
        clawdPile.bigSat(null);
      }
      const rig0 = button.querySelector(":scope > .clawd-rig")?.getBoundingClientRect();
      const liveSeats = rig0?.width ? clawdPile.trackSeats() : () => [];
      const x0 = A2.x, centerAt = x => rig0.left + (x - x0) + 24;
      const seatUnder = x => liveSeats().filter(st => Math.abs(centerAt(x) - st.cx) < Math.max(48, st.w) * .5).sort((a, b) => b.h - a.h)[0] || null;
      let last = 0;
      const step = now => {
        if (my !== A2.flying) return;
        const stamp = typeof now === "number" ? now : hostWindow.performance?.now?.() || 0;
        const k = last ? Math.max(.5, Math.min(3, (stamp - last) / 16.666666666666668)) : 1;
        last = stamp;
        by += P.g * k;
        bx *= Math.pow(P.drag, k);
        by *= Math.pow(P.drag, k);
        A2.x += bx * k;
        A2.fy += by * k;
        const clamped = a2ClampX(A2.x);
        if (clamped !== A2.x) {
          A2.x = clamped;
          bx = .45 * -bx;
        }
        if (A2.fy < A2.bnd.miny) {
          A2.fy = A2.bnd.miny;
          by = .45 * -by;
        }
        const seat = by > 0 ? seatUnder(A2.x) : null;
        const ground = seat ? -seat.h : 0;
        if (A2.fy >= ground) {
          A2.fy = ground;
          bounces === 0 && setClawdC("land", 0);
          if (!(Math.abs(by) > .7 && bounces < 6)) {
            bx = 0;
            by = 0;
            A2.rot = 0;
            A2.sqx = 1;
            A2.sqy = 1;
            A2.floor = ground;
            clawdPile.bigSat(seat ? seat.name : null);
            a2Place(button);
            A2.homeX = A2.x;
            button.style.removeProperty("transition");
            seat && rig0?.width && (A2.x += seat.cx - centerAt(A2.x));
            if (!seat && rig0?.width) {
              const bl = centerAt(A2.x) - 24;
              for (const b of clawdPile.blocks()) if (bl < b.r + 4 && b.l < bl + 48 + 4) {
                A2.x += bl + 24 < (b.l + b.r) / 2 ? b.l - 4 - (bl + 48) : b.r + 4 - bl;
                break;
              }
            }
            (seat ? A2.x !== A2.homeX : A2.x > A2.bnd.maxxHome || A2.x < A2.bnd.minxHome || A2.x !== A2.homeX) && requestClawdFrame(() => {
              if (my !== A2.flying) return;
              A2.x = Math.max(A2.bnd.minxHome, Math.min(A2.bnd.maxxHome, A2.x));
              A2.homeX = A2.x;
              a2Place(button);
              clawdLater(() => clawdRigPixelSnap(button), 300);
            });
            scheduleA2BoundsWarm(button);
            if (drop) return;
            clawdLater(() => {
              if (my !== A2.flying) return;
              A2.throws >= 5 ? a2SulkSeq() : A2.throws >= 3 ? setClawdC("stomp", CLAWD_RIG.clips[clawdRigPickVariant("stomp")].dur) : setClawdC(null);
            }, 840);
            return;
          }
          {
            by = -by * P.rest;
            bx *= P.fric;
            bounces += 1;
            const q = P.sq * Math.min(1, Math.abs(by) / 7);
            A2.sqx = 1 + q;
            A2.sqy = 1 - q;
            A2.squashTimer && cancelClawdLater(A2.squashTimer);
            A2.squashTimer = clawdLater(() => {
              A2.squashTimer = 0;
              if (my !== A2.flying) return;
              A2.sqx = 1;
              A2.sqy = 1;
              a2Place(button);
            }, 110);
          }
        }
        A2.rot = Math.max(-P.maxRot, Math.min(P.maxRot, -bx * P.spin));
        a2Place(button);
        requestClawdFrame(step);
      };
      requestClawdFrame(step);
    }
    const CLAWD_PET_HOLD_MS = 600;
    let clawdPetUntil = 0;
    function clawdPet(button) {
      if (a2Locked()) return !1;
      const now = Date.now();
      if (now < clawdPetUntil) return !1;
      clawdPetUntil = now + CLAWD_RIG.clips.pet.dur;
      lastPokeAt = now;
      neglected && setNeglected(!1);
      A2.irr = 0;
      setClawdC("pet", CLAWD_RIG.clips.pet.dur);
      return !0;
    }
    function a2Poke(button) {
      if (a2Locked()) return;
      if (A2.wokeOnDown) {
        A2.wokeOnDown = !1;
        setClawdC(null);
        clawdPokeReaction();
        return;
      }
      A2.lastDec = Date.now();
      a2NoteInteraction();
      if (clawdTracks.A) {
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
      tier >= 5 ? a2SulkSeq() : a2RandomPoke(tier);
    }
    let a2LastPoke = "";
    function a2RandomPoke(irr) {
      const pool = (irr >= 3 ? [ "t2", "t3", "t4" ] : [ "t1", "t2", "t3", "t4" ]).filter(t => t !== a2LastPoke);
      const t = pool[Math.random() * pool.length | 0];
      a2LastPoke = t;
      setClawdC(t, A2_TMS[A2_TIER.indexOf(t)]);
    }
    function a2Bind(button) {
      button.addEventListener("pointerdown", event => a2Down(button, event));
      button.addEventListener("pointermove", event => a2Move(button, event));
      button.addEventListener("pointerup", event => a2Up(button, event));
      button.addEventListener("pointercancel", event => a2Cancel(button, event));
      button.addEventListener("lostpointercapture", event => a2Cancel(button, event));
      let petX = null, petDir = 0, petFlips = [];
      button.addEventListener("pointermove", event => {
        if (event.pointerType !== "mouse" || event.buttons || A2.held) return;
        if (petX !== null) {
          const dx = event.clientX - petX;
          if (Math.abs(dx) >= 2) {
            const dir = Math.sign(dx);
            if (petDir && dir !== petDir) {
              const now = Date.now();
              petFlips = petFlips.filter(t => now - t < 1e3).concat(now);
              if (petFlips.length >= 3) {
                petFlips = [];
                clawdPet();
              }
            }
            petDir = dir;
          }
        }
        petX = event.clientX;
      });
      button.addEventListener("pointerleave", () => {
        petX = null;
        petDir = 0;
        petFlips = [];
      });
    }
    function a2Cancel(button, event) {
      if (!A2.held || event && event.pointerId !== A2.pointerId) return;
      cancelClawdLater(A2.petTimer);
      A2.petting = !1;
      A2.held = !1;
      A2.tookPointer = !0;
      A2.dragging = !1;
      A2.rot = 0;
      if (A2.moved || A2.fy < A2.floor - .5) a2Ballistic(button, !0); else {
        button.style.removeProperty("transition");
        a2Place(button);
        setClawdC(null);
      }
    }
    function clawdPokeReaction() {
      lastPokeAt = Date.now();
      neglected && setNeglected(!1);
    }
    function createButton(role = "composer") {
      const button = hostDocument.createElement("button");
      button.type = "button";
      button.className = BUTTON_CLASS;
      button.classList.add(role === "composer" ? "clawd-composer-clawd" : "clawd-message-signoff-clawd");
      button.setAttribute("aria-label", "Clawd");
      button.title = "Clawd";
      a2Bind(button);
      button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        if (A2.tookPointer) {
          A2.tookPointer = !1;
          return;
        }
        a2Poke();
      });
      return button;
    }
    const CC_VERBS_EN = {
      morning: [ "brewing", "stretching", "warming up" ],
      afternoon: [ "pondering", "noodling", "simmering" ],
      evening: [ "musing", "marinating", "stargazing" ]
    };
    const CC_VERBS_CN = {
      morning: [ "煮咖啡", "伸懒腰", "热身" ],
      afternoon: [ "琢磨", "炖着", "思索" ],
      evening: [ "冥想", "放空", "看星星" ]
    };
    let ccSleeping = !1;
    function noteCcVisibility() {
      if (hostDocument.visibilityState !== "visible") return;
      if (clawdLetterPending) {
        clawdLetterPending = !1;
        clawdLater(() => {
          if (destroyed || clawdTracks.A || clawdTracks.C || clawdTracks.B !== "idle") return;
          setClawdB("rig:letter", CLAWD_RIG.clips.letter.dur);
        }, 800);
      }
    }
    const IDLE_SLEEP_MS = 18e4;
    let lastActivityAt = Date.now();
    let idleAsleep = !1;
    let hasChatActivity = !0;
    let wasWelcome = null;
    const NEGLECT_POKE_MS = 6e4;
    let lastPokeAt = Date.now();
    let neglected = !1;
    let ccDrowsy = !1;
    const CLAWD_NEGLECT_SHOW_MS = 6800;
    const CLAWD_NEGLECT_REPEAT_MS = 24e4;
    let clawdNeglectShownAt = -1 / 0;
    function setSleeping(on) {
      !on && idleAsleep && (idleAsleep = !1);
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
    const DOZE_OFF_MS = 1900;
    let dozeTimer = 0;
    function refreshIdleSleep() {
      if (!clawdEnabled()) return;
      if (ccSleeping || !hasChatActivity) {
        neglected && setNeglected(!1);
        return;
      }
      const elapsed = Date.now() - lastActivityAt;
      const idle = elapsed > IDLE_SLEEP_MS;
      const shouldBeNeglected = elapsed < IDLE_SLEEP_MS * .75 && !isTypingActive() && Date.now() - lastPokeAt > NEGLECT_POKE_MS;
      const nowN = Date.now();
      if (shouldBeNeglected) {
        if (neglected) nowN - clawdNeglectShownAt > CLAWD_NEGLECT_SHOW_MS && setNeglected(!1); else if (nowN - clawdNeglectShownAt > CLAWD_NEGLECT_REPEAT_MS && clawdTracks.B === "idle" && !clawdTracks.bUntil) {
          clawdNeglectShownAt = nowN;
          setNeglected(!0);
        }
      } else setNeglected(!1);
      if (!idle) {
        if (dozeTimer) {
          cancelClawdLater(dozeTimer);
          dozeTimer = 0;
        }
        ccDrowsy && setDrowsy(!1);
        if (idleAsleep) {
          idleAsleep = !1;
          setSleeping(!1);
        }
        return;
      }
      if (idleAsleep) {
        setSleeping(!0);
        return;
      }
      if (dozeTimer) return;
      setNeglected(!1);
      setDrowsy(!0);
      dozeTimer = clawdLater(() => {
        dozeTimer = 0;
        if (Date.now() - lastActivityAt <= IDLE_SLEEP_MS) return;
        ccDrowsy = !1;
        idleAsleep = !0;
        setSleeping(!0);
      }, DOZE_OFF_MS);
    }
    function noteActivity() {
      if (!clawdEnabled()) return;
      hasChatActivity = !0;
      lastActivityAt = Date.now();
      if (dozeTimer) {
        cancelClawdLater(dozeTimer);
        dozeTimer = 0;
      }
      setDrowsy(!1);
      if (!idleAsleep) return;
      idleAsleep = !1;
      ccSleeping || setClawdB("wake", CLAWD_RIG.clips.wake.dur);
    }
    let swipeTrackRaf = 0;
    let swipeObserver = null;
    const observedSwipeMessages = new Set;
    const visibleSwipeMessages = new Set;
    function trackSwipeArrows() {
      swipeTrackRaf = 0;
      if (destroyed) return;
      if (isTypingActive()) return;
      if (isMobileLayout()) {
        observedSwipeMessages.forEach(message => {
          message.querySelectorAll(`:scope > button.${LEFT_SWIPE_PROXY_CLASS}, :scope > button.${SWIPE_PROXY_CLASS}`).forEach(button => {
            if (button.style.getPropertyValue("top") === "50%") return;
            button.style.setProperty("top", "50%", "important");
          });
        });
        return;
      }
      const chatBox = scrollHost?.getBoundingClientRect();
      const viewportTop = Math.max(0, chatBox?.top || 0);
      const viewportBottom = Math.min(hostWindow.innerHeight, chatBox?.bottom || hostWindow.innerHeight);
      const viewportMid = (viewportTop + viewportBottom) / 2;
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
          if (button.style.getPropertyValue('top') === next) return;
          button.style.setProperty('top', next, 'important');
        });
      }
    }
    function scheduleSwipeTrack() {
      if (destroyed || swipeTrackRaf) return;
      swipeTrackRaf = hostWindow.requestAnimationFrame(trackSwipeArrows);
    }
    let suppressManualScrollUntil = 0;
    function noteManualScroll() {
      if (Date.now() < suppressManualScrollUntil) return;
      lastManualScrollAt = Date.now();
    }
    function handleChatScroll() {
      noteManualScroll();
      clawdPile.hush();
      clawdScrollTilt();
      isMobileLayout() || scheduleSwipeTrack();
    }
  function createClawdReadingGate(read, now = Date.now) {
    const limits = { messages: 3, screens: 2, gapMs: 900, cooldownMs: 8000 };
    let origin = null, until = 0, lastScroll = 0, fired = false, coolUntil = 0, pointer = null;
    const reset = (clearCooldown = false) => { origin = null; until = 0; lastScroll = 0; fired = false; pointer = null; if (clearCooldown) coolUntil = 0; };
    const begin = () => {
      const t = now();
      if (!origin || t - lastScroll > limits.gapMs) { origin = read(); fired = false; }
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
        if (!origin || now() - lastScroll > limits.gapMs) { origin = read(); fired = false; }
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
      lastScroll = t; until = t + limits.gapMs;
      if (fired) return 'hold';
      if (t < coolUntil || Math.abs(current.id - origin.id) < limits.messages
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
    for (const fraction of [.5, .25, .75]) {
      const node = hostDocument.elementFromPoint(r.left + r.width * fraction, y)?.closest?.('#chat > .mes');
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
    let clawdScrollHolding = !1;
    let clawdScrollRestTimer = 0;
    let clawdPileRestTimer = 0;
    function clawdScrollRelease() {
      clawdScrollHolding = !1;
      composerClawd()?.style.removeProperty("translate");
      clawdTracks.B === "peek" && setClawdB("rig:peekOut", CLAWD_RIG.clips.peekOut.dur);
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
    if (clawdPileRestTimer) cancelClawdLater(clawdPileRestTimer);
    clawdPileRestTimer = clawdLater(() => { clawdPileRestTimer = 0; if (!destroyed) clawdPile.peek(false); }, CLAWD_SCROLL_REST_MS);
    if (!clawdScrollHolding) return;
    if (clawdScrollRestTimer) cancelClawdLater(clawdScrollRestTimer);
    clawdScrollRestTimer = clawdLater(() => { clawdScrollRestTimer = 0; if (!destroyed) clawdScrollRelease(); }, CLAWD_SCROLL_REST_MS);
  }
    const WELCOME_CLASS = "clawd-welcome";
    let welcomeStage = "welcome";
    let leavingSince = 0;
    let sendWatchBound = !1;
    let pendingWelcomeCharacter = null;
    function enterLeaving() {
      const hadPendingCharacter = pendingWelcomeCharacter !== null;
      pendingWelcomeCharacter = null;
      if (welcomeStage === "chat" && !hadPendingCharacter) return;
      welcomeStage = "leaving";
      leavingSince = Date.now();
      hostDocument.body.classList.remove(WELCOME_CLASS);
      hostDocument.querySelectorAll("." + HERO_CLASS).forEach(el => el.remove());
      heroPick = -1;
      scheduleRefresh();
      hostWindow.setTimeout(scheduleRefresh, 15100);
      hostWindow.setTimeout(scheduleRefresh, 1300);
    }
    function watchUserSend() {
      if (!welcomeEnabled || sendWatchBound) return;
      sendWatchBound = !0;
      hostDocument.addEventListener("submit", event => {
        event.target instanceof hostWindow.Element && event.target.closest("form") && enterLeaving();
      }, !0);
      hostDocument.addEventListener("click", event => {
        pendingWelcomeCharacter !== null && event.target instanceof hostWindow.Element && event.target.closest(".recentChat, .select_chat_block, .character_select, .group_select") && (pendingWelcomeCharacter = null);
        event.target instanceof hostWindow.Element && event.target.closest('#send_but, [id*="send_but"], #send_form [type="submit"]') && enterLeaving();
      }, !0);
      hostDocument.addEventListener("keydown", event => {
        if (event.key !== "Enter" || event.shiftKey || event.ctrlKey || event.altKey) return;
        event.target instanceof hostWindow.Element && event.target.closest("#send_textarea, #send_form textarea, #send_form [contenteditable]") && enterLeaving();
      }, !0);
      const source = getContext()?.eventSource;
      const types = getContext()?.eventTypes || getContext()?.event_types || {};
      for (const [key, value] of Object.entries(types)) {
        key !== "MESSAGE_SENT" && key !== "USER_MESSAGE_RENDERED" || source?.on?.(value, enterLeaving);
        key === "PERSONA_CHANGED" && source?.on?.(value, () => scheduleRefresh());
        key === "CHAT_CHANGED" && source?.on?.(value, () => {
          pendingWelcomeCharacter !== null ? welcomeStage = "welcome" : hasSelectedConversation() ? welcomeStage = "chat" : welcomeStage !== "leaving" && (welcomeStage = "welcome");
          scheduleRefresh();
        });
      }
    }
    const HERO_CLASS = "clawd-welcome-hero";
    const welcomeEnabled = CLAUDE_FEATURES.welcome;
    const mobileEnabled = CLAUDE_FEATURES.mobile;
    function isMobileLayout() {
      return Boolean(mobileEnabled);
    }
    function usesNativeAndroidKeyboardLayout() {
      return isMobileLayout() && /Android/i.test(hostWindow.navigator?.userAgent || "");
    }
    function ensureAndroidKeyboardPanAnchor(refresh = !1) {
      let anchor = hostDocument.querySelector(".clawd-android-keyboard-pan-anchor");
      if (!usesNativeAndroidKeyboardLayout() || keyboardBaselineMode) {
        anchor?.remove();
        return;
      }
      if (anchor && !refresh) return;
      anchor?.remove();
      anchor = hostDocument.createElement("i");
      anchor.className = "clawd-android-keyboard-pan-anchor";
      anchor.setAttribute("aria-hidden", "true");
      anchor.style.cssText = [ "position:fixed", "left:0", "top:0", "width:100vw", "height:64px", "opacity:.001", "pointer-events:none", "z-index:2147483646" ].join(";");
      hostDocument.body?.append(anchor);
    }
    function installVirtualKeyboardOverlay() {
      if (!isMobileLayout() || keyboardBaselineMode) return;
      const keyboard = hostWindow.navigator?.virtualKeyboard;
      if (keyboard && "overlaysContent" in keyboard) try {
        virtualKeyboardOverlayOriginal = Boolean(keyboard.overlaysContent);
        virtualKeyboardOverlayCaptured = !0;
        keyboard.overlaysContent = !0;
        virtualKeyboardOverlayActive = Boolean(keyboard.overlaysContent);
      } catch {
        virtualKeyboardOverlayActive = !1;
      }
      setBodyClass("clawd-virtual-keyboard-overlay", virtualKeyboardOverlayActive);
      usesNativeAndroidKeyboardLayout() && (virtualKeyboardOverlayActive ? hostDocument.querySelector(".clawd-android-keyboard-pan-anchor")?.remove() : ensureAndroidKeyboardPanAnchor());
    }
    function restoreVirtualKeyboardOverlay() {
      hostDocument.body?.classList.remove("clawd-virtual-keyboard-overlay");
      if (virtualKeyboardOverlayCaptured) try {
        hostWindow.navigator.virtualKeyboard.overlaysContent = virtualKeyboardOverlayOriginal;
      } catch {}
      virtualKeyboardOverlayActive = !1;
      virtualKeyboardOverlayCaptured = !1;
    }
    const NON_TYPING_INPUT_TYPES = new Set([ "button", "submit", "reset", "checkbox", "radio", "range", "color", "file", "image", "hidden" ]);
    function isSoftKeyboardTarget(element) {
      if (!element || element.nodeType !== 1) return !1;
      if (element.isContentEditable) return !0;
      const tag = element.tagName;
      if (tag === "TEXTAREA") return !0;
      if (tag !== "INPUT") return !1;
      return !NON_TYPING_INPUT_TYPES.has(String(element.type || "text").toLowerCase());
    }
    function scheduleMobileViewportMetrics() {
      if (mobileViewportMetricsRaf || destroyed) return;
      mobileViewportMetricsRaf = hostWindow.requestAnimationFrame(() => {
        mobileViewportMetricsRaf = 0;
        !destroyed && mobileViewportMetricsDirty && applyMobileViewportMetrics();
      });
    }
    const MOBILE_KEYBOARD_SHRINK_PX = 80;
    let mobileViewportRecheckTimer = 0;
    let mobileViewportRecheckCount = 0;
    let mobileViewportShrinkFrom = 0;
    function mobileViewportStillShrunk() {
      const frozen = parseFloat(hostDocument.documentElement.style.getPropertyValue("--cl-mobile-viewport-height")) || 0;
      const current = Math.round(hostWindow.visualViewport?.height || hostWindow.innerHeight || 0);
      return frozen > 0 && current > 0 && current < frozen - MOBILE_KEYBOARD_SHRINK_PX;
    }
    function clearMobileViewportRecheck() {
      mobileViewportRecheckTimer && hostWindow.clearTimeout(mobileViewportRecheckTimer);
      mobileViewportRecheckTimer = 0;
      mobileViewportRecheckCount = 0;
      mobileViewportShrinkFrom = 0;
    }
    function scheduleMobileViewportRecheck() {
      if (mobileViewportRecheckTimer || destroyed) return;
      mobileViewportRecheckTimer = hostWindow.setTimeout(() => {
        mobileViewportRecheckTimer = 0;
        if (destroyed || !mobileViewportShrinkFrom) return;
        applyMobileViewportMetrics();
        mobileViewportShrinkFrom && scheduleMobileViewportRecheck();
      }, 1500);
    }
    function applyMobileViewportMetrics() {
      const root = hostDocument.documentElement;
      if (!isMobileLayout()) {
        root.style.removeProperty("--cl-mobile-viewport-height");
        root.style.removeProperty("--cl-mobile-viewport-top");
        root.style.removeProperty("--cl-mobile-popup-height");
        return;
      }
      if (keyboardBaselineMode) return;
      const keyboardClearedWhileFocused = mobileViewportShrinkFrom > 0 && Math.round(hostWindow.visualViewport?.height || hostWindow.innerHeight || 0) >= mobileViewportShrinkFrom - MOBILE_KEYBOARD_SHRINK_PX;
      if (isSoftKeyboardTarget(hostDocument.activeElement) && !keyboardClearedWhileFocused) return;
      if (Date.now() < mobileKeyboardSettlingUntil) return;
      mobileViewportMetricsDirty = !1;
      const viewport = hostWindow.visualViewport;
      const height = Math.max(1, Math.round(viewport?.height || hostWindow.innerHeight || 1));
      const previousHeight = parseFloat(root.style.getPropertyValue("--cl-mobile-viewport-height")) || 0;
      if (previousHeight && height < previousHeight - MOBILE_KEYBOARD_SHRINK_PX) {
        mobileViewportShrinkFrom = Math.max(mobileViewportShrinkFrom, previousHeight);
        mobileViewportRecheckCount = 0;
      }
      if (mobileViewportShrinkFrom && height < mobileViewportShrinkFrom - MOBILE_KEYBOARD_SHRINK_PX && mobileViewportRecheckCount < 8) {
        mobileViewportRecheckCount += 1;
        mobileViewportMetricsDirty = !0;
        scheduleMobileViewportRecheck();
      } else mobileViewportShrinkFrom && clearMobileViewportRecheck();
      const popupHeight = Math.max(height, Math.round(hostWindow.innerHeight || hostDocument.documentElement.clientHeight || height));
      const top = Math.max(0, Math.round(viewport?.offsetTop || 0));
      const heightValue = `${height}px`;
      const topValue = `${top}px`;
      root.style.getPropertyValue("--cl-mobile-viewport-height") !== heightValue && root.style.setProperty("--cl-mobile-viewport-height", heightValue);
      root.style.getPropertyValue("--cl-mobile-viewport-top") !== topValue && root.style.setProperty("--cl-mobile-viewport-top", topValue);
      const popupHeightValue = `${popupHeight}px`;
      root.style.getPropertyValue("--cl-mobile-popup-height") !== popupHeightValue && root.style.setProperty("--cl-mobile-popup-height", popupHeightValue);
    }
    function applyMobileComposerTranslate() {
      mobileComposerTranslateRaf = 0;
      const shell = observedComposerShell?.isConnected ? observedComposerShell : hostDocument.querySelector("#form_sheld");
      if (!shell) return;
      if (!isMobileLayout()) {
        shell.style.removeProperty("--cl-mobile-composer-translate-y");
        return;
      }
      if (usesNativeAndroidKeyboardLayout()) {
        mobileKeyboardRecoveryActive = !1;
        mobileStableLayoutHeight = Math.max(1, Math.round(hostWindow.innerHeight || hostDocument.documentElement.clientHeight || 1));
        shell.style.removeProperty("--cl-mobile-composer-translate-y");
        return;
      }
      if (virtualKeyboardOverlayActive) {
        mobileKeyboardRecoveryActive = !1;
        shell.style.removeProperty("--cl-mobile-composer-translate-y");
        return;
      }
      const inputFocused = hostDocument.activeElement?.id === "send_textarea";
      const viewport = hostWindow.visualViewport;
      const layoutHeight = Math.max(1, Math.round(hostWindow.innerHeight || hostDocument.documentElement.clientHeight || viewport?.height || 1));
      const visibleBottom = Math.round((viewport?.offsetTop || 0) + (viewport?.height || layoutHeight));
      let translateY = 0;
      if (inputFocused) translateY = -Math.max(0, layoutHeight - visibleBottom); else if (mobileKeyboardRecoveryActive) {
        translateY = Math.max(0, mobileStableLayoutHeight - layoutHeight);
        if (translateY <= 1) {
          mobileKeyboardRecoveryActive = !1;
          mobileStableLayoutHeight = layoutHeight;
          translateY = 0;
        }
      } else mobileStableLayoutHeight = layoutHeight;
      const value = `${translateY}px`;
      shell.style.getPropertyValue("--cl-mobile-composer-translate-y") !== value && shell.style.setProperty("--cl-mobile-composer-translate-y", value);
    }
    function scheduleMobileComposerTranslate() {
      if (destroyed || keyboardBaselineMode || mobileComposerTranslateRaf) return;
      mobileComposerTranslateRaf = hostWindow.requestAnimationFrame(applyMobileComposerTranslate);
    }
    function resetMobileComposerTranslate() {
      mobileComposerTranslateRaf && hostWindow.cancelAnimationFrame(mobileComposerTranslateRaf);
      mobileComposerTranslateRaf = 0;
      if (keyboardBaselineMode) return;
      applyMobileComposerTranslate();
    }
    function handleViewportChange() {
      if (destroyed) return;
      clawdReadingGate.reset();
      mobileViewportMetricsDirty = !0;
      scheduleMobileViewportMetrics();
      scheduleMobileComposerTranslate();
      if (hostDocument.activeElement?.id === "send_textarea" || Date.now() < mobileKeyboardSettlingUntil) return;
      const width = Math.round(hostWindow.visualViewport?.width || hostWindow.innerWidth || 0);
      if (Math.abs(width - lastViewportWidth) <= 2) return;
      lastViewportWidth = width;
      viewportSettleTimer && hostWindow.clearTimeout(viewportSettleTimer);
      viewportSettleTimer = hostWindow.setTimeout(() => {
        viewportSettleTimer = 0;
        scheduleRefresh();
      }, 180);
    }
    function clearMobileViewportSettleTimers() {
      mobileViewportSettleTimers.forEach(id => hostWindow.clearTimeout(id));
      mobileViewportSettleTimers = [];
    }
    let mobileSettleSignature = "";
    function mobileViewportSignature() {
      const viewport = hostWindow.visualViewport;
      return [ Math.round(hostWindow.innerHeight || 0), Math.round(hostDocument.documentElement.clientHeight || 0), Math.round(viewport?.height || 0), Math.round(viewport?.offsetTop || 0) ].join("|");
    }
    function stopMobileKeyboardPoll() {
      mobileKeyboardPollTimer && hostWindow.clearInterval(mobileKeyboardPollTimer);
      mobileKeyboardPollTimer = 0;
      mobileKeyboardPollSignature = "";
    }
    function pollMobileKeyboardGeometry() {
      if (destroyed || !isMobileLayout() || hostDocument.activeElement?.id !== "send_textarea") {
        stopMobileKeyboardPoll();
        return;
      }
      const signature = mobileViewportSignature();
      if (signature === mobileKeyboardPollSignature) return;
      mobileKeyboardPollSignature = signature;
      scheduleMobileComposerTranslate();
    }
    function startMobileKeyboardPoll() {
      if (keyboardBaselineMode || virtualKeyboardOverlayActive || !isMobileLayout() || hostDocument.activeElement?.id !== "send_textarea") return;
      mobileKeyboardPollSignature = mobileViewportSignature();
      mobileKeyboardPollTimer || (mobileKeyboardPollTimer = hostWindow.setInterval(pollMobileKeyboardGeometry, 300));
      scheduleMobileComposerTranslate();
    }
    function endMobileKeyboardSettling() {
      mobileKeyboardSettlingUntil = 0;
      clearMobileViewportSettleTimers();
      scheduleMobileComposerTranslate();
      hostDocument.activeElement?.id !== "send_textarea" && applyMobileViewportMetrics();
    }
    function scheduleMobileViewportSettle() {
      if (!isMobileLayout() || keyboardBaselineMode) return;
      clearMobileViewportSettleTimers();
      mobileKeyboardSettlingUntil = Date.now() + 8e3;
      mobileSettleSignature = "";
      scheduleMobileComposerTranslate();
      mobileViewportSettleTimers = [ 300, 900, 2e3, 5e3, 8e3 ].map(delay => hostWindow.setTimeout(() => {
        if (destroyed) return;
        if (Date.now() >= mobileKeyboardSettlingUntil) {
          endMobileKeyboardSettling();
          return;
        }
        const signature = mobileViewportSignature();
        if (signature === mobileSettleSignature && !mobileKeyboardRecoveryActive && (isSoftKeyboardTarget(hostDocument.activeElement) || !mobileViewportStillShrunk())) {
          endMobileKeyboardSettling();
          return;
        }
        mobileSettleSignature = signature;
        scheduleMobileComposerTranslate();
      }, delay));
    }
    function isTauriTavernHost() {
      return Boolean(hostWindow.__TAURITAVERN__ || hostWindow.__TAURI_INTERNALS__ || window.__TAURITAVERN__ || window.__TAURI_INTERNALS__);
    }
    function hasSelectedConversation() {
      const context = getContext();
      const characterId = context?.characterId ?? context?.character_id;
      const groupId = context?.groupId ?? context?.group_id;
      return characterId !== void 0 && characterId !== null && characterId !== "" || groupId !== void 0 && groupId !== null && groupId !== "";
    }
    function heroCandidates(who, cn) {
      const hour = (new Date).getHours();
      if (cn) {
        const timeLine = hour < 5 ? who ? `${who}，还没睡？` : "还没睡？" : `${hour < 12 ? "早安" : hour < 18 ? "下午好" : "晚上好"}${who ? `，${who}` : ""}`;
        return [ timeLine, who ? `${who}，今天想做点什么？` : "今天想做点什么？", who ? `在忙什么呢，${who}？` : "在忙什么呢？", "今天 Claude 能帮你做什么？", who ? `${who}，最近怎么样？` : "最近怎么样？", who ? `从哪里开始，${who}？` : "从哪里开始？", who ? `${who}，在想什么？` : "在想什么？", who ? `准备好了就开始吧，${who}` : "准备好了就开始吧", who ? `今天一起做点什么，${who}？` : "今天一起做点什么？", "新的一页。写点什么？" ];
      }
      const timeLine = hour < 5 ? who ? `Still up, ${who}?` : "Still up?" : `${hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"}${who ? `, ${who}` : ""}`;
      return [ timeLine, who ? `What's cooking, ${who}?` : "What's cooking?", who ? `What are we working on, ${who}?` : "What are we working on?", "How can Claude help you today?", who ? `How was your day, ${who}?` : "How was your day?", who ? `Where should we start, ${who}?` : "Where should we start?", who ? `What's on your mind, ${who}?` : "What's on your mind?", who ? `Ready when you are, ${who}` : "Ready when you are", who ? `What shall we make, ${who}?` : "What shall we make?", "A fresh page. What goes on it?" ];
    }
    function takeHeroPick() {
      const count = heroCandidates("", !1).length;
      let last = -1;
      try {
        last = Number(hostWindow.sessionStorage?.getItem("clawd-last-hero-line") ?? -1);
      } catch {}
      const pool = [ ...Array(count).keys() ].filter(i => i !== last);
      const pick = pool[Math.floor(Math.random() * pool.length)] ?? 0;
      try {
        hostWindow.sessionStorage?.setItem("clawd-last-hero-line", String(pick));
      } catch {}
      return pick;
    }
    function heroText() {
      const list = heroCandidates((getContext()?.name1 || "").trim(), ccPrefersChinese());
      return list[heroPick] ?? list[0];
    }
    let heroPick = -1;
    function collapseReasoning() {
      for (const box of hostDocument.querySelectorAll("#chat .mes_reasoning_details[open]:not([data-clawd-collapsed])")) {
        box.dataset.clawdCollapsed = "1";
        box.removeAttribute("open");
      }
    }
    function preserveStreamingReasoning(typingActive) {
      if (!typingActive) return;
      const latest = [ ...hostDocument.querySelectorAll('#chat > .mes[is_user="false"]') ].at(-1);
      latest?.querySelectorAll(".mes_reasoning_details").forEach(box => {
        box.dataset.clawdCollapsed = "1";
      });
    }
    function expandReasoningWhileEditing() {
      for (const box of hostDocument.querySelectorAll("#chat .mes_reasoning_details:has(.reasoning_edit_textarea)")) if (!box.open) {
        box.dataset.clawdForceOpenForEdit = "1";
        box.open = !0;
      }
      for (const box of hostDocument.querySelectorAll("#chat .mes_reasoning_details[data-clawd-force-open-for-edit]")) if (!box.querySelector(".reasoning_edit_textarea")) {
        box.removeAttribute("open");
        delete box.dataset.clawdForceOpenForEdit;
      }
    }
    function refreshWelcomeMode(messages) {
      if (!welcomeEnabled) return;
      const real = messages.filter(m => !isWelcomeSurfaceMessage(m));
      pendingWelcomeCharacter !== null ? welcomeStage = "welcome" : hasSelectedConversation() || real.length > 0 ? welcomeStage = "chat" : welcomeStage === "leaving" && !generationEventActive && Date.now() - leavingSince > 1200 ? welcomeStage = "welcome" : welcomeStage === "leaving" && Date.now() - leavingSince <= 15e3 || (welcomeStage = "welcome");
      const isWelcome = welcomeStage === "welcome";
      setBodyClass(WELCOME_CLASS, isWelcome);
      if (isWelcome && wasWelcome === !1) {
        lastActivityAt = Date.now();
        idleAsleep = !1;
        setSleeping(!1);
        setNeglected(!1);
        lastPokeAt = Date.now();
      }
      wasWelcome = isWelcome;
      const chat = hostDocument.querySelector("#chat");
      const strays = [ ...hostDocument.querySelectorAll("." + HERO_CLASS) ];
      if (!isWelcome || !chat) {
        for (const el of strays) el.remove();
        heroPick = -1;
        return;
      }
      heroPick < 0 && (heroPick = takeHeroPick());
      const line = heroText();
      if (strays.length === 1 && strays[0].parentElement === chat && strays[0].textContent.trim()) {
        if (strays[0].textContent === line) return;
        {
          const text = [ ...strays[0].childNodes ].find(n => n.nodeType === 3);
          if (text) {
            text.data = line;
            return;
          }
        }
      }
      for (const el of strays) el.remove();
      const hero = hostDocument.createElement("div");
      hero.className = HERO_CLASS;
      hero.innerHTML = '<span class="asterisk"></span>';
      hero.append(hostDocument.createTextNode(line));
      chat.prepend(hero);
      chat.scrollTop = 0;
      hostWindow.requestAnimationFrame(() => {
        !destroyed && chat.isConnected && hostDocument.body.classList.contains(WELCOME_CLASS) && (chat.scrollTop = 0);
      });
    }
    const RAIL_BRAND_CLASS = "clawd-rail-brand";
    const RAIL_RECENTS_CLASS = "clawd-rail-recents";
    const PC_TOP_ACTIONS_CLASS = "clawd-pc-top-actions";
    const railEnabled = CLAUDE_FEATURES.rail;
    function refreshRailBrand() {
      if (!railEnabled) return;
      const holder = hostDocument.querySelector("#top-settings-holder");
      if (!holder) return;
      const brands = [ ...hostDocument.querySelectorAll("." + RAIL_BRAND_CLASS) ];
      for (const extra of brands.slice(1)) extra.remove();
      let brand = brands[0] || null;
      if (brand && brand.parentElement !== holder) {
        brand.remove();
        brand = null;
      }
      if (!brand) {
        brand = hostDocument.createElement("div");
        brand.className = RAIL_BRAND_CLASS;
        brand.textContent = "Claude";
        holder.prepend(brand);
      }
    }
    function refreshPcTopActions() {
      if (!railEnabled) return;
      const holder = hostDocument.querySelector("#top-settings-holder");
      if (!holder) return;
      let existing = hostDocument.querySelector("." + PC_TOP_ACTIONS_CLASS);
      if (mobileEnabled) {
        existing?.remove();
        return;
      }
      if (existing && existing.parentElement !== holder) {
        existing.remove();
        existing = null;
      }
      if (existing?.isConnected) return;
      const actions = hostDocument.createElement("div");
      actions.className = PC_TOP_ACTIONS_CLASS;
      actions.setAttribute("aria-hidden", "true");
      actions.innerHTML = '<span><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4 4"></path></svg></span><span><svg viewBox="0 0 24 24"><rect x="3.5" y="4" width="17" height="16" rx="2.5"></rect><path d="M9 4v16"></path></svg></span>';
      holder.append(actions);
    }
    const RECENT_SETTINGS_KEY = "recentChatsSettings";
    const PINNED_CHATS_KEY = "pinnedChats";
    const RECENT_DEFAULT_MAX = 15;
    let recentRenderToken = 0;
    let recentRenderPending = !1;
    let recentSignature = null;
    const RECENT_FETCH_TTL = 6e4;
    let recentFetchedAt = 0;
    let recentLoadedOnce = !1;
    let recentDataVersion = 0;
    function readAccountStorage(key) {
      const store = getContext()?.accountStorage;
      try {
        const raw = typeof store?.getItem === "function" ? store.getItem(key) : hostWindow.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    }
    function readRecentChatsSettings() {
      const parsed = readAccountStorage(RECENT_SETTINGS_KEY);
      const max = Math.max(1, parseInt(parsed?.maxDisplayed, 10) || RECENT_DEFAULT_MAX);
      return {
        maxDisplayed: max
      };
    }
    function readPinnedChats() {
      const state = readAccountStorage(PINNED_CHATS_KEY);
      return state && typeof state === "object" ? state : {};
    }
    function pinnedKeyFor(record) {
      const group = record?.group ? `group_${record.group}` : "";
      const avatar = record?.avatar ? `char_${record.avatar}` : "";
      return `${group}${avatar}_${record?.file_name ?? ""}`;
    }
    function writeAccountStorage(key, value) {
      const store = getContext()?.accountStorage;
      const raw = JSON.stringify(value);
      typeof store?.setItem === "function" ? store.setItem(key, raw) : hostWindow.localStorage.setItem(key, raw);
    }
    let recentMenu = null;
    let recentLongPressUntil = 0;
    function closeRecentMenu() {
      if (!recentMenu) return;
      recentMenu.cleanup();
      recentMenu.el.remove();
      recentMenu.row.classList.remove("cw-recent-menu-open");
      recentMenu = null;
    }
    function openRecentMenu(entry, row, anchor) {
      closeRecentMenu();
      const cn = ccPrefersChinese();
      const pinned = Object.prototype.hasOwnProperty.call(readPinnedChats(), pinnedKeyFor(entry.record));
      const cwLook = hostDocument.documentElement.hasAttribute("data-cw-v4");
      const menu = hostDocument.createElement("div");
      menu.className = cwLook ? "cw-menu-wrap cw-recent-menu-wrap" : "cw-recent-menu";
      const box = cwLook ? hostDocument.createElement("div") : menu;
      if (cwLook) {
        box.className = "cw-menu cw-recent-menu-list";
        menu.append(box);
      }
      box.setAttribute("role", "menu");
      const item = (icon, label, run, danger = !1) => {
        const b = hostDocument.createElement("button");
        b.type = "button";
        b.className = "cw-recent-menu-item" + (danger ? " danger" : "");
        b.setAttribute("role", "menuitem");
        b.dataset.icon = icon;
        if (cwLook) {
          b.className = "cw-menu-item" + (danger ? " cw-danger" : "");
          const ic = hostDocument.createElement("span");
          ic.className = "cw-recent-ic";
          ic.dataset.icon = icon;
          const lb = hostDocument.createElement("span");
          lb.className = "cw-menu-label";
          lb.textContent = label;
          b.append(ic, lb);
        }
        b.title = label;
        b.setAttribute("aria-label", label);
        b.addEventListener("click", event => {
          event.preventDefault();
          event.stopPropagation();
          closeRecentMenu();
          run().catch(error => {
            console.error("[Claude-Clawd] 近期对话操作失败：", error);
            hostWindow.toastr?.error?.(String(error?.message || error || "").slice(0, 180));
          });
        });
        return b;
      };
      box.append(item("pin", pinned ? cn ? "取消置顶" : "Unpin" : cn ? "置顶" : "Pin", () => toggleRecentPin(entry)), item("pencil", cn ? "重命名" : "Rename", () => renameRecent(entry)));
      if (cwLook) {
        const sep = hostDocument.createElement("div");
        sep.className = "cw-menu-sep";
        box.append(sep);
      }
      box.append(item("trash", cn ? "删除" : "Delete", async () => deleteRecentRow(row), !0));
      hostDocument.body.append(menu);
      row.classList.add("cw-recent-menu-open");
      const a = anchor.getBoundingClientRect(), m = box.getBoundingClientRect();
      let left = a.left - m.width - 4;
      let top = a.top + (a.height - m.height) / 2;
      if (cwLook) {
        const phone = hostWindow.matchMedia("(max-width:700px)").matches;
        left = phone ? a.right - m.width + 6 : a.left - 6;
        left = Math.max(8, Math.min(left, hostWindow.innerWidth - m.width - 8));
        top = a.bottom + 6;
        top + m.height > hostWindow.innerHeight - 8 && (top = Math.max(8, a.top - m.height - 6));
      } else if (left < 8) {
        left = Math.max(8, Math.min(a.right - m.width, hostWindow.innerWidth - m.width - 8));
        top = a.bottom + 4;
        top + m.height > hostWindow.innerHeight - 8 && (top = Math.max(8, a.top - m.height - 4));
      }
      box.style.left = Math.round(left) + "px";
      box.style.top = Math.round(top) + "px";
      const outside = event => {
        menu.contains(event.target) || anchor.contains(event.target) || closeRecentMenu();
      };
      const key = event => {
        if (event.key === "Escape") {
          closeRecentMenu();
          event.stopPropagation();
        }
      };
      const away = () => closeRecentMenu();
      hostDocument.addEventListener("pointerdown", outside, !0);
      hostDocument.addEventListener("keydown", key, !0);
      hostWindow.addEventListener("resize", away);
      const list = row.closest(".recentChatList");
      list?.addEventListener("scroll", away, {
        passive: !0
      });
      recentMenu = {
        el: menu,
        row: row,
        cleanup() {
          hostDocument.removeEventListener("pointerdown", outside, !0);
          hostDocument.removeEventListener("keydown", key, !0);
          hostWindow.removeEventListener("resize", away);
          list?.removeEventListener("scroll", away);
        }
      };
    }
    async function toggleRecentPin(entry) {
      const state = {
        ...readPinnedChats()
      };
      const key = pinnedKeyFor(entry.record);
      Object.prototype.hasOwnProperty.call(state, key) ? delete state[key] : state[key] = {
        group: entry.record?.group,
        avatar: entry.record?.avatar,
        file_name: entry.record?.file_name
      };
      writeAccountStorage(PINNED_CHATS_KEY, state);
      recentDataVersion += 1;
      refreshRailRecents({
        force: !0
      });
    }
    async function renameRecent(entry) {
      const {main: main, popup: popup} = await loadDeleteModules();
      const cn = ccPrefersChinese();
      const oldName = entry.fileName;
      const title = cn ? "新的对话名" : "New chat name";
      const answer = typeof popup?.callGenericPopup === "function" && popup?.POPUP_TYPE?.INPUT !== void 0 ? await popup.callGenericPopup(title, popup.POPUP_TYPE.INPUT, oldName) : hostWindow.prompt(title, oldName);
      const newName = typeof answer === "string" ? answer.trim() : "";
      if (!newName || newName === oldName) return;
      if (typeof main?.renameGroupOrCharacterChat !== "function") throw new Error(cn ? "拿不到酒馆的重命名接口" : "SillyTavern rename API unavailable");
      if (entry.isGroup) await main.renameGroupOrCharacterChat({
        groupId: entry.group,
        oldFileName: oldName,
        newFileName: newName,
        loader: !1
      }); else {
        const {index: index} = resolveCharacterIndex(main, entry.avatar);
        if (index < 0) throw new Error((cn ? "找不到角色：" : "Character not found: ") + entry.avatar);
        await main.renameGroupOrCharacterChat({
          characterId: String(index),
          oldFileName: oldName,
          newFileName: newName,
          loader: !1
        });
        typeof main.updateRemoteChatName === "function" && await main.updateRemoteChatName(index, newName);
      }
      const state = {
        ...readPinnedChats()
      };
      const oldKey = pinnedKeyFor(entry.record);
      if (Object.prototype.hasOwnProperty.call(state, oldKey)) {
        const ext = /\.jsonl$/i.test(String(entry.record?.file_name ?? "")) ? ".jsonl" : "";
        const renamed = {
          ...entry.record,
          file_name: newName + ext
        };
        delete state[oldKey];
        state[pinnedKeyFor(renamed)] = {
          group: renamed.group,
          avatar: renamed.avatar,
          file_name: renamed.file_name
        };
        writeAccountStorage(PINNED_CHATS_KEY, state);
      }
      hostWindow.toastr?.success?.(cn ? "已重命名" : "Chat renamed");
      recentDataVersion += 1;
      refreshRailRecents({
        force: !0
      });
    }
    function deleteRecentRow(row) {
      if (recentDeleteBusy) return;
      recentDeleteBusy = !0;
      deleteRecentWithoutOpening(row).catch(error => {
        console.error("[Claude-Clawd] 删除近期对话失败：", error);
        const detail = String(error?.message || error || "").slice(0, 180);
        hostWindow.toastr?.error?.(ccPrefersChinese() ? `删除失败：${detail}` : `Chat deletion failed: ${detail}`);
      }).finally(() => {
        recentDeleteBusy = !1;
        refreshRailRecents({
          force: !0
        });
      });
    }
    function markCurrentRecent() {
      const chatId = String(getContext()?.getCurrentChatId?.() ?? "");
      for (const row of hostDocument.querySelectorAll(".clawd-rail-recents .recentChat")) {
        const on = Boolean(chatId) && normalizeChatKey(row.dataset.file) === normalizeChatKey(chatId);
        row.classList.contains("cw-current") !== on && row.classList.toggle("cw-current", on);
      }
    }
    async function buildRecentEntries() {
      const main = hostModulesSnapshot?.main ?? {};
      const settings = readRecentChatsSettings();
      const pinned = readPinnedChats();
      const records = await fetchRecentChatRecords(main, settings.maxDisplayed, Object.values(pinned));
      if (!records) return null;
      const context = getContext();
      const characters = Array.isArray(context?.characters) ? context.characters : [];
      const groups = Array.isArray(context?.groups) ? context.groups : [];
      if (records.length && !characters.length && !groups.length) return null;
      const entries = [];
      for (const record of records) {
        const character = characters.find(item => item?.avatar === record?.avatar) ?? null;
        const group = groups.find(item => item?.id === record?.group) ?? null;
        if (!character && !group) continue;
        entries.push({
          record: record,
          fileName: String(record?.file_name ?? "").replace(/\.jsonl$/i, ""),
          avatar: String(record?.avatar ?? ""),
          group: String(record?.group ?? ""),
          isGroup: Boolean(group),
          name: character?.name || group?.name || "",
          thumbnail: character && typeof context?.getThumbnailUrl === "function" ? context.getThumbnailUrl("avatar", character.avatar) : "",
          dateText: String(record?.last_mes ?? ""),
          preview: String(record?.mes ?? record?.preview_message ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160),
          count: Number(record?.chat_items ?? record?.message_count ?? NaN),
          pinned: Object.prototype.hasOwnProperty.call(pinned, pinnedKeyFor(record))
        });
      }
      const timeOf = value => {
        const text = String(value ?? "").replace(/(\d)\s*(am|pm)\b/i, "$1 $2");
        const parsed = Date.parse(text);
        return Number.isFinite(parsed) ? parsed : 0;
      };
      const byAge = entries.slice().sort((a, b) => timeOf(a.dateText) - timeOf(b.dateText));
      byAge.forEach((entry, i) => {
        entry.actNo = i + 1;
      });
      entries.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        const diff = timeOf(b.dateText) - timeOf(a.dateText);
        if (diff) return diff;
        return String(b.dateText).localeCompare(String(a.dateText));
      });
      return entries;
    }
    function ensureRecentsSlot(holder) {
      const slots = [ ...hostDocument.querySelectorAll("." + RAIL_RECENTS_CLASS) ];
      for (const extra of slots.slice(1)) extra.remove();
      let slot = slots[0] || null;
      if (slot && slot.parentElement !== holder) {
        slot.remove();
        slot = null;
      }
      if (slot) return slot;
      slot = hostDocument.createElement("div");
      slot.className = RAIL_RECENTS_CLASS;
      const label = hostDocument.createElement("div");
      label.className = "clawd-rail-recents-label";
      label.textContent = ccPrefersChinese() ? "最近" : "Recents";
      slot.append(label);
      const pinnedDrawer = holder.querySelector(":scope > .drawer#persona-management-button");
      pinnedDrawer ? holder.insertBefore(slot, pinnedDrawer) : holder.append(slot);
      return slot;
    }
    function recentActRoman(value) {
      let number = Math.max(1, Math.floor(Number(value) || 1));
      let result = "";
      for (const [unit, roman] of [ [ 10, "X" ], [ 9, "IX" ], [ 5, "V" ], [ 4, "IV" ], [ 1, "I" ] ]) while (number >= unit) {
        result += roman;
        number -= unit;
      }
      return result || "I";
    }
    function recentDateLabel(value) {
      const raw = String(value ?? "");
      if (!raw) return "";
      const parsed = Date.parse(raw.replace(/(\d)\s*(am|pm)\b/i, "$1 $2"));
      if (!Number.isFinite(parsed)) return raw;
      const d = new Date(parsed);
      const now = new Date;
      const sameDay = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
      if (sameDay) return d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
      if (d.getFullYear() === now.getFullYear()) return d.toLocaleDateString([], {
        month: "numeric",
        day: "numeric"
      });
      return d.toLocaleDateString([], {
        year: "numeric",
        month: "numeric",
        day: "numeric"
      });
    }
    function buildRecentRow(entry) {
      const row = hostDocument.createElement("div");
      row.className = "recentChat" + (entry.isGroup ? " group" : "");
      row.dataset.file = entry.fileName;
      row.dataset.avatar = entry.avatar;
      row.dataset.group = entry.group;
      const avatar = hostDocument.createElement("div");
      avatar.className = "avatar";
      if (entry.thumbnail) {
        const img = hostDocument.createElement("img");
        img.src = entry.thumbnail;
        img.alt = entry.name;
        avatar.append(img);
      }
      const info = hostDocument.createElement("div");
      info.className = "recentChatInfo";
      const nameContainer = hostDocument.createElement("div");
      nameContainer.className = "chatNameContainer";
      const nameLine = hostDocument.createElement("div");
      nameLine.className = "chatName";
      nameLine.title = entry.fileName;
      const strong = hostDocument.createElement("strong");
      strong.className = "characterName";
      strong.textContent = entry.name;
      const dash = hostDocument.createElement("span");
      dash.textContent = "–";
      const chatLabel = hostDocument.createElement("span");
      chatLabel.textContent = entry.fileName;
      nameLine.append(strong, dash, chatLabel);
      const date = hostDocument.createElement("small");
      date.className = "chatDate";
      date.title = entry.dateText;
      date.textContent = recentDateLabel(entry.dateText);
      let preview = null;
      if (entry.preview) {
        preview = hostDocument.createElement("div");
        preview.className = "chatPreview";
        preview.textContent = entry.preview;
      }
      const meta = hostDocument.createElement("div");
      meta.className = "chatMeta";
      meta.textContent = [ entry.name, Number.isFinite(entry.actNo) ? "第 " + recentActRoman(entry.actNo) + " 幕" : "", Number.isFinite(entry.count) && entry.count > 0 ? entry.count + " 句" : "" ].filter(Boolean).join(" · ");
      const actions = hostDocument.createElement("div");
      actions.className = "chatActions";
      const del = hostDocument.createElement("button");
      del.type = "button";
      del.className = "menu_button menu_button_icon deleteChat";
      del.title = ccPrefersChinese() ? "删除对话" : "Delete chat";
      del.innerHTML = '<i class="fa-solid fa-trash fa-fw"></i>';
      const more = hostDocument.createElement("button");
      more.type = "button";
      more.className = "cw-recent-more";
      more.title = ccPrefersChinese() ? "更多" : "More";
      more.setAttribute("aria-label", more.title);
      more.setAttribute("aria-haspopup", "menu");
      actions.append(del, more);
      nameContainer.append(nameLine, date, actions, meta);
      preview && nameContainer.append(preview);
      info.append(nameContainer);
      row.append(avatar, info);
      return row;
    }
    async function openRecentChat(entry) {
      const {main: main, groups: groups} = await loadDeleteModules();
      const context = getContext();
      if (entry.isGroup) {
        typeof groups?.openGroupById === "function" && await groups.openGroupById(entry.group);
        typeof main?.setActiveGroup === "function" ? main.setActiveGroup(entry.group) : console.warn("[Claude-Clawd] 拿不到 setActiveGroup，最后活跃群组不会更新。");
        context?.saveSettingsDebounced?.();
        if (context?.getCurrentChatId?.() === entry.fileName) return;
        await (context?.openGroupChat?.(entry.group, entry.fileName));
        return;
      }
      const characters = Array.isArray(context?.characters) ? context.characters : [];
      const {index: index} = resolveCharacterIndex({
        characters: characters
      }, entry.avatar);
      if (index < 0) {
        console.warn(`[Claude-Clawd] 找不到头像为 ${JSON.stringify(entry.avatar)} 的角色，打不开。`);
        hostWindow.toastr?.warning?.(ccPrefersChinese() ? "找不到对应的角色卡。" : "Character not found.");
        return;
      }
      await (context?.selectCharacterById?.(index));
      typeof main?.setActiveCharacter === "function" ? main.setActiveCharacter(characters[index]?.avatar) : console.warn("[Claude-Clawd] 拿不到 setActiveCharacter，最后活跃角色不会更新（A2 的成因）。");
      context?.saveSettingsDebounced?.();
      if (context?.getCurrentChatId?.() === entry.fileName) {
        scheduleChatReconcile();
        return;
      }
      await (context?.openCharacterChat?.(entry.fileName));
      scheduleChatReconcile();
    }
    function signatureOf(entries) {
      return JSON.stringify(entries.map(entry => [ entry.fileName, entry.avatar, entry.group, entry.name, entry.pinned ? 1 : 0 ]));
    }
    function renderRecentRows(slot, entries) {
      const existing = slot.querySelector(".recentChatList");
      const list = existing ?? hostDocument.createElement("div");
      if (!existing) {
        list.className = "recentChatList";
        list.dataset.clawdOwned = "1";
        slot.append(list);
      }
      list.dataset.clawdOwned = "1";
      list.textContent = "";
      const label = slot.querySelector(".clawd-rail-recents-label");
      if (label) {
        let count = label.querySelector(".clawd-rail-recents-count");
        if (!count) {
          count = hostDocument.createElement("span");
          count.className = "clawd-rail-recents-count";
          label.append(count);
        }
        const n = String(entries.length);
        count.textContent !== n && (count.textContent = n);
      }
      for (const entry of entries) {
        const row = buildRecentRow(entry);
        row.addEventListener("click", event => {
          if (event.target instanceof hostWindow.Element && event.target.closest(".chatActions")) return;
          if (Date.now() < recentLongPressUntil) return;
          openRecentChat(entry).catch(error => {
            console.error("[Claude-Clawd] 打开近期对话失败：", error);
          });
        });
        row.querySelector(".deleteChat")?.addEventListener("click", event => {
          event.preventDefault();
          event.stopPropagation();
          deleteRecentRow(row);
        });
        row.querySelector(".cw-recent-more")?.addEventListener("click", event => {
          event.preventDefault();
          event.stopPropagation();
          recentMenu?.row === row ? closeRecentMenu() : openRecentMenu(entry, row, event.currentTarget);
        });
        row.addEventListener("pointerdown", event => {
          if (event.pointerType !== "touch") return;
          const x = event.clientX, y = event.clientY;
          const timer = hostWindow.setTimeout(() => {
            recentLongPressUntil = Date.now() + 700;
            openRecentMenu(entry, row, row.querySelector(".cw-recent-more") || row);
          }, 500);
          const stop = () => {
            hostWindow.clearTimeout(timer);
            row.removeEventListener("pointermove", move);
          };
          const move = e => {
            Math.hypot(e.clientX - x, e.clientY - y) > 8 && stop();
          };
          row.addEventListener("pointermove", move);
          row.addEventListener("pointerup", stop, {
            once: !0
          });
          row.addEventListener("pointercancel", stop, {
            once: !0
          });
        });
        row.addEventListener("contextmenu", event => {
          Date.now() < recentLongPressUntil && event.preventDefault();
        });
        list.append(row);
      }
      recentMenu && !recentMenu.row.isConnected && closeRecentMenu();
      markCurrentRecent();
      setBodyClass("clawd-has-recents", entries.length > 0);
    }
    const RECONCILE_INTERVAL = 200;
    const RECONCILE_MAX_ATTEMPTS = 12;
    let reconcileTimer = 0;
    let reconcileAttempts = 0;
    function retryReconcile() {
      if (destroyed || reconcileAttempts >= RECONCILE_MAX_ATTEMPTS) return !1;
      reconcileAttempts += 1;
      reconcileTimer = hostWindow.setTimeout(reconcileChatDom, RECONCILE_INTERVAL);
      return !0;
    }
    function reconcileChatDom() {
      reconcileTimer = 0;
      if (destroyed) return;
      const chatNode = hostDocument.querySelector("#chat");
      const data = getContext()?.chat;
      if (!chatNode || !Array.isArray(data)) {
        retryReconcile();
        return;
      }
      const nodes = [ ...chatNode.querySelectorAll(":scope > .mes") ];
      if (nodes.length <= data.length) return;
      const lastIndexOf = new Map;
      nodes.forEach((node, index) => lastIndexOf.set(node.getAttribute("mesid"), index));
      const stale = nodes.filter((node, index) => lastIndexOf.get(node.getAttribute("mesid")) !== index);
      if (!stale.length || nodes.length - stale.length !== data.length) {
        if (retryReconcile()) return;
        console.warn(`[Claude-Clawd] #chat 有 ${nodes.length} 条、数据有 ${data.length} 条，但按 mesid 重复只能解释 ${stale.length} 条，保守起见不动。`);
        return;
      }
      for (const node of stale) node.remove();
      console.info(`[Claude-Clawd] 切换聊天后清掉 ${stale.length} 条残留节点（欢迎页问候语挤在 clearChat 和正式渲染之间），用了 ${reconcileAttempts} 次重试。`);
    }
    function scheduleChatReconcile() {
      if (destroyed) return;
      reconcileAttempts = 0;
      reconcileTimer && hostWindow.clearTimeout(reconcileTimer);
      reconcileTimer = hostWindow.setTimeout(reconcileChatDom, RECONCILE_INTERVAL);
    }
    function shouldFetchRecents(force, now) {
      if (force) return !0;
      if (!recentLoadedOnce) return !0;
      if (now - recentFetchedAt <= RECENT_FETCH_TTL) return !1;
      const slot = hostDocument.querySelector("." + RAIL_RECENTS_CLASS);
      return !!slot && slot.getClientRects().length > 0;
    }
    function refreshRailRecents({force: force = !1} = {}) {
      if (!railEnabled || destroyed) return;
      const holder = hostDocument.querySelector("#top-settings-holder");
      if (!holder) return;
      ensureRecentsSlot(holder);
      markCurrentRecent();
      if (recentRenderPending) return;
      const now = Date.now();
      if (!shouldFetchRecents(force, now)) return;
      recentFetchedAt = now;
      recentRenderPending = !0;
      const token = ++recentRenderToken;
      const versionAtFetch = recentDataVersion;
      buildRecentEntries().then(entries => {
        if (destroyed || token !== recentRenderToken) return;
        if (!entries) {
          hostWindow.setTimeout(() => refreshRailRecents({
            force: !0
          }), 600);
          return;
        }
        recentLoadedOnce = !0;
        if (versionAtFetch !== recentDataVersion) {
          hostWindow.setTimeout(() => refreshRailRecents({
            force: !0
          }), 0);
          return;
        }
        const slotNow = hostDocument.querySelector("." + RAIL_RECENTS_CLASS);
        if (!slotNow) return;
        const signature = signatureOf(entries);
        if (signature === recentSignature && slotNow.querySelector(".recentChatList")) return;
        recentSignature = signature;
        renderRecentRows(slotNow, entries);
      }).catch(error => {
        console.warn("[Claude-Clawd] 侧栏近期对话渲染失败：", error);
      }).finally(() => {
        recentRenderPending = !1;
      });
    }
    function restoreRecents() {
      const slot = hostDocument.querySelector("." + RAIL_RECENTS_CLASS);
      if (slot) {
        const borrowed = [ ...slot.querySelectorAll(".recentChatList") ].filter(list => !list.dataset.clawdOwned);
        for (const list of borrowed) list.querySelector(".recentChat") && hostDocument.querySelector("#chat")?.append(list);
        slot.remove();
      }
      hostDocument.body.classList.remove("clawd-has-recents");
    }
    const CHAT_DELETED_EVENT = "chatDeleted";
    const GROUP_CHAT_DELETED_EVENT = "groupChatDeleted";
    const chatDeletedSubscriptions = [];
    function watchChatDeleted() {
      if (!railEnabled || chatDeletedSubscriptions.length) return;
      const context = getContext();
      const source = context?.eventSource;
      const types = context?.eventTypes || context?.event_types || {};
      if (!source?.on) return;
      const eventTypes = new Set([ types.CHAT_DELETED || CHAT_DELETED_EVENT, types.GROUP_CHAT_DELETED || GROUP_CHAT_DELETED_EVENT ]);
      for (const type of eventTypes) {
        const handler = name => {
          dropRecentRow(name);
          recentSignature = null;
          recentDataVersion += 1;
          refreshRailRecents({
            force: !0
          });
        };
        source.on(type, handler);
        chatDeletedSubscriptions.push({
          source: source,
          type: type,
          handler: handler
        });
      }
      const changedType = types.CHAT_CHANGED || "chatLoaded";
      const changedHandler = () => {
      clawdReadingGate.reset(true); clawdComposerReaction.reset();
        guardMobileChatAutofocus();
        recentSignature = null;
        refreshRailRecents({
          force: !0
        });
        scheduleChatReconcile();
      };
      source.on(changedType, changedHandler);
      chatDeletedSubscriptions.push({
        source: source,
        type: changedType,
        handler: changedHandler
      });
    }
    let recentDeleteBusy = !1;
    let deleteModulesPromise = null;
    function hostModuleRoot() {
      const mainScript = [ ...hostDocument.scripts ].find(script => /(?:^|\/)script\.js(?:[?#].*)?$/.test(script.src));
      return {
        main: mainScript?.src || new hostWindow.URL("script.js", hostDocument.baseURI).href,
        root: new hostWindow.URL(".", mainScript?.src || hostDocument.baseURI)
      };
    }
    function resolveHostModule(relativePath) {
      const urls = hostModuleRoot();
      if (relativePath === "script.js") return urls.main;
      return new hostWindow.URL(relativePath, urls.root).href;
    }
    const HOST_MODULES_KEY = "__clawdHostModules";
    const HOST_MODULES_EVENT = "clawd-host-modules-ready";
    const HOST_MODULES_TIMEOUT = 8e3;
    function injectHostModuleLoader() {
      const urls = {
        main: resolveHostModule("script.js"),
        groups: resolveHostModule("scripts/group-chats.js"),
        popup: resolveHostModule("scripts/popup.js")
      };
      const source = [ `import * as main from ${JSON.stringify(urls.main)};`, `import * as groups from ${JSON.stringify(urls.groups)};`, `import * as popup from ${JSON.stringify(urls.popup)};`, `window[${JSON.stringify(HOST_MODULES_KEY)}] = { main, groups, popup };`, `window.dispatchEvent(new CustomEvent(${JSON.stringify(HOST_MODULES_EVENT)}));` ].join("\n");
      return new Promise((resolve, reject) => {
        if (hostWindow[HOST_MODULES_KEY]) {
          resolve(hostWindow[HOST_MODULES_KEY]);
          return;
        }
        const timer = hostWindow.setTimeout(() => reject(new Error("宿主模块注入超时，可能被 CSP 拦掉了。")), HOST_MODULES_TIMEOUT);
        hostWindow.addEventListener(HOST_MODULES_EVENT, () => {
          hostWindow.clearTimeout(timer);
          resolve(hostWindow[HOST_MODULES_KEY]);
        }, {
          once: !0
        });
        let blobTried = !1;
        const tryBlob = () => {
          if (blobTried || hostWindow[HOST_MODULES_KEY]) return;
          blobTried = !0;
          appendBlobLoader(source);
        };
        const inline = hostDocument.createElement("script");
        inline.type = "module";
        inline.textContent = source;
        inline.addEventListener("error", tryBlob, {
          once: !0
        });
        hostDocument.head.append(inline);
        hostWindow.setTimeout(tryBlob, 2e3);
      });
    }
    function appendBlobLoader(source) {
      if (typeof hostWindow.URL?.createObjectURL !== "function" || typeof hostWindow.Blob !== "function") return;
      try {
        const blob = new hostWindow.Blob([ source ], {
          type: "text/javascript"
        });
        const tag = hostDocument.createElement("script");
        tag.type = "module";
        tag.src = hostWindow.URL.createObjectURL(blob);
        hostDocument.head.append(tag);
      } catch (error) {
        console.warn("[Claude-Clawd] blob 兜底也失败了：", error);
      }
    }
    let hostModulesSnapshot = null;
    function loadDeleteModules() {
      deleteModulesPromise || (deleteModulesPromise = injectHostModuleLoader().then(modules => {
        const resolved = {
          main: modules?.main ?? {},
          groups: modules?.groups ?? {},
          popup: modules?.popup ?? {},
          errors: []
        };
        hostModulesSnapshot = resolved;
        return resolved;
      }).catch(error => {
        console.warn("[Claude-Clawd] 拿不到宿主模块，删除会走降级路径：", error);
        const resolved = {
          main: {},
          groups: {},
          popup: {},
          errors: [ error ]
        };
        hostModulesSnapshot = resolved;
        return resolved;
      }));
      return deleteModulesPromise;
    }
    function resolveCharacterIndex(main, avatarId) {
      const list = Array.isArray(main?.characters) ? main.characters : [];
      const exact = list.findIndex(character => character?.avatar === avatarId);
      if (exact >= 0) return {
        index: exact,
        loose: !1
      };
      const wanted = String(avatarId ?? "").trim();
      if (!wanted) return {
        index: -1,
        loose: !1
      };
      const loose = list.findIndex(character => String(character?.avatar ?? "").trim() === wanted);
      loose >= 0 && console.warn(`[Claude-Clawd] 头像文件名首尾空白对不上：DOM 里是 ${JSON.stringify(avatarId)}，角色卡里是 ${JSON.stringify(list[loose]?.avatar)}。已按去空白匹配处理。`);
      return {
        index: loose,
        loose: loose >= 0
      };
    }
    async function confirmRecentDelete(popup) {
      const title = ccPrefersChinese() ? "删除这个对话文件？" : "Delete the Chat File?";
      if (typeof popup?.callGenericPopup === "function" && popup?.POPUP_TYPE?.CONFIRM !== void 0) return Boolean(await popup.callGenericPopup(title, popup.POPUP_TYPE.CONFIRM));
      if (typeof popup?.Popup?.show?.confirm === "function") return Boolean(await popup.Popup.show.confirm(title, ""));
      return hostWindow.confirm(title);
    }
    async function hostRequestHeaders(main) {
      if (typeof main?.getRequestHeaders === "function") return main.getRequestHeaders();
      const context = getContext();
      if (typeof context?.getRequestHeaders === "function") return context.getRequestHeaders();
      const response = await hostWindow.fetch(new hostWindow.URL("csrf-token", hostModuleRoot().root));
      if (!response.ok) throw new Error(`无法取得 CSRF token（HTTP ${response.status}）。`);
      const data = await response.json();
      if (!data?.token) throw new Error("CSRF token 响应无效。");
      return {
        "Content-Type": "application/json",
        "X-CSRF-Token": data.token
      };
    }
    async function emitChatDeleted(eventKey, fileName) {
      const context = getContext();
      const source = context?.eventSource;
      const types = context?.eventTypes || context?.event_types || {};
      const fallback = eventKey === "GROUP_CHAT_DELETED" ? GROUP_CHAT_DELETED_EVENT : CHAT_DELETED_EVENT;
      await (source?.emit?.(types[eventKey] || fallback, fileName));
    }
    async function deleteCharacterChatDirect(main, avatarId, fileName) {
      const response = await hostWindow.fetch(new hostWindow.URL("api/chats/delete", hostModuleRoot().root), {
        method: "POST",
        headers: await hostRequestHeaders(main),
        body: JSON.stringify({
          chatfile: `${fileName}.jsonl`,
          avatar_url: avatarId
        })
      });
      if (!response.ok) throw new Error(`角色对话删除接口返回 HTTP ${response.status}。`);
      await emitChatDeleted("CHAT_DELETED", fileName);
    }
    async function deleteGroupChatDirect(main, groups, groupId, fileName) {
      const group = Array.isArray(groups?.groups) ? groups.groups.find(item => item?.id === groupId) : null;
      if (!group || !Array.isArray(group.chats) || typeof groups.editGroup !== "function") throw new Error("当前酒馆版本未提供安全更新群聊索引所需的接口。");
      const response = await hostWindow.fetch(new hostWindow.URL("api/chats/group/delete", hostModuleRoot().root), {
        method: "POST",
        headers: await hostRequestHeaders(main),
        body: JSON.stringify({
          id: fileName
        })
      });
      if (!response.ok) throw new Error(`群聊删除接口返回 HTTP ${response.status}。`);
      const index = group.chats.indexOf(fileName);
      index >= 0 && group.chats.splice(index, 1);
      group.chat_id === fileName && (group.chat_id = group.chats.at(-1) || "");
      await groups.editGroup(groupId, !0, !0);
      await emitChatDeleted("GROUP_CHAT_DELETED", fileName);
    }
    function normalizeChatKey(value) {
      return String(value ?? "").trim().replace(/\.jsonl$/i, "");
    }
    async function fetchRecentChatRecords(main, max = 500, pinned = []) {
      try {
        const response = await hostWindow.fetch(new hostWindow.URL("api/chats/recent", hostModuleRoot().root), {
          method: "POST",
          headers: await hostRequestHeaders(main),
          body: JSON.stringify({
            max: max,
            pinned: pinned
          }),
          cache: "no-cache"
        });
        if (!response.ok) return null;
        const data = await response.json();
        return Array.isArray(data) ? data : null;
      } catch (error) {
        console.warn("[Claude-Clawd] 读取近期对话列表失败：", error);
        return null;
      }
    }
    async function resolveRecentChatRecord(main, {fileName: fileName, avatarId: avatarId, groupId: groupId}) {
      const list = await fetchRecentChatRecords(main);
      if (!list) return null;
      const wantFile = normalizeChatKey(fileName);
      const wantAvatar = String(avatarId ?? "").trim();
      const wantGroup = String(groupId ?? "").trim();
      const hit = list.find(item => {
        if (normalizeChatKey(item?.file_name) !== wantFile) return !1;
        if (wantGroup) return String(item?.group ?? "").trim() === wantGroup;
        return String(item?.avatar ?? "").trim() === wantAvatar;
      });
      return hit ?? null;
    }
    async function recentChatStillExists(main, fileName) {
      try {
        const response = await hostWindow.fetch(new hostWindow.URL("api/chats/recent", hostModuleRoot().root), {
          method: "POST",
          headers: await hostRequestHeaders(main),
          body: JSON.stringify({
            max: 500,
            pinned: []
          }),
          cache: "no-cache"
        });
        if (!response.ok) return null;
        const data = await response.json();
        if (!Array.isArray(data)) return null;
        const bare = normalizeChatKey(fileName);
        return data.some(item => normalizeChatKey(item?.file_name) === bare);
      } catch (error) {
        console.warn("[Claude-Clawd] 二次确认删除结果失败：", error);
        return null;
      }
    }
    function waitForChatDeleted(fileName, eventKey, timeout = 600) {
      const context = getContext();
      const source = context?.eventSource;
      const types = context?.eventTypes || context?.event_types || {};
      const fallback = eventKey === "GROUP_CHAT_DELETED" ? GROUP_CHAT_DELETED_EVENT : CHAT_DELETED_EVENT;
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
          timer && hostWindow.clearTimeout(timer);
          resolve(value);
        };
        handler = name => {
          const deleted = String(name ?? "").replace(/\.jsonl$/i, "");
          deleted === fileName && finish(!0);
        };
        source.on(type, handler);
        timer = hostWindow.setTimeout(() => finish(!1), timeout);
      });
      return promise;
    }
    async function deleteRecentWithoutOpening(row) {
      const domFileName = (row.getAttribute("data-file") || "").replace(/\.jsonl$/i, "");
      const domAvatarId = row.getAttribute("data-avatar") || "";
      const groupId = row.getAttribute("data-group") || "";
      if (!domFileName || !domAvatarId && !groupId) throw new Error("近期对话缺少文件名或角色/群组标识。");
      const {main: main, groups: groups, popup: popup, errors: errors} = await loadDeleteModules();
      if (!await confirmRecentDelete(popup)) return;
      const record = await resolveRecentChatRecord(main, {
        fileName: domFileName,
        avatarId: domAvatarId,
        groupId: groupId
      });
      let fileName = domFileName;
      let avatarId = domAvatarId;
      if (record) {
        const serverFile = String(record.file_name ?? "").replace(/\.jsonl$/i, "");
        const serverAvatar = String(record.avatar ?? "");
        if (serverFile && serverFile !== domFileName) {
          console.warn(`[Claude-Clawd] 对话文件名和服务端对不上：DOM ${JSON.stringify(domFileName)}，服务端 ${JSON.stringify(serverFile)}。以服务端为准。`);
          fileName = serverFile;
        }
        if (serverAvatar && serverAvatar !== domAvatarId) {
          console.warn(`[Claude-Clawd] 头像文件名和服务端对不上：DOM ${JSON.stringify(domAvatarId)}，服务端 ${JSON.stringify(serverAvatar)}。以服务端为准。`);
          avatarId = serverAvatar;
        }
      } else console.warn(`[Claude-Clawd] 在 /api/chats/recent 里没认领到 ${JSON.stringify(domFileName)}，只能拿 DOM 上的值去删，可能删不掉。`);
      const eventKey = groupId ? "GROUP_CHAT_DELETED" : "CHAT_DELETED";
      const deleted = waitForChatDeleted(fileName, eventKey);
      if (groupId) typeof groups.deleteGroupChatByName === "function" ? await groups.deleteGroupChatByName(groupId, fileName) : await deleteGroupChatDirect(main, groups, groupId, fileName); else {
        const {index: characterId} = resolveCharacterIndex(main, avatarId);
        characterId >= 0 && typeof main.deleteCharacterChatByName === "function" ? await main.deleteCharacterChatByName(String(characterId), fileName) : await deleteCharacterChatDirect(main, avatarId, fileName);
      }
      if (deleted && !await deleted) {
        const stillThere = await recentChatStillExists(main, fileName);
        if (stillThere === !0) {
          const moduleError = errors?.[0]?.message ? ` 模块错误：${errors[0].message}` : "";
          throw new Error(`删除没有生效，对话文件仍然存在。${moduleError}`);
        }
        stillThere === null ? console.warn("[Claude-Clawd] 删除完成事件没来，且二次确认接口也查不了，按成功处理。") : console.info("[Claude-Clawd] 删除完成事件没来，但二次确认文件已消失，按成功处理。");
        await emitChatDeleted(eventKey, fileName).catch(() => {});
      }
      dropRecentRow(fileName);
      recentSignature = null;
      recentDataVersion += 1;
      hostWindow.toastr?.success?.(ccPrefersChinese() ? "对话已删除。" : "Chat deleted.");
    }
    function dropRecentRow(fileName) {
      if (!fileName) return;
      const bare = normalizeChatKey(fileName);
      const slot = hostDocument.querySelector("." + RAIL_RECENTS_CLASS);
      if (!slot) return;
      for (const row of slot.querySelectorAll("[data-file]")) normalizeChatKey(row.dataset.file) === bare && row.remove();
    }
    function currentPersona() {
      const context = getContext();
      const name = context?.name1 || "";
      const img = hostDocument.querySelector('#user_avatar_block .avatar.selected img, #user_avatar_block [class*="selected"] img') || hostDocument.querySelector('#chat .mes[is_user="true"] .avatar img');
      return {
        name: name,
        src: img?.src || ""
      };
    }
    function refreshRailUser() {
      if (!railEnabled) return;
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
      if (persona.src) {
        let img = face.querySelector("img");
        if (!img) {
          img = hostDocument.createElement("img");
          face.textContent = "";
          face.append(img);
        }
        img.src !== persona.src && (img.src = persona.src);
      } else {
        face.querySelector("img")?.remove();
        const initial = (persona.name || "U").trim().slice(0, 2);
        face.textContent !== initial && (face.textContent = initial);
      }
    }
    function currentCharacter() {
      const context = getContext();
      const characters = Array.isArray(context?.characters) ? context.characters : [];
      const index = Number(context?.characterId ?? context?.character_id);
      return Number.isInteger(index) && index >= 0 ? {
        character: characters[index],
        index: index
      } : null;
    }
    function rememberCharacterName(name) {
      const value = String(name || "").trim();
      if (!value) return;
      try {
        hostWindow.localStorage.setItem("clawd-last-character-name", value);
      } catch (error) {}
    }
    function rememberedCharacterName(characters) {
      try {
        const saved = hostWindow.localStorage.getItem("clawd-last-character-name") || "";
        if (saved) return saved;
      } catch (error) {}
      const recent = hostDocument.querySelector("." + RAIL_RECENTS_CLASS + " .recentChat[data-avatar]");
      const avatar = recent?.getAttribute("data-avatar") || "";
      const fromRecent = avatar && characters.find(character => character?.avatar === avatar)?.name;
      if (fromRecent) {
        rememberCharacterName(fromRecent);
        return String(fromRecent);
      }
      return "";
    }
    function closeCharacterMenu() {
      characterMenu?.remove();
      characterMenu = null;
      hostDocument.querySelectorAll(".clawd-character-switcher").forEach(button => button.setAttribute("aria-expanded", "false"));
    }
    function positionCharacterMenu(menu, button) {
      if (!menu?.isConnected || !button?.isConnected) return;
      const list = menu.querySelector(".clawd-character-list");
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
        const composerRect = hostDocument.querySelector("#form_sheld")?.getBoundingClientRect?.();
        composerRect?.top > top && (lowerBoundary = Math.min(lowerBoundary, composerRect.top - 10));
        menu.style.setProperty("right", "12px", "important");
        menu.style.setProperty("left", "12px", "important");
        menu.style.setProperty("width", "auto", "important");
      }
      const below = lowerBoundary - (rect.bottom + 8);
      const above = rect.top - 8 - (viewportTop + 12);
      if (!compactMobile && below < 240 && above > below) {
        const upHeight = Math.min(420, above);
        menu.style.setProperty("bottom", "auto", "important");
        menu.style.setProperty("max-height", `${upHeight}px`, "important");
        list.style.maxHeight = `${Math.max(48, Math.min(352, upHeight - 60))}px`;
        menu.style.setProperty("top", `${Math.max(viewportTop + 12, rect.top - 8 - menu.offsetHeight)}px`, "important");
        return;
      }
      const available = Math.max(96, lowerBoundary - top);
      const maxHeight = Math.min(420, available);
      menu.style.setProperty("top", `${top}px`, "important");
      menu.style.setProperty("bottom", "auto", "important");
      menu.style.setProperty("max-height", `${maxHeight}px`, "important");
      list.style.maxHeight = `${Math.max(48, Math.min(352, maxHeight - 60))}px`;
    }
    function characterAvatarUrl(character) {
      const avatar = character?.avatar;
      if (!avatar) return "";
      try {
        const fromContext = getContext()?.getThumbnailUrl?.("avatar", avatar);
        if (fromContext) return String(fromContext);
      } catch (error) {}
      return new hostWindow.URL(`characters/${encodeURIComponent(avatar)}`, hostDocument.baseURI).href;
    }
    async function selectCharacter(index) {
      const picked = getContext()?.characters?.[index];
      rememberCharacterName(picked?.name);
      closeCharacterMenu();
      clearDrawerGuard();
      if (!hostDocument.body.classList.contains(WELCOME_CLASS)) {
        try {
          const context = getContext();
          const select = typeof context?.selectCharacterById === "function" ? context.selectCharacterById : (await loadDeleteModules()).main?.selectCharacterById;
          if (typeof select !== "function") throw new Error("当前酒馆版本没有提供角色切换接口。");
          await select(String(index), {
            switchMenu: !1
          });
          scheduleRefresh();
        } catch (error) {
          console.error("[Claude Clawd] 角色切换失败:", error);
          hostWindow.toastr?.error?.(ccPrefersChinese() ? `角色切换失败：${String(error?.message || error).slice(0, 160)}` : `Character switch failed: ${String(error?.message || error).slice(0, 160)}`);
        }
        return;
      }
      const previousPending = pendingWelcomeCharacter;
      pendingWelcomeCharacter = {
        index: index,
        name: String(picked?.name || "")
      };
      welcomeStage = "welcome";
      hostDocument.body.classList.add(WELCOME_CLASS);
      try {
        const context = getContext();
        if (typeof context?.selectCharacterById === "function") await context.selectCharacterById(String(index), {
          switchMenu: !1
        }); else {
          const {main: main} = await loadDeleteModules();
          if (typeof main?.selectCharacterById !== "function") throw new Error("当前酒馆版本没有提供角色切换接口。");
          await main.selectCharacterById(String(index), {
            switchMenu: !1
          });
        }
        welcomeStage = "welcome";
        hostDocument.body.classList.add(WELCOME_CLASS);
        scheduleRefresh();
      } catch (error) {
        pendingWelcomeCharacter = previousPending;
        welcomeStage = "welcome";
        scheduleRefresh();
        console.error("[Claude Clawd] 角色切换失败:", error);
        hostWindow.toastr?.error?.(ccPrefersChinese() ? `角色切换失败：${String(error?.message || error).slice(0, 160)}` : `Character switch failed: ${String(error?.message || error).slice(0, 160)}`);
      }
    }
    function openCharacterMenu(button) {
      if (characterMenu?.isConnected) {
        closeCharacterMenu();
        return;
      }
      const characters = Array.isArray(getContext()?.characters) ? getContext().characters : [];
      if (!characters.length) {
        hostWindow.toastr?.info?.(ccPrefersChinese() ? "还没有可切换的角色卡。" : "No character cards available.");
        return;
      }
      const menu = hostDocument.createElement("div");
      menu.className = "clawd-character-menu";
      menu.setAttribute("role", "dialog");
      menu.setAttribute("aria-label", ccPrefersChinese() ? "快速切换角色卡" : "Quick character switcher");
      const search = hostDocument.createElement("input");
      search.type = "search";
      search.className = "clawd-character-search";
      search.placeholder = ccPrefersChinese() ? "搜索角色卡" : "Search characters";
      const head = hostDocument.createElement("div");
      head.className = "clawd-character-head";
      head.textContent = ccPrefersChinese() ? "快速切换角色卡" : "Quick switch";
      menu.append(head, search);
      const list = hostDocument.createElement("div");
      list.className = "clawd-character-list";
      menu.append(list);
      const active = currentCharacter()?.index;
      const render = () => {
        const query = search.value.trim().toLocaleLowerCase();
        list.replaceChildren();
        characters.forEach((character, index) => {
          const name = String(character?.name || (ccPrefersChinese() ? `角色 ${index + 1}` : `Character ${index + 1}`));
          if (query && !name.toLocaleLowerCase().includes(query)) return;
          const item = hostDocument.createElement("button");
          item.type = "button";
          item.className = "clawd-character-option";
          item.classList.toggle("is-active", index === active);
          item.dataset.characterId = String(index);
          const avatar = hostDocument.createElement("span");
          avatar.className = "clawd-character-avatar";
          const src = characterAvatarUrl(character);
          if (src) {
            const image = hostDocument.createElement("img");
            image.src = src;
            image.alt = "";
            avatar.append(image);
          } else avatar.textContent = name.slice(0, 1);
          const label = hostDocument.createElement("span");
          label.className = "clawd-character-name";
          label.textContent = name;
          const last = Number(character?.date_last_chat) || 0;
          if (last) {
            const sub = hostDocument.createElement("small");
            sub.className = "clawd-character-sub";
            const d = new Date(last);
            sub.textContent = ccPrefersChinese() ? `上次聊天 ${d.getMonth() + 1}月${d.getDate()}日` : `Last chat ${d.toLocaleDateString()}`;
            label.append(sub);
          }
          item.append(avatar, label);
          if (index === active) {
            const check = hostDocument.createElement("span");
            check.className = "clawd-character-check";
            check.textContent = "✓";
            item.append(check);
          }
          item.addEventListener("click", () => void selectCharacter(index));
          list.append(item);
        });
        if (!list.children.length) {
          const empty = hostDocument.createElement("div");
          empty.className = "clawd-character-empty";
          empty.textContent = ccPrefersChinese() ? "没有匹配的角色卡" : "No matching characters";
          list.append(empty);
        }
      };
      search.addEventListener("input", render);
      render();
      hostDocument.body.append(menu);
      characterMenu = menu;
      button.setAttribute("aria-expanded", "true");
      positionCharacterMenu(menu, button);
      hostWindow.requestAnimationFrame(() => search.focus({
        preventScroll: !0
      }));
    }
    function refreshCharacterSwitcher() {
      if (!welcomeEnabled) return;
      const form = hostDocument.querySelector("#send_form") || hostDocument.querySelector("#form_sheld form");
      if (!form) return;
      const row = form.querySelector("#nonQRFormItems") || form;
      const stale = [ ...hostDocument.querySelectorAll(".clawd-character-switcher") ].filter(button => button.parentElement !== row);
      stale.forEach(button => button.remove());
      const staleMics = [ ...hostDocument.querySelectorAll(".clawd-fake-mic") ].filter(mic => mic.parentElement !== row);
      staleMics.forEach(mic => mic.remove());
      let button = row.querySelector(":scope > .clawd-character-switcher");
      const showSwitcher = !mobileEnabled;
      if (!showSwitcher) {
        closeCharacterMenu();
        button?.remove();
        button = null;
      }
      if (showSwitcher && button && !button.querySelector(".clawd-character-effort")) {
        button.remove();
        button = null;
      }
      if (showSwitcher && !button) {
        button = hostDocument.createElement("button");
        button.type = "button";
        button.className = "clawd-character-switcher";
        button.setAttribute("aria-haspopup", "dialog");
        button.setAttribute("aria-expanded", "false");
        button.innerHTML = '<span class="clawd-character-current"></span><span class="clawd-character-effort">High</span><span class="clawd-character-chevron" aria-hidden="true"></span>';
        let openedByPointer = !1;
        let pointerResetTimer = 0;
        button.addEventListener("pointerdown", event => {
          if (event.button !== 0 || event.isPrimary === !1) return;
          event.preventDefault();
          event.stopPropagation();
          openedByPointer = !0;
          pointerResetTimer && hostWindow.clearTimeout(pointerResetTimer);
          pointerResetTimer = hostWindow.setTimeout(() => {
            openedByPointer = !1;
          }, 800);
          openCharacterMenu(button);
        });
        button.addEventListener("click", event => {
          event.preventDefault();
          event.stopPropagation();
          if (openedByPointer) {
            openedByPointer = !1;
            pointerResetTimer && hostWindow.clearTimeout(pointerResetTimer);
            pointerResetTimer = 0;
            return;
          }
          openCharacterMenu(button);
        });
        const right = row.querySelector(":scope > #rightSendForm");
        right ? row.insertBefore(button, right) : row.append(button);
      }
      let mic = row.querySelector(":scope > .clawd-fake-mic");
      if (mobileEnabled) {
        mic?.remove();
        mic = null;
      } else if (!mic) {
        mic = hostDocument.createElement("button");
        mic.type = "button";
        mic.className = "clawd-fake-mic";
        mic.setAttribute("aria-label", ccPrefersChinese() ? "麦克风（装饰）" : "Microphone (visual only)");
        mic.title = ccPrefersChinese() ? "麦克风（界面装饰）" : "Microphone (visual only)";
        const right = row.querySelector(":scope > #rightSendForm");
        right ? row.insertBefore(mic, right) : row.append(mic);
      }
      if (!button) return;
      const characters = Array.isArray(getContext()?.characters) ? getContext().characters : [];
      const active = currentCharacter()?.character;
      active?.name && rememberCharacterName(active.name);
      const name = String(active?.name || rememberedCharacterName(characters) || (ccPrefersChinese() ? "角色卡" : "Character"));
      const label = button.querySelector(".clawd-character-current");
      label && label.textContent !== name && (label.textContent = name);
      button.title = ccPrefersChinese() ? `快速切换角色卡：${name}` : `Quick switch character: ${name}`;
      characterMenu?.isConnected && positionCharacterMenu(characterMenu, button);
    }
    function dismissCharacterMenu(event) {
      if (!characterMenu) return;
      if (event.type === "keydown") {
        event.key === "Escape" && closeCharacterMenu();
        return;
      }
      if (event.target?.closest?.(".clawd-character-menu, .clawd-character-switcher")) return;
      closeCharacterMenu();
    }
    function closeMobileMenu() {
      setMobileMenuOpen(!1);
      mobileChrome?.menu?.setAttribute("aria-expanded", "false");
    }
    function showPanelFromRail(panel) {
      const token = mobileMenuCloseToken;
      let raf = 0, shownFrames = 0, frames = 0;
      const cleanup = () => {
        raf && hostWindow.cancelAnimationFrame(raf);
        raf = 0;
        mobileNavPanelCleanup === cleanup && (mobileNavPanelCleanup = null);
      };
      const wait = () => {
        raf = 0;
        if (destroyed || token !== mobileMenuCloseToken || !isMobileMenuOpen()) {
          cleanup();
          return;
        }
        const shell = hostDocument.querySelector(".cw-v4-shell");
        const shown = panel.classList.contains("openDrawer") && shell && !shell.hidden && shell.dataset.panel === panel.id;
        if (shown && shownFrames++ >= 1 || ++frames > 300) {
          cleanup();
          closeMobileMenu();
          return;
        }
        raf = hostWindow.requestAnimationFrame(wait);
      };
      mobileNavPanelCleanup?.();
      mobileNavPanelCleanup = cleanup;
      mobileNavActivating = !0;
      try {
        hostWindow.__claudeOfficialLayout?.activate(panel.id);
      } finally {
        mobileNavActivating = !1;
      }
      raf = hostWindow.requestAnimationFrame(wait);
    }
    async function startMobileNewChat() {
      closeMobileMenu();
      const native = hostDocument.querySelector('#option_start_new_chat, #new_chat, #newChat, [data-i18n="New Chat"], [data-i18n="Start new chat"]');
      if (native instanceof hostWindow.HTMLElement) {
        native.click();
        return;
      }
      const context = getContext();
      try {
        if (typeof context?.executeSlashCommands === "function") {
          await context.executeSlashCommands("/newchat");
          return;
        }
        const active = currentCharacter()?.index;
        active !== void 0 && await selectCharacter(active);
      } catch (error) {
        console.error("[Claude Clawd] 新建对话失败:", error);
        hostWindow.toastr?.error?.(ccPrefersChinese() ? "无法新建对话。" : "Could not start a new chat.");
      }
    }
    function refreshMobileNewChat() {
      if (!mobileEnabled || !welcomeEnabled) return;
      const holder = hostDocument.querySelector("#top-settings-holder");
      if (!holder || holder.querySelector(":scope > .clawd-mobile-new-chat")) return;
      const button = hostDocument.createElement("button");
      button.type = "button";
      button.className = "clawd-mobile-new-chat";
      button.textContent = ccPrefersChinese() ? "+ 新对话" : "+ New chat";
      button.addEventListener("click", () => void startMobileNewChat());
      holder.append(button);
    }
    let mobileMenuOpenWait = null;
    function cancelMobileMenuOpenWait() {
      mobileMenuOpenWait?.();
      mobileMenuOpenWait = null;
    }
    function openMobileMenuAfterKeyboard() {
      cancelMobileMenuOpenWait();
      if (!mobileViewportStillShrunk()) {
        setMobileMenuOpen(!0);
        return;
      }
      const active = hostDocument.activeElement;
      isSoftKeyboardTarget(active) && active.blur();
      let settled = !1;
      let timer = 0;
      const viewport = hostWindow.visualViewport;
      const cleanup = () => {
        settled = !0;
        hostWindow.clearTimeout(timer);
        hostWindow.removeEventListener("resize", onResize);
        viewport?.removeEventListener("resize", onResize);
      };
      const open = () => {
        if (settled) return;
        cleanup();
        mobileMenuOpenWait = null;
        destroyed || isMobileMenuOpen() || setMobileMenuOpen(!0);
      };
      function onResize() {
        mobileViewportStillShrunk() || open();
      }
      hostWindow.addEventListener("resize", onResize);
      viewport?.addEventListener("resize", onResize);
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
      const root = hostDocument.createElement("div");
      root.className = "clawd-mobile-chrome";
      const menu = hostDocument.createElement("button");
      menu.type = "button";
      menu.className = "clawd-mobile-menu-button";
      menu.setAttribute("aria-label", ccPrefersChinese() ? "打开导航" : "Open navigation");
      menu.setAttribute("aria-expanded", "false");
      menu.innerHTML = "<span></span><span></span><span></span>";
      menu.addEventListener("click", () => {
        const open = !isMobileMenuOpen();
        menu.setAttribute("aria-expanded", String(open));
        open ? openMobileMenuAfterKeyboard() : setMobileMenuOpen(!1);
      });
      const scrim = hostDocument.createElement("button");
      scrim.type = "button";
      scrim.className = "clawd-mobile-scrim";
      scrim.setAttribute("aria-label", ccPrefersChinese() ? "关闭导航" : "Close navigation");
      scrim.addEventListener("click", closeMobileMenu);
      const keepDrawers = event => event.stopPropagation();
      scrim.addEventListener("touchstart", keepDrawers, {
        passive: !0
      });
      scrim.addEventListener("mousedown", keepDrawers);
      root.append(menu, scrim);
      hostDocument.body.append(root);
      mobileChrome = {
        root: root,
        menu: menu,
        scrim: scrim
      };
      const holder = hostDocument.querySelector("#top-settings-holder");
      if (holder) {
        mobileNavHolder = holder;
        mobileNavPrepareHandler = event => {
          if (!isMobileMenuOpen() || event.button > 0) return;
          const toggle = event.target?.closest?.(".drawer-toggle");
          if (!toggle || isTauriTavernHost() || !hostDocument.documentElement.hasAttribute("data-cw-v4")) return;
          event.stopPropagation();
        };
        holder.addEventListener("touchstart", mobileNavPrepareHandler, {
          capture: !0,
          passive: !0
        });
        holder.addEventListener("mousedown", mobileNavPrepareHandler, !0);
        mobileNavCloseHandler = event => {
          const target = event.target instanceof hostWindow.Element ? event.target : null;
          if (mobileNavActivating || !target || target.closest(".deleteChat, .deleteChatButton, .chatActions")) return;
          if (Date.now() < recentLongPressUntil) return;
          const drawerToggle = target.closest(".drawer-toggle");
          if (drawerToggle && isTauriTavernHost()) return;
          if (!drawerToggle && !target.closest(".recentChat, .clawd-mobile-new-chat, .character_select")) return;
          const panel = drawerToggle?.parentElement?.querySelector(":scope > .drawer-content");
          if (panel && hostDocument.documentElement.hasAttribute("data-cw-v4")) {
            if (!event.isTrusted && panel.classList.contains("openDrawer")) return;
            if (event.isTrusted && isMobileMenuOpen()) {
              event.stopImmediatePropagation();
              panel.classList.contains("openDrawer") ? closeMobileMenu() : showPanelFromRail(panel);
              return;
            }
          }
          closeMobileMenu();
        };
        holder.addEventListener("click", mobileNavCloseHandler, !0);
      }
    }
    function applyMobileComposerInset() {
      composerInsetRaf = 0;
      const root = hostDocument.documentElement;
      if (!isMobileLayout()) {
        lastComposerHeight = 0;
        root.style.removeProperty("--cl-mobile-composer-height");
        return;
      }
      const shell = observedComposerShell?.isConnected ? observedComposerShell : hostDocument.querySelector("#form_sheld");
      const height = Math.ceil(shell?.getBoundingClientRect?.().height || 0);
      if (!height || height === lastComposerHeight) return;
      const chat = scrollHost?.isConnected ? scrollHost : hostDocument.querySelector("#chat");
      const bottomDistance = chat ? Math.max(0, chat.scrollHeight - chat.clientHeight - chat.scrollTop) : Number.POSITIVE_INFINITY;
      const recentlyScrolledManually = Date.now() - lastManualScrollAt < 500;
      const keepAtBottom = bottomDistance <= 72 && !recentlyScrolledManually && !hostDocument.body.classList.contains("clawd-welcome") && Boolean(chat?.querySelector(":scope > .mes"));
      lastComposerHeight = height;
      const value = `${height}px`;
      root.style.getPropertyValue("--cl-mobile-composer-height") !== value && root.style.setProperty("--cl-mobile-composer-height", value);
      if (keepAtBottom && chat) {
        composerBottomRaf && hostWindow.cancelAnimationFrame(composerBottomRaf);
        composerBottomRaf = hostWindow.requestAnimationFrame(() => {
          composerBottomRaf = 0;
          if (destroyed || !chat.isConnected || hostDocument.body.classList.contains("clawd-welcome") || !chat.querySelector(":scope > .mes")) return;
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
        observedComposerShell?.style.removeProperty("--cl-mobile-composer-translate-y");
        observedComposerShell = null;
        lastComposerHeight = 0;
        hostDocument.documentElement.style.removeProperty("--cl-mobile-composer-height");
        return;
      }
      const shell = hostDocument.querySelector("#form_sheld");
      if (!shell) return;
      if (shell !== observedComposerShell) {
        composerResizeObserver?.disconnect();
        observedComposerShell?.style.removeProperty("--cl-mobile-composer-translate-y");
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
    const RAIL_MIN = 190;
    const RAIL_MAX = 420;
    const RAIL_KEY = "clawd-rail-width";
    let gripEl = null;
    function applyRailWidth(px) {
      const clamped = Math.min(Math.max(px, RAIL_MIN), RAIL_MAX);
      hostDocument.documentElement.style.setProperty("--cl-rail", clamped + "px");
      hostDocument.body.style.setProperty("--cl-rail", clamped + "px");
      return clamped;
    }
    function refreshRailGrip() {
      if (!railEnabled || gripEl?.isConnected) return;
      gripEl = hostDocument.createElement("div");
      gripEl.className = "clawd-rail-grip";
      hostDocument.body.append(gripEl);
      let dragging = !1;
      const move = event => {
        if (!dragging) return;
        applyRailWidth(event.clientX);
      };
      const up = () => {
        if (!dragging) return;
        dragging = !1;
        hostDocument.body.classList.remove("clawd-rail-resizing");
        const now = hostDocument.documentElement.style.getPropertyValue("--cl-rail");
        try {
          hostWindow.localStorage.setItem(RAIL_KEY, now);
        } catch (error) {}
        hostDocument.removeEventListener("mousemove", move);
        hostDocument.removeEventListener("mouseup", up);
      };
      gripEl.addEventListener("mousedown", event => {
        event.preventDefault();
        dragging = !0;
        hostDocument.body.classList.add("clawd-rail-resizing");
        hostDocument.addEventListener("mousemove", move);
        hostDocument.addEventListener("mouseup", up);
      });
      try {
        const saved = hostWindow.localStorage.getItem(RAIL_KEY);
        if (saved) {
          const parsed = parseInt(saved, 10) || RAIL_MIN;
          applyRailWidth(parsed === 288 ? 280 : parsed);
        }
      } catch (error) {}
    }
    function refreshWelcomeShortcuts() {
      if (!welcomeEnabled) return;
      const form = hostDocument.querySelector("#form_sheld");
      if (!form || !form.parentElement) return;
      const wraps = [ ...hostDocument.querySelectorAll(".clawd-welcome-shortcuts") ];
      if (!hostDocument.body.classList.contains(WELCOME_CLASS)) {
        for (const w of wraps) w.remove();
        return;
      }
      const anchor = hostDocument.querySelector("#chat > .mes.claude-welcome-prompt") || hostDocument.querySelector('#chat > .mes[type="welcome_prompt"]') || form;
      if (wraps.length === 1 && wraps[0].previousElementSibling === anchor && wraps[0].querySelector("button, .menu_button")) return;
      const buttons = [ ...hostDocument.querySelectorAll("#chat, .clawd-welcome-shortcuts") ].flatMap(pool => [ ...pool.querySelectorAll("button, .menu_button, a.menu_button") ]).filter(b => /API|Character|Extension|角色|扩展|连接/i.test(b.textContent || ""));
      if (buttons.length < 2) return;
      const holder = buttons[0].parentElement;
      if (!holder || holder.children.length > 6) return;
      for (const w of wraps) w.remove();
      const wrap = hostDocument.createElement("div");
      wrap.className = "clawd-welcome-shortcuts";
      anchor.parentElement.insertBefore(wrap, anchor.nextSibling);
      wrap.append(holder);
    }
    function refreshRailLabels() {
      const holder = hostDocument.querySelector("#top-settings-holder");
      if (!holder) return;
      holder.querySelectorAll(":scope > .drawer > .drawer-toggle").forEach(toggle => {
        const icon = toggle.querySelector(".drawer-icon") ?? toggle;
        if (toggle.querySelector(":scope > .clawd-rail-label")) return;
        const raw = (icon.getAttribute("title") || toggle.getAttribute("title") || "").trim();
        if (!raw) return;
        const short = {
          "fa-sliders": "预设",
          "fa-sliders-h": "预设",
          "fa-plug": "API",
          "fa-font": "格式化",
          "fa-globe": "世界书",
          "fa-book-atlas": "世界书",
          "fa-user-cog": "偏好设置",
          "fa-user-gear": "偏好设置",
          "fa-panorama": "背景",
          "fa-image": "背景",
          "fa-images": "背景",
          "fa-cubes": "扩展",
          "fa-face-smile": "玩家角色",
          "fa-user-tie": "玩家角色",
          "fa-address-card": "角色卡",
          "fa-users": "角色卡"
        };
        const hit = [ ...icon.classList ].find(c => short[c]);
        const text = hit ? short[hit] : raw;
        for (const node of [ icon, toggle ]) {
          const own = node.getAttribute("title");
          if (own) {
            node.setAttribute("data-tip", own);
            node.removeAttribute("title");
          }
        }
        const label = hostDocument.createElement("span");
        label.className = "clawd-rail-label";
        label.textContent = text;
        toggle.append(label);
      });
    }
    let lookRaf = 0;
    let lookX = 0;
    let lookY = 0;
    function applyLook() {
      lookRaf = 0;
      if (hostDocument.documentElement.hasAttribute("data-cw-v4-settings")) return;
      hostDocument.querySelectorAll("button." + BUTTON_CLASS).forEach(button => {
        if (clawdTracks.B === "sleep") return;
        const box = button.getBoundingClientRect();
        if (!box.width) return;
        const dx = lookX - (box.left + box.width / 2);
        const dy = lookY - (box.top + box.height / 2);
        const horizontal = Math.abs(dx) >= Math.abs(dy);
        const had = button.dataset.look || "";
        const reach = Math.max(Math.abs(dx), Math.abs(dy));
        let next = "";
        reach > (had ? 45 : 70) && (next = horizontal ? dx < 0 ? "l" : "r" : dy < 0 ? "u" : "d");
        if (next === had) return;
        button.dataset.look = next;
        delete button.dataset.clawdAmbientLook;
        for (const dir of [ "l", "r", "u", "d" ]) button.classList.toggle("clawd-look-" + dir, next === dir);
      });
    }
    let lastMouseMoveAt = Date.now();
    function handleLook(event) {
      if (!clawdEnabled()) return;
      if (event.buttons) return;
      lookX = event.clientX;
      lookY = event.clientY;
      lastMouseMoveAt = Date.now();
      if (lookRaf) return;
      lookRaf = requestClawdFrame(applyLook);
    }
    function syncCcComposerState(focusedOverride) {
      syncClawdBState();
    }
    const handleComposerInput = event => {
      if (event.target?.id !== "send_textarea") return;
      clawdComposerReaction.handle(event);
      noteActivity();
      syncCcComposerState();
    };
    let mobileChatAutofocusTarget = null;
    function releaseMobileChatAutofocus() {
      mobileChatAutofocusTarget && (mobileChatAutofocusTarget.readOnly = !1);
      mobileChatAutofocusTarget = null;
    }
    function guardMobileChatAutofocus() {
      if (destroyed || !isMobileLayout()) return;
      const input = hostDocument.getElementById("send_textarea");
      if (!input || input === hostDocument.activeElement || input.readOnly) return;
      releaseMobileChatAutofocus();
      mobileChatAutofocusTarget = input;
      input.readOnly = !0;
    }
    const handleComposerFocusGesture = event => {
      if (!event.isTrusted || !isMobileLayout()) return;
      event.target?.closest?.("#send_textarea") && releaseMobileChatAutofocus();
    };
    const handleFocusIn = event => {
      if (event.target === mobileChatAutofocusTarget) {
        event.target.blur();
        return;
      }
      if (isMobileLayout() && isSoftKeyboardTarget(event.target)) {
        virtualKeyboardOverlayActive || ensureAndroidKeyboardPanAnchor(!0);
        const root = hostDocument.documentElement;
        const current = parseFloat(root.style.getPropertyValue("--cl-mobile-popup-height")) || 0;
        const height = Math.max(1, current, Math.round(hostWindow.innerHeight || hostDocument.documentElement.clientHeight || 1), Math.round(hostWindow.visualViewport?.height || 0));
        root.style.setProperty("--cl-mobile-popup-height", `${height}px`);
        scheduleMobileViewportSettle();
      }
      if (event.target?.id !== "send_textarea") return;
      noteActivity();
      if (isMobileLayout()) {
        mobileStableLayoutHeight = Math.max(mobileStableLayoutHeight, Math.round(hostWindow.innerHeight || hostDocument.documentElement.clientHeight || 1));
        mobileKeyboardRecoveryActive = !1;
      }
      scheduleMobileViewportSettle();
      startMobileKeyboardPoll();
      syncCcComposerState();
    };
    const handleFocusOut = event => {
      if (event.target === mobileChatAutofocusTarget) return;
      isMobileLayout() && isSoftKeyboardTarget(event.target) && scheduleMobileViewportSettle();
      if (event.target?.id !== "send_textarea") return;
      scheduleMobileViewportSettle();
      syncCcComposerState();
      if (isMobileLayout()) {
        mobileKeyboardRecoveryActive = !virtualKeyboardOverlayActive && !keyboardBaselineMode;
        stopMobileKeyboardPoll();
        resetMobileComposerTranslate();
        return;
      }
    };
    function refreshCodeBars() {
      hostDocument.querySelectorAll("#chat .mes_text pre").forEach(pre => {
        if (pre.querySelector(":scope > .clawd-code-bar")) return;
        const code = pre.querySelector("code");
        const match = code?.className.match(/language-([\w+-]+)/);
        const bar = hostDocument.createElement("div");
        bar.className = "clawd-code-bar";
        const label = hostDocument.createElement("span");
        label.textContent = match ? match[1] : "text";
        const copy = hostDocument.createElement("button");
        copy.type = "button";
        copy.className = "clawd-code-copy";
        copy.textContent = "copy";
        copy.addEventListener("click", event => {
          event.preventDefault();
          event.stopPropagation();
          const text = code?.textContent ?? pre.textContent ?? "";
          hostWindow.navigator.clipboard?.writeText(text).then(() => {
            copy.textContent = "copied";
            hostWindow.setTimeout(() => {
              copy.textContent = "copy";
            }, 1400);
          }, () => {
            copy.textContent = "failed";
            hostWindow.setTimeout(() => {
              copy.textContent = "copy";
            }, 1400);
          });
        });
        bar.append(label, copy);
        pre.prepend(bar);
      });
    }
    function ccPickPhrase() {
      const hour = (new Date).getHours();
      const bucket = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
      const pick = list => list[Math.floor(Math.random() * list.length)];
      const deep = hour < 5;
      return {
        en: deep ? "thinking… (ultrathink)" : pick(CC_VERBS_EN[bucket]) + "…",
        cn: deep ? "思考… (ultrathink)" : pick(CC_VERBS_CN[bucket]) + "…"
      };
    }
    function ccPrefersChinese() {
      const lang = hostDocument.documentElement.getAttribute("lang") || hostWindow.navigator.language || "";
      return /^zh/i.test(lang);
    }
    function refreshComposerPhrase(active) {
      const box = hostDocument.querySelector("#send_textarea");
      if (!box) return;
      if (active) {
        if (box.dataset.ccPh === void 0) {
          box.dataset.ccPh = box.getAttribute("placeholder") ?? "";
          const phrase = ccPickPhrase();
          box.setAttribute("placeholder", ccPrefersChinese() ? "Clawd 正在" + phrase.cn : "Clawd is " + phrase.en);
        }
        return;
      }
      if (box.dataset.ccPh !== void 0) {
        box.setAttribute("placeholder", box.dataset.ccPh);
        delete box.dataset.ccPh;
      }
    }
    async function runSwipeProxy(message, direction, event) {
      const isLeft = direction === "left";
      const selector = isLeft ? ":scope > .swipe_left" : ":scope > .swipeRightBlock .swipe_right";
      const fallbackToNativeControl = () => {
        const nativeControl = message.querySelector(selector);
        if (!(nativeControl instanceof hostWindow.HTMLElement)) return !1;
        nativeControl.dispatchEvent(new hostWindow.MouseEvent("click", {
          bubbles: !0,
          cancelable: !0,
          view: hostWindow
        }));
        return !0;
      };
      const context = getContext();
      const id = Number(message.getAttribute("mesid"));
      const data = Number.isInteger(id) && id >= 0 ? context?.chat?.[id] : null;
      const swipeApi = context?.swipe;
      const swipes = Array.isArray(data?.swipes) ? data.swipes : [];
      if (!data || data.is_user || id !== context.chat.length - 1 || swipes.length === 0) return !1;
      if (isLeft && swipes.length <= 1) return !1;
      if (isTypingActive()) return !1;
      if (typeof swipeApi?.state === "function" && swipeApi.state() !== "none") return !1;
      const currentSwipeId = Math.min(swipes.length - 1, Math.max(0, Number.isFinite(Number(data.swipe_id)) ? Number(data.swipe_id) : 0));
      const regenerateOnRightEdge = !isLeft && currentSwipeId === swipes.length - 1;
      const targetSwipeId = regenerateOnRightEdge ? currentSwipeId + 1 : (currentSwipeId + (isLeft ? -1 : 1) + swipes.length) % swipes.length;
      const startSeqBefore = generationStartSeq;
      const generationRan = () => generationStartSeq !== startSeqBefore;
      try {
        if (typeof swipeApi?.to === "function") {
          const options = {
            source: "swipe_picker",
            message: data,
            forceMesId: id,
            forceDuration: 0
          };
          regenerateOnRightEdge || (options.forceSwipeId = targetSwipeId);
          await swipeApi.to.call(swipeApi, event, direction, options);
        } else {
          if (typeof swipeApi?.[direction] !== "function") return fallbackToNativeControl();
          await swipeApi[direction].call(swipeApi, event, {
            source: "swipe_picker",
            message: data
          });
        }
        const updated = getContext()?.chat?.[id];
        const swipeChanged = regenerateOnRightEdge ? Number(updated?.swipe_id ?? 0) !== currentSwipeId || Array.isArray(updated?.swipes) && updated.swipes.length > swipes.length : Number(updated?.swipe_id ?? 0) === targetSwipeId;
        if (swipeChanged || generationRan()) return !0;
        console.warn("[Claude Clawd] Swipe API returned without changing swipe_id; falling back to the native control.");
        return fallbackToNativeControl();
      } catch (error) {
        if (generationRan()) return !0;
        console.warn("[Claude Clawd] Swipe API failed; falling back to the native control.", error);
        return fallbackToNativeControl();
      }
    }
    function createSwipeProxy(message, direction) {
      const button = hostDocument.createElement("button");
      button.type = "button";
      const isLeft = direction === "left";
      button.className = isLeft ? LEFT_SWIPE_PROXY_CLASS : SWIPE_PROXY_CLASS;
      button.setAttribute("aria-label", isLeft ? "上一条回复" : "下一条回复");
      button.title = isLeft ? "上一条回复" : "下一条回复（到末端重新生成）";
      button.style.touchAction = "pan-y";
      let pointerStart = null;
      let dragged = !1;
      button.addEventListener("pointerdown", event => {
        pointerStart = {
          x: event.clientX,
          y: event.clientY
        };
        dragged = !1;
      });
      button.addEventListener("pointermove", event => {
        if (!pointerStart) return;
        (Math.abs(event.clientX - pointerStart.x) > 8 || Math.abs(event.clientY - pointerStart.y) > 8) && (dragged = !0);
      });
      button.addEventListener("pointercancel", () => {
        pointerStart = null;
        dragged = !0;
      });
      button.addEventListener("click", async event => {
        event.preventDefault();
        event.stopPropagation();
        const blockedByScroll = isMobileLayout() && (dragged || Date.now() - lastManualScrollAt < 350);
        pointerStart = null;
        dragged = !1;
        if (blockedByScroll) return;
        if (button.getAttribute("aria-busy") === "true") return;
        button.setAttribute("aria-busy", "true");
        try {
          await runSwipeProxy(message, direction, event);
        } finally {
          button.removeAttribute("aria-busy");
          scheduleRefresh();
        }
      });
      return button;
    }
    function createRerollButton() {
      const button = hostDocument.createElement("button");
      button.type = "button";
      button.className = REROLL_CLASS;
      button.setAttribute("aria-label", "重新生成回复");
      button.title = "重新生成 / 重 Roll";
      button.addEventListener("click", async event => {
        event.preventDefault();
        event.stopPropagation();
        const message = button.closest("#chat > .mes");
        if (!(message instanceof hostWindow.HTMLElement)) {
          hostWindow.toastr?.warning("当前酒馆没有可用的原生重新生成入口。", "重 Roll 不可用");
          return;
        }
        button.setAttribute("aria-busy", "true");
        try {
          await runSwipeProxy(message, "right", event);
        } finally {
          button.removeAttribute("aria-busy");
          scheduleRefresh();
        }
      });
      return button;
    }
    function refreshSwipeProxies(messages, typingActive) {
      const liveMessages = new Set(messages);
      hostDocument.querySelectorAll(`.${LEFT_SWIPE_PROXY_CLASS}, .${SWIPE_PROXY_CLASS}`).forEach(button => {
        liveMessages.has(button.parentElement) || button.remove();
      });
      for (const message of [ ...observedSwipeMessages ]) {
        if (liveMessages.has(message) && message.isConnected) continue;
        swipeObserver?.unobserve(message);
        observedSwipeMessages.delete(message);
        visibleSwipeMessages.delete(message);
      }
      if (typingActive) return;
      messages.forEach(message => {
        const leftSource = message.querySelector(":scope > .swipe_left");
        const rightSource = message.querySelector(":scope > .swipeRightBlock .swipe_right");
        const leftProxy = message.querySelector(`:scope > .${LEFT_SWIPE_PROXY_CLASS}`);
        const rightProxy = message.querySelector(`:scope > .${SWIPE_PROXY_CLASS}`);
        const swipeable = prepareSwipeProxyMessage(message);
        const alwaysShow = isMobileLayout();
        if (!leftSource && !rightSource && !alwaysShow || !swipeable) {
          leftProxy?.remove();
          rightProxy?.remove();
          swipeObserver?.unobserve(message);
          observedSwipeMessages.delete(message);
          visibleSwipeMessages.delete(message);
          message.classList.remove(SWIPE_VIEW_CLASS);
          return;
        }
        const nextLeftProxy = leftProxy || createSwipeProxy(message, "left");
        const nextRightProxy = rightProxy || createSwipeProxy(message, "right");
        leftProxy || message.append(nextLeftProxy);
        rightProxy || message.append(nextRightProxy);
        const data = getMessageData(message);
        const swipeCount = Array.isArray(data?.swipes) ? data.swipes.length : 0;
        const hasAlternatives = swipeCount > 1 || !swipeCount && Boolean(leftSource || rightSource);
        const canRegenerate = swipeCount > 0 || Boolean(rightSource);
        const swipeApi = getContext()?.swipe;
        const hasGenericSwipeApi = typeof swipeApi?.to === "function";
        nextLeftProxy.disabled = !hasAlternatives || !leftSource && !hasGenericSwipeApi && typeof swipeApi?.left !== "function";
        nextRightProxy.disabled = !canRegenerate || !rightSource && !hasGenericSwipeApi && typeof swipeApi?.right !== "function";
        nextLeftProxy.setAttribute("aria-disabled", String(nextLeftProxy.disabled));
        nextRightProxy.setAttribute("aria-disabled", String(nextRightProxy.disabled));
        if (!observedSwipeMessages.has(message)) {
          observedSwipeMessages.add(message);
          if (swipeObserver) swipeObserver.observe(message); else {
            const box = message.getBoundingClientRect();
            const chatBox = scrollHost?.getBoundingClientRect();
            const visible = !chatBox || box.bottom > chatBox.top + 8 && box.top < chatBox.bottom - 8;
            message.classList.toggle(SWIPE_VIEW_CLASS, visible);
            visible && visibleSwipeMessages.add(message);
          }
        }
      });
      scheduleSwipeTrack();
    }
    function refreshReroll(message, typingActive) {
      hostDocument.querySelectorAll(`.${REROLL_CLASS}`).forEach(button => {
        message && message.contains(button) || button.remove();
      });
      if (!message || typingActive || isWelcomeSurfaceMessage(message)) {
        message?.querySelector(`.${REROLL_CLASS}`)?.remove();
        return;
      }
      const actions = message.querySelector(".mes_buttons");
      actions && !actions.querySelector(`:scope > .${REROLL_CLASS}`) && actions.append(createRerollButton());
    }
    const BODY_OBSERVER_INIT = {
      subtree: !0,
      childList: !0
    };
    const ROOT_ATTRIBUTE_OBSERVER_INIT = {
      attributes: !0,
      attributeOldValue: !0,
      attributeFilter: [ "class", "style" ]
    };
    const CHAT_ATTRIBUTE_OBSERVER_INIT = {
      ...ROOT_ATTRIBUTE_OBSERVER_INIT,
      subtree: !0
    };
    const OBSERVER_COSMETIC_CLASSES = new Set([ READY_CLASS, EMPTY_CLASS, GENERATING_CLASS, "claude-has-preset-reasoning", SWIPE_VIEW_CLASS, "claude-welcome-clawd-assistant", "claude-welcome-prompt", MOBILE_LAYOUT_CLASS, "clawd-tauritavern-host", "clawd-welcome", "clawd-has-recents", "clawd-wobble-sway", "clawd-wobble-tilt", "clawd-typing-enter", "clawd-typing-ready", "clawd-typing-native-suppressed", "clawd-typing-click", "clawd-typing-press" ]);
    const OWNED_MUTATION_SELECTOR = [ `button.${BUTTON_CLASS}`, `button.${LEFT_SWIPE_PROXY_CLASS}`, `button.${SWIPE_PROXY_CLASS}`, `button.${REROLL_CLASS}`, `.${USER_ACTIONS_CLASS}`, ".clawd-typing-hit", ".clawd-typing-exit-ghost", ".clawd-mobile-chrome", ".clawd-mobile-scrim", ".clawd-mobile-new-chat", ".clawd-android-keyboard-pan-anchor", ".clawd-character-menu", ".clawd-character-switcher", ".clawd-rail-brand", ".clawd-rail-label", ".clawd-rail-grip", ".clawd-welcome-hero", ".clawd-welcome-shortcuts", ".clawd-surface-backing", ".clawd-gen-timer", ".clr-ghost-host" ].join(",");
    function classMutationIsCosmetic(record, target) {
      if (record.attributeName !== "class") return !1;
      const before = new Set(String(record.oldValue || "").split(/\s+/).filter(Boolean));
      const after = new Set(String(target.getAttribute("class") || "").split(/\s+/).filter(Boolean));
      const changed = new Set([ ...before, ...after ].filter(name => before.has(name) !== after.has(name)));
      if (changed.size === 0) return !0;
      return [ ...changed ].every(name => OBSERVER_COSMETIC_CLASSES.has(name) || name.startsWith("clawd-react-") || name.startsWith("clawd-poke-"));
    }
    function nodeBelongsToClawd(node) {
      if (!(node instanceof hostWindow.Element)) return !1;
      return node.matches(OWNED_MUTATION_SELECTOR) || Boolean(node.closest(OWNED_MUTATION_SELECTOR));
    }
    function trackDirtyMessages(records) {
      for (const record of records) {
        if ((record.type === 'childList' && record.target === scrollHost && [...record.addedNodes, ...record.removedNodes].some(n => n.nodeType === 1 && n.matches?.('.mes')))
          || (record.type === 'attributes' && record.attributeName === 'mesid')) clawdReadingGate.reset();
        const target = record.target instanceof hostWindow.Element ? record.target : record.target.parentElement;
        if (target instanceof hostWindow.Element) {
          const owner = target.closest("#chat > .mes");
          owner && dirtyMessages.add(owner);
        }
        record.type === "childList" && record.addedNodes.forEach(node => {
          node instanceof hostWindow.Element && node.matches("#chat > .mes") && dirtyMessages.add(node);
        });
      }
    }
    function externalStyleMutationIsIrrelevant(record, target) {
      return record.type === "attributes" && record.attributeName === "style" && !target.closest("#chat");
    }
    function restoreExternalThemeStyle() {
      if (!suspendedThemeStyle) return;
      suspendedThemeMedia == null ? suspendedThemeStyle.removeAttribute("media") : suspendedThemeStyle.setAttribute("media", suspendedThemeMedia);
      suspendedThemeStyle = null;
      suspendedThemeMedia = null;
      delete hostDocument.documentElement.dataset.claudeExternalSurface;
    }
    function syncExternalSurfaceIsolation() {
      const manager = hostDocument.querySelector("#charManagerModal");
      const visible = manager && !manager.hidden && (() => {
        const style = hostWindow.getComputedStyle(manager);
        return style.display !== "none" && style.visibility !== "hidden";
      })();
      if (!visible) {
        restoreExternalThemeStyle();
        return;
      }
      const style = hostDocument.getElementById("claude-integrated-theme-live-style");
      if (!style) return;
      suspendedThemeStyle && suspendedThemeStyle !== style && restoreExternalThemeStyle();
      if (!suspendedThemeStyle) {
        suspendedThemeStyle = style;
        suspendedThemeMedia = style.getAttribute("media");
      }
      style.setAttribute("media", "not all");
      hostDocument.documentElement.dataset.claudeExternalSurface = "character-manager";
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

    const liftedExternalModals = new Map;
    function liftExternalModals(modals) {
      for (const modal of modals) {
        if (liftedExternalModals.has(modal)) continue;
        const z = Number.parseInt(hostWindow.getComputedStyle(modal).zIndex, 10);
        if (Number.isFinite(z) && z >= 4100) continue;
        liftedExternalModals.set(modal, {
          value: modal.style.getPropertyValue("z-index"),
          priority: modal.style.getPropertyPriority("z-index")
        });
        modal.style.setProperty("z-index", "4100", "important");
      }
      for (const [modal, state] of liftedExternalModals) {
        if (modals.includes(modal)) continue;
        liftedExternalModals.delete(modal);
        state.value ? modal.style.setProperty("z-index", state.value, state.priority) : modal.style.removeProperty("z-index");
      }
    }
    function syncExternalModalRailLayer() {
      const modals = observeExternalModalCandidates().filter(isVisibleExternalModal);
      const modalOpen = modals.length > 0;
      setBodyClass("clawd-external-modal-open", modalOpen);
      restoreExternalModalRailLayer();
      liftExternalModals(modalOpen ? modals : []);
      hostWindow.__claudeOfficialLayout?.setExternalModals(modals);
    }
    function onExternalModalAnimationEnd(event) {
      externalModalHost(event.target) && scheduleExternalSurfaceIsolation();
    }
    function restoreExternalModalRailLayer() {
      const states = externalModalRailState;
      externalModalRailState = [];
      for (const state of states) {
        if (!state?.element) continue;
        state.value ? state.element.style.setProperty("z-index", state.value, state.priority) : state.element.style.removeProperty("z-index");
      }
    }
    function mutationNeedsFullRefresh(record) {
      const target = record.target instanceof hostWindow.Element ? record.target : record.target.parentElement;
      if (!(target instanceof hostWindow.Element)) return !0;
      if (target.closest("#form_sheld, #send_form")) {
        hostWindow.ResizeObserver || scheduleMobileComposerInset();
        return !1;
      }
      if (target.closest("#completion_prompt_manager")) return !1;
      if (insideClosedDrawer(record)) return !1;
      if (target.closest("#charManagerModal")) return !1;
      if (externalStyleMutationIsIrrelevant(record, target)) {
        refreshStats.externalStyleRecordsIgnored += 1;
        return !1;
      }
      if (target.matches(OWNED_MUTATION_SELECTOR) || target.closest(OWNED_MUTATION_SELECTOR)) return !1;
      if (record.type === "attributes" && classMutationIsCosmetic(record, target)) return !1;
      if (record.type === "childList") {
        const nodes = [ ...record.addedNodes, ...record.removedNodes ];
        if (nodes.length && nodes.every(nodeBelongsToClawd)) return !1;
        if (isTypingActive() && target.closest('#chat > .mes[is_user="false"] :is(.mes_text,.mes_reasoning)')) return !1;
      }
      return !0;
    }
    function ensureChatAttributeObserver() {
      if (!chatAttributeObserver) return;
      const chat = hostDocument.querySelector("#chat");
      if (chat === observedAttributeChat) return;
      chatAttributeObserver.disconnect();
      observedAttributeChat = chat;
      chatAttributeObserver.observe(hostDocument.documentElement, ROOT_ATTRIBUTE_OBSERVER_INIT);
      chatAttributeObserver.observe(hostDocument.body, ROOT_ATTRIBUTE_OBSERVER_INIT);
      chat && chatAttributeObserver.observe(chat, CHAT_ATTRIBUTE_OBSERVER_INIT);
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
    const inClawdPile = record => {
      const t = record.target;
      return !!(t?.nodeType === 1 ? t : t?.parentElement)?.closest?.(".clawd-pile");
    };
    function insideClosedDrawer(record) {
      const node = record.target?.nodeType === 1 ? record.target : record.target?.parentElement;
      const drawer = node?.closest?.(".closedDrawer");
      return !!drawer && drawer !== node;
    }
    function handleObservedMutations(records) {
      if (hostDocument.documentElement.hasAttribute("data-cw-sheet") || hostDocument.querySelector("dialog.cw-v4-editor[open]")) for (const record of records) if (record.type === "childList" && record.target === hostDocument.body) for (const node of record.addedNodes) node instanceof hostWindow.HTMLElement && extraExternalModalCandidates.add(node);
      if (records.some(inClawdPile)) {
        records = records.filter(r => !inClawdPile(r));
        if (!records.length) return;
      }
      records.some(record => record.type === "childList" && !insideClosedDrawer(record) && [ ...record.addedNodes, ...record.removedNodes ].some(node => node.nodeType === 1)) && scheduleExternalSurfaceIsolation();
      refreshStats.recordsSeen += records.length;
      trackDirtyMessages(records);
      ensureChatAttributeObserver();
      preserveStreamingReasoning(isTypingActive());
      records.some(record => {
        const target = record.target instanceof hostWindow.Element ? record.target : record.target?.parentElement;
        return target?.closest?.("#completion_prompt_manager_list");
      }) && refreshPromptManagerDragHandles();
      if (!records.some(mutationNeedsFullRefresh)) return;
      refreshStats.recordsPassedFilter += records.length;
      if (refreshing) {
        dirtyWhileRefreshing = !0;
        return;
      }
      scheduleRefresh();
    }
    let refreshing = !1;
    let dirtyWhileRefreshing = !1;
    const refreshStats = {
      refreshes: 0,
      totalMs: 0,
      maxMs: 0,
      lastMs: 0,
      recordsSeen: 0,
      recordsPassedFilter: 0,
      selfRecordsDropped: 0,
      externalStyleRecordsIgnored: 0,
      since: Date.now()
    };
    function refreshClawd() {
      refreshing = !0;
      const startedAt = (hostWindow.performance ?? Date).now();
      try {
        refreshClawdInner();
      } finally {
        const elapsed = (hostWindow.performance ?? Date).now() - startedAt;
        refreshStats.refreshes += 1;
        refreshStats.totalMs += elapsed;
        refreshStats.lastMs = elapsed;
        elapsed > refreshStats.maxMs && (refreshStats.maxMs = elapsed);
        const pending = [ ...observer?.takeRecords?.() ?? [], ...chatAttributeObserver?.takeRecords?.() ?? [] ];
        if (pending.length) {
          refreshStats.selfRecordsDropped += pending.length;
          pending.some(mutationNeedsFullRefresh) && (dirtyWhileRefreshing = !0);
        }
        refreshing = !1;
        if (dirtyWhileRefreshing) {
          dirtyWhileRefreshing = !1;
          destroyed || scheduleRefresh();
        }
      }
    }
    function refreshClawdInner() {
      frameId = 0;
      lastRefreshAt = Date.now();
      if (destroyed) return;
      syncClawdRuntime();
      watchGenerationEvents();
      setBodyClass(READY_CLASS, !0);
      const typingActive = isTypingActive();
      const continuingGeneration = previousTypingActive && typingActive;
      const generationJustEnded = previousTypingActive && !typingActive;
      generationSubscriptions.length || (generationEventActive = typingActive);
      if (!previousTypingActive && typingActive) {
        typingRunId += 1;
        clawdTracks.A || beginClawdGeneration();
      }
      generationJustEnded && settleClawdGeneration("done");
      previousTypingActive = typingActive;
      setBodyClass(GENERATING_CLASS, typingActive);
      ensureComposerClawd();
      mobileViewportMetricsDirty && applyMobileViewportMetrics();
      refreshMobileComposerInset();
      preserveStreamingReasoning(typingActive);
      if (continuingGeneration) {
        refreshComposerPhrase(!0);
        return;
      }
      refreshComposerPhrase(typingActive);
      refreshEmbeddedSurfaces();
      refreshWelcomeAssistants();
      refreshCodeBars();
      collapseReasoning();
      expandReasoningWhileEditing();
      const messages = refreshMessageStates(typingActive);
      if (generationJustEnded) {
        isMobileLayout() || scheduleSwipeTrack();
        recentSignature = null;
        refreshRailRecents({
          force: !0
        });
      }
      dirtyMessages.clear();
      refreshWelcomeMode(messages);
      refreshRailBrand();
      refreshPcTopActions();
      refreshRailLabels();
      watchChatDeleted();
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
      removeStaleButtons();
      renderClawdTracks();
      generationJustEnded && streamFollow?.afterDecoration();
    }
    let lastRefreshAt = 0;
    let throttleTimer = 0;
    const REFRESH_MIN_GAP = 50;
    const MOBILE_REFRESH_MIN_GAP = 110;
    const MOBILE_GENERATION_REFRESH_MIN_GAP = 180;
    function scheduleRefresh() {
      if (destroyed || frameId || throttleTimer) return;
      const minGap = isMobileLayout() ? previousTypingActive ? MOBILE_GENERATION_REFRESH_MIN_GAP : MOBILE_REFRESH_MIN_GAP : REFRESH_MIN_GAP;
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
    let drawerGuardObserver = null;
    let drawerGuardTimer = 0;
    const drawerStats = {
      clicks: 0,
      corrections: 0,
      blocked: 0
    };
    function railToggleOf(target) {
      const drawer = target?.closest?.("#top-settings-holder > .drawer");
      if (!drawer) return null;
      const toggle = drawer.querySelector(":scope > .drawer-toggle");
      return toggle?.contains(target) ? drawer : null;
    }
    function blockDrawerAutoClose(event) {
      if (!railEnabled || isMobileLayout() || destroyed) return;
      if (!railToggleOf(event.target)) return;
      event.stopPropagation();
      drawerStats.blocked += 1;
    }
    function blockInlineDrawerAutoClose(event) {
      if (destroyed) return;
      if (!event.target?.closest?.(".inline-drawer-toggle, .inline-drawer-header")) return;
      event.stopPropagation();
    }
    function drawerAnimationMs() {
      const raw = Number(hostWindow.SillyTavern?.getContext?.()?.powerUserSettings?.animation_duration);
      return Number.isFinite(raw) ? Math.min(Math.max(raw, 0), 350) : 125;
    }
    function clearDrawerGuard() {
      drawerGuardObserver?.disconnect();
      drawerGuardObserver = null;
      drawerGuardTimer && hostWindow.clearTimeout(drawerGuardTimer);
      drawerGuardTimer = 0;
    }
    function guardDrawerClick(event) {
      if (!railEnabled || isMobileLayout() || destroyed) return;
      const drawer = railToggleOf(event.target);
      if (!drawer) return;
      const content = drawer.querySelector(":scope > .drawer-content");
      if (!content) return;
      clearDrawerGuard();
      drawerStats.clicks += 1;
      const icon = drawer.querySelector(":scope > .drawer-toggle .drawer-icon");
      const want = !content.classList.contains("openDrawer");
      drawerGuardObserver = new hostWindow.MutationObserver(() => {
        if (content.classList.contains("openDrawer") === want) return;
        drawerStats.corrections += 1;
        content.classList.toggle("openDrawer", want);
        content.classList.toggle("closedDrawer", !want);
        icon?.classList.toggle("openIcon", want);
        icon?.classList.toggle("closedIcon", !want);
      });
      drawerGuardObserver.observe(content, {
        attributes: !0,
        attributeFilter: [ "class" ]
      });
      drawerGuardTimer = hostWindow.setTimeout(clearDrawerGuard, drawerAnimationMs() + 400);
    }
    function releaseDrawerGuard(event) {
      if (!drawerGuardObserver) return;
      if (event.type === "keydown" && event.key !== "Escape") return;
      if (event.type !== "keydown" && railToggleOf(event.target)) return;
      clearDrawerGuard();
    }
    function restoreAutoCompleteResizeGuard() {
      autoCompleteResizeGuardToken = null;
      const guard = autoCompleteResizeGuard;
      autoCompleteResizeGuard = null;
      try {
        guard?.restore?.();
      } catch (error) {
        hostWindow.console?.warn?.("[Claude-Clawd] AutoComplete resize guard restore failed.", error);
      }
      hostWindow["__claudeClawdAutoCompleteResizeGuard"] === guard && delete hostWindow["__claudeClawdAutoCompleteResizeGuard"];
    }
    async function installAutoCompleteResizeGuard() {
      if (!isMobileLayout() || !/Android/i.test(hostWindow.navigator?.userAgent || "")) return;
      const token = {};
      autoCompleteResizeGuardToken = token;
      const moduleUrl = resolveHostModule("scripts/autocomplete/AutoComplete.js");
      try {
        const previous = hostWindow["__claudeClawdAutoCompleteResizeGuard"];
        previous?.restore?.();
        hostWindow["__claudeClawdAutoCompleteResizeGuard"] === previous && delete hostWindow["__claudeClawdAutoCompleteResizeGuard"];
        const module = await import(moduleUrl);
        if (destroyed || autoCompleteResizeGuardToken !== token) return;
        const AutoComplete = module?.AutoComplete;
        const prototype = AutoComplete?.prototype;
        if (!prototype || typeof prototype.getCursorPosition !== "function") throw new Error("Unsupported AutoComplete module shape.");
        const descriptors = AUTOCOMPLETE_GUARDED_METHODS.map(name => ({
          name: name,
          descriptor: Object.getOwnPropertyDescriptor(prototype, name)
        }));
        if (descriptors.some(({descriptor: descriptor}) => typeof descriptor?.value !== "function")) throw new Error("Required AutoComplete positioning methods are unavailable.");
        const updatePositionSource = Function.prototype.toString.call(descriptors.find(({name: name}) => name === "updatePosition").descriptor.value);
        if (/if\s*\(\s*!this\.isActive\s*\)\s*return/.test(updatePositionSource)) {
          const state = {
            installed: !1,
            reason: "upstream-guard",
            moduleUrl: moduleUrl,
            restore() {}
          };
          autoCompleteResizeGuard = state;
          hostWindow["__claudeClawdAutoCompleteResizeGuard"] = state;
          return;
        }
        const records = [];
        try {
          for (const {name: name, descriptor: descriptor} of descriptors) {
            const original = descriptor.value;
            const wrapped = function(...args) {
              if (!this?.isActive) return;
              return original.apply(this, args);
            };
            Object.defineProperty(prototype, name, {
              ...descriptor,
              value: wrapped
            });
            records.push({
              name: name,
              descriptor: descriptor,
              wrapped: wrapped
            });
          }
        } catch (error) {
          for (const {name: name, descriptor: descriptor, wrapped: wrapped} of records.reverse()) prototype[name] === wrapped && Object.defineProperty(prototype, name, descriptor);
          throw error;
        }
        const state = {
          installed: !0,
          reason: "android-active-autocomplete",
          moduleUrl: moduleUrl,
          restore() {
            for (const {name: name, descriptor: descriptor, wrapped: wrapped} of records) prototype[name] === wrapped && Object.defineProperty(prototype, name, descriptor);
          }
        };
        autoCompleteResizeGuard = state;
        hostWindow["__claudeClawdAutoCompleteResizeGuard"] = state;
        hostWindow.console?.info?.("[Claude-Clawd] AutoComplete resize guard installed.");
      } catch (error) {
        destroyed || autoCompleteResizeGuardToken !== token || hostWindow.console?.warn?.("[Claude-Clawd] AutoComplete resize guard skipped.", error);
      }
    }
    function destroy() {
      hostWindow.clearInterval(genTimerTickTimer);
      genTimerTickTimer = 0;
      clawdRuntimeTimer && hostWindow.clearInterval(clawdRuntimeTimer);
      clawdRuntimeTimer = 0;
      genTimerLingerTimer && hostWindow.clearTimeout(genTimerLingerTimer);
      genTimerEl?.remove();
      genTimerEl = null;
      reconcileTimer && hostWindow.clearTimeout(reconcileTimer);
      reconcileTimer = 0;
      if (destroyed) return;
      destroyed = !0;
      syncClawdRuntime();
      clawdPile.destroy();
      hostWindow.clearTimeout(pushLiveTimer);
      hostDocument.documentElement.removeAttribute("data-cw-push");
      cleanupClawdRigEffects();
      externalModalObserver?.disconnect();
      externalModalObserver = null;
      hostDocument.removeEventListener("transitionend", onExternalModalAnimationEnd);
      hostDocument.removeEventListener("animationend", onExternalModalAnimationEnd);
      extraExternalModalCandidates.clear();
    externalModalSources.clear();
      hostDocument.body.classList.remove("clawd-external-modal-open");
      restoreExternalModalRailLayer();
      liftExternalModals([]);
      externalSurfaceIsolationRaf && hostWindow.cancelAnimationFrame(externalSurfaceIsolationRaf);
      externalSurfaceIsolationRaf = 0;
      restoreExternalThemeStyle();
      hostDocument.querySelectorAll(".clawd-surface-host").forEach(host => host.classList.remove("clawd-surface-host"));
      hostDocument.querySelectorAll(".clawd-surface-backing").forEach(backing => backing.remove());
      restoreAutoCompleteResizeGuard();
      observer?.disconnect();
      chatAttributeObserver?.disconnect();
      chatAttributeObserver = null;
      observedAttributeChat = null;
      restoreRecents();
      for (const {source: source, type: type, handler: handler} of chatDeletedSubscriptions) try {
        source?.removeListener?.(type, handler);
        source?.off?.(type, handler);
      } catch {}
      chatDeletedSubscriptions.length = 0;
      for (const {source: source, type: type, handler: handler} of generationSubscriptions) try {
        source?.removeListener?.(type, handler);
        source?.off?.(type, handler);
      } catch {}
      streamFollow?.destroy();
      streamFollow = null;
      generationSubscriptions.length = 0;
      generationEventActive = !1;
      scrollHost?.removeEventListener("scroll", handleChatScroll);
      swipeTrackRaf && hostWindow.cancelAnimationFrame(swipeTrackRaf);
      swipeObserver?.disconnect();
      swipeObserver = null;
      observedSwipeMessages.clear();
      visibleSwipeMessages.clear();
      hostDocument.removeEventListener("click", interceptNativeDelete, !0);
      hostDocument.removeEventListener("click", guardDrawerClick, !0);
      hostDocument.removeEventListener("mousedown", blockDrawerAutoClose, !0);
      hostDocument.removeEventListener("touchstart", blockDrawerAutoClose, !0);
      hostDocument.removeEventListener("mousedown", blockInlineDrawerAutoClose, !0);
      hostDocument.removeEventListener("touchstart", blockInlineDrawerAutoClose, !0);
      hostDocument.removeEventListener("pointerdown", releaseDrawerGuard, !0);
      hostDocument.removeEventListener("keydown", releaseDrawerGuard, !0);
      hostDocument.removeEventListener("pointerdown", dismissCharacterMenu, !0);
      hostDocument.removeEventListener("keydown", dismissCharacterMenu, !0);
      clearDrawerGuard();
      closeCharacterMenu();
      closeMobileMenu();
      if (mobileNavHolder && mobileNavCloseHandler) {
        mobileNavHolder.removeEventListener("click", mobileNavCloseHandler, !0);
        mobileNavHolder.removeEventListener("touchstart", mobileNavPrepareHandler, !0);
        mobileNavHolder.removeEventListener("mousedown", mobileNavPrepareHandler, !0);
      }
      mobileNavHolder = null;
      mobileNavCloseHandler = null;
      mobileNavPrepareHandler = null;
      mobileChrome?.root?.remove();
      mobileChrome = null;
      hostDocument.querySelectorAll(".clawd-android-keyboard-pan-anchor").forEach(node => node.remove());
      A2.bndRaf && hostWindow.cancelAnimationFrame(A2.bndRaf);
      A2.bndRaf = 0;
      clawdScrollRestTimer && hostWindow.clearTimeout(clawdScrollRestTimer);
      clawdScrollRestTimer = 0;
      clawdPileRestTimer && hostWindow.clearTimeout(clawdPileRestTimer);
      clawdPileRestTimer = 0;
      clawdScrollHolding = !1;
      A2.bndReady = !1;
      composerResizeObserver?.disconnect();
      composerResizeObserver = null;
      clawdFormRO?.disconnect();
      clawdFormRO = null;
      clawdFormObserved = null;
      observedComposerShell?.style.removeProperty("--cl-mobile-composer-translate-y");
      observedComposerShell = null;
      lastComposerHeight = 0;
      composerInsetRaf && hostWindow.cancelAnimationFrame(composerInsetRaf);
      composerInsetRaf = 0;
      composerBottomRaf && hostWindow.cancelAnimationFrame(composerBottomRaf);
      composerBottomRaf = 0;
      clearMobileViewportSettleTimers();
      clearMobileViewportRecheck();
      mobileKeyboardSettlingUntil = 0;
      mobileKeyboardRecoveryActive = !1;
      stopMobileKeyboardPoll();
      hostDocument.getElementById("clawd-via-compositor-isolation")?.remove();
      restoreVirtualKeyboardOverlay();
      hostDocument.querySelectorAll("." + RAIL_BRAND_CLASS).forEach(brand => brand.remove());
      hostDocument.querySelectorAll("." + PC_TOP_ACTIONS_CLASS).forEach(actions => actions.remove());
      hostDocument.querySelectorAll(".clawd-character-switcher").forEach(button => button.remove());
      hostDocument.querySelectorAll(".clawd-fake-mic").forEach(mic => mic.remove());
      hostDocument.querySelectorAll(".clawd-mobile-new-chat").forEach(button => button.remove());
      hostWindow.removeEventListener("resize", handleViewportChange);
      hostDocument.removeEventListener("mousemove", handleLook);
      hostDocument.removeEventListener("keydown", noteActivity);
      clawdReadingGate.reset(true); clawdComposerReaction.reset();
      for (const type of ['wheel','pointerdown','pointermove','pointerup','pointercancel','keydown']) hostDocument.removeEventListener(type, handleClawdReadingIntent, true);
      for (const type of ['beforeinput','compositionstart','compositionend']) hostDocument.removeEventListener(type, handleClawdComposerEdit, true);
      hostDocument.removeEventListener("input", handleComposerInput, !0);
      hostDocument.removeEventListener("visibilitychange", noteCcVisibility);
      hostDocument.removeEventListener("visibilitychange", recoverStalledFrame);
      releaseMobileChatAutofocus();
      hostDocument.removeEventListener("pointerdown", handleComposerFocusGesture, !0);
      hostDocument.removeEventListener("touchstart", handleComposerFocusGesture, !0);
      hostDocument.removeEventListener("focusin", handleFocusIn, !0);
      hostDocument.removeEventListener("focusout", handleFocusOut, !0);
      if (throttleTimer) {
        hostWindow.clearTimeout(throttleTimer);
        throttleTimer = 0;
      }
      typingMotionTimers.forEach(timer => hostWindow.clearTimeout(timer));
      typingMotionTimers.clear();
      typingEntryTimers.forEach(timer => hostWindow.clearTimeout(timer));
      typingEntryTimers.clear();
      typingExitGhosts.forEach(({ghost: ghost, timer: timer}, indicator) => {
        hostWindow.clearTimeout(timer);
        ghost.remove();
        indicator.classList.remove("clawd-typing-native-suppressed");
      });
      typingExitGhosts.clear();
      lookRaf && hostWindow.cancelAnimationFrame(lookRaf);
      hostWindow.visualViewport?.removeEventListener("resize", handleViewportChange);
      hostWindow.visualViewport?.removeEventListener("scroll", handleViewportChange);
      mobileComposerTranslateRaf && hostWindow.cancelAnimationFrame(mobileComposerTranslateRaf);
      mobileComposerTranslateRaf = 0;
      viewportSettleTimer && hostWindow.clearTimeout(viewportSettleTimer);
      viewportSettleTimer = 0;
      scrollHost = null;
      if (frameId) {
        hostWindow.cancelAnimationFrame(frameId);
        frameId = 0;
      }
      emptyTimers.forEach(timer => hostWindow.clearTimeout(timer));
      emptyTimers.clear();
      dirtyMessages.clear();
      previousTypingActive = !1;
      embeddedFrameHandlers.forEach((handler, frame) => {
        frame.removeEventListener("load", handler);
        frame.removeAttribute("data-claude-transparent-surface");
        frame.style.removeProperty("background");
        frame.style.removeProperty("background-color");
        try {
          frame.contentDocument?.getElementById(EMBED_STYLE_ID)?.remove();
        } catch {}
        const originalSrcdoc = embeddedFrameOriginalSrcdoc.get(frame);
        originalSrcdoc !== void 0 && frame.setAttribute("srcdoc", originalSrcdoc);
      });
      embeddedFrameHandlers.clear();
      embeddedFrameOriginalSrcdoc.clear();
      [ ...welcomeAvatarOriginals.keys() ].forEach(restoreWelcomeAvatar);
      hostDocument.querySelectorAll(".claude-welcome-prompt").forEach(message => message.classList.remove("claude-welcome-prompt"));
      hostDocument.querySelectorAll(`.${BUTTON_CLASS}, .${LEFT_SWIPE_PROXY_CLASS}, .${SWIPE_PROXY_CLASS}, .${REROLL_CLASS}, .${USER_ACTIONS_CLASS}, .clawd-prompt-drag-handle, .clawd-typing-hit, .clawd-typing-exit-ghost`).forEach(element => element.remove());
      hostDocument.querySelectorAll("#chat .typing_indicator").forEach(indicator => {
        indicator.classList.remove("clawd-typing-enter", "clawd-typing-ready", "clawd-typing-native-suppressed", "clawd-typing-click", "clawd-typing-press", "clawd-cheer", "clawd-wobble-sway", "clawd-wobble-tilt");
        delete indicator.dataset.clawdTypingRun;
      });
      hostDocument.getElementById(STYLE_ID)?.remove();
      hostDocument.getElementById(CLAWD_RIG_STYLE_ID)?.remove();
      hostDocument.body?.classList.remove(READY_CLASS, GENERATING_CLASS, MOBILE_LAYOUT_CLASS, "clawd-tauritavern-host", "clawd-virtual-keyboard-overlay");
      hostDocument.querySelectorAll(`.${EMPTY_CLASS}`).forEach(message => message.classList.remove(EMPTY_CLASS));
      hostDocument.querySelectorAll(".claude-has-preset-reasoning").forEach(message => message.classList.remove("claude-has-preset-reasoning"));
      hostDocument.querySelectorAll(`.${SWIPE_VIEW_CLASS}`).forEach(message => message.classList.remove(SWIPE_VIEW_CLASS));
      hostDocument.querySelectorAll(".mes_reasoning_details[data-clawd-collapsed]").forEach(box => box.removeAttribute("data-clawd-collapsed"));
      hostDocument.querySelectorAll(`.${REGEX_SURFACE_CLASS}`).forEach(element => element.classList.remove(REGEX_SURFACE_CLASS));
      hostDocument.documentElement.style.removeProperty("--clawd-signoff-image");
      hostDocument.documentElement.style.removeProperty("--cl-mobile-composer-height");
      hostDocument.documentElement.style.removeProperty("--cl-mobile-viewport-height");
      hostDocument.documentElement.style.removeProperty("--cl-mobile-viewport-top");
      hostDocument.documentElement.style.removeProperty("--cl-mobile-popup-height");
      hostWindow[INSTANCE_KEY] === api && delete hostWindow[INSTANCE_KEY];
    }
    const api = {
      destroy: destroy,
      refresh: () => {
        syncClawdRuntime();
        scheduleRefresh();
      },

      clawdState: () => ({
        A: clawdTracks.A,
        B: clawdTracks.B,
        C: clawdTracks.C,
        owner: clawdTracks.C ? "C" : clawdTracks.A ? "A" : "B",
        visible: clawdVisibleState(),
        round: clawdTracks.activeRound,
        settledRound: clawdTracks.settledRound,
        irr: A2.irr
      }),
      streamFollowStats: () => streamFollow?.stats(),
      drawerStats: () => ({
        ...drawerStats
      }),
      buildId: KEYBOARD_BUILD.id,
      perfStats: (reset = !1) => {
        const seconds = Math.max(1, (Date.now() - refreshStats.since) / 1e3);
        const snapshot = {
          "统计时长秒": Math.round(seconds),
          "刷新次数": refreshStats.refreshes,
          "每秒刷新": +(refreshStats.refreshes / seconds).toFixed(2),
          "平均耗时ms": refreshStats.refreshes ? +(refreshStats.totalMs / refreshStats.refreshes).toFixed(1) : 0,
          "最慢一次ms": +refreshStats.maxMs.toFixed(1),
          "最近一次ms": +refreshStats.lastMs.toFixed(1),
          "累计占用ms": Math.round(refreshStats.totalMs),
          "占CPU比例": `${(refreshStats.totalMs / (seconds * 1e3) * 100).toFixed(1)}%`,
          "收到记录数": refreshStats.recordsSeen,
          "通过过滤数": refreshStats.recordsPassedFilter,
          "自身记录丢弃数": refreshStats.selfRecordsDropped,
          "外部样式记录忽略数": refreshStats.externalStyleRecordsIgnored,
          "消息条数": hostDocument.querySelectorAll("#chat > .mes").length,
          "消息总字数": [ ...hostDocument.querySelectorAll("#chat > .mes .mes_text") ].reduce((sum, node) => sum + node.textContent.length, 0)
        };
        reset && Object.assign(refreshStats, {
          refreshes: 0,
          totalMs: 0,
          maxMs: 0,
          lastMs: 0,
          recordsSeen: 0,
          recordsPassedFilter: 0,
          selfRecordsDropped: 0,
          externalStyleRecordsIgnored: 0,
          since: Date.now()
        });
        return snapshot;
      },
      keyboardStats: () => ({
        focused: hostDocument.activeElement?.id === "send_textarea",
        overlay: virtualKeyboardOverlayActive,
        recovering: mobileKeyboardRecoveryActive,
        settling: Date.now() < mobileKeyboardSettlingUntil,
        baseline: keyboardBaselineMode,
        stableLayoutHeight: mobileStableLayoutHeight,
        innerHeight: hostWindow.innerHeight,
        clientHeight: hostDocument.documentElement.clientHeight,
        visualHeight: hostWindow.visualViewport?.height ?? null,
        visualTop: hostWindow.visualViewport?.offsetTop ?? null,
        translate: hostDocument.querySelector("#form_sheld")?.style.getPropertyValue("--cl-mobile-composer-translate-y") || "",
        polling: Boolean(mobileKeyboardPollTimer)
      }),
      autoCompleteGuardStats: () => ({
        installed: Boolean(autoCompleteResizeGuard?.installed),
        reason: autoCompleteResizeGuard?.reason || "not-installed",
        moduleUrl: autoCompleteResizeGuard?.moduleUrl || null
      })
    };
    hostWindow[INSTANCE_KEY] = api;
    $(function() {
      if (destroyed) return;
      installAutoCompleteResizeGuard();
      installStyle();
      installClawdRigStyle();
      hostWindow.console?.info?.("[Claude-Clawd] build:", KEYBOARD_BUILD.id);
      setBodyClass(READY_CLASS, !0);
      hostDocument.body.classList.toggle(MOBILE_LAYOUT_CLASS, mobileEnabled);
      hostDocument.body.classList.toggle("clawd-tauritavern-host", isTauriTavernHost());
      externalModalObserver = new hostWindow.MutationObserver(records => {
      // Some hosts rewrite an unchanged style/class attribute. Do not feed
      // those no-op writes back into another layout and sheet-yield pass.
      if (records.some(record => record.oldValue !== record.target.getAttribute(record.attributeName))) scheduleExternalSurfaceIsolation();
    });
      hostDocument.addEventListener("transitionend", onExternalModalAnimationEnd);
      hostDocument.addEventListener("animationend", onExternalModalAnimationEnd);
      externalModalObserver.observe(hostDocument.documentElement, {
        attributes: !0,
        attributeOldValue: true, attributeFilter: ['data-cw-v4-settings']
      });
      syncExternalSurfaceIsolation();
      syncExternalModalRailLayer();
      installVirtualKeyboardOverlay();
      watchGenerationEvents();
      syncClawdRuntime();
      observer = new hostWindow.MutationObserver(handleObservedMutations);
      chatAttributeObserver = new hostWindow.MutationObserver(handleObservedMutations);
      observer.observe(hostDocument.body, BODY_OBSERVER_INIT);
      ensureChatAttributeObserver();
      scrollHost = hostDocument.querySelector("#chat");
      hostWindow.IntersectionObserver && scrollHost && (swipeObserver = new hostWindow.IntersectionObserver(entries => {
        for (const entry of entries) {
          const message = entry.target;
          const visible = entry.isIntersecting && entry.intersectionRect.height > 8;
          message.classList.toggle(SWIPE_VIEW_CLASS, visible);
          visible ? visibleSwipeMessages.add(message) : visibleSwipeMessages.delete(message);
        }
        scheduleSwipeTrack();
      }, {
        root: scrollHost,
        rootMargin: "-8px 0px -8px 0px",
        threshold: 0
      }));
      scrollHost?.addEventListener("scroll", handleChatScroll, {
        passive: !0
      });
      hostDocument.addEventListener("click", interceptNativeDelete, !0);
      hostDocument.addEventListener("click", guardDrawerClick, !0);
      hostDocument.addEventListener("mousedown", blockDrawerAutoClose, !0);
      hostDocument.addEventListener("touchstart", blockDrawerAutoClose, !0);
      hostDocument.addEventListener("mousedown", blockInlineDrawerAutoClose, !0);
      hostDocument.addEventListener("touchstart", blockInlineDrawerAutoClose, !0);
      hostDocument.addEventListener("pointerdown", releaseDrawerGuard, !0);
      hostDocument.addEventListener("keydown", releaseDrawerGuard, !0);
      hostDocument.addEventListener("pointerdown", dismissCharacterMenu, !0);
      hostDocument.addEventListener("keydown", dismissCharacterMenu, !0);
      hostWindow.addEventListener("resize", handleViewportChange, {
        passive: !0
      });
      hostDocument.addEventListener("mousemove", handleLook, {
        passive: !0
      });
      hostDocument.addEventListener("keydown", noteActivity, {
        passive: !0
      });
      for (const type of ['wheel','pointerdown','pointermove','pointerup','pointercancel','keydown']) hostDocument.addEventListener(type, handleClawdReadingIntent, { capture: true, passive: true });
      for (const type of ['beforeinput','compositionstart','compositionend']) hostDocument.addEventListener(type, handleClawdComposerEdit, true);
      hostDocument.addEventListener("input", handleComposerInput, !0);
      hostDocument.addEventListener("visibilitychange", noteCcVisibility, {
        passive: !0
      });
      hostDocument.addEventListener("visibilitychange", recoverStalledFrame, {
        passive: !0
      });
      hostDocument.addEventListener("pointerdown", handleComposerFocusGesture, !0);
      hostDocument.addEventListener("touchstart", handleComposerFocusGesture, {
        capture: !0,
        passive: !0
      });
      hostDocument.addEventListener("focusin", handleFocusIn, !0);
      hostDocument.addEventListener("focusout", handleFocusOut, !0);
      hostWindow.visualViewport?.addEventListener("resize", handleViewportChange, {
        passive: !0
      });
      hostWindow.visualViewport?.addEventListener("scroll", handleViewportChange, {
        passive: !0
      });
      startMobileKeyboardPoll();
      scheduleRefresh();
    });
    $(window).on("pagehide", destroy);
  })();
} else console.info("[Claude Web] 已在设置面板里关闭，只加载设置面板本身。");

(() => {
  "use strict";
  const PANEL_ID = "claude-web-settings";
  const VARIANTS = [ {
    value: "day",
    label: "日间"
  }, {
    value: "night",
    label: "夜间"
  } ];
  const AUTO_THEME_MODES = [ {
    value: "manual",
    label: "关闭（手动）"
  }, {
    value: "system",
    label: "跟随手机系统"
  }, {
    value: "time",
    label: "按时间自动切换"
  } ];
  const FONTS = [ {
    value: "follow",
    label: "跟风格（默认）"
  }, {
    value: "songti",
    label: "思源宋（正文衬线）"
  }, {
    value: "heiti",
    label: "思源黑（全站黑体）"
  }, {
    value: "system",
    label: "系统无衬线（不加载网络字体）"
  }, {
    value: "device",
    label: "跟随设备/系统"
  }, {
    value: "custom",
    label: "自定义（下方填写）"
  }, {
    value: "native",
    label: "关掉（用酒馆原生字体）"
  } ];
  const FONT_VALUES = FONTS.map(f => f.value);
  const LAYOUTS = [ {
    value: "auto",
    label: "自动（跨 700px 自动切换）"
  }, {
    value: "pc",
    label: "桌面"
  }, {
    value: "mobile",
    label: "手机"
  } ];
  function read(key, allowed, fallback) {
    try {
      const raw = window.localStorage.getItem("claude-web:" + key);
      return allowed.includes(raw) ? raw : fallback;
    } catch {
      return fallback;
    }
  }
  function write(key, value) {
    try {
      window.localStorage.setItem("claude-web:" + key, value);
      return !0;
    } catch (error) {
      console.warn("[Claude Web] 设置写入失败：", error);
      return !1;
    }
  }
  function readClock(key, fallback) {
    try {
      const value = window.localStorage.getItem("claude-web:" + key);
      return /^([01]\d|2[0-3]):[0-5]\d$/.test(value || "") ? value : fallback;
    } catch {
      return fallback;
    }
  }
  function readNumber(key, fallback, min, max) {
    try {
      const value = Number(window.localStorage.getItem("claude-web:" + key));
      if (!Number.isFinite(value)) return fallback;
      return Math.min(max, Math.max(min, value));
    } catch {
      return fallback;
    }
  }
  function clockMinutes(value) {
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
  }
  function resolveAutomaticVariant(mode, dayClock, nightClock, manual) {
    if (mode === "system") try {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "day";
    } catch {
      return manual;
    }
    if (mode === "time") {
      const dayStart = clockMinutes(dayClock);
      const nightStart = clockMinutes(nightClock);
      if (dayStart === nightStart) return manual;
      const now = new Date;
      const minute = now.getHours() * 60 + now.getMinutes();
      const isDay = dayStart < nightStart ? minute >= dayStart && minute < nightStart : minute >= dayStart || minute < nightStart;
      return isDay ? "day" : "night";
    }
    return manual;
  }
  const enabled = CLAUDE_ENABLED;
  (function() {
    const root = document.documentElement;
    delete root.dataset.claudeArchive;
    delete root.dataset.claudeArchiveGhost;
    try {
      window.localStorage.getItem("claude-web:family") === "archive" && window.localStorage.setItem("claude-web:family", "anthropic");
      window.localStorage.removeItem("claude-web:style");
      window.localStorage.removeItem("claude-web:ghost");
    } catch {}
  })();
  function resolveLayout(choice) {
    if (choice !== "auto") return choice;
    return claudeDetectPhone() || window.matchMedia?.("(max-width:700px)").matches ? "mobile" : "pc";
  }
  function applyVariantLive(variant) {
    const link = document.getElementById("claude-integrated-theme-live-style");
    if (!(link instanceof HTMLLinkElement)) return !1;
    const layout = resolveLayout(read("layout", [ "auto", "pc", "mobile" ], "auto"));
    const base = CLAUDE_EXTENSION_BASE;
    const styleUrl = new URL(`styles/${variant}-${layout}.css`, base);
    styleUrl.searchParams.set("v", CLAUDE_KEYBOARD_BUILD.id);
    const previousHref = link.getAttribute("href");
    const previousVariant = document.documentElement.dataset.claudeIntegratedTheme;
    const revertOnFailure = () => {
      previousHref && link.setAttribute("href", previousHref);
      document.documentElement.dataset.claudeIntegratedTheme = previousVariant;
      previousVariant && window.__claudeIntegratedTheme?.applyVariant?.(previousVariant);
      hostToast?.("主题切换失败，已保留原主题。");
    };
    link.addEventListener("error", revertOnFailure, {
      once: !0
    });
    link.addEventListener("load", () => link.removeEventListener("error", revertOnFailure), {
      once: !0
    });
    link.setAttribute("href", styleUrl.href);
    document.documentElement.dataset.claudeIntegratedTheme = variant;
    window.__claudeIntegratedTheme?.applyVariant?.(variant);
    return !0;
  }
  function hostToast(message) {
    try {
      window.toastr?.info?.(message, "Claude Web");
    } catch {}
  }
  function buildPanel() {
    const wrapper = document.createElement("div");
    wrapper.id = PANEL_ID;
    wrapper.innerHTML = `\n      <style>\n        /* 主题自己那 2400 多处 !important 会把按钮压成窄条，文字于是竖着排。\n           这里用 id 提高特异性把它抢回来。 */\n        #${PANEL_ID}, #${PANEL_ID} * { box-sizing:border-box; }\n        #${PANEL_ID} .menu_button {\n          display:inline-flex !important;\n          align-items:center !important;\n          justify-content:center !important;\n          width:auto !important;\n          min-width:0 !important;\n          max-width:none !important;\n          flex:0 0 auto !important;\n          white-space:nowrap !important;\n          writing-mode:horizontal-tb !important;\n          padding:5px 12px !important;\n          line-height:1.4 !important;\n        }\n        #${PANEL_ID} select.text_pole {\n          display:block !important;\n          width:100% !important;\n        }\n        #${PANEL_ID} label { display:block; margin-bottom:3px; }\n        #${PANEL_ID} .claude-web-auto-theme {\n          margin:0 0 10px; padding:9px; border:1px solid color-mix(in srgb,currentColor 16%,transparent);\n          border-radius:10px;\n        }\n        #${PANEL_ID} .claude-web-auto-times {\n          display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:7px;\n        }\n        #${PANEL_ID} .claude-web-auto-times input[type="time"] {\n          display:block !important; width:100% !important; min-width:0 !important;\n        }\n        /* 取色器一行两个。酒馆的设置栏很窄，三个一行色块会小到点不准。 */\n        #${PANEL_ID} .claude-web-swatches {\n          display:grid; grid-template-columns:1fr 1fr; gap:5px 8px; margin-top:8px;\n        }\n        #${PANEL_ID} .claude-web-swatch {\n          display:flex !important; align-items:center; gap:6px;\n          margin:0 !important; font-size:0.9em; min-width:0;\n        }\n        /* 酒馆给 input 的通用样式会把颜色块拉成一条细线，这里全量覆盖。 */\n        #${PANEL_ID} .claude-web-swatch input[type="color"] {\n          width:30px !important; height:22px !important;\n          flex:0 0 auto !important; padding:0 !important; border:none !important;\n          background:none !important; cursor:pointer;\n        }\n        #${PANEL_ID} .claude-web-swatch span {\n          overflow:hidden; text-overflow:ellipsis; white-space:nowrap;\n        }\n        #${PANEL_ID} .claude-web-master {\n          display:flex !important; align-items:center; gap:7px;\n          margin:0 !important; padding:10px 11px;\n          border:1px solid color-mix(in srgb,currentColor 16%,transparent);\n          border-radius:10px;\n        }\n        #${PANEL_ID} .claude-web-master input { flex:0 0 auto; }\n        #${PANEL_ID} .claude-web-sections {\n          display:grid; gap:7px; margin-top:10px;\n        }\n        #${PANEL_ID} .claude-web-section {\n          margin:0; border:1px solid color-mix(in srgb,currentColor 14%,transparent);\n          border-radius:10px; overflow:hidden;\n          background:color-mix(in srgb,currentColor 2.5%,transparent);\n        }\n        #${PANEL_ID} .claude-web-section > summary {\n          display:flex; align-items:center; gap:8px;\n          min-height:38px; padding:8px 10px; cursor:pointer; user-select:none;\n          list-style:none; font-weight:600;\n        }\n        #${PANEL_ID} .claude-web-section > summary::-webkit-details-marker { display:none; }\n        #${PANEL_ID} .claude-web-section > summary::after {\n          content:"\\f078"; flex:0 0 auto; margin-left:2px;\n          font-family:"Font Awesome 6 Free","Font Awesome 5 Free" !important;\n          font-weight:900; font-size:.72em; opacity:.55;\n          transition:transform .16s ease;\n        }\n        #${PANEL_ID} .claude-web-section[open] > summary::after { transform:rotate(180deg); }\n        #${PANEL_ID} .claude-web-section-summary {\n          flex:1 1 auto; min-width:0; overflow:hidden;\n          color:inherit; font-size:.84em; font-weight:400; opacity:.62;\n          text-align:right; text-overflow:ellipsis; white-space:nowrap;\n        }\n        #${PANEL_ID} .claude-web-section-body {\n          padding:10px; border-top:1px solid color-mix(in srgb,currentColor 11%,transparent);\n        }\n        #${PANEL_ID} .claude-web-field + .claude-web-field { margin-top:9px; }\n        #${PANEL_ID} .claude-web-check {\n          display:flex !important; align-items:center; gap:7px; margin:0 !important;\n          min-height:28px;\n        }\n        #${PANEL_ID} .claude-web-check + .claude-web-check { margin-top:3px !important; }\n        #${PANEL_ID} .claude-web-suboptions {\n          margin:6px 0 0 22px; padding-left:9px;\n          border-left:2px solid color-mix(in srgb,currentColor 13%,transparent);\n        }\n        #${PANEL_ID} .claude-web-range {\n          display:grid; grid-template-columns:auto minmax(70px,1fr) 3em;\n          align-items:center; gap:8px; margin-top:7px;\n        }\n        #${PANEL_ID} .claude-web-range > span:first-child {\n          font-size:.9em; opacity:.75; white-space:nowrap;\n        }\n        #${PANEL_ID} .claude-web-range > span:last-child {\n          width:3em; font-size:.9em; opacity:.75; text-align:right;\n        }\n        #${PANEL_ID} .claude-web-help {\n          margin-top:5px; font-size:.85em; opacity:.62; line-height:1.5;\n        }\n        #${PANEL_ID} .claude-web-actions {\n          display:flex; gap:6px; flex-wrap:wrap; margin-top:7px;\n        }\n        #${PANEL_ID} [hidden] { display:none !important; }\n      </style>\n      <div class="inline-drawer">\n        <div class="inline-drawer-toggle inline-drawer-header">\n          <b>Claude Web</b>\n          <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>\n        </div>\n        <div class="inline-drawer-content">\n          <label class="checkbox_label claude-web-master">\n            <input id="claude-web-enabled" type="checkbox">\n            <span><b>启用 Claude Web</b></span>\n          </label>\n          <div id="claude-web-enabled-hint"\n               style="margin:6px 2px 0;font-size:0.9em;opacity:.75;line-height:1.5"></div>\n\n          <div class="claude-web-sections">\n            <details class="claude-web-section" id="claude-web-section-appearance" open>\n              <summary>\n                <span>外观</span>\n                <span class="claude-web-section-summary" id="claude-web-summary-appearance"></span>\n              </summary>\n              <div class="claude-web-section-body">\n                <div id="claude-web-full-appearance" class="claude-web-field">\n                <div class="claude-web-field">\n                  <label for="claude-web-preset">Claude 风格预设</label>\n                  <select id="claude-web-preset" class="text_pole"></select>\n                </div>\n\n                <div class="claude-web-field claude-web-auto-theme">\n                  <label for="claude-web-theme-auto"><b>主题切换</b></label>\n                  <select id="claude-web-theme-auto" class="text_pole"></select>\n                  <div id="claude-web-auto-times" class="claude-web-auto-times" hidden>\n                    <label>日间开始<input id="claude-web-day-start" type="time" class="text_pole" value="07:00"></label>\n                    <label>夜间开始<input id="claude-web-night-start" type="time" class="text_pole" value="19:00"></label>\n                  </div>\n                  <div id="claude-web-auto-hint" class="claude-web-help"></div>\n                </div>\n\n                <div class="claude-web-field">\n                  <label for="claude-web-variant">当前明暗</label>\n                  <select id="claude-web-variant" class="text_pole"></select>\n                </div>\n\n                <div class="claude-web-field">\n                  <label for="claude-web-font">字体</label>\n                  <select id="claude-web-font" class="text_pole"></select>\n                  <input id="claude-web-font-custom" class="text_pole" style="margin-top:6px;display:none"\n                         placeholder='自定义 font-family，例如："LXGW WenKai", serif'>\n                </div>\n\n                <label class="checkbox_label claude-web-check claude-web-field">\n                  <input id="claude-web-quote-body-color" type="checkbox">\n                  <span>引号内文字变色</span>\n                </label>\n                <div class="claude-web-help">开启时使用主题引号色，关闭时跟随正文颜色。</div>\n\n                <details id="claude-web-colors" class="claude-web-field">\n                  <summary style="cursor:pointer;user-select:none;opacity:.85">自定义配色</summary>\n                  <div id="claude-web-swatches" class="claude-web-swatches"></div>\n                  <div class="claude-web-help">改动存进「我的配色」，日间和夜间各存一套，其余颜色自动推导。</div>\n                </details>\n\n                <div class="claude-web-actions">\n                  <button id="claude-web-export" class="menu_button">导出</button>\n                  <button id="claude-web-import" class="menu_button">导入</button>\n                  <button id="claude-web-reset" class="menu_button">清除自定义</button>\n                </div>\n                <input id="claude-web-import-file" type="file" accept="application/json,.json" style="display:none">\n                <div id="claude-web-preset-hint" class="claude-web-help"></div>\n                </div>\n              </div>\n            </details>\n\n            <details class="claude-web-section" id="claude-web-section-layout">\n              <summary>\n                <span>布局</span>\n                <span class="claude-web-section-summary" id="claude-web-summary-layout"></span>\n              </summary>\n              <div class="claude-web-section-body">\n                <div class="claude-web-field">\n                  <label for="claude-web-layout">设备布局</label>\n                  <select id="claude-web-layout" class="text_pole"></select>\n                </div>\n                <div class="claude-web-field">\n                  <label for="claude-web-recents-size">侧栏「最近」大小</label>\n                  <select id="claude-web-recents-size" class="text_pole">\n                    <option value="s">紧凑</option>\n                    <option value="m">标准</option>\n                    <option value="l">大</option>\n                    <option value="xl">特大</option>\n                  </select>\n                  <div class="claude-web-help">头像、名字和行高一起变，电脑和手机都生效。</div>\n                </div>\n                <label class="checkbox_label claude-web-check claude-web-field">\n                  <input type="checkbox" id="claude-web-avatars">\n                  <span>显示头像</span>\n                </label>\n                <label class="checkbox_label claude-web-check claude-web-field" title="关掉后，回复下方操作栏里的 ‹ › 仍然可以切换回复">\n                  <input type="checkbox" id="claude-web-side-swipe">\n                  <span>回复两侧的左右切换箭头</span>\n                </label>\n                <div id="claude-web-hint" class="claude-web-help"></div>\n              </div>\n            </details>\n\n            <details class="claude-web-section" id="claude-web-section-clawd">\n              <summary>\n                <span>Clawd</span>\n                <span class="claude-web-section-summary" id="claude-web-summary-clawd"></span>\n              </summary>\n              <div class="claude-web-section-body">\n                <label class="checkbox_label claude-web-check">\n                  <input type="checkbox" id="claude-web-clawd">\n                  <span>显示 Clawd</span>\n                </label>\n                <div id="claude-web-clawd-options" class="claude-web-suboptions">\n                  <label class="checkbox_label claude-web-check">\n                    <input id="claude-web-motion" type="checkbox">\n                    <span>启用状态动画</span>\n                  </label>\n                  <label class="checkbox_label claude-web-check">\n                    <input id="claude-web-decorations" type="checkbox">\n                    <span>启用粒子与提示气泡</span>\n                  </label>\n                  <label class="checkbox_label claude-web-check">\n                    <input id="claude-web-gen-timer" type="checkbox">\n                    <span>显示生成计时器</span>\n                  </label>\n                </div>\n              </div>\n            </details>\n\n            <details class="claude-web-section" id="claude-web-section-background">\n              <summary>\n                <span>背景</span>\n                <span class="claude-web-section-summary" id="claude-web-summary-background"></span>\n              </summary>\n              <div class="claude-web-section-body">\n                <label class="checkbox_label claude-web-check">\n                  <input id="claude-web-bg-transparent" type="checkbox">\n                  <span>背景透传</span>\n                </label>\n                <div class="claude-web-help">显示酒馆背景，而不是 Claude 的白底或黑底。</div>\n\n                <label class="checkbox_label claude-web-check" style="margin-top:8px !important">\n                  <input id="claude-web-bg-blur" type="checkbox">\n                  <span>背景毛玻璃</span>\n                </label>\n                <div id="claude-web-bg-blur-options" class="claude-web-suboptions">\n                  <div class="claude-web-range">\n                    <span>浓度</span>\n                    <input id="claude-web-bg-blur-opacity" type="range" min="8" max="60" step="1">\n                    <span id="claude-web-bg-blur-opacity-value"></span>\n                  </div>\n                </div>\n\n                <label class="checkbox_label claude-web-check" style="margin-top:10px !important">\n                  <input id="claude-web-bg-image-blur" type="checkbox">\n                  <span>背景图模糊</span>\n                </label>\n                <div id="claude-web-bg-image-options" class="claude-web-suboptions">\n                  <div class="claude-web-range">\n                    <span>模糊半径</span>\n                    <input id="claude-web-bg-image-blur-radius" type="range" min="0" max="32" step="1">\n                    <span id="claude-web-bg-image-blur-radius-value"></span>\n                  </div>\n                  <div class="claude-web-range">\n                    <span>背景压暗</span>\n                    <input id="claude-web-bg-image-dim" type="range" min="0" max="70" step="1">\n                    <span id="claude-web-bg-image-dim-value"></span>\n                  </div>\n                </div>\n              </div>\n            </details>\n\n            <details class="claude-web-section" id="claude-web-section-about">\n              <summary>\n                <span>关于与更新</span>\n                <span class="claude-web-section-summary">版本与维护</span>\n              </summary>\n              <div class="claude-web-section-body">\n                <div class="claude-web-actions" style="margin-top:0">\n                  <button id="claude-web-update" class="menu_button">检查更新</button>\n                  <button id="claude-web-reinstall" class="menu_button">重新安装</button>\n                </div>\n                <div id="claude-web-update-hint" class="claude-web-help"></div>\n                <div id="claude-web-build" class="claude-web-help" style="opacity:.55;word-break:break-all"></div>\n              </div>\n            </details>\n          </div>\n        </div>\n      </div>\n    `;
    return wrapper;
  }
  const REPO_URL = "https://github.com/claudenoshujin/claude-web";
  function folderName() {
    try {
      const base = CLAUDE_EXTENSION_BASE;
      return decodeURIComponent(new URL(base).pathname.replace(/\/+$/, "").split("/").pop() || "");
    } catch {
      return "claude-web";
    }
  }
  function requestHeaders() {
    const context = window.SillyTavern?.getContext?.();
    return typeof context?.getRequestHeaders === "function" ? context.getRequestHeaders() : {
      "Content-Type": "application/json"
    };
  }
  function post(url, body) {
    return fetch(url, {
      method: "POST",
      headers: requestHeaders(),
      body: JSON.stringify(body)
    });
  }
  async function locate(folder) {
    for (const global of [ !1, !0 ]) {
      const response = await post("/api/extensions/version", {
        extensionName: folder,
        global: global
      });
      if (response.status !== 404) return {
        global: global,
        response: response
      };
    }
    return {
      global: null,
      response: null
    };
  }
  async function runUpdate(button, hint) {
    const folder = folderName();
    button.disabled = !0;
    hint.textContent = `正在检查 ${folder}…`;
    try {
      const found = await locate(folder);
      if (found.global === null) {
        hint.textContent = `两个扩展目录里都没找到 ${folder}。用「Install extension」按地址装一次就好了。`;
        return;
      }
      const response = await post("/api/extensions/update", {
        extensionName: folder,
        global: found.global
      });
      if (!response.ok) {
        hint.innerHTML = `更新接口返回 HTTP ${response.status}。<br>1.18 的更新接口要调系统装的 <code>git</code> 命令（安装接口不用），所以「装得上但更新报 500」通常是这台机器没装 git；浅克隆的仓库 pull 失败也会是同一个码。<br>用下面的「重新安装」绕过去 —— 它走的是安装接口，不需要 git 命令。`;
        return;
      }
      const data = await response.json();
      if (data?.isUpToDate) {
        hint.textContent = `已经是最新的（${data.shortCommitHash ?? ""}）。`;
        return;
      }
      hint.innerHTML = `已更新到 ${data?.shortCommitHash ?? "新版本"}。 <button id="claude-web-update-reload" class="menu_button" style="margin-left:6px">刷新生效</button>`;
      hint.querySelector("#claude-web-update-reload")?.addEventListener("click", () => window.location.reload(), {
        once: !0
      });
    } catch (error) {
      hint.textContent = `更新失败：${error && error.message}`;
    } finally {
      button.disabled = !1;
    }
  }
  async function runReinstall(button, hint) {
    const folder = folderName();
    const ctx = window.SillyTavern?.getContext?.();
    const ok = typeof ctx?.callGenericPopup === "function" && ctx.POPUP_TYPE ? await ctx.callGenericPopup(`<h3>重新安装扩展？</h3><p>将删除扩展目录 ${folder} 后重新从 GitHub 安装。配色和明暗设置存在浏览器里，不会丢失。</p>`, ctx.POPUP_TYPE.CONFIRM, "", {
      okButton: "重新安装",
      cancelButton: "取消"
    }) : window.confirm(`将删除扩展目录 ${folder} 后重新从 GitHub 安装。\n配色和明暗设置存在浏览器里，不会丢失。\n\n继续？`);
    if (!ok) return;
    button.disabled = !0;
    hint.textContent = "正在定位扩展目录…";
    try {
      const found = await locate(folder);
      if (found.global === null) hint.textContent = `两个扩展目录里都没找到 ${folder}，无需删除，直接装即可。`; else {
        hint.textContent = "正在删除旧版本…";
        const removed = await post("/api/extensions/delete", {
          extensionName: folder,
          global: found.global
        });
        if (!removed.ok) {
          hint.textContent = `删除失败：HTTP ${removed.status}。没有改动任何东西。`;
          return;
        }
      }
      hint.textContent = "正在安装最新版本…";
      const installed = await post("/api/extensions/install", {
        url: REPO_URL,
        global: found.global === !0
      });
      if (!installed.ok) {
        hint.innerHTML = `安装失败：HTTP ${installed.status}。<br>旧版本已经删掉了，请在「管理扩展 → Install extension」里手动装一次：<br><code>${REPO_URL}</code>`;
        return;
      }
      const data = await installed.json().catch(() => null);
      hint.innerHTML = `已装上 ${data?.version ?? "最新版本"}。 <button id="claude-web-update-reload" class="menu_button" style="margin-left:6px">刷新生效</button>`;
      hint.querySelector("#claude-web-update-reload")?.addEventListener("click", () => window.location.reload(), {
        once: !0
      });
    } catch (error) {
      hint.textContent = `重装失败：${error && error.message}`;
    } finally {
      button.disabled = !1;
    }
  }
  function fillSelect(select, options, current) {
    select.textContent = "";
    for (const option of options) {
      const node = document.createElement("option");
      node.value = option.value;
      node.textContent = option.label;
      option.value === current && (node.selected = !0);
      select.append(node);
    }
  }
  let syncSwatchesRef = () => {};
  let syncPanelPresentationRef = () => {};
  const SWATCH_LABELS = {
    "--cw-paper-0": "背景",
    "--cw-paper-1": "卡片",
    "--cw-paper-2": "次级面",
    "--cw-paper-3": "分区块",
    "--cw-ink-0": "正文",
    "--cw-ink-1": "次要字",
    "--cw-ink-2": "弱化字",
    "--cw-ink-3": "最淡线",
    "--cw-clay": "强调色"
  };
  const HEX = /^#[0-9a-fA-F]{6}$/;
  function mountPresets(panel) {
    const api = window.__claudeWebPresets;
    const select = panel.querySelector("#claude-web-preset");
    const hint = panel.querySelector("#claude-web-preset-hint");
    const fileInput = panel.querySelector("#claude-web-import-file");
    const swatchBox = panel.querySelector("#claude-web-swatches");
    if (!api) {
      select.disabled = !0;
      hint.textContent = "预设模块没加载上。";
      return;
    }
    const swatches = new Map;
    function syncSwatches() {
      if (!api.customCore) return;
      const core = api.customCore();
      for (const [key, input] of swatches) {
        const value = core[key];
        typeof value === "string" && HEX.test(value) && (input.value = value);
      }
    }
    if (api.customCore && api.setCustomColor && swatchBox) {
      for (const key of api.coreKeys()) {
        const row = document.createElement("label");
        row.className = "claude-web-swatch";
        const input = document.createElement("input");
        input.type = "color";
        const text = document.createElement("span");
        text.textContent = SWATCH_LABELS[key] ?? key;
        row.append(input, text);
        swatchBox.append(row);
        swatches.set(key, input);
        input.addEventListener("input", () => {
          api.setCustomColor(key, input.value);
          select.value !== api.customId() && (select.value = api.customId());
          hint.textContent = "已存进「我的配色」。";
        });
      }
      syncSwatches();
    } else swatchBox && (swatchBox.textContent = "当前版本不支持自定义配色。");
    fillSelect(select, api.families().map(item => ({
      value: item.id,
      label: item.name
    })), api.currentFamily());
    select.addEventListener("change", () => {
      const preset = api.activateFamily(select.value);
      document.documentElement.dataset.claudeSkin = "classic";
      write("skin", "classic");
      syncPanelPresentationRef();
      syncSwatches();
      hint.textContent = preset ? `已切到「${preset.name}」。` : "切换失败。";
    });
    syncSwatchesRef = syncSwatches;
    panel.querySelector("#claude-web-export").addEventListener("click", () => {
      try {
        const data = api.exportCurrent();
        const blob = new Blob([ JSON.stringify(data, null, 2) ], {
          type: "application/json"
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `[ClaudeWeb] ${data.name}.json`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1e3);
        hint.textContent = "已导出。";
      } catch (error) {
        hint.textContent = `导出失败：${error && error.message}`;
      }
    });
    panel.querySelector("#claude-web-import").addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      try {
        const result = api.importPreset(await file.text());
        select.value = api.customId();
        syncSwatches();
        hint.textContent = result.rejected.length ? `已装进「我的配色」${result.applied} 项，忽略了 ${result.rejected.length} 个不在白名单里的键。` : `已装进「我的配色」${result.applied} 项。`;
      } catch (error) {
        hint.textContent = `导入失败：${error && error.message}`;
      } finally {
        fileInput.value = "";
      }
    });
    panel.querySelector("#claude-web-reset").addEventListener("click", () => {
      const preset = api.clearCustom();
      preset && (select.value = api.currentFamily());
      syncSwatches();
      hint.textContent = preset ? `自定义已清除，回到「${preset.name}」。` : "自定义已清除。";
    });
  }
  function teardownLive() {
    try {
      CLAUDE_ENABLED = false;
      document.documentElement.dataset.claudeEnabled = 'off';
      window.removeEventListener('load', startOfficialLayout);
      window.__claudeOfficialLayout?.destroy();
      delete window.__claudeOfficialLayout;
      officialStyle.remove();
      const sheet = document.getElementById("claude-integrated-theme-live-style");
      sheet && (sheet.disabled = !0);
      const root = document.documentElement;
      delete root.dataset.claudeArchive;
      delete root.dataset.claudeArchiveGhost;
      delete root.dataset.claudeIntegratedTheme;
      const api = window.__claudeWebPresets;
      if (api && api.coreKeys) for (const key of api.coreKeys()) root.style.removeProperty(key);
      return !0;
    } catch (error) {
      console.warn("[Claude Web] 停用时清理失败：", error);
      return !1;
    }
  }
  function themeRestoreFailureHint() {
    let retained = false;
    try { retained = !!localStorage.getItem("claude-integrated-theme-restore:v2"); } catch {}
    const record = retained ? "恢复记录已保留。" : "恢复记录未能保留，刷新后无法自动重试。";
    const pending = window.__claudeThemeSavePending ? "仅停止等待，原生请求可能仍在进行；请等待请求结束再刷新重试。" : "请检查连接后刷新重试。";
    return "CW 已关闭，但原生主题恢复尚未保存。" + record + pending + (window.__claudeThemeRestoreError || "");
  }
  function mountEnabled(panel) {
    const box = panel.querySelector("#claude-web-enabled");
    const hint = panel.querySelector("#claude-web-enabled-hint");
    if (!box) return;
    box.checked = enabled;
    window.__claudeThemeRecovery?.then(recovered => { if (!recovered && hint) hint.textContent = themeRestoreFailureHint(); });
    (() => {
      hint.textContent = box.checked ? "" : "已关闭。酒馆恢复原生界面，下面的设置暂时不起作用。";
    })();
    box.addEventListener("change", async () => {
      if (window.__claudeSafety) {
        const safety = window.__claudeSafety;
        if (safety.busy) {
          box.checked = safety.state?.enabled === true;
          hint.textContent = "安全操作正在进行，请等待当前操作结束。";
          return;
        }
        const wanted = box.checked;
        try { await (wanted ? safety.enable() : safety.disable()); }
        catch (error) { hint.textContent = "操作尚未完成：" + error.message; }
        box.checked = safety.state?.enabled === true;
        return;
      }
      if (window.__claudeThemeSavePending) {
        box.checked = false;
        hint.textContent = themeRestoreFailureHint();
        return;
      }
      if (!write("enabled", box.checked ? "on" : "off")) {
        hint.textContent = "写入失败，设置没保存。";
        box.checked = enabled;
    window.__claudeThemeRecovery?.then(recovered => { if (!recovered && hint) hint.textContent = themeRestoreFailureHint(); });
        return;
      }
      if (box.checked) {
        if (window.__claudeSafety) { await window.__claudeSafety.enable(); return; }
        hint.textContent = "正在启用，刷新中…";
        window.location.reload();
        return;
      }
      window.__claudeSafety?.markOff();
      box.disabled = true;
      hint.textContent = "正在关闭，保存原生主题…";
      const result = window.__claudeIntegratedTheme?.destroy?.({restore: true});
      teardownLive();
      try {
        if (await result === false) throw new Error("主题保存未确认");
        hint.textContent = "已关闭，刷新中…";
        window.location.reload();
      } catch (error) {
        hint.textContent = themeRestoreFailureHint();
        box.disabled = false;
      }
    });
  }
  function mount(host) {
    if (document.getElementById(PANEL_ID)) return;
    const panel = buildPanel();
    host.append(panel);
    mountEnabled(panel);
    const variantSelect = panel.querySelector("#claude-web-variant");
    const layoutSelect = panel.querySelector("#claude-web-layout");
    const hint = panel.querySelector("#claude-web-hint");
    const autoSelect = panel.querySelector("#claude-web-theme-auto");
    const autoTimes = panel.querySelector("#claude-web-auto-times");
    const autoHint = panel.querySelector("#claude-web-auto-hint");
    const dayStartInput = panel.querySelector("#claude-web-day-start");
    const nightStartInput = panel.querySelector("#claude-web-night-start");
    const variant = read("variant", [ "day", "night" ], "day");
    const layout = read("layout", [ "auto", "pc", "mobile" ], "auto");
    const autoMode = read("theme-auto", [ "manual", "system", "time" ], "manual");
    fillSelect(variantSelect, VARIANTS, variant);
    fillSelect(layoutSelect, LAYOUTS, layout);
    fillSelect(autoSelect, AUTO_THEME_MODES, autoMode);
    dayStartInput.value = readClock("theme-day-start", "07:00");
    nightStartInput.value = readClock("theme-night-start", "19:00");
    const describe = () => {
      const effective = resolveLayout(layoutSelect.value);
      hint.textContent = "当前生效：" + (layoutSelect.value === "auto" ? "自动 → " + (effective === "mobile" ? "手机" : "桌面") : effective === "mobile" ? "手机" : "桌面");
    };
    describe();
    const applyVariant = nextVariant => {
      variantSelect.value = nextVariant;
      if (!write("variant", nextVariant)) return;
      const ok = applyVariantLive(nextVariant);
      const api = window.__claudeWebPresets;
      api && api.activateFamily(api.currentFamily());
      syncSwatchesRef();
      hint.textContent = ok ? "" : "主题已保存，刷新后生效。";
      ok && describe();
      syncPanelPresentationRef();
    };
    variantSelect.addEventListener("change", () => applyVariant(variantSelect.value));
    const systemTheme = window.matchMedia?.("(prefers-color-scheme: dark)");
    const syncAutomaticTheme = () => {
      const mode = autoSelect.value;
      const automatic = mode !== "manual";
      variantSelect.disabled = automatic;
      autoTimes.hidden = mode !== "time";
      if (!automatic) {
        autoHint.textContent = "自动切换已关闭。";
        return;
      }
      const next = resolveAutomaticVariant(mode, dayStartInput.value || "07:00", nightStartInput.value || "19:00", variantSelect.value);
      next !== variantSelect.value && applyVariant(next);
      autoHint.textContent = mode === "system" ? "跟随系统 · 当前" + (next === "night" ? "夜间" : "日间") : `${dayStartInput.value} 日间 / ${nightStartInput.value} 夜间 · 当前${next === "night" ? "夜间" : "日间"}`;
      syncPanelPresentationRef();
    };
    autoSelect.addEventListener("change", () => {
      if (!write("theme-auto", autoSelect.value)) return;
      syncAutomaticTheme();
    });
    for (const [input, key] of [ [ dayStartInput, "theme-day-start" ], [ nightStartInput, "theme-night-start" ] ]) input.addEventListener("change", () => {
      if (!write(key, input.value)) return;
      syncAutomaticTheme();
    });
    const onSystemThemeChange = () => {
      autoSelect.value === "system" && syncAutomaticTheme();
    };
    typeof systemTheme?.addEventListener === "function" ? systemTheme.addEventListener("change", onSystemThemeChange) : typeof systemTheme?.addListener === "function" && systemTheme.addListener(onSystemThemeChange);
    window.setInterval(() => {
      autoSelect.value === "time" && syncAutomaticTheme();
    }, 3e4);
    syncAutomaticTheme();
    const clawdBox = panel.querySelector("#claude-web-clawd");
    clawdBox.checked = read("clawd", [ "on", "off" ], "on") !== "off";
    clawdBox.addEventListener("change", () => {
      if (!write("clawd", clawdBox.checked ? "on" : "off")) return;
      document.documentElement.dataset.claudeClawd = clawdBox.checked ? "on" : "off";
      window.__claudeClawdInteraction?.refresh?.();
      syncPanelPresentationRef();
    });
    const recentsSel = panel.querySelector("#claude-web-recents-size");
    recentsSel.value = read("recents-size", [ "s", "m", "l", "xl" ], "xl");
    recentsSel.addEventListener("change", () => {
      if (!write("recents-size", recentsSel.value)) return;
      document.documentElement.dataset.claudeRecents = recentsSel.value;
    });
    const avatarsBox = panel.querySelector("#claude-web-avatars");
    avatarsBox.checked = read("avatars", [ "on", "off" ], "on") !== "off";
    avatarsBox.addEventListener("change", () => {
      if (!write("avatars", avatarsBox.checked ? "on" : "off")) return;
      document.documentElement.dataset.claudeAvatars = avatarsBox.checked ? "on" : "off";
      syncPanelPresentationRef();
    });
    const sideSwipeBox = panel.querySelector("#claude-web-side-swipe");
    sideSwipeBox.checked = read("side-swipe", [ "on", "off" ], "on") !== "off";
    sideSwipeBox.addEventListener("change", () => {
      if (!write("side-swipe", sideSwipeBox.checked ? "on" : "off")) return;
      document.documentElement.dataset.claudeSideSwipe = sideSwipeBox.checked ? "on" : "off";
    });
    const fontSelect = panel.querySelector("#claude-web-font");
    const fontCustom = panel.querySelector("#claude-web-font-custom");
    const syncCustomBox = () => {
      fontCustom.style.display = fontSelect.value === "custom" ? "" : "none";
    };
    fillSelect(fontSelect, FONTS, read("font", FONT_VALUES, "follow"));
    try {
      fontCustom.value = window.localStorage.getItem("claude-web:fontCustom") || "";
    } catch {}
    syncCustomBox();
    fontSelect.addEventListener("change", () => {
      if (!write("font", fontSelect.value)) return;
      document.documentElement.dataset.claudeFont = fontSelect.value;
      syncCustomBox();
      const hit = FONTS.find(f => f.value === fontSelect.value);
      hint.textContent = "字体已切到「" + (hit ? hit.label : fontSelect.value) + "」。";
    });
    fontCustom.addEventListener("input", () => {
      const v = fontCustom.value.trim();
      try {
        window.localStorage.setItem("claude-web:fontCustom", v);
      } catch {}
      v ? document.documentElement.style.setProperty("--cw-font-custom", v) : document.documentElement.style.removeProperty("--cw-font-custom");
    });
    const quoteBodyColorBox = panel.querySelector("#claude-web-quote-body-color");
    quoteBodyColorBox.checked = read("quoteBodyColor", [ "on", "off" ], "off") === "off";
    quoteBodyColorBox.addEventListener("change", () => {
      if (!write("quoteBodyColor", quoteBodyColorBox.checked ? "off" : "on")) return;
      document.documentElement.dataset.claudeQuoteBodyColor = quoteBodyColorBox.checked ? "off" : "on";
      const variant = document.documentElement.dataset.claudeIntegratedTheme;
      variant && window.__claudeIntegratedTheme?.applyVariant?.(variant);
      hint.textContent = quoteBodyColorBox.checked ? "引号文字已恢复主题强调色。" : "引号文字已固定为正文颜色。";
    });
    layoutSelect.addEventListener("change", () => {
      if (!write("layout", layoutSelect.value)) return;
      hint.textContent = "正在切换布局…";
      syncPanelPresentationRef();
      window.setTimeout(() => window.location.reload(), 120);
    });
    const motionBox = panel.querySelector("#claude-web-motion");
    const decorationsBox = panel.querySelector("#claude-web-decorations");
    motionBox.checked = read("motion", [ "on", "off" ], "on") !== "off";
    decorationsBox.checked = read("decorations", [ "on", "off" ], "on") !== "off";
    motionBox.addEventListener("change", () => {
      if (!write("motion", motionBox.checked ? "on" : "off")) return;
      document.documentElement.dataset.claudeMotion = motionBox.checked ? "on" : "off";
      syncPanelPresentationRef();
    });
    decorationsBox.addEventListener("change", () => {
      if (!write("decorations", decorationsBox.checked ? "on" : "off")) return;
      document.documentElement.dataset.claudeDecorations = decorationsBox.checked ? "on" : "off";
      syncPanelPresentationRef();
    });
    const genTimerBox = panel.querySelector("#claude-web-gen-timer");
    genTimerBox.checked = read("genTimer", [ "on", "off" ], "on") !== "off";
    genTimerBox.addEventListener("change", () => {
      if (!write("genTimer", genTimerBox.checked ? "on" : "off")) return;
      document.documentElement.dataset.claudeGenTimer = genTimerBox.checked ? "on" : "off";
      syncPanelPresentationRef();
    });
    const bgTransparentBox = panel.querySelector("#claude-web-bg-transparent");
    const bgBlurBox = panel.querySelector("#claude-web-bg-blur");
    bgTransparentBox.checked = read("bgTransparent", [ "on", "off" ], "off") === "on";
    bgBlurBox.checked = read("bgBlur", [ "on", "off" ], "off") === "on";
    bgTransparentBox.addEventListener("change", () => {
      if (!write("bgTransparent", bgTransparentBox.checked ? "on" : "off")) return;
      document.documentElement.dataset.claudeBgTransparent = bgTransparentBox.checked ? "on" : "off";
      if (!bgTransparentBox.checked && bgBlurBox.checked) {
        bgBlurBox.checked = !1;
        write("bgBlur", "off");
        document.documentElement.dataset.claudeBgBlur = "off";
      }
      syncPanelPresentationRef();
    });
    bgBlurBox.addEventListener("change", () => {
      if (!write("bgBlur", bgBlurBox.checked ? "on" : "off")) return;
      document.documentElement.dataset.claudeBgBlur = bgBlurBox.checked ? "on" : "off";
      if (bgBlurBox.checked && !bgTransparentBox.checked) {
        bgTransparentBox.checked = !0;
        write("bgTransparent", "on");
        document.documentElement.dataset.claudeBgTransparent = "on";
      }
      syncPanelPresentationRef();
    });
    const bgBlurOpacitySlider = panel.querySelector("#claude-web-bg-blur-opacity");
    const bgBlurOpacityValue = panel.querySelector("#claude-web-bg-blur-opacity-value");
    const applyBgBlurOpacity = n => {
      const clamped = Math.min(60, Math.max(8, Math.round(n)));
      document.documentElement.style.setProperty("--claude-bg-blur-opacity", `${clamped}%`);
      document.documentElement.style.setProperty("--claude-drawer-tint-opacity", `${Math.max(18, clamped)}%`);
      bgBlurOpacityValue.textContent = `${clamped}%`;
      return clamped;
    };
    {
      const initial = readNumber("bgBlurOpacity", 22, 8, 60);
      bgBlurOpacitySlider.value = String(Math.round(initial));
      applyBgBlurOpacity(Number(bgBlurOpacitySlider.value));
    }
    bgBlurOpacitySlider.addEventListener("input", () => {
      const clamped = applyBgBlurOpacity(Number(bgBlurOpacitySlider.value));
      write("bgBlurOpacity", String(clamped));
    });
    const bgImageBlurBox = panel.querySelector("#claude-web-bg-image-blur");
    bgImageBlurBox.checked = read("bgImageBlur", [ "on", "off" ], "off") !== "off";
    document.documentElement.dataset.claudeBgImageBlur = bgImageBlurBox.checked ? "on" : "off";
    bgImageBlurBox.addEventListener("change", () => {
      if (!write("bgImageBlur", bgImageBlurBox.checked ? "on" : "off")) return;
      document.documentElement.dataset.claudeBgImageBlur = bgImageBlurBox.checked ? "on" : "off";
      syncPanelPresentationRef();
    });
    const bgImageRadius = panel.querySelector("#claude-web-bg-image-blur-radius");
    const bgImageRadiusValue = panel.querySelector("#claude-web-bg-image-blur-radius-value");
    const applyBgImageRadius = n => {
      const clamped = Math.min(32, Math.max(0, Math.round(n)));
      document.documentElement.style.setProperty("--claude-bg-image-blur", `${clamped}px`);
      bgImageRadiusValue.textContent = `${clamped}px`;
      return clamped;
    };
    bgImageRadius.value = String(readNumber("bgImageBlurRadius", 12, 0, 32));
    applyBgImageRadius(Number(bgImageRadius.value));
    bgImageRadius.addEventListener("input", () => {
      write("bgImageBlurRadius", String(applyBgImageRadius(Number(bgImageRadius.value))));
    });
    const bgImageDim = panel.querySelector("#claude-web-bg-image-dim");
    const bgImageDimValue = panel.querySelector("#claude-web-bg-image-dim-value");
    const applyBgImageDim = n => {
      const clamped = Math.min(70, Math.max(0, Math.round(n)));
      document.documentElement.style.setProperty("--claude-bg-image-dim", String(clamped / 100));
      bgImageDimValue.textContent = `${clamped}%`;
      return clamped;
    };
    bgImageDim.value = String(readNumber("bgImageDim", 28, 0, 70));
    applyBgImageDim(Number(bgImageDim.value));
    bgImageDim.addEventListener("input", () => {
      write("bgImageDim", String(applyBgImageDim(Number(bgImageDim.value))));
    });
    const selectedLabel = select => select?.selectedOptions?.[0]?.textContent?.trim() || "";
    const appearanceSummary = panel.querySelector("#claude-web-summary-appearance");
    const layoutSummary = panel.querySelector("#claude-web-summary-layout");
    const clawdSummary = panel.querySelector("#claude-web-summary-clawd");
    const backgroundSummary = panel.querySelector("#claude-web-summary-background");
    const fullAppearance = panel.querySelector("#claude-web-full-appearance");
    const layoutSection = panel.querySelector("#claude-web-section-layout");
    const backgroundSection = panel.querySelector("#claude-web-section-background");
    const clawdOptions = panel.querySelector("#claude-web-clawd-options");
    const bgBlurOptions = panel.querySelector("#claude-web-bg-blur-options");
    const bgImageOptions = panel.querySelector("#claude-web-bg-image-options");
    function syncPanelPresentation() {
      const presetName = selectedLabel(panel.querySelector("#claude-web-preset")) || "Claude";
      const variantName = selectedLabel(variantSelect) || (variantSelect.value === "night" ? "夜间" : "日间");
      appearanceSummary.textContent = `${presetName} / ${variantName}`;
      const layoutName = selectedLabel(layoutSelect) || layoutSelect.value;
      layoutSummary.textContent = `${layoutName}${avatarsBox.checked ? "" : " / 头像关"}`;
      clawdSummary.textContent = clawdBox.checked ? "显示" + (motionBox.checked ? " / 动画开" : " / 动画关") : "隐藏";
      const backgroundStates = [];
      bgTransparentBox.checked && backgroundStates.push("透传");
      bgBlurBox.checked && backgroundStates.push("毛玻璃");
      bgImageBlurBox.checked && backgroundStates.push("背景图模糊");
      backgroundSummary.textContent = backgroundStates.length ? backgroundStates.join(" + ") : "关闭";
      clawdOptions.hidden = !clawdBox.checked;
      bgBlurOptions.hidden = !bgBlurBox.checked;
      bgImageOptions.hidden = !bgImageBlurBox.checked;
      variantSelect.closest(".claude-web-field");
      fullAppearance.hidden = !1;
      for (const child of fullAppearance.children) child.hidden = !1;
      layoutSection.hidden = !1;
      backgroundSection.hidden = !1;
    }
    syncPanelPresentationRef = syncPanelPresentation;
    mountPresets(panel);
    syncPanelPresentation();
    const build = panel.querySelector("#claude-web-build");
    build.textContent = `构建 ${CLAUDE_KEYBOARD_BUILD.id}`;
    const updateButton = panel.querySelector("#claude-web-update");
    const updateHint = panel.querySelector("#claude-web-update-hint");
    updateButton.addEventListener("click", () => {
      runUpdate(updateButton, updateHint);
    });
    const reinstallButton = panel.querySelector("#claude-web-reinstall");
    reinstallButton.addEventListener("click", () => {
      runReinstall(reinstallButton, updateHint);
    });
  }
  const deadline = Date.now() + 6e4;
  const timer = window.setInterval(() => {
    const host = document.getElementById("extensions_settings2") || document.getElementById("extensions_settings");
    if (host) {
      window.clearInterval(timer);
      try {
        mount(host);
        console.info("[Claude Web] 设置面板已挂载。");
      } catch (error) {
        console.warn("[Claude Web] 设置面板挂载失败：", error);
      }
      return;
    }
    if (Date.now() > deadline) {
      window.clearInterval(timer);
      console.warn("[Claude Web] 一分钟内没等到扩展设置容器，面板没挂上。");
    }
  }, 500);
})();
