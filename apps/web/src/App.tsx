import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './features/auth/ProtectedRoute'
import PageFallback from './components/PageFallback'
import TextSelectionToolbar from './components/TextSelectionToolbar'

const LandingPage    = lazy(() => import('./pages/landing/LandingPage'))
const AuthCallback   = lazy(() => import('./features/auth/AuthCallback'))
const AppShell       = lazy(() => import('./pages/AppShell'))
const HomePage       = lazy(() => import('./pages/HomePage'))
const VocabularyPage = lazy(() => import('./pages/VocabularyPage'))
const WritingLayout        = lazy(() => import('./pages/WritingLayout'))
const WritingLibraryPage   = lazy(() => import('./pages/WritingLibraryPage'))
const WritingPracticePage  = lazy(() => import('./pages/WritingPracticePage'))
const WritingIeltsGenrePage = lazy(() => import('./pages/WritingIeltsGenrePage'))
const WritingIeltsPracticePage = lazy(() => import('./pages/WritingIeltsPracticePage'))
const WritingCambridgePage = lazy(() => import('./pages/WritingCambridgePage'))
const WritingCambridgeGenrePage = lazy(() => import('./pages/WritingCambridgeGenrePage'))
const WritingCambridgePracticePage = lazy(() => import('./pages/WritingCambridgePracticePage'))
const WritingDashboardPage = lazy(() => import('./pages/WritingDashboardPage'))
const ListeningLayout      = lazy(() => import('./pages/ListeningLayout'))
const ListeningLibraryPage = lazy(() => import('./features/listening/ListeningLibraryPage'))
const ListeningLessonPage  = lazy(() => import('./features/listening/ListeningLessonPage'))
const ExamHome = lazy(() => import('./features/exam/ExamHome'))
const ExamTrackPage = lazy(() => import('./features/exam/ExamTrackPage'))
const FullMockIntro = lazy(() => import('./features/exam/FullMockIntro'))
const FullMockSummary = lazy(() => import('./features/exam/FullMockSummary'))
const ReadingTest = lazy(() => import('./features/exam/ReadingTest'))
const ReadingPartPicker = lazy(() => import('./features/exam/ReadingPartPicker'))
const ListeningTest = lazy(() => import('./features/exam/ListeningTest'))
const WritingTest = lazy(() => import('./features/exam/WritingTest'))
const WritingMockTest = lazy(() => import('./features/exam/WritingMockTest'))
const TranslationPage        = lazy(() => import('./pages/TranslationPage'))
const TranslationGenrePage   = lazy(() => import('./pages/TranslationGenrePage'))
const TranslationPracticePage = lazy(() => import('./pages/TranslationPracticePage'))
const MindmapPage      = lazy(() => import('./pages/MindmapPage'))
const SentenceStructureListPage = lazy(() => import('./pages/SentenceStructureListPage'))
const SentenceStructurePracticePage = lazy(() => import('./pages/SentenceStructurePracticePage'))
const SettingsPage   = lazy(() => import('./pages/SettingsPage'))
const AdminPage      = lazy(() => import('./features/admin/AdminPage'))

export default function App() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    // Xóa Cache Storage catalog cũ (SW cache-first từng chặn MP3 → NS_ERROR_INTERCEPTION_FAILED trên Firefox)
    if (typeof caches !== 'undefined') {
      void caches.keys().then(keys =>
        Promise.all(
          keys
            .filter(k => k.startsWith('ryan-catalog-'))
            .map(k => caches.delete(k)),
        ),
      )
    }
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(reg => { void reg.update() })
      .catch(() => {})
  }, [])

  return (
    <Suspense fallback={<PageFallback />}>
      <TextSelectionToolbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected — toàn bộ app học nằm dưới /app */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/vocab" replace />} />
          <Route path="home"      element={<HomePage />} />
          <Route path="vocab"     element={<VocabularyPage />} />
          <Route path="writing" element={<WritingLayout />}>
            <Route index element={<WritingLibraryPage />} />
            <Route path="practice" element={<WritingPracticePage />} />
            <Route path="practice/:track" element={<WritingIeltsGenrePage />} />
            <Route path="practice/:track/:genre" element={<WritingIeltsPracticePage />} />
            <Route path="cambridge" element={<WritingCambridgePage />} />
            <Route path="cambridge/:level" element={<WritingCambridgeGenrePage />} />
            <Route path="cambridge/:level/:genre" element={<WritingCambridgePracticePage />} />
            <Route path="dashboard" element={<WritingDashboardPage />} />
            <Route path="translate" element={<TranslationPage />} />
            <Route path="translate/:track" element={<TranslationGenrePage />} />
            <Route path="translate/:track/:genre" element={<TranslationPracticePage />} />
          </Route>
          <Route path="listening" element={<ListeningLayout />}>
            <Route index element={<ListeningLibraryPage />} />
            <Route path=":lessonId" element={<ListeningLessonPage />} />
          </Route>
          <Route path="exam">
            <Route index element={<ExamHome />} />
            <Route path="track/:trackId/:arg2?/:arg3?" element={<ExamTrackPage />} />
            <Route path="full/:mockId" element={<FullMockIntro />} />
            <Route path="full/:mockId/summary" element={<FullMockSummary />} />
            <Route path="reading/:examId" element={<ReadingTest />} />
            <Route path="reading-picker/:examId" element={<ReadingPartPicker />} />
            <Route path="listening/:examId" element={<ListeningTest />} />
            <Route path="listening" element={<Navigate to="/app/exam/track/cambridge/a2" replace />} />
            <Route path="writing/:mockId" element={<WritingMockTest />} />
            <Route path="writing" element={<WritingTest />} />
          </Route>
          <Route path="translation" element={<Navigate to="/app/writing/translate" replace />} />
          <Route path="mindmap"     element={<MindmapPage />} />
          <Route path="sentence-structure" element={<SentenceStructureListPage />} />
          <Route path="sentence-structure/:structureId" element={<SentenceStructurePracticePage />} />
          <Route path="settings"  element={<SettingsPage />} />
          <Route path="admin"     element={<AdminPage />} />
        </Route>

        {/* OAuth hash lạ (#access_token=...) — tránh màn trống */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
