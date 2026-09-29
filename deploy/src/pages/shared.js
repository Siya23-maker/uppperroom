import { db } from '../store/db.js';
import { icon } from '../components/icons.js';
import { withBusy } from '../utils/dom.js';

/* ——— Form validation helpers shared by all forms ——— */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const SA_PHONE_RE = /^(\+27|0)[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{4}$/;

/**
 * Validate a form using data attributes on fields:
 *  required, type=email, data-phone, data-min="n", data-match="#id"
 * Shows inline errors, links them with aria-describedby, focuses the first error.
 */
export function validateForm(form) {
  let first = null;
  const errors = [];
  form.querySelectorAll('input, select, textarea').forEach((el) => {
    if (el.disabled || el.closest('[hidden]') || el.type === 'hidden') return;
    const field = el.closest('.field') ?? el.closest('.check')?.parentElement;
    const v = el.type === 'checkbox' ? el.checked : el.value.trim();
    let msg = '';
    const label = el.dataset.label || field?.querySelector('label')?.textContent.replace('*', '').trim() || 'This field';
    if (el.required && (el.type === 'checkbox' ? !v : !v)) msg = el.type === 'checkbox' ? 'Please confirm to continue.' : `${label} is required.`;
    else if (v && el.type === 'email' && !EMAIL_RE.test(v)) msg = 'Enter a valid email address, e.g. name@example.com.';
    else if (v && el.dataset.phone !== undefined && !SA_PHONE_RE.test(v)) msg = 'Enter a South African number, e.g. 082 123 4567.';
    else if (v && el.dataset.min && v.length < Number(el.dataset.min)) msg = `Please write at least ${el.dataset.min} characters.`;
    else if (v && el.dataset.postal !== undefined && !/^\d{4}$/.test(v)) msg = 'Postal codes have 4 digits.';
    setFieldError(el, msg);
    if (msg) { errors.push(msg); first ??= el; }
  });
  if (first) first.focus();
  return errors.length === 0;
}

export function setFieldError(el, msg) {
  const field = el.closest('.field') ?? el.closest('.check');
  if (!field) return;
  let err = field.querySelector('.field-error');
  if (!err) {
    err = document.createElement('p');
    err.className = 'field-error';
    err.id = `${el.id || el.name}-error`;
    field.appendChild(err);
  }
  err.textContent = msg;
  field.classList.toggle('has-error', Boolean(msg));
  if (msg) { el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', err.id); }
  else { el.removeAttribute('aria-invalid'); }
}

/** Clear an error as soon as the user fixes it. */
export function liveValidate(form) {
  form.addEventListener('input', (e) => {
    const field = e.target.closest('.field, .check');
    if (field?.classList.contains('has-error')) setFieldError(e.target, '');
  });
  form.addEventListener('change', (e) => {
    const field = e.target.closest('.field, .check');
    if (field?.classList.contains('has-error')) setFieldError(e.target, '');
  });
}

export const newsletterSection = () => `
  <section class="section newsletter" aria-labelledby="newsletter-title">
    <div class="container container--narrow center reveal">
      <span class="newsletter__mark" aria-hidden="true">${icon('mail')}</span>
      <p class="eyebrow eyebrow--center">Stay in the room</p>
      <h2 id="newsletter-title">News from our makers, gently delivered</h2>
      <p class="lead">New pieces, seasonal gifts and stories from the businesses in our church family. No spam — just good news.</p>
      <form class="newsletter__form" novalidate data-newsletter>
        <div class="field">
          <label for="nl-email" class="sr-only">Email address</label>
          <input class="input" id="nl-email" name="email" type="email" required placeholder="Your email address" autocomplete="email" data-label="Email address">
        </div>
        <button class="btn" type="submit">Subscribe</button>
      </form>
      <p class="small muted" style="margin-top:.75rem">Demo only — addresses are stored in this browser and are not sent anywhere.</p>
    </div>
  </section>`;

export function bindNewsletter(root) {
  const form = root.querySelector('[data-newsletter]');
  if (!form) return;
  liveValidate(form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;
    const email = form.email.value.trim();
    await withBusy(form.querySelector('button'), () => db.addNewsletter(email));
    form.outerHTML = `<div class="success-inline" role="status">${icon('check')} <span>Thank you! <b>${email.replace(/[<>&"]/g, '')}</b> has been added to the demo list. (No email was sent.)</span></div>`;
  });
}

export const demoCallout = (html) => `<div class="demo-callout" role="note">${icon('info')}<div>${html}</div></div>`;
