"use client";

import { useState } from "react";

interface ShareResultsProps {
  title: string;
  text: string;
  url?: string;
  /** Optional result card spec. If provided, a "Download image" button appears. */
  card?: {
    headline: string;
    label: string;
    sub?: string;
    calc: string;
  };
}

export default function ShareResults({
  title,
  text,
  url,
  card,
}: ShareResultsProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const shareUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");

  const cardUrl = card
    ? `/api/og-result?headline=${encodeURIComponent(
        card.headline
      )}&label=${encodeURIComponent(card.label)}&sub=${encodeURIComponent(
        card.sub ?? ""
      )}&calc=${encodeURIComponent(card.calc)}`
    : null;

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch {
        // User cancelled or not supported
      }
    }
    handleCopy();
  };

  const handleCopy = async () => {
    const shareText = `${title}\n${text}\n\nCalculated on ChargeMath: ${shareUrl}`;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  };

  const handleDownloadImage = async () => {
    if (!cardUrl) return;
    setDownloading(true);
    try {
      const res = await fetch(cardUrl);
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `chargemath-${card?.calc ?? "result"}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch {
      // silent fail
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="mt-6 flex flex-wrap items-center justify-center gap-3"
      data-share-results
    >
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text)] shadow-sm transition-colors hover:bg-[var(--color-surface-alt)]"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 8V14H12V8" />
          <path d="M8 2V10" />
          <path d="M5 5L8 2L11 5" />
        </svg>
        {copied ? "Copied!" : "Share Results"}
      </button>

      {cardUrl && (
        <button
          onClick={handleDownloadImage}
          disabled={downloading}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text)] shadow-sm transition-colors hover:bg-[var(--color-surface-alt)] disabled:opacity-60"
          title="Download a shareable PNG card of your result"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="12" height="12" rx="2" />
            <circle cx="6" cy="6" r="1.2" />
            <path d="M14 11L11 8L6 13" />
          </svg>
          {downloading ? "Building…" : "Download image"}
        </button>
      )}
    </div>
  );
}
