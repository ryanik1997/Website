/**
 * Import per-part IELTS Listening MP3 from Desktop "Đề thi IELTS"
 * → public/catalog/listening/ielts-cam{B}-test{T}/part{N}.mp3
 * → Tainguyen Listening folders (optional)
 * → patch catalog JSON audioUrl + clear segment fallbacks
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC =
  process.env.IELTS_DETHI_AUDIO_ROOT ||
  "C:\\Users\\ADMIN\\OneDrive\\Desktop\\Dethi\\Đề thi IELTS";
const PUB = path.join(ROOT, "apps/web/public/catalog/listening");
const DATA = path.join(ROOT, "packages/catalog/data");
const TAINGUYEN =
  process.env.IELTS_LISTENING_TAINGUYEN ||
  "D:\\App-English-Ryan\\Tainguyen\\IELTS\\Listening";

function walkMp3(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkMp3(full, out);
    else if (/\.mp3$/i.test(ent.name)) out.push(full);
  }
  return out;
}

/**
 * @returns {{ book: number, test: number, part: number } | null}
 */
function parseAudioPath(fullPath) {
  const rel = fullPath.slice(SRC.length).replace(/^[\\/]/, "");
  const name = path.basename(fullPath);
  const lower = `${rel} ${name}`.toLowerCase();

  // Book from folder or name
  let book = null;
  let m =
    rel.match(/cambridge\s+ie[lt]{2}s\s*(\d+)/i) ||
    rel.match(/cambridge\s+ietls\s*(\d+)/i) ||
    rel.match(/\bcam(?:bridge)?\s*(\d+)\b/i) ||
    name.match(/ielts\s*(\d+)/i) ||
    name.match(/\bc(\d+)[-_]/i) ||
    name.match(/^(\d{2})\s+section/i); // "18 section1-part1"
  if (m) book = Number(m[1]);

  // Cam 18: "18 section1-part1" / "18 section2 - part1" — section = test
  m = name.match(/^(\d{2})\s*section\s*(\d+)\s*[- ]*\s*part\s*(\d+)/i);
  if (m) {
    return { book: Number(m[1]), test: Number(m[2]), part: Number(m[3]) };
  }

  // Cam 20: T2S1.mp3
  m = name.match(/^T(\d+)S(\d+)\.mp3$/i);
  if (m && book == null) book = 20;
  if (m) return { book: book ?? 20, test: Number(m[1]), part: Number(m[2]) };

  // Cam 13: IELTS13_Test1_01.lite.mp3
  m = name.match(/IELTS\s*(\d+)[_\s-]*Test\s*(\d+)[_\s-]*0?(\d)/i);
  if (m) return { book: Number(m[1]), test: Number(m[2]), part: Number(m[3]) };

  // Cam 14: C14-Test1-Section1.lite.mp3
  m = name.match(/C(\d+)[-_]?Test\s*(\d+)[-_]?Section\s*(\d+)/i);
  if (m) return { book: Number(m[1]), test: Number(m[2]), part: Number(m[3]) };

  // Cam 15: IELTS15_test1_audio1.lite.mp3
  m = name.match(/IELTS\s*(\d+)[_\s-]*test\s*(\d+)[_\s-]*audio\s*(\d+)/i);
  if (m) return { book: Number(m[1]), test: Number(m[2]), part: Number(m[3]) };

  // Cam 17: ELT_IELTS17_t1_audio1.mp3
  m = name.match(/IELTS\s*(\d+)[_\s-]*t(\d+)[_\s-]*audio\s*(\d+)/i);
  if (m) return { book: Number(m[1]), test: Number(m[2]), part: Number(m[3]) };

  // Cam 10: IELTS 10 Test 1 Section 1.mp3
  m = name.match(/IELTS\s*(\d+)\s+Test\s*(\d+)\s+Section\s*(\d+)/i);
  if (m) return { book: Number(m[1]), test: Number(m[2]), part: Number(m[3]) };

  // Cam 11: IELTS11_Test1_Section1.mp3
  m = name.match(/IELTS\s*(\d+)[_\s-]*Test\s*(\d+)[_\s-]*Section\s*(\d+)/i);
  if (m) return { book: Number(m[1]), test: Number(m[2]), part: Number(m[3]) };

  // Cam 12: Test 1Section 1.mp3 / Test 1 Section 1
  m = name.match(/Test\s*(\d+)\s*Section\s*(\d+)/i);
  if (m && book != null) {
    return { book, test: Number(m[1]), part: Number(m[2]) };
  }

  // Cam 9: Test1,Part1.mp3 / Cam 16: Test 1 Part 1.mp3 / Cam 19: Test1 Part1.mp3
  m = name.match(/Test\s*(\d+)\s*[,_]?\s*Part\s*(\d+)/i);
  if (m && book != null) {
    return { book, test: Number(m[1]), part: Number(m[2]) };
  }

  // Generic: Test N ... Section/Part M with book from folder
  m = name.match(/Test\s*(\d+).*?(?:Section|Part|audio)\s*(\d+)/i);
  if (m && book != null) {
    return { book, test: Number(m[1]), part: Number(m[2]) };
  }

  return null;
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

if (!fs.existsSync(SRC)) {
  console.error("Source not found:", SRC);
  process.exit(1);
}

const files = walkMp3(SRC);
console.log("Found MP3:", files.length);

/** @type {Map<string, string>} key book-test-part → src path */
const map = new Map();
const unparsed = [];

for (const f of files) {
  const p = parseAudioPath(f);
  if (!p || p.book < 9 || p.book > 20 || p.test < 1 || p.test > 4 || p.part < 1 || p.part > 4) {
    unparsed.push(path.relative(SRC, f));
    continue;
  }
  const key = `${p.book}-${p.test}-${p.part}`;
  // Prefer larger file if duplicate
  if (map.has(key)) {
    const prev = map.get(key);
    if (fs.statSync(f).size <= fs.statSync(prev).size) continue;
  }
  map.set(key, f);
}

console.log("Mapped parts:", map.size, "unparsed:", unparsed.length);
if (unparsed.length && unparsed.length < 30) {
  console.log("Unparsed samples:", unparsed.slice(0, 15));
}

let copiedPub = 0;
let copiedTai = 0;

for (const [key, src] of map) {
  const [book, test, part] = key.split("-").map(Number);
  const destPub = path.join(
    PUB,
    `ielts-cam${book}-test${test}`,
    `part${part}.mp3`,
  );
  copyFile(src, destPub);
  copiedPub += 1;

  const taiDir = path.join(
    TAINGUYEN,
    `Listening IELTS_Test${test}_Cam${book}`,
  );
  if (fs.existsSync(path.dirname(taiDir)) || fs.existsSync(TAINGUYEN)) {
    try {
      fs.mkdirSync(taiDir, { recursive: true });
      copyFile(src, path.join(taiDir, `part${part}.mp3`));
      copiedTai += 1;
    } catch (e) {
      /* ignore tainguyen write errors */
    }
  }
}

// Patch catalog JSON
let patched = 0;
const jsonFiles = fs
  .readdirSync(DATA)
  .filter((f) => f.startsWith("listening-ielts-cam") && f.endsWith(".json"));

for (const file of jsonFiles) {
  const m = file.match(/cam(\d+)-test(\d+)/i);
  if (!m) continue;
  const book = Number(m[1]);
  const test = Number(m[2]);
  const full = path.join(DATA, file);
  const j = JSON.parse(fs.readFileSync(full, "utf8"));
  let changed = false;

  for (const p of j.parts || []) {
    const n = p.partNumber ?? 1;
    const partRel = `/catalog/listening/ielts-cam${book}-test${test}/part${n}.mp3`;
    const partAbs = path.join(PUB, `ielts-cam${book}-test${test}`, `part${n}.mp3`);
    if (fs.existsSync(partAbs) && fs.statSync(partAbs).size > 20_000) {
      if (p.audioUrl !== partRel) {
        p.audioUrl = partRel;
        changed = true;
      }
      if (p.audioStartPct != null || p.audioEndPct != null) {
        delete p.audioStartPct;
        delete p.audioEndPct;
        changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(full, JSON.stringify(j, null, 2) + "\n");
    patched += 1;
  }
}

// Coverage report
const missing = [];
for (let book = 9; book <= 20; book++) {
  for (let test = 1; test <= 4; test++) {
    for (let part = 1; part <= 4; part++) {
      const f = path.join(PUB, `ielts-cam${book}-test${test}`, `part${part}.mp3`);
      if (!fs.existsSync(f) || fs.statSync(f).size < 20_000) {
        missing.push(`cam${book}-t${test}-p${part}`);
      }
    }
  }
}

console.log(
  JSON.stringify(
    {
      mapped: map.size,
      copiedPub,
      copiedTai,
      patchedJson: patched,
      missingCount: missing.length,
      missingSample: missing.slice(0, 25),
    },
    null,
    2,
  ),
);
