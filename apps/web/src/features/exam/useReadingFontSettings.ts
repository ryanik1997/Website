import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import {
  ensureReadingFontsLoaded,
  getFontFamilyCss,
  loadFontFamilyId,
  loadFontSize,
} from './readingFontSettings'

/** State + CSS vars cỡ chữ / font cho shell đề (IELTS + Cambridge). */
export function useReadingFontSettings() {
  const [fontSize, setFontSize] = useState(loadFontSize)
  const [fontFamilyId, setFontFamilyId] = useState(loadFontFamilyId)
  const [fontPanelOpen, setFontPanelOpen] = useState(false)

  useEffect(() => {
    ensureReadingFontsLoaded()
  }, [])

  const fontStyle = useMemo(
    (): CSSProperties =>
      ({
        '--rt-font-size': `${fontSize}px`,
        '--rt-font-family': getFontFamilyCss(fontFamilyId),
      }) as CSSProperties,
    [fontFamilyId, fontSize],
  )

  return {
    fontSize,
    setFontSize,
    fontFamilyId,
    setFontFamilyId,
    fontPanelOpen,
    setFontPanelOpen,
    fontStyle,
  }
}
