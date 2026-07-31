import fs from 'node:fs'
import { compileExam } from '../../scripts/reading/pet-b1/compile/compile-exam.mjs'
const bp = (await import('../../scripts/reading/pet-b1/blueprints/test-43.mjs')).default
const exam = compileExam(bp)
const p3 = exam.body.parts[2].passage.map(b => b.text).join(' ')
const p4 = exam.body.parts[3].passage.filter(b => b.text && !b.label).map(b => b.text).join(' ')
// find the overlapping fragment context
for (const frag of ['pile of chewed cones showed where a squirrel had', 'the detour became a regular stop on later walks']) {
  console.log('FRAG:', frag)
  const i3 = p3.indexOf(frag.split(' ').slice(0,4).join(' '))
  const i4 = p4.indexOf(frag.split(' ').slice(0,4).join(' '))
  console.log('  P3 ctx:', i3 >= 0 ? '...' + p3.slice(Math.max(0,i3-70), i3+90) + '...' : 'not found')
  console.log('  P4 ctx:', i4 >= 0 ? '...' + p4.slice(Math.max(0,i4-70), i4+90) + '...' : 'not found')
}
