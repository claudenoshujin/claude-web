/* 2.0.341 世界书重排（稿 世界书重排-20261102/design-worldinfo-v1.html）。
 * 五个画面：首页（正在生效 + 全部世界书）、书页（条目列表）、条目页、内容放大、激活设置。
 * 所有读写都走原生控件或原生导出函数：CW 只搬位置、换外观；条目字段靠原生控件自己的
 * input/change 保存，CW 不存数据。搬走的原生节点都留 return 标记，关闭/销毁时放回。 */
export function createWorldPage(h) {
  const {win,t,L,make,button,icon,get,move,cleanup,state,menu,act,openEditor,showToggle,bindRowMenu,rowMore,phoneWide}=h,doc=win.document;
  const WI_URL=()=>new URL('/scripts/world-info.js',win.location.href).href;
  let wi=null,wiLoading=null;
  const loadWI=()=>wiLoading||=import(WI_URL()).then(m=>{wi=m;return m;}).catch(()=>null);
  const ctx=()=>win.SillyTavern?.getContext?.();
  const text=(n,v)=>{if(n&&n.textContent!==v)n.textContent=v;};
  const setHidden=(n,v)=>{if(n&&n.hidden!==v)n.hidden=v;};
  const svg=(paths,{fill=false,w=1.8}={})=>{const s=doc.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','0 0 24 24');s.setAttribute('fill',fill?'currentColor':'none');if(!fill){s.setAttribute('stroke','currentColor');s.setAttribute('stroke-width',String(w));s.setAttribute('stroke-linecap','round');s.setAttribute('stroke-linejoin','round');}s.setAttribute('aria-hidden','true');s.innerHTML=paths;return s;};
  // Icons drawn in the design (I.globe/card/chat/gear/book/back/expand/shrink/imp).
  const ICON={
    globe:()=>svg('<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4a12 12 0 0 1 0 16M12 4a12 12 0 0 0 0 16"/>',{w:1.7}),
    card:()=>svg('<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9.5" cy="11" r="2"/><path d="M14 10h3M14 13h3M7 16h6"/>',{w:1.7}),
    chat:()=>svg('<path d="M5 6h14v10H9l-4 3z"/>',{w:1.7}),
    gear:()=>svg('<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',{w:1.7}),
    book:()=>svg('<path d="M5 5.5A1.5 1.5 0 0 1 6.5 4H19v14H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3"/>',{w:1.7}),
    chev:()=>{const s=svg('<path d="m9 6 6 6-6 6"/>',{w:1.9});s.classList.add('cww-chev');return s;},
    back:()=>svg('<path d="m15 6-6 6 6 6"/>',{w:1.9}),
    plus:()=>svg('<path d="M12 5v14M5 12h14"/>',{w:1.9}),
    imp:()=>svg('<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19h14"/>'),
    expand:()=>svg('<path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7"/>'),
    shrink:()=>svg('<path d="M20 4l-6 6M14 5v5h5M4 20l6-6M10 19v-5H5"/>'),
    search:()=>svg('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.6-3.6"/>'),
    more:()=>svg('<circle cx="6" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18" cy="12" r="1.6"/>',{fill:true}),
  };
  const btn=(label,fn,cls='cwr-btn',ico)=>{const b=button('',fn,cls);if(ico)b.append(ico);if(label)b.append(make('span','',label));return b;};
  const iconBox=ico=>{const n=make('span','cww-ico');n.append(ico);return n;};
  const STATE={constant:['常驻','Constant','const'],normal:['关键词','Keyword','key'],vectorized:['向量','Vector','vec']};
  const POS={'0':['角色定义前','Before character'],'1':['角色定义后','After character'],'5':['示例消息前','Before examples'],'6':['示例消息后','After examples'],'2':['作者注释前',"Before Author's Note"],'3':['作者注释后',"After Author's Note"],'4':['@深度','@Depth'],'7':['输出口','Outlet']};

  /* ---------- 原生数据（只读） ---------- */
  const editor=()=>get('world_editor_select');
  const books=()=>[...(editor()?.options||[])].filter(o=>o.value!=='').map(o=>({name:o.textContent.trim(),value:o.value}));
  const currentBook=()=>{const s=editor();return s&&s.value!==''?s.selectedOptions[0]?.textContent.trim()||'':'';};
  const globalBooks=()=>[...(get('world_info')?.selectedOptions||[])].map(o=>o.textContent.trim());
  function charInfo(){
    const c=ctx();if(!c)return {none:true};
    if(c.groupId!=null&&c.groupId!==undefined&&c.groupId!=='')return {group:true};
    const ch=c.characters?.[c.characterId];if(!ch||c.characterId===undefined)return {none:true};
    const main=ch.data?.extensions?.world||'',file=String(ch.avatar||'').replace(/\.[^/.]+$/,'');
    const extra=wi?.world_info?.charLore?.find(x=>x.name===file)?.extraBooks||[];
    return {name:ch.name,main,extra,books:[main,...extra].filter(Boolean),id:c.characterId};
  }
  const chatBook=()=>{const c=ctx();return c?.chatId?String(c.chatMetadata?.world_info||''):null;};
  const personaBook=()=>String(ctx()?.powerUserSettings?.persona_description_lorebook||'');
  function whereOf(name){const w=[];if(globalBooks().includes(name))w.push('global');if(charInfo().books?.includes(name))w.push('char');if(chatBook()===name)w.push('chat');return w;}
  const WHERE={global:['全局生效','Global'],char:['角色生效','Character'],chat:['聊天生效','Chat']};
  const badges=w=>w.map(k=>make('span','cww-badge'+(k==='global'?' cww-badge-g':''),t(...WHERE[k])));
  // Entry counts only for books already loaded by ST (never fetch a book for the list).
  const counts=new Map();
  function countOf(name){if(counts.has(name))return counts.get(name);if(!wi?.worldInfoCache?.has?.(name))return null;const data=wi.worldInfoCache.get(name);const n=data?.entries?Object.keys(data.entries).length:null;counts.set(name,n);return n;}
  const stats=new Map();
  function statsOf(name){if(stats.has(name))return stats.get(name);if(!wi?.worldInfoCache?.has?.(name))return null;const data=wi.worldInfoCache.get(name),v=Object.values(data?.entries||{}),r={all:v.length,const:v.filter(e=>e.constant).length,vec:v.filter(e=>!e.constant&&e.vectorized).length,off:v.filter(e=>e.disable).length};r.key=r.all-r.const-r.vec;stats.set(name,r);return r;}

  let ui=null;
  /* ---------- 视图切换 ---------- */
  function go(view){
    if(!ui)return;
    if(view!=='entry')clearKeyMode();
    if(ui.view==='entry'&&view!=='entry')closeEntry();
    ui.view=view;ui.panel.dataset.cwwView=view;
    for(const [k,n]of Object.entries(ui.views))setHidden(n,k!==view);
    if(view!=='home')stopSelecting(false);
    ui.panel.scrollTop=0;ui.page.closest('.cw-v4-panel')?.scrollTo?.(0,0);
    paint();
  }
  // 筛选胶囊交给原生的 worldInfoFilter：原生先筛再分页，所以「已停用 6」能看到不在第一页的 6 条，
  // 分页条也显示筛过后的条数（round3 补拍发现：原来只筛当前这一页）。
  const FKEY='cw-world-state';
  const stateOf=e=>e.constant?'const':e.vectorized?'vec':'key';
  function setFilter(k,{repaint=true,silent=false}={}){if(ui)ui.filter=k;const F=wi?.worldInfoFilter;
    if(F?.filterFunctions){if(!F.filterFunctions[FKEY])F.filterFunctions[FKEY]=data=>{const f=F.filterData[FKEY];if(!f||f==='all'||!Array.isArray(data))return data;return data.filter(e=>f==='off'?!!e.disable:stateOf(e)===f);};F.setFilterData(FKEY,k,silent);}
    if(repaint)paint();}
  function dropFilter(){const F=wi?.worldInfoFilter;if(!F?.filterFunctions?.[FKEY])return;if(F.filterData[FKEY]&&F.filterData[FKEY]!=='all')F.setFilterData(FKEY,'all');delete F.filterFunctions[FKEY];delete F.filterData[FKEY];}
  function openBook(value){
    const s=editor();if(!s)return;
    if(s.value!==String(value)){s.value=String(value);win.jQuery?win.jQuery(s).trigger('change'):s.dispatchEvent(new win.Event('change',{bubbles:true}));}
    // 换书时原生会自己重画列表；这里只静默清掉筛选，不能再触发一次重画（两次重画会把两本书的条目叠在一起）。
    setFilter('all',{repaint:false,silent:true});go('book');
  }

  /* ---------- 首页 ---------- */
  function whereRow(kind,ico,title,meta,onClick){
    const r=make('div','cw-v4-row cww-row cww-where-row'),info=make('div','cw-v4-row-info'),nm=make('div','cw-v4-row-title',title),mt=make('p','',meta),val=make('div','cww-val');
    info.append(nm,mt);r.append(iconBox(ico),info,val,ICON.chev());r.tabIndex=0;r.setAttribute('role','button');r.dataset.cwwWhere=kind;
    const run=e=>{if(r.getAttribute('aria-disabled')==='true')return;onClick(e);};
    r.addEventListener('click',run);r.addEventListener('keydown',e=>{if(e.target===r&&['Enter',' '].includes(e.key)){e.preventDefault();run(e);}});
    return {r,nm,mt,val};
  }
  const pills=(host,names,empty)=>{const key=(names.join('\n')||'-')+'|'+empty;if(host.dataset.key===key)return;host.dataset.key=key;host.replaceChildren(...(names.length?names.map(n=>make('span','cww-bk',n)):[make('span','cww-bk cww-bk-none',empty)]));};
  function decoratePicker(dialog) {
    const char = dialog.querySelector('.character_world_info_selector');
    const chat = dialog.querySelector('.chat_world_info_selector');
    if ((!char && !chat) || dialog.classList.contains('cw2-world-binding')) return;
    const source = (char || chat).closest('.character_world,.chat_world');
    if (!source) return;
    const extra = source.querySelector('.character_extra_world_info_selector');
    const select2 = extra && win.jQuery?.(extra).data('select2');
    const placeholder=t('没有附加的世界书，点这里选择','Select additional lorebooks');
    if(select2?.selection?.placeholder){
      select2.selection.placeholder.text=placeholder;
      const search=select2.selection.$search?.get(0);
      if(search&&!extra.selectedOptions.length)search.setAttribute('placeholder',placeholder);
    }
    const name = source.querySelector('.character_name')?.textContent.trim();
    const title = char ? (name ? t(name+'的世界书', name+'’s World Info') : t('角色世界书','Character World Info')) : t('聊天世界书','Chat World Info');
    const desc = char
      ? t('绑在这个角色上，只在和该角色聊天时用。导出角色卡时会附带主要世界书。','Applies in chats with this character. The primary lorebook is included when exporting the card.')
      : t('绑在当前这段聊天上。生成回复时，会和全局、角色的世界书一起用。','Applies to this chat alongside global and character lorebooks when generating replies.');
    const fields = make('div','cw2-world-fields');
    function add(select, label) {
      if (!select) return;
      const field = make('div','cw2-world-field');
      if (label) field.append(make('span','cw2-world-label',label));
      select.setAttribute('aria-label',label||title);
      const box = make('span','cw2-world-select');
      const container = select.nextElementSibling?.matches('.select2-container') ? select.nextElementSibling : null;
      box.append(select);
      if (container) box.append(container);
      const empty = [...select.options].find(option=>option.value==='');
      if (empty && !select.multiple) empty.textContent=t('--- 不绑定 ---','--- None ---');
      field.append(box);
      fields.append(field);
    }
    add(char || chat,char ? t('主要世界书','Primary lorebook') : '');
    add(extra,t('附加世界书','Additional lorebooks'));
    source.replaceChildren(make('h3','',title),make('p','',desc),fields);
    source.classList.add('cw2-world-popup');
    dialog.classList.add('cw2-world-binding');
    if (extra && win.jQuery?.fn.select2 && !win.jQuery(extra).data('select2')) {
      win.jQuery(extra).select2({width:'100%',placeholder,
        allowClear:true,closeOnSelect:false,dropdownParent:win.jQuery(dialog)});
      dialog.addEventListener('close',()=>{
        if(win.jQuery(extra).data('select2'))win.jQuery(extra).select2('destroy');
      },{once:true});
    }
  }
  let globalPopup = null;
  async function openGlobalWorlds(picker) {
    if (!picker?.isConnected || globalPopup) return;
    const active = ui;
    const {Popup, POPUP_TYPE} = await import(new URL('/scripts/popup.js', win.location.href).href);
    if (active !== ui || !picker.isConnected || globalPopup) return;

    const content = make('div', 'cw2-world-popup');
    content.append(make('h3', '', t('全局世界书', 'Global World Info')));
    content.append(make('p', '', t('选中的世界书每段聊天都会用，可以选多本。', 'Select one or more lorebooks to use in every chat.')));
    const popup = new Popup(content, POPUP_TYPE.TEXT, '', {
      okButton: t('完成', 'Done'), allowVerticalScrolling: true,
    });
    const anchor = doc.createComment('cw-world-picker-return');
    picker.before(anchor);
    const select = get('world_info');
    const dropdown = select && win.jQuery?.(select).data('select2')?.dropdown;
    const parent = dropdown?.$dropdownParent;
    const search = picker.querySelector('.select2-search__field');
    const oldPlaceholder = search?.getAttribute('placeholder');
    const placeholder=t('搜索或选择世界书','Search or select lorebooks');
    const placeholderAdapter=select&&win.jQuery?.(select).data('select2')?.selection?.placeholder;
    const oldPlaceholderText=placeholderAdapter?.text;
    if(placeholderAdapter)placeholderAdapter.text=placeholder;
    if(search&&!select.selectedOptions.length)search.setAttribute('placeholder',placeholder);
    if (dropdown && parent) dropdown.$dropdownParent = win.jQuery(popup.dlg);

    const restore = () => {
      if (globalPopup?.popup !== popup) return;
      globalPopup = null;
      if (dropdown && parent) {
        win.jQuery(select).select2('close');
        dropdown.$dropdownParent = parent;
      }
      if(placeholderAdapter)placeholderAdapter.text=oldPlaceholderText;
      if(search&&search.getAttribute('placeholder')===placeholder){
        if(oldPlaceholder==null)search.removeAttribute('placeholder');else search.setAttribute('placeholder',oldPlaceholder);
      }
      anchor.replaceWith(picker);
    };
    globalPopup = {popup, restore};
    const box=make('div','cw2-world-select');
    box.append(picker);
    content.append(box);
    try {
      await popup.show();
    } finally {
      restore();
    }
  }
  function buildHome(s,view){
    const head=make('div','cwr-list-head cww-head'),actions=make('div','cwr-list-actions');head.append(make('h2','',t('世界书','World Info')),actions);
    const imp=get('world_import_button'),create=get('world_create_button');
    if(imp){act(s,imp,'导入');const ic=ICON.imp();ic.classList.add('cww-btn-ic');ic.setAttribute('aria-hidden','true');imp.prepend(ic);imp.classList.add('cww-has-ic');cleanup(s,()=>{ic.remove();imp.classList.remove('cww-has-ic');});move(s,imp,actions);}
    if(create){act(s,create,'新建世界书',true,true);move(s,create,actions);}
    view.append(head,make('p','cwr-lede cww-sub',t('世界书在三个地方生效：全局（每段聊天都用）、绑在角色上、绑在这段聊天上。','World Info applies in three places: globally (every chat), bound to a character, or bound to this chat.')));
    const where=make('section','cw-v4-section cww-where');where.append(make('h2','',t('正在生效','Active now')));const card=make('div','cw-v4-card');where.append(card);view.append(where);
    const picker=get('WIMultiSelector'),park=make('div','cw-v4-park');view.append(park);if(picker)move(s,picker,park);
    // The book picker is driven by the list rows; keep it (and its select2 box) live but out of sight.
    const ed=editor(),edPark=make('div','cww-park');view.append(edPark);if(ed){const c=s2box(ed);move(s,ed,edPark);if(c)move(s,c,edPark);}
    ui.global=whereRow('global',ICON.globe(),t('全局','Global'),t('每段聊天都会用','Used in every chat'),()=>openGlobalWorlds(picker).catch(console.error));
    ui.char=whereRow('char',ICON.card(),t('当前角色','Current character'),t('只在和这个角色聊天时用','Only in chats with this character'),()=>{const b=get('world_button');b?.dispatchEvent(new win.MouseEvent('click',{bubbles:true,cancelable:true,shiftKey:true}));});
    ui.chat=whereRow('chat',ICON.chat(),t('当前聊天','Current chat'),t('只在这一段聊天里用','Only in this chat'),()=>{const b=doc.querySelector('.chat_lorebook_button');b?.dispatchEvent(new win.MouseEvent('click',{bubbles:true,cancelable:true,shiftKey:true}));});
    ui.act=whereRow('act',ICON.gear(),t('激活设置','Activation settings'),'',()=>go('act'));ui.act.val.remove();
    card.append(ui.global.r,ui.char.r,ui.chat.r,ui.act.r);
    // 全部世界书
    const all=make('div','cww-books'),h2=make('h2','cww-sub-h cww-books-h',t('全部世界书','All World Info')),n=make('span','cww-n'),side=make('span','cww-sec-actions');h2.append(n);all.append(h2);
    const pick=btn(t('选择','Select'),()=>startSelecting(),'cww-text-btn'),pickAll=btn(t('全选','Select all'),()=>selectAll(),'cww-text-btn'),done=btn(t('完成','Done'),()=>stopSelecting(true),'cww-text-btn');
    side.append(pick,pickAll,make('span','cww-dot-sep','·'),done);h2.append(side);
    const tools=make('div','cww-tools'),find=make('label','cwr-search-box cww-find'),q=make('input','cwr-search');q.type='search';q.placeholder=t('搜索世界书','Search World Info');q.setAttribute('aria-label',q.placeholder);find.append(icon('search'),q);tools.append(find);
    const list=make('div','cw-v4-card cww-book-list'),empty=make('p','cwr-empty cww-empty',t('没有匹配的世界书','No matching World Info'));
    all.append(tools,list,empty);view.append(all);
    q.addEventListener('input',()=>paintBooks());
    // 手机：列表下面再放一组「新建 / 导入」。
    const opts=make('div','cw-v4-card cww-opts cww-phone-only');
    for(const [label,id,ico] of [[t('新建世界书','New World Info'),'world_create_button',ICON.plus()],[t('导入','Import'),'world_import_button',ICON.imp()]]){
      const r=make('div','cw-v4-row cww-row'),info=make('div','cw-v4-row-info');
      info.append(make('div','cw-v4-row-title',label));r.append(iconBox(ico),info);
      r.tabIndex=0;r.setAttribute('role','button');r.addEventListener('click',()=>get(id)?.click());opts.append(r);
    }
    view.append(opts);
    // 选择模式：底部浮条，和预设的多选浮条同一个组件。
    const bar=make('div','cwr-selection-bar cww-selection-bar'),cnt=make('span','');bar.hidden=true;
    bar.append(cnt,btn(t('取消','Cancel'),()=>stopSelecting(true),'cwr-btn cwr-ghost'),btn(t('导出','Export'),()=>exportSelected(),'cwr-btn'),btn(t('删除','Delete'),()=>removeSelected(),'cwr-btn cwr-danger'));
    const status=make('p','cwr-status cww-status');status.setAttribute('role','status');
    view.append(status,bar);
    Object.assign(ui,{bookCount:n,bookQuery:q,bookList:list,bookEmpty:empty,pickBtn:pick,pickAllBtn:pickAll,pickDone:done,secSep:side.querySelector('.cww-dot-sep'),selBar:bar,selCount:cnt,status});
  }
  function bookRow(b){
    const r=make('div','cw-v4-row cww-row cww-book'),info=make('div','cw-v4-row-info'),meta=make('p','cww-meta'),check=make('input','cwr-check cww-check');check.type='checkbox';check.tabIndex=-1;check.setAttribute('aria-label',t(`选择${b.name}`,`Select ${b.name}`));
    info.append(make('div','cw-v4-row-title',b.name),meta);const ico=iconBox(ICON.book());r.append(check,ico,info,ICON.chev());r.tabIndex=0;r.setAttribute('role','button');r.dataset.cwwBook=b.name;
    const run=()=>{if(ui.selecting){ui.selected.has(b.name)?ui.selected.delete(b.name):ui.selected.add(b.name);paintBooks();return;}openBook(b.value);};
    r.addEventListener('click',e=>{if(e.target.closest('a'))return;run();});r.addEventListener('keydown',e=>{if(e.target===r&&['Enter',' '].includes(e.key)){e.preventDefault();run();}});
    return {r,meta,check,b};
  }
  function paintBooks(){
    if(!ui)return;
    const all=books(),q=ui.bookQuery.value.trim().toLocaleLowerCase(),list=all.filter(b=>!q||b.name.toLocaleLowerCase().includes(q));
    text(ui.bookCount,String(all.length));
    const rows=list.map(b=>{let row=ui.bookRows.get(b.name);if(!row||row.b.value!==b.value){row=bookRow(b);ui.bookRows.set(b.name,row);}return row;});
    const want=rows.map(x=>x.r);if(want.length!==ui.bookList.children.length||want.some((n,i)=>ui.bookList.children[i]!==n))ui.bookList.replaceChildren(...want);
    for(const row of rows){const n=countOf(row.b.name),w=whereOf(row.b.name),key=n+'|'+w.join(',');if(row.meta.dataset.key!==key){row.meta.dataset.key=key;row.meta.replaceChildren(...(n!=null?[make('span','',t(`${n} 条`,`${n} entries`))]:[]),...badges(w));}
      const picked=ui.selected.has(row.b.name);if(row.check.checked!==picked)row.check.checked=picked;row.r.classList.toggle('cww-picked',picked);}
    for(const name of [...ui.bookRows.keys()])if(!all.some(b=>b.name===name))ui.bookRows.delete(name);
    for(const name of [...ui.selected])if(!all.some(b=>b.name===name))ui.selected.delete(name);
    setHidden(ui.bookEmpty,rows.length>0);
    ui.views.home.classList.toggle('cww-selecting',ui.selecting);
    setHidden(ui.pickBtn,ui.selecting||!all.length);setHidden(ui.pickAllBtn,!ui.selecting);setHidden(ui.pickDone,!ui.selecting);setHidden(ui.secSep,!ui.selecting);
    const size=ui.selected.size;setHidden(ui.selBar,!ui.selecting||!size);text(ui.selCount,t(`已选 ${size} 本`,`${size} selected`));for(const b of ui.selBar.querySelectorAll('button'))b.disabled=!!ui.busy;
    paintMobileHead();
  }
  function paintWhere(){
    const g=globalBooks();pills(ui.global.val,g,t('未选','None'));
    const c=charInfo(),ch=ui.char;
    if(c.none||c.group){text(ch.nm,t('当前角色','Current character'));text(ch.mt,c.group?t('群聊里没有单个角色','Group chats have no single character'):t('没有打开聊天','No chat open'));pills(ch.val,[],t('—','—'));ch.r.setAttribute('aria-disabled','true');}
    else{text(ch.nm,t(`当前角色 · ${c.name}`,`Current character · ${c.name}`));text(ch.mt,t('只在和这个角色聊天时用','Only in chats with this character'));pills(ch.val,c.books,t('未绑定','Not bound'));ch.r.removeAttribute('aria-disabled');}
    const cb=chatBook(),cr=ui.chat;
    if(cb===null){text(cr.mt,t('没有打开聊天','No chat open'));pills(cr.val,[],t('—','—'));cr.r.setAttribute('aria-disabled','true');}
    else{text(cr.mt,t('只在这一段聊天里用','Only in this chat'));pills(cr.val,cb?[cb]:[],t('未绑定','Not bound'));cr.r.removeAttribute('aria-disabled');}
    const d=get('world_info_depth')?.value,b=get('world_info_budget')?.value,r=get('world_info_recursive')?.checked;
    text(ui.act.mt,t(`扫描深度 ${d} · 上下文 ${b}% · 递归 ${r?'开':'关'}`,`Scan depth ${d} · Context ${b}% · Recursion ${r?'on':'off'}`));
  }
  /* 选择模式（批量导出 / 删除，Lulu 11-03 稿 design-batch-delete-v1） */
  function startSelecting(){ui.selecting=true;ui.selected.clear();paintBooks();}
  function stopSelecting(repaint){if(!ui||!ui.selecting&&!ui.selected.size)return;ui.selecting=false;ui.selected.clear();if(repaint)paintBooks();}
  function selectAll(){const q=ui.bookQuery.value.trim().toLocaleLowerCase(),list=books().filter(b=>!q||b.name.toLocaleLowerCase().includes(q)),every=list.length&&list.every(b=>ui.selected.has(b.name));for(const b of list)every?ui.selected.delete(b.name):ui.selected.add(b.name);paintBooks();}
  async function exportNames(names){
    const m=wi||await loadWI(),u=await import(new URL('/scripts/utils.js',win.location.href).href);if(!m)throw Error(t('酒馆的世界书模块没有加载','The native World Info module is unavailable'));
    for(const name of names){const data=await m.loadWorldInfo(name);if(!data)throw Error(t(`读不到「${name}」`,`Could not read “${name}”`));u.download(JSON.stringify(data),`${name}.json`,'application/json');}
  }
  async function exportSelected(){if(!ui||ui.busy||!ui.selected.size)return;try{await exportNames([...ui.selected]);text(ui.status,t(`已导出 ${ui.selected.size} 本`,`Exported ${ui.selected.size}`));}catch(e){text(ui.status,e.message);win.toastr?.error?.(e.message);}}
  function confirmDelete(names){return new Promise(resolve=>{
    const d=make('dialog','cwr-confirm'),list=make('div','cwr-confirm-names'),warn=make('div','cwr-warnings');
    for(const type of ['click','mousedown','touchstart'])d.addEventListener(type,e=>e.stopPropagation());
    d.append(make('h2','',t(`删除 ${names.length} 本世界书？`,`Delete ${names.length} World Info books?`)),make('p','cwr-muted',t('删除以后不能撤销','This cannot be undone')),list);
    for(const name of names)list.append(make('div','',name));
    const g=globalBooks(),c=charInfo(),cb=chatBook(),pb=personaBook();
    for(const name of names){const where=[];if(g.includes(name))where.push(t('全局','global'));if(c.books?.includes(name))where.push(t(`角色「${c.name}」`,`character “${c.name}”`));if(cb===name)where.push(t('当前聊天','this chat'));if(pb===name)where.push(t('用户角色','persona'));
      if(where.length)warn.append(make('p','',t(`「${name}」正在${where.join('、')}上生效`,`“${name}” is active for ${where.join(', ')}`)));}
    if(warn.childElementCount)d.append(warn);
    const backup=make('label','cwr-backup'),check=make('input','');check.type='checkbox';check.checked=false;backup.append(check,make('span','',t('删除前先导出一份备份','Export a backup before deleting')));d.append(backup);
    const actions=make('div','cwr-confirm-actions');let settled=false;const done=v=>{if(settled)return;settled=true;d.close();d.remove();resolve(v);};
    actions.append(button(t('取消','Cancel'),()=>done(null),'cwr-btn'),button(t('删除','Delete'),()=>done({backup:check.checked}),'cwr-btn cwr-danger-primary'));d.append(actions);d.addEventListener('cancel',e=>{e.preventDefault();done(null);});doc.body.append(d);d.showModal();
  });}
  async function removeSelected(){
    if(!ui||ui.busy)return;const current=ui,names=[...ui.selected];if(!names.length)return;
    const consent=await confirmDelete(names);if(!consent||ui!==current)return;current.busy=true;paintBooks();const removed=[];let failed=null;
    try{const m=wi||await loadWI();if(!m?.deleteWorldInfo)throw Error(t('酒馆没有提供删除世界书的接口','The native delete function is unavailable'));
      if(consent.backup)await exportNames(names);
      for(const name of names){failed=name;
        // Same clean-up as the native single delete: extra character books first.
        const lore=m.world_info?.charLore;if(Array.isArray(lore)){let touched=false;for(let i=lore.length-1;i>=0;i--){const x=lore[i];if(x.extraBooks?.includes(name)){touched=true;x.extraBooks=x.extraBooks.filter(e=>e!==name);if(!x.extraBooks.length)lore.splice(i,1);}}if(touched)ctx()?.saveSettingsDebounced?.();}
        if(await m.deleteWorldInfo(name)!==true)throw Error(t(`删除「${name}」失败`,`Failed to delete “${name}”`));
        removed.push(name);current.selected.delete(name);counts.delete(name);stats.delete(name);failed=null;}
      const msg=t(`已删除 ${removed.length} 本${consent.backup?'，备份已下载':''}`,`Deleted ${removed.length}${consent.backup?'; backup downloaded':''}`);text(current.status,msg);win.toastr?.success?.(msg);current.selecting=false;
    }catch(e){const rest=names.filter(n=>!removed.includes(n)&&n!==failed),msg=t(`已删除：${removed.join('、')||'无'}；${failed?`「${failed}」失败，已停下；`:''}没动：${rest.join('、')||'无'}。${e.message}`,`Deleted: ${removed.join(', ')||'none'}. ${failed?`Stopped at “${failed}”. `:''}Not attempted: ${rest.join(', ')||'none'}. ${e.message}`);text(current.status,msg);current.status.setAttribute('role','alert');win.toastr?.error?.(msg);}
    finally{current.busy=false;if(ui===current){ui.selected.clear();paintBooks();}}
  }

  /* ---------- 书页（v2：电脑四列 条目 / 插入位置 / 顺序 / 启用 + ›；手机位置和顺序放第三行） ---------- */
  function buildBook(s,view){
    const back=btn(t('世界书','World Info'),()=>go('home'),'cwr-back cww-back',ICON.back());
    const head=make('div','cwr-list-head cww-head'),title=make('h2',''),actions=make('div','cwr-list-actions');head.append(title,actions);
    const more=menu(s,[['重命名',get('world_popup_name_button'),false,null,'pencil'],['复制一份',get('world_duplicate'),false,null,'copy'],['导出',get('world_popup_export'),false,null,'exp'],'-',['用关键词填充空标题',get('world_backfill_memos'),false,null,'spark'],['把当前排序写入「顺序」',get('world_apply_current_sorting'),false,null,'sort'],['刷新',get('world_refresh'),false,null,'refresh'],'-',['删除这本世界书',get('world_popup_delete'),true,null,'trash']]);
    more.classList.add('cww-book-more');
    const add=get('world_popup_new');if(add){act(s,add,'新建条目',true,true);}
    actions.append(more);if(add)move(s,add,actions);
    const sub=make('p','cwr-lede cww-sub cww-book-sub');
    const tools=make('div','cww-tools'),find=make('label','cwr-search-box cww-find'),search=get('world_info_search');find.append(icon('search'));
    if(search){const old=search.getAttribute('placeholder'),i18n=search.getAttribute('data-i18n');search.placeholder=t('搜索条目名字或关键词','Search entry names or keywords');
      // ST re-applies data-i18n placeholders on language passes; keep ours there too.
      if(i18n!==null)search.setAttribute('data-i18n',[...i18n.split(';').filter(k=>k&&!k.startsWith('[placeholder]')),'[placeholder]'+search.placeholder].join(';'));
      cleanup(s,()=>{old===null?search.removeAttribute('placeholder'):search.setAttribute('placeholder',old);i18n===null?search.removeAttribute('data-i18n'):search.setAttribute('data-i18n',i18n);});search.classList.add('cwr-search');cleanup(s,()=>search.classList.remove('cwr-search'));move(s,search,find);}
    tools.append(find);const sort=get('world_info_sort_order');if(sort){const box=make('span','cww-sort');tools.append(box);move(s,sort,box);}
    const chips=make('div','cww-chips');chips.setAttribute('role','group');chips.setAttribute('aria-label',t('筛选','Filter'));
    ui.chipBtns={};for(const k of ['all','const','key','vec','off']){const b=make('button','cww-chip');b.type='button';b.dataset.filter=k;b.addEventListener('click',()=>setFilter(k));chips.append(b);ui.chipBtns[k]=b;}
    // 色点图例放在筛选胶囊下面（第二行只写关键词或策略名）。
    const legend=make('div','cww-legend');for(const k of ['constant','normal','vectorized']){const [zh,en,kind]=STATE[k],it=make('span',''),d=make('i','cww-dot');d.dataset.kind=kind;it.append(d,doc.createTextNode(t(zh,en)));legend.append(it);}
    const ehead=make('div','cww-ehead');for(const [zh,en] of [['条目','Entry'],['插入位置','Position'],['顺序','Order'],['启用','On'],['','']])ehead.append(make('span','',t(zh,en)));
    const card=make('div','cw-v4-card cww-entry-card'),list=make('div','cww-entry-list'),empty=make('p','cwr-empty cww-empty',t('没有符合条件的条目','No matching entries'));
    // 分页条：原生分页照旧（隐藏），这里只读它的范围、点它的上一页 / 下一页。
    const pagerBar=make('div','cww-pager'),pagerText=make('span',''),prev=button('',()=>get('world_info_pagination')?.querySelector('.paginationjs-prev:not(.disabled)')?.click(),'cww-pb'),next=button('',()=>get('world_info_pagination')?.querySelector('.paginationjs-next:not(.disabled)')?.click(),'cww-pb');
    prev.append(ICON.back());next.append(svg('<path d="m9 6 6 6-6 6"/>',{w:1.9}));prev.setAttribute('aria-label',t('上一页','Previous page'));next.setAttribute('aria-label',t('下一页','Next page'));pagerBar.append(pagerText,make('span','cww-grow'),prev,next);
    card.append(list,empty,pagerBar);
    // Native list stays live (parked); CW rows mirror it. A Vue-rendered list (Bai Bai)
    // is shown as it is: never compete for its nodes.
    const nativeHost=make('div','cww-native-list'),pager=get('world_info_pagination'),entries=get('world_popup_entries_list');
    if(entries)move(s,entries,nativeHost);if(pager)move(s,pager,nativeHost);
    const hiddenTools=make('div','cw-v4-park');for(const id of ['OpenAllWIEntries','CloseAllWIEntries'])if(get(id))move(s,get(id),hiddenTools);
    const opts=make('div','cw-v4-card cww-opts cww-phone-only'),r=make('div','cw-v4-row cww-row');{const info=make('div','cw-v4-row-info');info.append(make('div','cw-v4-row-title',t('新建条目','New entry')));r.append(iconBox(ICON.plus()),info);}r.tabIndex=0;r.setAttribute('role','button');r.addEventListener('click',()=>get('world_popup_new')?.click());opts.append(r);
    view.append(back,head,sub,tools,chips,legend,ehead,card,nativeHost,hiddenTools,opts);
    cleanup(s,bindRowMenu(list,'.cww-row-more',trigger=>{
      const entry=ui.nativeRows.get(trigger.closest('.cww-entry'));
      return entry?.isConnected?entryActions(entry):null;
    },ui.panel));
    Object.assign(ui,{bookTitle:title,bookSub:sub,entryList:list,entryEmpty:empty,entryCard:card,pagerBar,pagerText,prevBtn:prev,nextBtn:next,ehead,legend,nativeHost,chips});
    // Rows are rebuilt from the native list once per frame; CW's own nodes live outside it.
    for(const n of [entries,pager].filter(Boolean)){const mo=new win.MutationObserver(()=>queue());mo.observe(n,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});cleanup(s,()=>mo.disconnect());}
    const onInput=e=>{if(e.target.closest?.('#world_popup_entries_list'))queue();};doc.addEventListener('input',onInput,true);doc.addEventListener('change',onInput,true);cleanup(s,()=>{doc.removeEventListener('input',onInput,true);doc.removeEventListener('change',onInput,true);});
  }
  const q=(entry,n)=>entry.querySelector(`[name="${n}"]`);
  // select2 keeps its own container; it is not always the next sibling. Read it before moving the select.
  const s2box=sel=>{const c=win.jQuery?.(sel).data?.('select2')?.$container?.[0];if(c)return c;const n=sel.nextElementSibling;return n?.matches?.('.select2-container')?n:null;};
  function entryData(entry){
    const st=STATE[q(entry,'entryStateSelector')?.value]||STATE.normal;
    const keyField=entry.querySelector('textarea[name="key"]');
    let keys=keyField?keyField.value:entry._cwwKeys;
    if(keys==null){const uid=entry.getAttribute('uid')??entry.dataset.uid,book=currentBook();if(book&&wi?.worldInfoCache?.has?.(book)){const k=keyCache(book)?.[uid];keys=Array.isArray(k)?k.join(', '):'';entry._cwwKeys=keys;}else keys='';}
    const pos=q(entry,'position')?.value,depth=q(entry,'depth')?.value,order=q(entry,'order')?.value;
    const kill=q(entry,'entryKillSwitch'),on=!kill?.classList.contains('fa-toggle-off');
    return {st,keys:String(keys||'').split(',').map(x=>x.trim()).filter(Boolean),pos,depth,order,on,name:q(entry,'comment')?.value.trim()||''};
  }
  // ST's cache clones on every get(); read each book's keys once per paint batch.
  let keyMemo=null;
  function keyCache(book){if(keyMemo?.book===book)return keyMemo.map;const data=wi.worldInfoCache.get(book),map={};for(const [uid,e]of Object.entries(data?.entries||{}))map[uid]=e.key;keyMemo={book,map};return map;}
  const posText=d=>{const p=POS[d.pos];return (p?t(...p):'')+(d.pos==='4'&&d.depth!==''&&d.depth!=null?' '+d.depth:'');};
  function entryActions(entry,beforeDelete){
    const hdr=entry.querySelector('.inline-drawer-header');
    const action=(label,selector,glyph,danger=false)=>{
      const native=hdr?.querySelector(selector);
      return native&&[label,null,danger,()=>{if(danger)beforeDelete?.();native.click();},glyph];
    };
    return menu(null,[
      action('复制这条','.duplicate_entry_button','copy'),
      action('移到其他世界书…','.move_entry_button','move'),
      '-',
      action('删除这条','.delete_entry_button','trash',true)
    ]);
  }
  function entryRow(entry){
    let row=ui.entryRows.get(entry);if(row)return row;
    const r=make('div','cww-entry'),txt=make('div','cww-etxt'),nmLine=make('div','cww-enm'),nm=make('span','cw-v4-row-title'),off=make('span','cww-offtag',t('已停用','Disabled')),meta=make('div','cww-meta'),dot=make('span','cww-dot'),k=make('span','cww-k'),meta2=make('div','cww-meta2');
    nmLine.append(nm,off);meta.append(dot,k);txt.append(nmLine,meta,meta2);
    const pos=make('div','cww-cpos'),ord=make('div','cww-cord'),on=make('div','cww-con'),sw=make('button','cww-tg cww-sm');sw.type='button';sw.setAttribute('role','switch');sw.setAttribute('aria-label',t('启用','Enabled'));on.append(sw);
    const end=make('div','cww-cend');end.append(rowMore('cww-row-more'),ICON.chev());
    r.append(txt,pos,ord,on,end);r.tabIndex=0;r.setAttribute('role','button');
    sw.addEventListener('click',e=>{e.stopPropagation();q(entry,'entryKillSwitch')?.click();queue();});
    const open=()=>openEntry(entry);r.addEventListener('click',e=>{if(!e.target.closest('.cww-row-more'))open();});r.addEventListener('keydown',e=>{if(e.target===r&&e.key==='Enter'){e.preventDefault();open();}});
    row={r,sw,nm,off,dot,k,pos,ord,meta2};ui.entryRows.set(entry,row);ui.nativeRows.set(r,entry);return row;
  }
  function paintEntryRow(entry,row,d){
    text(row.nm,d.name||t('（无标题）','(Untitled)'));setHidden(row.off,d.on);
    if(row.dot.dataset.kind!==d.st[2])row.dot.dataset.kind=d.st[2];
    const missing=d.st[2]==='key'&&!d.keys.length;row.k.classList.toggle('cww-missing',missing);
    text(row.k,d.st[2]==='key'?(d.keys.join(t('、',', '))||t('还没填关键词','No keywords yet')):t(d.st[0],d.st[1]));
    const p=posText(d);text(row.pos,p);row.pos.title=p;text(row.ord,String(d.order??''));text(row.meta2,t(`${p} · 顺序 ${d.order??''}`,`${p} · Order ${d.order??''}`));
    row.sw.setAttribute('aria-checked',String(d.on));row.r.classList.toggle('cww-off',!d.on);
  }
  function paintPager(){
    const pager=get('world_info_pagination'),nav=pager?.querySelector('.paginationjs-nav')?.textContent||'',m=nav.match(/(\d+)\s*[-–]\s*(\d+)\s*\.\.\s*(\d+)/);
    const prevOff=!pager?.querySelector('.paginationjs-prev:not(.disabled)'),nextOff=!pager?.querySelector('.paginationjs-next:not(.disabled)');
    setHidden(ui.pagerBar,!m||prevOff&&nextOff);
    if(m)text(ui.pagerText,t(`第 ${m[1]}–${m[2]} 条，共 ${m[3]} 条`,`${m[1]}–${m[2]} of ${m[3]}`));
    ui.prevBtn.disabled=prevOff;ui.nextBtn.disabled=nextOff;
  }
  function paintBook(){
    const name=currentBook();
    if(!name){if(ui.view==='book')go('home');return;}
    text(ui.bookTitle,name);
    const list=get('world_popup_entries_list'),vue=!!list?.querySelector('[data-v-app],.bai-bai-wi-vue-host,[class*="bai-bai-world"]');
    ui.panel.classList.toggle('cww-native-entries',vue);
    const st=statsOf(name),entries=[...(list?.querySelectorAll(':scope > .world_entry')||[])],w=whereOf(name);
    const total=st?.all??entries.length,subKey=total+'|'+w.join(',');
    if(ui.bookSub.dataset.key!==subKey){ui.bookSub.dataset.key=subKey;ui.bookSub.replaceChildren(make('span','',t(`${total} 条`,`${total} entries`)),...(w.length?badges(w):[make('span','',t('· 现在没有在哪里生效','· Not active anywhere'))]));}
    const label={all:t('全部','All'),const:t('常驻','Constant'),key:t('关键词','Keyword'),vec:t('向量','Vector'),off:t('已停用','Disabled')};
    for(const [k,b]of Object.entries(ui.chipBtns)){text(b,label[k]+(k!=='all'&&st?' '+st[k]:''));b.setAttribute('aria-pressed',String(ui.filter===k));}
    if(vue){for(const n of [ui.entryCard,ui.ehead,ui.legend])setHidden(n,true);return;}
    setHidden(ui.entryCard,false);setHidden(ui.legend,false);
    keyMemo=null;
    const rows=[];for(const entry of entries){const d=entryData(entry),f=ui.filter,show=f==='all'||(f==='off'?!d.on:d.st[2]===f);const row=entryRow(entry);paintEntryRow(entry,row,d);if(show)rows.push(row.r);}
    if(rows.length!==ui.entryList.children.length||rows.some((n,i)=>ui.entryList.children[i]!==n))ui.entryList.replaceChildren(...rows);
    setHidden(ui.entryList,!rows.length);setHidden(ui.ehead,!rows.length);setHidden(ui.entryEmpty,rows.length>0);
    text(ui.entryEmpty,!entries.length&&ui.filter==='all'?t('这本书还没有条目','No entries yet'):t('没有符合条件的条目','No matching entries'));
    paintPager();
    if(ui.view==='book'&&entries.length&&!wi)loadWI().then(()=>queue());
  }

  /* ---------- 条目页（v2） ---------- */
  function buildEntryView(view){ui.entryHost=view;}
  function clearKeyMode(){
    if(!ui?.keyMode)return;
    win.clearTimeout(ui.keyMode.timeout);
    ui.keyMode=null;
  }
  function switchKeyMode(entry,native){
    const pending={book:currentBook(),entry,uid:entry.getAttribute('uid'),deadline:Date.now()+2000};
    ui.keyMode=pending;
    // Native ST reads the UID from the switch's ancestor, then redraws the entry.
    closeEntry();
    native.click();
    pending.timeout=win.setTimeout(queue,2000);
    queue();
  }
  function openEntry(entry){
    if(!ui||!entry?.isConnected)return;
    clearKeyMode();
    closeEntry();
    const drawer=entry.querySelector('.inline-drawer');
    // ST builds the editor lazily on its own toggle event.
    if(!entry.querySelector('.world_entry_edit'))drawer?.dispatchEvent(new win.CustomEvent('inline-drawer-toggle',{bubbles:true,detail:{open:true}}));
    const form=entry.querySelector('.world_entry_edit');if(!form)return;
    const es={moves:[],created:[],undo:[],entry},view=ui.entryHost;ui.editing=es;
    const M=(n,host,before)=>{if(!n)return null;const mark=doc.createComment('cww-entry-return');n.before(mark);es.moves.push([n,mark]);before?host.insertBefore(n,before):host.append(n);return n;};
    const Q=n=>q(entry,n);
    // Keep references before anything moves out of the entry (the summary reads them later).
    const NAT={};for(const n of entry.querySelectorAll('[name]')){const k=n.getAttribute('name');if(!(k in NAT))NAT[k]=n;}
    const on=(n,type,fn)=>{if(!n)return;n.addEventListener(type,fn);es.undo.push(()=>n.removeEventListener(type,fn));};
    const cls=(n,...c)=>{if(!n)return n;const added=c.filter(x=>!n.classList.contains(x));n.classList.add(...added);es.undo.push(()=>n.classList.remove(...added));return n;};
    const fire=(n,...types)=>{if(!n)return;for(const ty of types){if(win.jQuery)win.jQuery(n).trigger(ty);else n.dispatchEvent(new win.Event(ty,{bubbles:true}));}};
    const num=n=>cls(Q(n),'cw-v4-num','cww-num');
    // 卡片里的一格字段：标题、说明、控件在下（「标题和说明在上，控件在下」）。
    const field=(host,label,hint,nodes,extra='')=>{const f=make('div','cww-field'+(extra?' '+extra:'')),lab=make('div','cww-lab');if(label instanceof win.Node)lab.append(label);else lab.textContent=label;f.append(lab);if(hint!=null){const hn=make('div','cww-hint');if(hint instanceof win.Node)hn.append(hint);else hn.textContent=hint;f.append(hn);}const box=make('div','cww-ctl');f.append(box);for(const n of [].concat(nodes))if(n)n.parentNode?M(n,box):box.append(n);host.append(f);return f;};
    // 行内字段：左边标题和说明，右边控件（手机 3 列网格也用这个）。
    const inField=(host,label,hint,nodes,extra='')=>{const f=make('div','cww-field cww-fin'+(extra?' '+extra:'')),txt=make('div','cww-fin-t'),lab=make('div','cww-lab',label),hn=make('div','cww-hint',hint||''),box=make('div','cww-ctl');txt.append(lab);if(hint)txt.append(hn);f.append(txt,box);for(const n of [].concat(nodes))if(n)n.parentNode?M(n,box):box.append(n);host.append(f);return {f,hn};};
    const card=host=>{const c=make('div','cw-v4-card cww-ecard');host.append(c);return c;};
    const secH=(title,small,extra)=>{const h=make('h2','cww-sub-h'),tt=make('span','',title);h.append(tt);if(small)h.append(make('small','',small));if(extra){h.append(make('span','cww-grow'),extra);}return h;};
    const swRow=(host,title,desc,checkbox,afterRow)=>{const r=make('div','cw-v4-row cww-set-row'),info=make('div','cw-v4-row-info'),c=make('div','cw-v4-row-controls');info.append(make('div','cw-v4-row-title',title));const p=make('p','',desc||'');if(desc)info.append(p);r.append(info,c);host.append(r);if(checkbox){M(showToggle(es,checkbox),c);}if(afterRow)host.append(afterRow);return {r,p,c};};
    const book=currentBook();
    const back=btn(book,()=>go('book'),'cwr-back cww-back',ICON.back());
    // 标题（v2f）：页头只显示名字和条目号，名字在状态卡的「名字」一行里改；复制 / 移动 / 删除收进 ⋯。
    const titleRow=make('div','cww-etitle'),comment=Q('comment'),etH=make('h2','cww-et-h'),uid=entry.getAttribute('uid')??'';
    titleRow.append(etH,make('span','cww-et-n',uid!==''?t(`条目 ${uid}`,`Entry ${uid}`):''),make('span','cww-grow'));
    const titleFallback=comment?.getAttribute('placeholder')||'';
    const titleText=()=>comment?.value.trim()||titleFallback.trim()||t('（无标题）','(Untitled)');
    const paintTitle=()=>{text(etH,titleText());if(ui?.editing===es)paintMobileHead();};
    if(comment){cls(comment,'cww-name');if(!comment.getAttribute('placeholder')){comment.placeholder=t('给这条起个名字','Name this entry');es.undo.push(()=>comment.removeAttribute('placeholder'));}on(comment,'input',paintTitle);}
    const emenu=entryActions(entry,()=>go('book'));emenu.classList.add('cww-entry-more');
    // 手机：顶栏 ⋯ 打开时，列表贴在顶栏 ⋯ 下方、右对齐（共用逻辑按 summary 定位，这里 summary 是藏起来的）。
    emenu.addEventListener('toggle',()=>{const a=emenu.cwAnchor;if(!emenu.open||!a?.isConnected||!phoneWide())return;win.requestAnimationFrame(()=>{const l=emenu.querySelector(':scope>.cw-v4-more-list');if(!l)return;l.querySelector(':scope>.cw-v4-more-cancel')?.remove();const r=a.getBoundingClientRect(),w=l.getBoundingClientRect().width;l.style.setProperty('--cww-mx',Math.max(8,Math.min(r.right-w,win.innerWidth-w-8))+'px');l.style.setProperty('--cww-my',Math.round(r.bottom+4)+'px');});});titleRow.append(emenu);
    // 状态卡：启用一行、触发方式一行。
    const status=make('div','cw-v4-card cww-ecard cww-status'),kill=Q('entryKillSwitch'),stateSel=Q('entryStateSelector');
    const onRow=make('div','cw-v4-row cww-set-row'),onInfo=make('div','cw-v4-row-info'),onMeta=make('p',''),sw=make('button','cww-tg');sw.type='button';sw.setAttribute('role','switch');sw.setAttribute('aria-label',t('启用','Enabled'));onInfo.append(make('div','cw-v4-row-title',t('启用','Enabled')),onMeta);const onCtl=make('div','cw-v4-row-controls');onCtl.append(sw);onRow.append(onInfo,onCtl);
    sw.addEventListener('click',()=>{kill?.click();paintStatus();queue();});
    const nameRow=make('div','cw-v4-row cww-set-row cww-name-row'),nameCtl=make('div','cw-v4-row-controls');nameRow.append(make('div','cw-v4-row-title',t('名字','Name')),nameCtl);if(comment)M(comment,nameCtl);
    // v2f：触发方式一行只放名字和三段按钮，说明不再占一行。
    const stRow=make('div','cw-v4-row cww-set-row cww-st-row'),stInfo=make('div','cw-v4-row-info'),stMeta=make('p',''),seg=make('div','cww-seg');stInfo.append(make('div','cw-v4-row-title',t('触发方式','Trigger')));seg.setAttribute('role','group');seg.setAttribute('aria-label',t('触发方式','Trigger'));stRow.append(stInfo,seg);
    const segBtns={};for(const [v,[zh,en,k]]of Object.entries(STATE)){const b=make('button','');b.type='button';b.append(make('span','',t(zh,en)));b.addEventListener('click',()=>{if(!stateSel||stateSel.value===v)return;stateSel.value=v;stateSel.dispatchEvent(new win.Event('input',{bubbles:true}));stateSel.dispatchEvent(new win.Event('change',{bubbles:true}));paintStatus();});seg.append(b);segBtns[v]=b;}
    const statePark=make('div','cww-park');if(stateSel)M(stateSel,statePark);
    status.append(onRow,nameRow,stRow,statePark);
    const keyHint=make('span','');let onStateChange=null;
    const ST_DESC={constant:['每次都发送','Always sent'],normal:['聊天里出现关键词时发送','Sent when a keyword appears'],vectorized:['按语义相似度触发','Triggered by similarity']};
    function paintStatus(){const live=!kill?.classList.contains('fa-toggle-off');sw.setAttribute('aria-checked',String(live));text(onMeta,live?t('这条会按下面的方式发送','Sent as set below'):t('关掉后保留内容，但不会发送','Kept, but not sent'));
      const v=stateSel?.value;for(const [k,b]of Object.entries(segBtns))b.setAttribute('aria-pressed',String(k===v));text(stMeta,t(...(ST_DESC[v]||ST_DESC.normal)));onStateChange?.(v);
      text(keyHint,v==='constant'?t('常驻条目每次都发送，关键词可以不填。','Constant entries are always sent; keywords are optional.'):v==='vectorized'?t('向量条目按语义相似度触发，关键词可选。','Vectorized entries trigger by similarity; keywords are optional.'):t('聊天里出现任意一个关键词时发送这条。','Sent when any keyword appears in the chat.'));}
    // 触发并进状态卡（稿 v2 11-08 再改）：关键词、可选过滤器是「左标签 84px + 输入」一行（手机标签一行、输入一行），
    const kvRow=(label,name,extra)=>{
      // v2f：名字在上（右边是切换输入方式的小按钮），下面一行是控件；过滤器的逻辑下拉和输入框并排。
      const r=make('div','cww-kv cww-kvs'),hd=make('div','cww-kvh'),bd=make('div','cww-kvb'),box=make('div','cww-ctl cww-kt');
      const sel=form.querySelector(`select[name="${name}"]`),selectBox=sel&&s2box(sel);
      const ta=form.querySelector(`textarea[name="${name}"]`);
      hd.append(make('span','cww-kvl',label),make('span','cww-grow'));r.append(hd,bd);if(extra){cls(extra,'cww-kvsel');M(extra,bd);}bd.append(box);
      for(const n of [sel,selectBox,ta])if(n)M(n,box);
      const native=form.querySelector(`.${name==='key'?'keyprimary':'keysecondary'} .switch_input_type_icon`);
      if(native){
        const switcher=btn('',()=>switchKeyMode(entry,native),'cww-mini');
        switcher.title=t('切换输入方式','Switch input mode');
        switcher.setAttribute('aria-label',switcher.title);hd.append(switcher);
      }
      status.append(r);
      const selection=sel&&win.jQuery?.(sel).data('select2')?.selection;
      const field=selectBox?.querySelector('.select2-search__field')||ta;
      if(!field)return ()=>{};
      const ph=field.getAttribute('placeholder'),i18n=field.getAttribute('data-i18n'),option=selection?.placeholder;
      const originalOption=option?.text;
      if(i18n!==null)field.setAttribute('data-i18n',i18n.split(';').filter(k=>k&&!k.startsWith('[placeholder]')).join(';'));
      let placeholder=ph;
      const paintPlaceholder=()=>{
        if(placeholder!==null&&(field===ta||!sel.selectedOptions.length)&&field.placeholder!==placeholder)field.placeholder=placeholder;
      };
      const observer=new win.MutationObserver(paintPlaceholder);
      observer.observe(field,{attributes:true,attributeFilter:['placeholder']});
      es.undo.push(()=>{
        observer.disconnect();
        ph===null?field.removeAttribute('placeholder'):field.setAttribute('placeholder',ph);
        if(i18n!==null)field.setAttribute('data-i18n',i18n);
        if(option)option.text=originalOption;
      });
      return value=>{
        placeholder=value;
        if(option)option.text=value;
        paintPlaceholder();
      };
    };
    const keyPlaceholder=kvRow(t('关键词','Keywords'),'key');
    const filterPlaceholder=kvRow(t('可选过滤器','Optional filter'),'keysecondary',Q('entryLogicType'));
    filterPlaceholder(t('留空就不用','Leave empty to skip'));
    const prob=num('probability'),useProb=Q('useProbability');
    if(prob&&useProb&&!useProb.checked&&prob.value!=='100'){const old=prob.value;prob.value='100';es.undo.push(()=>{if(!useProb.checked)prob.value=old;});}
    const probPark=make('div','cww-park');if(useProb)M(useProb,probPark);
    const syncProb=()=>{if(!prob||!useProb)return;const want=Number(prob.value)<100;if(useProb.checked!==want){useProb.checked=want;useProb.dispatchEvent(new win.Event('input',{bubbles:true}));useProb.dispatchEvent(new win.Event('change',{bubbles:true}));}};
    on(prob,'input',syncProb);on(prob,'change',syncProb);
    const KEY_PH={constant:['常驻条目可以不填','Optional for constant entries'],vectorized:['向量条目可以不填','Optional for vectorized entries'],normal:['输入后回车添加','Type and press Enter']};
    const kvRows=[...status.querySelectorAll(':scope>.cww-kv')];
    onStateChange=v=>{keyPlaceholder(t(...(KEY_PH[v]||KEY_PH.normal)));for(const r of kvRows)r.classList.toggle('cww-soft',v==='constant');};
    // 内容
    const content=Q('content'),cm=contentEditor(content),counter=form.querySelector('.world_entry_form_token_counter');
    const expand=btn(t('放大','Expand'),()=>openBig(),'cwr-btn cww-btn-sm cww-expand',ICON.expand());
    const conSec=make('section','cw-v4-section cww-esec cww-content-sec'),con=card(conSec);conSec.prepend(secH(t('内容','Content'),'',expand));
    const cf=field(con,'',null,[content,cm].filter(Boolean),'cww-content-field');cf.querySelector('.cww-lab').remove();
    // v2f：Token 数挪到小节标题行，放在「放大」左边。
    const tok=make('div','cww-tok');expand.before(tok);
    if(counter){
      M(counter,tok);
      const host=()=>counter.parentElement;
      const paintCounter=()=>{
        const value=counter.textContent.trim(),pending=!value||value==='counting...';
        const box=host();if(!box?.classList.contains('cww-tok'))return;
        const pre=pending?t('约 … Token','~… tokens'):t('约 ','~'),suf=pending?'':t(' Token',' tokens');
        if(box.dataset.pre!==pre)box.dataset.pre=pre;
        if(box.dataset.suf!==suf)box.dataset.suf=suf;
        if(counter.hidden!==pending)counter.hidden=pending;
      };
      const observer=new win.MutationObserver(paintCounter);
      observer.observe(counter,{childList:true,characterData:true,subtree:true});
      const hidden=counter.hidden;es.undo.push(()=>{observer.disconnect();counter.hidden=hidden;});
      es.paintCounter=paintCounter;paintCounter();
    }
    // v2f（稿 design-settings-layout-v2f-fable.html 方向三）：每组一张卡片，白底标题行 + 灰底内容。电脑三栏全展开，点标题行收起，
    // 收起后标题行右边写出这一组现在的值。收起状态存在浏览器本地（电脑、手机各一份），不写酒馆设置。
    const posSel=Q('position'),depth=num('depth'),order=num('order');
    const grid3=make('div','cww-e3'),colL=make('div','cww-ecol cww-ecol-l'),colM=make('div','cww-ecol'),colR=make('div','cww-ecol');grid3.append(colL,colM,colR);
    const GKEY='claude-web:wi-entry-groups:'+(phoneWide()?'phone':'desk');
    const gState=(()=>{try{const v=JSON.parse(win.localStorage.getItem(GKEY));if(v&&typeof v==='object'&&!Array.isArray(v))return v;}catch{}return phoneWide()?{rb:0,timed:0,grp:0,scan:0,cf:0,more:0}:{};})();
    const groups={};
    const G=(col,key,title,note)=>{
      const sec=make('section','cw-v4-section cww-esec cww-g'),c=make('div','cw-v4-card cww-ecard cww-gcard'),head=make('button','cww-gh'),nt=make('small','cww-gn',note||''),sum=make('span','cww-gs'),body=make('div','cww-gb');
      head.type='button';head.append(make('span','cww-gt',title),nt,make('span','cww-gx'),sum,svg('<path d="m6 9 6 6 6-6"/>',{w:1.9}));c.append(head,body);sec.append(c);col.append(sec);sec.dataset.cwwGroup=key;
      const paint=()=>{const open=gState[key]!==0;head.setAttribute('aria-expanded',String(open));setHidden(body,!open);setHidden(nt,!open||!nt.textContent);setHidden(sum,open);};
      head.addEventListener('click',()=>{gState[key]=gState[key]===0?1:0;try{win.localStorage.setItem(GKEY,JSON.stringify(gState));}catch{}paint();paintSummary();});
      groups[key]={sum,paint,note:nt};paint();return body;};
    // 一行：名字靠左、控件靠右。说明不再占一行，放在悬停提示里。
    const R=(host,label,nodes,tip,extra='')=>{const r=make('div','cw-v4-row cww-set-row cww-r'+(extra?' '+extra:'')),info=make('div','cw-v4-row-info'),c=make('div','cw-v4-row-controls');info.append(make('div','cw-v4-row-title',label));if(tip)r.title=tip;r.append(info,c);for(const n of [].concat(nodes))if(n)n.parentNode?M(n,c):c.append(n);host.append(r);return r;};
    const RT=(host,label,checkbox,tip,after)=>{const r=R(host,label,[],tip);if(checkbox)M(cls(showToggle(es,checkbox),'cww-sw'),r.lastChild);if(after)host.append(after);return r;};
    // 长控件：名字在上、控件整宽。
    const RS=(host,label,note,nodes,tip)=>{const r=make('div','cww-r cww-rs'),c=make('div','cww-rc');if(label){const l=make('div','cww-rl',label);if(note)l.append(make('small','',note));r.append(l);}if(tip)r.title=tip;r.append(c);for(const n of [].concat(nodes))if(n)n.parentNode?M(n,c):c.append(n);host.append(r);return r;};
    // 1 插入到哪里：位置和身份背后是同一个原生下拉（@深度 × data-role）。数字在前，下拉在后；深度、身份只在 @深度 时可用，排在最底下一起变淡。
    const gi=G(colM,'ins',t('插入到哪里','Insertion'),'');
    const pSel=make('select','cww-sel'),rSel=make('select','cww-sel');
    for(const v of ['0','1','5','6','2','3','4','7']){const o=make('option','',t(...POS[v]));o.value=v;pSel.append(o);}
    for(const [v,zh,en] of [['0','系统','System'],['1','用户','User'],['2','AI','AI']]){const o=make('option','',t(zh,en));o.value=v;rSel.append(o);}
    const posPark=make('div','cww-park');if(posSel)M(posSel,posPark);
    const writePos=()=>{if(!posSel)return;const v=pSel.value,role=v==='4'?rSel.value:'';const o=[...posSel.options].find(x=>x.value===v&&(v!=='4'||x.dataset.role===role));if(!o||o.selected)return;o.selected=true;posSel.dispatchEvent(new win.Event('input',{bubbles:true}));posSel.dispatchEvent(new win.Event('change',{bubbles:true}));paintPos();queue();};
    pSel.addEventListener('change',writePos);rSel.addEventListener('change',writePos);
    R(gi,t('位置','Position'),[pSel],t('放在提示词的哪一段','Where in the prompt'));
    const outletIn=cls(Q('outletName'),'cww-text');
    const outlet=R(gi,t('输出口名称','Outlet name'),[outletIn],t('只在位置选「输出口」时用','Only for the Outlet position'));
    R(gi,t('顺序','Order'),[order],t('数字大的排在后面，离 AI 更近','Higher goes later, closer to the AI'));
    R(gi,t('触发概率（%）','Trigger chance (%)'),[prob,probPark],t('100 = 满足条件就一定发送','100 = always sent when matched'));
    const depthRow=R(gi,t('深度','Depth'),[depth],t('插在倒数第几条消息前','Before the Nth last message'));
    const roleRow=R(gi,t('以谁的身份','As whom'),[rSel,posPark],t('这段内容算作谁说的','Who says this'));
    const depthWasDisabled=depth?.disabled;es.undo.push(()=>{if(depth)depth.disabled=depthWasDisabled;});
    const depthNote=t('深度、身份仅「@深度」可用','Depth and role: @Depth only');
    function paintPos(){const o=posSel?.selectedOptions?.[0],v=o?.value??'0',role=o?.dataset.role||'0',isDepth=v==='4';if(pSel.value!==v)pSel.value=v;if(rSel.value!==role)rSel.value=role;rSel.disabled=!isDepth;if(depth)depth.disabled=!isDepth;
      depthRow.classList.toggle('cww-off',!isDepth);roleRow.classList.toggle('cww-off',!isDepth);text(groups.ins.note,isDepth?'':depthNote);groups.ins.paint();setHidden(outlet,v!=='7');}
    on(posSel,'input',paintPos);on(posSel,'change',paintPos);
    // 2 递归与预算
    const g1=G(colM,'rb',t('递归与预算','Recursion & budget'),'');
    RT(g1,t('不会被其他条目触发','Not triggered by other entries'),Q('excludeRecursion'),t('其他条目的内容里出现这里的关键词，也不激活这条','Keywords in other entries do not activate this one'));
    RT(g1,t('不触发其他条目','Do not trigger others'),Q('preventRecursion'),t('这条的内容不再拿去匹配别的条目','This content is not scanned for other entries'));
    const delayCb=Q('delay_until_recursion'),lvl=num('delayUntilRecursionLevel'),subrow=make('div','cww-subrow');subrow.append(make('span','cww-bar-l'),make('span','',t('从第','From level')));if(lvl){cls(lvl,'cww-w56');M(lvl,subrow);}subrow.append(make('span','',t('层递归开始触发','of recursion')));
    RT(g1,t('只在递归时触发','Only during recursion'),delayCb,t('只能被其他条目带出来，聊天本身不触发','Only activated by other entries, not by the chat'),subrow);
    RT(g1,t('无视预算','Ignore budget'),Q('ignoreBudget'),t('世界书超出上下文预算时，这条照样发送','Sent even when World Info is over budget'));
    const paintSub=()=>setHidden(subrow,!delayCb?.checked);on(delayCb,'input',paintSub);on(delayCb,'change',paintSub);
    // 3 时效
    const g3=G(colM,'timed',t('时效','Timed effects'),t('单位：条消息，0 = 不用','In messages; 0 = off'));
    for(const [n,zh,en,hz,he] of [['sticky','粘性','Sticky','触发后连续保持几条','Stays active for N messages'],['cooldown','冷却','Cooldown','触发后隔几条才能再触发','Wait N messages before again'],['delay','延迟','Delay','聊到第几条以后才触发','Only after N messages']])R(g3,t(zh,en),[num(n)],t(hz,he));
    // 4 分组
    const g2=G(colR,'grp',t('分组','Group'),t('同组一次只发一条','One entry per group at a time'));
    const group=Q('group');if(group)cls(group,'cww-text');
    R(g2,t('组名','Group name'),[group],t('可以填多个，用逗号隔开；留空就不分组','Several, comma-separated; empty = no group'));
    R(g2,t('权重','Weight'),[num('groupWeight')],t('同组随机挑选时的分量','Weight for random pick in the group'));
    RT(g2,t('组内优先','Prioritize in group'),Q('groupOverride'),t('同组里优先选这条，不看权重','Picked first in its group, ignoring weight'));
    const scoring=Q('useGroupScoring');if(scoring)cls(scoring,'cww-sel');R(g2,t('组评分','Group scoring'),[scoring],t('按关键词命中数挑选','Pick by keyword hits'));
    // 5 扫描：留空或「跟随全局」(= 原生 null) 用激活设置的值。
    const g5=G(colR,'scan',t('扫描','Scan'),t('留空 = 跟随全局','Blank = use global'));
    const sd=num('scanDepth');if(sd){const old=sd.getAttribute('placeholder'),i18n=sd.getAttribute('data-i18n');sd.placeholder=String(get('world_info_depth')?.value??'');if(i18n!==null)sd.setAttribute('data-i18n',i18n.split(';').filter(k=>k&&!k.startsWith('[placeholder]')).join(';'));es.undo.push(()=>{old===null?sd.removeAttribute('placeholder'):sd.setAttribute('placeholder',old);i18n===null?sd.removeAttribute('data-i18n'):sd.setAttribute('data-i18n',i18n);});}
    R(g5,t('扫描深度','Scan depth'),[sd],t('往回看几条消息；留空用激活设置里的值','Messages to scan; blank uses Activation settings'));
    for(const [n,zh,en,hz,he] of [['caseSensitive','区分大小写','Case-sensitive','Aa 和 aa 算不算同一个词','Is Aa the same as aa'],['matchWholeWords','匹配整个词','Match whole words','关键词要不要是完整的词','Match whole words only']]){const s2=Q(n);if(s2)cls(s2,'cww-sel');R(g5,t(zh,en),[s2],t(hz,he));}
    // 6 角色过滤：只对 / 不对（原生 character_exclusion）+ 原生多选。
    const g4=G(colR,'cf',t('角色过滤','Character filter'),'');
    const ex=Q('character_exclusion'),fseg=make('div','cww-seg cww-fseg');const fb1=make('button','',t('只对','Only')),fb2=make('button','',t('排除','Exclude'));fb1.title=t('只对这些角色生效','Only these characters');fb2.title=t('这些角色不生效','Not these characters');fb1.type=fb2.type='button';fseg.append(fb1,fb2);
    const paintEx=()=>{fb1.setAttribute('aria-pressed',String(!ex?.checked));fb2.setAttribute('aria-pressed',String(!!ex?.checked));};
    const setEx=v=>{if(!ex||ex.checked===v)return;ex.checked=v;ex.dispatchEvent(new win.Event('input',{bubbles:true}));ex.dispatchEvent(new win.Event('change',{bubbles:true}));paintEx();paintSummary();};
    fb1.addEventListener('click',()=>setEx(false));fb2.addEventListener('click',()=>setEx(true));
    const cfBox=make('div','cww-ctl cww-cf'),cfSel=Q('characterFilter'),exPark=make('div','cww-park');if(ex)M(ex,exPark);
    const cfInl=make('div','cww-inl');cfInl.append(fseg,cfBox);RS(g4,'','',[cfInl,exPark]);if(cfSel){const c=s2box(cfSel);M(cfSel,cfBox);if(c)M(c,cfBox);}
    // select2 把占位存在自己的 selection 上，每次重画都从那里写回搜索框，所以改那里；关掉条目页还原。
    if(cfSel){const inst=win.jQuery?.(cfSel).data?.('select2'),sel=inst?.selection,ph=t('留空 = 所有角色','Empty = all characters');
      const paint=()=>{const f=inst?.$container?.[0]?.querySelector('.select2-search__field');if(f&&!cfSel.selectedOptions.length&&f.placeholder!==ph)f.placeholder=ph;};
      if(sel&&'placeholder' in sel){const old=sel.placeholder;sel.placeholder={id:'',text:ph};es.undo.push(()=>{sel.placeholder=old;try{win.jQuery(cfSel).trigger('change.select2');}catch{}});}
      paint();win.setTimeout(paint,120);}
    // 7 更多：额外匹配来源（原生 6 个勾选）、生成方式（原生 triggers 多选），用勾选胶囊。
    const g6=G(colR,'more',t('更多','More'),'');
    const pillsPark=make('div','cww-park');
    const srcPills=make('div','cww-pills');
    const SRC=[['matchPersonaDescription','用户角色','Persona'],['matchCharacterDescription','角色描述','Character description'],['matchCharacterPersonality','角色性格','Character personality'],['matchCharacterDepthPrompt','角色备注','Character\'s note'],['matchScenario','场景','Scenario'],['matchCreatorNotes','作者备注','Creator\'s notes']];
    const pillsPaint=[];
    for(const [n,zh,en] of SRC){const cb=Q(n);if(!cb)continue;M(cb,pillsPark);const b=make('button','cww-pk',t(zh,en));b.type='button';const paintP=()=>b.setAttribute('aria-pressed',String(cb.checked));b.addEventListener('click',()=>{cb.checked=!cb.checked;cb.dispatchEvent(new win.Event('input',{bubbles:true}));cb.dispatchEvent(new win.Event('change',{bubbles:true}));paintP();paintSummary();});pillsPaint.push(paintP);srcPills.append(b);}
    RS(g6,t('关键词也在这些地方找','Also match keywords in'),'',[srcPills],t('默认只看聊天消息','Chat messages only by default'));
    const trg=Q('triggers'),genPills=make('div','cww-pills');
    if(trg){const c=s2box(trg);M(trg,pillsPark);if(c)M(c,pillsPark);
      const GEN={normal:['正常发送','Normal'],continue:['继续','Continue'],impersonate:['AI 帮答','Impersonate'],swipe:['滑动','Swipe'],regenerate:['重新生成','Regenerate'],quiet:['静默','Quiet']};
      for(const o of trg.options){const b=make('button','cww-pk',t(...(GEN[o.value]||[o.textContent.trim(),o.textContent.trim()])));b.type='button';const paintP=()=>b.setAttribute('aria-pressed',String(o.selected));b.addEventListener('click',()=>{o.selected=!o.selected;fire(trg,'input','change');paintP();paintSummary();});pillsPaint.push(paintP);genPills.append(b);}}
    RS(g6,t('只在这些生成方式下触发','Only for these generation types'),t('都不选 = 所有方式','None = all types'),[genPills]);
    const auto=Q('automationId');if(auto)cls(auto,'cww-text');R(g6,t('自动化 ID','Automation ID'),[auto],t('给 Quick Reply 等自动化脚本用；不用就留空','For Quick Reply and other automation; leave empty if unused'));
    g6.append(pillsPark);
    // 下拉选项、组名占位用稿子的文案；原生值不变，关掉条目页时换回原文。
    // 写在 option 的 label 属性上：ST 的翻译观察器在选项进页面后会重写 textContent（data-i18n 也不能删，它对属性变化会读到 null），
    // label 的显示优先于文字内容，翻译碰不到它。
    const relabel=(sel,map)=>{if(!sel)return;for(const o of sel.options){const v=map[o.value];if(!v)continue;const had=o.getAttribute('label');o.setAttribute('label',t(...v));es.undo.push(()=>{had===null?o.removeAttribute('label'):o.setAttribute('label',had);});}};
    const TRI={null:['跟随全局','Use global'],true:['是','Yes'],false:['否','No']};
    for(const n of ['caseSensitive','matchWholeWords','useGroupScoring'])relabel(NAT[n],TRI);
    relabel(NAT.entryLogicType,{0:['包含任意一个','Any of'],3:['全部包含','All of'],1:['不全包含','Not all'],2:['一个都不包含','None of']});
    if(group){const i18n=group.getAttribute('data-i18n'),ph=group.getAttribute('placeholder');group.placeholder=t('例如：人物','e.g. Characters');if(i18n!==null)group.setAttribute('data-i18n',i18n.split(';').filter(k=>k&&!k.startsWith('[placeholder]')).join(';'));es.undo.push(()=>{ph===null?group.removeAttribute('placeholder'):group.setAttribute('placeholder',ph);i18n===null?group.removeAttribute('data-i18n'):group.setAttribute('data-i18n',i18n);});}
    // 每组和原生默认值不同的项；收起时写在这一组标题行的右边。
    function changes(){const v=n=>NAT[n],chk=n=>!!v(n)?.checked,val=n=>String(v(n)?.value??'').trim(),o={rb:[],grp:[],timed:[],scan:[],cf:[],more:[]};
      if(chk('excludeRecursion'))o.rb.push(t('不会被其他条目触发','not triggered by others'));if(chk('preventRecursion'))o.rb.push(t('不触发其他条目','does not trigger others'));if(chk('delay_until_recursion'))o.rb.push(t('只在递归时触发','only during recursion'));if(chk('ignoreBudget'))o.rb.push(t('无视预算','ignore budget'));
      if(val('group'))o.grp.push(val('group'));if(val('groupWeight')&&val('groupWeight')!=='100')o.grp.push(t(`权重 ${val('groupWeight')}`,`weight ${val('groupWeight')}`));if(chk('groupOverride'))o.grp.push(t('组内优先','group priority'));if(val('useGroupScoring')&&val('useGroupScoring')!=='null')o.grp.push(t('组评分','group scoring'));
      for(const [n,zh,en] of [['sticky','粘性','sticky'],['cooldown','冷却','cooldown'],['delay','延迟','delay']])if(val(n)&&val(n)!=='0')o.timed.push(t(`${zh} ${val(n)}`,`${en} ${val(n)}`));
      const nf=v('characterFilter')?.selectedOptions?.length||0;if(nf)o.cf.push(chk('character_exclusion')?t(`排除 ${nf} 个`,`excluding ${nf}`):t(`只对 ${nf} 个`,`only ${nf}`));
      if(val('scanDepth'))o.scan.push(t(`深度 ${val('scanDepth')}`,`depth ${val('scanDepth')}`));for(const [n,zh,en] of [['caseSensitive','区分大小写','case-sensitive'],['matchWholeWords','匹配整个词','whole words']])if(val(n)&&val(n)!=='null')o.scan.push(t(zh,en));
      const extra=SRC.filter(([n])=>chk(n)).length;if(extra)o.more.push(t(`额外匹配 ${extra} 项`,`${extra} extra sources`));const gen=trg?[...trg.selectedOptions].length:0;if(gen)o.more.push(t(`生成方式 ${gen} 项`,`${gen} generation types`));if(val('automationId'))o.more.push(t('自动化 ID','automation ID'));
      return o;}
    const DEF={rb:['都是默认值','All defaults'],grp:['未分组','No group'],timed:['都是默认值','All defaults'],scan:['跟随全局','Use global'],cf:['所有角色','All characters'],more:['都是默认值','All defaults']};
    function paintSummary(){const c=changes();
      for(const [k,g] of Object.entries(groups)){if(k==='ins'){text(g.sum,t(`${pSel.selectedOptions[0]?.textContent||''} · 顺序 ${order?.value??''}`,`${pSel.selectedOptions[0]?.textContent||''} · order ${order?.value??''}`));continue;}
        const list=c[k]||[];g.sum.classList.toggle('cww-changed',list.length>0);const full=list.length?list.join(' · '):t(...DEF[k]);text(g.sum,full);if(list.length)g.sum.title=full;else g.sum.removeAttribute('title');}}
    on(view,'input',paintSummary);on(view,'change',()=>{paintSummary();for(const p of pillsPaint)p();});
    // ST hides some checkboxes until their section expands; show them as switches here.
    const shown=[];view.querySelectorAll?.('input[type=checkbox]');
    // 底部只留「完成」（电脑）。
    // 吸底渐变要渐到页面底色（面板的背景色随设备、配色变，读实际值），不是卡片色（round2 #10）。
    const foot=make('div','cww-footbar');{const pg=win.getComputedStyle(ui.panel).backgroundColor;if(pg&&pg!=='rgba(0, 0, 0, 0)'&&pg!=='transparent')foot.style.setProperty('--cww-page',pg);}titleRow.append(btn(t('完成','Done'),()=>go('book'),'cwr-btn cww-primary cww-desk-only cww-done'));
    colL.append(status,conSec);
    view.replaceChildren(back,titleRow,grid3,foot);
    for(const c of view.querySelectorAll('input[type=checkbox]')){if(c.closest('.cw-v4-park'))continue;if(c.style.display==='none'||c.hidden||c.classList.contains('displayNone')){shown.push([c,c.style.display,c.hidden]);c.style.display='';c.hidden=false;c.classList.add('cw-v4-icon-toggle');}}
    es.undo.push(()=>{for(const [c,d,hd]of shown){c.style.display=d;c.hidden=hd;c.classList.remove('cw-v4-icon-toggle');}});
    paintStatus();paintPos();paintSub();paintEx();for(const p of pillsPaint)p();paintSummary();win.requestAnimationFrame(()=>{if(ui?.editing===es)paintSummary();});
    on(stateSel,'input',paintStatus);
    const tokPaint=()=>{if(!counter&&content){text(tok,t(`约 ${Math.round(content.value.length/1.6)} Token`,`~${Math.round(content.value.length/1.6)} tokens`));}};tokPaint();on(content,'input',tokPaint);
    es.content=content;es.cm=cm;es.counter=counter;es.contentHost=cf;es.menu=emenu;es.title=titleText;text(etH,titleText());
    ui.view='entry';ui.panel.dataset.cwwView='entry';for(const [k,n]of Object.entries(ui.views))setHidden(n,k!=='entry');ui.panel.scrollTop=0;
    paintMobileHead();
    watchContentEditor(es);
  }
  function closeEntry(){
    const es=ui?.editing;if(!es)return;closeBig();es.stopEditorCheck?.();ui.editing=null;
    resetFallbackEditor(es);
    const editor=contentEditor(es.content);
    if(editor?.contains(doc.activeElement)||doc.activeElement===es.content)doc.activeElement.blur();
    // Select2 attaches its open results to the document, outside the entry.
    // Close them before moving their controls back to the native editor.
    for(const [node] of es.moves){
      if(!node.matches('select.select2-hidden-accessible'))continue;
      const select=win.jQuery?.(node);
      if(select?.data('select2')?.isOpen?.())select.select2('close');
    }
    for(const f of es.undo.splice(0).reverse())try{f();}catch{}
    // menu()/showToggle() from the drawer helpers record into es as a drawer state.
    for(const f of (es.cleanups||[]).splice(0))try{f();}catch{}
    for(const n of es.iconToggles||[])n.classList.remove('cw-v4-icon-toggle');
    // Both helpers push to the same array in call order: undo it in reverse.
    for(const [node,mark]of es.moves.splice(0).reverse())if(mark.parentNode)mark.replaceWith(node);
    // TT can mount the editor after openEntry has already moved the textarea.
    if(editor&&editor!==es.cm&&es.content.isConnected)es.content.after(editor);
    if(es.content)delete es.content.dataset.cwwNativeContent;
    for(const n of es.created)n.remove();
    ui.entryHost.replaceChildren();
    // Moved select2 companions are re-laid out by ST on next open; repaint the row.
    queue();
  }
  function contentEditor(content){
    const sibling=content?.nextElementSibling;
    return sibling?.matches('.tt-codemirror-editor')?sibling:null;
  }
  let cmModule=null,cmLoading=null;
  function loadCM(){
    return cmLoading??=import(new URL('/scripts/tauri/codemirror-editor.js',win.location.href).href)
      .then(module=>cmModule=module).catch(()=>null);
  }
  function measureCM(content){win.requestAnimationFrame(async()=>{
    const module=cmModule||await loadCM();
    module?.getMountedCodeMirrorEditor?.(content)?.requestMeasure?.();
  });}
  function resetFallbackEditor(es){
    if(es?.content?.hasAttribute('data-cww-native-content'))cmModule?.getMountedCodeMirrorEditor?.(es.content)?.reset?.();
  }
  function editorHasText(editor){
    const body=editor.querySelector('.cm-content[contenteditable="true"]');
    if(!body?.getBoundingClientRect().height)return false;
    return [...body.querySelectorAll('.cm-line')].some(line=>line.textContent.trim()&&line.getBoundingClientRect().height>0
      && win.getComputedStyle(line).visibility==='visible');
  }
  function watchContentEditor(es){
    es.stopEditorCheck?.();
    const content=es.content;
    if(!content||content.hasAttribute('data-cww-native-content'))return;
    if(!contentEditor(content)&&!doc.body.classList.contains('clawd-tauritavern-host'))return;
    let editor=null,timer=0,active=true;
    const current=candidate=>active&&ui?.editing===es&&candidate===contentEditor(content)&&candidate.isConnected;
    const check=async candidate=>{
      if(!current(candidate)||!content.value.trim()||editorHasText(candidate))return;
      const module=cmModule||await loadCM();
      if(!current(candidate))return;
      const handle=module?.getMountedCodeMirrorEditor?.(content);
      if(typeof handle?.reset!=='function'||handle.wrapper!==candidate)return;
      handle.requestMeasure?.();
      timer=win.setTimeout(()=>{
        if(!current(candidate)||!content.value.trim()||editorHasText(candidate))return;
        const focused=candidate.contains(doc.activeElement);
        // Seed CM from the native value before hiding it. TT may flush on blur.
        handle.reset();
        content.dataset.cwwNativeContent='';
        if(focused)content.focus({preventScroll:true});
      },250);
    };
    const mounted=()=>{
      const next=contentEditor(content);
      if(next===editor)return;
      win.clearTimeout(timer);editor=next;
      if(!editor)return;
      measureCM(content);
      timer=win.setTimeout(check,800,editor);
    };
    const observer=new win.MutationObserver(mounted);
    observer.observe(content.parentElement,{childList:true});
    es.stopEditorCheck=()=>{active=false;win.clearTimeout(timer);observer.disconnect();};
    mounted();
  }
  /* ---------- 内容放大：整块面板变成编辑区，只有一条头 ---------- */
  function openBig(){
    const es=ui?.editing;if(!es?.content||ui.big)return;
    const host=doc.getElementById('cw-v4-settings')||ui.panel,big=make('div','cww-big'),bh=make('div','cww-bh'),title=make('div','cww-bh-t',t(`${es.title()} · 内容`,`${es.title()} · Content`)),tok=make('span','cww-tok');
    for(const type of ['click','mousedown','touchstart','pointerdown'])big.addEventListener(type,e=>e.stopPropagation());
    bh.append(btn(t('收起','Collapse'),()=>closeBig(),'cwr-btn cww-shrink',ICON.shrink()),title,tok);big.append(bh);
    const marks=[];const take=n=>{if(!n)return;const m=doc.createComment('cww-big-return');n.before(m);marks.push([n,m]);};
    const editor=contentEditor(es.content);
    resetFallbackEditor(es);
    take(es.content);take(editor);take(es.counter);
    big.append(es.content);if(editor)big.append(editor);if(es.counter){tok.append(es.counter);es.paintCounter();}else text(tok,t(`约 ${Math.round(es.content.value.length/1.6)} Token`,`~${Math.round(es.content.value.length/1.6)} tokens`));
    host.append(big);ui.big={big,marks};ui.panel.classList.add('cww-big-open');host.classList.add('cww-big-host');
    const esc=e=>{if(e.key==='Escape'&&!doc.querySelector('.select2-container--open')){e.preventDefault();e.stopImmediatePropagation();closeBig();}};win.addEventListener('keydown',esc,true);ui.big.esc=esc;
    const target=es.content.hasAttribute('data-cww-native-content')?es.content:editor?.querySelector('.cm-content[contenteditable="true"]')||es.content;
    target.focus({preventScroll:true});watchContentEditor(es);
  }
  function closeBig(){
    const b=ui?.big;if(!b)return;ui.big=null;win.removeEventListener('keydown',b.esc,true);
    const es=ui.editing,content=es?.content,editor=contentEditor(content);
    resetFallbackEditor(es);
    const mountedInBig=editor&&!b.marks.some(([node])=>node===editor);
    for(const [n,m]of b.marks.reverse())if(m.parentNode)m.replaceWith(n);
    if(mountedInBig&&content.isConnected)content.after(editor);
    ui.editing?.paintCounter?.();
    b.big.remove();ui.panel.classList.remove('cww-big-open');doc.getElementById('cw-v4-settings')?.classList.remove('cww-big-host');
    if(es)watchContentEditor(es);
  }

  /* ---------- 激活设置：扫描（两列）、递归、匹配 ---------- */
  function buildAct(s,view){
    const back=btn(t('世界书','World Info'),()=>go('home'),'cwr-back cww-back',ICON.back()),head=make('div','cwr-list-head cww-head');head.append(make('h2','',t('激活设置','Activation settings')));
    view.append(back,head,make('p','cwr-lede cww-sub',t('对所有世界书生效。不确定的保持默认就行。','Applies to all World Info. Keep the defaults if unsure.')));
    // v2f：扫描组也是行（名字和说明在左，数字框在右），单位写进名字。电脑两栏：扫描 + 递归 / 匹配。
    const cols=make('div','cww-acols'),colA=make('div','cww-acol'),colB=make('div','cww-acol');cols.append(colA,colB);view.append(cols);
    const sec=(title,host)=>{const x=make('section','cw-v4-section');x.append(make('h2','',title));const c=make('div','cw-v4-card');x.append(c);host.append(x);return c;};
    const numRow=(host,id,label,hint)=>{const counter=get(id+'_counter')||get(id);const r=make('div','cw-v4-row cww-set-row cww-arow'),info=make('div','cw-v4-row-info'),c=make('div','cw-v4-row-controls');info.append(make('div','cw-v4-row-title',label));if(hint)info.append(make('p','',hint));r.append(info,c);host.append(r);
      if(counter){counter.classList.add('cw-v4-num','cww-num');cleanup(s,()=>counter.classList.remove('cw-v4-num','cww-num'));move(s,counter,c);}
      // The slider stays live but hidden: the counter is the visible control and
      // writes through ST's own delegated handler (2.0.340 A).
      const slider=get(id);if(slider&&slider!==counter){const park=make('div','cw-v4-park');r.append(park);move(s,slider,park);}return r;};
    const scan=sec(t('扫描','Scan'),colA);
    numRow(scan,'world_info_depth',t('扫描深度','Scan depth'),t('往回看几条消息找关键词','How many messages to scan'));
    numRow(scan,'world_info_budget',t('上下文占比（%）','Context share (%)'),t('世界书最多占上下文多少','Maximum share of the context'));
    numRow(scan,'world_info_budget_cap',t('预算上限（Token）','Budget cap (tokens)'),t('0 = 不额外限制','0 = no extra limit'));
    numRow(scan,'world_info_min_activations',t('最少激活','Min activations'),t('至少激活几条','Activate at least N entries'));
    numRow(scan,'world_info_min_activations_depth_max',t('最少激活时最多扫到','Max depth for min activations'),t('0 = 不限','0 = unlimited'));
    const setRow=(host,label,desc,node)=>{if(!node)return;const r=make('div','cw-v4-row cww-set-row'),info=make('div','cw-v4-row-info'),c=make('div','cw-v4-row-controls');info.append(make('div','cw-v4-row-title',label));if(desc)info.append(make('p','',desc));r.append(info,c);host.append(r);if(node.type==='checkbox'){node.classList.add('cww-sw');cleanup(s,()=>node.classList.remove('cww-sw'));}move(s,node.type==='checkbox'?showToggle(s,node):node,c);return r;};
    const rec=sec(t('递归','Recursion'),colA);
    setRow(rec,t('递归扫描','Recursive scan'),t('被激活的条目里的关键词，也能触发别的条目','Keywords in activated entries can trigger others'),get('world_info_recursive'));
    const steps=get('world_info_max_recursion_steps_counter')||get('world_info_max_recursion_steps');if(steps){steps.classList.add('cw-v4-num','cww-num');cleanup(s,()=>steps.classList.remove('cw-v4-num','cww-num'));setRow(rec,t('最多递归几步','Max recursion steps'),t('0 = 不限','0 = unlimited'),steps)?.classList.add('cww-arow');const sl=get('world_info_max_recursion_steps');if(sl&&sl!==steps){const park=make('div','cw-v4-park');rec.append(park);move(s,sl,park);}}
    const match=sec(t('匹配','Matching'),colB);
    setRow(match,t('区分大小写','Case-sensitive'),'',get('world_info_case_sensitive'));
    setRow(match,t('匹配整个词','Match whole words'),'',get('world_info_match_whole_words'));
    setRow(match,t('包含名字','Include names'),'',get('world_info_include_names'));
    setRow(match,t('超出预算时提醒','Alert on overflow'),'',get('world_info_overflow_alert'));
    setRow(match,t('组评分','Group scoring'),'',get('world_info_use_group_scoring'));
    setRow(match,t('插入顺序策略','Insertion strategy'),t('多本世界书一起用时，谁先谁后','Which book goes first'),get('world_info_character_strategy'));
  }

  /* ---------- 手机顶栏 ---------- */
  function paintMobileHead(){
    if(!ui)return;const v=ui.view,head=doc.querySelector('.cw-v4-shell .cw-v4-head');
    const want=phoneWide()&&head&&ui.panel.classList.contains('openDrawer')&&!ui.panel.classList.contains('cw-v4-inactive');
    if(!want){ui.mobileHead?.remove();return;}
    let m=ui.mobileHead;if(!m){m=ui.mobileHead=make('div','cwr-mobile-head cww-mobile-head');}
    const key=v+'|'+currentBook()+'|'+ui.selecting+'|'+ui.selected.size;
    if(m.dataset.key!==key||!m.isConnected){m.dataset.key=key;const back=(label,to)=>{const b=btn(label,()=>go(to),'cwr-head-back cww-head-back',ICON.back());return b;};
      if(v==='home'&&ui.selecting)m.replaceChildren(button(t('取消','Cancel'),()=>stopSelecting(true),'cwr-head-back'),make('h1','',t(`已选 ${ui.selected.size} 本`,`${ui.selected.size} selected`)),button(t('全选','Select all'),()=>selectAll(),'cwr-head-action'));
      else if(v==='home'){const menuBtn=button('',()=>doc.querySelector('.cw-v4-shell .cw-v4-head .cw-v4-menu')?.click(),'cwr-head-back cww-head-ic');menuBtn.append(svg('<path d="M4 7h16M4 12h11M4 17h16"/>'));menuBtn.setAttribute('aria-label',t('菜单','Menu'));const plus=button('',()=>get('world_create_button')?.click(),'cwr-head-action cww-head-ic');plus.append(ICON.plus());plus.setAttribute('aria-label',t('新建世界书','New World Info'));m.replaceChildren(menuBtn,make('h1','',t('世界书','World Info')),plus);}
      else if(v==='book'){const more=button('',()=>{const d=ui.views.book.querySelector('.cww-book-more');if(d)d.open=!d.open;},'cwr-head-action cww-head-ic');more.append(ICON.more());more.setAttribute('aria-label',t('更多','More'));m.replaceChildren(back(t('世界书','World Info'),'home'),make('h1','',currentBook()),more);}
      else if(v==='entry'){const more=button('',()=>{const d=ui.editing?.menu;if(!d)return;d.cwAnchor=more;d.open=!d.open;},'cwr-head-action cww-head-ic');more.append(ICON.more());more.setAttribute('aria-label',t('更多','More'));const right=make('span','cww-head-right');right.append(more,button(t('完成','Done'),()=>go('book'),'cwr-head-action cww-head-done'));m.replaceChildren(back(currentBook(),'book'),make('h1',''),right);}
      else m.replaceChildren(back(t('世界书','World Info'),'home'),make('h1','',t('激活设置','Activation settings')),make('span','cww-head-spacer'));
    }
    // 条目页顶栏标题跟着名字走（v2f：页内不再显示标题）。
    if(v==='entry'){const h1=m.querySelector(':scope>h1'),tt=ui.editing?.title?.()||'';if(h1&&h1.textContent!==tt)h1.textContent=tt;}
    if(!m.isConnected)head.append(m);
  }

  /* ---------- 换角色后第一次打开：自动切到角色的主世界书 ---------- */
  function autoOpenCharacterBook(){
    const c=ctx();if(!c||!ui)return;
    const id=c.groupId?'g:'+c.groupId:c.characterId!==undefined?'c:'+c.characterId+':'+(c.characters?.[c.characterId]?.avatar||''):'';
    if(id===ui.autoKey)return;ui.autoKey=id;
    if(!c.chatId||c.groupId)return;const info=charInfo();if(!info.main)return;
    const b=books().find(x=>x.name===info.main);if(!b)return;
    openBook(b.value);
  }

  /* ---------- 绘制 ---------- */
  let frame=0;
  function queue(){if(!frame&&ui)frame=win.requestAnimationFrame(()=>{frame=0;paint();});}
  function paint(){
    if(!ui)return;
    if(ui.keyMode){
      const {book,entry,uid,deadline}=ui.keyMode;
      if(currentBook()===book){
        const next=[...(get('world_popup_entries_list')?.children||[])].find(n=>n!==entry&&n.classList.contains('world_entry')&&n.getAttribute('uid')===uid);
        if(next){openEntry(next);if(ui.editing)return;}
        if(Date.now()<deadline)return;
      }
      go('book');return;
    }
    if(ui.editing&&!ui.editing.entry.isConnected){ui.view='book';closeEntry();for(const [k,n]of Object.entries(ui.views))setHidden(n,k!=='book');ui.panel.dataset.cwwView='book';}
    if(ui.view==='home'){paintWhere();paintBooks();}
    else if(ui.view==='book')paintBook();
    else paintMobileHead();
    if(ui.view!=='home')paintMobileHead();
  }
  function build(panel,s,page){
    destroy();
    ui={panel,page,s,view:'home',views:{},bookRows:new Map(),entryRows:new WeakMap(),nativeRows:new WeakMap(),selected:new Set(),selecting:false,filter:'all',autoKey:null,wasOpen:false};
    panel.classList.add('cww-world');cleanup(s,()=>{panel.classList.remove('cww-world','cww-native-entries','cww-big-open');delete panel.dataset.cwwView;});
    for(const k of ['home','book','entry','act']){const v=make('div','cww-view cww-v-'+k);v.dataset.cwwView=k;page.append(v);ui.views[k]=v;}
    buildHome(s,ui.views.home);buildBook(s,ui.views.book);buildEntryView(ui.views.entry);buildAct(s,ui.views.act);
    const sel=editor(),onBook=()=>{counts.delete(currentBook());stats.delete(currentBook());keyMemo=null;queue();};
    sel?.addEventListener('change',onBook);cleanup(s,()=>sel?.removeEventListener('change',onBook));
    const gl=get('world_info'),onGlobal=()=>queue();gl?.addEventListener('change',onGlobal);cleanup(s,()=>gl?.removeEventListener('change',onGlobal));
    const c=ctx(),types=c?.eventTypes||{},src=c?.eventSource,subs=[];
    const on=(type,fn)=>{if(src?.on&&type){src.on(type,fn);subs.push([type,fn]);}};
    const fresh=()=>{counts.clear();stats.clear();keyMemo=null;queue();};
    on(types.WORLDINFO_UPDATED,(name)=>{counts.delete(name);stats.delete(name);if(name===currentBook())keyMemo=null;queue();});
    on(types.CHAT_CHANGED,()=>queue());on(types.WORLDINFO_SETTINGS_UPDATED,fresh);on(types.SETTINGS_UPDATED,()=>queue());
    cleanup(s,()=>{for(const [type,fn]of subs)src.removeListener?.(type,fn);});
    // Open/close is a class change on the native drawer; mount() does not run on close.
    const po=new win.MutationObserver(()=>sync(panel));po.observe(panel,{attributes:true,attributeFilter:['class']});cleanup(s,()=>po.disconnect());
    // Load ST's module once for counts and keys (read-only); no network for the list.
    loadWI().then(()=>queue());
    ui.views.home.hidden=false;for(const k of ['book','entry','act'])ui.views[k].hidden=true;panel.dataset.cwwView='home';
    cleanup(s,destroy);
  }
  function sync(panel){
    if(!ui||ui.panel!==panel)return;
    const open=panel.classList.contains('openDrawer')&&!panel.classList.contains('cw-v4-inactive');
    if(open&&!ui.wasOpen){ui.wasOpen=true;stopSelecting(false);if(currentBook()&&ui.view==='home'){} autoOpenCharacterBook();}
    if(!open&&ui.wasOpen){ui.wasOpen=false;if(ui.view==='entry')go('book');closeBig();ui.mobileHead?.remove();}
    queue();
  }
  function destroy(){
    if (globalPopup) {
      const {popup, restore} = globalPopup;
      restore();
      if (popup.dlg.open) popup.dlg.close();
    }
    if(!ui)return;const u=ui;clearKeyMode();dropFilter();closeBig();closeEntry();u.mobileHead?.remove();if(frame){win.cancelAnimationFrame(frame);frame=0;}ui=null;
  }
  return {decoratePicker,build,sync,destroy,go:v=>go(v),state:()=>ui&&{view:ui.view,book:currentBook(),selecting:ui.selecting,selected:[...ui.selected]}};
}
