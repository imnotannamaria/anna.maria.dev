"use client"

import Image from "next/image"
import type { ReactNode } from "react"
import { Cat, pet } from "../../abimaela/abimaela"
import bosco from "./stickers/bosco.png"
import { Lede } from "@/components/site/page-header"
import { STICKER } from "@/components/site/sticker"
import { Flag } from "./flag"
import "./bio.css"

/**
 * A word that shows something when hovered. What pops out is decoration and hidden from screen
 * readers, so the word is not a tab stop: a focus that announces nothing is worse than none.
 */
function Word({
  children,
  pop,
  onEnter,
}: {
  children: ReactNode
  pop: ReactNode
  onEnter?: () => void
}) {
  return (
    <span className="st-word" onPointerEnter={onEnter}>
      {children}
      <span aria-hidden className="st-word-pop">
        {pop}
      </span>
    </span>
  )
}

const Emoji = ({ children }: { children: string }) => <span className="st-emoji">{children}</span>

const WEIGHT = <Emoji>🏋️</Emoji>

export function Bio() {
  return (
    <Lede as="div" className="st-lede-person">
      <p>
        I&rsquo;m{" "}
        <Word
          pop={
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/images/avatar.png" alt="" className="st-portrait" loading="lazy" />
          }
        >
          Anna
        </Word>
        , from <Word pop={<Flag className={`${STICKER} w-[64px]`} />}>Pernambuco</Word>, and I live
        in Tamandaré, right by the <Word pop={<Emoji>🌊</Emoji>}>beach</Word>.
      </p>
      <p>
        The <Word pop={WEIGHT}>gym</Word>&nbsp;is my daily reset button, five times a week, pretty
        much non negotiable. I&rsquo;m a big fan of{" "}
        <Word pop={<Emoji>👻</Emoji>}>horror films</Word>, Mike Flanagan and{" "}
        <Word
          pop={
            <span className={STICKER} data-diecut>
              <Image src={bosco} alt="" width={72} sizes="72px" />
            </span>
          }
        >
          Drag Race
        </Word>
        .
      </p>
      <p>
        I play a few <Word pop={<Emoji>🎸</Emoji>}>instruments</Word>, all of them mediocrely, and I
        love every kind of <Word pop={<Emoji>🎧</Emoji>}>music</Word>, mostly pop. I also answer to
        <Word pop={<Cat height={64} />} onEnter={() => pet.notify("meow")}>
          Abimaela
        </Word>
        , the cat in the corner.
      </p>
    </Lede>
  )
}
