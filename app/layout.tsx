import type { Metadata, Viewport } from "next";
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

// viewportFit: 'cover' lets page content paint under the iPhone dynamic
// island / notch and the bottom home-indicator area, rather than the
// browser reserving that space with its own background color. Without
// this, any full-bleed background (like CardView's gradient) hits a hard
// edge at the safe-area boundary instead of extending to the true edges.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F5F5FC",
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