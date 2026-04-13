import { ImageResponse } from "next/og"
import { type NextRequest } from "next/server"
import { readFile } from "node:fs/promises"
import path from "node:path"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get("title") ?? "Anna Maria"

  const fontData = await readFile(
    path.join(
      process.cwd(),
      "node_modules/@fontsource/space-mono/files/space-mono-latin-700-normal.woff",
    ),
  )

  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: "#0a0a0f",
        padding: "80px",
        position: "relative",
      }}
    >
      {/* subtle radial glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 70%)",
        }}
      />

      {/* logo mark */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 48,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={22}
            height={22}
            viewBox="0 0 256 256"
            fill="#6366f1"
          >
            <path d="M240,128v56a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V80H32v48a8,8,0,0,1-16,0V72a8,8,0,0,1,8-8H128a8,8,0,0,1,8,8V176h88V128a8,8,0,0,1,16,0Z" />
          </svg>
        </div>
        <span
          style={{
            fontFamily: "Space Mono",
            fontWeight: 700,
            fontSize: 16,
            color: "#8888aa",
            letterSpacing: "0.05em",
          }}
        >
          anna-maria-dev.vercel.app
        </span>
      </div>

      {/* title */}
      <div
        style={{
          fontFamily: "Space Mono",
          fontWeight: 700,
          fontSize: title.length > 40 ? 52 : 64,
          lineHeight: 1.15,
          color: "#f2f2f8",
          maxWidth: 900,
        }}
      >
        {title}
      </div>

      {/* bottom bar */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 80,
          right: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "Space Mono",
            fontSize: 14,
            color: "#4a4a6a",
          }}
        >
          Full-stack Software Engineer · Brazil
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#1e1b4b",
            border: "1px solid rgba(99,102,241,0.4)",
            borderRadius: 999,
            padding: "6px 14px",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#818cf8",
            }}
          />
          <span
            style={{
              fontFamily: "Space Mono",
              fontSize: 13,
              color: "#a5b4fc",
            }}
          >
            Open Source
          </span>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [{ name: "Space Mono", data: fontData, weight: 700 }],
    },
  )
}
