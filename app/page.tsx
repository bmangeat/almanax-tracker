"use client";

import { useMemo, useState } from "react";
import almanaxData from "@/data/almanax.json";
import { OffrandeAlmanax } from "@/lib/types";
import { Filtres, FILTRES_PAR_DEFAUT, filtrerOffrandes, extraireMetiersDisponibles } from "@/lib/filters";
import FilterBar from "@/components/FilterBar";
import AlmanaxTable from "@/components/AlmanaxTable";

const offrandes = almanaxData as OffrandeAlmanax[];

export default function Home() {
  const [filtres, setFiltres] = useState<Filtres>(FILTRES_PAR_DEFAUT);

  const metiersDisponibles = useMemo(() => extraireMetiersDisponibles(offrandes), []);
  const resultats = useMemo(() => filtrerOffrandes(offrandes, filtres), [filtres]);

  return (
    <main className="min-h-screen bg-parchment">
      <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-moss font-body mb-2">
            Dofus · Almanax
          </p>
          <h1 className="font-display text-3xl sm:text-4xl text-ink">
            Les offrandes de l'année, filtrées à votre façon
          </h1>
          <p className="text-ink/60 font-body mt-2 max-w-2xl">
            {offrandes.length} offrandes recensées. Filtrez par valeur en kamas,
            catégorie de bonus ou métier concerné pour planifier vos sessions.
          </p>
        </header>

        <div className="space-y-6">
          <FilterBar
            filtres={filtres}
            onChange={setFiltres}
            metiersDisponibles={metiersDisponibles}
            nbResultats={resultats.length}
          />
          <AlmanaxTable offrandes={resultats} />
        </div>
      </div>
    </main>
  );
}
