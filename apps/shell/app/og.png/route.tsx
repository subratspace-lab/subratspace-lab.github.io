import { ImageResponse } from "next/og";
import { metrics, profile } from "@skj/content";

const size = { width: 1200, height: 630 };

// A route handler (not the opengraph-image convention) so the static export writes a real
// og.png file; extensionless files get the wrong content type on hosts like GitHub Pages.
export const dynamic = "force-static";

export function GET() {
  const top = metrics.slice(0, 3);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#fafaf9",
          color: "#1c1917",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 26, letterSpacing: 4, textTransform: "uppercase", color: "#57534e", fontFamily: "sans-serif" }}>
            {`${profile.role} · ${profile.focus}`}
          </div>
          <div style={{ fontSize: 88, lineHeight: 1.05 }}>{profile.name}</div>
        </div>
        <div style={{ display: "flex", gap: 56 }}>
          {top.map((m) => (
            <div key={m.id} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 56, color: "#0f766e" }}>{m.display}</div>
              <div style={{ fontSize: 24, color: "#57534e", fontFamily: "sans-serif", maxWidth: 300 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
