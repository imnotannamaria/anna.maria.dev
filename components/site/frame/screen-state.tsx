"use client"

import { ArrowCounterClockwiseIcon, HouseLineIcon } from "@phosphor-icons/react"
import { useEffect, type ReactNode } from "react"
import { Button } from "@/app/components/entrepta/button"
import { CatAngry, CatSleeping, CatWalking } from "@/components/site/abimaela/abimaela"
import { ScreenLink } from "@/components/site/screen-link"
import "./screen-state.css"

/**
 * The screens nobody plans to see: loading, not found, an error, and a page that was removed.
 * Each one is Abimaela doing something about it, in the middle of the page area.
 * `data-screen-state` is how the frame knows to give it the whole area and leave the footer
 * out: a page that is not there yet has no "where to next".
 */
function State({
  role,
  inline = false,
  children,
}: {
  role?: "status" | "alert"
  /** Under a page's own header, instead of alone in the page area: the footer stays. */
  inline?: boolean
  children: ReactNode
}) {
  return (
    <div
      className="st-state"
      data-screen-state={inline ? undefined : true}
      data-inline={inline || undefined}
      role={role}
    >
      {children}
    </div>
  )
}

const home = (
  <ScreenLink to="home" className="st-state-link focus-ring text-mono-sm font-mono">
    <HouseLineIcon aria-hidden size={14} weight="bold" />
    take me home
  </ScreenLink>
)

/** She walks a dashed line back and forth while a page that reads the database waits. */
export function ScreenLoading() {
  return (
    <State role="status">
      <div className="st-state-track">
        <span className="st-state-walker">
          <CatWalking height={84} />
        </span>
      </div>
      <p className="text-mono-sm font-mono text-[var(--fg-muted)]">she is fetching it</p>
    </State>
  )
}

/** An address with nothing at it. */
export function ScreenNotFound() {
  return (
    <State>
      <div className="flex items-end gap-5">
        <CatAngry height={110} />
        <span aria-hidden className="st-state-slot text-display-md font-serif">
          404
        </span>
      </div>
      <h1 className="text-heading-lg font-serif text-[var(--fg-primary)]">
        She pushed this page off the table.
      </h1>
      <p className="text-body-md max-w-[44ch] text-center font-sans text-[var(--fg-secondary)]">
        Nothing lives at this address. It may have moved, or it never existed.
      </p>
      {home}
    </State>
  )
}

/** A page that broke. An empty page would read as "nothing here", which is a lie. */
export function ScreenError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[site] page failed", error)
  }, [error])

  return (
    <State role="alert">
      <CatAngry height={120} />
      <h1 className="text-heading-lg font-serif text-[var(--fg-primary)]">Something broke.</h1>
      <p className="text-body-md max-w-[44ch] text-center font-sans text-[var(--fg-secondary)]">
        It was not you. It might have been her.
      </p>
      <Button onClick={reset}>
        <ArrowCounterClockwiseIcon aria-hidden size={14} weight="bold" />
        try again
      </Button>
    </State>
  )
}

/** A page that existed before v3 and does not any more. */
export function ScreenRemoved({ name }: { name: string }) {
  return (
    <State>
      <CatSleeping height={110} />
      <h1 className="text-heading-lg font-serif text-[var(--fg-primary)]">
        {name} was retired in v3.
      </h1>
      <p className="text-body-md max-w-[44ch] text-center font-sans text-[var(--fg-secondary)]">
        She sleeps where it used to be. Everything that stayed is one click away.
      </p>
      {home}
    </State>
  )
}

/** A notice with her in it, for a state that is not one of the four above (a closed invite). */
export function ScreenNotice({
  mood,
  title,
  body,
  action,
  inline,
}: {
  mood: "angry" | "asleep"
  title: string
  body: string
  action?: ReactNode
  inline?: boolean
}) {
  return (
    <State inline={inline}>
      {mood === "angry" ? <CatAngry height={110} /> : <CatSleeping height={110} />}
      <h1 className="text-heading-lg font-serif text-[var(--fg-primary)]">{title}</h1>
      <p className="text-body-md max-w-[44ch] text-center font-sans text-[var(--fg-secondary)]">
        {body}
      </p>
      {action}
    </State>
  )
}
