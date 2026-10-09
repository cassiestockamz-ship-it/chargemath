import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], display: "swap", weight: ["500", "700"], variable: "--font-space-grotesk" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], display: "swap", weight: ["500", "700"], variable: "--font-jetbrains" });

// Chrome-free root layout for iframes: no header, footer, AdSense loader or tracking pixel.
export const metadata: Metadata = {
  metadataBase: new URL("https://chargemath.com"),
  title: "ChargeMath calculator",
  robots: { index: false, follow: false },
};

export default function EmbedRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-[var(--color-bg)]">{children}</body>
    </html>
  );
}
