export type StatutServeur = "Up" | "Down" | "Maintenance" | "Unstable" | "Unknown";

export type JeuAnkama = "dofus2" | "dofusTouch" | "dofusRetro" | "wakfu";

export const JEU_LABELS: Record<JeuAnkama, string> = {
  dofus2: "DOFUS",
  dofusTouch: "DOFUS Touch",
  dofusRetro: "DOFUS Retro",
  wakfu: "WAKFU",
};

export const JEUX_ORDRE: JeuAnkama[] = ["dofus2", "dofusTouch", "dofusRetro", "wakfu"];

export const STATUT_LABELS: Record<StatutServeur, string> = {
  Up: "En ligne",
  Down: "Hors ligne",
  Maintenance: "Maintenance",
  Unstable: "Instable",
  Unknown: "Inconnu",
};

export type Serveur = {
  id: string;
  nom: string;
  jeu: JeuAnkama;
  statut: StatutServeur;
};

// En maintenance (ou down) = ce qu'on veut surveiller de près.
export function estIndisponible(statut: StatutServeur): boolean {
  return statut === "Maintenance" || statut === "Down";
}

type EntreeExportAnkama = {
  tags: string[];
  names: Record<string, string>;
  status: string;
};

const EXPORT_URL = "https://status.cdn.ankama.com/export.json";

export async function fetchServeurs(): Promise<Serveur[]> {
  const res = await fetch(EXPORT_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Ankama status export a répondu ${res.status}`);
  const data: EntreeExportAnkama[] = await res.json();

  const serveurs: Serveur[] = [];
  for (const entree of data) {
    if (!entree.tags.includes("game-server")) continue;
    const jeu = entree.tags.find((t): t is JeuAnkama => t in JEU_LABELS);
    if (!jeu) continue;

    const nom = entree.names.fr || entree.names.en || Object.values(entree.names)[0];
    serveurs.push({
      id: `${jeu}:${nom}`,
      nom,
      jeu,
      statut: (entree.status as StatutServeur) ?? "Unknown",
    });
  }

  return serveurs.sort((a, b) => a.nom.localeCompare(b.nom));
}
