import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/Toast";
import { ErrorBoundary } from "@/components";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rickandmorty-favorites.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Rick & Morty Favorites",
    template: "%s | Rick & Morty Favorites",
  },
  description: "Explore and save your favorite Rick & Morty characters",
  keywords: ["Rick and Morty", "characters", "favorites", "Rick & Morty"],
  authors: [{ name: "Rick & Morty Favorites" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Rick & Morty Favorites",
    title: "Rick & Morty Favorites",
    description: "Explore and save your favorite Rick & Morty characters",
    url: APP_URL,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Rick & Morty Favorites",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rick & Morty Favorites",
    description: "Explore and save your favorite Rick & Morty characters",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
