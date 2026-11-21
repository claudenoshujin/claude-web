/* data-cw-off：把几个原生节点"内联 display 是不是 none"镜像成一个属性。
 *
 * 为什么：样式表里只要有一条 :has(...[style*="display: none"]) 规则，页面上任何元素
 * 的内联 style 一变，浏览器就得把可能受影响的祖先整批重算（设置页开着时约 800 个元素）。
 * 拉伸窗口、拖动、动画都在写内联 style，于是每次都付这笔钱。改成判断一个只在这些节点上
 * 才会变的属性，写内联 style 就只重算被写的那一个元素。
 *
 * 维护范围（和 styles/*.css 里用到 [data-cw-off] 的规则一一对应）：
 *   - 固定节点自己：#rm_characters_block、#rm_ch_create_block、#rm_group_chats_block、
 *     #create_button_label、#rm_group_submit、#openai_api、#prompt_post_processing_form、
 *     #admin_button、#logout_button（账户功能没开时原生用内联 display:none 藏起），
 *     .reverse_proxy_warning，以及宿主 toggle-dependent.css 里 #adaptive_p_block 那条
 *     用到的 [data-tg-samplers="adaptive_target"] / [data-tg-samplers="adaptive_decay"]。
 *     各自只观察自己的 style 属性。
 *   - 容器的直接子元素：#rightSendForm>*、弹窗 .popup-controls>*。只在这些容器上观察
 *     childList + 子树 style，不观察整个 body；弹窗是 ST 挂到 body 直接子级的，body 上
 *     只看 childList（不带 subtree）来发现它们出现和消失。
 * 宿主那条规则用 CSSOM 换成判断 data-cw-off 的同义规则，卸载时换回原文。 */

const ATTR = 'data-cw-off';
const SELF_IDS = ['rm_characters_block', 'rm_ch_create_block', 'rm_group_chats_block', 'create_button_label', 'rm_group_submit', 'openai_api', 'prompt_post_processing_form', 'admin_button', 'logout_button'];
const SELF_SELECTOR = '.reverse_proxy_warning,#adaptive_p_block [data-tg-samplers="adaptive_target"],#adaptive_p_block [data-tg-samplers="adaptive_decay"]';
const HOST_SHEET_SUFFIX = '/css/toggle-dependent.css';
const HOST_MARKS = ['#adaptive_p_block', ':has(', 'adaptive_target', 'adaptive_decay', '[style*='];
const STYLE_NONE = /\[style\*="display: ?none"\]/g;

export function installDisplayState(win = window) {
  const doc = win.document;
  const marked = new Set();          // 被我们写过 data-cw-off 的节点（卸载时清掉）
  const selfWatched = new WeakSet();
  const containers = new Map();      // 容器 -> MutationObserver
  let destroyed = false, hostEntry = null, hostTries = 0, hostTimer = 0;

  const paint = el => {
    const off = el.style?.display === 'none';
    if (!off) marked.delete(el);
    if (off === el.hasAttribute(ATTR)) return;
    if (off) { el.setAttribute(ATTR, ''); marked.add(el); } else el.removeAttribute(ATTR);
  };
  const unmark = el => { if (marked.delete(el)) el.removeAttribute(ATTR); };
  const paintChildren = box => { for (const child of box.children) paint(child); };

  const selfObserver = new win.MutationObserver(records => { for (const r of records) paint(r.target); });
  const containerChanged = records => {
    const boxes = new Set();
    for (const r of records) {
      if (r.type === 'childList') {
        if (!containers.has(r.target)) continue;
        boxes.add(r.target);
        for (const child of r.removedNodes) {
          if (!containers.has(child.parentElement)) unmark(child);
        }
      } else if (containers.has(r.target.parentElement)) paint(r.target);
    }
    for (const box of boxes) paintChildren(box);
  };
  const watchContainer = box => {
    if (containers.has(box)) return;
    const mo = new win.MutationObserver(containerChanged);
    mo.observe(box, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
    containers.set(box, mo);
    paintChildren(box);
  };

  function scanSelf() {
    const nodes = [];
    for (const id of SELF_IDS) { const n = doc.getElementById(id); if (n) nodes.push(n); }
    nodes.push(...doc.querySelectorAll(SELF_SELECTOR));
    for (const n of nodes) {
      paint(n);
      if (selfWatched.has(n)) continue;
      selfWatched.add(n);
      selfObserver.observe(n, { attributes: true, attributeFilter: ['style'] });
    }
  }
  function scanContainers() {
    const want = new Set(doc.querySelectorAll('#rightSendForm,.popup-controls'));
    for (const [box, mo] of containers) if (!want.has(box)) {
      mo.disconnect(); containers.delete(box);
      for (const child of box.children) unmark(child);
    }
    for (const box of want) watchContainer(box);
  }

  /* 宿主规则：只认 css/toggle-dependent.css 里 #adaptive_p_block:has(...[style*=...]) 那一条。
     CSSOM 序列化可能改引号/空格，按结构标记认；换不出来就不动。 */
  function swapHostRule() {
    if (hostEntry || destroyed) return;
    for (const sheet of doc.styleSheets) {
      let path = '';
      try { path = new URL(sheet.href || '', doc.baseURI).pathname; } catch { continue; }
      if (!sheet.href || !path.endsWith(HOST_SHEET_SUFFIX)) continue;
      let rules; try { rules = sheet.cssRules; } catch { continue; }
      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i], selector = rule.selectorText;
        if (typeof selector !== 'string' || !HOST_MARKS.every(m => selector.includes(m))) continue;
        const original = rule.cssText;
        const replaced = original.replace(STYLE_NONE, '[' + ATTR + ']');
        if (replaced === original || /\[style/.test(replaced.split('{')[0])) return;
        try {
          sheet.deleteRule(i);
          sheet.insertRule(replaced, i);
          hostEntry = { sheet, rule: sheet.cssRules[i], original };
        } catch {
          try { if (sheet.cssRules[i]?.cssText !== original) sheet.insertRule(original, i); } catch {}
        }
        return;
      }
    }
  }
  function restoreHostRule() {
    if (!hostEntry) return;
    const { sheet, rule, original } = hostEntry; hostEntry = null;
    try {
      const i = Array.prototype.indexOf.call(sheet.cssRules, rule);
      if (i < 0) return;
      sheet.deleteRule(i);
      sheet.insertRule(original, i);
    } catch { /* 表已脱离或只读 */ }
  }

  const bodyObserver = new win.MutationObserver(scanContainers);
  bodyObserver.observe(doc.body, { childList: true });
  scanSelf();
  scanContainers();
  swapHostRule();
  // toggle-dependent.css 理论上早于扩展加载；保险起见再找两次，与 index.js 的删除模式规则同节奏。
  const retryHost = () => { hostTimer = 0; if (destroyed || hostEntry || ++hostTries > 2) return; swapHostRule(); if (!hostEntry) hostTimer = win.setTimeout(retryHost, 800); };
  if (!hostEntry) hostTimer = win.setTimeout(retryHost, 800);

  return {
    /** official-layout 的 sync() 每次都调：补上延迟渲染出来的节点。 */
    rescan() { if (destroyed) return; scanSelf(); scanContainers(); },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (hostTimer) win.clearTimeout(hostTimer);
      selfObserver.disconnect(); bodyObserver.disconnect();
      for (const mo of containers.values()) mo.disconnect();
      containers.clear();
      for (const el of marked) el.removeAttribute(ATTR);
      marked.clear();
      restoreHostRule();
    },
  };
}
