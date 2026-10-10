import { UserIcon } from "@phosphor-icons/react/dist/ssr"
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
import { Bio } from "./bio"

async function Rings() {
  const state = await loadTodayActivity({
    tz: "America/Sao_Paulo",
    goals: { exerciseMinutes: 90 },
  })
  return (
    <Link
      href="https://wristkit-web.vercel.app/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="View wristkit"
      className="flex h-full flex-col"
    >
      <TodayActivityCard state={state} className="st-card flex-1 p-4 max-sm:p-4" />
    </Link>
  )
}

export function Person({ log }: { log: LogEntry[] | null }) {
  return (
    <article className="st-room st-person">
      <header className="st-me">
        <Image
          src="/images/avatar.png"
          alt="Anna Maria"
          width={280}
          height={280}
          sizes="280px"
          className="st-me-avatar"
        />
        <div className="flex flex-col justify-center gap-4">
          <h1 className="text-mono-sm flex items-center gap-2 font-mono tracking-[0.08em] text-[var(--fg-secondary)] uppercase">
            <UserIcon aria-hidden size={13} weight="bold" className="text-[var(--fg-brand)]" />
            anna, the person
          </h1>
          <Bio />
        </div>
        <CameraRoll />
      </header>

      <div className="st-bento">
        <Reveal index={0} className="st-area" style={{ gridArea: "list" }}>
          <Playlist />
        </Reveal>
        <Reveal index={1} className="st-area" style={{ gridArea: "rings" }}>
          <Suspense
            fallback={
              <TodayActivityCard state={{ kind: "loading" }} className="st-card p-4 max-sm:p-4" />
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
