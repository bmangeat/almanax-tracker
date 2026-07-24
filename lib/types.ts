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

export type GroupeMetier = "recolte" | "craft" | "fm";

export const GROUPE_METIER_LABELS: Record<GroupeMetier, string> = {
  recolte: "Récolte",
  craft: "Craft",
  fm: "Forgemagie (FM)",
};

export const GROUPES_METIER_ORDRE: GroupeMetier[] = ["recolte", "craft", "fm"];

const METIER_GROUPES: Record<string, GroupeMetier> = {
  Bûcheron: "recolte",
  Alchimiste: "recolte",
  Paysan: "recolte",
  Mineur: "recolte",
  Pêcheur: "recolte",
  Chasseur: "recolte",
  Forgeron: "craft",
  Sculpteur: "craft",
  Cordonnier: "craft",
  Tailleur: "craft",
  Bijoutier: "craft",
  Bricoleur: "craft",
  Façonneur: "craft",
  Sculptemages: "fm",
  Façomage: "fm",
  Joaillomage: "fm",
  Costumage: "fm",
  Forgemage: "fm",
  Cordomage: "fm",
};

export function groupeMetier(metier: string): GroupeMetier {
  return METIER_GROUPES[metier] ?? "craft";
}
