import { storage } from '../utils/storage.js';
import { emit } from '../utils/dom.js';
import { CONFIG } from '../config.js';
import { db } from './db.js';

/**
 * Cart store — persisted in localStorage.
 * Line shape: { key, productId, options: { [variantName]: optionLabel }, qty }
 * Prices are always re-derived from the catalogue so the cart can't drift.
 */
let lines = storage.get('cart', []);

const save = () => { storage.set('cart', lines); emit('cart:change', cart.summary()); };

export const lineKey = (productId, options) =>
  productId + '|' + Object.entries(options).map(([k, v]) => `${k}=${v}`).join(';');

export function unitPrice(product, options = {}) {
  let price = product.price;
  for (const v of product.variants ?? []) {
    const chosen = v.options.find((o) => o.label === options[v.name]);
    if (chosen) price += chosen.delta;
  }
  return price;
}

export const variantText = (options) => Object.values(options).join(' · ');

export const cart = {
  lines: () =>
    lines
      .map((l) => {
        const product = db.getProduct(l.productId);
        if (!product) return null;
        const price = unitPrice(product, l.options);
        return { ...l, product, unitPrice: price, lineTotal: price * l.qty };
      })
      .filter(Boolean),

  count: () => lines.reduce((n, l) => n + l.qty, 0),

  add(productId, options, qty = 1) {
    const product = db.getProduct(productId);
    if (!product) return { ok: false, message: 'Product not found' };
    const key = lineKey(productId, options);
    const existing = lines.find((l) => l.key === key);
    const inCart = lines.filter((l) => l.productId === productId).reduce((n, l) => n + l.qty, 0);
    const allowed = Math.max(0, product.stock - inCart);
    const addQty = Math.min(qty, allowed);
    if (addQty <= 0) return { ok: false, message: 'No more stock available for this item' };
    if (existing) existing.qty += addQty;
    else lines.push({ key, productId, options, qty: addQty });
    save();
    return { ok: true, added: addQty, limited: addQty < qty };
  },

  setQty(key, qty) {
    const line = lines.find((l) => l.key === key);
    if (!line) return;
    const product = db.getProduct(line.productId);
    const others = lines.filter((l) => l.productId === line.productId && l.key !== key).reduce((n, l) => n + l.qty, 0);
    const max = Math.max(1, (product?.stock ?? 1) - others);
    line.qty = Math.max(1, Math.min(max, Math.floor(qty) || 1));
    save();
  },

  remove(key) { lines = lines.filter((l) => l.key !== key); save(); },

  clear() { lines = []; save(); },

  totals(fulfilment = 'delivery') {
    const subtotal = cart.lines().reduce((s, l) => s + l.lineTotal, 0);
    const delivery =
      fulfilment === 'collection' || subtotal === 0 ? 0 : subtotal >= CONFIG.freeDeliveryThreshold ? 0 : CONFIG.deliveryFee;
    return { subtotal, delivery, total: subtotal + delivery };
  },

  summary: () => ({ count: cart.count(), ...cart.totals() }),
};
