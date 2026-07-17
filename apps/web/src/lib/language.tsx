import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { settingsRepo } from '@ryan/db'

export const LANGUAGE_IDS = ['en', 'ar', 'de', 'el', 'es', 'id', 'ja', 'ko', 'ms', 'pt', 'ru', 'th', 'tr', 'uk', 'vi', 'zh-CN', 'zh-TW'] as const
export type Language = typeof LANGUAGE_IDS[number]
export const LANGUAGES: { id: Language; label: string; nativeLabel: string }[] = [
  ['en', 'English', 'English'], ['ar', 'Arabic', 'العربية'], ['de', 'German', 'Deutsch'], ['el', 'Greek', 'Ελληνικά'],
  ['es', 'Spanish', 'Español'], ['id', 'Indonesian', 'Bahasa Indonesia'], ['ja', 'Japanese', '日本語'], ['ko', 'Korean', '한국어'],
  ['ms', 'Malay', 'Bahasa Melayu'], ['pt', 'Portuguese', 'Português'], ['ru', 'Russian', 'Русский'], ['th', 'Thai', 'ไทย'],
  ['tr', 'Turkish', 'Türkçe'], ['uk', 'Ukrainian', 'Українська'], ['vi', 'Vietnamese', 'Tiếng Việt'], ['zh-CN', 'Simplified Chinese', '简体中文'], ['zh-TW', 'Traditional Chinese', '繁體中文'],
].map(([id, label, nativeLabel]) => ({ id: id as Language, label, nativeLabel }))

const STORAGE_KEY = 'ryan-language'
const LOCALES: Record<Language, string> = {
  en: 'en-US', ar: 'ar', de: 'de-DE', el: 'el-GR', es: 'es-ES', id: 'id-ID', ja: 'ja-JP', ko: 'ko-KR', ms: 'ms-MY', pt: 'pt-PT', ru: 'ru-RU', th: 'th-TH', tr: 'tr-TR', uk: 'uk-UA', vi: 'vi-VN', 'zh-CN': 'zh-CN', 'zh-TW': 'zh-TW',
}
const NAV_KEYS = ['home', 'vocab', 'writing', 'listening', 'shadowing', 'exam', 'sentence', 'mindmap', 'settings'] as const
const NAV_DEFAULT = ['Overview', 'Vocabulary', 'Writing', 'Listening', 'Shadowing practice', 'Practice tests', 'Sentence structure', 'MindMap', 'Settings']
const NAV_TRANSLATIONS: Partial<Record<Language, string[]>> = {
  vi: ['Tổng quan', 'Từ vựng', 'Viết', 'Nghe', 'Luyện Shadowing', 'Luyện thi', 'Cấu trúc câu', 'MindMap', 'Cài đặt'],
  ar: ['نظرة عامة', 'المفردات', 'الكتابة', 'الاستماع', 'تدريب الظل', 'اختبارات التدريب', 'تركيب الجملة', 'MindMap', 'الإعدادات'],
  de: ['Übersicht', 'Vokabeln', 'Schreiben', 'Hören', 'Shadowing-Übung', 'Übungstests', 'Satzstruktur', 'MindMap', 'Einstellungen'],
  es: ['Resumen', 'Vocabulario', 'Escritura', 'Comprensión auditiva', 'Práctica de shadowing', 'Pruebas de práctica', 'Estructura de frases', 'MindMap', 'Configuración'],
  id: ['Ikhtisar', 'Kosakata', 'Menulis', 'Menyimak', 'Latihan shadowing', 'Tes latihan', 'Struktur kalimat', 'MindMap', 'Pengaturan'],
  ja: ['概要', '語彙', 'ライティング', 'リスニング', 'シャドーイング', '練習テスト', '文構造', 'MindMap', '設定'],
  ko: ['개요', '어휘', '쓰기', '듣기', '쉐도잉 연습', '연습 시험', '문장 구조', 'MindMap', '설정'],
  ms: ['Gambaran keseluruhan', 'Kosa kata', 'Penulisan', 'Mendengar', 'Latihan shadowing', 'Ujian latihan', 'Struktur ayat', 'MindMap', 'Tetapan'],
  pt: ['Visão geral', 'Vocabulário', 'Escrita', 'Compreensão oral', 'Prática de shadowing', 'Testes práticos', 'Estrutura de frases', 'MindMap', 'Definições'],
  ru: ['Обзор', 'Словарь', 'Письмо', 'Аудирование', 'Практика shadowing', 'Пробные тесты', 'Структура предложения', 'MindMap', 'Настройки'],
  th: ['ภาพรวม', 'คำศัพท์', 'การเขียน', 'การฟัง', 'ฝึก Shadowing', 'แบบทดสอบฝึกหัด', 'โครงสร้างประโยค', 'MindMap', 'การตั้งค่า'],
  tr: ['Genel bakış', 'Kelime bilgisi', 'Yazma', 'Dinleme', 'Shadowing pratiği', 'Deneme sınavları', 'Cümle yapısı', 'MindMap', 'Ayarlar'],
  uk: ['Огляд', 'Словник', 'Письмо', 'Аудіювання', 'Практика shadowing', 'Тренувальні тести', 'Структура речення', 'MindMap', 'Налаштування'],
  'zh-CN': ['概览', '词汇', '写作', '听力', '跟读练习', '练习测试', '句子结构', 'MindMap', '设置'],
  'zh-TW': ['總覽', '詞彙', '寫作', '聽力', '跟讀練習', '練習測驗', '句子結構', 'MindMap', '設定'],
}

const SIMPLE: Record<string, string[]> = {
  en: ['Settings', 'Appearance', 'AI', 'Account', 'Language', 'Choose the display language for Ryan English.', 'Appearance theme', 'Choose light, dim or dark mode. Saved automatically on this device.'],
  vi: ['Cài đặt', 'Giao diện', 'AI', 'Tài khoản', 'Ngôn ngữ', 'Chọn ngôn ngữ hiển thị cho giao diện Ryan English.', 'Chủ đề giao diện', 'Chọn chế độ sáng / tối vừa / tối. Lưu tự động trên thiết bị này.'],
  ar: ['الإعدادات', 'المظهر', 'الذكاء الاصطناعي', 'الحساب', 'اللغة', 'اختر لغة عرض Ryan English.', 'مظهر الواجهة', 'اختر الوضع الفاتح أو الخافت أو الداكن.'],
  de: ['Einstellungen', 'Erscheinungsbild', 'KI', 'Konto', 'Sprache', 'Wähle die Anzeigesprache für Ryan English.', 'Darstellung', 'Wähle hell, gedimmt oder dunkel.'],
  es: ['Configuración', 'Apariencia', 'IA', 'Cuenta', 'Idioma', 'Elige el idioma de Ryan English.', 'Tema de apariencia', 'Elige modo claro, tenue u oscuro.'],
  id: ['Pengaturan', 'Tampilan', 'AI', 'Akun', 'Bahasa', 'Pilih bahasa tampilan Ryan English.', 'Tema tampilan', 'Pilih mode terang, redup, atau gelap.'],
  ja: ['設定', '外観', 'AI', 'アカウント', '言語', 'Ryan Englishの表示言語を選択します。', '表示テーマ', 'ライト、薄暗い、ダークから選択します。'],
  ko: ['설정', '화면', 'AI', '계정', '언어', 'Ryan English의 표시 언어를 선택하세요.', '화면 테마', '밝게, 어둡게 또는 중간으로 선택하세요.'],
  ms: ['Tetapan', 'Penampilan', 'AI', 'Akaun', 'Bahasa', 'Pilih bahasa paparan Ryan English.', 'Tema penampilan', 'Pilih mod cerah, malap atau gelap.'],
  pt: ['Definições', 'Aparência', 'IA', 'Conta', 'Idioma', 'Escolha o idioma de exibição do Ryan English.', 'Tema da aparência', 'Escolha claro, suave ou escuro.'],
  ru: ['Настройки', 'Внешний вид', 'ИИ', 'Аккаунт', 'Язык', 'Выберите язык интерфейса Ryan English.', 'Тема оформления', 'Выберите светлую, среднюю или тёмную тему.'],
  th: ['การตั้งค่า', 'รูปลักษณ์', 'AI', 'บัญชี', 'ภาษา', 'เลือกภาษาที่แสดงใน Ryan English', 'ธีมหน้าตา', 'เลือกโหมดสว่าง สลัว หรือมืด'],
  tr: ['Ayarlar', 'Görünüm', 'Yapay zekâ', 'Hesap', 'Dil', 'Ryan English görüntüleme dilini seçin.', 'Görünüm teması', 'Açık, loş veya koyu modu seçin.'],
  uk: ['Налаштування', 'Вигляд', 'ШІ', 'Обліковий запис', 'Мова', 'Виберіть мову інтерфейсу Ryan English.', 'Тема вигляду', 'Виберіть світлу, приглушену або темну тему.'],
  'zh-CN': ['设置', '外观', 'AI', '账户', '语言', '选择 Ryan English 的显示语言。', '外观主题', '选择浅色、柔和或深色模式。'],
  'zh-TW': ['設定', '外觀', 'AI', '帳戶', '語言', '選擇 Ryan English 的顯示語言。', '外觀主題', '選擇淺色、柔和或深色模式。'],
}
const VOCAB_MESSAGES: Record<string, string> = {
  'vocab.title': 'Vocabulary', 'vocab.repair': 'Clean duplicates', 'vocab.repairBusy': 'Cleaning…', 'vocab.notebook': 'Notebook', 'vocab.create': '+ Create deck', 'vocab.kind': 'Vocabulary type', 'vocab.single': 'Single words', 'vocab.phrase': 'Phrases', 'vocab.all': 'All', 'vocab.mine': 'My decks', 'vocab.study': 'Study', 'vocab.cards': 'cards', 'vocab.due': 'due', 'vocab.deleteConfirm': 'Delete deck "{name}"? All cards in this deck will be deleted.', 'vocab.deleteError': 'This deck cannot be deleted.', 'vocab.noDecks': 'No decks yet', 'vocab.createDeck': '+ Create deck', 'vocab.my': 'My', 'vocab.selectDeck': 'Select a deck', 'vocab.selectDeckHint': 'Choose a deck from the list on the left to begin', 'vocab.editName': 'Edit name', 'vocab.export': 'Export', 'vocab.csv': 'Export CSV', 'vocab.json': 'Export JSON', 'vocab.import': 'Import', 'vocab.addWord': 'Add word', 'vocab.noWords': 'No words yet', 'vocab.addFirst': 'Add the first word to this deck', 'vocab.addFirstButton': '+ Add first word',
}
const EXTRA: Partial<Record<Language, Record<string, string>>> = {
  vi: {
    'app.user': 'Người dùng', 'app.logout': 'Đăng xuất', 'app.appearance': 'Giao diện', 'app.syncing': 'Đang đồng bộ…', 'app.synced': 'Đã đồng bộ', 'app.syncError': 'Lỗi đồng bộ — bấm thử lại', 'app.forever': 'Vĩnh viễn', 'app.expand': 'Mở rộng thanh chức năng', 'app.collapse': 'Thu gọn thanh chức năng',
    'nav.readingCorner': 'Góc đọc', 'nav.readingBao': 'Đọc Báo Song Ngữ', 'nav.readingSach': 'Đọc Sách Song Ngữ',
    'home.learnNow': 'Học ngay', 'home.wordsStudied': 'Từ đã học', 'home.writing': 'Bài viết', 'home.streak': 'Ngày liên tiếp', 'home.greetingMorning': 'Chào buổi sáng', 'home.greetingAfternoon': 'Chào buổi chiều', 'home.greetingEvening': 'Chào buổi tối', 'home.continue': 'Tiếp tục hành trình luyện thi của bạn', 'home.vocabDesc': 'SRS & flashcard', 'home.writingDesc': 'Thư viện Writing', 'home.listeningDesc': 'Dictation', 'home.translate': 'Dịch câu', 'home.translateDesc': 'Luyện dịch IELTS', 'home.mindmapDesc': 'AI expand', 'home.morningLine': 'Chào buổi sáng — học vài từ cho tỉnh nào!', 'home.afternoonLine': 'Buổi chiều năng suất — làm 1 bài Listening nhé!', 'home.eveningLine': 'Tối rồi — ôn nhẹ vài từ trước khi nghỉ nha!', 'home.streakLine': 'Streak {count} ngày — giữ lửa nhé! 🔥', 'home.checkin': 'Điểm danh', 'home.checkedIn': 'Đã điểm danh', 'home.checkinTitle': 'Điểm danh hôm nay', 'home.checkinStreak': 'Streak điểm danh: {count} ngày — quay lại ngày mai nhé!', 'home.checkinHint': 'Một cú bấm để giữ thói quen học mỗi ngày', 'home.dailyGoal': 'Mục tiêu hôm nay', 'home.saveGoal': 'Lưu mục tiêu', 'home.editGoal': 'Sửa mục tiêu', 'home.reviewWords': 'Lượt ôn từ', 'home.dueCards': 'Thẻ đến hạn', 'home.translatePerDay': 'Dịch câu / ngày', 'home.goalDone': 'Tuyệt vời! Bạn đã hoàn thành mục tiêu hôm nay.', 'home.activityTitle': '60 ngày học gần nhất', 'home.activitySub': 'Ngày học nhiều ô đậm hơn · ít thì nhạt hơn', 'home.studySessions': 'lượt học', 'home.less': 'Ít', 'home.more': 'Nhiều', 'home.activeDays': '{count} / 60 ngày có hoạt động', 'home.streakTitle': 'Giữ vững phong độ!', 'home.streakMessage': 'Bạn học {count} ngày liên tiếp!', 'home.close': 'Đóng',
  },
  en: {
    'app.user': 'User', 'app.logout': 'Sign out', 'app.appearance': 'Appearance', 'app.syncing': 'Syncing…', 'app.synced': 'Synced', 'app.syncError': 'Sync error — retry', 'app.forever': 'Lifetime', 'app.expand': 'Expand sidebar', 'app.collapse': 'Collapse sidebar',
    'nav.readingCorner': 'Reading corner', 'nav.readingBao': 'Bilingual news', 'nav.readingSach': 'Bilingual books',
    'home.learnNow': 'Learn now', 'home.wordsStudied': 'Words studied', 'home.writing': 'Writing', 'home.streak': 'Day streak', 'home.greetingMorning': 'Good morning', 'home.greetingAfternoon': 'Good afternoon', 'home.greetingEvening': 'Good evening', 'home.continue': 'Continue your exam preparation journey', 'home.vocabDesc': 'SRS & flashcards', 'home.writingDesc': 'Writing library', 'home.listeningDesc': 'Dictation', 'home.translate': 'Translate sentences', 'home.translateDesc': 'IELTS translation practice', 'home.mindmapDesc': 'AI expand', 'home.morningLine': 'Good morning — learn a few words to wake up!', 'home.afternoonLine': 'A productive afternoon — do a Listening exercise!', 'home.eveningLine': 'It is evening — review a few words before resting!', 'home.streakLine': 'A {count}-day streak — keep it going! 🔥', 'home.checkin': 'Check in', 'home.checkedIn': 'Checked in', 'home.checkinTitle': 'Today’s check-in', 'home.checkinStreak': 'Check-in streak: {count} days — come back tomorrow!', 'home.checkinHint': 'One tap to keep your daily learning habit', 'home.dailyGoal': 'Today’s goals', 'home.saveGoal': 'Save goals', 'home.editGoal': 'Edit goals', 'home.reviewWords': 'Review sessions', 'home.dueCards': 'Due cards', 'home.translatePerDay': 'Translations / day', 'home.goalDone': 'Great! You completed today’s goals.', 'home.activityTitle': 'Last 60 study days', 'home.activitySub': 'Darker cells mean more study; lighter cells mean less.', 'home.studySessions': 'study sessions', 'home.less': 'Less', 'home.more': 'More', 'home.activeDays': '{count} / 60 active days', 'home.streakTitle': 'Keep up the momentum!', 'home.streakMessage': 'You have studied for {count} consecutive days!', 'home.close': 'Close',
  },
}

function validLanguage(value: unknown): Language { return LANGUAGE_IDS.includes(value as Language) ? value as Language : 'vi' }
type LanguageContextValue = { language: Language; setLanguage: (language: Language) => void; t: (key: string) => string }
const LanguageContext = createContext<LanguageContextValue | null>(null)
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => validLanguage(localStorage.getItem(STORAGE_KEY)))
  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [language])
  useEffect(() => { void settingsRepo.getSetting('language').then(value => setLanguageState(validLanguage(value))) }, [])
  function setLanguage(next: Language) { setLanguageState(next); localStorage.setItem(STORAGE_KEY, next); void settingsRepo.putSetting('language', next) }
  const value = useMemo(() => ({ language, setLanguage, t: (key: string) => {
    if (key.startsWith('vocab.')) return VOCAB_MESSAGES[key] ?? key
    if (EXTRA[language]?.[key]) return EXTRA[language]![key]
    if (language !== 'vi' && EXTRA.en?.[key]) return EXTRA.en[key]!
    const navIndex = NAV_KEYS.indexOf(key.replace('nav.', '') as typeof NAV_KEYS[number])
    if (key.startsWith('nav.') && navIndex >= 0) return NAV_TRANSLATIONS[language]?.[navIndex] ?? NAV_DEFAULT[navIndex]
    const values = SIMPLE[language] ?? SIMPLE.vi
    const map: Record<string, number> = { 'settings.title': 0, 'settings.appearance': 1, 'settings.ai': 2, 'settings.account': 3, 'settings.language': 4, 'settings.languageDesc': 5, 'settings.theme': 6, 'settings.themeDesc': 7 }
    return values[map[key] ?? -1] ?? SIMPLE.vi[map[key] ?? -1] ?? key
  }}), [language])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
export function useI18n() { const value = useContext(LanguageContext); if (!value) throw new Error('useI18n must be used inside LanguageProvider'); return value }

export function formatLocaleDate(value: string | number | Date, language: Language, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(LOCALES[language], options ?? { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
}
