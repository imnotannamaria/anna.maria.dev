"use client"

import {
  ArrowUpRightIcon,
  CardsIcon,
  FireIcon,
  PawPrintIcon,
  ShuffleIcon,
  TrophyIcon,
} from "@phosphor-icons/react"
import { useTranslations } from "next-intl"
import dynamic from "next/dynamic"
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react"
import { Cat, CatHappy } from "@/components/site/abimaela/abimaela"
import { Burst } from "@/components/site/click-burst"
import { Hint } from "@/components/site/hint"
import type { PageId } from "@/components/site/pages"
import { ScreenLink } from "@/components/site/screen-link"
import { playSoundEffect } from "@/components/ui/sound-feedback"
import { formatMs } from "@/lib/memory/constants"
import { Board, finishRound, startRound, useBoard, type Finish } from "./board"
import {
  BarButton,
  Chip,
  GameBar,
  Prize,
  formatClock,
  shuffle,
  stamp,
  useClock,
  usePlaces,
  useTimers,
} from "./parts"
import "./memory-game.css"

/**
 * The footer's game: a memory game of sixteen cards, eight pairs, the seven pages and Abimaela.
 *
 * - A pair found is a page found: the card turns into a link to it, and the page lights in the
 *   row underneath, which is there for anyone who would rather not play.
 * - Abimaela's pair is the power-up: she is happy, and shows every card for a moment.
 * - Pairs in a row make a streak. The arrows move between cards.
 * - The board: the server times the round, and a time in the ten best gets a form for a name,
 *   which shows once Anna approves it (board.tsx, lib/memory).
 */
type Face = PageId | "cat"

// zod comes with it, so it loads only for a round that makes the board
const ClaimForm = dynamic(() => import("./claim-form"))
const PEEK_MS = 1300

export function MemoryGame() {
  const t = useTranslations("footer.game")
  const places = usePlaces()
  const faces: Face[] = [...places.map((place) => place.id), "cat"]
  const root = useRef<HTMLDivElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  // a found card turns from a button into a link, a new element: the one that had the focus
  const refocus = useRef<number | null>(null)
  const [deck, setDeck] = useState<Face[]>(() => [...faces, ...faces])
  const [round, setRound] = useState(0)
  const [open, setOpen] = useState<number[]>([])
  const [found, setFound] = useState<Face[]>([])
  const [wrong, setWrong] = useState<number[]>([])
  const [just, setJust] = useState<Face | null>(null)
  const [peeking, setPeeking] = useState(false)
  const [moves, setMoves] = useState(0)
  const [streak, setStreak] = useState(0)
  const [start, setStart] = useState<number | null>(null)
  const [end, setEnd] = useState<number | null>(null)
  const [result, setResult] = useState<Finish | null>(null)
  const [claimId, setClaimId] = useState<string | null>(null)
  const seconds = useClock(start, end)
  const board = useBoard(root)
  // the round on the server: asked for on the first card, so its clock starts with yours
  const roundId = useRef<Promise<string | null> | null>(null)
  const { later, clear } = useTimers()

  // dealt in order on the server, shuffled once it is yours
  useEffect(() => {
    const deal = setTimeout(() => setDeck((cards) => shuffle(cards)))
    return () => {
      clearTimeout(deal)
      roundId.current = null
    }
  }, [])

  // the focus goes on to the link that took the button's place
  useEffect(() => {
    if (refocus.current === null) return
    grid.current?.querySelector<HTMLElement>(`[data-index="${refocus.current}"]`)?.focus()
    refocus.current = null
  }, [found])

  const flip = (index: number) => {
    if (peeking || end !== null || open.length === 2) return
    if (open.includes(index) || found.includes(deck[index])) return
    if (start === null) setStart(stamp())
    roundId.current ??= startRound()
    const next = [...open, index]
    setOpen(next)
    if (next.length < 2) return

    const total = moves + 1
    setMoves(total)
    const [a, b] = next
    if (deck[a] !== deck[b]) {
      later(() => setWrong([a, b]), 380)
      later(() => {
        setOpen([])
        setWrong([])
        setStreak(0)
      }, 900)
      return
    }
    const face = deck[a]
    later(() => {
      const focused = Number(document.activeElement?.getAttribute("data-index"))
      if (focused === a || focused === b) refocus.current = focused
      const all = [...found, face]
      setFound(all)
      setOpen([])
      setJust(face)
      setStreak((value) => value + 1)
      later(() => setJust((current) => (current === face ? null : current)), 1800)
      if (all.length === faces.length) {
        setEnd(stamp())
        playSoundEffect("success")
        void report(total)
      } else if (face === "cat") {
        setPeeking(true)
        later(() => setPeeking(false), PEEK_MS)
      }
    }, 300)
  }

  // the last pair: the server says the official time and where it lands
  const report = async (total: number) => {
    const pending = roundId.current
    const id = await pending
    if (!id || roundId.current !== pending) return
    const finished = await finishRound(id, total)
    if (roundId.current !== pending) return
    setResult(finished)
    if (finished?.qualifies) setClaimId(id)
  }

  const again = () => {
    clear()
    roundId.current = null
    setResult(null)
    setClaimId(null)
    setDeck(shuffle(deck))
    setRound((value) => value + 1)
    setOpen([])
    setFound([])
    setWrong([])
    setJust(null)
    setPeeking(false)
    setMoves(0)
    setStreak(0)
    setStart(null)
    setEnd(null)
  }

  // the arrows walk the grid, however many columns it has at this width
  const walk = (event: KeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -1,
      ArrowDown: 1,
    }
    if (!(event.key in steps)) return
    const grid = event.currentTarget
    const from = Number(
      (event.target as HTMLElement).closest("[data-index]")?.getAttribute("data-index"),
    )
    if (Number.isNaN(from)) return
    const columns = getComputedStyle(grid).gridTemplateColumns.split(" ").length
    const by = event.key === "ArrowUp" || event.key === "ArrowDown" ? columns : 1
    const target = grid.querySelector<HTMLElement>(`[data-index="${from + steps[event.key] * by}"]`)
    if (!target) return
    event.preventDefault()
    target.focus()
  }

  const done = end !== null
  const lastPlace = places.find((place) => place.id === found.at(-1)) ?? null

  const official = !result
    ? ""
    : result.qualifies
      ? t("officialIn", { time: formatMs(result.ms) })
      : result.rank
        ? t("officialRank", { time: formatMs(result.ms), rank: result.rank })
        : t("official", { time: formatMs(result.ms) })

  return (
    <div ref={root} className="st-ft-game">
      {/* what this is, before anyone has to guess: a game, and a board for the fastest */}
      <ul className="st-ft-hints">
        <Hint as="li" icon={<CardsIcon aria-hidden size={13} />}>
          <span>
            {t.rich("introGame", {
              b: (words) => <strong className="font-medium">{words}</strong>,
            })}
          </span>
        </Hint>
        <Hint as="li" icon={<TrophyIcon aria-hidden size={13} />}>
          <span>
            {t.rich("introBoard", {
              b: (words) => <strong className="font-medium">{words}</strong>,
            })}
          </span>
        </Hint>
      </ul>
      <div className="st-ft-layout">
        <div className="st-ft-game">
          <div className="relative">
            <div
              key={round}
              ref={grid}
              role="group"
              aria-label={t("label")}
              className="st-mg"
              data-won={done || undefined}
              data-peek={peeking || undefined}
              onKeyDown={walk}
            >
              {deck.map((face, index) => {
                const place = places.find((item) => item.id === face)
                const isFound = found.includes(face)
                const up = peeking || open.includes(index) || isFound
                const props = {
                  className: "st-mg-card focus-ring",
                  "data-index": index,
                  "data-up": up || undefined,
                  "data-found": isFound || undefined,
                  "data-just": just === face || undefined,
                  "data-wrong": wrong.includes(index) || undefined,
                }
                const inner = (
                  <span className="st-mg-inner" aria-hidden>
                    <span className="st-mg-back">
                      <PawPrintIcon size={22} weight="duotone" />
                    </span>
                    <span className="st-mg-face">
                      {place ? (
                        <>
                          <place.Icon size={24} weight={isFound ? "fill" : "duotone"} />
                          <span className="text-mono-xs w-full truncate px-1 text-center font-mono">
                            {place.short}
                          </span>
                          {isFound ? (
                            <ArrowUpRightIcon className="st-mg-go" size={12} weight="bold" />
                          ) : null}
                        </>
                      ) : just === "cat" ? (
                        <CatHappy height={46} />
                      ) : (
                        <Cat height={46} />
                      )}
                    </span>
                  </span>
                )
                // The slot holds the entrance and stays put. The card in it is a button until its
                // pair is found and a link after, which React mounts as a new element: with the
                // entrance on the card itself, every pair found dealt that card in again.
                return (
                  <span
                    key={index}
                    className="st-mg-slot"
                    style={{ "--i": index } as CSSProperties}
                  >
                    {/* the end of the round: the click's burst, from every card in a wave */}
                    {done ? <Burst scale={1.8} delay={index * 45} /> : null}
                    {isFound && place ? (
                      <ScreenLink
                        to={place.id}
                        data-sound="click"
                        aria-label={t("goTo", { page: place.label })}
                        {...props}
                      >
                        {inner}
                      </ScreenLink>
                    ) : (
                      <button
                        type="button"
                        aria-label={up ? (place?.label ?? t("cat")) : t("card", { n: index + 1 })}
                        onClick={() => flip(index)}
                        {...props}
                      >
                        {inner}
                      </button>
                    )}
                  </span>
                )
              })}
            </div>
          </div>

          <GameBar
            seconds={seconds}
            chips={
              <>
                <Chip icon={<CardsIcon aria-hidden size={14} />} label={t("moves")}>
                  {String(moves).padStart(3, "0")}
                </Chip>
                {streak >= 2 ? (
                  <Chip
                    tone="brand"
                    label={t("streak")}
                    icon={<FireIcon aria-hidden size={14} weight="fill" />}
                  >
                    x{streak}
                  </Chip>
                ) : null}
              </>
            }
          >
            <BarButton label={t("shuffle")} onClick={again}>
              <ShuffleIcon aria-hidden size={18} weight="bold" />
            </BarButton>
          </GameBar>

          <Prize place={!done && just && just !== "cat" ? lastPlace : null}>
            {done
              ? `${t("done", { pairs: faces.length, time: formatClock(seconds), moves })} ${official}`
              : peeking
                ? t("peeking")
                : just === "cat"
                  ? t("foundCat")
                  : just && lastPlace
                    ? t("found", { page: lastPlace.label })
                    : t("hint")}
          </Prize>
          {claimId && result?.qualifies ? (
            <ClaimForm
              key={claimId}
              id={claimId}
              result={result}
              onClaimed={(mine) => {
                board.claimed(mine)
                void board.load()
              }}
            />
          ) : null}
        </div>
        <Board rows={board.rows} mine={board.mine} />
      </div>
    </div>
  )
}
