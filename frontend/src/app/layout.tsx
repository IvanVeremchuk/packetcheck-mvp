import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import PostHogClientProvider from "@/providers/PostHogProvider";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://packetcheck.net"),
  title: "PacketCheck: is anyone else on your computer?",
  description:
    "A free 30-second, read-only scan for Remote Desktop, remote-control apps and backdoors. Paste your report or netstat output for an instant check.",
  openGraph: {
    siteName: "PacketCheck",
    type: "website",
    title: "Is anyone else on your computer?",
    description: "A 30-second, read-only check for remote access. Free, and nothing is uploaded.",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="" />
        <link href="https://api.fontshare.com/v2/css?f[]=switzer@400,500&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider>
          <Suspense fallback={null}>
            <PostHogClientProvider>{children}</PostHogClientProvider>
          </Suspense>
        </ClerkProvider>
      </body>
    </html>
  );
}
