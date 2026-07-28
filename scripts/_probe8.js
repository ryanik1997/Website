const fs = require('fs');
const t = fs.readFileSync(process.env.TEMP + '/parroto-js/_app-3a59d6ac27791f5b.js', 'utf8');
const start = t.indexOf('58102:function(e,t,n)');
const slice = t.slice(start, start + 24000);
// find _take and exports
for (const p of ['_take', 'async function tA', 'function tA', 'tA=async', 'tB=async', 'async function tB', 'return mix', 'exports']) {
  let i=0,c=0;
  while ((i=slice.indexOf(p,i))>=0 && c<5) {
    console.log(p, i, slice.slice(i, i+200).replace(/\n/g,' '));
    i+=p.length; c++;
  }
}
// Print from _take
const ti = slice.indexOf('function _take');
console.log('\n=== _take region ===\n');
console.log(slice.slice(ti, ti+2500));
