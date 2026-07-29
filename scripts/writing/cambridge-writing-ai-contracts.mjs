import crypto from 'node:crypto'

export const PROMPT_VERSION = 2

export function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

export function sha256(value) {
  return crypto.createHash('sha256').update(typeof value === 'string' ? value : stableJson(value)).digest('hex')
}

export const SCHEMA_ONLY_EXAMPLE = {
  id: '<level>-test-NN',
  level: '<level>',
  testNumber: 0,
  title: '<generated title>',
  status: 'draft',
  version: 1,
  tasks: [
    {
      id: '<test-id>-task-NN',
      partNumber: 1,
      taskNumber: 1,
      title: '<task title>',
      genre: '<genre>',
      instruction: '<candidate instruction>',
      promptText: '<original prompt>',
      promptBlocks: [{ id: '<block-id>', type: 'paragraph', text: '<original content>' }],
      wordLimit: { min: 0, max: 0, displayText: '<display text>' },
      metadata: { compulsory: true },
      presentation: { template: '<template>' },
    },
  ],
}

export function buildGenerationCacheKey({
  promptVersion,
  provider,
  model,
  level,
  testId,
  testNumber,
  planRow,
  levelContract,
  avoidanceCorpus,
}) {
  const input = {
    promptVersion,
    provider,
    model,
    level,
    testId,
    testNumber,
    planRowHash: sha256(planRow),
    levelContractHash: sha256(levelContract),
    avoidanceCorpusHash: sha256(avoidanceCorpus),
  }
  const inputHash = sha256(input)
  return {
    inputHash,
    cacheKey: ['cambridge-writing', promptVersion, provider, model, level, testId, inputHash].join(':'),
    input,
  }
}

export function cachedGenerationMatches(cached, request) {
  return Boolean(
    cached
      && cached.inputHash === request.inputHash
      && cached.test?.id === request.testId
      && cached.test?.level === request.level
      && cached.test?.testNumber === request.testNumber,
  )
}
