import type { ReactNode } from 'react'
import ListeningExamAudioBar from './ListeningExamAudioBar'
import ExamHighlightZone from './ExamHighlightZone'
import ExamHighlightableLines from './ExamHighlightableLines'
import type { ExamAudioSource } from './useExamQuestionAudio'
import type { ListeningPart, ListeningQuestion } from './listeningExamData'

interface AudioBarProps {
  source: ExamAudioSource
  playing: boolean
  buffering: boolean
  progressPct: number
  timeLabel: string
  hasAudioFile: boolean
  allowSeek: boolean
  playsLeft?: number | null
  playBlocked: boolean
  playError?: string | null
  onPlayNormal: () => void
  onSeek: (pct: number) => void
  onStop: () => void
}

interface Props {
  part: ListeningPart
  questions: ListeningQuestion[]
  answers: Record<string, string>
  activeQuestionId: string | null
  audioBar: AudioBarProps
  onAnswer: (questionId: string, value: string) => void
  onSelectQuestion: (questionId: string) => void
  resizer: ReactNode
}

function promptBase(prompt: string): string {
  return prompt
    .trim()
    .toLowerCase()
    .replace(/\s*\(\d{1,2}\)\s*$/g, '')
    .replace(/:+\s*$/g, '')
    .trim()
}

/** Dòng form gap / trùng label câu → không render lại trong instruction. */
function isDuplicateFormLine(line: string, questions: ListeningQuestion[]): boolean {
  const t = line.trim()
  if (!t) return false
  if (/\(\d{1,2}\)/.test(t)) return true
  const lower = t.toLowerCase()
  return questions.some(q => {
    const base = promptBase(q.prompt)
    if (!base) return false
    return lower === base || lower.startsWith(`${base}:`) || lower.startsWith(`${base} `)
  })
}

function splitGapPrompt(question: ListeningQuestion): { lead: string; trail: string } {
  if (question.gapLead != null || question.gapTrail != null) {
    return {
      lead: (question.gapLead ?? question.prompt).trim(),
      trail: (question.gapTrail ?? '').trim(),
    }
  }
  const prompt = question.prompt
  const [lead = prompt, ...trail] = prompt.split(/(?:\.\.\.|…)/)
  return {
    lead: lead.trim(),
    trail: trail.join(' ').trim(),
  }
}

export default function ListeningKetGapFillPartView({
  part,
  questions,
  answers,
  activeQuestionId,
  audioBar,
  onAnswer,
  onSelectQuestion,
  resizer,
}: Props) {
  const rawInstruction = part.instruction ?? ''
  const lines = rawInstruction.split(/\n/).map(l => l.trim())

  // Intro = các dòng đầu trước form (You will hear…)
  const introLines: string[] = []
  const staticLines: string[] = []
  let hitForm = false
  for (const line of lines) {
    if (!line) {
      if (!hitForm && introLines.length) introLines.push('')
      continue
    }
    if (isDuplicateFormLine(line, questions)) {
      hitForm = true
      continue
    }
    // Dòng tĩnh "Name of other team: Tigers"
    if (line.includes(':') && !/\(\d{1,2}\)/.test(line)) {
      const after = line.split(':').slice(1).join(':').trim()
      if (after && !isDuplicateFormLine(line, questions)) {
        hitForm = true
        staticLines.push(line)
        continue
      }
    }
    if (!hitForm) introLines.push(line)
  }

  const leadInstruction = introLines.filter(Boolean)[0] ?? ''
  const restIntro = introLines.slice(1).join('\n').replace(/\n{3,}/g, '\n\n').trim()
  const formTitle = part.passageTitle?.trim()

  return (
    <>
      <ExamHighlightZone className="listening-ket-cambridge__stage listening-ket-gapfill__prompt">
        <div className="listening-ket-cambridge__instruction-card">
          <strong>{part.rangeLabel}</strong>
          {leadInstruction && <span>{leadInstruction}</span>}
        </div>

        {restIntro && (
          <ExamHighlightableLines
            blockIdPrefix={`${part.id}-instruction`}
            text={restIntro}
            lineClassName="listening-ket-gapfill__instruction"
          />
        )}

        {(formTitle || staticLines.length > 0 || questions.length > 0) && (
          <div className="listening-ket-gapfill__form">
            {formTitle && (
              <p className="listening-ket-gapfill__form-title">{formTitle}</p>
            )}
            {staticLines.map((line, i) => (
              <p key={`static-${i}`} className="listening-ket-gapfill__static-row">
                {line}
              </p>
            ))}

            <div className="listening-ket-gapfill__fields">
              {questions.map(question => {
                const isActive = activeQuestionId === question.id
                const { lead, trail } = splitGapPrompt(question)
                return (
                  <div
                    key={question.id}
                    className={`listening-ket-gapfill__field${isActive ? ' is-active' : ''}`}
                  >
                    <label
                      className="listening-ket-gapfill__label"
                      htmlFor={`ket-gap-${question.id}`}
                      onClick={() => onSelectQuestion(question.id)}
                    >
                      <span className="listening-ket-gapfill__prompt-text">{lead}</span>
                      <input
                        id={`ket-gap-${question.id}`}
                        type="text"
                        className="listening-ket-gapfill__input"
                        value={answers[question.id] ?? ''}
                        placeholder={`${question.number}`}
                        data-highlight-skip
                        onFocus={() => onSelectQuestion(question.id)}
                        onChange={e => onAnswer(question.id, e.target.value)}
                      />
                      {trail && <span className="listening-ket-gapfill__trail">{trail}</span>}
                    </label>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="listening-ket-cambridge__audio">
          <ListeningExamAudioBar {...audioBar} />
        </div>
      </ExamHighlightZone>
      {resizer}
    </>
  )
}
