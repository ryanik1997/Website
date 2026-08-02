import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ChevronDown, Clipboard, Mic2, Play, RotateCcw, Search, Shuffle, X } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { loadLatestSpeakingConversation, type SpeakingHistory } from '../speaking-ai/speakingAiApi'
import { useSpeakingRecorder } from '../speaking-ai/useSpeakingRecorder'
import { completedIeltsHistory, streakDays } from './speakingIeltsProgress'
import { buildSpotlightSequence, normalizeForecast, normalizeRoulette, normalizeShadowingLesson, pickRoulette, type ForecastItem, type RouletteItem } from './speakingIeltsData'
import { lookupPart1Questions } from './part1QuestionBank'
import { SPEAKING_POOLS, getPart2LinkedGroup, getPart2Prompts, getPart2ClosingInstruction, getPart3PoolForGroup, getSpeakingItem, pickPart3ForSession, createPart3Session, resetPart3Session, type Part3Session } from './data/speakingPools'
import { playTickSound, playCardRevealSound, primeRouletteAudio } from './soundEffects'
import { samplesByPart, hasSamples, type SpeakingSample } from './speakingSamples'
import SpeakingMockInterviewPage from './SpeakingMockInterviewPage'
import './speakingIelts.css'

type RawItem={id:string;sourceUrl:string;canonicalUrl:string;module:string;title:string;contentText:string;assetReferences?:Array<{src?:string}>}
const loaded=import.meta.glob('./data/*.json',{eager:true,import:'default'}) as Record<string,unknown>
const rawItems=Object.values(loaded).filter((x):x is RawItem=>Boolean(x&&typeof x==='object'&&'id' in x))
const forecastData=normalizeForecast((loaded['./data/forecast-tab-states.json'] as Array<{text:string}>)??[],loaded['./data/forecast-q2-2026-full.json'] as {part2_3:Array<{cueCard:string;bullets:string[];part3:string[]}>}|undefined)
const forecastItems=[...forecastData.mandatoryPart1,...forecastData.part1Topics,...forecastData.part23Sets]
const roulettePools=normalizeRoulette((loaded['./data/roulette-states.json'] as Array<{text:string}>)??[])
const lessons=rawItems.filter(x=>x.module==='shadowing'&&!new URL(x.canonicalUrl).pathname.endsWith('/shadowing')).map(x=>normalizeShadowingLesson({...x,videoUrl:x.assetReferences?.find(a=>/youtube|youtu\.be/.test(a.src??''))?.src??null,thumbnailUrl:x.assetReferences?.find(a=>/\.(png|jpe?g|webp)/i.test(a.src??''))?.src??null})).slice(0,30)
const mockItems=():ForecastItem[]=>[forecastData.mandatoryPart1[0]?(()=>{const b=lookupPart1Questions(forecastData.mandatoryPart1[0].title);return{...forecastData.mandatoryPart1[0],questions:b?.questions,hints:b?.hints,sampleAnswerStructure:b?.sampleAnswerStructure}})():undefined,forecastData.part23Sets[0],roulettePools[3][0]?{id:roulettePools[3][0].id,part:3,title:roulettePools[3][0].topic,bulletPoints:[],part3Questions:[],sourceUrl:roulettePools[3][0].sourceUrl}:undefined].filter((x):x is ForecastItem=>Boolean(x))
export const cardActions={practiceBank:'open-topic-modal',forecast:'/app/speaking/ielts/forecast',roulette:'/app/speaking/ielts/roulette',shadowing:'/app/shadowing',premium:'/app/speaking/ielts/mock-interview/demo',sample:'/app/speaking/ielts/samples'} as const
const topicSections=[
  {label:'YOUR CUSTOM TOPICS',topics:['Hometown']},
  {label:'BẢN THÂN & GIA ĐÌNH',topics:['Family','Friends','Neighbours','Childhood','Pets']},
  {label:'HỌC TẬP & NGHỀ NGHIỆP',topics:['Work or Study','Education','Languages','Reading','Newspapers']},
  {label:'GIẢI TRÍ & SỞ THÍCH',topics:['Hobbies','Music','Sport','Films','Television','Art','Photography']},
  {label:'CÔNG NGHỆ & XÃ HỘI',topics:['Technology','Social Media','Robots','Emails']},
  {label:'LỐI SỐNG & SỨC KHỎE',topics:['Food','Health','Morning routine','Exercise','Sleep']},
]
const part1ModalTopics=topicSections.flatMap(section=>section.topics)
const slug=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
const practiceItems:ForecastItem[]=[
  ...part1ModalTopics.map(title=>{const bank=lookupPart1Questions(title);return{id:`practice-1-${slug(title)}`,part:1 as const,title,bulletPoints:[],part3Questions:[],questions:bank?.questions,hints:bank?.hints,sampleAnswerStructure:bank?.sampleAnswerStructure,sourceUrl:'local-curated-practice-bank'}}),
  ...forecastData.part23Sets.map(item=>({...item,id:`practice-2-${slug(item.title)}`,part:2 as const})),
  ...roulettePools[3].map(item=>({id:`practice-3-${slug(item.topic)}`,part:3 as const,title:item.topic,bulletPoints:[],part3Questions:[],sourceUrl:item.sourceUrl})),
]
function Back({to='/app/speaking/ielts',label='Về IELTS Speaking'}:{to?:string;label?:string}){const nav=useNavigate();return <button className="si-back" onClick={()=>window.history.length>1?nav(-1):nav(to)}><ArrowLeft/> {label}</button>}
function Stat({value,label}:{value:string;label:string}){return <div className="si-lab-stat"><strong>{value}</strong><small>{label}</small></div>}
function TopicModal({onClose}:{onClose:()=>void}){
  const nav=useNavigate();const[part,setPart]=useState<1|2|3>(1);const[selected,setSelected]=useState('');const dialog=useRef<HTMLDivElement>(null)
  const topics=part===1?part1ModalTopics:part===2?forecastData.part23Sets.map(item=>item.title):roulettePools[3].map(item=>item.topic)
  useEffect(()=>{const previous=document.activeElement as HTMLElement|null;const root=dialog.current;root?.querySelector<HTMLElement>('button')?.focus();const key=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose();if(event.key==='Tab'&&root){const focusable=[...root.querySelectorAll<HTMLElement>('button:not([disabled])')];const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}}};document.addEventListener('keydown',key);return()=>{document.removeEventListener('keydown',key);previous?.focus()}},[onClose])
  function selectPart(next:1|2|3){setPart(next);setSelected('')}
  function start(){if(!selected)return;nav(`/app/speaking/ielts/mock-interview/practice-${part}-${slug(selected)}`)}
  return <div className="si-modal-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}><div ref={dialog} className="si-topic-modal" role="dialog" aria-modal="true" aria-labelledby="si-topic-title"><header><div><h2 id="si-topic-title">Chọn Chủ Đề</h2><p>AI examiner sẽ hỏi theo part bạn chọn</p></div><button className="si-modal-close" aria-label="Đóng" onClick={onClose}><X/></button></header><div className="si-modal-tabs" role="tablist">{([1,2,3] as const).map(value=><button key={value} role="tab" aria-selected={part===value} className={part===value?'active':''} onClick={()=>selectPart(value)}>Part {value}<small>{value===1?`${part1ModalTopics.length} topics`:value===2?'Cue card':'Discussion'}</small></button>)}</div><button className="si-random" onClick={()=>setSelected(topics[Math.floor(Math.random()*topics.length)]??'')}><Shuffle/> Ngẫu nhiên</button><div className="si-topic-scroll">{part===1?topicSections.map(section=><section key={section.label}><h3>{section.label}</h3><div className="si-topic-chips">{section.topics.map(topic=><button key={topic} className={selected===topic?'selected':''} aria-pressed={selected===topic} onClick={()=>setSelected(topic)}>{topic}</button>)}</div></section>):<section><h3>{part===2?'CUE CARDS':'DISCUSSION TOPICS'}</h3><div className="si-topic-chips">{topics.map(topic=><button key={topic} className={selected===topic?'selected':''} aria-pressed={selected===topic} onClick={()=>setSelected(topic)}>{topic}</button>)}</div></section>}</div><footer><button disabled={!selected} onClick={start}>{selected?'Bắt đầu luyện':'Chọn một chủ đề để bắt đầu'} <ArrowRight/></button></footer></div></div>
}
function Landing(){
  const[history,setHistory]=useState<SpeakingHistory[]>([]);const[topicModal,setTopicModal]=useState(false)
  useEffect(()=>{void loadLatestSpeakingConversation().then(x=>setHistory(x?.histories??[]))},[])
  return <main className="si-page si-landing"><div className="si-lab-wrap"><Back to="/app/home" label="Về trang chủ"/><header className="si-lab-head"><span>SPEAKING LAB</span><h1>IELTS Speaking Lab</h1><p>Phòng luyện thi Speaking ảo với AI — nâng band điểm mỗi ngày.</p></header><section className="si-lab-stats" aria-label="Tiến độ Speaking"><Stat value={String(completedIeltsHistory(history).length)} label="SESSIONS TUẦN"/><Stat value="—" label="AVG BAND"/><Stat value={String(streakDays(history))} label="NGÀY LIÊN TIẾP"/></section><section className="si-lab-grid"><Link className="si-lab-card si-lab-premium" data-card="premium" to={cardActions.premium}><div><small>PREMIUM SPEAKING</small><h2>Mock interview đủ 3 phần</h2><p>Luyện trọn buổi phỏng vấn với AI: Part 1, Cue Card và Discussion.</p></div><div className="si-lab-premium-actions"><span className="si-lab-live"><i/> AI online</span><strong>Bắt đầu mock interview <ArrowRight/></strong></div></Link><button className="si-lab-card si-lab-bank" data-card="practice" aria-label="Practice Bank" aria-expanded={topicModal} onClick={()=>setTopicModal(true)}><div className="si-lab-fan" aria-hidden="true"><i/><i/></div><small>REAL IELTS QUESTIONS</small><h2>Practice bank</h2><p>Luyện với bộ câu hỏi thi thật.</p><span className="si-lab-cta">Bắt đầu luyện <ArrowRight/></span></button><Link className="si-lab-card si-lab-roulette" data-card="roulette" to={cardActions.roulette}><small>SPEAKING ROULETTE</small><h2>Rút thẻ bất ngờ</h2><p>Ngẫu nhiên 1 chủ đề, luyện phản xạ trả lời.</p><span className="si-lab-cta">Rút thẻ <ArrowRight/></span></Link><Link className="si-lab-card si-lab-forecast" data-card="forecast" to={cardActions.forecast}><small>FORECAST Q2 · 2026</small><h2>Dự đoán đề mới nhất</h2><div className="si-lab-fstats"><span><strong>{forecastData.mandatoryPart1.length}</strong><small>BẮT BUỘC</small></span><span><strong>{forecastData.part1Topics.length}</strong><small>CHỦ ĐỀ</small></span><span><strong>{forecastData.part23Sets.length}</strong><small>PART 2+3</small></span></div><span className="si-lab-cta">Xem chi tiết <ArrowRight/></span></Link><Link className="si-lab-card si-lab-shadow" data-card="shadowing" to={cardActions.shadowing}><small>SHADOWING</small><h2>Nghe và nói như người bản xứ</h2><div className="si-lab-play"><Play/></div><span className="si-lab-cta">Luyện shadowing <ArrowRight/></span></Link><Link className="si-lab-card si-lab-sample" data-card="sample" to={cardActions.sample}><span className="si-lab-badge">Sample · 8.0 speaking</span><h2>Bài mẫu band cao</h2><p>Tham khảo cấu trúc ý và cụm từ hay trước khi luyện với AI.</p><span className="si-lab-cta">Khám phá <ArrowRight/></span></Link></section></div>{topicModal&&<TopicModal onClose={()=>setTopicModal(false)}/>}</main>
}
function Forecast(){
  const[tab,setTab]=useState(0);const[query,setQuery]=useState('');const[expanded,setExpanded]=useState<string>();const groups=[forecastData.mandatoryPart1,forecastData.part1Topics,forecastData.part23Sets];const items=groups[tab].filter(item=>item.title.toLowerCase().includes(query.toLowerCase()))
  function copy(item:ForecastItem){const bank=item.part===1?lookupPart1Questions(item.title):undefined;const text=[item.title,...item.bulletPoints,...item.part3Questions,...(bank?.questions??[])].join('\n');void navigator.clipboard?.writeText(text)}
  return <main className="si-page forecast-page"><Back label="Về trang Speaking"/><header className="si-forecast-head"><div><mark>THE IELTS DICTIONARY • QUÝ 2 • 2026</mark><h1>BỘ DỰ ĐOÁN ĐỀ THI IELTS SPEAKING QUÝ 2</h1><p>(THÁNG 5 - THÁNG 8) NĂM 2026</p></div><label className="si-forecast-search"><Search/><input role="searchbox" aria-label="Tìm chủ đề" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Tìm chủ đề..."/></label></header><nav className="si-tabs" role="tablist">{['PART 1 BẮT BUỘC','PART 1 CHỦ ĐỀ','PART 2 + 3'].map((label,index)=><button role="tab" aria-selected={tab===index} key={label} className={tab===index?'active':''} onClick={()=>setTab(index)}>{label} <b>{groups[index].length}</b></button>)}<button className="si-hot" type="button">🔥 THI THẬT CỰC CĂNG <b>NEW</b></button></nav><section className="si-list">{items.map((item,index)=>{const bank=item.part===1?lookupPart1Questions(item.title):undefined;return <article className="si-topic" aria-label={item.title} key={item.id}><span>{String(index+1).padStart(2,'0')}</span><div><small>PART {item.part}</small><h2>{item.title}</h2>{expanded===item.id&&<div className="si-topic-details">{item.bulletPoints.length?<ul>{item.bulletPoints.slice(0,6).map(point=><li key={point}>{point}</li>)}</ul>:bank?<div><p className="si-qa-label">Questions:</p><ul>{bank.questions.map(q=><li key={q}>{q}</li>)}</ul>{bank.hints.length>0&&<p className="si-qa-label">Vocabulary hints: <span className="si-hints">{bank.hints.join(', ')}</span></p>}{bank.sampleAnswerStructure&&<p className="si-qa-label">Structure: <span className="si-structure">{bank.sampleAnswerStructure}</span></p>}</div>:<p>Chủ đề này sẽ được AI examiner mở rộng thành các câu hỏi liên quan.</p>}</div>}</div><div className="si-topic-actions"><Link data-action="practice" to={`/app/speaking/ielts/mock-interview/${item.id}`}>Luyện tập <ArrowRight/></Link><button aria-label={`Sao chép ${item.title}`} onClick={()=>copy(item)}><Clipboard/></button><button aria-label={`${expanded===item.id?'Thu gọn':'Mở chi tiết'} ${item.title}`} aria-expanded={expanded===item.id} onClick={()=>setExpanded(expanded===item.id?undefined:item.id)}><ChevronDown/></button></div></article>})}</section></main>
}
type RoulettePhase="idle"|"lineup"|"running"|"landed"
const LINEUP_DURATION_MS=320
const LANDED_DURATION_MS=440
const MIN_SPOTLIGHT_TICKS=16
function Roulette(){
  const[part,setPart]=useState<1|2|3>(1)
  const[result,setResult]=useState<RouletteItem>()
  const[revealing,setRevealing]=useState(false)
  const[phase,setPhase]=useState<RoulettePhase>("idle")
  const[highlightIndex,setHighlightIndex]=useState(0)
  const[pickedIndex,setPickedIndex]=useState<number|null>(null)
  const[lastPart2Group,setLastPart2Group]=useState<string>()
  const part3SessionRef=useRef<Part3Session>(createPart3Session(undefined))
  const pendingResultRef=useRef<RouletteItem>()
  const spinLockedRef=useRef(false)
  const spinRunIdRef=useRef(0)
  const spinTimerIdsRef=useRef<number[]>([])
  const pool=useMemo(()=>{if(part===3&&lastPart2Group){const linked=getPart3PoolForGroup(lastPart2Group);const items:RouletteItem[]=linked.map(q=>({id:q.id,part:3 as const,topic:q.topic,prompt:q.question,sourceUrl:'local-curated-speaking-pool'}));return items.length>0?items:SPEAKING_POOLS[3]}return SPEAKING_POOLS[part]},[part,lastPart2Group])
  const visibleCards=useMemo(()=>pool.slice(0,7),[pool])
  function clearSpinTimers(){spinTimerIdsRef.current.forEach(id=>window.clearTimeout(id));spinTimerIdsRef.current=[]}
  function scheduleSpinTask(delay:number,fn:()=>void){const id=window.setTimeout(()=>{fn();spinTimerIdsRef.current=spinTimerIdsRef.current.filter(x=>x!==id)},delay);spinTimerIdsRef.current.push(id)}
  useEffect(()=>()=>{clearSpinTimers();spinLockedRef.current=false},[])
  function spin(){
    if(spinLockedRef.current)return
    spinLockedRef.current=true
    clearSpinTimers()
    primeRouletteAudio()
    if(result){
      const previousId=result.id
      setResult(undefined);setPhase("idle");setPickedIndex(null);setHighlightIndex(0)
      scheduleSpinTask(16,()=>spinInternal(previousId))
    }else{
      spinInternal()
    }
  }
  function spinInternal(previousId?:string){
    const runId=++spinRunIdRef.current
    let selectedResult:RouletteItem|undefined
    if(part===3&&lastPart2Group){selectedResult=pickPart3ForSession(part3SessionRef.current,previousId)}else{selectedResult=pickRoulette(visibleCards,previousId)}
    if(!selectedResult){spinLockedRef.current=false;return}
    let finalIndex=visibleCards.findIndex(card=>card.id===selectedResult!.id);if(finalIndex===-1)finalIndex=Math.floor(Math.random()*visibleCards.length)
    pendingResultRef.current=selectedResult
    const sequence=buildSpotlightSequence(visibleCards.length,finalIndex,MIN_SPOTLIGHT_TICKS)
    setPhase("lineup")
    scheduleSpinTask(LINEUP_DURATION_MS,()=>{
      if(spinRunIdRef.current!==runId)return
      setPhase("running")
      let cumulativeDelay=0
      sequence.forEach((seqIndex,tick)=>{
        const progress=sequence.length>1?tick/(sequence.length-1):1
        cumulativeDelay+=45+Math.pow(progress,2.2)*95
        scheduleSpinTask(cumulativeDelay,()=>{
          if(spinRunIdRef.current!==runId)return
          setHighlightIndex(seqIndex)
          if(tick%2===0)playTickSound()
          if(tick===sequence.length-1){
            setPhase("landed");setPickedIndex(finalIndex);playCardRevealSound()
            scheduleSpinTask(LANDED_DURATION_MS,()=>{
              if(spinRunIdRef.current!==runId)return
              setResult(pendingResultRef.current)
              if(part===2&&pendingResultRef.current){const grp=getPart2LinkedGroup(pendingResultRef.current.id);setLastPart2Group(grp);resetPart3Session(part3SessionRef.current,grp)}
              setRevealing(true);spinLockedRef.current=false
              scheduleSpinTask(500,()=>{if(spinRunIdRef.current!==runId)return;setRevealing(false)})
            })
          }
        })
      })
    })
  }
  function resetRoulette(){clearSpinTimers();spinLockedRef.current=false;setResult(undefined);setPhase("idle");setPickedIndex(null);setHighlightIndex(0)}
  return <main className="si-roulette"><Back/><header><small>SPEAKING ROULETTE</small><h1>Pick a card. Speak your mind.</h1></header><nav className="si-tabs">{([1,2,3] as const).map(p=><button key={p} className={part===p?'active':''} onClick={()=>{if(p!==part){setPart(p);resetRoulette()}}}>Part {p}<small>{p===1?' INTERVIEW':p===2?' CUE CARD':' DISCUSSION'}</small></button>)}</nav>{result?<section className={`si-result p${part}${revealing?' revealing':''}`} data-result-id={result.id}><small>YOUR QUESTION · PART {part}</small><h2>{result.prompt}</h2>{part===2&&(()=>{const prompts=getPart2Prompts(result.id);const closing=getPart2ClosingInstruction(result.id);return prompts?<div className="si-result-prompts"><p className="si-prompts-label">You should say:</p><ul>{prompts.map((p,i)=><li key={i}>{p}</li>)}</ul>{closing&&<p className="si-closing">{closing}</p>}</div>:null})()}{part===3&&lastPart2Group&&<p className="si-linked-group">Linked topic: {lastPart2Group}</p>}<div><button onClick={spin}><RotateCcw/> Quay câu khác</button><Link to={`mock-interview/${result.id}`}>Luyện ngay <Mic2/></Link></div></section>:<section className={`si-deck phase-${phase}`} data-phase={phase} aria-busy={phase!=="idle"}>{visibleCards.map((card,index)=>{const isHighlighted=(phase==="running"||phase==="landed")&&index===highlightIndex;const ratio=visibleCards.length<=1?0.5:index/(visibleCards.length-1);const lineLeft=8+ratio*84;const mobileLineLeft=16+ratio*68;return <button key={card.id} data-card-id={card.id} data-card-index={index} data-highlighted={isHighlighted} disabled={phase!=="idle"} aria-label={`Part ${part} topic: ${card.topic}`} style={{'--i':index,'--line-left':`${lineLeft}%`,'--line-left-mobile':`${mobileLineLeft}%`} as React.CSSProperties} className={isHighlighted?'is-highlighted':''} onClick={spin}><small>PART {part}</small><b>{phase==="running"||phase==="landed"?'?':card.topic}</b></button>})}</section>}<button className="si-spin" disabled={phase!=="idle"} onClick={spin}>{phase!=="idle"?'Đang tìm câu hỏi…':'SPIN THE DECK'}</button></main>
}
function ShadowCatalog(){const[q,setQ]=useState('');const filtered=lessons.filter(x=>x.title.toLowerCase().includes(q.toLowerCase()));return <main className="si-page"><Back/><header className="si-section-head"><small>30 VIDEO LESSONS</small><h1>Shadowing Studio</h1><p>Nghe, bắt chước và ghi âm từng câu.</p></header><label className="si-search"><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm bài học…"/></label><section className="si-lessons">{filtered.map((x,i)=><Link key={x.id} to={x.id} className="si-lesson"><div className="thumb">{x.thumbnailUrl?<img src={x.thumbnailUrl}/>:<Play/>}<span>{x.duration??`${Math.max(2,Math.ceil(x.segments.length/20))}:00`}</span></div><small>LESSON {String(i+1).padStart(2,'0')} · THE IELTS DICTIONARY</small><h2>{x.title}</h2><b>Luyện tập <ArrowRight/></b></Link>)}</section></main>}
function ShadowLesson({id}:{id:string}){const lesson=lessons.find(x=>x.id===id);const[segment,setSegment]=useState(0);const[playing,setPlaying]=useState(false);const[speed,setSpeed]=useState(1);const[completed,setCompleted]=useState(false);const utterance=useRef<SpeechSynthesisUtterance>();const recorder=useSpeakingRecorder();if(!lesson)return <main className="si-page"><Back label="Về Shadowing"/><p>Không tìm thấy bài học.</p></main>;const activeLesson=lesson;function play(){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(activeLesson.segments[segment]?.text??'');u.lang='en-US';u.rate=speed;u.onend=()=>setPlaying(false);utterance.current=u;speechSynthesis.speak(u);setPlaying(true)}return <main className="si-page"><Back label="Về Shadowing"/><section className="si-player"><small>SHADOWING LESSON · {segment+1}/{lesson.segments.length}</small><h1>{lesson.title}</h1>{lesson.videoUrl&&<iframe src={lesson.videoUrl.replace('watch?v=','embed/')} title={lesson.title} allowFullScreen/>}<div className="si-transcript"><span>#{segment+1}</span><p>{lesson.segments[segment]?.text??'Transcript chưa có.'}</p></div><div className="si-controls"><button disabled={segment===0} onClick={()=>setSegment(x=>x-1)}>Trước</button><button onClick={playing?()=>{speechSynthesis.cancel();setPlaying(false)}:play}>{playing?'Tạm dừng':'Phát'}</button><button onClick={play}>Nghe lại</button><select value={speed} onChange={e=>setSpeed(Number(e.target.value))}>{[.75,1,1.25,1.5].map(x=><option key={x} value={x}>{x}x</option>)}</select><button disabled={segment===lesson.segments.length-1} onClick={()=>setSegment(x=>x+1)}>Tiếp</button></div><div className="si-shadow-record"><button className={`si-primary ${recorder.state==='recording'?'recording':''}`} onClick={recorder.state==='recording'?recorder.stop:recorder.start}><Mic2/> {recorder.state==='recording'?`Dừng ghi âm · ${recorder.seconds}s`:'Ghi âm câu này'}</button>{recorder.audio&&<audio controls src={recorder.audio.url}/>} {recorder.error&&<p role="alert">{recorder.error}</p>}<button className="si-primary" disabled={!recorder.audio} onClick={()=>setCompleted(true)}>{completed?'Đã hoàn thành ✓':'Hoàn thành bài'}</button></div></section></main>}
function SampleCard({sample}:{sample:SpeakingSample}){return <article className="si-sample-card"><header><span className={`si-band band-${Math.floor(sample.bandScore)}`}>BAND {sample.bandScore}</span><small>PART {sample.part} · {sample.topic}</small></header><div className="si-sample-transcript">{sample.transcript}</div>{sample.vocabularyAnnotations.length>0&&<details className="si-sample-vocab"><summary>Vocabulary annotations ({sample.vocabularyAnnotations.length})</summary><ul>{sample.vocabularyAnnotations.map((v,i)=><li key={i}><b>{v.phrase}</b> — {v.explanation}</li>)}</ul></details>}<details className="si-sample-band"><summary>Band descriptors</summary><dl><dt>Fluency & Coherence</dt><dd>{sample.bandDescriptor.fluency}</dd><dt>Lexical Resource</dt><dd>{sample.bandDescriptor.lexicalResource}</dd><dt>Grammatical Range & Accuracy</dt><dd>{sample.bandDescriptor.grammar}</dd><dt>Pronunciation</dt><dd>{sample.bandDescriptor.pronunciation}</dd></dl></details><footer><small>Source: {sample.sourceLabel}</small></footer></article>}
function Samples(){const[part,setPart]=useState<1|2|3>(1);const partSamples=samplesByPart(part);return <main className="si-page samples-page"><Back/><header className="si-section-head"><small>SAMPLE SPEAKING</small><h1>Bài mẫu band cao</h1><p>Nội dung tại đây là đề xuất riêng của Ryan English và không phải dữ liệu crawl từ TID.</p></header>{hasSamples()?<><nav className="si-tabs">{([1,2,3] as const).map(p=><button key={p} className={part===p?'active':''} onClick={()=>setPart(p)}>Part {p}<small>{samplesByPart(p).length} mẫu</small></button>)}</nav><section className="si-samples-list">{partSamples.map(sample=><SampleCard key={sample.id} sample={sample}/>)}</section></>:<section className="si-coming-soon"><div className="sample-mini"><small>SAMPLE</small><b>8.0 SPEAKING</b></div><h1>Bài mẫu đang được chuẩn bị</h1><p>Mục bài mẫu sẽ có tối thiểu 1 bài Band 6-6.5 và 1 bài Band 8+ mỗi Part, kèm band descriptors và vocabulary annotations. Nguồn bài mẫu phải là sách IELTS chính thống, băng mẫu Cambridge hoặc tự thu âm.</p><div><Link className="si-primary" to={cardActions.premium}>Bắt đầu Mock Interview <ArrowRight/></Link><Link to={cardActions.forecast}>Xem Forecast</Link></div></section>}</main>}
export default function SpeakingIeltsPage(){const path=useLocation().pathname;const tail=path.split('/').pop()??'';if(path.includes('/mock-interview/')){const item=forecastItems.find(x=>x.id===tail)??practiceItems.find(x=>x.id===tail);const speakingContent=getSpeakingItem(tail);const speakingItem=speakingContent?(()=>{if(speakingContent.part===1){const bank=lookupPart1Questions(speakingContent.topic);return{id:speakingContent.id,part:1 as const,title:speakingContent.topic,bulletPoints:[],part3Questions:[],questions:bank?.questions,hints:bank?.hints,sampleAnswerStructure:bank?.sampleAnswerStructure,sourceUrl:'local-curated-speaking-pool'}as ForecastItem}if(speakingContent.part===2){return{id:speakingContent.id,part:2 as const,title:speakingContent.topic,bulletPoints:[...speakingContent.prompts],part3Questions:[],cueCard:speakingContent.cueCard,sourceUrl:'local-curated-speaking-pool'}as ForecastItem}return{id:speakingContent.id,part:3 as const,title:speakingContent.topic,bulletPoints:[],part3Questions:[],sourceUrl:'local-curated-speaking-pool'}as ForecastItem})():undefined;const rouletteMatch=tail.match(/^roulette-(1|2|3)-(\d+)$/);const rouletteItem=rouletteMatch?roulettePools[Number(rouletteMatch[1]) as 1|2|3][Number(rouletteMatch[2])]:undefined;const rouletteBank=rouletteItem&&rouletteItem.part===1?lookupPart1Questions(rouletteItem.topic):undefined;const selected:ForecastItem|undefined=speakingItem??(rouletteItem?{id:rouletteItem.id,part:rouletteItem.part,title:rouletteItem.topic,bulletPoints:[],part3Questions:[],questions:rouletteBank?.questions,hints:rouletteBank?.hints,sampleAnswerStructure:rouletteBank?.sampleAnswerStructure,sourceUrl:rouletteItem.sourceUrl}:item);return <SpeakingMockInterviewPage items={selected?[selected]:mockItems()} sessionId={tail}/>}if(path.endsWith('/forecast'))return <Forecast/>;if(path.endsWith('/roulette'))return <Roulette/>;if(path.endsWith('/samples'))return <Samples/>;if(path.endsWith('/shadowing'))return <ShadowCatalog/>;if(path.includes('/shadowing/'))return <ShadowLesson id={tail}/>;return <Landing/>}
