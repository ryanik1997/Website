import { execSync } from 'child_process';
import fs from 'fs';

// Get production version of catalog-reading-meta.json
const prodMetaJson = execSync('git show 92583dd0:packages/catalog/data/catalog-reading-meta.json', { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
const prodMeta = JSON.parse(prodMetaJson);
const prodMetaExams = Array.isArray(prodMeta) ? prodMeta : (prodMeta.readingExams || prodMeta.exams || prodMeta.reading || []);
const prodPetIds = prodMetaExams.filter(e => (e.id||'').includes('pet-b1')).map(e => e.id);

console.log('=== PRODUCTION (commit 92583dd0) ===');
console.log('PET B1 count:', prodPetIds.length);
console.log('IDs:', prodPetIds.join(', '));

// Current version
const curMeta = JSON.parse(fs.readFileSync('packages/catalog/data/catalog-reading-meta.json', 'utf8'));
const curMetaExams = Array.isArray(curMeta) ? curMeta : (curMeta.readingExams || curMeta.exams || curMeta.reading || []);
const curPetIds = curMetaExams.filter(e => (e.id||'').includes('pet-b1')).map(e => e.id);

console.log('\n=== CURRENT (working tree) ===');
console.log('PET B1 count:', curPetIds.length);
console.log('IDs:', curPetIds.join(', '));

// Differences
const inCurNotProd = curPetIds.filter(id => !prodPetIds.includes(id));
const inProdNotCur = prodPetIds.filter(id => !curPetIds.includes(id));
console.log('\n=== DIFFERENCES ===');
console.log('In CURRENT not PRODUCTION (' + inCurNotProd.length + '):', inCurNotProd.join(', '));
console.log('In PRODUCTION not CURRENT (' + inProdNotCur.length + '):', inProdNotCur.join(', '));

// Also check total reading exam counts
console.log('\n=== TOTAL READING COUNTS ===');
console.log('Production total reading exams:', prodMetaExams.length);
console.log('Current total reading exams:', curMetaExams.length);

// Check by level
const levels = ['ket-a2', 'pet-b1', 'fce-b2', 'cae-c1', 'cpe-c2', 'ielts'];
console.log('\n=== BY LEVEL ===');
for (const level of levels) {
  const prodCount = prodMetaExams.filter(e => (e.id||'').includes(level)).length;
  const curCount = curMetaExams.filter(e => (e.id||'').includes(level)).length;
  console.log(`${level}: prod=${prodCount} current=${curCount} diff=${curCount - prodCount}`);
}