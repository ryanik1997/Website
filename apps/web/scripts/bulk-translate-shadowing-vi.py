"""
Optional offline bulk EN→VI for shadowing subtitles (MyMemory free API).

Usage:
  python bulk-translate-shadowing-vi.py --youtube d9maT5eyJwM
  python bulk-translate-shadowing-vi.py --all --limit 200

Writes:
  apps/web/src/features/shadowing/data/shadowingViOverrides.json
  { [youtubeId]: { [segmentId]: "vi text" } }

The app merges these overrides on load when present.
"""
from __future__ import annotations

import argparse
import json
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SUBS = ROOT / "src" / "features" / "shadowing" / "data" / "shadowingSubtitles.json"
OUT = ROOT / "src" / "features" / "shadowing" / "data" / "shadowingViOverrides.json"


def translate(text: str) -> str | None:
    q = text.strip()[:450]
    if not q:
        return None
    url = "https://api.mymemory.translated.net/get?" + urllib.parse.urlencode(
        {"q": q, "langpair": "en|vi"}
    )
    req = urllib.request.Request(url, headers={"User-Agent": "RyanEnglish/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            data = json.loads(r.read().decode("utf-8"))
    except Exception as e:
        print("  err", e)
        return None
    t = (data.get("responseData") or {}).get("translatedText") or ""
    t = t.strip()
    if not t or "MYMEMORY" in t.upper() or "QUERY LENGTH" in t.upper():
        return None
    return t


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--youtube", help="Only one youtubeId")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--limit", type=int, default=0, help="Max new translations")
    ap.add_argument("--delay", type=float, default=0.4)
    args = ap.parse_args()

    if not args.youtube and not args.all:
        raise SystemExit("Pass --youtube ID or --all")

    payload = json.loads(SUBS.read_text(encoding="utf-8"))
    by_yt: dict = payload.get("byYoutubeId") or {}
    overrides: dict = {}
    if OUT.is_file():
        overrides = json.loads(OUT.read_text(encoding="utf-8"))

    targets = [args.youtube] if args.youtube else list(by_yt.keys())
    done_new = 0
    for yt in targets:
        segs = by_yt.get(yt) or []
        bucket = overrides.setdefault(yt, {})
        print(f"== {yt} segs={len(segs)}")
        for seg in segs:
            sid = seg.get("id")
            if not sid:
                continue
            if bucket.get(sid) or seg.get("vietnameseText"):
                continue
            if args.limit and done_new >= args.limit:
                print("limit reached")
                OUT.write_text(json.dumps(overrides, ensure_ascii=False, indent=2), encoding="utf-8")
                return
            vi = translate(seg.get("text") or "")
            time.sleep(args.delay)
            if not vi:
                continue
            bucket[sid] = vi
            done_new += 1
            print(f"  +{done_new} {vi[:60]}")
        OUT.write_text(json.dumps(overrides, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"done new={done_new} -> {OUT}")


if __name__ == "__main__":
    main()
