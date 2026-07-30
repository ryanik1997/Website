/**
 * Deterministic shuffle using FNV-1a hash → PRNG → Fisher-Yates.
 * No Math.random(). Seed = `${examId}:partN`.
 */

function hashSeed(value) {
  let hash = 2166136261
  for (const character of value) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function createPrng(seedText) {
  let state = hashSeed(seedText)
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function deterministicShuffle(items, seedText) {
  const result = [...items]
  const random = createPrng(seedText)
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]]
  }
  return result
}
