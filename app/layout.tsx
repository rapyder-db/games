import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Toaster } from "sonner";

import "@/app/globals.css";

import { SiteHeader } from "@/components/site-header";

const fontSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Rapyder Quiz + Live Leaderboard",
  description: "A Cloud-powered quiz game with live leaderboard updates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontSans.variable}`}>
      <body className="font-sans text-chalk bg-ink antialiased">
        <div className="fixed inset-0 z-[-2] bg-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(252,48,48,0.2),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,176,0,0.14),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.78)),#000]" />
          <div className="arcade-background-grid absolute inset-0 opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/80" />
        </div>
        
        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <SiteHeader />
          <main className="flex-1">{children}</main>
        </div>
        
        <Toaster richColors position="top-right" theme="dark" />
      </body>
    </html>
  );
}
