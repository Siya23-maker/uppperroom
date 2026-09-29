import { prefersReducedMotion } from '../utils/dom.js';

let observer;

/** Scroll-reveal with optional stagger for grids: add .reveal (and data-stagger on a parent). */
export function initReveal(root = document) {
  const items = [...root.querySelectorAll('.reveal:not(.is-visible)')];
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  root.querySelectorAll('[data-stagger]').forEach((group) => {
    [...group.children].forEach((child, i) => {
      child.classList.add('reveal');
      child.style.setProperty('--delay', `${Math.min(i, 8) * 70}ms`);
    });
  });
  root.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => observer.observe(el));
}
