import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import path from "node:path"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default async function Icon() {
  const fontData = await readFile(
    path.join(
      process.cwd(),
      "node_modules/@fontsource/space-mono/files/space-mono-latin-700-normal.woff",
    ),
  )

  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FFFFFF",
      }}
    >
      <span
        style={{
          fontFamily: "Space Mono",
          fontWeight: 700,
          fontSize: 15,
          lineHeight: 1,
          color: "#6366f1",
          letterSpacing: "-0.5px",
        }}
      >
        am
      </span>
    </div>,
    {
      ...size,
      fonts: [{ name: "Space Mono", data: fontData, weight: 700 }],
    },
  )
}
