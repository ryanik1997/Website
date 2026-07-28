import { Link, useLocation } from 'react-router-dom'
import LegalFooter from '../../components/LegalFooter'
import './legalPage.css'

const TERMS_SECTIONS = [
  {
    title: '1. Phạm vi dịch vụ',
    body: 'Ryan English cung cấp công cụ học tiếng Anh, luyện thi, ôn tập SRS và nội dung học tập theo từng gói tài khoản. Một số tính năng có thể thay đổi, được cập nhật hoặc ngừng cung cấp để bảo đảm chất lượng và an toàn hệ thống.',
  },
  {
    title: '2. Tài khoản và quyền truy cập',
    body: 'Bạn chịu trách nhiệm bảo mật tài khoản và không được chia sẻ, bán lại hoặc cho thuê quyền truy cập. Quyền sử dụng nội dung phụ thuộc vào gói đang hoạt động và không đồng nghĩa với quyền sở hữu hay quyền phân phối nội dung.',
  },
  {
    title: '3. Hành vi bị cấm',
    body: 'Nghiêm cấm crawl, scrape, thu thập tự động, dùng bot, tải xuống hàng loạt, dò quét API, vượt giới hạn truy cập, sao chép có hệ thống nội dung hoặc giao diện, phát tán đề, audio, đáp án, sách và dữ liệu độc quyền của dịch vụ.',
  },
  {
    title: '4. Bản quyền',
    body: 'Thiết kế, phần mềm, lộ trình, bài giảng và nội dung do Ryan English tự biên soạn được bảo hộ theo pháp luật áp dụng. Nhãn hiệu và tài liệu của bên thứ ba thuộc về chủ sở hữu tương ứng; việc cung cấp quyền học không chuyển giao quyền sở hữu trí tuệ.',
  },
  {
    title: '5. Xử lý vi phạm',
    body: 'Ryan English có quyền giới hạn, tạm khóa hoặc chấm dứt tài khoản có dấu hiệu lạm dụng, chia sẻ tài khoản, khai thác tự động hoặc xâm phạm bản quyền. Trường hợp vi phạm nghiêm trọng có thể không được hoàn tiền, trong phạm vi pháp luật cho phép.',
  },
  {
    title: '6. Giới hạn trách nhiệm',
    body: 'Dịch vụ hỗ trợ việc học nhưng không bảo đảm một mức điểm thi cụ thể. Người dùng cần tự kiểm tra yêu cầu chính thức của đơn vị tổ chức thi và chịu trách nhiệm đối với quyết định học tập của mình.',
  },
]

const PRIVACY_SECTIONS = [
  {
    title: '1. Dữ liệu được thu thập',
    body: 'Dịch vụ có thể lưu email, tên hiển thị, ảnh đại diện, gói tài khoản, tiến độ học, bài viết, lịch sử ôn tập, yêu cầu thanh toán và nhật ký kỹ thuật cần thiết để vận hành, đồng bộ và bảo vệ hệ thống.',
  },
  {
    title: '2. Mục đích sử dụng',
    body: 'Dữ liệu được dùng để xác thực, đồng bộ tiến độ, cá nhân hóa trải nghiệm, xử lý hỗ trợ, quản lý quyền truy cập, phát hiện lạm dụng và cải thiện độ ổn định của dịch vụ.',
  },
  {
    title: '3. Bảo mật và lưu trữ',
    body: 'Ryan English áp dụng kiểm soát truy cập, Row-Level Security, URL ký có thời hạn, giới hạn tần suất và nhật ký an ninh. Không hệ thống nào an toàn tuyệt đối; chúng tôi duy trì quy trình vá lỗi và giảm thiểu rủi ro hợp lý.',
  },
  {
    title: '4. Bên xử lý dữ liệu',
    body: 'Dữ liệu có thể được xử lý bởi các nhà cung cấp hạ tầng cần thiết như dịch vụ lưu trữ, xác thực, chống bot và triển khai ứng dụng. Chỉ dữ liệu cần thiết cho mục đích vận hành mới được truyền cho các bên này.',
  },
  {
    title: '5. Quyền của người dùng',
    body: 'Bạn có thể yêu cầu xem, chỉnh sửa hoặc xóa dữ liệu cá nhân trong phạm vi pháp luật và nghĩa vụ lưu trữ áp dụng. Một số dữ liệu bảo mật hoặc giao dịch có thể cần được giữ lại trong thời hạn hợp lý.',
  },
  {
    title: '6. Liên hệ',
    body: 'Các yêu cầu về quyền riêng tư hoặc bảo mật có thể gửi qua kênh liên hệ chính thức được công bố trên trang chủ Ryan English.',
  },
]

export default function LegalPage() {
  const { pathname } = useLocation()
  const privacy = pathname === '/privacy'
  const title = privacy ? 'Chính sách quyền riêng tư' : 'Điều khoản dịch vụ'
  const sections = privacy ? PRIVACY_SECTIONS : TERMS_SECTIONS

  return (
    <div className="legal-page">
      <div className="legal-page__grid" aria-hidden />
      <header className="legal-page__header">
        <Link to="/" className="legal-page__brand">Ryan English</Link>
        <Link to="/" className="legal-page__back">← Trang chủ</Link>
      </header>

      <main className="legal-page__document">
        <p className="legal-page__eyebrow">Pháp lý · Ryan English</p>
        <h1>{title}</h1>
        <p className="legal-page__updated">Cập nhật lần cuối: 16/07/2026</p>
        <p className="legal-page__intro">
          Vui lòng đọc kỹ tài liệu này trước khi sử dụng dịch vụ. Việc tiếp tục
          sử dụng Ryan English đồng nghĩa bạn chấp nhận các quy định áp dụng.
        </p>

        <div className="legal-page__sections">
          {sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </main>

      <LegalFooter />
    </div>
  )
}
