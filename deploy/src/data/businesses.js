import { IMG } from './images.js';

/**
 * DEMO DATA — fictional storefronts for prototype purposes.
 * "Rooted" is named per the client brief; its description, location and details
 * below are sample content only and must be confirmed with the business owner.
 * All other businesses are entirely fictional.
 */
export const BUSINESSES = [
  {
    id: 'biz-rooted',
    slug: 'rooted',
    name: 'Rooted',
    category: 'Christian home decor',
    ownerName: 'Rooted owner (to be confirmed)',
    shortBio: 'Scripture-inspired decor for homes grounded in faith.',
    story:
      'Sample storefront copy: Rooted creates warm, handcrafted pieces for the home — scripture boards, olive-wood accents and candles — each designed to be a quiet reminder of whose we are. Final wording to be supplied by the business owner.',
    location: 'Gqeberha, Eastern Cape',
    since: 'Member business',
    cover: IMG.interiorWarm,
    thumb: IMG.candle,
    accent: '#879078',
    featured: true,
    status: 'approved',
  },
  {
    id: 'biz-sabbath',
    slug: 'sabbath-rest-linen',
    name: 'Sabbath Rest Linen Co.',
    category: 'Bedding & linen',
    ownerName: 'Naledi Dlamini (fictional)',
    shortBio: 'Stonewashed linen and throws for restful homes.',
    story:
      'A fictional linen studio sewing stonewashed bedding in small batches. Every set is named after a line from the Psalms and folded with a handwritten blessing card.',
    location: 'Walmer, Gqeberha, 6070',
    since: 'Est. 2021 (fictional)',
    cover: IMG.bedroom,
    thumb: IMG.linenFold,
    accent: '#EAD8D8',
    featured: true,
    status: 'approved',
  },
  {
    id: 'biz-livingwater',
    slug: 'living-water-vessels',
    name: 'Living Water Vessels',
    category: 'Drinkware & Christian merchandise',
    ownerName: 'Pieter van der Merwe (fictional)',
    shortBio: 'Mugs, tumblers and bottles that carry the Word.',
    story:
      'A fictional drinkware brand inspired by John 4:14. Stoneware mugs, insulated bottles and small-group merchandise designed for Sunday coffee tables and weekday commutes alike.',
    location: 'Newton Park, Gqeberha, 6045',
    since: 'Est. 2019 (fictional)',
    cover: IMG.latte,
    thumb: IMG.mug,
    accent: '#BE985B',
    featured: true,
    status: 'approved',
  },
  {
    id: 'biz-mustard',
    slug: 'mustard-seed-press',
    name: 'Mustard Seed Press',
    category: 'Stationery, apparel & gifts',
    ownerName: 'Ayanda Nkosi (fictional)',
    shortBio: 'Prayer journals, cards and gentle faith apparel.',
    story:
      'A fictional letterpress and print studio making prayer journals, greeting cards and soft cotton apparel — small things, planted with great faith (Matthew 17:20).',
    location: 'Summerstrand, Gqeberha, 6001',
    since: 'Est. 2022 (fictional)',
    cover: IMG.notebook,
    thumb: IMG.journal,
    accent: '#722F45',
    featured: false,
    status: 'approved',
  },
];

export const getBusiness = (id) => BUSINESSES.find((b) => b.id === id);
export const getBusinessBySlug = (slug) => BUSINESSES.find((b) => b.slug === slug);
