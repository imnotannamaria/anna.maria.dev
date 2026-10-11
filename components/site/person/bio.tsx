"use client"

import { useTranslations } from "next-intl"
import Image from "next/image"
import type { ReactNode } from "react"
import { Cat, pet } from "@/components/site/abimaela/abimaela"
import bosco from "@/components/site/person/stickers/bosco.png"
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
  const t = useTranslations("person")
  return (
    <Lede as="div" className="st-lede-person">
      <p>
        {t.rich("bio1", {
          anna: (word) => (
            <Word
              pop={
                // eslint-disable-next-line @next/next/no-img-element
                <img src="/images/avatar.png" alt="" className="st-portrait" loading="lazy" />
              }
            >
              {word}
            </Word>
          ),
          pe: (word) => <Word pop={<Flag className={`${STICKER} w-[64px]`} />}>{word}</Word>,
          beach: (word) => <Word pop={<Emoji>🌊</Emoji>}>{word}</Word>,
        })}
      </p>
      <p>
        {t.rich("bio2", {
          gym: (word) => <Word pop={WEIGHT}>{word}</Word>,
          horror: (word) => <Word pop={<Emoji>👻</Emoji>}>{word}</Word>,
          drag: (word) => (
            <Word
              pop={
                <span className={STICKER} data-diecut>
                  <Image src={bosco} alt="" width={72} sizes="72px" />
                </span>
              }
            >
              {word}
            </Word>
          ),
        })}
      </p>
      <p>
        {t.rich("bio3", {
          instruments: (word) => <Word pop={<Emoji>🎸</Emoji>}>{word}</Word>,
          music: (word) => <Word pop={<Emoji>🎧</Emoji>}>{word}</Word>,
          abi: (word) => (
            <Word pop={<Cat height={64} />} onEnter={() => pet.notify("meow")}>
              {word}
            </Word>
          ),
        })}
      </p>
    </Lede>
  )
}
