import { useCallback, useEffect } from 'react'
import ListeningExamAudioBar from './ListeningExamAudioBar'
import ListeningPictureOption from './ListeningPictureOption'
import type { ListeningExamMode, ListeningQuestion } from './listeningExamData'
import { useExamQuestionAudio } from './useExamQuestionAudio'
import { useListeningPlayLimits } from './useListeningPlayLimits'

interface Props {
  question: ListeningQuestion
  answer: string
  unsure: boolean
  examMode?: ListeningExamMode
  onAnswer: (value: string) => void
  onUnsureChange: (value: boolean) => void
}

export default function ListeningQuestionCard({
  question,
  answer,
  unsure,
  examMode = 'practice',
  onAnswer,
  onUnsureChange,
}: Props) {
  const {
    playing,
    buffering,
    progressPct,
    timeLabel,
    play,
    seekToPct,
    stopPlayback,
  } = useExamQuestionAudio()

  const { canPlay, playsLeft, recordPlay } = useListeningPlayLimits(examMode)
  const playKey = `q-${question.id}`
  const maxPlays = examMode === 'exam' ? 3 : undefined

  const audioSource = {
    audioKey: question.audioKey,
    audioUrl: question.audioUrl,
    ttsText: question.ttsText,
  }
  const hasAudioFile = Boolean(question.audioKey || question.audioUrl)
  const left = playsLeft(playKey, maxPlays)
  const blocked = !canPlay(playKey, maxPlays)

  const makePlayOpts = useCallback((rate: number) => ({
    rate,
    allowSeek: examMode === 'practice',
    beforePlay: () => canPlay(playKey, maxPlays),
    onPlayCounted: () => recordPlay(playKey),
  }), [canPlay, examMode, maxPlays, playKey, recordPlay])

  useEffect(() => {
    stopPlayback()
  }, [question.id, stopPlayback])

  const isPictureMc = question.type === 'picture-mc'

  return (
    <article className="listening-exam-card">
      <header className="listening-exam-card__head">
        <h2 className="listening-exam-card__qnum">Question {question.number}</h2>
        <label className="listening-exam-card__unsure">
          <input
            type="checkbox"
            checked={unsure}
            onChange={e => onUnsureChange(e.target.checked)}
          />
          Chưa chắc chắn
        </label>
      </header>

      <p className="listening-exam-card__prompt">{question.prompt}</p>

      <ListeningExamAudioBar
        source={audioSource}
        playing={playing}
        buffering={buffering}
        progressPct={progressPct}
        timeLabel={timeLabel}
        hasAudioFile={hasAudioFile}
        allowSeek={examMode === 'practice'}
        allowSlow={examMode === 'practice'}
        playsLeft={left}
        playBlocked={blocked}
        onPlayNormal={() => void play(audioSource, makePlayOpts(1))}
        onPlaySlow={() => void play(audioSource, makePlayOpts(0.75))}
        onSeek={pct => seekToPct(pct, examMode === 'practice')}
        onStop={stopPlayback}
      />

      {isPictureMc && (
        <div className="listening-exam-card__pictures">
          {question.options.map(option => (
            <ListeningPictureOption
              key={option.id}
              option={option}
              selected={answer === option.id}
              onSelect={() => onAnswer(option.id)}
            />
          ))}
        </div>
      )}

      <div className={`listening-exam-card__options${isPictureMc ? ' is-picture' : ''}`}>
        {question.options.map(option => {
          const selected = answer === option.id
          return (
            <label
              key={option.id}
              className={`listening-exam-option${selected ? ' is-selected' : ''}`}
            >
              <input
                type="radio"
                name={question.id}
                checked={selected}
                onChange={() => onAnswer(option.id)}
              />
              <span className="listening-exam-option__letter">{option.id}</span>
              {!isPictureMc && (
                <span className="listening-exam-option__label">{option.label}</span>
              )}
            </label>
          )
        })}
      </div>
    </article>
  )
}