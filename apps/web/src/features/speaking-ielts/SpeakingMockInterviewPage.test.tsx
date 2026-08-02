// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SpeakingMockInterviewPage from './SpeakingMockInterviewPage'

const sendSpeakingTurn = vi.hoisted(() => vi.fn())
vi.mock('../speaking-ai/speakingAiApi', () => ({ sendSpeakingTurn }))
vi.mock('../listening/tts', () => ({ speak: vi.fn() }))

let recognition: MockSpeechRecognition
let mediaRecorder: MockMediaRecorder
const stopTrack = vi.fn()

class MockSpeechRecognition {
  lang = ''
  continuous = false
  interimResults = false
  onresult: ((event: unknown) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  start = vi.fn()
  stop = vi.fn()
  constructor() { recognition = this }
  emitFinal(transcript: string) {
    this.onresult?.({ resultIndex: 0, results: Object.assign([{ 0: { transcript }, isFinal: true }], { length: 1 }) })
  }
}

class MockMediaRecorder {
  static isTypeSupported = vi.fn(() => true)
  state: RecordingState = 'inactive'
  mimeType = 'audio/webm;codecs=opus'
  ondataavailable: ((event: BlobEvent) => void) | null = null
  onstop: (() => void) | null = null
  constructor(_stream: MediaStream, _options?: MediaRecorderOptions) { mediaRecorder = this }
  start = vi.fn(() => { this.state = 'recording' })
  stop = vi.fn(() => {
    this.ondataavailable?.({ data: new Blob(['voice'], { type: this.mimeType }) } as BlobEvent)
    this.state = 'inactive'
    this.onstop?.()
  })
}

const item = {
  id: 'forecast-p1-1-1', part: 1 as const, title: 'Where you live now',
  bulletPoints: ['Talk about your neighbourhood'], part3Questions: [], sourceUrl: 'https://example.test',
}

function renderInterview() {
  return render(<MemoryRouter initialEntries={['/app/speaking/ielts/mock-interview/session-7']}><SpeakingMockInterviewPage items={[item]} sessionId="session-7" /></MemoryRouter>)
}

describe('IELTS Mock Interview recorder and AI flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: stopTrack }] }) } })
    Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: MockSpeechRecognition })
    Object.defineProperty(window, 'webkitSpeechRecognition', { configurable: true, value: undefined })
    Object.defineProperty(window, 'MediaRecorder', { configurable: true, value: MockMediaRecorder })
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:recording') })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() })
  })
  afterEach(() => { cleanup(); vi.restoreAllMocks() })

  it('requests microphone access, records speech, and stops into a submit-ready state', async () => {
    const user = userEvent.setup()
    renderInterview()

    await user.click(screen.getByRole('button', { name: /Bấm để nói/i }))
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: { echoCancellation: true, noiseSuppression: true } })
    expect(screen.getByRole('button', { name: /Dừng ghi âm/i })).toBeInTheDocument()
    expect(mediaRecorder.start).toHaveBeenCalledWith(250)

    act(() => recognition.emitFinal('I live in Hanoi'))
    await user.click(screen.getByRole('button', { name: /Dừng ghi âm/i }))

    expect(mediaRecorder.stop).toHaveBeenCalled()
    expect(stopTrack).toHaveBeenCalled()
    expect(screen.getByText(/I live in Hanoi/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Gửi để nhận feedback/i })).toBeEnabled()
    expect(URL.createObjectURL).toHaveBeenCalled()
  })

  it('submits the transcript, shows loading and feedback, then resets for the next question', async () => {
    let resolveTurn!: (value: { reply: string }) => void
    sendSpeakingTurn.mockReturnValue(new Promise(resolve => { resolveTurn = resolve }))
    const user = userEvent.setup()
    renderInterview()
    await user.click(screen.getByRole('button', { name: /Bấm để nói/i }))
    act(() => recognition.emitFinal('I live near the city centre'))
    await user.click(screen.getByRole('button', { name: /Dừng ghi âm/i }))
    await user.click(screen.getByRole('button', { name: /Gửi để nhận feedback/i }))

    expect(screen.getByRole('button', { name: /AI đang phân tích/i })).toBeDisabled()
    expect(sendSpeakingTurn).toHaveBeenCalledWith(expect.objectContaining({
      transcript: 'I live near the city centre', topic: 'Where you live now', mode: 'IELTS_PART_1', conversationId: 'session-7',
    }))

    resolveTurn({ reply: 'Good fluency. Add more supporting detail.' })
    expect(await screen.findByText('Good fluency. Add more supporting detail.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Xem tổng kết/i }))
    await waitFor(() => expect(screen.getByText(/Hoàn thành bài Mock Interview/i)).toBeInTheDocument())
    expect(screen.getByText('Overall Band')).toBeInTheDocument()
    expect(screen.getByText('—')).toBeInTheDocument()
    expect(screen.getByText(/Transcript:/i)).toBeInTheDocument()
  })
})
