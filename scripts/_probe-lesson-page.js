const fs = require('fs');
const t = fs.readFileSync(process.env.TEMP + '/parroto-js/%5BlessonSlug%5D-094da55ab9368275.js', 'utf8');
for (const n of ['payload', 'decrypt', 'tB', 'encrypted', 'sentences', 'youtube', 'video_url', 'transcript', 'getServerSide', 'AES']) {
  let i=0,c=0;
  while ((i=t.indexOf(n,i))>=0 && c<4) {
    console.log('---', n, i);
    console.log(t.slice(Math.max(0,i-80), i+150).replace(/\n/g,' '));
    i+=n.length; c++;
  }
}
