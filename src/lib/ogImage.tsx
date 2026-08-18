import { ImageResponse } from "next/og";

export const OG_IMAGE_SIZE = { width: 1200, height: 630 };
export const OG_IMAGE_ALT = "Brain Freeze - Intelligent Asynchronous Research";

/** Shared render used by both opengraph-image.tsx and twitter-image.tsx. */
export function renderOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: "#06070a",
          color: "#eef1f6",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 1, background: "#a9c4ff" }} />
          <span
            style={{
              fontSize: 14,
              letterSpacing: 6,
              color: "#a9c4ff",
              textTransform: "uppercase",
            }}
          >
            Cryogenic Research Instrument
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.02 }}>
          <span style={{ fontSize: 108, fontWeight: 800, letterSpacing: -3 }}>BRAIN</span>
          <span style={{ fontSize: 108, fontWeight: 800, letterSpacing: -3 }}>FREEZE</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: "1px solid rgba(238,241,246,0.2)",
            paddingTop: 24,
          }}
        >
          <span style={{ fontSize: 22, color: "#98a1b0", maxWidth: 760 }}>
            Three AI agents research in parallel. One structured document. Zero waiting.
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#ff4a1c",
              }}
            />
            <span style={{ fontSize: 13, letterSpacing: 2, color: "#98a1b0" }}>
              STATUS: NOMINAL
            </span>
          </div>
        </div>
      </div>
    ),
    { ...OG_IMAGE_SIZE }
  );
}