import type { ReadingExam, ReadingPassageBlock, ReadingPart } from './examData'

function hasPublicImage(block: ReadingPassageBlock | undefined): boolean {
  return Boolean(block?.imageUrl?.trim())
}

function hasText(block: ReadingPassageBlock | undefined): boolean {
  return Boolean(block?.text?.trim())
}

function isHttpOrCatalogUrl(url: string | undefined): boolean {
  if (!url?.trim()) return false
  const u = url.trim()
  return /^https?:\/\//i.test(u) || u.startsWith('/') || u.startsWith('blob:')
}

/** Chuẩn hóa URL ảnh — bare filename → /catalog/... khi biết base */
function normalizeImageUrl(
  raw: string | undefined,
  catalogFallback?: string,
  catalogBase = '/catalog/reading/ket-a2-test1',
): string | undefined {
  const u = raw?.trim()
  if (u && isHttpOrCatalogUrl(u) && !u.startsWith('blob:')) return u
  if (catalogFallback?.trim()) return catalogFallback.trim()
  if (u && !u.includes('/') && !u.includes('\\')) {
    return `${catalogBase.replace(/\/$/, '')}/${u}`
  }
  return u || undefined
}

function findSourceBlock(
  block: ReadingPassageBlock,
  blockIndex: number,
  sourcePassage: ReadingPassageBlock[],
): ReadingPassageBlock | undefined {
  const label = block.label?.trim().toLowerCase()
  if (label) {
    const byLabel = sourcePassage.find(b => b.label?.trim().toLowerCase() === label)
    if (byLabel) return byLabel
  }
  return sourcePassage[blockIndex]
}

function mergePassageBlock(
  block: ReadingPassageBlock,
  source: ReadingPassageBlock | undefined,
): ReadingPassageBlock {
  if (!source) return block

  const imageUrl = normalizeImageUrl(
    block.imageUrl?.trim() || source.imageUrl?.trim() || undefined,
    source.imageUrl,
  )
  const imageKey = imageUrl ? undefined : (block.imageKey || source.imageKey)
  const text = hasText(block) ? block.text : (source.text ?? block.text)
  const label = block.label?.trim() ? block.label : (source.label ?? block.label)

  return {
    ...block,
    text: text ?? '',
    label,
    imageUrl,
    imageKey,
  }
}

/**
 * KET A2 Part 2 — published hay chỉ còn [title + 3 ảnh không label/text]
 * (nhánh UI sign-box → user chỉ thấy ảnh, mất Angus/Frank/Zac).
 * Ghép lại: title + 3 profile (label+text catalog) + portrait theo thứ tự ảnh.
 */
export function repairKetPart2Passage(
  part: ReadingPart,
  source: ReadingPart,
): ReadingPart {
  const srcProfiles = source.passage.filter(b => Boolean(b.label?.trim()))
  if (!srcProfiles.length) {
    return {
      ...part,
      passage: part.passage.map((block, index) =>
        mergePassageBlock(block, findSourceBlock(block, index, source.passage)),
      ),
    }
  }

  const titleFromSource = source.passage.find(
    b => !b.label?.trim() && hasText(b) && !(b.imageUrl || b.imageKey),
  )
  const titleFromPart = part.passage.find(
    b => !b.label?.trim() && hasText(b) && !(b.imageUrl || b.imageKey),
  )
  const titleText = (titleFromPart?.text || titleFromSource?.text || '').trim()

  // Ảnh portrait theo thứ tự xuất hiện (bỏ title nếu lỡ có ảnh)
  const imageBlocks = part.passage.filter(b => Boolean(b.imageUrl?.trim() || b.imageKey))
  // Profile đã có label trên đề hiện tại
  const labeledOnPart = part.passage.filter(b => Boolean(b.label?.trim()))

  const passage: ReadingPassageBlock[] = []
  if (titleText) {
    passage.push({ text: titleText })
  }

  srcProfiles.forEach((src, i) => {
    const existing =
      labeledOnPart.find(b => b.label?.trim().toLowerCase() === src.label?.trim().toLowerCase())
      ?? labeledOnPart[i]
      // block cùng index nếu passage = [title, p1, p2, p3]
      ?? part.passage[titleText ? i + 1 : i]

    const imgBlock = imageBlocks[i]
    const imageUrl = normalizeImageUrl(
      existing?.imageUrl || imgBlock?.imageUrl,
      src.imageUrl,
    )
    const text = hasText(existing) ? existing!.text : src.text
    const label = existing?.label?.trim() ? existing.label : src.label

    passage.push({
      label,
      text: text ?? '',
      imageUrl,
      imageKey: imageUrl ? undefined : (existing?.imageKey || imgBlock?.imageKey),
    })
  })

  return { ...part, passage }
}

/**
 * KET A2 Part 7 — 3 ảnh story. Publish strip imageKey → broken placeholder.
 * Ưu tiên URL catalog public nếu block không có URL hợp lệ.
 */
export function repairKetPart7Passage(
  part: ReadingPart,
  source: ReadingPart,
): ReadingPart {
  const count = Math.max(part.passage.length, source.passage.length, 3)
  const passage: ReadingPassageBlock[] = []

  for (let i = 0; i < count; i += 1) {
    const block = part.passage[i]
    const src = source.passage[i]
    const catalogUrl = src?.imageUrl?.trim()
    const rawUrl = block?.imageUrl?.trim()
    // URL cloud/catalog hợp lệ giữ; bare name / trống → catalog
    let imageUrl = normalizeImageUrl(rawUrl, catalogUrl)
    if (!imageUrl && catalogUrl) imageUrl = catalogUrl
    // Fallback cứng KET test1 nếu catalog thiếu
    if (!imageUrl) {
      imageUrl = `/catalog/reading/ket-a2-test1/part7-p${i + 1}.jpg`
    }

    passage.push({
      text: block?.text ?? src?.text ?? '',
      imageUrl,
      imageKey: undefined,
    })
  }

  // Chỉ giữ tối đa số ảnh story (thường 3)
  return { ...part, passage: passage.slice(0, Math.max(3, source.passage.length)) }
}

function mergePart(part: ReadingPart, source: ReadingPart | undefined): ReadingPart {
  if (!source) return part

  if (part.partNumber === 2) {
    return repairKetPart2Passage(part, source)
  }
  if (part.partNumber === 7) {
    return repairKetPart7Passage(part, source)
  }

  let passage = part.passage.map((block, index) =>
    mergePassageBlock(block, findSourceBlock(block, index, source.passage)),
  )

  if (source.passage.length > passage.length) {
    const extra = source.passage.slice(passage.length).map(b => ({
      ...b,
      imageKey: b.imageUrl ? undefined : b.imageKey,
    }))
    passage = [...passage, ...extra]
  }

  if (!passage.length && source.passage.length) {
    passage = source.passage.map(b => ({
      ...b,
      imageKey: b.imageUrl ? undefined : b.imageKey,
    }))
  }

  // Part 1 signs: nếu vẫn thiếu imageUrl → lấy catalog
  if (part.partNumber === 1) {
    passage = passage.map((block, index) => {
      if (hasPublicImage(block)) return { ...block, imageKey: undefined }
      const src = source.passage[index]
      const imageUrl = normalizeImageUrl(block.imageUrl, src?.imageUrl)
      return {
        ...block,
        imageUrl,
        imageKey: imageUrl ? undefined : block.imageKey,
      }
    })
  }

  return {
    ...part,
    topImageUrl: part.topImageUrl?.trim() || source.topImageUrl,
    bottomImageUrl: part.bottomImageUrl?.trim() || source.bottomImageUrl,
    passage,
  }
}

/**
 * Bổ sung imageUrl / text / label thiếu từ bản fallback (thường là catalog builtin).
 */
export function fillMissingReadingMediaFromFallback(
  exam: ReadingExam,
  fallback: ReadingExam | null | undefined,
): ReadingExam {
  if (!fallback) return exam

  if (fallback.id !== exam.id) {
    const sameLevel = fallback.cambridgeLevel && fallback.cambridgeLevel === exam.cambridgeLevel
    const samePartCount = fallback.parts.length === exam.parts.length
    // KET A2: cho phép donor catalog khi cùng level dù lệch 1–2 part (5 vs 7)
    const ketLoose =
      exam.cambridgeLevel === 'a2'
      && fallback.cambridgeLevel === 'a2'
      && fallback.id.startsWith('catalog-')
    if (!sameLevel || (!samePartCount && !ketLoose)) return exam
  }

  const byPart = new Map(fallback.parts.map(p => [p.partNumber, p]))

  return {
    ...exam,
    parts: exam.parts.map(part => mergePart(part, byPart.get(part.partNumber))),
  }
}

/** Gộp media/text từ nhiều nguồn, ưu tiên giữ field đã có trên base. */
export function fillReadingExamFromSources(
  base: ReadingExam,
  sources: Array<ReadingExam | null | undefined>,
): ReadingExam {
  let next = base
  for (const src of sources) {
    if (!src || src === base) continue
    next = fillMissingReadingMediaFromFallback(next, src)
  }
  return next
}

export function countPublicPassageImages(exam: ReadingExam): number {
  return exam.parts.reduce(
    (n, p) => n + p.passage.filter(b => hasPublicImage(b)).length,
    0,
  )
}
