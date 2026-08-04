import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import webpush from "web-push";
import { fetchServeurs, estIndisponible, Serveur } from "@/lib/serveurs";
import { getEtatServeur, setEtatServeur, listSubscriptions, removeSubscription } from "@/lib/kv";
import { planifierVerificationRapide } from "@/lib/qstash";

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

async function notifierSuiveurs(serveur: Serveur, type: "maintenance" | "retour") {
  const subscriptions = await listSubscriptions();
  const concernes = subscriptions.filter((r) => r.favorisServeurs.includes(serveur.id));
  if (concernes.length === 0) return;

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const payload = JSON.stringify(
    type === "maintenance"
      ? {
          title: "Serveur en maintenance ⚠️",
          body: `${serveur.nom} (${serveur.jeu}) est passé en maintenance.`,
          url: "/serveurs",
        }
      : {
          title: "Serveur de retour 🎉",
          body: `${serveur.nom} (${serveur.jeu}) est de nouveau disponible !`,
          url: "/serveurs",
        }
  );

  await Promise.all(
    concernes.map(async (record) => {
      try {
        await webpush.sendNotification(record.subscription, payload);
      } catch (err: any) {
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await removeSubscription(record.subscription.endpoint);
        }
      }
    })
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("upstash-signature");
  if (!signature || !(await receiver.verify({ signature, body }))) {
    return NextResponse.json({ error: "signature invalide" }, { status: 401 });
  }

  const serveurs = await fetchServeurs();
  const entresEnMaintenance: string[] = [];
  const retablis: string[] = [];

  await Promise.all(
    serveurs.map(async (serveur) => {
      const etatPrecedent = await getEtatServeur(serveur.id);
      const indisponible = estIndisponible(serveur.statut);

      if (indisponible && etatPrecedent !== "maintenance") {
        await setEtatServeur(serveur.id, "maintenance");
        await notifierSuiveurs(serveur, "maintenance");
        await planifierVerificationRapide(serveur.id);
        entresEnMaintenance.push(serveur.id);
      } else if (!indisponible && etatPrecedent === "maintenance") {
        await setEtatServeur(serveur.id, "up");
        await notifierSuiveurs(serveur, "retour");
        retablis.push(serveur.id);
      }
    })
  );

  return NextResponse.json({ ok: true, checked: serveurs.length, entresEnMaintenance, retablis });
}
