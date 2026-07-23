import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronDown, Lightbulb, Loader2, Play } from 'lucide-react'
import { db } from '@ryan/db'
import type { IeltsGenre, IeltsTrackSlug } from '../ieltsCatalog'
import { useWritingStore } from '../writingStore'
import { startTidTask, useTidTasks } from './promptBank'
import './promptBank.css'

/** Dải đề gợi ý từ ngân hàng đề, lọc đúng track + genre đang mở. */
export default function PromptSuggestPanel({
  track,
  genre,
}: {
  track: IeltsTrackSlug
  genre: IeltsGenre
}) {
  const { tasks } = useTidTasks()
  const { setActiveDoc } = useWritingStore()
  const [open, setOpen] = useState(false)
  const [startingId, setStartingId] = useState<string | null>(null)

  const startedPrompts = useLiveQuery(
    async () => new Set((await db.writingDocs.toArray()).map(d => d.prompt)),
    [],
  )

  const suggestions = useMemo(() => {
    if (!tasks || track === 'free') return []
    return tasks.filter(
      t => t.taskType === track && t.genre === genre && !startedPrompts?.has(t.prompt),
    )
  }, [tasks, track, genre, startedPrompts])

  if (suggestions.length === 0) return null

  async function onStart(taskId: string) {
    const task = suggestions.find(t => t.id === taskId)
    if (!task || startingId) return
    setStartingId(task.id)
    try {
      const id = await startTidTask(task)
      setActiveDoc(id)
    } finally {
      setStartingId(null)
    }
  }

  return (
    <div className="pb-suggest">
      <button type="button" className="pb-suggest-toggle" onClick={() => setOpen(o => !o)}>
        <Lightbulb size={14} />
        Đề gợi ý ({suggestions.length})
        <ChevronDown size={14} className={open ? 'pb-suggest-chev is-open' : 'pb-suggest-chev'} />
      </button>
      {open && (
        <div className="pb-suggest-list">
          {suggestions.slice(0, 30).map(task => (
            <div key={task.id} className="pb-suggest-item">
              {task.image && <img src={task.image} alt="" loading="lazy" />}
              <div className="pb-suggest-text">
                <span className="pb-suggest-title">{task.title}</span>
                <span className="pb-suggest-prompt">{task.prompt}</span>
              </div>
              <button
                type="button"
                className="pb-start"
                disabled={startingId !== null}
                onClick={() => void onStart(task.id)}
              >
                {startingId === task.id ? (
                  <Loader2 size={13} className="pb-spin" />
                ) : (
                  <Play size={13} />
                )}
                Luyện
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
