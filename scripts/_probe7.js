const fs = require('fs');
const t = fs.readFileSync(process.env.TEMP + '/parroto-js/_app-3a59d6ac27791f5b.js', 'utf8');
const start = t.indexOf('58102:function(e,t,n)');
// Take 50k
const slice = t.slice(start, start + 50000);
const endMatch = [...slice.matchAll(/\},(\d{4,5}):function/g)].slice(0,5);
console.log(endMatch.map(m => [m[1], m.index]));
// find tA assignment near end of interesting code
const idx = slice.lastIndexOf('async function');
console.log('last async', idx, slice.slice(idx, idx+400));
// all async function names in module
const asyncs = [...slice.matchAll(/async function ([a-zA-Z0-9_]+)/g)].map(m => m[1]);
console.log('asyncs', asyncs);
const funcs = [...slice.matchAll(/function ([a-zA-Z0-9_]+)\(/g)].map(m => m[1]);
console.log('funcs unique', [...new Set(funcs)]);
// Look for tA= 
const ta = [...slice.matchAll(/tA\s*=\s*async|async\s*\(\)\s*=>\s*\{[^}]*mix/g)];
console.log('ta patterns', ta.length);
// Print from mix to 3000 chars after
const mixi = slice.indexOf('async function mix');
console.log(slice.slice(mixi, mixi+3500));
