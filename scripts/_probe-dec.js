const fs = require('fs');
const t = fs.readFileSync(process.env.TEMP + '/parroto-js/_app-3a59d6ac27791f5b.js', 'utf8');
const i = t.indexOf('async function decryptData');
console.log('idx', i);
console.log(t.slice(i, i+3000));
// also search decryptData= 
const i2 = t.indexOf('function decryptData');
console.log('i2', i2, t.slice(i2, i2+2000));
