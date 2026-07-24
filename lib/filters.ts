import { BonusCategorie, OffrandeAlmanax } from "./types";

export type Filtres = {
  kamasMin: number;
  categories: BonusCategorie[]; // vide = toutes
  metier: string | null; // null = tous
  recherche: string; // recherche libre sur l'item / le bonus
};

export const FILTRES_PAR_DEFAUT: Filtres = {
  kamasMin: 0,
  categories: [],
  metier: null,
  recherche: "",
};

export function filtrerOffrandes(
  offrandes: OffrandeAlmanax[],
  filtres: Filtres
): OffrandeAlmanax[] {
  const recherche = filtres.recherche.trim().toLowerCase();

  return offrandes.filter((o) => {
    if (o.kamas < filtres.kamasMin) return false;

    if (
      filtres.categories.length > 0 &&
      !o.bonusCategories.some((c) => filtres.categories.includes(c))
    ) {
      return false;
    }

    if (filtres.metier && !o.metiersConcernes.includes(filtres.metier)) {
      return false;
    }

    if (recherche) {
      const cible = `${o.item} ${o.bonusDescription ?? ""}`.toLowerCase();
      if (!cible.includes(recherche)) return false;
    }

    return true;
  });
}

export function extraireMetiersDisponibles(offrandes: OffrandeAlmanax[]): string[] {
  const set = new Set<string>();
  offrandes.forEach((o) => o.metiersConcernes.forEach((m) => set.add(m)));
  return Array.from(set).sort();
}

export function formatDateAffichage(date: string): string {
  const [mois, jour] = date.split("-").map(Number);
  const MOIS = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre",
  ];
  return `${jour} ${MOIS[mois - 1]}`;
}

export function formatKamas(kamas: number): string {
  return new Intl.NumberFormat("fr-FR").format(Math.round(kamas)) + " kamas";
}
