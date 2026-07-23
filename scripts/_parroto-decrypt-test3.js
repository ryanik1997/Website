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
const B = ['g7FxP73G576p98Q=','udULHSJKmezYaVk=','fBosFmqeeYtlpPA=','v2Fq9ui+1NjzxMo='].map(b=>Buffer.from(b,'base64'));
const C = ['sr9Zdd2Zicmv3+U=','vf9XDVwKka65WHg=','GyhhSVLqZpZD/o8=','gXAXxtmzvMvB/so='].map(b=>Buffer.from(b,'base64'));

const raw = Buffer.from(JSON.parse(fs.readFileSync('D:/App-English-Ryan/Website/scripts/_parroto-lesson-ssr.network-response','utf8').replace(/^[^{]*/,'')).pageProps.payload, 'base64');
// fix parse
const j = JSON.parse(fs.readFileSync('D:/App-English-Ryan/Website/scripts/_parroto-lesson-ssr.network-response','utf8').slice(
  fs.readFileSync('D:/App-English-Ryan/Website/scripts/_parroto-lesson-ssr.network-response','utf8').indexOf('{')
));
const raw2 = Buffer.from(j.pageProps.payload, 'base64');
const iv = raw2.slice(0,12);
const data = raw2.slice(12);
const tag = data.slice(-16);
const enc = data.slice(0,-16);

function tryKey(label, keyBuf) {
  for (const [name, k] of [['full', keyBuf], ['b64dec', (()=>{try{return Buffer.from(keyBuf.toString('utf8'),'base64')}catch{return null}})(), ['raw32', keyBuf.slice(0,32)], ['raw16', keyBuf.slice(0,16)]]) {
    if (!k || (k.length!==16 && k.length!==24 && k.length!==32)) continue;
    try {
      const decipher = crypto.createDecipheriv('aes-'+(k.length*8)+'-gcm', k, iv);
      decipher.setAuthTag(tag);
      const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
      console.log('OK', label, name, dec.toString('utf8').slice(0,200));
      return true;
    } catch(e) {}
  }
  return false;
}

for (const host of [true, false]) {
  for (const [name, parts] of [['A',A],['B',B],['C',C]]) {
    const m = mix(parts, host);
    console.log(name, 'host', host, 'mixutf', m.toString('utf8').slice(0,50));
    tryKey(name+host, m);
    // also use mix as raw key via char codes meaning itself
  }
}

// try key = sha256 of salt only
tryKey('sha256salt', pad);
// try raw secret bytes concat without mix
tryKey('concatB', Buffer.concat(B));
