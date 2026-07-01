export const FONT_SIZE_STORAGE_KEY = 'exam-reading-font-size'
export const FONT_FAMILY_STORAGE_KEY = 'exam-reading-font-family'

export const FONT_SIZE_MIN = 12
export const FONT_SIZE_MAX = 24
export const FONT_SIZE_DEFAULT = 16

export interface ReadingFontOption {
  id: string
  label: string
  family: string
}

export const READING_FONT_OPTIONS: ReadingFontOption[] = [
  { id: 'default', label: 'Mặc định', family: 'inherit' },
  { id: 'lora', label: 'Lora', family: '"Lora", Georgia, serif' },
  { id: 'merriweather', label: 'Merriweather', family: '"Merriweather", Georgia, serif' },
  { id: 'fraunces', label: 'Fraunces', family: '"Fraunces", Georgia, serif' },
  { id: 'eb-garamond', label: 'EB Garamond', family: '"EB Garamond", Georgia, serif' },
  { id: 'newsreader', label: 'Newsreader', family: '"Newsreader", Georgia, serif' },
  { id: 'spectral', label: 'Spectral', family: '"Spectral", Georgia, serif' },
]

const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=EB+Garamond&family=Fraunces:opsz,wght@9..144,400&family=Lora&family=Merriweather&family=Newsreader&family=Spectral&display=swap'

let fontsLinkInjected = false

export function ensureReadingFontsLoaded() {
  if (fontsLinkInjected || typeof document === 'undefined') return
  const existing = document.getElementById('reading-exam-fonts')
  if (existing) {
    fontsLinkInjected = true
    return
  }
  const link = document.createElement('link')
  link.id = 'reading-exam-fonts'
  link.rel = 'stylesheet'
  link.href = GOOGLE_FONTS_URL
  document.head.appendChild(link)
  fontsLinkInjected = true
}

export function clampFontSize(size: number) {
  return Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, size))
}

export function loadFontSize(): number {
  const raw = window.localStorage.getItem(FONT_SIZE_STORAGE_KEY)
  const parsed = raw ? Number(raw) : FONT_SIZE_DEFAULT
  return Number.isNaN(parsed) ? FONT_SIZE_DEFAULT : clampFontSize(parsed)
}

export function loadFontFamilyId(): string {
  return window.localStorage.getItem(FONT_FAMILY_STORAGE_KEY) ?? 'default'
}

export function getFontFamilyCss(familyId: string): string {
  return READING_FONT_OPTIONS.find(option => option.id === familyId)?.family ?? 'inherit'
}