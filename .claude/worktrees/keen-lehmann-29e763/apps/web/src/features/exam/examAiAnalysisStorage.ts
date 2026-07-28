import {
  mergeEvidences,
  parseEvidencesFromAiMarkdown,
  type ExamAiEvidence,
} from './examAiEvidence'

const PREFIX = 'exam-ai-analysis:'

export type ExamAiAnalysisSkill = 'reading' | 'listening'

export interface StoredExamAiAnalysis {
  version: 1
  markdown: string
  evidences: ExamAiEvidence[]
}

function storageKey(examId: string, skill: ExamAiAnalysisSkill): string {
  return `${PREFIX}${skill}:${examId}`
}

function parseStored(raw: string): StoredExamAiAnalysis | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('{')) {
    try {
      const obj = JSON.parse(trimmed) as Partial<StoredExamAiAnalysis>
      if (typeof obj.markdown === 'string' && obj.markdown.trim()) {
        const fromField = Array.isArray(obj.evidences) ? obj.evidences : []
        const fromMd = parseEvidencesFromAiMarkdown(obj.markdown)
        return {
          version: 1,
          markdown: obj.markdown,
          evidences: mergeEvidences(
            fromField.filter(
              (e): e is ExamAiEvidence =>
                !!e &&
                typeof e.questionNumber === 'number' &&
                Array.isArray(e.quotes),
            ),
            fromMd,
          ),
        }
      }
    } catch {
      /* fall through — plain markdown */
    }
  }
  return {
    version: 1,
    markdown: trimmed,
    evidences: parseEvidencesFromAiMarkdown(trimmed),
  }
}

export function saveExamAiAnalysis(
  examId: string,
  skill: ExamAiAnalysisSkill,
  markdown: string,
  evidences?: ExamAiEvidence[],
): void {
  if (!examId || !markdown.trim()) return
  const payload: StoredExamAiAnalysis = {
    version: 1,
    markdown: markdown.trim(),
    evidences: mergeEvidences(
      evidences ?? [],
      parseEvidencesFromAiMarkdown(markdown),
    ),
  }
  try {
    sessionStorage.setItem(storageKey(examId, skill), JSON.stringify(payload))
  } catch {
    /* quota / private mode */
  }
}

export function loadExamAiAnalysisStored(
  examId: string,
  skill: ExamAiAnalysisSkill,
): StoredExamAiAnalysis | null {
  if (!examId) return null
  try {
    const raw = sessionStorage.getItem(storageKey(examId, skill))
    if (!raw) return null
    return parseStored(raw)
  } catch {
    return null
  }
}

export function loadExamAiAnalysis(
  examId: string,
  skill: ExamAiAnalysisSkill,
): string | null {
  return loadExamAiAnalysisStored(examId, skill)?.markdown ?? null
}

export function loadExamAiEvidences(
  examId: string,
  skill: ExamAiAnalysisSkill,
): ExamAiEvidence[] {
  return loadExamAiAnalysisStored(examId, skill)?.evidences ?? []
}

export function clearExamAiAnalysis(examId: string, skill: ExamAiAnalysisSkill): void {
  try {
    sessionStorage.removeItem(storageKey(examId, skill))
  } catch {
    /* ignore */
  }
}

/** Lấy đoạn markdown AI cho một số câu (## Câu N … đến ## tiếp theo). */
export function extractAiSectionForQuestion(aiText: string, questionNumber: number): string | null {
  if (!aiText?.trim() || !questionNumber) return null
  const re = new RegExp(
    `(?:^|\\n)##\\s*Câu\\s*${questionNumber}\\b([^\\n]*)([\\s\\S]*?)(?=\\n##\\s|$)`,
    'i',
  )
  const m = aiText.match(re)
  if (!m) return null
  const title = (m[1] ?? '').trim()
  const body = (m[2] ?? '').trim()
  const lines = [`## Câu ${questionNumber}${title ? ` ${title}` : ''}`, body].filter(Boolean)
  return lines.join('\n').trim() || null
}

export type { ExamAiEvidence }
