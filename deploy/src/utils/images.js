/**
 * Branded illustrated fallback used when a placeholder photo cannot load
 * (e.g. offline demo). Keeps layouts intact and clearly reads as a placeholder.
 */
const PALETTES = [
  ['#EAD8D8', '#722F45'],
  ['#E6E7DF', '#5E6752'],
  ['#F1E6D2', '#8A6A35'],
  ['#EFE6DA', '#44271F'],
];

export function placeholderImage(label = 'Image placeholder', seed = 0) {
  const [bg, fg] = PALETTES[Math.abs(seed) % PALETTES.length];
  const safe = String(label).replace(/[<>&"]/g, '').slice(0, 40);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="${bg}"/>
  <g fill="none" stroke="${fg}" stroke-width="3" opacity=".55" stroke-linecap="round" stroke-linejoin="round">
    <path d="M190 300 L300 215 L410 300"/>
    <path d="M215 290 V390 H385 V290"/>
    <path d="M300 225 V262"/><circle cx="300" cy="272" r="10"/>
    <path d="M250 410 C290 440 330 440 370 405"/>
    <path d="M290 428 c-8 -12 -22 -14 -30 -8 M320 430 c6 -13 20 -17 29 -12"/>
  </g>
  <text x="300" y="480" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="${fg}" opacity=".8">${safe}</text>
  <text x="300" y="510" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" letter-spacing="2" fill="${fg}" opacity=".55">PLACEHOLDER IMAGE</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Global capture-phase listener: any <img data-fallback> that errors gets the placeholder. */
export function installImageFallback() {
  document.addEventListener(
    'error',
    (e) => {
      const img = e.target;
      if (!(img instanceof HTMLImageElement) || !img.dataset.fallback || img.dataset.fellBack) return;
      img.dataset.fellBack = '1';
      img.src = placeholderImage(img.dataset.fallback, img.dataset.fallback.length);
    },
    true,
  );
}
