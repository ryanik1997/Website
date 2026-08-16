// sync-inline-db.mjs — đồng bộ database.json + packaging-db.json vào index.html
// cho chế độ offline (file://). Chạy: node sync-inline-db.mjs
// LUÔN chạy script này sau mỗi lần sửa database.json / packaging-db.json,
// nếu không bản offline sẽ dùng dữ liệu cũ.
import fs from 'node:fs';

const pairs = [
  { jsonFile: 'database.json', scriptId: 'db-inline' },
  { jsonFile: 'packaging-db.json', scriptId: 'pkgdb-inline' },
];

let html = fs.readFileSync('index.html', 'utf8');
for (const { jsonFile, scriptId } of pairs) {
  const raw = fs.readFileSync(jsonFile, 'utf8');
  // xác minh JSON hợp lệ trước khi nhúng
  JSON.parse(raw);
  const re = new RegExp(`<script type="application/json" id="${scriptId}">[\\s\\S]*?</script>`);
  const block = `<script type="application/json" id="${scriptId}">\n${raw.trimEnd()}\n</script>`;
  if (re.test(html)) html = html.replace(re, block);
  else {
    // lần chạy đầu: chèn trước các <script src>
    html = html.replace('<script src="engine.js"></script>', block + '\n<script src="engine.js"></script>');
  }
  console.log(`Đã đồng bộ ${jsonFile} → #${scriptId}.`);
}
fs.writeFileSync('index.html', html);
console.log('Xong. index.html mới:', (fs.statSync('index.html').size / 1024).toFixed(1), 'KB');
