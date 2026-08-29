import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import IndiaCursorTrail from "../components/IndiaCursorTrail";
import IndiaMapMotionBg from "../components/IndiaMapMotionBg";
import Providers from "../components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Think India SVNIT | Official Chapter",
  description: "Official Website of Think India SVNIT Chapter - Youth Empowerment, Conclaves, and Innovation",
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/logo.png" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="min-h-full flex flex-col font-sans selection:bg-amber-600 selection:text-white relative">
        <Providers>
          <IndiaMapMotionBg />
          <IndiaCursorTrail />
          <Header />
          <main className="flex-grow flex flex-col">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
