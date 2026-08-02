import fs from 'node:fs';

const meta = JSON.parse(fs.readFileSync('packages/catalog/data/catalog-reading-meta.json', 'utf8'));
const manifest = JSON.parse(fs.readFileSync('packages/catalog/data/manifest.json', 'utf8'));

function toRows(m) {
  if (Array.isArray(m)) return m;
  if (m && Array.isArray(m.exams)) return m.exams;
  if (m && Array.isArray(m.entries)) return m.entries;
  const keys = Object.keys(m);
  // find the first array-ish value
  for (const k of keys) {
    if (Array.isArray(m[k])) return m[k];
  }
  return [];
}

const metaRows = toRows(meta);
const manRows = toRows(manifest);

function classify(id, title = '') {
  const hay = `${id} ${title}`.toLowerCase();
  if (/ket/.test(hay)) return 'KET-A2';
  if (/pet/.test(hay)) return 'PET-B1';
  if (/fce/.test(hay)) return 'FCE-B2';
  if (/cae/.test(hay)) return 'CAE-C1';
  if (/cpe/.test(hay)) return 'CPE-C2';
  if (/cam/.test(hay)) return 'IELTS';
  return 'other';
}

function summarize(rows, label) {
  const by = {};
  for (const r of rows) {
    const id = r.id || r.examId || r.slug || '';
    const title = r.title || r.name || '';
    const fam = classify(id, title);
    by[fam] = (by[fam] || 0) + 1;
  }
  console.log(`--- ${label} (${rows.length} rows) ---`);
  console.log(JSON.stringify(by, null, 2));
}

console.log('catalog-reading-meta.json top-level type:', Array.isArray(metaRows) ? 'array' : 'object');
console.log('manifest.json top-level type:', Array.isArray(manRows) ? 'array' : 'object');
summarize(metaRows, 'catalog-reading-meta.json');
summarize(manRows, 'manifest.json');