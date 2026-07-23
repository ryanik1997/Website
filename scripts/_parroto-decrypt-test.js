const crypto = require('crypto');
const pad = crypto.createHash('sha256').update('parroto.kr.2026.salt.v1').digest();
function mix(parts, hostOk=true) {
  const o = Buffer.concat(parts.map(p => Buffer.from(p)));
  const l = hostOk ? 0 : 255;
  const c = Buffer.alloc(o.length);
  for (let i=0;i<o.length;i++) c[i] = o[i] ^ pad[i % pad.length] ^ l;
  return c;
}
const partsA = ['94F/OPbd+v+Eluc=','hacWAys8nOO+eEQ=','Kmk1ZkjpU61Rqqw=','lVZvtPG76pLOn8o='].map(b=>Buffer.from(b,'base64'));
const partsB = ['g7FxP73G576p98Q=','udULHSJKmezYaVk=','fBosFmqeeYtlpPA=','v2Fq9ui+1NjzxMo='].map(b=>Buffer.from(b,'base64'));
console.log('A lens', partsA.map(p=>p.length), 'mixA', mix(partsA).length);
console.log('B lens', partsB.map(p=>p.length), 'mixB', mix(partsB).length);
console.log('mixB hex', mix(partsB).toString('hex'));
console.log('mixB b64', mix(partsB).toString('base64'));
// try decrypt
const fs = require('fs');
const t = fs.readFileSync('D:/App-English-Ryan/Website/scripts/_parroto-lesson-ssr.network-response','utf8');
const j = JSON.parse(t.slice(t.indexOf('{')));
const payload = j.pageProps.payload;
const raw = Buffer.from(payload, 'base64');
console.log('payload raw', raw.length, 'iv', raw.slice(0,12).toString('hex'));
const iv = raw.slice(0,12);
const data = raw.slice(12);
const key = mix(partsB);
// try full key, first 16, 24, 32
for (const n of [16,24,32, key.length]) {
  try {
    const k = key.slice(0,n);
    // AES-GCM tag is last 16 bytes in node
    const decipher = crypto.createDecipheriv('aes-'+ (n*8) +'-gcm', k, iv);
    const tag = data.slice(data.length-16);
    const enc = data.slice(0, data.length-16);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
    console.log('SUCCESS n', n, dec.toString('utf8').slice(0,300));
  } catch(e) {
    console.log('fail n', n, e.message);
  }
}
// also try hostOk false
const key2 = mix(partsB, false);
for (const n of [16,24,32]) {
  try {
    const k = key2.slice(0,n);
    const decipher = crypto.createDecipheriv('aes-'+(n*8)+'-gcm', k, iv);
    const tag = data.slice(data.length-16);
    const enc = data.slice(0, data.length-16);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
    console.log('SUCCESS2 n', n, dec.toString('utf8').slice(0,200));
  } catch(e) {
    console.log('fail2 n', n, e.message.slice(0,40));
  }
}
