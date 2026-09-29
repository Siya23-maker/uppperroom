/**
 * Placeholder photography (Unsplash, free-to-use licence).
 * These are ILLUSTRATIVE stock images only — they are NOT photographs of actual
 * client or seller products. Replace with real product photography before launch.
 * If an image fails to load, the UI swaps in a branded illustrated placeholder.
 */
const u = (id, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

export const IMG = {
  // Home & decor
  livingRoom: u('photo-1513519245088-0e12902e5a38'),
  interiorSofa: u('photo-1586023492125-27b2c045efd7'),
  interiorWarm: u('photo-1484101403633-562f891dc89a'),
  plantPot: u('photo-1485955900006-10f4d324d411'),
  candle: u('photo-1603006905003-be475563bc59'),
  // Bedding
  bedLinen: u('photo-1522771739844-6a9f6d5f14af'),
  bedroom: u('photo-1505693416388-ac5ce068fe85'),
  linenFold: u('photo-1584100936595-c0654b55a2e2'),
  // Drinkware & bottles
  mug: u('photo-1514228742587-6b1558fcca3d'),
  coffeeCup: u('photo-1495474472287-4d71bcdd2085'),
  latte: u('photo-1509042239860-f550ce710b93'),
  bottle: u('photo-1602143407151-7111542de6e8'),
  // Stationery & scripture
  notebook: u('photo-1544816155-12df9643f363'),
  journal: u('photo-1531346878377-a5be20888e57'),
  openBible: u('photo-1504052434569-70ad5836ab65'),
  bookCandle: u('photo-1519682337058-a94d519337bc'),
  // Apparel
  tee: u('photo-1521572163474-6864f9cf17ab'),
  hoodie: u('photo-1556821840-3a63f95609a7'),
  // Gifts
  giftBox: u('photo-1549465220-1a8b9238cd48'),
  // Community / fellowship
  fellowship: u('photo-1529156069898-49953e39b3ac', 1400),
  gathering: u('photo-1511632765486-a01980e01a18', 1400),
  hero: u('photo-1495474472287-4d71bcdd2085', 1400),
};
