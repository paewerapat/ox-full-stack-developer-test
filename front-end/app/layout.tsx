import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = "https://ox-full-stack-developer-test.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "OX Game — Tic-Tac-Toe",
    template: "%s | OX Game",
  },
  description:
    "เกม OX (Tic-Tac-Toe) ออนไลน์ เล่นกับ AI บอท มีระบบคะแนนสะสม และ Leaderboard เข้าสู่ระบบผ่าน Google",
  keywords: [
    "OX Game",
    "Tic-Tac-Toe",
    "เกม OX",
    "เกมออนไลน์",
    "Minimax AI",
    "Leaderboard",
  ],
  authors: [{ name: "OX Game" }],
  creator: "OX Game",
  metadataBase: new URL(APP_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: "OX Game",
    title: "OX Game — Tic-Tac-Toe",
    description:
      "เกม OX ออนไลน์ เล่นกับ AI บอท มีระบบคะแนนสะสม และ Leaderboard",
    locale: "th_TH",
  },
  twitter: {
    card: "summary",
    title: "OX Game — Tic-Tac-Toe",
    description:
      "เกม OX ออนไลน์ เล่นกับ AI บอท มีระบบคะแนนสะสม และ Leaderboard",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#030712",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
