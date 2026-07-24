import { NextRequest, NextResponse } from "next/server";
import { saveSubscription } from "@/lib/kv";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { subscription, favoris } = body;

  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return NextResponse.json({ error: "subscription invalide" }, { status: 400 });
  }

  await saveSubscription({ subscription, favoris: favoris ?? [] });

  return NextResponse.json({ ok: true });
}
