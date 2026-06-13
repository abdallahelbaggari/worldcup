/* =================================================================
   WORLDCUP · functions/data.js · Cloudflare Pages Function
   Route: /data
   
   Proxy for TheSportsDB API — keeps fetch server-side
   Handles CORS, caching, error normalization
   
   Usage:
     GET /data?type=today
     GET /data?type=season
     GET /data?type=standings
     GET /data?type=match&id=EVENT_ID
     GET /data?type=health
================================================================= */

const TSDB_BASE  = 'https://www.thesportsdb.com/api/v1/json/3';
const WC_LEAGUES = ['102711', '4980', '4443']; /* Known WC 2026 league IDs */
const CACHE_TTL  = {
  today:     15,   /* seconds — live matches */
  season:    300,  /* 5 min — full season fixtures */
  standings: 60,   /* 1 min */
  match:     30,   /* 30s — match detail */
};

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type':                 'application/json',
};

function ok(data, ttl) {
  return new Response(JSON.stringify({ success: true, data, ts: Date.now() }), {
    status: 200,
    headers: { ...CORS, 'Cache-Control': `public, max-age=${ttl||30}` },
  });
}

function err(msg, status = 200) {
  /* Always 200 to prevent Pi Browser errors */
  return new Response(JSON.stringify({ success: false, error: msg, data: null, ts: Date.now() }), {
    status: 200,
    headers: CORS,
  });
}

async function fetchTSDB(path) {
  const url = `${TSDB_BASE}/${path}`;
  console.log('[WC/data]', url);
  const res = await fetch(url, {
    headers: { 'User-Agent': 'WorldCup-App/1.0' },
    cf: { cacheTtl: 30, cacheEverything: true },
  });
  if (!res.ok) throw new Error(`TSDB HTTP ${res.status}`);
  return res.json();
}

/* Filter events to WC 2026 only */
/* WC 2026 filter — blocks non-football, non-WC competitions */
const BLOCKED_SPORTS  = ['handball','basketball','rugby','ice hockey','american football'];
const BLOCKED_LEAGUES = ['champions league','premier league','bundesliga','la liga',
                          'serie a','ligue 1','ehf','nba','nfl','nhl','mls','conference'];

/* All 48 WC 2026 team names for validation */
const WC_TEAMS_SET = new Set([
  'Mexico','South Africa','South Korea','Czechia','Czech Republic',
  'Canada','Bosnia and Herzegovina','Bosnia-Herzegovina','Qatar','Switzerland',
  'Brazil','Haiti','Morocco','Scotland',
  'Australia','Paraguay','Türkiye','Turkiye','Turkey','USA','United States',
  'Curaçao','Curacao','Ecuador','Germany','Ivory Coast',
  'Japan','Netherlands','Sweden','Tunisia',
  'Belgium','Egypt','Iran','New Zealand',
  'Cape Verde','Saudi Arabia','Spain','Uruguay',
  'France','Iraq','Norway','Senegal',
  'Algeria','Argentina','Austria','Jordan',
  'Colombia','DR Congo','Congo DR','Portugal','Uzbekistan',
  'Croatia','England','Ghana','Panama',
]);

function teamsAreWC(home, away) {
  /* Check if both teams are WC 2026 participants */
  const h = (home||'').trim(), a = (away||'').trim();
  const hMatch = WC_TEAMS_SET.has(h) || [...WC_TEAMS_SET].some(t => h.includes(t) || t.includes(h.slice(0,5)));
  const aMatch = WC_TEAMS_SET.has(a) || [...WC_TEAMS_SET].some(t => a.includes(t) || t.includes(a.slice(0,5)));
  return hMatch && aMatch;
}

function isWC(event) {
  if (!event || !event.strHomeTeam || !event.strAwayTeam) return false;
  const sport = (event.strSport || '').toLowerCase();
  const lg    = (event.strLeague || '').toLowerCase();
  const id    = String(event.idLeague || '');

  /* Reject non-football sports */
  if (BLOCKED_SPORTS.some(b => sport.includes(b) || lg.includes(b))) return false;
  /* Reject club league competitions */
  if (BLOCKED_LEAGUES.some(b => lg.includes(b))) return false;
  /* Must be football/soccer */
  const isFootball = sport === '' || sport.includes('soccer') || sport.includes('football');
  if (!isFootball) return false;

  /* Accept if WC league match OR both teams are WC 2026 nations */
  const isWCLeague = lg.includes('world cup') || lg.includes('worldcup') ||
                     lg.includes('international') || WC_LEAGUES.includes(id);
  const bothWCTeams = teamsAreWC(event.strHomeTeam, event.strAwayTeam);

  /* Require at least WC league OR both teams are WC nations */
  return isWCLeague && bothWCTeams;
}

/* Normalize event to consistent shape */
function normalizeEvent(e) {
  const hs  = parseInt(e.intHomeScore);
  const as_ = parseInt(e.intAwayScore);
  const hasScore = !isNaN(hs) && !isNaN(as_) && hs >= 0 && as_ >= 0;
  const status = (e.strStatus || '').toLowerCase();
  let   normalized_status;
  if (status === 'ft' || status === 'aet' || status === 'pen' || status.includes('finished'))
    normalized_status = 'FINISHED';
  else if (status === 'ht')
    normalized_status = 'HT';
  else if (status === 'live' || status.includes('progress') ||
           status.includes('1h') || status.includes('2h'))
    normalized_status = 'LIVE';
  else if (status.includes('postponed'))
    normalized_status = 'POSTPONED';
  else if (status.includes('cancelled') || status.includes('canceled'))
    normalized_status = 'CANCELLED';
  else
    normalized_status = 'UPCOMING';

  return {
    id:          e.idEvent,
    leagueId:    e.idLeague,
    league:      e.strLeague,
    season:      e.strSeason,
    homeTeam:    e.strHomeTeam,
    awayTeam:    e.strAwayTeam,
    homeScore:   hasScore ? hs  : null,
    awayScore:   hasScore ? as_ : null,
    status:      normalized_status,
    statusRaw:   e.strStatus || '',
    progress:    e.strProgress || '',
    dateUTC:     e.dateEvent && e.strTime
                   ? `${e.dateEvent}T${(e.strTime||'00:00').slice(0,5)}:00Z`
                   : null,
    dateLocal:   e.strLocalDate   || null,
    timeLocal:   e.strLocalTime   || null,
    venue:       e.strVenue        || null,
    city:        e.strCity         || null,
    thumbHome:   e.strHomeTeamBadge || null,
    thumbAway:   e.strAwayTeamBadge  || null,
    round:       e.intRound         || null,
    tvStation:   e.strTVStation      || null,
    videoURL:    e.strVideo          || null,
  };
}

export async function onRequestGet(context) {
  const url    = new URL(context.request.url);
  const type   = url.searchParams.get('type') || 'health';
  const id     = url.searchParams.get('id')   || '';
  const date   = url.searchParams.get('date') || new Date().toISOString().slice(0, 10);

  try {
    /* ── HEALTH CHECK ── */
    if (type === 'health') {
      return ok({ service: 'WorldCup data proxy', version: '1.0', tsdb: TSDB_BASE }, 60);
    }

    /* ── TODAY'S MATCHES ── */
    if (type === 'today') {
      /* Try multiple approaches for WC 2026 data */
      let allEvents = [];

      /* Approach 1: today's soccer events */
      try {
        const data   = await fetchTSDB(`eventsday.php?d=${date}&s=Soccer`);
        const events = (data.events || data.event || []).filter(isWC);
        allEvents = allEvents.concat(events);
        console.log('[data] today approach 1:', events.length, 'WC events');
      } catch(e) {
        console.warn('[data] today approach 1 failed:', e.message);
      }

      /* Approach 2: if no results, try known WC league IDs directly */
      if (allEvents.length === 0) {
        for (const lid of WC_LEAGUES) {
          try {
            const data = await fetchTSDB(`eventsseason.php?id=${lid}&s=2025-2026`);
            const today_events = (data.events || []).filter(function(e) {
              return isWC(e) && e.dateEvent === date;
            });
            allEvents = allEvents.concat(today_events);
            if (today_events.length > 0) {
              console.log('[data] today approach 2 (lid '+lid+'):', today_events.length, 'events');
              break;
            }
          } catch(e) {}
        }
      }

      /* Approach 3: search for active WC matches */
      if (allEvents.length === 0) {
        try {
          const data = await fetchTSDB(`livescore.php?s=Soccer`);
          const live = (data.events || []).filter(isWC);
          allEvents = allEvents.concat(live);
          if (live.length > 0) console.log('[data] today approach 3 (livescore):', live.length, 'events');
        } catch(e) {}
      }

      /* Deduplicate by event ID */
      const seen = new Set();
      const unique = allEvents.filter(e => {
        if (!e.idEvent || seen.has(e.idEvent)) return false;
        seen.add(e.idEvent); return true;
      });

      return ok(unique.map(normalizeEvent), CACHE_TTL.today);
    }

    /* ── FULL SEASON FIXTURES ── */
    if (type === 'season') {
      /* Try each known league ID until we get results */
      for (const lid of WC_LEAGUES) {
        try {
          const data   = await fetchTSDB(`eventsseason.php?id=${lid}&s=2025-2026`);
          const events = (data.events || []);
          if (events.length > 0) {
            return ok(events.map(normalizeEvent), CACHE_TTL.season);
          }
        } catch (e) {
          console.warn(`[WC/data] League ${lid} failed:`, e.message);
        }
      }
      return ok([], CACHE_TTL.season);
    }

    /* ── STANDINGS / GROUP TABLE ── */
    if (type === 'standings') {
      for (const lid of WC_LEAGUES) {
        try {
          const data = await fetchTSDB(`lookuptable.php?l=${lid}&s=2025-2026`);
          if (data.table && data.table.length > 0) {
            return ok(data.table, CACHE_TTL.standings);
          }
        } catch (e) {
          console.warn(`[WC/data] Standings ${lid} failed:`, e.message);
        }
      }
      return ok([], CACHE_TTL.standings);
    }

    /* ── SINGLE MATCH DETAIL ── */
    if (type === 'match' && id) {
      const data = await fetchTSDB(`lookupevent.php?id=${id}`);
      const ev   = (data.events || [])[0];
      if (!ev) return err('Match not found');
      return ok(normalizeEvent(ev), CACHE_TTL.match);
    }

    /* ── MATCH STATS ── */
    if (type === 'stats' && id) {
      const data = await fetchTSDB(`eventstatistics.php?id=${id}`);
      return ok(data.eventstats || [], CACHE_TTL.match);
    }

    /* ── MATCH EVENTS (goals, cards, subs, VAR) ── */
    if (type === 'events' && id) {
      const data = await fetchTSDB(`lookupeventresults.php?id=${id}`);
      return ok(data.results || data.eventtimeline || [], CACHE_TTL.match);
    }

    /* ── MATCH LINEUP ── */
    if (type === 'lineup' && id) {
      const data = await fetchTSDB(`lookuplineup.php?id=${id}`);
      const home = (data.lineup||[]).filter(p => p.strSide === 'home');
      const away = (data.lineup||[]).filter(p => p.strSide === 'away');
      const homeTeam = home[0]?.strTeam || '';
      const awayTeam = away[0]?.strTeam || '';
      return ok({ home, away, homeTeam, awayTeam }, CACHE_TTL.match);
    }

    /* ── PAST RESULTS (finished matches) ── */
    if (type === 'results') {
      /* Fetch recent days to find completed WC matches */
      const results = [];
      const today   = new Date();
      /* Check last 14 days */
      for (let i = 1; i <= 14; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0,10);
        try {
          const data   = await fetchTSDB(`eventsday.php?d=${dateStr}&s=Soccer`);
          const events = (data.events || data.event || [])
            .filter(isWC)
            .filter(e => {
              const raw = (e.strStatus||'').toLowerCase();
              return raw === 'ft' || raw.includes('finish') || raw === 'aet' || raw === 'pen';
            })
            .map(normalizeEvent);
          results.push(...events);
        } catch(e) { /* skip day */ }
      }
      return ok(results, CACHE_TTL.season);
    }

    return err('Unknown type');

  } catch (e) {
    console.error('[WC/data] Error:', e.message);
    return err(e.message);
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 200, headers: CORS });
}
