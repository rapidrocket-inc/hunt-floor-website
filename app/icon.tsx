import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Emerald "HF" monogram favicon (also clears the default /favicon.ico 404).
// Replace with the official mark when available.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#10b981",
          color: "#04231a",
          fontSize: 17,
          fontWeight: 700,
          letterSpacing: -1,
        }}
      >
        HF
      </div>
    ),
    { ...size }
  );
}
