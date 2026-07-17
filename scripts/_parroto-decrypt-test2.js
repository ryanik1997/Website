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
const partsB = ['g7FxP73G576p98Q=','udULHSJKmezYaVk=','fBosFmqeeYtlpPA=','v2Fq9ui+1NjzxMo='].map(b=>Buffer.from(b,'base64'));
const mixStr = mix(partsB).toString('utf8');
console.log('mixStr', mixStr);
const key = Buffer.from(mixStr, 'base64');
console.log('key len', key.length, key.toString('hex'));

const t = fs.readFileSync('D:/App-English-Ryan/Website/scripts/_parroto-lesson-ssr.network-response','utf8');
const j = JSON.parse(t.slice(t.indexOf('{')));
const raw = Buffer.from(j.pageProps.payload, 'base64');
const iv = raw.slice(0,12);
const data = raw.slice(12);
const tag = data.slice(data.length-16);
const enc = data.slice(0, data.length-16);
try {
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  const text = dec.toString('utf8');
  console.log('SUCCESS', text.slice(0,1500));
  fs.writeFileSync('D:/App-English-Ryan/Website/scripts/_parroto-lesson-decrypted.json', text);
} catch(e) {
  console.log('fail', e.message);
  // try 128
  try {
    const k16 = key.slice(0,16);
    const decipher = crypto.createDecipheriv('aes-128-gcm', k16, iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
    console.log('SUCCESS128', dec.toString('utf8').slice(0,500));
  } catch(e2) { console.log('fail128', e2.message); }
}
