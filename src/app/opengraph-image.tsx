import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ChargeMath | Free EV Charging Calculators";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 72, marginBottom: 16, display: "flex" }}>⚡</div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "#ffffff",
            marginBottom: 16,
            display: "flex",
          }}
        >
          ChargeMath
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#94a3b8",
            maxWidth: 700,
            textAlign: "center",
            display: "flex",
          }}
        >
          Free EV Charging Calculators
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 40,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {["Charging Cost", "Gas vs Electric", "Charging Time", "Charger ROI", "Range", "Tax Credits", "Bill Impact"].map((name) => (
            <div
              key={name}
              style={{
                background: "rgba(14, 165, 233, 0.15)",
                border: "1px solid rgba(14, 165, 233, 0.3)",
                borderRadius: 8,
                padding: "8px 16px",
                color: "#38bdf8",
                fontSize: 18,
                fontWeight: 600,
                display: "flex",
              }}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
