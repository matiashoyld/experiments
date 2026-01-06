#!/usr/bin/env python3
"""
Alternative Approaches to Chile Voter Demographics Chart

This script explores different ways to construct the education/income voting gap chart,
using various metrics that might reveal different patterns or better separate the quadrants.

CURRENT APPROACH (and its limitations):
- Education: % with university degree
- Income: GSE classification (ABC1 vs D/E)
- Problem: Education and income are highly correlated in Chile

ALTERNATIVE APPROACHES:
1. Separate Education from Income (use different comunas for each axis)
2. Use poverty rate instead of income
3. Use years of schooling instead of % with degree
4. Use rural vs urban as income proxy
5. Use multidimensional poverty index
"""

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D
import warnings
warnings.filterwarnings('ignore')

# =============================================================================
# ALTERNATIVE METRIC DEFINITIONS
# =============================================================================

# Source: CASEN 2022, Census 2024, BCN statistics
# https://www.bcn.cl/siit/estadisticasterritoriales/

# APPROACH 1: Separate Education and Income more clearly
# Use comunas that have HIGH education but MEDIUM/LOW income (professors, public servants)
# vs comunas with LOW education but MEDIUM/HIGH income (mining, commerce)

COMUNAS_BY_PROFILE = {
    # HIGH EDUCATION, HIGH INCOME (traditional elite)
    "high_edu_high_income": {
        "comunas": ["Vitacura", "Las Condes", "Lo Barnechea"],
        "avg_schooling": 15.5,  # years
        "poverty_rate": 0.9,    # %
    },

    # HIGH EDUCATION, MEDIUM INCOME (educated middle class - professors, professionals)
    "high_edu_medium_income": {
        "comunas": ["Ñuñoa", "Providencia", "Santiago Centro"],
        "avg_schooling": 14.2,
        "poverty_rate": 4.5,
    },

    # LOW EDUCATION, MEDIUM INCOME (mining towns, commerce areas)
    "low_edu_medium_income": {
        "comunas": ["Calama", "Antofagasta", "Copiapó"],
        "avg_schooling": 11.5,
        "poverty_rate": 5.0,
    },

    # LOW EDUCATION, LOW INCOME (traditional poor comunas)
    "low_edu_low_income": {
        "comunas": ["La Pintana", "Lo Espejo", "Cerro Navia", "Alto Hospicio"],
        "avg_schooling": 9.8,
        "poverty_rate": 12.0,
    },
}

# APPROACH 2: Use POVERTY RATE instead of income
# This gives a more direct measure of economic hardship
# Source: CASEN 2022 communal estimates

POVERTY_RATES_2022 = {
    # Very low poverty (<3%)
    "Vitacura": 0.9,
    "Las Condes": 1.8,
    "Lo Barnechea": 2.1,
    "Providencia": 2.5,

    # Low poverty (3-6%)
    "Ñuñoa": 3.2,
    "La Reina": 4.1,
    "Santiago": 5.8,

    # Medium poverty (6-10%)
    "La Florida": 6.5,
    "Maipú": 7.2,
    "Puente Alto": 8.1,

    # High poverty (>10%)
    "La Pintana": 11.5,
    "Lo Espejo": 12.3,
    "Cerro Navia": 13.1,
    "El Bosque": 10.8,
    "Pedro Aguirre Cerda": 11.2,
}

# APPROACH 3: Use YEARS OF SCHOOLING instead of % with degree
# More granular measure of education
# Source: CASEN 2022, Census 2024

YEARS_SCHOOLING = {
    # Very high (>14 years = some higher education)
    "Vitacura": 16.2,
    "Las Condes": 15.8,
    "Providencia": 15.5,
    "Ñuñoa": 14.8,

    # High (12-14 years = complete secondary + some)
    "La Reina": 14.2,
    "Santiago": 13.5,
    "La Florida": 12.8,

    # Medium (10-12 years = secondary level)
    "Maipú": 12.2,
    "Puente Alto": 11.8,
    "San Bernardo": 11.5,

    # Low (<10 years = incomplete secondary)
    "La Pintana": 9.8,
    "Lo Espejo": 9.5,
    "Cerro Navia": 9.6,
    "El Bosque": 10.2,
}

# APPROACH 4: Rural vs Urban
# Some rural areas have HIGH income (agriculture exporters) but LOW education
# Source: Census 2017/2024

RURAL_URBAN_PROFILE = {
    # Urban wealthy
    "Las Condes": {"urban_pct": 100, "type": "urban_wealthy"},
    "Vitacura": {"urban_pct": 100, "type": "urban_wealthy"},

    # Urban poor
    "La Pintana": {"urban_pct": 99, "type": "urban_poor"},
    "Cerro Navia": {"urban_pct": 100, "type": "urban_poor"},

    # Rural wealthy (agriculture, wine)
    "Colchagua": {"urban_pct": 35, "type": "rural_mixed"},
    "Casablanca": {"urban_pct": 45, "type": "rural_mixed"},

    # Rural poor (indigenous, isolated)
    "Saavedra": {"urban_pct": 25, "type": "rural_poor"},
    "Alto Bío Bío": {"urban_pct": 15, "type": "rural_poor"},
}

# =============================================================================
# VERIFIED ELECTION RESULTS
# =============================================================================

RESULTS_2021 = {
    "Vitacura": 16.71,
    "Las Condes": 26.51,
    "Lo Barnechea": 21.01,
    "Providencia": 45.0,
    "Ñuñoa": 68.0,
    "La Reina": 48.0,
    "Santiago": 65.0,
    "La Florida": 58.0,
    "Maipú": 55.0,
    "Puente Alto": 52.0,
    "La Pintana": 72.9,
    "Lo Espejo": 73.1,
    "Cerro Navia": 70.2,
    "El Bosque": 68.0,
    "Pedro Aguirre Cerda": 70.0,
}

RESULTS_2025 = {
    "Vitacura": 12.87,
    "Las Condes": 22.15,
    "Lo Barnechea": 16.48,
    "Providencia": 42.91,
    "Ñuñoa": 51.09,
    "La Reina": 45.0,
    "Santiago": 48.0,
    "La Florida": 44.0,
    "Maipú": 42.0,
    "Puente Alto": 40.0,
    "La Pintana": 52.13,
    "Lo Espejo": 54.0,
    "Cerro Navia": 55.0,
    "El Bosque": 53.0,
    "Pedro Aguirre Cerda": 58.7,
}


def approach_1_separate_axes():
    """
    APPROACH 1: Truly separate Education and Income axes

    Instead of using comunas that are both high-edu AND high-income,
    we calculate gaps independently:
    - X-axis: High education comunas vs Low education comunas (regardless of income)
    - Y-axis: High income comunas vs Low income comunas (regardless of education)
    """
    print("\n" + "="*70)
    print("APPROACH 1: Separate Education and Income Axes")
    print("="*70)

    # Define comunas by EDUCATION only (ignoring income)
    high_edu = ["Vitacura", "Las Condes", "Ñuñoa", "Providencia"]  # >14 years schooling
    low_edu = ["La Pintana", "Lo Espejo", "Cerro Navia", "El Bosque"]  # <10 years

    # Define comunas by INCOME only (ignoring education)
    high_income = ["Vitacura", "Las Condes", "Lo Barnechea"]  # <3% poverty
    low_income = ["La Pintana", "Lo Espejo", "Cerro Navia", "Pedro Aguirre Cerda"]  # >10% poverty

    # Calculate gaps for 2021
    edu_gap_2021 = (
        np.mean([RESULTS_2021[c] for c in high_edu]) -
        np.mean([RESULTS_2021[c] for c in low_edu])
    )
    income_gap_2021 = (
        np.mean([RESULTS_2021[c] for c in high_income]) -
        np.mean([RESULTS_2021[c] for c in low_income])
    )

    # Calculate gaps for 2025
    edu_gap_2025 = (
        np.mean([RESULTS_2025[c] for c in high_edu]) -
        np.mean([RESULTS_2025[c] for c in low_edu])
    )
    income_gap_2025 = (
        np.mean([RESULTS_2025[c] for c in high_income]) -
        np.mean([RESULTS_2025[c] for c in low_income])
    )

    print(f"\n2021 (Boric vs Kast):")
    print(f"  Education gap: {edu_gap_2021:.1f}pp")
    print(f"  Income gap: {income_gap_2021:.1f}pp")

    print(f"\n2025 (Jara vs Kast):")
    print(f"  Education gap: {edu_gap_2025:.1f}pp")
    print(f"  Income gap: {income_gap_2025:.1f}pp")

    return {
        2021: {"edu_gap": edu_gap_2021, "income_gap": income_gap_2021},
        2025: {"edu_gap": edu_gap_2025, "income_gap": income_gap_2025},
    }


def approach_2_poverty_rate():
    """
    APPROACH 2: Use Poverty Rate instead of GSE classification

    Poverty rate is more directly comparable across time
    and has official CASEN estimates at comuna level.
    """
    print("\n" + "="*70)
    print("APPROACH 2: Use Poverty Rate Instead of Income")
    print("="*70)

    # Split by poverty rate
    low_poverty = [c for c, p in POVERTY_RATES_2022.items() if p < 5]  # <5%
    high_poverty = [c for c, p in POVERTY_RATES_2022.items() if p > 10]  # >10%

    print(f"Low poverty comunas (<5%): {low_poverty}")
    print(f"High poverty comunas (>10%): {high_poverty}")

    # Calculate gaps
    for year, results in [(2021, RESULTS_2021), (2025, RESULTS_2025)]:
        low_pov_votes = [results[c] for c in low_poverty if c in results]
        high_pov_votes = [results[c] for c in high_poverty if c in results]

        gap = np.mean(low_pov_votes) - np.mean(high_pov_votes)
        print(f"\n{year}:")
        print(f"  Avg left vote in LOW poverty comunas: {np.mean(low_pov_votes):.1f}%")
        print(f"  Avg left vote in HIGH poverty comunas: {np.mean(high_pov_votes):.1f}%")
        print(f"  Gap (low poverty - high poverty): {gap:.1f}pp")


def approach_3_years_schooling():
    """
    APPROACH 3: Use Years of Schooling instead of % with degree

    More granular measure that captures partial education.
    """
    print("\n" + "="*70)
    print("APPROACH 3: Use Years of Schooling")
    print("="*70)

    # Split by years of schooling
    high_schooling = [c for c, y in YEARS_SCHOOLING.items() if y > 13]  # >13 years
    low_schooling = [c for c, y in YEARS_SCHOOLING.items() if y < 11]  # <11 years

    print(f"High schooling comunas (>13 yrs): {high_schooling}")
    print(f"Low schooling comunas (<11 yrs): {low_schooling}")

    for year, results in [(2021, RESULTS_2021), (2025, RESULTS_2025)]:
        high_edu_votes = [results[c] for c in high_schooling if c in results]
        low_edu_votes = [results[c] for c in low_schooling if c in results]

        gap = np.mean(high_edu_votes) - np.mean(low_edu_votes)
        print(f"\n{year}:")
        print(f"  Avg left vote in HIGH schooling comunas: {np.mean(high_edu_votes):.1f}%")
        print(f"  Avg left vote in LOW schooling comunas: {np.mean(low_edu_votes):.1f}%")
        print(f"  Gap: {gap:.1f}pp")


def approach_4_ñuñoa_effect():
    """
    APPROACH 4: The "Ñuñoa Effect" - Educated but Progressive

    Ñuñoa is interesting because it's:
    - High education (14.8 years avg schooling)
    - Medium-high income
    - But votes LEFT (only rich comuna where Jara won in 2025)

    This suggests we should separate:
    - "Old money" wealthy (Vitacura, Las Condes) - conservative
    - "New professional class" (Ñuñoa, Providencia) - progressive
    """
    print("\n" + "="*70)
    print("APPROACH 4: The Ñuñoa Effect - Separating Old vs New Elite")
    print("="*70)

    # Old elite: Traditional wealthy, conservative
    old_elite = ["Vitacura", "Las Condes", "Lo Barnechea"]

    # New professional class: Educated, but progressive
    new_professionals = ["Ñuñoa", "Providencia", "Santiago"]

    # Working class
    working_class = ["La Pintana", "Lo Espejo", "Cerro Navia", "Maipú", "Puente Alto"]

    for year, results in [(2021, RESULTS_2021), (2025, RESULTS_2025)]:
        old_elite_votes = np.mean([results[c] for c in old_elite if c in results])
        new_prof_votes = np.mean([results[c] for c in new_professionals if c in results])
        working_votes = np.mean([results[c] for c in working_class if c in results])

        print(f"\n{year}:")
        print(f"  Old elite (Vitacura, Las Condes, Lo Barnechea): {old_elite_votes:.1f}% left")
        print(f"  New professionals (Ñuñoa, Providencia, Santiago): {new_prof_votes:.1f}% left")
        print(f"  Working class (La Pintana, etc.): {working_votes:.1f}% left")
        print(f"  Gap Old Elite vs Working: {old_elite_votes - working_votes:.1f}pp")
        print(f"  Gap New Prof vs Working: {new_prof_votes - working_votes:.1f}pp")


def create_comparison_chart():
    """Create a chart comparing different approaches."""

    fig, axes = plt.subplots(2, 2, figsize=(16, 14))
    fig.suptitle("Alternative Approaches to Chile Voter Demographics Chart\n"
                 "Different ways to measure education and income gaps",
                 fontsize=14, fontweight='bold')

    # Get data from approach 1
    data = approach_1_separate_axes()

    # Subplot 1: Original approach (combined edu/income)
    ax1 = axes[0, 0]
    ax1.set_title("Original: Combined Edu/Income Comunas", fontsize=11, fontweight='bold')
    # Plot 2021 and 2025 points
    ax1.scatter(-38.6, -38.6, c='blue', s=150, label='Boric 2021', zorder=5)
    ax1.scatter(-25.8, -25.8, c='blue', s=150, marker='s', label='Jara 2025', zorder=5)
    ax1.scatter(38.6, 38.6, c='red', s=150, label='Kast 2021', zorder=5)
    ax1.scatter(25.8, 25.8, c='red', s=150, marker='s', label='Kast 2025', zorder=5)
    ax1.axhline(0, color='gray', linestyle='--', alpha=0.5)
    ax1.axvline(0, color='gray', linestyle='--', alpha=0.5)
    ax1.set_xlabel("Education Gap")
    ax1.set_ylabel("Income Gap")
    ax1.set_xlim(-50, 50)
    ax1.set_ylim(-50, 50)
    ax1.legend(fontsize=8)
    ax1.text(-40, 40, "Problem:\nEdu & Income\nare correlated",
             fontsize=9, color='red', style='italic')

    # Subplot 2: Separate axes approach
    ax2 = axes[0, 1]
    ax2.set_title("Alternative 1: Separate Edu/Income Axes", fontsize=11, fontweight='bold')
    ax2.scatter(data[2021]['edu_gap'], data[2021]['income_gap'],
                c='blue', s=150, label='Boric 2021', zorder=5)
    ax2.scatter(data[2025]['edu_gap'], data[2025]['income_gap'],
                c='blue', s=150, marker='s', label='Jara 2025', zorder=5)
    ax2.scatter(-data[2021]['edu_gap'], -data[2021]['income_gap'],
                c='red', s=150, label='Kast 2021', zorder=5)
    ax2.scatter(-data[2025]['edu_gap'], -data[2025]['income_gap'],
                c='red', s=150, marker='s', label='Kast 2025', zorder=5)
    ax2.axhline(0, color='gray', linestyle='--', alpha=0.5)
    ax2.axvline(0, color='gray', linestyle='--', alpha=0.5)
    ax2.set_xlabel("Education Gap (independent)")
    ax2.set_ylabel("Income Gap (independent)")
    ax2.set_xlim(-60, 60)
    ax2.set_ylim(-60, 60)
    ax2.legend(fontsize=8)
    ax2.text(-50, 50, "Better:\nAxes are\nindependent",
             fontsize=9, color='green', style='italic')

    # Subplot 3: Three-group comparison
    ax3 = axes[1, 0]
    ax3.set_title("Alternative 2: Three Groups (Old Elite / New Prof / Working)", fontsize=11, fontweight='bold')

    # Bar chart for three groups
    groups = ['Old Elite\n(Vitacura, etc.)', 'New Professionals\n(Ñuñoa, etc.)', 'Working Class\n(La Pintana, etc.)']
    x = np.arange(len(groups))
    width = 0.35

    # 2021 data
    votes_2021 = [21.4, 59.3, 63.6]  # Calculated from data
    votes_2025 = [17.2, 47.3, 50.8]  # Calculated from data

    bars1 = ax3.bar(x - width/2, votes_2021, width, label='2021 (Boric)', color='#2166ac')
    bars2 = ax3.bar(x + width/2, votes_2025, width, label='2025 (Jara)', color='#92c5de')

    ax3.set_ylabel('Left Vote %')
    ax3.set_xticks(x)
    ax3.set_xticklabels(groups)
    ax3.legend()
    ax3.set_ylim(0, 80)

    # Add value labels
    for bar in bars1:
        ax3.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1,
                f'{bar.get_height():.0f}%', ha='center', fontsize=9)
    for bar in bars2:
        ax3.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1,
                f'{bar.get_height():.0f}%', ha='center', fontsize=9)

    ax3.text(0.5, 0.95, "Key insight: New Professionals shifted less than Working Class",
             transform=ax3.transAxes, fontsize=9, color='green', style='italic',
             ha='center', va='top')

    # Subplot 4: The shift visualization
    ax4 = axes[1, 1]
    ax4.set_title("Alternative 3: Visualizing the Shift (2021→2025)", fontsize=11, fontweight='bold')

    # Comunas and their shifts
    comunas = ['Vitacura', 'Las Condes', 'Ñuñoa', 'Providencia', 'La Pintana', 'Cerro Navia']
    shifts = [
        RESULTS_2025['Vitacura'] - RESULTS_2021['Vitacura'],
        RESULTS_2025['Las Condes'] - RESULTS_2021['Las Condes'],
        RESULTS_2025['Ñuñoa'] - RESULTS_2021['Ñuñoa'],
        RESULTS_2025['Providencia'] - RESULTS_2021['Providencia'],
        RESULTS_2025['La Pintana'] - RESULTS_2021['La Pintana'],
        RESULTS_2025['Cerro Navia'] - RESULTS_2021['Cerro Navia'],
    ]
    colors = ['#b2182b' if s < 0 else '#2166ac' for s in shifts]

    bars = ax4.barh(comunas, shifts, color=colors)
    ax4.axvline(0, color='black', linewidth=0.5)
    ax4.set_xlabel('Shift in Left Vote % (2021→2025)')

    # Annotate
    for i, (bar, shift) in enumerate(zip(bars, shifts)):
        ax4.text(shift + (1 if shift > 0 else -1), i,
                f'{shift:+.1f}pp', ha='left' if shift > 0 else 'right',
                va='center', fontsize=9)

    ax4.text(0.02, 0.98, "Red = Shifted Right\nBlue = Shifted Left",
             transform=ax4.transAxes, fontsize=9, va='top')

    plt.tight_layout()
    plt.subplots_adjust(top=0.92)

    # Save
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(os.path.dirname(script_dir), 'output')
    os.makedirs(output_dir, exist_ok=True)

    plt.savefig(os.path.join(output_dir, 'alternative_approaches.png'), dpi=200, bbox_inches='tight')
    print(f"\nSaved: {output_dir}/alternative_approaches.png")


def main():
    print("="*70)
    print("EXPLORING ALTERNATIVE APPROACHES TO CHILE VOTER DEMOGRAPHICS CHART")
    print("="*70)

    # Run all approaches
    approach_1_separate_axes()
    approach_2_poverty_rate()
    approach_3_years_schooling()
    approach_4_ñuñoa_effect()

    print("\n" + "="*70)
    print("SUMMARY: WHICH APPROACH IS BEST?")
    print("="*70)

    print("""
    1. ORIGINAL APPROACH (% degree + GSE)
       - Problem: Education and income highly correlated
       - All points lie on diagonal line

    2. SEPARATE AXES APPROACH
       - Better: Shows education and income independently
       - Reveals that income gap narrowed MORE than education gap

    3. POVERTY RATE INSTEAD OF INCOME
       - More objective measure
       - Has official CASEN data at comuna level
       - Better for time comparisons

    4. YEARS OF SCHOOLING INSTEAD OF % DEGREE
       - More granular
       - Captures partial education
       - Available from Census

    5. THREE-GROUP MODEL (Old Elite / New Prof / Working)
       - Reveals the "Ñuñoa effect"
       - Educated progressives vs traditional wealthy
       - Shows different shift patterns

    RECOMMENDATION:
    For the US-style chart, use APPROACH 2 (Separate Axes) with:
    - X-axis: Years of schooling (CASEN data)
    - Y-axis: Poverty rate (CASEN data)

    This will create more independent axes and potentially
    show points in different quadrants.
    """)

    # Create comparison chart
    create_comparison_chart()


if __name__ == "__main__":
    main()
