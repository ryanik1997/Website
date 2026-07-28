/**
 * Kokoro-82M English voices + user preference (localStorage).
 * Docs: https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md
 */

export type KokoroLang = 'a' | 'b'
export type KokoroGender = 'f' | 'm'

export interface KokoroVoice {
  id: string
  label: string
  lang: KokoroLang
  gender: KokoroGender
  /** Short trait notes for UI */
  note?: string
  /** Overall grade from Kokoro docs */
  grade?: string
}

/** English voices only (app is EN-learning focused). */
export const KOKORO_VOICES: KokoroVoice[] = [
  // American — female
  { id: 'af_heart', label: 'Heart', lang: 'a', gender: 'f', note: 'Nữ · khuyến nghị', grade: 'A' },
  { id: 'af_bella', label: 'Bella', lang: 'a', gender: 'f', note: 'Nữ · ấm', grade: 'A-' },
  { id: 'af_nicole', label: 'Nicole', lang: 'a', gender: 'f', note: 'Nữ · podcast', grade: 'B-' },
  { id: 'af_aoede', label: 'Aoede', lang: 'a', gender: 'f', note: 'Nữ', grade: 'C+' },
  { id: 'af_kore', label: 'Kore', lang: 'a', gender: 'f', note: 'Nữ', grade: 'C+' },
  { id: 'af_sarah', label: 'Sarah', lang: 'a', gender: 'f', note: 'Nữ', grade: 'C+' },
  { id: 'af_nova', label: 'Nova', lang: 'a', gender: 'f', note: 'Nữ', grade: 'C' },
  { id: 'af_alloy', label: 'Alloy', lang: 'a', gender: 'f', note: 'Nữ', grade: 'C' },
  { id: 'af_sky', label: 'Sky', lang: 'a', gender: 'f', note: 'Nữ', grade: 'C-' },
  { id: 'af_jessica', label: 'Jessica', lang: 'a', gender: 'f', note: 'Nữ', grade: 'D' },
  { id: 'af_river', label: 'River', lang: 'a', gender: 'f', note: 'Nữ', grade: 'D' },
  // American — male
  { id: 'am_fenrir', label: 'Fenrir', lang: 'a', gender: 'm', note: 'Nam', grade: 'C+' },
  { id: 'am_michael', label: 'Michael', lang: 'a', gender: 'm', note: 'Nam', grade: 'C+' },
  { id: 'am_puck', label: 'Puck', lang: 'a', gender: 'm', note: 'Nam', grade: 'C+' },
  { id: 'am_echo', label: 'Echo', lang: 'a', gender: 'm', note: 'Nam', grade: 'D' },
  { id: 'am_eric', label: 'Eric', lang: 'a', gender: 'm', note: 'Nam', grade: 'D' },
  { id: 'am_liam', label: 'Liam', lang: 'a', gender: 'm', note: 'Nam', grade: 'D' },
  { id: 'am_onyx', label: 'Onyx', lang: 'a', gender: 'm', note: 'Nam', grade: 'D' },
  { id: 'am_santa', label: 'Santa', lang: 'a', gender: 'm', note: 'Nam', grade: 'D-' },
  { id: 'am_adam', label: 'Adam', lang: 'a', gender: 'm', note: 'Nam', grade: 'F+' },
  // British — female
  { id: 'bf_emma', label: 'Emma', lang: 'b', gender: 'f', note: 'Nữ · khuyến nghị', grade: 'B-' },
  { id: 'bf_isabella', label: 'Isabella', lang: 'b', gender: 'f', note: 'Nữ', grade: 'C' },
  { id: 'bf_alice', label: 'Alice', lang: 'b', gender: 'f', note: 'Nữ', grade: 'D' },
  { id: 'bf_lily', label: 'Lily', lang: 'b', gender: 'f', note: 'Nữ', grade: 'D' },
  // British — male
  { id: 'bm_george', label: 'George', lang: 'b', gender: 'm', note: 'Nam', grade: 'C' },
  { id: 'bm_fable', label: 'Fable', lang: 'b', gender: 'm', note: 'Nam', grade: 'C' },
  { id: 'bm_daniel', label: 'Daniel', lang: 'b', gender: 'm', note: 'Nam', grade: 'D' },
  { id: 'bm_lewis', label: 'Lewis', lang: 'b', gender: 'm', note: 'Nam', grade: 'D+' },
]

export const DEFAULT_VOICE_US = 'af_heart'
export const DEFAULT_VOICE_UK = 'bf_emma'

const KEY_US = 'ryan-kokoro-voice-us'
const KEY_UK = 'ryan-kokoro-voice-uk'

const voiceById = new Map(KOKORO_VOICES.map(v => [v.id, v]))

export function getKokoroVoice(id: string): KokoroVoice | undefined {
  return voiceById.get(id)
}

export function langFromVoiceId(id: string): KokoroLang {
  if (id.startsWith('b')) return 'b'
  return 'a'
}

export function voicesForLang(lang: KokoroLang): KokoroVoice[] {
  return KOKORO_VOICES.filter(v => v.lang === lang)
}

function readKey(key: string, fallback: string): string {
  try {
    const v = localStorage.getItem(key)?.trim()
    if (v && voiceById.has(v)) return v
  } catch {
    // ignore
  }
  return fallback
}

export function getPreferredKokoroVoice(lang: KokoroLang = 'a'): string {
  return lang === 'b' ? readKey(KEY_UK, DEFAULT_VOICE_UK) : readKey(KEY_US, DEFAULT_VOICE_US)
}

export function setPreferredKokoroVoice(lang: KokoroLang, voiceId: string): void {
  const fallback = lang === 'b' ? DEFAULT_VOICE_UK : DEFAULT_VOICE_US
  const id = voiceById.has(voiceId) && voiceById.get(voiceId)!.lang === lang ? voiceId : fallback
  try {
    localStorage.setItem(lang === 'b' ? KEY_UK : KEY_US, id)
  } catch {
    // ignore
  }
  // notify same-tab listeners
  window.dispatchEvent(new CustomEvent('ryan-kokoro-voice-change', { detail: { lang, voiceId: id } }))
}

export function getPreferredVoices(): { us: string; uk: string } {
  return {
    us: getPreferredKokoroVoice('a'),
    uk: getPreferredKokoroVoice('b'),
  }
}

export function formatVoiceOption(v: KokoroVoice): string {
  const gender = v.gender === 'f' ? '♀' : '♂'
  const grade = v.grade ? ` · ${v.grade}` : ''
  return `${gender} ${v.label} (${v.id})${grade}`
}

/** Sample sentence for preview in settings. */
export const KOKORO_PREVIEW_TEXT =
  'Hello! This is Kokoro text to speech. Practice English with a clear natural voice.'
