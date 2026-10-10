import { AppWindowIcon } from "@phosphor-icons/react/dist/ssr"
import Image, { type StaticImageData } from "next/image"
import type { ReactNode } from "react"
import { Tile } from "@/components/site/tile"
import { APP_LIST, type AppName } from "./app-list"
import chatgpt from "@/components/site/professional/apps/chatgpt.png"
import chrome from "@/components/site/professional/apps/chrome.png"
import claude from "@/components/site/professional/apps/claude.png"
import cursor from "@/components/site/professional/apps/cursor.png"
import notion from "@/components/site/professional/apps/notion.png"
import spotify from "@/components/site/professional/apps/spotify.png"
import warp from "@/components/site/professional/apps/warp.png"
import { Dock, type DockItem } from "@/components/site/dock"
import { Plate } from "@/components/site/plate"
import { CalendarMark, FigmaMark, SlackMark } from "./marks"

function Icon({ src }: { src: StaticImageData }) {
  return <Image src={src} alt="" width={52} height={52} sizes="64px" />
}

const ICON: Record<AppName, ReactNode> = {
  Warp: <Icon src={warp} />,
  Claude: <Icon src={claude} />,
  Codex: <Icon src={chatgpt} />,
  Cursor: <Icon src={cursor} />,
  Notion: <Icon src={notion} />,
  "Google Chrome": <Icon src={chrome} />,
  "Google Calendar": (
    <Plate>
      <CalendarMark />
    </Plate>
  ),
  Spotify: <Icon src={spotify} />,
  Slack: (
    <Plate>
      <SlackMark />
    </Plate>
  ),
  Figma: (
    <Plate tone="dark">
      <FigmaMark />
    </Plate>
  ),
}

const APPS: DockItem[] = APP_LIST.map((app) => ({ ...app, icon: ICON[app.name] }))

export function Apps() {
  return (
    <Tile label="apps" icon={<AppWindowIcon />} note={`${APPS.length} in the dock`} size="md">
      <Dock items={APPS} label="Apps" />
    </Tile>
  )
}
