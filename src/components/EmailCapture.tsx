"use client";

import { useState } from "react";

interface EmailCaptureProps {
  source?: string;
}

export default function EmailCapture({ source }: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="mt-10 rounded-xl border border-[var(--color-ev-green)]/30 bg-[var(--color-ev-green)]/5 p-6 text-center">
        <p className="text-sm font-semibold text-[var(--color-ev-green)]">
          You&apos;re in! We&apos;ll send you EV savings tips and calculator updates.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 p-6">
      <div className="text-center">
        <h3 className="text-base font-bold text-[var(--color-text)]">
          Get EV Savings Tips
        </h3>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Free updates on electricity rates, new calculators, and ways to save on EV ownership. No spam.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2 sm:mx-auto sm:max-w-md">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          aria-label="Email address"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="whitespace-nowrap rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
        >
          {status === "loading" ? "..." : "Subscribe"}
        </button>
      </form>
      {status === "error" && (
        <p className="mt-2 text-center text-xs text-[var(--color-gas-red)]">
          Something went wrong. Try again.
        </p>
      )}
      <p className="mt-2 text-center text-[10px] text-[var(--color-text-muted)]">
        Unsubscribe anytime. We respect your privacy.
      </p>
    </div>
  );
}
