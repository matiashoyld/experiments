# Chile Voter Demographics Chart

Analysis of voting patterns by education and income in Chilean presidential elections, inspired by the US "education-income voting gap" chart.

## Tech stack
- Python 3 (pandas, numpy, matplotlib)

## How to run
```bash
cd voter-chart-chile
python src/chile_voter_corrected.py    # recommended — uses verified data
python src/alternative_approaches.py   # explores different metrics
```

## Data quality notes
- **2021-2025 data is verified** from SERVEL, Emol, BioBioChile, La Tercera
- **Pre-2021 data is estimated** from academic literature (methodology inconsistencies noted)
- See `README.md` for full data source documentation

## Files
- `src/chile_voter_corrected.py` — main analysis script (use this one)
- `src/alternative_approaches.py` — explores different metrics and methodologies
- `src/chile_voter_analysis.py`, `src/chile_voter_final.py` — original (less reliable) scripts
- `data/voting_gaps_CORRECTED.csv` — verified dataset
- `data/voting_gaps_data.csv` — original dataset (has known issues)
- `output/` — generated charts (PNG + PDF)
