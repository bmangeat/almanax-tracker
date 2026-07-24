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

export function dateDuJour(): string {
  const now = new Date();
  const mois = String(now.getMonth() + 1).padStart(2, "0");
  const jour = String(now.getDate()).padStart(2, "0");
  return `${mois}-${jour}`;
}

// Parmi les offrandes données (potentiellement filtrées), trouve la date du
// jour si elle y figure, sinon la prochaine à venir (avec retour au 1er
// janvier si toutes les dates restantes sont déjà passées).
export function prochaineDate(
  offrandes: OffrandeAlmanax[],
  today: string
): string | null {
  if (offrandes.length === 0) return null;
  const dates = offrandes.map((o) => o.date).sort();
  return dates.find((d) => d >= today) ?? dates[0];
}

function ordinalDuJour(date: string): number {
  const [mois, jour] = date.split("-").map(Number);
  // 2024 est bissextile : sert de référence pour inclure le 29 février.
  return Date.UTC(2024, mois - 1, jour) / 86400000;
}

// Distance cyclique (0 à 365) entre `date` et `today` : 0 si c'est aujourd'hui,
// 365 si c'était hier. Permet un tri par date centré sur le jour courant.
export function distanceDepuisAujourdhui(date: string, today: string): number {
  const NB_JOURS = 366;
  const diff = ordinalDuJour(date) - ordinalDuJour(today);
  return ((diff % NB_JOURS) + NB_JOURS) % NB_JOURS;
}
