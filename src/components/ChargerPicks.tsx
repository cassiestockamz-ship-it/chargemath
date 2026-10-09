const TAG = "kawaiiguy0f-cm-20";
// Prices from Keepa (Amazon US, new) on this date. Refresh with the ASINs below.
const PRICES_CHECKED = "October 8, 2026";

const CHARGERS = [
  {
    asin: "B082LMVSLY",
    name: "Grizzl-E Classic",
    price: 300,
    specs: "40 A, 9.6 kW, NEMA 14-50 plug-in, 24 ft cable",
    fit: "The lowest-cost way to get full Level 2 speed. No app or Wi-Fi, so scheduling is done in the car.",
  },
  {
    asin: "B0CRDMXXL7",
    name: "Autel MaxiCharger 40A",
    price: 470,
    specs: "40 A, 9.6 kW, NEMA 14-50 plug-in, app scheduling, 25 ft cable",
    fit: "App scheduling lets you charge only in off-peak hours, which is where time-of-use savings come from.",
  },
  {
    asin: "B0D9MQ415Y",
    name: "Emporia Pro 48A",
    price: 599,
    specs: "48 A, 11.5 kW hardwired, app scheduling, load management (PowerSmart)",
    fit: "Load management can let it share a full panel, which may avoid a $1,000 to $3,000 panel upgrade.",
  },
];

export default function ChargerPicks({ context }: { context: "roi" | "payback" }) {
  return (
    <section className="my-8 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
      <h2 className="text-xl font-bold text-slate-900">Home Level 2 chargers at three price points</h2>
      <p className="mt-2 text-sm text-slate-600">
        {context === "roi"
          ? "The charger price is the first number in your payback. These three cover the common choices, based on published specs and owner reviews."
          : "Charging at home is what makes an EV's fuel savings real. These three Level 2 chargers cover the common choices, based on published specs and owner reviews."}
      </p>
      <ul className="mt-4 grid gap-4 md:grid-cols-3">
        {CHARGERS.map((c) => (
          <li key={c.asin} className="flex flex-col rounded-lg border border-slate-200 p-4">
            <p className="font-semibold text-slate-900">{c.name}</p>
            <p className="mt-1 text-lg font-bold text-emerald-700">about ${c.price}</p>
            <p className="mt-1 text-sm text-slate-700">{c.specs}</p>
            <p className="mt-2 flex-1 text-sm text-slate-600">{c.fit}</p>
            <a
              href={`https://www.amazon.com/dp/${c.asin}?tag=${TAG}`}
              target="_blank"
              rel="sponsored nofollow noopener"
              className="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Check price on Amazon
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-slate-500">
        Prices checked {PRICES_CHECKED} and change often. As an Amazon Associate, ChargeMath earns from qualifying purchases at no extra cost to you. Installation by a licensed electrician is extra.
      </p>
    </section>
  );
}
