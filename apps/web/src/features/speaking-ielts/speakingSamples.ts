export type BandDescriptor = {
  fluency: string
  lexicalResource: string
  grammar: string
  pronunciation: string
}

export type VocabularyAnnotation = {
  phrase: string
  explanation: string
}

export type SpeakingSample = {
  id: string
  part: 1 | 2 | 3
  topic: string
  bandScore: number
  transcript: string
  bandDescriptor: BandDescriptor
  vocabularyAnnotations: VocabularyAnnotation[]
  sourceUrl: string
  sourceLabel: string
}

export const speakingSamples: SpeakingSample[] = []

export function samplesByPart(part: 1 | 2 | 3): SpeakingSample[] {
  return speakingSamples.filter(sample => sample.part === part)
}

export function hasSamples(): boolean {
  return speakingSamples.length > 0
}
