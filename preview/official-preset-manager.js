import { newFeature } from './new-features.js?v=2.0.168';
/* Whole-preset management. Rendering reads the native select only; mutations use ST. */
export function createPresetManagerPage({win,t,make,button,icon,move,cleanup,created}) {
  const doc=win.document,discovery=newFeature({win,make,t},'preset-manager');let ui=null;
  const native=()=>doc.getElementById('settings_preset_openai');
  const context=()=>win.SillyTavern?.getContext?.();
  const options=()=>[...(native()?.options||[])].filter(o=>!o.disabled&&o.value!=='');
  const protectedPreset=o=>o.textContent.trim()==='Default'||o.value==='gui';
  const selectedName=()=>native()?.selectedOptions[0]?.textContent.trim()||'';
  const profiles=()=>context()?.extensionSettings?.connectionManager?.profiles||[];
  const sensitive=['reverse_proxy','proxy_password','custom_url','custom_include_body','custom_exclude_body','custom_include_headers','vertexai_region','vertexai_express_project_id','azure_base_url','azure_deployment_name','workers_ai_account_id'];
  const text=(n,v)=>{if(n.textContent!==v)n.textContent=v;};
  async function exportNames(names){
    const [m,u,p]=await Promise.all([import('/scripts/openai.js'),import('/scripts/utils.js'),import('/scripts/popup.js')]);
    const values=names.map(name=>{const value=m.openai_settings[m.openai_setting_names[name]];if(!value)throw Error(t(`找不到预设「${name}」`,`Preset not found: ${name}`));return {name,preset:structuredClone(value)};});
    let strip=false;
    if(values.some(v=>sensitive.some(k=>v.preset[k]))){const result=await p.Popup.show.confirm(t('导出前移除敏感字段？','Remove sensitive fields before export?'),t('所选预设中包含代理或自定义端点设置。是否在这一批文件中移除这些字段？','Some selected presets contain proxy or custom endpoint settings. Remove these fields from this batch?'),{customButtons:[{text:t('取消导出','Cancel export'),result:p.POPUP_RESULT.CANCELLED,appendAtEnd:true}]});if(result===p.POPUP_RESULT.CANCELLED)return false;strip=result===p.POPUP_RESULT.AFFIRMATIVE;}
    for(const {name,preset}of values){if(strip)for(const k of sensitive)delete preset[k];
      // Match the native export dialog's default: do not include connection data.
      for(const [,key,,connection]of Object.values(m.settingsToUpdate))if(connection)delete preset[key];
      const c=context();await c?.eventSource?.emit(c.eventTypes.OAI_PRESET_EXPORT_READY,preset);
      u.download(JSON.stringify(preset,null,4),name+'.json','application/json');}
    return true;
  }
  function confirmDelete(names){return new Promise(resolve=>{
    const d=make('dialog','cwr-confirm'),head=make('h2','',t(`删除 ${names.length} 个预设？`,`Delete ${names.length} presets?`)),list=make('div','cwr-confirm-names'),warn=make('div','cwr-warnings');
    // This CW dialog is outside the native drawer; keep its clicks from ST's
    // outside-click handler, including the click that removes the dialog.
    for(const type of ['click','mousedown','touchstart'])d.addEventListener(type,e=>e.stopPropagation());
    d.append(head,make('p','cwr-muted',t('删除以后不能撤销','This cannot be undone')),list);
    for(const name of names)list.append(make('div','',name));
    const current=selectedName();if(names.includes(current))warn.append(make('p','',t(`「${current}」正在使用，删除后会换成 Default`,`“${current}” is active. It will switch to Default.`)));
    for(const p of profiles())if(names.includes(p.preset))warn.append(make('p','',t(`连接配置「${p.name}」用的是「${p.preset}」，删掉以后切到这个配置时就找不到预设了。`,`Connection profile “${p.name}” uses “${p.preset}”. This preset will be missing when you switch to that profile.`)));
    if(warn.childElementCount)d.append(warn);
    const backup=make('label','cwr-backup'),check=make('input','');check.type='checkbox';check.checked=false;backup.append(check,make('span','',t('删除前先导出一份备份','Export a backup before deleting')));d.append(backup);
    const actions=make('div','cwr-confirm-actions');let settled=false;
    const done=v=>{if(settled)return;settled=true;d.close();d.remove();resolve(v);};
    actions.append(button(t('取消','Cancel'),()=>done(null),'cwr-btn'),button(t('删除','Delete'),()=>done({backup:check.checked}),'cwr-btn cwr-danger-primary'));d.append(actions);d.addEventListener('cancel',e=>{e.preventDefault();done(null)});doc.body.append(d);d.showModal();
  });}
  async function removeSelected(){if(!ui||ui.busy)return;const current=ui,names=options().filter(o=>!protectedPreset(o)&&ui.selected.has(o.textContent.trim())).map(o=>o.textContent.trim());if(!names.length)return;
    const consent=await confirmDelete(names);if(!consent||ui!==current)return;current.busy=true;paint();const removed=[];let failed=null,switched=false;
    try{if(consent.backup&&!await exportNames(names))return;
      const {getPresetManager}=await import('/scripts/preset-manager.js'),manager=getPresetManager('openai');if(!manager)throw Error(t('酒馆没有提供预设管理接口','The native preset manager is unavailable'));
      if(names.includes(selectedName())){const def=options().find(o=>o.textContent.trim()==='Default');if(!def)throw Error(t('找不到 Default，已停止删除','Default is missing. Deletion stopped.'));native().value=def.value;win.jQuery(native()).trigger('change');
        const deadline=Date.now()+5000;while(selectedName()!=='Default'||(context()?.oaiSettings?.preset_settings_openai&&context().oaiSettings.preset_settings_openai!=='Default')){if(Date.now()>deadline)throw Error(t('原生未能切换到 Default，已停止删除','The native UI did not switch to Default. Deletion stopped.'));await new Promise(r=>win.setTimeout(r,20));}switched=true;}
      for(const name of names){failed=name;const ok=await manager.deletePreset(name);if(ok!==true)throw Error(t(`删除「${name}」失败`,`Failed to delete “${name}”`));removed.push(name);current.selected.delete(name);failed=null;}
      current.selected.clear();const msg=t(`已删除 ${removed.length} 个预设${switched?'，已换成 Default':''}${consent.backup?'，备份已下载':''}`,`Deleted ${removed.length} presets${switched?'; switched to Default':''}${consent.backup?'; backup downloaded':''}`);text(current.status,msg);win.toastr?.success?.(msg);
    }catch(e){if(failed){current.selected.delete(failed);current.reload.hidden=false;text(current.reloadText,t(`${removed.length?`已删除 ${removed.length} 个。`:''}「${failed}」没有删成（服务器返回错误），它可能还在。刷新页面后列表会恢复正确。`,`${removed.length?`Deleted ${removed.length}. `:''}“${failed}” was not deleted (server error) and may still exist. Reload the page to restore the correct list.`));}const remaining=names.filter(n=>!removed.includes(n)&&n!==failed),msg=t(`已删除：${removed.join('、')||'无'}；${failed?`「${failed}」失败；`:''}剩下未动：${remaining.join('、')||'无'}。${e.message}`,`Deleted: ${removed.join(', ')||'none'}. ${failed?'Failed: '+failed+'. ':''}Not attempted: ${remaining.join(', ')||'none'}. ${e.message}`);text(current.status,msg);current.status.setAttribute('role','alert');win.toastr?.error?.(msg);
    }finally{current.busy=false;paint();}
  }
  function paint(){if(!ui)return;const u=ui,all=options(),query=u.search.value.trim().toLocaleLowerCase(),rows=all.filter(o=>o.textContent.toLocaleLowerCase().includes(query));u.list.replaceChildren();
    for(const o of rows){const name=o.textContent.trim(),locked=protectedPreset(o),active=name===selectedName(),chosen=u.selected.has(name),r=make('div','cwr-preset-row'+(locked?' cwr-disabled':'')+(chosen?' cwr-picked':'')),check=make('input','cwr-check');check.type='checkbox';check.checked=chosen;check.disabled=locked||u.busy;check.setAttribute('aria-label',t(`选择${name}`,`Select ${name}`));
      const set=()=>{if(locked||u.busy)return;chosen?u.selected.delete(name):u.selected.add(name);paint();};check.addEventListener('change',set);r.addEventListener('click',e=>{if(e.target.closest('button,input'))return;set();});
      const info=make('div','cwr-row-info'),meta=make('div','cwr-meta'),uses=profiles().filter(p=>p.preset===name).map(p=>t(`连接配置「${p.name}」在用`,`Used by “${p.name}”`));if(active)meta.append(make('span','cwr-pill',t('使用中','In use')));if(uses.length)meta.append(make('span','',uses.join(' · ')));if(locked)meta.append(make('span','',t('酒馆自带，不能删','Built in; cannot delete')));info.append(make('div','cwr-name',name),meta);r.append(check,info);
      if(!active){const swap=button(t('切换','Switch'),e=>{e.stopPropagation();if(u.busy)return;native().value=o.value;win.jQuery(native()).trigger('change');paint();},'cwr-btn cwr-sm');swap.disabled=u.busy;r.append(swap);}u.list.append(r);}
    u.empty.hidden=rows.length>0;const count=u.selected.size;u.bar.hidden=!count;text(u.count,t(`已选 ${count} 个`,`${count} selected`));for(const b of u.bar.querySelectorAll('button'))b.disabled=u.busy;text(u.headTitle,count?t(`已选 ${count} 个`,`${count} selected`):t('全部预设','All presets'));
    for(const h of doc.querySelectorAll('.cwr-preset-cnt'))text(h,t(`${all.length} 个`,`${all.length}`));
  }
  function close(){if(!ui)return;ui.panel.classList.remove('cwr-presets-open');ui.page.remove();ui.mobileHead.remove();ui.select.removeEventListener('change',ui.onChange);ui.observer.disconnect();ui=null;}
  function open(panel){discovery.seen();close();const page=make('section','cwr-subpage'),head=make('div','cwr-page-heading'),title=make('h2','',t('全部预设','All presets')),back=button('',close,'cwr-back');back.append(icon('chevl'),make('span','',t('预设','Presets')));head.append(title,button(t('导入','Import'),()=>doc.getElementById('import_oai_preset')?.click(),'cwr-btn'));
    const tools=make('div','cwr-tools'),search=make('input','cwr-search');search.type='search';search.placeholder=t('搜索预设','Search presets');const list=make('div','cwr-card cwr-preset-list'),empty=make('p','cwr-empty',t('没有匹配的预设','No matching presets')),status=make('p','cwr-status'),bar=make('div','cwr-selection-bar'),count=make('span',''),mobileHead=make('div','cwr-mobile-head'),headTitle=make('h1','');status.setAttribute('role','status');
    const all=()=>{if(ui.busy)return;const available=options().filter(o=>!protectedPreset(o)&&o.textContent.toLocaleLowerCase().includes(search.value.trim().toLocaleLowerCase())),every=available.length&&available.every(o=>ui.selected.has(o.textContent.trim()));for(const o of available)every?ui.selected.delete(o.textContent.trim()):ui.selected.add(o.textContent.trim());paint();};const searchBox=make('label','cwr-search-box');searchBox.append(icon('search'),search);tools.append(searchBox,button(t('全选','Select all'),all,'cwr-btn cwr-desktop-only'));
    mobileHead.append(button(t('‹ 预设','‹ Presets'),close,'cwr-head-back'),headTitle,button(t('全选','Select all'),all,'cwr-head-action'));
    bar.append(count,button(t('取消','Cancel'),()=>{ui.selected.clear();paint()},'cwr-btn cwr-ghost'),button(t('导出','Export'),()=>exportNames([...ui.selected]).catch(e=>win.toastr?.error?.(e.message)),'cwr-btn'),button(t('删除','Delete'),removeSelected,'cwr-btn cwr-danger'));
    const reload=make('div','cwr-reload reload'),reloadText=make('span','');reload.hidden=true;reload.setAttribute('role','alert');reload.append(reloadText,button(t('现在刷新','Reload now'),()=>win.location.reload(),'cwr-btn'));page.append(back,head,reload,make('p','cwr-lede',t('点一行就是勾选，勾了以后可以一起导出或删除。想直接换用某个预设，点右边的「切换」。','Select rows to export or delete together. Use “Switch” to use a preset.')),tools,list,empty,status,bar);panel.append(page);doc.querySelector('.cw-v4-shell .cw-v4-head')?.append(mobileHead);panel.classList.add('cwr-presets-open');panel.scrollTop=0;
    ui={panel,page,list,empty,status,bar,count,search,reload,reloadText,mobileHead,headTitle,selected:new Set(),select:native(),busy:false,onChange:()=>paint()};ui.observer=new win.MutationObserver(paint);ui.observer.observe(ui.select,{childList:true});ui.select.addEventListener('change',ui.onChange);search.addEventListener('input',paint);paint();
  }
  const svgIcon=paths=>{const n=doc.createElementNS('http://www.w3.org/2000/svg','svg');n.setAttribute('viewBox','0 0 24 24');n.setAttribute('fill','none');n.setAttribute('stroke','currentColor');n.setAttribute('stroke-width','1.7');n.setAttribute('stroke-linecap','round');n.setAttribute('stroke-linejoin','round');n.setAttribute('aria-hidden','true');n.innerHTML=paths;return n;};
  const LIST='<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>';
  function header(s,group,select,controls){
    const [save,more]=controls;
    const cur=make('div','cw2 cw2-bar cw2-mbar cwp-bar');
    const title=make('h2','',t('预设','Presets'));
    const host=make('span','cwr-select-host');
    if(select)move(s,select,host);
    cur.append(title,host);
    if(save)move(s,save,cur);
    if(more)move(s,more,cur);

    const list=more?.querySelector('.cw-v4-more-list');
    if(list){
      const all=button('',()=>{more.open=false;open(doc.getElementById('left-nav-panel'));},'cw-v4-more-item cwr-preset-all');
      const count=make('span','cwr-preset-cnt');
      all.append(svgIcon(LIST),make('span','',t('全部预设','All presets')),count,discovery.badge);
      const line=make('hr','cwr-pop-hr');
      const bind=doc.getElementById('bind_preset_to_connection');
      const bindMobile=button(t('绑定到 API 连接','Bind to API connection'),()=>{bind?.click();paintCount();},'cw-v4-more-item cwp-bind-menu');
      const paintCount=()=>{
        text(count,t(`${options().length} 个`,`${options().length}`));
        bindMobile.setAttribute('aria-pressed',String(!!bind?.checked));
      };
      list.prepend(all,line);
      if(bind){
        const binding=make('label','cwp-bind',t('绑定到 API 连接','Bind to API connection'));
        move(s,bind,binding);
        cur.append(binding);
        line.before(bindMobile);
        bind.addEventListener('change',paintCount);
        cleanup(s,()=>bind.removeEventListener('change',paintCount));
      }
      paintCount();
      const sel=native();
      if(sel){
        const observer=new win.MutationObserver(paintCount);
        observer.observe(sel,{childList:true});
        cleanup(s,()=>observer.disconnect());
      }
    }
    group.classList.add('cwp-header');
    group.append(cur);
    cleanup(s,close);
    return cur;
  }
  return {header,close,sync:panel=>{if(ui&&panel!==ui.panel)close();for(const h of doc.querySelectorAll('.cwr-preset-cnt'))text(h,t(`${options().length} 个`,`${options().length}`));},destroy:close};
}
