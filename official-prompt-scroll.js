// PromptManager replaces its list asynchronously. Its native scroll owner is
// no longer an ancestor in CW, so keep a visible row anchored in the CW pane.
export function createPromptScroll({win,enabled}) {
  const doc=win.document, rowSelector='.completion_prompt_manager_prompt[data-pm-identifier]:not([data-preset-favorite-mirror="true"]):not(.bai-bai-preset-favorite-prompt)';
  let panel=null, manager=null, observer=null, resize=null, snapshot=null, pending=null;
  let frame=0, captureFrame=0, stopped=false, blockedList=null, blockedFirst=null;
  let actionSnapshot=false;
  const disposers=[];
  const list=()=>manager?.querySelector('#completion_prompt_manager_list');
  const context=()=>{
    const c=win.SillyTavern?.getContext?.();
    return JSON.stringify([doc.getElementById('settings_preset_openai')?.value,c?.characterId,c?.groupId,c?.chatId]);
  };
  // A desktop dock leaves the native drawer logically open, while the list stays interactive.
  const popupOpen=()=>!panel?.querySelector('.cwp-dock-editing')&&doc.getElementById('completion_prompt_manager_popup')?.classList.contains('openDrawer');
  const promptPage=()=>panel?.dataset.cwPresetTab==='prompts';
  // The owner is fixed while a tab is shown; reading computed overflow on every
  // scroll frame forced a full style recalc (96 prompts: ~70% of scroll time).
  let ownerCache=null;
  // Layout switches (phone <-> desktop) can change which pane scrolls.
  const dropOwner=()=>{ownerCache=null;};win.addEventListener('resize',dropOwner);disposers.push(()=>win.removeEventListener('resize',dropOwner));
  function scrollOwner() {
    const page=promptPage(),current=list();
    if(ownerCache&&ownerCache.page===page&&ownerCache.list===current&&ownerCache.node?.isConnected&&(ownerCache.node.contains(manager)||manager?.contains(ownerCache.node)))return ownerCache.node;
    const node=findOwner();ownerCache=node?{node,page,list:current}:null;return node;
  }
  function findOwner() {
    const current=list();
    if(promptPage()&&panel?.querySelector('.cwp-dock')&&!panel.classList.contains('cwp-phone')){
      const column=current?.closest('.range-block');
      if(column)return column;
    }
    if(promptPage()&&panel?.classList.contains('cwp-phone'))return panel;
    if(promptPage()&&current&&/auto|scroll/.test(win.getComputedStyle(current).overflowY))return current;
    for(let n=manager?.parentElement;n;n=n.parentElement){
      if(/auto|scroll/.test(win.getComputedStyle(n).overflowY)&&n.scrollHeight>n.clientHeight+1)return n;
    }
    return null;
  }
  function restoreOverflow() {
    if(!pending)return;
    const {scroller,anchorStyle,anchorPriority}=pending;
    if(anchorStyle)scroller.style.setProperty('overflow-anchor',anchorStyle,anchorPriority);
    else scroller.style.removeProperty('overflow-anchor');
  }
  function cancel(block=false) {
    restoreOverflow();pending=null;snapshot=null;actionSnapshot=false;
    if(frame)win.cancelAnimationFrame(frame);frame=0;
    if(captureFrame)win.cancelAnimationFrame(captureFrame);captureFrame=0;
    if(block){blockedList=list();blockedFirst=blockedList?.querySelector(rowSelector);}
  }
  function capture(preferred=null) {
    if(stopped||!enabled()||!promptPage()||!panel?.isConnected||!manager?.isConnected||pending||popupOpen())return;
    if(actionSnapshot&&!preferred)return;
    const current=list();if(!current||current===blockedList)return;
    const rows=current.querySelectorAll(rowSelector);if(!rows.length)return;
    const scroller=scrollOwner();if(!scroller)return;
    const rect=scroller.getBoundingClientRect(),scale=rect.height/scroller.offsetHeight||1,top=rect.top+scroller.clientTop*scale;
    // Hit-test the viewport: reading offscreen row geometry would force mobile
    // content-visibility placeholders to lay out and move the very anchor read.
    let row=preferred&&current.contains(preferred)?preferred:null;
    if(!row){
      const x=Math.max(0,Math.min(win.innerWidth-1,rect.left+rect.width/2));
      for(let y=Math.max(0,top+1);y<Math.min(win.innerHeight,rect.bottom);y+=24){
        row=doc.elementFromPoint(x,y)?.closest(rowSelector);
        if(row&&current.contains(row))break;
        row=null;
      }
    }
    const r=row?.getBoundingClientRect();
    const visible=r&&r.top<rect.bottom&&r.bottom>top;
    snapshot={list:current,first:rows[0],last:rows[rows.length-1],scroller,ownerInManager:manager.contains(scroller),key:context(),top:scroller.scrollTop,identifier:visible?row.dataset.pmIdentifier:null,offset:visible?(r.top-top)/scale:0};
  }
  function captureSoon(){
    if(!captureFrame)captureFrame=win.requestAnimationFrame(()=>{captureFrame=0;capture();});
  }
  function queueRestore(){if(!frame&&pending)frame=win.requestAnimationFrame(()=>{frame=0;apply();});}
  function apply() {
    if(!pending)return;
    if(!enabled()||!promptPage()||!panel?.isConnected||!manager?.isConnected||pending.key!==context()){cancel();return;}
    const current=list(),rows=current?.querySelectorAll(rowSelector);
    if(!rows?.length){if(win.performance.now()<pending.expires)queueRestore();else cancel();return;}
    if(pending.ownerInManager&&!pending.scroller.contains(current)){
      const next=findOwner();
      if(!next){cancel();return;}
      restoreOverflow();
      pending.scroller=next;
      pending.anchorStyle=next.style.getPropertyValue('overflow-anchor');
      pending.anchorPriority=next.style.getPropertyPriority('overflow-anchor');
      next.style.setProperty('overflow-anchor','none');
    }
    if(!pending.scroller.isConnected){cancel();return;}
    const p=pending,rect=p.scroller.getBoundingClientRect(),scale=rect.height/p.scroller.offsetHeight||1;
    const row=p.identifier&&current.querySelector('[data-pm-identifier="'+win.CSS.escape(p.identifier)+'"]');
    const delta=row?(row.getBoundingClientRect().top-rect.top-p.scroller.clientTop*scale)/scale-p.offset:0;
    if(row)p.scroller.scrollTop+=delta;else p.scroller.scrollTop=p.top;
    if(!p.deadline)p.deadline=win.performance.now()+1500;
    p.stable=Math.abs(delta)<0.75?p.stable+1:0;
    if(win.performance.now()>=p.deadline||p.stable>=2&&win.performance.now()-p.changedAt>300&&!popupOpen()){
      restoreOverflow();pending=null;actionSnapshot=false;captureSoon();return;
    }
    queueRestore();
  }
  function mutated(records) {
    if(!enabled()||!promptPage()||!panel?.isConnected){cancel();return;}
    const current=list();
    if(blockedList&&(current!==blockedList||current?.querySelector(rowSelector)!==blockedFirst)){blockedList=blockedFirst=null;}
    if(snapshot&&!pending&&snapshot.key===context()&&snapshot.list!==blockedList){
      const detached=!snapshot.list.isConnected;
      const emptied=records.some(r=>r.type==='childList'&&r.target===snapshot.list&&r.removedNodes.length)&&!snapshot.first.isConnected&&!snapshot.last.isConnected;
      if(detached||emptied){
        const scroller=snapshot.scroller;
        pending={...snapshot,anchorStyle:scroller.style.getPropertyValue('overflow-anchor'),anchorPriority:scroller.style.getPropertyPriority('overflow-anchor'),expires:win.performance.now()+15000,deadline:0,changedAt:win.performance.now(),stable:0};
        scroller.style.setProperty('overflow-anchor','none');
      }
    }
    if(pending){
      // ST can replace the whole scroll owner. Seed its position as soon as the
      // new rows arrive, before the next paint. The frame pass corrects the
      // anchor after CW finishes adapting the native rows.
      if(pending.ownerInManager&&current?.querySelector(rowSelector)&&!pending.scroller.contains(current)){
        const next=findOwner();
        if(next)next.scrollTop=pending.top;
      }
      // CW moves native controls and adds labels inside rows. Those changes
      // are not another native list render and must not prolong settling.
      if(records.some(r=>r.type==='childList'&&(r.target===current||r.target===manager)))pending.changedAt=win.performance.now();
      queueRestore();
    }
    else if(current?.querySelector(rowSelector))captureSoon();
  }
  function sync(activePanel) {
    if(stopped)return;
    const next=activePanel?.querySelector('#completion_prompt_manager');
    if(!enabled()||!next){disconnect();return;}
    bindLifecycle();
    if(next!==manager){
      disconnect();panel=activePanel;manager=next;observer=new win.MutationObserver(mutated);observer.observe(manager,{childList:true,subtree:true});
      if(win.ResizeObserver){
        resize=new win.ResizeObserver(()=>{if(pending){pending.changedAt=win.performance.now();pending.stable=0;pending.deadline=Math.min(pending.changedAt+1500,pending.expires);queueRestore();}});
        for(const n of new Set([manager,manager.parentElement,panel.querySelector(':scope>.cw-v4-drawer-page')]))if(n)resize.observe(n);
      }
      captureSoon();
    }
    // The panel observer queues CW's sync before this observer queues restore.
    // Restore only in rAF, after CW has adapted the new native rows.
  }
  function disconnect(){ownerCache=null;cancel();observer?.disconnect();resize?.disconnect();observer=resize=null;panel=manager=null;blockedList=blockedFirst=null;}
  const listen=(target,type,fn,options)=>{target.addEventListener(type,fn,options);disposers.push(()=>target.removeEventListener(type,fn,options));};
  listen(doc,'contentvisibilityautostatechange',e=>{
    if(pending&&manager?.contains(e.target)){pending.changedAt=win.performance.now();pending.stable=0;queueRestore();}
  },true);
  // Re-anchor after the user stops scrolling, not on every scroll frame: capture()
  // reads row geometry, and mid-scroll that forced a full style/layout pass per frame.
  let settle=0;disposers.push(()=>win.clearTimeout(settle));
  listen(doc,'scroll',e=>{if(e.target!==(snapshot?.scroller||pending?.scroller))return;if(pending){captureSoon();return;}win.clearTimeout(settle);settle=win.setTimeout(captureSoon,120);},{capture:true,passive:true});
  const intent=e=>{
    if(e.target.closest?.('.cw-pm-tabs')){cancel();captureSoon();return;}
    const scroller=pending?.scroller||snapshot?.scroller||scrollOwner();
    if(e.type==='pointerdown'&&e.target===scroller){
      if(pending)cancel();
      actionSnapshot=false;captureSoon();return;
    }
    if(e.target.closest?.('#settings_preset_openai,#rm_characters_block,.character_select')){cancel(true);return;}
    if(e.type==='keydown'&&['PageUp','PageDown','Home','End','ArrowUp','ArrowDown'].includes(e.key)){actionSnapshot=false;captureSoon();return;}
    if(e.target.closest?.('#completion_prompt_manager')){
      const keepClicked=e.target.closest('.prompt-manager-toggle-action,.prompt-manager-edit-action,[data-preset-prompt-action="edit"]');
      const row=keepClicked?e.target.closest(rowSelector):null;actionSnapshot=false;capture(row);actionSnapshot=true;
    }
  };
  for(const type of ['pointerdown','click','change','keydown','dragstart'])listen(doc,type,intent,true);
  for(const type of ['wheel','touchmove'])listen(doc,type,e=>{if(e.isTrusted&&panel?.contains(e.target)){if(pending)cancel();else{actionSnapshot=false;captureSoon();}}},{capture:true,passive:true});
  // Use the host's existing event bus; do not import ST's entry module again.
  let lifecycleBound=false;
  function bindLifecycle(){
    if(stopped||lifecycleBound)return;
    const {eventSource,eventTypes}=win.SillyTavern?.getContext?.()||{};
    if(!eventSource?.on)return;
    lifecycleBound=true;
    for(const name of ['OAI_PRESET_CHANGED_BEFORE','OAI_PRESET_CHANGED_AFTER','CHAT_CHANGED','CHAT_LOADED']){
      const type=eventTypes?.[name];if(!type)continue;
      const reset=()=>cancel(true);eventSource.on(type,reset);
      disposers.push(()=>eventSource.removeListener?.(type,reset));
    }
  }
  bindLifecycle();
  return {sync,stop:disconnect,destroy(){stopped=true;disconnect();disposers.splice(0).forEach(f=>f());}};
}
