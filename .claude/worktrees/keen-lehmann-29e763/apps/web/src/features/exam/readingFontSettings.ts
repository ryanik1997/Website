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

/** 10 font tùy chọn cho đề Reading / Listening exam */
export const READING_FONT_OPTIONS: ReadingFontOption[] = [
  { id: 'default', label: 'Mặc định', family: 'inherit' },
  { id: 'lora', label: 'Lora', family: '"Lora", Georgia, serif' },
  { id: 'merriweather', label: 'Merriweather', family: '"Merriweather", Georgia, serif' },
  { id: 'fraunces', label: 'Fraunces', family: '"Fraunces", Georgia, serif' },
  { id: 'eb-garamond', label: 'EB Garamond', family: '"EB Garamond", Georgia, serif' },
  { id: 'newsreader', label: 'Newsreader', family: '"Newsreader", Georgia, serif' },
  { id: 'spectral', label: 'Spectral', family: '"Spectral", Georgia, serif' },
  { id: 'source-serif', label: 'Source Serif', family: '"Source Serif 4", Georgia, serif' },
  { id: 'literata', label: 'Literata', family: '"Literata", Georgia, serif' },
  { id: 'libre-baskerville', label: 'Libre Baskerville', family: '"Libre Baskerville", Georgia, serif' },
]

const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?' +
  [
    'family=EB+Garamond:ital,wght@0,400;0,600;1,400',
    'family=Fraunces:opsz,wght@9..144,400;9..144,600',
    'family=Libre+Baskerville:ital,wght@0,400;0,700;1,400',
    'family=Literata:opsz,wght@7..72,400;7..72,600',
    'family=Lora:ital,wght@0,400;0,600;1,400',
    'family=Merriweather:opsz,wght@18..144,400;18..144,700',
    'family=Newsreader:opsz,wght@6..72,400;6..72,600',
    'family=Source+Serif+4:opsz,wght@8..60,400;8..60,600',
    'family=Spectral:wght@400;600',
  ].join('&') +
  '&display=swap'

let fontsLinkInjected = false

export function ensureReadingFontsLoaded() {
  if (fontsLinkInjected || typeof document === 'undefined') return
  const existing = document.getElementById('reading-exam-fonts')
  if (existing) {
    fontsLinkInjected = true
    // Cập nhật href nếu thêm font mới
    if (existing instanceof HTMLLinkElement && existing.href !== GOOGLE_FONTS_URL) {
      existing.href = GOOGLE_FONTS_URL
    }
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
  const id = window.localStorage.getItem(FONT_FAMILY_STORAGE_KEY) ?? 'default'
  return READING_FONT_OPTIONS.some(o => o.id === id) ? id : 'default'
}

export function getFontFamilyCss(familyId: string): string {
  return READING_FONT_OPTIONS.find(option => option.id === familyId)?.family ?? 'inherit'
}
