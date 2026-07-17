# -*- coding: utf-8 -*-
"""
 STT runner dùng faster-whisper (mặc định model base.en — cân bằng tốc độ/độ chính xác, tiếng Anh).
Được Node server spawn qua child_process; in đúng 1 dòng JSON ra stdout.

Args:
  --audio <path>         File audio (mp3/wav — faster-whisper tự decode qua PyAV)
  --model <name|path>    tiny.en | tiny | base.en | small ... (default: base.en)
  --language <code>      Default: en
"""
import argparse
import json
import sys


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio", required=True)
    ap.add_argument("--model", default="base.en")
    ap.add_argument("--language", default="en")
    ap.add_argument("--device", default="cpu")
    ap.add_argument("--compute", default="int8")
    ap.add_argument("--beam", type=int, default=1)
    args = ap.parse_args()

    try:
        from faster_whisper import WhisperModel
    except Exception as e:
        print(json.dumps({"error": f"faster-whisper not installed: {e}"}), flush=True)
        sys.exit(1)

    try:
        model = WhisperModel(args.model, device=args.device, compute_type=args.compute)
    except Exception as e:
        print(json.dumps({"error": f"Load model failed: {e}"}), flush=True)
        sys.exit(1)

    lang = None if args.language == "auto" else args.language

    try:
        segments_iter, info = model.transcribe(
            args.audio,
            language=lang,
            beam_size=args.beam,
            vad_filter=False,
        )
    except Exception as e:
        print(json.dumps({"error": f"Transcribe failed: {e}"}), flush=True)
        sys.exit(1)

    segs = []
    texts = []
    for i, s in enumerate(segments_iter, start=1):
        text = (s.text or "").strip()
        if text:
            texts.append(text)
        segs.append({
            "id": i,
            "start": float(s.start),
            "end": float(s.end),
            "text": text,
        })

    out = {
        "language": info.language,
        "duration": float(info.duration or 0.0),
        "text": "\n".join(texts),
        "segments": segs,
    }
    print(json.dumps(out, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
