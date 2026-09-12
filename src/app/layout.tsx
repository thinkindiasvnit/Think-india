import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import IndiaCursorTrail from "../components/IndiaCursorTrail";
import IndiaMapMotionBg from "../components/IndiaMapMotionBg";
import { AuthProvider } from "../components/AuthProvider";
import StructuredData from "../components/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://thinkindiasvnit.org'),
  title: {
    default: "Think India SVNIT | Youth Empowerment & Leadership Forum",
    template: "%s | Think India SVNIT"
  },
  description: "Think India SVNIT is a student-driven forum promoting nationalistic spirit, civic engagement, and leadership through conclaves, social initiatives, and community service in Gujarat.",
  keywords: [
    "Think India",
    "SVNIT",
    "Sardar Vallabhbhai National Institute of Technology",
    "student forum",
    "youth empowerment",
    "leadership",
    "conclaves",
    "nation building",
    "civic engagement",
    "Gujarat",
    "Surat",
    "social initiatives",
    "student activities",
    "nationalism",
    "community service"
  ],
  authors: [{ name: "Think India SVNIT Team" }],
  creator: "Think India SVNIT",
  publisher: "Think India SVNIT",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://thinkindiasvnit.org",
    siteName: "Think India SVNIT",
    title: "Think India SVNIT | Youth Empowerment & Leadership Forum",
    description: "Student-driven forum promoting nationalistic spirit, leadership, and civic engagement through conclaves, social initiatives, and community service.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Think India SVNIT Logo"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    site: "@thinkindiaorg",
    creator: "@thinkindiaorg",
    title: "Think India SVNIT | Youth Empowerment & Leadership Forum",
    description: "Student-driven forum promoting nationalistic spirit, leadership, and civic engagement.",
    images: ["/logo.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  verification: {
    google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // yahoo: "your-yahoo-verification-code",
  },
  alternates: {
    canonical: "https://thinkindiasvnit.org",
  },
  category: "education",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/logo.png" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="theme-color" content="#d97706" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <StructuredData />
      </head>
      <body className="min-h-full flex flex-col font-sans selection:bg-amber-600 selection:text-white relative">
        <AuthProvider>
          <IndiaMapMotionBg />
          <IndiaCursorTrail />
          <Header />
          <main className="flex-grow flex flex-col">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
