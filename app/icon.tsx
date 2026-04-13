import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default async function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FFFFFF",
        borderRadius: 8,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={20}
        height={20}
        viewBox="0 0 256 256"
        fill="#6366f1"
      >
        <path d="M240,128v56a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V80H32v48a8,8,0,0,1-16,0V72a8,8,0,0,1,8-8H128a8,8,0,0,1,8,8V176h88V128a8,8,0,0,1,16,0Z" />
      </svg>
    </div>,
    size,
  )
}
