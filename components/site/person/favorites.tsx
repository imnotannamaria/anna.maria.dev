"use client"

import { useTranslations } from "next-intl"
import { SmileyIcon } from "@phosphor-icons/react"
import Image, { type StaticImageData } from "next/image"
import { useReducedMotion } from "motion/react"
import { useState } from "react"
import { Tile } from "@/components/site/tile"
import nazareGif from "@/components/site/person/gifs/nazare-confusa.gif"
import nazare from "@/components/site/person/gifs/nazare-confusa.png"
import fineGif from "@/components/site/person/gifs/this-is-fine.gif"
import fine from "@/components/site/person/gifs/this-is-fine.png"
import "./favorites.css"

type EmojiKey = "salute" | "zany" | "peek" | "oops" | "brow" | "eyes"

/** `name` is the key of the emoji's spoken name in the messages. */
const EMOJIS: { emoji: string; name: EmojiKey; wide?: boolean }[] = [
  { emoji: "🫡", name: "salute" },
  { emoji: "🤪", name: "zany" },
  { emoji: "🫣", name: "peek" },
  { emoji: "🫢", name: "oops" },
  { emoji: "🤨", name: "brow" },

  {
    emoji: "\u{1F441}\u{FE0F}\u{1F444}\u{1F441}\u{FE0F}",
    name: "eyes",
    wide: true,
  },
]

const GIFS: {
  name: "nazare" | "fine"
  code: string
  stopped: StaticImageData
  playing: StaticImageData
}[] = [
  { name: "nazare", code: "nazareconfusa", stopped: nazare, playing: nazareGif },
  { name: "fine", code: "this-is-fine", stopped: fine, playing: fineGif },
]

function Gif({ name, code, stopped, playing }: (typeof GIFS)[number]) {
  const [player, setPlayer] = useState(false)
  const reduce = useReducedMotion()
  const t = useTranslations("person.favorites")
  return (
    <button
      type="button"
      className="st-gif focus-ring"
      aria-label={t("gif", { name: t(`gifs.${name}`) })}
      onPointerEnter={() => setPlayer(true)}
      onPointerLeave={() => setPlayer(false)}
      onFocus={() => setPlayer(true)}
      onBlur={() => setPlayer(false)}
    >
      <span className="st-gif-img">
        <Image
          src={player && reduce === false ? playing : stopped}
          alt=""
          fill
          sizes="64px"
          unoptimized
        />
      </span>
      <span aria-hidden className="text-mono-xs min-w-0 truncate font-mono">
        :{code}:
      </span>
    </button>
  )
}

export function Favorites() {
  const [picked, setPicked] = useState<Record<string, boolean>>({})

  const [flights, setFlights] = useState<Record<string, number>>({})
  const t = useTranslations("person.favorites")

  return (
    <Tile label={t("label")} icon={<SmileyIcon />}>
      <ul className="flex flex-wrap gap-1.5">
        {EMOJIS.map(({ emoji, name, wide }) => {
          const on = picked[emoji] ?? false
          return (
            <li key={emoji}>
              <button
                type="button"
                className="st-reaction focus-ring text-mono-xs font-mono"
                aria-label={t("reactions", { name: t(`emoji.${name}`), count: on ? 2 : 1 })}
                aria-pressed={on}
                onClick={() => {
                  setPicked((before) => ({ ...before, [emoji]: !on }))
                  if (!on) {
                    setFlights((before) => ({ ...before, [emoji]: (before[emoji] ?? 0) + 1 }))
                  }
                }}
              >
                <span aria-hidden className="st-reaction-emoji" data-wide={wide || undefined}>
                  {emoji}
                </span>
                <span aria-hidden className="tabular-nums">
                  {on ? 2 : 1}
                </span>
                {flights[emoji] ? (
                  <span key={flights[emoji]} aria-hidden className="st-reaction-flight">
                    {emoji}
                  </span>
                ) : null}
              </button>
            </li>
          )
        })}
      </ul>
      <ul className="st-gifs">
        {GIFS.map((gif) => (
          <li key={gif.name}>
            <Gif {...gif} />
          </li>
        ))}
      </ul>
    </Tile>
  )
}
