const ACCEPTED = new Set(['image/jpeg', 'image/jpg', 'image/webp'])
const MAX_BYTES = 4 * 1024 * 1024
const MAX_DIM = 960

export function isWritingImageFile(file: File): boolean {
  const t = file.type.toLowerCase()
  if (ACCEPTED.has(t)) return true
  const ext = file.name.split('.').pop()?.toLowerCase()
  return ext === 'jpg' || ext === 'jpeg' || ext === 'webp'
}

export async function readWritingImage(file: File): Promise<string> {
  if (!isWritingImageFile(file)) {
    throw new Error('Chỉ hỗ trợ ảnh JPG hoặc WEBP.')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Ảnh quá lớn (tối đa 4 MB).')
  }

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Không thể xử lý ảnh.')

  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()

  const preferWebp = file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp')
  const mime = preferWebp ? 'image/webp' : 'image/jpeg'
  const quality = preferWebp ? 0.82 : 0.85

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Nén ảnh thất bại.'))), mime, quality)
  })

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Đọc ảnh thất bại.'))
    reader.readAsDataURL(blob)
  })
}