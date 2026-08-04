"use client";

import { useEffect, useState } from "react";
import { useFavorites } from "@/lib/use-favorites";

type Etat = "indisponible" | "inactif" | "actif" | "refuse";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

async function envoyerSubscription(
  subscription: PushSubscription,
  favorisAlmanax: string[],
  favorisServeurs: string[]
) {
  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: subscription.toJSON(), favorisAlmanax, favorisServeurs }),
  });
}

export default function NotificationSettings() {
  const [etat, setEtat] = useState<Etat>("inactif");
  const [chargement, setChargement] = useState(false);
  const { favoris: favorisAlmanax } = useFavorites("almanax-favoris");
  const { favoris: favorisServeurs } = useFavorites("almanax-serveurs-favoris");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setEtat("indisponible");
      return;
    }
    if (Notification.permission === "denied") {
      setEtat("refuse");
      return;
    }
    navigator.serviceWorker.ready.then(async (registration) => {
      const subscription = await registration.pushManager.getSubscription();
      setEtat(subscription ? "actif" : "inactif");
    });
  }, []);

  // Resynchronise les favoris côté serveur si les notifs sont déjà actives.
  useEffect(() => {
    if (etat !== "actif") return;
    navigator.serviceWorker.ready.then(async (registration) => {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) await envoyerSubscription(subscription, favorisAlmanax, favorisServeurs);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favorisAlmanax, favorisServeurs]);

  async function activer() {
    setChargement(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setEtat("refuse");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ) as BufferSource,
      });
      await envoyerSubscription(subscription, favorisAlmanax, favorisServeurs);
      setEtat("actif");
    } finally {
      setChargement(false);
    }
  }

  async function desactiver() {
    setChargement(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setEtat("inactif");
    } finally {
      setChargement(false);
    }
  }

  if (etat === "indisponible") return null;

  if (etat === "refuse") {
    return (
      <p className="text-xs text-ink/50 font-body">
        Notifications bloquées — autorise-les dans les réglages de ton navigateur pour être
        prévenu de tes favoris.
      </p>
    );
  }

  return (
    <button
      onClick={etat === "actif" ? desactiver : activer}
      disabled={chargement}
      className={`px-3 py-1.5 rounded-full text-xs font-body border transition-colors whitespace-nowrap ${
        etat === "actif"
          ? "bg-moss text-parchment border-moss"
          : "bg-parchment text-ink/70 border-ink/20 hover:border-moss"
      }`}
    >
      {etat === "actif" ? "🔔 Notifications activées" : "🔕 Activer les notifications"}
    </button>
  );
}
