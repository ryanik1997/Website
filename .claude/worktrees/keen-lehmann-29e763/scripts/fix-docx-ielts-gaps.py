#!/usr/bin/env python3
"""
Fix gap markers in IELTS Listening DOCX (Cam11 Test 2–4).
Wraps standalone question-number <w:t> nodes as [n] for import parser.

Usage: python scripts/fix-docx-ielts-gaps.py
"""
from __future__ import annotations

import re
import shutil
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCX_DIR = ROOT / "Tainguyen" / "PDF to HTML" / "DOCX standard"
W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"

# Per file: which solo-digit w:t values to wrap as [n]
# (avoid wrapping MC question numbers like 11 in "11.In Shona" — those are NOT solo nodes)
WRAP_SOLO: dict[str, set[int]] = {
    "IELTS_Test2_Listening_Cam11.docx": set(range(1, 11)) | set(range(31, 41)),
    "IELTS_Test3_Listening_Cam11.docx": set(range(7, 11)) | set(range(21, 27)),
    "IELTS_Test4_Listening_Cam11.docx": set(range(1, 8)) | set(range(31, 41)),
}


def wrap_solo_digits_in_xml(xml_bytes: bytes, wrap_nums: set[int]) -> tuple[bytes, int]:
    root = ET.fromstring(xml_bytes)
    count = 0
    for t in root.iter(W + "t"):
        raw = t.text or ""
        stripped = raw.strip()
        if not re.match(r"^\d{1,2}$", stripped):
            continue
        num = int(stripped)
        if num not in wrap_nums:
            continue
        # Preserve surrounding whitespace from original
        prefix = raw[: len(raw) - len(raw.lstrip())]
        suffix = raw[len(raw.rstrip()) :]
        t.text = f"{prefix}[{num}]{suffix}"
        count += 1
    return ET.tostring(root, encoding="utf-8", xml_declaration=True), count


def fix_docx(path: Path, wrap_nums: set[int]) -> None:
    print(f"  {path.name}")
    tmp = path.with_suffix(".docx.tmp")
    total = 0
    with zipfile.ZipFile(path, "r") as zin:
        with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                data = zin.read(item.filename)
                if item.filename == "word/document.xml":
                    data, n = wrap_solo_digits_in_xml(data, wrap_nums)
                    total = n
                zout.writestr(item, data)
    shutil.move(str(tmp), str(path))
    print(f"    wrapped {total} gap marker(s)")


def embed_map_image(docx_path: Path, map_src: Path, insert_before: str) -> None:
    """Embed map.jpg into DOCX before a marker paragraph."""
    if not map_src.exists():
        print(f"    skip embed: {map_src} not found")
        return

    img_bytes = map_src.read_bytes()
    img_name = "map_embed.jpg"
    media_path = f"word/media/{img_name}"

    with zipfile.ZipFile(docx_path, "r") as zin:
        entries = {i.filename: zin.read(i.filename) for i in zin.infolist()}

    doc_xml = entries["word/document.xml"].decode("utf-8")
    if "map_embed" in doc_xml:
        print("    map already embedded")
        return

    img_para = (
        '<w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        '<w:r><w:drawing>'
        '<wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">'
        '<wp:extent cx="5486400" cy="4114800"/>'
        '<wp:docPr id="99" name="map.jpg"/>'
        '<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">'
        '<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">'
        '<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">'
        '<pic:blipFill><a:blip r:embed="rIdMapImg" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>'
        '<a:stretch><a:fillRect/></a:stretch></pic:blipFill>'
        '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="5486400" cy="4114800"/></a:xfrm>'
        '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic>'
        '</a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>'
    )

    marker_xml = f"<w:t>{insert_before}</w:t>"
    if marker_xml not in doc_xml:
        marker_xml = f'<w:t xml:space="preserve">{insert_before}</w:t>'
    if marker_xml not in doc_xml:
        print("    skip embed: marker paragraph not found")
        return

    doc_xml = doc_xml.replace(marker_xml, img_para + marker_xml, 1)
    entries["word/document.xml"] = doc_xml.encode("utf-8")
    entries[media_path] = img_bytes

    rels_path = "word/_rels/document.xml.rels"
    rels = entries.get(rels_path, b"").decode("utf-8")
    ids = [int(m.group(1)) for m in re.finditer(r'Id="rId(\d+)"', rels)]
    rid = f"rId{max(ids, default=10) + 1}"
    doc_xml = entries["word/document.xml"].decode("utf-8").replace("rIdMapImg", rid)
    entries["word/document.xml"] = doc_xml.encode("utf-8")
    rel_line = (
        f'<Relationship Id="{rid}" '
        f'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" '
        f'Target="media/{img_name}"/>'
    )
    entries[rels_path] = rels.replace("</Relationships>", rel_line + "</Relationships>").encode("utf-8")

    tmp = docx_path.with_suffix(".docx.tmp")
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
        for name, data in entries.items():
            zout.writestr(name, data)
    shutil.move(str(tmp), str(docx_path))
    print(f"    embedded {map_src.name}")


def strip_example_prefix_from_gap_row(xml_bytes: bytes) -> tuple[bytes, int]:
    """Table row 'Example – Name: ... [1]...' → drop Example prefix so parser keeps gaps."""
    text = xml_bytes.decode("utf-8")
    count = 0
    for old in (
        "Example – Name:",
        "Example - Name:",
        "Example—Name:",
    ):
        if old in text:
            text = text.replace(old, "Name:", 1)
            count += 1
            break
    return text.encode("utf-8"), count


def main():
    print("Fixing gap markers in Cam11 DOCX Test 2–4…\n")
    for fname, wrap_nums in WRAP_SOLO.items():
        path = DOCX_DIR / fname
        if not path.exists():
            print(f"  SKIP: {fname}")
            continue
        fix_docx(path, wrap_nums)

    t2 = DOCX_DIR / "IELTS_Test2_Listening_Cam11.docx"
    if t2.exists():
        print(f"  {t2.name} — strip Example prefix on gap row")
        tmp = t2.with_suffix(".docx.tmp")
        with zipfile.ZipFile(t2, "r") as zin:
            with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
                for item in zin.infolist():
                    data = zin.read(item.filename)
                    if item.filename == "word/document.xml":
                        data, n = strip_example_prefix_from_gap_row(data)
                        print(f"    stripped {n} Example prefix(es)")
                    zout.writestr(item, data)
        shutil.move(str(tmp), str(t2))

    t2map = ROOT / "Tainguyen" / "IELTS" / "Listening IELTS_Test2_Cam11" / "map.jpg"
    if t2.exists() and t2map.exists():
        print(f"  {t2.name} — embed map")
        embed_map_image(t2, t2map, "THEATRE PLAN")

    t4 = DOCX_DIR / "IELTS_Test4_Listening_Cam11.docx"
    map4 = ROOT / "Tainguyen" / "IELTS" / "Listening IELTS_Test4_Cam11" / "map.jpg"
    if t4.exists() and map4.exists():
        print(f"  {t4.name} — embed map")
        embed_map_image(t4, map4, "MUSEUM PLAN")

    print("\nDone.")


if __name__ == "__main__":
    main()