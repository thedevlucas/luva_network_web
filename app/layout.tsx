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
  metadataBase: new URL("https://luvanetwork.net"),
  title: {
    default: "LuvaNetwork - Servidor de Hytale",
    template: "%s | LuvaNetwork",
  },
  description:
    "Unite a la experiencia PvP de fantasia definitiva. Batalla en los cielos, sobrevive en la naturaleza y reclama tu trono en LuvaNetwork.",
  keywords: [
    "minecraft",
    "servidor",
    "pvp",
    "skywars",
    "survival",
    "juegos",
    "latino",
    "hytale",
    "server hytale",
    "servidor hytale",
  ],
  
  verification: {
    google: "M9Txh9CLeQr_988Iz88Gl12l6Xl7fV20_HoRox5_VKg",
  },
  icons: {
    icon: [
      { url: "/icon0.svg", type: "image/svg+xml" },
      { url: "/icon1.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },

  manifest: "/manifest.json",

  openGraph: {
    title: "LuvaNetwork - Servidor de Hytale",
    description: "La mejor experiencia de Hytale en habla hispana",
    type: "website",
    url: "https://luvanetwork.net",
    siteName: "LuvaNetwork",
    images: [
      {
        url: "/assets/luva-logo.png",
        width: 1200,
        height: 630,
        alt: "LuvaNetwork - Servidor de Hytale",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LuvaNetwork - Servidor de Hytale",
    description: "La mejor experiencia de Hytale en habla hispana",
    images: ["/assets/luva-logo.png"],
    creator: "@luvanetwork",
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