import { examRepo } from '@ryan/db'
import { supabase } from '../../lib/supabase'
import type { ReadingExam } from './examData'
import { examRecordFromReading, resolveReadingExam } from './examLoader'

export type ReadingExamImageSlot = 'top' | 'bottom' | 'passage' | 'group'

export interface ReadingExamCloudImage {
  id: string
  examId: string
  partNumber: number
  slot: ReadingExamImageSlot
  itemIndex: number | null
  storagePath: string
  publicUrl: string
}

const BUCKET = 'reading-exam-media'

function sanitizeExamId(examId: string): string {
  return examId.replace(/[^a-zA-Z0-9._-]+/g, '_')
}

function fileExtension(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  if (fromName && ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fromName)) {
    return fromName === 'jpeg' ? 'jpg' : fromName
  }
  const mime = file.type.split('/')[1]
  if (mime === 'jpeg') return 'jpg'
  return mime || 'jpg'
}

export function readingExamImageStoragePath(
  examId: string,
  partNumber: number,
  slot: ReadingExamImageSlot,
  itemIndex?: number,
  ext = 'jpg',
): string {
  const base = sanitizeExamId(examId)
  if (slot === 'top') return `${base}/part${partNumber}-top.${ext}`
  if (slot === 'bottom') return `${base}/part${partNumber}-bottom.${ext}`
  if (slot === 'passage') return `${base}/part${partNumber}-passage-${itemIndex ?? 0}.${ext}`
  return `${base}/part${partNumber}-group-${itemIndex ?? 0}.${ext}`
}

function rowToImage(row: {
  id: string
  exam_id: string
  part_number: number
  slot: string
  item_index: number | null
  storage_path: string
  public_url: string
}): ReadingExamCloudImage {
  return {
    id: row.id,
    examId: row.exam_id,
    partNumber: row.part_number,
    slot: row.slot as ReadingExamImageSlot,
    itemIndex: row.item_index,
    storagePath: row.storage_path,
    publicUrl: row.public_url,
  }
}

export async function listReadingExamCloudImages(examId: string): Promise<ReadingExamCloudImage[]> {
  const { data, error } = await supabase
    .from('reading_exam_images')
    .select('id, exam_id, part_number, slot, item_index, storage_path, public_url')
    .eq('exam_id', examId)
    .order('part_number')
    .order('slot')

  if (error) throw new Error(error.message)
  return (data ?? []).map(row => rowToImage(row as Parameters<typeof rowToImage>[0]))
}

export async function uploadReadingExamCloudImage(
  examId: string,
  partNumber: number,
  slot: ReadingExamImageSlot,
  file: File,
  itemIndex?: number,
): Promise<ReadingExamCloudImage> {
  const ext = fileExtension(file)
  const storagePath = readingExamImageStoragePath(examId, partNumber, slot, itemIndex, ext)

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { upsert: true, contentType: file.type || undefined })

  if (uploadError) throw new Error(uploadError.message)

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
  const publicUrl = urlData.publicUrl

  let existingQuery = supabase
    .from('reading_exam_images')
    .select('id')
    .eq('exam_id', examId)
    .eq('part_number', partNumber)
    .eq('slot', slot)

  existingQuery = itemIndex == null
    ? existingQuery.is('item_index', null)
    : existingQuery.eq('item_index', itemIndex)

  const { data: existing } = await existingQuery.maybeSingle()

  if (existing?.id) {
    const { data, error } = await supabase
      .from('reading_exam_images')
      .update({ storage_path: storagePath, public_url: publicUrl })
      .eq('id', existing.id)
      .select('id, exam_id, part_number, slot, item_index, storage_path, public_url')
      .single()

    if (error) throw new Error(error.message)
    return rowToImage(data as Parameters<typeof rowToImage>[0])
  }

  const { data: userData } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('reading_exam_images')
    .insert({
      exam_id: examId,
      part_number: partNumber,
      slot,
      item_index: itemIndex ?? null,
      storage_path: storagePath,
      public_url: publicUrl,
      created_by: userData.user?.id ?? null,
    })
    .select('id, exam_id, part_number, slot, item_index, storage_path, public_url')
    .single()

  if (error) throw new Error(error.message)
  return rowToImage(data as Parameters<typeof rowToImage>[0])
}

export async function deleteReadingExamCloudImage(image: ReadingExamCloudImage): Promise<void> {
  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .remove([image.storagePath])

  if (storageError) throw new Error(storageError.message)

  const { error } = await supabase
    .from('reading_exam_images')
    .delete()
    .eq('id', image.id)

  if (error) throw new Error(error.message)
}

export function partPlacementImageUrl(
  images: ReadingExamCloudImage[],
  partNumber: number,
  slot: 'top' | 'bottom',
): string | undefined {
  return images.find(img => img.partNumber === partNumber && img.slot === slot)?.publicUrl
}

export function groupImageUrl(
  images: ReadingExamCloudImage[],
  partNumber: number,
  groupIndex: number,
): string | undefined {
  return images.find(
    img => img.partNumber === partNumber && img.slot === 'group' && img.itemIndex === groupIndex,
  )?.publicUrl
}

export function passageBlockImageUrl(
  images: ReadingExamCloudImage[],
  partNumber: number,
  blockIndex: number,
): string | undefined {
  return images.find(
    img => img.partNumber === partNumber && img.slot === 'passage' && img.itemIndex === blockIndex,
  )?.publicUrl
}

/** Gắn public_url từ cloud vào exam (mọi user thấy cùng ảnh). */
export function mergeReadingCloudImages(exam: ReadingExam, images: ReadingExamCloudImage[]): ReadingExam {
  if (!images.length) return exam

  return {
    ...exam,
    parts: exam.parts.map(part => ({
      ...part,
      topImageUrl: partPlacementImageUrl(images, part.partNumber, 'top') ?? part.topImageUrl,
      bottomImageUrl: partPlacementImageUrl(images, part.partNumber, 'bottom') ?? part.bottomImageUrl,
      passage: part.passage.map((block, blockIndex) => {
        const cloudUrl = passageBlockImageUrl(images, part.partNumber, blockIndex)
        if (!cloudUrl) return block
        return { ...block, imageUrl: cloudUrl, imageKey: undefined }
      }),
      questionGroups: part.questionGroups.map((group, groupIndex) => {
        const cloudUrl = groupImageUrl(images, part.partNumber, groupIndex)
        if (!cloudUrl) return group
        return { ...group, imageUrl: cloudUrl, imageKey: undefined }
      }),
    })),
  }
}

/** Lưu URL ảnh đầu/cuối passage vào Dexie overlay (fallback khi builtin catalog). */
export async function persistReadingPlacementImage(
  examId: string,
  partNumber: number,
  slot: 'top' | 'bottom',
  publicUrl: string | undefined,
): Promise<void> {
  const exam = await resolveReadingExam(examId)
  if (!exam) return

  const parts = exam.parts.map(part => {
    if (part.partNumber !== partNumber) return part
    return slot === 'top'
      ? { ...part, topImageUrl: publicUrl }
      : { ...part, bottomImageUrl: publicUrl }
  })

  const existing = await examRepo.get(examId)
  if (existing) {
    await examRepo.update(examId, { parts: parts as unknown[] })
    return
  }

  await examRepo.create(examRecordFromReading({ ...exam, parts }, 'manual', 'cloud-images'))
}