// Independent of CW's theme, layout and main-module imports.
const RESTORE_KEY = 'claude-integrated-theme-restore:v2';
const FILE_NAME = 'claude-web-safety-state-v1.json';
const FILE_URL = '/user/files/' + FILE_NAME;
const VERSION = '2.0.128';
const OWNED_THEME_CSS = new Set([":root {\n  --cl-color-scheme:light;\n  --cl-canvas:#f8f8f6;\n  --cl-surface:#ffffff;\n  --cl-soft:#f4f4f1;\n  --cl-soft-hover:#efeeeb;\n  --cl-line:rgba(31,31,30,.15);\n  --cl-line-strong:rgba(31,31,30,.25);\n  --cl-hero:#373734;\n  --cl-ink:#121212;\n  --cl-muted:#7b7974;\n  --cl-control-muted:#686660;\n  --cl-icon:#0b0b0b;\n  --cl-rail-ink:#0b0b0b;\n  --cl-accent:#d97757;\n  --cl-accent-soft:#f3e0d8;\n  --cl-code:#f0eee6;\n  --cl-em-color:#6c6b66;\n  --cl-code-ink:#633a2e;\n  --cl-send-hover:#c6613f;\n  --cl-selection:#efcfc2;\n  --cl-scrollbar:#c9c5bc;\n  --cl-scrollbar-hover:#aaa59b;\n  --cl-dialog-shadow:0 12px 36px rgba(50,45,35,.12);\n  --cl-composer-shadow:0 10px 30px rgba(43,40,34,.10);\n  --cl-floating-shadow:0 14px 38px rgba(43,40,34,.11);\n  --cl-topbar-surface:rgba(248,248,246,.98);\n  --cl-body-weight:430;\n  --cl-clawd-eye:#000000;\n  --cl-clawd-eye-row-a:#000000;\n  --cl-clawd-eye-row-b:#d97757;\n  --cl-greeting-particle-shadow:39px 0 0 var(--cl-ink),42px 0 0 var(--cl-ink),45px 0 0 var(--cl-ink),45px 3px 0 var(--cl-ink),42px 6px 0 var(--cl-ink),21px 12px 0 var(--cl-ink),27px 12px 0 var(--cl-ink),33px 12px 0 var(--cl-ink),42px 12px 0 var(--cl-ink);\n  --cl-typing-float-animation:clawd-question-float 2.36s cubic-bezier(.37,0,.22,1) infinite;\n  --cl-greeting-particle-animation:clawd-question-float 2.83s cubic-bezier(.37,0,.22,1) .41s infinite;\n}",":root {\n  --cl-color-scheme:dark;\n  --cl-canvas:#1f1f1e;\n  --cl-surface:#2c2c2a;\n  --cl-soft:#2c2c2a;\n  --cl-soft-hover:#373734;\n  --cl-line:rgba(226,225,218,.15);\n  --cl-line-strong:rgba(226,225,218,.25);\n  --cl-hero:#c3c2b7;\n  --cl-ink:#f8f8f6;\n  --cl-muted:#97958c;\n  --cl-control-muted:#b8b6ae;\n  --cl-icon:#ffffff;\n  --cl-rail-ink:#ffffff;\n  --cl-accent:#d97757;\n  --cl-accent-soft:#3a2a22;\n  --cl-code:#131211;\n  --cl-em-color:#c3c2b7;\n  --cl-code-ink:#e6a58c;\n  --cl-send-hover:#c6613f;\n  --cl-selection:#5a3a2c;\n  --cl-scrollbar:#44423d;\n  --cl-scrollbar-hover:#55534c;\n  --cl-dialog-shadow:0 12px 36px rgba(0,0,0,.55);\n  --cl-composer-shadow:0 12px 34px rgba(0,0,0,.38);\n  --cl-floating-shadow:0 16px 42px rgba(0,0,0,.44);\n  --cl-topbar-surface:rgba(31,31,30,.98);\n  --cl-body-weight:400;\n  --cl-clawd-eye:#000000;\n  --cl-clawd-eye-row-a:#d97757;\n  --cl-clawd-eye-row-b:#000000;\n  --cl-greeting-particle-shadow:18px 0 0 #ef6a73,24px 0 0 #ef6a73,36px 0 0 #ef6a73,42px 0 0 #ef6a73,21px 3px 0 #ef6a73,33px 3px 0 #ef6a73,36px 3px 0 #ef6a73,39px 3px 0 #ef6a73,42px 3px 0 #ef6a73,45px 3px 0 #ef6a73,36px 6px 0 #ef6a73,39px 6px 0 #ef6a73,42px 6px 0 #ef6a73,39px 9px 0 #ef6a73,27px 12px 0 #ef6a73;\n  --cl-typing-float-animation:clawd-heart-float 2.36s cubic-bezier(.37,0,.22,1) infinite;\n  --cl-greeting-particle-animation:clawd-heart-float 2.57s cubic-bezier(.37,0,.22,1) .33s infinite;\n}"]);
const THEME_FIELDS = ["theme","blur_strength","shadow_color","shadow_width","font_scale","fast_ui_mode","waifuMode","avatar_style","chat_display","toastr_position","noShadows","chat_width","timer_enabled","timestamps_enabled","timestamp_model_icon","mesIDDisplay_enabled","hideChatAvatars_enabled","message_token_count_enabled","expand_message_actions","enableZenSliders","enableLabMode","hotswap_enabled","bogus_folders","zoomed_avatar_magnification","reduced_motion","compact_input_area","show_swipe_num_all_messages","click_to_edit","media_display","reasoning_auto_expand","main_text_color","italics_text_color","underline_text_color","quote_text_color","blur_tint_color","chat_tint_color","user_mes_blur_tint_color","bot_mes_blur_tint_color","border_color","custom_css"];

export async function installSafety() {
  if (window.__claudeSafety) return window.__claudeSafety;
  let state = null, writePending = false, operation = 0, message = '';
  let panel, status, host, busy = '', removal = null;
  function syncBusy() {
    for (const button of host?.shadowRoot?.querySelectorAll('button') || []) {
      button.disabled = !!busy || (!!removal?.confirmed && button.dataset.action !== 'uninstall');
      if (button.dataset.action === 'uninstall') button.textContent = removal?.confirmed ? '重试剩余清理' : '卸载 CW 并清理残留';
    }
    const toggle = document.getElementById('claude-web-enabled');
    if (toggle) toggle.disabled = !!busy || !!removal?.confirmed;
    host?.setAttribute('aria-busy', String(!!busy));
  }
  async function run(label, task) {
    if (busy) { notify('正在' + busy + '，请等待当前操作结束。'); return false; }
    if (removal?.confirmed && label !== '卸载与清理') { notify('扩展已卸载，请先重试剩余清理。'); return false; }
    busy = label; const token = ++operation; syncBusy();
    try { return await task(token); }
    finally { if (token === operation) { busy = ''; syncBusy(); } }
  }
  function current(token) { if (token !== operation) throw new Error('操作状态已改变，请重试'); }
  const local = (key, value) => { try { value === undefined ? localStorage.removeItem(key) : localStorage.setItem(key, value); } catch {} };
  const readLocal = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const markOff = () => { local('claude-web:enabled','off'); try { sessionStorage.setItem('claude-web:soft-off','1'); } catch {} };
  const notify = text => { message = text; if (status) status.textContent = text; };
  async function boundedFetch(url, options = {}) {
    const controller = new AbortController(); let timer;
    const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Error('请求等待超过8秒'));},8000)});
    try { return await Promise.race([fetch(url,{...options,signal:controller.signal}),timeout]); }
    finally { clearTimeout(timer); }
  }
  async function readState() {
    let timer;
    const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('安全状态读取超时')),8000)});
    try { return await Promise.race([readStateBody(),timeout]); }
    finally {clearTimeout(timer);}
  }
  async function readStateBody() {
    const response = await boundedFetch(FILE_URL + '?cw=' + Date.now(), {cache: 'no-store'});
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('无法读取安全状态');
    const data = await response.json();
    if (data.schema !== 1 || typeof data.enabled !== 'boolean' || typeof data.id !== 'string') throw new Error('安全状态记录无效');
    return data;
  }
  async function headers() {
    const context = window.SillyTavern?.getContext?.();
    if (context?.getRequestHeaders) return context.getRequestHeaders();
    const response = await boundedFetch('/csrf-token');
    const data = response.ok ? await response.json() : {};
    return {'Content-Type':'application/json', ...(data.token ? {'X-CSRF-Token':data.token} : {})};
  }
  async function persist(enabled, restore = state?.restore || null, removed = null) {
    if (!enabled) markOff();
    if (writePending) throw new Error('安全状态正在保存，请稍后重试');
    writePending = true;
    const next = {schema:1, id:crypto.randomUUID(), enabled, restore, ...(removed ? {removed} : {})};
    let expired=false,timer;
    const controller = new AbortController();
    const work=Promise.resolve().then(async()=>{
      const bytes = new TextEncoder().encode(JSON.stringify(next));
      let binary = ''; for (const byte of bytes) binary += String.fromCharCode(byte);
      const requestHeaders=await headers();
      if(expired)throw new Error('安全状态保存等待已超时');
      const response = await fetch('/api/files/upload', {method:'POST', headers:requestHeaders, body:JSON.stringify({name:FILE_NAME, data:btoa(binary)}),signal:controller.signal});
      if(expired)throw new Error('安全状态保存等待已超时');
      if (!response.ok) throw new Error('安全状态保存失败');
      const actual = await readState();
      if(expired)throw new Error('安全状态保存等待已超时');
      if (actual?.id !== next.id) throw new Error('安全状态保存尚未确认');
      state = actual;
      local('claude-web:enabled', enabled ? 'on' : 'off');
      if (enabled) { try { sessionStorage.removeItem('claude-web:soft-off'); } catch {} }
      if (restore) local(RESTORE_KEY, JSON.stringify(restore));
      return actual;
    });
    const release=()=>{writePending=false;};work.then(release,release);
    const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>{expired=true;controller.abort();reject(new Error('安全状态保存确认超过15秒；仅停止等待，请通过原生管理停用 CW'));},15000)});
    try{return await Promise.race([work,timeout]);}finally{clearTimeout(timer);}
  }
  function captureTarget() {
    const cleanFallback = target => {
      // Earlier safety builds used exactly these two fields for a missing-snapshot
      // fallback. Never rewrite a complete original theme snapshot.
      if (target && Object.keys(target).length === 2 && typeof target.theme === 'string' && !/^Claude Web/.test(target.theme) && Object.hasOwn(target,'custom_css') && OWNED_THEME_CSS.has(target.custom_css)) return {...target, custom_css:''};
      return target;
    };
    try { const saved = JSON.parse(readLocal(RESTORE_KEY) || 'null'); if (saved && typeof saved === 'object' && !Array.isArray(saved)) return cleanFallback(saved); } catch {}
    if (state?.restore) return cleanFallback(state.restore);
    const bridge = window.SillyTavern;
    const settings = (bridge?.getContext?.() || bridge)?.powerUserSettings;
    if (!settings) return null;
    if (settings.theme && !/^Claude Web/.test(settings.theme)) return JSON.parse(JSON.stringify(Object.fromEntries(THEME_FIELDS.map(key=>[key,settings[key]]))));
    const select = document.querySelector('#themes, #theme_select');
    const native = select && [...select.options].find(option => !option.disabled && option.value && !/^Claude Web/.test(option.value) && !/select|choose|选择/i.test(option.textContent));
    if (!native) return null;
    // With no snapshot we cannot reconstruct the user's previous theme.
    // Keep custom CSS intact and select an explicit native fallback.
    const css = settings.custom_css || '';
    return {theme:native.value, custom_css:OWNED_THEME_CSS.has(css) ? '' : css};
  }
  function withdraw() {
    markOff();
    document.documentElement.dataset.claudeEnabled = 'off';
    try { window.__claudeIntegratedTheme?.destroy?.({restore:false}); } catch {}
    try { window.__claudeOfficialLayout?.destroy?.(); } catch {}
    delete window.__claudeOfficialLayout;
    try { window.__claudeClawdInteraction?.destroy?.(); } catch {}
    // Cleanup cannot guarantee recovery from a half-initialized layout. The
    // gated reload below restores the host's real nodes from native markup.
    for (const node of document.querySelectorAll('link[href]')) {
      const href = node.getAttribute('href');
      if (href && new URL(href, document.baseURI).href.startsWith(new URL('.', import.meta.url).href) && /\.css(?:\?|$)/.test(href)) node.remove();
    }
    for (const id of ['claude-integrated-theme-live-style','claude-layer-order','claude-clawd-interaction-style']) document.getElementById(id)?.remove();
    for (const key of ['cwV4','cwV4Settings','claudeIntegratedTheme','claudeArchive','claudeArchiveGhost']) delete document.documentElement.dataset[key];
  }
  async function exit() {
    const token = operation;
    withdraw();
    notify('CW 已停止。正在保留安全状态…');
    try {
      await persist(false, captureTarget());
      current(token);
      notify('安全退出已保存，正在回到原生酒馆…');
      location.reload();
    } catch (error) {
      notify('CW 已在本页停止，但跨重启停用尚未确认：' + error.message + '。请在原生扩展管理中停用 CW；不要清除数据。');
    }
  }
  async function recover() {
    if (state?.enabled) return;
    const token = operation;
    try {
      let target = captureTarget();
      for (let i=0; !target && i<100; i++) { await new Promise(r=>setTimeout(r,200)); target=captureTarget(); }
      if (!target) throw new Error('原生设置尚未就绪，请稍后重试');
      if (JSON.stringify(state?.restore) !== JSON.stringify(target)) await persist(false, target);
      local(RESTORE_KEY, JSON.stringify(target));
      const helper = await import('./theme-restore.js?v=' + VERSION);
      const recovered = await helper.recoverPendingThemeRestore(window);
      if (token !== operation) return;
      notify(recovered ? 'CW 安全模式：已恢复并保存原生主题。' : 'CW 安全模式：恢复状态已改变，请重试。');
      if (recovered) location.reload();
    } catch (error) {
      if (token === operation) notify('CW 安全模式；原生界面可继续使用。恢复尚未保存：' + error.message + (state?.restore || readLocal(RESTORE_KEY) ? '。恢复目标已保留，可稍后重试。' : '。恢复目标尚未保留，请稍后重试。'));
    }
  }
  async function enable() {
    if (window.__claudeThemeSavePending) { notify('原生保存仍在进行，请等待结束后再启用 CW。'); return; }
    const token = operation;
    try { await persist(true, captureTarget()); current(token); location.reload(); }
    catch (error) { notify('启用未保存：' + error.message); }
  }
  async function uninstall() {
    if (!removal?.confirmed && !window.confirm('卸载 Claude Web 并清理它的设置和主题残留？聊天、其他插件和原有自定义 CSS 会保留。主题恢复保存未确认时不会删除扩展。')) return;
    const token = operation;
    withdraw();
    notify('CW 已停止，正在保存恢复目标并清理主题…');
    try {
      if (!removal?.confirmed) {
      const target = captureTarget();
      if (!target) throw new Error('原生主题设置尚未就绪，请稍后重试');
      await persist(false,target);
      const helper = await import('./theme-restore.js?v=' + VERSION);
      if (!await helper.recoverPendingThemeRestore(window)) throw new Error('原生主题恢复未确认');
      current(token);
      const path = decodeURIComponent(new URL(import.meta.url).pathname);
      const match = path.match(/\/scripts\/extensions\/third-party\/([^/]+)\/emergency\.js$/);
      if (!match) throw new Error('无法确认当前 CW 安装路径');
      const name = match[1], fullName='third-party/'+name;
      const listResponse = await boundedFetch('/api/extensions/discover',{cache:'no-store'});
      if (!listResponse.ok) throw new Error('无法确认扩展安装范围');
      const list = await listResponse.json(), entry=list.find(x=>x.name===fullName);
      if (!entry && removal?.fullName === fullName) {
        removal.confirmed = true;
      } else {
      if (!entry || !['local','global'].includes(entry.type)) throw new Error('当前 CW 安装信息不一致');
      removal = {name, fullName, type:entry.type, confirmed:false};
      let deleteError;
      current(token);
      try {
        const response = await boundedFetch('/api/extensions/delete',{method:'POST',headers:await headers(),body:JSON.stringify({extensionName:name,global:entry.type==='global'})});
        if (!response.ok) deleteError = new Error('原生卸载失败，恢复记录和扩展已保留');
      } catch (error) { deleteError = error; }
      const verify = await boundedFetch('/api/extensions/discover',{cache:'no-store'});
      current(token);
      if (!verify.ok) throw new Error('卸载结果尚未确认，请保持本页重试');
      if ((await verify.json()).some(x=>x.name===fullName)) throw deleteError || new Error('仍检测到同名 CW 安装，请通过原生管理核对');
      removal.confirmed = true;
      }
      }
      current(token);
      // Only record this after native discovery confirmed this exact install is
      // gone. If cleanup fails, loading the same name again proves a reinstall.
      if (state?.removed?.fullName !== removal.fullName) await persist(false, null, {fullName:removal.fullName});
      current(token);
      const remove = await boundedFetch('/api/files/delete',{method:'POST',headers:await headers(),body:JSON.stringify({path:FILE_URL})});
      if (!remove.ok && remove.status!==404) throw new Error('扩展已卸载，但安全记录清理失败');
      current(token);
      if (await readState()) throw new Error('安全记录仍存在，清理尚未确认');
      current(token);
      for (const key of Object.keys(localStorage)) if(key.startsWith('claude-web:') || ['claude-web-clawd-pile-v3',RESTORE_KEY].includes(key)) localStorage.removeItem(key);
      try { sessionStorage.removeItem('claude-web:soft-off'); } catch {}
      notify('Claude Web 已卸载，主题和设置残留已清理。');
      location.reload();
    } catch(error) { notify(removal?.confirmed ? '扩展已卸载，剩余清理未完成：'+error.message+'。请保持本页，点击“重试剩余清理”；若已刷新，可重新安装同一 CW。' : '卸载／清理未全部完成：'+error.message+(state?.enabled===false?'。CW 已停用，可稍后重试。':'。本页已停止，跨重启停用未确认，请通过原生扩展管理停用 CW。')); }
  }
  function mount() {
    if (!document.body || host) return;
    host = document.createElement('div'); host.id = 'claude-web-safety';
    host.style.cssText = 'display:block!important;width:100%!important;height:auto!important;margin:8px 0!important;';
    const shadow = host.attachShadow({mode:'open'});
    shadow.innerHTML = `<style>:host{color-scheme:light dark}*{box-sizing:border-box}details{font:13px/1.5 system-ui;color:CanvasText;background:Canvas;border:1px solid GrayText;border-radius:8px;padding:10px;width:100%}summary{cursor:pointer}p{white-space:normal}button{font:inherit;padding:7px;margin:3px;cursor:pointer}</style><details><summary>Claude Web · 卸载与清理</summary><p role="status"></p><button data-action="uninstall">卸载 CW 并清理残留</button><button data-action="exit">仅停用 CW</button><button data-action="retry">重试主题恢复</button><button data-action="enable">重新启用 CW</button></details>`;
    panel = shadow.querySelector('details'); status = shadow.querySelector('[role=status]'); status.textContent=message;
    shadow.querySelector('[data-action=exit]').onclick=()=>api.exit();
    shadow.querySelector('[data-action=retry]').onclick=()=>api.recover();
    shadow.querySelector('[data-action=enable]').onclick=()=>api.enable();
    shadow.querySelector('[data-action=uninstall]').onclick=()=>api.uninstall();
    const place = () => {
      const parent = document.querySelector('#claude-web-settings .inline-drawer-content') || document.getElementById('claude-web-settings') || document.getElementById('extensions_settings2') || document.getElementById('extensions_settings');
      if (parent && host.parentElement !== parent && !host.contains(parent)) parent.append(host);
    };
    place();
    syncBusy();
    new MutationObserver(place).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
  }
  const api = {get state(){return state}, get busy(){return busy}, get removal(){return removal},
    persist(...args) { if(busy) return Promise.reject(new Error('安全操作正在进行，请稍后重试')); return run('保存安全状态',()=>persist(...args)); },
    exit:()=>run('停用 CW',exit), recover:()=>run('恢复主题',recover), enable:()=>run('启用 CW',enable), uninstall:()=>run('卸载与清理',uninstall),
    disable:()=>run('关闭并恢复主题',async()=>{withdraw();await persist(false,captureTarget());await recover();}),
    notify, markOff(){if(busy)return false;markOff();return true;},
    async confirmRestore(raw, expectedId) {
      if (!state || state.enabled || state.id !== expectedId || JSON.stringify(state.restore) !== raw) throw new Error('安全恢复目标已改变');
      await persist(false, null);
    },
    async shouldStart() {
      try {
        state = await readState();
        if (state) { if(state.restore)local(RESTORE_KEY,JSON.stringify(state.restore)); else local(RESTORE_KEY); }
        const installedPath = decodeURIComponent(new URL(import.meta.url).pathname);
        const installedMatch = installedPath.match(/\/scripts\/extensions\/third-party\/([^/]+)\/emergency\.js$/);
        const fullName = installedMatch && 'third-party/' + installedMatch[1];
        if (fullName && state?.removed?.fullName === fullName) {
          const discovered = await boundedFetch('/api/extensions/discover',{cache:'no-store'});
          if (!discovered.ok) throw new Error('无法确认重新安装状态');
          if (!(await discovered.json()).some(entry=>entry.name===fullName)) throw new Error('尚未确认 CW 重新安装');
          const target=captureTarget();
          if (!target) throw new Error('原生主题设置尚未就绪');
          await persist(true, target);
        }
        const url = new URL(location.href), wanted=url.searchParams.get('claude');
        const layout=url.searchParams.get('claudelayout');
        let consumed=false;
        if (['auto','pc','mobile'].includes(layout)) {local('claude-web:layout',layout);url.searchParams.delete('claudelayout');consumed=true;}
        if (['on','off'].includes(wanted)) {url.searchParams.delete('claude');consumed=true;if(wanted==='off')await persist(false,captureTarget());else if(!state)local('claude-web:enabled','on');}
        if(consumed)history.replaceState(history.state,'',url.pathname+url.search+url.hash);
        let softOff = false; try { softOff=sessionStorage.getItem('claude-web:soft-off')==='1'; } catch {}
        const enabled = state ? state.enabled && !softOff : readLocal('claude-web:enabled') !== 'off';
        if(enabled && !state) {
          const target=captureTarget();
          if(!target)throw new Error('原生主题设置尚未就绪');
          await persist(true,target);
        }
        local('claude-web:enabled',enabled?'on':'off');
        if (!enabled) {document.documentElement.dataset.claudeEnabled='off'; notify('Claude Web 内部开关已关闭。扩展列表的勾选不代表主题已启用，可点击“重新启用 CW”恢复正常菜单。'); if(state?.restore || readLocal(RESTORE_KEY)) void api.recover();}
        return enabled;
      } catch(error) {document.documentElement.dataset.claudeEnabled='off';notify('安全状态读取失败，本次已暂停加载 CW：'+error.message+'。刷新可重试，或通过原生管理停用 CW。');return false;}
    }
  };
  window.__claudeSafety=api;
  mount(); if(!host)document.addEventListener('DOMContentLoaded',mount,{once:true});
  return api;
}
