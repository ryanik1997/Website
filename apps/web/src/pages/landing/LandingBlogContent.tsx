import { useState } from 'react'
import { ArrowLeft, Clock3 } from 'lucide-react'

const SERIF: React.CSSProperties = { fontFamily: 'var(--font-app)' }

export type BlogPost = {
  id: string
  title: string
  excerpt: string
  date: string
  readMin: number
  tag: string
  body: string[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'srs-30-phut',
    title: '30 phút SRS mỗi ngày: ít hơn bạn nghĩ, bền hơn bạn tưởng',
    excerpt:
      'Không cần học 200 từ/đêm. Một phiên SRS ngắn, đúng lúc “sắp quên”, giúp từ vựng ở lại lâu hơn cả tuần nhồi chữ.',
    date: '12/06/2026',
    readMin: 5,
    tag: 'Từ vựng',
    body: [
      'Nhiều bạn mở app từ vựng với mục tiêu “hôm nay học hết deck”. Kết quả: đầu óc mệt, hôm sau không mở lại. SRS (Spaced Repetition) làm việc ngược lại: hệ thống đưa ra đúng những thẻ bạn sắp quên — không nhiều, không ít.',
      'Gợi ý thực tế: đặt timer 25–30 phút. Học đến khi hết phiên, không “làm thêm cho xong”. Nếu còn thẻ due, để ngày mai. Não cần thời gian consolidate; nhồi thêm lúc mệt chỉ tạo ảo giác đã học.',
      'Trên Ryan English, mở deck → chế độ Lặp lại (SRS). Đánh giá trung thực (1–4). Nếu bạn luôn bấm “dễ” cho đỡ xấu hổ, lịch ôn sẽ sai và bạn sẽ “tưởng nhớ” cho đến ngày thi.',
      'Mẹo nhỏ: gắn SRS với thói quen có sẵn — sau cà phê sáng, hoặc trước khi tắt đèn. Thói quen gắn mỏ neo sẽ sống lâu hơn động lực “tôi sẽ học chăm từ thứ Hai”.',
    ],
  },
  {
    id: 'doc-hieu-cambridge',
    title: 'Reading Cambridge: đừng đọc hết — hãy đọc đúng chỗ',
    excerpt:
      'Bài Reading dài không phải để bạn “đọc sách”. Part đúng format, keyword, và loại câu hỏi quyết định điểm — không phải tốc độ đọc novel.',
    date: '28/05/2026',
    readMin: 7,
    tag: 'Reading',
    body: [
      'Lỗi phổ biến: đọc full passage như đọc truyện, rồi mới nhìn câu hỏi. Thời gian bay, não mỏi, và bạn vẫn phải quay lại tìm chi tiết.',
      'Cách làm gọn hơn: đọc nhanh câu hỏi trước (hoặc skimming tiêu đề + câu đầu đoạn), đánh dấu keyword / paraphrase. Sau đó mới “săn” thông tin trong text. Cambridge thích paraphrase — từ trong câu hỏi hiếm khi lặp nguyên xi.',
      'Với Matching headings / Gapped text: đừng tin “cảm giác trôi chảy”. Mỗi option phải có bằng chứng. Nếu không chỉ ra được 1–2 cụm trong bài, option đó chưa đủ chắc.',
      'Luyện trên đề thật (KET → CPE hoặc IELTS Academic) giúp não quen nhịp đề. Sau mỗi part, ghi 3 lỗi lặp lại (vội, paraphrase, thời gian). Sửa lỗi lặp quan trọng hơn “làm thêm 10 đề nhưng không review”.',
    ],
  },
  {
    id: 'nghe-shadow',
    title: 'Listening: khi “nghe hiểu” vẫn trượt chi tiết',
    excerpt:
      'Bạn hiểu đại ý nhưng miss số, tên, và linking. Đó không phải tai kém — là chưa train đúng tầng: nhận âm → giữ thông tin → trả lời.',
    date: '09/05/2026',
    readMin: 6,
    tag: 'Listening',
    body: [
      'Có ba tầng: (1) bắt được âm, (2) giữ được thông tin vài giây, (3) map sang câu hỏi. Nhiều bạn chỉ luyện (1) bằng cách nghe Netflix “cho quen tai”, rồi bất ngờ khi đề hỏi spelling / số liệu.',
      'Thử chu kỳ 3 bước với 1 đoạn ngắn: nghe không script → ghi keyword → đối chiếu transcript. Chỗ sai thường rơi vào ending -s/-ed, connected speech, hoặc số. Ghi lại pattern đó.',
      'Dictation / Nghe & gõ trên Ryan English ép bạn xuống tầng chi tiết. Đừng skip phần khó: chính chỗ đó đang “ăn” điểm của bạn trong Part 1–4 IELTS hay KET–FCE.',
      'Lịch gợi ý: 4 buổi/tuần × 20–25 phút audio + 5 phút review lỗi. Nghe cả ngày mà không pause–check thì chỉ tạo cảm giác bận rộn.',
    ],
  },
  {
    id: 'viet-band-6',
    title: 'Writing: từ “viết dài” sang “viết đúng việc đề hỏi”',
    excerpt:
      'Band thấp thường không vì thiếu từ hay. Vì lạc task, ý lộn xộn, và không có skeleton trước khi gõ câu đầu tiên.',
    date: '21/04/2026',
    readMin: 8,
    tag: 'Writing',
    body: [
      'Trước khi viết: gạch 4–5 ý (IELTS Task 2) hoặc checklist part (Cambridge Writing). Nếu không outline được trong 3–5 phút, bạn chưa hiểu đề — đừng bắt đầu paragraph.',
      'Một đoạn = một ý chính + 1–2 support + example ngắn. Tránh “từ điển di động”: nhồi collocation đẹp nhưng không phục vụ luận điểm.',
      'Sau khi viết, đọc lại với 3 câu hỏi: (1) Có trả lời đúng task không? (2) Có link giữa các ý không? (3) Có lỗi grammar lặp (article, tense, subject–verb) không?',
      'Dùng chấm AI như gương, không như đáp án cuối. Hỏi: lỗi nào mình hay lặp? Sửa 2 lỗi hệ thống quan trọng hơn viết thêm 1 essay mới mà lặp đúng 2 lỗi đó.',
    ],
  },
  {
    id: 'lich-hoc-ban-ron',
    title: 'Lịch học khi bận: 5 buổi “tối thiểu có lời” trong tuần',
    excerpt:
      'Không có 3 tiếng/ngày? Vẫn lên band được nếu lịch đủ đa dạng kỹ năng và có 1 buổi mock nhẹ.',
    date: '03/04/2026',
    readMin: 4,
    tag: 'Lịch học',
    body: [
      'Mẫu tuần tối thiểu (khoảng 5–6 giờ tổng): T2 SRS + listening ngắn · T3 Reading 1 part · T5 Writing outline + 1 đoạn · T6 Listening full section · CN Review lỗi + 30 phút đề yếu nhất.',
      'Quy tắc vàng: mỗi buổi chỉ một mục tiêu chính. “Hôm nay vừa SRS vừa full mock vừa writing” = overload, và thường kết thúc bằng việc không làm gì.',
      'Cuối tuần: 10 phút nhìn lại. Tuần này band giả định của bạn tăng ở skill nào? Skill nào đứng yên? Điều chỉnh tuần sau — đừng tự động “làm lại y hệt”.',
      'Nếu miss 2 ngày: đừng “học bù 4 tiếng”. Quay lại phiên ngắn hôm nay. Consistency thua streak hoàn hảo trên giấy.',
    ],
  },
  {
    id: 'lo-au-truoc-thi',
    title: 'Lo âu trước thi: biến năng lượng run thành checklist',
    excerpt:
      'Run tay không phải dấu hiệu bạn kém. Là não bảo vệ bạn. Việc của bạn là cho não một kịch bản rõ ràng.',
    date: '18/03/2026',
    readMin: 5,
    tag: 'Tâm lý',
    body: [
      'Tuần trước thi: giảm học “cái mới”. Ưu tiên đề quen format, review lỗi cũ, ngủ đủ. Nhồi content mới lúc này hay tạo hoảng hơn là điểm.',
      'Viết checklist ngày thi: giờ dậy, giấy tờ, nước, giờ có mặt, order kỹ năng. Não thích dự đoán được — checklist giảm tải quyết định lúc adrenaline cao.',
      'Trong phòng thi: nếu blank, thở 4 giây–thở ra 6 giây, nhìn câu hỏi tiếp theo. Một câu miss không sập cả bài. Bảo vệ các câu còn lại quan trọng hơn “cứu” một câu bằng 5 phút hoảng.',
      'Sau thi: đừng post-mortem ngay trong ngày nếu bạn kiệt. Ghi 3 dòng cảm xúc, rồi nghỉ. Review kỹ thuật để dành cho khi đầu óc tỉnh.',
    ],
  },
]

type Props = {
  /** Khi user bấm CTA trong bài → đóng blog & mở pricing (optional) */
  onCtaStudy?: () => void
}

export default function LandingBlogContent({ onCtaStudy }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const active = activeId ? BLOG_POSTS.find((p) => p.id === activeId) ?? null : null

  if (active) {
    return (
      <article className="landing-blog landing-blog--detail">
        <button
          type="button"
          className="landing-blog__back"
          onClick={() => setActiveId(null)}
        >
          <ArrowLeft size={16} strokeWidth={2.2} />
          Tất cả bài viết
        </button>

        <div className="landing-blog__meta">
          <span className="landing-blog__tag">{active.tag}</span>
          <span className="landing-blog__date">{active.date}</span>
          <span className="landing-blog__read">
            <Clock3 size={13} strokeWidth={2.2} aria-hidden />
            {active.readMin} phút đọc
          </span>
        </div>

        <h3 className="landing-blog__detail-title" style={SERIF}>
          {active.title}
        </h3>

        <div className="landing-blog__body">
          {active.body.map((para) => (
            <p key={para.slice(0, 48)}>{para}</p>
          ))}
        </div>

        {onCtaStudy && (
          <button type="button" className="landing-blog__cta" onClick={onCtaStudy}>
            Vào luyện ngay →
          </button>
        )}
      </article>
    )
  }

  return (
    <div className="landing-blog">
      <header className="landing-blog__intro">
        <p className="landing-blog__kicker">Góc học thật</p>
        <h3 className="landing-blog__title" style={SERIF}>
          Ghi chú từ phòng học — không phải brochure marketing.
        </h3>
        <p className="landing-blog__lead">
          Bài ngắn về SRS, Reading, Listening, Writing và lịch học khi bận. Đọc 5 phút,
          áp dụng buổi tối nay.
        </p>
      </header>

      <ul className="landing-blog__list">
        {BLOG_POSTS.map((post) => (
          <li key={post.id}>
            <button
              type="button"
              className="landing-blog__card"
              onClick={() => setActiveId(post.id)}
            >
              <div className="landing-blog__card-top">
                <span className="landing-blog__tag">{post.tag}</span>
                <span className="landing-blog__read">
                  <Clock3 size={12} strokeWidth={2.2} aria-hidden />
                  {post.readMin} phút
                </span>
              </div>
              <h4 className="landing-blog__card-title">{post.title}</h4>
              <p className="landing-blog__card-excerpt">{post.excerpt}</p>
              <div className="landing-blog__card-foot">
                <span className="landing-blog__date">{post.date}</span>
                <span className="landing-blog__more">Đọc bài →</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
