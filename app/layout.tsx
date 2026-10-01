import type { Metadata } from "next";
import { Fraunces, Geist_Mono } from "next/font/google";
import "./globals.css";

// Mono for catalog data and UI, serif for personal notes and titles.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Each page adds its own name: "Add a piece · Closet.zip".
  title: { default: "Closet.zip", template: "%s · Closet.zip" },
  description: "A quiet archive of the clothes you own and have owned.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-ink font-mono text-meta">
        {children}
      </body>
    </html>
  );
}
