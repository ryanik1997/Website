export type ForecastItem = {
  id: string
  part: 1 | 2 | 3
  title: string
  cueCard?: string
  bulletPoints: string[]
  part3Questions: string[]
  questions?: string[]
  hints?: string[]
  sampleAnswerStructure?: string
  sourceUrl: string
}

export type Part1Question = RouletteItem & { part: 1; topic: string; question: string; relatedQuestions: string[]; hints: string[]; prompt: string; sourceId: string }
export type Part2CueCard = RouletteItem & { part: 2; topic: string; cueCard: string; bulletPoints: string[]; hints: string[]; linkedPart3Questions: string[]; prompt: string; sourceId: string }
export type Part3Question = RouletteItem & { part: 3; topic: string; question: string; relatedQuestions: string[]; hints: string[]; prompt: string; sourceId: string }
export type ShadowingLesson = { id: string; title: string; videoTitle: string; videoUrl: string | null; audioUrl: string | null; thumbnailUrl: string | null; duration: string | null; transcript: string[]; segments: Array<{ index: number; text: string }>; sourceUrl: string }
export type SpeakingPracticeItem = Part1Question | Part2CueCard | Part3Question | ShadowingLesson
export type RoulettePools = Record<1 | 2 | 3, RouletteItem[]>

export type RouletteItem = {
  id: string
  part: 1 | 2 | 3
  topic: string
  prompt: string
  sourceUrl: string
}

type State = { text: string }

const sourceUrl = 'https://theieltsdictionary.com/practice/speaking'
const heading = /^(PART 1 BẮT BUỘC|PART 1 CHỦ ĐỀ|PART 2 \+ 3)\s*\((\d+)\)$/i

type ForecastPart23Raw = { cueCard: string; bullets: string[]; part3: string[] }
type ForecastFullData = { part2_3: ForecastPart23Raw[] }

function lines(text: string) { return text.split(/\r?\n/).map(line => line.trim()).filter(Boolean) }

function forecastItems(state: State, tab: number): ForecastItem[] {
  const result: ForecastItem[] = []
  const stateLines = lines(state.text)
  let current: ForecastItem | undefined
  let inBullets = false
  let inPart3 = false
  for (const line of stateLines) {
    if (heading.test(line) || /^🔥|^NEW$|^Luyện tập$/i.test(line)) continue
    const match = line.match(/^(\d+)\.\s+(.+)$/)
    if (match) {
      const title = match[2].trim()
      if (inPart3 && current && !/^(Describe|Talk about)\b/i.test(title)) {
        current.part3Questions.push(title)
        continue
      }
      current = tab === 2
        ? { id: `forecast-p23-${match[1]}`, part: 2, title, cueCard: title, bulletPoints: [], part3Questions: [], sourceUrl }
        : { id: `forecast-p1-${tab}-${match[1]}`, part: 1, title, bulletPoints: [], part3Questions: [], sourceUrl }
      result.push(current)
      inBullets = false
      inPart3 = false
      continue
    }
    if (!current || tab !== 2) continue
    if (/^YOU SHOULD SAY:?$/i.test(line)) { inBullets = true; inPart3 = false; continue }
    if (/^Part 3 Questions/i.test(line)) { inBullets = false; inPart3 = true; continue }
    if (line === '•') continue
    if (inBullets) current.bulletPoints.push(line.replace(/^•\s*/, ''))
    else if (inPart3) current.part3Questions.push(line.replace(/^•\s*/, ''))
  }
  return result
}

export function normalizeForecast(states: State[], fullData?: ForecastFullData): { period: string | null; mandatoryPart1: ForecastItem[]; part1Topics: ForecastItem[]; part23Sets: ForecastItem[] } {
  const part23Sets = forecastItems(states[2] ?? { text: '' }, 2)
  if (fullData?.part2_3) {
    for (const [index, raw] of fullData.part2_3.entries()) {
      const item = part23Sets[index]
      if (item && raw.part3?.length) item.part3Questions = [...raw.part3]
    }
  }
  return {
    period: states[0]?.text.match(/QUÍ? ?2[^\n]*/i)?.[0] ?? null,
    mandatoryPart1: forecastItems(states[0] ?? { text: '' }, 0),
    part1Topics: forecastItems(states[1] ?? { text: '' }, 1),
    part23Sets,
  }
}

export function normalizeRoulette(states: State[]): Record<1 | 2 | 3, RouletteItem[]> {
  const pools: Record<1 | 2 | 3, RouletteItem[]> = { 1: [], 2: [], 3: [] }
  for (const [stateIndex, state] of states.entries()) {
    // Every captured state repeats all three tab labels, so the first "Part N"
    // in the text is not the active pool. The crawl order is Part 1, Part 2,
    // Part 3, then Part 3's spinning state.
    const partNumber = Math.min(stateIndex + 1, 3) as 1 | 2 | 3
    for (const line of lines(state.text)) {
      const topic = line.replace(/[?？]+$/, '').trim()
      if (!topic || /^(Speaking Roulette|IELTS|Saved|Part \d|INTERVIEW|CUE CARD|DISCUSSION|PHOTOS|Spin the deck|Tap (?:a card|the star)|✕$|Saved questions|No saved questions)/i.test(topic)) continue
      if (/^\d+$/.test(topic) || /^Spinning|^Finding your question/i.test(topic)) continue
      const id = `roulette-${partNumber}-${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
      if (!pools[partNumber].some(item => item.id === id)) pools[partNumber].push({ id, part: partNumber, topic, prompt: topic, sourceUrl })
    }
  }
  return pools
}

export function pickRoulette<T extends { id: string }>(pool: T[], previousId?: string, random = Math.random): T | undefined {
  if (!pool.length) return undefined
  const candidates = pool.length > 1 ? pool.filter(item => item.id !== previousId) : pool
  return candidates[Math.floor(random() * candidates.length)]
}

export function buildSpotlightSequence(cardCount: number, finalIndex: number, minimumTicks = 16): number[] {
  if (cardCount <= 0) return []
  const safeFinal = Math.max(0, Math.min(finalIndex, cardCount - 1))
  const currentLastIndex = (minimumTicks - 1) % cardCount
  const extraTicks = (safeFinal - currentLastIndex + cardCount) % cardCount
  const totalTicks = minimumTicks + extraTicks
  return Array.from({ length: totalTicks }, (_, i) => i % cardCount)
}

export function isSpeakingPracticeItem(value: unknown): value is SpeakingPracticeItem {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.id === 'string' && typeof item.sourceUrl === 'string' && (item.part === 1 || item.part === 2 || item.part === 3 || Array.isArray(item.segments))
}

export function normalizeShadowingLesson(raw: { id: string; title?: string; sourceUrl: string; contentText?: string; audioUrl?: string | null; videoUrl?: string | null; thumbnailUrl?: string | null; duration?: string | null }): ShadowingLesson {
  const body = raw.contentText ?? ''
  const title = body.split(/\r?\n/).map(line => line.trim()).find(line => line && !/^(custom|shadowing|dictation|quiz|phụ đề|kết thúc|[0-9.]+x|\d+\/\d+|hiện)$/i.test(line) && !/^#\d+/.test(line)) ?? raw.title ?? 'Shadowing lesson'
  const transcript = [...body.matchAll(/^#\d+\s*\n?([^#\n].*)$/gm)].map(match => match[1].trim()).filter(Boolean)
  return { id: raw.id, title, videoTitle: title, videoUrl: raw.videoUrl ?? null, audioUrl: raw.audioUrl ?? null, thumbnailUrl: raw.thumbnailUrl ?? null, duration: raw.duration ?? null, transcript, segments: transcript.map((text, index) => ({ index: index + 1, text })), sourceUrl: raw.sourceUrl }
}
