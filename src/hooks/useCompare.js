import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "sanwater_compare";
const CHANGE_EVENT = "sanwater_compare_change";
export const MAX_COMPARE = 4;

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStore(serialNumbers) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialNumbers));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {
    // ignore — see useFavorites.js
  }
}

export function useCompare() {
  const [compareList, setCompareList] = useState(readStore);

  useEffect(() => {
    const sync = () => setCompareList(readStore());
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isInCompare = useCallback(
    (serialNumber) => compareList.includes(serialNumber),
    [compareList]
  );

  // Returns false (and leaves the list untouched) when adding would exceed
  // MAX_COMPARE, so the caller can show a "list is full" message.
  const toggleCompare = useCallback((serialNumber) => {
    if (!serialNumber) return true;
    const current = readStore();
    if (current.includes(serialNumber)) {
      const next = current.filter((s) => s !== serialNumber);
      writeStore(next);
      setCompareList(next);
      return true;
    }
    if (current.length >= MAX_COMPARE) {
      return false;
    }
    const next = [...current, serialNumber];
    writeStore(next);
    setCompareList(next);
    return true;
  }, []);

  const removeFromCompare = useCallback((serialNumber) => {
    const next = readStore().filter((s) => s !== serialNumber);
    writeStore(next);
    setCompareList(next);
  }, []);

  const clearCompare = useCallback(() => {
    writeStore([]);
    setCompareList([]);
  }, []);

  return {
    compareList,
    isInCompare,
    toggleCompare,
    removeFromCompare,
    clearCompare,
    count: compareList.length,
    isFull: compareList.length >= MAX_COMPARE,
  };
}

export default useCompare;
