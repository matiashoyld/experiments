#!/usr/bin/env python3
"""Fill the official ICE Form I-983 (STEM OPT Training Plan) AcroForm PDF.

Usage:
    python3 fill_i983.py [data.json] [i983_blank.pdf] [output.pdf]

For every text field the script auto-sizes the font and *explicitly* wraps the
text so what is computed is exactly what renders -- no reliance on a viewer's
own wrapping. Long unbreakable tokens (emails, URLs) are broken at natural
boundaries (@ . - _ /) so they never overflow their column. Signature fields,
date fields, and the "Based on Prior Degree?" checkbox are left blank/unchecked.

Requires: pymupdf  (pip install pymupdf)
"""
import json
import re
import sys

import fitz  # PyMuPDF

FONT = "helv"           # Helvetica (PDF base-14; identical metrics in every viewer)
MULTILINE_FLAG = 4096   # PDF text-field "multiline" flag bit
BREAK_AFTER = set("@./-_")

NARRATIVE_PREFIXES = {
    "studentrole": "studentrole",
    "goalsandobjectives": "goalsandobjectives",
    "employeroversight": "employeroversight",
    "measuresandassessments": "measuresandassessments",
    "additionalremarks": "additionalremarks",
}


def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", s.lower())


def sanitize(text: str) -> str:
    """Replace non-Latin-1 typographic characters so they render in Helvetica."""
    for a, b in {"’": "'", "‘": "'", "“": '"', "”": '"',
                 "–": "-", "—": "-", "…": "...", " ": " "}.items():
        text = text.replace(a, b)
    return text


def tlen(text: str, fs: float) -> float:
    return fitz.get_text_length(text, fontname=FONT, fontsize=fs)


def break_token(word: str, fs: float, usable_w: float):
    """Split a single over-wide word into pieces that each fit, preferring to
    break right after a delimiter (so emails/URLs split at @ . / etc.)."""
    pieces = []
    while tlen(word, fs) > usable_w and len(word) > 1:
        k = 1
        while k < len(word) and tlen(word[:k + 1], fs) <= usable_w:
            k += 1
        bp = next((j for j in range(k, 0, -1) if word[j - 1] in BREAK_AFTER), k)
        pieces.append(word[:bp])
        word = word[bp:]
    pieces.append(word)
    return pieces


def wrap_lines(text: str, fs: float, usable_w: float):
    lines = []
    for para in text.split("\n"):
        cur = ""
        for word in para.split(" "):
            if not word:
                continue
            trial = word if not cur else cur + " " + word
            if tlen(trial, fs) <= usable_w:
                cur = trial
                continue
            if cur:
                lines.append(cur)
                cur = ""
            if tlen(word, fs) <= usable_w:
                cur = word
            else:                                   # unbreakable / over-wide word
                parts = break_token(word, fs, usable_w)
                lines.extend(parts[:-1])
                cur = parts[-1]
        lines.append(cur)
    return lines


def fit_multiline(text, box_w, box_h, max_fs=11.0, min_fs=6.0,
                  pad_w=6, pad_h=8, lh=1.22):
    """Return (font_size, wrapped_lines) for the largest size that fits the box."""
    uw, uh = box_w - pad_w, box_h - pad_h
    fs = max_fs
    while fs >= min_fs:
        lines = wrap_lines(text, fs, uw)
        if len(lines) * fs * lh <= uh:
            return round(fs, 2), lines
        fs -= 0.25
    return min_fs, wrap_lines(text, min_fs, uw)


def fit_singleline(text, box_w, box_h, default=10.5, min_fs=6.0, pad_w=4):
    fs = min(default, max(box_h - 3.0, min_fs))     # cap by box height
    uw = box_w - pad_w
    while fs > min_fs and tlen(text, fs) > uw:
        fs -= 0.25
    return round(fs, 2)


def set_field(w, value, fs, multiline=False):
    if multiline:
        w.field_flags = w.field_flags | MULTILINE_FLAG
    w.text_font = FONT
    w.text_fontsize = fs
    w.field_value = value
    w.update()


def main():
    data_path = sys.argv[1] if len(sys.argv) > 1 else "data.json"
    blank_path = sys.argv[2] if len(sys.argv) > 2 else "i983_blank.pdf"
    with open(data_path) as f:
        data = json.load(f)
    out_path = sys.argv[3] if len(sys.argv) > 3 else data.get("output_name", "i983_filled.pdf")

    fields = {norm(k): sanitize(str(v)) for k, v in data["fields"].items()}
    narratives = {k: sanitize(v) for k, v in data.get("narratives", {}).items()}

    # Compensation: wrap the prose across the 4 single-line "Other Compensation" boxes.
    comp = sanitize(data.get("compensation_paragraph", ""))
    comp_lines, comp_fs = ["", "", "", ""], 9.0
    if comp:
        fs = 9.0
        while fs >= 6.0:
            wl = wrap_lines(comp, fs, 343 - 6)
            if len(wl) <= 4:
                comp_lines, comp_fs = (wl + ["", "", "", ""])[:4], fs
                break
            fs -= 0.25

    doc = fitz.open(blank_path)
    report, filled, skipped = [], 0, 0
    for pno, page in enumerate(doc):
        for w in page.widgets():
            name, nn, ftype, rect = w.field_name, norm(w.field_name), w.field_type, w.rect

            if ftype == fitz.PDF_WIDGET_TYPE_SIGNATURE:
                continue
            if ftype == fitz.PDF_WIDGET_TYPE_CHECKBOX:
                report.append(f"  p{pno+1} [checkbox] {name!r} -> UNCHECKED")
                continue

            # 1) Compensation lines
            m = re.search(r"othercompensation.*?(\d)\s*$", nn)
            if m and comp:
                idx = int(m.group(1)) - 1
                if 0 <= idx < 4 and comp_lines[idx]:
                    set_field(w, comp_lines[idx], comp_fs)
                    filled += 1
                    report.append(f"  p{pno+1} [comp{idx+1} fs{comp_fs}] {comp_lines[idx]!r}")
                continue

            # 2) Narratives / remarks (matched by normalized prefix)
            value, is_multiline = None, False
            for prefix, key in NARRATIVE_PREFIXES.items():
                if nn.startswith(prefix):
                    value, is_multiline = narratives.get(key), True
                    break

            # 3) Everything else by exact normalized name
            if value is None:
                value = fields.get(nn)
                is_multiline = rect.height > 24 or bool(w.field_flags & MULTILINE_FLAG)

            if not value:
                skipped += 1
                continue

            if is_multiline:
                fs, lines = fit_multiline(value, rect.width, rect.height)
                set_field(w, "\n".join(lines), fs, multiline=True)
                shape = f"{len(lines)}ln"
            else:
                fs = fit_singleline(value, rect.width, rect.height)
                set_field(w, value, fs)
                shape = "1ln"
            filled += 1
            prev = value if len(value) < 56 else value[:53] + "..."
            report.append(f"  p{pno+1} [{shape} fs{fs}] {name[:34]!r} = {prev!r}")

    doc.save(out_path, deflate=True, garbage=4)
    doc.close()
    print(f"Saved: {out_path}\nFilled {filled} fields, skipped {skipped} empty/blank.\n")
    print("Fill report:\n" + "\n".join(report))


if __name__ == "__main__":
    main()
