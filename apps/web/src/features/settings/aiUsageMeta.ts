/** Feature keys ghi vào Dexie `aiUsage` — dashboard Cài đặt → AI. */
export const AI_USAGE_FEATURE_META: ReadonlyArray<{
  id: string
  label: string
  /** Mô tả ngắn */
  hint: string
}> = [
  { id: 'writing_ai', label: 'Writing', hint: 'Chấm / gợi ý bài viết' },
  { id: 'structure_ai', label: 'Cấu trúc câu', hint: 'AI chấm điền A / B' },
  { id: 'mindmap_ai', label: 'MindMap', hint: 'Mở rộng nhánh AI' },
  { id: 'dictionary_ai', label: 'Từ điển', hint: 'Tra từ bằng AI' },
  { id: 'exam_ai', label: 'Luyện thi', hint: 'Phân tích đáp án sau submit' },
  { id: 'reading_pdf_import', label: 'Import Reading', hint: 'PDF / Vision OCR' },
  { id: 'listening_transcribe', label: 'Import Listening', hint: 'Chuyển giọng nói → text' },
]

export type AiUsageFeatureId = (typeof AI_USAGE_FEATURE_META)[number]['id']
