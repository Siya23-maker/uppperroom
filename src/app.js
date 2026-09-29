import { CONFIG } from './config.js';
import { $, prefersReducedMotion } from './utils/dom.js';
import { installImageFallback } from './utils/images.js';
import { route, setNotFound, startRouter } from './router.js';
import { renderHeader, setActiveNav } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { renderCartDrawer, openCart } from './components/cartDrawer.js';
import { initOverlays, closePanel } from './components/overlays.js';
import { initReveal } from './components/reveal.js';
import { toast } from './components/toast.js';
import { cart } from './store/cart.js';
import { db } from './store/db.js';
import { defaultOptions } from './components/cards.js';
import { variantText } from './store/cart.js';

import { homePage } from './pages/home.js';
import { shopPage } from './pages/shop.js';
import { productPage } from './pages/product.js';
import { businessesPage, storefrontPage } from './pages/businesses.js';
import { aboutPage } from './pages/about.js';
import { sellerApplyPage } from './pages/sellerApply.js';
import { contactPage } from './pages/contact.js';
import { cartPage } from './pages/cart.js';
import { checkoutPage, checkoutCompletePage } from './pages/checkout.js';
import { customerDashboard } from './pages/customerDashboard.js';
import { sellerDashboard } from './pages/sellerDashboard.js';
import { adminDashboard } from './pages/adminDashboard.js';
import { notFoundPage } from './pages/notFound.js';

document.documentElement.classList.add('js');
installImageFallback();
initOverlays();
renderHeader($('#header-mount'));
renderFooter($('#footer-mount'));
renderCartDrawer();

// ——— Routes ———
route('/', homePage);
route('/shop', shopPage);
route('/product/:slug', productPage);
route('/businesses', businessesPage);
route('/businesses/:slug', storefrontPage);
route('/about', aboutPage);
route('/become-a-seller', sellerApplyPage);
route('/contact', contactPage);
route('/cart', cartPage);
route('/checkout', checkoutPage);
route('/checkout/complete/:orderId', checkoutCompletePage);
route('/account', customerDashboard);
route('/account/orders/:orderId', customerDashboard);
route('/seller', sellerDashboard);
route('/admin', adminDashboard);
setNotFound(notFoundPage);

// ——— Global interactions ———
document.addEventListener('click', (e) => {
  const quick = e.target.closest('[data-quick-add]');
  if (quick) {
    const p = db.getProduct(quick.dataset.quickAdd);
    const opts = defaultOptions(p);
    const res = cart.add(p.id, opts, 1);
    if (res.ok) {
      quick.classList.add('is-done');
      const label = quick.innerHTML;
      quick.textContent = 'Added ✓';
      setTimeout(() => { quick.classList.remove('is-done'); quick.innerHTML = label; }, 1400);
      toast(`${p.name}${variantText(opts) ? ` (${variantText(opts)})` : ''} added to cart`, { action: 'View cart', href: '/cart' });
    } else toast(res.message, { tone: 'info' });
  }
  const opener = e.target.closest('[data-open-cart]');
  if (opener) { e.preventDefault(); openCart(); }
});

// ——— Rendering ———
const main = $('#main');
const progress = $('#route-progress');
let firstRender = true;
let cleanup = null;

async function render({ view, params, query, path, hash, scroll, restoreScroll }) {
  closePanel({ restoreFocus: false });
  const animate = !firstRender && !prefersReducedMotion();
  progress.classList.remove('is-done');
  progress.classList.add('is-active');
  if (animate) {
    main.classList.add('is-leaving');
    await new Promise((r) => setTimeout(r, 150));
  }
  cleanup?.();
  cleanup = null;

  let page;
  try {
    page = await view({ params, query, path });
  } catch (err) {
    console.error(err);
    page = notFoundPage({ error: true });
  }

  main.innerHTML = page.html;
  document.title = page.title ? `${page.title} · ${CONFIG.siteName}` : `${CONFIG.siteName} · ${CONFIG.tagline}`;
  setMeta('description', page.description ?? 'The Upper Room — a Christian marketplace for church-member businesses. Gather Together, Brewing in Unity.');
  setMeta('og:title', document.title, 'property');
  setMeta('og:description', page.description ?? CONFIG.tagline, 'property');
  setActiveNav(page.nav ?? null);
  main.classList.remove('is-leaving');
  if (animate) { main.classList.remove('is-entering'); void main.offsetWidth; main.classList.add('is-entering'); }

  const result = page.mount?.(main);
  if (typeof result === 'function') cleanup = result;
  initReveal(main);

  if (hash) {
    const target = document.getElementById(hash.slice(1));
    if (target) setTimeout(() => target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' }), 60);
  } else if (restoreScroll !== null && restoreScroll !== undefined) window.scrollTo(0, restoreScroll);
  else if (scroll) window.scrollTo(0, 0);

  // Move focus to the page for screen readers & keyboard users (not on first load).
  if (!firstRender) {
    const h1 = main.querySelector('h1');
    (h1 ?? main).setAttribute('tabindex', '-1');
    (h1 ?? main).focus({ preventScroll: true });
  }
  $('#route-announcer').textContent = `${page.title ?? 'Home'} page loaded`;
  progress.classList.add('is-done');
  setTimeout(() => progress.classList.remove('is-active', 'is-done'), 400);
  firstRender = false;
}

function setMeta(name, content, attr = 'name') {
  let m = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!m) { m = document.createElement('meta'); m.setAttribute(attr, name); document.head.appendChild(m); }
  m.setAttribute('content', content);
}

startRouter(render);
