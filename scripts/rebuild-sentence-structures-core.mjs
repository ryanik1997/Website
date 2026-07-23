/**
 * Rebuild sentenceStructures.core.ts with proper UTF-8 Vietnamese.
 * Recovers English fields from broken core; regenerates VI descriptions/notes.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const CORE_PATH = path.join(ROOT, 'packages/catalog/src/seeds/sentenceStructures.core.ts')

const broken = fs.readFileSync(CORE_PATH, 'utf8')

// Parse structure objects (English fields survive encoding damage)
const blockRe =
  /\{\s*id:\s*'([^']+)',\s*title:\s*(?:"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'),\s*template:\s*(?:"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'),[\s\S]*?category:\s*'([^']*)',[\s\S]*?exampleA:\s*'((?:\\.|[^'\\])*)',[\s\S]*?exampleB:\s*'((?:\\.|[^'\\])*)',[\s\S]*?(?:exampleNoteVi:[\s\S]*?,)?[\s\S]*?starred:\s*(true|false),[\s\S]*?cefr:\s*'([^']*)'/g

function unesc(s) {
  return s
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\\\/g, '\\')
}

const parsed = []
let m
while ((m = blockRe.exec(broken)) !== null) {
  parsed.push({
    id: m[1],
    title: unesc(m[2] ?? m[3] ?? ''),
    template: unesc(m[4] ?? m[5] ?? ''),
    category: m[6],
    exampleA: unesc(m[7] ?? ''),
    exampleB: unesc(m[8] ?? ''),
    starred: m[9] === 'true',
    cefr: m[10],
  })
}

console.log('Parsed structures:', parsed.length)

/** Fix category labels to clean UTF-8 */
const CAT = {
  'Liên từ / Lý do': 'Liên từ / Lý do',
  'So sánh': 'So sánh',
  'Mục đích': 'Mục đích',
  'Điều kiện': 'Điều kiện',
  'Tương phản': 'Tương phản',
  Khác: 'Khác',
}

function fixCategory(c) {
  // Map mojibake / partial categories back by known English-free keys
  if (c.includes('So s') || c === 'So sánh') return 'So sánh'
  if (c.includes('M') && c.includes('ch')) return 'Mục đích'
  if (c.includes('ki') || c.toLowerCase().includes('condition')) return 'Điều kiện'
  if (c.includes('T') && c.includes('ng')) return 'Tương phản'
  if (c.includes('Kh') || c === 'Khác') return 'Khác'
  if (c.includes('Li') || c.includes('Lý') || c.includes('do')) return 'Liên từ / Lý do'
  // already good
  if (CAT[c]) return CAT[c]
  // fallback by id heuristics later
  return c
}

/** Per-id Vietnamese description + note (authoritative clean text) */
const VI = {
  'catalog:ss:just-because': {
    d: 'Dùng để nói một lý do chưa đủ để kết luận điều gì.',
    n: 'Chỉ vì bạn thất bại một lần không có nghĩa là bạn nên bỏ cuộc.',
  },
  'catalog:ss:not-only': {
    d: 'Nhấn mạnh hai ý song song.',
    n: 'Không những rẻ mà còn hiệu quả.',
  },
  'catalog:ss:because-of': {
    d: 'Nêu nguyên nhân bằng cụm danh từ — vì… nên…',
    n: 'Vì mưa to, trận đấu đã bị hủy.',
  },
  'catalog:ss:due-to': {
    d: 'Nguyên nhân trang trọng hơn because of.',
    n: 'Do sự cố kỹ thuật, chuyến bay bị trễ.',
  },
  'catalog:ss:as-a-result': {
    d: 'Nêu kết quả — do đó / kết quả là…',
    n: 'Anh ấy tập mỗi ngày. Kết quả là anh ấy thắng cuộc thi.',
  },
  'catalog:ss:therefore': {
    d: 'Kết luận logic — vì vậy…',
    n: 'Bằng chứng rõ ràng. Vì vậy chúng ta nên thay đổi chính sách.',
  },
  'catalog:ss:thanks-to': {
    d: 'Nguyên nhân tích cực — nhờ có…',
    n: 'Nhờ sự hỗ trợ của cô ấy, tôi hoàn thành dự án đúng hạn.',
  },
  'catalog:ss:owing-to': {
    d: 'Nguyên nhân trang trọng (IELTS Writing).',
    n: 'Do chi phí sinh hoạt tăng, nhiều gia đình đã cắt giảm chi tiêu.',
  },
  'catalog:ss:the-reason-why': {
    d: 'Giải thích lý do rõ ràng, học thuật.',
    n: 'Lý do nhiều học sinh trượt là vì họ không ôn đều đặn.',
  },
  'catalog:ss:in-order-to-reason': {
    d: 'Giải thích nguyên nhân sau một nhận định.',
    n: 'Giao thông công cộng cần được cải thiện. Điều này là vì nó giảm ùn tắc.',
  },
  'catalog:ss:the-more': {
    d: 'Hai vế tỷ lệ thuận — càng… càng…',
    n: 'Bạn càng luyện tập nhiều, bạn càng tiến bộ.',
  },
  'catalog:ss:the-less': {
    d: 'Tỷ lệ nghịch — càng ít… càng tốt…',
    n: 'Bạn càng ít ăn đường, càng tốt cho sức khỏe.',
  },
  'catalog:ss:as-as': {
    d: 'So sánh bằng — ngang bằng…',
    n: 'Ý tưởng của bạn tốt ngang với của tôi.',
  },
  'catalog:ss:not-as-as': {
    d: 'So sánh không bằng — không… bằng…',
    n: 'Thành phố không còn yên tĩnh như trước.',
  },
  'catalog:ss:more-than': {
    d: 'So sánh hơn với tính từ dài.',
    n: 'Học trực tuyến phổ biến hơn trước đây.',
  },
  'catalog:ss:less-than': {
    d: 'So sánh kém hơn.',
    n: 'Vấn đề ít nghiêm trọng hơn dự kiến.',
  },
  'catalog:ss:one-of-the-most': {
    d: 'So sánh nhất — một trong những… nhất.',
    n: 'Biến đổi khí hậu là một trong những vấn đề cấp bách nhất thế giới.',
  },
  'catalog:ss:far-more': {
    d: 'Nhấn mạnh mức độ so sánh — hơn nhiều.',
    n: 'Giải pháp phức tạp hơn nhiều so với mọi người nghĩ.',
  },
  'catalog:ss:compared-with': {
    d: 'So sánh trang trọng trong Writing.',
    n: 'So với các năm trước, doanh số đã tăng đáng kể.',
  },
  'catalog:ss:in-contrast-to': {
    d: 'Đối chiếu hai đối tượng.',
    n: 'Trái với nông thôn, thành phố mang lại nhiều cơ hội việc làm hơn.',
  },
  'catalog:ss:so-that': {
    d: 'Nêu mục đích của hành động — để có thể làm gì.',
    n: 'Tôi dậy sớm để có thể hoàn thành bài tập.',
  },
  'catalog:ss:in-order-to': {
    d: 'Mục đích trang trọng — nhằm / để…',
    n: 'Chính phủ đầu tư vào giáo dục nhằm cải thiện sự lưu động xã hội.',
  },
  'catalog:ss:so-as-to': {
    d: 'Mục đích formal, tương tự in order to.',
    n: 'Cô ấy nói chậm để người khác hiểu mình.',
  },
  'catalog:ss:for-the-purpose-of': {
    d: 'Mục đích học thuật — với mục đích…',
    n: 'Nghiên cứu được thực hiện nhằm xác định các yếu tố rủi ro chính.',
  },
  'catalog:ss:to-infinitive-purpose': {
    d: 'Mục đích ngắn gọn với to-infinitive.',
    n: 'Tôi đến thư viện để mượn vài cuốn sách.',
  },
  'catalog:ss:with-a-view-to': {
    d: 'Mục đích rất formal — nhằm mục tiêu…',
    n: 'Công ty mở rộng ra nước ngoài nhằm tăng thị phần.',
  },
  'catalog:ss:if-will': {
    d: 'Câu điều kiện loại 1 — nếu… thì sẽ…',
    n: 'Nếu bạn học chăm, bạn sẽ đạt kết quả tốt.',
  },
  'catalog:ss:if-would': {
    d: 'Điều kiện loại 2 — giả định hiện tại.',
    n: 'Nếu tôi có nhiều thời gian hơn, tôi sẽ học thêm một ngoại ngữ.',
  },
  'catalog:ss:if-had-would-have': {
    d: 'Điều kiện loại 3 — giả định quá khứ.',
    n: 'Nếu cô ấy đi sớm hơn, cô ấy đã bắt kịp tàu.',
  },
  'catalog:ss:unless': {
    d: 'Trừ khi… — if not.',
    n: 'Trừ khi chúng ta hành động ngay, vấn đề sẽ trở nên tồi tệ hơn.',
  },
  'catalog:ss:provided-that': {
    d: 'Với điều kiện là… (formal).',
    n: 'Với điều kiện thời tiết đẹp, sự kiện sẽ diễn ra ngoài trời.',
  },
  'catalog:ss:as-long-as': {
    d: 'Miễn là… / chỉ cần…',
    n: 'Miễn là bạn tiếp tục luyện tập, bạn sẽ tiến bộ.',
  },
  'catalog:ss:even-if': {
    d: 'Ngay cả khi… — điều kiện nhượng bộ.',
    n: 'Ngay cả khi trời mưa, chúng tôi vẫn đi bộ đường dài.',
  },
  'catalog:ss:whether-or-not': {
    d: 'Dù có… hay không…',
    n: 'Dù bạn có đồng ý hay không, quyết định đã được đưa ra.',
  },
  'catalog:ss:in-case': {
    d: 'Phòng khi… — chuẩn bị trước tình huống.',
    n: 'Mang theo ô phòng khi trời mưa.',
  },
  'catalog:ss:only-if': {
    d: 'Chỉ khi… — điều kiện bắt buộc.',
    n: 'Bạn chỉ có thể tham gia khóa học nếu đậu bài kiểm tra đầu vào.',
  },
  'catalog:ss:although': {
    d: 'Mệnh đề tương phản — mặc dù… nhưng…',
    n: 'Mặc dù trời mưa, chúng tôi vẫn đi ra ngoài.',
  },
  'catalog:ss:even-though': {
    d: 'Tương phản mạnh hơn although.',
    n: 'Dù kiệt sức, anh ấy vẫn hoàn thành báo cáo.',
  },
  'catalog:ss:despite': {
    d: 'Tương phản với danh từ / V-ing.',
    n: 'Bất chấp khó khăn, nhóm đã hoàn thành dự án.',
  },
  'catalog:ss:in-spite-of': {
    d: 'Tương đương despite — formal hơn một chút.',
    n: 'Mặc dù nguồn lực hạn chế, họ đạt kết quả ấn tượng.',
  },
  'catalog:ss:however': {
    d: 'Chuyển ý đối lập giữa hai câu.',
    n: 'Kế hoạch nghe hấp dẫn. Tuy nhiên, nó có thể quá đắt.',
  },
  'catalog:ss:on-the-other-hand': {
    d: 'Cân nhắc hai mặt của vấn đề (Writing).',
    n: 'Một mặt, công nghệ tạo việc làm. Mặt khác, nó cũng có thể thay thế lao động.',
  },
  'catalog:ss:whereas': {
    d: 'Đối chiếu hai sự thật — trong khi…',
    n: 'Trong khi một số người thích sống ở thành phố, những người khác thích nông thôn.',
  },
  'catalog:ss:while-contrast': {
    d: 'Tương phản hoặc đồng thời — trong khi…',
    n: 'Trong khi giao thông công cộng rẻ, nó thường quá đông.',
  },
  'catalog:ss:nevertheless': {
    d: 'Nhượng bộ formal — dù vậy…',
    n: 'Nhiệm vụ khó. Dù vậy, họ vẫn hoàn thành thành công.',
  },
  'catalog:ss:by-contrast': {
    d: 'Đối chiếu rõ nét giữa hai ý.',
    n: 'Khu đô thị đông đúc. Ngược lại, vùng nông thôn vẫn thưa dân.',
  },
  'catalog:ss:it-is-argued-that': {
    d: 'Mở bài Writing — người ta thường lập luận rằng…',
    n: 'Người ta thường lập luận rằng giáo dục nên miễn phí vì đó là quyền cơ bản.',
  },
  'catalog:ss:in-my-opinion': {
    d: 'Nêu quan điểm cá nhân rõ ràng.',
    n: 'Theo tôi, chính phủ nên đầu tư nhiều hơn vào giao thông công cộng.',
  },
  'catalog:ss:it-is-widely-believed': {
    d: 'Nêu quan điểm phổ biến — mang tính khách quan.',
    n: 'Nhiều người tin rằng công nghệ cải thiện chất lượng cuộc sống, đặc biệt khi được dùng có trách nhiệm.',
  },
  'catalog:ss:there-is-no-doubt': {
    d: 'Nhấn mạnh sự chắc chắn và hệ quả.',
    n: 'Không còn nghi ngờ gì rằng biến đổi khí hậu cần hành động khẩn cấp, vì vậy chính phủ phải đầu tư năng lượng xanh.',
  },
  'catalog:ss:what-matters-is': {
    d: 'Nhấn mạnh điều quan trọng thật sự.',
    n: 'Điều quan trọng là nỗ lực đều đặn, không chỉ tài năng bẩm sinh.',
  },
  'catalog:ss:it-is-essential-that': {
    d: 'Nhấn mạnh sự cần thiết và mục đích.',
    n: 'Điều thiết yếu là học sinh phát triển tư duy phản biện để có thể giải quyết vấn đề phức tạp.',
  },
  'catalog:ss:having-said-that': {
    d: 'Nhượng bộ tinh tế sau khi nêu ý trước.',
    n: 'Học online tiện lợi. Dù vậy, nó không thể thay thế hoàn toàn tương tác lớp học.',
  },
  'catalog:ss:to-what-extent': {
    d: 'Câu trả lời dạng “mức độ nào” (IELTS).',
    n: 'Công nghệ mang lại lợi ích cho xã hội đến mức nào phụ thuộc vào cách nó được quản lý.',
  },
  'catalog:ss:rather-than': {
    d: 'Lựa chọn ưu tiên — thay vì…',
    n: 'Chúng ta nên phòng bệnh thay vì chỉ chữa khi đã mắc.',
  },
  'catalog:ss:instead-of': {
    d: 'Thay vì… — thay thế hành động/danh từ.',
    n: 'Hãy đi tàu thay vì lái xe trong tắc đường.',
  },
  'catalog:ss:it-is-high-time': {
    d: 'Đã đến lúc phải… (past subjunctive).',
    n: 'Đã đến lúc chính phủ phải nghiêm túc với biến đổi khí hậu trước khi quá muộn.',
  },
  'catalog:ss:no-sooner': {
    d: 'Vừa… thì… (đảo ngữ nâng cao).',
    n: 'Tôi vừa đến thì trời bắt đầu mưa.',
  },
  'catalog:ss:hardly-when': {
    d: 'Vừa mới… thì… (đảo ngữ).',
    n: 'Cuộc họp vừa bắt đầu thì chuông báo cháy reo.',
  },
  'catalog:ss:the-fact-that': {
    d: 'Dùng mệnh đề danh ngữ học thuật.',
    n: 'Việc nhiều người làm việc tại nhà cho thấy văn hóa văn phòng đang thay đổi.',
  },
  'catalog:ss:it-seems-that': {
    d: 'Đưa nhận định dè dặt — có vẻ như…',
    n: 'Có vẻ như làm việc từ xa sẽ vẫn phổ biến, đặc biệt trong giới chuyên gia trẻ.',
  },
  'catalog:ss:a-growing-number': {
    d: 'Mô tả xu hướng tăng — ngày càng nhiều…',
    n: 'Ngày càng nhiều người chọn giờ làm linh hoạt.',
  },
  'catalog:ss:play-a-role': {
    d: 'Collocation Writing — đóng vai trò then chốt.',
    n: 'Giáo viên đóng vai trò then chốt trong việc định hình tương lai học sinh.',
  },
  'catalog:ss:lead-to': {
    d: 'Nêu hệ quả — dẫn đến…',
    n: 'Thiếu ngủ có thể dẫn đến giảm tập trung.',
  },
  'catalog:ss:result-in': {
    d: 'Hệ quả formal — dẫn tới kết quả…',
    n: 'Lập kế hoạch kém có thể dẫn đến chậm tiến độ dự án.',
  },
  'catalog:ss:be-likely-to': {
    d: 'Dự đoán khả năng — có khả năng…',
    n: 'Người trẻ có khả năng thay đổi nghề nghiệp thường xuyên hơn.',
  },
  'catalog:ss:tend-to': {
    d: 'Xu hướng chung — thường…',
    n: 'Cư dân thành phố thường phụ thuộc nhiều hơn vào giao thông công cộng.',
  },
  'catalog:ss:it-is-worth': {
    d: 'Đáng để làm gì — worth + V-ing.',
    n: 'Đáng để học ngoại ngữ thứ hai nếu bạn muốn nhiều lựa chọn nghề nghiệp hơn.',
  },
  'catalog:ss:far-from': {
    d: 'Nhấn mạnh khoảng cách với kỳ vọng — còn xa mới…',
    n: 'Giải pháp còn xa mới hoàn hảo.',
  },
  'catalog:ss:in-terms-of': {
    d: 'Xét về phương diện… (Writing).',
    n: 'Xét về chi phí, giao thông công cộng hiệu quả hơn.',
  },
  'catalog:ss:when-it-comes-to': {
    d: 'Khi nói đến… — chuyển chủ đề tự nhiên.',
    n: 'Khi nói đến sức khỏe tinh thần, phòng bệnh hơn chữa bệnh.',
  },
  'catalog:ss:used-to': {
    d: 'Đã từng… (thói quen quá khứ).',
    n: 'Tôi đã từng sống ở nông thôn, nhưng không còn nữa.',
  },
  'catalog:ss:be-used-to': {
    d: 'Quen với…',
    n: 'Cô ấy quen làm việc dưới áp lực.',
  },
  'catalog:ss:get-used-to': {
    d: 'Dần quen với…',
    n: 'Cần thời gian để quen thói quen mới sau khi chuyển ra nước ngoài.',
  },
}

// Generic fallbacks by category when id not in VI map
const CAT_FALLBACK = {
  'Liên từ / Lý do': {
    d: 'Nối ý nguyên nhân – kết quả trong câu/đoạn văn.',
    n: 'Dùng cấu trúc này để giải thích lý do hoặc hệ quả một cách mạch lạc.',
  },
  'So sánh': {
    d: 'So sánh mức độ, số lượng hoặc đặc điểm giữa hai ý.',
    n: 'Điền A và B sao cho câu so sánh tự nhiên, đúng ngữ pháp.',
  },
  'Mục đích': {
    d: 'Nêu mục đích của hành động.',
    n: 'A là hành động chính; B là mục đích cần đạt.',
  },
  'Điều kiện': {
    d: 'Nêu điều kiện và kết quả có thể xảy ra.',
    n: 'A là điều kiện; B là kết quả.',
  },
  'Tương phản': {
    d: 'Nối hai ý đối lập hoặc nhượng bộ.',
    n: 'A và B tạo sự tương phản rõ ràng, tự nhiên.',
  },
  Khác: {
    d: 'Cấu trúc Writing / collocation / nhấn mạnh thường gặp.',
    n: 'Điền A và B để hoàn thành câu theo mẫu.',
  },
}

function fixCat(raw, id) {
  const c = fixCategoryGuess(raw)
  if (Object.keys(CAT_FALLBACK).includes(c)) return c
  // id-based
  if (/if-|unless|provided|as-long|even-if|whether|in-case|only-if|suppose|condition|should-you|were-i|had-it|but-for|or-else|otherwise/.test(id))
    return 'Điều kiện'
  if (/although|despite|however|whereas|while|nevertheless|contrast|admittedly|conversely|yet|unlike|comparison/.test(id))
    return 'Tương phản'
  if (/more|less|as-as|compared|prefer|rather|superior|twice|three|similarly|likewise|just-as/.test(id))
    return 'So sánh'
  if (/so-that|in-order|so-as|purpose|aim|intention|attempt|view-to|fear-of/.test(id))
    return 'Mục đích'
  if (/because|due-to|result|therefore|thanks|owing|reason|given|hence|account|virtue|light-of/.test(id))
    return 'Liên từ / Lý do'
  return 'Khác'
}

function fixCategoryGuess(c) {
  // ASCII-safe detection of corrupted category strings
  const lower = c.toLowerCase()
  if (c.includes('So') && (c.includes('sánh') || c.includes('sÃ') || c.includes('nh'))) return 'So sánh'
  if (c.includes('Mục') || (c.includes('M') && c.includes('ch'))) return 'Mục đích'
  if (c.includes('Điều') || c.includes('kiện') || c.includes('kiá')) return 'Điều kiện'
  if (c.includes('Tương') || c.includes('phản') || c.includes('TÆ')) return 'Tương phản'
  if (c.includes('Khác') || c === 'Khác' || c.includes('KhÃ')) return 'Khác'
  if (c.includes('Liên') || c.includes('Lý') || c.includes('do') || c.includes('LiÃ')) return 'Liên từ / Lý do'
  // already correct UTF-8
  if (c === 'Liên từ / Lý do' || c === 'So sánh' || c === 'Mục đích' || c === 'Điều kiện' || c === 'Tương phản' || c === 'Khác')
    return c
  return 'Khác'
}

function esc(s) {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r?\n/g, '\\n')
}

function escTitle(s) {
  // prefer double quotes if contains single quote
  if (s.includes("'") && !s.includes('"')) {
    return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
  }
  return `'${esc(s)}'`
}

const rebuilt = parsed.map(item => {
  const cat = fixCat(item.category, item.id)
  const vi = VI[item.id] ?? CAT_FALLBACK[cat] ?? CAT_FALLBACK.Khác
  return {
    id: item.id,
    title: item.title,
    template: item.template,
    description: vi.d,
    category: cat,
    exampleA: item.exampleA,
    exampleB: item.exampleB,
    exampleNoteVi: vi.n,
    starred: item.starred,
    cefr: item.cefr,
  }
})

if (rebuilt.length < 100) {
  console.error('Too few parsed items — abort', rebuilt.length)
  process.exit(1)
}

const lines = []
lines.push(`import type { SentenceStructure } from '@ryan/db'`)
lines.push(``)
lines.push(`type CatalogStructure = Omit<SentenceStructure, 'createdAt' | 'updatedAt'>`)
lines.push(``)
lines.push(`/**`)
lines.push(` * Core curated sentence structures (UTF-8).`)
lines.push(` * Expanded to 1670 via sentenceStructures.expand.ts`)
lines.push(` */`)
lines.push(`export const CORE_SENTENCE_STRUCTURES: CatalogStructure[] = [`)

for (const s of rebuilt) {
  lines.push(`  {`)
  lines.push(`    id: '${esc(s.id)}',`)
  lines.push(`    title: ${escTitle(s.title)},`)
  lines.push(`    template: ${escTitle(s.template)},`)
  lines.push(`    description: '${esc(s.description)}',`)
  lines.push(`    category: '${esc(s.category)}',`)
  lines.push(`    exampleA: '${esc(s.exampleA)}',`)
  lines.push(`    exampleB: '${esc(s.exampleB)}',`)
  lines.push(`    exampleNoteVi: '${esc(s.exampleNoteVi)}',`)
  lines.push(`    starred: ${s.starred},`)
  lines.push(`    cefr: '${esc(s.cefr)}',`)
  lines.push(`  },`)
}

lines.push(`]`)
lines.push(``)

const out = lines.join('\n')
fs.writeFileSync(CORE_PATH, out, { encoding: 'utf8' })
console.log('Wrote', CORE_PATH)
console.log('Count', rebuilt.length)

// sanity
const check = fs.readFileSync(CORE_PATH, 'utf8')
console.log('has used-to clean:', check.includes('Đã từng… (thói quen quá khứ).'))
console.log('has Chỉ vì:', check.includes('Chỉ vì bạn thất bại'))
console.log('mojibake markers:', (check.match(/Ã.|Ä.|á»|â€/g) || []).length)
