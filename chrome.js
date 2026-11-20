// মূল মেনু (navbar), ফুটার ও "উপরে যান" বাটন সব পেজে বসায়।
// যেকোনো পেজে </body>-এর আগে এই এক লাইন বসালেই চলবে:   <script src="/chrome.js"></script>
// পেজে আগে থেকে মেনু/ফুটার থাকলে (যেমন index.html) সেটা আর দ্বিতীয়বার বসায় না।
(function () {
  if (window.__chromeLoaded) return;
  window.__chromeLoaded = true;

  // ===== মেনুর লিংক (এখান থেকেই বদলানো যাবে) =====
  const NAV = [
    ['/', 'হোম', 'fa-house', 'index', 'হোম'],
    ['/about.html', 'আমাদের সম্পর্কে', 'fa-landmark', 'about', 'আমাদের সম্পর্কে'],
    ['/events.html', 'অনুষ্ঠান', 'fa-masks-theater', 'events', 'সাংস্কৃতিক অনুষ্ঠান'],
    ['/leaders.html', 'নেতৃত্ব', 'fa-users', 'leaders', 'নেতৃত্ব'],
    ['/gallery.html', 'গ্যালারি', 'fa-image', 'gallery', 'গ্যালারি'],
    ['/contact.html', 'যোগাযোগ', 'fa-envelope', 'contact', 'যোগাযোগ']
  ];

  const seg = location.pathname.split('/').filter(Boolean).pop() || 'index';
  const cur = seg.replace(/\.html$/, '');
  const act = k => (k === cur ? ' class="active"' : '');

  const HEADER = `
<nav class="navbar">
  <a class="nav-brand" href="/">
    <div class="nav-logo"><i class="fa-solid fa-masks-theater"></i></div>
    <div class="nav-brand-text"><strong>সোনাগাজী কালচারাল ফোরাম</strong><span>ফেনী, বাংলাদেশ</span></div>
  </a>
  <ul class="nav-links">
    ${NAV.map(n => `<li><a href="${n[0]}"${act(n[3])}><i class="fa-solid ${n[2]}"></i> ${n[1]}</a></li>`).join('')}
  </ul>
  <button class="hamburger" id="hamburger" aria-label="Menu"><i class="fa-solid fa-bars"></i></button>
</nav>
<div class="mobile-nav" id="mobileNav">
  ${NAV.map(n => `<a href="${n[0]}"${act(n[3])}><i class="fa-solid ${n[2]}"></i> ${n[4]}</a>`).join('')}
</div>`;

  const FOOTER = `
<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-top">
      <div class="footer-icon"><i class="fa-solid fa-masks-theater"></i></div>
      <div class="footer-brand-info"><h3>সোনাগাজী কালচারাল ফোরাম</h3><p>ফেনী, বাংলাদেশ</p></div>
    </div>
    <p class="footer-desc">ফেনী জেলার সোনাগাজী উপজেলার একটি অগ্রগামী সামাজিক ও সাংস্কৃতিক সংগঠন। শিল্প, সাহিত্য ও সংস্কৃতির মাধ্যমে একটি সুন্দর সমাজ বিনির্মাণের লক্ষ্যে আমরা কাজ করে যাচ্ছি।</p>
    <div class="footer-cols">
      <div>
        <p class="footer-col-title">কার্যক্রমের ক্ষেত্র</p>
        <ul class="footer-list">
          <li>সাংস্কৃতিক বিকাশ ও অনুষ্ঠান</li>
          <li>মানবসেবা ও ত্রান বিতরণ</li>
          <li>পরিবেশ রক্ষা ও বৃক্ষরোপণ</li>
          <li>ইসলামী মূল্যবোধ ও সংস্কৃতি চর্চা</li>
        </ul>
      </div>
      <div>
        <p class="footer-col-title">যোগাযোগ</p>
        <div class="footer-contact-item"><i class="fa-solid fa-location-dot"></i><span>সোনাগাজী জিরো পয়েন্ট, ফেনী</span></div>
        <div class="footer-contact-item"><i class="fa-solid fa-envelope"></i><span>contact@scffeni.org</span></div>
        <div class="footer-contact-item"><i class="fa-brands fa-facebook-f"></i><span>Facebook পেইজ</span></div>
        <div class="footer-contact-item"><i class="fa-brands fa-youtube"></i><span>YouTube চ্যানেল</span></div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2026 সোনাগাজী কালচারাল ফোরাম, ফেনী. All Rights Reserved.</p>
      <p class="dev">Developed by <strong>Abdullah Al Maruf</strong> <span class="heart">❤</span></p>
    </div>
  </div>
</footer>
<button id="goTopBtn" aria-label="Go to top"><i class="fa-solid fa-chevron-up"></i></button>`;

  function head(tag, attrs) {
    const e = document.createElement(tag);
    Object.keys(attrs).forEach(k => e.setAttribute(k, attrs[k]));
    document.head.appendChild(e); return e;
  }

  function run() {
    if (!document.querySelector('link[href*="chrome.css"]')) head('link', { rel: 'stylesheet', href: '/chrome.css' });
    if (!document.querySelector('link[href*="font-awesome"]'))
      head('link', { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css' });

    let injectedHeader = false, injectedFooter = false;

    if (!document.querySelector('nav.navbar')) {
      const slot = document.getElementById('site-header');
      if (slot) slot.outerHTML = HEADER; else document.body.insertAdjacentHTML('afterbegin', HEADER);
      document.body.classList.add('has-chrome'); injectedHeader = true;
    }
    if (!document.querySelector('footer')) {
      const slot = document.getElementById('site-footer');
      if (slot) slot.outerHTML = FOOTER; else document.body.insertAdjacentHTML('beforeend', FOOTER);
      injectedFooter = true;
    }

    if (injectedHeader) {
      const hb = document.getElementById('hamburger'), mn = document.getElementById('mobileNav');
      hb.addEventListener('click', () => mn.classList.toggle('open'));
      document.addEventListener('click', e => { if (!hb.contains(e.target) && !mn.contains(e.target)) mn.classList.remove('open'); });
    }
    const top = document.getElementById('goTopBtn');
    if (top && injectedFooter) {
      window.addEventListener('scroll', () => top.classList.toggle('show', window.scrollY > 300));
      top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // লোগো (অ্যাডমিন থেকে দেওয়া) মেনু ও ফুটারে বসাতে
    if (!document.querySelector('script[src*="site-logo.js"]')) head('script', { src: '/site-logo.js' });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
