const fs = require('fs');
const t = fs.readFileSync(process.env.TEMP + '/parroto-js/_app-3a59d6ac27791f5b.js', 'utf8');
const start = t.indexOf('58102:function(e,t,n)');
// Find end of this webpack module - look for pattern },XXXXX:function
const rest = t.slice(start);
const m = rest.match(/^58102:function[\s\S]*?\n?\},(\d+):function/);
// better: find "async function tA" within module
const iTA = t.indexOf('async function tA', start);
const iTB = t.indexOf('async function tB', start);
const iEnd = t.indexOf('},', start + 7000);
console.log({iTA, iTB, fromStart: iTA-start});
console.log(t.slice(iTA, iTA+1500));
console.log('==== tB ====');
console.log(t.slice(iTB, iTB+800));
// find how interceptors get token
const iAuth = t.indexOf('handleProtect');
console.log('==== around generate token call ====');
// search Authorization Bearer concat
let idx = 0, c=0;
while ((idx = t.indexOf('Authorization:"Bearer "', idx)) >= 0 && c < 5) {
  console.log(t.slice(idx-300, idx+200));
  idx += 10; c++;
}
