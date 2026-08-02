import { describe, expect, it } from 'vitest'
import { lookupPart1Questions, getAllPart1BankTopics, type Part1QuestionBankEntry } from './part1QuestionBank'

const practiceBankTopics = [
  'Hometown', 'Family', 'Friends', 'Neighbours', 'Childhood', 'Pets',
  'Work or Study', 'Education', 'Languages', 'Reading', 'Newspapers',
  'Hobbies', 'Music', 'Sport', 'Films', 'Television', 'Art', 'Photography',
  'Technology', 'Social Media', 'Robots', 'Emails', 'Food', 'Health',
  'Morning routine', 'Exercise', 'Sleep',
]

describe('Part 1 Question Bank', () => {
  it('covers all 27 Practice Bank Part 1 topics', () => {
    for (const topic of practiceBankTopics) {
      const entry = lookupPart1Questions(topic)
      expect(entry, `Missing question bank entry for topic: ${topic}`).toBeDefined()
    }
  })

  it('provides 3-5 questions per topic', () => {
    for (const topic of practiceBankTopics) {
      const entry = lookupPart1Questions(topic)
      expect(entry!.questions.length).toBeGreaterThanOrEqual(3)
      expect(entry!.questions.length).toBeLessThanOrEqual(5)
    }
  })

  it('provides hints and sampleAnswerStructure per topic', () => {
    for (const topic of practiceBankTopics) {
      const entry = lookupPart1Questions(topic)
      expect(entry!.hints.length).toBeGreaterThan(0)
      expect(entry!.sampleAnswerStructure.length).toBeGreaterThan(0)
    }
  })

  it('resolves aliases for Forecast and Roulette topic names', () => {
    expect(lookupPart1Questions('Where you live now')?.topic).toBe('Hometown')
    expect(lookupPart1Questions('Work / Study')?.topic).toBe('Work or Study')
    expect(lookupPart1Questions('Pets and animals')?.topic).toBe('Pets')
    expect(lookupPart1Questions('ANIMALS')?.topic).toBe('Pets')
    expect(lookupPart1Questions('HOMETOWN')?.topic).toBe('Hometown')
    expect(lookupPart1Questions('FAMILY')?.topic).toBe('Family')
    expect(lookupPart1Questions('SOCIAL MEDIA')?.topic).toBe('Social Media')
    expect(lookupPart1Questions('Free time activities')?.topic).toBe('Hobbies')
    expect(lookupPart1Questions('Team sport')?.topic).toBe('Sport')
    expect(lookupPart1Questions('Morning Routine')?.topic).toBe('Morning routine')
    expect(lookupPart1Questions('MORNINGS')?.topic).toBe('Morning routine')
    expect(lookupPart1Questions('ROUTINE')?.topic).toBe('Morning routine')
    expect(lookupPart1Questions('NEWS')?.topic).toBe('Newspapers')
    expect(lookupPart1Questions('WEATHER')?.topic).toBe('Weather')
    expect(lookupPart1Questions('COFFEE & TEA')?.topic).toBe('Coffee & Tea')
    expect(lookupPart1Questions('PHONES')?.topic).toBe('Phones')
    expect(lookupPart1Questions('CLOTHES')?.topic).toBe('Clothes')
    expect(lookupPart1Questions('NAMES')?.topic).toBe('Names')
    expect(lookupPart1Questions('NOISE')?.topic).toBe('Noise')
    expect(lookupPart1Questions('Reading carefully')?.topic).toBe('Reading')
    expect(lookupPart1Questions('ART')?.topic).toBe('Art')
    expect(lookupPart1Questions('Drawing')?.topic).toBe('Art')
    expect(lookupPart1Questions('SPORT')?.topic).toBe('Sport')
    expect(lookupPart1Questions('LANGUAGES')?.topic).toBe('Languages')
  })

  it('returns undefined for unknown topics', () => {
    expect(lookupPart1Questions('Nonexistent Topic')).toBeUndefined()
  })

  it('getAllPart1BankTopics returns a non-empty array', () => {
    const all = getAllPart1BankTopics()
    expect(all.length).toBeGreaterThan(27)
  })
})
