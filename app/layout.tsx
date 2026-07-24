import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Almanax Dofus — Offrandes filtrées",
  description:
    "Liste complète des offrandes Almanax de Dofus avec filtres par kamas, bonus et métier.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
