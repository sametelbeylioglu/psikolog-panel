import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import DynamicHead from "@/components/dynamic-head";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sametelbeylioglu.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Uzman Psikolog - Psikolojik Danışmanlık",
    template: "%s | Psikolojik Danışmanlık",
  },
  description: "Bireysel terapi, çift terapisi, aile danışmanlığı ve travma terapisi. Uzman psikolog ile güvenli ve destekleyici ortamda profesyonel psikolojik danışmanlık.",
  keywords: ["psikolog", "psikolojik danışmanlık", "terapi", "bireysel terapi", "çift terapisi", "aile danışmanlığı", "travma terapisi", "EMDR", "bilişsel davranışçı terapi", "online terapi", "İstanbul psikolog"],
  authors: [{ name: "PsikoPanel" }],
  creator: "PsikoPanel",
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }] },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Psikolojik Danışmanlık",
    title: "Uzman Psikolog - Psikolojik Danışmanlık",
    description: "Bireysel terapi, çift terapisi, aile danışmanlığı ve travma terapisi. Uzman psikolog ile profesyonel psikolojik danışmanlık.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Uzman Psikolog - Psikolojik Danışmanlık",
    description: "Bireysel terapi, çift terapisi, aile danışmanlığı ve travma terapisi hizmetleri.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  verification: { google: "VhL1fsrYXcTgnk4Lx0MVNWwsdcKfxAlIZI_vf13SVNk" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="google-site-verification" content="VhL1fsrYXcTgnk4Lx0MVNWwsdcKfxAlIZI_vf13SVNk" />
        <link rel="canonical" href={siteUrl} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}><DynamicHead />{children}</body>
    </html>
  );
}
