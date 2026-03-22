#!/usr/bin/env python3
"""Generate pixel art cover images for Harry Potter audiobook Yoto cards using Gemini API."""

import urllib.request
import json
import base64
import os
import sys
import time

API_KEY = os.environ["GEMINI_API_KEY"]
MODEL = "nano-banana-pro-preview"
URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

STYLE = (
    "8-bit pixel art, NES/Game Boy style, very low resolution look, 16x16 or 32x32 pixel grid, "
    "extremely simple, minimal detail, flat colors, no gradients, no anti-aliasing, "
    "thick chunky pixels clearly visible, limited color palette (max 4-5 colors), "
    "single centered iconic subject, solid color background. Square format. "
    "Think original Game Boy or early NES sprite art. No text."
)

PROMPTS = [
    {
        "file": "cover_part_00.png",
        "prompt": f"{STYLE} A small boy wizard with glasses and a wand, facing a ghost/dementor. Dark blue background."
    },
    {
        "file": "cover_part_01.png",
        "prompt": f"{STYLE} A simple house silhouette with one glowing yellow window and a red bird (phoenix) above it. Dark purple background."
    },
    {
        "file": "cover_part_02.png",
        "prompt": f"{STYLE} A simple castle with 3 towers. Purple/blue background."
    },
    {
        "file": "cover_part_03.png",
        "prompt": f"{STYLE} A single magic wand shooting a bright yellow star spark. Dark red background."
    },
    {
        "file": "cover_part_04.png",
        "prompt": f"{STYLE} Colorful fireworks explosions in the sky. Dark night sky background."
    },
    {
        "file": "cover_part_05.png",
        "prompt": f"{STYLE} A single glowing crystal ball/orb on a pedestal. Dark blue-purple background."
    },
]


def generate_image(prompt_data):
    filename = prompt_data["file"]
    filepath = os.path.join(OUTPUT_DIR, filename)
    print(f"Generating {filename}...")

    payload = {
        "contents": [{"parts": [{"text": prompt_data["prompt"]}]}],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"],
        },
    }

    req = urllib.request.Request(
        URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read().decode("utf-8"))

        for candidate in result.get("candidates", []):
            for part in candidate.get("content", {}).get("parts", []):
                if "inlineData" in part:
                    img_data = base64.b64decode(part["inlineData"]["data"])
                    with open(filepath, "wb") as f:
                        f.write(img_data)
                    print(f"  Saved {filepath} ({len(img_data) // 1024}KB)")
                    return True

        print(f"  Warning: No image in response for {filename}")
        print(f"  Response: {json.dumps(result, indent=2)[:500]}")
        return False

    except Exception as e:
        print(f"  Error generating {filename}: {e}")
        return False


def main():
    print(f"Generating {len(PROMPTS)} pixel art covers...\n")
    success = 0
    for i, prompt_data in enumerate(PROMPTS):
        if generate_image(prompt_data):
            success += 1
        if i < len(PROMPTS) - 1:
            time.sleep(2)  # rate limit

    print(f"\nDone! {success}/{len(PROMPTS)} images generated in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
