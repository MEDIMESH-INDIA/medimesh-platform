/**
 * Shared utility functions for discovery filters, facets, and cascading location state.
 */

export const sortLabels = (list) => {
  return [...(list || [])].sort((a, b) =>
    String(a || '').localeCompare(String(b || ''), 'en-IN', { sensitivity: 'base' })
  );
};

export const uniqueCanonicalStrings = (list) => {
  const seen = new Map();
  for (const item of (list || [])) {
    if (!item || typeof item !== 'string') continue;
    const trimmed = item.trim();
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();
    if (!seen.has(lower)) {
      seen.set(lower, trimmed);
    } else {
      const existing = seen.get(lower);
      if (existing === existing.toLowerCase() && trimmed !== trimmed.toLowerCase()) {
        seen.set(lower, trimmed);
      }
    }
  }
  return sortLabels(Array.from(seen.values()));
};

/**
 * Validates and cascades a child location filter (e.g. locality or serviceArea)
 * when its parent city changes or when facets hydrate.
 *
 * @param {Object} params
 * @param {string|null|undefined} params.city - The currently selected or target city
 * @param {string|null|undefined} params.currentChildValue - The current locality or service area
 * @param {Record<string, string[]>|null|undefined} params.cityToChildrenMap - Map of city to valid child values
 * @returns {string|null} The valid child value, or null if it must be cleared
 */
export const cascadeChildLocation = ({ city, currentChildValue, cityToChildrenMap }) => {
  if (!currentChildValue) return null;
  if (!city) return null;
  if (!cityToChildrenMap) return null;

  const validChildren = cityToChildrenMap[city];
  if (Array.isArray(validChildren) && validChildren.includes(currentChildValue)) {
    return currentChildValue;
  }
  return null;
};
