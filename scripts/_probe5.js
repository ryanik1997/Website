const fs = require('fs');
const t = fs.readFileSync(process.env.TEMP + '/parroto-js/_app-3a59d6ac27791f5b.js', 'utf8');
const marker = 'interceptors.request.use';
let i = t.indexOf(marker);
console.log('interceptor at', i);
console.log(t.slice(i, i+2500));
// also search handleProtect calls
i = 0; let c=0;
while ((i = t.indexOf('handleProtect', i))>=0 && c<10) {
  console.log('\n--- handleProtect', i, t.slice(i-80, i+120));
  i+=12; c++;
}
// search for generateToken / getPlatformToken
for (const n of ['generateToken', 'getPlatformToken', 'createToken', 'platformToken', 'guestToken', 'getAuthToken']) {
  if (t.includes(n)) console.log('found', n, t.indexOf(n));
}
