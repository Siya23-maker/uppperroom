/**
 * DEMO ORDERS, APPLICATIONS & PAYOUTS.
 * None of these are real transactions. Every reference is prefixed "DEMO-".
 *
 * Money model (prototype): The Upper Room receives the full customer payment
 * (future provider: Yoco). Each seller's earning per line = line total − platform fee.
 */

// Order line: { productId, name, businessId, variant, qty, unitPrice }
export const SEED_ORDERS = [
  {
    id: 'DEMO-UR-1042', customerId: 'cust-001', customerName: 'Thandi Mokoena', date: '2026-09-21',
    status: 'processing', fulfilment: 'delivery', paymentStatus: 'paid (demo)',
    address: '18 Protea Crescent, Walmer, Gqeberha, 6070',
    items: [
      { productId: 'p09', name: '“Brewing in Unity” Stoneware Mug', businessId: 'biz-livingwater', variant: 'Burgundy', qty: 2, unitPrice: 195 },
      { productId: 'p14', name: 'Daily Bread Prayer Journal', businessId: 'biz-mustard', variant: 'Sage linen', qty: 1, unitPrice: 275 },
    ],
    deliveryFee: 95,
  },
  {
    id: 'DEMO-UR-1036', customerId: 'cust-001', customerName: 'Thandi Mokoena', date: '2026-09-08',
    status: 'completed', fulfilment: 'collection', paymentStatus: 'paid (demo)',
    address: null,
    items: [
      { productId: 'p05', name: '“Still Waters” Linen Duvet Set', businessId: 'biz-sabbath', variant: 'Queen · Oat', qty: 1, unitPrice: 2750 },
    ],
    deliveryFee: 0,
  },
  {
    id: 'DEMO-UR-1029', customerId: 'cust-001', customerName: 'Thandi Mokoena', date: '2026-08-17',
    status: 'completed', fulfilment: 'delivery', paymentStatus: 'paid (demo)',
    address: '18 Protea Crescent, Walmer, Gqeberha, 6070',
    items: [
      { productId: 'p01', name: '“Be Still” Scripture Board', businessId: 'biz-rooted', variant: 'A3 · Natural oak', qty: 1, unitPrice: 625 },
      { productId: 'p02', name: 'Olive Branch Soy Candle', businessId: 'biz-rooted', variant: 'Frankincense', qty: 2, unitPrice: 245 },
    ],
    deliveryFee: 95,
  },
  {
    id: 'DEMO-UR-1045', customerId: 'cust-demo-2', customerName: 'Johan Botha (demo)', date: '2026-09-24',
    status: 'pending', fulfilment: 'delivery', paymentStatus: 'paid (demo)',
    address: '7 Heugh Road, Walmer, Gqeberha, 6070',
    items: [
      { productId: 'p11', name: 'John 4:14 Insulated Bottle', businessId: 'biz-livingwater', variant: '750 ml · Espresso', qty: 1, unitPrice: 440 },
      { productId: 'p06', name: 'Sabbath Waffle Throw', businessId: 'biz-sabbath', variant: 'Burgundy', qty: 1, unitPrice: 890 },
      { productId: 'p02', name: 'Olive Branch Soy Candle', businessId: 'biz-rooted', variant: 'Olive & Fig', qty: 1, unitPrice: 245 },
    ],
    deliveryFee: 0,
  },
  {
    id: 'DEMO-UR-1047', customerId: 'cust-demo-3', customerName: 'Lindiwe Zulu (demo)', date: '2026-09-26',
    status: 'ready', fulfilment: 'collection', paymentStatus: 'paid (demo)',
    address: null,
    items: [
      { productId: 'p17', name: '“Gather Together” Cotton Tee', businessId: 'biz-mustard', variant: 'M · Ivory', qty: 2, unitPrice: 340 },
      { productId: 'p19', name: 'Fellowship Coffee Gift Hamper', businessId: 'biz-livingwater', variant: 'Add blessing card', qty: 1, unitPrice: 775 },
    ],
    deliveryFee: 0,
  },
  {
    id: 'DEMO-UR-1048', customerId: 'cust-demo-4', customerName: 'Grace Pillay (demo)', date: '2026-09-27',
    status: 'pending', fulfilment: 'delivery', paymentStatus: 'paid (demo)',
    address: '3 Buffelsfontein Road, Walmer Downs, Gqeberha, 6065',
    items: [
      { productId: 'p20', name: 'Baptism Keepsake Box', businessId: 'biz-rooted', variant: 'Name & date engraving', qty: 1, unitPrice: 655 },
      { productId: 'p15', name: 'Scripture Memory Card Set', businessId: 'biz-mustard', variant: 'isiXhosa', qty: 2, unitPrice: 149 },
    ],
    deliveryFee: 95,
  },
];

export const SEED_APPLICATIONS = [
  {
    id: 'DEMO-APP-017', businessName: 'Cornerstone Leatherworks', owner: 'Sipho Mahlangu (fictional)', category: 'Leather Bible covers & gifts',
    email: 'sipho.demo@example.com', submitted: '2026-09-20', status: 'pending', churchMember: true,
    description: 'Hand-stitched leather Bible covers, bookmarks and key rings.',
  },
  {
    id: 'DEMO-APP-018', businessName: 'Fig Tree Bakery', owner: 'Marietjie Olivier (fictional)', category: 'Baked goods & gift jars',
    email: 'marietjie.demo@example.com', submitted: '2026-09-23', status: 'pending', churchMember: true,
    description: 'Rusks, biscuits and gift jars for hampers and church events.',
  },
  {
    id: 'DEMO-APP-015', businessName: 'Selah Soaps', owner: 'Kayla Adams (fictional)', category: 'Natural soaps & bath',
    email: 'kayla.demo@example.com', submitted: '2026-09-11', status: 'approved', churchMember: true,
    description: 'Cold-process soaps with local botanicals.',
  },
];

export const SEED_PAYOUTS = [
  { id: 'DEMO-PO-0301', businessId: 'biz-rooted', amount: 1782.00, period: 'Aug 2026', requested: '2026-09-01', status: 'paid', paidOn: '2026-09-03' },
  { id: 'DEMO-PO-0302', businessId: 'biz-sabbath', amount: 2475.00, period: 'Aug 2026', requested: '2026-09-01', status: 'paid', paidOn: '2026-09-03' },
  { id: 'DEMO-PO-0303', businessId: 'biz-livingwater', amount: 1310.40, period: 'Aug 2026', requested: '2026-09-01', status: 'paid', paidOn: '2026-09-03' },
  { id: 'DEMO-PO-0304', businessId: 'biz-mustard', amount: 986.50, period: 'Aug 2026', requested: '2026-09-01', status: 'paid', paidOn: '2026-09-04' },
  { id: 'DEMO-PO-0311', businessId: 'biz-sabbath', amount: 2475.00, period: '1–15 Sep 2026', requested: '2026-09-16', status: 'pending', paidOn: null },
  { id: 'DEMO-PO-0312', businessId: 'biz-livingwater', amount: 702.00, period: '1–15 Sep 2026', requested: '2026-09-16', status: 'pending', paidOn: null },
];
