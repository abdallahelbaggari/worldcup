/* =================================================================
   WORLDCUP · functions/news.js · Cloudflare Pages Function
   Route: /news

   News pipeline: Live APIs → Validation → Dedup → Normalize → Cache
   Sources (in priority order):
     1. NewsAPI.org  — /everything?q=World+Cup+2026
     2. GNews API    — /search?q=World+Cup+2026&lang=en
     3. TheSportsDB  — news endpoint for match events
     4. RSS feeds    — BBC Sport, ESPN via allorigins proxy

   Env vars required (Cloudflare Dashboard → Settings → Variables):
     NEWS_API_KEY   — newsapi.org free key
     GNEWS_API_KEY  — gnews.io free key (optional backup)
================================================================= */

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type':                 'application/json',
};

const NEWS_TTL    = 300;   /* 5 min cache */
const MAX_AGE_MS  = 86400000 * 3;  /* 3 days — expire old articles */
const WC_KEYWORDS = ['world cup 2026', 'worldcup 2026', 'fifa 2026',
                     'wc2026', '2026 world cup'];
const WC_QUERIES  = 'world cup 2026 football';

function ok(data) {
  return new Response(JSON.stringify({ success:true, ts:Date.now(), count:data.length, articles:data }), {
    status: 200,
    headers: { ...CORS, 'Cache-Control': `public, max-age=${NEWS_TTL}` },
  });
}

function err(msg) {
  return new Response(JSON.stringify({ success:false, error:msg, articles:[] }), {
    status: 200,
    headers: CORS,
  });
}

/* ── Normalize article to consistent schema ── */
function normalize(article, source) {
  if (!article) return null;
  const title   = (article.title||article.headline||'').trim();
  const desc    = (article.description||article.content||article.body||'').trim();
  if (!title || title.toLowerCase().includes('[removed]')) return null;
  if (title.length < 10) return null;

  /* Reject if not WC-related */
  const text = (title+' '+desc).toLowerCase();
  const isWC = WC_KEYWORDS.some(function(kw){ return text.includes(kw); }) ||
               text.includes('world cup') || text.includes('worldcup');
  if (!isWC) return null;

  /* Parse and validate timestamp */
  const rawTs = article.publishedAt || article.date || article.pubDate ||
                article.published_date || null;
  let ts = rawTs ? new Date(rawTs).getTime() : Date.now();
  if (isNaN(ts)) ts = Date.now();

  /* Expire articles older than MAX_AGE_MS */
  if (Date.now() - ts > MAX_AGE_MS) return null;

  const imgUrl = article.image || article.urlToImage ||
                 (article.multimedia&&article.multimedia[0]&&article.multimedia[0].url) ||
                 null;

  /* Stable dedup ID from URL or title */
  const url = article.url || article.link || article.guid || '';
  const id  = url
    ? 'u-' + btoa(url.slice(-40)).replace(/[^a-zA-Z0-9]/g,'').slice(0,16)
    : 't-' + btoa(title.slice(0,30)).replace(/[^a-zA-Z0-9]/g,'').slice(0,16);

  return {
    id:        id,
    title:     title,
    summary:   desc.slice(0, 280),
    source:    article.source?.name || article.source || source || 'Unknown',
    author:    article.author || null,
    url:       url,
    imageUrl:  imgUrl,
    publishedAt: ts,
    publishedISO: new Date(ts).toISOString(),
    category:  classifyCategory(title+' '+desc),
  };
}

/* ── Classify article category from content ── */
function classifyCategory(text) {
  const t = text.toLowerCase();
  if (t.includes('goal') || t.includes('score') || t.includes(' vs ') ||
      t.includes('match') || t.includes('final score')) return 'match';
  if (t.includes('player') || t.includes('hat-trick') || t.includes('goal scorer') ||
      t.includes('penalty') || t.includes('midfielder') || t.includes('striker')) return 'player';
  if (t.includes('group') || t.includes('standings') || t.includes('table') ||
      t.includes('qualification')) return 'standings';
  if (t.includes('stadium') || t.includes('venue') || t.includes('host city') ||
      t.includes('host nation')) return 'tournament';
  if (t.includes('breaking') || t.includes('injury') || t.includes('suspend') ||
      t.includes('red card') || t.includes('ban')) return 'breaking';
  if (t.includes('statistic') || t.includes('xg') || t.includes('possession') ||
      t.includes('analysis') || t.includes('tactical')) return 'insights';
  return 'tournament';
}

/* ── Deduplicate by ID ── */
function dedup(articles) {
  const seen = new Set();
  return articles.filter(function(a) {
    if (!a || seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
}

/* ── Sort by recency ── */
function sortByDate(articles) {
  return articles.slice().sort(function(a,b){ return b.publishedAt - a.publishedAt; });
}

/* ── Fetch NewsAPI ── */
async function fetchNewsAPI(apiKey) {
  if (!apiKey) return [];
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(WC_QUERIES)}&language=en&sortBy=publishedAt&pageSize=30&apiKey=${apiKey}`;
  const res = await fetch(url, { headers:{'User-Agent':'WorldCup-App/1.0'} });
  if (!res.ok) throw new Error('NewsAPI HTTP '+res.status);
  const data = await res.json();
  if (data.status !== 'ok') throw new Error('NewsAPI: '+data.message);
  return (data.articles||[]).map(function(a){ return normalize(a,'NewsAPI'); }).filter(Boolean);
}

/* ── Fetch GNews API ── */
async function fetchGNews(apiKey) {
  if (!apiKey) return [];
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(WC_QUERIES)}&lang=en&max=20&apikey=${apiKey}`;
  const res = await fetch(url, { headers:{'User-Agent':'WorldCup-App/1.0'} });
  if (!res.ok) throw new Error('GNews HTTP '+res.status);
  const data = await res.json();
  return (data.articles||[]).map(function(a){ return normalize(a,'GNews'); }).filter(Boolean);
}

/* ── Fetch BBC Sport RSS via AllOrigins proxy ── */
async function fetchBBCRSS() {
  try {
    const rss = 'https://feeds.bbci.co.uk/sport/football/rss.xml';
    const url = `https://api.allorigins.win/get?url=${encodeURIComponent(rss)}`;
    const res = await fetch(url, { cf:{cacheTtl:300,cacheEverything:true} });
    if (!res.ok) return [];
    const body = await res.json();
    const xml  = body.contents||'';
    /* Parse RSS items */
    const items = [];
    const itemRe = /<item>([\s\S]*?)<\/item>/g;
    let m;
    while ((m = itemRe.exec(xml)) !== null) {
      const item  = m[1];
      const title = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
                     item.match(/<title>(.*?)<\/title>/))||['',''];
      const desc  = (item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) ||
                     item.match(/<description>(.*?)<\/description>/))||['',''];
      const link  = (item.match(/<link>(.*?)<\/link>/))||['',''];
      const pubD  = (item.match(/<pubDate>(.*?)<\/pubDate>/))||['',''];
      const encl  = item.match(/<enclosure[^>]*url="([^"]+)"/);
      items.push(normalize({
        title:       title[1],
        description: desc[1].replace(/<[^>]+>/g,'').slice(0,280),
        url:         link[1],
        publishedAt: pubD[1],
        image:       encl ? encl[1] : null,
        source:      'BBC Sport',
      },'BBC Sport'));
    }
    return items.filter(Boolean);
  } catch(e) {
    console.warn('[news] BBC RSS failed:', e.message);
    return [];
  }
}

/* ── Main handler ── */
export async function onRequestGet(context) {
  const NEWS_API_KEY = context.env.NEWS_API_KEY || '';
  const GNEWS_KEY    = context.env.GNEWS_API_KEY || '';
  const url          = new URL(context.request.url);
  const lang         = url.searchParams.get('lang') || 'en';
  const cat          = url.searchParams.get('cat')  || 'all';
  const limit        = Math.min(parseInt(url.searchParams.get('limit')||'40'), 60);

  console.log('[news] Request — lang:', lang, 'cat:', cat, 'keys:', !!NEWS_API_KEY, !!GNEWS_KEY);

  /* Try APIs in priority order */
  let articles = [];
  const errors = [];

  /* 1. NewsAPI (primary) */
  if (NEWS_API_KEY) {
    try {
      const na = await fetchNewsAPI(NEWS_API_KEY);
      articles = articles.concat(na);
      console.log('[news] NewsAPI:', na.length, 'articles');
    } catch(e) {
      errors.push('NewsAPI: '+e.message);
      console.warn('[news] NewsAPI failed:', e.message);
    }
  }

  /* 2. GNews (secondary) */
  if (GNEWS_KEY && articles.length < 10) {
    try {
      const gn = await fetchGNews(GNEWS_KEY);
      articles = articles.concat(gn);
      console.log('[news] GNews:', gn.length, 'articles');
    } catch(e) {
      errors.push('GNews: '+e.message);
    }
  }

  /* 3. BBC RSS (always try — no key needed) */
  try {
    const bbc = await fetchBBCRSS();
    articles = articles.concat(bbc);
    console.log('[news] BBC RSS:', bbc.length, 'articles');
  } catch(e) {
    errors.push('BBC: '+e.message);
  }

  /* Pipeline: dedup → sort → filter by cat → limit */
  articles = dedup(sortByDate(articles));

  if (cat !== 'all') {
    articles = articles.filter(function(a){ return a.category === cat; });
  }

  articles = articles.slice(0, limit);

  console.log('[news] Final:', articles.length, 'articles | Errors:', errors.join(', ')||'none');

  if (articles.length === 0) {
    return new Response(JSON.stringify({
      success:  false,
      error:    errors.length ? 'All sources failed: '+errors.join('; ')
                              : 'No API keys configured — add NEWS_API_KEY to Cloudflare Variables',
      hint:     'Add NEWS_API_KEY (newsapi.org free) or GNEWS_API_KEY (gnews.io free) in Cloudflare Dashboard → Settings → Environment Variables',
      articles: [],
      ts:       Date.now(),
    }), { status:200, headers:CORS });
  }

  return ok(articles);
}

export async function onRequestOptions() {
  return new Response(null, { status:200, headers:CORS });
}
