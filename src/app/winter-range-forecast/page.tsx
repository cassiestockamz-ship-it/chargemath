"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import SelectInput from "@/components/SelectInput";
import ResultCard from "@/components/ResultCard";
import CalculatorSchema from "@/components/CalculatorSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSection from "@/components/FAQSection";
import ShareResults from "@/components/ShareResults";
import EducationalContent from "@/components/EducationalContent";
import RelatedCalculators from "@/components/RelatedCalculators";
import Link from "next/link";
import { EV_VEHICLES } from "@/data/ev-vehicles";

/**
 * Same Recurrent-2023 cold-weather curve used in will-i-make-it-home.
 */
function rangeRetentionAtTemp(tempF: number): number {
  const points: [number, number][] = [
    [-20, 0.45],
    [-10, 0.5],
    [0, 0.6],
    [10, 0.68],
    [20, 0.76],
    [30, 0.86],
    [40, 0.92],
    [50, 0.96],
    [60, 0.99],
    [70, 1.0],
    [80, 0.98],
    [90, 0.95],
    [100, 0.92],
  ];
  if (tempF <= points[0][0]) return points[0][1];
  if (tempF >= points[points.length - 1][0])
    return points[points.length - 1][1];
  for (let i = 0; i < points.length - 1; i++) {
    const [t0, r0] = points[i];
    const [t1, r1] = points[i + 1];
    if (tempF >= t0 && tempF <= t1) {
      const frac = (tempF - t0) / (t1 - t0);
      return r0 + frac * (r1 - r0);
    }
  }
  return 1;
}

interface DailyForecast {
  date: string;
  tempMinF: number;
  tempMaxF: number;
  tempAvgF: number;
  retention: number;
  effectiveRangeMi: number;
}

interface LocationResult {
  lat: number;
  lng: number;
  place: string;
}

async function lookupZip(zip: string): Promise<LocationResult | null> {
  try {
    const r = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!r.ok) return null;
    const j = await r.json();
    const place = j.places?.[0];
    if (!place) return null;
    return {
      lat: Number(place.latitude),
      lng: Number(place.longitude),
      place: `${place["place name"]}, ${place["state abbreviation"]}`,
    };
  } catch {
    return null;
  }
}

async function fetchForecast(
  lat: number,
  lng: number
): Promise<{ dates: string[]; tmin: number[]; tmax: number[] } | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_min,temperature_2m_max&temperature_unit=fahrenheit&timezone=auto&forecast_days=7`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const j = await r.json();
    return {
      dates: j.daily?.time ?? [],
      tmin: j.daily?.temperature_2m_min ?? [],
      tmax: j.daily?.temperature_2m_max ?? [],
    };
  } catch {
    return null;
  }
}

const fmt = (n: number, d = 0) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

export default function WinterRangeForecastPage() {
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [zip, setZip] = useState("");
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [daily, setDaily] = useState<DailyForecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vehicle = useMemo(
    () => EV_VEHICLES.find((v) => v.id === vehicleId) ?? EV_VEHICLES[0],
    [vehicleId]
  );

  const vehicleOptions = EV_VEHICLES.map((v) => ({
    value: v.id,
    label: `${v.year} ${v.make} ${v.model}`,
  }));

  const runForecast = useCallback(async () => {
    if (!/^\d{5}$/.test(zip)) {
      setError("Enter a 5-digit US ZIP code");
      return;
    }
    setError(null);
    setLoading(true);
    setDaily([]);
    try {
      const loc = await lookupZip(zip);
      if (!loc) {
        setError("Could not look up that ZIP code");
        setLoading(false);
        return;
      }
      setLocation(loc);
      const f = await fetchForecast(loc.lat, loc.lng);
      if (!f) {
        setError("Could not load weather forecast");
        setLoading(false);
        return;
      }
      const out: DailyForecast[] = f.dates.map((d, i) => {
        const tempAvg = (f.tmin[i] + f.tmax[i]) / 2;
        const retention = rangeRetentionAtTemp(tempAvg);
        return {
          date: d,
          tempMinF: f.tmin[i],
          tempMaxF: f.tmax[i],
          tempAvgF: tempAvg,
          retention,
          effectiveRangeMi: vehicle.epaRangeMiles * retention,
        };
      });
      setDaily(out);
    } catch {
      setError("Unexpected error. Try again.");
    } finally {
      setLoading(false);
    }
  }, [zip, vehicle.epaRangeMiles]);

  // Recompute effective range if vehicle changes after a fetch
  useEffect(() => {
    if (daily.length) {
      setDaily((prev) =>
        prev.map((d) => ({
          ...d,
          effectiveRangeMi: vehicle.epaRangeMiles * d.retention,
        }))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  const worstDay = daily.length
    ? daily.reduce((a, b) => (a.retention < b.retention ? a : b))
    : null;
  const bestDay = daily.length
    ? daily.reduce((a, b) => (a.retention > b.retention ? a : b))
    : null;

  // Chart
  const chartWidth = 600;
  const chartHeight = 180;
  const padding = { left: 40, right: 10, top: 10, bottom: 30 };
  const minRet = Math.min(0.5, ...daily.map((d) => d.retention));
  const maxRet = 1.05;
  function x(i: number) {
    if (!daily.length) return padding.left;
    return (
      padding.left +
      (i / Math.max(1, daily.length - 1)) *
        (chartWidth - padding.left - padding.right)
    );
  }
  function y(ret: number) {
    return (
      padding.top +
      (1 - (ret - minRet) / (maxRet - minRet)) *
        (chartHeight - padding.top - padding.bottom)
    );
  }

  return (
    <CalculatorLayout
      title="Winter Range Forecast"
      description="Live 7-day EV range forecast by ZIP. Enter your car and ZIP, get the next 7 days of expected range in miles, based on real forecast temperatures and published cold-weather retention curves."
      answerBlock={
        <p>
          <strong>Quick answer:</strong> EV range losses follow temperature, not date. A
          typical EV retains about 86% of rated range at 30°F, 76% at 20°F, 60% at 0°F, and
          45% at -20°F vs its 70°F baseline. This tool pulls your actual 7-day forecast
          from Open-Meteo, applies the Recurrent Motors 2023 cold-weather curve, and
          outputs expected daily range in miles. If this week&apos;s worst day shows under
          65% retention, precondition before you leave.
        </p>
      }
      lastUpdated="April 2026"
    >
      <CalculatorSchema
        name="Winter Range Forecast"
        description="Live 7-day EV range forecast by ZIP. Uses Open-Meteo weather data and published cold-weather retention curves. Free."
        url="https://chargemath.com/winter-range-forecast"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          {
            name: "Winter Range Forecast",
            url: "https://chargemath.com/winter-range-forecast",
          },
        ]}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <SelectInput
          label="Your EV"
          value={vehicleId}
          onChange={setVehicleId}
          options={vehicleOptions}
          helpText={`${vehicle.epaRangeMiles} mi EPA rated range`}
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
            ZIP code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{5}"
              maxLength={5}
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => {
                if (e.key === "Enter") runForecast();
              }}
              placeholder="e.g. 55401"
              className="w-32 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={runForecast}
              disabled={loading || !zip}
              className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Loading…" : "Forecast"}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-xs text-rose-600" role="alert">
              {error}
            </p>
          )}
          {location && (
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              Forecast for {location.place}
            </p>
          )}
        </div>
      </div>

      {daily.length > 0 && worstDay && bestDay && (
        <>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <ResultCard
              label="Worst day this week"
              value={`${fmt(worstDay.effectiveRangeMi, 0)}`}
              unit={`mi (${fmt(worstDay.retention * 100, 0)}%)`}
              highlight
              icon="❄️"
            />
            <ResultCard
              label="Best day this week"
              value={`${fmt(bestDay.effectiveRangeMi, 0)}`}
              unit={`mi (${fmt(bestDay.retention * 100, 0)}%)`}
              icon="☀️"
            />
            <ResultCard
              label="Full EPA range"
              value={`${vehicle.epaRangeMiles}`}
              unit="mi"
              icon="📏"
            />
          </div>

          {/* 7-day chart */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-bold text-[var(--color-text)]">
              7-day range forecast
            </h2>
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="h-auto w-full"
              role="img"
              aria-label="7-day range retention chart"
            >
              {/* Grid */}
              {[0.6, 0.75, 0.9, 1].map((r) => (
                <g key={r}>
                  <line
                    x1={padding.left}
                    y1={y(r)}
                    x2={chartWidth - padding.right}
                    y2={y(r)}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 4}
                    y={y(r) + 3}
                    textAnchor="end"
                    fontSize="10"
                    fill="#64748b"
                  >
                    {Math.round(r * 100)}%
                  </text>
                </g>
              ))}
              {/* Line */}
              <path
                d={daily
                  .map(
                    (d, i) =>
                      `${i === 0 ? "M" : "L"}${x(i)},${y(d.retention)}`
                  )
                  .join(" ")}
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="2.5"
              />
              {/* Dots */}
              {daily.map((d, i) => (
                <circle
                  key={d.date}
                  cx={x(i)}
                  cy={y(d.retention)}
                  r="4"
                  fill="#0ea5e9"
                />
              ))}
              {/* Day labels */}
              {daily.map((d, i) => (
                <text
                  key={d.date}
                  x={x(i)}
                  y={chartHeight - padding.bottom + 14}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#64748b"
                >
                  {new Date(d.date).toLocaleDateString("en-US", {
                    weekday: "short",
                  })}
                </text>
              ))}
            </svg>
          </div>

          {/* Day-by-day table */}
          <div className="mt-6 overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface-alt)] text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                <tr>
                  <th className="px-4 py-2 text-left">Day</th>
                  <th className="px-4 py-2 text-right">Low</th>
                  <th className="px-4 py-2 text-right">High</th>
                  <th className="px-4 py-2 text-right">Avg</th>
                  <th className="px-4 py-2 text-right">Range retention</th>
                  <th className="px-4 py-2 text-right">Effective range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {daily.map((d) => (
                  <tr key={d.date}>
                    <td className="px-4 py-2 font-medium">
                      {new Date(d.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-2 text-right text-[var(--color-text-muted)]">
                      {fmt(d.tempMinF, 0)}°
                    </td>
                    <td className="px-4 py-2 text-right text-[var(--color-text-muted)]">
                      {fmt(d.tempMaxF, 0)}°
                    </td>
                    <td className="px-4 py-2 text-right">{fmt(d.tempAvgF, 0)}°</td>
                    <td className="px-4 py-2 text-right">
                      {fmt(d.retention * 100, 0)}%
                    </td>
                    <td className="px-4 py-2 text-right font-semibold text-[var(--color-text)]">
                      {fmt(d.effectiveRangeMi, 0)} mi
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ShareResults
            title={`Winter range forecast: ${worstDay.effectiveRangeMi.toFixed(0)} mi on the worst day`}
            text={`${vehicle.year} ${vehicle.make} ${vehicle.model} in ${location?.place}: worst day this week is ${worstDay.effectiveRangeMi.toFixed(0)} mi (${(worstDay.retention * 100).toFixed(0)}% retention at ${worstDay.tempAvgF.toFixed(0)}°F).`}
            card={{
              headline: `${fmt(worstDay.effectiveRangeMi, 0)} mi`,
              label: `Worst day this week, ${location?.place ?? ""}`,
              sub: `${vehicle.year} ${vehicle.make} ${vehicle.model} · ${fmt(worstDay.retention * 100, 0)}% retention at ${fmt(worstDay.tempAvgF, 0)}°F avg`,
              calc: "winter-range-forecast",
            }}
          />
        </>
      )}

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link
          href="/will-i-make-it-home"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          Will I make it home tonight? →
        </Link>
        <Link
          href="/winter-range"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          Manual winter range calc →
        </Link>
        <Link
          href="/range"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          Normal conditions range →
        </Link>
      </div>

      <EducationalContent>
        <h2>How The Forecast Works</h2>
        <p>
          When you enter a ZIP, the tool does two API calls. First, it asks zippopotam.us
          for the latitude and longitude of that ZIP. Second, it asks Open-Meteo for the
          next 7 days of daily min and max temperatures at that location. Open-Meteo
          aggregates the NOAA GFS, NWS HRRR, and ECMWF models depending on region, so the
          forecast comes from the same data feeds that the National Weather Service uses.
          For each day, the tool averages the daily min and max to get a rough daily mean
          temperature, then applies the Recurrent Motors 2023 cold-weather retention curve
          (10,000+ EVs tracked) to convert that into expected range retention as a
          percentage. Multiply by your EPA rated range and you get the miles column.
        </p>
        <h3>Why Average Temperature Works (Mostly)</h3>
        <p>
          EV range retention is a nonlinear function of temperature, but it&apos;s
          monotonic: colder is always worse, and the slope gets steeper as you approach
          0°F. Averaging the daily min and max is a reasonable approximation for
          commute-scale trips (20-100 miles over a few hours), because most drivers
          don&apos;t spend the whole day driving at the overnight low. For a long dawn
          departure where you&apos;ll drive for three hours before the sun warms things
          up, treat this as optimistic and drop another 5-10% from the estimate.
        </p>
        <h3>What This Does NOT Include</h3>
        <ul>
          <li>
            <strong>Wind chill.</strong> The retention curve is based on ambient
            temperature only. A 20°F day with a 30 mph wind burns noticeably more heat
            than a calm 20°F day. If there&apos;s a wind warning, assume the worst day in
            the table is closer to the displayed number minus one row.
          </li>
          <li>
            <strong>Preconditioning.</strong> If you pre-heat your battery and cabin
            while plugged in at home, you start the day with a warm battery and keep 3-7%
            more of your range, especially at 0-20°F. Use the car&apos;s app to schedule
            this.
          </li>
          <li>
            <strong>Cabin heat load on short trips.</strong> Five-minute school runs pay
            the heat-up cost but never get efficient. Short-trip winter range is always
            worse than what a freeway-only number suggests.
          </li>
          <li>
            <strong>Heat pump advantage.</strong> If your EV has a heat pump (most 2023+
            Teslas, Ioniq 5/6, EV6, Mach-E 2023+, ID.4, etc.), add about 5% back on days
            above 20°F. Below 20°F heat pumps lose most of their advantage.
          </li>
        </ul>
        <h3>Sources</h3>
        <ul>
          <li>Recurrent Motors 2023 cold-weather EV range study (10,000+ EVs)</li>
          <li>Open-Meteo Weather API (ECMWF + NOAA models)</li>
          <li>Zippopotam.us US ZIP → lat/lng</li>
          <li>AAA EV winter range study (2019, 2023 updates)</li>
        </ul>
      </EducationalContent>
      <FAQSection questions={wrfFAQ} />
      <RelatedCalculators currentPath="/winter-range-forecast" />
    </CalculatorLayout>
  );
}

const wrfFAQ = [
  {
    question: "How accurate is this for my specific car?",
    answer:
      "Within about 5-8% for most 2020+ EVs on a dry road with moderate traffic. The retention curve comes from the Recurrent Motors 2023 study tracking 10,000+ real EVs across model years. Some cars (older Nissan Leaf, pre-2020 Bolt) do worse in the cold than the fleet average; some heat-pump-equipped cars above 20°F do slightly better. For commute-range planning, treat the number as a confident estimate and pad 10% if you're close to empty.",
  },
  {
    question: "Does it work for Canada or Mexico?",
    answer:
      "Right now only US ZIPs because the ZIP lookup uses a US-only database. If you'd like Canadian postal code support, that's a planned addition. Open-Meteo already covers Canada fine, the only missing piece is the postal code geocoder.",
  },
  {
    question: "Is the worst-day number always the coldest day?",
    answer:
      "Yes, in this tool. The retention curve is a function of daily average temperature only. In real life, high winds, freezing rain, and unplowed snow can all make a warmer day worse than a colder one. Treat the table as a floor, not a ceiling, and pad another 5-10% on ugly-weather days.",
  },
  {
    question: "What should I do if my worst-day range is below my commute?",
    answer:
      "Three things, in order: 1) precondition before you leave (plug in while battery pre-heats), 2) turn cabin heat down after 15 minutes of driving and use seat heaters, 3) plan a charging stop on the way home if you have none available at your destination. If you're still uncomfortable with the margin, work from home that day. Pre-2023 EVs with resistive heat are particularly vulnerable below 20°F.",
  },
  {
    question: "Can I embed this on my blog or newsletter?",
    answer:
      "An embed endpoint is on the roadmap. For now, you can link to the tool from any post and readers can check their own ZIP in 5 seconds. If you'd like an iframe version for your site, reach out via the contact page.",
  },
];
