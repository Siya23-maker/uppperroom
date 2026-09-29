/**
 * DEMO ACCOUNTS — for UI demonstration only. There is NO real authentication
 * in the prototype; the role switcher simply selects one of these profiles.
 */
export const ACCOUNTS = {
  customer: {
    id: 'cust-001',
    role: 'customer',
    name: 'Thandi Mokoena',
    note: 'Demo customer',
    email: 'thandi.demo@example.com', // example.com is reserved for documentation
    phone: '082 000 0000 (demo)',
    memberSince: 'March 2026',
    addresses: [
      { id: 'addr-1', label: 'Home', line1: '18 Protea Crescent', line2: '', suburb: 'Walmer', city: 'Gqeberha', province: 'Eastern Cape', postalCode: '6070', isDefault: true },
      { id: 'addr-2', label: 'Work', line1: 'Suite 4, 22 Cape Road', line2: '', suburb: 'Mill Park', city: 'Gqeberha', province: 'Eastern Cape', postalCode: '6001', isDefault: false },
    ],
  },
  sellers: [
    { id: 'seller-rooted', role: 'seller', businessId: 'biz-rooted', name: 'Rooted (demo seller)', email: 'rooted.demo@example.com' },
    { id: 'seller-sabbath', role: 'seller', businessId: 'biz-sabbath', name: 'Naledi Dlamini', email: 'naledi.demo@example.com' },
    { id: 'seller-livingwater', role: 'seller', businessId: 'biz-livingwater', name: 'Pieter van der Merwe', email: 'pieter.demo@example.com' },
    { id: 'seller-mustard', role: 'seller', businessId: 'biz-mustard', name: 'Ayanda Nkosi', email: 'ayanda.demo@example.com' },
  ],
  admin: { id: 'admin-001', role: 'admin', name: 'Upper Room Admin', note: 'Demo administrator', email: 'admin.demo@example.com' },
};
