import { CONFIG } from '../config.js';

const zar = new Intl.NumberFormat(CONFIG.locale, { style: 'currency', currency: CONFIG.currency, minimumFractionDigits: 2 });

/** Format a rand amount, e.g. 1450 → "R 1 450,00" (en-ZA locale). */
export const money = (n) => zar.format(Number(n) || 0);

export const date = (iso) =>
  new Date(iso + (iso.length === 10 ? 'T12:00:00' : '')).toLocaleDateString(CONFIG.locale, { day: 'numeric', month: 'short', year: 'numeric' });

/** Escape user/dummy text before inserting into HTML templates. */
export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const round2 = (n) => Math.round(n * 100) / 100;

export const pluralise = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;

export const todayISO = () => new Date().toISOString().slice(0, 10);

const STATUS_TONE = {
  pending: 'gold', processing: 'rose', ready: 'sage', shipped: 'sage', completed: 'sage', paid: 'sage',
  approved: 'sage', active: 'sage', rejected: 'burgundy', cancelled: 'burgundy', draft: 'muted',
  'out of stock': 'burgundy', 'low stock': 'gold', 'in stock': 'sage', hidden: 'muted',
};
export const badge = (status, extra = '') =>
  `<span class="badge badge--${STATUS_TONE[String(status).toLowerCase()] ?? 'muted'}">${esc(status)}${extra}</span>`;
