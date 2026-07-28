"""Rebuild all 48 IELTS listening tests from Python builders.

Run:
  python scripts/rebuild-all-ielts-listening.py
  python scripts/fix-all-ielts-p1.py
  python scripts/extract-all-ielts-plan-images.py
  pnpm build:catalog
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

BUILDERS = [
    "scripts/build-ielts-listening-tests.py",
    "scripts/build-ielts-cam9-10-listening.py",
    "scripts/build-ielts-cam11-12-listening.py",
    "scripts/build-ielts-cam12-v2-listening.py",
    "scripts/build-ielts-cam13-14-listening.py",
    "scripts/build-ielts-cam15-16-listening.py",
    "scripts/build-ielts-cam17-18-listening.py",
    "scripts/build-ielts-cam19-20-listening.py",
]


def main() -> None:
    print("Rebuilding all IELTS listening tests…\n")
    for script in BUILDERS:
        path = ROOT / script
        if not path.exists():
            print(f"  ⚠ skip missing {script}")
            continue
        print(f"── {script}")
        result = subprocess.run(
            [sys.executable, str(path)],
            cwd=str(ROOT),
            check=False,
        )
        if result.returncode != 0:
            raise SystemExit(f"Failed: {script}")
        print()

    fix = ROOT / "scripts" / "fix-all-ielts-p1.py"
    print("── scripts/fix-all-ielts-p1.py")
    result = subprocess.run([sys.executable, str(fix)], cwd=str(ROOT), check=False)
    if result.returncode != 0:
        raise SystemExit("Failed: fix-all-ielts-p1.py")

    extract = ROOT / "scripts" / "extract-all-ielts-plan-images.py"
    print("── scripts/extract-all-ielts-plan-images.py")
    result = subprocess.run([sys.executable, str(extract)], cwd=str(ROOT), check=False)
    if result.returncode != 0:
        raise SystemExit("Failed: extract-all-ielts-plan-images.py")

    print("\nAll builders finished. Next: pnpm build:catalog")


if __name__ == "__main__":
    main()