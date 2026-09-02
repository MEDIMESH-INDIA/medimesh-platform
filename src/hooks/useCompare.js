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

  const addHospital = (slug) => {
    const list = JSON.parse(localStorage.getItem('compareList') || '[]');
    if (list.length < 3 && !list.includes(slug)) {
      list.push(slug);
      localStorage.setItem('compareList', JSON.stringify(list));
      setCompareList(list);
      window.dispatchEvent(new Event('compare-updated'));
    }
  };

  const removeHospital = (slug) => {
    const list = JSON.parse(localStorage.getItem('compareList') || '[]');
    const updated = list.filter(s => s !== slug);
    localStorage.setItem('compareList', JSON.stringify(updated));
    setCompareList(updated);
    window.dispatchEvent(new Event('compare-updated'));
  };

  const clearComparison = () => {
    localStorage.setItem('compareList', JSON.stringify([]));
    setCompareList([]);
    window.dispatchEvent(new Event('compare-updated'));
  };

  const isCompared = (slug) => compareList.includes(slug);

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
