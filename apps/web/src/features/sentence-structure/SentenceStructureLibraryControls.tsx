import { ArrowLeft, ArrowRight, History, Search, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { LearningStatus } from '@ryan/db'
import { CEFR_LABELS, CEFR_LEVELS, type CefrLevel } from '../../lib/cefr'
import { STRUCTURE_CATEGORIES } from './types'
import { LEARNING_STATUS_LABELS, type LearningStatusFilter, type StatusCounts } from './structureLibrary'

export function SentenceStructureToolbar({
  query,
  cefr,
  category,
  status,
  resultCount,
  historyCount,
  onQueryChange,
  onCefrChange,
  onCategoryChange,
  onStatusChange,
}: {
  query: string
  cefr: CefrLevel | undefined
  category: string
  status: LearningStatusFilter
  resultCount: number
  historyCount: number
  onQueryChange: (query: string) => void
  onCefrChange: (cefr: CefrLevel | undefined) => void
  onCategoryChange: (category: string) => void
  onStatusChange: (status: LearningStatusFilter) => void
}) {
  return (
    <div className="ss-library-toolbar" aria-label="Bộ lọc cấu trúc câu">
      <div className="ss-library-toolbar__primary">
        <label className="ss-hub-search">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={event => onQueryChange(event.target.value)}
            placeholder="Tìm theo tên, mẫu câu, chủ đề…"
            aria-label="Tìm cấu trúc câu"
          />
        </label>
        <div className="ss-cefr-segments" aria-label="Lọc theo CEFR">
          <button type="button" className={!cefr ? 'is-active' : ''} onClick={() => onCefrChange(undefined)}>Tất cả CEFR</button>
          {CEFR_LEVELS.map(level => (
            <button
              key={level}
              type="button"
              className={cefr === level ? 'is-active' : ''}
              title={CEFR_LABELS[level]}
              aria-pressed={cefr === level}
              onClick={() => onCefrChange(level)}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
      <div className="ss-library-toolbar__secondary">
        <select value={status} aria-label="Lọc theo trạng thái học tập" onChange={event => onStatusChange(event.target.value as LearningStatusFilter)}>
          <option value="">Tất cả trạng thái</option>
          {(Object.entries(LEARNING_STATUS_LABELS) as Array<[LearningStatus, string]>).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select value={category} aria-label="Lọc theo nhóm cấu trúc" onChange={event => onCategoryChange(event.target.value)}>
          <option value="">Tất cả nhóm</option>
          {STRUCTURE_CATEGORIES.map(item => <option key={item.id} value={item.label}>{item.label}</option>)}
        </select>
        <output className="ss-hub-count" aria-live="polite">{resultCount.toLocaleString('vi-VN')} kết quả</output>
        <Link to="/app/sentence-structure/history" className="ss-history-toggle">
          <History size={15} aria-hidden="true" />
          Lịch sử{historyCount > 0 ? ` · ${historyCount}` : ''}
        </Link>
      </div>
    </div>
  )
}

export function SavedStructuresCard({ counts, onOpen }: { counts: StatusCounts; onOpen: () => void }) {
  return (
    <button type="button" className="ss-saved-card" onClick={onOpen}>
      <span className="ss-saved-card__icon"><Star size={20} fill="currentColor" aria-hidden="true" /></span>
      <span className="ss-saved-card__body">
        <span className="ss-saved-card__title">Cấu trúc đã lưu</span>
        <span className="ss-saved-card__stats">
          {counts.learning} đang học · {counts.learned} đã học · {counts.not_started} chưa học
        </span>
        <span className="ss-saved-card__cta">Xem tất cả <ArrowRight size={14} aria-hidden="true" /></span>
      </span>
      <strong>{counts.total.toLocaleString('vi-VN')}</strong>
    </button>
  )
}

export function SavedViewHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="ss-saved-view-head">
      <div>
        <span>Thư viện cá nhân</span>
        <h1>Cấu trúc đã lưu</h1>
      </div>
      <button type="button" onClick={onClose}><ArrowLeft size={15} aria-hidden="true" /> Tất cả cấu trúc</button>
    </div>
  )
}

export function EmptySavedStructures() {
  return (
    <div className="ss-empty-saved">
      <Star size={24} aria-hidden="true" />
      <strong>Bạn chưa lưu cấu trúc nào.</strong>
      <span>Nhấn biểu tượng ngôi sao trên một cấu trúc để lưu lại.</span>
    </div>
  )
}
