"""Crop map/diagram cho mọi đề IELTS Listening có imageFile — không lấy nguyên trang PDF.

Quét exam_part*.json → imageFile (map.jpg, diagram.jpg, …)
Tự tìm PDF + trang "Label the map/diagram" → crop vùng hình.

Run:
  python scripts/extract-all-ielts-plan-images.py
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

extract_map_image = _base.extract_map_image
find_plan_page_index = _base.find_plan_page_index
find_scanned_plan_page_index = _base.find_scanned_plan_page_index
find_fallback_plan_clip_rect = _base.find_fallback_plan_clip_rect
resolve_listening_pdf = _base.resolve_listening_pdf

try:
    import fitz
except ImportError:
    fitz = None

# Override khi PDF scan / layout đặc biệt: (folder_name, image_file) → page index 0-based
PAGE_OVERRIDES: dict[tuple[str, str], int] = {
    # PDF scan Part 2 — map Hinchingbrooke Park ở trang 4 (index 3)
    ("Listening IELTS_Test2_Cam9", "map.jpg"): 3,
}


def collect_plan_image_jobs() -> list[tuple[Path, str]]:
    jobs: list[tuple[Path, str]] = []
    seen: set[tuple[str, str]] = set()

    for folder in sorted(path for path in IELTS.glob("Listening IELTS_Test*_Cam*") if path.is_dir()):
        images: set[str] = set()
        for part_path in sorted(folder.glob("exam_part*.json")):
            try:
                part = json.loads(part_path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                continue
            image_file = (part.get("imageFile") or "").strip()
            if image_file:
                images.add(image_file)

        for image_name in sorted(images):
            key = (folder.name, image_name)
            if key in seen:
                continue
            seen.add(key)
            jobs.append((folder, image_name))

    return jobs


def resolve_plan_page_index(doc, folder_name: str, image_name: str) -> int | None:
    override = PAGE_OVERRIDES.get((folder_name, image_name))
    if override is not None and 0 <= override < len(doc):
        return override

    text_page = find_plan_page_index(doc)
    if text_page is not None:
        return text_page

    if fitz is None:
        return None

    scanned = find_scanned_plan_page_index(doc)
    if scanned is not None:
        return scanned

    return None


def extract_plan_for_folder(folder: Path, image_name: str) -> bool:
    pdf_path = resolve_listening_pdf(folder)
    if not pdf_path:
        print(f"  ⚠ {folder.name}/{image_name}: no listening PDF")
        return False

    if fitz is None:
        print("  ⚠ pymupdf not installed")
        return False

    doc = fitz.open(str(pdf_path))
    page_idx = resolve_plan_page_index(doc, folder.name, image_name)
    doc.close()

    if page_idx is None:
        print(f"  ⚠ {folder.name}/{image_name}: plan page not found in {pdf_path.name}")
        return False

    out_path = folder / image_name
    return extract_map_image(pdf_path, page_idx, out_path)


def main() -> None:
    jobs = collect_plan_image_jobs()
    print(f"Extracting {len(jobs)} plan image(s) from IELTS Listening bundles…\n")

    ok = 0
    fail = 0
    for folder, image_name in jobs:
        print(f"── {folder.name} / {image_name}")
        if extract_plan_for_folder(folder, image_name):
            ok += 1
        else:
            fail += 1

    print(f"\nDone — {ok} ok, {fail} failed.")
    if ok:
        print("Next: pnpm build:catalog")


if __name__ == "__main__":
    main()