import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
const root=resolve(import.meta.dirname,'../..')
const range={p4:[300,360],p5:[180,220],p6:[160,200]}
const prose=s=>s.replace(/\(\d+\)\s*\.{2,}/g,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()
const wc=s=>prose(s).split(/\s+/).filter(Boolean).length
const sentences=s=>(prose(s).match(/[.!?](?=\s|$)/g)||[]).length
function load(n,source='work') {const f=`packages/catalog/data/reading-pet-b1-test${n}.json`;return JSON.parse(source==='head'?execFileSync('git',['show',`HEAD:${f}`],{cwd:root,encoding:'utf8'}):readFileSync(resolve(root,f),'utf8'))}
function metrics(n,source='work') {const d=load(n,source);const out={test:n};for(const pn of [4,5,6]){const p=d.parts.find(x=>x.partNumber===pn);const blocks=(p.passage||[]).filter(b=>!b.label&&b.text);const counts=blocks.map(b=>wc(b.text));const text=blocks.map(b=>b.text).join(' ');const w=wc(text);const m={words:w,paragraphCount:pn===4?blocks.length:1,sentenceCount:sentences(text),shortestParagraphWords:pn===4?Math.min(...counts):null,longestParagraphWords:pn===4?Math.max(...counts):null,paragraphBalanceRatio:pn===4?Math.max(...counts)/Math.min(...counts):null};out[`part${pn}`]=m;if(source==='work'){if(w<range[`p${pn}`][0]||w>range[`p${pn}`][1])throw Error(`T${n} P${pn} strict words ${w}`);if(pn===4&&(counts.some(x=>x<50||x>85)||m.sentenceCount<14))throw Error(`T${n} P4 visual ${JSON.stringify(m)}`);if(pn>4&&m.sentenceCount<8)throw Error(`T${n} P${pn} sentences ${m.sentenceCount}`)}}return out}
const current=[],old=[];for(let n=20;n<=29;n++){current.push(metrics(n));old.push(metrics(n,'head'))}
console.log(JSON.stringify({current,old},null,2));console.log('STRICT TARGET PASS')
