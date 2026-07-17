const fs = require('fs');
const path = require('path');
const srcRoot = 'C:/Users/ADMIN/mcps/ai-website-cloner-template-master/ai-website-cloner-template-master/src';
const dest = 'D:/App-English-Ryan/Website/apps/web/src/features/exam/tidIeltsReading';
fs.mkdirSync(dest, { recursive: true });
fs.copyFileSync(path.join(srcRoot, 'types/reading.ts'), path.join(dest, 'types.ts'));
fs.copyFileSync(path.join(srcRoot, 'lib/reading-format.ts'), path.join(dest, 'format.ts'));
fs.copyFileSync(path.join(srcRoot, 'lib/reading-html.ts'), path.join(dest, 'html.ts'));

let exam = fs.readFileSync(path.join(srcRoot, 'components/reading/ReadingExam.tsx'), 'utf8');
exam = exam.replace(/^"use client";\r?\n/, '');
exam = exam.replace(/import Link from "next\/link";\r?\n/, "import { Link } from 'react-router-dom'\n");
exam = exam.replace(/import Image from "next\/image";\r?\n/, '');
exam = exam.replace(/from "@\/types\/reading"/g, "from './types'");
exam = exam.replace(/from "@\/lib\/reading-html"/g, "from './html'");
exam = exam.replace(/from "@\/lib\/reading-format"/g, "from './format'");
exam = exam.replace(/from "@\/lib\/utils"/g, "from './cn'");
// Image -> img
exam = exam.replace(/<Image[\s\S]*?\/>/g, '<img src="/favicon.svg" alt="Logo" className="h-9 w-9 rounded-lg object-cover border border-slate-100 shadow-sm" />');
// props
exam = exam.replace(
  /export function ReadingExam\(\{ test \}: \{ test: ReadingTest \}\)/,
  "export function ReadingExam({ test, backTo = '/app/exam/track/ielts' }: { test: ReadingTest; backTo?: string })"
);
// Link href for logo
exam = exam.replace(
  /<Link\s*\n\s*href="\/practice\/reading"/,
  "<Link\n          to={backTo}"
);
exam = exam.replace(/href="\/practice\/reading"/g, 'to={backTo}');
exam = exam.replace(/<Link([^>]*)\shref=/g, '<Link$1 to=');

fs.writeFileSync(path.join(dest, 'TidIeltsReadingExam.tsx'), exam);
fs.writeFileSync(path.join(dest, 'cn.ts'), "import { clsx, type ClassValue } from 'clsx'\nimport { twMerge } from 'tailwind-merge'\n\nexport function cn(...inputs: ClassValue[]) {\n  return twMerge(clsx(inputs))\n}\n");
console.log('ok', fs.readdirSync(dest).filter(f=>!f.startsWith('data')));
// check remaining next imports
const t = fs.readFileSync(path.join(dest, 'TidIeltsReadingExam.tsx'), 'utf8');
console.log('next leftovers', (t.match(/next\//g)||[]).length);
console.log('Link sample', (t.match(/<Link[^>]+>/g)||[]).slice(0,3));
