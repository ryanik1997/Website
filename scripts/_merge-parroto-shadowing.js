const fs = require('fs');
const path = require('path');

const APP_VIDEOS = 'D:/App-English-Ryan/Website/apps/web/src/features/shadowing/data/shadowingVideos.json';
const APP_SUBS = 'D:/App-English-Ryan/Website/apps/web/src/features/shadowing/data/shadowingSubtitles.json';
const PARROTO_VIDEOS = 'D:/App-English-Ryan/Website/data/parroto/movie-short-clip/shadowingVideos.json';
const PARROTO_SUBS = 'D:/App-English-Ryan/Website/data/parroto/movie-short-clip/shadowingSubtitles.json';
const CATEGORY = 'Movie short clip';

const existingVideos = JSON.parse(fs.readFileSync(APP_VIDEOS, 'utf8'));
const existingSubs = JSON.parse(fs.readFileSync(APP_SUBS, 'utf8'));
const parrotoVideos = JSON.parse(fs.readFileSync(PARROTO_VIDEOS, 'utf8'));
const parrotoSubs = JSON.parse(fs.readFileSync(PARROTO_SUBS, 'utf8'));

const byYt = new Map(existingVideos.map(v => [v.youtubeId, v]));
let added = 0;
let skipped = 0;

for (const v of parrotoVideos) {
  const youtubeId = v.youtubeId;
  if (!youtubeId) {
    skipped++;
    continue;
  }
  // Shape must match ShadowingVideo — strip extra fields
  const row = {
    id: v.id,
    youtubeId,
    title: v.title,
    thumbnailUrl: v.thumbnailUrl || `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    category: CATEGORY,
    level: v.level || 'B1',
    duration: v.duration || '',
    segments: typeof v.segments === 'number' ? v.segments : 0,
    createdAt: v.createdAt ?? null,
  };
  if (byYt.has(youtubeId)) {
    // Keep existing TID row if collision; still refresh segments if missing
    skipped++;
    continue;
  }
  byYt.set(youtubeId, row);
  added++;
}

const mergedVideos = [...byYt.values()];
// Stable: original order first, then new parroto by original parroto order
const existingOrder = new Map(existingVideos.map((v, i) => [v.youtubeId, i]));
const parrotoOrder = new Map(parrotoVideos.map((v, i) => [v.youtubeId, 100000 + i]));
mergedVideos.sort((a, b) => {
  const ao = existingOrder.has(a.youtubeId) ? existingOrder.get(a.youtubeId) : parrotoOrder.get(a.youtubeId) ?? 999999;
  const bo = existingOrder.has(b.youtubeId) ? existingOrder.get(b.youtubeId) : parrotoOrder.get(b.youtubeId) ?? 999999;
  return ao - bo;
});

const byYoutubeId = { ...(existingSubs.byYoutubeId || {}) };
let subVideosAdded = 0;
let segmentsAdded = 0;
for (const [yt, segs] of Object.entries(parrotoSubs.byYoutubeId || {})) {
  if (byYoutubeId[yt]?.length) continue; // don't overwrite existing
  const cleaned = (segs || []).map(s => ({
    id: s.id,
    text: s.text,
    startTime: s.startTime ?? null,
    duration: s.duration ?? null,
    ipa: s.ipa ?? null,
    vietnameseText: s.vietnameseText ?? s.translations?.vi ?? null,
  }));
  byYoutubeId[yt] = cleaned;
  subVideosAdded++;
  segmentsAdded += cleaned.length;
}

const totalSegments = Object.values(byYoutubeId).reduce((n, a) => n + (a?.length || 0), 0);
const videosWithSubtitles = Object.values(byYoutubeId).filter(a => a?.length).length;

const mergedSubs = {
  meta: {
    officialVideos: existingVideos.length,
    parrotoMovieShortClip: added,
    videosWithSubtitles,
    totalSegments,
    scope: 'official+parroto-movie-short-clip',
    mergedAt: new Date().toISOString(),
  },
  byYoutubeId,
};

// Backup then write
const bakDir = 'D:/App-English-Ryan/Website/data/parroto/movie-short-clip/_app-backup-before-merge';
fs.mkdirSync(bakDir, { recursive: true });
fs.copyFileSync(APP_VIDEOS, path.join(bakDir, 'shadowingVideos.json'));
fs.copyFileSync(APP_SUBS, path.join(bakDir, 'shadowingSubtitles.json'));

fs.writeFileSync(APP_VIDEOS, JSON.stringify(mergedVideos, null, 2) + '\n');
fs.writeFileSync(APP_SUBS, JSON.stringify(mergedSubs, null, 2) + '\n');

console.log(JSON.stringify({
  beforeVideos: existingVideos.length,
  afterVideos: mergedVideos.length,
  added,
  skippedOverlap: skipped,
  subVideosAdded,
  segmentsAdded,
  totalSegments,
  categoryCount: mergedVideos.filter(v => v.category === CATEGORY).length,
}, null, 2));
