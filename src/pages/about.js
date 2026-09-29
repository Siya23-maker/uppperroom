import { IMG } from '../data/images.js';
import { img } from '../components/cards.js';
import { breadcrumbs } from '../components/breadcrumbs.js';
import { icon } from '../components/icons.js';
import { CONFIG } from '../config.js';

const ph = (text = 'Placeholder — pending client approval') => `<span class="placeholder-note">${icon('info')} ${text}</span>`;

export function aboutPage() {
  return {
    title: 'About Us',
    nav: 'about',
    description: 'The story behind The Upper Room — Gather Together, Brewing in Unity.',
    html: `
    ${breadcrumbs([{ label: 'About Us' }])}
    <header class="about-hero container">
      <div class="about-hero__copy">
        <p class="eyebrow">About The Upper Room</p>
        <h1>Gather together, <em>brewing in unity</em></h1>
        <p class="lead">An upper room is a place set apart — a room above the noise, where people gather, break bread and pray. We hope this marketplace can be a little like that.</p>
        ${ph('Draft brand story — all copy on this page is pending client approval')}
      </div>
      <div class="about-hero__img">${img(IMG.fellowship, 'Friends sharing a meal together — placeholder image', { eager: true, label: 'Fellowship' })}</div>
    </header>

    <section class="section" aria-labelledby="why-title">
      <div class="container container--narrow about-prose reveal">
        <h2 id="why-title">Why an Upper Room?</h2>
        <p class="dropcap">In the Book of Acts, the first believers met in an upper room — a humble, borrowed space where ordinary people became a family. They shared what they had, and no one was overlooked.</p>
        <p>The Upper Room marketplace carries that spirit into everyday life. It gathers the businesses of our church community under one warm roof, so that buying a mug, a linen set or a birthday gift can also be a way of standing with the people we worship alongside.</p>
        <p>Like coffee brewed slowly and shared generously, unity takes time. We believe good work, done faithfully and offered in love, can bring a community closer together.</p>
      </div>
    </section>

    <section class="section section--alt" aria-labelledby="values-title">
      <div class="container">
        <div class="section-head center" style="justify-content:center;flex-direction:column;align-items:center;text-align:center">
          <p class="eyebrow eyebrow--center">What we hold to</p><h2 id="values-title">Our draft values</h2>
        </div>
        <div class="values-cards" data-stagger>
          <article class="value-card">${icon('hands')}<h3>Fellowship</h3><p>Every storefront belongs to someone in our church family. Shopping here is a way of knowing one another.</p></article>
          <article class="value-card">${icon('leaf')}<h3>Craftsmanship</h3><p>We celebrate honest, beautiful work — made with care and offered with integrity.</p></article>
          <article class="value-card">${icon('cup')}<h3>Hospitality</h3><p>Like a table set for guests, we want every visitor to feel welcome, whether they belong to our church or not.</p></article>
          <article class="value-card">${icon('heart')}<h3>Generosity</h3><p>A shared marketplace helps small businesses grow together rather than alone.</p></article>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="how-title">
      <div class="container">
        <div class="section-head"><div><p class="eyebrow">How it works</p><h2 id="how-title">One room, many makers</h2></div></div>
        <ol class="steps" data-stagger>
          <li><span>01</span><h3>Members apply</h3><p>Church-member businesses apply to open a storefront and are reviewed by the Upper Room team.</p></li>
          <li><span>02</span><h3>You shop together</h3><p>Browse many makers and pay once in a single, secure checkout.</p></li>
          <li><span>03</span><h3>The Upper Room receives payment</h3><p>Payments are received by The Upper Room (via ${CONFIG.paymentProvider} at launch) and seller earnings are calculated separately.</p></li>
          <li><span>04</span><h3>Makers are paid out</h3><p>Sellers receive their earnings through approved payouts after orders are fulfilled.</p></li>
        </ol>
      </div>
    </section>

    <section class="section section--rose" aria-labelledby="pending-title">
      <div class="container container--narrow">
        <h2 id="pending-title">Still to come from the church</h2>
        <p class="muted">These sections are intentionally left blank so we don’t guess at details that matter.</p>
        <div class="placeholder-grid">
          <div class="placeholder-block"><h3>Our church’s story</h3>${ph('Awaiting content from the church')}<p class="muted small">History, vision and how The Upper Room began.</p></div>
          <div class="placeholder-block"><h3>Leadership & team</h3>${ph('Awaiting names & photos')}<p class="muted small">Who runs the marketplace and how to reach them.</p></div>
          <div class="placeholder-block"><h3>Partnerships</h3>${ph('None confirmed yet')}<p class="muted small">Any ministries or organisations the marketplace supports.</p></div>
          <div class="placeholder-block"><h3>Statement of faith</h3>${ph('Optional — to be supplied')}<p class="muted small">A short statement, or a link to the church’s own.</p></div>
        </div>
      </div>
    </section>

    <section class="section center" aria-label="Next steps">
      <div class="container container--narrow reveal">
        <h2>Come on up</h2>
        <p class="lead">Browse the collection, meet our makers, or visit us at ${CONFIG.address}.</p>
        <div class="row" style="justify-content:center"><a class="btn" href="/shop">Shop the collection</a><a class="btn btn--ghost" href="/contact">Find us</a></div>
      </div>
    </section>`,
  };
}
