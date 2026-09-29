import { icon } from '../components/icons.js';

export function notFoundPage({ what = 'page', error = false } = {}) {
  return {
    title: 'Not found',
    html: `
    <section class="section">
      <div class="container container--narrow center">
        <div class="empty-state">
          <span class="empty-state__icon">${icon('home')}</span>
          <p class="eyebrow eyebrow--center">${error ? 'Something went wrong' : '404'}</p>
          <h1>We couldn’t find that ${what}</h1>
          <p class="lead">It may have moved, or the link may be mistyped. Let’s get you back to the room.</p>
          <div class="row" style="justify-content:center"><a class="btn" href="/">Go home</a><a class="btn btn--ghost" href="/shop">Browse the shop</a></div>
        </div>
      </div>
    </section>`,
  };
}
