interface Step {
  name: string;
  text: string;
}

interface Props {
  name: string;
  description: string;
  url: string;
  /** ISO 8601 duration, e.g. "PT2M" for 2 minutes */
  totalTime?: string;
  steps: Step[];
}

/**
 * Emits HowTo JSON-LD for step-by-step calculator flows so Google can
 * show rich result steps in the desktop SERP. Keeps the shape minimal
 * and ignores the optional "supply" / "tool" fields since our flows
 * are purely digital.
 */
export default function HowToSchema({
  name,
  description,
  url,
  totalTime = "PT2M",
  steps,
}: Props) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    url,
    totalTime,
    estimatedCost: {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: "0",
    },
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      url: `${url}#step-${i + 1}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
