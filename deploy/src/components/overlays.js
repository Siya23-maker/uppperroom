import { trapFocus } from '../utils/dom.js';

/** Shared open/close behaviour for drawers & panels: scrim, scroll lock, focus trap, focus return. */
let active = null;

export function openPanel(panel, { initialFocus, onClose } = {}) {
  if (active) closePanel();
  const scrim = document.getElementById('scrim');
  const opener = document.activeElement;
  scrim.hidden = false;
  requestAnimationFrame(() => scrim.classList.add('is-open'));
  panel.classList.add('is-open');
  panel.setAttribute('aria-hidden', 'false');
  panel.inert = false;
  document.body.classList.add('is-locked');
  const release = trapFocus(panel, () => closePanel());
  active = { panel, opener, release, onClose };
  setTimeout(() => (initialFocus ? panel.querySelector(initialFocus) : panel.querySelector('button, a, input'))?.focus(), 60);
}

export function closePanel({ restoreFocus = true } = {}) {
  if (!active) return;
  const { panel, opener, release, onClose } = active;
  active = null;
  const scrim = document.getElementById('scrim');
  scrim.classList.remove('is-open');
  setTimeout(() => { if (!active) scrim.hidden = true; }, 280);
  panel.classList.remove('is-open');
  panel.setAttribute('aria-hidden', 'true');
  panel.inert = true;
  document.body.classList.remove('is-locked');
  release();
  onClose?.();
  if (restoreFocus && opener && document.contains(opener)) opener.focus();
}

export const isPanelOpen = (panel) => active?.panel === panel;

export function initOverlays() {
  document.getElementById('scrim').addEventListener('click', () => closePanel());
}
