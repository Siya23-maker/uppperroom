import { db } from '../store/db.js';
import { cart, unitPrice } from '../store/cart.js';
import { getBusiness } from '../data/businesses.js';
import { categoryName } from '../data/categories.js';
import { CONFIG } from '../config.js';
import { productCard, img, stockState, defaultOptions } from '../components/cards.js';
import { breadcrumbs } from '../components/breadcrumbs.js';
import { icon } from '../components/icons.js';
import { toast } from '../components/toast.js';
import { openCart } from '../components/cartDrawer.js';
import { esc, money } from '../utils/format.js';
import { withBusy, prefersReducedMotion } from '../utils/dom.js';
import { navigate } from '../router.js';
import { notFoundPage } from './notFound.js';

export function productPage({ params }) {
  const p = db.getProductBySlug(params.slug);
  if (!p) return notFoundPage({ what: 'product' });
  const biz = getBusiness(p.businessId);
  const stock = stockState(p);
  const images = p.images.length ? p.images : [''];
  const more = db.productsByBusiness(p.businessId).filter((x) => x.id !== p.id).slice(0, 4);
  const related = db.products().filter((x) => x.category === p.category && x.id !== p.id && x.businessId !== p.businessId).slice(0, 4);
  const defaults = defaultOptions(p);
  const stars = p.rating ? `<span class="stars" aria-label="Rated ${p.rating} out of 5 (demo rating)">${'★'.repeat(Math.round(p.rating))}${'☆'.repeat(5 - Math.round(p.rating))}</span> <span class="small muted">${p.rating.toFixed(1)} · demo rating</span>` : '';

  return {
    title: p.name,
    nav: 'shop',
    description: `${p.summary} From ${biz.name} at The Upper Room.`,
    html: `
    ${breadcrumbs([{ label: 'Shop', href: '/shop' }, { label: categoryName(p.category), href: `/shop?category=${p.category}` }, { label: p.name }])}
    <section class="container product" aria-labelledby="product-title">
      <div class="gallery" data-gallery>
        <div class="gallery__thumbs" role="group" aria-label="Product images">
          ${images.map((src, i) => `<button type="button" class="gallery__thumb" data-index="${i}" aria-label="Show image ${i + 1} of ${images.length}" ${i === 0 ? 'aria-current="true"' : ''}>${img(src, '', { label: p.name })}</button>`).join('')}
        </div>
        <div class="gallery__main" data-zoom tabindex="0" role="button" aria-label="Zoom image (press Enter to toggle)">
          ${img(images[0], `${p.name} — illustrative placeholder photo, not the actual product`, { eager: true, label: p.name })}
          <span class="gallery__notice badge badge--muted">Illustrative photo</span>
          <span class="gallery__hint" aria-hidden="true">${prefersReducedMotion() || !matchMedia('(hover: hover)').matches ? 'Tap to zoom' : 'Hover to zoom'}</span>
        </div>
      </div>

      <div class="product__info">
        <p class="product__seller"><a href="/businesses/${biz.slug}">${esc(biz.name)}</a> · ${categoryName(p.category)}</p>
        <h1 id="product-title">${esc(p.name)}</h1>
        <p class="product__rating">${stars}</p>
        <p class="product__price"><span id="live-price">${money(unitPrice(p, defaults))}</span>${p.compareAt ? ` <s class="price--was">${money(p.compareAt)}</s> <span class="badge badge--burgundy">Save ${money(p.compareAt - p.price)}</span>` : ''}</p>
        <p class="lead">${esc(p.summary)}</p>

        <form id="buy-form" novalidate>
          ${(p.variants ?? []).map((v, vi) => `
            <fieldset class="option-group">
              <legend>${esc(v.name)}: <span data-chosen="${vi}">${esc(v.options[0].label)}</span></legend>
              <div class="options">
                ${v.options.map((o, oi) => `
                  <label class="option"><input type="radio" name="opt-${vi}" data-variant="${esc(v.name)}" value="${esc(o.label)}" ${oi === 0 ? 'checked' : ''}>
                  <span>${esc(o.label)}${o.delta ? `<small>+${money(o.delta)}</small>` : ''}</span></label>`).join('')}
              </div>
            </fieldset>`).join('')}

          <div class="product__stock"><span class="badge badge--${stock.tone}">${stock.label}</span>
            ${stock.key !== 'out' ? `<span class="small muted">${p.stock} available (demo stock)</span>` : '<span class="small muted">Check back soon — the maker is restocking.</span>'}</div>

          <div class="product__buy">
            <div class="qty" data-local-qty>
              <button type="button" data-d="-1" aria-label="Decrease quantity" disabled>−</button>
              <input type="number" id="buy-qty" inputmode="numeric" min="1" max="${Math.max(1, p.stock)}" value="1" aria-label="Quantity">
              <button type="button" data-d="1" aria-label="Increase quantity" ${p.stock <= 1 ? 'disabled' : ''}>+</button>
            </div>
            <button class="btn product__add" type="submit" ${stock.key === 'out' ? 'disabled' : ''}>${icon('bag')} ${stock.key === 'out' ? 'Sold out' : 'Add to cart'}</button>
          </div>
          ${stock.key !== 'out' ? `<button class="btn btn--ghost btn--block" type="button" data-buy-now>Buy now</button>` : ''}
        </form>

        <ul class="product__perks">
          <li>${icon('store')} Free collection at The Upper Room</li>
          <li>${icon('truck')} Courier delivery ${money(CONFIG.deliveryFee)} · free over ${money(CONFIG.freeDeliveryThreshold)}</li>
          <li>${icon('hands')} Sold by a church-member business</li>
        </ul>

        <div class="accordion">
          <details open><summary>Description</summary><div><p>${esc(p.description)}</p></div></details>
          <details><summary>Details & care</summary><div><ul>${p.details.map((d) => `<li>${esc(d)}</li>`).join('')}</ul></div></details>
          <details><summary>Delivery & collection</summary><div><p>Choose free collection from ${esc(CONFIG.collectionPoint)} or courier delivery at checkout. Delivery times shown in the live store will be confirmed per seller.</p><p class="placeholder-note">${icon('info')} Delivery terms pending client confirmation</p></div></details>
        </div>

        <aside class="seller-card" aria-label="About the seller">
          <span class="seller-card__img">${img(biz.thumb, '', { label: biz.name })}</span>
          <div>
            <p class="eyebrow" style="margin:0">Sold by</p>
            <h2 class="h4"><a href="/businesses/${biz.slug}">${esc(biz.name)}</a></h2>
            <p class="small muted" style="margin:0">${esc(biz.shortBio)}</p>
          </div>
          <a class="btn btn--ghost btn--sm" href="/businesses/${biz.slug}">Visit store</a>
        </aside>
      </div>
    </section>

    ${more.length ? `
    <section class="section" aria-labelledby="more-title">
      <div class="container">
        <div class="section-head"><h2 id="more-title">More from ${esc(biz.name)}</h2><a class="link-arrow" href="/businesses/${biz.slug}">Visit storefront ${icon('arrow')}</a></div>
        <div class="product-grid" data-stagger>${more.map(productCard).join('')}</div>
      </div>
    </section>` : ''}
    ${related.length ? `
    <section class="section section--alt" aria-labelledby="related-title">
      <div class="container">
        <div class="section-head"><h2 id="related-title">You may also like</h2><a class="link-arrow" href="/shop?category=${p.category}">More ${categoryName(p.category).toLowerCase()} ${icon('arrow')}</a></div>
        <div class="product-grid" data-stagger>${related.map(productCard).join('')}</div>
      </div>
    </section>` : ''}`,

    mount(root) {
      // Gallery
      const main = root.querySelector('[data-zoom]');
      const mainImg = main.querySelector('img');
      root.querySelectorAll('.gallery__thumb').forEach((t) =>
        t.addEventListener('click', () => {
          root.querySelectorAll('.gallery__thumb').forEach((x) => x.removeAttribute('aria-current'));
          t.setAttribute('aria-current', 'true');
          const src = t.querySelector('img').src;
          main.classList.add('is-swapping');
          setTimeout(() => { mainImg.src = src; mainImg.dataset.fellBack = ''; main.classList.remove('is-swapping'); }, prefersReducedMotion() ? 0 : 180);
        }),
      );
      const setOrigin = (e) => {
        const r = main.getBoundingClientRect();
        main.style.setProperty('--zx', `${((e.clientX - r.left) / r.width) * 100}%`);
        main.style.setProperty('--zy', `${((e.clientY - r.top) / r.height) * 100}%`);
      };
      if (!prefersReducedMotion() && matchMedia('(hover: hover)').matches) {
        main.addEventListener('mouseenter', () => main.classList.add('is-zoomed'));
        main.addEventListener('mouseleave', () => main.classList.remove('is-zoomed'));
        main.addEventListener('mousemove', setOrigin);
      } else {
        main.addEventListener('click', (e) => { setOrigin(e); main.classList.toggle('is-zoomed'); });
      }
      main.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); main.classList.toggle('is-zoomed'); } });

      // Options & live price
      const form = root.querySelector('#buy-form');
      const chosen = () => {
        const o = {};
        form.querySelectorAll('input[data-variant]:checked').forEach((i) => (o[i.dataset.variant] = i.value));
        return o;
      };
      form.addEventListener('change', (e) => {
        if (!e.target.dataset.variant) return;
        const vi = e.target.name.split('-')[1];
        root.querySelector(`[data-chosen="${vi}"]`).textContent = e.target.value;
        const price = root.querySelector('#live-price');
        price.textContent = money(unitPrice(p, chosen()));
        price.classList.remove('is-pulse'); void price.offsetWidth; price.classList.add('is-pulse');
      });

      // Quantity
      const qty = root.querySelector('#buy-qty');
      const max = Math.max(1, p.stock);
      const syncQty = () => {
        qty.value = Math.max(1, Math.min(max, Math.floor(Number(qty.value)) || 1));
        root.querySelector('[data-d="-1"]').disabled = Number(qty.value) <= 1;
        root.querySelector('[data-d="1"]').disabled = Number(qty.value) >= max;
      };
      root.querySelectorAll('[data-d]').forEach((b) => b.addEventListener('click', () => { qty.value = Number(qty.value) + Number(b.dataset.d); syncQty(); }));
      qty.addEventListener('change', syncQty);

      const add = () => {
        const res = cart.add(p.id, chosen(), Number(qty.value));
        if (!res.ok) { toast(res.message, { tone: 'info' }); return false; }
        if (res.limited) toast(`Only ${res.added} more could be added — that's all the stock available.`, { tone: 'info' });
        return true;
      };
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('.product__add');
        let ok = false;
        await withBusy(btn, () => { ok = add(); }, 450);
        if (ok) {
          btn.classList.add('is-done');
          btn.innerHTML = `${icon('check')} Added to cart`;
          setTimeout(() => { btn.classList.remove('is-done'); btn.innerHTML = `${icon('bag')} Add to cart`; }, 1600);
          openCart();
        }
      });
      root.querySelector('[data-buy-now]')?.addEventListener('click', () => { if (add()) navigate('/checkout'); });
    },
  };
}
