"""Shared helpers for Cambridge 9 IELTS Reading bundle builders."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IELTS = ROOT / "Tainguyen" / "IELTS"

TFNG_OPTS = [
    {"id": "true", "label": "TRUE"},
    {"id": "false", "label": "FALSE"},
    {"id": "not-given", "label": "NOT GIVEN"},
]
YNNG_OPTS = [
    {"id": "yes", "label": "YES"},
    {"id": "no", "label": "NO"},
    {"id": "not-given", "label": "NOT GIVEN"},
]


def clean(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def para(text: str) -> dict:
    return {"text": clean(text)}


def labeled(label: str, text: str) -> dict:
    return {"label": label, "text": clean(text)}


def tfng(n: int, prompt: str, answer: str, explanation: str) -> dict:
    return {
        "number": n,
        "type": "true-false-not-given",
        "prompt": prompt,
        "options": TFNG_OPTS,
        "answer": answer.lower(),
        "explanation": explanation,
    }


def ynng(n: int, prompt: str, answer: str, explanation: str) -> dict:
    return {
        "number": n,
        "type": "yes-no-not-given",
        "prompt": prompt,
        "options": YNNG_OPTS,
        "answer": answer.lower(),
        "explanation": explanation,
    }


def gap(n: int, prompt: str, answer: str, explanation: str) -> dict:
    return {
        "number": n,
        "type": "gap-fill",
        "prompt": prompt,
        "options": [],
        "answer": answer.lower(),
        "explanation": explanation,
    }


def match_para(n: int, prompt: str, answer: str, explanation: str) -> dict:
    return {
        "number": n,
        "type": "matching-paragraph",
        "prompt": prompt,
        "options": [],
        "answer": answer.lower(),
        "explanation": explanation,
    }


def match_feat(n: int, prompt: str, answer: str, explanation: str) -> dict:
    return {
        "number": n,
        "type": "matching-features",
        "prompt": prompt,
        "options": [],
        "answer": answer.lower(),
        "explanation": explanation,
    }


def heading_q(n: int, para_label: str, answer: str, explanation: str) -> dict:
    return {
        "number": n,
        "type": "matching-headings",
        "prompt": f"Paragraph {para_label}",
        "options": [],
        "answer": answer.lower(),
        "explanation": explanation,
    }


def summary_q(n: int, prompt: str, answer: str, explanation: str) -> dict:
    return {
        "number": n,
        "type": "summary-completion",
        "prompt": prompt,
        "options": [],
        "answer": answer.lower(),
        "explanation": explanation,
    }


def mc(n: int, prompt: str, options: list[dict], answer: str, explanation: str) -> dict:
    return {
        "number": n,
        "type": "multiple-choice",
        "prompt": prompt,
        "options": options,
        "answer": answer.lower(),
        "explanation": explanation,
    }


def write_test(
    test: int,
    parts: list[dict],
    answer_key: str,
    templates: list[str],
    notes: list[str],
    *,
    cambridge: int = 9,
) -> None:
    out = IELTS / f"Reading IELTS_Test{test}_Cam{cambridge}"
    for i, part in enumerate(parts, 1):
        path = out / f"exam_passage{i}.json"
        path.write_text(json.dumps(part, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"  ✓ Test{test} exam_passage{i}.json")
    (out / "answer-key.txt").write_text(answer_key.strip() + "\n", encoding="utf-8")
    print(f"  ✓ Test{test} answer-key.txt")
    meta_path = out / "meta.json"
    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    for i, spec in enumerate(meta["passages"]):
        spec["template"] = templates[i]
        spec["note"] = notes[i]
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"  ✓ Test{test} meta.json")


def split_passage_chunks(text: str) -> list[str]:
    """Return passage bodies for P1–P3 (text after each section heading line)."""
    chunks = re.split(r"^READING PASSAGE \d+\s*$", text, flags=re.I | re.M)
    bodies = [c.strip() for c in chunks[1:] if c.strip()]
    return bodies[:3]


def _strip_reading_header(chunk: str) -> str:
    body = chunk.strip()
    body = re.sub(
        r"^You should spend about.{0,500}?(?:below\s*\.|pages\s*\.|following pages\.?)\s*",
        "",
        body,
        flags=re.I | re.S,
    )
    body = re.sub(r"^\.+\s*\n", "", body)
    return body


def _passage_start_after_questions(body: str, letter_class: str = "A-I") -> str | None:
    """PDF layout: question pages precede passage text (Cam10-style)."""
    for m in re.finditer(
        rf"(?:^|\n)([{letter_class}])\s+([A-Z][^\n]{{30,}})",
        body,
        re.M,
    ):
        txt = m.group(2)
        if re.search(r"professor says|Anjana Ahuja|List of Headings", txt, re.I):
            continue
        start = m.start()
        if start > 0 and body[start] == "\n":
            start += 1
        return body[start:]
    return None


def passage_body(chunk: str) -> str:
    """Strip instructions/questions wrapper; keep title + passage text."""
    body = _strip_reading_header(chunk)
    if re.match(r"Questions?\s+\d", body, re.I):
        after_q = _passage_start_after_questions(body)
        if after_q:
            body = after_q
    else:
        body = re.split(r"\nQuestions?\s+\d", body, flags=re.I)[0]
    body = re.split(r"\nReading Passage \d+ has", body, flags=re.I)[0]
    body = re.sub(r"(?:AFARINESB|APARINESH|IELTS House|www\.IELTS)[^\n]*\n?", "", body, flags=re.I)
    return body.strip()


def _label_line(line: str, letter_class: str) -> tuple[str, str] | None:
    """Return (label, inline_text) when a line opens a labeled paragraph."""
    s = line.strip()
    if not s:
        return None
    solo = re.match(rf"^([{letter_class}])\s*$", s)
    if solo:
        return solo.group(1), ""
    if "A" in letter_class:
        a_glued = re.match(r"^A(?:[\s\xa0]{2,}|\xa0)(.+)$", s)
        if a_glued:
            return "A", a_glued.group(1).strip()
        a_pdf = re.match(
            r"^A\s+(?:The|In|On|For|Operating|It|This|Human|Alan|Travel|During|Once|A\s+In)\b",
            s,
        )
        if a_pdf:
            return "A", re.sub(r"^A\s+", "", s).strip()
    end = letter_class[-1] if "-" in letter_class else letter_class
    other = re.match(rf"^([B-{end}])\s+(.+)$", s)
    if other:
        return other.group(1), other.group(2).strip()
    return None


def parse_labeled_blocks(chunk: str, letters: str) -> list[dict]:
    """Extract labeled paragraphs A–G from a passage chunk (before Questions)."""
    body = passage_body(chunk)
    blocks: list[dict] = []
    letter_class = letters if "-" in letters else re.escape(letters)
    lines = body.splitlines()
    intro_lines: list[str] = []
    i = 0
    while i < len(lines):
        parsed = _label_line(lines[i], letter_class)
        if parsed:
            label, rest = parsed
            para_lines = [rest] if rest else []
            i += 1
            while i < len(lines):
                nxt = lines[i].strip()
                if not nxt:
                    i += 1
                    continue
                if re.match(r"^Questions?\s+\d", nxt, re.I):
                    break
                nxt_label = _label_line(nxt, letter_class)
                if nxt_label and nxt_label[0] != label:
                    break
                if re.match(rf"^[{letter_class}]\s*$", nxt):
                    break
                para_lines.append(nxt)
                i += 1
            txt = " ".join(para_lines)
            if txt:
                blocks.append(labeled(label, txt))
            continue
        if not blocks:
            if lines[i].strip():
                intro_lines.append(lines[i].strip())
        i += 1
    if intro_lines:
        intro = " ".join(intro_lines)
        if len(intro) > 30:
            blocks.insert(0, para(intro))
    if not blocks:
        paras = [p.strip() for p in re.split(r"\n{2,}", body) if len(p.strip()) > 80]
        blocks = [para(p) for p in paras if p]
    return blocks


def parse_paragraphs(chunk: str, min_len: int = 80) -> list[dict]:
    """Unlabeled multi-paragraph passage (merge hard-wrapped PDF lines)."""
    body = passage_body(chunk)
    body = re.sub(r"^[.\s~·]+$\n?", "", body, flags=re.M)
    body = re.sub(r"\n(?=[a-z])", " ", body)
    body = re.sub(r"\s+\d{1,3}\s*\n", "\n\n", body)
    body = re.sub(r"\n{2,}", "\n\n", body)
    paras = [p.strip() for p in re.split(r"\n\n", body) if len(p.strip()) >= min_len]
    if len(paras) <= 1:
        paras = [
            re.sub(r"\s+", " ", s).strip()
            for s in re.split(r"(?<=\.)\s*\n\s*(?=[A-Z])", body)
            if len(s.strip()) >= min_len
        ]
    if not paras and len(body.strip()) >= min_len:
        paras = [re.sub(r"\s+", " ", body).strip()]
    return [para(p) for p in paras]


def load_plain(name: str) -> str:
    return (ROOT / "scripts" / name).read_text(encoding="utf-8")