import { useState } from 'react'
import { ChevronDown, FileText, Headphones, Play, Plus, Trash2 } from 'lucide-react'
import type { Lesson } from '@ryan/db'
import {
  type LessonBookGroup,
  getBookColor,
  bookThumbSmall,
  partLabel,
  partSentenceCount,
  testCount,
} from './listeningMeta'

interface Props {
  group: LessonBookGroup
  onStart: (lessonId: string) => void
  onAppendSentence: (lesson: Lesson) => void
  onAppendText: (lesson: Lesson) => void
  onDelete?: (lesson: Lesson) => void
  defaultExpanded?: boolean
}

export default function ListeningTopicAccordion({
  group,
  onStart,
  onAppendSentence,
  onAppendText,
  onDelete,
  defaultExpanded = false,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const color = getBookColor(group.bookNum, group.book)
  const thumbNum = bookThumbSmall(group.bookNum)
  const testNums = Object.keys(group.tests).map(Number).sort((a, b) => a - b)

  return (
    <div
      className="rounded-2xl overflow-hidden transition-shadow"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
    >
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-4 text-left hover:opacity-95 transition-opacity"
      >
        <div
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex flex-col items-center justify-center shrink-0 text-white leading-none"
          style={{ background: color }}
        >
          <span className="text-[9px] font-bold opacity-90">IELTS</span>
          <span className="text-lg font-black">{thumbNum || '·'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className="text-sm sm:text-base font-black uppercase tracking-wide truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {group.book}
          </h4>
          <p className="text-xs mt-1 flex flex-wrap items-center gap-x-3" style={{ color: 'var(--text-muted)' }}>
            <span className="inline-flex items-center gap-1">
              <FileText size={11} />
              {testCount(group)} Tests
            </span>
            <span className="inline-flex items-center gap-1">
              <Headphones size={11} />
              Listening
            </span>
          </p>
        </div>
        <ChevronDown
          size={18}
          className="shrink-0 transition-transform"
          style={{
            color: 'var(--text-muted)',
            transform: expanded ? 'rotate(180deg)' : undefined,
          }}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-4" style={{ borderTop: '1px solid var(--border-color)' }}>
          {testNums.map(test => (
            <div key={test}>
              <p
                className="text-xs font-black tracking-widest py-2 uppercase"
                style={{ color: 'var(--text-muted)' }}
              >
                Test {test}
              </p>
              <div className="flex flex-col gap-2">
                {(group.tests[test] ?? []).map(lesson => (
                  <div
                    key={lesson.id}
                    className="flex flex-wrap items-center gap-2 sm:gap-3 px-3 py-2.5 rounded-xl"
                    style={{ background: 'var(--bg-secondary)' }}
                  >
                    <FileText size={14} className="shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <span className="text-sm font-medium flex-1 min-w-[120px]" style={{ color: 'var(--text-primary)' }}>
                      {partLabel(lesson)}{' '}
                      <span className="font-normal" style={{ color: 'var(--text-muted)' }}>
                        {partSentenceCount(lesson)} câu
                      </span>
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide shrink-0"
                      style={{
                        background: 'color-mix(in srgb, var(--color-primary) 12%, var(--bg-card))',
                        color: 'var(--color-primary)',
                      }}
                    >
                      Dictation
                    </span>
                    <div className="flex items-center gap-1 ml-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => onAppendSentence(lesson)}
                        title="Thêm câu"
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors hover:opacity-80"
                        style={{
                          background: 'color-mix(in srgb, var(--color-accent) 14%, var(--bg-card))',
                          color: 'var(--color-accent)',
                        }}
                      >
                        <Plus size={12} className="inline -mt-0.5 mr-0.5" />
                        Thêm câu
                      </button>
                      <button
                        type="button"
                        onClick={() => onAppendText(lesson)}
                        title="Thêm văn bản"
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors hover:opacity-80"
                        style={{
                          background: 'color-mix(in srgb, var(--color-primary) 14%, var(--bg-card))',
                          color: 'var(--color-primary)',
                        }}
                      >
                        + Văn bản
                      </button>
                      {onDelete && lesson.category === 'user' && (
                        <button
                          type="button"
                          onClick={() => onDelete(lesson)}
                          className="p-1.5 rounded-lg"
                          style={{ color: 'var(--color-accent)' }}
                          title="Xóa"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onStart(lesson.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-opacity hover:opacity-90"
                        style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
                      >
                        <Play size={12} />
                        Bắt đầu
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}