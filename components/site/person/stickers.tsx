"use client"

import { StickerIcon } from "@phosphor-icons/react"
import { motion, useMotionValue } from "motion/react"
import Image, { type StaticImageData } from "next/image"
import { useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react"
import { Tip } from "@/components/ui/tip"
import { STICKER } from "@/components/site/sticker"
import { Tile } from "@/components/site/tile"
import bosco from "@/components/site/person/stickers/bosco.png"
import cherry from "@/components/site/person/stickers/cherry.png"
import dany from "@/components/site/person/stickers/dany.png"
import galadriel from "@/components/site/person/stickers/galadriel.png"
import { Flag } from "./flag"
import "./stickers.css"

const cutout = (src: StaticImageData, width: number) => (
  <Image src={src} alt="" width={width} sizes={`${width}px`} draggable={false} />
)

type Sticker = {
  id: string

  caption: string
  art: ReactNode

  diecut?: boolean
  x: string
  y: string
  tilt: number
}

const STICKERS: Sticker[] = [
  {
    id: "pe",
    caption: 'Pernambuco, my "country"',
    art: <Flag className="w-[104px]" />,
    x: "4%",
    y: "4%",
    tilt: -6,
  },
  {
    id: "galadriel",
    caption: "Galadriel",
    art: cutout(galadriel, 118),
    diecut: true,
    x: "56%",
    y: "2%",
    tilt: 5,
  },
  {
    id: "dany",
    caption: "Daenerys Targaryen, Queen of the Seven Kingdoms",
    art: cutout(dany, 118),
    diecut: true,
    x: "30%",
    y: "30%",
    tilt: -3,
  },
  {
    id: "bosco",
    caption: "Bosco, from Drag Race",
    art: cutout(bosco, 118),
    diecut: true,
    x: "2%",
    y: "56%",
    tilt: 4,
  },
  {
    id: "cherry",
    caption: "Cheryl Blossom",
    art: cutout(cherry, 118),
    diecut: true,
    x: "60%",
    y: "54%",
    tilt: -5,
  },
]

const STEP = 16

function Sticker({
  caption,
  diecut,
  children,
  bounds,
  front,
  onGrab,
  x: left,
  y: top,
  tilt,
}: {
  caption: string
  diecut?: boolean
  children: ReactNode
  bounds: RefObject<HTMLDivElement | null>
  front: number
  onGrab: () => void
  x: string
  y: string
  tilt: number
}) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const [inHand, setInHand] = useState(false)

  return (
    <Tip label={caption}>
      <motion.button
        type="button"
        aria-label={`Sticker: ${caption}. Drag it, or use the arrow keys.`}
        drag
        dragConstraints={bounds}
        dragMomentum={false}
        dragElastic={0}
        data-in-hand={inHand || undefined}
        onDragStart={() => setInHand(true)}
        onDragEnd={() => setInHand(false)}
        onPointerDown={onGrab}
        onFocus={onGrab}
        onKeyDown={(event) => {
          const steps: Record<string, [number, number]> = {
            ArrowLeft: [-STEP, 0],
            ArrowRight: [STEP, 0],
            ArrowUp: [0, -STEP],
            ArrowDown: [0, STEP],
          }
          const step = steps[event.key]
          if (!step) return
          event.preventDefault()
          x.set(x.get() + step[0])
          y.set(y.get() + step[1])
        }}
        className="st-grab focus-ring absolute cursor-grab touch-none active:cursor-grabbing"
        style={{ x, y, left, top, zIndex: front }}
      >
        <span
          className={STICKER}
          data-diecut={diecut || undefined}
          style={{ "--tilt": `${tilt}deg` } as CSSProperties}
        >
          {children}
        </span>
      </motion.button>
    </Tip>
  )
}

export function Stickers() {
  const stage = useRef<HTMLDivElement>(null)
  const [order, setOrder] = useState<Record<string, number>>({})
  const topmost = useRef(1)

  return (
    <Tile label="stickers" icon={<StickerIcon />} note="drag them">
      <div ref={stage} className="relative min-h-[320px] flex-1">
        {STICKERS.map((item) => (
          <Sticker
            key={item.id}
            caption={item.caption}
            diecut={item.diecut}
            bounds={stage}
            front={order[item.id] ?? 1}
            x={item.x}
            y={item.y}
            tilt={item.tilt}
            onGrab={() => {
              topmost.current += 1
              const z = topmost.current
              setOrder((before) => ({ ...before, [item.id]: z }))
            }}
          >
            {item.art}
          </Sticker>
        ))}
      </div>
    </Tile>
  )
}
