// পাবলিক সাইটে পোস্ট ও ইভেন্ট দেখানোর স্ক্রিপ্ট।
// প্রতিটি পেজে (index.html, events.html, category/*/index.html) এই তিনটি লাইন </body>-এর আগে বসান
// (category ফোল্ডারের পেজে পথ হবে ../../config.js ও ../../site-data.js):
//
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"></script>
//   <script src="config.js"></script>
//   <script src="site-data.js"></script>
//
// HTML-এ শুধু খালি কনটেইনার রাখুন:
//   <div id="posts-list"></div>                              (সব ক্যাটাগরির সর্বশেষ পোস্ট)
//   <div id="posts-list" data-category="kobita"></div>       (নির্দিষ্ট ক্যাটাগরি)
//   <div id="events-list"></div>

(function () {
  const sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  const statusBn = { upcoming: 'আসন্ন', ongoing: '● চলমান', done: '✓ সম্পন্ন' };

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function fmtDate(d) {
    return new Date(d).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  async function renderPosts(box) {
    const cat = box.dataset.category;
    const limit = parseInt(box.dataset.limit || '12', 10);
    let q = sb.from('posts').select('*, categories(name)').eq('published', true)
      .order('created_at', { ascending: false }).limit(limit);
    if (cat) q = q.eq('category', cat);
    const { data, error } = await q;
    if (error) { box.textContent = 'পোস্ট লোড করা যায়নি।'; return; }
    if (!data.length) { box.textContent = 'এখনো কোনো পোস্ট নেই।'; return; }
    box.innerHTML = '';
    data.forEach(p => {
      const card = el('article', 'post-card');
      if (p.image_url) { const i = el('img'); i.src = p.image_url; i.alt = p.title; i.loading = 'lazy'; card.appendChild(i); }
      card.appendChild(el('span', 'post-cat', p.categories ? p.categories.name : ''));
      card.appendChild(el('h3', '', p.title));
      const preview = (p.content || '').slice(0, 160) + ((p.content || '').length > 160 ? '…' : '');
      card.appendChild(el('p', '', preview));
      card.appendChild(el('small', '', fmtDate(p.created_at)));
      box.appendChild(card);
    });
  }

  async function renderEvents(box) {
    const { data, error } = await sb.from('events').select('*').order('event_date', { ascending: false });
    if (error) { box.textContent = 'ইভেন্ট লোড করা যায়নি।'; return; }
    if (!data.length) { box.textContent = 'এখনো কোনো ইভেন্ট নেই।'; return; }
    box.innerHTML = '';
    data.forEach(ev => {
      const card = el('article', 'event-card');
      if (ev.image_url) { const i = el('img'); i.src = ev.image_url; i.alt = ev.title; i.loading = 'lazy'; card.appendChild(i); }
      card.appendChild(el('span', 'event-status', statusBn[ev.status] || ''));
      card.appendChild(el('h3', '', ev.title));
      if (ev.event_date) card.appendChild(el('p', '', fmtDate(ev.event_date)));
      if (ev.venue) card.appendChild(el('p', '', ev.venue));
      if (ev.description) card.appendChild(el('p', '', ev.description));
      box.appendChild(card);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const p = document.getElementById('posts-list');
    const e = document.getElementById('events-list');
    if (p) renderPosts(p);
    if (e) renderEvents(e);
  });
})();
