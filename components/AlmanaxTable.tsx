"use client";

import { useMemo, useState } from "react";
import { OffrandeAlmanax, CATEGORIE_LABELS } from "@/lib/types";
import {
  dateDuJour,
  distanceDepuisAujourdhui,
  formatDateAffichage,
  formatKamas,
  prochaineDate,
} from "@/lib/filters";

type SortKey = "favori" | "date" | "item" | "kamas" | "bonus" | "categories";

type Props = {
  offrandes: OffrandeAlmanax[];
  estFavori: (date: string) => boolean;
  toggleFavori: (date: string) => void;
};

const CATEGORIE_COLOR: Record<string, string> = {
  xp: "bg-plum/10 text-plum",
  drop: "bg-gold/15 text-gold",
  pvm: "bg-rust/10 text-rust",
  craft: "bg-moss/10 text-moss",
  metier: "bg-moss/10 text-mossDark",
  elevage: "bg-rust/10 text-rust",
  quete: "bg-plum/10 text-plum",
  kamas_bonus: "bg-gold/20 text-gold",
  autre: "bg-ink/10 text-ink/60",
  aucun: "bg-ink/5 text-ink/40",
};

function categoriesTriables(o: OffrandeAlmanax): string {
  return o.bonusCategories
    .map((c) => CATEGORIE_LABELS[c])
    .sort()
    .join(",");
}

export default function AlmanaxTable({ offrandes, estFavori, toggleFavori }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDesc, setSortDesc] = useState(false);

  const today = dateDuJour();

  const sorted = useMemo(() => {
    const copy = [...offrandes];
    copy.sort((a, b) => {
      let v: number;
      switch (sortKey) {
        case "favori":
          v = Number(estFavori(a.date)) - Number(estFavori(b.date));
          break;
        case "date":
          v = distanceDepuisAujourdhui(a.date, today) - distanceDepuisAujourdhui(b.date, today);
          break;
        case "item":
          v = a.item.localeCompare(b.item);
          break;
        case "kamas":
          v = a.kamas - b.kamas;
          break;
        case "bonus":
          v = (a.bonusDescription ?? "").localeCompare(b.bonusDescription ?? "");
          break;
        case "categories":
          v = categoriesTriables(a).localeCompare(categoriesTriables(b));
          break;
      }
      return sortDesc ? -v : v;
    });
    return copy;
  }, [offrandes, sortKey, sortDesc, today, estFavori]);

  const dateAMettreEnAvant = useMemo(
    () => prochaineDate(offrandes, today),
    [offrandes, today]
  );

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortKey(key);
      setSortDesc(false);
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-ink/10 bg-parchment">
      <table className="w-full text-sm font-body">
        <thead>
          <tr className="border-b border-ink/10 text-left text-ink/60">
            <th
              className="px-2 py-3 w-8 cursor-pointer select-none text-center"
              onClick={() => toggleSort("favori")}
              aria-label="Trier par favori"
            >
              ★{sortKey === "favori" ? (sortDesc ? " ↓" : " ↑") : ""}
            </th>
            <th
              className="px-4 py-3 cursor-pointer select-none whitespace-nowrap"
              onClick={() => toggleSort("date")}
            >
              Date {sortKey === "date" ? (sortDesc ? "↓" : "↑") : ""}
            </th>
            <th
              className="px-4 py-3 cursor-pointer select-none whitespace-nowrap"
              onClick={() => toggleSort("item")}
            >
              Offrande {sortKey === "item" ? (sortDesc ? "↓" : "↑") : ""}
            </th>
            <th
              className="px-4 py-3 cursor-pointer select-none whitespace-nowrap"
              onClick={() => toggleSort("kamas")}
            >
              Kamas {sortKey === "kamas" ? (sortDesc ? "↓" : "↑") : ""}
            </th>
            <th
              className="px-4 py-3 cursor-pointer select-none whitespace-nowrap"
              onClick={() => toggleSort("bonus")}
            >
              Bonus {sortKey === "bonus" ? (sortDesc ? "↓" : "↑") : ""}
            </th>
            <th
              className="px-4 py-3 cursor-pointer select-none whitespace-nowrap"
              onClick={() => toggleSort("categories")}
            >
              Catégories {sortKey === "categories" ? (sortDesc ? "↓" : "↑") : ""}
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((o) => {
            const estEnAvant = o.date === dateAMettreEnAvant;
            return (
            <tr
              key={o.date}
              className={`border-b border-ink/5 last:border-0 hover:bg-parchmentDark/40 ${
                estEnAvant ? "bg-gold/10" : ""
              }`}
            >
              <td className="px-2 py-3 text-center">
                <button
                  onClick={() => toggleFavori(o.date)}
                  aria-label={estFavori(o.date) ? "Retirer des favoris" : "Ajouter aux favoris"}
                  className={`text-lg leading-none ${
                    estFavori(o.date) ? "text-gold" : "text-ink/20 hover:text-ink/40"
                  }`}
                >
                  {estFavori(o.date) ? "★" : "☆"}
                </button>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-ink/70">
                <div className="flex items-center gap-2">
                  {formatDateAffichage(o.date)}
                  {estEnAvant && (
                    <span className="px-2 py-0.5 rounded-full text-xs whitespace-nowrap bg-gold/20 text-gold font-medium">
                      {o.date === today ? "Aujourd'hui" : "Prochain"}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 font-medium text-ink">
                <div className="flex items-center gap-2">
                  {o.imgUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={o.imgUrl}
                      alt={o.item}
                      className="w-8 h-8 shrink-0 object-contain"
                    />
                  ) : (
                    <div className="w-8 h-8 shrink-0 rounded bg-ink/5" aria-hidden />
                  )}
                  <span>
                    {o.quantite} {o.item}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-gold font-semibold">
                {formatKamas(o.kamas)}
              </td>
              <td className="px-4 py-3 text-ink/70 max-w-md">
                {o.bonusDescription ?? "—"}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {o.bonusCategories.map((c) => (
                    <span
                      key={c}
                      className={`px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${CATEGORIE_COLOR[c]}`}
                    >
                      {CATEGORIE_LABELS[c]}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
      {sorted.length === 0 && (
        <p className="text-center py-10 text-ink/50 font-body">
          Aucune offrande ne correspond à ces filtres.
        </p>
      )}
    </div>
  );
}
