"use client";

import { useState } from "react";

interface ShareResultsProps {
  title: string;
  text: string;
  url?: string;
}

export default function ShareResults({ title, text, url }: ShareResultsProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
      } catch {
        // User cancelled or not supported
      }
    } else {
      handleCopy();
    }
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

  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text)] shadow-sm transition-colors hover:bg-[var(--color-surface-alt)]"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 8V14H12V8" />
          <path d="M8 2V10" />
          <path d="M5 5L8 2L11 5" />
        </svg>
        {copied ? "Copied!" : "Share Results"}
      </button>
    </div>
  );
}
