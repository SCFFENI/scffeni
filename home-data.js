// হোমপেজে Supabase থেকে পোস্ট ও ইভেন্ট দেখায়।
// ডাটাবেসে কিছু না থাকলে বা কোনো সমস্যা হলে পুরনো (হার্ডকোড) কন্টেন্টই থেকে যাবে।
(function () {
  if (!window.supabase || !window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) return;
  const sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = d => new Date(d).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
  const icons = {
    quran: '📖', hadith: '🌙', golpo: '✍️', kobita: '🪶', 'sci-fi': '🚀', sports: '⚽',
    desh: '🌏', science: '🔬', it: '💻', career: '💼', health: '❤️', natika: '🎭'
  };

  // নতুন কার্ডের জন্য সামান্য স্টাইল
  const st = document.createElement('style');
  st.textContent = '.post-card-img{width:100%;height:160px;object-fit:cover;border-radius:8px}' +
    '.btn-ghost{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:10px;' +
    'border:1px solid var(--border-subtle);color:var(--text);font-size:.88rem;transition:all .2s}' +
    '.btn-ghost:hover{border-color:var(--accent);color:var(--accent)}';
  document.head.appendChild(st);

  async function loadPosts() {
    const grid = document.getElementById('home-posts-grid');
    if (!grid) return;
    const { data, error } = await sb.from('posts')
      .select('id,title,author,content,image_url,created_at,category,categories(name)')
      .eq('published', true).order('created_at', { ascending: false }).limit(4);
    if (error || !data || !data.length) return;
    grid.innerHTML = data.map(p => {
      const text = (p.content || '').replace(/\s+/g, ' ').trim();
      const excerpt = text.length > 140 ? text.slice(0, 140) + '…' : text;
      const link = 'p/' + encodeURIComponent(p.id);
      const catName = p.categories ? p.categories.name : '';
      return `
      <article class="category-post-card">
        ${p.image_url ? `<img class="post-card-img" src="${esc(p.image_url)}" alt="${esc(p.title)}" loading="lazy">` : ''}
        <div class="post-card-header">
          <span class="post-icon">${icons[p.category] || '📝'}</span>
          <div class="post-meta-top">
            <a href="category.html?c=${encodeURIComponent(p.category)}" class="post-cat-badge">${esc(catName)}</a>
            <span class="post-date">${fmt(p.created_at)}</span>
          </div>
        </div>
        <h3 class="post-card-title"><a href="${link}">${esc(p.title)}</a></h3>
        <p class="post-card-excerpt">${esc(excerpt)}</p>
        <div class="post-card-footer">
          <span class="post-author">✍ ${esc(p.author || 'সোনাগাজী কালচারাল ফোরাম')}</span>
          <a href="${link}" class="post-read-btn">পড়ুন →</a>
        </div>
      </article>`;
    }).join('');
  }

  async function loadEvents() {
    const grid = document.querySelector('.events-grid');
    if (!grid) return;
    const { data, error } = await sb.from('events').select('*')
      .order('event_date', { ascending: false }).limit(8);
    if (error || !data || !data.length) return;
    const rank = { ongoing: 0, upcoming: 1, done: 2 };
    data.sort((a, b) => (rank[a.status] - rank[b.status]) || 0);
    const label = { ongoing: '● চলমান', upcoming: '● আসন্ন', done: '✓ সম্পন্ন' };
    grid.innerHTML = data.slice(0, 4).map(ev => `
      <div class="event-card">
        <img src="${esc(ev.image_url || 'galla.jpg')}" alt="${esc(ev.title)}" loading="lazy">
        <div class="event-body">
          <span class="event-badge ${ev.status === 'done' ? 'badge-ended' : 'badge-ongoing'}">${label[ev.status] || ''}</span>
          <p class="event-title">${esc(ev.title)}</p>
          ${ev.event_date ? `<div class="event-detail"><i class="fa-regular fa-calendar"></i> ${fmt(ev.event_date + 'T00:00:00')}</div>` : ''}
          ${ev.venue ? `<div class="event-detail"><i class="fa-solid fa-location-dot"></i> ${esc(ev.venue)}</div>` : ''}
          <a href="events.html" class="event-btn"><i class="fa-solid fa-arrow-right"></i> ${ev.status === 'done' ? 'বিস্তারিত' : 'যোগ দিন'}</a>
        </div>
      </div>`).join('');
  }

  // পুরনো category/xxx/index.html লিংকগুলো নতুন ডাইনামিক পেজে পাঠিয়ে দেয়
  function fixCategoryLinks() {
    document.querySelectorAll('a[href]').forEach(a => {
      const m = a.getAttribute('href').match(/^category\/([^\/]+)\/index\.html$/);
      if (m) a.setAttribute('href', 'category.html?c=' + m[1]);
    });
  }

  // ---------- লোগো (সব পেজের জন্য একই chrome.js) ----------
  function loadLogo() {
    if (document.querySelector('script[src*="chrome.js"]')) return;
    const sc = document.createElement('script'); sc.src = 'chrome.js'; document.head.appendChild(sc);
  }

  // ---------- স্লাইডার ----------
  async function loadSlides() {
    const wrap = document.querySelector('.mySwiper .swiper-wrapper');
    if (!wrap) return;
    const { data, error } = await sb.from('slides').select('*')
      .order('sort', { ascending: true }).order('created_at', { ascending: false });
    if (error || !data || !data.length) return;
    try { if (typeof swiper !== 'undefined' && swiper && swiper.destroy) swiper.destroy(true, false); } catch (e) { }
    wrap.innerHTML = data.map(s => `
      <div class="swiper-slide">
        <img src="${esc(s.image_url)}" alt="${esc(s.caption || '')}">
        ${s.caption ? `<div class="slide-caption">${esc(s.caption)}</div>` : ''}
      </div>`).join('');
    if (window.Swiper) {
      const many = data.length > 1;
      new Swiper('.mySwiper', {
        loop: many,
        autoplay: many ? { delay: 3500, disableOnInteraction: false } : false,
        pagination: { el: '.swiper-pagination', clickable: true },
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }
      });
    }
  }

  // ---------- নেতৃত্ব ----------
  const socialLink = (url, icon, label) => url
    ? `<a class="leader-social" href="${esc(url)}" target="_blank" rel="noopener" aria-label="${label}"><i class="${icon}"></i></a>` : '';

  async function loadLeaders() {
    const grid = document.querySelector('.leadership-grid');
    if (!grid) return;
    const { data, error } = await sb.from('leaders').select('*')
      .order('sort', { ascending: true }).order('created_at', { ascending: true }).limit(4);
    if (error || !data || !data.length) return;
    grid.innerHTML = data.map((l, i) => {
      const initial = esc((l.name || '?').trim().charAt(0));
      const socials = socialLink(l.facebook, 'fa-brands fa-facebook-f', 'ফেসবুক')
        + socialLink(l.youtube, 'fa-brands fa-youtube', 'ইউটিউব')
        + socialLink(l.linkedin, 'fa-brands fa-linkedin-in', 'লিংকডইন');
      return `
      <div class="leader-card">
        <div class="leader-card-inner">
          <div class="leader-avatar">
            ${l.photo_url ? `<img src="${esc(l.photo_url)}" alt="${esc(l.name)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
            <span class="avatar-fallback" ${l.photo_url ? '' : 'style="display:flex"'}>${initial}</span>
          </div>
          <div class="leader-info">
            ${l.role ? `<span class="leader-badge ${i % 2 ? 'badge-teal' : 'badge-blue'}"><i class="fa-solid fa-user-tie"></i> ${esc(l.role)}</span>` : ''}
            <p class="leader-name">${esc(l.name)}</p>
            ${l.bio ? `<p class="leader-desc">${esc(l.bio)}</p>` : ''}
          </div>
        </div>
        ${socials ? `<div class="leader-footer">${socials}</div>` : ''}
      </div>`;
    }).join('');
  }

  // ---------- গ্যালারি ----------
  async function loadGallery() {
    const grid = document.querySelector('.bento-grid');
    if (!grid) return;
    const { data, count, error } = await sb.from('gallery').select('*', { count: 'exact' })
      .order('created_at', { ascending: false }).limit(5);
    if (error || !data || !data.length) return;
    const bento = data.length >= 5;
    if (!bento) { grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))'; grid.style.gridTemplateRows = 'none'; grid.style.gridAutoRows = '200px'; }
    grid.innerHTML = data.map((g, i) => `
      <div class="bento-item ${bento ? 'b' + (i + 1) : ''}">
        <img src="${esc(g.image_url)}" alt="${esc(g.title || 'গ্যালারির ছবি')}" loading="lazy">
        <div class="bento-overlay"><div class="bento-overlay-inner">
          ${g.category ? `<span class="bento-overlay-cat">${esc(g.category)}</span>` : ''}
          ${g.title ? `<p class="bento-overlay-title">${esc(g.title)}</p>` : ''}
        </div></div>
      </div>`).join('');
    const num = document.querySelector('.gallery-count-text span');
    if (num && count != null) num.textContent = count.toLocaleString('bn-BD');
  }

  // ---------- ভিডিও ----------
  function ytId(url) {
    const m = (url || '').match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : '';
  }

  async function loadVideos() {
    const grid = document.querySelector('.video-grid');
    if (!grid) return;
    const { data, error } = await sb.from('videos').select('*')
      .order('sort', { ascending: true }).order('created_at', { ascending: false }).limit(3);
    if (error || !data || !data.length) return;
    grid.innerHTML = data.map(v => {
      const fb = v.platform === 'facebook';
      const id = ytId(v.url);
      const thumb = v.thumb_url || (id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : 'galla.jpg');
      return `
      <a class="vcard" href="${esc(v.url)}" target="_blank" rel="noopener">
        <div class="vthumb">
          <img src="${esc(thumb)}" alt="${esc(v.title)}" loading="lazy">
          <div class="vplay-btn"><div class="vplay-circle ${fb ? 'fb' : 'yt'}"><i class="fa-solid fa-play"></i></div></div>
          ${v.duration ? `<span class="vduration">${esc(v.duration)}</span>` : ''}
        </div>
        <div class="vbody">
          <span class="vplatform ${fb ? 'fb' : 'yt'}"><i class="fa-brands ${fb ? 'fa-facebook-f' : 'fa-youtube'}"></i> ${fb ? 'Facebook' : 'YouTube'}</span>
          <p class="vtitle">${esc(v.title)}</p>
          ${v.meta ? `<div class="vmeta">${esc(v.meta)}</div>` : ''}
        </div>
      </a>`;
    }).join('');
  }

  fixCategoryLinks();
  loadLogo();
  loadSlides();
  loadLeaders();
  loadGallery();
  loadVideos();
  loadPosts();
  loadEvents();
})();
