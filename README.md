# Almanax Dofus — Offrandes filtrées

Site Next.js listant les 366 offrandes de l'Almanax Dofus, avec filtres par
kamas, catégorie de bonus et métier concerné.

## Démarrer en local

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000

## Déployer

Le projet est prêt pour un déploiement sur Vercel (ou tout hébergeur
compatible Next.js) : `vercel deploy`, ou en connectant le dépôt Git
directement sur vercel.com.

## Structure

- `data/almanax.json` — les 366 offrandes (une par jour). C'est la source de
  vérité : éditable à la main pour corriger un montant de kamas ou une
  catégorie.
- `lib/types.ts` — le modèle de données et les libellés des catégories.
- `lib/filters.ts` — la logique de filtrage (fonctions pures).
- `components/FilterBar.tsx` — la barre de filtres (recherche, kamas, métier,
  catégories).
- `components/AlmanaxTable.tsx` — le tableau triable des résultats.
- `app/page.tsx` — assemble le tout.

## Corriger ou compléter les données

Le scraping initial (voir le dossier `scraper/` si présent) déduit les
catégories de bonus à partir des icônes de la source. Si une catégorisation
vous semble fausse pour un jour donné, éditez directement l'entrée
correspondante dans `data/almanax.json` — pas besoin de base de données ni de
back-office pour 366 lignes.

## Prochaines pistes (non implémentées)

- Vue calendrier en complément de la vue tableau.
- Suivi de la valeur HDV réelle (au lieu d'un montant fixe), si une source de
  prix devient disponible.
- Export/partage d'une sélection filtrée.
