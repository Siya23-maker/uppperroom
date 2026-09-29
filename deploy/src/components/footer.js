import { CONFIG } from '../config.js';
import { icon } from './icons.js';
import { logoMarkup, bindLogoFallback } from './header.js';
import { CATEGORIES } from '../data/categories.js';

export function renderFooter(mount) {
  mount.innerHTML = `
  <footer class="site-footer on-dark">
    <div class="container footer__top">
      <div class="footer__brand">
        <a class="footer__logo" href="/" aria-label="${CONFIG.siteName} — home">${logoMarkup('footer__logo-img')}</a>
        <p class="footer__tagline">${CONFIG.tagline}</p>
        <p class="small">A marketplace where church-member businesses gather under one roof — so every purchase supports a family in our community.</p>
      </div>
      <div>
        <h2>Shop</h2>
        <ul>
          <li><a href="/shop">All products</a></li>
          ${CATEGORIES.slice(0, 5).map((c) => `<li><a href="/shop?category=${c.id}">${c.name}</a></li>`).join('')}
        </ul>
      </div>
      <div>
        <h2>Community</h2>
        <ul>
          <li><a href="/businesses">Our Businesses</a></li>
          <li><a href="/about">About Us</a></li>
          <li><a href="/become-a-seller">Become a Seller</a></li>
          <li><a href="/contact">Contact Us</a></li>
        </ul>
      </div>
      <div>
        <h2>Visit</h2>
        <ul>
          <li>${icon('pin')} <span>${CONFIG.address}</span></li>
          <li><a href="/contact#map">Map & directions</a></li>
          <li><a href="/contact#facebook">${CONFIG.facebookLabel} on Facebook</a></li>
        </ul>
        <h2 style="margin-top:1.5rem">Demo dashboards</h2>
        <ul>
          <li><a href="/account">Customer</a></li>
          <li><a href="/seller">Seller</a></li>
          <li><a href="/admin">Admin</a></li>
        </ul>
      </div>
    </div>
    <div class="container footer__bottom">
      <p class="footer__verse" style="margin:0">“For where two or three gather in my name, there am I with them.” — Matthew 18:20</p>
      <p style="margin:0">© ${new Date().getFullYear()} ${CONFIG.siteName}. Interactive prototype — all products, businesses and orders shown are demo data.</p>
    </div>
  </footer>`;
  mount.querySelector('.footer__logo').classList.add('brand');
  bindLogoFallback(mount);
}
