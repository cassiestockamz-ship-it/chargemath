import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Dynamic result card for calculator outputs.
 * Usage: /api/og-result?headline=$47&label=Monthly+cost&sub=PG%26E%20EV-A%202026&calc=bill-impact
 *
 * All params are URL-encoded plain strings. Max lengths enforced for safety.
 */
export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const headline = (searchParams.get("headline") ?? "—").slice(0, 40);
  const label = (searchParams.get("label") ?? "Result").slice(0, 80);
  const sub = (searchParams.get("sub") ?? "").slice(0, 140);
  const calc = (searchParams.get("calc") ?? "chargemath").slice(0, 60);

  return new ImageResponse(
    (
      <div
        style={{
          background:
            "linear-gradient(135deg, #0b1220 0%, #0f172a 55%, #1e293b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 72,
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Top mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 22,
            fontWeight: 700,
            color: "#38bdf8",
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          <span style={{ display: "flex" }}>⚡</span>
          <span style={{ display: "flex" }}>ChargeMath</span>
        </div>

        {/* Label */}
        <div
          style={{
            marginTop: 72,
            fontSize: 28,
            color: "#94a3b8",
            fontWeight: 500,
            display: "flex",
          }}
        >
          {label}
        </div>

        {/* Big headline number */}
        <div
          style={{
            fontSize: 148,
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: -4,
            lineHeight: 1,
            marginTop: 8,
            display: "flex",
          }}
        >
          {headline}
        </div>

        {/* Subtitle */}
        {sub && (
          <div
            style={{
              marginTop: 20,
              fontSize: 28,
              color: "#cbd5e1",
              fontWeight: 400,
              maxWidth: 1000,
              lineHeight: 1.3,
              display: "flex",
            }}
          >
            {sub}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 72,
            right: 72,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            color: "#64748b",
          }}
        >
          <span style={{ display: "flex" }}>chargemath.com/{calc}</span>
          <span style={{ display: "flex", color: "#38bdf8", fontWeight: 600 }}>
            Try it yourself →
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
