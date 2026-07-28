import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import '../features/writing/writingLibrary.css'

const COPY = {
  libraryTitle: 'Th\u01b0 Vi\u1ec7n',
  translateTitle: 'Luy\u1ec7n d\u1ecbch IELTS',
  translateDesc:
    'H\u1ecdc idea, ph\u01b0\u01a1ng ph\u00e1p vi\u1ebft b\u00e0i, collocation si\u00eau x\u1ecbn m\u1ed9t c\u00e1ch t\u1ed1i \u01b0u nh\u1ea5t',
  practiceTitle: 'Luy\u1ec7n vi\u1ebft IELTS',
  practiceDesc:
    'Kho c\u00e2u h\u1ecfi kh\u1ed5ng l\u1ed3, \u0111\u01b0\u1ee3c Ryan s\u1eeda t\u00e2m t\u1eeb c\u00e1c \u0111\u1ec1 thi th\u1eadt \u1edf qu\u00e1 kh\u1ee9. C\u00e1c b\u1ea1n vi\u1ebft \u0111\u1ec3 \u0111\u01b0\u1ee3c AI ch\u1ea5m ch\u1eefa nha',
  cambridgeTitle: 'Luy\u1ec7n vi\u1ebft Cambridge A2\u2013C2',
  cambridgeDesc:
    'Luy\u1ec7n vi\u1ebft theo \u0111\u00fang c\u1ea5u tr\u00fac \u0111\u1ec1 Cambridge v\u1edbi \u0111\u1ec1 m\u1eabu th\u1eadt v\u00e0 workspace ch\u1ea5m AI hi\u1ec7n c\u00f3.',
  dashboardTitle: 'Dashboard th\u1ed1ng k\u00ea',
  dashboardDesc:
    'L\u1ed7i hay sai, \u0111i\u1ec3m m\u1ea1nh, \u0111i\u1ec3m y\u1ebfu v\u00e0 xu h\u01b0\u1edbng band \u2014 t\u1ed5ng h\u1ee3p t\u1eeb c\u00e1c l\u1ea7n ch\u1ea5m AI',
} as const

export default function WritingLibraryPage() {
  const navigate = useNavigate()

  return (
    <div className="writing-library">
      <div className="writing-library-inner">
        <h1 className="writing-library-title">
          {COPY.libraryTitle} <span className="wr-accent">Writing</span>
        </h1>

        <div className="writing-library-cards">
          <button
            type="button"
            className="writing-library-card writing-library-card--translate"
            onClick={() => navigate('/app/writing/translate')}
          >
            <div className="writing-library-card-body">
              <h2 className="writing-library-card-title">{COPY.translateTitle}</h2>
              <p className="writing-library-card-desc">{COPY.translateDesc}</p>
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
              <h2 className="writing-library-card-title">{COPY.practiceTitle}</h2>
              <p className="writing-library-card-desc">{COPY.practiceDesc}</p>
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
              <h2 className="writing-library-card-title">{COPY.cambridgeTitle}</h2>
              <p className="writing-library-card-desc">{COPY.cambridgeDesc}</p>
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
              <h2 className="writing-library-card-title">{COPY.dashboardTitle}</h2>
              <p className="writing-library-card-desc">{COPY.dashboardDesc}</p>
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
