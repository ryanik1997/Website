import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import WordDiffPanel from './WordDiffPanel'
import {
  collectBlankAnswer,
  getClozeBlankIndices,
  isAnswerCorrect,
  normalizeWord,
  splitWordParts,
  splitWords,
} from './practiceUtils'

type Mode = 'boxes' | 'cloze'

export interface BlankInputHandle {
  collectAnswer: () => string
  hasContent: () => boolean
}

interface Props {
  sentenceText: string
  mode: Mode
  clozeCount: number
  locked: boolean
  checked: boolean
  showLiveDiff?: boolean
  onContentChange?: (hasContent: boolean) => void
  /** Gọi khi toàn bộ câu đã đúng (dùng với Hiện kết quả ngay → tự Kiểm tra) */
  onAllCorrect?: () => void
}

function blankWidthPx(stripped: string): number {
  const charLen = Math.max(stripped.length, 2)
  return charLen * 11 + 16
}

function applyInputStatus(el: HTMLInputElement, raw: string, expected: string) {
  const { stripped } = splitWordParts(expected)
  el.classList.remove('lsn-blank-correct', 'lsn-blank-wrong')
  if (raw && normalizeWord(raw) === normalizeWord(expected)) {
    el.classList.add('lsn-blank-correct')
  } else if (raw.length >= stripped.length && raw.length > 0) {
    el.classList.add('lsn-blank-wrong')
  }
}

function readValues(container: HTMLElement, blankCount: number): string[] {
  const out = Array(blankCount).fill('')
  container.querySelectorAll<HTMLInputElement>('[data-blank-idx]').forEach(el => {
    const idx = Number(el.dataset.blankIdx)
    if (idx >= 0 && idx < blankCount) out[idx] = el.value
  })
  return out
}

/**
 * Ô chữ / Cloze — DOM thuần (giống app P15.8.302), tránh mất ký tự do React re-render.
 */
const BlankInputMode = forwardRef<BlankInputHandle, Props>(function BlankInputMode(
  {
    sentenceText,
    mode,
    clozeCount,
    locked,
    checked,
    showLiveDiff = false,
    onContentChange,
    onAllCorrect,
  },
  ref,
) {
  const words = useMemo(() => splitWords(sentenceText), [sentenceText])
  const blankSet = useMemo(
    () => (mode === 'cloze' ? getClozeBlankIndices(words, clozeCount) : new Set(words.map((_, i) => i))),
    [words, mode, clozeCount],
  )
  const blankCount = useMemo(
    () => words.filter((_, i) => blankSet.has(i)).length,
    [words, blankSet],
  )

  const rowRef = useRef<HTMLDivElement>(null)
  const mountKey = `${sentenceText}|${mode}|${clozeCount}`
  const wordsRef = useRef(words)
  const blankSetRef = useRef(blankSet)
  const modeRef = useRef(mode)
  const lockedRef = useRef(locked)
  const checkedRef = useRef(checked)
  const blankCountRef = useRef(blankCount)
  const sentenceTextRef = useRef(sentenceText)
  const onAllCorrectRef = useRef(onAllCorrect)
  const onContentChangeRef = useRef(onContentChange)
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  wordsRef.current = words
  blankSetRef.current = blankSet
  modeRef.current = mode
  lockedRef.current = locked
  checkedRef.current = checked
  blankCountRef.current = blankCount
  sentenceTextRef.current = sentenceText
  onAllCorrectRef.current = onAllCorrect
  onContentChangeRef.current = onContentChange

  const [liveDraft, setLiveDraft] = useState('')
  const diffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearAdvanceTimer = () => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current)
      advanceTimerRef.current = null
    }
  }

  const tryAutoCheck = (container: HTMLElement) => {
    const cb = onAllCorrectRef.current
    if (!cb || lockedRef.current || checkedRef.current) return
    const vals = readValues(container, blankCountRef.current)
    const answer = collectBlankAnswer(
      wordsRef.current,
      vals,
      modeRef.current,
      blankSetRef.current,
    )
    if (isAnswerCorrect(answer, sentenceTextRef.current)) {
      cb()
    }
  }

  const emitLiveDraft = (container: HTMLElement) => {
    const vals = readValues(container, blankCountRef.current)
    const answer = collectBlankAnswer(wordsRef.current, vals, modeRef.current, blankSetRef.current)
    if (diffTimerRef.current) clearTimeout(diffTimerRef.current)
    diffTimerRef.current = setTimeout(() => setLiveDraft(answer), 40)
  }

  const collectFromDom = (): string => {
    const wrap = rowRef.current
    if (!wrap) return ''
    const vals = readValues(wrap, blankCountRef.current)
    return collectBlankAnswer(wordsRef.current, vals, modeRef.current, blankSetRef.current)
  }

  useImperativeHandle(ref, () => ({
    collectAnswer: collectFromDom,
    hasContent: () => {
      const wrap = rowRef.current
      if (!wrap) return false
      return readValues(wrap, blankCountRef.current).some(v => v.trim().length > 0)
    },
  }), [])

  useEffect(() => {
    const wrap = rowRef.current
    if (!wrap) return

    wrap.innerHTML = ''
    setLiveDraft('')

    let blankCursor = 0

    words.forEach((word, wordIdx) => {
      const isBlank = blankSet.has(wordIdx)

      if (!isBlank) {
        const span = document.createElement('span')
        span.className = 'lsn-blank-word'
        span.textContent = word
        wrap.appendChild(span)
        return
      }

      const bIdx = blankCursor++
      const { stripped, punct } = splitWordParts(word)

      const slot = document.createElement('span')
      slot.className = 'lsn-blank-slot'

      const input = document.createElement('input')
      input.type = 'text'
      input.className = 'lsn-blank-input'
      input.dataset.blankIdx = String(bIdx)
      input.dataset.wordIdx = String(wordIdx)
      input.style.width = `${blankWidthPx(stripped)}px`
      input.autocomplete = 'off'
      input.setAttribute('autocorrect', 'off')
      input.setAttribute('autocapitalize', 'off')
      input.spellcheck = false
      input.inputMode = 'text'
      input.setAttribute('enterkeyhint', 'next')
      input.setAttribute('aria-label', `Ô ${bIdx + 1}`)

      const onInput = () => {
        if (lockedRef.current || checkedRef.current) return

        clearAdvanceTimer()
        applyInputStatus(input, input.value, word)
        emitLiveDraft(wrap)
        onContentChangeRef.current?.(
          readValues(wrap, blankCountRef.current).some(value => value.trim().length > 0),
        )

        const val = input.value.trim()
        if (val && normalizeWord(val) === normalizeWord(word)) {
          advanceTimerRef.current = setTimeout(() => {
            advanceTimerRef.current = null
            if (lockedRef.current || checkedRef.current) return
            const next = wrap.querySelector<HTMLInputElement>(
              `[data-blank-idx="${bIdx + 1}"]`,
            )
            if (next) {
              next.focus()
            }
            tryAutoCheck(wrap)
          }, 120)
        } else {
          tryAutoCheck(wrap)
        }
      }

      input.addEventListener('input', onInput)
      input.addEventListener('keydown', e => {
        if (e.key === 'Tab') {
          e.preventDefault()
          const next = wrap.querySelector<HTMLInputElement>(
            `[data-blank-idx="${(bIdx + 1) % blankCount}"]`,
          )
          next?.focus()
        }
      })

      slot.appendChild(input)

      if (punct) {
        const punctSpan = document.createElement('span')
        punctSpan.className = 'lsn-blank-punct'
        punctSpan.textContent = punct
        slot.appendChild(punctSpan)
      }

      wrap.appendChild(slot)
    })

    const t = window.setTimeout(() => {
      wrap.querySelector<HTMLInputElement>('[data-blank-idx]')?.focus()
    }, 60)

    return () => {
      window.clearTimeout(t)
      clearAdvanceTimer()
      if (diffTimerRef.current) clearTimeout(diffTimerRef.current)
      wrap.innerHTML = ''
    }
  }, [mountKey, words, blankSet, blankCount])

  useEffect(() => {
    const wrap = rowRef.current
    if (!wrap) return

    wrap.querySelectorAll<HTMLInputElement>('[data-blank-idx]').forEach(el => {
      const wordIdx = Number(el.dataset.wordIdx)
      const word = wordsRef.current[wordIdx]
      if (!word) return

      el.readOnly = locked || checked
      if (checked) {
        applyInputStatus(el, el.value, word)
      }
    })
  }, [locked, checked])

  return (
    <div className="mb-4" data-no-copy-toolbar>
      {mode === 'cloze' && (
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          Điền vào ô trống (từ quan trọng đã được ẩn)
        </p>
      )}
      <div ref={rowRef} className="lsn-blank-row" />
      {showLiveDiff && (
        <WordDiffPanel input={liveDraft} correct={sentenceText} />
      )}
    </div>
  )
})

export default BlankInputMode
