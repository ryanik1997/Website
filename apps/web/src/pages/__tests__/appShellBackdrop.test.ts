import { describe, expect, it } from 'vitest'
import { getAppShellBackdropMode } from '../appShellBackdrop'

describe('app shell backdrop routes', () => {
  it('shows grid and three-ribbon mode on the expected roots', () => {
    expect(getAppShellBackdropMode('/app/admin')).toBe('ribbon')
    expect(getAppShellBackdropMode('/app/home')).toBe('ribbon')
    expect(getAppShellBackdropMode('/app/exam/track/cambridge/c2/reading')).toBe('ribbon')
  })

  it('keeps vocabulary and writing study routes grid-only', () => {
    expect(getAppShellBackdropMode('/app/vocab')).toBe('grid')
    expect(getAppShellBackdropMode('/app/writing/practice/task2')).toBe('grid')
  })

  it('does not add a backdrop to unlisted exam players', () => {
    expect(getAppShellBackdropMode('/app/exam/listening/example')).toBe('none')
  })
})
