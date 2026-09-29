export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Tiny event bus so components (header badge, drawer, pages) stay in sync. */
const listeners = new Map();
export const on = (evt, fn) => {
  if (!listeners.has(evt)) listeners.set(evt, new Set());
  listeners.get(evt).add(fn);
  return () => listeners.get(evt).delete(fn);
};
export const emit = (evt, detail) => listeners.get(evt)?.forEach((fn) => fn(detail));

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Trap focus inside a dialog-like panel. Returns a release function. */
export function trapFocus(panel, onEscape) {
  const selector = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
  const handler = (e) => {
    if (e.key === 'Escape') { onEscape?.(); return; }
    if (e.key !== 'Tab') return;
    const items = $$(selector, panel).filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  panel.addEventListener('keydown', handler);
  return () => panel.removeEventListener('keydown', handler);
}

/** Simple async "working" state for buttons to give tactile feedback. */
export async function withBusy(btn, fn, ms = 700) {
  const label = btn.innerHTML;
  btn.disabled = true;
  btn.classList.add('is-busy');
  btn.setAttribute('aria-busy', 'true');
  await new Promise((r) => setTimeout(r, prefersReducedMotion() ? 150 : ms));
  try { return await fn(); }
  finally {
    btn.disabled = false;
    btn.classList.remove('is-busy');
    btn.removeAttribute('aria-busy');
    btn.innerHTML = label;
  }
}
