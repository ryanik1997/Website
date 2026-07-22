"""Sync gapLead/gapTrail metadata across all 48 IELTS listening tests.

Removes redundant gapLead/gapTrail from questions when notePassage already
contains the same text inline (static before/after gap). Keeps gapLead/gapTrail
on bare gaps so the runtime renderer can inject them once.

Run:
  python scripts/sync-ielts-inline-gaps.py
  python scripts/fix-all-ielts-p1.py
  pnpm build:catalog
"""
from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IELTS = ROOT / "Tainguyen" / "IELTS"
sys.path.insert(0, str(ROOT / "scripts"))

_base_path = ROOT / "scripts" / "build-ielts-cam11-12-listening.py"
_spec = importlib.util.spec_from_file_location("ielts_base", _base_path)
_base = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_base)

_bare_note_text = _base._bare_note_text
_is_gap_trail_block = _base._is_gap_trail_block
_prev_ends_incomplete = _base._prev_ends_incomplete
_has_note_line_marker = _base._has_note_line_marker
normalize_part1 = _base.normalize_part1
normalize_part4 = _base.normalize_part4
merge_parts = _base.merge_parts


def _static_matches_gap_lead(static_text: str, gap_lead: str) -> bool:
    bare_static = _bare_note_text(static_text).strip()
    bare_lead = _bare_note_text(gap_lead).strip()
    if not bare_static or not bare_lead:
        return False
    return (
        bare_static == bare_lead
        or bare_static.endswith(bare_lead)
        or bare_lead.endswith(bare_static)
    )


def _static_matches_gap_trail(static_text: str, gap_trail: str) -> bool:
    st = (static_text or "").strip()
    trail = (gap_trail or "").strip()
    if not st or not trail:
        return False
    if st == trail or st.endswith(trail) or st.startswith(trail):
        return True
    return _bare_note_text(st) == _bare_note_text(trail)


def _has_inline_lead(passage: list, gap_index: int) -> bool:
    prev = passage[gap_index - 1] if gap_index > 0 else None
    if not prev or prev.get("type") != "static":
        return False
    text = prev.get("text") or ""
    if not text.strip():
        return False
    bare = _bare_note_text(text)
    return _prev_ends_incomplete(text) or bare.rstrip().endswith(":")


def sync_part_gap_metadata(part: dict) -> int:
    """Strip redundant gapLead/gapTrail from questions. Returns change count."""
    passage = part.get("notePassage") or []
    if not passage:
        return 0

    questions = part.get("questions") or []
    q_by_num = {q["number"]: q for q in questions}
    changes = 0

    for index, block in enumerate(passage):
        if block.get("type") != "gap":
            continue
        number = block.get("number")
        if number is None:
            continue
        question = q_by_num.get(number)
        if not question:
            continue

        prev = passage[index - 1] if index > 0 else None
        next_block = passage[index + 1] if index < len(passage) - 1 else None

        if question.get("gapLead") and prev and prev.get("type") == "static":
            prev_text = prev.get("text") or ""
            if _static_matches_gap_lead(prev_text, question["gapLead"]) or _has_inline_lead(
                passage, index
            ):
                question.pop("gapLead", None)
                changes += 1

        if question.get("gapTrail") and next_block and next_block.get("type") == "static":
            next_text = next_block.get("text") or ""
            if _static_matches_gap_trail(next_text, question["gapTrail"]) or _is_gap_trail_block(
                passage, index + 1
            ):
                question.pop("gapTrail", None)
                changes += 1

    return changes


def normalize_part(part: dict) -> dict:
    n = part.get("partNumber")
    if n == 1:
        return normalize_part1(part)
    if n == 4:
        return normalize_part4(part)
    passage = part.get("notePassage") or []
    if passage:
        passage = _base._atomize_note_passage(passage)
        _base._enrich_passage_bullets(passage)
        part["notePassage"] = passage
    return part


def process_folder(folder: Path) -> tuple[int, int]:
    meta_path = folder / "meta.json"
    if not meta_path.exists():
        return 0, 0

    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    part_changes = 0
    parts_loaded: dict[int, dict] = {}

    for spec in meta.get("parts", []):
        part_number = spec["partNumber"]
        part_path = folder / spec["file"]
        if not part_path.exists():
            continue
        part = json.loads(part_path.read_text(encoding="utf-8"))
        changed = sync_part_gap_metadata(part)
        if changed:
            part_changes += changed
        part = normalize_part(part)
        part_path.write_text(
            json.dumps(part, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        parts_loaded[part_number] = part

    if parts_loaded:
        for spec in meta.get("parts", []):
            n = spec["partNumber"]
            path = folder / spec["file"]
            if n not in parts_loaded and path.exists():
                parts_loaded[n] = json.loads(path.read_text(encoding="utf-8"))
        exam = merge_parts(meta, parts_loaded)
        (folder / "exam.json").write_text(
            json.dumps(exam, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

    return 1 if part_changes else 0, part_changes


def main() -> None:
    folders = sorted(
        path for path in IELTS.glob("Listening IELTS_Test*_Cam*") if path.is_dir()
    )
    print(f"Syncing inline gap metadata for {len(folders)} IELTS tests…\n")
    tests_changed = 0
    total_field_removals = 0

    for folder in folders:
        changed, removals = process_folder(folder)
        if removals:
            tests_changed += 1
            total_field_removals += removals
            print(f"  ✓ {folder.name}: {removals} redundant gapLead/gapTrail removed")
        else:
            print(f"  · {folder.name}")

    print(
        f"\nDone — {tests_changed} test(s) updated, "
        f"{total_field_removals} field(s) removed across {len(folders)} tests."
    )


if __name__ == "__main__":
    main()