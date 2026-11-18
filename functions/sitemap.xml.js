// গুগলের জন্য স্বয়ংক্রিয় sitemap: /sitemap.xml
const SUPABASE_URL = 'https://rtnlibcgyckkmhmmftgv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ektSWLhyHfRDMJgwsyT5IQ_vqcp0s93';

export async function onRequestGet({ request }) {
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
