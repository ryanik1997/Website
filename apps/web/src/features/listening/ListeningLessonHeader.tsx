import type { Lesson } from '@ryan/db'
import { lessonThumbLabel, thumbColor } from './listeningUtils'

export default function ListeningLessonHeader({ lesson }: { lesson: Lesson }) {
  return (
    <div className="mb-6 flex items-start gap-4">
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
          Listening Dictation Practice
        </p>
      </div>
    </div>
  )
}
