"""Extract text from PDF paths passed as argv."""
import sys
from pathlib import Path

try:
    from pypdf import PdfReader
except ImportError:
    try:
        from PyPDF2 import PdfReader
    except ImportError:
        print("NO_PDF_LIB", file=sys.stderr)
        sys.exit(2)

for arg in sys.argv[1:]:
    path = Path(arg)
    print(f"=== {path.name} ===")
    reader = PdfReader(str(path))
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        print(f"--- page {i + 1} ---")
        print(text)
    print()