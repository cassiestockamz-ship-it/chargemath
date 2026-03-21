"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQSection({ questions }: { questions: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };

  return (
    <div className="mt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
        Frequently Asked Questions
      </h2>
      <div className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)]">
        {questions.map((q, i) => (
          <div key={i}>
            <button
              onClick={() => toggle(i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[var(--color-surface-alt)]"
              aria-expanded={openIndex === i}
            >
              <span className="text-sm font-semibold text-[var(--color-text)]">
                {q.question}
              </span>
              <span className="flex-shrink-0 text-lg font-medium text-[var(--color-text-muted)]">
                {openIndex === i ? "\u2212" : "+"}
              </span>
            </button>
            {openIndex === i && (
              <div className="px-5 pb-4">
                <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
                  {q.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
