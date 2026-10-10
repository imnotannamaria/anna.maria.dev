import { AppWindowIcon } from "@phosphor-icons/react/dist/ssr"
import Image, { type StaticImageData } from "next/image"
import type { ReactNode } from "react"
import { Tile } from "../tile"
import { APP_LIST, type AppName } from "./app-list"
import chatgpt from "./apps/chatgpt.png"
import chrome from "./apps/chrome.png"
import claude from "./apps/claude.png"
import cursor from "./apps/cursor.png"
import notion from "./apps/notion.png"
import spotify from "./apps/spotify.png"
import warp from "./apps/warp.png"
import { Dock, Plate, type DockItem } from "./dock"
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
