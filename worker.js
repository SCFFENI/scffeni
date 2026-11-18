// Cloudflare Worker: সাইটের স্ট্যাটিক ফাইল যেমন আছে তেমনই চলবে।
// শুধু দুটি ঠিকানা এই কোড সামলায়:
//   /p/<পোস্ট-id>  -> ফেসবুক প্রিভিউসহ পোস্টের পেজ
//   /sitemap.xml   -> গুগলের জন্য স্বয়ংক্রিয় sitemap
const SUPABASE_URL = 'https://rtnlibcgyckkmhmmftgv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ektSWLhyHfRDMJgwsyT5IQ_vqcp0s93'; // publishable key, সাইটে থাকা নিরাপদ
const SITE = 'সোনাগাজী কালচারাল ফোরাম, ফেনী';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const html = (body, status = 200, cache = 'public, max-age=60, s-maxage=300') =>
  new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': cache } });

async function renderPost(request, rawId) {
  const origin = new URL(request.url).origin;
  const id = String(rawId || '').replace(/\.html$/, '');

  if (!/^[0-9a-fA-F-]{36}$/.test(id)) return html('<p>পোস্টটি পাওয়া যায়নি।</p>', 404, 'no-store');

  const q = `select=id,title,author,content,image_url,share_image,created_at,category,categories(name)&id=eq.${id}&published=eq.true&limit=1`;
  let rows;
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/posts?${q}`, { headers: { apikey: SUPABASE_KEY } });
    if (!r.ok) throw new Error(String(r.status));
    rows = await r.json();
  } catch (e) {
    return html('<p>এই মুহূর্তে পোস্টটি লোড করা যাচ্ছে না। একটু পরে চেষ্টা করুন।</p>', 502, 'no-store');
  }
  const p = rows[0];
  if (!p) return html('<p>পোস্টটি পাওয়া যায়নি।</p>', 404, 'no-store');

  const text = (p.content || '').replace(/\s+/g, ' ').trim();
  const desc = text.length > 160 ? text.slice(0, 157) + '…' : text;
  const url = `${origin}/p/${p.id}`;
  const img = p.share_image || p.image_url || `${origin}/galla.jpg`;
  const sized = !!p.share_image;  // ১২০০×৬৩০ ছবি বানানো থাকলে মাপ জানানো হয়
  const cat = p.categories?.name || '';
  const date = new Date(p.created_at).toLocaleDateString('bn-BD',
    { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Dhaka' });

  const ld = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Article', headline: p.title, description: desc,
    image: [img], datePublished: p.created_at, mainEntityOfPage: url,
    ...(p.author ? { author: { '@type': 'Person', name: p.author } } : {}),
    publisher: { '@type': 'Organization', name: SITE }
  }).replace(/</g, '\\u003c');

  return html(`<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(p.title)} | ${SITE}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="${SITE}">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:locale" content="bn_BD">
<meta property="og:image" content="${esc(img)}">
<meta property="og:image:alt" content="${esc(p.title)}">
${sized ? '<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta property="og:image:type" content="image/jpeg">\n' : ''}
<meta property="og:url" content="${url}">
<meta property="article:published_time" content="${esc(p.created_at)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(p.title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(img)}">
${cat ? `<meta property="article:section" content="${esc(cat)}">\n` : ''}${p.author ? `<meta name="author" content="${esc(p.author)}">\n` : ''}<meta name="theme-color" content="#0b1a16">
<script type="application/ld+json">${ld}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&family=Hind+Siliguri:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--bg:#060d0b;--accent:#2dbd72;--text:#e8f5ee;--muted:#7aaa90;--border:rgba(45,189,114,.15)}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--text);font-family:'Hind Siliguri',sans-serif;line-height:1.8}
a{color:inherit;text-decoration:none}
.bar{background:rgba(6,13,11,.95);border-bottom:1px solid var(--border);padding:0 20px;height:60px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.bar strong{font-size:.95rem}.bar a.back{color:var(--accent);font-size:.9rem}
article{max-width:720px;margin:0 auto;padding:36px 20px 80px}
.cat{display:inline-block;background:rgba(45,189,114,.12);color:var(--accent);border:1px solid var(--border);border-radius:50px;padding:3px 14px;font-size:.8rem}
h1{font-family:'Tiro Bangla',serif;font-weight:400;font-size:clamp(1.7rem,5vw,2.4rem);line-height:1.4;margin:14px 0 8px}
.date{color:var(--muted);font-size:.85rem;margin-bottom:22px}
.cover{width:100%;max-height:420px;object-fit:cover;border-radius:14px;margin-bottom:26px}
.body{font-size:1.05rem;white-space:pre-wrap;word-wrap:break-word}
</style>
</head>
<body>
<div class="bar"><strong>${SITE}</strong><a class="back" href="/">← হোমে ফিরুন</a></div>
<article>
${cat ? `<a class="cat" href="/category.html?c=${encodeURIComponent(p.category)}">${esc(cat)}</a>\n` : ''}<h1>${esc(p.title)}</h1>
<div class="date">${p.author ? '✍ ' + esc(p.author) + ' • ' : ''}${date}</div>
${p.image_url ? `<img class="cover" src="${esc(p.image_url)}" alt="${esc(p.title)}">\n` : ''}<div class="body">${esc(p.content || '')}</div>
</article>
</body>
</html>
`);
}

async function renderSitemap(request) {
  const origin = new URL(request.url).origin;
  let ids = [];
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/posts?select=id&published=eq.true&order=created_at.desc&limit=1000`,
      { headers: { apikey: SUPABASE_KEY } });
    if (r.ok) ids = (await r.json()).map(p => p.id);
  } catch (e) { /* শুধু মূল পেজ থাকবে */ }
  const urls = [`${origin}/`, `${origin}/events.html`, ...ids.map(id => `${origin}/p/${id}`)];
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n') + '\n</urlset>\n';
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=300' } });
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    const m = pathname.match(/^\/p\/([^/]+)\/?$/);
    if (m && request.method === 'GET') return renderPost(request, decodeURIComponent(m[1]));
    if (pathname === '/sitemap.xml' && request.method === 'GET') return renderSitemap(request);
    return env.ASSETS.fetch(request);
  }
};
