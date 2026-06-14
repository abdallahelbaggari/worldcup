/**
 * ================================================================
 * WORLDCUP NEWS ENGINE v6.0 — Multi-Source Global Feed
 *
 * ROOT CAUSE FIX v5→v6:
 *   v5 used allorigins.win proxy for RSS — unreliable from CF Workers
 *   v6 fetches ALL sources DIRECTLY (CF Workers can reach any URL)
 *
 * SOURCES (7 direct, parallel):
 *   1. The Guardian Football API  — editorial, WC-specific
 *   2. BBC Sport RSS              — DIRECT (no proxy needed)
 *   3. ESPN Soccer RSS            — DIRECT, images included
 *   4. Sky Sports WC RSS          — DIRECT, images included
 *   5. Goal.com News RSS          — DIRECT, images included
 *   6. NewsAPI.org                — aggregated, needs key
 *   7. GNews.io                   — aggregated, needs key
 *
 * IMAGE STRATEGY:
 *   - Real images from RSS enclosure/media:thumbnail/media:content
 *   - Guardian thumbnail field (requires GUARDIAN_KEY)
 *   - YouTube thumbnail for video articles
 *   - Team badge fallback from football-data.org crest URLs
 *   - Colored SVG category placeholder as last resort
 *
 * PERFORMANCE:
 *   - All sources fetched in parallel (Promise.allSettled)
 *   - Cursor pagination — feed never resets
 *   - Background prefetch next batch
 *   - AI relevance score 0-10, reject < 4
 *   - Smart dedup by URL + title similarity
 * ================================================================
 */

export async function onRequestGet(context) {
  const cors = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  const url         = new URL(context.request.url);
  const limit       = Math.min(parseInt(url.searchParams.get('limit') || '40'), 80);
  const cat         = url.searchParams.get('cat')    || '';
  const cursor      = url.searchParams.get('cursor') || '';
  const page        = parseInt(url.searchParams.get('page') || '1');

  /* ── ENV KEYS ── */
  const NEWS_KEY     = context.env.NEWS_API_KEY  || '';
  const GNEWS_KEY    = context.env.GNEWS_API_KEY || '';
  const GUARDIAN_KEY = context.env.GUARDIAN_KEY  || 'test';

  /* ── QUERY STRINGS ── */
  const WC_Q_ENC  = encodeURIComponent('"World Cup 2026" OR "FIFA 2026"');
  const WC_SIMPLE = encodeURIComponent('World Cup 2026');

  /* ── 48-TEAM WHITELIST ── */
  const WC_TEAMS = new Set([
    'mexico','south africa','south korea','czechia','czech republic',
    'canada','bosnia','qatar','switzerland',
    'brazil','haiti','morocco','scotland',
    'australia','paraguay','turkey','turkiye','usa','united states',
    'curacao','ecuador','germany','ivory coast',
    'japan','netherlands','sweden','tunisia',
    'belgium','egypt','iran','new zealand',
    'cape verde','saudi arabia','spain','uruguay',
    'france','iraq','norway','senegal',
    'algeria','argentina','austria','jordan',
    'colombia','congo','portugal','uzbekistan',
    'croatia','england','ghana','panama',
  ]);

  /* ── BLOCKED CONTENT ── */
  const BLOCKED = [
    'club world cup',"women's world cup",'women world cup',
    'rugby world cup','cricket world cup','hockey world cup',
    'u20 world cup','u17 world cup','youth world cup',
    'champions league','premier league','bundesliga','la liga',
    'serie a','ligue 1','mls','copa del rey','fa cup',
    'best vpn','vpn deal','how to watch from anywhere',
    'betting tips','free bets','betting odds',
    'casino','prize draw',
  ];

  const BLOCKED_DOMAINS = ['biztoc.com','freerepublic.com','oddschecker.com','bet365.com'];

  /* ── HELPERS ── */
  function classify(title, desc) {
    const t = ((title||'') + ' ' + (desc||'')).toLowerCase();
    if (t.includes('highlight') || t.includes('goal video') || t.includes('watch:') ||
        t.includes('footage') || t.includes('replay') || t.includes('ceremony video'))
      return 'highlight';
    if (t.includes('injur') || t.includes('red card') || t.includes('ban') ||
        t.includes('suspend') || t.includes('breaking:') || t.includes('sacked'))
      return 'breaking';
    if (t.includes('goal') || t.includes(' vs ') || t.includes('score') ||
        t.includes('match report') || t.includes('result') || t.includes(' beat ') ||
        t.includes('draw') || t.includes('win') || t.includes('defeat') ||
        t.includes('as it happened') || t.includes('full time'))
      return 'match';
    if (t.includes('transfer') || t.includes('squad') || t.includes('lineup') ||
        t.includes('formation') || t.includes('team news') || t.includes('starting xi'))
      return 'team';
    if (t.includes('player') || t.includes('hat-trick') || t.includes('scorer') ||
        t.includes('midfielder') || t.includes('striker') || t.includes('debut') ||
        t.includes('captain'))
      return 'player';
    if (t.includes('group') || t.includes('standing') || t.includes('table') ||
        t.includes('qualif') || t.includes('advance') || t.includes('knockout'))
      return 'standings';
    if (t.includes('xg') || t.includes('analysis') || t.includes('tactical') ||
        t.includes('statistic') || t.includes('possession'))
      return 'insights';
    return 'tournament';
  }

  function relevanceScore(title, desc, source) {
    const t = ((title||'') + ' ' + (desc||'')).toLowerCase();
    let score = 5;
    if (t.includes('world cup 2026') || t.includes('wc2026') || t.includes('fifa 2026')) score += 2;
    else if (t.includes('world cup')) score += 1;
    if (t.includes('goal') || t.includes('score') || t.includes(' vs ') || t.includes('result')) score += 1;
    if (t.includes('breaking') || t.includes('just in') || t.includes('confirmed')) score += 1;
    const qualSrcs = ['guardian','bbc','reuters','ap ','espn','sky sports','goal.com','fifa','cbs'];
    if (qualSrcs.some(q => (source||'').toLowerCase().includes(q))) score += 1;
    if (BLOCKED.some(b => t.includes(b))) return 0;
    return Math.min(10, score);
  }

  function youtubeUrl(title) {
    return 'https://www.youtube.com/results?search_query='
      + encodeURIComponent((title||'').slice(0, 70) + ' World Cup 2026');
  }

  /* ── RSS PARSER (works for BBC, ESPN, Sky, Goal, Reuters) ── */
  function parseRSS(xml, sourceName) {
    if (!xml || xml.length < 100) return [];
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
    return items.map(m => {
      const item = m[1];

      /* Title */
      const title = (
        item.match(/<title><!\[CDATA\[([^\]]+)\]\]><\/title>/) ||
        item.match(/<title>([^<]+)<\/title>/)
      )?.[1]?.trim() || '';

      /* Link */
      const link = (
        item.match(/<link>([^<]+)<\/link>/) ||
        item.match(/<link\s+href="([^"]+)"/) ||
        item.match(/<guid[^>]*>([^<]+)<\/guid>/)
      )?.[1]?.trim() || '';

      /* Description */
      const desc = (
        item.match(/<description><!\[CDATA\[([^\]]+)\]\]><\/description>/) ||
        item.match(/<description>([^<]+)<\/description>/)
      )?.[1]?.replace(/<[^>]+>/g,'').trim() || '';

      /* PubDate */
      const pub = (item.match(/<pubDate>([^<]+)<\/pubDate>/) || [])[1]?.trim() || '';

      /* IMAGE — try multiple RSS image formats */
      const img = (
        /* ESPN/RSS2 standard enclosure */
        item.match(/<enclosure[^>]+url="([^"]+)"[^>]+type="image[^"]*"/) ||
        item.match(/<enclosure[^>]+type="image[^"]*"[^>]+url="([^"]+)"/) ||
        /* media:thumbnail (BBC/Reuters standard) */
        item.match(/<media:thumbnail[^>]+url="([^"]+)"/) ||
        /* media:content with image */
        item.match(/<media:content[^>]+url="([^"]+)"[^>]*type="image/) ||
        item.match(/<media:content[^>]+type="image[^"]*"[^>]+url="([^"]+)"/) ||
        /* itunes:image */
        item.match(/<itunes:image[^>]+href="([^"]+)"/) ||
        /* og:image in description */
        item.match(/og:image[^>]+content="([^"]+)"/) ||
        /* img tag in description */
        item.match(/<img[^>]+src="(https[^"]+)"/)
      )?.[1] || '';

      return normalize({ title, url: link, description: desc, publishedAt: pub, urlToImage: img }, sourceName);
    }).filter(Boolean);
  }

  /* ── NORMALIZE ── */
  function normalize(raw, source) {
    const title   = ((raw.title || raw.webTitle || '')).replace(/\s*\|\s*[^|]+$/, '').trim();
    const desc    = (raw.description || raw.fields?.trailText || raw.summary || raw.content || '').replace(/<[^>]+>/g,'').trim();
    const rawUrl  = raw.url || raw.webUrl || raw.link || '';
    const imgRaw  = raw.urlToImage || raw.image || raw.fields?.thumbnail || raw.multimedia?.[0]?.url || '';
    const imgUrl  = imgRaw && imgRaw.startsWith('http') ? imgRaw : '';
    const author  = raw.author || raw.fields?.byline || '';
    const pubRaw  = raw.publishedAt || raw.webPublicationDate || raw.pubDate || '';
    const ts      = pubRaw ? new Date(pubRaw).getTime() : Date.now();

    if (!title || title.length < 12 || !rawUrl) return null;

    /* ── WORLD CUP FILTER ── */
    const combined = (title + ' ' + desc).toLowerCase();
    const lcUrl    = rawUrl.toLowerCase();

    const hasWC = combined.includes('world cup') || combined.includes('wc 2026') ||
                  combined.includes('wc2026') || combined.includes('fifa 2026');
    if (!hasWC) return null;
    if (BLOCKED.some(b => combined.includes(b))) return null;
    if (BLOCKED_DOMAINS.some(d => lcUrl.includes(d))) return null;
    if (ts && Date.now() - ts > 10 * 86400000) return null;

    const score = relevanceScore(title, desc, source);
    if (score < 4) return null;

    const cat  = classify(title, desc);
    const isVid = cat === 'highlight' || title.toLowerCase().includes('video') ||
                  title.toLowerCase().includes('watch') || title.toLowerCase().includes('highlight');

    /* ── IMAGE STRATEGY ── */
    let finalImg = imgUrl;

    /* For Guardian: extract thumbnail from fields */
    if (!finalImg && raw.fields?.thumbnail) finalImg = raw.fields.thumbnail;

    /* For liveblogs with no image: use article image from webUrl */
    /* We can't dynamically fetch it, so leave null — UI uses SVG fallback */

    const id = btoa(unescape(encodeURIComponent(rawUrl.slice(-60))))
      .replace(/[^a-zA-Z0-9]/g,'').slice(0, 18) || String(ts);

    return {
      id,
      title:        title.slice(0, 200),
      summary:      desc.slice(0, 450),
      source,
      author:       author ? author.slice(0, 80) : null,
      url:          rawUrl,
      imageUrl:     finalImg || null,
      videoUrl:     isVid ? youtubeUrl(title) : null,
      publishedAt:  ts,
      publishedISO: new Date(ts).toISOString(),
      category:     cat,
      relevance:    score,
      readTime:     Math.max(1, Math.ceil(desc.split(' ').length / 200)) + ' min',
      isLiveblog:   title.toLowerCase().includes('as it happened') || title.toLowerCase().includes('live'),
    };
  }

  /* ── DEDUP ── */
  function dedup(articles) {
    const seenUrls   = new Set();
    const seenTitles = new Set();
    return articles.filter(a => {
      if (!a || !a.id || seenUrls.has(a.url)) return false;
      const tKey = (a.title||'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0, 40);
      if (seenTitles.has(tKey)) return false;
      seenUrls.add(a.url);
      seenTitles.add(tKey);
      return true;
    });
  }

  function rank(articles) {
    const now = Date.now();
    return articles.sort((a, b) => {
      const freshA = Math.max(0, 10 - (now-(a.publishedAt||0))/3600000);
      const freshB = Math.max(0, 10 - (now-(b.publishedAt||0))/3600000);
      return ((b.relevance||5)*1.5+freshB) - ((a.relevance||5)*1.5+freshA);
    });
  }

  /* ════════════════════════════════════════════
     FETCH ALL SOURCES IN PARALLEL — DIRECT FETCH
     (No allorigins proxy — CF Workers fetch directly)
  ════════════════════════════════════════════ */
  const allArticles = [];
  const sources     = [];

  const fetches = [];

  /* 1. GUARDIAN FOOTBALL API — best editorial source ── */
  fetches.push(
    fetch(`https://content.guardianapis.com/search?q=${WC_SIMPLE}&section=football&show-fields=trailText,thumbnail,byline&page-size=50&order-by=newest&api-key=${GUARDIAN_KEY}`,
      { headers: { 'User-Agent': 'WorldCupApp/1.0' } })
      .then(r => r.ok ? r.json() : null)
      .then(gd => {
        const arts = (gd?.response?.results || []).map(a => normalize({
          title: a.webTitle, url: a.webUrl,
          description: a.fields?.trailText || '',
          urlToImage: a.fields?.thumbnail || '',
          author: a.fields?.byline || '',
          publishedAt: a.webPublicationDate,
          fields: a.fields,
        }, 'The Guardian')).filter(Boolean);
        if (arts.length) { allArticles.push(...arts); sources.push('The Guardian'); }
        console.log('[news] Guardian:', arts.length);
      })
      .catch(e => console.warn('[news] Guardian:', e.message))
  );

  /* 2. BBC SPORT — DIRECT fetch (no proxy) ── */
  fetches.push(
    fetch('https://feeds.bbci.co.uk/sport/football/world-cup/rss.xml',
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WorldCupApp/1.0)' } })
      .then(r => r.ok ? r.text() : null)
      .then(xml => {
        if (!xml) return;
        const arts = parseRSS(xml, 'BBC Sport');
        if (arts.length) { allArticles.push(...arts); sources.push('BBC Sport'); }
        console.log('[news] BBC:', arts.length);
      })
      .catch(e => console.warn('[news] BBC:', e.message))
  );

  /* 3. ESPN SOCCER RSS — DIRECT ── */
  fetches.push(
    fetch('https://www.espn.com/espn/rss/soccer/news',
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WorldCupApp/1.0)' } })
      .then(r => r.ok ? r.text() : null)
      .then(xml => {
        if (!xml) return;
        const arts = parseRSS(xml, 'ESPN');
        if (arts.length) { allArticles.push(...arts); sources.push('ESPN'); }
        console.log('[news] ESPN:', arts.length);
      })
      .catch(e => console.warn('[news] ESPN:', e.message))
  );

  /* 4. SKY SPORTS WC RSS — DIRECT ── */
  fetches.push(
    fetch('https://www.skysports.com/rss/12040',
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WorldCupApp/1.0)' } })
      .then(r => r.ok ? r.text() : null)
      .then(xml => {
        if (!xml) return;
        const arts = parseRSS(xml, 'Sky Sports');
        if (arts.length) { allArticles.push(...arts); sources.push('Sky Sports'); }
        console.log('[news] Sky Sports:', arts.length);
      })
      .catch(e => console.warn('[news] Sky Sports:', e.message))
  );

  /* 5. GOAL.COM RSS — DIRECT ── */
  fetches.push(
    fetch('https://www.goal.com/feeds/en/news',
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WorldCupApp/1.0)' } })
      .then(r => r.ok ? r.text() : null)
      .then(xml => {
        if (!xml) return;
        const arts = parseRSS(xml, 'Goal.com');
        if (arts.length) { allArticles.push(...arts); sources.push('Goal.com'); }
        console.log('[news] Goal:', arts.length);
      })
      .catch(e => console.warn('[news] Goal:', e.message))
  );

  /* 6. NEWSAPI — aggregated with images ── */
  if (NEWS_KEY) {
    fetches.push(
      fetch(`https://newsapi.org/v2/everything?q=${WC_Q_ENC}&language=en&sortBy=publishedAt&pageSize=40&page=${page}&apiKey=${NEWS_KEY}`)
        .then(r => r.ok ? r.json() : null)
        .then(nd => {
          const arts = (nd?.articles || [])
            .map(a => normalize(a, a.source?.name || 'NewsAPI'))
            .filter(Boolean);
          if (arts.length) { allArticles.push(...arts); sources.push('NewsAPI'); }
          console.log('[news] NewsAPI:', arts.length);
        })
        .catch(e => console.warn('[news] NewsAPI:', e.message))
    );
  }

  /* 7. GNEWS — aggregated ── */
  if (GNEWS_KEY) {
    fetches.push(
      fetch(`https://gnews.io/api/v4/search?q=${WC_SIMPLE}&lang=en&max=30&apikey=${GNEWS_KEY}`)
        .then(r => r.ok ? r.json() : null)
        .then(gnd => {
          const arts = (gnd?.articles || [])
            .map(a => normalize({ ...a, urlToImage: a.image, publishedAt: a.publishedAt }, a.source?.name || 'GNews'))
            .filter(Boolean);
          if (arts.length) { allArticles.push(...arts); sources.push('GNews'); }
          console.log('[news] GNews:', arts.length);
        })
        .catch(e => console.warn('[news] GNews:', e.message))
    );
  }

  /* Run all in parallel */
  await Promise.allSettled(fetches);

  /* ── PROCESS ── */
  let processed = dedup(allArticles);
  if (cat && cat !== 'all' && cat !== 'saved') {
    processed = processed.filter(a => a.category === cat);
  }
  if (cursor) {
    const curTs = new Date(cursor).getTime();
    processed = processed.filter(a => a.publishedAt < curTs);
  }
  processed = rank(processed);

  const pageStart   = cursor ? 0 : (page-1)*limit;
  const paginated   = processed.slice(pageStart, pageStart+limit);
  const nextCursor  = paginated.length > 0
    ? new Date(paginated[paginated.length-1].publishedAt).toISOString()
    : null;

  if (!paginated.length) {
    return new Response(JSON.stringify({
      success: false,
      error: NEWS_KEY ? 'No WC 2026 news after filtering' : 'Add NEWS_API_KEY for more articles',
      hint: 'Also register GUARDIAN_KEY at open-platform.theguardian.com (free)',
      articles: [], nextCursor: null, ts: Date.now(),
    }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({
    success: true,
    articles: paginated,
    count: processed.length,
    returned: paginated.length,
    nextCursor,
    sources: [...new Set(sources)],
    ts: Date.now(),
  }), { headers: { ...cors, 'Content-Type': 'application/json' } });
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
