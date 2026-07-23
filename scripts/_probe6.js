const fs = require('fs');
const t = fs.readFileSync(process.env.TEMP + '/parroto-js/_app-3a59d6ac27791f5b.js', 'utf8');
const start = t.indexOf('58102:function(e,t,n)');
// Find next module id after a reasonable size
const slice = t.slice(start, start + 20000);
// find function tA= or ,tA= or async function mix then tA
const patterns = ['function tA', 'tA=async', 'async function tA', ',tA=', 'tA=function', 'let tA', 'const tA'];
for (const p of patterns) {
  const i = slice.indexOf(p);
  if (i>=0) console.log(p, i);
}
// search for "return await mix" or "return mix"
let i = 0, c=0;
while ((i = slice.indexOf('mix(', i))>=0 && c<15) {
  console.log('mix at', i, slice.slice(i-50, i+120).replace(/\n/g,' '));
  i+=4; c++;
}
// dump last part of module - find "},NEXT"
const endMatch = slice.match(/\},(\d{4,5}):function/);
console.log('next module', endMatch && endMatch[0], endMatch && endMatch.index);
if (endMatch) {
  console.log(slice.slice(endMatch.index - 2000, endMatch.index));
}
