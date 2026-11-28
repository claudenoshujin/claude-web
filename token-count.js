/* Approximate token count. Prefer the native model tokenizer and debounce input. */
export function watchTokens(win, input, render, delay = 400) {
  let timer = 0, fallback = 0, seq = 0, stopped = false;

  async function estimate(value, current) {
    try {
      const {guesstimate} = await import(new URL('/scripts/tokenizers.js',win.location.href).href);
      if (current()) render(guesstimate(value));
    } catch {
      if (current()) render(null);
    }
  }

  async function count() {
    timer = 0;
    const mine = ++seq;
    const value = input.value || '';
    const current = () => !stopped && mine === seq && value === (input.value || '');
    if (!value.trim()) {
      render(0);
      return;
    }

    // Some native counters resolve to zero or leave their promise pending on error.
    const native = win.SillyTavern?.getContext?.()?.getTokenCountAsync;
    const deadline = win.setTimeout(() => {
      if (current()) void estimate(value,current);
    },650);
    fallback = deadline;
    try {
      const n = await native?.(value);
      if (!current()) return;
      if (Number.isFinite(n) && n > 0) render(n);
      else await estimate(value,current);
    } catch {
      if (current()) await estimate(value,current);
    } finally {
      win.clearTimeout(deadline);
      if (fallback === deadline) fallback = 0;
    }
  }

  function cancelPending() {
    seq++;
    win.clearTimeout(timer);
    win.clearTimeout(fallback);
  }

  function schedule() {
    if (stopped) return;
    cancelPending();
    timer = win.setTimeout(count,delay);
  }
  input.addEventListener('input',schedule);
  void count();
  return {refresh:schedule,stop(){
    stopped = true;
    cancelPending();
    input.removeEventListener('input',schedule);
  }};
}
export const tokenText = (t,n) => n == null ? '' : t(`约 ${n} Token`,`~${n} tokens`);
