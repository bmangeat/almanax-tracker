"use client";

import { useEffect, useMemo, useState } from "react";
import {
  JEUX_ORDRE,
  JEU_LABELS,
  STATUT_LABELS,
  Serveur,
  estIndisponible,
} from "@/lib/serveurs";
import { useFavorites } from "@/lib/use-favorites";

const STATUT_COLOR: Record<string, string> = {
  Up: "bg-moss/10 text-moss",
  Down: "bg-rust/10 text-rust",
  Maintenance: "bg-gold/20 text-gold",
  Unstable: "bg-plum/10 text-plum",
  Unknown: "bg-ink/10 text-ink/50",
};

const LOGO_JEU: Record<string, string> = {
  dofus2: "/games/dofus2.webp",
  dofusTouch: "/games/dofusTouch.webp",
  dofusRetro: "/games/dofusRetro.webp",
  wakfu: "/games/wakfu.webp",
};

export default function ServeursPage() {
  const [serveurs, setServeurs] = useState<Serveur[]>([]);
  const [erreur, setErreur] = useState(false);
  const [filtreJeu, setFiltreJeu] = useState<string | null>(null);
  const { estFavori, toggleFavori } = useFavorites("almanax-serveurs-favoris");

  useEffect(() => {
    async function charger() {
      try {
        const res = await fetch("/api/serveurs");
        if (!res.ok) throw new Error();
        setServeurs(await res.json());
        setErreur(false);
      } catch {
        setErreur(true);
      }
    }
    charger();
    const interval = setInterval(charger, 60_000);
    return () => clearInterval(interval);
  }, []);

  const affiches = useMemo(() => {
    const filtres = filtreJeu ? serveurs.filter((s) => s.jeu === filtreJeu) : serveurs;
    return [...filtres].sort((a, b) => Number(estFavori(b.id)) - Number(estFavori(a.id)));
  }, [serveurs, filtreJeu, estFavori]);
  const enMaintenance = serveurs.filter((s) => estIndisponible(s.statut));

  return (
    <main className="min-h-screen bg-parchment">
      <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-moss font-body mb-2">
            Ankama · Statut des serveurs
          </p>
          <h1 className="font-display text-3xl sm:text-4xl text-ink">
            Vos serveurs, en un coup d'œil
          </h1>
          <p className="text-ink/60 font-body mt-2 max-w-2xl">
            Mettez en favori les serveurs à surveiller pour être prévenu par
            notification dès qu'ils passent en maintenance, et dès qu'ils reviennent.
          </p>
        </header>

        {erreur && (
          <p className="mb-4 text-sm text-rust font-body">
            Impossible de récupérer le statut des serveurs pour le moment.
          </p>
        )}

        {enMaintenance.length > 0 && (
          <div className="mb-6 rounded-xl border border-gold/40 bg-gold/10 p-4">
            <p className="text-sm font-body text-ink">
              <span className="font-semibold text-gold">
                {enMaintenance.length} serveur{enMaintenance.length > 1 ? "s" : ""}
              </span>{" "}
              actuellement en maintenance : {enMaintenance.map((s) => s.nom).join(", ")}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFiltreJeu(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-body border transition-colors ${
              filtreJeu === null
                ? "bg-moss text-parchment border-moss"
                : "bg-parchment text-ink/70 border-ink/20 hover:border-moss"
            }`}
          >
            Tous les jeux
          </button>
          {JEUX_ORDRE.map((jeu) => (
            <button
              key={jeu}
              onClick={() => setFiltreJeu(jeu)}
              className={`px-3 py-1.5 rounded-full text-xs font-body border transition-colors ${
                filtreJeu === jeu
                  ? "bg-moss text-parchment border-moss"
                  : "bg-parchment text-ink/70 border-ink/20 hover:border-moss"
              }`}
            >
              {JEU_LABELS[jeu]}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-ink/10 bg-parchment overflow-hidden">
          {affiches.map((serveur) => (
            <div
              key={serveur.id}
              className={`flex items-center gap-3 px-4 py-3 border-b border-ink/5 last:border-0 ${
                estIndisponible(serveur.statut) ? "bg-gold/5" : ""
              }`}
            >
              <button
                onClick={() => toggleFavori(serveur.id)}
                aria-label={estFavori(serveur.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                className={`text-lg leading-none ${
                  estFavori(serveur.id) ? "text-gold" : "text-ink/20 hover:text-ink/40"
                }`}
              >
                {estFavori(serveur.id) ? "★" : "☆"}
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO_JEU[serveur.jeu]} alt="" className="w-6 h-6 shrink-0 object-contain" />
              <span className="flex-1 font-body text-ink font-medium">{serveur.nom}</span>
              <span className="text-xs text-ink/50 font-body whitespace-nowrap">
                {JEU_LABELS[serveur.jeu]}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs whitespace-nowrap font-medium ${STATUT_COLOR[serveur.statut]}`}
              >
                {STATUT_LABELS[serveur.statut]}
              </span>
            </div>
          ))}
          {affiches.length === 0 && !erreur && (
            <p className="text-center py-10 text-ink/50 font-body">Chargement…</p>
          )}
        </div>
      </div>
    </main>
  );
}
