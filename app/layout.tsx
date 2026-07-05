import type { Metadata } from "next";
import { Caveat, Geist, Geist_Mono } from "next/font/google";
import { EB_Garamond } from "next/font/google";
import { DM_Sans } from "next/font/google"; 
import localFont from 'next/font/local'
import { Nav } from '@/components/PostCard/Shared'
import "./globals.css";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
})

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  style:["normal", "italic"],
})

const caveatScript = Caveat({
  variable: "--font-script-caveat",
  subsets:['latin'],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appleFont = localFont({
  src: '../public/AppleFont.ttf',
  variable: '--font-apple',
})

export const metadata: Metadata = {
  title: "immi",
  description: "immi is here.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${caveatScript.variable} ${dmSans.variable} ${ebGaramond.variable} ${appleFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Nav />
        {children}
      </body>
    </html>
  );
}