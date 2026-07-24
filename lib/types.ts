export type BonusCategorie =
  | "xp"
  | "drop"
  | "pvm"
  | "craft"
  | "metier"
  | "elevage"
  | "quete"
  | "kamas_bonus"
  | "autre"
  | "aucun";

export type OffrandeAlmanax = {
  date: string; // "MM-DD"
  item: string;
  quantite: number;
  kamas: number;
  bonusDescription: string | null;
  bonusCategories: BonusCategorie[];
  metiersConcernes: string[];
  imgUrl: string | null;
};

export const CATEGORIE_LABELS: Record<BonusCategorie, string> = {
  xp: "XP",
  drop: "Drop",
  pvm: "Donjon / Challenge",
  craft: "Craft",
  metier: "Ressource métier",
  elevage: "Élevage",
  quete: "Quête",
  kamas_bonus: "Bonus kamas",
  autre: "Autre",
  aucun: "Aucun bonus",
};
