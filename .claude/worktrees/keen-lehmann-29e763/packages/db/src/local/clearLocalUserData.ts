import { db } from './schema'

const LOCAL_OWNER_KEY = 'ryan-local-user-id'
const EXAM_DRAFT_PREFIXES = [
  'exam-reading-draft:',
  'exam-listening-draft:',
  'ielts-reading-import-wizard-draft',
  'ielts-reading-wizard-draft-slot:',
  'ielts-listening-import-wizard-draft',
] as const

/** Keys that must not leak across accounts (user-scoped localStorage). */
const USER_SCOPED_LS_KEYS = [
  'ryan-last-sync',
  LOCAL_OWNER_KEY,
] as const

/**
 * Wipe all Dexie tables for the current browser origin.
 * Call on sign-out and when a different user signs in on the same device.
 */
export async function clearLocalUserData(): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map(table => table.clear()))
  })
  clearUserScopedLocalStorage()
}

/** Remove exam drafts + sync markers from localStorage (same origin). */
export function clearUserScopedLocalStorage(): void {
  if (typeof localStorage === 'undefined') return

  const toRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key) continue
    if (EXAM_DRAFT_PREFIXES.some(p => key.startsWith(p))) {
      toRemove.push(key)
      continue
    }
    if ((USER_SCOPED_LS_KEYS as readonly string[]).includes(key)) {
      toRemove.push(key)
    }
  }
  for (const key of toRemove) {
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore quota / private mode */
    }
  }
}

export function getLocalUserOwnerId(): string | null {
  if (typeof localStorage === 'undefined') return null
  try {
    return localStorage.getItem(LOCAL_OWNER_KEY)
  } catch {
    return null
  }
}

export function setLocalUserOwnerId(userId: string): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(LOCAL_OWNER_KEY, userId)
  } catch {
    /* ignore */
  }
}

/**
 * Bind local DB to `userId`. If another user owned this browser data, wipe first.
 * First-time bind (no previous owner) does NOT wipe — avoids deleting existing
 * single-user data when rolling out isolation.
 * Returns true when a wipe happened (account switch).
 */
export async function ensureLocalUserIsolation(userId: string): Promise<boolean> {
  const prev = getLocalUserOwnerId()
  if (prev === userId) return false

  if (prev != null && prev !== userId) {
    await clearLocalUserData()
    setLocalUserOwnerId(userId)
    return true
  }

  // prev == null: claim ownership without wipe
  setLocalUserOwnerId(userId)
  return false
}

export { LOCAL_OWNER_KEY }
