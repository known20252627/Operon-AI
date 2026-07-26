import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Operon AI — Autonomous Business Operations Employee",
  description:
    "AI Business Operations Agent and autonomous employee. Automate OCR, CRM, inventory, tenders, PDF quotations, and follow-ups.",
  keywords: [
    "Operon AI",
    "AI employee",
    "OCR",
    "CRM",
    "inventory",
    "tenders",
    "quotation",
    "automation",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
