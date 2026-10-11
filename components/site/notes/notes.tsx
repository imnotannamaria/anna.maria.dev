import type { Locale } from "@/lib/i18n/locales"
import { useLocale, useTranslations } from "next-intl"
import { NotePencilIcon } from "@phosphor-icons/react/dist/ssr"
import { Lede, PageLabel } from "@/components/site/page-header"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { getPostReadingStats, getPublishedPosts } from "@/lib/velite"
import { readDate, type Note } from "./note"
import { NoteSlips } from "./note-slips"
import "./notes.css"

function readOpening(slug: string, locale: Locale): string | undefined {
  const file = (...parts: string[]) => join(process.cwd(), "content", "blog", ...parts)
  // the translation when there is one, the English file otherwise
  const translated = file(locale, `${slug}.mdx`)
  try {
    const raw = readFileSync(
      locale !== "en" && existsSync(translated) ? translated : file(`${slug}.mdx`),
      "utf8",
    )
    const body = raw.replace(/^---[\s\S]*?---/, "")
    const paragraph = body
      .split(/\n\s*\n/)
      .map((excerpt) => excerpt.trim())
      .find((excerpt) => excerpt && !/^(#|```|<|import |export |[-*>|]|\d+\.)/.test(excerpt))
    return paragraph
      ?.replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[*_`]/g, "")
      .replace(/\s+/g, " ")
  } catch {
    return undefined
  }
}

export function Notes() {
  const t = useTranslations("notes")
  const locale = useLocale()
  const notes: Note[] = getPublishedPosts(locale)
    .map((post) => {
      const reading = getPostReadingStats(post.slug, locale)
      return {
        slug: post.slug,
        title: post.title,
        summary: post.description,
        tags: post.tags,
        date: post.date,
        ...readDate(post.date),
        minutes: reading.minutes,
        words: reading.words,
        featured: post.featured,
        opening: post.featured ? readOpening(post.slug, locale) : undefined,
      }
    })

    .sort((a, b) => Number(b.featured) - Number(a.featured))

  return (
    <article className="st-room st-notes">
      <header className="flex flex-col gap-4">
        <PageLabel
          icon={<NotePencilIcon aria-hidden size={13} weight="bold" />}
          label={t("label")}
          count={notes.length}
        />

        <Lede>
          {t.rich("lede", {
            b: (words) => <span className="text-[var(--fg-primary)]">{words}</span>,
          })}
        </Lede>
      </header>

      <NoteSlips notes={notes} />
    </article>
  )
}
