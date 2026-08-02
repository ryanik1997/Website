import { describe, expect, it } from 'vitest'
import { answerSession, completeSession, createSpeakingSession, nextSessionItem, sessionSummary } from './speakingIeltsSession'
describe('IELTS session lifecycle', () => { const items = [{ id: 'a', part: 1 as const, topic: 'Home', prompt: 'Where do you live?' }, { id: 'b', part: 2 as const, topic: 'Gift', prompt: 'Describe a gift' }]; it('tracks answered items and does not duplicate attempts', () => { let s = createSpeakingSession(items, 'test'); s = answerSession(s, { itemId: 'a', transcript: 'answer', durationSec: 4 }); s = answerSession(s, { itemId: 'a', transcript: 'replacement' }); expect(sessionSummary(s)).toMatchObject({ totalQuestions: 2, answeredQuestions: 1, durationSec: 4, averageBand: null }) }) })

describe('IELTS multi-part navigation', () => {
  const items = [{ id: 'p1', part: 1 as const, topic: 'Home', prompt: 'Home?' }, { id: 'p2', part: 2 as const, topic: 'Gift', prompt: 'Gift?' }, { id: 'p3', part: 3 as const, topic: 'Society', prompt: 'Why?' }]
  it('moves through all three parts and marks the session complete only explicitly', () => {
    let session = createSpeakingSession(items, 'all-parts')
    session = nextSessionItem(nextSessionItem(session))
    expect(session.items[session.currentIndex].part).toBe(3)
    expect(session.completedAt).toBeUndefined()
    expect(completeSession(session).completedAt).toBeTruthy()
  })
})
