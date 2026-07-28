"""Dump PDF text for Cam 11–12 × Test 1–4."""
from pathlib import Path
import fitz

ROOT = Path(__file__).resolve().parents[1]
FOLDERS = [
    f"Listening IELTS_Test{t}_Cam{c}"
    for c in (11, 12)
    for t in (1, 2, 3, 4)
]
OUT = ROOT / "scripts" / "ielts-cam11-12-dump.txt"

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
                lines.append(text[:18000])
                if len(text) > 18000:
                    lines.append("... [truncated]")

OUT.write_text("\n".join(lines), encoding="utf-8")
print(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")