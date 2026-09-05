import { useState, useEffect } from 'react';

export function useCompare() {
  const [compareList, setCompareList] = useState([]);

  useEffect(() => {
    const updateList = () => {
      const list = JSON.parse(localStorage.getItem('compareList') || '[]');
      setCompareList(list);
    };
    updateList();
    window.addEventListener('compare-updated', updateList);
    return () => window.removeEventListener('compare-updated', updateList);
  }, []);

  const addHospital = (hospital) => {
    // hospital can be a slug string or an object {slug, name}
    const slug = typeof hospital === 'string' ? hospital : hospital.slug;
    const name = typeof hospital === 'string' ? slug : hospital.name;
    
    const list = JSON.parse(localStorage.getItem('compareList') || '[]');
    if (list.length < 3 && !list.some(item => (typeof item === 'string' ? item : item.slug) === slug)) {
      list.push({ slug, name });
      localStorage.setItem('compareList', JSON.stringify(list));
      setCompareList(list);
      window.dispatchEvent(new Event('compare-updated'));
    }
  };

  const removeHospital = (slug) => {
    const list = JSON.parse(localStorage.getItem('compareList') || '[]');
    const updated = list.filter(item => (typeof item === 'string' ? item : item.slug) !== slug);
    localStorage.setItem('compareList', JSON.stringify(updated));
    setCompareList(updated);
    window.dispatchEvent(new Event('compare-updated'));
  };

  const clearComparison = () => {
    localStorage.setItem('compareList', JSON.stringify([]));
    setCompareList([]);
    window.dispatchEvent(new Event('compare-updated'));
  };

  const isCompared = (slug) => compareList.some(item => (typeof item === 'string' ? item : item.slug) === slug);

  const canAdd = compareList.length < 3;

  return {
    compareList,
    addHospital,
    removeHospital,
    clearComparison,
    isCompared,
    canAdd
  };
}
