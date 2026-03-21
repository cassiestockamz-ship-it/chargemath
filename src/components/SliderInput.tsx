"use client";

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
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-[var(--color-text)]">
          {label}
        </label>
        {showValue && (
          <span className="text-sm font-semibold text-[var(--color-primary)]">
            {value}
            {unit ? ` ${unit}` : ""}
          </span>
        )}
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
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
