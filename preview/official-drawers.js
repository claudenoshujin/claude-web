import { watchTokens, tokenText } from './token-count.js?v=2.0.168';
import { createMorePages } from './settings-more-pages.js?v=2.0.168';
import { createV2dPages } from './settings-v2d.js?v=2.0.168';
import { createPresetManagerPage } from './official-preset-manager.js?v=2.0.168';
import { createInterfaceRefinements } from './official-interface-refinements.js?v=2.0.168';
import { normalizeSettingsSections } from './settings-sections.js?v=2.0.168';
/* Semantic live layouts, ported from design-v4 (redo.js / wi.js).
 * Only original DOM nodes are moved; lists/forms keep their IDs and native
 * handlers. Comment markers allow a full return to the native layout.
 * Labels are the design's own Chinese strings; L() looks up the design's
 * English table for other UI languages. */
import { createExtensionSettings, retainRangeCounter } from './official-extension-settings.js?v=2.0.168';
import { createPresetList } from './official-preset-list.js?v=2.0.168';
import { createWorldPage } from './official-world.js?v=2.0.168';
import { createPresetEdit } from './official-preset-edit.js?v=2.0.168';
import { createPromptScroll } from './official-prompt-scroll.js?v=2.0.168';
import { createExtensionPanel } from './official-extension-panel.js?v=2.0.168';
export function actionLabel(node,t){
  const byId={world_backfill_memos:['补全标题','Fill titles'],world_apply_current_sorting:['应用排序','Apply sorting'],world_refresh:['刷新','Refresh'],OpenAllWIEntries:['展开全部','Expand all'],CloseAllWIEntries:['收起全部','Collapse all'],world_popup_name_button:['改名','Rename'],world_duplicate:['复制','Duplicate'],world_popup_delete:['删除','Delete'],bulkEditButton:['批量编辑','Bulk edit'],charListGridToggle:['切换网格视图','Toggle grid view'],rm_button_group_chats:['新建群聊','New group'],external_import_button:['从外部导入','Import externally'],character_import_button:['导入角色','Import character'],world_import_button:['导入','Import'],world_popup_export:['导出','Export'],bg_add_folder_button:['新建文件夹','New folder'],bg_selection_mode_button:['选择背景','Select backgrounds'],bg_group_add_to_folder_button:['移入文件夹','Move to folder'],open_s_preset_menu:['预设工具','Preset tools'],view_connection_profile:['查看配置','View profile'],reload_connection_profile:['重新载入','Reload profile'],personas_backup:['备份','Back up'],personas_restore:['恢复备份','Restore backup'],persona_grid_toggle:['切换网格视图','Toggle grid view']};
  if(byId[node.id])return t(...byId[node.id]);
  for(const [key,cn,en] of [['delete','删除','Delete'],['restore','恢复默认','Restore defaults'],['rename','改名','Rename'],['import','导入','Import'],['export','导出','Export'],['new','另存为新的','Save as new'],['create','新建','Create'],['edit','编辑','Edit'],['update','保存','Save']])if(node.id?.includes(key)||[...node.attributes].some(a=>a.name===`data-preset-manager-${key}`))return t(cn,en);
  return (node.getAttribute('aria-label')||node.title||node.textContent||'').trim().split(/[\n.。]/)[0].slice(0,32);
}
export function createDrawerLayouts({win,t,L,make,button,icon,openEditor,closeSettings,openSelMenu,mountNativeSegment,bindRowMenu,rememberTTMove=()=>{}}) {
  const doc=win.document, states=new Map();
  const extensionSettings=createExtensionSettings({win,t,L,make,button,icon,openEditor});
  const extensionPanel=createExtensionPanel({win,t,make,button,icon,settings:extensionSettings,openEditor});
  const presetList=createPresetList({win,make,button,t,phoneWide:()=>phoneWide(),onLeave:()=>presetEdit.leave(),onEdit:action=>presetEdit.selectDesktop(action),canEdit:()=>presetEdit.ready()});
  let morePages=null,v2dPages=null;
  let promptScroll=null;
  const get=id=>doc.getElementById(id);
  // The native export Popper references a parked (display:none) button. Keep
  // its format actions, but anchor its existing popup to the visible control.
  let exportSession=null,exportStyle=null;
  function stopCharacterExport(close=false){
    const session=exportSession;if(!session)return;exportSession=null;session.stop();
    if(close&&win.getComputedStyle(session.popup).display!=='none')session.native.click();
    session.popup.classList.remove('cw-v4-export-anchored');
    session.popup.style.removeProperty('--cw-export-left');session.popup.style.removeProperty('--cw-export-top');
  }
  function openCharacterExport(anchor,native=get('export_button')){
    if(!anchor||!native)return;
    if(exportSession){stopCharacterExport(true);return;}
    const rect=anchor.getBoundingClientRect(),popup=get('export_format_popup');if(!popup)return;
    native.click();if(win.getComputedStyle(popup).display==='none')return;
    if(!exportStyle){exportStyle=make('style','');exportStyle.textContent='.cw-v4-export-anchored{position:fixed!important;inset:auto!important;left:var(--cw-export-left)!important;top:var(--cw-export-top)!important;transform:none!important;margin:0!important;z-index:22030!important;max-width:calc(100vw - 16px)!important;max-height:calc(100dvh - 16px)!important;overflow:auto!important}';doc.head.append(exportStyle);}
    popup.classList.add('cw-v4-export-anchored');
    const viewport=win.visualViewport,left=viewport?.offsetLeft||0,top=viewport?.offsetTop||0,width=viewport?.width||win.innerWidth,height=viewport?.height||win.innerHeight;
    const size=popup.getBoundingClientRect(),x=Math.max(left+8,Math.min(left+width-size.width-8,rect.right-size.width));
    const below=rect.bottom+6,y=below+size.height<=top+height-8?below:Math.max(top+8,rect.top-size.height-6);
    popup.style.setProperty('--cw-export-left',x+'px');popup.style.setProperty('--cw-export-top',y+'px');
    const outside=e=>{if(!popup.contains(e.target)&&!anchor.contains(e.target))stopCharacterExport(true);};
    const dismiss=()=>stopCharacterExport(true),positions=new Map();
    for(let n=anchor;n;n=n.parentElement)positions.set(n,[n.scrollLeft,n.scrollTop]);
    const scroll=e=>{const target=e.target===doc?doc.scrollingElement:e.target,initial=positions.get(target);if(initial&&(target.scrollLeft!==initial[0]||target.scrollTop!==initial[1]))dismiss();};
    const observer=new win.MutationObserver(()=>{if(win.getComputedStyle(popup).display==='none')stopCharacterExport();});observer.observe(popup,{attributes:true,attributeFilter:['style']});
    doc.addEventListener('pointerdown',outside,true);doc.addEventListener('scroll',scroll,true);win.addEventListener('resize',dismiss);viewport?.addEventListener('resize',dismiss);viewport?.addEventListener('scroll',dismiss);
    exportSession={popup,native,anchor,stop(){observer.disconnect();doc.removeEventListener('pointerdown',outside,true);doc.removeEventListener('scroll',scroll,true);win.removeEventListener('resize',dismiss);viewport?.removeEventListener('resize',dismiss);viewport?.removeEventListener('scroll',dismiss);}};
  }
  function state(root){let s=states.get(root);if(!s){s={moves:[],created:[],root};states.set(root,s);}return s;}
  function prepareRestore(s){
    s.cleanup?.();
    s.cleanups?.forEach(f=>f());
    s.gates?.forEach(stop=>stop());
    delete s.root.dataset.cwV4Sources;
    if(s.rest)for(const node of [...s.rest.childNodes])s.root.append(node);
  }
  function restoreMoves(panels){
    const moves=panels.flatMap(s=>s.moves).sort((a,b)=>(b[2]||0)-(a[2]||0));
    for(const [node,mark] of moves)if(mark.parentNode)mark.replaceWith(node);
  }
  function finishRestore(s){
    s.created.forEach(n=>n.remove());
    s.buttons?.forEach(n=>n.classList.remove('cw-v4-as-btn','cw-v4-primary'));
    s.mapped?.forEach(n=>n.classList.remove('cw-v4-mapped-setting','cw-v4-row','cw-v4-range'));
    s.iconToggles?.forEach(n=>n.classList.remove('cw-v4-icon-toggle'));
    s.root.classList.remove('cw-v4-reflow');
    if(s.root.classList.contains('cw-v4-extension-item')){
      s.root.classList.remove('cw-v4-extension-item');
      delete s.root.dataset.cwV4Extension;
    }
  }
  function restorePanel(root){
    const s=states.get(root);
    if(!s?.page)return;
    prepareRestore(s);
    restoreMoves([s]);
    finishRestore(s);
    states.delete(root);
  }
  function sectionHost(host){
    if(!host.matches?.('.cw-v4-section'))return host;
    const card=host.querySelector(':scope>.cw-v4-card');if(!card)return host;
    for(const child of [...host.childNodes])if(child!==card&&!(child.nodeType===1&&child.matches('h2')))card.append(child);
    return card;
  }
  // One sequence for every state: a node moved twice by two states (row, then a
  // menu park) must be returned in the reverse of the global order, or it lands
  // in the first state's removed row.
  let moveSeq=0;
  function move(s,node,host,before){if(!node||node===host||node.contains(host))return;if(!before)host=sectionHost(host);const companion=node.matches?.('select.select2-hidden-accessible')&&node.nextElementSibling?.matches('.select2-container')?node.nextElementSibling:null;for(const counter of node.matches?.('input[data-for]')?[node]:node.querySelectorAll?.('input[data-for]')||[]){const undoRange=retainRangeCounter(counter);if(undoRange)cleanup(s,undoRange);}if(node.parentNode){const mark=doc.createComment('cw-drawer-return');node.before(mark);s.moves.push([node,mark,++moveSeq]);}if(before)host.insertBefore(node,before);else host.append(node);rememberTTMove(node);if(companion)move(s,companion,host);}
  const created=(s,n)=>{s.created.push(n);return n;};
  const cleanup=(s,f)=>{(s.cleanups||=[]).push(f);};
  function section(page,title){const n=make('section','cw-v4-section');if(title)n.append(make('h2','',L(title)));n.append(make('div','cw-v4-card'));page.append(n);return n;}
  // srow(): title + description on the left, controls on the right.
  function rowEl(label,desc,cls=''){
    const r=make('div','cw-v4-row'+(cls?' '+cls:'')),info=make('div','cw-v4-row-info'),controls=make('div','cw-v4-row-controls');
    if(label)info.append(make('div','cw-v4-row-title',L(label)));
    if(typeof desc==='string'&&desc)info.append(make('p','',L(desc)));
    if(label||desc)r.append(info);r.append(controls);return {r,info,controls};
  }
  function row(s,host,label,desc,nodes,cls){
    const {r,info,controls}=rowEl(label,desc,cls);sectionHost(host).append(r);
    if(desc instanceof win.Node){const d=make('div','cw-v4-row-desc');info.append(d);if(desc.parentNode)move(s,desc,d);else d.append(desc);}
    for(const n of [].concat(nodes||[]))if(n)move(s,n,controls);
    if([].concat(nodes||[]).some(n=>n?.closest?.('[data-cc-null]')))r.setAttribute('data-cc-null','');
    return r;
  }
  // menu(): the shared ⋯ menu. Short hand-written labels; the native buttons stay inside,
  // hidden, so their IDs and delegated handlers keep working.
  // Item: [label, nativeEl, danger, run, icon]. '-' draws a thin rule between groups.
  // An icon (a POP_ICONS key) or a rule switches the menu to the v2 .pop look:
  // 16px icon + 14px text, 36px rows, danger icon and text both red.
  const POP_ICONS={user:'<circle cx="12" cy="8" r="3"/><path d="M5 20v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"/>',tag:'<path d="M3 4h7l10 10-6 6L3 9z"/><circle cx="7" cy="7" r="1"/>',star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"/>',plus:'<path d="M12 5v14M5 12h14"/>',x:'<path d="M6 6l12 12M18 6 6 18"/>',key:'<circle cx="8" cy="15" r="3.5"/><path d="m10.5 12.5 8-8M15 8l2.5 2.5M17.5 5.5 20 8"/>',ext:'<path d="M14 5h5v5M19 5l-8 8M18 14v5H5V6h5"/>',pencil:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',copy:'<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M5 15V6a1 1 0 0 1 1-1h9"/>',imp:'<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19h14"/>',exp:'<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 19h14"/>',trash:'<path d="M5 7h14M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V4h6v3"/>',sliders:'<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',eye:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',move:'<path d="M5 12h12M13 7l5 5-5 5"/>',spark:'<path d="M12 4l1.8 4.7L18.5 10.5l-4.7 1.8L12 17l-1.8-4.7L5.5 10.5l4.7-1.8z"/>',sort:'<path d="M7 5v14M4 16l3 3 3-3M17 19V5M14 8l3-3 3 3"/>',refresh:'<path d="M19 12a7 7 0 1 1-2.05-4.95M19 5v4h-4"/>'};
  function popIcon(k){const s2=doc.createElementNS('http://www.w3.org/2000/svg','svg');s2.setAttribute('viewBox','0 0 24 24');s2.setAttribute('fill','none');s2.setAttribute('stroke','currentColor');s2.setAttribute('stroke-width','1.8');s2.setAttribute('stroke-linecap','round');s2.setAttribute('stroke-linejoin','round');s2.setAttribute('aria-hidden','true');s2.innerHTML=POP_ICONS[k]||'';return s2;}
  function menu(s,items){
    const m=make('details','cw-v4-more cw-v4-created'),h=make('summary','','⋯'),list=make('div','cw-v4-more-list'),park=make('div','cw-v4-more-park');
    h.setAttribute('aria-label',L('更多'));m.append(h,list,park);let pop=false,rule=false;
    for(const it of items){if(it==='-'){rule=true;continue;}if(!it)continue;const [label,el,danger,run,ico]=it;if(!el&&!run)continue;
      if(rule&&list.childElementCount){list.append(make('hr','cwr-pop-hr'));pop=true;}rule=false;
      const b=button(L(label),e=>{e.stopPropagation();m.open=false;run?run():el.click();},'cw-v4-more-item'+(danger?' cw-v4-danger':''));
      if(ico){b.prepend(popIcon(ico));pop=true;}list.append(b);
      if(el)move(s,el,park);}
    if(pop)m.classList.add('cwr-pop');
    return m;
  }
  function rowMore(cls){
    const b=make('button','cw-v4-row-more '+cls,'⋯');b.type='button';
    b.setAttribute('aria-label',L('更多'));b.setAttribute('aria-expanded','false');
    return b;
  }
  // asBtn(): a native control drawn as a text button.
  function act(s,n,label,plus,primary){if(!n)return n;n.classList.add('cw-v4-as-btn');if(primary)n.classList.add('cw-v4-primary');const text=make('span','cw-v4-action-label'+(plus?' cw-v4-plus':''),L(label));n.append(text);s.created.push(text);(s.buttons||=[]).push(n);return n;}
  function begin(root){const s=state(root);if(s.page)return null;const page=make('div','cw-v4-drawer-page');s.page=page;root.append(page);s.created.push(page);root.classList.add('cw-v4-reflow');return {s,page};}
  function finish(s){const root=s.root,page=s.page,more=make('div','cw-v4-leftovers'),rest=make('div','cw-v4-native-rest');for(const n of [...root.childNodes])if(n!==page&&!(root.id==='AdvancedFormatting'&&n.nodeType===1&&n.id==='tt-assistant'))rest.append(n);// 2.0.281（稿 design-desk-align-v2）：原来只有一个孤零零的 ⋯，改成一行「其他设置 · 说明 · 打开」，点整行打开。
    const extra=button('',()=>openEditor(rest,t('其他设置','Additional settings')),'cw-v4-leftovers-row');extra.append(make('span','cw-lo-t',t('其他设置','Additional settings')),make('span','cw-lo-d',t('酒馆原来面板里还没排进上面分组的设置','Remaining native settings not placed above')),make('span','cw-lo-b',t('打开','Open')));extra.setAttribute('aria-label',t('其他设置','Additional settings'));extra.title=t('其他设置','Additional settings');more.append(extra,rest);page.append(more);s.rest=rest;s.more=more;refreshLeftovers(s);}
  // The fallback button appears only when real controls remain: panel pins,
  // doc links and icon labels of already-mapped toggles do not count.
  const chrome='[id$="_pin"],.notes-link,a[href],#bg-scroll-top,#rm_button_back,label[for].menu_button,label[for] .menu_button';
  function hiddenWithin(n,stop){for(;n&&n!==stop;n=n.parentElement)if(n.hidden||n.type==='hidden'||n.classList.contains('displayNone')||n.style.display==='none')return true;return false;}
  function refreshLeftovers(s){if(!s.rest||!s.more)return;const live=[...s.rest.querySelectorAll('input,select,textarea,button,.menu_button')].some(n=>!n.matches(chrome)&&!n.closest('.notes-link')&&!hiddenWithin(n,s.rest));if(s.more.hidden===live)s.more.hidden=!live;}
  // Checkboxes ST draws as icon labels (display:none) become visible switches.
  function showToggle(s,n){if(n?.type==='checkbox'&&(n.style.display==='none'||n.classList.contains('displayNone'))){n.classList.add('cw-v4-icon-toggle');(s.iconToggles||=[]).push(n);}return n;}
  const tg=(s,host,n,label,desc)=>n?row(s,host,label,desc||'',[showToggle(s,n)]):null;
  const sel=(s,host,n,label,desc)=>n?row(s,host,label,desc||'',[n]):null;
  function num(s,host,n,label,desc){if(!n)return null;n.classList.add('cw-v4-num');cleanup(s,()=>n.classList.remove('cw-v4-num'));return row(s,host,label,desc||'',[n]);}
  function txt(s,host,n,label,desc){if(!n)return null;const r=row(s,host,label,desc||'',[n]);r.classList.add('cw-v4-txt-row');return r;}
  // textRow(): two-line preview under the title + an Edit dialog.
  function textRow(s,host,ta,label,desc){
    if(!ta)return null;
    const {r,info,controls}=rowEl(label,'','cw-v4-tprev-row');sectionHost(host).append(r);
    const prev=make('div','cw-v4-tprev');info.append(prev);
    const paint=()=>{const v=ta.value.trim();const text=v||L('（空）');if(prev.textContent!==text)prev.textContent=text;prev.classList.toggle('cw-v4-tprev-empty',!v);};
    paint();ta._cwV4Paint=paint;ta.dataset.cwV4Text='1';ta.addEventListener('input',paint);ta.addEventListener('change',paint);
    cleanup(s,()=>{delete ta.dataset.cwV4Text;delete ta._cwV4Paint;ta.removeEventListener('input',paint);ta.removeEventListener('change',paint);});
    if(ta.closest('[data-cc-null]'))r.setAttribute('data-cc-null','');
    const park=make('div','cw-v4-park');r.append(park);move(s,ta,park);
    controls.append(button(L('编辑'),()=>openEditor(ta,L(label),desc?L(desc):'')));
    return r;
  }
  // dialogRow(): a group of settings parked in the row and opened as a dialog.
  function dialogRow(s,host,label,desc,title,build,btn='配置',opener=openEditor){
    const box=make('div','cw-v4-dialog-box');
    const r=row(s,host,label,desc,[]),park=make('div','cw-v4-park');r.append(park);park.append(box);build(box);
    r.querySelector('.cw-v4-row-controls').append(button(L(btn),()=>opener(box,L(title))));
    return r;
  }
  function presetRow(s,host,root,label,desc,select,kind){
    if(!select)return null;
    const B=a=>root.querySelector(`[data-preset-manager-${a}="${kind}"]`);
    select.classList.add('cw-v4-preset-sel');cleanup(s,()=>select.classList.remove('cw-v4-preset-sel'));
    return row(s,host,label,desc,[select,act(s,B('update'),'保存'),menu(s,[['另存为新的',B('new')],['改名',B('rename')],['导入',B('import')],['导出',B('export')],['恢复默认',B('restore')],['删除',B('delete'),true]])]);
  }
  function segRow(s,host,radios,label,desc,names){
    radios=radios.filter(Boolean);if(!radios.length)return null;
    const seg=make('div','cw-v4-seg cw-v4-created');
    radios.forEach((r,i)=>{const l=make('label','cw-v4-seg-item');l.append(make('span','',L(names[i])));seg.append(l);move(s,r,l,l.firstChild);});
    return row(s,host,label,desc,[seg]);
  }
  function rangeBox(s,n){const b=make('div','cw-v4-rangebox cw-v4-created');move(s,n,b);return b;}
  function rng(s,host,r,n,label,desc){if(!r)return null;if(n){n.classList.add('cw-v4-num');cleanup(s,()=>n.classList.remove('cw-v4-num'));}const x=row(s,host,label,desc||'',[rangeBox(s,r),n]);x.classList.add('cw-v4-range');return x;}
  function searchBox(s,input,placeholder){const b=make('label','cw-v4-search cw-v4-created');b.append(icon('search'));if(input){if(placeholder){const old=input.placeholder;input.placeholder=L(placeholder);cleanup(s,()=>input.placeholder=old);}move(s,input,b);}return b;}
  const bar=()=>make('div','cw-v4-bar');
  // Rebuild a native setting row in place, keeping its data-source, inline
  // visibility and delegated-event ancestor intact (source-gated parameters).
  function setting(s,host,id,label,desc='',counter,kind){
    const input=get(id);if(!input)return;
    let native=input.closest('.range-block')||input.closest('label')||input.parentElement;
    if(native===host||native.contains(host))return;
    if(native.classList.contains('cw-v4-mapped-setting')){const separate=make('div','');native.append(separate);s.created.push(separate);move(s,input,separate);if(counter)move(s,get(counter),separate);native=separate;}
    const gates=[];for(let n=native.parentElement;n&&n!==s.root;n=n.parentElement)if(!n.matches('.inline-drawer-content,.cw-v4-park,.cw-v4-native-rest'))gates.push(n);
    if(gates.length){const previousHidden=native.hidden;const sync=()=>{const hidden=previousHidden||gates.some(n=>n.hidden||n.style.display==='none'||n.classList.contains('displayNone'));if(native.hidden!==hidden)native.hidden=hidden;};const observer=new win.MutationObserver(sync);for(const gate of gates)observer.observe(gate,{attributes:true,attributeFilter:['style','class','hidden']});(s.gates||=[]).push(()=>{observer.disconnect();native.hidden=previousHidden;});sync();}
    move(s,native,host);
    const info=make('div','cw-v4-row-info'),title=make('label','cw-v4-row-title',L(label));title.htmlFor=id;info.append(title);
    if(desc)info.append(make('p','',L(desc)));
    const controls=make('div','cw-v4-row-controls'),park=make('div','cw-v4-park');
    native.append(info,controls,park);s.created.push(info,controls,park);
    for(const child of [...native.childNodes])if(child!==info&&child!==controls&&child!==park)move(s,child,park);
    if(input.type==='range'){controls.append(rangeBox(s,input));native.classList.add('cw-v4-range');}else move(s,showToggle(s,input),controls);
    if(kind==='num'){input.classList.add('cw-v4-num');cleanup(s,()=>input.classList.remove('cw-v4-num'));}
    if(counter){const c=get(counter);if(c){c.classList.add('cw-v4-num');cleanup(s,()=>c.classList.remove('cw-v4-num'));move(s,c,controls);}}
    native.classList.add('cw-v4-mapped-setting','cw-v4-row');
    (s.mapped||=[]).push(native);
    return native;
  }
  function labeledRows(root){
    if(root.dataset.cwV4Fields)return;root.dataset.cwV4Fields='1';
    root.querySelectorAll('.world_entry_form_control,.range-block').forEach(n=>n.classList.add('cw-v4-field'));
    root.querySelectorAll('.world_entry_form_control:has(textarea),.world_entry_form_control:has(select[multiple])').forEach(n=>n.classList.add('cw-v4-field-wide'));
  }

  const presetManagerPage=createPresetManagerPage({win,t,make,button,icon,move,cleanup,created});
  const refinements=createInterfaceRefinements({win,t,L,make,button,icon,get,begin,finish,restorePanel,section,row,move,cleanup,created,act,menu,tg,sel,num,txt,presetRow,showToggle,openEditor});
  /* ---------------- 世界书 ----------------
   * 2.0.341：整页重排见 official-world.js（首页 / 书页 / 条目页 / 激活设置 / 内容放大）。 */
  const presetEdit=createPresetEdit({win,t,make,button,icon,phoneWide:()=>phoneWide(),onReady:()=>presetList.refresh()});
  const worldPage=createWorldPage({win,t,L,make,button,icon,get,move,cleanup,state,menu,act,openEditor,showToggle,bindRowMenu,rowMore,phoneWide:()=>phoneWide()});
  function world(panel){const started=begin(panel);if(!started)return;const {s,page}=started;
    worldPage.build(panel,s,page);
    finish(s);
  }

  /* ---------------- 背景 ---------------- */
  function backgrounds(panel){const started=begin(panel);if(!started)return;const {s,page}=started;
    const general=section(page,'');
    row(s,general,'','点缩略图就能换背景',[act(s,get('add_background_button_top'),'添加背景',true),menu(s,[['新建文件夹',get('bg_add_folder_button')],['批量选择',get('bg_selection_mode_button')],[t('移入文件夹','Move to folder'),get('bg_group_add_to_folder_button')]])]);
    sel(s,general,get('background_fitting'),'填充方式');
    row(s,general,'按聊天内容自动选择','让 AI 挑一张合适的背景',[act(s,get('auto_background'),'自动选择')]);
    const gallery=section(page,'');gallery.classList.add('cw-v4-entries');const b=bar();gallery.append(b);
    b.append(searchBox(s,get('bg-filter'),'搜索背景'));move(s,get('bg-sort'),b);
    const zoom=make('div','cw-v4-seg cw-v4-created');b.append(zoom);
    for(const [id,label] of [['bg_thumb_zoom_out','小'],['bg_thumb_zoom_in','大']]){const n=get(id);if(n){n.classList.add('cw-v4-seg-item','cw-v4-size-button');n.dataset.cwSize=L(label);n.setAttribute('aria-label',L(label));move(s,n,zoom);cleanup(s,()=>n.classList.remove('cw-v4-seg-item','cw-v4-size-button'));}}
    const bgs=sheetMenu('cw-v4-phone-filter',sliders(),ui=>{sortPick(ui,get('bg-sort'),bgs);ui.head('缩略图');ui.keep(L('缩小'),()=>get('bg_thumb_zoom_out')?.click());ui.keep(L('放大'),()=>get('bg_thumb_zoom_in')?.click());});b.append(bgs);
    move(s,get('bg_tabs'),gallery);finish(s);
  }

  /* ---------------- 格式化 ---------------- */
  function formatting(panel){refinements.formatting(panel);}

  /* ---------------- 预设 ---------------- */
  function presets(panel){const started=begin(panel);if(!started)return;const {s,page}=started;
    move(s,get('respective-presets-block'),page);
    move(s,get('common-gen-settings-block'),page);
    move(s,get('respective-ranges-and-temps'),page);
    move(s,get('advanced-ai-config-block'),page);
    const presetRoot=get('openai_api-presets');
    if(presetRoot){const ps=begin(presetRoot);if(ps){const group=section(ps.page,'对话补全预设');
      const select=get('settings_preset_openai');if(select){select.classList.add('cw-v4-preset-sel');cleanup(ps.s,()=>select.classList.remove('cw-v4-preset-sel'));}
      {const pm=menu(ps.s,[['重命名',presetRoot.querySelector('[data-preset-manager-rename="openai"]'),false,null,'pencil'],['另存为新预设',get('new_oai_preset'),false,null,'copy'],'-',['导入预设',get('import_oai_preset'),false,null,'imp'],['导出当前预设',get('export_oai_preset'),false,null,'exp'],['预设增强菜单',get('open_s_preset_menu'),false,null,'sliders'],'-',['删除当前预设',get('delete_oai_preset'),true,null,'trash']]);
        // v2 .pop：图标 + 文字，分组细线（重命名 / 另存为 | 导入 / 导出 | 删除）。原生没有「恢复默认值」，不做。
        pm.classList.add('cw-v4-preset-menu');
        presetManagerPage.header(ps.s,group,select,[act(ps.s,get('update_oai_preset'),'保存'),pm]);}
      finish(ps.s);
    }}
    const ranges=get('range_block_openai');
    if(ranges){
      const rs=begin(ranges);if(rs){const target=rs.page,st=rs.s;
        const length=section(target,'长度');
        setting(st,length,'oai_max_context_unlocked','解锁上下文上限','移除上下文滑块的最大值限制');
        setting(st,length,'openai_max_context','上下文长度','Token','openai_max_context_counter');
        setting(st,length,'openai_max_tokens','最大回复长度','Token',null,'num');
        setting(st,length,'n_openai','每次生成几个备选回复','一次生成多条，左右滑动挑选',null,'num');
        setting(st,length,'stream_toggle','流式传输','回复边生成边显示');
        const sampling=section(target,'采样');
        for(const [id,n,label,desc] of [['temp_openai','temp_counter_openai','温度','越高越随机'],['freq_pen_openai','freq_pen_counter_openai','频率惩罚'],['pres_pen_openai','pres_pen_counter_openai','存在惩罚'],['top_p_openai','top_p_counter_openai','Top P']])setting(st,sampling,id,label,desc||'',n);
        setting(st,sampling,'seed_openai','种子','-1 = 随机',null,'num');
        const quick=section(target,'快速编辑');quick.classList.add('cw-v4-quick');
        for(const [id,label] of [['main_prompt_quick_edit_textarea','主提示词'],['nsfw_prompt_quick_edit_textarea','辅助提示词'],['jailbreak_prompt_quick_edit_textarea','历史后置指令']])textRow(st,quick,get(id),label);
        finish(st);
      }
    }
    const advanced=get('openai_settings'),manager=get('completion_prompt_manager');
    if(advanced&&manager){const as=begin(advanced);if(as){const st=as.s,target=as.page;
      const prompts=section(target,'提示词');prompts.classList.add('cw-v4-prompts','cw-v4-entries');
      // 原生列表的外层 .range-block 里只有列表本身；其余节点是插件插的（如 SPreset Editor 插在列表前）。
      // 只搬列表会把它们留进「其他设置」，这里一起搬进插件栏，presetList 把插件栏放在搜索栏上方。
      const pmHost=manager.parentElement,pmExtras=pmHost?[...pmHost.children].filter(n=>n!==manager&&!n.matches('script,style,template,link')):[];
      move(st,manager,prompts);
      const pmPlugins=created(st,make('div','cw-pm-plugins'));sectionHost(prompts).append(pmPlugins);for(const n of pmExtras)move(st,n,pmPlugins);
      const quick=ranges?.querySelector('.cw-v4-quick');if(quick)move(st,quick,target);
      const adv=section(target,'其他');
      dialogRow(st,adv,'功能提示词','扮演、世界书格式、新聊天、续写等 10 条','功能提示词',box=>{const x=section(box,'');for(const [id,label,desc] of [['impersonation_prompt_textarea','扮演提示词','让 AI 代你写一条消息时用'],['wi_format_textarea','世界书格式','用 {0} 标出内容插入的位置'],['scenario_format_textarea','场景格式'],['personality_format_textarea','性格格式'],['group_nudge_prompt_textarea','群聊提示'],['newchat_prompt_textarea','新聊天'],['newgroupchat_prompt_textarea','新群聊'],['newexamplechat_prompt_textarea','新示例对话'],['continue_nudge_prompt_textarea','续写提示'],['send_if_empty_textarea','空消息时发送','输入框为空时代替发送的文字']])textRow(st,x,get(id),label,desc);});
      segRow(st,adv,['character_names_none','character_names_default','character_names_completion','character_names_content'].map(get),'角色名称','怎样在消息前加上说话人的名字',['不加','默认','补全对象','消息内容']);
      segRow(st,adv,['continue_postfix_none','continue_postfix_space','continue_postfix_newline','continue_postfix_double_newline'].map(get),'续写后缀','续写时在原文后接什么',['无','空格','换行','双换行']);
      setting(st,adv,'continue_prefill','续写预填充','续写时把最后一条作为助手消息发送');
      setting(st,adv,'squash_system_messages','合并系统消息');
      const tools=section(target,'工具与多媒体');
      setting(st,tools,'openai_function_calling','启用函数调用');setting(st,tools,'tool_call_recurse_limit','工具调用递归上限','','tool_call_recurse_limit_counter');
      setting(st,tools,'tool_reasoning_mode','交错思维');setting(st,tools,'openai_media_inlining','发送内联媒体');setting(st,tools,'openai_inline_image_quality','图片画质');
      const reasoning=section(target,'推理');setting(st,reasoning,'openai_show_thoughts','请求模型推理','只影响思维链是否可见');setting(st,reasoning,'openai_reasoning_effort','推理强度');setting(st,reasoning,'openai_verbosity','回复长度倾向');
      const bias=section(target,'Logit 偏置'),biasSelect=get('openai_logit_bias_preset');if(biasSelect){const biasBlock=biasSelect.closest('.range-block');if(biasBlock){
        move(st,biasBlock,bias);const bs=begin(biasBlock);if(bs){
          const editor=biasBlock.querySelector('.inline-drawer-content');
          row(bs.s,bs.page,'偏置预设','提高或压低某些词出现的概率',[biasSelect,menu(bs.s,[['新建',get('openai_logit_bias_new_preset')],['导入',get('openai_logit_bias_import_preset')],['导出',get('openai_logit_bias_export_preset')],editor?[t('编辑偏置条目','Edit bias entries'),null,false,()=>openEditor(editor,L('偏置预设'))]:null,['删除',get('openai_logit_bias_delete_preset'),true]])]);
          const park=make('div','cw-v4-park');bs.page.append(created(bs.s,park));if(editor)move(bs.s,editor,park);
          finish(bs.s);
        }
      }}
      target.append(reasoning,tools,adv);const seed=get('seed_openai')?.closest('.cw-v4-row');if(seed)move(st,seed,adv);if(biasSelect){const block=biasSelect.closest('.range-block');if(block){block.classList.add('cwr-inline-bias');cleanup(st,()=>block.classList.remove('cwr-inline-bias'));move(st,block,adv);}}bias.hidden=true;
      finish(st);
    }}
    finish(s);
  }
  // Prompt manager rows are re-rendered by ST; restyle each native row in place.
  function promptRows(panel){
    const footer=panel.querySelector('.completion_prompt_manager_footer');
    const list=panel.querySelector('#completion_prompt_manager_list');if(footer&&list&&!list.closest('.bai-bai-preset-vue-list-host')&&footer.nextElementSibling===list)move(state(footer),footer,list.parentElement,list.nextSibling);
    if(footer&&!footer.querySelector('.cw-v4-more')){const s=state(footer);
      act(s,footer.querySelector('.fa-plus-square,.fa-square-plus'),'新建提示词',true);act(s,footer.querySelector('.fa-chain,.fa-link'),'插入');
      const del=footer.querySelector('.fa-x');
      const more=menu(s,[['导入提示词列表',get('prompt-manager-import')],['导出提示词列表',get('prompt-manager-export')],['重置当前角色的列表',get('prompt-manager-reset-character')],['删除选中的提示词',del?.closest('.menu_button')||del,true]]);
      footer.append(more);s.created.push(more);footer.classList.add('cw-v4-pm-footer');s.cleanup=()=>footer.classList.remove('cw-v4-pm-footer','cw-v4-pm-no-insert');
    }
    const insert=footer?.querySelector('.fa-chain,.fa-link');
    if(insert&&!insert.cwOpenPicker){
      const s=state(footer);
      const open=()=>{
        const select=footer.querySelector('select');
        if(!select?.options.length)return;
        const box=make('div','cwr-insert-picker'),picker=select.cloneNode(true);
        picker.removeAttribute('id');
        picker.value=select.value;
        picker.setAttribute('aria-label',L('插入提示词'));
        box.append(picker,button(L('插入'),()=>{
          const current=panel.querySelector('.completion_prompt_manager_footer');
          const native=current?.querySelector('select');
          const action=current?.querySelector('.fa-chain,.fa-link');
          if(!native||!action||![...native.options].some(o=>o.value===picker.value))return;
          native.value=picker.value;
          box.closest('dialog')?.close();
          action.click();
        },'cw-v4-button'));
        panel.append(box);
        openEditor(box,L('插入提示词'),'',{onClose:()=>box.remove()});
      };
      insert.cwOpenPicker=open;
      const click=e=>{if(e.isTrusted){e.preventDefault();e.stopImmediatePropagation();open();}};
      insert.addEventListener('click',click,true);
      cleanup(s,()=>{insert.removeEventListener('click',click,true);delete insert.cwOpenPicker;});
    }
    const footerMore=footer?.querySelector('.cw-v4-more'),topMore=panel.querySelector('.cw-pm-more>.cw-v4-more-list');
    if(footerMore)footerMore.hidden=true;
    // SPreset (third-party) injects a banner into the prompts area later; offer it from the preset menu instead.
    const spreset=panel.querySelector('.spreset-btn'),pmenu=panel.querySelector('.cw-v4-preset-menu>.cw-v4-more-list');
    if(spreset&&pmenu&&!pmenu.querySelector('.cw-v4-spreset')){const b=button(spreset.textContent.replace(/[→\s]+$/,'').trim()||'SPreset Editor',e=>{e.stopPropagation();pmenu.parentElement.open=false;spreset.click();},'cw-v4-more-item cw-v4-spreset');pmenu.insertBefore(b,pmenu.lastElementChild);}
    // Insert only lists prompts that are not in the list yet; hide it when empty.
    if(footer){const pick=footer.querySelector('select');footer.classList.toggle('cw-v4-pm-no-insert',!pick?.options.length);}
    panel.querySelectorAll('#completion_prompt_manager_list .completion_prompt_manager_prompt').forEach(item=>{
      // Vue owns these controls and their ancestry; adapt presentation in place.
      if(item.closest('.bai-bai-preset-vue-list-host'))return;
      if(item.classList.contains('cw-v4-prompt-row'))return;item.classList.add('cw-v4-prompt-row');const s=state(item);s.cleanup=()=>item.classList.remove('cw-v4-prompt-row');
      const toggle=item.querySelector('.prompt-manager-toggle-action'),edit=item.querySelector('.prompt-manager-edit-action'),name=item.querySelector('.completion_prompt_manager_prompt_name');
      for(const [node,attrs] of [[toggle,['role','aria-label','aria-checked','tabindex']],[edit,['role']]])if(node){const original=attrs.map(a=>[a,node.getAttribute(a)]);cleanup(s,()=>original.forEach(([a,v])=>v===null?node.removeAttribute(a):node.setAttribute(a,v)));}
      // Grid cells: switch · name · tokens · Edit · ⋯ (the native icons live in a nested span).
      if(toggle){move(s,toggle,item,item.firstChild);toggle.setAttribute('role','switch');toggle.setAttribute('tabindex','0');toggle.setAttribute('aria-label',t('切换提示词启用状态','Toggle prompt'));}
      // Tokens are shown only once counted (the design leaves the column out otherwise).
      const tok=item.querySelector('.prompt_manager_prompt_tokens');if(tok&&!/\d/.test(tok.textContent))item.classList.add('cw-v4-pm-no-tokens');
      const marker=item.querySelector('.fa-thumb-tack,.fa-thumbtack');
      if(name&&marker){const meta=make('span','cw-v4-pm-meta',L('占位'));name.append(meta);s.created.push(meta);}
      if(edit){move(s,edit,item);const label=make('span','cw-v4-action-label',L('编辑'));edit.append(label);s.created.push(label);edit.setAttribute('role','button');}
      // v2：行尾是小开关 + ›，单击整行打开编辑；查看实际内容 / 从列表删除挪进编辑页的 ⋯。
      const chev=make('span','cw-pm-chev');chev.setAttribute('aria-hidden','true');chev.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';item.append(chev);s.created.push(chev);
    });
  }
  // ST's handleInspect only opens when the prompt was part of the last dry run (promptManager.messages);
  // otherwise (off, or empty) the click silently does nothing. Check the same thing when the ⋯ menu opens.
  let pmModule=null;
  function markInspect(item,b){
    if(!pmModule){import(new URL('/scripts/openai.js',win.location.href).href).then(m=>{pmModule=m;markInspect(item,b);},()=>{});return;}
    const pm=pmModule.promptManager,id=item.dataset.pmIdentifier;if(!pm||!id)return;
    let can=false;try{can=pm.messages?.hasItemWithIdentifier(id)===true;}catch{}
    b.disabled=!can;b.style.opacity=can?'':'.45';b.style.cursor=can?'':'default';
    let note=b.nextElementSibling?.classList.contains('cw-v4-more-note')?b.nextElementSibling:null;
    if(can){note?.remove();return;}
    if(!note){note=make('div','cw-v4-more-note',t('这条现在不会发送，没有实际内容可看','Not sent right now, so there is nothing to inspect'));
      note.style.cssText='font-size:12px;line-height:1.35;opacity:.6;padding:0 12px 6px;white-space:normal';b.after(note);}
  }

  /* ---------------- 用户角色 ---------------- */
  function personaName(s){if(!s.who)return;const text=get('your_name')?.textContent.trim()||'';if(s.who.textContent!==text)s.who.textContent=text;}
  function personas(panel){refinements.personas(panel);}
  function personaRows(panel){refinements.sync(panel,state(panel));}

  /* ---------------- 2.0.260 手机：照 Claude App 的 Profile（Lulu：Claude 是标题和内容分开，酒馆是挤在一起） ----------------
   * 手机专用的小节（.cw-v4-phone-only，电脑藏；稿 design-phone-batch1-v3.html，数值 手机参考标准-v1.html）：
   *   字段行 = 灰标签 · 黑值；长文本 = 小节标题在卡片外 + 白卡片一行「…」+ 卡片下面的灰字；不放 ›。
   * 只点酒馆原来的按钮、用 openEditor 打开原来的输入框，不搬原生节点。电脑那几个小节在手机上收成 1px（.cw-v4-desk-only），
   * 不用 display:none——openEditor 的弹窗挂在原处旁边，祖先 display:none 弹窗就画不出来。
   * 值在每次 mount（sync）时按酒馆的状态重画，只在变了才写。 */
  const paints=[];
  const setText=(n,v)=>{if(n.textContent!==v)n.textContent=v;};
  const setFlag=(n,c,on)=>{if(n.classList.contains(c)!==!!on)n.classList.toggle(c,!!on);};
  function pfSec(host,title,cls=''){const sec=section(host,title);sec.classList.add('cw-v4-phone-only','cw-v4-pf');if(cls)sec.classList.add(...cls.split(' '));return sec;}
  function pfBtn(cls,fn,key){const b=make('button','cw-v4-pf-row '+cls);b.type='button';if(key)b.dataset.for=key;b.addEventListener('click',e=>{e.stopPropagation();fn();});return b;}
  // 字段：read() 返回 [值, 是否灰]。
  function pfField(sec,label,fn,read,key){
    const b=pfBtn('cw-v4-pf-field',fn,key),v=make('span','cw-v4-pf-value');b.append(make('span','cw-v4-pf-label',L(label)),v);sec.append(b);
    paints.push(()=>{const [text,dim]=read();setText(v,text);setFlag(v,'cw-v4-pf-dim',dim);});return b;
  }
  function pfText(host,label,read,fn,key){
    const sec=pfSec(host,label,'cw-v4-pf-textsec'),b=pfBtn('cw-v4-pf-text',fn,key);sec.append(b);
    paints.push(()=>{const v=(read()||'').replace(/\s+/g,' ').trim();setText(b,v||L('（空）'));setFlag(b,'cw-v4-pf-dim',!v);});return sec;
  }
  function pfFoot(host,cls=''){const f=make('div','cw-v4-pf-foot cw-v4-phone-only'+(cls?' '+cls:''));host.append(f);return f;}
  function pfAction(host,label,fn,cls=''){const sec=pfSec(host,'',cls);sec.append(pfBtn('cw-v4-pf-blue',fn));sec.lastChild.textContent=L(label);return sec;}
  function pfSwitch(host,label,read,fn,cls=''){
    const sec=pfSec(host,'',cls),b=pfBtn('cw-v4-pf-switchrow',fn),k=make('span','cw-v4-pf-switch');b.setAttribute('role','switch');b.append(make('span','cw-v4-pf-label2',L(label)),k);sec.append(b);
    paints.push(()=>{const on=!!read();if(b.getAttribute('aria-checked')!==String(on))b.setAttribute('aria-checked',String(on));});return sec;
  }
  function pfDelete(host,label,fn,cls=''){const sec=pfSec(host,'','cw-v4-pf-delsec'+(cls?' '+cls:'')),b=pfBtn('cw-v4-pf-del',fn);b.append(icon('trash'),make('span','',L(label)));sec.append(b);return sec;}
  const tagNames=box=>[...(box?.querySelectorAll('.tag .tag_name')||[])].map(n=>n.textContent.trim()).filter(Boolean);
  // 当前角色的数据（世界书名、备选开场白数）：getContext 每次都新建对象，限 1 秒读一次。
  let ctxCache={at:0,ctx:null};
  function ctxNow(){const now=Date.now();if(now-ctxCache.at>=1000)ctxCache={at:now,ctx:win.SillyTavern?.getContext?.()||null};return ctxCache.ctx;}
  const charData=()=>{const c=ctxNow();return c?.characters?.[c?.characterId]?.data||null;};
  // 标签：openEditor 临时把酒馆的标签框（搜索 + 标签块）搬进弹出页，关了搬回。
  const openTags=box=>{if(box)openEditor(box,t('标签','Tags'));};

  /* 2.0.261 手机：列表页照 Claude App 的 Chats——搜索框右端一个调节图标，点开从底部弹出「排序 / 筛选 / 工具」；
   * 酒馆的「A-Z」灰框、6 个圆圈筛选按钮手机上不显示（还在原处，电脑照旧）。弹出的内容每次打开时按酒馆当前状态重建。
   * 选项点了就关；开关、缩放这类「keep」项点了不关、原地重画。 */
  function sheetMenu(cls,summary,build){
    const m=make('details','cw-v4-more cw-v4-created cw-v4-phone-only cw-v4-sheet '+cls),sum=make('summary',''),list=make('div','cw-v4-more-list');
    sum.append(summary);sum.setAttribute('aria-label',L('排序与筛选'));m.append(sum,list);
    const fill=()=>{list.replaceChildren();build({
      head:label=>list.append(make('div','cw-v4-sheet-head',L(label))),
      opt:(label,on,fn)=>{const b=button(label,()=>fn(),'cw-v4-more-item cw-v4-sheet-opt'+(on?' cw-sel':''));list.append(b);return b;},
      keep:(label,fn,state)=>{const b=button('',e=>{e.stopPropagation();fn();win.setTimeout(fill,60);},'cw-v4-more-item cw-v4-sheet-keep');b.append(make('span','cw-v4-sheet-label',label));
        if(state!==undefined){b.setAttribute('role','switch');b.setAttribute('aria-checked',String(!!state));b.append(make('span','cw-v4-sheet-switch'));}list.append(b);return b;},
      chips:items=>{if(!items.length)return;const w=make('div','cw-v4-sheet-chips');for(const [label,on,fn] of items){const c=button(label,e=>{e.stopPropagation();fn();win.setTimeout(fill,60);},'cw-v4-sheet-chip'+(on?' cw-on':''));w.append(c);}list.append(w);},
    });};
    m.addEventListener('toggle',()=>{if(m.open)fill();});
    return m;
  }
  const sliders=()=>icon('sliders');
  // 排序：一行「排序方式 · 当前值 ⌃⌄」，点了关掉这个弹出、开那个下拉自己的底部列表（openSelMenu，和别的下拉一样）。
  function sortPick(ui,select,menuEl){if(!select)return;const b=ui.opt(L('排序方式'),false,()=>{});b.classList.add('cw-v4-sheet-pick');const v=make('span','cw-v4-sheet-value',(select.selectedOptions[0]?.textContent||'').trim());b.append(v);
    b.addEventListener('click',e=>{e.stopPropagation();menuEl.open=false;win.setTimeout(()=>openSelMenu?.(select),30);},true);}
  // 页头：头像在左，名字（点了改名）和 Token 一行灰字在中间，收藏 / 开始聊天在右。
  // 新建角色时酒馆显示 #name_div（输入框），名字按钮让位（CSS）。
  function charHero(s,host){
    const hero=created(s,make('div','cw-v4-hero')),who=make('div','cw-v4-hero-who'),meta=make('div','cw-v4-hero-meta'),acts=make('div','cw-v4-hero-acts');
    host.append(hero);move(s,get('avatar_div_div'),hero);
    const name=make('button','cw-v4-hero-name');name.type='button';name.title=t('点击改名','Click to rename');
    const h2=doc.querySelector('#rm_button_selected_ch h2'),paint=()=>{const v=(h2?.textContent||'').trim();if(name.textContent!==v)name.textContent=v;};paint();
    if(h2){const mo=new win.MutationObserver(paint);mo.observe(h2,{childList:true,characterData:true,subtree:true});cleanup(s,()=>mo.disconnect());}
    name.addEventListener('click',()=>{const d=get('char-management-dropdown'),o=get('renameCharButton');if(!d||!o)return;d.selectedIndex=[...d.options].indexOf(o);d.dispatchEvent(new win.Event('change',{bubbles:true}));});
    who.append(name);move(s,get('name_div'),who);who.append(meta);move(s,get('result_info'),meta);
    const info=get('result_info_text'),stats=get('result_info')?.querySelector('.rm_stats_button');
    if(info&&stats){const go=()=>stats.click();info.addEventListener('click',go);cleanup(s,()=>info.removeEventListener('click',go));}
    hero.append(who,acts);move(s,get('favorite_button'),acts);
    acts.append(button(t('开始聊天','Start chat'),()=>closeSettings?.(),'cw-v4-button cw-v4-hero-chat'));
    // 2.0.260 手机：头像下面「更换头像」胶囊（照 Profile 的 Edit photo）。
    hero.append(button(t('更换头像','Edit photo'),e=>{e.stopPropagation();get('add_avatar_button')?.click();},'cw-v4-pf-pill cw-v4-phone-only'));
    return hero;
  }
  // 行里的控件全被酒馆藏起来（新建 / 已有群聊各显示一部分）时，整行一起藏。
  function autoHide(s,r){
    const ctrls=[...(r?.querySelector('.cw-v4-row-controls')?.children||[])];if(!ctrls.length)return r;
    const sync=()=>{const hide=ctrls.every(c=>c.style.display==='none'||c.classList.contains('displayNone'));if(r.hidden!==hide)r.hidden=hide;};
    const mo=new win.MutationObserver(sync);for(const c of ctrls)mo.observe(c,{attributes:true,attributeFilter:['style','class']});cleanup(s,()=>mo.disconnect());sync();return r;
  }

  /* ---------------- 群聊编辑（2.0.255，design-content-v1）----------------
   * 页头（拼贴头像、群名、收藏、新群聊时「创建群聊」）+ 基本 / 发言 / 成员 / 添加成员 / 更多。
   * 只搬酒馆原来的节点（ID 和事件都在）；剩下的折叠条外壳由 CSS 藏掉。 */
  function groupEditor(){
    const root=get('rm_group_chats_block');if(!root)return;const started=begin(root);if(!started)return;const {s,page}=started;
    root.classList.add('cw-v4-group');cleanup(s,()=>root.classList.remove('cw-v4-group'));
    root.style.setProperty('--cw-add-label',JSON.stringify(t('加入','Add')));cleanup(s,()=>root.style.removeProperty('--cw-add-label'));
    const park=created(s,make('div','cw-v4-park'));page.append(park);
    const hero=created(s,make('div','cw-v4-hero')),who=make('div','cw-v4-hero-who'),acts=make('div','cw-v4-hero-acts');page.append(hero);
    move(s,root.querySelector('#rm_group_top_bar label.add_avatar'),hero);
    const nameIn=get('rm_group_chat_name');
    if(nameIn){const old=nameIn.placeholder;nameIn.placeholder=t('群聊名称','Group name');nameIn.classList.add('cw-v4-hero-input');cleanup(s,()=>{nameIn.placeholder=old;nameIn.classList.remove('cw-v4-hero-input');});move(s,nameIn,who);}
    hero.append(who,acts);move(s,get('group_favorite_button'),acts);move(s,act(s,get('rm_group_submit'),'创建群聊',false,true),acts);
    // 2.0.260 手机（照 Profile）：头像下面「更换头像」；群名在 CSS 里画成「名称」字段卡片；收藏 / 开始聊天 / 标签各是手机专用的一行。
    const avatarLabel=hero.querySelector('label.add_avatar');
    who.dataset.cwLabel=t('名称','Name');
    hero.append(button(t('更换头像','Edit photo'),e=>{e.stopPropagation();avatarLabel?.click();},'cw-v4-pf-pill cw-v4-phone-only'));
    const gfav=get('group_favorite_button'),gtags=get('group_tags_div');
    const ptags=pfSec(page,'','cw-v4-pf-gtags');
    pfField(ptags,'标签',()=>openTags(gtags),()=>{const n=tagNames(gtags);return [n.join('、')||L('无'),!n.length];},'gtags');
    const lore=root.querySelector('#group-metadata-controls .chat_lorebook_button');
    pfField(ptags,'聊天世界书',()=>lore?.click(),()=>{const w=ctxNow()?.chatMetadata?.world_info;return [w||L('未设置'),!w];},'glore').classList.add('cw-v4-pf-existing');
    pfAction(page,'开始聊天',()=>closeSettings?.(),'cw-v4-pf-gap cw-v4-pf-existing');
    pfSwitch(page,'收藏',()=>gfav?.classList.contains('fav_on'),()=>gfav?.click(),'cw-v4-pf-existing');
    move(s,get('rm_button_back_from_group'),park);move(s,get('groupCurrentMemberPopoutButton'),park);
    const basic=section(page,'基本');basic.classList.add('cw-v4-desk-only','cw-v4-after-hero');
    row(s,basic,'聊天世界书','只对这个群聊生效',[act(s,root.querySelector('#group-metadata-controls .chat_lorebook_button'),'设置')]);
    move(s,get('group-chat-lorebook-dropdown'),park);
    row(s,basic,'标签','',[gtags]);
    const talk=section(page,'发言');
    sel(s,talk,get('rm_group_activation_strategy'),'发言顺序','谁接下一句。「自然」按提到的名字和发言频率来选');
    sel(s,talk,get('rm_group_generation_mode'),'角色卡处理','「交换」每次只用说话那位的卡；「合并」把所有成员的卡拼在一起');
    // 前缀 / 后缀只在「合并」模式有用：酒馆按模式切的是文本框父节点（搬过来以后是行里的控件格），整行跟着模式显隐。
    const mode=get('rm_group_generation_mode');
    for(const [id,label,desc] of [['rm_group_generation_mode_join_prefix','合并前缀','插在每位成员每段内容的前面'],['rm_group_generation_mode_join_suffix','合并后缀','插在每段内容的后面']]){
      const r=setting(s,talk,id,label,desc),ctrl=get(id)?.parentElement;if(!r||!mode)continue;
      const sync=()=>{const hide=mode.value==='0';if(r.hidden!==hide)r.hidden=hide;};sync();
      mode.addEventListener('change',sync);const mo=new win.MutationObserver(sync);if(ctrl)mo.observe(ctrl,{attributes:true,attributeFilter:['style']});
      cleanup(s,()=>{mode.removeEventListener('change',sync);mo.disconnect();r.hidden=false;});
    }
    setting(s,talk,'rm_group_allow_self_responses','允许自我回复','同一个角色可以连着说两句');
    const auto=setting(s,talk,'rm_group_automode','自动模式','没人说话时角色自己接着聊，数字是间隔秒数');
    const delay=get('rm_group_automode_delay'),ac=auto?.querySelector('.cw-v4-row-controls');
    if(delay&&ac){delay.classList.add('cw-v4-num');cleanup(s,()=>delay.classList.remove('cw-v4-num'));move(s,delay,ac,ac.firstChild);}
    setting(s,talk,'rm_group_hidemutedsprites','隐藏被禁言成员的立绘');
    const box=(title,listId,filterId,ph)=>{
      const sec=section(page,title),b=make('div','cw-v4-gbox'),head=make('div','cw-v4-gbox-head');sec.append(b);b.append(head);
      head.append(searchBox(s,get(filterId),ph));
      const list=get(listId),tags=list?.querySelector('.rm_tag_controls');
      if(tags){tags.classList.add('cw-v4-tags');cleanup(s,()=>tags.classList.remove('cw-v4-tags'));move(s,tags,head);}
      move(s,list,b);
    };
    box('成员','currentGroupMembers','rm_group_members_filter','搜索成员');
    box('添加成员','unaddedCharList','rm_group_filter','搜索角色');
    const more=section(page,'更多');
    autoHide(s,row(s,more,'群聊场景覆盖','替换成员角色卡里的设定，只在这个群聊里生效',[act(s,get('rm_group_scenario'),'编辑')]));
    autoHide(s,row(s,more,'外部媒体','消息里的外链图片、视频能不能显示',[act(s,get('group_open_media_overrides'),'设置')]));
    autoHide(s,row(s,more,'头像','点上面的头像可以换图片；这里恢复成成员头像拼贴',[act(s,get('rm_group_restore_avatar'),'恢复拼贴')]));
    const del=get('rm_group_delete');if(del){del.classList.add('cw-v4-danger');cleanup(s,()=>del.classList.remove('cw-v4-danger'));}
    autoHide(s,row(s,more,'删除群聊','聊天记录一起删掉，无法恢复',[act(s,del,'删除')])).classList.add('cw-v4-desk-delete');
    pfDelete(page,'删除群聊',()=>del?.click(),'cw-v4-pf-existing');
    const df=pfFoot(page,'cw-v4-pf-existing');df.textContent=t('聊天记录会一起删掉，无法恢复。','Chats are deleted too. This cannot be undone.');
  }

  /* 2.0.260 手机：群聊成员每行右边只留一个 ⋯（底部弹出），里面是酒馆那排小图标的操作；点的是原来的图标（不搬）。
   * 禁言 / 取消禁言按成员当前状态由 CSS 二选一。电脑不建菜单的显示（CSS 藏），照旧用图标。 */
  function groupMemberRows(){
    get('rm_group_members')?.querySelectorAll('.group_member').forEach(item=>{
      if(item.querySelector(':scope>.cw-v4-gm-more'))return;
      const s=state(item),hit=a=>()=>item.querySelector(`[data-action="${a}"]`)?.click();
      const m=menu(s,[['让 TA 说下一句',null,false,hit('speak')],['禁言',null,false,hit('disable')],['取消禁言',null,false,hit('enable')],['上移',null,false,hit('up')],['下移',null,false,hit('down')],['查看角色卡',null,false,hit('view')],['移出群聊',null,true,hit('remove')]]);
      m.classList.add('cw-v4-gm-more','cw-v4-phone-only');
      const [, mute,unmute]=m.querySelectorAll('.cw-v4-more-item');mute?.classList.add('cw-v4-gm-mute');unmute?.classList.add('cw-v4-gm-unmute');
      m.addEventListener('click',e=>e.stopPropagation());
      item.append(m);s.created.push(m);
    });
  }
  /* 2.0.257 手机（Lulu 选 A）：角色管理不用电脑那一行（原生下拉 + ⋯ 两个菜单），另建一个只在手机显示的小节：
   * 三行进下一页、改名 / 复制 / 导出 / 更多操作是蓝色操作行、删除单独一张红字卡片。都是点酒馆原来的按钮或下拉选项。
   * 「更多操作」每次打开时按酒馆下拉里当前有的选项重建（扩展会往里加，比如「展示图库」）。显隐按宽度由 CSS 切。 */
  function pickOption(id){const d=get('char-management-dropdown'),o=get(id);if(!d||!o)return;d.selectedIndex=[...d.options].indexOf(o);d.dispatchEvent(new win.Event('change',{bubbles:true}));}
  /* 2.0.260：角色编辑页手机上半部（照 Profile）。名字 / 标签 / 角色世界书是字段，Token 数写在卡片下面；
   * 开始聊天、收藏各一张单行卡片；描述、开场白、高级定义、创作者注释是「标题 · 白卡片一行 · 说明」。新建角色时藏掉只对已有角色有用的（CSS）。 */
  const chatLore=()=>{const w=ctxNow()?.chatMetadata?.world_info;return [w||L('未绑定'),!w];};
  // 每次都弹原生的绑定窗口（能换书、选 None 解绑）：原生普通点击在已绑定时只开编辑器（手机上还翻不过去），Shift 点才弹窗。
  const linkChatLore=b=>b?.dispatchEvent(new win.MouseEvent('click',{bubbles:true,cancelable:true,shiftKey:true}));
  function phoneCharTop(s,host,form){
    const h2=doc.querySelector('#rm_button_selected_ch h2'),fav=get('favorite_button'),tags=get('tags_div'),world=get('world_button');
    const sec=pfSec(host,'','cw-v4-pf-first');
    pfField(sec,'名字',()=>pickOption('renameCharButton'),()=>[(h2?.textContent||'').trim(),false],'name').classList.add('cw-v4-pf-existing');
    pfField(sec,'标签',()=>openTags(tags),()=>{const n=tagNames(tags);return [n.join('、')||L('无'),!n.length];},'tags');
    pfField(sec,'角色世界书',()=>world?.click(),()=>{const w=charData()?.extensions?.world;return [w||L('未绑定'),!w];},'world');
    // 161 后（yam.0766）：单人聊天也接出原生的「聊天世界书」（群聊早有）。新建角色时藏（pf-existing）。
    const clore=form.querySelector('.chat_lorebook_button');
    if(clore){const f=pfField(sec,'聊天世界书',()=>linkChatLore(clore),chatLore,'clore');f.classList.add('cw-v4-pf-existing');f.title=L('只对当前这段聊天生效');}
    const tok=pfFoot(host,'cw-v4-pf-existing');paints.push(()=>setText(tok,(get('result_info_text')?.textContent||'').replace(/\s+/g,' ').trim()));
    pfAction(host,'开始聊天',()=>closeSettings?.(),'cw-v4-pf-gap cw-v4-pf-existing');
    pfSwitch(host,'收藏',()=>fav?.classList.contains('fav_on'),()=>fav?.click(),'cw-v4-pf-existing');
    const ed=(id,label)=>()=>{const ta=get(id);if(ta)openEditor(ta,L(label));};
    pfText(host,'描述',()=>get('description_textarea')?.value,ed('description_textarea','描述'),'description_textarea').classList.add('cw-v4-pf-content');
    pfText(host,'开场白',()=>get('firstmessage_textarea')?.value,ed('firstmessage_textarea','开场白'),'firstmessage_textarea');
    // 备选开场白：开场白卡片下面一行蓝字，点了开酒馆的备选开场白窗口。
    const altFoot=pfFoot(host),alt=button('',e=>{e.stopPropagation();form.querySelector('.open_alternate_greetings')?.click();},'cw-v4-pf-link');altFoot.append(alt);
    paints.push(()=>{const n=charData()?.alternate_greetings?.length||0;setText(alt,n?t(`另有 ${n} 条备选开场白`,`${n} alternate greeting${n>1?'s':''}`):t('添加备选开场白','Add alternate greetings'));});
    pfText(host,'高级定义',()=>t('性格摘要、场景、示例对话、作者注释','Personality, scenario, examples, author note'),()=>openAdvancedPhone(),'advanced');
    pfText(host,'创作者注释',()=>get('creator_notes_textarea')?.value,()=>openAdvancedPhone(),'creator_notes');
  }
  function phoneManage(s,host){
    const sec=pfSec(host,'角色管理','cw-v4-phone-manage');
    pfField(sec,'已绑定的用户角色',()=>get('char_connections_button')?.click(),()=>['',false],'connections');
    pfField(sec,'角色设置覆盖',()=>pickOption('set_chat_character_settings'),()=>['',false],'overrides');
    const shown=new Set(['set_chat_character_settings','renameCharButton']);
    const more=make('details','cw-v4-more cw-v4-created cw-v4-phone-more'),sum=make('summary','',L('更多操作')),list=make('div','cw-v4-more-list');more.append(sum,list);
    const fill=()=>{list.replaceChildren();const d=get('char-management-dropdown');if(!d)return;
      for(const o of [...d.options]){if(o.value==='default'||shown.has(o.id)||o.hidden||o.style.display==='none')continue;
        const b=button((o.textContent||'').trim(),e=>{e.stopPropagation();more.open=false;d.selectedIndex=[...d.options].indexOf(o);d.dispatchEvent(new win.Event('change',{bubbles:true}));},'cw-v4-more-item');
        if(o.disabled)b.disabled=true;list.append(b);}};
    more.addEventListener('toggle',()=>{if(more.open)fill();});fill();
    const acts=pfSec(host,'','cw-v4-phone-manage');
    for(const [label,fn] of [['复制',()=>get('dupe_button')?.click()],['导出',null]]){const b=pfBtn('cw-v4-pf-blue',()=>fn?fn():openCharacterExport(b));b.textContent=L(label);acts.append(b);}
    acts.append(more);
    // 删除单独一张卡片：垃圾桶 + 红字（照 Profile 的 Delete account）。
    pfDelete(host,'删除这个角色',()=>get('delete_button')?.click(),'cw-v4-phone-manage');
  }
  /* 2.0.257 手机上点「高级定义」不弹酒馆的浮动面板，开手机弹出页：分组卡片，长文本一行（标题 + 预览，点进去全屏编辑），
   * 深度 / 身份是下拉，发言频率是滑杆。控件是从 #character_popup 临时搬来的原节点，关掉就搬回去，电脑照旧用面板。 */
  const phoneWide=()=>win.innerWidth<=700||doc.documentElement.dataset.claudeLayout==='mobile';
  function advancedPhone(s){
    const onClick=e=>{
      if(!(e.target instanceof win.Element)||!e.target.closest('#advanced_div')||!phoneWide())return;
      e.preventDefault();e.stopImmediatePropagation();openAdvancedPhone();
    };
    doc.addEventListener('click',onClick,true);cleanup(s,()=>doc.removeEventListener('click',onClick,true));
  }
  function openAdvancedPhone(){
    const form=get('form_create');if(!form||doc.querySelector('.cw-v4-adv-phone'))return;
    const tmp={moves:[],created:[],root:form},holder=make('div','cw-v4-park'),box=make('div','cw-v4-adv-phone');
    form.append(holder);holder.append(box);
    const g=id=>get(id);
    let x=section(box,'角色');
    textRow(tmp,x,g('personality_textarea'),'性格摘要');textRow(tmp,x,g('scenario_pole'),'情景');textRow(tmp,x,g('mes_example_textarea'),'示例对话','决定角色的文风，很重要');
    x=section(box,'角色备注');
    textRow(tmp,x,g('depth_prompt_prompt'),'内容','按指定身份插进聊天的指定深度');num(tmp,x,g('depth_prompt_depth'),'插入深度');sel(tmp,x,g('depth_prompt_role'),'身份');
    x=section(box,'群聊');rng(tmp,x,g('talkativeness_slider'),null,'发言频率','群聊里这个角色多久说一次话');
    x=section(box,'提示词覆盖');
    textRow(tmp,x,g('system_prompt_textarea'),'主提示词');textRow(tmp,x,g('post_history_instructions_textarea'),'历史后置指令');
    x.append(created(tmp,make('p','cw-v4-adv-note',t('对话补全和指令模式才用。写 {{original}} 可以保留系统设置里的默认提示词。','Chat Completion and Instruct mode only. Write {{original}} to keep the default prompt from system settings.'))));
    x=section(box,t('创作者信息（不会发给 AI）','Creator info (not sent to the AI)'));
    textRow(tmp,x,g('creator_textarea'),'作者');textRow(tmp,x,g('character_version_textarea'),'版本');textRow(tmp,x,g('creator_notes_textarea'),'创作者注释');textRow(tmp,x,g('tags_textarea'),'嵌入标签');
    openEditor(box,t('高级定义','Advanced definitions'),'',{onClose:()=>{
      tmp.cleanups?.forEach(fn=>fn());
      for(const [node,mark] of [...tmp.moves].reverse())if(mark.parentNode)mark.replaceWith(node);
      tmp.created.forEach(n=>n.remove());holder.remove();
    }});
  }

  function characterDetailV2e(parentState, body, form, hero) {
    let detail=null;
    const createLabel=get('create_button_label');
    if(!createLabel)return;

    function restoreDetail(){
      if(!detail)return;
      const {s,host,heroActions,resetTitle}=detail;
      detail=null;
      s.cleanups?.forEach(stop=>stop());
      for(const [node,anchor] of [...s.moves].reverse())if(anchor.parentNode)anchor.replaceWith(node);
      resetTitle();
      heroActions?.remove();
      host.remove();
      body.classList.remove('cw2-char-detail','cw2-char-advanced');
    }

    function mountDetail(){
      const s={moves:[],created:[],root:form},host=make('div','cw2 cw2-char-edit cwr-page');
      body.classList.add('cw2-char-detail');
      hero.classList.add('cw2-char-hero');
      const heroActions=make('div','cw2-char-detail-actions');
      const back=button('',()=>get('rm_button_characters')?.click(),'cw-v4-button cw2-char-back');
      back.append(icon('chevl'),make('span','',L('全部角色')));
      hero.after(host);
      hero.prepend(back);
      const phoneHeader=make('div','cw2-char-phone-head'),phoneName=make('h1','');
      const phoneBack=button('',()=>get('rm_button_characters')?.click(),'cwr-head-action');
      phoneBack.append(icon('chevl'),make('span','',L('全部角色')));
      phoneHeader.append(phoneBack,phoneName);
      get('cw-v4-settings')?.querySelector('.cw-v4-head')?.append(phoneHeader);
      const tabs=make('div','cwr-tabs cw2-char-tabs'),basic=make('div','cw2-char-pane cw2-char-basic'),advanced=make('div','cw2-char-pane cw2-char-adv');
      const tab=(key,label)=>button(L(label),()=>switchTab(key),'cwr-tab');
      const basicTab=tab('basic','基本'),advancedTab=tab('advanced','高级定义');
      tabs.setAttribute('role','tablist');
      for(const button of [basicTab,advancedTab])button.setAttribute('role','tab');
      basic.setAttribute('role','tabpanel');advanced.setAttribute('role','tabpanel');
      tabs.append(basicTab,advancedTab);host.append(tabs,basic,advanced);
      function switchTab(key){
        const advancedOpen=key==='advanced';
        basic.hidden=advancedOpen;advanced.hidden=!advancedOpen;
        body.classList.toggle('cw2-char-advanced',advancedOpen);
        basicTab.setAttribute('aria-selected',String(!advancedOpen));
        advancedTab.setAttribute('aria-selected',String(advancedOpen));
      }
      switchTab('basic');
      const cols=parent=>{
        const grid=make('div','cw2-cols cw2-w64 cw2-stretch'),left=make('div','cw2-col'),right=make('div','cw2-col');
        grid.append(left,right);parent.append(grid);
        return [left,right];
      };
      const fieldPaints=[];
      const field=(parent,id,label,{hint='',mono=false,expand=false,preview=false}={})=>{
        const native=get(id);
        if(!native)return null;
        const box=make('div','cw2-char-field'),line=make('div','cw2-char-field-head');
        const lab=make('label','',L(label));lab.htmlFor=id;line.append(lab);
        let count=null;
        if(native.tagName==='TEXTAREA'){
          count=make('span','cw2-char-token');
          line.append(count);
          let value=native.value;
          const watcher=watchTokens(win,native,n=>setText(count,tokenText(t,n)));
          const refresh=()=>{
            if(value!==native.value){value=native.value;watcher.refresh();}
          };
          fieldPaints.push(refresh);
          native.addEventListener('input',refresh);
          cleanup(s,()=>{watcher.stop();native.removeEventListener('input',refresh);});
        }
        if(expand){
          const big=button('',()=>openEditor(native,L(label)),'cw2-char-link');
          big.append(icon('expand'),make('span','',L('放大')));line.append(big);
        }
        box.append(line);move(s,native,box);
        if(hint)box.append(make('p','cw2-hint',L(hint)));
        if(mono)box.classList.add('cw2-char-mono');
        sectionHost(parent).append(box);
        if(preview){
          const previewText=make('span','cw2-char-preview-text');
          const labelBox=make('span','cw2-char-preview-label',L(label));
          const previewCount=make('span','cw2-char-token');
          labelBox.append(previewCount,previewText);
          const open=button('',()=>openEditor(native,L(label)),'cw2-char-preview');
          open.append(labelBox,icon('chev'));
          box.before(open);
          const update=()=>setText(previewText,native.value.split(/\r?\n/,1)[0]||L('（空）'));
          native.addEventListener('input',update);
          fieldPaints.push(update);
          cleanup(s,()=>native.removeEventListener('input',update));
          const observe=new win.MutationObserver(()=>setText(previewCount,count.textContent));
          observe.observe(count,{childList:true});setText(previewCount,count.textContent);
          cleanup(s,()=>observe.disconnect());
        }
        return box;
      };
      const nativeAction=(label,fn)=>button(L(label),fn,'cw-v4-button');
      const linked=(parent,label,desc,value,fn)=>{
        const b=button('',fn,'cw2-char-link-row');
        const name=make('span','cw2-char-link-value');
        b.append(name,icon('chev'));b.setAttribute('aria-label',L(label));
        const r=row(s,parent,label,desc,[b],'cw2-char-row');
        const paint=()=>setText(name,value());
        paint();return {r,paint};
      };
      const phoneHero=make('div','cw2-char-phone-hero');
      const portrait=make('img','');portrait.alt='';
      const phoneStats=button('',()=>get('result_info')?.querySelector('.rm_stats_button')?.click(),'cw2-char-phone-stats');
      const avatarCard=make('div','cw-v4-card cw2-char-portrait');
      avatarCard.append(portrait,button(L('更换头像'),()=>get('add_avatar_button')?.click(),'cw2-char-avatar-change'),phoneStats);
      const phoneActions=make('div','cw2-char-phone-actions');
      const startChat=button(L('开始聊天'),()=>closeSettings?.(),'cw-v4-button cw2-char-chat');
      startChat.prepend(icon('chat'));
      const star=button('',()=>get('favorite_button')?.click(),'cw-v4-button cw2-char-favorite');
      star.setAttribute('aria-label',L('收藏'));
      star.append(popIcon('star'));
      phoneActions.append(startChat,star);phoneHero.append(avatarCard,phoneActions);
      basic.append(phoneHero);
      const [left,right]=cols(basic);
      const description=section(left,'');
      description.classList.add('cw2-char-grow','cw2-char-summary');
      field(description,'description_textarea','描述',{hint:'外貌、性格、背景……',expand:true,preview:true});
      const greeting=section(left,'');
      greeting.classList.add('cw2-char-greeting','cw2-char-summary');
      field(greeting,'firstmessage_textarea','开场白',{expand:true,preview:true});
      for(const [section,label] of [[description,'描述'],[greeting,'开场白']]){
        section.prepend(make('h2','cw2-char-summary-heading',L(label)));
      }
      const alt=linked(greeting,'备选开场白','',()=>t(`${charData()?.alternate_greetings?.length||0} 条 · 管理`,`${charData()?.alternate_greetings?.length||0} · Manage`),()=>form.querySelector('.open_alternate_greetings')?.click());

      alt.r.classList.add('cw2-char-alternate');
      const info=section(right,'基本信息');
      info.classList.add('cw2-char-info');
      const avatar=make('img','cw2-char-mini-avatar');avatar.alt='';
      row(s,info,'头像','角色卡的 PNG 图片',[avatar,nativeAction('更换头像',()=>get('add_avatar_button')?.click())],'cw2-char-desktop-avatar');
      const name=make('span','cw2-char-name');
      row(s,info,'名字','',[name,nativeAction('改名',()=>pickOption('renameCharButton'))]);
      row(s,info,'标签','',[get('tags_div')],'cw2-char-tags');
      const world=section(right,'世界书');
      world.classList.add('cw2-char-world');
      const charWorld=linked(world,'角色世界书','只在和这个角色聊天时用',()=>get('character_world')?.value||L('未绑定'),()=>pickOption('set_character_world'));
      const chatWorld=linked(world,'聊天世界书','只对当前这段聊天生效',()=>chatLore()[0],()=>linkChatLore(form.querySelector('.chat_lorebook_button')));
      const embedded=row(s,world,'导入角色卡里的世界书','',[nativeAction('导入',()=>pickOption('import_character_info'))]);
      const display=section(right,'绑定与显示');
      display.classList.add('cw2-char-display');
      const personaLinks=linked(display,'已绑定的用户角色','',()=>{
        const c=win.SillyTavern?.getContext?.(),avatar=c?.characters?.[c.characterId]?.avatar;
        const count=Object.values(c?.powerUserSettings?.persona_descriptions||{}).filter(p=>p.connections?.some(conn=>conn.type==='character'&&conn.id===avatar)).length;
        return t(`${count} 个`,`${count} linked`);
      },()=>get('char_connections_button')?.click());
      linked(display,'角色设置覆盖','只对这个角色使用的提示词和后缀',()=>'',()=>pickOption('set_chat_character_settings'));
      row(s,display,'允许外部媒体','控制外链图片和视频的显示',[nativeAction('设置',()=>get('character_open_media_overrides')?.click())]);
      row(s,display,'使用全局样式','控制创作者注释里的样式作用范围',[nativeAction('设置',()=>get('creators_note_styles_button')?.click())]);

      const [a,b]=cols(advanced);
      const fieldPair=(parent,items)=>{
        const pair=make('div','cw2-char-pair');sectionHost(parent).append(pair);
        for(const [id,label,options] of items)field(pair,id,label,options);
      };
      fieldPair(section(a,'提示词覆盖'),[
        ['system_prompt_textarea','系统提示词',{hint:'可用 {{original}} 保留默认内容'}],
        ['post_history_instructions_textarea','历史后置指令',{hint:'可用 {{original}} 保留默认内容'}],
      ]);
      fieldPair(section(a,'性格与场景'),[['personality_textarea','性格摘要'],['scenario_pole','场景']]);
      const frequency=get('talkativeness_slider');
      if(frequency){
        const range=frequency.closest('#talkativeness_div')||frequency;
        const group=section(a,'群聊');group.classList.add('cw2-char-group');
        move(s,range,sectionHost(group));
      }
      const examples=section(a,'');examples.classList.add('cw2-char-grow','cw2-char-examples');
      field(examples,'mes_example_textarea','示例对话',{mono:true,expand:true,hint:t('用 <START> 分隔每一段示例。上下文不够时最先被裁掉。','Separate examples with <START>. These are dropped first when context is limited.')});
      const note=section(b,'角色备注');
      note.classList.add('cw2-char-note');
      field(note,'depth_prompt_prompt','内容');
      const depth=get('depth_prompt_depth');
      if(depth)row(s,note,'插入深度',t('从最新一条消息往回数','Count back from the latest message'),[depth],'cw2-char-depth');
      const role=get('depth_prompt_role');
      let roleSegment=null;
      if(role){
        row(s,note,'身份','',[role],'cw2-char-role');
        roleSegment=mountNativeSegment(role);
        if(roleSegment)cleanup(s,roleSegment.destroy);
      }
      const meta=section(b,'卡片信息');meta.classList.add('cw2-char-grow');
      for(const [id,label] of [['creator_textarea','创作者'],['character_version_textarea','角色版本']]){
        const native=get(id);
        if(native)row(s,meta,label,'',[native],'cw2-char-short-field');
      }
      field(meta,'tags_textarea','内嵌标签',{hint:t('写进角色卡文件里的标签。','Tags written into the character card file.')})?.classList.add('cw2-char-embedded-tags');
      const creator=field(meta,'creator_notes_textarea','创作者注释',{hint:t('只给人看，不会发送给模型。','For readers only. Never sent to the model.')});
      creator?.classList.add('cw2-char-creator-notes');

      const popup=get('character_popup');
      if(popup){
        const knownChrome='#character_popup_ok,#character_cross,.editor_maximize,.inline-drawer-icon,.notes-link';
        let other;
        const moveExtras=()=>{
          const extras=new Set([...popup.querySelectorAll('input,textarea,select,button,.menu_button,[role=button]')]
            .filter(n=>!n.matches(knownChrome)&&!n.closest('.notes-link'))
            .map(n=>n.closest('label')||n));
          if(!extras.size)return;
          other??=section(b,'其他设置');
          for(const block of extras){
            if(popup.contains(block))move(s,block,sectionHost(other));
          }
        };
        moveExtras();
        const observer=new win.MutationObserver(moveExtras);
        observer.observe(popup,{childList:true,subtree:true});
        cleanup(s,()=>observer.disconnect());
      }

      const more=menu(s,[['复制',null,false,()=>get('dupe_button')?.click(),'copy'],['导出',null,false,()=>openCharacterExport(more.querySelector(':scope>summary')),'exp']]);
      const entries=more.querySelector('.cw-v4-more-list');
      const base=Array.from(entries.children);
      const optionIcons={replace_update:'refresh',convert_to_persona:'user',character_source:'ext',import_tags:'tag',show_char_gallery:'eye',set_as_assistant:'spark'};
      const management=get('char-management-dropdown');
      const separated=new Set(['convert_to_persona','character_source','import_tags','set_as_assistant']);
      const omitted=new Set(['set_character_world','import_character_info','set_chat_character_settings','renameCharButton']);
      function fillMore(){
        entries.replaceChildren(...base);
        let divider=false;
        const options=[...(management?.options||[])].filter(o=>o.value!=='default'&&!omitted.has(o.id)&&!o.hidden&&o.style.display!=='none');
        options.sort((a,b)=>Number(b.id==='replace_update')-Number(a.id==='replace_update'));
        for(const option of options){
          if(!divider&&separated.has(option.id)){entries.append(make('hr','cwr-pop-hr'));divider=true;}
          const label=option.id==='convert_to_persona'?t('转换为用户角色','Convert to persona'):option.textContent.trim();
          const item=button(label,e=>{
            e.stopPropagation();more.open=false;
            option.selected=true;
            management.dispatchEvent(new win.Event('change',{bubbles:true}));
          },'cw-v4-more-item');
          item.prepend(optionIcons[option.id]&&POP_ICONS[optionIcons[option.id]]?popIcon(optionIcons[option.id]):icon(optionIcons[option.id]||'gear'));
          item.disabled=option.disabled;entries.append(item);
        }
        entries.append(make('hr','cwr-pop-hr'));
        const remove=button(L('删除这个角色'),e=>{
          e.stopPropagation();more.open=false;get('delete_button')?.click();
        },'cw-v4-more-item cw-v4-danger');
        remove.prepend(popIcon('trash'));entries.append(remove);
      }
      more.addEventListener('toggle',()=>{if(more.open)fillMore();});
      fillMore();
      heroActions.append(more);hero.append(heroActions);
      const layout=()=>{
        const target=phoneWide()?phoneHeader:heroActions;
        if(more.parentNode!==target)target.append(more);
      };
      win.addEventListener('resize',layout);cleanup(s,()=>win.removeEventListener('resize',layout));layout();
      const stats=get('result_info_text');
      const tokenLabel=make('span','cw2-char-total');
      stats?.append(tokenLabel);
      const total=get('result_info_total_tokens'),permanent=get('result_info_permanent_tokens');
      const paintTokens=()=>{
        const amount=total?.textContent.trim()||'',persistent=permanent?.textContent.trim()||'';
        const label=persistent?t(amount+' Token · 其中 '+persistent+' 永久',amount+' tokens · '+persistent+' permanent'):amount;
        setText(tokenLabel,label);setText(phoneStats,label);
      };
      const nativeTokens=new win.MutationObserver(paintTokens);
      for(const n of [total,permanent])if(n)nativeTokens.observe(n,{childList:true,characterData:true,subtree:true});
      cleanup(s,()=>{nativeTokens.disconnect();tokenLabel.remove();});
      paintTokens();

      const paint=()=>{
        const heading=doc.querySelector('#rm_button_selected_ch h2');
        setText(name,heading?.textContent?.trim()||'');setText(phoneName,name.textContent);
        for(const fn of fieldPaints)fn();
        const fav=get('favorite_button')?.classList.contains('fav_on');
        star.setAttribute('aria-pressed',String(Boolean(fav)));
        layout();
        const src=hero.querySelector('#avatar_div_div img')?.getAttribute('src')||'';
        if(avatar.getAttribute('src')!==src){avatar.setAttribute('src',src);portrait.setAttribute('src',src);}
        const book=get('import_character_info');
        const embeddedBook=charData()?.character_book;
        embedded.hidden=!book||book.disabled||book.hidden||book.style.display==='none'||!embeddedBook;
        for(const widget of [alt,charWorld,chatWorld,personaLinks])widget.paint();
        roleSegment?.refresh();
      };
      detail={s,host,heroActions,paint,resetTitle:()=>{back.remove();phoneHeader.remove();hero.classList.remove('cw2-char-hero');}};
      paint();
    }

    const sync=()=>{
      if(createLabel.style.display==='none'){
        if(!detail)mountDetail();
        else detail.paint();
      }else restoreDetail();
    };
    const ctx=win.SillyTavern?.getContext?.();
    const opened=ctx?.eventTypes?.CHARACTER_EDITOR_OPENED;
    if(opened&&ctx.eventSource){
      ctx.eventSource.on(opened,sync);
      cleanup(parentState,()=>ctx.eventSource.removeListener(opened,sync));
    }
    const observer=new win.MutationObserver(sync);
    observer.observe(createLabel,{attributes:true,attributeFilter:['style']});
    cleanup(parentState,()=>{observer.disconnect();restoreDetail();});
    paints.push(sync);
    sync();
  }
  /* ---------------- 角色卡 ---------------- */
  function characters(panel){const list=get('rm_characters_block');if(!list)return;const started=begin(list);if(!started)return;const {s,page}=started;
    // In the edit view the native list button is the way back to the list.
    const back=get('rm_button_characters');if(back&&!back.querySelector('.cw-v4-action-label')){const label=make('span','cw-v4-action-label',t('全部角色','All characters'));back.append(label);s.created.push(label);back.classList.add('cw-v4-back');s.cleanup=()=>back.classList.remove('cw-v4-back');}
    page.classList.add('cw2','cw2-char-list','cwr-page');
    const header=make('div','cw2-char-sticky');
    const head=make('div','cw2-bar cw2-mbar cw2-char-bar');
    const importButton=get('character_import_button'),createButton=get('rm_button_create');
    const searchInput=get('character_search_bar');
    const search=searchBox(s,searchInput);
    search.classList.add('cwr-search-box');
    if(searchInput){
      const original=searchInput.placeholder;
      const placeholder=t('搜索角色名、标签、创作者备注','Search names, tags, and creator notes');
      const paintSearch=()=>{if(searchInput.placeholder!==placeholder)searchInput.placeholder=placeholder;};
      const observe=new win.MutationObserver(paintSearch);
      observe.observe(searchInput,{attributes:true,attributeFilter:['placeholder']});
      cleanup(s,()=>{observe.disconnect();searchInput.placeholder=original;});
      paintSearch();
    }
    head.append(make('h2','',L('角色卡')),search);
    head.append(make('span','cw2-note',t('点一个角色看详情；行尾 ⋯ 可以直接聊天、复制、导出、删除。','Open a character to view its details. Use ⋯ to start a chat, copy, export, or delete.')));
    head.append(make('span','cw2-sp'));
    for(const [native,label,glyph,primary] of [[importButton,'导入','imp',false],[createButton,'新建角色','plus',true]]){
      if(!native)continue;
      move(s,act(s,native,label,false,primary),head);
      native.prepend(created(s,popIcon(glyph)));
    }
    const actions=menu(s,[
      ['新建群聊',get('rm_button_group_chats'),false,null,'plus'],
      ['从网址导入',get('external_import_button'),false,null,'ext'],
      ['批量编辑',get('bulkEditButton'),false,null,'pencil'],
    ]);
    const menuList=actions.querySelector('.cw-v4-more-list');
    const mobileImport=button(L('从文件导入'),e=>{
      e.stopPropagation();actions.open=false;importButton?.click();
    },'cw-v4-more-item cw2-char-mobile-import');
    mobileImport.prepend(popIcon('imp'));
    const syncImport=()=>{
      if(phoneWide()&&importButton){if(!mobileImport.isConnected)menuList.append(mobileImport);}
      else mobileImport.remove();
    };
    win.addEventListener('resize',syncImport);cleanup(s,()=>win.removeEventListener('resize',syncImport));syncImport();
    head.append(actions);
    header.append(head);
    const filters=make('div','cw2-char-filters');
    const tags=list.querySelector('#charListFixedTop .rm_tag_controls');
    if(tags){
      tags.classList.add('cw-v4-tags');
      move(s,tags,filters);
      cleanup(s,()=>tags.classList.remove('cw-v4-tags'));
    }
    const sort=make('label','cw2-char-sort',L('排序'));
    move(s,get('character_sort_order'),sort);
    filters.append(sort);
    header.append(filters);
    page.append(header);
    const bulk=make('div','cw-v4-bulkbar'),bcount=make('span','cw-v4-bulk-count');
    bulk.append(bcount,
      button(L('全选'),()=>get('bulkSelectAllButton')?.click(),'cw-v4-bulk-btn'),
      button(L('删除'),()=>get('bulkDeleteButton')?.click(),'cw-v4-bulk-btn cw-v4-bulk-del'),
      button(L('完成'),()=>get('bulkEditButton')?.click(),'cw-v4-bulk-btn cw-v4-bulk-done'));
    header.append(bulk);
    paints.push(()=>{
      const count=parseInt(get('bulkSelectedCount')?.textContent||'0',10)||0;
      setText(bcount,t(`已选 ${count} 个`,`${count} selected`));
    });
    const all=section(page,'全部角色');
    all.classList.add('cw-v4-entries','cw-v4-chatlist');
    const count=make('span','cw2-char-count');
    const title=all.querySelector('h2');
    title.append(count);
    const nativeSort=get('character_sort_order');
    if(nativeSort){
      const sortLabel=make('span','');
      const phoneSort=button('',()=>openSelMenu?.(nativeSort),'cw-v4-button cw2-char-phone-sort');
      const paintSort=()=>{
        const label=nativeSort.selectedOptions[0]?.textContent.trim()||L('排序');
        setText(sortLabel,label);
        const name=t('排序：'+label,'Sort: '+label);
        if(phoneSort.getAttribute('aria-label')!==name)phoneSort.setAttribute('aria-label',name);
      };
      phoneSort.append(sortLabel,icon('chevd'));
      title.append(phoneSort);
      paints.push(paintSort);
      paintSort();
    }
    move(s,get('charListGridToggle'),sort);
    const pager=get('rm_print_characters_pagination');
    if(pager)move(s,pager,title);
    move(s,get('rm_print_characters_block'),all);
    if(pager)cleanup(s,()=>pager.classList.remove('cw2-char-single-page'));
    paints.push(()=>{
      const model=pager&&win.jQuery?.(pager).data('pagination')?.model;
      const total=model?.totalNumber;
      const pageSize=model?.pageSize||Number(pager?.querySelector('select')?.value);
      if(pager) setFlag(pager,'cw2-char-single-page',Number.isFinite(total)&&pageSize>0&&total<=pageSize);
      const current=get('rm_print_characters_block')?.querySelectorAll(':scope>:is(.character_select,.group_select,.bogus_folder_select)').length||0;
      setText(count,String(Number.isFinite(total)?total:current));
    });
    // After an import or a new character ST scrolls #rm_print_characters_block to the card and flashes it, but here the
    // panel scrolls, not that block, so the card stayed off screen. Follow ST's flash and scroll the real scroller.
    const printed=get('rm_print_characters_block');if(printed){
      const shown=new WeakSet(),watch=new MutationObserver(ms=>{for(const m of ms){const card=m.target;
        if(shown.has(card)||!card.classList.contains('flash'))continue;shown.add(card);
        let box=card.parentElement;while(box&&!(box.scrollHeight>box.clientHeight+1&&/auto|scroll/.test(getComputedStyle(box).overflowY)))box=box.parentElement;
        if(box){const r=card.getBoundingClientRect(),b=box.getBoundingClientRect();box.scrollTop+=r.top-b.top-(box.clientHeight-r.height)/2;}
      }});
      watch.observe(printed,{subtree:true,attributes:true,attributeFilter:['class']});cleanup(s,()=>watch.disconnect());
    }
    // After loading a character ST programmatically clicks the composer to focus it.
    // That click must not reach ST's document-level outside-drawer handler from details.
    const composer=win.jQuery?.(get('send_textarea'));
    const keepDetails=e=>{
      const right=get('right-nav-panel'),shell=get('cw-v4-settings');
      if(!e.isTrigger||shell?.hidden||shell?.dataset.panel!==right?.id||!right?.classList.contains('openDrawer'))return;
      const edit=get('rm_ch_create_block'),create=get('create_button_label');
      if(!edit?.getClientRects().length||create?.style.display!=='none')return;
      e.stopPropagation();
    };
    composer?.on('click.cwCharacterDetails',keepDetails);
    cleanup(s,()=>composer?.off('click.cwCharacterDetails',keepDetails));
    finish(s);
    // Keep the real form and its conditional wrappers, including create-only
    // name/submit controls. Editing an existing name still uses ST's Rename.
    const form=get('form_create'),adapted=form&&begin(form);if(adapted){
      const fs=adapted.s,body=adapted.page;
      // 2.0.255（design-content-v1）：头像 + 名字 + Token 合成页头；原来空着的「名字」行和单独的「头像」行去掉。
      const hero=charHero(fs,body);
      phoneCharTop(fs,body,form);
      const general=section(body,'');general.classList.add('cw-v4-desk-only','cw-v4-after-hero');
      row(fs,general,'标签','',[get('tags_div')]);
      const content=section(body,'内容');content.classList.add('cw-v4-desk-only');
      textRow(fs,content,get('description_textarea'),'描述','外貌、性格、背景……');
      textRow(fs,content,get('firstmessage_textarea'),'开场白','聊天开始时角色说的第一句');
      const more=section(body,'更多');more.classList.add('cw-v4-desk-more');row(fs,more,'高级定义','性格摘要、场景、示例对话、作者注释等',[act(fs,get('advanced_div'),'打开')]);
      const alt=form.querySelector('.open_alternate_greetings');if(alt)row(fs,more,'备选开场白','',[act(fs,alt,'管理')]);
      const notes=get('spoiler_free_desc');if(notes){const r=row(fs,more,t('创作者注释','Creator notes'),'',[]),park=make('div','cw-v4-park');r.append(park);move(fs,notes,park);r.querySelector('.cw-v4-row-controls').append(button(L('配置'),()=>openEditor(notes,t('创作者注释','Creator notes'))));}
      const deskManage=row(fs,more,t('角色管理','Character management'),'',[get('char-management-dropdown'),get('create_button_label'),menu(fs,[['角色世界书',get('world_button')],['聊天世界书',form.querySelector('.chat_lorebook_button'),false,()=>linkChatLore(form.querySelector('.chat_lorebook_button'))],['已绑定的用户角色',get('char_connections_button')],['导出',get('export_button')],['复制',get('dupe_button')],['删除这个角色',get('delete_button'),true]])]);
      deskManage.classList.add('cw-v4-desk-manage');
      // 电脑「角色管理」⋯ 里的「聊天世界书」：右边灰字写当前绑定的书名，没有就「未绑定」；悬停说明只对当前聊天生效。
      const cloreItem=[...deskManage.querySelectorAll('.cw-v4-more-item')].find(b=>b.textContent===L('聊天世界书'));
      if(cloreItem){const v=created(fs,make('span','cw-v4-more-value'));cloreItem.classList.add('cw-v4-clore-item');cloreItem.title=L('只对当前这段聊天生效');cloreItem.append(v);paints.push(()=>{const [text,dim]=chatLore();setText(v,text);setFlag(v,'cw-v4-pf-dim',dim);});}
      phoneManage(fs,body);advancedPhone(fs);
      finish(fs);
      characterDetailV2e(fs,body,form,hero);
    }
  }
  function characterRows(panel){
    const list=panel.querySelector('#rm_print_characters_block');if(!list)return;
    const s=state(list);
    const select=async(item,edit,action)=>{
      const id=Number(item.dataset.chid),st=await import(new URL('/script.js',win.location.href).href);
      if(!edit)closeSettings?.(true);
      await st.selectCharacterById(id,{switchMenu:edit});
      if(String(win.SillyTavern?.getContext?.().characterId)!==String(id))return;
      if(action)get(action)?.click();
    };
    if(!s.characterRows){
      s.characterRows=true;
      cleanup(s,bindRowMenu(list,'.cw-v4-character-more',trigger=>{
        const item=trigger.closest('.character_select'),run=action=>()=>select(item,true,action).catch(console.error);
        return menu(null,[['开始聊天',null,false,()=>select(item,false).catch(console.error),'move'],['编辑',null,false,run(),'pencil'],['收藏',null,false,run('favorite_button'),'star'],['复制',null,false,run('dupe_button'),'copy'],['导出',null,false,run('export_button'),'exp'],'-',['删除这个角色',null,true,run('delete_button'),'trash']]);
      }));
      const click=e=>{
        const item=e.target.closest('.character_select');
        if(!item||!list.contains(item)||e.target.closest('.cw-v4-character-actions')||item.closest('.group_overlay_mode_select')||e.shiftKey||e.ctrlKey||e.metaKey)return;
        e.stopPropagation();select(item,true).catch(console.error);
      };
      list.addEventListener('click',click);
      cleanup(s,()=>{list.removeEventListener('click',click);list.querySelectorAll('.cw-v4-character-actions').forEach(n=>n.remove());});
    }
    // 2.0.215（Lulu）：点角色 = 进入编辑（和设置里其他「›」行一样进下一页）；直接去聊天放进 ⋯ 的第一项。原来点整行是开始聊天、「编辑」另有一个按钮。
    for(const item of list.querySelectorAll('.character_select')){
      if(item.querySelector('.cw-v4-character-actions'))continue;
      const actions=make('div','cw-v4-character-actions'),chev=make('span','cw-v4-character-chev');
      chev.setAttribute('aria-hidden','true');
      actions.append(rowMore('cw-v4-character-more'),chev);item.append(actions);
    }
  }

  /* ---------------- API 连接 ---------------- */
  function api(panel){
    if(!panel.classList.contains('cw-v4-api-page'))panel.classList.add('cw-v4-api-page');const started=begin(panel);
    if(started){const {s,page}=started;
      s.profile=section(page,'连接配置');
      // Provider blocks sit inside the API section so the source row continues
      // it; each block keeps its own native display toggle.
      const apiSection=section(page,'接口');sel(s,apiSection,get('main_api'),'接口类型');
      for(const id of ['kobold_horde','kobold_api','novel_api','textgenerationwebui_api','openai_api'])move(s,get(id),apiSection);
      s.connection=section(page,'连接');
      finish(s);
    }
    const s=state(panel),profiles=get('connection_profiles');
    if(profiles&&s.profile&&!s.profile.contains(profiles)&&!panel.classList.contains('cw2')){
      profiles.classList.add('cw-v4-preset-sel');cleanup(s,()=>profiles.classList.remove('cw-v4-preset-sel'));
      row(s,s.profile,'配置','保存一整套接口、模型和预设',[profiles,act(s,get('update_connection_profile'),'保存'),act(s,get('create_connection_profile'),'新建',true),menu(s,[['查看详情',get('view_connection_profile')],['编辑',get('edit_connection_profile')],['重新载入',get('reload_connection_profile')],['删除',get('delete_connection_profile'),true]])]);
    }
    const profileRow=s.profile?.querySelector('.cw-v4-row');profileRow?.classList.add('cwr-connection-row');
    if(profileRow&&profiles&&!profileRow.querySelector('.cwr-connection-top')){const top=created(s,make('div','cwr-connection-top'));profileRow.prepend(top);move(s,profiles,top);top.append(icon('chevd'));}
    const source=get('openai_api');if(source&&!source.dataset.cwV4Sources){
      source.dataset.cwV4Sources='1';const ss=state(source);
      const ccs=get('chat_completion_source'),head=ccs?.previousElementSibling;
      const sourceRow=rowEl('对话补全来源','').r;source.prepend(sourceRow);ss.created.push(sourceRow);move(ss,ccs,sourceRow.querySelector('.cw-v4-row-controls'));
      if(head&&/^H\d$/.test(head.tagName)){head.classList.add('cw-v4-hidden-native');cleanup(ss,()=>head.classList.remove('cw-v4-hidden-native'));}
      const sec=section(source,'来源设置');sourceRow.after(sec);ss.created.push(sec);
      const proxy=source.querySelector(':scope>.inline-drawer');if(proxy){const r=row(ss,sec,t('反向代理','Reverse proxy'),'',[]),park=make('div','cw-v4-park');r.append(park);move(ss,proxy,park);r.querySelector('.cw-v4-row-controls').append(button(L('配置'),()=>openEditor(proxy,t('反向代理','Reverse proxy'))));}
      source.querySelectorAll(':scope>form,:scope>div[id$="_form"]').forEach(n=>n.classList.add('cw-v4-form-section'));
      const connect=get('api_button_openai'),actions=connect?.parentElement,status=source.querySelector(':scope>.online_status');
      if(actions&&s.connection){
        const loading=actions.querySelector('.api_loading'),authorize=actions.querySelector('.openrouter_authorize');
        const r=row(ss,s.connection,'状态',status||'',[act(ss,connect,'连接',false,true),act(ss,get('customize_additional_parameters'),'附加参数'),act(ss,get('test_api_button'),'测试消息')]);
        const rest=make('div','cw-v4-park');r.append(created(ss,rest));move(ss,actions,rest);
        r.querySelector('.cw-v4-row-controls').append(menu(ss,[['取消连接',loading],[t('查看隐藏的 API 密钥','View hidden API keys'),get('viewSecrets')],[t('OpenRouter 授权','Authorize OpenRouter'),authorize]]));
        tg(ss,s.connection,get('auto-connect-checkbox'),'自动连接上次的服务器');
      }
    }
  }

  // Extension update checks run only when a user opens the list/configuration.
  let versionState={kind:'latest',current:'',remote:''},versionIdentity=null,versionPending=null,versionDisposed=false,versionCard=null;
  const versionRows=new Set();
  let versionSuppressed=false,versionDelay=null,finishVersionDelay=null;
  const cancelOwnVersionCheck=event=>{if(event.target.closest?.('#extensions_details')){versionSuppressed=true;if(versionDelay){win.clearTimeout(versionDelay);versionDelay=null;finishVersionDelay?.();}}};
  doc.addEventListener('click',cancelOwnVersionCheck,true);
  const moduleBase=new URL('.',import.meta.url);
  const ownLoader=[...doc.scripts].find(n=>n.src&&/\/loader-[^/]+\.js/.test(new URL(n.src).pathname)&&new URL('.',n.src).href===moduleBase.href);
  // 作为正式仓 preview/ 里的前瞻版运行时，扩展身份（文件夹名、manifest）以根目录为准。
  const versionBase=new URL('.',globalThis.__cwPreview?.root||ownLoader?.src||import.meta.url);
  const versionFolder=decodeURIComponent(versionBase.pathname.replace(/\/$/,'').split('/').pop());
  const versionHeaders=()=>win.SillyTavern?.getContext?.()?.getRequestHeaders?.()||{'Content-Type':'application/json'};
  const versionPost=(endpoint)=>win.fetch('/api/extensions/'+endpoint,{method:'POST',headers:versionHeaders(),body:JSON.stringify(versionIdentity)});
  const versionKey=()=> 'claude-web:update-status:'+versionIdentity.extensionName+':'+versionIdentity.global;
  function cacheVersion(){try{win.sessionStorage.setItem(versionKey(),JSON.stringify({at:Date.now(),kind:versionState.kind,remote:versionState.remote}));}catch{}}
  function paintVersion(){
    if(versionDisposed)return;
    const state=versionState,available=state.kind==='available',done=state.kind==='done',busy=state.kind==='updating';
    const text=busy?t('正在更新…','Updating…'):done?t('已更新到 ','Updated to ')+(state.remote||state.current):available?'● '+t('有新版本','Update available')+(state.remote?' '+state.remote:''):state.current;
    const action=()=>versionState.kind==='done'?win.location.reload():updateVersion();
    for(const r of versionRows){if(!r.isConnected){versionRows.delete(r);continue;}let status=r.querySelector('.cw-update-status');
      if(!status){status=make('span','cw-update-status');status.append(make('span','cw-update-label'),button('',action,'cw-v4-button cw-update-action'));r.querySelector('.cw-v4-extension-edit')?.before(status);}
      const label=status.querySelector('.cw-update-label');if(label.textContent!==text)label.textContent=text;if(status.dataset.kind!==state.kind)status.dataset.kind=state.kind;if(status.dataset.current!==state.current)status.dataset.current=state.current;
      const control=status.querySelector('button');if(control.hidden!==(!available&&!done))control.hidden=!available&&!done;if(control.disabled!==busy)control.disabled=busy;const value=done?t('刷新页面','Reload page'):t('更新','Update');if(control.textContent!==value)control.textContent=value;
    }
    const sections=get('claude-web-settings')?.querySelector('.claude-web-sections');
    if(sections){if(!versionCard||!versionCard.isConnected){versionCard=make('div','cw-update-card');versionCard.append(make('b','cw-update-card-title'),make('div','cw-update-card-desc'),button('',action,'cw-v4-button cw-update-card-action'));sections.prepend(versionCard);}
      if(versionCard.hidden!==(!available&&!done&&!busy))versionCard.hidden=!available&&!done&&!busy;const title=versionCard.querySelector('b');if(title.textContent!==text)title.textContent=text;
      const desc=versionCard.querySelector('.cw-update-card-desc'),detail=done?t('刷新页面后生效','Reload the page to apply'):t('当前 ','Current ')+state.current;if(desc.textContent!==detail)desc.textContent=detail;
      const control=versionCard.querySelector('button');control.disabled=busy;const value=done?t('刷新页面','Reload page'):busy?t('正在更新…','Updating…'):t('更新','Update');if(control.textContent!==value)control.textContent=value;
    }
  }
  async function checkVersion(){
    if(versionDisposed||versionSuppressed)return;if(['done','updating'].includes(versionState.kind)){paintVersion();return;}if(versionPending)return versionPending;
    const checkAfter=win.performance.now()+3000;
    versionPending=(async()=>{try{
      if(!versionIdentity){const [manifest,list]=await Promise.all([win.fetch(new URL('manifest.json',versionBase)).then(r=>r.ok?r.json():{}),win.fetch('/api/extensions/discover').then(r=>r.json())]);
        versionState.current=String(manifest.version||'');const item=list.find(x=>x.name==='third-party/'+versionFolder||x.name===versionFolder);if(!item||!['local','global'].includes(item.type))return;
        versionIdentity={extensionName:versionFolder,global:item.type==='global'};
      }
      paintVersion();let cached;try{cached=JSON.parse(win.sessionStorage.getItem(versionKey())||'null')}catch{}
      if(cached&&Date.now()-cached.at<3600000){versionState.kind=['available','latest'].includes(cached.kind)?cached.kind:'latest';versionState.remote=String(cached.remote||'');paintVersion();return;}
      await new Promise(resolve=>{finishVersionDelay=resolve;versionDelay=win.setTimeout(resolve,Math.max(0,checkAfter-win.performance.now()));});versionDelay=null;finishVersionDelay=null;
      if(versionDisposed||versionSuppressed)return;
      const response=await versionPost('version');if(!response.ok)throw Error('HTTP '+response.status);const data=await response.json();
      if(typeof data.isUpToDate!=='boolean')throw Error('Invalid extension version response');versionState.kind=data.isUpToDate?'latest':'available';versionState.remote='';
      if(!data.isUpToDate){const match=String(data.remoteUrl||'').match(/^(?:https?:\/\/github\.com\/|git@github\.com:)([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/);
        if(match&&data.currentBranchName){const raw='https://raw.githubusercontent.com/'+match[1]+'/'+match[2]+'/'+String(data.currentBranchName).split('/').map(encodeURIComponent).join('/')+'/manifest.json?cw='+Date.now();
          try{const r=await win.fetch(raw,{cache:'no-store'});if(r.ok){const m=await r.json();if(typeof m.version==='string')versionState.remote=m.version.slice(0,64);}}catch{}}
      }
      cacheVersion();
    }catch{versionState.kind='latest';if(versionIdentity)cacheVersion();}finally{paintVersion();}})().finally(()=>versionPending=null);return versionPending;
  }
  async function updateVersion(){
    if(!versionIdentity||versionState.kind!=='available')return;versionState.kind='updating';paintVersion();
    try{const response=await versionPost('update');if(!response.ok)throw Error('HTTP '+response.status);const result=await response.json();if(typeof result.version==='string')versionState.remote=result.version;versionState.kind='done';cacheVersion();}
    catch(error){versionState.kind='available';win.toastr?.error?.(t('更新失败：','Update failed: ')+error.message,t('Claude Web','Claude Web'));}
    paintVersion();
  }

  /* ---------------- 扩展 ---------------- */
  function extensions(panel){
    extensionPanel.mount(panel);
    return;
  }
    function updateExtensionVersions(){paintVersion();void checkVersion();}
  return {
    checkUpdates:checkVersion,
    editExtensions:()=>extensionPanel.edit(),
    leavePreset:()=>presetEdit.leave(),
    decorateWorldPicker:worldPage.decoratePicker,
    mount(panel){
      // Native PromptManager discards rows on every render. Do not retain all
      // discarded DOM and listeners after a large batch.
      for(const [root,st] of states)if(!root.isConnected&&root.matches?.('.cw-v4-prompt-row,.completion_prompt_manager_footer')){st.cleanup?.();st.cleanups?.forEach(f=>f());states.delete(root);}
      ({WorldInfo:world,Backgrounds:backgrounds,AdvancedFormatting:formatting,'left-nav-panel':presets,PersonaManagement:personas,'right-nav-panel':characters,rm_api_block:api,rm_extensions_block:extensions})[panel.id]?.(panel);
      // The extension catalog checks versions on entry, not on layout redraws.
      if(panel.id==='PersonaManagement'){personaRows(panel);personaName(state(panel));}
      if(panel.id==='left-nav-panel'){promptRows(panel);presetEdit.install(panel);presetList.mount(panel);promptScroll||=createPromptScroll({win,enabled:()=>doc.documentElement.hasAttribute('data-cw-v4')});promptScroll.sync(panel);}
      if(panel.id==='right-nav-panel'){characterRows(panel);groupEditor();groupMemberRows();}
      if(panel.id==='WorldInfo')worldPage.sync(panel);
      for(const st of states.values())if(panel.contains(st.root))refreshLeftovers(st);
      presetManagerPage.sync(panel);refinements.sync(panel,state(panel));(morePages||=createMorePages({win,make,button,icon,get,move,cleanup,created,state,act,menu,setting,t,L})).sync(panel);(v2dPages||=createV2dPages({win,make,button,icon,get,move,cleanup,created,state,act,menu,setting,section,row,t,L})).sync(panel);
      normalizeSettingsSections(panel,make);
      for(const f of paints)f();
    },
    closeCharacterExport(){if(!exportSession)return false;const anchor=exportSession.anchor;stopCharacterExport(true);anchor.focus({preventScroll:true});return true;},
    restore(){stopCharacterExport(true);exportStyle?.remove();exportStyle=null;presetManagerPage.destroy();refinements.destroy();extensionPanel.destroy();versionDisposed=true;doc.removeEventListener('click',cancelOwnVersionCheck,true);if(versionDelay)win.clearTimeout(versionDelay);finishVersionDelay?.();versionCard?.remove();for(const r of versionRows)r.querySelector(".cw-update-status")?.remove();versionRows.clear();const pmLate=presetList.destroy()||[];presetEdit.destroy();promptScroll?.destroy();promptScroll=null;extensionSettings.restore();paints.length=0;ctxCache.at=0;const all=[...states.values()].reverse();all.forEach(prepareRestore);restoreMoves(all);all.forEach(finishRestore);states.clear();if(pmLate.length)get('completion_prompt_manager')?.before(...pmLate);},
  };
}
