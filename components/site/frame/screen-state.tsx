"use client"

import { ArrowCounterClockwiseIcon, HouseLineIcon } from "@phosphor-icons/react"
import { useTranslations } from "next-intl"
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

function Home() {
  const t = useTranslations("state")
  return (
    <ScreenLink to="home" className="st-state-link focus-ring text-mono-sm font-mono">
      <HouseLineIcon aria-hidden size={14} weight="bold" />
      {t("home")}
    </ScreenLink>
  )
}

/** She walks a dashed line back and forth while a page that reads the database waits. */
export function ScreenLoading() {
  const t = useTranslations("state")
  return (
    <State role="status">
      <div className="st-state-track">
        <span className="st-state-walker">
          <CatWalking height={84} />
        </span>
      </div>
      <p className="text-mono-sm font-mono text-[var(--fg-muted)]">{t("loading")}</p>
    </State>
  )
}

/** An address with nothing at it. */
export function ScreenNotFound() {
  const t = useTranslations("state")
  return (
    <State>
      <div className="flex items-end gap-5">
        <CatAngry height={110} />
        <span aria-hidden className="st-state-slot text-display-md font-serif">
          404
        </span>
      </div>
      <h1 className="text-heading-lg font-serif text-[var(--fg-primary)]">{t("notFoundTitle")}</h1>
      <p className="text-body-md max-w-[44ch] text-center font-sans text-[var(--fg-secondary)]">
        {t("notFoundBody")}
      </p>
      <Home />
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
  const t = useTranslations("state")
  useEffect(() => {
    console.error("[site] page failed", error)
  }, [error])

  return (
    <State role="alert">
      <CatAngry height={120} />
      <h1 className="text-heading-lg font-serif text-[var(--fg-primary)]">{t("errorTitle")}</h1>
      <p className="text-body-md max-w-[44ch] text-center font-sans text-[var(--fg-secondary)]">
        {t("errorBody")}
      </p>
      <Button onClick={reset}>
        <ArrowCounterClockwiseIcon aria-hidden size={14} weight="bold" />
        {t("retry")}
      </Button>
    </State>
  )
}

/** A page that existed before v3 and does not any more. */
export function ScreenRemoved({ name }: { name: string }) {
  const t = useTranslations("state")
  return (
    <State>
      <CatSleeping height={110} />
      <h1 className="text-heading-lg font-serif text-[var(--fg-primary)]">
        {t("removedTitle", { name })}
      </h1>
      <p className="text-body-md max-w-[44ch] text-center font-sans text-[var(--fg-secondary)]">
        {t("removedBody")}
      </p>
      <Home />
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
