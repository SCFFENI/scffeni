// হোমপেজের সব ডাইনামিক অংশ: Supabase থেকে তথ্য এনে বসায়।
// ডাটাবেসে কিছু না থাকলে (বা সমস্যা হলে) আগের নমুনা কন্টেন্ট দেখায়।
(function () {
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const bn = s => String(s).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);
  const fmt = d => new Date(d).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
  const fmtViews = n => {
    const t = x => bn(x.toFixed(1).replace(/\.0$/, ''));
    if (n >= 10000000) return t(n / 10000000) + ' কোটি';
    if (n >= 100000) return t(n / 100000) + ' লাখ';
    if (n >= 1000) return t(n / 1000) + ' হাজার';
    return bn(n);
  };
  const ytId = u => ((u || '').match(/(?:youtu\.be\/|[?&]v=|shorts\/|embed\/|live\/)([A-Za-z0-9_-]{11})/) || [])[1] || '';
  const icons = { quran: '📖', hadith: '🌙', golpo: '✍️', kobita: '🪶', 'sci-fi': '🚀', sports: '⚽', desh: '🌏', science: '🔬', it: '💻', career: '💼', health: '❤️', natika: '🎭' };
  const DEF_AUTHOR = 'সোনাগাজী কালচারাল ফোরাম';

  const sb = (window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY)
    ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY) : null;

  // ---------- নমুনা (ডাটাবেস খালি থাকলে এগুলো দেখায়) ----------
  const FB = {
    slides: [
      { image: 'galla.jpg', caption: 'সোনাগাজী সাংস্কৃতিক ফোরাম অনুষ্ঠান' },
      { image: 'gallary1.jpg', caption: 'শিশু-কিশোরদের অংশগ্রহণমূলক কার্যক্রম' },
      { image: 'gallary3.jpg', caption: 'ইসলামী জ্ঞানের প্রতিযোগিতা ও পুরস্কার বিতরণ' }
    ],
    events: [
      { title: 'বৈশাখী সাংস্কৃতিক অনুষ্ঠান', dateText: '১৪ এপ্রিল ২০২৬', venue: 'সোনাগাজী মডেল স্কুল মাঠ', status: 'ongoing', image: 'galla.jpg' },
      { title: 'কবিতা ও আবৃত্তি সন্ধ্যা', dateText: '২০ মে ২০২৬', venue: 'সোনাগাজী মিলনায়তন', status: 'done', image: 'gallary1.jpg' }
    ],
    leaders: [
      { name: 'আব্দুল্লাহ আল মারুফ', role: 'প্রতিষ্ঠাতা সভাপতি', bio: 'সৃজনশীলতা ও নেতৃত্বের মাধ্যমে যুব ক্ষমতায়নে নিবেদিত।', photo: 'images/president.jpg' },
      { name: 'সদস্যের নাম', role: 'সাধারণ সম্পাদক', bio: 'সাংগঠনিক কার্যক্রম পরিচালনা ও সমন্বয়ে দায়িত্বশীল।', photo: 'images/secretary.jpg' }
    ],
    gallery: [
      { image: 'galla.jpg', category: 'সাংস্কৃতিক অনুষ্ঠান', title: 'বৈশাখী সাংস্কৃতিক অনুষ্ঠান ২০২৬' },
      { image: 'gallary1.jpg', category: 'পুরস্কার বিতরণ', title: 'মেধাবী শিক্ষার্থী সংবর্ধনা' },
      { image: 'gallary3.jpg', category: 'দলীয় কার্যক্রম', title: 'স্বেচ্ছাসেবী টিম ২০২৬' },
      { image: 'galla.jpg', category: 'শিক্ষা', title: 'ইসলামী জ্ঞান প্রতিযোগিতা' },
      { image: 'gallary1.jpg', category: 'পরিবেশ', title: 'বৃক্ষরোপণ কার্যক্রম' }
    ]
  };

  // ---------- রেন্ডার (ডাটাবেস ও নমুনা, দুটোই একই ছাঁচে) ----------
  let swiperInst = null;
  function renderSlides(rows) {
    const wrap = $('.mySwiper .swiper-wrapper'); if (!wrap) return;
    if (swiperInst) { try { swiperInst.destroy(true, true); } catch (e) { } swiperInst = null; }
    wrap.innerHTML = rows.map(s => `
      <div class="swiper-slide"><img src="${esc(s.image)}" alt="${esc(s.caption || '')}">
      ${s.caption ? `<div class="slide-caption">${esc(s.caption)}</div>` : ''}</div>`).join('');
    if (!window.Swiper) return;
    const many = rows.length > 1;
    swiperInst = new Swiper('.mySwiper', {
      loop: many, autoplay: many ? { delay: 3500, disableOnInteraction: false } : false,
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }
    });
  }

  function renderPosts(rows) {
    const grid = $('#home-posts-grid'); if (!grid) return;
    if (!rows.length) { grid.innerHTML = '<p class="empty">এখনো কোনো পোস্ট নেই।</p>'; return; }
    grid.innerHTML = rows.map(p => `
      <article class="category-post-card">
        ${p.image ? `<img class="post-card-img" src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">` : ''}
        <div class="post-card-header">
          <span class="post-icon">${p.icon}</span>
          <div class="post-meta-top">
            <a href="category.html?c=${encodeURIComponent(p.catSlug)}" class="post-cat-badge">${esc(p.catName)}</a>
            <span class="post-date">${esc(p.date)}</span>
          </div>
        </div>
        <h3 class="post-card-title"><a href="${esc(p.link)}">${esc(p.title)}</a></h3>
        <p class="post-card-excerpt">${esc(p.excerpt)}</p>
        <div class="post-card-footer"><span class="post-author">✍ ${esc(p.author)}</span><a href="${esc(p.link)}" class="post-read-btn">পড়ুন →</a></div>
      </article>`).join('');
  }

  function renderEvents(rows) {
    const grid = $('.events-grid'); if (!grid) return;
    if (!rows.length) { grid.innerHTML = '<p class="empty">এখনো কোনো অনুষ্ঠান নেই।</p>'; return; }
    const label = { ongoing: '● চলমান', upcoming: '● আসন্ন', done: '✓ সম্পন্ন' };
    grid.innerHTML = rows.map(e => `
      <div class="event-card">
        <img src="${esc(e.image || 'galla.jpg')}" alt="${esc(e.title)}" loading="lazy">
        <div class="event-body">
          <span class="event-badge ${e.status === 'done' ? 'badge-ended' : 'badge-ongoing'}">${label[e.status] || ''}</span>
          <p class="event-title">${esc(e.title)}</p>
          ${e.dateText ? `<div class="event-detail"><i class="fa-regular fa-calendar"></i> ${esc(e.dateText)}</div>` : ''}
          ${e.venue ? `<div class="event-detail"><i class="fa-solid fa-location-dot"></i> ${esc(e.venue)}</div>` : ''}
          <a href="events.html" class="event-btn">${e.status === 'done' ? 'বিস্তারিত' : 'যোগ দিন'} →</a>
        </div>
      </div>`).join('');
  }

  const soc = (url, icon, label) => url
    ? `<a class="leader-social" href="${esc(url)}" target="_blank" rel="noopener" aria-label="${label}"><i class="${icon}"></i></a>` : '';
  function renderLeaders(rows) {
    const grid = $('.leadership-grid'); if (!grid) return;
    grid.innerHTML = rows.map((l, i) => {
      const s = soc(l.facebook, 'fa-brands fa-facebook-f', 'ফেসবুক') + soc(l.youtube, 'fa-brands fa-youtube', 'ইউটিউব') + soc(l.linkedin, 'fa-brands fa-linkedin-in', 'লিংকডইন');
      return `
      <div class="leader-card">
        <div class="leader-card-inner">
          <div class="leader-avatar">
            ${l.photo ? `<img src="${esc(l.photo)}" alt="${esc(l.name)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">` : ''}
            <span class="avatar-fallback" ${l.photo ? '' : 'style="display:flex"'}>${esc((l.name || '?').trim().charAt(0))}</span>
          </div>
          <div>
            ${l.role ? `<span class="leader-badge ${i % 2 ? 'badge-teal' : 'badge-blue'}"><i class="fa-solid fa-user-tie"></i> ${esc(l.role)}</span>` : ''}
            <p class="leader-name">${esc(l.name)}</p>
            ${l.bio ? `<p class="leader-desc">${esc(l.bio)}</p>` : ''}
          </div>
        </div>
        ${s ? `<div class="leader-footer">${s}</div>` : ''}
      </div>`;
    }).join('');
  }

  function renderGallery(rows, total) {
    const grid = $('.bento-grid'); if (!grid) return;
    const bento = rows.length >= 5;
    if (!bento) { grid.style.gridTemplateColumns = 'repeat(auto-fit,minmax(200px,1fr))'; grid.style.gridTemplateRows = 'none'; grid.style.gridAutoRows = '200px'; }
    grid.innerHTML = rows.map((g, i) => `
      <div class="bento-item ${bento ? 'b' + (i + 1) : ''}">
        <img src="${esc(g.image)}" alt="${esc(g.title || 'গ্যালারির ছবি')}" loading="lazy">
        <div class="bento-overlay"><div>
          ${g.category ? `<span class="bento-overlay-cat">${esc(g.category)}</span>` : ''}
          ${g.title ? `<p class="bento-overlay-title">${esc(g.title)}</p>` : ''}
        </div></div>
      </div>`).join('');
    const num = $('.gallery-count-text span');
    if (num && total != null) num.textContent = bn(total);
  }

  function renderVideos(rows) {
    const grid = $('.video-grid'); if (!grid) return;
    if (!rows.length) { grid.innerHTML = '<p class="empty" style="grid-column:1/-1">শীঘ্রই ভিডিও যোগ হবে।</p>'; return; }
    grid.innerHTML = rows.map(v => {
      const fb = v.platform === 'facebook', id = ytId(v.url);
      const thumb = v.thumb_url || (id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : 'galla.jpg');
      const when = v.published_at ? new Date(v.published_at).toLocaleDateString('bn-BD', { month: 'long', year: 'numeric' }) : '';
      const meta = v.meta || [v.views != null ? fmtViews(v.views) + ' ভিউ' : '', when].filter(Boolean).join(' · ');
      return `
      <a class="vcard" href="${esc(v.url)}" target="_blank" rel="noopener">
        <div class="vthumb"><img src="${esc(thumb)}" alt="${esc(v.title)}" loading="lazy">
          <div class="vplay-btn"><div class="vplay-circle ${fb ? 'fb' : 'yt'}"><i class="fa-solid fa-play"></i></div></div>
          ${v.duration ? `<span class="vduration">${esc(bn(v.duration))}</span>` : ''}</div>
        <div class="vbody">
          <span class="vplatform ${fb ? 'fb' : 'yt'}"><i class="fa-brands ${fb ? 'fa-facebook-f' : 'fa-youtube'}"></i> ${fb ? 'Facebook' : 'YouTube'}</span>
          <p class="vtitle">${esc(v.title)}</p>
          ${meta ? `<div class="vmeta">${esc(meta)}</div>` : ''}
        </div>
      </a>`;
    }).join('');
  }

  // ---------- ডাটা আনা ----------
  async function q(table, build) {
    if (!sb) return null;
    try { const r = await build(sb.from(table)); return r.error ? null : r; } catch (e) { return null; }
  }
  const has = r => r && r.data && r.data.length;

  async function loadSlides() {
    const r = await q('slides', t => t.select('*').order('sort', { ascending: true }).order('created_at', { ascending: false }));
    renderSlides(has(r) ? r.data.map(s => ({ image: s.image_url, caption: s.caption })) : FB.slides);
  }

  async function loadPosts() {
    const r = await q('posts', t => t.select('id,title,author,content,image_url,created_at,category,categories(name)')
      .eq('published', true).order('created_at', { ascending: false }).limit(4));
    if (has(r)) {
      renderPosts(r.data.map(p => {
        const text = (p.content || '').replace(/\s+/g, ' ').trim();
        return { image: p.image_url, icon: icons[p.category] || '📝', catSlug: p.category, catName: p.categories ? p.categories.name : '',
          date: fmt(p.created_at), title: p.title, link: 'p/' + encodeURIComponent(p.id),
          excerpt: text.length > 140 ? text.slice(0, 140) + '…' : text, author: p.author || DEF_AUTHOR };
      }));
    } else if (window.SCF_POSTS && window.SCF_POSTS.length) {
      renderPosts([...window.SCF_POSTS].sort((a, b) => b.dateSort.localeCompare(a.dateSort)).slice(0, 4).map(p => ({
        icon: p.icon, catSlug: p.categorySlug, catName: p.category, date: p.date, title: p.title, link: p.link, excerpt: p.excerpt, author: p.author })));
    } else renderPosts([]);
  }

  async function loadEvents() {
    const r = await q('events', t => t.select('*').order('event_date', { ascending: false }).limit(8));
    if (!has(r)) return renderEvents(FB.events);
    const rank = { ongoing: 0, upcoming: 1, done: 2 };
    renderEvents(r.data.sort((a, b) => rank[a.status] - rank[b.status]).slice(0, 4).map(e => ({
      title: e.title, status: e.status, venue: e.venue, image: e.image_url, dateText: e.event_date ? fmt(e.event_date + 'T00:00:00') : '' })));
  }

  async function loadLeaders() {
    const r = await q('leaders', t => t.select('*').order('sort', { ascending: true }).order('created_at', { ascending: true }).limit(4));
    renderLeaders(has(r) ? r.data.map(l => ({ name: l.name, role: l.role, bio: l.bio, photo: l.photo_url, facebook: l.facebook, youtube: l.youtube, linkedin: l.linkedin })) : FB.leaders);
  }

  async function loadGallery() {
    const r = await q('gallery', t => t.select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(5));
    if (has(r)) renderGallery(r.data.map(g => ({ image: g.image_url, title: g.title, category: g.category })), r.count);
    else renderGallery(FB.gallery, null);
  }

  async function loadVideos() {
    const r = await q('videos', t => t.select('*').order('sort', { ascending: true }).order('created_at', { ascending: false }).limit(3));
    renderVideos(has(r) ? r.data : []);
  }

  loadSlides(); loadPosts(); loadEvents(); loadLeaders(); loadGallery(); loadVideos();
})();
