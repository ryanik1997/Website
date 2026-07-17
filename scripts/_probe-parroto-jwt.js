const fs = require('fs');
const t = fs.readFileSync(process.env.TEMP + '/parroto-js/_app-3a59d6ac27791f5b.js', 'utf8');

// Find region around Token generation
const i = t.indexOf('Token ');
console.log('Token mentions', (t.match(/Token /g)||[]).length);

// Find generateGuestToken-like by looking for platform web JWT
const re = /platform:"web"/g;
let m, c=0;
while ((m = re.exec(t)) && c < 5) {
  console.log('--- platform:web at', m.index);
  console.log(t.slice(m.index - 400, m.index + 200));
  c++;
}

// Find string "web" near SignJWT payload
const i2 = t.indexOf('BUMct="web"');
console.log('BUMct', i2);
console.log(t.slice(i2 - 800, i2 + 400));

// Find tA function that provides secret
const taMatches = [...t.matchAll(/tA\s*[:=]\s*function|function tA|\.tA\s*=|tA:function/g)].slice(0,10);
console.log('tA matches', taMatches.map(x => x.index + ':' + x[0]));

// Search for NEXT_PUBLIC secrets in all js files
const dir = process.env.TEMP + '/parroto-js';
for (const f of fs.readdirSync(dir)) {
  const s = fs.readFileSync(dir + '/' + f, 'utf8');
  if (s.includes('JWT') || s.includes('secret') || s.includes('importKey')) {
    const hits = [];
    for (const n of ['JWT_SECRET', 'TOKEN_KEY', 'HMAC', 'parroto', 'process.env']) {
      if (s.includes(n)) hits.push(n);
    }
    if (hits.length) console.log(f, hits.join(','));
  }
}
