import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Script from "next/script";

export const metadata: Metadata = {
  title: "UProspectKit | AI-Powered Upwork Proposal Generator",
  description: "Generate high-converting, personlized Upwork proposals in seconds using AI. Get more replies and land more jobs.",
  keywords: ["Upwork", "Proposal", "Freelancer", "AI", "Generator", "UProspectKit"],
  authors: [{ name: "UProspectKit Team" }],
  openGraph: {
    title: "UProspectKit | AI Upwork Proposal Tool",
    description: "Write proposals that win jobs. Fast, intelligent, and human-sounding.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UProspectKit | AI Upwork Proposal Tool",
    description: "Write proposals that win jobs. Fast, intelligent, and human-sounding.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://cdn.paddle.com/paddle/v2/paddle.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


