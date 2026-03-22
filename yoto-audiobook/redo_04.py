#!/usr/bin/env python3
import urllib.request, json, base64, os, time

API_KEY = os.environ["GEMINI_API_KEY"]
MODEL = "nano-banana-pro-preview"
URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

STYLE = (
    "8-bit pixel art, NES style, very low resolution, 32x32 pixel grid, "
    "extremely simple, flat colors, no gradients, thick chunky pixels, "
    "limited color palette (max 5 colors), solid color background filling entire image. "
    "Square format. No text. No borders. No frames. No white space."
)

prompt = {
    "file": "cover_part_04.png",
    "prompt": f"{STYLE} Two red rocket fireworks with yellow stripes flying upward with small colorful star sparks at top. Solid dark navy blue background filling entire image."
}

filepath = os.path.join(OUTPUT_DIR, prompt["file"])
print(f"Generating {prompt['file']}...")

payload = {
    "contents": [{"parts": [{"text": prompt["prompt"]}]}],
    "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]},
}

req = urllib.request.Request(URL, data=json.dumps(payload).encode("utf-8"),
    headers={"Content-Type": "application/json"}, method="POST")

with urllib.request.urlopen(req, timeout=60) as resp:
    result = json.loads(resp.read().decode("utf-8"))

for candidate in result.get("candidates", []):
    for part in candidate.get("content", {}).get("parts", []):
        if "inlineData" in part:
            img_data = base64.b64decode(part["inlineData"]["data"])
            with open(filepath, "wb") as f:
                f.write(img_data)
            print(f"  Saved ({len(img_data) // 1024}KB)")
