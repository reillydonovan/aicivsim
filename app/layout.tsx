import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://aicivsim.com"),
  title: "AI Civilization Simulator — Strategy for a Sustainable Future",
  description:
    "Use AI to simulate, measure, and navigate civilization-scale challenges. Six interconnected dashboards model climate, governance, workforce, strategy, and 50-year branching futures.",
  openGraph: {
    type: "website",
    siteName: "AI Civilization Simulator",
    title: "AI Civilization Simulator — Strategy for a Sustainable Future",
    description:
      "Use AI to simulate, measure, and navigate civilization-scale challenges across climate, governance, workforce, and 50-year branching futures.",
    images: ["/images/blog/hero.webp"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Civilization Simulator",
    description:
      "Simulate, measure, and navigate civilization-scale challenges across 50 years of branching futures.",
    images: ["/images/blog/hero.webp"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
