import { watchTokens, tokenText } from './token-count.js?v=2.0.168';
/* The five formatting tabs and the live persona editor use original ST controls. */
export function createInterfaceRefinements(h) {
  const {win,t,L,make,button,icon,get,begin,finish,restorePanel,section,row,move,cleanup,created,act,menu,tg,sel,num,txt,presetRow,showToggle,openEditor}=h;
  const doc=win.document,registry=new Map();let mobileHead=null,headOwner=null;
  const text=(n,v)=>{if(n&&n.textContent!==v)n.textContent=v;};
  const ctx=()=>win.SillyTavern?.getContext?.();
  const mobile=()=>win.innerWidth<=700||doc.documentElement.dataset.claudeLayout==='mobile';
  function selectIcons(s,root){for(const n of root.querySelectorAll('select:not([multiple]):not(.select2-hidden-accessible)')){if(n.parentElement.classList.contains('cwr-select-host'))continue;const box=make('span','cwr-select-host');n.before(box);move(s,n,box);box.append(icon('chevd'));s.created.push(box);}}
  function pageHead(s,page,title,items,plus){const head=make('div','cwr-page-heading'),name=make('h2','',L(title));head.append(name);if(plus)move(s,plus,head);if(items?.length)head.append(menu(s,items));page.prepend(head);registry.set(s.root,{s,title,items,plus});cleanup(s,()=>{registry.delete(s.root);if(headOwner===s.root){mobileHead?.remove();mobileHead=null;headOwner=null;}});return head;}
  function syncHeader(panel){const spec=registry.get(panel);if(!spec||!panel.classList.contains('openDrawer')||panel.classList.contains('cw-v4-inactive')||!mobile()){if(headOwner&&(!mobile()||headOwner!==panel)){mobileHead?.remove();mobileHead=null;headOwner=null;}return;}
    if(headOwner===panel&&mobileHead?.isConnected)return;mobileHead?.remove();mobileHead=make('div','cwr-mobile-head');const left=button('',()=>doc.querySelector('.cw-v4-shell .cw-v4-menu')?.click(),'cwr-head-action');left.append(icon('menu'));mobileHead.append(left,make('h1','',L(spec.title)));const right=make('div','cwr-head-tools');if(spec.plus){const b=button('',()=>spec.plus.click(),'cwr-head-action');b.append(icon('plus'));right.append(b);}if(spec.items?.length)right.append(menu(spec.s,spec.items.map(([label,el,danger,run])=>[label,null,danger,run||(()=>el?.click())])));mobileHead.append(right);doc.querySelector('.cw-v4-shell .cw-v4-head')?.append(mobileHead);headOwner=panel;
  }
  function card(host){const n=make('div','cwr-card');host.append(n);return n;}
  function title(host,label){const n=make('h3','cwr-section-title',L(label));host.append(n);return n;}
  function field(s,host,id,label,{hint='',expand=false,min=0,mono=false}={}){const n=get(id);if(!n)return null;const f=make('div','cwr-field'),line=make('div','cwr-field-label');line.append(make('label','',L(label)));line.firstChild.htmlFor=id;if(expand){const b=button('',()=>openEditor(n,L(label)),'cwr-btn cwr-sm');b.append(icon('expand'),make('span','',L('放大')));line.append(b);}f.append(line);if(hint)f.append(make('p','cwr-hint',L(hint)));move(s,n,f);n.classList.add('cwr-input');if(min)n.style.setProperty('--cwr-input-height',min+'px');if(/^(reasoning_(prefix|suffix|separator)|custom_stopping_strings)$/.test(id)&&n.tagName==='TEXTAREA'){n.classList.add('cwr-compact');let frame=0;const grow=()=>{if(!n.getClientRects().length)return;n.style.setProperty('--cwr-input-height','34px');n.style.setProperty('--cwr-input-height',Math.max(34,n.scrollHeight+2)+'px');};const request=()=>{win.cancelAnimationFrame(frame);frame=win.requestAnimationFrame(grow);};n.addEventListener('input',request);win.addEventListener('resize',request);const observer=new win.MutationObserver(request);observer.observe(host.closest('.cwr-tab-pane'),{attributes:true,attributeFilter:['hidden']});request();cleanup(s,()=>{win.cancelAnimationFrame(frame);observer.disconnect();n.removeEventListener('input',request);win.removeEventListener('resize',request);n.classList.remove('cwr-compact');});}if(mono)n.classList.add('cwr-mono');cleanup(s,()=>{n.classList.remove('cwr-input','cwr-mono');n.style.removeProperty('--cwr-input-height')});host.append(f);return f;}
  function pair(s,host,items){const grid=make('div','cwr-grid2');host.append(grid);for(const [id,label]of items)field(s,grid,id,label);return grid;}
  function fold(s,host,label,items){const d=make('details','cwr-fold'),sum=make('summary',''),count=make('span','cwr-fold-count'),body=card(d);sum.append(make('span','',L(label)),count,icon('chevd'));d.prepend(sum);host.append(d);for(const [id,name]of items)tg(s,body,get(id),name);const paint=()=>{const on=items.filter(([id])=>get(id)?.checked);text(count,t(`已开 ${on.length} 个：${on.map(([,n])=>L(n)).join('、')} · ${d.open?'收起':'展开'}`,`${on.length} enabled · ${d.open?'Collapse':'Expand'}`));};d.addEventListener('toggle',paint);body.addEventListener('change',paint);paint();return d;}
  /* 格式化 v2d（稿 design-settings-pages-v2d.html「格式化」，修改单第 3 节）：四个标签 上下文 / 格式指引 / 系统提示词 / 推理与其他。
     每个模板标签顶上一张模板工具条（模板 / 下拉 / 保存 / ⋯ / 总开关）；下面两栏（上下文 1.5 : 1，其余 1 : 1）。
     控件全是原生的，只搬位置；对话补全接口下前三个标签仍旧整体变灰（cwr-dim），提示改成标签行右边的胶囊（手机是提示条）。 */
  function formatting(panel){
    if(panel.hasAttribute('data-tt-assistant')||panel.querySelector('#tt-assistant')){
      restorePanel(panel);
      return;
    }
    const start=begin(panel);if(!start)return;const {s,page}=start;page.classList.add('cwr-page','cwr-formatting');panel.classList.add('cwr-interface-panel','cw2','cw2-fmt');cleanup(s,()=>panel.classList.remove('cwr-interface-panel','cw2','cw2-fmt'));
    const head=pageHead(s,page,'格式化',[['导入全部模板',get('af_master_import'),false,null,'imp'],['导出全部模板',get('af_master_export'),false,null,'exp']]);
    head.classList.add('cw2-bar');head.append(make('span','cw2-note',t('⋯ 里可以一次导入或导出本页所有模板','Use ⋯ to import or export every template on this page')));
    const tabrow=make('div','cw2-tabrow'),tabs=make('div','cwr-tabs cw2-tabs'),note=make('span','cw2-tabnote'),tip=make('div','cw2-tip');
    note.append(icon('info'),make('span','',t('现在用的是「对话补全」接口，这一页不生效','Chat Completion is in use; this tab has no effect')));tip.textContent=t('现在用的是「对话补全」接口，这一页不生效，酒馆会把它变灰。','Chat Completion is in use; this tab has no effect and is dimmed.');
    tabs.setAttribute('role','tablist');tabrow.append(tabs,note);page.append(tabrow,tip);
    const labels={ctx:'上下文',ins:'格式指引',sys:'系统提示词',misc:'推理与其他'},views=new Map(),buttons=new Map();let current='ctx';
    for(const key of Object.keys(labels)){const pane=make('section','cw2-pane');pane.dataset.tab=key;pane.setAttribute('role','tabpanel');views.set(key,pane);page.append(pane);
      const b=button(L(labels[key]),()=>{current=key;paint();},'cwr-tab');b.dataset.tab=key;b.setAttribute('role','tab');buttons.set(key,b);tabs.append(b);}
    const sec2=(host,label,cls='')=>{const n=section(host,label);if(cls)n.classList.add(...cls.split(' '));return n;};
    const cols2=(host,cls)=>{const g=make('div','cw2-cols '+cls),l=make('div','cw2-col'),r=make('div','cw2-col');g.append(l,r);host.append(g);return [l,r];};
    const fld=(host,id,label,o={})=>{const n=get(id);if(!n)return null;const f=make('div','cw2-field'+(o.cls?' '+o.cls:''));if(label){const lab=make('label','cw2-lab',L(label));lab.htmlFor=id;f.append(lab);}move(s,n,f);if(o.mono){n.classList.add('cw2-mono');cleanup(s,()=>n.classList.remove('cw2-mono'));}if(o.hint)f.append(make('p','cw2-hint',L(o.hint)));(host.querySelector(':scope>.cw-v4-card')||host).append(f);return f;};
    const zoom=(sec,id,label)=>{const n=get(id);if(!n)return;const b=button('',()=>openEditor(n,L(label)),'cw2-link');b.append(icon('expand'),make('span','',L('放大')));sec.querySelector(':scope>h2')?.append(b);};
    // F9 手机：一行预览 + ›，点进去整页编辑（openEditor 在手机上就是整页）。
    const preview=(sec,id,label)=>{const n=get(id);if(!n)return;const r=button('',()=>openEditor(n,L(label)),'cw2-prev');const tx=make('span','cw2-prev-t');r.append(make('span','cw2-prev-n',L(label)),tx,icon('chev'));const paintPrev=()=>{const v=(n.value||'').replace(/\s+/g,' ').trim()||t('（空）','(Empty)');if(tx.textContent!==v)tx.textContent=v;};n.addEventListener('input',paintPrev);cleanup(s,()=>n.removeEventListener('input',paintPrev));paintPrev();(s.prevPaints||=[]).push(paintPrev);sec.querySelector(':scope>.cw-v4-card').prepend(r);};
    // F4 模板工具条：模板 / 下拉 260 / 保存 / ⋯（只放原生有的操作）/ 最右总开关。
    const toolbar=(host,select,kind,toggleId,toggleLabel)=>{if(!select)return null;const c=make('div','cw-v4-card cw2-tb');host.append(c);
      const B=a=>panel.querySelector(`[data-preset-manager-${a}="${kind}"]`);
      const r=make('div','cw-v4-row cw2-tbrow'),g=make('div','cw-v4-row-controls cw2-tbg');r.append(make('span','cw2-tbl',L('模板')),g);c.append(r);
      select.classList.add('cw-v4-preset-sel');cleanup(s,()=>select.classList.remove('cw-v4-preset-sel'));move(s,select,g);
      const save=act(s,B('update'),'保存');if(save)move(s,save,g);
      const m=menu(s,[['改名',B('rename'),false,null,'pencil'],['另存为新的',B('new'),false,null,'copy'],'-',['导入',B('import'),false,null,'imp'],['导出',B('export'),false,null,'exp'],['恢复默认',B('restore'),false,null,'refresh'],'-',['删除',B('delete'),true,null,'trash']]);g.append(m);
      const tgl=get(toggleId);if(tgl){r.append(make('span','cw2-sp'));const sw=make('div','cw2-tbsw'),lab=make('label','cw2-tbt',L(toggleLabel)),ctl=make('div','cw-v4-row-controls');lab.htmlFor=toggleId;sw.append(lab,ctl);r.append(sw);move(s,showToggle(s,tgl),ctl);}
      return c;};

    // 上下文（1.5 : 1）：左「故事字符串」伸长到底；右「模板选项」+「上下文格式」七个开关。
    let pane=views.get('ctx');
    toolbar(pane,get('context_presets'),'context','context_derived','按模型元数据自动推导');
    let [l,r]=cols2(pane,'cw2-w64 cw2-stretch');
    let x=sec2(l,'故事字符串','cw2-grow');zoom(x,'context_story_string','故事字符串');preview(x,'context_story_string','故事字符串');fld(x,'context_story_string','',{cls:'cw2-fill',mono:true});
    x=sec2(r,'模板选项');sel(s,x,get('context_story_string_position'),'故事字符串位置');txt(s,x,get('context_example_separator'),'示例分隔符');txt(s,x,get('context_chat_start'),'聊天开始标记');
    x=sec2(r,'上下文格式');for(const [id,label] of [['always-force-name2-checkbox','始终把角色名加进提示词'],['single_line','每次只生成一行'],['collapse-newlines-checkbox','折叠连续的换行'],['trim_spaces','修剪空格'],['trim_sentences_checkbox','修剪不完整的句子'],['context_use_stop_strings','分隔符作为终止字符串'],['context_names_as_stop_strings','名字作为终止字符串']])tg(s,x,get(id),label);

    // 格式指引（1 : 1）：左「模板选项」+「序列选项」；右「序列」一张表（名称 / 前缀 / 后缀）。
    pane=views.get('ins');
    toolbar(pane,get('instruct_presets'),'instruct','instruct_enabled','启用格式指引');
    [l,r]=cols2(pane,'cw2-stretch');
    x=sec2(l,'模板选项');tg(s,x,get('instruct_bind_to_context'),'和上下文模板绑定','选这个模板时自动切换同名的上下文模板');tg(s,x,get('instruct_derived'),'按模型元数据自动推导');txt(s,x,get('instruct_activation_regex'),'激活正则','模型名匹配时自动选中这个模板')?.classList.add('cw2-wide');sel(s,x,get('instruct_names_behavior'),'包含名字');
    x=sec2(l,'序列选项','cw2-grow');for(const [id,label] of [['instruct_wrap','用换行包裹序列'],['instruct_macro','替换序列里的宏'],['instruct_sequences_as_stop_strings','序列作为终止字符串'],['instruct_skip_examples','跳过示例对话格式化'],['instruct_system_same_as_user','系统消息和用户消息相同']])tg(s,x,get(id),label);
    x=sec2(r,'序列','cw2-grow');{const q=make('div','cw2-sqt');x.querySelector(':scope>.cw-v4-card').append(q);q.append(make('span',''),make('span','cw2-sh',L('前缀')),make('span','cw2-sh',L('后缀')));
      const put=(label,a,b,span)=>{const pa=get(a);if(!pa)return;const lab=make('label','cw2-sl',L(label));lab.htmlFor=a;q.append(lab);move(s,pa,q);if(span){pa.classList.add('cw2-span2');cleanup(s,()=>pa.classList.remove('cw2-span2'));return;}const pb=b&&get(b);if(pb)move(s,pb,q);else q.append(make('span',''));};
      for(const [label,a,b] of [['故事字符串','instruct_story_string_prefix','instruct_story_string_suffix'],['用户消息','instruct_input_sequence','instruct_input_suffix'],['用户 · 第一条','instruct_first_input_sequence'],['用户 · 最后一条','instruct_last_input_sequence'],['助手消息','instruct_output_sequence','instruct_output_suffix'],['助手 · 第一条','instruct_first_output_sequence'],['助手 · 最后一条','instruct_last_output_sequence'],['系统消息','instruct_system_sequence','instruct_system_suffix']])put(label,a,b);
      q.append(make('i','cw2-sqhr'));for(const [label,a] of [['系统指令前缀','instruct_last_system_sequence'],['终止序列','instruct_stop_sequence'],['用户填充消息','instruct_user_alignment_message']])put(label,a,null,true);}

    // 系统提示词：「提示词内容」通栏，编辑框伸长到底；原生的「历史后置指令」放在下面。
    pane=views.get('sys');
    toolbar(pane,get('sysprompt_select'),'sysprompt','sysprompt_enabled','启用系统提示词');
    x=sec2(pane,'提示词内容','cw2-grow cw2-full');zoom(x,'sysprompt_content','提示词内容');{const n=get('sysprompt_content'),h2=x.querySelector(':scope>h2');if(n&&h2){const tk=make('span','cw2-tok');h2.insertBefore(tk,h2.querySelector('.cw2-link'));const wt=watchTokens(win,n,c=>text(tk,tokenText(t,c)));cleanup(s,()=>wt.stop());}}preview(x,'sysprompt_content','提示词内容');fld(x,'sysprompt_content','',{cls:'cw2-fill'});
    x=sec2(pane,'历史后置指令');fld(x,'sysprompt_post_history','');

    // 推理与其他（1 : 1）：左「推理」+「杂项」；右「推理格式」+「终止字符串」+「分词器」。
    pane=views.get('misc');
    [l,r]=cols2(pane,'');
    x=sec2(l,'推理');for(const [id,label,desc] of [['reasoning_auto_parse','自动解析','把模型输出里的思考部分单独拆出来'],['reasoning_auto_expand','自动展开'],['reasoning_show_hidden','显示隐藏的推理']])tg(s,x,get(id),label,desc);
    {const max=get('reasoning_max_additions'),add=get('reasoning_add_to_prompts');if(max||add){const rr=row(s,x,'加入提示词','把之前的思考内容带进后续提示词，最多几条',[]);const c=rr.querySelector('.cw-v4-row-controls');if(max){max.classList.add('cw-v4-num');cleanup(s,()=>max.classList.remove('cw-v4-num'));move(s,max,c);c.append(make('span','cw2-unit',L('条')));}if(add)move(s,showToggle(s,add),c);}}
    x=sec2(l,'杂项');tg(s,x,get('bind_model_templates'),'把模型和模板绑定');txt(s,x,get('markdown_escape_strings'),'非 Markdown 字符串','逗号分隔，不加空格')?.classList.add('cw2-wide');txt(s,x,get('start_reply_with'),'回复开头','每次回复都从这段文字开始')?.classList.add('cw2-wide');tg(s,x,get('chat-show-reply-prefix-checkbox'),'在聊天里显示回复开头');
    x=sec2(r,'推理格式');{const rs=get('reasoning_select');if(rs){const B=a=>panel.querySelector(`[data-preset-manager-${a}="reasoning"]`);rs.classList.add('cw-v4-preset-sel','cw2-tsel');cleanup(s,()=>rs.classList.remove('cw-v4-preset-sel','cw2-tsel'));row(s,x,'模板','',[rs,act(s,B('update'),'保存'),menu(s,[['改名',B('rename'),false,null,'pencil'],['另存为新的',B('new'),false,null,'copy'],'-',['导入',B('import'),false,null,'imp'],['导出',B('export'),false,null,'exp'],['恢复默认',B('restore'),false,null,'refresh'],'-',['删除',B('delete'),true,null,'trash']])]);}
      const g3=make('div','cw2-grid3');x.querySelector(':scope>.cw-v4-card').append(g3);for(const [id,label] of [['reasoning_prefix','前缀'],['reasoning_suffix','后缀'],['reasoning_separator','分隔符']])fld(g3,id,label,{mono:true});}
    x=sec2(r,'终止字符串');fld(x,'custom_stopping_strings','自定义终止字符串',{mono:true,hint:'JSON 字符串数组，模型写到这些字就停'});tg(s,x,get('custom_stopping_strings_macro'),'替换其中的宏');
    x=sec2(r,'分词器');sel(s,x,get('tokenizer'),'分词器');num(s,x,get('token_padding'),'Token 填充','预留给不准确计数的余量');

    const nativeNotice=get('advanced-formatting-cc-notice');if(nativeNotice){const park=created(s,make('div','cw-v4-park'));page.append(park);move(s,nativeNotice,park);}
    for(const p of page.querySelectorAll('.cw-v4-row-info>p'))p.title=p.textContent.trim();
    finish(s);
    let api=null;
    function paint(){const cc=get('main_api')?.value==='openai',limited=cc&&current!=='misc';api=cc;
      for(const [key,b] of buttons){b.setAttribute('aria-selected',String(key===current));views.get(key).hidden=key!==current;const dim=cc&&key!=='misc';if(views.get(key).classList.contains('cwr-dim')!==dim)views.get(key).classList.toggle('cwr-dim',dim);}
      note.hidden=!limited;tip.hidden=!limited;page.dataset.cw2Tab=current;for(const f of s.prevPaints||[])f();}
    get('main_api')?.addEventListener('change',paint);cleanup(s,()=>get('main_api')?.removeEventListener('change',paint));paint();s.paintFormatting=()=>{if(api!==(get('main_api')?.value==='openai'))paint();};
  }
  async function rename(s,next){const original=ctx()?.name1||get('your_name')?.textContent.trim()||'';if(s.renaming||!next.trim()||next===original){s.name.value=original;return;}if(doc.querySelector('dialog[open]')){s.name.value=original;return;}s.renaming=true;s.name.disabled=true;const html=doc.documentElement;html.setAttribute('data-cwr-persona-rename','');let popup;
    const wait=async(test,ms=6000)=>{const end=Date.now()+ms;while(!test()){if(Date.now()>end)throw Error(t('原生改名未能完成','Native rename did not finish'));await new Promise(r=>win.setTimeout(r,16));}};
    try{get('persona_rename_button').click();await wait(()=>{popup=[...doc.querySelectorAll('dialog[open]')].find(d=>d.querySelector('.popup-input'));return popup;});const input=popup.querySelector('.popup-input');input.value=next.trim();input.dispatchEvent(new win.Event('input',{bubbles:true}));popup.querySelector('.popup-button-ok').click();await wait(()=>ctx()?.name1===next.trim()&&!popup.open);text(s.saved,L('已保存'));win.setTimeout(()=>text(s.saved,''),1800);
    }catch(e){popup?.querySelector('.popup-button-cancel')?.click();win.toastr?.error?.(e.message);s.renameError=e;}
    finally{if(popup?.open){popup.querySelector('.popup-button-cancel')?.click();await new Promise(r=>win.setTimeout(r,100));}html.removeAttribute('data-cwr-persona-rename');s.renaming=false;s.name.disabled=false;s.name.value=ctx()?.name1||original;}
  }
  /* 用户角色 v2c（修改单第 6 节，稿 design-settings-pages-v2c.html）：电脑左边列表 440、右边编辑区，各自滚动；
     列表行点一下就切换（原生行为），当前行浅底 + 蓝勾，不再有「使用中 / 切换」按钮。编辑区：头像 / 名字 + 当前 / 更换头像，
     右边 改名 和 ⋯；一张卡片放描述和插入位置；下面「自动选中」和「全局设置」两组并排。
     手机：列表页（当前卡片 → 全部 → 全局设置），点当前卡片进编辑页（顶栏 返回 / 名字 / ⋯）。 */
  function personas(panel){const start=begin(panel);if(!start)return;const {s,page}=start;page.classList.add('cwr-page','cwr-personas','cw2-persona');page.dataset.cw2View='list';panel.classList.add('cwr-interface-panel','cw2-ppanel');cleanup(s,()=>panel.classList.remove('cwr-interface-panel','cw2-ppanel'));
    const park=created(s,make('div','cw-v4-park'));page.append(park);
    const stats=panel.querySelector('.fa-ranking-star')?.closest('.menu_button');
    const head=pageHead(s,page,'用户角色',[['使用统计',stats],['备份到文件',get('personas_backup')],['从文件恢复',get('personas_restore')]],act(s,get('create_dummy_persona'),'新建',true));
    head.classList.add('cw2-bar');head.append(make('span','cw2-note',L('你在聊天里扮演的身份。点左边一行就切换过去，右边直接改。')));
    const cols=make('div','cwr-persona-columns'),list=make('div','cwr-persona-list'),editor=make('div','cwr-persona-editor');cols.append(list,editor);page.append(cols);
    // 列表：搜索和排序同一行；手机上面多一张「当前」卡片。
    const tools=make('div','cw2-ptools');list.append(tools);move(s,get('persona_search_bar'),tools);move(s,get('persona_sort_order'),tools);
    move(s,get('persona_grid_toggle'),tools);
    // Keep upload inputs and the native More actions in their existing form/wrapper.
    move(s,get('form_upload_avatar'),park);
    move(s,get('persona-management-dropdown')?.closest('label'),park);
    const current=button('',()=>setView('edit'),'cw2-pcur'),curImg=make('img','cw2-pcur-img'),curText=make('span','cw2-pcur-t'),curName=make('span','cw2-pcur-n'),curDesc=make('span','cw2-pcur-d');curText.append(curName,curDesc);current.append(curImg,curText,icon('chev'));
    list.append(make('h3','cwr-section-title cw2-phone',L('当前')),current,make('h3','cwr-section-title cw2-phone',L('全部')));
    move(s,get('persona_pagination_container'),list);move(s,get('user_avatar_block'),list);
    // 编辑区顶部：头像 60 / 名字 19 + 当前 / 更换头像；右边 改名、⋯。
    const top=make('div','cwr-persona-identity cw2-phead'),avatar=make('img','cwr-persona-avatar'),who=make('div','cwr-persona-who'),line=make('div','cw2-pnameline'),name=make('input','cwr-persona-name'),saved=make('small','cwr-saved');
    name.type='text';name.setAttribute('aria-label',L('用户角色名字'));line.append(name,make('span','cw2-pill',L('当前')));
    const setImg=get('persona_set_image_button'),change=button(L('更换头像'),()=>get('persona_set_image_button')?.click(),'cw2-plink');
    who.append(line,change,saved);
    const renameEl=get('persona_rename_button'),renameBtn=button('',()=>get('persona_rename_button')?.click(),'cwr-btn cw2-prename');renameBtn.append(icon('pencil'),make('span','',L('改名')));
    const bindLore=()=>{
      const select=get('persona-management-dropdown'),option=get('persona_lorebook_link');
      if(!select||!option)return;
      option.selected=true;
      select.dispatchEvent(new win.Event('change',{bubbles:true}));
    };
    const items=[['复制一份',get('persona_duplicate_button'),false,null,'copy'],['把所有消息的名字改成这个',get('sync_name_button'),false,null,'pencil'],['用户角色世界书',get('persona_lore_button'),false,null,'imp'],['绑定用户角色世界书',null,false,bindLore,'imp'],'-',['删除',get('persona_delete_button'),true,null,'trash']];
    const pmenu=menu(s,items);top.append(avatar,who,renameBtn,pmenu);editor.append(top);
    if(setImg)move(s,setImg,park);if(renameEl)move(s,renameEl,park);move(s,get('your_name'),park);
    // 一张卡片：描述（右上 Token 数和放大）+ 插入位置（选「聊天中 @ 深度」时原生多出的深度和身份放在下面）。
    const desc=card(editor);desc.classList.add('cw2-pdesc');
    const f=field(s,desc,'persona_description','描述',{hint:'会作为 {{persona}} 放进提示词，直接在这里写，写完自动保存',expand:true,min:170});
    const counter=get('persona_description_token_count');if(counter&&f){const tk=make('span','cwr-tokens cw2-ptok');tk.append(doc.createTextNode(L('约')+' '));move(s,counter,tk);tk.append(doc.createTextNode(' Token'));const lab=f.querySelector('.cwr-field-label'),exp=lab?.querySelector('.cwr-btn');lab?.insertBefore(tk,exp||null);}
    sel(s,desc,get('persona_description_position'),'插入位置');const depth=get('persona_depth_position_settings');if(depth)move(s,depth,desc);
    const connectionList=get('persona_connections_list');
    const connectionInfo=get('persona_connections_info_block');
    if(connectionList){
      const details=make('div','cw2-persona-connections');
      park.append(details);
      move(s,connectionInfo,details);
      move(s,connectionList,details);
      const value=make('span','cw2-persona-connections-count');
      const show=button('',()=>openEditor(details,L('绑定情况')),'cw2-persona-connections-open');
      show.setAttribute('aria-label',L('绑定情况'));
      show.append(value,icon('chev'));
      row(s,desc,'绑定情况','',[show]);
      const paint=()=>{
        const n=connectionList.querySelectorAll(':scope>.avatar[data-type=character],:scope>.avatar[data-type=group]').length;
        text(value,n?t(`${n} 个`,`${n} linked`):t('未绑定','Not linked'));
      };
      const observer=new win.MutationObserver(paint);
      observer.observe(connectionList,{childList:true});
      cleanup(s,()=>observer.disconnect());
      paint();
    }
    const expand=get('persona_description') && panel.querySelector('.editor_maximize[data-for="persona_description"]');
    if(expand)move(s,expand,park);
    // 两组并排：自动选中 | 全局设置。
    const groups=make('div','cw2-pgroups'),g1=make('section','cw2-pgroup cw2-plocks'),g2=make('section','cw2-pgroup cw2-pglobal');groups.append(g1,g2);editor.append(groups);
    title(g1,'自动选中');const locks=card(g1);for(const [id,label,desc2]of [['lock_persona_default','新聊天默认用这个','开新聊天时自动选中'],['lock_persona_to_char','绑定到当前角色','和这个角色聊天时自动切换过来'],['lock_user_name','绑定到当前聊天','只在这段聊天里固定使用']])row(s,locks,label,desc2,[get(id)]).classList.add('cw-v4-lock-row');
    title(g2,'全局设置');const global=card(g2);for(const [id,label]of [['persona_show_notifications','切换时显示通知'],['persona_allow_multi_connections','允许一个角色绑定多个用户角色'],['persona_auto_lock','自动把选中的用户角色绑定到聊天']])tg(s,global,get(id),label);
    // 手机编辑页的顶栏：返回 / 名字 / ⋯（菜单项直接点原生按钮，不再搬动它们）。
    const editHead=created(s,make('div','cw2-pehead')),eb=button('',()=>setView('list'),'cwr-head-action cw2-peback'),et=make('h1','cw2-pename');eb.append(icon('chevl'));eb.setAttribute('aria-label',L('返回'));
    editHead.append(eb,et,menu(s,items.map(it=>it==='-'?it:[it[0],null,it[2],it[3]||(()=>get({'复制一份':'persona_duplicate_button','把所有消息的名字改成这个':'sync_name_button','用户角色世界书':'persona_lore_button','删除':'persona_delete_button'}[it[0]])?.click()),it[4]])));
    function setView(v){if(page.dataset.cw2View!==v)page.dataset.cw2View=v;panel.scrollTop=0;placeHead();}
    function placeHead(){if(mobileHead&&headOwner===panel&&editHead.parentNode!==mobileHead)mobileHead.append(editHead);text(et,name.value||ctx()?.name1||'');}
    s.name=name;s.saved=saved;s.avatar=avatar;name.addEventListener('blur',()=>rename(s,name.value));name.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();name.value=ctx()?.name1||'';name.blur();}else if(e.key==='Enter'){e.preventDefault();rename(s,name.value);name.blur();}});
    for(const p of page.querySelectorAll('.cw-v4-row-info>p'))p.title=p.textContent.trim();
    selectIcons(s,page);finish(s);
    s.paintPersona=()=>{if(doc.activeElement!==name&&!s.renaming)name.value=ctx()?.name1||get('your_name')?.textContent.trim()||'';const selected=get('user_avatar_block')?.querySelector('.avatar-container.selected'),img=selected?.querySelector('img'),src=img?.dataset.baiBaiToolkitLazyAvatarSrc||img?.getAttribute('src')||'';if(avatar.getAttribute('src')!==src)avatar.setAttribute('src',src);if(curImg.getAttribute('src')!==src)curImg.setAttribute('src',src);
      text(curName,name.value);text(curDesc,(get('persona_description')?.value||'').replace(/\s+/g,' ').trim()||t('还没有描述','No description yet'));
      for(const item of get('user_avatar_block')?.querySelectorAll('.avatar-container .ch_description')||[]){if(!item.title&&item.textContent.trim())item.title=item.textContent.trim();}
      placeHead();};
    s.paintPersona();
  }
  function sync(panel,s){syncHeader(panel);if(panel.id==='AdvancedFormatting')s?.paintFormatting?.();if(panel.id==='PersonaManagement')s?.paintPersona?.();}
  return {formatting,personas,sync,destroy(){mobileHead?.remove();mobileHead=null;registry.clear();}};
}


