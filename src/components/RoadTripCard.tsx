const TAG = "kawaiiguy0f-cm-20";
// Prices from Keepa (Amazon US, new) on this date. Refresh with the ASINs below.
const PRICES_CHECKED = "October 24, 2026";

// Makers that confirmed Tesla Supercharger access for their CCS1 cars, and what each says
// about the NACS adapter. Source for every row: InsideEVs, "All The Non-Tesla EVs That Can
// Use Tesla Superchargers" (updated March 20, 2026). Only BMW recommends a third-party adapter;
// the others supply or sell their own, and a non-approved adapter can void the warranty.
const SOURCE = "https://insideevs.com/news/735724/non-tesla-ev-tesla-supercharger-access/";
export const SUPERCHARGER_ACCESS: Record<string, { adapter: string; thirdParty?: boolean }> = {
  Ford: { adapter: "Ford ships its own NACS adapter to owners." },
  Chevy: { adapter: "GM sells an official NACS adapter to owners." },
  Cadillac: { adapter: "GM sells an official NACS adapter to owners." },
  Rivian: { adapter: "Rivian ships its own NACS adapter to owners." },
  Hyundai: { adapter: "Hyundai ships its own NACS adapter to eligible owners." },
  Kia: { adapter: "Kia has Supercharger access; use the adapter Kia approves for your car." },
  Honda: { adapter: "Honda has Supercharger access; use the adapter Honda approves for your car." },
  Lucid: { adapter: "Lucid offers its own NACS adapter to Air owners." },
  Porsche: { adapter: "Porsche has Supercharger access; use the adapter Porsche approves for your car." },
  Polestar: { adapter: "Polestar has Supercharger access; use the adapter Polestar approves for your car." },
  VW: { adapter: "Volkswagen sells its own NACS adapter to owners." },
  BMW: { adapter: "BMW recommends the Lectron NACS to CCS adapter.", thirdParty: true },
};

const ADAPTER = {
  asin: "B0FFSKH7BM",
  name: "Lectron Vortex Plus NACS to CCS1 adapter",
  price: 200,
  specs: "UL 2252 certified, 500 A / 1,000 V, DC fast charging only",
};

const CORD = {
  asin: "B0GXKHV9R5",
  name: "WOLFBOX PE40 portable Level 1 and 2 charger",
  price: 300,
  specs: "ETL certified, adjustable 6 to 40 A, NEMA 5-15 and 6-20 adapters, J1772 plug",
};

function Pick({ p, why }: { p: typeof CORD; why: string }) {
  return (
    <li className="flex flex-col rounded-lg border border-[var(--color-border)] p-4">
      <p className="font-semibold text-[var(--color-text)]">{p.name}</p>
      <p className="mt-1 text-lg font-bold text-emerald-700">{`about $${p.price}`}</p>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">{p.specs}</p>
      <p className="mt-2 flex-1 text-sm text-[var(--color-text-muted)]">{why}</p>
      <a
        href={`https://www.amazon.com/dp/${p.asin}?tag=${TAG}`}
        target="_blank"
        rel="sponsored nofollow noopener"
        className="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Check price on Amazon
      </a>
    </li>
  );
}

export default function RoadTripCard({ make, model }: { make: string; model: string }) {
  const access = SUPERCHARGER_ACCESS[make];
  if (!access) return null;
  return (
    <section className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-6">
      <h2 className="text-xl font-bold text-[var(--color-text)]">{`Road trip kit for a ${make} ${model}`}</h2>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        Your car has a CCS1 port, and its maker has opened Tesla Superchargers to it. That adds
        thousands of fast chargers to a trip, but only with a NACS adapter. {access.adapter}{" "}
        {access.thirdParty
          ? "It is listed first below."
          : "Use that one: a third-party adapter the maker has not approved can void your warranty."}{" "}
        A portable cord covers the other gap: a hotel, campground or family home with an ordinary
        outlet and no charger.
      </p>
      <ul className={`mt-4 grid gap-4 ${access.thirdParty ? "md:grid-cols-2" : "md:max-w-md"}`}>
        {access.thirdParty && (
          <Pick p={ADAPTER} why="Plugs into a Tesla Supercharger cable and your car's CCS1 port. Check the Tesla app lists your car before you rely on it." />
        )}
        <Pick p={CORD} why="Charges from a household outlet overnight, or faster from a 240 V NEMA 6-20 outlet with the included adapter, based on published specs." />
      </ul>
      <p className="mt-3 text-xs text-[var(--color-text-muted)]">
        Prices checked {PRICES_CHECKED} and change often. Supercharger access per maker from{" "}
        <a href={SOURCE} target="_blank" rel="noopener" className="underline">InsideEVs (March 2026)</a>; confirm in
        the Tesla app for your model year. As an Amazon Associate, ChargeMath earns from qualifying purchases at no
        extra cost to you.
      </p>
    </section>
  );
}
