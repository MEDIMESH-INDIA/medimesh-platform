/**
 * Medical & Healthcare Directory Intelligent Search Matcher
 *
 * Provides resilient, fuzzy, multi-token, abbreviation-aware, and halfway-typo search matching
 * across healthcare facility names, localities, cities, specialties, and types.
 */

// Common medical/regional aliases and abbreviations
const SYNONYMS = {
  dr: ['dr', 'doctor'],
  doctor: ['dr', 'doctor'],
  dist: ['dist', 'district'],
  district: ['dist', 'district'],
  hosp: ['hosp', 'hospital'],
  hospital: ['hosp', 'hospital'],
  gen: ['gen', 'general'],
  general: ['gen', 'general'],
  govt: ['govt', 'government'],
  government: ['govt', 'government'],
  st: ['st', 'saint'],
  saint: ['st', 'saint'],
  ctr: ['ctr', 'center', 'centre'],
  center: ['ctr', 'center', 'centre'],
  centre: ['ctr', 'center', 'centre'],
  specialty: ['specialty', 'speciality'],
  speciality: ['specialty', 'speciality'],
  multispecialty: ['multispecialty', 'multispeciality'],
  multispeciality: ['multispecialty', 'multispeciality'],
  icu: ['icu', 'intensive care'],
};

/**
 * Normalizes text by lowercasing and stripping diacritics.
 */
export function normalizeText(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Strips punctuation and symbols, collapsing whitespace.
 */
export function stripPunctuation(str) {
  return normalizeText(str)
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Compacts text by stripping all punctuation and whitespace.
 * e.g. "D.Y. Patil Hospital" -> "dypatilhospital"
 */
export function compactText(str) {
  return normalizeText(str).replace(/[^a-z0-9]/g, '');
}

/**
 * Extracts distinct tokens and dotted abbreviation variations from a string.
 * e.g. "D.Y. Patil" -> ["d.y.", "dy", "d", "y", "patil"]
 */
export function extractTokens(str) {
  const norm = normalizeText(str);
  if (!norm) return [];

  const rawTokens = norm.match(/[a-z0-9]+(?:[\.\-][a-z0-9]+)*/g) || [];
  const tokens = new Set();

  for (const raw of rawTokens) {
    tokens.add(raw);
    const stripped = raw.replace(/[^a-z0-9]/g, '');
    if (stripped) tokens.add(stripped);

    // If token has dots (e.g. d.y. or r.n.), add individual letter tokens and joined abbreviation
    if (raw.includes('.')) {
      const parts = raw.split('.').filter(Boolean);
      parts.forEach(p => tokens.add(p));
      tokens.add(parts.join(''));
    }
  }

  return Array.from(tokens);
}

/**
 * Computes Damerau-Levenshtein distance between two strings,
 * which accounts for insertions, deletions, substitutions, and adjacent character transpositions.
 */
export function damerauLevenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const al = a.length;
  const bl = b.length;
  const matrix = Array.from({ length: al + 1 }, () => new Array(bl + 1).fill(0));

  for (let i = 0; i <= al; i++) matrix[i][0] = i;
  for (let j = 0; j <= bl; j++) matrix[0][j] = j;

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,        // deletion
        matrix[i][j - 1] + 1,        // insertion
        matrix[i - 1][j - 1] + cost  // substitution
      );

      // Transposition (e.g. "pait" -> "pati", "hsop" -> "hosp")
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + 1);
      }
    }
  }

  return matrix[al][bl];
}

/**
 * Fuzzy prefix distance:
 * Compares qTok against prefixes of targetTok around qTok.length,
 * accurately scoring users who are halfway through typing a word and made an accidental typo.
 */
export function fuzzyPrefixDistance(qTok, targetTok) {
  if (targetTok.startsWith(qTok)) return 0;

  const qLen = qTok.length;
  const tLen = targetTok.length;

  if (qLen >= tLen) {
    return damerauLevenshtein(qTok, targetTok);
  }

  let minDistance = damerauLevenshtein(qTok, targetTok);

  // Check prefix of length qLen
  const pSame = targetTok.slice(0, qLen);
  const dSame = damerauLevenshtein(qTok, pSame);
  if (dSame < minDistance) minDistance = dSame;

  // Check prefix of length qLen - 1 (in case of an accidental extra key press)
  if (qLen > 2) {
    const pShorter = targetTok.slice(0, qLen - 1);
    const dShorter = damerauLevenshtein(qTok, pShorter);
    if (dShorter < minDistance) minDistance = dShorter;
  }

  // Check prefix of length qLen + 1 (in case user missed a key while typing halfway)
  if (qLen + 1 <= tLen) {
    const pLonger = targetTok.slice(0, qLen + 1);
    const dLonger = damerauLevenshtein(qTok, pLonger);
    if (dLonger < minDistance) minDistance = dLonger;
  }

  return minDistance;
}

/**
 * Fuzzy matches a single query token against a candidate token,
 * with full tolerance for partial prefix typos, missing letters, and transpositions.
 * Returns a similarity score between 0 and 1.
 */
export function tokenFuzzyMatch(qTok, targetTok) {
  if (qTok === targetTok) return 1.0;
  if (targetTok.startsWith(qTok)) return 0.95;
  if (qTok.length > 1 && targetTok.includes(qTok)) return 0.85;

  // Synonyms check (e.g. dr -> doctor, dist -> district)
  const syns = SYNONYMS[qTok];
  if (syns) {
    for (const syn of syns) {
      if (targetTok === syn || targetTok.startsWith(syn)) return 0.95;
    }
  }

  // Single or double-character tokens must match exactly or as a clean prefix
  if (qTok.length <= 2) {
    return targetTok.startsWith(qTok) ? 0.9 : 0;
  }

  // 1. Full token edit distance (Damerau-Levenshtein)
  const fullDist = damerauLevenshtein(qTok, targetTok);
  const maxLen = Math.max(qTok.length, targetTok.length);
  const maxAllowedDist = qTok.length <= 4 ? 1 : (qTok.length <= 7 ? 2 : 3);
  if (fullDist <= maxAllowedDist) {
    return 1 - (fullDist / (maxLen + 1));
  }

  // 2. Halfway prefix distance (accidental typo while typing halfway)
  if (targetTok.length > qTok.length) {
    const prefixDist = fuzzyPrefixDistance(qTok, targetTok);
    const maxAllowedPrefixDist = qTok.length <= 4 ? 1 : 2;
    if (prefixDist <= maxAllowedPrefixDist) {
      return 0.85 - (prefixDist * 0.15);
    }
  }

  return 0;
}

/**
 * Evaluates and scores a hospital record against a search query.
 *
 * @param {Object} hospital Normalized or raw hospital record
 * @param {string} query Search input string
 * @returns {{ matches: boolean, score: number, matchReason: string, matchedField: string }}
 */
export function scoreHospitalMatch(hospital, query) {
  const qRaw = (query || '').trim();
  if (!qRaw) {
    return { matches: true, score: 1, matchReason: 'Verified directory record', matchedField: 'all' };
  }

  const qNorm = normalizeText(qRaw);
  const qCompact = compactText(qRaw);
  const qClean = stripPunctuation(qNorm);
  const qTokens = qClean.split(/\s+/).filter(Boolean);

  const name = hospital.name || '';
  const locality = hospital.locality || (hospital.location?.locality) || '';
  const city = hospital.city || (hospital.location?.city) || '';
  const district = hospital.district || (hospital.location?.district) || '';
  const specialties = Array.isArray(hospital.specialties) ? hospital.specialties : [];

  const nameNorm = normalizeText(name);
  const nameClean = stripPunctuation(nameNorm);
  const nameCompact = compactText(nameNorm);
  const nameTokens = extractTokens(name);

  // Extract initials and dotted initials from hospital name
  // e.g. "D.Y. Patil Hospital" -> dottedInitials: "dy", allInitials: "dyp"
  const dottedMatches = name.match(/\b([A-Za-z])\./g) || [];
  const dottedInitials = dottedMatches.map(m => m[0].toLowerCase()).join('');
  const allInitials = (name.match(/\b([A-Za-z])/g) || []).map(c => c.toLowerCase()).join('');

  let score = 0;
  let matchReason = 'Hospital name match';
  let matchedField = 'name';

  // 1. Direct name matches (compact substring, startsWith, exact, or compact halfway typo)
  if (nameNorm === qNorm) {
    score = 200;
  } else if (nameClean.startsWith(qClean)) {
    score = 150;
  } else if (nameCompact.startsWith(qCompact)) {
    score = 140;
  } else if (nameCompact.includes(qCompact)) {
    score = 120;
  } else if (qCompact.length >= 4 && nameCompact.length > qCompact.length) {
    // Check halfway typo on compact name (e.g. "dypate", "dyhosp")
    const compPrefixDist = fuzzyPrefixDistance(qCompact, nameCompact);
    if (compPrefixDist <= (qCompact.length <= 5 ? 1 : 2)) {
      score = 115 - (compPrefixDist * 15);
    }
  }

  // 2. Dotted initials & acronym check (e.g. "dy" on "D.Y. Patil", "rn" on "Dr. R.N. Patil")
  if (dottedInitials && (dottedInitials === qCompact || dottedInitials.startsWith(qCompact))) {
    score = Math.max(score, 130);
  } else if (allInitials && (allInitials === qCompact || allInitials.startsWith(qCompact))) {
    score = Math.max(score, 110);
  }

  // 3. Multi-token evaluation across name tokens in any order (with halfway typo tolerance)
  if (qTokens.length > 0) {
    let nameTokenMatches = 0;
    let nameTokenScoreTotal = 0;

    for (const qTok of qTokens) {
      let bestTokScore = 0;

      // Check against all extracted name tokens
      for (const nTok of nameTokens) {
        const s = tokenFuzzyMatch(qTok, nTok);
        if (s > bestTokScore) bestTokScore = s;
      }

      // Check if qTok matches dotted initials (e.g. "dy" or "rn")
      if (dottedInitials && (dottedInitials === qTok || dottedInitials.includes(qTok))) {
        bestTokScore = Math.max(bestTokScore, 0.95);
      }

      // Check if qTok is contained in compact name (only for tokens of length >= 2)
      if (qTok.length >= 2 && nameCompact.includes(qTok)) {
        bestTokScore = Math.max(bestTokScore, 0.9);
      }

      // Accept token match if confidence score is >= 0.55 (covers halfway typos)
      if (bestTokScore >= 0.55) {
        nameTokenMatches++;
        nameTokenScoreTotal += bestTokScore;
      }
    }

    if (nameTokenMatches === qTokens.length) {
      // All tokens in query matched words in the hospital name!
      const avg = nameTokenScoreTotal / qTokens.length;
      const allTokensScore = 95 * avg + (nameNorm.includes(qNorm) ? 20 : 0);
      score = Math.max(score, allTokensScore);
      matchReason = 'Hospital name match';
      matchedField = 'name';
    } else if (nameTokenMatches > 0 && qTokens.length > 1) {
      // Partial token match on name
      score = Math.max(score, 45 * (nameTokenMatches / qTokens.length));
    }
  }

  // 4. Location match (locality, city, district)
  const locCombined = `${locality} ${city} ${district}`;
  const locClean = stripPunctuation(locCombined);
  const locCompact = compactText(locCombined);
  const locTokens = extractTokens(locCombined);

  if (locCompact.includes(qCompact) || locClean.includes(qClean)) {
    const locScore = 75;
    if (locScore > score) {
      score = locScore;
      matchReason = `Located in ${[locality, city].filter(Boolean).join(', ') || 'area'}`;
      matchedField = 'location';
    }
  } else if (qTokens.length > 0) {
    let locTokenMatches = 0;
    for (const qTok of qTokens) {
      for (const lTok of locTokens) {
        if (tokenFuzzyMatch(qTok, lTok) >= 0.55) {
          locTokenMatches++;
          break;
        }
      }
    }
    if (locTokenMatches === qTokens.length) {
      const locScore = 70;
      if (locScore > score) {
        score = locScore;
        matchReason = `Located in ${[locality, city].filter(Boolean).join(', ') || 'area'}`;
        matchedField = 'location';
      }
    }
  }

  // 5. Cross-field match: words matched across name + location + specialty
  // e.g. "nerul dy patil", "dy pate nerul", "patil navi mumbai"
  if (qTokens.length > 1 && score < 90) {
    let combinedMatches = 0;
    let matchedReasonNote = '';

    for (const qTok of qTokens) {
      let tokMatched = false;

      // In name
      for (const nTok of nameTokens) {
        if (tokenFuzzyMatch(qTok, nTok) >= 0.55) {
          tokMatched = true;
          break;
        }
      }
      if (!tokMatched && (dottedInitials.includes(qTok) || (qTok.length >= 2 && nameCompact.includes(qTok)))) {
        tokMatched = true;
      }

      // In location
      if (!tokMatched) {
        for (const lTok of locTokens) {
          if (tokenFuzzyMatch(qTok, lTok) >= 0.55) {
            tokMatched = true;
            matchedReasonNote = `Located in ${locality || city}`;
            break;
          }
        }
      }

      // In specialties
      if (!tokMatched) {
        for (const spec of specialties) {
          const specTokens = extractTokens(spec);
          for (const sTok of specTokens) {
            if (tokenFuzzyMatch(qTok, sTok) >= 0.55) {
              tokMatched = true;
              matchedReasonNote = `${spec} department`;
              break;
            }
          }
          if (tokMatched) break;
        }
      }

      if (tokMatched) combinedMatches++;
    }

    if (combinedMatches === qTokens.length) {
      score = Math.max(score, 88);
      matchReason = matchedReasonNote || 'Hospital name match';
    }
  }

  // 6. Specialties match
  if (specialties.length > 0 && score < 70) {
    for (const spec of specialties) {
      const specCompact = compactText(spec);
      if (specCompact.includes(qCompact)) {
        score = Math.max(score, 65);
        matchReason = `${spec} service`;
        matchedField = 'specialty';
        break;
      }
    }
  }

  const matches = score >= 45;
  return { matches, score, matchReason, matchedField };
}
