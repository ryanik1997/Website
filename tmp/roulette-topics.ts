import states from '../apps/web/src/features/speaking-ielts/data/roulette-states.json'
import { normalizeRoulette } from '../apps/web/src/features/speaking-ielts/speakingIeltsData'
const p=normalizeRoulette(states)
for(const n of [1,2,3] as const) console.log(n,p[n].map(x=>x.topic))
