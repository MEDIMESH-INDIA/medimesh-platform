/**
 * Relative Parameter Ranking Engine for MEDIMESH Hospital Comparison Matrix.
 * 
 * Implements a restrained, accessible, light-tinted relative color system:
 * - 'best' (most favorable): Light green (#DDF3E4, border #A7DDB8, text #134E4A)
 * - 'middle' (intermediate): Light orange (#FFF0D6, border #F0D29B, text #78350F)
 * - 'worst' (least favorable): Light red (#FBE3E1, border #E9B5B1, text #991B1B)
 * - 'neutral' (unranked / missing / not comparable): (#FAF9F5, border border-border/70, text-foreground)
 * 
 * Strict Invariants:
 * 1. Each parameter is evaluated independently. No overall green/red rating.
 * 2. Equal values receive equal ranking colors.
 * 3. Missing/unknown data is NEVER treated as zero, false, or worst possible value. Missing stays neutral.
 * 4. Facility availability is not inferred when absent.
 * 5. Qualitative parameters without objective order are displayed neutrally.
 * 6. Accessible contrast ratios (all >= 4.5:1, most >= 7:1) with text indicators (not color alone).
 */

export const COMPARISON_RANKS = {
  BEST: 'best',
  MIDDLE: 'middle',
  WORST: 'worst',
  NEUTRAL: 'neutral',
};

export const RANK_THEMES = {
  best: {
    bg: 'bg-[#DDF3E4]',
    border: 'border-[#A7DDB8]',
    text: 'text-[#134E4A]',
    badgeBg: 'bg-emerald-100/90',
    badgeText: 'text-[#134E4A]',
    defaultIndicator: 'Best',
  },
  middle: {
    bg: 'bg-[#FFF0D6]',
    border: 'border-[#F0D29B]',
    text: 'text-[#78350F]',
    badgeBg: 'bg-amber-100/90',
    badgeText: 'text-[#78350F]',
    defaultIndicator: 'Intermediate',
  },
  worst: {
    bg: 'bg-[#FBE3E1]',
    border: 'border-[#E9B5B1]',
    text: 'text-[#991B1B]',
    badgeBg: 'bg-rose-100/90',
    badgeText: 'text-[#991B1B]',
    defaultIndicator: 'Least favorable',
  },
  neutral: {
    bg: 'bg-[#FAF9F5]',
    border: 'border-border/70',
    text: 'text-foreground',
    badgeBg: 'bg-surface-elevated',
    badgeText: 'text-muted-foreground',
    defaultIndicator: null,
  },
};

/**
 * Checks if a value represents missing or unknown data.
 */
export function isMissingValue(val) {
  if (val === null || val === undefined) return true;
  if (typeof val === 'string') {
    const trimmed = val.trim().toLowerCase();
    return (
      trimmed === '' ||
      trimmed === 'unknown' ||
      trimmed === 'not provided' ||
      trimmed === 'not listed' ||
      trimmed === 'not confirmed' ||
      trimmed === 'n/a'
    );
  }
  return false;
}

/**
 * Evaluates the relative rank for a specific hospital within a comparison row.
 * 
 * @param {Object} row - Comparison row definition { group, label, get, values }
 * @param {Array} hospitals - Array of hospital objects being compared
 * @param {number} hospitalIndex - Index of the hospital being evaluated
 * @returns {Object} { rank, indicator, displayValue }
 */
export function evaluateHospitalParamRank(row, hospitals, hospitalIndex) {
  if (!row || !Array.isArray(hospitals) || hospitals.length === 0) {
    return { rank: COMPARISON_RANKS.NEUTRAL, indicator: null, displayValue: 'Unknown' };
  }

  const rawValues = hospitals.map((h) => (row.get ? row.get(h) : (row.values ? row.values[hospitals.indexOf(h)] : 'Unknown')));
  const currentVal = rawValues[hospitalIndex];
  const label = (row.label || '').toLowerCase();

  // Edge Case 1: Missing or unavailable data is ALWAYS neutral
  if (isMissingValue(currentVal)) {
    return {
      rank: COMPARISON_RANKS.NEUTRAL,
      indicator: null,
      displayValue: typeof currentVal === 'string' && currentVal.trim() !== '' ? currentVal : 'Not provided',
    };
  }

  // 1. Capacity Metrics (Numeric: Higher is favorable)
  if (label.includes('bed')) {
    const numericValues = rawValues.map((v) => {
      if (isMissingValue(v)) return null;
      if (typeof v === 'number' && Number.isFinite(v)) return v;
      if (typeof v === 'string') {
        const cleaned = v.replace(/[^0-9.-]/g, '').trim();
        if (!cleaned) return null;
        const parsed = Number(cleaned);
        return Number.isFinite(parsed) ? parsed : null;
      }
      return null;
    });

    const currentNum = numericValues[hospitalIndex];
    if (currentNum === null) {
      return {
        rank: COMPARISON_RANKS.NEUTRAL,
        indicator: null,
        displayValue: String(currentVal),
      };
    }

    const validNums = numericValues.filter((n) => n !== null);
    const uniqueSorted = [...new Set(validNums)].sort((a, b) => b - a);

    let rank = COMPARISON_RANKS.NEUTRAL;
    let indicator = null;

    if (uniqueSorted.length === 1) {
      // Equal values receive equal ranking colors
      rank = COMPARISON_RANKS.BEST;
      indicator = 'Equal capacity';
    } else if (uniqueSorted.length === 2) {
      if (currentNum === uniqueSorted[0]) {
        rank = COMPARISON_RANKS.BEST;
        indicator = 'Highest capacity';
      } else {
        rank = COMPARISON_RANKS.WORST;
        indicator = 'Lowest capacity';
      }
    } else if (uniqueSorted.length >= 3) {
      if (currentNum === uniqueSorted[0]) {
        rank = COMPARISON_RANKS.BEST;
        indicator = 'Highest capacity';
      } else if (currentNum === uniqueSorted[uniqueSorted.length - 1]) {
        rank = COMPARISON_RANKS.WORST;
        indicator = 'Lowest capacity';
      } else {
        rank = COMPARISON_RANKS.MIDDLE;
        indicator = 'Intermediate';
      }
    }

    return {
      rank,
      indicator,
      displayValue: `${currentNum} beds`,
    };
  }

  // 2. Distance Parameter (Numeric: Lower is favorable)
  if (label.includes('distance')) {
    const distanceValues = rawValues.map((v) => {
      if (isMissingValue(v)) return null;
      if (typeof v === 'number' && Number.isFinite(v)) return v;
      if (typeof v === 'string') {
        const cleaned = v.replace(/[^0-9.]/g, '').trim();
        if (!cleaned) return null;
        const parsed = parseFloat(cleaned);
        return Number.isFinite(parsed) ? parsed : null;
      }
      return null;
    });

    const currentDist = distanceValues[hospitalIndex];
    if (currentDist === null) {
      return {
        rank: COMPARISON_RANKS.NEUTRAL,
        indicator: null,
        displayValue: String(currentVal),
      };
    }

    const validDists = distanceValues.filter((n) => n !== null);
    const uniqueSorted = [...new Set(validDists)].sort((a, b) => a - b); // Lower is better!

    let rank = COMPARISON_RANKS.NEUTRAL;
    let indicator = null;

    if (uniqueSorted.length === 1) {
      rank = COMPARISON_RANKS.BEST;
      indicator = 'Equal distance';
    } else if (uniqueSorted.length === 2) {
      if (currentDist === uniqueSorted[0]) {
        rank = COMPARISON_RANKS.BEST;
        indicator = 'Nearest';
      } else {
        rank = COMPARISON_RANKS.WORST;
        indicator = 'Farthest';
      }
    } else if (uniqueSorted.length >= 3) {
      if (currentDist === uniqueSorted[0]) {
        rank = COMPARISON_RANKS.BEST;
        indicator = 'Nearest';
      } else if (currentDist === uniqueSorted[uniqueSorted.length - 1]) {
        rank = COMPARISON_RANKS.WORST;
        indicator = 'Farthest';
      } else {
        rank = COMPARISON_RANKS.MIDDLE;
        indicator = 'Intermediate';
      }
    }

    return {
      rank,
      indicator,
      displayValue: `${currentDist} km`,
    };
  }

  // 3. Availability Metrics (Available vs Unavailable vs Unknown)
  if (
    label.includes('emergency') ||
    label.includes('ambulance') ||
    label.endsWith('listed')
  ) {
    const str = String(currentVal);
    if (str === 'Available') {
      return {
        rank: COMPARISON_RANKS.BEST,
        indicator: label.includes('emergency') ? '24/7 Available' : 'Available',
        displayValue: label.includes('emergency') ? '24/7 Emergency' : 'Available',
      };
    }
    if (str === 'Unavailable') {
      return {
        rank: COMPARISON_RANKS.WORST,
        indicator: 'Unavailable',
        displayValue: 'Unavailable',
      };
    }
    return {
      rank: COMPARISON_RANKS.NEUTRAL,
      indicator: null,
      displayValue: str || 'Unknown',
    };
  }

  // 4. Area Match Priority (Matches area vs Outside area)
  if (label.startsWith('located in')) {
    const str = String(currentVal);
    if (str === 'Matches area') {
      return {
        rank: COMPARISON_RANKS.BEST,
        indicator: 'In selected area',
        displayValue: 'Matches area',
      };
    }
    if (str === 'Outside area') {
      return {
        rank: COMPARISON_RANKS.WORST,
        indicator: 'Outside area',
        displayValue: 'Outside area',
      };
    }
    return {
      rank: COMPARISON_RANKS.NEUTRAL,
      indicator: null,
      displayValue: str || 'Unknown',
    };
  }

  // 5. Review Status (Verified vs Self Reported vs Unreviewed)
  if (label === 'review status') {
    const str = String(currentVal).toLowerCase();
    if (str.includes('manually') || str.includes('source') || str.includes('verified')) {
      return {
        rank: COMPARISON_RANKS.BEST,
        indicator: 'Verified record',
        displayValue: String(currentVal),
      };
    }
    if (str.includes('self')) {
      return {
        rank: COMPARISON_RANKS.MIDDLE,
        indicator: 'Self reported',
        displayValue: String(currentVal),
      };
    }
    return {
      rank: COMPARISON_RANKS.NEUTRAL,
      indicator: null,
      displayValue: String(currentVal),
    };
  }

  // 6. Qualitative Parameters (Location, Specialties, Facilities, Hospital type, Source, Dates)
  // Displayed neutrally without misleading rank
  return {
    rank: COMPARISON_RANKS.NEUTRAL,
    indicator: null,
    displayValue: String(currentVal),
  };
}

