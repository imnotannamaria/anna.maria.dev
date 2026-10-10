"use client"

import { BackpackIcon } from "@phosphor-icons/react"
import Image, { type StaticImageData } from "next/image"
import { useState } from "react"
import { Tile } from "@/components/site/tile"
import airpods from "./objects/airpods.png"
import cup from "./objects/cup.png"
import mac from "./objects/mac.png"
import guitar from "./objects/guitar.png"
import "./things.css"

const THINGS: { name: string; tagline: string; img: StaticImageData }[] = [
  { name: "AirPods Pro 3", tagline: "practically my companions", img: airpods },
  { name: "Thermal cup", tagline: "coffee, usually", img: cup },
  { name: "MacBook Pro", tagline: "where most of this gets made", img: mac },
  { name: "Guitar", tagline: "badly, but happily", img: guitar },
]

export function Things() {
  const [active, setActive] = useState(0)
  const thing = THINGS[active]

  return (
    <Tile label="everyday things" icon={<BackpackIcon />}>
      <ul className="st-things">
        {THINGS.map((item, index) => (
          <li key={item.name}>
            <button
              type="button"
              className="st-thing focus-ring"
              aria-label={`${item.name}: ${item.tagline}`}
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
