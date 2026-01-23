import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Lilita_One } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lilita = Lilita_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "LuvaNetwork - Servidor de Minecraft PvP",
  description:
    "Unite a la experiencia PvP de fantasia definitiva. Batalla en los cielos, sobrevive en la naturaleza y reclama tu trono en LuvaNetwork.",
  keywords: ["minecraft", "servidor", "pvp", "skywars", "survival", "juegos", "latino"],
  openGraph: {
    title: "LuvaNetwork - Servidor de Minecraft PvP",
    description: "La mejor experiencia de Minecraft PvP en Latinoamerica",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${lilita.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
