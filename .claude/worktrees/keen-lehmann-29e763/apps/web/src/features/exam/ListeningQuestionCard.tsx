import { useCallback } from 'react'
import ListeningExamAudioBar from './ListeningExamAudioBar'
import ListeningPictureBoard from './ListeningPictureBoard'
import ListeningPictureChoiceRow from './ListeningPictureChoiceRow'
import ListeningPictureOption from './ListeningPictureOption'
import {
  usesCompositePictureBoard,
  usesSplitPictureOptions,
} from './listeningPictureMc'
import type { ExamAudioSource } from './useExamQuestionAudio'
import type { ListeningExamMode, ListeningQuestion } from './listeningExamData'
import { useExamQuestionAudio } from './useExamQuestionAudio'
import { useListeningPlayLimits } from './useListeningPlayLimits'

interface Props {
  question: ListeningQuestion
  answer: string
  unsure: boolean
  examMode?: ListeningExamMode
  partInstruction?: string
  partAudioSource?: ExamAudioSource
  onAnswer: (value: string) => void
  onUnsureChange: (value: boolean) => void
}

export default function ListeningQuestionCard({
  question,
  answer,
  unsure,
  examMode = 'practice',
  partInstruction,
  partAudioSource,
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
    playError,
  } = useExamQuestionAudio()

  const { canPlay, playsLeft, recordPlay } = useListeningPlayLimits(examMode)
  const playKey = `q-${question.id}`
  const maxPlays = examMode === 'exam' ? 3 : undefined

  const audioSource: ExamAudioSource = {
    audioKey: question.audioKey ?? partAudioSource?.audioKey,
    audioUrl: question.audioUrl ?? partAudioSource?.audioUrl,
    ttsText: question.ttsText ?? partAudioSource?.ttsText,
  }
  const hasAudioFile = Boolean(audioSource.audioKey || audioSource.audioUrl)
  const left = playsLeft(playKey, maxPlays)
  const blocked = !canPlay(playKey, maxPlays)

  const makePlayOpts = useCallback((rate: number) => ({
    rate,
    allowSeek: examMode === 'practice',
    beforePlay: () => canPlay(playKey, maxPlays),
    onPlayCounted: () => recordPlay(playKey),
  }), [canPlay, examMode, maxPlays, playKey, recordPlay])

  const isPictureMc = question.type === 'picture-mc'
  const isGapFill = question.type === 'gap-fill'
  const isMatching = question.type === 'matching'
  const isMc = !isGapFill && !isMatching && !isPictureMc
  const wordLimit = question.wordLimit ?? (isGapFill ? 3 : undefined)

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

      {partInstruction && (
        <p className="listening-exam-card__instruction">{partInstruction}</p>
      )}

      <p className="listening-exam-card__prompt">{question.prompt}</p>

      {isPictureMc && usesCompositePictureBoard(question) && (
        <ListeningPictureBoard question={question} />
      )}

      <ListeningExamAudioBar
        source={audioSource}
        playing={playing}
        buffering={buffering}
        progressPct={progressPct}
        timeLabel={timeLabel}
        hasAudioFile={hasAudioFile}
        allowSeek={examMode === 'practice'}
        playsLeft={left}
        playBlocked={blocked}
        playError={playError}
        onPlayNormal={() => void play(audioSource, makePlayOpts(1))}
        onSeek={pct => seekToPct(pct, examMode === 'practice')}
        onStop={stopPlayback}
      />

      {isPictureMc && usesCompositePictureBoard(question) && (
        <ListeningPictureChoiceRow
          options={question.options}
          answer={answer}
          onAnswer={onAnswer}
        />
      )}

      {isPictureMc && usesSplitPictureOptions(question) && (
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

      {isPictureMc && !usesCompositePictureBoard(question) && !usesSplitPictureOptions(question) && (
        <ListeningPictureChoiceRow
          options={question.options}
          answer={answer}
          onAnswer={onAnswer}
          showLabels
        />
      )}

      {isGapFill && (
        <div className="listening-exam-card__gap">
          <input
            type="text"
            className="listening-ielts-gap__input"
            value={answer}
            placeholder={wordLimit ? `Tối đa ${wordLimit} từ` : 'Nhập đáp án'}
            onChange={e => onAnswer(e.target.value)}
          />
        </div>
      )}

      {isMatching && (
        <div className="listening-exam-card__matching">
          <div className="listening-ielts-match__pills">
            {question.options.map(option => {
              const selected = answer === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`listening-ielts-match__pill${selected ? ' is-selected' : ''}`}
                  onClick={() => onAnswer(option.id)}
                >
                  {option.id}. {option.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {isMc && (
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
      )}
    </article>
  )
}