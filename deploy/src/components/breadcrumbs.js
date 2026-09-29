import { esc } from '../utils/format.js';

/** crumbs: [{ label, href? }] — last item is the current page. */
export const breadcrumbs = (crumbs) => `
  <nav class="breadcrumbs container" aria-label="Breadcrumb">
    <ol>
      <li><a href="/">Home</a></li>
      ${crumbs
        .map((c, i) =>
          i === crumbs.length - 1 || !c.href
            ? `<li><span aria-current="page">${esc(c.label)}</span></li>`
            : `<li><a href="${c.href}">${esc(c.label)}</a></li>`,
        )
        .join('')}
    </ol>
  </nav>`;
