import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Sparkles, Settings2, PenLine, CheckCircle2, Send, Brain, Save, Trash2,
  Clock, PauseCircle, PlayCircle, RotateCcw, ChevronRight, Pencil,
} from 'lucide-react'
import { db, writingRepo } from '@ryan/db'
import type { WritingDoc } from '@ryan/db'
import {
  callAI, type AIProvider,
  buildWritingGradePrompt, buildWritingGuidePrompt, attachGuideImage,
  providerSupportsVision, canUse, type Plan, type WritingScore, type WritingGuide,
  type CambridgeScore,
} from '@ryan/core'
import { getWritingUiConfig } from './writingUiConfig'
import { useWritingStore } from './writingStore'
import ScorePanel from './ScorePanel'
import AiSettingsModal from './AiSettingsModal'
import EditWritingPromptModal from './EditWritingPromptModal'
import WritingTopicPanel from './WritingTopicPanel'
import { useWritingTimer } from './useWritingTimer'
import './writingStudy.css'

const TYPE_CONFIG: Record<string, { label: string; target: number; color: string }> = {
  ielts_task2: { label: 'IELTS Task 2', target: 250, color: '#6366f1' },
  ielts_task1: { label: 'IELTS Task 1', target: 150, color: '#8b5cf6' },
  ielts:       { label: 'IELTS',        target: 250, color: '#6366f1' },
  master:      { label: 'Viết tự do',   target: 0,   color: '#10b981' },
  cambridge_a2: { label: 'Cambridge A2', target: 35, color: '#3b82f6' },
  cambridge_b1: { label: 'Cambridge B1', target: 100, color: '#2563eb' },
  cambridge_b2: { label: 'Cambridge B2', target: 140, color: '#1d4ed8' },
  cambridge_c1: { label: 'Cambridge C1', target: 180, color: '#1e40af' },
  cambridge_c2: { label: 'Cambridge C2', target: 250, color: '#172554' },
}

const RATE_LIMITS: Record<Plan, number> = {
  free: 0, basic: 0, trial: 5, pro: 20, lifetime: Infinity,
}

export default function WritingEditor({
  allowedTypes,
}: {
  /** Chỉ hiển thị bài thuộc track hiện tại (IELTS vs Cambridge) */
  allowedTypes?: WritingDoc['type'][]
} = {}) {
  const {
    activeDocId, score, isGrading, gradingError,
    guide, guideDocId, isGuideLoading, guideError,
    setScore, setGrading, setError, clearScore,
    setGuide, setGuideLoading, setGuideError, clearGuide,
  } = useWritingStore()
  const doc = useLiveQuery(
    () => activeDocId ? db.writingDocs.get(activeDocId) : undefined,
    [activeDocId],
  )

  const [text, setText] = useState('')
  const [showAiSettings, setShowAiSettings] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [showEditPrompt, setShowEditPrompt] = useState(false)

  const activeGuide = guideDocId === activeDocId ? guide : null

  const timer = useWritingTimer(doc?.id, doc?.type ?? '')

  useEffect(() => {
    if (doc) setText(doc.text ?? '')
  }, [doc?.id])

  useEffect(() => {
    if (!activeDocId || !doc || text === doc.text) return
    const t = setTimeout(() => writingRepo.updateDoc(activeDocId, { text }), 1500)
    return () => clearTimeout(t)
  }, [text, activeDocId, doc?.text])

  useEffect(() => {
    if (score) setShowFeedback(true)
  }, [score])

  async function saveNow() {
    if (!activeDocId || !doc) return
    await writingRepo.updateDoc(activeDocId, { text })
    setSavedFlash(true)
    window.setTimeout(() => setSavedFlash(false), 2000)
  }

  async function updateImage(dataUrl: string | undefined) {
    if (!activeDocId) return
    await writingRepo.updateDoc(activeDocId, { promptImage: dataUrl })
    if (guideDocId === activeDocId) clearGuide()
  }

  async function updatePrompt(prompt: string) {
    if (!activeDocId) return
    await writingRepo.updateDoc(activeDocId, { prompt })
    if (guideDocId === activeDocId) clearGuide()
  }

  function canRequestGuide(d = doc): boolean {
    if (!d) return false
    const hasPrompt = !!d.prompt.trim()
    const hasImage = !!d.promptImage
    if (d.type === 'ielts_task1') return hasPrompt || hasImage
    if (d.type === 'master') return hasPrompt || hasImage
    return hasPrompt
  }

  async function requestGuide() {
    if (!doc || !activeDocId || isGuideLoading) return

    if (!canRequestGuide()) {
      setGuideError('Cần nhập đề bài (Task 2) hoặc import ảnh (Task 1).')
      setGuideOpen(true)
      return
    }

    const provider = ((await writingRepo.getSetting('ai_provider')) as AIProvider) ?? 'openai'
    const apiKey = ((await writingRepo.getSetting(`ai_key_${provider}`)) as string) ?? ''
    if (!apiKey) {
      setShowAiSettings(true)
      return
    }

    const plan = ((await writingRepo.getSetting('plan')) as Plan) ?? 'pro'
    if (!canUse(plan, 'writing_ai')) {
      setGuideError('Tính năng AI chỉ dành cho gói TRIAL, PRO hoặc LIFETIME.')
      setGuideOpen(true)
      return
    }

    const limit = RATE_LIMITS[plan]
    if (limit !== Infinity) {
      const used = await writingRepo.getTodayUsage('writing_ai')
      if (used >= limit) {
        setGuideError(`Đã đạt giới hạn ${limit} lần AI/ngày (gói ${plan.toUpperCase()}).`)
        setGuideOpen(true)
        return
      }
    }

    setGuideOpen(true)
    setGuideLoading(true)
    setGuideError(null)

    try {
      const hasImage = !!doc.promptImage
      const canSeeImage = hasImage && providerSupportsVision(provider)
      let messages = buildWritingGuidePrompt(doc.type, doc.prompt, canSeeImage)
      if (canSeeImage && doc.promptImage) {
        messages = attachGuideImage(messages, doc.promptImage)
      }

      const result = await callAI(messages, apiKey, provider)
      const data = JSON.parse(result.content) as WritingGuide

      if (!data.outline?.length || !data.sampleEssay) {
        throw new Error('AI trả về dữ liệu không đầy đủ.')
      }

      setGuide(activeDocId, data)
      await writingRepo.recordUsage('writing_ai', result.inputTokens + result.outputTokens)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Lỗi không xác định'
      setGuideError(msg.slice(0, 200))
    } finally {
      setGuideLoading(false)
    }
  }

  async function grade() {
    if (!doc || !text.trim() || isGrading) return

    const provider = ((await writingRepo.getSetting('ai_provider')) as AIProvider) ?? 'openai'
    const apiKey = ((await writingRepo.getSetting(`ai_key_${provider}`)) as string) ?? ''
    if (!apiKey) {
      setShowAiSettings(true)
      return
    }

    const plan = ((await writingRepo.getSetting('plan')) as Plan) ?? 'pro'
    if (!canUse(plan, 'writing_ai')) {
      setError('Tính năng chấm điểm AI chỉ dành cho gói TRIAL, PRO hoặc LIFETIME.')
      return
    }

    const limit = RATE_LIMITS[plan]
    if (limit !== Infinity) {
      const used = await writingRepo.getTodayUsage('writing_ai')
      if (used >= limit) {
        setError(`Đã đạt giới hạn ${limit} lần/ngày (gói ${plan.toUpperCase()}).`)
        return
      }
    }

    const cached = await writingRepo.getCachedScore(text)
    if (cached) {
      setScore(cached.score as WritingScore)
      return
    }

    setGrading(true)
    setShowFeedback(true)
    try {
      const messages = buildWritingGradePrompt(doc.type, doc.prompt, text)

      const result = await callAI(messages, apiKey, provider)
      const parsed = JSON.parse(result.content) as WritingScore
      const scoreData: WritingScore = doc.type.startsWith('cambridge_')
        ? { ...(parsed as CambridgeScore), framework: 'cambridge' }
        : parsed

      await writingRepo.saveScore(doc.id, text, scoreData)
      await writingRepo.recordImprovements(scoreData.improvements ?? [])
      await writingRepo.recordUsage('writing_ai', result.inputTokens + result.outputTokens)

      setScore(scoreData)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Lỗi không xác định'
      setError(msg.slice(0, 150))
    } finally {
      setGrading(false)
    }
  }

  function clearEssay() {
    if (!text.trim()) return
    if (!confirm('Xóa toàn bộ nội dung bài viết?')) return
    setText('')
    clearScore()
  }

  const docAllowed = !allowedTypes?.length || (!!doc && allowedTypes.includes(doc.type))

  if (!activeDocId || !doc || !docAllowed) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <PenLine size={44} className="mx-auto mb-4" style={{ color: 'var(--border-color)' }} />
          <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Chọn bài viết</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Chọn hoặc tạo bài viết mới từ danh sách bên trái
          </p>
        </div>
      </div>
    )
  }

  const cfg = TYPE_CONFIG[doc.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.master
  const ui = getWritingUiConfig(doc.type)
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const isSaved = text === doc.text
  const meetsTarget = cfg.target > 0 ? wordCount >= cfg.target : true

  return (
    <div className="writing-shell">
      {/* Top bar */}
      <header className="writing-topbar">
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--wr-muted)' }}>
          <Pencil size={14} style={{ color: 'var(--wr-primary)' }} />
          <span style={{ fontWeight: 600, color: 'var(--wr-text)' }}>{cfg.label}</span>
          {(isSaved && text.length > 0) || savedFlash ? (
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--wr-success)' }}>
              <CheckCircle2 size={12} /> Đã lưu
            </span>
          ) : null}
        </div>

        {timer.enabled && (
          <div className={`writing-timer-pill${timer.urgent ? ' wr-urgent' : ''}`}>
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>Thời gian làm bài</span>
              <span className="wr-time">{timer.label}</span>
            </div>
            <span style={{ width: 1, height: 16, background: 'var(--wr-border)' }} />
            <button
              type="button"
              className="flex items-center gap-1.5"
              style={{ background: 'none', border: 'none', color: 'var(--wr-muted)', cursor: 'pointer', fontSize: '0.75rem' }}
              onClick={timer.togglePause}
            >
              {timer.paused ? <PlayCircle size={14} /> : <PauseCircle size={14} />}
              {timer.paused ? 'Tiếp tục' : 'Tạm dừng'}
            </button>
            <span style={{ width: 1, height: 16, background: 'var(--wr-border)' }} />
            <button
              type="button"
              className="flex items-center gap-1.5"
              style={{ background: 'none', border: 'none', color: 'var(--wr-muted)', cursor: 'pointer', fontSize: '0.75rem' }}
              onClick={timer.reset}
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowAiSettings(true)}
          className="writing-icon-btn"
          title="Cài đặt AI"
        >
          <Settings2 size={15} />
        </button>
      </header>

      <div className="writing-workspace">
        <WritingTopicPanel
          doc={doc}
          onImageChange={updateImage}
          onRequestGuide={() => void requestGuide()}
          guide={activeGuide}
          guideLoading={isGuideLoading}
          guideError={guideError}
          guideOpen={guideOpen}
          onToggleGuide={() => setGuideOpen(v => !v)}
          onCloseGuide={() => setGuideOpen(false)}
          onRegenerateGuide={() => void requestGuide()}
          onEditPrompt={() => setShowEditPrompt(true)}
        />

        <div className="flex flex-col gap-4 min-w-0">
          <div className="writing-editor-card">
            <div className="writing-editor-head">
              <div>
                <div className="writing-editor-kicker">
                  <Pencil size={12} />
                  {ui.kicker}
                </div>
                <h1 className="writing-editor-title">{ui.editorTitle}</h1>
              </div>
              <div className="writing-word-pill">
                <span>
                  <span className="wr-count" style={{ color: meetsTarget ? 'var(--wr-success)' : 'var(--wr-text)' }}>
                    {wordCount}
                  </span>
                  <span style={{ color: 'var(--wr-muted)', marginLeft: 4 }}>words</span>
                </span>
                {cfg.target > 0 && (
                  <>
                    <span style={{ width: 1, height: 16, background: 'var(--wr-border)' }} />
                    <span style={{ color: 'var(--wr-muted)', fontSize: '0.75rem' }}>
                      {ui.targetPrefix}:
                    </span>
                    <span className="wr-target">{cfg.target}+</span>
                  </>
                )}
              </div>
            </div>

            <div className="writing-ai-banner">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={14} />
                AI Writing Assistant
              </span>
              <button
                type="button"
                onClick={() => setShowAiSettings(true)}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {gradingError && (
              <div className="writing-error-banner" style={{ marginTop: '0.75rem' }}>
                <span>{gradingError}</span>
                <button type="button" onClick={() => setError(null)} className="text-xs underline">Đóng</button>
              </div>
            )}

            <div className="writing-textarea-wrap">
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={ui.textareaPlaceholder}
                className="writing-textarea"
              />
            </div>

            <div className="writing-action-bar">
              <button
                type="button"
                className="writing-btn-primary"
                onClick={() => void grade()}
                disabled={isGrading || !text.trim()}
              >
                <Send size={14} />
                {isGrading ? 'Đang chấm…' : ui.submitLabel}
              </button>
              <button
                type="button"
                className="writing-btn-secondary"
                onClick={() => void grade()}
                disabled={isGrading || !text.trim()}
              >
                <Brain size={14} />
                CHẤM KỸ AI
              </button>
              <button type="button" className="writing-btn-secondary" onClick={() => void saveNow()}>
                <Save size={14} />
                LƯU NHÁP
              </button>
              <button type="button" className="writing-btn-secondary wr-danger" onClick={clearEssay}>
                <Trash2 size={14} />
                XÓA
              </button>
            </div>
          </div>

          {/* Feedback / Model Answer */}
          <div className="writing-feedback-card">
            <button
              type="button"
              className="writing-feedback-head w-full text-left flex items-center justify-between"
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
              onClick={() => setShowFeedback(v => !v)}
            >
              <span>{score || isGrading ? 'AI Feedback' : 'Model Answer'}</span>
              <ChevronRight
                size={16}
                style={{
                  transform: showFeedback ? 'rotate(90deg)' : 'none',
                  transition: 'transform 0.15s',
                  color: 'var(--wr-muted)',
                }}
              />
            </button>
            {showFeedback && (
              <div className="writing-score-drawer">
                <ScorePanel
                  score={score}
                  docId={activeDocId}
                  docType={doc.type}
                  isGrading={isGrading}
                  onGrade={grade}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {showAiSettings && <AiSettingsModal onClose={() => setShowAiSettings(false)} />}

      {showEditPrompt && doc && (
        <EditWritingPromptModal
          initialPrompt={doc.prompt}
          onClose={() => setShowEditPrompt(false)}
          onSave={updatePrompt}
        />
      )}
    </div>
  )
}