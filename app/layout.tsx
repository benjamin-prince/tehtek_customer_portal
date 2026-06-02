import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TEHTEK — Suivi de colis",
  description: "Suivez vos expéditions et commandes TEHTEK",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
