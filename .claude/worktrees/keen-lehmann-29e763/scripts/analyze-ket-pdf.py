import re
import pypdf

path = r"D:\App-English-Ryan\Website\Tainguyen\Test_1_Reading_KET_A2.pdf"
r = pypdf.PdfReader(path)
pages = []
for i, pg in enumerate(r.pages):
    t = pg.extract_text() or ""
    pages.append(t)
    print(f"page {i+1}: {len(t)} chars")

full = "\n\n".join(pages)
print("total:", len(full))
print("PART hits:", re.findall(r"PART\s*\d+", full, re.I))
print("sample garbled:", repr(full[350:550]))
# simulate pdfjs join with space only
flat = " ".join(" ".join((pg.extract_text() or "").split()) for pg in r.pages)
print("flat chars:", len(flat))
print("part 1 idx flat:", flat.lower().find("part 1"))
print("part 2 idx flat:", flat.lower().find("part 2"))