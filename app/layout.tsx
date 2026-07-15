<<<<<<< HEAD
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { AlertProvider } from "@/contexts/alert-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pollería Gerson",
  description: "Aplicación de gestión para la Pollería Gerson",
};
=======
import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AlertProvider } from "@/contexts/alert-context"
import { AlertsContainer } from "@/components/alerts-container"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Pollería Gerson - Sistema de Gestión",
  description: "Sistema completo de gestión para restaurante",
    generator: 'v0.app'
}
>>>>>>> 6ca1d5ea6b7d57cb64a864fbec055783162f736e

export default function RootLayout({
  children,
}: Readonly<{
<<<<<<< HEAD
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
    <SpeedInsights/>
      <body className={inter.className}>
        <AlertProvider>
          {children}
          <SpeedInsights />
          <Analytics />
        </AlertProvider>
      </body>
    </html>
  );
}
=======
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <AlertProvider>
          {children}
          <AlertsContainer />
        </AlertProvider>
      </body>
    </html>
  )
}
>>>>>>> 6ca1d5ea6b7d57cb64a864fbec055783162f736e
