#!/usr/bin/env node
// Snapshot protection for Batch 5 — hash everything OUTSIDE scope so we can
// verify at the end that we didn't touch it.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const ROOT = 'D:/App-English-Ryan/Website';

function sha(path) {
  if (!existsSync(`${ROOT}/${path}`)) return null;
  return createHash('sha256').update(readFileSync(`${ROOT}/${path}`)).digest('hex');
}

const snapshot = { timestamp: new Date().toISOString(), files: {} };

// 1. Tests 31-35 (Batch 4 — finalized, must not change)
for (let t = 31; t <= 35; t++) {
  snapshot.files[`packages/catalog/data/reading-pet-b1-test${t}.json`] = sha(`packages/catalog/data/reading-pet-b1-test${t}.json`);
  snapshot.files[`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${t}.json`] = sha(`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${t}.json`);
  snapshot.files[`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${t}.answers.json`] = sha(`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${t}.answers.json`);
  snapshot.files[`scripts/reading/pet-b1/blueprints/test-${t}.mjs`] = sha(`scripts/reading/pet-b1/blueprints/test-${t}.mjs`);
}

// 2. Tests 41-51 (future batches — should not exist / must not be created)
for (let t = 41; t <= 51; t++) {
  snapshot.files[`packages/catalog/data/reading-pet-b1-test${t}.json`] = sha(`packages/catalog/data/reading-pet-b1-test${t}.json`);
  snapshot.files[`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${t}.json`] = sha(`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${t}.json`);
  snapshot.files[`scripts/reading/pet-b1/blueprints/test-${t}.mjs`] = sha(`scripts/reading/pet-b1/blueprints/test-${t}.mjs`);
}

// 3. Test 14 (assetId change — dirty but must not be overwritten)
snapshot.files[`packages/catalog/data/reading-pet-b1-test14.json`] = sha(`packages/catalog/data/reading-pet-b1-test14.json`);
snapshot.files[`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test14.json`] = sha(`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test14.json`);
snapshot.files[`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test14.answers.json`] = sha(`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test14.answers.json`);
snapshot.files[`scripts/reading/pet-b1/blueprints/test-14.mjs`] = sha(`scripts/reading/pet-b1/blueprints/test-14.mjs`);

// 4. Tests 20-30 (previous batches — finalized)
for (let t = 20; t <= 30; t++) {
  snapshot.files[`packages/catalog/data/reading-pet-b1-test${t}.json`] = sha(`packages/catalog/data/reading-pet-b1-test${t}.json`);
  snapshot.files[`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${t}.json`] = sha(`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${t}.json`);
  snapshot.files[`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${t}.answers.json`] = sha(`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${t}.answers.json`);
  snapshot.files[`scripts/reading/pet-b1/blueprints/test-${t}.mjs`] = sha(`scripts/reading/pet-b1/blueprints/test-${t}.mjs`);
}

// 5. Tests 1-19 (legacy / golden)
for (let t = 1; t <= 19; t++) {
  snapshot.files[`packages/catalog/data/reading-pet-b1-test${t}.json`] = sha(`packages/catalog/data/reading-pet-b1-test${t}.json`);
  snapshot.files[`scripts/reading/pet-b1/blueprints/test-${t}.mjs`] = sha(`scripts/reading/pet-b1/blueprints/test-${t}.mjs`);
}

// 6. FCE/KET/Listening/Writing/Theme — sample of out-of-scope dirty files
const outOfScope = [
  'apps/web/src/features/writing/WritingEditor.tsx',
  'apps/web/src/features/writing/WritingTopicPanel.tsx',
  'apps/web/src/features/writing/writingStore.ts',
  'apps/web/src/styles/globals.css',
  'packages/catalog/src/generatedFceListening.ts',
  'packages/catalog/src/generatedKetReading.ts',
  'packages/catalog/src/generatedPetListening.ts',
  'scripts/reading/convert-fce-b2-pages-to-parts.mjs',
  'scripts/reading/fce-b2-pages-to-parts.mjs',
  'CLAUDE.md',
  '.claude/launch.json',
  'session_summary.md',
];
for (const f of outOfScope) snapshot.files[f] = sha(f);

// 7. Part 2 media fields + IDs for Tests 36-40 (must be preserved across regen)
const part2Snapshot = {};
for (let t = 36; t <= 40; t++) {
  const pkgPath = `packages/catalog/data/reading-pet-b1-test${t}.json`;
  if (existsSync(`${ROOT}/${pkgPath}`)) {
    const pkg = JSON.parse(readFileSync(`${ROOT}/${pkgPath}`, 'utf8'));
    const part2 = pkg.parts?.find(p => p.partNumber === 2);
    if (part2) {
      part2Snapshot[t] = {
        optionCount: part2.options?.length,
        profileCount: part2.profiles?.length,
        mediaFields: (part2.options || []).map(o => ({
          key: o.key, imageSlotId: o.imageSlotId, assetId: o.assetId, alt: o.alt,
          title: o.title, descLen: o.description?.length,
        })),
      };
    }
  }
}
snapshot.part2Media = part2Snapshot;

writeFileSync(`${ROOT}/tmp/pet-b1-batch5-protection-snapshot.json`, JSON.stringify(snapshot, null, 2));
const nullCount = Object.values(snapshot.files).filter(v => v === null).length;
console.log(`Snapshot written: ${Object.keys(snapshot.files).length} files hashed (${nullCount} missing/null), Part 2 media captured for tests: ${Object.keys(part2Snapshot).join(',')}`);
