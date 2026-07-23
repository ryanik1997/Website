import http from 'k6/http'
import { check, sleep } from 'k6'
import { SharedArray } from 'k6/data'
import { Trend, Counter } from 'k6/metrics'

const baseUrl = __ENV.SUPABASE_URL
const anonKey = __ENV.SUPABASE_ANON_KEY
const fixturesPath = __ENV.SYNC_FIXTURES ?? './sync-fixtures.json'
if (!baseUrl || !anonKey) throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY are required')

const users = new SharedArray('sync users', () => JSON.parse(open(fixturesPath)))
const pullDuration = new Trend('sync_pull_duration', true)
const pushDuration = new Trend('sync_push_duration', true)
const correctnessErrors = new Counter('sync_correctness_errors')

export const options = {
  scenarios: {
    incremental_pull: {
      executor: 'ramping-vus',
      exec: 'pullSync',
      stages: [
        { duration: '1m', target: 200 },
        { duration: '2m', target: 500 },
        { duration: '2m', target: 1000 },
        { duration: '5m', target: 1000 },
        { duration: '1m', target: 0 },
      ],
    },
    batch_push: {
      executor: 'constant-arrival-rate',
      exec: 'pushSync',
      startTime: '3m',
      rate: 100,
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 200,
      maxVUs: 1000,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000', 'p(99)<2500'],
    sync_pull_duration: ['p(95)<1000'],
    sync_push_duration: ['p(95)<1500'],
    sync_correctness_errors: ['count==0'],
  },
}

function fixture() {
  return users[(__VU - 1) % users.length]
}

function headers(user) {
  return {
    apikey: anonKey,
    Authorization: `Bearer ${user.accessToken}`,
    'Content-Type': 'application/json',
  }
}

export function pullSync() {
  const user = fixture()
  const cursor = encodeURIComponent(user.cursor ?? '1970-01-01T00:00:00.000Z')
  const url = `${baseUrl}/rest/v1/cards?select=id,deck_id,phrase,meaning,updated_at&user_id=eq.${user.userId}&updated_at=gt.${cursor}&order=updated_at.asc,id.asc&limit=500`
  const started = Date.now()
  const response = http.get(url, { headers: headers(user), tags: { operation: 'sync_pull_cards' } })
  pullDuration.add(Date.now() - started)
  const ok = check(response, {
    'pull status 200': r => r.status === 200,
    'pull returns JSON array': r => Array.isArray(r.json()),
  })
  if (!ok) correctnessErrors.add(1)
  sleep(Math.random() * 2)
}

export function pushSync() {
  const user = fixture()
  if (!user.cardId) return
  const payload = JSON.stringify([{
    card_id: user.cardId,
    user_id: user.userId,
    ease: 2.5,
    interval_days: 1,
    reps: Number(__ITER % 1000),
    lapses: 0,
    due_at: new Date(Date.now() + 86_400_000).toISOString(),
    last_reviewed_at: new Date().toISOString(),
    state: 'review',
  }])
  const started = Date.now()
  const response = http.post(`${baseUrl}/rest/v1/srs?on_conflict=card_id`, payload, {
    headers: { ...headers(user), Prefer: 'resolution=merge-duplicates,return=minimal' },
    tags: { operation: 'sync_push_srs' },
  })
  pushDuration.add(Date.now() - started)
  if (!check(response, { 'push status 2xx': r => r.status >= 200 && r.status < 300 })) {
    correctnessErrors.add(1)
  }
  sleep(Math.random() * 2)
}
