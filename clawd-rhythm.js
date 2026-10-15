/* 大 Clawd 跟着节奏动（T8，Lulu 2026-10-15 定稿；预览 Claude outputs/移动端与滚动条待处理问题-20261013/T8预览/…-v6.html）。
   · 你打字时（clawd-rig 的 compose）：原动画定在「低头看着输入框」那一帧；每上屏一个字，上半身沉 1 格（3px，和原来点头一样）
     再起来，按格跳、不平滑。字来得越密蹲得越短（最短 50ms）。输入法拼写中不蹲，上屏时有几个字连蹲几下（最多排 8 下）；
     删除不蹲；粘贴 / 拖入只蹲一下。停手时偶尔往右扫一眼（原动画里读字的那一下）。
   · 生成回复时（write / sitWrite / writeHeld）：动画倍速跟流式出字速度。不到 12 字/秒 0.6×、12～32 字/秒 1×、32 以上 1.6×；
     降档阈值 ×0.75，每档至少保持 0.8s；0.6s 没有新字回到慢速。
   只改大 Clawd 骨架部件的行内 translate 和动画倍速；不碰 html / body，不另开常驻定时器（只在这两种动画播放时跑 rAF）。 */
const UPPER = ['body', 'eyes', 'clawL', 'clawR', 'sym'];
const WRITE = /^(write|sitWrite|writeHeld)(-m)?$/;
const PIN_MS = 250;            // compose 进场 200ms 之后、第一下点头之前：低头看着输入框
const DIP_PX = 3, DIP_MS = 100, DIP_MIN = 50, GAP_MS = 40, BURST_DIP = 60, BURST_GAP = 30, QUEUE_MAX = 8;
const QUIET_MS = 600, HOLD_MS = 800, HYS = .75;
const RATE = [.6, 1, 1.6], CPS_UP = [12, 32];

export function installClawdRhythm({ doc, win, button, enabled, reducedMotion }) {
  let raf = 0, destroyed = false, clip = '', clipAt = 0, form = null;
  // —— 打字：上屏一个字蹲一下 ——
  let prevLen = 0, compStart = -1, lastKeyAt = -1e9, lastDipKey = 0;
  let dipQueue = 0, dipDown = false, dipUntil = 0, dipDur = DIP_MS, dipGap = GAP_MS;
  // —— 生成：出字速度 ——
  let lastText = 0, sampleAt = 0, rateTier = 0, tierAt = 0, lastCharAt = -1e9;
  const charTimes = [];

  const box = () => doc.getElementById('send_textarea');
  const rig = () => button()?.querySelector(':scope > .clawd-rig') || null;
  const parts = r => UPPER.map(p => r?.querySelector('.clr-p-' + p)).filter(Boolean);
  const clipAnims = r => (r?.getAnimations?.({ subtree: true }) || []).filter(a => typeof a.animationName === 'string' && a.animationName.includes('-' + clip + '-'));
  const active = () => !destroyed && enabled() && !reducedMotion() && doc.documentElement.dataset.claudeMotion !== 'off';

  function dip(n = 1) {
    if (n <= 0 || !active()) return;
    const now = win.performance.now(), interval = lastDipKey ? now - lastDipKey : 1e9; lastDipKey = now;
    dipQueue = Math.min(QUEUE_MAX, dipQueue + n);
    const burst = dipQueue > 1;
    dipDur = burst ? BURST_DIP : Math.max(DIP_MIN, Math.min(DIP_MS, interval * .6));
    dipGap = burst ? BURST_GAP : Math.min(GAP_MS, interval * .3);
    wake();
  }
  const onBefore = e => { if (e.target === box() && /^(insert|delete)/.test(e.inputType || '')) lastKeyAt = win.performance.now(); };
  const onCompStart = e => { if (e.target === box()) compStart = prevLen; };
  const onCompEnd = e => {
    if (e.target !== box()) return;
    const len = e.target.value.length, n = len - (compStart < 0 ? prevLen : compStart);
    compStart = -1; prevLen = len; dip(n);
  };
  const onInput = e => {
    const b = box(); if (e.target !== b) return;
    const t = e.inputType || '';
    if (e.isComposing || t === 'insertCompositionText' || compStart >= 0) return;   // 上屏由 compositionend 统一处理（Safari 会先 compositionend 再 input）
    const added = b.value.length - prevLen; prevLen = b.value.length;
    if (/^insertFrom(Paste|Drop)/.test(t)) dip(1); else if (t.startsWith('insert') && added > 0) dip(added);
  };
  // 发送 / 程序清空输入框不会发 input，开始打字前对齐一次长度
  const onFocus = e => { if (e.target === box()) { prevLen = e.target.value.length; compStart = -1; } };

  function reset(r) {
    for (const n of parts(r)) n.style.removeProperty('translate');
    dipQueue = 0; dipDown = false;
  }
  function onClip() {
    const next = button()?.dataset.clawdClip || '';
    if (next === clip) return;
    // 打第一个字时 CW 才把动画切到 compose：这一下已经排上了，切进来时留着
    const keep = /^compose(-m)?$/.test(next) ? dipQueue : 0;
    reset(rig()); dipQueue = keep;
    clip = next; clipAt = win.performance.now();
    if (WRITE.test(clip)) { lastText = -1; rateTier = 0; tierAt = clipAt; charTimes.length = 0; lastCharAt = -1e9; }
    wake();
  }
  // 大 Clawd 按钮会重建；输入框也可能被别的扩展换掉。把观察挂在 #send_form 上，按需重挂。
  const mo = new win.MutationObserver(() => { attach(); onClip(); });
  function attach() {
    const f = doc.getElementById('send_form');
    if (f === form) return;
    mo.disconnect(); form = f;
    if (f) mo.observe(f, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-clawd-clip'] });
  }

  function lastMessageLength() {
    const t = doc.querySelector('#chat > .mes.last_mes .mes_text')?.textContent || '';
    return t.replace(/\s+/g, '').length;
  }
  function decideTier(cps, now) {
    let want = rateTier;
    if (rateTier === 0 && cps >= CPS_UP[0]) want = cps >= CPS_UP[1] ? 2 : 1;
    else if (rateTier === 1) { if (cps >= CPS_UP[1]) want = 2; else if (cps <= CPS_UP[0] * HYS) want = 0; }
    else if (rateTier === 2 && cps <= CPS_UP[1] * HYS) want = cps <= CPS_UP[0] * HYS ? 0 : 1;
    if (want !== rateTier && now - tierAt >= HOLD_MS) { rateTier = want; tierAt = now; }
    return rateTier;
  }

  function frame(now) {
    raf = 0;
    if (destroyed) return;
    const r = rig(), on = active();
    if (clip === 'compose' || clip === 'compose-m') {
      const anims = clipAnims(r);
      if (on) { for (const a of anims) if (a.playState !== 'paused') { a.pause(); a.currentTime = PIN_MS; } }
      else for (const a of anims) if (a.playState === 'paused') a.play();
      if (!on) dipQueue = 0;
      if (dipDown && now >= dipUntil) { dipDown = false; dipUntil = now + dipGap; }
      if (!dipDown && dipQueue > 0 && now >= dipUntil) { dipQueue--; dipDown = true; dipUntil = now + dipDur; }
      const typing = now - lastKeyAt < QUIET_MS, cycle = (now - clipAt) % 3200;
      const scan = on && !typing && !dipDown && cycle > 2400 && cycle < 2700;
      const sx = clip.endsWith('-m') ? -DIP_PX : DIP_PX;
      for (const n of parts(r)) {
        const x = scan && n.classList.contains('clr-p-eyes') ? sx : 0, y = dipDown ? DIP_PX : 0;
        const v = x || y ? `${x}px ${y}px` : '';
        if (n.style.translate !== v) v ? n.style.setProperty('translate', v) : n.style.removeProperty('translate');
      }
      raf = win.requestAnimationFrame(frame);
      return;
    }
    if (WRITE.test(clip)) {
      if (now - sampleAt >= 100) {
        sampleAt = now;
        const len = lastMessageLength();
        if (lastText < 0 || len < lastText) lastText = len;   // 新消息 / 换 swipe：重新起算
        else if (len > lastText) { for (let i = Math.min(200, len - lastText); i > 0; i--) charTimes.push(now); lastText = len; lastCharAt = now; }
        while (charTimes.length && now - charTimes[0] > 1000) charTimes.shift();
      }
      const quiet = now - lastCharAt > QUIET_MS;
      const t = quiet ? 0 : decideTier(charTimes.length, now);
      const rate = on ? RATE[t] : 1;
      for (const a of clipAnims(r)) if (a.playbackRate !== rate) a.playbackRate = rate;
      raf = win.requestAnimationFrame(frame);
    }
  }
  function wake() { if (!raf && !destroyed && (clip === 'compose' || clip === 'compose-m' || WRITE.test(clip))) raf = win.requestAnimationFrame(frame); }

  const listeners = [['beforeinput', onBefore], ['compositionstart', onCompStart], ['compositionend', onCompEnd], ['input', onInput], ['focusin', onFocus]];
  for (const [type, fn] of listeners) doc.addEventListener(type, fn, true);
  attach(); onClip();

  return {
    // index.js 每次刷新调用：按钮或 #send_form 重建后重新挂上
    sync() { if (destroyed) return; attach(); onClip(); },
    destroy() {
      if (destroyed) return;
      destroyed = true; mo.disconnect();
      if (raf) win.cancelAnimationFrame(raf); raf = 0;
      for (const [type, fn] of listeners) doc.removeEventListener(type, fn, true);
      const r = rig(); reset(r);
      for (const a of clipAnims(r)) { if (a.playState === 'paused') a.play(); a.playbackRate = 1; }
    },
  };
}
