const fs = require('fs');
const t = fs.readFileSync(process.env.TEMP + '/parroto-js/_app-3a59d6ac27791f5b.js', 'utf8');
console.log(t.slice(594900, 596200));
// also find x.tA definition exports
const idx = t.indexOf('tA:function');
console.log('--- more ---');
console.log(t.slice(idx, idx+800));
// find all tA:function
let i=0,c=0;
while ((i=t.indexOf('tA:function', i))>=0 && c<8) {
  console.log('\n###', i);
  console.log(t.slice(i, i+500));
  i+=11; c++;
}
// deobfuscate _0x1b62 array
const arrMatch = t.match(/_0x1b62\s*=\s*_0x[a-f0-9]+|const _0x[a-f0-9]+=\[/);
console.log('arrMatch', arrMatch && arrMatch[0]);
// Find the string array for the obfuscator near handleProtect
const hp = t.indexOf('async function handleProtect');
console.log('handleProtect', hp);
// Look for function that defines _0x1b62 nearby
const before = t.slice(hp-5000, hp);
const am = before.match(/_0x[a-f0-9]{4,6}\s*=\s*\[/);
console.log('array near', am && am[0], am && am.index);
