import { ImageResponse } from "next/og"
import { type NextRequest } from "next/server"
import { readFile } from "node:fs/promises"
import path from "node:path"

export const runtime = "nodejs"

const WIDTH = 1200
const HEIGHT = 630

// The brand as hex: satori does not resolve custom properties, so these mirror the dark-mode
// tokens in app/entrepta.css.
const CANVAS = "#09090b"
const INK = "#fafafa"
const SECONDARY = "#a1a1aa"
const MUTED = "#8a8a92"
const LINE = "#3f3f46"
const BRAND_SOFT = "#9b8eff"

const ARROW =
  "M224.49,136.49l-72,72a12,12,0,0,1-17-17L187,140H40a12,12,0,0,1,0-24H187L135.51,64.48a12,12,0,0,1,17-17l72,72A12,12,0,0,1,224.49,136.49Z"

const icon = (d: string, size: number, color: string) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256">
    <path d={d} fill={color} />
  </svg>
)

/** The mark, from public/. Without it the card still renders, just without the cat. */
async function readMark(): Promise<string | null> {
  try {
    const bytes = await readFile(path.join(process.cwd(), "public/brand/mark.png"))
    return `data:image/png;base64,${bytes.toString("base64")}`
  } catch {
    return null
  }
}

/**
 * Two cards from one design, built from the site's own pieces: the dashed card, a page label,
 * the serif lede, the Front / Back / IA switcher, a hint pill, and the mark stuck
 * on with tape. With no `title` it is the site's cover; with a `title` (a post, a project) the
 * title takes the name's place.
 *
 * Satori reads woff and ttf, not woff2, which is why the fonts come from @fontsource instead of
 * from next/font. The paths stay literal so the build traces the files.
 */
export async function GET(req: NextRequest) {
  const title = new URL(req.url).searchParams.get("title")?.slice(0, 120)
  const [newsreader, newsreaderItalic, mono, monoMedium, mark] = await Promise.all([
    readFile(
      path.join(
        process.cwd(),
        "node_modules/@fontsource/newsreader/files/newsreader-latin-500-normal.woff",
      ),
    ),
    readFile(
      path.join(
        process.cwd(),
        "node_modules/@fontsource/newsreader/files/newsreader-latin-500-italic.woff",
      ),
    ),
    readFile(
      path.join(
        process.cwd(),
        "node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff",
      ),
    ),
    readFile(
      path.join(
        process.cwd(),
        "node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff",
      ),
    ),
    readMark(),
  ])

  const serif = { fontFamily: "Newsreader", fontWeight: 500 } as const
  const monoText = { fontFamily: "JetBrains Mono", fontWeight: 500 } as const

  const headline = title ? (
    <div
      style={{
        ...serif,
        display: "flex",
        fontSize: title.length > 48 ? 62 : 78,
        lineHeight: 1.08,
        letterSpacing: -2,
        color: INK,
        maxWidth: 690,
      }}
    >
      {title}
    </div>
  ) : (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      <div style={{ display: "flex", alignItems: "baseline" }}>
        <span style={{ ...serif, fontSize: 124, lineHeight: 1, letterSpacing: -4, color: INK }}>
          Anna
        </span>
        <span
          style={{
            ...serif,
            marginLeft: 26,
            fontStyle: "italic",
            fontSize: 124,
            lineHeight: 1,
            letterSpacing: -4,
            color: BRAND_SOFT,
          }}
        >
          Maria
        </span>
      </div>
      {/* the page lede: muted serif, with the words that matter in full ink */}
      <div
        style={{
          ...serif,
          display: "flex",
          flexDirection: "column",
          fontSize: 38,
          lineHeight: 1.3,
        }}
      >
        <div style={{ display: "flex" }}>
          <span style={{ color: MUTED }}>I build things&nbsp;</span>
          <span style={{ color: INK }}>end to end</span>
          <span style={{ color: MUTED }}>,</span>
        </div>
        <span style={{ color: MUTED }}>from the UI to shipping.</span>
      </div>
    </div>
  )

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        width: WIDTH,
        height: HEIGHT,
        background: CANVAS,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 55% 70% at 82% 42%, rgba(124,107,255,0.20) 0%, transparent 70%)",
        }}
      />

      {/* the card: dashed and unfilled, like every card on the site */}
      <div
        style={{
          position: "absolute",
          top: 28,
          right: 28,
          bottom: 28,
          left: 28,
          border: `2px dashed ${LINE}`,
          borderRadius: 28,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: 780,
          padding: "80px 0 76px 84px",
        }}
      >
        {/* a page label, in small caps */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ ...monoText, fontSize: 21, letterSpacing: 3, color: SECONDARY }}>
            {title ? "ANNA MARIA" : "SOFTWARE ENGINEER"}
          </span>
          <span style={{ ...monoText, fontSize: 21, letterSpacing: 3, color: MUTED }}>
            {title ? "· ANNAMARIA.APP" : "· PERNAMBUCO, BRAZIL"}
          </span>
        </div>

        {headline}

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* the switcher at the bottom of the site */}
          <div
            style={{
              display: "flex",
              padding: 5,
              border: `2px solid ${LINE}`,
              borderRadius: 999,
              background: "#0e0e10",
            }}
          >
            {["Front", "Back", "IA"].map((side, index) => (
              <span
                key={side}
                style={{
                  ...monoText,
                  padding: "7px 22px",
                  borderRadius: 999,
                  fontSize: 19,
                  color: index === 0 ? INK : MUTED,
                  background: index === 0 ? "#27272a" : "transparent",
                }}
              >
                {side}
              </span>
            ))}
          </div>
          {/* a hint pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 20px 10px 16px",
              border: `2px dashed rgba(124,107,255,0.6)`,
              borderRadius: 999,
            }}
          >
            {icon(ARROW, 18, BRAND_SOFT)}
            <span style={{ ...monoText, fontWeight: 400, fontSize: 19, color: SECONDARY }}>
              annamaria.app
            </span>
          </div>
        </div>
      </div>

      {/* the mark, a sticker held to the card with a strip of tape */}
      {mark ? (
        <div
          style={{
            position: "absolute",
            top: 168,
            right: 100,
            display: "flex",
            width: 300,
            height: 300,
            padding: 10,
            background: "#ffffff",
            borderRadius: 70,
            transform: "rotate(5deg)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- satori, not the DOM */}
          <img src={mark} alt="" width={280} height={280} style={{ borderRadius: 60 }} />
        </div>
      ) : null}
      {mark ? (
        <div
          style={{
            position: "absolute",
            top: 146,
            right: 178,
            width: 150,
            height: 40,
            background: "rgba(155,142,255,0.62)",
            transform: "rotate(-3deg)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
          }}
        />
      ) : null}
    </div>,
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: "Newsreader", data: newsreader, weight: 500, style: "normal" },
        { name: "Newsreader", data: newsreaderItalic, weight: 500, style: "italic" },
        { name: "JetBrains Mono", data: mono, weight: 400, style: "normal" },
        { name: "JetBrains Mono", data: monoMedium, weight: 500, style: "normal" },
      ],
    },
  )
}
