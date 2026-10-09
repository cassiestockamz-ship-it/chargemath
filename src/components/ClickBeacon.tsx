"use client";

import { useEffect } from "react";

const MERCHANT = /(^|\.)(amazon\.[a-z.]+|amzn\.(to|com)|walmart\.com|bestbuy\.com|ebay\.com)$/;

// Records outbound merchant clicks. Never prevents or delays navigation.
export default function ClickBeacon() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      try {
        if (localStorage.getItem("_no_track") === "1") return;
        const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
        if (!a || !MERCHANT.test(a.hostname)) return;
        const body = JSON.stringify({
          href: a.href,
          path: location.pathname,
          sid: sessionStorage.getItem("_sid"),
          ref: document.referrer,
        });
        if (!navigator.sendBeacon?.("/api/click", new Blob([body], { type: "text/plain" }))) {
          fetch("/api/click", { method: "POST", body, keepalive: true }).catch(() => {});
        }
      } catch {}
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("auxclick", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("auxclick", onClick, true);
    };
  }, []);
  return null;
}
