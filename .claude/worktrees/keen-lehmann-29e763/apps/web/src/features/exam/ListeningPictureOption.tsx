import { useState } from 'react'
import { resolveExamMediaUrl } from './examMediaUrl'
import { useBlobMediaUrl } from './useBlobMediaUrl'
import type { ListeningQuestionOption } from './listeningExamData'

interface Props {
  option: ListeningQuestionOption
  selected: boolean
  onSelect: () => void
}

export default function ListeningPictureOption({ option, selected, onSelect }: Props) {
  const [imageFailed, setImageFailed] = useState(false)
  const imageSrc = useBlobMediaUrl(option.imageKey, resolveExamMediaUrl(option.imageUrl))
  const showImage = Boolean(imageSrc) && !imageFailed

  return (
    <button
      type="button"
      className={`listening-exam-picture${selected ? ' is-selected' : ''}`}
      onClick={onSelect}
    >
      <div className="listening-exam-picture__frame">
        {showImage ? (
          <img
            src={imageSrc!}
            alt={`Option ${option.id}: ${option.label}`}
            className="listening-exam-picture__img"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="listening-exam-picture__placeholder">
            <span className="listening-exam-picture__letter">{option.id}</span>
            <span className="listening-exam-picture__ph-label">{option.label}</span>
            {imageFailed && (
              <span className="listening-exam-picture__missing">Chưa có ảnh</span>
            )}
          </div>
        )}
      </div>
      <span className="listening-exam-picture__badge">{option.id}</span>
    </button>
  )
}