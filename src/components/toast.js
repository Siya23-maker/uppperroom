import { icon } from './icons.js';
import { esc } from '../utils/format.js';

let region;
export function toast(message, { action, href, tone = 'check', duration = 3800 } = {}) {
  region ??= document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.innerHTML = `${icon(tone)}<span>${esc(message)}</span>${action && href ? `<a href="${href}">${esc(action)}</a>` : ''}`;
  region.appendChild(el);
  const t = setTimeout(close, duration);
  function close() {
    clearTimeout(t);
    el.classList.add('is-leaving');
    setTimeout(() => el.remove(), 300);
  }
  el.querySelector('a')?.addEventListener('click', close);
}
