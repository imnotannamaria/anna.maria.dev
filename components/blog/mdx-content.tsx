import * as runtime from "react/jsx-runtime"
import Image from "next/image"
import { InfoIcon } from "@phosphor-icons/react/dist/ssr"
import { cn, slugify } from "@/lib/utils"

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
  const styles = {
    info: "border-indigo-500 bg-indigo-950/60",
    warning: "border-yellow-500 bg-yellow-950/40",
    danger: "border-red-500 bg-red-950/40",
  }

  return (
    <div className={cn("my-6 flex gap-3 rounded-r-lg border-l-4 p-4", styles[type])}>
      <InfoIcon size={16} className="mt-0.5 shrink-0 text-indigo-400" aria-hidden="true" />
      <div className="text-text-secondary text-sm leading-relaxed [&>p]:mb-0">{children}</div>
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

const defaultComponents = {
  Callout,
  ImageCaption,
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
      className="mt-12 mb-4 scroll-mt-6 text-[28px]"
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
      className="mb-4 text-[16px] leading-[1.7]"
      style={{ fontFamily: "var(--font-sans)", color: "var(--fg-secondary)" }}
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
      {...props}
    />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className="mb-4 ml-6 list-disc space-y-1.5 text-[16px] leading-[1.7]"
      style={{ fontFamily: "var(--font-sans)", color: "var(--fg-secondary)" }}
      {...props}
    />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className="mb-4 ml-6 list-decimal space-y-1.5 text-[16px] leading-[1.7]"
      style={{ fontFamily: "var(--font-sans)", color: "var(--fg-secondary)" }}
      {...props}
    />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => <li className="leading-[1.7]" {...props} />,
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="my-6 pl-4 italic"
      style={{ borderLeft: "3px solid var(--fg-brand)", color: "var(--fg-secondary)" }}
      {...props}
    />
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
          className="rounded px-1.5 py-0.5 font-mono text-[13px]"
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
