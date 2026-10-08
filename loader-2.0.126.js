import { installSafety } from './emergency.js?v=2.0.126';
const safety = await installSafety();
if (await safety.shouldStart()) {
  try { await import('./index.js?v=2.0.126'); }
  catch (error) { safety.notify('CW 主界面加载失败：' + error.message + '。可使用这里的紧急退出。'); }
}
