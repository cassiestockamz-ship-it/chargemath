"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Reads calculator state from URL search params on mount.
 * Returns a record of param name → value (all strings).
 */
export function readUrlParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const params: Record<string, string> = {};
  new URLSearchParams(window.location.search).forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

/**
 * Returns a function that updates URL search params without navigation.
 * Debounced at 500ms to avoid excessive history entries.
 */
export function useUpdateUrl() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback((params: Record<string, string | number>) => {
    if (typeof window === "undefined") return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const sp = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) {
        if (v !== "" && v !== undefined && v !== null) {
          sp.set(k, String(v));
        }
      }
      const qs = sp.toString();
      const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
      window.history.replaceState(null, "", newUrl);
    }, 500);
  }, []);
}

/**
 * Hook to sync calculator state to URL. Call once in each calculator.
 * - On mount: reads URL params and calls setters
 * - On change: updates URL params
 */
export function useUrlSync(
  params: Record<string, string | number>,
  init: (urlParams: Record<string, string>) => void
) {
  const updateUrl = useUpdateUrl();
  const initialized = useRef(false);

  // Read from URL on mount
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const urlParams = readUrlParams();
      if (Object.keys(urlParams).length > 0) {
        init(urlParams);
      }
    }
  }, [init]);

  // Write to URL on change (skip first render)
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    updateUrl(params);
  }, [params, updateUrl]);
}
