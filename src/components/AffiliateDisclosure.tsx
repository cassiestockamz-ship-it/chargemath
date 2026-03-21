import Link from "next/link";

export default function AffiliateDisclosure() {
  return (
    <p className="mt-6 text-center text-xs text-[var(--color-text-muted)]">
      Affiliate disclosure: We may earn a commission from links on this page.{" "}
      <Link
        href="/disclosure"
        className="underline hover:text-[var(--color-text)] transition-colors"
      >
        Learn more
      </Link>
      .
    </p>
  );
}
