"""Audit IELTS Listening notePassage vs PDF Section text (Cam9–20).

Run: python scripts/audit-ielts-pdf-vs-json.py

Flags tests where Part 1/4 JSON has bare gaps (no static lead) or fewer static lines
than expected — common cause of missing PDF content in the app.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

try:
    import fitz
except ImportError:
    fitz = None

ROOT = Path(__file__).resolve().parents[1]
IELTS = ROOT / "Tainguyen" / "IELTS"


def find_listening_pdf(folder: Path) -> Path | None:
    for pdf in sorted(folder.glob("*.pdf")):
        if "answer" in pdf.name.lower():
            continue
        if "listening" in pdf.name.lower() or pdf.name.lower().startswith("ielts"):
            return pdf
    return None


def extract_section1_text(pdf_path: Path) -> str:
    if not fitz:
        return ""
    doc = fitz.open(str(pdf_path))
    for page in doc:
        text = page.get_text()
        if re.search(r"SECTION\s*1|Questions\s*1[\s\-–]+10", text, re.I):
            return text
    return doc[0].get_text() if doc.page_count else ""


def audit_part1(folder: Path) -> dict:
    part_path = folder / "exam_part1.json"
    if not part_path.exists():
        return {"status": "no_p1"}
    part = json.loads(part_path.read_text(encoding="utf-8"))
    passage = part.get("notePassage") or []
    bare_gaps = sum(
        1
        for i, b in enumerate(passage)
        if b.get("type") == "gap"
        and (i == 0 or passage[i - 1].get("type") != "static")
        and (i >= len(passage) - 1 or passage[i + 1].get("type") != "static")
    )
    static_lines = sum(1 for b in passage if b.get("type") in ("static", "example", "section"))
    pdf = find_listening_pdf(folder)
    pdf_bullets = 0
    if pdf and fitz:
        s1 = extract_section1_text(pdf)
        pdf_bullets = len(re.findall(r"^[•\-–]", s1, re.M))
    issues: list[str] = []
    if bare_gaps:
        issues.append(f"{bare_gaps} bare gap(s) without static lead/trail")
    if pdf_bullets and static_lines < max(4, pdf_bullets // 2):
        issues.append(f"only {static_lines} static blocks vs ~{pdf_bullets} PDF bullet lines")
    if part.get("passageTitle", "").upper() == "JOB INQUIRY":
        issues.append('title should be "JOB ENQUIRY" per PDF')
    return {
        "status": "issues" if issues else "ok",
        "bare_gaps": bare_gaps,
        "static_lines": static_lines,
        "pdf_bullets": pdf_bullets,
        "issues": issues,
    }


def main() -> None:
    folders = sorted(IELTS.glob("Listening IELTS_Test*_Cam*"))
    print(f"Auditing {len(folders)} IELTS listening tests…\n")
    flagged = 0
    for folder in folders:
        result = audit_part1(folder)
        if result.get("status") == "no_p1":
            continue
        if result.get("issues"):
            flagged += 1
            print(f"⚠ {folder.name}")
            for issue in result["issues"]:
                print(f"    · {issue}")
        else:
            print(f"· {folder.name} — P1 ok ({result['static_lines']} static lines)")
    print(f"\n{flagged} test(s) with P1 issues (of {len(folders)}).")
    print("Fix: expand notePassage in exam_part1.json to match PDF line-by-line, then pnpm fix:ielts-notes")


if __name__ == "__main__":
    main()