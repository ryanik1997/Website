const crypto = require('crypto');
function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
}
const pad = crypto.createHash('sha256').update('parroto.kr.2026.salt.v1').digest();
function mix(parts) {
  const o = Buffer.concat(parts.map(p => Buffer.from(p)));
  const c = Buffer.alloc(o.length);
  for (let i=0;i<o.length;i++) c[i] = o[i] ^ pad[i % pad.length];
  return c;
}
const secret = mix([
  Buffer.from('94F/OPbd+v+Eluc=', 'base64'),
  Buffer.from('hacWAys8nOO+eEQ=', 'base64'),
  Buffer.from('Kmk1ZkjpU61Rqqw=', 'base64'),
  Buffer.from('lVZvtPG76pLOn8o=', 'base64'),
]);
function makeToken(ttl=300) {
  const h = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const p = b64url(JSON.stringify({ platform: 'web', exp: Math.floor(Date.now()/1000)+ttl }));
  const data = h+'.'+p;
  return data+'.'+b64url(crypto.createHmac('sha256', secret).update(data).digest());
}
async function main() {
  const token = makeToken();
  const headers = {
    Authorization: 'Bearer '+token,
    Accept: 'application/json',
    Origin: 'https://parroto.app',
    Referer: 'https://parroto.app/',
    'X-User-Timezone': 'Asia/Bangkok',
  };
  const lr = await fetch('https://api.parroto.app/api/lessons?limit=1&sort_by=order&topic_slug=movie-short-clip&page=1', {headers});
  const lj = await lr.json();
  const lesson = lj.data.data.lessons[0];
  console.log('lesson', lesson._id, lesson.slug);
  const id = lesson._id;
  const s = lesson.slug;
  const urls = [
    `https://api.parroto.app/api/lessons/${id}`,
    `https://api.parroto.app/api/lessons/${s}`,
    `https://api.parroto.app/api/lessons/${id}/sentences`,
    `https://api.parroto.app/api/sentences?lesson_id=${id}`,
    `https://api.parroto.app/api/lessons/${id}/detail`,
    `https://api.parroto.app/api/dictation/${s}`,
    `https://api.parroto.app/api/shadowing/${s}`,
    `https://api.parroto.app/api/lessons/shadowing/${s}`,
  ];
  for (const u of urls) {
    try {
      const r = await fetch(u, { headers });
      const text = await r.text();
      console.log(r.status, u.replace('https://api.parroto.app',''), text.slice(0,180).replace(/\n/g,' '));
    } catch(e) { console.log('ERR', u, e.message); }
  }
}
main();
