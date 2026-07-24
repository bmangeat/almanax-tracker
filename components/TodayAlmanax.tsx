"use client";

import { useMemo } from "react";
import { OffrandeAlmanax, CATEGORIE_LABELS } from "@/lib/types";
import { formatDateAffichage, formatKamas } from "@/lib/filters";

type Props = {
  offrandes: OffrandeAlmanax[];
};

function dateDuJour(): string {
  const now = new Date();
  const mois = String(now.getMonth() + 1).padStart(2, "0");
  const jour = String(now.getDate()).padStart(2, "0");
  return `${mois}-${jour}`;
}

export default function TodayAlmanax({ offrandes }: Props) {
  const offrande = useMemo(() => {
    const today = dateDuJour();
    return offrandes.find((o) => o.date === today);
  }, [offrandes]);

  if (!offrande) return null;

  return (
    <div className="rounded-xl border border-moss/30 bg-moss/10 p-5 flex flex-col sm:flex-row gap-4 sm:items-center">
      <div className="flex items-center gap-4 flex-1">
        {offrande.imgUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={offrande.imgUrl}
            alt={offrande.item}
            className="w-16 h-16 shrink-0 object-contain"
          />
        ) : (
          <div className="w-16 h-16 shrink-0 rounded bg-ink/5" aria-hidden />
        )}
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-moss font-body mb-1">
            Almanax du jour · {formatDateAffichage(offrande.date)}
          </p>
          <p className="font-display text-lg text-ink">
            {offrande.quantite} {offrande.item}
          </p>
          <p className="text-sm text-ink/70 font-body mt-1 max-w-2xl">
            {offrande.bonusDescription ?? "—"}
          </p>
        </div>
      </div>
      <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1">
        <span className="text-gold font-semibold font-body whitespace-nowrap">
          {formatKamas(offrande.kamas)}
        </span>
        <div className="flex flex-wrap gap-1 justify-end">
          {offrande.bonusCategories.map((c) => (
            <span
              key={c}
              className="px-2 py-0.5 rounded-full text-xs whitespace-nowrap bg-ink/10 text-ink/60"
            >
              {CATEGORIE_LABELS[c]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
