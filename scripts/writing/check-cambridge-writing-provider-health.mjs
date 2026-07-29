#!/usr/bin/env node
import path from 'node:path'
import { callCambridgeWritingAi, getAiIdentity, isAiConfigured } from './cambridge-writing-ai-provider.mjs'
import { TMP_ROOT, writeJson } from './cambridge-writing-runtime.mjs'

function redact(message) {
  return String(message)
    .replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED]')
    .replace(/(?:sk|gsk|api)[-_][A-Za-z0-9_-]{8,}/g, '[REDACTED]')
    .slice(0, 800)
}

async function check(role) {
  const identity = getAiIdentity(role)
  const startedAt = Date.now()
  try {
    const response = await callCambridgeWritingAi({
      role,
      systemPrompt: 'Return valid JSON only.',
      userPrompt: 'Return exactly {"ok":true}.',
      temperature: 0,
      timeoutMs: 30000,
      maxRetries: 0,
      maxTokens: 32,
    })
    if (response?.ok !== true) throw new Error(`Unexpected health response: ${JSON.stringify(response)}`)
    return { role, ...identity, keyLoaded: isAiConfigured(role), status: 'PASS', latencyMs: Date.now() - startedAt }
  } catch (error) {
    const text = error instanceof Error ? error.message : String(error)
    const statusMatch = text.match(/AI provider error\s+(\d+)/)
    return { role, ...identity, keyLoaded: isAiConfigured(role), status: 'FAIL', httpStatus: statusMatch ? Number(statusMatch[1]) : null, error: redact(text), latencyMs: Date.now() - startedAt }
  }
}

const generationOnly = process.argv.includes('--generation-only')
const generator = await check('generation')
const verifier = generationOnly
  ? { role: 'verification', status: 'SKIPPED_BY_USER', reason: 'DeepSeek-only scope' }
  : await check('verification')
const report = {
  generatedAt: Date.now(),
  scope: generationOnly ? 'generation-only' : 'generation-and-verification',
  maskedConfig: {
    generatorProvider: generator.provider,
    generatorModel: generator.model,
    generatorKeyLoaded: generator.keyLoaded,
    verifierProvider: verifier.provider ?? null,
    verifierModel: verifier.model ?? null,
    verifierKeyLoaded: verifier.keyLoaded ?? false,
  },
  health: { generator, verifier },
  valid: generator.status === 'PASS' && (generationOnly || verifier.status === 'PASS'),
}
await writeJson(path.join(TMP_ROOT, 'cambridge-writing-provider-health.json'), report)
console.log(JSON.stringify({ ...report.maskedConfig, generatorHealth: generator.status, verifierHealth: verifier.status }, null, 2))
if (!report.valid) process.exitCode = 1
