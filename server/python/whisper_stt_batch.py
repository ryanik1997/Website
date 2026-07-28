# -*- coding: utf-8 -*-
"""Persistent faster-whisper JSONL worker for batch transcript generation."""
import argparse
import json
import sys


def emit(payload):
    print(json.dumps(payload, ensure_ascii=False), flush=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="base.en")
    parser.add_argument("--language", default="en")
    parser.add_argument("--device", default="cpu")
    parser.add_argument("--compute", default="int8")
    parser.add_argument("--beam", type=int, default=1)
    args = parser.parse_args()

    try:
        from faster_whisper import WhisperModel
        model = WhisperModel(
            args.model,
            device=args.device,
            compute_type=args.compute,
        )
    except Exception as exc:
        emit({"ready": False, "error": f"Load model failed: {exc}"})
        return 1

    emit({"ready": True, "model": args.model})
    language = None if args.language == "auto" else args.language

    for raw_line in sys.stdin:
        raw_line = raw_line.strip()
        if not raw_line:
            continue
        try:
            request = json.loads(raw_line)
            request_id = request.get("id")
            audio_path = request["audio"]
            segments_iter, info = model.transcribe(
                audio_path,
                language=language,
                beam_size=args.beam,
                vad_filter=False,
            )
            segments = []
            texts = []
            for index, segment in enumerate(segments_iter, start=1):
                text = (segment.text or "").strip()
                if not text:
                    continue
                texts.append(text)
                segments.append({
                    "id": index,
                    "start": float(segment.start),
                    "end": float(segment.end),
                    "text": text,
                })
            emit({
                "id": request_id,
                "ok": True,
                "language": info.language,
                "duration": float(info.duration or 0.0),
                "text": "\n".join(texts),
                "segments": segments,
            })
        except Exception as exc:
            emit({
                "id": request.get("id") if "request" in locals() else None,
                "ok": False,
                "error": str(exc),
            })

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
