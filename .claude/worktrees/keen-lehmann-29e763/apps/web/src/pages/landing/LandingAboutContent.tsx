const AUTHOR_PHOTO = '/Tac_gia.jpg'

const SERIF: React.CSSProperties = { fontFamily: "'Instrument Serif', serif" }

const PILLARS = [
  {
    title: 'Luyện đều > học vội',
    body: '30–60 phút mỗi ngày, đúng kỹ năng bạn đang yếu, hiệu quả hơn cả tuần “học bù”.',
  },
  {
    title: 'Làm đề thật, sửa thật',
    body: 'IELTS và Cambridge chỉ nhích khi bạn làm đề chuẩn format, rồi xem lại lỗi — không chỉ xem đáp án.',
  },
  {
    title: 'Từ vựng phải vào lịch',
    body: 'SRS nhắc ôn đúng lúc. Đừng nhồi 100 từ một đêm rồi quên hết tuần sau.',
  },
] as const

export default function LandingAboutContent() {
  return (
    <div className="landing-about">
      <div className="landing-about__grid">
        <figure className="landing-about__photo-wrap">
          <img
            src={AUTHOR_PHOTO}
            alt="Ryan — founder Ryan English"
            className="landing-about__photo"
            width={480}
            height={600}
          />
          <figcaption className="landing-about__photo-cap">
            <span className="landing-about__name">Ryan</span>
            <span className="landing-about__role">Founder · Ryan English</span>
          </figcaption>
        </figure>

        <div className="landing-about__copy">
          <p className="landing-about__kicker">Về chúng tôi</p>
          <h3 className="landing-about__title" style={SERIF}>
            Một người học đêm khuya, xây công cụ cho người học đêm khuya.
          </h3>

          <div className="landing-about__letter">
            <p>Chào bạn,</p>
            <p>
              Mình là <strong>Ryan</strong> — người dựng Ryan English. Mình từng ngồi
              học IELTS / Cambridge giữa đêm, mệt vì phải nhảy giữa 5 app, 10 file PDF,
              và một đống ghi chú lộn xộn. Câu hỏi lúc đó rất đơn giản:{' '}
              <em>“Sao không có một chỗ chỉ để… học?”</em>
            </p>
            <p>
              Ryan English ra đời từ đó. Không hứa phép màu. Không hô hào “7.0 trong
              7 ngày”. Chỉ gom những thứ bạn thật sự cần mỗi buổi học: đề chuẩn, SRS từ
              vựng, luyện nghe, chấm viết, và một lộ trình rõ để bạn biết mình đang đứng
              ở đâu.
            </p>
            <p>
              Nếu bạn đang kẹt band, lo âu trước ngày thi, hay chỉ đơn giản là muốn học
              đều hơn — mình muốn bạn cảm thấy: đã có chỗ để tập trung. Bạn cứ việc
              focus. Phần còn lại, để Ryan lo.
            </p>
            <p className="landing-about__signoff">
              Học chậm nhưng đều.
              <br />
              <span style={SERIF}>— Ryan</span>
            </p>
          </div>

          <ul className="landing-about__pillars" aria-label="Nguyên tắc dạy học">
            {PILLARS.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.body}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
