import * as runtime from "react/jsx-runtime"
import Image from "next/image"
import { InfoIcon } from "@phosphor-icons/react/dist/ssr"
import { slugify } from "@/lib/utils"

/** Derive a stable slug id from heading children so the outline/TOC can anchor to it. */
function headingId(children: React.ReactNode): string | undefined {
  const text = extractText(children)
  return text ? slugify(text) : undefined
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(extractText).join("")
  if (node && typeof node === "object" && "props" in node) {
    return extractText((node as { props: { children?: React.ReactNode } }).props.children)
  }
  return ""
}

function Callout({
  children,
  type = "info",
}: {
  children: React.ReactNode
  type?: "info" | "warning" | "danger"
}) {
  // Token-driven so it follows the active theme and reacts to light/dark.
  const styles = {
    info: { border: "var(--fg-brand)", bg: "var(--bg-surface-brand)", icon: "var(--fg-brand)" },
    warning: {
      border: "var(--status-warning)",
      bg: "var(--status-warning-soft)",
      icon: "var(--status-warning-fg)",
    },
    danger: {
      border: "var(--status-error)",
      bg: "var(--status-error-soft)",
      icon: "var(--status-error-fg)",
    },
  }[type]

  return (
    <div
      className="my-6 flex gap-3 rounded-r-lg border-l-4 p-4"
      style={{ borderLeftColor: styles.border, background: styles.bg }}
    >
      <InfoIcon
        size={16}
        className="mt-0.5 shrink-0"
        style={{ color: styles.icon }}
        aria-hidden="true"
      />
      <div className="text-sm leading-relaxed [&>p]:mb-0" style={{ color: "var(--fg-secondary)" }}>
        {children}
      </div>
    </div>
  )
}

function ImageCaption({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="my-8">
      <Image src={src} alt={alt} width={800} height={450} className="w-full rounded-lg" />
      {caption && (
        <figcaption className="text-text-muted mt-2 text-center text-sm italic">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

/** Intrinsic dimensions for local content images — lets next/image reserve space (no CLS). */
const IMG_DIMENSIONS: Record<string, { width: number; height: number }> = {
  "/blog/resend-ecomemerce.webp": { width: 1400, height: 810 },
  "/blog/resend-ecomemerce-draw.webp": { width: 1400, height: 2023 },
  "/blog/ui-refactor/before-1.png": { width: 3020, height: 1490 },
  "/blog/ui-refactor/before-2.png": { width: 3020, height: 1490 },
  "/blog/ui-refactor/before-3.png": { width: 3020, height: 1490 },
  "/blog/ui-refactor/before-4.png": { width: 3020, height: 1490 },
  "/blog/ui-refactor/lighthouse/before.png": { width: 2406, height: 1268 },
  "/blog/ui-refactor/lighthouse/after.png": { width: 2406, height: 1268 },
}

const defaultComponents = {
  Callout,
  ImageCaption,
  // Markdown `![alt](src)` → optimized, lazy, dimensioned next/image (no raw <img>).
  img: ({ src, alt }: React.ImgHTMLAttributes<HTMLImageElement>) => {
    if (typeof src !== "string") return null
    const { width, height } = IMG_DIMENSIONS[src] ?? { width: 1600, height: 900 }
    return (
      <Image
        src={src}
        alt={alt ?? ""}
        width={width}
        height={height}
        sizes="(max-width: 760px) 100vw, 760px"
        className="my-8 h-auto w-full rounded-lg border border-[var(--border-subtle)]"
      />
    )
  },
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      id={headingId(children)}
      className="mt-12 mb-4 scroll-mt-6 text-3xl"
      style={{
        fontFamily: "var(--font-serif)",
        fontWeight: 400,
        letterSpacing: "-0.02em",
        color: "var(--fg-primary)",
      }}
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      id={headingId(children)}
      className="text-heading-lg mt-12 mb-4 scroll-mt-6"
      style={{
        fontFamily: "var(--font-serif)",
        fontWeight: 400,
        lineHeight: 1.15,
        letterSpacing: "-0.02em",
        color: "var(--fg-primary)",
      }}
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      id={headingId(children)}
      className="mt-10 mb-3 scroll-mt-6 text-xl"
      style={{
        fontFamily: "var(--font-serif)",
        fontWeight: 500,
        color: "var(--fg-primary)",
      }}
      {...props}
    >
      {children}
    </h3>
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className="text-body-lg mb-4 leading-[1.7]"
      style={{
        fontFamily: "var(--font-sans)",
        color: "var(--fg-secondary)",
        overflowWrap: "break-word",
      }}
      {...props}
    />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong style={{ color: "var(--fg-primary)", fontWeight: 500 }} {...props} />
  ),
  em: (props: React.HTMLAttributes<HTMLElement>) => (
    <em
      style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--fg-brand)" }}
      {...props}
    />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="border-b border-[color:var(--border-strong)] text-[color:var(--fg-primary)] transition-colors hover:border-[color:var(--fg-brand)] hover:text-[color:var(--fg-brand)]"
      style={{ overflowWrap: "break-word" }}
      {...props}
    />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className="text-body-lg mb-4 ml-6 list-disc space-y-1.5 leading-[1.7]"
      style={{
        fontFamily: "var(--font-sans)",
        color: "var(--fg-secondary)",
        overflowWrap: "break-word",
      }}
      {...props}
    />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className="text-body-lg mb-4 ml-6 list-decimal space-y-1.5 leading-[1.7]"
      style={{
        fontFamily: "var(--font-sans)",
        color: "var(--fg-secondary)",
        overflowWrap: "break-word",
      }}
      {...props}
    />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="leading-[1.7]" style={{ overflowWrap: "break-word" }} {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="my-6 pl-4 italic"
      style={{ borderLeft: "3px solid var(--fg-brand)", color: "var(--fg-secondary)" }}
      {...props}
    />
  ),
  hr: () => (
    <div className="my-14 flex items-center gap-3" role="separator">
      <span
        className="h-px flex-1"
        style={{ background: "linear-gradient(to right, transparent, var(--border-strong))" }}
      />
      <span aria-hidden="true" style={{ color: "var(--fg-brand)", fontSize: 9, lineHeight: 1 }}>
        ◆
      </span>
      <span
        className="h-px flex-1"
        style={{ background: "linear-gradient(to left, transparent, var(--border-strong))" }}
      />
    </div>
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="my-6 overflow-x-auto rounded-lg border border-[var(--border-subtle)] bg-[#0d0d14] p-4 text-sm"
      {...props}
    />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => {
    if (!props.className) {
      return (
        <code
          className="text-mono-md rounded px-1.5 py-0.5 font-mono"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            color: "var(--fg-primary)",
          }}
          {...props}
        />
      )
    }
    return <code {...props} />
  },
}

type MDXComponents = Record<string, React.ComponentType<Record<string, unknown>>>

function getMDXComponent(
  code: string,
): (props: { components: MDXComponents }) => React.ReactElement {
  const fn = new Function(code)
  return (fn({ ...runtime }) as { default: (props: unknown) => React.ReactElement }).default
}

export function MDXContent({ code, components }: { code: string; components?: MDXComponents }) {
  const merged = { ...defaultComponents, ...components } as unknown as MDXComponents
  return getMDXComponent(code)({ components: merged })
}
