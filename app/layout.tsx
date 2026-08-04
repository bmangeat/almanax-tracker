import type { Metadata } from "next";
import "./globals.css";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";
import TabNav from "@/components/TabNav";

export const metadata: Metadata = {
  title: "Almanax Dofus — Offrandes filtrées",
  description:
    "Liste complète des offrandes Almanax de Dofus avec filtres par kamas, bonus et métier.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <meta name="theme-color" content="#3D5C3A" />
      </head>
      <body>
        <RegisterServiceWorker />
        <TabNav />
        {children}
      </body>
    </html>
  );
}
