import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import '../features/writing/writingLibrary.css'

export default function WritingLibraryPage() {
  const navigate = useNavigate()

  return (
    <div className="writing-library">
      <div className="writing-library-inner">
        <h1 className="writing-library-title">
          Thư Viện <span className="wr-accent">Writing</span>
        </h1>

        <div className="writing-library-cards">
          <button
            type="button"
            className="writing-library-card writing-library-card--translate"
            onClick={() => navigate('/app/writing/translate')}
          >
            <div className="writing-library-card-body">
              <h2 className="writing-library-card-title">Luyện dịch IELTS</h2>
              <p className="writing-library-card-desc">
                Học idea, phương pháp viết bài, collocation siêu xịn một cách tối ưu nhất
              </p>
              <span className="writing-library-card-cta">
                Explore <ArrowRight size={14} />
              </span>
            </div>
          </button>

          <button
            type="button"
            className="writing-library-card writing-library-card--practice"
            onClick={() => navigate('/app/writing/practice')}
          >
            <div className="writing-library-card-body">
              <h2 className="writing-library-card-title">Luyện viết IELTS</h2>
              <p className="writing-library-card-desc">
                Kho câu hỏi khổng lồ, được Ryan sửa tâm từ các đề thi thật ở quá khứ.
                Các bạn viết để được AI chấm chữa nhaa
              </p>
              <span className="writing-library-card-cta">
                Explore <ArrowRight size={14} />
              </span>
            </div>
          </button>

          <button
            type="button"
            className="writing-library-card writing-library-card--cambridge"
            onClick={() => navigate('/app/writing/cambridge')}
          >
            <div className="writing-library-card-body">
              <h2 className="writing-library-card-title">Luyện viết Cambridge A2–C2</h2>
              <p className="writing-library-card-desc">
                KET, PET, FCE, CAE, CPE — đề Cambridge thật từ A2 đến C2.
                Viết và được AI chấm theo khung trình độ
              </p>
              <span className="writing-library-card-cta">
                Explore <ArrowRight size={14} />
              </span>
            </div>
          </button>

          <button
            type="button"
            className="writing-library-card writing-library-card--dashboard"
            onClick={() => navigate('/app/writing/dashboard')}
          >
            <div className="writing-library-card-body">
              <h2 className="writing-library-card-title">Dashboard thống kê</h2>
              <p className="writing-library-card-desc">
                Lỗi hay sai, điểm mạnh, điểm yếu và xu hướng band — tổng hợp từ các lần chấm AI
              </p>
              <span className="writing-library-card-cta">
                Explore <ArrowRight size={14} />
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
