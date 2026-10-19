"use client"

import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { POLAROID } from "@/components/site/polaroid"
import { Tip } from "@/components/ui/tip"
import { motion, useReducedMotion } from "motion/react"
import Image, { type StaticImageData } from "next/image"
import { useState } from "react"
import selfie from "@/components/site/person/photos/01-selfie.jpg"
import abimaela from "@/components/site/person/photos/02-abimaela.jpg"
import palms from "@/components/site/person/photos/03-palm-trees.jpg"
import lunch from "@/components/site/person/photos/04-lunch.jpg"
import glasses from "@/components/site/person/photos/05-glasses.jpg"
import burger from "@/components/site/person/photos/06-burger.jpg"
import snout from "@/components/site/person/photos/07-abimaela-close.jpg"
import bed from "@/components/site/person/photos/08-abimaela-bed.jpg"
import desk from "@/components/site/person/photos/09-selfie-desk.jpg"
import little from "@/components/site/person/photos/10-little-me.jpg"
import "./camera-roll.css"

/**
 * Three piles: me, food and Abimaela. Each photo carries the key of its description in the
 * messages.
 */
export const ROLLS = {
  anna: [
    { src: selfie, alt: "selfie" },
    { src: desk, alt: "desk" },
    { src: palms, alt: "palms" },
    { src: little, alt: "little" },
    { src: glasses, alt: "glasses" },
  ],
  food: [
    { src: lunch, alt: "lunch" },
    { src: burger, alt: "burger" },
  ],
  abimaela: [
    { src: abimaela, alt: "abimaela" },
    { src: bed, alt: "bed" },
    { src: snout, alt: "snout" },
  ],
} as const satisfies Record<string, { src: StaticImageData; alt: string }[]>

type Photo = (typeof ROLLS)[keyof typeof ROLLS][number]

const TILTS = [-7, 5, -3, 8, -5, 6, -4]
const IN_PILE = 4

export function CameraRoll({ roll }: { roll: keyof typeof ROLLS }) {
  const photos: readonly Photo[] = ROLLS[roll]
  const [queue, setQueue] = useState(() => photos.map((_, index) => index))
  const reduce = useReducedMotion()
  const t = useTranslations("person")

  return (
    <div className="st-roll">
      <Tip label={t(`rolls.${roll}`)}>
        <button
          type="button"
          aria-label={t("roll", {
            roll: t(`rolls.${roll}`),
            alt: t(`photos.${photos[queue[0]].alt}`),
            n: queue[0] + 1,
            total: queue.length,
          })}
          className="focus-ring relative h-[156px] w-[124px] cursor-pointer rounded-[4px]"
          onClick={() => setQueue(([first, ...rest]) => [...rest, first])}
        >
          {queue.slice(0, IN_PILE).map((n, position) => (
            <motion.span
              key={n}
              className={cn(POLAROID, "absolute inset-0")}
              initial={false}
              animate={{
                rotate: position === 0 ? -2 : TILTS[n % TILTS.length],
                x: position * 7,
                y: position * -4,
                scale: 1 - position * 0.03,
                zIndex: IN_PILE - position,
              }}
              transition={
                reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 22 }
              }
            >
              <Image src={photos[n].src} alt="" fill sizes="140px" className="object-cover" />
            </motion.span>
          ))}
        </button>
      </Tip>
    </div>
  )
}
