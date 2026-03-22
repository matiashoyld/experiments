#!/usr/bin/env python3
"""Regenerate subpar covers."""

import urllib.request
import json
import base64
import os
import time

API_KEY = os.environ["GEMINI_API_KEY"]
MODEL = "nano-banana-pro-preview"
URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

STYLE = (
    "8-bit pixel art, NES/Game Boy style, very low resolution look, 16x16 or 32x32 pixel grid, "
    "extremely simple, minimal detail, flat colors, no gradients, no anti-aliasing, "
    "thick chunky pixels clearly visible, limited color palette (max 4-5 colors), "
    "single centered iconic subject, solid color background filling the entire image. Square format. "
    "Think original Game Boy or early NES sprite art. No text. No borders. No frames. No grid lines."
)

PROMPTS = [
    {
        "file": "cover_part_03.png",
        "prompt": f"{STYLE} A single brown magic wand pointing up with a bright yellow star burst at its tip. Solid dark maroon background."
    },
    {
        "file": "cover_part_04.png",
        "prompt": f"{STYLE} Two simple rocket fireworks shooting upward leaving trails, with small star bursts at the top. Solid black background."
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

    print(f"  Warning: No image in response")
    return False


for i, p in enumerate(PROMPTS):
    generate_image(p)
    if i < len(PROMPTS) - 1:
        time.sleep(2)
