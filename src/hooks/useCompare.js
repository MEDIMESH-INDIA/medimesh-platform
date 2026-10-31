import { useCallback, useEffect, useState } from 'react';
import { getCachedUserId } from '../routes/authGuardState.js';

export const STORAGE_KEY = 'compareList';
export const GUEST_STORAGE_KEY = 'medimesh_compare_v1';

export function getAccountStorageKey(userId) {
  return `medimesh_compare_v1_${userId}`;
}

export function getCompareStorageKey(userId) {
  const effectiveUserId = userId !== undefined ? userId : getCachedUserId();
  return effectiveUserId ? getAccountStorageKey(effectiveUserId) : GUEST_STORAGE_KEY;
}

const normalizeItem = item => {
  if (typeof item === 'string') {
    const trimmed = item.trim();
    return trimmed ? { slug: trimmed, name: trimmed } : null;
  }
  if (!item?.slug || typeof item.slug !== 'string') return null;
  const slug = item.slug.trim();
  if (!slug) return null;
  return { slug, name: typeof item.name === 'string' && item.name.trim() ? item.name.trim() : slug };
};

// In-memory cache of hospital names by slug to enrich restored items without persisting bloated data
const hospitalNameCache = new Map();

function parseStoredSlugs(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const slugs = [];
    for (const item of parsed) {
      const slug = typeof item === 'string'
        ? item.trim()
        : (typeof item?.slug === 'string' ? item.slug.trim() : '');
      if (slug && !slugs.includes(slug)) {
        if (typeof item === 'object' && item?.name && typeof item.name === 'string' && item.name.trim()) {
          hospitalNameCache.set(slug, item.name.trim());
        }
        slugs.push(slug);
        if (slugs.length === 3) break;
      }
    }
    return slugs;
  } catch {
    return [];
  }
}

export function readStoredComparison(userId) {
  if (typeof localStorage === 'undefined') return [];
  try {
    const activeKey = getCompareStorageKey(userId);
    const stored = localStorage.getItem(activeKey);
    let slugs = parseStoredSlugs(stored);

    // If active versioned key has no stored data, check legacy key for one-time seamless migration
    if (stored === null && slugs.length === 0) {
      const legacyRaw = localStorage.getItem(STORAGE_KEY);
      if (legacyRaw) {
        slugs = parseStoredSlugs(legacyRaw);
        if (slugs.length > 0) {
          try {
            localStorage.setItem(activeKey, JSON.stringify(slugs));
          } catch {
            // Ignore storage write errors
          }
        }
      }
    }

    return slugs.map(slug => ({
      slug,
      name: hospitalNameCache.get(slug) || slug,
    }));
  } catch {
    return [];
  }
}

const writeStoredComparison = (list, userId) => {
  const normalized = (Array.isArray(list) ? list : [])
    .map(normalizeItem)
    .filter(Boolean);

  const unique = [];
  const seen = new Set();
  for (const item of normalized) {
    if (!seen.has(item.slug)) {
      seen.add(item.slug);
      unique.push(item);
      if (item.name) {
        hospitalNameCache.set(item.slug, item.name);
      }
      if (unique.length === 3) break;
    }
  }

  const slugs = unique.map(item => item.slug);
  const activeKey = getCompareStorageKey(userId);

  if (typeof localStorage !== 'undefined') {
    try {
      // Persist only hospital IDs/slugs under versioned/account key
      localStorage.setItem(activeKey, JSON.stringify(slugs));
      // Keep legacy storage key mirrored for backwards-compatible readers
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
    } catch {
      // Ignore quota/permission errors in restricted environments
    }
  }

  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new Event('compare-updated'));
  }

  return unique;
};

export function clearPersistedComparison() {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore quota/permission errors in restricted environments
    }
  }
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new Event('compare-updated'));
  }
}

export function clearAllComparisonStorage(userId) {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(GUEST_STORAGE_KEY);
      const effectiveUserId = userId !== undefined ? userId : getCachedUserId();
      if (effectiveUserId) {
        localStorage.removeItem(getAccountStorageKey(effectiveUserId));
      }
    } catch {
      // Ignore quota/permission errors in restricted environments
    }
  }
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new Event('compare-updated'));
  }
}

export function useCompare() {
  const [compareList, setCompareList] = useState(readStoredComparison);

  useEffect(() => {
    const updateList = () => setCompareList(readStoredComparison());
    window.addEventListener('compare-updated', updateList);
    window.addEventListener('storage', updateList);
    return () => {
      window.removeEventListener('compare-updated', updateList);
      window.removeEventListener('storage', updateList);
    };
  }, []);

  const addHospital = useCallback(hospital => {
    const item = normalizeItem(hospital);
    if (!item) return false;
    const current = readStoredComparison();
    if (current.length >= 3 || current.some(existing => existing.slug === item.slug)) return false;
    const next = [...current, item];
    writeStoredComparison(next);
    setCompareList(next);
    return true;
  }, []);

  const removeHospital = useCallback(slug => {
    if (!slug) return;
    const current = readStoredComparison();
    const next = current.filter(item => item.slug !== slug);
    writeStoredComparison(next);
    setCompareList(next);
  }, []);

  const replaceHospital = useCallback((currentSlug, hospital) => {
    const item = normalizeItem(hospital);
    if (!item) return false;
    const current = readStoredComparison();
    if (current.some(existing => existing.slug === item.slug && existing.slug !== currentSlug)) return false;
    const index = current.findIndex(existing => existing.slug === currentSlug);
    if (index < 0) return false;
    const next = [...current];
    next[index] = item;
    writeStoredComparison(next);
    setCompareList(next);
    return true;
  }, []);

  const clearComparison = useCallback(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const activeKey = getCompareStorageKey();
        localStorage.removeItem(activeKey);
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore quota/permission errors in restricted environments
      }
    }
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new Event('compare-updated'));
    }
    setCompareList([]);
  }, []);

  const isCompared = useCallback(slug => compareList.some(item => item.slug === slug), [compareList]);

  const setComparison = useCallback(items => {
    const saved = writeStoredComparison(items);
    setCompareList(saved);
  }, []);

  return {
    compareList,
    addHospital,
    removeHospital,
    replaceHospital,
    clearComparison,
    isCompared,
    canAdd: compareList.length < 3,
    setComparison,
  };
}
