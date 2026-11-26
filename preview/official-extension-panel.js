import { dropAfter, clearDropLine, showDropLine, guardSortDrag } from './settings-drop-target.js?v=2.0.171';
import { preferencesFor } from './preferences.js?v=2.0.171';

// The catalog is presentation only. Plugin roots and their native handlers stay
// in rm_extensions_block; the existing settings adapter owns field lifecycles.
export function createExtensionPanel({win,t,make,button,icon,settings,openEditor}) {
  const doc=win.document,prefs=preferencesFor(win),key='claude-web:extensions-layout';
  const style=make('link','');style.rel='stylesheet';style.href=new URL('styles/official-extension-panel.css?v=2.0.171',import.meta.url).href;doc.head.append(style);
  // 作为正式仓 preview/ 里的前瞻版运行时，扩展身份（文件夹名、manifest）以根目录为准。
  const own='third-party/'+decodeURIComponent(new URL(globalThis.__cwPreview?.root||new URL('.',import.meta.url)).pathname.replace(/\/$/,'').split('/').pop());
  const aliases={tavern_helper:'third-party/JS-Slash-Runner',bai_bai_toolkit_container:'third-party/baibai-tools',assets_container:'assets',expressions_container:'expressions',sd_container:'stable-diffusion',tts_container:'tts',qr_container:'quick-reply',translation_container:'translate',caption_container:'caption',summarize_container:'memory',regex_container:'regex',vectors_container:'vectors'};
  const norm=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
  let panel,page,sources,list,detail,editor,mobileHead,host,api,initializing,visited=false,disposed=false,active=null,returnRoot=null,frame=0;
  let q='',filter='all',systemOpen=false,needsReload=false,sorting=false,dragged=null,checking=null,nativeOpen=false,nativeReturn=null;
  const entries=new Map(),originals=[],moves=[],listeners=[],heldContainers=new Map();let nativeNodes=[];
  const on=(n,event,f,opts)=>{n.addEventListener(event,f,opts);listeners.push(()=>n.removeEventListener(event,f,opts));};
  const set=(n,s)=>{if(n.textContent!==s)n.textContent=s;};
  const hide=(n,v)=>{if(n.hidden!==v)n.hidden=v;};
  const err=e=>win.toastr?.error?.(e.message||String(e),t('扩展操作失败','Extension action failed'));
  function action(label,run,cls=''){return button(label,e=>{e.stopPropagation();Promise.resolve().then(run).catch(err);},'cwex-btn '+cls);}
  // 333 小修：按钮照稿带图标；文字放在 .cwex-btn-label 里，paint 只改文字不动图标。
  function iconAction(name,label,run,cls=''){const b=action('',run,cls);b.append(icon(name),make('span','cwex-btn-label',label));return b;}
  const setLabel=(b,s)=>set(b.querySelector(':scope>.cwex-btn-label')||b,s);
  // 整行可点的行（删除、原生入口）：键盘 Enter / 空格也能点。
  function actionRow(iconName,title,desc,run,cls=''){const r=make('div','cwex-row cwex-action-row '+cls);r.setAttribute('role','button');r.tabIndex=0;const ic=make('span','cwex-icon cwex-system-icon cwex-row-icon');ic.append(icon(iconName));const txt=make('div','cwex-text');txt.append(make('div','cwex-name',title));if(desc)txt.append(make('div','cwex-meta cwex-wrap',desc));r.append(ic,txt);const go=()=>Promise.resolve().then(run).catch(err);r.addEventListener('click',e=>{e.stopPropagation();go();});r.addEventListener('keydown',e=>{if(e.target===r&&['Enter',' '].includes(e.key)){e.preventDefault();go();}});return r;}
  function store(){try{const v=JSON.parse(prefs.getItem(key)||'null');return v?.v===1&&Array.isArray(v.items)?v.items:[];}catch{return [];}}
  function records(){const seen=new Set(),out=[];for(const r of store())if(typeof r?.id==='string'&&!seen.has(r.id)){seen.add(r.id);out.push({id:r.id,place:r.id===own?'show':r.place==='hidden'?'hidden':'show'});}for(const id of entries.keys())if(!seen.has(id))out.push({id,place:'show'});return out;}
  function save(rows){prefs.setItem(key,JSON.stringify({v:1,items:rows}));paint();}
  const hidden=e=>e.id!==own&&records().find(r=>r.id===e.id)?.place==='hidden';
  const enabled=e=>e.type==='ui'&&e.control?e.control.checked:e.id===own?doc.getElementById('claude-web-enabled')?.checked!==false:!host.extension_settings.disabledExtensions.includes(e.id);
  const third=e=>e.id.startsWith('third-party/');
  const groupFor=e=>third(e)?'third':e.type==='ui'?'other':'builtin';
  const groupLabels={third:t('我安装的','Installed by me'),other:t('其他设置','Other settings'),builtin:t('酒馆自带','Built in')};
  const groups=Object.keys(groupLabels);
  const anonymousRoots=new WeakMap();let nextAnonymousRoot=0;
  const external=e=>e.id.slice('third-party/'.length);
  const headers=()=>win.SillyTavern.getContext().getRequestHeaders();
  async function post(e,endpoint,extra={}){if(e.type==='global'&&['update','switch'].includes(endpoint))await requireAdmin();const r=await win.fetch('/api/extensions/'+endpoint,{method:'POST',headers:headers(),body:JSON.stringify({extensionName:external(e),global:e.type==='global',...extra})});if(!r.ok)throw Error('HTTP '+r.status);return r.json();}
  function badge(e){const n=make('span','cwex-icon');n.setAttribute('aria-hidden','true');if(third(e)){let h=0;for(const c of e.id)h=(h*31+c.codePointAt(0))>>>0;const colors=['#b6593c','#4a68bc','#a26934','#378162','#7960a6','#34788e'];n.style.backgroundColor=colors[h%colors.length];n.textContent=Array.from(e.label)[0]?.toLocaleUpperCase()||'?';}else{n.classList.add('cwex-system-icon');n.append(icon('puzzle'));}return n;}
  function switchButton(e,isVisibility=false){const b=action('',()=>isVisibility?visibility(e,!hidden(e)):toggle(e),'cwex-switch');b.setAttribute('role','switch');b.setAttribute('aria-label',(isVisibility?t('在列表里显示 ','Show in list '):t('启用 ','Enable '))+e.label);b.dataset.switchFor=e.id;if(isVisibility)b.dataset.visibility='1';return b;}
  function metadata(e,n){const isEnabled=enabled(e),signature=JSON.stringify([e.version,e.update?.kind,e.update?.remote,isEnabled,hidden(e),e.roots.length]);if(n._cwexMeta===signature)return;n._cwexMeta=signature;const parts=[];if(e.version)parts.push('v'+e.version);else if(e.type==='ui')parts.push(t('没认出属于哪个扩展','Extension could not be identified'));else if(!third(e))parts.push(groupLabels.builtin);if(isEnabled&&!e.roots.length)parts.push(t('没有设置页','No settings page'));set(n,parts.join(' · '));if(e.update?.kind==='available'){const p=make('span','cwex-pill',e.update.remote?t('可更新到 ','Update to ')+e.update.remote:t('有更新','Update available'));n.append(p);}if(!isEnabled)n.append(make('span','cwex-pill cwex-muted',t('已停用','Disabled')));if(hidden(e))n.append(make('span','cwex-pill cwex-muted',t('已隐藏','Hidden')));if(e.update?.kind==='error')n.append(make('span','cwex-muted',t('检查失败','Check failed')));}
  function requestPaint(){if(!frame&&!disposed)frame=win.requestAnimationFrame(()=>{frame=0;paint();});}
  function visibility(e,isHidden){if(e.id===own)return;const r=records();r.find(r=>r.id===e.id).place=isHidden?'hidden':'show';save(r);}
  async function toggle(e){if(e.busy)return;e.busy=true;paint();try{
    if(e.type==='ui'&&e.control){e.control.click();needsReload=true;return;}
    if(e.id===own){const native=doc.getElementById('claude-web-enabled');if(!native)throw Error(t('Claude Web 安全开关不可用','Claude Web safety switch is unavailable'));native.click();return;}
    if(enabled(e))await host.disableExtension(e.id,false);else await host.enableExtension(e.id,false);
    needsReload=true;
  }finally{e.busy=false;paint();}}
  async function check(e,force=false){if(!third(e)||e.deleted||e.busy||e.checking)return;
    const cacheKey='claude-web:extension-version:'+e.id+':'+e.type;
    if(!force){try{const v=JSON.parse(win.sessionStorage.getItem(cacheKey)||'null');if(v&&Date.now()-v.at<3600000){e.update=v.update;return;}}catch{}}
    e.checking=true;try{const v=await post(e,'version');if(typeof v.isUpToDate!=='boolean')throw Error('Invalid extension version response');e.update={kind:v.isUpToDate?'latest':'available',remote:'',remoteUrl:String(v.remoteUrl||''),branch:String(v.currentBranchName||'')};
      if(!v.isUpToDate){const m=String(v.remoteUrl||'').match(/^(?:https?:\/\/github\.com\/|git@github\.com:)([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/);if(m&&v.currentBranchName){try{const r=await win.fetch('https://raw.githubusercontent.com/'+m[1]+'/'+m[2]+'/'+String(v.currentBranchName).split('/').map(encodeURIComponent).join('/')+'/manifest.json?cw='+Date.now(),{cache:'no-store'});if(r.ok)e.update.remote=String((await r.json()).version||'').slice(0,64);}catch{}}}
      try{win.sessionStorage.setItem(cacheKey,JSON.stringify({at:Date.now(),update:e.update}));}catch{}
    }catch(error){e.update={kind:'error'};if(force)throw error;}finally{e.checking=false;requestPaint();}}
  // Called on entry, never from paint/mutation reconciliation. Sequential Git
  // checks also avoid racing the host's extension directory operations.
  function checkAll(){if(checking)return checking;checking=(async()=>{for(const e of entries.values()){if(disposed)break;await check(e);}})().finally(()=>checking=null);return checking;}
  async function update(e){if(e.busy||e.deleted)return;if(e.checking)throw Error(t('正在检查更新，请稍候再试','Wait for the version check to finish'));e.busy=true;paint();try{await post(e,'update');e.update={...e.update,kind:'done'};if(e.update.remote)e.version=e.update.remote;needsReload=true;try{win.sessionStorage.removeItem('claude-web:extension-version:'+e.id+':'+e.type);}catch{}}finally{e.busy=false;paint();}}
  async function updateAll(){for(const e of [...entries.values()].filter(e=>e.update?.kind==='available'))await update(e);}
  async function branch(e){if(e.busy||e.checking)throw Error(t('扩展操作进行中，请稍候再试','Wait for the extension operation to finish'));const branches=await post(e,'branches');if(!Array.isArray(branches)||!branches.length)throw Error(t('没有可用分支','No available branches'));
    const select=make('select','text_pole');for(const r of branches){const o=make('option','',String(r.name));o.value=r.name;o.selected=!!r.current;select.append(o);}const old=select.value;
    const {Popup,POPUP_TYPE,POPUP_RESULT}=await import(new URL('/scripts/popup.js',win.location.href).href);
    if(await new Popup(select,POPUP_TYPE.CONFIRM,'',{okButton:t('切换分支','Switch branch')}).show()!==POPUP_RESULT.AFFIRMATIVE||select.value===old)return;
    e.busy=true;paint();try{await post(e,'switch',{branch:select.value});needsReload=true;e.update=null;}finally{e.busy=false;paint();}}
  async function requireAdmin(){const {isAdmin}=await import(new URL('/scripts/user.js',win.location.href).href);if(!isAdmin())throw Error(t('只有管理员可以修改全局安装的扩展','Only administrators can change global extensions'));}
  async function remove(e){if(e.busy)return;if(e.checking)throw Error(t('正在检查更新，请稍候再试','Wait for the version check to finish'));if(e.type==='global')await requireAdmin();e.busy=true;paint();try{
    // Await an in-flight check before deleting; never start a new Git version
    // query from the deletion path (Windows directory handles / TT).
    await checking;
    const {Popup}=await import(new URL('/scripts/popup.js',win.location.href).href);
    if(!await Popup.show.confirm(t('删除扩展','Delete extension'),t('确认删除 ','Delete ')+e.label+'?'))return;
    e.deleted=true;needsReload=true;paint();await host.deleteExtension(external(e));back();
    }finally{e.busy=false;paint();}
  }
  function homepage(e){let value=e.manifest.homePage||e.update?.remoteUrl;if(!value)return;try{const u=new URL(value);if(['https:','http:'].includes(u.protocol))win.open(u.href,'_blank','noopener,noreferrer');}catch{}}
  function moveNative(n,to){if(!n||n===to||n.contains(to))return;const mark=doc.createComment('cw-extension-panel-return');n.before(mark);moves.push([n,mark]);to.append(n);}
  function show(view,resetScroll=true){hide(list,view!=='list');hide(detail,view!=='detail');hide(editor,view!=='sort');page.dataset.view=view;if(resetScroll)panel.scrollTop=0;paintHead(view);}
  function paintHead(view){if(!mobileHead&&win.innerWidth>700&&doc.documentElement.dataset.claudeLayout!=='mobile')return;mobileHead||=make('div','cwex-mobile-head');mobileHead.replaceChildren();
    const left=view==='list'?action('☰',()=>doc.querySelector('.cw-v4-shell .cw-v4-menu')?.click(),'cwex-mobile-menu'):(()=>{const b=action('',back,'cwex-mobile-back');b.append(icon('chevl'));if(view==='detail')b.append(make('span','cwex-btn-label',t('扩展','Extensions')));return b;})();left.setAttribute('aria-label',view==='list'?t('设置导航','Settings navigation'):t('返回扩展','Back to extensions'));
    mobileHead.append(left,make('h1','cwex-mobile-title',view==='list'?t('扩展','Extensions'):view==='sort'?t('排序和隐藏','Order and visibility'):nativeOpen||active?.label||''));
    const right=make('div','cwex-mobile-right');if(view==='sort')right.append(action(t('完成','Done'),back));else if(view==='list'&&host){const plus=action('',()=>host.openThirdPartyExtensionMenu(),'cwex-mobile-install');plus.append(icon('plus'));plus.setAttribute('aria-label',t('安装扩展','Install extension'));right.append(plus);}mobileHead.append(right);
    if(!mobileHead.isConnected)doc.querySelector('.cw-v4-shell .cw-v4-head')?.append(mobileHead);
  }
  function back(){sortDrag?.end();clearDrag();returnRoot?.();returnRoot=null;nativeReturn?.();nativeReturn=null;nativeOpen=false;active=null;sorting=false;show('list');paint();}
  function present(root,title,desc,opts={}){
    if(!root?.isConnected)return;const box=detail.querySelector('.cwex-native-settings');
    let container=root.closest('#extensions_settings,#extensions_settings2')||root;while(container.parentElement&&container.parentElement!==panel&&!container.parentElement.closest('.cw-ext-panel'))container=container.parentElement;
    let held=heldContainers.get(container),ownsContainer=false;
    if(!held){const mark=doc.createComment('cw-extension-detail-return');container.before(mark);held={mark};heldContainers.set(container,held);container.classList.add('cwex-detail-container');box.append(container);ownsContainer=true;}
    const path=[];for(let n=root;n&&n!==container;n=n.parentElement){path.push(n);n.classList.add('cwex-active-branch');}
    const display=root.style.getPropertyValue('display'),priority=root.style.getPropertyPriority('display');
    root.classList.add('cw-v4-editing','cwex-editing');root.style.setProperty('display','block','important');
    // CW 自己的设置在 332 是放进弹出页、由 official-layout.js 的 enhance 给勾选行加 cw-v4-setting-row（文字在左、开关在右、行间分隔）；
    // 333 的扩展页不走 enhance，这里只给 CW 自己的设置补上同样的行样式，返回列表时撤掉。插件原样显示的设置不动。
    const ownRows=root.id==='claude-web-settings'||root.querySelector('#claude-web-settings')?[...root.querySelectorAll('label.checkbox_label:not([data-v-app] *):not(:has(.sr-only)):not(.cw-v4-setting-row)')]:[];
    ownRows.forEach(n=>n.classList.add('cw-v4-setting-row'));
    const drawer=root.matches('.inline-drawer')?root:root.querySelector('.inline-drawer'),content=drawer?.querySelector(':scope>.inline-drawer-content'),nativeDisplay=content?.style.getPropertyValue('display'),nativePriority=content?.style.getPropertyPriority('display');
    const previousReturn=returnRoot;returnRoot=()=>{ownRows.forEach(n=>n.classList.remove('cw-v4-setting-row'));if(content){if(nativeDisplay)content.style.setProperty('display',nativeDisplay,nativePriority);else content.style.removeProperty('display');}root.classList.remove('cw-v4-editing','cwex-editing');path.forEach(n=>n.classList.remove('cwex-active-branch'));if(display)root.style.setProperty('display',display,priority);else root.style.removeProperty('display');opts.onClose?.();previousReturn?.();if(ownsContainer){container.classList.remove('cwex-detail-container');if(held.mark.parentNode)held.mark.replaceWith(container);heldContainers.delete(container);}};
    drawer?.dispatchEvent(new win.CustomEvent('inline-drawer-toggle',{bubbles:true,detail:{open:true}}));content?.style.setProperty('display','block','important');
  }
  function noSettings(e){
    const tokenLabel=doc.getElementById('token_counter')?.textContent.trim()
      || t(doc.body.classList.contains('clawd-tauritavern-host')?'词符计数器':'Token 计数器','Token Counter');
    const locations={
      'connection-manager':t('在「API 连接」页的「连接配置」里使用。','Use Connection Profiles on the API Connections page.'),
      'token-counter':t('点聊天输入框旁的「＋」，选择「'+tokenLabel+'」。','Choose “Token Counter” from the + menu by the chat input.'),
      attachments:t('点聊天输入框旁的「＋」，选择「打开数据库」。','Choose “Open Data Bank” from the + menu by the chat input.'),
      gallery:t('点聊天输入框旁的「＋」，选择「展示图库」。','Choose “Show Gallery” from the + menu by the chat input.'),
      'in-app-agent':t('在「格式化」页顶部打开「应用助手」。','Open In-App Assistant at the top of the Formatting page.'),
    };
    const row=make('div','cwex-row cwex-no-settings'),copy=make('div','cwex-text');
    copy.append(make('div','cwex-name',t('这个扩展没有自己的设置页。','This extension has no settings page of its own.')),
      make('div','cwex-meta cwex-wrap',locations[e.id]||t('它的功能在别的地方使用，比如聊天输入框的菜单或聊天界面里。','Use this extension elsewhere, such as from the chat input menu or in the chat itself.')));
    row.append(copy);
    return row;
  }
  function renderSettings(e,native){
    const roots=e.roots.filter(r=>r.isConnected);if(e.id.split('/').at(-1)==='st-chatu8'&&(doc.getElementById('option_toggle_AN88')||typeof win.showChatuSettingsPanel==='function')){native.append(action(t('打开 st-chatu8 的设置','Open st-chatu8 settings'),()=>{const trigger=doc.getElementById('option_toggle_AN88');if(trigger)trigger.click();else win.showChatuSettingsPanel();}));}else if(roots.length){for(const r of roots)settings.open(r,e.label,{openEditor:present,preserve:!!r.querySelector('.littlewhitebox.settings-grid')||/柏宝箱|酒馆助手|QR助手|st-chatu8|菜单精简器|Tavern Helper/i.test(e.label)});}else native.append(enabled(e)?noSettings(e):make('p','cwex-empty',t('扩展已停用，启用并刷新后可查看设置。','Enable and reload to view this extension’s settings.')));
  }
  function open(e){back();active=e;detail.replaceChildren();const backButton=action('',back,'cwex-back');backButton.append(icon('chevl'),make('span','cwex-btn-label',t('扩展','Extensions')));const head=make('div','cwex-detail-head'),text=make('div','cwex-detail-text');text.append(make('h2','',e.label),make('div','cwex-meta'));head.append(badge(e),text);detail.append(backButton);const reload=make('div','cwex-reload');reload.append(make('span','',t('改动刷新后生效','Reload to apply changes')),action(t('现在刷新','Reload now'),()=>win.location.reload()));detail.append(reload,head);
    const actions=make('div','cwex-actions');if(third(e)){const checkButton=iconAction('retry','',()=>e.update?.kind==='available'?update(e):check(e,true));checkButton.dataset.detailUpdate='1';actions.append(checkButton,iconAction('branch',t('切换分支','Switch branch'),()=>branch(e)));const home=iconAction('external',t('项目主页','Project home'),()=>homepage(e));home.dataset.homepage='1';actions.append(home);}detail.append(actions);
    const card=make('div','cwex-card');for(const [title,desc,control]of [[t('启用这个扩展','Enable this extension'),t('改动刷新酒馆后生效','Reload to apply changes'),switchButton(e)],[t('在扩展列表里显示','Show in extension list'),t('关掉只是不显示，扩展照常运行','Hidden extensions keep running'),switchButton(e,true)]]){const r=make('div','cwex-row'),info=make('div','cwex-text');info.append(make('div','cwex-name',title),make('div','cwex-meta',desc));r.append(info,control);card.append(r);}detail.append(card,make('h3','cwex-section-title',e.label+' '+t('自己的设置','settings')));
    const native=make('div','cwex-native-settings');detail.append(native);show('detail');
    renderSettings(e,native);
    if(third(e)){detail.append(make('h3','cwex-section-title',t('移除','Remove')));const danger=make('div','cwex-card cwex-danger-zone'),del=actionRow('trash',t('删除这个扩展','Delete this extension'),t('会删掉扩展文件夹；它保存的设置不一定一起删除','Deletes the extension folder; saved settings may remain'),()=>remove(e),'cwex-delete');danger.append(del);detail.append(danger);}v2dDetail(e);paint();
  }
  function ordered(){const r=records(),rank=new Map(r.map((v,i)=>[v.id,i]));return [...entries.values()].filter(e=>!e.deleted).sort((a,b)=>(rank.get(a.id)??1e6)-(rank.get(b.id)??1e6));}
  function reorder(id,before,after=false){const e=entries.get(id),other=entries.get(before);if(!e||!other||groupFor(e)!==groupFor(other)||id===before)return;const r=records(),i=r.findIndex(x=>x.id===id),[item]=r.splice(i,1);r.splice(r.findIndex(x=>x.id===before)+(after?1:0),0,item);save(r);renderSort();}
  function renderSort(){clearDrag();editor.replaceChildren();const top=make('div','cwex-page-heading');top.append(make('h2','',t('排序和隐藏','Order and visibility')),action(t('完成','Done'),back,'cwex-primary'));editor.append(top,make('p','cwex-description',t('拖左边的把手调整顺序；点眼睛把扩展从列表里藏起来。藏起来的扩展照常运行。','Drag a handle to reorder within a group. Hidden extensions keep running.')));
    for(const group of groups){editor.append(make('h3','cwex-section-title',groupLabels[group]));const card=make('div','cwex-card cwex-sort-group');card.dataset.group=group;editor.append(card);
      for(const e of ordered().filter(e=>groupFor(e)===group)){const row=make('div','cwex-row cwex-sort-row');row.dataset.sortId=e.id;const grip=make('button','cwex-grip','⠿');grip.type='button';grip.setAttribute('aria-label',t('拖动排序 ','Reorder ')+e.label);grip.draggable=true;row.append(grip,badge(e),make('span','cwex-text cwex-name',e.label));const eye=action('',()=>{visibility(e,!hidden(e));renderSort();},'cwex-eye');eye.append(icon(hidden(e)?'eyeoff':'eye'));eye.setAttribute('aria-label',(hidden(e)?t('显示 ','Show '):t('隐藏 ','Hide '))+e.label);eye.disabled=e.id===own;eye.dataset.eyeFor=e.id;row.append(eye);card.append(row);row.classList.toggle('cwex-hidden-item',hidden(e));
        grip.addEventListener('dragstart',event=>{startDrag(e.id,row);sortDrag.start(event,e.id);});
        row.addEventListener('drop',event=>{
          if(sortDrag.read(event)!==dragged||!canDropOn(row))return;
          event.preventDefault();
          reorder(dragged,e.id,dropAfter(row,event.clientY));
        });
        grip.addEventListener('keydown',event=>{if(!['ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();const a=ordered().filter(x=>groupFor(x)===group),i=a.indexOf(e),target=a[i+(event.key==='ArrowUp'?-1:1)];if(!target)return;if(event.key==='ArrowUp')reorder(e.id,target.id);else reorder(target.id,e.id);editor.querySelector('[data-sort-id="'+win.CSS.escape(e.id)+'"] .cwex-grip')?.focus();});
        // Pointer drag supports phones without HTML drag-and-drop. The handle
        // captures the pointer; native plugin controls are never involved.
        grip.addEventListener('pointerdown',event=>{
          if(event.pointerType==='mouse'||event.button!==0||!event.isPrimary)return;
          grip.setPointerCapture(event.pointerId);startDrag(e.id,row,event.pointerId);
        });
        grip.addEventListener('pointerup',event=>{
          if(dragged!==e.id||event.pointerId!==dragPointer)return;
          const target=pointerRow(event);
          if(canDropOn(target))reorder(e.id,target.dataset.sortId,dropAfter(target,event.clientY));
          clearDrag();
        });
      }}
    editor.append(action(t('恢复默认顺序','Restore default order'),()=>{prefs.removeItem(key);renderSort();paint();},'cwex-reset'));
  }
  function edit(){if(!page)return;back();sorting=true;renderSort();show('sort');}
  // 333 小修：「其他原生设置」不再把原生扩展页整块塞进弹窗。原生页里除了各扩展的抽屉，只剩顶上那一行（标题、更新通知、
  // 管理、安装）和已弃用的 Extras API：通知和 Extras 已经在列表的「选项」里；这里放原生管理 / 安装两个入口，
  // 再把 CW 认不出来、没有详情页的扩展设置用卡片包起来放进「其他设置」，返回时放回原处。
  function unclaimedRoots(){const claimed=[...entries.values()].flatMap(e=>e.roots).filter(r=>r.isConnected);return [...panel.querySelectorAll('#extensions_settings>*,#extensions_settings2>*')].filter(c=>!claimed.some(r=>r===c||r.contains(c)||c.contains(r))&&c.querySelector('input:not([type=hidden]),select,textarea,button,.menu_button'));}
  function openNativeSettings(){back();nativeOpen=t('其他原生设置','Other native settings');detail.replaceChildren();const backButton=action('',back,'cwex-back');backButton.append(icon('chevl'),make('span','cwex-btn-label',t('扩展','Extensions')));
    const heading=make('div','cwex-page-heading');heading.append(make('h2','',t('其他原生设置','Other native settings')));detail.append(backButton,heading);
    detail.append(make('h3','cwex-section-title',t('酒馆原生入口','SillyTavern native entries')),make('p','cwex-description cwex-section-note',t('CW 的列表出问题时，可以从这里用酒馆自己的界面。','If the CW list misbehaves, use SillyTavern’s own screens from here.')));
    const entriesCard=make('div','cwex-card cwex-native-entries');for(const [id,ic,title]of [['extensions_details','cube',t('原生的管理扩展','Native extension manager')],['third_party_extension_button','clouddown',t('原生的安装扩展','Native extension installer')]]){const r=actionRow(ic,title,'',()=>{const n=doc.getElementById(id);if(!n)throw Error(t('找不到酒馆的原生按钮','Native button not found'));n.click();},'cwex-native-entry');r.dataset.nativeEntry=id;r.append(make('span','cwex-chevron cwex-chevron-always','›'));entriesCard.append(r);}detail.append(entriesCard);
    detail.append(make('h3','cwex-section-title',t('其他设置','Other settings')));const rest=unclaimedRoots(),returns=[];
    if(!rest.length)detail.append(make('p','cwex-empty cwex-no-other',t('没有其他设置。','No other settings.')));
    for(const c of rest){const card=make('div','cwex-card cwex-unclaimed');card.dataset.unclaimed=c.id||'';const name=c.querySelector('h3,h4,b,strong')?.textContent.trim()||(c.id||'').replace(/_container$/,'').replace(/[_-]+/g,' ')||t('未识别的扩展','Unrecognized extension');const head=make('div','cwex-row cwex-unclaimed-head');head.append(make('div','cwex-name',name));const body=make('div','cwex-unclaimed-body');const mark=doc.createComment('cw-native-options-return');c.before(mark);returns.push([c,mark]);body.append(c);card.append(head,body);detail.append(card);}
    nativeReturn=()=>{for(const [n,m]of returns.reverse())if(m.parentNode)m.replaceWith(n);};show('detail');paint();}
  // 334 反馈：旧版 Extras API 也是推进的一页。原生的地址、密钥、自动连接、状态和「连接」按钮搬进 CW 卡片（还是原来的元素，
  // 酒馆自己的事件照常），返回时放回原处。
  function openExtras(){back();const get=id=>doc.getElementById(id),url=get('extensions_url');if(!url)return;nativeOpen=t('旧版 Extras API','Legacy Extras API');detail.replaceChildren();
    const backButton=action('',back,'cwex-back');backButton.append(icon('chevl'),make('span','cwex-btn-label',t('扩展','Extensions')));const heading=make('div','cwex-page-heading');heading.append(make('h2','',nativeOpen));
    detail.append(backButton,heading,make('p','cwex-description',t('酒馆已经不再维护 Extras。只有连旧的 SillyTavern Extras 服务器时才用得到，现在的扩展一般不需要它。','Extras is deprecated. Only needed for an old SillyTavern Extras server.')));
    const returns=[],take=(n,to)=>{if(!n)return;const m=doc.createComment('cw-extras-return');n.before(m);returns.push([n,m]);to.append(n);};
    const card=make('div','cwex-card cwex-extras');const row=(tag,name,meta)=>{const r=make(tag,'cwex-row'),txt=make('span','cwex-text');txt.append(make('span','cwex-name',name));if(meta)txt.append(make('span','cwex-meta',meta));r.append(txt);card.append(r);return r;};
    const field=(name,node)=>{if(!node)return;const r=make('label','cwex-row cwex-extras-field');r.append(make('span','cwex-name',name));card.append(r);take(node,r);};
    field(t('地址','URL'),url);field(t('密钥','API key'),get('extensions_api_key'));
    const auto=get('extensions_autoconnect');if(auto)take(auto,row('label',t('自动连接','Auto-connect'),t('打开酒馆时自动连上','Connect when opening SillyTavern')));
    const status=row('div',t('状态','Status'));take(get('extensions_status'),status.querySelector('.cwex-text'));get('extensions_status')?.classList.add('cwex-meta');take(get('extensions_connect'),status);get('extensions_connect')?.classList.add('cwex-btn');
    detail.append(card);
    nativeReturn=()=>{get('extensions_status')?.classList.remove('cwex-meta');get('extensions_connect')?.classList.remove('cwex-btn');for(const [n,m]of returns.reverse())if(m.parentNode)m.replaceWith(n);};show('detail');paint();}
  /* v2d（修改单第 5 节，稿 design-settings-pages-v2d.html「扩展」）：功能和原来完全一样，只换排法。
     列表：标题行（搜索 / 排序和隐藏 / 安装扩展）→ 标签 → 刷新提示 → 两栏 1.5 : 1（我安装的、隐藏提示、酒馆自带 | 更新、选项）。
     paint() 仍按 class / data-* 在 list 里找这些元素，搬进容器后照样找得到。 */
  function v2dList(){page.classList.add('cw2','cw2-ext');
    const q1=sel=>list.querySelector(':scope>'+sel),heading=q1('.cwex-page-heading'),desc=q1('.cwex-description'),search=q1('.cwex-search'),filters=q1('.cwex-filters'),reload=q1('.cwex-reload'),updates=q1('.cwex-updates');
    if(!heading||!filters)return;heading.classList.add('cw2-bar','cw2-mbar');const sortTop=heading.querySelector('.cwex-sort-top');
    if(search)heading.insertBefore(search,heading.children[1]);if(desc){desc.classList.add('cw2-note');heading.insertBefore(desc,sortTop);}heading.insertBefore(make('span','cw2-sp'),sortTop);
    filters.classList.add('cw2-xtabs');heading.after(filters);if(reload)filters.after(reload);
    const cols=make('div','cw2-cols cw2-w64'),l=make('div','cw2-col'),r=make('div','cw2-col');cols.append(l,r);(reload||filters).after(cols);
    for(const n of [list.querySelector('[data-group-title=third]'),list.querySelector('.cwex-catalog[data-group=third]'),q1('.cwex-hidden-note'),list.querySelector('[data-group-title=other]'),list.querySelector('.cwex-catalog[data-group=other]'),list.querySelector('[data-group-title=builtin]'),list.querySelector('.cwex-catalog[data-group=builtin]'),q1('.cwex-empty')])if(n)l.append(n);
    if(updates){const upd=make('section','cw2-upd');upd.append(make('h3','cwex-section-title',t('更新','Updates')),updates);r.append(upd);}
    const opts=q1('.cwex-options'),optsTitle=opts?.previousElementSibling;if(opts){const os=make('section','cw2-xopts');if(optsTitle?.matches('h3'))os.append(optsTitle);os.append(opts);r.append(os);
      // 行尾用描边 ›：文字后面的「 ›」拆出来放到行尾。
      for(const b of opts.querySelectorAll(':scope>.cwex-btn')){const tx=b.textContent;if(/\s›$/.test(tx)){b.textContent=tx.replace(/\s›$/,'');b.append(make('span','cwex-chevron cwex-chevron-always','›'));}}}
  }
  // 排序和隐藏：renderSort() 一行不改。它每次重画后（MutationObserver），把标题、说明、恢复默认顺序、完成收进标题行，两组放进两栏。
  function v2dSort(){if(!editor||editor.querySelector(':scope>.cw2-cols'))return;const top=editor.querySelector(':scope>.cwex-page-heading');if(!top)return;editor.classList.add('cw2-xsort');
    // 键盘上下键排序后 renderSort 把焦点放回把手；搬进栏里会丢焦点，搬完再放回去。
    const focused=editor.contains(doc.activeElement)?doc.activeElement:null;
    const h2=top.querySelector('h2'),done=top.querySelector('.cwex-primary'),desc=editor.querySelector(':scope>.cwex-description'),reset=editor.querySelector(':scope>.cwex-reset');
    top.classList.add('cw2-bar','cw2-sortbar');const bk=action('',back,'cwex-back cw2-sortback');bk.append(icon('chevl'),make('span','cwex-btn-label',t('扩展','Extensions')));top.prepend(bk);
    if(desc&&h2){desc.classList.add('cw2-note');h2.after(desc);}const sp=make('span','cw2-sp');(desc||h2||bk).after(sp);if(reset&&done)top.insertBefore(reset,done);
    const titles=[...editor.querySelectorAll(':scope>.cwex-section-title')],cards=[...editor.querySelectorAll(':scope>.cwex-sort-group')];
    const cols=make('div','cw2-cols'),l=make('div','cw2-col'),r=make('div','cw2-col');cols.append(l,r);
    titles.forEach((h,i)=>{const c=cards[i];if(c)h.append(make('span','cwex-count',String(c.querySelectorAll(':scope>.cwex-sort-row').length)));const col=c?.dataset.group==='builtin'?r:l;col.append(h);if(c)col.append(c);});editor.append(cols);
    if(focused?.isConnected&&doc.activeElement!==focused)focused.focus({preventScroll:true});
  }
  let dragRow=null, dropRow=null, dragPointer=null, sortDrag=null;
  function startDrag(id,row,pointer=null){
    clearDrag();dragged=id;dragRow=row;dragPointer=pointer;row.classList.add('cw2-drag');
  }
  function clearDrag(){
    dragRow?.classList.remove('cw2-drag');clearDropLine(dropRow);
    dragged=null;dragRow=null;dropRow=null;dragPointer=null;
  }
  function canDropOn(row){
    if(!row||!editor.contains(row)||row===dragRow)return false;
    const source=entries.get(dragged),target=entries.get(row.dataset.sortId);
    return !!source&&!!target&&groupFor(source)===groupFor(target);
  }
  const pointerRow=event=>doc.elementFromPoint(event.clientX,event.clientY)?.closest('.cwex-sort-row');
  function v2dDrag(){
    function over(row,event){
      if(!canDropOn(row))row=null;
      if(dropRow!==row)clearDropLine(dropRow);
      dropRow=row;
      if(row)showDropLine(row,dropAfter(row,event.clientY));
      return !!row;
    }
    on(editor,'dragover',event=>{
      if(over(event.target.closest?.('.cwex-sort-row'),event))event.preventDefault();
    });
    on(editor,'dragleave',event=>{if(!editor.contains(event.relatedTarget))over(null,event);});
    on(editor,'dragend',clearDrag);
    on(editor,'pointermove',event=>{if(event.pointerId===dragPointer)over(pointerRow(event),event);});
    for(const type of ['pointercancel','lostpointercapture'])on(editor,type,event=>{
      if(event.pointerId===dragPointer)clearDrag();
    });
  }
  // 详情：标题行（返回 / 徽标 / 名字 / 元信息）→ 两栏 1.5 : 1（自己的设置 | 这个扩展、版本、移除）。
  function v2dDetail(e){const q1=sel=>detail.querySelector(':scope>'+sel),bk=q1('.cwex-back'),reload=q1('.cwex-reload'),head=q1('.cwex-detail-head'),actions=q1('.cwex-actions'),native=q1('.cwex-native-settings');if(!head||!native)return;detail.classList.add('cw2-xdetail');
    const titles=[...detail.querySelectorAll(':scope>h3.cwex-section-title')],switchCard=q1('.cwex-card:not(.cwex-danger-zone)'),danger=q1('.cwex-danger-zone');
    const bar=make('div','cw2-bar cw2-mbar cw2-xbar');if(bk)bar.append(bk);bar.append(head);detail.prepend(bar);if(reload)bar.after(reload);
    const cols=make('div','cw2-cols cw2-w64 cw2-stretch'),l=make('div','cw2-col'),r=make('div','cw2-col');cols.append(l,r);detail.append(cols);
    const own=make('section','cw2-own cw2-grow'),box=make('div','cwex-card cw2-own-card');if(titles[0])own.append(titles[0]);box.append(native);own.append(box);l.append(own);
    if(switchCard){const s1=make('section','cw2-this');s1.append(make('h3','cwex-section-title',t('这个扩展','This extension')),switchCard);r.append(s1);}
    if(actions?.children.length){const s2=make('section','cw2-ver'),vc=make('div','cwex-card');s2.append(make('h3','cwex-section-title',t('版本','Version')),vc);
      const rowFor=(btn,title,meta,label)=>{if(!btn)return;const rr=make('div','cwex-row'),tx=make('div','cwex-text');tx.append(make('div','cwex-name',title));if(meta)tx.append(make('div','cwex-meta',meta));if(label){const lb=btn.querySelector('.cwex-btn-label');if(lb)lb.textContent=label;}rr.append(tx,btn);vc.append(rr);};
      const chk=actions.querySelector('[data-detail-update]'),home=actions.querySelector('[data-homepage]'),br=[...actions.children].find(b=>b!==chk&&b!==home);
      rowFor(chk,t('更新','Update'),[e.version&&t('当前 ','Current ')+e.version,e.update?.branch].filter(Boolean).join(' · '));rowFor(br,t('切换分支','Switch branch'),'',t('切换','Switch'));rowFor(home,t('项目主页','Project home'),'',t('打开','Open'));
      actions.remove();r.append(s2);}
    if(danger){const s3=make('section','cw2-rm');if(titles[1])s3.append(titles[1]);s3.append(danger);r.append(s3);}
  }
  function buildList(){list=make('div','cwex-list-view');const heading=make('div','cwex-page-heading');heading.append(make('h2','',t('扩展','Extensions')),iconAction('updown',t('排序和隐藏','Order and visibility'),edit,'cwex-sort-top'),iconAction('plus',t('安装扩展','Install extension'),()=>host.openThirdPartyExtensionMenu(),'cwex-primary cwex-install'));list.append(heading,make('p','cwex-description',t('点一行进入这个扩展的设置；开关决定它是否启用。','Open a row for settings; switches control whether extensions are enabled.')));
    const reload=make('div','cwex-reload');reload.append(make('span','',t('改动刷新后生效','Reload to apply changes')),iconAction('retry',t('现在刷新','Reload now'),()=>win.location.reload()));list.append(reload);const updates=make('div','cwex-updates');const copy=make('div','cwex-update-copy');copy.append(make('div','cwex-update-title'),make('small','cwex-update-names'));updates.append(copy,iconAction('retry',t('全部更新','Update all'),updateAll));list.append(updates);
    const search=make('input','cwex-search');search.type='search';search.placeholder=t('搜索扩展','Search extensions');search.setAttribute('aria-label',search.placeholder);search.addEventListener('input',()=>{q=search.value.trim().toLocaleLowerCase();paint();});list.append(search);
    const filters=make('div','cwex-filters');for(const [id,label]of [['all',t('全部','All')],['updates',t('有更新','Updates')],['disabled',t('已停用','Disabled')],['hidden',t('已隐藏','Hidden')]]){const b=action(label,()=>{filter=id;paint();},'cwex-filter');b.dataset.filter=id;filters.append(b);}list.append(filters);
    for(const group of groups){const fold=group==='builtin',h=make(fold?'button':'h3','cwex-section-title '+(fold?'cwex-fold':''));h.append(make('span','cwex-group-label',groupLabels[group]),make('span','cwex-count'));if(fold){h.type='button';h.append(make('span','cwex-fold-label'));h.addEventListener('click',()=>{systemOpen=!systemOpen;paint();});}const card=make('div','cwex-card cwex-catalog');h.dataset.groupTitle=group;card.dataset.group=group;list.append(h,card);}
    list.append(make('p','cwex-empty',t('没有符合条件的扩展。','No matching extensions.')));const hiddenNote=make('p','cwex-hidden-note');list.append(hiddenNote);hiddenNote.append(action('',()=>{filter='hidden';paint();},'cwex-hidden-link'));
    list.append(make('h3','cwex-section-title',t('选项','Options')));const options=make('div','cwex-card cwex-options');options.append(action(t('排序和隐藏','Order and visibility')+' ›',edit,'cwex-sort-option'));
    const notify=doc.getElementById('extensions_notify_updates');if(notify){const r=make('label','cwex-row'),txt=make('span','cwex-text');txt.append(make('span','cwex-name',t('扩展有更新时通知','Notify about extension updates')),make('span','cwex-meta',t('打开酒馆时检查一次','Check when opening SillyTavern')));r.append(txt);moveNative(notify,r);options.append(r);}
    if(doc.getElementById('extensions_url'))options.append(action(t('旧版 Extras API','Legacy Extras API')+' ›',openExtras,'cwex-extras-option'));
    options.append(action(t('其他原生设置','Other native settings')+' ›',openNativeSettings));list.append(options);
    page.append(list);detail=make('div','cwex-detail-view');editor=make('div','cwex-sort-view');sortDrag=guardSortDrag(editor);page.append(detail,editor);show('list',false);
    v2dList();const sortMo=new win.MutationObserver(v2dSort);sortMo.observe(editor,{childList:true});listeners.push(()=>sortMo.disconnect());v2dDrag();
  }
  function reconcile(){
    if(!host)return;
    const installed=[...entries.values()].filter(e=>e.type!=='ui').map(e=>({
      id:e.id,third:third(e),label:norm(e.label),name:norm(e.manifest.display_name),dir:norm(e.id.split('/').pop()),
    }));
    const external=installed.filter(e=>e.third);
    for(const e of entries.values())e.roots=[];
    const unique=matches=>matches.length===1?matches[0].id:null;
    for(const c of panel.querySelectorAll('#extensions_settings>div,#extensions_settings2>div')){
      const drawers=c.matches('.inline-drawer')?[c]:[...c.querySelectorAll(':scope>.inline-drawer,:scope>div>.inline-drawer')];
      for(const d of drawers){
        const h=d.querySelector('.inline-drawer-header');
        const label=h?.querySelector('b,strong')?.textContent.trim()||h?.textContent.trim();
        if(!label)continue;
        const name=norm(label.replace(/\s*new!?$/i,'').trim());
        const exact=installed.filter(e=>e.label===name||e.name===name);
        let id=c.id==='claude-web-settings'?own:(exact.length===1&&exact[0].third?exact[0].id:aliases[c.id]||unique(exact));
        const containerId=norm(c.id);
        if(!id&&containerId)id=unique(installed.filter(e=>e.dir&&containerId.startsWith(e.dir)));
        if(!id&&name.length>=2)id=unique(external.filter(e=>e.name.length>=2&&(e.name.includes(name)||name.includes(e.name))));
        const unit=drawers.length>1?(d.parentElement===c?d:d.parentElement):c;
        if(!id&&external.some(e=>e.dir.length>=5)){
          const words=new Set();
          const walker=doc.createTreeWalker(unit,win.NodeFilter.SHOW_ELEMENT);
          for(let el=unit,count=0;el&&count<300;el=walker.nextNode(),count++){
            for(const word of [el.id,...el.classList])if(word)words.add(norm(word));
          }
          id=unique(external.filter(e=>e.dir.length>=5&&[...words].some(word=>word.startsWith(e.dir))));
        }
        if(!id){
          if(c.id)id='ui:'+c.id;
          else{
            if(!anonymousRoots.has(unit))anonymousRoots.set(unit,'ui:#'+ ++nextAnonymousRoot);
            id=anonymousRoots.get(unit);
          }
        }
        let e=entries.get(id);
        if(!e){e={id,label,manifest:{},version:'',type:'ui',control:unit.querySelector('input[type=checkbox]'),roots:[]};entries.set(id,e);}
        if(!third(e)&&!e.roots.length)e.label=label;
        if(!e.roots.includes(unit))e.roots.push(unit);
      }
    }
    for(const [id,e] of entries)if(e.type==='ui'&&!e.roots.length&&e!==active)entries.delete(id);
    // TT can mount a plugin's drawer after its catalog entry has opened.
    const pending=active?.roots.length&&detail.querySelector('.cwex-native-settings>.cwex-no-settings');
    if(pending){const native=pending.parentElement;pending.remove();renderSettings(active,native);}
    paint();
  }
  function paint(){if(!page||disposed)return;const all=ordered(),available=all.filter(e=>e.update?.kind==='available');for(const reload of page.querySelectorAll('.cwex-reload'))hide(reload,!needsReload);const updates=list.querySelector('.cwex-updates');hide(updates,!available.length);const copy=updates.querySelector('.cwex-update-copy');const updateText=t(available.length+' 个扩展有新版本',available.length+' extension updates');set(copy.querySelector('.cwex-update-title'),updateText);set(copy.querySelector('.cwex-update-names'),available.map(e=>e.label).join('、'));
    let count=0;for(const group of groups){const card=list.querySelector('.cwex-catalog[data-group='+group+']'),title=list.querySelector('[data-group-title='+group+']');const items=all.filter(e=>groupFor(e)===group&&(!q||e.label.toLocaleLowerCase().includes(q)||e.id.toLocaleLowerCase().includes(q))&&(filter==='hidden'?hidden(e):filter==='updates'?e.update?.kind==='available':filter==='disabled'?!enabled(e):!hidden(e)));count+=items.length;
      set(title.querySelector('.cwex-count'),String(items.length));hide(title,!items.length);const expanded=group!=='builtin'||systemOpen||!!q||filter!=='all';hide(card,!items.length||!expanded);if(group==='builtin'){if(title.getAttribute('aria-expanded')!==String(expanded))title.setAttribute('aria-expanded',String(expanded));set(title.querySelector('.cwex-fold-label'),expanded?t('收起','Collapse'):t('展开','Expand'));}
      const live=new Set();for(const e of (expanded?items:[])){live.add(e.id);let row=e.row;if(!row){row=make('div','cwex-row cwex-catalog-row');row.dataset.extensionId=e.id;row.setAttribute('role','button');row.tabIndex=0;const txt=make('div','cwex-text');txt.append(make('div','cwex-name',e.label),make('div','cwex-meta'));row.append(badge(e),txt,switchButton(e),make('span','cwex-chevron','›'));row.addEventListener('click',()=>open(e));row.addEventListener('keydown',event=>{if(event.target===row&&['Enter',' '].includes(event.key)){event.preventDefault();open(e);}});e.row=row;}metadata(e,row.querySelector('.cwex-meta'));const isDisabled=!enabled(e);if(row.classList.contains('cwex-disabled')!==isDisabled)row.classList.toggle('cwex-disabled',isDisabled);if(row.parentNode!==card)card.append(row);else {const target=items.indexOf(e);if(card.children[target]!==row)card.insertBefore(row,card.children[target]||null);}}
      for(const row of [...card.children])if(!live.has(row.dataset.extensionId))row.remove();
    }hide(list.querySelector('.cwex-empty'),count!==0);for(const b of list.querySelectorAll('[data-filter]')){if(b.getAttribute('aria-pressed')!==String(filter===b.dataset.filter))b.setAttribute('aria-pressed',String(filter===b.dataset.filter));const k=b.dataset.filter,n=k==='updates'?available.length:k==='disabled'?all.filter(e=>!enabled(e)).length:k==='hidden'?all.filter(hidden).length:0;set(b,(k==='all'?t('全部','All'):k==='updates'?t('有更新','Updates'):k==='disabled'?t('已停用','Disabled'):t('已隐藏','Hidden'))+(n?' '+n:''));}const n=all.filter(hidden).length;hide(list.querySelector('.cwex-hidden-note'),!n||filter!=='all'||!!q);set(list.querySelector('.cwex-hidden-link'),t('另有 '+n+' 个扩展已隐藏，仍在运行 · 查看',n+' hidden extensions keep running · View'));
    for(const b of page.querySelectorAll('[data-switch-for]')){const e=entries.get(b.dataset.switchFor);const checked=String(b.dataset.visibility?!hidden(e):enabled(e)),disabled=!!e.busy||(e.type==='ui'&&!e.control)||!!(b.dataset.visibility&&e.id===own);if(b.getAttribute('aria-checked')!==checked)b.setAttribute('aria-checked',checked);if(b.disabled!==disabled)b.disabled=disabled;}
    if(active){metadata(active,detail.querySelector('.cwex-detail-head .cwex-meta'));const b=detail.querySelector('[data-detail-update]');if(b){const avail=active.update?.kind==='available';setLabel(b,active.busy?t('正在处理…','Working…'):avail?(active.update.remote?t('更新到 ','Update to ')+active.update.remote:t('更新','Update')):t('检查更新','Check for updates'));if(b.classList.contains('cwex-primary')!==avail)b.classList.toggle('cwex-primary',avail);b.disabled=!!active.busy||!!active.checking;}const home=detail.querySelector('[data-homepage]');if(home)home.disabled=!(active.manifest.homePage||active.update?.remoteUrl);}
  }
  async function init(p){panel=p;host=await import(new URL('/scripts/extensions.js',win.location.href).href);api=await import(new URL('/script.js',win.location.href).href);if(disposed)return;
    for(const id of host.extensionNames){const manifest=host.getExtensionManifest?.(id)||{};entries.set(id,{id,label:id===own?'Claude Web':manifest.display_name||id.split('/').pop(),version:String(manifest.version||''),manifest,type:host.extensionTypes[id]||'local',roots:[]});}
    nativeNodes=[...panel.children].filter(n=>!n.matches('.cw-v4-page-title'));panel.querySelector(':scope>.cw-v4-page-title')?.remove();sources=make('div','cwex-sources');panel.append(sources);page=make('div','cw-ext-panel');panel.append(page);panel.classList.add('cw-ext-reordered');buildList();reconcile();on(win,'resize',()=>paintHead(page.dataset.view));
    on(doc,'keydown',event=>{if(event.key==='Escape'&&!doc.querySelector('dialog[open],.cwx-more-menu[open]>.cwx-more-list[data-cwx-chat-menu]')&&(active||sorting||nativeOpen)&&!event.defaultPrevented){event.preventDefault();event.stopImmediatePropagation();back();}},true);
    const observer=new win.MutationObserver(records=>{if(records.some(r=>!page.contains(r.target)&&r.addedNodes.length))requestReconcile();});let reconcileFrame=0;function requestReconcile(){if(!reconcileFrame)reconcileFrame=win.requestAnimationFrame(()=>{reconcileFrame=0;reconcile();});}observer.observe(panel,{childList:true,subtree:true});listeners.push(()=>{observer.disconnect();win.cancelAnimationFrame(reconcileFrame);});
    on(doc,'click',event=>{if(event.target.closest?.('.cw-v4-close,.cw-v4-backdrop')||event.target.closest?.('.cw-v4-navitem')&&!event.target.closest('[data-panel=rm_extensions_block]'))back();},true);const panelObserver=new win.MutationObserver(()=>{if((active||sorting||nativeOpen)&&!panel.classList.contains('openDrawer'))back();});panelObserver.observe(panel,{attributes:true,attributeFilter:['class']});listeners.push(()=>panelObserver.disconnect());
  }
  // Prepare the small catalog while its native drawer is closed. Native plugin
  // trees remain in place; version checks still begin only on actual entry.
  function prepare(p){if(p&&!initializing)initializing=init(p).catch(err);return initializing;}
  prepare(doc.getElementById('rm_extensions_block'));
  return {mount(p){const ready=prepare(p);if(!visited){visited=true;void ready?.then(()=>{if(!disposed){paintHead(page.dataset.view);void checkAll();}});}},edit,refresh:reconcile,destroy(){disposed=true;sortDrag?.end();win.cancelAnimationFrame(frame);returnRoot?.();listeners.splice(0).forEach(f=>f());for(const [n,m]of moves.reverse())if(m.parentNode)m.replaceWith(n);for(const [n,m]of originals.reverse())if(m.parentNode)m.replaceWith(n);page?.remove();sources?.remove();mobileHead?.remove();style.remove();panel?.classList.remove('cw-ext-reordered');}};
}
