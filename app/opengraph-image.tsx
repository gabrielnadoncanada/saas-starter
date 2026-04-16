import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SaaS Starter — Auth, Billing, and Plan Gating Built In";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "radial-gradient(circle at 20% 10%, #1a1a1a 0%, #050505 60%)",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "28px",
            fontWeight: 600,
            letterSpacing: "-0.01em",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "#fafafa",
              borderRadius: "10px",
              display: "flex",
            }}
          />
          SaaS Starter
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              fontSize: "80px",
              lineHeight: 1.02,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              maxWidth: "960px",
            }}
          >
            Auth, Billing, and Plan Gating — Built In.
          </div>
          <div
            style={{
              fontSize: "28px",
              color: "#a1a1a1",
              maxWidth: "820px",
              lineHeight: 1.4,
            }}
          >
            The Next.js SaaS starter where billing actually controls your
            product. Buy once, own the code.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "20px",
            color: "#737373",
            fontFamily: "monospace",
          }}
        >
          <div style={{ display: "flex", gap: "32px" }}>
            <span>Next.js 16</span>
            <span>Stripe</span>
            <span>Better Auth</span>
            <span>Prisma</span>
          </div>
          <div>saas-starter.dev</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
