import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'compareList';

const normalizeItem = item => {
  if (typeof item === 'string') return item ? { slug: item, name: item } : null;
  if (!item?.slug) return null;
  return { slug: item.slug, name: item.name || item.slug };
};

const readList = () => {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value.map(normalizeItem).filter(Boolean).slice(0, 3) : [];
  } catch {
    return [];
  }
};

const writeList = list => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event('compare-updated'));
};

export function useCompare() {
  const [compareList, setCompareList] = useState(readList);

  useEffect(() => {
    const updateList = () => setCompareList(readList());
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
    const list = readList();
    if (list.length >= 3 || list.some(existing => existing.slug === item.slug)) return false;
    writeList([...list, item]);
    return true;
  }, []);

  const removeHospital = useCallback(slug => {
    const list = readList().filter(item => item.slug !== slug);
    writeList(list);
  }, []);

  const replaceHospital = useCallback((currentSlug, hospital) => {
    const item = normalizeItem(hospital);
    if (!item) return false;
    const list = readList();
    if (list.some(existing => existing.slug === item.slug && existing.slug !== currentSlug)) return false;
    const index = list.findIndex(existing => existing.slug === currentSlug);
    if (index < 0) return false;
    const next = [...list];
    next[index] = item;
    writeList(next);
    return true;
  }, []);

  const clearComparison = useCallback(() => writeList([]), []);
  const isCompared = useCallback(slug => compareList.some(item => item.slug === slug), [compareList]);

  return {
    compareList,
    addHospital,
    removeHospital,
    replaceHospital,
    clearComparison,
    isCompared,
    canAdd: compareList.length < 3,
  };
}
