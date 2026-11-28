/* 设置页 v2d 版式（稿 界面优化与新功能-20261103/design-settings-pages-v2d.html）。
   只搬节点、加容器、改顺序：原生控件、它们的事件和原生的显示开关（style.display / hidden）都不动。
   每次搬动都记在抽屉的 state 里（move / created / cleanup），关掉 CW 时由 official-drawers.js 的 restore() 原样还回去。
   样式在 styles/settings-v2d.css（.cw2 开头）。 */
export function createV2dPages(h) {
  const {win,make,button,get,move,cleanup,created,state,menu,row,t,L}=h,doc=win.document;
  const mark=(s,n,...c)=>{if(!n)return n;const add=c.filter(x=>!n.classList.contains(x));if(add.length){n.classList.add(...add);cleanup(s,()=>n.classList.remove(...add));}return n;};
  const hide=(s,n)=>{if(!n||n.hidden)return;n.hidden=true;cleanup(s,()=>{n.hidden=false;});};
  const relabel=(s,n,text)=>{if(!n||n.textContent===text)return;const old=n.textContent;n.textContent=text;cleanup(s,()=>{n.textContent=old;});};
  const sec=(s,host,title,cls='',before=null)=>{const n=created(s,make('section','cw-v4-section'+(cls?' '+cls:'')));if(title)n.append(make('h2','',L(title)));n.append(make('div','cw-v4-card'));host.insertBefore(n,before);return n;};
  const cols=(s,host,before,cls='')=>{const g=created(s,make('div','cw2-cols'+(cls?' '+cls:''))),l=make('div','cw2-col'),r=make('div','cw2-col');g.append(l,r);host.insertBefore(g,before||null);return [l,r];};
  const card=n=>n.querySelector(':scope>.cw-v4-card');
  // 说明只占一行（G5），鼠标停上去看全文。
  const polish=root=>{for(const p of root.querySelectorAll('.cw-v4-row-info>p,.cw-v4-row-info>.cw-v4-row-desc'))if(!p.title&&p.textContent.trim())p.title=p.textContent.trim();};

  /* 第 2 节 API 连接：标题行 → 连接状态通栏卡 → 两栏 1.5 : 1（接口与来源 | 连接配置 + 工作单元 + 连接选项 + 更多）。
     v2f（稿 design-settings-layout-v2f-fable.html 的 C）：连接配置从标题行挪成右栏第一张卡（手机放在状态卡下面）；
     AI Horde 的三个工作单元开关挪到右栏「工作单元」；文本补全的「服务类型」和「接口类型」并排。 */
  function api(panel){
    const ps=state(panel);if(ps.v2d)return;
    const page=panel.querySelector(':scope>.cw-v4-drawer-page'),connect=get('api_button_openai'),statusRow=connect?.closest('.cw-v4-row'),profiles=get('connection_profiles'),main=get('main_api');
    // 等 official-drawers / settings-more-pages 先把行建好（状态行里要已经有 .online_status）。
    if(!page||!statusRow||!profiles||!main||!statusRow.querySelector('.online_status'))return;
    ps.v2d=true;mark(ps,panel,'cw2','cw2-api');
    const profileSec=profiles.closest('.cw-v4-section'),apiSec=main.closest('.cw-v4-section'),connSec=statusRow.closest('.cw-v4-section'),source=get('openai_api');
    // A1/A2 标题行：标题 / 配置下拉 300 / 保存 / ⋯（新建进 ⋯ 第一项）/ 灰色说明。手机：内容区第一行，下拉占满。
    const bar=created(ps,make('div','cw2-bar'));bar.append(make('h2','',L('API 连接')));page.prepend(bar);
    const phone=win.innerWidth<=700||doc.documentElement.dataset.claudeLayout==='mobile';
    const prof=created(ps,make('section','cw-v4-section cw2-prof')),profRow=make('div','cw2-prof-row');prof.append(make('h2','',L('连接配置')));
    {const c=make('div','cw-v4-card');c.append(profRow,make('p','cw2-prof-note',t('把接口、模型和预设存成一套，切换时一起换','Saves the API, model and preset together; switching swaps them all')));prof.append(c);}
    move(ps,profiles,profRow);move(ps,get('update_connection_profile'),profRow);
    const profileDetails=get('connection_profile_details_content');
    if(profileDetails)move(ps,profileDetails,card(prof));
    const pm=menu(ps,[['新建配置',get('create_connection_profile'),false,null,'plus'],['查看详情',get('view_connection_profile'),false,null,'eye'],['编辑',get('edit_connection_profile'),false,null,'pencil'],['重新载入',get('reload_connection_profile'),false,null,'refresh'],'-',['删除这个配置',get('delete_connection_profile'),true,null,'trash']]);
    pm.classList.add('cw2-sheet');pm.cw2Title=()=>profiles.selectedOptions?.[0]?.textContent||'';profRow.append(pm);
    hide(ps,profileSec);
    // A3 连接状态：通栏卡。右边 测试消息 / 连接（主按钮）/ ⋯；附加参数挪到「更多」。
    const stat=sec(ps,page,'','cw2-stat',bar.nextSibling);move(ps,statusRow,stat);
    const controls=statusRow.querySelector('.cw-v4-row-controls'),test=get('test_api_button');if(controls&&test&&controls.contains(connect))move(ps,test,controls,connect);
    for(const it of statusRow.querySelectorAll('.cw-v4-more-item'))if(it.textContent.trim()===L('附加参数'))hide(ps,it);
    // 绿点只在真正连上时显示。酒馆原生只要状态不是「无连接」就加 success（绿点），连「无效的端点 URL。请求可能失败。」
    // 「已跳过状态检查」这类警告也亮。这里认出这几句警告，给点加 cw2-warn，CSS 藏掉（稿里没有别的颜色，就不显示点）。
    const WARN=/^(?:no connection|无连接|未連線|沒有連線)(?:[.⋯…\s]|$)|Invalid (Azure )?endpoint URL|无效的( Azure)? ?端点 URL|Status check bypassed|已跳过状态检查/i;
    const dotText=statusRow.querySelector('.online_status_text'),dot=statusRow.querySelector('.online_status_indicator');
    if(dotText&&dot){const paintDot=()=>{const warn=WARN.test(dotText.textContent.trim());if(dot.classList.contains('cw2-warn')!==warn)dot.classList.toggle('cw2-warn',warn);};
      const dmo=new win.MutationObserver(paintDot);dmo.observe(dotText,{childList:true,characterData:true,subtree:true});paintDot();cleanup(ps,()=>{dmo.disconnect();dot.classList.remove('cw2-warn');});}
    const statMenu=statusRow.querySelector('.cw-v4-more');if(statMenu)mark(ps,statMenu,'cw2-stat-more');
    // A4–A6 两栏。
    const [left,right]=cols(ps,page,stat.nextSibling,'cw2-w64 cw2-stretch');
    if(phone)page.insertBefore(prof,stat.nextSibling);else right.append(prof);
    move(ps,apiSec,left);mark(ps,apiSec,'cw2-grow','cw2-src');relabel(ps,apiSec.querySelector(':scope>h2'),L('接口与来源'));
    mark(ps,main.closest('.cw-v4-row'),'cw2-main');
    // AI Horde 的工作单元开关：原生在 #kobold_horde 里随接口类型显示；挪出来以后按接口类型自己藏。
    const workers=sec(ps,right,'工作单元','cw2-workers');
    // 原生文字带 data-i18n，节点一搬动酒馆的翻译会写回原文，所以藏起原文、旁边放自己的字。
    const say=(n,text,tag='span')=>{if(!n)return;hide(ps,n);n.after(created(ps,make(tag,n.className||'',text)));};
    for(const [id,zh,en] of [['horde_auto_adjust_context_length','按工作单元调整上下文长度','Adjust context to workers'],['horde_auto_adjust_response_length','按工作单元调整回复长度','Adjust response to workers'],['horde_trusted_workers_only','只用受信任的工作单元','Trusted workers only']]){const l=get(id)?.closest('label');if(l){move(ps,l,card(workers));mark(ps,l,'cw2-wk');mark(ps,get(id),'cw2-switch');say(get(id).nextElementSibling,t(zh,en));}}
    for(const n of get('textgenerationwebui_api')?.querySelectorAll('input[type=checkbox]')||[])mark(ps,n,'cw2-switch');
    // 文本补全的服务类型（#textgen_type 和它的标题）并到接口类型旁边；容器本身不带 data-tg-type，原生只靠外层 #textgenerationwebui_api 显隐。
    const tgType=get('textgen_type')?.parentElement;
    if(tgType&&tgType.parentElement?.closest('#textgenerationwebui_api')){mark(ps,tgType,'cw-v4-api-inline-row','cw2-tgtype');say(tgType.querySelector(':scope>h4'),t('服务类型','Server type'),'h4');move(ps,tgType,card(apiSec),main.closest('.cw-v4-row')?.nextSibling||null);}
    const llamaAddress=get('llamacpp_api_url_text')?.closest('.cw-v4-api-inline-row');
    const llamaKey=get('api_key_llamacpp')?.closest('.cw-v4-api-row');
    if(llamaAddress&&llamaKey&&llamaAddress.parentElement===llamaKey.parentElement)move(ps,llamaAddress,llamaKey.parentElement,llamaKey);
    const textHint=created(ps,make('p','cw2-tg-note',t(
      '换成 Ollama、OpenRouter、TabbyAPI 等类型时，它们各自要填的项（模型、密钥、勾选项）按同样的排法出现在左边卡片里。',
      'Services like Ollama, OpenRouter, and TabbyAPI show their own model, key, and toggle fields in the same card.')));
    // 状态卡跟当前接口走（11-16）：状态文字和圆点是酒馆全局写的（displayOnlineStatus 改所有 .online_status_text），本来就跟随；
    // 「连接」原生只接聊天补全，其他接口另放一个按钮，点击转发到该接口自己的原生连接按钮。AI Horde 原生没有连接按钮，
    // 切到 Horde 时酒馆自动查状态（getStatusHorde），所以 Horde 下不显示「连接」。「发送测试消息」「OpenRouter 授权」只属于聊天补全。
    // 「取消连接」是原生 .api_loading 的委托点击，对所有接口都有效，保留。
    const NATIVE={kobold:'api_button',novel:'api_button_novel',textgenerationwebui:'api_button_textgenerationwebui'};
    const conn=controls&&connect?created(ps,make('button','menu_button cw-v4-as-btn cw-v4-primary cw2-conn')):null;
    if(conn){
      conn.type='button';
      conn.append(make('span','cw-v4-action-label',L('连接')));
      conn.addEventListener('click',()=>{
        const id=NATIVE[main.value],native=id&&get(id);
        // The host sets this class in startStatusLoading and clears it after cancel or completion.
        if(native&&!native.classList.contains('disabled'))native.click();
      });
      connect.after(conn);
    }
    const oaiOnly=[connect,test,...[...statusRow.querySelectorAll('.cw-v4-more-item')].filter(n=>/OpenRouter/.test(n.textContent))].filter(Boolean);
    // 四种接口左卡底部的原生「连接 / 取消」和状态行：节点留在原位，只是不显示（文本补全那排还有 OpenRouter「授权」，只藏连接和取消）。
    const nativeOff=[get('api_button')?.parentElement,get('api_button_novel')?.parentElement,get('api_button_textgenerationwebui'),get('api_button_textgenerationwebui')?.parentElement?.querySelector(':scope>.api_loading'),
      ...['kobold_api','novel_api','textgenerationwebui_api','kobold_horde'].map(id=>get(id)?.querySelector('.online_status'))].filter(n=>n&&!statusRow.contains(n));
    for(const n of nativeOff)mark(ps,n,'cw2-native-off');
    const paintApi=()=>{const v=main.value;workers.hidden=v!=='koboldhorde';textHint.hidden=v!=='textgenerationwebui';if(tgType)tgType.hidden=v!=='textgenerationwebui';card(apiSec)?.classList.toggle('cw2-tg',v==='textgenerationwebui');
      for(const n of oaiOnly)n.classList.toggle('cw2-apioff',v!=='openai');conn?.classList.toggle('cw2-apioff',!NATIVE[v]);};
    cleanup(ps,()=>{for(const n of oaiOnly)n.classList.remove('cw2-apioff');});
    const $main=win.jQuery?.(main);if($main){$main.on('change.cw2v2f',paintApi);cleanup(ps,()=>{$main.off('change.cw2v2f');if(tgType)tgType.hidden=false;card(apiSec)?.classList.remove('cw2-tg');});}else{main.addEventListener('change',paintApi);cleanup(ps,()=>main.removeEventListener('change',paintApi));}
    paintApi();
    const hl=get('kobold_horde_block')?.querySelector(':scope>ul');
    if(hl){
      mark(ps,hl,'cw2-hlinks');
      for(const li of hl.children){
        mark(ps,li,'cw2-hl-li');
        for(const n of li.children)n.tagName==='A'?mark(ps,n,'cw2-hl-a'):hide(ps,n);
      }
      const note=created(ps,make('li','cw2-hl-t',t(
        'AI Horde 由志愿者共享显卡运行，免费，但要排队。别往里发敏感信息。',
        'AI Horde runs on GPUs shared by volunteers. It is free, but there may be a queue. Avoid sending sensitive information.')));
      hl.prepend(note);
    }
    const hordeKeyRow=get('horde_api_key')?.closest('.cw-v4-api-row');
    const hordeKeyHint=hordeKeyRow?.querySelector('.cw-v4-api-label>small');
    if(hordeKeyHint){move(ps,hordeKeyHint,hordeKeyRow);mark(ps,hordeKeyHint,'cw2-horde-key-note');}
    const opts=sec(ps,right,'连接选项','cw2-opts');
    opts.after(textHint);
    const auto=get('auto-connect-checkbox')?.closest('.cw-v4-row');if(auto)move(ps,auto,opts);
    for(const id of ['openai_bypass_status_check','openai_show_external_models']){const r=get(id)?.closest('.cw-v4-mapped-setting');if(r){move(ps,r,opts);mark(ps,r,'cw2-cc');}}
    const ppp=get('prompt_post_processing_form');if(ppp){move(ps,ppp,opts);mark(ps,ppp,'cw2-cc');mark(ps,get('custom_prompt_post_processing'),'cw2-short');}
    const more=sec(ps,right,'更多','cw2-more');
    const proxySec=source&&[...source.querySelectorAll(':scope>.cw-v4-section')].find(n=>n.querySelector('.inline-drawer'));
    const proxyRow=proxySec?.querySelector('.cw-v4-row');if(proxyRow){move(ps,proxyRow,more);mark(ps,proxyRow,'cw2-cc');hide(ps,proxySec);}
    const warn=get('ReverseProxyWarningMessage');if(warn){move(ps,warn,more);mark(ps,warn,'cw2-cc');}
    const extra=get('customize_additional_parameters');
    if(extra){const r=row(ps,more,'附加参数','请求体和请求头里额外带的内容',[button(L('编辑'),()=>extra.click(),'cw-v4-button')]);mark(ps,r,'cw2-cc');}
    if(connSec&&!card(connSec)?.querySelector('.cw-v4-row:not([hidden])'))hide(ps,connSec);
    polish(page);
  }

  return {sync(panel){if(!doc.documentElement.hasAttribute('data-cw-settings-unified'))return;if(panel.id==='rm_api_block')api(panel);}};
}
