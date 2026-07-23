const fs = require('fs');
const crypto = require('crypto');
const t = fs.readFileSync(process.env.TEMP + '/parroto-js/_app-3a59d6ac27791f5b.js', 'utf8');
const start = t.indexOf('58102:function(e,t,n)');
const slice = t.slice(start, start + 23200);
const b64s = [...slice.matchAll(/_d\("([^"]+)"\)/g)].map(m => m[1]);
console.log('all _d', b64s);
function _d(e) {
  if (!e) return new Uint8Array();
  const n = Buffer.from(e, 'base64');
  return new Uint8Array(n);
}
for (const b of b64s) {
  const u = _d(b);
  console.log(b, '->', Buffer.from(u).toString('utf8'), 'hex', Buffer.from(u).toString('hex'));
}
// Also find assignments let l= _d, etc
const assigns = [...slice.matchAll(/let ([a-z])=_d\("([^"]+)"\)/g)];
console.log('assigns', assigns.map(a => a[1]+'='+a[2]));
