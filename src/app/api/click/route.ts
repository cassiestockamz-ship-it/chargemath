import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const SITE_ID = "4f06f8f8-19b6-4d60-9e14-8b539e38bb4a";
const BOT_UA =
  /bot|crawl|spider|slurp|headless|lighthouse|preview|fetch|curl|wget|python|axios|node-fetch|go-http|java\/|scrapy|phantom|selenium|puppeteer|playwright/i;

const MERCHANTS: [RegExp, string][] = [
  [/(^|\.)amazon\.[a-z.]+$|(^|\.)amzn\.(to|com)$/, "amazon"],
  [/(^|\.)walmart\.com$/, "walmart"],
  [/(^|\.)bestbuy\.com$/, "bestbuy"],
  [/(^|\.)ebay\.com$/, "ebay"],
];

export async function POST(request: NextRequest) {
  const ua = request.headers.get("user-agent") || "";
  if (!ua || BOT_UA.test(ua)) return new NextResponse(null, { status: 204 });

  let body: { href?: string; path?: string; sid?: string; ref?: string };
  try {
    body = JSON.parse(await request.text());
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  let url: URL;
  try {
    url = new URL(String(body.href || ""));
  } catch {
    return new NextResponse(null, { status: 204 });
  }
  const merchant = MERCHANTS.find(([re]) => re.test(url.hostname))?.[1];
  if (!merchant) return new NextResponse(null, { status: 204 });

  const asin = url.pathname.match(/\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})/i)?.[1]?.toUpperCase() || null;
  const row = {
    site_id: SITE_ID,
    path: String(body.path || "").slice(0, 300),
    merchant,
    asin,
    tag: url.searchParams.get("tag"),
    session_id: body.sid ? String(body.sid).slice(0, 64) : null,
    // How the visitor reached the page (document.referrer), not the page itself.
    referrer: body.ref ? String(body.ref).slice(0, 300) : null,
    user_agent: ua.slice(0, 300),
    // Set by Vercel's edge from the client IP; the browser cannot supply it.
    country: request.headers.get("x-vercel-ip-country")?.slice(0, 2) || null,
  };
  // Public anon key, same as /api/subscribe; the table allows insert only.
  const key = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlveXBzb2p1ZWR3eXp5bWJzdWJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NjE3MjQsImV4cCI6MjA4NzAzNzcyNH0.tnAlDR4MHllLjrbv49xWbOEf_QNMjAFtk1vjXIa91fs";

  await fetch("https://yoypsojuedwyzymbsubu.supabase.co/rest/v1/affiliate_clicks", {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  }).catch(() => null);

  return new NextResponse(null, { status: 204 });
}
