import type { AIMessage } from './provider'

export interface DictDefinition {
  meaning: string     // tiếng Việt
  example?: string    // câu ví dụ tiếng Anh
  exampleVi?: string  // dịch câu ví dụ
}

export interface DictResult {
  word: string
  ipaUS?: string
  ipaUK?: string
  pos?: string        // noun | verb | adjective | adverb | phrase
  definitions: DictDefinition[]
  collocations?: string[]
  synonyms?: string[]
  level?: string      // A1–C2
}

const SCHEMA = `{
  "word": "<từ hoặc cụm từ>",
  "ipaUS": "<phiên âm IPA US>",
  "ipaUK": "<phiên âm IPA UK>",
  "pos": "<noun|verb|adjective|adverb|phrase>",
  "definitions": [
    {
      "meaning": "<nghĩa tiếng Việt>",
      "example": "<câu ví dụ tiếng Anh>",
      "exampleVi": "<dịch câu ví dụ sang tiếng Việt>"
    }
  ],
  "collocations": ["<cụm từ 1>", "<cụm từ 2>", "<cụm từ 3>"],
  "synonyms": ["<từ đồng nghĩa 1>", "<từ đồng nghĩa 2>"],
  "level": "<A1|A2|B1|B2|C1|C2>"
}`

export function buildDictionaryPrompt(word: string): AIMessage[] {
  return [
    {
      role: 'system',
      content: `You are an English dictionary. Look up the given word or phrase and return ONLY this JSON:\n${SCHEMA}\nProvide 1–3 definitions. All "meaning" and "exampleVi" fields must be in Vietnamese.`,
    },
    {
      role: 'user',
      content: `Look up: ${word}`,
    },
  ]
}
