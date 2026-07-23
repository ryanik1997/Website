import { describe, expect, it } from 'vitest'
import {
  isProtectedMediaPath,
  mustUseSignedMedia,
  toStorageObjectPath,
} from './protectedMedia'

describe('protected media security paths', () => {
  it('always signs cloud-only Listening publish media in local development', () => {
    expect(mustUseSignedMedia('catalog/listening-publish/exam-36/part1-audio.mp3'))
      .toBe(true)
    expect(mustUseSignedMedia('catalog/listening/ket-a2-test1/part1.mp3'))
      .toBe(false)
  })

  it('always signs private exam answer vaults in local development', () => {
    expect(mustUseSignedMedia('catalog/exams/listening/listening-import-ket-a2-practice-12.answers.json'))
      .toBe(true)
    expect(mustUseSignedMedia('catalog/exams/reading/catalog-cam-9-1-reading.answers.json'))
      .toBe(true)
  })

  it('maps books to the private books prefix', () => {
    expect(toStorageObjectPath('/books/the-song-of-achilles.pdf'))
      .toBe('books/the-song-of-achilles.pdf')
    expect(isProtectedMediaPath('/books/the-song-of-achilles.pdf')).toBe(true)
  })

  it('maps legacy IELTS wizard URLs into the private catalog prefix', () => {
    expect(toStorageObjectPath('/ielts-wizard/reading/p1/example.jpg'))
      .toBe('catalog/ielts-wizard/reading/p1/example.jpg')
    expect(isProtectedMediaPath('/ielts-wizard/reading/p1/example.jpg')).toBe(true)
  })
})
