import { preferencesFor } from './preferences.js?v=2.0.160';

// Lightweight lifecycle. Artwork, rig and animation code are fetched only on enable.
export function installHalloween({win, getContext, setRig, refresh}) {
  const doc=win.document, root=doc.documentElement, prefs=preferencesFor(win);
  let disposed=false, serial=0, scene=null, pending=null, settings=null,failed=false;
  const listeners=[], subscriptions=[];
  const wanted=()=>prefs.getItem('claude-web:halloween')==='on'&&root.dataset.claudeEnabled!=='off';
  const ambient=()=>prefs.getItem('claude-web:halloween-ambient')!=='off';
  const on=(target,type,fn,opts)=>{target.addEventListener(type,fn,opts);listeners.push(()=>target.removeEventListener(type,fn,opts));};
  function mountSettings() {
    const host=doc.querySelector('#claude-web-full-appearance');
    if(!host)return;
    if(!settings){
      settings=doc.createElement('div');settings.className='cw-halloween-settings claude-web-field';
      settings.setAttribute('role','group');settings.setAttribute('aria-labelledby','cw-halloween-title');
      settings.innerHTML='<div class="claude-web-field"><div class="claude-web-section-summary" id="cw-halloween-title">万圣节</div></div><label class="checkbox_label claude-web-check"><input type="checkbox" id="claude-web-halloween"><span>万圣节装饰</span></label><label class="checkbox_label claude-web-check"><input type="checkbox" id="claude-web-halloween-ambient" aria-describedby="cw-halloween-ambient-help"><span>环境小动作</span></label><div class="claude-web-help" id="cw-halloween-ambient-help">随机床单 Clawd 和闲置装饰；系统减少动态效果优先。</div><small class="claude-web-help cw-halloween-status" role="status"></small>';
      on(settings,'change',e=>{const key=e.target.id==='claude-web-halloween'?'halloween':e.target.id==='claude-web-halloween-ambient'?'halloween-ambient':null;if(!key)return;prefs.setItem('claude-web:'+key,e.target.checked?'on':'off');sync();});
    }
    if(settings.parentNode!==host)host.append(settings);
    settings.querySelector('#claude-web-halloween').checked=prefs.getItem('claude-web:halloween')==='on';
    const small=settings.querySelector('#claude-web-halloween-ambient');small.checked=ambient();small.disabled=!wanted();
    const help=settings.querySelector('#cw-halloween-ambient-help'),hint=wanted()?'随机床单 Clawd 和闲置装饰；系统减少动态效果优先。':'先开启万圣节装饰，才能使用环境小动作。';if(help.textContent!==hint)help.textContent=hint;
    const note=settings.querySelector('.cw-halloween-status'),message=failed?'万圣节资源暂未加载成功，已使用普通外观；刷新后可重试。':'';if(note.textContent!==message)note.textContent=message;
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
    pending=import('./halloween-scene.js?v=2.0.160-halloween2').then(module=>{
      if(disposed||serial!==ticket||!wanted())return;
      // Start only after all dependencies loaded; failed setup is fully reversible.
      root.dataset.cwHalloween='on';
      const next=module.createHalloweenScene({win,getContext,ambient});
      scene=next;
      try{next.install();setRig(next.rig);refresh();}
      catch(error){next.destroy();scene=null;root.removeAttribute('data-cw-halloween');setRig(null);throw error;}
    }).catch(error=>{if(ticket===serial){failed=true;subscriptions.splice(0).forEach(f=>f());root.removeAttribute('data-cw-halloween');mountSettings();win.console.warn('[Claude Web] 万圣节装饰未启用，已恢复普通外观。',error);}}).finally(()=>{if(ticket===serial)pending=null;});
    return pending;
  }
  const observer=new win.MutationObserver(()=>{sync();});
  observer.observe(root,{attributes:true,attributeFilter:['data-claude-enabled','data-claude-motion','data-claude-decorations','data-claude-integrated-theme','data-cw-v4-settings']});
  const api={sync,get enabled(){return !!scene;},positionClawd:()=>scene?.positionClawd(),captureDelete:node=>scene?.captureDelete(node),finishDelete:token=>scene?.finishDelete(token),
    stats:()=>({enabled:!!scene,loading:!!pending,subscriptions:subscriptions.length,...scene?.stats()}),
    async setEnabled(value){failed=false;prefs.setItem('claude-web:halloween',value?'on':'off');await sync();},
    destroy(){if(disposed)return;disposed=true;serial++;pending=null;observer.disconnect();listeners.splice(0).forEach(f=>f());subscriptions.splice(0).forEach(f=>f());scene?.destroy();scene=null;settings?.remove();root.removeAttribute('data-cw-halloween');setRig(null);}
  };
  return api;
}
