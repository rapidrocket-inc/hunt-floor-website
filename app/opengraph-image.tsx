import { ImageResponse } from "next/og";
import { SITE_NAME, PUBLISHER } from "@/lib/seo";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "HuntFloor — The sales floor, run as a market.";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 84px",
          background: "#070c0a",
          borderTop: "8px solid #10b981",
          color: "#f2f5f4",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 14,
              background: "#6ee7b7",
            }}
          />
          <div
            style={{
              fontSize: 22,
              letterSpacing: 6,
              color: "#6ee7b7",
              textTransform: "uppercase",
            }}
          >
            The sales floor, run as a market
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 82, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
            Reps buy the leads they work.
          </div>
          <div style={{ fontSize: 34, color: "#c4ccc8", lineHeight: 1.3 }}>
            A monthly lead budget per rep. AI routing. A P&amp;L for everyone —
            on top of your CRM and ad accounts.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 26,
          }}
        >
          <div style={{ display: "flex", fontWeight: 700, letterSpacing: 2 }}>
            {SITE_NAME.toUpperCase()}
          </div>
          <div style={{ display: "flex", color: "#98a19c" }}>
            Built by {PUBLISHER.name}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
