import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

export function makeOgImage(title: string, subtitle: string, emoji: string) {
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
          padding: 60,
        }}
      >
        <div style={{ fontSize: 72, marginBottom: 20, display: "flex" }}>{emoji}</div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: "#ffffff",
            marginBottom: 12,
            textAlign: "center",
            lineHeight: 1.2,
            display: "flex",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#94a3b8",
            maxWidth: 800,
            textAlign: "center",
            lineHeight: 1.4,
            display: "flex",
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 24, display: "flex" }}>⚡</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: "#64748b", display: "flex" }}>
            chargemath.com
          </span>
        </div>
      </div>
    ),
    { ...ogSize }
  );
}
