/**
 * ID helpers for PET B1 Reading catalog entries.
 */

export const partId = (n, p) => `catalog-reading-pet-b1-test${n}-part-${p}`
export const questionId = (n, p, number) => `${partId(n, p)}-q${number}`
export const examId = (n) => `catalog-reading-pet-b1-test${n}`
export const range = (start, end) => `Questions ${start}\u2013${end}`
