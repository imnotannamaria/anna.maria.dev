import { HandPalmIcon, HourglassIcon, MoonIcon, RulerIcon, ShieldIcon } from "@phosphor-icons/react"
import type { ReactElement } from "react"
import { Cat, CatAngry, CatSleeping } from "@/components/site/abimaela/abimaela"
import { Tile } from "@/components/site/tile"
import { MAX_QUESTION, MIN_GAP_SECONDS, PER_VISITOR } from "@/lib/ai/limits"

/** The moments the chat says no, each with Abimaela in the mood for it. */
export type NoticeKind = "budget" | "visitor" | "slow" | "scope" | "blocked" | "long"

const NOTICES: Record<
  NoticeKind,
  {
    label: string
    icon: ReactElement
    cat: "angry" | "asleep" | "sitting"
    title: string
    body: string
  }
> = {
  budget: {
    label: "out of tokens",
    icon: <MoonIcon />,
    cat: "asleep",
    title: "Anna cut me off.",
    body: "You all spent today's tokens, and she pays for them. The model is back tomorrow. Until then I answer from my notes.",
  },
  visitor: {
    label: "daily limit",
    icon: <MoonIcon />,
    cat: "asleep",
    title: `That was your ${PER_VISITOR} for today.`,
    body: "The model is done with you until tomorrow. Nothing personal. My notes still work, and they cost Anna nothing.",
  },
  slow: {
    label: "slow down",
    icon: <HourglassIcon />,
    cat: "sitting",
    title: "One at a time.",
    body: `I am a cat, not a server farm. Give me ${MIN_GAP_SECONDS} seconds between questions.`,
  },
  long: {
    label: "too long",
    icon: <RulerIcon />,
    cat: "sitting",
    title: "That is a letter, not a question.",
    body: `${MAX_QUESTION} characters at most. Say it shorter and I will read it properly.`,
  },
  scope: {
    label: "off topic",
    icon: <HandPalmIcon />,
    cat: "angry",
    title: "Nice try.",
    body: "I have one subject and it is Anna. No code, no homework, no recipes, no translations. Ask me about her and I am all yours.",
  },
  blocked: {
    label: "not happening",
    icon: <ShieldIcon />,
    cat: "angry",
    title: "I saw that.",
    body: "My rules are not up for discussion, and neither is who I am. Ask me about Anna instead.",
  },
}

export function ChatNotice({ kind }: { kind: NoticeKind }) {
  const { label, icon, cat, title, body } = NOTICES[kind]
  return (
    <Tile label={label} icon={icon} className="st-enter st-ia-notice">
      <div className="st-ia-notice-row">
        <span aria-hidden className="st-ia-notice-cat">
          {cat === "angry" ? (
            <CatAngry height={72} />
          ) : cat === "asleep" ? (
            <CatSleeping height={72} />
          ) : (
            <Cat height={64} />
          )}
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-heading-md m-0 font-serif text-[var(--fg-primary)]">{title}</p>
          <p className="text-body-md m-0 font-sans text-[var(--fg-secondary)]">{body}</p>
        </div>
      </div>
    </Tile>
  )
}
