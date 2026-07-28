const crypto = require('crypto');
const fs = require('fs');
const pad = crypto.createHash('sha256').update('parroto.kr.2026.salt.v1').digest();
function mix(parts, hostOk=true) {
  const o = Buffer.concat(parts.map(p => Buffer.from(p)));
  const l = hostOk ? 0 : 255;
  const c = Buffer.alloc(o.length);
  for (let i=0;i<o.length;i++) c[i] = o[i] ^ pad[i % pad.length] ^ l;
  return c;
}
const A = ['94F/OPbd+v+Eluc=','hacWAys8nOO+eEQ=','Kmk1ZkjpU61Rqqw=','lVZvtPG76pLOn8o='].map(b=>Buffer.from(b,'base64'));
const mixStr = mix(A, true).toString('utf8');
console.log('mixA', mixStr);
const key = Buffer.from(mixStr, 'base64');
console.log('key len', key.length, key.toString('hex'));

const j = JSON.parse(fs.readFileSync('D:/App-English-Ryan/Website/scripts/_parroto-lesson-ssr.network-response','utf8').replace(/^[^{]+/, match => {
  // keep from first {
  return '';
}).replace(/^[^{]*/, ''));
// simpler
const rawText = fs.readFileSync('D:/App-English-Ryan/Website/scripts/_parroto-lesson-ssr.network-response','utf8');
const jj = JSON.parse(rawText.slice(rawText.indexOf('{')));
const raw = Buffer.from(jj.pageProps.payload, 'base64');
const iv = raw.slice(0,12);
const data = raw.slice(12);
const tag = data.slice(-16);
const enc = data.slice(0,-16);
try {
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  console.log('SUCCESS', dec.toString('utf8').slice(0,2000));
  fs.writeFileSync('D:/App-English-Ryan/Website/scripts/_parroto-lesson-decrypted.json', dec.toString('utf8'));
} catch(e) {
  console.log('fail', e.message);
}
