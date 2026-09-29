import { db } from '../store/db.js';
import { breadcrumbs } from '../components/breadcrumbs.js';
import { icon } from '../components/icons.js';
import { img } from '../components/cards.js';
import { IMG } from '../data/images.js';
import { CATEGORIES } from '../data/categories.js';
import { esc } from '../utils/format.js';
import { withBusy } from '../utils/dom.js';
import { validateForm, liveValidate, demoCallout } from './shared.js';

const STEPS = ['About you', 'Your business', 'Confirm'];

export function sellerApplyPage() {
  return {
    title: 'Become a Seller',
    nav: 'sell',
    description: 'Church-member businesses can apply to open a storefront at The Upper Room.',
    html: `
    ${breadcrumbs([{ label: 'Become a Seller' }])}
    <header class="page-hero container seller-hero">
      <div>
        <p class="eyebrow">Become a seller</p>
        <h1>Open your storefront in the Upper Room</h1>
        <p class="lead">If you run a business and belong to our church family, we’d love to give your work a home here. Tell us a little about yourself and what you make.</p>
        <ul class="tick-list">
          <li>${icon('check')} One shared checkout — The Upper Room handles payments</li>
          <li>${icon('check')} Your own storefront page and seller dashboard</li>
          <li>${icon('check')} Regular payouts of your earnings, after a platform fee <span class="placeholder-note">Fee TBC</span></li>
        </ul>
      </div>
      <div class="seller-hero__img">${img(IMG.notebook, 'A maker’s notebook on a desk — placeholder image', { label: 'Maker' })}</div>
    </header>

    <section class="container container--narrow section--tight" aria-labelledby="apply-title" id="apply">
      <div class="card apply-card" id="apply-card">
        <h2 id="apply-title" class="sr-only">Seller application</h2>
        <ol class="stepper" aria-label="Application progress">
          ${STEPS.map((s, i) => `<li data-step-ind="${i}" ${i === 0 ? 'aria-current="step"' : ''}><span>${i + 1}</span>${s}</li>`).join('')}
        </ol>
        <form id="apply-form" novalidate>
          <fieldset class="apply-step" data-step="0">
            <legend class="h3">About you</legend>
            <div class="form-grid">
              <div class="field"><label for="a-name">Full name <span class="req">*</span></label><input class="input" id="a-name" name="owner" required autocomplete="name"></div>
              <div class="field"><label for="a-email">Email <span class="req">*</span></label><input class="input" id="a-email" name="email" type="email" required autocomplete="email"></div>
              <div class="field"><label for="a-phone">Mobile number <span class="req">*</span></label><input class="input" id="a-phone" name="phone" type="tel" required data-phone placeholder="082 123 4567" autocomplete="tel"></div>
              <div class="field"><label for="a-attend">How long have you attended? <span class="req">*</span></label>
                <select class="select" id="a-attend" name="attending" required><option value="">Choose…</option><option>Less than 1 year</option><option>1–3 years</option><option>3–5 years</option><option>More than 5 years</option></select></div>
              <div class="field span-2"><label for="a-ministry">Small group or ministry (optional)</label><input class="input" id="a-ministry" name="ministry" placeholder="e.g. Tuesday home group, worship team"></div>
              <div class="span-2"><label class="check"><input type="checkbox" name="member" required data-label="Church membership"> I confirm I am a member of the church community. <span class="req">*</span></label></div>
            </div>
          </fieldset>

          <fieldset class="apply-step" data-step="1" hidden>
            <legend class="h3">Your business</legend>
            <div class="form-grid">
              <div class="field"><label for="a-biz">Business name <span class="req">*</span></label><input class="input" id="a-biz" name="businessName" required></div>
              <div class="field"><label for="a-cat">Main category <span class="req">*</span></label>
                <select class="select" id="a-cat" name="category" required><option value="">Choose…</option>${CATEGORIES.map((c) => `<option>${c.name}</option>`).join('')}<option>Other</option></select></div>
              <div class="field"><label for="a-suburb">Suburb <span class="req">*</span></label><input class="input" id="a-suburb" name="suburb" required placeholder="e.g. Lorraine"></div>
              <div class="field"><label for="a-city">City / town <span class="req">*</span></label><input class="input" id="a-city" name="city" required placeholder="e.g. Gqeberha"></div>
              <div class="field span-2"><label for="a-desc">What do you make or sell? <span class="req">*</span></label>
                <textarea class="textarea" id="a-desc" name="description" required data-min="40" placeholder="Tell us about your products, how they're made and what makes them special."></textarea>
                <p class="field-hint"><span id="desc-count">0</span> / 40 characters minimum</p></div>
              <div class="field span-2"><label for="a-link">Website or social media link (optional)</label><input class="input" id="a-link" name="link" type="url" placeholder="https://"></div>
              <div class="field span-2"><label for="a-photos">Product photos (optional)</label><input class="input" id="a-photos" name="photos" type="file" accept="image/*" multiple>
                <p class="field-hint">Prototype only — files stay on your device and are not uploaded.</p></div>
            </div>
          </fieldset>

          <fieldset class="apply-step" data-step="2" hidden>
            <legend class="h3">Review & confirm</legend>
            <div id="apply-review" class="review-list"></div>
            <div class="stack" style="margin-top:1rem">
              <label class="check"><input type="checkbox" name="terms" required data-label="Seller terms"> I agree to the seller terms and platform fee. <span class="placeholder-note">Terms pending</span> <span class="req">*</span></label>
              <label class="check"><input type="checkbox" name="updates"> Keep me updated about seller workshops and markets.</label>
            </div>
            ${demoCallout('<strong>Demo mode:</strong> submitting creates a sample application in this browser only. Nothing is emailed or sent to a server.')}
          </fieldset>

          <div class="apply-nav">
            <button class="btn btn--ghost" type="button" data-back hidden>${icon('arrowLeft')} Back</button>
            <button class="btn" type="button" data-next>Continue ${icon('arrow')}</button>
            <button class="btn" type="submit" data-submit hidden>Submit application</button>
          </div>
        </form>
      </div>
    </section>`,

    mount(root) {
      const form = root.querySelector('#apply-form');
      const card = root.querySelector('#apply-card');
      liveValidate(form);
      let step = 0;
      const steps = [...form.querySelectorAll('[data-step]')];
      const show = (n) => {
        step = n;
        steps.forEach((s, i) => (s.hidden = i !== n));
        root.querySelectorAll('[data-step-ind]').forEach((li, i) => {
          li.classList.toggle('is-done', i < n);
          if (i === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
        });
        form.querySelector('[data-back]').hidden = n === 0;
        form.querySelector('[data-next]').hidden = n === steps.length - 1;
        form.querySelector('[data-submit]').hidden = n !== steps.length - 1;
        if (n === 2) renderReview();
        steps[n].querySelector('legend').setAttribute('tabindex', '-1');
        steps[n].querySelector('legend').focus();
        card.scrollIntoView({ block: 'start', behavior: 'smooth' });
      };
      const validStep = () => validateForm(steps[step]);
      form.querySelector('[data-next]').addEventListener('click', () => { if (validStep()) show(step + 1); });
      form.querySelector('[data-back]').addEventListener('click', () => show(step - 1));

      const desc = form.querySelector('#a-desc');
      desc.addEventListener('input', () => (root.querySelector('#desc-count').textContent = desc.value.trim().length));

      const renderReview = () => {
        const fd = new FormData(form);
        const rows = [
          ['Name', fd.get('owner')], ['Email', fd.get('email')], ['Mobile', fd.get('phone')], ['Attending', fd.get('attending')],
          ['Business', fd.get('businessName')], ['Category', fd.get('category')], ['Location', `${fd.get('suburb')}, ${fd.get('city')}`],
          ['Description', fd.get('description')],
        ];
        root.querySelector('#apply-review').innerHTML = `<dl>${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v || '—')}</dd></div>`).join('')}</dl>
          <button type="button" class="remove-btn" data-edit>Edit details</button>`;
        root.querySelector('[data-edit]').addEventListener('click', () => show(0));
      };

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (step !== 2) { if (validStep()) show(step + 1); return; }
        if (!validStep()) return;
        const fd = new FormData(form);
        let app;
        await withBusy(form.querySelector('[data-submit]'), () => {
          app = db.addApplication({
            businessName: fd.get('businessName'), owner: fd.get('owner'), category: fd.get('category'),
            email: fd.get('email'), churchMember: true, description: fd.get('description'),
            location: `${fd.get('suburb')}, ${fd.get('city')}`,
          });
        }, 900);
        card.innerHTML = `
          <div class="confirm" role="status" tabindex="-1">
            <span class="confirm__icon">${icon('check')}</span>
            <p class="eyebrow eyebrow--center">Application received · Demo</p>
            <h2>Thank you, ${esc(String(fd.get('owner')).split(' ')[0])}!</h2>
            <p class="lead" style="margin-inline:auto">Your application for <strong>${esc(app.businessName)}</strong> is now <span class="badge badge--gold">Pending approval</span></p>
            <p class="muted">Reference <strong>${app.id}</strong>. In the live marketplace, the Upper Room team would review your application and contact you. In this prototype, you can approve it yourself from the admin dashboard.</p>
            <ol class="timeline" aria-label="Application status">
              <li class="is-done">Submitted</li><li class="is-current">Under review</li><li>Approved</li><li>Storefront live</li>
            </ol>
            <div class="row" style="justify-content:center;margin-top:2rem">
              <a class="btn" href="/admin?tab=applications" data-as-admin>Review as admin (demo)</a>
              <a class="btn btn--ghost" href="/businesses">Browse businesses</a>
            </div>
          </div>`;
        card.querySelector('.confirm').focus();
        card.querySelector('[data-as-admin]').addEventListener('click', () => db.setRole('admin'));
      });
    },
  };
}
