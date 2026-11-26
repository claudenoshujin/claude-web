/* 电脑端设置窗口等比缩放（修改单 qa-pages-v2d/窗口尺寸对比-20261111/修改单-设置窗口等比缩放-20261111.md）。
   设计尺寸固定 1420×930，外壳和所有设置页加 CSS zoom（styles/settings-v2d.css），显示大小 = 设计尺寸 × 比例。
   比例 85%–100%，默认 90%，存 localStorage（不写酒馆设置）。屏幕放不下时先降比例，到 85% 再让窗口变窄；高度不够时内容区自己滚。
   拖窗口左右两边、左下右下两个角调比例，窗口始终居中；拖的过程只改一个虚线框，松手才写到根节点上（一次）。双击边缘恢复 90%。
   浏览器不支持 zoom 时整个功能关掉，窗口按 100%。 */
export function createSettingsScale({win, mobile, t}) {
  const doc = win.document, root = doc.documentElement;
  const KEY = 'claude-web:settings-scale', MIN = 0.85, MAX = 1, DEF = 0.9, W = 1420, H = 930;
  const supported = !!win.CSS?.supports?.('zoom', '1');
  const clamp = v => Math.min(MAX, Math.max(MIN, Math.round(v * 100) / 100));
  const read = () => { try { const v = parseFloat(win.localStorage.getItem(KEY)); return Number.isFinite(v) ? clamp(v) : DEF; } catch { return DEF; } };
  const VARS = ['--cw-sz', '--cw-sz-w', '--cw-sz-h', '--cw-sz-x', '--cw-sz-y'];
  let user = read(), applied = '', placed = '', frame = 0, drag = null, destroyed = false;
  // 屏幕放不下：比例取用户值和 (屏幕宽 − 48) ÷ 1420 里小的，但不低于 85%；到 85% 还放不下就让设计宽度变窄。
  function geometry(u) {
    const vw = win.innerWidth, vh = win.innerHeight, s = Math.max(MIN, Math.min(u, (vw - 48) / W));
    const w = Math.min(W, (vw - 48) / s), h = Math.min(H, (vh - 64) / s);
    return {s, w, h, left: (vw - w * s) / 2, top: (vh - h * s) / 2};
  }
  const unified = () => root.hasAttribute('data-cw-settings-unified');
  const open = () => root.getAttribute('data-cw-v4-settings') === 'open';
  const canScale = () => supported && !destroyed && !mobile() && unified();
  const active = () => open() && canScale();
  // 外壳和面板都加了 zoom，它们的 left / top 也按 zoom 后的坐标算：要落在屏幕 L 处，就写 L ÷ 比例。
  function apply() {
    if (frame) win.cancelAnimationFrame(frame);
    frame = 0;
    const enabled = canScale();
    if (!enabled && applied) {
      for (const key of VARS) root.style.removeProperty(key);
      root.removeAttribute('data-cw-sz');
      applied = ''; placed = '';
    }
    // Keep the last geometry while closed. The open-state observer refreshes it before paint.
    if (!open()) { if (!edges.hidden) edges.hidden = true; return; }
    // The fit-to-screen scale can be the same for two different preferences.
    const designWidth = Math.min(W, (win.innerWidth - 48) / (supported ? user : 1));
    const single = unified() && (mobile() || designWidth < 1206);
    if (root.hasAttribute('data-cw-sz-single') !== single) root.toggleAttribute('data-cw-sz-single', single);
    if (!enabled) { if (!edges.hidden) edges.hidden = true; return; }
    // 根节点只写比例，而且只在比例变了时写：根变量会被所有元素继承，每写一次全页重算。
    // 设计宽高和 zoom 后坐标由 styles/settings-v2d.css 在外壳和面板自己身上用 100vw/100vh 算。
    const g = geometry(user), key = String(g.s);
    if (key !== applied) {
      applied = key;
      root.style.setProperty('--cw-sz', key);
      if (!root.hasAttribute('data-cw-sz')) root.setAttribute('data-cw-sz', '');
    }
    // 边缘层写的是它自己的内联样式，也只在几何真的变了时写。
    const box = [g.left, g.top, g.w * g.s, g.h * g.s].map(n => n.toFixed(2)).join();
    if (box !== placed) { placed = box; place(edges, g); }
    if (edges.hidden) edges.hidden = false;
  }
  const schedule = () => { if (open() && !frame) frame = win.requestAnimationFrame(apply); };
  function place(n, g) { const s = n.style; s.left = g.left + 'px'; s.top = g.top + 'px'; s.width = g.w * g.s + 'px'; s.height = g.h * g.s + 'px'; }
  // 边缘：独立的 fixed 层（不在窗口里，不跟着缩），只有左右两条和下面两个角接收指针。
  const edges = doc.createElement('div'); edges.className = 'cw-sz-edges'; edges.hidden = true;
  // 11-26 「悬浮窗收纳」会把四角的拖拽柄当悬浮球收走；打上它认得的浮层标记，整块跳过。
  edges.setAttribute('data-popper-placement', 'bottom');
  const ghost = doc.createElement('div'); ghost.className = 'cw-sz-ghost'; ghost.hidden = true;
  const tip = t('拖动缩放设置窗口 · 双击恢复 90%', 'Drag to scale the settings window · Double-click to reset to 90%');
  for (const side of ['w', 'e', 'sw', 'se']) {
    const h = doc.createElement('div'); h.className = 'cw-sz-' + side; h.title = tip; h.dataset.side = side;
    h.addEventListener('pointerdown', down); h.addEventListener('dblclick', reset); edges.append(h);
  }
  doc.body.append(edges, ghost);
  function down(e) {
    if (e.button !== 0 || !active()) return;
    e.preventDefault(); e.stopPropagation(); e.currentTarget.setPointerCapture?.(e.pointerId);
    drag = {id: e.pointerId, s: geometry(user).s, x: e.clientX, raf: 0};
    place(ghost, geometry(user)); ghost.hidden = false; root.setAttribute('data-cw-sz-drag', '');
    e.currentTarget.addEventListener('pointermove', move); e.currentTarget.addEventListener('pointerup', up); e.currentTarget.addEventListener('pointercancel', up);
  }
  // 比例 = 鼠标到窗口中心的水平距离 × 2 ÷ 1420，夹在 85%–100%。拖动中只动虚线框，一帧最多一次。
  function move(e) {
    if (!drag || e.pointerId !== drag.id) return;
    drag.x = e.clientX;
    if (!drag.raf) drag.raf = win.requestAnimationFrame(() => { if (!drag) return; drag.raf = 0; drag.s = clamp(Math.abs(drag.x - win.innerWidth / 2) * 2 / W); place(ghost, geometry(drag.s)); });
  }
  function up(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const h = e.currentTarget; h.removeEventListener('pointermove', move); h.removeEventListener('pointerup', up); h.removeEventListener('pointercancel', up);
    if (drag.raf) win.cancelAnimationFrame(drag.raf);
    const s = e.type === 'pointerup' ? clamp(Math.abs(e.clientX - win.innerWidth / 2) * 2 / W) : user;
    drag = null; ghost.hidden = true; root.removeAttribute('data-cw-sz-drag');
    set(s);
  }
  function set(s) { user = clamp(s); try { win.localStorage.setItem(KEY, String(user)); } catch {} apply(); }
  function reset(e) { e.preventDefault(); set(DEF); }
  /* jQuery UI 排序（预设提示词列表等，酒馆的 sortable）不认 CSS zoom：它量条目用 outerWidth/Height（缩放前的尺寸），
     量位置用 offset() 和指针坐标（屏幕上的尺寸），拖动中又把屏幕坐标原样写进条目的 left/top（会再被乘一次比例）。
     结果是被拖的条目不跟指针、落点不准。这里不改酒馆文件，也不改各页的代码：在设置窗口里按下指针时（捕获阶段，
     早于 jQuery UI 自己的 mousedown），给所在的 sortable 实例包一层——量出来的尺寸、外边距乘上比例，写回位置时除以比例。
     尺寸换算在比例为 1 时自然不起作用；拖动位置的换算电脑端 100% 也照样做（Lulu 定：100% 在滚动过的面板里原生本身就偏 60px、
     自动滚动后条目不跟手，一起修）。手机提示词列表也做位置换算，比例按 1。 */
  const patchedSortables = new WeakSet();
  function patchSortable(inst) {
    if (!inst || patchedSortables.has(inst)) return; patchedSortables.add(inst);
    // 比例在按下指针时读一次（sortableDown 写 __cwZ），拖动中不再读 currentCSSZoom——它要算计算样式，紧跟在 jQuery UI 写位置之后读会每帧逼出一次样式重算。
    const zoom = () => inst.__cwZ || 1;
    const wrap = (name, after) => { const orig = inst[name]; if (typeof orig !== 'function') return; inst[name] = function (...args) { const r = orig.apply(this, args); after.call(this, zoom(), args); return r; }; };
    wrap('_refreshItemPositions', function (z, [fast]) {
      if (z === 1 || fast) return;
      for (const it of this.items || []) { if (this.currentContainer && it.instance !== this.currentContainer && it.item[0] !== this.currentItem?.[0]) continue; it.width *= z; it.height *= z; }
    });
    wrap('refreshPositions', function (z) {
      if (z === 1 || this.options.custom?.refreshContainers) return;
      for (const c of this.containers || []) { c.containerCache.width = c.element.outerWidth() * z; c.containerCache.height = c.element.outerHeight() * z; }
    });
    wrap('_cacheHelperProportions', function (z) { if (z !== 1 && this.helperProportions) { this.helperProportions.width *= z; this.helperProportions.height *= z; } });
    wrap('_cacheMargins', function (z) { if (z !== 1 && this.margins) { this.margins.left *= z; this.margins.top *= z; } });
    // 拖动中：jQuery UI 把屏幕坐标原样写进 left/top。屏幕位置 = 原点 + 样式值 × 比例。原点每次拖动只量一次
    // （开始后的第一帧，或页面滚动过之后）。量好以后，在 jQuery UI 算完位置、写进样式之前就把 this.position 换成正确的样式值，
    // 每帧只写一次样式、不读布局。不管偏移父元素是谁、外面的面板滚了多少都对（单纯除以比例时，滚动距离会被多除一次）。
    // 判断交叉用的 positionAbs 在换值之前已经算好（屏幕坐标），不受影响。
    const fixed = (self, event) => {
      const z = zoom(), o = self.__cwOrigin, m = self.margins || {left: 0, top: 0};
      return {left: (event.pageX - win.scrollX - self.offset.click.left + m.left - o.x) / z, top: (event.pageY - win.scrollY - self.offset.click.top + m.top - o.y) / z};
    };
    // 拖到边缘自动滚动：jQuery UI 用「滚动容器的屏幕顶边 + offsetHeight」当底边，offsetHeight 是缩放前的值，
    // 底边被算到屏幕外，缩放时永远滚不动。照它原来的写法重写一遍，只是把 offsetHeight / offsetWidth 乘上比例（容器和列表同一个比例）。
    const origScroll = inst._scroll;
    if (typeof origScroll === 'function') inst._scroll = function (event) {
      const z = zoom(), sp = this.scrollParent?.[0], o = this.options;
      if (z === 1 || !sp || sp === this.document?.[0] || sp.tagName === 'HTML' || !this.overflowOffset) return origScroll.call(this, event);
      let scrolled = false; const top = this.overflowOffset.top, left = this.overflowOffset.left;
      if (top + sp.offsetHeight * z - event.pageY < o.scrollSensitivity) sp.scrollTop = scrolled = sp.scrollTop + o.scrollSpeed;
      else if (event.pageY - top < o.scrollSensitivity) sp.scrollTop = scrolled = sp.scrollTop - o.scrollSpeed;
      if (left + sp.offsetWidth * z - event.pageX < o.scrollSensitivity) sp.scrollLeft = scrolled = sp.scrollLeft + o.scrollSpeed;
      else if (event.pageX - left < o.scrollSensitivity) sp.scrollLeft = scrolled = sp.scrollLeft - o.scrollSpeed;
      return scrolled;
    };
    wrap('_mouseStart', function () { this.__cwOrigin = null; });
    wrap('_generatePosition', function (z, [event]) { this.__cwEvent = event; });
    wrap('_convertPositionTo', function (z, [d, pos]) {
      if (!this.__cwOn || d !== 'absolute' || pos || !this.__cwEvent || !this.offset?.click || !this.position) return;
      if (!this.__cwOrigin || this.__cwOrigin.scroll !== scrollSeq) { this.__cwMeasure = true; return; }
      const p = fixed(this, this.__cwEvent); this.position = {left: p.left, top: p.top};
    });
    wrap('_mouseDrag', function (z, [event]) {
      if (!this.__cwOn || !this.__cwMeasure) return;
      // 第一帧（或滚动后）：jQuery UI 刚写进去的值作参照，量一次原点，再改成正确的值。
      this.__cwMeasure = false; const h = this.helper?.[0]; if (!h || !event || !this.offset?.click) return;
      const r = h.getBoundingClientRect(); this.__cwOrigin = {x: r.left - (parseFloat(h.style.left) || 0) * z, y: r.top - (parseFloat(h.style.top) || 0) * z, scroll: scrollSeq};
      const p = fixed(this, event), axis = this.options.axis;
      if (axis !== 'y') h.style.left = p.left + 'px';
      if (axis !== 'x') h.style.top = p.top + 'px';
    });
  }
  // 任何滚动都让拖动中的原点作废，下一帧重量一次。
  let scrollSeq = 0; const onScroll = () => { scrollSeq++; };
  doc.addEventListener('scroll', onScroll, {capture: true, passive: true});
  const sortableDown = e => {
    const $ = win.jQuery; if (!$?.ui?.sortable || !e.target?.closest) return;
    if (!e.target.closest('.cw-v4-panel,.cw-v4-shell')) return;
    for (let el = e.target.closest('.ui-sortable'); el; el = el.parentElement?.closest('.ui-sortable')) {
      const phone = mobile();
      if (phone && el.id !== 'completion_prompt_manager_list') continue;
      let inst = null; try { inst = $(el).sortable('instance'); } catch {}
      if (inst) { patchSortable(inst); inst.__cwZ = phone ? 1 : (el.currentCSSZoom || 1); inst.__cwOn = true; }
    }
  };
  for (const type of ['mousedown', 'touchstart', 'pointerdown']) doc.addEventListener(type, sortableDown, {capture: true, passive: true});
  win.addEventListener('resize', schedule);
  const mo = new win.MutationObserver(apply);
  mo.observe(root, {attributes: true, attributeFilter: ['data-claude-layout', 'data-cw-settings-unified', 'data-cw-v4-settings']});
  apply();
  return {
    get scale() { return active() ? geometry(user).s : 1; },
    refresh: schedule,
    destroy() { destroyed = true; win.removeEventListener('resize', schedule); for (const type of ['mousedown', 'touchstart', 'pointerdown']) doc.removeEventListener(type, sortableDown, {capture: true}); doc.removeEventListener('scroll', onScroll, {capture: true}); mo.disconnect(); if (frame) win.cancelAnimationFrame(frame); for (const k of VARS) root.style.removeProperty(k); root.removeAttribute('data-cw-sz'); root.removeAttribute('data-cw-sz-single'); root.removeAttribute('data-cw-sz-drag'); edges.remove(); ghost.remove(); },
  };
}
