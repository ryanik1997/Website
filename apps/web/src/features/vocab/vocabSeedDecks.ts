import { db } from '@ryan/db'

export interface SeedDeckDef {
  name: string
  description: string
  color: string
  icon: string
  words: number
}

export interface SeedGroupDef {
  id: string
  name: string
  order: number
  decks: SeedDeckDef[]
}

export const PRESET_GROUP_IDS = ['ielts', 'oxford', 'toeic', 'academic', 'sat', 'toefl'] as const
export type PresetGroupId = (typeof PRESET_GROUP_IDS)[number]

export const GROUP_LABELS: Record<PresetGroupId, string> = {
  ielts: 'IELTS',
  oxford: 'Oxford',
  toeic: 'TOEIC',
  academic: 'Học thuật',
  sat: 'SAT',
  toefl: 'TOEFL',
}

const IELTS_DECKS: SeedDeckDef[] = [
  { name: 'Môi trường', description: 'Biến đổi khí hậu, tài nguyên và phát triển bền vững.', color: '#4CAF82', icon: '🌿', words: 100 },
  { name: 'Công nghệ', description: 'Thuật ngữ công nghệ, AI và chuyển đổi số.', color: '#2EC4B6', icon: '💻', words: 99 },
  { name: 'Xã hội & Văn hóa', description: 'Cộng đồng, bản sắc và các vấn đề xã hội.', color: '#E05C5C', icon: '🏛️', words: 101 },
  { name: 'Lịch sử & Khảo cổ học', description: 'Văn minh, di sản và khám phá khảo cổ học.', color: '#E09B3D', icon: '🏺', words: 100 },
  { name: 'Kinh tế & Kinh doanh', description: 'Thị trường, thương mại và tài chính.', color: '#E05C8A', icon: '💼', words: 100 },
  { name: 'Sức khỏe & Y tế', description: 'Y học, dịch tễ và lối sống lành mạnh.', color: '#5B8DD9', icon: '⚕️', words: 100 },
  { name: 'Giáo dục & Tâm lý học', description: 'Học tập, nhận thức và hành vi con người.', color: '#9B59B6', icon: '📚', words: 100 },
  { name: 'Đô thị & Kiến trúc', description: 'Quy hoạch, xây dựng và không gian sống.', color: '#1BA39C', icon: '🏙️', words: 100 },
]

const OXFORD_DECKS: SeedDeckDef[] = [
  { name: 'Đời sống hằng ngày', description: 'Giao tiếp, thói quen và tình huống sinh hoạt.', color: '#3D8B7A', icon: '🏠', words: 120 },
  { name: 'Du lịch & Văn hóa', description: 'Khám phá, phong tục và trải nghiệm địa phương.', color: '#D4A03C', icon: '✈️', words: 110 },
  { name: 'Công việc & Sự nghiệp', description: 'Văn phòng, phỏng vấn và phát triển nghề nghiệp.', color: '#4A6FA5', icon: '👔', words: 115 },
  { name: 'Học đường', description: 'Lớp học, kỳ thi và kỹ năng học tập.', color: '#7B5EA7', icon: '🎓', words: 105 },
  { name: 'Ẩm thực & Sức khỏe', description: 'Nấu ăn, dinh dưỡng và lối sống lành mạnh.', color: '#E07A5F', icon: '🥗', words: 100 },
  { name: 'Thiên nhiên', description: 'Động vật, thời tiết và môi trường sống.', color: '#52B788', icon: '🌳', words: 98 },
  { name: 'Nghệ thuật & Giải trí', description: 'Âm nhạc, phim ảnh và sở thích cá nhân.', color: '#C77DFF', icon: '🎭', words: 102 },
  { name: 'Khoa học phổ thông', description: 'Khái niệm khoa học cơ bản trong đời sống.', color: '#4895EF', icon: '🔬', words: 108 },
]

const TOEIC_DECKS: SeedDeckDef[] = [
  { name: 'Văn phòng & Họp', description: 'Email, lịch họp và giao tiếp nội bộ.', color: '#2563EB', icon: '📋', words: 150 },
  { name: 'Công tác & Du lịch', description: 'Đặt phòng, sân bay và lịch trình kinh doanh.', color: '#0891B2', icon: '🧳', words: 130 },
  { name: 'Tài chính & Ngân hàng', description: 'Ngân sách, thanh toán và báo cáo tài chính.', color: '#059669', icon: '🏦', words: 140 },
  { name: 'Marketing & Bán hàng', description: 'Khách hàng, quảng cáo và chốt deal.', color: '#DB2777', icon: '📈', words: 135 },
  { name: 'Nhân sự', description: 'Tuyển dụng, lương thưởng và đào tạo.', color: '#7C3AED', icon: '👥', words: 125 },
  { name: 'Sản xuất & Logistics', description: 'Kho hàng, vận chuyển và chuỗi cung ứng.', color: '#B45309', icon: '🏭', words: 128 },
  { name: 'Hợp đồng & Pháp lý', description: 'Thương lượng, điều khoản và tuân thủ.', color: '#4B5563', icon: '⚖️', words: 120 },
  { name: 'CNTT doanh nghiệp', description: 'Phần mềm, bảo mật và hạ tầng công ty.', color: '#0D9488', icon: '🖥️', words: 132 },
]

const ACADEMIC_DECKS: SeedDeckDef[] = [
  { name: 'Phương pháp nghiên cứu', description: 'Giả thuyết, mẫu thử và đánh giá kết quả.', color: '#5C4D7D', icon: '🔍', words: 110 },
  { name: 'Viết học thuật', description: 'Luận văn, trích dẫn và cấu trúc bài viết.', color: '#3D5A80', icon: '✍️', words: 115 },
  { name: 'Thống kê & Dữ liệu', description: 'Biến số, tương quan và diễn giải số liệu.', color: '#2A9D8F', icon: '📊', words: 105 },
  { name: 'Triết học', description: 'Lý thuyết, luận điểm và tư duy phản biện.', color: '#6D597A', icon: '💭', words: 100 },
  { name: 'Xã hội học', description: 'Cấu trúc xã hội, văn hóa và hành vi tập thể.', color: '#E76F51', icon: '🌐', words: 108 },
  { name: 'Sinh học', description: 'Tế bào, hệ sinh thái và tiến hóa.', color: '#43AA8B', icon: '🧬', words: 112 },
  { name: 'Vật lý', description: 'Lực, năng lượng và mô hình vật chất.', color: '#577590', icon: '⚛️', words: 102 },
  { name: 'Kinh tế học', description: 'Cung cầu, thị trường và chính sách vĩ mô.', color: '#F4A261', icon: '📉', words: 110 },
]

const SAT_DECKS: SeedDeckDef[] = [
  { name: 'Đọc hiểu SAT', description: 'Từ vựng văn bản học thuật và suy luận.', color: '#1D3557', icon: '📖', words: 200 },
  { name: 'Toán SAT', description: 'Đại số, hình học và thuật ngữ bài toán.', color: '#457B9D', icon: '➗', words: 150 },
  { name: 'Khoa học SAT', description: 'Sinh, hóa, vật lý trong đoạn đọc ngắn.', color: '#2A9D8F', icon: '🧪', words: 130 },
  { name: 'Lịch sử & Chính trị', description: 'Hiến pháp, sự kiện và tư tưởng Mỹ.', color: '#BC6C25', icon: '🗽', words: 120 },
  { name: 'Văn học', description: 'Ẩn dụ, giọng điệu và phân tích tác phẩm.', color: '#9B2226', icon: '📜', words: 125 },
  { name: 'Ngữ pháp nền', description: 'Cấu trúc câu, liên từ và sửa lỗi.', color: '#6A4C93', icon: '✏️', words: 110 },
  { name: 'Lập luận', description: 'Bằng chứng, giả định và suy diễn logic.', color: '#386641', icon: '🧩', words: 115 },
  { name: 'Chuẩn bị đại học', description: 'Từ khóa đại học, campus và đơn xin học.', color: '#E09F3E', icon: '🎯', words: 105 },
]

const TOEFL_DECKS: SeedDeckDef[] = [
  { name: 'Đời sống campus', description: 'Ký túc xá, câu lạc bộ và sinh hoạt sinh viên.', color: '#0077B6', icon: '🏫', words: 130 },
  { name: 'Bài giảng & Ghi chú', description: 'Nghe hiểu, khái niệm và tóm tắt bài học.', color: '#00B4D8', icon: '🎧', words: 140 },
  { name: 'Khoa học TOEFL', description: 'Thí nghiệm, giả thuyết và thuật ngữ lab.', color: '#48CAE4', icon: '🔭', words: 135 },
  { name: 'Khoa học xã hội', description: 'Tâm lý, nhân chủng và nghiên cứu xã hội.', color: '#90E0EF', icon: '🧠', words: 128 },
  { name: 'Kỹ năng tích hợp', description: 'Đọc-nghe-nói-viết trong một chủ đề.', color: '#023E8A', icon: '🔗', words: 120 },
  { name: 'Ngữ cảnh nghe', description: 'Hội thoại, thông báo và hướng dẫn.', color: '#0096C7', icon: '🔊', words: 125 },
  { name: 'Chủ đề Speaking', description: 'Ý kiến, so sánh và giải thích quan điểm.', color: '#ADE8F4', icon: '🗣️', words: 115 },
  { name: 'Chủ đề Writing', description: 'Luận điểm, ví dụ và kết luận bài luận.', color: '#03045E', icon: '📝', words: 122 },
]

export const SEED_GROUPS: SeedGroupDef[] = [
  { id: 'ielts', name: 'IELTS', order: 1, decks: IELTS_DECKS },
  { id: 'oxford', name: 'Oxford', order: 2, decks: OXFORD_DECKS },
  { id: 'toeic', name: 'TOEIC', order: 3, decks: TOEIC_DECKS },
  { id: 'academic', name: 'Học thuật', order: 4, decks: ACADEMIC_DECKS },
  { id: 'sat', name: 'SAT', order: 5, decks: SAT_DECKS },
  { id: 'toefl', name: 'TOEFL', order: 6, decks: TOEFL_DECKS },
]

async function seedGroup(group: SeedGroupDef): Promise<void> {
  const existing = await db.decks.where('groupId').equals(group.id).count()
  if (existing > 0) return

  const groupExists = await db.groups.get(group.id)
  if (!groupExists) {
    await db.groups.put({
      id: group.id,
      name: group.name,
      order: group.order,
      createdAt: Date.now(),
    })
  }

  const now = Date.now()
  for (const d of group.decks) {
    await db.decks.add({
      id: crypto.randomUUID(),
      groupId: group.id,
      name: d.name,
      book: d.description,
      color: d.color,
      icon: d.icon,
      origin: 'preset',
      createdAt: now,
      updatedAt: now,
    })
  }
}

/**
 * Gắn origin cho deck cũ trong DB đã tồn tại trước khi có field origin:
 * bất kỳ deck nào nằm trong PRESET_GROUP_IDS và trùng tên với SEED_GROUPS →
 * đánh dấu `preset` để không cho phép xóa.
 */
async function repairPresetOrigin(): Promise<void> {
  const namesByGroup = new Map<string, Set<string>>(
    SEED_GROUPS.map(g => [g.id, new Set(g.decks.map(d => d.name))]),
  )
  const legacy = await db.decks
    .filter(d => d.origin === undefined && namesByGroup.has(d.groupId))
    .toArray()
  for (const d of legacy) {
    const seedNames = namesByGroup.get(d.groupId)
    if (seedNames?.has(d.name)) {
      await db.decks.update(d.id, { origin: 'preset' })
    } else {
      await db.decks.update(d.id, { origin: 'user' })
    }
  }
}

/** Seed tất cả bộ preset (IELTS, Oxford, TOEIC, …) — mỗi group chỉ seed 1 lần. */
export async function seedPresetDecks(): Promise<void> {
  for (const group of SEED_GROUPS) {
    await seedGroup(group)
  }
  await repairPresetOrigin()
}

/** @deprecated Dùng seedPresetDecks */
export async function seedIeltsDecks(): Promise<void> {
  await seedPresetDecks()
}