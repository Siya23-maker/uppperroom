import { db } from '../store/db.js';
import { getBusinessBySlug } from '../data/businesses.js';
import { CATEGORIES } from '../data/categories.js';
import { businessCard, productCard, img } from '../components/cards.js';
import { breadcrumbs } from '../components/breadcrumbs.js';
import { icon } from '../components/icons.js';
import { esc } from '../utils/format.js';
import { notFoundPage } from './notFound.js';
import { demoCallout } from './shared.js';

export function businessesPage() {
  const list = db.businesses().filter((b) => b.status === 'approved');
  return {
    title: 'Our Businesses',
    nav: 'businesses',
    description: 'Meet the church-member businesses selling at The Upper Room.',
    html: `
    ${breadcrumbs([{ label: 'Our Businesses' }])}
    <header class="page-hero container">
      <p class="eyebrow">Our businesses</p>
      <h1>The makers under our roof</h1>
      <p class="lead">Every storefront here belongs to a member of our church family. Shop their work, read their stories and support their callings.</p>
      <div class="biz-search">
        <label for="biz-q" class="sr-only">Search businesses</label>
        ${icon('search')}<input class="input" id="biz-q" type="search" placeholder="Search businesses or what they make">
      </div>
    </header>
    <section class="container section--tight" aria-label="Business directory">
      <p class="small muted" id="biz-count" aria-live="polite"></p>
      <div class="biz-grid" id="biz-grid" data-stagger>
        ${list.map((b) => businessCard(b, db.productsByBusiness(b.id).length)).join('')}
      </div>
      <div class="cta-band reveal">
        <div><h2>Run a business in our church family?</h2><p class="muted" style="margin:0">Apply to open a storefront — our team reviews every application personally.</p></div>
        <a class="btn" href="/become-a-seller">Become a seller ${icon('arrow')}</a>
      </div>
    </section>`,
    mount(root) {
      const input = root.querySelector('#biz-q');
      const grid = root.querySelector('#biz-grid');
      const count = root.querySelector('#biz-count');
      const draw = () => {
        const q = input.value.trim().toLowerCase();
        const hits = list.filter((b) => [b.name, b.category, b.shortBio, b.location].join(' ').toLowerCase().includes(q));
        count.textContent = `${hits.length} of ${list.length} businesses`;
        grid.innerHTML = hits.length
          ? hits.map((b) => businessCard(b, db.productsByBusiness(b.id).length)).join('')
          : `<div class="empty-state" style="grid-column:1/-1"><span class="empty-state__icon">${icon('store')}</span><h2 class="h3">No businesses found</h2><p class="muted">Try a different word, like “linen” or “mugs”.</p></div>`;
      };
      input.addEventListener('input', draw);
      draw();
    },
  };
}

export function storefrontPage({ params }) {
  const b = getBusinessBySlug(params.slug);
  if (!b) return notFoundPage({ what: 'business' });
  const products = db.productsByBusiness(b.id);
  const cats = [...new Set(products.map((p) => p.category))];
  return {
    title: b.name,
    nav: 'businesses',
    description: `${b.shortBio} Shop ${b.name} at The Upper Room.`,
    html: `
    ${breadcrumbs([{ label: 'Our Businesses', href: '/businesses' }, { label: b.name }])}
    <section class="storefront-hero container" aria-labelledby="store-title">
      <div class="storefront-hero__cover">${img(b.cover, `${b.name} storefront — placeholder image`, { eager: true, label: b.name })}</div>
      <div class="storefront-hero__card">
        <span class="storefront-hero__logo">${img(b.thumb, '', { label: b.name })}</span>
        <div>
          <p class="eyebrow">${esc(b.category)}</p>
          <h1 id="store-title">${esc(b.name)}</h1>
          <p class="storefront-hero__meta">${icon('pin')} ${esc(b.location)} <span aria-hidden="true">·</span> ${esc(b.since)} <span aria-hidden="true">·</span> ${products.length} products</p>
        </div>
      </div>
    </section>
    <section class="container storefront" aria-label="${esc(b.name)} story and products">
      <aside class="storefront__about">
        <h2 class="h3">Our story</h2>
        <p>${esc(b.story)}</p>
        ${demoCallout(`<strong>Sample storefront.</strong> ${b.slug === 'rooted' ? 'Rooted is named in the brief; its description, photos and location are placeholders until confirmed by the business owner.' : 'This is a fictional business created for the prototype.'}`)}
        <p class="small muted" style="margin-top:1rem">Owner: ${esc(b.ownerName)}</p>
      </aside>
      <div>
        <div class="section-head" style="margin-bottom:1rem">
          <h2 class="h3" style="margin:0">Shop ${esc(b.name)}</h2>
          <div class="chips" role="group" aria-label="Filter by category">
            <button class="pill" type="button" data-f="all" aria-pressed="true">All</button>
            ${cats.map((c) => `<button class="pill" type="button" data-f="${c}" aria-pressed="false">${CATEGORIES.find((x) => x.id === c)?.name}</button>`).join('')}
          </div>
        </div>
        <div class="product-grid product-grid--3" id="store-grid" data-stagger>
          ${products.length ? products.map(productCard).join('') : `<div class="empty-state" style="grid-column:1/-1"><span class="empty-state__icon">${icon('box')}</span><h2 class="h3">No products yet</h2><p class="muted">This business is preparing its first listings.</p></div>`}
        </div>
      </div>
    </section>`,
    mount(root) {
      const grid = root.querySelector('#store-grid');
      root.querySelectorAll('[data-f]').forEach((btn) =>
        btn.addEventListener('click', () => {
          root.querySelectorAll('[data-f]').forEach((x) => x.setAttribute('aria-pressed', String(x === btn)));
          const f = btn.dataset.f;
          grid.innerHTML = products.filter((p) => f === 'all' || p.category === f).map(productCard).join('');
        }),
      );
    },
  };
}
