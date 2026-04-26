import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL("https://uprospectkit.vercel.app"), // Replace with your actual domain
  title: {
    default: "UProspectKit | AI-Powered Upwork Proposal Generator",
    template: "%s | UProspectKit",
  },
  description:
    "Generate high-converting, personalized Upwork proposals in seconds using advanced AI. Land more jobs, save time, and stand out from the competition with UProspectKit.",
  keywords: [
    "Upwork Proposal Generator",
    "AI Proposal Writer",
    "Freelance Tools",
    "Upwork Automation",
    "Job Winning Proposals",
    "Freelancer AI",
    "UProspectKit",
  ],
  authors: [{ name: "UProspectKit Team", url: "https://uprospectkit.vercel.app" }],
  creator: "UProspectKit",
  publisher: "UProspectKit",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "UProspectKit | Win More Upwork Jobs with AI",
    description:
      "Write proposals that win jobs. Fast, intelligent, and human-sounding. The ultimate tool for freelancers on Upwork.",
    url: "https://uprospectkit.vercel.app",
    siteName: "UProspectKit",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UProspectKit | AI Upwork Proposal Tool",
    description: "Generate high-converting Upwork proposals in seconds. Land more jobs with AI.",
    creator: "@uprospectkit",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "UProspectKit",
              "operatingSystem": "Web",
              "applicationCategory": "BusinessApplication",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "description": "AI-Powered Upwork Proposal Generator. Generate high-converting proposals in seconds.",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "150"
              }
            }),
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


