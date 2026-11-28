/* Presentation adapters. Native nodes, handlers, lists and provider ancestors remain live. */
export function createMorePages(h) {
  const {win,make,button,icon,get,move,cleanup,created,state,act,menu,setting,t,L}=h,doc=win.document,firstFrames=new Set();
  function characters(panel){
    const page=panel.querySelector('#rm_characters_block>.cw-v4-drawer-page');if(!page)return;
    const s=state(page);
    const filters={filterByFavorites:'收藏',filterByGroups:'群组',filterByFolder:'文件夹',manageTags:'管理标签',showTagList:'标签',clearAllFilters:'清除筛选'};
    const glyphs={filterByGroups:'users',filterByFolder:'folder',manageTags:'gear'};
    for(const tag of page.querySelectorAll('.cw-v4-tags .tag')){
      const key=Object.keys(filters).find(name=>tag.classList.contains(name));
      if(!key)continue;
      if(!tag.querySelector('.cwr-filter-label'))tag.append(created(s,make('span','cwr-filter-label',L(filters[key]))));
      if(glyphs[key]&&!tag.querySelector('.cw2-char-filter-icon')){
        const symbol=created(s,icon(glyphs[key]));
        symbol.classList.add('cw2-char-filter-icon');
        tag.prepend(symbol);
      }
    }
    for(const filters of page.querySelectorAll('.cw2-char-filters .rm_tag_filter')){
      const manage=filters.querySelector('.manageTags');
      if(manage&&manage!==filters.lastElementChild){
        const st=state(manage);
        move(st,manage,filters);
      }
    }
    for(const card of page.querySelectorAll('.character_select,.group_select')){const star=card.querySelector('.ch_fav_icon,.group_fav_icon'),name=card.querySelector('.character_name_block');if(star&&name&&star.parentElement!==name)move(state(card),star,name);
      const tags=card.matches('.character_select')&&card.querySelector('.tags_inline');
      if(tags&&name&&!name.contains(tags))move(state(card),tags,name);
      if(card.matches('.group_select')){const n=Number(card.querySelector('.group_select_counter')?.textContent.match(/\d+/)?.[0]);const multi=n>1;if(card.classList.contains('cwr-group-multi')!==multi)card.classList.toggle('cwr-group-multi',multi);const cs=state(card);if(!cs.round4Group){cs.round4Group=true;cleanup(cs,()=>card.classList.remove('cwr-group-multi'));}let meta=card.querySelector('.cwr-group-summary');if(!meta){meta=created(cs,make('p','cwr-group-summary'));card.querySelector('.group_select_container')?.append(meta);}const label=Number.isFinite(n)?t(`群组 · ${n} 个角色`,`Group · ${n} characters`):t('群组','Group');if(meta.textContent!==label)meta.textContent=label;}
    }
    for(const folder of page.querySelectorAll('.bogus_folder_select:not(.bogus_folder_select_back)')){
      const container=folder.querySelector('.character_select_container');
      if(!container)continue;
      const count=folder.querySelector('.bogus_folder_counter')?.textContent.match(/\d+/)?.[0];
      let meta=container.querySelector('.cwr-folder-summary');
      if(!meta){
        meta=created(state(folder),make('p','cwr-group-summary cwr-folder-summary'));
        container.append(meta);
      }
      const label=count===undefined?t('标签','Tag'):t(`标签 · ${count} 个角色`,`Tag · ${count} characters`);
      if(meta.textContent!==label)meta.textContent=label;
    }
    const list=page.querySelector('#rm_print_characters_block');
    if(!list)return;
    const back=list.querySelector(':scope>.bogus_folder_select_back');
    const name=back?.querySelector('.ch_name');
    if(name&&!name.nextElementSibling?.matches('.cwr-folder-back-label')){
      name.after(created(state(back),make('span','cwr-folder-back-label',t('返回上一级','Go up one level'))));
      const avatar=back.querySelector(':scope>.avatar');
      if(avatar)avatar.append(created(state(back),icon('chevl')));
    }
    // ST rebuilds this list and its hidden-count row together. Read the count
    // from the current render so a subsequent folder never inherits it.
    const hidden=back&&list.querySelector(':scope>.hidden_block p');
    const section=list.closest('.cw-v4-section')||list;
    let note=section.nextElementSibling;
    if(!note?.matches('.cwr-folder-hidden-note')){
      if(!hidden)return;
      note=created(s,make('p','cwr-folder-hidden-note'));
      section.after(note);
    }
    note.hidden=!hidden;
    if(hidden&&note.textContent!==hidden.textContent)note.textContent=hidden.textContent;
  }
  function backgrounds(panel){
    const page=panel.querySelector(':scope>.cw-v4-drawer-page');if(!page)return;const s=state(page);
    if(!s.morePages){s.morePages=true;const first=page.querySelector('.cw-v4-section'),r=first?.querySelector('.cw-v4-row'),head=created(s,make('div','cwr-list-head')),actions=make('div','cwr-list-actions');head.append(make('h2','',L('背景')),actions);if(r){for(const n of [...r.querySelector('.cw-v4-row-controls').children])move(s,n,actions);r.hidden=true;}page.prepend(head);
      const tabs=get('bg_tabs'),bar=page.querySelector('.cw-v4-bar');if(tabs&&bar){move(s,bar,tabs,tabs.querySelector('.bg_tabs_list')?.nextSibling);bar.classList.add('cwr-bg-search');cleanup(s,()=>bar.classList.remove('cwr-bg-search'));}
    }
    for(const tile of panel.querySelectorAll('.bg_example')){const ts=state(tile),title=tile.querySelector('.thumbnail-clipper>.BGSampleTitle');if(title)move(ts,title,tile);}
  }
  // v2d 补充：API 状态行第二行「模型名 · 地址」。地址取当前来源实际在用的端点：自定义来源的端点，其余来源填了反向代理就用代理地址；
  // 都没有（官方地址）就不显示。只留主机和路径，去掉用户名密码、查询参数和 # 后面（密钥可能在里面）。
  function endpoint(source){
    const raw=(source==='custom'?get('custom_api_url_text')?.value:get('openai_reverse_proxy')?.value)||'';const v=raw.trim();if(!v)return '';
    try{const u=new win.URL(v);return (u.host+u.pathname).replace(/\/+$/,'');}catch{return v.split(/[?#]/)[0].replace(/^[a-z]+:\/\//i,'').replace(/^[^/@]*@/,'').replace(/\/+$/,'');}
  }
  const textModelIds={
    aphrodite:'aphrodite_model',dreamgen:'model_dreamgen_select',featherless:'featherless_model',
    generic:'generic_model_textgenerationwebui',infermaticai:'model_infermaticai_select',
    llamacpp:'llamacpp_model',mancer:'mancer_model',ollama:'ollama_model',
    ooba:'custom_model_textgenerationwebui',openrouter:'openrouter_model',tabby:'tabby_model',
    togetherai:'model_togetherai_select',vllm:'vllm_model',
  };
  function activeModel(api,source){
    if(api==='koboldhorde')return get('horde_model');
    if(api==='novel')return get('model_novel_select');
    if(api==='textgenerationwebui')return get(textModelIds[get('textgen_type')?.value]);
    if(api==='openai'){
      const direct=get(source==='custom'?'custom_model_id':'model_'+source+'_select');
      return direct||[...get('openai_api')?.querySelectorAll('select[id*="model"],input[id*="model"]')||[]].find(n=>n.checkVisibility());
    }
  }
  function modelLabel(model){
    if(!model?.selectedOptions)return model?.value?.trim()||'';
    return [...model.selectedOptions].filter(o=>!o.disabled&&o.value.trim()).map(o=>o.textContent.trim()||o.value.trim()).join(', ');
  }
  function api(panel){
    const connect=get('api_button_openai'),connection=connect?.closest('.cw-v4-section'),ps=state(panel);
    if(connection&&!ps.moreApi){ps.moreApi=true;let frame=0;const refresh=()=>{win.cancelAnimationFrame(frame);frame=win.requestAnimationFrame(()=>api(panel));};panel.addEventListener('input',refresh);panel.addEventListener('change',refresh);ps.modelObserver=new win.MutationObserver(refresh);cleanup(ps,()=>{ps.modelObserver.disconnect();win.cancelAnimationFrame(frame);panel.removeEventListener('input',refresh);panel.removeEventListener('change',refresh);});for(const [id,label,desc]of [['openai_bypass_status_check','绕过 API 状态检查','接口不支持状态检查时打开'],['openai_show_external_models','显示外部模型','由 API 提供']])setting(ps,connection,id,label,desc);
      const info=connect.closest('.cw-v4-row')?.querySelector('.cw-v4-row-info'),status=info?.querySelector('.online_status')||get('openai_api')?.querySelector(':scope>.online_status');if(status&&info){if(!info.contains(status))move(ps,status,info);info.querySelector('.cw-v4-row-title')?.setAttribute('hidden','');}
      const extra=get('customize_additional_parameters'),more=connect.closest('.cw-v4-row')?.querySelector('.cw-v4-more');if(extra&&more){const item=created(ps,button(L('附加参数'),()=>{more.open=false;extra.click();},'cw-v4-more-item'));more.querySelector('.cw-v4-more-list').prepend(item);move(ps,extra,more.querySelector('.cw-v4-more-park'));}
    }
    for(const row of panel.querySelectorAll('.cw-v4-api-row,.cw-v4-api-inline-row')){
      if(!row.classList.contains('cwr-api-field')&&(row.querySelector('input:not([type=checkbox]):not([type=hidden]),textarea')||row.querySelector('select[id*="model"],#custom_prompt_post_processing'))){row.classList.add('cwr-api-field');cleanup(state(row),()=>row.classList.remove('cwr-api-field'));}
      const label=row.querySelector('.cw-v4-api-label'),steps=label?.querySelector('ol');if(steps&&!row.querySelector('.cwr-api-help')){const s=state(row),details=created(s,make('details','cwr-api-help')),summary=make('summary','',L('获取密钥说明'));details.append(summary);move(s,steps,details);label.append(details);}
    }
    const status=connect?.closest('.cw-v4-row')?.querySelector('.cw-v4-row-info');
    if(!status)return;
    let info=status.querySelector('.cwr-connection-model');
    if(!info){info=created(ps,make('p','cwr-connection-model'));status.append(info);}
    const main=get('main_api')?.value,source=get('chat_completion_source')?.value;
    const model=activeModel(main,source);
    if(ps.modelObserver&&ps.statusModel!==model){
      ps.modelObserver.disconnect();
      ps.statusModel=model;
      if(model?.selectedOptions)ps.modelObserver.observe(model,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['selected','disabled','value','label']});
    }
    const value=[modelLabel(model),main==='openai'?endpoint(source):''].filter(Boolean).join(' · ');
    if(info.textContent!==value)info.textContent=value;
    if(info.title!==value)info.title=value;
  }
  return {sync(panel){if(panel.id==='right-nav-panel')characters(panel);if(panel.id==='Backgrounds')backgrounds(panel);if(panel.id==='rm_api_block')api(panel);
    firstHeading(panel);
  }};
  // checkVisibility() forces a full style recalc. During sync the drawer is still
  // being rebuilt, so the check ran on dirty styles and the frame recalculated
  // everything again. A ResizeObserver's first callback runs in this same frame
  // after style and layout are clean and before paint: the read is cheap and no
  // frame is painted without the class.
  function firstHeading(panel){
    if(firstFrames.has(panel))return;
    const check=()=>{firstFrames.delete(panel);if(!panel.isConnected||!doc.documentElement.hasAttribute('data-cw-settings-unified'))return;
      const heading=[...panel.querySelectorAll('.cw-v4-section>h2')].find(n=>n.checkVisibility());
      for(const old of panel.querySelectorAll('.cwr-first-heading'))if(old!==heading){old.classList.remove('cwr-first-heading');old.parentElement?.classList.remove('cwr-first-section');}
      if(heading&&!heading.classList.contains('cwr-first-heading')){heading.classList.add('cwr-first-heading');const sec=heading.parentElement;sec.classList.add('cwr-first-section');const hs=state(heading);if(!hs.firstHeading){hs.firstHeading=true;cleanup(hs,()=>{heading.classList.remove('cwr-first-heading');sec.classList.remove('cwr-first-section');});}}
    };
    if(!win.ResizeObserver){firstFrames.add(panel);win.requestAnimationFrame(check);return;}
    const ro=new win.ResizeObserver(()=>{ro.disconnect();check();});firstFrames.add(panel);ro.observe(panel);
  }
}
