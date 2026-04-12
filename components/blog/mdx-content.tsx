import * as runtime from "react/jsx-runtime"
import Image from "next/image"
import { InfoIcon } from "@phosphor-icons/react/dist/ssr"
import { cn } from "@/lib/utils"

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
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="font-display text-text-primary mt-8 mb-4 text-3xl font-bold" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="font-display text-text-primary mt-10 mb-4 scroll-mt-20 text-2xl font-semibold"
      {...props}
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="font-display text-text-primary mt-8 mb-3 scroll-mt-20 text-xl font-semibold"
      {...props}
    />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-text-secondary mb-4 leading-7" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="text-indigo-400 underline underline-offset-4 transition-colors hover:text-indigo-300"
      {...props}
    />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="text-text-secondary mb-4 ml-6 list-disc space-y-1" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="text-text-secondary mb-4 ml-6 list-decimal space-y-1" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => <li className="leading-7" {...props} />,
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="text-text-secondary my-6 border-l-4 border-indigo-500 pl-4 italic"
      {...props}
    />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="border-border my-6 overflow-x-auto rounded-lg border bg-[#0d0d14] p-4 text-sm"
      {...props}
    />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => {
    if (!props.className) {
      return (
        <code
          className="bg-bg-elevated rounded px-1.5 py-0.5 font-mono text-[13px] text-indigo-300"
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
