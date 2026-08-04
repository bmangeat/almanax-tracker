"use client";

import { useCallback, useEffect, useState } from "react";

function lire(storageKey: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useFavorites(storageKey: string = "almanax-favoris") {
  const [favoris, setFavoris] = useState<string[]>([]);

  useEffect(() => {
    setFavoris(lire(storageKey));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const toggleFavori = useCallback(
    (id: string) => {
      setFavoris((prev) => {
        const next = prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id];
        window.localStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      });
    },
    [storageKey]
  );

  const estFavori = useCallback((id: string) => favoris.includes(id), [favoris]);

  return { favoris, toggleFavori, estFavori };
}
