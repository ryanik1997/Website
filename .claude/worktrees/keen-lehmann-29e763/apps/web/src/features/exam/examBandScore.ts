/**
 * Ước lượng band IELTS Academic từ số câu đúng / tổng (thường /40).
 * Bảng tham chiếu phổ biến cho Reading & Listening — không thay official conversion.
 */
export function estimateIeltsBandFromRaw(correct: number, total: number): number {
  if (total <= 0) return 0
  // Chuẩn hóa về thang 40
  const raw = Math.round((correct / total) * 40)
  const clamped = Math.max(0, Math.min(40, raw))
  // Approximate Academic Reading/Listening conversion
  const table: Array<[number, number]> = [
    [39, 9.0],
    [37, 8.5],
    [35, 8.0],
    [33, 7.5],
    [30, 7.0],
    [27, 6.5],
    [23, 6.0],
    [19, 5.5],
    [15, 5.0],
    [13, 4.5],
    [10, 4.0],
    [8, 3.5],
    [6, 3.0],
    [4, 2.5],
    [2, 2.0],
    [1, 1.0],
    [0, 0],
  ]
  for (const [minRaw, band] of table) {
    if (clamped >= minRaw) return band
  }
  return 0
}

export function formatIeltsBand(band: number): string {
  if (band <= 0) return '—'
  return band % 1 === 0 ? `${band}.0` : band.toFixed(1)
}

export function resultEncouragement(correct: number, total: number): string {
  if (total <= 0) return 'Làm xong rồi — nghỉ một chút rồi ôn lại nhé!'
  const ratio = correct / total
  if (ratio >= 0.9) return 'Không còn là làm bài nữa, đây là trình độ hủy diệt 🔥'
  if (ratio >= 0.75) return 'Rất ổn! Giữ nhịp này là band cao trong tầm tay.'
  if (ratio >= 0.6) return 'Khá tốt — ôn lại chỗ sai là tiến nhanh.'
  if (ratio >= 0.4) return 'Đã cố gắng! Xem bài giải và làm lại những dạng yếu.'
  return 'Đừng nản — mỗi lần làm là một lần tiến bộ. Xem lại đáp án nhé!'
}
