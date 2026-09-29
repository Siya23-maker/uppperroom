import { db } from '../store/db.js';
import { CATEGORIES } from '../data/categories.js';
import { IMG } from '../data/images.js';
import { productCard, businessCard, img } from '../components/cards.js';
import { icon } from '../components/icons.js';
import { money } from '../utils/format.js';
import { bindNewsletter, newsletterSection } from './shared.js';

export function homePage() {
  const products = db.products();
  const bestsellers = products.filter((p) => p.featured).slice(0, 8);
  const newArrivals = products.filter((p) => p.isNew).slice(0, 8);
  const businesses = db.businesses().filter((b) => b.status === 'approved');
  const featuredBiz = businesses.filter((b) => b.featured);
  const hamper = db.getProduct('p19');
  const mug = db.getProduct('p09');

  return {
    title: null,
    nav: 'home',
    description: 'Shop handcrafted Christian decor, bedding, drinkware, gifts and more from church-member businesses at The Upper Room.',
    html: `
    <section class="hero" aria-labelledby="hero-title">
      <div class="container hero__inner">
        <div class="hero__copy">
          <p class="eyebrow reveal">A marketplace for our church family</p>
          <h1 id="hero-title" class="hero__title reveal" style="--delay:80ms">Gather together, <em>brewing in unity.</em></h1>
          <p class="lead reveal" style="--delay:160ms">Handcrafted decor, linen, drinkware and gifts from the businesses of our church community — gathered under one warm roof.</p>
          <div class="row hero__ctas reveal" style="--delay:240ms">
            <a class="btn" href="/shop">Shop the collection ${icon('arrow')}</a>
            <a class="btn btn--ghost" href="/businesses">Meet our businesses</a>
          </div>
          <dl class="hero__facts reveal" style="--delay:320ms">
            <div><dt>Member businesses</dt><dd>${businesses.length}</dd></div>
            <div><dt>Handpicked pieces</dt><dd>${products.length}</dd></div>
            <div><dt>Collection</dt><dd>Free</dd></div>
          </dl>
        </div>
        <div class="hero__art reveal" style="--delay:120ms">
          <div class="hero__arch">${img(IMG.hero, 'A warm cup of coffee on a table — placeholder image', { eager: true, label: 'Fellowship coffee' })}</div>
          <div class="hero__inset">${img(IMG.bedLinen, 'Linen bedding in soft light — placeholder image', { label: 'Linen' })}</div>
          <a class="hero__float" href="/product/${mug.slug}">
            <span class="hero__float-img">${img(mug.images[0], '', { label: mug.name })}</span>
            <span><small>Featured</small><b>${mug.name}</b><span>${money(mug.price)}</span></span>
          </a>
          <span class="hero__olive" aria-hidden="true">${icon('leaf')}</span>
        </div>
      </div>
    </section>

    <section class="values" aria-label="Why shop with us">
      <div class="container values__grid" data-stagger>
        <div class="value">${icon('hands')}<div><b>Church-member makers</b><span>Every seller is part of our community</span></div></div>
        <div class="value">${icon('store')}<div><b>Free collection</b><span>Collect at The Upper Room</span></div></div>
        <div class="value">${icon('shield')}<div><b>One secure checkout</b><span>Pay once, across all sellers</span></div></div>
        <div class="value">${icon('gift')}<div><b>Gift-ready</b><span>Blessing cards & wrapping available</span></div></div>
      </div>
    </section>

    <section class="section" aria-labelledby="cat-title">
      <div class="container">
        <div class="section-head center" style="justify-content:center;text-align:center;flex-direction:column;align-items:center">
          <p class="eyebrow eyebrow--center">Browse by category</p>
          <h2 id="cat-title">Something for every room</h2>
        </div>
        <div class="cat-grid" data-stagger>
          ${CATEGORIES.map((c) => `
            <a class="cat-tile" href="/shop?category=${c.id}">
              <span class="cat-tile__img">${img(c.image, '', { label: c.name })}</span>
              <b>${c.name}</b>
              <span>${products.filter((p) => p.category === c.id).length} pieces</span>
            </a>`).join('')}
        </div>
      </div>
    </section>

    <section class="section section--alt" aria-labelledby="featured-title">
      <div class="container">
        <div class="section-head">
          <div><p class="eyebrow">Featured</p><h2 id="featured-title">Loved by our community</h2></div>
          <div class="row">
            <div class="segmented" role="tablist" aria-label="Featured product lists">
              <button role="tab" type="button" aria-selected="true" aria-controls="featured-grid" data-list="best">Bestsellers</button>
              <button role="tab" type="button" aria-selected="false" aria-controls="featured-grid" data-list="new">New arrivals</button>
            </div>
            <a class="link-arrow" href="/shop">View all ${icon('arrow')}</a>
          </div>
        </div>
        <div class="product-grid" id="featured-grid" role="tabpanel" aria-live="polite" data-stagger>
          ${bestsellers.map(productCard).join('')}
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="biz-title">
      <div class="container">
        <div class="section-head">
          <div><p class="eyebrow">Our businesses</p><h2 id="biz-title">Meet the makers under our roof</h2>
          <p class="lead" style="margin:0">Each storefront belongs to a family in our church community.</p></div>
          <a class="link-arrow" href="/businesses">All businesses ${icon('arrow')}</a>
        </div>
        <div class="biz-grid" data-stagger>
          ${featuredBiz.map((b) => businessCard(b, db.productsByBusiness(b.id).length)).join('')}
        </div>
      </div>
    </section>

    <section class="mission on-dark" aria-labelledby="mission-title">
      <div class="container mission__inner">
        <div class="mission__img reveal">${img(IMG.gathering, 'People gathered around a table in fellowship — placeholder image', { label: 'Fellowship' })}</div>
        <div class="mission__copy reveal" style="--delay:120ms">
          <p class="eyebrow">Our mission</p>
          <h2 id="mission-title">A room where faith, family & good work meet</h2>
          <p>The Upper Room brings the businesses of our church family together in one place — so that shopping becomes an act of fellowship, and every purchase helps a neighbour’s craft to flourish.</p>
          <blockquote class="mission__verse">
            <p>“They devoted themselves… to fellowship, to the breaking of bread and to prayer.”</p>
            <cite>Acts 2:42</cite>
          </blockquote>
          <p class="placeholder-note">${icon('info')} Draft copy — pending client approval</p>
          <div class="row" style="margin-top:1.25rem"><a class="btn btn--light" href="/about">Our story</a><a class="btn btn--outline" style="--btn-fg:var(--ivory)" href="/become-a-seller">Become a seller</a></div>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="gift-title">
      <div class="container feature-split">
        <div class="feature-split__img reveal">${img(hamper.images[0], `${hamper.name} — illustrative placeholder photo`, { label: hamper.name })}</div>
        <div class="feature-split__copy reveal" style="--delay:120ms">
          <p class="eyebrow">Gifts for every season</p>
          <h2 id="gift-title">Pour a cup, share a blessing</h2>
          <p class="lead">Our ${hamper.name.toLowerCase()} pairs two stoneware mugs with locally roasted beans and a hand-written verse card — made for welcoming new neighbours, thanking volunteers and celebrating milestones.</p>
          <p class="feature-split__price">${money(hamper.price)}</p>
          <div class="row"><a class="btn" href="/product/${hamper.slug}">Shop the hamper</a><a class="link-arrow" href="/shop?category=gifts">All gifts ${icon('arrow')}</a></div>
        </div>
      </div>
    </section>

    ${newsletterSection()}`,

    mount(root) {
      const grid = root.querySelector('#featured-grid');
      root.querySelectorAll('[data-list]').forEach((tab) =>
        tab.addEventListener('click', () => {
          root.querySelectorAll('[data-list]').forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
          const list = tab.dataset.list === 'new' ? newArrivals : bestsellers;
          grid.innerHTML = list.map(productCard).join('');
          [...grid.children].forEach((c, i) => { c.classList.add('reveal'); c.style.setProperty('--delay', `${i * 60}ms`); requestAnimationFrame(() => requestAnimationFrame(() => c.classList.add('is-visible'))); });
        }),
      );
      // Arrow-key support for the tablist
      root.querySelector('.segmented').addEventListener('keydown', (e) => {
        if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
        const tabs = [...root.querySelectorAll('[data-list]')];
        const i = tabs.indexOf(document.activeElement);
        const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
        next.focus(); next.click();
      });
      bindNewsletter(root);
    },
  };
}
