import { storage } from '../utils/storage.js';
import { emit } from '../utils/dom.js';
import { round2, todayISO } from '../utils/format.js';
import { CONFIG } from '../config.js';
import { PRODUCTS } from '../data/products.js';
import { BUSINESSES } from '../data/businesses.js';
import { ACCOUNTS } from '../data/accounts.js';
import { SEED_ORDERS, SEED_APPLICATIONS, SEED_PAYOUTS } from '../data/orders.js';

/**
 * Demo data layer.
 * Seeds from the dummy data modules and persists changes in localStorage so the
 * client can click through approvals, stock edits and demo orders.
 *
 * FIREBASE SWAP-OUT: keep these method names and replace the bodies with
 * Firestore reads/writes (products, businesses, orders, applications, payouts).
 */
const clone = (x) => JSON.parse(JSON.stringify(x));
const SEED_VERSION = 3;

// Seed payout → order links (historical payouts cover earlier orders not shown in the demo).
const seedPayouts = () =>
  clone(SEED_PAYOUTS).map((p) => ({ ...p, orderIds: p.id === 'DEMO-PO-0311' ? ['DEMO-UR-1036'] : [] }));

function seed() {
  return {
    version: SEED_VERSION,
    products: clone(PRODUCTS).map((p) => ({ ...p, status: 'active' })),
    orders: clone(SEED_ORDERS),
    applications: clone(SEED_APPLICATIONS),
    payouts: seedPayouts(),
    newsletter: [],
    messages: [],
  };
}

let state = storage.get('db', null);
if (!state || state.version !== SEED_VERSION) { state = seed(); storage.set('db', state); }

const save = (evt = 'db:change') => { storage.set('db', state); emit(evt); emit('db:change'); };

let session = storage.get('session', { role: 'customer', sellerId: 'seller-livingwater' });

export const db = {
  // ——— Session (DEMO role switcher — not authentication) ———
  session: () => session,
  setRole(role, sellerId = session.sellerId) {
    session = { role, sellerId };
    storage.set('session', session);
    emit('session:change', session);
  },
  currentSeller: () => ACCOUNTS.sellers.find((s) => s.id === session.sellerId) ?? ACCOUNTS.sellers[0],

  // ——— Catalogue ———
  products: ({ includeHidden = false } = {}) => state.products.filter((p) => includeHidden || p.status === 'active'),
  getProduct: (id) => state.products.find((p) => p.id === id),
  getProductBySlug: (slug) => state.products.find((p) => p.slug === slug),
  productsByBusiness: (businessId, opts) => db.products(opts).filter((p) => p.businessId === businessId),
  updateProduct(id, patch) {
    const p = db.getProduct(id);
    if (p) { Object.assign(p, patch); save(); }
    return p;
  },
  addProduct(data) {
    const id = 'p' + Date.now().toString(36);
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + id.slice(-4);
    const product = {
      id, slug, businessId: data.businessId, name: data.name, category: data.category,
      price: Number(data.price), compareAt: null, stock: Number(data.stock), images: [],
      variants: [], summary: data.summary || 'New demo listing.', description: data.summary || 'New demo listing added from the seller dashboard.',
      details: ['Demo listing — details to be completed'], tags: [], featured: false, isNew: true, rating: null,
      status: data.status || 'active',
    };
    state.products.unshift(product);
    save();
    return product;
  },

  businesses: () => BUSINESSES,

  // ——— Orders ———
  orders: () => [...state.orders].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)),
  getOrder: (id) => state.orders.find((o) => o.id === id),
  ordersForCustomer: (cid) => db.orders().filter((o) => o.customerId === cid),
  ordersForBusiness: (bid) => db.orders().filter((o) => o.items.some((i) => i.businessId === bid)),
  updateOrder(id, patch) {
    const o = db.getOrder(id);
    if (o) { Object.assign(o, patch); save(); }
    return o;
  },
  placeOrder({ customer, fulfilment, address, lines, totals }) {
    const next = Math.max(...state.orders.map((o) => Number(o.id.split('-').pop()) || 0)) + 1;
    const order = {
      id: `DEMO-UR-${next}`,
      customerId: ACCOUNTS.customer.id,
      customerName: customer.name,
      contact: { email: customer.email, phone: customer.phone },
      date: todayISO(),
      status: 'pending',
      fulfilment,
      paymentStatus: 'paid (demo — no money moved)',
      address,
      items: lines.map((l) => ({
        productId: l.productId, name: l.product.name, businessId: l.product.businessId,
        variant: Object.values(l.options).join(' · ') || '—', qty: l.qty, unitPrice: l.unitPrice,
      })),
      deliveryFee: totals.delivery,
      placedInDemo: true,
    };
    // Decrement demo stock
    for (const l of lines) {
      const p = db.getProduct(l.productId);
      if (p) p.stock = Math.max(0, p.stock - l.qty);
    }
    state.orders.push(order);
    save();
    return order;
  },

  // ——— Money (demo calculations) ———
  orderTotals(order) {
    const subtotal = order.items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
    return { subtotal, delivery: order.deliveryFee, total: subtotal + order.deliveryFee };
  },
  sellerLines: (order, bid) => order.items.filter((i) => i.businessId === bid),
  sellerSplit(order, bid) {
    const gross = db.sellerLines(order, bid).reduce((s, i) => s + i.unitPrice * i.qty, 0);
    const fee = round2(gross * CONFIG.platformFeeRate);
    return { gross, fee, net: round2(gross - fee) };
  },
  sellerEarnings(bid) {
    const orders = db.ordersForBusiness(bid).filter((o) => o.status !== 'cancelled');
    const payouts = db.payoutsFor(bid);
    const settledIds = new Set(payouts.flatMap((p) => p.orderIds));
    let gross = 0, fee = 0, net = 0, cleared = 0, inProgress = 0;
    const unsettled = [];
    for (const o of orders) {
      const s = db.sellerSplit(o, bid);
      gross += s.gross; fee += s.fee; net += s.net;
      if (o.status === 'completed' && !settledIds.has(o.id)) { cleared += s.net; unsettled.push(o.id); }
      if (o.status !== 'completed') inProgress += s.net;
    }
    const paid = payouts.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
    const pending = payouts.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
    return { gross: round2(gross), fee: round2(fee), net: round2(net), available: round2(cleared), inProgress: round2(inProgress), paid: round2(paid), pending: round2(pending), unsettled };
  },

  // ——— Payouts ———
  payouts: () => [...state.payouts].sort((a, b) => b.requested.localeCompare(a.requested) || b.id.localeCompare(a.id)),
  payoutsFor: (bid) => db.payouts().filter((p) => p.businessId === bid),
  requestPayout(bid) {
    const e = db.sellerEarnings(bid);
    if (e.available <= 0) return null;
    const payout = {
      id: `DEMO-PO-${String(400 + state.payouts.length).padStart(4, '0')}`,
      businessId: bid, amount: e.available, period: `Up to ${todayISO()}`,
      requested: todayISO(), status: 'pending', paidOn: null, orderIds: e.unsettled,
    };
    state.payouts.push(payout);
    save();
    return payout;
  },
  updatePayout(id, patch) {
    const p = state.payouts.find((x) => x.id === id);
    if (p) { Object.assign(p, patch); save(); }
    return p;
  },

  // ——— Seller applications ———
  applications: () => [...state.applications].sort((a, b) => b.submitted.localeCompare(a.submitted)),
  addApplication(data) {
    const app = { id: `DEMO-APP-${String(19 + state.applications.filter((a) => !SEED_APPLICATIONS.some((s) => s.id === a.id)).length).padStart(3, '0')}`, submitted: todayISO(), status: 'pending', ...data };
    state.applications.push(app);
    save();
    return app;
  },
  updateApplication(id, patch) {
    const a = state.applications.find((x) => x.id === id);
    if (a) { Object.assign(a, patch); save(); }
    return a;
  },

  // ——— Misc demo capture (never sent anywhere) ———
  addNewsletter(email) { if (!state.newsletter.includes(email)) state.newsletter.push(email); save(); },
  addMessage(msg) { state.messages.push({ ...msg, date: todayISO() }); save(); },
  messages: () => state.messages,

  reset() {
    state = seed();
    storage.set('db', state);
    storage.remove('cart');
    emit('db:change');
    location.reload();
  },
};
