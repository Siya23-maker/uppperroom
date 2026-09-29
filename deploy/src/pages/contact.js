import { CONFIG, mapsEmbedUrl, mapsLinkUrl } from '../config.js';
import { db } from '../store/db.js';
import { breadcrumbs } from '../components/breadcrumbs.js';
import { icon } from '../components/icons.js';
import { toast } from '../components/toast.js';
import { esc } from '../utils/format.js';
import { withBusy } from '../utils/dom.js';
import { validateForm, liveValidate } from './shared.js';

export function contactPage() {
  const fb = CONFIG.facebookUrl;
  return {
    title: 'Contact Us',
    nav: 'contact',
    description: `Visit The Upper Room at ${CONFIG.address}, or send us a message.`,
    html: `
    ${breadcrumbs([{ label: 'Contact Us' }])}
    <header class="page-hero container">
      <p class="eyebrow">Contact us</p>
      <h1>Come and visit, or send a note</h1>
      <p class="lead">Questions about an order, a seller or the marketplace? We’d love to hear from you.</p>
    </header>

    <section class="container contact" aria-label="Contact details and form">
      <div class="contact__info">
        <article class="card contact-card">
          <span class="contact-card__icon">${icon('pin')}</span>
          <div>
            <h2 class="h4">Find us</h2>
            <address>${esc(CONFIG.address)}</address>
            <a class="link-arrow" href="${mapsLinkUrl}" target="_blank" rel="noopener">Open in Google Maps ${icon('external')}<span class="sr-only"> (opens in a new tab)</span></a>
          </div>
        </article>

        <article class="card contact-card" id="facebook">
          <span class="contact-card__icon">${icon('facebook')}</span>
          <div>
            <h2 class="h4">Follow along</h2>
            <p class="small muted">News, events and new makers are shared on Facebook.</p>
            ${fb
              ? `<a class="btn btn--sm fb-btn" href="${fb}" target="_blank" rel="noopener">${icon('facebook')} ${CONFIG.facebookLabel}<span class="sr-only"> on Facebook (opens in a new tab)</span></a>`
              : `<button class="btn btn--sm fb-btn" type="button" data-fb-pending aria-describedby="fb-note">${icon('facebook')} ${CONFIG.facebookLabel}</button>
                 <p class="small muted" id="fb-note" style="margin-top:.5rem"><span class="placeholder-note">Facebook link pending</span></p>`}
          </div>
        </article>

        <article class="card contact-card">
          <span class="contact-card__icon">${icon('mail')}</span>
          <div>
            <h2 class="h4">Phone & email</h2>
            <p class="small muted" style="margin:0">To be confirmed by the church. <span class="placeholder-note">Pending</span></p>
          </div>
        </article>
      </div>

      <form class="card contact__form" id="contact-form" novalidate aria-labelledby="contact-form-title">
        <h2 id="contact-form-title" class="h3">Send us a message</h2>
        <div class="form-grid">
          <div class="field"><label for="c-name">Your name <span class="req">*</span></label><input class="input" id="c-name" name="name" required autocomplete="name"></div>
          <div class="field"><label for="c-email">Email <span class="req">*</span></label><input class="input" id="c-email" name="email" type="email" required autocomplete="email"></div>
          <div class="field"><label for="c-phone">Phone (optional)</label><input class="input" id="c-phone" name="phone" type="tel" data-phone placeholder="082 123 4567" autocomplete="tel"></div>
          <div class="field"><label for="c-topic">Topic <span class="req">*</span></label>
            <select class="select" id="c-topic" name="topic" required><option value="">Choose a topic…</option><option>An order</option><option>A seller or product</option><option>Becoming a seller</option><option>Visiting The Upper Room</option><option>Something else</option></select></div>
          <div class="field span-2"><label for="c-msg">Message <span class="req">*</span></label><textarea class="textarea" id="c-msg" name="message" required data-min="10"></textarea></div>
        </div>
        <p class="small muted">Demo form — messages are validated and saved only in this browser. No email is sent.</p>
        <button class="btn" type="submit">Send message</button>
      </form>
    </section>

    <section class="container section--tight" id="map" aria-labelledby="map-title">
      <div class="map-card">
        <div class="map-card__head">
          <h2 id="map-title" class="h3" style="margin:0">Map</h2>
          <a class="link-arrow" href="${mapsLinkUrl}" target="_blank" rel="noopener">Directions ${icon('external')}<span class="sr-only"> (opens Google Maps in a new tab)</span></a>
        </div>
        <div class="map-frame">
          <iframe title="Map showing ${esc(CONFIG.address)}" src="${mapsEmbedUrl}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
        </div>
        <p class="small muted" style="margin:.75rem 0 0">Map location is looked up from the address “${esc(CONFIG.address)}” — please confirm the pin with the church before launch.</p>
      </div>
    </section>`,

    mount(root) {
      root.querySelector('[data-fb-pending]')?.addEventListener('click', () =>
        toast(`The ${CONFIG.facebookLabel} Facebook page link hasn't been supplied yet — it will open here once added.`, { tone: 'info', duration: 5000 }),
      );
      const form = root.querySelector('#contact-form');
      liveValidate(form);
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateForm(form)) return;
        const data = Object.fromEntries(new FormData(form));
        await withBusy(form.querySelector('[type="submit"]'), () => db.addMessage(data), 900);
        form.innerHTML = `
          <div class="confirm" role="status" tabindex="-1">
            <span class="confirm__icon">${icon('check')}</span>
            <h2>Message saved (demo)</h2>
            <p class="lead" style="margin-inline:auto">Thank you, ${esc(data.name.split(' ')[0])}. Your message passed validation and was stored in this browser for the demo.</p>
            <p class="muted small"><strong>No email was sent.</strong> In the live site, this form will deliver to the church’s confirmed inbox.</p>
            <button class="btn btn--ghost" type="button" data-again>Send another message</button>
          </div>`;
        form.querySelector('.confirm').focus();
        form.querySelector('[data-again]').addEventListener('click', () => location.reload());
      });
    },
  };
}
