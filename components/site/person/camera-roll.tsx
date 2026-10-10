"use client"

import { cn } from "@/lib/utils"
import { POLAROID } from "@/components/site/polaroid"
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
import "./camera-roll.css"

const PHOTOS: { src: StaticImageData; alt: string }[] = [
  { src: selfie, alt: "A selfie, in an Olivia Rodrigo t-shirt" },
  { src: abimaela, alt: "Abimaela, the cat, being petted" },
  { src: palms, alt: "Two people smiling under palm trees" },
  { src: lunch, alt: "A very full plate at lunch" },
  { src: glasses, alt: "A selfie with blue-light glasses" },
  { src: burger, alt: "A burger on a checkered paper" },
  { src: snout, alt: "Abimaela's nose, far too close to the camera" },
]

const TILTS = [-7, 5, -3, 8, -5, 6, -4]
const IN_PILE = 4

export function CameraRoll() {
  const [queue, setQueue] = useState(() => PHOTOS.map((_, index) => index))
  const reduce = useReducedMotion()

  return (
    <div className="st-roll">
      <button
        type="button"
        aria-label={`Camera roll. ${PHOTOS[queue[0]].alt}. Photo ${queue[0] + 1} of ${queue.length}; click for the next one.`}
        className="focus-ring relative h-[156px] w-[124px] cursor-pointer rounded-[4px]"
        onClick={() => setQueue(([first, ...rest]) => [...rest, first])}
      >
        {queue.slice(0, IN_PILE).map((n, position) => (
          <motion.span
            key={n}
            className={cn(POLAROID, "absolute inset-0")}
            initial={false}
            animate={{
              rotate: position === 0 ? -2 : TILTS[n],
              x: position * 7,
              y: position * -4,
              scale: 1 - position * 0.03,
              zIndex: IN_PILE - position,
            }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 22 }}
          >
            <Image src={PHOTOS[n].src} alt="" fill sizes="140px" className="object-cover" />
          </motion.span>
        ))}
      </button>
    </div>
  )
}
