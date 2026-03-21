import { NextRequest, NextResponse } from "next/server";

const SITES = [
  {
    id: "chargemath",
    domain: "chargemath.com",
    label: "ChargeMath",
    color: "#0ea5e9",
    pages: [
      { path: "/", label: "Homepage" },
      { path: "/ev-charging-cost", label: "Charging Cost" },
      { path: "/gas-vs-electric", label: "Gas vs Electric" },
      { path: "/charging-time", label: "Charging Time" },
      { path: "/charger-roi", label: "Charger ROI" },
      { path: "/range", label: "Range Calculator" },
      { path: "/tax-credits", label: "Tax Credits" },
      { path: "/bill-impact", label: "Bill Impact" },
    ],
  },
  {
    id: "plantingcalc",
    domain: "plantingcalc.com",
    label: "PlantingCalc",
    color: "#22c55e",
    pages: [
      { path: "/", label: "Homepage" },
      { path: "/soil-calculator", label: "Soil Calculator" },
      { path: "/planting-dates", label: "Planting Dates" },
      { path: "/seed-spacing", label: "Seed Spacing" },
      { path: "/companion-planting", label: "Companion Planting" },
      { path: "/fertilizer", label: "Fertilizer" },
      { path: "/watering", label: "Watering" },
    ],
  },
];

async function getAccessToken(): Promise<string> {
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error("Missing Google OAuth credentials");
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

  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

interface GSCRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

async function fetchGSCPageData(
  accessToken: string,
  domain: string,
  startDate: string,
  endDate: string
): Promise<GSCRow[]> {
  const siteUrl = `sc-domain:${domain}`;
  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ["page"],
        rowLimit: 200,
      }),
    }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.rows || [];
}

async function fetchGSCQueryData(
  accessToken: string,
  domain: string,
  startDate: string,
  endDate: string,
  pageUrl: string
): Promise<GSCRow[]> {
  const siteUrl = `sc-domain:${domain}`;
  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ["query"],
        dimensionFilterGroups: [
          {
            filters: [
              {
                dimension: "page",
                operator: "equals",
                expression: pageUrl,
              },
            ],
          },
        ],
        rowLimit: 5,
      }),
    }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.rows || [];
}

function urlToPath(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname.replace(/\/$/, "") || "/";
  } catch {
    return url;
  }
}

function dateFmt(d: Date): string {
  return d.toISOString().split("T")[0];
}

export async function GET(request: NextRequest) {
  const range = request.nextUrl.searchParams.get("range") || "28";
  const days = Math.min(Math.max(parseInt(range) || 28, 1), 365);

  const endDate = new Date();
  // GSC data has ~3 day delay
  endDate.setDate(endDate.getDate() - 3);
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - days);

  try {
    const accessToken = await getAccessToken();

    const allSiteData = [];

    for (const site of SITES) {
      // Fetch page-level data
      const pageRows = await fetchGSCPageData(
        accessToken,
        site.domain,
        dateFmt(startDate),
        dateFmt(endDate)
      );

      // Build a map of path -> metrics
      const pageMap = new Map<string, { clicks: number; impressions: number; ctr: number; position: number }>();
      for (const row of pageRows) {
        const path = urlToPath(row.keys[0]);
        pageMap.set(path, {
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: Number((row.ctr * 100).toFixed(2)),
          position: Number(row.position.toFixed(1)),
        });
      }

      // For each known page, fetch top queries
      const pagesWithQueries = [];
      for (const page of site.pages) {
        const metrics = pageMap.get(page.path) || {
          clicks: 0,
          impressions: 0,
          ctr: 0,
          position: 0,
        };

        // Only fetch queries if page has impressions (to avoid wasting API calls)
        let topQueries: { query: string; clicks: number; impressions: number; ctr: number; position: number }[] = [];
        if (metrics.impressions > 0) {
          const fullUrl = `https://${site.domain}${page.path === "/" ? "" : page.path}`;
          const queryRows = await fetchGSCQueryData(
            accessToken,
            site.domain,
            dateFmt(startDate),
            dateFmt(endDate),
            fullUrl
          );
          topQueries = queryRows.map((r) => ({
            query: r.keys[0],
            clicks: r.clicks,
            impressions: r.impressions,
            ctr: Number((r.ctr * 100).toFixed(2)),
            position: Number(r.position.toFixed(1)),
          }));
        }

        pagesWithQueries.push({
          path: page.path,
          label: page.label,
          ...metrics,
          topQueries,
        });
      }

      // Site totals
      const totalClicks = pagesWithQueries.reduce((s, p) => s + p.clicks, 0);
      const totalImpressions = pagesWithQueries.reduce((s, p) => s + p.impressions, 0);
      const avgCtr = totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;
      const rankedPages = pagesWithQueries.filter((p) => p.position > 0);
      const avgPosition = rankedPages.length > 0
        ? Number((rankedPages.reduce((s, p) => s + p.position, 0) / rankedPages.length).toFixed(1))
        : 0;

      allSiteData.push({
        id: site.id,
        domain: site.domain,
        label: site.label,
        color: site.color,
        totals: {
          clicks: totalClicks,
          impressions: totalImpressions,
          ctr: avgCtr,
          position: avgPosition,
          pages: pagesWithQueries.length,
        },
        pages: pagesWithQueries,
      });
    }

    return NextResponse.json({
      range: `${days}d`,
      startDate: dateFmt(startDate),
      endDate: dateFmt(endDate),
      lastUpdated: new Date().toISOString(),
      sites: allSiteData,
    });
  } catch (err) {
    console.error("Scorecard API error:", err);
    // Return empty data for all sites
    return NextResponse.json({
      range: `${days}d`,
      startDate: dateFmt(startDate),
      endDate: dateFmt(endDate),
      lastUpdated: new Date().toISOString(),
      sites: SITES.map((site) => ({
        id: site.id,
        domain: site.domain,
        label: site.label,
        color: site.color,
        totals: { clicks: 0, impressions: 0, ctr: 0, position: 0, pages: site.pages.length },
        pages: site.pages.map((p) => ({
          path: p.path,
          label: p.label,
          clicks: 0,
          impressions: 0,
          ctr: 0,
          position: 0,
          topQueries: [],
        })),
      })),
    });
  }
}
