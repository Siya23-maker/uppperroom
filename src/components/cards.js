import { esc, money } from '../utils/format.js';
import { placeholderImage } from '../utils/images.js';
import { getBusiness } from '../data/businesses.js';
import { categoryName } from '../data/categories.js';
import { icon } from './icons.js';

export const img = (src, alt, { cls = '', label = alt, eager = false, sizes = '' } = {}) =>
  `<img class="${cls}" src="${src || placeholderImage(label, label.length)}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" data-fallback="${esc(label)}" ${sizes}>`;

export const productImage = (p, i = 0) => p.images?.[i] ?? p.images?.[0] ?? '';

export const defaultOptions = (p) => Object.fromEntries((p.variants ?? []).map((v) => [v.name, v.options[0].label]));

export function stockState(p) {
  if (p.stock <= 0) return { label: 'Sold out', tone: 'burgundy', key: 'out' };
  if (p.stock <= 5) return { label: `Only ${p.stock} left`, tone: 'gold', key: 'low' };
  return { label: 'In stock', tone: 'sage', key: 'in' };
}

export const priceHtml = (p) =>
  `<span class="price">${p.variants?.some((v) => v.options.some((o) => o.delta > 0)) ? '<span class="price__from">From</span> ' : ''}${money(p.price)}</span>${
    p.compareAt ? ` <s class="price--was" aria-label="Was ${money(p.compareAt)}">${money(p.compareAt)}</s>` : ''
  }`;

export function productCard(p) {
  const biz = getBusiness(p.businessId);
  const stock = stockState(p);
  const alt = `${p.name} — illustrative placeholder photo`;
  const second = p.images?.[1];
  return `
  <article class="product-card" data-product="${p.id}">
    <div class="product-card__frame">
    <a class="product-card__media" href="/product/${p.slug}" tabindex="-1" aria-hidden="true">
      ${img(productImage(p), '', { label: p.name, cls: 'product-card__img' })}
      ${second ? img(second, '', { label: p.name, cls: 'product-card__img product-card__img--alt' }) : ''}
      <span class="product-card__flags">
        ${p.isNew ? '<span class="badge badge--rose">New</span>' : ''}
        ${p.compareAt ? '<span class="badge badge--burgundy">Sale</span>' : ''}
        ${stock.key !== 'in' ? `<span class="badge badge--${stock.tone}">${stock.label}</span>` : ''}
      </span>
    </a>
    <button class="product-card__quick btn btn--light btn--sm" type="button" data-quick-add="${p.id}" ${stock.key === 'out' ? 'disabled' : ''}
      aria-label="Quick add ${esc(p.name)} to cart${p.variants?.length ? ' with default options' : ''}">
      ${stock.key === 'out' ? 'Sold out' : `${icon('plus')} Quick add`}
    </button>
    </div>
    <div class="product-card__body">
      <p class="product-card__seller"><a href="/businesses/${biz?.slug}">${esc(biz?.name ?? '')}</a> · <span>${esc(categoryName(p.category))}</span></p>
      <h3 class="product-card__title"><a href="/product/${p.slug}">${esc(p.name)}</a></h3>
      <p class="product-card__price">${priceHtml(p)}</p>
    </div>
  </article>`;
}

export function businessCard(b, productCount = 0) {
  return `
  <article class="biz-card">
    <a class="biz-card__media" href="/businesses/${b.slug}" tabindex="-1" aria-hidden="true">
      ${img(b.cover, '', { label: b.name })}
    </a>
    <div class="biz-card__body">
      <span class="biz-card__thumb">${img(b.thumb, '', { label: b.name })}</span>
      <p class="eyebrow">${esc(b.category)}</p>
      <h3><a href="/businesses/${b.slug}">${esc(b.name)}</a></h3>
      <p class="muted small">${esc(b.shortBio)}</p>
      <p class="biz-card__meta small">${icon('pin')} ${esc(b.location)} <span aria-hidden="true">·</span> ${productCount} products</p>
      <a class="link-arrow" href="/businesses/${b.slug}">Visit storefront ${icon('arrow')}</a>
    </div>
  </article>`;
}
