import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const TASKS_PATH = 'apps/web/public/catalog/writing/tid/tasks.json';

console.log('=== IELTS Writing Source Audit ===\n');

// 1. Check if tasks.json exists
if (!fs.existsSync(TASKS_PATH)) {
  console.log('ERROR: tasks.json not found at', TASKS_PATH);
  console.log('Searching for tasks.json in other locations...');
  const publicDir = 'apps/web/public';
  function findFile(dir, name) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        const found = findFile(fullPath, name);
        if (found) return found;
      } else if (item.name === name) {
        return fullPath;
      }
    }
    return null;
  }
  const found = findFile(publicDir, 'tasks.json');
  if (found) {
    console.log('Found tasks.json at:', found);
  } else {
    console.log('tasks.json not found anywhere in public/');
    process.exit(1);
  }
} else {
  console.log('tasks.json found at:', TASKS_PATH);
}

// 2. Load and parse tasks.json
const raw = fs.readFileSync(TASKS_PATH, 'utf8');
const tasks = JSON.parse(raw);

console.log('\n=== Task Count ===');
console.log('Total tasks:', tasks.length);

// 3. Task type breakdown
const task1Count = tasks.filter(t => t.taskType === 'task1').length;
const task2Count = tasks.filter(t => t.taskType === 'task2').length;
console.log('Task 1:', task1Count);
console.log('Task 2:', task2Count);

// 4. Image references
const tasksWithImage = tasks.filter(t => t.image !== null && t.image !== undefined && t.image !== '');
const tasksWithoutImage = tasks.filter(t => t.image === null || t.image === undefined || t.image === '');
console.log('\n=== Image References ===');
console.log('Tasks with image:', tasksWithImage.length);
console.log('Tasks without image:', tasksWithoutImage.length);
console.log('Total image references:', tasksWithImage.length);

// 5. Unique image paths
const imagePaths = tasksWithImage.map(t => t.image);
const uniqueImagePaths = [...new Set(imagePaths)];
console.log('Unique image paths:', uniqueImagePaths.length);

// 6. Check if image files exist
let imagesExist = 0;
let imagesMissing = 0;
const missingImages = [];
for (const imgPath of uniqueImagePaths) {
  const fullPath = path.join('apps/web/public', imgPath.replace(/^\//, ''));
  if (fs.existsSync(fullPath)) {
    imagesExist++;
  } else {
    imagesMissing++;
    missingImages.push(imgPath);
  }
}
console.log('Images that exist on disk:', imagesExist);
console.log('Images missing from disk:', imagesMissing);
if (missingImages.length > 0) {
  console.log('Missing image paths (first 10):');
  missingImages.slice(0, 10).forEach(p => console.log('  ', p));
}

// 7. Unique IDs
const ids = tasks.map(t => t.id);
const uniqueIds = new Set(ids);
console.log('\n=== ID Validation ===');
console.log('Total IDs:', ids.length);
console.log('Unique IDs:', uniqueIds.size);
console.log('Duplicate IDs:', ids.length - uniqueIds.size);
if (ids.length !== uniqueIds.size) {
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  console.log('Duplicate ID values:', [...new Set(dupes)]);
}

// 8. Genre breakdown
const genreCount = {};
for (const task of tasks) {
  genreCount[task.genre] = (genreCount[task.genre] || 0) + 1;
}
console.log('\n=== Genre Breakdown ===');
for (const [genre, count] of Object.entries(genreCount)) {
  console.log(`  ${genre}: ${count}`);
}

// 9. Check for secrets
const secretFields = ['apiKey', 'api_key', 'secret', 'password', 'token', 'serviceRole', 'service_role'];
let secretHits = 0;
const taskStr = JSON.stringify(tasks);
for (const field of secretFields) {
  if (taskStr.toLowerCase().includes(field.toLowerCase())) {
    console.log(`\nWARNING: Found potential secret field '${field}' in tasks.json`);
    secretHits++;
  }
}
if (secretHits === 0) {
  console.log('\n=== Secret Scan ===');
  console.log('No secret fields found in tasks.json');
}

// 10. Check for Windows paths
const windowsPaths = tasks.filter(t => t.image && t.image.includes('\\'));
console.log('\n=== Path Validation ===');
console.log('Tasks with Windows-style image paths:', windowsPaths.length);

// 11. Check for absolute paths
const absolutePaths = tasks.filter(t => t.image && (t.image.startsWith('C:') || t.image.startsWith('D:') || t.image.startsWith('/Users/') || t.image.startsWith('/home/')));
console.log('Tasks with absolute image paths:', absolutePaths.length);

// 12. File size
const stats = fs.statSync(TASKS_PATH);
console.log('\n=== File Info ===');
console.log('File size:', (stats.size / 1024).toFixed(2), 'KB');
console.log('SHA-256:', crypto.createHash('sha256').update(raw).digest('hex'));

// 13. Sample task
console.log('\n=== Sample Task (first) ===');
console.log(JSON.stringify(tasks[0], null, 2).substring(0, 500));
console.log('\n=== Sample Task (last) ===');
console.log(JSON.stringify(tasks[tasks.length - 1], null, 2).substring(0, 500));