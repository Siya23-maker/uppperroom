import { db } from '../store/db.js';
import { getBusiness } from '../data/businesses.js';
import { CATEGORIES, categoryName } from '../data/categories.js';
import { CONFIG } from '../config.js';
import { esc, money, date, badge, pluralise } from '../utils/format.js';
import { withBusy } from '../utils/dom.js';
import { icon } from '../components/icons.js';
import { toast } from '../components/toast.js';
import { img, stockState } from '../components/cards.js';
import { dashboardShell, bindRoleSwitcher, confirmModal, emptyState, stat } from '../components/dashboard.js';
import { demoCallout } from './shared.js';
import { navigate } from '../router.js';

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'products', label: 'Products', icon: 'box' },
  { id: 'inventory', label: 'Inventory', icon: 'settings' },
  { id: 'orders', label: 'Orders', icon: 'receipt' },
  { id: 'earnings', label: 'Earnings', icon: 'wallet' },
  { id: 'payouts', label: 'Payout history', icon: 'refresh' },
];
const pct = `${Math.round(CONFIG.platformFeeRate * 100)}%`;
const NEXT = {
  pending: [{ to: 'processing', label: 'Accept & prepare' }],
  processing: [{ to: 'ready', label: 'Mark ready to collect', only: 'collection' }, { to: 'shipped', label: 'Mark shipped', only: 'delivery' }],
  ready: [{ to: 'completed', label: 'Mark collected' }],
  shipped: [{ to: 'completed', label: 'Mark delivered' }],
};

export function sellerDashboard({ query }) {
  if (db.session().role !== 'seller') db.setRole('seller');
  const seller = db.currentSeller();
  const biz = getBusiness(seller.businessId);
  const tab = TABS.some((t) => t.id === query.get('tab')) ? query.get('tab') : 'overview';
  const products = db.productsByBusiness(biz.id, { includeHidden: true });
  const orders = db.ordersForBusiness(biz.id);
  const open = orders.filter((o) => !['completed', 'cancelled'].includes(o.status));
  const e = db.sellerEarnings(biz.id);
  const low = products.filter((p) => p.stock <= 5);

  const views = {
    overview: () => `
      <h2 class="h3">Welcome back, ${esc(seller.name.split(' ')[0])}</h2>
      <div class="stats">
        ${stat('Live products', products.filter((p) => p.status === 'active').length, `${products.length} total listings`)}
        ${stat('Open orders', open.length, open.length ? 'Need your attention' : 'All caught up')}
        ${stat('Net earnings', money(e.net), `After ${pct} platform fee (placeholder)`)}
        ${stat('Available to pay out', money(e.available), 'From completed orders')}
      </div>
      <div class="dash-cols">
        <div class="card">
          <div class="card__head"><h3>Orders needing action</h3><a class="link-arrow" href="/seller?tab=orders">All orders ${icon('arrow')}</a></div>
          ${open.length ? `<ul class="plain-list">${open.slice(0, 4).map((o) => `<li><b>${o.id}</b> · ${esc(o.customerName)} <span class="muted small">${date(o.date)}</span> ${badge(o.status)}</li>`).join('')}</ul>` : '<p class="muted">No open orders — all caught up.</p>'}
        </div>
        <div class="card">
          <div class="card__head"><h3>Low stock</h3><a class="link-arrow" href="/seller?tab=inventory">Inventory ${icon('arrow')}</a></div>
          ${low.length ? `<ul class="plain-list">${low.map((p) => `<li>${esc(p.name)} <span class="badge badge--${stockState(p).tone}">${p.stock} left</span></li>`).join('')}</ul>` : '<p class="muted">Everything is well stocked.</p>'}
        </div>
      </div>
      <div class="row" style="margin-top:1rem"><a class="btn btn--ghost btn--sm" href="/businesses/${biz.slug}">${icon('eye')} View my storefront</a></div>`,

    products: () => `
      <div class="card__head"><h2 class="h3" style="margin:0">Products <span class="muted small" style="font-family:var(--font-sans)">(${products.length})</span></h2>
        <button class="btn btn--sm" type="button" data-add-product>${icon('plus')} Add product</button></div>
      ${products.length ? `<div class="table-wrap"><table class="table">
        <caption class="sr-only">Products for ${esc(biz.name)}</caption>
        <thead><tr><th scope="col">Product</th><th scope="col" class="num">Price</th><th scope="col" class="num">Stock</th><th scope="col">Status</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead>
        <tbody>${products.map((p) => `<tr data-row="${p.id}">
          <td><div class="table-product">${img(p.images?.[0], '', { label: p.name })}<div><b>${esc(p.name)}</b><small>${categoryName(p.category)}${p.variants?.length ? ` · ${p.variants.map((v) => v.name).join(', ')}` : ''}</small></div></div></td>
          <td class="num">${money(p.price)}</td>
          <td class="num">${p.stock}</td>
          <td>${badge(p.status === 'active' ? 'active' : 'hidden')} ${p.stock <= 0 ? badge('out of stock') : ''}</td>
          <td class="actions">
            <button class="btn btn--ghost btn--xs" type="button" data-edit-price="${p.id}">${icon('edit')} Price</button>
            <button class="btn btn--ghost btn--xs" type="button" data-toggle="${p.id}">${p.status === 'active' ? 'Hide' : 'Publish'}</button>
            ${p.status === 'active' ? `<a class="btn btn--ghost btn--xs" href="/product/${p.slug}">View</a>` : ''}
          </td></tr>`).join('')}</tbody></table></div>`
      : emptyState('box', 'No products yet', 'Add your first product to open your storefront.', `<button class="btn" type="button" data-add-product>${icon('plus')} Add product</button>`)}`,

    inventory: () => `
      <div class="card__head"><h2 class="h3" style="margin:0">Inventory</h2>
        <label class="check"><input type="checkbox" id="low-only"> Show low stock only</label></div>
      <div class="table-wrap"><table class="table" id="inv-table">
        <caption class="sr-only">Stock levels</caption>
        <thead><tr><th scope="col">Product</th><th scope="col">Availability</th><th scope="col" class="num">Stock on hand</th><th scope="col"><span class="sr-only">Save</span></th></tr></thead>
        <tbody>${products.map((p) => { const s = stockState(p); return `<tr data-row="${p.id}" data-low="${p.stock <= 5}">
          <td><div class="table-product">${img(p.images?.[0], '', { label: p.name })}<div><b>${esc(p.name)}</b><small>SKU ${p.id.toUpperCase()}</small></div></div></td>
          <td><span class="badge badge--${s.tone}" data-stock-badge>${s.key === 'in' ? 'In stock' : s.key === 'low' ? 'Low stock' : 'Out of stock'}</span></td>
          <td class="num"><label class="sr-only" for="stk-${p.id}">Stock for ${esc(p.name)}</label><input class="input stock-input" id="stk-${p.id}" type="number" min="0" step="1" value="${p.stock}"></td>
          <td class="actions"><button class="btn btn--ghost btn--xs" type="button" data-save-stock="${p.id}">Update</button></td></tr>`; }).join('')}</tbody></table></div>
      <p class="small muted" style="margin-top:.75rem">Stock changes update the live demo shop immediately (stored in this browser).</p>`,

    orders: () => `
      <div class="card__head"><h2 class="h3" style="margin:0">Orders</h2><span class="badge badge--demo">Demo orders</span></div>
      ${orders.length ? `<div class="stack">${orders.map((o) => {
        const lines = db.sellerLines(o, biz.id);
        const s = db.sellerSplit(o, biz.id);
        const acts = (NEXT[o.status] ?? []).filter((a) => !a.only || a.only === o.fulfilment);
        const shared = o.items.some((i) => i.businessId !== biz.id);
        return `<details class="card order-card" ${o.status === 'pending' ? 'open' : ''}>
          <summary><span><b>${o.id}</b> <span class="muted small">· ${date(o.date)} · ${esc(o.customerName)}</span></span>
            <span class="row" style="gap:8px">${badge(o.fulfilment === 'collection' ? 'collection' : 'delivery')}${badge(o.status)}<b>${money(s.gross)}</b></span></summary>
          <div class="order-card__body">
            <ul class="plain-list">${lines.map((i) => `<li>${i.qty} × ${esc(i.name)} <span class="muted">(${esc(i.variant)})</span> <span style="margin-left:auto">${money(i.qty * i.unitPrice)}</span></li>`).join('')}</ul>
            ${shared ? '<p class="small muted">This order also contains items from other sellers — you only see and fulfil your own items.</p>' : ''}
            <p class="small">${o.fulfilment === 'collection' ? `${icon('store')} Customer collects at The Upper Room` : `${icon('truck')} Deliver to: ${esc(o.address)}`}</p>
            <p class="small muted">Your earning: ${money(s.gross)} − ${money(s.fee)} fee = <b>${money(s.net)}</b></p>
            <div class="row">${acts.map((a) => `<button class="btn btn--sm" type="button" data-advance="${o.id}" data-to="${a.to}">${a.label}</button>`).join('') || '<span class="small muted">No action needed.</span>'}</div>
          </div></details>`;
      }).join('')}</div>`
      : emptyState('receipt', 'No orders yet', 'When customers buy your products, their orders will appear here.')}`,

    earnings: () => `
      <h2 class="h3">Earnings</h2>
      <div class="stats">
        ${stat('Gross sales', money(e.gross), 'Your items, all orders')}
        ${stat(`Platform fee (${pct})`, money(e.fee), 'Placeholder rate — TBC')}
        ${stat('Net earnings', money(e.net))}
        ${stat('In progress', money(e.inProgress), 'Orders not yet completed')}
      </div>
      ${demoCallout(`<strong>How money flows (prototype model):</strong> customers pay <strong>The Upper Room</strong> once for their whole cart (via ${CONFIG.paymentProvider} at launch). Your share of each order is calculated separately and becomes available for payout when the order is completed.`)}
      <div class="table-wrap" style="margin-top:1rem"><table class="table">
        <caption class="sr-only">Earnings by order</caption>
        <thead><tr><th scope="col">Order</th><th scope="col">Date</th><th scope="col">Status</th><th scope="col" class="num">Gross</th><th scope="col" class="num">Fee</th><th scope="col" class="num">Net</th><th scope="col">Settlement</th></tr></thead>
        <tbody>${orders.map((o) => { const s = db.sellerSplit(o, biz.id); const settled = db.payoutsFor(biz.id).find((p) => p.orderIds.includes(o.id));
          return `<tr><td>${o.id}</td><td>${date(o.date)}</td><td>${badge(o.status)}</td><td class="num">${money(s.gross)}</td><td class="num">−${money(s.fee)}</td><td class="num"><b>${money(s.net)}</b></td>
          <td>${settled ? `${badge(settled.status)} <span class="small muted">${settled.id}</span>` : o.status === 'completed' ? '<span class="badge badge--gold">Available</span>' : '<span class="small muted">After completion</span>'}</td></tr>`; }).join('') || '<tr><td colspan="7" class="muted">No earnings yet.</td></tr>'}</tbody></table></div>`,

    payouts: () => {
      const payouts = db.payoutsFor(biz.id);
      return `
      <div class="payout-hero card">
        <div><p class="stat__label">Available for payout</p><p class="stat__value">${money(e.available)}</p>
          <p class="small muted" style="margin:0">Pending approval: ${money(e.pending)} · Paid to date: ${money(e.paid)}</p></div>
        <button class="btn" type="button" data-request-payout ${e.available <= 0 ? 'disabled' : ''}>${icon('wallet')} Request payout</button>
      </div>
      <div class="card__head" style="margin-top:1.5rem"><h2 class="h3" style="margin:0">Payout history</h2><span class="badge badge--demo">Demo payouts</span></div>
      ${payouts.length ? `<div class="table-wrap"><table class="table">
        <caption class="sr-only">Payout history</caption>
        <thead><tr><th scope="col">Reference</th><th scope="col">Period</th><th scope="col">Requested</th><th scope="col">Status</th><th scope="col">Paid on</th><th scope="col" class="num">Amount</th></tr></thead>
        <tbody>${payouts.map((p) => `<tr><td>${p.id}</td><td>${esc(p.period)}</td><td>${date(p.requested)}</td><td>${badge(p.status)}</td><td>${p.paidOn ? date(p.paidOn) : '—'}</td><td class="num"><b>${money(p.amount)}</b></td></tr>`).join('')}</tbody></table></div>`
      : emptyState('wallet', 'No payouts yet', 'Once you complete orders, you can request your first payout here.')}
      <p class="small muted" style="margin-top:.75rem">Banking details and real transfers are out of scope for the prototype.</p>`;
    },
  };

  return {
    title: 'Seller dashboard',
    html: dashboardShell({
      role: 'seller', base: '/seller', title: biz.name,
      crumbs: [{ label: 'Seller dashboard', href: tab === 'overview' ? null : '/seller' }, ...(tab === 'overview' ? [] : [{ label: TABS.find((t) => t.id === tab).label }])],
      subtitle: `Seller dashboard · ${esc(seller.name)} · <span class="badge badge--sage">Approved</span>`,
      avatar: img(biz.thumb, '', { label: biz.name }),
      tabs: TABS.map((t) => (t.id === 'orders' ? { ...t, count: open.length || null } : t)),
      active: tab, content: views[tab](),
    }),
    mount(root) {
      bindRoleSwitcher(root);
      const refresh = () => navigate(location.pathname + location.search, { replace: true, scroll: false });

      root.querySelectorAll('[data-toggle]').forEach((b) => b.addEventListener('click', () => {
        const p = db.getProduct(b.dataset.toggle);
        db.updateProduct(p.id, { status: p.status === 'active' ? 'hidden' : 'active' });
        toast(`${p.name} is now ${p.status === 'active' ? 'live in the shop' : 'hidden from the shop'}`);
        refresh();
      }));

      root.querySelectorAll('[data-edit-price]').forEach((b) => b.addEventListener('click', async () => {
        const p = db.getProduct(b.dataset.editPrice);
        const dlg = await confirmModal({
          title: 'Edit price', confirmLabel: 'Save price',
          body: `<p class="small muted">${esc(p.name)}</p><div class="field"><label for="np">Base price (ZAR)</label><input class="input" id="np" type="number" min="1" step="1" value="${p.price}"></div>`,
        });
        if (!dlg) return;
        const v = Math.round(Number(dlg.querySelector('#np').value));
        if (!(v > 0)) { toast('Price not changed — enter an amount above R0.', { tone: 'info' }); return; }
        db.updateProduct(p.id, { price: v });
        toast(`Price updated to ${money(v)}`); refresh();
      }));

      root.querySelectorAll('[data-add-product]').forEach((btn) => btn.addEventListener('click', async () => {
        const dlg = await confirmModal({
          title: 'Add a product', confirmLabel: 'Add product',
          body: `<div class="form-grid">
            <div class="field span-2"><label for="ap-name">Product name *</label><input class="input" id="ap-name" required></div>
            <div class="field"><label for="ap-cat">Category *</label><select class="select" id="ap-cat">${CATEGORIES.map((c) => `<option value="${c.id}">${c.name}</option>`).join('')}</select></div>
            <div class="field"><label for="ap-price">Price (ZAR) *</label><input class="input" id="ap-price" type="number" min="1" value="250"></div>
            <div class="field"><label for="ap-stock">Stock *</label><input class="input" id="ap-stock" type="number" min="0" value="10"></div>
            <div class="field"><label for="ap-status">Visibility</label><select class="select" id="ap-status"><option value="active">Publish now</option><option value="hidden">Save as hidden</option></select></div>
            <div class="field span-2"><label for="ap-sum">Short description</label><textarea class="textarea" id="ap-sum" style="min-height:80px"></textarea></div>
          </div><p class="small muted">Photo upload arrives with Firebase Storage — a placeholder image is used for now.</p>`,
        });
        if (!dlg) return;
        const name = dlg.querySelector('#ap-name').value.trim();
        const price = Number(dlg.querySelector('#ap-price').value);
        const stock = Number(dlg.querySelector('#ap-stock').value);
        if (!name || !(price > 0) || stock < 0) { toast('Product not added — name and a valid price are required.', { tone: 'info' }); return; }
        const p = db.addProduct({ businessId: biz.id, name, category: dlg.querySelector('#ap-cat').value, price, stock, summary: dlg.querySelector('#ap-sum').value.trim(), status: dlg.querySelector('#ap-status').value });
        toast(`“${p.name}” added (demo)`, { action: p.status === 'active' ? 'View' : '', href: `/product/${p.slug}` });
        navigate('/seller?tab=products', { replace: true, scroll: false });
      }));

      root.querySelector('#low-only')?.addEventListener('change', (ev) => {
        root.querySelectorAll('#inv-table tbody tr').forEach((tr) => (tr.hidden = ev.target.checked && tr.dataset.low !== 'true'));
      });
      root.querySelectorAll('[data-save-stock]').forEach((b) => b.addEventListener('click', async () => {
        const id = b.dataset.saveStock;
        const input = root.querySelector(`#stk-${id}`);
        const v = Math.max(0, Math.floor(Number(input.value) || 0));
        input.value = v;
        await withBusy(b, () => db.updateProduct(id, { stock: v }), 400);
        const tr = b.closest('tr');
        const s = stockState(db.getProduct(id));
        const bdg = tr.querySelector('[data-stock-badge]');
        bdg.className = `badge badge--${s.tone}`;
        bdg.textContent = s.key === 'in' ? 'In stock' : s.key === 'low' ? 'Low stock' : 'Out of stock';
        tr.dataset.low = String(v <= 5);
        tr.classList.remove('is-flash'); void tr.offsetWidth; tr.classList.add('is-flash');
        toast(`Stock updated to ${v}`);
      }));
      root.querySelectorAll('.stock-input').forEach((i) => i.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') i.closest('tr').querySelector('[data-save-stock]').click(); }));

      root.querySelectorAll('[data-advance]').forEach((b) => b.addEventListener('click', async () => {
        await withBusy(b, () => db.updateOrder(b.dataset.advance, { status: b.dataset.to }), 500);
        toast(`${b.dataset.advance} marked ${b.dataset.to} (demo)`);
        refresh();
      }));

      root.querySelector('[data-request-payout]')?.addEventListener('click', async () => {
        const ok = await confirmModal({
          title: 'Request payout', confirmLabel: 'Request payout',
          body: `<p>Request <strong>${money(e.available)}</strong> for ${pluralise(e.unsettled.length, 'completed order')}?</p><p class="small muted">An Upper Room administrator approves payouts. Demo only — no money moves.</p>`,
        });
        if (!ok) return;
        const p = db.requestPayout(biz.id);
        toast(`Payout ${p.id} requested — pending admin approval`);
        refresh();
      });
    },
  };
}
