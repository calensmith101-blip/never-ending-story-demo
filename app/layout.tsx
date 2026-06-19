import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  title: "Tale Sparks",
  description: "Personalised AI bedtime stories for children",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Tale Sparks",
  },
  icons: {
    icon: "/icon_512x512.png",
    apple: "/icon_512x512.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0f172a" />
        <meta name="google-site-verification" content="8gZBqI3bSjcoBQZPG15WkgVbeTBjJ3WW2YMIVURS8l0" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon_512x512.png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
