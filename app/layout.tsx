import type { Metadata } from "next";
import "./globals.css";
import { AlertProvider } from "@/contexts/alert-context";

export const metadata: Metadata = {
  title: "Pollería Gerson",
  description: "Aplicación de gestión para la Pollería Gerson",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <AlertProvider>
          {children}
        </AlertProvider>
      </body>
    </html>
  );
}