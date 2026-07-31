for (const n of [14,15,16,17,18,19,30,36,37,38,39,40,51]){
  const obj=(await import(`../../scripts/reading/pet-b1/blueprints/test-${n}.mjs`)).default
  const mode=obj.part1?.cards?'compileExam':'compileExamSimple'
  console.log(`test-${n} mode=${mode} p5.title=${JSON.stringify(obj.part5?.title)} p6.title=${JSON.stringify(obj.part6?.title)} p4.title=${JSON.stringify(obj.part4?.title)?.slice(0,40)}`)
}
