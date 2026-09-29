import { db } from '../store/db.js';
import { CATEGORIES, categoryName } from '../data/categories.js';
import { productCard } from '../components/cards.js';
import { icon } from '../components/icons.js';
import { breadcrumbs } from '../components/breadcrumbs.js';
import { esc, money } from '../utils/format.js';
import { setQuery } from '../router.js';
import { getBusiness } from '../data/businesses.js';
import { prefersReducedMotion } from '../utils/dom.js';

const SORTS = [
  ['featured', 'Featured'],
  ['newest', 'New arrivals'],
  ['price-asc', 'Price: low to high'],
  ['price-desc', 'Price: high to low'],
  ['name', 'Name: A–Z'],
  ['rating', 'Top rated'],
];
const PRICE_CAPS = [['', 'Any price'], ['250', 'Under R250'], ['500', 'Under R500'], ['1000', 'Under R1 000'], ['2000', 'Under R2 000']];

function readState(query) {
  return {
    category: query.get('category') || 'all',
    q: query.get('q') || '',
    sort: query.get('sort') || 'featured',
    biz: (query.get('biz') || '').split(',').filter(Boolean),
    max: query.get('max') || '',
    instock: query.get('instock') === '1',
    sale: query.get('sale') === '1',
  };
}

function apply(state) {
  const terms = state.q.toLowerCase().split(/\s+/).filter(Boolean);
  let list = db.products().filter((p) => {
    if (state.category !== 'all' && p.category !== state.category) return false;
    if (state.biz.length && !state.biz.includes(p.businessId)) return false;
    if (state.max && p.price > Number(state.max)) return false;
    if (state.instock && p.stock <= 0) return false;
    if (state.sale && !p.compareAt) return false;
    if (terms.length) {
      const hay = [p.name, p.summary, p.description, categoryName(p.category), getBusiness(p.businessId)?.name, ...(p.tags ?? [])].join(' ').toLowerCase();
      if (!terms.every((t) => hay.includes(t))) return false;
    }
    return true;
  });
  const by = {
    featured: (a, b) => (b.featured - a.featured) || (b.stock > 0) - (a.stock > 0),
    newest: (a, b) => (b.isNew - a.isNew) || a.name.localeCompare(b.name),
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    name: (a, b) => a.name.localeCompare(b.name),
    rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
  }[state.sort];
  return [...list].sort(by ?? (() => 0));
}

export function shopPage({ query }) {
  const state = readState(query);
  const all = db.products();
  const cat = CATEGORIES.find((c) => c.id === state.category);
  const title = cat ? cat.name : state.q ? `Search: “${state.q}”` : 'Shop all';

  const crumbs = cat ? [{ label: 'Shop', href: '/shop' }, { label: cat.name }] : [{ label: 'Shop' }];

  return {
    title: cat ? `${cat.name} — Shop` : 'Shop',
    nav: 'shop',
    description: 'Browse handcrafted Christian decor, bedding, drinkware, bottles, gifts, apparel and stationery from church-member businesses.',
    html: `
    ${breadcrumbs(crumbs)}
    <header class="page-hero container">
      <p class="eyebrow">The collection</p>
      <h1 id="shop-title">${esc(title)}</h1>
      <p class="lead" id="shop-lead">${cat ? esc(cat.blurb) : 'Every piece is made or curated by a business in our church family.'}</p>
      <nav class="cat-pills" aria-label="Categories">
        <a class="pill" href="/shop" data-cat="all" ${state.category === 'all' ? 'aria-current="true"' : ''}>All</a>
        ${CATEGORIES.map((c) => `<a class="pill" href="/shop?category=${c.id}" data-cat="${c.id}" ${state.category === c.id ? 'aria-current="true"' : ''}>${c.name}</a>`).join('')}
      </nav>
    </header>

    <section class="container shop" aria-labelledby="shop-title">
      <button class="btn btn--ghost btn--sm shop__filter-toggle" type="button" aria-expanded="false" aria-controls="shop-filters">${icon('filter')} Filters</button>
      <aside class="shop__filters" id="shop-filters" aria-label="Product filters">
        <form id="filter-form">
          <fieldset class="filter-group">
            <legend>Category</legend>
            <label class="check"><input type="radio" name="category" value="all" ${state.category === 'all' ? 'checked' : ''}> All <span class="muted">(${all.length})</span></label>
            ${CATEGORIES.map((c) => `<label class="check"><input type="radio" name="category" value="${c.id}" ${state.category === c.id ? 'checked' : ''}> ${c.name} <span class="muted">(${all.filter((p) => p.category === c.id).length})</span></label>`).join('')}
          </fieldset>
          <fieldset class="filter-group">
            <legend>Business</legend>
            ${db.businesses().map((b) => `<label class="check"><input type="checkbox" name="biz" value="${b.id}" ${state.biz.includes(b.id) ? 'checked' : ''}> ${esc(b.name)}</label>`).join('')}
          </fieldset>
          <fieldset class="filter-group">
            <legend>Price</legend>
            ${PRICE_CAPS.map(([v, l]) => `<label class="check"><input type="radio" name="max" value="${v}" ${state.max === v ? 'checked' : ''}> ${l}</label>`).join('')}
          </fieldset>
          <fieldset class="filter-group">
            <legend>Availability</legend>
            <label class="check"><input type="checkbox" name="instock" value="1" ${state.instock ? 'checked' : ''}> In stock only</label>
            <label class="check"><input type="checkbox" name="sale" value="1" ${state.sale ? 'checked' : ''}> On sale</label>
          </fieldset>
          <button class="btn btn--ghost btn--sm btn--block" type="button" data-clear>Clear all filters</button>
        </form>
      </aside>

      <div class="shop__main">
        <div class="shop__toolbar">
          <div class="shop__search">
            <label for="shop-q" class="sr-only">Search products</label>
            ${icon('search')}
            <input class="input" id="shop-q" type="search" placeholder="Search the collection" value="${esc(state.q)}">
          </div>
          <p class="shop__count" id="shop-count" aria-live="polite"></p>
          <div class="shop__sort">
            <label for="shop-sort" class="small muted">Sort by</label>
            <select class="select" id="shop-sort">${SORTS.map(([v, l]) => `<option value="${v}" ${state.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
          </div>
        </div>
        <div class="chips" id="active-chips" aria-label="Active filters"></div>
        <div class="product-grid product-grid--shop" id="shop-grid"></div>
      </div>
    </section>`,

    mount(root) {
      const grid = root.querySelector('#shop-grid');
      const count = root.querySelector('#shop-count');
      const chips = root.querySelector('#active-chips');
      const form = root.querySelector('#filter-form');
      const qInput = root.querySelector('#shop-q');
      const sortSel = root.querySelector('#shop-sort');
      const titleEl = root.querySelector('#shop-title');
      const leadEl = root.querySelector('#shop-lead');

      const draw = (animate = true) => {
        const list = apply(state);
        count.textContent = `${list.length} ${list.length === 1 ? 'piece' : 'pieces'}`;
        grid.innerHTML = list.length
          ? list.map(productCard).join('')
          : `<div class="empty-state" style="grid-column:1/-1">
               <span class="empty-state__icon">${icon('search')}</span>
               <h2 class="h3">Nothing here yet</h2>
               <p class="muted">No pieces match these filters. Try widening your search or clearing a filter.</p>
               <button class="btn btn--ghost" type="button" data-clear>Clear filters</button>
             </div>`;
        if (animate && !prefersReducedMotion()) {
          [...grid.children].forEach((c, i) => { c.classList.add('reveal'); c.style.setProperty('--delay', `${Math.min(i, 10) * 45}ms`); });
          requestAnimationFrame(() => requestAnimationFrame(() => grid.querySelectorAll('.reveal').forEach((c) => c.classList.add('is-visible'))));
        }
        const c = CATEGORIES.find((x) => x.id === state.category);
        titleEl.textContent = c ? c.name : state.q ? `Search: “${state.q}”` : 'Shop all';
        leadEl.textContent = c ? c.blurb : 'Every piece is made or curated by a business in our church family.';
        document.title = `${c ? c.name + ' — ' : ''}Shop · The Upper Room`;
        root.querySelectorAll('[data-cat]').forEach((a) => (a.dataset.cat === state.category ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
        const crumbCurrent = root.querySelector('.breadcrumbs [aria-current]');
        if (crumbCurrent) crumbCurrent.textContent = c ? c.name : 'Shop';

        const active = [];
        if (c) active.push(['category', c.name]);
        if (state.q) active.push(['q', `“${state.q}”`]);
        state.biz.forEach((b) => active.push([`biz:${b}`, getBusiness(b)?.name]));
        if (state.max) active.push(['max', `Under ${money(state.max)}`]);
        if (state.instock) active.push(['instock', 'In stock']);
        if (state.sale) active.push(['sale', 'On sale']);
        chips.innerHTML = active.length
          ? active.map(([k, l]) => `<button type="button" class="chip-remove" data-chip="${k}" aria-label="Remove filter ${esc(l)}">${esc(l)} ${icon('close')}</button>`).join('') +
            `<button type="button" class="remove-btn" data-clear>Clear all</button>`
          : '';
        setQuery({
          category: state.category, q: state.q, sort: state.sort === 'featured' ? null : state.sort,
          biz: state.biz.join(','), max: state.max, instock: state.instock ? '1' : null, sale: state.sale ? '1' : null,
        });
      };

      const syncForm = () => {
        form.querySelectorAll('[name="category"]').forEach((r) => (r.checked = r.value === state.category));
        form.querySelectorAll('[name="biz"]').forEach((c) => (c.checked = state.biz.includes(c.value)));
        form.querySelectorAll('[name="max"]').forEach((r) => (r.checked = r.value === state.max));
        form.instock.checked = state.instock;
        form.sale.checked = state.sale;
        qInput.value = state.q;
      };

      form.addEventListener('change', () => {
        const fd = new FormData(form);
        state.category = fd.get('category') || 'all';
        state.biz = fd.getAll('biz');
        state.max = fd.get('max') || '';
        state.instock = fd.get('instock') === '1';
        state.sale = fd.get('sale') === '1';
        draw();
      });
      let t;
      qInput.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { state.q = qInput.value.trim(); draw(); }, 220); });
      sortSel.addEventListener('change', () => { state.sort = sortSel.value; draw(); });

      // Category pills filter in place (no reload), but keep real links for no-JS / new-tab.
      root.querySelector('.cat-pills').addEventListener('click', (e) => {
        const a = e.target.closest('[data-cat]');
        if (!a || e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        state.category = a.dataset.cat;
        syncForm();
        draw();
      });

      root.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-chip]');
        if (chip) {
          const k = chip.dataset.chip;
          if (k === 'category') state.category = 'all';
          else if (k === 'q') state.q = '';
          else if (k.startsWith('biz:')) state.biz = state.biz.filter((b) => b !== k.slice(4));
          else if (k === 'max') state.max = '';
          else state[k] = false;
          syncForm(); draw();
          (chips.querySelector('.chip-remove') ?? qInput).focus();
        }
        if (e.target.closest('[data-clear]')) {
          Object.assign(state, { category: 'all', q: '', biz: [], max: '', instock: false, sale: false });
          syncForm(); draw();
        }
      });

      const toggle = root.querySelector('.shop__filter-toggle');
      const filters = root.querySelector('#shop-filters');
      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') !== 'true';
        toggle.setAttribute('aria-expanded', String(open));
        filters.classList.toggle('is-open', open);
      });

      draw(false);
    },
  };
}
