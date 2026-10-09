import type { Metadata } from "next";
import NotFound from "./(site)/not-found";
import "./globals.css";

export const metadata: Metadata = {
  title: "Page Not Found | ChargeMath",
  robots: { index: false, follow: false },
};

// Unmatched URLs: there is no single root layout (the site and the iframe embeds have their own).
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <NotFound />
      </body>
    </html>
  );
}
