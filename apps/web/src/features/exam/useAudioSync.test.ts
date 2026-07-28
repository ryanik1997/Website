import { describe, expect, it } from 'vitest'
import {
  audioSyncQuestionScope,
  detectListenTwiceBoundary,
  mapSecondPassToFirst,
  partIndexAtTime,
  parseWhisperSegments,
  questionIndexAtAudioTime,
  resolveWhisperSegments,
  shouldSyncWholeExamAudio,
  shouldOfferWhisperTiming,
} from './audioSyncUtils'

describe('audio question sync', () => {
  it('maps part-relative audio progress across questions', () => {
    expect(questionIndexAtAudioTime({
      audioCurrentTime: 25,
      audioDuration: 100,
      questionCount: 4,
    })).toBe(1)
  })

  it('detects shared-audio Part transitions from real timeline anchors', () => {
    expect(partIndexAtTime([0, 31, 46, 68, 84], 45.9)).toBe(1)
    expect(partIndexAtTime([0, 31, 46, 68, 84], 46)).toBe(2)
  })

  it('prefers a listen-again phrase over a hard-coded silence gap', () => {
    const segments = parseWhisperSegments([
      { start: 0, end: 1, text: 'Question one' },
      { start: 1.2, end: 2, text: 'Answer' },
      { start: 2.2, end: 3, text: 'Now listen again' },
      { start: 3.2, end: 4, text: 'Question one' },
      { start: 4.2, end: 5, text: 'Answer' },
    ])
    expect(detectListenTwiceBoundary(segments)).toBe(2.2)
    expect(mapSecondPassToFirst({ currentTime: 4.2, partStart: 0, listenAgainAt: 2.2 })).toBe(2)
  })

  it('maps questions by spoken duration instead of silence-heavy wall-clock ratio', () => {
    const segments = parseWhisperSegments([
      { start: 0, end: 2, text: 'First recording' },
      { start: 20, end: 22, text: 'Second recording' },
      { start: 22, end: 24, text: 'Third recording' },
    ])
    expect(questionIndexAtAudioTime({
      audioCurrentTime: 20,
      audioDuration: 24,
      questionCount: 3,
      segments,
    })).toBe(1)
  })

  it('maps shared-audio segments relative to the current part', () => {
    expect(questionIndexAtAudioTime({
      audioCurrentTime: 60,
      audioDuration: 100,
      questionCount: 4,
      startPct: 50,
      endPct: 100,
    })).toBe(0)
  })

  it('uses Whisper segment order when timings are available', () => {
    const segments = parseWhisperSegments([
      { id: 1, start: 0, end: 2, text: 'One' },
      { id: 2, start: 2, end: 4, text: 'Two' },
      { id: 3, start: 4, end: 6, text: 'Three' },
      { id: 4, start: 6, end: 8, text: 'Four' },
    ])
    expect(questionIndexAtAudioTime({
      audioCurrentTime: 5,
      audioDuration: 8,
      questionCount: 2,
      segments,
    })).toBe(1)
  })

  it('syncs across all questions when Parts share one unbounded audio file', () => {
    expect(shouldSyncWholeExamAudio({
      hasSharedAudio: true,
    })).toBe(true)
    expect(audioSyncQuestionScope({
      syncWholeExam: true,
      wholeExamQuestions: ['q1', 'q2'],
      partQuestions: ['q1'],
    })).toEqual(['q1', 'q2'])
  })

  it('keeps per-Part sync when imported Parts use different audio files', () => {
    expect(shouldSyncWholeExamAudio({
      hasSharedAudio: false,
    })).toBe(false)
    expect(audioSyncQuestionScope({
      syncWholeExam: false,
      wholeExamQuestions: ['q1', 'q2'],
      partQuestions: ['q1'],
    })).toEqual(['q1'])
  })

  it('keeps per-Part sync when shared audio has explicit Part ranges', () => {
    expect(shouldSyncWholeExamAudio({
      hasSharedAudio: true,
      startPct: 0,
      endPct: 20,
    })).toBe(false)
  })

  it('drops malformed Whisper segments', () => {
    expect(parseWhisperSegments([
      { start: 0, end: 1, text: 'Valid' },
      { start: 2, end: 1, text: 'Invalid range' },
      { start: 'x', end: 2, text: 'Invalid start' },
    ])).toEqual([{ id: 0, start: 0, end: 1, text: 'Valid' }])
  })

  it('offers timing generation when plain transcript exists without segments', () => {
    expect(shouldOfferWhisperTiming({
      hasAudioUrl: true,
      partMissingTranscript: false,
      segmentCount: 0,
    })).toBe(true)
    expect(shouldOfferWhisperTiming({
      hasAudioUrl: true,
      partMissingTranscript: false,
      segmentCount: 2,
    })).toBe(false)
  })

  it('prefers published cloud segments over browser-local timing', () => {
    window.localStorage.setItem(
      'exam-listening-whisper-segments:exam-1:1',
      JSON.stringify([{ id: 9, start: 0, end: 1, text: 'Local' }]),
    )
    expect(resolveWhisperSegments(
      [{ id: 1, start: 0, end: 2, text: 'Cloud' }],
      'exam-1',
      1,
    )).toEqual([{ id: 1, start: 0, end: 2, text: 'Cloud' }])
  })
})
