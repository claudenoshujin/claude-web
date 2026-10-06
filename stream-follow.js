export function installStreamFollow({ win, doc, getContext, enabled }) {
  const chat = doc.getElementById('chat');
  const context = getContext();
  const source = context?.eventSource;
  const types = context?.eventTypes || context?.event_types || {};
  if (!chat || !source?.on) return null;

  let nativeBottom = null;
  let destroyed = false;
  let active = false;
  let following = false;
  let gesture = null;
  let touchTarget = null;
  let visibleHeight = 0;
  const visibleProperty = "--cl-mobile-chat-viewport-height";
  const counts = { renderedBatches: 0, nativeRequests: 0, pauses: 0, resumes: 0, decorations: 0, gestureStarts: 0, upwardMoves: 0, detachedMoves: 0 };
  const subscriptions = [];
  const listeners = [];
  import('../../../../script.js').then(module => {
    if (!destroyed && typeof module.scrollChatToBottom === 'function') nativeBottom = module.scrollChatToBottom;
  }).catch(() => { following = false; });

  const atBottom = () => Math.abs(chat.scrollHeight - chat.clientHeight - chat.scrollTop) < 5;
  const isEnabled = () => enabled() && getContext()?.powerUserSettings?.auto_scroll_chat_to_bottom
    && !getContext()?.powerUserSettings?.waifuMode;
  const requestNativeBottom = () => {
    if (!destroyed && following && isEnabled() && nativeBottom) {
      counts.nativeRequests += 1;
      nativeBottom({ waitForFrame: false });
    }
  };
  const updateVisibleRegion = () => {
    const root = doc.documentElement;
    if (!enabled()) { root.style.removeProperty(visibleProperty); visibleHeight = 0; return; }
    const height = win.visualViewport?.height || win.innerHeight;
    if (!height || Math.abs(height - visibleHeight) < 0.5) return;
    visibleHeight = height;
    // Only the chat's visible box uses this live value. The surrounding
    // mobile shell retains its existing stable viewport and keyboard logic.
    root.style.setProperty(visibleProperty, height + 'px');
    requestNativeBottom();
  };
  win.addEventListener('resize', updateVisibleRegion);
  win.visualViewport?.addEventListener('resize', updateVisibleRegion);
  const pause = () => {
    if (following) counts.pauses += 1;
    following = false;
  };
  const subscribe = (key, fallback, fn) => {
    const type = types[key] || fallback;
    source.on(type, fn);
    subscriptions.push({ type, fn });
  };
  subscribe('GENERATION_STARTED', 'generation_started', (...args) => {
    if (args[2] === true || args[0] === 'quiet') return;
    active = true;
    gesture = null;
    // Native streaming starts a new follow session and scrolls its initial
    // message to the bottom. A keyboard resize must not invalidate that start.
    following = !!isEnabled();
  });
  for (const [key, fallback] of [['GENERATION_ENDED','generation_ended'],
    ['GENERATION_STOPPED','generation_stopped'], ['GENERATION_FAILED','generation_failed']]) {
    subscribe(key, fallback, () => { active = false; });
  }
  subscribe('CHAT_CHANGED', 'chat_id_changed', () => { active = false; following = false; gesture = null; });

  const point = event => {
    const p = event.touches?.[0] || event;
    return { x: p.clientX, y: p.clientY };
  };
  const endTouch = () => {
    if (gesture) gesture.pressing = false;
    touchTarget?.removeEventListener('touchmove', move);
    touchTarget?.removeEventListener('touchend', endTouch);
    touchTarget?.removeEventListener('touchcancel', endTouch);
    touchTarget = null;
    win.removeEventListener('touchmove', move, true);
    win.removeEventListener('touchend', endTouch, true);
    win.removeEventListener('touchcancel', endTouch, true);
  };
  const start = event => {
    if (!event.isTrusted) return;
    endTouch();
    const p = point(event);
    gesture = { ...p, moved: false, pressing: true };
    counts.gestureStarts += 1;
    if (event.type === 'touchstart') {
      // The native formatter replaces mes_text.innerHTML during the drag.
      // Continue receiving the already-authorized chat gesture even if its
      // original target is detached, without capturing or blocking the event.
      touchTarget = event.target;
      touchTarget.addEventListener('touchmove', move, { passive: true });
      touchTarget.addEventListener('touchend', endTouch, { passive: true });
      touchTarget.addEventListener('touchcancel', endTouch, { passive: true });
      win.addEventListener('touchmove', move, { capture: true, passive: true });
      win.addEventListener('touchend', endTouch, { capture: true, passive: true });
      win.addEventListener('touchcancel', endTouch, { capture: true, passive: true });
    }
  };
  const move = event => {
    if (!gesture || !event.isTrusted || gesture.lastEvent === event) return;
    gesture.lastEvent = event;
    if (touchTarget && !touchTarget.isConnected) counts.detachedMoves += 1;
    const p = point(event), dx = p.x - gesture.x, dy = p.y - gesture.y;
    if (Math.abs(dy) <= 6 || Math.abs(dy) <= Math.abs(dx)) return;
    gesture.moved = true;
    gesture.direction = dy > 0 ? 'away' : 'toward-bottom';
    // A downward finger drag moves the conversation upward. A layout scroll
    // has no preceding gesture and cannot cancel the intent to follow.
    if (dy > 0) { counts.upwardMoves += 1; pause(); }
  };
  const listen = (type, fn) => {
    chat.addEventListener(type, fn, { passive: true });
    listeners.push({ type, fn });
  };
  listen('touchstart', start);
  listen('pointerdown', event => { if (event.pointerType !== 'touch') start(event); });
  listen('pointermove', event => { if (event.pointerType !== 'touch' && event.buttons) move(event); });
  listen('wheel', event => {
    if (!event.isTrusted || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    gesture = { moved: true, direction: event.deltaY < 0 ? 'away' : 'toward-bottom' };
    if (event.deltaY < 0) pause();
  });
  listen('scroll', () => {
    if (gesture?.direction === 'toward-bottom' && isEnabled() && !following && atBottom()) {
      following = true;
      counts.resumes += 1;
    }
  });
  listen('scrollend', () => {
    // A native programmatic scroll can finish while a finger is still down.
    // Keep that input's ownership until release; scroll completion is not input completion.
    if (!gesture?.pressing) gesture = null;
  });
  for (const type of ['pointerup','pointercancel']) listen(type, event => {
    if (event.pointerType !== 'touch' && gesture) gesture.pressing = false;
  });
  listen('keydown', event => {
    if (!event.isTrusted || event.target.closest('input,textarea,[contenteditable="true"]')) return;
    if (['ArrowUp','PageUp','Home'].includes(event.key)) { gesture = { moved: true, direction: 'away' }; pause(); }
    if (['ArrowDown','PageDown','End'].includes(event.key)) gesture = { moved: true, direction: 'toward-bottom' };
  });

  const observer = new win.MutationObserver(records => {
    if (!active || !following || !isEnabled()) return;
    const message = chat.querySelector(':scope > .mes.last_mes[is_user="false"]');
    if (!message) return;
    const relevant = records.some(record => {
      const target = record.target.nodeType === 1 ? record.target : record.target.parentElement;
      const content = target?.closest?.('.mes_text,.mes_reasoning');
      if (content && content.closest('.mes') === message) return true;
      return record.target === chat && [...record.addedNodes].some(node => node === message);
    });
    if (!relevant) return;
    counts.renderedBatches += 1;
    requestNativeBottom();
  });
  // The observer runs after the native formatter's actual DOM write, before
  // its queued scroll event. No scheduler wrapping or extra paint loop.
  observer.observe(chat, { childList: true, subtree: true, characterData: true });
  updateVisibleRegion();
  return {
    afterDecoration() { counts.decorations += 1; requestNativeBottom(); },
    stats: () => ({ active, following, ready: !!nativeBottom, visibleHeight, gesture: gesture ? { pressing: gesture.pressing, moved: gesture.moved, direction: gesture.direction } : null, ...counts }),
    destroy() {
      destroyed = true;
      endTouch();
      observer.disconnect();
      win.removeEventListener('resize', updateVisibleRegion);
      win.visualViewport?.removeEventListener('resize', updateVisibleRegion);
      doc.documentElement.style.removeProperty(visibleProperty);
      for (const { type, fn } of listeners) chat.removeEventListener(type, fn);
      for (const { type, fn } of subscriptions) {
        if (source.removeListener) source.removeListener(type, fn);
        else source.off?.(type, fn);
      }
    },
  };
}
