"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "almanax-favoris";

function lire(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favoris, setFavoris] = useState<string[]>([]);

  useEffect(() => {
    setFavoris(lire());
  }, []);

  const toggleFavori = useCallback((date: string) => {
    setFavoris((prev) => {
      const next = prev.includes(date)
        ? prev.filter((d) => d !== date)
        : [...prev, date];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const estFavori = useCallback((date: string) => favoris.includes(date), [favoris]);

  return { favoris, toggleFavori, estFavori };
}
