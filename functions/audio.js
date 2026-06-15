/**
 * ================================================================
 * WORLDCUP AUDIO ENGINE v2.0
 * Cloudflare Worker: /audio
 *
 * WHAT THIS DOES:
 * 1. Returns verified SoundCloud embed URLs (PRIMARY - works in Pi Browser)
 * 2. Validates archive.org URLs via HEAD request (SECONDARY)
 * 3. Only returns URLs that actually work
 * 4. Never returns guessed/fake URLs
 *
 * WHY SOUNDCLOUD WORKS (not YouTube):
 * SoundCloud widget: w.soundcloud.com → no X-Frame-Options header
 * YouTube: youtube.com → X-Frame-Options: SAMEORIGIN → blocks all iframes
 * SoundCloud explicitly allows cross-origin embedding for their widget
 * ================================================================
 */

export async function onRequestGet(context) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
  };

  const url    = new URL(context.request.url);
  const song   = url.searchParams.get('song') || '';
  const action = url.searchParams.get('action') || 'resolve';

  /* ── VERIFY endpoint: HEAD check a URL ── */
  if (action === 'verify') {
    const checkUrl = url.searchParams.get('url') || '';
    if (!checkUrl || !checkUrl.startsWith('http')) {
      return new Response(JSON.stringify({ playable: false, reason: 'invalid url' }),
        { headers: { ...cors, 'Content-Type': 'application/json' } });
    }
    try {
      const r = await fetch(checkUrl, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
      const ct = r.headers.get('content-type') || '';
      const ar = r.headers.get('accept-ranges') || '';
      const ok = r.ok || r.status === 206;
      const isMedia = ct.includes('audio/') || ct.includes('video/') || ct.includes('application/ogg');
      return new Response(JSON.stringify({
        playable:    ok && isMedia,
        status:      r.status,
        contentType: ct,
        streaming:   ar.includes('bytes'),
        reason:      ok ? (isMedia ? 'ok' : 'not-media') : 'http-error',
      }), { headers: { ...cors, 'Content-Type': 'application/json' } });
    } catch(e) {
      return new Response(JSON.stringify({ playable: false, reason: e.message }),
        { headers: { ...cors, 'Content-Type': 'application/json' } });
    }
  }

  /* ── CURATED SONG REGISTRY ── */
  /* Sources tried in order. SoundCloud = primary (works in Pi Browser) */
  const SONGS = {
    'waka-waka-2010': {
      title:  'Waka Waka (This Time for Africa)',
      artist: 'Shakira ft. Freshlyground',
      year:   2010,
      color:  '#f57f17',
      /* SoundCloud embed — works in Pi Browser (no X-Frame-Options block) */
      scUrl:  'https://soundcloud.com/shakira/waka-waka-this-time-for-africa',
      /* Archive.org fallback — only if SC fails */
      archiveSearch: 'waka waka shakira world cup 2010 official',
    },
    'hayya-hayya-2022': {
      title:  'Hayya Hayya (Better Together)',
      artist: 'Trinidad Cardona, Davido & Aisha',
      year:   2022,
      color:  '#880e4f',
      scUrl:  'https://soundcloud.com/fifaworldcup/hayya-hayya-better-together',
      archiveSearch: 'hayya hayya better together 2022 world cup',
    },
    'la-copa-1998': {
      title:  'La Copa de la Vida (The Cup of Life)',
      artist: 'Ricky Martin',
      year:   1998,
      color:  '#00695c',
      scUrl:  'https://soundcloud.com/rickymartin/la-copa-de-la-vida-the-cup-of',
      archiveSearch: 'la copa de la vida ricky martin 1998 world cup',
    },
    'live-it-up-2018': {
      title:  'Live It Up',
      artist: 'Nicky Jam ft. Will Smith & Era Istrefi',
      year:   2018,
      color:  '#b71c1c',
      scUrl:  'https://soundcloud.com/nickyjam/live-it-up-2018-fifa-world-cup-official-audio',
      archiveSearch: 'live it up nicky jam will smith 2018 world cup',
    },
    'we-are-one-2014': {
      title:  'We Are One (Ole Ola)',
      artist: 'Pitbull ft. Jennifer Lopez & Claudia Leitte',
      year:   2014,
      color:  '#1b5e20',
      scUrl:  'https://soundcloud.com/pitbull/we-are-one-ole-ola',
      archiveSearch: 'we are one ole ola pitbull jennifer lopez 2014',
    },
    'time-of-our-lives-2006': {
      title:  'The Time of Our Lives',
      artist: 'Il Divo & Toni Braxton',
      year:   2006,
      color:  '#4a148c',
      scUrl:  'https://soundcloud.com/ildivo/the-time-of-our-lives',
      archiveSearch: 'time of our lives il divo toni braxton 2006 world cup',
    },
    'un-estate-1990': {
      title:  "Un'Estate Italiana",
      artist: 'Gianna Nannini & Edoardo Bennato',
      year:   1990,
      color:  '#c0392b',
      scUrl:  'https://soundcloud.com/user-458015246/un-estate-italiana',
      archiveSearch: 'un estate italiana gianna nannini 1990 world cup',
    },
    'gloryland-1994': {
      title:  'Gloryland',
      artist: 'Daryl Hall & SOUNDS of Blackness',
      year:   1994,
      color:  '#1565c0',
      scUrl:  'https://soundcloud.com/user-237048326/gloryland-1994-fifa-world-cup',
      archiveSearch: 'gloryland daryl hall sounds of blackness 1994 world cup',
    },
    'anthem-2002': {
      title:  'Anthem 2002',
      artist: 'Vangelis',
      year:   2002,
      color:  '#e65100',
      scUrl:  'https://soundcloud.com/vangelis-official/anthem-2002',
      archiveSearch: 'anthem 2002 vangelis world cup',
    },
  };

  const songData = SONGS[song];
  if (!songData) {
    return new Response(JSON.stringify({
      success:   false,
      error:     'Unknown song: ' + song,
      available: Object.keys(SONGS),
    }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  }

  /* ── Build SoundCloud widget embed URL ── */
  /* This is the primary method — SoundCloud widget works in Pi Browser */
  const scEmbedUrl = 'https://w.soundcloud.com/player/?url='
    + encodeURIComponent(songData.scUrl)
    + '&auto_play=true'
    + '&hide_related=true'
    + '&show_comments=false'
    + '&show_user=false'
    + '&show_reposts=false'
    + '&show_teaser=false'
    + '&visual=true';   /* visual=true shows artwork + waveform */

  /* ── Verify SoundCloud track exists (HEAD on the API) ── */
  let scVerified = false;
  try {
    const scApiUrl = 'https://soundcloud.com/oembed?url='
      + encodeURIComponent(songData.scUrl)
      + '&format=json';
    const scCheck = await fetch(scApiUrl, {
      signal: AbortSignal.timeout(4000),
      headers: { 'User-Agent': 'WorldCupApp/1.0' }
    });
    if (scCheck.ok) {
      const scData = await scCheck.json();
      scVerified = !!(scData.html || scData.title);
      console.log('[audio] SoundCloud verified:', song, scVerified);
    }
  } catch(e) {
    console.warn('[audio] SoundCloud check failed:', e.message);
  }

  /* ── If SoundCloud not verified, try archive.org search ── */
  let archiveUrl = null;
  if (!scVerified) {
    try {
      const searchUrl = 'https://archive.org/advancedsearch.php?q='
        + encodeURIComponent(songData.archiveSearch)
        + '&fl[]=identifier&fl[]=title&rows=5&output=json&mediatype=audio';
      const sr = await fetch(searchUrl, { signal: AbortSignal.timeout(6000) });
      if (sr.ok) {
        const sd  = await sr.json();
        const docs = sd.response?.docs || [];
        for (const doc of docs) {
          try {
            const mr = await fetch(
              'https://archive.org/metadata/' + doc.identifier,
              { signal: AbortSignal.timeout(4000) }
            );
            if (!mr.ok) continue;
            const meta = await mr.json();
            const mp3  = (meta.files || []).find(f =>
              f.name && f.name.toLowerCase().endsWith('.mp3') && f.source !== 'metadata'
            );
            if (mp3) {
              const candidateUrl = 'https://archive.org/download/'
                + doc.identifier + '/' + encodeURIComponent(mp3.name);
              /* HEAD verify this URL is actually audio */
              const headR = await fetch(candidateUrl, {
                method: 'HEAD',
                signal: AbortSignal.timeout(4000),
              });
              const ct = headR.headers.get('content-type') || '';
              if (headR.ok && ct.includes('audio')) {
                archiveUrl = candidateUrl;
                console.log('[audio] archive.org verified:', candidateUrl.slice(0, 60));
                break;
              }
            }
          } catch(e) { continue; }
        }
      }
    } catch(e) {
      console.warn('[audio] archive search failed:', e.message);
    }
  }

  return new Response(JSON.stringify({
    success:      scVerified || !!(archiveUrl),
    song:         song,
    title:        songData.title,
    artist:       songData.artist,
    year:         songData.year,
    color:        songData.color,
    /* Primary: SoundCloud embed iframe */
    scEmbedUrl:   scVerified ? scEmbedUrl : null,
    scTrackUrl:   scVerified ? songData.scUrl : null,
    /* Secondary: direct MP3 if SC fails */
    audioUrl:     archiveUrl || null,
    /* Which method to use */
    method:       scVerified ? 'soundcloud' : (archiveUrl ? 'direct' : 'none'),
    verified:     scVerified || !!(archiveUrl),
  }), { headers: { ...cors, 'Content-Type': 'application/json' } });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
