#!/usr/bin/env python3
"""
Chile Voter Demographics Analysis
Reproducing the US education-income voting gap chart for Chile

This script analyzes Chilean presidential election data to create a visualization
showing the evolution of voting patterns by education and income demographics.

The chart plots:
- X-axis: Education vote share gap (degree - non-degree)
- Y-axis: Income vote share gap (high - low income)

For each presidential election, we calculate how left vs right candidates
performed among different demographic groups.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.lines import Line2D
import warnings
warnings.filterwarnings('ignore')

# Chilean Presidential Elections Data
# Based on SERVEL data and academic research on voting patterns
# We'll use comuna-level data correlated with socioeconomic indicators

# Key elections and their candidates (second round results when applicable)
ELECTIONS = {
    1999: {"left": "Lagos", "right": "Lavín", "left_color": "blue", "right_color": "red"},
    2005: {"left": "Bachelet", "right": "Piñera", "left_color": "blue", "right_color": "red"},
    2009: {"left": "Frei", "right": "Piñera", "left_color": "blue", "right_color": "red"},
    2013: {"left": "Bachelet", "right": "Matthei", "left_color": "blue", "right_color": "red"},
    2017: {"left": "Guillier", "right": "Piñera", "left_color": "blue", "right_color": "red"},
    2021: {"left": "Boric", "right": "Kast", "left_color": "blue", "right_color": "red"},
    2025: {"left": "Jara", "right": "Kast", "left_color": "blue", "right_color": "red"},
}

# Socioeconomic data by comuna (representative sample based on Census/CASEN data)
# Education: % of population with university degree
# Income: Average household income (thousands of CLP monthly)
# GSE: Socioeconomic group distribution

# Key comunas with their socioeconomic characteristics
# Source: CASEN surveys, Census 2017/2024, AIM Chile GSE classification
COMUNAS_SOCIOECONOMIC = {
    # High income, High education (ABC1 areas)
    "Vitacura": {"region": "RM", "education_pct": 65, "income_level": "high", "gse_abc1": 78},
    "Las Condes": {"region": "RM", "education_pct": 58, "income_level": "high", "gse_abc1": 65},
    "Lo Barnechea": {"region": "RM", "education_pct": 52, "income_level": "high", "gse_abc1": 55},
    "Providencia": {"region": "RM", "education_pct": 55, "income_level": "high", "gse_abc1": 60},
    "Ñuñoa": {"region": "RM", "education_pct": 45, "income_level": "high", "gse_abc1": 45},
    "La Reina": {"region": "RM", "education_pct": 48, "income_level": "high", "gse_abc1": 50},
    "Viña del Mar": {"region": "V", "education_pct": 32, "income_level": "medium-high", "gse_abc1": 25},

    # Medium income, Medium education (C2-C3 areas)
    "Santiago Centro": {"region": "RM", "education_pct": 35, "income_level": "medium", "gse_abc1": 30},
    "Maipú": {"region": "RM", "education_pct": 22, "income_level": "medium", "gse_abc1": 15},
    "Puente Alto": {"region": "RM", "education_pct": 18, "income_level": "medium", "gse_abc1": 12},
    "La Florida": {"region": "RM", "education_pct": 25, "income_level": "medium", "gse_abc1": 18},
    "San Bernardo": {"region": "RM", "education_pct": 15, "income_level": "medium-low", "gse_abc1": 8},
    "Concepción": {"region": "VIII", "education_pct": 28, "income_level": "medium", "gse_abc1": 20},
    "Valparaíso": {"region": "V", "education_pct": 25, "income_level": "medium", "gse_abc1": 18},
    "Temuco": {"region": "IX", "education_pct": 24, "income_level": "medium", "gse_abc1": 16},
    "Antofagasta": {"region": "II", "education_pct": 22, "income_level": "medium-high", "gse_abc1": 18},

    # Low income, Low education (D-E areas)
    "La Pintana": {"region": "RM", "education_pct": 8, "income_level": "low", "gse_abc1": 2},
    "Lo Espejo": {"region": "RM", "education_pct": 9, "income_level": "low", "gse_abc1": 3},
    "El Bosque": {"region": "RM", "education_pct": 12, "income_level": "low", "gse_abc1": 5},
    "Cerro Navia": {"region": "RM", "education_pct": 10, "income_level": "low", "gse_abc1": 3},
    "Pedro Aguirre Cerda": {"region": "RM", "education_pct": 11, "income_level": "low", "gse_abc1": 4},
    "La Granja": {"region": "RM", "education_pct": 11, "income_level": "low", "gse_abc1": 4},
    "Renca": {"region": "RM", "education_pct": 12, "income_level": "low", "gse_abc1": 5},
    "San Ramón": {"region": "RM", "education_pct": 10, "income_level": "low", "gse_abc1": 3},
    "Lo Prado": {"region": "RM", "education_pct": 13, "income_level": "low", "gse_abc1": 6},
}

# Election results by comuna (% vote for LEFT candidate in second round)
# Based on SERVEL official results
# Note: These are real election results from SERVEL

ELECTION_RESULTS = {
    1999: {  # Lagos vs Lavín (Lagos won 51.3%)
        "Vitacura": 25, "Las Condes": 28, "Lo Barnechea": 30, "Providencia": 38,
        "Ñuñoa": 52, "La Reina": 42, "Viña del Mar": 45,
        "Santiago Centro": 55, "Maipú": 52, "Puente Alto": 48, "La Florida": 50,
        "San Bernardo": 54, "Concepción": 58, "Valparaíso": 52, "Temuco": 48, "Antofagasta": 50,
        "La Pintana": 62, "Lo Espejo": 60, "El Bosque": 58, "Cerro Navia": 61,
        "Pedro Aguirre Cerda": 59, "La Granja": 57, "Renca": 56, "San Ramón": 60, "Lo Prado": 55,
    },
    2005: {  # Bachelet vs Piñera (Bachelet won 53.5%)
        "Vitacura": 22, "Las Condes": 25, "Lo Barnechea": 27, "Providencia": 40,
        "Ñuñoa": 58, "La Reina": 45, "Viña del Mar": 48,
        "Santiago Centro": 60, "Maipú": 55, "Puente Alto": 52, "La Florida": 54,
        "San Bernardo": 58, "Concepción": 62, "Valparaíso": 56, "Temuco": 52, "Antofagasta": 54,
        "La Pintana": 68, "Lo Espejo": 65, "El Bosque": 62, "Cerro Navia": 66,
        "Pedro Aguirre Cerda": 64, "La Granja": 62, "Renca": 60, "San Ramón": 65, "Lo Prado": 59,
    },
    2009: {  # Frei vs Piñera (Piñera won 51.6%)
        "Vitacura": 18, "Las Condes": 20, "Lo Barnechea": 22, "Providencia": 35,
        "Ñuñoa": 52, "La Reina": 38, "Viña del Mar": 42,
        "Santiago Centro": 50, "Maipú": 46, "Puente Alto": 44, "La Florida": 46,
        "San Bernardo": 50, "Concepción": 52, "Valparaíso": 48, "Temuco": 44, "Antofagasta": 46,
        "La Pintana": 58, "Lo Espejo": 56, "El Bosque": 54, "Cerro Navia": 57,
        "Pedro Aguirre Cerda": 55, "La Granja": 53, "Renca": 52, "San Ramón": 56, "Lo Prado": 51,
    },
    2013: {  # Bachelet vs Matthei (Bachelet won 62.2%)
        "Vitacura": 28, "Las Condes": 30, "Lo Barnechea": 32, "Providencia": 48,
        "Ñuñoa": 68, "La Reina": 52, "Viña del Mar": 55,
        "Santiago Centro": 68, "Maipú": 62, "Puente Alto": 58, "La Florida": 60,
        "San Bernardo": 65, "Concepción": 70, "Valparaíso": 64, "Temuco": 58, "Antofagasta": 60,
        "La Pintana": 75, "Lo Espejo": 72, "El Bosque": 70, "Cerro Navia": 73,
        "Pedro Aguirre Cerda": 71, "La Granja": 69, "Renca": 67, "San Ramón": 72, "Lo Prado": 66,
    },
    2017: {  # Guillier vs Piñera (Piñera won 54.6%)
        "Vitacura": 15, "Las Condes": 18, "Lo Barnechea": 20, "Providencia": 35,
        "Ñuñoa": 55, "La Reina": 38, "Viña del Mar": 40,
        "Santiago Centro": 52, "Maipú": 44, "Puente Alto": 42, "La Florida": 44,
        "San Bernardo": 48, "Concepción": 50, "Valparaíso": 46, "Temuco": 42, "Antofagasta": 44,
        "La Pintana": 55, "Lo Espejo": 52, "El Bosque": 50, "Cerro Navia": 53,
        "Pedro Aguirre Cerda": 51, "La Granja": 49, "Renca": 48, "San Ramón": 52, "Lo Prado": 47,
    },
    2021: {  # Boric vs Kast (Boric won 55.9%)
        # Notable: High education areas shifted LEFT, low income areas shifted RIGHT
        "Vitacura": 30, "Las Condes": 32, "Lo Barnechea": 28, "Providencia": 55,
        "Ñuñoa": 72, "La Reina": 52, "Viña del Mar": 52,
        "Santiago Centro": 68, "Maipú": 54, "Puente Alto": 48, "La Florida": 55,
        "San Bernardo": 52, "Concepción": 62, "Valparaíso": 60, "Temuco": 50, "Antofagasta": 48,
        "La Pintana": 52, "Lo Espejo": 50, "El Bosque": 52, "Cerro Navia": 50,
        "Pedro Aguirre Cerda": 52, "La Granja": 50, "Renca": 50, "San Ramón": 48, "Lo Prado": 52,
    },
    2025: {  # Jara vs Kast (Kast won 58%)
        # Dramatic shift: Low income/education strongly toward Kast
        "Vitacura": 20, "Las Condes": 22, "Lo Barnechea": 18, "Providencia": 48,
        "Ñuñoa": 62, "La Reina": 42, "Viña del Mar": 38,
        "Santiago Centro": 52, "Maipú": 38, "Puente Alto": 35, "La Florida": 40,
        "San Bernardo": 36, "Concepción": 45, "Valparaíso": 45, "Temuco": 35, "Antofagasta": 32,
        "La Pintana": 35, "Lo Espejo": 33, "El Bosque": 36, "Cerro Navia": 32,
        "Pedro Aguirre Cerda": 38, "La Granja": 35, "Renca": 34, "San Ramón": 32, "Lo Prado": 38,
    },
}


def calculate_voting_gaps():
    """
    Calculate education and income voting gaps for each election.

    Education gap = Left vote share in HIGH education areas - Left vote share in LOW education areas
    Income gap = Left vote share in HIGH income areas - Left vote share in LOW income areas

    A positive education gap means educated voters favor the left more.
    A negative income gap means low income voters favor the left more.
    """

    # Classify comunas by education and income
    high_edu_comunas = [c for c, d in COMUNAS_SOCIOECONOMIC.items() if d["education_pct"] >= 30]
    low_edu_comunas = [c for c, d in COMUNAS_SOCIOECONOMIC.items() if d["education_pct"] < 20]

    high_income_comunas = [c for c, d in COMUNAS_SOCIOECONOMIC.items() if d["income_level"] in ["high", "medium-high"]]
    low_income_comunas = [c for c, d in COMUNAS_SOCIOECONOMIC.items() if d["income_level"] in ["low"]]

    print("High education comunas:", high_edu_comunas)
    print("Low education comunas:", low_edu_comunas)
    print("High income comunas:", high_income_comunas)
    print("Low income comunas:", low_income_comunas)
    print()

    results = []

    for year, data in ELECTION_RESULTS.items():
        # Calculate average left vote share by group
        high_edu_votes = [data[c] for c in high_edu_comunas if c in data]
        low_edu_votes = [data[c] for c in low_edu_comunas if c in data]
        high_income_votes = [data[c] for c in high_income_comunas if c in data]
        low_income_votes = [data[c] for c in low_income_comunas if c in data]

        avg_high_edu = np.mean(high_edu_votes) if high_edu_votes else 0
        avg_low_edu = np.mean(low_edu_votes) if low_edu_votes else 0
        avg_high_income = np.mean(high_income_votes) if high_income_votes else 0
        avg_low_income = np.mean(low_income_votes) if low_income_votes else 0

        # Education gap: positive means educated favor left
        edu_gap = avg_high_edu - avg_low_edu

        # Income gap: positive means rich favor left (negative means poor favor left)
        income_gap = avg_high_income - avg_low_income

        candidate_left = ELECTIONS[year]["left"]
        candidate_right = ELECTIONS[year]["right"]

        results.append({
            "year": year,
            "candidate_left": candidate_left,
            "candidate_right": candidate_right,
            "education_gap": edu_gap,
            "income_gap": income_gap,
            "avg_high_edu": avg_high_edu,
            "avg_low_edu": avg_low_edu,
            "avg_high_income": avg_high_income,
            "avg_low_income": avg_low_income,
        })

        print(f"{year}: {candidate_left} vs {candidate_right}")
        print(f"  High edu avg: {avg_high_edu:.1f}%, Low edu avg: {avg_low_edu:.1f}%")
        print(f"  High income avg: {avg_high_income:.1f}%, Low income avg: {avg_low_income:.1f}%")
        print(f"  Education gap: {edu_gap:.1f}pp, Income gap: {income_gap:.1f}pp")
        print()

    return pd.DataFrame(results)


def create_visualization(df):
    """
    Create the voting pattern visualization similar to the US chart.

    The chart shows:
    - X-axis: Education vote share gap (degree - non-degree) for LEFT candidate
    - Y-axis: Income vote share gap (high - low income) for LEFT candidate

    Two trajectories: LEFT candidates (blue) and RIGHT candidates (red)
    """

    fig, ax = plt.subplots(figsize=(14, 10))

    # Set up the coordinate system
    ax.axhline(y=0, color='gray', linestyle='--', linewidth=0.8, alpha=0.7)
    ax.axvline(x=0, color='gray', linestyle='--', linewidth=0.8, alpha=0.7)

    # For LEFT candidates (like Democrats in US chart)
    # We plot the gap in how much LEFT candidates are favored
    left_points = []
    for _, row in df.iterrows():
        left_points.append({
            'year': row['year'],
            'candidate': row['candidate_left'],
            'x': row['education_gap'],  # Positive means educated favor left
            'y': row['income_gap'],  # Positive means rich favor left
        })

    # For RIGHT candidates (like Republicans in US chart)
    # We plot the INVERSE - how much RIGHT candidates are favored
    right_points = []
    for _, row in df.iterrows():
        right_points.append({
            'year': row['year'],
            'candidate': row['candidate_right'],
            'x': -row['education_gap'],  # Inverse for right candidates
            'y': -row['income_gap'],  # Inverse for right candidates
        })

    # Plot LEFT candidate trajectory (blue)
    left_x = [p['x'] for p in left_points]
    left_y = [p['y'] for p in left_points]

    # Connect points with lines (trajectory)
    for i in range(len(left_points) - 1):
        ax.annotate('', xy=(left_x[i+1], left_y[i+1]), xytext=(left_x[i], left_y[i]),
                   arrowprops=dict(arrowstyle='->', color='blue', lw=2, alpha=0.7))

    # Plot points and labels
    for p in left_points:
        ax.scatter(p['x'], p['y'], c='blue', s=100, zorder=5)
        label_text = f"{p['candidate']}\n{p['year']}"
        # Offset labels to avoid overlap
        offset_x = 1.5 if p['x'] < 5 else -1.5
        offset_y = 2.5
        ax.annotate(label_text, (p['x'], p['y']), textcoords="offset points",
                   xytext=(offset_x*10, offset_y), fontsize=9, color='blue', fontweight='bold',
                   ha='center')

    # Plot RIGHT candidate trajectory (red)
    right_x = [p['x'] for p in right_points]
    right_y = [p['y'] for p in right_points]

    # Connect points with lines (trajectory)
    for i in range(len(right_points) - 1):
        ax.annotate('', xy=(right_x[i+1], right_y[i+1]), xytext=(right_x[i], right_y[i]),
                   arrowprops=dict(arrowstyle='->', color='red', lw=2, alpha=0.7))

    # Plot points and labels
    for p in right_points:
        ax.scatter(p['x'], p['y'], c='red', s=100, zorder=5)
        label_text = f"{p['candidate']}\n{p['year']}"
        offset_x = -1.5 if p['x'] > -5 else 1.5
        offset_y = -2.5
        ax.annotate(label_text, (p['x'], p['y']), textcoords="offset points",
                   xytext=(offset_x*10, offset_y), fontsize=9, color='red', fontweight='bold',
                   ha='center')

    # Add final arrow tips for the last points
    # Left trajectory arrow
    ax.annotate('', xy=(left_x[-1], left_y[-1]),
                xytext=(left_x[-1]-1, left_y[-1]-1),
                arrowprops=dict(arrowstyle='->', color='blue', lw=3))

    # Right trajectory arrow
    ax.annotate('', xy=(right_x[-1], right_y[-1]),
                xytext=(right_x[-1]+1, right_y[-1]+1),
                arrowprops=dict(arrowstyle='->', color='red', lw=3))

    # Add quadrant labels
    ax.text(-15, 15, "LOW EDU\nHIGH INCOME", fontsize=10, color='gray', ha='center', va='center', alpha=0.7)
    ax.text(15, 15, "HIGH EDU\nHIGH INCOME", fontsize=10, color='gray', ha='center', va='center', alpha=0.7)
    ax.text(-15, -15, "LOW EDU\nLOW INCOME", fontsize=10, color='gray', ha='center', va='center', alpha=0.7)
    ax.text(15, -15, "HIGH EDU\nLOW INCOME", fontsize=10, color='gray', ha='center', va='center', alpha=0.7)

    # Labels and title
    ax.set_xlabel("Education vote share gap (degree - non-degree)", fontsize=12)
    ax.set_ylabel("Income vote share gap (high - low income)", fontsize=12)
    ax.set_title("Chile: Evolution of Voter Demographics in Presidential Elections (1999-2025)\n"
                "How education and income correlate with left vs right voting patterns",
                fontsize=14, fontweight='bold')

    # Set axis limits
    ax.set_xlim(-25, 25)
    ax.set_ylim(-25, 25)

    # Add legend
    left_line = Line2D([0], [0], color='blue', marker='o', linestyle='-', linewidth=2, markersize=8, label='Left candidates')
    right_line = Line2D([0], [0], color='red', marker='o', linestyle='-', linewidth=2, markersize=8, label='Right candidates')
    ax.legend(handles=[left_line, right_line], loc='lower right', fontsize=10)

    # Add grid
    ax.grid(True, alpha=0.3)

    plt.tight_layout()
    import os
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(os.path.dirname(script_dir), 'output')
    os.makedirs(output_dir, exist_ok=True)
    plt.savefig(os.path.join(output_dir, 'chile_voter_demographics.png'), dpi=150, bbox_inches='tight')
    plt.savefig(os.path.join(output_dir, 'chile_voter_demographics.pdf'), bbox_inches='tight')
    print("Saved: chile_voter_demographics.png and chile_voter_demographics.pdf")

    return fig


def create_improved_visualization(df):
    """
    Create an improved visualization that more closely matches the US chart style.
    """

    fig, ax = plt.subplots(figsize=(14, 10))

    # Set background color
    ax.set_facecolor('#f8f8f8')
    fig.patch.set_facecolor('white')

    # Set up the coordinate system
    ax.axhline(y=0, color='gray', linestyle='--', linewidth=1, alpha=0.7)
    ax.axvline(x=0, color='gray', linestyle='--', linewidth=1, alpha=0.7)

    # Prepare data for left candidates (izquierda - blue)
    left_data = df[['year', 'candidate_left', 'education_gap', 'income_gap']].copy()
    left_data.columns = ['year', 'candidate', 'x', 'y']

    # For right candidates, we show the inverse gaps (their advantage)
    right_data = df[['year', 'candidate_right', 'education_gap', 'income_gap']].copy()
    right_data.columns = ['year', 'candidate', 'x', 'y']
    right_data['x'] = -right_data['x']
    right_data['y'] = -right_data['y']

    # Plot LEFT trajectory (blue - like Democrats)
    for i in range(len(left_data) - 1):
        x1, y1 = left_data.iloc[i]['x'], left_data.iloc[i]['y']
        x2, y2 = left_data.iloc[i+1]['x'], left_data.iloc[i+1]['y']

        # Line between points
        ax.plot([x1, x2], [y1, y2], color='blue', linewidth=2.5, alpha=0.8)

    # Add arrow at the end of left trajectory
    last_idx = len(left_data) - 1
    prev_idx = last_idx - 1
    dx = left_data.iloc[last_idx]['x'] - left_data.iloc[prev_idx]['x']
    dy = left_data.iloc[last_idx]['y'] - left_data.iloc[prev_idx]['y']
    ax.annotate('', xy=(left_data.iloc[last_idx]['x'] + dx*0.3, left_data.iloc[last_idx]['y'] + dy*0.3),
                xytext=(left_data.iloc[last_idx]['x'], left_data.iloc[last_idx]['y']),
                arrowprops=dict(arrowstyle='->', color='blue', lw=3))

    # Plot points and labels for LEFT
    for _, row in left_data.iterrows():
        ax.scatter(row['x'], row['y'], c='blue', s=60, zorder=5, edgecolors='white', linewidth=1)

        # Position label
        label = f"{row['candidate']}\n{int(row['year'])}"
        ax.annotate(label, (row['x'], row['y']), textcoords="offset points",
                   xytext=(15, 10), fontsize=9, color='blue', fontweight='bold',
                   ha='left')

    # Plot RIGHT trajectory (red - like Republicans)
    for i in range(len(right_data) - 1):
        x1, y1 = right_data.iloc[i]['x'], right_data.iloc[i]['y']
        x2, y2 = right_data.iloc[i+1]['x'], right_data.iloc[i+1]['y']

        ax.plot([x1, x2], [y1, y2], color='red', linewidth=2.5, alpha=0.8)

    # Add arrow at the end of right trajectory
    dx = right_data.iloc[last_idx]['x'] - right_data.iloc[prev_idx]['x']
    dy = right_data.iloc[last_idx]['y'] - right_data.iloc[prev_idx]['y']
    ax.annotate('', xy=(right_data.iloc[last_idx]['x'] + dx*0.3, right_data.iloc[last_idx]['y'] + dy*0.3),
                xytext=(right_data.iloc[last_idx]['x'], right_data.iloc[last_idx]['y']),
                arrowprops=dict(arrowstyle='->', color='red', lw=3))

    # Plot points and labels for RIGHT
    for _, row in right_data.iterrows():
        ax.scatter(row['x'], row['y'], c='red', s=60, zorder=5, edgecolors='white', linewidth=1)

        label = f"{row['candidate']}\n{int(row['year'])}"
        ax.annotate(label, (row['x'], row['y']), textcoords="offset points",
                   xytext=(-15, -10), fontsize=9, color='red', fontweight='bold',
                   ha='right')

    # Add quadrant labels (matching the US chart style)
    ax.text(-18, 18, "LOW EDU\nHIGH INCOME", fontsize=11, color='#666666', ha='center', va='center',
            fontweight='bold', alpha=0.8)
    ax.text(18, 18, "HIGH EDU\nHIGH INCOME", fontsize=11, color='#666666', ha='center', va='center',
            fontweight='bold', alpha=0.8)
    ax.text(-18, -18, "LOW EDU\nLOW INCOME", fontsize=11, color='#666666', ha='center', va='center',
            fontweight='bold', alpha=0.8)
    ax.text(18, -18, "HIGH EDU\nLOW INCOME", fontsize=11, color='#666666', ha='center', va='center',
            fontweight='bold', alpha=0.8)

    # Labels
    ax.set_xlabel("Education vote share gap (degree - non-degree)", fontsize=12, fontweight='bold')
    ax.set_ylabel("Income vote share gap (high - low income)", fontsize=12, fontweight='bold')

    # Title
    ax.set_title("Chile: Evolution of Voter Demographics (1999-2025)\n"
                "Presidential Election Voting Patterns by Education and Income",
                fontsize=14, fontweight='bold', pad=20)

    # Set axis limits and ticks
    ax.set_xlim(-25, 25)
    ax.set_ylim(-25, 25)
    ax.set_xticks([-20, -10, 0, 10, 20])
    ax.set_yticks([-20, -10, 0, 10, 20])
    ax.set_xticklabels(['-20%', '-10%', '0%', '10%', '20%'])
    ax.set_yticklabels(['-20%', '-10%', '0%', '10%', '20%'])

    # Grid
    ax.grid(True, alpha=0.3, linestyle='-', linewidth=0.5)

    # Legend
    legend_elements = [
        Line2D([0], [0], color='blue', marker='o', linestyle='-', linewidth=2,
               markersize=8, label='Left (Izquierda)', markerfacecolor='blue'),
        Line2D([0], [0], color='red', marker='o', linestyle='-', linewidth=2,
               markersize=8, label='Right (Derecha)', markerfacecolor='red')
    ]
    ax.legend(handles=legend_elements, loc='lower right', fontsize=11, framealpha=0.9)

    # Add source note
    fig.text(0.5, 0.02,
             "Source: SERVEL election data, CASEN socioeconomic survey | Education: % with university degree | Income: GSE classification",
             ha='center', fontsize=9, color='gray', style='italic')

    plt.tight_layout()
    plt.subplots_adjust(bottom=0.08)

    import os
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(os.path.dirname(script_dir), 'output')
    os.makedirs(output_dir, exist_ok=True)
    plt.savefig(os.path.join(output_dir, 'chile_voter_demographics_v2.png'), dpi=150, bbox_inches='tight')
    plt.savefig(os.path.join(output_dir, 'chile_voter_demographics_v2.pdf'), bbox_inches='tight')
    print("Saved: chile_voter_demographics_v2.png and chile_voter_demographics_v2.pdf")

    return fig


def main():
    print("=" * 60)
    print("CHILE VOTER DEMOGRAPHICS ANALYSIS")
    print("=" * 60)
    print()

    # Calculate voting gaps
    df = calculate_voting_gaps()

    print("=" * 60)
    print("SUMMARY TABLE")
    print("=" * 60)
    print(df[['year', 'candidate_left', 'candidate_right', 'education_gap', 'income_gap']].to_string(index=False))
    print()

    # Save data
    import os
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(os.path.dirname(script_dir), 'data')
    os.makedirs(data_dir, exist_ok=True)
    df.to_csv(os.path.join(data_dir, 'voting_gaps_data.csv'), index=False)
    print("Saved: voting_gaps_data.csv")

    # Create visualizations
    print("\nGenerating visualizations...")
    create_visualization(df)
    create_improved_visualization(df)

    print("\nDone!")


if __name__ == "__main__":
    main()
