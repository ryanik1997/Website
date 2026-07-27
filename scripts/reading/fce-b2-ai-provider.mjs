#!/usr/bin/env node
/**
 * Phase 4 — AI provider abstraction for FCE B2 Reading repair.
 *
 * Reads environment variables:
 *   FCE_REPAIR_AI_PROVIDER  — provider name: 'openai', 'anthropic', 'ollama' (default: 'openai')
 *   FCE_REPAIR_AI_MODEL     — model name (default: 'gpt-4o-mini')
 *   FCE_REPAIR_AI_KEY       — API key
 *   FCE_REPAIR_AI_BASE_URL  — base URL for custom endpoint
 *
 * Returns pure JSON. Never hard-codes keys.
 */

import crypto from 'node:crypto'

const PROVIDER = process.env.FCE_REPAIR_AI_PROVIDER || 'openai'
const MODEL = process.env.FCE_REPAIR_AI_MODEL || 'gpt-4o-mini'
const KEY = process.env.FCE_REPAIR_AI_KEY || ''
const BASE_URL = process.env.FCE_REPAIR_AI_BASE_URL || ''

function getDefaultBaseUrl(provider) {
  switch (provider) {
    case 'openai': return 'https://api.openai.com/v1'
    case 'anthropic': return 'https://api.anthropic.com/v1'
    case 'ollama': return 'http://localhost:11434'
    default: return 'https://api.openai.com/v1'
  }
}

function buildRequestBody(provider, model, systemPrompt, userPrompt) {
  switch (provider) {
    case 'anthropic': {
      return {
        model,
        max_tokens: 8192,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }
    }
    case 'ollama': {
      return {
        model: model || 'llama3.2',
        prompt: `${systemPrompt}\n\n${userPrompt}`,
        stream: false,
        options: { num_predict: 8192 },
      }
    }
    default: {
      return {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 8192,
        response_format: { type: 'json_object' },
      }
    }
  }
}

function buildHeaders(provider, key) {
  const headers = { 'Content-Type': 'application/json' }
  switch (provider) {
    case 'anthropic': {
      headers['x-api-key'] = key
      headers['anthropic-version'] = '2023-06-01'
      break
    }
    case 'ollama': {
      // No auth needed for local Ollama
      break
    }
    default: {
      headers['Authorization'] = `Bearer ${key}`
    }
  }
  return headers
}

function getChatEndpoint(provider, baseUrl) {
  switch (provider) {
    case 'anthropic': return `${baseUrl}/messages`
    case 'ollama': return `${baseUrl}/api/generate`
    default: return `${baseUrl}/chat/completions`
  }
}

function extractContent(provider, responseBody) {
  try {
    switch (provider) {
      case 'anthropic': {
        if (responseBody.content?.[0]?.text) return responseBody.content[0].text
        return null
      }
      case 'ollama': {
        if (responseBody.response) return responseBody.response
        return null
      }
      default: {
        if (responseBody.choices?.[0]?.message?.content) return responseBody.choices[0].message.content
        return null
      }
    }
  } catch {
    return null
  }
}

/**
 * Call the AI provider and return parsed JSON.
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @returns {Promise<object>} parsed JSON response
 */
export async function callAiForRepair(systemPrompt, userPrompt) {
  const provider = PROVIDER
  const model = MODEL
  const key = KEY
  const baseUrl = BASE_URL || getDefaultBaseUrl(provider)

  if (!key && provider !== 'ollama') {
    throw new Error(
      `FCE_REPAIR_AI_KEY not set. Cannot call ${provider} ${model}.\n` +
      `Set env vars: FCE_REPAIR_AI_PROVIDER, FCE_REPAIR_AI_MODEL, FCE_REPAIR_AI_KEY`,
    )
  }

  if (provider !== 'ollama' && !key) {
    console.warn('[ai-provider] No API key set — returning mock repair')
    return null
  }

  const endpoint = getChatEndpoint(provider, baseUrl)
  const body = buildRequestBody(provider, model, systemPrompt, userPrompt)
  const headers = buildHeaders(provider, key)

  console.log(`[ai-provider] Calling ${provider} ${model} at ${endpoint}`)

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`AI provider error ${response.status}: ${text.slice(0, 500)}`)
  }

  const responseBody = await response.json()
  const content = extractContent(provider, responseBody)

  if (!content) {
    throw new Error(`AI provider returned empty content: ${JSON.stringify(responseBody).slice(0, 500)}`)
  }

  // Try to extract JSON from the response
  const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || content.match(/\{[\s\S]*\}/)
  const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content

  let parsed
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    throw new Error(`AI provider returned invalid JSON: ${content.slice(0, 1000)}`)
  }

  return parsed
}

/**
 * Compute input hash for caching.
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @returns {string} SHA-256 hex hash
 */
export function computeInputHash(systemPrompt, userPrompt) {
  return crypto.createHash('sha256').update(systemPrompt + '|||' + userPrompt).digest('hex')
}

/**
 * Check if an AI provider is configured.
 * @returns {boolean}
 */
export function isAiProviderConfigured() {
  if (PROVIDER === 'ollama') return true // local, no key needed
  return !!KEY
}
