import { useState } from 'react'
import { ChevronDown, FileText, Headphones, Play, Plus } from 'lucide-react'
import type { Lesson } from '@ryan/db'
import {
  type LessonBookGroup,
  bookThumbSmall,
  getBookColor,
  partLabel,
  partSentenceCount,
  testCount,
} from './listeningMeta'
import type { ListeningLibraryViewMode } from './ListeningUserLessonCard'

interface Props {
  group: LessonBookGroup
  viewMode?: ListeningLibraryViewMode
  onStart: (lessonId: string) => void
  onAppendSentence: (lesson: Lesson) => void
  onAppendText: (lesson: Lesson) => void
  defaultExpanded?: boolean
}

export default function ListeningTopicAccordion({
  group,
  viewMode = 'list',
  onStart,
  onAppendSentence,
  onAppendText,
  defaultExpanded = false,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const color = getBookColor(group.bookNum, group.book)
  const thumbNum = bookThumbSmall(group.bookNum)
  const testNums = Object.keys(group.tests).map(Number).sort((a, b) => a - b)
  const gridColumns = viewMode === 'grid'
    ? 'grid-cols-1 lg:grid-cols-2'
    : viewMode === 'compact'
      ? 'grid-cols-1'
      : 'grid-cols-1'

  return (
    <div
      className="overflow-hidden rounded-2xl transition-shadow"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
    >
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="flex w-full items-center gap-3 px-4 py-4 text-left transition-opacity hover:opacity-95"
      >
        <div
          className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl text-white leading-none sm:h-16 sm:w-16"
          style={{ background: color }}
        >
          <span className="text-[9px] font-bold opacity-90">IELTS</span>
          <span className="text-lg font-black">{thumbNum || '·'}</span>
        </div>

        <div className="min-w-0 flex-1">
          <h4
            className="truncate text-sm font-black uppercase tracking-wide sm:text-base"
            style={{ color: 'var(--text-primary)' }}
          >
            {group.book}
          </h4>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 text-xs" style={{ color: 'var(--text-muted)' }}>
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
        <div className="flex flex-col gap-4 px-4 pb-4" style={{ borderTop: '1px solid var(--border-color)' }}>
          {testNums.map(test => (
            <div key={test}>
              <p
                className="py-2 text-xs font-black uppercase tracking-widest"
                style={{ color: 'var(--text-muted)' }}
              >
                Test {test}
              </p>

              <div className={`grid gap-2 ${gridColumns}`}>
                {(group.tests[test] ?? []).map(lesson => (
                  <div
                    key={lesson.id}
                    className={`rounded-xl ${viewMode === 'compact' ? 'px-3 py-2.5' : 'px-3 py-3'}`}
                    style={{ background: 'var(--bg-secondary)' }}
                  >
                    <div className={`flex ${viewMode === 'compact' ? 'items-center gap-2' : 'flex-wrap items-center gap-2 sm:gap-3'}`}>
                      <FileText size={14} className="shrink-0" style={{ color: 'var(--text-muted)' }} />
                      <span className="min-w-[120px] flex-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {partLabel(lesson)}{' '}
                        <span className="font-normal" style={{ color: 'var(--text-muted)' }}>
                          {partSentenceCount(lesson)} câu
                        </span>
                      </span>

                      {viewMode !== 'compact' && (
                        <span
                          className="shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                          style={{
                            background: 'color-mix(in srgb, var(--color-primary) 12%, var(--bg-card))',
                            color: 'var(--color-primary)',
                          }}
                        >
                          Dictation
                        </span>
                      )}

                      <div className={`flex items-center gap-1 ${viewMode === 'compact' ? 'ml-auto' : 'ml-auto shrink-0'}`}>
                        {viewMode !== 'compact' && (
                          <>
                            <button
                              type="button"
                              onClick={() => onAppendSentence(lesson)}
                              title="Thêm câu"
                              className="rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors hover:opacity-80"
                              style={{
                                background: 'color-mix(in srgb, var(--color-accent) 14%, var(--bg-card))',
                                color: 'var(--color-accent)',
                              }}
                            >
                              <Plus size={12} className="mr-0.5 inline -mt-0.5" />
                              Thêm câu
                            </button>
                            <button
                              type="button"
                              onClick={() => onAppendText(lesson)}
                              title="Thêm văn bản"
                              className="rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors hover:opacity-80"
                              style={{
                                background: 'color-mix(in srgb, var(--color-primary) 14%, var(--bg-card))',
                                color: 'var(--color-primary)',
                              }}
                            >
                              + Văn bản
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => onStart(lesson.id)}
                          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-opacity hover:opacity-90"
                          style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
                        >
                          <Play size={12} />
                          Bắt đầu
                        </button>
                      </div>
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
