import re
import pypdf

path = r"D:\App-English-Ryan\Website\Tainguyen\Test_1_Reading_KET_A2.pdf"
r = pypdf.PdfReader(path)
chunks = []
for pg in r.pages:
    t = (pg.extract_text() or "").replace("\r\n", "\n")
    line = " ".join(t.split())
    if line:
        chunks.append(line)
full = "\n\n".join(chunks)

KET_Q = {1: 1, 2: 7, 3: 14, 4: 19, 5: 25}

def find_idx(text, patterns, start=0):
    best = len(text)
    for pat in patterns:
        m = re.search(pat, text[start:], re.I)
        if m:
            abs_i = start + m.start()
            if abs_i < best:
                best = abs_i
    return best

writing_idx = find_idx(full, [r"\bpart\s*6\b.*\bwriting\b", r"\bwriting\b.*\bpart\s*6\b", r"\bpart\s*7\b"])
body = full[:writing_idx] if writing_idx > 100 and writing_idx < len(full) - 80 else full
start = find_idx(body, [r"\bpart\s*1\b", r"questions?\s*1\s*[–\-—]", r"reading\s+and\s+writing"])
boundaries = [start if start < len(body) else 0]
for n in [2, 3, 4, 5]:
    q = KET_Q[n]
    idx = find_idx(body, [rf"\bpart\s*{n}\b", rf"questions?\s*{q}\s*[–\-—]", rf"questions?\s*{q}\b"], boundaries[-1] + 60)
    if idx < len(body) and idx > boundaries[-1] + 60:
        boundaries.append(idx)
boundaries.append(len(body))
while len(boundaries) < 6:
    boundaries.insert(-1, boundaries[-2])

print("boundaries", boundaries)
for i, n in enumerate([1, 2, 3, 4, 5]):
    s = body[boundaries[i]:boundaries[i + 1]]
    print(f"part {n}: {len(s.strip())} chars | {s.strip()[:70].replace(chr(10), ' ')}")
# where is PART 4 and PART 5
for label in ["PART 4", "PART 5"]:
    print(label, body.lower().find(label.lower()))