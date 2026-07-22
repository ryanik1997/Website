#!/usr/bin/env python3
"""
Generate unique IELTS Listening HTML mocks from exam_partN.json (primary) or exam.json.

Renders: notePassage (form/lecture), noteTable/noteTables, section headers,
MC / Choose TWO / map labeling / flow-chart / diagram, images (map.jpg, diagram.jpg).
"""
from __future__ import annotations

import json
import re
import sys
from html import escape
from pathlib import Path

TEMPLATE_PATH = Path("assets/ielts-listening-template_Test1_Cam9.html")
BASE_IELTS = Path("Tainguyen/IELTS")
PDF_TXT_DIR = Path("Tainguyen/PDF to HTML")

TEMPLATE = TEMPLATE_PATH.read_text(encoding="utf-8")

EXTRA_STYLES = """
        .exam-table { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 1.5rem; }
        .exam-table th, .exam-table td { border: 1px solid #374151; padding: 8px 10px; vertical-align: top; }
        .exam-table thead th { background: #f3f4f6; font-weight: 600; text-align: left; }
        .map-image, .diagram-image { display: block; max-width: 100%; margin: 1rem auto; border: 1px solid #d1d5db; }
        .section-subheader { font-weight: 600; margin: 1.25rem 0 0.75rem; font-size: 15px; }
        .section-subinstruction { font-size: 14px; font-weight: normal; color: #374151; }
        .flow-step { display: flex; align-items: baseline; flex-wrap: wrap; gap: 6px; margin-bottom: 4px; font-size: 15px; }
        .flow-arrow { text-align: center; color: #6b7280; font-size: 18px; margin: 2px 0 6px 24px; }
        .option-box { border: 1px solid #374151; padding: 12px 16px; margin-bottom: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 4px 20px; font-size: 14px; }
        .option-box-item { display: flex; gap: 6px; }
        .option-box-letter { font-weight: 700; min-width: 18px; }
        .map-label-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; font-size: 15px; }
        .letter-input { width: 40px; border: none; border-bottom: 2px solid #4b5563; text-align: center; font-weight: 700; font-size: 15px; outline: none; }
        .cell-line { display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px; }
        .cell-break { display: block; height: 6px; }
        .example-badge { margin-left: 8px; font-size: 12px; color: #059669; font-weight: 600; }
"""

# ---------------------------------------------------------------------------
# Data loading
# ---------------------------------------------------------------------------

def get_part_data(folder: Path, part_num: int) -> dict | None:
    part_file = folder / f"exam_part{part_num}.json"
    if part_file.exists():
        try:
            return json.loads(part_file.read_text(encoding="utf-8"))
        except Exception:
            pass
    exam = folder / "exam.json"
    if exam.exists():
        try:
            data = json.loads(exam.read_text(encoding="utf-8"))
            for p in data.get("parts", []):
                if p.get("partNumber") == part_num:
                    return p
        except Exception:
            pass
    return None


def load_exam_parts(folder: Path) -> list[dict]:
    parts = []
    for n in range(1, 5):
        p = get_part_data(folder, n)
        if p:
            parts.append(p)
    if parts:
        return sorted(parts, key=lambda x: x.get("partNumber", 0))
    if (folder / "exam.json").exists():
        try:
            data = json.loads((folder / "exam.json").read_text(encoding="utf-8"))
            return sorted(data.get("parts", []), key=lambda x: x.get("partNumber", 0))
        except Exception:
            pass
    return []


# ---------------------------------------------------------------------------
# Block rendering helpers
# ---------------------------------------------------------------------------

def is_bullet_start(text: str) -> bool:
    t = (text or "").strip()
    return t.startswith("• ") or t.startswith("– ") or t.startswith("- ")


def is_short_continuation(text: str) -> bool:
    s = (text or "").strip()
    if not s or len(s) > 48:
        return False
    if is_bullet_start(s):
        return False
    if ":" in s[:20]:
        return False
    return True


def render_gap_input(number: int | str, width: str = "") -> str:
    w = f' style="min-width:{width}"' if width else ""
    return (
        f'<span class="question-number">{number}</span>'
        f'<input type="text" class="answer-input"{w} placeholder="________________">'
    )


def render_cell_blocks(blocks: list) -> str:
    """Inline blocks inside a table cell (static + gap + break)."""
    if not blocks:
        return ""
    parts: list[str] = []
    for b in blocks:
        t = b.get("type")
        if t == "static":
            parts.append(f'<span>{escape((b.get("text") or "").strip())}</span>')
        elif t == "gap":
            parts.append(render_gap_input(b.get("number", ""), "80px"))
        elif t == "break":
            parts.append('<span class="cell-break"></span>')
    return f'<div class="cell-line">{"".join(parts)}</div>'


def render_table(table: dict) -> str:
    headers = table.get("headers") or []
    rows = table.get("rows") or []
    if not headers and not rows:
        return ""

    out = ['<table class="exam-table">']
    if headers:
        out.append("<thead><tr>")
        for h in headers:
            out.append(f'<th>{escape(str(h))}</th>')
        out.append("</tr></thead>")
    out.append("<tbody>")
    for row in rows:
        out.append("<tr>")
        for cell_blocks in row.get("cells") or []:
            out.append(f"<td>{render_cell_blocks(cell_blocks)}</td>")
        out.append("</tr>")
    out.append("</tbody></table>")
    return "\n".join(out)


def render_note_tables(tables: list) -> str:
    out = []
    for tbl in tables:
        title = tbl.get("sectionTitle") or ""
        instr = tbl.get("instruction") or ""
        if title:
            out.append(f'<div class="text-center mb-3"><span class="font-extrabold text-lg tracking-wide">{escape(title)}</span></div>')
        if instr:
            for line in instr.split("\n"):
                line = line.strip()
                if line:
                    out.append(f'<p class="section-subinstruction mb-2">{escape(line)}</p>')
        out.append(render_table(tbl))
    return "\n".join(out)


def render_form_blocks(blocks: list) -> str:
    """Part 1 form layout — form-row + bullets like the reference template."""
    if not blocks:
        return ""
    out = []
    i = 0
    n = len(blocks)

    while i < n:
        b = blocks[i]
        t = b.get("type")

        if t == "example":
            text = (b.get("text") or "").strip().lstrip("•–- ").strip()
            if ":" in text:
                label, value = text.split(":", 1)
                label = label.strip()
                value = value.strip()
            else:
                label, value = text, ""
            out.append(
                f'<div class="form-row mb-3">'
                f'<div class="form-label font-medium">• {escape(label)}:</div>'
                f'<div class="flex-1">'
                f'<span class="text-gray-700">{escape(value)}</span>'
                f'<span class="example-badge">(Example)</span></div></div>'
            )
            i += 1
            continue

        if t == "section":
            out.append(f'<div class="font-semibold mt-2 mb-1">{escape(b.get("text", ""))}</div>')
            i += 1
            continue

        if t == "static":
            text = (b.get("text") or "").strip()
            if not text:
                i += 1
                continue

            # Collect inline line: static + gap(s) + short tails
            if is_bullet_start(text):
                prefix = text[0]
                content = text[1:].lstrip()
                indent = ' style="margin-left:1.25rem"' if prefix in "–-" else ""
                line = f'<div class="bullet-item"{indent}><span class="mr-2">{prefix}</span>'
                line += f'<span>{escape(content)}</span>'
                close = "</div>"
            elif ":" in text[:30] and not text.endswith(":"):
                # label: value on same conceptual row
                line = (
                    f'<div class="form-row"><div class="form-label">{escape(text)}</div>'
                    f'<div class="flex-1 flex items-center flex-wrap">'
                )
                close = "</div></div>"
            elif text.endswith(":") or text in ("Extra benefits:", "Qualities required:"):
                out.append(f'<div class="mt-2 mb-1 font-medium">• {escape(text)}</div>')
                i += 1
                continue
            else:
                line = f'<div class="exam-text mb-1" style="display:flex;align-items:baseline;flex-wrap:wrap;gap:4px;">{escape(text)}'
                close = "</div>"

            j = i + 1
            while j < n:
                nb = blocks[j]
                if nb.get("type") == "gap":
                    line += render_gap_input(nb.get("number", ""), "120px")
                    j += 1
                    if j < n and blocks[j].get("type") == "static":
                        tl = blocks[j].get("text", "")
                        if is_short_continuation(tl):
                            line += f'<span class="ml-1 text-gray-600">{escape(tl.strip())}</span>'
                            j += 1
                    if j >= n or blocks[j].get("type") != "gap":
                        break
                    continue
                if nb.get("type") == "static":
                    nt = nb.get("text", "")
                    if is_short_continuation(nt):
                        line += f'<span>{escape(nt.strip())}</span>'
                        j += 1
                        continue
                    break
                break

            out.append(line + close)
            i = j
            continue

        if t == "gap":
            out.append(f'<div class="bullet-item">{render_gap_input(b.get("number", ""))}</div>')
            i += 1
            continue

        i += 1

    return "\n".join(out)


def render_lecture_blocks(blocks: list) -> str:
    """Part 4 lecture notes — bullets + sections + inline gaps."""
    if not blocks:
        return ""
    out = []
    i = 0
    n = len(blocks)

    while i < n:
        b = blocks[i]
        t = b.get("type")

        if t == "section":
            out.append(f'<div class="font-semibold mt-3 mb-1 text-sm tracking-wide">{escape(b.get("text", ""))}</div>')
            i += 1
            continue

        if t == "static":
            text = (b.get("text") or "").strip()
            if not text:
                i += 1
                continue

            if is_bullet_start(text):
                prefix = text[0]
                content = text[1:].lstrip()
                indent = ' style="margin-left:1.5rem"' if prefix in "–-" else ""
                line = f'<div class="bullet-item"{indent}><span class="mr-2">{prefix}</span><span>{escape(content)}</span>'
                close = "</div>"
            else:
                line = (
                    f'<div class="exam-text mb-1" style="display:flex;align-items:baseline;flex-wrap:wrap;gap:4px;">'
                    f'{escape(text)}'
                )
                close = "</div>"

            j = i + 1
            while j < n:
                nb = blocks[j]
                if nb.get("type") == "gap":
                    line += render_gap_input(nb.get("number", ""), "100px")
                    j += 1
                    if j < n and blocks[j].get("type") == "static":
                        tl = blocks[j].get("text", "")
                        if is_short_continuation(tl):
                            line += f'<span class="ml-1 text-gray-600">{escape(tl.strip())}</span>'
                            j += 1
                    if j >= n or blocks[j].get("type") != "gap":
                        break
                    continue
                if nb.get("type") == "static":
                    nt = nb.get("text", "")
                    if is_short_continuation(nt):
                        line += f'<span>{escape(nt.strip())}</span>'
                        j += 1
                        continue
                    break
                break

            out.append(line + close)
            i = j
            continue

        if t == "gap":
            out.append(f'<div class="bullet-item">{render_gap_input(b.get("number", ""))}</div>')
            i += 1
            continue

        i += 1

    return "\n".join(out)


def render_note_passage(part: dict) -> str:
    layout = part.get("notePassageLayout") or "form"
    blocks = list(part.get("notePassage") or [])

    for sec in part.get("notePassageSections") or []:
        if sec.get("title"):
            blocks.append({"type": "section", "text": sec["title"]})
        blocks.extend(sec.get("blocks") or [])

    if layout == "lecture":
        return render_lecture_blocks(blocks)
    return render_form_blocks(blocks)


def render_part_image(folder: Path, part: dict) -> str:
    img = part.get("imageFile")
    if not img:
        return ""
    path = folder / img
    if not path.exists():
        return ""
    cls = "diagram-image" if "diagram" in img.lower() else "map-image"
    return f'<img src="{escape(img)}" alt="" class="{cls}">'


# ---------------------------------------------------------------------------
# Question grouping & rendering
# ---------------------------------------------------------------------------

def normalize_prompt(prompt: str) -> str:
    return re.sub(r"\s*\(\d+\)\s*$", "", (prompt or "").strip())


def option_sig(options: list) -> str:
    return "|".join(f"{o.get('id')}:{o.get('label')}" for o in (options or []))


def is_choose_two_pair(q1: dict, q2: dict) -> bool:
    if q1.get("type") != "matching" or q2.get("type") != "matching":
        return False
    if normalize_prompt(q1.get("prompt", "")) != normalize_prompt(q2.get("prompt", "")):
        return False
    opts = q1.get("options") or []
    if len(opts) < 4:
        return False
    if re.search(r"which\s+two\b", q1.get("prompt", ""), re.I):
        return True
    ans = str(q1.get("answer", ""))
    return "/" in ans or "|" in ans


def is_map_label_group(qs: list) -> bool:
    if len(qs) < 2:
        return False
    if not all(q.get("type") == "matching" for q in qs):
        return False
    if any(q.get("diagramLabel") for q in qs):
        return False
    sig = option_sig(qs[0].get("options"))
    if not sig:
        return False
    if not all(option_sig(q.get("options")) == sig for q in qs):
        return False
    return any(q.get("mapLabel") for q in qs)


def is_flowchart_group(qs: list) -> bool:
    if len(qs) < 2:
        return False
    if not all(q.get("type") == "matching" for q in qs):
        return False
    return any(q.get("flowChart") for q in qs)


def is_diagram_label_group(qs: list) -> bool:
    if len(qs) < 2:
        return False
    if not all(q.get("type") == "matching" for q in qs):
        return False
    return any(q.get("diagramLabel") for q in qs)


def section_meta(q: dict) -> tuple[str, str, str]:
    return (
        q.get("sectionRange") or "",
        q.get("sectionInstruction") or "",
        q.get("sectionTitle") or "",
    )


def render_section_header(range_label: str, instruction: str, title: str = "") -> str:
    parts = []
    if range_label or instruction:
        hdr = escape(range_label) if range_label else ""
        instr = escape(instruction) if instruction else ""
        if hdr and instr:
            parts.append(
                f'<div class="section-subheader">{hdr}<br>'
                f'<span class="section-subinstruction">{instr}</span></div>'
            )
        elif hdr:
            parts.append(f'<div class="section-subheader">{hdr}</div>')
        elif instr:
            parts.append(f'<p class="section-subinstruction mb-3">{instr}</p>')
    if title:
        parts.append(
            f'<div class="text-center mb-3"><span class="font-extrabold text-lg tracking-wide">{escape(title)}</span></div>'
        )
    return "\n".join(parts)


def render_mcq(q: dict, multi: bool = False) -> str:
    num = q.get("number", "")
    prompt = escape(q.get("prompt") or "")
    opts = q.get("options") or []
    if not opts:
        return ""
    cid = f"q{num}"
    onclick = "toggleMultiOption" if multi else "selectOption"
    opt_html = []
    for o in opts:
        oid = escape(str(o.get("id", "")))
        label = escape(o.get("label", o.get("text", "")))
        opt_html.append(
            f'<div onclick="{onclick}(this, \'{cid}\')" class="option" data-value="{oid}">'
            f'<span class="option-label">{oid}</span><span>{label}</span></div>'
        )
    hint = '<p class="text-xs text-gray-500 mt-1 ml-6">Click to select (max 2)</p>' if multi else ""
    return (
        f'<div class="mb-5">'
        f'<div class="font-medium mb-2">{num} {prompt}</div>'
        f'<div class="mcq-container space-y-1" data-question="{cid}">'
        + "\n".join(opt_html) +
        f"</div>{hint}</div>"
    )


def render_choose_two_group(q1: dict, q2: dict) -> str:
    num = q1.get("number", "")
    prompt = escape(normalize_prompt(q1.get("prompt", "")))
    opts = q1.get("options") or []
    cid = f"q{num}-{q2.get('number', '')}"
    opt_html = []
    for o in opts:
        oid = escape(str(o.get("id", "")))
        label = escape(o.get("label", ""))
        opt_html.append(
            f'<div onclick="toggleMultiOption(this, \'{cid}\')" class="option" data-value="{oid}">'
            f'<span class="option-label">{oid}</span><span>{label}</span></div>'
        )
    return (
        f'<div class="mb-5">'
        f'<div class="font-medium mb-2">{num} &amp; {q2.get("number")} {prompt}</div>'
        f'<div class="mcq-container space-y-1" data-question="{cid}">'
        + "\n".join(opt_html) +
        '</div><p class="text-xs text-gray-500 mt-1 ml-6">Click to select (max 2)</p></div>'
    )


def render_option_box(options: list) -> str:
    items = []
    for o in options:
        oid = escape(str(o.get("id", "")))
        label = escape(o.get("label", ""))
        items.append(
            f'<div class="option-box-item"><span class="option-box-letter">{oid}</span><span>{label}</span></div>'
        )
    return f'<div class="option-box">{"".join(items)}</div>'


def render_flowchart_group(qs: list) -> str:
    opts = qs[0].get("options") or []
    out = [render_option_box(opts)]
    for i, q in enumerate(qs):
        num = q.get("number", "")
        lead = escape(q.get("gapLead") or q.get("prompt") or "")
        trail = escape(q.get("gapTrail") or "")
        out.append(
            f'<div class="flow-step">'
            f'<span class="question-number">{num}</span>'
            f'<input type="text" class="letter-input" maxlength="1" placeholder="_">'
            f'<span>{lead}</span>'
            f'{f"<span>{trail}</span>" if trail else ""}'
            f"</div>"
        )
        if i < len(qs) - 1:
            out.append('<div class="flow-arrow">↓</div>')
    return "\n".join(out)


def render_map_label_group(qs: list, folder: Path, part: dict) -> str:
    out = []
    img = render_part_image(folder, part)
    if img:
        out.append(img)
    for q in qs:
        num = q.get("number", "")
        prompt = escape(q.get("prompt") or "")
        out.append(
            f'<div class="map-label-row">'
            f'<span class="question-number">{num}</span>'
            f'<input type="text" class="letter-input" maxlength="1" placeholder="_">'
            f'<span>{prompt}</span></div>'
        )
    return "\n".join(out)


def render_diagram_label_group(qs: list, folder: Path, part: dict) -> str:
    return render_map_label_group(qs, folder, part)


def render_gap_standalone(q: dict) -> str:
    """Gap-fill question not represented in notePassage."""
    num = q.get("number", "")
    prompt = escape(q.get("prompt") or q.get("gapLead") or "")
    trail = escape(q.get("gapTrail") or "")
    trail_html = f'<span class="ml-2">{trail}</span>' if trail else ""
    return (
        f'<div class="form-row mb-2">'
        f'<div class="form-label">{num} {prompt}</div>'
        f'<div class="flex-1 flex items-center">'
        f'{render_gap_input(num, "160px")}'
        f'{trail_html}'
        f"</div></div>"
    )


def gap_numbers_in_part(part: dict) -> set[int]:
    nums: set[int] = set()

    def scan_blocks(blocks: list):
        for b in blocks or []:
            if b.get("type") == "gap" and b.get("number") is not None:
                nums.add(int(b["number"]))

    scan_blocks(part.get("notePassage"))
    for sec in part.get("notePassageSections") or []:
        scan_blocks(sec.get("blocks"))
    for tbl in part.get("noteTables") or []:
        for row in tbl.get("rows") or []:
            for cell in row.get("cells") or []:
                scan_blocks(cell)
    nt = part.get("noteTable")
    if nt:
        for row in nt.get("rows") or []:
            for cell in row.get("cells") or []:
                scan_blocks(cell)
    return nums


def group_questions(questions: list) -> list:
    """Split questions into renderable groups preserving order."""
    groups: list[tuple[str, list]] = []
    i = 0
    n = len(questions)

    while i < n:
        q = questions[i]

        # Choose TWO pair
        if i + 1 < n and is_choose_two_pair(q, questions[i + 1]):
            groups.append(("choose_two", [q, questions[i + 1]]))
            i += 2
            continue

        # Collect consecutive map / flowchart / diagram / letter-matching runs
        if q.get("type") == "matching":
            j = i + 1
            while j < n and questions[j].get("type") == "matching":
                if is_choose_two_pair(questions[j - 1], questions[j]):
                    break
                # same option signature or same special flag
                if option_sig(questions[j].get("options")) != option_sig(q.get("options")):
                    if not (q.get("flowChart") and questions[j].get("flowChart")):
                        break
                j += 1
            chunk = questions[i:j]
            if is_flowchart_group(chunk):
                groups.append(("flowchart", chunk))
            elif is_map_label_group(chunk):
                groups.append(("map", chunk))
            elif is_diagram_label_group(chunk):
                groups.append(("diagram", chunk))
            elif len(chunk) >= 2 and option_sig(chunk[0].get("options")) == option_sig(chunk[-1].get("options")):
                groups.append(("matching", chunk))
            else:
                groups.append(("mcq", [q]))
                i += 1
                continue
            i = j
            continue

        groups.append(("mcq" if q.get("options") else "gap", [q]))
        i += 1

    return groups


def render_question_groups(part: dict, folder: Path) -> str:
    questions = part.get("questions") or []
    if not questions:
        return ""

    covered_gaps = gap_numbers_in_part(part)
    groups = group_questions(questions)
    out = []
    last_section = ("", "", "")

    for kind, qs in groups:
        q0 = qs[0]
        sec = section_meta(q0)
        if sec != last_section and any(sec):
            out.append(render_section_header(sec[0], sec[1], sec[2]))
            last_section = sec

        if kind == "choose_two":
            out.append(render_choose_two_group(qs[0], qs[1]))
        elif kind == "flowchart":
            out.append(render_flowchart_group(qs))
        elif kind == "map":
            out.append(render_map_label_group(qs, folder, part))
        elif kind == "diagram":
            out.append(render_diagram_label_group(qs, folder, part))
        elif kind == "matching":
            # Generic A-H matching list (speakers etc.)
            opts = qs[0].get("options") or []
            if opts and all(len(str(o.get("label", ""))) <= 2 for o in opts):
                out.append(render_option_box(opts))
            for q in qs:
                num = q.get("number", "")
                prompt = escape(q.get("prompt") or "")
                out.append(
                    f'<div class="map-label-row">'
                    f'<span class="question-number">{num}</span>'
                    f'<input type="text" class="letter-input" maxlength="1" placeholder="_">'
                    f'<span>{prompt}</span></div>'
                )
        elif kind == "mcq":
            q = qs[0]
            qtype = q.get("type", "")
            multi = qtype in ("matching", "choose_two") or "TWO" in (q.get("sectionInstruction") or "")
            rendered = render_mcq(q, multi=multi)
            if rendered:
                out.append(rendered)
        elif kind == "gap":
            q = qs[0]
            if int(q.get("number", -1)) not in covered_gaps:
                out.append(render_gap_standalone(q))

    return "\n".join(out)


# ---------------------------------------------------------------------------
# Part & document assembly
# ---------------------------------------------------------------------------

def build_part_html(part: dict, folder: Path) -> str:
    pnum = part.get("partNumber", "?")
    range_label = escape(part.get("rangeLabel", f"Questions {pnum}"))
    instruction = escape(part.get("instruction", ""))
    title = part.get("passageTitle") or part.get("title") or ""

    # Note / table content
    body_parts = []

    if part.get("noteTables"):
        body_parts.append(render_note_tables(part["noteTables"]))
    elif part.get("noteTable"):
        if title and not part.get("noteTables"):
            body_parts.append(
                f'<div class="text-center mb-4"><span class="font-extrabold text-xl tracking-wide">{escape(title)}</span></div>'
            )
            title = ""  # already shown
        body_parts.append(render_table(part["noteTable"]))

    note_html = render_note_passage(part)
    if note_html:
        body_parts.append(note_html)

    q_html = render_question_groups(part, folder)

    has_notes_box = bool(body_parts)
    paper_inner = ""
    if title and has_notes_box:
        paper_inner += f'<div class="text-center mb-4"><span class="font-extrabold text-xl tracking-wide">{escape(title)}</span></div>\n'
    elif title and not has_notes_box and not q_html:
        paper_inner += f'<div class="text-center mb-4"><span class="font-extrabold text-xl tracking-wide">{escape(title)}</span></div>\n'

    if body_parts:
        paper_inner += "\n".join(body_parts)

    html = f'<div class="mb-10">\n'
    html += f'  <div class="flex items-center gap-3 mb-3">\n'
    html += f'    <div class="section-header">SECTION {pnum}</div>\n'
    html += f'    <div><span class="font-bold text-lg">{range_label}</span></div>\n'
    html += f'  </div>\n'
    if instruction:
        html += f'  <p class="ielts-instruction">{instruction}</p>\n'

    if paper_inner:
        html += '  <div class="paper-box">\n'
        html += paper_inner + "\n"
        html += "  </div>\n"

    if q_html:
        # MC / map sections often sit below the notes box (like the reference template)
        if paper_inner:
            html += f'  <div class="mt-6">\n{q_html}\n  </div>\n'
        else:
            html += '  <div class="paper-box">\n'
            if title:
                html += f'    <div class="text-center mb-4"><span class="font-extrabold text-xl tracking-wide">{escape(title)}</span></div>\n'
            html += q_html + "\n"
            html += "  </div>\n"

    html += "</div>\n"
    return html


def inject_extra_styles(html: str) -> str:
    if EXTRA_STYLES.strip() in html:
        return html
    return html.replace("</style>", EXTRA_STYLES + "\n    </style>", 1)


def build_html_for_test(folder: Path, test_num: int, cam_num: int) -> str:
    parts = load_exam_parts(folder)
    if not parts:
        raise ValueError(f"No parts in {folder}")

    inner = """<div class="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
  <div class="flex items-start gap-3">
    <i class="fa-solid fa-info-circle text-amber-600 mt-1"></i>
    <div class="text-sm">
      <p class="font-semibold text-amber-800">Instructions</p>
      <p class="text-amber-700 mt-1">
        Digital recreation of Cambridge IELTS Listening Test {t}. 
        Type answers in the gaps. Click options for multiple choice.
        <br><span class="font-medium">Print this page</span> for paper-like practice.
      </p>
    </div>
  </div>
</div>
""".format(t=test_num)

    for part in parts:
        inner += build_part_html(part, folder)

    inner += f"""<div class="mt-10 pt-6 border-t text-center text-xs text-gray-500">
  <p>IELTS Listening Test {test_num} • Cambridge IELTS {cam_num} • Practice recreation (content from official PDF)</p>
</div>
"""

    if '<div class="p-8">' not in TEMPLATE:
        raise RuntimeError("Template missing p-8 marker")

    prefix, _ = TEMPLATE.split('<div class="p-8">', 1)
    prefix = prefix + '<div class="p-8">\n'
    prefix = inject_extra_styles(prefix)

    rest = TEMPLATE.split('</div>\n    </div>\n\n    <script>', 1)
    if len(rest) > 1:
        suffix = '</div>\n    </div>\n\n    <script>' + rest[1]
    else:
        suffix = '\n    </div>\n    </div>\n\n' + TEMPLATE.rsplit('<script>', 1)[-1]
        suffix = '<script>' + suffix

    prefix = prefix.replace(
        '<h1 class="text-3xl font-bold tracking-tight">Test 1</h1>',
        f'<h1 class="text-3xl font-bold tracking-tight">Test {test_num}</h1>',
    )
    prefix = prefix.replace('>Cambridge IELTS 9<', f'>Cambridge IELTS {cam_num}<')
    prefix = prefix.replace('Cambridge IELTS 9', f'Cambridge IELTS {cam_num}')
    prefix = prefix.replace(
        'IELTS Test 1 • Listening • Cambridge 9',
        f'IELTS Test {test_num} • Listening • Cambridge {cam_num}',
    )
    prefix = prefix.replace(
        '<title>IELTS Test 1 • Listening • Cambridge 9</title>',
        f'<title>IELTS Test {test_num} • Listening • Cambridge {cam_num}</title>',
    )

    return prefix + inner + suffix


def main():
    candidates = []
    for folder in sorted(BASE_IELTS.glob("Listening IELTS_Test*_Cam*")):
        if (folder / "exam.json").exists() or (folder / "exam_part1.json").exists():
            m = re.search(r"Test(\d+)_Cam(\d+)", folder.name)
            if m:
                candidates.append((int(m.group(1)), int(m.group(2)), folder))

    if len(sys.argv) > 1:
        target = sys.argv[1].lower().replace(" ", "").replace("_", "").replace("-", "")
        filtered = []
        for tnum, cnum, f in candidates:
            name = f.name.lower().replace(" ", "").replace("_", "").replace("-", "")
            if target in name or f"test{tnum}cam{cnum}" in target:
                filtered.append((tnum, cnum, f))
        if filtered:
            candidates = filtered
            print(f"[SINGLE] {', '.join(f[2].name for f in candidates)}")
        else:
            print(f"No match for '{sys.argv[1]}'")
            return

    print(f"Generating {len(candidates)} HTML file(s) from exam_part*.json …")
    generated = 0

    for test_num, cam_num, folder in candidates:
        try:
            html = build_html_for_test(folder, test_num, cam_num)
        except Exception as e:
            print(f"SKIP {folder.name}: {e}")
            continue

        out_name = f"IELTS_Test{test_num}_Listening_Cam{cam_num}.html"
        out_path = folder / out_name
        out_path.write_text(html, encoding="utf-8")

        pdf_html_dir = PDF_TXT_DIR
        pdf_html_dir.mkdir(parents=True, exist_ok=True)
        (pdf_html_dir / out_name).write_text(html, encoding="utf-8")

        generated += 1
        print(f"  ✓ {out_path}")

    print(f"\nDone — {generated} HTML file(s).")


if __name__ == "__main__":
    main()