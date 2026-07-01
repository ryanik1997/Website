import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Check, RefreshCw } from 'lucide-react'
import { sentenceStructureRepo } from '@ryan/db'
import {
  fillTemplate,
  parseTemplate,
  phrasesMatch,
} from './types'

interface Props {
  structureId: string
}

export default function StructurePracticePanel({ structureId }: Props) {
  const item = useLiveQuery(
    () => sentenceStructureRepo.get(structureId),
    [structureId],
  )

  const [inputA, setInputA] = useState('')
  const [inputB, setInputB] = useState('')
  const [flipped, setFlipped] = useState(false)
  const [checked, setChecked] = useState(false)
  const [matchA, setMatchA] = useState(false)
  const [matchB, setMatchB] = useState(false)

  useEffect(() => {
    setInputA('')
    setInputB('')
    setMatchA(false)
    setMatchB(false)
    setFlipped(false)
    setChecked(false)
  }, [structureId])

  if (!item) return null

  const displayA = flipped || checked ? (flipped ? item.exampleA : inputA) : inputA
  const displayB = flipped || checked ? (flipped ? item.exampleB : inputB) : inputB
  const parts = parseTemplate(item.template)

  function handleCheck() {
    if (!inputA.trim() || !inputB.trim()) return
    const okA = phrasesMatch(inputA, item!.exampleA)
    const okB = phrasesMatch(inputB, item!.exampleB)
    setMatchA(okA)
    setMatchB(okB)
    setChecked(true)
    setFlipped(false)
  }

  function handleFlip() {
    setFlipped(!flipped)
    setChecked(false)
    setMatchA(false)
    setMatchB(false)
  }

  const built = fillTemplate(
    item.template,
    flipped ? item.exampleA : inputA,
    flipped ? item.exampleB : inputB,
  )

  return (
    <div className="ss-main ss-main--solo">
      <div className="ss-main-head">
        <div>
          <h1 className="ss-main-title">{item.title}</h1>
          <p className="ss-main-desc">{item.description}</p>
        </div>
      </div>

      <div className="ss-pattern-card">
        <div className="ss-pattern-line">
          {parts.map((part, i) => {
            if (part.kind === 'text') {
              return <span key={i}>{part.value}</span>
            }
            const val = part.key === 'A' ? displayA : displayB
            const showVal = (flipped || checked) && val.trim()
            return (
              <span
                key={i}
                className={`ss-slot${showVal ? ' has-value' : ''}`}
              >
                {showVal ? val.trim() : part.key}
              </span>
            )
          })}
        </div>
        <p className="ss-pattern-dot">·</p>
        <p className="ss-pattern-note">{item.exampleNoteVi}</p>
      </div>

      {!flipped && (
        <>
          <div className="ss-inputs">
            <div className="ss-input-row">
              <span className="ss-input-label">A</span>
              <input
                type="text"
                value={inputA}
                onChange={e => { setInputA(e.target.value); setChecked(false) }}
                placeholder="Nhập câu / cụm từ tiếng Anh cho ô A..."
                onKeyDown={e => e.key === 'Enter' && handleCheck()}
              />
            </div>
            <div className="ss-input-row">
              <span className="ss-input-label">B</span>
              <input
                type="text"
                value={inputB}
                onChange={e => { setInputB(e.target.value); setChecked(false) }}
                placeholder="Nhập câu / cụm từ tiếng Anh cho ô B..."
                onKeyDown={e => e.key === 'Enter' && handleCheck()}
              />
            </div>
          </div>

          <div className="ss-actions">
            <button type="button" className="ss-flip-btn" onClick={handleFlip}>
              <RefreshCw size={15} />
              Lật thẻ
            </button>
            <button
              type="button"
              className="ss-check-btn"
              disabled={!inputA.trim() || !inputB.trim()}
              onClick={handleCheck}
            >
              <Check size={16} />
              Kiểm tra
            </button>
          </div>

          {checked && (
            <div className={`ss-result${matchA && matchB ? ' ss-result--ok' : ' ss-result--hint'}`}>
              <p style={{ margin: '0 0 0.35rem', fontWeight: 700 }}>
                {matchA && matchB ? '✓ Xuất sắc!' : 'Câu của bạn:'}
              </p>
              <p style={{ margin: 0, fontStyle: 'italic' }}>&ldquo;{built}&rdquo;</p>
              {!(matchA && matchB) && (
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Gợi ý: A = &ldquo;{item.exampleA}&rdquo; · B = &ldquo;{item.exampleB}&rdquo;
                  {!matchA && !matchB ? '' : !matchA ? ' (ô A chưa khớp)' : ' (ô B chưa khớp)'}
                </p>
              )}
            </div>
          )}
        </>
      )}

      {flipped && (
        <div className="ss-actions" style={{ marginTop: '0.5rem' }}>
          <button type="button" className="ss-flip-btn" onClick={handleFlip}>
            <RefreshCw size={15} />
            Quay lại luyện tập
          </button>
        </div>
      )}
    </div>
  )
}