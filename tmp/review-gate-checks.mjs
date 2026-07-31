import fs from 'node:fs/promises';
const tests = [15,16,17,18,19];
const issues = [];
for (const n of tests) {
  const body = JSON.parse(await fs.readFile('apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test'+n+'.json','utf8'));
  const vault = JSON.parse(await fs.readFile('apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test'+n+'.answers.json','utf8'));
  // Part 1: check stem uniqueness + word count
  const p1q = body.parts[0].questionGroups[0].questions;
  const stems = p1q.map(q=>q.prompt);
  const stemSet = new Set(stems);
  if (stemSet.size !== stems.length) issues.push(`T${n} P1: duplicate stems`);
  const p1texts = body.parts[0].passage.map(b=>b.text.split('\n')[1]||b.text);
  for (let i=0;i<p1texts.length;i++) {
    const wc = p1texts[i].trim().split(/\s+/).length;
    if (wc < 25 || wc > 70) issues.push(`T${n} P1 card${i+1}: word count ${wc} outside 25-70`);
  }
  // Part 1: check opening phrase repetition (>8 words)
  const openings = p1texts.map(t=>t.trim().split(/\s+/).slice(0,9).join(' '));
  for (let i=0;i<openings.length;i++) for (let j=i+1;j<openings.length;j++) {
    if (openings[i] === openings[j]) issues.push(`T${n} P1: repeated opening phrase cards ${i+1},${j+1}`);
  }
  // Part 2: check 5 unique answers
  const p2answers = [6,7,8,9,10].map(qn=>vault.answers[`catalog-reading-pet-b1-test${n}-part-2-q${qn}`]?.answer);
  if (new Set(p2answers).size !== 5) issues.push(`T${n} P2: duplicate answers ${p2answers.join(',')}`);
  // Part 3: word count 300-450 (passage + buildExtension)
  const p3text = body.parts[2].passage.map(b=>b.text).join(' ');
  const p3wc = p3text.trim().split(/\s+/).length;
  if (p3wc < 300 || p3wc > 500) issues.push(`T${n} P3: word count ${p3wc} outside 300-500`);
  // Part 4: 5 paragraphs with gaps
  const p4paras = body.parts[3].passage.filter(b=>b.text && !b.label);
  if (p4paras.length !== 5) issues.push(`T${n} P4: paragraphs != 5`);
  for (let i=0;i<p4paras.length;i++) {
    if (!p4paras[i].text.includes(`(${16+i}) .....`)) issues.push(`T${n} P4: missing gap marker ${16+i} in para ${i+1}`);
  }
  // Part 5: check markers 21-26
  const p5text = body.parts[4].passage[0].text;
  for (let m=21;m<=26;m++) if (!p5text.includes(`(${m}) .....`)) issues.push(`T${n} P5: missing marker ${m}`);
  // Part 6: check markers 27-32
  const p6text = body.parts[5].passage[0].text;
  for (let m=27;m<=32;m++) if (!p6text.includes(`(${m}) ........`)) issues.push(`T${n} P6: missing marker ${m}`);
  // Part 6: answers are single lowercase words
  for (let m=27;m<=32;m++) {
    const a = vault.answers[`catalog-reading-pet-b1-test${n}-part-6-q${m}`]?.answer;
    if (!a || a !== a.toLowerCase() || a.includes(' ') || a.length < 1) issues.push(`T${n} P6 q${m}: invalid answer [${a}]`);
  }
}
if (issues.length) { console.log('ISSUES FOUND:'); issues.forEach(i=>console.log('  '+i)); process.exit(1); }
else console.log('ALL CONTENT CHECKS PASS');
