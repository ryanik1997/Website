import fs from 'node:fs/promises';
import path from 'node:path';
const ROOT = 'd:/App-English-Ryan/Website';
const tests = [15,16,17,18,19];
const issues = [];
for (const n of tests) {
  const id = `catalog-reading-pet-b1-test${n}`;
  const bodyPath = path.join(ROOT, `apps/web/public/catalog/exams/reading/${id}.json`);
  const vaultPath = path.join(ROOT, `apps/web/public/catalog/exams/reading/${id}.answers.json`);
  const pkgPath = path.join(ROOT, `packages/catalog/data/reading-pet-b1-test${n}.json`);
  const body = JSON.parse(await fs.readFile(bodyPath, 'utf8'));
  const vault = JSON.parse(await fs.readFile(vaultPath, 'utf8'));
  const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
  // 6 parts
  if (body.parts.length !== 6) issues.push(`T${n}: parts=${body.parts.length} expected 6`);
  // 32 questions
  const qs = body.parts.flatMap(p => p.questionGroups.flatMap(g => g.questions));
  if (qs.length !== 32) issues.push(`T${n}: questions=${qs.length} expected 32`);
  // 32 answers
  const ansKeys = Object.keys(vault.answers);
  if (ansKeys.length !== 32) issues.push(`T${n}: answers=${ansKeys.length} expected 32`);
  // runtime JSON matches package JSON
  if (JSON.stringify(body) !== JSON.stringify(pkg)) issues.push(`T${n}: runtime JSON != package JSON`);
  // answer vault maps to correct semantic keys
  for (const q of qs) {
    const key = q.id;
    if (!vault.answers[key]) issues.push(`T${n}: missing answer for ${key}`);
  }
  // no duplicate IDs
  const ids = qs.map(q => q.id);
  if (new Set(ids).size !== ids.length) issues.push(`T${n}: duplicate question IDs`);
  // Part option counts (matching golden sample Test 14 structure)
  const optCounts = body.parts.map(p => p.questionGroups[0]?.questions[0]?.options?.length ?? 0);
  const expected = [4, 0, 4, 0, 4, 0];
  for (let i = 0; i < 6; i++) {
    if (optCounts[i] !== expected[i]) issues.push(`T${n} P${i+1}: options=${optCounts[i]} expected ${expected[i]}`);
  }
  // Part 2 and 4 use features (8 each)
  for (const pi of [1, 3]) {
    const featCount = body.parts[pi].questionGroups[0]?.features?.length ?? 0;
    if (featCount !== 8) issues.push(`T${n} P${pi+1}: features=${featCount} expected 8`);
  }
}
if (issues.length) { console.log('RUNTIME CONTRACT FAIL:'); issues.forEach(i => console.log('  ' + i)); process.exit(1); }
else console.log('RUNTIME CONTRACT PASS: 5 tests, 6 parts, 32 questions, 32 answers, no duplicates, runtime==package');
