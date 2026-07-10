/**
 * Chuẩn hóa JSON Listening sau import — 1 pipeline cho Wizard, ZIP, Dexie cũ.
 * Không phụ thuộc template từng đề (Cam9–20).
 */
import type { ListeningExam, ListeningPart } from './listeningExamData'
import type { ListeningImportPartJson } from './importListeningUtils'
import type { ListeningNotePassageBlock } from './listeningExamData'
import {
  atomizeNotePassageBlocks,
  gapLeadRenderedInPassage,
  gapTrailRenderedInPassage,
  repairFormPassageInlineBlocks,
  repairGapTrailBullets,
  repairNewBulletLinesAfterGap,
} from './listeningNotePassage'

const VALID_LAYOUTS = new Set(['list', 'table', 'form', 'lecture'])

type NoteBlock = NonNullable<ListeningImportPartJson['notePassage']>[number]

function titleKey(text: string | undefined): string {
  return (text ?? '').trim().toLowerCase()
}

/** Mọi notePassage / section blocks — tách dòng, gộp form, thêm bullet thiếu. */
export function repairNotePassageBlocks(
  blocks: NoteBlock[] | undefined,
): NoteBlock[] | undefined {
  if (!blocks?.length) return blocks
  return repairNewBulletLinesAfterGap(
    repairGapTrailBullets(
      atomizeNotePassageBlocks(repairFormPassageInlineBlocks(blocks)),
    ),
  )
}

function hasExampleBlock(blocks: NoteBlock[]): boolean {
  return blocks.some(
    b => b.type === 'example'
      || (b.type === 'static' && (b.text ?? '').trim().toLowerCase().startsWith('example')),
  )
}

function hasFormLabelLine(blocks: NoteBlock[]): boolean {
  return blocks.some(
    b => b.type === 'static' && /^[A-Z][A-Za-z '&/-]{0,40}:\s*$/.test((b.text ?? '').trim().replace(/^[•●‣▪◦○·*+–−\-►▸]\s*/, '')),
  )
}

function inferNotePassageLayout(part: ListeningImportPartJson): ListeningImportPartJson['notePassageLayout'] {
  if (part.notePassageLayout && VALID_LAYOUTS.has(part.notePassageLayout)) {
    return part.notePassageLayout
  }
  if (part.noteTables?.length || part.noteTable) return 'table'
  const blocks = part.notePassage ?? []
  if (part.partNumber === 1 && (hasExampleBlock(blocks) || hasFormLabelLine(blocks))) {
    return 'form'
  }
  if (part.partNumber === 4 && blocks.length) {
    const hasSections = blocks.some(b => b.type === 'section')
    const hasStructuredBullets = blocks.filter(
      b => b.type === 'static' && /^[•●‣▪◦○·*+–−\-►▸]/.test((b.text ?? '').trim()),
    ).length >= 3
    if (hasSections && !hasStructuredBullets && !hasExampleBlock(blocks)) {
      return 'lecture'
    }
  }
  return undefined
}

/** sectionTitle === passageTitle trên mọi câu → tiêu đề lặp (mọi Part). */
function repairDuplicatePassageTitles(part: ListeningImportPartJson): ListeningImportPartJson {
  const passageKey = titleKey(part.passageTitle)
  if (!passageKey || !part.questions?.length) return part

  let changed = false
  const questions = part.questions.map(q => {
    if (titleKey(q.sectionTitle) === passageKey) {
      changed = true
      const { sectionTitle: _removed, ...rest } = q
      return rest
    }
    return q
  })

  return changed ? { ...part, questions } : part
}

/**
 * MC (hoặc matching không phải map/diagram) trước notes/bảng:
 * bỏ sectionTitle khỏi MC; chỉ gắn title cho nhóm notes nếu noteTables.title khác passageTitle.
 */
function repairMcBeforeNotesSectionTitles(part: ListeningImportPartJson): ListeningImportPartJson {
  if (!part.questions?.length) return part

  const sorted = [...part.questions].sort((a, b) => a.number - b.number)
  const firstNotesIdx = sorted.findIndex(q =>
    q.type === 'gap-fill'
    && !q.mapLabel
    && !q.diagramLabel
    && !q.flowChart,
  )
  if (firstNotesIdx <= 0) return part

  const firstNotes = sorted[firstNotesIdx]
  const mcBefore = sorted.slice(0, firstNotesIdx).filter(
    q => q.type === 'multiple-choice' || (q.type === 'matching' && !q.mapLabel && !q.diagramLabel && !q.flowChart),
  )
  if (!mcBefore.length) return part

  const tableTitle = part.noteTables?.find(t => t.title?.trim())?.title
  const notesTitle = firstNotes.sectionTitle ?? tableTitle
  const notesTitleKey = titleKey(notesTitle)
  const passageKey = titleKey(part.passageTitle)
  const shouldSetNotesTitle = Boolean(
    notesTitle
    && notesTitleKey !== passageKey
    && !firstNotes.sectionTitle,
  )

  let changed = false
  const stripNumbers = new Set(mcBefore.map(q => q.number))
  const questions = part.questions.map(q => {
    if (stripNumbers.has(q.number) && q.sectionTitle) {
      changed = true
      const { sectionTitle: _removed, ...rest } = q
      return rest
    }
    if (q.number === firstNotes.number && shouldSetNotesTitle) {
      changed = true
      return { ...q, sectionTitle: notesTitle }
    }
    return q
  })

  return changed ? { ...part, questions } : part
}

function repairNotePassageSections(
  sections: ListeningImportPartJson['notePassageSections'],
): ListeningImportPartJson['notePassageSections'] {
  if (!sections?.length) return sections
  return sections.map(section => ({
    ...section,
    blocks: repairNotePassageBlocks(section.blocks ?? []) ?? [],
  }))
}

function examHasHeading(examText: string, heading: string): boolean {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(^|[\\n\\r])\\s*${escaped}\\s*($|[\\n\\r])`, 'i').test(examText)
}

function hasSection(blocks: NoteBlock[], name: string): boolean {
  const want = name.trim().toLowerCase()
  return blocks.some(
    b => b.type === 'section' && (b.text ?? '').trim().toLowerCase() === want,
  )
}

function hasStaticFragment(blocks: NoteBlock[], fragment: string): boolean {
  const want = fragment.trim().toLowerCase()
  return blocks.some(
    b => b.type === 'static' && (b.text ?? '').toLowerCase().includes(want),
  )
}

function insertBefore(blocks: NoteBlock[], index: number, items: NoteBlock[]): NoteBlock[] {
  if (index < 0) return blocks
  return [...blocks.slice(0, index), ...items, ...blocks.slice(index)]
}

/** Cam10 Test3 Leadership lecture — không áp dụng cho Ocean Biodiversity / đề P4 khác. */
function isLeadershipLectureP4(part: ListeningImportPartJson, examText: string): boolean {
  const blocks = part.notePassage ?? []
  const passage = (part.passageTitle ?? '').toLowerCase()
  if (passage.includes('leadership') || passage.includes('leader')) return true
  if (examHasHeading(examText, 'Leaders') || examHasHeading(examText, 'Conclusion')) return true
  return hasStaticFragment(blocks, 'leadership behaviour')
    || hasStaticFragment(blocks, 'transactional leaders')
    || hasStaticFragment(blocks, 'promotion focus is good')
    || hasStaticFragment(blocks, 'prevention focus is good')
}

/** P4 Leaders/Conclusion — chỉ đề Leadership (Cam10 T3), không inject gap 39/40 cho mọi P4. */
function repairP4LectureSections(
  part: ListeningImportPartJson,
  examText = '',
): ListeningImportPartJson {
  if (part.partNumber !== 4 || !part.notePassage?.length) return part

  let blocks = [...part.notePassage]
  const leadershipExam = isLeadershipLectureP4(part, examText)
  const needsLeaders = !hasSection(blocks, 'Leaders')
    && (examHasHeading(examText, 'Leaders') || hasStaticFragment(blocks, 'leadership behaviour'))
  const needsConclusion = !hasSection(blocks, 'Conclusion')
    && (examHasHeading(examText, 'Conclusion')
      || hasStaticFragment(blocks, 'promotion focus is good for jobs requiring'))

  if (needsLeaders) {
    const idx = blocks.findIndex(
      b => (b.type === 'static' && (b.text ?? '').toLowerCase().includes('leadership behaviour'))
        || (b.type === 'gap' && b.number === 36),
    )
    if (idx >= 0) {
      const inserts: NoteBlock[] = []
      if (!hasStaticFragment(blocks, 'prevention focus: people think')) {
        inserts.push({
          type: 'static',
          text: "• Prevention Focus: People think about their 'ought' self and their obligations",
        })
      }
      inserts.push({ type: 'section', text: 'Leaders' })
      blocks = insertBefore(blocks, idx, inserts)
    }
  }

  if (leadershipExam && !hasStaticFragment(blocks, 'inspire promotion focus in followers')) {
    const transactionalIdx = blocks.findIndex(
      b => b.type === 'static' && (b.text ?? '').toLowerCase().includes('transactional leaders'),
    )
    if (transactionalIdx > 0) {
      const prev = blocks[transactionalIdx - 1]
      const prevPrev = blocks[transactionalIdx - 2]
      const followsGap38 = (prev.type === 'gap' && prev.number === 38)
        || (prev.type === 'static' && prevPrev?.type === 'gap' && prevPrev.number === 38)
      if (followsGap38) {
        blocks = insertBefore(blocks, transactionalIdx, [
          { type: 'static', text: '• inspire promotion focus in followers' },
        ])
      }
    }
  }

  if (leadershipExam) {
    const gap39Idx = blocks.findIndex(b => b.type === 'gap' && b.number === 39)
    if (gap39Idx >= 0) {
      const inserts: NoteBlock[] = []
      if (!hasStaticFragment(blocks, 'emphasise the results of a mistake')) {
        inserts.push({ type: 'static', text: '• emphasise the results of a mistake' })
      }
      if (!hasStaticFragment(blocks, 'inspire prevention focus in followers')) {
        inserts.push({ type: 'static', text: '• inspire prevention focus in followers' })
      }
      if (inserts.length) {
        let insertAt = gap39Idx + 1
        while (
          insertAt < blocks.length
          && blocks[insertAt].type === 'static'
          && !(blocks[insertAt].text ?? '').toLowerCase().includes('emphasise the results')
          && !(blocks[insertAt].text ?? '').toLowerCase().includes('inspire prevention')
          && !(blocks[insertAt].text ?? '').toLowerCase().includes('promotion focus is good')
        ) {
          insertAt += 1
        }
        blocks = insertBefore(blocks, insertAt, inserts)
      }
    }
  }

  if (needsConclusion) {
    const idx = blocks.findIndex(
      b => b.type === 'static'
        && (b.text ?? '').toLowerCase().includes('promotion focus is good for jobs requiring'),
    )
    if (idx >= 0) {
      blocks = insertBefore(blocks, idx, [{ type: 'section', text: 'Conclusion' }])
    }
  }

  if (leadershipExam) {
    const gap40Idx = blocks.findIndex(b => b.type === 'gap' && b.number === 40)
    if (gap40Idx >= 0) {
      const tail: NoteBlock[] = []
      if (!hasStaticFragment(blocks, 'prevention focus is good for work such as a surgeon')) {
        tail.push({
          type: 'static',
          text: '• Prevention Focus is good for work such as a surgeon',
        })
      }
      if (!hasStaticFragment(blocks, "leaders' actions affect which focus people use")) {
        tail.push({
          type: 'static',
          text: "• Leaders' actions affect which focus people use",
        })
      }
      if (tail.length) blocks = [...blocks, ...tail]
    }
  }

  return { ...part, notePassage: repairNotePassageBlocks(blocks) }
}

/** Bỏ gapLead/gapTrail trùng static trong notePassage (vd. Cam11 T1 Q1 "Room – seats 100"). */
function stripRedundantGapLeadTrail(part: ListeningImportPartJson): ListeningImportPartJson {
  if (!part.notePassage?.length || !part.questions?.length) return part

  const blocks = part.notePassage as ListeningNotePassageBlock[]
  const gapIndexByNumber = new Map<number, number>()
  blocks.forEach((block, index) => {
    if (block.type === 'gap' && block.number != null) {
      gapIndexByNumber.set(block.number, index)
    }
  })

  let changed = false
  const questions = part.questions.map(q => {
    const gapIndex = gapIndexByNumber.get(q.number)
    if (gapIndex == null) return q

    let next = q
    if (q.gapTrail && gapTrailRenderedInPassage(blocks, gapIndex, q.gapTrail)) {
      const { gapTrail: _removed, ...rest } = next
      next = rest
      changed = true
    }
    if (q.gapLead && gapLeadRenderedInPassage(blocks, gapIndex, q.gapLead)) {
      const { gapLead: _removed, ...rest } = next
      next = rest
      changed = true
    }
    return next
  })

  return changed ? { ...part, questions } : part
}

/**
 * KET/PET Part gap-fill: DeepSeek hay nhét cả form vào `instruction`
 * (có "Day: (6)" + questions[].prompt "Day:") → UI double.
 * Tách intro + tiêu đề form; bỏ dòng gap (N); giữ dòng tĩnh "Name: Tigers".
 */
export function stripEmbeddedGapFormFromInstruction(
  part: ListeningImportPartJson,
): ListeningImportPartJson {
  const qs = part.questions ?? []
  if (!qs.length || !qs.every(q => q.type === 'gap-fill')) return part
  const raw = part.instruction ?? ''
  if (!raw.includes('\n') && !/\(\d{1,2}\)/.test(raw)) return part

  const promptBases = qs.map(q =>
    q.prompt
      .trim()
      .toLowerCase()
      .replace(/\s*\(\d{1,2}\)\s*$/g, '')
      .replace(/:+\s*$/g, '')
      .trim(),
  )

  const isGapFormLine = (line: string): boolean => {
    const t = line.trim()
    if (!t) return false
    if (/\(\d{1,2}\)/.test(t)) return true
    const lower = t.toLowerCase()
    return promptBases.some(base => {
      if (!base) return false
      return (
        lower === base
        || lower.startsWith(`${base}:`)
        || lower.startsWith(`${base} `)
      )
    })
  }

  const isStaticFilledLine = (line: string): boolean => {
    // "Name of other team: Tigers" — có ":" và không có (N)
    const t = line.trim()
    if (!t.includes(':') || /\(\d{1,2}\)/.test(t)) return false
    const lower = t.toLowerCase()
    // không trùng label gap
    if (promptBases.some(b => lower.startsWith(`${b}:`))) return false
    const after = t.split(':').slice(1).join(':').trim()
    return after.length > 0
  }

  const lines = raw.split(/\n/)
  const intro: string[] = []
  const staticRows: string[] = []
  let formStarted = false
  let formTitle: string | undefined

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) {
      if (!formStarted) intro.push('')
      continue
    }

    if (isGapFormLine(line)) {
      formStarted = true
      continue
    }
    if (isStaticFilledLine(line)) {
      formStarted = true
      staticRows.push(line)
      continue
    }

    // Tiêu đề form ngắn sau intro (vd. "Hockey match")
    if (
      !formStarted
      && intro.some(l => l.trim())
      && !line.includes(':')
      && line.length <= 48
      && !/you will hear/i.test(line)
    ) {
      formTitle = line
      formStarted = true
      continue
    }

    if (!formStarted) {
      intro.push(line)
    }
  }

  // Fallback: nếu instruction chỉ là form (không intro rõ) — giữ dòng đầu làm intro nếu là "You will hear"
  let instruction = intro.join('\n').replace(/\n{3,}/g, '\n\n').trim()
  if (!instruction && raw.trim()) {
    const first = raw.split(/\n+/).map(l => l.trim()).find(Boolean) ?? ''
    if (/you will hear/i.test(first)) instruction = first
  }

  // Ghép dòng tĩnh vào instruction (hiện 1 lần, không double với gap)
  if (staticRows.length) {
    const block = staticRows.join('\n')
    instruction = instruction ? `${instruction}\n\n${block}` : block
  }

  const questions = qs.map(q => {
    let prompt = q.prompt.trim()
    prompt = prompt.replace(/\s*\(\d{1,2}\)\s*$/g, '').trim()
    // Chuẩn "Day:" 
    if (prompt && !prompt.endsWith(':') && !prompt.endsWith('…') && !prompt.endsWith('...')) {
      // giữ "Dates of jobs: 15th June – 20th …" có sẵn dấu :
      if (!prompt.includes(':')) prompt = `${prompt}:`
    }
    return { ...q, prompt }
  })

  return {
    ...part,
    instruction: instruction || part.instruction,
    passageTitle: part.passageTitle?.trim() || formTitle,
    questions,
  }
}

/**
 * Pipeline chuẩn — IELTS notes + Cambridge KET/PET gap form.
 */
export function normalizeListeningImportPart(
  part: ListeningImportPartJson,
  options?: { examText?: string; examType?: string },
): ListeningImportPartJson {
  const examType = options?.examType ?? 'ielts'
  let next: ListeningImportPartJson = { ...part }

  if (!next.audioFile) {
    next.audioFile = 'listening.mp3'
  }

  // Cambridge KET/PET: form trong instruction
  if (examType === 'ket' || examType === 'pet') {
    next = stripEmbeddedGapFormFromInstruction(next)
    return next
  }

  if (examType !== 'ielts') return next

  if (next.notePassageLayout && !VALID_LAYOUTS.has(next.notePassageLayout)) {
    delete next.notePassageLayout
  }

  if ('noteTable' in next && next.noteTable == null) {
    delete next.noteTable
  }

  const layout = inferNotePassageLayout(next)
  if (layout) {
    next.notePassageLayout = layout
  }

  if (next.passageTitle && next.notePassageSections?.[0] && !next.notePassageSections[0].title) {
    next.notePassageSections = [
      { ...next.notePassageSections[0], title: next.passageTitle },
      ...next.notePassageSections.slice(1),
    ]
  }

  next = repairDuplicatePassageTitles(next)
  next = repairMcBeforeNotesSectionTitles(next)
  next = stripRedundantGapLeadTrail(next)

  if (next.notePassage?.length) {
    next.notePassage = repairNotePassageBlocks(next.notePassage)
  }

  if (next.notePassageSections?.length) {
    next.notePassageSections = repairNotePassageSections(next.notePassageSections)
  }

  if (next.partNumber === 4 && next.notePassage?.length) {
    next = repairP4LectureSections(next, options?.examText ?? '')
  }

  return next
}

export function normalizeListeningImportPayload(
  payload: { examType: string; parts: ListeningImportPartJson[] },
  options?: { examTextByPart?: Record<number, string> },
): { examType: string; parts: ListeningImportPartJson[] } {
  return {
    ...payload,
    parts: payload.parts.map(part =>
      normalizeListeningImportPart(part, {
        examType: payload.examType,
        examText: options?.examTextByPart?.[part.partNumber],
      }),
    ),
  }
}

/** Áp dụng khi load đề đã lưu Dexie — không cần import lại. */
export function normalizeListeningExamForDisplay(exam: ListeningExam): ListeningExam {
  // Import / publish Cambridge + IELTS đều cần strip form double
  const parts = exam.parts.map(part => {
    const asJson = part as unknown as ListeningImportPartJson
    const normalized = normalizeListeningImportPart(asJson, { examType: exam.examType })
    return {
      ...part,
      instruction: normalized.instruction ?? part.instruction,
      passageTitle: normalized.passageTitle ?? part.passageTitle,
      questions: part.questions.map((q, i) => {
        const nq = normalized.questions?.[i]
        if (!nq) return q
        return {
          ...q,
          prompt: nq.prompt ?? q.prompt,
          gapLead: nq.gapLead ?? q.gapLead,
          gapTrail: nq.gapTrail ?? q.gapTrail,
        }
      }),
      notePassage: (normalized as ListeningPart).notePassage ?? part.notePassage,
      notePassageLayout: (normalized as ListeningPart).notePassageLayout ?? part.notePassageLayout,
      noteTable: (normalized as ListeningPart).noteTable ?? part.noteTable,
      noteTables: (normalized as ListeningPart).noteTables ?? part.noteTables,
      notePassageSections: (normalized as ListeningPart).notePassageSections ?? part.notePassageSections,
    } as ListeningPart
  })

  return { ...exam, parts }
}