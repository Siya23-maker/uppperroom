import { db } from '../store/db.js';
import { getBusiness } from '../data/businesses.js';
import { categoryName } from '../data/categories.js';
import { CONFIG } from '../config.js';
import { storage } from '../utils/storage.js';
import { esc, money, date, badge, round2, todayISO } from '../utils/format.js';
import { withBusy } from '../utils/dom.js';
import { icon } from '../components/icons.js';
import { toast } from '../components/toast.js';
import { img } from '../components/cards.js';
import { dashboardShell, bindRoleSwitcher, confirmModal, emptyState, stat } from '../components/dashboard.js';
import { demoCallout } from './shared.js';
import { navigate, currentUrl } from '../router.js';

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'applications', label: 'Applications', icon: 'edit' },
  { id: 'sellers', label: 'Sellers', icon: 'store' },
  { id: 'products', label: 'Products', icon: 'box' },
  { id: 'orders', label: 'Orders', icon: 'receipt' },
  { id: 'payments', label: 'Payments', icon: 'shield' },
  { id: 'payouts', label: 'Payouts', icon: 'wallet' },
];
const STATUSES = ['pending', 'processing', 'ready', 'shipped', 'completed', 'cancelled'];
const sellerStatus = () => storage.get('sellerStatus', {});

function platformTotals() {
  const orders = db.orders().filter((o) => o.status !== 'cancelled');
  let collected = 0, delivery = 0, fees = 0, sellerNet = 0;
  for (const o of orders) {
    const t = db.orderTotals(o);
    collected += t.total; delivery += t.delivery;
    for (const bid of new Set(o.items.map((i) => i.businessId))) { const s = db.sellerSplit(o, bid); fees += s.fee; sellerNet += s.net; }
  }
  const payouts = db.payouts();
  const paid = payouts.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const pending = payouts.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  return { collected: round2(collected), delivery: round2(delivery), fees: round2(fees), sellerNet: round2(sellerNet), paid: round2(paid), pending: round2(pending), count: orders.length };
}

export function adminDashboard({ query }) {
  if (db.session().role !== 'admin') db.setRole('admin');
  const tab = TABS.some((t) => t.id === query.get('tab')) ? query.get('tab') : 'overview';
  const apps = db.applications();
  const pendingApps = apps.filter((a) => a.status === 'pending');
  const payouts = db.payouts();
  const pendingPayouts = payouts.filter((p) => p.status === 'pending');
  const orders = db.orders();
  const openOrders = orders.filter((o) => !['completed', 'cancelled'].includes(o.status));
  const T = platformTotals();
  const statusFilter = query.get('status') || 'all';

  const appCard = (a) => `
    <article class="card app-card" data-app="${a.id}">
      <div class="card__head"><div><h3 class="h4" style="margin:0">${esc(a.businessName)}</h3><p class="small muted" style="margin:0">${esc(a.owner)} · ${esc(a.category)}</p></div>${badge(a.status)}</div>
      <p class="small">${esc(a.description)}</p>
      <p class="small muted">${a.id} · Submitted ${date(a.submitted)}${a.location ? ` · ${esc(a.location)}` : ''} · ${a.churchMember ? `${icon('check')} Church member (self-declared)` : ''}</p>
      ${a.reason ? `<p class="small"><b>Reason:</b> ${esc(a.reason)}</p>` : ''}
      ${a.status === 'pending' ? `<div class="row"><button class="btn btn--sm" type="button" data-approve-app="${a.id}">${icon('check')} Approve (demo)</button><button class="btn btn--ghost btn--sm" type="button" data-reject-app="${a.id}">Decline</button></div>` : ''}
    </article>`;

  const payoutRow = (p, actions) => `<tr>
    <td>${p.id}</td><td>${esc(getBusiness(p.businessId)?.name)}</td><td>${esc(p.period)}</td><td>${date(p.requested)}</td><td>${badge(p.status)}</td>
    <td class="num"><b>${money(p.amount)}</b></td>
    ${actions ? `<td class="actions">${p.status === 'pending' ? `<button class="btn btn--xs" type="button" data-approve-payout="${p.id}">Approve</button><button class="btn btn--ghost btn--xs" type="button" data-reject-payout="${p.id}">Reject</button>` : p.paidOn ? `<span class="small muted">Paid ${date(p.paidOn)}</span>` : ''}</td>` : ''}</tr>`;

  const views = {
    overview: () => `
      <div class="stats">
        ${stat('Collected (demo)', money(T.collected), `${T.count} orders · single recipient`)}
        ${stat('Platform fees', money(T.fees), `${Math.round(CONFIG.platformFeeRate * 100)}% placeholder rate`)}
        ${stat('Applications', pendingApps.length, 'Awaiting review')}
        ${stat('Payouts to approve', money(T.pending), `${pendingPayouts.length} requests`)}
      </div>
      <div class="dash-cols">
        <div class="card"><div class="card__head"><h3>Pending applications</h3><a class="link-arrow" href="/admin?tab=applications">Review ${icon('arrow')}</a></div>
          ${pendingApps.length ? `<ul class="plain-list">${pendingApps.map((a) => `<li><b>${esc(a.businessName)}</b> <span class="muted small">${esc(a.category)}</span> ${badge('pending')}</li>`).join('')}</ul>` : '<p class="muted">No applications waiting.</p>'}</div>
        <div class="card"><div class="card__head"><h3>Payout requests</h3><a class="link-arrow" href="/admin?tab=payouts">Approve ${icon('arrow')}</a></div>
          ${pendingPayouts.length ? `<ul class="plain-list">${pendingPayouts.map((p) => `<li><b>${esc(getBusiness(p.businessId).name)}</b> <span style="margin-left:auto">${money(p.amount)}</span></li>`).join('')}</ul>` : '<p class="muted">No payouts waiting.</p>'}</div>
        <div class="card"><div class="card__head"><h3>Open orders</h3><a class="link-arrow" href="/admin?tab=orders">Manage ${icon('arrow')}</a></div>
          ${openOrders.length ? `<ul class="plain-list">${openOrders.slice(0, 5).map((o) => `<li><b>${o.id}</b> <span class="muted small">${esc(o.customerName)}</span> ${badge(o.status)}</li>`).join('')}</ul>` : '<p class="muted">All orders fulfilled.</p>'}</div>
      </div>`,

    applications: () => {
      const list = statusFilter === 'all' ? apps : apps.filter((a) => a.status === statusFilter);
      return `
      <div class="card__head"><h2 class="h3" style="margin:0">Business applications</h2>
        <div class="chips" role="group" aria-label="Filter applications">${['all', 'pending', 'approved', 'rejected'].map((s) => `<a class="pill" href="/admin?tab=applications${s === 'all' ? '' : `&status=${s}`}" ${statusFilter === s ? 'aria-current="true"' : ''}>${s[0].toUpperCase() + s.slice(1)}</a>`).join('')}</div></div>
      ${demoCallout('Approvals here are <strong>simulated</strong>. In production, approving would create the seller account and invite them to set up their storefront.')}
      <div class="app-grid" style="margin-top:1rem">${list.length ? list.map(appCard).join('') : emptyState('edit', 'Nothing here', 'No applications with this status.')}</div>`;
    },

    sellers: () => {
      const st = sellerStatus();
      const approvedApps = apps.filter((a) => a.status === 'approved');
      return `
      <div class="card__head"><h2 class="h3" style="margin:0">Sellers</h2></div>
      <div class="table-wrap"><table class="table">
        <caption class="sr-only">Approved sellers</caption>
        <thead><tr><th scope="col">Business</th><th scope="col">Owner</th><th scope="col" class="num">Products</th><th scope="col" class="num">Gross sales</th><th scope="col" class="num">Owed (unpaid)</th><th scope="col">Status</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead>
        <tbody>
        ${db.businesses().map((b) => { const e = db.sellerEarnings(b.id); const s = st[b.id] ?? 'active'; return `<tr>
          <td><div class="table-product">${img(b.thumb, '', { label: b.name })}<div><b>${esc(b.name)}</b><small>${esc(b.category)}</small></div></div></td>
          <td>${esc(b.ownerName)}</td><td class="num">${db.productsByBusiness(b.id, { includeHidden: true }).length}</td>
          <td class="num">${money(e.gross)}</td><td class="num">${money(round2(e.net - e.paid))}</td>
          <td>${s === 'active' ? badge('approved') : '<span class="badge badge--burgundy">Paused</span>'}</td>
          <td class="actions"><a class="btn btn--ghost btn--xs" href="/businesses/${b.slug}">Storefront</a><button class="btn btn--ghost btn--xs" type="button" data-pause="${b.id}">${s === 'active' ? 'Pause' : 'Reactivate'}</button></td></tr>`; }).join('')}
        ${approvedApps.map((a) => `<tr><td><div class="table-product"><span class="dash__avatar" style="width:44px;height:44px;font-size:1rem">${esc(a.businessName[0])}</span><div><b>${esc(a.businessName)}</b><small>${esc(a.category)}</small></div></div></td>
          <td>${esc(a.owner)}</td><td class="num">0</td><td class="num">${money(0)}</td><td class="num">${money(0)}</td><td>${badge('approved')} <span class="badge badge--gold">Onboarding</span></td><td class="actions"><span class="small muted">Storefront setup pending</span></td></tr>`).join('')}
        </tbody></table></div>
      <p class="small muted" style="margin-top:.75rem">Pausing a seller is a demo flag only (it doesn’t hide their products in this prototype).</p>`;
    },

    products: () => {
      const all = db.products({ includeHidden: true });
      return `
      <div class="card__head"><h2 class="h3" style="margin:0">All products <span class="muted small" style="font-family:var(--font-sans)">(${all.length})</span></h2>
        <div class="row"><label class="sr-only" for="ap-filter">Filter by seller</label>
          <select class="select" id="ap-filter" style="min-height:40px;width:auto"><option value="">All sellers</option>${db.businesses().map((b) => `<option value="${b.id}">${esc(b.name)}</option>`).join('')}</select>
          <label class="sr-only" for="ap-search">Search products</label><input class="input" id="ap-search" type="search" placeholder="Search…" style="min-height:40px;width:180px"></div></div>
      <div class="table-wrap"><table class="table" id="admin-products">
        <caption class="sr-only">Marketplace products</caption>
        <thead><tr><th scope="col">Product</th><th scope="col">Seller</th><th scope="col" class="num">Price</th><th scope="col" class="num">Stock</th><th scope="col">Status</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead>
        <tbody>${all.map((p) => `<tr data-biz="${p.businessId}" data-name="${esc(p.name.toLowerCase())}">
          <td><div class="table-product">${img(p.images?.[0], '', { label: p.name })}<div><b>${esc(p.name)}</b><small>${categoryName(p.category)}</small></div></div></td>
          <td>${esc(getBusiness(p.businessId)?.name)}</td><td class="num">${money(p.price)}</td><td class="num">${p.stock}</td>
          <td>${badge(p.status === 'active' ? 'active' : 'hidden')}</td>
          <td class="actions"><button class="btn btn--ghost btn--xs" type="button" data-moderate="${p.id}">${p.status === 'active' ? 'Unpublish' : 'Publish'}</button>${p.status === 'active' ? `<a class="btn btn--ghost btn--xs" href="/product/${p.slug}">View</a>` : ''}</td></tr>`).join('')}</tbody></table></div>
      <p class="small muted" id="ap-count" style="margin-top:.5rem" aria-live="polite"></p>`;
    },

    orders: () => {
      const list = statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter);
      return `
      <div class="card__head"><h2 class="h3" style="margin:0">Orders</h2>
        <div class="chips" role="group" aria-label="Filter orders">${['all', ...STATUSES].map((s) => `<a class="pill" href="/admin?tab=orders${s === 'all' ? '' : `&status=${s}`}" ${statusFilter === s ? 'aria-current="true"' : ''}>${s[0].toUpperCase() + s.slice(1)}</a>`).join('')}</div></div>
      ${list.length ? `<div class="table-wrap"><table class="table">
        <caption class="sr-only">All marketplace orders (demo)</caption>
        <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Sellers</th><th scope="col">Date</th><th scope="col">Method</th><th scope="col" class="num">Total</th><th scope="col">Status</th></tr></thead>
        <tbody>${list.map((o) => `<tr data-row="${o.id}">
          <td><b>${o.id}</b>${o.placedInDemo ? '<br><span class="badge badge--muted">Placed in demo</span>' : ''}</td><td>${esc(o.customerName)}</td>
          <td class="small">${[...new Set(o.items.map((i) => getBusiness(i.businessId)?.name))].map(esc).join('<br>')}</td>
          <td>${date(o.date)}</td><td>${o.fulfilment === 'collection' ? 'Collection' : 'Delivery'}</td><td class="num">${money(db.orderTotals(o).total)}</td>
          <td><label class="sr-only" for="os-${o.id}">Status for ${o.id}</label><select class="select status-select" id="os-${o.id}" data-order-status="${o.id}">${STATUSES.map((s) => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s[0].toUpperCase() + s.slice(1)}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></div>`
      : emptyState('receipt', 'No orders', 'No orders match this filter.')}`;
    },

    payments: () => `
      <h2 class="h3">Payment overview</h2>
      ${demoCallout(`<strong>Single payment recipient:</strong> every customer payment goes to <strong>The Upper Room</strong> (${CONFIG.paymentProvider} at launch — not connected in this prototype). Seller earnings are calculated per order and settled through approved payouts. All figures are demo data.`)}
      <div class="stats" style="margin-top:1rem">
        ${stat('Total collected', money(T.collected), 'Incl. delivery fees')}
        ${stat('Delivery fees', money(T.delivery))}
        ${stat('Platform fees', money(T.fees), 'Placeholder rate')}
        ${stat('Seller share', money(T.sellerNet), `${money(T.paid)} paid · ${money(T.pending)} pending`)}
      </div>
      <div class="table-wrap"><table class="table">
        <caption>Seller settlement summary (demo)</caption>
        <thead><tr><th scope="col">Seller</th><th scope="col" class="num">Gross sales</th><th scope="col" class="num">Fee</th><th scope="col" class="num">Net share</th><th scope="col" class="num">Available now</th><th scope="col" class="num">Pending payout</th><th scope="col" class="num">Paid out</th></tr></thead>
        <tbody>${db.businesses().map((b) => { const e = db.sellerEarnings(b.id); return `<tr><td>${esc(b.name)}</td><td class="num">${money(e.gross)}</td><td class="num">${money(e.fee)}</td><td class="num">${money(e.net)}</td><td class="num">${money(e.available)}</td><td class="num">${money(e.pending)}</td><td class="num">${money(e.paid)}</td></tr>`; }).join('')}</tbody>
      </table></div>
      <p class="small muted" style="margin-top:.75rem">“Paid out” includes historical sample payouts for earlier periods not shown in the demo order list.</p>`,

    payouts: () => `
      <div class="card__head"><h2 class="h3" style="margin:0">Payout approvals</h2><span class="badge badge--demo">Simulated</span></div>
      ${pendingPayouts.length ? `<div class="table-wrap"><table class="table">
        <caption class="sr-only">Pending payout requests</caption>
        <thead><tr><th scope="col">Reference</th><th scope="col">Seller</th><th scope="col">Period</th><th scope="col">Requested</th><th scope="col">Status</th><th scope="col" class="num">Amount</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead>
        <tbody>${pendingPayouts.map((p) => payoutRow(p, true)).join('')}</tbody></table></div>`
      : emptyState('wallet', 'No payouts awaiting approval', 'Seller payout requests will appear here. Try requesting one from the seller dashboard.', '<a class="btn btn--ghost" href="/seller?tab=payouts">Open seller payouts</a>')}
      <h3 class="h4" style="margin-top:2rem">History</h3>
      <div class="table-wrap"><table class="table">
        <caption class="sr-only">Payout history</caption>
        <thead><tr><th scope="col">Reference</th><th scope="col">Seller</th><th scope="col">Period</th><th scope="col">Requested</th><th scope="col">Status</th><th scope="col" class="num">Amount</th><th scope="col"><span class="sr-only">Details</span></th></tr></thead>
        <tbody>${payouts.filter((p) => p.status !== 'pending').map((p) => payoutRow(p, true)).join('') || '<tr><td colspan="7" class="muted">No history yet.</td></tr>'}</tbody></table></div>`,
  };

  return {
    title: 'Admin dashboard',
    html: dashboardShell({
      role: 'admin', base: '/admin', title: 'Marketplace admin',
      crumbs: [{ label: 'Admin dashboard', href: tab === 'overview' ? null : '/admin' }, ...(tab === 'overview' ? [] : [{ label: TABS.find((t) => t.id === tab).label }])],
      subtitle: 'Upper Room Admin · Demo administrator',
      avatar: icon('cross'),
      tabs: TABS.map((t) => ({ ...t, count: t.id === 'applications' ? pendingApps.length || null : t.id === 'payouts' ? pendingPayouts.length || null : null })),
      active: tab, content: views[tab](),
    }),
    mount(root) {
      bindRoleSwitcher(root);
      const refresh = () => navigate(currentUrl(), { replace: true, scroll: false });

      root.querySelectorAll('[data-approve-app]').forEach((b) => b.addEventListener('click', async () => {
        await withBusy(b, () => db.updateApplication(b.dataset.approveApp, { status: 'approved', decided: todayISO() }), 600);
        toast('Application approved (demo) — seller would now be invited to onboard');
        refresh();
      }));
      root.querySelectorAll('[data-reject-app]').forEach((b) => b.addEventListener('click', async () => {
        const dlg = await confirmModal({
          title: 'Decline application', confirmLabel: 'Decline', tone: 'btn--espresso',
          body: `<div class="field"><label for="rj">Reason (shared with the applicant)</label><textarea class="textarea" id="rj" style="min-height:90px">Thank you for applying. We're unable to approve this application at this time.</textarea></div>`,
        });
        if (!dlg) return;
        db.updateApplication(b.dataset.rejectApp, { status: 'rejected', reason: dlg.querySelector('#rj').value.trim(), decided: todayISO() });
        toast('Application declined (demo)'); refresh();
      }));

      root.querySelectorAll('[data-pause]').forEach((b) => b.addEventListener('click', () => {
        const st = sellerStatus();
        st[b.dataset.pause] = (st[b.dataset.pause] ?? 'active') === 'active' ? 'paused' : 'active';
        storage.set('sellerStatus', st);
        toast(`${getBusiness(b.dataset.pause).name} ${st[b.dataset.pause] === 'active' ? 'reactivated' : 'paused'} (demo)`); refresh();
      }));

      root.querySelectorAll('[data-moderate]').forEach((b) => b.addEventListener('click', () => {
        const p = db.getProduct(b.dataset.moderate);
        db.updateProduct(p.id, { status: p.status === 'active' ? 'hidden' : 'active' });
        toast(`${p.name} ${p.status === 'active' ? 'published' : 'unpublished'}`); refresh();
      }));
      const apFilter = root.querySelector('#ap-filter');
      const apSearch = root.querySelector('#ap-search');
      const filterProducts = () => {
        let n = 0;
        root.querySelectorAll('#admin-products tbody tr').forEach((tr) => {
          const show = (!apFilter.value || tr.dataset.biz === apFilter.value) && tr.dataset.name.includes(apSearch.value.trim().toLowerCase());
          tr.hidden = !show; if (show) n++;
        });
        root.querySelector('#ap-count').textContent = `${n} shown`;
      };
      apFilter?.addEventListener('change', filterProducts);
      apSearch?.addEventListener('input', filterProducts);

      root.querySelectorAll('[data-order-status]').forEach((sel) => sel.addEventListener('change', () => {
        db.updateOrder(sel.dataset.orderStatus, { status: sel.value });
        const tr = sel.closest('tr'); tr.classList.remove('is-flash'); void tr.offsetWidth; tr.classList.add('is-flash');
        toast(`${sel.dataset.orderStatus} set to ${sel.value} (demo)`);
      }));

      root.querySelectorAll('[data-approve-payout]').forEach((b) => b.addEventListener('click', async () => {
        const p = db.payouts().find((x) => x.id === b.dataset.approvePayout);
        const ok = await confirmModal({ title: 'Approve payout', confirmLabel: 'Approve & mark paid', body: `<p>Approve <strong>${money(p.amount)}</strong> to <strong>${esc(getBusiness(p.businessId).name)}</strong>?</p><p class="small muted">Simulated — no bank transfer is made.</p>` });
        if (!ok) return;
        db.updatePayout(p.id, { status: 'paid', paidOn: todayISO() });
        toast(`Payout ${p.id} approved and marked paid (demo)`); refresh();
      }));
      root.querySelectorAll('[data-reject-payout]').forEach((b) => b.addEventListener('click', async () => {
        const ok = await confirmModal({ title: 'Reject payout', confirmLabel: 'Reject', tone: 'btn--espresso', body: '<p>The linked orders return to the seller’s available balance.</p>' });
        if (!ok) return;
        db.updatePayout(b.dataset.rejectPayout, { status: 'rejected', orderIds: [] });
        toast('Payout rejected (demo)'); refresh();
      }));
    },
  };
}
