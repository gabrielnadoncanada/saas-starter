import { ImageResponse } from "next/og";

import { docsSource } from "@/lib/docs/source";

export const runtime = "nodejs";
export const alt = "SaaS Starter documentation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateImageMetadata({
  params,
}: {
  params: { slug?: string[] };
}) {
  const page = docsSource.getPage(params.slug);
  return [
    {
      id: page?.data.title ?? "docs",
      alt: page?.data.title ?? "SaaS Starter docs",
      size,
      contentType,
    },
  ];
}

export default async function DocsOpenGraphImage({
  params,
}: {
  params: { slug?: string[] };
}) {
  const page = docsSource.getPage(params.slug);
  const title = page?.data.title ?? "Documentation";
  const description = page?.data.description ?? "SaaS Starter documentation";

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
            fontSize: "24px",
            color: "#a1a1a1",
            fontFamily: "monospace",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "#fafafa",
              borderRadius: "8px",
              display: "flex",
            }}
          />
          SaaS Starter / Docs
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              fontSize: "76px",
              lineHeight: 1.05,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              maxWidth: "1040px",
            }}
          >
            {title}
          </div>
          {description ? (
            <div
              style={{
                fontSize: "28px",
                color: "#a1a1a1",
                maxWidth: "960px",
                lineHeight: 1.4,
              }}
            >
              {description}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "20px",
            color: "#737373",
            fontFamily: "monospace",
          }}
        >
          saas-starter.dev/docs
        </div>
      </div>
    ),
    { ...size },
  );
}
