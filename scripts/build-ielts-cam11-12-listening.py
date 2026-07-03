"""Generate exam_part1–4.json + meta.json + exam.json for Cam11 T1–T4 and Cam12 T1–T4.

Run:
  python scripts/build-ielts-cam11-12-listening.py
  pnpm ielts:validate "IELTS/Listening IELTS_Test1_Cam11"
"""
from __future__ import annotations

import json
import copy
import re
from pathlib import Path

try:
    import fitz
except ImportError:
    fitz = None

ROOT = Path(__file__).resolve().parents[1]
TEMPLATES = ROOT / "Tainguyen" / "templates"
IELTS = ROOT / "Tainguyen" / "IELTS"

MC3 = lambda labels: [{"id": k, "label": v} for k, v in labels]
LETTER_OPTS = lambda letters: [{"id": c, "label": c} for c in letters]


def gap(n, prompt, answer, explanation="Điền theo audio.", word_limit=1, **extra):
    return {
        "number": n,
        "type": "gap-fill",
        "prompt": prompt,
        "options": [],
        "answer": answer.lower(),
        "explanation": explanation,
        "wordLimit": word_limit,
        **extra,
    }


def match(n, prompt, option_letters, answer, explanation="Chọn theo audio.", labeled=None, **extra):
    options = MC3(labeled) if labeled else LETTER_OPTS(option_letters)
    return {
        "number": n,
        "type": "matching",
        "prompt": prompt,
        "options": options,
        "answer": answer.upper() if "/" not in answer and len(answer) == 1 else answer.upper(),
        "explanation": explanation,
        **extra,
    }


def mc(n, prompt, options, answer, explanation="Chọn theo audio.", **extra):
    return {
        "number": n,
        "type": "multiple-choice",
        "prompt": prompt,
        "options": MC3(options),
        "answer": answer.upper() if len(answer) == 1 else answer.lower(),
        "explanation": explanation,
        **extra,
    }


def part(num, start, end, instruction, questions, **extra):
    return {
        "partNumber": num,
        "rangeLabel": f"Questions {start}–{end}",
        "instruction": instruction,
        "audioFile": "listening.mp3",
        **extra,
        "questions": questions,
    }


def np_static(text):
    return {"type": "static", "text": text}


def np_section(text):
    return {"type": "section", "text": text}


def np_gap(number):
    return {"type": "gap", "number": number}


def tbl_static(text):
    return {"type": "static", "text": text}


def tbl_gap(number):
    return {"type": "gap", "number": number}


def tbl_break():
    return {"type": "break"}


def choose_two(n1, n2, prompt, options, answer, explanation, **section):
    return [
        match(n1, prompt, list("ABCDE"), answer, explanation, options, **section),
        match(n2, prompt, list("ABCDE"), answer, f"{explanation} (cặp {n1}–{n2})", options),
    ]


def map_label(n, prompt, letters, answer, **extra):
    return match(n, prompt, list(letters), answer, labeled=[(c, c) for c in letters],
                 mapLabel=True, **extra)


def load_template_part(filename: str) -> dict:
    data = json.loads((TEMPLATES / filename).read_text(encoding="utf-8"))
    return copy.deepcopy(data["parts"][0])


def patch_answers(part: dict, answers: dict[int, str]) -> dict:
    for q in part["questions"]:
        if q["number"] not in answers:
            continue
        ans = answers[q["number"]]
        if q["type"] in ("matching", "multiple-choice"):
            q["answer"] = ans.upper() if "/" not in ans and len(ans) == 1 else ans.upper()
        else:
            q["answer"] = ans.lower()
    return part


def merge_parts(meta: dict, parts: dict[int, dict]) -> dict:
    audio = meta.get("audioFile", "listening.mp3")
    merged = []
    for spec in sorted(meta["parts"], key=lambda x: x["partNumber"]):
        p = copy.deepcopy(parts[spec["partNumber"]])
        if not p.get("audioFile"):
            p["audioFile"] = audio
        merged.append(p)
    return {
        "version": 1,
        "title": meta["title"],
        "durationMinutes": meta.get("durationMinutes", 30),
        "bandHint": meta["bandHint"],
        "examType": meta.get("examType", "ielts"),
        "examMode": meta.get("examMode", "practice"),
        "parts": merged,
    }


def _note_passage_starts_with_intro(part: dict) -> bool:
    passage = part.get("notePassage") or []
    return bool(passage and passage[0].get("type") == "static")


def infer_p1_title(part: dict) -> str | None:
    if part.get("passageTitle", "").strip():
        return part["passageTitle"].strip()
    for table in part.get("noteTables") or []:
        title = (table.get("title") or "").strip()
        if title:
            return title
    single = part.get("noteTable") or {}
    title = (single.get("title") or "").strip()
    if title:
        return title
    if not _note_passage_starts_with_intro(part):
        for question in part.get("questions") or []:
            section_title = (question.get("sectionTitle") or "").strip()
            if section_title:
                return section_title
    return None


NOTE_LINE_MARKER_RE = re.compile(r"^[•‣▪◦○·*+–−\-►▸]\s")


def _has_note_line_marker(text: str) -> bool:
    return bool(NOTE_LINE_MARKER_RE.match(text.strip()))


def _atomize_note_passage(passage: list) -> list:
    """Tách static/example có xuống dòng \\n thành nhiều block (1 dòng đề = 1 block)."""
    out: list = []
    for block in passage:
        btype = block.get("type")
        if btype not in ("static", "example"):
            out.append(block)
            continue
        text = block.get("text") or ""
        parts = re.split(r"\r?\n", text)
        if len(parts) <= 1:
            out.append(block)
            continue
        for part in parts:
            if not part.strip():
                continue
            if btype == "example" or part.strip().lower().startswith("example"):
                out.append({"type": "example", "text": part})
            else:
                out.append({"type": "static", "text": part})
    return out


def _enrich_passage_bullets(passage: list) -> None:
    """Thêm • / – cho list items thiếu marker (giữ + * ▪ … nếu đề gốc đã có)."""
    for index, block in enumerate(passage):
        if block.get("type") != "static":
            continue
        text = block.get("text") or ""
        stripped = text.strip()
        if not stripped or _has_note_line_marker(stripped):
            continue
        prev = passage[index - 1] if index > 0 else None
        if not prev:
            continue
        if prev.get("type") == "section" and prev.get("text", "").rstrip().endswith(":"):
            block["text"] = f"• {stripped}"
        elif prev.get("type") == "static":
            prev_text = (prev.get("text") or "").strip()
            if prev_text.endswith(":") and not _has_note_line_marker(prev_text):
                block["text"] = f"– {stripped}"


def infer_p4_title(part: dict) -> str | None:
    if part.get("passageTitle", "").strip():
        return part["passageTitle"].strip()
    for question in part.get("questions") or []:
        section_title = (question.get("sectionTitle") or "").strip()
        if section_title:
            return section_title
    passage = part.get("notePassage") or []
    if passage and passage[0].get("type") == "section":
        return (passage[0].get("text") or "").strip() or None
    return None


def normalize_part1(part: dict) -> dict:
    """Chuẩn hóa Part 1: layout form/table, tiêu đề, bỏ notePassage thừa khi có bảng."""
    if part.get("partNumber") != 1:
        return part

    has_table = bool(part.get("noteTables") or part.get("noteTable"))
    has_passage = bool(part.get("notePassage") or part.get("notePassageSections"))

    if has_table:
        part["notePassageLayout"] = "table"
        if part.get("noteTable") and part.get("notePassage"):
            del part["notePassage"]
    elif has_passage:
        part["notePassageLayout"] = part.get("notePassageLayout") or "form"

    title = infer_p1_title(part)
    if title:
        part["passageTitle"] = title

    passage = part.get("notePassage") or []
    if passage:
        passage = _atomize_note_passage(passage)
        _enrich_passage_bullets(passage)
        part["notePassage"] = passage

    return part


def normalize_part4(part: dict) -> dict:
    """Chuẩn hóa Part 4 lecture notes: layout lecture, tiêu đề, bullets."""
    if part.get("partNumber") != 4:
        return part

    if part.get("notePassage"):
        part["notePassageLayout"] = "lecture"

    title = infer_p4_title(part)
    if title:
        part["passageTitle"] = title

    passage = part.get("notePassage") or []
    if passage and title and passage[0].get("type") == "section":
        if (passage[0].get("text") or "").strip().lower() == title.lower():
            part["notePassage"] = passage[1:]
            passage = part["notePassage"]

    if passage:
        passage = _atomize_note_passage(passage)
        _enrich_passage_bullets(passage)
        part["notePassage"] = passage

    return part


def write_test(folder: str, meta: dict, parts: dict[int, dict]) -> int:
    out = IELTS / folder
    out.mkdir(parents=True, exist_ok=True)
    clean_meta = {k: v for k, v in meta.items() if k != "folder"}
    clean_meta["parts"] = [
        {"partNumber": p["partNumber"], "template": p["template"], "file": p["file"]}
        for p in meta["parts"]
    ]
    (out / "meta.json").write_text(
        json.dumps(clean_meta, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    normalized: dict[int, dict] = {}
    for spec in meta["parts"]:
        n = spec["partNumber"]
        payload = copy.deepcopy(parts[n])
        if n == 1:
            payload = normalize_part1(payload)
        elif n == 4:
            payload = normalize_part4(payload)
        normalized[n] = payload
        (out / spec["file"]).write_text(
            json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
    exam = merge_parts(clean_meta, normalized)
    (out / "exam.json").write_text(
        json.dumps(exam, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    total = sum(len(p["questions"]) for p in exam["parts"])
    print(f"  {folder}: {total} questions → exam.json")
    return total


def _group_words_into_lines(words: list, bucket: float = 4.0) -> list[tuple[float, float, str]]:
    """Gom words PyMuPDF thành dòng (y0, y1, text)."""
    buckets: dict[float, list] = {}
    for w in words:
        y0, y1, token = w[1], w[3], w[4]
        key = round(y0 / bucket) * bucket
        buckets.setdefault(key, []).append(w)
    lines: list[tuple[float, float, str]] = []
    for key in sorted(buckets):
        row = sorted(buckets[key], key=lambda item: item[0])
        text = " ".join(item[4] for item in row)
        y0 = min(item[1] for item in row)
        y1 = max(item[3] for item in row)
        lines.append((y0, y1, text))
    return lines


PLAN_PAGE_MARKERS = (
    "label the map",
    "label the diagram",
    "label the plan",
    "complete the labels",
    "complete the diagram",
)


def is_plan_label_page(page) -> bool:
    text_lower = page.get_text().lower()
    return any(marker in text_lower for marker in PLAN_PAGE_MARKERS)


def find_plan_page_index(doc) -> int | None:
    """Tìm trang PDF chứa map/diagram (0-based)."""
    for index in range(len(doc)):
        if is_plan_label_page(doc[index]):
            return index
    return None


def resolve_listening_pdf(folder: Path) -> Path | None:
    """Chọn file PDF đề Listening trong thư mục bundle."""
    pdfs = [
        path
        for path in folder.glob("*.pdf")
        if "answer" not in path.name.lower() and "key" not in path.name.lower()
    ]
    if not pdfs:
        return None
    pdfs.sort(
        key=lambda path: (
            0 if "listening" in path.name.lower() else 1,
            0 if "test" in path.name.lower() else 1,
            path.name.lower(),
        )
    )
    return pdfs[0]


def find_fallback_plan_clip_rect(page) -> "fitz.Rect | None":
    """PDF scan không có text — crop ảnh embedded (bỏ header/footer scan)."""
    if fitz is None:
        return None

    page_rect = page.rect
    page_area = page_rect.width * page_rect.height
    candidates: list = []
    for img in page.get_images(full=True):
        for rect in page.get_image_rects(img[0]):
            frac = (rect.width * rect.height) / page_area
            if 0.18 < frac < 0.95:
                candidates.append(rect)
    if not candidates:
        return None

    rect = max(candidates, key=lambda item: item.width * item.height)
    inset_x = rect.width * 0.04
    inset_top = rect.height * 0.20
    inset_bottom = rect.height * 0.34
    clip = fitz.Rect(
        rect.x0 + inset_x,
        rect.y0 + inset_top,
        rect.x1 - inset_x,
        rect.y1 - inset_bottom,
    )
    return clip & page_rect


def find_map_diagram_clip_rect(page) -> "fitz.Rect | None":
    """Tìm vùng crop chỉ map/diagram — không lấy nguyên trang PDF."""
    if fitz is None:
        return None

    page_rect = page.rect
    if not is_plan_label_page(page):
        return None

    header_bottom: float | None = None
    questions_top: float | None = None

    header_phrases = PLAN_PAGE_MARKERS
    instruction_phrases = (
        "write the correct letter",
        "choose the correct letter",
        "write the correct answers",
    )

    for _y0, y1, text in _group_words_into_lines(page.get_text("words")):
        tl = text.lower().strip()
        if any(p in tl for p in header_phrases):
            header_bottom = max(header_bottom or 0, y1)
        if any(p in tl for p in instruction_phrases) and "next to" in tl:
            header_bottom = max(header_bottom or 0, y1)

    question_line_re = re.compile(r"^\d{1,2}\.?\s+[A-Za-z]{2,}")

    for y0, _y1, text in _group_words_into_lines(page.get_text("words")):
        line = text.strip()
        if question_line_re.match(line):
            if header_bottom and y0 > header_bottom + 60:
                if y0 > page_rect.height * 0.42:
                    questions_top = y0 if questions_top is None else min(questions_top, y0)

    if header_bottom is None:
        for block in page.get_text("blocks"):
            tl = block[4].strip().lower().replace("\n", " ")
            if any(p in tl for p in header_phrases):
                header_bottom = max(header_bottom or 0, block[3])
            if any(p in tl for p in instruction_phrases) and "next to" in tl:
                header_bottom = max(header_bottom or 0, block[3])
        for block in page.get_text("blocks"):
            line = block[4].strip().replace("\n", " ")
            if question_line_re.match(line):
                if header_bottom and block[1] > header_bottom + 60:
                    if block[1] > page_rect.height * 0.42:
                        questions_top = (
                            block[1] if questions_top is None else min(questions_top, block[1])
                        )

    if header_bottom is None:
        return None

    top = header_bottom + 10
    bottom = (questions_top - 14) if questions_top else min(page_rect.height, top + page_rect.height * 0.58)

    content_left = page_rect.width
    content_right = 0.0
    found = False
    skip_phrases = header_phrases + instruction_phrases

    for x0, y0, x1, y1, token, *_ in page.get_text("words"):
        if y1 < top - 8 or y0 > bottom + 8:
            continue
        t = token.strip()
        tl = t.lower()
        if re.match(r"^\d{1,2}\.?$", tl):
            continue
        if tl in {"questions", "listening", "part", "test"}:
            continue
        if len(t) > 40:
            continue
        content_left = min(content_left, x0)
        content_right = max(content_right, x1)
        found = True

    margin_x = 24
    margin_y = 14
    left = max(0, (content_left if found else 40) - margin_x)
    right = min(page_rect.width, (content_right if found else page_rect.width - 40) + margin_x)
    top = max(0, top - margin_y)
    bottom = min(page_rect.height, bottom + margin_y)

    clip = fitz.Rect(left, top, right, bottom) & page_rect
    if clip.width < 80 or clip.height < 80:
        return None
    return clip


def extract_map_image(
    pdf_path: Path,
    page_idx: int,
    out_path: Path,
    *,
    zoom: float = 2.0,
) -> bool:
    """Render vùng map/diagram từ PDF (crop), không extract nguyên trang."""
    if fitz is None:
        print(f"  ⚠ pymupdf not installed — skip {out_path.name}")
        return False

    doc = fitz.open(str(pdf_path))
    if page_idx < 0 or page_idx >= len(doc):
        doc.close()
        print(f"  ⚠ page {page_idx} out of range in {pdf_path.name}")
        return False

    page = doc[page_idx]
    clip = find_map_diagram_clip_rect(page) or find_fallback_plan_clip_rect(page)
    if clip is None:
        doc.close()
        print(f"  ⚠ could not find map/diagram region in {pdf_path.name} p{page_idx + 1}")
        return False

    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat, clip=clip, alpha=False)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    pix.save(str(out_path), jpg_quality=92)
    doc.close()
    print(
        f"  ✓ {out_path.relative_to(ROOT)} "
        f"({int(pix.width)}×{int(pix.height)})"
    )
    return True


extract_plan_image = extract_map_image


def extract_plan_image_auto(folder: Path, image_name: str, *, zoom: float = 2.0) -> bool:
    """Tự tìm PDF + trang map/diagram và crop ảnh (map.jpg / diagram.jpg)."""
    pdf_path = resolve_listening_pdf(folder)
    if not pdf_path:
        print(f"  ⚠ {folder.name}: no listening PDF for {image_name}")
        return False

    doc = fitz.open(str(pdf_path))
    page_idx = find_plan_page_index(doc)
    if page_idx is None:
        doc.close()
        print(f"  ⚠ {folder.name}: no plan page in {pdf_path.name}")
        return False

    doc.close()
    return extract_map_image(
        pdf_path,
        page_idx,
        folder / image_name,
        zoom=zoom,
    )


MAP_IMAGES = [
    ("Listening IELTS_Test1_Cam11", "Test1_Listening_Cam11.pdf", 3),
    ("Listening IELTS_Test2_Cam11", "Test2_Listening_Cam11.pdf", 3),
    ("Listening IELTS_Test4_Cam11", "Test4_Listening_Cam11.pdf", 3),
    ("Listening IELTS_Test4_Cam12", "Test4_Listening_Cam12.pdf", 2),
]


# ── Cam11 Test 1 ─────────────────────────────────────────────────────────────

def cam11_t1_p1():
    return part(
        1, 1, 10,
        "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "Room:", "charlton", gapLead="the", gapTrail="Room – seats 100"),
            gap(2, "Cost of Main Hall:", "115", gapLead="£"),
            gap(3, "Deposit payment:", "cash"),
            gap(4, "Cost includes:", "parking"),
            gap(5, "Licence needed:", "music"),
            gap(6, "Arrange:", "entry"),
            gap(7, "Band door:", "stage"),
            gap(8, "Cleaning cupboard:", "code"),
            gap(9, "Must be washed:", "floor/floors"),
            gap(10, "Must be taken down:", "decoration"),
        ],
        passageTitle="HIRING A PUBLIC ROOM",
        notePassageLayout="form",
        notePassage=[
            np_static("Example\nThe Main Hall – seats 200"),
            np_section("Room and cost"),
            np_static("• the"), np_gap(1), np_static("Room – seats 100"),
            np_static("• Cost of Main Hall for Saturday evening: 2 £"), np_gap(2),
            np_static("+ £250 deposit ("), np_gap(3), np_static(" payment is required)"),
            np_static("• Cost includes use of tables and chairs and also"), np_gap(4),
            np_static("• Additional charge for use of the kitchen: £25"),
            np_section("Before the event"),
            np_static("• Will need a"), np_gap(5), np_static("licence"),
            np_static("• Need to contact caretaker (Mr Evans) in advance to arrange"), np_gap(6),
            np_section("During the event"),
            np_static("• The building is no smoking"),
            np_static("• The band should use the"), np_gap(7), np_static("door at the back"),
            np_static("• Don't touch the system that controls the volume"),
            np_static("• For microphones, contact the caretaker"),
            np_section("After the event"),
            np_static("• Need to know the"), np_gap(8), np_static("for the cleaning cupboard"),
            np_static("• The"), np_gap(9), np_static("must be washed and rubbish placed in black bags"),
            np_static("• All"), np_gap(10), np_static("must be taken down"),
            np_static("Chairs and tables must be piled up"),
        ],
    )


def cam11_t1_p2():
    letters = list("ABCDEFGHI")
    return part(
        2, 11, 20,
        "Questions 11–14: Complete the notes. Write ONE WORD for each answer. "
        "Questions 15–20: Label the map A–I.",
        [
            gap(11, "Do not harm:", "animals", word_limit=1,
                sectionRange="Questions 11 – 14",
                sectionInstruction="Complete the notes below. Write ONE WORD for each answer.",
                sectionTitle="Fiddy Working Heritage Farm"),
            gap(12, "Do not touch:", "tools", word_limit=1),
            gap(13, "Do not touch:", "shoes", word_limit=1),
            gap(14, "Do not bring:", "dogs", word_limit=1),
            map_label(15, "Scarecrow", letters, "F",
                      sectionRange="Questions 15 – 20",
                      sectionInstruction="Label the map below. Write the correct letter A–I.",
                      sectionTitle="Fiddy Working Heritage Farm"),
            map_label(16, "Maze", letters, "G"),
            map_label(17, "Café", letters, "D"),
            map_label(18, "Black Barn", letters, "H"),
            map_label(19, "Covered picnic area", letters, "C"),
            map_label(20, "Fiddy House", letters, "A"),
        ],
        imageFile="map.jpg",
        passageTitle="Fiddy Working Heritage Farm",
        notePassage=[
            np_section("Advice about visiting the farm"),
            np_static("• take care not to harm any"), np_gap(11),
            np_static("• not touch any"), np_gap(12),
            np_static("• not touch any"), np_gap(13),
            np_static("• not bring"), np_gap(14), np_static("into the farm, with certain exceptions"),
        ],
    )


def cam11_t1_p3():
    return part(
        3, 21, 30,
        "Choose the correct letter, A, B or C.",
        [
            mc(21, "The students in Akira Miyake's study were all majoring in", [
                ("A", "physics"), ("B", "psychology or physics"),
                ("C", "science, technology, engineering or mathematics"),
            ], "C", sectionTitle="Study on Gender in Physics"),
            mc(22, "The aim of Miyake's study was to investigate", [
                ("A", "what kind of women choose to study physics"),
                ("B", "a way of improving women's performance in physics"),
                ("C", "whether fewer women than men study physics at college"),
            ], "B"),
            mc(23, "The female physics students were wrong to believe that", [
                ("A", "the teachers marked them in an unfair way"),
                ("B", "the male students expected them to do badly"),
                ("C", "their test results were lower than the male students'"),
            ], "C"),
            mc(24, "Miyake's team asked the students to write about", [
                ("A", "what they enjoyed about studying physics"),
                ("B", "the successful experiences of other people"),
                ("C", "something that was important to them personally"),
            ], "A"),
            mc(25, "What was the aim of the writing exercise done by the subjects?", [
                ("A", "to reduce stress"), ("B", "to strengthen verbal ability"),
                ("C", "to encourage logical thinking"),
            ], "B"),
            mc(26, "What surprised the researchers about the study?", [
                ("A", "how few students managed to get A grades"),
                ("B", "the positive impact it had on physics results for women"),
                ("C", "the difference between male and female performance"),
            ], "C"),
            mc(27, "Greg and Lisa think Miyake's results could have been affected by", [
                ("A", "the length of the writing task"),
                ("B", "the number of students who took part"),
                ("C", "the information the students were given"),
            ], "A"),
            mc(28, "Greg and Lisa decide that in their own project, they will compare the effects of", [
                ("A", "two different writing tasks"),
                ("B", "a writing task with an oral task"),
                ("C", "two different oral tasks"),
            ], "B"),
            mc(29, "The main finding of Smolinsky's research was that class teamwork activities", [
                ("A", "were most effective when done by all-women groups"),
                ("B", "had no effect on the performance of men or women"),
                ("C", "improved the results of men more than of women"),
            ], "B"),
            mc(30, "What will Lisa and Greg do next?", [
                ("A", "talk to a professor"), ("B", "observe a science class"),
                ("C", "look at the science timetable"),
            ], "A"),
        ],
    )


def cam11_t1_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "Targets for:", "conservation", sectionTitle="Ocean Biodiversity"),
            gap(32, "Not always rich in:", "food/foods"),
            gap(33, "Higher temperatures at the:", "surface"),
            gap(34, "Sufficient in the water:", "oxygen/o2"),
            gap(35, "Hotspots for marine:", "mammals"),
            gap(36, "Under the:", "ice"),
            gap(37, "Rate of:", "decline/declining/disease"),
            gap(38, "Distribution:", "map"),
            gap(39, "Establish:", "migration"),
            gap(40, "Catch fish only for:", "consumption"),
        ],
        passageTitle="Ocean Biodiversity",
        notePassage=[
            np_section("Biodiversity hotspots"),
            np_static("• areas containing many different species"),
            np_static("• important for locating targets for"), np_gap(31),
            np_static("• at first only identified on land"),
            np_section("Boris Worm, 2005"),
            np_static("• identified hotspots for large ocean predators e.g. sharks"),
            np_static("• found that ocean hotspots:"),
            np_static("  – were not always rich in"), np_gap(32),
            np_static("  – had higher temperatures at the"), np_gap(33),
            np_static("  – had sufficient"), np_gap(34), np_static("in the water"),
            np_section("Lisa Ballance, 2007"),
            np_static("• looked for hotspots for marine"), np_gap(35),
            np_static("• found these were all located where ocean currents meet"),
            np_section("Census of Marine Life"),
            np_static("• found new ocean species living under the"), np_gap(36),
            np_static("• near volcanoes on the ocean floor"),
            np_section("Global Marine Species Assessment"),
            np_static("• rate of"), np_gap(37),
            np_static("• Aim: distribution"), np_gap(38), np_static("for each one"),
            np_section("Recommendations"),
            np_static("• establish"), np_gap(39), np_static("corridors (e.g. for turtles)"),
            np_static("• catch fish only for the purpose of"), np_gap(40),
        ],
    )


# ── Cam11 Test 2 ─────────────────────────────────────────────────────────────

def cam11_t2_p1():
    return part(
        1, 1, 10,
        "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "Lives in a:", "hostel", sectionTitle="Enquiry about joining Youth Council"),
            gap(2, "Street:", "buckleigh", gapLead="17,"),
            gap(3, "Postcode:", "pe97qt"),
            gap(4, "Part-time job:", "waiter"),
            gap(5, "Major subject:", "politics"),
            gap(6, "Hobby:", "cycling"),
            gap(7, "Interested in:", "cinema"),
            gap(8, "Wants to work with:", "disabled"),
            gap(9, "Meeting time:", "4.30/half past four", word_limit=2),
            gap(10, "Phone:", "07788136711", word_limit=1),
        ],
        notePassageLayout="form",
        notePassage=[
            np_static("Example\nName: Roger Brown"),
            np_static("Age: 18"),
            np_static("Lives in a"), np_gap(1),
            np_static("Postal address: 2 17,"), np_gap(2), np_static("Street, Stamford, Lincs"),
            np_static("Postcode:"), np_gap(3),
            np_static("Occupation: student and part-time job as a"), np_gap(4),
            np_static("Studying"), np_gap(5), np_static("(major subject) and history (minor subject)"),
            np_static("Hobbies: does a lot of"), np_gap(6),
            np_static("and is interested in the"), np_gap(7),
            np_static("On Youth Council, wants to work with young people who are"), np_gap(8),
            np_static("Will come to talk to the Elections Officer next Monday at"), np_gap(9), np_static("pm"),
            np_static("Phone:"), np_gap(10),
        ],
    )


def cam11_t2_p2():
    theatre_opts = [
        ("A", "Some rooms now have a different use."),
        ("B", "A different type of seating has been installed."),
        ("C", "An elevator has been installed."),
        ("D", "The outside of the building has been repaired."),
        ("E", "Extra seats have been added."),
    ]
    facility_opts = [
        ("A", "rooms for hire"), ("B", "backstage tours"), ("C", "hire of costumes"),
        ("D", "a bookshop"), ("E", "a café"),
    ]
    workshop_opts = [
        ("A", "sound"), ("B", "acting"), ("C", "making puppets"),
        ("D", "make-up"), ("E", "lighting"),
    ]
    letters = list("ABCDEFG")
    return part(
        2, 11, 20,
        "Questions 11–16: Choose TWO letters A–E. Questions 17–20: Label the plan A–G.",
        [
            *choose_two(11, 12,
                        "Which TWO changes have been made so far during the refurbishment of the theatre?",
                        theatre_opts, "E/A", "Sửa ngoài (E) và đổi chức năng phòng (A).",
                        sectionRange="Questions 11 – 12",
                        sectionInstruction="Choose TWO letters, A–E.",
                        sectionTitle="New staff at theatre"),
            *choose_two(13, 14,
                        "Which TWO facilities does the theatre currently offer to the public?",
                        facility_opts, "B/D", "Tham quan hậu trường (B) và hiệu sách (D)."),
            *choose_two(15, 16,
                        "Which TWO workshops does the theatre currently offer?",
                        workshop_opts, "C/E", "Làm rối (C) và ánh sáng (E)."),
            map_label(17, "Box office", letters, "G",
                      sectionRange="Questions 17 – 20",
                      sectionInstruction="Label the plan below. Write the correct letter A–G.",
                      sectionTitle="Ground floor plan of theatre"),
            map_label(18, "Theatre manager's office", letters, "D"),
            map_label(19, "Lighting box", letters, "B"),
            map_label(20, "Artistic director's office", letters, "F"),
        ],
        imageFile="map.jpg",
    )


def cam11_t2_p3():
    return part(
        3, 21, 30,
        "Questions 21–26: Choose A, B or C. Questions 27–28 and 29–30: Choose TWO letters A–E.",
        [
            mc(21, "What do the students agree should be included in their aims?", [
                ("A", "factors affecting where organisms live"),
                ("B", "the need to preserve endangered species"),
                ("C", "techniques for classifying different organisms"),
            ], "A", sectionRange="Questions 21 – 26",
               sectionInstruction="Choose the correct letter A, B or C.",
               sectionTitle="Rocky Bay field trip"),
            mc(22, "What equipment did they forget to take on the Field Trip?", [
                ("A", "string"), ("B", "a compass"), ("C", "a ruler"),
            ], "A"),
            mc(23, "In Helen's procedure section, Colin suggests a change in", [
                ("A", "the order in which information is given"),
                ("B", "the way the information is divided up"),
                ("C", "the amount of information provided"),
            ], "C"),
            mc(24, "What do they say about the method they used to measure wave speed?", [
                ("A", "It provided accurate results"),
                ("B", "It was simple to carry out"),
                ("C", "It required special equipment"),
            ], "B"),
            mc(25, "What mistake did Helen make when first drawing the map?", [
                ("A", "She chose the wrong scale"),
                ("B", "She stood in the wrong place"),
                ("C", "She did it at the wrong time"),
            ], "B"),
            mc(26, "What do they decide to do next with their map?", [
                ("A", "scan it onto a computer"),
                ("B", "check it using photographs"),
                ("C", "add information from the internet"),
            ], "C"),
            *choose_two(27, 28,
                        "Which TWO problems affecting organisms in the splash zone are mentioned?",
                        [("A", "lack of water"), ("B", "strong winds"), ("C", "lack of food"),
                         ("D", "high temperatures"), ("E", "large waves")],
                        "A/D", "Thiếu nước (A) và nhiệt cao (D).",
                        sectionRange="Questions 27 – 28",
                        sectionInstruction="Choose TWO letters, A–E."),
            *choose_two(29, 30,
                        "Which TWO reasons for possible error will they include in their report?",
                        [("A", "inaccurate records of the habitat of organisms"),
                         ("B", "influence on behaviour of organisms by observer"),
                         ("C", "incorrect identification of some organisms"),
                         ("D", "making generalisations from a small sample"),
                         ("E", "missing some organisms when counting")],
                        "C/E", "Nhận dạng sai (C) và bỏ sót (E).",
                        sectionRange="Questions 29 – 30",
                        sectionInstruction="Choose TWO letters, A–E."),
        ],
    )


def cam11_t2_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "Physical and:", "social", sectionTitle="DESIGNING A PUBLIC BUILDING: THE TAYLOR CONCERT HALL"),
            gap(32, "Site of a disused:", "factory"),
            gap(33, "Approached by a:", "canal"),
            gap(34, "Approached by a:", "bridge"),
            gap(35, "Shape of a:", "boat"),
            gap(36, "On a:", "screen"),
            gap(37, "Pads made of:", "rubber"),
            gap(38, "Walls are:", "cleaned"),
            gap(39, "Ceiling panels and:", "curtains"),
            gap(40, "Style:", "international"),
        ],
        passageTitle="Designing a public building: The Taylor Concert Hall",
        notePassage=[
            np_section("Introduction"),
            np_static("The designer may need to consider the building's function, physical and"), np_gap(31),
            np_static("context, and symbolic meaning"),
            np_section("Location and concept"),
            np_static("On the site of a disused"), np_gap(32),
            np_static("Approached by a"), np_gap(33), np_static("for pedestrians"),
            np_static("Crossed by a"), np_gap(34),
            np_static("The building is the shape of a"), np_gap(35),
            np_section("Building design"),
            np_static("In the auditorium:"),
            np_static("• the floor is built on huge pads made of"), np_gap(37),
            np_static("• the walls are made of local wood and are"), np_gap(38), np_static("in shape"),
            np_static("• ceiling panels and"), np_gap(39), np_static("on walls allow adjustment of acoustics"),
            np_static("• displayed on a"), np_gap(36),
            np_section("Evaluation"),
            np_static("Some critics say the"), np_gap(40), np_static("style of the building is inappropriate"),
        ],
    )


# ── Cam11 Test 3 ─────────────────────────────────────────────────────────────

def cam11_t3_p1():
    return part(
        1, 1, 10,
        "Questions 1–6: Choose A, B or C. Questions 7–10: Complete the sentences. Write ONE WORD ONLY.",
        [
            mc(1, "The 'Family Welcome' event in the art gallery begins at", [
                ("A", "10 am"), ("B", "10.30 am"), ("C", "2 pm"),
            ], "B", sectionRange="Questions 1 – 6",
               sectionInstruction="Choose the correct letter A, B or C.",
               sectionTitle="Free activities in the Burnham area"),
            mc(2, "The film that is now shown in the 'Family Welcome' event is about", [
                ("A", "sculpture"), ("B", "painting"), ("C", "ceramics"),
            ], "C"),
            mc(3, "When do most of the free concerts take place?", [
                ("A", "in the morning"), ("B", "at lunchtime"), ("C", "in the evening"),
            ], "B"),
            mc(4, "Where will the 4 pm concert of Latin American music take place?", [
                ("A", "in a museum"), ("B", "in a theatre"), ("C", "in a library"),
            ], "A"),
            mc(5, "The boat race begins at", [
                ("A", "Summer Pool"), ("B", "Charlesworth Bridge"), ("C", "Offord Marina"),
            ], "C"),
            mc(6, "One of the boat race teams", [
                ("A", "won a regional competition earlier this year"),
                ("B", "has represented the region in a national competition"),
                ("C", "has won several regional competitions"),
            ], "A"),
            gap(7, "Rare:", "birds", word_limit=1,
                sectionRange="Questions 7 – 10",
                sectionInstruction="Complete the sentences below. Write ONE WORD ONLY for each answer.",
                sectionTitle="Paxton Nature Reserve"),
            gap(8, "Unusual:", "furniture", word_limit=1),
            gap(9, "Learn about and collect:", "mushrooms", word_limit=1),
            gap(10, "Part of the:", "river", word_limit=1),
        ],
        notePassage=[
            np_section("Paxton Nature Reserve"),
            np_static("• Paxton is a good place for seeing rare"), np_gap(7), np_static("all year round"),
            np_static("• This is a particularly good time for seeing certain unusual"), np_gap(8),
            np_static("• Visitors will be able to learn about"), np_gap(9), np_static("and then collect some"),
            np_static("• Part of the"), np_gap(10), np_static("has been made suitable for swimming"),
        ],
    )


def cam11_t3_p2():
    plan_opts = [
        ("A", "It will move to a new location."),
        ("B", "It will have its opening hours expanded."),
        ("C", "It will be refurbished."),
        ("D", "It will be used for a different purpose."),
        ("E", "It will have its opening hours reduced."),
        ("F", "It will have new management."),
        ("G", "It will be expanded."),
    ]
    return part(
        2, 11, 20,
        "Questions 11–15: Choose A, B or C. Questions 16–20: Matching A–G.",
        [
            mc(11, "In Shona's opinion, why do fewer people use buses in Barford these days?", [
                ("A", "The buses are old and uncomfortable."),
                ("B", "Fares have gone up too much."),
                ("C", "There are not so many bus routes."),
            ], "C", sectionRange="Questions 11 – 15",
               sectionInstruction="Choose the correct letter A, B or C.",
               sectionTitle="Changes in Barford over the last 50 years"),
            mc(12, "What change in the road network is known to have benefited the town most?", [
                ("A", "the construction of a bypass"),
                ("B", "the development of cycle paths"),
                ("C", "the banning of cars from certain streets"),
            ], "B"),
            mc(13, "What is the problem affecting shopping in the town centre?", [
                ("A", "lack of parking spaces"),
                ("B", "lack of major retailers"),
                ("C", "lack of restaurants and cafés"),
            ], "B"),
            mc(14, "What does Shona say about medical facilities in Barford?", [
                ("A", "There is no hospital."),
                ("B", "New medical practices are planned."),
                ("C", "The number of dentists is too low."),
            ], "A"),
            mc(15, "The largest number of people are employed in", [
                ("A", "manufacturing"), ("B", "services"), ("C", "education"),
            ], "C"),
            match(16, "Railway station car park", list("ABCDEFG"), "G", labeled=plan_opts,
                  sectionRange="Questions 16 – 20",
                  sectionInstruction="What is planned for each facility? Choose FIVE answers A–G."),
            match(17, "Cinema", list("ABCDEFG"), "A", labeled=plan_opts),
            match(18, "Indoor market", list("ABCDEFG"), "C", labeled=plan_opts),
            match(19, "Library", list("ABCDEFG"), "B", labeled=plan_opts),
            match(20, "Nature reserve", list("ABCDEFG"), "F", labeled=plan_opts),
        ],
    )


def cam11_t3_p3():
    who_opts = [
        ("A", "Helen only"), ("B", "Jeremy only"),
        ("C", "both Helen and Jeremy"), ("D", "neither Helen nor Jeremy"),
    ]
    return part(
        3, 21, 30,
        "Questions 21–26: Complete the table. Write ONE WORD ONLY. Questions 27–30: Matching A–D.",
        [
            gap(21, "Subject:", "cave", word_limit=1,
                sectionRange="Questions 21 – 26",
                sectionInstruction="Complete the table below. Write ONE WORD ONLY for each answer."),
            gap(22, "Add:", "tiger", word_limit=1),
            gap(23, "People who are:", "dancing", word_limit=1),
            gap(24, "And:", "playing", word_limit=1),
            gap(25, "Ice-skating on:", "grass", word_limit=1),
            gap(26, "Add a:", "scarf", word_limit=1),
            match(27, "How they planned the project", list("ABCD"), "A", labeled=who_opts,
                  sectionRange="Questions 27 – 30",
                  sectionInstruction="Who is going to write each part of the report? Write A–D."),
            match(28, "How they had ideas for their stories", list("ABCD"), "C", labeled=who_opts),
            match(29, "An interpretation of their stories", list("ABCD"), "D", labeled=who_opts),
            match(30, "Comments on the illustrations", list("ABCD"), "B", labeled=who_opts),
        ],
        notePassageLayout="table",
        noteTables=[{
            "gapNumbers": [21, 22, 23, 24, 25, 26],
            "instruction": "Questions 21 – 26\nComplete the table below. Write ONE WORD ONLY for each answer.",
            "headers": ["Subject of drawing", "Change to be made"],
            "rows": [
                {"cells": [
                    [tbl_static("A "), tbl_gap(21), tbl_static(" surrounded by trees")],
                    [tbl_static("Add Malcolm and a "), tbl_gap(22)],
                ]},
                {"cells": [
                    [tbl_static("People who are "), tbl_gap(23), tbl_static(" and "), tbl_gap(24)],
                    [tbl_static("Add Malcolm sitting on a tree trunk and dissuading two people from "), tbl_gap(23)],
                ]},
                {"cells": [
                    [tbl_static("Ice-skating on "), tbl_gap(25)],
                    [tbl_static("Add a "), tbl_gap(26), tbl_static(" tied to each person's waist")],
                ]},
            ],
        }],
    )


def cam11_t3_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "Customer needs and:", "attitude/attitudes", sectionTitle="ETHNOGRAPHY IN BUSINESS"),
            gap(32, "Cannot easily see the:", "numbers"),
            gap(33, "Check the:", "time/minutes"),
            gap(34, "Develop:", "software"),
            gap(35, "Information about:", "patients"),
            gap(36, "Recorded their:", "emotions/feelings"),
            gap(37, "Criteria such as age,:", "income"),
            gap(38, "Must feel:", "comfortable"),
            gap(39, "Direct:", "observation"),
            gap(40, "Analysis of the:", "analysis"),
        ],
        passageTitle="Ethnography in business",
        notePassage=[
            np_section("Ethnography"),
            np_static("Research which explores human cultures; used in business to investigate customer needs and"), np_gap(31),
            np_section("Kitchen equipment"),
            np_static("Researchers found that cooks could not easily see the"), np_gap(32), np_static("in measuring cups"),
            np_section("Cell phones"),
            np_static("Customers wanted to check the"), np_gap(33), np_static("used"),
            np_section("Computer companies"),
            np_static("Need to develop"), np_gap(34), np_static("to improve communication"),
            np_section("Hospitals"),
            np_static("Nurses needed access to information about"), np_gap(35),
            np_section("Airlines"),
            np_static("Respondents recorded information about their"), np_gap(36), np_static("while travelling"),
            np_section("Principles"),
            np_static("Participants selected by criteria such as age,"), np_gap(37),
            np_static("Participants must feel"), np_gap(38), np_static("about taking part"),
            np_static("Usually direct"), np_gap(39), np_static("of the participants"),
            np_static("A lot of time needed for the"), np_gap(40), np_static("of the data"),
        ],
    )


# ── Cam11 Test 4 ─────────────────────────────────────────────────────────────

def cam11_t4_p1():
    play_opts = [
        ("A", "mainly for children"), ("B", "mainly for adults"),
        ("C", "suitable for people of all ages"),
    ]
    return part(
        1, 1, 10,
        "Questions 1–7: Complete the table. Questions 8–10: Matching A–C.",
        [
            gap(1, "Venue:", "secondary", word_limit=1,
                sectionRange="Questions 1 – 7",
                sectionInstruction="Complete the table below. Write ONE WORD AND/OR A NUMBER for each answer."),
            gap(2, "Plays the:", "flute", word_limit=1),
            gap(3, "Start behind:", "cinema", word_limit=1),
            gap(4, "Prize:", "concert", word_limit=1),
            gap(5, "Ducks bought in:", "market", word_limit=1),
            gap(6, "Venue:", "bythwaite", word_limit=1),
            gap(7, "Presented by a:", "actor", word_limit=1),
            match(8, "The Mystery of Muldoon", list("ABC"), "A", labeled=play_opts,
                  sectionRange="Questions 8 – 10",
                  sectionInstruction="Who is each play suitable for? Write A, B or C."),
            match(9, "Fire and Flood", list("ABC"), "B", labeled=play_opts),
            match(10, "Silly Sailor", list("ABC"), "C", labeled=play_opts),
        ],
        notePassageLayout="table",
        noteTables=[{
            "gapNumbers": [1, 2, 3, 4, 5, 6, 7],
            "instruction": "Questions 1 – 7\nComplete the table below. Write ONE WORD AND/OR A NUMBER for each answer.",
            "headers": ["Event", "Cost", "Venue", "Notes"],
            "rows": [
                {"cells": [
                    [tbl_static("Jazz band")], [tbl_static("Tickets available for £15")],
                    [tbl_static("The "), tbl_gap(1), tbl_static(" school")],
                    [tbl_static("Carolyn Hart (plays the "), tbl_gap(2), tbl_static(")")],
                ]},
                {"cells": [
                    [tbl_static("Duck races")], [tbl_static("£1 per duck")],
                    [tbl_static("Start behind the "), tbl_gap(3)],
                    [tbl_static("Ducks can be bought in the "), tbl_gap(5)],
                ]},
                {"cells": [
                    [tbl_static("Flower show")], [tbl_static("Free")],
                    [tbl_static("Bythwaite "), tbl_gap(6)],
                    [tbl_static("Prize: tickets for "), tbl_gap(4), tbl_static(" — presented by a well-known "), tbl_gap(7)],
                ]},
            ],
        }],
    )


def cam11_t4_p2():
    comment_opts = [
        ("A", "was given by one person"),
        ("B", "was recently publicised in the media"),
        ("C", "includes some items given by members of the public"),
        ("D", "includes some items given by the artists"),
        ("E", "includes the most popular exhibits in the museum"),
        ("F", "is the largest of its kind in the country"),
        ("G", "has had some of its contents relocated"),
    ]
    letters = list("ABCDEFGH")
    return part(
        2, 11, 20,
        "Questions 11–16: Matching A–G. Questions 17–20: Label the plan A–H.",
        [
            match(11, "20th- and 21st-century paintings", list("ABCDEFG"), "E", labeled=comment_opts,
                  sectionRange="Questions 11 – 16",
                  sectionInstruction="What does the speaker say about each collection? Choose SIX answers A–G."),
            match(12, "19th-century paintings", list("ABCDEFG"), "D", labeled=comment_opts),
            match(13, "Sculptures", list("ABCDEFG"), "G", labeled=comment_opts),
            match(14, "'Around the world' exhibition", list("ABCDEFG"), "B", labeled=comment_opts),
            match(15, "Coins", list("ABCDEFG"), "C", labeled=comment_opts),
            match(16, "Porcelain and glass", list("ABCDEFG"), "A", labeled=comment_opts),
            map_label(17, "Restaurant", letters, "F",
                      sectionRange="Questions 17 – 20",
                      sectionInstruction="Label the plan below. Write the correct letter A–H.",
                      sectionTitle="Basement of museum"),
            map_label(18, "Café", letters, "H"),
            map_label(19, "Baby-changing facilities", letters, "C"),
            map_label(20, "Cloakroom", letters, "B"),
        ],
        imageFile="map.jpg",
    )


def cam11_t4_p3():
    char_opts = [
        ("A", "They had all won prizes for their music."),
        ("B", "They had all made music recordings."),
        ("C", "They were all under 27 years old."),
        ("D", "They had all toured internationally."),
        ("E", "They all played a string instrument."),
    ]
    phone_opts = [
        ("A", "It meant rich data could be collected."),
        ("B", "It allowed the involvement of top performers."),
        ("C", "It led to a stressful atmosphere at times."),
        ("D", "It meant interview times had to be limited."),
        ("E", "It caused some technical problems."),
    ]
    topic_opts = [
        ("A", "regulations concerning concert dress"),
        ("B", "audience reactions to the dress of performers"),
        ("C", "changes in performer attitudes to concert dress"),
        ("D", "how choice of dress relates to performer roles"),
        ("E", "links between musical instrument and dress choice"),
    ]
    return part(
        3, 21, 30,
        "Questions 21–26: Choose TWO letters A–E. Questions 27–30: Choose A, B or C.",
        [
            *choose_two(21, 22,
                        "Which TWO characteristics were shared by the subjects of Joanna's psychology study?",
                        char_opts, "B/D", "Đã thu âm (B) và từng biểu diễn quốc tế (D).",
                        sectionRange="Questions 21 – 22",
                        sectionInstruction="Choose TWO letters, A–E.",
                        sectionTitle="Psychology study on concert dress"),
            *choose_two(23, 24,
                        "Which TWO points does Joanna make about her use of telephone interviews?",
                        phone_opts, "A/C", "Dữ liệu phong phú (A) và căng thẳng (C)."),
            *choose_two(25, 26,
                        "Which TWO topics did Joanna originally intend to investigate?",
                        topic_opts, "A/E", "Quy định trang phục (A) và nhạc cụ–trang phục (E)."),
            mc(27, "Joanna concentrated on women performers because", [
                ("A", "women are more influenced by fashion"),
                ("B", "women's dress has led to more controversy"),
                ("C", "women's code of dress is less strict than men's"),
            ], "C", sectionRange="Questions 27 – 30",
               sectionInstruction="Choose the correct letter A, B or C."),
            mc(28, "Mike Frost's article suggests that in popular music, women's dress is affected by", [
                ("A", "their wish to be taken seriously"),
                ("B", "their tendency to copy each other"),
                ("C", "their reaction to the masculine nature of the music"),
            ], "A"),
            mc(29, "What did Joanna's subjects say about the audience at a performance?", [
                ("A", "The musicians' choice of clothing is linked to respect for the audience"),
                ("B", "The clothing should not distract the audience from the music"),
                ("C", "The audience should make the effort to dress appropriately"),
            ], "A"),
            mc(30, "According to the speakers, musicians could learn from sports scientists about", [
                ("A", "the importance of clothing for physical freedom"),
                ("B", "the part played by clothing in improving performance"),
                ("C", "the way clothing may protect against physical injury"),
            ], "C"),
        ],
    )


def cam11_t4_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "Soil that is:", "dry", sectionTitle="The use of soil to reduce carbon dioxide (CO2)"),
            gap(32, "Soil in Africa was very:", "hard"),
            gap(33, "Substances such as:", "sugar/sugars"),
            gap(34, "Moves from the:", "roots"),
            gap(35, "Soil remains:", "moist/damp/wet"),
            gap(36, "Increasing the:", "variety"),
            gap(37, "On a big:", "cattle"),
            gap(38, "Compost from:", "gardens/gardening"),
            gap(39, "Using grasses that are always:", "grasses"),
            gap(40, "Farmers:", "payment/payments/money"),
        ],
        passageTitle="The use of soil to reduce carbon dioxide (CO2)",
        notePassage=[
            np_section("Rattan Lal"),
            np_static("• Erosion is more likely in soil that is"), np_gap(31),
            np_static("• Lal found soil in Africa that was very"), np_gap(32),
            np_section("Soil and carbon"),
            np_static("• plants turn CO2 into carbon-based substances such as"), np_gap(33),
            np_static("• some carbon moves from the"), np_gap(34), np_static("of plants to microbes in the soil"),
            np_section("Regenerative agriculture"),
            np_static("• make sure soil remains fertile and"), np_gap(35),
            np_static("• increasing the"), np_gap(36), np_static("of plants that are grown"),
            np_section("California study"),
            np_static("• taking place on a big"), np_gap(37), np_static("farm"),
            np_static("• uses compost made from waste from agriculture and"), np_gap(38),
            np_section("Australia study"),
            np_static("• using"), np_gap(39), np_static("that are always green"),
            np_section("Future developments"),
            np_static("• giving farmers"), np_gap(40), np_static("for carbon storage, as well as their produce"),
        ],
    )


# ── Cam12 Test 1 (Book Test 5) ───────────────────────────────────────────────

def cam12_t1_p1():
    return part(
        1, 1, 10,
        "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "View of:", "mountains", sectionTitle="Cycle tours in Morocco"),
            gap(2, "Can ride a:", "horse"),
            gap(3, "Each tent has a:", "garden/gardens"),
            gap(4, "Meals included unless you have:", "lunch"),
            gap(5, "Given a:", "map"),
            gap(6, "Customers are very:", "experience"),
            gap(7, "Company name:", "ratchesons"),
            gap(8, "Must bring a:", "helmet"),
            gap(9, "Bikes repaired at local:", "shops"),
            gap(10, "Cost per person:", "267"),
        ],
        notePassageLayout="form",
        notePassage=[
            np_static("Example\nType of holiday: a week's tour"),
            np_static("• Accommodation is in a tent with a view of the"), np_gap(1),
            np_static("• Customers can also spend a day riding a"), np_gap(2),
            np_static("• Each tent has its own"), np_gap(3),
            np_static("• All meals are included unless you have a"), np_gap(4), np_static("in a local restaurant"),
            np_static("• Customers are given a detailed"), np_gap(5), np_static("of the route"),
            np_static("• Most customers are already very"), np_gap(6), np_static("cyclists"),
            np_static("• The name of the company is"), np_gap(7),
            np_static("• Customers are required to bring a"), np_gap(8),
            np_static("• Bikes can be hired in local"), np_gap(9), np_static("if needed"),
            np_static("• Cost for 7 nights is £"), np_gap(10), np_static("per person"),
        ],
    )


def cam12_t1_p2():
    duty_opts = [
        ("A", "collect feedback from customers"),
        ("B", "deliver food to customers"),
        ("C", "maintain equipment"),
        ("D", "clean the food preparation areas"),
        ("E", "take the food orders"),
        ("F", "update the personnel file"),
        ("G", "check quantities of food on display"),
    ]
    return part(
        2, 11, 20,
        "Questions 11–14: Choose A, B or C. Questions 15–16: Choose TWO A–E. Questions 17–20: Matching A–G.",
        [
            mc(11, "What does the manager say about opportunities for promotion?", [
                ("A", "They are only available to fully qualified staff"),
                ("B", "They are available in most areas of the restaurant"),
                ("C", "They require staff to work long hours"),
            ], "A", sectionRange="Questions 11 – 14",
               sectionInstruction="Choose the correct letter A, B or C.",
               sectionTitle="Working at a holiday park restaurant"),
            mc(12, "What does the manager say about the restaurant?", [
                ("A", "Its location is convenient for staff"),
                ("B", "It is busier at weekends than on weekdays"),
                ("C", "It caters mainly for tourists"),
            ], "A"),
            mc(13, "What does the manager say about the head chef?", [
                ("A", "He is leaving soon"),
                ("B", "He produces ambitious menus"),
                ("C", "He is taking a short break"),
            ], "C"),
            mc(14, "What does the manager say about the assistant chef?", [
                ("A", "He is unwilling to work overtime"),
                ("B", "He dislikes working with the head chef"),
                ("C", "He helps the head chef when needed"),
            ], "C"),
            *choose_two(15, 16,
                        "Which TWO things are new staff expected to do on their first day?",
                        [("A", "report any changes in their personal details"),
                         ("B", "request things they need for the job"),
                         ("C", "make sure they do not contaminate food"),
                         ("D", "prevent customers from taking photographs"),
                         ("E", "work in any area of the restaurant")],
                        "A/E", "Báo cáo thông tin (A) và làm mọi khu vực (E).",
                        sectionRange="Questions 15 – 16",
                        sectionInstruction="Choose TWO letters, A–E."),
            match(17, "Barry", list("ABCDEFG"), "F", labeled=duty_opts,
                  sectionRange="Questions 17 – 20",
                  sectionInstruction="What responsibility does each person have? Choose FOUR answers A–G."),
            match(18, "Jo", list("ABCDEFG"), "C", labeled=duty_opts),
            match(19, "Kim", list("ABCDEFG"), "D", labeled=duty_opts),
            match(20, "Mark", list("ABCDEFG"), "B", labeled=duty_opts),
        ],
    )


def cam12_t1_p3():
    return part(
        3, 21, 30,
        "Questions 21–23: Choose A, B or C. Questions 24–30: Complete the notes. Write ONE WORD ONLY.",
        [
            mc(21, "What do the students agree about libraries in the 21st century?", [
                ("A", "They have to adapt to meet new requirements"),
                ("B", "They should maintain their traditional function"),
                ("C", "They ought to have been replaced by now"),
            ], "B", sectionRange="Questions 21 – 23",
               sectionInstruction="Choose the correct letter A, B or C.",
               sectionTitle="Public libraries research project"),
            mc(22, "The students disagree about whether free digitalised books", [
                ("A", "take a long time to read"),
                ("B", "are difficult to read"),
                ("C", "are generally old"),
            ], "C"),
            mc(23, "The students agree that in future libraries will", [
                ("A", "maintain their traditional function"),
                ("B", "become centres for local communities"),
                ("C", "not contain any books"),
            ], "C"),
            gap(24, "Need to calculate:", "budget", word_limit=1,
                sectionRange="Questions 24 – 30",
                sectionInstruction="Complete the notes below. Write ONE WORD ONLY for each answer."),
            gap(25, "Create more:", "employment"),
            gap(26, "Improve:", "safety"),
            gap(27, "Need:", "insurance"),
            gap(28, "Keep a:", "diary"),
            gap(29, "Create a:", "database"),
            gap(30, "Visit the:", "museum"),
        ],
        notePassage=[
            np_static("Need to calculate the"), np_gap(24),
            np_static("Create more"), np_gap(25),
            np_static("Improve"), np_gap(26),
            np_static("Need"), np_gap(27),
            np_static("Keep a"), np_gap(28),
            np_static("Create a"), np_gap(29),
            np_static("Visit the"), np_gap(30),
        ],
    )


def cam12_t1_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "Can cause:", "damage", sectionTitle="Managing innovation in companies"),
            gap(32, "Unexpected:", "side effects"),
            gap(33, "Act as a:", "bridge"),
            gap(34, "Cause:", "confusion"),
            gap(35, "Use a:", "smartphone"),
            gap(36, "Poor use of company:", "resources"),
            gap(37, "Some meetings are:", "unnecessary/not necessary", word_limit=2),
            gap(38, "Design for a:", "chocolate bar", word_limit=2),
            gap(39, "Identify a:", "problem"),
            gap(40, "Increase:", "market share", word_limit=2),
        ],
        passageTitle="Managing innovation in companies",
        notePassage=[
            np_static("Innovation can cause"), np_gap(31),
            np_static("Unexpected"), np_gap(32),
            np_static("Innovation can act as a"), np_gap(33),
            np_static("Can cause"), np_gap(34),
            np_static("Use a"), np_gap(35), np_static("to record ideas"),
            np_static("Poor use of company"), np_gap(36),
            np_static("Some meetings are"), np_gap(37),
            np_static("Design for a"), np_gap(38),
            np_static("Need to identify a"), np_gap(39),
            np_static("Aim to increase"), np_gap(40),
        ],
    )


# ── Cam12 Test 2 (Book Test 6) ───────────────────────────────────────────────

def cam12_t2_p1():
    return part(
        1, 1, 10,
        "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "Festival begins at:", "2.45", sectionTitle="Events during Kenton Festival"),
            gap(2, "A:", "band", gapLead="A"),
            gap(3, "Talk about a:", "play", word_limit=1),
            gap(4, "Helen Tungate is a:", "scientist"),
            gap(5, "Display across the:", "river"),
            gap(6, "In the:", "grandparents", word_limit=1),
            gap(7, "Sunday events in:", "handsworth"),
            gap(8, "Type of dance:", "traditional"),
            gap(9, "Performance location:", "outdoor"),
            gap(10, "Design a:", "logo"),
        ],
        notePassageLayout="form",
        notePassage=[
            np_static("Saturday 9th May"),
            np_static("Friday (first day), starting at"), np_gap(1), np_static("pm"),
            np_static("Mayor will make a speech"),
            np_static("A"), np_gap(2), np_static("will perform"),
            np_static("Talk in the form of a"), np_gap(3), np_static("about Helen Tungate, a"), np_gap(4),
            np_static("Artworks display situated across the"), np_gap(5),
            np_static("In the"), np_gap(6), np_static("area"),
            np_static("Sunday events in"), np_gap(7),
            np_static("Type of dance:"), np_gap(8),
            np_static("Performance location:"), np_gap(9),
            np_static("Design a"), np_gap(10), np_static("for the festival"),
        ],
    )


def cam12_t2_p2():
    play_opts = [
        ("A", "The play will be performed inside a historic building."),
        ("B", "The play will be accompanied by live music."),
        ("C", "The play will be performed outdoors."),
        ("D", "The play will be performed for the first time."),
        ("E", "The performance will be attended by officials from the town."),
        ("F", "The play will be performed by university students."),
        ("G", "The play will be performed in the open-air theatre."),
    ]
    return part(
        2, 11, 20,
        "Questions 11–15: Choose A, B or C. Questions 16–20: Matching A–G.",
        [
            mc(11, "What does the speaker say about the accommodation at the hotel?", [
                ("A", "It is in the city centre"),
                ("B", "It is next to the National Theatre"),
                ("C", "It is a long way from the airport"),
            ], "B", sectionRange="Questions 11 – 15",
               sectionInstruction="Choose the correct letter A, B or C.",
               sectionTitle="Theatre trip to Munich"),
            mc(12, "How much will they pay per night for a double room?", [
                ("A", "110 euros"), ("B", "120 euros"), ("C", "150 euros"),
            ], "C"),
            mc(13, "What will they do on Tuesday evening?", [
                ("A", "go to a restaurant"), ("B", "attend a play"), ("C", "have a meeting"),
            ], "A"),
            mc(14, "What does the speaker say about the restaurant on Wednesday?", [
                ("A", "It is near the hotel"), ("B", "It serves local food"), ("C", "It is expensive"),
            ], "B"),
            mc(15, "What does the speaker say about the play on Wednesday afternoon?", [
                ("A", "It is a comedy"), ("B", "It is for children"), ("C", "It is a new production"),
            ], "C"),
            match(16, "The Visit", list("ABCDEFG"), "F", labeled=play_opts,
                  sectionRange="Questions 16 – 20",
                  sectionInstruction="What does the speaker say about each play? Choose FIVE answers A–G."),
            match(17, "The Emporium", list("ABCDEFG"), "B", labeled=play_opts),
            match(18, "Sun and Moon", list("ABCDEFG"), "E", labeled=play_opts),
            match(19, "Fire and Flood", list("ABCDEFG"), "G", labeled=play_opts),
            match(20, "Silas Marner", list("ABCDEFG"), "C", labeled=play_opts),
        ],
    )


def cam12_t2_p3():
    source_opts = [
        ("A", "a book containing a short biography of the playwright"),
        ("B", "an essay analysing a play by Shakespeare"),
        ("C", "a documentary about the history of the theatre"),
        ("D", "a play written by a 19th century playwright"),
        ("E", "an essay analysing the role of women in a play"),
        ("F", "a textbook"),
        ("G", "a documentary"),
    ]
    return part(
        3, 21, 30,
        "Questions 21–25: Choose A, B or C. Questions 26–30: Matching A–G.",
        [
            mc(21, "Why does James want to do a graduate course?", [
                ("A", "to improve his employment prospects"),
                ("B", "to update his qualifications"),
                ("C", "to help him set up his own business"),
            ], "C", sectionRange="Questions 21 – 25",
               sectionInstruction="Choose the correct letter A, B or C.",
               sectionTitle="James's literature paper"),
            mc(22, "What does James say about his future career?", [
                ("A", "He'd like to work in the media"),
                ("B", "He'd like to be a translator"),
                ("C", "He hasn't decided yet"),
            ], "B"),
            mc(23, "What is James's opinion of the literature paper this term?", [
                ("A", "It is too theoretical"),
                ("B", "It is too narrow in scope"),
                ("C", "It is too challenging"),
            ], "C"),
            mc(24, "What does Beth advise James about his paper?", [
                ("A", "He should do a general overview"),
                ("B", "He should focus on one playwright"),
                ("C", "He should read more 19th century plays"),
            ], "A"),
            mc(25, "What does James decide to do about his paper?", [
                ("A", "write about Scandinavian novels"),
                ("B", "write about 19th century playwrights"),
                ("C", "write about a specific genre"),
            ], "C"),
            match(26, "What James will read", list("ABCDEFG"), "E", labeled=source_opts,
                  sectionRange="Questions 26 – 30",
                  sectionInstruction="What will each student use as a source? Choose FIVE answers A–G."),
            match(27, "What James will borrow from Beth", list("ABCDEFG"), "G", labeled=source_opts),
            match(28, "What Beth will use", list("ABCDEFG"), "D", labeled=source_opts),
            match(29, "What James will use for his title", list("ABCDEFG"), "C", labeled=source_opts),
            match(30, "What Beth will read", list("ABCDEFG"), "A", labeled=source_opts),
        ],
    )


def cam12_t2_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "Topic:", "bullying", sectionTitle="Conflict at work"),
            gap(32, "Sense of:", "superiority"),
            gap(33, "Due to:", "personality"),
            gap(34, ":", "structural"),
            gap(35, "Can cause:", "absence"),
            gap(36, "Lack of:", "confidence"),
            gap(37, "Different:", "visions"),
            gap(38, "More:", "democratic"),
            gap(39, "Show:", "respect"),
            gap(40, "Use a:", "mediator"),
        ],
        passageTitle="Conflict at work",
        notePassage=[
            np_static("Workplace conflicts: people more concerned about"), np_gap(31),
            np_static("Can cause a sense of"), np_gap(32),
            np_static("Due to differences in"), np_gap(33),
            np_static("Also"), np_gap(34), np_static("factors"),
            np_static("Can cause"), np_gap(35), np_static("and anxiety"),
            np_static("Lack of"), np_gap(36),
            np_static("Between people who have different"), np_gap(37),
            np_static("More"), np_gap(38), np_static("management may help"),
            np_static("Show"), np_gap(39),
            np_static("Use a"), np_gap(40),
        ],
    )


# ── Cam12 Test 3 (Book Test 7) ───────────────────────────────────────────────

def cam12_t3_p1():
    return part(
        1, 1, 10,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(1, "Books on:", "travel/travel(l)ing", sectionTitle="PUBLIC LIBRARY"),
            gap(2, "Local:", "history"),
            gap(3, "Also possible to:", "study"),
            gap(4, "Books for:", "teenagers"),
            gap(5, "Science club in:", "kitchen"),
            gap(6, "Book club topic:", "crime"),
            gap(7, "Need:", "appointment/booking", word_limit=2),
            gap(8, "Bring:", "sugar"),
            gap(9, "Collect:", "stamps"),
            gap(10, ":", "parking"),
        ],
        notePassageLayout="form",
        notePassage=[
            np_static("Example\nName: …Jones…"),
            np_static("Registration for books on"), np_gap(1),
            np_static("Local"), np_gap(2),
            np_static("Room for meetings (also possible to"), np_gap(3), np_static(")"),
            np_static("Books for"), np_gap(4),
            np_static("Science Club meeting: experiments using things found in the"), np_gap(5),
            np_static("Crime Book Club — topic:"), np_gap(6),
            np_static("Need"), np_gap(7), np_static("for talks"),
            np_static("Bring"), np_gap(8), np_static("for experiments"),
            np_static("Collect"), np_gap(9),
            np_static("Free"), np_gap(10),
        ],
    )


def cam12_t3_p2():
    return part(
        2, 11, 20,
        "Questions 11–14: Choose TWO A–E. Questions 15–17: Choose A, B or C. Questions 18–20: Complete notes.",
        [
            *choose_two(11, 12,
                        "What are the TWO main reasons given for the popularity of activity holidays?",
                        [("A", "making new friends"), ("B", "learning a useful skill"),
                         ("C", "learning about a different culture"), ("D", "excitement of risk involved"),
                         ("E", "good value for money")],
                        "D/E", "Rủi ro (D) và giá trị (E).",
                        sectionRange="Questions 11 – 12",
                        sectionInstruction="Choose TWO letters, A–E.",
                        sectionTitle="Activity holidays"),
            *choose_two(13, 14,
                        "Which TWO things does the speaker say are important for mountain biking?",
                        [("A", "good level of fitness"), ("B", "ability to swim"),
                         ("C", "good eyesight"), ("D", "no heart problems"),
                         ("E", "no allergies")],
                        "A/C", "Thể lực (A) và thị lực (C)."),
            mc(15, "What does the speaker say about the hostel?", [
                ("A", "It is in the town centre"), ("B", "It is newly renovated"), ("C", "It is near the river"),
            ], "C", sectionRange="Questions 15 – 17",
               sectionInstruction="Choose the correct letter A, B or C."),
            mc(16, "What does the speaker say about the food?", [
                ("A", "It is included in the price"), ("B", "It is not very good"), ("C", "It is vegetarian only"),
            ], "B"),
            mc(17, "What does the speaker say about the instructors?", [
                ("A", "They are very experienced"), ("B", "They are very friendly"), ("C", "They are very strict"),
            ], "A"),
            gap(18, "Need to improve:", "stress", word_limit=1,
                sectionRange="Questions 18 – 20",
                sectionInstruction="Complete the notes below. Write ONE WORD ONLY for each answer."),
            gap(19, "Lose:", "weight", word_limit=1),
            gap(20, "Spend time with:", "families", word_limit=1),
        ],
        notePassage=[
            np_static("Participants want to improve"), np_gap(18),
            np_static("and lose"), np_gap(19),
            np_static("and spend time with"), np_gap(20),
        ],
    )


def cam12_t3_p3():
    flow_opts = [
        ("A", "read relevant articles"),
        ("B", "decide on research methods"),
        ("C", "choose interviewees"),
        ("D", "collect data"),
        ("E", "analyse results"),
        ("F", "write report"),
        ("G", "give presentation"),
        ("H", "design questionnaire"),
    ]
    return part(
        3, 21, 30,
        "Questions 21–30: Matching A–H.",
        [
            match(21, "Read relevant articles", list("ABCDEFGH"), "C", labeled=flow_opts,
                  sectionTitle="Steps in doing a tourism case study research"),
            match(22, "Identify interviewees", list("ABCDEFGH"), "E", labeled=flow_opts),
            match(23, "City", list("ABCDEFGH"), "H", labeled=flow_opts),
            match(24, "Whether age of interviewee", list("ABCDEFGH"), "B", labeled=flow_opts),
            match(25, "Identify a problem", list("ABCDEFGH"), "A", labeled=flow_opts),
            match(26, "Carry out interviews", list("ABCDEFGH"), "F", labeled=flow_opts),
            match(27, "Investment costs", list("ABCDEFGH"), "A", labeled=flow_opts),
            match(28, "Planning restrictions", list("ABCDEFGH"), "C", labeled=flow_opts),
            match(29, "Unemployment in Hortown", list("ABCDEFGH"), "B", labeled=flow_opts),
            match(30, "Prevent damage to caves", list("ABCDEFGH"), "B", labeled=flow_opts),
        ],
    )


def cam12_t3_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "Mercury comes from:", "insects", sectionTitle="Effects of mercury on birds"),
            gap(32, "Affects birds':", "behaviour/behavior"),
            gap(33, "Usually learned from a bird's:", "father"),
            gap(34, "Mercury is:", "complex/complicated"),
            gap(35, "Negative effect on:", "reproduction/breeding"),
            gap(36, "Need:", "control"),
            gap(37, "Effect on:", "duck/ducks"),
            gap(38, "Effect on:", "language"),
            gap(39, "Effect on:", "food"),
            gap(40, ":", "cost/costs/price/prices/bill/bills"),
        ],
        passageTitle="Effects of mercury on birds",
        notePassage=[
            np_static("Mercury in the atmosphere from coal can be consumed by fish"),
            np_static("Recently found to affect birds which feed on"), np_gap(31),
            np_static("Clamos is investigating effects on birds'"), np_gap(32),
            np_static("Effects on bird song (usually learned from a bird's"), np_gap(33), np_static(")"),
            np_static("Mercury is"), np_gap(34),
            np_static("Can have a negative effect on birds'"), np_gap(35),
            np_static("Need"), np_gap(36), np_static("for the experimenter"),
            np_static("Effects on"), np_gap(37),
            np_static("Effects on"), np_gap(38),
            np_static("Effects on"), np_gap(39),
            np_static("Effects on"), np_gap(40),
        ],
    )


# ── Cam12 Test 4 (Book Test 8) ───────────────────────────────────────────────

def cam12_t4_p1():
    return part(
        1, 1, 10,
        "Complete the form below. Write ONE WORD AND/OR A NUMBER for each answer.",
        [
            gap(1, "Job type:", "temporary", sectionTitle="Tour leader: Applicant Smith"),
            gap(2, "Also works as a:", "doctor"),
            gap(3, "Trips in:", "africa"),
            gap(4, "Voluntary work with:", "youth"),
            gap(5, "From 1st of:", "may"),
            gap(6, "Can eat:", "cheese"),
            gap(7, "Name:", "arbuthnot"),
            gap(8, "Postcode:", "dg7 4ph"),
            gap(9, "Interview on:", "tuesday"),
            gap(10, "Give a:", "talk/presentation", word_limit=2),
        ],
        notePassageLayout="form",
        notePassage=[
            np_static("Example\nName: Smith"),
            np_static("Type of job applied for:"), np_gap(1),
            np_static("Currently works as a tour leader"),
            np_static("Also works as a"), np_gap(2),
            np_static("Leads trips in"), np_gap(3),
            np_static("Being a leader of a cycling trip for families"),
            np_static("Doing voluntary work with members of a"), np_gap(4), np_static("group"),
            np_static("Five months from the 1st of"), np_gap(5),
            np_static("Can eat"), np_gap(6),
            np_static("Reference: Mr"), np_gap(7),
            np_static("Postcode:"), np_gap(8),
            np_static("Interview on"), np_gap(9),
            np_static("Will give a"), np_gap(10),
        ],
    )


def cam12_t4_p2():
    letters = list("ABCDEFGHI")
    return part(
        2, 11, 20,
        "Questions 11–14: Choose A, B or C. Questions 15–20: Label the map A–I.",
        [
            mc(11, "The speaker recommends the side streets in the Sheepmarket for their", [
                ("A", "international restaurants"), ("B", "historical buildings"), ("C", "arts and crafts"),
            ], "A", sectionRange="Questions 11 – 14",
               sectionInstruction="Choose the correct letter A, B or C.",
               sectionTitle="Sheepmarket area"),
            mc(12, "Which is the most rapidly growing sector of the Sheepmarket?", [
                ("A", "antique shops"), ("B", "tea rooms"), ("C", "art galleries"),
            ], "C"),
            mc(13, "The speaker recommends the side streets for their", [
                ("A", "unique jewellery"), ("B", "local produce"), ("C", "hand-made clothing"),
            ], "B"),
            mc(14, "What does the speaker say about parking?", [
                ("A", "A standard price is charged"), ("B", "It is free on Sundays"),
                ("C", "Some car parks are free in the evenings"),
            ], "B"),
            map_label(15, "New apartments", letters, "H",
                      sectionRange="Questions 15 – 20",
                      sectionInstruction="Label the map below. Write the correct letter A–I.",
                      sectionTitle="Sheepmarket"),
            map_label(16, "Workshop", letters, "C"),
            map_label(17, "Library", letters, "F"),
            map_label(18, "Sports centre", letters, "G"),
            map_label(19, "Café", letters, "I"),
            map_label(20, "New shops", letters, "B"),
        ],
        imageFile="map.jpg",
    )


def cam12_t4_p3():
    task_opts = [
        ("A", "Read and take notes on the relevant sections of the textbook"),
        ("B", "Prepare some slides for a presentation"),
        ("C", "Do further research on the internet"),
        ("D", "Write the first draft of the essay"),
        ("E", "Summarise the main points made in the lecture"),
        ("F", "Organise the notes"),
        ("G", "No further work needed"),
    ]
    return part(
        3, 21, 30,
        "Questions 21–24: Complete the flow-chart. Write ONE WORD ONLY. Questions 25–30: Matching A–G.",
        [
            gap(21, "Step:", "classification", word_limit=1,
                sectionTitle="Theatre Studies assignment"),
            gap(22, "Rate films as:", "worst", word_limit=1),
            gap(23, "Prepare:", "slides", word_limit=1),
            gap(24, "Discuss:", "issues", word_limit=1),
            match(25, "Background reading", list("ABCDEFG"), "F", labeled=task_opts,
                  sectionRange="Questions 25 – 30",
                  sectionInstruction="What task will each student do? Choose SIX answers A–G."),
            match(26, "Class notes", list("ABCDEFG"), "A", labeled=task_opts),
            match(27, "Own ideas", list("ABCDEFG"), "E", labeled=task_opts),
            match(28, "Prepare same presentation", list("ABCDEFG"), "C", labeled=task_opts),
            match(29, "Essay plan", list("ABCDEFG"), "G", labeled=task_opts),
            match(30, "Final version", list("ABCDEFG"), "B", labeled=task_opts),
        ],
        notePassage=[
            np_static("Step 1:"), np_gap(21),
            np_static("Step 2: rate films as"), np_gap(22),
            np_static("Step 3: prepare"), np_gap(23),
            np_static("Step 4: discuss"), np_gap(24),
        ],
    )


def cam12_t4_p4():
    return part(
        4, 31, 40,
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
        [
            gap(31, "Highest noise levels on:", "garden/gardens", sectionTitle="Noise in cities"),
            gap(32, "Noise is a:", "political"),
            gap(33, "Affects:", "work/study"),
            gap(34, "Pleasant sound e.g. a:", "fountain"),
            gap(35, ":", "social"),
            gap(36, "Environments which are:", "lively"),
            gap(37, "Need:", "training"),
            gap(38, ":", "culture"),
            gap(39, ":", "nature"),
            gap(40, "Areas should be:", "silent"),
        ],
        passageTitle="Noise in cities",
        notePassage=[
            np_static("Highest noise levels are usually found on residential streets near"), np_gap(31),
            np_static("Noise is a"), np_gap(32), np_static("issue"),
            np_static("Affects people's ability to"), np_gap(33),
            np_static("Some sounds considered pleasant e.g. a"), np_gap(34),
            np_static("Consider"), np_gap(35), np_static("aspects of noise"),
            np_static("Urban environments which are"), np_gap(36),
            np_static("Researchers need"), np_gap(37),
            np_static("Consider"), np_gap(38), np_static("differences in perception"),
            np_static("Protect"), np_gap(39), np_static("sounds"),
            np_static("Some areas should be"), np_gap(40),
        ],
    )


# ── Test registry ────────────────────────────────────────────────────────────

TESTS = [
    {
        "folder": "Listening IELTS_Test1_Cam11", "cambridge": 11, "test": 1,
        "title": "IELTS Listening — Cambridge 11 Test 1",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam11_t1_p1},
            {"partNumber": 2, "template": "p2-a6", "file": "exam_part2.json", "build": cam11_t1_p2},
            {"partNumber": 3, "template": "p3-c4", "file": "exam_part3.json", "build": cam11_t1_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam11_t1_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test2_Cam11", "cambridge": 11, "test": 2,
        "title": "IELTS Listening — Cambridge 11 Test 2",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam11_t2_p1},
            {"partNumber": 2, "template": "p2-a13", "file": "exam_part2.json", "build": cam11_t2_p2},
            {"partNumber": 3, "template": "p3-c3", "file": "exam_part3.json", "build": cam11_t2_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam11_t2_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test3_Cam11", "cambridge": 11, "test": 3,
        "title": "IELTS Listening — Cambridge 11 Test 3",
        "parts": [
            {"partNumber": 1, "template": "p1-a5", "file": "exam_part1.json", "build": cam11_t3_p1},
            {"partNumber": 2, "template": "p2-a11", "file": "exam_part2.json", "build": cam11_t3_p2},
            {"partNumber": 3, "template": "p3-c2", "file": "exam_part3.json", "build": cam11_t3_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam11_t3_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test4_Cam11", "cambridge": 11, "test": 4,
        "title": "IELTS Listening — Cambridge 11 Test 4",
        "parts": [
            {"partNumber": 1, "template": "p1-a4", "file": "exam_part1.json", "build": cam11_t4_p1},
            {"partNumber": 2, "template": "p2-a11", "file": "exam_part2.json", "build": cam11_t4_p2},
            {"partNumber": 3, "template": "p3-c3", "file": "exam_part3.json", "build": cam11_t4_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam11_t4_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test1_Cam12", "cambridge": 12, "test": 1,
        "title": "IELTS Listening — Cambridge 12 Test 1",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam12_t1_p1},
            {"partNumber": 2, "template": "p2-a13", "file": "exam_part2.json", "build": cam12_t1_p2},
            {"partNumber": 3, "template": "p3-c1", "file": "exam_part3.json", "build": cam12_t1_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam12_t1_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test2_Cam12", "cambridge": 12, "test": 2,
        "title": "IELTS Listening — Cambridge 12 Test 2",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam12_t2_p1},
            {"partNumber": 2, "template": "p2-a11", "file": "exam_part2.json", "build": cam12_t2_p2},
            {"partNumber": 3, "template": "p3-c6", "file": "exam_part3.json", "build": cam12_t2_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam12_t2_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test3_Cam12", "cambridge": 12, "test": 3,
        "title": "IELTS Listening — Cambridge 12 Test 3",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam12_t3_p1},
            {"partNumber": 2, "template": "p2-a10", "file": "exam_part2.json", "build": cam12_t3_p2},
            {"partNumber": 3, "template": "p3-c6", "file": "exam_part3.json", "build": cam12_t3_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam12_t3_p4},
        ],
    },
    {
        "folder": "Listening IELTS_Test4_Cam12", "cambridge": 12, "test": 4,
        "title": "IELTS Listening — Cambridge 12 Test 4",
        "parts": [
            {"partNumber": 1, "template": "p1-a3", "file": "exam_part1.json", "build": cam12_t4_p1},
            {"partNumber": 2, "template": "p2-a12", "file": "exam_part2.json", "build": cam12_t4_p2},
            {"partNumber": 3, "template": "p3-c7", "file": "exam_part3.json", "build": cam12_t4_p3},
            {"partNumber": 4, "template": "p4-d2", "file": "exam_part4.json", "build": cam12_t4_p4},
        ],
    },
]


def main():
    print("Building IELTS Listening Cam11 T1–T4 + Cam12 T1–T4…\n")
    grand_total = 0
    for spec in TESTS:
        meta = {
            "version": 1,
            "cambridge": spec["cambridge"],
            "test": spec["test"],
            "title": spec["title"],
            "bandHint": (
                f"IELTS · Cambridge {spec['cambridge']} · Test {spec['test']} · "
                "4 parts · 40 câu"
            ),
            "examType": "ielts",
            "examMode": "practice",
            "durationMinutes": 30,
            "audioFile": "listening.mp3",
            "parts": spec["parts"],
        }
        parts = {p["partNumber"]: p["build"]() for p in spec["parts"]}
        grand_total += write_test(spec["folder"], meta, parts)

    print("\nExtracting map images…")
    for folder, pdf_name, page_idx in MAP_IMAGES:
        pdf = IELTS / folder / pdf_name
        out = IELTS / folder / "map.jpg"
        if pdf.exists():
            extract_map_image(pdf, page_idx, out)

    print(f"\nDone — {len(TESTS)} tests, {grand_total} question-slots written.")
    print("Next: pnpm ielts:validate / ielts:pack for each folder.")


if __name__ == "__main__":
    main()