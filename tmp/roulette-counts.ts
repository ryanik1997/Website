import states from '../apps/web/src/features/speaking-ielts/data/roulette-states.json'
import { normalizeRoulette } from '../apps/web/src/features/speaking-ielts/speakingIeltsData'
const pools=normalizeRoulette(states)
console.log(JSON.stringify({part1:pools[1].length,part2:pools[2].length,part3:pools[3].length}))
