import { db } from '../store/db.js';
import { cart } from '../store/cart.js';
import { ACCOUNTS } from '../data/accounts.js';
import { getBusiness } from '../data/businesses.js';
import { storage } from '../utils/storage.js';
import { esc, money, date, badge, pluralise } from '../utils/format.js';
import { withBusy } from '../utils/dom.js';
import { icon } from '../components/icons.js';
import { toast } from '../components/toast.js';
import { img } from '../components/cards.js';
import { dashboardShell, bindRoleSwitcher, confirmModal, emptyState, stat } from '../components/dashboard.js';
import { validateForm, liveValidate, demoCallout } from './shared.js';
import { navigate } from '../router.js';

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'orders', label: 'Order history', icon: 'receipt' },
  { id: 'profile', label: 'Profile', icon: 'user' },
  { id: 'addresses', label: 'Addresses', icon: 'pin' },
];
const STEPS = (o) => ['Placed', 'Being prepared', o.fulfilment === 'collection' ? 'Ready to collect' : 'Shipped', 'Completed'];
const STEP_INDEX = { pending: 0, processing: 1, ready: 2, shipped: 2, completed: 3 };

const profile = () => storage.get('profile', { name: ACCOUNTS.customer.name, email: ACCOUNTS.customer.email, phone: '082 555 0142' });
const addresses = () => storage.get('addresses', ACCOUNTS.customer.addresses);
const fmtAddr = (a) => [a.line1, a.line2, a.suburb, a.city, a.province, a.postalCode].filter(Boolean).map(esc).join('<br>');

export function customerDashboard({ query, params }) {
  if (db.session().role !== 'customer') db.setRole('customer');
  const orders = db.ordersForCustomer(ACCOUNTS.customer.id);
  const tab = params.orderId ? 'orders' : TABS.some((t) => t.id === query.get('tab')) ? query.get('tab') : 'overview';
  const p = profile();

  let content = '';
  let title = 'My account';
  if (params.orderId) content = orderDetail(db.getOrder(params.orderId));
  else if (tab === 'overview') content = overview(orders, p);
  else if (tab === 'orders') content = orderHistory(orders);
  else if (tab === 'profile') content = profileForm(p);
  else if (tab === 'addresses') content = addressList();

  const crumbs = params.orderId
    ? [{ label: 'My account', href: '/account' }, { label: 'Orders', href: '/account?tab=orders' }, { label: params.orderId }]
    : [{ label: 'My account', href: tab === 'overview' ? null : '/account' }, ...(tab === 'overview' ? [] : [{ label: TABS.find((t) => t.id === tab).label }])];

  return {
    title: params.orderId ? `Order ${params.orderId}` : title,
    html: dashboardShell({
      role: 'customer', base: '/account', title, crumbs,
      subtitle: `${esc(p.name)} · Demo customer · Member since ${ACCOUNTS.customer.memberSince}`,
      avatar: esc(p.name.split(' ').map((x) => x[0]).join('').slice(0, 2)),
      tabs: TABS.map((t) => (t.id === 'orders' ? { ...t, count: orders.filter((o) => o.status !== 'completed').length || null } : t)),
      active: tab, content,
    }),
    mount(root) {
      bindRoleSwitcher(root);
      bindProfile(root);
      bindAddresses(root);
      root.querySelector('[data-reorder]')?.addEventListener('click', (e) => {
        const o = db.getOrder(e.currentTarget.dataset.reorder);
        let added = 0;
        o.items.forEach((i) => {
          const prod = db.getProduct(i.productId);
          if (!prod) return;
          const opts = {};
          const parts = i.variant.split(' · ');
          (prod.variants ?? []).forEach((v, idx) => { const match = v.options.find((x) => parts.includes(x.label)); opts[v.name] = (match ?? v.options[0]).label; void idx; });
          if (cart.add(prod.id, opts, i.qty).ok) added++;
        });
        toast(added ? `${pluralise(added, 'item')} added to your cart` : 'Those items are currently out of stock', { action: added ? 'View cart' : '', href: '/cart' });
      });
    },
  };
}

function overview(orders, p) {
  const spent = orders.reduce((s, o) => s + db.orderTotals(o).total, 0);
  const active = orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');
  return `
    <h2 class="h3">Welcome back, ${esc(p.name.split(' ')[0])}</h2>
    <div class="stats">
      ${stat('Orders', orders.length, 'All time (demo)')}
      ${stat('Active orders', active.length, active.length ? 'In progress' : 'Nothing in progress')}
      ${stat('Total spent', money(spent), 'Demo figures only')}
      ${stat('Saved addresses', addresses().length)}
    </div>
    <div class="card">
      <div class="card__head"><h3>Recent orders</h3><a class="link-arrow" href="/account?tab=orders">All orders ${icon('arrow')}</a></div>
      ${orders.length ? `<ul class="order-list">${orders.slice(0, 3).map(orderRow).join('')}</ul>` : emptyState('receipt', 'No orders yet', 'When you place an order it will appear here.', '<a class="btn" href="/shop">Start shopping</a>')}
    </div>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));margin-top:1rem">
      <a class="quick-link card" href="/account?tab=profile">${icon('user')}<b>Edit profile</b><span class="small muted">Name, email & phone</span></a>
      <a class="quick-link card" href="/account?tab=addresses">${icon('pin')}<b>Manage addresses</b><span class="small muted">Delivery addresses</span></a>
      <a class="quick-link card" href="/shop">${icon('bag')}<b>Continue shopping</b><span class="small muted">New arrivals this week</span></a>
    </div>`;
}

const orderRow = (o) => {
  const t = db.orderTotals(o);
  const first = db.getProduct(o.items[0].productId);
  return `<li class="order-row">
    <span class="order-row__img">${img(first?.images?.[0], '', { label: o.items[0].name })}</span>
    <div><b>${o.id}</b> ${o.placedInDemo ? '<span class="badge badge--muted">Placed in this demo</span>' : ''}<span class="small muted">${date(o.date)} · ${pluralise(o.items.reduce((n, i) => n + i.qty, 0), 'item')} · ${o.fulfilment === 'collection' ? 'Collection' : 'Delivery'}</span></div>
    ${badge(o.status)}
    <span class="price">${money(t.total)}</span>
    <a class="btn btn--ghost btn--sm" href="/account/orders/${o.id}" aria-label="View order ${o.id}">View</a>
  </li>`;
};

function orderHistory(orders) {
  return `
    <div class="card__head"><h2 class="h3" style="margin:0">Order history</h2><span class="badge badge--demo">Demo records</span></div>
    ${orders.length ? `
    <div class="table-wrap">
      <table class="table">
        <caption class="sr-only">Your orders</caption>
        <thead><tr><th scope="col">Order</th><th scope="col">Date</th><th scope="col">Items</th><th scope="col">Method</th><th scope="col">Status</th><th scope="col" class="num">Total</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead>
        <tbody>${orders.map((o) => `<tr>
          <td><b>${o.id}</b></td><td>${date(o.date)}</td><td>${o.items.reduce((n, i) => n + i.qty, 0)}</td>
          <td>${o.fulfilment === 'collection' ? 'Collection' : 'Delivery'}</td><td>${badge(o.status)}</td>
          <td class="num">${money(db.orderTotals(o).total)}</td>
          <td class="actions"><a class="btn btn--ghost btn--xs" href="/account/orders/${o.id}">Details</a></td></tr>`).join('')}
        </tbody>
      </table>
    </div>` : emptyState('receipt', 'No orders yet', 'Your order history will appear here after checkout.', '<a class="btn" href="/shop">Browse the shop</a>')}`;
}

function orderDetail(o) {
  if (!o || o.customerId !== ACCOUNTS.customer.id) return emptyState('receipt', 'Order not found', 'This order isn’t in the demo customer’s history.', '<a class="btn" href="/account?tab=orders">Back to orders</a>');
  const t = db.orderTotals(o);
  const idx = STEP_INDEX[o.status] ?? 0;
  return `
    <a class="link-arrow" href="/account?tab=orders">${icon('arrowLeft')} All orders</a>
    <div class="card" style="margin-top:1rem">
      <div class="card__head"><div><h2 class="h3" style="margin:0">Order ${o.id}</h2><p class="small muted" style="margin:0">Placed ${date(o.date)} · Payment ${esc(o.paymentStatus)}</p></div>${badge(o.status)}</div>
      ${o.status === 'cancelled' ? '' : `<ol class="timeline" aria-label="Order progress">${STEPS(o).map((s, i) => `<li class="${i < idx || o.status === 'completed' ? 'is-done' : i === idx ? 'is-current' : ''}">${s}</li>`).join('')}</ol>`}
    </div>
    <div class="order-detail">
      <div class="card">
        <h3 class="h4">Items</h3>
        ${o.items.map((i) => {
          const prod = db.getProduct(i.productId);
          return `<div class="sum-line"><span class="sum-line__img">${img(prod?.images?.[0], '', { label: i.name })}<span class="sum-line__qty">${i.qty}</span></span>
            <div><b>${prod ? `<a href="/product/${prod.slug}">${esc(i.name)}</a>` : esc(i.name)}</b><span class="small muted">${esc(i.variant)} · ${esc(getBusiness(i.businessId)?.name)}</span></div>
            <span class="price">${money(i.unitPrice * i.qty)}</span></div>`;
        }).join('')}
        <div class="summary-rows" style="margin-top:1rem">
          <div><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
          <div><span>${o.fulfilment === 'collection' ? 'Collection' : 'Delivery'}</span><span>${t.delivery ? money(t.delivery) : 'Free'}</span></div>
          <div class="total"><span>Total</span><span>${money(t.total)}</span></div>
        </div>
      </div>
      <div>
        <div class="card"><h3 class="h4">${o.fulfilment === 'collection' ? 'Collection point' : 'Delivery address'}</h3>
          <p class="small" style="margin:0">${o.fulfilment === 'collection' ? 'The Upper Room — 5 Sandlewood, Lorraine, Unit 5' : esc(o.address)}</p></div>
        ${o.notes ? `<div class="card"><h3 class="h4">Notes</h3><p class="small" style="margin:0">${esc(o.notes)}</p></div>` : ''}
        <div class="card"><h3 class="h4">Need help?</h3><p class="small">Questions about this order?</p>
          <div class="row"><button class="btn btn--sm" type="button" data-reorder="${o.id}">${icon('refresh')} Order again</button><a class="btn btn--ghost btn--sm" href="/contact">Contact us</a></div></div>
        ${demoCallout('Demo record — not a real transaction.')}
      </div>
    </div>`;
}

function profileForm(p) {
  return `
    <form class="card" id="profile-form" novalidate style="max-width:640px">
      <h2 class="h3">Profile</h2>
      <div class="form-grid">
        <div class="field span-2"><label for="pf-name">Full name <span class="req">*</span></label><input class="input" id="pf-name" name="name" required value="${esc(p.name)}" autocomplete="name"></div>
        <div class="field"><label for="pf-email">Email <span class="req">*</span></label><input class="input" id="pf-email" name="email" type="email" required value="${esc(p.email)}" autocomplete="email"></div>
        <div class="field"><label for="pf-phone">Mobile <span class="req">*</span></label><input class="input" id="pf-phone" name="phone" type="tel" required data-phone value="${esc(p.phone)}" autocomplete="tel"></div>
        <div class="span-2"><label class="check"><input type="checkbox" name="news" checked> Email me about new makers and seasonal gifts</label></div>
      </div>
      ${demoCallout('Changes are saved in this browser only. Password and security settings will arrive with real sign-in (Firebase Authentication).')}
      <div class="row" style="margin-top:1rem"><button class="btn" type="submit">Save changes</button></div>
    </form>`;
}

function bindProfile(root) {
  const form = root.querySelector('#profile-form');
  if (!form) return;
  liveValidate(form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;
    const fd = new FormData(form);
    const btn = form.querySelector('[type="submit"]');
    await withBusy(btn, () => storage.set('profile', { name: fd.get('name').trim(), email: fd.get('email').trim(), phone: fd.get('phone').trim() }));
    toast('Profile saved (demo)');
    root.querySelector('.dash__head .muted').innerHTML = `${esc(fd.get('name'))} · Demo customer · Member since ${ACCOUNTS.customer.memberSince}`;
  });
}

function addressList() {
  const list = addresses();
  return `
    <div class="card__head"><h2 class="h3" style="margin:0">Saved addresses</h2><button class="btn btn--sm" type="button" data-add-addr>${icon('plus')} Add address</button></div>
    ${list.length ? `<div class="addr-grid">${list.map((a) => `
      <article class="card addr-card ${a.isDefault ? 'is-default' : ''}">
        <div class="row row--between"><h3 class="h4" style="margin:0">${esc(a.label)}</h3>${a.isDefault ? '<span class="badge badge--sage">Default</span>' : ''}</div>
        <address class="small">${fmtAddr(a)}</address>
        <div class="row">
          ${a.isDefault ? '' : `<button class="btn btn--ghost btn--xs" type="button" data-default="${a.id}">Set as default</button>`}
          <button class="remove-btn" type="button" data-del-addr="${a.id}" aria-label="Remove ${esc(a.label)} address">Remove</button>
        </div>
      </article>`).join('')}</div>`
    : emptyState('pin', 'No saved addresses', 'Add an address to speed up checkout.')}`;
}

function bindAddresses(root) {
  const redraw = () => navigate('/account?tab=addresses', { replace: true, scroll: false });
  root.querySelectorAll('[data-default]').forEach((b) => b.addEventListener('click', () => {
    storage.set('addresses', addresses().map((a) => ({ ...a, isDefault: a.id === b.dataset.default })));
    toast('Default address updated'); redraw();
  }));
  root.querySelectorAll('[data-del-addr]').forEach((b) => b.addEventListener('click', async () => {
    if (!(await confirmModal({ title: 'Remove address?', body: '<p>This address will be removed from your demo account.</p>', confirmLabel: 'Remove' }))) return;
    let list = addresses().filter((a) => a.id !== b.dataset.delAddr);
    if (list.length && !list.some((a) => a.isDefault)) list[0].isDefault = true;
    storage.set('addresses', list);
    toast('Address removed'); redraw();
  }));
  root.querySelector('[data-add-addr]')?.addEventListener('click', async () => {
    const dlg = await confirmModal({
      title: 'Add an address',
      confirmLabel: 'Save address',
      body: `<div class="form-grid" id="addr-form">
        <div class="field span-2"><label for="ad-label">Label <span class="req">*</span></label><input class="input" id="ad-label" name="label" required placeholder="e.g. Home, Mom's house"></div>
        <div class="field span-2"><label for="ad-line1">Street address <span class="req">*</span></label><input class="input" id="ad-line1" name="line1" required></div>
        <div class="field"><label for="ad-suburb">Suburb <span class="req">*</span></label><input class="input" id="ad-suburb" name="suburb" required></div>
        <div class="field"><label for="ad-city">City <span class="req">*</span></label><input class="input" id="ad-city" name="city" required value="Gqeberha"></div>
        <div class="field"><label for="ad-prov">Province <span class="req">*</span></label><input class="input" id="ad-prov" name="province" required value="Eastern Cape"></div>
        <div class="field"><label for="ad-postal">Postal code <span class="req">*</span></label><input class="input" id="ad-postal" name="postalCode" required data-postal inputmode="numeric" maxlength="4"></div>
      </div>`,
    });
    if (!dlg) return;
    const fields = Object.fromEntries([...dlg.querySelectorAll('input')].map((i) => [i.name, i.value.trim()]));
    if (!fields.label || !fields.line1 || !fields.suburb || !/^\d{4}$/.test(fields.postalCode)) {
      toast('Address not saved — please fill in all required fields (4-digit postal code).', { tone: 'info', duration: 5000 });
      return;
    }
    storage.set('addresses', [...addresses(), { id: 'addr-' + Date.now(), line2: '', isDefault: !addresses().length, ...fields }]);
    toast('Address added'); redraw();
  });
}
