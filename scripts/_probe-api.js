const fs = require('fs');
const dir = process.env.TEMP + '/parroto-js';
const files = fs.readdirSync(dir);
const needles = ['/lessons/', 'transcript', 'subtitle', 'sentences', 'segments', 'youtube', 'video_id', 'getLesson', 'lesson_detail', 'shadowing'];
for (const f of files) {
  const t = fs.readFileSync(dir+'/'+f, 'utf8');
  for (const n of needles) {
    let i=0,c=0;
    while ((i=t.indexOf(n,i))>=0 && c<2) {
      if (n==='youtube' || n==='subtitle') { /* skip noise */ }
      const snip = t.slice(Math.max(0,i-60), i+100).replace(/\n/g,' ');
      if (/api|get\(|fetch|\.get|\/lessons/.test(snip) || n.includes('lesson') || n==='transcript' || n==='sentences' || n==='segments') {
        console.log(f, n, snip);
      }
      i+=n.length; c++;
    }
  }
}
// specifically search get("/lessons
for (const f of files) {
  const t = fs.readFileSync(dir+'/'+f, 'utf8');
  let i=0,c=0;
  while ((i=t.indexOf('/lessons', i))>=0 && c<20) {
    console.log('PATH', f, t.slice(i, i+80));
    i+=8; c++;
  }
}
