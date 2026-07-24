"use client";

import {
  BonusCategorie,
  CATEGORIE_LABELS,
  GROUPES_METIER_ORDRE,
  GROUPE_METIER_LABELS,
  groupeMetier,
} from "@/lib/types";
import { Filtres } from "@/lib/filters";

const CATEGORIES_AFFICHEES: BonusCategorie[] = [
  "xp",
  "drop",
  "pvm",
  "craft",
  "metier",
  "elevage",
  "quete",
  "kamas_bonus",
];

type Props = {
  filtres: Filtres;
  onChange: (f: Filtres) => void;
  metiersDisponibles: string[];
  nbResultats: number;
};

export default function FilterBar({
  filtres,
  onChange,
  metiersDisponibles,
  nbResultats,
}: Props) {
  function toggleCategorie(cat: BonusCategorie) {
    const actives = filtres.categories.includes(cat)
      ? filtres.categories.filter((c) => c !== cat)
      : [...filtres.categories, cat];
    onChange({ ...filtres, categories: actives });
  }

  return (
    <div className="bg-parchmentDark/60 border border-ink/10 rounded-xl p-5 space-y-5">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs uppercase tracking-wide text-ink/60 mb-1 font-body">
            Recherche
          </label>
          <input
            type="text"
            placeholder="Item, bonus, donjon..."
            value={filtres.recherche}
            onChange={(e) => onChange({ ...filtres, recherche: e.target.value })}
            className="w-full rounded-lg border border-ink/20 bg-parchment px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-moss"
          />
        </div>

        <div className="w-full sm:w-56">
          <label className="block text-xs uppercase tracking-wide text-ink/60 mb-1 font-body">
            Kamas minimum
          </label>
          <input
            type="number"
            min={0}
            placeholder="ex: 5000"
            value={filtres.kamasMin || ""}
            onChange={(e) =>
              onChange({
                ...filtres,
                kamasMin: e.target.value ? Number(e.target.value) : 0,
              })
            }
            className="w-full rounded-lg border border-ink/20 bg-parchment px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-moss"
          />
        </div>

        <div className="w-full sm:w-56">
          <label className="block text-xs uppercase tracking-wide text-ink/60 mb-1 font-body">
            Métier concerné
          </label>
          <select
            value={filtres.metier ?? ""}
            onChange={(e) =>
              onChange({ ...filtres, metier: e.target.value || null })
            }
            className="w-full rounded-lg border border-ink/20 bg-parchment px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-moss"
          >
            <option value="">Tous les métiers</option>
            {GROUPES_METIER_ORDRE.map((groupe) => {
              const metiersDuGroupe = metiersDisponibles.filter(
                (m) => groupeMetier(m) === groupe
              );
              if (metiersDuGroupe.length === 0) return null;
              return (
                <optgroup key={groupe} label={GROUPE_METIER_LABELS[groupe]}>
                  {metiersDuGroupe.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide text-ink/60 mb-2 font-body">
          Catégorie de bonus
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES_AFFICHEES.map((cat) => {
            const actif = filtres.categories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategorie(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-body border transition-colors ${
                  actif
                    ? "bg-moss text-parchment border-moss"
                    : "bg-parchment text-ink/70 border-ink/20 hover:border-moss"
                }`}
              >
                {CATEGORIE_LABELS[cat]}
              </button>
            );
          })}
          {(filtres.categories.length > 0 ||
            filtres.metier ||
            filtres.kamasMin > 0 ||
            filtres.recherche) && (
            <button
              onClick={() =>
                onChange({ kamasMin: 0, categories: [], metier: null, recherche: "" })
              }
              className="px-3 py-1.5 rounded-full text-xs font-body border border-rust/40 text-rust hover:bg-rust/10"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-ink/50 font-body">
        {nbResultats} offrande{nbResultats > 1 ? "s" : ""} correspondante
        {nbResultats > 1 ? "s" : ""}
      </p>
    </div>
  );
}
