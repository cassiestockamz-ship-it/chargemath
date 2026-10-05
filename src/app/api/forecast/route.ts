import { NextRequest, NextResponse } from "next/server";

// 7-day daily min/max (F) from the National Weather Service (api.weather.gov).
// Server-side so we can send the User-Agent NWS asks for. US locations only.
const UA = "ChargeMath (https://chargemath.com)";
const HEADERS = { "User-Agent": UA, Accept: "application/geo+json" };

interface Period {
  startTime: string;
  isDaytime: boolean;
  temperature: number;
  temperatureUnit: string;
}

export async function GET(req: NextRequest) {
  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lng = Number(req.nextUrl.searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: "bad coordinates" }, { status: 400 });
  }
  try {
    const p = await fetch(`https://api.weather.gov/points/${lat.toFixed(4)},${lng.toFixed(4)}`, {
      headers: HEADERS,
      next: { revalidate: 3600 },
    });
    if (!p.ok) return NextResponse.json({ error: "no forecast for this location" }, { status: 404 });
    const forecastUrl: string | undefined = (await p.json())?.properties?.forecast;
    if (!forecastUrl) return NextResponse.json({ error: "no forecast for this location" }, { status: 404 });
    const f = await fetch(forecastUrl, { headers: HEADERS, next: { revalidate: 1800 } });
    if (!f.ok) return NextResponse.json({ error: "forecast unavailable" }, { status: 502 });
    const periods: Period[] = (await f.json())?.properties?.periods ?? [];

    // Group 12-hour periods by local calendar date (the offset in startTime).
    const byDate = new Map<string, number[]>();
    for (const per of periods) {
      const t = per.temperatureUnit === "C" ? per.temperature * 1.8 + 32 : per.temperature;
      const date = per.startTime.slice(0, 10);
      byDate.set(date, [...(byDate.get(date) ?? []), t]);
    }
    const dates: string[] = [];
    const tmin: number[] = [];
    const tmax: number[] = [];
    for (const [d, temps] of byDate) {
      // A day with a single period (today after sunset) has no real min/max spread; keep it, both equal.
      dates.push(d);
      tmin.push(Math.min(...temps));
      tmax.push(Math.max(...temps));
    }
    return NextResponse.json({ dates, tmin, tmax });
  } catch {
    return NextResponse.json({ error: "forecast unavailable" }, { status: 502 });
  }
}
