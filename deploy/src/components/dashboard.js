import { db } from '../store/db.js';
import { ACCOUNTS } from '../data/accounts.js';
import { getBusiness } from '../data/businesses.js';
import { icon } from './icons.js';
import { esc } from '../utils/format.js';
import { navigate, currentUrl } from '../router.js';
import { toast } from './toast.js';
import { breadcrumbs } from './breadcrumbs.js';

const ROLES = [
  { id: 'customer', label: 'Customer', href: '/account' },
  { id: 'seller', label: 'Seller', href: '/seller' },
  { id: 'admin', label: 'Admin', href: '/admin' },
];

/** The demo role switcher bar shown at the top of every dashboard. */
export function roleSwitcher(active) {
  const s = db.session();
  return `
  <div class="role-bar" role="region" aria-label="Demo role switcher">
    <div class="role-bar__label"><span class="badge badge--demo">Demo</span> <span>Preview dashboards as:</span></div>
    <div class="role-bar__opts" role="group" aria-label="Choose demo role">
      ${ROLES.map((r) => `<button type="button" class="role-bar__btn" data-role="${r.id}" aria-pressed="${r.id === active}">${r.label}</button>`).join('')}
    </div>
    ${active === 'seller' ? `
    <div class="role-bar__seller">
      <label for="rb-seller" class="small">Seller</label>
      <select class="select" id="rb-seller">
        ${ACCOUNTS.sellers.map((x) => `<option value="${x.id}" ${x.id === s.sellerId ? 'selected' : ''}>${esc(getBusiness(x.businessId).name)}</option>`).join('')}
      </select>
    </div>` : ''}
    <p class="role-bar__note small">Prototype preview — not real sign-in.</p>
  </div>`;
}

export function bindRoleSwitcher(root) {
  root.querySelectorAll('[data-role]').forEach((b) =>
    b.addEventListener('click', () => {
      const r = ROLES.find((x) => x.id === b.dataset.role);
      db.setRole(r.id);
      navigate(r.href);
    }),
  );
  root.querySelector('#rb-seller')?.addEventListener('change', (e) => {
    db.setRole('seller', e.target.value);
    toast(`Now viewing ${getBusiness(db.currentSeller().businessId).name}'s dashboard`);
    navigate(currentUrl(), { scroll: false });
  });
}

/**
 * Dashboard page shell.
 * tabs: [{ id, label, icon, count? }]
 */
export function dashboardShell({ role, base, title, subtitle, avatar, tabs, active, content, crumbs }) {
  return `
  ${breadcrumbs(crumbs ?? [{ label: title }])}
  <section class="container dash" aria-labelledby="dash-title">
    ${roleSwitcher(role)}
    <header class="dash__head">
      <span class="dash__avatar" aria-hidden="true">${avatar}</span>
      <div>
        <h1 id="dash-title" class="dash__title">${esc(title)}</h1>
        <p class="muted" style="margin:0">${subtitle}</p>
      </div>
    </header>
    <div class="dash__layout">
      <nav class="dash__nav" aria-label="${esc(title)} sections">
        ${tabs.map((t) => `<a class="dash__link" href="${base}${t.id === tabs[0].id ? '' : `?tab=${t.id}`}" ${t.id === active ? 'aria-current="page"' : ''}>${icon(t.icon)} <span>${t.label}</span>${t.count ? `<span class="count">${t.count}</span>` : ''}</a>`).join('')}
      </nav>
      <div class="dash__content">${content}</div>
    </div>
  </section>`;
}

/** Replace a tiny dialog-based confirm with a nicer modal (falls back to confirm()). */
export function confirmModal({ title, body, confirmLabel = 'Confirm', tone = '' }) {
  return new Promise((resolve) => {
    const dlg = document.createElement('dialog');
    dlg.className = 'modal';
    dlg.setAttribute('aria-labelledby', 'modal-title');
    dlg.innerHTML = `
      <form method="dialog">
        <div class="modal__head"><h2 id="modal-title">${title}</h2><button class="icon-btn" value="cancel" aria-label="Close">${icon('close')}</button></div>
        <div class="modal__body">${body}</div>
        <div class="modal__foot"><button class="btn btn--ghost" value="cancel">Cancel</button><button class="btn ${tone}" value="ok">${confirmLabel}</button></div>
      </form>`;
    document.body.appendChild(dlg);
    if (typeof dlg.showModal !== 'function') { resolve(confirm(title)); dlg.remove(); return; }
    dlg.showModal();
    dlg.addEventListener('close', () => { resolve(dlg.returnValue === 'ok' ? dlg : null); setTimeout(() => dlg.remove(), 0); });
  });
}

export const emptyState = (iconName, heading, text, action = '') => `
  <div class="empty-state card"><span class="empty-state__icon">${icon(iconName)}</span><h3>${heading}</h3><p class="muted">${text}</p>${action}</div>`;

export const stat = (label, value, note = '') => `<div class="stat"><p class="stat__label">${label}</p><p class="stat__value">${value}</p>${note ? `<p class="stat__note">${note}</p>` : ''}</div>`;
