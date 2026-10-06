/* 输入框上的三只小 Clawd（2.0.223 起；2.0.290 能拖、会自己走走停停）。
   Lulu 2026-10-01 看过原型 Claude outputs/clawd-pile-v1.html 后定的：一格 2px；巫师（星星帽 + 魔杖）躺在上面，
   牛仔帽在左下，墨镜在右下。替换原来那只不能点的装饰图（#send_form::after，icons/clawd.png）。
   2.0.290 照原型 Claude outputs/design-clawd-pile-life-v1.html（Lulu 2026-10-05 认可）：
   · 戳：蹦一下、睁眼一秒再睡回去（墨镜把眼镜往下拉偷看、巫师的魔杖闪一下）。牛仔帽不再往上抬（帽檐和头之间空一行，像悬空的 bug）。
     反应就这么多，不像大 Clawd 那样会摔、会挣扎。
   · 拖：按住拎起来（腿在空中蹬），放到输入框上沿哪里就坐在哪里；放在别的小 Clawd 头上就叠上去。
     背上驮着的那只：还有一只撑着就滑过去坐稳，没有就掉下来醒一下。
   · 作息：睡 40–110 秒 → 醒 → 走走停停 2–4 段（每段 30–100px，中间站着停 1.5–4 秒）→ 坐下睡，循环。
     在上面的先跳下来；驮着别人的不走。
   · 碰撞：站在输入框上的（没叠在别人头上、没被拎着）互相挡，大 Clawd 也算一个会动的障碍。
     每走一步先看前面一格，碰到就停、退一格；放下时重叠就往旁边挤开。大 Clawd 走路时按 left() 给最左边那只让。
   · 位置记在 localStorage（按输入框宽度的比例），刷新以后还在原处。
   2.0.300 照原型 Claude outputs/design-clawd-stack-v2.html（Lulu 2026-10-05 认可）：大 Clawd 不再给小 Clawd 让位，大小互相叠——
     小的能坐到大 Clawd 头上（大 Clawd 走路时驮着走），大 Clawd 也能被丢 / 放到小的头上坐着。拿起下面那只时，上面的平滑地降下来补位，
     睡着的照样睡（以前是掉下来醒一下）。大 Clawd 头上有人时只做安静的小动作；要做别的动作、开始写字、被戳被拎，头上的先跳下来 / 降下来（index.js）。
   像素画和 Clawd 骨架同一套调色板（壳体 #d97757，暗部 #bf684c）。 */
export function createClawdPile({ doc, win, big = null }) {
  const PX = 2, W = 22, H = 18, TOP = 3;            // 每只一张 22×18 格的图，地面在图的下边
  const PAL = { '#': '#d97757', 's': '#bf684c', 'o': '#2b1d17', 'Z': '#1f1d1b', 'w': '#fbf8f1', 'B': '#5b8fb9', 'b': '#3f6f99',
    'y': '#e8b64a', 'Y': '#fff3c4', 'n': '#8b5e3c', 'l': '#cc4f45', 'k': 'var(--clawd-pile-ink)' };
  const BODY = ['..############..', '..############..', '..############..', '################', '################',
    '..############..', '..############..', '..############..'];
  const LEGS = { stand: ['...#.#....#.#...', '...#.#....#.#...'],
    dangleA: ['...#.#....#.#...', '...#.#..........', '...#.#..........'], dangleB: ['...#.#....#.#...', '..........#.#...', '..........#.#...'] };
  const EYES = { shut: [[3, 2, 'oo'], [11, 2, 'oo']], open: [[4, 1, 'o'], [4, 2, 'o'], [11, 1, 'o'], [11, 2, 'o']], half: [[4, 2, 'o'], [11, 2, 'o']] };
  const GLASSES = { on: [[3, 1, 'ZZZZ'], [9, 1, 'ZZZZ'], [7, 1, 'ZZ'], [3, 2, 'ZZZ'], [10, 2, 'ZZZ'], [4, 1, 'w'], [10, 1, 'w']],
    down: [[3, 2, 'ZZZZ'], [9, 2, 'ZZZZ'], [7, 2, 'ZZ'], [3, 3, 'ZZZ'], [10, 3, 'ZZZ'], [4, 2, 'w'], [10, 2, 'w']] };
  const COWBOY = ['.....nnnnnn.....', '....nnnnnnnn....', '....llllllll....', '.nnnnnnnnnnnnnn.'];
  const WIZARD = ['...........b....', '..........Bb....', '.........BBB....', '.......BBBBB....', '......ByBBBBB...', '.....BBBBBByBB..', '..BBBBBBBBBBBB..'];
  const WAND = { rest: [[0, 3, 'n'], [1, 2, 'n'], [2, 1, 'n'], [2, -1, '.y.'], [2, 0, 'yYy'], [2, 1, '.y.']],
    shine: [[0, 3, 'n'], [1, 2, 'n'], [2, 1, 'n'], [2, -1, '.Y.'], [2, 0, 'YwY'], [2, 1, '.Y.']] };
  const NAMES = ['cowboy', 'shades', 'wizard'];
  const BODY_W = 16 * PX, LIFT = 7 * PX, GAP = 2 * PX, EDGE = 14;   // 叠上去抬高 7 格；两只之间至少空 GAP；离输入框左右边 EDGE
  const BIG_W = 48, BIG_REST = 27;   // 大 Clawd：一格 3px，身子 16 格宽；站着头顶离脚底 30px，叠上去的坐在 27px（压进去一格）
  const STEP_MS = 160;                                              // 走路一步 160ms、1 格
  const LEG_X = [3, 5, 10, 12];                                     // 0、2 近侧；1、3 远侧（暗一号）
  const STORE = 'claude-web-clawd-pile-v3';   // v3：存离输入框中线多远（v2 存比例，换格式就换名字）

  const grid = (rows, ox = 0, oy = 0) => { const o = []; rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch !== '.') o.push([x + ox, y + oy, ch]); })); return o; };
  const spans = (l, ox = 0, oy = 0) => { const o = []; for (const [x, y, s] of l) [...s].forEach((ch, i) => { if (ch !== '.') o.push([x + i + ox, y + oy, ch]); }); return o; };
  const calm = () => doc.documentElement.dataset.claudeMotion === 'off' || !!win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* eyes: shut / half / open；pose: crouch / stand / raised（站起来、腿另外画）/ dangleA / dangleB；face: 0 正面 / 1 朝右 / -1 朝左。
     转向照大 Clawd（clawd-rig.js 的 turnL / turnR）：不镜像，背光那一侧暗一列，眼睛（墨镜）往要去的方向偏一格。 */
  function cells(name, eyes, pose, face) {
    const up = pose === 'crouch' ? 0 : pose.startsWith('dangle') ? 3 : 2, by = TOP + 7 - up;
    let c = [];
    if (name === 'cowboy') c = c.concat(grid(COWBOY, 0, by - 4));
    if (name === 'wizard') c = c.concat(grid(WIZARD, 0, by - 7));
    let body = grid(BODY, 0, by);
    if (face) { const dark = face > 0 ? 2 : 13; body = body.map(([x, y, ch]) => [x, y, x === dark ? 's' : ch]); }
    c = c.concat(body);
    if (pose === 'stand' || pose.startsWith('dangle')) c = c.concat(grid(LEGS[pose], 0, by + 8));
    if (name === 'shades') c = c.concat(eyes === 'open' ? spans(EYES.open, face, by).concat(spans(GLASSES.down, face, by)) : spans(GLASSES.on, face, by));
    else c = c.concat(spans(EYES[eyes], face, by));
    if (name === 'wizard') c = c.concat(spans(eyes === 'open' ? WAND.shine : WAND.rest, 15, by));
    return c;
  }
  /* 2.0.227：每只画成一张小图（canvas 转图片），按最近邻放大，缩放屏上不会裂缝。每种样子只画一次，缓存起来。
     被拎着蹬腿的两帧横着拼成一条，Web Animations 换帧，不改 DOM。 */
  const imgCache = new Map();
  function sheet(frames) {
    const key = JSON.stringify(frames);
    let url = imgCache.get(key); if (url) return url;
    const cv = doc.createElement('canvas'); cv.width = W * frames.length; cv.height = H;
    const g = cv.getContext?.('2d');
    if (!g) { imgCache.set(key, 'none'); return 'none'; }   // 没有 canvas 的环境（测试用的 jsdom）：不画，也不抛错
    frames.forEach((f, i) => { for (const [x, y, ch] of f) { if (y < 0 || y >= H) continue; g.fillStyle = PAL[ch]; g.fillRect(x + i * W, y, 1, 1); } });
    url = `url("${cv.toDataURL()}")`; imgCache.set(key, url); return url;
  }

  const K = {};
  let pile = null, form = null, style = null, ro = null, zTimer = 0, zi = 0, destroyed = false;
  let sparks = [], zs = [];
  const timers = new Set();
  const later = (k, fn, ms) => { const t = win.setTimeout(() => { timers.delete(t); k.timers.delete(t); fn(); }, ms); timers.add(t); k.timers.add(t); return t; };
  const clear = k => { for (const t of k.timers) { win.clearTimeout(t); timers.delete(t); } k.timers.clear(); };

  /* ===== 位置 ===== */
  const width = () => pile?.clientWidth || 0;
  function bounds() { return { min: EDGE, max: Math.max(EDGE, width() - EDGE - BODY_W) }; }
  function clampX(x) { const b = bounds(); return Math.round(Math.min(b.max, Math.max(b.min, x)) / PX) * PX; }
  function homeLayout() { const r = width() - EDGE - 60; return { cowboy: { x: r, on: [] }, shades: { x: r + 28, on: [] }, wizard: { x: r + 14, on: ['cowboy', 'shades'] } }; }
  /* 2.0.292（Lulu：欢迎页摆好，进对话就位移）：位置存「离输入框中线多远」。欢迎页和对话页的输入框都居中、只是宽度不同，
     按中线算，换页面时小 Clawd 在屏幕上原地不动，间距也不变（以前按比例算，会左右跑、那一堆还会被挤扁）。 */
  function save(keepHome) {
    if (!keepHome) atHome = false;
    const w = width(); if (!w) return;
    try { win.localStorage.setItem(STORE, JSON.stringify(Object.fromEntries(NAMES.map(n => [n, { dx: Math.round(K[n].x - w / 2), on: K[n].on }])))); } catch { /* 存不了就不记 */ }
  }
  function load() {
    const w = width(); if (!w) return null;
    try {
      const s = JSON.parse(win.localStorage.getItem(STORE) || 'null'); if (!s) return null;
      return Object.fromEntries(NAMES.map(n => [n, { x: clampX(w / 2 + (+s[n]?.dx || 0)), on: Array.isArray(s[n]?.on) ? s[n].on.filter(m => (NAMES.includes(m) || m === 'big') && m !== n) : [] }]));
    } catch { return null; }
  }
  /* 大 Clawd 在这里只是一个「支撑」：它坐在哪只头上（bigOn）由 index.js 落地时告诉这边（bigSat），位置从页面上量。 */
  let bigOn = null;
  const bigState = () => big?.state?.() || null;
  function bigLeft() {   // 大 Clawd 身子左边（骨架外框左上角 = 身子左边，一格 3px）在这一层里的 x；不在 / 没骨架时 null
    const r = doc.querySelector('#send_form .clawd-composer-clawd > .clawd-rig')?.getBoundingClientRect(); if (!r?.width || !pile) return null;
    return r.left - pile.getBoundingClientRect().left;
  }
  const supportTop = n => (n === 'big' ? (bigOn ? supportTop(bigOn) : 0) + BIG_REST : lift(K[n]) + LIFT);   // 坐在 n 头上时离地多高
  const lift = k => (k.on.length ? Math.max(...k.on.map(supportTop)) : 0);
  const carriers = k => NAMES.filter(n => K[n].on.includes(k.name)).concat(bigOn === k.name ? ['big'] : []);
  const onBig = k => k.on.some(n => n === 'big' || onBig(K[n]));   // 直接或间接坐在大 Clawd 头上
  const posX = o => (o.walk ? o.walk.base + o.walk.off : o.x);
  const grounded = except => NAMES.map(n => K[n]).filter(o => o.name !== except && !o.on.length && o.mode !== 'held');
  /* 大 Clawd（输入框上那只能抓能丢的）：按它此刻在屏幕上的位置换算成这一层里的 x，当一个会动的障碍。
     它飞起来（离输入框上沿远）时不算。只在要判断的时候读一次布局。 */
  /* 2.0.300：大 Clawd 站在输入框上（没被拎着、没飞着、没坐在小的头上）才算障碍；它身子 48 宽。 */
  function bigX() {
    const st = bigState(); if (!st?.grounded || bigOn) return null;
    return bigLeft();
  }
  const clashBig = (x, bx) => bx != null && x < bx + BIG_W + GAP && bx < x + BODY_W + GAP;
  function freeAt(x, except, bx = bigX()) {
    const b = bounds(); if (x < b.min || x > b.max || clashBig(x, bx)) return false;
    return grounded(except).every(o => Math.abs(posX(o) - x) >= BODY_W + GAP);
  }
  function nearestFree(x, except) {
    const b = bounds(), bx = bigX(); x = clampX(x); if (freeAt(x, except, bx)) return x;
    for (let d = PX; d < width(); d += PX) for (const s of [-1, 1]) { const t = x + s * d; if (t >= b.min && t <= b.max && freeAt(t, except, bx)) return t; }
    return null;
  }
  function clearPath(a, b, except, bx) {
    const lo = Math.min(a, b), hi = Math.max(a, b), apart = (o, w = BODY_W) => o + w + GAP <= lo || o >= hi + BODY_W + GAP;
    return (bx == null || apart(bx, BIG_W)) && grounded(except).every(o => apart(posX(o)));
  }

  /* ===== 画 ===== */
  function look(k) {
    const el = k.el, ps = k.ps, walking = k.pose === 'walk', dangle = k.pose === 'dangle';
    const frames = walking ? ['raised'] : dangle ? ['dangleA', 'dangleB'] : [k.pose];
    el.classList.toggle('clawd-pile-sleep', k.mode === 'sleep' && k.pose === 'crouch');
    el.classList.toggle('clawd-pile-walking', walking);
    ps.style.backgroundSize = `${frames.length * 100}% 100%`;
    const url = sheet(frames.map(p => cells(k.name, k.eyes, p, k.face)));
    if (ps.style.backgroundImage !== url) ps.style.backgroundImage = url;
    k.kick?.cancel(); k.kick = null;
    if (dangle && ps.animate) k.kick = ps.animate([{ backgroundPosition: '0% 0' }, { backgroundPosition: '100% 0' }], { duration: 720, iterations: Infinity, easing: 'steps(2,jump-none)' });
    else ps.style.backgroundPosition = '0 0';
    legs(k, walking);
  }
  /* 走路的腿（原型 v1.4，Lulu：「对了是这个感觉」）：身子用「站起来、没腿」的图，四根小腿各是一个小块，
     平滑地缩短（抬脚）再伸长（落地），两对轮流，差半个周期；一个周期 = 两步。 */
  function legs(k, on) {
    if (!on) { k.legAnims.forEach(a => a.cancel()); k.legAnims = []; return; }
    if (k.legAnims.length || !k.legEls[0].animate) return;
    const dir = k.face || 1, ease = 'cubic-bezier(.45,0,.55,1)';
    const kf = [{ scale: '1 1', translate: '0 0', easing: ease }, { offset: .28, scale: '1 .4', translate: `${dir * PX * .6}px 0`, easing: ease }, { offset: .5, scale: '1 1', translate: '0 0' }, { scale: '1 1', translate: '0 0' }];
    k.legAnims = k.legEls.map((leg, i) => leg.animate(kf, { duration: 2 * STEP_MS, iterations: Infinity, delay: -(i % 2 ? STEP_MS : 0) }));
  }
  function place(k) {
    const l = lift(k);
    k.el.style.left = `${k.x}px`; k.el.style.top = `${-H * PX - l}px`; k.el.style.zIndex = String(1 + Math.round(l / LIFT));
    k.el.classList.toggle('clawd-pile-up', !!k.on.length);   // 叠在别人头上的：滚动时跟着往下，不切
    k.el.classList.toggle('clawd-pile-onbig', !bigOn && onBig(k));   // 坐在大 Clawd 头上的：滚动时跟着它缩 12px
    k.sh.style.left = `${k.x + 1.5 * PX}px`; k.sh.style.display = k.on.length ? 'none' : '';
  }
  function make(name) {
    const el = doc.createElement('div'); el.className = 'clawd-pile-c'; el.dataset.name = name;
    const b = doc.createElement('div'); b.className = 'clawd-pile-b';
    const ps = doc.createElement('div'); ps.className = 'clawd-pile-s'; b.append(ps);
    const legEls = LEG_X.map((x, i) => { const l = doc.createElement('i'); l.className = 'clawd-pile-leg' + (i % 2 ? ' far' : ''); l.style.cssText = `left:${x * PX}px;top:${(TOP + 13) * PX}px`; b.append(l); return l; });
    el.append(b);
    const sh = doc.createElement('div'); sh.className = 'clawd-pile-shadow';
    pile.append(sh, el);
    const k = { name, el, b, ps, sh, legEls, x: 0, on: [], eyes: 'shut', pose: 'crouch', mode: 'sleep', face: 0, timers: new Set(), legAnims: [], kick: null, walk: null, hop: null };
    K[name] = k; bindPointer(k); return k;
  }

  /* ===== 作息 ===== */
  function sleep(k, first) {
    k.mode = 'sleep'; k.eyes = 'shut'; k.pose = 'crouch'; k.face = 0; look(k);
    later(k, () => wake(k), first ? rnd(8000, 60000) : rnd(40000, 110000));
  }
  function wake(k) {
    if (k.mode !== 'sleep') return;
    if (calm() || doc.hidden) { sleep(k); return; }   // 关了动效 / 页面在后台：接着睡
    k.mode = 'sit'; k.eyes = 'half'; look(k);
    later(k, () => { k.eyes = 'open'; look(k); blink(k, 3); }, 700);
    later(k, () => stroll(k), rnd(1200, 2500));
  }
  function blink(k, n) {
    if (!n || k.mode !== 'sit') return;
    later(k, () => { if (k.mode !== 'sit') return; k.eyes = 'shut'; look(k); later(k, () => { if (k.mode !== 'sit') return; k.eyes = 'open'; look(k); blink(k, n - 1); }, 140); }, rnd(1200, 2600));
  }
  function doze(k) { k.eyes = 'half'; look(k); later(k, () => sleep(k), 900); }
  function stroll(k) {
    clear(k);
    if (carriers(k).length) { k.mode = 'sit'; k.eyes = 'open'; look(k); blink(k, 3); later(k, () => doze(k), rnd(5000, 9000)); return; }
    if (k.on.length) { if (onBig(k) && bigState()?.walking) { later(k, () => stroll(k), 1500); return; } hopDown(k, () => stroll(k)); return; }
    wander(k, 2 + ((Math.random() * 3) | 0));
  }
  function wander(k, n) {
    if (n <= 0) { k.pose = 'crouch'; k.face = 0; k.mode = 'sit'; look(k); save(); later(k, () => doze(k), rnd(1200, 2500)); return; }
    const bx = bigX(); let target = null;
    for (let i = 0; i < 12 && target == null; i++) { const t = Math.round((k.x + (Math.random() < .5 ? -1 : 1) * rnd(30, 100)) / PX) * PX; if (freeAt(t, k.name, bx) && clearPath(k.x, t, k.name, bx)) target = t; }
    if (target == null) { pause(k, () => wander(k, 0)); return; }
    walkTo(k, target, () => pause(k, () => wander(k, n - 1)));
  }
  // 停一下：站着眨眼，偶尔转头往两边看
  function pause(k, next) {
    k.mode = 'sit'; if (k.pose !== 'crouch') k.pose = 'stand'; k.eyes = 'open'; look(k); blink(k, 2);
    if (Math.random() < .5) {
      const side = Math.random() < .5 ? -1 : 1;
      later(k, () => { if (k.mode === 'sit') { k.face = side; look(k); } }, rnd(500, 1200));
      later(k, () => { if (k.mode === 'sit') { k.face = 0; look(k); } }, rnd(1600, 2400));
    }
    later(k, next, rnd(1500, 4000));
  }

  /* ===== 走路：一步一步走，每步先看前面一格 =====
     left 不动，只累加 translate（fill:forwards，每步取消上一段），停下时再把位置写回 left。走的时候不改 DOM。 */
  function walkTo(k, target, done) {
    endWalk(k); atHome = false;   // 一动就不再是默认那一堆
    k.mode = 'walk'; k.eyes = 'open'; k.face = Math.sign(target - k.x) || 1;
    const standing = k.pose === 'stand';
    if (!standing) { k.pose = 'crouch'; look(k); }   // 先坐着转过去，再站起来
    later(k, () => { k.pose = 'stand'; look(k); }, standing ? 0 : 300);
    later(k, () => steps(k, target, done), standing ? 300 : 650);
  }
  function steps(k, target, done) {
    k.walk = { base: k.x, off: 0, target, done, dir: Math.sign(target - k.x) || 1, anim: null, sanim: null, t: 0 };
    k.pose = 'walk'; look(k); stepOnce(k);
  }
  function stepOnce(k) {
    const w = k.walk; if (!w) return;
    if (pausedAt) { w.t = win.setTimeout(() => stepOnce(k), 200); return; }   // 滚动时先停步
    const x = w.base + w.off, b = bounds();
    if (x === w.target) { const d = w.done; endWalk(k); arrive(k, d); return; }
    const nx = x + w.dir * PX;
    if (nx < b.min || nx > b.max) { const d = w.done; endWalk(k); arrive(k, d); return; }
    const hit = grounded(k.name).find(o => Math.sign(posX(o) - x) === w.dir && Math.abs(posX(o) - nx) < BODY_W + GAP);
    if (hit) { bump(k, hit); return; }
    const bx = bigX();
    if (bx != null && Math.sign(bx - x) === w.dir && clashBig(nx, bx)) { bump(k, null); return; }
    const from = w.off; w.off += w.dir * PX;
    const kf = [{ translate: `${from}px 0` }, { translate: `${w.off}px 0` }], opt = { duration: STEP_MS, easing: 'linear', fill: 'forwards' };
    w.anim?.cancel(); w.anim = k.el.animate?.(kf, opt); w.sanim?.cancel(); w.sanim = k.sh.animate?.(kf, opt);
    w.t = win.setTimeout(() => stepOnce(k), STEP_MS);
  }
  function endWalk(k) {
    const w = k.walk; if (!w) return null;
    win.clearTimeout(w.t); k.x = w.base + w.off; k.walk = null; place(k); w.anim?.cancel(); w.sanim?.cancel();
    return w;
  }
  function arrive(k, done) { k.pose = 'stand'; look(k); later(k, () => { k.face = 0; look(k); later(k, done, 300); }, 300); }
  // 碰到：停下、退一格，站一下再接着；被碰到的那只要是在睡，半睁眼一下
  function bump(k, o) {
    const w = endWalk(k); k.pose = 'stand'; look(k);
    const back = k.x - w.dir * PX;
    if (freeAt(back, k.name)) slide(k, back, 140);
    if (o && o.mode === 'sleep') { o.eyes = 'half'; look(o); later(o, () => { if (o.mode === 'sleep') { o.eyes = 'shut'; look(o); } }, 700); }
    later(k, () => arrive(k, w.done), 450);
  }
  function slide(k, to, ms, done) {
    const from = k.x; k.x = to; place(k);
    const kf = [{ translate: `${from - to}px 0` }, { translate: '0 0' }], opt = { duration: ms, easing: 'cubic-bezier(.2,.7,.3,1)' };
    const a = k.el.animate?.(kf, opt); k.sh.animate?.(kf, opt);
    if (done) { if (a) a.onfinish = done; else done(); }
  }
  // 落地以后跟别人重叠：往旁边挤开（看得见地滑过去）
  function settle(k, done) {
    const t = k.on.length ? null : nearestFree(k.x, k.name);
    if (t == null || t === k.x) { done?.(); return; }
    slide(k, t, Math.min(420, 140 + Math.abs(t - k.x) * 3), done);
  }
  function hopDown(k, done) {
    const side = Math.random() < .5 ? -1 : 1;
    const t = nearestFree(k.x + side * (BODY_W + 4 * PX), k.name); if (t == null) { doze(k); return; }
    const fromY = -lift(k), fromX = k.x;
    k.on = []; k.x = t; place(k); k.mode = 'walk'; k.pose = 'stand'; k.eyes = 'open'; look(k);
    const a = k.el.animate?.([{ translate: `${fromX - t}px ${fromY}px` }, { offset: .35, translate: `${(fromX - t) * .55}px ${fromY - 14}px` }, { translate: '0 0' }], { duration: 520, easing: 'cubic-bezier(.3,0,.6,1)' });
    const land = () => { squash(k); k.pose = 'crouch'; look(k); later(k, done, 400); };
    if (a) a.onfinish = land; else land();
  }
  const squash = k => k.b.animate?.([{ scale: '1 1' }, { scale: '1.12 .86', offset: .35 }, { scale: '.97 1.04', offset: .7 }, { scale: '1 1' }], { duration: 320 });

  /* ===== 戳 ===== */
  const HOP = [
    { translate: '0 0', scale: '1 1', easing: 'cubic-bezier(.3,0,.5,1)' },
    { offset: .18, translate: '0 0', scale: '1.08 .9', easing: 'cubic-bezier(.2,.8,.4,1)' },
    { offset: .5, translate: `0 -${3 * PX}px`, scale: '.95 1.07', easing: 'cubic-bezier(.5,0,.8,.4)' },
    { offset: .78, translate: '0 0', scale: '1.07 .92', easing: 'cubic-bezier(.3,0,.4,1)' },
    { translate: '0 0', scale: '1 1' },
  ];
  function poke(k) {
    const was = k.mode, eyes = k.eyes;
    const w = endWalk(k); if (w) { k.pose = 'stand'; k.face = 0; }   // 走到一半：停在当前这一格，看你一眼
    k.eyes = 'open'; look(k);
    if (!calm()) { k.hop?.cancel(); k.hop = k.b.animate?.(HOP, { duration: 460 }); if (k.name === 'wizard') sparkle(k); }
    later(k, () => {
      if (k.mode === 'held') return;
      if (w) { k.face = w.dir; look(k); later(k, () => { if (k.mode === 'walk') steps(k, w.target, w.done); }, 300); return; }
      if (was === 'sleep') { k.eyes = 'half'; look(k); later(k, () => { if (k.mode === 'sleep') { k.eyes = 'shut'; look(k); } }, 400); }
      else { k.eyes = eyes; look(k); }
    }, 1000);
  }

  /* ===== 拖 =====
     touch-action:none 一直挂着（Android 在 pointerdown 时就决定要不要平移页面，见 index.js 大 Clawd 那段）。
     事件不往外冒，免得点到输入框、触发酒馆自己的点击。 */
  function bindPointer(k) {
    let sx = 0, sy = 0, down = false, drag = false, ox = 0, oy = 0, id = null;
    const stop = e => { e.stopPropagation(); };
    k.el.addEventListener('pointerdown', e => {
      if (e.button) return; stop(e); e.preventDefault();
      down = true; drag = false; sx = e.clientX; sy = e.clientY; id = e.pointerId;
      try { k.el.setPointerCapture(id); } catch { /* 有的 WebView 不支持就算了 */ }
    });
    k.el.addEventListener('pointermove', e => {
      if (!down || e.pointerId !== id) return; stop(e);
      if (!drag && Math.hypot(e.clientX - sx, e.clientY - sy) > 4) { drag = true; const r = k.el.getBoundingClientRect(); ox = sx - r.left; oy = sy - r.top; pickUp(k); }
      if (drag) { const p = pile.getBoundingClientRect(); k.el.style.left = `${e.clientX - p.left - ox}px`; k.el.style.top = `${e.clientY - p.top - oy}px`; }
    });
    const up = e => {
      if (!down || e.pointerId !== id) return; stop(e); down = false;
      if (!drag) { if (e.type === 'pointerup') poke(k); return; }
      const p = pile.getBoundingClientRect(); drop(k, e.clientX - p.left - ox + BODY_W / 2, e.clientY - p.top);
    };
    k.el.addEventListener('pointerup', up);
    k.el.addEventListener('pointercancel', up);
    k.el.addEventListener('click', stop);
  }
  function pickUp(k) {
    atHome = false;
    const bigHeight = bigOn ? supportTop(bigOn) : null;
    const bigSeatX = bigOn ? K[bigOn].x : null;
    clear(k); endWalk(k); k.el.getAnimations?.().forEach(a => a.cancel()); k.sh.getAnimations?.().forEach(a => a.cancel());
    k.mode = 'held';   // 先标成拎着：下面落下来的不用躲它原来的位置
    const above = carriers(k);
    lowerFrom(above.filter(n => n !== 'big').map(n => K[n]), k.name);
    k.on = [];   // 先从下面那几只头上下来，下面的才算空出来，大 Clawd 能降到它们头上
    // 支撑被抽走后，座位可能变矮，也可能从两只的中点移到剩下那只上面。
    if (above.includes('big') || (bigOn && (supportTop(bigOn) !== bigHeight || K[bigOn].x !== bigSeatX))) lowerBig();
    k.pose = 'dangle'; k.eyes = 'open'; k.face = 0;
    k.el.classList.add('clawd-pile-held'); k.el.style.zIndex = '9'; k.sh.style.display = 'none'; look(k);
  }
  /* 2.0.312（Lulu：把 Clawd 拿开的时候大 Clawd 会浮空）：大 Clawd 坐着的那只没了——它降下来；正下方还有别的小 Clawd 就坐到它头上
     （以前一律降到输入框上，会和下面那几只叠在一起）。坐到谁头上由 index.js 量（big.lower() 返回名字）；头上的跟着平滑地降。 */
  function lowerBig() {
    bigOn = null;
    const name = big?.lower?.() || null;
    if (name && K[name] && K[name].mode !== 'held') {
      bigOn = name; atHome = false;
      const s = K[name]; if (s.walk) { endWalk(s); clear(s); arrive(s, () => doze(s)); }
    }
    if (NAMES.some(n => onBig(K[n]))) relayoutFlip(400); else for (const n of NAMES) if (K[n].mode !== 'held') place(K[n]);
  }
  /* 下面那只被拿走（或大 Clawd 要干别的）：上面的平滑地降下来补位——还有别的撑着就落到它头上，没有就落回输入框上
     （重叠的话挪开一点）。睡着的照样睡，不醒（以前是掉下来、醒一下）。hop = true：跳开（大 Clawd 要做别的动作时）。 */
  function lowerFrom(list, gone, hop = false) {
    if (!list.length) return;
    for (const t of list) {
      t.on = t.on.filter(n => n !== gone);
      if (!t.on.length) {
        endWalk(t);
        const side = hop ? (Math.random() < .5 ? -1 : 1) * (BIG_W / 2 + BODY_W) : 0;
        t.x = nearestFree(t.x + side, t.name) ?? clampX(t.x + side);
      }
    }
    relayoutFlip(hop ? 520 : 400, hop);
    save();
  }
  /* 摆位变了：每只从原来的地方平滑地滑 / 降到新地方（FLIP）。hop：中间往上跳一下。 */
  function relayoutFlip(ms, hop = false) {
    const before = new Map(NAMES.map(n => [n, { l: parseFloat(K[n].el.style.left) || 0, t: parseFloat(K[n].el.style.top) || 0 }]));
    stackX();
    for (const n of NAMES) if (K[n].mode !== 'held') place(K[n]);
    for (const n of NAMES) {
      const k = K[n]; if (k.mode === 'held') continue;
      const b = before.get(n), dx = b.l - k.x, dy = b.t - (parseFloat(k.el.style.top) || 0);
      if (Math.abs(dx) < .5 && Math.abs(dy) < .5) continue;
      const kf = hop ? [{ translate: `${dx}px ${dy}px` }, { offset: .35, translate: `${dx * .55}px ${dy - 14}px` }, { translate: '0 0' }] : [{ translate: `${dx}px ${dy}px` }, { translate: '0 0' }];
      const a = k.el.animate?.(kf, { duration: ms, easing: hop ? 'cubic-bezier(.3,0,.6,1)' : 'cubic-bezier(.4,0,.2,1)' });
      if (!k.on.length) k.sh.animate?.([{ translate: `${dx}px 0` }, { translate: '0 0' }], { duration: ms, easing: 'cubic-bezier(.4,0,.2,1)' });
      if (a && hop) a.onfinish = () => squash(k);
    }
  }
  function drop(k, px, py) {
    k.el.classList.remove('clawd-pile-held');
    const cx = px - BODY_W / 2;
    // 放在某只头上：横向重叠一大半、松手时在它头顶上面（不看正被拎着的）
    const below = NAMES.map(n => K[n]).filter(o => o !== k && o.mode !== 'held' && !carriers(o).length && Math.abs(posX(o) - cx) < BODY_W * .6)
      .sort((a, b) => Math.abs(posX(a) - cx) - Math.abs(posX(b) - cx))[0];
    const fromX = parseFloat(k.el.style.left) || k.x, fromY = parseFloat(k.el.style.top) || 0;
    // 2.0.300：大 Clawd 停稳、头顶没人时，也能放到它头上
    // 2.0.303（Lulu：大 Clawd 坐在小 Clawd 头上时放不上去，直接穿过去）：以前用 bigX() 判断，它只认站在输入框上的大 Clawd；
    // 坐在别人头上的也要算，头顶高度按它实际坐的位置算（supportTop('big')）。
    const bl = bigState()?.grounded ? bigLeft() : null, bigFree = bl != null && !NAMES.some(n => K[n].on.includes('big'));
    const onBigHead = bigFree && Math.abs(bl + BIG_W / 2 - (cx + BODY_W / 2)) < BIG_W * .55 && py < -supportTop('big') + 6
      && (!below || Math.abs(bl + BIG_W / 2 - px) < Math.abs(posX(below) + BODY_W / 2 - px));
    if (onBigHead) { k.on = ['big']; stackX(); }
    else if (below && py < -H * PX * .5 - lift(below)) {
      if (below.walk) { endWalk(below); clear(below); below.mode = 'sit'; below.pose = 'crouch'; below.face = 0; look(below); later(below, () => doze(below), 2500); }
      k.x = below.x; k.on = [below.name];
    } else { k.x = clampX(cx); k.on = []; }
    place(k);
    const toY = parseFloat(k.el.style.top);
    k.mode = 'sit'; k.pose = 'dangle'; look(k);
    const a = k.el.animate?.([{ translate: `${fromX - k.x}px ${fromY - toY}px` }, { translate: '0 0' }], { duration: Math.min(420, 180 + Math.abs(fromY - toY) * 2), easing: 'cubic-bezier(.5,0,1,1)' });
    const land = () => { squash(k); k.pose = 'crouch'; k.eyes = 'open'; look(k); settle(k, () => { save(); later(k, () => doze(k), rnd(1500, 3000)); }); };
    if (a) a.onfinish = land; else land();
  }

  /* ===== Z 和闪光（2.0.225：建好就一直挂着，平时透明，用 Web Animations 播，不加删元素） ===== */
  const SPARK_AT = [[19, -3, 0], [21, -1, 120], [18, -1, 220], [20, -5, 320]];
  const SPARK = [{ opacity: 1, scale: 1 }, { opacity: 0, scale: 1.6 }];
  const ZFLOAT = [{ opacity: 0, translate: '0 0' }, { offset: .12, opacity: 1 }, { offset: .8, opacity: .9 }, { opacity: 0, translate: `${6 * PX}px -${14 * PX}px` }];
  const shadow = cs => cs.slice().reverse().map(([x, y, ch]) => `${x * PX}px ${y * PX}px 0 .3px ${PAL[ch]}`).join(',');
  function smallBmp(cs, w, h) {
    const cv = doc.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext?.('2d');
    if (!g) return 'none';
    for (const [x, y, ch] of cs) { g.fillStyle = PAL[ch]; g.fillRect(x, y, 1, 1); }
    return `url("${cv.toDataURL()}")`;
  }
  function buildFx() {
    const fx = (cls, w, h, css) => { const n = doc.createElement('div'); n.className = cls; n.style.cssText = `width:${w * PX}px;height:${h * PX}px;${css}`; pile.append(n); return n; };
    const star = smallBmp([[0, 1, 'Y'], [1, 0, 'Y'], [1, 2, 'Y'], [2, 1, 'Y'], [1, 1, 'w']], 3, 3);
    sparks = SPARK_AT.map(() => fx('clawd-pile-spark', 3, 3, `background-image:${star}`));
    // 2.0.228：Z 用 box-shadow 小方块（做成图放大后斜笔画会时有时无）。大小两个轮流，同时只飘一个。
    const big = spans([[0, 0, 'kkkk'], [2, 1, 'k'], [1, 2, 'k'], [0, 3, 'kkkk']]), small = spans([[0, 0, 'kkk'], [1, 1, 'k'], [0, 2, 'kkk']]);
    zs = [fx('clawd-pile-z', 1, 1, `box-shadow:${shadow(big)}`), fx('clawd-pile-z', 1, 1, `box-shadow:${shadow(small)}`)];
  }
  function sparkle(k) {
    const top = -H * PX - lift(k);
    sparks.forEach((s, i) => {
      const [dx, dy, delay] = SPARK_AT[i];
      s.style.left = `${k.x + (dx - 1) * PX}px`; s.style.top = `${top + (TOP + 7 + dy - 1) * PX}px`;
      s.animate?.(SPARK, { duration: 500, delay, easing: 'steps(4)' });
    });
  }
  // Z：每 5 秒从睡着的里面挑一只，从它头顶往右上飘一个（飘 4.2 秒）。页面在后台、关了动效、正在滚动时不飘。
  function puffZ() {
    if (!pile || doc.hidden || calm() || pausedAt) return;
    const s = NAMES.map(n => K[n]).filter(k => k.mode === 'sleep' && !carriers(k).length); if (!s.length) return;
    const k = s[(Math.random() * s.length) | 0], z = zs[zi++ % zs.length]; if (!z) return;
    z.style.left = `${k.x + 12 * PX}px`; z.style.top = `${-H * PX - lift(k) + (TOP + 5) * PX}px`;
    z.animate?.(ZFLOAT, { duration: 4200, easing: 'linear' });
  }

  const CSS = `
html body #send_form#send_form.clawd-has-pile::after{content:none!important}
html body #send_form#send_form>.clawd-pile.clawd-pile{display:block!important}
.clawd-pile{--clawd-pile-ink:#6b6560;--clawd-pile-shadow:rgba(20,20,19,.14);position:absolute;left:0;right:0;bottom:100%;height:0;margin-bottom:-1px;z-index:2;pointer-events:none}
html[data-claude-integrated-theme="night"] .clawd-pile{--clawd-pile-ink:#bdb7ae;--clawd-pile-shadow:rgba(0,0,0,.35)}
.clawd-pile>.clawd-pile-c{position:absolute;width:${W * PX}px;height:${H * PX}px;pointer-events:auto;cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}
.clawd-pile>.clawd-pile-c.clawd-pile-held{cursor:grabbing}
.clawd-pile .clawd-pile-b{position:absolute;inset:0;transform-origin:${8 * PX}px 100%;transition:translate .24s cubic-bezier(.3,1.6,.5,1)}
/* 2.0.291（Lulu：滚动时小 Clawd 卡在原地不动）：照大 Clawd 的「扒着输入框」——滚动时身子缩下去 4 格，输入框上沿以下的部分切掉，
   只露头、帽子和两只钳子扒着边；停下来再弹出来。站在输入框上的那几只一直按地面线切（反正地面以下不该露出来），
   叠在别人头上的不切、跟着一起往下。拎着的不动。只切换一个属性，不逐帧算。 */
.clawd-pile>.clawd-pile-c:not(.clawd-pile-held):not(.clawd-pile-up){clip-path:inset(-60px -60px 0 -60px)}
.clawd-pile[data-paused]>.clawd-pile-c:not(.clawd-pile-held)>.clawd-pile-b{translate:0 ${4 * PX}px;transition-duration:.12s;transition-timing-function:ease-out}
.clawd-pile[data-paused]>.clawd-pile-c.clawd-pile-onbig:not(.clawd-pile-held)>.clawd-pile-b{translate:0 var(--clawd-pile-bigdrop,12px)}
/* 2.0.309：大 Clawd 坐在小 Clawd 头上时，和它叠在一起的那几只（垫着的、坐它头上的）滚动时不缩 */
.clawd-pile[data-paused]>.clawd-pile-c.clawd-pile-still:not(.clawd-pile-held)>.clawd-pile-b{translate:none}
.clawd-pile[data-paused]>.clawd-pile-shadow.clawd-pile-still{opacity:1}
.clawd-pile>.clawd-pile-shadow{transition:opacity .2s}
.clawd-pile[data-paused]>.clawd-pile-shadow{opacity:0}
.clawd-pile .clawd-pile-s{position:absolute;inset:0;background-repeat:no-repeat;image-rendering:pixelated;pointer-events:none}
.clawd-pile .clawd-pile-leg{position:absolute;display:none;width:${PX}px;height:${2 * PX}px;background:#d97757;transform-origin:50% 0;pointer-events:none}
.clawd-pile .clawd-pile-leg.far{background:#bf684c}
.clawd-pile .clawd-pile-walking .clawd-pile-leg{display:block}
.clawd-pile>.clawd-pile-shadow{position:absolute;top:-2px;width:${13 * PX}px;height:3px;border-radius:50%;background:var(--clawd-pile-shadow);pointer-events:none}
/* 呼吸（果冻）：睡着时各自轻轻压扁再回弹，原点在身体底边；周期和起点错开。 */
.clawd-pile .clawd-pile-sleep>.clawd-pile-b{animation:clawd-pile-breathe 3.1s ease-in-out infinite}
.clawd-pile .clawd-pile-sleep[data-name="shades"]>.clawd-pile-b{animation-duration:3.5s;animation-delay:-1.2s}
.clawd-pile .clawd-pile-sleep[data-name="wizard"]>.clawd-pile-b{animation-duration:2.8s;animation-delay:-.6s}
@keyframes clawd-pile-breathe{0%,100%{scale:1 1}42%{scale:1.07 .91}58%{scale:.96 1.05}72%{scale:1.015 .985}84%{scale:1 1}}
.clawd-pile :is(.clawd-pile-z,.clawd-pile-spark){position:absolute;left:0;top:0;z-index:5;pointer-events:none;opacity:0;background-repeat:no-repeat;background-size:100% 100%;image-rendering:pixelated}
html[data-claude-motion="off"] .clawd-pile *{animation:none!important}
.clawd-pile[data-paused] *{animation:none!important}   /* 缩下去时呼吸停掉回原样，不冻在半截 */
@media (prefers-reduced-motion:reduce){.clawd-pile *{animation:none!important}}
html[data-claude-decorations="off"] .clawd-pile{display:none!important}
.clawd-pile[data-unlaid]{visibility:hidden}`;

  /* 2.0.235（Lulu：更新后滚动对话变卡）：滚动时先把这一层的呼吸、飘 Z、走路暂停，停下来 0.4 秒后再接着动。
     暂停只改这一层自己的属性，不碰 html / body。
     2.0.304（Lulu：小 Clawd 有时莫名缩下去扒着输入框）：以前在整页上听 scroll（capture），输入框文字多了自己滚、
     别的面板 / 下拉滚，都会让它们缩下去。现在不自己听了，由 index.js 告诉这边：
     · hush()：对话区每次滚动都调，只暂停走路 / 飘 Z / 腿的动画（性能，2.0.235 那条），样子不变；
     · peek(on, bigDrop)：和大 Clawd 同一个判断（手动滚、过了速度死区、没在打字、没在生成）才缩下去扒边。
       bigDrop：坐在大 Clawd 头上的跟着往下多少（大 Clawd 扒边 12、它不动 0）。bigSeated（2.0.309）：大 Clawd 坐在小的头上，和它叠着的都不缩。 */
  let pausedAt = 0, resumeTimer = 0, peeking = false;
  const allAnims = () => [...zs, ...NAMES.map(n => K[n]).flatMap(k => (k ? k.legAnims : []))].flatMap(x => (x.getAnimations ? x.getAnimations() : [x]));
  function setPaused(on) {
    if (!pile) return;
    if (on) {
      if (!pausedAt) { pausedAt = Date.now(); for (const a of allAnims()) a.pause?.(); }
      win.clearTimeout(resumeTimer); resumeTimer = win.setTimeout(() => setPaused(false), 400);
    } else if (pausedAt && !peeking) {
      pausedAt = 0; for (const a of allAnims()) a.play?.();
    }
  }
  const hush = () => setPaused(true);
  // bigSeated：大 Clawd 坐在小的头上——它不动，和它叠在一起的（垫着它的那一串、坐它头上的）也不缩
  function peek(on, bigDrop = 12, bigSeated = false) {
    if (!pile) return;
    if (on) {
      pile.style.setProperty('--clawd-pile-bigdrop', `${bigDrop}px`);
      const still = new Set();
      if (bigSeated && bigOn) { const down = n => { if (n === 'big' || still.has(n)) return; still.add(n); K[n].on.forEach(down); }; down(bigOn); }
      for (const n of NAMES) { const k = K[n]; if (!k) continue; const s = bigSeated && (still.has(n) || onBig(k)); k.el.classList.toggle('clawd-pile-still', s); k.sh.classList.toggle('clawd-pile-still', s); }
      if (!peeking) { peeking = true; pile.setAttribute('data-paused', ''); }
      setPaused(true);
    } else if (peeking) {
      peeking = false; pile.removeAttribute('data-paused'); setPaused(false);
    }
  }

  /* 输入框变宽变窄（窗口缩放、欢迎页和对话页的输入框不一样宽）：按中线平移（两边一样宽地变），屏幕上原地不动；超出两头的收进来，收进来重叠就挤开。
     只看宽度——打多行字时输入框会变高，那不算。拎着的不动；走到一半的停在原地再挪。
     刚建好时输入框可能还没排版（宽 0），那时先不摆，等第一次量到宽度再摆。 */
  let lastW = 0, laid = false, atHome = false;   // atHome：还是默认那一堆、谁都没动过
  // 叠着的从下往上摆：上面的落在下面那只（骑两只的取中点）正上方
  function stackX() {
    const bl = NAMES.some(n => K[n].on.includes('big')) ? bigLeft() : null;
    const fell = [];
    if (bl == null) for (const n of NAMES) if (K[n].on.includes('big')) { K[n].on = K[n].on.filter(m => m !== 'big'); if (!K[n].on.length) fell.push(K[n]); }   // 大 Clawd 不在（关了 / 没骨架 / 刚刷新还没建好）：落回地上
    unstack(fell);   // 2.0.306：落下来别和原来垫着大 Clawd 的那只重叠（刷新后两只叠在同一个位置）
    const depth = k => (k.on.length ? 1 + Math.max(...k.on.map(n => (n === 'big' ? 0 : depth(K[n])))) : 0);
    const cxOf = m => (m === 'big' ? bl + BIG_W / 2 : K[m].x + BODY_W / 2);
    for (const k of NAMES.map(n => K[n]).filter(k => k.on.length).sort((p, q) => depth(p) - depth(q)))
      k.x = Math.round((k.on.reduce((t, m) => t + cxOf(m), 0) / k.on.length - BODY_W / 2) / PX) * PX;
  }
  function unstack(moved) {   // 被收进来的那几只跟别人重叠：挤开（原来那一堆本来就挨着，不动它）
    for (const k of moved) { const t = nearestFree(k.x, k.name); if (t != null) k.x = t; }
  }
  function relayout() {
    const w = width(); if (!pile || !w) return;
    if (!laid) {
      const saved = load(); atHome = !saved;
      const s = saved || homeLayout();
      for (const n of NAMES) { K[n].x = s[n].x; K[n].on = s[n].on; }
      stackX(); for (const n of NAMES) place(K[n]);
      laid = true; lastW = w; pile.removeAttribute('data-unlaid'); return;
    }
    if (w === lastW) return;
    const old = lastW;
    lastW = w;
    // 还是默认那一堆：照当前宽度重新摆在右边角上（页面刚启动时输入框会先后变几次宽，按第一次的宽度摆会偏）
    if (atHome) { const h = homeLayout(); for (const n of NAMES) { K[n].x = h[n].x; K[n].on = h[n].on; } stackX(); for (const n of NAMES) place(K[n]); return; }
    const d = Math.round((w - old) / 2 / PX) * PX;
    const moved = [];
    /* 2.0.306（Lulu：大 Clawd 放在中间还是会位移）：大 Clawd 现在也按中线跟着输入框走（index.js watchClawdFormWidth），
       两边挪的量一样，叠着的自然对得上，不用再把它坐着的那只往它底下摆。只有那只被收进来（离开了中线平移的位置）时，
       大 Clawd 就降下来。 */
    const seatX0 = bigOn ? K[bigOn].x : null;
    for (const n of NAMES) {
      const k = K[n]; if (k.mode === 'held' || k.on.length) continue;
      const wk = endWalk(k);
      const want = k.x + d; k.x = clampX(want); if (k.x !== want) moved.push(k);
      if (wk) arrive(k, wk.done);
    }
    unstack(moved); stackX();
    if (bigOn && Math.abs(K[bigOn].x - (seatX0 + d)) > PX) lowerBig();
    for (const n of NAMES) place(K[n]);
    save(true);
  }
  function build() {
    pile.querySelectorAll(':scope>*').forEach(n => n.remove());
    for (const n of NAMES) make(n);
    buildFx();
    laid = false; lastW = 0; pile.setAttribute('data-unlaid', '');   // 量到宽度、摆好之前先藏着，免得在角上闪一下
    for (const n of NAMES) sleep(K[n], true);
    relayout();
  }
  function ensure() {
    if (destroyed) return null;
    const f = doc.querySelector('#send_form');
    if (!f) return null;
    if (!style || !style.isConnected) { style = doc.createElement('style'); style.id = 'clawd-pile-style'; style.textContent = CSS; doc.head.append(style); }
    if (!pile || !f.contains(pile)) {
      for (const n of NAMES) if (K[n]) { clear(K[n]); endWalk(K[n]); }
      pile?.remove(); form = f; peeking = false;
      pile = doc.createElement('div'); pile.className = 'clawd-pile'; pile.setAttribute('aria-hidden', 'true');
      f.append(pile); build();
      ro?.disconnect(); ro = win.ResizeObserver ? new win.ResizeObserver(() => relayout()) : null; ro?.observe(f);
    }
    if (!f.classList.contains('clawd-has-pile')) f.classList.add('clawd-has-pile');
    if (!zTimer) zTimer = win.setInterval(puffZ, 5000);
    return pile;
  }
  // 大 Clawd 走路 / 落地时要让开：返回它右边、最近那只站在输入框上的小 Clawd 在屏幕上的左边（没有就返回 null）。
  // 被拖到大 Clawd 左边的那只不算，不然大 Clawd 会以为右边没地方了。
  function left() {
    if (!pile || !pile.isConnected) return null;
    const r = pile.getBoundingClientRect(); if (!r.width) return null;
    const bx = bigX();
    const xs = grounded('').map(posX).filter(x => bx == null || x >= bx);
    return xs.length ? r.left + Math.min(...xs) : null;
  }
  function destroy() {
    destroyed = true; win.clearInterval(zTimer); zTimer = 0; win.clearTimeout(resumeTimer);
    ro?.disconnect(); ro = null;
    for (const n of NAMES) if (K[n]?.walk) win.clearTimeout(K[n].walk.t);
    for (const t of timers) win.clearTimeout(t); timers.clear();
    form?.classList.remove('clawd-has-pile');
    pile?.remove(); pile = null; style?.remove(); style = null;
  }
  /* ===== 2.0.300 给 index.js（大 Clawd）用的 ===== */
  // 大 Clawd 被丢 / 放下时，哪些小 Clawd 头上能坐：屏幕上的中心 x、身宽，和坐上去离地多高
  function seats(origin = null) {
    if (!pile) return [];
    const left = origin ?? pile.getBoundingClientRect().left;
    return NAMES.map(n => K[n]).filter(k => k.mode !== 'held' && !carriers(k).length && !onBig(k))
      .map(k => ({ name: k.name, cx: left + posX(k) + BODY_W / 2, w: BODY_W, h: lift(k) + LIFT }));
  }
  // 一次量坐标原点，飞行逐帧从当前支撑图/位置取座位，不再沿用松手时的候选和横坐标。
  function trackSeats() {
    if (!pile) return () => [];
    const origin = pile.getBoundingClientRect().left;
    return () => seats(origin);
  }
  // 2.0.312：大 Clawd 掉下来时每一帧确认它要坐的那只还在（没被拎走、头上没别人）——在就返回现在的高度，不在返回 null
  function seatLive(name) {
    const k = K[name]; if (!k || k.mode === 'held' || carriers(k).length || onBig(k)) return null;
    return lift(k) + LIFT;
  }
  // 大 Clawd 坐到某只头上（name）/ 落回地上（null）
  function bigSat(name) {
    bigOn = name && K[name] ? name : null;
    if (bigOn) atHome = false;   // 2.0.306：大 Clawd 坐上默认那一堆，就不再是「谁都没动过」（不然换宽度时那一堆会被重新摆回角上）
    if (bigOn) { const k = K[bigOn]; if (k.walk) { endWalk(k); clear(k); arrive(k, () => doze(k)); } }
    for (const n of NAMES) place(K[n]);
  }
  // 大 Clawd 走路时要停在谁前面：站在输入框上的小 Clawd，屏幕上的左右边
  function blocks() {
    if (!pile) return [];
    const p = pile.getBoundingClientRect();
    return grounded('').map(k => ({ l: p.left + posX(k), r: p.left + posX(k) + BODY_W }));
  }
  const riderCount = () => NAMES.filter(n => K[n]?.on.includes('big')).length;
  // 大 Clawd 被拎起来（lower：头上的降下来）/ 要做别的动作（hop：头上的跳开）
  function unloadBig(kind = 'hop') {
    const list = NAMES.map(n => K[n]).filter(k => k.on.includes('big'));
    if (!list.length) return 0;
    for (const k of list) clear(k);
    lowerFrom(list, 'big', kind === 'hop');
    for (const k of list) if (k.mode !== 'sleep') later(k, () => doze(k), 1600); else sleep(k);
    return list.length;
  }
  // 大 Clawd 走路：头上的跟着挪（只写 translate，不读布局）；走完再按页面重新摆
  let followDx = 0;
  function follow(dx) {
    followDx = dx;
    for (const n of NAMES) { const k = K[n]; if (k && onBig(k)) k.el.style.translate = `${dx}px 0`; }
  }
  // 2.0.306：大 Clawd 被 index.js 挪了（输入框宽度变了）：头上的按它的新位置重新摆
  function restack() { if (!pile || !laid) return; stackX(); for (const n of NAMES) place(K[n]); }
  function followEnd() {
    if (!followDx && !NAMES.some(n => K[n]?.el.style.translate)) return;
    followDx = 0;
    for (const n of NAMES) if (K[n]) K[n].el.style.translate = '';
    stackX(); for (const n of NAMES) place(K[n]); save(true);
  }
  return { ensure, left, destroy, hush, peek, seats, trackSeats, seatLive, bigSat, blocks, riderCount, unloadBig, follow, followEnd, restack };
}
