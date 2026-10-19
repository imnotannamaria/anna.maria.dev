import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import { UserIcon } from "@phosphor-icons/react/dist/ssr"
import { Lede, PageLabel } from "@/components/site/page-header"
import { TILE_SURFACE } from "@/components/site/tile"
import { cn } from "@/lib/utils"
import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { Reveal } from "@/app/components/entrepta/reveal"
import { TodayActivityCard } from "@/components/wristkit/today-activity-card"
import { loadTodayActivity } from "@/components/wristkit/today-activity-card/load"
import type { LogEntry } from "@/lib/log/validation"
import { Stickers } from "./stickers"
import { Things } from "./things"
import { Shelf } from "./shelf"
import { Favorites } from "./favorites"
import { Playlist } from "./playlist"
import { CameraRoll } from "./camera-roll"
import { Weather } from "./weather"
import "./person.css"

async function Rings() {
  const t = await getTranslations("person")
  const state = await loadTodayActivity({
    tz: "America/Sao_Paulo",
    goals: { exerciseMinutes: 90 },
  })
  return (
    <Link
      href="https://wristkit-web.vercel.app/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("wristkit")}
      className="flex h-full flex-col"
    >
      <TodayActivityCard state={state} className={cn(TILE_SURFACE, "flex-1 p-4 max-sm:p-4")} />
    </Link>
  )
}

export function Person({ log }: { log: LogEntry[] | null }) {
  const t = useTranslations("person")
  return (
    <article className="st-room st-person">
      <header className="st-me">
        <Image
          src="/images/avatar.png"
          alt={t("avatarAlt")}
          width={280}
          height={280}
          sizes="280px"
          className="st-me-avatar"
        />
        <div className="flex flex-col justify-center gap-4">
          <PageLabel icon={<UserIcon aria-hidden size={13} weight="bold" />} label={t("label")} />
          {/* One sentence, on purpose: the page under it is the bio. */}
          <Lede>{t("bio")}</Lede>
        </div>
        <div className="st-rolls">
          <CameraRoll roll="anna" />
          <CameraRoll roll="food" />
          <CameraRoll roll="abimaela" />
        </div>
      </header>

      <div className="st-bento">
        <Reveal index={0} className="st-area" style={{ gridArea: "list" }}>
          <Playlist />
        </Reveal>
        <Reveal index={1} className="st-area" style={{ gridArea: "rings" }}>
          <Suspense
            fallback={
              <TodayActivityCard
                state={{ kind: "loading" }}
                className={cn(TILE_SURFACE, "p-4 max-sm:p-4")}
              />
            }
          >
            <Rings />
          </Suspense>
        </Reveal>
        <Reveal index={2} className="st-area" style={{ gridArea: "favorites" }}>
          <Favorites />
        </Reveal>
        <Reveal index={3} className="st-area" style={{ gridArea: "weather" }}>
          <Weather />
        </Reveal>
        <Reveal index={0} className="st-area" style={{ gridArea: "stickers" }}>
          <Stickers />
        </Reveal>

        <div className="st-area" style={{ gridArea: "shelf" }}>
          <Shelf entries={log} />
        </div>
        <Reveal index={1} className="st-area" style={{ gridArea: "things" }}>
          <Things />
        </Reveal>
      </div>
    </article>
  )
}
