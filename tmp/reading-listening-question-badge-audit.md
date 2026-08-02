# Reading & Listening Question Badge Audit — A2–C2

## Audit Date: 2026-08-02

## Summary

- **Shared component exists**: No — each exam level implements its own question number badges
- **Circle badges found**: 4 distinct circle badge styles (border-radius 50% or 999px)
- **Square badges using indigo**: 2 (cae-rw-keyword-list__num, fce-rw-keyword-list__num)
- **Footer pill styles**: 5 distinct implementations
- **Indigo (#6366f1) usage**: `--color-primary` defined in `globals.css`, inherited via `--ket-accent`

## Migration Matrix

| Skill | Level | Route family | Component | Current style | Migration |
|-------|-------|--------------|-----------|---------------|-----------|
| Reading | A2 (KET) | /app/exam/reading/:examId | KetRwFooter (footer pills) | Square, border #008b95 | → #238ED0 border, square 32×32 |
| Reading | A2 (KET) | /app/exam/reading/:examId | RwMcRadioQuestion (ket-rw-q-num) | **Circle**, bg --ket-accent (#6366f1) | → Square 32×32, #238ED0 border |
| Reading | B1 (PET) | /app/exam/reading/:examId | PetRwFooter (footer pills) | Square, border #4aa7b5 | → #238ED0 border, square 32×32 |
| Reading | B2 (FCE) | /app/exam/reading/:examId | KetRwFooter + fce-rw-keyword-list__num | Square, bg --ket-accent (#6366f1) | → #238ED0 border, square 32×32 |
| Reading | C1 (CAE) | /app/exam/reading/:examId | KetRwFooter + cae-rw-keyword-list__num | Square, bg --ket-accent (#6366f1) | → #238ED0 border, square 32×32 |
| Reading | C2 (CPE) | /app/exam/reading/:examId | KetRwFooter | Square, border overrides | → #238ED0 border, square 32×32 |
| Reading | IELTS | /app/exam/reading/:examId | ExamPartFooter (reading-test-q-pill) | Square, bg --rt-pill-* | → #238ED0 border, square 32×32 |
| Listening | A2 (KET) | /app/exam/listening/:examId | Inline footer (listening-ket-cambridge__qnav) | Square, border #4aa7b5 | → #238ED0 border, square 32×32 |
| Listening | A2 (KET) | /app/exam/listening/:examId | ListeningKetPart1PictureView (listening-ket-p1__qbadge) | **Circle**, border #5a9ab5 | → Square 32×32, #238ED0 border |
| Listening | A2 (KET) | /app/exam/listening/:examId | ListeningKetPart3McListView (listening-ket-p3__num) | **Circle**, gradient #0e84b8 | → Square 32×32, #238ED0 border |
| Listening | B1 (PET) | /app/exam/listening/:examId | Inline footer (listening-ket-cambridge__qnav) | Square, border #4aa7b5 | → #238ED0 border, square 32×32 |
| Listening | B2 (FCE) | /app/exam/listening/:examId | Inline footer + listening-fce__num | **Circle**, gradient #0e84b8 | → Square 32×32, #238ED0 border |
| Listening | C1 (CAE) | /app/exam/listening/:examId | (uses FCE/PET components) | N/A — no CAE-specific listening | N/A |
| Listening | C2 (CPE) | /app/exam/listening/:examId | (uses FCE/PET components) | N/A — no CPE-specific listening | N/A |
| Listening | IELTS | /app/exam/listening/:examId | ExamPartFooter (reading-test-q-pill) | Square, bg --rt-pill-* | → #238ED0 border, square 32×32 |
| Listening | IELTS TID | /app/exam/listening/:examId | ListeningIeltsTidShell (listening-tid-footer__pill) | Square, bg --tid-accent | → #238ED0 border, square 32×32 |

## Circle Badges to Remove

| CSS class | File | Border-radius | Background |
|-----------|------|---------------|-----------|
| `ket-rw-q-num` | `readingKetRw.css:516` | 50% | --ket-accent (#6366f1) |
| `listening-ket-p1__qbadge` | `listeningTest.css:3163` | 999px | #fff, border #5a9ab5 |
| `listening-ket-p3__num` | `listeningTest.css:3514` | 999px | gradient #0e84b8→#0b628a |
| `listening-fce__num` | `listeningTest.css:4776` | 999px | gradient #0e84b8→#0b628a |

## Indigo Colors to Remove (question badge scope only)

| Variable | Value | Location | Used by |
|----------|-------|----------|---------|
| `--ket-accent` | = --color-primary (#6366f1) | readingKetRw.css:9 | ket-rw-q-num, cae-rw-keyword-list__num, fce-rw-keyword-list__num |

## Footer Pill Color Inconsistencies

| Footer | Active border | Idle bg | Answered |
|--------|--------------|---------|----------|
| ExamPartFooter (IELTS) | --text-primary | --bg-secondary | color-mix primary 18% |
| KetRwFooter (KET/FCE/CAE/CPE) | #008b95 | transparent | font-weight 700 |
| PetRwFooter (PET) | #4aa7b5 | transparent | font-weight 700 |
| ListeningIeltsTidShell | --tid-accent | transparent | underline bar |
| listening-ket-cambridge__qnav | #4aa7b5 | transparent | font-weight 700 |

All must standardize to: border #238ED0, bg #FFFFFF (unanswered), bg #238ED0 (current), bg #eaf5fb (answered).
