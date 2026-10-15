// iOS mobile layout: focus from the original tap without Safari's reveal scroll.
// Focused taps, selection holds, drags and multiple touches retain native handling.
export function installIOSComposerFocus({win, enabled, prepare}) {
  const doc = win.document;
  let tap = null;
  const clear = () => { tap = null; };
  const start = event => {
    tap = null;
    const input = event.target?.closest?.('#send_textarea');
    if (!enabled() || !event.isTrusted || !input || doc.activeElement === input || event.touches.length !== 1) return;
    prepare();
    if (input.disabled || input.readOnly) return;
    const t = event.touches[0];
    tap = {input, id:t.identifier, x:t.clientX, y:t.clientY, at:win.performance.now()};
  };
  const move = event => {
    if (!tap) return;
    const t = [...event.touches].find(t => t.identifier === tap.id);
    if (event.touches.length !== 1 || !t || Math.hypot(t.clientX-tap.x, t.clientY-tap.y) > 15) tap = null;
  };
  const end = event => {
    const current = tap; tap = null;
    if (!current || !enabled() || !event.isTrusted || !event.cancelable || event.defaultPrevented || event.touches.length || win.performance.now()-current.at > 800) return;
    if (![...event.changedTouches].some(t => t.identifier === current.id)) return;
    const input = current.input;
    if (!input.isConnected || input.disabled || input.readOnly || doc.activeElement === input || event.target !== input) return;
    event.preventDefault();
    // Keep focus synchronous with touchend: iOS needs the user gesture for its keyboard.
    input.focus({preventScroll:true});
  };
  doc.addEventListener('touchstart', start, {capture:true, passive:true});
  doc.addEventListener('touchmove', move, {capture:true, passive:true});
  doc.addEventListener('touchend', end, {capture:true, passive:false});
  doc.addEventListener('touchcancel', clear, {capture:true, passive:true});
  return () => {
    tap = null;
    doc.removeEventListener('touchstart', start, true);
    doc.removeEventListener('touchmove', move, true);
    doc.removeEventListener('touchend', end, true);
    doc.removeEventListener('touchcancel', clear, true);
  };
}
