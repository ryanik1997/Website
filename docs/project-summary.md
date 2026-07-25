# Ryan English Website — Project Summary

## Overview
Monorepo (pnpm workspace) — 6 packages:
- `apps/web/` — Vite + React app (english learning platform)
- `packages/core/` — Pure TS logic (SRS scheduler, license plans)
- `packages/db/` — Dexie schema (14 tables) + Supabase sync
- `packages/ui/` — Shared components (Button, Card)
- `packages/catalog/` — Exam data (IELTS, Cambridge, KET...)
- `packages/server/` — Backend (STT Whisper, TTS Kokoro)

## Tech Stack
- Frontend: React 18, TypeScript, Vite, Tailwind CSS
- Storage: Dexie (IndexedDB) local-first + Supabase sync
- Auth: Supabase (Google OAuth)
- Media: Cloudflare R2 (audio), Supabase Storage (private media)
- AI: DeepSeek (exam generation), faster-whisper (transcript), Kokoro (TTS)
- Deploy: Vercel (web), Supabase (DB + auth + edge functions)

## Routes
- `/` — Landing page
- `/app` — Auth-protected app shell
- `/app/vocab` — Vocabulary with SRS spaced repetition
- `/app/listening` — Listening exam library
- `/app/exam` — Exam hub (IELTS, Cambridge, KET, PET, FCE, CAE, CPE)
- `/app/reading-corner` — Bilingual news/books reader
- `/app/writing` — Writing practice with AI grading
- `/app/shadowing` — Shadowing practice
- `/app/speaking-ai` — AI speaking partner
- `/app/sentence-structure` — Sentence structure drills
- `/app/mindmap` — Mind map
- `/app/settings` — Settings & account
- `/app/admin` — Admin panel

## Key Features
- **54 KET Listening exams** published (private storage + cloud segments)
- **751 MP3 audio files** on Cloudflare R2 (4.2 GB) 
- **IELTS listening** 48 Cambridge exams + 9 reading exams
- **SRS spaced repetition** for vocabulary
- **Whisper transcript segments** for auto-sync (220 parts timed)
- **3 themes**: light/mid/dark with CSS variables
- **Responsive mobile**: sidebar drawer, iOS safe-area, touch targets

## Deployment
- Vercel production: https://ryanenglishv2.vercel.app
- Supabase project: afryrzlcmieedcndyeug
- Branch: project_14726
