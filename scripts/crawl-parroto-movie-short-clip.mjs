/**
 * Crawl Parroto topic "movie-short-clip" — DATA ONLY
 * (lessons metadata, YouTube video URL, timed transcript / sentences).
 * No layout, CSS, fonts, or UI assets.
 *
 * Usage: node scripts/crawl-parroto-movie-short-clip.mjs
 * Output: data/parroto/movie-short-clip/
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../data/parroto/movie-short-clip");
const TOPIC_SLUG = "movie-short-clip";
const API = "https://api.parroto.app/api";
const SITE = "https://parroto.app";
const CONCURRENCY = 6;

const SALT = "parroto.kr.2026.salt.v1";
const PARTS_A = [
  "94F/OPbd+v+Eluc=",
  "hacWAys8nOO+eEQ=",
  "Kmk1ZkjpU61Rqqw=",
  "lVZvtPG76pLOn8o=",
].map((b) => Buffer.from(b, "base64"));

const pad = crypto.createHash("sha256").update(SALT).digest();

function mix(parts, hostOk = true) {
  const o = Buffer.concat(parts.map((p) => Buffer.from(p)));
  const xorHost = hostOk ? 0 : 255;
  const c = Buffer.alloc(o.length);
  for (let i = 0; i < o.length; i++) {
    c[i] = o[i] ^ pad[i % pad.length] ^ xorHost;
  }
  return c;
}

/** AES-GCM key for lesson SSR payload (tA). */
function lessonDecryptKey() {
  const mixStr = mix(PARTS_A, true).toString("utf8");
  return Buffer.from(mixStr, "base64");
}

function decryptPayload(payloadB64, key) {
  const raw = Buffer.from(payloadB64, "base64");
  const iv = raw.subarray(0, 12);
  const data = raw.subarray(12);
  const tag = data.subarray(data.length - 16);
  const enc = data.subarray(0, data.length - 16);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return JSON.parse(dec.toString("utf8"));
}

function b64url(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/** Guest platform JWT (same as web client). */
function makeToken(ttlSec = 300) {
  const secret = mix(PARTS_A, true);
  // Client uses SignJWT with HMAC key = raw secret bytes from mix string as latin1
  // For list API, secret is the raw mix buffer used via SubtleCrypto importKey(raw)
  // Observed working: HMAC with secret = mix buffer itself (44 bytes) failed earlier;
  // working path was importKey with string-from-charCode of mix then...
  // Actually successful list call used: HMAC with secret = mix(PARTS_A) buffer directly
  // in _parroto-token-test.js — that used `secret` = mix buffer (44 bytes). WebCrypto
  // accepts any length for HMAC. Node crypto.createHmac also accepts any key length.
  const h = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const p = b64url(
    JSON.stringify({
      platform: "web",
      exp: Math.floor(Date.now() / 1000) + ttlSec,
    }),
  );
  const data = `${h}.${p}`;
  const sig = crypto.createHmac("sha256", secret).update(data).digest();
  return `${data}.${b64url(sig)}`;
}

async function fetchJson(url, headers = {}) {
  const r = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      ...headers,
    },
  });
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`${r.status} ${url} ${text.slice(0, 200)}`);
  }
  return r.json();
}

function youtubeIdFromUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || null;
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const m = u.pathname.match(/\/embed\/([^/]+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

function normalizeLesson(raw) {
  const youtubeId = youtubeIdFromUrl(raw.url);
  const sentences = Array.isArray(raw.sentence_ids) ? raw.sentence_ids : [];
  return {
    id: raw._id,
    slug: raw.slug,
    title: raw.title,
    description: raw.description || "",
    duration: raw.duration,
    difficulty: raw.difficulty,
    type: raw.type,
    isPro: Boolean(raw.is_pro),
    topic: {
      id: raw.topic_id?._id,
      name: raw.topic_id?.name,
      slug: raw.topic_id?.slug,
    },
    video: {
      url: raw.url || null,
      youtubeId,
      thumbnail:
        raw.thumbnail ||
        (youtubeId
          ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
          : null),
    },
    transcript: sentences.map((s, i) => ({
      id: s._id,
      index: i,
      text: s.text,
      startMs: s.start_ms ?? null,
      endMs: s.end_ms ?? null,
      ipa: s.ipa ?? null,
      translations: s.translations || {},
    })),
    segmentCount: sentences.length,
    order: raw.order,
    viewCount: raw.total_view_count ?? raw.view_count ?? null,
    source: {
      site: "parroto.app",
      topicSlug: TOPIC_SLUG,
      lessonPath: `/lessons/shadowing/${raw.slug}`,
    },
  };
}

async function mapPool(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  );
  return results;
}

async function getBuildId() {
  const r = await fetch(`${SITE}/topics/${TOPIC_SLUG}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });
  const html = await r.text();
  const m = html.match(/"buildId":"([^"]+)"/);
  if (!m) throw new Error("Cannot find Next.js buildId");
  return m[1];
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(path.join(OUT_DIR, "lessons"), { recursive: true });

  const token = makeToken(600);
  const authHeaders = {
    Authorization: `Bearer ${token}`,
    Origin: SITE,
    Referer: `${SITE}/topics/${TOPIC_SLUG}`,
    "X-User-Timezone": "Asia/Bangkok",
  };

  console.log("Fetching lesson list…");
  const listJson = await fetchJson(
    `${API}/lessons?limit=500&sort_by=order&topic_slug=${TOPIC_SLUG}&page=1`,
    authHeaders,
  );
  const lessons = listJson?.data?.data?.lessons || [];
  const pagination = listJson?.data?.data?.pagination || listJson?.data?.pagination;
  console.log(`Found ${lessons.length} lessons`, pagination || "");

  fs.writeFileSync(
    path.join(OUT_DIR, "lessons-index.raw.json"),
    JSON.stringify(listJson, null, 2),
  );

  const catalog = lessons.map((l) => ({
    id: l._id,
    slug: l.slug,
    title: l.title,
    duration: l.duration,
    difficulty: l.difficulty,
    order: l.order,
    isPro: Boolean(l.is_pro),
    thumbnail: l.thumbnail || null,
    totalViewCount: l.total_view_count ?? null,
  }));
  fs.writeFileSync(
    path.join(OUT_DIR, "catalog.json"),
    JSON.stringify(
      {
        source: SITE,
        topicSlug: TOPIC_SLUG,
        crawledAt: new Date().toISOString(),
        count: catalog.length,
        lessons: catalog,
      },
      null,
      2,
    ),
  );

  const buildId = await getBuildId();
  console.log("buildId", buildId);
  const key = lessonDecryptKey();

  let ok = 0;
  let fail = 0;
  const failures = [];
  const allNormalized = [];

  await mapPool(lessons, CONCURRENCY, async (meta, idx) => {
    const slug = meta.slug;
    const url = `${SITE}/_next/data/${buildId}/en/lessons/shadowing/${slug}.json?lessonSlug=${encodeURIComponent(slug)}`;
    try {
      const page = await fetchJson(url, {
        "x-nextjs-data": "1",
        Referer: `${SITE}/lessons/shadowing/${slug}`,
      });
      const payload = page?.pageProps?.payload;
      if (!payload || typeof payload !== "string") {
        throw new Error("missing encrypted payload");
      }
      const raw = decryptPayload(payload, key);
      const normalized = normalizeLesson(raw);
      allNormalized.push(normalized);

      fs.writeFileSync(
        path.join(OUT_DIR, "lessons", `${slug}.json`),
        JSON.stringify(normalized, null, 2),
      );
      // keep raw decrypted for reference (data only)
      fs.writeFileSync(
        path.join(OUT_DIR, "lessons", `${slug}.raw.json`),
        JSON.stringify(raw, null, 2),
      );
      ok++;
      if ((idx + 1) % 10 === 0 || idx === 0) {
        console.log(`[${idx + 1}/${lessons.length}] OK ${slug} (${normalized.segmentCount} segs)`);
      }
    } catch (e) {
      fail++;
      failures.push({ slug, id: meta._id, error: String(e.message || e) });
      console.error(`[${idx + 1}/${lessons.length}] FAIL ${slug}:`, e.message || e);
    }
  });

  // stable order by catalog order
  const orderMap = new Map(lessons.map((l, i) => [l.slug, i]));
  allNormalized.sort(
    (a, b) => (orderMap.get(a.slug) ?? 0) - (orderMap.get(b.slug) ?? 0),
  );

  // Shadowing-compatible flat catalog (video list only)
  const shadowingVideos = allNormalized.map((l) => ({
    id: l.id,
    youtubeId: l.video.youtubeId || l.slug,
    title: l.title,
    thumbnailUrl: l.video.thumbnail,
    category: "Movie short clip",
    level: l.difficulty || "A2",
    duration: l.duration || "",
    segments: l.segmentCount,
    createdAt: null,
    source: "parroto",
    topicSlug: TOPIC_SLUG,
    slug: l.slug,
    videoUrl: l.video.url,
  }));

  // Subtitles map by youtubeId
  const byYoutubeId = {};
  for (const l of allNormalized) {
    const yid = l.video.youtubeId;
    if (!yid) continue;
    byYoutubeId[yid] = l.transcript.map((s) => ({
      id: s.id,
      text: s.text,
      startTime: s.startMs != null ? s.startMs / 1000 : null,
      duration:
        s.startMs != null && s.endMs != null
          ? (s.endMs - s.startMs) / 1000
          : null,
      ipa: s.ipa,
      vietnameseText: s.translations?.vi ?? null,
      translations: s.translations,
    }));
  }

  fs.writeFileSync(
    path.join(OUT_DIR, "all-lessons.json"),
    JSON.stringify(
      {
        source: SITE,
        topicSlug: TOPIC_SLUG,
        crawledAt: new Date().toISOString(),
        count: allNormalized.length,
        lessons: allNormalized,
      },
      null,
      2,
    ),
  );
  fs.writeFileSync(
    path.join(OUT_DIR, "shadowingVideos.json"),
    JSON.stringify(shadowingVideos, null, 2),
  );
  fs.writeFileSync(
    path.join(OUT_DIR, "shadowingSubtitles.json"),
    JSON.stringify(
      {
        meta: {
          totalSegments: Object.values(byYoutubeId).reduce(
            (n, a) => n + a.length,
            0,
          ),
          videosWithSubtitles: Object.keys(byYoutubeId).length,
          source: "parroto",
          topicSlug: TOPIC_SLUG,
        },
        byYoutubeId,
      },
      null,
      2,
    ),
  );
  fs.writeFileSync(
    path.join(OUT_DIR, "crawl-report.json"),
    JSON.stringify(
      {
        ok,
        fail,
        total: lessons.length,
        failures,
        outDir: OUT_DIR,
        crawledAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );

  console.log("\nDone.");
  console.log(`  OK:   ${ok}`);
  console.log(`  FAIL: ${fail}`);
  console.log(`  Out:  ${OUT_DIR}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
