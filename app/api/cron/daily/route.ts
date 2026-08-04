import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import almanaxData from "@/data/almanax.json";
import { OffrandeAlmanax } from "@/lib/types";
import { listSubscriptions, removeSubscription } from "@/lib/kv";

const offrandes = almanaxData as OffrandeAlmanax[];

function dateDuJourUTC(): string {
  const now = new Date();
  const mois = String(now.getUTCMonth() + 1).padStart(2, "0");
  const jour = String(now.getUTCDate()).padStart(2, "0");
  return `${mois}-${jour}`;
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const today = dateDuJourUTC();
  const offrande = offrandes.find((o) => o.date === today);
  if (!offrande) {
    return NextResponse.json({ ok: true, sent: 0, reason: "aucune offrande pour aujourd'hui" });
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const subscriptions = await listSubscriptions();
  const payload = JSON.stringify({
    title: "Almanax du jour ⭐",
    body: `${offrande.quantite} ${offrande.item} — ${offrande.bonusDescription ?? ""}`.trim(),
    url: "/",
  });

  let sent = 0;
  await Promise.all(
    subscriptions
      .filter((record) => record.favorisAlmanax.includes(today))
      .map(async (record) => {
        try {
          await webpush.sendNotification(record.subscription, payload);
          sent++;
        } catch (err: any) {
          if (err?.statusCode === 404 || err?.statusCode === 410) {
            await removeSubscription(record.subscription.endpoint);
          }
        }
      })
  );

  return NextResponse.json({ ok: true, sent });
}
