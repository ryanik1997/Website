/**
 * Copy map/diagram/extra images from Tainguyen IELTS Listening → public catalog
 * and patch catalog JSON (partImageUrl + letter options for mapLabel).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC =
  process.env.IELTS_LISTENING_TAINGUYEN ||
  "D:\\App-English-Ryan\\Tainguyen\\IELTS\\Listening";
const PUB = path.join(ROOT, "apps/web/public/catalog/listening");
const DATA = path.join(ROOT, "packages/catalog/data");

const IMG_RE = /\.(jpe?g|png|webp|gif)$/i;

function letterOptions(from, to) {
  const a = from.charCodeAt(0);
  const b = to.charCodeAt(0);
  const out = [];
  for (let c = a; c <= b; c++) {
    const id = String.fromCharCode(c);
    out.push({ id, label: id });
  }
  return out;
}

function inferLetters(questions, instruction) {
  const text = [instruction, questions[0]?.sectionInstruction]
    .filter(Boolean)
    .join(" ");
  const m = text.match(/\b([A-I])\s*[–\-−]\s*([A-I])\b/i);
  if (m) return letterOptions(m[1].toUpperCase(), m[2].toUpperCase());
  const codes = questions
    .map((q) => String(q.answer || "").trim().toUpperCase())
    .filter((a) => /^[A-I]$/.test(a))
    .map((a) => a.charCodeAt(0));
  if (codes.length) {
    const end = Math.max(...codes, "H".charCodeAt(0));
    return letterOptions("A", String.fromCharCode(end));
  }
  return letterOptions("A", "H");
}

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

let copied = 0;
let patchedJson = 0;
const report = [];

for (const dirent of fs.readdirSync(SRC, { withFileTypes: true })) {
  if (!dirent.isDirectory()) continue;
  const m = dirent.name.match(/Test(\d+)_Cam(\d+)/i);
  if (!m) continue;
  const test = Number(m[1]);
  const book = Number(m[2]);
  const srcDir = path.join(SRC, dirent.name);
  const destDir = path.join(PUB, `ielts-cam${book}-test${test}`);
  ensureDir(destDir);

  // Chỉ map.jpg / diagram.jpg (và tên tương tự) — bỏ hẳn Questions_*.jpg
  const images = fs
    .readdirSync(srcDir)
    .filter((f) => IMG_RE.test(f))
    .filter((f) => !/^Questions/i.test(f));
  for (const img of images) {
    const from = path.join(srcDir, img);
    const safeName = img.replace(/\s+/g, "_");
    const to = path.join(destDir, safeName);
    copyFile(from, to);
    copied += 1;
    report.push(
      `IMG ${dirent.name}/${img} → ielts-cam${book}-test${test}/${safeName}`,
    );
  }

  // Prefer map.jpg / diagram.jpg as partImageUrl on map/diagram parts
  const dataFile = path.join(DATA, `listening-ielts-cam${book}-test${test}.json`);
  if (!fs.existsSync(dataFile)) continue;

  const j = JSON.parse(fs.readFileSync(dataFile, "utf8"));
  let changed = false;

  for (const part of j.parts || []) {
    const mapQs = (part.questions || []).filter((q) => q.mapLabel);
    const diagQs = (part.questions || []).filter((q) => q.diagramLabel);
    const needsImage = mapQs.length > 0 || diagQs.length > 0;

    if (needsImage) {
      // pick image: map.jpg preferred for map, diagram.jpg for diagram, else first jpg
      let imageName = null;
      if (mapQs.length && images.some((i) => /^map\./i.test(i))) {
        imageName = images.find((i) => /^map\./i.test(i));
      } else if (diagQs.length && images.some((i) => /diagram/i.test(i))) {
        imageName = images.find((i) => /diagram/i.test(i));
      }
      // Không gán Questions_*.jpg làm partImageUrl
      if (imageName) {
        const safeName = imageName.replace(/\s+/g, "_");
        const url = `/catalog/listening/ielts-cam${book}-test${test}/${safeName}`;
        if (part.partImageUrl !== url) {
          part.partImageUrl = url;
          changed = true;
        }
      } else if (
        part.partImageUrl &&
        /Questions[_ ]/i.test(part.partImageUrl)
      ) {
        delete part.partImageUrl;
        changed = true;
      }
    }

    const patchGroup = (qs) => {
      if (!qs.length) return;
      const opts = inferLetters(qs, part.instruction);
      for (const q of qs) {
        if (!q.options?.length) {
          q.options = opts;
          changed = true;
        }
      }
    };
    patchGroup(mapQs);
    patchGroup(diagQs);
  }

  if (changed) {
    fs.writeFileSync(dataFile, JSON.stringify(j, null, 2) + "\n");
    patchedJson += 1;
    report.push(`JSON patched listening-ielts-cam${book}-test${test}.json`);
  }
}

console.log(
  JSON.stringify(
    { copied, patchedJson, samples: report.slice(0, 40), totalLines: report.length },
    null,
    2,
  ),
);
