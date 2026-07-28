import { useState } from 'react'
import { resolveExamMediaUrl } from './examMediaUrl'
import { useBlobMediaUrl } from './useBlobMediaUrl'
import type { ListeningQuestion } from './listeningExamData'

interface Props {
  question: ListeningQuestion
  className?: string
}

export default function ListeningPictureBoard({ question, className }: Props) {
  const [failed, setFailed] = useState(false)
  const src = useBlobMediaUrl(
    question.pictureImageKey,
    resolveExamMediaUrl(question.pictureImageUrl),
  )
  const showImage = Boolean(src) && !failed

  return (
    <div className={`listening-picture-board${className ? ` ${className}` : ''}`}>
      {showImage ? (
        <img
          src={src!}
          alt={`Câu ${question.number} — tranh A, B, C`}
          className="listening-picture-board__img"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="listening-picture-board__placeholder">
          <p className="listening-picture-board__placeholder-title">Chưa có tranh câu {question.number}</p>
          <p className="listening-picture-board__placeholder-hint">
            Thêm file <code>q{question.number}.jpg</code> (một ảnh chứa A, B, C) vào bundle import.
          </p>
        </div>
      )}
    </div>
  )
}