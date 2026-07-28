import crypto from 'node:crypto'

const DEFAULTS = {
  generation: { provider: 'openai', model: 'gpt-4o-mini' },
  verification: { provider: 'openai', model: 'gpt-4o-mini' },
}

function getConfig(role) {
  const verify = role === 'verification'
  const prefix = verify ? 'CAMBRIDGE_WRITING_VERIFY' : 'CAMBRIDGE_WRITING_AI'
  return {
    provider: process.env[`${prefix}_PROVIDER`] || DEFAULTS[role].provider,
    model: process.env[`${prefix}_MODEL`] || DEFAULTS[role].model,
    key: process.env[`${prefix}_KEY`] || '',
    baseUrl: process.env[`${prefix}_BASE_URL`] || '',
  }
}

function defaultBaseUrl(provider) {
  if (provider === 'anthropic') return 'https://api.anthropic.com/v1'
  if (provider === 'ollama') return 'http://localhost:11434'
  if (provider === 'deepseek') return 'https://api.deepseek.com/v1'
  if (provider === 'groq') return 'https://api.groq.com/openai/v1'
  return 'https://api.openai.com/v1'
}

function endpoint(provider, baseUrl) {
  if (provider === 'anthropic') return `${baseUrl}/messages`
  if (provider === 'ollama') return `${baseUrl}/api/generate`
  return `${baseUrl}/chat/completions`
}

function headers(provider, key) {
  const result = { 'Content-Type': 'application/json' }
  if (provider === 'anthropic') {
    result['x-api-key'] = key
    result['anthropic-version'] = '2023-06-01'
  } else if (provider !== 'ollama') {
    result.Authorization = `Bearer ${key}`
  }
  return result
}

function requestBody(provider, model, systemPrompt, userPrompt, temperature) {
  if (provider === 'anthropic') {
    return { model, max_tokens: 12000, temperature, system: systemPrompt, messages: [{ role: 'user', content: userPrompt }] }
  }
  if (provider === 'ollama') {
    return { model, prompt: `${systemPrompt}\n\n${userPrompt}`, format: 'json', stream: false, options: { temperature, num_predict: 12000 } }
  }
  return {
    model,
    temperature,
    max_tokens: 12000,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  }
}

function extract(provider, body) {
  if (provider === 'anthropic') return body.content?.find(item => item.type === 'text')?.text
  if (provider === 'ollama') return body.response
  return body.choices?.[0]?.message?.content
}

function parseJson(content) {
  if (typeof content !== 'string' || !content.trim()) throw new Error('AI provider returned empty content')
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  return JSON.parse((fenced?.[1] ?? content).trim())
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

export function isAiConfigured(role = 'generation') {
  const config = getConfig(role)
  return config.provider === 'ollama' || Boolean(config.key)
}

export function getAiIdentity(role = 'generation') {
  const { provider, model } = getConfig(role)
  return { provider, model }
}

export async function callCambridgeWritingAi({ role = 'generation', systemPrompt, userPrompt, temperature = 0.6, timeoutMs = 120000, maxRetries = 2 }) {
  const config = getConfig(role)
  if (config.provider !== 'ollama' && !config.key) {
    const prefix = role === 'verification' ? 'CAMBRIDGE_WRITING_VERIFY' : 'CAMBRIDGE_WRITING_AI'
    throw new Error(`${prefix}_KEY is not configured for ${config.provider} ${config.model}`)
  }
  const url = endpoint(config.provider, config.baseUrl || defaultBaseUrl(config.provider))
  let lastError
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: headers(config.provider, config.key),
        body: JSON.stringify(requestBody(config.provider, config.model, systemPrompt, userPrompt, temperature)),
      }, timeoutMs)
      if (!response.ok) throw new Error(`AI provider error ${response.status}: ${(await response.text()).slice(0, 800)}`)
      const body = await response.json()
      return parseJson(extract(config.provider, body))
    } catch (error) {
      lastError = error
      if (attempt >= maxRetries) break
    }
  }
  throw lastError
}

export function contentHash(value) {
  const clone = structuredClone(value)
  if (clone && typeof clone === 'object' && clone.provenance) clone.provenance.contentHash = ''
  return crypto.createHash('sha256').update(JSON.stringify(clone)).digest('hex')
}
