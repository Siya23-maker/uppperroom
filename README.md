# The Upper Room — Marketplace Prototype

*Gather Together, Brewing in Unity*

An interactive frontend prototype of a Christian multi-vendor marketplace for church-member businesses. Built with **HTML5, CSS3 and vanilla JavaScript (ES modules)** — no frameworks, no build step.

> **Prototype notice:** every product, business, account, order, payment and payout in this project is **fictional demo data**. Checkout is a simulation: no card details are collected and no payment endpoints are called.

---

## Run it locally

Requires **Node.js 18+** (no packages to install).

```bash
cd upper-room
npm start          # or: node server.js
```

Open **http://localhost:5173**.

Use a different port with `PORT=8080 npm start` (macOS/Linux) or `set PORT=8080 && npm start` (Windows cmd).

`server.js` is a tiny zero-dependency static server that falls back to `index.html`, so History-API routes like `/shop` or `/product/…` work on refresh and deep links. (A plain static server such as `python -m http.server` will load the home page, but refreshing a deep link will 404.)

In VS Code you can also run it from the integrated terminal with the same command.

### Before the client demo

1. **Add the logo** — save it as `assets/images/logo.png` (see `assets/images/README.md`). Until then a typeset name is shown.
2. Be online — placeholder photos (Unsplash) and fonts (Google Fonts) load from the web. Offline, images fall back to branded illustrated placeholders and fonts fall back to Georgia/system sans.
3. To start fresh, open the account icon → **Reset demo data**.

---

## Pages & routes

| Page | Route |
| --- | --- |
| Home | `/` |
| Shop (search, categories, filters, sort) | `/shop` · `/shop?category=bedding&q=linen&sort=price-asc` |
| Product details | `/product/:slug` |
| Our Businesses / storefront | `/businesses` · `/businesses/:slug` |
| About Us (draft copy) | `/about` |
| Become a Seller (3-step application) | `/become-a-seller` |
| Contact Us (form, map, Facebook) | `/contact` |
| Cart | `/cart` (plus slide-out cart drawer everywhere) |
| Checkout (DEMO MODE) / confirmation | `/checkout` · `/checkout/complete/:orderId` |
| Customer dashboard | `/account` · `?tab=orders|profile|addresses` · `/account/orders/:id` |
| Seller dashboard | `/seller` · `?tab=products|inventory|orders|earnings|payouts` |
| Admin dashboard | `/admin` · `?tab=applications|sellers|products|orders|payments|payouts` |

**Demo role switcher:** the account icon in the header, and the gold bar at the top of every dashboard, switch between Customer, Seller (choose any of the 4 fictional sellers) and Admin. This is a presentation aid, **not authentication**.

### Suggested demo walkthrough
1. Home → quick-add a mug → open the cart drawer.
2. Product page → change size/colour (price updates) → add to cart.
3. Checkout → "Use demo customer details" → try **Declined**, then **Successful** → confirmation → *View in my account*.
4. Become a Seller → submit an application → *Review as admin* → approve it.
5. Seller dashboard (Rooted) → update stock, add a product, advance an order, **Request payout**.
6. Admin → Payouts → approve it → Payments overview shows the split.

---

## Project structure

```
upper-room/
├── index.html              App shell, SEO & Open Graph placeholders
├── server.js               Zero-dependency dev server with SPA fallback
├── package.json            npm start
├── assets/images/          logo.png goes here, favicon placeholder
├── styles/
│   ├── tokens.css          Brand colours, type scale, spacing, motion
│   ├── base.css            Reset, typography, buttons, forms, badges, reveal
│   ├── layout.css          Header, menus, search, drawers, footer, toasts
│   ├── components.css      Cards, grids, tables, tabs, gallery, modals
│   ├── pages.css           Page-specific layouts
│   └── dashboard.css       Customer / seller / admin dashboards
└── src/
    ├── app.js              Bootstraps shell, registers routes, renders pages
    ├── router.js           History API router (back/forward, deep links)
    ├── config.js           Site config & PLACEHOLDERS (Facebook URL, fees…)
    ├── data/               Dummy data modules (swap for Firebase later)
    │   ├── products.js  businesses.js  categories.js
    │   ├── accounts.js  orders.js (orders, applications, payouts)
    │   └── images.js       Placeholder photo URLs
    ├── store/
    │   ├── db.js           Data-access layer (localStorage-backed demo state)
    │   └── cart.js         Cart store (localStorage persistence)
    ├── components/         Header, footer, cart drawer, cards, icons,
    │                       overlays, toasts, breadcrumbs, dashboard shell
    ├── pages/              One module per page
    └── utils/              Formatting (ZAR), DOM helpers, storage, image fallback
```

---

## Placeholders still to confirm with the client

| Item | Where |
| --- | --- |
| Upper Room logo file | `assets/images/logo.png` |
| 1X Church Facebook URL (button shows "link pending" until set) | `CONFIG.facebookUrl` in `src/config.js` |
| Phone number & email (intentionally not invented) | `src/config.js`, Contact page |
| Map pin accuracy for "5 Sandlewood, Lorraine, Unit 5" (Google Maps address query, no invented coordinates) | Contact page |
| About Us copy, church story, leadership, partnerships | `src/pages/about.js` (clearly labelled) |
| Rooted's real description, photos, location | `src/data/businesses.js` |
| Platform fee (10% placeholder), delivery fee (R95), free-delivery threshold (R950), collection times | `src/config.js` |
| Seller terms, delivery terms | Become a Seller, product page |
| Real product photography (current images are illustrative stock photos) | `src/data/images.js`, `products.js` |
| Production domain, canonical URL, OG image (site is `noindex` for now) | `index.html` |
| Favicon from the real logo | `assets/images/favicon.svg` |

---

## Prototype limitations

- **No real authentication** — the role switcher only selects demo profiles.
- **No backend** — all changes (orders, approvals, stock, payouts, messages) persist only in this browser's `localStorage`.
- **No payments** — checkout simulates success/decline; Yoco is not connected. No card fields exist.
- **No emails** — contact, newsletter and application forms validate and store locally, and say so.
- Order status is order-level; in production each seller should fulfil their own line items independently.
- Seller "pause" is a visual flag only; image upload on seller forms is not implemented.

---

## Future integration notes

**Firebase (data, auth, storage)**
- `src/store/db.js` is the single data-access layer. Keep its method names (`products()`, `getProduct()`, `placeOrder()`, `requestPayout()`, `updateApplication()`…) and replace the bodies with Firestore calls. Collections map 1:1 to the modules in `src/data/`: `products`, `businesses`, `orders`, `applications`, `payouts`, `users`.
- Replace the role switcher with Firebase Authentication + custom claims (`customer`, `seller` with `businessId`, `admin`), and enforce seller scoping in Firestore security rules — never only in the UI.
- Product and application images → Firebase Storage.

**C# backend (payments & money)**
- Checkout should `POST` the cart to a C# API that re-prices every line server-side, creates a pending order, and creates a **Yoco** checkout session with **The Upper Room as the single recipient**.
- Confirm payment via Yoco webhooks (verify signatures) before marking orders paid.
- Calculate seller earnings server-side (line total − platform fee), record them in a ledger, and have admin-approved payouts move through a proper payout process.
- Never store card data; keep Yoco secret keys on the server only.

**Launch checklist**: real logo & favicon, confirmed content, production domain + canonical + `robots` change, privacy policy / POPIA notice, terms of sale, accessibility audit with the final content.

---

## Accessibility & motion

Semantic landmarks, skip link, visible focus rings, keyboard-operable menus/drawers/dialogs with focus trapping and return, labelled form fields with inline error messages, `aria-live` announcements for route changes, filters and toasts. All animations (scroll reveal, staggered cards, hover zoom, drawer, page transitions, button states) are disabled or minimised under `prefers-reduced-motion`.
