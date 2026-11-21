// মূল মেনু (navbar), ফুটার, "উপরে যান" বাটন এবং সাইটের লোগো, সব এই এক ফাইলে।
// যেকোনো পেজে </body>-এর আগে এই এক লাইন বসালেই চলবে:   <script src="/chrome.js"></script>
// পেজে আগে থেকে মেনু/ফুটার থাকলে (যেমন index.html) সেটা আর দ্বিতীয়বার বসায় না, শুধু লোগো বসায়।
(function () {
  if (window.__chromeLoaded) return;
  window.__chromeLoaded = true;

  const self = document.currentScript;
  const base = self && self.src ? self.src.replace(/chrome\.js.*$/, '') : '/';

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
  const load = src => new Promise((res, rej) => {
    const e = head('script', { src }); e.onload = res; e.onerror = rej;
  });

  // ===== লোগো =====
  const LOGO_KEY = 'scf_logo';

  function logoImg(url, h) {
    const i = document.createElement('img');
    i.src = url; i.alt = 'লোগো';
    i.style.cssText = `height:${h}px;width:auto;max-width:200px;object-fit:contain;display:block;border-radius:0`;
    return i;
  }

  function applyLogo(url, h) {
    let ic = document.querySelector('link[rel~="icon"]');
    if (!ic) ic = head('link', { rel: 'icon' });
    ic.href = url;

    let done = false;
    document.querySelectorAll('.nav-logo, .footer-icon').forEach(el => {
      el.innerHTML = ''; el.appendChild(logoImg(url, h));
      el.style.cssText += ';width:auto;height:auto;min-width:0;background:transparent;border:0;border-radius:0';
      done = true;
    });
    document.querySelectorAll('img#logo, img.logo').forEach(el => {
      el.src = url; el.hidden = false; el.alt = 'লোগো';
      el.style.height = h + 'px'; el.style.width = 'auto'; el.style.maxWidth = '200px';
      done = true;
    });
    if (!done) {
      const old = document.querySelector('[data-auto-logo]');
      if (old) { old.innerHTML = ''; old.appendChild(logoImg(url, h)); return; }
      const host = document.querySelector('.navbar, header, nav');
      if (host) {
        const wrap = document.createElement('a'); wrap.href = '/'; wrap.setAttribute('data-auto-logo', '1');
        wrap.style.cssText = 'display:inline-flex;align-items:center;margin-right:10px';
        wrap.appendChild(logoImg(url, h)); host.insertBefore(wrap, host.firstChild);
      }
    }
  }

  async function initLogo() {
    // আগের বার দেখা লোগো সাথে সাথে বসায়, যাতে পেজ খোলার সময় ঝলক না লাগে
    try { const c = JSON.parse(localStorage.getItem(LOGO_KEY) || 'null'); if (c && c.url) applyLogo(c.url, c.h); } catch (e) { }
    try {
      if (!window.supabase) await load('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js');
      if (!window.SUPABASE_URL) await load(base + 'config.js');
      const sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
      const { data, error } = await sb.from('settings').select('key,value').in('key', ['logo_url', 'logo_height']);
      if (error) return;
      const m = {}; (data || []).forEach(r => { m[r.key] = r.value; });
      if (!m.logo_url) { try { localStorage.removeItem(LOGO_KEY); } catch (e) { } return; }
      const h = Math.min(56, Math.max(24, parseInt(m.logo_height, 10) || 40));
      try { localStorage.setItem(LOGO_KEY, JSON.stringify({ url: m.logo_url, h })); } catch (e) { }
      applyLogo(m.logo_url, h);
    } catch (e) { /* লোগো না এলে সাইট যেমন ছিল তেমনই থাকবে */ }
  }

  // ===== মেনু ও ফুটার =====
  function run() {
    const needHeader = !document.querySelector('nav.navbar');
    const needFooter = !document.querySelector('footer');

    if (needHeader || needFooter) {
      if (!document.querySelector('link[href*="chrome.css"]')) head('link', { rel: 'stylesheet', href: base + 'chrome.css' });
      if (!document.querySelector('link[href*="font-awesome"]'))
        head('link', { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css' });
    }

    if (needHeader) {
      const slot = document.getElementById('site-header');
      if (slot) slot.outerHTML = HEADER; else document.body.insertAdjacentHTML('afterbegin', HEADER);
      document.body.classList.add('has-chrome');
      const hb = document.getElementById('hamburger'), mn = document.getElementById('mobileNav');
      hb.addEventListener('click', () => mn.classList.toggle('open'));
      document.addEventListener('click', e => { if (!hb.contains(e.target) && !mn.contains(e.target)) mn.classList.remove('open'); });
    }
    if (needFooter) {
      const slot = document.getElementById('site-footer');
      if (slot) slot.outerHTML = FOOTER; else document.body.insertAdjacentHTML('beforeend', FOOTER);
      const top = document.getElementById('goTopBtn');
      window.addEventListener('scroll', () => top.classList.toggle('show', window.scrollY > 300));
      top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    initLogo();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
