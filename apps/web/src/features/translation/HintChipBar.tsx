import { useEffect, useState } from 'react'
import { Eye, EyeOff, Volume2 } from 'lucide-react'
import { speakPhrase } from '../vocab/study/speakPhrase'
import { maskChipLabel, type TranslationChip } from './translationChips'

interface HintChipBarProps {
  chips: TranslationChip[]
  /** Gõ đúng exact → xanh */
  unlockStates?: boolean[]
  /** Gõ sai → đỏ (luôn thắng revealAll / click tay) */
  wrongStates?: boolean[]
  /** Từ user đã gõ tại vị trí (để hiện trên chip đỏ) */
  typedWords?: (string | undefined)[]
  /** Hiện text gợi ý (không đổi màu đúng/sai) */
  revealAll?: boolean
  onToggleRevealAll?: () => void
  resetKey?: string | number
  className?: string
  showRevealAllButton?: boolean
}

type ChipVisual = 'ok' | 'wrong' | 'hint' | 'locked'

/**
 * Màu chip theo gõ:
 * - đúng → xanh (ok)
 * - sai → đỏ (wrong) — luôn, kể cả khi "Hiện tất cả"
 * - chưa gõ + hiện gợi ý → hint (neutral)
 * - chưa gõ → locked ●●●
 */
export default function HintChipBar({
  chips,
  unlockStates,
  wrongStates,
  typedWords,
  revealAll = false,
  onToggleRevealAll,
  resetKey,
  className = '',
  showRevealAllButton = true,
}: HintChipBarProps) {
  /** true = ép hiện text, false = ép ẩn, missing = theo auto */
  const [override, setOverride] = useState<Record<number, boolean>>({})

  useEffect(() => {
    setOverride({})
  }, [resetKey, chips.length])

  function visualOf(i: number): ChipVisual {
    if (wrongStates?.[i]) return 'wrong'
    if (unlockStates?.[i]) return 'ok'
    if (revealAll || override[i] === true) return 'hint'
    return 'locked'
  }

  function isTextShown(i: number): boolean {
    if (override[i] === false) return false
    if (override[i] === true) return true
    const v = visualOf(i)
    return v === 'ok' || v === 'wrong' || v === 'hint' || revealAll
  }

  function toggleChip(i: number) {
    setOverride(prev => {
      const currently = isTextShown(i)
      return { ...prev, [i]: !currently }
    })
  }

  if (!chips.length) return null

  return (
    <div className={`tp-chip-row ${className}`.trim()}>
      {chips.map((chip, i) => {
        const visual = visualOf(i)
        const shown = isTextShown(i)
        const typed = typedWords?.[i]?.trim()
        const classByVisual =
          visual === 'wrong'
            ? 'tp-chip--wrong'
            : visual === 'ok'
              ? 'tp-chip--unlocked'
              : visual === 'hint'
                ? 'tp-chip--hint'
                : 'tp-chip--locked'

        return (
          <button
            key={`${chip.text}-${i}`}
            type="button"
            data-chip-state={visual}
            className={`tp-chip tp-chip--toggle ${classByVisual}`}
            onClick={() => toggleChip(i)}
            title={
              visual === 'wrong'
                ? typed
                  ? `Sai: “${typed}” → đúng: “${chip.text}”`
                  : `Sai — từ đúng: ${chip.text}`
                : visual === 'ok'
                  ? `Đúng: ${chip.text}`
                  : shown
                    ? 'Bấm để ẩn từ'
                    : 'Bấm để hiện từ'
            }
            aria-pressed={shown}
            aria-invalid={visual === 'wrong' || undefined}
            aria-label={
              visual === 'wrong'
                ? `Từ ${i + 1} sai${typed ? `, bạn gõ ${typed}` : ''}, đáp án ${chip.text}`
                : visual === 'ok'
                  ? `Từ ${i + 1} đúng: ${chip.text}`
                  : shown
                    ? `Ẩn từ ${chip.text}`
                    : `Hiện gợi ý từ số ${i + 1}`
            }
          >
            {shown ? (
              <>
                {visual === 'wrong' && (
                  <span className="tp-chip-mark" aria-hidden>
                    ✗
                  </span>
                )}
                {visual === 'ok' && (
                  <span className="tp-chip-mark" aria-hidden>
                    ✓
                  </span>
                )}
                <span className="tp-chip-label">
                  {visual === 'wrong' && typed && typed.toLowerCase() !== chip.text.toLowerCase()
                    ? `${typed} → ${chip.text}`
                    : chip.text}
                </span>
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
