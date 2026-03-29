import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tailr — AI Resume Tailor",
  description: "Tailor your resume to any job description in seconds using AI",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-[#f0ede6]">
        {children}
      </body>
    </html>
  );
}