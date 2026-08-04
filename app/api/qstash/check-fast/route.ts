import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import webpush from "web-push";
import { fetchServeurs, estIndisponible } from "@/lib/serveurs";
import { getEtatServeur, setEtatServeur, listSubscriptions, removeSubscription } from "@/lib/kv";
import { planifierVerificationRapide } from "@/lib/qstash";

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("upstash-signature");
  if (!signature || !(await receiver.verify({ signature, body }))) {
    return NextResponse.json({ error: "signature invalide" }, { status: 401 });
  }

  const { serveurId } = JSON.parse(body) as { serveurId: string };

  // Si l'état a déjà été résolu entre-temps (par le baseline ou une autre
  // chaîne), on arrête silencieusement — pas de double notification.
  const etatPrecedent = await getEtatServeur(serveurId);
  if (etatPrecedent !== "maintenance") {
    return NextResponse.json({ ok: true, arrete: true });
  }

  const serveurs = await fetchServeurs();
  const serveur = serveurs.find((s) => s.id === serveurId);
  if (!serveur) {
    return NextResponse.json({ ok: true, arrete: true, raison: "serveur introuvable" });
  }

  if (estIndisponible(serveur.statut)) {
    await planifierVerificationRapide(serveurId);
    return NextResponse.json({ ok: true, toujoursEnMaintenance: true });
  }

  await setEtatServeur(serveurId, "up");

  const subscriptions = await listSubscriptions();
  const concernes = subscriptions.filter((r) => r.favorisServeurs.includes(serveurId));

  if (concernes.length > 0) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT!,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );

    const payload = JSON.stringify({
      title: "Serveur de retour 🎉",
      body: `${serveur.nom} (${serveur.jeu}) est de nouveau disponible !`,
      url: "/serveurs",
    });

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

  return NextResponse.json({ ok: true, retabli: true });
}
