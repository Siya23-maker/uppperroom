import { IMG } from './images.js';

/**
 * DEMO PRODUCT CATALOGUE — fictional products for the prototype.
 * Images are illustrative stock photography, not actual seller products.
 * Prices in ZAR (whole rand). Variant options may carry a price delta.
 *
 * Firebase note: each object maps 1:1 to a future `products/{id}` document.
 */
const opt = (label, delta = 0) => ({ label, delta });

export const PRODUCTS = [
  // ——— Rooted · Decor ———
  {
    id: 'p01', slug: 'be-still-scripture-board', name: '“Be Still” Scripture Board',
    businessId: 'biz-rooted', category: 'decor', price: 485, compareAt: null, stock: 14,
    images: [IMG.livingRoom, IMG.interiorWarm, IMG.plantPot],
    variants: [{ name: 'Size', options: [opt('A4'), opt('A3', 140), opt('A2', 320)] }, { name: 'Finish', options: [opt('Natural oak'), opt('Whitewash')] }],
    summary: 'Hand-lettered Psalm 46:10 on sustainably sourced timber.',
    description: 'A calm, hand-lettered reminder of Psalm 46:10, printed onto a sanded pine board and sealed with a soft matte finish. Ready to hang or lean on a shelf.',
    details: ['Sustainably sourced pine', 'Matte water-based sealant', 'Hanging cord included', 'Made to order in 3–5 working days'],
    tags: ['scripture', 'wall art', 'bestseller'], featured: true, isNew: false, rating: 4.9,
  },
  {
    id: 'p02', slug: 'olive-branch-soy-candle', name: 'Olive Branch Soy Candle',
    businessId: 'biz-rooted', category: 'decor', price: 245, compareAt: 295, stock: 32,
    images: [IMG.candle, IMG.bookCandle],
    variants: [{ name: 'Scent', options: [opt('Olive & Fig'), opt('Frankincense'), opt('Fynbos Morning')] }],
    summary: 'Hand-poured soy wax in a reusable amber jar.',
    description: 'Hand-poured soy candle with a cotton wick and a gentle, clean burn of around 40 hours. The amber jar is etched with a small olive branch — a symbol of peace.',
    details: ['220 g soy wax', 'Approx. 40-hour burn', 'Cotton wick', 'Reusable glass jar'],
    tags: ['candle', 'gift'], featured: true, isNew: false, rating: 4.8,
  },
  {
    id: 'p03', slug: 'his-mercies-table-runner', name: '“His Mercies” Linen Table Runner',
    businessId: 'biz-rooted', category: 'decor', price: 395, compareAt: null, stock: 9,
    images: [IMG.interiorSofa, IMG.interiorWarm],
    variants: [{ name: 'Length', options: [opt('180 cm'), opt('240 cm', 90)] }],
    summary: 'Embroidered Lamentations 3:23 for the family table.',
    description: 'A washed-linen runner with a subtle embroidered line from Lamentations 3:23 — made for long Sunday lunches and slow conversations.',
    details: ['100% washed linen', 'Embroidered detail', 'Machine washable, cold'],
    tags: ['table', 'linen'], featured: false, isNew: true, rating: 4.7,
  },
  {
    id: 'p04', slug: 'upper-room-ceramic-planter', name: 'Upper Room Ceramic Planter',
    businessId: 'biz-rooted', category: 'decor', price: 360, compareAt: null, stock: 0,
    images: [IMG.plantPot, IMG.livingRoom],
    variants: [{ name: 'Colour', options: [opt('Sage'), opt('Ivory'), opt('Terracotta')] }],
    summary: 'Hand-thrown planter with drainage saucer.',
    description: 'A hand-thrown stoneware planter finished in a soft reactive glaze. Pairs beautifully with a small olive tree or trailing pothos.',
    details: ['Stoneware', '14 cm diameter', 'Includes saucer'],
    tags: ['plant', 'ceramic'], featured: false, isNew: false, rating: 4.6,
  },

  // ——— Sabbath Rest Linen Co. · Bedding ———
  {
    id: 'p05', slug: 'still-waters-linen-duvet-set', name: '“Still Waters” Linen Duvet Set',
    businessId: 'biz-sabbath', category: 'bedding', price: 2450, compareAt: null, stock: 7,
    images: [IMG.bedLinen, IMG.bedroom, IMG.linenFold],
    variants: [{ name: 'Size', options: [opt('Double'), opt('Queen', 300), opt('King', 650)] }, { name: 'Colour', options: [opt('Oat'), opt('Dusty rose'), opt('Sage')] }],
    summary: 'Stonewashed linen duvet cover with two pillowcases.',
    description: 'Named for Psalm 23:2, this stonewashed linen set softens with every wash. Breathable in Eastern Cape summers and cosy through winter.',
    details: ['100% European flax linen', 'Duvet cover + 2 pillowcases', 'Button closure', 'Pre-washed for softness'],
    tags: ['linen', 'bestseller'], featured: true, isNew: false, rating: 4.9,
  },
  {
    id: 'p06', slug: 'sabbath-waffle-throw', name: 'Sabbath Waffle Throw',
    businessId: 'biz-sabbath', category: 'bedding', price: 890, compareAt: 1050, stock: 18,
    images: [IMG.linenFold, IMG.bedroom],
    variants: [{ name: 'Colour', options: [opt('Ivory'), opt('Burgundy'), opt('Sage')] }],
    summary: 'Cotton waffle throw for slow Sunday afternoons.',
    description: 'A generous cotton waffle-weave throw with fringed ends — made for resting, reading and sabbath afternoons.',
    details: ['100% cotton', '130 × 170 cm', 'Fringed edge'],
    tags: ['throw'], featured: true, isNew: false, rating: 4.8,
  },
  {
    id: 'p07', slug: 'blessing-pillowcase-pair', name: 'Blessing Pillowcase Pair',
    businessId: 'biz-sabbath', category: 'bedding', price: 520, compareAt: null, stock: 24,
    images: [IMG.bedroom, IMG.bedLinen],
    variants: [{ name: 'Style', options: [opt('Plain'), opt('Numbers 6:24 embroidery', 80)] }],
    summary: 'Pair of linen pillowcases, optional embroidered blessing.',
    description: 'A pair of standard linen pillowcases, optionally embroidered with “The Lord bless you and keep you.”',
    details: ['Set of 2', '50 × 75 cm', 'Envelope closure'],
    tags: ['linen', 'gift'], featured: false, isNew: true, rating: 4.7,
  },
  {
    id: 'p08', slug: 'morning-mercy-bed-runner', name: 'Morning Mercy Bed Runner',
    businessId: 'biz-sabbath', category: 'bedding', price: 640, compareAt: null, stock: 3,
    images: [IMG.bedLinen, IMG.linenFold],
    variants: [{ name: 'Bed size', options: [opt('Queen'), opt('King', 80)] }],
    summary: 'Textured runner to finish a made bed.',
    description: 'A textured cotton-linen blend runner in warm tones, finished with tassels — the final flourish for a made bed.',
    details: ['Cotton-linen blend', 'Tasselled ends'],
    tags: ['linen'], featured: false, isNew: false, rating: 4.5,
  },

  // ——— Living Water Vessels · Drinkware & bottles ———
  {
    id: 'p09', slug: 'brewing-in-unity-stoneware-mug', name: '“Brewing in Unity” Stoneware Mug',
    businessId: 'biz-livingwater', category: 'drinkware', price: 195, compareAt: null, stock: 60,
    images: [IMG.mug, IMG.coffeeCup, IMG.latte],
    variants: [{ name: 'Glaze', options: [opt('Speckled ivory'), opt('Burgundy'), opt('Sage')] }],
    summary: 'Hand-glazed 350 ml mug for fellowship coffee.',
    description: 'A generous 350 ml stoneware mug with a hand-dipped glaze — made for the coffee that gets poured when people gather.',
    details: ['350 ml', 'Dishwasher & microwave safe', 'Each glaze is unique'],
    tags: ['coffee', 'bestseller', 'gift'], featured: true, isNew: false, rating: 5.0,
  },
  {
    id: 'p10', slug: 'fellowship-espresso-cup-set', name: 'Fellowship Espresso Cup Set',
    businessId: 'biz-livingwater', category: 'drinkware', price: 420, compareAt: null, stock: 15,
    images: [IMG.latte, IMG.coffeeCup],
    variants: [{ name: 'Set', options: [opt('Set of 2'), opt('Set of 4', 330)] }],
    summary: '90 ml espresso cups with matching saucers.',
    description: 'Small stoneware cups with saucers for after-service espresso. Each saucer carries a tiny gold-glaze cross.',
    details: ['90 ml cups', 'Saucers included', 'Hand wash recommended (gold detail)'],
    tags: ['coffee'], featured: false, isNew: true, rating: 4.8,
  },
  {
    id: 'p11', slug: 'john-4-14-insulated-bottle', name: 'John 4:14 Insulated Bottle',
    businessId: 'biz-livingwater', category: 'bottles', price: 380, compareAt: 420, stock: 40,
    images: [IMG.bottle],
    variants: [{ name: 'Size', options: [opt('500 ml'), opt('750 ml', 60)] }, { name: 'Colour', options: [opt('Burgundy'), opt('Ivory'), opt('Espresso')] }],
    summary: 'Double-walled steel bottle, 24h cold / 12h hot.',
    description: '“Whoever drinks the water I give them will never thirst.” A double-walled stainless-steel bottle with a laser-etched verse.',
    details: ['18/8 stainless steel', 'Cold 24h · Hot 12h', 'Leak-proof bamboo lid'],
    tags: ['bottle', 'bestseller'], featured: true, isNew: false, rating: 4.9,
  },
  {
    id: 'p12', slug: 'kids-living-water-bottle', name: 'Kids’ Living Water Bottle',
    businessId: 'biz-livingwater', category: 'bottles', price: 220, compareAt: null, stock: 26,
    images: [IMG.bottle],
    variants: [{ name: 'Colour', options: [opt('Rose'), opt('Sage'), opt('Sky')] }],
    summary: '350 ml BPA-free bottle for Sunday school.',
    description: 'A lightweight, BPA-free bottle with a flip straw and name label — for Sunday school, holiday club and school bags.',
    details: ['350 ml', 'BPA-free', 'Name label included'],
    tags: ['kids', 'bottle'], featured: false, isNew: true, rating: 4.7,
  },
  {
    id: 'p13', slug: 'small-group-travel-tumbler', name: 'Small Group Travel Tumbler',
    businessId: 'biz-livingwater', category: 'drinkware', price: 310, compareAt: null, stock: 12,
    images: [IMG.coffeeCup, IMG.mug],
    variants: [{ name: 'Colour', options: [opt('Espresso'), opt('Ivory')] }],
    summary: 'Insulated 400 ml tumbler with slide lid.',
    description: 'An insulated tumbler for the drive to small group. Etched with “Where two or three gather” (Matthew 18:20).',
    details: ['400 ml', 'Slide lid', 'Fits most car cup holders'],
    tags: ['coffee', 'travel'], featured: false, isNew: false, rating: 4.6,
  },

  // ——— Mustard Seed Press · Stationery ———
  {
    id: 'p14', slug: 'daily-bread-prayer-journal', name: 'Daily Bread Prayer Journal',
    businessId: 'biz-mustard', category: 'stationery', price: 275, compareAt: null, stock: 45,
    images: [IMG.journal, IMG.notebook, IMG.openBible],
    variants: [{ name: 'Cover', options: [opt('Burgundy linen'), opt('Sage linen'), opt('Kraft')] }],
    summary: '52-week guided prayer & gratitude journal.',
    description: 'A linen-bound, lay-flat journal with 52 weeks of gentle prompts for prayer, scripture and gratitude.',
    details: ['A5, 208 pages', 'Lay-flat binding', '100 gsm cream paper', 'Ribbon marker'],
    tags: ['journal', 'bestseller', 'gift'], featured: true, isNew: false, rating: 4.9,
  },
  {
    id: 'p15', slug: 'scripture-memory-card-set', name: 'Scripture Memory Card Set',
    businessId: 'biz-mustard', category: 'stationery', price: 149, compareAt: null, stock: 70,
    images: [IMG.openBible, IMG.notebook],
    variants: [{ name: 'Translation', options: [opt('English'), opt('Afrikaans'), opt('isiXhosa')] }],
    summary: '30 letterpress verse cards in a keepsake box.',
    description: 'Thirty letterpress-printed verse cards for memorising scripture — tuck one into a lunchbox, a mirror or a Bible.',
    details: ['30 cards', 'Keepsake box', 'Letterpress on cotton card'],
    tags: ['scripture', 'cards'], featured: false, isNew: true, rating: 4.8,
  },
  {
    id: 'p16', slug: 'grace-notes-greeting-cards', name: 'Grace Notes Greeting Cards',
    businessId: 'biz-mustard', category: 'stationery', price: 180, compareAt: null, stock: 38,
    images: [IMG.notebook, IMG.journal],
    variants: [{ name: 'Pack', options: [opt('Thank you (6)'), opt('Encouragement (6)'), opt('Mixed (12)', 120)] }],
    summary: 'Blank letterpress cards with envelopes.',
    description: 'Blank letterpress cards for thank-yous and encouragement, with recycled kraft envelopes.',
    details: ['A6 folded', 'Envelopes included', 'Blank inside'],
    tags: ['cards'], featured: false, isNew: false, rating: 4.7,
  },

  // ——— Mustard Seed Press · Apparel ———
  {
    id: 'p17', slug: 'gather-together-cotton-tee', name: '“Gather Together” Cotton Tee',
    businessId: 'biz-mustard', category: 'apparel', price: 340, compareAt: null, stock: 50,
    images: [IMG.tee],
    variants: [{ name: 'Size', options: [opt('S'), opt('M'), opt('L'), opt('XL'), opt('XXL', 30)] }, { name: 'Colour', options: [opt('Ivory'), opt('Burgundy'), opt('Sage')] }],
    summary: 'Heavyweight cotton tee with embroidered wordmark.',
    description: 'A relaxed-fit, heavyweight cotton tee with small tonal embroidery on the chest: “Gather Together”.',
    details: ['220 gsm cotton', 'Relaxed fit', 'Embroidered detail'],
    tags: ['apparel', 'bestseller'], featured: true, isNew: false, rating: 4.8,
  },
  {
    id: 'p18', slug: 'upper-room-fleece-hoodie', name: 'Upper Room Fleece Hoodie',
    businessId: 'biz-mustard', category: 'apparel', price: 690, compareAt: 790, stock: 4,
    images: [IMG.hoodie],
    variants: [{ name: 'Size', options: [opt('S'), opt('M'), opt('L'), opt('XL')] }, { name: 'Colour', options: [opt('Espresso'), opt('Oat')] }],
    summary: 'Brushed-back fleece hoodie for winter services.',
    description: 'A soft brushed-back fleece hoodie with a small olive branch embroidered on the sleeve.',
    details: ['80% cotton / 20% polyester', 'Kangaroo pocket', 'Embroidered sleeve'],
    tags: ['apparel'], featured: false, isNew: true, rating: 4.9,
  },

  // ——— Gifts (mixed sellers) ———
  {
    id: 'p19', slug: 'fellowship-coffee-gift-hamper', name: 'Fellowship Coffee Gift Hamper',
    businessId: 'biz-livingwater', category: 'gifts', price: 750, compareAt: null, stock: 10,
    images: [IMG.giftBox, IMG.mug, IMG.coffeeCup],
    variants: [{ name: 'Card message', options: [opt('No card'), opt('Add blessing card', 25)] }],
    summary: 'Two mugs, locally roasted beans and a verse card.',
    description: 'A gift box with two “Brewing in Unity” mugs, 250 g of locally roasted coffee beans (sample supplier) and a hand-written verse card.',
    details: ['2 × stoneware mugs', '250 g coffee beans', 'Gift-wrapped'],
    tags: ['gift', 'coffee'], featured: true, isNew: false, rating: 5.0,
  },
  {
    id: 'p20', slug: 'baptism-keepsake-box', name: 'Baptism Keepsake Box',
    businessId: 'biz-rooted', category: 'gifts', price: 560, compareAt: null, stock: 6,
    images: [IMG.giftBox, IMG.bookCandle],
    variants: [{ name: 'Personalisation', options: [opt('None'), opt('Name & date engraving', 95)] }],
    summary: 'Engraved wooden box for baptism mementos.',
    description: 'A pine keepsake box with a sliding lid, optionally engraved with a name and baptism date — for certificates, photos and first Bibles.',
    details: ['Solid pine', '30 × 22 × 10 cm', 'Engraving adds 2 working days'],
    tags: ['gift', 'baptism'], featured: false, isNew: false, rating: 4.9,
  },
  {
    id: 'p21', slug: 'sabbath-rest-gift-set', name: 'Sabbath Rest Gift Set',
    businessId: 'biz-sabbath', category: 'gifts', price: 980, compareAt: 1120, stock: 8,
    images: [IMG.linenFold, IMG.candle, IMG.giftBox],
    variants: [{ name: 'Colour', options: [opt('Ivory'), opt('Dusty rose')] }],
    summary: 'Linen pillowcases, throw and candle — ready to gift.',
    description: 'A restful gift: a pair of linen pillowcases, a mini waffle throw and a Rooted olive-branch candle, boxed with tissue and ribbon.',
    details: ['Gift-boxed', 'Includes blessing card'],
    tags: ['gift', 'linen'], featured: false, isNew: true, rating: 4.8,
  },
];

export const getProduct = (id) => PRODUCTS.find((p) => p.id === id);
export const getProductBySlug = (slug) => PRODUCTS.find((p) => p.slug === slug);
