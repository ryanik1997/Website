const fs = require('fs');
const path = require('path');
const tidDir = 'D:/App-English-Ryan/Website/apps/web/src/features/exam/tidIeltsReading/data';
const catDir = 'D:/App-English-Ryan/Website/packages/catalog/data';
const pubDir = 'D:/App-English-Ryan/Website/apps/web/public/catalog/reading';

function mapType(t) {
  t = String(t || '').toLowerCase();
  if (t.includes('true-false')) return 'true-false-not-given';
  if (t.includes('yes-no')) return 'yes-no-not-given';
  if (t.includes('heading')) return 'matching-headings';
  if (t.includes('feature') || t.includes('info') || t.includes('match')) return 'matching-features';
  if (t.includes('summary')) return 'summary-completion';
  if (t.includes('sentence-completion') || t.includes('note') || t.includes('table') || t.includes('gap')) return 'gap-fill';
  if (t.includes('multiple')) return 'multiple-choice';
  if (t.includes('short')) return 'gap-fill';
  return 'gap-fill';
}

function optMap(opts) {
  return (opts || []).map((o, i) => {
    if (typeof o === 'string') return { id: String.fromCharCode(65 + i), label: o };
    return { id: String(o.id || String.fromCharCode(65 + i)), label: String(o.label || o.text || '') };
  });
}

let n = 0;
for (const f of fs.readdirSync(tidDir).filter((x) => x.startsWith('reading-cam-'))) {
  const tid = JSON.parse(fs.readFileSync(path.join(tidDir, f), 'utf8'));
  const m = f.match(/cam-(\d+)-(\d+)/);
  if (!m) continue;
  const book = m[1];
  const test = m[2];
  const examId = `catalog-cam-${book}-${test}-reading`;
  const out = {
    id: examId,
    title: `Cambridge ${book} Test ${test}`,
    durationMinutes: tid.durationMinutes || 60,
    bandHint: `Cam ${book} Test ${test}`,
    examTrack: 'ielts',
    catalogSlug: `ielts-cam${book}-test${test}`,
    catalogBase: `ielts-cam${book}-test${test}`,
    parts: tid.parts.map((p) => {
      const partId = `${examId}-part-${p.partNumber}`;
      return {
        id: partId,
        partNumber: p.partNumber,
        rangeLabel: p.rangeLabel || '',
        passageTitle: p.passageTitle || '',
        passage: p.passage || [],
        passageHtml: p.passageHtml || undefined,
        questionGroups: (p.questionGroups || []).map((g, gi) => ({
          id: `${partId}-g${gi}`,
          range: g.range || '',
          instruction: g.instruction || '',
          type: mapType(g.type),
          blockHtml: g.blockHtml,
          blockType: g.blockType,
          blockTitle: g.blockTitle,
          groupHtml: g.groupHtml,
          selectMode: g.selectMode,
          listOptions: g.listOptions,
          noteContent: g.noteContent,
          questions: (g.questions || []).map((q) => ({
            id: `${partId}-q${q.number}`,
            number: q.number,
            type: mapType(q.type),
            prompt: q.prompt || '',
            options: optMap(q.options),
            answer: q.answer || '',
            explanation: q.explanation || '',
            answerConfidence: 'key',
            questionHtml: q.questionHtml,
          })),
        })),
      };
    }),
  };
  const catName = `reading-ielts-cam${book}-test${test}.json`;
  fs.writeFileSync(path.join(catDir, catName), JSON.stringify(out, null, 2));
  const pubSlug = `ielts-cam${book}-test${test}`;
  const pubPath = path.join(pubDir, pubSlug);
  if (fs.existsSync(pubPath) && fs.statSync(pubPath).isDirectory()) {
    fs.writeFileSync(path.join(pubPath, 'exam.json'), JSON.stringify(out, null, 2));
  }
  n++;
}
console.log('wrote', n, 'catalog files');
