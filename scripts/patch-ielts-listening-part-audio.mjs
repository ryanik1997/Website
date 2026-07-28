/**
 * Patch IELTS listening catalog JSON so each part has its own audioUrl.
 * Prefer local part{N}.mp3; else full listening.mp3 + startPct/endPct segments (equal quarters).
 * Also probes TID R2 CDN and downloads missing part files when available.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import https from "node:https";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "packages/catalog/data");
const PUB = path.join(ROOT, "apps/web/public/catalog/listening");
const R2 = "https://pub-c71988294a9b45099e83dad66bb73426.r2.dev/ielts-listening";

function headOk(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: "HEAD", timeout: 8000 }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          file.close();
          fs.unlink(dest, () => {});
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        res.pipe(file);
        file.on("finish", () => file.close(() => resolve()));
      })
      .on("error", (err) => {
        file.close();
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

function parseSlug(filename) {
  const m = filename.match(/listening-ielts-cam(\d+)-test(\d+)\.json$/i);
  if (!m) return null;
  return { book: Number(m[1]), test: Number(m[2]) };
}

let patched = 0;
let downloaded = 0;

const files = fs
  .readdirSync(DATA)
  .filter((f) => f.startsWith("listening-ielts-cam") && f.endsWith(".json"));

for (const file of files) {
  const parsed = parseSlug(file);
  if (!parsed) continue;
  const { book, test } = parsed;
  const dir = path.join(PUB, `ielts-cam${book}-test${test}`);
  fs.mkdirSync(dir, { recursive: true });

  const fullPath = path.join(dir, "listening.mp3");
  const hasFull = fs.existsSync(fullPath) && fs.statSync(fullPath).size > 50_000;

  // Ensure part files: local or R2
  for (let part = 1; part <= 4; part++) {
    const partFile = path.join(dir, `part${part}.mp3`);
    if (fs.existsSync(partFile) && fs.statSync(partFile).size > 50_000) continue;
    const r2 = `${R2}/cam${book}/Test${test}Part${part}_1.mp3`;
    // eslint-disable-next-line no-await-in-loop
    const ok = await headOk(r2);
    if (!ok) continue;
    try {
      // eslint-disable-next-line no-await-in-loop
      await download(r2, partFile);
      if (fs.statSync(partFile).size > 50_000) {
        downloaded += 1;
        console.log("DL", `cam${book}-t${test}-p${part}`);
      }
    } catch (e) {
      console.warn("fail DL", r2, e.message);
    }
  }

  const j = JSON.parse(fs.readFileSync(path.join(DATA, file), "utf8"));
  let changed = false;
  const parts = Array.isArray(j.parts) ? j.parts : [];
  const partCount = Math.max(parts.length, 1);

  for (const p of parts) {
    const n = p.partNumber ?? 1;
    const partRel = `/catalog/listening/ielts-cam${book}-test${test}/part${n}.mp3`;
    const fullRel = `/catalog/listening/ielts-cam${book}-test${test}/listening.mp3`;
    const partAbs = path.join(dir, `part${n}.mp3`);
    const hasPart = fs.existsSync(partAbs) && fs.statSync(partAbs).size > 50_000;

    if (hasPart) {
      if (p.audioUrl !== partRel) {
        p.audioUrl = partRel;
        changed = true;
      }
      if (p.audioStartPct != null || p.audioEndPct != null) {
        delete p.audioStartPct;
        delete p.audioEndPct;
        changed = true;
      }
    } else if (hasFull) {
      // Fallback: full file + equal quarter segments (best-effort without per-part assets)
      if (p.audioUrl !== fullRel) {
        p.audioUrl = fullRel;
        changed = true;
      }
      const start = Math.round(((n - 1) / partCount) * 1000) / 10;
      const end = Math.round((n / partCount) * 1000) / 10;
      if (p.audioStartPct !== start || p.audioEndPct !== end) {
        p.audioStartPct = start;
        p.audioEndPct = end;
        changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(path.join(DATA, file), JSON.stringify(j, null, 2) + "\n");
    patched += 1;
    console.log("PATCH", file);
  }
}

console.log(JSON.stringify({ patched, downloaded }, null, 2));
