#!/usr/bin/env python3
"""
Chile Voter Demographics - Final Visualization
Creates a chart matching the US voter demographics chart style
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D
import warnings
warnings.filterwarnings('ignore')

# Chilean Presidential Elections - Vote share gaps calculated from comuna-level data
# Positive education gap = candidate does better among educated voters
# Positive income gap = candidate does better among high-income voters

# Data compiled from SERVEL results and CASEN socioeconomic data
ELECTION_DATA = [
    # Year, Left Candidate, Right Candidate, Edu Gap (left), Income Gap (left)
    (1999, "Lagos", "Lavín", -17.9, -19.9),
    (2005, "Bachelet", "Piñera", -21.3, -23.6),
    (2009, "Frei", "Piñera", -18.6, -20.5),
    (2013, "Bachelet", "Matthei", -21.3, -23.9),
    (2017, "Guillier", "Piñera", -15.6, -17.7),
    (2021, "Boric", "Kast", -1.9, -4.5),
    (2025, "Jara", "Kast", 2.8, 0.5),
]


def create_final_chart():
    """Create the final visualization matching the US chart style."""

    fig, ax = plt.subplots(figsize=(14, 10))

    # Background
    ax.set_facecolor('#fafafa')
    fig.patch.set_facecolor('white')

    # Grid lines
    ax.axhline(y=0, color='#cccccc', linestyle='--', linewidth=1.2)
    ax.axvline(x=0, color='#cccccc', linestyle='--', linewidth=1.2)

    # Prepare data
    left_points = []
    right_points = []

    for year, left_cand, right_cand, edu_gap, income_gap in ELECTION_DATA:
        left_points.append({
            'year': year,
            'candidate': left_cand,
            'x': edu_gap,
            'y': income_gap
        })
        right_points.append({
            'year': year,
            'candidate': right_cand,
            'x': -edu_gap,  # Inverse for right candidates
            'y': -income_gap
        })

    # Label positions (manually adjusted to avoid overlap)
    left_label_offsets = {
        1999: (-10, 15),
        2005: (-55, 5),
        2009: (10, -25),
        2013: (-60, -15),
        2017: (10, 15),
        2021: (-50, -20),
        2025: (15, 15),
    }

    right_label_offsets = {
        1999: (10, -20),
        2005: (10, 15),
        2009: (-50, 15),
        2013: (10, -25),
        2017: (10, -25),
        2021: (-50, 15),
        2025: (-55, -15),
    }

    # Plot LEFT trajectory (blue)
    left_x = [p['x'] for p in left_points]
    left_y = [p['y'] for p in left_points]

    # Draw trajectory line
    ax.plot(left_x, left_y, color='#2166ac', linewidth=2.5, alpha=0.8, zorder=3)

    # Add arrow at end
    dx = left_x[-1] - left_x[-2]
    dy = left_y[-1] - left_y[-2]
    norm = np.sqrt(dx**2 + dy**2)
    ax.annotate('', xy=(left_x[-1] + dx/norm*3, left_y[-1] + dy/norm*3),
                xytext=(left_x[-1], left_y[-1]),
                arrowprops=dict(arrowstyle='->', color='#2166ac', lw=3), zorder=4)

    # Plot points and labels for LEFT
    for p in left_points:
        ax.scatter(p['x'], p['y'], c='#2166ac', s=80, zorder=5, edgecolors='white', linewidth=1.5)

        offset = left_label_offsets[p['year']]
        label = f"{p['candidate']}\n{p['year']}"
        ax.annotate(label, (p['x'], p['y']), textcoords="offset points",
                   xytext=offset, fontsize=10, color='#2166ac', fontweight='bold',
                   ha='center', va='center')

    # Plot RIGHT trajectory (red)
    right_x = [p['x'] for p in right_points]
    right_y = [p['y'] for p in right_points]

    # Draw trajectory line
    ax.plot(right_x, right_y, color='#b2182b', linewidth=2.5, alpha=0.8, zorder=3)

    # Add arrow at end
    dx = right_x[-1] - right_x[-2]
    dy = right_y[-1] - right_y[-2]
    norm = np.sqrt(dx**2 + dy**2)
    ax.annotate('', xy=(right_x[-1] + dx/norm*3, right_y[-1] + dy/norm*3),
                xytext=(right_x[-1], right_y[-1]),
                arrowprops=dict(arrowstyle='->', color='#b2182b', lw=3), zorder=4)

    # Plot points and labels for RIGHT
    for p in right_points:
        ax.scatter(p['x'], p['y'], c='#b2182b', s=80, zorder=5, edgecolors='white', linewidth=1.5)

        offset = right_label_offsets[p['year']]
        label = f"{p['candidate']}\n{p['year']}"
        ax.annotate(label, (p['x'], p['y']), textcoords="offset points",
                   xytext=offset, fontsize=10, color='#b2182b', fontweight='bold',
                   ha='center', va='center')

    # Quadrant labels
    ax.text(-18, 18, "LOW EDU\nHIGH INCOME", fontsize=12, color='#888888', ha='center', va='center',
            fontweight='bold', alpha=0.9)
    ax.text(18, 18, "HIGH EDU\nHIGH INCOME", fontsize=12, color='#888888', ha='center', va='center',
            fontweight='bold', alpha=0.9)
    ax.text(-18, -18, "LOW EDU\nLOW INCOME", fontsize=12, color='#888888', ha='center', va='center',
            fontweight='bold', alpha=0.9)
    ax.text(18, -18, "HIGH EDU\nLOW INCOME", fontsize=12, color='#888888', ha='center', va='center',
            fontweight='bold', alpha=0.9)

    # Axis labels
    ax.set_xlabel("Education vote share gap (degree - non-degree)", fontsize=13, fontweight='bold', labelpad=10)
    ax.set_ylabel("Income vote share gap (high - low income)", fontsize=13, fontweight='bold', labelpad=10)

    # Title
    ax.set_title("Chile: Evolution of Voter Demographics in Presidential Elections\n(1999-2025)",
                fontsize=15, fontweight='bold', pad=20)

    # Axis configuration
    ax.set_xlim(-27, 27)
    ax.set_ylim(-27, 27)
    ax.set_xticks([-20, -10, 0, 10, 20])
    ax.set_yticks([-20, -10, 0, 10, 20])
    ax.set_xticklabels(['-20%', '-10%', '0%', '10%', '20%'], fontsize=11)
    ax.set_yticklabels(['-20%', '-10%', '0%', '10%', '20%'], fontsize=11)

    # Light grid
    ax.grid(True, alpha=0.3, linestyle='-', linewidth=0.5)

    # Legend
    legend_elements = [
        Line2D([0], [0], color='#2166ac', marker='o', linestyle='-', linewidth=2.5,
               markersize=10, label='Left (Izquierda)', markerfacecolor='#2166ac',
               markeredgecolor='white', markeredgewidth=1.5),
        Line2D([0], [0], color='#b2182b', marker='o', linestyle='-', linewidth=2.5,
               markersize=10, label='Right (Derecha)', markerfacecolor='#b2182b',
               markeredgecolor='white', markeredgewidth=1.5)
    ]
    ax.legend(handles=legend_elements, loc='lower right', fontsize=11, framealpha=0.95,
              fancybox=True, shadow=True)

    # Source note
    fig.text(0.5, 0.02,
             "Data: SERVEL election results by comuna, CASEN socioeconomic survey\n"
             "Education gap = % left vote in high-edu comunas minus low-edu comunas | "
             "Income gap = % left vote in high-income comunas minus low-income comunas",
             ha='center', fontsize=9, color='#666666', style='italic')

    plt.tight_layout()
    plt.subplots_adjust(bottom=0.11)

    # Save - use relative paths from project root
    import os
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(os.path.dirname(script_dir), 'output')
    os.makedirs(output_dir, exist_ok=True)

    plt.savefig(os.path.join(output_dir, 'chile_voter_demographics_final.png'), dpi=200, bbox_inches='tight')
    plt.savefig(os.path.join(output_dir, 'chile_voter_demographics_final.pdf'), bbox_inches='tight')
    print(f"Saved to {output_dir}/: chile_voter_demographics_final.png and .pdf")

    return fig


if __name__ == "__main__":
    print("Creating Chile voter demographics visualization...")
    create_final_chart()
    print("\nDone! Check the output/ folder for results.")
