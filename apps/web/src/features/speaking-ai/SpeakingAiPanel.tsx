import { useEffect, useRef, useState } from 'react'
import { Mic, Square, X, RotateCcw, Volume2, Gauge, Languages, Send, Trash2 } from 'lucide-react'
import { speak, stop as stopTts } from '../listening/tts'
import { loadLatestSpeakingConversation, sendSpeakingTurn, type TutorTurn } from './speakingAiApi'
import { useSpeakingRecorder } from './useSpeakingRecorder'
import './speakingAi.css'
import './speakingAiTranscript.css'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']
const MODES = ['Free Conversation', 'Roleplay', 'Job Interview', 'Travel English', 'Daily English', 'Pronunciation Practice', 'Grammar Correction']
const TOPICS = ['Daily life', 'Travel', 'Work & study', 'Food', 'Technology', 'IELTS speaking']

export default function SpeakingAiPanel({ onClose }: { onClose: () => void }) {
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
  const latest = turns.at(-1)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' }) }, [turns, status])
  useEffect(() => () => stopTts(), [])
  useEffect(() => {
    void loadLatestSpeakingConversation().then(latestConversation => {
      if (!latestConversation) return
      setConversationId(latestConversation.conversation.id)
      setLevel(latestConversation.conversation.level)
      setTopic(latestConversation.conversation.topic)
      setMode(latestConversation.conversation.mode)
      setTurns(latestConversation.turns)
    })
  }, [])

  async function submit() {
    const transcript = recorder.transcript.trim()
    if (!recorder.audio || transcript.length < 2) { setError('Chưa nhận dạng được lời nói. Hãy nói rõ hơn và thử lại.'); return }
    setStatus('processing'); setError(null)
    try {
      const turn = await sendSpeakingTurn({ transcript, durationSec: recorder.seconds, conversationId, level, topic, mode })
      setConversationId(turn.conversationId); setTurns(old => [...old, turn]); recorder.reset()
      setStatus('speaking')
      await speak(turn.reply, { speed, lang: 'a' })
      setStatus('ready')
    } catch (err) { setError(err instanceof Error ? err.message : 'Có lỗi xảy ra.'); setStatus('ready') }
  }

  function play(text = latest?.reply, nextSpeed = speed) {
    if (!text) return
    stopTts(); setStatus('speaking'); void speak(text, { speed: nextSpeed, lang: 'a' }).finally(() => setStatus('ready'))
  }

  const micState = recorder.state === 'recording' ? 'Recording' : status === 'processing' ? 'Processing' : status === 'speaking' ? 'AI Speaking' : 'Ready'
  return <div className="speak-ai-backdrop" role="presentation" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <section className="speak-ai-panel" role="dialog" aria-modal="true" aria-label="Speaking AI">
      <header><div><span className="speak-ai-kicker">DeepSeek · Browser speech</span><h2>Speaking AI</h2></div><button onClick={onClose} aria-label="Đóng Speaking AI"><X /></button></header>
      <div className="speak-ai-config">
        <label>Level<select value={level} onChange={e => setLevel(e.target.value)}>{LEVELS.map(x => <option key={x}>{x}</option>)}</select></label>
        <label>Chế độ<select value={mode} onChange={e => setMode(e.target.value)}>{MODES.map(x => <option key={x}>{x}</option>)}</select></label>
        <label>Chủ đề<select value={topic} onChange={e => setTopic(e.target.value)}>{TOPICS.map(x => <option key={x}>{x}</option>)}</select></label>
      </div>
      <div className="speak-ai-status"><i className={`is-${micState.toLowerCase().replace(' ', '-')}`} />{micState}<span>{latest ? `${Math.ceil(latest.usedSeconds / 60)}/10 phút hôm nay` : 'Tối đa 10 phút/ngày'}</span></div>
      <div className="speak-ai-chat" ref={bodyRef}>
        {!turns.length && <div className="speak-ai-empty"><Mic /><h3>Nhấn micro và nói bằng tiếng Anh</h3><p>Hãy nói gần micro. Mỗi lượt tối đa 60 giây; audio không được lưu.</p></div>}
        {turns.map((turn, index) => <div className="speak-ai-turn" key={`${turn.conversationId}-${index}`}>
          <div className="speak-ai-bubble is-user"><small>Bạn nói</small>{turn.transcript}</div>
          <div className="speak-ai-bubble is-ai"><small>AI tutor</small>{turn.reply}<button onClick={() => play(turn.reply)}><Volume2 size={15}/> Nghe lại</button></div>
          {turn.correction?.corrected && <details><summary>Sửa câu này</summary><del>{turn.correction.original}</del><strong>{turn.correction.corrected}</strong><p>{turn.correction.natural}</p>{showTranslation && <em>{turn.correction.explanation}</em>}</details>}
          {!!turn.vocabulary?.length && <div className="speak-ai-vocab"><b>{turn.vocabulary[0].word}</b> · {turn.vocabulary[0].meaning}<span>{turn.vocabulary[0].example}</span></div>}
        </div>)}
        {status === 'processing' && <div className="speak-ai-processing">Đang nghe, phân tích và chuẩn bị phản hồi…</div>}
      </div>
      {(error || recorder.error) && <div className="speak-ai-error" role="alert">{error || recorder.error}<button onClick={() => setError(null)}>Thử lại</button></div>}
      <footer>
        {(recorder.state === 'recording' || recorder.transcript) && <div className="speak-ai-transcript"><small>Trình duyệt nghe được</small>{recorder.transcript || 'Đang nghe…'}</div>}
        {recorder.audio && <audio controls src={recorder.audio.url} />}
        <div className="speak-ai-actions">
          <button title="Xóa lượt ghi" onClick={recorder.reset} disabled={!recorder.audio}><Trash2 /></button>
          <button className={`speak-ai-mic ${recorder.state === 'recording' ? 'is-recording' : ''}`} onClick={recorder.state === 'recording' ? recorder.stop : recorder.start} disabled={status !== 'ready'}>{recorder.state === 'recording' ? <Square /> : <Mic />}<span>{recorder.state === 'recording' ? `${recorder.seconds}s / 60s` : 'Bắt đầu nói'}</span></button>
          <button title="Gửi đến AI" onClick={submit} disabled={!recorder.audio || recorder.transcript.trim().length < 2 || status !== 'ready'}><Send /></button>
        </div>
        <div className="speak-ai-tools">
          <button onClick={() => { setShowTranslation(x => !x) }}><Languages/> {showTranslation ? 'Ẩn giải thích' : 'Hiển thị bản dịch'}</button>
          <button onClick={() => { const next = speed === 1 ? .75 : speed === .75 ? 1.25 : 1; setSpeed(next); if (latest) play(latest.reply, next) }}><Gauge/> {speed}x</button>
          <button onClick={() => latest && play(latest.reply, .75)} disabled={!latest}><RotateCcw/> Nói chậm hơn</button>
        </div>
      </footer>
    </section>
  </div>
}
