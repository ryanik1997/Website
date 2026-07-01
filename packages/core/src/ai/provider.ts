export type AIProvider = 'openai' | 'deepseek' | 'groq' | 'gemini'

export interface AIProviderConfig {
  id: AIProvider
  name: string
  url: string
  defaultModel: string
  note: string
}

export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    url: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4o-mini',
    note: 'platform.openai.com/api-keys',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    url: 'https://api.deepseek.com/v1/chat/completions',
    defaultModel: 'deepseek-chat',
    note: 'platform.deepseek.com — rẻ ~10x OpenAI',
  },
  {
    id: 'groq',
    name: 'Groq (miễn phí)',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    defaultModel: 'llama-3.3-70b-versatile',
    note: 'console.groq.com — có gói free',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    defaultModel: 'gemini-2.0-flash',
    note: 'aistudio.google.com — có gói free',
  },
]

export type AIMessagePart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string; detail?: 'low' | 'high' } }

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | AIMessagePart[]
}

export interface AIResult {
  content: string
  inputTokens: number
  outputTokens: number
}

function messageText(content: AIMessage['content']): string {
  if (typeof content === 'string') return content
  return content.filter((p): p is { type: 'text'; text: string } => p.type === 'text').map(p => p.text).join('\n')
}

/** OpenAI yêu cầu từ "json" trong messages khi dùng response_format json_object */
function ensureJsonHint(messages: AIMessage[]): AIMessage[] {
  if (messages.some(m => /json/i.test(messageText(m.content)))) return messages
  return [
    { role: 'system', content: 'You must respond with valid JSON only.' },
    ...messages,
  ]
}

const VISION_PROVIDERS = new Set<AIProvider>(['openai', 'gemini'])

export function providerSupportsVision(provider: AIProvider): boolean {
  return VISION_PROVIDERS.has(provider)
}

function visionModel(provider: AIProvider, fallback: string): string {
  if (provider === 'openai') return 'gpt-4o-mini'
  if (provider === 'gemini') return 'gemini-2.0-flash'
  return fallback
}

function hasImageParts(messages: AIMessage[]): boolean {
  return messages.some(
    m => Array.isArray(m.content) && m.content.some(p => p.type === 'image_url'),
  )
}

function stripImagesForTextOnly(messages: AIMessage[]): AIMessage[] {
  return messages.map(m => {
    if (!Array.isArray(m.content)) return m
    const text = m.content
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map(p => p.text)
      .join('\n')
    const suffix = '\n\n[Ảnh đính kèm nhưng model này không xem được — suy luận từ phần mô tả trong đề.]'
    return { ...m, content: text + suffix }
  })
}

export async function callAI(
  messages: AIMessage[],
  apiKey: string,
  provider: AIProvider = 'openai',
  model?: string,
  options?: { jsonMode?: boolean },
): Promise<AIResult> {
  const cfg = AI_PROVIDERS.find(p => p.id === provider)!
  let payload = ensureJsonHint(messages)

  const useVision = hasImageParts(payload) && providerSupportsVision(provider)
  if (hasImageParts(payload) && !providerSupportsVision(provider)) {
    payload = stripImagesForTextOnly(payload)
  }

  const jsonMode = options?.jsonMode !== false
  const resolvedModel = useVision
    ? visionModel(provider, model ?? cfg.defaultModel)
    : (model ?? cfg.defaultModel)

  const res = await fetch(cfg.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: resolvedModel,
      messages: payload,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      temperature: 0.35,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    if (res.status === 429 && provider === 'gemini') {
      throw new Error(
        'Gemini hết quota (429). Free tier giới hạn theo phút/ngày trên project Google — '
        + 'import PDF gọi 5–8 request liên tiếp dễ chạm giới hạn. '
        + 'Thử đợi 1–2 phút, đổi sang DeepSeek/OpenAI, hoặc bật billing trên AI Studio. '
        + `Chi tiết: ${text.slice(0, 180)}`,
      )
    }
    throw new Error(`AI error ${res.status}: ${text.slice(0, 300)}`)
  }

  const data = await res.json()
  return {
    content: data.choices[0].message.content as string,
    inputTokens: data.usage?.prompt_tokens ?? 0,
    outputTokens: data.usage?.completion_tokens ?? 0,
  }
}
