import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VenuLynx - Smart Campus Venue Management System",
  description: "A smart venue management system for modern campuses.",
  keywords: ["VenuLynx", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "AI development", "React"],
  authors: [{ name: "Team Mango" }],
  icons: {
    icon: "http://localhost:3000/favicon.ico",
  },
  openGraph: {
    title: "VenuLynx - Smart Campus Venue Management System",
    description: "A smart venue management system for modern campuses.",
    url: "https://venulynx.com",
    siteName: "VenuLynx",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VenuLynx - Smart Campus Venue Management System",
    description: "A smart venue management system for modern campuses.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
