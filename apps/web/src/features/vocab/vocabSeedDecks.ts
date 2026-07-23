import { cardRepo, db, settingsRepo, type Card, type Deck } from '@ryan/db'
import { PRESET_GROUP_IDS, type PresetGroupId } from './vocabConstants'
import { PRESET_VOCAB_CARDS_VERSION, PRESET_VOCAB_SEED } from './seedData/presetVocabCards'
import {
  isStablePresetCardId,
  isStablePresetDeckId,
  phraseKeyForCard,
  stablePresetCardId,
  stablePresetDeckId,
} from './presetIds'

export { GROUP_LABELS, PRESET_GROUP_IDS } from './vocabConstants'
export {
  isStablePresetCardId,
  isStablePresetDeckId,
  phraseKeyForCard,
  stablePresetCardId,
  stablePresetDeckId,
} from './presetIds'
export type { PresetGroupId } from './vocabConstants'

const PRESET_VOCAB_CARDS_VERSION_KEY = 'preset_vocab_cards_version'

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

const IELTS_DECKS: SeedDeckDef[] = [
  { name: 'Môi trường', description: 'Biến đổi khí hậu, tài nguyên và phát triển bền vững.', color: '#4CAF82', icon: '🌿', words: 100 },
  { name: 'Công nghệ', description: 'Thuật ngữ công nghệ, AI và chuyển đổi số.', color: '#2EC4B6', icon: '💻', words: 99 },
  { name: 'Xã hội & Văn hóa', description: 'Cộng đồng, bản sắc và các vấn đề xã hội.', color: '#E05C5C', icon: '🏛️', words: 101 },
  { name: 'Lịch sử & Khảo cổ học', description: 'Văn minh, di sản và khám phá khảo cổ học.', color: '#E09B3D', icon: '🏺', words: 100 },
  { name: 'Kinh tế & Kinh doanh', description: 'Thị trường, thương mại và tài chính.', color: '#E05C8A', icon: '💼', words: 100 },
  { name: 'Sức khỏe & Y tế', description: 'Y học, dịch tễ và lối sống lành mạnh.', color: '#5B8DD9', icon: '⚕️', words: 100 },
  { name: 'Giáo dục & Tâm lý học', description: 'Học tập, nhận thức và hành vi con người.', color: '#9B59B6', icon: '📚', words: 100 },
  { name: 'Đô thị & Kiến trúc', description: 'Quy hoạch, xây dựng và không gian sống.', color: '#1BA39C', icon: '🏙️', words: 100 },
  // Bộ mới (vỏ rỗng — chưa seed từ/cụm)
  { name: 'Tội phạm & Pháp luật', description: 'Tội phạm, tư pháp và an ninh xã hội.', color: '#7F1D1D', icon: '⚖️', words: 0 },
  { name: 'Truyền thông & Quảng cáo', description: 'Báo chí, mạng xã hội và quảng cáo.', color: '#BE185D', icon: '📰', words: 0 },
  { name: 'Thể thao & Giải trí', description: 'Thể thao, sở thích và thời gian rảnh.', color: '#EA580C', icon: '⚽', words: 0 },
  { name: 'Giao thông & Du lịch', description: 'Giao thông, du lịch và di chuyển quốc tế.', color: '#0369A1', icon: '🚌', words: 0 },
  { name: 'Nông nghiệp & Thực phẩm', description: 'Nông nghiệp, an ninh lương thực và chế biến.', color: '#65A30D', icon: '🌾', words: 0 },
  { name: 'Năng lượng & Tài nguyên', description: 'Năng lượng, khai thác và quản lý tài nguyên.', color: '#CA8A04', icon: '⚡', words: 0 },
  { name: 'Toàn cầu hóa', description: 'Toàn cầu hóa, thương mại quốc tế và văn hóa toàn cầu.', color: '#4338CA', icon: '🌐', words: 0 },
  { name: 'Gia đình & Thế hệ', description: 'Gia đình, thế hệ và thay đổi xã hội.', color: '#DB2777', icon: '👨‍👩‍👧‍👦', words: 0 },
  { name: 'Nghệ thuật & Di sản', description: 'Nghệ thuật, di sản văn hóa và bảo tồn.', color: '#C026D3', icon: '🎨', words: 0 },
  { name: 'Không gian & Khoa học', description: 'Vũ trụ, khám phá khoa học và nghiên cứu.', color: '#1E3A8A', icon: '🚀', words: 0 },
  { name: 'Công việc & Việc làm', description: 'Thị trường lao động, nghề nghiệp và tương lai việc làm.', color: '#0F766E', icon: '💼', words: 0 },
  { name: 'Ngôn ngữ & Giao tiếp', description: 'Ngôn ngữ, giao tiếp và đa ngôn ngữ.', color: '#7C3AED', icon: '🗣️', words: 0 },
  { name: 'Giới tính & Bình đẳng', description: 'Bình đẳng giới, quyền và vai trò xã hội.', color: '#BE185D', icon: '⚧️', words: 0 },
  { name: 'Người cao tuổi & Xã hội', description: 'Lão hóa dân số, chăm sóc và phúc lợi.', color: '#78716C', icon: '👴', words: 0 },
  { name: 'Thanh thiếu niên', description: 'Thanh thiếu niên, áp lực và phát triển.', color: '#F97316', icon: '🧒', words: 0 },
  { name: 'Tiền & Tài chính cá nhân', description: 'Tiết kiệm, chi tiêu và tài chính cá nhân.', color: '#059669', icon: '💰', words: 0 },
  { name: 'Quảng cáo & Ảnh hưởng', description: 'Quảng cáo, người ảnh hưởng và tiêu dùng.', color: '#DB2777', icon: '📣', words: 0 },
  { name: 'Khí hậu cực đoan', description: 'Thời tiết cực đoan, thiên tai và thích ứng.', color: '#0E7490', icon: '🌪️', words: 0 },
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
  { name: 'Gia đình & Bạn bè', description: 'Quan hệ gia đình, bạn bè và giao tiếp xã hội.', color: '#DB2777', icon: '👨‍👩‍👧', words: 0 },
  { name: 'Mua sắm & Tiền bạc', description: 'Mua sắm, thanh toán và quản lý chi tiêu.', color: '#059669', icon: '🛒', words: 0 },
  { name: 'Thời tiết & Mùa', description: 'Thời tiết, khí hậu và hoạt động theo mùa.', color: '#0EA5E9', icon: '🌤️', words: 0 },
  { name: 'Thể thao & Vận động', description: 'Thể thao, tập luyện và sự kiện thể thao.', color: '#F97316', icon: '🏃', words: 0 },
  { name: 'Nhà cửa & Đồ đạc', description: 'Nhà ở, nội thất và tiện nghi sinh hoạt.', color: '#8B5CF6', icon: '🛋️', words: 0 },
  { name: 'Cảm xúc & Tính cách', description: 'Cảm xúc, tính cách và mô tả con người.', color: '#EC4899', icon: '😊', words: 0 },
  { name: 'Giao thông & Di chuyển', description: 'Xe cộ, đường phố và đi lại hàng ngày.', color: '#0284C7', icon: '🚗', words: 0 },
  { name: 'Thời trang & Ngoại hình', description: 'Quần áo, phong cách và mô tả ngoại hình.', color: '#E11D48', icon: '👗', words: 0 },
  { name: 'Công nghệ đời sống', description: 'Điện thoại, app và thiết bị hàng ngày.', color: '#4F46E5', icon: '📱', words: 0 },
  { name: 'Sức khỏe & Phòng bệnh', description: 'Bệnh tật, thuốc men và chăm sóc sức khỏe.', color: '#059669', icon: '💊', words: 0 },
  { name: 'Lễ hội & Sự kiện', description: 'Lễ hội, sinh nhật và sự kiện đặc biệt.', color: '#D97706', icon: '🎉', words: 0 },
  { name: 'Động vật & Thú cưng', description: 'Động vật, thú cưng và chăm sóc.', color: '#65A30D', icon: '🐾', words: 0 },
  { name: 'Trường học & Lớp học', description: 'Lớp học, giáo viên và hoạt động học đường.', color: '#6366F1', icon: '🏫', words: 0 },
  { name: 'Sở thích & Giải trí', description: 'Sở thích, game và thời gian rảnh.', color: '#A855F7', icon: '🎮', words: 0 },
  { name: 'Đồ ăn & Nhà hàng', description: 'Nhà hàng, menu và đặt món.', color: '#EA580C', icon: '🍽️', words: 0 },
  { name: 'Khách sạn & Lưu trú', description: 'Khách sạn, đặt phòng và dịch vụ.', color: '#0891B2', icon: '🏨', words: 0 },
  { name: 'Ngân hàng đời sống', description: 'Tài khoản, thẻ và giao dịch ngân hàng.', color: '#0D9488', icon: '💳', words: 0 },
  { name: 'An toàn & Khẩn cấp', description: 'An toàn, cấp cứu và tình huống khẩn cấp.', color: '#DC2626', icon: '🚨', words: 0 },
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
  { name: 'Dịch vụ khách hàng', description: 'Hỗ trợ khách hàng, khiếu nại và chăm sóc.', color: '#E11D48', icon: '🎧', words: 0 },
  { name: 'Bất động sản & Văn phòng', description: 'Thuê mặt bằng, văn phòng và quản lý cơ sở.', color: '#78716C', icon: '🏢', words: 0 },
  { name: 'Đào tạo & Phát triển', description: 'Đào tạo nội bộ, workshop và kỹ năng mềm.', color: '#7C3AED', icon: '📚', words: 0 },
  { name: 'Môi trường làm việc', description: 'Văn hóa công ty, an toàn và phúc lợi.', color: '#14B8A6', icon: '🪴', words: 0 },
  { name: 'Bán lẻ & Cửa hàng', description: 'Cửa hàng, tồn kho và trải nghiệm mua sắm.', color: '#F59E0B', icon: '🏪', words: 0 },
  { name: 'Bảo hiểm & Rủi ro', description: 'Bảo hiểm, khiếu nại và quản lý rủi ro.', color: '#475569', icon: '🛡️', words: 0 },
  { name: 'Email & Thư từ', description: 'Email công sở, thư tín và mẫu câu lịch sự.', color: '#2563EB', icon: '✉️', words: 0 },
  { name: 'Đặt hàng & Mua sắm B2B', description: 'Đơn hàng, báo giá và mua hàng doanh nghiệp.', color: '#B45309', icon: '📦', words: 0 },
  { name: 'Sự kiện & Hội thảo', description: 'Hội nghị, hội thảo và tổ chức sự kiện.', color: '#C026D3', icon: '🎤', words: 0 },
  { name: 'Quảng cáo & PR', description: 'Quảng cáo, truyền thông và quan hệ công chúng.', color: '#DB2777', icon: '📢', words: 0 },
  { name: 'An toàn lao động', description: 'An toàn nơi làm việc và quy định bảo hộ.', color: '#DC2626', icon: '🦺', words: 0 },
  { name: 'Xuất nhập khẩu', description: 'Xuất nhập khẩu, hải quan và thương mại quốc tế.', color: '#0F766E', icon: '🚢', words: 0 },
  { name: 'Kế toán & Báo cáo', description: 'Kế toán, báo cáo tài chính và kiểm soát.', color: '#1E40AF', icon: '📒', words: 0 },
  { name: 'Đàm phán & Thương lượng', description: 'Đàm phán, thỏa hiệp và chốt thỏa thuận.', color: '#7C3AED', icon: '🤝', words: 0 },
  { name: 'Quản lý dự án', description: 'Dự án, tiến độ và quản lý nguồn lực.', color: '#0369A1', icon: '📌', words: 0 },
  { name: 'Chuỗi cung ứng', description: 'Chuỗi cung ứng, nhà cung cấp và tồn kho.', color: '#B45309', icon: '🔗', words: 0 },
  { name: 'Bán hàng quốc tế', description: 'Xuất khẩu, đại lý và thị trường nước ngoài.', color: '#0F766E', icon: '🌍', words: 0 },
  { name: 'Đổi mới & R&D', description: 'Nghiên cứu phát triển và đổi mới sản phẩm.', color: '#4F46E5', icon: '🧪', words: 0 },
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
  { name: 'Hóa học', description: 'Phản ứng, phân tử và thuật ngữ lab hóa.', color: '#0D9488', icon: '⚗️', words: 0 },
  { name: 'Tâm lý học', description: 'Nhận thức, hành vi và nghiên cứu tâm lý.', color: '#A855F7', icon: '🧠', words: 0 },
  { name: 'Ngôn ngữ học', description: 'Ngữ pháp, ngữ nghĩa và phân tích ngôn ngữ.', color: '#2563EB', icon: '🔤', words: 0 },
  { name: 'Khoa học máy tính', description: 'Thuật toán, dữ liệu và hệ thống máy tính.', color: '#1E3A8A', icon: '💻', words: 0 },
  { name: 'Địa lý học', description: 'Địa hình, khí hậu và địa lý nhân văn.', color: '#15803D', icon: '🗺️', words: 0 },
  { name: 'Chính trị học', description: 'Thể chế, chính sách và quan hệ quốc tế.', color: '#9F1239', icon: '🏛️', words: 0 },
  { name: 'Văn học học thuật', description: 'Phân tích văn bản và thuật ngữ văn học.', color: '#9F1239', icon: '📖', words: 0 },
  { name: 'Lịch sử thế giới', description: 'Sự kiện, thời kỳ và thuật ngữ lịch sử.', color: '#92400E', icon: '⏳', words: 0 },
  { name: 'Môi trường học', description: 'Sinh thái, khí hậu và nghiên cứu môi trường.', color: '#15803D', icon: '🌿', words: 0 },
  { name: 'Y sinh học', description: 'Y học cơ bản, giải phẫu và thuật ngữ y khoa.', color: '#BE123C', icon: '🩺', words: 0 },
  { name: 'Toán học ứng dụng', description: 'Mô hình toán, ứng dụng và thuật ngữ số.', color: '#1D4ED8', icon: '∑', words: 0 },
  { name: 'Truyền thông học', description: 'Truyền thông đại chúng và nghiên cứu media.', color: '#7C3AED', icon: '📡', words: 0 },
  { name: 'Nhân học', description: 'Văn hóa, xã hội và nghiên cứu nhân học.', color: '#A16207', icon: '🗿', words: 0 },
  { name: 'Luật học cơ bản', description: 'Khái niệm pháp lý và thuật ngữ luật.', color: '#374151', icon: '⚖️', words: 0 },
  { name: 'Khoa học môi trường', description: 'Ô nhiễm, bảo tồn và chính sách môi trường.', color: '#15803D', icon: '♻️', words: 0 },
  { name: 'Thiên văn học', description: 'Vũ trụ, hành tinh và quan sát thiên văn.', color: '#1E3A8A', icon: '🌌', words: 0 },
  { name: 'Địa chất học', description: 'Đá, động đất và cấu trúc Trái Đất.', color: '#92400E', icon: '🪨', words: 0 },
  { name: 'Đạo đức học thuật', description: 'Đạo đức nghiên cứu, trích dẫn và trung thực.', color: '#6D28D9', icon: '🧭', words: 0 },
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
  { name: 'Từ vựng nâng cao', description: 'Từ khó, trang trọng dùng trong bài đọc SAT.', color: '#312E81', icon: '💎', words: 0 },
  { name: 'Khoa học xã hội SAT', description: 'Kinh tế, tâm lý và xã hội trong passage.', color: '#0F766E', icon: '📊', words: 0 },
  { name: 'Nghệ thuật & Âm nhạc', description: 'Thuật ngữ nghệ thuật trong đoạn đọc văn hóa.', color: '#BE123C', icon: '🎨', words: 0 },
  { name: 'Từ vựng bài luận', description: 'Từ nối, đánh giá và lập luận essay.', color: '#B45309', icon: '📝', words: 0 },
  { name: 'Hình học & Không gian', description: 'Hình học phẳng, không gian và công thức.', color: '#1D4ED8', icon: '📐', words: 0 },
  { name: 'Xác suất & Thống kê', description: 'Xác suất, biểu đồ và diễn giải số liệu.', color: '#047857', icon: '📈', words: 0 },
  { name: 'Từ vựng so sánh', description: 'So sánh, tương phản và đánh giá quan điểm.', color: '#6366F1', icon: '⚖️', words: 0 },
  { name: 'Từ vựng nguyên nhân–kết quả', description: 'Nguyên nhân, hệ quả và liên kết logic.', color: '#0EA5E9', icon: '🔗', words: 0 },
  { name: 'Từ vựng thời gian', description: 'Trình tự thời gian, giai đoạn và tiến trình.', color: '#8B5CF6', icon: '⏱️', words: 0 },
  { name: 'Đại số nâng cao', description: 'Hàm số, phương trình và biểu thức đại số.', color: '#1E40AF', icon: 'ƒ', words: 0 },
  { name: 'Khoa học đời sống', description: 'Sinh học, sinh thái trong bài đọc SAT.', color: '#16A34A', icon: '🧬', words: 0 },
  { name: 'Khoa học vật lý', description: 'Vật lý, hóa học và thí nghiệm ngắn.', color: '#0369A1', icon: '🔬', words: 0 },
  { name: 'Từ vựng quan điểm', description: 'Quan điểm, thái độ và đánh giá lập luận.', color: '#C026D3', icon: '💭', words: 0 },
  { name: 'Từ vựng bằng chứng', description: 'Bằng chứng, dữ liệu và hỗ trợ lập luận.', color: '#2563EB', icon: '📎', words: 0 },
  { name: 'Đọc hiểu khoa học', description: 'Passage khoa học và thuật ngữ thí nghiệm.', color: '#0D9488', icon: '🧪', words: 0 },
  { name: 'Đọc hiểu lịch sử', description: 'Passage lịch sử và từ vựng sự kiện.', color: '#B45309', icon: '📜', words: 0 },
  { name: 'Đọc hiểu văn học', description: 'Passage văn học và hình ảnh ngôn từ.', color: '#9F1239', icon: '📕', words: 0 },
  { name: 'Chiến lược làm bài', description: 'Chiến lược đọc, loại trừ và quản lý thời gian.', color: '#4B5563', icon: '🎯', words: 0 },
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
  { name: 'Thư viện & Nghiên cứu', description: 'Thư viện, tra cứu và tài liệu học thuật.', color: '#4C1D95', icon: '📚', words: 0 },
  { name: 'Học vụ & Đăng ký', description: 'Đăng ký môn, học phí và quy định học vụ.', color: '#0E7490', icon: '🗂️', words: 0 },
  { name: 'Thảo luận nhóm', description: 'Thảo luận lớp, tranh luận và làm việc nhóm.', color: '#C026D3', icon: '💬', words: 0 },
  { name: 'Bài nghe học thuật', description: 'Bài giảng dài, thuật ngữ và ghi chú nghe.', color: '#1E40AF', icon: '🎙️', words: 0 },
  { name: 'Đọc hiểu học thuật', description: 'Đoạn đọc dài, ý chính và suy luận.', color: '#9A3412', icon: '📄', words: 0 },
  { name: 'Môi trường & Sinh thái', description: 'Môi trường, sinh thái trong bài TOEFL.', color: '#15803D', icon: '🌍', words: 0 },
  { name: 'Nghệ thuật & Âm nhạc', description: 'Nghệ thuật, âm nhạc trong bài giảng TOEFL.', color: '#DB2777', icon: '🎵', words: 0 },
  { name: 'Lịch sử & Văn minh', description: 'Lịch sử, khảo cổ và nền văn minh.', color: '#B45309', icon: '🏺', words: 0 },
  { name: 'Kinh doanh & Kinh tế', description: 'Kinh doanh, thị trường trong ngữ cảnh TOEFL.', color: '#0F766E', icon: '📊', words: 0 },
  { name: 'Công nghệ & Đổi mới', description: 'Công nghệ, phát minh và đổi mới.', color: '#4F46E5', icon: '💡', words: 0 },
  { name: 'Sức khỏe & Y tế', description: 'Sức khỏe, y tế trong bài nghe/đọc.', color: '#DC2626', icon: '🏥', words: 0 },
  { name: 'Tâm lý & Hành vi', description: 'Tâm lý học và hành vi con người.', color: '#7C3AED', icon: '🧩', words: 0 },
  { name: 'Sinh học & Hệ sinh thái', description: 'Sinh học, hệ sinh thái trong bài TOEFL.', color: '#16A34A', icon: '🦋', words: 0 },
  { name: 'Vật lý & Hóa học', description: 'Vật lý, hóa học trong bài giảng.', color: '#0369A1', icon: '⚛️', words: 0 },
  { name: 'Xã hội & Văn hóa', description: 'Xã hội, văn hóa và phong tục.', color: '#DB2777', icon: '🏛️', words: 0 },
  { name: 'Giáo dục & Học tập', description: 'Giáo dục, phương pháp học và lớp học.', color: '#4F46E5', icon: '📘', words: 0 },
  { name: 'Địa lý & Khí hậu', description: 'Địa lý, khí hậu và địa hình.', color: '#0F766E', icon: '🧭', words: 0 },
  { name: 'Công nghệ thông tin', description: 'Máy tính, internet và công nghệ số.', color: '#1E40AF', icon: '🖥️', words: 0 },
]

export const SEED_GROUPS: SeedGroupDef[] = [
  { id: 'ielts', name: 'IELTS', order: 1, decks: IELTS_DECKS },
  { id: 'oxford', name: 'Oxford', order: 2, decks: OXFORD_DECKS },
  { id: 'toeic', name: 'TOEIC', order: 3, decks: TOEIC_DECKS },
  { id: 'academic', name: 'Học thuật', order: 4, decks: ACADEMIC_DECKS },
  { id: 'sat', name: 'SAT', order: 5, decks: SAT_DECKS },
  { id: 'toefl', name: 'TOEFL', order: 6, decks: TOEFL_DECKS },
]

const PRESET_GROUP_SET = new Set<string>(PRESET_GROUP_IDS)

async function removeDeckRecord(deckId: string): Promise<void> {
  const cardIds = (await db.cards.where('deckId').equals(deckId).primaryKeys()) as string[]
  await db.srs.bulkDelete(cardIds)
  if (cardIds.length) await db.reviewLog.where('cardId').anyOf(cardIds).delete()
  await db.cards.where('deckId').equals(deckId).delete()
  await db.decks.delete(deckId)
}

/**
 * Chuyển thẻ sang deck đích + rekey id → `pcard:…` (idempotent).
 * Gộp phrase trùng, giữ SRS tốt hơn.
 */
async function migrateDeckCards(fromDeckId: string, toDeckId: string): Promise<void> {
  if (fromDeckId === toDeckId) {
    await rekeyCardsInDeck(toDeckId)
    return
  }
  const cards = await db.cards.where('deckId').equals(fromDeckId).toArray()
  const ts = Date.now()
  for (const card of cards) {
    await rekeyOneCard(card, toDeckId, ts)
  }
  await cardRepo.dedupeByPhrase(toDeckId)
}

async function rekeyOneCard(card: Card, toDeckId: string, ts: number): Promise<void> {
  const stableId = stablePresetCardId(toDeckId, card.phrase)
  const srs = await db.srs.get(card.id)
  const existing = stableId !== card.id ? await db.cards.get(stableId) : undefined

  if (existing && existing.id !== card.id) {
    // Gộp field vào thẻ stable, xóa bản UUID/cũ
    const patch: Record<string, unknown> = { updatedAt: ts, deckId: toDeckId }
    if (!existing.meaning?.trim() && card.meaning?.trim()) patch.meaning = card.meaning
    if (!existing.example?.trim() && card.example?.trim()) patch.example = card.example
    if (!existing.ipaUS?.trim() && card.ipaUS?.trim()) patch.ipaUS = card.ipaUS
    if (!existing.ipaUK?.trim() && card.ipaUK?.trim()) patch.ipaUK = card.ipaUK
    if (!existing.pos?.trim() && card.pos?.trim()) patch.pos = card.pos
    await db.cards.update(stableId, patch)
    if (srs) {
      const keepSrs = await db.srs.get(stableId)
      if (!keepSrs || (srs.reps ?? 0) > (keepSrs.reps ?? 0)) {
        await db.srs.put({ ...srs, cardId: stableId, deckId: toDeckId })
      }
      await db.srs.delete(card.id)
    }
    const logs = await db.reviewLog.where('cardId').equals(card.id).toArray()
    for (const log of logs) {
      if (log.id != null) await db.reviewLog.update(log.id, { cardId: stableId })
    }
    await db.cards.delete(card.id)
    return
  }

  if (card.id === stableId && card.deckId === toDeckId) {
    if (srs && srs.deckId !== toDeckId) await db.srs.put({ ...srs, deckId: toDeckId })
    return
  }

  // Đổi id: put stable, xóa cũ
  await db.cards.put({
    ...card,
    id: stableId,
    deckId: toDeckId,
    updatedAt: ts,
  })
  if (srs) {
    await db.srs.put({ ...srs, cardId: stableId, deckId: toDeckId })
    if (card.id !== stableId) await db.srs.delete(card.id)
  }
  if (card.id !== stableId) {
    const logs = await db.reviewLog.where('cardId').equals(card.id).toArray()
    for (const log of logs) {
      if (log.id != null) await db.reviewLog.update(log.id, { cardId: stableId })
    }
    await db.cards.delete(card.id)
  }
}

/** Rekey mọi thẻ trong deck preset → pcard: + dedupe phrase. */
async function rekeyCardsInDeck(deckId: string): Promise<void> {
  const cards = await db.cards.where('deckId').equals(deckId).toArray()
  const ts = Date.now()
  for (const card of cards) {
    await rekeyOneCard(card, deckId, ts)
  }
  await cardRepo.dedupeByPhrase(deckId)
}

/** Map stableId → tên seed chuẩn (để rename + gộp). */
function knownPresetStableIds(): Map<string, { groupId: string; name: string }> {
  const map = new Map<string, { groupId: string; name: string }>()
  for (const g of SEED_GROUPS) {
    for (const d of g.decks) {
      map.set(stablePresetDeckId(g.id, d.name), { groupId: g.id, name: d.name })
    }
  }
  return map
}

/** Tên seed (normalize) → stableId khi tên là duy nhất toàn bộ preset. */
function uniqueSeedNameToStable(): Map<string, string> {
  const counts = new Map<string, string[]>()
  for (const g of SEED_GROUPS) {
    for (const d of g.decks) {
      const key = phraseKeyForCard(d.name)
      const id = stablePresetDeckId(g.id, d.name)
      const list = counts.get(key) ?? []
      list.push(id)
      counts.set(key, list)
    }
  }
  const unique = new Map<string, string>()
  for (const [key, ids] of counts) {
    if (ids.length === 1) unique.set(key, ids[0]!)
  }
  return unique
}

/**
 * Gộp bộ preset trùng theo **stable slug** (không phụ thuộc exact name / origin).
 * VD: "Công nghệ" + "Cong nghe" + UUID deck → `preset:ielts:cong-nghe`.
 * Giữ bản có nhiều thẻ nhất, chuẩn hoá ID + tên seed + rekey card.
 */
export async function dedupePresetDecks(): Promise<number> {
  const known = knownPresetStableIds()
  const uniqueName = uniqueSeedNameToStable()
  // Chỉ gộp bản preset chính chủ (stable id / origin=preset) hoặc ghost UUID
  // trong group preset (do sync cloud cũ tạo ra). KHÔNG đụng deck user tự tạo
  // trong group "default" dù tên trùng seed — nếu không, deck user tự tạo tên
  // "Công nghệ", "Môi trường"… sẽ bị merge vào preset và biến mất khỏi "Của tôi".
  const allDecks = await db.decks.toArray()
  const candidates = allDecks.filter(d => {
    if (known.has(d.id) || isStablePresetDeckId(d.id)) return true
    if (d.origin === 'preset') return true
    // Deck user tự tạo (origin='user') KHÔNG merge dù groupId=ielts/oxford/…
    // Chỉ gom ghost deck chưa có origin (legacy) trong group preset.
    if (d.origin === undefined && PRESET_GROUP_SET.has(d.groupId)) return true
    return false
  })

  const buckets = new Map<string, Deck[]>()
  for (const deck of candidates) {
    let stableId: string | null = null
    if (known.has(deck.id)) {
      stableId = deck.id
    } else if (PRESET_GROUP_SET.has(deck.groupId)) {
      const fromName = stablePresetDeckId(deck.groupId, deck.name)
      if (known.has(fromName)) stableId = fromName
    }
    if (!stableId) {
      // Chỉ áp dụng tên-khớp-seed cho deck đã đánh dấu preset (ghost cloud id lạ)
      if (deck.origin === 'preset') {
        const byName = uniqueName.get(phraseKeyForCard(deck.name))
        if (byName) stableId = byName
      }
    }
    if (!stableId) continue
    const list = buckets.get(stableId) ?? []
    list.push(deck)
    buckets.set(stableId, list)
  }

  let removed = 0
  for (const [stableId, dupes] of buckets) {
    if (!dupes.length) continue
    const meta = known.get(stableId)!

    const ranked = await Promise.all(
      dupes.map(async deck => ({
        deck,
        cards: await db.cards.where('deckId').equals(deck.id).count(),
      })),
    )
    ranked.sort((a, b) => b.cards - a.cards || a.deck.createdAt - b.deck.createdAt)
    const best = ranked[0]!.deck

    await db.decks.put({
      ...best,
      id: stableId,
      groupId: meta.groupId,
      name: meta.name,
      origin: 'preset',
      updatedAt: Date.now(),
    })

    for (const { deck } of ranked) {
      if (deck.id === stableId) continue
      await migrateDeckCards(deck.id, stableId)
      await removeDeckRecord(deck.id)
      removed++
    }

    // Rekey UUID card → pcard: + gộp phrase
    await rekeyCardsInDeck(stableId)
  }

  return removed
}

async function seedGroup(group: SeedGroupDef): Promise<void> {
  const existingGroup = await db.groups.get(group.id)
  await db.groups.put({
    id: group.id,
    name: group.name,
    order: group.order,
    createdAt: existingGroup?.createdAt ?? Date.now(),
  })

  const now = Date.now()
  for (const d of group.decks) {
    const id = stablePresetDeckId(group.id, d.name)
    const existing = await db.decks.get(id)
    await db.decks.put({
      id,
      groupId: group.id,
      name: d.name,
      book: d.description,
      description: d.description,
      color: d.color,
      icon: d.icon,
      origin: 'preset',
      createdAt: existing?.createdAt ?? now,
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

/** Ví dụ seed cũ dạng template generic — được thay khi enrich. */
function isWeakSeedExample(example: string | undefined, phrase: string): boolean {
  if (!example?.trim()) return true
  const e = example.trim()
  if (e.includes('is useful in this topic')) return true
  if (e.includes('when the situation requires it')) return true
  if (e.includes('The term "') && e.includes('is useful')) return true
  if (e.includes('In this context,') && e.includes('is very common')) return true
  if (e.includes('is important for English learners')) return true
  if (e.includes('Students should remember the meaning of')) return true
  if (e.includes('This article explains') && e.endsWith('clearly.')) return true
  if (e.includes('Understanding ') && e.includes('helps you write better')) return true
  if (e.includes('We discussed ') && e.includes("in today's lesson")) return true
  if (e.includes('is useful to ') && e.includes('in real conversations')) return true
  // không chứa phrase trong example (seed lỗi)
  if (phrase && !e.toLowerCase().includes(phrase.toLowerCase())) return true
  return false
}

/**
 * Nạp thẻ preset từ seedData (stable id) — thêm thẻ thiếu + vá IPA/example cho thẻ seed cũ.
 * Không ghi đè meaning do user sửa (chỉ vá field trống / example yếu / IPA thiếu).
 */
export async function seedPresetCards(): Promise<{ added: number; patched: number }> {
  for (const group of SEED_GROUPS) {
    await seedGroup(group)
  }

  const deckIds: string[] = []
  for (const group of SEED_GROUPS) {
    for (const d of group.decks) {
      deckIds.push(stablePresetDeckId(group.id, d.name))
    }
  }
  const existingDecks = await db.decks.bulkGet(deckIds)
  const deckExists = new Set(deckIds.filter((_, i) => existingDecks[i] != null))
  if (!deckExists.size) return { added: 0, patched: 0 }

  const existingCards = await db.cards.where('deckId').anyOf([...deckExists]).toArray()
  const byId = new Map(existingCards.map(c => [c.id, c]))
  const phraseKeysByDeck = new Map<string, Set<string>>()
  for (const c of existingCards) {
    let set = phraseKeysByDeck.get(c.deckId)
    if (!set) {
      set = new Set()
      phraseKeysByDeck.set(c.deckId, set)
    }
    set.add(phraseKeyForCard(c.phrase))
  }

  const now = Date.now()
  const cardsToPut: Card[] = []
  const cardsToPatch: Card[] = []
  const srsToPut: {
    cardId: string
    deckId: string
    ease: number
    interval: number
    reps: number
    lapses: number
    dueAt: number
    state: 'new'
  }[] = []

  for (const groupId of PRESET_GROUP_IDS) {
    const rows = PRESET_VOCAB_SEED[groupId] ?? []
    for (const row of rows) {
      const phrase = row.phrase?.trim()
      if (!phrase) continue
      const deckId = stablePresetDeckId(groupId, row.deckName)
      if (!deckExists.has(deckId)) continue

      const id = stablePresetCardId(deckId, phrase)
      const existing = byId.get(id)

      if (existing) {
        const patch: Partial<Card> = {}
        const ipaUS = row.ipaUS?.trim()
        const ipaUK = row.ipaUK?.trim()
        const example = row.example?.trim()
        const pos = row.pos?.trim()
        if (ipaUS && existing.ipaUS !== ipaUS) patch.ipaUS = ipaUS
        if (ipaUK && existing.ipaUK !== ipaUK) patch.ipaUK = ipaUK
        // Thẻ seed preset: luôn refresh example từ seed mới (sửa template gượng)
        const isPresetSeed = (existing.sourceLabel ?? '').startsWith('preset-seed')
        if (
          example &&
          (isPresetSeed || isWeakSeedExample(existing.example, phrase)) &&
          existing.example !== example
        ) {
          patch.example = example
        }
        if (pos && !existing.pos?.trim()) patch.pos = pos
        if (Object.keys(patch).length) {
          cardsToPatch.push({
            ...existing,
            ...patch,
            sourceLabel: isPresetSeed
              ? `preset-seed-v${PRESET_VOCAB_CARDS_VERSION}`
              : existing.sourceLabel,
            updatedAt: now,
          })
        }
        continue
      }

      const phraseKey = phraseKeyForCard(phrase)
      const keys = phraseKeysByDeck.get(deckId)
      if (keys?.has(phraseKey)) {
        // phrase tồn tại với id khác — chỉ vá bản đó nếu thiếu IPA
        continue
      }

      cardsToPut.push({
        id,
        deckId,
        phrase,
        meaning: row.meaning?.trim() || phrase,
        example: row.example?.trim() || undefined,
        ipaUS: row.ipaUS?.trim() || undefined,
        ipaUK: row.ipaUK?.trim() || undefined,
        pos: row.pos?.trim() || undefined,
        sourceKind: 'import',
        sourceLabel: `preset-seed-v${PRESET_VOCAB_CARDS_VERSION}`,
        createdAt: now,
        updatedAt: now,
      })
      srsToPut.push({
        cardId: id,
        deckId,
        ease: 2.5,
        interval: 0,
        reps: 0,
        lapses: 0,
        dueAt: now,
        state: 'new',
      })
      byId.set(id, cardsToPut[cardsToPut.length - 1]!)
      if (keys) keys.add(phraseKey)
      else phraseKeysByDeck.set(deckId, new Set([phraseKey]))
    }
  }

  const CHUNK = 100
  if (cardsToPut.length) {
    for (let i = 0; i < cardsToPut.length; i += CHUNK) {
      await db.cards.bulkPut(cardsToPut.slice(i, i + CHUNK))
      await db.srs.bulkPut(srsToPut.slice(i, i + CHUNK))
    }
  }
  if (cardsToPatch.length) {
    for (let i = 0; i < cardsToPatch.length; i += CHUNK) {
      await db.cards.bulkPut(cardsToPatch.slice(i, i + CHUNK))
    }
  }

  await settingsRepo.putSetting(PRESET_VOCAB_CARDS_VERSION_KEY, PRESET_VOCAB_CARDS_VERSION)
  return { added: cardsToPut.length, patched: cardsToPatch.length }
}

let seedTask: Promise<void> | null = null

/** Seed tất cả bộ preset (IELTS, Oxford, TOEIC, …) — idempotent, không tạo bản trùng. */
export async function seedPresetDecks(): Promise<void> {
  if (!seedTask) {
    seedTask = (async () => {
      // Luôn seed deck + thẻ builtin. Admin publish chỉ bổ sung/ghi đè id publish,
      // không được chặn seed local (trước đây version>0 → return sớm → deck rỗng).
      for (const group of SEED_GROUPS) {
        await seedGroup(group)
      }
      await repairPresetOrigin()
      await dedupePresetDecks()
      const { added, patched } = await seedPresetCards()
      if (added > 0 || patched > 0) {
        console.info(`[vocab] seedPresetCards added ${added}, patched ${patched}`)
      }
      // Dọn thẻ phrase trùng trên mọi deck (preset + user) — an toàn, idempotent
      await cardRepo.dedupeAllDecks()
    })().finally(() => {
      seedTask = null
    })
  }
  await seedTask
}

/**
 * Chạy tay / nút «Dọn thẻ trùng» — gộp deck preset + rekey card + dedupe phrase.
 * @returns số deck ghost đã xoá
 */
export async function repairVocabDuplicates(): Promise<{ decksRemoved: number }> {
  seedTask = null
  await seedPresetDecks()
  const decksRemoved = await dedupePresetDecks()
  await cardRepo.dedupeAllDecks()
  return { decksRemoved }
}

/** @deprecated Dùng seedPresetDecks */
export async function seedIeltsDecks(): Promise<void> {
  await seedPresetDecks()
}
