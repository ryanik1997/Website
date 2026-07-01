import type { Lesson } from '@ryan/db'
import { lessonThumbLabel, thumbColor } from './listeningUtils'

export default function ListeningLessonHeader({ lesson }: { lesson: Lesson }) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-lg font-black text-white"
        style={{ background: thumbColor(lesson.id) }}
      >
        {lessonThumbLabel(lesson)}
      </div>
      <div className="min-w-0">
        <h1
          className="text-xl sm:text-2xl font-black uppercase tracking-tight leading-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {lesson.title}
        </h1>
        <p className="text-xs font-semibold tracking-widest mt-1 uppercase" style={{ color: 'var(--text-muted)' }}>
          Listening Dictation Practice
        </p>
      </div>
    </div>
  )
}