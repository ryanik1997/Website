import { Link } from 'react-router-dom'
import type { Lesson } from '@ryan/db'
import { ExternalLink } from 'lucide-react'
import { lessonThumbLabel, thumbColor } from './listeningUtils'

export default function ListeningLessonHeader({ lesson }: { lesson: Lesson }) {
  const examHref = lesson.sourceExamId
    ? `/app/exam/listening/${lesson.sourceExamId}`
    : null

  return (
    <div className="listening-bao-card mb-6 flex items-start gap-4 p-4 sm:p-5">
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-black text-white"
        style={{ background: thumbColor(lesson.id) }}
      >
        {lessonThumbLabel(lesson)}
      </div>
      <div className="min-w-0 flex-1">
        <h1
          className="text-xl font-black uppercase leading-tight tracking-tight sm:text-2xl"
          style={{ color: 'var(--text-primary)' }}
        >
          {lesson.title}
        </h1>
        <p className="mt-1 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          {lesson.source === 'exam' ? 'Dictation · từ đề exam' : 'Listening Dictation Practice'}
          {lesson.linkedAudioKey || lesson.linkedAudioUrl ? ' · audio đề' : ''}
        </p>
        {examHref && (
          <Link
            to={examHref}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold"
            style={{ color: 'var(--color-primary)' }}
          >
            <ExternalLink size={13} />
            Mở đề exam
            {lesson.part != null ? ` · Part ${lesson.part}` : ''}
          </Link>
        )}
      </div>
    </div>
  )
}
