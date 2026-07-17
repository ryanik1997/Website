import { describe, expect, it } from 'vitest'
import {
  isProtectedMediaPath,
  toStorageObjectPath,
} from './protectedMedia'

describe('protected media security paths', () => {
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
