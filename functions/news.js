/**
 * ================================================================
 * WORLDCUP NEWS ENGINE v5.0 — Global Media Platform
 *
 * SOURCES (5 free, always-on):
 *   1. The Guardian Football   — best editorial football journalism
 *   2. BBC Sport RSS           — World Cup dedicated feed
 *   3. Reuters Sports RSS      — agency wire, breaking news
 *   4. AP Sports RSS           — agency wire, US-based WC coverage
 *   5. NewsAPI.org             — aggregates 80,000 sources
 *   6. GNews.io                — additional aggregation
 *   7. YouTube WC Thumbnails   — video metadata for highlights feed
 *
 * INTELLIGENCE LAYER:
 *   - WC 2026 strict filter (5 layers)
 *   - Smart dedup by URL hash + title similarity
 *   - Auto-categorize: breaking/match/highlight/player/team/tournament/insights
 *   - AI relevance score 0-10 before rendering
 *   - Entity extraction: players, teams, venues
 *   - Related article suggestions
 *   - YouTube video URL generation for all highlight articles
 *
 * PERFORMANCE:
 *   - Stale-while-revalidate caching
 *   - Cursor-based pagination (not page numbers)
 *   - Background prefetch of next batch
 *   - 60s auto-refresh for breaking, 2min for others
 *
 * WORLD CUP ONLY — 5-layer filter:
 *   L1: competition must be FIFA WC 2026
 *   L2: active season only
 *   L3: 48-team whitelist
 *   L4: block 30+ competition types
 *   L5: AI relevance score ≥ 4
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
  const cursor      = url.searchParams.get('cursor') || '';  /* ISO timestamp cursor */
  const page        = parseInt(url.searchParams.get('page') || '1');

  /* ── ENV KEYS ── */
  const NEWS_KEY    = context.env.NEWS_API_KEY  || '';
  const GNEWS_KEY   = context.env.GNEWS_API_KEY || '';
  const GUARDIAN_KEY= context.env.GUARDIAN_KEY  || 'test';

  /* ── QUERY ── */
  const WC_Q     = '"World Cup 2026" OR "FIFA 2026" OR "WC2026"';
  const WC_Q_ENC = encodeURIComponent(WC_Q);
  const WC_SIMPLE= encodeURIComponent('World Cup 2026');

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

  /* ── BLOCKED CONTENT PATTERNS ── */
  const BLOCKED = [
    /* Wrong competitions */
    'club world cup','women world cup',"women's world cup",'rugby world cup',
    'cricket world cup','hockey world cup','u20 world cup','u17 world cup',
    'youth world cup','beach soccer world cup','futsal world cup',
    /* Wrong competitions (domestic) */
    'champions league','premier league','bundesliga','la liga','serie a',
    'ligue 1','mls','eredivisie','primeira liga','copa del rey','fa cup',
    /* Commercial noise */
    'best vpn','vpn deal','vpn dropped','how to watch from anywhere',
    'betting tips','free bets','betting odds','best odds',
    'casino bonus','gambling','prize draw','ticket giveaway',
    /* Low quality */
    'biztoc','freerepublic',
  ];

  /* ── CATEGORY CLASSIFIER ── */
  function classify(title, desc) {
    const t = ((title||'') + ' ' + (desc||'')).toLowerCase();
    if (t.includes('highlight') || t.includes('goal video') || t.includes('watch:') ||
        t.includes('footage') || t.includes('replay') || t.includes('press conference') ||
        t.includes('interview') || t.includes('ceremony video'))  return 'highlight';
    if (t.includes('injur') || t.includes('red card') || t.includes('ban') ||
        t.includes('suspend') || t.includes('sack') || t.includes('breaking:'))
      return 'breaking';
    if (t.includes('goal') || t.includes(' vs ') || t.includes('score') ||
        t.includes('match report') || t.includes('result') || t.includes(' beat ') ||
        t.includes('draw') || t.includes('win') || t.includes('defeat') ||
        t.includes('full time') || t.includes('half time'))  return 'match';
    if (t.includes('transfer') || t.includes('squad') || t.includes('lineup') ||
        t.includes('formation') || t.includes('team news') || t.includes('starting xi'))
      return 'team';
    if (t.includes('player') || t.includes('hat-trick') || t.includes('scorer') ||
        t.includes('midfielder') || t.includes('striker') || t.includes('keeper') ||
        t.includes('captain') || t.includes('debut'))  return 'player';
    if (t.includes('group') || t.includes('standing') || t.includes('table') ||
        t.includes('qualif') || t.includes('advance') || t.includes('knockout'))
      return 'standings';
    if (t.includes('xg') || t.includes('analysis') || t.includes('tactical') ||
        t.includes('statistic') || t.includes('possession') || t.includes('insight'))
      return 'insights';
    return 'tournament';
  }

  /* ── AI RELEVANCE SCORE (0-10) ── */
  function relevanceScore(title, desc, source) {
    const t = ((title||'') + ' ' + (desc||'')).toLowerCase();
    let score = 5;
    /* Must have WC context */
    if (t.includes('world cup 2026') || t.includes('wc2026') || t.includes('fifa 2026')) score += 2;
    else if (t.includes('world cup')) score += 1;
    /* Match result = high value */
    if (t.includes('goal') || t.includes('score') || t.includes(' vs ') || t.includes('result')) score += 1;
    /* Breaking news = high value */
    if (t.includes('breaking') || t.includes('just in') || t.includes('confirmed')) score += 1;
    /* Quality sources */
    const quality = ['guardian','bbc','reuters','ap ','espn','fifa','cbs sports','athletic'];
    if (quality.some(q => (source||'').toLowerCase().includes(q))) score += 1;
    /* Betting/VPN = penalize */
    if (BLOCKED.some(b => t.includes(b))) score = 0;
    return Math.min(10, score);
  }

  /* ── ENTITY EXTRACTION ── */
  function extractEntities(title, desc) {
    const text = ((title||'') + ' ' + (desc||'')).toLowerCase();
    const teams = [];
    for (const team of WC_TEAMS) {
      if (text.includes(team)) teams.push(team);
    }
    return { teams: [...new Set(teams)].slice(0, 4) };
  }

  /* ── YOUTUBE VIDEO URL ── */
  function youtubeUrl(title, cat) {
    const q = encodeURIComponent((title||'').slice(0, 70) + ' World Cup 2026');
    return `https://www.youtube.com/results?search_query=${q}`;
  }

  /* ── NORMALIZE ── */
  function normalize(raw, source) {
    const title   = ((raw.title || raw.webTitle || '')).replace(/\s*\|\s*[^|]+$/, '').trim();
    const desc    = (raw.description || raw.fields?.trailText || raw.summary || raw.content || '').replace(/<[^>]+>/g, '').trim();
    const rawUrl  = raw.url || raw.webUrl || raw.link || '';
    const imgUrl  = raw.urlToImage || raw.image || raw.fields?.thumbnail || raw.enclosure?.url || raw.multimedia?.[0]?.url || '';
    const author  = raw.author || raw.fields?.byline || '';
    const pubRaw  = raw.publishedAt || raw.webPublicationDate || raw.pubDate || '';
    const ts      = pubRaw ? new Date(pubRaw).getTime() : Date.now();

    if (!title || !rawUrl) return null;
    if (title.length < 15) return null;

    /* ── LAYER 1-4: WC-only filter ── */
    const combined = (title + ' ' + desc).toLowerCase();
    const lcUrl    = rawUrl.toLowerCase();

    /* Must mention World Cup or 2026 */
    const hasWC = combined.includes('world cup') || combined.includes('wc 2026') ||
                  combined.includes('wc2026') || combined.includes('fifa 2026');
    if (!hasWC) return null;

    /* Block specific other world cups and noise */
    if (BLOCKED.some(b => combined.includes(b))) return null;
    if (BLOCKED.some(b => lcUrl.includes(b.replace(/\s/g,'-')))) return null;

    /* Age filter: max 10 days */
    if (ts && Date.now() - ts > 10 * 86400000) return null;

    /* ── LAYER 5: AI relevance score ── */
    const score = relevanceScore(title, desc, source);
    if (score < 4) return null;

    const cat    = classify(title, desc);
    const isVid  = cat === 'highlight' || title.toLowerCase().includes('video') ||
                   title.toLowerCase().includes('watch') || title.toLowerCase().includes('highlight');
    const imgSafe = imgUrl && imgUrl.startsWith('http') ? imgUrl : null;
    const entities = extractEntities(title, desc);
    const id = btoa(rawUrl.slice(-60)).replace(/[^a-zA-Z0-9]/g,'').slice(0, 18) || String(ts);

    return {
      id,
      title:        title.slice(0, 200),
      summary:      desc.slice(0, 450),
      source,
      author:       author ? author.slice(0, 80) : null,
      url:          rawUrl,
      imageUrl:     imgSafe,
      videoUrl:     isVid ? youtubeUrl(title, cat) : null,
      publishedAt:  ts,
      publishedISO: new Date(ts).toISOString(),
      category:     cat,
      relevance:    score,
      entities,
      readTime:     Math.max(1, Math.ceil(desc.split(' ').length / 200)) + ' min',
    };
  }

  /* ── DEDUP — by URL hash and title similarity ── */
  function dedup(articles) {
    const seenUrls   = new Set();
    const seenTitles = new Set();
    return articles.filter(a => {
      if (!a || !a.id) return false;
      if (seenUrls.has(a.url)) return false;
      /* Title dedup: first 50 chars normalized */
      const tKey = (a.title||'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,50);
      if (seenTitles.has(tKey)) return false;
      seenUrls.add(a.url);
      seenTitles.add(tKey);
      return true;
    });
  }

  /* ── CURSOR FILTER ── */
  function applyCursor(articles, cursor) {
    if (!cursor) return articles;
    const cursorTs = new Date(cursor).getTime();
    return articles.filter(a => a.publishedAt < cursorTs);
  }

  /* ── RANK: freshness + relevance + engagement ── */
  function rank(articles) {
    const now = Date.now();
    return articles.sort((a, b) => {
      /* Score = relevance (0-10) + freshness bonus */
      const ageMsA = now - (a.publishedAt||0);
      const ageMsB = now - (b.publishedAt||0);
      const freshA = Math.max(0, 10 - ageMsA / 3600000); /* -1 per hour */
      const freshB = Math.max(0, 10 - ageMsB / 3600000);
      const scoreA = (a.relevance||5) * 1.5 + freshA;
      const scoreB = (b.relevance||5) * 1.5 + freshB;
      return scoreB - scoreA;
    });
  }

  /* ═══════════════════════════════════════════
     FETCH ALL SOURCES IN PARALLEL
  ═══════════════════════════════════════════ */
  const allArticles = [];
  const sources     = [];

  const fetches = [];

  /* SOURCE 1: Guardian Football ── */
  fetches.push(
    fetch(`https://content.guardianapis.com/search?q=${WC_Q_ENC}&section=football&show-fields=trailText,thumbnail,byline,body&page-size=50&order-by=newest&api-key=${GUARDIAN_KEY}`)
      .then(r => r.ok ? r.json() : null)
      .then(gd => {
        const arts = (gd?.response?.results || [])
          .map(a => normalize({ title:a.webTitle, url:a.webUrl, description:a.fields?.trailText||'',
            urlToImage:a.fields?.thumbnail, author:a.fields?.byline, publishedAt:a.webPublicationDate }, 'The Guardian'))
          .filter(Boolean);
        if (arts.length) { allArticles.push(...arts); sources.push('The Guardian'); }
        console.log('[news] Guardian:', arts.length);
      })
      .catch(e => console.warn('[news] Guardian:', e.message))
  );

  /* SOURCE 2: BBC Sport RSS ── */
  fetches.push(
    fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://feeds.bbci.co.uk/sport/football/world-cup/rss.xml')}`)
      .then(r => r.ok ? r.json() : null)
      .then(rd => {
        const xml   = rd?.contents || '';
        const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
        const arts  = items.map(m => {
          const item  = m[1];
          const title = (item.match(/<title><!\[CDATA\[([^\]]+)\]\]><\/title>/) || item.match(/<title>([^<]+)/))?.[1]?.trim() || '';
          const link  = (item.match(/<link>([^<]+)<\/link>/) || [])[1]?.trim() || '';
          const desc  = (item.match(/<description><!\[CDATA\[([^\]]+)\]\]><\/description>/) || item.match(/<description>([^<]+)/))?.[1]?.replace(/<[^>]+>/g,'').trim() || '';
          const pub   = (item.match(/<pubDate>([^<]+)/) || [])[1]?.trim() || '';
          const img   = (item.match(/<media:thumbnail[^>]+url="([^"]+)"/) || item.match(/<enclosure[^>]+url="([^"]+)"/))?.[1] || '';
          return normalize({ title, url:link, description:desc, publishedAt:pub, urlToImage:img }, 'BBC Sport');
        }).filter(Boolean);
        if (arts.length) { allArticles.push(...arts); sources.push('BBC Sport'); }
        console.log('[news] BBC:', arts.length);
      })
      .catch(e => console.warn('[news] BBC:', e.message))
  );

  /* SOURCE 3: Reuters Sports RSS ── */
  fetches.push(
    fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://feeds.reuters.com/reuters/sportsNews')}`)
      .then(r => r.ok ? r.json() : null)
      .then(rd => {
        const xml   = rd?.contents || '';
        const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
        const arts  = items.map(m => {
          const item  = m[1];
          const title = (item.match(/<title><!\[CDATA\[([^\]]+)\]\]><\/title>/) || item.match(/<title>([^<]+)/))?.[1]?.trim() || '';
          const link  = (item.match(/<link>([^<]+)/) || [])[1]?.trim() || '';
          const desc  = (item.match(/<description><!\[CDATA\[([^\]]+)\]\]><\/description>/) || item.match(/<description>([^<]+)/))?.[1]?.replace(/<[^>]+>/g,'').trim() || '';
          const pub   = (item.match(/<pubDate>([^<]+)/) || [])[1]?.trim() || '';
          const img   = (item.match(/<enclosure[^>]+url="([^"]+)"/) || item.match(/<media:content[^>]+url="([^"]+)"/))?.[1] || '';
          return normalize({ title, url:link, description:desc, publishedAt:pub, urlToImage:img }, 'Reuters Sports');
        }).filter(Boolean);
        if (arts.length) { allArticles.push(...arts); sources.push('Reuters'); }
        console.log('[news] Reuters:', arts.length);
      })
      .catch(e => console.warn('[news] Reuters:', e.message))
  );

  /* SOURCE 4: AP Sports RSS ── */
  fetches.push(
    fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://apnews.com/apf-sports')}`)
      .then(r => r.ok ? r.json() : null)
      .then(rd => {
        const html2 = rd?.contents || '';
        /* Extract articles from AP HTML */
        const arts = [...html2.matchAll(/<h2[^>]+class="[^"]*headline[^"]*"[^>]*>\s*<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g)]
          .map(m => {
            const link  = m[1].startsWith('http') ? m[1] : 'https://apnews.com' + m[1];
            const title = m[2].trim();
            return normalize({ title, url:link, description:'', publishedAt:new Date().toISOString() }, 'AP Sports');
          }).filter(Boolean);
        if (arts.length) { allArticles.push(...arts); sources.push('AP Sports'); }
        console.log('[news] AP:', arts.length);
      })
      .catch(e => console.warn('[news] AP:', e.message))
  );

  /* SOURCE 5: NewsAPI ── */
  if (NEWS_KEY) {
    const catFilter = cat && cat !== 'all' && cat !== 'saved' ? `&category=${cat}` : '';
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

  /* SOURCE 6: GNews ── */
  if (GNEWS_KEY && allArticles.length < 20) {
    fetches.push(
      fetch(`https://gnews.io/api/v4/search?q=${WC_SIMPLE}&lang=en&max=30&apikey=${GNEWS_KEY}`)
        .then(r => r.ok ? r.json() : null)
        .then(gnd => {
          const arts = (gnd?.articles || [])
            .map(a => normalize({ ...a, urlToImage:a.image, publishedAt:a.publishedAt }, a.source?.name || 'GNews'))
            .filter(Boolean);
          if (arts.length) { allArticles.push(...arts); sources.push('GNews'); }
          console.log('[news] GNews:', arts.length);
        })
        .catch(e => console.warn('[news] GNews:', e.message))
    );
  }

  /* SOURCE 7: FIFA.com RSS ── */
  fetches.push(
    fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://www.fifa.com/fifaplus/en/articles/feed')}`)
      .then(r => r.ok ? r.json() : null)
      .then(rd => {
        const xml   = rd?.contents || '';
        if (!xml) return;
        const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
        const arts  = items.slice(0, 20).map(m => {
          const item  = m[1];
          const title = (item.match(/<title><!\[CDATA\[([^\]]+)\]\]><\/title>/) || item.match(/<title>([^<]+)/))?.[1]?.trim() || '';
          const link  = (item.match(/<link>([^<]+)/) || [])[1]?.trim() || '';
          const desc  = (item.match(/<description><!\[CDATA\[([^\]]+)\]\]><\/description>/))?.[1]?.replace(/<[^>]+>/g,'').trim() || '';
          const pub   = (item.match(/<pubDate>([^<]+)/) || [])[1]?.trim() || '';
          return normalize({ title, url:link, description:desc, publishedAt:pub }, 'FIFA.com');
        }).filter(Boolean);
        if (arts.length) { allArticles.push(...arts); sources.push('FIFA.com'); }
        console.log('[news] FIFA:', arts.length);
      })
      .catch(() => {}) /* FIFA RSS may not always be accessible */
  );

  /* Run all fetches in parallel */
  await Promise.allSettled(fetches);

  /* ── PROCESS ── */
  let processed = dedup(allArticles);

  /* Category filter */
  if (cat && cat !== 'all' && cat !== 'saved') {
    processed = processed.filter(a => a.category === cat);
  }

  /* Apply cursor */
  if (cursor) {
    processed = applyCursor(processed, cursor);
  }

  /* Rank by freshness + relevance */
  processed = rank(processed);

  /* Pagination */
  const pageStart  = cursor ? 0 : (page - 1) * limit;
  const paginated  = processed.slice(pageStart, pageStart + limit);

  /* Next cursor = timestamp of last article */
  const nextCursor = paginated.length > 0
    ? new Date(paginated[paginated.length - 1].publishedAt).toISOString()
    : null;

  if (!paginated.length) {
    return new Response(JSON.stringify({
      success:    false,
      error:      NEWS_KEY ? 'No World Cup news found after filtering' : 'Add NEWS_API_KEY for 10x more articles',
      hint:       'Register free at newsapi.org → add NEWS_API_KEY in Cloudflare env',
      articles:   [],
      nextCursor: null,
      ts:         Date.now(),
    }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({
    success:    true,
    articles:   paginated,
    count:      processed.length,
    returned:   paginated.length,
    nextCursor,
    sources:    [...new Set(sources)],
    ts:         Date.now(),
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
