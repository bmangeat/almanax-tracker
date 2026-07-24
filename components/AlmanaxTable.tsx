"use client";

import { useMemo, useState } from "react";
import { OffrandeAlmanax, CATEGORIE_LABELS } from "@/lib/types";
import { dateDuJour, formatDateAffichage, formatKamas, prochaineDate } from "@/lib/filters";

type SortKey = "date" | "kamas";

type Props = {
  offrandes: OffrandeAlmanax[];
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

export default function AlmanaxTable({ offrandes }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDesc, setSortDesc] = useState(false);

  const sorted = useMemo(() => {
    const copy = [...offrandes];
    copy.sort((a, b) => {
      const v = sortKey === "date" ? a.date.localeCompare(b.date) : a.kamas - b.kamas;
      return sortDesc ? -v : v;
    });
    return copy;
  }, [offrandes, sortKey, sortDesc]);

  const today = dateDuJour();
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
              className="px-4 py-3 cursor-pointer select-none whitespace-nowrap"
              onClick={() => toggleSort("date")}
            >
              Date {sortKey === "date" ? (sortDesc ? "↓" : "↑") : ""}
            </th>
            <th className="px-4 py-3">Offrande</th>
            <th
              className="px-4 py-3 cursor-pointer select-none whitespace-nowrap"
              onClick={() => toggleSort("kamas")}
            >
              Kamas {sortKey === "kamas" ? (sortDesc ? "↓" : "↑") : ""}
            </th>
            <th className="px-4 py-3">Bonus</th>
            <th className="px-4 py-3">Catégories</th>
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
