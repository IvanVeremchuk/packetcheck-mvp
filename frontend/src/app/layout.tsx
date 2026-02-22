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
  title: "PacketCheck",
  description: "Drag-and-drop log analysis powered by Threat Intel & AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
