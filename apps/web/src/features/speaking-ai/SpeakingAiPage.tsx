import { useEffect, useMemo, useRef, useState } from 'react'
import { Mic, Square, RotateCcw, Volume2, Gauge, Languages, Send, Trash2, Sparkles, AudioLines } from 'lucide-react'
import { speak, stop as stopTts } from '../listening/tts'
import { loadLatestSpeakingConversation, sendSpeakingTurn, type SpeakingAccess, type SpeakingHistory, type TutorTurn } from './speakingAiApi'
import { useSpeakingRecorder } from './useSpeakingRecorder'
import './speakingAiPage.css'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']
const MODES = ['Free Conversation', 'Roleplay', 'Job Interview', 'Travel English', 'Daily English', 'Pronunciation Practice', 'Grammar Correction']
const TOPICS = ['Daily life', 'Travel', 'Work & study', 'Food', 'Technology', 'IELTS speaking']

function estimateTypedSeconds(text: string) {
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.min(60, Math.max(1, Math.round(words / 2)))
}

export default function SpeakingAiPage() {
  const recorder = useSpeakingRecorder()
  const [level, setLevel] = useState('B1')
  const [mode, setMode] = useState('Free Conversation')
  const [topic, setTopic] = useState('Daily life')
  const [conversationId, setConversationId] = useState<string>()
  const [turns, setTurns] = useState<TutorTurn[]>([])
  const [status, setStatus] = useState<'ready' | 'processing' | 'speaking'>('ready')
  const [error, setError] = useState<string | null>(null)
  const [showTranslation, setShowTranslation] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [draft, setDraft] = useState('')
  const [access, setAccess] = useState<SpeakingAccess>({ unlimited: false, dailyLimitSeconds: 600, retentionDays: 30 })
  const [histories, setHistories] = useState<SpeakingHistory[]>([])
  const latest = turns.at(-1)
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const message = useMemo(() => [draft.trim(), recorder.transcript.trim()].filter(Boolean).join(' '), [draft, recorder.transcript])
  const canSend = message.length >= 2 && status === 'ready' && recorder.state !== 'recording'

  useEffect(() => { bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' }) }, [turns, status])
  useEffect(() => () => stopTts(), [])
  useEffect(() => {
    void loadLatestSpeakingConversation().then(latestConversation => {
      if (!latestConversation) return
      setAccess(latestConversation.access)
      setHistories(latestConversation.histories)
      if (!latestConversation.conversation) return
      setConversationId(latestConversation.conversation.id)
      setLevel(latestConversation.conversation.level)
      setTopic(latestConversation.conversation.topic)
      setMode(latestConversation.conversation.mode)
      setTurns(latestConversation.turns)
    })
  }, [])

  async function submit() {
    if (!canSend) return
    const durationSec = recorder.audio ? recorder.seconds : estimateTypedSeconds(message)
    setStatus('processing'); setError(null)
    try {
      const turn = await sendSpeakingTurn({ transcript: message, durationSec, conversationId, level, topic, mode })
      setAccess({ unlimited: turn.unlimited, dailyLimitSeconds: turn.dailyLimitSeconds, retentionDays: turn.retentionDays })
      const nextTurns = [...turns, turn]
      setConversationId(turn.conversationId); setTurns(nextTurns)
      setHistories(old => {
        const existing = old.find(item => item.conversation.id === turn.conversationId)
        const conversation = existing?.conversation ?? { id: turn.conversationId, title: `${mode} · ${topic}`, level, topic, mode, speaking_messages: [] }
        return [{ conversation, turns: nextTurns }, ...old.filter(item => item.conversation.id !== turn.conversationId)]
      })
      setDraft(''); recorder.reset()
      setStatus('speaking')
      await speak(turn.reply, { speed, lang: 'a' })
      setStatus('ready')
    } catch (err) { setError(err instanceof Error ? err.message : 'Có lỗi xảy ra.'); setStatus('ready') }
  }

  function play(text = latest?.reply, nextSpeed = speed) {
    if (!text) return
    stopTts(); setStatus('speaking'); void speak(text, { speed: nextSpeed, lang: 'a' }).finally(() => setStatus('ready'))
  }

  function clearRecording() {
    recorder.reset()
    inputRef.current?.focus()
  }

  function openHistory(id: string) {
    if (!id) { setConversationId(undefined); setTurns([]); return }
    const selected = histories.find(item => item.conversation.id === id)
    if (!selected) return
    setConversationId(selected.conversation.id)
    setLevel(selected.conversation.level)
    setTopic(selected.conversation.topic)
    setMode(selected.conversation.mode)
    setTurns(selected.turns)
  }

  const micState = recorder.state === 'recording' ? 'Recording' : status === 'processing' ? 'Processing' : status === 'speaking' ? 'AI Speaking' : 'Ready'
  return <div className="speak-page">
    <div className="speak-page__inner">
      <header className="speak-page__hero">
        <span className="speak-page__eyebrow"><Sparkles size={11} /> DeepSeek AI Tutor · Browser Speech</span>
        <h1>Speaking <em>AI</em></h1>
        <p>Trò chuyện với gia sư AI bằng cách gõ chat hoặc thu âm giọng nói — nhận sửa lỗi, cách nói tự nhiên hơn và từ vựng hữu ích sau mỗi lượt.</p>
      </header>

      <div className="speak-page__console">
        <div className="speak-page__console-core">
          <div className="speak-page__config">
            <label>Level<select value={level} onChange={e => setLevel(e.target.value)}>{LEVELS.map(x => <option key={x}>{x}</option>)}</select></label>
            <label>Chế độ<select value={mode} onChange={e => setMode(e.target.value)}>{MODES.map(x => <option key={x}>{x}</option>)}</select></label>
            <label>Chủ đề<select value={topic} onChange={e => setTopic(e.target.value)}>{TOPICS.map(x => <option key={x}>{x}</option>)}</select></label>
            <label>Lịch sử<select value={conversationId ?? ''} onChange={e => openHistory(e.target.value)}><option value="">Phiên mới</option>{histories.map(item => <option value={item.conversation.id} key={item.conversation.id}>{item.conversation.title}</option>)}</select></label>
            <div className="speak-page__status"><i className={`is-${micState.toLowerCase().replace(' ', '-')}`} />{micState}<span>{access.unlimited ? `Không giới hạn · Lưu lịch sử ${access.retentionDays} ngày` : latest ? `${Math.ceil(latest.usedSeconds / 60)}/${Math.ceil((access.dailyLimitSeconds ?? 600) / 60)} phút hôm nay · Lưu ${access.retentionDays} ngày` : `Tối đa ${Math.ceil((access.dailyLimitSeconds ?? 600) / 60)} phút/ngày · Lưu lịch sử ${access.retentionDays} ngày`}</span></div>
          </div>

          <div className="speak-page__chat" ref={bodyRef}>
            {!turns.length && <div className="speak-page__empty">
              <div className="speak-page__empty-orb"><AudioLines /></div>
              <h3>Gõ tin nhắn hoặc nhấn micro và nói bằng tiếng Anh</h3>
              <p>Mỗi lượt thu âm tối đa 60 giây; audio không được lưu lại. Bạn có thể chỉnh sửa nội dung nhận dạng trước khi gửi.</p>
            </div>}
            {turns.map((turn, index) => <div className="speak-page__turn" key={`${turn.conversationId}-${index}`}>
              <div className="speak-page__bubble is-user"><small>Bạn</small>{turn.transcript}</div>
              <div className="speak-page__bubble is-ai"><small>AI tutor</small>{turn.reply}
                <button type="button" onClick={() => play(turn.reply)}><Volume2 size={14} /> Nghe lại</button>
              </div>
              {turn.correction?.corrected && <details className="speak-page__detail"><summary>Sửa câu này</summary><del>{turn.correction.original}</del><strong>{turn.correction.corrected}</strong><p>{turn.correction.natural}</p>{showTranslation && <em>{turn.correction.explanation}</em>}</details>}
              {!!turn.vocabulary?.length && <div className="speak-page__vocab"><b>{turn.vocabulary[0].word}</b> · {turn.vocabulary[0].meaning}<span>{turn.vocabulary[0].example}</span></div>}
            </div>)}
            {status === 'processing' && <div className="speak-page__processing"><span /><span /><span />Đang phân tích và chuẩn bị phản hồi…</div>}
          </div>

          {(error || recorder.error) && <div className="speak-page__error" role="alert">{error || recorder.error}<button type="button" onClick={() => setError(null)}>Đóng</button></div>}

          <footer className="speak-page__composer">
            {recorder.state === 'recording' && <div className="speak-page__live"><small>Trình duyệt đang nghe · {recorder.seconds}s / 60s</small>{recorder.transcript || 'Đang nghe…'}</div>}
            {recorder.audio && <div className="speak-page__take">
              <audio controls src={recorder.audio.url} />
              <button type="button" title="Xóa lượt ghi" onClick={clearRecording}><Trash2 size={15} /></button>
            </div>}
            <div className="speak-page__input-row">
              <button
                type="button"
                className={`speak-page__mic ${recorder.state === 'recording' ? 'is-recording' : ''}`}
                onClick={recorder.state === 'recording' ? recorder.stop : recorder.start}
                disabled={status !== 'ready'}
                aria-label={recorder.state === 'recording' ? 'Dừng thu âm' : 'Bắt đầu thu âm'}
              >
                {recorder.state === 'recording' ? <Square /> : <Mic />}
              </button>
              <textarea
                ref={inputRef}
                rows={1}
                placeholder={recorder.transcript ? 'Bổ sung thêm nếu muốn, rồi gửi…' : 'Nhập tin nhắn tiếng Anh, hoặc nhấn micro để nói…'}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void submit() } }}
                disabled={status !== 'ready'}
              />
              <button type="button" className="speak-page__send" onClick={submit} disabled={!canSend} aria-label="Gửi đến AI">
                <span className="speak-page__send-orb"><Send size={15} /></span>
              </button>
            </div>
            <div className="speak-page__tools">
              <button type="button" onClick={() => setShowTranslation(x => !x)}><Languages size={14} /> {showTranslation ? 'Ẩn giải thích' : 'Hiển thị bản dịch'}</button>
              <button type="button" onClick={() => { const next = speed === 1 ? .75 : speed === .75 ? 1.25 : 1; setSpeed(next); if (latest) play(latest.reply, next) }}><Gauge size={14} /> {speed}x</button>
              <button type="button" onClick={() => latest && play(latest.reply, .75)} disabled={!latest}><RotateCcw size={14} /> Nói chậm hơn</button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  </div>
}
