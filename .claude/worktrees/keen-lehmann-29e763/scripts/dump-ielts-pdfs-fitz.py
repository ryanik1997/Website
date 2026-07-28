from pathlib import Path
import fitz

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "scripts" / "ielts-pdf-fitz-dump.txt"

DIRS = [
    ROOT / "Tainguyen" / "IELTS" / "Listening IELTS_Test1_Cam9",
    ROOT / "Tainguyen" / "IELTS" / "Listening IELTS_Test1_Cam20",
]

lines = []
for d in DIRS:
    lines.append(f"\n{'=' * 60}\n{d.name}\n{'=' * 60}")
    for pdf in sorted(d.glob("*.pdf")):
        lines.append(f"\n--- {pdf.name} ---")
        doc = fitz.open(str(pdf))
        lines.append(f"pages: {doc.page_count}")
        for i in range(doc.page_count):
            text = doc[i].get_text().strip()
            if text:
                lines.append(f"[page {i + 1}]")
                lines.append(text[:12000])
                if len(text) > 12000:
                    lines.append("... [truncated]")

OUT.write_text("\n".join(lines), encoding="utf-8")
print(f"Wrote {OUT}")