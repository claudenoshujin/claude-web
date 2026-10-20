/* 2.0.315（Lulu 2026-10-11 定，预览 Claude outputs/design-web-v1/design-web-v3.html）：
 * 电脑端从 Claude Desktop 的样子改成照 claude.ai 网页版。只在 rail + classic 的电脑布局里生效，
 * 手机不动。这里只加装饰和入口，不碰酒馆原生节点；样式全在 styles/official-web.css，
 * 靠 html[data-cw-web] 开关——条件不满足时摘掉属性、删掉自己加的节点，什么都不留。
 * 「首页项目⌄ / 分享 / 搜索框 / 底部图标」现在只是样子（Lulu：先做个样子）；
 * 「新建对话」真能用，等于侧栏原有的新对话按钮。
 * 2.0.316（Lulu 看了 315）：去掉「项目 / 作品」；「更多」做成真的折叠——收起时把「背景」「扩展」藏到它下面，
 * 状态记在 localStorage；日期分组一律英文（Today / Yesterday / Oct 8 / Older），照官网。
 * 2.0.317（Lulu）：「更多」收格式化、偏好设置、背景、扩展四项（留预设、API、世界书、角色卡）；
 * 搜索框变成真输入框——按角色名、聊天名、预览筛最近对话，Esc 清空。
 * 2.0.318（Lulu：只筛侧栏没什么用）：停手 350ms 后再用酒馆自己的 /api/chats/search 把每个角色和群组的
 * 全部聊天搜一遍（正文 + 文件名，多个词要全中），结果放在侧栏下面「All chats」，去掉上面已经列出的；
 * 点一条就打开那段聊天。同时最多 4 个请求，换了关键词旧的作废。
 * 2.0.319（Lulu：搜索效果奇怪）：酒馆默认的聊天文件名带日期时间（xx - 2026-09-23@23h52m…），
 * 搜数字几乎全中，所以本地筛选和结果都不再拿这种自动文件名去比；结果行改成显示「命中的那句」+ 最后消息日期——
 * 以前显示的是最后一条消息，同一段对话的几个分支长得一模一样。前 30 条结果读一遍聊天内容找命中句，
 * 只靠自动文件名命中的那条丢掉。同一角色、命中句一模一样的几条（同一段对话的分支）并成一行，标 ×N，点开最新的那条。
 * 2.0.320（Lulu 定，预览 design-phone-sidebar-v1，按官网尺寸）：手机侧栏也照官网 App——标题右边放搜索图标（点开在标题下
 * 出搜索框，和电脑同一套筛选 + 全部聊天搜索），「更多」折叠同一套，最近对话按日期分组（手机原来没有日期分类）。
 * 手机挂 html[data-cw-web-phone]，电脑挂 html[data-cw-web]，两边互不干扰。小灰字提示一律英文（Search / All chats …）。
 * 2.0.322（Lulu 定，预览 design-icons-v5）：侧栏图标自己重画，尺寸照 Claude 量的——线宽 1.2（24 格），完整图标撑满 80%。
 * 菜单图标在 styles/official-web.css 末尾（由 tools/_tmp/cc-web/patch-322.cjs 从 icons-v5.cjs 生成），这里只管 新建 / More / 搜索。 */
export function installOfficialWeb(win = window) {
  const doc = win.document, root = doc.documentElement;
  const SV = (p, cls = '', sw = 1.6) => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const SVI = (p, cls = '') => SV(p, cls, 1.2);   // 侧栏图标（2.0.322 新画的那套）用细线
  const P = {
    plus: '<path d="M12 4.7v14.6M4.7 12h14.6"/>',
    search: '<circle cx="10.5" cy="10.5" r="7.2"/><path d="m15.7 15.7 5.1 5.1"/>',
    chev: '<path d="m9 4.6 7.4 7.4L9 19.4"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    filter: '<path d="M7 4v6M7 14v6M17 4v2M17 10v10"/><circle cx="7" cy="12" r="2"/><circle cx="17" cy="8" r="2"/>',
    file: '<path d="M14 3.5H7a1.5 1.5 0 0 0-1.5 1.5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8z"/><path d="M14 3.5V8h4.5"/>',
    apps: '<circle cx="7.5" cy="7.5" r="2.6"/><circle cx="16.5" cy="7.5" r="2.6"/><circle cx="7.5" cy="16.5" r="2.6"/><path d="M16.5 13.5v6M13.5 16.5h6"/>',
  };
  const zh = () => (doc.querySelector('#ui_language_select')?.value || win.localStorage.getItem('language') || win.navigator.language || 'en').startsWith('zh');
  const t = (cn, en) => zh() ? cn : en;
  const make = (tag, cls, html) => { const n = doc.createElement(tag); n.className = cls; if (html != null) n.innerHTML = html; return n; };
  const row = (cls, icon, text, extra = '') => make('div', 'cw-web-row ' + cls, SVI(icon) + `<span class="cw-web-label">${text}</span>` + extra);
  const deco = n => { n.setAttribute('aria-hidden', 'true'); return n; };

  // 'desk'：电脑布局（窗口 > 700）；'phone'：CW 的手机布局；null：都不管（窄电脑窗口、关掉、别的结构 / 皮肤）。
  const modeNow = () => {
    if (root.dataset.cwV4 == null || root.dataset.claudeEnabled === 'off' || root.dataset.claudeStructure !== 'rail' || root.dataset.claudeSkin !== 'classic') return null;
    if (root.dataset.claudeLayout === 'mobile') return 'phone';
    return win.innerWidth > 700 ? 'desk' : null;
  };
  let mode = null;

  const mine = () => doc.querySelectorAll('.cw-web-x');
  const teardown = () => {
    searchGen++; win.clearTimeout(searchTimer); query = ''; results = null; mode = null;
    mine().forEach(n => n.remove());
    doc.querySelectorAll('.cw-web-miss').forEach(n => n.classList.remove('cw-web-miss'));
    for (const k of ['cwWeb', 'cwWebPhone', 'cwWebMore', 'cwWebSearch']) delete root.dataset[k];
  };
  // 「更多」：收起时 CSS 把背景、扩展两行压成 0 高（不 display:none 整个 .drawer——它们的设置页是 fixed 的、挂在里面，
  // 开着的页不能跟着消失）。展开 / 收起记住。
  const MORE_KEY = 'claude-web:web-more';
  const moreOpen = () => { try { return win.localStorage.getItem(MORE_KEY) === 'open'; } catch { return false; } };
  const syncMore = () => {
    const open = moreOpen();
    if ((root.dataset.cwWebMore === 'open') !== open) { if (open) root.dataset.cwWebMore = 'open'; else delete root.dataset.cwWebMore; }
    const m = doc.querySelector('#top-settings-holder > .cw-web-more'); if (m && m.getAttribute('aria-expanded') !== String(open)) m.setAttribute('aria-expanded', String(open));
  };
  const toggleMore = () => { try { win.localStorage.setItem(MORE_KEY, moreOpen() ? 'closed' : 'open'); } catch {} syncMore(); };

  // 最近对话按日期分组：一组「角色 + 它下面的重复行」跟着这组第一行的日期走，不拆开。
  // 2.0.325：.chatDate 的 title 是服务端 last_mes 原样。新版酒馆给 ISO；旧版（1.14 前后，Lulu 的云酒馆）给
  // 「October 12, 2026 9:01am」——am/pm 前没空格 Date 认不出，整列日期标题就全没了。也认数字时间戳和「2026-10-12@09h01m」。
  const parseWhen = raw => {
    const s = String(raw ?? '').trim(); if (!s) return null;
    if (/^\d{10,13}$/.test(s)) return new Date(Number(s) * (s.length === 10 ? 1000 : 1));
    let d = new Date(s.replace(/(\d)\s*(am|pm)\b/i, '$1 $2'));
    if (!isNaN(d)) return d;
    const m = s.match(/(\d{4})-(\d{1,2})-(\d{1,2})(?:\s*@\s*(\d{1,2})h\s*(\d{1,2})m)?/);
    if (m) { d = new Date(+m[1], m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0)); if (!isNaN(d)) return d; }
    return null;
  };
  const dayLabel = raw => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const d = parseWhen(raw); if (!d) return null; d.setHours(0, 0, 0, 0);
    const days = Math.round((today - d) / 864e5);
    if (days <= 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    return 'Older';
  };
  // 搜索：一组（角色行 + 它下面的重复行）里只要有一行对上，就留下这组的头一行；对上的行都留；
  // 整组都没对上就连同日期标题一起藏。筛的是侧栏里已经列出来的最近对话。
  let query = '';
  // 酒馆自动起的聊天名：「角色 - 2026-9-23@23h52m25s748ms」或群组的「2026-10-02@08h09m37s996ms」。改过名的才算标题。
  const AUTO_NAME = /\d{4}-\d{1,2}-\d{1,2} ?@ ?\d{1,2}h ?\d{1,2}m/;
  const fileText = f => (f && !AUTO_NAME.test(f)) ? f : '';
  const rowText = r => [r.querySelector('.characterName')?.textContent, fileText(r.querySelector('.chatName')?.title), r.querySelector('.chatMeta')?.textContent, r.querySelector('.chatPreview')?.textContent].join(' ').toLowerCase();
  const filterRecents = list => {
    const q = query.trim().toLowerCase();
    const kids = [...list.children];
    let header = null, headerHits = 0, head = null, headHit = false, groupHit = false;
    const flushGroup = () => { if (head) { const keep = headHit || groupHit; head.classList.toggle('cw-web-miss', !keep); if (keep) headerHits++; } head = null; headHit = groupHit = false; };
    const flushHeader = () => { flushGroup(); if (header) header.classList.toggle('cw-web-miss', !!q && !headerHits); header = null; headerHits = 0; };
    for (const n of kids) {
      if (n.classList.contains('cw-web-date')) { flushHeader(); header = n; continue; }
      if (!n.classList.contains('recentChat')) continue;
      const hit = !q || rowText(n).includes(q);
      if (n.classList.contains('cw-rec-rep')) { n.classList.toggle('cw-web-miss', !hit); if (hit) groupHit = true; continue; }
      flushGroup(); head = n; headHit = hit;
    }
    flushHeader();
  };
  // ---- 全部聊天搜索 ----
  let searchGen = 0, searchTimer = 0, results = null;   // results: { q, items, done, total }
  const ctx = () => win.SillyTavern?.getContext?.();
  const stripExt = f => String(f || '').replace(/\.jsonl$/, '');
  const stamp = v => { if (typeof v === 'number') return v; const n = Date.parse(v); return isNaN(n) ? 0 : n; };
  const recentsSlot = () => doc.querySelector('#top-settings-holder .clawd-rail-recents');
  const keyOf = i => (i.group ? 'g:' + i.group : 'c:' + i.avatar) + '|' + i.file;
  const shownKeys = () => new Set([...doc.querySelectorAll('#top-settings-holder .recentChatList > .recentChat:not(.cw-web-miss)')]
    .map(r => (r.dataset.group ? 'g:' + r.dataset.group : 'c:' + r.dataset.avatar) + '|' + r.dataset.file));
  const openResult = async item => {
    const c = ctx(); if (!c) return;
    try {
      if (item.group) {
        // 照酒馆自己的 openRecentGroupChat：先选中群组（openGroupById，不在 getContext 里，从同一个模块 URL 取），
        // 再切到那段聊天。只调 openGroupChat 会在没选中群组时清掉聊天、页面半切换。
        const groups = await import(new URL('/scripts/group-chats.js', doc.baseURI).href);
        if (await groups.openGroupById(item.group) === false) return;
        if (c.getCurrentChatId?.() !== item.file) await groups.openGroupChat(item.group, item.file);
        return;
      }
      const id = c.characters.findIndex(x => x.avatar === item.avatar);
      if (id < 0) { win.toastr?.error?.(t('找不到这个角色。', 'Character not found.')); return; }
      await c.selectCharacterById(id);
      if (c.getCurrentChatId?.() !== item.file) await c.openCharacterChat(item.file);
    } catch (error) { console.error('[Claude Web] 打开搜索结果失败:', error); win.toastr?.error?.(t('无法打开这段聊天。', 'Could not open this chat.')); }
  };
  // 命中句：去掉标签和 markdown 符号，找第一条包含全部关键词的消息，从第一个词前 4 个字开始截。
  const fragsOf = q => q.toLowerCase().split(/\s+/).filter(Boolean);
  const plain = v => String(v || '').replace(/<[^>]*>/g, ' ').replace(/[*_`#>~]+/g, '').replace(/\s+/g, ' ').trim();
  const findSnippet = (messages, frags) => {
    let fallback = null;
    for (const m of Array.isArray(messages) ? messages : []) {
      if (!m || typeof m.mes !== 'string') continue;
      const txt = plain(m.mes), low = txt.toLowerCase();
      const at = low.indexOf(frags[0]); if (at < 0) continue;
      const start = Math.max(0, at - 4), end = at + frags[0].length;
      const snip = { pre: (start > 0 ? '…' : '') + txt.slice(start, at), hit: txt.slice(at, end), post: txt.slice(end, end + 60) };
      if (frags.every(f => low.includes(f))) return snip;
      fallback ??= snip;
    }
    return fallback;
  };
  const fetchChat = async item => {
    const c = ctx();
    const res = await win.fetch(item.group ? '/api/chats/group/get' : '/api/chats/get', { method: 'POST', headers: c.getRequestHeaders(),
      body: JSON.stringify(item.group ? { id: item.file } : { ch_name: item.name, file_name: item.file, avatar_url: item.avatar }) });
    return res.ok ? res.json() : [];
  };
  const shortDate = ms => {
    if (!ms) return '';
    const d = new Date(ms), now = new Date();
    return d.getFullYear() === now.getFullYear() ? (d.getMonth() + 1) + '/' + d.getDate() : d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
  };
  const resultRow = item => {
    const r = make('div', 'cw-web-result'); r.setAttribute('role', 'button'); r.tabIndex = 0;
    const av = make('span', 'cw-web-result-av');
    if (item.avatar) { const img = doc.createElement('img'); img.alt = ''; img.loading = 'lazy'; img.src = ctx()?.getThumbnailUrl?.('avatar', item.avatar) || ''; av.append(img); }
    else av.textContent = (item.name || '?').slice(0, 1);
    const name = make('span', 'cw-web-result-name'); name.textContent = item.name || '';
    const prev = make('span', 'cw-web-result-prev');
    if (item.snip) {
      const hit = make('b', 'cw-web-hit'); hit.textContent = item.snip.hit;
      prev.append(item.snip.pre, hit, item.snip.post);
    } else prev.textContent = item.checked ? fileText(item.file) || item.preview : '…';
    const date = make('span', 'cw-web-result-date'); date.textContent = shortDate(item.last);
    const twins = item.twins || [item.file];
    // 两行：上面 名字 · ×N · 日期，下面整行命中句（一行放不下时命中的字会被省略号吃掉）。
    const top = make('span', 'cw-web-result-top'); top.append(name);
    if (twins.length > 1) { const n = make('span', 'cw-web-result-count'); n.textContent = '×' + twins.length; top.append(n); }
    top.append(date);
    const body = make('span', 'cw-web-result-body'); body.append(top, prev);
    r.title = twins.join('\n'); r.append(av, body);
    r.addEventListener('click', () => openResult(item));
    r.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openResult(item); } });
    return r;
  };
  const renderResults = () => {
    const slot = recentsSlot(); if (!slot) return;
    let box = slot.querySelector(':scope > .cw-web-results');
    const q = query.trim();
    if (!q || !results || results.q !== q) { box?.remove(); return; }
    const shown = shownKeys();
    const merged = new Map();
    for (const i of results.items.filter(i => !i.drop && !shown.has(keyOf(i))).sort((a, b) => b.last - a.last)) {
      const same = i.snip ? (i.group || i.avatar) + '|' + i.snip.pre + i.snip.hit + i.snip.post : keyOf(i);
      const first = merged.get(same);
      if (first) { first.twins.push(i.file); continue; }
      merged.set(same, Object.assign(i, { twins: [i.file] }));
    }
    const items = [...merged.values()].slice(0, 50);
    const busy = results.done < results.total || results.checking;
    // 只在内容变了时重画：结果框挂在最近列表的观察范围里，每次重画都会再触发一次 ensure。
    const sig = [q, results.done, results.total, results.checked, items.map(i => keyOf(i) + '*' + i.twins.length).join(',')].join('#');
    if (box?.dataset.sig === sig) return;
    if (!box) { box = make('div', 'cw-web-results cw-web-x'); slot.append(box); }
    box.dataset.sig = sig; box.replaceChildren();
    const head = make('div', 'cw-web-date cw-web-results-head');
    const label = make('span'); label.textContent = 'All chats';
    const state = make('span', 'cw-web-results-state'); state.textContent = busy ? results.done + '/' + results.total : '';
    head.append(label, state); box.append(head);
    items.forEach(i => box.append(resultRow(i)));
    if (!busy && !items.length) { const none = make('div', 'cw-web-results-none'); none.textContent = 'No other chats found'; box.append(none); }
  };
  const runSearch = async q => {
    const gen = ++searchGen, c = ctx(); if (!c) return;
    const targets = [
      ...(c.characters || []).filter(x => x?.avatar).map(x => ({ avatar: x.avatar, name: x.name })),
      ...(c.groups || []).filter(g => g?.id).map(g => ({ group: g.id, name: g.name })),
    ];
    results = { q, items: [], done: 0, total: targets.length, checked: 0, checking: false };
    renderResults();
    let next = 0, paint = 0;
    const repaint = () => { if (!paint) paint = win.requestAnimationFrame(() => { paint = 0; if (gen === searchGen) renderResults(); }); };
    const worker = async () => {
      while (next < targets.length && gen === searchGen) {
        const tg = targets[next++];
        try {
          const res = await win.fetch('/api/chats/search', { method: 'POST', headers: c.getRequestHeaders(),
            body: JSON.stringify(tg.group ? { query: q, group_id: tg.group } : { query: q, avatar_url: tg.avatar }) });
          const list = res.ok ? await res.json() : [];
          if (gen !== searchGen) return;
          for (const r of Array.isArray(list) ? list : []) {
            results.items.push({ ...tg, file: stripExt(r.file_name), preview: r.preview_message || '', last: stamp(r.last_mes) });
          }
        } catch (error) { console.warn('[Claude Web] 搜索聊天失败', tg.name, error); }
        if (gen !== searchGen) return;
        results.done++; repaint();
      }
    };
    await Promise.all(Array.from({ length: 4 }, worker));
    if (gen !== searchGen) return;
    // 第二步：给排在前面的 30 条找命中句（同时 3 个），只靠自动文件名命中的丢掉。
    const frags = fragsOf(q), shown = shownKeys();
    const todo = results.items.filter(i => !shown.has(keyOf(i))).sort((a, b) => b.last - a.last).slice(0, 30);
    results.checking = todo.length > 0; repaint();
    let k = 0;
    const checker = async () => {
      while (k < todo.length && gen === searchGen) {
        const item = todo[k++];
        try {
          item.snip = findSnippet(await fetchChat(item), frags);
          if (!item.snip && !fileText(item.file).toLowerCase().includes(frags[0])) item.drop = true;
        } catch (error) { console.warn('[Claude Web] 读取聊天失败', item.file, error); }
        if (gen !== searchGen) return;
        item.checked = true; results.checked++; repaint();
      }
    };
    await Promise.all(Array.from({ length: 3 }, checker));
    if (gen === searchGen) { results.checking = false; repaint(); }
  };
  const scheduleSearch = () => {
    win.clearTimeout(searchTimer);
    const q = query.trim();
    if (!q) { searchGen++; results = null; renderResults(); return; }
    if (results?.q === q) return;
    searchGen++;   // 旧关键词还在跑的请求作废
    searchTimer = win.setTimeout(() => runSearch(q), 350);
  };
  const groupRecents = list => {
    const want = []; let last = null;
    for (const r of list.children) {
      if (!r.classList.contains('recentChat') || r.classList.contains('cw-rec-rep') || r.dataset.cwFavorite === '1') continue;
      const g = dayLabel(r.querySelector('.chatDate')?.title || ''); if (!g || g === last) continue;
      last = g; want.push([r, g]);
    }
    const have = [...list.querySelectorAll(':scope > .cw-web-date')];
    const same = have.length === want.length && have.every((h, i) => h.nextElementSibling === want[i][0] && h.dataset.label === want[i][1]);
    if (same) return;
    have.forEach(h => h.remove());
    want.forEach(([r, g], i) => {
      const h = deco(make('div', 'cw-web-date cw-web-x', `<span>${g}</span>` + (i === 0 && mode === 'desk' ? SV(P.filter, 'cw-web-filter') : '')));
      h.dataset.label = g; r.before(h);
    });
  };

  const applyQuery = value => {
    query = value;
    const l = doc.querySelector('#top-settings-holder .clawd-rail-recents .recentChatList'); if (l) filterRecents(l);
    scheduleSearch(); renderResults();
  };
  const makeSearch = () => {
    const box = make('label', 'cw-web-search cw-web-x', SVI(P.search));
    const input = doc.createElement('input');
    input.type = 'search'; input.className = 'cw-web-search-input'; input.placeholder = 'Search';
    input.setAttribute('aria-label', t('搜索聊天', 'Search chats')); input.autocomplete = 'off'; input.spellcheck = false;
    input.value = query;
    input.addEventListener('input', () => applyQuery(input.value));
    input.addEventListener('keydown', e => { if (e.key === 'Escape' && input.value) { e.stopPropagation(); input.value = ''; applyQuery(''); } });
    box.append(input);
    return box;
  };
  // 手机：标题右边的放大镜开 / 关搜索框；关的时候连关键词一起清掉，列表恢复。
  const togglePhoneSearch = () => {
    const open = root.dataset.cwWebSearch !== 'open';
    const input = doc.querySelector('#top-settings-holder > .cw-web-search .cw-web-search-input');
    if (open) { root.dataset.cwWebSearch = 'open'; input?.focus({ preventScroll: true }); }
    else { delete root.dataset.cwWebSearch; if (input) input.value = ''; applyQuery(''); input?.blur(); }
  };

  const ensure = () => {
    const want = modeNow();
    if (want !== mode && (root.dataset.cwWeb != null || root.dataset.cwWebPhone != null)) teardown();
    if (!want) return;
    mode = want;
    if (mode === 'desk' && root.dataset.cwWeb == null) root.dataset.cwWeb = '';
    if (mode === 'phone' && root.dataset.cwWebPhone == null) root.dataset.cwWebPhone = '';
    const holder = doc.getElementById('top-settings-holder'); if (!holder) return;
    if (mode === 'phone') {
      const brand = holder.querySelector(':scope > .clawd-rail-brand');
      if (brand && !brand.querySelector(':scope > .cw-web-phone-search')) {
        const b = make('button', 'cw-web-phone-search cw-web-x', SVI(P.search));
        b.type = 'button'; b.setAttribute('aria-label', t('搜索聊天', 'Search chats'));
        b.addEventListener('click', e => { e.stopPropagation(); togglePhoneSearch(); });
        brand.append(b);
      }
      if (brand && !holder.querySelector(':scope > .cw-web-search')) brand.after(makeSearch());
    }
    const tool = mode === 'desk' && holder.querySelector(':scope > .cw-desk-tool');
    if (tool && !tool.querySelector('.cw-web-brand')) tool.querySelector(':scope > svg:nth-of-type(2)')?.after(deco(make('span', 'cw-web-brand cw-web-x', 'Claude')));
    let search = holder.querySelector(':scope > .cw-web-search');
    if (mode === 'desk' && !search) {
      search = makeSearch();
      (tool || holder.firstElementChild)?.after(search);
      const fresh = row('cw-web-new cw-web-x', P.plus, t('新建对话', 'New chat'));
      fresh.setAttribute('role', 'button'); fresh.tabIndex = 0;
      // 和手机侧栏的「+ 新对话」同一条路（index.js startMobileNewChat）：先点酒馆原生「开始新聊天」，没有再走 /newchat。
      const go = async () => {
        const native = doc.querySelector('#option_start_new_chat, #new_chat, #newChat, [data-i18n="New Chat"], [data-i18n="Start new chat"]');
        if (native instanceof win.HTMLElement) { native.click(); return; }
        try { await win.SillyTavern?.getContext?.()?.executeSlashCommands?.('/newchat'); }
        catch (error) { console.error('[Claude Web] 新建对话失败:', error); win.toastr?.error?.(t('无法新建对话。', 'Could not start a new chat.')); }
      };
      fresh.addEventListener('click', go);
      fresh.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      search.after(fresh);
    }
    const chars = doc.getElementById('rightNavHolder');
    let more = holder.querySelector(':scope > .cw-web-more');
    if (chars && !more) {
      more = row('cw-web-more cw-web-x', P.chev, 'More');   // 2.0.321（Lulu）：小灰字一律英文
      more.setAttribute('role', 'button'); more.tabIndex = 0;
      more.addEventListener('click', toggleMore);
      more.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMore(); } });
      chars.after(more);
    }
    syncMore();
    // 侧栏各项靠 CSS order 排；「更多」跟角色卡同一个 order、DOM 紧跟其后，就排在它下面。样式表晚到时 order 会变，每次对一遍。
    const order = chars && win.getComputedStyle(chars).order;
    if (more && order && more.style.order !== order) more.style.order = order;
    const list = holder.querySelector('.clawd-rail-recents .recentChatList');
    if (list) { groupRecents(list); filterRecents(list); }
    if (query.trim()) renderResults();
    if (mode !== 'desk') return;
    const persona = doc.querySelector('#persona-management-button > .drawer-toggle');
    if (persona && !persona.querySelector('.cw-web-apps')) persona.append(deco(make('span', 'cw-web-apps cw-web-x', SV(P.apps))));
    const form = doc.getElementById('send_form');
    if (form && !form.querySelector(':scope > .cw-web-proj')) form.append(deco(make('div', 'cw-web-proj cw-web-x', `<span>${t('项目', 'Project')}</span>` + SV(P.down))));
    if (!doc.querySelector('body > .cw-web-share')) doc.body.append(deco(make('div', 'cw-web-share cw-web-x', SV(P.file) + `<b>${t('分享', 'Share')}</b>`)));
  };

  if (!doc.getElementById('cw-web-style')) {
    const link = doc.createElement('link'); link.id = 'cw-web-style'; link.rel = 'stylesheet';
    link.href = new URL('styles/official-web.css?v=2.0.152', import.meta.url).href; doc.head.append(link);
  }
  let raf = 0;
  const schedule = () => { if (!raf) raf = win.requestAnimationFrame(() => { raf = 0; ensure(); }); };
  const mos = [];
  const watch = (node, opts) => { if (!node) return; const mo = new win.MutationObserver(schedule); mo.observe(node, opts); mos.push(mo); };
  watch(root, { attributes: true, attributeFilter: ['data-cw-v4', 'data-claude-enabled', 'data-claude-structure', 'data-claude-skin', 'data-claude-layout'] });
  watch(doc.body, { childList: true });
  let holderSeen = null, recSeen = null;
  const watchHolder = () => {
    // 侧栏的直接子节点（装饰被删后补回）+ 最近列表的重绘；不看整棵子树，打开的设置页里的增删与这里无关。
    const h = doc.getElementById('top-settings-holder');
    if (h && h !== holderSeen) { holderSeen = h; watch(h, { childList: true }); }
    const rec = h?.querySelector('.clawd-rail-recents');
    if (rec && rec !== recSeen) { recSeen = rec; watch(rec, { childList: true, subtree: true }); }
  };
  const tick = () => { watchHolder(); schedule(); };
  win.addEventListener('resize', schedule);
  const boot = win.setInterval(tick, 1000);
  tick();
  return () => {
    win.clearInterval(boot); win.removeEventListener('resize', schedule);
    mos.forEach(m => m.disconnect()); if (raf) win.cancelAnimationFrame(raf); teardown(); doc.getElementById('cw-web-style')?.remove();
  };
}

