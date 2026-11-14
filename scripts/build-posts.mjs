// Supabase-এর পোস্ট থেকে প্রতিটির জন্য আলাদা HTML (p/<id>.html) বানায়,
// যাতে ফেসবুক/হোয়াটসঅ্যাপ/গুগল শিরোনাম, ছবি ও লেখা পড়তে পারে।
import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, existsSync } from 'node:fs';

const BASE = 'https://scffeni.github.io/scffeni';
const SITE = 'সোনাগাজী কালচারাল ফোরাম, ফেনী';

// config.js থেকে URL ও key পড়ে (আলাদা করে কোথাও বসাতে হয় না)
const cfg = readFileSync('config.js', 'utf8');
const URL_ = (cfg.match(/SUPABASE_URL\s*=\s*'([^']+)'/) || [])[1];
const KEY = (cfg.match(/SUPABASE_ANON_KEY\s*=\s*'([^']+)'/) || [])[1];
if (!URL_ || !KEY) throw new Error('config.js থেকে URL/key পাওয়া যায়নি');

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const q = 'select=id,title,author,content,image_url,created_at,category,categories(name)'
  + '&published=eq.true&order=created_at.desc&limit=1000';
const res = await fetch(`${URL_}/rest/v1/posts?${q}`, { headers: { apikey: KEY } });
if (!res.ok) throw new Error('Supabase থেকে পোস্ট আনা যায়নি: ' + res.status + ' ' + await res.text());
const posts = await res.json();

mkdirSync('p', { recursive: true });
const keep = new Set();

for (const p of posts) {
  const text = (p.content || '').replace(/\s+/g, ' ').trim();
  const desc = text.length > 160 ? text.slice(0, 157) + '…' : text;
  const url = `${BASE}/p/${p.id}.html`;
  const img = p.image_url || `${BASE}/galla.jpg`;
  const cat = p.categories?.name || '';
  const date = new Date(p.created_at).toLocaleDateString('bn-BD',
    { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Dhaka' });

  const html = `<!DOCTYPE html>
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
<meta property="og:image" content="${esc(img)}">
<meta property="og:url" content="${url}">
<meta property="article:published_time" content="${esc(p.created_at)}">
<meta name="twitter:card" content="summary_large_image">
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
<div class="bar"><strong>${SITE}</strong><a class="back" href="../index.html">← হোমে ফিরুন</a></div>
<article>
${cat ? `<a class="cat" href="../category.html?c=${encodeURIComponent(p.category)}">${esc(cat)}</a>\n` : ''}<h1>${esc(p.title)}</h1>
<div class="date">${p.author ? '✍ ' + esc(p.author) + ' • ' : ''}${date}</div>
${p.image_url ? `<img class="cover" src="${esc(p.image_url)}" alt="${esc(p.title)}">\n` : ''}<div class="body">${esc(p.content || '')}</div>
</article>
</body>
</html>
`;
  const file = `p/${p.id}.html`;
  keep.add(`${p.id}.html`);
  if (!existsSync(file) || readFileSync(file, 'utf8') !== html) writeFileSync(file, html);
}

// মুছে ফেলা বা অপ্রকাশিত পোস্টের পেজ সরিয়ে ফেলে
for (const f of readdirSync('p')) {
  if (f.endsWith('.html') && !keep.has(f)) unlinkSync(`p/${f}`);
}

// sitemap.xml (গুগলের জন্য)
const urls = [`${BASE}/`, `${BASE}/events.html`, ...posts.map(p => `${BASE}/p/${p.id}.html`)];
writeFileSync('sitemap.xml',
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  + urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n') + '\n</urlset>\n');

console.log(`${posts.length}টি পোস্টের পেজ তৈরি হয়েছে।`);
