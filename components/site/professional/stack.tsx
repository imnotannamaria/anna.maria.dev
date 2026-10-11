"use client"

import { useTranslations } from "next-intl"
import { BrowsersIcon, HardDrivesIcon, SparkleIcon, StackIcon } from "@phosphor-icons/react"
import { Tile } from "@/components/site/tile"
import { TechStickers } from "@/components/site/tech-stickers"
import type { Group } from "./stack-data"

const PARTS = [
  { id: "front", title: "Front", Icon: BrowsersIcon, groups: ["frontend", "email · design"] },
  {
    id: "back",
    title: "Back",
    Icon: HardDrivesIcon,
    groups: ["backend", "databases", "devops · cloud", "testing · quality"],
  },
  { id: "ia", title: "IA", Icon: SparkleIcon, groups: ["ai / llm"] },
]

/** A group's id, as written in the data, to the key of its name in the messages. */
const GROUP_KEY = {
  languages: "languages",
  frontend: "frontend",
  backend: "backend",
  databases: "databases",
  "ai / llm": "ai",
  "devops · cloud": "devops",
  "testing · quality": "testing",
  "email · design": "email",
} as const

export function Stack({ groups }: { groups: Group[] }) {
  const t = useTranslations("professional")
  const groupName = (id: string) =>
    id in GROUP_KEY ? t(`groups.${GROUP_KEY[id as keyof typeof GROUP_KEY]}`) : id
  const languages = groups.find((group) => group.id === "languages")
  const total = groups.reduce((sum, group) => sum + group.techs.length, 0)

  return (
    <Tile
      label={t("stackLabel")}
      icon={<StackIcon />}
      note={t("tools", { count: total })}
      size="md"
    >
      {languages ? (
        <div className="st-sk-languages">
          <h3 className="text-mono-xs font-mono tracking-widest text-[var(--fg-muted)] uppercase">
            {t("writtenIn")}
          </h3>
          <TechStickers techs={languages.techs} center />
        </div>
      ) : null}

      <div className="st-sk-parts">
        {PARTS.map((part) => {
          const inPart = groups.filter((group) => part.groups.includes(group.id))
          const howMany = inPart.reduce((sum, group) => sum + group.techs.length, 0)
          return (
            <section key={part.id} className="st-sk-part">
              <h3 className="flex items-center gap-2">
                <part.Icon aria-hidden size={16} weight="bold" className="text-[var(--fg-brand)]" />
                <span className="text-heading-lg font-serif text-[var(--fg-primary)]">
                  {part.title}
                </span>
                <span className="text-mono-xs ml-auto font-mono text-[var(--fg-muted)]">
                  {howMany}
                </span>
              </h3>
              {inPart.map((group) => (
                <div key={group.id} className="flex flex-col gap-2">
                  <h4 className="text-mono-xs font-mono tracking-widest text-[var(--fg-muted)] uppercase">
                    {groupName(group.id)}
                  </h4>
                  <TechStickers techs={group.techs} />
                </div>
              ))}
            </section>
          )
        })}
      </div>
    </Tile>
  )
}
