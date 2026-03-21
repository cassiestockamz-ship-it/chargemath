import { NextRequest, NextResponse } from "next/server";

const PATH_LABELS: Record<string, string> = {
  "/": "Homepage",
  "/ev-charging-cost": "Charging Cost",
  "/gas-vs-electric": "Gas vs Electric",
  "/charging-time": "Charging Time",
  "/charger-roi": "Charger ROI",
  "/range": "Range Calculator",
  "/tax-credits": "Tax Credits",
  "/bill-impact": "Bill Impact",
};

function pathToLabel(path: string): string {
  return PATH_LABELS[path] || path;
}

function urlToPath(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname.replace(/\/$/, "") || "/";
  } catch {
    return url;
  }
}

async function getAccessToken(): Promise<string> {
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error("Missing Google OAuth credentials in environment variables");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function GET(request: NextRequest) {
  const site = request.nextUrl.searchParams.get("site") || "chargemath.com";
  const siteUrl = `sc-domain:${site}`;

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 28);

  const fmt = (d: Date) => d.toISOString().split("T")[0];

  try {
    const accessToken = await getAccessToken();

    const gscRes = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: fmt(startDate),
          endDate: fmt(endDate),
          dimensions: ["page"],
          rowLimit: 100,
        }),
      }
    );

    if (!gscRes.ok) {
      const text = await gscRes.text();
      console.error(`GSC API error: ${gscRes.status} ${text}`);
      return NextResponse.json(buildEmptyResponse(site));
    }

    const gscData = await gscRes.json();

    if (!gscData.rows || gscData.rows.length === 0) {
      return NextResponse.json(buildEmptyResponse(site));
    }

    const pages = gscData.rows.map(
      (row: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }) => {
        const fullUrl = row.keys[0];
        const path = urlToPath(fullUrl);
        return {
          page: fullUrl,
          path,
          label: pathToLabel(path),
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: Number((row.ctr * 100).toFixed(2)),
          position: Number(row.position.toFixed(1)),
        };
      }
    );

    // Sort by clicks descending
    pages.sort((a: { clicks: number }, b: { clicks: number }) => b.clicks - a.clicks);

    const totalClicks = pages.reduce((s: number, p: { clicks: number }) => s + p.clicks, 0);
    const totalImpressions = pages.reduce((s: number, p: { impressions: number }) => s + p.impressions, 0);
    const avgCtr = totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;
    const avgPosition =
      pages.length > 0
        ? Number((pages.reduce((s: number, p: { position: number }) => s + p.position, 0) / pages.length).toFixed(1))
        : 0;

    return NextResponse.json({
      site,
      period: "Last 28 days",
      lastUpdated: new Date().toISOString(),
      totals: {
        clicks: totalClicks,
        impressions: totalImpressions,
        ctr: avgCtr,
        position: avgPosition,
      },
      pages,
    });
  } catch (err) {
    console.error("Analytics API error:", err);
    return NextResponse.json(buildEmptyResponse(site));
  }
}

function buildEmptyResponse(site: string) {
  const knownPaths = Object.keys(PATH_LABELS);
  const pages = knownPaths.map((path) => ({
    page: `https://${site}${path === "/" ? "" : path}`,
    path,
    label: pathToLabel(path),
    clicks: 0,
    impressions: 0,
    ctr: 0,
    position: 0,
  }));

  return {
    site,
    period: "Last 28 days",
    lastUpdated: new Date().toISOString(),
    totals: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
    pages,
  };
}
