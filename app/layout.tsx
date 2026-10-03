import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Grenze_Gotisch } from "next/font/google";
import "./globals.css";

/** Fuente display con carácter para títulos. */
const grenze = Grenze_Gotisch({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-grenze",
  display: "swap",
});

/** Fuente muy legible para el texto narrativo. */
const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-atkinson",
  display: "swap",
});

export const metadata: Metadata = {
  title: "No salgas a la siesta",
  description:
    "Juego narrativo basado en el mito paraguayo del Pombero (Karai Pyhare). Tito se escapa a la hora de la siesta para cazar pájaros en el monte…",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1630",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${grenze.variable} ${atkinson.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
