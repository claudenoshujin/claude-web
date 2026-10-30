import { preferencesFor } from './preferences.js?v=2.0.161';

// Lightweight lifecycle. Artwork, rig and animation code are fetched only on enable.
export function installHalloween({win, getContext, setRig, refresh, getClawdState}) {
  const doc=win.document, root=doc.documentElement, prefs=preferencesFor(win);
  let disposed=false, serial=0, scene=null, pending=null, settings=null,holidaySection=null,failed=false;
  const listeners=[], subscriptions=[];
  const testBuild=/-hw\d+(?:$|-)/.test(new URL(import.meta.url).searchParams.get('v')||'');
  let previewMessage='';
  const wanted=()=>prefs.getItem('claude-web:halloween')==='on'&&root.dataset.claudeEnabled!=='off';
  const ambient=()=>prefs.getItem('claude-web:halloween-ambient')!=='off';
  const on=(target,type,fn,opts)=>{target.addEventListener(type,fn,opts);listeners.push(()=>target.removeEventListener(type,fn,opts));};
  function mountSettings() {
    const appearance=doc.querySelector('#claude-web-section-appearance');if(!appearance)return;
    holidaySection=doc.querySelector('#claude-web-section-holiday');
    if(!holidaySection){holidaySection=doc.createElement('details');holidaySection.className='claude-web-section';holidaySection.id='claude-web-section-holiday';holidaySection.innerHTML='<summary><span>节日</span><span class="claude-web-section-summary" id="claude-web-summary-holiday"></span></summary><div class="claude-web-section-body"></div>';appearance.after(holidaySection);}
    const host=holidaySection.querySelector('.claude-web-section-body');
    if(!settings){
      settings=doc.createElement('div');settings.className='cw-halloween-settings';
      settings.setAttribute('role','group');settings.setAttribute('aria-label','节日');
      settings.innerHTML='<label class="checkbox_label claude-web-check"><input type="checkbox" id="claude-web-halloween"><span>万圣节装饰</span></label><label class="checkbox_label claude-web-check"><input type="checkbox" id="claude-web-halloween-ambient" aria-describedby="cw-halloween-ambient-help"><span>环境小动作</span></label><div class="claude-web-help" id="cw-halloween-ambient-help">幽灵 Clawd 偶尔在空输入框里打个招呼，装饰偶尔动一下；系统“减少动态效果”优先。</div><small class="claude-web-help cw-halloween-status" role="status"></small>';
      if(testBuild){const menu=doc.createElement('details');menu.id='cw-halloween-effects-menu';menu.innerHTML='<summary>看效果</summary><div class="claude-web-actions"></div>';const actions=[['drift','图标飘走'],['ghost','小幽灵飘走'],['possess','附身'],['clawd','Clawd左右看'],['candy','图标蹦糖'],['prank','幽灵打字'],['pail','南瓜桶撒糖'],['chat-spider','聊天页小蜘蛛'],['drawer-spider','设置页蜘蛛'],['flame','蜡烛火苗'],['delete-A','删除A（演示）'],['delete-B','删除B（演示）'],['send','发送飞字（演示）']];for(const [effect,label]of actions){const b=doc.createElement('button');b.type='button';b.className='menu_button';b.dataset.cwHwPreview=effect;b.textContent=label;menu.lastChild.append(b);}settings.append(menu);on(menu,'click',e=>{const b=e.target.closest('[data-cw-hw-preview]');if(b){e.preventDefault();preview(b.dataset.cwHwPreview);}});}
      on(settings,'change',e=>{const key=e.target.id==='claude-web-halloween'?'halloween':e.target.id==='claude-web-halloween-ambient'?'halloween-ambient':null;if(!key)return;prefs.setItem('claude-web:'+key,e.target.checked?'on':'off');sync();});
    }
    if(settings.parentNode!==host)host.append(settings);
    settings.querySelector('#claude-web-halloween').checked=prefs.getItem('claude-web:halloween')==='on';
    const small=settings.querySelector('#claude-web-halloween-ambient');small.checked=ambient();small.disabled=!wanted();
    const help=settings.querySelector('#cw-halloween-ambient-help'),hint=wanted()?'幽灵 Clawd 偶尔在空输入框里打个招呼，装饰偶尔动一下；系统“减少动态效果”优先。':'先开启万圣节装饰，才能使用环境小动作。';if(help.textContent!==hint)help.textContent=hint;
    const note=settings.querySelector('.cw-halloween-status'),message=previewMessage||(failed?'万圣节资源暂未加载成功，已使用普通外观；刷新后可重试。':'');if(note.textContent!==message)note.textContent=message;
  }
  async function preview(effect){
    if(!testBuild||disposed)return false;
    const notice=message=>{previewMessage=message;mountSettings();if(message)win.toastr?.info(message);};
    if(win.matchMedia('(prefers-reduced-motion: reduce)').matches||root.dataset.claudeMotion==='off'){notice('系统开了减少动态效果');return false;}
    previewMessage='';if(!wanted()){prefs.setItem('claude-web:halloween','on');await sync();}if(!scene)return false;
    const owner=settings?.closest('dialog');if(owner){if(typeof owner._cwShut==='function')owner._cwShut();else owner.querySelector('.popup-button-cancel,.popup-button-ok')?.click();}
    if(effect!=='drawer-spider')doc.querySelector('.cw-v4-shell:not([hidden]) .cw-v4-close')?.click();
    return scene.preview(effect,400);
  }
  function subscribe() {
    if(subscriptions.length)return;
    const c=getContext(),source=c?.eventSource,types=c?.eventTypes||c?.event_types||{};
    if(!source?.on)return;
    for(const [key,fallback,fn]of[
      ['CHAT_CHANGED','chat_id_changed',()=>scene?.reset()],
      ['MESSAGE_SENT','message_sent',id=>scene?.sent(id)],
      ['MESSAGE_DELETED','message_deleted',()=>scene?.deleted()],
    ]){const type=types[key]||fallback;source.on(type,fn);subscriptions.push(()=>source.removeListener?.(type,fn));}
  }
  async function sync() {
    if(disposed)return;
    mountSettings();
    if(!wanted()) {
      failed=false;
      subscriptions.splice(0).forEach(f=>f());
      if(scene||pending){serial++;pending=null;scene?.destroy();scene=null;root.removeAttribute('data-cw-halloween');setRig(null);refresh();}
      return;
    }
    if(failed)return;
    subscribe();
    if(scene){scene.sync();return;}
    if(pending)return pending;
    const ticket=++serial;
    pending=import('./halloween-scene.js?v=2.0.161').then(module=>{
      if(disposed||serial!==ticket||!wanted())return;
      // Start only after all dependencies loaded; failed setup is fully reversible.
      root.dataset.cwHalloween='on';
      const next=module.createHalloweenScene({win,getContext,ambient,getClawdState,prefs});
      scene=next;
      try{next.install();setRig(next.rig);refresh();}
      catch(error){next.destroy();scene=null;root.removeAttribute('data-cw-halloween');setRig(null);throw error;}
    }).catch(error=>{if(ticket===serial){failed=true;subscriptions.splice(0).forEach(f=>f());root.removeAttribute('data-cw-halloween');mountSettings();win.console.warn('[Claude Web] 万圣节装饰未启用，已恢复普通外观。',error);}}).finally(()=>{if(ticket===serial)pending=null;});
    return pending;
  }
  const observer=new win.MutationObserver(()=>{sync();});
  observer.observe(root,{attributes:true,attributeFilter:['data-claude-enabled','data-claude-motion','data-claude-decorations','data-claude-integrated-theme','data-cw-v4-settings']});
  const api={sync,preview,get enabled(){return !!scene;},positionClawd:state=>scene?.positionClawd(state),captureDelete:node=>scene?.captureDelete(node),finishDelete:token=>scene?.finishDelete(token),
    stats:()=>({enabled:!!scene,loading:!!pending,subscriptions:subscriptions.length,...scene?.stats()}),
    async setEnabled(value){failed=false;prefs.setItem('claude-web:halloween',value?'on':'off');await sync();},
    destroy(){if(disposed)return;disposed=true;serial++;pending=null;observer.disconnect();listeners.splice(0).forEach(f=>f());subscriptions.splice(0).forEach(f=>f());scene?.destroy();scene=null;settings?.remove();holidaySection?.remove();root.removeAttribute('data-cw-halloween');setRig(null);}
  };
  return api;
}
