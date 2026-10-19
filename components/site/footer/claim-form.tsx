"use client"

import { PaperPlaneTiltIcon } from "@phosphor-icons/react"
import { useTranslations } from "next-intl"
import { useRef, useState, type FormEvent } from "react"
import { Button } from "@/app/components/entrepta/button"
import { Input } from "@/app/components/entrepta/input"
import { RequiredMark } from "@/components/site/required-mark"
import { playSoundEffect } from "@/components/ui/sound-feedback"
import { NAME_MAX, formatMs } from "@/lib/memory/constants"
import { boardName } from "@/lib/memory/validation"
import { API, type Finish, type Mine } from "./board"

/**
 * The form a round gets when its time makes the board. Its own file, loaded only then: it
 * validates with zod, and the footer is on every page (see lib/client-bundle.test.ts).
 */
const ISSUES = ["empty", "long", "chars", "link"] as const
type Issue = (typeof ISSUES)[number]
const isIssue = (value: unknown): value is Issue => ISSUES.includes(value as Issue)

type Phase = "writing" | "sending" | "sent"

export default function ClaimForm({
  id,
  result,
  onClaimed,
}: {
  id: string
  result: Finish
  onClaimed: (mine: Mine) => void
}) {
  const t = useTranslations("footer.claim")
  const [name, setName] = useState("")
  const [problem, setProblem] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>("writing")
  const input = useRef<HTMLInputElement>(null)

  const refuse = (words: string) => {
    setProblem(words)
    playSoundEffect("error")
    setPhase("writing")
    input.current?.focus()
  }
  const worded = (issue: unknown) =>
    t(`errors.${isIssue(issue) ? issue : "chars"}`, { max: NAME_MAX })

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (phase !== "writing") return
    // the schema is the only validation: the form is noValidate
    const parsed = boardName.safeParse(name)
    if (!parsed.success) return refuse(worded(parsed.error.issues[0]?.message))
    setPhase("sending")
    try {
      const res = await fetch(`${API}/claim`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, name: parsed.data }),
      })
      if (res.ok) {
        setPhase("sent")
        playSoundEffect("success")
        onClaimed({ id, name: parsed.data, ms: result.ms })
        return
      }
      const body = (await res.json().catch(() => null)) as { issue?: string } | null
      refuse(
        res.status === 400
          ? worded(body?.issue)
          : res.status === 404
            ? t("errors.expired")
            : res.status === 429
              ? t("errors.tooMany")
              : t("errors.down"),
      )
    } catch {
      refuse(t("errors.offline"))
    }
  }

  if (phase === "sent") {
    return (
      <p className="st-ft-claim text-mono-sm font-mono" role="status">
        {t("sent")}
      </p>
    )
  }

  return (
    <form className="st-ft-claim" noValidate onSubmit={submit}>
      <p className="text-mono-sm m-0 font-mono">
        <strong className="text-[var(--fg-brand-text)]">
          {result.rank === 1 ? t("first") : t("place", { rank: result.rank ?? 0 })}
        </strong>{" "}
        {t("ask", { time: formatMs(result.ms) })}
      </p>
      <div className="flex flex-wrap items-start gap-2">
        <label htmlFor="st-ft-name" className="sr-only">
          {t("label")}
        </label>
        <Input
          ref={input}
          id="st-ft-name"
          name="name"
          autoComplete="nickname"
          placeholder={t("placeholder")}
          className="min-w-0 flex-1"
          value={name}
          aria-required
          aria-invalid={problem ? true : undefined}
          aria-describedby="st-ft-name-note"
          onChange={(event) => {
            setName(event.target.value)
            setProblem(null)
          }}
        />
        <Button type="submit" loading={phase === "sending"}>
          <PaperPlaneTiltIcon aria-hidden size={14} weight="bold" />
          {t("send")}
        </Button>
      </div>
      <p
        id="st-ft-name-note"
        className="text-mono-xs m-0 font-mono"
        role={problem ? "alert" : undefined}
        style={{ color: problem ? "var(--status-error-fg)" : "var(--fg-muted)" }}
      >
        {problem ?? (
          <>
            <RequiredMark />
            {t("help", { max: NAME_MAX })}
          </>
        )}
      </p>
    </form>
  )
}
