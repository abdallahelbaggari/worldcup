/**
 * ================================================================
 * WORLDCUP DATA ENGINE v13.0
 * 
 * PRIMARY SOURCE: football-data.org (FREE, official FIFA data)
 *   - Competition: WC (FIFA World Cup 2026)
 *   - Confirmed WC 2026 coverage
 *   - Endpoint: api.football-data.org/v4/competitions/WC/...
 *   - Auth: X-Auth-Token header
 *   - Free tier: 10 req/min, full WC coverage
 *
 * SECONDARY SOURCE: TheSportsDB (free, no key)
 *   - Fallback for when football-data.org quota exceeded
 *   - Match detail: events, lineups, stats
 *
 * TERTIARY SOURCE: WC_SCHED (verified schedule built into frontend)
 *   - Guaranteed display layer — never blank
 *
 * Rules enforced:
 *   - No hardcoded scores beyond WC_SCHED verified entries
 *   - Status from API only
 *   - WC 2026 only — strict competition filter
 *   - Source label always returned
 * ================================================================
 */

export async function onRequestGet(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
  };

  const url    = new URL(context.request.url);
  const type   = url.searchParams.get('type') || 'today';
  const date   = url.searchParams.get('date') || new Date().toISOString().slice(0,10);
  const id     = url.searchParams.get('id')   || '';

  /* ── API KEYS from Cloudflare env ── */
  const FD_KEY  = context.env.FD_API_KEY  || '';  /* football-data.org key */
  const TSDB    = 'https://www.thesportsdb.com/api/v1/json/3';

  function ok(data, src) {
    return new Response(JSON.stringify({ success:true, data, source:src||'api', ts:Date.now() }), {
      headers: { ...corsHeaders, 'Content-Type':'application/json' }
    });
  }
  function err(msg) {
    return new Response(JSON.stringify({ success:false, error:msg, ts:Date.now() }), {
      headers: { ...corsHeaders, 'Content-Type':'application/json' }, status:200
    });
  }

  /* ── FETCH HELPERS ── */
  async function fetchFD(path) {
    if (!FD_KEY) throw new Error('FD_API_KEY not configured');
    const r = await fetch(`https://api.football-data.org/v4/${path}`, {
      headers: { 'X-Auth-Token': FD_KEY }
    });
    if (!r.ok) throw new Error(`FD HTTP ${r.status}`);
    return r.json();
  }

  async function fetchTSDB(path) {
    const r = await fetch(`${TSDB}/${path}`);
    if (!r.ok) throw new Error(`TSDB HTTP ${r.status}`);
    return r.json();
  }

  /* ── NORMALIZE football-data.org match → standard format ── */
  function normalizeFD(m) {
    if (!m || !m.homeTeam || !m.awayTeam) return null;

    const STATUS_MAP = {
      'SCHEDULED':  'UPCOMING',
      'TIMED':      'UPCOMING',
      'IN_PLAY':    'LIVE',
      'PAUSED':     'HT',
      'FINISHED':   'FINISHED',
      'POSTPONED':  'POSTPONED',
      'CANCELLED':  'CANCELLED',
      'SUSPENDED':  'POSTPONED',
    };

    const status   = STATUS_MAP[m.status] || 'UPCOMING';
    const hs       = m.score?.fullTime?.home;
    const as_      = m.score?.fullTime?.away;
    const hasScore = (status === 'FINISHED' || status === 'LIVE' || status === 'HT')
                     && hs !== null && hs !== undefined
                     && as_ !== null && as_ !== undefined;

    /* Build UTC datetime */
    const dateUTC = m.utcDate || null;
    let dispTime = 'TBD';
    if (dateUTC) {
      try {
        const d = new Date(dateUTC);
        dispTime = d.toLocaleDateString('en-US', { month:'short', day:'numeric' })
          + ' · ' + d.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
      } catch(x) {}
    }

    /* Group from matchday or stage */
    let group = '';
    if (m.group) {
      group = m.group.replace('GROUP_', '').replace('GROUP ', '');
    } else if (m.stage === 'GROUP_STAGE') {
      group = '';
    }

    return {
      id:        String(m.id),
      homeTeam:  m.homeTeam.name || m.homeTeam.shortName || '',
      awayTeam:  m.awayTeam.name || m.awayTeam.shortName || '',
      homeScore: hasScore ? hs  : null,
      awayScore: hasScore ? as_ : null,
      status,
      statusRaw: m.status || '',
      progress:  m.minute ? `${m.minute}'` : '',
      dateUTC,
      dispTime,
      venue:     m.venue || '',
      league:    'FIFA World Cup 2026',
      stage:     m.stage || '',
      group,
      round:     m.matchday || null,
      source:    'football-data.org',
      /* Team badges from FD */
      homeCrest: m.homeTeam.crest || null,
      awayCrest: m.awayTeam.crest || null,
    };
  }

  /* ── NORMALIZE TheSportsDB event → standard format ── */
  function normalizeTSDB(e) {
    if (!e || !e.strHomeTeam || !e.strAwayTeam) return null;
    const hs  = parseInt(e.intHomeScore);
    const as_ = parseInt(e.intAwayScore);
    const status_raw = (e.strStatus || '').toLowerCase();
    let status = 'UPCOMING';
    if (status_raw === 'ft' || status_raw === 'aet' || status_raw === 'pen' || status_raw.includes('finish'))
      status = 'FINISHED';
    else if (status_raw === 'ht') status = 'HT';
    else if (status_raw === 'live' || status_raw.includes('progress') || status_raw.includes('1h') || status_raw.includes('2h'))
      status = 'LIVE';
    else if (status_raw.includes('postponed')) status = 'POSTPONED';
    else if (status_raw.includes('cancel')) status = 'CANCELLED';

    const hasScore = (status === 'FINISHED' || status === 'LIVE' || status === 'HT')
                     && !isNaN(hs) && !isNaN(as_) && hs >= 0 && as_ >= 0;
    const dateUTC = (e.dateEvent && e.strTime)
      ? `${e.dateEvent}T${(e.strTime||'00:00').slice(0,5)}:00Z`
      : null;
    let dispTime = 'TBD';
    if (dateUTC) {
      try {
        const d = new Date(dateUTC);
        dispTime = d.toLocaleDateString('en-US', {month:'short',day:'numeric'})
          + ' · ' + d.toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit'});
      } catch(x) {}
    }
    return {
      id:        e.idEvent || '',
      homeTeam:  e.strHomeTeam || '',
      awayTeam:  e.strAwayTeam || '',
      homeScore: hasScore ? hs : null,
      awayScore: hasScore ? as_ : null,
      status,
      statusRaw: e.strStatus || '',
      progress:  e.strProgress || '',
      dateUTC,
      dispTime,
      venue:     e.strVenue || '',
      league:    e.strLeague || 'WorldCup 2026',
      stage:     '',
      group:     '',
      source:    'thesportsdb.com',
      homeCrest: e.strHomeTeamBadge || null,
      awayCrest: e.strAwayTeamBadge || null,
    };
  }

  /* ── WC 2026 TEAM SET for validation ── */
  const WC_TEAMS = new Set([
    'Mexico','South Africa','South Korea','Czech Republic','Czechia',
    'Canada','Bosnia and Herzegovina','Bosnia-Herzegovina','Qatar','Switzerland',
    'Brazil','Haiti','Morocco','Scotland',
    'Australia','Paraguay','Türkiye','Turkey','Turkiye','United States','USA',
    'Curaçao','Curacao','Ecuador','Germany','Ivory Coast',"Côte d'Ivoire",
    'Japan','Netherlands','Sweden','Tunisia',
    'Belgium','Egypt','Iran','New Zealand',
    'Cape Verde','Saudi Arabia','Spain','Uruguay',
    'France','Iraq','Norway','Senegal',
    'Algeria','Argentina','Austria','Jordan',
    'Colombia','DR Congo','Congo DR','Democratic Republic of Congo','Portugal','Uzbekistan',
    'Croatia','England','Ghana','Panama',
  ]);

  function isWCTeam(name) {
    if (!name) return false;
    const n = name.trim();
    if (WC_TEAMS.has(n)) return true;
    for (const t of WC_TEAMS) {
      if (n.toLowerCase().slice(0,6) === t.toLowerCase().slice(0,6)) return true;
    }
    return false;
  }

  /* Competitions that must NEVER appear even if teams match */
  const BLOCKED_COMPS = new Set([
    'friendly','friendlies','club world cup','women','olympic',
    'youth','u20','u17','u23','concacaf gold cup','copa america',
    'nations league','africa cup','euro','euros','asian cup',
    'qualification','qualifier','qualifying',
  ]);

  function isWCMatch(m) {
    if (!m) return false;
    /* football-data.org: already guaranteed WC by competition code */
    if (m.source === 'football-data.org') return true;
    /* TSDB fallback: require both WC 2026 teams */
    if (!isWCTeam(m.homeTeam) || !isWCTeam(m.awayTeam)) return false;
    /* Also block non-WC competitions by league name */
    const lg = (m.league || '').toLowerCase();
    for (const b of BLOCKED_COMPS) {
      if (lg.includes(b)) return false;
    }
    /* Must reference World Cup */
    const isWCComp = lg.includes('world cup') || lg.includes('worldcup') ||
                     lg.includes('fifa') || lg === '';
    return isWCComp;
  }

  /* ── DEDUPLICATE by match ID ── */
  function dedup(matches) {
    const seen = new Set();
    return matches.filter(m => {
      if (!m || !m.id) return false;
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ROUTES
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  /* ── HEALTH CHECK ── */
  if (type === 'health') {
    const hasFD = !!FD_KEY;
    return ok({ healthy:true, fd_key:hasFD, ts:Date.now() }, 'health');
  }

  /* ── TODAY'S MATCHES ── */
  if (type === 'today') {
    const results = [];

    /* PRIMARY: football-data.org — WC 2026 matches on date */
    if (FD_KEY) {
      try {
        const data = await fetchFD(`competitions/WC/matches?dateFrom=${date}&dateTo=${date}`);
        const matches = (data.matches || []).map(normalizeFD).filter(Boolean);
        results.push(...matches);
        console.log('[data] FD today:', matches.length, 'matches');
      } catch(e) {
        console.warn('[data] FD today failed:', e.message);
      }
    }

    /* SECONDARY: football-data.org — all current WC matches ── */
    if (FD_KEY && results.length === 0) {
      try {
        const data = await fetchFD('competitions/WC/matches?status=LIVE&season=2026');
        const matches = (data.matches || []).map(normalizeFD).filter(Boolean);
        results.push(...matches);
        console.log('[data] FD live:', matches.length);
      } catch(e) {}
    }

    /* FALLBACK: TheSportsDB ── */
    if (results.length === 0) {
      try {
        const data = await fetchTSDB(`eventsday.php?d=${date}&s=Soccer`);
        const events = (data.events || data.event || [])
          .map(normalizeTSDB).filter(Boolean).filter(isWCMatch);
        results.push(...events);
        console.log('[data] TSDB today:', events.length);
      } catch(e) {
        console.warn('[data] TSDB today failed:', e.message);
      }
    }

    /* FALLBACK 2: TSDB livescore */
    if (results.length === 0) {
      try {
        const data = await fetchTSDB('livescore.php?s=Soccer');
        const events = (data.events || [])
          .map(normalizeTSDB).filter(Boolean).filter(isWCMatch);
        results.push(...events);
        console.log('[data] TSDB livescore:', events.length);
      } catch(e) {}
    }

    return ok(dedup(results), results[0]?.source || 'none');
  }

  /* ── FULL SEASON FIXTURES ── */
  if (type === 'season') {
    let results = [];

    /* PRIMARY: football-data.org all WC matches */
    if (FD_KEY) {
      try {
        const data = await fetchFD('competitions/WC/matches');
        const matches = (data.matches || []).map(normalizeFD).filter(Boolean);
        results = matches;
        console.log('[data] FD season:', matches.length, 'matches');
      } catch(e) {
        console.warn('[data] FD season failed:', e.message);
      }
    }

    /* FALLBACK: TSDB season */
    if (results.length === 0) {
      for (const lid of ['102711','4980','4443']) {
        try {
          const data = await fetchTSDB(`eventsseason.php?id=${lid}&s=2025-2026`);
          const events = (data.events || [])
            .map(normalizeTSDB).filter(Boolean).filter(isWCMatch);
          if (events.length > 0) { results = events; break; }
        } catch(e) {}
      }
    }

    return ok(dedup(results), results[0]?.source || 'none');
  }

  /* ── PAST RESULTS ── */
  if (type === 'results') {
    let results = [];

    /* PRIMARY: football-data.org finished WC matches */
    if (FD_KEY) {
      try {
        const data = await fetchFD('competitions/WC/matches?status=FINISHED&season=2026');
        const matches = (data.matches || []).map(normalizeFD).filter(Boolean);
        results = matches;
        console.log('[data] FD results:', matches.length);
      } catch(e) {
        console.warn('[data] FD results failed:', e.message);
      }
    }

    /* FALLBACK: TSDB season filtered to FINISHED */
    if (results.length === 0) {
      for (const lid of ['102711','4980','4443']) {
        try {
          const data = await fetchTSDB(`eventsseason.php?id=${lid}&s=2025-2026`);
          const finished = (data.events || [])
            .map(normalizeTSDB).filter(Boolean).filter(isWCMatch)
            .filter(m => m.status === 'FINISHED');
          if (finished.length > 0) { results = finished; break; }
        } catch(e) {}
      }
    }

    return ok(dedup(results), results[0]?.source || 'none');
  }

  /* ── STANDINGS / GROUP TABLES ── */
    if (type === 'standings') {
      if (FD_KEY) {
        try {
          const data = await fetchFD('competitions/WC/standings?season=2026');
          const seen = new Set();

          /* Filter type===TOTAL only — FD returns TOTAL/HOME/AWAY causing 3x dupes */
          const rows = (data.standings || [])
            .filter(g => g.type === 'TOTAL')
            .flatMap(g =>
              (g.table || [])
                .filter(t => {
                  if (seen.has(t.team.id)) return false;
                  seen.add(t.team.id);
                  return true;
                })
                .map(t => ({
                  group:             g.group || '',
                  strTeam:           t.team.name || '',
                  teamCrest:         t.team.crest || null,
                  intPlayed:         t.playedGames || 0,
                  intWin:            t.won || 0,
                  intDraw:           t.draw || 0,
                  intLoss:           t.lost || 0,
                  intGoalsFor:       t.goalsFor || 0,
                  intGoalsAgainst:   t.goalsAgainst || 0,
                  intGoalDifference: t.goalDifference || 0,
                  intPoints:         t.points || 0,
                  strForm:           t.form || '',
                  position:          t.position || 0,
                }))
            );

          console.log('[data] standings rows:', rows.length);
          return ok(rows, 'football-data.org');
        } catch(e) {
          console.warn('[data] FD standings failed:', e.message);
        }
      }

      for (const lid of ['102711','4980','4443']) {
        try {
          const data = await fetchTSDB('lookuptable.php?l='+lid+'&s=2025-2026');
          const table = data.table || [];
          if (table.length > 0) return ok(table, 'thesportsdb.com');
        } catch(e) {}
      }
      return ok([], 'none');
    }

    /* ── MATCH DETAIL ── */
  if (type === 'match' && id) {
    /* Try football-data.org first */
    if (FD_KEY) {
      try {
        const data = await fetchFD(`matches/${id}`);
        const m = normalizeFD(data);
        if (m) return ok(m, 'football-data.org');
      } catch(e) {}
    }
    /* Fallback TSDB */
    try {
      const data = await fetchTSDB(`lookupevent.php?id=${id}`);
      const events = data.events || [];
      if (events[0]) return ok(normalizeTSDB(events[0]), 'thesportsdb.com');
    } catch(e) {}
    return err('Match not found');
  }

  /* ── MATCH STATS ── */
  if (type === 'stats' && id) {
    /* football-data.org doesn't have per-match stats on free tier */
    /* Use TSDB */
    try {
      const data = await fetchTSDB(`eventstatistics.php?id=${id}`);
      return ok(data.eventstats || [], 'thesportsdb.com');
    } catch(e) {
      return ok([], 'none');
    }
  }

  /* ── MATCH EVENTS (goals, cards, subs) ── */
  if (type === 'events' && id) {
    /* football-data.org v4 head2head / match events */
    if (FD_KEY) {
      try {
        const data = await fetchFD(`matches/${id}`);
        const goals = data.goals || [];
        const cards = data.bookings || [];
        const subs  = data.substitutions || [];
        const events = [
          ...goals.map(g => ({
            intMinute: g.minute, strType: 'Goal',
            strPlayer: g.scorer?.name || '', strTeam: g.team?.name || '',
            strAssist: g.assist?.name || null,
          })),
          ...cards.map(c => ({
            intMinute: c.minute, strType: c.card === 'RED_CARD' ? 'Red Card' : 'Yellow Card',
            strPlayer: c.player?.name || '', strTeam: c.team?.name || '',
          })),
          ...subs.map(s => ({
            intMinute: s.minute, strType: 'Substitution',
            strPlayer: s.playerIn?.name || '', strTeam: s.team?.name || '',
            strAssist: s.playerOut?.name || null,
          })),
        ].sort((a,b) => (a.intMinute||0) - (b.intMinute||0));
        if (events.length > 0) return ok(events, 'football-data.org');
      } catch(e) {
        console.warn('[data] FD events failed:', e.message);
      }
    }
    /* Fallback TSDB */
    try {
      const data = await fetchTSDB(`lookupeventresults.php?id=${id}`);
      return ok(data.results || [], 'thesportsdb.com');
    } catch(e) {
      return ok([], 'none');
    }
  }

  /* ── LINEUP ── */
  if (type === 'lineup' && id) {
    /* football-data.org lineup */
    if (FD_KEY) {
      try {
        const data = await fetchFD(`matches/${id}`);
        const hTeam = data.homeTeam?.name || '';
        const aTeam = data.awayTeam?.name || '';
        const homeXI  = (data.homeTeam?.lineup || []).map(p => ({
          strPlayer: p.name, strPosition: p.position, strSide:'home', strTeam: hTeam,
        }));
        const awayXI  = (data.awayTeam?.lineup || []).map(p => ({
          strPlayer: p.name, strPosition: p.position, strSide:'away', strTeam: aTeam,
        }));
        if (homeXI.length || awayXI.length) {
          return ok({ home:homeXI, away:awayXI, homeTeam:hTeam, awayTeam:aTeam }, 'football-data.org');
        }
      } catch(e) {}
    }
    /* Fallback TSDB */
    try {
      const data = await fetchTSDB(`lookuplineup.php?id=${id}`);
      const lineup = data.lineup || [];
      const home = lineup.filter(p => p.strSide === 'home');
      const away = lineup.filter(p => p.strSide === 'away');
      return ok({ home, away, homeTeam: home[0]?.strTeam||'', awayTeam: away[0]?.strTeam||'' }, 'thesportsdb.com');
    } catch(e) {
      return ok({ home:[], away:[], homeTeam:'', awayTeam:'' }, 'none');
    }
  }

  /* ── SCORERS / TOURNAMENT STATS ── */
  if (type === 'scorers') {
    if (FD_KEY) {
      try {
        const data = await fetchFD('competitions/WC/scorers?limit=20&season=2026');
        const scorers = (data.scorers || []).map(s => ({
          playerName: s.player?.name || '',
          teamName:   s.team?.name || '',
          goals:      s.goals || 0,
          assists:    s.assists || 0,
          penalties:  s.penalties || 0,
          teamCrest:  s.team?.crest || null,
        }));
        return ok(scorers, 'football-data.org');
      } catch(e) {
        console.warn('[data] FD scorers failed:', e.message);
      }
    }
    return ok([], 'none');
  }

  return err('Unknown type: ' + type);
}

export async function onRequestOptions(context) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
