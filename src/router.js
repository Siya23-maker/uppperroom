/**
 * Lightweight History API router.
 * - Intercepts same-origin <a href="/..."> clicks (no framework needed)
 * - Supports back/forward via popstate
 * - Route patterns: '/product/:slug'
 */
const routes = [];
let renderFn = null;
let notFound = null;
let currentPath = null;

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
  return { path: location.pathname, query: new URLSearchParams(location.search), hash: location.hash };
}

async function resolve({ scroll = true, restoreScroll = null } = {}) {
  const { path, query, hash } = currentLocation();
  const { view, params } = match(path);
  const samePage = currentPath === path;
  currentPath = path;
  await renderFn({ view, params, query, path, hash, scroll, samePage, restoreScroll });
}

export function navigate(to, { replace = false, scroll = true } = {}) {
  const url = new URL(to, location.origin);
  if (url.origin !== location.origin) { location.href = to; return; }
  const next = url.pathname + url.search + url.hash;
  if (next === location.pathname + location.search + location.hash && !url.hash) { resolve({ scroll }); return; }
  history.replaceState({ ...(history.state || {}), scrollY: window.scrollY }, '');
  history[replace ? 'replaceState' : 'pushState']({ scrollY: 0 }, '', next);
  resolve({ scroll });
}

/** Update query params without a full re-render (e.g. shop filters). */
export function setQuery(params, { replace = true } = {}) {
  const url = new URL(location.href);
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined || v === '' || v === 'all') url.searchParams.delete(k);
    else url.searchParams.set(k, v);
  }
  history[replace ? 'replaceState' : 'pushState'](history.state, '', url.pathname + url.search);
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
    const url = new URL(href, location.origin);
    // Same-page anchor → let the browser scroll.
    if (url.pathname === location.pathname && url.search === location.search && url.hash) return;
    e.preventDefault();
    navigate(href);
  });

  window.addEventListener('popstate', (e) => resolve({ scroll: false, restoreScroll: e.state?.scrollY ?? 0 }));
  resolve();
}
