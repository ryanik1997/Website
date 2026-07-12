#!/usr/bin/env python3
"""Scan Chrome Profile cache/IndexedDB for IELTS Reading exam JSON (DeepSeek/Wizard)."""
from __future__ import annotations

import hashlib
import json
import os
import re
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "_recover_wizard" / "deepseek_extract"
MARKERS = (b"questionGroups", b"passageTitle", b"partNumber")


def extract_json_objects(text: str) -> list[dict]:
    found: list[dict] = []
    starts: list[int] = []
    for m in re.finditer(r'\{\s*"(?:partNumber|passageTitle|questionGroups|title|parts)"\s*:', text):
        starts.append(m.start())
    for start in starts:
        depth = 0
        end = None
        # Cap size to avoid runaway
        limit = min(len(text), start + 800_000)
        in_str = False
        esc = False
        for i in range(start, limit):
            ch = text[i]
            if in_str:
                if esc:
                    esc = False
                elif ch == "\\":
                    esc = True
                elif ch == '"':
                    in_str = False
                continue
            if ch == '"':
                in_str = True
                continue
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    end = i + 1
                    break
        if not end:
            continue
        chunk = text[start:end]
        if "questionGroups" not in chunk and '"questions"' not in chunk and '"parts"' not in chunk:
            continue
        try:
            obj = json.loads(chunk)
        except json.JSONDecodeError:
            continue
        if not isinstance(obj, dict):
            continue
        found.append(obj)
    return found


def score_obj(obj: dict) -> int:
    s = 0
    if "questionGroups" in obj:
        s += 5
    if "partNumber" in obj:
        s += 3
    if "passageTitle" in obj:
        s += 2
    if "parts" in obj:
        s += 4
    if "questions" in obj:
        s += 2
    # prefer larger content
    try:
        s += min(20, len(json.dumps(obj, ensure_ascii=False)) // 2000)
    except Exception:
        pass
    return s


def main() -> None:
    local = Path(os.environ["LOCALAPPDATA"]) / "Google" / "Chrome" / "User Data"
    OUT.mkdir(parents=True, exist_ok=True)

    scan_dirs = []
    for prof in local.glob("Profile *"):
        scan_dirs.append(prof / "Cache" / "Cache_Data")
        scan_dirs.append(prof / "IndexedDB")
        scan_dirs.append(prof / "Local Storage" / "leveldb")
        scan_dirs.append(prof / "Session Storage")

    files: list[Path] = []
    for d in scan_dirs:
        if not d.exists():
            continue
        for f in d.rglob("*"):
            if f.is_file() and f.stat().st_size >= 10_000:
                files.append(f)

    print(f"scanning {len(files)} files >= 10KB")

    content_seen: set[str] = set()
    obj_seen: set[str] = set()
    recovered: list[tuple[int, dict, str]] = []
    file_hits = 0

    for f in files:
        try:
            data = f.read_bytes()
        except OSError:
            continue
        if not any(m in data for m in MARKERS):
            continue
        file_hits += 1
        h = hashlib.md5(data).hexdigest()
        if h in content_seen:
            continue
        content_seen.add(h)
        text = data.decode("utf-8", errors="ignore")
        objs = extract_json_objects(text)
        cams = sorted(set(re.findall(r"Cambridge\s+(\d+)\s+Test\s+(\d)", text, re.I)))
        if objs or cams:
            print(f"HIT {f.stat().st_size:8d} objs={len(objs):3d} cams={cams[:6]} {f}")
        for obj in objs:
            blob = json.dumps(obj, sort_keys=True, ensure_ascii=False)
            oh = hashlib.md5(blob.encode("utf-8")).hexdigest()
            if oh in obj_seen:
                continue
            obj_seen.add(oh)
            recovered.append((score_obj(obj), obj, str(f)))

    recovered.sort(key=lambda x: -x[0])
    print(f"\nfile hits with markers: {file_hits}")
    print(f"unique JSON objects: {len(recovered)}")

    manifest = []
    for i, (sc, obj, src) in enumerate(recovered, 1):
        title = (
            obj.get("passageTitle")
            or obj.get("title")
            or obj.get("rangeLabel")
            or f"obj-{i}"
        )
        # sanitize filename
        safe = re.sub(r"[^\w\-]+", "_", str(title))[:80]
        path = OUT / f"{i:03d}_s{sc}_{safe}.json"
        path.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")
        qcount = 0
        if isinstance(obj.get("questionGroups"), list):
            for g in obj["questionGroups"]:
                qcount += len(g.get("questions") or [])
        if isinstance(obj.get("parts"), list):
            for p in obj["parts"]:
                for g in p.get("questionGroups") or []:
                    qcount += len(g.get("questions") or [])
        manifest.append(
            {
                "file": path.name,
                "score": sc,
                "title": title,
                "partNumber": obj.get("partNumber"),
                "questionCount": qcount,
                "keys": list(obj.keys())[:12],
                "source": src,
            }
        )
        print(f"  saved {path.name} q={qcount} keys={list(obj.keys())[:6]}")

    (OUT / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\nWrote {len(manifest)} files → {OUT}")


if __name__ == "__main__":
    main()
