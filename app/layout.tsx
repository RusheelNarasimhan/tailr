import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://tailr.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tailr — AI Resume Tailor for Job Applications",
    template: "%s · Tailr",
  },
  description:
    "Generate three ATS-optimized resume variants tailored to any job posting. Export professional LaTeX and Word documents with match scores and keyword alignment.",
  keywords: [
    "resume tailor",
    "ATS resume",
    "AI resume",
    "job application",
    "LaTeX resume",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Tailr",
    title: "Tailr — AI Resume Tailor",
    description:
      "Three tailored resume variants per job — LaTeX, Word, match score, and ATS keywords.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tailr — AI Resume Tailor",
    description:
      "Tailor your resume to any job description in seconds.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
