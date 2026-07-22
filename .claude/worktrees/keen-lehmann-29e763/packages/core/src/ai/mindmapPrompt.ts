import type { AIMessage } from './provider'

export interface MindmapExpandResult {
  children: string[]
}

export function buildMindmapExpandPrompt(word: string, existing: string[]): AIMessage[] {
  return [
    {
      role: 'system',
      content: `You are a vocabulary mindmap assistant for English learners. Generate 5–7 related words or short phrases for the given word. Return ONLY this JSON:
{
  "children": ["<word/phrase>", "<word/phrase>", ...]
}
Rules:
- Each item: 1–3 words max, all English
- Include: synonyms, collocations, related concepts, example contexts
- Do NOT repeat these existing nodes: ${existing.slice(0, 20).join(', ')}
- Keep items diverse and useful for vocabulary learning`,
    },
    {
      role: 'user',
      content: `Generate related words for: "${word}"`,
    },
  ]
}
