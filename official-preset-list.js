// Native PromptManager adapter. No prompt bodies or private manager state are written.
export function createPresetList({win,make,button,t,phoneWide,onLeave,onEdit,canEdit}) {
  const doc=win.document;
  let ui=null;
  const SVG={multi:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/><path d="m14 7 1.5 1.5L19 5"/>',ins:'<path d="M4 7h10M4 12h10M4 17h6M18 14v6M15 17h6"/>',imp:'<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19h14"/>',exp:'<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 19h14"/>',reload:'<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.6M4 4v4.6h4.6"/>',plus:'<path d="M12 5v14M5 12h14"/>',chev:'<path d="m9 6 6 6-6 6"/>'};
  function svgIcon(k){const s=doc.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','0 0 24 24');s.setAttribute('fill','none');s.setAttribute('stroke','currentColor');s.setAttribute('stroke-width','1.8');s.setAttribute('stroke-linecap','round');s.setAttribute('stroke-linejoin','round');s.setAttribute('aria-hidden','true');s.innerHTML=SVG[k];return s;}
  const ROW='.completion_prompt_manager_prompt[data-pm-identifier]';
  const canonical=r=>r?.matches?.(ROW)&&r.dataset.presetFavoriteMirror!=='true'&&r.closest('ul')?.matches('#completion_prompt_manager_list,.bai-bai-preset-group-list');
  const rows=()=>[...(ui?.manager.querySelectorAll('#completion_prompt_manager_list '+ROW)||[])].filter(canonical);
  const node=r=>r?.nodeType===1?r:r?.row;
  const id=r=>r?.identifier??r?.dataset?.pmIdentifier;
  const toggle=r=>node(r)?.querySelector('.prompt-manager-toggle-action');
  const allowed=r=>{if(!r)return false;const n=toggle(r);return n?!n.matches('[disabled],[aria-disabled="true"],.disabled'):!!r.prompt&&ui?.nativePM?.isPromptToggleAllowed?.(r.prompt)===true;};
  const on=r=>{const n=toggle(r);return n?n.classList.contains('fa-toggle-on'):r?.order?r.order.enabled!==false:!!node(r)&&!node(r).classList.contains('completion_prompt_manager_prompt_disabled');};
  function entries(){
    const mounted=new Map(rows().map(r=>[id(r),r])),pm=ui?.nativePM;
    const order=pm?.getPromptOrderForCharacter?.(pm.activeCharacter),defs=pm?.serviceSettings?.prompts;
    if(!order?.length||!Array.isArray(defs))return [...mounted].map(([identifier,row])=>({identifier,row,name:row.querySelector('.completion_prompt_manager_prompt_name')?.dataset.pmName||''}));
    const prompts=new Map(defs.map(p=>[p.identifier,p])),ctx=win.SillyTavern?.getContext?.(),settings=ctx?.chatCompletionSettings;
    const preset=ctx?.getPresetManager?.('openai')?.getCompletionPresetByName?.(settings?.preset_settings_openai);
    const groups=(settings?.extensions||preset?.extensions)?.baibaiToolkit?.presetPromptGroups?.prompts||{};
    return order.filter(e=>prompts.has(e.identifier)).map(order=>{const prompt=prompts.get(order.identifier),row=mounted.get(order.identifier);return {identifier:order.identifier,row,prompt,order,name:prompt.name||'',group:row?.dataset.presetGroupId||groups[order.identifier]?.groupId||''};});
  }
  const find=key=>entries().find(r=>id(r)===key);
  function clearBaiControls(u){for(const r of u.actionRowNodes||[])r.classList.remove('cw-pm-bai-action-row');u.actionRowNodes?.clear();}
  function restoreGroups(u=ui){if(!u)return;for(const [key]of u.expanded){const group=[...u.manager.querySelectorAll('.bai-bai-preset-group')].find(g=>g.dataset.presetGroupId===key);if(group&&!group.classList.contains('bai-bai-preset-group-collapsed'))group.querySelector('.bai-bai-preset-group-toggle')?.click();}u.expanded.clear();u.expanding.clear();}
  function expandGroup(group){if(!group?.classList.contains('bai-bai-preset-group-collapsed')||ui.expanding.has(group.dataset.presetGroupId))return;const key=group.dataset.presetGroupId;ui.expanded.set(key,true);ui.expanding.add(key);group.querySelector('.bai-bai-preset-group-toggle')?.click();win.setTimeout(()=>{if(ui){ui.expanding.delete(key);paint();}},220);}
  function ensureRow(key){const entry=find(key),row=node(entry),group=row?.closest('.bai-bai-preset-group')||[...ui.manager.querySelectorAll('.bai-bai-preset-group')].find(g=>g.dataset.presetGroupId===entry?.group);expandGroup(group);if(row&&!group?.classList.contains('bai-bai-preset-group-collapsed'))return Promise.resolve(entry);return new Promise(resolve=>{let timer;const done=()=>{const fresh=find(key);if(node(fresh)){observer.disconnect();win.clearTimeout(timer);resolve(fresh);}};const observer=new win.MutationObserver(done);observer.observe(ui.manager,{childList:true,subtree:true});timer=win.setTimeout(()=>{observer.disconnect();resolve(null);},1800);done();});}
  function restoreSort(e){if(!e.node.isConnected||e.alive?.()===false)return;try{for(const k of ['disabled','handle'])if(e.get(k)===e.applied[k]&&!(k==='disabled'&&e.locked?.()))e.set(k,e.original[k]);}catch{}}
  function sortables(block){
    const list=ui.manager.querySelector('#completion_prompt_manager_list');if(!list)return;
    const found=new Map(),$=win.jQuery;
    if(!list.closest('.bai-bai-preset-vue-list-host')&&$&&$(list).hasClass('ui-sortable')){const instance=$(list).sortable('instance');if(instance)found.set(instance,{node:list,delegatedHandle:true,alive:()=>list.isConnected&&$(list).hasClass('ui-sortable')&&$(list).sortable('instance')===instance,get:k=>instance.option(k),set:(k,v)=>instance.option(k,v)});}
    for(const ul of [list,...list.querySelectorAll('.bai-bai-preset-group-list')])for(const k of Object.keys(ul)){const v=ul[k];if(k.startsWith('Sortable')&&v&&typeof v.option==='function')found.set(v,{node:ul,get:k=>v.option(k),set:(k,x)=>v.option(k,x)});}
    for(const [instance,e]of ui.sortables)if(!found.has(instance)){restoreSort(e);ui.sortables.delete(instance);}
    for(const [instance,api]of found){let e=ui.sortables.get(instance);if(!e){e={...api,original:{disabled:api.get('disabled'),handle:api.get('handle')},applied:{}};ui.sortables.set(instance,e);}for(const k of ['disabled','handle'])if(k in e.applied&&e.get(k)!==e.applied[k])e.original[k]=e.get(k);
      e.locked=()=>{const group=e.get('group');if(list.classList.contains('bai-bai-preset-drag-locked')||group?.pull===false)return true;try{return typeof group?.checkPull==='function'&&group.checkPull(instance,instance,null,null)===false;}catch{return true;}};const locked=e.locked();
      const desired={disabled:block||!!e.original.disabled||locked,handle:api.node===list&&list.closest('.bai-bai-preset-vue-list-host')?'.drag-handle, .bai-bai-preset-group-header':'.drag-handle'};
      // Stock jQuery UI refreshes every sortable row when its handle option changes.
      // Its own restrictions stay in force, with the CW handle enforced at the list.
      for(const k of ['disabled',...(!desired.disabled&&!api.delegatedHandle?['handle']:[])]){if(e.get(k)!==desired[k])e.set(k,desired[k]);e.applied[k]=desired[k];}
    }
  }
  const key=()=>{const c=win.SillyTavern?.getContext?.();return JSON.stringify([doc.getElementById('settings_preset_openai')?.value,c?.characterId,c?.groupId,c?.chatId]);};
  const text=(el,value)=>{if(el.textContent!==value)el.textContent=value;};
  const attr=(el,name,value)=>{if(el.getAttribute(name)!==String(value))el.setAttribute(name,String(value));};
  const flag=(el,name,value)=>{if(el.classList.contains(name)!==value)el.classList.toggle(name,value);};
  const hidden=(el,value)=>{if(el.hidden!==value)el.hidden=value;};
  const prop=(el,name,value)=>{if(el[name]!==value)el[name]=value;};
  function hideFloating(u){if(u.bottom.matches(':popover-open'))u.bottom.hidePopover();u.bottom.removeAttribute('popover');}
  function floating(u){
    if(!phoneWide()){hideFloating(u);return;}
    if(!u.multi||!u.selected.size||u.tab!=='prompts'||doc.getElementById('main_api')?.value!=='openai'||!u.panel.classList.contains('openDrawer')||u.panel.classList.contains('cw-v4-inactive')||u.panel.classList.contains('cwr-presets-open')){hideFloating(u);return;}
    if(!u.bottom.hasAttribute('popover'))u.bottom.setAttribute('popover','manual');
    if(!u.bottom.matches(':popover-open'))u.bottom.showPopover();
    const r=u.panel.getBoundingClientRect(),values={'--cw-pm-batch-x':r.x+12+'px','--cw-pm-batch-w':r.width-24+'px','--cw-pm-batch-bottom':win.innerHeight-r.bottom+'px'};
    for(const [key,value]of Object.entries(values))if(u.bottom.style.getPropertyValue(key)!==value)u.bottom.style.setProperty(key,value);
  }
  function rememberHidden(r){if(!ui.hidden.has(r)){ui.hidden.set(r,r.hidden);const ref=new win.WeakRef(r);ui.hiddenRefs.add(ref);ui.hiddenFinalizer.register(r,ref,ref);}}
  function* hiddenNodes(u){for(const ref of u.hiddenRefs){const r=ref.deref();if(r)yield r;else u.hiddenRefs.delete(ref);}}
  function reset(){if(!ui)return;if(ui.context===key())restoreGroups();else{ui.expanded.clear();ui.expanding.clear();}ui.epoch++;ui.selected.clear();ui.lastStates.clear();ui.undo=null;ui.frozen=null;ui.anchor=null;ui.multi=false;ui.autoSelect=true;ui.context=key();text(ui.message,'');paint();}
  function paint(){
    if(!ui)return;
    if(ui.context!==key()){onLeave();reset();return;}
    if(!ui.panel.classList.contains('openDrawer')||ui.panel.classList.contains('cw-v4-inactive')){hideFloating(ui);delete ui.panel.dataset.cwPresetTab;return;}
    const phone=phoneWide();
    const {sticky,tabBar,tools,column,preset}=ui;
    if(phone&&preset){
      if(sticky.parentNode!==preset.parentNode)preset.before(sticky);
      if(tabBar.parentNode!==sticky)sticky.append(tabBar,tools);
    }else{
      if(preset&&tabBar.previousElementSibling!==preset)preset.after(tabBar);
      if(tools.parentNode!==column)column.prepend(tools);
      sticky.remove();
    }
    const bottomHost=phone?ui.column:ui.dock;
    if(ui.bottom.parentNode!==bottomHost)bottomHost.append(ui.bottom);
    if(!ui.manager.contains(ui.empty))ui.manager.append(ui.empty);
    {const list=ui.manager.querySelector('#completion_prompt_manager_list');if(list&&!list.closest('.bai-bai-preset-vue-list-host')&&list.nextElementSibling!==ui.addRow)list.after(ui.addRow);}
    const active=doc.getElementById('main_api')?.value==='openai';hidden(ui.tabBar,!active);
    if(active){if(ui.panel.dataset.cwPresetTab!==ui.tab)ui.panel.dataset.cwPresetTab=ui.tab;}else delete ui.panel.dataset.cwPresetTab;
    if(ui.dragging)return;
    const all=entries();
    flag(ui.manager,'cw-pm-long',all.length>=150);
    const tabLabel=ui.tabBar.querySelector('[data-tab=prompts]');let tabCount=tabLabel?.querySelector('.cw-pm-tab-count');if(tabLabel&&!tabCount){tabCount=make('span','cw-pm-tab-count');tabLabel.append(tabCount);}if(tabCount)text(tabCount,all.filter(on).length+'/'+all.length);const query=ui.search.value.trim().toLocaleLowerCase(),filtering=!!query||ui.filter!=='all';
    const match=e=>ui.busy&&ui.actionRows?.has(id(e))||(ui.frozen?ui.frozen.has(id(e)):e.name.toLocaleLowerCase().includes(query)&&(ui.filter==='all'||on(e)===(ui.filter==='on')));
    const visible=all.filter(match),visibleKeys=new Set(visible.map(id));
    flag(ui.manager,'cw-pm-filtering',filtering);
    if(!filtering&&!ui.busy)restoreGroups();
    for(const group of ui.manager.querySelectorAll('.bai-bai-preset-group')){rememberHidden(group);const has=visible.some(e=>e.group===group.dataset.presetGroupId);hidden(group,filtering&&!has);if(filtering&&has)expandGroup(group);}
    for(const entry of all){
      const r=node(entry);if(!r)continue;rememberHidden(r);flag(r,'cw-pm-row',true);flag(r,'cw-pm-native-row',!!r.closest('.bai-bai-preset-vue-list-host'));
      const name=r.querySelector('.completion_prompt_manager_prompt_name');
      if(name){attr(name,'tabindex','0');attr(name,'role','button');}
      const label=entry.name;hidden(r,!visibleKeys.has(id(r)));if(!r.closest('.bai-bai-preset-vue-list-host')&&name){let meta=name.querySelector('.cw-pm-description');if(!meta){meta=make('span','cw-pm-description');name.append(meta);}const token=r.querySelector('.prompt_manager_prompt_tokens')?.textContent.trim(),marker=entry.prompt?.marker||!!r.querySelector('.fa-thumb-tack,.fa-thumbtack');if(marker){if(!meta.querySelector('.cw-pm-placeholder')){meta.replaceChildren(make('span','cw-pm-placeholder',t('占位','Placeholder')),make('span','cw-pm-marker-detail',' '+t('由酒馆自动填入','Filled by SillyTavern')));}}else{const inChat=entry.prompt?.injection_position===1,d=entry.prompt?.injection_depth;text(meta,t(({system:'系统',user:'用户',assistant:'AI'}[entry.prompt?.role]||'系统') + (/\d/.test(token||'')?' · 约 '+token+' Token':'')+(inChat?` · 聊天中 @${d??''}`:''),({system:'System',user:'User',assistant:'AI'}[entry.prompt?.role]||'System') + (/\d/.test(token||'')?' · ~ '+token+' tokens':'')+(inChat?` · In chat @${d??''}`:'')));}}
      let box=r.querySelector('.cw-pm-select');
      if(ui.multi){
        if(!box){box=make('input','cw-pm-select');box.type='checkbox';r.prepend(box);}
        attr(box,'aria-label',t('选择提示词','Select prompt')+': '+label);
        const canToggle=allowed(r);
        prop(box,'checked',ui.selected.has(id(r)));
        prop(box,'disabled',!canToggle||ui.busy);
        prop(box,'title',canToggle?'':t('原生不允许启停','Native prompt cannot be toggled'));
      }else if(box)box.remove();
      flag(r,'cw-pm-selected',ui.selected.has(id(r)));
      flag(r,'cw-pm-current',!phone&&ui.panel.dataset.cwpCurrent===id(r));
      const baiAction=!!(ui.busy&&ui.baiAction&&ui.actionRows?.has(id(r))&&r.closest('.bai-bai-preset-vue-list-host'));flag(r,'cw-pm-bai-action-row',baiAction);if(baiAction)(ui.actionRowNodes||=new Set()).add(r);
      // The legacy TT fallback owns an inline !important display value.
      const handle=r.querySelector(':scope > .clawd-prompt-drag-handle');
      if(handle){const display=ui.multi?'none':'inline-flex';if(handle.style.getPropertyValue('display')!==display)handle.style.setProperty('display',display,'important');}
      const n=toggle(r);if(n)attr(n,'aria-checked',on(r));
      if(ui.undo&&!ui.busy&&ui.lastStates.has(id(r))&&ui.lastStates.get(id(r))!==on(r))for(const task of ui.undo)if(task.id===id(r)){
        // A native batch can finish while closed, leaving our DOM-state cache behind.
        const entry=ui.nativePM?.getPromptOrderEntry?.(ui.nativePM.activeCharacter,task.id);
        if(!entry||(entry.enabled!==false)!==task.after)task.conflict=true;
      }
      ui.lastStates.set(id(r),on(r));
    }
    ui.visible=visible.map(id);ui.rangeVisible=visible.filter(e=>node(e)&&!node(e).closest('.bai-bai-preset-group-collapsed')).map(id);
    // An empty list can be the middle of native renderTemplateAsync, not a deletion.
    const invisible=[...ui.selected].filter(k=>!ui.visible.includes(k)).length;
    text(ui.selection,t(`已选 ${ui.selected.size} 条${invisible?`，其中 ${invisible} 条不在当前筛选中`:''}`,`${ui.selected.size} selected${invisible?`, ${invisible} hidden`:''}`));
    text(ui.multiButton,ui.multi?t('完成','Done'):t('多选','Select'));
    attr(ui.multiButton,'aria-pressed',ui.multi);

    flag(ui.panel,'cwp-phone',phone);
    flag(ui.manager,'cw-pm-multi',ui.multi);
    flag(ui.dock,'cwp-dock-multi',ui.multi);
    flag(ui.manager,'cw-pm-has-selection',ui.multi&&!!ui.selected.size);
    for(const n of [ui.search,ui.filterLine,ui.more])hidden(n,ui.multi);
    const nativeList=ui.manager.querySelector('#completion_prompt_manager_list');
    const nativeReady=!!nativeList?.querySelector(ROW)||!!ui.manager.querySelector('#prompt-manager-reset-character')&&all.length===0;
    hidden(ui.selectionLine,!ui.multi);hidden(ui.addRow,ui.multi||!!ui.manager.querySelector('.bai-bai-preset-vue-list-host'));hidden(ui.batch,!ui.multi||(phone&&!ui.selected.size));hidden(ui.empty,!nativeReady||visible.length!==0);
    const hasFeedback=!!(ui.message.textContent||ui.undo||ui.busy);
    hidden(ui.feedback,!hasFeedback);
    flag(ui.dock,'cwp-dock-feedback',hasFeedback);
    attr(ui.manager,'aria-busy',ui.busy);
    hidden(ui.undoButton,!ui.undo);prop(ui.undoButton,'disabled',ui.busy);
    for(const b of [ui.enable,ui.disable,ui.clear,ui.remove])prop(b,'disabled',ui.busy||!ui.selected.size);
    prop(ui.allButton,'disabled',ui.busy||!visible.some(allowed));prop(ui.done,'disabled',ui.busy);
    prop(ui.search,'disabled',ui.busy);
    for(const b of ui.filters){
      prop(b,'disabled',ui.busy);
      const active=b.dataset.filter===ui.filter;
      attr(b,'aria-pressed',active);
      if(active)text(ui.filterLine.querySelector('summary'),b.textContent);
    }
    text(ui.selectionLine.querySelector('.cw-pm-selection'),t(`已选 ${ui.selected.size} 条`,`${ui.selected.size} selected`));
    floating(ui);
    // Gate every existing sorter; keep plugin groups, callbacks and movement rules.
    sortables(ui.multi||ui.busy||filtering);
    if(!phone&&ui.tab==='prompts'&&!ui.multi&&ui.autoSelect&&!ui.autoFrame&&canEdit()&&
       ui.panel.matches('.openDrawer:not(.cw-v4-inactive)')){
      const u=ui;
      const first=visible.find(e=>node(e)?.querySelector('.prompt-manager-edit-action')&&!node(e).closest('.bai-bai-preset-vue-list-host'));
      if(first){
        const firstId=id(first),epoch=u.epoch,context=u.context;
        u.autoFrame=win.requestAnimationFrame(()=>{
          u.autoFrame=0;
          if(ui!==u||!u.autoSelect||u.tab!=='prompts'||u.multi||u.epoch!==epoch||key()!==context||phoneWide()||!u.panel.matches('.openDrawer:not(.cw-v4-inactive)')||doc.getElementById('completion_prompt_manager_popup')?.classList.contains('openDrawer'))return;
          const list=u.manager.querySelector('#completion_prompt_manager_list');
          const action=list?.querySelector(`[data-pm-identifier="${win.CSS.escape(firstId)}"] .prompt-manager-edit-action`);
          if(action&&onEdit(action))u.autoSelect=false;
        });
      }
    }
  }

  function select(r,shift){
    if(ui.busy||!allowed(r))return;
    const k=id(r),value=!ui.selected.has(k),a=ui.rangeVisible.indexOf(ui.anchor),b=ui.rangeVisible.indexOf(k);
    const keys=shift&&a>=0&&b>=0?ui.rangeVisible.slice(Math.min(a,b),Math.max(a,b)+1):[k];
    for(const next of keys)if(allowed(find(next)))value?ui.selected.add(next):ui.selected.delete(next);
    ui.anchor=k;paint();
  }
  // Observe completion of a native render. Re-query on each check, never reuse its old row.
  async function setOne(k,target,epoch){const mounted=await ensureRow(k);if(!ui||ui.epoch!==epoch||!mounted)return false;return new Promise(resolve=>{
    const r=find(k);if(!r||!allowed(r))return resolve(false);if(on(r)===target)return resolve(true);
    let timer,observer,done=false;
    const finish=value=>{if(done)return;done=true;observer?.disconnect();win.clearTimeout(timer);resolve(value);};
    const check=()=>{if(!ui||ui.epoch!==epoch||ui.context!==key())return finish(false);const fresh=find(k);if(fresh&&on(fresh)===target)finish(true);};
    observer=new win.MutationObserver(check);observer.observe(ui.manager,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    timer=win.setTimeout(()=>finish(false),2500);
    try{ui.nativeAction=toggle(r);ui.nativeAction.click();ui.nativeAction=null;check();}catch{if(ui)ui.nativeAction=null;finish(false);}
  });}
  // Batch actions still click each original native switch, including Vue-owned rows.
  async function run(target,undo=false){
    if(!ui||ui.busy)return;
    const current=ui,epoch=ui.epoch,scope=ui.context,catalog=new Map(entries().map(e=>[id(e),e]));
    const tasks=undo?[...(ui.undo||[])]:[...ui.selected].map(k=>({id:k,before:on(catalog.get(k)),after:target}));
    current.batchPath='serial';ui.frozen||=new Set(ui.visible);ui.busy=true;ui.undo=null;paint();
    let changed=0,skipped=0,failed=0;const record=[];
    try{for(const task of tasks){
      if(ui!==current||current.epoch!==epoch||key()!==scope)break;
      const r=await ensureRow(task.id),desired=undo?task.before:task.after;
      if(ui!==current||current.epoch!==epoch||key()!==scope)break;
      if(!r||!allowed(r)){failed++;continue;}
      if(undo&&(task.conflict||on(r)!==task.after)){skipped++;continue;}
      if(on(r)===desired){skipped++;continue;}
      const before=on(r),success=await setOne(task.id,desired,epoch);
      if(success){changed++;record.push({id:task.id,before,after:desired});}else failed++;
      text(current.message,t('已处理 '+(changed+skipped+failed)+' / '+tasks.length+' 条…','Processed '+(changed+skipped+failed)+' / '+tasks.length+'…'));
    }}finally{if(ui===current){ui.busy=false;if(epoch===ui.epoch&&key()===scope){ui.undo=!undo&&record.length?record:null;text(ui.message,t('已改变 '+changed+' 条，跳过 '+skipped+' 条，失败 '+failed+' 条。','Changed '+changed+'; skipped '+skipped+'; failed '+failed+'.'));}paint();}}
  }
  async function removeSelected(){
    const u=ui;if(!u||u.busy||!u.selected.size)return;
    const keys=[...u.selected];if(!win.confirm(t('从当前列表移除已选 '+keys.length+' 条提示词？原提示词保留，可再次插入。','Remove '+keys.length+' selected prompts from this list? They remain available to insert again.')))return;
    u.busy=true;u.undo=null;paint();let removed=0,failed=0;
    try{for(const key of keys){if(ui!==u||u.context!==keyContext())break;const entry=await ensureRow(key),action=node(entry)?.querySelector('.prompt-manager-detach-action');if(!action){failed++;continue;}u.nativeAction=action;try{action.click();}finally{u.nativeAction=null;}const deadline=Date.now()+2500;while(find(key)&&Date.now()<deadline)await new Promise(r=>win.setTimeout(r,25));if(find(key))failed++;else{removed++;u.selected.delete(key);}}}
    finally{if(ui===u){u.busy=false;text(u.message,t('已移除 '+removed+' 条，失败 '+failed+' 条。','Removed '+removed+'; failed '+failed+'.'));paint();}}
  }
  const keyContext=()=>key();
  function mount(panel){
    const manager=panel.querySelector('#completion_prompt_manager');if(!manager)return;
    if(ui?.manager===manager){paint();return;}destroy();
    const tabBar=make('div','cw-pm-tabs'),tools=make('div','cw-pm-tools'),filters=make('details','cw-v4-more cwr-pop cw-pm-filters'),selectionLine=make('div','cw-pm-selection-line'),batch=make('div','cw-pm-batch'),feedback=make('div','cw-pm-feedback'),bottom=make('div','cw-pm-bottom');
    tabBar.setAttribute('role','tablist');tabBar.setAttribute('aria-label',t('预设内容','Preset content'));
    const search=make('input','cw-pm-search');search.type='search';search.placeholder=t('搜索提示词名称','Search prompt names');search.setAttribute('aria-label',search.placeholder);
    const btn=(label,fn)=>button(label,fn,'cw-v4-button');
    const multiButton=btn(t('多选','Select'),()=>{onLeave();ui.multi=!ui.multi;ui.autoSelect=!ui.multi;ui.selected.clear();ui.frozen=null;paint();});

    const selection=make('span','cw-pm-selection'),message=make('span','');feedback.setAttribute('role','status');
    const allButton=btn(t('全选','Select all'),()=>{for(const r of entries())if(ui.visible.includes(id(r))&&allowed(r))ui.selected.add(id(r));paint();});
    const clear=btn(t('清除','Clear'),()=>{ui.selected.clear();paint();});
    const enable=btn(t('启用','Enable selected'),()=>run(true)),disable=btn(t('停用','Disable selected'),()=>run(false)),undoButton=btn(t('撤销','Undo'),()=>run(false,true));
    const more=make('details','cw-v4-more cw-pm-more cwr-pop'),summary=make('summary','','⋯'),menu=make('div','cw-v4-more-list');summary.setAttribute('aria-label',t('提示词工具','Prompt tools'));more.append(summary,menu);
    // 原生只提供整个提示词列表的导入导出。
    const popItem=(ico,label,run,cls='')=>{const b=button('',()=>{more.open=false;run();},'cw-v4-more-item'+(cls?' '+cls:''));b.append(svgIcon(ico),make('span','',label));menu.append(b);return b;};
    const popHr=cls=>{const h=make('hr','cwr-pop-hr'+(cls?' '+cls:''));menu.append(h);};
    popItem('multi',t('多选','Select'),()=>multiButton.click());
    popItem('ins',t('插入已有提示词…','Insert an existing prompt…'),()=>manager.querySelector('.fa-chain,.fa-link')?.cwOpenPicker?.());popHr();
    popItem('imp',t('导入整个提示词列表','Import prompt list'),()=>doc.getElementById('prompt-manager-import')?.click());popItem('exp',t('导出整个提示词列表','Export prompt list'),()=>doc.getElementById('prompt-manager-export')?.click());popHr();
    popItem('reload',t('重置当前角色的列表','Reset this character\'s list'),()=>doc.getElementById('prompt-manager-reset-character')?.click(),'cw-v4-danger');
    const done=btn(t('完成','Done'),()=>multiButton.click());
    const countPicked=make('span','cw-pm-selection');
    const column=make('div','cwp-list-column'),dock=make('div','cwp-dock'),sticky=make('div','cwp-sticky');
    const preset=panel.querySelector('#respective-presets-block');
    // PromptManager replaces its own children on every render. Keep CW tools
    // and open menus in the column, outside the subtree ST owns.
    manager.before(column,dock);
    column.append(tools,manager);
    const emptyEdit=make('p','cwp-dock-empty',t('选择一条提示词进行编辑','Select a prompt to edit'));
    dock.append(emptyEdit);
    tools.append(search,filters,more,selectionLine);
    selectionLine.append(countPicked,allButton,clear,done);
    const remove=btn(t('删除','Remove'),()=>removeSelected());
    remove.classList.add('cw-pm-remove');
    const trash=make('span','cw-pm-trash');trash.setAttribute('aria-hidden','true');
    remove.prepend(trash);
    batch.append(selection,enable,disable,remove);
    feedback.append(message,undoButton);
    bottom.append(batch,feedback);
    const empty=make('p','cw-pm-empty',t('没有匹配的提示词','No matching prompts'));
    empty.hidden=true;
    const addRow=make('div','cw-pm-addrow');addRow.tabIndex=0;addRow.setAttribute('role','button');const addIco=make('span','cw-pm-number cw-pm-add-ico');addIco.append(svgIcon('plus'));addRow.append(addIco,make('span','cw-pm-add-label',t('新建提示词','New prompt')));const addRun=()=>{const n=manager.querySelector('.fa-plus-square,.fa-square-plus');(n?.closest('.menu_button')||n)?.click();};addRow.addEventListener('click',addRun);addRow.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();addRun();}});
    ui={addRow,panel,manager,tabBar,tools,filterLine:filters,more,column,dock,sticky,preset,done,search,multiButton,selectionLine,batch,feedback,bottom,empty,selection,message,remove,allButton,clear,enable,disable,undoButton,filters:[],selected:new Set(),lastStates:new Map(),filter:'all',multi:false,autoSelect:true,busy:false,undo:null,frozen:null,anchor:null,context:key(),epoch:0,dispose:[],tab:'prompts',positions:{prompts:0,params:0},sortables:new Map(),expanded:new Map(),expanding:new Set(),hidden:new WeakMap(),hiddenRefs:new Set(),rangeVisible:[],nativePM:null,dragging:false};
    const u=ui;
    u.autoFrame=0;
    const cancelAuto=()=>{u.autoSelect=false;win.cancelAnimationFrame(u.autoFrame);u.autoFrame=0;};
    u.dispose.push(cancelAuto);
    // Keep fragment-staged nodes restorable without retaining replaced trees.
    // Finalization removes dead wrappers without repeatedly dereferencing live ones.
    u.hiddenFinalizer=new win.FinalizationRegistry(ref=>u.hiddenRefs.delete(ref));
    import(new win.URL('/scripts/openai.js',win.location.href).href).then(m=>{if(ui===u){u.nativePM=m.promptManager;paint();}}).catch(()=>{});
    const filterSummary=make('summary','','');
    const filterMenu=make('div','cw-v4-more-list');
    filters.append(filterSummary,filterMenu);
    for(const [value,label] of [['all',t('全部','All')],['on',t('已启用','Enabled')],['off',t('已停用','Disabled')]]){const b=btn(label,()=>{ui.filter=value;ui.frozen=null;filters.open=false;paint();});b.className='cw-v4-more-item';b.dataset.filter=value;u.filters.push(b);filterMenu.append(b);}
    const scroll=()=>{if(u.tab==='prompts')return phoneWide()?panel:manager.querySelector(':scope>.range-block')||panel;for(let n=manager.parentElement;n;n=n.parentElement)if(/auto|scroll/.test(win.getComputedStyle(n).overflowY))return n;return panel;};
    const tabs=[];
    for(const [value,label] of [['prompts',t('提示词','Prompts')],['params',t('参数','Parameters')]]){const b=btn(label,()=>{onLeave();u.positions[u.tab]=scroll().scrollTop;u.tab=value;u.autoSelect=value==='prompts';panel.dataset.cwPresetTab=value;for(const el of tabs)attr(el,'aria-selected',el.dataset.tab===value);scroll().scrollTop=u.positions[value];paint();});b.setAttribute('role','tab');b.dataset.tab=value;attr(b,'aria-selected',value==='prompts');tabs.push(b);tabBar.append(b);}
    if(preset)preset.after(tabBar);
    else panel.querySelector(':scope>.cw-v4-drawer-page')?.prepend(tabBar);
    manager.append(empty);panel.dataset.cwPresetTab='prompts';manager.classList.add('cw-pm-list');
    const previews=new Map();
    function clearPreview(action){
      if(!previews.has(action))return;
      win.clearTimeout(previews.get(action).timer);
      previews.delete(action);
      action.classList.remove('cw-pm-toggle-preview-on','cw-pm-toggle-preview-off');
    }
    function clearPreviews(){for(const action of previews.keys())clearPreview(action);}
    function previewToggle(action,identifier){
      const desired=!(previews.get(action)?.desired??action.classList.contains('fa-toggle-on'));
      clearPreview(action);
      action.classList.add(desired?'cw-pm-toggle-preview-on':'cw-pm-toggle-preview-off');
      const timer=win.setTimeout(()=>{
        const pm=u.nativePM;
        const native=pm?.getPromptOrderForCharacter?.(pm.activeCharacter)?.find(entry=>entry.identifier===identifier);
        // PromptManager updates the order before rebuilding the list. Keep the
        // acknowledged color on the old row until the native control catches up.
        if(!manager.contains(action)||native?.enabled!==desired||action.classList.contains('fa-toggle-on')===desired)clearPreview(action);
      },1500);
      previews.set(action,{desired,timer});
    }
    u.dispose.push(clearPreviews);
    const listen=(node,type,fn,options)=>{node.addEventListener(type,fn,options);u.dispose.push(()=>node.removeEventListener(type,fn,options));};
    listen(win,'resize',()=>paint());
    // Bai captures clicks on document before our manager listener. Lock user row
    // actions one level earlier, while allowing the adapter's own toggle clicks.
    listen(win,'click',e=>{if(!u.busy||e.target===u.nativeAction||e.target?.nodeType!==1||!u.manager.contains(e.target))return;const r=e.target.closest?.(ROW);if(r?.closest('.bai-bai-preset-vue-list-host')){e.preventDefault();e.stopImmediatePropagation();}},true);
    listen(search,'input',()=>{u.frozen=null;paint();});
    listen(manager,'click',e=>{
      const r=e.target.closest('[data-pm-identifier]');if(!canonical(r))return;
      if(e.target===u.nativeAction)return;
      cancelAuto();
      if(e.target.closest('.prompt-manager-toggle-action')&&u.undo)for(const task of u.undo)if(task.id===id(r))task.conflict=true;
      if(u.busy){e.preventDefault();e.stopImmediatePropagation();return;}
      if(u.multi){if(!e.target.matches('.cw-pm-select'))e.preventDefault();e.stopImmediatePropagation();select(r,e.shiftKey);return;}
      const action=e.target.closest('.prompt-manager-toggle-action');
      if(action&&u.tab==='prompts'&&allowed(r)&&!r.closest('.bai-bai-preset-vue-list-host'))previewToggle(action,id(r));
      // The native inspect action is also invoked by the row's More menu.
      // Let that explicit programmatic action reach its original listener.
      if(!e.isTrusted&&e.target.matches('.prompt-manager-inspect-action'))return;
      // The name is ST's inspect link; like 340, a click on it opens the editor instead.
      if(!e.target.closest('.prompt-manager-toggle-action,.cw-pm-select,.clawd-prompt-drag-handle,.drag-handle,.prompt-manager-injection-depth,.prompt-manager-overridden,.prompt-manager-edit-action,.prompt-manager-detach-action,input') ){const native=r.querySelector('.prompt-manager-edit-action')||r.querySelector('.prompt-manager-inspect-action');if(native){e.preventDefault();e.stopImmediatePropagation();if(panel.dataset.cwpCurrent!==id(r)&&!(phoneWide()&&u.editing===id(r)&&doc.getElementById('completion_prompt_manager_popup')?.classList.contains('openDrawer'))){u.editing=id(r);if(!native.matches('.prompt-manager-edit-action')||!onEdit(native))native.click();}}}
    },true);
    for(const type of ['pointerdown','touchstart','mousedown'])listen(manager,type,e=>{
      const target=e.target,blocked=u.multi||u.busy||!!u.search.value.trim()||u.filter!=='all';
      if(blocked&&target.closest?.('.bai-bai-preset-group-header')&&!target.closest('button,input,select,a,.menu_button')){
        e.stopPropagation();
        return;
      }
      if(type==='pointerdown')return;
      const row=target.closest?.(ROW);
      if(!canonical(row)||row.closest('.bai-bai-preset-vue-list-host'))return;
      // Stop the sorter from seeing presses on the row body. Do not cancel default
      // behavior: focus, scrolling and the later click must still work.
      if(!target.closest('.drag-handle'))e.stopPropagation();
    },{capture:true,passive:true});
    for(const type of ['start','sortstart'])listen(manager,type,()=>{u.dragging=true;});for(const type of ['end','sortstop'])listen(manager,type,()=>{u.dragging=false;paint();});
    listen(manager,'keydown',e=>{const r=e.target.closest('[data-pm-identifier]');if(r&&e.target.matches('.prompt-manager-toggle-action,.completion_prompt_manager_prompt_name')&&['Enter',' '].includes(e.key)){e.preventDefault();e.target.click();}});
    listen(panel,'click',e=>{if(e.target.closest('.cw-pm-tabs')){cancelAuto();clearPreviews();}},true);
    listen(panel,'change',e=>{if(e.target.id==='settings_preset_openai'){cancelAuto();clearPreviews();onLeave();win.requestAnimationFrame(()=>{if(ui===u)reset();});}},true);
    const ctx=win.SillyTavern?.getContext?.();for(const name of ['CHAT_CHANGED','CHAT_LOADED','OAI_PRESET_CHANGED_BEFORE','OAI_PRESET_CHANGED_AFTER']){const type=ctx?.eventTypes?.[name];if(type&&ctx.eventSource?.on){const fn=()=>{cancelAuto();clearPreviews();onLeave();if(name!=='OAI_PRESET_CHANGED_BEFORE')reset();};ctx.eventSource.on(type,fn);u.dispose.push(()=>ctx.eventSource.removeListener(type,fn));}}
    // Native row events are installed by PromptManager before our existing adapter.
    let pruneTimer,paintFrame=0;
    const queuePaint=()=>{if(paintFrame||ui!==u)return;paintFrame=win.requestAnimationFrame(()=>{paintFrame=0;if(ui===u)paint();});};
    let panelActive=panel.classList.contains('openDrawer')&&!panel.classList.contains('cw-v4-inactive');const panelObserver=new win.MutationObserver(()=>{const active=panel.classList.contains('openDrawer')&&!panel.classList.contains('cw-v4-inactive');if(active!==panelActive){panelActive=active;if(active){u.autoSelect=true;queuePaint();}else{cancelAuto();clearPreviews();onLeave();hideFloating(u);delete panel.dataset.cwPresetTab;}}});panelObserver.observe(panel,{attributes:true,attributeFilter:['class']});u.dispose.push(()=>panelObserver.disconnect());
    const owned=n=>{const e=n.nodeType===1?n:n.parentElement;return !!e&&(u.addRow.contains(e)||u.tools.contains(e)||u.filterLine.contains(e)||u.selectionLine.contains(e)||u.bottom.contains(e)||e.matches('.cw-pm-select')||!!e.closest('.cw-pm-description'));};
    const ownMutation=r=>{if(r.type==='attributes'){const old=new Set((r.oldValue||'').split(/\s+/).filter(Boolean)),now=new Set(r.target.classList);const changed=[...[...old].filter(k=>!now.has(k)),...[...now].filter(k=>!old.has(k))];return changed.every(k=>k.startsWith('cw-pm-'));}return owned(r.target)||[...r.addedNodes,...r.removedNodes].every(owned);};
    const observer=new win.MutationObserver(records=>{for(const action of previews.keys())if(!manager.contains(action))clearPreview(action);if(records.every(ownMutation))return;queuePaint();win.clearTimeout(pruneTimer);pruneTimer=win.setTimeout(()=>{if(ui!==u||u.busy)return;const current=new Set(entries().map(id));for(const k of u.selected)if(!current.has(k))u.selected.delete(k);queuePaint();},200);});observer.observe(manager,{childList:true,subtree:true,attributes:true,attributeFilter:['class'],attributeOldValue:true});u.dispose.push(()=>{observer.disconnect();win.clearTimeout(pruneTimer);if(paintFrame)win.cancelAnimationFrame(paintFrame);});
    paint();
  }
  function destroy(){if(!ui)return;onLeave();const u=ui;hideFloating(u);clearBaiControls(u);ui=null;u.epoch++;u.dispose.forEach(f=>f());
    restoreGroups(u);for(const e of u.sortables.values())restoreSort(e);
    u.column.replaceWith(u.manager);
    for(const n of [u.tabBar,u.bottom,u.empty,u.addRow,u.dock,u.sticky])n.remove();u.manager.removeAttribute('aria-busy');
    delete u.panel.dataset.cwPresetTab;u.panel.classList.remove('cwp-phone');u.manager.classList.remove('cw-pm-list','cw-pm-multi','cw-pm-sort','cw-pm-busy','cw-pm-filtering','cw-pm-long');
    // Restore live nodes even while native TT holds them outside the manager.
    for(const r of hiddenNodes(u)){if(u.hidden.has(r))r.hidden=u.hidden.get(r);if(!r.matches('.cw-pm-row'))continue;r.classList.remove('cw-pm-selected','cw-pm-current','cw-pm-row','cw-pm-native-row');r.querySelectorAll('.cw-pm-select,.cw-pm-description').forEach(n=>n.remove());const name=r.querySelector('.completion_prompt_manager_prompt_name');name?.removeAttribute('role');name?.removeAttribute('tabindex');}
    for(const ref of u.hiddenRefs)u.hiddenFinalizer.unregister(ref);u.hiddenRefs.clear();
  }
  return {mount,destroy,refresh:paint};
}
