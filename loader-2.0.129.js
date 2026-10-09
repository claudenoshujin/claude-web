// Keep the entry independent of every other module: a failed safety import
// must still leave a visible explanation and a way to reload the host.
function showStartupError(error) {
  const message = 'CW 加载失败：' + (error?.message || String(error)) + '。请通过原生扩展管理检查更新或重新安装 CW，再重新加载酒馆。';
  console.error('[Claude Web] ' + message, error);
  const mount = () => {
    if (!document.body || document.getElementById('claude-web-startup-error')) return;
    const host = document.createElement('section');
    host.id = 'claude-web-startup-error';
    host.setAttribute('role', 'alert');
    host.style.cssText = 'display:block!important;box-sizing:border-box!important;padding:12px!important;margin:8px 0!important;border:1px solid #b66!important;border-radius:8px!important;background:#242424!important;color:#fff!important;white-space:normal!important;';
    const title = document.createElement('strong');
    title.textContent = 'Claude Web · 启动失败';
    const status = document.createElement('p');
    status.textContent = message;
    const reload = document.createElement('button');
    reload.type = 'button';
    reload.textContent = '重新加载酒馆';
    reload.onclick = () => location.reload();
    host.append(title, status, reload);
    const place = () => {
      const parent = document.getElementById('extensions_settings2') || document.getElementById('extensions_settings');
      const target = parent || document.body;
      host.style.position = parent ? '' : 'fixed';
      host.style.bottom = parent ? '' : '12px';
      host.style.right = parent ? '' : '12px';
      host.style.width = parent ? '100%' : 'min(420px, calc(100vw - 24px))';
      host.style.maxHeight = parent ? '' : '50vh';
      host.style.overflowY = parent ? '' : 'auto';
      host.style.zIndex = parent ? '' : '2147483647';
      if (host.parentElement !== target) target.append(host);
    };
    place();
    new MutationObserver(place).observe(document.body, { subtree: true, childList: true });
  };
  mount();
  if (!document.body) document.addEventListener('DOMContentLoaded', mount, { once: true });
}

// Do not hold ST's settings startup on its own readiness-dependent CW gate.
void (async () => {
  const { installSafety } = await import('./emergency.js?v=2.0.129');
  const safety = await installSafety();
  if (!await safety.shouldStart()) return;
  try {
    await import('./index.js?v=2.0.129');
  } catch (error) {
    console.error('[Claude Web] 主界面加载失败', error);
    safety.notify('CW 主界面加载失败：' + error.message + '。可使用这里的紧急退出。');
  }
})().catch(showStartupError);
