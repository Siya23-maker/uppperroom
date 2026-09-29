/**
 * Lightweight router.
 * - Default "history" mode: clean URLs via the History API (needs server.js fallback).
 * - "hash" mode (window.__UR_ROUTER_MODE = 'hash'): routes live after the "#",
 *   for hosting where the server can't serve deep links (e.g. a shared preview link).
 * - Intercepts same-origin <a href="/..."> clicks; supports back/forward via popstate.
 * - Route patterns: '/product/:slug'
 */
const routes = [];
let renderFn = null;
let notFound = null;
let memoryUrl = '/';
let pushBlocked = false; // true if the host frame refuses URL changes (then we keep the route in memory)

const isHash = () => window.__UR_ROUTER_MODE === 'hash';

/** The current in-app URL, e.g. "/shop?category=decor#top". */
export function currentUrl() {
  if (!isHash()) return location.pathname + location.search + location.hash;
  const h = location.hash.slice(1);
  if (h.startsWith('/')) return h;
  // No route in the hash (e.g. the bare site URL /uppperroom/) → homepage, unless URL updates are blocked.
  // A plain in-page anchor such as #main keeps the current page.
  return h === '' && !pushBlocked ? '/' : memoryUrl;
}

function writeUrl(next, replace) {
  if (isHash()) {
    memoryUrl = next;
    try { history[replace ? 'replaceState' : 'pushState']({ scrollY: 0 }, '', '#' + next); } catch { pushBlocked = true; }
  } else {
    history[replace ? 'replaceState' : 'pushState']({ scrollY: 0 }, '', next);
  }
}

export function route(pattern, view) {
  const keys = [];
  const re = new RegExp(
    '^' + pattern.replace(/\/:([^/]+)/g, (_, k) => { keys.push(k); return '/([^/]+)'; }).replace(/\/$/, '') + '/?$',
  );
  routes.push({ pattern, re, keys, view });
}

export function setNotFound(view) { notFound = view; }

function match(pathname) {
  for (const r of routes) {
    const m = pathname.match(r.re);
    if (m) {
      const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
      return { view: r.view, params };
    }
  }
  return { view: notFound, params: {} };
}

export function currentLocation() {
  const u = new URL(currentUrl(), 'http://app.local');
  return { path: u.pathname, query: u.searchParams, hash: u.hash };
}

async function resolve({ scroll = true, restoreScroll = null } = {}) {
  const { path, query, hash } = currentLocation();
  const { view, params } = match(path);
  await renderFn({ view, params, query, path, hash, scroll, restoreScroll });
}

export function navigate(to, { replace = false, scroll = true } = {}) {
  const url = new URL(to, 'http://app.local');
  if (/^https?:/.test(to) && !to.startsWith(location.origin)) { location.href = to; return; }
  const next = url.pathname + url.search + url.hash;
  if (next === currentUrl() && !url.hash) { resolve({ scroll }); return; }
  try { history.replaceState({ ...(history.state || {}), scrollY: window.scrollY }, ''); } catch { /* ignore */ }
  writeUrl(next, replace);
  resolve({ scroll });
}

/** Update query params without a full re-render (e.g. shop filters). */
export function setQuery(params) {
  const url = new URL(currentUrl(), 'http://app.local');
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined || v === '' || v === 'all') url.searchParams.delete(k);
    else url.searchParams.set(k, v);
  }
  const next = url.pathname + url.search;
  if (isHash()) {
    memoryUrl = next;
    try { history.replaceState(history.state, '', '#' + next); } catch { /* ignore */ }
  } else history.replaceState(history.state, '', next);
}

export function startRouter(render) {
  renderFn = render;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]');
    if (!a || a.target || a.hasAttribute('download') || a.dataset.external !== undefined) return;
    const href = a.getAttribute('href');
    if (!href.startsWith('/') || href.startsWith('//')) return;
    const url = new URL(href, 'http://app.local');
    const cur = currentLocation();
    // Same-page anchor → just scroll to it.
    if (url.pathname === cur.path && url.search === (cur.query.toString() ? '?' + cur.query : '') && url.hash) {
      e.preventDefault();
      document.getElementById(url.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    e.preventDefault();
    navigate(href);
  });

  window.addEventListener('popstate', (e) => resolve({ scroll: false, restoreScroll: e.state?.scrollY ?? 0 }));
  resolve();
}
