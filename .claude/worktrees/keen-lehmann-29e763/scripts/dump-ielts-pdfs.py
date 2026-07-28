from pathlib import Path
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
DIRS = [
    ROOT / "Tainguyen" / "IELTS" / "Listening IELTS_Test1_Cam9",
    ROOT / "Tainguyen" / "IELTS" / "Listening IELTS_Test1_Cam20",
]

for d in DIRS:
    print(f"\n{'=' * 60}\n{d.name}\n{'=' * 60}")
    for pdf in sorted(d.glob("*.pdf")):
        print(f"\n--- {pdf.name} ---")
        reader = PdfReader(str(pdf))
        for i, page in enumerate(reader.pages):
            text = (page.extract_text() or "").strip()
            if text:
                print(f"[page {i + 1}]")
                print(text[:8000])
                if len(text) > 8000:
                    print("... [truncated]")