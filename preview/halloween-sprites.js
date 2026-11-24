/* 第 21 稿像素小件。格子和配色照 CW 的 clawd-pile.js（小 Clawd 一格 2px；蹲坐时身体 16×8 格，手在第 3–4 行）。
   每件都用 compose() 拼：身体坐标里放几层点阵，自动算画布大小，返回图和"身体左上角在画布里的格子位置"(ox, oy)，
   预览页用它把衣服对准真 Clawd 的身体。
   衣服：吸血鬼、黑巫师帽、大 Clawd 的巫师帽都来自 design-halloween-v15/costumes.json（照 Lulu 手绘画的点阵），
   床单幽灵是第 21 稿新画的（Lulu 选它替换手绘里的南瓜灯）。大 Clawd 的帽子 10-20 两次重画，第 23 稿给三种候选（HATS）。
   南瓜桶和糖是第 21 稿第一版的，Lulu 要求保留。 */
export function createHalloweenSprites(document) {
  const PAL = {
    '#': '#d97757', 's': '#bf684c', 'o': '#2b1d17', 'Z': '#1f1d1b', 'w': '#fbf8f1',
    // 床单：暖白、暗面、描边
    'e': '#ece7de', 'k': '#cdc6ba',
    // costumes.json 日间配色
    'K': '#1a1820', 'D': '#ee7d31', 'P': '#7a5aa6', 'L': '#c9b3f7', 'g': '#ffcd73',
    'C': '#2b2239', 'R': '#a33a4a', 'A': '#ff8a09', 'W': '#fff9ef',
    // 南瓜桶：比 Clawd 更亮的南瓜橙，和身体分得开；提手深棕
    'Q': '#ec8a36', 'q': '#c96a1f', 'h': '#3a2a20', 'y': '#e8b64a', 'Y': '#fff3c4', 'n': '#8b5e3c',
    // 糖：Anthropic 插画常用的几种颜色（深 / 浅一对）
    '1': '#6a9bcc', '2': '#788c5d', '3': '#c46686', '4': '#d4a27f', '5': '#9c8fc9', '6': '#d97757',
    '!': '#cfe0f0', '@': '#d6e0c8', '$': '#efd2dc', '%': '#f1e2d2', '^': '#e1dcf2', '&': '#f3d6cb',
  };
  const BODY = ['..############..', '..############..', '..############..', '################', '################',
    '..############..', '..############..', '..############..'];
  const EYES_SHUT = [[3, 2, 'oo'], [11, 2, 'oo']], EYES_OPEN = [[4, 1, 'o'], [4, 2, 'o'], [11, 1, 'o'], [11, 2, 'o']];
  // layers：[行字符串数组, x0, y0]（身体坐标），或 [[x, y, '字'], ...] 的散点
  function compose(layers, { clipBottom = 7 } = {}) {
    const cells = [];
    for (const L of layers) {
      if (Array.isArray(L[0]) && typeof L[0][0] === 'string' && typeof L[1] === 'number') {
        const [rows, x0, y0] = L;
        rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '.' && ch !== ' ') cells.push([x0 + i, y0 + j, ch]); }));
      } else for (const [x, y, s] of L) [...s].forEach((ch, i) => cells.push([x + i, y, ch]));
    }
    const kept = cells.filter(c => c[1] <= clipBottom);     // 蹲坐时地面以下不画
    const minX = Math.min(...kept.map(c => c[0])), maxX = Math.max(...kept.map(c => c[0]));
    const minY = Math.min(...kept.map(c => c[1])), maxY = Math.max(...kept.map(c => c[1]));
    const ox = -minX + 1, oy = -minY + 1, w = maxX - minX + 3, h = maxY - minY + 2;   // 左右上留一格，下面贴地
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d');
    for (const [x, y, ch] of kept) { g.fillStyle = PAL[ch] || ch; g.fillRect(x + ox, y + oy, 1, 1); }
    return { url: cv.toDataURL(), w, h, ox, oy };
  }

  // ── 床单幽灵（原来的牛仔位）：米白床单罩住身体和两只手，头顶鼓起，下摆三道波浪，只露眼洞
  function sheet({ awake = false } = {}) {
    // 字符串第 i 位 = 身体坐标 x = i - 1；第一行 y = -4。眼洞照 CW：睁眼在 x 4 / 11 的第 1–2 行，闭眼是第 2 行两格
    const rows = [
      '......kkkkkk......',
      '....kkwwwwwwkk....',
      '...kwwwwwwwwwwk...',
      '..kwwwwwwwwwwwek..',
      '.kwwwwwwwwwwwwwek.',
      awake ? '.kwwwowwwwwwowwek.' : '.kwwwwwwwwwwwwwek.',
      awake ? '.kwwwowwwwwwowwek.' : '.kwwoowwwwwwoowek.',
      'kwwwwwwwwwwwwwwwek',
      'kwwwwwwwwwwwwwwwek',
      '.kwwwwwwwwwwwwwek.',
      '.kwwwkwwwwwkwwwek.',
      '.kkkk.kkkkk.kkkkk.',
    ];
    return compose([[rows, -1, -4]]);
  }

  // ── 吸血鬼（原来的墨镜位）：墨镜、两边竖起的立领（红里子）、斗篷在胸前用橙扣子扣住再散开
  const VAMPIRE = ['C..............C', 'CR............RC', 'CR.KKKKKKKKKK.RC', 'CC.KWKKKKKKWK.CC', 'CCC.KKK..KKK.CCC',
    'CCCCC......CCCCC', 'CCCCCCCAACCCCCCC', 'CCCCCC.AA.CCCCCC', 'CCCC........CCCC', 'CCC..........CCC', 'CC............CC'];
  function vampire() { return compose([[BODY, 0, 0], [VAMPIRE, 0, -1]]); }

  // ── 黑巫师帽（原来的巫师位）：黑色高帽、橙点、紫色帽尖往回卷；睡着闭眼
  const WITCH = ['....PPPP........', '...PP..PP.......', '...P....PP......', '.......KK.......', '......KKKK......', '......KKDK......',
    '.....KKKKKK.....', '.....KDKKKK.....', '....KKKKKDKK....', '....KKDKKKKK....', '...KKKKKKKKKK...', '.KKKKKKKKKKKKKK.'];
  function witch({ awake = false } = {}) { return compose([[BODY, 0, 0], awake ? EYES_OPEN : EYES_SHUT, [WITCH, 0, -12]]); }

  // ── 大 Clawd 的巫师帽（一格 3px，坐标相对大 Clawd 的框：身体 x2–13、y0–7）
  //    第 21 稿第二版 15 行太高太窄；10-20 照 Lulu 在手绘上标的红黄蓝线改：12 行高，帽身底宽和身体一样（12 格），
  //    上半截也宽，左边斜、右边陡，帽尖往右弯出一个钩；帽檐 20 格、两行，两头收一格；淡紫帽带两行，金扣 4×4 偏右
  //    第 22 稿 12 行那顶像圆筒（一边竖直、顶是平的）；10-20 第二次反馈要"比较大的扁矮三角形"，第 23 稿出三种：
  //    D 照手绘（偏高、尖往右卷钩）、E 大扁三角（左右对称、每行各收一格）、F 扁三角往右歪
  const HATS = {"D": ["...........KKKK.....", "..........KKK.K.....", "..........KKKK......", ".........KKKKK......", "........KKKKKKK.....", ".......KKKKKKKK.....", "......KKKKKggggK....", ".....LLLLLLgLLgL....", "....LLLLLLLgLLgL....", "....KKKKKKKggggK....", ".KKKKKKKKKKKKKKKKKK.", "KKKKKKKKKKKKKKKKKKKK"], "E": [".........KKK........", "........KKKKK.......", ".......KKKKKK.......", "......KKKKKKKK......", ".....KKKKKggggK.....", "....LLLLLLgLLgLL....", "...LLLLLLLgLLgLLL...", ".KKKKKKKKKKKKKKKKKK.", "KKKKKKKKKKKKKKKKKKKK"], "F": ["............KKKK....", "...........KKKK.K...", ".........KKKKKK.....", "........KKKKKKKK....", ".......KKKKggggK....", ".....LLLLLLgLLgLL...", "....LLLLLLLgLLgLL...", "...KKKKKKKKggggKK...", ".KKKKKKKKKKKKKKKKKK.", "KKKKKKKKKKKKKKKKKKKK"]};
  function bigHat(v = 'E') {
    const rows = HATS[v] || HATS.E, h = rows.length, cv = document.createElement('canvas'); cv.width = 20; cv.height = h; const g = cv.getContext('2d');
    rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '.') { g.fillStyle = PAL[ch]; g.fillRect(i, j, 1, 1); } }));
    return { url: cv.toDataURL(), w: 20, h, ox: -2, oy: -h };
  }

  // ── 南瓜桶（大 Clawd 用，一格 3px）：7×6 的桶身 + 两行提手。脸是黑的，像塑料南瓜桶
  function pail() {
    const rows = ['..hhh..', '.h...h.', '.qQQQq.', 'QQQQQQQ', 'QhQQQhQ', 'QQQQQQQ', 'QQhhhQQ', '.qQQQq.'];
    const cv = document.createElement('canvas'); cv.width = 7; cv.height = 8; const g = cv.getContext('2d');
    rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '.') { g.fillStyle = PAL[ch]; g.fillRect(i, j, 1, 1); } }));
    return { url: cv.toDataURL(), w: 7, h: 8 };
  }

  // ── 定稿糖：扭结糖、圆硬糖、玉米糖；几何照 candy 预览 ROWS。
  const CANDY_PAIRS = [['1', '!'], ['2', '@'], ['3', '$'], ['4', '%'], ['5', '^'], ['6', '&']];
  const candyCache=new Map();
  function candy(kind, pair) {
    const key=kind+':'+pair.join('');if(candyCache.has(key))return candyCache.get(key);
    const [C, E] = pair;
    const rows = kind === 0 ? [E + '.' + C + C + C + '.' + E, E + E + C + 'w' + C + E + E, E + '.' + C + C + C + '.' + E]
      : kind === 1 ? ['.' + C + C + C + '.', C + 'w' + E + C + C, C + E + C + C + C, C + C + C + C + C, '.' + C + C + C + '.']
      : ['.Y.', 'yyy', 'QQQ', '.Q.'];
    const w = rows[0].length, h = rows.length, cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d');
    rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '.') { g.fillStyle = ch==='w'?'#ffffff':PAL[ch]; g.fillRect(i, j, 1, 1); } }));
    const result={ url: cv.toDataURL(), w, h };candyCache.set(key,result);return result;
  }

  // ── 睡觉的 Z（照 clawd-pile.js 的两种大小，墨色 #6b6560）
  function zz(big) {
    const c = document.createElement('canvas'), n = big ? 4 : 3; c.width = n; c.height = n; const g = c.getContext('2d'); g.fillStyle = '#6b6560';
    (big ? ['kkkk', '..k.', '.k..', 'kkkk'] : ['kkk', '.k.', 'kkk']).forEach((r, y) => [...r].forEach((ch, x) => { if (ch === 'k') g.fillRect(x, y, 1, 1); }));
    return { url: c.toDataURL(), w: n, h: n };
  }

  // ── 站着的 Clawd（第 25 稿「Clawd 左右看」用）：身体照 BODY，下面四条腿；look = -1 / 0 / 1 往左 / 正 / 往右看，blink 眯一下
  const LEGS = ['...#.#....#.#...', '...#.#....#.#...'];
  function clawd({ look = 0, blink = false } = {}) {
    const x1 = 4 + look, x2 = 11 + look;
    const eyes = blink ? [[x1, 2, 'o'], [x2, 2, 'o']] : [[x1, 1, 'o'], [x1, 2, 'o'], [x2, 1, 'o'], [x2, 2, 'o']];
    return compose([[BODY, 0, 0], [LEGS, 0, 8], eyes], { clipBottom: 9 });
  }

  return { PAL, compose, sheet, vampire, witch, bigHat, pail, candy, CANDY_PAIRS, zz, clawd };
}
