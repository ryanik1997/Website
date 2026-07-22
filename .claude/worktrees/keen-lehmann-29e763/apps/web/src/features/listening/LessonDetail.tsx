import { useLiveQuery } from 'dexie-react-hooks'
import { Play, Headphones } from 'lucide-react'
import { db } from '@ryan/db'
import { useListeningStore } from './listeningStore'
import { parseSentences } from './types'
import { speak, checkTtsHealth } from './tts'
import { useEffect, useState } from 'react'

export default function LessonDetail() {
  const { activeLessonId, startStudy } = useListeningStore()
  const [localTtsReady, setLocalTtsReady] = useState<boolean | null>(null)

  useEffect(() => {
    void checkTtsHealth().then(setLocalTtsReady)
  }, [])
  const lesson = useLiveQuery(
    () => activeLessonId ? db.lessons.get(activeLessonId) : undefined,
    [activeLessonId],
  )

  if (!activeLessonId || !lesson) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <Headphones size={44} className="mx-auto mb-4" style={{ color: 'var(--border-color)' }} />
          <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Chọn bài nghe</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Chọn một bài từ danh sách bên trái để xem chi tiết
          </p>
        </div>
      </div>
    )
  }

  const sentences = parseSentences(lesson.sentences)
  const due = sentences.filter(s => s.dueAt <= Date.now()).length
  const doneCount = sentences.filter(s => s.reps > 0).length
  const newCount = sentences.filter(s => s.state === 'new').length

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div
        className="px-6 py-4 border-b shrink-0"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold mb-1 truncate" style={{ color: 'var(--text-primary)' }}>
              {lesson.title}
            </h2>
            <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: 'var(--text-muted)' }}>
              <span>{sentences.length} câu</span>
              {due > 0 && <span style={{ color: '#f97316' }}>• {due} cần ôn</span>}
              {doneCount > 0 && <span>• {doneCount} đã học</span>}
              {newCount > 0 && <span>• {newCount} mới</span>}
              {localTtsReady === false && (
                <span style={{ color: 'var(--color-accent)' }}>• TTS local chưa sẵn sàng (fallback trình duyệt)</span>
              )}
            </div>
          </div>
          <button
            onClick={startStudy}
            disabled={sentences.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white font-medium shrink-0 disabled:opacity-40"
            style={{ background: 'var(--color-primary)' }}
          >
            <Play size={14} />
            Luyện nghe
          </button>
        </div>

        {/* Progress bar */}
        {doneCount > 0 && (
          <div className="mt-3">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.round((doneCount / sentences.length) * 100)}%`, background: 'var(--color-primary)' }}
              />
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {Math.round((doneCount / sentences.length) * 100)}% đã học
            </p>
          </div>
        )}
      </div>

      {/* Sentence list */}
      <div className="flex-1 overflow-y-auto p-6">
        {sentences.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>Bài này chưa có câu nào.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {sentences.map((s, i) => {
              const isDue = s.dueAt <= Date.now()
              const stateColor = s.state === 'new' ? '#94a3b8' : isDue ? '#f97316' : '#22c55e'
              const stateLabel = s.state === 'new' ? 'Mới' : isDue ? 'Đến hạn' : 'Đã học'

              return (
                <div
                  key={s.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                >
                  <span
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
                  >
                    {i + 1}
                  </span>
                  <p className="flex-1 text-sm" style={{ color: 'var(--text-primary)' }}>{s.text}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: `${stateColor}22`, color: stateColor }}
                    >
                      {stateLabel}
                    </span>
                    <button
                      onClick={() => { void speak(s.text) }}
                      className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-secondary)]"
                      style={{ color: 'var(--text-muted)' }}
                      title="Nghe câu này"
                    >
                      <Play size={13} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
