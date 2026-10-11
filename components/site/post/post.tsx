import { useLocale, useTranslations } from "next-intl"
import { useShortDate } from "@/components/site/dates"
import { ArticleIcon } from "@phosphor-icons/react/dist/ssr"
import { tileClass } from "@/components/site/tile"
import { Badge } from "@/app/components/entrepta/badge"
import { MDXContent } from "@/components/blog/mdx-content"
import { getPostReadingStats, getPostToc, getPublishedPosts } from "@/lib/velite"
import { Tape } from "@/components/site/tape"
import { ScreenLink } from "@/components/site/screen-link"
import { readDate } from "@/components/site/notes/note"
import { PageHeader } from "@/components/site/page-header"
import "./post.css"

export function Post({ slug }: { slug: string }) {
  const t = useTranslations("notes")
  const shortDate = useShortDate()
  const locale = useLocale()
  const post = getPublishedPosts(locale).find((item) => item.slug === slug)
  if (!post) return null

  const reading = getPostReadingStats(post.slug, locale)
  const toc = getPostToc(post.slug, locale).filter((item) => item.level === 2)

  const head = (
    <header className="flex flex-col gap-4">
      <p className="text-mono-xs font-mono text-[var(--fg-muted)]">
        <time dateTime={post.date}>{shortDate(post.date)}</time> ·{" "}
        {t("minutes", { minutes: reading.minutes })} · {t("words", { words: reading.words })}
      </p>
      <h2 className="st-ps-title font-serif text-[var(--fg-primary)]">{post.title}</h2>
      <p className="text-body-lg max-w-[60ch] font-sans text-[var(--fg-secondary)]">
        {post.description}
      </p>
      <ul className="flex flex-wrap gap-1.5" aria-label={t("tags")}>
        {post.tags.map((tag) => (
          <li key={tag}>
            <Badge color="brand">{tag}</Badge>
          </li>
        ))}
      </ul>
    </header>
  )
  const list = (
    <ol className="st-ps-toc text-mono-sm font-mono">
      {toc.map((item) => (
        <li key={item.id}>
          <a href={`#${item.id}`} className="focus-ring">
            {item.label}
          </a>
        </li>
      ))}
    </ol>
  )
  const body = (
    <div className="st-ps-body">
      <MDXContent code={post.body} />
    </div>
  )

  return (
    <article className="st-room st-screen">
      <PageHeader
        icon={<ArticleIcon aria-hidden size={13} weight="bold" />}
        label={
          <>
            <ScreenLink
              to="notes"
              className="focus-ring underline decoration-[var(--border-strong)] decoration-dotted underline-offset-4 transition-colors hover:text-[var(--fg-brand-text)] hover:decoration-current"
            >
              {t("label")}
            </ScreenLink>{" "}
            / {t("aNote")}
          </>
        }
      />
      <div className="st-ps-columns">
        <div className={tileClass({ size: "xl" }, "st-ps-sheet")}>
          {head}
          {body}
        </div>
        <aside className="st-ps-slip">
          <Tape />
          <div className={tileClass({ size: "sm" }, "gap-3")}>
            <h3 className="text-mono-xs font-mono tracking-widest text-[var(--fg-muted)] uppercase">
              {t("inThisNote")}
            </h3>
            {list}
          </div>
        </aside>
      </div>
    </article>
  )
}
