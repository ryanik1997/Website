import { useId, useRef } from 'react'
import { ImagePlus } from 'lucide-react'
import { useBlobMediaUrl } from '../useBlobMediaUrl'

interface Props {
  questionNumber: number
  imageKey?: string
  imageUrl?: string
  previewUrl?: string | null
  editable?: boolean
  onUpload?: (questionNumber: number, file: File) => void
}

export default function PetRwPersonPhotoSlot({
  questionNumber,
  imageKey,
  imageUrl,
  previewUrl,
  editable = false,
  onUpload,
}: Props) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const blobSrc = useBlobMediaUrl(imageKey, imageUrl)
  const src = previewUrl ?? blobSrc

  function pickFile() {
    if (!editable) return
    inputRef.current?.click()
  }

  function handleFile(file: File | undefined) {
    if (!file || !editable || !onUpload) return
    if (!/\.(jpe?g|png|webp)$/i.test(file.name) && !file.type.startsWith('image/')) return
    onUpload(questionNumber, file)
  }

  return (
    <>
      <button
        type="button"
        className={`pet-rw-person__photo-slot${src ? ' has-image' : ''}${editable ? ' is-editable' : ''}`}
        onClick={e => {
          e.stopPropagation()
          pickFile()
        }}
        disabled={!editable}
        aria-label={src ? `Ảnh câu ${questionNumber}` : `Thêm ảnh câu ${questionNumber}`}
        title={editable ? 'Bấm để chọn ảnh từ máy' : undefined}
      >
        {src ? (
          <img className="pet-rw-person__photo" src={src} alt={`Question ${questionNumber}`} />
        ) : (
          <span className="pet-rw-person__photo-empty">
            <ImagePlus size={14} aria-hidden />
          </span>
        )}
      </button>
      {editable && (
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={e => {
            handleFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      )}
    </>
  )
}