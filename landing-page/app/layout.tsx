import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "PaxBnb - AI-Powered Property Rental Platform",
  description: "Experience the future of travel booking with PaxBnb's AI assistant. Find and book your perfect stay through natural conversation.",
  keywords: "PaxBnb, AI travel booking, property rental, vacation rental, AI assistant, smart booking",
  authors: [{ name: "PaxBnb Team" }],
  openGraph: {
    title: "PaxBnb - AI-Powered Property Rental Platform",
    description: "Experience the future of travel booking with PaxBnb's AI assistant",
    type: "website",
  },
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
        {children}
      </body>
    </html>
  );
}
