/**
 * Site-wide configuration.
 * Values marked PLACEHOLDER must be confirmed by the client before launch.
 */
export const CONFIG = {
  siteName: 'The Upper Room',
  tagline: 'Gather Together, Brewing in Unity',
  currency: 'ZAR',
  locale: 'en-ZA',

  // Brand assets — drop the supplied logo file at this path.
  logoPath: '/assets/images/logo.png',

  // Contact — address exactly as supplied by the client.
  address: '5 Sandlewood, Lorraine, Unit 5',

  // PLACEHOLDER: the 1X Church Facebook URL has not been supplied yet.
  // Set this to the real page URL (e.g. "https://www.facebook.com/<page>") when confirmed.
  facebookUrl: null,
  facebookLabel: '1X Church',

  // Not supplied — intentionally left empty. Do not invent these.
  phone: null,
  email: null,

  // PLACEHOLDER commercial terms (for demo calculations only — to be agreed with the client).
  platformFeeRate: 0.10, // 10% Upper Room fee deducted from seller earnings
  deliveryFee: 95, // flat courier fee in ZAR
  freeDeliveryThreshold: 950,
  collectionPoint: 'The Upper Room — 5 Sandlewood, Lorraine, Unit 5',

  // Future integration notes (not active in the prototype).
  paymentProvider: 'Yoco',
  demoMode: true,
};

export const mapsQuery = encodeURIComponent(CONFIG.address);
export const mapsEmbedUrl = `https://www.google.com/maps?q=${mapsQuery}&output=embed`;
export const mapsLinkUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
