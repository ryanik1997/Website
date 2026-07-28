import { Headphones, Play } from 'lucide-react'

interface Props {
  onPlay: () => void
  /** exam mode: nhắc không pause/rewind */
  examMode?: 'practice' | 'exam'
}

/**
 * Overlay trước khi làm Listening (IELTS + Cambridge) — giống Cambridge computer-based:
 * dim nền, icon tai nghe, hướng dẫn, nút Play.
 */
export default function ListeningExamStartOverlay({ onPlay, examMode = 'practice' }: Props) {
  const isExam = examMode === 'exam'

  return (
    <div className="listening-exam-start-overlay" role="dialog" aria-modal="true" aria-labelledby="listening-start-title">
      <div className="listening-exam-start-overlay__panel">
        <div className="listening-exam-start-overlay__icon" aria-hidden>
          <Headphones size={72} strokeWidth={1.5} />
        </div>
        <p id="listening-start-title" className="listening-exam-start-overlay__text">
          {isExam
            ? 'You will be listening to an audio clip during this test. You will not be permitted to pause or rewind the audio while answering the questions.'
            : 'You will be listening to an audio clip during this test. In practice mode you can pause and seek the audio while answering the questions.'}
        </p>
        <p className="listening-exam-start-overlay__hint">To continue, click Play.</p>
        <button
          type="button"
          className="listening-exam-start-overlay__play"
          onClick={onPlay}
        >
          <Play size={18} className="listening-exam-start-overlay__play-icon" fill="currentColor" />
          Play
        </button>
      </div>
    </div>
  )
}
