import { $, on } from '../utils/dom.js';
import { esc, money } from '../utils/format.js';
import { CONFIG } from '../config.js';
import { icon } from './icons.js';
import { img, productImage } from './cards.js';
import { openPanel, closePanel, isPanelOpen } from './overlays.js';
import { cart, variantText } from '../store/cart.js';

let panel;

export const qtyControl = (key, qty, max, size = '') => `
  <div class="qty ${size}" data-qty="${esc(key)}">
    <button type="button" data-step="-1" aria-label="Decrease quantity" ${qty <= 1 ? 'disabled' : ''}>−</button>
    <input type="number" inputmode="numeric" min="1" max="${max}" value="${qty}" aria-label="Quantity">
    <button type="button" data-step="1" aria-label="Increase quantity" ${qty >= max ? 'disabled' : ''}>+</button>
  </div>`;

/** Wire quantity steppers and remove buttons inside `root` to the cart store. */
export function bindCartLines(root) {
  root.addEventListener('click', (e) => {
    const step = e.target.closest('[data-step]');
    if (step) {
      const wrap = step.closest('[data-qty]');
      const input = wrap.querySelector('input');
      cart.setQty(wrap.dataset.qty, Number(input.value) + Number(step.dataset.step));
      return;
    }
    const rm = e.target.closest('[data-remove]');
    if (rm) cart.remove(rm.dataset.remove);
  });
  root.addEventListener('change', (e) => {
    const wrap = e.target.closest('[data-qty]');
    if (wrap && e.target.matches('input')) cart.setQty(wrap.dataset.qty, Number(e.target.value));
  });
}

export function renderCartDrawer() {
  panel = document.createElement('aside');
  panel.className = 'drawer';
  panel.id = 'cart-drawer';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-labelledby', 'cart-drawer-title');
  panel.setAttribute('aria-hidden', 'true');
  panel.inert = true;
  document.body.appendChild(panel);
  draw();
  bindCartLines(panel);
  on('cart:change', () => {
    // Preserve focus on the control being used when the list re-renders.
    const activeKey = document.activeElement?.closest('[data-qty]')?.dataset.qty;
    const activeStep = document.activeElement?.dataset?.step;
    draw();
    if (activeKey && panel.contains(document.activeElement) === false) {
      const wrap = [...panel.querySelectorAll('[data-qty]')].find((w) => w.dataset.qty === activeKey);
      (wrap?.querySelector(`[data-step="${activeStep}"]:not(:disabled)`) ?? wrap?.querySelector('input'))?.focus();
    }
    if (isPanelOpen(panel) && !panel.contains(document.activeElement)) panel.querySelector('[data-close]')?.focus();
  });
  $('#cart-btn').addEventListener('click', openCart);
}

export function openCart() {
  $('#cart-btn').setAttribute('aria-expanded', 'true');
  openPanel(panel, { initialFocus: '[data-close]', onClose: () => $('#cart-btn').setAttribute('aria-expanded', 'false') });
}

function draw() {
  const lines = cart.lines();
  const { subtotal } = cart.totals();
  const remaining = Math.max(0, CONFIG.freeDeliveryThreshold - subtotal);
  const pct = Math.min(100, (subtotal / CONFIG.freeDeliveryThreshold) * 100);
  panel.innerHTML = `
    <div class="drawer__head">
      <h2 id="cart-drawer-title">Your cart <span class="muted small" style="font-family:var(--font-sans)">(${cart.count()})</span></h2>
      <button class="icon-btn" type="button" data-close aria-label="Close cart">${icon('close')}</button>
    </div>
    <div class="drawer__body">
      ${lines.length ? `
        <div class="drawer__progress">
          ${remaining > 0 ? `You're <strong>${money(remaining)}</strong> away from free delivery.` : `${icon('check')} You've unlocked <strong>free delivery</strong>.`}
          <div class="progress" aria-hidden="true"><span style="width:${pct}%"></span></div>
        </div>
        ${lines.map((l) => `
          <div class="mini-line">
            ${img(productImage(l.product), '', { label: l.product.name })}
            <div>
              <h3><a href="/product/${l.product.slug}">${esc(l.product.name)}</a></h3>
              <p class="meta">${esc(variantText(l.options) || 'Standard')} · ${money(l.unitPrice)}</p>
              <div class="row" style="gap:12px">${qtyControl(l.key, l.qty, l.product.stock, 'qty--sm')}
              <button class="remove-btn" type="button" data-remove="${esc(l.key)}" aria-label="Remove ${esc(l.product.name)}">Remove</button></div>
            </div>
            <span class="price">${money(l.lineTotal)}</span>
          </div>`).join('')}
      ` : `
        <div class="empty-state">
          <span class="empty-state__icon">${icon('bag')}</span>
          <h3>Your cart is waiting</h3>
          <p class="muted">Discover handmade pieces from our church-member businesses.</p>
          <a class="btn" href="/shop" data-close-link>Start shopping</a>
        </div>`}
    </div>
    ${lines.length ? `
    <div class="drawer__foot">
      <div class="row row--between" style="margin-bottom:4px"><span>Subtotal</span><strong>${money(subtotal)}</strong></div>
      <p class="small muted">Delivery or free collection chosen at checkout.</p>
      <div class="grid" style="gap:10px;grid-template-columns:1fr 1fr">
        <a class="btn btn--ghost" href="/cart">View cart</a>
        <a class="btn" href="/checkout">Checkout</a>
      </div>
    </div>` : ''}`;
  panel.querySelector('[data-close]').addEventListener('click', () => closePanel());
  panel.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => closePanel({ restoreFocus: false })));
}
