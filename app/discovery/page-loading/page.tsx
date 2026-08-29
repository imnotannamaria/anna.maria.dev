"use client"

/**
 * A harness for `PageLoading`, the screen every non-static route now shows while it waits.
 *
 * Throwaway — delete the folder once the copy is settled. It exists because the interesting
 * half of this component only happens after 2.2 seconds, which no healthy request ever reaches,
 * so there is otherwise no way to look at it.
 *
 * **replay** re-mounts it, restarting the CSS. Quick to compare copy, but it is a simulation:
 * React is already hydrated here, so it cannot show the failure mode a loading screen actually
 * has.
 *
 * **open live** navigates to a route whose `page.tsx` sits on an `await` for seven seconds with
 * a real `loading.tsx` beside it. That is the honest test — a client navigation, Next's own
 * Suspense boundary, the screen painting before any JavaScript here is involved, and long
 * enough that all three slow lines arrive.
 */

import { useState } from "react"
import Link from "next/link"
import { ArrowClockwiseIcon, ArrowSquareOutIcon } from "@phosphor-icons/react"
import { PageLoading } from "@/components/chrome/page-loading"
import { CONTEXTS, type ContextKey } from "./contexts"

const KEYS = Object.keys(CONTEXTS) as ContextKey[]

export default function PageLoadingHarness() {
  const [key, setKey] = useState<ContextKey>("log")
  const [run, setRun] = useState(0)
  const ctx = CONTEXTS[key]

  return (
    <div className="mx-auto w-full max-w-[900px] px-5 py-12 sm:px-8">
      <div className="text-mono-sm mb-3 font-mono" style={{ color: "var(--fg-muted)" }}>
        <span style={{ color: "var(--fg-brand)" }}>$</span> discovery --loading
      </div>
      <h1
        className="text-display-md m-0 font-serif leading-none font-normal tracking-[-0.02em]"
        style={{ color: "var(--fg-primary)" }}
      >
        The loading screen
      </h1>
      <p
        className="text-body-md mt-4 max-w-[64ch] font-sans"
        style={{ color: "var(--fg-secondary)" }}
      >
        The prompt lands in under a second. The three lines under it only appear after 2.2s, so on
        any reasonable connection you never see them — the delay on a CSS animation is the
        measurement, and a fallback that gets unmounted never reaches it.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {KEYS.map((k) => {
          const on = k === key
          return (
            <button
              key={k}
              type="button"
              onClick={() => {
                setKey(k)
                setRun((n) => n + 1)
              }}
              aria-pressed={on}
              className="text-mono-sm h-7 cursor-pointer rounded-md border px-3 font-mono transition-colors"
              style={
                on
                  ? {
                      borderColor: "var(--fg-brand)",
                      color: "var(--fg-brand-on-tint)",
                      background: "var(--bg-surface-brand)",
                    }
                  : {
                      borderColor: "var(--border-subtle)",
                      color: "var(--fg-muted)",
                      background: "transparent",
                    }
              }
            >
              {k}
            </button>
          )
        })}

        <span className="flex-1" />

        <button
          type="button"
          onClick={() => setRun((n) => n + 1)}
          className="text-mono-sm inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 font-mono"
          style={{ borderColor: "var(--border-subtle)", color: "var(--fg-secondary)" }}
        >
          <ArrowClockwiseIcon size={12} aria-hidden />
          replay
        </button>
        <Link
          href={`/discovery/page-loading/live/${key}`}
          className="text-mono-sm inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 font-mono"
          style={{ borderColor: "var(--border-brand)", color: "var(--fg-brand)" }}
        >
          <ArrowSquareOutIcon size={12} aria-hidden />
          open live
        </Link>
      </div>

      <div
        className="mt-6 flex rounded-[var(--radius-lg)] border"
        style={{ borderColor: "var(--border-subtle)", background: "var(--bg-canvas)" }}
      >
        {/* Re-mount on `run`, never a state reset inside an effect — the lesson the outline
            rail taught: an effect that resets what it depends on runs forever. */}
        <PageLoading key={`${key}-${run}`} {...ctx} />
      </div>
    </div>
  )
}
