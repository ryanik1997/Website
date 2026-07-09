import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Check, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import { canUse, type AIProvider, type Plan } from '@ryan/core'
import { sentenceStructureRepo, writingRepo } from '@ryan/db'
import AiSettingsModal from '../writing/AiSettingsModal'
import {
  fillTemplate,
  parseTemplate,
  phrasesMatch,
} from './types'
import {
  gradeStructureWithAi,
  type StructureAiGradeResult,
} from './structureAiGrade'

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

  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiGrade, setAiGrade] = useState<StructureAiGradeResult | null>(null)
  const [showAiSettings, setShowAiSettings] = useState(false)

  useEffect(() => {
    setInputA('')
    setInputB('')
    setMatchA(false)
    setMatchB(false)
    setFlipped(false)
    setChecked(false)
    setAiGrade(null)
    setAiError(null)
    setAiLoading(false)
  }, [structureId])

  if (!item) return null

  const displayA = flipped || checked || aiGrade ? (flipped ? item.exampleA : inputA) : inputA
  const displayB = flipped || checked || aiGrade ? (flipped ? item.exampleB : inputB) : inputB
  const parts = parseTemplate(item.template)

  function clearAi() {
    setAiGrade(null)
    setAiError(null)
  }

  function handleCheck() {
    if (!inputA.trim() || !inputB.trim()) return
    const okA = phrasesMatch(inputA, item!.exampleA)
    const okB = phrasesMatch(inputB, item!.exampleB)
    setMatchA(okA)
    setMatchB(okB)
    setChecked(true)
    setFlipped(false)
    clearAi()
  }

  function handleFlip() {
    setFlipped(!flipped)
    setChecked(false)
    setMatchA(false)
    setMatchB(false)
    clearAi()
  }

  async function handleAiGrade() {
    if (!inputA.trim() || !inputB.trim() || aiLoading) return

    const provider = ((await writingRepo.getSetting('ai_provider')) as AIProvider) ?? 'openai'
    const apiKey = String((await writingRepo.getSetting(`ai_key_${provider}`)) ?? '').trim()
    if (!apiKey) {
      setShowAiSettings(true)
      return
    }

    const plan = ((await writingRepo.getSetting('plan')) as Plan) ?? 'free'
    if (!canUse(plan, 'writing_ai')) {
      setAiError('Chấm AI chỉ dành cho gói TRIAL, PRO hoặc LIFETIME.')
      return
    }

    setAiLoading(true)
    setAiError(null)
    setAiGrade(null)
    setChecked(false)
    setFlipped(false)
    try {
      const { result, tokens } = await gradeStructureWithAi(
        item!,
        inputA,
        inputB,
        apiKey,
        provider,
      )
      setAiGrade(result)
      await writingRepo.recordUsage('structure_ai', tokens)
    } catch (e) {
      setAiError(e instanceof Error ? e.message.slice(0, 220) : 'Không chấm được. Thử lại.')
    } finally {
      setAiLoading(false)
    }
  }

  const built = fillTemplate(
    item.template,
    flipped ? item.exampleA : inputA,
    flipped ? item.exampleB : inputB,
  )

  const showSlotsFilled = flipped || checked || Boolean(aiGrade)

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
            const showVal = showSlotsFilled && val.trim()
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
                onChange={e => {
                  setInputA(e.target.value)
                  setChecked(false)
                  clearAi()
                }}
                placeholder="Nhập câu / cụm từ tiếng Anh cho ô A..."
                onKeyDown={e => e.key === 'Enter' && handleCheck()}
              />
            </div>
            <div className="ss-input-row">
              <span className="ss-input-label">B</span>
              <input
                type="text"
                value={inputB}
                onChange={e => {
                  setInputB(e.target.value)
                  setChecked(false)
                  clearAi()
                }}
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
            <div className="ss-actions-right">
              <button
                type="button"
                className="ss-check-btn ss-check-btn--ghost"
                disabled={!inputA.trim() || !inputB.trim()}
                onClick={handleCheck}
                title="So khớp đúng mẫu A/B"
              >
                <Check size={16} />
                Kiểm tra mẫu
              </button>
              <button
                type="button"
                className="ss-check-btn ss-check-btn--ai"
                disabled={!inputA.trim() || !inputB.trim() || aiLoading}
                onClick={() => void handleAiGrade()}
                title="AI chấm theo cấu trúc (chấp nhận paraphrase)"
              >
                {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {aiLoading ? 'Đang chấm…' : 'AI chấm điểm'}
              </button>
            </div>
          </div>

          {checked && (
            <div className={`ss-result${matchA && matchB ? ' ss-result--ok' : ' ss-result--hint'}`}>
              <p style={{ margin: '0 0 0.35rem', fontWeight: 700 }}>
                {matchA && matchB ? '✓ Khớp đúng mẫu!' : 'So với mẫu:'}
              </p>
              <p style={{ margin: 0, fontStyle: 'italic' }}>&ldquo;{built}&rdquo;</p>
              {!(matchA && matchB) && (
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Gợi ý: A = &ldquo;{item.exampleA}&rdquo; · B = &ldquo;{item.exampleB}&rdquo;
                  {!matchA && !matchB ? '' : !matchA ? ' (ô A chưa khớp)' : ' (ô B chưa khớp)'}
                  {' · '}Dùng <strong>AI chấm điểm</strong> nếu bạn viết paraphrase khác mẫu.
                </p>
              )}
            </div>
          )}

          {aiError && (
            <div className="ss-result ss-result--hint">
              <p style={{ margin: 0, color: 'var(--color-accent)', fontWeight: 600 }}>{aiError}</p>
            </div>
          )}

          {aiGrade && (
            <div className={`ss-ai-grade${aiGrade.pass ? ' is-pass' : ' is-fail'}`}>
              <div className="ss-ai-grade__head">
                <span className="ss-ai-grade__badge">
                  <Sparkles size={14} />
                  AI chấm điểm
                </span>
                <span className={`ss-ai-grade__score${aiGrade.pass ? ' is-ok' : ''}`}>
                  {aiGrade.score.toFixed(aiGrade.score % 1 === 0 ? 0 : 1)}
                  <small>/10</small>
                </span>
                <span className={`ss-ai-grade__pass${aiGrade.pass ? ' is-ok' : ''}`}>
                  {aiGrade.pass ? 'Đạt' : 'Chưa đạt'}
                </span>
              </div>
              <p className="ss-ai-grade__sentence">&ldquo;{built}&rdquo;</p>
              <p className="ss-ai-grade__feedback">{aiGrade.feedbackVi}</p>
              {aiGrade.suggestion && (
                <p className="ss-ai-grade__tip">
                  <strong>Gợi ý:</strong> {aiGrade.suggestion}
                </p>
              )}
              {aiGrade.improvedSentence && (
                <p className="ss-ai-grade__improved">
                  <strong>Câu gợi ý:</strong> {aiGrade.improvedSentence}
                </p>
              )}
              <button
                type="button"
                className="ss-flip-btn"
                style={{ marginTop: '0.65rem' }}
                disabled={aiLoading}
                onClick={() => void handleAiGrade()}
              >
                <RefreshCw size={14} />
                Chấm lại
              </button>
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

      {showAiSettings && <AiSettingsModal onClose={() => setShowAiSettings(false)} />}
    </div>
  )
}
