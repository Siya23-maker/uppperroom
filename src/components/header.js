import { CONFIG } from '../config.js';
import { $, $$, on, prefersReducedMotion } from '../utils/dom.js';
import { esc } from '../utils/format.js';
import { icon } from './icons.js';
import { img, productImage } from './cards.js';
import { openPanel, closePanel } from './overlays.js';
import { cart } from '../store/cart.js';
import { db } from '../store/db.js';
import { ACCOUNTS } from '../data/accounts.js';
import { getBusiness } from '../data/businesses.js';
import { categoryName, CATEGORIES } from '../data/categories.js';
import { navigate } from '../router.js';
import { toast } from './toast.js';

export const NAV = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'shop', label: 'Shop', href: '/shop' },
  { key: 'businesses', label: 'Our Businesses', href: '/businesses' },
  { key: 'about', label: 'About Us', href: '/about' },
  { key: 'sell', label: 'Become a Seller', href: '/become-a-seller' },
  { key: 'contact', label: 'Contact', href: '/contact' },
];

export const DASHBOARD_FOR = { customer: '/account', seller: '/seller', admin: '/admin' };
const ROLE_LABEL = { customer: 'Customer', seller: 'Seller', admin: 'Admin' };

const ANNOUNCEMENTS = [
  'Free collection at The Upper Room · Free delivery on orders over R950',
  'Every purchase supports a church-member business',
  'Gather Together, Brewing in Unity',
];

export const logoMarkup = (cls = 'brand__logo') => `
  <img class="${cls}" src="${CONFIG.logoPath}" alt="${CONFIG.siteName}" width="200" height="58">
  <span class="brand__text" aria-hidden="true"><b>The Upper Room</b><small>Gather Together</small></span>`;

/** If the supplied logo file is missing, show the typeset name instead (never a redrawn logo). */
export function bindLogoFallback(root) {
  $$('.brand, .footer__logo', root).forEach((brand) => {
    const im = brand.querySelector('img');
    if (!im) return;
    const fail = () => brand.classList.add('no-logo');
    if (im.complete && im.naturalWidth === 0) fail();
    im.addEventListener('error', fail, { once: true });
  });
}

export function renderHeader(mount) {
  mount.innerHTML = `
  <div class="announce on-dark" role="region" aria-label="Announcements">
    <div class="container announce__inner">
      <span class="badge badge--demo" title="This is an interactive prototype with demo data">Prototype</span>
      <p class="announce__msg" aria-live="off">${ANNOUNCEMENTS[0]}</p>
    </div>
  </div>
  <header class="site-header" id="site-header">
    <div class="container header__inner">
      <div class="row" style="gap:4px">
        <button class="icon-btn header__menu-btn" type="button" aria-controls="mobile-nav" aria-expanded="false" aria-label="Open menu">${icon('menu')}</button>
        <a class="brand" href="/" aria-label="${CONFIG.siteName} — home">${logoMarkup()}</a>
      </div>
      <nav class="primary-nav" aria-label="Primary">
        <ul>${NAV.map((n) => `<li><a href="${n.href}" data-nav="${n.key}">${n.label}</a></li>`).join('')}</ul>
      </nav>
      <div class="header__actions">
        <span class="role-chip" id="role-chip" title="Demo role (prototype only)"></span>
        <button class="icon-btn" type="button" id="search-btn" aria-controls="search-panel" aria-expanded="false" aria-label="Search products">${icon('search')}</button>
        <div class="account-wrap">
          <button class="icon-btn" type="button" id="account-btn" aria-haspopup="true" aria-controls="account-menu" aria-expanded="false" aria-label="Account and demo role">${icon('user')}</button>
          <div class="popover" id="account-menu" hidden></div>
        </div>
        <button class="icon-btn" type="button" id="cart-btn" aria-controls="cart-drawer" aria-expanded="false" aria-label="Open cart">
          ${icon('bag')}<span class="cart-count" id="cart-count" data-count="0">0</span>
        </button>
      </div>
    </div>
  </header>`;

  bindLogoFallback(mount);
  rotateAnnouncements($('.announce__msg', mount));

  // Scroll state
  const header = $('#site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Cart count
  const count = $('#cart-count');
  const cartBtn = $('#cart-btn');
  const setCount = (n, bump = false) => {
    count.textContent = n;
    count.dataset.count = n;
    cartBtn.setAttribute('aria-label', `Open cart, ${n} item${n === 1 ? '' : 's'}`);
    if (bump && !prefersReducedMotion()) { count.classList.remove('is-bump'); void count.offsetWidth; count.classList.add('is-bump'); }
  };
  setCount(cart.count());
  on('cart:change', (s) => setCount(s.count, true));

  renderMobileNav();
  renderSearch();
  renderAccountMenu();
  on('session:change', renderAccountMenu);
}

function rotateAnnouncements(el) {
  if (prefersReducedMotion()) return;
  let i = 0;
  let paused = false;
  el.parentElement.addEventListener('mouseenter', () => (paused = true));
  el.parentElement.addEventListener('mouseleave', () => (paused = false));
  setInterval(() => {
    if (paused || document.hidden) return;
    el.classList.add('is-fading');
    setTimeout(() => { i = (i + 1) % ANNOUNCEMENTS.length; el.textContent = ANNOUNCEMENTS[i]; el.classList.remove('is-fading'); }, 520);
  }, 5200);
}

export function setActiveNav(key) {
  $$('[data-nav]').forEach((a) => {
    if (a.dataset.nav === key) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

/* ——— Mobile navigation ——— */
function renderMobileNav() {
  const panel = document.createElement('aside');
  panel.className = 'drawer drawer--left mobile-nav';
  panel.id = 'mobile-nav';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-label', 'Menu');
  panel.setAttribute('aria-hidden', 'true');
  panel.inert = true;
  panel.innerHTML = `
    <div class="drawer__head"><a class="brand" href="/">${logoMarkup()}</a>
      <button class="icon-btn" type="button" data-close aria-label="Close menu">${icon('close')}</button></div>
    <div class="drawer__body">
      <nav aria-label="Mobile"><ul>
        ${NAV.map((n) => `<li><a href="${n.href}" data-nav="${n.key}">${n.label} ${icon('chevron')}</a></li>`).join('')}
      </ul></nav>
      <div class="mobile-nav__sub" style="margin-top:1.5rem">
        <p class="eyebrow">Demo dashboards</p>
        <nav aria-label="Dashboards"><ul>
          <li><a href="/account">Customer account</a></li>
          <li><a href="/seller">Seller dashboard</a></li>
          <li><a href="/admin">Admin dashboard</a></li>
          <li><a href="/cart">Cart</a></li>
        </ul></nav>
      </div>
    </div>`;
  document.body.appendChild(panel);
  bindLogoFallback(panel);
  const btn = $('.header__menu-btn');
  btn.addEventListener('click', () => {
    btn.setAttribute('aria-expanded', 'true');
    openPanel(panel, { onClose: () => btn.setAttribute('aria-expanded', 'false') });
  });
  panel.querySelector('[data-close]').addEventListener('click', () => closePanel());
  panel.addEventListener('click', (e) => { if (e.target.closest('a')) closePanel({ restoreFocus: false }); });
}

/* ——— Search ——— */
function renderSearch() {
  const panel = document.createElement('div');
  panel.className = 'search-panel';
  panel.id = 'search-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-label', 'Search the marketplace');
  panel.setAttribute('aria-hidden', 'true');
  panel.inert = true;
  panel.innerHTML = `
    <div class="container">
      <form class="search-form" role="search" action="/shop">
        ${icon('search')}
        <label for="site-search" class="sr-only">Search products and businesses</label>
        <input id="site-search" name="q" type="search" placeholder="Search mugs, linen, journals…" autocomplete="off">
        <button class="btn btn--sm" type="submit">Search</button>
        <button class="icon-btn" type="button" data-close aria-label="Close search">${icon('close')}</button>
      </form>
      <div class="search-suggest" aria-label="Popular categories">
        ${CATEGORIES.map((c) => `<a class="pill" href="/shop?category=${c.id}">${c.name}</a>`).join('')}
      </div>
      <p class="sr-only" id="search-status" aria-live="polite"></p>
      <div class="search-results" id="search-results"></div>
    </div>`;
  document.body.appendChild(panel);

  const btn = $('#search-btn');
  const input = $('#site-search', panel);
  const results = $('#search-results', panel);
  const status = $('#search-status', panel);

  btn.addEventListener('click', () => {
    btn.setAttribute('aria-expanded', 'true');
    openPanel(panel, { initialFocus: '#site-search', onClose: () => btn.setAttribute('aria-expanded', 'false') });
  });
  panel.querySelector('[data-close]').addEventListener('click', () => closePanel());
  panel.addEventListener('click', (e) => { if (e.target.closest('a')) closePanel({ restoreFocus: false }); });

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { results.innerHTML = ''; status.textContent = ''; return; }
    const hits = searchProducts(q).slice(0, 8);
    status.textContent = `${hits.length} result${hits.length === 1 ? '' : 's'}`;
    results.innerHTML = hits.length
      ? hits.map((p) => `<a class="search-hit" href="/product/${p.slug}">${img(productImage(p), '', { label: p.name })}<div><b>${esc(p.name)}</b><span>${esc(getBusiness(p.businessId)?.name)} · ${categoryName(p.category)}</span></div></a>`).join('')
      : `<p class="muted">No products match “${esc(input.value)}”. Try “mug”, “linen” or “journal”.</p>`;
  });
  $('form', panel).addEventListener('submit', (e) => {
    e.preventDefault();
    closePanel({ restoreFocus: false });
    navigate(`/shop?q=${encodeURIComponent(input.value.trim())}`);
  });
}

export function searchProducts(q) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  return db.products().filter((p) => {
    const hay = [p.name, p.summary, p.category, categoryName(p.category), getBusiness(p.businessId)?.name, ...(p.tags ?? [])].join(' ').toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
}

/* ——— Account popover with DEMO role switcher ——— */
function renderAccountMenu() {
  const menu = $('#account-menu');
  const btn = $('#account-btn');
  const { role, sellerId } = db.session();
  const who = role === 'customer' ? ACCOUNTS.customer.name : role === 'admin' ? ACCOUNTS.admin.name : db.currentSeller().name;
  $('#role-chip').textContent = `Demo: ${ROLE_LABEL[role]}`;

  menu.innerHTML = `
    <div class="popover__section">
      <p class="eyebrow" style="margin:0 0 4px">Viewing as</p>
      <h2>${esc(who)}</h2>
      <p class="small muted" style="margin:0">Demo role switcher — prototype only, not real sign-in.</p>
    </div>
    <div class="popover__section">
      <fieldset class="role-switch" style="border:0;padding:0;margin:0">
        <legend class="sr-only">Switch demo role</legend>
        ${['customer', 'seller', 'admin'].map((r) => `
          <label><input type="radio" name="demo-role" value="${r}" ${r === role ? 'checked' : ''}> ${ROLE_LABEL[r]}</label>`).join('')}
      </fieldset>
      <div class="field" style="margin-top:8px" ${role === 'seller' ? '' : 'hidden'}>
        <label for="demo-seller">Fictional seller</label>
        <select class="select" id="demo-seller">
          ${ACCOUNTS.sellers.map((s) => `<option value="${s.id}" ${s.id === sellerId ? 'selected' : ''}>${esc(getBusiness(s.businessId).name)}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="popover__section">
      <ul class="popover__links">
        <li><a href="${DASHBOARD_FOR[role]}">${icon('dashboard')} Open ${ROLE_LABEL[role].toLowerCase()} dashboard</a></li>
        <li><a href="/cart">${icon('bag')} View cart</a></li>
        <li><button type="button" data-reset>${icon('refresh')} Reset demo data</button></li>
      </ul>
    </div>`;

  menu.querySelectorAll('input[name="demo-role"]').forEach((r) =>
    r.addEventListener('change', () => {
      db.setRole(r.value);
      toast(`Now viewing as demo ${ROLE_LABEL[r.value].toLowerCase()}`);
      $('#account-menu input[name="demo-role"]:checked')?.focus();
      if (/^\/(account|seller|admin)/.test(location.pathname)) navigate(DASHBOARD_FOR[r.value]);
    }),
  );
  $('#demo-seller', menu)?.addEventListener('change', (e) => {
    db.setRole('seller', e.target.value);
    toast(`Seller switched to ${getBusiness(db.currentSeller().businessId).name}`);
    if (location.pathname.startsWith('/seller')) navigate('/seller');
    $('#demo-seller')?.focus();
  });
  menu.querySelector('[data-reset]').addEventListener('click', () => {
    if (confirm('Reset all demo data (orders, approvals, stock and cart) to the original sample state?')) db.reset();
  });

  if (!btn.dataset.bound) {
    btn.dataset.bound = '1';
    const close = () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = menu.hidden;
      menu.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      if (open) setTimeout(() => menu.querySelector('input:checked')?.focus(), 30);
    });
    document.addEventListener('click', (e) => { if (!menu.hidden && !e.target.closest('.account-wrap')) close(); });
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) close(); });
    menu.addEventListener('keydown', (e) => { if (e.key === 'Escape') { close(); btn.focus(); } });
  }
}

export function openAccountMenu() { $('#account-btn').click(); }
