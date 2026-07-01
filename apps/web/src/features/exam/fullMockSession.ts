const SESSION_KEY = 'exam-full-mock-session'

export type FullMockStage = 'reading' | 'listening' | 'writing' | 'done'

export interface FullMockSkillScore {
  correct: number
  total: number
}

export interface FullMockSession {
  mockId: string
  stage: FullMockStage
  startedAt: number
  reading?: FullMockSkillScore & { answers: Record<string, string> }
  listening?: FullMockSkillScore & {
    answers: Record<string, string>
    unsure: Record<string, boolean>
  }
  writing?: {
    task1: string
    task2: string
    task1Words: number
    task2Words: number
  }
}

export function loadFullMockSession(): FullMockSession | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as FullMockSession
  } catch {
    return null
  }
}

export function saveFullMockSession(session: FullMockSession): void {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearFullMockSession(): void {
  window.localStorage.removeItem(SESSION_KEY)
}

export function startFullMockSession(mockId: string): FullMockSession {
  const session: FullMockSession = {
    mockId,
    stage: 'reading',
    startedAt: Date.now(),
  }
  saveFullMockSession(session)
  return session
}

export function patchFullMockSession(patch: Partial<FullMockSession>): FullMockSession | null {
  const current = loadFullMockSession()
  if (!current) return null
  const next = { ...current, ...patch }
  saveFullMockSession(next)
  return next
}

export function fullMockQueryParam(mockId: string): string {
  return `fullMock=${encodeURIComponent(mockId)}`
}

export function appendFullMockQuery(path: string, mockId: string): string {
  const sep = path.includes('?') ? '&' : '?'
  return `${path}${sep}${fullMockQueryParam(mockId)}`
}

export function getFullMockIdFromSearch(search: string): string | null {
  return new URLSearchParams(search).get('fullMock')
}