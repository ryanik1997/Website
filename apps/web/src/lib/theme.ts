export type Theme = 'light' | 'mid' | 'dark'

export const THEMES: { id: Theme; label: string; icon: string; preview: { bg: string; card: string; text: string; accent: string } }[] = [
  { id: 'light', label: 'Sáng',  icon: '☀', preview: { bg: '#f5f5f7', card: '#ffffff', text: '#1d1d1f', accent: '#6366f1' } },
  { id: 'mid',   label: 'Tối vừa', icon: '🌙', preview: { bg: '#181825', card: '#24243a', text: '#cdd6f4', accent: '#89b4fa' } },
  { id: 'dark',  label: 'Tối',   icon: '✦', preview: { bg: '#13131a', card: '#1a1a24', text: '#f0f0f5', accent: '#818cf8' } },
]

const STORAGE_KEY = 'ryan-theme'

export function getTheme(): Theme {
  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
  return saved && THEMES.some(t => t.id === saved) ? saved : 'light'
}

export function setTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem(STORAGE_KEY, theme)
}