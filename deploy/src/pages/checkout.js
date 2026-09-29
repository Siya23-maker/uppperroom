import { cart, variantText } from '../store/cart.js';
import { db } from '../store/db.js';
import { ACCOUNTS } from '../data/accounts.js';
import { getBusiness } from '../data/businesses.js';
import { CONFIG, mapsLinkUrl } from '../config.js';
import { breadcrumbs } from '../components/breadcrumbs.js';
import { img, productImage } from '../components/cards.js';
import { icon } from '../components/icons.js';
import { esc, money, date, badge } from '../utils/format.js';
import { on, withBusy } from '../utils/dom.js';
import { navigate } from '../router.js';
import { validateForm, liveValidate, demoCallout } from './shared.js';
import { notFoundPage } from './notFound.js';

const PROVINCES = ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'];

const demoBanner = () => `
  <div class="demo-banner" role="note">
    <span class="badge badge--demo">Demo mode</span>
    <p>This checkout is a <strong>simulation</strong>. No card details are collected and no payment is processed. At launch, payment will be taken securely by <strong>${CONFIG.paymentProvider}</strong>, with The Upper Room as the single recipient.</p>
  </div>`;

export function checkoutPage() {
  if (!cart.count()) {
    return {
      title: 'Checkout',
      html: `${breadcrumbs([{ label: 'Cart', href: '/cart' }, { label: 'Checkout' }])}
      <section class="section"><div class="container container--narrow"><div class="empty-state card">
        <span class="empty-state__icon">${icon('bag')}</span><h1 class="h2">Nothing to check out yet</h1>
        <p class="muted">Your cart is empty. Add a few pieces and come back.</p><a class="btn" href="/shop">Browse the shop</a>
      </div></div></section>`,
    };
  }
  const c = ACCOUNTS.customer;
  const isCustomer = true; // demo helpers always available in the prototype

  return {
    title: 'Checkout',
    html: `
    ${breadcrumbs([{ label: 'Cart', href: '/cart' }, { label: 'Checkout' }])}
    <header class="page-hero container" style="padding-bottom:1rem">
      <h1>Checkout</h1>
      ${demoBanner()}
    </header>
    <section class="container checkout" aria-label="Checkout">
      <form id="checkout-form" class="checkout__form" novalidate>
        <section class="card checkout-step" aria-labelledby="step1">
          <div class="card__head"><h2 id="step1" class="h3"><span class="step-num">1</span> Your details</h2>
            ${isCustomer ? `<button class="btn btn--ghost btn--xs" type="button" data-prefill>Use demo customer details</button>` : ''}</div>
          <div class="form-grid">
            <div class="field"><label for="co-name">Full name <span class="req">*</span></label><input class="input" id="co-name" name="name" required autocomplete="name"></div>
            <div class="field"><label for="co-email">Email <span class="req">*</span></label><input class="input" id="co-email" name="email" type="email" required autocomplete="email"></div>
            <div class="field span-2"><label for="co-phone">Mobile number <span class="req">*</span></label><input class="input" id="co-phone" name="phone" type="tel" required data-phone placeholder="082 123 4567" autocomplete="tel">
              <p class="field-hint">For delivery or collection updates only.</p></div>
          </div>
        </section>

        <section class="card checkout-step" aria-labelledby="step2">
          <h2 id="step2" class="h3"><span class="step-num">2</span> Delivery or collection</h2>
          <fieldset class="choice-group">
            <legend class="sr-only">Choose how to receive your order</legend>
            <label class="choice"><input type="radio" name="fulfilment" value="delivery" checked>
              <span>${icon('truck')}</span><span><strong>Courier delivery</strong><span class="small muted" id="delivery-note"></span></span></label>
            <label class="choice"><input type="radio" name="fulfilment" value="collection">
              <span>${icon('store')}</span><span><strong>Collect at The Upper Room</strong><span class="small muted">Free · we’ll let you know when it’s ready</span></span></label>
          </fieldset>

          <div id="delivery-fields" class="form-grid" style="margin-top:1.25rem">
            ${isCustomer ? `<div class="span-2 saved-addr" role="group" aria-label="Saved addresses">
              ${c.addresses.map((a) => `<button type="button" class="pill" data-addr="${a.id}">${icon('pin')} ${a.label}: ${esc(a.line1)}, ${esc(a.suburb)}</button>`).join('')}
            </div>` : ''}
            <div class="field span-2"><label for="co-line1">Street address <span class="req">*</span></label><input class="input" id="co-line1" name="line1" required autocomplete="address-line1" placeholder="e.g. 18 Protea Crescent"></div>
            <div class="field span-2"><label for="co-line2">Complex, unit or building (optional)</label><input class="input" id="co-line2" name="line2" autocomplete="address-line2"></div>
            <div class="field"><label for="co-suburb">Suburb <span class="req">*</span></label><input class="input" id="co-suburb" name="suburb" required></div>
            <div class="field"><label for="co-city">City / town <span class="req">*</span></label><input class="input" id="co-city" name="city" required autocomplete="address-level2"></div>
            <div class="field"><label for="co-prov">Province <span class="req">*</span></label>
              <select class="select" id="co-prov" name="province" required><option value="">Choose…</option>${PROVINCES.map((p) => `<option>${p}</option>`).join('')}</select></div>
            <div class="field"><label for="co-postal">Postal code <span class="req">*</span></label><input class="input" id="co-postal" name="postalCode" required data-postal inputmode="numeric" maxlength="4" autocomplete="postal-code"></div>
          </div>

          <div id="collection-info" class="collection-box" hidden>
            ${icon('pin')}
            <div><strong>Collection point</strong><address>${esc(CONFIG.address)}</address>
              <a class="link" href="${mapsLinkUrl}" target="_blank" rel="noopener">View on Google Maps<span class="sr-only"> (opens in a new tab)</span></a>
              <p class="small muted" style="margin:.5rem 0 0">Collection times <span class="placeholder-note">to be confirmed</span></p></div>
          </div>
          <div class="field" style="margin-top:1rem"><label for="co-notes">Order notes (optional)</label><textarea class="textarea" id="co-notes" name="notes" style="min-height:80px" placeholder="Gift message, gate code, etc."></textarea></div>
        </section>

        <section class="card checkout-step" aria-labelledby="step3">
          <h2 id="step3" class="h3"><span class="step-num">3</span> Payment <span class="badge badge--demo">Demo</span></h2>
          <div class="yoco-mock">
            <div class="yoco-mock__head">${icon('shield')} <strong>Secure payment via ${CONFIG.paymentProvider}</strong> <span class="badge badge--muted">Coming at launch</span></div>
            <p class="small">In the live store you’ll be taken to ${CONFIG.paymentProvider}’s secure payment page. <strong>This prototype never asks for card details.</strong></p>
            <fieldset class="choice-group" style="grid-template-columns:1fr 1fr">
              <legend class="small" style="margin-bottom:.5rem;font-weight:600">Simulate the payment result</legend>
              <label class="choice"><input type="radio" name="sim" value="success" checked><span><strong>Successful</strong><span class="small muted">Order is placed</span></span></label>
              <label class="choice"><input type="radio" name="sim" value="declined"><span><strong>Declined</strong><span class="small muted">See the error state</span></span></label>
            </fieldset>
          </div>
          <div id="pay-error" class="alert" role="alert" hidden></div>
          <label class="check" style="margin-top:1rem"><input type="checkbox" name="agree" required data-label="Terms"> I understand this is a demo order and no real purchase is being made. <span class="req">*</span></label>
        </section>
      </form>

      <aside class="card order-summary checkout__summary" aria-labelledby="co-sum">
        <h2 id="co-sum" class="h3">Order summary</h2>
        <div id="co-lines"></div>
        <div class="summary-rows" id="co-totals"></div>
        <button class="btn btn--block" type="submit" form="checkout-form" id="place-order" style="margin-top:1.25rem">${icon('shield')} Place demo order</button>
        <p class="small muted center" style="margin:.75rem 0 0">Paid to The Upper Room · seller earnings settled separately</p>
      </aside>
    </section>`,

    mount(root) {
      const form = root.querySelector('#checkout-form');
      liveValidate(form);
      const set = (name, value) => { form.querySelector(`[name="${name}"]`).value = value; };
      const deliveryFields = root.querySelector('#delivery-fields');
      const collection = root.querySelector('#collection-info');
      const fulfilment = () => form.querySelector('[name="fulfilment"]:checked').value;

      const drawSummary = () => {
        const lines = cart.lines();
        if (!lines.length) { navigate('/cart', { replace: true }); return; }
        const t = cart.totals(fulfilment());
        root.querySelector('#co-lines').innerHTML = lines.map((l) => `
          <div class="sum-line">
            <span class="sum-line__img">${img(productImage(l.product), '', { label: l.product.name })}<span class="sum-line__qty">${l.qty}</span></span>
            <div><b>${esc(l.product.name)}</b><span class="small muted">${esc(variantText(l.options) || 'Standard')} · ${esc(getBusiness(l.product.businessId).name)}</span></div>
            <span class="price">${money(l.lineTotal)}</span>
          </div>`).join('');
        root.querySelector('#co-totals').innerHTML = `
          <div><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
          <div><span>${fulfilment() === 'collection' ? 'Collection' : 'Courier delivery'}</span><span>${t.delivery ? money(t.delivery) : 'Free'}</span></div>
          <div class="total"><span>Total</span><span>${money(t.total)}</span></div>`;
        const { subtotal } = cart.totals();
        root.querySelector('#delivery-note').textContent = subtotal >= CONFIG.freeDeliveryThreshold ? 'Free on this order' : `${money(CONFIG.deliveryFee)} · free over ${money(CONFIG.freeDeliveryThreshold)}`;
      };

      const syncFulfilment = () => {
        const isDelivery = fulfilment() === 'delivery';
        deliveryFields.hidden = !isDelivery;
        collection.hidden = isDelivery;
        drawSummary();
      };
      form.querySelectorAll('[name="fulfilment"]').forEach((r) => r.addEventListener('change', syncFulfilment));

      root.querySelector('[data-prefill]')?.addEventListener('click', () => {
        set('name', ACCOUNTS.customer.name);
        set('email', ACCOUNTS.customer.email);
        set('phone', '082 555 0142');
        form.querySelectorAll('.has-error').forEach((f) => f.classList.remove('has-error'));
      });
      root.querySelectorAll('[data-addr]').forEach((b) =>
        b.addEventListener('click', () => {
          const a = ACCOUNTS.customer.addresses.find((x) => x.id === b.dataset.addr);
          set('line1', a.line1); set('line2', a.line2); set('suburb', a.suburb);
          set('city', a.city); set('province', a.province); set('postalCode', a.postalCode);
          root.querySelectorAll('[data-addr]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
          deliveryFields.querySelectorAll('.has-error').forEach((f) => f.classList.remove('has-error'));
        }),
      );

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const err = root.querySelector('#pay-error');
        err.hidden = true;
        if (!validateForm(form)) return;
        const btn = root.querySelector('#place-order');
        const fd = new FormData(form);
        const sim = fd.get('sim');
        btn.dataset.label = btn.innerHTML;
        let order = null;
        await withBusy(btn, () => {
          if (sim === 'declined') return;
          const f = fulfilment();
          const address = f === 'delivery'
            ? [fd.get('line1'), fd.get('line2'), fd.get('suburb'), fd.get('city'), fd.get('province'), fd.get('postalCode')].filter(Boolean).join(', ')
            : null;
          order = db.placeOrder({
            customer: { name: fd.get('name'), email: fd.get('email'), phone: fd.get('phone') },
            fulfilment: f, address, lines: cart.lines(), totals: cart.totals(f),
          });
          if (fd.get('notes')) db.updateOrder(order.id, { notes: fd.get('notes') });
        }, 1400);
        if (!order) {
          err.innerHTML = `${icon('info')} <div><strong>Payment declined (simulated).</strong> Nothing was charged. Choose “Successful” to complete the demo order.</div>`;
          err.hidden = false;
          err.scrollIntoView({ block: 'center', behavior: 'smooth' });
          return;
        }
        cart.clear();
        navigate(`/checkout/complete/${order.id}`, { replace: true });
      });

      syncFulfilment();
      return on('cart:change', drawSummary);
    },
  };
}

export function checkoutCompletePage({ params }) {
  const o = db.getOrder(params.orderId);
  if (!o) return notFoundPage({ what: 'order' });
  const t = db.orderTotals(o);
  const sellers = [...new Set(o.items.map((i) => i.businessId))];
  return {
    title: 'Order confirmed (demo)',
    html: `
    <section class="section">
      <div class="container container--narrow">
        <div class="confirm card">
          <span class="confirm__icon">${icon('check')}</span>
          <p class="eyebrow eyebrow--center">Demo order complete</p>
          <h1 class="h2">Thank you, ${esc(o.customerName.split(' ')[0])}</h1>
          <p class="lead" style="margin-inline:auto">Your demo order <strong>${o.id}</strong> has been placed.</p>
          ${demoCallout('<strong>Simulation only.</strong> No money moved, no card was charged and no confirmation email was sent. This record exists only in this browser.')}
          <ol class="timeline" aria-label="Order progress" style="margin-top:2rem">
            <li class="is-done">Placed</li><li class="is-current">Being prepared</li><li>${o.fulfilment === 'collection' ? 'Ready to collect' : 'Shipped'}</li><li>Completed</li>
          </ol>
        </div>

        <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr));margin-top:1.5rem">
          <div class="card">
            <h2 class="h4">${o.fulfilment === 'collection' ? 'Collection' : 'Delivery'}</h2>
            <p class="small" style="margin:0">${o.fulfilment === 'collection' ? `Collect from ${esc(CONFIG.collectionPoint)}. We’ll notify you when your order is ready.` : esc(o.address)}</p>
          </div>
          <div class="card">
            <h2 class="h4">Payment ${badge('paid', ' (demo)')}</h2>
            <p class="small" style="margin:0">Recipient: <strong>The Upper Room</strong>. ${sellers.length > 1 ? `Your order spans ${sellers.length} sellers; each seller's share is calculated separately and paid out after fulfilment.` : 'The seller’s share is calculated separately and paid out after fulfilment.'}</p>
          </div>
        </div>

        <div class="card" style="margin-top:1.5rem">
          <h2 class="h4">Order ${o.id} · ${date(o.date)}</h2>
          ${o.items.map((i) => `<div class="row row--between small" style="padding:.5rem 0;border-bottom:1px solid var(--line)"><span>${i.qty} × ${esc(i.name)} <span class="muted">(${esc(i.variant)}) · ${esc(getBusiness(i.businessId)?.name)}</span></span><span>${money(i.unitPrice * i.qty)}</span></div>`).join('')}
          <div class="summary-rows" style="margin-top:1rem">
            <div><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
            <div><span>${o.fulfilment === 'collection' ? 'Collection' : 'Delivery'}</span><span>${t.delivery ? money(t.delivery) : 'Free'}</span></div>
            <div class="total"><span>Total</span><span>${money(t.total)}</span></div>
          </div>
        </div>
        <div class="row" style="justify-content:center;margin-top:2rem">
          <a class="btn" href="/account/orders/${o.id}" data-as-customer>View in my account</a>
          <a class="btn btn--ghost" href="/shop">Continue shopping</a>
        </div>
      </div>
    </section>`,
    mount(root) {
      root.querySelector('[data-as-customer]').addEventListener('click', () => db.setRole('customer'));
    },
  };
}
