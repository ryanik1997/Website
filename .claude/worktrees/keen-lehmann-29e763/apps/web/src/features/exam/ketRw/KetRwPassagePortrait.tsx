import { useRef } from 'react'
import { ImageIcon, Upload, X } from 'lucide-react'
import { useBlobMediaUrl } from '../useBlobMediaUrl'

interface Props {
  /** Label profile (Angus / Frank / …) — alt text */
  personLabel?: string
  imageKey?: string
  imageUrl?: string
  /** Chỉ Admin: hiện ô import / đổi / xóa */
  canEdit?: boolean
  onPick?: (file: File) => void
  onClear?: () => void
}

/**
 * Ô ảnh chân dung trước mỗi đoạn Part 2 KET A2.
 * Kích thước cố định 2.5cm × 3.5cm (rộng × cao).
 * Admin thấy nút import; user chỉ thấy ảnh khi đã có.
 */
export default function KetRwPassagePortrait({
  personLabel,
  imageKey,
  imageUrl,
  canEdit = false,
  onPick,
  onClear,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const src = useBlobMediaUrl(imageKey, imageUrl)
  const alt = personLabel ? `Photo — ${personLabel}` : 'Profile photo'

  // User không edit và không có ảnh → không render gì
  if (!src && !canEdit) return null

  return (
    <div className="ket-rw-portrait" data-highlight-skip>
      {src ? (
        <figure className="ket-rw-portrait__figure">
          <img src={src} alt={alt} className="ket-rw-portrait__img" />
          {canEdit && onPick && (
            <div className="ket-rw-portrait__actions">
              <button
                type="button"
                className="ket-rw-portrait__btn"
                onClick={() => inputRef.current?.click()}
                title="Đổi ảnh"
              >
                <Upload size={11} />
                Đổi
              </button>
              {onClear && (
                <button
                  type="button"
                  className="ket-rw-portrait__btn ket-rw-portrait__btn--muted"
                  onClick={onClear}
                  title="Xóa ảnh"
                >
                  <X size={11} />
                  Xóa
                </button>
              )}
            </div>
          )}
        </figure>
      ) : (
        <button
          type="button"
          className="ket-rw-portrait__slot"
          onClick={() => inputRef.current?.click()}
          title={personLabel ? `Import ảnh ${personLabel} (Admin)` : 'Import ảnh (Admin)'}
        >
          <ImageIcon size={14} />
          <span className="ket-rw-portrait__slot-label">Ảnh</span>
          <span className="ket-rw-portrait__slot-hint">Admin</span>
        </button>
      )}
      {canEdit && onPick && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.jpg,.jpeg,.png,.webp,.gif"
          className="ket-rw-portrait__input"
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) onPick(file)
            e.target.value = ''
          }}
        />
      )}
    </div>
  )
}
