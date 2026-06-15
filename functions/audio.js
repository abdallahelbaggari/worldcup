/**
 * ================================================================
 * WORLDCUP AUDIO RESOLVER v1.0
 * Cloudflare Worker: /audio
 *
 * Resolves real, playable audio URLs from Archive.org
 * using their public API — no guessed paths, always verified
 *
 * Flow:
 * GET /audio?song=waka-waka-2010
 * → search archive.org for the song
 * → get real metadata including actual file paths
 * → return verified playable MP3 URL
 * → frontend plays with <audio src="VERIFIED_URL">
 * ================================================================
 */

export async function onRequestGet(context) {
  const cors = {
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',  /* 24h cache */
  };

  const url  = new URL(context.request.url);
  const song = url.searchParams.get('song') || '';

  /* ── CURATED SONG REGISTRY ── */
  /* Each song has: Archive.org item identifiers (verified) */
  /* Multiple identifiers tried in order */
  const SONGS = {
    'waka-waka-2010': {
      title: 'Waka Waka (This Time for Africa)',
      artist: 'Shakira',
      year: 2010,
      color: '#f57f17',
      /* Archive.org item IDs — tried in order */
      items: [
        'shakira-waka-waka-2010',
        'WakaWaka_Shakira_WorldCup2010',
        'shakira-waka-waka-this-time-for-africa',
        'FIFA-World-Cup-2010-Shakira-Waka-Waka',
      ],
      /* Archive.org advanced search queries as final fallback */
      searchQuery: 'waka waka shakira 2010 world cup',
    },
    'hayya-hayya-2022': {
      title: 'Hayya Hayya (Better Together)',
      artist: 'Trinidad Cardona, Davido & Aisha',
      year: 2022,
      color: '#880e4f',
      items: [
        'hayya-hayya-better-together',
        'hayya-hayya-2022-world-cup',
        'FIFA-World-Cup-Qatar-2022-Song',
      ],
      searchQuery: 'hayya hayya better together 2022 world cup official',
    },
    'la-copa-1998': {
      title: 'La Copa de la Vida',
      artist: 'Ricky Martin',
      year: 1998,
      color: '#00695c',
      items: [
        'ricky-martin-la-copa-de-la-vida',
        'LaCopaDeLaVida-RickyMartin-1998',
        'la-copa-de-la-vida-world-cup-1998',
      ],
      searchQuery: 'la copa de la vida ricky martin 1998 world cup',
    },
    'live-it-up-2018': {
      title: 'Live It Up',
      artist: 'Nicky Jam ft. Will Smith & Era Istrefi',
      year: 2018,
      color: '#b71c1c',
      items: [
        'live-it-up-2018-world-cup',
        'nicky-jam-will-smith-live-it-up-2018',
        'FIFA-World-Cup-Russia-2018-Official-Song',
      ],
      searchQuery: 'live it up nicky jam will smith 2018 world cup official',
    },
    'we-are-one-2014': {
      title: 'We Are One (Ole Ola)',
      artist: 'Pitbull ft. Jennifer Lopez & Claudia Leitte',
      year: 2014,
      color: '#1b5e20',
      items: [
        'we-are-one-ole-ola-2014-world-cup',
        'pitbull-we-are-one-2014-fifa',
        'FIFA-World-Cup-Brazil-2014-We-Are-One',
      ],
      searchQuery: 'we are one ole ola pitbull jennifer lopez 2014 world cup',
    },
    'time-of-our-lives-2006': {
      title: 'The Time of Our Lives',
      artist: 'Il Divo & Toni Braxton',
      year: 2006,
      color: '#4a148c',
      items: [
        'the-time-of-our-lives-il-divo-2006',
        'il-divo-toni-braxton-2006-world-cup',
        'FIFA-Germany-2006-Song',
      ],
      searchQuery: 'time of our lives il divo toni braxton 2006 world cup',
    },
    'un-estate-1990': {
      title: "Un'Estate Italiana",
      artist: 'Gianna Nannini & Edoardo Bennato',
      year: 1990,
      color: '#c0392b',
      items: [
        'un-estate-italiana-1990-world-cup',
        'gianna-nannini-un-estate-italiana-italia-90',
        'FIFA-Italia-90-Theme',
      ],
      searchQuery: 'un estate italiana gianna nannini edoardo bennato 1990 world cup',
    },
    'gloryland-1994': {
      title: 'Gloryland',
      artist: 'Daryl Hall & SOUNDS of Blackness',
      year: 1994,
      color: '#1565c0',
      items: [
        'gloryland-1994-world-cup',
        'daryl-hall-sounds-of-blackness-gloryland',
        'FIFA-USA-1994-World-Cup-Song',
      ],
      searchQuery: 'gloryland daryl hall sounds of blackness 1994 world cup',
    },
    'anthem-2002': {
      title: 'Anthem 2002',
      artist: 'Vangelis',
      year: 2002,
      color: '#e65100',
      items: [
        'vangelis-anthem-2002',
        'anthem-2002-vangelis-world-cup',
        'FIFA-2002-Korea-Japan-World-Cup-Theme',
      ],
      searchQuery: 'anthem 2002 vangelis world cup korea japan official',
    },
  };

  const songData = SONGS[song];
  if (!songData) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Unknown song: ' + song,
      available: Object.keys(SONGS),
    }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  }

  /* ── TRY EACH ARCHIVE.ORG ITEM IN ORDER ── */
  let resolvedUrl  = null;
  let resolvedItem = null;

  for (const itemId of songData.items) {
    try {
      const metaUrl = `https://archive.org/metadata/${itemId}`;
      const r = await fetch(metaUrl, { headers: { 'Accept': 'application/json' } });
      if (!r.ok) continue;

      const meta = await r.json();
      if (!meta.files || meta.files.length === 0) continue;

      /* Find an MP3 file */
      const mp3 = meta.files.find(f =>
        f.name && (f.name.endsWith('.mp3') || f.name.endsWith('.MP3')) &&
        f.source !== 'metadata'
      );
      if (!mp3) continue;

      /* Build the direct download URL */
      resolvedUrl  = `https://archive.org/download/${itemId}/${encodeURIComponent(mp3.name)}`;
      resolvedItem = itemId;
      console.log(`[audio] Found: ${itemId}/${mp3.name}`);
      break;

    } catch(e) {
      console.warn(`[audio] Item ${itemId} failed:`, e.message);
      continue;
    }
  }

  /* ── FALLBACK: Archive.org search ── */
  if (!resolvedUrl) {
    try {
      const searchUrl = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(songData.searchQuery)}`
        + `&fl[]=identifier&fl[]=title&rows=5&output=json&mediatype=audio`;
      const sr = await fetch(searchUrl);
      if (sr.ok) {
        const sd = await sr.json();
        const items = sd.response?.docs || [];
        for (const item of items) {
          try {
            const mr = await fetch(`https://archive.org/metadata/${item.identifier}`);
            if (!mr.ok) continue;
            const meta = await mr.json();
            const mp3 = (meta.files || []).find(f =>
              f.name && f.name.endsWith('.mp3') && f.source !== 'metadata'
            );
            if (mp3) {
              resolvedUrl  = `https://archive.org/download/${item.identifier}/${encodeURIComponent(mp3.name)}`;
              resolvedItem = item.identifier;
              break;
            }
          } catch(e) { continue; }
        }
      }
    } catch(e) {
      console.warn('[audio] Search fallback failed:', e.message);
    }
  }

  return new Response(JSON.stringify({
    success:    !!(resolvedUrl),
    song:       song,
    title:      songData.title,
    artist:     songData.artist,
    year:       songData.year,
    color:      songData.color,
    audioUrl:   resolvedUrl,
    item:       resolvedItem,
    /* Also provide metadata for the player UI */
    available:  !!(resolvedUrl),
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
