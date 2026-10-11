import { useTranslations } from "next-intl"
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

export function Apps() {
  const t = useTranslations("professional")
  // what each app is for, in the page's language; its name is a brand and stays
  const apps: DockItem[] = APP_LIST.map((app) => ({
    name: app.name,
    what: t(`app.${app.name}`),
    icon: ICON[app.name],
  }))
  return (
    <Tile
      label={t("appsLabel")}
      icon={<AppWindowIcon />}
      note={t("inDock", { count: apps.length })}
      size="md"
    >
      <Dock items={apps} label={t("apps")} />
    </Tile>
  )
}
