import { cart, variantText } from '../store/cart.js';
import { getBusiness } from '../data/businesses.js';
import { CONFIG } from '../config.js';
import { breadcrumbs } from '../components/breadcrumbs.js';
import { img, productImage } from '../components/cards.js';
import { icon } from '../components/icons.js';
import { qtyControl, bindCartLines } from '../components/cartDrawer.js';
import { esc, money, pluralise } from '../utils/format.js';
import { on } from '../utils/dom.js';
import { toast } from '../components/toast.js';

export function cartPage() {
  return {
    title: 'Your Cart',
    nav: null,
    html: `
    ${breadcrumbs([{ label: 'Cart' }])}
    <header class="page-hero container" style="padding-bottom:1.5rem">
      <p class="eyebrow">Your cart</p>
      <h1>Your cart</h1>
    </header>
    <section class="container cart-page" id="cart-root" aria-label="Cart contents"></section>`,
    mount(root) {
      const host = root.querySelector('#cart-root');
      const draw = () => {
        const lines = cart.lines();
        if (!lines.length) {
          host.innerHTML = `
            <div class="empty-state card" style="grid-column:1/-1;max-width:none">
              <span class="empty-state__icon">${icon('bag')}</span>
              <h2 class="h3">Your cart is empty</h2>
              <p class="muted">Pieces you add will wait for you here — even if you close the browser.</p>
              <a class="btn" href="/shop">Browse the collection</a>
            </div>`;
          return;
        }
        const groups = {};
        lines.forEach((l) => (groups[l.product.businessId] ??= []).push(l));
        const { subtotal } = cart.totals();
        const remaining = Math.max(0, CONFIG.freeDeliveryThreshold - subtotal);
        host.innerHTML = `
          <div class="cart-lines">
            <p class="muted small">${pluralise(cart.count(), 'item')} from ${pluralise(Object.keys(groups).length, 'business', 'businesses')}</p>
            ${Object.entries(groups).map(([bid, ls]) => {
              const b = getBusiness(bid);
              return `
              <div class="cart-group">
                <p class="cart-group__head">${icon('store')} Sold by <a href="/businesses/${b.slug}">${esc(b.name)}</a></p>
                ${ls.map((l) => `
                  <div class="cart-line">
                    <a class="cart-line__img" href="/product/${l.product.slug}" tabindex="-1" aria-hidden="true">${img(productImage(l.product), '', { label: l.product.name })}</a>
                    <div class="cart-line__info">
                      <h3><a href="/product/${l.product.slug}">${esc(l.product.name)}</a></h3>
                      <p class="small muted">${esc(variantText(l.options) || 'Standard')}</p>
                      <p class="small">${money(l.unitPrice)} each</p>
                    </div>
                    <div class="cart-line__qty">${qtyControl(l.key, l.qty, l.product.stock)}
                      <button class="remove-btn" type="button" data-remove="${esc(l.key)}" aria-label="Remove ${esc(l.product.name)} from cart">Remove</button></div>
                    <p class="cart-line__total price">${money(l.lineTotal)}</p>
                  </div>`).join('')}
              </div>`;
            }).join('')}
            <div class="row" style="margin-top:1rem"><a class="link-arrow" href="/shop">${icon('arrowLeft')} Continue shopping</a>
              <button class="remove-btn" type="button" data-clear-cart style="margin-left:auto">Empty cart</button></div>
          </div>
          <aside class="card order-summary" aria-labelledby="sum-title">
            <h2 id="sum-title" class="h3">Order summary</h2>
            <div class="summary-rows">
              <div><span>Subtotal</span><span>${money(subtotal)}</span></div>
              <div><span>Delivery</span><span class="muted">Chosen at checkout</span></div>
              <div class="total"><span>Estimated total</span><span>${money(subtotal)}</span></div>
            </div>
            <p class="small ${remaining ? 'muted' : ''}" style="margin-top:1rem">${remaining ? `Add ${money(remaining)} more for free courier delivery — or collect for free.` : `${icon('check')} Free delivery unlocked.`}</p>
            <a class="btn btn--block" href="/checkout" style="margin-top:.5rem">Proceed to checkout ${icon('arrow')}</a>
            <p class="small muted center" style="margin:1rem 0 0">${icon('shield')} One payment to The Upper Room covers every seller.</p>
          </aside>`;
      };
      bindCartLines(host);
      host.addEventListener('click', (e) => {
        if (e.target.closest('[data-clear-cart]') && confirm('Remove all items from your cart?')) { cart.clear(); toast('Cart emptied'); }
        if (e.target.closest('[data-remove]')) toast('Item removed from cart');
      });
      draw();
      return on('cart:change', () => {
        const key = document.activeElement?.closest('[data-qty]')?.dataset.qty;
        const step = document.activeElement?.dataset?.step;
        draw();
        if (key) {
          const wrap = [...host.querySelectorAll('[data-qty]')].find((w) => w.dataset.qty === key);
          (wrap?.querySelector(`[data-step="${step}"]:not(:disabled)`) ?? wrap?.querySelector('input'))?.focus();
        }
      });
    },
  };
}
