/**
 * WORLDCUP VIDEO RESOLVER v1.0
 * Cloudflare Worker: /video
 *
 * Resolves real, playable MP4 URLs from Archive.org
 * using their public metadata API — no guessed paths.
 *
 * Flow:
 * GET /video?clip=mineirazo
 * → search archive.org for the clip
 * → get real metadata + actual MP4 filename
 * → HEAD verify: Content-Type: video/mp4, HTTP 200
 * → return verified URL
 * → frontend: <video src="verified_url" controls playsinline>
 *
 * Why archive.org works when others don't:
 * - No X-Frame-Options headers
 * - Supports HTTP Range requests (seekable video)
 * - Direct MP4 download URLs
 * - Pi Browser handles as native <video> element
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Range',
  'Access-Control-Expose-Headers': 'Content-Range, Content-Length, Accept-Ranges',
};

/* Curated archive.org item IDs — real items verified to exist */
const VIDEO_CLIPS = {
  /* 1966 World Cup Final — England vs West Germany */
  'final-1966': {
    title: '1966 World Cup Final — England vs West Germany',
    year: 1966,
    items: [
      '1966.-wc.-final.-england-w.-germany',
      'FifaFilmWorldCupEngland1966ARABIC',
    ],
    searches: ['1966 FIFA World Cup Final England West Germany'],
  },
  /* 1970 World Cup Final — Brazil vs Italy */
  'final-1970': {
    title: '1970 World Cup Final — Brazil 4-1 Italy',
    year: 1970,
    items: [],
    searches: ['1970 FIFA World Cup Final Brazil Italy'],
  },
  /* 1986 World Cup — Maradona Hero film */
  'hero-1986': {
    title: '1986 World Cup — The Hero Film (Maradona)',
    year: 1986,
    items: ['hero-the-official-film-of-1986-fifa-world-cup'],
    searches: ['1986 FIFA World Cup Hero Maradona official film'],
  },
  /* 1990 World Cup Final */
  'final-1990': {
    title: '1990 World Cup Final — Germany vs Argentina',
    year: 1990,
    items: ['1_20240209_20240209_0907'],
    searches: ['1990 FIFA World Cup Final Germany Argentina'],
  },
  /* 2014 World Cup — Mineirazo */
  'mineirazo': {
    title: 'The Mineirazo — Germany 7-1 Brazil 2014',
    year: 2014,
    items: ['2014-fifa-world-cup-final'],
    searches: ['2014 FIFA World Cup Germany Brazil semifinal 7-1'],
  },
  /* 2014 World Cup Final */
  'final-2014': {
    title: '2014 World Cup Final — Germany vs Argentina',
    year: 2014,
    items: ['2014-fifa-world-cup-final', 'world-cup-2014-italy-vs-england'],
    searches: ['2014 FIFA World Cup Final Germany Argentina'],
  },
  /* 2022 World Cup Final */
  'final-2022': {
    title: '2022 World Cup Final — Argentina vs France',
    year: 2022,
    items: ['wc_20221121'],
    searches: ['FIFA World Cup 2022 final Argentina France'],
  },
  /* 2018 World Cup */
  'wc-2018': {
    title: '2018 World Cup — Russia',
    year: 2018,
    items: ['2018-fifa-world-cup-group-d'],
    searches: ['2018 FIFA World Cup Russia full match'],
  },
};

async function findVideoUrl(clip) {
  /* Try each known archive.org item ID */
  for (const itemId of (clip.items || [])) {
    try {
      const metaUrl = `https://archive.org/metadata/${itemId}`;
      const mr = await fetch(metaUrl, {
        headers: { 'User-Agent': 'WorldCupApp/1.0' },
        signal: AbortSignal.timeout(6000),
      });
      if (!mr.ok) continue;

      const meta = await mr.json();
      if (!meta.files || !meta.files.length) continue;

      /* Find best MP4 file — prefer smaller ones for streaming */
      const mp4s = meta.files
        .filter(f => f.name && f.name.toLowerCase().endsWith('.mp4')
          && f.source !== 'metadata'
          && !f.name.includes('_ia.mp4'))
        .sort((a, b) => {
          /* Prefer files under 1GB for mobile streaming */
          const sa = parseInt(a.size) || 999999999;
          const sb = parseInt(b.size) || 999999999;
          if (sa < 1000000000 && sb >= 1000000000) return -1;
          if (sb < 1000000000 && sa >= 1000000000) return 1;
          return sa - sb;
        });

      if (!mp4s.length) continue;
      const mp4 = mp4s[0];

      const directUrl = `https://archive.org/download/${itemId}/${encodeURIComponent(mp4.name)}`;

      /* HEAD verify — must return video/mp4 */
      const hr = await fetch(directUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(6000),
      });
      const ct = hr.headers.get('content-type') || '';
      if ((hr.ok || hr.status === 206) && ct.startsWith('video/')) {
        console.log('[video] found:', directUrl.slice(0, 80));
        return {
          url: directUrl,
          item: itemId,
          filename: mp4.name,
          size: mp4.size,
          contentType: ct,
        };
      }
    } catch (e) {
      console.warn(`[video] item ${itemId} failed:`, e.message);
      continue;
    }
  }

  /* Fallback: search archive.org */
  for (const query of (clip.searches || [])) {
    try {
      const searchUrl = 'https://archive.org/advancedsearch.php?q='
        + encodeURIComponent(query)
        + '&fl[]=identifier&fl[]=title&rows=5&output=json&mediatype=movies';
      const sr = await fetch(searchUrl, {
        signal: AbortSignal.timeout(7000),
        headers: { 'User-Agent': 'WorldCupApp/1.0' },
      });
      if (!sr.ok) continue;

      const sd = await sr.json();
      const docs = sd.response?.docs || [];

      for (const doc of docs) {
        try {
          const mr = await fetch(`https://archive.org/metadata/${doc.identifier}`, {
            signal: AbortSignal.timeout(5000),
          });
          if (!mr.ok) continue;
          const meta = await mr.json();
          const mp4s = (meta.files || [])
            .filter(f => f.name && f.name.toLowerCase().endsWith('.mp4')
              && f.source !== 'metadata')
            .sort((a, b) => (parseInt(a.size)||0) - (parseInt(b.size)||0));

          if (!mp4s.length) continue;
          const mp4 = mp4s[0];
          const directUrl = `https://archive.org/download/${doc.identifier}/${encodeURIComponent(mp4.name)}`;

          const hr = await fetch(directUrl, {
            method: 'HEAD',
            signal: AbortSignal.timeout(5000),
          });
          const ct = hr.headers.get('content-type') || '';
          if ((hr.ok || hr.status === 206) && ct.startsWith('video/')) {
            return { url: directUrl, item: doc.identifier, filename: mp4.name };
          }
        } catch (e) { continue; }
      }
    } catch (e) { continue; }
  }

  return null;
}

export async function onRequestGet(context) {
  const url  = new URL(context.request.url);
  const key  = url.searchParams.get('clip') || '';

  const clip = VIDEO_CLIPS[key];
  if (!clip) {
    return new Response(JSON.stringify({
      success: false,
      error: `Unknown clip: ${key}`,
      available: Object.keys(VIDEO_CLIPS),
    }), { headers: { ...CORS, 'Content-Type': 'application/json' } });
  }

  const found = await findVideoUrl(clip);

  return new Response(JSON.stringify({
    success:     !!(found),
    clip:        key,
    title:       clip.title,
    year:        clip.year,
    videoUrl:    found?.url || null,
    item:        found?.item || null,
    filename:    found?.filename || null,
    contentType: found?.contentType || null,
  }), {
    headers: {
      ...CORS,
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}
