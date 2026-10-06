import { officialIcons } from './official-icons.js?v=2.0.118';
import { createDrawerLayouts, actionLabel } from './official-drawers.js?v=2.0.118';
import { tr } from './official-i18n.js?v=2.0.118';
/* Live adaptation of design-v4. Native drawers stay beneath their toggles:
 * ST resolves toggle.parent().find('.drawer-content'), and plugins delegate to
 * their original containers. Never import the preview's snapshots or fake data.
 */
export function installOfficialLayout(win = window) {
  const doc = win.document, root = doc.documentElement;
  const ids = [
    ['left-nav-panel', '预设', 'Presets'], ['rm_api_block', 'API 连接', 'API connection'],
    ['AdvancedFormatting', '格式化', 'Formatting'], ['WorldInfo', '世界书', 'World info'],
    ['Backgrounds', '背景', 'Backgrounds'], ['rm_extensions_block', '扩展', 'Extensions'],
    ['right-nav-panel', '角色卡', 'Characters'], ['PersonaManagement', '用户角色', 'Personas'],
    ['user-settings-block', '偏好设置', 'Preferences'],
  ];
  const zh = () => (doc.querySelector('#ui_language_select')?.value || win.localStorage.getItem('language') || win.navigator.language || 'en').startsWith('zh');
  const t = (cn, en) => zh() ? cn : en;
  const make = (tag, cls, text) => { const n = doc.createElement(tag); n.className = cls; if (text != null) n.textContent = text; return n; };
  const button = (text, fn, cls = 'cw-v4-button') => { const n = make('button', cls, text); n.type = 'button'; n.addEventListener('click', fn); return n; };
  const icon = name => { const n=make('span','cw-v4-icon'); n.setAttribute('aria-hidden','true'); n.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${officialIcons[name] || officialIcons.gear}</svg>`; return n; };
  for (const [name,path] of Object.entries(officialIcons)) root.style.setProperty('--cw-v4-icon-'+name,`url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`)}")`);
  const enabled = () => root.dataset.claudeStructure === 'rail' && root.dataset.claudeSkin === 'classic';
  // The mobile skin can also run in a wide desktop window. Match the CSS
  // breakpoint rather than treating the skin preference as viewport size.
  // Phones use the phone layout at any width (the stylesheets are pinned the
  // same way); on a PC a narrow window still gets the phone arrangement by width.
  const mobile = () => root.dataset.claudeLayout === 'mobile' || win.innerWidth <= 700;
  let shell, current, requestedPanel, previousFocus, raf = 0, destroyed = false;
  const observers = [], disposers = [], dialogs = new Set(), panels = new Map();
  const formattedForms = new WeakSet();
  const enhancedMenus = new WeakSet();
  const formSet = new Set();
  const on = (node, event, fn, options) => { node.addEventListener(event, fn, options); disposers.push(() => node.removeEventListener(event, fn, options)); };
  const observe = (node, fn, options) => { const mo = new win.MutationObserver(fn); mo.observe(node, options); observers.push(mo); return mo; };
  const nativeToggle = panel => panel.closest('.drawer')?.querySelector(':scope > .drawer-toggle');
  /* Preferences: the design's PAGES table (app.js). R.* take the real
   * controls out of ST's panel and put them into "title left, control right"
   * rows; labels and descriptions come from the native text and titles, as in
   * the design. Everything unmapped ends up in Advanced › Other. */
  const PAGES = [
    {key:'look',title:'外观',icon:'palette',group:'偏好设置',lede:'主题、显示样式、尺寸与颜色',sections:[
      ['主题',()=>{const sel=take('themes');addClass(sel,'cw-v4-wide');const r1=prow(t('UI 主题','UI Theme'),'当前使用的界面主题预设',[sel],'cw-v4-stack');
        const r2=R.btns('主题文件',['ui-preset-update-button','ui-preset-save-button','ui_preset_import_button','ui_preset_export_button','ui-preset-delete-button'],{icons:{'ui-preset-update-button':'save','ui-preset-save-button':'saveplus','ui_preset_import_button':'import','ui_preset_export_button':'export','ui-preset-delete-button':'trash'},desc:'覆盖保存 · 另存为新主题 · 导入 · 导出 · 删除',cls:'cw-v4-textbtns',labels:{'ui-preset-update-button':'覆盖保存','ui-preset-save-button':'另存为','ui_preset_import_button':'导入','ui_preset_export_button':'导出','ui-preset-delete-button':'删除'}});
        addClass(doc.getElementById('ui-preset-delete-button'),'cw-v4-danger');const file=take('ui_preset_import_file');if(file&&r2)pm(file,r2);return [r1,r2];}],
      ['显示样式',()=>[R.sel('avatar_style'),R.sel('chat_display'),R.sel('media_display'),R.sel('toastr_position'),R.tog('waifuMode')]],
      ['尺寸',()=>[R.range('chat_width_slider','chat_width_slider_counter'),R.range('font_scale','font_scale_counter'),R.range('blur_strength','blur_strength_counter'),R.range('shadow_width','shadow_width_counter')]],
      ['颜色',()=>['main-text-color-picker','italics-color-picker','underline-color-picker','quote-color-picker','shadow-color-picker','chat-tint-color-picker','blur-tint-color-picker','border-color-picker','user-mes-blur-tint-color-picker','bot-mes-blur-tint-color-picker'].map(id=>R.color(id))],
    ]},
    {key:'ui',title:'界面',icon:'window',group:'偏好设置',lede:'动效、消息上显示的信息、交互方式',sections:[
      ['性能与效果',()=>['reduced_motion','fast_ui_mode','noShadowsmode'].map(i=>R.tog(i))],
      ['消息信息',()=>['messageTimestampsEnabled','messageTimerEnabled','messageModelIconEnabled','messageTokensEnabled','mesIDDisplayEnabled','show_swipe_num_all_messages','hideChatAvatarsEnabled'].map(i=>R.tog(i))],
      ['交互',()=>['expandMessageActions','click_to_edit','compact_input_area','enableZenSliders','enableLabMode'].map(i=>R.tog(i))],
    ]},
    {key:'char',title:'角色处理',icon:'card',group:'偏好设置',lede:'角色列表、导入与角色卡内容',sections:[
      ['角色列表',()=>[R.sel('aux_field'),R.tog('fuzzy_search_checkbox'),R.tog('hotswapEnabled'),R.tog('bogus_folders',(r,lab)=>{const v=lab.querySelector('.tags_view');if(v){const info=r.querySelector('.cw-v4-row-info');let d=info.querySelector('p');if(!d){d=make('p','');info.append(d);}pm(v,d);addClass(v,'cw-v4-linkish');v.dataset.cwLabel=L('管理标签');}}),R.tog('show_card_avatar_urls'),R.tog('zoomed_avatar_magnification')]],
      ['导入',()=>[R.sel('tag_import_setting'),R.tog('world_import_dialog'),R.tog('never_resize_avatars'),R.tog('background_thumbnails_animation')]],
      ['提示词',()=>[R.tog('prefer_character_prompt'),R.tog('prefer_character_jailbreak'),R.tog('spoiler_free_mode')]],
    ]},
    {key:'chat',title:'聊天',icon:'chat',group:'偏好设置',lede:'发送、消息显示、滑动与群聊',sections:[
      ['发送与输入',()=>[R.sel('send_on_enter'),R.tog('continue_on_send'),R.tog('quick_continue'),R.tog('quick_impersonate'),R.tog('restore_user_input'),R.tog('enable_auto_select_input'),R.tog('enable_md_hotkeys')]],
      ['消息',()=>[R.range('chat_truncation','chat_truncation_counter'),R.sel('example_messages_behavior'),R.tog('auto-load-chat-checkbox'),R.tog('auto_scroll_chat_to_bottom'),R.tog('auto_save_msg_edits'),R.tog('confirm_message_delete'),R.tog('auto_fix_generated_markdown'),R.tog('forbid_external_media'),R.tog('allow_name2_display'),R.tog('allow_name1_display'),R.tog('encode_tags'),R.tog('pin_styles')]],
      ['滑动',()=>[R.tog('swipes-checkbox'),R.tog('gestures-checkbox'),R.sel('image_overswipe')]],
      ['群聊',()=>[R.tog('disable_group_trimming'),R.tog('show_group_chat_queue')]],
    ]},
    {key:'gen',title:'生成与流式',icon:'wave',group:'偏好设置',lede:'流式输出、提示音、自动重滑与自动续写',sections:[
      ['流式输出',()=>[R.range('streaming_fps','streaming_fps_counter'),R.tog('smooth_streaming'),R.tog('smooth_streaming_no_think'),R.range('smooth_streaming_speed',null,{label:t('平滑流式速度','Smooth Streaming Speed'),desc:'',hint:true}),R.tog('stream_fade_in')]],
      ['提示音',()=>[R.tog('play_message_sound'),R.tog('play_sound_unfocused')]],
      ['自动重滑（Auto-swipe）',()=>[R.tog('auto_swipe'),R.num('auto_swipe_minimum_length'),R.area('auto_swipe_blacklist','','逗号分隔','cw-v4-area cw-v4-words'),R.num('auto_swipe_blacklist_threshold')]],
      ['自动续写（Auto-Continue）',()=>[R.tog('auto_continue_enabled'),R.tog('auto_continue_allow_chat_completions'),R.num('auto_continue_target_length')]],
    ]},
    {key:'adv',title:'高级',icon:'terminal',group:'系统',lede:'宏与脚本、自动补全、窗口拖动、自定义 CSS、调试',sections:[
      ['宏与 STscript',()=>[R.tog('experimental_macro_engine'),R.tog('stscript_parser_flag_strict_escaping'),R.tog('stscript_parser_flag_replace_getvar')]],
      ['自动补全',()=>{const rows=[R.sel('stscript_autocomplete_state'),R.tog('stscript_autocomplete_autoHide'),R.tog('stscript_autocomplete_showInAllMacroFields'),R.sel('stscript_matching'),R.sel('stscript_autocomplete_style'),R.sel('stscript_autocomplete_select'),R.range('stscript_autocomplete_font_scale','stscript_autocomplete_font_scale_counter')];
        const w=make('div','cw-v4-width-pair');prefParts.push(w);for(const id of ['stscript_autocomplete_width_left','stscript_autocomplete_width_right','stscript_autocomplete_width_left_values','stscript_autocomplete_width_right_values']){const n=take(id);if(n)pm(n,w);}
        const r=prow(t('宽度','Width'),'左右两侧宽度',[]);r.lastElementChild.append(w);return [...rows,r];}],
      ['窗口拖动（MovingUI）',()=>{const r=R.sel('movingUIPresets');const b=take('movingui-preset-save-button');if(r&&b){addClass(b,'cw-v4-pref-btn','cw-v4-icononly');const ic=icon('saveplus');b.prepend(ic);prefParts.push(ic);pm(b,r.querySelector('.cw-v4-row-controls'));}
        return [R.tog('movingUImode'),R.btns('重置面板位置',['movingUIreset'],{cls:''}),r];}],
      ['自定义 CSS',()=>{const ex=prefPanel.querySelector('#CustomCSS-block .editor_maximize');const r=R.area('customCSS',t('自定义 CSS','Custom CSS'),'对整个酒馆界面生效');if(r&&ex){addClass(ex,'cw-v4-pref-btn','cw-v4-icononly');const ic=icon('expand');ex.prepend(ic);prefParts.push(ic);pm(ex,r.querySelector('.cw-v4-row-title'));}return [r];}],
      ['调试与维护',()=>[R.btns('工具',['reload_chat','debug_menu','data_maid_button'],{desc:'重新载入当前聊天 · 调试菜单 · 清理备份和无用文件',cls:'cw-v4-stack'}),R.tog('console_log_prompts'),R.tog('request_token_probabilities'),R.tog('relaxed_api_urls')]],
    ]},
    {key:'acct',title:'账户与语言',icon:'user',group:'系统',lede:'',sections:[
      ['语言',()=>[R.sel('ui_language_select',{label:t('界面语言','UI Language'),desc:'「默认」跟随浏览器语言'})]],
      ['账户',()=>{const r=R.btns('账户',['account_button','admin_button','logout_button'],{cls:''});const v=take('version_display');addClass(v,'cw-v4-version');return [r,v?prow(t('版本','Version'),'',[v]):null];}],
    ]},
  ];
  const L = s => tr(zh(), s);
  // 2.0.268 菜单里每一项的字（design-small-menus-v1）：认识的按钮写自己的短名，插件按钮用它自己的 title 第一行。CSS 用 attr(data-cw-label)。
  const MES_MORE_LABELS = {mes_translate:'翻译',sd_message_gen:'生成图片',mes_narrate:'朗读',mes_prompt:'查看发出的提示词',mes_hide:'不发给 AI',mes_unhide:'重新发给 AI',mes_media_gallery:'切换图片显示方式',mes_media_list:'切换图片显示方式',mes_embed:'附加文件',mes_swipe_picker:'滑动记录',mes_create_bookmark:'创建检查点',mes_create_branch:'创建分支',mes_copy:'复制',mes_ghost:'幽灵消息'};
  const EDIT_LABELS = {mes_edit_done:'保存',mes_edit_cancel:'取消',mes_edit_copy:'复制成一条新消息',mes_edit_add_reasoning:'添加思考过程',mes_edit_up:'上移',mes_edit_down:'下移',mes_edit_delete:'删除这条消息'};
  function labelMenu(menu, map) {
    for (const b of menu.children) {
      const k = [...b.classList].find(c => map[c]);
      const label = k ? L(map[k]) : (b.getAttribute('title') || b.textContent || '').split('\n')[0].trim();
      if (label && b.dataset.cwLabel !== label) b.dataset.cwLabel = label;
    }
  }
  let prefPage = 'look', searchQuery = '', prefPanel = null;
  const prefMoves = [], prefParts = [], prefClasses = [];
  const chatMoves=[];
  function pm(node,host){if(!node||node===host)return;if(node.parentNode){const mark=doc.createComment('cw-v4-pref-return');node.before(mark);prefMoves.push([node,mark]);}host.append(node);}
  const take = id => { const n=doc.getElementById(id); return n && prefPanel?.contains(n) && !n.closest('.cw-v4-pref-pages') ? n : null; };
  const addClass=(n,...c)=>{if(!n)return;n.classList.add(...c);prefClasses.push([n,c]);};
  const clean = s => (s || '').replace(/\s+/g, ' ').replace(/[:：]\s*$/, '').trim();
  function textOf(n){if(!n)return '';const c=n.cloneNode(true);c.querySelectorAll('input,select,textarea,i,a,audio,.fa-solid,.fa-brands,div.fa-solid').forEach(x=>x.remove());return clean(c.textContent);}
  const titleOf=(...els)=>{for(const e of els){const v=e?.getAttribute?.('title')||'';if(v&&!v.startsWith('['))return v.split('\n').map(l=>l.trim()).filter(Boolean).join('\n');}return '';};
  function tagsOf(n){if(!n)return [];const pc=n.querySelector('.fa-desktop'),mob=n.querySelector('.fa-mobile-screen-button'),lab=n.querySelector('.fa-flask');const out=[];if(pc&&!mob)out.push(['仅电脑','']);if(mob&&!pc)out.push(['仅手机','']);if(lab)out.push(['实验',' cw-v4-tag-exp']);return out;}
  // row(): "title + description" on the left, controls on the right.
  function prow(label,desc,ctls,cls='',tags=[]){
    const r=make('div','cw-v4-row cw-v4-pref-row'+(cls?' '+cls:'')),info=make('div','cw-v4-row-info'),box=make('div','cw-v4-row-controls');
    const title=make('div','cw-v4-row-title',label||'');for(const [tag,c] of tags)title.append(make('span','cw-v4-tag'+c,L(tag)));info.append(title);
    if(desc)info.append(make('p','',L(desc)));
    r.append(info,box);for(const c of ctls)if(c)pm(c,box);return r;
  }
  const R = {
    tog(id,extra){const el=take(id);if(!el)return null;const lab=el.closest('label')||el.parentElement;const text=[...lab.children].find(c=>!['INPUT','I','A','AUDIO'].includes(c.tagName));
      const r=prow(textOf(text)||labelFor(el),titleOf(lab),[el],'',tagsOf(lab));lab.querySelectorAll('audio').forEach(a=>pm(a,r));if(extra)extra(r,lab);return r;},
    sel(id,o={}){const el=take(id);if(!el)return null;const wrap=el.closest('div')||el.parentElement;const lab=prefPanel.querySelector(`label[for="${id}"]`)||[...wrap.children].find(c=>c!==el&&/^(SPAN|SMALL|LABEL)$/.test(c.tagName))||wrap.querySelector('label');
      return prow(o.label||textOf(lab)||labelFor(el),o.desc??titleOf(el,wrap,wrap.parentElement),[el],'cw-v4-stackm');},
    range(id,num,o={}){const el=take(id);if(!el)return null;const n=num?take(num):null,box=el.parentElement;const lab=box.querySelector('small span, label, small');const info=box.querySelector('.fa-circle-info');
      let desc=o.desc??titleOf(info,box);const more=[...box.querySelectorAll(':scope > small')].slice(1).map(s=>clean(s.textContent)).join(' ');if(more)desc=desc?`${desc} ${more}`:more;
      const rb=make('div','cw-v4-rangebox');prefParts.push(rb);const hint=o.hint?box.querySelector('.slider_hint'):null;pm(el,rb);if(hint)pm(hint,rb);
      addClass(n,'cw-v4-num');
      const r=prow(o.label||textOf(lab),desc,[],'cw-v4-range cw-v4-stackm',tagsOf(box.querySelector('small')));r.lastElementChild.append(rb);if(n)pm(n,r.lastElementChild);return r;},
    num(id,label){const el=take(id);if(!el)return null;let lab=el.previousElementSibling;while(lab&&!/^(SMALL|SPAN|LABEL)$/.test(lab.tagName))lab=lab.previousElementSibling;addClass(el,'cw-v4-num');return prow(label||textOf(lab)||labelFor(el),titleOf(el),[el]);},
    btns(label,ids,o={}){const els=ids.map(id=>{const b=take(id);if(!b)return null;addClass(b,'cw-v4-pref-btn');
        if(o.icons?.[id]){addClass(b,'cw-v4-icononly');const ic=icon(o.icons[id]);b.prepend(ic);prefParts.push(ic);}
        // 2.0.222 电脑照 Claude Desktop：描边按钮写字。只给传了 labels 的行（主题文件）用，CSS 在电脑上显示这个短名、藏图标。
        if(o.labels?.[id])b.dataset.cwLabel=L(o.labels[id]);
        else b.querySelectorAll('i').forEach(i=>{const g={'fa-recycle':'reset','fa-user-shield':'shield','fa-user-tie':'user','fa-right-from-bracket':'logout'};const k=Object.keys(g).find(c=>i.classList.contains(c));if(k){const ic=icon(g[k]);i.before(ic);prefParts.push(ic);}});
        return b;});
      return prow(label?L(label):'',o.desc||'',els,o.cls??'cw-v4-stackm');},
    color(id){const el=take(id);if(!el)return null;return prow(textOf(el.nextElementSibling),'',[el]);},
    area(id,label,desc,cls='cw-v4-area'){const el=take(id);if(!el)return null;addClass(el,...cls.split(' '));el.dataset.cwV4Text='1';let lab=el.previousElementSibling;while(lab&&!/^(SMALL|SPAN|LABEL)$/.test(lab.tagName))lab=lab.previousElementSibling;if(!lab)lab=el.parentElement?.previousElementSibling;return prow(label||textOf(lab),desc,[el],'cw-v4-stack');},
  };
  const drawerLayouts=createDrawerLayouts({win,t,L,make,button,icon,openEditor,closeSettings,openSelMenu});
  function restorePrefs() {
    const panel = panels.get('user-settings-block'), pages = panel?.querySelector('.cw-v4-pref-pages');
    if (!pages) return;
    const remaining = pages.querySelector('.cw-v4-pref-remaining');
    if (remaining) panel.append(...remaining.childNodes);
    for (const [node,marker] of [...prefMoves].reverse()) if (marker.parentNode) marker.replaceWith(node);
    prefParts.forEach(n=>n.remove());prefParts.length=0;
    for(const [n,c] of prefClasses.splice(0))n.classList.remove(...c);
    doc.getElementById('customCSS')?.removeAttribute('data-cw-v4-text');doc.getElementById('auto_swipe_blacklist')?.removeAttribute('data-cw-v4-text');
    prefMoves.length = 0; pages.remove();
  }
  function restoreAdaptedContainers() {
    doc.querySelectorAll('.cw-v4-swipes,.cw-v4-model').forEach(n=>n.remove());
    for(const [node,mark] of chatMoves.splice(0).reverse())if(mark.parentNode)mark.replaceWith(node);
    drawerLayouts.restore();
    restorePrefs();
    for (const panel of panels.values()) {
      panel.querySelector(':scope>.cw-v4-page-title')?.remove();
      panel.querySelectorAll('.cw-v4-more:not(.cw-v4-created)').forEach(menu => {
        menu.before(...menu.querySelector('.cw-v4-more-list').childNodes); menu.remove();
      });
      panel.querySelectorAll('.cw-v4-action-label').forEach(n=>n.remove());
      if (panel.classList.contains('cw-v4-inactive')) panel.classList.remove('cw-v4-inactive');
    }
    for (const form of formSet) {
      form.querySelectorAll(':scope > .cw-v4-api-row').forEach(row=>{row.before(...row.firstElementChild.childNodes,...row.lastElementChild.childNodes);row.remove();});
      formattedForms.delete(form);
    }
    formSet.clear();
  }
  function selectPrefs(key) {
    prefPage = key;
    shell?.classList.remove('cw-v4-show-nav');
    const p = panels.get('user-settings-block');
    p?.querySelectorAll('.cw-v4-pref-page').forEach(n => { n.hidden = !searchQuery && !mobile() && n.dataset.page !== key; });
    shell?.querySelectorAll('[data-pref]').forEach(b => b.classList.toggle('cw-v4-selected', b.dataset.pref === key));
    if (current?.id !== 'user-settings-block') activate('user-settings-block');
    if (p && !mobile()) p.scrollTop = 0;
    schedule();
  }
  function buildPrefs(panel) {
    if (panel.querySelector('.cw-v4-pref-pages')) return;
    prefPanel = panel;
    const pages = make('div','cw-v4-pref-pages');
    for (const p of PAGES) {
      const page = make('section','cw-v4-pref-page'); page.dataset.page = p.key;
      const prefTitle = make('h2','cw-v4-pref-title',L(p.title));
      // 没有导语时下面紧跟第一个小节标题；电脑上照 Claude Desktop 让小节标题顶上来（见 CSS ⑳）。
      if (!p.lede) prefTitle.setAttribute('data-cw-headed','');
      page.append(prefTitle);
      if (p.lede) page.append(make('p','cw-v4-lede',L(p.lede)));
      for (const [title,build] of p.sections) {
        const sec = make('div','cw-v4-section cw-v4-pref-sec'); sec.append(make('h2','',L(title)));
        for (const r of build()) if (r) sec.append(r);
        page.append(sec);
      }
      pages.append(page);
    }
    // Safety net: anything the table missed still gets a row, so no native
    // control disappears (plugins can add settings here too).
    const hidden = n => { for (let x = n; x && x !== panel; x = x.parentElement) if (x.hidden || x.classList.contains('displayNone') || x.style.display === 'none') return true; return false; };
    const left = [...panel.querySelectorAll('input:not([type=hidden]):not([type=file]),select,textarea,.menu_button,toolcool-color-picker')].filter(n => n.id && !pages.contains(n) && !hidden(n) && n.id !== 'settingsSearch' && !n.closest('.menu_button:not(#' + CSS.escape(n.id) + ')'));
    if (left.length) {
      const other = make('div','cw-v4-section cw-v4-pref-sec'); other.append(make('h2','',L('其他')));
      for (const n of left) other.append(prow(labelFor(n) || n.id, '', [n]));
      pages.querySelector('[data-page="adv"]')?.append(other);
    }
    const remaining = make('div','cw-v4-pref-remaining');
    while (panel.firstChild) remaining.append(panel.firstChild);
    pages.append(remaining); panel.append(pages);
    selectPrefs(prefPage);
  }
  const isOpen = p => p.classList.contains('openDrawer') && !p.classList.contains('closedDrawer');
  /* 2.0.222 电脑照 Claude Desktop（Lulu 录屏逐帧量的）：打开时对话框 100ms 淡入、只放大一点点（0.98→1），
     背景压暗 + 模糊 200ms 淡入；关的时候对话框 70ms 淡出、背景 170ms。曲线前快后慢（≈ easeOutQuart）。
     根节点 data-cw-desk-anim=in / out 只在动画那一小段挂着（data-* 不是 class，见 2.0.217），在设置里切页不重播。
     关：先放 70ms 淡出，再让酒馆关抽屉；背景在 out 期间由 CSS 继续留着淡完。 */
  const DESK_IN = 100, DESK_OUT = 70, DESK_BD_IN = 200, DESK_BD_OUT = 170;
  let deskAnimTimer = 0, deskClosing = 0;
  const calm = () => !!win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function deskAnim(state, ms) {
    win.clearTimeout(deskAnimTimer);
    if (!state) { root.removeAttribute('data-cw-desk-anim'); return; }
    if (root.getAttribute('data-cw-desk-anim') !== state) root.setAttribute('data-cw-desk-anim', state);
    deskAnimTimer = win.setTimeout(() => root.removeAttribute('data-cw-desk-anim'), ms);
  }
  function closeNow() {
    win.clearTimeout(deskClosing); deskClosing = 0;
    closeSelMenu();
    for (const dialog of dialogs) dialog.close();
    for (const p of panels.values()) if (isOpen(p)) nativeToggle(p)?.click();
  }
  function closeSettings() {
    if (mobile() || !current || calm()) { closeNow(); return; }
    if (deskClosing) return;
    deskAnim('out', DESK_BD_OUT + 40);
    deskClosing = win.setTimeout(closeNow, DESK_OUT);
  }
  function activate(id) {
    if (deskClosing) { win.clearTimeout(deskClosing); deskClosing = 0; deskAnim(null); }
    requestedPanel = id;
    const p = panels.get(id);
    if (p && !isOpen(p)) {
      // ST waits for its closing animation when another unpinned drawer is
      // open. Close it synchronously first, keeping our shared shell mounted.
      for (const old of panels.values()) if (old !== p && isOpen(old) && !old.classList.contains('pinnedOpen')) nativeToggle(old)?.click();
      nativeToggle(p)?.click();
    }
  }
  function buildShell() {
    shell = make('div', 'cw-v4-shell'); shell.id = 'cw-v4-settings'; shell.hidden = true;
    on(shell, 'mousedown', e => e.stopPropagation());
    on(shell, 'touchstart', e => e.stopPropagation(), {passive:true});
    shell.setAttribute('role', 'dialog'); shell.setAttribute('aria-label', t('偏好设置', 'Preferences'));
    const nav = make('nav', 'cw-v4-nav'); nav.setAttribute('aria-label', t('设置页面', 'Settings pages'));
    const searchBox=make('label','cw-v4-search'); const search=make('input',''); search.type='search'; search.placeholder=L('搜索设置'); search.setAttribute('aria-label',search.placeholder); searchBox.append(icon('search'),search); nav.append(searchBox);
    on(search,'input',()=>{searchQuery=search.value.trim().toLocaleLowerCase();if(searchQuery)activate('user-settings-block');schedule();});
    // 2.0.208 第六稿的分组：对话 / 内容 / 界面 / 偏好设置（偏好设置的子页都放在最后一组）。
    const NAV_ICONS = ['sliders','plug','type','book','image','puzzle','card','user'];
    for (const [group, order] of [['对话',[0,1,2]],['内容',[3,6,7]],['界面',[4,5]]]) {
      nav.append(make('div', 'cw-v4-group', L(group)));
      for (const i of order) { const [id, cn] = ids[i]; const b = button('', () => activate(id), 'cw-v4-navitem'); b.append(icon(NAV_ICONS[i]),make('span','',L(cn))); b.dataset.panel = id; nav.append(b); }
    }
    nav.append(make('div', 'cw-v4-group', L('偏好设置')));
    for (const p of PAGES) {
      const b = button('', () => {search.value='';searchQuery='';selectPrefs(p.key);}, 'cw-v4-navitem cw-v4-pref-nav'); b.append(icon(p.icon),make('span','',L(p.title))); b.dataset.pref = p.key; nav.append(b);
    }
    const head = make('header', 'cw-v4-head');
    // Phones: ≡ opens the Claude sidebar over the settings page (design v4 dp page); tapping outside returns to it.
    // Closing the page first cost a full-page restyle (~1.4 s frozen on phones), so the page stays open underneath.
    const back = button('', () => { const rail = mobile() && doc.querySelector('.clawd-mobile-menu-button'); if (!rail) { shell.classList.toggle('cw-v4-show-nav'); return; } if (!doc.body.hasAttribute('data-clawd-menu')) rail.click(); }, 'cw-v4-menu'); back.append(icon('menu')); back.setAttribute('aria-label', t('设置导航', 'Settings navigation'));
    const title = make('h1', 'cw-v4-title');
    const close = button('', closeSettings, 'cw-v4-close'); close.append(icon('close')); close.setAttribute('aria-label', t('关闭设置', 'Close settings'));
    head.append(back, title, close);
    const grip = make('div', 'cw-v4-grip'); grip.title = t('拖动移动 · 双击复位', 'Drag to move · Double click to reset');
    shell.append(nav, head, grip); doc.body.append(shell);
    const backdrop = make('div','cw-v4-backdrop');
    doc.querySelector('#top-settings-holder')?.append(backdrop);
    on(backdrop,'mousedown',e=>e.stopPropagation());
    on(backdrop,'click',closeSettings);
    disposers.push(()=>backdrop.remove());
    on(grip, 'dblclick', resetGeometry);
    on(grip, 'pointerdown', e => drag(e, 'move'));
    for (const edge of ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']) {
      const handle = make('div', `cw-v4-resize cw-v4-${edge}`);
      on(handle, 'pointerdown', e => drag(e, edge)); shell.append(handle);
    }
  }
  function resetGeometry() {
    for (const k of ['x','y','w','h']) root.style.removeProperty('--cw-v4-' + k);
  }
  function drag(e, mode) {
    if (mobile() || e.button !== 0 || e.isPrimary === false) return;
    e.preventDefault(); const b = shell.getBoundingClientRect(), x0 = e.clientX, y0 = e.clientY;
    const handle = e.currentTarget; handle.setPointerCapture?.(e.pointerId);
    const move = ev => {
      if (ev.pointerId !== e.pointerId) return;
      let x = b.x, y = b.y, w = b.width, h = b.height;
      const dx = ev.clientX - x0, dy = ev.clientY - y0;
      const minW = Math.min(620, win.innerWidth), minH = Math.min(420, win.innerHeight);
      if (mode === 'move') { x = Math.max(0, Math.min(win.innerWidth-w, x+dx)); y = Math.max(0, Math.min(win.innerHeight-h, y+dy)); }
      else {
        if (mode.includes('e')) w = Math.min(win.innerWidth-x, Math.max(minW,w+dx));
        if (mode.includes('s')) h = Math.min(win.innerHeight-y, Math.max(minH,h+dy));
        if (mode.includes('w')) { x = Math.max(0, Math.min(b.right-minW,x+dx)); w = b.right-x; }
        if (mode.includes('n')) { y = Math.max(0, Math.min(b.bottom-minH,y+dy)); h = b.bottom-y; }
      }
      for (const [k,v] of Object.entries({x,y,w,h})) root.style.setProperty('--cw-v4-'+k, v+'px');
    };
    const end = () => { handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', end); handle.removeEventListener('pointercancel', end); handle.removeEventListener('lostpointercapture', end); };
    handle.addEventListener('pointermove', move); ['pointerup','pointercancel','lostpointercapture'].forEach(type => handle.addEventListener(type,end));
  }
  // Dialog stays inside the original form / world entry / extension container
  // (just outside our row wrapper). Delegated events and closest() still work.
  // opts.head replaces the title, opts.foot goes left of Done, opts.onClose
  // runs after the node is back in place (design openDialog).
  function openEditor(node, title, desc, opts = {}) {
    if (!node.isConnected || node.classList.contains('cw-v4-editing')) return;
    // 2.0.222：扩展标题里带着帮助链接的「?」（图像生成 ?），弹窗标题不要它。
    if (typeof title === 'string') title = title.replace(/\s*[?？]$/, '');
    const anchor = doc.createComment('cw-v4-return'); node.before(anchor);
    // 2.0.221（Lulu：打开某个扩展的设置，它在列表里那一行就没了，关掉后零点几秒才回来）：扩展那一行是包在扩展自己的块里的，
    // 整块搬进弹出页时行也跟着走。搬走期间原处放一份行的拷贝（不能点），搬回来再拿掉。
    const standRow = node.querySelector?.(':scope>.cw-v4-extension-row');
    let standIn = null;
    if (standRow) { standIn = make('div', node.className + ' cw-v4-standin'); standIn.classList.remove('cwx-host', 'cw-v4-editing'); standIn.inert = true; standIn.setAttribute('aria-hidden', 'true'); standIn.append(standRow.cloneNode(true)); anchor.before(standIn); }
    const dialog = make('dialog', 'cw-v4-editor popup');
    const head = make('header', 'cw-v4-editor-head'); head.append(opts.head || make('h2', '', title));
    // 手机上弹窗是从底下升起的弹出页：× / 完成 先播下滑（data-cw-closing），播完再关；电脑和 Escape 直接关。
    // 2.0.222 电脑：照 Claude Desktop 先淡出 70ms 再关（data-cw-desk-out，CSS 放动画）。
    const shut = () => {
      if (!mobile()) { if (calm() || dialog.hasAttribute('data-cw-desk-out')) { dialog.close(); return; } dialog.setAttribute('data-cw-desk-out', ''); win.setTimeout(() => dialog.open && dialog.close(), DESK_OUT); return; }
      if (dialog.hasAttribute('data-cw-closing')) { dialog.close(); return; } dialog.setAttribute('data-cw-closing', ''); syncSheet(); const done = () => dialog.open && dialog.close(); dialog.addEventListener('animationend', e => { if (e.target === dialog) done(); }); win.setTimeout(done, SHEET_MS + 80); };
    dialog._cwShut = shut;
    const close = button('', shut,'cw-v4-button cw-v4-editor-x');close.append(icon('close'));close.setAttribute('aria-label',L('关闭'));head.append(close);
    // 2.0.211 手机（照 Claude 的 Capabilities 页）：左上是「‹ 上一页的名字」，不要 × 和「完成」（CSS 按宽度切换）。
    // 上一页：从别的弹窗里打开的就是那个弹窗的标题，否则是设置页顶栏的标题。
    const parentEditor = anchor.parentElement?.closest('dialog.cw-v4-editor');
    const backLabel = (parentEditor ? parentEditor.querySelector(':scope>.cw-v4-editor-head>h2')?.textContent : doc.querySelector('.cw-v4-shell .cw-v4-title')?.textContent)?.trim() || L('返回');
    const back = button('', shut, 'cw-v4-button cw-v4-editor-back'); back.append(icon('chevl'), make('span', '', backLabel)); back.setAttribute('aria-label', backLabel); head.prepend(back);
    const footer=make('footer','cw-v4-editor-footer');if(opts.foot){footer.append(opts.foot,make('span','cw-v4-grow'));}else footer.classList.add('cw-v4-editor-footer-done');footer.append(button(L('完成'),shut,'cw-v4-button cw-v4-primary'));
    const body = make('div', 'cw-v4-editor-body');
    if (desc) body.append(make('p','cw-v4-editor-desc',desc));
    if (node.matches('textarea')) dialog.classList.add('cw-v4-text-editor');
    // 2.0.209：弹窗放到我们自己包的行外面（仍在原来的表单 / 分区里）。放在行里时，手机按行类型排版的规则
    // （[data-cw-kind=nav] 里的按钮铺满整行等）会套到弹窗和它的按钮上，弹窗飘到左上角、「完成」跑出去。
    let host = null;
    for (let n = anchor.parentElement?.closest('.cw-v4-row,.cw-v4-api-row,.cwx-row,.cwx-block'); n; n = n.parentElement?.closest('.cw-v4-row,.cw-v4-api-row,.cwx-row,.cwx-block')) host = n;
    // 2.0.214：要编辑的东西在收起的 <details> 里（Claude Web「自定义配色」）时，放在 details 里面的 <dialog> 画不出来；挪到最外层收起的 details 后面。
    let place = host || anchor;
    for (let d = place.parentElement?.closest('details:not([open])'); d; d = d.parentElement?.closest('details:not([open])')) place = d;
    place.after(dialog); body.append(node); dialog.append(head, body,footer);
    // Select2 normally attaches results to body, which is behind a modal's
    // top layer. Preserve its existing adapter/options and change only host.
    const pickerHosts=[];
    node.querySelectorAll('select').forEach(select=>{
      const adapter=win.jQuery?.(select).data?.('select2')?.dropdown;
      if(adapter?.$dropdownParent){pickerHosts.push([adapter,adapter.$dropdownParent,select]);adapter.$dropdownParent=win.jQuery(dialog);}
    });
    const oldHidden = node.hidden, oldDisplay = node.style.display, oldPriority=node.style.getPropertyPriority('display');
    node.hidden = false; node.style.setProperty('display', 'block','important'); node.classList.add('cw-v4-editing');
    const focus = doc.activeElement;
    dialogs.add(dialog);
    dialog.addEventListener('close', () => {
      for(const [adapter,parent,select] of pickerHosts){win.jQuery(select).select2('close');adapter.$dropdownParent=parent;}
      node.hidden = oldHidden; node.style.setProperty('display',oldDisplay,oldPriority); node.classList.remove('cw-v4-editing');
      if (anchor.parentNode) anchor.replaceWith(node);
      standIn?.remove();
      try { opts.onClose?.(); } catch (error) { console.warn('[Claude Web] editor close', error); }
      dialog.remove(); dialogs.delete(dialog); syncSheet(); focus?.isConnected && focus.focus({preventScroll: true}); schedule();
    }, {once:true});
    dialog.dataset.cwSheetTitle = typeof title === 'string' ? title : (head.querySelector('h2')?.textContent || '');
    sheetDrag(dialog, head, shut);
    // 2.0.214：手机弹出页里照 App 一页摊开——Claude Web 设置的各组（外观 / 布局……）都展开，组名当灰字标签。
    if (mobile()) node.querySelectorAll?.('details.claude-web-section:not([open])').forEach(d => { d.open = true; });
    // 2.0.219：聚焦一律 preventScroll——弹出页画在最上层，但在 DOM 里还挂在设置面板里，普通 focus() 会把面板滚到它那儿
    // （Lulu：点扩展的设置再关掉，扩展页自己跳到下面去了）。
    dialog.showModal(); syncSheet(); (node.matches('textarea') ? node : mobile() ? back : close).focus({preventScroll: true});
  }
  function labelFor(node) {
    const label = node.id && doc.querySelector(`label[for="${win.CSS.escape(node.id)}"]`);
    return (label?.textContent || node.getAttribute('aria-label') || node.previousElementSibling?.textContent || node.title || node.name || node.id || '').trim().slice(0,120);
  }
  /* 2.0.208 第六稿：按行里的控件给行打类型（data-cw-kind），手机 CSS 按类型排版：
     actions = 几个按钮（拆成一行一个的蓝字操作行）；nav = 一个按钮（整行变成「›」行，按钮铺满整行接点击）；
     selact = 下拉 + 按钮（保存另起一行）。按钮文字是「编辑 / 配置 / 选择」这类泛称时打 data-cw-generic，「›」行里不显示它。
     不读布局（sync 很频繁）；只在类型变化时才写属性。 */
  const GENERIC_BTN = /^(编辑|配置|选择|设置|管理|打开|Edit|Configure|Choose|Open|Manage|Settings)$/i;
  const hiddenEl = k => k.hidden || k.style.display === 'none' || k.classList.contains('displayNone') || k.classList.contains('cw-v4-hidden-native');
  function tagRows(panel) {
    for (const row of panel.querySelectorAll('.cw-v4-row,.cw-v4-api-row')) {
      const ctl = row.querySelector(':scope>.cw-v4-row-controls,:scope>.cw-v4-api-controls');
      let kind = '';
      if (ctl) {
        const kids = [...ctl.children].filter(k => !hiddenEl(k));
        // 用户角色页的「设为默认 / 绑定到当前角色」是画成开关的按钮，保持开关，不改成「›」行。
        const isBtn = k => k.matches('.cw-v4-as-btn,.cw-v4-pref-btn,.cw-v4-button,.menu_button,button') && !k.matches('[id^=lock_],[role=switch],[aria-pressed]');
        const btns = kids.filter(isBtn), more = kids.filter(k => k.matches('details.cw-v4-more')), others = kids.filter(k => !isBtn(k) && !k.matches('details.cw-v4-more'));
        if (btns.length >= 2 && !others.length) kind = 'actions';
        else if (btns.length === 1 && more.length && !others.length) kind = 'actions';
        else if (btns.length === 1 && !more.length && others.every(k => k.matches('.cw-v4-chips'))) kind = 'nav';
        else if (btns.length && others.length === 1 && others[0].matches('select')) kind = 'selact';
        for (const b of btns) {
          const label = (b.querySelector('.cw-v4-action-label')?.textContent || b.textContent || '').trim();
          const generic = GENERIC_BTN.test(label) ? '1' : '';
          if ((b.dataset.cwGeneric || '') !== generic) { if (generic) b.dataset.cwGeneric = generic; else delete b.dataset.cwGeneric; }
        }
      }
      if ((row.dataset.cwKind || '') !== kind) { if (kind) row.dataset.cwKind = kind; else delete row.dataset.cwKind; }
      const many = kind === 'actions' && ctl && [...ctl.children].filter(k => !hiddenEl(k) && k.matches('.cw-v4-as-btn,.cw-v4-pref-btn,.cw-v4-button,.menu_button,button')).length >= 2 ? '1' : '';
      if ((row.dataset.cwMany || '') !== many) { if (many) row.dataset.cwMany = many; else delete row.dataset.cwMany; }
    }
  }
  /* 2.0.222 电脑：2–3 个短选项的下拉画成分段按钮（照 Claude Desktop 外观页的 Small / Medium / Large）。
     原来的 <select> 留着（CSS 在电脑上藏起）当唯一的值：点分段 = 改它的值并派发 input / change，酒馆的 jQuery 处理照常跑；
     酒馆用程序改了值（加载预设等）不会发事件，sync 时按当前值重画选中态，只在真变了才写属性。手机不建，照旧用下拉。 */
  /* 2.0.229 电脑下拉照 Claude Desktop（Lulu 截图：酒馆一直用的是 Windows 原生的深灰列表）：
     按下设置页 / 编辑弹窗里的下拉时不弹原生列表，弹我们自己的：白底圆角卡片、细边 + 软阴影、35px 一行、
     当前项灰底 + 蓝色 ✓；超过 10 项顶上有搜索框；默认在下拉下面、右边对齐，下面放不下就翻到上面。
     <select> 本身仍是唯一的值：选了就改它的值并派发 input / change，酒馆的处理照常跑。
     列表是 popover（最上层）；下拉在模态的编辑弹窗里时，列表挂在那个弹窗里面（挂在外面会被模态弄成不能点）。
     键盘：Enter / 空格 / Alt+↓ 打开，↑↓ 移动，Enter 选，Esc 只关列表（不关设置）。点外面、滚动、改窗口大小都会关。手机不用这个。 */
  let selMenu = null, selFor = null, selActive = -1, selItems = [];
  // 2.0.257 手机也接管（Lulu：手机上的原生下拉列表不好看），CSS ㉞ 画成从底部弹出的列表。
  const selTarget = el => el instanceof win.HTMLSelectElement && !el.multiple && !el.disabled
    && !el.classList.contains('select2-hidden-accessible') && !el.classList.contains('cw-v4-has-seg') && !!el.closest('.cw-v4-panel,dialog.cw-v4-editor');
  function closeSelMenu(refocus) {
    if (!selMenu) return;
    const s = selFor, m = selMenu;
    selMenu = null; selFor = null; selItems = []; selActive = -1;
    try { if (m.matches(':popover-open')) m.hidePopover(); } catch {}
    m.remove();
    s?.removeAttribute('data-cw-open');
    if (refocus && s?.isConnected) s.focus({preventScroll: true});
  }
  function markSel(i) {
    if (i < 0 || i >= selItems.length) return;
    selActive = i;
    selItems.forEach((it, k) => { if (it.el.classList.contains('cw-on') !== (k === i)) it.el.classList.toggle('cw-on', k === i); });
    selItems[i].el.scrollIntoView({block: 'nearest'});
  }
  function stepSel(dir) {
    if (!selItems.length) return;
    let i = selActive;
    for (let n = 0; n < selItems.length; n++) { i = (i + dir + selItems.length) % selItems.length; if (!selItems[i].disabled) { markSel(i); return; } }
  }
  function pickSel(i) {
    const it = selItems[i], s = selFor; if (!it || it.disabled || !s) return;
    closeSelMenu(true);
    if (s.value === it.value) return;
    s.value = it.value;
    s.dispatchEvent(new Event('input', {bubbles: true}));
    s.dispatchEvent(new Event('change', {bubbles: true}));
  }
  function openSelMenu(sel) {
    closeSelMenu();
    const m = make('div', 'cw-v4-selmenu'), list = make('div', 'cw-v4-selmenu-list');
    m.setAttribute('popover', 'manual'); list.setAttribute('role', 'listbox');
    // 2.0.241：列表挂在 body 上，不在 .openDrawer 里；酒馆 script.js 的 html touchstart/mousedown 会把它当成「点了抽屉外面」，
    // 选一项就把整个设置关掉。按下事件在列表这里截住，不再冒泡到 html（选项靠 click 生效，不受影响）。
    for (const t of ['mousedown', 'touchstart']) m.addEventListener(t, e => e.stopPropagation(), {passive: true});
    const opts = [...sel.options].filter(o => !o.hidden && o.style.display !== 'none');
    let search = null;
    // 手机：顶上一行灰字写这个下拉是干什么的（行标题），底下一个「取消」；背景压暗，点暗处也关。
    if (mobile()) {
      const title = (sel.closest('.cw-v4-row,.cw-v4-mapped-setting')?.querySelector('.cw-v4-row-title')?.textContent || labelFor(sel) || '').trim();
      if (title && title.length <= 30) m.append(make('div', 'cw-v4-selmenu-title', title));
      m.addEventListener('click', e => { if (e.target === m) closeSelMenu(); });
    }
    if (opts.length > 10) { search = make('input', 'cw-v4-selmenu-search'); search.type = 'text'; search.placeholder = L('搜索'); search.setAttribute('aria-label', L('搜索')); m.append(search); }
    m.append(list);
    if (mobile()) { const c = button(t('取消', 'Cancel'), e => { e.stopPropagation(); closeSelMenu(); }, 'cw-v4-selmenu-cancel'); m.append(c); }
    const build = q => {
      list.replaceChildren(); selItems = []; let group = null;
      for (const o of opts) {
        const label = (o.textContent || '').trim() || o.value;
        if (q && !label.toLocaleLowerCase().includes(q)) continue;
        const g = o.parentElement?.tagName === 'OPTGROUP' ? o.parentElement.label : null;
        if (g && g !== group) list.append(make('div', 'cw-v4-selmenu-group', g));
        group = g;
        const el = make('div', 'cw-v4-selmenu-item'); el.append(make('span', '', label)); el.setAttribute('role', 'option');
        if (o.dataset.cwDot) { const d = make('span', 'cw-v4-dot'); d.dataset.kind = o.dataset.cwDot; el.prepend(d); }
        if (o.selected) { el.classList.add('cw-sel'); el.setAttribute('aria-selected', 'true'); }
        if (o.disabled) el.classList.add('cw-dis');
        const idx = selItems.length; selItems.push({el, value: o.value, disabled: o.disabled});
        el.addEventListener('pointermove', () => { if (selActive !== idx) markSel(idx); });
        el.addEventListener('click', e => { e.stopPropagation(); pickSel(idx); });
        list.append(el);
      }
      if (!selItems.length) list.append(make('div', 'cw-v4-selmenu-empty', L('没有匹配的选项')));
    };
    build('');
    (sel.closest('dialog[open]') || doc.body).append(m);
    try { m.showPopover(); } catch {}
    selMenu = m; selFor = sel; sel.setAttribute('data-cw-open', '');
    // 位置：右边和下拉对齐，宽度至少和下拉一样（再不小于 220），下面不够就翻上去。
    const r = sel.getBoundingClientRect(), vw = win.innerWidth, vh = win.innerHeight;
    m.style.minWidth = Math.max(220, Math.round(r.width)) + 'px';
    const below = vh - r.bottom - 12, above = r.top - 12, down = below >= 240 || below >= above;
    m.style.maxHeight = Math.max(120, Math.min(400, (down ? below : above) - 6)) + 'px';
    const b = m.getBoundingClientRect();
    m.style.left = Math.round(Math.min(vw - b.width - 8, Math.max(8, r.right - b.width))) + 'px';
    m.style.top = Math.round(down ? r.bottom + 6 : r.top - 6 - b.height) + 'px';
    const cur = selItems.findIndex(it => it.el.classList.contains('cw-sel'));
    markSel(cur >= 0 ? cur : selItems.findIndex(it => !it.disabled));
    if (search) {
      search.addEventListener('input', () => { build(search.value.trim().toLocaleLowerCase()); const c = selItems.findIndex(it => it.el.classList.contains('cw-sel')); markSel(c >= 0 ? c : selItems.findIndex(it => !it.disabled)); });
      if (!mobile()) search.focus({preventScroll: true});
    }
  }
  const segSel = new Map();
  const segOpts = sel => [...sel.options].filter(o => !o.hidden && !o.disabled);
  const segFits = sel => { const o = segOpts(sel); return o.length >= 2 && o.length <= 3 && o.every(x => { const s = x.textContent.trim(); return s && s.length <= 8; }); };
  function paintSeg(sel) {
    const seg = segSel.get(sel); if (!seg) return;
    const opts = segOpts(sel);
    if (seg.childElementCount !== opts.length || opts.some((o, i) => seg.children[i].dataset.value !== o.value || seg.children[i].textContent !== o.textContent.trim())) {
      seg.replaceChildren(...opts.map(o => { const b = button(o.textContent.trim(), () => { if (sel.value === o.value) return; sel.value = o.value; sel.dispatchEvent(new Event('input', {bubbles:true})); sel.dispatchEvent(new Event('change', {bubbles:true})); paintSeg(sel); }, 'cw-v4-segsel-item'); b.dataset.value = o.value; return b; }));
    }
    for (const b of seg.children) { const on = b.dataset.value === sel.value; if ((b.getAttribute('aria-pressed') === 'true') !== on) b.setAttribute('aria-pressed', on ? 'true' : 'false'); }
  }
  function buildSegs(panel) {
    if (mobile()) return;
    panel.querySelectorAll('.cw-v4-row-controls>select:not([multiple]):not(.select2-hidden-accessible)').forEach(sel => {
      if (segSel.has(sel) || !segFits(sel)) return;
      const seg = make('div', 'cw-v4-segsel'); seg.setAttribute('role', 'group');
      sel.after(seg); sel.classList.add('cw-v4-has-seg'); segSel.set(sel, seg);
      on(sel, 'change', () => paintSeg(sel)); paintSeg(sel);
    });
  }
  disposers.push(() => { for (const [sel, seg] of segSel) { seg.remove(); sel.classList.remove('cw-v4-has-seg'); } segSel.clear(); });
  function enhance(panel) {
    drawerLayouts.mount(panel);
    if (panel.id === 'user-settings-block') buildPrefs(panel);
    if (panel.id === 'rm_api_block') {
      panel.querySelectorAll('#openai_api > form,#openai_api > [id$="_form"],#azure_openai_settings').forEach(form => {
        if (formattedForms.has(form)) return;
        formattedForms.add(form);
        formSet.add(form);
        let row;
        for (const child of [...form.children]) {
          if (child.matches('h3,h4,h5')) {
            row = make('div','cw-v4-api-row'); const title = make('div','cw-v4-api-label'); child.before(row);title.append(child);row.append(title,make('div','cw-v4-api-controls'));
          } else if(child.querySelector(':scope>h3,:scope>h4,:scope>h5')) {
            row=null;child.classList.add('cw-v4-api-inline-row');
          } else if(child.matches('label.checkbox_label,.checkbox_label')) {
            row=null;
          } else if(row&&child.matches('small,ol,ul,p,a,.neutral_warning'))row.firstElementChild.append(child);
          else if (row && !child.matches('input[type=hidden]')) row.lastElementChild.append(child);
        }
        // Usage links and step lists read as the row's description. Only the
        // leading text-only nodes move, so restoring keeps the native order.
        form.querySelectorAll(':scope > .cw-v4-api-row').forEach(r=>{
          const [label,controls]=r.children;
          while(controls.firstElementChild&&!controls.firstElementChild.matches('input,select,textarea,button,.menu_button,:has(input,select,textarea,button,.menu_button)')&&controls.firstElementChild.textContent.trim()){controls.firstElementChild.classList.add('cw-v4-api-note');label.append(controls.firstElementChild);}
        });
      });
    }
    // Keep source-specific and plugin ancestors: ST toggles their visibility.
    panel.querySelectorAll('label.checkbox_label:not([data-v-app] *):not(:has(.sr-only))').forEach(n => { if (!n.classList.contains('cw-v4-setting-row')) n.classList.add('cw-v4-setting-row'); });
    panel.querySelectorAll('.range-block').forEach(n => { if (!n.classList.contains('cw-v4-range-row')) n.classList.add('cw-v4-range-row'); });
    // Move real buttons, including data attributes and their visibility state.
    // Menus remain inside each original action group for delegated listeners.
    const moreSelector = '[data-preset-manager-new],[data-preset-manager-rename],[data-preset-manager-import],[data-preset-manager-export],[data-preset-manager-restore],[data-preset-manager-delete],#new_oai_preset,#import_oai_preset,#export_oai_preset,#delete_oai_preset,#create_connection_profile,#view_connection_profile,#edit_connection_profile,#reload_connection_profile,#delete_connection_profile,#personas_backup,#personas_restore';
    const actionGroups = new Map();
    panel.querySelectorAll(moreSelector).forEach(n => {
      if (n.closest('.cw-v4-more,dialog')) return;
      const parent = n.parentElement;
      if (!actionGroups.has(parent)) actionGroups.set(parent,[]);
      actionGroups.get(parent).push(n);
    });
    for (const [parent,actions] of actionGroups) {
      if (actions.length < 2) continue;
      const menu = make('details','cw-v4-more'), summary = make('summary','','⋯');
      summary.setAttribute('aria-label',t('更多操作','More actions'));
      const list = make('div','cw-v4-more-list');
      actions[0].before(menu);menu.append(summary,list);
      for (const action of actions) {
        const label = actionLabel(action,t);
        if (label && !action.textContent.trim()) { const text=make('span','cw-v4-action-label',label);action.append(text); }
        list.append(action);
      }
    }
    panel.querySelectorAll('.cw-v4-more').forEach(menu=>{
      if(enhancedMenus.has(menu))return;enhancedMenus.add(menu);
      const list=menu.querySelector(':scope>.cw-v4-more-list'),summary=menu.querySelector('summary');
      if(!list||!list.showPopover)return;
      list.setAttribute('popover','manual');
      // 2.0.257 手机：从底部弹出（CSS ㉞），末尾一个「取消」，点压暗的地方也关。
      const cancel=button(t('取消','Cancel'),e=>{e.stopPropagation();menu.open=false;},'cw-v4-more-cancel');
      on(menu,'toggle',()=>{
        if(!menu.open){if(list.matches(':popover-open'))list.hidePopover();return;}
        doc.querySelectorAll('.cw-v4-more[open]').forEach(other=>{if(other!==menu)other.open=false;});
        if(mobile())list.append(cancel);else cancel.remove();
        list.showPopover();
        const anchor=summary.getBoundingClientRect(),box=list.getBoundingClientRect();
        list.style.left=Math.max(8,Math.min(anchor.right-box.width,win.innerWidth-box.width-8))+'px';
        list.style.top=Math.max(8,Math.min(anchor.bottom+6,win.innerHeight-box.height-8))+'px';
      });
      on(doc,'click',e=>{if(menu.open&&!menu.contains(e.target))menu.open=false;});
      on(doc,'keydown',e=>{if(e.key==='Escape'&&menu.open){menu.open=false;e.preventDefault();e.stopPropagation();}},true);
      on(list,'click',e=>{if(e.target===list||e.target.closest('.menu_button,button'))menu.open=false;});
      disposers.push(()=>{if(list.matches(':popover-open'))list.hidePopover();});
    });
    // Native textareas continue to save using their original input handlers.
    // 2.0.214：色块都在行的最右边，取色器默认往右展开会跑出屏幕；改成往左展开。
    panel.querySelectorAll('toolcool-color-picker:not([popup-position])').forEach(c => c.setAttribute('popup-position', 'right'));
    /* 2.0.297 bug：颜色选择器自带的色块按钮 48×24，比我们 34 的框宽，露在框外成了两层。让它画成 22 的方块，居中在框里。 */
    panel.querySelectorAll('toolcool-color-picker:not([button-width])').forEach(c => { c.setAttribute('button-width', '22px'); c.setAttribute('button-height', '22px'); c.setAttribute('button-padding', '0'); });
    panel.querySelectorAll('textarea').forEach(ta => {
      if (ta.dataset.cwV4Text || ta.matches('.select2-search__field') || ta.closest('.select2-container,[data-v-app],#extensions_settings,#extensions_settings2,.world_entry,dialog') || ta.id === 'settingsSearch' || ta.classList.contains('displayNone') || ta.style.display === 'none') return;
      ta.dataset.cwV4Text = '1';
      const row = make('div', 'cw-v4-text-row'), preview = make('span', 'cw-v4-text-preview');
      const title = labelFor(ta);
      const edit = button(t('编辑','Edit'), () => openEditor(ta, title));
      const paint = () => { const text = ta.value.trim() || t('（空）','(Empty)'); if (preview.textContent !== text) preview.textContent = text; };
      paint(); on(ta,'input',paint); on(ta,'change',paint);
      row.append(preview,edit); ta.before(row); ta.classList.add('cw-v4-text-source');
      // The preview is refreshed when opening settings as programmatic preset
      // loads need not emit an input event.
      ta._cwV4Paint = paint;
    });
    panel.querySelectorAll('.world_entry').forEach(entry => {
      if (entry.querySelector('.cw-v4-entry-edit')) return;
      const content = entry.querySelector('.inline-drawer-content');
      const header = entry.querySelector('.inline-drawer-header');
      if (!content || !header) return;
      const edit = button(t('配置','Configure'), e => { e.stopPropagation(); openEditor(content, t('世界书条目','World info entry')); }, 'cw-v4-button cw-v4-entry-edit');
      header.append(edit);
    });
    if (panel.id === 'rm_extensions_block') {
      panel.querySelectorAll('#extensions_settings > div, #extensions_settings2 > div').forEach(ext => {
        if (ext.dataset.cwV4Extension || ext.closest('dialog') || !ext.querySelector('.inline-drawer-header')) return;
        ext.dataset.cwV4Extension = '1';
        const header = ext.querySelector('.inline-drawer-header');
        const title = header.querySelector('b,strong')?.textContent.trim() || header.textContent.trim();
        const edit = button(t('配置','Configure'), e => { e.stopPropagation(); openEditor(ext,title); }, 'cw-v4-button cw-v4-extension-edit');
        header.append(edit);
      });
    }
  }
  // Desktop chat header (design chat.js): "name · date ⌄" opens ST's chat
  // files, ⋯ opens ST's options menu. Hidden on the welcome page and phones.
  function syncChatHead(ctx) {
    let head = doc.querySelector('.cw-v4-chat-head');
    const show = enabled() && !mobile() && !doc.body.classList.contains('clawd-welcome') && !!ctx?.chatId;
    if (!show) { head?.remove(); return; }
    if (!head) {
      head = make('header','cw-v4-chat-head');
      const title = button('', () => doc.getElementById('option_select_chat')?.click(), 'cw-v4-chat-title');
      title.append(make('span','cw-v4-chat-name'), make('span','cw-v4-chat-date'), icon('down'));
      const more = button('', () => doc.getElementById('options_button')?.click(), 'cw-v4-chat-more'); more.append(icon('dots')); more.setAttribute('aria-label', L('聊天操作'));
      head.append(title, make('span','cw-v4-grow'), more);
      doc.getElementById('sheld')?.append(head);
    }
    const name = (ctx.groupId ? ctx.groups?.find(g => g.id === ctx.groupId)?.name : ctx.name2) || '';
    const m = String(ctx.chatId).match(/(\d{4})-(\d{2})-(\d{2})@(\d{2})h(\d{2})m/);
    const date = m ? new Date(+m[1], +m[2]-1, +m[3], +m[4], +m[5]).toLocaleString(zh() ? 'zh-CN' : 'en-US', { month: zh() ? 'numeric' : 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : '';
    const set = (sel, v) => { const n = head.querySelector(sel); if (n.textContent !== v) n.textContent = v; };
    set('.cw-v4-chat-name', name.trim()); set('.cw-v4-chat-date', date);
    const left = Math.max(0, Math.round(doc.getElementById('top-settings-holder')?.getBoundingClientRect().right || 0)) + 'px';
    if (head.style.left !== left) head.style.left = left;
  }
  // Model name after the time, in place of ST's provider icon (which is "?"
  // for custom endpoints). Follows ST's "Model icon" switch via body.no-modelIcons.
  const shortModel = id => String(id).split('/').pop().replace(/[-_@](?:\d{8}|\d{4}-\d{2}-\d{2})$/, '');
  function syncModelNames(chat, ctx) {
    chat.querySelectorAll('.mes[is_user="false"]:not([is_system="true"])').forEach(mes => {
      const time = mes.querySelector('.ch_name .timestamp'); if (!time) return;
      const model = ctx?.chat?.[Number(mes.getAttribute('mesid'))]?.extra?.model || '';
      let tag = mes.querySelector('.cw-v4-model');
      if (!model) { tag?.remove(); return; }
      if (!tag) { tag = make('span', 'cw-v4-model'); }
      if (tag.previousElementSibling !== time) time.after(tag);
      const text = shortModel(model);
      if (tag.textContent !== text) tag.textContent = text;
      if (tag.title !== model) tag.title = model;
    });
  }
  // classList.toggle rewrites the class attribute even when nothing changes; SillyTavern's keyboard.js then
  // rescans the whole page for interactables. Only touch body classes on a real change.
  const setBodyClass = (name, on) => { if (doc.body.classList.contains(name) !== Boolean(on)) doc.body.classList.toggle(name, Boolean(on)); };
  function syncChat() {
    const chat = doc.querySelector('#chat'); if (!chat) return;
    if (enabled()) syncModelNames(chat, win.SillyTavern?.getContext?.());
    if(enabled())chat.querySelectorAll('.mes[is_user="false"] .mes_buttons').forEach(bar=>{
      for(const selector of ['.mes_copy','.mes_narrate']){const n=bar.querySelector(selector);if(n&&n.parentElement!==bar){const mark=doc.createComment('cw-v4-chat-return');n.before(mark);chatMoves.push([n,mark]);bar.append(n);}}
      const message=bar.closest('.mes'),source=message.querySelector('.swipes-counter');
      let swipes=bar.querySelector('.cw-v4-swipes');
      if(source&&message.querySelector(':scope>.claude-swipe-right-proxy')){
        if(!swipes){
          swipes=make('div','cw-v4-swipes');const count=make('span','cw-v4-swipe-count');
          for(const [direction,glyph,cn,en] of [['left','‹','上一条回复','Previous reply'],['right','›','下一条回复','Next reply']]){
            const arrow=button(glyph,e=>{e.stopPropagation();message.querySelector(`:scope>.claude-swipe-${direction}-proxy`)?.click();},`cw-v4-swipe-${direction}`);
            arrow.setAttribute('aria-label',t(cn,en));swipes.append(arrow);if(direction==='left')swipes.append(count);
          }bar.prepend(swipes);
        }
        const count=swipes.querySelector('.cw-v4-swipe-count'),value=source.textContent.trim();if(count.textContent!==value)count.textContent=value;
        for(const direction of ['left','right']){const original=message.querySelector(`:scope>.claude-swipe-${direction}-proxy`),arrow=swipes.querySelector(`.cw-v4-swipe-${direction}`);if(arrow.disabled!==Boolean(original?.disabled))arrow.disabled=Boolean(original?.disabled);}
      }else swipes?.remove();
    });
    const ctx = win.SillyTavern?.getContext?.();
    const group = ctx?.groupId != null && ctx.groupId !== '';
    setBodyClass('cw-v4-group-chat', group);
    const input = doc.querySelector('#send_textarea');
    setBodyClass('cw-v4-filled', Boolean(input?.value.trim()));
    syncChatHead(ctx);
    const chrome = doc.querySelector('.clawd-mobile-chrome');
    if (chrome && !chrome.querySelector('.cw-v4-temporary')) {
      const temp = button('', async () => {
        temp.disabled = true;
        try {
          const st = await import(new URL('/script.js', win.location.href).href);
          await st.newAssistantChat({temporary:true});
        } catch (error) { win.toastr?.error?.(t('无法打开临时聊天','Could not open a temporary chat')); console.warn('[Claude Web] temporary chat',error); }
        finally { temp.disabled = false; }
      }, 'cw-v4-temporary');
      temp.setAttribute('aria-label',t('临时聊天','Temporary chat'));temp.title=t('临时聊天','Temporary chat');
      temp.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d=\"M3.6 20.3V12.05a8.45 8.45 0 0 1 16.9 0V20.3Q17.64 16.1 14.83 20.3 12.02 16.1 9.22 20.3 6.41 16.1 3.6 20.3Z\"/><circle cx=\"8.15\" cy=\"11.9\" r=\"1.25\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"15.9\" cy=\"11.9\" r=\"1.25\" fill=\"currentColor\" stroke=\"none\"/></svg>';
      /* 2.0.286（design-flavor-v3，Lulu 定）：照 Claude App，对话页右上角换成「新建对话」气泡 + ⋯（⋯ 纯装饰）；欢迎页仍是幽灵。
         显隐交给 CSS 看 body.clawd-welcome。气泡点了等于侧栏底部「+ 新对话」。 */
      const fresh = button('', () => doc.querySelector('.clawd-mobile-new-chat')?.click(), 'cw-v4-newchat-top');
      fresh.setAttribute('aria-label',t('新对话','New chat'));fresh.title=t('新对话','New chat');
      fresh.innerHTML='<svg viewBox="0 0 24 24" fill="none"><path d="M12 3.6c-4.75 0-8.6 3.35-8.6 7.5 0 2.15 1.03 4.08 2.7 5.45l-.75 3.85 4.05-2.05c.83.2 1.7.3 2.6.3 4.75 0 8.6-3.35 8.6-7.55S16.75 3.6 12 3.6Z" fill="currentColor"/><path d="M12 7.9v6.4M8.8 11.1h6.4" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>';
      const more = make('span', 'cw-v4-more-top'); more.setAttribute('aria-hidden','true');
      more.innerHTML='<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>';
      chrome.append(fresh, more);
      chrome.append(temp);
    }
    const last = [...chat.querySelectorAll('.mes[is_user="false"]:not([is_system="true"])')].at(-1);
    let disclaimer = chat.querySelector('.cw-v4-disclaimer');
    /* 2.0.232 电脑：照 Claude Desktop 把这句放在输入框下面、靠右（Lulu 截图）。不挪元素——试过把它挪到 #form_sheld 里，
       进对话时停不到最底下（别的脚本在加载对话时对它的进出有反应）。改成在 #send_form 上写 data-cw-disclaimer，由 CSS 的 ::after 画出来。
       手机照旧是聊天最后的一行。 */
    const sendForm = doc.getElementById('send_form');
    const setFormNote = v => { if (!sendForm) return; if (v) { if (sendForm.getAttribute('data-cw-disclaimer') !== v) sendForm.setAttribute('data-cw-disclaimer', v); } else if (sendForm.hasAttribute('data-cw-disclaimer')) sendForm.removeAttribute('data-cw-disclaimer'); };
    if (!last || doc.body.classList.contains('clawd-welcome') || !enabled()) { disclaimer?.remove(); setFormNote(''); return; }
    const name = last.querySelector('.name_text')?.textContent.trim() || ctx?.name2 || 'AI';
    const text = `${name} is AI and can make mistakes.`;
    if (!mobile()) { disclaimer?.remove(); setFormNote(text); }
    else {
      setFormNote('');
      if (!disclaimer) { disclaimer = make('div','cw-v4-disclaimer'); chat.append(disclaimer); }
      if (disclaimer.textContent !== text) disclaimer.textContent = text;
      if (disclaimer !== chat.lastElementChild) chat.append(disclaimer);
      const offset=Math.max(0,last.getBoundingClientRect().left-chat.getBoundingClientRect().left-parseFloat(win.getComputedStyle(chat).paddingLeft||0));
      const inset=`${offset}px`;if(disclaimer.style.marginLeft!==inset)disclaimer.style.marginLeft=inset;
    }
    if (input) { const placeholder = t(`回复 ${name}`,`Reply to ${name}`); if (input.placeholder !== placeholder) input.placeholder = placeholder; }
  }
  /* 2.0.248 电脑聊天页：快捷回复那排（#qr--bar，预设 / 插件加的按钮）照 Claude 放到输入框正上方（CSS ㉘，绝对定位、可以换行）。
     它不占位置了，所以量它的实际高度写到 #form_sheld 的 --cw-qr-h，输入区整体往上让出这么高，按钮多到几排也不会盖住聊天。 */
  let qrBar = null;
  const qrRo = win.ResizeObserver ? new win.ResizeObserver(() => paintQrHeight()) : null; if (qrRo) observers.push(qrRo);
  disposers.push(() => doc.getElementById('form_sheld')?.style.removeProperty('--cw-qr-h'));
  function paintQrHeight() {
    const sheld = doc.getElementById('form_sheld'); if (!sheld) return;
    const h = qrBar?.isConnected ? Math.ceil(qrBar.getBoundingClientRect().height) : 0;
    const v = h > 0 ? (h + 8) + 'px' : '0px';
    if (sheld.style.getPropertyValue('--cw-qr-h') !== v) sheld.style.setProperty('--cw-qr-h', v);
  }
  function syncQrBar() {
    const q = doc.getElementById('qr--bar');
    if (q !== qrBar) { if (qrBar) qrRo?.unobserve(qrBar); qrBar = q; if (q) qrRo?.observe(q); }
    paintQrHeight();
  }
  function sync() {
    raf = 0; if (destroyed) return;
    syncQrBar();
    root.toggleAttribute('data-cw-v4', enabled());
    if (!enabled()) { if (shell) shell.hidden = true; for (const dialog of dialogs) dialog.close(); restoreAdaptedContainers(); root.removeAttribute('data-cw-v4-settings'); return; }
    if (!shell) buildShell();
    const settingsSearch=shell.querySelector('.cw-v4-search'),searchHost=mobile()?shell:shell.querySelector('.cw-v4-nav');
    if(settingsSearch.parentElement!==searchHost)searchHost.prepend(settingsSearch);
    ids.forEach(([id]) => {
      const p = doc.getElementById(id); if (!p || panels.get(id) === p) return;
      panels.set(id,p); p.classList.add('cw-v4-panel');
      const glyph=nativeToggle(p)?.querySelector('.drawer-icon');
      const glyphName=['sliders','plug','type','book','image','puzzle','card','user','gear'][ids.findIndex(s=>s[0]===id)];
      glyph?.style.setProperty('--cw-v4-nav-icon',`var(--cw-v4-icon-${glyphName})`);
      // 打开旧聊天性能修复（20261001）：面板关着时里面的增删（表情列表、提示词管理器等重建）不排 sync；面板打开时自身 class 变化会排一次，enhance 那时再补。
      observe(p, records => { if (records.some(r => r.target === p || (r.type === 'childList' && isOpen(p)))) schedule(); }, {childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    });
    const open = [...panels.values()].filter(isOpen);
    const p = open.find(n => n.id === requestedPanel) || (open.includes(current) ? current : open[0]);
    // 2.0.218：只在真的要变时才写 class。classList.toggle / add 就算状态没变也会重写 class 属性、产生一条变更记录——
    // 上面那个观察面板 class 的 observer 收到又排一次 sync，于是设置页开着时 sync 每帧都跑；每次还让酒馆 keyboard.js
    // 把整个面板（扩展页约 2800 个元素）用二十几个选择器重扫一遍。实测弹出页升起那 1.5 秒里转了 90 圈。
    for (const panel of panels.values()) { const off = isOpen(panel) && panel !== p; if (panel.classList.contains('cw-v4-inactive') !== off) panel.classList.toggle('cw-v4-inactive', off); }
    if (p) {
      if (!current) { previousFocus = doc.activeElement; if (!mobile() && !calm()) deskAnim('in', DESK_BD_IN + 60); }
      if (current !== p) { current = p; shell.classList.remove('cw-v4-show-nav'); }
      if (root.getAttribute('data-cw-v4-settings') !== 'open') root.setAttribute('data-cw-v4-settings','open'); shell.hidden = false;
      if (shell.dataset.panel !== p.id) shell.dataset.panel = p.id;
      const spec = ids.find(([id]) => id === p.id);
      // Phones show every preference page on one screen titled "Preferences" (design mpage).
      const titleText = L(p.id === 'user-settings-block' ? (mobile() ? '偏好设置' : PAGES.find(x=>x.key===prefPage)?.title||'偏好设置') : spec[1]);
      if (shell.querySelector('.cw-v4-title').textContent !== titleText) shell.querySelector('.cw-v4-title').textContent = titleText;
      shell.querySelectorAll('[data-pref]').forEach(b => b.classList.toggle('cw-v4-selected', p.id === 'user-settings-block' && b.dataset.pref === prefPage));
      shell.querySelectorAll('[data-panel]').forEach(b => { const active = b.dataset.panel === p.id; if (active) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current'); });
      enhance(p);
      if (mobile()) tagRows(p);
      else { buildSegs(p); for (const sel of segSel.keys()) if (p.contains(sel)) paintSeg(sel); }
      if(p.id!=='user-settings-block'){
        let pageTitle=p.querySelector(':scope>.cw-v4-page-title');
        if(!pageTitle){pageTitle=make('h2','cw-v4-page-title');p.prepend(pageTitle);}
        if(pageTitle.textContent!==titleText)pageTitle.textContent=titleText;
        // 大标题下面紧跟一个带标题的小节时标上 data-cw-headed，电脑上藏掉大标题（Claude Desktop 没有页面大标题，见 CSS ⑳）。只在变化时写。
        const s0=p.querySelector('.cw-v4-drawer-page>.cw-v4-section');
        const headed=!!s0&&!!pageTitle.nextElementSibling?.contains(s0)&&!s0.previousElementSibling&&s0.firstElementChild?.tagName==='H2';
        if(pageTitle.hasAttribute('data-cw-headed')!==headed)pageTitle.toggleAttribute('data-cw-headed',headed);
      }
      if (p.id === 'user-settings-block') p.querySelectorAll('.cw-v4-pref-page').forEach(n => {
        // Search matches a row by its title/description or by its section name, as in the design.
        let hits=0;
        n.querySelectorAll('.cw-v4-pref-sec').forEach(sec=>{
          const inSec=!!searchQuery&&sec.firstElementChild.textContent.toLocaleLowerCase().includes(searchQuery);let secHits=0;
          sec.querySelectorAll(':scope>.cw-v4-pref-row').forEach(row=>{const ok=!searchQuery||inSec||row.querySelector('.cw-v4-row-info')?.textContent.toLocaleLowerCase().includes(searchQuery);if(row.hidden===!!ok)row.hidden=!ok;if(ok)secHits++;});
          if(sec.hidden===!!secHits)sec.hidden=!secHits;hits+=secHits;
        });
        const hide=searchQuery ? !hits : !mobile()&&n.dataset.page!==prefPage;if(n.hidden!==hide)n.hidden=hide;
      });
      p.querySelectorAll('textarea[data-cw-v4-text]').forEach(ta => ta._cwV4Paint?.());
      p.querySelectorAll('input[type=range]').forEach(fill);
    } else {
      if (current) { current = null; previousFocus?.isConnected && previousFocus.focus({preventScroll: true}); }
      shell.hidden = true; root.removeAttribute('data-cw-v4-settings');
    }
    syncChat();
  }
  // Sliders draw the travelled part with --fill (design native.css).
  const fill = r => { const min=+r.min||0, max=+r.max||100, v=((+r.value-min)/((max-min)||1)*100).toFixed(2)+'%'; if (r.style.getPropertyValue('--fill')!==v) r.style.setProperty('--fill',v); };
  function schedule() { if (!raf && !destroyed) raf = win.requestAnimationFrame(sync); }
  const start = () => {
    const keepStyleAfterTheme=()=>{
      const style=doc.querySelector('link[href*="/styles/official-layout.css"]');
      if(!style)return;
      const themes=[...doc.querySelectorAll('link[rel="stylesheet"]')].filter(n=>/\/styles\/(day|night)-(pc|mobile)\.css/.test(n.href));
      if(themes.some(n=>style.compareDocumentPosition(n)&win.Node.DOCUMENT_POSITION_FOLLOWING))doc.head.append(style);
    };
    keepStyleAfterTheme();
    observe(doc.head,keepStyleAfterTheme,{childList:true});
    sync();
    observe(root, schedule, {attributes:true,attributeFilter:['data-claude-structure','data-claude-skin']});
    observe(doc.body, schedule, {attributes:true,attributeFilter:['class','data-clawd-menu']});
    const chat = doc.getElementById('chat'); if (chat) observe(chat, schedule, {childList:true,subtree:true});
    // Typing only changes the filled state. syncChat() walks every assistant message and
    // reads layout, so it stays on the chat observer / schedule() path instead of every keystroke.
    on(doc,'input', e => { if (e.target.id === 'send_textarea') setBodyClass('cw-v4-filled', Boolean(e.target.value.trim())); else if (e.target.type === 'range' && e.target.closest?.('.cw-v4-panel,.cw-v4-editor')) fill(e.target); });
    on(doc,'change', e => { if (e.target.id === 'ui_language_select') schedule(); });
    // Switching pages from the Claude sidebar: SillyTavern closes the open drawer, waits animation_duration, then
    // opens the new one, so for that wait the old page shows half-closed over the sidebar. Close it synchronously
    // first (same as activate()), so SillyTavern opens the new page in the same click.
    on(doc,'click', e => {
      const toggle=e.target.closest?.('.drawer-toggle'); const panel=toggle?.parentElement.querySelector(':scope > .drawer-content');
      if(!panel || !panels.has(panel.id)) return;
      // 手机侧栏开着时点入口由 index.js 接管（showPanelFromRail → activate），这里不重复处理。
      if (e.isTrusted && doc.body.hasAttribute('data-clawd-menu') && !doc.body.classList.contains('clawd-tauritavern-host')) return;
      requestedPanel=panel.id;
      if(!e.isTrusted || isOpen(panel)) return;
      for (const old of panels.values()) if (old !== panel && isOpen(old) && !old.classList.contains('pinnedOpen')) nativeToggle(old)?.click();
    },true);
    on(doc,'keydown', e => { if (e.key === 'Escape' && current && !doc.querySelector('dialog[open]') && !e.defaultPrevented) { closeSettings(); e.preventDefault(); } });
    // 2.0.229 下拉列表（openSelMenu）：按下下拉时拦下原生列表；点外面 / 滚动 / 改窗口大小关掉；键盘在下面那个 Escape 处理之前先接。
    on(doc, 'mousedown', e => {
      const t = e.target;
      if (selMenu && selMenu.contains(t)) return;
      if (t instanceof win.HTMLSelectElement && selTarget(t)) {
        e.preventDefault();
        if (selFor === t) { closeSelMenu(true); return; }
        t.focus({preventScroll: true}); openSelMenu(t); return;
      }
      if (selMenu) closeSelMenu();
    }, true);
    on(doc, 'scroll', e => { if (selMenu && !selMenu.contains(e.target)) closeSelMenu(); }, true);
    // 2.0.243（Lulu：预设从 Default 换成 Kemini，预设自带的「首次使用配置」窗口一点，整个设置就关了）：
    // 酒馆 script.js 的 html touchstart/mousedown 把按在 .openDrawer 外面的都当成「点外面」关抽屉。电脑上设置是对话框，
    // 只该由背景（它自己处理）、× 和 Esc 关；浮在设置上面的东西（别的扩展的窗口、我们挂在 body 上的外壳和浮层）按下时不往上传。
    for (const type of ['mousedown', 'touchstart']) on(doc.body, type, e => {
      if (!current || mobile()) return;
      const t = e.target;
      if (t instanceof win.Element && !t.closest('#top-settings-holder')) e.stopPropagation();
    }, {passive: true});
    on(win, 'resize', () => { if (!mobile()) closeSelMenu(); });
    // 2.0.257 手机：轻点下拉（没滑动）时在 touchend 截住，原生列表不出来，开我们的底部列表。滑动照常滚页面。
    let touchSel = null, touchY = 0;
    on(doc, 'touchstart', e => { const t = e.target; touchSel = t instanceof win.HTMLSelectElement && selTarget(t) ? t : null; touchY = e.touches[0]?.clientY || 0; }, {capture: true, passive: true});
    on(doc, 'touchend', e => {
      const t = touchSel; touchSel = null;
      if (!t || e.target !== t || Math.abs((e.changedTouches[0]?.clientY || 0) - touchY) > 10) return;
      e.preventDefault();
      if (selFor === t) { closeSelMenu(true); return; }
      openSelMenu(t);
    }, {capture: true, passive: false});
    on(win, 'keydown', e => {
      if (!selMenu) {
        const a = doc.activeElement;
        if (selTarget(a) && (e.key === 'Enter' || e.key === ' ' || (e.altKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp')))) { e.preventDefault(); e.stopImmediatePropagation(); openSelMenu(a); }
        return;
      }
      if (!selFor?.isConnected) { closeSelMenu(); return; }
      const k = e.key;
      if (k === 'ArrowDown' || k === 'ArrowUp') stepSel(k === 'ArrowDown' ? 1 : -1);
      else if (k === 'Home') markSel(selItems.findIndex(it => !it.disabled));
      else if (k === 'End') { for (let i = selItems.length - 1; i >= 0; i--) if (!selItems[i].disabled) { markSel(i); break; } }
      else if (k === 'Enter') pickSel(selActive);
      else if (k === 'Escape') closeSelMenu(true);
      else if (k === 'Tab') { closeSelMenu(true); return; }
      else return;   // 其他键（打字）交给搜索框
      e.preventDefault(); e.stopImmediatePropagation();
    }, true);
    disposers.push(() => closeSelMenu());
    // 2.0.222 电脑：酒馆自己的 Escape（RossAscends-mods.js）不看有没有弹窗，见到可见的抽屉就关——在编辑弹窗里按 Escape
    // 会把整个设置一起关掉。在 window 捕获阶段先接：有我们的编辑弹窗就只关最上面那个，否则带淡出关设置。
    // 下拉、⋯ 菜单、提示词编辑页、酒馆自己的弹窗开着时不接，让它们自己处理。
    on(win,'keydown', e => {
      if (e.key !== 'Escape' || e.defaultPrevented || mobile() || !current) return;
      if (doc.querySelector('.select2-container--open,.cw-v4-more[open],#completion_prompt_manager_popup.openDrawer,dialog[open]:not(.cw-v4-editor)')) return;
      const top = [...dialogs].filter(d => d.open).at(-1);
      e.preventDefault(); e.stopImmediatePropagation();
      if (top) top._cwShut?.(); else closeSettings();
    }, true);
    on(win,'resize', () => { resetGeometry(); schedule(); });
    // Read-only keyboard flag for the short-screen (phone landscape) composer.
    // The input keeps focus after Back hides the keyboard, so focus alone is not enough.
    // Some WebViews (Via) shrink the whole page instead of reporting a keyboard
    // height, so also compare with the tallest height seen at this width.
    const vk = win.navigator.virtualKeyboard;
    const fullHeight = new Map();
    const syncKeyboard = () => {
      const vv = win.visualViewport, width = Math.round(win.innerWidth);
      const visible = Math.min(win.innerHeight, vv?.height || win.innerHeight);
      const full = Math.max(fullHeight.get(width) || 0, win.innerHeight);
      fullHeight.set(width, full);
      const height = Math.max(vk?.boundingRect?.height || 0, win.innerHeight - visible, full - visible);
      const open = height > 80 && doc.activeElement?.id === 'send_textarea';
      if (root.hasAttribute('data-cw-v4-kb') !== open) root.toggleAttribute('data-cw-v4-kb', open);
      // Orientation of the device, not of the page: a portrait page squeezed by
      // the keyboard (412×400) would otherwise count as landscape.
      const scr = win.screen, type = scr?.orientation?.type || '';
      const landscape = type ? type.startsWith('landscape') : (scr?.width || 0) > (scr?.height || 0);
      if (root.hasAttribute('data-cw-v4-landscape') !== landscape) root.toggleAttribute('data-cw-v4-landscape', landscape);
    };
    // One read per frame: the keyboard fires several resize events in a row, and
    // each synchronous read here forced a style/layout flush of its own.
    let kbFrame = 0;
    const queueKeyboard = () => { if (!kbFrame) kbFrame = win.requestAnimationFrame(() => { kbFrame = 0; syncKeyboard(); }); };
    disposers.push(() => { if (kbFrame) win.cancelAnimationFrame(kbFrame); });
    if (win.screen?.orientation?.addEventListener) on(win.screen.orientation, 'change', queueKeyboard);
    disposers.push(() => root.removeAttribute('data-cw-v4-landscape'));
    syncKeyboard();
    on(win, 'resize', queueKeyboard);
    if (win.visualViewport) on(win.visualViewport, 'resize', queueKeyboard);
    if (vk?.addEventListener) on(vk, 'geometrychange', queueKeyboard);
    on(doc, 'focusin', () => win.setTimeout(queueKeyboard, 350));
    on(doc, 'focusout', () => win.setTimeout(queueKeyboard, 50));
    disposers.push(() => root.removeAttribute('data-cw-v4-kb'));
    // Message "…" popup (design-v4, 2026-09-29). ST fades the … out and shows
    // .extraMesButtons.visible; any click elsewhere closes it. Here the … stays
    // (pressed) and a second click on it closes the popup through ST's own
    // outside-click handler. The popup is position:fixed and placed from the …
    // button's rect, so no container's overflow has to change. #chat carries a
    // transform, which makes it the containing block of fixed descendants, so
    // the block's origin is measured instead of assuming the viewport.
    const moreOpen = new Map();   // menu -> {since, x, y, max} while opening / open
    let moreFrame = 0;
    // 2.0.271（Lulu：滚动时菜单钉在屏幕上）：有些手机浏览器在手指甩动时停掉页面脚本，逐帧算位置就跟不上。
    // 支持 CSS 锚点定位时，位置交给浏览器（菜单锚在这条消息的「…」上，滚动由合成线程跟随）；JS 只决定往上/往下、横向偏移和限高。
    const moreAnchor = !!win.CSS?.supports?.('anchor-name: --cw-more');
    const moreClear = menu => {
      moreOpen.delete(menu);
      for (const v of ['--cw-more-x','--cw-more-y','--cw-more-max','--cw-more-maxh','--cw-more-dx']) menu.style.removeProperty(v);
      delete menu.dataset.cwMore; delete menu.dataset.cwMoreAnchor;
      const hint = menu.parentElement?.querySelector(':scope > .extraMesButtonsHint'); if (hint) delete hint.dataset.cwMoreAnchor;
    };
    const morePlace = () => {
      moreFrame = 0;
      if (destroyed) return;
      const phone = doc.body.classList.contains('clawd-mobile-layout') || root.dataset.claudeLayout === 'mobile';
      for (const [menu, st] of moreOpen) {
        const hint = menu.parentElement?.querySelector(':scope > .extraMesButtonsHint');
        if (!menu.isConnected || !hint || !enabled()) { moreClear(menu); continue; }
        // The #chat that holds this message: a page can carry a second, empty #chat (seen after
        // toggling the extension), and measuring that one collapses the popup to zero width.
        const chat = menu.closest('#chat')?.getBoundingClientRect();
        // 2.0.271：上面让开顶栏（手机 #top-bar、电脑聊天标题行）再空 10px；下面让开输入框和它上方的快速回复条。
        let topEdge = chat?.top || 0;
        for (const el of doc.querySelectorAll('#top-bar, .cw-v4-chat-head')) {
          const r = el.getClientRects().length ? el.getBoundingClientRect() : null;
          if (r && r.height && r.bottom < win.innerHeight / 2) topEdge = Math.max(topEdge, r.bottom);
        }
        const minX = (chat?.left || 0) + 8, maxX = (chat?.width ? chat.right : win.innerWidth) - 8, minY = topEdge + 10;
        if (!menu.classList.contains('visible')) {
          // ST adds .visible only after the …'s fade; give it a moment, then drop the entry.
          if (st.placed || win.performance.now() - st.since > 1500) moreClear(menu);
          continue;
        }
        const max = Math.max(0, Math.round(maxX - minX));
        if (st.max !== max) { st.max = max; menu.style.setProperty('--cw-more-max', max + 'px'); }
        const h = hint.getBoundingClientRect(), m = menu.getBoundingClientRect();
        // Where the containing block starts on screen: current rect minus the offsets we set.
        const ox = m.left - st.x, oy = m.top - st.y;
        // 2.0.270（Lulu：菜单盖在按钮上、滚动时钉死）：贴着「…」弹出，绝不盖住它。电脑先往下、手机先往上（上面是消息正文，地方大）；
        // 两边都放不下就放在地方大的那边，菜单自己限高、里面滚。位置每帧跟着「…」走。
        let x = h.left - 4;
        x = Math.min(Math.max(x, minX), Math.max(minX, maxX - m.width));
        let bottomEdge = win.innerHeight;
        for (const el of doc.querySelectorAll('#send_form, #qr--bar')) {
          const r = el.getClientRects().length ? el.getBoundingClientRect() : null;
          if (r && r.height && r.top > win.innerHeight / 2) bottomEdge = Math.min(bottomEdge, r.top);
        }
        const maxY = bottomEdge - 8;
        const roomUp = h.top - 6 - minY, roomDown = maxY - (h.bottom + 6);
        const full = menu.scrollHeight;
        let up = phone ? (roomUp >= full || roomUp >= roomDown) : !(roomDown >= full || roomDown >= roomUp);
        const cap = Math.max(120, Math.floor(up ? roomUp : roomDown));
        const capPx = Math.min(full, cap) + 'px'; if (menu.style.getPropertyValue('--cw-more-maxh') !== capPx) menu.style.setProperty('--cw-more-maxh', capPx);
        const mh = Math.min(full, cap);
        let y = up ? h.top - 6 - mh : h.bottom + 6;
        if (moreAnchor) {
          const dir = up ? 'up' : 'down', dx = Math.round(x - h.left) + 'px';
          if (menu.dataset.cwMoreAnchor !== dir) menu.dataset.cwMoreAnchor = dir;
          if (hint.dataset.cwMoreAnchor !== '1') hint.dataset.cwMoreAnchor = '1';
          if (menu.style.getPropertyValue('--cw-more-dx') !== dx) menu.style.setProperty('--cw-more-dx', dx);
          if (!st.placed) { st.placed = true; menu.dataset.cwMore = 'placed'; }
          continue;
        }
        const nx = Math.round(x - ox), ny = Math.round(y - oy);
        if (nx !== st.x || !st.placed) { st.x = nx; menu.style.setProperty('--cw-more-x', nx + 'px'); }
        if (ny !== st.y || !st.placed) { st.y = ny; menu.style.setProperty('--cw-more-y', ny + 'px'); }
        if (!st.placed) { st.placed = true; menu.dataset.cwMore = 'placed'; }
      }
      // Keep following the … (chat scroll, keyboard, resize) only while something is open.
      if (moreOpen.size) moreFrame = win.requestAnimationFrame(morePlace);
    };
    on(doc, 'click', e => {
      if (!enabled() || doc.body.classList.contains('expandMessageActions')) return;
      const hint = e.target.closest?.('.extraMesButtonsHint');
      if (!hint || !hint.closest('#chat')) return;
      const menu = hint.parentElement?.querySelector(':scope > .extraMesButtons');
      if (!menu) return;
      if (menu.classList.contains('visible')) {
        e.stopPropagation(); e.preventDefault();
        doc.body.click();                                 // ST: a click outside closes every open menu
        return;
      }
      labelMenu(menu, MES_MORE_LABELS);
      moreOpen.set(menu, { since: win.performance.now(), x: 0, y: 0, max: -1, placed: false });
      if (!moreFrame) moreFrame = win.requestAnimationFrame(morePlace);
    }, true);
    disposers.push(() => { if (moreFrame) win.cancelAnimationFrame(moreFrame); for (const menu of [...moreOpen.keys()]) moreClear(menu); });
    // 2.0.273（稿 design-composer-edge-user-actions-v1 ② B）：手机上自己消息的编辑 / 删除平时收起，点一下气泡出现、再点收起；
    // 点别处收起。选字、点链接、正在编辑时不动。显隐由 CSS 按 data-cw-acts 决定（只在手机宽度生效）。
    const actsClear = keep => { for (const m of doc.querySelectorAll('#chat > .mes[data-cw-acts]')) if (m !== keep) m.removeAttribute('data-cw-acts'); };
    on(doc, 'click', e => {
      if (!enabled()) return;
      const t = e.target;
      if (t.closest?.('.claude-user-message-actions')) return;
      const text = t.closest?.('#chat > .mes[is_user="true"] .mes_text');
      const mes = text?.closest('.mes');
      if (!mes || t.closest('a, button, input, textarea, summary, #curEditTextarea') || mes.querySelector('#curEditTextarea') || String(win.getSelection?.() || '')) { actsClear(null); return; }
      actsClear(mes);
      mes.toggleAttribute('data-cw-acts');
    });
    disposers.push(() => actsClear(null));
    // 2.0.274 删除消息（稿 design-options-menu-v1）：酒馆的删除模式照旧（点一条 = 选中它和后面所有的），只换样子：
    // 每条左边一个圆勾、选中的淡蓝底；手机顶上「取消 · 已选 N 条 · 全选」+ 底部红色「删除 N 条消息」，电脑底部浮一条「已选 N 条 · 全选 · 取消 · 删除」。
    // 按钮都是代点酒馆原来的「删除 / 取消」；「全选」= 点第一条消息。
    let delUi = null, delObs = null;
    const delCount = () => doc.querySelectorAll('#chat > .mes.selected').length;
    const delPaint = () => {
      if (!delUi) return;
      const n = delCount();
      delUi.count.textContent = n ? L('已选 ') + n + L(' 条') : L('点一条消息，删掉它和后面的');
      delUi.del.textContent = mobile() ? (n ? L('删除 ') + n + L(' 条消息') : L('删除')) : L('删除');
      delUi.del.disabled = !n;
    };
    const delOpen = () => {
      if (delUi) return;
      const top = make('div', 'cw-delbar-top'), bottom = make('div', 'cw-delbar');
      const count = make('span', 'cw-delbar-count');
      const all = button(L('全选'), () => doc.querySelector('#chat > .mes')?.click(), 'cw-delbar-btn cw-delbar-all');
      const cancel = button(L('取消'), () => doc.getElementById('dialogue_del_mes_cancel')?.click(), 'cw-delbar-btn cw-delbar-cancel');
      const del = button(L('删除'), () => doc.getElementById('dialogue_del_mes_ok')?.click(), 'cw-delbar-btn cw-delbar-del');
      if (mobile()) { top.append(cancel, count, all); bottom.append(del); doc.body.append(top, bottom); }
      else { bottom.append(count, all, cancel, del); doc.body.append(bottom); }
      delUi = { top, bottom, count, del };
      root.setAttribute('data-cw-delmode', '');
      const chat = doc.getElementById('chat');
      delObs = new win.MutationObserver(delPaint);
      if (chat) delObs.observe(chat, { subtree: true, attributes: true, attributeFilter: ['class'], childList: true });
      delPaint();
    };
    const delClose = () => { if (!delUi) return; delObs?.disconnect(); delObs = null; delUi.top.remove(); delUi.bottom.remove(); delUi = null; root.removeAttribute('data-cw-delmode'); };
    const delPanel = doc.getElementById('dialogue_del_mes');
    if (delPanel) {
      const delSync = () => { const on = enabled() && delPanel.style.display && delPanel.style.display !== 'none'; on ? delOpen() : delClose(); };
      const mo = new win.MutationObserver(delSync); mo.observe(delPanel, { attributes: true, attributeFilter: ['style'] });
      disposers.push(() => { mo.disconnect(); delClose(); });
      delSync();
    }
    // 2.0.268 通用小菜单（design-small-menus-v1 ⓪）：贴着按钮弹出；items 每项 {icon,label,value,check,danger,run,sub:[…]} 或 {head} / {sep}。
    // 有 sub 的一项：电脑上鼠标移上去 / 点一下，在右边贴着这一行展开；手机上点了把菜单换成下一级。
    let cwMenu = null;
    const closeCwMenu = () => { if (cwMenu?.classList.contains('cw-sd')) doc.getElementById('sd_gen')?.classList.remove('cw-on'); cwMenu?.remove(); cwMenu = null; };
    function popMenu(anchor, items, {up = false, cls = ''} = {}) {
      closeCwMenu();
      const wrap = make('div', 'cw-menu-wrap' + (cls ? ' ' + cls : ''));
      const build = (list, level) => {
        const m = make('div', 'cw-menu');
        for (const it of list) {
          if (it.sep) { m.append(make('div', 'cw-menu-sep')); continue; }
          if (it.head) { m.append(make('div', 'cw-menu-head', it.head)); continue; }
          const b = button('', e => {
            e.stopPropagation();
            if (it.sub) { openSub(b, it.sub, level); return; }
            if (it.disabled) return;
            closeCwMenu(); it.run?.();
          }, 'cw-menu-item' + (it.danger ? ' cw-danger' : '') + (it.disabled ? ' cw-disabled' : ''));
          if (it.icon) b.append(icon(it.icon));
          b.append(make('span', 'cw-menu-label', it.label));
          const r = make('span', 'cw-menu-right');
          if (it.value) r.append(make('span', 'cw-menu-value', it.value));
          if (it.sub) r.append(icon('chevr'));
          if (it.check) { const c = icon('check'); c.classList.add('cw-menu-check'); if (mobile()) b.prepend(c); else r.append(c); }
          if (mobile() && !it.check && list.some(x => x && x.check)) b.prepend(make('span', 'cw-menu-ckpad'));
          if (r.childNodes.length) b.append(r);
          if (!mobile()) b.addEventListener('mouseenter', () => { if (it.sub) openSub(b, it.sub, level); else closeSubs(level, m); });
          m.append(b);
        }
        return m;
      };
      const closeSubs = (level, m) => { wrap.querySelectorAll('.cw-menu').forEach((x, i) => { if (i > level) x.remove(); }); m?.querySelectorAll('.cw-menu-item.cw-on').forEach(n => n.classList.remove('cw-on')); };
      const openSub = (row, sub, level, label) => {
        wrap.querySelectorAll('.cw-menu').forEach((m, i) => { if (i > level) m.remove(); });
        row.parentElement.querySelectorAll('.cw-menu-item.cw-on').forEach(n => n.classList.remove('cw-on'));
        row.classList.add('cw-on');
        const m = build(sub, level + 1); wrap.append(m);
        if (mobile()) {
          const f = wrap.firstElementChild, fr = f.getBoundingClientRect();
          const back = button('', e => { e.stopPropagation(); m.remove(); f.hidden = false; row.classList.remove('cw-on'); }, 'cw-menu-item cw-menu-back');
          back.append(icon('chevl'), make('span', 'cw-menu-label', row.querySelector('.cw-menu-label')?.textContent || L('返回'))); m.prepend(back);
          f.hidden = true; m.style.left = f.style.left;
          m.style.top = Math.round(Math.max(8, fr.bottom - m.getBoundingClientRect().height)) + 'px'; return;
        }
        const rr = row.getBoundingClientRect(), mr = m.getBoundingClientRect();
        let x = rr.right + 4; if (x + mr.width > win.innerWidth - 8) x = rr.left - 4 - mr.width;
        const y = Math.min(Math.max(8, rr.top - 6), win.innerHeight - 8 - mr.height);
        m.style.left = Math.round(x) + 'px'; m.style.top = Math.round(y) + 'px';
      };
      wrap.append(build(items, 0)); doc.body.append(wrap); cwMenu = wrap; wrap._cwAnchor = anchor;
      const m = wrap.firstElementChild, a = anchor.getBoundingClientRect(), r = m.getBoundingClientRect();
      let x = Math.min(Math.max(8, a.left), win.innerWidth - 8 - r.width);
      let y = up ? a.top - 6 - r.height : a.bottom + 6;
      if (y < 8) y = a.bottom + 6; if (y + r.height > win.innerHeight - 8) y = Math.max(8, a.top - 6 - r.height);
      m.style.left = Math.round(x) + 'px'; m.style.top = Math.round(y) + 'px';
      return wrap;
    }
    // 2.0.281（稿 design-desk-align-v2，Lulu 认可）：电脑上照新版 Claude Desktop 加三处装饰——侧栏顶上的工具栏、
    // 右上角「幽灵 · 最小化 · 最大化 · 关闭」、「最近」旁边的放大镜。都只是样子（aria-hidden，点了没反应），只在电脑宽度显示（CSS）。
    const SV = (d, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
    const deco = (cls, html) => { const n = make('div', cls); n.setAttribute('aria-hidden', 'true'); n.innerHTML = html; return n; };
    // 2.0.283（稿 design-desk-align-v5）：图标照参考逐个重画——聊天是两个叠着的气泡、代码 </>、筛选两条竖线一上一下两个圈、≡ 第三条短、幽灵圆顶四个小波浪。
    const P = {
      menu: '<path d="M4.5 7h15M4.5 12h15M4.5 17h8"/>',
      panel: '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M9.5 4.5v15"/>',
      back: '<path d="M19 12H5.5M11 18l-6-6 6-6"/>', fwd: '<path d="M5 12h13.5M13 6l6 6-6 6"/>',
      chat: '<path d="M10 4.5a5.5 5.5 0 0 0-4.9 8l-.9 3.1 3.1-.9A5.5 5.5 0 1 0 10 4.5z"/><path d="M15.9 9.6a5 5 0 0 1 3.4 7l.8 2.9-2.9-.8a5 5 0 0 1-6.4-1.9"/>',
      code: '<path d="M8.5 8 4.5 12l4 4M15.5 8l4 4-4 4M13.2 6.5l-2.4 11"/>',
      search: '<circle cx="10.8" cy="10.8" r="6"/><path d="m15.3 15.3 4.2 4.2"/>',
      filter: '<path d="M8.5 4v2.6M8.5 11.4V20M15.5 4v8.6M15.5 17.4V20"/><circle cx="8.5" cy="9" r="2.4"/><circle cx="15.5" cy="15" r="2.4"/>',
      /* 2.0.289：对话页右上角照 Claude Desktop 换成分享（装饰），放在最后、CSS order 排到最前，不打乱 —□✕ 的 nth-child */
      share: '<path d="M12 4v10.5M8 8l4-4 4 4"/><path d="M5.5 12.5V18a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5v-5.5"/>',
      ghost: '<path d="M3.6 20.3V12.05a8.45 8.45 0 0 1 16.9 0V20.3Q17.64 16.1 14.83 20.3 12.02 16.1 9.22 20.3 6.41 16.1 3.6 20.3Z"/><circle cx="8.15" cy="11.9" r="1.25" fill="currentColor" stroke="none"/><circle cx="15.9" cy="11.9" r="1.25" fill="currentColor" stroke="none"/>',
      min: '<path d="M6 12h12"/>', max: '<rect x="6" y="6" width="12" height="12" rx="1"/>', close: '<path d="M6 6l12 12M18 6 6 18"/>',
    };
    // 「最近」：同一个角色连着的几条只在第一条放头像，后面换成空心小点（稿 B）。
    const markRepeats = () => {
      let prev = null;
      for (const r of doc.querySelectorAll('#top-settings-holder .clawd-rail-recents .recentChat')) {
        const key = (r.dataset.avatar || '') + '|' + (r.dataset.group || '');
        const rep = key !== '|' && key === prev;
        if (r.classList.contains('cw-rec-rep') !== rep) r.classList.toggle('cw-rec-rep', rep);
        prev = key;
      }
    };
    let recObs = null, recSlot = null;
    const ensureDeskDeco = () => {
      if (!enabled()) return;
      const holder = doc.getElementById('top-settings-holder');
      if (holder && !holder.querySelector(':scope>.cw-desk-tool')) holder.prepend(deco('cw-desk-tool',
        SV(P.menu) + SV(P.panel) + SV(P.back) + SV(P.fwd, 'cw-dim') +
        `<span class="cw-desk-seg"><span class="cw-on">${SV(P.chat)}</span><span>${SV(P.code, 'cw-dim')}</span></span>`));
      if (!doc.querySelector('body>.cw-desk-win')) doc.body.append(deco('cw-desk-win', SV(P.ghost, 'cw-ghost') + SV(P.min) + SV(P.max) + SV(P.close) + SV(P.share, 'cw-share')));
      const lab = holder?.querySelector('.clawd-rail-recents-label');
      if (lab && !lab.querySelector(':scope>.cw-rec-search')) lab.append(deco('cw-rec-search', SV(P.search)), deco('cw-rec-search cw-rec-filter', SV(P.filter)));
      const slot = holder?.querySelector('.clawd-rail-recents');
      if (slot && slot !== recSlot) { recObs?.disconnect(); recSlot = slot; recObs = new win.MutationObserver(markRepeats); recObs.observe(slot, { childList: true, subtree: true }); }
      markRepeats();
    };
    ensureDeskDeco();
    { const h = doc.getElementById('top-settings-holder'); if (h) { const mo = new win.MutationObserver(ensureDeskDeco); mo.observe(h, { childList: true }); disposers.push(() => mo.disconnect()); } }
    disposers.push(() => { recObs?.disconnect(); doc.querySelectorAll('.cw-desk-tool,.cw-desk-win,.cw-rec-search').forEach(n => n.remove()); doc.querySelectorAll('.cw-rec-rep').forEach(n => n.classList.remove('cw-rec-rep')); });
    // 2.0.275 手机的操作菜单（照 Claude App：灰色标题 + 一列选项 + 单独一块「取消」，从底部升起；点背后的暗处也关）。
    let cwSheet = null;
    const closeActionSheet = () => { const s = cwSheet; if (!s) return; cwSheet = null; s.setAttribute('data-cw-out', ''); win.setTimeout(() => s.remove(), 180); };
    function actionSheet(title, items) {
      closeActionSheet(); closeCwMenu();
      const wrap = make('div', 'cw-asheet'), dim = make('div', 'cw-asheet-dim'), box = make('div', 'cw-asheet-box');
      const card = make('div', 'cw-asheet-card');
      if (title) card.append(make('div', 'cw-asheet-title', title));
      for (const it of items) card.append(button(it.label, e => { e.stopPropagation(); closeActionSheet(); it.run?.(); }, 'cw-asheet-item' + (it.danger ? ' cw-danger' : '')));
      const cancel = button(L('取消'), e => { e.stopPropagation(); closeActionSheet(); }, 'cw-asheet-cancel');
      dim.addEventListener('click', closeActionSheet);
      box.append(card, cancel); wrap.append(dim, box); doc.body.append(wrap); cwSheet = wrap;
      return wrap;
    }
    disposers.push(() => { cwSheet?.remove(); cwSheet = null; });
    // 2.0.275「+」→ 生成图片（稿 design-composer-tools-v1）：酒馆原来在菜单旁边弹一块灰色列表（#sd_dropdown）。
    // 现在：电脑上在这一行右边贴着展开二级菜单（鼠标移上去 / 点一下），手机上收起「+」菜单、从底部弹操作菜单。每一项代点酒馆原来那一项。
    const SD_ITEMS = [['sd_you', '角色'], ['sd_face', '角色的脸'], ['sd_me', '用户'], ['sd_world', '整个故事'], ['sd_last', '最后一条消息'], ['sd_raw_last', '最后一条原始消息'], ['sd_background', '背景']];
    const sdItems = () => SD_ITEMS.filter(([id]) => doc.getElementById(id)).map(([id, label]) => ({ label: L(label), run: () => doc.getElementById(id)?.click() }));
    const sdOpen = gen => {
      const items = sdItems(); if (!items.length) return false;
      if (mobile()) { win.jQuery?.('#extensionsMenu').hide(); actionSheet(L('给我发一张……的照片'), items); return true; }
      if (cwMenu?.classList.contains('cw-sd')) return true;
      const w = popMenu(gen, [{ head: L('给我发一张……的照片') }, ...items], { cls: 'cw-sd' });
      const m = w.firstElementChild, a = gen.getBoundingClientRect(), r = m.getBoundingClientRect();
      let x = a.right + 4; if (x + r.width > win.innerWidth - 8) x = a.left - 4 - r.width;
      const y = Math.min(Math.max(8, a.top - 6), win.innerHeight - 8 - r.height);
      m.style.left = Math.round(x) + 'px'; m.style.top = Math.round(y) + 'px';
      gen.classList.add('cw-on');
      return true;
    };
    const sdBlock = e => {
      if (!enabled()) return;
      const gen = e.target.closest?.('#sd_gen'); if (!gen) return;
      e.stopPropagation(); e.preventDefault();
      if (e.type === 'click' || e.type === 'touchend') sdOpen(gen);
    };
    on(doc, 'touchend', sdBlock, true);
    on(doc, 'click', sdBlock, true);
    // 电脑：鼠标移到「生成图片」就展开；移到菜单里别的项就收起
    on(doc, 'mouseover', e => {
      if (!enabled() || mobile()) return;
      const item = e.target.closest?.('#extensionsMenu .list-group-item'); if (!item) return;
      if (item.id === 'sd_gen') sdOpen(item);
      else if (cwMenu?.classList.contains('cw-sd')) closeCwMenu();
    });
    // 2.0.275「+」→ 展示图库（稿 design-composer-tools-v1）：酒馆的图库是 #movingDivs 里一个能拖的小窗（#gallery），换排序 / 文件夹会整个重建。
    // 每次出现就地重排：手机是弹出页「‹ 返回 · 图库 · 添加」，电脑是居中弹窗；下面「文件夹 / 排序 / 删除模式 / 恢复默认文件夹」几行，再下面是图片。
    // 控件都是酒馆原来的（搬进行里或代点），缩略图照旧由 nanogallery2 排（它在我们排好之后才初始化，量到的就是新尺寸）。
    const galDecorate = g => {
      if (g.classList.contains('cw-gal')) return;
      const title = g.querySelector(':scope>.dragTitle'), close = g.querySelector('.dragClose'), add = title?.querySelector('.menu_button');
      const sort = title?.querySelector('select.gallery-sort-select'), folder = g.querySelector('.gallery-folder-input');
      const accept = g.querySelector('.right_menu_button.fa-check'), delMode = g.querySelector('.right_menu_button.fa-trash'), restore = g.querySelector('.right_menu_button.fa-recycle');
      const gal = g.querySelector('#dragGallery');
      if (!close || !gal) return;
      g.classList.add('cw-gal');
      const head = make('div', 'cw-gal-head');
      const back = button('', () => close.click(), 'cw-gal-back'); back.append(icon('chevl'), make('span', '', L('返回')));
      const x = button('', () => close.click(), 'cw-gal-x'); x.append(icon('close')); x.setAttribute('aria-label', L('关闭'));
      const addB = button(L('添加'), () => add?.click(), 'cw-gal-add');
      head.append(back, make('h2', '', L('图库')), addB, x);
      const body = make('div', 'cw-gal-body'), card = make('div', 'cw-gal-card');
      const row = (label, ...nodes) => { const r = make('div', 'cw-gal-row'); r.append(make('span', 'cw-gal-lab', L(label))); const v = make('span', 'cw-gal-val'); v.append(...nodes.filter(Boolean)); r.append(v); card.append(r); return r; };
      if (folder) row('文件夹', folder, accept);
      if (sort) row('排序', sort);
      if (delMode) {
        const sw = button('', () => { delMode.click(); paint(); }, 'cw-gal-switch'); sw.setAttribute('role', 'switch');
        const paint = () => sw.setAttribute('aria-checked', String(delMode.classList.contains('warning')));
        paint(); row('删除模式', sw);
      }
      if (restore) { const r = button(L('恢复默认文件夹'), () => restore.click(), 'cw-gal-row cw-gal-act'); card.append(r); }
      const imgs = make('div', 'cw-gal-card cw-gal-imgs'); imgs.append(gal);
      const folderName = folder?.value || '';
      body.append(card, make('p', 'cw-gal-foot', L('删除模式打开时，点一张图就删掉它。')), make('div', 'cw-gal-lab2', L('图片')), imgs,
        make('p', 'cw-gal-foot', L('点一张放大；也可以直接把图片拖进来上传。图片存在 user/images/') + folderName + L('。')));
      g.append(head, body);
      // 第一次打开时酒馆弹的蓝色提示（拖进来上传）：说明已经写在下面了，不再弹。
      win.setTimeout(() => doc.querySelectorAll('#toast-container .toast').forEach(t => { if (/Drag and drop images onto the gallery/i.test(t.textContent)) t.remove(); }), 50);
      let dim = doc.querySelector('.cw-gal-dim'); if (!dim) { dim = make('div', 'cw-gal-dim'); dim.addEventListener('click', () => close.click()); g.before(dim); }
    };
    const galSync = () => {
      const g = doc.querySelector('#movingDivs > #gallery');
      if (g && enabled()) galDecorate(g);
      if (!g) doc.querySelector('.cw-gal-dim')?.remove();
    };
    const moving = doc.getElementById('movingDivs');
    if (moving) { const mo = new win.MutationObserver(galSync); mo.observe(moving, { childList: true }); disposers.push(() => { mo.disconnect(); doc.querySelector('#movingDivs > #gallery .dragClose')?.click(); doc.querySelector('.cw-gal-dim')?.remove(); }); }
    on(doc, 'pointerdown', e => { if (cwSheet && !cwSheet.contains(e.target)) closeActionSheet(); }, true);
    // 2.0.279（Lulu：点头像菜单反复打开）：按下点开菜单的那个按钮时不在这里关，交给按钮自己的点击去「再点一下关掉」。
    on(doc, 'pointerdown', e => { if (cwMenu && !cwMenu.contains(e.target) && !cwMenu._cwAnchor?.contains?.(e.target)) closeCwMenu(); }, true);
    on(doc, 'keydown', e => { if (cwMenu && e.key === 'Escape') { e.stopPropagation(); closeCwMenu(); } }, true);
    on(win, 'resize', closeCwMenu);
    disposers.push(closeCwMenu);
    // 账户菜单（侧栏左下「零」）：原来点了直接开用户角色页。只放酒馆本来就有的：切换用户角色、用户角色设置、设置、主题。
    let acctBypass = false;
    const openDrawerById = id => { const t = doc.querySelector('#' + id + ' > .drawer-toggle'); if (!t) return; acctBypass = true; t.click(); acctBypass = false; };
    on(doc, 'click', e => {
      // 2.0.282（Lulu：设置里点「用户角色」弹出了账户菜单）：设置页是用程序代点这个按钮打开用户角色页的，只拦真的用手点的。
      if (acctBypass || !enabled() || !e.isTrusted) return;
      const t = e.target.closest?.('#persona-management-button > .drawer-toggle');
      if (!t || !t.querySelector('.clawd-user-face')) return;
      if (doc.getElementById('persona-management-button')?.querySelector('.drawer-content.openDrawer')) return; // 已经开着：照原样（关上）
      e.stopPropagation(); e.preventDefault();
      if (cwMenu?.classList.contains('cw-acct')) { closeCwMenu(); return; }
      const ctx = win.SillyTavern?.getContext?.(), pu = ctx?.powerUserSettings || {}, personas = pu.personas || {};
      const me = ctx?.name1 || '', cur = (win.user_avatar || doc.querySelector('#user_avatar_block .avatar-container.selected .avatar')?.getAttribute('imgfile') || '');
      const pick = (file, name) => {
        const c = doc.querySelector(`#user_avatar_block .avatar-container:has(.avatar[imgfile="${win.CSS.escape(file)}"])`);
        if (c) { c.click(); return; }
        ctx?.executeSlashCommandsWithOptions?.('/persona-set ' + JSON.stringify(name));
      };
      const list = Object.entries(personas).slice(0, 12).map(([file, name]) => ({label: name, check: name === me && (!cur || cur === file), run: () => pick(file, name)}));
      const vs = doc.getElementById('claude-web-variant'), variant = root.dataset.claudeIntegratedTheme === 'night' ? 'night' : 'day';
      const setVariant = v => { if (!vs || vs.disabled) return; vs.value = v; vs.dispatchEvent(new win.Event('change', {bubbles: true})); };
      const themeItems = [{label: L('日间'), check: variant === 'day', run: () => setVariant('day')}, {label: L('夜间'), check: variant === 'night', run: () => setVariant('night')}];
      popMenu(t, [
        {head: (me ? me + ' · ' : '') + L('你在聊天里扮演的身份')},
        list.length ? {icon: 'user', label: L('切换用户角色'), sub: list} : null,
        {icon: 'card', label: L('用户角色设置'), run: () => openDrawerById('persona-management-button')},
        {icon: 'gear', label: L('设置'), run: () => openDrawerById('user-settings-button')},
        {sep: 1},
        vs ? {icon: 'sun', label: L('主题'), value: vs.disabled ? L('跟随时间') : (variant === 'night' ? L('夜间') : L('日间')), sub: vs.disabled ? null : themeItems, disabled: vs.disabled} : null,
      ].filter(Boolean).filter(it => !(it.sub === null && it.disabled === undefined)), {up: true, cls: 'cw-acct'});
    }, true);
    // 2.0.268 编辑消息（design-small-menus-v1）：酒馆的 ✓ / ✕ 画成「保存 / 取消」，其余五个收进左边一个 ⋯ 下拉。
    // 按钮都是酒馆原来的（事件不动），只加 data-cw-label 和一个 ⋯；CSS 在 ㊵。
    const editMore = () => {
      if (!enabled()) return;
      for (const bar of doc.querySelectorAll('#chat .mes .mes_edit_buttons')) {
        labelMenu(bar, EDIT_LABELS);
        if (bar.querySelector(':scope>.cw-edit-more')) continue;
        // 按钮条贴在卡片（.mes_text）底边里面：量出 .mes_text 底边相对按钮条定位容器的位置（消息块下面还有别的留白，不能用 bottom）。
        const text = bar.closest('.mes')?.querySelector('.mes_text'), ta = text?.querySelector('textarea');
        const place = () => { if (!bar.isConnected || !text) return; const box = bar.offsetParent?.getBoundingClientRect(), r = text.getBoundingClientRect(); if (!box) return; const top = Math.round(r.bottom - box.top - 44) + 'px'; if (bar.style.getPropertyValue('--cw-edit-top') !== top) bar.style.setProperty('--cw-edit-top', top); };
        place(); win.requestAnimationFrame(place); ta?.addEventListener('input', place);
        if (text && win.ResizeObserver) { const ro = new win.ResizeObserver(place); ro.observe(text); const stop = new win.MutationObserver(() => { if (!bar.isConnected) { ro.disconnect(); stop.disconnect(); } }); stop.observe(doc.getElementById('chat') || doc.body, {childList: true, subtree: true}); }
        // 2.0.270（Lulu：下拉被消息外层截断）：⋯ 打开通用小菜单（挂在 body 上），每一项代点酒馆原来的按钮。
        const more = button('', e => {
          e.stopPropagation(); place();
          if (cwMenu?.classList.contains('cw-editmenu')) { closeCwMenu(); return; }
          const items = [];
          for (const [cls, ic, sep] of [['mes_edit_copy','copy'],['mes_edit_add_reasoning','bulb'],['mes_edit_up','chevu',1],['mes_edit_down','chevd'],['mes_edit_delete','trash',1]]) {
            const native = bar.querySelector(':scope>.' + cls); if (!native || win.getComputedStyle(native).visibility === 'hidden') continue;
            if (sep && items.length) items.push({sep: 1});
            items.push({icon: ic, label: native.dataset.cwLabel || '', danger: cls === 'mes_edit_delete', run: () => native.click()});
          }
          if (cwMenu?._cwAnchor === more) { closeCwMenu(); return; } // 再点一下 ⋯ 收起
          popMenu(more, items, {cls: 'cw-editmenu'});
        }, 'cw-edit-more');
        more.append(icon('dots')); more.setAttribute('aria-label', L('更多')); bar.prepend(more);
      }
    };
    const editObs = new win.MutationObserver(list => { if (cwMenu?.classList.contains('cw-editmenu') && !doc.getElementById('curEditTextarea')) closeCwMenu(); if (list.some(m => [...m.addedNodes].some(n => n.nodeType === 1 && (n.id === 'curEditTextarea' || n.querySelector?.('#curEditTextarea'))))) editMore(); });
    const chatEl = doc.getElementById('chat'); if (chatEl) editObs.observe(chatEl, {childList: true, subtree: true});
    disposers.push(() => { editObs.disconnect(); doc.querySelectorAll('.cw-edit-more').forEach(n => n.remove()); doc.querySelectorAll('.cw-edit-open').forEach(n => n.classList.remove('cw-edit-open')); });
    // Input menus (+ and ≡, 2026-09-29): ST pins each to its own button with Popper
    // (top-start) and sizes it to its own text, so they open 40px apart with different
    // widths. On either button click (before ST shows the menu), measure both menus'
    // natural widths and share the wider one, and shift ≡ onto the + button's left edge.
    // The shift uses the CSS `translate` property, which stacks on Popper's own transform.
    const menuWidth = el => {
      if (!el) return 0;
      const prev = [el.style.display, el.style.visibility];
      const closed = win.getComputedStyle(el).display === 'none';
      if (closed) { el.style.visibility = 'hidden'; el.style.display = 'flex'; }
      const w = el.getBoundingClientRect().width;
      if (closed) { el.style.display = prev[0]; el.style.visibility = prev[1]; }
      return w;
    };
    on(doc, 'click', e => {
      if (!enabled() || !e.target.closest?.('#extensionsMenuButton, #options_button')) return;
      const extBtn = doc.getElementById('extensionsMenuButton'), optBtn = doc.getElementById('options_button');
      if (!extBtn || !optBtn) return;
      root.setAttribute('data-cw-v4-menu-measure', '');   // natural widths: switch the shared width off while measuring
      const w = Math.max(200, Math.ceil(menuWidth(doc.getElementById('extensionsMenu'))), Math.ceil(menuWidth(doc.getElementById('options'))));
      root.removeAttribute('data-cw-v4-menu-measure');
      root.style.setProperty('--cw-v4-menu-w', w + 'px');
      root.style.setProperty('--cw-v4-menu-shift', Math.round(extBtn.getBoundingClientRect().left - optBtn.getBoundingClientRect().left) + 'px');
      // Both open upward (Popper top-start) and ST caps them at the window height, not at the
      // room above the button. On the welcome page the composer sits mid-screen, so a long menu
      // ran off the top. Cap the height at the room above the button; the list scrolls inside.
      // 28 = 上方留白 12 + 菜单自己的内边距和边框约 14：只减 12 的话整个菜单比上方空间高一点，Popper 会把它翻到按钮下面去
      root.style.setProperty('--cw-v4-menu-maxh', Math.max(160, Math.floor(extBtn.getBoundingClientRect().top - 28)) + 'px');
    }, true);
    disposers.push(() => { root.style.removeProperty('--cw-v4-menu-w'); root.style.removeProperty('--cw-v4-menu-shift'); root.style.removeProperty('--cw-v4-menu-maxh'); });
    const ctx = win.SillyTavern?.getContext?.();
    for (const key of ['CHAT_CHANGED','CHARACTER_MESSAGE_RENDERED','USER_MESSAGE_RENDERED','MESSAGE_SWIPED','SETTINGS_LOADED','APP_READY']) {
      const event = ctx?.eventTypes?.[key]; if (event && ctx.eventSource?.on) { ctx.eventSource.on(event,schedule); disposers.push(() => ctx.eventSource.removeListener?.(event,schedule)); }
    }
    watchSheets();
  };
  /* 2.0.212 / 2.0.213 手机弹出页（Lulu 照 Claude App）：弹出页升起时，后面整页往后、往上缩小（圆角、压暗），
     屏幕最上面露出黑底和那页缩小后的顶边。2.0.213：升起 / 收起、后面那页缩放、压暗全部同一时长同一曲线（CSS --cw-sheet-dur / --cw-sheet-curve）；
     弹出页套弹出页时下面那层往后缩、变暗（data-cw-sheet-under），上面那层低一点（data-cw-sheet-lvl2）；顶栏可以往下拖关闭；
     酒馆的宽 / 大弹窗（不含透明的加载画面）也换成「‹ 上一页 | 标题 | 确定」的顶栏。
     html[data-cw-sheet]：有弹出页开着；[data-cw-sheet-deep]：叠了两层以上；[data-cw-sheet-anim]：开关前后挂过渡；[data-cw-sheet-drag]：拖动中（关过渡）。 */
  const SHEET_POPUP = 'dialog.popup:is(.wide_dialogue_popup,.wider_dialogue_popup,.large_dialogue_popup):not(.cw-v4-editor):not(.transparent_dialogue_popup)';
  const SMALL_POPUP = 'dialog.popup:not(.wide_dialogue_popup):not(.wider_dialogue_popup):not(.large_dialogue_popup):not(.transparent_dialogue_popup):not(.cw-v4-editor)';
  const DANGER_TEXT = /删除|移除|清空|永久|Delete|Remove|permanently/i;
  // 2.0.255 标签管理 / 其他开场白（design-content-v1，只在电脑尺寸；CSS ㉜）。弹窗每次打开都是新的，装饰一次就行；
  // 标签列表酒馆会重画（新建 / 删除 / 排序），盯着列表补装饰。原来的按钮只是搬位置，事件都在。
  function decorateTagView(d) {
    if (d.dataset.cwTv) return; d.dataset.cwTv = '1'; d.classList.add('cw-tv');
    d.style.setProperty('--cw-tv-unit', JSON.stringify(t(' 个角色', ' characters')));
    d.style.setProperty('--cw-tv-unused', JSON.stringify(t('未使用', 'Unused')));
    d.style.setProperty('--cw-tv-empty', JSON.stringify(t('还没有标签。点「新建标签」，或在角色页的「标签」里直接输入。', 'No tags yet. Click New tag, or type one in a character\'s Tags field.')));
    const label = (sel, text) => { const n = d.querySelector(sel); if (n) n.textContent = text; };
    label('.tag_view_create span', t('新建标签', 'New tag'));
    const sortLabel = d.querySelector('#tag_sort_mode_select')?.previousElementSibling; if (sortLabel) sortLabel.textContent = t('排序', 'Sort');
    const hint = d.querySelector('#tag_view_list .justifyLeft > small');
    if (hint) hint.textContent = t('拖动左边的点阵调整顺序，点名字改名，点「Aa」改颜色，点文件夹图标把标签当成文件夹。', 'Drag the handle to reorder, click a name to rename, click Aa to change colors, click the folder icon to use the tag as a folder.');
    const bar = d.querySelector('.tag_view_create')?.parentElement;
    if (bar) {
      const wrap = doc.createElement('div'), tog = doc.createElement('div'), menu = doc.createElement('div');
      wrap.className = 'cw-tv-more'; tog.className = 'menu_button cw-tv-more-btn'; tog.title = t('更多', 'More'); tog.setAttribute('role', 'button'); menu.className = 'cw-tv-menu'; menu.hidden = true;
      for (const [cls, text, sep] of [['tag_view_prune', t('删除未使用的标签', 'Delete unused tags'), true], ['tag_view_backup', t('备份到文件', 'Back up to file')], ['tag_view_restore', t('从文件恢复', 'Restore from file')]]) {
        const b = d.querySelector('.' + cls); if (!b) continue; b.dataset.cwLabel = text; menu.append(b);
        if (sep) { const hr = doc.createElement('div'); hr.className = 'cw-tv-sep'; menu.append(hr); }
      }
      // 酒馆打开弹窗后会按 data-i18n 再翻一遍，把字改回「精简 / 备份 / 恢复」；每次打开菜单时再写一次。
      tog.addEventListener('click', e => { e.stopPropagation(); for (const b of menu.querySelectorAll('[data-cw-label]')) { const sp = b.querySelector('span'); if (sp && sp.textContent !== b.dataset.cwLabel) sp.textContent = b.dataset.cwLabel; } menu.hidden = !menu.hidden; });
      menu.addEventListener('click', () => win.setTimeout(() => { menu.hidden = true; }));
      wrap.append(tog, menu); bar.append(wrap);
    }
    d.addEventListener('mousedown', e => {
      const m = d.querySelector('.cw-tv-menu'); if (m && !m.hidden && !e.target.closest?.('.cw-tv-more')) m.hidden = true;
      for (const p of d.querySelectorAll('.cw-tv-pop:not([hidden])')) if (!p.parentElement.contains(e.target)) p.hidden = true;
    });
    const list = d.querySelector('#tag_view_list .tag_view_list_tags');
    decorateTagItems(d);
    if (list) new win.MutationObserver(() => decorateTagItems(d)).observe(list, {childList: true});
  }
  // 每个标签：两块调色器收进「Aa」色样的小浮层（底色 / 字色），色样跟着标签名的颜色变。
  function decorateTagItems(d) {
    for (const item of d.querySelectorAll('.tag_view_item:not([data-cw-tv])')) {
      item.setAttribute('data-cw-tv', '');
      const name = item.querySelector('.tag_view_name'), pickers = [...item.querySelectorAll('.tag_view_color_picker')];
      if (!name || !pickers.length) continue;
      const holder = doc.createElement('div'), sw = doc.createElement('div'), pop = doc.createElement('div');
      holder.className = 'cw-tv-color'; sw.className = 'cw-tv-sw'; sw.textContent = 'Aa'; sw.title = t('颜色', 'Colors'); pop.className = 'cw-tv-pop'; pop.hidden = true;
      pickers.forEach((p, i) => { const r = doc.createElement('div'), l = doc.createElement('span'); r.className = 'cw-tv-poprow'; l.textContent = i ? t('字色', 'Text') : t('底色', 'Background'); r.append(l, p); pop.append(r); });
      for (const tc of pop.querySelectorAll('toolcool-color-picker')) { tc.setAttribute('button-width', '22px'); tc.setAttribute('button-height', '22px'); tc.setAttribute('button-padding', '0'); }
      const paint = () => { sw.style.backgroundColor = name.style.backgroundColor; sw.style.color = name.style.color; };
      paint(); new win.MutationObserver(paint).observe(name, {attributes: true, attributeFilter: ['style']});
      sw.addEventListener('click', e => { e.stopPropagation(); pop.hidden = !pop.hidden; });
      holder.append(sw, pop); name.before(holder);
    }
  }
  function decorateGreetings(d) {
    if (d.dataset.cwAg) return; d.dataset.cwAg = '1'; d.classList.add('cw-ag');
    d.style.setProperty('--cw-ag-empty', JSON.stringify(t('还没有其他开场白。点「添加」写第一条。', 'No alternate greetings yet. Click Add to write one.')));
    d.style.setProperty('--cw-ag-title', JSON.stringify(t('开场白 ', 'Greeting ')));
  }
  const SHEET_MS = 280, BACK_S = .93; // 2.0.220：Lulu 定 0.28 秒（原 0.38），和 CSS --cw-sheet-dur 一起改
  let sheetAnimTimer = 0, sheetStack = [], dimEl = null, lastTrigger = null, pmWasOpen = false, pmCloseTimer = 0, pmHost = null, pmAnchor = null, pmPickers = [], pmEsc = null;
  /* 2.0.214：提示词编辑页本来是 body 里的一块，后面那页（body）缩小时它要反向放大、body 还不能裁——于是侧栏等屏幕外的东西
     缩进来时会露边（Lulu：左边一条白、顶上一条白），Clawd 动作也盖在它上面。改成手机上它打开时，临时搬进一个 showModal 的 <dialog>
     （浏览器最上层，不受 body 缩放 / 裁剪影响），收起播完再搬回原处。酒馆按 id 找它、按钮直接绑事件，搬家不影响；
     下拉（select2）的弹出层也改挂到这个 dialog 上，不然会被挡在后面。 */
  // 2.0.217 提速：浏览器支持 popover 时用 popover 把它放进最上层——showModal 会让页面其余部分全部变成 inert，
  // 整页重算样式（实测打开 27ms / 关闭 26ms，手机 4× 降速 288 / 215ms）；popover 同样在最上层但不碰其余页面。
  // 老内核（安卓模拟器里 Via 的 WebView 113）没有 popover，退回 showModal。popover 用 <div>（<dialog> 不带 open 会被 UA 藏起来）。
  const canPopover = typeof win.HTMLElement.prototype.showPopover === 'function';
  const pmBack = pm => ([...pm.children].find(a => a.style.display !== 'none' && a.querySelector('.cw-pm-back')) || pm).querySelector('.cw-pm-back');
  function hostPm(pm) {
    if (pmHost) return;
    pmAnchor = doc.createComment('cw-pm-home'); pm.before(pmAnchor);
    pmHost = make(canPopover ? 'div' : 'dialog', 'cw-pm-host'); doc.body.append(pmHost); pmHost.append(pm);
    if (canPopover) {
      pmHost.setAttribute('popover', 'manual');
      // popover 不困住焦点（showModal 会），Escape 可能落在页面上：开着时在 document 上接（下拉开着时让下拉先关）。
      pmEsc = e => { if (e.key !== 'Escape' || e.defaultPrevented || doc.querySelector('.select2-container--open')) return; e.preventDefault(); e.stopImmediatePropagation(); pmBack(pm)?.click(); };
      doc.addEventListener('keydown', pmEsc, true);
    } else pmHost.addEventListener('cancel', e => { e.preventDefault(); pmBack(pm)?.click(); });
    pm.querySelectorAll('select').forEach(select => { const ad = win.jQuery?.(select).data?.('select2')?.dropdown; if (ad?.$dropdownParent) { pmPickers.push([ad, ad.$dropdownParent]); ad.$dropdownParent = win.jQuery(pmHost); } });
    const back = [...pm.children].find(a => a.style.display === 'flex')?.querySelector('.cw-pm-back');
    if (canPopover) { shieldUp(); pmHost.showPopover(); }
    else { if (back) back.autofocus = true; pmHost.showModal(); if (back) back.autofocus = false; }
    back?.focus({preventScroll: true});
  }
  function unhostPm() {
    if (!pmHost) return;
    for (const [ad, parent] of pmPickers) ad.$dropdownParent = parent; pmPickers = [];
    const pm = pmEl();
    if (pm && pmAnchor?.parentNode) pmAnchor.replaceWith(pm); else pmAnchor?.remove();
    if (pmEsc) { doc.removeEventListener('keydown', pmEsc, true); pmEsc = null; }
    if (canPopover) { try { pmHost.hidePopover(); } catch {} } else pmHost.close();
    pmHost.remove(); pmHost = null; pmAnchor = null;
    shieldMaybeDown();
  }
  const pmEl = () => doc.getElementById('completion_prompt_manager_popup');
  const sheetIsOpen = el => el.matches('dialog') ? el.open && !el.hasAttribute('closing') && !el.hasAttribute('data-cw-closing') : el.classList.contains('openDrawer');
  function animWindow() {
    root.setAttribute('data-cw-sheet-anim', '');
    win.clearTimeout(sheetAnimTimer);
    sheetAnimTimer = win.setTimeout(() => root.removeAttribute('data-cw-sheet-anim'), SHEET_MS + 80);
  }
  function syncSheet() {
    const pm = pmEl();
    // 提示词编辑页：酒馆摘掉 openDrawer 后 200ms 就 display:none，比我们的下滑短；收起期间挂 data-cw-closing，CSS 让它多显示一会儿播完。
    const pmOpen = Boolean(pm?.classList.contains('openDrawer'));
    // 2.0.217 提速：酒馆开 / 关它时用 jQuery slideDown / slideUp(200)，每帧改行内高度、重排；高度和动作都由我们的 CSS 管，直接让它跳到结束。
    if (pm && pmOpen !== pmWasOpen && mobile() && enabled()) win.jQuery?.(pm).stop(true, true);
    if (pm && pmWasOpen && !pmOpen && mobile()) { pm.setAttribute('data-cw-closing', ''); win.clearTimeout(pmCloseTimer); pmCloseTimer = win.setTimeout(() => { pm.removeAttribute('data-cw-closing'); unhostPm(); }, SHEET_MS + 40); }
    if (pm && pmOpen) { win.clearTimeout(pmCloseTimer); pm.removeAttribute('data-cw-closing'); if (mobile() && enabled()) hostPm(pm); }
    if (pm && !pmOpen && !pm.hasAttribute('data-cw-closing')) unhostPm();
    pmWasOpen = pmOpen;
    // 2.0.247 普通尺寸的酒馆弹窗（改名 / 另存为 / 删除确认……）照 Claude Desktop 排（CSS ㉗）；删除类的「确定」画成红色。只在变化时写属性。
    // 2.0.256 手机也装饰（排法见 CSS ㉝，照扩展页的弹出页：灰标题在卡片外、操作是蓝色行）。
    if (enabled()) for (const d of doc.querySelectorAll('dialog.popup[open]')) {
      if (d.querySelector('#tag_view_list')) decorateTagView(d); else if (d.querySelector('.alternate_grettings')) decorateGreetings(d);
    }
    for (const d of doc.querySelectorAll(SMALL_POPUP + '[open]')) {
      const danger = DANGER_TEXT.test(d.querySelector('.popup-content')?.textContent || '');
      if (d.hasAttribute('data-cw-danger') !== danger) d.toggleAttribute('data-cw-danger', danger);
    }
    let now = [];
    if (mobile() && enabled()) {
      now = [...doc.querySelectorAll('dialog.cw-v4-editor[open],' + SHEET_POPUP + '[open]')];
      if (pmOpen) now.push(pm);
      now = now.filter(sheetIsOpen);
    }
    sheetStack = sheetStack.filter(el => now.includes(el)).concat(now.filter(el => !sheetStack.includes(el)));
    sheetStack.forEach((el, i) => {
      el.toggleAttribute('data-cw-sheet-under', i < sheetStack.length - 1 && el.matches('dialog'));
      if (i > 0) el.setAttribute('data-cw-sheet-lvl2', ''); else el.removeAttribute('data-cw-sheet-lvl2');
      if (el.matches(SHEET_POPUP)) decorateStPopup(el);
    });
    for (const el of doc.querySelectorAll('[data-cw-sheet-under]')) if (!sheetStack.includes(el)) el.removeAttribute('data-cw-sheet-under');
    const open = sheetStack.length > 0, deep = sheetStack.length > 1;
    if (open === root.hasAttribute('data-cw-sheet') && deep === root.hasAttribute('data-cw-sheet-deep')) return;
    animWindow();
    root.toggleAttribute('data-cw-sheet', open);
    root.toggleAttribute('data-cw-sheet-deep', deep);
  }
  // 「‹」后面写哪一页：下面还有弹出页就写它的标题，否则写设置页顶栏的标题。
  function sheetBackLabel(el) {
    const i = sheetStack.indexOf(el);
    const below = i > 0 ? sheetStack[i - 1] : (i < 0 && sheetStack.length ? sheetStack.at(-1) : null);
    return (below?.dataset.cwSheetTitle || (!below && doc.querySelector('.cw-v4-shell:not([hidden]) .cw-v4-title')?.textContent) || '').trim() || t('返回', 'Back');
  }
  // 往下拖关闭：只在顶栏上按住才算（内容区的手势留给滚动）。拖动时弹出页跟手，后面那页的缩放 / 压暗按比例插值；
  // 松手时拖过三分之一或甩得够快就关，否则弹回。
  function sheetDrag(el, handle, close) {
    let st = null;
    const setBack = p => {
      if (p == null) { doc.body.style.removeProperty('scale'); dimEl?.style.removeProperty('opacity'); return; }
      const s = BACK_S + (1 - BACK_S) * p;
      doc.body.style.scale = String(s);
      if (dimEl) dimEl.style.opacity = String(.2 * (1 - p));
    };
    handle.addEventListener('pointerdown', e => {
      if (!mobile() || e.button !== 0 || sheetStack.at(-1) !== el || e.target.closest('button,a,input,select,textarea,label,.menu_button')) return;
      st = {id: e.pointerId, y0: e.clientY, t0: win.performance.now(), dy: 0, h: el.getBoundingClientRect().height || 1};
      try { handle.setPointerCapture(e.pointerId); } catch {}
    });
    handle.addEventListener('pointermove', e => {
      if (!st || e.pointerId !== st.id) return;
      st.dy = Math.max(0, e.clientY - st.y0);
      if (st.dy < 4) return;
      root.setAttribute('data-cw-sheet-drag', '');
      el.style.translate = `0 ${st.dy}px`;
      if (sheetStack.length === 1) setBack(Math.min(1, st.dy / st.h));
    });
    const end = e => {
      if (!st || e.pointerId !== st.id) return;
      const {dy, t0, h} = st; st = null;
      const v = dy / Math.max(1, win.performance.now() - t0);
      root.removeAttribute('data-cw-sheet-drag');
      animWindow();
      void el.offsetWidth;
      el.style.removeProperty('translate'); setBack(null);
      if (dy > 4 && (dy > h / 3 || v > .6)) close();
    };
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) handle.addEventListener(type, end);
  }
  // 酒馆宽 / 大弹窗：顶栏「‹ 上一页 | 标题 | 确定」。有「取消」时 ‹ = 取消、「确定」挪到右上；只有一个按钮（关闭 / 确定）时 ‹ = 它；
  // 都没有时 ‹ = 按 Escape（cancel 事件，酒馆自己决定能不能关）。标题取点开它的那个按钮的名字，取不到就用内容开头的标题。
  function decorateStPopup(dlg) {
    if (dlg.querySelector(':scope>.cw-st-head')) return;
    const ok = dlg.querySelector('.popup-controls>.popup-button-ok'), cancel = dlg.querySelector('.popup-controls>.popup-button-cancel');
    const shown = n => Boolean(n) && n.style.display !== 'none' && !n.classList.contains('displayNone');
    const okOn = shown(ok), cancelOn = shown(cancel);
    const closeIt = () => { if (cancelOn) cancel.click(); else if (okOn) ok.click(); else dlg.dispatchEvent(new win.Event('cancel', {cancelable: true})); };
    const trig = lastTrigger && Date.now() - lastTrigger.at < 2000 ? lastTrigger.el : null;
    const trigText = trig ? (trig.getAttribute('title') || trig.querySelector('span:not(.cw-v4-action-label)')?.textContent || trig.textContent || '').trim() : '';
    const firstHead = dlg.querySelector('.popup-content>:is(h2,h3):first-child, .popup-content>:first-child>:is(h2,h3):first-child');
    // 2.0.256 标签管理 / 其他开场白：触发按钮的 title 是一句提示（「单击以设置其他开场白」），标题写死。
    const known = dlg.querySelector('#tag_view_list') ? t('标签管理', 'Manage tags') : dlg.querySelector('.dataBankAttachments') ? t('数据库', 'Data Bank') : dlg.querySelector('#token_counter_textarea') ? t('Token 计数器', 'Token Counter') : dlg.querySelector('.alternate_grettings') ? t('其他开场白', 'Alternate greetings') : dlg.querySelector('#qr--modal-label')?.value || dlg.querySelector('.regex_editor input.regex_script_name')?.value || '';
    const title = (known || (trigText && trigText.length <= 24 ? trigText : firstHead?.textContent || '')).trim();
    const label = sheetBackLabel(dlg);
    dlg.dataset.cwSheetTitle = title;
    dlg.classList.add('cw-st-sheet');
    const head = make('div', 'cw-st-head');
    const back = button('', closeIt, 'cw-st-back'); back.append(icon('chevl'), make('span', '', label)); back.setAttribute('aria-label', label);
    head.append(back, make('h2', '', title));
    if (okOn && cancelOn) head.append(button(ok.textContent.trim(), () => ok.click(), 'cw-st-ok')); else head.append(make('span', ''));
    dlg.prepend(head);
    sheetDrag(dlg, head, closeIt);
  }
  /* 2.0.218 提速：手机上的弹出页（我们的编辑弹窗、酒馆宽 / 大弹窗）不用 showModal，改成 show() + showPopover()——
     同样进浏览器最上层，但不会让页面其余部分变 inert（showModal 一开一关各要整页重算样式：PC 约 27ms，手机 4× 降速约 290 / 215ms）。
     <dialog> 照样是 open（酒馆认 dialog[open]、close()、[opening] / [closing] 动画都不变）。模态白送的两件事自己补：
     · 点后面的页面不能有反应：弹出页底下垫一层透明的 .cw-sheet-shield（也是 popover，先于弹出页显示，所以在它下面）；
     · Escape 关弹窗：document 上接，给我们的弹窗走 shut()，给酒馆弹窗发 cancel 事件（酒馆自己决定能不能关）。
     老内核没有 popover、电脑、不是弹出页的对话框：照旧 showModal。 */
  const nativeShowModal = win.HTMLDialogElement.prototype.showModal;
  let shield = null;
  const liftable = d => canPopover && mobile() && enabled() && d.matches(SHEET_POPUP + ',dialog.cw-v4-editor');
  function shieldUp() {
    if (!canPopover) return;
    if (!shield) {
      shield = make('div', 'cw-sheet-shield'); shield.setAttribute('popover', 'manual'); shield.setAttribute('aria-hidden', 'true');
      for (const type of ['click', 'pointerdown', 'mousedown', 'touchstart']) shield.addEventListener(type, e => { e.preventDefault(); e.stopPropagation(); }, {passive: false});
      doc.body.append(shield);
    }
    if (!shield.matches(':popover-open')) shield.showPopover();
  }
  function shieldMaybeDown() {
    if (!shield || doc.querySelector('dialog[data-cw-lifted][open]') || pmHost) return;
    try { shield.hidePopover(); } catch {}
  }
  function liftDialog(d) {
    d.setAttribute('popover', 'manual'); d.setAttribute('data-cw-lifted', '');
    shieldUp();
    // 2.0.219：直接挂 open，不调 show()——show() 会自动把焦点给第一个按钮，而且不带 preventScroll；弹出页在 DOM 里还挂在设置面板里，
    // 面板就被滚到它那儿（Lulu：点扩展的设置，扩展页自己往下跳）。焦点由各自的代码给（我们的弹窗 focus({preventScroll})，酒馆的弹窗自己 setAutoFocus）。
    if (!d.open) d.setAttribute('open', '');
    if (!d.matches(':popover-open')) {
      try { d.showPopover(); }
      catch { d.close(); d.removeAttribute('popover'); d.removeAttribute('data-cw-lifted'); shieldMaybeDown(); nativeShowModal.call(d); return; }
    }
    // 酒馆在 close 事件里可能马上又 showModal() 一次（关闭被拦下时）：那时 d 还开着，就不撤 popover，等下一次 close。
    const onClose = () => {
      if (d.open) { d.addEventListener('close', onClose, {once: true}); return; }
      try { if (d.matches(':popover-open')) d.hidePopover(); } catch {}
      d.removeAttribute('popover'); d.removeAttribute('data-cw-lifted');
      shieldMaybeDown();
    };
    d.addEventListener('close', onClose, {once: true});
  }
  function onSheetEscape(e) {
    if (e.key !== 'Escape' || e.defaultPrevented || doc.querySelector('dialog:modal,.select2-container--open')) return;
    const top = [...sheetStack].reverse().find(el => el.matches?.('dialog[data-cw-lifted][open]'));
    if (!top) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (top._cwShut) top._cwShut(); else top.dispatchEvent(new win.Event('cancel', {cancelable: true}));
  }
  // 2.0.275（Lulu：删除确认的按钮先黑一下再变红）：删除类的标记原来在弹窗显示之后才挂；改成打开的那一刻就挂（酒馆这时已经填好内容）。
  const tagDanger = d => { if (!enabled() || !d.matches?.(SMALL_POPUP)) return; const danger = DANGER_TEXT.test(d.querySelector('.popup-content')?.textContent || ''); if (d.hasAttribute('data-cw-danger') !== danger) d.toggleAttribute('data-cw-danger', danger); };
  function installLift() {
    win.HTMLDialogElement.prototype.showModal = function () { tagDanger(this); if (liftable(this)) return liftDialog(this); return nativeShowModal.call(this); };
    disposers.push(() => { win.HTMLDialogElement.prototype.showModal = nativeShowModal; shield?.remove(); shield = null; });
    if (!canPopover) return;
    on(doc, 'keydown', onSheetEscape, true);
  }
  function watchSheets() {
    installLift();
    dimEl = make('div', 'cw-sheet-dim'); dimEl.setAttribute('aria-hidden', 'true'); doc.body.append(dimEl);
    // 2.0.214：Claude Web 设置弹窗里「自定义配色」照 App 是一行「›」，点了升起下一层弹出页（色块原样搬过去，关了搬回来）。
    on(doc, 'click', e => {
      const sum = e.target.closest?.('dialog.cw-v4-editor #claude-web-colors>summary');
      const sw = sum && doc.getElementById('claude-web-swatches');
      if (!sw || !mobile()) return;
      e.preventDefault();
      openEditor(sw, sum.textContent.trim(), sum.parentElement.querySelector(':scope>.claude-web-help')?.textContent.trim());
    }, true);
    // 记住最近点的按钮，给酒馆弹窗的顶栏当标题。
    on(doc, 'click', e => { const el = e.target.closest?.('button,.menu_button,[role=button],a'); if (el) lastTrigger = {el, at: Date.now()}; }, true);
    // 酒馆的 Popup 是 body 的直接子元素：只看 body 的直接子元素增删，再看这些 <dialog> 自己的 open / closing。
    const watched = new WeakSet();
    const dialogMo = new win.MutationObserver(syncSheet); observers.push(dialogMo);
    const hook = () => { for (const d of doc.querySelectorAll('body>dialog.popup')) if (!watched.has(d)) { watched.add(d); dialogMo.observe(d, {attributes:true, attributeFilter:['open','closing','opening']}); } syncSheet(); };
    observe(doc.body, hook, {childList:true});
    const pm = pmEl();
    if (pm) { observe(pm, syncSheet, {attributes:true, attributeFilter:['class']}); decoratePromptPopup(pm); }
    on(win, 'resize', syncSheet);
    disposers.push(() => { win.clearTimeout(sheetAnimTimer); win.clearTimeout(pmCloseTimer); unhostPm(); dimEl?.remove(); for (const a of ['data-cw-sheet','data-cw-sheet-anim','data-cw-sheet-deep','data-cw-sheet-drag']) root.removeAttribute(a); });
    hook();
  }
  // 提示词管理器的编辑 / 查看页也照弹出页排：顶栏「‹ 预设 | 编辑 | 保存」。按钮只是去点酒馆原来的关闭 / 保存，保存逻辑不变。
  // 原来的 <h3> 搬进顶栏当标题（保留它的 data-i18n），关掉扩展时搬回去。顶栏可以往下拖关闭。
  function decoratePromptPopup(pm) {
    for (const [areaId, closeId, saveId] of [['completion_prompt_manager_popup_edit','completion_prompt_manager_popup_entry_form_close','completion_prompt_manager_popup_entry_form_save'],['completion_prompt_manager_popup_inspect','completion_prompt_manager_popup_close_button','']]) {
      const area = doc.getElementById(areaId), h3 = area?.querySelector(':scope>h3');
      if (!area || !h3 || area.querySelector(':scope>.cw-pm-head')) continue;
      const head = make('div', 'cw-pm-head');
      const backLabel = t('预设', 'Presets');
      const closeIt = () => doc.getElementById(closeId)?.click();
      const back = button('', closeIt, 'cw-pm-back'); back.append(icon('chevl'), make('span', '', backLabel)); back.setAttribute('aria-label', backLabel);
      const marker = doc.createComment('cw-pm-h3'); h3.before(marker);
      head.append(back, h3);
      if (saveId) head.append(button(t('保存', 'Save'), () => doc.getElementById(saveId)?.click(), 'cw-pm-save'));
      area.prepend(head);
      sheetDrag(pm, head, closeIt);
      disposers.push(() => { if (marker.parentNode) marker.replaceWith(h3); head.remove(); });
    }
  }
  if (doc.readyState === 'loading') on(doc,'DOMContentLoaded',start,{once:true}); else start();
  return { refresh: sync, activate, destroy() { destroyed = true; observers.forEach(m=>m.disconnect()); disposers.forEach(f=>f()); if (raf) win.cancelAnimationFrame(raf); for (const d of dialogs) d.close(); restoreAdaptedContainers(); shell?.remove(); doc.querySelector('.cw-v4-chat-head')?.remove(); root.removeAttribute('data-cw-v4'); root.removeAttribute('data-cw-v4-settings'); } };
}
