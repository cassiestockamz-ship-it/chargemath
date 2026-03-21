export default function DisclosurePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-text)] sm:text-4xl">
        Affiliate Disclosure
      </h1>

      <div className="mt-8 space-y-6 text-[var(--color-text-muted)] leading-relaxed">
        <p>
          ChargeMath is reader-supported. When you buy through links on our
          site, we may earn an affiliate commission at no extra cost to you. This
          helps us keep our calculators free and our data up to date.
        </p>

        <h2 className="text-xl font-bold text-[var(--color-text)]">
          Amazon Associates Program
        </h2>
        <p>
          ChargeMath is a participant in the Amazon Services LLC Associates
          Program, an affiliate advertising program designed to provide a means
          for sites to earn advertising fees by advertising and linking to
          Amazon.com. As an Amazon Associate, we earn from qualifying purchases.
        </p>

        <h2 className="text-xl font-bold text-[var(--color-text)]">
          Editorial Independence
        </h2>
        <p>
          Our calculator results are never influenced by affiliate
          relationships. The calculations you see are based entirely on EPA
          vehicle data, EIA electricity rates, and the inputs you provide.
          Affiliate partnerships do not affect the numbers.
        </p>

        <h2 className="text-xl font-bold text-[var(--color-text)]">
          Product Recommendations
        </h2>
        <p>
          We only recommend products that are relevant to the calculator results
          and genuinely useful for EV owners. When we link to a product, it is
          because we believe it adds value to the information our calculators
          provide.
        </p>

        <p className="text-sm">
          If you have any questions about this disclosure, feel free to contact
          us.
        </p>
      </div>
    </div>
  );
}
