import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import DynamicHead from "@/components/dynamic-head";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "PsikoPanel - Profesyonel Psikolojik Danışmanlık",
    template: "%s | PsikoPanel",
  },
  description: "Bireysel terapi, çift terapisi, aile danışmanlığı ve travma terapisi hizmetleri. Uzman psikolog ile güvenli ve destekleyici bir ortamda profesyonel psikolojik danışmanlık.",
  keywords: ["psikolog", "psikolojik danışmanlık", "terapi", "bireysel terapi", "çift terapisi", "aile danışmanlığı", "travma terapisi", "EMDR", "bilişsel davranışçı terapi", "online terapi", "İstanbul psikolog"],
  authors: [{ name: "PsikoPanel" }],
  creator: "PsikoPanel",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "PsikoPanel",
    title: "PsikoPanel - Profesyonel Psikolojik Danışmanlık",
    description: "Bireysel terapi, çift terapisi, aile danışmanlığı ve travma terapisi hizmetleri. Uzman psikolog ile profesyonel psikolojik danışmanlık.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PsikoPanel - Profesyonel Psikolojik Danışmanlık",
    description: "Bireysel terapi, çift terapisi, aile danışmanlığı ve travma terapisi hizmetleri.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  verification: {},
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f172a" />
        <link rel="canonical" href="https://www.psikopanel.com" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}><DynamicHead />{children}</body>
    </html>
  );
}
