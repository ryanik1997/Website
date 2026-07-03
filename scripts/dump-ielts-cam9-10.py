"""Dump PDF text for Cam 9 Test 3-4 + Cam 10 Test 1-4."""
from pathlib import Path
import fitz

ROOT = Path(__file__).resolve().parents[1]
FOLDERS = [
    "Listening IELTS_Test3_Cam9",
    "Listening IELTS_Test4_Cam9",
    "Listening IELTS_Test1_Cam10",
    "Listening IELTS_Test2_Cam10",
    "Listening IELTS_Test3_Cam10",
    "Listening IELTS_Test4_Cam10",
]
OUT = ROOT / "scripts" / "ielts-cam9-10-dump.txt"

lines: list[str] = []
for name in FOLDERS:
    d = ROOT / "Tainguyen" / "IELTS" / name
    lines.append("\n" + "=" * 70)
    lines.append(name)
    lines.append("=" * 70)
    for pdf in sorted(d.glob("*.pdf")):
        lines.append(f"\n--- {pdf.name} ---")
        doc = fitz.open(str(pdf))
        lines.append(f"pages: {doc.page_count}")
        for i in range(doc.page_count):
            text = doc[i].get_text().strip()
            if text:
                lines.append(f"[page {i + 1}]")
                lines.append(text[:15000])
                if len(text) > 15000:
                    lines.append("... [truncated]")

OUT.write_text("\n".join(lines), encoding="utf-8")
print(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")