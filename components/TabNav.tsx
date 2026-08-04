"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import NotificationSettings from "@/components/NotificationSettings";

const ONGLETS = [
  { href: "/", label: "Almanax" },
  { href: "/serveurs", label: "Serveurs" },
];

export default function TabNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-ink/10 bg-parchmentDark/40">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between gap-6">
        <div className="flex gap-6">
          {ONGLETS.map((onglet) => {
            const actif = pathname === onglet.href;
            return (
              <Link
                key={onglet.href}
                href={onglet.href}
                className={`px-1 py-3 text-sm font-body border-b-2 transition-colors ${
                  actif
                    ? "border-moss text-ink font-medium"
                    : "border-transparent text-ink/50 hover:text-ink/80"
                }`}
              >
                {onglet.label}
              </Link>
            );
          })}
        </div>
        <NotificationSettings />
      </div>
    </nav>
  );
}
