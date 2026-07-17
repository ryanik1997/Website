import { describe, expect, it } from 'vitest'
import { getAppShellBackdropMode } from './appShellBackdrop'

describe('getAppShellBackdropMode', () => {
  it.each([
    '/app/home',
    '/app/writing',
    '/app/listening',
    '/app/shadowing',
    '/app/exam',
    '/app/sentence-structure',
    '/app/settings',
    '/app/admin',
    '/app/exam/track/ielts',
    '/app/exam/track/ielts/listening',
    '/app/exam/track/ielts/reading',
    '/app/exam/track/cambridge',
    '/app/exam/track/cambridge/a2',
    '/app/exam/track/cambridge/a2/listening',
    '/app/exam/track/cambridge/a2/reading',
    '/app/exam/track/cambridge/b1',
    '/app/exam/track/cambridge/b1/listening',
    '/app/exam/track/cambridge/b1/reading',
    '/app/exam/track/cambridge/b2',
    '/app/exam/track/cambridge/b2/listening',
    '/app/exam/track/cambridge/b2/reading',
    '/app/exam/track/cambridge/c1',
    '/app/exam/track/cambridge/c1/listening',
    '/app/exam/track/cambridge/c1/reading',
    '/app/exam/track/cambridge/c2',
    '/app/exam/track/cambridge/c2/listening',
    '/app/exam/track/cambridge/c2/reading',
    '/app/shadowing/28EFRJaA2JQ',
    '/app/sentence-structure/catalog:ss:sample',
    '/app/sentence-structure/catalog%3Ass%3Asample',
  ])('enables the grid and ribbon backdrop on %s', pathname => {
    expect(getAppShellBackdropMode(pathname)).toBe('ribbon')
    expect(getAppShellBackdropMode(`${pathname}/`)).toBe('ribbon')
  })

  it.each([
    '/app/vocab',
    '/app/writing/translate',
    '/app/writing/translate/grammar_basic',
    '/app/writing/translate/collocation',
    '/app/writing/translate/paragraph_65',
    '/app/writing/translate/paragraph_80',
    '/app/writing/translate/essay_full',
    '/app/writing/translate/mine',
    '/app/writing/practice',
    '/app/writing/practice/task1',
    '/app/writing/practice/task2',
    '/app/writing/practice/free',
    '/app/writing/cambridge',
    '/app/writing/cambridge/a2',
    '/app/writing/cambridge/b1',
    '/app/writing/cambridge/b2',
    '/app/writing/cambridge/c1',
    '/app/writing/cambridge/c2',
    '/app/writing/dashboard',
  ])('enables the grid without ribbons on %s', pathname => {
    expect(getAppShellBackdropMode(pathname)).toBe('grid')
    expect(getAppShellBackdropMode(`${pathname}/`)).toBe('grid')
  })

  it.each([
    '/app/reading-corner',
    '/app/reading-corner/bao',
    '/app/exam/reading/exam-1',
    '/app/exam/listening/exam-1',
    '/app/exam/track/ielts/writing',
    '/app/exam/track/cambridge/a1',
    '/app/exam/track/cambridge/c2/writing',
    '/app/shadowing/video-1/transcript',
    '/app/writing/practice/task3',
    '/app/writing/cambridge/a1',
    '/app/writing/translate/unknown',
    '/app/sentence-structure/item-1',
  ])('does not cover focused or independently designed route %s', pathname => {
    expect(getAppShellBackdropMode(pathname)).toBe('none')
  })
})
