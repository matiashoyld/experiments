"""
Generate all TTS audio files using Edge TTS (free, no API key needed).

Usage:
    /tmp/edge-tts-venv/bin/python scripts/generate-audio-edge.py
    /tmp/edge-tts-venv/bin/python scripts/generate-audio-edge.py --dry-run
    /tmp/edge-tts-venv/bin/python scripts/generate-audio-edge.py --type words
"""

import asyncio
import json
import os
import sys
import time

import edge_tts

AUDIO_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "audio")
ITEMS_FILE = "/tmp/audio-items.json"
VOICE = "en-US-AriaNeural"  # Warm, clear female voice — good for kids
RATE = "-10%"  # Slightly slower for a child's game


def get_file_path(item):
    sub_dir = "words" if item["type"] == "word" else "tts"
    return os.path.join(AUDIO_DIR, sub_dir, f"{item['key']}.mp3")


async def generate_one(item, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    communicate = edge_tts.Communicate(item["text"], VOICE, rate=RATE)
    await communicate.save(path)


async def main():
    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    type_filter = None
    if "--type" in args:
        type_filter = args[args.index("--type") + 1]

    with open(ITEMS_FILE) as f:
        all_items = json.load(f)

    if type_filter:
        all_items = [i for i in all_items if i["type"] == type_filter]

    missing = [i for i in all_items if not os.path.exists(get_file_path(i))]
    skipped = len(all_items) - len(missing)

    print(f"\nEdge TTS audio generation:")
    print(f"  Voice: {VOICE}")
    print(f"  Total items: {len(all_items)}")
    print(f"  Already exist (skip): {skipped}")
    print(f"  To generate: {len(missing)}")

    if dry_run:
        print("\nDry run — items to generate:")
        for item in missing:
            print(f"  [{item['type']}] {item['key']}: \"{item['text']}\"")
        return

    if not missing:
        print("\nAll audio files already exist. Nothing to do.")
        return

    start = time.time()
    generated = 0
    failed = 0
    failures = []

    for i, item in enumerate(missing):
        path = get_file_path(item)
        try:
            await generate_one(item, path)
            generated += 1
            elapsed = time.time() - start
            rate = generated / elapsed if elapsed > 0 else 0
            remaining = (len(missing) - i - 1) / rate if rate > 0 else 0
            print(f"[{i+1}/{len(missing)}] OK: {item['type']}/{item['key']} "
                  f"({elapsed:.0f}s elapsed, ~{remaining:.0f}s remaining)")
        except Exception as e:
            failed += 1
            failures.append({"key": item["key"], "error": str(e)})
            print(f"[{i+1}/{len(missing)}] FAIL: {item['type']}/{item['key']} — {e}")

        # Small delay to be polite
        await asyncio.sleep(0.3)

    total_time = time.time() - start
    print(f"\n=== Done ===")
    print(f"  Generated: {generated}")
    print(f"  Skipped (existed): {skipped}")
    print(f"  Failed: {failed}")
    print(f"  Total time: {total_time:.0f}s")

    if failures:
        print(f"\nFailed items:")
        for f in failures:
            print(f"  {f['key']}: {f['error']}")


if __name__ == "__main__":
    asyncio.run(main())
