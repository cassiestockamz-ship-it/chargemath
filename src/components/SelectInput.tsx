"use client";

import { useId } from "react";

interface SelectInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  helpText?: string;
}

export default function SelectInput({
  label,
  value,
  onChange,
  options,
  helpText,
}: SelectInputProps) {
  const id = useId();
  const helpId = helpText ? `${id}-help` : undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={helpId}
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] shadow-sm outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helpText && (
        <p id={helpId} className="mt-1 text-xs text-[var(--color-text-muted)]">{helpText}</p>
      )}
    </div>
  );
}
