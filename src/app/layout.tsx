import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans, Space_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  weight: "800",
  subsets: ["latin"],
  variable: "--font-display",
});

const dmSans = DM_Sans({
  weight: ["300", "400"],
  subsets: ["latin"],
  variable: "--font-body",
});

const spaceMono = Space_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-ui",
});

export const metadata: Metadata = {
  title: "Studio Slagg",
  description: "Skrap. Yta. Rum.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="sv"
      className={`${bricolage.variable} ${dmSans.variable} ${spaceMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
