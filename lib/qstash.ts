import { Client } from "@upstash/qstash";

export const qstashClient = new Client({ token: process.env.QSTASH_TOKEN! });

// URL publique de l'app, utilisée comme cible des messages QStash (schedule
// récurrent + rappels ponctuels en chaîne). QStash doit pouvoir l'atteindre
// depuis l'extérieur, donc inutilisable en local (localhost).
export function baseUrl(): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "https://almanax-site.vercel.app";
}

export async function planifierVerificationRapide(serveurId: string) {
  await qstashClient.publishJSON({
    url: `${baseUrl()}/api/qstash/check-fast`,
    body: { serveurId },
    delay: "30s",
  });
}
