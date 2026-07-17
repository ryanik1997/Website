const fs = require('fs');
const t = fs.readFileSync(process.env.TEMP + '/parroto-js/_app-3a59d6ac27791f5b.js', 'utf8');
const start = t.indexOf('58102:function(e,t,n)');
const slice = t.slice(start, start + 23200);
// find let w= or w=[ or const w=
const markers = ['let w=', 'var w=', 'w=[', 'w=[[', 'let x=', 'var x={', 'x={}'];
for (const m of markers) {
  let i=0,c=0;
  while ((i=slice.indexOf(m,i))>=0 && c<8) {
    console.log(m, i, slice.slice(i, i+300).replace(/\n/g,' '));
    i+=m.length; c++;
  }
}
// Search backwards from _take for w definition
const ti = slice.indexOf('function _take');
console.log('\n=== before _take ===\n');
console.log(slice.slice(ti-2500, ti));
