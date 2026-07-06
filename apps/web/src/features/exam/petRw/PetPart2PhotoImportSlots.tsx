import { useEffect, useMemo, useState } from 'react'
import PetRwPersonPhotoSlot from './PetRwPersonPhotoSlot'
import { personImageFileForQuestion } from './petRwPassageUtils'

function normalizeFileKey(name: string): string {
  return name.trim().toLowerCase().replace(/\\/g, '/').split('/').pop() ?? name
}

interface Props {
  mediaFiles: File[]
  onAssignPhoto: (questionNumber: number, file: File) => void
}

const QUESTION_NUMBERS = [6, 7, 8, 9, 10] as const

export default function PetPart2PhotoImportSlots({ mediaFiles, onAssignPhoto }: Props) {
  const [previewUrls, setPreviewUrls] = useState<Record<number, string>>({})

  const fileByQuestion = useMemo(() => {
    const map = new Map<number, File>()
    for (const n of QUESTION_NUMBERS) {
      const expected = personImageFileForQuestion(n)
      const hit = mediaFiles.find(f => normalizeFileKey(f.name) === expected)
      if (hit) map.set(n, hit)
    }
    return map
  }, [mediaFiles])

  useEffect(() => {
    const next: Record<number, string> = {}
    const created: string[] = []
    for (const n of QUESTION_NUMBERS) {
      const file = fileByQuestion.get(n)
      if (file) {
        const url = URL.createObjectURL(file)
        next[n] = url
        created.push(url)
      }
    }
    setPreviewUrls(next)
    return () => {
      for (const url of created) URL.revokeObjectURL(url)
    }
  }, [fileByQuestion])

  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: 'var(--border-color)' }}
    >
      <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
        Part 2 — ảnh người (Q6–10)
      </p>
      <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        Bấm từng ô 2×3.5 cm để chèn ảnh JPG — lưu thành <code>part2-q6.jpg</code> … <code>part2-q10.jpg</code>
      </p>
      <div className="pet-rw-import-photos">
        {QUESTION_NUMBERS.map(n => (
          <div key={n} className="pet-rw-import-photos__item">
            <PetRwPersonPhotoSlot
              questionNumber={n}
              previewUrl={previewUrls[n] ?? null}
              editable
              onUpload={onAssignPhoto}
            />
            <span className="pet-rw-import-photos__label">Q{n}</span>
          </div>
        ))}
      </div>
    </div>
  )
}