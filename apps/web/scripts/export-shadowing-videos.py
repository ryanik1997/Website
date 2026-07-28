"""Export official TID shadowing_videos (+ subtitles map) into the web app seed JSON."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

TID = Path(r"D:\App-English-Ryan\Crawl\Claude_Plan_Crawl\TID_Writing")
SRC = TID / "shadowing_videos.json"
SUB_SRC = TID / "shadowing_subtitles_by_video.json"
OUT_DIR = Path(__file__).resolve().parents[1] / "src" / "features" / "shadowing" / "data"
OUT_VIDEOS = OUT_DIR / "shadowingVideos.json"
OUT_SUBS = OUT_DIR / "shadowingSubtitles.json"


def main() -> None:
    rows = json.loads(SRC.read_text(encoding="utf-8"))
    official = [r for r in rows if not r.get("is_custom") and not r.get("is_community")]
    normalized = []
    for r in official:
        yt = r.get("youtube_id") or ""
        normalized.append(
            {
                "id": r["id"],
                "youtubeId": yt,
                "title": r.get("title") or "",
                "thumbnailUrl": r.get("thumbnail_url")
                or (f"https://i.ytimg.com/vi/{yt}/hqdefault.jpg" if yt else ""),
                "category": r.get("category") or "Other",
                "level": r.get("level") or "",
                "duration": r.get("duration") or "",
                "segments": int(r.get("segments") or 0),
                "createdAt": r.get("created_at"),
            }
        )
    normalized.sort(key=lambda x: (x["category"], x["title"]))
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    OUT_VIDEOS.write_text(json.dumps(normalized, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {len(normalized)} videos -> {OUT_VIDEOS}")
    print(Counter(x["category"] for x in normalized))

    if SUB_SRC.is_file():
        data = json.loads(SUB_SRC.read_text(encoding="utf-8"))
        payload = {
            "meta": data.get("meta") or {},
            "byYoutubeId": data.get("byYoutubeId") or {},
        }
        OUT_SUBS.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
        print(
            f"wrote subtitles videos={len(payload['byYoutubeId'])} "
            f"-> {OUT_SUBS} ({OUT_SUBS.stat().st_size // 1024} KB)"
        )
    else:
        print(f"skip subtitles (missing {SUB_SRC})")


if __name__ == "__main__":
    main()
