/** Drag payload shared across PET Part 2 and Part 4 matching tasks */
export type PetRwDragPayload =
  | { source: 'bank'; optionId: string }
  | { source: 'gap'; optionId: string; sourceQuestionId: string }

// Values match legacy Part 4 MIME types for drag compatibility
export const PET_RW_DND_MIME = 'application/x-pet-reading-part4-option'
export const PET_RW_GAP_MIME = 'application/x-pet-part4-gap'

export function writePetRwDragPayload(dataTransfer: DataTransfer, payload: PetRwDragPayload) {
  dataTransfer.setData(PET_RW_DND_MIME, JSON.stringify(payload))
  dataTransfer.setData('text/plain', payload.optionId)
  if (payload.source === 'gap') {
    dataTransfer.setData(PET_RW_GAP_MIME, '1')
  }
  dataTransfer.effectAllowed = 'move'
}

export function readPetRwDragPayload(dataTransfer: DataTransfer): PetRwDragPayload | null {
  const raw = dataTransfer.getData(PET_RW_DND_MIME)
  if (raw) {
    try {
      const v = JSON.parse(raw) as Partial<PetRwDragPayload>
      if (v.source === 'bank' && typeof v.optionId === 'string') {
        return { source: 'bank', optionId: v.optionId }
      }
      if (v.source === 'gap' && typeof v.optionId === 'string' && typeof v.sourceQuestionId === 'string') {
        return { source: 'gap', optionId: v.optionId, sourceQuestionId: v.sourceQuestionId }
      }
    } catch {
      /* invalid JSON */
    }
  }
  const legacy = dataTransfer.getData('text/plain')
  return legacy ? { source: 'bank', optionId: legacy } : null
}
