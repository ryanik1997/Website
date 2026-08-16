import fs from 'fs';
import path from 'path';

// 1. Metadata IDs from catalog-reading-meta.json
const metaPath = 'packages/catalog/data/catalog-reading-meta.json';
const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
const metaExams = Array.isArray(meta) ? meta : (meta.readingExams || meta.exams || meta.reading || []);
const metaIds = metaExams.filter(e => (e.id||'').includes('pet-b1')).map(e => e.id);
console.log('META PET B1 IDs (' + metaIds.length + '):');
metaIds.forEach(id => console.log('  ' + id));

// 2. Manifest IDs from manifest.json
const manifestPath = 'packages/catalog/data/manifest.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const manifestReading = manifest.reading || manifest.exams || (Array.isArray(manifest) ? manifest : []);
const manifestIds = manifestReading.filter(e => (e.id||'').includes('pet-b1')).map(e => e.id);
console.log('\nMANIFEST PET B1 IDs (' + manifestIds.length + '):');
manifestIds.forEach(id => console.log('  ' + id));

// 3. Runtime body IDs from apps/web/public/catalog/exams/reading/
const bodyDir = 'apps/web/public/catalog/exams/reading';
const bodyFiles = fs.existsSync(bodyDir) ? fs.readdirSync(bodyDir).filter(f => f.includes('pet-b1') && f.endsWith('.json') && !f.endsWith('.answers.json')) : [];
const bodyIds = bodyFiles.map(f => f.replace('.json', ''));
console.log('\nBODY PET B1 IDs (' + bodyIds.length + '):');
bodyIds.forEach(id => console.log('  ' + id));

// 4. Answer vault IDs
const vaultFiles = fs.existsSync(bodyDir) ? fs.readdirSync(bodyDir).filter(f => f.includes('pet-b1') && f.endsWith('.answers.json')) : [];
const vaultIds = vaultFiles.map(f => f.replace('.answers.json', ''));
console.log('\nVAULT PET B1 IDs (' + vaultIds.length + '):');
vaultIds.forEach(id => console.log('  ' + id));

// 5. Package source IDs
const pkgDir = 'packages/catalog/data';
const pkgFiles = fs.readdirSync(pkgDir).filter(f => f.startsWith('reading-pet-b1-test') && f.endsWith('.json'));
const pkgIds = pkgFiles.map(f => f.replace('.json', '').replace('reading-', 'catalog-'));
console.log('\nPACKAGE SOURCE PET B1 IDs (' + pkgIds.length + '):');
pkgIds.forEach(id => console.log('  ' + id));

// 6. Differences
const allIds = new Set([...metaIds, ...manifestIds, ...bodyIds, ...pkgIds]);
console.log('\n=== DIFFERENCES ===');
console.log('Total unique IDs:', allIds.size);

const inMetaNotManifest = metaIds.filter(id => !manifestIds.includes(id));
const inManifestNotMeta = manifestIds.filter(id => !metaIds.includes(id));
const inMetaNotBody = metaIds.filter(id => !bodyIds.includes(id));
const inBodyNotMeta = bodyIds.filter(id => !metaIds.includes(id));
const inMetaNotVault = metaIds.filter(id => !vaultIds.includes(id));
const inPkgNotMeta = pkgIds.filter(id => !metaIds.includes(id));
const inMetaNotPkg = metaIds.filter(id => !pkgIds.includes(id));

console.log('In META not MANIFEST:', inMetaNotManifest);
console.log('In MANIFEST not META:', inManifestNotMeta);
console.log('In META not BODY:', inMetaNotBody);
console.log('In BODY not META:', inBodyNotMeta);
console.log('In META not VAULT:', inMetaNotVault);
console.log('In PKG not META:', inPkgNotMeta);
console.log('In META not PKG:', inMetaNotPkg);

// 7. Full sorted list
const sortedAll = [...allIds].sort((a, b) => {
  const na = parseInt(a.match(/test(\d+)/)?.[1] || '0');
  const nb = parseInt(b.match(/test(\d+)/)?.[1] || '0');
  return na - nb;
});
console.log('\n=== ALL UNIQUE PET B1 IDs (sorted) ===');
sortedAll.forEach(id => {
  const inM = metaIds.includes(id) ? 'Y' : 'N';
  const inMan = manifestIds.includes(id) ? 'Y' : 'N';
  const inB = bodyIds.includes(id) ? 'Y' : 'N';
  const inV = vaultIds.includes(id) ? 'Y' : 'N';
  const inP = pkgIds.includes(id) ? 'Y' : 'N';
  console.log(`  ${id}  meta=${inM} manifest=${inMan} body=${inB} vault=${inV} pkg=${inP}`);
});