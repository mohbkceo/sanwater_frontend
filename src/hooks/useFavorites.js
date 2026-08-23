import { useCallback, useEffect, useState } from "react";

// Guest-only favorites (localStorage), per the current architecture — there
// is no customer account system yet (only internal admin accounts exist),
// so there's nowhere server-side to persist this per-user. Stores product
// serialNumbers, not full product objects, so a favorited product's data
// (price, images, etc.) is always fetched fresh rather than going stale.
const STORAGE_KEY = "sanwater_favorites";
const CHANGE_EVENT = "sanwater_favorites_change";

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
    // localStorage unavailable (private mode, quota, etc.) — fail silently,
    // favorites just won't persist for this session.
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(readStore);

  useEffect(() => {
    const sync = () => setFavorites(readStore());
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isFavorite = useCallback(
    (serialNumber) => favorites.includes(serialNumber),
    [favorites]
  );

  const toggleFavorite = useCallback((serialNumber) => {
    if (!serialNumber) return;
    const current = readStore();
    const next = current.includes(serialNumber)
      ? current.filter((s) => s !== serialNumber)
      : [...current, serialNumber];
    writeStore(next);
    setFavorites(next);
  }, []);

  const removeFavorite = useCallback((serialNumber) => {
    const next = readStore().filter((s) => s !== serialNumber);
    writeStore(next);
    setFavorites(next);
  }, []);

  return { favorites, isFavorite, toggleFavorite, removeFavorite, count: favorites.length };
}

export default useFavorites;
