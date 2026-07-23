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

/** Chuẩn hóa URL ảnh — bare filename → catalog base (nếu có), không hardcode Test 1. */
function normalizeImageUrl(
  raw: string | undefined,
  catalogFallback?: string,
  catalogBase?: string,
): string | undefined {
  const u = raw?.trim()
  if (u && isHttpOrCatalogUrl(u) && !u.startsWith('blob:')) return u
  if (catalogFallback?.trim() && isHttpOrCatalogUrl(catalogFallback.trim())) {
    return catalogFallback.trim()
  }
  if (u && catalogBase && !u.includes('/') && !u.includes('\\')) {
    return `${catalogBase.replace(/\/$/, '')}/${u}`
  }
  // bare filename + fallback bare/path
  if (catalogFallback?.trim()) return catalogFallback.trim()
  return u || undefined
}

function extractCatalogBase(url: string | undefined): string | undefined {
  const u = url?.trim()
  if (!u || !u.startsWith('/catalog/')) return undefined
  const parts = u.split('/')
  // /catalog/reading/{slug}/file.jpg
  if (parts.length >= 5) return parts.slice(0, 4).join('/')
  return undefined
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
 * KET A2 Part 7 — 1 ảnh full strip (part7-page.jpg) HOẶC 2–3 panel riêng.
 * Không ép 3 slot, không hardcode ảnh Test 1.
 */
export function repairKetPart7Passage(
  part: ReadingPart,
  source: ReadingPart,
): ReadingPart {
  const sourceImages = source.passage.filter(
    b => hasPublicImage(b) || Boolean(b.imageKey?.trim()),
  )
  const partImages = part.passage.filter(
    b => hasPublicImage(b) || Boolean(b.imageKey?.trim()),
  )
  const catalogBase =
    extractCatalogBase(partImages[0]?.imageUrl)
    ?? extractCatalogBase(sourceImages[0]?.imageUrl)

  // Đề đã có ảnh: giữ số block (1 strip hoặc N panel), chỉ vá URL hỏng / bare name
  if (partImages.length > 0 || part.passage.some(b => hasText(b))) {
    const blocks = part.passage.length ? part.passage : partImages
    const passage = blocks.map((block, i) => {
      const src = source.passage[i] ?? sourceImages[i]
      let imageUrl = normalizeImageUrl(
        block.imageUrl?.trim(),
        src?.imageUrl?.trim(),
        catalogBase,
      )
      if (!imageUrl && src?.imageUrl?.trim()) {
        imageUrl = normalizeImageUrl(undefined, src.imageUrl.trim(), catalogBase)
      }
      const imageKey = imageUrl ? undefined : (block.imageKey || src?.imageKey)
      return {
        text: block.text ?? src?.text ?? '',
        imageUrl,
        imageKey,
      }
    })
    // Bỏ block rỗng do pad 3-slot cũ (không ảnh, không text)
    const cleaned = passage.filter(
      b => hasPublicImage(b) || Boolean(b.imageKey?.trim()) || hasText(b),
    )
    return { ...part, passage: cleaned.length ? cleaned : passage }
  }

  // Local trống → copy đúng ảnh từ source (cùng đề), không Test 1 cứng
  if (sourceImages.length > 0) {
    return {
      ...part,
      passage: sourceImages.map(b => ({
        text: b.text ?? '',
        imageUrl: normalizeImageUrl(b.imageUrl, undefined, catalogBase) ?? b.imageUrl,
        imageKey: undefined,
      })),
    }
  }

  return part
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

  /**
   * KHÔNG nối thêm block passage từ catalog/donor khi đề local đã có nội dung.
   * Bug: KET Test 2 Part 4 (1 đoạn Nobel + gap 19–24) + catalog Test 1 (3 block Oymyakon
   * cũng gap 19–24) → double inline MC 19–24 sau fillReadingExamFromSources.
   * Chỉ vá ảnh/text thiếu trên block hiện có; append chỉ khi local trống hoàn toàn.
   */
  const localHasContent = passage.some(
    b => hasText(b) || hasPublicImage(b) || Boolean(b.imageKey) || Boolean(b.label?.trim()),
  )
  const localHasGapMarkers = passage.some(b => /\(\d+\)/.test(b.text ?? ''))

  if (!localHasContent && source.passage.length) {
    passage = source.passage.map(b => ({
      ...b,
      imageKey: b.imageUrl ? undefined : b.imageKey,
    }))
  } else if (
    !localHasGapMarkers
    && !localHasContent
    && source.passage.length > passage.length
  ) {
    const extra = source.passage.slice(passage.length).map(b => ({
      ...b,
      imageKey: b.imageUrl ? undefined : b.imageKey,
    }))
    passage = [...passage, ...extra]
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
    // Cùng Book + Test trong title (tránh Book 4 Test 1 ← Book 1 / Book 5 Test 1)
    const testOf = (t: string) => t.toLowerCase().match(/\btest\s*(\d+)\b/)?.[1]
    const bookOf = (t: string) => t.toLowerCase().match(/\bbook\s*(\d+)\b/)?.[1]
    const sameTest =
      !testOf(exam.title)
      || !testOf(fallback.title)
      || testOf(exam.title) === testOf(fallback.title)
    const sameBook =
      !bookOf(exam.title)
      || !bookOf(fallback.title)
      || bookOf(exam.title) === bookOf(fallback.title)
    // KET A2: donor catalog cùng level + cùng Book + cùng Test (chỉ vá ảnh)
    const ketLoose =
      exam.cambridgeLevel === 'a2'
      && fallback.cambridgeLevel === 'a2'
      && fallback.id.startsWith('catalog-')
      && sameTest
      && sameBook
    if (!sameLevel || (!samePartCount && !ketLoose)) return exam
    if ((!sameTest || !sameBook) && !samePartCount) return exam
    // Cùng số part nhưng khác Book/Test → không ghép media (tránh Part 7 dính ảnh đề khác)
    if (samePartCount && (!sameTest || !sameBook) && fallback.id !== exam.id) return exam
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
