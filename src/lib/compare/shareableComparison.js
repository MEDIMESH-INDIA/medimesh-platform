/**
 * Utility functions for serializing, parsing, and building shareable hospital comparison URLs.
 */

export const MAX_COMPARE_HOSPITALS = 3;

/**
 * Parses comparison slugs from a query parameter string, array, or comma-separated values.
 * - Trims each slug
 * - Drops empty/non-string items
 * - Deduplicates preserving first occurrence
 * - Limits to a maximum of 3 unique slugs
 * 
 * @param {string|string[]|null|undefined} input
 * @returns {string[]} Array of unique, valid canonical slugs (up to 3)
 */
export function parseComparisonSlugs(input) {
  if (!input) return [];
  const rawList = Array.isArray(input) ? input : [input];
  const slugs = [];
  const seen = new Set();

  for (const item of rawList) {
    if (typeof item !== 'string') continue;
    const parts = item.split(',');
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      if (!seen.has(trimmed)) {
        seen.add(trimmed);
        slugs.push(trimmed);
        if (slugs.length === MAX_COMPARE_HOSPITALS) return slugs;
      }
    }
  }

  return slugs;
}

/**
 * Serializes an array of hospital slugs or hospital objects into a canonical comma-separated slug string.
 * - Extracts canonical slug, strictly ignoring hospital names, titles, or arbitrary labels
 * - Deduplicates slugs
 * - Limits to a maximum of 3 unique slugs
 * 
 * @param {Array<string|{slug?: string}>} items
 * @returns {string} Comma-separated slug string (e.g. "apollo-hospital,fortis-hospital") or ""
 */
export function serializeComparisonSlugs(items) {
  if (!items) return '';
  const list = Array.isArray(items) ? items : [items];
  const slugs = [];
  const seen = new Set();

  for (const item of list) {
    let slug = null;
    if (typeof item === 'string') {
      slug = item.trim();
    } else if (item && typeof item === 'object' && typeof item.slug === 'string') {
      slug = item.slug.trim();
    }
    if (!slug) continue;
    if (!seen.has(slug)) {
      seen.add(slug);
      slugs.push(slug);
      if (slugs.length === MAX_COMPARE_HOSPITALS) break;
    }
  }

  return slugs.join(',');
}

/**
 * Builds a shareable comparison URL while preserving unrelated query parameters.
 * - Sets `compare` query parameter with canonical serialized slugs
 * - Removes temporary parameters such as `add`
 * - Deletes `compare` parameter if slugs are empty
 * - Retains existing search/filter parameters (e.g. `q`, `city`, `locality`)
 * - Returns an absolute URL string where possible
 * 
 * @param {string|Location|URL} inputUrl
 * @param {Array<string|{slug?: string}>} items
 * @returns {string} Fully qualified comparison URL
 */
export function buildShareableComparisonUrl(inputUrl, items) {
  const serialized = serializeComparisonSlugs(items);
  let baseOrigin = 'http://localhost';
  if (typeof window !== 'undefined' && window.location?.origin) {
    baseOrigin = window.location.origin;
  }

  let urlObj;
  try {
    if (!inputUrl) {
      urlObj = new URL(typeof window !== 'undefined' ? window.location.href : 'http://localhost/compare');
    } else if (typeof inputUrl === 'string') {
      urlObj = new URL(inputUrl, baseOrigin);
    } else if (inputUrl && typeof inputUrl === 'object' && inputUrl.href) {
      urlObj = new URL(inputUrl.href);
    } else {
      urlObj = new URL('/compare', baseOrigin);
    }
  } catch {
    urlObj = new URL('/compare', baseOrigin);
  }

  const searchParams = urlObj.searchParams;
  searchParams.delete('add');

  if (serialized) {
    searchParams.set('compare', serialized);
  } else {
    searchParams.delete('compare');
  }

  // Handle relative strings in non-browser Node environments where input had no scheme
  if (typeof inputUrl === 'string' && !inputUrl.startsWith('http://') && !inputUrl.startsWith('https://') && typeof window === 'undefined') {
    const search = searchParams.toString();
    return `${urlObj.pathname}${search ? `?${search}` : ''}`;
  }

  return urlObj.toString();
}

/**
 * Copies a string to the system clipboard with fallback support for non-secure / headless contexts.
 * 
 * @param {string} text
 * @returns {Promise<{success: boolean, error?: Error}>}
 */
export async function copyTextToClipboard(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } catch {
      // Fall through to DOM fallback
    }
  }

  if (typeof document !== 'undefined') {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.opacity = '0';
      textArea.setAttribute('readonly', '');
      textArea.setAttribute('aria-hidden', 'true');
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        return { success: true };
      }
    } catch (err) {
      return { success: false, error: err };
    }
  }

  return {
    success: false,
    error: new Error('Clipboard API unavailable in this browser environment'),
  };
}

