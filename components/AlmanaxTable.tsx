"use client";

import { useMemo, useState } from "react";
import { OffrandeAlmanax, CATEGORIE_LABELS } from "@/lib/types";
import { formatDateAffichage, formatKamas } from "@/lib/filters";

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
          {sorted.map((o) => (
            <tr
              key={o.date}
              className="border-b border-ink/5 last:border-0 hover:bg-parchmentDark/40"
            >
              <td className="px-4 py-3 whitespace-nowrap text-ink/70">
                {formatDateAffichage(o.date)}
              </td>
              <td className="px-4 py-3 font-medium text-ink">
                {o.quantite} {o.item}
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
          ))}
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
