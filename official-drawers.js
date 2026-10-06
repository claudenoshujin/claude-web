/* Semantic live layouts, ported from design-v4 (redo.js / wi.js).
 * Only original DOM nodes are moved; lists/forms keep their IDs and native
 * handlers. Comment markers allow a full return to the native layout.
 * Labels are the design's own Chinese strings; L() looks up the design's
 * English table for other UI languages. */
import { createExtensionSettings } from './official-extension-settings.js?v=2.0.118';
export function actionLabel(node,t){
  const byId={world_backfill_memos:['补全标题','Fill titles'],world_apply_current_sorting:['应用排序','Apply sorting'],world_refresh:['刷新','Refresh'],OpenAllWIEntries:['展开全部','Expand all'],CloseAllWIEntries:['收起全部','Collapse all'],world_popup_name_button:['改名','Rename'],world_duplicate:['复制','Duplicate'],world_popup_delete:['删除','Delete'],bulkEditButton:['批量编辑','Bulk edit'],charListGridToggle:['切换网格视图','Toggle grid view'],rm_button_group_chats:['新建群聊','New group'],external_import_button:['从外部导入','Import externally'],character_import_button:['导入角色','Import character'],world_import_button:['导入','Import'],world_popup_export:['导出','Export'],bg_add_folder_button:['新建文件夹','New folder'],bg_selection_mode_button:['选择背景','Select backgrounds'],bg_group_add_to_folder_button:['移入文件夹','Move to folder'],open_s_preset_menu:['预设工具','Preset tools'],view_connection_profile:['查看配置','View profile'],reload_connection_profile:['重新载入','Reload profile'],personas_backup:['备份','Back up'],personas_restore:['恢复备份','Restore backup'],persona_grid_toggle:['切换网格视图','Toggle grid view']};
  if(byId[node.id])return t(...byId[node.id]);
  for(const [key,cn,en] of [['delete','删除','Delete'],['restore','恢复默认','Restore defaults'],['rename','改名','Rename'],['import','导入','Import'],['export','导出','Export'],['new','另存为新的','Save as new'],['create','新建','Create'],['edit','编辑','Edit'],['update','保存','Save']])if(node.id?.includes(key)||[...node.attributes].some(a=>a.name===`data-preset-manager-${key}`))return t(cn,en);
  return (node.getAttribute('aria-label')||node.title||node.textContent||'').trim().split(/[\n.。]/)[0].slice(0,32);
}
export function createDrawerLayouts({win,t,L,make,button,icon,openEditor,closeSettings,openSelMenu}) {
  const doc=win.document, states=new Map();
  const extensionSettings=createExtensionSettings({win,t,L,make,button,icon,openEditor});
  const get=id=>doc.getElementById(id);
  function state(root){let s=states.get(root);if(!s){s={moves:[],created:[],root};states.set(root,s);}return s;}
  function move(s,node,host,before){if(!node||node===host||node.contains(host))return;const companion=node.matches?.('select.select2-hidden-accessible')&&node.nextElementSibling?.matches('.select2-container')?node.nextElementSibling:null;if(node.parentNode){const mark=doc.createComment('cw-drawer-return');node.before(mark);s.moves.push([node,mark]);}if(before)host.insertBefore(node,before);else host.append(node);if(companion)move(s,companion,host);}
  const created=(s,n)=>{s.created.push(n);return n;};
  const cleanup=(s,f)=>{(s.cleanups||=[]).push(f);};
  function section(page,title){const n=make('section','cw-v4-section');if(title)n.append(make('h2','',L(title)));page.append(n);return n;}
  // srow(): title + description on the left, controls on the right.
  function rowEl(label,desc,cls=''){
    const r=make('div','cw-v4-row'+(cls?' '+cls:'')),info=make('div','cw-v4-row-info'),controls=make('div','cw-v4-row-controls');
    if(label)info.append(make('div','cw-v4-row-title',L(label)));
    if(typeof desc==='string'&&desc)info.append(make('p','',L(desc)));
    if(label||desc)r.append(info);r.append(controls);return {r,info,controls};
  }
  function row(s,host,label,desc,nodes,cls){
    const {r,info,controls}=rowEl(label,desc,cls);host.append(r);
    if(desc instanceof win.Node){const d=make('div','cw-v4-row-desc');info.append(d);if(desc.parentNode)move(s,desc,d);else d.append(desc);}
    for(const n of [].concat(nodes||[]))if(n)move(s,n,controls);
    if([].concat(nodes||[]).some(n=>n?.closest?.('[data-cc-null]')))r.setAttribute('data-cc-null','');
    return r;
  }
  // moreMenu(): short hand-written labels; the native buttons stay inside,
  // hidden, so their IDs and delegated handlers keep working.
  function menu(s,items){
    const m=make('details','cw-v4-more cw-v4-created'),h=make('summary','','⋯'),list=make('div','cw-v4-more-list'),park=make('div','cw-v4-more-park');
    h.setAttribute('aria-label',L('更多'));m.append(h,list,park);
    for(const it of items){if(!it)continue;const [label,el,danger,run]=it;if(!el&&!run)continue;
      const b=button(L(label),e=>{e.stopPropagation();m.open=false;run?run():el.click();},'cw-v4-more-item'+(danger?' cw-v4-danger':''));list.append(b);
      if(el)move(s,el,park);}
    return m;
  }
  // asBtn(): a native control drawn as a text button.
  function act(s,n,label,plus,primary){if(!n)return n;n.classList.add('cw-v4-as-btn');if(primary)n.classList.add('cw-v4-primary');const text=make('span','cw-v4-action-label'+(plus?' cw-v4-plus':''),L(label));n.append(text);s.created.push(text);(s.buttons||=[]).push(n);return n;}
  function begin(root){const s=state(root);if(s.page)return null;const page=make('div','cw-v4-drawer-page');s.page=page;root.append(page);s.created.push(page);root.classList.add('cw-v4-reflow');return {s,page};}
  function finish(s){const root=s.root,page=s.page,more=make('div','cw-v4-leftovers'),rest=make('div','cw-v4-native-rest');for(const n of [...root.childNodes])if(n!==page)rest.append(n);// 2.0.281（稿 design-desk-align-v2）：原来只有一个孤零零的 ⋯，改成一行「其他设置 · 说明 · 打开」，点整行打开。
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
    const {r,info,controls}=rowEl(label,'','cw-v4-tprev-row');host.append(r);
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

  /* ---------------- 世界书 ---------------- */
  function worldChips(s){const box=s.chips;if(!box)return;const names=[...(get('world_info')?.selectedOptions||[])].map(o=>o.textContent.trim());const key=names.join('\n')||'-';if(box.dataset.key===key)return;box.dataset.key=key;box.replaceChildren(...(names.length?names.map(n=>make('span','cw-v4-chip',n)):[make('span','cw-v4-muted',L('无'))]));}
  function worldSummary(s){const n=s.summary;if(!n)return;const d=get('world_info_depth')?.value,b=get('world_info_budget')?.value,r=get('world_info_recursive')?.checked;const text=t(`扫描深度 ${d} · 上下文 ${b}% · 递归${r?'开':'关'}`,`Scan depth ${d} · Context ${b}% · Recursion ${r?'on':'off'}`);if(n.textContent!==text)n.textContent=text;}
  function world(panel){const started=begin(panel);if(!started)return;const {s,page}=started;
    const global=section(page,'全局');
    const chips=make('div','cw-v4-chips cw-v4-created');s.chips=chips;
    const picker=get('WIMultiSelector');
    const enabled=row(s,global,'已启用的世界书','对所有聊天生效',[chips,button(L('选择'),()=>openEditor(picker,L('已启用的世界书')))]);
    const parkSel=make('div','cw-v4-park');enabled.append(parkSel);move(s,picker,parkSel);worldChips(s);
    // Activation settings: a one-line summary + a dialog of setting rows.
    if(get('wiActivationSettings')){
      const R2=(host,id,label,desc)=>rng(s,host,get(id),get(id+'_counter'),label,desc);
      const T2=(host,id,label,desc)=>tg(s,host,get(id),label,desc);
      const summary=make('span','cw-v4-summary');s.summary=summary;
      dialogRow(s,global,'激活设置',summary,'激活设置',box=>{
        const a=section(box,'扫描');R2(a,'world_info_depth','扫描深度','往回看多少条消息找关键字');R2(a,'world_info_max_recursion_steps','最大递归步数','0 = 不限');
        const b=section(box,'预算');R2(b,'world_info_budget','上下文占比 %','世界书最多占用多少上下文');R2(b,'world_info_budget_cap','预算上限（Token）','0 = 不设上限');T2(b,'world_info_overflow_alert','超出预算时提醒');
        const c=section(box,'最少激活');R2(c,'world_info_min_activations','最少激活条数','不够时继续往前扫描');R2(c,'world_info_min_activations_depth_max','最大扫描深度','0 = 不限');
        const d=section(box,'匹配');sel(s,d,get('world_info_character_strategy'),'插入策略','全局与角色世界书的先后');T2(d,'world_info_include_names','匹配时包含名字');T2(d,'world_info_recursive','递归扫描','已激活条目的内容也能触发其他条目');T2(d,'world_info_case_sensitive','区分大小写');T2(d,'world_info_match_whole_words','完整单词匹配');T2(d,'world_info_use_group_scoring','组评分');
      });
      worldSummary(s);
    }
    const edit=section(page,'编辑');
    row(s,edit,'世界书','选一本来编辑它的条目',[get('world_editor_select'),act(s,get('world_create_button'),'新建',true),menu(s,[['导入',get('world_import_button')],['导出',get('world_popup_export')],['改名',get('world_popup_name_button')],['复制一份',get('world_duplicate')],['删除这本世界书',get('world_popup_delete'),true]])]).classList.add('cw-v4-bookrow');
    const entries=section(page,'条目');entries.classList.add('cw-v4-entries');const b=bar();entries.append(b);
    b.append(searchBox(s,get('world_info_search'),'搜索条目'));move(s,get('world_info_sort_order'),b);move(s,act(s,get('world_popup_new'),'新建条目',true),b);
    b.append(menu(s,[['用关键字填充空标题',get('world_backfill_memos')],['把当前排序写入「顺序」',get('world_apply_current_sorting')],['刷新',get('world_refresh')]]));
    // Entries open in a dialog, so expand / collapse all are kept but not shown.
    const hidden=make('div','cw-v4-park');entries.append(hidden);for(const id of ['OpenAllWIEntries','CloseAllWIEntries'])move(s,get(id),hidden);
    move(s,get('world_info_pagination'),entries);move(s,get('world_popup_entries_list'),entries);
    phoneWorld(s,page,{global,edit,entries,bar:b,picker});
    finish(s);
  }
  /* 2.0.262 手机：世界书首页照 Profile（标题和内容分开、不放 ›），条目单独一页照 Chats（每条一张白卡片、右下角「+ 新建条目」）。
   * 电脑那三个小节手机上收起来；点「条目」时 openEditor 把电脑的「条目」小节整块搬进弹出页，关了搬回。
   * 排序从 14 种合成 5 项 + 「倒序」开关（Lulu：功能项太多）；「自定义」（要拖动）、UID、触发概率手机上不放；「刷新」不要；
   * 「填充空标题」「写入顺序」挪到首页「更多操作」。 */
  function phoneWorld(s,page,{global,edit,entries,bar:b,picker}){
    const book=get('world_editor_select'),hasBook=()=>!!book?.value&&book.selectedIndex>0;
    global.classList.add('cw-v4-desk-only');edit.classList.add('cw-v4-desk-only');entries.classList.add('cw-v4-desk-only','cw-v4-wi-entries');
    const pg=pfSec(page,'全局');
    pfField(pg,'已启用的世界书',()=>picker&&openEditor(picker,L('已启用的世界书')),()=>{const n=[...(get('world_info')?.selectedOptions||[])].map(o=>o.textContent.trim());return [n.join('、')||L('无'),!n.length];},'wi-global');
    const activation=global.querySelector('.cw-v4-row:has(.cw-v4-summary)>.cw-v4-row-controls>button');
    if(activation)pfText(page,'激活设置',()=>s.summary?.textContent,()=>activation.click(),'wi-activation');
    const pe=pfSec(page,'编辑');
    pfField(pe,'世界书',()=>book&&openSelMenu?.(book),()=>[hasBook()?book.selectedOptions[0].textContent.trim():L('选一本'),!hasBook()],'wi-book');
    const count=()=>{const nav=get('world_info_pagination')?.querySelector('.paginationjs-nav')?.textContent||'',m=nav.match(/\.\.\s*(\d+)/);const n=m?+m[1]:(get('world_popup_entries_list')?.querySelectorAll('.world_entry').length||0);return t(`${n} 条`,String(n));};
    // 「+ 新建条目」开着条目页时挂到弹出页上（弹出页有 transform，放在里面 fixed 会跟着内容走），关了放回来。
    let fab=null;
    const ent=pfField(pe,'编辑条目',()=>{if(!hasBook())return;openEditor(entries,t('条目','Entries'),'',{onClose:()=>{if(fab)entries.append(fab);}});const d=entries.closest('dialog');if(d&&fab)d.append(fab);},()=>[count(),false],'wi-entries');ent.classList.add('cw-v4-pf-go');
    const pa=pfSec(page,'');
    for(const [l,id] of [['新建世界书','world_create_button'],['导入','world_import_button']]){const x=pfBtn('cw-v4-pf-blue',()=>get(id)?.click());x.textContent=L(l);pa.append(x);}
    const pb=pfSec(page,'这本世界书','cw-v4-wi-book');
    for(const [l,id] of [['改名','world_popup_name_button'],['复制一份','world_duplicate'],['导出','world_popup_export']]){const x=pfBtn('cw-v4-pf-blue',()=>get(id)?.click());x.textContent=L(l);pb.append(x);}
    const more=sheetMenu('cw-v4-pf-moreops',make('span','',L('更多操作')),ui=>{ui.opt(L('用关键字填充空标题'),false,()=>get('world_backfill_memos')?.click());ui.opt(L('把当前排序写入「顺序」'),false,()=>get('world_apply_current_sorting')?.click());});
    more.querySelector('summary').setAttribute('aria-label',L('更多操作'));pb.append(more);
    const del=pfDelete(page,'删除这本世界书',()=>get('world_popup_delete')?.click(),'cw-v4-wi-book');
    paints.push(()=>{const on=hasBook();setFlag(ent,'cw-v4-hide',!on);setFlag(pb,'cw-v4-hide',!on);setFlag(del,'cw-v4-hide',!on);});
    // 条目页：搜索框右端调节图标（排序 5 项 + 倒序）；右下角「+ 新建条目」。
    const so=get('world_info_sort_order'),SORTS=[['优先级','0','0'],['顺序','7','8'],['标题','1','2'],['Token 数','3','4'],['深度','5','6']];
    const setSort=v=>{if(!so||so.value===v)return;so.value=v;so.dispatchEvent(new win.Event('change',{bubbles:true}));};
    b.append(sheetMenu('cw-v4-phone-filter',sliders(),ui=>{
      const v=so?.value,cur=SORTS.find(([,a,d])=>v===a||v===d),desc=!!cur&&cur[1]!==cur[2]&&v===cur[2];
      ui.head('排序');for(const [l,a,d] of SORTS)ui.opt(L(l),!!cur&&cur[1]===a,()=>setSort(desc&&a!==d?d:a));
      const rev=ui.keep(L('倒序'),()=>{if(cur&&cur[1]!==cur[2])setSort(desc?cur[1]:cur[2]);},desc);if(!cur||cur[1]===cur[2])rev.classList.add('cw-dis');
    }));
    fab=button('',()=>get('world_popup_new')?.click(),'cw-v4-wi-fab cw-v4-phone-only');fab.append(icon('plus'),make('span','',L('新建条目')));entries.append(fab);
  }
  /* World info entries (design wi.js entryRow / editEntry). The row shows
   * read-only text painted from the native fields; the native header inputs
   * stay in the header and move into the dialog only while it is open, so
   * ST's own handlers and re-renders are untouched. */
  const POS={'0':'角色定义之前','1':'角色定义之后','5':'示例消息之前','6':'示例消息之后','2':'作者注释之前','3':'作者注释之后','4':'按深度插入','7':'输出口'};
  const POS_EN={'角色定义之前':'Before character','角色定义之后':'After character','示例消息之前':'Before examples','示例消息之后':'After examples','作者注释之前':"Before Author's Note",'作者注释之后':"After Author's Note",'按深度插入':'At depth','输出口':'Outlet'};
  const STATE={constant:['常驻','Constant','blue'],normal:['关键字触发','Keyword','green'],vectorized:['向量匹配','Vectorized','link']};
  const posLabel=v=>t(POS[v]||'',POS_EN[POS[v]]||'');
  function paintEntry(entry){
    const row=entry._cwV4Row;if(!row)return;
    const q=n=>entry.querySelector(`[name="${n}"]`);
    const set=(n,v)=>{if(n.textContent!==v)n.textContent=v;};
    set(row.title,q('comment')?.value.trim()||L('（无标题）'));
    const st=STATE[q('entryStateSelector')?.value]||STATE.normal;
    const keyField=entry.querySelector('textarea[name="key"]');
    const keys=(keyField?keyField.value:(entry._cwV4Keys||'')).trim();
    set(row.state,t(st[0],st[1])+(keys&&st[2]!=='blue'?` · ${keys}`:''));
    if(row.dot.dataset.kind!==st[2])row.dot.dataset.kind=st[2];
    const pos=q('position')?.value;
    set(row.pos,posLabel(pos)+(pos==='4'?` · ${t('深度','Depth')} ${q('depth')?.value}`:''));
    set(row.ord,L(`顺序 ${q('order')?.value??''}`));
    const off=q('entryKillSwitch')?.classList.contains('fa-toggle-off');row.line.classList.toggle('cw-v4-off',!!off);
  }
  // Keywords live in ST's lazily built editor; until an entry is opened, read
  // them from ST's own cache of the book (read-only).
  let wiModule=null,wiLoading=false;
  function cachedKeys(panel){
    const need=[...panel.querySelectorAll('.world_entry')].filter(e=>e._cwV4Keys==null&&!e.querySelector('textarea[name="key"]'));
    if(!need.length)return;
    if(!wiModule){if(!wiLoading){wiLoading=true;import(new URL('/scripts/world-info.js',win.location.href).href).then(m=>{wiModule=m;need.forEach(paintEntry);cachedKeys(panel);need.forEach(paintEntry);}).catch(()=>{});}return;}
    const book=get('world_editor_select')?.selectedOptions?.[0]?.textContent.trim();
    const data=book&&wiModule.worldInfoCache?.get(book);if(!data?.entries)return;
    for(const e of need){const uid=e.getAttribute('uid')??e.dataset.uid;const k=data.entries[uid]?.key;e._cwV4Keys=Array.isArray(k)?k.join(', '):'';paintEntry(e);}
  }
  function worldEntries(panel){
    cachedKeys(panel);
    panel.querySelectorAll('.world_entry').forEach(entry=>{
      if(entry._cwV4Row){paintEntry(entry);return;}
      const header=entry.querySelector('.inline-drawer-header');if(!header)return;
      const s=state(entry),line=make('div','cw-v4-entry-line'),info=make('div','cw-v4-entry-info'),title=make('div','cw-v4-entry-title'),meta=make('div','cw-v4-entry-meta'),dot=make('span','cw-v4-dot'),stateText=make('span',''),pos=make('div','cw-v4-entry-pos'),ord=make('div','cw-v4-entry-ord');
      meta.append(dot,stateText);info.append(title,meta);
      header.append(line);s.created.push(line);header.classList.add('cw-v4-entry-head');
      const kill=entry.querySelector('[name="entryKillSwitch"]');move(s,kill,line);
      const q=sel_=>header.querySelector(sel_);
      const more=menu(s,[['复制这条',q('.duplicate_entry_button')],['移到其他世界书',q('.move_entry_button')],['删除',q('.delete_entry_button'),true]]);
      const edit=button(L('配置'),e=>{e.stopPropagation();editEntry(entry);},'cw-v4-button cw-v4-entry-edit');
      line.append(info,pos,ord,edit,more);
      // The header is ST's drawer toggle; the row itself must not expand the inline form.
      line.addEventListener('click',e=>{if(!e.target.closest('[name="entryKillSwitch"]'))e.stopPropagation();});
      line.addEventListener('dblclick',e=>{if(!e.target.closest('button,[name="entryKillSwitch"],summary'))editEntry(entry);});
      // 2.0.262 手机：点一下整行就进编辑（电脑照旧双击 / 点「配置」）。
      line.addEventListener('click',e=>{if(phoneWide()&&!e.target.closest('button,[name="entryKillSwitch"],summary,details'))editEntry(entry);});
      const repaint=()=>paintEntry(entry);entry.addEventListener('input',repaint);entry.addEventListener('change',repaint);kill?.addEventListener('click',()=>setTimeout(repaint,0));
      entry._cwV4Row={line,title,state:stateText,dot,pos,ord};entry.classList.add('cw-v4-world-row');
      s.cleanup=()=>{header.classList.remove('cw-v4-entry-head');entry.classList.remove('cw-v4-world-row');entry.removeEventListener('input',repaint);entry.removeEventListener('change',repaint);delete entry._cwV4Row;};
      paintEntry(entry);
    });
    // Page controls only when there is more than one page (the design shows none).
    const pager=get('world_info_pagination');if(pager){const single=!pager.querySelector('.paginationjs')||(!!pager.querySelector('.paginationjs-prev.disabled')&&!!pager.querySelector('.paginationjs-next.disabled'));pager.classList.toggle('cw-v4-single-page',single);}
  }
  function editEntry(entry){
    const drawer=entry.querySelector('.inline-drawer');
    // ST creates the editor lazily on this native event.
    if(!entry.querySelector('.world_entry_edit'))win.jQuery?.(drawer).trigger('inline-drawer-toggle');
    const form=entry.querySelector('.world_entry_edit');if(!form)return;
    const Q=n=>entry.querySelector(`[name="${n}"]`);
    const es={moves:[],created:[],root:form},box=make('div','cw-v4-dialog-box cw-v4-wi-edit');
    entry.append(box);
    // Head: title field · state · on/off (a switch mirroring the native kill switch).
    const head=make('div','cw-v4-wi-edit-head'),kill=Q('entryKillSwitch');
    const comment=Q('comment');if(comment){comment.classList.add('cw-v4-title-field');move(es,comment,head);}
    const stateSel=Q('entryStateSelector');const stateText=[];
    if(stateSel){[...stateSel.options].forEach(o=>{stateText.push([o,o.textContent]);const st=STATE[o.value];if(st){o.textContent=t(st[0],st[1]);o.dataset.cwDot=st[2];}});stateSel.classList.add('cw-v4-state-sel');move(es,stateSel,head);}
    // 2.0.242（Lulu：像原版那样有蓝灯绿灯）：状态下拉左边一颗灯，跟着当前状态变色；下拉列表里每项前面也有（openSelMenu 读 data-cw-dot）。
    const stDot=make('span','cw-v4-dot cw-v4-state-dot');const paintDot=()=>{const k=STATE[stateSel?.value]?.[2]||'green';if(stDot.dataset.kind!==k)stDot.dataset.kind=k;};
    if(stateSel){stateSel.before(stDot);es.created.push(stDot);paintDot();stateSel.addEventListener('input',paintDot);stateSel.addEventListener('change',paintDot);}
    const sw=make('input','');sw.type='checkbox';sw.checked=!kill?.classList.contains('fa-toggle-off');sw.addEventListener('change',()=>{kill?.click();});head.append(sw);
    const posSel=Q('position'),posText=[];
    if(posSel)[...posSel.options].forEach(o=>{posText.push([o,o.textContent]);const k=o.getAttribute('data-i18n')||'';const zh={'Before Char Defs':['角色定义之前','Before character'],'After Char Defs':['角色定义之后','After character'],'Before EM':['示例消息之前','Before examples'],'After EM':['示例消息之后','After examples'],'Before AN':['作者注释之前',"Before Author's Note"],'After AN':['作者注释之后',"After Author's Note"],'at Depth System':['按深度 · 系统','At depth · System'],'at Depth User':['按深度 · 用户','At depth · User'],'at Depth AI':['按深度 · AI','At depth · AI'],'Outlet':['输出口','Outlet']}[k];if(zh)o.textContent=t(...zh);});
    const num=n=>{const x=Q(n);if(x){x.classList.add('cw-v4-num');es.created.push({remove:()=>x.classList.remove('cw-v4-num')});}return x;};
    const inline=(...nodes)=>{const d=make('div','cw-v4-inline');es.created.push(d);for(const n of nodes)if(n)typeof n==='string'?d.append(make('span','cw-v4-unit',n)):move(es,n,d);return d;};
    const keyNodes=n=>[entry.querySelector(`select[name="${n}"]`),entry.querySelector(`textarea[name="${n}"]`)].filter(Boolean);
    const content=Q('content'),tokens=make('span','cw-v4-unit');
    const tk=()=>{tokens.textContent=L(`约 ${Math.round((content?.value.length||0)/1.6)} Token`);};tk();content?.addEventListener('input',tk);
    const charF=inline(Q('characterFilter'));const exLabel=make('label','cw-v4-mini');charF.append(exLabel);if(Q('character_exclusion'))move(es,Q('character_exclusion'),exLabel);exLabel.append(L('排除'));
    let x=section(box,'触发');
    row(es,x,'关键字','逗号分隔；常驻条目可以不填',keyNodes('key'),'cw-v4-stack');
    row(es,x,'逻辑','可选过滤器怎样配合关键字',[Q('entryLogicType')]);
    row(es,x,'可选过滤器','逗号分隔；为空则忽略',keyNodes('keysecondary'),'cw-v4-stack');
    x=section(box,'内容');row(es,x,'',tokens,[content],'cw-v4-stack cw-v4-content-row');
    x=section(box,'插入');row(es,x,'插入位置','',[posSel]);row(es,x,'深度','只在「按深度」时生效',[num('depth')]);row(es,x,'输出口名称','只在「输出口」时生效',[Q('outletName')]);row(es,x,'顺序','数字越大越靠后',[num('order')]);row(es,x,'触发概率','关掉则每次都触发',[inline(Q('useProbability'),num('probability'),'%')]);
    x=section(box,'匹配');row(es,x,'扫描深度','留空 = 用全局设置',[num('scanDepth')]);row(es,x,'区分大小写','',[Q('caseSensitive')]);row(es,x,'完整单词','',[Q('matchWholeWords')]);row(es,x,'组评分','',[Q('useGroupScoring')]);row(es,x,'自动化 ID','',[Q('automationId')]);
    x=section(box,'递归');row(es,x,'不能被递归激活','',[Q('excludeRecursion')]);row(es,x,'阻止进一步递归','',[Q('preventRecursion')]);row(es,x,'延迟到递归','可指定递归层级',[inline(Q('delay_until_recursion'),Q('delayUntilRecursionLevel'))]);row(es,x,'无视预算','',[Q('ignoreBudget')]);
    x=section(box,'分组');row(es,x,'包含组','同组只激活一条',[Q('group')]);row(es,x,'组内优先','',[Q('groupOverride')]);row(es,x,'组权重','',[num('groupWeight')]);
    x=section(box,'时效');row(es,x,'黏性','激活后保持几条消息',[num('sticky')]);row(es,x,'冷却','激活后隔几条消息才能再触发',[num('cooldown')]);row(es,x,'延迟','聊天满几条消息后才可触发',[num('delay')]);
    x=section(box,'过滤');row(es,x,'绑定到角色或标签','',[charF]);row(es,x,'生成类型','只在这些生成方式下触发',[Q('triggers')]);
    x=section(box,'额外匹配来源');for(const [n,l] of [['matchPersonaDescription','用户设定描述'],['matchCharacterDescription','角色描述'],['matchCharacterPersonality','角色性格'],['matchCharacterDepthPrompt','角色备注'],['matchScenario','场景'],['matchCreatorNotes','作者的注释']])row(es,x,l,'',[Q(n)]);
    // Checkboxes ST keeps hidden until a section is expanded become visible switches here.
    const shown=[];box.querySelectorAll('input[type=checkbox]').forEach(c=>{if(c.style.display==='none'||c.hidden||c.classList.contains('displayNone')){shown.push([c,c.style.display,c.hidden]);c.style.display='';c.hidden=false;c.classList.add('cw-v4-icon-toggle');}});
    const del=button(L('删除这条'),()=>{dialog?.close();entry.querySelector('.delete_entry_button')?.click();},'cw-v4-button cw-v4-danger');
    let dialog=null;
    openEditor(box,'',undefined,{head,foot:del,onClose:()=>{
      content?.removeEventListener('input',tk);
      for(const [c,d,h] of shown){c.style.display=d;c.hidden=h;c.classList.remove('cw-v4-icon-toggle');}
      for(const [o,v] of [...stateText,...posText])o.textContent=v;
      if(stateSel){stateSel.removeEventListener('input',paintDot);stateSel.removeEventListener('change',paintDot);for(const o of stateSel.options)delete o.dataset.cwDot;}
      comment?.classList.remove('cw-v4-title-field');stateSel?.classList.remove('cw-v4-state-sel');
      for(const [node,mark] of [...es.moves].reverse())if(mark.parentNode)mark.replaceWith(node);
      es.created.forEach(n=>n.remove());box.remove();paintEntry(entry);
    }});
    dialog=box.closest('dialog');dialog?.classList.add('cw-v4-wi-dialog');
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
  function formatting(panel){const started=begin(panel);if(!started)return;const {s,page}=started;const g=get,root=panel;
    page.append(created(s,make('p','cw-v4-note',L('使用「对话补全」接口时，这一页的大部分设置不生效，酒馆会把它们变灰。'))));
    const top=section(page,'');row(s,top,'全部格式化设置','一次导入或导出本页所有模板',[act(s,g('af_master_import'),'导入'),act(s,g('af_master_export'),'导出')]);
    const context=section(page,'上下文模板');
    presetRow(s,context,root,'模板','',g('context_presets'),'context');
    tg(s,context,g('context_derived'),'按模型元数据自动推导','能推导时自动选模板');
    textRow(s,context,g('context_story_string'),'故事字符串','拼接角色描述、场景、世界书等的模板');
    sel(s,context,g('context_story_string_position'),'故事字符串位置');
    textRow(s,context,g('context_example_separator'),'示例分隔符');
    textRow(s,context,g('context_chat_start'),'聊天开始标记');
    const cf=section(page,'上下文格式');
    for(const [id,label] of [['always-force-name2-checkbox','始终把角色名加进提示词'],['single_line','每次只生成一行'],['collapse-newlines-checkbox','折叠连续的换行'],['trim_spaces','修剪空格'],['trim_sentences_checkbox','修剪不完整的句子'],['context_use_stop_strings','分隔符作为终止字符串'],['context_names_as_stop_strings','名字作为终止字符串']])tg(s,cf,g(id),label);
    const instruct=section(page,'格式指引模板');
    tg(s,instruct,g('instruct_enabled'),'启用格式指引','文本补全接口才需要');
    presetRow(s,instruct,root,'模板','',g('instruct_presets'),'instruct');
    tg(s,instruct,g('instruct_derived'),'按模型元数据自动推导');tg(s,instruct,g('instruct_bind_to_context'),'和上下文模板绑定','选这个模板时自动切换同名的上下文模板');
    txt(s,instruct,g('instruct_activation_regex'),'激活正则','模型名匹配时自动选中这个模板');
    for(const [id,label] of [['instruct_wrap','用换行包裹序列'],['instruct_macro','替换序列里的宏'],['instruct_sequences_as_stop_strings','序列作为终止字符串'],['instruct_skip_examples','跳过示例对话格式化']])tg(s,instruct,g(id),label);
    sel(s,instruct,g('instruct_names_behavior'),'包含名字');
    dialogRow(s,instruct,'序列','故事字符串、用户、助手、系统消息的前后缀','格式指引序列',box=>{
      let x=section(box,'故事字符串');textRow(s,x,g('instruct_story_string_prefix'),'前缀');textRow(s,x,g('instruct_story_string_suffix'),'后缀');
      x=section(box,'用户消息');textRow(s,x,g('instruct_input_sequence'),'前缀');textRow(s,x,g('instruct_input_suffix'),'后缀');textRow(s,x,g('instruct_first_input_sequence'),'第一条的前缀');textRow(s,x,g('instruct_last_input_sequence'),'最后一条的前缀');
      x=section(box,'助手消息');textRow(s,x,g('instruct_output_sequence'),'前缀');textRow(s,x,g('instruct_output_suffix'),'后缀');textRow(s,x,g('instruct_first_output_sequence'),'第一条的前缀');textRow(s,x,g('instruct_last_output_sequence'),'最后一条的前缀');
      x=section(box,'系统消息');tg(s,x,g('instruct_system_same_as_user'),'和用户消息相同');textRow(s,x,g('instruct_system_sequence'),'前缀');textRow(s,x,g('instruct_system_suffix'),'后缀');textRow(s,x,g('instruct_last_system_sequence'),'系统指令前缀');
      x=section(box,'其他');textRow(s,x,g('instruct_stop_sequence'),'终止序列');textRow(s,x,g('instruct_user_alignment_message'),'用户填充消息');
    });
    const system=section(page,'系统提示词');
    tg(s,system,g('sysprompt_enabled'),'启用系统提示词');
    presetRow(s,system,root,'提示词','',g('sysprompt_select'),'sysprompt');
    textRow(s,system,g('sysprompt_content'),'提示词内容');textRow(s,system,g('sysprompt_post_history'),'历史后置指令');
    const stop=section(page,'终止字符串');textRow(s,stop,g('custom_stopping_strings'),'自定义终止字符串','JSON 字符串数组，例如 ["\\nUser:"]');tg(s,stop,g('custom_stopping_strings_macro'),'替换其中的宏');
    const tok=section(page,'分词器');sel(s,tok,g('tokenizer'),'分词器');num(s,tok,g('token_padding'),'Token 填充','预留给不准确计数的余量');
    const reasoning=section(page,'推理');
    tg(s,reasoning,g('reasoning_auto_parse'),'自动解析','把模型输出里的思考部分单独拆出来');tg(s,reasoning,g('reasoning_auto_expand'),'自动展开');tg(s,reasoning,g('reasoning_show_hidden'),'显示隐藏的推理');
    if(g('reasoning_add_to_prompts')){const inline=make('div','cw-v4-inline cw-v4-created');row(s,reasoning,'加入提示词','把之前的思考内容带进后续提示词，最多几条',[inline]);move(s,showToggle(s,g('reasoning_add_to_prompts')),inline);const n=g('reasoning_max_additions');if(n){n.classList.add('cw-v4-num');cleanup(s,()=>n.classList.remove('cw-v4-num'));move(s,n,inline);}inline.append(make('span','cw-v4-unit',L('条')));}
    presetRow(s,reasoning,root,'推理格式','',g('reasoning_select'),'reasoning');
    dialogRow(s,reasoning,'格式内容','前缀、后缀、分隔符','推理格式',box=>{const x=section(box,'');textRow(s,x,g('reasoning_prefix'),'前缀');textRow(s,x,g('reasoning_suffix'),'后缀');textRow(s,x,g('reasoning_separator'),'分隔符');});
    const misc=section(page,'杂项');
    tg(s,misc,g('bind_model_templates'),'把模型和模板绑定');txt(s,misc,g('markdown_escape_strings'),'非 Markdown 字符串','逗号分隔，不加空格');
    textRow(s,misc,g('start_reply_with'),'回复开头','每次回复都从这段文字开始');tg(s,misc,g('chat-show-reply-prefix-checkbox'),'在聊天里显示回复开头');
    const hide=make('div','cw-v4-park');page.append(created(s,hide));move(s,g('advanced-formatting-cc-notice'),hide);
    finish(s);
  }

  /* ---------------- 预设 ---------------- */
  function presets(panel){const started=begin(panel);if(!started)return;const {s,page}=started;
    move(s,get('respective-presets-block'),page);
    move(s,get('common-gen-settings-block'),page);
    move(s,get('respective-ranges-and-temps'),page);
    move(s,get('advanced-ai-config-block'),page);
    const presetRoot=get('openai_api-presets');
    if(presetRoot){const ps=begin(presetRoot);if(ps){const group=section(ps.page,'对话补全预设');
      const select=get('settings_preset_openai');if(select){select.classList.add('cw-v4-preset-sel');cleanup(ps.s,()=>select.classList.remove('cw-v4-preset-sel'));}
      row(ps.s,group,'预设','',[select,act(ps.s,get('update_oai_preset'),'保存'),menu(ps.s,[['另存为新的',get('new_oai_preset')],['改名',presetRoot.querySelector('[data-preset-manager-rename="openai"]')],['导入',get('import_oai_preset')],['导出',get('export_oai_preset')],['预设增强菜单',get('open_s_preset_menu')],['删除',get('delete_oai_preset'),true]])]).querySelector('.cw-v4-more')?.classList.add('cw-v4-preset-menu');
      tg(ps.s,group,get('bind_preset_to_connection'),'绑定到 API 连接','切换连接配置时自动切换预设');
      finish(ps.s);
    }}
    const ranges=get('range_block_openai');
    if(ranges){
      const rs=begin(ranges);if(rs){const target=rs.page,st=rs.s;
        const length=section(target,'长度');
        setting(st,length,'oai_max_context_unlocked','解锁上下文上限','移除上下文滑块的最大值限制');
        setting(st,length,'openai_max_context','上下文长度','Token','openai_max_context_counter');
        setting(st,length,'openai_max_tokens','最大回复长度','Token',null,'num');
        setting(st,length,'n_openai','每次生成几个备选回复','',null,'num');
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
      const prompts=section(target,'提示词');prompts.classList.add('cw-v4-prompts','cw-v4-entries');move(st,manager,prompts);
      const quick=ranges?.querySelector('.cw-v4-quick');if(quick)move(st,quick,target);
      const adv=section(target,'高级');
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
      finish(st);
    }}
    finish(s);
  }
  // Prompt manager rows are re-rendered by ST; restyle each native row in place.
  function promptRows(panel){
    const footer=panel.querySelector('.completion_prompt_manager_footer');
    if(footer&&!footer.querySelector('.cw-v4-more')){const s=state(footer);
      act(s,footer.querySelector('.fa-plus-square,.fa-square-plus'),'新建提示词',true);act(s,footer.querySelector('.fa-chain,.fa-link'),'插入');
      const del=footer.querySelector('.fa-x');
      const more=menu(s,[['导入提示词列表',get('prompt-manager-import')],['导出提示词列表',get('prompt-manager-export')],['重置当前角色的列表',get('prompt-manager-reset-character')],['删除选中的提示词',del?.closest('.menu_button')||del,true]]);
      footer.append(more);s.created.push(more);footer.classList.add('cw-v4-pm-footer');s.cleanup=()=>footer.classList.remove('cw-v4-pm-footer','cw-v4-pm-no-insert');
    }
    // SPreset (third-party) injects a banner into the prompts area later; offer it from the preset menu instead.
    const spreset=panel.querySelector('.spreset-btn'),pmenu=panel.querySelector('.cw-v4-preset-menu>.cw-v4-more-list');
    if(spreset&&pmenu&&!pmenu.querySelector('.cw-v4-spreset')){const b=button(spreset.textContent.replace(/[→\s]+$/,'').trim()||'SPreset Editor',e=>{e.stopPropagation();pmenu.parentElement.open=false;spreset.click();},'cw-v4-more-item cw-v4-spreset');pmenu.insertBefore(b,pmenu.lastElementChild);}
    // Insert only lists prompts that are not in the list yet; hide it when empty.
    if(footer){const pick=footer.querySelector('select');footer.classList.toggle('cw-v4-pm-no-insert',!pick?.options.length);}
    panel.querySelectorAll('#completion_prompt_manager_list .completion_prompt_manager_prompt').forEach(item=>{
      if(item.classList.contains('cw-v4-prompt-row'))return;item.classList.add('cw-v4-prompt-row');const s=state(item);s.cleanup=()=>item.classList.remove('cw-v4-prompt-row');
      const toggle=item.querySelector('.prompt-manager-toggle-action'),edit=item.querySelector('.prompt-manager-edit-action'),name=item.querySelector('.completion_prompt_manager_prompt_name');
      // Grid cells: switch · name · tokens · Edit · ⋯ (the native icons live in a nested span).
      if(toggle){move(s,toggle,item,item.firstChild);toggle.setAttribute('role','switch');toggle.setAttribute('aria-label',t('切换提示词启用状态','Toggle prompt'));}
      // Tokens are shown only once counted (the design leaves the column out otherwise).
      const tok=item.querySelector('.prompt_manager_prompt_tokens');if(tok&&!/\d/.test(tok.textContent))item.classList.add('cw-v4-pm-no-tokens');
      const marker=item.querySelector('.fa-thumb-tack,.fa-thumbtack');
      if(name){const meta=make('span','cw-v4-pm-meta',L(marker?'占位（由酒馆按位置填入内容）':'自定义提示词'));name.append(meta);s.created.push(meta);}
      if(edit){move(s,edit,item);const label=make('span','cw-v4-action-label',L('编辑'));edit.append(label);s.created.push(label);edit.setAttribute('role','button');}
      const inspect=item.querySelector('.prompt-manager-inspect-action');
      const more=menu(s,[inspect?['查看实际内容',null,false,()=>inspect.click()]:null,['从列表移除',item.querySelector('.prompt-manager-detach-action'),true]]);
      item.append(more);s.created.push(more);
    });
  }

  /* ---------------- 用户角色 ---------------- */
  function personaName(s){if(!s.who)return;const text=get('your_name')?.textContent.trim()||'';if(s.who.textContent!==text)s.who.textContent=text;}
  function personas(panel){const started=begin(panel);if(!started)return;const {s,page}=started;
    const stats=panel.querySelector('.fa-ranking-star')?.closest('.menu_button');
    const top=section(page,'');row(s,top,'','你在聊天里扮演的身份',[act(s,get('create_dummy_persona'),'新建',true),menu(s,[['使用统计',stats],['备份到文件',get('personas_backup')],['从文件恢复',get('personas_restore')],['网格视图',get('persona_grid_toggle')]])]);
    const all=section(page,'全部');all.classList.add('cw-v4-entries');const b=bar();all.append(b);
    b.append(searchBox(s,get('persona_search_bar'),'搜索用户角色'));move(s,get('persona_sort_order'),b);
    b.append(sortButton(get('persona_sort_order')));
    move(s,get('persona_pagination_container'),all);move(s,get('user_avatar_block'),all);
    const current=section(page,'当前用户角色');
    const who=make('span','cw-v4-persona-name');s.who=who;
    const nameRow=row(s,current,'名字',who,[act(s,get('persona_rename_button'),'改名'),menu(s,[['把所有消息的名字改成这个',get('sync_name_button')],['用户角色世界书',get('persona_lore_button')],['更换头像',get('persona_set_image_button')],['复制一份',get('persona_duplicate_button')],['删除',get('persona_delete_button'),true]])]);
    const park=make('div','cw-v4-park');nameRow.append(park);move(s,get('your_name'),park);personaName(s);
    textRow(s,current,get('persona_description'),'描述','会作为 {{persona}} 放进提示词');
    sel(s,current,get('persona_description_position'),'插入位置');
    // Three independent lock buttons: each a switch row that clicks the native button.
    for(const [id,label,desc] of [['lock_persona_default','新聊天默认用这个','开新聊天时自动选中这个用户角色'],['lock_persona_to_char','绑定到当前角色','和这个角色聊天时自动切换过来'],['lock_user_name','绑定到当前聊天','只在这段聊天里固定使用']])row(s,current,label,desc,[get(id)]).classList.add('cw-v4-lock-row');
    const global=section(page,'全局设置');
    for(const [id,label] of [['persona_show_notifications','切换时显示通知'],['persona_allow_multi_connections','允许一个角色绑定多个用户角色'],['persona_auto_lock','自动把选中的用户角色绑定到聊天']])tg(s,global,get(id),label);
    finish(s);
  }
  function personaRows(panel){panel.querySelectorAll('#user_avatar_block .avatar-container').forEach(item=>{
    if(item.querySelector('.cw-v4-persona-use'))return;const s=state(item),use=button('',e=>{e.stopPropagation();if(!item.classList.contains('selected'))item.click();},'cw-v4-button cw-v4-persona-use');
    use.append(make('span','cw-v4-persona-current',L('使用中')),make('span','cw-v4-persona-switch',L('切换')));item.append(use);s.created.push(use);
    const badge=make('span','cw-v4-badge',L('当前'));const name=item.querySelector('.ch_name');if(name){name.append(badge);s.created.push(badge);}
    const desc=item.querySelector('.ch_description');if(desc&&/^\[?no description\]?$/i.test(desc.textContent.trim())){desc.classList.add('cw-v4-no-desc');desc.dataset.cwEmpty=L('还没有描述');s.cleanup=()=>desc.classList.remove('cw-v4-no-desc');}
  });}

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
  // 下拉的每个选项一行，当前项打勾；点了改下拉的值并派发 change（酒馆自己的处理照跑）。
  function selectOpts(ui,select){if(!select)return;for(const o of [...select.options]){if(o.hidden||o.style.display==='none')continue;ui.opt((o.textContent||'').trim(),o.selected,()=>{if(select.value===o.value)return;select.value=o.value;select.dispatchEvent(new win.Event('input',{bubbles:true}));select.dispatchEvent(new win.Event('change',{bubbles:true}));});}}
  // 酒馆的三态筛选标签（选中 / 排除 / 不限）：开关只在「选中」和「不限」之间切，点原来的标签直到到达目标状态。
  const tagState=el=>el?.getAttribute('data-toggle-state')||'UNDEFINED';
  function setTag(el,on){if(!el)return;for(let i=0;i<3&&(tagState(el)==='SELECTED')!==on;i++)el.click();if(!on)for(let i=0;i<3&&tagState(el)!=='UNDEFINED';i++)el.click();}
  function filterSheet(ui,controls){
    if(!controls)return;
    const sw=[['filterByFavorites','只看收藏'],['filterByGroups','只看群聊'],['filterByFolder','只看文件夹']].map(([c,l])=>[controls.querySelector('.'+c),l]).filter(([el])=>el);
    if(sw.length){ui.head('筛选');for(const [el,l] of sw)ui.keep(L(l),()=>setTag(el,tagState(el)!=='SELECTED'),tagState(el)==='SELECTED');}
    const userTags=[...controls.querySelectorAll('.tag:not(.actionable)')].filter(el=>el.querySelector('.tag_name')?.textContent.trim());
    if(userTags.length){ui.head('按标签');ui.chips(userTags.map(el=>[el.querySelector('.tag_name').textContent.trim(),tagState(el)==='SELECTED',()=>setTag(el,tagState(el)!=='SELECTED')]));}
  }
  // 2.0.299：filterByFolder 是酒馆的「Show only folders」（只看文件夹），开着时角色只剩文件夹、其余算「已被隐藏」。
  // 以前误标成「标签当文件夹显示」还当成默认开着、不算筛选——Lulu 手机上角色全被藏了。现在名字改对，也算进筛选（调节图标会亮）。
  const filtered=controls=>!!controls?.querySelector(':is(.filterByFavorites,.filterByGroups,.filterByFolder,.tag:not(.actionable)):is([data-toggle-state="SELECTED"],[data-toggle-state="EXCLUDED"])');
  // 排序：一行「排序方式 · 当前值 ⌃⌄」，点了关掉这个弹出、开那个下拉自己的底部列表（openSelMenu，和别的下拉一样）。
  function sortPick(ui,select,menuEl){if(!select)return;const b=ui.opt(L('排序方式'),false,()=>{});b.classList.add('cw-v4-sheet-pick');const v=make('span','cw-v4-sheet-value',(select.selectedOptions[0]?.textContent||'').trim());b.append(v);
    b.addEventListener('click',e=>{e.stopPropagation();menuEl.open=false;win.setTimeout(()=>openSelMenu?.(select),30);},true);}
  // 只有排序的列表页（用户角色）：调节图标直接开排序的底部列表。
  function sortButton(select){const b=button('',e=>{e.stopPropagation();if(select)openSelMenu?.(select);},'cw-v4-phone-filter cw-v4-phone-only');b.append(sliders());b.setAttribute('aria-label',L('排序'));return b;}

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
  function phoneCharTop(s,host,form){
    const h2=doc.querySelector('#rm_button_selected_ch h2'),fav=get('favorite_button'),tags=get('tags_div'),world=get('world_button');
    const sec=pfSec(host,'','cw-v4-pf-first');
    pfField(sec,'名字',()=>pickOption('renameCharButton'),()=>[(h2?.textContent||'').trim(),false],'name').classList.add('cw-v4-pf-existing');
    pfField(sec,'标签',()=>openTags(tags),()=>{const n=tagNames(tags);return [n.join('、')||L('无'),!n.length];},'tags');
    pfField(sec,'角色世界书',()=>world?.click(),()=>{const w=charData()?.extensions?.world;return [w||L('未绑定'),!w];},'world');
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
    for(const [label,fn] of [['复制',()=>get('dupe_button')?.click()],['导出',()=>get('export_button')?.click()]]){const b=pfBtn('cw-v4-pf-blue',fn);b.textContent=L(label);acts.append(b);}
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

  /* ---------------- 角色卡 ---------------- */
  function characters(panel){const list=get('rm_characters_block');if(!list)return;const started=begin(list);if(!started)return;const {s,page}=started;
    // In the edit view the native list button is the way back to the list.
    const back=get('rm_button_characters');if(back&&!back.querySelector('.cw-v4-action-label')){const label=make('span','cw-v4-action-label',t('全部角色','All characters'));back.append(label);s.created.push(label);back.classList.add('cw-v4-back');s.cleanup=()=>back.classList.remove('cw-v4-back');}
    const sec=section(page,'');sec.classList.add('cw-v4-desk-only');row(s,sec,'','点角色进入编辑；新建群聊、导入角色在右边 ⋯ 里',[act(s,get('rm_button_create'),'新建角色',true),menu(s,[['新建群聊',get('rm_button_group_chats')],['从文件导入',get('character_import_button')],['从网址导入',get('external_import_button')],['批量编辑',get('bulkEditButton')]])]);
    // 2.0.263：网格视图不要了（Claude 的列表没有网格；开着也照列表排）。按钮收起来，免得掉进「其他设置」。
    {const gp=make('div','cw-v4-park');sec.append(gp);move(s,get('charListGridToggle'),gp);}
    const all=section(page,'全部角色');all.classList.add('cw-v4-entries','cw-v4-chatlist');const b=bar();all.append(b);
    b.append(searchBox(s,get('character_search_bar'),'搜索角色'));move(s,get('character_sort_order'),b);
    const tags=list.querySelector('#charListFixedTop .rm_tag_controls');
    if(tags){tags.classList.add('cw-v4-tags');move(s,tags,all);cleanup(s,()=>tags.classList.remove('cw-v4-tags'));}
    // 2.0.263：批量编辑时酒馆的「已选 N / 全选 / 删除」原来落在「其他设置」里看不见；改成列表上方一条操作栏（电脑手机都用），点的还是原来的按钮。
    const bulk=make('div','cw-v4-bulkbar'),bcount=make('span','cw-v4-bulk-count');bulk.append(bcount,
      button(L('全选'),()=>get('bulkSelectAllButton')?.click(),'cw-v4-bulk-btn'),button(L('删除'),()=>get('bulkDeleteButton')?.click(),'cw-v4-bulk-btn cw-v4-bulk-del'),button(L('完成'),()=>get('bulkEditButton')?.click(),'cw-v4-bulk-btn cw-v4-bulk-done'));
    b.after(bulk);paints.push(()=>{const n=parseInt(get('bulkSelectedCount')?.textContent||'0',10)||0;setText(bcount,n?t(`已选 ${n} 个`,`${n} selected`):t('点角色选中','Tap to select'));});
    // 2.0.261 手机（照 Chats）：搜索框右端调节图标 → 排序 / 筛选 / 工具；右下角悬浮「+ 新建」。
    const click=id=>()=>get(id)?.click();
    const flt=sheetMenu('cw-v4-phone-filter',sliders(),ui=>{
      sortPick(ui,get('character_sort_order'),flt);
      filterSheet(ui,tags);
      ui.head('工具');ui.opt(L('管理标签'),false,()=>tags?.querySelector('.manageTags')?.click());ui.opt(L('批量编辑'),false,click('bulkEditButton'));
      if(filtered(tags))ui.opt(L('清除筛选'),false,()=>tags?.querySelector('.clearAllFilters')?.click()).classList.add('cw-v4-sheet-clear');
    });
    b.append(flt);paints.push(()=>setFlag(flt,'cw-v4-dot',filtered(tags)));
    const fab=sheetMenu('cw-v4-phone-fab',make('span','',L('新建')),ui=>{
      ui.opt(L('新建角色'),false,click('rm_button_create'));ui.opt(L('新建群聊'),false,click('rm_button_group_chats'));
      ui.opt(L('从文件导入'),false,click('character_import_button'));ui.opt(L('从网址导入'),false,click('external_import_button'));
    });
    fab.querySelector('summary').prepend(icon('plus'));fab.querySelector('summary').setAttribute('aria-label',L('新建'));page.append(fab);
    move(s,get('rm_print_characters_pagination'),all);move(s,get('rm_print_characters_block'),all);finish(s);
    // Keep the real form and its conditional wrappers, including create-only
    // name/submit controls. Editing an existing name still uses ST's Rename.
    const form=get('form_create'),adapted=form&&begin(form);if(adapted){
      const fs=adapted.s,body=adapted.page;
      // 2.0.255（design-content-v1）：头像 + 名字 + Token 合成页头；原来空着的「名字」行和单独的「头像」行去掉。
      charHero(fs,body);
      phoneCharTop(fs,body,form);
      const general=section(body,'');general.classList.add('cw-v4-desk-only','cw-v4-after-hero');
      row(fs,general,'标签','',[get('tags_div')]);
      const content=section(body,'内容');content.classList.add('cw-v4-desk-only');
      textRow(fs,content,get('description_textarea'),'描述','外貌、性格、背景……');
      textRow(fs,content,get('firstmessage_textarea'),'开场白','聊天开始时角色说的第一句');
      const more=section(body,'更多');more.classList.add('cw-v4-desk-more');row(fs,more,'高级定义','性格摘要、场景、示例对话、作者注释等',[act(fs,get('advanced_div'),'打开')]);
      const alt=form.querySelector('.open_alternate_greetings');if(alt)row(fs,more,'备选开场白','',[act(fs,alt,'管理')]);
      const notes=get('spoiler_free_desc');if(notes){const r=row(fs,more,t('创作者注释','Creator notes'),'',[]),park=make('div','cw-v4-park');r.append(park);move(fs,notes,park);r.querySelector('.cw-v4-row-controls').append(button(L('配置'),()=>openEditor(notes,t('创作者注释','Creator notes'))));}
      const deskManage=row(fs,more,t('角色管理','Character management'),'',[get('char-management-dropdown'),get('create_button_label'),menu(fs,[['角色世界书',get('world_button')],['已绑定的用户角色',get('char_connections_button')],['导出',get('export_button')],['复制',get('dupe_button')],['删除这个角色',get('delete_button'),true]])]);
      deskManage.classList.add('cw-v4-desk-manage');
      phoneManage(fs,body);advancedPhone(fs);
      finish(fs);
    }
  }
  function characterRows(panel){panel.querySelectorAll('#rm_print_characters_block .character_select').forEach(item=>{
    if(item.querySelector('.cw-v4-character-actions'))return;
    const s=state(item),actions=make('div','cw-v4-character-actions');s.created.push(actions);
    const select=async(edit,action)=>{
      const id=Number(item.dataset.chid),st=await import(new URL('/script.js',win.location.href).href);
      await st.selectCharacterById(id,{switchMenu:edit});
      if(String(win.SillyTavern?.getContext?.().characterId)!==String(id))return;
      if(action)get(action)?.click();else if(!edit)closeSettings?.();
    };
    const run=action=>()=>select(true,action).catch(console.error);
    // 2.0.215（Lulu）：点角色 = 进入编辑（和设置里其他「›」行一样进下一页）；直接去聊天放进 ⋯ 的第一项。原来点整行是开始聊天、「编辑」另有一个按钮。
    const chev=make('span','cw-v4-character-chev');chev.setAttribute('aria-hidden','true');
    actions.append(menu(s,[['开始聊天',null,false,()=>select(false).catch(console.error)],['收藏',null,false,run('favorite_button')],['复制',null,false,run('dupe_button')],['删除',null,true,run('delete_button')]]),chev);
    item.append(actions);
    const click=e=>{if(e.target.closest('.cw-v4-character-actions')){e.stopPropagation();return;}if(item.closest('.group_overlay_mode_select')||e.shiftKey||e.ctrlKey||e.metaKey)return;e.stopPropagation();select(true).catch(console.error);};
    item.addEventListener('click',click);s.cleanup=()=>item.removeEventListener('click',click);
  });}

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
    if(profiles&&s.profile&&!s.profile.contains(profiles)){
      profiles.classList.add('cw-v4-preset-sel');cleanup(s,()=>profiles.classList.remove('cw-v4-preset-sel'));
      row(s,s.profile,'配置','保存一整套接口、模型和预设',[profiles,act(s,get('update_connection_profile'),'保存'),menu(s,[['新建配置',get('create_connection_profile')],['查看详情',get('view_connection_profile')],['编辑',get('edit_connection_profile')],['重新载入',get('reload_connection_profile')],['删除',get('delete_connection_profile'),true]])]);
    }
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

  /* ---------------- 扩展 ---------------- */
  function extensions(panel){
    // 已经有就不再 add：add 一个已有的 class 也会重写属性，触发设置页的 sync 循环（见 official-layout.js sync）。
    if(!panel.classList.contains('cw-v4-extension-page'))panel.classList.add('cw-v4-extension-page');
    const started=begin(panel);
    if(started){const {s,page}=started,top=section(page,'');
      row(s,top,'','管理、安装和配置扩展',[act(s,get('third_party_extension_button'),'安装扩展'),act(s,get('extensions_details'),'管理')]);
      tg(s,top,get('extensions_notify_updates'),'扩展有更新时通知');
      const list=section(page,'已安装');list.classList.add('cw-v4-entries');for(const id of ['extensions_settings','extensions_settings2'])move(s,get(id),list);
      const extras=panel.querySelector('.extensions_url_block');
      if(extras){const legacy=section(page,'旧版 Extras API（已弃用）');dialogRow(s,legacy,'Extras API','只有还在用旧版 Extras 服务器时才需要','Extras API',box=>move(s,extras,box),'配置',extensionSettings.open);}
      finish(s);
    }
    panel.querySelectorAll('#extensions_settings > div,#extensions_settings2 > div').forEach(c=>{
      if(c.dataset.cwV4Extension)return;
      const drawer=c.matches('.inline-drawer')?c:c.querySelector('.inline-drawer'),head=drawer?.querySelector('.inline-drawer-header');if(!head)return;
      const name=head.querySelector('b,strong')?.textContent.trim()||head.textContent.trim();if(!name)return;
      c.dataset.cwV4Extension='1';c.classList.add('cw-v4-extension-item');
      const s=state(c),r=make('div','cw-v4-extension-row'),ic=make('span','cw-v4-extension-icon');
      r.append(ic,make('span','cw-v4-extension-name',name),button(L('配置'),e=>{e.stopPropagation();extensionSettings.open(c,name);},'cw-v4-button cw-v4-extension-edit'));
      c.prepend(r);s.created.push(r);
    });
  }
  return {
    mount(panel){
      ({WorldInfo:world,Backgrounds:backgrounds,AdvancedFormatting:formatting,'left-nav-panel':presets,PersonaManagement:personas,'right-nav-panel':characters,rm_api_block:api,rm_extensions_block:extensions})[panel.id]?.(panel);
      if(panel.id==='PersonaManagement'){personaRows(panel);personaName(state(panel));}
      if(panel.id==='left-nav-panel')promptRows(panel);
      if(panel.id==='right-nav-panel'){characterRows(panel);groupEditor();groupMemberRows();}
      if(panel.id==='WorldInfo'){
        const s=state(panel);worldChips(s);worldSummary(s);
        const select=get('world_editor_select'),visible=get('select2-world_editor_select-container')?.closest('.select2-container');
        if(select&&visible&&visible.parentElement!==select.parentElement)move(s,visible,select.parentElement);
        worldEntries(panel);
      }
      for(const st of states.values())if(panel.contains(st.root))refreshLeftovers(st);
      for(const f of paints)f();
    },
    restore(){extensionSettings.restore();paints.length=0;ctxCache.at=0;for(const s of [...states.values()].reverse()){s.cleanup?.();s.cleanups?.forEach(f=>f());s.gates?.forEach(stop=>stop());delete s.root.dataset.cwV4Sources;if(s.rest){for(const n of [...s.rest.childNodes])s.root.append(n);}for(const [node,mark] of [...s.moves].reverse())if(mark.parentNode)mark.replaceWith(node);s.created.forEach(n=>n.remove());s.buttons?.forEach(n=>n.classList.remove('cw-v4-as-btn','cw-v4-primary'));s.mapped?.forEach(n=>n.classList.remove('cw-v4-mapped-setting','cw-v4-row','cw-v4-range'));s.iconToggles?.forEach(n=>n.classList.remove('cw-v4-icon-toggle'));s.root.classList.remove('cw-v4-reflow');if(s.root.classList.contains('cw-v4-extension-item')){s.root.classList.remove('cw-v4-extension-item');delete s.root.dataset.cwV4Extension;}}states.clear();},
  };
}
