const fs = require('fs');
const t = fs.readFileSync(process.env.TEMP + '/parroto-js/%5BlessonSlug%5D-094da55ab9368275.js', 'utf8');
const i = t.indexOf('ShadowingLessonDetailComponent');
console.log(t.slice(i, i+800));
