import { describe, expect, it, afterEach } from 'vitest'
import { render, cleanup, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ReadingPart } from '../examData'
import PetRwDragMatch from '../petRw/PetRwDragMatch'
import { optionBankFromPassage } from '../petRw/petRwPassageUtils'

afterEach(cleanup)

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../../../../..')

/**
 * §3 MANDATORY component tests for the PET B1 Part 2 compact drop-zone.
 *
 * Design under test (see session_summary.md — Task: PET B1 Reading Part 2
 * redesign): full-width drop zones; empty state shows the question number;
 * filled state shows the option title bold + full description inline + a ×
 * remove button. No ellipsis, no compact chips.
 *
 *   A. Compact selected answer  — filled gap shows title + description inline + remove button
 *   B. Remove                   — × clears the gap and frees the option
 *   C. Unique assignment        — an option can only occupy one gap at a time
 *   D. Navigation persistence   — a persisted answers record re-renders the selection
 *   E. Legacy fallback          — options without an explicit title still render
 *   F. Runtime field            — every catalog Part 2 option splits into title + full body
 */

/* ── Fixtures ───────────────────────────────────────────────── */

function makeSlots(count: number, startNum: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `q-${startNum + i}`,
    number: startNum + i,
    type: 'multiple-choice' as const,
    prompt: `Person ${startNum + i} wants a suitable activity.`,
    options: [],
    answer: '',
    explanation: '',
  }))
}

function makeBank(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const letter = String.fromCharCode(65 + i)
    return {
      id: letter.toLowerCase(),
      label: `Activity ${letter}`,
      title: `Activity ${letter} short title`,
      body: `Full description for activity ${letter}. It runs weekly and suits people who want to build confidence and meet others in a relaxed, supportive setting.`,
    }
  })
}

/* ── Harness (answers lift to parent, mirrors ReadingPetRwTest) ── */

function Harness({
  slots,
  bank,
  initialAnswers = {},
}: {
  slots: ReturnType<typeof makeSlots>
  bank: ReturnType<typeof makeBank>
  initialAnswers?: Record<string, string>
}) {
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers)
  const [activeId, setActiveId] = useState<string | null>(null)
  return (
    <PetRwDragMatch
      partId="part-2"
      variant="cambridge-part-2"
      slots={slots as any}
      bank={bank as any}
      answers={answers}
      activeQuestionId={activeId}
      showBankLetters={false}
      onAnswer={(qId, val) => setAnswers(prev => ({ ...prev, [qId]: val }))}
      onSelectQuestion={setActiveId}
    />
  )
}

function assignByClick(bankIndex: number, slotIndex: number) {
  const bankCards = document.querySelectorAll('.pet-rw-drag__bank-card')
  const slots = document.querySelectorAll('.pet-rw-drag__slot')
  fireEvent.click(bankCards[bankIndex])
  fireEvent.click(slots[slotIndex])
}

/* jsdom needs a mocked DataTransfer for drag events */
function createDataTransfer(): DataTransfer {
  const store = new Map<string, string>()
  return {
    setData: (k: string, v: string) => { store.set(k, v) },
    getData: (k: string) => store.get(k) ?? '',
    clearData: () => store.clear(),
    setDragImage: () => {},
    dropEffect: 'move',
    effectAllowed: 'move',
    files: [] as unknown as FileList,
    items: [] as unknown as DataTransferItemList,
    types: [] as string[],
  } as unknown as DataTransfer
}

/* ── A. Compact selected answer ─────────────────────────────── */

describe('§3A — compact selected answer', () => {
  it('filled gap shows option title + full description inline and a remove button', () => {
    render(<Harness slots={makeSlots(5, 6)} bank={makeBank(8)} />)
    assignByClick(0, 0) // Option A → Q6

    const slots = document.querySelectorAll('.pet-rw-drag__slot')
    expect(slots[0].classList.contains('is-filled')).toBe(true)

    const content = slots[0].querySelector('.pet-rw-part2-selected-content')
    expect(content).toBeTruthy()

    const title = slots[0].querySelector('.pet-rw-part2-selected-title')
    expect(title?.textContent).toBe('Activity A short title')

    // Full description is shown inline (not truncated, not a separate card).
    const description = slots[0].querySelector('.pet-rw-part2-selected-description')
    expect(description?.textContent).toContain('Full description for activity A')

    // Title and description share one inline content container.
    expect(content!.contains(title)).toBe(true)
    expect(content!.contains(description)).toBe(true)

    // Remove button exists.
    const removeBtn = slots[0].querySelector('.pet-rw-part2-selected-remove')
    expect(removeBtn).toBeTruthy()
  })

  it('does not render the full description as a second bank-style card', () => {
    render(<Harness slots={makeSlots(5, 6)} bank={makeBank(8)} />)
    assignByClick(0, 0)
    const slots = document.querySelectorAll('.pet-rw-drag__slot')
    // Exactly one selected-content block, no nested bank card inside the gap.
    expect(slots[0].querySelectorAll('.pet-rw-part2-selected-content').length).toBe(1)
    expect(slots[0].querySelector('.pet-rw-drag__bank-card')).toBeFalsy()
  })
})

/* ── B. Remove ──────────────────────────────────────────────── */

describe('§3B — remove', () => {
  it('clicking × empties the gap and makes the option reusable', () => {
    render(<Harness slots={makeSlots(5, 6)} bank={makeBank(8)} />)
    assignByClick(0, 0) // Option A → Q6

    let slots = document.querySelectorAll('.pet-rw-drag__slot')
    expect(slots[0].classList.contains('is-filled')).toBe(true)

    const removeBtn = slots[0].querySelector('.pet-rw-part2-selected-remove') as HTMLElement
    fireEvent.click(removeBtn)

    slots = document.querySelectorAll('.pet-rw-drag__slot')
    expect(slots[0].classList.contains('is-filled')).toBe(false)

    // Option A is no longer used → clickable again.
    const bankCards = document.querySelectorAll('.pet-rw-drag__bank-card')
    expect(bankCards[0].classList.contains('is-used')).toBe(false)
  })
})

/* ── C. Unique assignment ───────────────────────────────────── */

describe('§3C — unique assignment', () => {
  it('dragging a filled chip to another gap moves it (never in two gaps)', () => {
    render(<Harness slots={makeSlots(5, 6)} bank={makeBank(8)} />)
    assignByClick(0, 0) // Option A → Q6

    let slots = document.querySelectorAll('.pet-rw-drag__slot')
    expect(slots[0].classList.contains('is-filled')).toBe(true)

    // Drag the filled Q6 chip onto Q7's empty slot → move, not duplicate.
    const dt = createDataTransfer()
    fireEvent.dragStart(slots[0], { dataTransfer: dt })
    fireEvent.drop(slots[1], { dataTransfer: dt })

    slots = document.querySelectorAll('.pet-rw-drag__slot')
    expect(slots[0].classList.contains('is-filled')).toBe(false) // Q6 freed
    expect(slots[1].classList.contains('is-filled')).toBe(true) // Q7 now holds A

    // Only one gap is filled across the whole part.
    const filledCount = Array.from(document.querySelectorAll('.pet-rw-drag__slot'))
      .filter(el => el.classList.contains('is-filled')).length
    expect(filledCount).toBe(1)
  })
})

/* ── D. Navigation persistence ──────────────────────────────── */

describe('§3D — navigation persistence', () => {
  it('a persisted answers record re-renders the selection after returning to the part', () => {
    // Simulates coming back to Part 2: the parent still holds { q-6: 'a' }.
    render(
      <Harness
        slots={makeSlots(5, 6)}
        bank={makeBank(8)}
        initialAnswers={{ 'q-6': 'a' }}
      />,
    )

    const slots = document.querySelectorAll('.pet-rw-drag__slot')
    expect(slots[0].classList.contains('is-filled')).toBe(true)
    expect(slots[0].querySelector('.pet-rw-part2-selected-title')?.textContent)
      .toBe('Activity A short title')
    expect(slots[0].querySelector('.pet-rw-part2-selected-description')?.textContent)
      .toContain('Full description for activity A')
  })
})

/* ── E. Legacy fallback ─────────────────────────────────────── */

describe('§3E — legacy fallback (no explicit title)', () => {
  it('renders and fills without crashing when an option has no title', () => {
    const legacyBank = [
      { id: 'a', label: 'Beckfield Market is a covered market with fresh produce every day.' },
      ...makeBank(8).slice(1),
    ]
    render(<Harness slots={makeSlots(5, 6)} bank={legacyBank as any} />)

    // No crash on render; 8 bank cards present.
    expect(document.querySelectorAll('.pet-rw-drag__bank-card').length).toBe(8)

    assignByClick(0, 0) // legacy option → Q6

    const slots = document.querySelectorAll('.pet-rw-drag__slot')
    expect(slots[0].classList.contains('is-filled')).toBe(true)
    // Falls back to the label for the visible text; still compact inline.
    expect(slots[0].textContent).toContain('Beckfield Market')
    expect(slots[0].querySelector('.pet-rw-part2-selected-remove')).toBeTruthy()
  })
})

/* ── F. Runtime field (production catalog loader) ───────────── */

describe('§3F — runtime field across catalog tests 14-24, 30, 51', () => {
  const TESTS = [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 30, 51]

  it.each(TESTS)('test %i: every Part 2 option has a title and a full body', n => {
    const catalog = JSON.parse(
      fs.readFileSync(
        path.join(ROOT, `apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${n}.json`),
        'utf8',
      ),
    ) as { parts: ReadingPart[] }

    const part2 = catalog.parts.find(p => p.partNumber === 2)!
    expect(part2).toBeTruthy()

    const bank = optionBankFromPassage(part2.passage, part2.questionGroups[0], {
      partNumber: 2,
      compact: false,
    })

    expect(bank).toHaveLength(8)
    for (const option of bank) {
      // Explicit short title recovered from the "Title — Description" split.
      expect(option.title, `test ${n} option ${option.id} title`).toBeTruthy()
      expect(option.title!.trim().length, `test ${n} option ${option.id} title non-empty`).toBeGreaterThan(0)
      // Full description still present in the option bank (not lost to the split).
      expect(option.body, `test ${n} option ${option.id} body`).toBeTruthy()
      expect(option.body!.trim().length, `test ${n} option ${option.id} body non-empty`).toBeGreaterThan(20)
      // The title must not swallow the description (split at first delimiter only).
      expect(option.title!.includes('—')).toBe(false)
    }
  })
})

/* ── §6. Asset preservation ─────────────────────────────────── */

describe('§6 — asset preservation across regeneration', () => {
  it('test 20 option A keeps imageSlotId, assetId, alt and media after regeneration', () => {
    const catalog = JSON.parse(
      fs.readFileSync(
        path.join(ROOT, 'apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test20.json'),
        'utf8',
      ),
    ) as { parts: Array<{ partNumber: number; passage: Array<Record<string, unknown>> }> }

    const part2 = catalog.parts.find(p => p.partNumber === 2)!
    const optionA = part2.passage.find(b => b.label === 'A')!

    expect(optionA.imageSlotId).toBe('pet-b1-test20-part2-option-a-image')
    expect(optionA.assetId).toBe('asset-pet-b1-test20-option-a')
    expect(optionA.alt).toBe('A heron mural painted on a brick wall beside the bus station')
    expect(optionA.media).toEqual({ kind: 'image', src: '/media/pet-b1/test20/option-a-mural.jpg' })
    // The title/description text is still intact alongside the asset fields.
    expect(String(optionA.text)).toContain('Weekend mural painting for confident beginners')
  })
})
