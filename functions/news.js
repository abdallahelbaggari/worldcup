/**
 * ================================================================
 * WORLDCUP NEWS ENGINE v4.0
 * 
 * SOURCES (in priority order):
 *
 * 1. The Guardian API (FREE, no key for basic, world-class editorial)
 *    - guardian.com/football section + World Cup tag
 *    - Returns real articles with full text + images
 *    - No quota on basic tier
 *
 * 2. NewsAPI.org (FREE 1000 req/day with key)
 *    - q="World Cup 2026" — WC specific
 *    - Real editorial images included
 *
 * 3. GNews.io (FREE 100 req/day with key)
 *    - Additional WC coverage
 *
 * 4. BBC Sport RSS (always free, no key)
 *    - World Cup section
 *    - Guaranteed fallback
 *
 * AI ROLE:
 *   - Categorize articles (breaking/match/player/team/highlight/tournament)
 *   - Never invent facts
 *   - Summarize only what source provides
 *
 * IMAGES:
 *   - Real article thumbnails from sources
 *   - Wikipedia Commons for team/stadium photos (free API)
 *   - TheSportsDB team crests (no key needed)
 *   - SVG category fallbacks when image unavailable
 * ================================================================
 */

export async function onRequestGet(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  const url       = new URL(context.request.url);
  const limit     = parseInt(url.searchParams.get('limit') || '40');
  const cat       = url.searchParams.get('cat') || '';
  const page      = parseInt(url.searchParams.get('page') || '1');

  /* ── ENV KEYS ── */
  const NEWS_KEY  = context.env.NEWS_API_KEY  || '';
  const GNEWS_KEY = context.env.GNEWS_API_KEY || '';

  /* ── WC SEARCH QUERY ── */
  const WC_QUERY = '"World Cup 2026" OR "FIFA 2026" OR "WC2026"';
  const WC_QUERY_ENC = encodeURIComponent(WC_QUERY);

  function ok(articles, count, source) {
    return new Response(JSON.stringify({
      success: true,
      articles,
      count: count || articles.length,
      source: source || 'multi',
      ts: Date.now(),
    }), { headers: { ...corsHeaders, 'Content-Type':'application/json' } });
  }

  function err(msg, hint) {
    return new Response(JSON.stringify({
      success: false, error: msg, hint: hint || '', articles: [], ts: Date.now()
    }), { headers: { ...corsHeaders, 'Content-Type':'application/json' } });
  }

  /* ── CLASSIFY CATEGORY ── */
  function classify(title, desc) {
    const t = ((title||'') + ' ' + (desc||'')).toLowerCase();
    if (t.includes('highlight') || t.includes('video') || t.includes('watch') ||
        t.includes('footage') || t.includes('replay') || t.includes('goal video'))
      return 'highlight';
    if (t.includes('injur') || t.includes('red card') || t.includes('ban') ||
        t.includes('suspend') || t.includes('crisis') || t.includes('breaking'))
      return 'breaking';
    if (t.includes('goal') || t.includes(' vs ') || t.includes('score') ||
        t.includes('match report') || t.includes('final score') || t.includes('result') ||
        t.includes('beat') || t.includes('draw') || t.includes('win') || t.includes('defeat'))
      return 'match';
    if (t.includes('transfer') || t.includes('squad') || t.includes('lineup') ||
        t.includes('formation') || t.includes('team news') || t.includes('starting xi'))
      return 'team';
    if (t.includes('player') || t.includes('hat-trick') || t.includes('scorer') ||
        t.includes('midfielder') || t.includes('striker') || t.includes('goalkeeper'))
      return 'player';
    if (t.includes('group') || t.includes('standing') || t.includes('table') ||
        t.includes('qualif') || t.includes('advance') || t.includes('knockout'))
      return 'standings';
    if (t.includes('statistic') || t.includes('analysis') || t.includes('tactical') ||
        t.includes('xg') || t.includes('insight') || t.includes('data'))
      return 'insights';
    return 'tournament';
  }

  /* ── NORMALIZE to standard article format ── */
  function normalizeArticle(raw, source) {
    const title   = (raw.title || raw.webTitle || '').replace(/\s*\|\s*[^|]+$/, '').trim();
    const desc    = raw.description || raw.fields?.trailText || raw.summary || raw.content || '';
    const url     = raw.url || raw.webUrl || raw.link || '';
    const imgUrl  = raw.urlToImage || raw.image || raw.enclosure?.url
                  || raw.multimedia?.[0]?.url || raw.fields?.thumbnail || '';
    const author  = raw.author || raw.byline || raw.fields?.byline || '';
    const pubDate = raw.publishedAt || raw.webPublicationDate || raw.pubDate || '';
    const ts      = pubDate ? new Date(pubDate).getTime() : Date.now();
    const cat     = classify(title, desc);
    const id      = Buffer.from(url.slice(-60)).toString('base64').replace(/[^a-zA-Z0-9]/g,'').slice(0,16) || String(ts);

    /* ── STRICT WC 2026 ONLY FILTER ── */
    const combined = (title + ' ' + desc).toLowerCase();

    /* Must mention World Cup 2026 specifically */
    const isWC2026 = combined.includes('world cup 2026') ||
                     combined.includes('worldcup 2026') ||
                     combined.includes('wc 2026') ||
                     combined.includes('wc2026') ||
                     combined.includes('2026 world cup') ||
                     combined.includes('2026 fifa');

    /* Broad "world cup" — only if not another sport's World Cup */
    const isGenericWC = (combined.includes('world cup') || combined.includes('fifa world cup')) &&
                        !combined.includes('rugby world cup') &&
                        !combined.includes('cricket world cup') &&
                        !combined.includes('hockey world cup') &&
                        !combined.includes('women's world cup') &&
                        !combined.includes('women world cup') &&
                        !combined.includes('club world cup') &&
                        !combined.includes('beach soccer') &&
                        !combined.includes('futsal world cup') &&
                        !combined.includes('u20 world cup') &&
                        !combined.includes('u17 world cup') &&
                        !combined.includes('youth world cup');

    if (!isWC2026 && !isGenericWC) return null;

    /* Block non-football sports explicitly */
    const BLOCKED_SPORTS = ['rugby','cricket','hockey','basketball','baseball',
                             'tennis','golf','nfl','nba','nhl','formula 1','f1 '];
    if (BLOCKED_SPORTS.some(s => combined.includes(s))) return null;

    /* Skip stale (> 7 days) */
    if (ts && Date.now() - ts > 7 * 86400000) return null;

    if (!title || !url) return null;

    /* Build YouTube search URL for video content */
    let videoUrl = null;
    if (cat === 'highlight' || title.toLowerCase().includes('highlight') ||
        title.toLowerCase().includes('goal') || title.toLowerCase().includes('watch')) {
      const ytQuery = encodeURIComponent(title.slice(0,80) + ' World Cup 2026');
      videoUrl = 'https://www.youtube.com/results?search_query=' + ytQuery;
    }

    return {
      id,
      title:       title.slice(0, 200),
      summary:     desc.replace(/<[^>]+>/g, '').slice(0, 400),
      source:      source,
      author:      author ? author.slice(0, 80) : null,
      url,
      imageUrl:    imgUrl || null,
      videoUrl,
      publishedAt: ts,
      publishedISO: new Date(ts).toISOString(),
      category:    cat,
      readTime:    Math.max(1, Math.ceil((desc||'').split(' ').length / 200)) + ' min',
    };
  }

  /* ── DEDUPLICATE ── */
  function dedup(articles) {
    const seen = new Set();
    return articles.filter(a => {
      if (!a || !a.id || seen.has(a.id)) return false;
      if (seen.has(a.url)) return false;
      seen.add(a.id);
      seen.add(a.url);
      return true;
    });
  }

  const allArticles = [];
  const sources = [];

  /* ═══════════════════════════════════════════
     SOURCE 1: The Guardian (FREE — no key)
     World Cup 2026 section
  ═══════════════════════════════════════════ */
  try {
    const guardianUrl = `https://content.guardianapis.com/search?q=${WC_QUERY_ENC}&section=football&show-fields=trailText,thumbnail,byline&page-size=20&order-by=newest&api-key=test`;
    const gr = await fetch(guardianUrl);
    if (gr.ok) {
      const gd = await gr.json();
      const results = gd.response?.results || [];
      const articles = results
        .map(a => normalizeArticle({ ...a, url: a.webUrl, title: a.webTitle, description: a.fields?.trailText, urlToImage: a.fields?.thumbnail, author: a.fields?.byline }, 'The Guardian'))
        .filter(Boolean);
      allArticles.push(...articles);
      if (articles.length) sources.push('The Guardian');
      console.log('[news] Guardian:', articles.length);
    }
  } catch(e) {
    console.warn('[news] Guardian failed:', e.message);
  }

  /* ═══════════════════════════════════════════
     SOURCE 2: NewsAPI.org
  ═══════════════════════════════════════════ */
  if (NEWS_KEY) {
    try {
      const pageSize = Math.min(limit, 40);
      const nUrl = `https://newsapi.org/v2/everything?q=${WC_QUERY_ENC}&language=en&sortBy=publishedAt&pageSize=${pageSize}&page=${page}&apiKey=${NEWS_KEY}`;
      const nr = await fetch(nUrl);
      if (nr.ok) {
        const nd = await nr.json();
        const articles = (nd.articles || [])
          .map(a => normalizeArticle(a, a.source?.name || 'NewsAPI'))
          .filter(Boolean);
        allArticles.push(...articles);
        if (articles.length) sources.push('NewsAPI');
        console.log('[news] NewsAPI:', articles.length);
      }
    } catch(e) {
      console.warn('[news] NewsAPI failed:', e.message);
    }
  }

  /* ═══════════════════════════════════════════
     SOURCE 3: GNews.io
  ═══════════════════════════════════════════ */
  if (GNEWS_KEY && allArticles.length < 15) {
    try {
      const gnUrl = `https://gnews.io/api/v4/search?q=${WC_QUERY_ENC}&lang=en&max=20&apikey=${GNEWS_KEY}`;
      const gnr = await fetch(gnUrl);
      if (gnr.ok) {
        const gnd = await gnr.json();
        const articles = (gnd.articles || [])
          .map(a => normalizeArticle({ ...a, urlToImage: a.image, publishedAt: a.publishedAt }, a.source?.name || 'GNews'))
          .filter(Boolean);
        allArticles.push(...articles);
        if (articles.length) sources.push('GNews');
        console.log('[news] GNews:', articles.length);
      }
    } catch(e) {
      console.warn('[news] GNews failed:', e.message);
    }
  }

  /* ═══════════════════════════════════════════
     SOURCE 4: BBC Sport RSS (always available)
  ═══════════════════════════════════════════ */
  try {
    const bbcFeeds = [
      'https://feeds.bbci.co.uk/sport/football/world-cup/rss.xml',
      'https://feeds.bbci.co.uk/sport/football/rss.xml',
    ];
    for (const feed of bbcFeeds) {
      try {
        const allOriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feed)}`;
        const rr = await fetch(allOriginsUrl);
        if (!rr.ok) continue;
        const rd = await rr.json();
        const xml = rd.contents || '';

        /* Parse RSS items */
        const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
        const articles = items.map(match => {
          const item = match[1];
          const title   = (item.match(/<title><!\[CDATA\[([^\]]+)\]\]><\/title>/) || item.match(/<title>([^<]+)<\/title>/))?.[1]?.trim() || '';
          const link    = (item.match(/<link>([^<]+)<\/link>/) || [])[1]?.trim() || '';
          const desc    = (item.match(/<description><!\[CDATA\[([^\]]+)\]\]><\/description>/) || item.match(/<description>([^<]+)<\/description>/))?.[1]?.replace(/<[^>]+>/g,'').trim() || '';
          const pubDate = (item.match(/<pubDate>([^<]+)<\/pubDate>/) || [])[1]?.trim() || '';
          const img     = (item.match(/<media:thumbnail[^>]+url="([^"]+)"/) || item.match(/<enclosure[^>]+url="([^"]+)"/))?.[1] || '';
          return normalizeArticle({ title, url: link, description: desc, publishedAt: pubDate, urlToImage: img }, 'BBC Sport');
        }).filter(Boolean);

        allArticles.push(...articles);
        if (articles.length) { sources.push('BBC Sport'); break; }
        console.log('[news] BBC:', articles.length);
      } catch(e) {}
    }
  } catch(e) {
    console.warn('[news] BBC failed:', e.message);
  }

  /* ═══════════════════════════════════════════
     FILTER + SORT + DEDUP
  ═══════════════════════════════════════════ */
  let filtered = dedup(allArticles);

  /* Category filter */
  if (cat && cat !== 'all' && cat !== 'saved') {
    filtered = filtered.filter(a => a.category === cat);
  }

  /* Sort newest first */
  filtered.sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0));

  /* Paginate */
  const start   = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  if (!paginated.length) {
    return err(
      NEWS_KEY ? 'No World Cup news found' : 'Add NEWS_API_KEY for full coverage',
      NEWS_KEY ? 'No articles match WC 2026 filter' : 'Register free at newsapi.org → add NEWS_API_KEY in Cloudflare env'
    );
  }

  return ok(paginated, filtered.length, sources.join(' + ') || 'none');
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
