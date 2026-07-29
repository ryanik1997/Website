#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { TMP_ROOT, TestSchema, readJson } from './cambridge-writing-runtime.mjs'
import { contentHash } from './cambridge-writing-ai-provider.mjs'
const count = text => String(text).trim().split(/\s+/).filter(Boolean).length
const additions = {
  'c2-test-07': 'The debate therefore concerns not only individual choices but also the institutions that make those choices easier or harder to sustain.',
  'c2-test-08': 'That distinction matters because public decisions often distribute opportunity long before people can see the consequences.',
  'c2-test-10': 'A responsible account must therefore consider both the immediate experience and the wider structures that shape it.',
  'c2-test-11': 'The question is consequently practical as well as philosophical, since different arrangements produce different forms of trust.'
}
for (const [id, addition] of Object.entries(additions)) {
  const file = path.join(TMP_ROOT, 'cambridge-writing-staging', id.slice(0, 2), `${id}.json`)
  const test = TestSchema.parse(await readJson(file))
  for (const block of test.tasks[0].promptBlocks.filter(block => block.type === 'source-text')) if (count(block.text) < 110) block.text = `${block.text.trim()} ${addition}`
  test.provenance.contentHash = ''
  test.provenance.contentHash = contentHash(test)
  await fs.writeFile(file, `${JSON.stringify(TestSchema.parse(test), null, 2)}\n`)
}
console.log('Extended short C2 source texts deterministically and rehashed them.')
