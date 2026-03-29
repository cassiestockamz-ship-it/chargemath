"use client";

import { useId, useTransition } from "react";

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  showValue?: boolean;
}

export default function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  showValue = true,
}: SliderInputProps) {
  const id = useId();
  const [, startTransition] = useTransition();
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-[var(--color-text)]">
          {label}
        </label>
        {showValue && (
          <span className="text-sm font-semibold text-[var(--color-primary)]" aria-live="polite">
            {value}
            {unit ? ` ${unit}` : ""}
          </span>
        )}
      </div>
      <input
        id={id}
        type="range"
        value={value}
        onChange={(e) => {
          const val = Number(e.target.value);
          startTransition(() => onChange(val));
        }}
        min={min}
        max={max}
        step={step}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${value}${unit ? ` ${unit}` : ""}`}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--color-surface-alt)] accent-[var(--color-primary)] outline-none"
      />
      <div className="mt-1 flex justify-between text-xs text-[var(--color-text-muted)]">
        <span>
          {min}
          {unit ? ` ${unit}` : ""}
        </span>
        <span>
          {max}
          {unit ? ` ${unit}` : ""}
        </span>
      </div>
    </div>
  );
}
