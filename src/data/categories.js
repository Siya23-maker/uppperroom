import { IMG } from './images.js';

export const CATEGORIES = [
  { id: 'decor', name: 'Home Decor', blurb: 'Scripture art, candles & pieces that make a house a home', image: IMG.interiorWarm },
  { id: 'bedding', name: 'Bedding', blurb: 'Linen & throws for restful sabbath mornings', image: IMG.bedLinen },
  { id: 'drinkware', name: 'Drinkware', blurb: 'Mugs & cups for coffee shared in fellowship', image: IMG.mug },
  { id: 'bottles', name: 'Bottles', blurb: 'Living-water bottles for every day', image: IMG.bottle },
  { id: 'gifts', name: 'Gifts', blurb: 'Thoughtful hampers for baptisms, birthdays & thank-yous', image: IMG.giftBox },
  { id: 'apparel', name: 'Apparel', blurb: 'Soft, understated faith apparel', image: IMG.tee },
  { id: 'stationery', name: 'Stationery', blurb: 'Prayer journals, notebooks & cards', image: IMG.journal },
];

export const categoryName = (id) => CATEGORIES.find((c) => c.id === id)?.name ?? id;
