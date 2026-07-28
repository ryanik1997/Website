const VOICE_ALIASES: Record<string, string> = {
  default: 'bf_emma',
  'en-gb': 'bf_emma',
  uk: 'bf_emma',
  british: 'bf_emma',
  'en-us': 'af_heart',
  us: 'af_heart',
  american: 'af_heart',
}

export function normalizeVoice(voice: string, lang = 'b'): string {
  const trimmed = voice.trim()
  if (!trimmed || trimmed === 'default') {
    return lang === 'a' ? 'af_heart' : 'bf_emma'
  }
  return VOICE_ALIASES[trimmed.toLowerCase()] ?? trimmed
}

export function clampSpeed(speed: number): number {
  if (!Number.isFinite(speed)) return 1
  return Math.max(0.55, Math.min(1.45, speed))
}