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
      .select('id,title,content,image_url,created_at,category,categories(name)')
      .eq('published', true).order('created_at', { ascending: false }).limit(4);
    if (error || !data || !data.length) return;
    grid.innerHTML = data.map(p => {
      const text = (p.content || '').replace(/\s+/g, ' ').trim();
      const excerpt = text.length > 140 ? text.slice(0, 140) + '…' : text;
      const link = 'post.html?id=' + encodeURIComponent(p.id);
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
          <span class="post-author">✍ সোনাগাজী কালচারাল ফোরাম</span>
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

  fixCategoryLinks();
  loadPosts();
  loadEvents();
})();
