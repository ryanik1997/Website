const fs = require('fs');
const t = fs.readFileSync(process.env.TEMP + '/parroto-js/_app-3a59d6ac27791f5b.js', 'utf8');
// Extract module 58102 completely
const start = t.indexOf('58102:function(e,t,n)');
const end = t.indexOf('},', start + 5000); // might be wrong
// find next module after 58102
let depth = 0, i = start;
// simpler: take large chunk
const chunk = t.slice(start, start + 8000);
console.log(chunk.slice(0, 7500));
fs.writeFileSync('D:/App-English-Ryan/Website/scripts/_parroto-mod58102.js', chunk);
