import { NotePencilIcon } from "@phosphor-icons/react/dist/ssr"
import { Lede, PageLabel } from "@/components/site/page-header"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { getPostReadingStats, getPublishedPosts } from "@/lib/velite"
import { readDate, type Note } from "./note"
import { NoteSlips } from "./note-slips"
import "./notes.css"

function readOpening(slug: string): string | undefined {
  try {
    const raw = readFileSync(join(process.cwd(), "content", "blog", `${slug}.mdx`), "utf8")
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
  const notes: Note[] = getPublishedPosts()
    .map((post) => {
      const reading = getPostReadingStats(post.slug)
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
        opening: post.featured ? readOpening(post.slug) : undefined,
      }
    })

    .sort((a, b) => Number(b.featured) - Number(a.featured))

  return (
    <article className="st-room st-notes">
      <header className="flex flex-col gap-4">
        <PageLabel
          icon={<NotePencilIcon aria-hidden size={13} weight="bold" />}
          label="notes"
          count={notes.length}
        />

        <Lede>
          Notes on development, architecture, and the tools I reach for.{" "}
          <span className="text-[var(--fg-primary)]">Long-form thinking</span>, build logs, and the
          occasional <span className="text-[var(--fg-primary)]">opinion</span>.
        </Lede>
      </header>

      <NoteSlips notes={notes} />
    </article>
  )
}
