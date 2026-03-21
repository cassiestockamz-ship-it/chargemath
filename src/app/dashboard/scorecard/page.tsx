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
  { value: "7", label: "7 days" },
  { value: "14", label: "14 days" },
  { value: "28", label: "28 days" },
  { value: "90", label: "90 days" },
];

function n(v: number) {
  return v.toLocaleString("en-US");
}

function ctrColor(ctr: number) {
  if (ctr > 5) return "#16a34a";
  if (ctr >= 2) return "#d97706";
  return ctr > 0 ? "#dc2626" : "#94a3b8";
}

function posColor(pos: number) {
  if (pos === 0) return "#94a3b8";
  if (pos <= 10) return "#16a34a";
  if (pos <= 20) return "#d97706";
  if (pos <= 50) return "#ea580c";
  return "#dc2626";
}

function posBadge(pos: number) {
  if (pos === 0) return "—";
  return pos.toFixed(1);
}

// ─── Component ───────────────────────────────────────────
export default function ScorecardPage() {
  const [data, setData] = useState<ScorecardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("28");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

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

  // Grand totals across all sites
  const grandTotals = data?.sites.reduce(
    (acc, site) => ({
      clicks: acc.clicks + site.totals.clicks,
      impressions: acc.impressions + site.totals.impressions,
      pages: acc.pages + site.totals.pages,
    }),
    { clicks: 0, impressions: 0, pages: 0 }
  ) ?? { clicks: 0, impressions: 0, pages: 0 };

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

        .sc-wrap {
          min-height: 100vh;
          background: #0f172a;
          font-family: "Inter", system-ui, -apple-system, sans-serif;
          color: #e2e8f0;
        }

        /* ── Top bar ── */
        .sc-topbar {
          background: #1e293b;
          border-bottom: 1px solid #334155;
          padding: 10px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .sc-logo {
          font-size: 15px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #f8fafc;
          text-decoration: none;
        }
        .sc-logo span { font-size: 18px; }
        .sc-divider {
          width: 1px;
          height: 20px;
          background: #475569;
        }
        .sc-title {
          font-size: 13px;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }
        .sc-range-group {
          display: flex;
          gap: 2px;
          background: #0f172a;
          border-radius: 6px;
          padding: 2px;
          margin-left: auto;
        }
        .sc-range-btn {
          padding: 5px 10px;
          font-size: 11px;
          font-weight: 600;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s;
          color: #94a3b8;
          background: transparent;
        }
        .sc-range-btn:hover { color: #e2e8f0; }
        .sc-range-btn.active {
          background: #0ea5e9;
          color: #fff;
        }
        .sc-meta {
          font-size: 10px;
          color: #64748b;
        }
        .sc-refresh {
          background: #1e293b;
          border: 1px solid #334155;
          color: #94a3b8;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          cursor: pointer;
        }
        .sc-refresh:hover { border-color: #475569; color: #e2e8f0; }

        /* ── Summary strip ── */
        .sc-summary {
          display: flex;
          gap: 1px;
          background: #1e293b;
          border-bottom: 1px solid #334155;
        }
        .sc-stat {
          flex: 1;
          padding: 12px 16px;
          background: #0f172a;
        }
        .sc-stat-label {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #64748b;
          margin-bottom: 2px;
        }
        .sc-stat-value {
          font-size: 24px;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
        }

        /* ── Table ── */
        .sc-body { padding: 0; }
        .sc-site-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #1e293b;
          border-top: 1px solid #334155;
          border-bottom: 1px solid #334155;
        }
        .sc-site-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .sc-site-name {
          font-size: 13px;
          font-weight: 700;
          color: #f1f5f9;
        }
        .sc-site-domain {
          font-size: 11px;
          color: #64748b;
        }
        .sc-site-totals {
          margin-left: auto;
          display: flex;
          gap: 16px;
          font-size: 11px;
          color: #94a3b8;
        }
        .sc-site-totals strong {
          color: #e2e8f0;
          font-weight: 700;
        }

        .sc-table-wrap { overflow-x: auto; }
        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 700px;
        }
        thead th {
          position: sticky;
          top: 0;
          z-index: 2;
          background: #1a1a2e;
          color: #64748b;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 7px 14px;
          border-bottom: 2px solid #334155;
          white-space: nowrap;
        }
        thead th:first-child { text-align: left; }
        thead th:not(:first-child) { text-align: right; }

        tbody tr {
          border-bottom: 1px solid #1e293b;
          cursor: pointer;
          transition: background 0.1s;
        }
        tbody tr:hover { background: #1e293b; }
        tbody tr.expanded { background: #1e293b; }

        tbody td {
          padding: 9px 14px;
          font-size: 13px;
          vertical-align: middle;
        }
        tbody td:not(:first-child) {
          text-align: right;
          font-variant-numeric: tabular-nums;
          font-family: "SF Mono", "Cascadia Code", "Fira Code", monospace;
          font-size: 12px;
        }

        .page-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .page-icon {
          font-size: 16px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          background: #1e293b;
          flex-shrink: 0;
        }
        .page-info {}
        .page-name {
          font-weight: 600;
          font-size: 13px;
          color: #f1f5f9;
        }
        .page-path {
          font-size: 10px;
          color: #475569;
          font-family: "SF Mono", monospace;
        }

        .kw-bar {
          height: 4px;
          border-radius: 2px;
          transition: width 0.5s;
        }

        /* Keywords sub-row */
        .kw-row td {
          padding: 0 14px 10px 52px;
          border-bottom: 1px solid #1e293b;
        }
        .kw-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 0;
        }
        .kw-table th {
          font-size: 9px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 4px 8px;
          text-align: left;
          border-bottom: 1px solid #1e293b;
          position: static;
          background: transparent;
        }
        .kw-table th:not(:first-child) { text-align: right; }
        .kw-table td {
          font-size: 11px;
          padding: 4px 8px;
          color: #94a3b8;
          text-align: left;
        }
        .kw-table td:not(:first-child) {
          text-align: right;
          font-family: "SF Mono", monospace;
          font-size: 10px;
          font-variant-numeric: tabular-nums;
        }
        .kw-table tbody tr {
          border-bottom: none;
          cursor: default;
        }
        .kw-table tbody tr:hover { background: transparent; }
        .kw-query {
          max-width: 280px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #cbd5e1;
        }
        .kw-empty {
          font-size: 11px;
          color: #475569;
          font-style: italic;
          padding: 6px 0;
        }

        /* Skeleton */
        .skel {
          height: 12px;
          border-radius: 3px;
          background: #1e293b;
          animation: pulse 1.5s ease-in-out infinite;
        }

        /* Loading bar */
        .sc-loading-bar {
          height: 2px;
          background: linear-gradient(90deg, transparent, #0ea5e9, transparent);
          animation: loadSlide 1.2s ease-in-out infinite;
        }
        @keyframes loadSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @media (max-width: 640px) {
          .sc-topbar { padding: 8px 12px; }
          .sc-summary { flex-wrap: wrap; }
          .sc-stat { min-width: 50%; }
          .sc-site-totals { display: none; }
          .sc-range-group { margin-left: 0; width: 100%; justify-content: center; margin-top: 4px; }
        }
      `}</style>

      <div className="sc-wrap">
        {/* Top Bar */}
        <div className="sc-topbar">
          <a href="/dashboard" className="sc-logo">
            <span>&#9889;</span> ChargeMath
          </a>
          <div className="sc-divider" />
          <span className="sc-title">Scorecard</span>

          <div className="sc-range-group">
            {RANGES.map((r) => (
              <button
                key={r.value}
                className={`sc-range-btn ${range === r.value ? "active" : ""}`}
                onClick={() => setRange(r.value)}
              >
                {r.label}
              </button>
            ))}
          </div>

          <span className="sc-meta">
            {data ? `${data.startDate} → ${data.endDate}` : ""}
            {updatedAt ? ` · Updated ${updatedAt}` : ""}
          </span>

          <button className="sc-refresh" onClick={fetchData} disabled={loading}>
            {loading ? "..." : "↻ Refresh"}
          </button>
        </div>

        {/* Loading bar */}
        {loading && (
          <div style={{ overflow: "hidden" }}>
            <div className="sc-loading-bar" />
          </div>
        )}

        {/* Summary Strip */}
        <div className="sc-summary">
          <div className="sc-stat">
            <div className="sc-stat-label">Total Clicks</div>
            <div className="sc-stat-value" style={{ color: "#0ea5e9" }}>
              {loading ? "—" : n(grandTotals.clicks)}
            </div>
          </div>
          <div className="sc-stat">
            <div className="sc-stat-label">Total Impressions</div>
            <div className="sc-stat-value" style={{ color: "#e2e8f0" }}>
              {loading ? "—" : n(grandTotals.impressions)}
            </div>
          </div>
          <div className="sc-stat">
            <div className="sc-stat-label">Avg CTR</div>
            <div className="sc-stat-value" style={{ color: ctrColor(grandCtr) }}>
              {loading ? "—" : `${grandCtr}%`}
            </div>
          </div>
          <div className="sc-stat">
            <div className="sc-stat-label">Pages Tracked</div>
            <div className="sc-stat-value" style={{ color: "#a78bfa" }}>
              {loading ? "—" : n(grandTotals.pages)}
            </div>
          </div>
        </div>

        {/* Site Sections */}
        <div className="sc-body">
          {(data?.sites ?? []).map((site) => {
            const pageIcons: Record<string, string> = {
              "/": "🏠",
              "/ev-charging-cost": "🔌",
              "/gas-vs-electric": "⚖️",
              "/charging-time": "⏱️",
              "/charger-roi": "💰",
              "/range": "🗺️",
              "/tax-credits": "🏛️",
              "/bill-impact": "📄",
            };

            return (
              <div key={site.id}>
                {/* Site Header */}
                <div className="sc-site-header">
                  <div className="sc-site-dot" style={{ backgroundColor: site.color }} />
                  <span className="sc-site-name">{site.label}</span>
                  <span className="sc-site-domain">{site.domain}</span>
                  <div className="sc-site-totals">
                    <span>
                      Clicks: <strong>{n(site.totals.clicks)}</strong>
                    </span>
                    <span>
                      Impressions: <strong>{n(site.totals.impressions)}</strong>
                    </span>
                    <span>
                      CTR: <strong style={{ color: ctrColor(site.totals.ctr) }}>{site.totals.ctr}%</strong>
                    </span>
                    <span>
                      Avg Pos: <strong style={{ color: posColor(site.totals.position) }}>{posBadge(site.totals.position)}</strong>
                    </span>
                  </div>
                </div>

                {/* Table */}
                <div className="sc-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th style={{ width: "30%" }}>Page</th>
                        <th>Clicks</th>
                        <th>Impressions</th>
                        <th>CTR</th>
                        <th>Avg Position</th>
                        <th>Top Keyword</th>
                        <th style={{ width: "15%" }}>Keyword Pos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading
                        ? [...Array(8)].map((_, i) => (
                            <tr key={i}>
                              <td><div className="skel" style={{ width: "70%" }} /></td>
                              <td><div className="skel" style={{ width: "40%", marginLeft: "auto" }} /></td>
                              <td><div className="skel" style={{ width: "40%", marginLeft: "auto" }} /></td>
                              <td><div className="skel" style={{ width: "40%", marginLeft: "auto" }} /></td>
                              <td><div className="skel" style={{ width: "40%", marginLeft: "auto" }} /></td>
                              <td><div className="skel" style={{ width: "60%", marginLeft: "auto" }} /></td>
                              <td><div className="skel" style={{ width: "30%", marginLeft: "auto" }} /></td>
                            </tr>
                          ))
                        : site.pages.map((page) => {
                            const rowKey = `${site.id}:${page.path}`;
                            const isExpanded = expandedRow === rowKey;
                            const topKw = page.topQueries[0];
                            const maxImpressions = Math.max(...site.pages.map((p) => p.impressions), 1);

                            return (
                              <>
                                <tr
                                  key={rowKey}
                                  className={isExpanded ? "expanded" : ""}
                                  onClick={() => setExpandedRow(isExpanded ? null : rowKey)}
                                >
                                  <td>
                                    <div className="page-cell">
                                      <div className="page-icon">{pageIcons[page.path] || "📊"}</div>
                                      <div className="page-info">
                                        <div className="page-name">{page.label}</div>
                                        <div className="page-path">{page.path}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td style={{ color: page.clicks > 0 ? "#0ea5e9" : "#475569", fontWeight: page.clicks > 0 ? 700 : 400 }}>
                                    {n(page.clicks)}
                                  </td>
                                  <td>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                                      <span style={{ color: page.impressions > 0 ? "#e2e8f0" : "#475569" }}>
                                        {n(page.impressions)}
                                      </span>
                                      <div style={{ width: "100%", maxWidth: 80, height: 4, background: "#1e293b", borderRadius: 2 }}>
                                        <div
                                          className="kw-bar"
                                          style={{
                                            width: `${(page.impressions / maxImpressions) * 100}%`,
                                            background: site.color,
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </td>
                                  <td style={{ color: ctrColor(page.ctr), fontWeight: 600 }}>
                                    {page.ctr > 0 ? `${page.ctr.toFixed(2)}%` : "—"}
                                  </td>
                                  <td style={{ color: posColor(page.position), fontWeight: 600 }}>
                                    {posBadge(page.position)}
                                  </td>
                                  <td style={{ textAlign: "left", paddingLeft: 20 }}>
                                    {topKw ? (
                                      <span className="kw-query" title={topKw.query}>{topKw.query}</span>
                                    ) : (
                                      <span style={{ color: "#334155" }}>—</span>
                                    )}
                                  </td>
                                  <td style={{ color: topKw ? posColor(topKw.position) : "#334155", fontWeight: 600 }}>
                                    {topKw ? posBadge(topKw.position) : "—"}
                                  </td>
                                </tr>

                                {/* Expanded keywords sub-row */}
                                {isExpanded && (
                                  <tr key={`${rowKey}-kw`} className="kw-row">
                                    <td colSpan={7}>
                                      {page.topQueries.length > 0 ? (
                                        <table className="kw-table">
                                          <thead>
                                            <tr>
                                              <th>Keyword</th>
                                              <th>Clicks</th>
                                              <th>Impressions</th>
                                              <th>CTR</th>
                                              <th>Position</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {page.topQueries.map((q, qi) => (
                                              <tr key={qi}>
                                                <td><span className="kw-query">{q.query}</span></td>
                                                <td style={{ color: q.clicks > 0 ? "#0ea5e9" : "#475569" }}>{n(q.clicks)}</td>
                                                <td>{n(q.impressions)}</td>
                                                <td style={{ color: ctrColor(q.ctr) }}>{q.ctr.toFixed(2)}%</td>
                                                <td style={{ color: posColor(q.position), fontWeight: 600 }}>{posBadge(q.position)}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      ) : (
                                        <div className="kw-empty">No keyword data yet — GSC data typically appears 2–3 days after indexing.</div>
                                      )}
                                    </td>
                                  </tr>
                                )}
                              </>
                            );
                          })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
