"""Normalize Part 1 & Part 4 layout/title for all 48 IELTS listening tests.

Run:
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

normalize_part1 = _base.normalize_part1
normalize_part4 = _base.normalize_part4
merge_parts = _base.merge_parts

PARTS_TO_FIX = (1, 4)


def load_part(folder: Path, part_number: int) -> dict | None:
    part_path = folder / f"exam_part{part_number}.json"
    if part_path.exists():
        return json.loads(part_path.read_text(encoding="utf-8"))

    exam_path = folder / "exam.json"
    if not exam_path.exists():
        return None
    exam = json.loads(exam_path.read_text(encoding="utf-8"))
    parts = exam.get("parts") or []
    for part in parts:
        if part.get("partNumber") == part_number:
            return part
    return None


def normalize_part(part: dict, part_number: int) -> dict:
    if part_number == 1:
        return normalize_part1(part)
    if part_number == 4:
        return normalize_part4(part)
    return part


def save_bundle(folder: Path, fixed_parts: dict[int, dict], meta: dict) -> None:
    loaded: dict[int, dict] = {}
    for spec in meta.get("parts", []):
        n = spec["partNumber"]
        path = folder / spec["file"]
        if n in fixed_parts:
            payload = normalize_part(fixed_parts[n], n)
            path.write_text(
                json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            loaded[n] = payload
        elif path.exists():
            loaded[n] = json.loads(path.read_text(encoding="utf-8"))

    exam = merge_parts(meta, loaded)
    (folder / "exam.json").write_text(
        json.dumps(exam, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def part_summary(part: dict, part_number: int) -> str:
    layout = part.get("notePassageLayout", "—")
    title = part.get("passageTitle", "—")
    return f"P{part_number} layout={layout}, title={title!r}"


def main() -> None:
    folders = sorted(
        path for path in IELTS.glob("Listening IELTS_Test*_Cam*") if path.is_dir()
    )
    print(f"Fixing Part 1 & Part 4 for {len(folders)} IELTS tests…\n")
    processed = 0
    skipped = 0

    for folder in folders:
        meta_path = folder / "meta.json"
        if not meta_path.exists():
            print(f"  ⚠ {folder.name}: no meta.json")
            skipped += 1
            continue

        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        fixed_parts: dict[int, dict] = {}
        before: dict[int, tuple] = {}

        for part_number in PARTS_TO_FIX:
            part = load_part(folder, part_number)
            if not part:
                continue
            before[part_number] = (
                part.get("notePassageLayout"),
                part.get("passageTitle"),
            )
            fixed_parts[part_number] = part

        if not fixed_parts:
            print(f"  ⚠ {folder.name}: no Part 1/4 data")
            skipped += 1
            continue

        save_bundle(folder, fixed_parts, meta)

        flags: list[str] = []
        for part_number in sorted(fixed_parts):
            after_path = folder / f"exam_part{part_number}.json"
            after = json.loads(after_path.read_text(encoding="utf-8"))
            prev_layout, prev_title = before.get(part_number, (None, None))
            changed = (
                prev_layout != after.get("notePassageLayout")
                or prev_title != after.get("passageTitle")
            )
            flag = "✓" if changed else "·"
            flags.append(f"{flag} {part_summary(after, part_number)}")

        print(f"  {folder.name}: {' | '.join(flags)}")
        processed += 1

    print(f"\nDone — {processed} processed, {skipped} skipped.")


if __name__ == "__main__":
    main()