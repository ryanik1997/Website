import fs from 'node:fs/promises';

const dir = 'apps/web/public/catalog/exams/reading';
const testNums = [1, 13, 14, 15, 16, 17, 18, 19, 30, 51];
const tests = {};

for (const n of testNums) {
  const body = JSON.parse(await fs.readFile(`${dir}/catalog-reading-pet-b1-test${n}.json`, 'utf8'));
  const parts = {};
  for (let i = 0; i < body.parts.length; i++) {
    const p = body.parts[i];
    let text = '';
    if (p.passage) text += p.passage.map(b => b.text || '').join(' ');
    const qs = p.questionGroups.flatMap(g => g.questions);
    text += ' ' + qs.map(q => q.prompt || '').join(' ');
    if (p.questionGroups[0]?.features) text += ' ' + p.questionGroups[0].features.map(f => f.name || '').join(' ');
    parts[`P${i + 1}`] = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  }
  tests[n] = parts;
}

// Compute bigram Jaccard similarity
function bigrams(tokens) {
  const set = new Set();
  for (let i = 0; i < tokens.length - 1; i++) set.add(tokens[i] + ' ' + tokens[i + 1]);
  return set;
}

function jaccard(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return 0;
  let inter = 0;
  for (const item of setA) if (setB.has(item)) inter++;
  return inter / (setA.size + setB.size - inter);
}

const pairs = [];
const partNames = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];

for (let i = 0; i < testNums.length; i++) {
  for (let j = i + 1; j < testNums.length; j++) {
    const a = testNums[i], b = testNums[j];
    for (const part of partNames) {
      const bgA = bigrams(tests[a][part]);
      const bgB = bigrams(tests[b][part]);
      const score = jaccard(bgA, bgB);
      if (score > 0.02) {
        pairs.push({ a, b, part, score });
      }
    }
  }
}

pairs.sort((x, y) => y.score - x.score);
const top10 = pairs.slice(0, 10);

console.log('TOP 10 SIMILARITY PAIRS (bigram Jaccard):');
console.log('─'.repeat(70));
for (const p of top10) {
  console.log(`T${p.a} vs T${p.b} | ${p.part} | score=${p.score.toFixed(4)}`);
  // Show a sample of shared bigrams
  const bgA = bigrams(tests[p.a][p.part]);
  const bgB = bigrams(tests[p.b][p.part]);
  const shared = [...bgA].filter(x => bgB.has(x)).slice(0, 5);
  console.log(`  shared bigrams: ${shared.join(' | ')}`);
}
