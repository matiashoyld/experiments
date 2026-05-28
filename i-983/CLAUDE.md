# i-983

Fills the **official ICE Form I-983** (Training Plan for STEM OPT Students) by
writing data onto the real fillable government PDF — then auto-sizes and wraps
every field so nothing overflows its box.

## Tech stack

- Python 3 + [PyMuPDF](https://pymupdf.readthedocs.io/) (`pip install pymupdf`)

## Files

| File | What it is | Committed? |
|------|-----------|------------|
| `fill_i983.py` | The filler. Auto-fits font size + explicitly wraps text per field. | yes |
| `i983_blank.pdf` | Official blank form from ice.gov. | no — `*.pdf` is gitignored repo-wide; re-download (below) |
| `data.example.json` | Template with dummy values. | yes |
| `data.json` | **Real personal data (PII).** | **no — gitignored** |
| `*_filled.pdf` | Generated output (contains PII). | **no — gitignored** |

> ⚠️ This repo is **public**. `data.json` and filled PDFs are gitignored on
> purpose — never commit real SEVIS IDs, EINs, salaries, etc.

## How to run

```bash
pip install pymupdf
curl -L -o i983_blank.pdf https://www.ice.gov/doclib/sevis/pdf/i983.pdf  # official blank form
cp data.example.json data.json   # then edit data.json with real values
python3 fill_i983.py             # -> writes the PDF named in "output_name"
```

Optional args: `python3 fill_i983.py [data.json] [i983_blank.pdf] [output.pdf]`

## How it works

- Matches each AcroForm field by its (normalized) name; long narrative fields
  match by prefix because the real field names embed the full question text.
- **Single-line** fields shrink the font until the text fits the width.
- **Multi-line** fields (and any box taller than ~24pt) pick the largest font
  whose word-wrapped text fits the box height, then the wrapped lines are
  written back with explicit `\n` so the rendered result is deterministic
  (independent of the PDF viewer's own wrapping).
- Over-wide unbreakable tokens (emails, URLs) are split at `@ . - _ /`.
- The 4 "Other Compensation" boxes are treated as 4 lines of one paragraph.
- Signature fields, signing dates, and the "Based on Prior Degree?" checkbox
  are intentionally left blank/unchecked.

## Verifying the print layout

Render pages to PNG and eyeball them (this is how overflow was caught/fixed):

```python
import fitz
doc = fitz.open("I-983_filled.pdf")
for i, page in enumerate(doc):
    page.get_pixmap(dpi=150).save(f"/tmp/i983_p{i+1}.png")
```
