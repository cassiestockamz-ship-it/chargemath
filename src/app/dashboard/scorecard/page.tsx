"use client";

import { useEffect, useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────
interface Query {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface PageRow {
  path: string;
  label: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  topQueries: Query[];
}

interface SiteData {
  id: string;
  domain: string;
  label: string;
  color: string;
  totals: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    pages: number;
  };
  pages: PageRow[];
}

interface ScorecardData {
  range: string;
  startDate: string;
  endDate: string;
  lastUpdated: string;
  sites: SiteData[];
}

// ─── Helpers ─────────────────────────────────────────────
const RANGES = [
  { value: "7", label: "7d" },
  { value: "14", label: "14d" },
  { value: "28", label: "28d" },
  { value: "90", label: "90d" },
];

function n(v: number) {
  return v.toLocaleString("en-US");
}

function ctrColor(ctr: number) {
  if (ctr > 5) return "#16a34a";
  if (ctr >= 2) return "#d97706";
  return ctr > 0 ? "#dc2626" : "#64748b";
}

function posColor(pos: number) {
  if (pos === 0) return "#64748b";
  if (pos <= 10) return "#16a34a";
  if (pos <= 20) return "#d97706";
  if (pos <= 50) return "#ea580c";
  return "#dc2626";
}

function posBadge(pos: number) {
  if (pos === 0) return "—";
  return pos.toFixed(1);
}

const SITE_ICONS: Record<string, string> = {
  chargemath: "⚡",
  plantingcalc: "🌱",
};

const PAGE_ICONS: Record<string, string> = {
  "/": "🏠",
  "/ev-charging-cost": "🔌",
  "/gas-vs-electric": "⚖️",
  "/charging-time": "⏱️",
  "/charger-roi": "💰",
  "/range": "🗺️",
  "/tax-credits": "🏛️",
  "/bill-impact": "📄",
  "/soil-calculator": "🪴",
  "/planting-dates": "📅",
  "/seed-spacing": "🌱",
  "/companion-planting": "🤝",
  "/fertilizer": "🧪",
  "/watering": "💧",
};

// ─── Component ───────────────────────────────────────────
export default function ScorecardPage() {
  const [data, setData] = useState<ScorecardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("28");
  const [expandedSite, setExpandedSite] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/scorecard?range=${range}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updatedAt = data?.lastUpdated
    ? new Date(data.lastUpdated).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  const grandTotals = data?.sites.reduce(
    (acc, site) => ({
      clicks: acc.clicks + site.totals.clicks,
      impressions: acc.impressions + site.totals.impressions,
      pages: acc.pages + site.totals.pages,
      sites: acc.sites + 1,
    }),
    { clicks: 0, impressions: 0, pages: 0, sites: 0 }
  ) ?? { clicks: 0, impressions: 0, pages: 0, sites: 0 };

  const grandCtr =
    grandTotals.impressions > 0
      ? Number(((grandTotals.clicks / grandTotals.impressions) * 100).toFixed(2))
      : 0;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body > header, body > footer { display: none !important; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes loadSlide { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }

        .sc { min-height:100vh; background:#0f172a; font-family:"Inter",system-ui,sans-serif; color:#e2e8f0; }

        /* Top bar */
        .sc-top { background:#1e293b; border-bottom:1px solid #334155; padding:10px 20px; display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
        .sc-logo { font-size:15px; font-weight:700; display:flex; align-items:center; gap:6px; color:#f8fafc; text-decoration:none; }
        .sc-logo span { font-size:18px; }
        .sc-sep { width:1px; height:20px; background:#475569; }
        .sc-label { font-size:13px; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:0.03em; }
        .sc-ranges { display:flex; gap:2px; background:#0f172a; border-radius:6px; padding:2px; margin-left:auto; }
        .sc-rbtn { padding:5px 10px; font-size:11px; font-weight:600; border:none; border-radius:4px; cursor:pointer; color:#94a3b8; background:transparent; transition:all 0.15s; }
        .sc-rbtn:hover { color:#e2e8f0; }
        .sc-rbtn.on { background:#0ea5e9; color:#fff; }
        .sc-meta { font-size:10px; color:#64748b; }
        .sc-btn { background:#1e293b; border:1px solid #334155; color:#94a3b8; padding:4px 10px; border-radius:4px; font-size:11px; cursor:pointer; }
        .sc-btn:hover { border-color:#475569; color:#e2e8f0; }
        .sc-load { height:2px; background:linear-gradient(90deg,transparent,#0ea5e9,transparent); animation:loadSlide 1.2s ease-in-out infinite; }

        /* Summary */
        .sc-sum { display:flex; gap:1px; background:#1e293b; border-bottom:1px solid #334155; }
        .sc-s { flex:1; padding:14px 18px; background:#0f172a; }
        .sc-sl { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#64748b; margin-bottom:2px; }
        .sc-sv { font-size:26px; font-weight:800; font-variant-numeric:tabular-nums; }

        /* Main table */
        .sc-tw { overflow-x:auto; padding:0; }
        .sc-tw table { width:100%; border-collapse:collapse; min-width:750px; }
        .sc-tw thead th {
          position:sticky; top:0; z-index:2; background:#1a1a2e; color:#64748b;
          font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em;
          padding:8px 16px; border-bottom:2px solid #334155; white-space:nowrap;
        }
        .sc-tw thead th:first-child { text-align:left; }
        .sc-tw thead th:not(:first-child) { text-align:right; }

        /* Site rows */
        .site-row { cursor:pointer; transition:background 0.1s; border-bottom:1px solid #1e293b; }
        .site-row:hover { background:#1e293b; }
        .site-row.open { background:#1e293b; }
        .site-row td { padding:12px 16px; font-size:14px; vertical-align:middle; }
        .site-row td:not(:first-child) {
          text-align:right; font-variant-numeric:tabular-nums;
          font-family:"SF Mono","Cascadia Code","Fira Code",monospace; font-size:13px;
        }
        .site-cell { display:flex; align-items:center; gap:10px; }
        .site-icon { font-size:22px; width:36px; height:36px; display:flex; align-items:center; justify-content:center; border-radius:8px; flex-shrink:0; }
        .site-name { font-weight:700; font-size:15px; color:#f1f5f9; }
        .site-domain { font-size:11px; color:#64748b; font-family:"SF Mono",monospace; }
        .site-chevron { color:#475569; font-size:14px; margin-left:auto; transition:transform 0.2s; }
        .site-chevron.open { transform:rotate(90deg); color:#94a3b8; }

        /* Page sub-rows */
        .page-row { border-bottom:1px solid #151d2e; }
        .page-row td { padding:7px 16px 7px 28px; font-size:12px; vertical-align:middle; }
        .page-row td:not(:first-child) {
          text-align:right; font-variant-numeric:tabular-nums;
          font-family:"SF Mono","Cascadia Code","Fira Code",monospace; font-size:11px;
        }
        .page-row:hover { background:#151d2e; }
        .pg-cell { display:flex; align-items:center; gap:8px; padding-left:16px; }
        .pg-icon { font-size:14px; width:24px; text-align:center; }
        .pg-name { font-weight:500; font-size:12px; color:#cbd5e1; }
        .pg-path { font-size:10px; color:#475569; font-family:"SF Mono",monospace; }
        .pg-bar { height:3px; border-radius:1.5px; transition:width 0.5s; }

        /* Skeleton */
        .skel { height:14px; border-radius:3px; background:#1e293b; animation:pulse 1.5s ease-in-out infinite; }

        @media (max-width:640px) {
          .sc-top { padding:8px 12px; }
          .sc-sum { flex-wrap:wrap; }
          .sc-s { min-width:50%; }
          .sc-ranges { margin-left:0; width:100%; justify-content:center; margin-top:4px; }
        }
      `}</style>

      <div className="sc">
        {/* Top Bar */}
        <div className="sc-top">
          <a href="/dashboard" className="sc-logo">
            <span>&#9889;</span> Scorecard
          </a>
          <div className="sc-sep" />
          <span className="sc-label">All Sites</span>

          <div className="sc-ranges">
            {RANGES.map((r) => (
              <button
                key={r.value}
                className={`sc-rbtn ${range === r.value ? "on" : ""}`}
                onClick={() => setRange(r.value)}
              >
                {r.label}
              </button>
            ))}
          </div>

          <span className="sc-meta">
            {data ? `${data.startDate} → ${data.endDate}` : ""}
            {updatedAt ? ` · ${updatedAt}` : ""}
          </span>

          <button className="sc-btn" onClick={fetchData} disabled={loading}>
            {loading ? "..." : "↻ Refresh"}
          </button>
        </div>

        {loading && <div style={{ overflow: "hidden" }}><div className="sc-load" /></div>}

        {/* Summary Strip */}
        <div className="sc-sum">
          <div className="sc-s">
            <div className="sc-sl">Sites</div>
            <div className="sc-sv" style={{ color: "#a78bfa" }}>
              {loading ? "—" : grandTotals.sites}
            </div>
          </div>
          <div className="sc-s">
            <div className="sc-sl">Total Clicks</div>
            <div className="sc-sv" style={{ color: "#0ea5e9" }}>
              {loading ? "—" : n(grandTotals.clicks)}
            </div>
          </div>
          <div className="sc-s">
            <div className="sc-sl">Total Impressions</div>
            <div className="sc-sv" style={{ color: "#e2e8f0" }}>
              {loading ? "—" : n(grandTotals.impressions)}
            </div>
          </div>
          <div className="sc-s">
            <div className="sc-sl">Avg CTR</div>
            <div className="sc-sv" style={{ color: ctrColor(grandCtr) }}>
              {loading ? "—" : `${grandCtr}%`}
            </div>
          </div>
          <div className="sc-s">
            <div className="sc-sl">Pages Tracked</div>
            <div className="sc-sv" style={{ color: "#94a3b8" }}>
              {loading ? "—" : n(grandTotals.pages)}
            </div>
          </div>
        </div>

        {/* Main Table — Sites as rows */}
        <div className="sc-tw">
          <table>
            <thead>
              <tr>
                <th style={{ width: "35%" }}>Website</th>
                <th>Pages</th>
                <th>Clicks</th>
                <th>Impressions</th>
                <th>CTR</th>
                <th>Avg Position</th>
                <th>Top Keyword</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(2)].map((_, i) => (
                    <tr key={i} className="site-row">
                      <td><div className="skel" style={{ width: "60%" }} /></td>
                      <td><div className="skel" style={{ width: "30%", marginLeft: "auto" }} /></td>
                      <td><div className="skel" style={{ width: "40%", marginLeft: "auto" }} /></td>
                      <td><div className="skel" style={{ width: "40%", marginLeft: "auto" }} /></td>
                      <td><div className="skel" style={{ width: "40%", marginLeft: "auto" }} /></td>
                      <td><div className="skel" style={{ width: "40%", marginLeft: "auto" }} /></td>
                      <td><div className="skel" style={{ width: "50%", marginLeft: "auto" }} /></td>
                    </tr>
                  ))
                : (data?.sites ?? []).map((site) => {
                    const isOpen = expandedSite === site.id;
                    const topPage = site.pages.reduce((best, p) => (p.clicks > best.clicks ? p : best), site.pages[0]);
                    const topKw = topPage?.topQueries?.[0];
                    const maxImpressions = Math.max(...(data?.sites ?? []).map((s) => s.totals.impressions), 1);

                    return (
                      <>{/* Site row */}
                        <tr
                          key={site.id}
                          className={`site-row ${isOpen ? "open" : ""}`}
                          onClick={() => setExpandedSite(isOpen ? null : site.id)}
                        >
                          <td>
                            <div className="site-cell">
                              <div className="site-icon" style={{ background: `${site.color}20` }}>
                                {SITE_ICONS[site.id] || "🌐"}
                              </div>
                              <div>
                                <div className="site-name">{site.label}</div>
                                <div className="site-domain">{site.domain}</div>
                              </div>
                              <span className={`site-chevron ${isOpen ? "open" : ""}`}>▶</span>
                            </div>
                          </td>
                          <td style={{ color: "#a78bfa", fontWeight: 600 }}>
                            {site.totals.pages}
                          </td>
                          <td style={{ color: site.totals.clicks > 0 ? "#0ea5e9" : "#475569", fontWeight: 700 }}>
                            {n(site.totals.clicks)}
                          </td>
                          <td>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                              <span style={{ color: site.totals.impressions > 0 ? "#e2e8f0" : "#475569" }}>
                                {n(site.totals.impressions)}
                              </span>
                              <div style={{ width: "100%", maxWidth: 100, height: 4, background: "#1e293b", borderRadius: 2 }}>
                                <div
                                  className="pg-bar"
                                  style={{
                                    width: `${(site.totals.impressions / maxImpressions) * 100}%`,
                                    background: site.color,
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                          <td style={{ color: ctrColor(site.totals.ctr), fontWeight: 600 }}>
                            {site.totals.ctr > 0 ? `${site.totals.ctr}%` : "—"}
                          </td>
                          <td style={{ color: posColor(site.totals.position), fontWeight: 600 }}>
                            {posBadge(site.totals.position)}
                          </td>
                          <td style={{ textAlign: "left", paddingLeft: 16 }}>
                            {topKw ? (
                              <span style={{ color: "#cbd5e1", fontSize: 12 }} title={topKw.query}>
                                {topKw.query.length > 30 ? topKw.query.slice(0, 30) + "…" : topKw.query}
                              </span>
                            ) : (
                              <span style={{ color: "#334155" }}>—</span>
                            )}
                          </td>
                        </tr>

                        {/* Expanded: per-page rows */}
                        {isOpen && site.pages.map((page) => {
                          const pageTopKw = page.topQueries?.[0];
                          const maxPageImp = Math.max(...site.pages.map((p) => p.impressions), 1);

                          return (
                            <tr key={`${site.id}:${page.path}`} className="page-row">
                              <td>
                                <div className="pg-cell">
                                  <span className="pg-icon">{PAGE_ICONS[page.path] || "📊"}</span>
                                  <div>
                                    <div className="pg-name">{page.label}</div>
                                    <div className="pg-path">{page.path}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ color: "#475569" }}>—</td>
                              <td style={{ color: page.clicks > 0 ? "#0ea5e9" : "#475569", fontWeight: page.clicks > 0 ? 600 : 400 }}>
                                {n(page.clicks)}
                              </td>
                              <td>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                                  <span style={{ color: page.impressions > 0 ? "#cbd5e1" : "#475569", fontSize: 11 }}>
                                    {n(page.impressions)}
                                  </span>
                                  <div style={{ width: "100%", maxWidth: 60, height: 3, background: "#1e293b", borderRadius: 1.5 }}>
                                    <div
                                      className="pg-bar"
                                      style={{
                                        width: `${(page.impressions / maxPageImp) * 100}%`,
                                        background: site.color,
                                        opacity: 0.7,
                                      }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td style={{ color: ctrColor(page.ctr), fontWeight: 600, fontSize: 11 }}>
                                {page.ctr > 0 ? `${page.ctr.toFixed(2)}%` : "—"}
                              </td>
                              <td style={{ color: posColor(page.position), fontWeight: 600, fontSize: 11 }}>
                                {posBadge(page.position)}
                              </td>
                              <td style={{ textAlign: "left", paddingLeft: 16 }}>
                                {pageTopKw ? (
                                  <span style={{ color: "#94a3b8", fontSize: 11 }} title={pageTopKw.query}>
                                    {pageTopKw.query.length > 25 ? pageTopKw.query.slice(0, 25) + "…" : pageTopKw.query}
                                  </span>
                                ) : (
                                  <span style={{ color: "#334155", fontSize: 11 }}>—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
