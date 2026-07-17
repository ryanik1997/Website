const fs = require('fs');
const crypto = require('crypto');

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
}

const pad = crypto.createHash('sha256').update('parroto.kr.2026.salt.v1').digest();
function mix(parts, hostOk=true) {
  const o = Buffer.concat(parts.map(p => Buffer.from(p)));
  const l = hostOk ? 0 : 255;
  const c = Buffer.alloc(o.length);
  for (let i=0;i<o.length;i++) c[i] = o[i] ^ pad[i % pad.length] ^ l;
  return c; // raw bytes used as HMAC key
}

const parts = {
  l: Buffer.from('94F/OPbd+v+Eluc=', 'base64'),
  c: Buffer.from('hacWAys8nOO+eEQ=', 'base64'),
  u: Buffer.from('Kmk1ZkjpU61Rqqw=', 'base64'),
  d: Buffer.from('lVZvtPG76pLOn8o=', 'base64'),
  f: Buffer.from('g7FxP73G576p98Q=', 'base64'),
  p: Buffer.from('udULHSJKmezYaVk=', 'base64'),
  h: Buffer.from('fBosFmqeeYtlpPA=', 'base64'),
  m: Buffer.from('v2Fq9ui+1NjzxMo=', 'base64'),
};
const secret = mix([parts.l, parts.c, parts.u, parts.d], true);

function makeToken(secretBuf, extra={}, ttl=60) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { platform: 'web', exp: Math.floor(Date.now()/1000)+ttl, ...extra };
  const h = b64url(JSON.stringify(header));
  const p = b64url(JSON.stringify(payload));
  const data = h+'.'+p;
  const sig = crypto.createHmac('sha256', secretBuf).update(data).digest();
  return data+'.'+b64url(sig);
}

const token = makeToken(secret);
console.log('token', token);

// Test API
const url = 'https://api.parroto.app/api/lessons?limit=2&sort_by=order&topic_slug=movie-short-clip&page=1';
fetch(url, {
  headers: {
    Authorization: 'Bearer '+token,
    Accept: 'application/json',
    Origin: 'https://parroto.app',
    Referer: 'https://parroto.app/',
    'X-User-Timezone': 'Asia/Bangkok',
  }
}).then(async r => {
  console.log('status', r.status);
  const j = await r.json();
  console.log(JSON.stringify(j).slice(0,500));
}).catch(e => console.error(e));
