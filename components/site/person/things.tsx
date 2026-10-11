"use client"

import { useTranslations } from "next-intl"
import { BackpackIcon } from "@phosphor-icons/react"
import Image, { type StaticImageData } from "next/image"
import { useState } from "react"
import { Tile } from "@/components/site/tile"
import airpods from "@/components/site/person/objects/airpods.png"
import cup from "@/components/site/person/objects/cup.png"
import mac from "@/components/site/person/objects/mac.png"
import guitar from "@/components/site/person/objects/guitar.png"
import "./things.css"

/** `id` is the key of the thing's line in the messages. A brand's name stays as it is. */
const THINGS: { id: "airpods" | "cup" | "mac" | "guitar"; brand?: string; img: StaticImageData }[] =
  [
    { id: "airpods", brand: "AirPods Pro 3", img: airpods },
    { id: "cup", img: cup },
    { id: "mac", brand: "MacBook Pro", img: mac },
    { id: "guitar", img: guitar },
  ]

export function Things() {
  const [active, setActive] = useState(0)
  const t = useTranslations("person.things")
  const things = THINGS.map((item) => ({
    ...item,
    name: item.brand ?? t(item.id === "cup" ? "cupName" : "guitarName"),
    tagline: t(item.id),
  }))
  const thing = things[active]

  return (
    <Tile label={t("label")} icon={<BackpackIcon />}>
      <ul className="st-things">
        {things.map((item, index) => (
          <li key={item.name}>
            <button
              type="button"
              className="st-thing focus-ring"
              aria-label={t("aria", { name: item.name, tagline: item.tagline })}
              aria-pressed={index === active}
              onPointerEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
            >
              <span className="st-thing-img">
                <Image src={item.img} alt="" fill sizes="180px" />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <p key={thing.name} className="st-enter text-mono-sm mt-auto min-w-0 truncate font-mono">
        <span className="text-[var(--fg-primary)]">{thing.name}</span>
        <span className="ml-2.5 text-[var(--fg-muted)]">{thing.tagline}</span>
      </p>
    </Tile>
  )
}
