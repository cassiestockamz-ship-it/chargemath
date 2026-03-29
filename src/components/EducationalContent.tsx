import { ReactNode } from "react";

interface EducationalContentProps {
  children: ReactNode;
}

export default function EducationalContent({ children }: EducationalContentProps) {
  return (
    <div className="mt-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
      <div className="prose prose-sm max-w-none text-[var(--color-text-muted)] [&_h2]:mt-0 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-[var(--color-text)] [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-[var(--color-text)] [&_p]:mb-3 [&_p]:leading-relaxed [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1">
        {children}
      </div>
    </div>
  );
}
