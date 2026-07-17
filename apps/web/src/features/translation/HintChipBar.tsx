import { useEffect, useState } from 'react'
import { Eye, EyeOff, Volume2 } from 'lucide-react'
import { speakPhrase } from '../vocab/study/speakPhrase'
import { maskChipLabel, type TranslationChip } from './translationChips'

interface HintChipBarProps {
  chips: TranslationChip[]
  /** Mở theo tiến độ gõ (typing unlock) */
  unlockStates?: boolean[]
  /** Hiện tất cả (nút "Hiện tất cả" hoặc màn result) */
  revealAll?: boolean
  onToggleRevealAll?: () => void
  /** Reset override khi đổi câu (key từ parent: sentence id) */
  resetKey?: string | number
  className?: string
  showRevealAllButton?: boolean
}

/**
 * Chip gợi ý: bấm 1 lần hiện từ, bấm lại ẩn.
 * Typing unlock / revealAll vẫn mở chip (trừ khi user vừa ẩn thủ công — override).
 */
export default function HintChipBar({
  chips,
  unlockStates,
  revealAll = false,
  onToggleRevealAll,
  resetKey,
  className = '',
  showRevealAllButton = true,
}: HintChipBarProps) {
  /** true = ép hiện, false = ép ẩn, missing = theo auto */
  const [override, setOverride] = useState<Record<number, boolean>>({})

  useEffect(() => {
    setOverride({})
  }, [resetKey, chips.length])

  function autoShown(i: number): boolean {
    return Boolean(revealAll || unlockStates?.[i])
  }

  function isShown(i: number, ov: Record<number, boolean> = override): boolean {
    if (ov[i] !== undefined) return ov[i]!
    return autoShown(i)
  }

  function toggleChip(i: number) {
    setOverride(prev => {
      const currently = isShown(i, prev)
      return { ...prev, [i]: !currently }
    })
  }

  if (!chips.length) return null

  return (
    <div className={`tp-chip-row ${className}`.trim()}>
      {chips.map((chip, i) => {
        const shown = isShown(i)
        return (
          <button
            key={`${chip.text}-${i}`}
            type="button"
            className={`tp-chip tp-chip--toggle ${shown ? 'tp-chip--unlocked' : 'tp-chip--locked'}`}
            onClick={() => toggleChip(i)}
            title={shown ? 'Bấm để ẩn từ' : 'Bấm để hiện từ'}
            aria-pressed={shown}
            aria-label={shown ? `Ẩn từ ${chip.text}` : `Hiện gợi ý từ số ${i + 1}`}
          >
            {shown ? (
              <>
                <span>{chip.text}</span>
                <span
                  role="button"
                  tabIndex={0}
                  className="tp-chip-speak"
                  title="Nghe phát âm"
                  onClick={e => {
                    e.stopPropagation()
                    void speakPhrase(chip.text)
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      void speakPhrase(chip.text)
                    }
                  }}
                >
                  <Volume2 size={13} />
                </span>
              </>
            ) : (
              <span>{maskChipLabel(chip.text)}</span>
            )}
          </button>
        )
      })}
      {showRevealAllButton && onToggleRevealAll && (
        <button type="button" className="tp-show-all" onClick={onToggleRevealAll}>
          {revealAll ? <EyeOff size={13} /> : <Eye size={13} />}
          {revealAll ? 'Ẩn gợi ý' : 'Hiện tất cả'}
        </button>
      )}
    </div>
  )
}
