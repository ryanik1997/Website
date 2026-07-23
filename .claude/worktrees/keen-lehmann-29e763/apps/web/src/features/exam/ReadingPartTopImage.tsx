import { useRef } from 'react'
import { ImageIcon, Upload } from 'lucide-react'

interface Props {
  partNumber: number
  imageUrl?: string
  placement?: 'top' | 'bottom'
  onPick?: (file: File) => void
  onClear?: () => void
}

export default function ReadingPartTopImage({
  partNumber,
  imageUrl,
  placement = 'top',
  onPick,
  onClear,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isBottom = placement === 'bottom'
  const rootClass = `reading-test-part-top-image${isBottom ? ' reading-test-part-top-image--bottom' : ''}`

  return (
    <div className={rootClass} data-highlight-skip>
      {imageUrl ? (
        <figure className="reading-test-part-top-image__figure">
          <img
            src={imageUrl}
            alt={`Passage ${partNumber} — ${isBottom ? 'diagram cuối trang' : 'diagram'}`}
            className="reading-test-part-top-image__img"
          />
          {onPick && (
            <div className="reading-test-part-top-image__actions">
              <button
                type="button"
                className="reading-test-part-top-image__btn"
                onClick={() => inputRef.current?.click()}
              >
                <Upload size={12} />
                Đổi ảnh
              </button>
              {onClear && (
                <button
                  type="button"
                  className="reading-test-part-top-image__btn reading-test-part-top-image__btn--muted"
                  onClick={onClear}
                >
                  Xóa
                </button>
              )}
            </div>
          )}
        </figure>
      ) : onPick ? (
        <button
          type="button"
          className="reading-test-part-top-image__slot"
          onClick={() => inputRef.current?.click()}
          title={
            isBottom
              ? `Thêm ảnh cuối Passage ${partNumber} (diagram / bảng / map)`
              : `Thêm ảnh đầu Passage ${partNumber} (diagram / bảng)`
          }
        >
          <ImageIcon size={16} />
          <span>{isBottom ? 'Ảnh cuối trang' : 'Ảnh đầu trang'}</span>
          <span className="reading-test-part-top-image__hint">Import từ máy (Admin)</span>
        </button>
      ) : null}
      {onPick && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.jpg,.jpeg,.png,.webp,.gif"
          className="reading-test-part-top-image__input"
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