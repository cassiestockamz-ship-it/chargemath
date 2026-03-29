"use client";

import { useId } from "react";

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  helpText?: string;
}

export default function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  helpText,
}: NumberInputProps) {
  const id = useId();
  const helpId = helpText ? `${id}-help` : undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          aria-describedby={helpId}
          className={`w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] shadow-sm outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 ${
            unit ? "pr-16" : ""
          }`}
        />
        {unit && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">
            {unit}
          </span>
        )}
      </div>
      {helpText && (
        <p id={helpId} className="mt-1 text-xs text-[var(--color-text-muted)]">{helpText}</p>
      )}
    </div>
  );
}
