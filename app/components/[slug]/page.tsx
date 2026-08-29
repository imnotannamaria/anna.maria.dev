import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { getComponentDocBySlug, getComponentDocs, getComponentDocToc } from "@/lib/velite"
import { MDXContent } from "@/components/blog/mdx-content"
import { PageOutline } from "@/components/chrome/page-outline"
import { MetaCol, MetaGrid } from "@/components/chrome/page-parts"
import { DocSpecimen } from "@/components/showcase/doc-specimen"
import { SHOWCASE, type ShowcaseSlug } from "@/lib/showcase/registry"
import { sourceUrl } from "@/lib/showcase/source"
import { Badge } from "@/app/components/entrepta/badge"

type Props = { params: Promise<{ slug: string }> }

/**
 * Only the entries with an MDX doc. wristkit is skipped — it has real documentation on its own
 * site, and a page here whose content is "the real docs are over there" would be a thin page
 * competing with the real one for the same queries. That is the argument CLAUDE.md makes for
 * why there is no `/log/[slug]`.
 *
 * Listing them here is not what makes an unlisted slug 404, though — Next's default
 * `dynamicParams` is true, so it would render one on demand. The `notFound()` below is what
 * actually turns it away, which is also how `/blog/[slug]` handles it. That same lookup is what
 * makes `/components/entrepta` a 404: `app/components/entrepta/` has no `page.tsx`, so it is
 * not a route, falls through to this segment, and misses.
 */
export async function generateStaticParams() {
  return getComponentDocs().map((doc) => ({ slug: doc.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const doc = getComponentDocBySlug(slug)
  if (!doc) return {}

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://annamaria.app"

  return {
    title: doc.title,
    description: doc.description,
    openGraph: {
      title: doc.title,
      description: doc.description,
      type: "article",
      images: [`${baseUrl}/api/og?title=${encodeURIComponent(doc.title)}`],
    },
    twitter: { card: "summary_large_image", title: doc.title, description: doc.description },
  }
}

export default async function ComponentDocPage({ params }: Props) {
  const { slug } = await params
  const doc = getComponentDocBySlug(slug)
  if (!doc) notFound()

  const entry = SHOWCASE[doc.entry as ShowcaseSlug]
  const toc = getComponentDocToc(slug)

  return (
    <div className="mx-auto grid w-full max-w-[1160px] grid-cols-1 min-[1100px]:grid-cols-[200px_minmax(0,1fr)]">
      <PageOutline
        items={toc}
        file={`${slug}.mdx`}
        footer={
          <>
            <div className="flex justify-between">
              <span>{"// states"}</span>
              <span>{entry.states.length}</span>
            </div>
            <div>{"// mdx · utf-8"}</div>
          </>
        }
      />

      <div className="min-w-0">
        {/* Narrower gutter on a phone for the same reason as the index — see the note in
            `showcase-page.tsx`. Prose reads fine at 12px of margin; a specimen does not. */}
        <article className="mx-auto max-w-[760px] px-4 py-12 sm:px-8 lg:px-12">
          <nav
            aria-label="Breadcrumb"
            className="text-mono-sm mb-4 font-mono"
            style={{ color: "var(--fg-muted)" }}
          >
            <Link
              href="/components"
              className="transition-colors hover:text-[color:var(--fg-primary)]"
            >
              components
            </Link>
            <span aria-hidden> / </span>
            <span style={{ color: "var(--fg-secondary)" }}>{slug}</span>
          </nav>

          <h1
            className="text-display-md m-0"
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 400,
              letterSpacing: "-0.02em",
              color: "var(--fg-primary)",
            }}
          >
            {doc.title}
          </h1>

          <p
            className="text-body-lg mt-3 font-sans"
            style={{ color: "var(--fg-secondary)", maxWidth: "62ch" }}
          >
            {doc.description}
          </p>

          {/* The specimen leads. Someone who clicked in from the index came to compare states,
              so it is the headline rather than an illustration halfway down the prose — and it
              is the same split the index uses, so arriving here is not a change of language. */}
          <div className="mt-8">
            <DocSpecimen slug={entry.slug} name={entry.name} states={entry.states} />
          </div>

          <div className="mt-8">
            <MetaGrid>
              <MetaCol
                label="used on"
                value={
                  <div className="flex flex-wrap gap-1.5">
                    {entry.where.map((route) => (
                      <Link key={route} href={route}>
                        <Badge>{route}</Badge>
                      </Link>
                    ))}
                  </div>
                }
              />

              <MetaCol
                label="depends on"
                value={
                  doc.deps.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {doc.deps.map((dep) => (
                        <Badge key={dep}>{dep}</Badge>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: "var(--fg-muted)" }}>{"// nothing but React"}</span>
                  )
                }
              />

              <MetaCol
                span
                label="source"
                value={
                  <a
                    href={sourceUrl(doc.source)}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all transition-colors"
                    style={{ color: "var(--fg-brand)" }}
                  >
                    {doc.source}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                }
              />
            </MetaGrid>
          </div>

          <div className="mt-10">
            <MDXContent code={doc.body} />
          </div>
        </article>
      </div>
    </div>
  )
}
