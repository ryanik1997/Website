"""Dump Cam 17–18 × Test 1–4 PDF text."""
from pathlib import Path
import fitz

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "scripts" / "ielts-cam17-18-dump.txt"

lines: list[str] = []
for cam in (17, 18):
    for test in (1, 2, 3, 4):
        d = ROOT / "Tainguyen" / "IELTS" / f"Listening IELTS_Test{test}_Cam{cam}"
        lines.append("\n" + "=" * 70)
        lines.append(d.name)
        lines.append("=" * 70)
        for pdf in sorted(d.glob("*.pdf")):
            lines.append(f"\n--- {pdf.name} ({pdf.stat().st_size} bytes) ---")
            doc = fitz.open(str(pdf))
            lines.append(f"pages: {doc.page_count}")
            for i in range(doc.page_count):
                text = doc[i].get_text().strip()
                if text:
                    lines.append(f"[page {i + 1}]")
                    lines.append(text)

OUT.write_text("\n".join(lines), encoding="utf-8")
print(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")