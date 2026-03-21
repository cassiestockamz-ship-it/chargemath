"use client";

import { useEffect, useState, useCallback } from "react";

interface PageData {
  page: string;
  path: string;
  label: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface AnalyticsData {
  site: string;
  period: string;
  lastUpdated: string;
  totals: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  pages: PageData[];
}

const DOT_COLORS = [
  "#0ea5e9", // sky
  "#8b5cf6", // violet
  "#f59e0b", // amber
  "#10b981", // emerald
  "#ef4444", // red
  "#ec4899", // pink
  "#6366f1", // indigo
  "#14b8a6", // teal
];

function ctrColor(ctr: number): string {
  if (ctr > 5) return "#16a34a";
  if (ctr >= 2) return "#d97706";
  return "#dc2626";
}

function posColor(pos: number): string {
  if (pos === 0) return "#94a3b8";
  if (pos < 10) return "#16a34a";
  if (pos <= 20) return "#d97706";
  return "#dc2626";
}

function formatNum(n: number): string {
  return n.toLocaleString("en-US");
}

function SkeletonRow() {
  return (
    <tr>
      {[...Array(6)].map((_, i) => (
        <td key={i} style={{ padding: "10px 12px" }}>
          <div
            style={{
              height: 14,
              borderRadius: 3,
              background: "#e2e8f0",
              animation: "pulse 1.5s ease-in-out infinite",
              width: i === 0 ? "70%" : "50%",
            }}
          />
        </td>
      ))}
    </tr>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const hasRealData = data && data.totals.clicks + data.totals.impressions > 0;
  const updatedAt = data?.lastUpdated
    ? new Date(data.lastUpdated).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  return (
    <>
      <style>{`
        /* Hide site header and footer on this page */
        body > header,
        body > footer {
          display: none !important;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .dash-wrap {
          min-height: 100vh;
          background: #f1f5f9;
          font-family: "Inter", system-ui, -apple-system, sans-serif;
          color: #0f172a;
        }
        .dash-header {
          background: #1a1a2e;
          color: #fff;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .dash-title {
          font-size: 16px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }
        .dash-site-select {
          background: #2a2a4a;
          border: 1px solid #3a3a5a;
          color: #fff;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        }
        .dash-badge {
          background: #0ea5e9;
          color: #fff;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
        }
        .dash-updated {
          font-size: 11px;
          color: #94a3b8;
          margin-left: auto;
        }
        .dash-refresh {
          background: #2a2a4a;
          border: 1px solid #3a3a5a;
          color: #fff;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .dash-refresh:hover {
          background: #3a3a5a;
        }
        .dash-body {
          padding: 16px 24px;
        }
        .dash-banner {
          background: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 6px;
          padding: 10px 14px;
          font-size: 12px;
          color: #92400e;
          margin-bottom: 14px;
        }
        .dash-error {
          background: #fef2f2;
          border: 1px solid #fca5a5;
          border-radius: 6px;
          padding: 10px 14px;
          font-size: 12px;
          color: #991b1b;
          margin-bottom: 14px;
        }
        .summary-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 14px;
        }
        @media (max-width: 640px) {
          .summary-row {
            grid-template-columns: repeat(2, 1fr);
          }
          .dash-header {
            padding: 10px 14px;
          }
          .dash-body {
            padding: 12px 10px;
          }
          .dash-updated {
            margin-left: 0;
            width: 100%;
            margin-top: 4px;
          }
        }
        .summary-cell {
          background: #fff;
          border: 1px solid #e2e8f0;
          padding: 10px 14px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .summary-label {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .summary-value {
          font-size: 22px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }
        .table-wrap {
          background: #fff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 580px;
        }
        thead th {
          position: sticky;
          top: 0;
          background: #1a1a2e;
          color: #fff;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 8px 12px;
          white-space: nowrap;
          border: none;
        }
        thead th:first-child {
          text-align: left;
        }
        thead th:not(:first-child) {
          text-align: right;
        }
        tbody tr {
          border-bottom: 1px solid #eee;
          transition: background 0.1s;
        }
        tbody tr:nth-child(even) {
          background: #fafafa;
        }
        tbody tr:hover {
          background: #f0f7ff;
        }
        tbody td {
          padding: 8px 12px;
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
          gap: 8px;
        }
        .page-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .page-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .page-name {
          font-weight: 600;
          font-size: 13px;
          color: #0f172a;
        }
        .page-path {
          font-size: 11px;
          color: #94a3b8;
        }
        .total-row td {
          font-weight: 700;
          background: #eff6ff;
          border-top: 2px solid #bfdbfe;
          font-size: 13px;
        }
        .total-row td:not(:first-child) {
          font-family: "SF Mono", "Cascadia Code", "Fira Code", monospace;
          font-size: 12px;
        }
      `}</style>

      <div className="dash-wrap">
        {/* Header */}
        <div className="dash-header">
          <div className="dash-title">
            <span style={{ fontSize: 20 }}>&#9889;</span>
            ChargeMath Analytics
          </div>
          <select className="dash-site-select" defaultValue="chargemath.com">
            <option value="chargemath.com">chargemath.com</option>
          </select>
          <span className="dash-badge">{data?.period || "Last 28 days"}</span>
          <span className="dash-updated">
            {updatedAt ? `Updated ${updatedAt}` : ""}
          </span>
          <a
            href="/dashboard/scorecard"
            className="dash-refresh"
            style={{ textDecoration: "none" }}
          >
            Scorecard →
          </a>
          <button
            className="dash-refresh"
            onClick={fetchData}
            disabled={loading}
            title="Refresh data"
          >
            {loading ? "..." : "Refresh"}
          </button>
        </div>

        {/* Body */}
        <div className="dash-body">
          {error && (
            <div className="dash-error">
              Failed to load analytics data: {error}
            </div>
          )}

          {!hasRealData && !loading && (
            <div className="dash-banner">
              No GSC data yet &mdash; data typically appears 2&ndash;3 days after
              submission. Sitemap was submitted on March 21, 2026.
            </div>
          )}

          {/* Summary Row */}
          <div className="summary-row">
            <div className="summary-cell">
              <span className="summary-label" style={{ color: "#0ea5e9" }}>
                Total Clicks
              </span>
              <span className="summary-value" style={{ color: "#0284c7" }}>
                {loading ? "--" : formatNum(data?.totals.clicks ?? 0)}
              </span>
            </div>
            <div className="summary-cell">
              <span className="summary-label" style={{ color: "#64748b" }}>
                Total Impressions
              </span>
              <span className="summary-value" style={{ color: "#475569" }}>
                {loading ? "--" : formatNum(data?.totals.impressions ?? 0)}
              </span>
            </div>
            <div className="summary-cell">
              <span className="summary-label" style={{ color: "#16a34a" }}>
                Avg CTR
              </span>
              <span className="summary-value" style={{ color: "#15803d" }}>
                {loading ? "--" : `${data?.totals.ctr ?? 0}%`}
              </span>
            </div>
            <div className="summary-cell">
              <span className="summary-label" style={{ color: "#d97706" }}>
                Avg Position
              </span>
              <span className="summary-value" style={{ color: "#b45309" }}>
                {loading
                  ? "--"
                  : data?.totals.position
                    ? data.totals.position.toFixed(1)
                    : "--"}
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Clicks</th>
                  <th>Impressions</th>
                  <th>CTR</th>
                  <th>Avg Position</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
                  : data?.pages.map((p, i) => (
                      <tr key={p.path}>
                        <td>
                          <div className="page-cell">
                            <div
                              className="page-dot"
                              style={{
                                backgroundColor:
                                  DOT_COLORS[i % DOT_COLORS.length],
                              }}
                            />
                            <div className="page-info">
                              <span className="page-name">{p.label}</span>
                              <span className="page-path">{p.path}</span>
                            </div>
                          </div>
                        </td>
                        <td>{formatNum(p.clicks)}</td>
                        <td>{formatNum(p.impressions)}</td>
                        <td style={{ color: ctrColor(p.ctr) }}>
                          {p.ctr.toFixed(2)}%
                        </td>
                        <td style={{ color: posColor(p.position) }}>
                          {p.position > 0 ? p.position.toFixed(1) : "--"}
                        </td>
                        <td style={{ color: "#94a3b8", textAlign: "center" }}>
                          &mdash;
                        </td>
                      </tr>
                    ))}

                {/* Total row */}
                {data && !loading && (
                  <tr className="total-row">
                    <td>
                      <strong>Total / Average</strong>
                    </td>
                    <td>{formatNum(data.totals.clicks)}</td>
                    <td>{formatNum(data.totals.impressions)}</td>
                    <td style={{ color: ctrColor(data.totals.ctr) }}>
                      {data.totals.ctr.toFixed(2)}%
                    </td>
                    <td style={{ color: posColor(data.totals.position) }}>
                      {data.totals.position > 0
                        ? data.totals.position.toFixed(1)
                        : "--"}
                    </td>
                    <td style={{ textAlign: "center", color: "#94a3b8" }}>
                      &mdash;
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
