const DIAGNOSTICS_ID = "clawd-keyboard-diagnostics";
const DIAGNOSTICS_STYLE_ID = "clawd-keyboard-diagnostics-style";
const MAX_SAMPLES = 1600;
const SCHEMA = "claude-web-via-keyboard-diagnostics";

export function installKeyboardDiagnostics(options) {
  const hostWindow = options.window;
  const hostDocument = options.document;
  const buildId = options.buildId || "unknown";
  const isMobileLayout = options.isMobileLayout || (() => true);
  const getRuntimeState = options.getRuntimeState || (() => ({}));
  const setIsolationMode = options.setIsolationMode || (() => {});

  if (!hostWindow || !hostDocument || !isMobileLayout()) return null;
  hostWindow.__claudeClawdViaDiagnostics?.destroy?.();

  let root = null;
  let styleNode = null;
  let timer = 0;
  let running = false;
  let sessionId = "";
  let startedAt = 0;
  let stoppedAt = 0;
  let stopReason = "";
  let deadline = 0;
  let intervalMs = 250;
  let expectedAt = 0;
  let sequence = 0;
  let samples = [];
  let marks = [];
  let listeners = [];
  let repositionRaf = 0;
  let frameTraceRaf = 0;
  let frameTraceLastAt = 0;
  let longTaskObserver = null;
  let longTaskObserverSupported = false;
  let sessionIsolationMode = "standard";
  let longTasks = [];
  let frameGaps = [];
  const lastEventAt = new Map();

  function finite(value, digits = 2) {
    const number = Number(value);
    return Number.isFinite(number) ? Number(number.toFixed(digits)) : null;
  }

  function rectOf(element) {
    const rect = element?.getBoundingClientRect?.();
    if (!rect) return null;
    return {
      top: finite(rect.top),
      right: finite(rect.right),
      bottom: finite(rect.bottom),
      left: finite(rect.left),
      width: finite(rect.width),
      height: finite(rect.height),
    };
  }

  function computedOf(element, properties) {
    if (!element) return null;
    const computed = hostWindow.getComputedStyle(element);
    return Object.fromEntries(properties.map(property => [property, computed[property] || ""]));
  }

  function containingBlockAncestors(element) {
    const result = [];
    let current = element?.parentElement;
    while (current && result.length < 12) {
      const computed = hostWindow.getComputedStyle(current);
      const relevant = computed.transform !== "none"
        || computed.filter !== "none"
        || computed.perspective !== "none"
        || computed.contain !== "none"
        || computed.willChange !== "auto";
      if (relevant || current === hostDocument.body || current === hostDocument.documentElement) {
        result.push({
          element: current.id ? "#" + current.id : current.tagName.toLowerCase(),
          transform: computed.transform,
          filter: computed.filter,
          perspective: computed.perspective,
          contain: computed.contain,
          willChange: computed.willChange,
          position: computed.position,
        });
      }
      current = current.parentElement;
    }
    return result;
  }

  function snapshot(source, scheduledLateMs = 0, eventTarget = null) {
    const formSheld = hostDocument.querySelector("#form_sheld");
    const sheld = hostDocument.querySelector("#sheld");
    const chat = hostDocument.querySelector("#chat");
    const viewport = hostWindow.visualViewport;
    const rootComputed = hostWindow.getComputedStyle(hostDocument.documentElement);
    const scrollingElement = hostDocument.scrollingElement;
    const active = hostDocument.activeElement;
    const now = Date.now();

    return {
      sessionId,
      sequence: ++sequence,
      source,
      timestamp: now,
      elapsedMs: now - startedAt,
      scheduledLateMs: Math.max(0, finite(scheduledLateMs) || 0),
      eventTarget,
      focus: {
        activeElementId: active?.id || "",
        activeElementTag: active?.tagName?.toLowerCase?.() || "",
      },
      window: {
        innerWidth: hostWindow.innerWidth,
        innerHeight: hostWindow.innerHeight,
        scrollX: finite(hostWindow.scrollX),
        scrollY: finite(hostWindow.scrollY),
        screenHeight: hostWindow.screen?.height ?? null,
        screenAvailHeight: hostWindow.screen?.availHeight ?? null,
        documentElementClientHeight: hostDocument.documentElement.clientHeight,
        documentElementScrollHeight: hostDocument.documentElement.scrollHeight,
        bodyClientHeight: hostDocument.body?.clientHeight ?? null,
        bodyScrollHeight: hostDocument.body?.scrollHeight ?? null,
        scrollingElementScrollTop: finite(scrollingElement?.scrollTop),
      },
      visualViewport: viewport ? {
        width: finite(viewport.width),
        height: finite(viewport.height),
        offsetTop: finite(viewport.offsetTop),
        offsetLeft: finite(viewport.offsetLeft),
        pageTop: finite(viewport.pageTop),
        pageLeft: finite(viewport.pageLeft),
        scale: finite(viewport.scale, 4),
      } : null,
      formSheld: {
        rect: rectOf(formSheld),
        computed: computedOf(formSheld, ["position", "bottom", "transform", "willChange"]),
        inlineComposerTranslateY: formSheld?.style
          .getPropertyValue("--cl-mobile-composer-translate-y") || "",
        containingBlockAncestors: containingBlockAncestors(formSheld),
      },
      sheld: {
        rect: rectOf(sheld),
        computed: computedOf(sheld, [
          "transform", "position", "height", "minHeight", "maxHeight", "overflow",
        ]),
      },
      chat: {
        rect: rectOf(chat),
        scrollTop: finite(chat?.scrollTop),
        scrollHeight: chat?.scrollHeight ?? null,
        clientHeight: chat?.clientHeight ?? null,
        computed: computedOf(chat, [
          "transform", "position", "height", "minHeight", "overflow",
        ]),
      },
      rootVariables: {
        mobileViewportHeight: rootComputed.getPropertyValue("--cl-mobile-viewport-height").trim(),
        mobileViewportTop: rootComputed.getPropertyValue("--cl-mobile-viewport-top").trim(),
        mobileComposerHeight: rootComputed.getPropertyValue("--cl-mobile-composer-height").trim(),
      },
      state: { ...getRuntimeState() },
    };
  }

  function pushSample(source, late = 0, eventTarget = null) {
    const measureStart = hostWindow.performance?.now?.() ?? Date.now();
    if (samples.length >= MAX_SAMPLES) samples.shift();
    const sample = snapshot(source, late, eventTarget);
    const measureEnd = hostWindow.performance?.now?.() ?? Date.now();
    sample.diagnosticSampleCostMs = finite(measureEnd - measureStart, 3);
    samples.push(sample);
    updateStatus();
  }

  function normalizeLongTask(entry) {
    return {
      name: entry.name || "",
      startTime: finite(entry.startTime, 3),
      duration: finite(entry.duration, 3),
      attribution: Array.from(entry.attribution || []).map(item => ({
        name: item.name || "",
        entryType: item.entryType || "",
        startTime: finite(item.startTime, 3),
        duration: finite(item.duration, 3),
        containerType: item.containerType || "",
        containerName: item.containerName || "",
        containerId: item.containerId || "",
        containerSrc: item.containerSrc || "",
      })),
    };
  }

  function startLongTaskObserver() {
    longTaskObserverSupported = false;
    if (!hostWindow.PerformanceObserver) return;
    try {
      longTaskObserver = new hostWindow.PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (longTasks.length >= 400) longTasks.shift();
          longTasks.push(normalizeLongTask(entry));
        }
      });
      longTaskObserver.observe({ type: "longtask", buffered: false });
      longTaskObserverSupported = true;
    } catch {
      try {
        longTaskObserver?.disconnect?.();
        longTaskObserver = new hostWindow.PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (longTasks.length >= 400) longTasks.shift();
            longTasks.push(normalizeLongTask(entry));
          }
        });
        longTaskObserver.observe({ entryTypes: ["longtask"] });
        longTaskObserverSupported = true;
      } catch {
        longTaskObserver?.disconnect?.();
        longTaskObserver = null;
      }
    }
  }

  function traceFrame(timestamp) {
    frameTraceRaf = 0;
    if (!running) return;
    if (frameTraceLastAt) {
      const gap = timestamp - frameTraceLastAt;
      if (gap >= 120) {
        if (frameGaps.length >= 400) frameGaps.shift();
        frameGaps.push({
          timestamp: Date.now(),
          elapsedMs: Date.now() - startedAt,
          performanceTime: finite(timestamp, 3),
          gapMs: finite(gap, 3),
        });
      }
    }
    frameTraceLastAt = timestamp;
    frameTraceRaf = hostWindow.requestAnimationFrame(traceFrame);
  }

  function startFrameTrace() {
    frameTraceLastAt = 0;
    if (frameTraceRaf) hostWindow.cancelAnimationFrame(frameTraceRaf);
    frameTraceRaf = hostWindow.requestAnimationFrame(traceFrame);
  }

  function stopPerformanceTracing() {
    for (const entry of longTaskObserver?.takeRecords?.() || []) {
      if (longTasks.length >= 400) longTasks.shift();
      longTasks.push(normalizeLongTask(entry));
    }
    longTaskObserver?.disconnect?.();
    longTaskObserver = null;
    if (frameTraceRaf) hostWindow.cancelAnimationFrame(frameTraceRaf);
    frameTraceRaf = 0;
    frameTraceLastAt = 0;
  }

  function clearListeners() {
    for (const entry of listeners) {
      entry.target?.removeEventListener?.(entry.type, entry.handler, entry.options);
    }
    listeners = [];
    lastEventAt.clear();
  }

  function recordEvent(source, event) {
    if (!running) return;
    const now = Date.now();
    if (source.includes("scroll") && now - (lastEventAt.get(source) || 0) < 80) return;
    lastEventAt.set(source, now);
    pushSample(source, 0, {
      id: event?.target?.id || "",
      tag: event?.target?.tagName?.toLowerCase?.() || "",
    });
  }

  function listen(target, type, source, listenerOptions = { passive: true }) {
    if (!target?.addEventListener) return;
    const handler = event => recordEvent(source, event);
    target.addEventListener(type, handler, listenerOptions);
    listeners.push({ target, type, handler, options: listenerOptions });
  }

  function installListeners() {
    clearListeners();
    listen(hostWindow, "resize", "resize");
    listen(hostWindow, "scroll", "window.scroll");
    listen(hostWindow, "orientationchange", "orientationchange");
    listen(hostWindow.visualViewport, "resize", "visualViewport.resize");
    listen(hostWindow.visualViewport, "scroll", "visualViewport.scroll");
    listen(hostDocument, "focusin", "focusin", true);
    listen(hostDocument, "focusout", "focusout", true);
    listen(hostDocument.querySelector("#chat"), "scroll", "chat.scroll");
  }

  function stop(reason = "user-stop") {
    if (timer) hostWindow.clearTimeout(timer);
    timer = 0;
    clearListeners();
    if (running) {
      running = false;
      stoppedAt = Date.now();
      stopReason = reason;
    }
    stopPerformanceTracing();
    setIsolationMode("standard");
    updateStatus();
    return payload();
  }

  function tick() {
    timer = 0;
    if (!running) return;
    const now = Date.now();
    if (now >= deadline) {
      pushSample("complete", now - expectedAt);
      stop("duration-complete");
      return;
    }
    pushSample("tick", now - expectedAt);
    expectedAt = now + intervalMs;
    timer = hostWindow.setTimeout(tick, intervalMs);
  }

  function start(startOptions = {}) {
    stop("restart");
    samples = [];
    marks = [];
    longTasks = [];
    frameGaps = [];
    sequence = 0;
    sessionId = "via-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
    startedAt = Date.now();
    stoppedAt = 0;
    stopReason = "";
    const durationMs = Math.min(Math.max(Number(startOptions.duration) || 15000, 1000), 30000);
    intervalMs = Math.min(Math.max(Number(startOptions.interval) || 250, 100), 2000);
    deadline = startedAt + durationMs;
    sessionIsolationMode = ["refresh", "root", "composer", "compositor"].includes(startOptions.isolationMode)
      ? startOptions.isolationMode
      : "standard";
    setIsolationMode(sessionIsolationMode);
    running = true;
    installListeners();
    startLongTaskObserver();
    startFrameTrace();
    pushSample("start");
    expectedAt = startedAt + intervalMs;
    timer = hostWindow.setTimeout(tick, intervalMs);
    updateStatus();
    return sessionId;
  }

  function markAnomaly() {
    if (!running) return false;
    const now = Date.now();
    const mark = {
      type: "anomaly-visible",
      timestamp: now,
      elapsedMs: now - startedAt,
      sampleSequence: sequence + 1,
    };
    marks.push(mark);
    pushSample("anomaly-visible");
    updateStatus("已标记异常时间点");
    return true;
  }

  function payload() {
    return {
      schema: SCHEMA,
      schemaVersion: 1,
      buildId,
      sessionId,
      startedAt: startedAt || null,
      startedAtIso: startedAt ? new Date(startedAt).toISOString() : null,
      stoppedAt: stoppedAt || null,
      stoppedAtIso: stoppedAt ? new Date(stoppedAt).toISOString() : null,
      stopReason,
      requestedDurationMs: deadline && startedAt ? deadline - startedAt : null,
      intervalMs,
      isolationMode: sessionIsolationMode,
      exportedAt: Date.now(),
      performance: {
        timeOrigin: hostWindow.performance?.timeOrigin ?? null,
        longTaskObserverSupported,
        longTasks: longTasks.slice(),
        frameGaps: frameGaps.slice(),
      },
      page: {
        url: hostWindow.location?.href || "",
        userAgent: hostWindow.navigator?.userAgent || "",
        language: hostWindow.navigator?.language || "",
        devicePixelRatio: hostWindow.devicePixelRatio || 1,
      },
      marks: marks.slice(),
      samples: samples.slice(),
    };
  }

  function exportJson() {
    if (!sessionId || !samples.length) return null;
    const data = payload();
    const json = JSON.stringify(data, null, 2);
    const stamp = new Date(data.startedAt).toISOString().replace(/[:.]/g, "-");
    const filename = "via-keyboard-diagnostics-" + stamp + ".json";
    const blob = new hostWindow.Blob([json], { type: "application/json;charset=utf-8" });
    const url = hostWindow.URL.createObjectURL(blob);
    const anchor = hostDocument.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.hidden = true;
    hostDocument.body.append(anchor);
    anchor.click();
    anchor.remove();
    hostWindow.setTimeout(() => hostWindow.URL.revokeObjectURL(url), 2000);

    const clipboard = hostWindow.navigator?.clipboard?.writeText?.(json);
    if (clipboard?.then) {
      clipboard.then(
        () => updateStatus("已下载并复制：" + filename),
        () => updateStatus("已下载：" + filename),
      );
    } else {
      updateStatus("已下载：" + filename);
    }
    return { filename, json };
  }

  function updateStatus(message = "") {
    const status = root?.querySelector?.("[data-role=status]");
    if (!status) return;
    if (message) status.value = message;
    else if (running) {
      const elapsed = Math.max(0, Date.now() - startedAt);
      const modeLabel = sessionIsolationMode === "refresh"
        ? "刷新隔离采集中 "
        : sessionIsolationMode === "root"
          ? "根节点隔离采集中 "
          : sessionIsolationMode === "composer"
            ? "输入框层隔离采集中 "
        : sessionIsolationMode === "compositor"
          ? "合成层隔离采集中 "
          : "标准采集中 ";
      status.value = modeLabel
        + (elapsed / 1000).toFixed(1) + " / "
        + ((deadline - startedAt) / 1000).toFixed(0) + " 秒 · " + samples.length + " 样本";
    } else if (samples.length) {
      status.value = "采集结束 · " + samples.length + " 样本 · " + marks.length + " 个异常标记";
    } else {
      status.value = "未采集。先进入长聊天，再开始。";
    }
    const markButton = root.querySelector("[data-action=mark]");
    const stopButton = root.querySelector("[data-action=stop]");
    const exportButton = root.querySelector("[data-action=export]");
    if (markButton) markButton.disabled = !running;
    if (stopButton) stopButton.disabled = !running;
    if (exportButton) exportButton.disabled = !samples.length;
  }

  function button(action, label, className = "") {
    const element = hostDocument.createElement("button");
    element.type = "button";
    element.dataset.action = action;
    element.textContent = label;
    if (className) element.className = className;
    return element;
  }

  function positionUiAtVisibleTop() {
    repositionRaf = 0;
    if (root) root.style.top = Math.round((hostWindow.scrollY || 0) + 72) + "px";
  }

  function keepUiVisibleDuringPageScroll() {
    if (repositionRaf) return;
    repositionRaf = hostWindow.requestAnimationFrame(positionUiAtVisibleTop);
  }

  function mount() {
    hostDocument.getElementById(DIAGNOSTICS_ID)?.remove();
    hostDocument.getElementById(DIAGNOSTICS_STYLE_ID)?.remove();

    styleNode = hostDocument.createElement("style");
    styleNode.id = DIAGNOSTICS_STYLE_ID;
    styleNode.textContent = [
      "#" + DIAGNOSTICS_ID + "{position:absolute;z-index:2147483646;top:72px;right:8px;font:13px/1.35 system-ui,sans-serif;color:#fff;pointer-events:auto}",
      "#" + DIAGNOSTICS_ID + " button,#" + DIAGNOSTICS_ID + " input{font:inherit}",
      "#" + DIAGNOSTICS_ID + " .clawd-kbd-diag-toggle{float:right;border:1px solid rgba(255,255,255,.45);border-radius:999px;padding:7px 10px;background:#23262b;color:#fff;box-shadow:0 2px 10px #0008}",
      "#" + DIAGNOSTICS_ID + " .clawd-kbd-diag-panel{clear:both;display:none;width:min(280px,calc(100vw - 16px));margin-top:6px;padding:10px;border:1px solid rgba(255,255,255,.32);border-radius:12px;background:rgba(24,26,30,.96);box-shadow:0 5px 24px #000a}",
      "#" + DIAGNOSTICS_ID + "[data-open=true] .clawd-kbd-diag-panel{display:block}",
      "#" + DIAGNOSTICS_ID + " .clawd-kbd-diag-title{margin:0 0 7px;font-weight:700}",
      "#" + DIAGNOSTICS_ID + " .clawd-kbd-diag-status{box-sizing:border-box;width:100%;margin:0 0 8px;padding:6px 7px;border:0;border-radius:6px;background:#101216;color:#d9e2ef}",
      "#" + DIAGNOSTICS_ID + " .clawd-kbd-diag-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px}",
      "#" + DIAGNOSTICS_ID + " .clawd-kbd-diag-actions button{min-height:36px;border:1px solid #ffffff38;border-radius:7px;background:#343942;color:#fff}",
      "#" + DIAGNOSTICS_ID + " .clawd-kbd-diag-actions button:disabled{opacity:.42}",
      "#" + DIAGNOSTICS_ID + " [data-action=mark]{background:#7a342f}",
      "#" + DIAGNOSTICS_ID + " [data-action=export]{background:#245d43}",
    ].join("\n");
    hostDocument.head.append(styleNode);

    root = hostDocument.createElement("section");
    root.id = DIAGNOSTICS_ID;
    root.className = "clawd-keyboard-diagnostics";
    root.dataset.open = "false";

    const toggle = button("toggle", "诊断", "clawd-kbd-diag-toggle");
    const panel = hostDocument.createElement("div");
    panel.className = "clawd-kbd-diag-panel";
    const title = hostDocument.createElement("p");
    title.className = "clawd-kbd-diag-title";
    title.textContent = "Via 输入框几何诊断";
    const status = hostDocument.createElement("input");
    status.className = "clawd-kbd-diag-status";
    status.dataset.role = "status";
    status.readOnly = true;
    status.setAttribute("aria-label", "诊断状态");
    const actions = hostDocument.createElement("div");
    actions.className = "clawd-kbd-diag-actions";
    actions.append(
      button("start", "标准 15 秒"),
      button("isolate", "隔离刷新 15 秒"),
      button("root", "仅根节点 15 秒"),
      button("composer", "仅输入框层 15 秒"),
      button("compositor", "隔离合成层 15 秒"),
      button("stop", "停止"),
      button("mark", "异常已出现"),
      button("export", "导出 JSON"),
    );
    panel.append(title, status, actions);
    root.append(toggle, panel);

    root.addEventListener("pointerdown", event => {
      if (event.target?.closest?.("button")) event.preventDefault();
    }, true);
    root.addEventListener("click", event => {
      const action = event.target?.closest?.("button")?.dataset?.action;
      if (!action) return;
      event.preventDefault();
      event.stopPropagation();
      if (action === "toggle") root.dataset.open = root.dataset.open === "true" ? "false" : "true";
      else if (action === "start") start({ duration: 15000, interval: 250, isolationMode: "standard" });
      else if (action === "isolate") start({ duration: 15000, interval: 250, isolationMode: "refresh" });
      else if (action === "root") start({ duration: 15000, interval: 250, isolationMode: "root" });
      else if (action === "composer") start({ duration: 15000, interval: 250, isolationMode: "composer" });
      else if (action === "compositor") start({ duration: 15000, interval: 250, isolationMode: "compositor" });
      else if (action === "stop") stop("user-stop");
      else if (action === "mark") markAnomaly();
      else if (action === "export") exportJson();
    });
    hostDocument.body.append(root);
    hostWindow.addEventListener("scroll", keepUiVisibleDuringPageScroll, { passive: true });
    positionUiAtVisibleTop();
    updateStatus();
  }

  function destroy() {
    stop("destroy");
    hostWindow.removeEventListener("scroll", keepUiVisibleDuringPageScroll);
    if (repositionRaf) hostWindow.cancelAnimationFrame(repositionRaf);
    repositionRaf = 0;
    root?.remove();
    styleNode?.remove();
    root = null;
    styleNode = null;
    if (hostWindow.__claudeClawdViaDiagnostics === api) {
      delete hostWindow.__claudeClawdViaDiagnostics;
    }
  }

  const api = {
    start,
    stop,
    markAnomaly,
    exportJson,
    payload,
    destroy,
    get running() { return running; },
  };

  mount();
  hostWindow.__claudeClawdViaDiagnostics = api;
  return api;
}
