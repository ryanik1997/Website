/**
 * Generate schematic layout preview SVGs for IELTS Reading Wizard templates.
 *
 *   node scripts/generate-ielts-reading-wizard-previews.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(import.meta.url), '..', '..')
const OUT = join(ROOT, 'apps', 'web', 'public', 'catalog', 'ielts-wizard', 'reading')

const W = 360
const H = 480

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function tfngRow(y, n, text) {
  const boxes = ['T', 'F', 'NG'].map((b, i) => {
    const bx = 268 + i * 26
    return `<rect x="${bx}" y="${y}" width="22" height="16" rx="2" fill="#fff" stroke="#333" stroke-width="0.8"/>
      <text x="${bx + 11}" y="${y + 12}" text-anchor="middle" font-size="7" font-family="Arial,sans-serif" fill="#333">${b}</text>`
  }).join('')
  return `<text x="14" y="${y + 12}" font-size="8" font-family="Arial,sans-serif" fill="#111">${n}. ${esc(text)}</text>${boxes}`
}

function ynngRow(y, n, text) {
  const boxes = ['Y', 'N', 'NG'].map((b, i) => {
    const bx = 268 + i * 26
    return `<rect x="${bx}" y="${y}" width="22" height="16" rx="2" fill="#fff" stroke="#333" stroke-width="0.8"/>
      <text x="${bx + 11}" y="${y + 12}" text-anchor="middle" font-size="7" font-family="Arial,sans-serif" fill="#333">${b}</text>`
  }).join('')
  return `<text x="14" y="${y + 12}" font-size="8" font-family="Arial,sans-serif" fill="#111">${n}. ${esc(text)}</text>${boxes}`
}

function mcRow(y, n, text) {
  const opts = ['A', 'B', 'C', 'D'].map((o, i) => {
    const ox = 24 + i * 78
    return `<circle cx="${ox + 6}" cy="${y + 8}" r="5" fill="#fff" stroke="#333" stroke-width="0.8"/>
      <text x="${ox + 14}" y="${y + 11}" font-size="7" font-family="Arial,sans-serif" fill="#555">${o}</text>`
  }).join('')
  return `<text x="14" y="${y - 2}" font-size="8" font-weight="bold" font-family="Arial,sans-serif" fill="#111">${n}. ${esc(text)}</text>
    <g transform="translate(0,6)">${opts}</g>`
}

function gapRow(y, n, lead, trail) {
  return `<text x="14" y="${y + 10}" font-size="8" font-family="Arial,sans-serif" fill="#111">${n}. ${esc(lead)}</text>
    <rect x="${14 + lead.length * 4.2}" y="${y}" width="48" height="14" rx="2" fill="#e8f4fc" stroke="#2b6cb0" stroke-width="0.9"/>
    <text x="${14 + lead.length * 4.2 + 24}" y="${y + 10}" font-size="8" font-family="Arial,sans-serif" fill="#111">${esc(trail)}</text>`
}

function headingItem(y, id, label) {
  return `<text x="18" y="${y}" font-size="7.5" font-family="Arial,sans-serif" fill="#222"><tspan font-weight="bold">${id}</tspan>  ${esc(label)}</text>`
}

function paraMatch(y, n, text) {
  return `<text x="14" y="${y + 10}" font-size="8" font-family="Arial,sans-serif" fill="#111">${n}. ${esc(text)}</text>
    <rect x="300" y="${y}" width="22" height="14" rx="2" fill="#fff" stroke="#333" stroke-width="0.8"/>
    <text x="311" y="${y + 10}" text-anchor="middle" font-size="8" font-family="Arial,sans-serif" fill="#555">A</text>`
}

function sectionHeader(y, range, instruction) {
  return `<text x="14" y="${y}" font-size="9" font-weight="bold" font-family="Arial,sans-serif" fill="#111">${esc(range)}</text>
    <text x="14" y="${y + 12}" font-size="7" font-family="Arial,sans-serif" fill="#555">${esc(instruction)}</text>`
}

function buildSvg({ code, title, cam, body }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#fafafa"/>
  <rect x="0" y="0" width="${W}" height="42" fill="#1a365d"/>
  <text x="14" y="18" font-size="11" font-weight="bold" font-family="Arial,sans-serif" fill="#fff">${esc(title)}</text>
  <text x="14" y="32" font-size="8" font-family="Arial,sans-serif" fill="#bee3f8">${esc(code)} · ${esc(cam)}</text>
  <rect x="10" y="48" width="${W - 20}" height="${H - 58}" rx="4" fill="#fff" stroke="#ddd" stroke-width="1"/>
  ${body}
</svg>`
}

const TEMPLATES = [
  {
    file: 'p1/r1.svg',
    code: 'r1',
    title: 'READING PASSAGE 1',
    cam: 'Cam10 Test 1',
    body: () => {
      let y = 68
      const parts = [
        sectionHeader(y, 'Questions 1–6', 'TRUE / FALSE / NOT GIVEN'),
        ...['There are other flightless parrots.', 'Adults produce chicks every year.', 'Males feed nesting females.']
          .map((t, i) => { y += 22; return tfngRow(y, i + 1, t) }),
        (() => { y += 30; return sectionHeader(y, 'Questions 7–13', 'Choose A, B, C or D') })(),
        ...['When do females lay eggs?', 'Numbers before conservation?']
          .map((t, i) => { y += 28; return mcRow(y, 7 + i, t) }),
      ]
      return parts.join('\n  ')
    },
  },
  {
    file: 'p1/r1t.svg',
    code: 'r1t',
    title: 'READING PASSAGE 1',
    cam: 'Cam10 Test 1',
    body: () => {
      let y = 68
      const parts = [
        sectionHeader(y, 'Questions 1–5', 'TRUE / FALSE / NOT GIVEN'),
        tfngRow(y + 18, 1, 'Stepwells found all over the world.'),
        tfngRow(y + 40, 2, 'Stepwells had many functions.'),
        (() => { y = 148; return sectionHeader(y, 'Questions 6–8', 'Answer questions — ONE WORD ONLY') })(),
        gapRow(y + 18, 6, 'Which part provided shade? ', ''),
        gapRow(y + 40, 7, 'Climatic event in Rajasthan: ', ''),
        (() => { y = 220; return sectionHeader(y, 'Questions 9–13', 'Complete the table below') })(),
        `<rect x="14" y="${y + 14}" width="332" height="72" rx="3" fill="#f8fafc" stroke="#cbd5e0" stroke-width="0.9"/>`,
        `<text x="22" y="${y + 28}" font-size="6.5" font-weight="bold" font-family="Arial,sans-serif" fill="#111">Stepwells | Date | Features | Other notes</text>`,
        `<text x="22" y="${y + 42}" font-size="6" font-family="Arial,sans-serif" fill="#333">Rani Ki Vav | Late 11th c. | 500 sculptures…</text>`,
        `<text x="22" y="${y + 56}" font-size="6" font-family="Arial,sans-serif" fill="#333">…despite the</text>`,
        `<rect x="88" y="${y + 46}" width="22" height="12" rx="2" fill="#fff" stroke="#2b6cb0" stroke-width="0.8"/>`,
        `<text x="99" y="${y + 55}" text-anchor="middle" font-size="6" font-family="Arial,sans-serif" fill="#2b6cb0">9</text>`,
        `<text x="22" y="${y + 70}" font-size="6" font-family="Arial,sans-serif" fill="#333">Surya Kund | 1026 | Steps on the [10]…</text>`,
      ]
      return parts.join('\n  ')
    },
  },
  {
    file: 'p1/r1g.svg',
    code: 'r1g',
    title: 'READING PASSAGE 1',
    cam: 'Cam9 Test 1',
    body: () => {
      let y = 68
      const parts = [
        sectionHeader(y, 'Questions 1–7', 'TRUE / FALSE / NOT GIVEN'),
        ...['Perkin was born in 1838.', 'His first dye was purple.', 'Queen Victoria wore mauve.']
          .map((t, i) => { y += 22; return tfngRow(y, i + 1, t) }),
        (() => { y += 30; return sectionHeader(y, 'Questions 8–13', 'Complete the notes — NO MORE THAN TWO WORDS') })(),
        ...[
          ['Perkin was a student of ', ''],
          ['He discovered the dye by ', ''],
          ['The colour became known as ', ''],
        ].map(([a, b], i) => { y += 22; return gapRow(y, 8 + i, a, b) }),
      ]
      return parts.join('\n  ')
    },
  },
  {
    file: 'p1/r1h.svg',
    code: 'r1h',
    title: 'READING PASSAGE 1',
    cam: 'Cam11 Test 3',
    body: () => {
      let y = 68
      const parts = [
        sectionHeader(y, 'Questions 1–7', 'Choose heading for each paragraph A–G'),
        headingItem(y + 18, 'i', 'Financial obstacles to park projects'),
        headingItem(y + 30, 'ii', 'A shift in how cities value space'),
        headingItem(y + 42, 'iii', 'Evidence linking parks with wellbeing'),
        headingItem(y + 54, 'iv', 'Grassroots efforts to reclaim land'),
        ...['Paragraph A', 'Paragraph B', 'Paragraph C']
          .map((t, i) => { y = 148 + i * 22; return paraMatch(y, i + 1, t) }),
        (() => { y = 220; return sectionHeader(y, 'Questions 8–13', 'Choose A, B, C or D') })(),
        mcRow(248, 8, 'When do females lay eggs?'),
        mcRow(276, 9, 'What happened before conservation?'),
      ]
      return parts.join('\n  ')
    },
  },
  {
    file: 'p2/r2.svg',
    code: 'r2',
    title: 'READING PASSAGE 2',
    cam: 'Cam10 Test 1',
    body: () => {
      let y = 68
      const parts = [
        sectionHeader(y, 'Questions 14–18', 'Which paragraph contains…? NB: letter more than once'),
        ...['research problems with few large elms', 'difference of opinion on reintroduction', 'how disease was brought to Britain']
          .map((t, i) => { y += 22; return paraMatch(y, 14 + i, t) }),
        (() => { y += 30; return sectionHeader(y, 'Questions 19–23', 'Match statement with person A–C') })(),
        ...['expresses optimism', 'reports on restoration attempts']
          .map((t, i) => { y += 22; return paraMatch(y, 19 + i, t) }),
        (() => { y += 28; return sectionHeader(y, 'Questions 24–26', 'Choose A, B, C or D') })(),
        mcRow(y + 18, 24, 'What proportion of elms was lost?'),
      ]
      return parts.join('\n  ')
    },
  },
  {
    file: 'p2/r2y.svg',
    code: 'r2y',
    title: 'READING PASSAGE 2',
    cam: 'Cam10 Test 4',
    body: () => {
      let y = 68
      const parts = [
        sectionHeader(y, 'Questions 14–18', 'YES / NO / NOT GIVEN — views of the writer'),
        ...['Remote work reduces productivity.', 'Structured check-ins are preferable.', 'Full-time office will return.']
          .map((t, i) => { y += 22; return ynngRow(y, 14 + i, t) }),
        (() => { y += 28; return sectionHeader(y, 'Questions 19–22', 'Which paragraph contains…?') })(),
        paraMatch(y + 18, 19, 'reference to research problems'),
        paraMatch(y + 40, 20, 'difference of opinion'),
        (() => { y += 68; return sectionHeader(y, 'Questions 23–26', 'Match features + MC') })(),
        mcRow(y + 18, 26, 'What proportion was lost?'),
      ]
      return parts.join('\n  ')
    },
  },
  {
    file: 'p2/r2h.svg',
    code: 'r2h',
    title: 'READING PASSAGE 2',
    cam: 'Cam9 Test 1',
    body: () => {
      let y = 68
      const parts = [
        sectionHeader(y, 'Questions 14–17', 'Choose heading for paragraphs A–D'),
        headingItem(y + 16, 'i', 'How the idea of SETI began'),
        headingItem(y + 28, 'ii', 'Arguments against SETI'),
        paraMatch(y + 48, 14, 'Paragraph A'),
        paraMatch(y + 70, 15, 'Paragraph B'),
        (() => { y = 158; return sectionHeader(y, 'Questions 18–20', 'Complete sentences — TWO WORDS') })(),
        gapRow(y + 18, 18, 'SETI searches for signals from ', ''),
        gapRow(y + 40, 19, 'The project uses large ', ''),
        (() => { y = 230; return sectionHeader(y, 'Questions 21–26', 'YES / NO / NOT GIVEN') })(),
        ynngRow(y + 18, 21, 'The writer supports increased funding.'),
        ynngRow(y + 40, 22, 'Alien contact is inevitable.'),
      ]
      return parts.join('\n  ')
    },
  },
  {
    file: 'p3/r3.svg',
    code: 'r3',
    title: 'READING PASSAGE 3',
    cam: 'Cam10 Test 1',
    body: () => {
      let y = 68
      const parts = [
        sectionHeader(y, 'Questions 27–32', 'TRUE / FALSE / NOT GIVEN'),
        ...['Scientists fully explained sleep and memory.', 'Slow-wave sleep strengthens connections.', 'REM sleep aids factual recall.']
          .map((t, i) => { y += 22; return tfngRow(y, 27 + i, t) }),
        (() => { y += 28; return sectionHeader(y, 'Questions 33–40', 'Choose A, B, C or D') })(),
        mcRow(y + 18, 33, 'Purpose of the first paragraph?'),
        mcRow(y + 46, 34, 'During slow-wave sleep the brain…'),
      ]
      return parts.join('\n  ')
    },
  },
  {
    file: 'p3/r3f.svg',
    code: 'r3f',
    title: 'READING PASSAGE 3',
    cam: 'Cam9 Test 1',
    body: () => {
      let y = 68
      const parts = [
        sectionHeader(y, 'Questions 27–30', 'Complete summary — TWO WORDS'),
        gapRow(y + 18, 27, 'Sleep is linked to ', ''),
        gapRow(y + 40, 28, 'Brain replays experiences from the ', ''),
        (() => { y = 148; return sectionHeader(y, 'Questions 31–33', 'TRUE / FALSE / NOT GIVEN') })(),
        tfngRow(y + 18, 31, 'All researchers agree on lab experiments.'),
        (() => { y = 200; return sectionHeader(y, 'Questions 34–39', 'Complete flow-chart — choose from box A–G') })(),
        headingItem(y + 16, 'A', 'slow-wave sleep'),
        headingItem(y + 28, 'B', 'REM sleep'),
        paraMatch(y + 48, 34, 'Stage 1 → ___'),
        paraMatch(y + 70, 35, 'Stage 2 → ___'),
        (() => { y = 290; return sectionHeader(y, 'Question 40', 'Choose A, B, C or D') })(),
        mcRow(y + 18, 40, 'Overall tone of the passage?'),
      ]
      return parts.join('\n  ')
    },
  },
  {
    file: 'p3/r3y.svg',
    code: 'r3y',
    title: 'READING PASSAGE 3',
    cam: 'YNNG + MC layout',
    body: () => {
      let y = 68
      const parts = [
        sectionHeader(y, 'Questions 27–32', 'YES / NO / NOT GIVEN — views of writer'),
        ...['Writer dismisses all research.', 'Sleep after revision helps tests.', 'Cutting sleep has no effect.']
          .map((t, i) => { y += 22; return ynngRow(y, 27 + i, t) }),
        (() => { y += 28; return sectionHeader(y, 'Questions 33–40', 'Choose A, B, C or D') })(),
        mcRow(y + 18, 33, 'Purpose of the first paragraph?'),
        mcRow(y + 46, 34, 'During slow-wave sleep…'),
      ]
      return parts.join('\n  ')
    },
  },
  {
    file: 'p1/r1s.svg',
    code: 'r1s',
    title: 'READING PASSAGE 1',
    cam: 'Cam12–16 P1',
    body: () => {
      let y = 68
      const parts = [
        sectionHeader(y, 'Questions 1–8', 'Complete sentences — NO MORE THAN TWO WORDS'),
        gapRow(y + 18, 1, 'The kākāpō is a ___ parrot.', ''),
        gapRow(y + 40, 2, 'Kākāpō can live up to ___ years.', ''),
        gapRow(y + 62, 3, 'Females alone ___ the eggs.', ''),
        (() => { y = 200; return sectionHeader(y, 'Questions 9–13', 'Choose A, B, C or D') })(),
        mcRow(y + 18, 9, 'When do females lay eggs?'),
        mcRow(y + 46, 10, 'Numbers before conservation?'),
      ]
      return parts.join('\n  ')
    },
  },
  {
    file: 'p1/r1hg.svg',
    code: 'r1hg',
    title: 'READING PASSAGE 1',
    cam: 'Cam15+ P1',
    body: () => {
      let y = 68
      const parts = [
        sectionHeader(y, 'Questions 1–7', 'Choose heading for each paragraph A–G'),
        headingItem(y + 18, 'i', 'Financial obstacles to park projects'),
        headingItem(y + 30, 'ii', 'A shift in how cities value space'),
        headingItem(y + 42, 'iii', 'Evidence linking parks with wellbeing'),
        paraMatch(y + 62, 1, 'Paragraph A'),
        paraMatch(y + 84, 2, 'Paragraph B'),
        (() => { y = 200; return sectionHeader(y, 'Questions 8–13', 'Complete sentences — TWO WORDS') })(),
        gapRow(y + 18, 8, 'Planners treat parks as essential ___', ''),
        gapRow(y + 40, 9, 'Residents reported lower ___ levels.', ''),
      ]
      return parts.join('\n  ')
    },
  },
  {
    file: 'p1/r1m.svg',
    code: 'r1m',
    title: 'READING PASSAGE 1',
    cam: 'Cam12–14 P1',
    body: () => {
      let y = 68
      const parts = [
        sectionHeader(y, 'Questions 1–6', 'Complete notes — NO MORE THAN TWO WORDS'),
        gapRow(y + 18, 1, 'Type of parrot: ___', ''),
        gapRow(y + 40, 2, 'Maximum lifespan: ___ years', ''),
        gapRow(y + 62, 3, 'Diet: completely ___', ''),
        (() => { y = 200; return sectionHeader(y, 'Questions 7–13', 'Choose A, B, C or D') })(),
        mcRow(y + 18, 7, 'When do females lay eggs?'),
        mcRow(y + 46, 8, 'Numbers before conservation?'),
      ]
      return parts.join('\n  ')
    },
  },
  {
    file: 'p2/r2t.svg',
    code: 'r2t',
    title: 'READING PASSAGE 2',
    cam: 'Cam13–18 P2',
    body: () => {
      let y = 68
      const parts = [
        sectionHeader(y, 'Questions 14–18', 'TRUE / FALSE / NOT GIVEN'),
        ...['Disease was brought by beetles.', 'All elms died within a decade.', 'Reintroduction is straightforward.']
          .map((t, i) => { y += 22; return tfngRow(y, 14 + i, t) }),
        (() => { y += 28; return sectionHeader(y, 'Questions 19–22', 'Which paragraph contains…?') })(),
        paraMatch(y + 18, 19, 'research problems with few elms'),
        paraMatch(y + 40, 20, 'difference of opinion'),
        (() => { y += 68; return sectionHeader(y, 'Questions 23–26', 'Match features + MC') })(),
        mcRow(y + 18, 26, 'What proportion of elms was lost?'),
      ]
      return parts.join('\n  ')
    },
  },
  {
    file: 'p2/r2g.svg',
    code: 'r2g',
    title: 'READING PASSAGE 2',
    cam: 'Cam14–17 P2',
    body: () => {
      let y = 68
      const parts = [
        sectionHeader(y, 'Questions 14–18', 'Complete sentences — TWO WORDS'),
        gapRow(y + 18, 14, 'Around ___ million elms died.', ''),
        gapRow(y + 40, 15, 'Disease spread by ___', ''),
        gapRow(y + 62, 16, 'Trees vulnerable at ___ cm.', ''),
        (() => { y = 200; return sectionHeader(y, 'Questions 19–22', 'Which paragraph contains…?') })(),
        paraMatch(y + 18, 19, 'research problems with few elms'),
        paraMatch(y + 40, 20, 'difference of opinion'),
        (() => { y += 68; return sectionHeader(y, 'Questions 23–26', 'Choose A, B, C or D') })(),
        mcRow(y + 18, 26, 'What proportion of elms was lost?'),
      ]
      return parts.join('\n  ')
    },
  },
  {
    file: 'p2/r2s.svg',
    code: 'r2s',
    title: 'READING PASSAGE 2',
    cam: 'Cam15–19 P2',
    body: () => {
      let y = 68
      const parts = [
        sectionHeader(y, 'Questions 14–17', 'Complete summary — choose from box A–G'),
        headingItem(y + 16, 'A', 'productivity'),
        headingItem(y + 28, 'B', 'hybrid models'),
        headingItem(y + 40, 'C', 'structured check-ins'),
        paraMatch(y + 58, 14, 'Remote work exposed weak ___'),
        paraMatch(y + 80, 15, 'Marsh favours ___ over hours'),
        (() => { y = 200; return sectionHeader(y, 'Questions 18–22', 'YES / NO / NOT GIVEN') })(),
        ynngRow(y + 18, 18, 'Remote work reduces productivity.'),
        ynngRow(y + 40, 19, 'Structured check-ins are preferable.'),
        (() => { y += 68; return sectionHeader(y, 'Questions 23–26', 'Choose A, B, C or D') })(),
        mcRow(y + 18, 26, 'What proportion was lost?'),
      ]
      return parts.join('\n  ')
    },
  },
  {
    file: 'p3/r3gy.svg',
    code: 'r3gy',
    title: 'READING PASSAGE 3',
    cam: 'Cam11–18 P3',
    body: () => {
      let y = 68
      const parts = [
        sectionHeader(y, 'Questions 27–31', 'Complete sentences — TWO WORDS'),
        gapRow(y + 18, 27, 'Sleep linked to ___', ''),
        gapRow(y + 40, 28, 'Brain replays experiences from the ___', ''),
        gapRow(y + 62, 29, 'REM supports ___ solving.', ''),
        (() => { y = 200; return sectionHeader(y, 'Questions 32–36', 'YES / NO / NOT GIVEN') })(),
        ynngRow(y + 18, 32, 'Writer dismisses all research.'),
        ynngRow(y + 40, 33, 'Sleep after revision helps tests.'),
        (() => { y += 68; return sectionHeader(y, 'Questions 37–40', 'Choose A, B, C or D') })(),
        mcRow(y + 18, 37, 'Purpose of the first paragraph?'),
      ]
      return parts.join('\n  ')
    },
  },
  {
    file: 'p3/r3sm.svg',
    code: 'r3sm',
    title: 'READING PASSAGE 3',
    cam: 'Cam10 Test 2',
    body: () => {
      let y = 68
      const parts = [
        sectionHeader(y, 'Questions 27–31', 'Complete summary — phrases A–L'),
        `<rect x="14" y="${y + 18}" width="332" height="108" rx="3" fill="#f8fafc" stroke="#cbd5e0" stroke-width="0.9"/>`,
        `<text x="22" y="${y + 32}" font-size="7.5" font-weight="bold" font-family="Arial,sans-serif" fill="#111">The value attached to original works of art</text>`,
        `<text x="22" y="${y + 48}" font-size="6.5" font-family="Arial,sans-serif" fill="#333">People go to museums… depended on</text>`,
        `<rect x="198" y="${y + 38}" width="34" height="12" rx="2" fill="#fff" stroke="#2b6cb0" stroke-width="0.8"/>`,
        `<text x="215" y="${y + 47}" text-anchor="middle" font-size="6" font-family="Arial,sans-serif" fill="#2b6cb0">27</text>`,
        `<text x="236" y="${y + 48}" font-size="6.5" font-family="Arial,sans-serif" fill="#333">for so long…</text>`,
        `<text x="22" y="${y + 64}" font-size="6.5" font-family="Arial,sans-serif" fill="#333">…instruct</text>`,
        `<rect x="88" y="${y + 54}" width="34" height="12" rx="2" fill="#fff" stroke="#2b6cb0" stroke-width="0.8"/>`,
        `<text x="105" y="${y + 63}" text-anchor="middle" font-size="6" font-family="Arial,sans-serif" fill="#2b6cb0">29</text>`,
        `<text x="22" y="${y + 80}" font-size="6.5" font-family="Arial,sans-serif" fill="#333">…colour and</text>`,
        `<rect x="88" y="${y + 70}" width="34" height="12" rx="2" fill="#fff" stroke="#2b6cb0" stroke-width="0.8"/>`,
        `<text x="105" y="${y + 79}" text-anchor="middle" font-size="6" font-family="Arial,sans-serif" fill="#2b6cb0">30</text>`,
        headingItem(y + 138, 'A', 'institution'),
        headingItem(y + 150, 'B', 'mass production'),
        headingItem(y + 162, 'C', 'mechanical processes'),
        (() => { y = 248; return sectionHeader(y, 'Questions 32–35', 'Choose A, B, C or D') })(),
        mcRow(y + 18, 32, 'National Gallery illustrates…'),
        mcRow(y + 46, 33, 'Viewers unwilling to criticise because…'),
        (() => { y = 340; return sectionHeader(y, 'Questions 36–40', 'YES / NO / NOT GIVEN') })(),
        ynngRow(y + 18, 36, 'Art history should use many media.'),
        ynngRow(y + 40, 37, 'Historians conflict with museums.'),
      ]
      return parts.join('\n  ')
    },
  },
  {
    file: 'p3/r3sy.svg',
    code: 'r3sy',
    title: 'READING PASSAGE 3',
    cam: 'Cam11–16 P3',
    body: () => {
      let y = 68
      const parts = [
        sectionHeader(y, 'Questions 27–31', 'Complete summary — choose from box A–G'),
        headingItem(y + 16, 'A', 'slow-wave sleep'),
        headingItem(y + 28, 'B', 'REM sleep'),
        headingItem(y + 40, 'C', 'neural connections'),
        paraMatch(y + 58, 27, 'Experiences replayed during ___'),
        paraMatch(y + 80, 28, 'Useful ___ strengthened'),
        (() => { y = 200; return sectionHeader(y, 'Questions 32–36', 'YES / NO / NOT GIVEN') })(),
        ynngRow(y + 18, 32, 'Writer dismisses all research.'),
        ynngRow(y + 40, 33, 'Sleep after revision helps tests.'),
        (() => { y += 68; return sectionHeader(y, 'Questions 37–40', 'Choose A, B, C or D') })(),
        mcRow(y + 18, 37, 'Purpose of the first paragraph?'),
      ]
      return parts.join('\n  ')
    },
  },
  {
    file: 'p3/r3gt.svg',
    code: 'r3gt',
    title: 'READING PASSAGE 3',
    cam: 'Cam10–14 P3',
    body: () => {
      let y = 68
      const parts = [
        sectionHeader(y, 'Questions 27–31', 'Complete summary — TWO WORDS'),
        gapRow(y + 18, 27, 'Sleep is linked to ___', ''),
        gapRow(y + 40, 28, 'Brain replays experiences from the ___', ''),
        gapRow(y + 62, 29, 'REM supports ___ solving', ''),
        (() => { y = 200; return sectionHeader(y, 'Questions 32–36', 'TRUE / FALSE / NOT GIVEN') })(),
        tfngRow(y + 18, 32, 'Scientists fully explained sleep and memory.'),
        tfngRow(y + 40, 33, 'Slow-wave sleep strengthens connections.'),
        (() => { y += 68; return sectionHeader(y, 'Questions 37–40', 'Choose A, B, C or D') })(),
        mcRow(y + 18, 37, 'Purpose of the first paragraph?'),
      ]
      return parts.join('\n  ')
    },
  },
]

mkdirSync(join(OUT, 'p1'), { recursive: true })
mkdirSync(join(OUT, 'p2'), { recursive: true })
mkdirSync(join(OUT, 'p3'), { recursive: true })

for (const t of TEMPLATES) {
  const svg = buildSvg({ code: t.code, title: t.title, cam: t.cam, body: t.body() })
  const path = join(OUT, t.file)
  writeFileSync(path, svg, 'utf8')
  console.log(`✓ ${t.file}`)
}

console.log('\nDone — preview SVGs in apps/web/public/ielts-wizard/reading/')
