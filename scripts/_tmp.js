const fs = require('fs');
const dir = process.env.TEMP + '/parroto-js';
// download more page chunks for lessons
const https = require('https');
const chunks = [
  'https://parroto.app/_next/static/chunks/pages/lessons/shadowing/%5BlessonSlug%5D-*.js'
];
// list page-specific from HTML
const html = fs.readFileSync('D:/App-English-Ryan/Website/scripts/_parroto-next-data.json','utf8');
